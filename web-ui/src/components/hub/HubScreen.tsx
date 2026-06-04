import { useState } from 'react';
import { AppMode, VERSION } from '@tapir/core';
import { verifyTeacher } from '../../lib/classroom-db';
import { useAppStore } from '../../store/useAppStore';
import { navigate, type Screen } from '../../lib/route';
import {
  TapirMark,
  IconCrisisStaff,
  IconOsacka,
  IconOysterBay,
  IconHandbook,
  IconSandbox,
  IconTeacher,
} from '../brand/BrandIcons';

interface Tile {
  screen: Screen;
  title: string;
  desc: string;
  meta: string;
  cta: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  /** soft chip background + icon color */
  chip: string;
  /** tile border tint */
  border: string;
  /** solid CTA button classes */
  btn: string;
}

const GAMES: Tile[] = [
  {
    screen: AppMode.CrisisStaff,
    title: 'Krizový štáb',
    desc: 'Řiďte epidemii, rozhodujte o 35 opatřeních, čelte politickým tlakům.',
    meta: '30–45 min · Pokročilé',
    cta: 'Krizový štáb — vstup',
    Icon: IconCrisisStaff,
    chip: 'bg-brand-red-soft text-brand-red',
    border: 'border-brand-red/30',
    btn: 'bg-brand-red text-white hover:bg-brand-red-dark',
  },
  {
    screen: AppMode.OsackaHorecka,
    title: 'Ósacká horečka',
    desc: 'Telefonní trasování kontaktů ve Springfieldu. Najděte ohniska nákazy.',
    meta: '20 min · Střední',
    cta: 'Hrát',
    Icon: IconOsacka,
    chip: 'bg-brand-teal-soft text-brand-teal-dark',
    border: 'border-brand-teal/30',
    btn: 'bg-brand-teal text-white hover:bg-brand-teal-dark',
  },
  {
    screen: AppMode.TyfovaMary,
    title: 'Záhada z Oyster Bay',
    desc: 'Historická detektivka z roku 1906 — vyšetřování epidemie tyfu.',
    meta: '25 min · Střední',
    cta: 'Hrát',
    Icon: IconOysterBay,
    chip: 'bg-brand-mustard-soft text-brand-mustard-dark',
    border: 'border-brand-mustard/40',
    btn: 'bg-brand-mustard text-brand-charcoal hover:bg-brand-mustard-dark',
  },
];

const LEARN: Tile[] = [
  {
    screen: AppMode.Handbook,
    title: 'Příručka epidemiologa',
    desc: '7 kapitol o přenosu, SEIR modelech, trasování a krizovém řízení.',
    meta: 'Samostudium',
    cta: 'Otevřít',
    Icon: IconHandbook,
    chip: 'bg-brand-teal-soft text-brand-teal-dark',
    border: 'border-gray-200',
    btn: 'bg-brand-teal text-white hover:bg-brand-teal-dark',
  },
  {
    screen: AppMode.Expert,
    title: 'Odborný režim',
    desc: 'Parametrický SEIRV sandbox — R₀, kontaktní matice, NPI, varianty.',
    meta: 'Sandbox',
    cta: 'Otevřít',
    Icon: IconSandbox,
    chip: 'bg-brand-charcoal/10 text-brand-charcoal',
    border: 'border-gray-200',
    btn: 'bg-brand-charcoal text-white hover:bg-brand-charcoal/90',
  },
];

function TileCard({ tile }: { tile: Tile }) {
  return (
    <div
      className={`flex flex-col items-center text-center bg-white border-2 ${tile.border} rounded-2xl p-5 gap-2.5 transition-all hover:shadow-lg hover:-translate-y-0.5`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${tile.chip}`}>
        <tile.Icon className="w-7 h-7" />
      </div>
      <h2 className="font-display text-base font-bold text-brand-charcoal">{tile.title}</h2>
      <p className="text-xs text-brand-slate leading-snug flex-1">{tile.desc}</p>
      <div className="eyebrow !tracking-wider text-gray-400">{tile.meta}</div>
      <button
        onClick={() => navigate({ screen: tile.screen })}
        className={`w-full min-h-[44px] rounded-xl font-bold text-sm transition-colors active:scale-[0.98] ${tile.btn}`}
      >
        {tile.cta}
      </button>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow text-center my-6">{children}</div>;
}

export default function HubScreen() {
  const { setAuth } = useAppStore();
  const [showTeacher, setShowTeacher] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTeacherLogin = () => {
    if (!verifyTeacher(username.trim(), password)) {
      setError('Neplatné učitelské přihlášení.');
      return;
    }
    setAuth({ role: 'teacher', username: username.trim(), classId: null });
    setError(null);
    navigate({ screen: AppMode.Instructor });
  };

  return (
    <div className="min-h-screen brand-grid-bg">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Brand header */}
        <header className="text-center mb-2">
          <div className="inline-flex items-center gap-3 text-brand-teal">
            <TapirMark className="w-11 h-11" />
            <span className="font-display text-3xl font-bold text-brand-charcoal">
              Nedovařený tapír
            </span>
          </div>
          <p className="text-sm text-brand-slate mt-3">
            Epidemiologická simulace a krizové řízení pro třídu
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-gray-400">
            <span className="bg-brand-red-soft text-brand-red font-semibold px-2 py-0.5 rounded">
              SIMULACE
            </span>
            <span>v{VERSION} · edukační model, ne klinická predikce</span>
          </div>
        </header>

        {/* Hry pro třídu */}
        <SectionLabel>Hry pro třídu</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((t) => (
            <TileCard key={t.title} tile={t} />
          ))}
        </div>

        {/* Učení */}
        <SectionLabel>Učení</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          {LEARN.map((t) => (
            <TileCard key={t.title} tile={t} />
          ))}
        </div>

        {/* Pro učitele */}
        <SectionLabel>Pro učitele</SectionLabel>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
          {!showTeacher ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-charcoal/10 text-brand-charcoal flex-shrink-0">
                <IconTeacher className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-bold text-brand-charcoal">Učitelský režim</h3>
                <p className="text-xs text-brand-slate mt-1">
                  Tvorba scénářů a generování odkazů pro třídu.{' '}
                  <span className="font-mono text-[11px] text-gray-400">Demo: ucitel / tapir123</span>
                </p>
              </div>
              <button
                onClick={() => setShowTeacher(true)}
                className="min-h-[44px] px-5 rounded-xl bg-brand-charcoal text-white text-sm font-bold hover:bg-brand-charcoal/90 transition-colors flex-shrink-0"
              >
                Učitelský režim
              </button>
            </div>
          ) : (
            <div className="max-w-sm space-y-3">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Uživatelské jméno"
                className="w-full border border-gray-300 rounded-lg px-3 min-h-[44px] text-sm focus:ring-2 focus:ring-brand-teal outline-none"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTeacherLogin()}
                placeholder="Heslo"
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 min-h-[44px] text-sm focus:ring-2 focus:ring-brand-teal outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleTeacherLogin}
                  className="flex-1 min-h-[44px] rounded-lg bg-brand-teal text-white text-sm font-bold hover:bg-brand-teal-dark transition-colors"
                >
                  Přihlásit
                </button>
                <button
                  onClick={() => {
                    setShowTeacher(false);
                    setError(null);
                  }}
                  className="min-h-[44px] px-4 text-sm text-brand-slate hover:text-brand-charcoal"
                >
                  Zpět
                </button>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-brand-red-soft text-brand-red px-4 py-2 rounded-lg text-sm text-center mt-3">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
