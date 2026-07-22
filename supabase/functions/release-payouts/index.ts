import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Reversement différé aux Conseillers.
 *
 * Le paiement du client est encaissé sur le compte Savvy. Ce job transfère sa
 * part au Conseiller une fois que :
 *   · la session a eu lieu (heure de fin dépassée),
 *   · le délai de réclamation est écoulé,
 *   · aucun remboursement n'a été demandé.
 *
 * Tant que ces conditions ne sont pas réunies, l'argent reste chez Savvy et
 * un remboursement est un simple `refund` — sans avoir à récupérer des fonds
 * déjà partis chez le Conseiller, opération qui échoue s'il les a retirés.
 *
 * Appel interne uniquement (cron). Idempotent : une réservation déjà
 * transférée est ignorée, et la clé d'idempotence Stripe empêche le double
 * versement si le job tourne deux fois en même temps.
 */

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

/** Doit rester aligné sur CLAIM_WINDOW_HOURS et SESSION_DONE_AFTER_MIN. */
const SESSION_DONE_AFTER_MIN = 90;
const CLAIM_WINDOW_HOURS = 48;
const EXPERT_SHARE = 0.8;

const isInternal = (req: Request) =>
  (req.headers.get("Authorization") || "") === `Bearer ${SERVICE_KEY}`;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json" } });

serve(async (req) => {
  if (!isInternal(req)) return new Response("Non autorisé", { status: 403 });

  // Seuil : une session doit être finie depuis plus que le délai de réclamation.
  const cutoff = new Date(
    Date.now() - (CLAIM_WINDOW_HOURS * 60 + SESSION_DONE_AFTER_MIN) * 60000,
  ).toISOString();

  const { data: due, error } = await supabase
    .from("bookings")
    .select("id, expert_id, phase_price, expert_amount, stripe_session_id, refund_status, date_session")
    .eq("paid", true)
    .eq("payout_status", "pending")
    .eq("status", "confirmed")
    .lt("date_session", cutoff)
    .limit(50);

  if (error) return json({ error: error.message }, 500);
  if (!due?.length) return json({ released: 0 });

  const results: Array<Record<string, unknown>> = [];

  for (const b of due) {
    // Une réclamation en cours gèle le reversement : c'est tout l'intérêt.
    if (b.refund_status === "requested" || b.refund_status === "done") {
      await supabase.from("bookings").update({ payout_status: "skipped" }).eq("id", b.id);
      results.push({ id: b.id, skipped: "remboursement" });
      continue;
    }

    const { data: expert } = await supabase
      .from("experts").select("stripe_account_id").eq("id", b.expert_id).single();
    if (!expert?.stripe_account_id) {
      results.push({ id: b.id, error: "conseiller sans compte Stripe" });
      continue;
    }

    // Montant figé au paiement ; recalculé seulement s'il manque.
    const amount = b.expert_amount ?? Math.round((Number(b.phase_price) || 0) * 100 * EXPERT_SHARE);
    if (!amount || amount <= 0) {
      results.push({ id: b.id, error: "montant invalide" });
      continue;
    }

    const res = await fetch("https://api.stripe.com/v1/transfers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        // Rejouer le job ne verse pas deux fois.
        "Idempotency-Key": `payout_${b.id}`,
      },
      body: new URLSearchParams({
        amount: String(amount),
        currency: "eur",
        destination: expert.stripe_account_id,
        transfer_group: `booking_${b.id}`,
        "metadata[booking_id]": b.id,
      }).toString(),
    });
    const transfer = await res.json();

    if (transfer.error) {
      // On laisse en `pending` : le prochain passage réessaiera.
      console.error("[release-payouts]", b.id, transfer.error.message);
      results.push({ id: b.id, error: transfer.error.message });
      continue;
    }

    await supabase.from("bookings").update({
      payout_status: "done",
      payout_at: new Date().toISOString(),
      stripe_transfer_id: transfer.id,
    }).eq("id", b.id);

    results.push({ id: b.id, transfer: transfer.id, amount });
  }

  return json({ released: results.filter(r => r.transfer).length, results });
});
