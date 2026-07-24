/* ─────────────────────────────────────────────────────────────────────────
   Paramètres métier de Savvy — source unique.
   Un seul endroit à changer si le modèle économique évolue.
   ───────────────────────────────────────────────────────────────────────── */

/** Part reversée à l'expert (le reste = commission Savvy). */
export const EXPERT_SHARE = 0.8;                 // 80 %
export const SAVVY_COMMISSION = 1 - EXPERT_SHARE; // 20 %

/** Pourcentages prêts à afficher : "80%" / "20%". */
export const EXPERT_SHARE_PCT = `${Math.round(EXPERT_SHARE * 100)}%`;
export const SAVVY_COMMISSION_PCT = `${Math.round(SAVVY_COMMISSION * 100)}%`;

/** Ce que l'expert reçoit pour un prix client donné (arrondi à l'euro). */
export const expertPayout = (price) => Math.round((Number(price) || 0) * EXPERT_SHARE);
/** Commission Savvy pour un prix client donné. */
export const savvyCut = (price) => (Number(price) || 0) - expertPayout(price);

/* ── Fenêtre d'accès à la session (en minutes autour de l'heure de début) ── */
export const JOIN_OPEN_BEFORE_MIN = 15;   // la salle ouvre 15 min avant
export const JOIN_CLOSE_AFTER_MIN = 75;   // et se ferme 75 min après le début
export const SESSION_DONE_AFTER_MIN = 90; // considérée "terminée" 90 min après

/**
 * Ouvre la salle de visio.
 *
 * window.open vers un domaine externe est très souvent bloqué — surtout dans
 * une PWA installée — et le blocage est silencieux : le conseiller clique,
 * rien ne se passe, et il rate sa session sans comprendre. On tente la
 * fenêtre, et si elle est refusée on navigue dans l'onglet courant, ce qui
 * n'est jamais bloqué.
 */
export function openMeetingRoom(url) {
  let win = null;
  try { win = window.open(url, "_blank", "noopener"); } catch { win = null; }
  if (!win || win.closed || typeof win.closed === "undefined") {
    window.location.href = url;
  }
}

/**
 * Regroupement d'une session par jour de calendrier.
 *
 * On comparait des heures écoulées : « moins de 24 h » était affiché comme
 * « Aujourd'hui ». Une session demain à 20:00, vue ce soir, tombait donc dans
 * « Aujourd'hui · 20:00 » — le conseiller cliquait sur Rejoindre et lisait
 * « reviens dans 24 h ». Deux jours différents peuvent être à moins de 24 h
 * d'écart : seule la date compte.
 *
 * @returns {"today"|"tomorrow"|"week"|"later"|"past"}
 */
export function dayBucket(ts, now = Date.now()) {
  if (!ts) return "later";
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
  const days = Math.round((startOfDay(ts) - startOfDay(now)) / 86400000);
  if (days < 0) return "past";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days <= 7) return "week";
  return "later";
}

/** Vrai si la session tombe aujourd'hui (date, pas « dans moins de 24 h »). */
export const isToday = (ts, now = Date.now()) => dayBucket(ts, now) === "today";

/**
 * Une session est « tenue » quand son heure de fin est passée et que le délai
 * de réclamation est écoulé sans signalement.
 *
 * Savvy ne peut pas observer la visio : personne ne coche « je m'y suis
 * rendu ». On s'appuie donc sur le silence du client, qui dispose du bouton
 * « Signaler un problème » — le même mécanisme que la plupart des
 * marketplaces de services.
 */
export const CLAIM_WINDOW_HOURS = 48;

/** La session a-t-elle eu lieu, du point de vue de la plateforme ? */
export function sessionHeld(booking, now = Date.now()) {
  if (!booking?.paid) return false;
  if (booking.refund_status === "requested" || booking.refund_status === "done") return false;
  const start = booking.date_session ? new Date(booking.date_session).getTime() : null;
  if (!start) return false;
  return now > start + SESSION_DONE_AFTER_MIN * 60000;
}

/**
 * Fenêtre de paiement — la même règle que le serveur (migration 011) :
 * 24 h pour régler, et de toute façon jusqu'à 2 h avant la session.
 *
 * L'écran affichait « Payer → » sans jamais consulter cette règle. Un client
 * pouvait donc payer une session dont l'heure était déjà passée : l'argent
 * partait, le créneau n'existait plus, et personne ne se présentait.
 * `payWindow` est la source unique côté interface.
 */
export const PAY_CLOSES_BEFORE_MIN = 120;

export function payWindow(booking, now = Date.now()) {
  const start = booking?.startTs
    ?? (booking?.date_session ? new Date(booking.date_session).getTime() : null);
  const deadline = booking?.payDeadline || booking?.pay_deadline || null;

  if (start && now > start - PAY_CLOSES_BEFORE_MIN * 60000) {
    return { canPay: false, reason: now > start ? "passed" : "tooLate" };
  }
  if (deadline && now > new Date(deadline).getTime()) {
    return { canPay: false, reason: "deadline" };
  }
  return { canPay: true, reason: "open" };
}

/** Le délai de réclamation est-il écoulé ? Au-delà, le revenu est acquis. */
export function revenueSettled(booking, now = Date.now()) {
  if (!sessionHeld(booking, now)) return false;
  const start = new Date(booking.date_session).getTime();
  return now > start + CLAIM_WINDOW_HOURS * 3600000;
}

/**
 * Répartit les réservations payées en trois états, pour ne jamais annoncer un
 * revenu qui n'est pas encore gagné.
 *   · aVenir  : payée, session pas encore passée
 *   · enCours : session passée, délai de réclamation en cours
 *   · acquis  : plus rien ne peut la remettre en cause
 */
export function splitRevenue(bookings = [], now = Date.now()) {
  const paid = (bookings || []).filter(b => b?.paid);
  return {
    aVenir:  paid.filter(b => !sessionHeld(b, now)),
    enCours: paid.filter(b => sessionHeld(b, now) && !revenueSettled(b, now)),
    acquis:  paid.filter(b => revenueSettled(b, now)),
  };
}
