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
