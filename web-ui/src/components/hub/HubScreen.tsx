import { AppMode, VERSION } from '@tapir/core';
import { navigate, type Screen } from '../../lib/route';
import {
  TapirMark,
  IconCrisisStaff,
  IconOsacka,
  IconOysterBay,
  IconHandbook,
} from '../brand/BrandIcons';

interface Tile {
  screen: Screen;
  title: string;
  desc: string;
  meta: string;
  cta: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  chip: string;
  border: string;
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
            <span>v {VERSION} · edukační model pro výuku epidemiologie, nikoliv klinická predikce</span>
          </div>
        </header>

        {/* Featured: Příručka epidemiologa (na úvod jako první) */}
        <SectionLabel>Začněte tady</SectionLabel>
        <button
          onClick={() => navigate({ screen: AppMode.Handbook })}
          className="group w-full flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 bg-white border-2 border-brand-teal/40 rounded-2xl p-5 md:p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-teal-soft text-brand-teal-dark flex-shrink-0">
            <IconHandbook className="w-9 h-9" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-brand-charcoal">Příručka epidemiologa</h2>
            <p className="text-sm text-brand-slate mt-1">
              Interaktivní školení o přenosu, SEIR modelech, trasování a krizovém řízení — ve třech
              úrovních (ZŠ · SŠ · VŠ). Ideální start před hrami.
            </p>
          </div>
          <span className="min-h-[44px] px-6 inline-flex items-center justify-center rounded-xl bg-brand-teal text-white text-sm font-bold group-hover:bg-brand-teal-dark transition-colors flex-shrink-0">
            Otevřít příručku
          </span>
        </button>

        {/* Hry pro třídu */}
        <SectionLabel>Hry pro třídu</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((t) => (
            <TileCard key={t.title} tile={t} />
          ))}
        </div>

        {/* Pokročilé / pro učitele */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate({ screen: 'admin' })}
            className="text-sm font-semibold text-brand-slate hover:text-brand-charcoal transition-colors min-h-[44px] px-4"
          >
            Pro učitele a pokročilé →
          </button>
        </div>
      </div>
    </div>
  );
}
