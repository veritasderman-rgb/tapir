/**
 * Game Scenario encoding/decoding — compressed Base64 for sharing via URL.
 * Uses pako (deflate) to compress JSON before Base64 encoding.
 * This reduces typical scenario URLs from ~15KB to ~2-3KB.
 */

import { type GameScenario } from './types';
import pako from 'pako';

/** Encode a GameScenario to a compressed Base64 string for URL sharing. */
export function encodeGameScenario(gs: GameScenario): string {
  const json = JSON.stringify(gs);
  const compressed = pako.deflate(json);
  // Convert Uint8Array to binary string for btoa
  let binary = '';
  for (let i = 0; i < compressed.length; i++) {
    binary += String.fromCharCode(compressed[i]);
  }
  return btoa(binary);
}

/** Decode a compressed Base64 string back to a GameScenario. */
export function decodeGameScenario(encoded: string): GameScenario {
  try {
    // Try compressed format first (new)
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = pako.inflate(bytes, { to: 'string' });
    return JSON.parse(json) as GameScenario;
  } catch {
    // Fallback: try uncompressed format (old/legacy)
    try {
      const json = decodeURIComponent(escape(atob(encoded)));
      return JSON.parse(json) as GameScenario;
    } catch {
      throw new Error('Invalid scenario data: could not decode');
    }
  }
}
