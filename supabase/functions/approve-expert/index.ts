import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Validation d'un conseiller (badge « vérifié » + mise en ligne).
 *
 * La politique RLS de `experts` autorise un conseiller à modifier SA PROPRE
 * ligne (auth.uid() = user_id). Elle protège la ligne, pas les colonnes : rien
 * n'empêchait un conseiller d'écrire `verified = true` sur lui-même via l'API
 * REST et d'afficher le badge de confiance sans passer par nous.
 *
 * `verified` et `active` ne sont donc plus écrivables par `authenticated`
 * (migration 006). Seule cette fonction les modifie, après avoir vérifié que
 * l'appelant est bien l'administrateur.
 */

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
    const authHeader = req.headers.get("Authorization") || "";
    const asUser = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await asUser.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) return json({ error: "Non autorisé" }, 403);

    const { expertId, approve = true } = await req.json();
    if (!expertId) return json({ error: "expertId manquant" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data, error } = await admin
      .from("experts")
      .update({ active: !!approve, verified: !!approve })
      .eq("id", expertId)
      .select("id, name, user_id")
      .single();

    if (error) return json({ error: error.message }, 400);

    // La notification part d'ici, avec la clé de service : notify-expert-approved
    // n'est plus joignable depuis l'extérieur, donc on ne peut pas annoncer une
    // validation qui n'a pas eu lieu.
    if (approve && data?.user_id) {
      await fetch(`${SUPABASE_URL}/functions/v1/notify-expert-approved`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({ expertUserId: data.user_id, expertName: data.name || "Expert" }),
      }).catch(() => {});
    }

    return json({ ok: true, expert: data });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
