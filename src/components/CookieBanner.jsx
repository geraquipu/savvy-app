import { useState } from 'react';
import { C, SANS, SERIF } from '../constants/colors';
import { getConsent, setConsent } from '../consent';

/**
 * Bandeau de consentement cookies (RGPD).
 * Tant qu'aucun choix n'est fait, ni Sentry Session Replay ni Analytics
 * ne tournent (voir main.jsx). "Accepter" recharge pour les activer.
 */
export default function CookieBanner() {
  const [decided, setDecided] = useState(() => getConsent() !== null);
  if (decided) return null;

  const choose = (value) => {
    setConsent(value);
    setDecided(true);
    // "all" -> on recharge pour initialiser analytics/replay proprement
    if (value === "all") window.location.reload();
  };

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100000,
      display: "flex", justifyContent: "center",
      padding: "0 12px calc(env(safe-area-inset-bottom) + 12px)",
      pointerEvents: "none",
    }}>
      <div style={{
        pointerEvents: "auto",
        width: "100%", maxWidth: 460,
        background: C.ink, color: C.white,
        borderRadius: 16, padding: "16px 18px",
        boxShadow: "0 8px 40px rgba(0,0,0,.35)",
        fontFamily: SANS,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: SERIF, marginBottom: 6 }}>
          Cookies &amp; confidentialité
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.55, color: "rgba(253,252,248,.72)", marginBottom: 14 }}>
          Savvy utilise des cookies essentiels au fonctionnement du site. Avec ton accord,
          nous mesurons aussi l'audience pour améliorer l'expérience. Tu peux refuser sans
          impact sur ton utilisation.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => choose("essential")} style={{
            flex: 1, padding: "11px", borderRadius: 11, cursor: "pointer",
            border: "1px solid rgba(255,255,255,.22)", background: "transparent",
            color: C.white, fontSize: 13, fontWeight: 600, fontFamily: "inherit",
          }}>
            Refuser
          </button>
          <button onClick={() => choose("all")} style={{
            flex: 1.4, padding: "11px", borderRadius: 11, cursor: "pointer", border: "none",
            background: `linear-gradient(135deg,${C.gold},${C.goldB})`,
            color: C.white, fontSize: 13, fontWeight: 700, fontFamily: SERIF,
          }}>
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
