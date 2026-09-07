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

export function storedChoice(): Choice | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function rememberChoice(choice: Choice): void {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* privátní režim — volba platí jen pro tuto návštěvu */
  }
}

function consentPayload(choice: Choice) {
  return {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
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
  window.gtag?.('consent', 'update', consentPayload(choice));
}

/** Zavolat jednou při startu aplikace, ještě před vykreslením lišty. */
export function initAnalytics(): void {
  if (!GA_ID) return;

  const gtag = ensureGtag();
  gtag('consent', 'default', {
    ...consentPayload(storedChoice() ?? 'denied'),
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
