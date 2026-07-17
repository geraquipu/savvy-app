import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Onboarding Stripe Connect d'un Conseiller.
 *
 * Crée (ou retrouve) son compte Express et renvoie un lien d'inscription hébergé
 * par Stripe. C'est Stripe qui collecte l'identité, l'IBAN et fait le KYC — Savvy
 * ne voit ni ne stocke aucune coordonnée bancaire.
 *
 * Appelée aussi sans lien (`refresh: true`) pour rafraîchir le statut du compte.
 */

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://www.getsavvy.fr";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const stripe = async (path: string, body?: Record<string, string>, method = "POST") => {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  return await res.json();
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // ── Le Conseiller doit être connecté : on n'agit que sur son propre profil ──
    const authHeader = req.headers.get("Authorization") || "";
    const asUser = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await asUser.auth.getUser();
    if (!user) return json({ error: "Non autorisé" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: expert } = await admin
      .from("experts")
      .select("id, name, stripe_account_id")
      .eq("user_id", user.id)
      .single();

    if (!expert) return json({ error: "Profil conseiller introuvable" }, 404);

    let accountId = expert.stripe_account_id;

    // ── 1. Créer le compte Express au premier passage ──
    if (!accountId) {
      const account = await stripe("accounts", {
        type: "express",
        country: "FR",
        email: user.email || "",
        "capabilities[transfers][requested]": "true",
        "business_type": "individual",
        "business_profile[product_description]": "Sessions de conseil sur Savvy",
        "metadata[expert_id]": expert.id,
      });
      if (account.error) return json({ error: account.error.message }, 400);
      accountId = account.id;
      await admin.from("experts").update({ stripe_account_id: accountId }).eq("id", expert.id);
    }

    // ── 2. Relire l'état réel chez Stripe (source de vérité) ──
    const account = await stripe(`accounts/${accountId}`, undefined, "GET");
    if (account.error) return json({ error: account.error.message }, 400);

    await admin.from("experts").update({
      stripe_charges_enabled: !!account.charges_enabled,
      stripe_payouts_enabled: !!account.payouts_enabled,
    }).eq("id", expert.id);

    const ready = !!account.charges_enabled;

    // Simple rafraîchissement de statut (retour d'onboarding) : pas de nouveau lien.
    const { refresh } = await req.json().catch(() => ({ refresh: false }));
    if (refresh || ready) {
      return json({ ok: true, ready, chargesEnabled: !!account.charges_enabled, payoutsEnabled: !!account.payouts_enabled });
    }

    // ── 3. Lien d'onboarding hébergé par Stripe ──
    const link = await stripe("account_links", {
      account: accountId,
      refresh_url: `${SITE_URL}?connect=refresh`,
      return_url: `${SITE_URL}?connect=done`,
      type: "account_onboarding",
    });
    if (link.error) return json({ error: link.error.message }, 400);

    return json({ ok: true, ready: false, url: link.url });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
