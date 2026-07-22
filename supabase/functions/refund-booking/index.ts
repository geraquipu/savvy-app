import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "geraquipu@hotmail.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // ── 1. Vérifier que l'appelant est bien l'admin ──
    const authHeader = req.headers.get("Authorization") || "";
    const asUser = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await asUser.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) return json({ error: "Non autorisé" }, 403);

    const { bookingId } = await req.json();
    if (!bookingId) return json({ error: "bookingId manquant" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: booking } = await admin
      .from("bookings")
      .select("id, stripe_session_id, paid, refund_status, payout_status, stripe_transfer_id")
      .eq("id", bookingId).single();

    if (!booking) return json({ error: "Réservation introuvable" }, 404);
    if (!booking.paid) return json({ error: "Cette réservation n'a pas été payée" }, 400);
    if (booking.refund_status === "done") return json({ ok: true, already: true });
    if (!booking.stripe_session_id) return json({ error: "Aucune session Stripe liée" }, 400);

    // ── 2. Récupérer le payment_intent de la session Stripe ──
    const sRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${booking.stripe_session_id}`,
      { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } },
    );
    const session = await sRes.json();
    const paymentIntent = session.payment_intent;
    if (!paymentIntent) return json({ error: "Paiement Stripe introuvable" }, 400);

    // ── 3. Reprendre la part du Conseiller si elle est déjà partie ──
    //
    // Cas courant : le reversement n'a pas encore eu lieu (payout_status =
    // pending), l'argent est sur le compte Savvy, il n'y a rien à récupérer.
    // C'est justement pourquoi on diffère le transfert.
    //
    // Cas rare : la session avait été validée puis contestée après coup. Il
    // faut alors annuler le transfert avant de rembourser, sinon Savvy rend
    // 100 % alors que 80 % sont chez le Conseiller.
    if (booking.payout_status === "done" && booking.stripe_transfer_id) {
      const revRes = await fetch(
        `https://api.stripe.com/v1/transfers/${booking.stripe_transfer_id}/reversals`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Idempotency-Key": `reversal_${bookingId}`,
          },
        },
      );
      const reversal = await revRes.json();
      if (reversal.error) {
        // Souvent : le Conseiller a déjà retiré les fonds, son solde est à zéro.
        return json({
          error: `Impossible de récupérer la part du conseiller : ${reversal.error.message}. `
               + `Le remboursement n'a pas été effectué.`,
        }, 400);
      }
    }

    // ── 4. Rembourser le client ──
    const rRes = await fetch("https://api.stripe.com/v1/refunds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `refund_${bookingId}`,
      },
      body: new URLSearchParams({ payment_intent: paymentIntent }),
    });
    const refund = await rRes.json();
    if (refund.error) return json({ error: refund.error.message || "Échec du remboursement" }, 400);

    // ── 5. Marquer comme remboursé, et ne plus jamais reverser ──
    await admin.from("bookings").update({
      refund_status: "done",
      payout_status: "skipped",
    }).eq("id", bookingId);

    return json({ ok: true, refundId: refund.id });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
