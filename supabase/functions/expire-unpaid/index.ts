import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Réservations acceptées mais jamais payées.
 *
 * Deux rôles, dans cet ordre :
 *   1. RAPPELER — à mi-parcours de l'échéance, un e-mail au client. Sans ça,
 *      le seul signal entre « le conseiller a accepté » et « l'heure est
 *      passée » était une notification dans l'app, facile à manquer.
 *   2. EXPIRER — échéance dépassée : la réservation est annulée et le créneau
 *      redevient réservable. Une réservation confirmée non payée bloquait
 *      l'agenda du conseiller aussi sûrement qu'une réservation payée.
 *
 * Aucun argent n'est en jeu : par définition ces réservations n'ont jamais
 * été réglées. On ne touche donc ni à Stripe ni aux reversements.
 *
 * Appel interne uniquement (cron).
 */

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://www.getsavvy.fr";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const isInternal = (req: Request) =>
  (req.headers.get("Authorization") || "") === `Bearer ${SERVICE_KEY}`;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json" } });

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Savvy <notifications@getsavvy.fr>", to, subject, html }),
    });
    return res.ok;
  } catch { return false; }
};

const wrap = (title: string, body: string, cta?: string) => `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
    <h2 style="color:#1C1917">${title}</h2>
    ${body}
    ${cta ? `<a href="${SITE_URL}" style="display:inline-block;background:#1C1917;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px">${cta}</a>` : ""}
    <p style="color:#A8A29E;font-size:12px;margin-top:24px">Savvy · Parlez avec quelqu'un qui l'a déjà fait</p>
  </div>`;

const fmtDate = (d: string | null) => d
  ? new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" })
    + " à " + new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })
  : "à confirmer";

/** Noms et adresses des deux parties. */
async function parties(booking: Record<string, any>) {
  const { data: expertRow } = await supabase
    .from("experts").select("name, user_id").eq("id", booking.expert_id).single();
  const { data: cli } = await supabase.auth.admin.getUserById(booking.client_id);
  const { data: cliProf } = await supabase
    .from("profiles").select("name").eq("id", booking.client_id).single();
  const expUser = expertRow?.user_id
    ? (await supabase.auth.admin.getUserById(expertRow.user_id)).data : null;
  return {
    expertName: expertRow?.name || "Ton conseiller",
    expertEmail: expUser?.user?.email || null,
    expertUserId: expertRow?.user_id || null,
    clientName: cliProf?.name || "Client",
    clientEmail: cli?.user?.email || null,
  };
}

serve(async (req) => {
  if (!isInternal(req)) return new Response("Non autorisé", { status: 403 });

  const now = new Date();
  const nowIso = now.toISOString();
  const reminded: string[] = [];
  const expired: string[] = [];

  // ── 1. Rappel de paiement ──
  // On rappelle quand il reste moins de la moitié du délai, une seule fois.
  const { data: toRemind } = await supabase
    .from("bookings")
    .select("id, client_id, expert_id, phase_name, phase_price, date_session, pay_deadline")
    .eq("status", "confirmed").eq("paid", false)
    .is("pay_reminded_at", null)
    .not("pay_deadline", "is", null)
    .lt("pay_deadline", new Date(now.getTime() + 12 * 3600 * 1000).toISOString())
    .gt("pay_deadline", nowIso)
    .limit(50);

  for (const b of toRemind || []) {
    const p = await parties(b);
    if (p.clientEmail) {
      await sendEmail(
        p.clientEmail,
        `Ta session avec ${p.expertName} n'est pas encore confirmée`,
        wrap(
          "Il reste une étape",
          `<p style="color:#57534E">Bonjour ${p.clientName},</p>
           <p style="color:#57534E"><strong>${p.expertName}</strong> a accepté ta demande, mais le paiement n'a pas encore été effectué.</p>
           <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:16px;margin:20px 0">
             <p style="margin:0 0 6px;color:#92400E"><strong>${b.phase_name || "Session"}</strong></p>
             <p style="margin:0 0 4px;color:#B45309">${fmtDate(b.date_session)}</p>
             <p style="margin:0;color:#B45309">${b.phase_price}€</p>
           </div>
           <p style="color:#57534E">Sans paiement d'ici <strong>${fmtDate(b.pay_deadline)}</strong>, le créneau sera libéré pour quelqu'un d'autre.</p>`,
          "Finaliser le paiement →",
        ),
      );
    }
    await supabase.from("bookings").update({ pay_reminded_at: nowIso }).eq("id", b.id);
    reminded.push(b.id);
  }

  // ── 2. Expiration ──
  const { data: toExpire } = await supabase
    .from("bookings")
    .select("id, client_id, expert_id, phase_name, phase_price, date_session")
    .eq("status", "confirmed").eq("paid", false)
    .not("pay_deadline", "is", null)
    .lte("pay_deadline", nowIso)
    .limit(50);

  for (const b of toExpire || []) {
    const { error } = await supabase.from("bookings").update({
      status: "cancelled",
      cancel_reason: "Paiement non finalisé dans les délais",
      cancelled_by: "system",
    }).eq("id", b.id);
    if (error) { console.error("[expire-unpaid]", b.id, error.message); continue; }

    const p = await parties(b);
    const quand = fmtDate(b.date_session);

    if (p.clientEmail) {
      await sendEmail(
        p.clientEmail,
        `Créneau libéré — ${b.phase_name || "Session"}`,
        wrap(
          "Ta réservation a expiré",
          `<p style="color:#57534E">Bonjour ${p.clientName},</p>
           <p style="color:#57534E">Le paiement de ta session avec <strong>${p.expertName}</strong> (${quand}) n'a pas été finalisé, le créneau a donc été libéré.</p>
           <p style="color:#57534E">Aucun montant n'a été prélevé. Tu peux réserver à nouveau quand tu veux.</p>`,
          "Réserver à nouveau →",
        ),
      );
    }
    if (p.expertEmail) {
      await sendEmail(
        p.expertEmail,
        `Créneau libéré — ${quand}`,
        wrap(
          "Un créneau s'est libéré",
          `<p style="color:#57534E">Bonjour ${p.expertName},</p>
           <p style="color:#57534E">${p.clientName} n'a pas finalisé le paiement de la session du <strong>${quand}</strong>. Le créneau est de nouveau disponible dans ton agenda.</p>
           <p style="color:#57534E">Tu n'as rien à faire.</p>`,
        ),
      );
    }
    if (p.expertUserId) {
      await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({
          userId: p.expertUserId,
          title: "Créneau libéré",
          body: `${p.clientName} n'a pas finalisé le paiement · ${quand}`,
          url: "/",
        }),
      }).catch(() => {});
    }
    expired.push(b.id);
  }

  return json({ reminded: reminded.length, expired: expired.length });
});
