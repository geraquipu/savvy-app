import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPPORT_TO = Deno.env.get("SUPPORT_EMAIL") || "geraquipu@hotmail.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // Seuls les comptes connectés écrivent au support. La fonction n'est appelée
    // que par des utilisateurs réels ; sans ce contrôle, la clé anon (publique)
    // permettait d'inonder la boîte du support depuis l'extérieur.
    const authHeader = req.headers.get("Authorization") || "";
    const asUser = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await asUser.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { message, fromName, fromEmail, userId } = await req.json();
    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: "message vide" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    // Échappe l'injection HTML : ce courriel arrive dans la boîte support.
    const esc = (s: unknown) =>
      String(s ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const nameH = esc(fromName || "Utilisateur");
    const emailH = esc(fromEmail || "");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Savvy Support <notifications@getsavvy.fr>",
        to: SUPPORT_TO,
        reply_to: fromEmail || undefined,
        subject: `💬 Message support — ${fromName || "Utilisateur"}`,
        html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#1C1917">Nouveau message d'assistance</h2>
          <p style="color:#57534E"><strong>De :</strong> ${nameH} ${emailH ? `(${emailH})` : ""}</p>
          ${userId ? `<p style="color:#A8A29E;font-size:12px">User ID : ${userId}</p>` : ""}
          <div style="background:#FDF8F0;border:1px solid #E8DDD0;border-radius:12px;padding:16px;margin:16px 0;color:#1C1917;white-space:pre-wrap">${message.replace(/</g, "&lt;")}</div>
          <p style="color:#A8A29E;font-size:12px">Réponds directement à cet email pour contacter l'utilisateur.</p>
        </div>
        `,
      }),
    });

    return new Response(JSON.stringify({ ok: res.ok }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
