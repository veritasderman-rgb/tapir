import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase klient pro třídní leaderboard (F4).
 *
 * URL a publishable klíč jsou **veřejné** (klíč je navržený pro běh v prohlížeči,
 * data chrání Row Level Security) — proto mohou být zde jako výchozí hodnoty,
 * aby leaderboard fungoval i bez konfigurace env. Lze přepsat přes
 * `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (např. pro vlastní instanci).
 */
const DEFAULT_URL = 'https://acmwdkzkkstbqmuhsdxg.supabase.co';
const DEFAULT_KEY = 'sb_publishable_HJQV8AlJjEWcl2js_1Jsdw_BAl2uufX';

const url = import.meta.env.VITE_SUPABASE_URL ?? DEFAULT_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? DEFAULT_KEY;

/** True, pokud je leaderboard nakonfigurovaný (vždy, díky výchozím hodnotám). */
export const isClassroomEnabled = Boolean(url && key);

let client: SupabaseClient | null = null;

/** Vrátí (líně vytvořený) Supabase klient, nebo null když není konfigurace. */
export function getSupabase(): SupabaseClient | null {
  if (!isClassroomEnabled) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 5 } },
    });
  }
  return client;
}
