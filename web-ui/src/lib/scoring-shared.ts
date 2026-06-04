/**
 * Jednotný tvar skóre napříč hrami pro třídní leaderboard (F4).
 *
 * Každá hra skóruje jinak (Ósacká: body + známka A–F; Oyster Bay: kvíz %;
 * Krizový štáb: vyhodnocení). Adaptéry je převedou na společné `SharedScore`,
 * kde hlavním řadicím klíčem je `percentage` (0–100).
 */

export type ClassroomGameId = 'krizovy-stab' | 'osacka' | 'oyster-bay';

export const GAME_LABELS: Record<ClassroomGameId, string> = {
  'krizovy-stab': 'Krizový štáb',
  osacka: 'Ósacká horečka',
  'oyster-bay': 'Záhada z Oyster Bay',
};

export interface SharedScore {
  gameId: ClassroomGameId;
  /** 0–100, hlavní řadicí klíč napříč hrami */
  percentage: number;
  /** surové body v kontextu hry (volitelné) */
  raw?: number;
  maxRaw?: number;
  /** známka A–F, kde dává smysl */
  grade?: string;
  /** rozpad pro debrief (volné pole) */
  details?: Record<string, unknown>;
}

const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Ósacká horečka — z výsledku `calculateScore` (data/osacka/scoring.ts). */
export function osackaToShared(score: {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
}): SharedScore {
  return {
    gameId: 'osacka',
    percentage: clampPct(score.percentage),
    raw: score.totalScore,
    maxRaw: score.maxScore,
    grade: score.grade,
  };
}

/** Záhada z Oyster Bay — z počtu správných odpovědí. */
export function oysterToShared(correct: number, total: number): SharedScore {
  const percentage = total > 0 ? clampPct((correct / total) * 100) : 0;
  return {
    gameId: 'oyster-bay',
    percentage,
    raw: correct,
    maxRaw: total,
  };
}
