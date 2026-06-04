import { useEffect, useMemo, useState } from 'react';
import { useRoute } from '../../lib/route';
import { fetchScores, subscribeToRoom, getRoom, type ScoreRow, type RoomRow } from '../../lib/classroom';
import { GAME_LABELS } from '../../lib/scoring-shared';
import { isClassroomEnabled } from '../../lib/supabase';
import HomeButton from '../HomeButton';
import { Medal, IconTrophy, TapirMark } from '../brand/BrandIcons';

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export default function Leaderboard() {
  const route = useRoute();
  const code = (route.roomCode ?? '').toUpperCase();
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    let active = true;
    setLoading(true);
    getRoom(code).then((r) => active && setRoom(r));
    fetchScores(code).then((rows) => {
      if (!active) return;
      setScores(rows);
      setLoading(false);
    });
    const unsub = subscribeToRoom(code, (row) => {
      setScores((prev) => {
        // Dedup: úvodní fetch a realtime mohou doručit týž řádek (race).
        if (prev.some((r) => r.id === row.id)) return prev;
        return [...prev, row].sort(
          (a, b) => b.percentage - a.percentage || a.created_at.localeCompare(b.created_at)
        );
      });
    });
    return () => {
      active = false;
      unsub();
    };
  }, [code]);

  const stats = useMemo(() => {
    const pcts = scores.map((s) => s.percentage);
    const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
    return { count: pcts.length, avg, med: median(pcts), best: pcts.length ? Math.max(...pcts) : 0 };
  }, [scores]);

  const gameLabel = room ? GAME_LABELS[room.game_id] : '';

  return (
    <div className="min-h-screen brand-grid-bg">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <HomeButton className="-ml-2" />
          <div className="flex items-center gap-1.5 text-brand-slate">
            <IconTrophy className="w-4 h-4" />
            <span className="eyebrow">Žebříček třídy</span>
          </div>
        </div>

        <header className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-charcoal">
            {gameLabel || 'Výsledky'}
          </h1>
          <p className="mt-2 text-sm text-brand-slate">
            Místnost <span className="font-mono font-bold text-brand-charcoal">{code || '—'}</span>
          </p>
        </header>

        {!isClassroomEnabled ? (
          <Empty>Leaderboard není v této instanci nakonfigurovaný.</Empty>
        ) : !code ? (
          <Empty>Chybí kód místnosti v odkazu.</Empty>
        ) : (
          <>
            {/* Statistika třídy */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <Stat label="Hráčů" value={stats.count} />
              <Stat label="Nejlepší" value={`${stats.best} %`} />
              <Stat label="Průměr" value={`${stats.avg} %`} />
              <Stat label="Medián" value={`${stats.med} %`} />
            </div>

            {/* Tabulka */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
              {loading ? (
                <div className="p-10 text-center text-brand-slate text-sm">Načítám…</div>
              ) : scores.length === 0 ? (
                <Empty embedded>Zatím nikdo nedohrál. Výsledky se objeví živě.</Empty>
              ) : (
                <ul>
                  {scores.map((s, i) => (
                    <li
                      key={s.id}
                      className={`flex items-center gap-3 px-4 md:px-6 py-3 border-b border-gray-100 last:border-0 ${
                        i < 3 ? 'bg-brand-teal-soft/40' : ''
                      }`}
                    >
                      <span className="w-8 flex items-center justify-center text-lg font-bold tabular-nums text-brand-slate">
                        {i < 3 ? <Medal place={(i + 1) as 1 | 2 | 3} className="w-7 h-7" /> : i + 1}
                      </span>
                      <span className="flex-1 font-semibold text-brand-charcoal truncate">
                        {s.player_name}
                      </span>
                      {s.grade && (
                        <span className="text-xs font-bold text-brand-slate w-5 text-center">{s.grade}</span>
                      )}
                      <span className="font-display text-lg font-bold tabular-nums text-brand-teal-dark w-16 text-right">
                        {s.percentage} %
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-4">
              Aktualizuje se živě, jak studenti dohrávají.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-center">
      <div className="eyebrow">{label}</div>
      <div className="font-display text-xl font-bold text-brand-charcoal tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

function Empty({ children, embedded }: { children: React.ReactNode; embedded?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center text-center text-sm text-brand-slate ${
        embedded ? 'p-10' : 'bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10'
      }`}
    >
      <TapirMark className="w-14 h-14 text-brand-teal/30 mb-3" />
      {children}
    </div>
  );
}
