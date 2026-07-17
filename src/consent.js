/* ─────────────────────────────────────────────────────────────
   Consentement cookies (RGPD).
   Valeurs : "all" (analytics + replay) | "essential" (rien) | null (pas décidé)
   ───────────────────────────────────────────────────────────── */
const KEY = "savvy_cookie_consent";

export function getConsent() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function setConsent(value) {
  try { localStorage.setItem(KEY, value); } catch {}
}

/**
 * Efface le choix : le bandeau réapparaît au prochain rendu.
 * Le RGPD impose que retirer son consentement soit aussi simple que le donner
 * (art. 7.3) — d'où le bouton dans la rubrique « Gestion des cookies ».
 */
export function resetConsent() {
  try { localStorage.removeItem(KEY); } catch {}
}

/** true seulement si l'utilisateur a accepté les cookies non essentiels. */
export const analyticsAllowed = () => getConsent() === "all";
