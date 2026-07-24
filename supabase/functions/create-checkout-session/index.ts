import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Création de la session de paiement (Stripe Connect, charges séparées).
 *
 * Le client paie 100 % sur le compte Savvy. La part du Conseiller lui est
 * transférée plus tard par release-payouts, une fois la session tenue et le
 * délai de réclamation écoulé — voir le commentaire de l'étape 4.
 *
 * Le chiffre d'affaires de Savvy reste sa commission : les 80 % encaissés
 * pour le Conseiller sont une dette envers lui, pas un produit.
 *
 * Le montant est lu en base, jamais reçu du navigateur : celui qui paie est la
 * dernière personne à qui demander le prix.
 */

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://www.getsavvy.fr";

// Doit rester aligné sur EXPERT_SHARE dans src/constants/config.js
const EXPERT_SHARE = 0.8;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { bookingId } = await req.json();
    if (!bookingId) return json({ error: "bookingId manquant" }, 400);

    // ── 1. Le payeur doit être connecté ──
    const authHeader = req.headers.get("Authorization") || "";
    const asUser = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await asUser.auth.getUser();
    if (!user) return json({ error: "Non autorisé" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // ── 2. Prix et parties lus en base ──
    const { data: booking } = await admin
      .from("bookings")
      .select("id, client_id, expert_id, phase_name, phase_price, status, paid, date_session, pay_deadline")
      .eq("id", bookingId)
      .single();

    if (!booking) return json({ error: "Réservation introuvable" }, 404);
    if (booking.client_id !== user.id) return json({ error: "Non autorisé" }, 403);
    if (booking.paid) return json({ error: "Cette réservation est déjà payée" }, 400);
    if (booking.status !== "confirmed") {
      return json({ error: "Le conseiller doit d'abord accepter la demande" }, 400);
    }

    // Fenêtre de paiement — même règle que la migration 011 : au plus tard 2 h
    // avant la session. Sans ce contrôle, un client pouvait régler un créneau
    // dont l'heure était déjà passée : l'argent partait, la session n'existait
    // plus. L'interface le masque déjà ; ici on le refuse pour de bon.
    const now = Date.now();
    const start = booking.date_session ? new Date(booking.date_session).getTime() : null;
    const tooLate = start !== null && now > start - 120 * 60000;
    const pastDeadline = booking.pay_deadline && now > new Date(booking.pay_deadline).getTime();
    if (tooLate || pastDeadline) {
      return json({
        code: "slot_expired",
        error: "Le règlement se fait au plus tard 2 h avant la session. Ce créneau a expiré.",
      }, 400);
    }

    const price = Number(booking.phase_price);
    if (!Number.isFinite(price) || price <= 0) return json({ error: "Montant invalide" }, 400);

    const totalCents = Math.round(price * 100);
    const expertCents = Math.round(totalCents * EXPERT_SHARE);
    // La commission Savvy n'est plus un `application_fee` : elle est ce qui
    // reste sur le compte Savvy après le transfert différé au Conseiller.

    // ── 3. Le Conseiller doit pouvoir encaisser ──
    const { data: expert } = await admin
      .from("experts")
      .select("id, name, stripe_account_id, stripe_charges_enabled")
      .eq("id", booking.expert_id)
      .single();

    if (!expert) return json({ error: "Conseiller introuvable" }, 404);
    if (!expert.stripe_account_id || !expert.stripe_charges_enabled) {
      return json({
        error: "Le conseiller n'a pas encore finalisé sa configuration de paiement",
        code: "expert_not_onboarded",
      }, 409);
    }

    // ── 4. Encaissement, sans reversement immédiat ──
    //
    // On n'utilise PAS `transfer_data[destination]` : avec ce paramètre, la
    // part du Conseiller part sur son compte à la seconde du paiement, avant
    // même que la session ait lieu. Si le Conseiller ne se présente pas, il
    // faut aller rechercher l'argent chez lui — et si Stripe le lui a déjà
    // viré, on ne peut plus.
    //
    // Le paiement est donc encaissé sur le compte Savvy, puis transféré au
    // Conseiller par release-payouts une fois la session tenue et le délai de
    // réclamation écoulé. C'est le schéma « separate charges and transfers »
    // de Stripe, celui d'Airbnb : le client paie à la réservation, l'hôte est
    // payé après le séjour. On reste sous la licence de Stripe — ce n'est pas
    // de l'encaissement pour compte de tiers au sens de la DSP2.
    const params = new URLSearchParams({
      "payment_method_types[]": "card",
      "line_items[0][price_data][currency]": "eur",
      "line_items[0][price_data][unit_amount]": String(totalCents),
      "line_items[0][price_data][product_data][name]": booking.phase_name || "Session Savvy",
      "line_items[0][price_data][product_data][description]": `Session avec ${expert.name} sur Savvy`,
      "line_items[0][quantity]": "1",
      "mode": "payment",
      "success_url": `${SITE_URL}?payment=success&booking=${booking.id}`,
      "cancel_url": `${SITE_URL}?payment=cancel`,
      "metadata[booking_id]": booking.id,
      // Le transfert cible ce compte, mais plus tard (voir release-payouts).
      "payment_intent_data[metadata][booking_id]": booking.id,
      "payment_intent_data[metadata][expert_account]": expert.stripe_account_id,
      "payment_intent_data[metadata][expert_amount]": String(expertCents),
      // Le groupe permet à Stripe de rattacher le transfert différé au paiement.
      "payment_intent_data[transfer_group]": `booking_${booking.id}`,
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const session = await res.json();
    if (!res.ok) return json({ error: session.error?.message || "Erreur Stripe" }, 400);

    // Fige la part du Conseiller telle qu'envoyée à Stripe (rapprochement en cas de litige).
    await admin.from("bookings").update({ expert_amount: expertCents }).eq("id", booking.id);

    return json({ url: session.url });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
