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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {trackingOn && <Analytics />}
    <CookieBanner />
  </StrictMode>,
)
