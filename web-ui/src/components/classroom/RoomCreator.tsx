import { useState } from 'react';
import QRCode from 'qrcode';
import { AppMode } from '@tapir/core';
import { createRoom } from '../../lib/classroom';
import { isClassroomEnabled } from '../../lib/supabase';
import { gameLink, navigate, type Screen } from '../../lib/route';
import type { ClassroomGameId } from '../../lib/scoring-shared';
import { IconCopy } from '../brand/BrandIcons';

const GAMES: { id: ClassroomGameId; screen: Screen; label: string }[] = [
  { id: 'osacka', screen: AppMode.OsackaHorecka, label: 'Ósacká horečka' },
  { id: 'oyster-bay', screen: AppMode.TyfovaMary, label: 'Záhada z Oyster Bay' },
];

export default function RoomCreator({ teacherName }: { teacherName?: string }) {
  const [gameId, setGameId] = useState<ClassroomGameId>('osacka');
  const [room, setRoom] = useState<{ code: string; screen: Screen } | null>(null);
  const [qr, setQr] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isClassroomEnabled) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 text-sm text-brand-slate">
        Třídní leaderboard není v této instanci nakonfigurovaný.
      </div>
    );
  }

  const studentLink = room ? gameLink({ screen: room.screen, roomCode: room.code }) : '';

  const create = async () => {
    setBusy(true);
    setErr('');
    const screen = GAMES.find((g) => g.id === gameId)!.screen;
    const res = await createRoom(gameId, teacherName);
    if ('error' in res) {
      setErr(res.error);
      setBusy(false);
      return;
    }
    const link = gameLink({ screen, roomCode: res.code });
    setRoom({ code: res.code, screen });
    try {
      setQr(await QRCode.toString(link, { type: 'svg', margin: 1, width: 220 }));
    } catch {
      setQr('');
    }
    setBusy(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(studentLink).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
      <div className="eyebrow mb-2">Spustit hru pro třídu</div>

      {!room ? (
        <>
          <p className="text-sm text-brand-slate mb-3">
            Vyber hru. Vznikne místnost s kódem — studenti hrají přes odkaz a jejich výsledky se
            živě sčítají v žebříčku.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {GAMES.map((g) => (
              <button
                key={g.id}
                onClick={() => setGameId(g.id)}
                className={`min-h-[44px] px-4 rounded-xl text-sm font-semibold border-2 transition-colors ${
                  gameId === g.id
                    ? 'border-brand-teal bg-brand-teal-soft text-brand-teal-dark'
                    : 'border-gray-200 text-brand-slate hover:border-gray-300'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <button
            onClick={create}
            disabled={busy}
            className="min-h-[44px] px-6 rounded-xl bg-brand-teal text-white text-sm font-bold hover:bg-brand-teal-dark transition-colors disabled:opacity-50"
          >
            {busy ? 'Vytvářím…' : 'Vytvořit místnost'}
          </button>
          {err && <p className="text-xs text-brand-red mt-2">{err}</p>}
        </>
      ) : (
        <div className="grid md:grid-cols-[220px_1fr] gap-5 items-start">
          {qr && (
            <div
              className="bg-white border border-gray-200 rounded-xl p-2 [&_svg]:w-full [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: qr }}
              aria-label="QR kód odkazu pro studenty"
            />
          )}
          <div className="space-y-3">
            <div>
              <div className="eyebrow">Kód místnosti</div>
              <div className="font-display text-3xl font-bold text-brand-charcoal tracking-wide">
                {room.code}
              </div>
            </div>
            <div>
              <div className="eyebrow mb-1">Odkaz pro studenty</div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={studentLink}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 min-h-[44px] text-xs font-mono text-brand-slate"
                />
                <button
                  onClick={copyLink}
                  className="min-h-[44px] px-4 rounded-lg bg-brand-charcoal text-white text-sm font-bold hover:bg-brand-charcoal/90 transition-colors inline-flex items-center gap-1.5"
                >
                  <IconCopy className="w-4 h-4" />
                  {copied ? 'Zkopírováno' : 'Kopírovat'}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => navigate({ screen: 'leaderboard', roomCode: room.code })}
                className="min-h-[44px] px-5 rounded-xl bg-brand-teal text-white text-sm font-bold hover:bg-brand-teal-dark transition-colors"
              >
                Otevřít žebříček
              </button>
              <button
                onClick={() => {
                  setRoom(null);
                  setQr('');
                }}
                className="min-h-[44px] px-4 text-sm text-brand-slate hover:text-brand-charcoal"
              >
                Nová místnost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
