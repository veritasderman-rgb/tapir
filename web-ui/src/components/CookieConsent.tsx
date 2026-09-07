import { useSyncExternalStore } from 'react';
import {
  type Choice,
  GA_ID,
  isConsentOpen,
  rememberChoice,
  reopenConsent,
  subscribeConsent,
  updateConsent,
} from '../lib/consent';

/**
 * Lišta se souhlasem s cookies. Ukáže se jen tomu, kdo se ještě nerozhodl,
 * a jen když je nastavené VITE_GA_ID — ptát se na souhlas s měřením, které
 * neběží, nedává smysl. Znovu ji otevře odkaz v patičce.
 */
export default function CookieConsent() {
  const open = useSyncExternalStore(subscribeConsent, isConsentOpen, () => false);

  if (!open) return null;

  const choose = (choice: Choice) => {
    rememberChoice(choice);
    updateConsent(choice);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-slate/20 bg-white px-4 py-3 shadow-lg print:hidden">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm leading-relaxed text-brand-slate">
          Web měří anonymní návštěvnost (Google Analytics, Vercel). Bez souhlasu se neukládají
          žádné analytické cookies.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="rounded border border-brand-slate/40 px-4 py-2 text-sm text-brand-slate transition-colors hover:bg-brand-cream"
          >
            Odmítnout
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="rounded bg-brand-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-teal-dark"
          >
            Souhlasím
          </button>
        </div>
      </div>
    </div>
  );
}

/** Odkaz do patičky, kterým jde souhlas kdykoli znovu otevřít a odvolat. */
export function CookieSettingsLink({ className }: { className?: string }) {
  if (!GA_ID) return null;
  return (
    <button type="button" onClick={reopenConsent} className={className}>
      Nastavení cookies
    </button>
  );
}
