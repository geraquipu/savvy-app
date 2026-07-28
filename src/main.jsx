import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import { Analytics } from '@vercel/analytics/react';
import './index.css'
import App from './App.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import { analyticsAllowed } from './consent'

// RGPD : suivi audience + Session Replay seulement si l'utilisateur a consenti.
const trackingOn = analyticsAllowed();

Sentry.init({
  dsn: "https://358f99e4708537180c6bf529dfcd79c4@o4511627689721856.ingest.de.sentry.io/4511627696537680",
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    // Session Replay uniquement avec consentement, et texte masqué (aucune donnée saisie)
    ...(trackingOn
      ? [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })]
      : []),
  ],
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: trackingOn ? 1.0 : 0,
});

/**
 * Écran de repli si un composant plante au rendu.
 *
 * Sans lui, une erreur de rendu démonte tout l'arbre React : l'utilisateur
 * se retrouve devant une page blanche, sans issue. Sentry capture bien
 * l'erreur (on la voit), mais le client, lui, est bloqué. Ici on lui offre
 * un message clair et un bouton pour repartir.
 */
function CrashFallback() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center",
      fontFamily: "Georgia, serif", background: "#FBF9F4", color: "#2C2825" }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Un souci est survenu</div>
      <div style={{ fontSize: 14, color: "#78716B", maxWidth: 320, lineHeight: 1.6, marginBottom: 22 }}>
        Quelque chose n'a pas fonctionné de notre côté. Rien n'est perdu — recharge la page pour continuer.
      </div>
      <button onClick={() => window.location.assign("/")}
        style={{ padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer",
          fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 15, color: "#fff", background: "#6B7F52" }}>
        Recharger Savvy
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<CrashFallback />}>
      <App />
    </Sentry.ErrorBoundary>
    {trackingOn && <Analytics />}
    <CookieBanner />
  </StrictMode>,
)
