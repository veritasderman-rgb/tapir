import { getSupabase } from './supabase';
import type { ClassroomGameId, SharedScore } from './scoring-shared';

/**
 * Servisní vrstva třídního leaderboardu (F4) nad Supabase.
 * Všechny funkce snášejí nedostupný backend (vrací chybu místo pádu).
 */

export interface ScoreRow {
  id: string;
  room_code: string;
  player_name: string;
  game_id: ClassroomGameId;
  percentage: number;
  raw: number | null;
  max_raw: number | null;
  grade: string | null;
  created_at: string;
}

export interface RoomRow {
  code: string;
  game_id: ClassroomGameId;
  teacher_name: string | null;
  created_at: string;
  closed_at: string | null;
}

// Znaky bez vizuálně zaměnitelných (0/O, 1/I) pro snadné diktování ve třídě.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(len = 4): string {
  let out = '';
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[arr[i] % CODE_ALPHABET.length];
  return `TAPIR-${out}`;
}

/** Založí třídní místnost a vrátí její kód (nebo null při chybě/bez backendu). */
export async function createRoom(
  gameId: ClassroomGameId,
  teacherName?: string
): Promise<{ code: string } | { error: string }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Leaderboard není nakonfigurovaný.' };

  // Až 5 pokusů kvůli (nepravděpodobné) kolizi kódu.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { error } = await sb
      .from('rooms')
      .insert({ code, game_id: gameId, teacher_name: teacherName ?? null });
    if (!error) return { code };
    if (error.code !== '23505') return { error: error.message }; // 23505 = unique_violation
  }
  return { error: 'Nepodařilo se vytvořit místnost (kolize kódu).' };
}

/** Ověří, že místnost existuje a je otevřená; vrátí její záznam nebo null. */
export async function getRoom(code: string): Promise<RoomRow | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from('rooms').select('*').eq('code', code).maybeSingle();
  return (data as RoomRow) ?? null;
}

/** Odešle skóre studenta do místnosti. */
export async function submitScore(
  roomCode: string,
  playerName: string,
  score: SharedScore
): Promise<{ ok: true } | { error: string }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Leaderboard není nakonfigurovaný.' };
  const { error } = await sb.from('scores').insert({
    room_code: roomCode,
    player_name: playerName.slice(0, 40),
    game_id: score.gameId,
    percentage: score.percentage,
    raw: score.raw ?? null,
    max_raw: score.maxRaw ?? null,
    grade: score.grade ?? null,
    details: score.details ?? null,
  });
  return error ? { error: error.message } : { ok: true };
}

/** Načte žebříček místnosti (sestupně podle %). */
export async function fetchScores(roomCode: string): Promise<ScoreRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from('scores')
    .select('*')
    .eq('room_code', roomCode)
    .order('percentage', { ascending: false })
    .order('created_at', { ascending: true });
  return (data as ScoreRow[]) ?? [];
}

/** Přihlásí se k živým změnám skóre v místnosti. Vrací funkci pro odhlášení. */
export function subscribeToRoom(roomCode: string, onInsert: (row: ScoreRow) => void): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  const channel = sb
    .channel(`room:${roomCode}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'scores', filter: `room_code=eq.${roomCode}` },
      (payload) => onInsert(payload.new as ScoreRow)
    )
    .subscribe();
  return () => {
    sb.removeChannel(channel);
  };
}
