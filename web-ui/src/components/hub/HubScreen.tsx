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

type Accent = 'red' | 'teal' | 'mustard' | 'charcoal';

interface Tile {
  screen: Screen;
  title: string;
  desc: string;
  meta: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  accent: Accent;
}

const ACCENT: Record<Accent, { chip: string; ring: string }> = {
  red: { chip: 'bg-brand-red-soft text-brand-red', ring: 'hover:border-brand-red/50' },
  teal: { chip: 'bg-brand-teal-soft text-brand-teal-dark', ring: 'hover:border-brand-teal/50' },
  mustard: { chip: 'bg-brand-mustard-soft text-brand-mustard', ring: 'hover:border-brand-mustard/60' },
  charcoal: { chip: 'bg-brand-charcoal/10 text-brand-charcoal', ring: 'hover:border-brand-charcoal/40' },
};

const GAMES: Tile[] = [
  {
    screen: AppMode.CrisisStaff,
    title: 'Krizový štáb',
    desc: 'Řiďte epidemii v roli hlavního hygienika. Rozhodujte o opatřeních, čelte politickým tlakům a důvěře veřejnosti.',
    meta: '20–45 min · tahová hra',
    Icon: IconCrisisStaff,
    accent: 'red',
  },
  {
    screen: AppMode.OsackaHorecka,
    title: 'Ósacká horečka',
    desc: 'Telefonní trasování kontaktů. Najděte nakažené, odhalte superspreader události a sestavte epidemickou křivku.',
    meta: '15–30 min · detektivní',
    Icon: IconOsacka,
    accent: 'teal',
  },
  {
    screen: AppMode.TyfovaMary,
    title: 'Záhada z Oyster Bay',
    desc: 'Historická detektivka z roku 1906. Prozkoumejte dokumenty a odhalte zdroj záhadné epidemie břišního tyfu.',
    meta: '15–25 min · vyšetřování',
    Icon: IconOysterBay,
    accent: 'mustard',
  },
];

const LEARN: Tile[] = [
  {
    screen: AppMode.Handbook,
    title: 'Příručka epidemiologa',
    desc: 'Interaktivní školení: přenos virů, SEIR modely, opatření, trasování a krizové řízení.',
    meta: '7 kapitol · samostudium',
    Icon: IconHandbook,
    accent: 'charcoal',
  },
  {
    screen: AppMode.Expert,
    title: 'Odborný režim',
    desc: 'Parametrický sandbox: R₀, kontaktní matice, NPI, vakcinace a varianty s vizualizací SEIRV.',
    meta: 'pokročilé · simulátor',
    Icon: IconSandbox,
    accent: 'teal',
  },
];

function TileCard({ tile }: { tile: Tile }) {
  const a = ACCENT[tile.accent];
  return (
    <button
      onClick={() => navigate({ screen: tile.screen })}
      className={`group flex flex-col items-start text-left bg-white border-2 border-gray-200 rounded-2xl p-5 min-h-[180px] transition-all hover:shadow-lg active:scale-[0.99] ${a.ring}`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${a.chip}`}>
        <tile.Icon className="w-7 h-7" />
      </div>
      <h3 className="font-display text-lg font-bold text-brand-charcoal">{tile.title}</h3>
      <p className="text-sm text-brand-slate mt-1.5 leading-snug flex-1">{tile.desc}</p>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mt-3">
        {tile.meta}
      </span>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-brand-slate">{children}</h2>
      <div className="flex-1 h-px bg-gray-300/70" />
    </div>
  );
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
        <header className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-3 text-brand-teal">
            <TapirMark className="w-11 h-11" />
            <span className="font-display text-2xl md:text-3xl font-bold text-brand-charcoal">
              Nedovařený tapír
            </span>
          </div>
          <p className="text-sm text-brand-slate mt-3 max-w-xl mx-auto">
            Hravá výuka epidemiologie a krizového řízení. Vyber si aktivitu a pusť se do toho.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-gray-400">
            <span className="bg-brand-red-soft text-brand-red font-semibold px-2 py-0.5 rounded">
              SIMULACE
            </span>
            <span>v{VERSION} · edukační model, ne klinická predikce</span>
          </div>
        </header>

        {/* Hry pro třídu */}
        <section className="mb-10">
          <SectionLabel>Hry pro třídu</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((t) => (
              <TileCard key={t.title} tile={t} />
            ))}
          </div>
        </section>

        {/* Učení */}
        <section className="mb-10">
          <SectionLabel>Učení</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            {LEARN.map((t) => (
              <TileCard key={t.title} tile={t} />
            ))}
          </div>
        </section>

        {/* Pro učitele */}
        <section>
          <SectionLabel>Pro učitele</SectionLabel>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            {!showTeacher ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-charcoal/10 text-brand-charcoal flex-shrink-0">
                  <IconTeacher className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold text-brand-charcoal">Učitelský režim</h3>
                  <p className="text-sm text-brand-slate mt-1">
                    Sestavte vlastní scénář a vygenerujte odkaz pro třídu.
                  </p>
                </div>
                <button
                  onClick={() => setShowTeacher(true)}
                  className="min-h-[44px] px-5 rounded-xl bg-brand-charcoal text-white text-sm font-semibold hover:bg-brand-charcoal/90 transition-colors flex-shrink-0"
                >
                  Přihlásit učitele
                </button>
              </div>
            ) : (
              <div className="max-w-sm space-y-3">
                <p className="text-[11px] text-gray-400">
                  Demo přístup: <code className="text-brand-slate">ucitel / tapir123</code>
                </p>
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
                    className="flex-1 min-h-[44px] rounded-lg bg-brand-teal text-white text-sm font-semibold hover:bg-brand-teal-dark transition-colors"
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
        </section>
      </div>
    </div>
  );
}
