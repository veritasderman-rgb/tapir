import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';
import CookieConsent, { CookieSettingsLink } from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';
import { initAnalytics } from './lib/consent';
import './index.css';

// Consent Mode v2 se musí nastavit dřív, než se cokoli vykreslí — jinak by
// GA stihla poslat první zásah bez souhlasu.
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Analytics />
      <SpeedInsights />
      <CookieConsent />
      <CookieSettingsLink />
    </ErrorBoundary>
  </React.StrictMode>,
);
