import { useState } from 'react';
import { navigate } from '../../lib/route';
import HomeButton from '../HomeButton';
import { IconHandbook } from '../brand/BrandIcons';
import { HANDBOOK, type HandbookLevel, type Block, type Reference } from '../../data/handbook/content';

const LEVELS: { id: HandbookLevel; title: string; sub: string; desc: string }[] = [
  { id: 'zs', title: 'Základní škola', sub: 'Jednoduše a názorně', desc: 'Základní pojmy s příklady z běžného života, bez vzorců. Pro 8.–9. třídu.' },
  { id: 'ss', title: 'Střední škola', sub: 'Standardní úroveň', desc: 'Souvislosti, jednoduché modely (SEIR, R₀, Rₑff) a praktické dopady opatření.' },
  { id: 'vs', title: 'Vysoká škola', sub: 'Lékařská fakulta', desc: 'Do hloubky — kompartmentové modely, parametry přenosu, s odkazy na literaturu.' },
];

export const LEVEL_LABEL: Record<HandbookLevel, string> = {
  zs: 'ZŠ',
  ss: 'SŠ',
  vs: 'VŠ — lékařská fakulta',
};

const LEVEL_INTRO: Record<HandbookLevel, string> = {
  zs: 'Verze pro základní školu — vysvětlujeme jednoduše, na příkladech z běžného života a bez vzorců.',
  ss: 'Verze pro střední školu — souvislosti, jednoduché modely (SEIR, R₀, Rₑff) a praktické dopady opatření.',
  vs: 'Verze pro vysokou školu (úroveň lékařské fakulty) — kompartmentové modely do hloubky; v textu jsou ověřené odkazy na literaturu (s DOI).',
};

function LevelSelect({ onPick }: { onPick: (l: HandbookLevel) => void }) {
  return (
    <div className="min-h-screen brand-grid-bg">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <HomeButton className="-ml-2" />
          <div className="eyebrow">Příručka epidemiologa</div>
        </div>
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-teal-soft text-brand-teal-dark mb-3">
            <IconHandbook className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl font-bold text-brand-charcoal">Vyberte úroveň</h1>
          <p className="mt-2 text-sm text-brand-slate">
            Stejná témata, tři úrovně výkladu — text a důraz se přizpůsobí. Úroveň lze kdykoli změnit.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => onPick(l.id)}
              className="flex flex-col items-center text-center bg-white border-2 border-gray-200 rounded-2xl p-5 gap-2 transition-all hover:border-brand-teal/40 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="eyebrow text-brand-teal">{l.sub}</div>
              <h2 className="font-display text-lg font-bold text-brand-charcoal">{l.title}</h2>
              <p className="text-xs text-brand-slate leading-snug flex-1">{l.desc}</p>
              <span className="w-full min-h-[44px] inline-flex items-center justify-center rounded-xl bg-brand-teal text-white text-sm font-bold">
                Začít
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LevelBanner({ level }: { level: HandbookLevel }) {
  return (
    <div className="bg-brand-teal-soft border-l-4 border-brand-teal p-3 md:p-4 rounded-r-lg mb-5">
      <div className="text-[11px] font-black text-brand-teal-dark uppercase tracking-wide mb-0.5">
        Úroveň: {LEVEL_LABEL[level]}
      </div>
      <div className="text-sm text-brand-teal-dark leading-relaxed">{LEVEL_INTRO[level]}</div>
    </div>
  );
}

function ReferencesBox({ items }: { items: Reference[] }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 my-4">
      <div className="text-xs font-black text-brand-charcoal uppercase tracking-wide mb-2">Pro hlubší studium</div>
      <ul className="space-y-2 text-xs text-gray-600">
        {items.map((r) => (
          <li key={r.doi} className="leading-relaxed">
            {r.authors} ({r.year}). <em>{r.title}.</em> {r.journal}.{' '}
            <a
              href={`https://doi.org/${r.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-teal-dark font-semibold underline break-all"
            >
              doi:{r.doi}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-gray-400 mt-2">Reference dohledány v databázi PubMed.</p>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.t) {
    case 'h':
      return <h3 className="text-lg font-bold mt-6 mb-2 text-gray-900">{block.text}</h3>;
    case 'p':
      return <p className="text-gray-700 leading-relaxed my-3" dangerouslySetInnerHTML={{ __html: block.html }} />;
    case 'list':
      return (
        <ul className="space-y-2 text-sm text-gray-700 my-3 list-disc list-inside">
          {block.items.map((it, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: it }} />
          ))}
        </ul>
      );
    case 'info':
      return (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg my-4">
          <div className="text-xs font-black text-blue-700 uppercase mb-1" dangerouslySetInnerHTML={{ __html: block.title }} />
          <div className="text-sm text-blue-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.html }} />
        </div>
      );
    case 'warn':
      return (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-4">
          <div className="text-xs font-black text-amber-700 uppercase mb-1" dangerouslySetInnerHTML={{ __html: block.title }} />
          <div className="text-sm text-amber-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.html }} />
        </div>
      );
    case 'diagram':
      return (
        <div
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 my-4 font-mono text-xs text-center leading-relaxed"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    case 'html':
      return <div className="my-4 text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.html }} />;
    case 'gloss':
      return (
        <div className="bg-brand-teal-soft/40 border border-brand-teal/25 rounded-xl p-4 my-5">
          <div className="text-xs font-black text-brand-teal-dark uppercase tracking-wide mb-3">Vysvětlivky pojmů</div>
          <dl className="space-y-2 text-sm">
            {block.items.map((g) => (
              <div key={g.term} className="leading-relaxed">
                <dt className="inline font-bold text-brand-charcoal">{g.term}</dt>
                <dd className="inline text-gray-700" dangerouslySetInnerHTML={{ __html: ' — ' + g.def }} />
              </div>
            ))}
          </dl>
        </div>
      );
    case 'exercise':
      return (
        <div className="bg-brand-mustard-soft border-2 border-brand-mustard/50 rounded-xl p-4 md:p-5 my-5">
          <div className="text-xs font-black text-brand-mustard-dark uppercase tracking-wide mb-2">
            ✎ {block.title}
          </div>
          <div className="text-sm text-brand-charcoal leading-relaxed [&_strong]:text-brand-charcoal [&_ul]:mt-2 [&_ul]:space-y-1 [&_ul]:list-disc [&_ul]:list-inside [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-1" dangerouslySetInnerHTML={{ __html: block.html }} />
        </div>
      );
    case 'refs':
      return <ReferencesBox items={block.items} />;
  }
}

export default function EpidemiologistHandbook() {
  const [activeId, setActiveId] = useState<(typeof HANDBOOK)[number]['id']>('intro');
  const [level, setLevel] = useState<HandbookLevel | null>(null);

  if (!level) return <LevelSelect onPick={setLevel} />;

  const active = HANDBOOK.find((c) => c.id === activeId) ?? HANDBOOK[0];
  const blocks = active.content[level];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button onClick={() => navigate({ screen: 'hub' })} className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0">
              ← Zpět
            </button>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-black text-gray-900 truncate">Příručka epidemiologa</h1>
              <p className="text-[10px] md:text-xs text-gray-500 hidden sm:block">Školení pro krizový štáb — tři úrovně náročnosti</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-brand-teal-soft text-brand-teal-dark text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded">
              {LEVEL_LABEL[level]}
            </span>
            <button onClick={() => setLevel(null)} className="text-xs text-gray-400 hover:text-gray-600">
              Změnit úroveň
            </button>
          </div>
        </div>
      </div>

      {/* Mobile section navigation */}
      <div className="md:hidden overflow-x-auto border-b border-gray-200 bg-white">
        <div className="flex px-2 gap-1 py-2 min-w-max">
          {HANDBOOK.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`px-3 min-h-[40px] rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeId === s.id ? 'bg-brand-teal text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6 md:flex gap-6">
        {/* Sidebar navigation (desktop) */}
        <nav className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-6 space-y-1">
            {HANDBOOK.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                  activeId === s.id ? 'bg-brand-teal text-white font-bold shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
            <LevelBanner level={level} />
            <h2 className="text-2xl font-black text-gray-900 mb-4">{active.title}</h2>
            {blocks.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
