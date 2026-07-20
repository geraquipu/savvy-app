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
