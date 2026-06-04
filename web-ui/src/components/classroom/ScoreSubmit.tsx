import { useState } from 'react';
import { useRoute, navigate } from '../../lib/route';
import { submitScore, fetchScores } from '../../lib/classroom';
import { isClassroomEnabled } from '../../lib/supabase';
import type { SharedScore } from '../../lib/scoring-shared';

/**
 * Panel pro odeslání skóre do třídního žebříčku. Vykreslí se jen když je
 * v odkazu aktivní místnost (`?room=`) a leaderboard je nakonfigurovaný.
 */
export default function ScoreSubmit({ score }: { score: SharedScore }) {
  const route = useRoute();
  const code = (route.roomCode ?? '').toUpperCase();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [rank, setRank] = useState<{ pos: number; total: number } | null>(null);
  const [errMsg, setErrMsg] = useState('');

  if (!code || !isClassroomEnabled) return null;

  const send = async () => {
    const playerName = name.trim();
    if (!playerName) return;
    setStatus('sending');
    const res = await submitScore(code, playerName, score);
    if ('error' in res) {
      setErrMsg(res.error);
      setStatus('error');
      return;
    }
    const rows = await fetchScores(code);
    const pos = rows.findIndex((r) => r.player_name === playerName && r.percentage === score.percentage);
    setRank({ pos: pos >= 0 ? pos + 1 : rows.length, total: rows.length });
    setStatus('done');
  };

  return (
    <div className="max-w-md mx-auto bg-white border-2 border-brand-teal/30 rounded-2xl p-5 text-left">
      <div className="eyebrow mb-1">Třídní žebříček · {code}</div>

      {status === 'done' && rank ? (
        <div className="text-center py-2">
          <p className="text-sm text-brand-slate">Tvůj výsledek je v žebříčku.</p>
          <p className="font-display text-2xl font-bold text-brand-charcoal mt-1">
            {rank.pos}. z {rank.total}
          </p>
          <button
            onClick={() => navigate({ screen: 'leaderboard', roomCode: code })}
            className="mt-3 min-h-[44px] px-5 rounded-xl bg-brand-teal text-white text-sm font-bold hover:bg-brand-teal-dark transition-colors"
          >
            Zobrazit žebříček třídy
          </button>
        </div>
      ) : (
        <>
          <h3 className="font-display text-base font-bold text-brand-charcoal">Odeslat výsledek do třídy</h3>
          <p className="text-xs text-brand-slate mt-1 mb-3">
            Zvol přezdívku (ne skutečné jméno) a porovnej se se spolužáky.
          </p>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              maxLength={40}
              placeholder="Přezdívka"
              className="flex-1 border border-gray-300 rounded-lg px-3 min-h-[44px] text-sm focus:ring-2 focus:ring-brand-teal outline-none"
            />
            <button
              onClick={send}
              disabled={!name.trim() || status === 'sending'}
              className="min-h-[44px] px-5 rounded-lg bg-brand-teal text-white text-sm font-bold hover:bg-brand-teal-dark transition-colors disabled:opacity-50"
            >
              {status === 'sending' ? 'Odesílám…' : 'Odeslat'}
            </button>
          </div>
          {status === 'error' && (
            <p className="text-xs text-brand-red mt-2">Nepodařilo se odeslat: {errMsg}</p>
          )}
        </>
      )}
    </div>
  );
}
