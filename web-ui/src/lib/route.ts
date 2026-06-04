import { useEffect, useState } from 'react';
import { AppMode } from '@tapir/core';

/**
 * Lehký hash-router pro Nedovařeného tapíra.
 *
 * Každý režim má skutečnou URL, takže učitel může poslat odkaz na jednu
 * konkrétní aktivitu a uživatel se může vracet na rozcestník (Home).
 * Bez závislosti na react-router — zdrojem pravdy je `location.hash`.
 *
 * Schéma adres:
 *   #/                         → rozcestník (hub)
 *   #/hra/krizovy-stab         → Krizový štáb (výběr scénáře)
 *   #/hra/krizovy-stab?s=<b64> → Krizový štáb s učitelovým scénářem
 *   #/hra/osacka               → Ósacká horečka
 *   #/hra/oyster-bay           → Záhada z Oyster Bay
 *   #/prirucka                 → Příručka epidemiologa
 *   #/sandbox                  → Odborný režim
 *   #/ucitel                   → Učitelský režim
 *
 * Volitelný `?room=<KÓD>` označuje třídní místnost pro živý leaderboard (F4).
 * Zpětná kompatibilita: staré odkazy `#game=<b64>` / `?game=<b64>` se rozpoznají
 * a normalizují na `#/hra/krizovy-stab?s=<b64>`.
 */

export type Screen = 'hub' | AppMode;

export interface Route {
  screen: Screen;
  /** Base64 GameScenario pro Krizový štáb (odkaz od učitele). */
  scenarioParam?: string;
  /** Kód třídní místnosti (?room=) pro živý leaderboard (F4). */
  roomCode?: string;
  /** True, pokud odkaz pochází ze staré podoby (#game= / ?game=). */
  legacy?: boolean;
}

const SCREEN_TO_SLUG: Record<AppMode, string> = {
  [AppMode.CrisisStaff]: 'hra/krizovy-stab',
  [AppMode.OsackaHorecka]: 'hra/osacka',
  [AppMode.TyfovaMary]: 'hra/oyster-bay',
  [AppMode.Handbook]: 'prirucka',
  [AppMode.Expert]: 'sandbox',
  [AppMode.Instructor]: 'ucitel',
};

const SLUG_TO_SCREEN: Record<string, AppMode> = Object.entries(SCREEN_TO_SLUG).reduce(
  (acc, [mode, slug]) => {
    acc[slug] = mode as AppMode;
    return acc;
  },
  {} as Record<string, AppMode>
);

/**
 * Čistá (testovatelná) varianta parsování — z hashe a query stringu.
 * @param rawHash  hodnota `location.hash` (s '#' i bez)
 * @param rawSearch hodnota `location.search` (s '?' i bez)
 */
export function parseLocation(rawHash: string, rawSearch = ''): Route {
  const hash = rawHash.replace(/^#/, '');
  const search = new URLSearchParams(rawSearch.replace(/^\?/, ''));

  // ── Zpětná kompatibilita: #game=<b64> (starý hash formát) ──
  if (hash.startsWith('game=')) {
    return { screen: AppMode.CrisisStaff, scenarioParam: hash.slice('game='.length), legacy: true };
  }

  // ── Zpětná kompatibilita: ?game=<b64> (starý search formát) ──
  // Ctíme jen když chybí jakýkoli hash fragment — jakákoli explicitní hash
  // route (včetně `#/`) má přednost, jinak by ?game v search trvale přebíjelo
  // navigaci (návrat na rozcestník by skákal zpět do hry).
  if (hash === '') {
    const legacySearchGame = search.get('game');
    if (legacySearchGame) {
      return { screen: AppMode.CrisisStaff, scenarioParam: legacySearchGame, legacy: true };
    }
  }

  // ── Nové schéma: #/<slug>?<query> ──
  const [pathPart, queryPart] = hash.split('?');
  const path = pathPart.replace(/^\/+/, '').replace(/\/+$/, '');
  const query = new URLSearchParams(queryPart ?? '');
  const roomCode = query.get('room') ?? search.get('room') ?? undefined;

  if (path === '') return { screen: 'hub', roomCode };

  const screen = SLUG_TO_SCREEN[path];
  if (!screen) return { screen: 'hub', roomCode };

  return {
    screen,
    scenarioParam: query.get('s') ?? undefined,
    roomCode,
  };
}

/** Přečte aktuální URL a vrátí strukturovanou cestu. */
export function parseRoute(): Route {
  if (typeof window === 'undefined') return { screen: 'hub' };
  return parseLocation(window.location.hash, window.location.search);
}

/** Sestaví hash cestu (bez vedoucího '#') pro danou route. */
export function buildPath(route: Route): string {
  if (route.screen === 'hub') return '/';
  const slug = SCREEN_TO_SLUG[route.screen];
  const query = new URLSearchParams();
  if (route.scenarioParam) query.set('s', route.scenarioParam);
  if (route.roomCode) query.set('room', route.roomCode);
  const qs = query.toString();
  return `/${slug}${qs ? `?${qs}` : ''}`;
}

/** Přejde na danou route změnou hashe (vyvolá `hashchange`). */
export function navigate(route: Route): void {
  if (typeof window === 'undefined') return;
  window.location.hash = buildPath(route);
}

/** Vrátí plný sdílitelný odkaz na danou route (pro učitele / QR). */
export function gameLink(route: Route): string {
  if (typeof window === 'undefined') return '';
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${buildPath(route)}`;
}

/** React hook: aktuální route, reaguje na hashchange/popstate. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseRoute);
  useEffect(() => {
    const handler = () => setRoute(parseRoute());
    window.addEventListener('hashchange', handler);
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener('hashchange', handler);
      window.removeEventListener('popstate', handler);
    };
  }, []);
  return route;
}
