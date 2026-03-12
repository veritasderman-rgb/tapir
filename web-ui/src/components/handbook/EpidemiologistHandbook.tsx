import { useState } from 'react';
import { AppMode } from '@tapir/core';
import { useAppStore } from '../../store/useAppStore';

type Section = 'intro' | 'sireni' | 'modely' | 'opatreni' | 'trasovani' | 'krizove' | 'pribeh';

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: 'intro', label: 'Úvod', icon: '📖' },
  { id: 'sireni', label: 'Jak se šíří virus', icon: '🦠' },
  { id: 'modely', label: 'Epidemiologické modely', icon: '📊' },
  { id: 'opatreni', label: 'Opatření a intervence', icon: '🛡️' },
  { id: 'trasovani', label: 'Trasování kontaktů', icon: '🔍' },
  { id: 'krizove', label: 'Krizové řízení', icon: '🏛️' },
  { id: 'pribeh', label: 'Příběh: Dr. Kovářová', icon: '📕' },
];

export default function EpidemiologistHandbook() {
  const [activeSection, setActiveSection] = useState<Section>('intro');
  const { setAppMode, setAuth } = useAppStore();

  const handleBack = () => {
    setAuth({ role: null, username: null, classId: null });
    setAppMode(AppMode.Expert);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0">
              ← Zpět
            </button>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-black text-gray-900 truncate">Příručka epidemiologa</h1>
              <p className="text-[10px] md:text-xs text-gray-500 hidden sm:block">Školení pro krizový štáb — zjednodušený přehled klíčových konceptů</p>
            </div>
          </div>
          <div className="hidden md:block text-xs text-gray-400 italic flex-shrink-0">Nedovařený tapír — vzdělávací materiály</div>
        </div>
      </div>

      {/* Mobile section navigation (horizontal scroll) */}
      <div className="md:hidden overflow-x-auto border-b border-gray-200 bg-white">
        <div className="flex px-2 gap-1 py-2 min-w-max">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeSection === s.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6 md:flex gap-6">
        {/* Sidebar navigation (desktop only) */}
        <nav className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-6 space-y-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                  activeSection === s.id
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 prose prose-sm max-w-none">
            {activeSection === 'intro' && <IntroSection />}
            {activeSection === 'sireni' && <SireniSection />}
            {activeSection === 'modely' && <ModelySection />}
            {activeSection === 'opatreni' && <OpatreniSection />}
            {activeSection === 'trasovani' && <TrasovaniSection />}
            {activeSection === 'krizove' && <KrizoveSection />}
            {activeSection === 'pribeh' && <PribehSection />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════════════════

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg my-4">
      <div className="text-xs font-black text-blue-700 uppercase mb-1">{title}</div>
      <div className="text-sm text-blue-900 leading-relaxed">{children}</div>
    </div>
  );
}

function WarningBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-4">
      <div className="text-xs font-black text-amber-700 uppercase mb-1">{title}</div>
      <div className="text-sm text-amber-900 leading-relaxed">{children}</div>
    </div>
  );
}

function Diagram({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 my-4 font-mono text-xs text-center leading-relaxed">
      {children}
    </div>
  );
}

// ── INTRO ──

function IntroSection() {
  return (
    <>
      <h2 className="text-2xl font-black text-gray-900 mb-4">Vítejte v Příručce epidemiologa</h2>

      <p className="text-gray-700 leading-relaxed">
        Tato příručka je určena pro účastníky simulace <strong>Krizový štáb</strong> a dalších
        epidemiologických her v platformě Nedovařený tapír. Jejím cílem není nahradit odborné
        vzdělání, ale představit <strong>základní principy</strong>, ze kterých vychází naše modely.
      </p>

      <WarningBox title="Důležité upozornění">
        Naše modely jsou <strong>zjednodušenou verzí reality</strong>. Jejich cílem je představit
        podstatu epidemiologických procesů, nikoliv aktivně simulovat komplexní realitu. Skutečné
        epidemie jsou ovlivněny stovkami faktorů, které zde nezohledňujeme — od genetické variability
        viru po kulturní zvyklosti populace.
      </WarningBox>

      <h3 className="text-lg font-bold mt-6">Co se naučíte</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        <li><strong>Jak se šíří virus</strong> — základy přenosu infekčních onemocnění</li>
        <li><strong>Epidemiologické modely</strong> — co je SEIR model, R₀, R<sub>eff</sub></li>
        <li><strong>Opatření a intervence</strong> — jak různá opatření ovlivňují šíření</li>
        <li><strong>Trasování kontaktů</strong> — jak funguje a proč je důležité</li>
        <li><strong>Krizové řízení</strong> — politické, ekonomické a sociální aspekty</li>
      </ul>

      <h3 className="text-lg font-bold mt-6">Pro koho je příručka určena</h3>
      <p className="text-gray-700">
        Středoškolští a vysokoškolští studenti, učitelé připravující výukové scénáře, a kdokoli se
        zájmem o pochopení mechanismů epidemií. Nepředpokládáme žádné předchozí znalosti epidemiologie.
      </p>
    </>
  );
}

// ── JAK SE ŠÍŘÍ VIRUS ──

function SireniSection() {
  return (
    <>
      <h2 className="text-2xl font-black text-gray-900 mb-4">Jak se šíří virus</h2>

      <h3 className="text-lg font-bold">Základní řetězec přenosu</h3>
      <p className="text-gray-700 leading-relaxed">
        Každé infekční onemocnění potřebuje k přežití <strong>řetězec přenosu</strong>:
        nakažený člověk → způsob přenosu → vnímavý člověk. Přerušení tohoto řetězce
        je základním principem všech epidemiologických opatření.
      </p>

      <Diagram>
        <div className="space-y-1">
          <div>Nakažený (I) → [kontakt] → Vnímavý (S) → Nakažený (I)</div>
          <div className="text-gray-400 mt-2">Bez přerušení řetězce se epidemie šíří exponenciálně</div>
        </div>
      </Diagram>

      <h3 className="text-lg font-bold mt-6">Způsoby přenosu</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        <li><strong>Kapénkový přenos</strong> — kašel, kýchání, mluvení. Kapénky doletí 1-2 metry a spadnou. Většina respiračních infekcí.</li>
        <li><strong>Aerosolový přenos</strong> — mikroskopické částice visí ve vzduchu minuty až hodiny. Proto je důležité větrání a respirátory.</li>
        <li><strong>Kontaktní přenos</strong> — dotek kontaminovaného povrchu, podání ruky. Proto mytí rukou.</li>
        <li><strong>Fekálně-orální</strong> — kontaminovaná voda/jídlo (cholera, tyfus). Historicky nejčastější příčina epidemií.</li>
      </ul>

      <h3 className="text-lg font-bold mt-6">Reprodukční číslo R₀</h3>
      <p className="text-gray-700 leading-relaxed">
        <strong>R₀</strong> (R nula) je průměrný počet lidí, které jeden nakažený nakazí
        v plně vnímavé populaci (tj. nikdo nemá imunitu a nejsou žádná opatření).
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {[
          { name: 'Chřipka', r0: '1.2–2.0' },
          { name: 'COVID-19', r0: '2.5–3.5' },
          { name: 'Spalničky', r0: '12–18' },
          { name: 'Ebola', r0: '1.5–2.5' },
        ].map(d => (
          <div key={d.name} className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">{d.name}</div>
            <div className="text-lg font-black text-gray-900">{d.r0}</div>
          </div>
        ))}
      </div>

      <InfoBox title="R₀ vs Reff">
        R₀ je <em>teoretická</em> hodnota pro plně vnímavou populaci. V praxi sledujeme
        <strong> R<sub>eff</sub></strong> (efektivní reprodukční číslo), které zohledňuje imunitu
        populace a účinek opatření. Cíl krizového řízení: dostat R<sub>eff</sub> pod 1.
      </InfoBox>

      <h3 className="text-lg font-bold mt-6">Exponenciální růst</h3>
      <p className="text-gray-700 leading-relaxed">
        Když R &gt; 1, počet nakažených roste <strong>exponenciálně</strong>. To znamená,
        že se zdvojnásobuje v pravidelných intervalech. Při R = 2 a generačním čase 5 dní:
      </p>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="grid grid-cols-6 gap-2 text-center text-xs">
          {['Den 0', 'Den 5', 'Den 10', 'Den 15', 'Den 20', 'Den 25'].map((d, i) => (
            <div key={d}>
              <div className="text-gray-500">{d}</div>
              <div className="text-lg font-black text-red-600">{Math.pow(2, i)}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-red-700 mt-2 text-center">
          Z 1 nakaženého na 32 za 25 dní. Po 50 dnech: 1 024. Po 100 dnech: 1 048 576.
        </p>
      </div>

      <h3 className="text-lg font-bold mt-6">Kontaktní matice</h3>
      <p className="text-gray-700 leading-relaxed">
        Lidé se nesetkávají náhodně. Děti mají nejvíce kontaktů ve škole, dospělí v práci,
        senioři v komunitě. Toto zachycuje <strong>kontaktní matice</strong> — tabulka, která
        ukazuje průměrný počet kontaktů mezi věkovými skupinami v různých prostředích.
      </p>

      <Diagram>
        <div className="inline-block text-left">
          <div className="mb-2 font-bold not-italic">Kontakty/den (zjednodušeno):</div>
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="px-3 py-1 border border-gray-300 bg-gray-100"></th>
                <th className="px-3 py-1 border border-gray-300 bg-gray-100">Děti</th>
                <th className="px-3 py-1 border border-gray-300 bg-gray-100">Dospělí</th>
                <th className="px-3 py-1 border border-gray-300 bg-gray-100">Senioři</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-1 border border-gray-300 bg-gray-100 font-bold">Děti</td>
                <td className="px-3 py-1 border border-gray-300 text-center">8 (škola)</td>
                <td className="px-3 py-1 border border-gray-300 text-center">3 (doma)</td>
                <td className="px-3 py-1 border border-gray-300 text-center">1</td>
              </tr>
              <tr>
                <td className="px-3 py-1 border border-gray-300 bg-gray-100 font-bold">Dospělí</td>
                <td className="px-3 py-1 border border-gray-300 text-center">3 (doma)</td>
                <td className="px-3 py-1 border border-gray-300 text-center">6 (práce)</td>
                <td className="px-3 py-1 border border-gray-300 text-center">2</td>
              </tr>
              <tr>
                <td className="px-3 py-1 border border-gray-300 bg-gray-100 font-bold">Senioři</td>
                <td className="px-3 py-1 border border-gray-300 text-center">1</td>
                <td className="px-3 py-1 border border-gray-300 text-center">2</td>
                <td className="px-3 py-1 border border-gray-300 text-center">3 (komunita)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Diagram>

      <p className="text-gray-700">
        Uzavření škol dramaticky sníží kontakty ve školní submatici (8 → ~2), ale neovlivní
        pracovní kontakty. Proto je důležité kombinovat opatření podle toho, kde virus cirkuluje.
      </p>
    </>
  );
}

// ── EPIDEMIOLOGICKÉ MODELY ──

function ModelySection() {
  return (
    <>
      <h2 className="text-2xl font-black text-gray-900 mb-4">Epidemiologické modely</h2>

      <p className="text-gray-700 leading-relaxed">
        Modely jsou <strong>zjednodušeným popisem reality</strong>. Nevysvětlují všechno,
        ale pomáhají pochopit klíčové mechanismy a předpovídat budoucí vývoj.
        Slavný statistik George Box řekl: <em>„Všechny modely jsou špatné, ale některé jsou užitečné."</em>
      </p>

      <h3 className="text-lg font-bold mt-6">SEIR model</h3>
      <p className="text-gray-700 leading-relaxed">
        Základ naší simulace. Populaci rozdělíme do 4 skupin (kompartmentů):
      </p>

      <Diagram>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-bold">S — Susceptible</span>
            <span className="text-gray-400">→</span>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg font-bold">E — Exposed</span>
            <span className="text-gray-400">→</span>
            <span className="bg-red-100 text-red-800 px-3 py-1.5 rounded-lg font-bold">I — Infectious</span>
            <span className="text-gray-400">→</span>
            <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg font-bold">R — Recovered</span>
          </div>
          <div className="text-gray-500 text-[10px] mt-3">
            Vnímavý → Nakažený (ještě nenakazí) → Infekční (nakažlivý) → Uzdravený/imunní
          </div>
        </div>
      </Diagram>

      <div className="space-y-3 my-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <span className="font-bold text-blue-800">S (Susceptible)</span>
          <span className="text-sm text-blue-700 ml-2">— vnímavý, může se nakazit. Na začátku epidemie = téměř celá populace.</span>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <span className="font-bold text-yellow-800">E (Exposed)</span>
          <span className="text-sm text-yellow-700 ml-2">— nakažený, ale ještě nenakazí ostatní. Inkubační doba (3-5 dní typicky).</span>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <span className="font-bold text-red-800">I (Infectious)</span>
          <span className="text-sm text-red-700 ml-2">— infekční, aktivně přenáší virus na vnímavé. Trvá typicky 5-10 dní.</span>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <span className="font-bold text-green-800">R (Recovered)</span>
          <span className="text-sm text-green-700 ml-2">— uzdravený (nebo zemřelý). Má imunitu — dočasnou nebo trvalou.</span>
        </div>
      </div>

      <h3 className="text-lg font-bold mt-6">Jak model počítá</h3>
      <p className="text-gray-700 leading-relaxed">
        Každý den model spočítá, kolik lidí se přesune mezi skupinami:
      </p>

      <ul className="space-y-2 text-sm text-gray-700">
        <li><strong>S → E:</strong> Závisí na počtu infekčních (I), kontaktech a přenosnosti viru (β). Více infekčních = více nových nákaz.</li>
        <li><strong>E → I:</strong> Závisí na inkubační době (σ = 1/doba inkubace). Typicky 1/5 exponovaných se stane infekčními za den.</li>
        <li><strong>I → R:</strong> Závisí na době infekčnosti (γ = 1/doba infekčnosti). Typicky 1/7 infekčních se uzdraví za den.</li>
      </ul>

      <InfoBox title="Klíčový vzorec">
        <strong>Síla infekce:</strong> λ = β × (kontakty) × (I / N)<br />
        Čím více infekčních lidí (I) a čím více kontaktů, tím rychleji se virus šíří.
        Opatření snižují buď β (roušky, hygiena) nebo kontakty (uzavření škol, lockdown).
      </InfoBox>

      <h3 className="text-lg font-bold mt-6">R<sub>eff</sub> a stádní imunita</h3>
      <p className="text-gray-700 leading-relaxed">
        Jak se lidé uzdravují, získávají imunitu. Tím klesá podíl vnímavých (S/N) a klesá R<sub>eff</sub>:
      </p>
      <Diagram>
        <div>R<sub>eff</sub> = R₀ × (S / N) × (efekt opatření)</div>
        <div className="text-gray-400 mt-2">Když R<sub>eff</sub> &lt; 1, epidemie ustupuje</div>
      </Diagram>

      <p className="text-gray-700">
        <strong>Stádní imunita</strong> nastane, když je dostatečně velká část populace imunní
        (přirozeně nebo očkováním), že virus nemá koho infikovat. Pro COVID-19 (R₀ ≈ 3) potřebujeme
        asi 67 % imunní populace. Pro spalničky (R₀ ≈ 15) až 93 %.
      </p>

      <h3 className="text-lg font-bold mt-6">Co model nezachycuje</h3>
      <WarningBox title="Omezení modelu">
        Náš model je <strong>deterministický a homogenní</strong>. Nezachycuje:
        superspreader eventy (10 % nakažených způsobí 80 % přenosů), heterogenitu kontaktů
        v rámci věkových skupin, prostorovou strukturu (město vs. vesnice), sezónní faktory,
        behaviorální změny v reakci na média, ani genetickou evoluci viru v reálném čase.
        Přesto dobře zachycuje <em>podstatu</em> — exponenciální dynamiku a účinek opatření.
      </WarningBox>
    </>
  );
}

// ── OPATŘENÍ A INTERVENCE ──

function OpatreniSection() {
  return (
    <>
      <h2 className="text-2xl font-black text-gray-900 mb-4">Opatření a intervence</h2>

      <p className="text-gray-700 leading-relaxed">
        Opatření (NPI — Non-Pharmaceutical Interventions) jsou nástroje, kterými můžete
        ovlivnit šíření viru <strong>bez vakcíny</strong>. Každé opatření má svou cenu —
        epidemiologickou účinnost, ekonomický dopad a politickou cenu.
      </p>

      <h3 className="text-lg font-bold mt-6">Jak opatření fungují v modelu</h3>
      <p className="text-gray-700">
        Opatření fungují dvěma mechanismy:
      </p>
      <div className="grid md:grid-cols-2 gap-4 my-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="font-bold text-blue-800 mb-2">Snížení přenosnosti (β)</div>
          <p className="text-xs text-blue-700">
            Roušky, respirátory, hygiena rukou, dezinfekce. Virus se přenáší méně efektivně
            při každém kontaktu. Kontakty zůstávají stejné, ale šance na přenos klesá.
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="font-bold text-emerald-800 mb-2">Snížení kontaktů</div>
          <p className="text-xs text-emerald-700">
            Uzavření škol, home-office, lockdown. Lidé se potkávají méně, virus má méně
            příležitostí se šířit. Silnější efekt, ale vyšší ekonomická a sociální cena.
          </p>
        </div>
      </div>

      <h3 className="text-lg font-bold mt-6">Přehled opatření</h3>

      <div className="space-y-4 my-4">
        <MeasureCard
          name="Roušky ve vnitřních prostorách"
          effect="Snížení přenosu ~15 %"
          cost="Nízká"
          desc="Levné, snadné, málo kontroverzní. Základ každé strategie. Chrání ostatní více než nositele."
        />
        <MeasureCard
          name="FFP2 respirátory"
          effect="Snížení přenosu ~30 %"
          cost="Střední"
          desc="Výrazně účinnější než roušky. Chrání i nositele. Ale dražší a méně pohodlné."
        />
        <MeasureCard
          name="Uzavření škol"
          effect="Snížení školních kontaktů ~80 %"
          cost="Vysoká"
          desc="Velmi účinné u respiračních infekcí (děti = superspreadeři). Ale obrovský dopad na rodiny a vzdělání."
        />
        <MeasureCard
          name="Home-office"
          effect="Snížení pracovních kontaktů ~60 %"
          cost="Střední"
          desc="Efektivní pro kancelářské profese. Nelze aplikovat na výrobní, zdravotnické a servisní pracovníky."
        />
        <MeasureCard
          name="Zákaz hromadných akcí"
          effect="Snížení komunitních kontaktů ~30 %"
          cost="Střední"
          desc="Eliminuje superspreader eventy (koncerty, zápasy, konference). Relativně malý ekonomický dopad."
        />
        <MeasureCard
          name="Uzavření restaurací"
          effect="Snížení komunitních kontaktů ~25 %"
          cost="Vysoká"
          desc="Restaurace jsou rizikové prostředí (bez roušek, hluk = aerosoly). Ale devastující pro gastronomii."
        />
        <MeasureCard
          name="Lockdown"
          effect="Snížení komunitních kontaktů ~70 %"
          cost="Extrémní"
          desc="Poslední záchrana. Funguje, ale ničí ekonomiku, psychiku a sociální kapitál. Nelze udržet dlouho."
        />
        <MeasureCard
          name="Trasování kontaktů"
          effect="Snížení přenosu ~8 % + detekce"
          cost="Nízká"
          desc="Cílené — izoluje nakažené a jejich kontakty. Velmi efektivní při nízkých počtech. Při explozi nestíhá."
        />
      </div>

      <WarningBox title="Hodnoty platí pro naši hru, ne pro skutečnou epidemii">
        Čísla uvedená výše (např. „snížení přenosu ~15 %") jsou <strong>zjednodušené herní parametry</strong> navržené
        tak, aby simulace byla hratelná a přitom zachycovala relativní účinnost jednotlivých opatření.
        Ve skutečnosti závisí efekt každého opatření na konkrétním patogenu (způsob přenosu, virulence,
        velikost infekční dávky), populaci (věková struktura, hustota osídlení, kulturní zvyklosti)
        a kvalitě implementace. Reálné epidemiologické modely tyto parametry kalibrují na míru
        konkrétní situaci pomocí dat z terénu — což je přesně to, co dělá práci epidemiologa tak náročnou.
        Pokud vás zajímají skutečné odhady účinnosti NPI, doporučujeme odbornou literaturu a systematické
        přehledy (např. Cochrane reviews).
      </WarningBox>

      <h3 className="text-lg font-bold mt-6">Právní rámec a demokratická kontrola</h3>
      <p className="text-gray-700 leading-relaxed">
        Každé epidemiologické opatření je zároveň <strong>zásahem do základních práv a svobod</strong> —
        svobody pohybu, shromažďování, podnikání či práva na vzdělání. Demokratický právní stát
        vyžaduje, aby takové zásahy byly <strong>přiměřené, časově omezené a podložené zákonem</strong>.
        Proto v běžném režimu procházejí opatření politickou kontrolou: vláda je schvaluje,
        parlament je může přezkoumat a opozice plní nezastupitelnou roli kritického hlasu,
        který brání zneužití mimořádných pravomocí.
      </p>
      <p className="text-gray-700 leading-relaxed mt-3">
        V praxi to znamená, že i epidemiologicky správné rozhodnutí musí projít <strong>testem
        proporcionality</strong> — je opatření nezbytné? Existuje mírnější alternativa se srovnatelným
        účinkem? Nepřináší více škody než užitku? Toto napětí mezi ochranou veřejného zdraví
        a ochranou individuálních práv není slabinou systému, ale jeho <strong>pojistkou</strong>.
        Právě proto je krizové řízení epidemie tak obtížné — a proto potřebuje nejen epidemiology,
        ale i právníky, politiky a informovanou veřejnost.
      </p>

      <h3 className="text-lg font-bold mt-6">Načasování a náběh</h3>
      <p className="text-gray-700 leading-relaxed">
        Opatření nezačnou fungovat ihned. Každé má <strong>dobu náběhu</strong> (ramp-up):
        čas potřebný k plné implementaci. Roušky: 1 den. Trasování: 7 dní.
        Vakcinační centra: 21 dní. Navíc, když rozhoduje <strong>hlavní hygienik</strong>
        místo premiéra, přidává se +7 dní na schválení vládou — což v modelu odráží právě
        tento proces demokratické kontroly.
      </p>

      <InfoBox title="Provázanost opatření">
        Opatření se <strong>vzájemně doplňují</strong>. Samotné roušky nestačí, pokud jsou
        školy otevřené a probíhají koncerty. Naopak, kombinace roušek + trasování + home-office
        může srazit R pod 1 bez nutnosti lockdownu. Hledejte synergii, ne plošné řešení.
      </InfoBox>

      <h3 className="text-lg font-bold mt-6">Compliance a únava</h3>
      <p className="text-gray-700 leading-relaxed">
        Lidé časem přestávají dodržovat opatření (<strong>compliance decay</strong>).
        Čím déle opatření trvá a čím je přísnější, tím více lidí ho obchází.
        Výjimka: opatření vynucená armádou mají stálou compliance, ale za cenu
        extrémního politického odporu.
      </p>
    </>
  );
}

function MeasureCard({ name, effect, cost, desc }: { name: string; effect: string; cost: string; desc: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-1">
        <span className="font-bold text-sm text-gray-900">{name}</span>
        <div className="flex gap-2 text-[10px]">
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{effect}</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Cena: {cost}</span>
        </div>
      </div>
      <p className="text-xs text-gray-600">{desc}</p>
    </div>
  );
}

// ── TRASOVÁNÍ KONTAKTŮ ──

function TrasovaniSection() {
  return (
    <>
      <h2 className="text-2xl font-black text-gray-900 mb-4">Trasování kontaktů</h2>

      <p className="text-gray-700 leading-relaxed">
        Trasování kontaktů je <strong>detektivní práce epidemiologa</strong>. Když je
        identifikován nakažený, epidemiolog zjistí, s kým se v posledních dnech potkal,
        a ty lidi kontaktuje, otestuje a případně izoluje.
      </p>

      <h3 className="text-lg font-bold mt-6">Jak trasování probíhá</h3>
      <div className="space-y-3 my-4">
        <Step num={1} title="Identifikace případu">
          Pacient má pozitivní test. Hygienik ho kontaktuje a začne rozhovor.
        </Step>
        <Step num={2} title="Rozhovor">
          „S kým jste se v posledních 5 dnech setkal? Kde jste byl? Jaké akce jste navštívil?"
        </Step>
        <Step num={3} title="Kontaktování kontaktů">
          Hygienik volá všem uvedeným kontaktům. Ptá se na symptomy, nabízí test.
        </Step>
        <Step num={4} title="Izolace a karanténa">
          Pozitivní → izolace (10 dní). Kontakty → karanténa (5-14 dní).
        </Step>
        <Step num={5} title="Hledání vzorce">
          Opakují se nějaké lokace? Je to cluster (ohnisko)? Superspreader event?
        </Step>
      </div>

      <InfoBox title="Hra Ósacká horečka">
        Ve hře <strong>Ósacká horečka</strong> si trasování vyzkoušíte na vlastní kůži.
        Budete volat obyvatelům Springfieldu, zjišťovat kdo je nemocný, s kým se potkal,
        a sestavovat epidemiologickou křivku. Pozor na rozpočet — každý hovor stojí body!
      </InfoBox>

      <h3 className="text-lg font-bold mt-6">Kdy trasování funguje</h3>
      <p className="text-gray-700">
        Trasování je nejúčinnější při <strong>nízkých počtech případů</strong> (desítky až stovky).
        Při tisících případů denně hygiena nestíhá a trasování selhává. Proto je důležité
        začít trasovat co nejdříve a držet počty nízko pomocí dalších opatření.
      </p>

      <h3 className="text-lg font-bold mt-6">Limity trasování</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        <li><strong>Bezpříznakový přenos</strong> — nakažený neví, že je nakažený, a nikdo ho nehledá.</li>
        <li><strong>Neúplné údaje</strong> — lidé si nepamatují všechny kontakty, nebo je nechtějí uvést.</li>
        <li><strong>Zpoždění</strong> — od nákazy k testu uplyne 3-7 dní. Za tu dobu nakažený potkával další lidi.</li>
        <li><strong>Kapacita</strong> — jeden hygienik/hygienička zvládne vytrasovat 5–50 případů denně v závislosti na IT podpoře, náročnosti trasování a předpokládaném způsobu přenosu nákazy. Při explozivním nárůstu počet případů rychle přeroste kapacitu trasovacích týmů.</li>
      </ul>
    </>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
        {num}
      </div>
      <div>
        <div className="font-bold text-sm text-gray-900">{title}</div>
        <p className="text-xs text-gray-600">{children}</p>
      </div>
    </div>
  );
}

// ── KRIZOVÉ ŘÍZENÍ ──

function KrizoveSection() {
  return (
    <>
      <h2 className="text-2xl font-black text-gray-900 mb-4">Krizové řízení epidemie</h2>

      <p className="text-gray-700 leading-relaxed">
        Řízení epidemie není jen o epidemiologii. Je to balancování mezi
        <strong> zdravím</strong>, <strong>ekonomikou</strong> a <strong>politickou stabilitou</strong>.
        Perfektní epidemiologické řešení, které zruinuje ekonomiku nebo vyvolá nepokoje, není řešení.
      </p>

      <h3 className="text-lg font-bold mt-6">Tři pilíře rozhodování</h3>
      <div className="grid md:grid-cols-3 gap-4 my-4">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-2xl mb-2 text-center">🏥</div>
          <div className="font-bold text-red-800 text-center mb-2">Zdraví</div>
          <p className="text-xs text-red-700">
            Počet nakažených, hospitalizovaných, zemřelých. Kapacita nemocnic.
            Cíl: minimalizovat úmrtnost a kolaps zdravotnictví.
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <div className="text-2xl mb-2 text-center">💰</div>
          <div className="font-bold text-emerald-800 text-center mb-2">Ekonomika</div>
          <p className="text-xs text-emerald-700">
            HDP, nezaměstnanost, státní dluh. Každé omezení stojí miliardy.
            Cíl: udržet ekonomiku funkční pro dobu po epidemii.
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl mb-2 text-center">🏛️</div>
          <div className="font-bold text-purple-800 text-center mb-2">Politika</div>
          <p className="text-xs text-purple-700">
            Důvěra veřejnosti, sociální kapitál, opozice. Bez důvěry opatření nefungují.
            Cíl: udržet legitimitu a vymahatelnost rozhodnutí.
          </p>
        </div>
      </div>

      <h3 className="text-lg font-bold mt-6">Kdo rozhoduje</h3>
      <p className="text-gray-700 leading-relaxed">
        V naší simulaci rozhoduje nejprve <strong>hlavní hygienik</strong> — má k dispozici
        zdravotnická a organizační opatření. Politická rozhodnutí (lockdown, armáda, ekonomické
        programy) vyžadují premiéra. Premiér přebírá řízení, když počet obětí překročí kritickou hranici.
      </p>

      <div className="grid md:grid-cols-2 gap-4 my-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="font-bold text-blue-800 mb-2">🏥 Hlavní hygienik</div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>+ Roušky a respirátory</li>
            <li>+ Trasování kontaktů</li>
            <li>+ Uzavření škol</li>
            <li>+ Informační kampaně</li>
            <li className="text-blue-500 italic">⏱ +7 dní na schválení vládou</li>
          </ul>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="font-bold text-red-800 mb-2">🏛️ Premiér</div>
          <ul className="text-xs text-red-700 space-y-1">
            <li>+ Všechna opatření hygienika</li>
            <li>+ Lockdown a zákaz vycházení</li>
            <li>+ Nasazení armády</li>
            <li>+ Ekonomické programy</li>
            <li className="text-red-500 italic">⚡ Okamžitá platnost</li>
          </ul>
        </div>
      </div>

      <h3 className="text-lg font-bold mt-6">Poradci krizového štábu</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        V krizovém štábu máte 5 poradců, každý se svými prioritami a perspektivou:
      </p>

      <div className="space-y-3">
        <AdvisorInfo
          name="MUDr. Nováková"
          role="Epidemioložka"
          color="blue"
          desc="Sleduje čísla, nemocnice, R. Vždy doporučuje přísnější opatření. Priorita: zachránit životy."
        />
        <AdvisorInfo
          name="Ing. Dvořák"
          role="Ekonom"
          color="emerald"
          desc="Sleduje HDP, nezaměstnanost, státní dluh. Tlačí na uvolnění. Priorita: zachránit ekonomiku."
        />
        <AdvisorInfo
          name="JUDr. Svoboda"
          role="Politik"
          color="purple"
          desc="Sleduje nálady ve společnosti, průzkumy, opozici. Priorita: udržet důvěru a stabilitu."
        />
        <AdvisorInfo
          name="Gen. Vlk"
          role="Armáda"
          color="amber"
          desc="Logistik a stratég. Předpovídá vývoj na 14 dní a 1 měsíc. Priorita: efektivní nasazení zdrojů."
        />
        <AdvisorInfo
          name="Mgr. Čermák"
          role="Opozice"
          color="red"
          desc="Kritik nebo spojenec — záleží na tom, jak s ním komunikujete. Briefujte ho pravidelně."
        />
      </div>

      <h3 className="text-lg font-bold mt-6">Důvěra a pád vlády</h3>
      <p className="text-gray-700">
        Důvěra veřejnosti je vaše nejcennější surovina. Klesá při úmrtích, přeplněných nemocnicích,
        příliš mnoha omezeních a nedostatku komunikace. Když klesne na nulu,
        <strong> vláda padne</strong> a 2 kola nebudou fungovat žádná opatření.
      </p>
    </>
  );
}

function AdvisorInfo({ name, role, color, desc }: { name: string; role: string; color: string; desc: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  };
  return (
    <div className={`rounded-lg p-3 border ${colorClasses[color] || 'bg-gray-50 border-gray-200'}`}>
      <span className="font-bold text-sm">{name}</span>
      <span className="text-xs opacity-60 ml-1">({role})</span>
      <p className="text-xs mt-1 opacity-80">{desc}</p>
    </div>
  );
}

// ── PŘÍBĚH: DR. KOVÁŘOVÁ ──

function PribehSection() {
  return (
    <>
      <h2 className="text-2xl font-black text-gray-900 mb-4">Příběh: Den v životě Dr. Kovářové</h2>
      <p className="text-xs text-gray-500 italic mb-6">
        Fiktivní příběh zachycující reálné situace z epidemiologické praxe.
        Všechny postavy a události jsou smyšlené.
      </p>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <StoryBlock time="6:30" title="Ráno v KHS">
          <p>
            Dr. Eva Kovářová otevírá notebook ještě v tramvaji. Na Krajské hygienické stanici ji čeká
            228 nových pozitivních případů z včerejška. Před měsícem to bylo 15 denně. Exponenciála
            je nemilosrdná — to ví z učebnic, ale teprve teď to cítí na vlastní kůži.
          </p>
          <p className="mt-2">
            „Když je R = 1,3 a generační čas 5 dní, za měsíc máme šestkrát tolik případů,"
            říká si v duchu. „To jsme už za hranou toho, co zvládneme trasovat."
          </p>
        </StoryBlock>

        <StoryBlock time="8:00" title="Ranní porada">
          <p>
            „Máme cluster v domově seniorů na Borech," hlásí kolegyně Markéta. „23 pozitivních
            z 80 rezidentů. Tři na JIP." Eva si kreslí kontaktní síť: pečovatelka paní Hrušková
            pracovala s teplotou dva dny, než si šla pro test. Za tu dobu obsluhovala 30 pokojů.
          </p>
          <p className="mt-2">
            Tohle je reálný problém — <strong>bezpříznakový a presymptomatický přenos</strong>.
            Paní Hrušková neměla rýmu, jen mírnou únavu. A přesto infikovala desítky lidí.
            Model tohle zachycuje ve skupině E (exposed) — lidé, kteří jsou nakažení,
            ale ještě nemají příznaky.
          </p>
        </StoryBlock>

        <StoryBlock time="10:30" title="Trasování">
          <p>
            Eva volá panu Novotnému, 45 let, pozitivní od včerejška. „S kým jste se
            v posledních 5 dnech setkal?"
          </p>
          <p className="mt-2 italic">
            „No, byl jsem v práci normálně... na obědě v kantýně... jo, a v sobotu jsme měli
            narozeniny u tchýně, tam bylo tak 20 lidí..."
          </p>
          <p className="mt-2">
            Dvacet lidí na oslavě. Bez roušek, v uzavřené místnosti, 4 hodiny.
            Typický <strong>superspreader event</strong>. Eva ví, že z těch 20 lidí
            bude pozitivních možná 8-12. A každý z nich potkal dalších 10 lidí.
            „Tohle je ta geometrická řada," pomyslí si.
          </p>
        </StoryBlock>

        <StoryBlock time="13:00" title="Videokonference s ministerstvem">
          <p>
            „Nemocnice v Plzni hlásí 92% obsazenost lůžek," říká náměstek. „Musíme
            něco udělat." Eva navrhuje uzavření škol — data jasně ukazují, že děti
            přinášejí virus domů a nakazí prarodiče. Ale politik ze štábu namítá:
            „Školy nemůžete zavřít, rodičům to zruinuje životy."
          </p>
          <p className="mt-2">
            Eva chápe dilema. V kontaktní matici mají děti 8 kontaktů denně ve škole.
            Když školy zavřete, klesne na 2. To je <strong>75% redukce kontaktů</strong>
            v celé jedné submatici. Enormní efekt. Ale ekonomická cena? Obrovská.
            A politická? Ještě větší.
          </p>
        </StoryBlock>

        <StoryBlock time="16:00" title="Překvapení v datech">
          <p>
            Kolega analytik přibíhá s grafem. „Evo, podívej — nárůst zpomalil v okresu,
            kde jsme před třemi týdny zavedli trasování. R tam kleslo z 1,4 na 1,1!"
          </p>
          <p className="mt-2">
            Eva se usmívá. Trasování funguje — ale jen když jsou počty zvládnutelné.
            V Praze, kde je 500 případů denně, trasování kolabuje. V Klatovech, kde je
            30 případů, funguje perfektně. „Je to jako s hasičáky," říká Eva.
            „Jeden hasičák uhasí jeden požár. Ale když hoří celé město, potřebujete jinou strategii."
          </p>
        </StoryBlock>

        <StoryBlock time="19:00" title="Večer: reflexe">
          <p>
            Eva je doma. Unavená, ale přemýšlí. Dnešní den ukázal všechno, co
            v modelech čte — exponenciální růst, superspreader eventy, zpoždění
            mezi nákazou a hospitalizací, dilema mezi zdravím a ekonomikou.
          </p>
          <p className="mt-2">
            „Model je mapa," říká si. „Realita je terén. Mapa nikdy nezachytí každý
            kámen a každý potok. Ale bez mapy se v terénu ztratíte."
          </p>
          <p className="mt-2">
            Otevírá SEIR model na notebooku. Při R = 1,3 a současných opatřeních
            bude za 14 dní v nemocnicích o 40 % více pacientů. Ale pokud se podaří
            stlačit R na 0,9 kombinací roušek + home-office + trasování,
            za měsíc to bude o 30 % méně. Zítra to ukáže na štábu.
          </p>
        </StoryBlock>

        <div className="bg-gray-100 rounded-xl p-5 mt-8">
          <h3 className="font-bold text-gray-800 mb-2">Co si z příběhu odnést</h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Exponenciální růst je neintuitivní — když se nám zdá, že je málo případů, bývá pozdě.</li>
            <li>• Trasování funguje skvěle při nízkých počtech, ale škáluje se špatně.</li>
            <li>• Superspreader eventy mohou zvrátit celý průběh epidemie.</li>
            <li>• Rozhodování je vždy kompromis mezi zdravím, ekonomikou a politikou.</li>
            <li>• Modely jsou „mapy" — nepřesné, ale nezbytné pro orientaci.</li>
            <li>• Mezi nákazou a jejím dopadem na nemocnice je zpoždění 1-2 týdny.</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function StoryBlock({ time, title, children }: { time: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-16 text-right">
        <span className="text-xs font-mono font-bold text-gray-400">{time}</span>
      </div>
      <div className="border-l-2 border-blue-200 pl-4 pb-2">
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        {children}
      </div>
    </div>
  );
}
