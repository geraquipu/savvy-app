import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sendEmail = async (to: string, subject: string, html: string) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Savvy <notifications@getsavvy.fr>",
      to,
      subject,
      html,
    }),
  });
  return res.ok;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const { record, type } = await req.json();

  if (!record) return new Response("no record", { status: 400, headers: cors });

  const booking = record;
  const expertId = booking.expert_id; // experts.id (PK), not the expert's auth user id
  const clientId = booking.client_id;
  const status = booking.status;
  const date = booking.date_session ? new Date(booking.date_session).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", timeZone:"Europe/Paris" }) : "À confirmer";
  const time = booking.date_session ? new Date(booking.date_session).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit", timeZone:"Europe/Paris" }) : "";
  const phase = booking.phase_name || "Session";
  const price = booking.phase_price || 0;

  // Resolve the expert's auth user id and meet_link from experts.id
  const { data: expertRow } = await supabase.from("experts").select("user_id, meet_link").eq("id", expertId).single();
  const expertUserId = expertRow?.user_id;
  const expertMeetLink = expertRow?.meet_link || null;

  // Get expert email
  const { data: expertProfile } = expertUserId ? await supabase.auth.admin.getUserById(expertUserId) : { data: null };
  const expertEmail = expertProfile?.user?.email;

  // Get client email
  const { data: clientProfile } = await supabase.auth.admin.getUserById(clientId);
  const clientEmail = clientProfile?.user?.email;

  // Get names from profiles
  const { data: expProf } = expertUserId ? await supabase.from("profiles").select("name").eq("id", expertUserId).single() : { data: null };
  const { data: cliProf } = await supabase.from("profiles").select("name").eq("id", clientId).single();
  const expertName = expProf?.name || "Expert";
  const clientName = cliProf?.name || "Client";

  // ── Nouvelle réservation → notifier l'expert (email + push) ──
  if (type === "INSERT" && status === "pending") {
    if (expertUserId) {
      await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}` },
        body: JSON.stringify({ userId: expertUserId, title: "📅 Nouvelle réservation", body: `${clientName} · ${phase} · ${price}€`, url: "/" }),
      }).catch(() => {});
    }
    if (expertEmail) await sendEmail(
      expertEmail,
      `📅 Nouvelle réservation — ${phase}`,
      `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1C1917">Nouvelle réservation sur Savvy</h2>
        <p style="color:#57534E">Bonjour ${expertName},</p>
        <p style="color:#57534E"><strong>${clientName}</strong> vient de réserver une session avec vous.</p>
        <div style="background:#FDF8F0;border:1px solid #E8DDD0;border-radius:12px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px;color:#1C1917"><strong>📋 ${phase}</strong></p>
          <p style="margin:0 0 4px;color:#57534E">📅 ${date} ${time ? "à " + time : ""}</p>
          <p style="margin:0;color:#57534E">💶 ${price}€</p>
        </div>
        ${booking.notes ? `<div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:12px;padding:14px 16px;margin:16px 0"><p style="margin:0 0 4px;color:#6D28D9;font-weight:700;font-size:13px">💬 Message de ${clientName}</p><p style="margin:0;color:#57534E;font-style:italic">${String(booking.notes).replace(/</g,"&lt;")}</p></div>` : ""}
        <p style="color:#57534E">Connectez-vous à Savvy pour <strong>confirmer ou décliner</strong> cette réservation.</p>
        <a href="https://getsavvy.fr" style="display:inline-block;background:#1C1917;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px">Voir la réservation →</a>
        <p style="color:#A8A29E;font-size:12px;margin-top:24px">Savvy · Tu gardes 80% de chaque session</p>
      </div>
      `
    );
  }

  // ── Confirmée → push au client en plus de l'email ──
  if (type === "UPDATE" && status === "confirmed") {
    await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}` },
      body: JSON.stringify({ userId: clientId, title: "✅ Session confirmée !", body: `${expertName} a accepté votre demande · ${phase}`, url: "/" }),
    }).catch(() => {});
  }

  // ── Confirmée → notifier le client ──
  if (type === "UPDATE" && status === "confirmed" && clientEmail) {
    const bookingId = record.id || "";
    const roomId = bookingId.replace(/-/g,"").slice(0,16);
    const meetUrl = expertMeetLink || `https://meet.jit.si/savvy-${roomId}`;
    await sendEmail(
      clientEmail,
      `✅ Session confirmée — ${phase}`,
      `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1C1917">Votre session est confirmée !</h2>
        <p style="color:#57534E">Bonjour ${clientName},</p>
        <p style="color:#57534E"><strong>${expertName}</strong> a confirmé votre session.</p>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px;color:#1C1917"><strong>📋 ${phase}</strong></p>
          <p style="margin:0 0 4px;color:#57534E">📅 ${date} ${time ? "à " + time : ""}</p>
          <p style="margin:0;color:#57534E">💶 ${price}€</p>
        </div>
        <p style="color:#57534E">Préparez vos questions et rejoignez la session à l'heure prévue.</p>
        <div style="background:#ECFDF5;border:1px solid #6EE7B7;border-radius:12px;padding:16px;margin:20px 0">
          <p style="margin:0 0 6px;color:#065F46;font-weight:700">🎥 Lien de la session vidéo</p>
          <a href="${meetUrl}" style="color:#059669;word-break:break-all;font-size:13px">${meetUrl}</a>
        </div>
        <a href="https://getsavvy.fr" style="display:inline-block;background:#1C1917;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px">Voir ma session →</a>
        <p style="color:#A8A29E;font-size:12px;margin-top:24px">Savvy · L'expertise humaine, accessible à tous</p>
      </div>
      `
    );
  }

  // ── Annulée → notifier le client (email + push) ──
  if (type === "UPDATE" && status === "cancelled") {
    const byExpert = booking.cancelled_by !== "client";
    const reason = booking.cancel_reason || null;
    // Push au client seulement si c'est l'expert qui a annulé
    if (byExpert) {
      await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}` },
        body: JSON.stringify({ userId: clientId, title: "Session annulée", body: `${expertName} a annulé votre session · ${phase}`, url: "/" }),
      }).catch(() => {});
    }
    if (byExpert && clientEmail) await sendEmail(
      clientEmail,
      `Session annulée — ${phase}`,
      `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1C1917">Session annulée</h2>
        <p style="color:#57534E">Bonjour ${clientName},</p>
        <p style="color:#57534E">Malheureusement, <strong>${expertName}</strong> a dû annuler votre session ${phase} du ${date}${time ? " à " + time : ""}.</p>
        ${reason ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:14px 16px;margin:16px 0"><p style="margin:0;color:#991B1B;font-size:14px"><strong>Motif :</strong> ${reason.replace(/</g,"&lt;")}</p></div>` : ""}
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:14px 16px;margin:16px 0"><p style="margin:0;color:#166534;font-size:14px">Si vous aviez déjà payé, vous êtes remboursé intégralement sous 5 à 10 jours ouvrés.</p></div>
        <p style="color:#57534E">Vous pouvez réserver une nouvelle session ou choisir un autre expert sur Savvy.</p>
        <a href="https://getsavvy.fr" style="display:inline-block;background:#1C1917;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px">Trouver un expert →</a>
        <p style="color:#A8A29E;font-size:12px;margin-top:24px">Savvy · L'expertise humaine, accessible à tous</p>
      </div>
      `
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
