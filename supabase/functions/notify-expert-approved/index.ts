import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Appel interne uniquement (depuis approve-expert).
 *
 * Joignable avec la clé anon — publique — n'importe qui pouvait annoncer à un
 * inscrit que sa candidature était validée alors qu'elle ne l'était pas.
 */
const isInternal = (req: Request) =>
  (req.headers.get("Authorization") || "") === `Bearer ${SUPABASE_SERVICE_KEY}`;

serve(async (req) => {
  if (!isInternal(req)) return new Response("Non autorisé", { status: 403 });
  const { expertUserId, expertName } = await req.json();
  if (!expertUserId) return new Response("missing expertUserId", { status: 400 });

  const { data: userObj } = await supabase.auth.admin.getUserById(expertUserId);
  const expertEmail = userObj?.user?.email;
  if (!expertEmail) return new Response("expert email not found", { status: 404 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Savvy <notifications@getsavvy.fr>",
      to: expertEmail,
      subject: "🎉 Ton profil Savvy est approuvé !",
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1C1917">Félicitations ${expertName} !</h2>
        <p style="color:#57534E">Ton profil d'expert Savvy vient d'être approuvé. Tu peux dès maintenant recevoir des réservations de clients.</p>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;margin:20px 0">
          <p style="margin:0;color:#166534;font-weight:600">✅ Profil vérifié et actif</p>
          <p style="margin:8px 0 0;color:#166534;font-size:14px">Les clients peuvent maintenant te trouver et réserver une session avec toi.</p>
        </div>
        <p style="color:#57534E">Configure tes disponibilités et complète ton profil pour maximiser tes réservations.</p>
        <a href="https://getsavvy.fr" style="display:inline-block;background:#4A6029;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px">Accéder à mon profil →</a>
        <p style="color:#A8A29E;font-size:12px;margin-top:24px">Savvy · Tu gardes 80% de chaque session</p>
      </div>
      `,
    }),
  });

  return new Response(JSON.stringify({ ok: res.ok }), { headers: { "Content-Type": "application/json" } });
});
