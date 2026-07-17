import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Création de la session de paiement (Stripe Connect, destination charge).
 *
 * Le client paie 100 %. Stripe verse directement la part du Conseiller sur son
 * compte Express et laisse la commission Savvy en application fee. La part du
 * Conseiller ne transite jamais par le compte de Savvy — c'est ce qui fait que
 * le chiffre d'affaires de Savvy est égal à sa commission, et non au total.
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
      .select("id, client_id, expert_id, phase_name, phase_price, status, paid")
      .eq("id", bookingId)
      .single();

    if (!booking) return json({ error: "Réservation introuvable" }, 404);
    if (booking.client_id !== user.id) return json({ error: "Non autorisé" }, 403);
    if (booking.paid) return json({ error: "Cette réservation est déjà payée" }, 400);
    if (booking.status !== "confirmed") {
      return json({ error: "Le conseiller doit d'abord accepter la demande" }, 400);
    }

    const price = Number(booking.phase_price);
    if (!Number.isFinite(price) || price <= 0) return json({ error: "Montant invalide" }, 400);

    const totalCents = Math.round(price * 100);
    const expertCents = Math.round(totalCents * EXPERT_SHARE);
    const feeCents = totalCents - expertCents;

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

    // ── 4. Destination charge ──
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
      "payment_intent_data[application_fee_amount]": String(feeCents),
      "payment_intent_data[transfer_data][destination]": expert.stripe_account_id,
      "payment_intent_data[metadata][booking_id]": booking.id,
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
