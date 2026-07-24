// Jeton d'accès à la salle de visio (JaaS — Jitsi as a Service, 8x8).
//
// L'instance publique meet.jit.si exige qu'un participant se connecte avec un
// compte Google ou GitHub pour créer la salle. Concrètement : le premier
// arrivé — souvent le client, qui vient de payer — tombait sur « la conférence
// n'a pas encore commencé car aucun modérateur n'est arrivé » et attendait
// sans comprendre.
//
// Avec JaaS, c'est Savvy qui signe un jeton : personne ne se connecte nulle
// part, le conseiller entre en modérateur et le client entre directement.
//
// Le jeton n'est délivré qu'aux deux personnes concernées, pour une session
// payée, et seulement dans la fenêtre d'accès. Il expire avec la session :
// même partagé, il ne rouvre pas la salle le lendemain.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const JOIN_OPEN_BEFORE_MIN = 15;
const JOIN_CLOSE_AFTER_MIN = 75;

const b64url = (data: Uint8Array | string) => {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/** Importe la clé privée RSA fournie par 8x8 (PEM PKCS#8). */
async function importKey(pem: string) {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    der.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function signJwt(payload: Record<string, unknown>, kid: string, pem: string) {
  const header = { alg: "RS256", typ: "JWT", kid };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const key = await importKey(pem);
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${b64url(new Uint8Array(sig))}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { bookingId } = await req.json();
    if (!bookingId) return json({ error: "bookingId requis" }, 400);

    // ── Identité de l'appelant ──
    const authHeader = req.headers.get("Authorization") || "";
    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await anon.auth.getUser();
    if (!user) return json({ error: "Non authentifié" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: booking } = await admin
      .from("bookings")
      .select("id, client_id, expert_id, status, paid, date_session")
      .eq("id", bookingId)
      .single();
    if (!booking) return json({ error: "Réservation introuvable" }, 404);

    const { data: expert } = await admin
      .from("experts")
      .select("id, user_id, name")
      .eq("id", booking.expert_id)
      .single();

    const isClient = booking.client_id === user.id;
    const isExpert = expert?.user_id === user.id;
    // La salle appartient à ces deux personnes. Sans ce contrôle, n'importe
    // quel compte connecté pouvait demander un jeton pour n'importe quelle
    // session et entrer dans une conversation privée.
    if (!isClient && !isExpert) return json({ error: "Non autorisé" }, 403);

    if (!booking.paid) return json({ code: "unpaid", error: "Session non réglée" }, 403);
    if (booking.status !== "confirmed") {
      return json({ code: "not_confirmed", error: "Session non confirmée" }, 403);
    }

    // ── Fenêtre d'accès ──
    const now = Date.now();
    const start = booking.date_session ? new Date(booking.date_session).getTime() : null;
    if (start !== null) {
      const openAt = start - JOIN_OPEN_BEFORE_MIN * 60000;
      const closeAt = start + JOIN_CLOSE_AFTER_MIN * 60000;
      if (now < openAt) return json({ code: "too_early", error: "La salle n'est pas encore ouverte", openAt }, 403);
      if (now > closeAt) return json({ code: "too_late", error: "Cette session est terminée" }, 403);
    }

    // ── Configuration JaaS ──
    // Tant que les secrets ne sont pas posés, on renvoie l'ancienne salle
    // publique : la visio continue de fonctionner comme avant au lieu de
    // tomber en panne le jour du basculement.
    const appId = Deno.env.get("JAAS_APP_ID");
    const kid = Deno.env.get("JAAS_KID");
    const pem = Deno.env.get("JAAS_PRIVATE_KEY");
    const roomId = String(booking.id).replace(/-/g, "").slice(0, 16);

    if (!appId || !kid || !pem) {
      return json({ url: `https://meet.jit.si/savvy-${roomId}`, provider: "public" });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("name, photo_url")
      .eq("id", user.id)
      .single();

    const room = `savvy-${roomId}`;
    // Le jeton meurt avec la session : partagé après coup, il n'ouvre rien.
    const exp = Math.floor((start ? start + JOIN_CLOSE_AFTER_MIN * 60000 : now + 3600000) / 1000);

    const token = await signJwt({
      aud: "jitsi",
      iss: "chat",
      sub: appId,
      room,
      nbf: Math.floor(now / 1000) - 10,
      exp,
      context: {
        user: {
          id: user.id,
          name: profile?.name || (isExpert ? expert?.name : "Client") || "Participant",
          avatar: profile?.photo_url || "",
          email: user.email || "",
          // Le conseiller ouvre la salle. Sans modérateur, tout le monde
          // attend — c'est exactement le blocage qu'on corrige.
          moderator: isExpert ? "true" : "false",
        },
        features: { livestreaming: false, recording: false, transcription: false, "outbound-call": false },
      },
    }, kid, pem);

    return json({
      url: `https://8x8.vc/${appId}/${room}?jwt=${token}`,
      provider: "jaas",
      moderator: isExpert,
    });
  } catch (e) {
    console.error("[meeting-token]", e);
    return json({ error: e?.message || "Erreur interne" }, 500);
  }
});
