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

/** true seulement si l'utilisateur a accepté les cookies non essentiels. */
export const analyticsAllowed = () => getConsent() === "all";
