/**
 * Souhlas s cookies (GDPR / Google Consent Mode v2).
 *
 * Měřicí kód jde z VITE_GA_ID; bez proměnné se GA vůbec nenačte a lišta se
 * nezobrazí. gtag.js se stahuje jen v produkčním buildu, aby vývoj nešpinil
 * data. Výchozí stav souhlasu je `denied` a nastaví se PŘED gtag.js, takže
 * dokud návštěvník neklikne, GA neukládá žádné cookies.
 */
export const CONSENT_KEY = 'tapir.cookieConsent.v1';

export type Choice = 'granted' | 'denied';

export const GA_ID: string = import.meta.env.VITE_GA_ID ?? '';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Volba pro případ, že localStorage zápis odmítne (privátní režim, sandbox).
 * Bez ní by se lišta po kliknutí nezavřela — přečetla by si prázdné úložiště
 * a otevřela se znovu.
 */
let fallbackChoice: Choice | null = null;

export function storedChoice(): Choice | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === 'granted' || v === 'denied') return v;
  } catch {
    // Privátní režim — spolehneme se na volbu drženou v paměti.
  }
  return fallbackChoice;
}

export function rememberChoice(choice: Choice): void {
  // Nejdřív do paměti: platí i tehdy, když zápis do localStorage selže.
  fallbackChoice = choice;
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* privátní režim — volba platí jen pro tuto návštěvu */
  }
  reopened = false;
  notify();
}

/** Lišta otevřená z patičky, i když volba už padla (odvolání souhlasu). */
let reopened = false;
let listeners: (() => void)[] = [];

function notify(): void {
  for (const l of listeners) l();
}

export function subscribeConsent(onChange: () => void): () => void {
  listeners = [...listeners, onChange];
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
  };
}

/** Má se lišta vykreslit? Bez měřicího kódu se neptáme na nic. */
export function isConsentOpen(): boolean {
  if (!GA_ID) return false;
  return reopened || storedChoice() === null;
}

/** Odkaz „Nastavení cookies" v patičce — souhlas musí jít odvolat stejně
 *  snadno, jako se dával. */
export function reopenConsent(): void {
  reopened = true;
  notify();
}

/**
 * Reklamní souhlas zůstává vždycky denied — lišta mluví jen o měření
 * návštěvnosti, na reklamní účely se neptá, tak je nesmíme udělit.
 */
function consentDefaults(choice: Choice) {
  return {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: choice,
  };
}

/**
 * gtag shim — musí existovat dřív, než se načte gtag.js, jinak se první
 * `consent default` ztratí a GA by chvíli měřila bez souhlasu.
 */
function ensureGtag(): (...args: unknown[]) => void {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }
  return window.gtag;
}

/** Promítne volbu do GA. Když GA neběží, tiše se nic nestane. */
export function updateConsent(choice: Choice): void {
  window.gtag?.('consent', 'update', { analytics_storage: choice });
}

/** Zavolat jednou při startu aplikace, ještě před vykreslením lišty. */
export function initAnalytics(): void {
  if (!GA_ID) return;

  const gtag = ensureGtag();
  gtag('consent', 'default', {
    ...consentDefaults(storedChoice() ?? 'denied'),
    wait_for_update: 500,
  });

  if (!import.meta.env.PROD) return;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', GA_ID);
}
