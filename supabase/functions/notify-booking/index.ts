import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const sendEmail = async (to: string, subject: string, html: string) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Savvy <notifications@getsavvy.fr>",
      to,
      subject,
      html,
    }),
  });
  return res.ok;
};

serve(async (req) => {
  const { record, type } = await req.json();

  if (!record) return new Response("no record", { status: 400 });

  const booking = record;
  const expertId = booking.expert_id; // experts.id (PK), not the expert's auth user id
  const clientId = booking.client_id;
  const status = booking.status;
  const date = booking.date_session ? new Date(booking.date_session).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" }) : "À confirmer";
  const time = booking.time || "";
  const phase = booking.phase_name || "Session";
  const price = booking.phase_price || 0;

  // Resolve the expert's auth user id from experts.id before looking up auth/profile data
  const { data: expertRow } = await supabase.from("experts").select("user_id").eq("id", expertId).single();
  const expertUserId = expertRow?.user_id;

  // Get expert email
  const { data: expertProfile } = expertUserId ? await supabase.auth.admin.getUserById(expertUserId) : { data: null };
  const expertEmail = expertProfile?.user?.email;

  // Get client email
  const { data: clientProfile } = await supabase.auth.admin.getUserById(clientId);
  const clientEmail = clientProfile?.user?.email;

  // Get names from profiles
  const { data: expProf } = expertUserId ? await supabase.from("profiles").select("name").eq("id", expertUserId).single() : { data: null };
  const { data: cliProf } = await supabase.from("profiles").select("name").eq("id", clientId).single();
  const expertName = expProf?.name || "Expert";
  const clientName = cliProf?.name || "Client";

  // ── Nouvelle réservation → notifier l'expert ──
  if (type === "INSERT" && status === "pending" && expertEmail) {
    await sendEmail(
      expertEmail,
      `📅 Nouvelle réservation — ${phase}`,
      `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1C1917">Nouvelle réservation sur Savvy</h2>
        <p style="color:#57534E">Bonjour ${expertName},</p>
        <p style="color:#57534E"><strong>${clientName}</strong> vient de réserver une session avec vous.</p>
        <div style="background:#FDF8F0;border:1px solid #E8DDD0;border-radius:12px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px;color:#1C1917"><strong>📋 ${phase}</strong></p>
          <p style="margin:0 0 4px;color:#57534E">📅 ${date} ${time ? "à " + time : ""}</p>
          <p style="margin:0;color:#57534E">💶 ${price}€</p>
        </div>
        <p style="color:#57534E">Connectez-vous à Savvy pour <strong>confirmer ou décliner</strong> cette réservation.</p>
        <a href="https://getsavvy.fr" style="display:inline-block;background:#1C1917;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px">Voir la réservation →</a>
        <p style="color:#A8A29E;font-size:12px;margin-top:24px">Savvy · Tu gardes 80% de chaque session</p>
      </div>
      `
    );
  }

  // ── Confirmée → notifier le client ──
  if (type === "UPDATE" && status === "confirmed" && clientEmail) {
    const bookingId = record.id || "";
    const roomId = bookingId.replace(/-/g,"").slice(0,16);
    const meetUrl = `https://meet.jit.si/savvy-${roomId}`;
    await sendEmail(
      clientEmail,
      `✅ Session confirmée — ${phase}`,
      `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1C1917">Votre session est confirmée !</h2>
        <p style="color:#57534E">Bonjour ${clientName},</p>
        <p style="color:#57534E"><strong>${expertName}</strong> a confirmé votre session.</p>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px;color:#1C1917"><strong>📋 ${phase}</strong></p>
          <p style="margin:0 0 4px;color:#57534E">📅 ${date} ${time ? "à " + time : ""}</p>
          <p style="margin:0;color:#57534E">💶 ${price}€</p>
        </div>
        <p style="color:#57534E">Préparez vos questions et rejoignez la session à l'heure prévue.</p>
        <div style="background:#ECFDF5;border:1px solid #6EE7B7;border-radius:12px;padding:16px;margin:20px 0">
          <p style="margin:0 0 6px;color:#065F46;font-weight:700">🎥 Lien de la session vidéo</p>
          <a href="${meetUrl}" style="color:#059669;word-break:break-all;font-size:13px">${meetUrl}</a>
        </div>
        <a href="https://getsavvy.fr" style="display:inline-block;background:#1C1917;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px">Voir ma session →</a>
        <p style="color:#A8A29E;font-size:12px;margin-top:24px">Savvy · L'expertise humaine, accessible à tous</p>
      </div>
      `
    );
  }

  // ── Annulée → notifier le client ──
  if (type === "UPDATE" && status === "cancelled" && clientEmail) {
    await sendEmail(
      clientEmail,
      `❌ Session annulée — ${phase}`,
      `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1C1917">Session annulée</h2>
        <p style="color:#57534E">Bonjour ${clientName},</p>
        <p style="color:#57534E">Malheureusement, <strong>${expertName}</strong> a annulé votre session ${phase} du ${date}.</p>
        <p style="color:#57534E">Vous pouvez réserver une nouvelle session ou choisir un autre expert sur Savvy.</p>
        <a href="https://getsavvy.fr" style="display:inline-block;background:#1C1917;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px">Trouver un expert →</a>
        <p style="color:#A8A29E;font-size:12px;margin-top:24px">Savvy · L'expertise humaine, accessible à tous</p>
      </div>
      `
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
