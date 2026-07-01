import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const sendEmail = async (to: string, subject: string, html: string) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Savvy <notifications@getsavvy.fr>", to, subject, html }),
  });
  return res.ok;
};

serve(async () => {
  // Find confirmed+paid bookings happening in the next 20-28 hours (reminder window)
  const now = new Date();
  const windowStart = new Date(now.getTime() + 20 * 3600 * 1000).toISOString();
  const windowEnd   = new Date(now.getTime() + 28 * 3600 * 1000).toISOString();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, client_id, expert_id, phase_name, phase_price, date_session, reminder_sent")
    .eq("status", "confirmed")
    .eq("paid", true)
    .eq("reminder_sent", false)
    .gte("date_session", windowStart)
    .lte("date_session", windowEnd);

  if (!bookings?.length) return new Response(JSON.stringify({ sent: 0 }), { headers: { "Content-Type": "application/json" } });

  let sent = 0;
  for (const b of bookings) {
    const date = new Date(b.date_session).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" });
    const time = new Date(b.date_session).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });
    const phase = b.phase_name || "Session";
    const price = b.phase_price || 0;
    const roomId = b.id.replace(/-/g,"").slice(0,16);

    // Resolve expert meet_link and names
    const { data: expRow } = await supabase.from("experts").select("user_id, meet_link, name").eq("id", b.expert_id).single();
    const meetUrl = expRow?.meet_link || `https://meet.jit.si/savvy-${roomId}`;
    const expertName = expRow?.name || "Votre expert";

    const { data: clientAuth } = expRow?.user_id ? await supabase.auth.admin.getUserById(b.client_id) : { data: null };
    const clientEmail = clientAuth?.user?.email;
    const { data: cliProf } = await supabase.from("profiles").select("name").eq("id", b.client_id).single();
    const clientName = cliProf?.name || "Client";

    const { data: expAuth } = expRow?.user_id ? await supabase.auth.admin.getUserById(expRow.user_id) : { data: null };
    const expertEmail = expAuth?.user?.email;

    const reminderHtml = (name: string, role: "client" | "expert") => `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1C1917">⏰ Rappel — session dans moins de 24h</h2>
        <p style="color:#57534E">Bonjour ${name},</p>
        <p style="color:#57534E">Votre session ${role === "client" ? `avec <strong>${expertName}</strong>` : `avec <strong>${clientName}</strong>`} est demain !</p>
        <div style="background:#FDF8F0;border:1px solid #E8DDD0;border-radius:12px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px;color:#1C1917"><strong>📋 ${phase}</strong></p>
          <p style="margin:0 0 4px;color:#57534E">📅 ${date} à ${time}</p>
          ${role === "client" ? `<p style="margin:0;color:#57534E">💶 ${price}€ (déjà réglé)</p>` : ""}
        </div>
        <div style="background:#ECFDF5;border:1px solid #6EE7B7;border-radius:12px;padding:16px;margin:20px 0">
          <p style="margin:0 0 6px;color:#065F46;font-weight:700">🎥 Lien de la session</p>
          <a href="${meetUrl}" style="color:#059669;word-break:break-all;font-size:13px">${meetUrl}</a>
        </div>
        <a href="https://getsavvy.fr" style="display:inline-block;background:#1C1917;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px">Voir mes sessions →</a>
        <p style="color:#A8A29E;font-size:12px;margin-top:24px">Savvy · L'expertise humaine, accessible à tous</p>
      </div>`;

    if (clientEmail) await sendEmail(clientEmail, `⏰ Rappel — session demain avec ${expertName}`, reminderHtml(clientName, "client"));
    if (expertEmail) await sendEmail(expertEmail, `⏰ Rappel — session demain avec ${clientName}`, reminderHtml(expertName, "expert"));

    await supabase.from("bookings").update({ reminder_sent: true }).eq("id", b.id);
    sent++;
  }

  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
});
