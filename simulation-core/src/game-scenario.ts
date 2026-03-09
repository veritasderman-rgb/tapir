/**
 * Game Scenario encoding/decoding — Base64 JSON for sharing via URL.
 * Uses btoa/atob (available in browsers and Node 16+).
 */

import { type GameScenario } from './types';

/** Encode a GameScenario to a Base64 string for URL sharing. */
export function encodeGameScenario(gs: GameScenario): string {
  const json = JSON.stringify(gs);
  return btoa(unescape(encodeURIComponent(json)));
}

/** Decode a Base64 string back to a GameScenario. */
export function decodeGameScenario(encoded: string): GameScenario {
  const json = decodeURIComponent(escape(atob(encoded)));
  return JSON.parse(json) as GameScenario;
}
