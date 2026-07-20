import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/** Tolérance de rejeu : au-delà, on refuse (recommandation Stripe). */
const TOLERANCE_SECONDS = 300;

const json = (b: unknown) =>
  new Response(JSON.stringify(b), { headers: { "Content-Type": "application/json" } });

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing stripe-signature", { status: 400 });

  const body = await req.text();
  if (!(await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET))) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  // ── Paiement encaissé ──
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;

    // « completed » ne veut pas dire « payé » : avec un moyen de paiement
    // asynchrone, la session se termine alors que le paiement est encore en
    // attente. On n'écrit `paid` que lorsque Stripe le confirme.
    if (session.payment_status !== "paid") {
      return json({ received: true, ignored: `payment_status=${session.payment_status}` });
    }

    if (bookingId) {
      const { error } = await supabase
        .from("bookings")
        .update({ paid: true, stripe_session_id: session.id })
        .eq("id", bookingId);
      if (error) {
        console.error("[webhook] update booking:", error.message);
        return new Response("DB error", { status: 500 });
      }
    }
  }

  // ── Remboursement effectué depuis le tableau de bord Stripe ──
  // Sans ça, un remboursement fait hors de l'app laisse la réservation marquée
  // « payée » et le conseiller continue de voir un revenu qui n'existe plus.
  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    const bookingId = charge.metadata?.booking_id;
    if (bookingId) {
      await supabase.from("bookings")
        .update({ refund_status: "done", paid: false })
        .eq("id", bookingId);
    }
  }

  // ── État d'un compte conseiller (Connect) ──
  // Si Stripe suspend un conseiller (vérification expirée, document manquant),
  // l'app continuerait d'accepter des paiements à destination d'un compte qui
  // ne peut plus les recevoir. On garde le statut à jour.
  if (event.type === "account.updated") {
    const account = event.data.object;
    if (account.id) {
      await supabase.from("experts")
        .update({
          stripe_charges_enabled: !!account.charges_enabled,
          stripe_payouts_enabled: !!account.payouts_enabled,
        })
        .eq("stripe_account_id", account.id);
    }
  }

  return json({ received: true });
});

/** Comparaison à temps constant : `a === b` sort au premier octet différent. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
): Promise<boolean> {
  try {
    const parts = Object.fromEntries(header.split(",").map(p => p.split("=")));
    const timestamp = parts["t"];
    const sig = parts["v1"];
    if (!timestamp || !sig) return false;

    // Rejeu : une requête valide capturée ne doit pas rester rejouable indéfiniment.
    const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
    if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return false;

    const signed = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
    const expected = Array.from(new Uint8Array(mac))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return safeEqual(expected, sig);
  } catch {
    return false;
  }
}
