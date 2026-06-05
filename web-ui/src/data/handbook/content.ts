/**
 * Obsah Příručky epidemiologa ve třech úrovních náročnosti.
 *
 * - zs: 2. stupeň ZŠ (8.–9. třída) — jednoduše, na příkladech, bez vzorců
 * - ss: střední škola (3.–4. ročník) — pojmy, jednoduché modely, grafy
 * - vs: vysoká škola / lékařská fakulta — do hloubky, s odkazy na literaturu
 *
 * Reference (úroveň `vs`) pocházejí z PubMedu a jsou uvedeny s DOI.
 * Pozn.: HTML v `p`/`list`/`info`/`diagram` je autorský statický obsah
 * (žádný uživatelský vstup) — renderuje se přes dangerouslySetInnerHTML.
 */

export type HandbookLevel = 'zs' | 'ss' | 'vs';

export interface Reference {
  authors: string;
  year: number;
  title: string;
  journal: string;
  doi: string;
}

export type Block =
  | { t: 'h'; text: string }
  | { t: 'p'; html: string }
  | { t: 'list'; items: string[] }
  | { t: 'info'; title: string; html: string }
  | { t: 'warn'; title: string; html: string }
  | { t: 'diagram'; html: string }
  | { t: 'html'; html: string }
  | { t: 'gloss'; items: { term: string; def: string }[] }
  | { t: 'exercise'; title: string; html: string }
  | { t: 'refs'; items: Reference[] };

export interface Chapter {
  id: 'intro' | 'sireni' | 'modely' | 'opatreni' | 'trasovani' | 'krizove' | 'pribeh';
  label: string;
  icon: string;
  title: string;
  content: Record<HandbookLevel, Block[]>;
}

// ── Reálné reference z PubMedu (s DOI) ──
const REF = {
  diekmann2009: {
    authors: 'Diekmann O, Heesterbeek JAP, Roberts MG',
    year: 2009,
    title: 'The construction of next-generation matrices for compartmental epidemic models',
    journal: 'J R Soc Interface 7(47):873–885',
    doi: '10.1098/rsif.2009.0386',
  },
  hellewell2020: {
    authors: 'Hellewell J, Abbott S, Gimma A, et al.',
    year: 2020,
    title: 'Feasibility of controlling COVID-19 outbreaks by isolation of cases and contacts',
    journal: 'Lancet Glob Health 8(4):e488–e496',
    doi: '10.1016/S2214-109X(20)30074-7',
  },
  flaxman2020: {
    authors: 'Flaxman S, Mishra S, Gandy A, et al.',
    year: 2020,
    title: 'Estimating the effects of non-pharmaceutical interventions on COVID-19 in Europe',
    journal: 'Nature 584:257–261',
    doi: '10.1038/s41586-020-2405-7',
  },
  lloydSmith2005: {
    authors: 'Lloyd-Smith JO, Schreiber SJ, Kopp PE, Getz WM',
    year: 2005,
    title: 'Superspreading and the effect of individual variation on disease emergence',
    journal: 'Nature 438:355–359',
    doi: '10.1038/nature04153',
  },
  wallinga2007: {
    authors: 'Wallinga J, Lipsitch M',
    year: 2007,
    title: 'How generation intervals shape the relationship between growth rates and reproductive numbers',
    journal: 'Proc Biol Sci 274(1609):599–604',
    doi: '10.1098/rspb.2006.3754',
  },
  ferretti2020: {
    authors: 'Ferretti L, Wymant C, Kendall M, et al.',
    year: 2020,
    title: 'Quantifying SARS-CoV-2 transmission suggests epidemic control with digital contact tracing',
    journal: 'Science 368(6491):eabb6936',
    doi: '10.1126/science.abb6936',
  },
  bubar2021: {
    authors: 'Bubar KM, Reinholt K, Kissler SM, et al.',
    year: 2021,
    title: 'Model-informed COVID-19 vaccine prioritization strategies by age and serostatus',
    journal: 'Science 371(6532):916–921',
    doi: '10.1126/science.abe6959',
  },
  odriscoll2021: {
    authors: "O'Driscoll M, Ribeiro Dos Santos G, Wang L, et al.",
    year: 2021,
    title: 'Age-specific mortality and immunity patterns of SARS-CoV-2',
    journal: 'Nature 590:140–145',
    doi: '10.1038/s41586-020-2918-0',
  },
} satisfies Record<string, Reference>;

const seirDiagram = `
  <div class="flex items-center justify-center gap-2 flex-wrap">
    <span class="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-bold">S — vnímavý</span>
    <span class="text-gray-400">→</span>
    <span class="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg font-bold">E — v inkubaci</span>
    <span class="text-gray-400">→</span>
    <span class="bg-red-100 text-red-800 px-3 py-1.5 rounded-lg font-bold">I — infekční</span>
    <span class="text-gray-400">→</span>
    <span class="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg font-bold">R — uzdravený</span>
  </div>`;

// Graf „zploštění křivky" — ostrý vrchol nad kapacitou vs. nízká široká křivka.
const flattenCurveSvg = (() => {
  const g = (cx: number, amp: number, w: number, x: number) => amp * Math.exp(-((x - cx) ** 2) / (2 * w * w));
  let sharp = '';
  let flat = '';
  for (let x = 0; x <= 300; x += 4) {
    sharp += `${x === 0 ? 'M' : 'L'}${x + 10},${(120 - g(110, 95, 16, x)).toFixed(1)} `;
    flat += `${x === 0 ? 'M' : 'L'}${x + 10},${(120 - g(160, 42, 42, x)).toFixed(1)} `;
  }
  return `<svg viewBox="0 0 330 150" style="width:100%;height:auto;max-width:420px;display:block;margin:0 auto" font-family="sans-serif">
    <line x1="10" y1="120" x2="320" y2="120" stroke="#5b6b73"/>
    <line x1="10" y1="20" x2="10" y2="120" stroke="#5b6b73"/>
    <line x1="10" y1="58" x2="320" y2="58" stroke="#22303a" stroke-width="1.3" stroke-dasharray="5 4"/>
    <text x="316" y="53" font-size="9" fill="#22303a" text-anchor="end">kapacita zdravotnictví</text>
    <path d="${sharp}" fill="none" stroke="#c44536" stroke-width="2.5"/>
    <path d="${flat}" fill="none" stroke="#0e7c7b" stroke-width="2.5"/>
    <text x="118" y="22" font-size="9.5" fill="#c44536">bez opatření</text>
    <text x="208" y="86" font-size="9.5" fill="#0e7c7b">s opatřeními</text>
    <text x="165" y="137" font-size="9" fill="#5b6b73" text-anchor="middle">čas →</text>
    <text x="16" y="30" font-size="9" fill="#5b6b73">případy</text>
  </svg>`;
})();

// Graf R(t) v čase — drží se nad prahem 1, po zavedení opatření klesá pod něj.
const rtCurveSvg = (() => {
  let r = '';
  for (let x = 0; x <= 300; x += 4) {
    const v = x < 130 ? 1.7 : Math.max(0.65, 1.7 - (x - 130) * 0.012);
    r += `${x === 0 ? 'M' : 'L'}${x + 10},${(120 - (v - 0.5) * 55).toFixed(1)} `;
  }
  const yOne = (120 - (1 - 0.5) * 55).toFixed(1);
  return `<svg viewBox="0 0 330 150" style="width:100%;height:auto;max-width:420px;display:block;margin:0 auto" font-family="sans-serif">
    <line x1="10" y1="120" x2="320" y2="120" stroke="#5b6b73"/>
    <line x1="10" y1="20" x2="10" y2="120" stroke="#5b6b73"/>
    <line x1="10" y1="${yOne}" x2="320" y2="${yOne}" stroke="#22303a" stroke-width="1.3" stroke-dasharray="5 4"/>
    <text x="316" y="${Number(yOne) - 4}" font-size="9" fill="#22303a" text-anchor="end">R = 1 (práh)</text>
    <line x1="140" y1="20" x2="140" y2="120" stroke="#e0a458" stroke-width="1.3"/>
    <text x="144" y="30" font-size="9" fill="#c5862f">opatření</text>
    <path d="${r}" fill="none" stroke="#0e7c7b" stroke-width="2.5"/>
    <text x="40" y="46" font-size="9.5" fill="#0e7c7b">Rₜ</text>
    <text x="165" y="137" font-size="9" fill="#5b6b73" text-anchor="middle">čas →</text>
  </svg>`;
})();

export const HANDBOOK: Chapter[] = [
  // ════════════════════════════ ÚVOD ════════════════════════════
  {
    id: 'intro',
    label: 'Úvod',
    icon: '📖',
    title: 'Vítejte v Příručce epidemiologa',
    content: {
      zs: [
        { t: 'p', html: 'Tahle příručka tě připraví na hry v <strong>Nedovařeném tapírovi</strong>. Vysvětlíme, jak se nemoci šíří a jak se proti nim dá bránit — jednoduše a na příkladech.' },
        { t: 'warn', title: 'Pozor', html: 'Naše hry jsou <strong>zjednodušené</strong>. Pomáhají pochopit, jak to funguje, ale skutečná epidemie je mnohem složitější.' },
        { t: 'h', text: 'Co se dozvíš' },
        { t: 'list', items: [
          'jak se virus přenáší z člověka na člověka',
          'proč pomáhají roušky, mytí rukou a očkování',
          'co dělá epidemiolog, když vypukne nemoc',
        ] },
      ],
      ss: [
        { t: 'p', html: 'Tato příručka je určena pro účastníky simulace <strong>Krizový štáb</strong> a dalších her v platformě Nedovařený tapír. Jejím cílem není nahradit odborné vzdělání, ale srozumitelně představit <strong>základní principy</strong>, ze kterých vycházejí naše modely — a které stojí i za reálnými rozhodnutími při epidemiích.' },
        { t: 'h', text: 'Co je epidemiologie' },
        { t: 'p', html: '<strong>Epidemiologie</strong> je věda o tom, jak se nemoci šíří v populaci, proč postihují určité skupiny lidí a jak jim předcházet. Epidemiolog je v jistém smyslu <em>detektiv</em>: sbírá data (kdo onemocněl, kdy a kde), hledá vzorce, formuluje hypotézy o příčině a navrhuje opatření. Nezkoumá jednoho pacienta, ale celé skupiny — a pracuje s pravděpodobnostmi a čísly.' },
        { t: 'info', title: 'Zakladatelský příběh — John Snow (1854)', html: 'Při epidemii cholery v Londýně lékař John Snow zakreslil úmrtí do mapy a všiml si, že se soustředí kolem jedné <strong>veřejné pumpy</strong> v Broad Street. Když nechal odstranit její páku, epidemie ustala. Snow neznal bakterii cholery — odhalil zdroj <em>analýzou dat</em>. To je dodnes podstata terénní epidemiologie a přesně to děláte v <em>Ósacké horečce</em>.' },
        { t: 'h', text: 'K čemu jsou modely' },
        { t: 'p', html: 'Modely nám umožní <strong>předem promyslet</strong>, co se stane, když zasáhneme — nebo nezasáhneme. Pomáhají odpovídat na otázky typu „Když teď zavřeme školy, o kolik se sníží vrchol epidemie?" nebo „Kolik lidí musíme naočkovat, aby se šíření zastavilo?". Bez modelu bychom se rozhodovali jen podle intuice; s modelem můžeme různé scénáře porovnat.' },
        { t: 'warn', title: 'Důležité upozornění', html: 'Naše modely jsou <strong>zjednodušenou verzí reality</strong>. Cílem je představit podstatu epidemiologických procesů, nikoliv přesně předpovídat realitu. Skutečné epidemie ovlivňují stovky faktorů, které zde nezohledňujeme — od chování lidí po proměnlivost viru. Model je nástroj k <em>porozumění</em>, nikoliv křišťálová koule.' },
        { t: 'h', text: 'Co se v příručce naučíte' },
        { t: 'list', items: [
          '<strong>Jak se šíří virus</strong> — cesty přenosu, R₀, exponenciální růst, kontaktní matice',
          '<strong>Epidemiologické modely</strong> — model SEIR, síla infekce, R<sub>eff</sub>, stádní imunita',
          '<strong>Opatření a intervence</strong> — jak roušky, distanc a očkování mění šíření a co stojí',
          '<strong>Trasování kontaktů</strong> — jak přerušit řetězec přenosu cíleně',
          '<strong>Krizové řízení</strong> — rozhodování pod tlakem mezi zdravím, ekonomikou a důvěrou',
        ] },
        { t: 'p', html: 'Kapitoly na sebe navazují, ale můžete je číst i samostatně. Doporučujeme začít „Jak se šíří virus" a „Epidemiologické modely" — dají vám slovník, který využijete ve všech hrách.' },
      ],
      vs: [
        { t: 'p', html: 'Představte si, že do města právě dorazil nový virus. Jeden jediný nakažený. Co bude dál — a co s tím můžeme dělat — je příběh, který se odehraje na <strong>čtyřech úrovních zároveň</strong>, a epidemiolog je musí vidět všechny najednou:' },
        { t: 'html', html: '<div class="space-y-2">' +
          '<div class="bg-blue-50 rounded-lg p-3"><span class="font-bold text-blue-800">1 · Virus</span> <span class="text-sm text-blue-700">— jaké má vlastnosti? Jak nakažlivý, jak rychlý, jak proměnlivý je?</span></div>' +
          '<div class="bg-yellow-50 rounded-lg p-3"><span class="font-bold text-yellow-800">2 · Jednotlivec</span> <span class="text-sm text-yellow-700">— co virus udělá v jednom těle (klinický obraz) a kdy je ten člověk nakažlivý.</span></div>' +
          '<div class="bg-red-50 rounded-lg p-3"><span class="font-bold text-red-800">3 · Populace</span> <span class="text-sm text-red-700">— jak se z jednoho případu stane epidemická křivka a co ji řídí.</span></div>' +
          '<div class="bg-green-50 rounded-lg p-3"><span class="font-bold text-green-800">4 · Společnost</span> <span class="text-sm text-green-700">— jak do toho zasáhneme — a jak přimět lidi, aby šli s námi.</span></div>' +
          '</div>' },
        { t: 'p', html: 'Ve stejném pořadí budeme postupovat i my. Začneme u viru a jeho průběhu v jednom těle, přejdeme k matematice populace, pak k zásahům, jimiž se epidemie brzdí, a skončíme u lidské a etické roviny rozhodování. Výklad je kvantitativní a předpokládá základy diferenciálního počtu a pravděpodobnosti; u zásadních tvrzení odkazuje na původní práce v rámečcích „Pro hlubší studium".' },
        { t: 'p', html: 'Matematická epidemiologie se od té popisné (která jen mapuje, kdo, kde a kdy onemocněl) liší tím, že přenos popisuje <strong>explicitním modelem</strong> — soustavou rovnic nebo náhodným procesem. Takový model pak slouží trojímu účelu: pomáhá pochopit mechanismus šíření, odhadnout z dat veličiny, které přímo nevidíme (třeba R₀ nebo skutečný počet nakažených), a předem porovnat, jak by epidemie dopadla při různých opatřeních.' },
        { t: 'warn', title: 'Model není věštba', html: 'Modely, se kterými budeme pracovat, stojí na zjednodušeních — předpokládají dobře promíchanou populaci a „bezpaměťové" doby trvání jednotlivých stádií. K jakémukoli reálnému odhadu proto patří kalibrace na data, poctivé vyčíslení nejistoty a ověření na datech, která model neviděl. Číslo bez intervalu spolehlivosti je ilustrace, nikoliv předpověď.' },
        { t: 'gloss', items: [
          { term: 'Generativní model', def: 'předpis, který umí „vyrobit" data podobná pozorovaným (např. průběh epidemie); díky tomu z dat zpětně odhadujeme jeho parametry.' },
          { term: 'Diferenciální rovnice (ODR)', def: 'rovnice popisující, jak se nějaká veličina mění v čase (rychlost změny). Soustava ODR je páteří kompartmentových modelů.' },
          { term: 'Kalibrace', def: 'naladění parametrů modelu tak, aby jeho výstup odpovídal skutečně pozorovaným datům.' },
          { term: 'Validace „out-of-sample"', def: 'ověření modelu na datech, která nebyla použita k jeho sestavení — test, zda model opravdu předpovídá, a jen nepřepisuje, co už zná.' },
        ] },
        { t: 'p', html: '<em>Kam dál:</em> klasickou učebnicovou syntézou oboru je Anderson &amp; May, <em>Infectious Diseases of Humans</em> (1991); přístupný moderní úvod nabízí Keeling &amp; Rohani, <em>Modeling Infectious Diseases in Humans and Animals</em> (2008).' },
      ],
    },
  },

  // ══════════════════════ JAK SE ŠÍŘÍ VIRUS ══════════════════════
  {
    id: 'sireni',
    label: 'Jak se šíří virus',
    icon: '🦠',
    title: 'Jak se šíří virus',
    content: {
      zs: [
        { t: 'p', html: 'Aby se nemoc šířila, potřebuje <strong>řetězec</strong>: nemocný člověk → nějaký způsob přenosu → zdravý člověk. Když řetězec přerušíme, šíření se zastaví.' },
        { t: 'h', text: 'Jak se virus dostane dál' },
        { t: 'list', items: [
          '<strong>Kapénky</strong> — kašel, kýchání, mluvení (doletí 1–2 metry)',
          '<strong>Vzduch</strong> — drobné částečky chvíli visí ve vzduchu (proto se větrá)',
          '<strong>Dotyk</strong> — klika, podání ruky (proto mytí rukou)',
          '<strong>Voda a jídlo</strong> — třeba u tyfu nebo cholery',
        ] },
        { t: 'info', title: 'R₀ — jednoduše', html: 'R₀ říká, <strong>kolik lidí v průměru nakazí jeden nemocný</strong>, když nikdo není chráněný. Chřipka ~2, COVID ~3, spalničky až 15 (proto jsou tak nakažlivé).' },
        { t: 'p', html: 'Když jeden nakazí víc než jednoho, počet nemocných rychle <strong>roste</strong> — z 1 může být za pár týdnů tisíce.' },
      ],
      ss: [
        { t: 'p', html: 'Každé infekční onemocnění potřebuje k šíření <strong>řetězec přenosu</strong>: zdroj nákazy (nakažený) → cesta přenosu → vnímavý jedinec. Pokud řetězec na kterémkoli článku přerušíme, přenos se zastaví. <strong>Všechna</strong> protiepidemická opatření jsou ve své podstatě jen různé způsoby, jak některý článek řetězce zpřetrhnout.' },
        { t: 'diagram', html: 'Zdroj (nakažený) → [cesta přenosu] → Vnímavý → nový Zdroj<br><span class="text-gray-400">Bez přerušení řetězce se počet nakažených násobí v každé „generaci".</span>' },
        { t: 'h', text: 'Inkubační doba a infekční perioda' },
        { t: 'p', html: 'Po nákaze nenastane vše naráz. <strong>Inkubační doba</strong> je čas od nákazy do prvních příznaků (u COVID-19 typicky 3–6 dní). <strong>Infekční perioda</strong> je doba, kdy člověk virus skutečně předává — a ta se s příznaky nemusí krýt. U mnoha respiračních nákaz je člověk nakažlivý <em>už den či dva před</em> příznaky (presymptomatický přenos). To je zásadní, protože takový člověk šíří virus, aniž by tušil, že je nemocný — a ztěžuje to trasování i izolaci.' },
        { t: 'h', text: 'Způsoby přenosu' },
        { t: 'list', items: [
          '<strong>Kapénkový</strong> — větší kapénky z kašle, kýchání či mluvení doletí ~1–2 m a rychle spadnou. Typické pro většinu respiračních infekcí.',
          '<strong>Aerosolový (vzdušný)</strong> — drobné částice visí ve vzduchu minuty až hodiny a šíří se po místnosti. Proto pomáhá <em>větrání</em> a <em>respirátory</em>; aerosoly hrají roli např. u spalniček a COVID-19.',
          '<strong>Kontaktní</strong> — dotyk kontaminovaného povrchu (klika, madlo) nebo podání ruky a následné sáhnutí do obličeje. Proto <em>mytí a dezinfekce rukou</em>.',
          '<strong>Fekálně-orální</strong> — kontaminovaná voda nebo jídlo (cholera, břišní tyfus). Historicky nejčastější příčina velkých epidemií — a téma hry <em>Záhada z Oyster Bay</em>.',
          '<strong>Vektorový</strong> — přenos hmyzem (komár → malárie, klíště → borelióza). V našich hrách se neobjevuje, ale ve světě je obrovsky důležitý.',
        ] },
        { t: 'h', text: 'Reprodukční číslo R₀' },
        { t: 'p', html: '<strong>R₀</strong> (čteme „r nula") je <strong>průměrný počet lidí, které jeden nakažený nakazí</strong> v plně vnímavé populaci — tedy když nikdo nemá imunitu a neplatí žádná opatření. R₀ shrnuje tři věci dohromady: jak často se lidé potkávají, jak snadno se virus při kontaktu přenese a jak dlouho je člověk nakažlivý.' },
        { t: 'html', html: '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 my-2">' +
          ['Chřipka|1,2–2,0', 'COVID-19|2,5–3,5', 'Spalničky|12–18', 'Ebola|1,5–2,5'].map((d) => {
            const [n, r] = d.split('|');
            return `<div class="bg-gray-50 rounded-lg p-3 text-center"><div class="text-xs text-gray-500">${n}</div><div class="text-lg font-black text-gray-900">${r}</div></div>`;
          }).join('') + '</div>' },
        { t: 'p', html: 'Čím vyšší R₀, tím nakažlivější nemoc a tím těžší zastavení. Spalničky s R₀ ≈ 15 patří k nejnakažlivějším nemocem vůbec — jeden případ může v nechráněné populaci spustit obrovské ohnisko.' },
        { t: 'info', title: 'R₀ vs R<sub>eff</sub>', html: 'R₀ je <em>teoretická</em> hodnota pro plně vnímavou populaci. V průběhu epidemie ale lidé získávají imunitu a zavádějí se opatření — proto v praxi sledujeme <strong>R<sub>eff</sub></strong> (efektivní reprodukční číslo), které tohle zohledňuje. <strong>Celý cíl krizového řízení se dá shrnout do jediné nerovnosti: dostat R<sub>eff</sub> pod 1.</strong> Když R<sub>eff</sub> &lt; 1, každá generace nakažených je menší než předchozí a epidemie ustupuje.' },
        { t: 'h', text: 'Exponenciální růst' },
        { t: 'p', html: 'Když R > 1, počet nakažených neroste rovnoměrně, ale <strong>exponenciálně</strong> — zdvojnásobuje se v pravidelných intervalech. To je nejméně intuitivní a nejnebezpečnější vlastnost epidemií: dlouho to vypadá „v klidu", a pak to vystřelí. Při R = 2 a generačním čase 5 dní vychází:' },
        { t: 'html', html: '<div class="bg-red-50 border border-red-200 rounded-lg p-4"><div class="grid grid-cols-6 gap-2 text-center text-xs">' +
          [['Den 0', 1], ['Den 5', 2], ['Den 10', 4], ['Den 15', 8], ['Den 20', 16], ['Den 25', 32]].map(([d, n]) =>
            `<div><div class="text-gray-500">${d}</div><div class="text-lg font-black text-red-600">${n}</div></div>`
          ).join('') + '</div><p class="text-xs text-red-700 mt-2 text-center">Z 1 nakaženého na 32 za 25 dní. Po 50 dnech: 1 024. Po 100 dnech: přes milion. Proto se vyplatí zasáhnout brzy.</p></div>' },
        { t: 'h', text: 'Generační čas' },
        { t: 'p', html: '<strong>Generační čas</strong> je průměrná doba mezi nákazou jednoho člověka a nákazou těch, které nakazí dál. Spolu s R určuje, jak <em>rychle</em> epidemie poroste. Dvě nemoci se stejným R₀, ale různým generačním časem rostou různě rychle — kratší generační čas znamená prudší nástup.' },
        { t: 'h', text: 'Lidé se nepotkávají náhodně — kontaktní matice' },
        { t: 'p', html: 'Děti mají nejvíc kontaktů ve škole, dospělí v práci, senioři v komunitě. Tuto strukturu zachycuje <strong>kontaktní matice</strong> — tabulka průměrného počtu kontaktů mezi věkovými skupinami:' },
        { t: 'html', html: '<div class="overflow-x-auto"><table class="border-collapse text-xs mx-auto"><thead><tr>' +
          ['', 'Děti', 'Dospělí', 'Senioři'].map((h) => `<th class="px-3 py-1 border border-gray-300 bg-gray-100">${h}</th>`).join('') +
          '</tr></thead><tbody>' +
          [['Děti', '8 (škola)', '3 (doma)', '1'], ['Dospělí', '3 (doma)', '6 (práce)', '2'], ['Senioři', '1', '2', '3 (komunita)']].map((row) =>
            `<tr><td class="px-3 py-1 border border-gray-300 bg-gray-100 font-bold">${row[0]}</td>` + row.slice(1).map((c) => `<td class="px-3 py-1 border border-gray-300 text-center">${c}</td>`).join('') + '</tr>'
          ).join('') + '</tbody></table></div>' },
        { t: 'p', html: 'Uzavření škol dramaticky sníží kontakty ve školní „buňce" (8 → ~2), ale neovlivní pracovní kontakty dospělých. Proto je nutné <strong>kombinovat</strong> opatření podle toho, kde virus zrovna cirkuluje — a proto má smysl modelovat věkové skupiny zvlášť.' },
      ],
      vs: [
        { t: 'p', html: 'Než začneme cokoli modelovat, musíme poznat nepřítele a to, co dělá v jednom těle. Klinický průběh u jednotlivce totiž rozhoduje o dvou věcech, na kterých všechno další stojí: jak <strong>závažná</strong> nemoc je a jak — a hlavně kdy — je nemocný člověk <strong>nakažlivý</strong>. Obojí se rodí ze stejné biologie, jen se na ni díváme jednou očima lékaře a podruhé očima epidemiologa.' },
        { t: 'h', text: 'Přirozený průběh nákazy' },
        { t: 'p', html: 'Od okamžiku nákazy běží v hostiteli dvě časové osy, které se <strong>nekryjí</strong> — jedna <em>biologická</em> (kdy je člověk nakažlivý), druhá <em>klinická</em> (kdy má příznaky):' },
        { t: 'diagram', html: 'nákaza ──[ latence ]──▶ počátek infekčnosti ──────▶ konec infekčnosti<br>nákaza ──[ inkubace ]────────▶ nástup příznaků ──▶ uzdravení / úmrtí' },
        { t: 'p', html: 'Je-li <strong>latence kratší než inkubace</strong>, vzniká <strong>presymptomatické okno</strong> — člověk nakažuje dřív, než se cítí nemocný. Část nakažených zůstane <strong>asymptomatická</strong>, ale infekční. Tato „skrytá" infekčnost později rozhodne, jak dobře půjde epidemii vůbec kontrolovat (kapitola o trasování).' },
        { t: 'h', text: 'Klinický obraz a závažnost' },
        { t: 'p', html: 'Táž nákaza vyvolá <strong>spektrum</strong> průběhů: od asymptomatického přes lehký a těžký až po kritický a fatální. Závažnost shrnují dvě snadno zaměnitelné míry:' },
        { t: 'list', items: [
          '<strong>IFR</strong> (infection fatality ratio) — podíl <em>všech nakažených</em> (i nezachycených), kteří zemřou; vyžaduje séroprevalenci.',
          '<strong>CFR</strong> (case fatality ratio) — podíl <em>diagnostikovaných</em>, kteří zemřou; závisí na intenzitě testování, proto bývá nadhodnocený a mezi zeměmi nesrovnatelný.',
        ] },
        { t: 'p', html: 'Závažnost není rovnoměrná: u SARS-CoV-2 je věkově specifické IFR nejnižší u dětí (~5–9 let) a od 30 let roste přibližně <strong>log-lineárně</strong> s věkem. Tento strmý gradient je důvod, proč na úrovni populace tolik záleží na <em>věkové struktuře</em> a proč se priorizuje ochrana seniorů.' },
        { t: 'refs', items: [REF.odriscoll2021] },
        { t: 'p', html: 'Klinický obraz není jen „medicína pacienta": určuje <strong>zatížení nemocnic</strong> (proto „zploštění křivky") a přes vztah příznaky↔infekčnost i <strong>ovladatelnost</strong> epidemie.' },
        { t: 'h', text: 'Od jednoho těla k profilu infekčnosti' },
        { t: 'p', html: 'Zprůměrujeme-li průběh u jednoho hostitele, dostaneme <strong>profil infekčnosti</strong> β(τ) — očekávanou míru přenosu v čase τ od nákazy. Bazální reprodukční číslo je jeho integrál přes infekční periodu: <strong>R₀ = ∫₀^∞ β(τ) dτ</strong>. Tvar β(τ) je tentýž biologický fakt, který výše určoval presymptomatické okno — jen viděný optikou přenosu.' },
        { t: 'h', text: 'Klíčové intervaly' },
        { t: 'list', items: [
          '<strong>Latentní</strong> vs. <strong>inkubační</strong> doba — viz výše; jejich rozdíl tvoří presymptomatické okno.',
          '<strong>Generační interval T<sub>g</sub></strong> — doba mezi nákazou nakažujícího a jím nakaženého (přímo nepozorovatelný).',
          '<strong>Sériový interval T<sub>s</sub></strong> — doba mezi nástupem příznaků nakažujícího a nakaženého (pozorovatelný; při presymptomatickém přenosu i záporný).',
        ] },
        { t: 'info', title: 'Proč na tom záleží: vztah r ↔ R', html: 'V datech vidíme růst r, ale rozhodovat chceme podle R. Převod vyžaduje rozdělení generačního intervalu g(τ): <strong>1/R = ∫ e^(−rτ) g(τ) dτ</strong> (Lotkova–Eulerova rovnice). Předpoklad „vše rovno průměru T<sub>g</sub>" dává horní mez R; rozptýlenější g(τ) dává R nižší. Odhad R z r je tedy citlivý na to, co o průběhu nákazy víme.' },
        { t: 'refs', items: [REF.wallinga2007] },
        { t: 'h', text: 'Ne každý nakažený je „průměrný" — superspreading' },
        { t: 'p', html: 'R₀ je ovšem jen <em>průměr</em>. Kolik lidí nakazí konkrétní člověk, se liší obrovsky — a to rozdělení je u řady nákaz silně nesymetrické: většinu přenosů obstará menšina nakažených (jev zvaný <strong>superspreading</strong>), zatímco většina nenakazí téměř nikoho. Tuto nerovnoměrnost popisuje negativně binomické rozdělení s disperzním parametrem <strong>k</strong> — čím menší k, tím extrémnější superspreading (pro SARS bylo k ≈ 0,16). Má to tři praktické důsledky: zavlečení do nové oblasti častěji samo odezní, ohniska jsou vzácnější, ale prudší, a hlavně se vyplatí cílit opatření na rizikové prostředí (velké vnitřní akce) místo plošného zavírání. Tím se otevírá kapitola o trasování.' },
        { t: 'info', title: 'Sekundární attack rate (SAR)', html: 'Podíl vnímavých kontaktů, kteří onemocní po expozici jednomu nakaženému v daném prostředí. Je to praktická míra infekčnosti „na místě": v domácnosti bývá vysoký, ve veřejném prostoru nízký — proto se opatření liší podle prostředí.' },
        { t: 'refs', items: [REF.lloydSmith2005] },
        { t: 'gloss', items: [
          { term: 'Latence', def: 'doba od nákazy do okamžiku, kdy začne být člověk nakažlivý (biologická osa).' },
          { term: 'Inkubační doba', def: 'doba od nákazy do prvních příznaků (klinická osa). Když je kratší než latence vznikne presymptomatické okno.' },
          { term: 'Presymptomatický přenos', def: 'nákaza dalších lidí dřív, než se zdroj cítí nemocný — hlavní důvod, proč je část nemocí těžké zastavit izolací podle příznaků.' },
          { term: 'IFR / CFR', def: 'IFR = podíl zemřelých ze <em>všech</em> nakažených; CFR = podíl zemřelých z <em>diagnostikovaných</em>. CFR bývá vyšší, protože nezachytí mírné a skryté případy.' },
          { term: 'Séroprevalence', def: 'podíl populace s protilátkami v krvi — odhad, kolik lidí už nemoc skutečně prodělalo (i bezpříznakově). Bez ní nelze spočítat IFR.' },
          { term: 'Generační vs. sériový interval', def: 'generační = doba mezi nákazami (nepozorovatelná); sériový = doba mezi <em>příznaky</em> nakažujícího a nakaženého (změřitelná, slouží jako náhrada).' },
          { term: 'Profil infekčnosti β(τ)', def: 'jak silně člověk nakažuje v čase τ od nákazy; jeho plocha (integrál) je R₀.' },
          { term: 'Disperzní parametr k', def: 'míra nerovnoměrnosti přenosu. Malé k = silný superspreading (pár lidí nakazí mnoho).' },
        ] },
        { t: 'p', html: '<em>Kam dál:</em> Lloyd-Smith et al. (2005, viz výše) k superspreadingu; k odhadu intervalů a IFR jsou dobrým rozcestníkem přehledové práce skupin LSHTM a Imperial College, na něž odkazují citace v dalších kapitolách.' },
      ],
    },
  },

  // ═══════════════════ EPIDEMIOLOGICKÉ MODELY ═══════════════════
  {
    id: 'modely',
    label: 'Epidemiologické modely',
    icon: '📊',
    title: 'Epidemiologické modely',
    content: {
      zs: [
        { t: 'p', html: 'Model je jako <strong>zjednodušená mapa</strong> — neukáže každý strom, ale pomůže najít cestu. Epidemiologové si rozdělí lidi do skupin podle toho, v jakém jsou stavu.' },
        { t: 'diagram', html: seirDiagram },
        { t: 'list', items: [
          '<strong>S</strong> — ještě zdravý, může se nakazit',
          '<strong>E</strong> — nakažený, ale ještě nikoho nenakazí',
          '<strong>I</strong> — nemocný a nakažlivý',
          '<strong>R</strong> — uzdravený, většinou už chráněný',
        ] },
        { t: 'info', title: 'Stádní imunita', html: 'Když je hodně lidí chráněných (po nemoci nebo očkování), virus nemá koho nakazit a epidemie ustane.' },
      ],
      ss: [
        { t: 'p', html: 'Model je <strong>zjednodušený popis reality</strong>, který zachytí to podstatné a zbytek vědomě vynechá. Statistik George Box to shrnul slavnou větou: <em>„Všechny modely jsou špatné, ale některé jsou užitečné."</em> Užitečnost epidemiologického modelu není v tom, že předpoví přesné číslo, ale že nám ukáže <strong>mechanismus</strong> — proč epidemie roste, kdy kulminuje a co s ní udělá konkrétní opatření.' },
        { t: 'h', text: 'Kompartmentové modely a SEIR' },
        { t: 'p', html: 'Nejrozšířenější rodina modelů rozdělí populaci do <strong>kompartmentů</strong> (přihrádek) podle stavu vůči nemoci a sleduje, jak lidé mezi nimi přecházejí. Náš simulátor používá model <strong>SEIR</strong> se čtyřmi kompartmenty:' },
        { t: 'diagram', html: seirDiagram },
        { t: 'html', html:
          '<div class="space-y-2">' +
          '<div class="bg-blue-50 rounded-lg p-3"><span class="font-bold text-blue-800">S (Susceptible)</span> <span class="text-sm text-blue-700">— vnímavý, může se nakazit. Na začátku epidemie sem patří téměř celá populace.</span></div>' +
          '<div class="bg-yellow-50 rounded-lg p-3"><span class="font-bold text-yellow-800">E (Exposed)</span> <span class="text-sm text-yellow-700">— nakažený, ale ještě <em>není</em> nakažlivý — prochází inkubační dobou (typicky 3–5 dní).</span></div>' +
          '<div class="bg-red-50 rounded-lg p-3"><span class="font-bold text-red-800">I (Infectious)</span> <span class="text-sm text-red-700">— infekční, aktivně přenáší virus na vnímavé. Trvá typicky 5–10 dní.</span></div>' +
          '<div class="bg-green-50 rounded-lg p-3"><span class="font-bold text-green-800">R (Recovered)</span> <span class="text-sm text-green-700">— uzdravený (nebo zemřelý), získává imunitu, dočasnou nebo trvalou.</span></div>' +
          '</div>' },
        { t: 'h', text: 'Jak model počítá' },
        { t: 'p', html: 'Každý „krok" (typicky den) model spočítá, kolik lidí se přesune mezi kompartmenty. Přechody řídí tři rychlosti:' },
        { t: 'list', items: [
          '<strong>S → E</strong> — závisí na počtu infekčních (I), počtu kontaktů a přenosnosti viru <strong>β</strong> (beta). Více infekčních a více kontaktů = více nových nákaz.',
          '<strong>E → I</strong> — rychlost <strong>σ = 1/inkubační doba</strong>. Při inkubaci 5 dní se každý den „dospěje" zhruba pětina exponovaných.',
          '<strong>I → R</strong> — rychlost <strong>γ = 1/doba infekčnosti</strong>. Při infekčnosti 7 dní se každý den uzdraví zhruba sedmina infekčních.',
        ] },
        { t: 'info', title: 'Síla infekce (klíčový vztah)', html: 'Tempo nových nákaz určuje <strong>síla infekce</strong>: λ = β × (kontakty) × (I / N). Čím víc infekčních lidí v populaci (I/N) a čím víc kontaktů, tím rychleji virus přibývá. <strong>Každé opatření působí přesně na jeden z těchto členů</strong> — roušky a hygiena snižují β, uzavření škol a lockdown snižují počet kontaktů.' },
        { t: 'p', html: 'Pro nejjednodušší variantu platí přehledný vztah <strong>R₀ ≈ β × c × D</strong> (přenosnost × kontakty × doba infekčnosti). Ukazuje, že nakažlivost nemoci není jen vlastnost viru — záleží i na tom, jak se v dané společnosti lidé potkávají.' },
        { t: 'h', text: 'Epidemická křivka a „zploštění"' },
        { t: 'p', html: 'Když model spustíme, počet infekčních nejdřív roste, dosáhne <strong>vrcholu</strong> (když dojdou vnímaví nebo zaberou opatření) a pak klesá. Tomu se říká <strong>epidemická křivka</strong>. Opatření mají dvojí cíl: snížit <em>celkový</em> počet nakažených a hlavně <strong>zploštit křivku</strong> — rozložit případy v čase tak, aby nemocnice stíhaly. Stejně vysoký vrchol, který přijde najednou, zahltí JIP; rozložený v čase se dá zvládnout.' },
        { t: 'h', text: 'R<sub>eff</sub> a stádní imunita' },
        { t: 'p', html: 'Jak se lidé přesouvají do R, klesá podíl vnímavých S/N — a s ním klesá efektivní reprodukční číslo:' },
        { t: 'diagram', html: 'R<sub>eff</sub> = R₀ × (S / N) × (efekt opatření)<br><span class="text-gray-400">Když R<sub>eff</sub> &lt; 1, epidemie ustupuje.</span>' },
        { t: 'p', html: '<strong>Stádní (kolektivní) imunita</strong> nastane, když je imunních tolik lidí, že nakažený statisticky nepotká dost vnímavých, aby nemoc předal dál — i bez opatření pak R<sub>eff</sub> klesne pod 1. Potřebný podíl roste s R₀:' },
        { t: 'html', html: '<div class="grid grid-cols-3 gap-3 my-2">' +
          [['Chřipka (R₀≈1,5)', '~33 %'], ['COVID-19 (R₀≈3)', '~67 %'], ['Spalničky (R₀≈15)', '~93 %']].map(([n, v]) =>
            `<div class="bg-gray-50 rounded-lg p-3 text-center"><div class="text-xs text-gray-500">${n}</div><div class="text-lg font-black text-brand-teal-dark">${v}</div></div>`
          ).join('') + '</div>' },
        { t: 'p', html: 'Proto se u vysoce nakažlivých nemocí (spalničky) klade takový důraz na vysokou proočkovanost — i malý pokles pod práh otevírá dveře ohnisku.' },
        { t: 'h', text: 'Deterministický vs. stochastický model' },
        { t: 'p', html: 'Náš základní model je <strong>deterministický</strong> — pro stejné vstupy dá vždy stejný výsledek, počítá s „průměrnou" populací. Realita je ale <strong>stochastická</strong> (náhodná): při malém počtu případů může nákaza náhodou vymřít, nebo naopak jeden superspreading event spustí velké ohnisko. Stochastické modely proto počítají mnoho scénářů a dívají se na rozdělení výsledků, nikoliv na jediné číslo.' },
        { t: 'warn', title: 'Co náš model nezachycuje', html: 'Model je <strong>deterministický a homogenní</strong> — nezachycuje superspreading (kdy ~10 % nakažených způsobí ~80 % přenosů), heterogenitu kontaktů uvnitř věkových skupin, prostorovou strukturu (město vs. vesnice), sezónnost, změny chování v reakci na média ani evoluci viru v reálném čase. Přesto dobře vystihuje <em>podstatu</em> — exponenciální dynamiku a účinek opatření. To k pochopení principů stačí; k reálné předpovědi by bylo potřeba mnohem víc.' },
      ],
      vs: [
        { t: 'p', html: 'Zatím jsme mluvili o jednom nakaženém. Teď ho rozmnožíme na celou populaci. Ukáže se, že chování miliónů lidí jde překvapivě dobře shrnout několika rovnicemi — model je totiž v jádru jen pečlivé účetnictví toho, co jsme popsali u jednotlivce: kolik lidí dnes přejde z vnímavých mezi nakažené a z nakažených mezi uzdravené.' },
        { t: 'p', html: 'Deterministický model SEIR v dobře promíchané populaci o velikosti N zapíšeme jako soustavu diferenciálních rovnic:' },
        { t: 'diagram', html: 'dS/dt = −β·S·I/N<br>dE/dt = β·S·I/N − σ·E<br>dI/dt = σ·E − γ·I<br>dR/dt = γ·I' },
        { t: 'p', html: 'Exponenciálně rozdělené doby setrvání (rychlosti σ, γ) jsou matematicky pohodlné, ale empiricky nerealistické (zákon „bez paměti"). Realističtější je <strong>Erlangovo</strong> rozdělení — řetězení n sub-kompartmentů (metoda „linear chain trick"), které zužuje rozptyl dob a mění tvar epidemické křivky i přechodovou dynamiku.' },
        { t: 'h', text: 'R₀ přes next-generation matrix' },
        { t: 'p', html: 'Pro jednoduchý SIR platí <strong>R₀ = β/γ</strong>. Obecně se R₀ definuje jako spektrální poloměr (dominantní vlastní číslo) <strong>next-generation operátoru</strong>. Linearizací kolem bezinfekčního stavu rozložíme jakobián infekčních tříd na <strong>F</strong> (vznik nových nákaz) a <strong>V</strong> (přechody/odchody); pak:' },
        { t: 'diagram', html: 'R₀ = ρ( F · V⁻¹ )<br><span class="text-gray-400">ρ = spektrální poloměr; prvky FV⁻¹ = očekávaný počet nákaz typu i od jedince typu j</span>' },
        { t: 'p', html: 'Tento aparát korektně zahrne <strong>heterogenitu</strong> (věkové třídy, prostředí, více stavů infekčnosti) — proto je standardem tam, kde „R₀ = β/γ" selhává. Konstrukci F a V s epidemiologickou interpretací prvků podrobně rozebírá referovaná práce.' },
        { t: 'refs', items: [REF.diekmann2009] },
        { t: 'h', text: 'Práh a finální velikost epidemie' },
        { t: 'info', title: 'Práh stádní imunity', html: 'Kritický podíl imunních H<sub>c</sub> = 1 − 1/R₀ (homogenní model). Pro R₀ = 3 ~67 %. Při heterogenitě a neuniformním očkování se práh posouvá; sterilizující vs. transmisní účinnost vakcíny mění výpočet (efektivní R₀ se násobí (1 − ε·v)).' },
        { t: 'p', html: 'Pro uzavřenou epidemii dává <strong>rovnice finální velikosti</strong> podíl nakažených z∞ implicitně: <strong>z∞ = 1 − e^(−R₀·z∞)</strong>. Ukazuje, že bez intervence prodělá nákazu výrazně víc lidí, než kolik činí práh H<sub>c</sub> (epidemiologický „overshoot").' },
        { t: 'h', text: 'Proč nezáleží jen na ploše pod křivkou' },
        { t: 'p', html: 'Stejný počet celkově nakažených může proběhnout buď jako prudká vlna, nebo jako rozprostřené pásmo. Pro zdravotnictví je rozdíl zásadní — rozhoduje výška vrcholu vůči kapacitě, ne jen plocha. Cílem opatření proto bývá křivku <strong>zploštit</strong> tak, aby okamžitá poptávka po lůžkách nepřekročila nabídku:' },
        { t: 'html', html: flattenCurveSvg },
        { t: 'p', html: 'Červená vlna sice odezní rychleji, ale její vrchol leží vysoko nad kapacitou — část pacientů se nedostane k péči a úmrtnost stoupne. Tatáž nákaza rozložená v čase (tyrkysová) se vejde pod čáru kapacity. Plocha pod oběma křivkami se přitom může lišit jen málo.' },
        { t: 'h', text: 'Vazba na reálný čas a R<sub>t</sub>' },
        { t: 'p', html: 'Zbývá spojit teorii s tím, co reálně vidíme v datech — totiž s tempem růstu. V rané fázi roste počet případů exponenciálně rychlostí <strong>r</strong> (Malthusovský růstový parametr) a platí jednoduchá ekvivalence: R₀ &gt; 1 právě tehdy, když r &gt; 0. Časově proměnné R<sub>t</sub> pak odhadujeme buď z tohoto tempa, nebo z renewal rovnice (Cori et al.) — v obou případech ale potřebujeme znát rozdělení generačního intervalu.' },
        { t: 'warn', title: 'Když je nakažených málo, rozhoduje náhoda', html: 'Deterministický model dává smysl jen u velkých čísel; na začátku a na konci epidemie (kdy je infekčních pár) je namístě <strong>větvící proces</strong> (model Galton–Watson). Pravděpodobnost, že řetězec z jednoho případu sám vyhasne, je nejmenší kořen rovnice q = G(q), kde G je vytvořující funkce počtu potomků. Pro Poissonovo potomstvo se střední hodnotou R₀ řeší q = e^(R₀(q−1)) — třeba pro R₀ = 2 vyjde q ≈ 0,20. (Známý vztah „pravděpodobnost velkého ohniska = 1 − 1/R₀" platí jen pro speciální geometrické rozdělení; při silném superspreadingu je vyhasnutí ještě pravděpodobnější.) Proto i nemoc s R₀ &gt; 1 po zavlečení nezřídka sama odezní.' },
        { t: 'gloss', items: [
          { term: 'Malthusovský růstový parametr (r)', def: 'rychlost exponenciálního růstu epidemie v rané fázi — sklon přímky, když počet případů vyneseme do logaritmického grafu. Kladné r znamená, že epidemie roste; r &gt; 0 odpovídá R₀ &gt; 1. Pojmenováno po Thomasi Malthusovi, který exponenciální růst populace popsal už roku 1798.' },
          { term: 'Kompartment', def: '„přihrádka" populace podle stavu vůči nemoci (S, E, I, R). Model přesouvá lidi mezi kompartmenty.' },
          { term: 'Doba „bez paměti"', def: 'předpoklad, že pravděpodobnost přechodu (např. uzdravení) nezávisí na tom, jak dlouho už člověk ve stavu je. Vede k exponenciálnímu rozdělení dob; realitě lépe odpovídá Erlangovo rozdělení.' },
          { term: 'Next-generation matrix (NGM)', def: 'tabulka „kdo koho v průměru nakazí" mezi typy jedinců (věk, prostředí). R₀ je její největší vlastní číslo (spektrální poloměr). Umožní spočítat R₀ i tam, kde nestačí prosté β/γ.' },
          { term: 'Spektrální poloměr ρ', def: 'největší vlastní číslo matice v absolutní hodnotě — určuje, zda systém v čase roste (ρ &gt; 1), nebo klesá.' },
          { term: 'Práh stádní imunity (H_c)', def: 'podíl imunních, při kterém R<sub>eff</sub> klesne pod 1 i bez opatření: H_c = 1 − 1/R₀.' },
          { term: 'Větvící proces (Galton–Watson)', def: 'náhodný model, kde každý nakažený „zplodí" náhodný počet dalších; popisuje osud epidemie při malých počtech (zda vyhasne).' },
          { term: 'Vytvořující funkce (PGF)', def: 'kompaktní zápis celého rozdělení pravděpodobnosti počtu potomků; pomocí ní se počítá pravděpodobnost vyhasnutí.' },
        ] },
        { t: 'p', html: '<em>Kam dál:</em> Diekmann et al. (2009, viz výše) k sestavení NGM; klasikou je práce Kermacka &amp; McKendricka (1927), která kompartmentový model zavedla.' },
      ],
    },
  },

  // ══════════════════ OPATŘENÍ A INTERVENCE ══════════════════
  {
    id: 'opatreni',
    label: 'Opatření a intervence',
    icon: '🛡️',
    title: 'Opatření a intervence',
    content: {
      zs: [
        { t: 'p', html: 'Než je vakcína, můžeme šíření zpomalit <strong>chováním</strong>. Každé opatření ale něco stojí — peníze, čas nebo pohodlí.' },
        { t: 'list', items: [
          '<strong>Roušky a respirátory</strong> — chytí kapénky',
          '<strong>Odstup a méně akcí</strong> — méně příležitostí k nákaze',
          '<strong>Mytí rukou a větrání</strong> — levné a účinné',
          '<strong>Očkování</strong> — připraví tělo na obranu',
        ] },
        { t: 'info', title: 'Vždycky je to kompromis', html: 'Zavřít školy zastaví hodně nákaz, ale děti se neučí a rodiče nemohou do práce. Proto se opatření vybírají opatrně.' },
      ],
      ss: [
        { t: 'p', html: '<strong>NPI</strong> (nefarmaceutické intervence) jsou nástroje, kterými lze ovlivnit šíření viru <strong>bez vakcíny a léků</strong> — tedy hned na začátku epidemie, kdy ještě nic jiného nemáme. Patří sem roušky, distanc, testování, trasování i lockdown. Každé opatření má tři „ceny": epidemiologickou účinnost, ekonomický dopad a politickou (společenskou) cenu.' },
        { t: 'h', text: 'Dva mechanismy účinku' },
        { t: 'html', html: '<div class="grid md:grid-cols-2 gap-4">' +
          '<div class="bg-blue-50 rounded-lg p-4"><div class="font-bold text-blue-800 mb-2">1. Snížení přenosnosti (β)</div><p class="text-xs text-blue-700">Roušky, respirátory, hygiena rukou, dezinfekce, větrání. Lidé se potkávají stejně, ale šance na přenos při každém kontaktu klesá. Levnější a méně rušivé.</p></div>' +
          '<div class="bg-emerald-50 rounded-lg p-4"><div class="font-bold text-emerald-800 mb-2">2. Snížení počtu kontaktů</div><p class="text-xs text-emerald-700">Uzavření škol, home-office, zákaz akcí, lockdown. Lidé se potkávají méně, virus má méně příležitostí. Silnější efekt, ale vyšší ekonomická a sociální cena.</p></div>' +
          '</div>' },
        { t: 'h', text: 'Přehled hlavních opatření' },
        { t: 'html', html: '<div class="overflow-x-auto"><table class="border-collapse text-xs w-full"><thead><tr>' +
          ['Opatření', 'Mechanismus', 'Orientační účinek', 'Cena'].map((h) => `<th class="px-2 py-1.5 border border-gray-200 bg-gray-100 text-left">${h}</th>`).join('') +
          '</tr></thead><tbody>' +
          [['Roušky (vnitřní prostory)', 'β', '~15 % méně přenosu', 'nízká'],
           ['Respirátory FFP2', 'β', '~30 % méně přenosu', 'střední'],
           ['Větrání / čističky', 'β', 'snižuje aerosoly', 'nízká'],
           ['Testování + izolace', 'kontakty', 'odhalí a odřízne případy', 'střední'],
           ['Trasování kontaktů', 'kontakty', 'přeruší řetězce cíleně', 'střední'],
           ['Zákaz hromadných akcí', 'kontakty', 'ruší superspreading', 'střední'],
           ['Uzavření škol', 'kontakty', '~80 % školních kontaktů', 'vysoká'],
           ['Home-office', 'kontakty', '~60 % pracovních kontaktů', 'vysoká'],
           ['Lockdown', 'kontakty', 'nejsilnější, plošný', 'extrémní'],
           ['Očkování', 'imunita', 'mění S/N i závažnost', 'řešení dlouhodobě']].map((row) =>
            '<tr>' + row.map((c, i) => `<td class="px-2 py-1.5 border border-gray-200 ${i === 0 ? 'font-semibold text-gray-800' : 'text-gray-600'}">${c}</td>`).join('') + '</tr>'
          ).join('') + '</tbody></table></div>' },
        { t: 'p', html: 'Čísla jsou orientační — skutečný efekt závisí na variantě viru, dodržování a kombinaci s dalšími opatřeními. Platí ale obecné pravidlo: <strong>čím silnější zásah do kontaktů, tím vyšší cena</strong>. Uzavření škol je velmi účinné (děti bývají u respiračních nákaz „motorem" šíření), ale dopadá na vzdělání a na rodiny, kde rodiče nemohou do práce.' },
        { t: 'info', title: 'Načasování rozhoduje', html: 'Kvůli exponenciálnímu růstu nezáleží jen na tom <em>co</em>, ale hlavně <em>kdy</em>. Týden zpoždění může znamenat dvoj- až čtyřnásobek případů na vrcholu. Epidemiologické pravidlo zní „<strong>act early, act hard</strong>" — zasáhnout brzy a rázně bývá nakonec levnější (i lidsky) než váhat a pak zavádět tvrdší opatření na delší dobu.' },
        { t: 'h', text: 'Kombinace a „švýcarský sýr"' },
        { t: 'p', html: 'Žádné jednotlivé opatření není stoprocentní — každé má „díry". Model <strong>švýcarského sýra</strong> říká, že vrstvy nedokonalých opatření za sebou (roušky + větrání + testování + distanc) se doplňují: co propustí jedna vrstva, zachytí další. Proto se opatření <strong>kombinují</strong> a cílí tam, kde virus zrovna cirkuluje (škola vs. práce vs. komunita).' },
        { t: 'h', text: 'Dodržování a únava' },
        { t: 'p', html: 'Opatření funguje jen tak dobře, jak ho lidé <strong>dodržují</strong>. V čase navíc nastupuje <em>únava</em> — ochota dodržovat klesá, zvlášť když lidé nevidí smysl nebo autoritě nevěří. Proto je „měkká" stránka (důvěra, komunikace) stejně důležitá jako „tvrdá" účinnost opatření. Tohle modelujeme i ve hře jako <em>sociální kapitál</em>.' },
        { t: 'h', text: 'Očkování — dlouhodobé řešení' },
        { t: 'p', html: 'Vakcíny působí jinak než NPI: přesouvají lidi rovnou do (částečně) imunního stavu, snižují závažnost průběhu a posouvají populaci k prahu stádní imunity. Nejsou hned (vývoj, výroba, kapacita očkování) a nebývají 100% účinné, ale jako jediné nabízejí <strong>trvalou</strong> ochranu bez omezování běžného života. Priorita očkování (senioři, rizikoví) je sama o sobě strategické rozhodnutí — koho chránit nejdřív.' },
        { t: 'warn', title: 'Kompromis zdraví × ekonomika × společnost', html: 'Žádné opatření není zadarmo. Tvrdý lockdown zachrání životy, ale ničí ekonomiku, vzdělání a duševní zdraví; žádná opatření zase znamenají přetížené nemocnice a víc úmrtí. Dobrý krizový štáb nehledá „nejtvrdší", ale <strong>nejlepší poměr efektu a ceny</strong> — a tu volbu nikdy nedělá jen epidemiolog.' },
      ],
      vs: [
        { t: 'p', html: 'Známe nepřítele i jeho dynamiku v populaci a víme, kde leží práh R<sub>eff</sub> = 1. Teď přichází otázka, kvůli které to celé děláme: jak křivku ohnout? Vraťme se k síle infekce — každé opatření je pokus zasáhnout do jednoho z jejích členů, buď do přenosnosti při kontaktu, nebo do počtu kontaktů.' },
        { t: 'p', html: 'V modelu to znamená dvě věci: opatření buď sníží přenosnost β na (1 − ε)·β (kde ε je účinnost), nebo přeškálují <strong>kontaktní matici</strong> — a to cíleně po prostředích, protože uzavření škol se dotkne jiných políček než home-office. Efektivní reprodukční číslo pak spočítáme jako spektrální poloměr takto upravené next-generation matrix.' },
        { t: 'h', text: 'Jak se efekt opatření vlastně změří' },
        { t: 'p', html: 'Měřit účinnost opatření je překvapivě ošemetné. Nejspolehlivějším signálem bývají <strong>úmrtí</strong> (méně závisí na intenzitě testování než počty případů), jenže přicházejí s několikatýdenním zpožděním. Moderní studie proto počítají <em>pozpátku</em>: od pozorovaných úmrtí přes známé zpoždění a IFR zrekonstruují, kolik lidí se muselo nakazit o týdny dřív, a teprve z toho odhadují, jak se R<sub>t</sub> měnilo s jednotlivými opatřeními. Informace se přitom sdílí mezi zeměmi, aby data z jedné pomohla zpřesnit odhad pro druhou.' },
        { t: 'p', html: 'Takto vznikl známý odhad z 11 evropských zemí: na jaře 2020 stlačila opatření — především lockdowny — R<sub>t</sub> s vysokou jistotou pod 1, přičemž do začátku května bylo nakaženo jen kolem 3–4 % populace. Schematicky vypadá ten zlom takto:' },
        { t: 'html', html: rtCurveSvg },
        { t: 'p', html: 'Dokud se R<sub>t</sub> drží nad prahem 1, epidemie roste; jakmile ho zavedená opatření stlačí pod 1, počty začnou klesat. I tento výsledek ale stojí na předpokladech (pevné IFR, skoková reakce R na opatření), které jsou samy zdrojem nejistoty.' },
        { t: 'refs', items: [REF.flaxman2020] },
        { t: 'warn', title: 'Proč nevíme, co zabralo nejvíc', html: 'Opatření se obvykle zaváděla během pár dní po sobě. Statisticky jsou pak jejich účinky <strong>nerozlišitelné</strong> (kolineární) — model klidně přisoudí celý pokles tomu poslednímu, ale je to artefakt, nikoliv důkaz. Navíc se „efekt nařízení" mísí s tím, že lidé omezují kontakty <em>sami od sebe</em>, jakmile vnímají riziko. Proto se velikosti efektů z jedné vlny nebo země nedají mechanicky přenášet jinam.' },
        { t: 'gloss', items: [
          { term: 'NPI', def: 'nefarmaceutická intervence — opatření působící bez léků a vakcín (roušky, distanc, uzavírky, trasování).' },
          { term: 'Kontaktní matice', def: 'tabulka průměrného počtu kontaktů mezi skupinami (např. věkovými) v různých prostředích; opatření mění její jednotlivá políčka.' },
          { term: 'Bayesovský model', def: 'statistický přístup, který kombinuje data s předchozí znalostí (priorem) a výsledkem je celé rozdělení pravděpodobných hodnot, nikoliv jen jeden odhad — tedy přirozeně i míra nejistoty.' },
          { term: 'Partial pooling', def: 'částečné sdílení informace mezi jednotkami (zeměmi): každá má vlastní odhad, ale „půjčuje si" sílu od ostatních, což stabilizuje odhady tam, kde je dat málo.' },
          { term: 'Kolinearita', def: 'situace, kdy dvě příčiny nastávají téměř současně, takže nelze rozlišit, která za následek může.' },
          { term: 'Endogenita chování', def: 'lidé reagují na samotnou epidemii (mění kontakty podle vnímaného rizika), takže příčina a následek se proplétají a „čistý" efekt nařízení se těžko izoluje.' },
        ] },
        { t: 'p', html: '<em>Kam dál:</em> Flaxman et al. (2020, viz výše) k metodě i jejím mezím; kritickou diskusi identifikovatelnosti efektů NPI najdete v navazující literatuře skupiny Imperial College.' },
      ],
    },
  },

  // ════════════════════ TRASOVÁNÍ KONTAKTŮ ════════════════════
  {
    id: 'trasovani',
    label: 'Trasování kontaktů',
    icon: '🔍',
    title: 'Trasování kontaktů',
    content: {
      zs: [
        { t: 'p', html: 'Když někdo onemocní, epidemiolog zjistí, <strong>s kým byl v kontaktu</strong>, a upozorní je. Tak se nákaza zastaví dřív, než se rozšíří.' },
        { t: 'info', title: 'Jako detektiv', html: 'Přesně tohle děláš v <strong>Ósacké horečce</strong> — voláš kontaktům a hledáš, kdo koho nakazil.' },
        { t: 'list', items: [
          'najdi nemocného (indexový případ)',
          'zjisti jeho blízké kontakty',
          'kontakty poprosíme, ať zůstanou doma (karanténa)',
        ] },
      ],
      ss: [
        { t: 'p', html: 'Zatímco lockdown přeruší přenos <em>plošně</em> (zastaví všechny), <strong>trasování</strong> ho přeruší <em>cíleně</em> — najde konkrétní řetězce a odřízne jen je. Je to chirurgický nástroj: při správném použití udrží epidemii pod kontrolou s minimem dopadu na zbytek společnosti.' },
        { t: 'h', text: 'Základní pojmy' },
        { t: 'list', items: [
          '<strong>Indexový případ</strong> — první zachycený nemocný, od kterého začínáme pátrat.',
          '<strong>Kontakt</strong> — člověk, který byl s nemocným v rizikové blízkosti během jeho infekční periody (definice se liší: např. 15 min do 2 m).',
          '<strong>Izolace</strong> — oddělení <em>nemocného</em>, aby nenakazil další.',
          '<strong>Karanténa</strong> — oddělení <em>zdravého kontaktu</em> po dobu, než se ukáže, jestli onemocní.',
        ] },
        { t: 'h', text: 'Jak trasování probíhá' },
        { t: 'list', items: [
          'Zachytíme indexový případ (test, příznaky) a <strong>izolujeme</strong> ho.',
          'Vyzpovídáme ho a sestavíme seznam kontaktů z infekční periody.',
          'Kontakty co nejdřív <strong>vyrozumíme</strong> a pošleme do karantény / na test.',
          'Z nakažených kontaktů se stávají nové indexové případy — a postup se opakuje.',
        ] },
        { t: 'info', title: 'Dopředné vs. zpětné trasování', html: '<strong>Dopředné</strong> trasování hledá, koho indexový případ mohl nakazit (komu předejít). <strong>Zpětné</strong> trasování hledá, <em>kdo nakazil jeho</em> — a tím často objeví superspreading událost, ze které vzešlo víc případů najednou. U nemocí s velkým podílem superspreadingu (např. COVID-19) bývá zpětné trasování překvapivě účinné.' },
        { t: 'h', text: 'Na čem stojí úspěch' },
        { t: 'list', items: [
          '<strong>Rychlost</strong> — krátké zpoždění mezi příznaky a izolací. Každý den navíc znamená další přenosy.',
          '<strong>Pokrytí</strong> — kolik procent kontaktů se vůbec podaří dohledat.',
          '<strong>Kapacita</strong> — kolik případů zvládnou trasovači denně. Při exponenciálním růstu se systém snadno zahltí a trasování se „utrhne".',
          '<strong>Presymptomatický přenos</strong> — pokud je člověk nakažlivý už před příznaky, část přenosů proběhne dřív, než ho vůbec zachytíme. To je hlavní důvod, proč u COVID-19 samotné trasování nestačilo.',
        ] },
        { t: 'p', html: '<strong>Digitální trasování</strong> (aplikace v telefonu) cílí hlavně na rychlost a pokrytí — upozorní kontakt během hodin, nikoliv dní. Naráží ale na ochranu soukromí a na to, že ho musí používat dost lidí, aby mělo smysl.' },
        { t: 'info', title: 'Kdy trasování stačí samo', html: 'Při <strong>nízkém</strong> R<sub>eff</sub> může kombinace „testuj – trasuj – izoluj" udržet epidemii pod kontrolou bez tvrdých opatření. Při <strong>vysokém</strong> R<sub>eff</sub> nebo velkém presymptomatickém přenosu je nutné ho kombinovat s opatřeními, která sníží R<sub>eff</sub> natolik, aby ho trasování vůbec stíhalo.' },
        { t: 'h', text: 'Historický příběh — „Tyfová Mary"' },
        { t: 'p', html: 'Na začátku 20. století šířila kuchařka Mary Mallonová v New Yorku břišní tyfus, ač sama byla zdravá — byla <strong>asymptomatická přenašečka</strong>. Sanitární inženýr George Soper ji vystopoval klasickým trasováním: porovnal domácnosti, kde propukl tyfus, a našel společný článek — Mary. Přesně tohle detektivní pátrání si vyzkoušíte ve hře <strong>Záhada z Oyster Bay</strong>; logiku trasování po telefonu pak v <strong>Ósacké horečce</strong>.' },
      ],
      vs: [
        { t: 'p', html: 'Plošná opatření z minulé kapitoly fungují, ale draho — dolehnou i na ty, kdo nákazu vůbec nešíří. A právě tady se hodí, co jsme zjistili o superspreadingu: když většinu přenosů obstará menšina, nabízí se chirurgická varianta — místo zavírání všech najít a odříznout konkrétní řetězce. Tomu se říká trasování.' },
        { t: 'p', html: 'I trasování se dá vyjádřit jako snižování R<sub>eff</sub>: izolace a karanténa zachytí část přenosů dřív, než stačí proběhnout, a o tu část se R<sub>eff</sub> sníží. Jak velká ta část bude, závisí na čtyřech věcech — jak <strong>rychle</strong> zachytíme případ a izolujeme ho, jak <strong>velký podíl</strong> jeho kontaktů dohledáme, kolik přenosu proběhne <strong>před příznaky</strong> (to nám uniká) a jakou má systém <strong>kapacitu</strong>, než se zahltí.' },
        { t: 'h', text: 'Kde jsou hranice — co říkají modely' },
        { t: 'p', html: 'Stochastické modely COVID-19 dávají docela názorné prahy. Při R₀ kolem 1,5 stačí dohledat i méně než polovinu kontaktů; při R₀ ≈ 2,5 je potřeba přes 70 % a při R₀ ≈ 3,5 už přes 90 %. A jakmile epidemie naroste do desítek souběžných případů, je samotné trasování proveditelné jen za předpokladu, že téměř žádný přenos neproběhne před příznaky. Nejúčinnější pákou přitom skoro vždy je zkrátit zpoždění mezi prvními příznaky a izolací.' },
        { t: 'refs', items: [REF.hellewell2020] },
        { t: 'h', text: 'Závod s časem a digitální trasování' },
        { t: 'p', html: 'A tady narazíme na slabé místo. U SARS-CoV-2 se ukázalo, že velká část přenosu proběhne ještě před příznaky — tedy dřív, než se vůbec dozvíme, koho máme trasovat. Ruční trasování (telefonáty hygieniků) je na takový závod s časem příliš pomalé. <strong>Digitální trasování</strong> přes aplikaci v telefonu cílí přesně sem: dokáže kontakt upozornit během hodin, nikoliv dní, a v modelu pak může udržet epidemii pod kontrolou i bez plošných lockdownů. Cenou jsou otázky soukromí, spolehlivosti detekce blízkosti a toho, že aplikaci musí používat dost lidí, aby měla smysl.' },
        { t: 'info', title: 'Dopředné vs. zpětné trasování', html: 'Klasické (dopředné) trasování hledá, koho nemocný mohl nakazit. Při silném superspreadingu je ale často cennější ptát se obráceně — <strong>kdo nakazil jeho</strong>: dohledání zdroje s velkou pravděpodobností odhalí celý klastr, ze kterého vzešlo víc případů najednou.' },
        { t: 'refs', items: [REF.ferretti2020] },
        { t: 'gloss', items: [
          { term: 'Indexový případ', def: 'první zachycený nemocný, od kterého se začíná pátrat po kontaktech a zdroji.' },
          { term: 'Izolace vs. karanténa', def: 'izolujeme <em>nemocného</em> (aby nenakazil dál); do karantény jde <em>zdravý kontakt</em> na dobu, než se ukáže, zda onemocní.' },
          { term: 'Subklinický přenos', def: 'šíření od lidí s velmi mírným nebo žádným průběhem, kteří neví, že jsou nemocní.' },
          { term: 'Pokrytí trasování', def: 'jaký podíl skutečných kontaktů se podaří dohledat a zastihnout — jeden z hlavních faktorů úspěchu.' },
          { term: 'Proximity aplikace', def: 'aplikace, která přes Bluetooth zaznamenává blízká setkání telefonů a po nahlášení pozitivního případu jeho kontakty automaticky upozorní.' },
        ] },
        { t: 'p', html: '<em>Kam dál:</em> Hellewell et al. (2020) ke kvantitativním prahům trasování a Ferretti et al. (2020) k digitálnímu trasování — obě citace výše.' },
      ],
    },
  },

  // ════════════════════ KRIZOVÉ ŘÍZENÍ ════════════════════
  {
    id: 'krizove',
    label: 'Krizové řízení',
    icon: '🏛️',
    title: 'Krizové řízení',
    content: {
      zs: [
        { t: 'p', html: 'Při epidemii musí někdo <strong>rozhodovat</strong> — a často podle neúplných informací a v časové tísni. To je práce krizového štábu, do kterého se ve hře dostaneš.' },
        { t: 'list', items: [
          'chránit zdraví lidí',
          'nezničit školy a ekonomiku',
          'udržet důvěru veřejnosti, aby lidé opatření dodržovali',
        ] },
        { t: 'info', title: 'Důvěra je palivo', html: 'Když lidé vládě věří, opatření fungují. Když ne, přestanou je dodržovat — a to je vidět i ve hře.' },
      ],
      ss: [
        { t: 'p', html: 'Epidemiologie umí spočítat, kolik životů které opatření zachrání. <strong>Neumí ale rozhodnout</strong>, kolik ekonomické škody a kolik omezení svobody za to společnost chce zaplatit. To je úkol krizového řízení — a je to úkol stejně dílem odborný, dílem politický a etický.' },
        { t: 'h', text: 'Tři osy, které se přetahují' },
        { t: 'html', html: '<div class="grid grid-cols-3 gap-3 my-2 text-center">' +
          [['🏥 Zdraví', 'Méně nakažených, méně úmrtí, nepřetížené nemocnice.'],
           ['💰 Ekonomika', 'Pracovní místa, HDP, fungující firmy a obchody.'],
           ['🤝 Společnost', 'Vzdělání dětí, duševní zdraví, svobody, soudržnost.']].map(([t, d]) =>
            `<div class="bg-gray-50 rounded-lg p-3"><div class="font-bold text-gray-800 text-sm">${t}</div><div class="text-xs text-gray-500 mt-1">${d}</div></div>`
          ).join('') + '</div>' },
        { t: 'p', html: 'Tyto osy jdou často <strong>proti sobě</strong>: tvrdý lockdown pomůže zdraví, ale uškodí ekonomice i společnosti. Otevřít všechno pomůže ekonomice, ale zaplatí se zdravím. Dobré rozhodnutí není „maximum zdraví za každou cenu", ale <strong>únosný kompromis</strong> — a ten se navíc v čase mění.' },
        { t: 'h', text: 'Rozhodování za nejistoty' },
        { t: 'p', html: 'Na začátku epidemie nevíme skoro nic — jak je virus nakažlivý, jak smrtelný, jak dlouho drží imunita. Přesto je nutné jednat, a to <strong>rychle</strong>, protože exponenciální růst nepočká. Vzniká napětí mezi „počkat na data" (jistota, ale ztracený čas) a „jednat hned" (čas, ale riziko chybného kroku). Často je lepší <em>rozhodnout se a průběžně korigovat</em> než čekat na dokonalou informaci, která přijde pozdě.' },
        { t: 'h', text: 'Důvěra a sociální kapitál' },
        { t: 'p', html: 'Sebelepší opatření nefunguje, pokud ho lidé nedodržují — a to dělají jen tehdy, když <strong>věří</strong>, že dává smysl a že je s nimi jednáno férově. Tato „měkká" veličina (ve hře <em>důvěra veřejnosti</em> a <em>sociální kapitál</em>) je vyčerpatelný zdroj: nejasná, měnící se nebo nespravedlivá rozhodnutí ji spotřebovávají. Když dojde, lidé přestanou spolupracovat a i správná opatření selžou.' },
        { t: 'info', title: 'Zásady krizové komunikace', html: 'Být <strong>první, mít pravdu, být důvěryhodný</strong>. Říkat i to, co nevíme. Nesvádět na lidi vlastní chyby. Konzistence napříč mluvčími. Vysvětlit <em>proč</em>, nikoliv jen <em>co</em>. Nedůvěryhodná autorita si neporadí ani s dobrými daty.' },
        { t: 'h', text: 'Politické tlaky a poradci' },
        { t: 'p', html: 'Krizový manažer není ve vzduchoprázdnu. Tlačí na něj ekonom (náklady), politik (popularita a volby), opozice (kritika), média i veřejnost — a každý vidí jinou ze tří os. Ve hře <strong>Krizový štáb</strong> proto dostáváte protichůdné rady od pěti poradců; vaším úkolem není všem vyhovět, ale rozhodnout a obhájit to.' },
        { t: 'h', text: 'Etika a spravedlnost' },
        { t: 'p', html: 'Když jsou zdroje omezené (lůžka na JIP, první dávky vakcín), je nutné <strong>rozhodnout o prioritách</strong> — koho léčit a očkovat dřív. To jsou <em>hodnotové</em> volby, nikoliv matematické: chráníme nejzranitelnější, nejpotřebnější profese, nebo ty, kdo nejvíc šíří? Spravedlnost rozhodnutí navíc zpětně ovlivňuje důvěru — vnímaná nespravedlnost ji rychle ničí.' },
        { t: 'info', title: 'Ve hře Krizový štáb', html: 'Sledujete důvěru veřejnosti a sociální kapitál (0–100). Při jejich kolapsu padá vláda a opatření na pár kol přestanou platit — přesně jako v realitě selhává autorita, která ztratí podporu. Hra vás nutí vyvažovat všechny tři osy zároveň, nikoliv optimalizovat jen jednu.' },
      ],
      vs: [
        { t: 'p', html: 'Modely, opatření i trasování zatím mlčky počítaly s tím, že lidé udělají, co jim řekneme. Jenže nemoc se šíří mezi lidmi — a ti mají svobodnou vůli, strach, nedůvěru a vlastní zájmy. Tady epidemiologie přestává být jen biologií a matematikou a stává se z velké části sociologií a etikou. A právě tady, nikoliv v rovnicích, se epidemie obvykle vyhrávají nebo prohrávají.' },
        { t: 'h', text: 'Rozhodování za nejistoty' },
        { t: 'p', html: 'Teorie rozhodování nabízí úhledný recept: ze všech možných kroků vyber ten, který přinese nejvyšší <em>očekávaný</em> užitek — tedy zprůměruješ následky každé volby přes všechno, co o epidemii (ne)víme. Háček je v tom slově „užitek". Skládá se ze tří nesouměřitelných věcí — zdraví, ekonomiky a společnosti — a jakmile je začneme převádět na společnou jednotku (třeba na zachráněné roky života v plném zdraví, QALY), děláme už tím hodnotový soud: kolik váží rok života seniora proti roku, který dítě stráví doma místo ve škole? Etické rozhodnutí se tu jen převléklo za technické.' },
        { t: 'p', html: 'Z toho plyne několik praktických zásad. Vyplatí se vážit <strong>hodnotu informace</strong> — kdy ještě počkat na data a kdy už čekání stojí víc, než kolik přinese (a při exponenciálním růstu cena čekání roste rychle). Volit raději rozhodnutí <strong>robustní</strong>, která dopadnou rozumně i když se v odhadech spleteme, než ta optimální pro jediné „nejlepší" číslo. A řídit <strong>adaptivně</strong> — po krocích, s pravidly navázanými na ukazatele jako R<sub>t</sub> nebo obsazenost JIP, ve stylu „přitáhnout–povolit".' },
        { t: 'h', text: 'Sociologie: jak vůbec přimět lidi spolupracovat' },
        { t: 'p', html: 'Compliance (dodržování) je <strong>chování</strong>, nikoliv nařízení — a chování je <em>endogenní</em>: lidé mění kontakty i bez příkazu, podle vnímaného rizika. To má praktické důsledky:' },
        { t: 'list', items: [
          '<strong>Důvěra je hlavní měna.</strong> Bez ní opatření selžou bez ohledu na to, jak jsou „správná". Důvěra se buduje pomalu a ztrácí rychle.',
          '<strong>Reaktance.</strong> Tvrdé nařízení může vyvolat odpor a opačné chování — někdy přesvědčování a srozumitelné „proč" zaberou víc než zákaz.',
          '<strong>Únava (behavioural fatigue).</strong> Ochota dodržovat klesá v čase; dlouhá plošná opatření se „opotřebovávají".',
          '<strong>Pobídky vs. příkazy (nudge vs mandate).</strong> Architektura volby (dostupnost, default, pohodlí) často změní chování levněji a méně konfliktně než zákaz.',
          '<strong>Spravedlnost vnímaná i reálná.</strong> Pravidla, která dopadají nerovně (nebo se na ně elity nevztahují), důvěru ničí rychleji než cokoli jiného.',
        ] },
        { t: 'info', title: 'Zásady krizové komunikace', html: 'Být první, mít pravdu, být důvěryhodný. Přiznat nejistotu. Vysvětlit <em>proč</em>, nikoliv jen <em>co</em>. Konzistence napříč mluvčími. Komunikace není „PR k opatřením" — je to samostatná intervence, která R<sub>eff</sub> mění reálně.' },
        { t: 'h', text: 'Etika: má společnost právo chránit se před virem?' },
        { t: 'p', html: 'Tady přicházejí otázky, na které <strong>neexistuje neutrální odpověď</strong> — jen různé hodnotové rámce. Klasické napětí je mezi <strong>individuální svobodou</strong> a <strong>kolektivní ochranou</strong>. Millův „harm principle" říká, že svobodu jednotlivce lze omezit, jen aby se zabránilo újmě druhým — jenže infekční nemoc dělá z téměř každého jednání potenciální újmu druhým. Kde je tedy hranice?' },
        { t: 'html', html: '<div class="bg-mustard-soft-x" style="background:#f6e6ce;border-left:4px solid #e0a458;border-radius:0 10px 10px 0;padding:12px 16px;">' +
          '<div style="font-weight:900;text-transform:uppercase;letter-spacing:.1em;font-size:11px;color:#a8392c;margin-bottom:4px;">Případ k zamyšlení — „Tyfová Mary"</div>' +
          '<div style="font-size:14px;color:#5a3a14;line-height:1.6;">Mary Mallonová byla zdravá asymptomatická nositelka břišního tyfu, která jako kuchařka nakazila desítky lidí. Odmítla přestat vařit. Úřady ji proti její vůli <strong>izolovaly na ostrově North Brother Island — celkem asi 26 let</strong>, aniž spáchala jakýkoli zločin. Byla ta izolace oprávněná? Chránila společnost, ale uvěznila nevinného člověka na doživotí. Kde končí právo společnosti na ochranu a začíná nepřípustné odejmutí svobody?</div></div>' },
        { t: 'p', html: 'Stejné dilema se vrací v každé epidemii, jen v jiném hávu. Položme si <strong>sporné otázky</strong> — a všimněme si, že každá má obhajitelné argumenty na obou stranách:' },
        { t: 'list', items: [
          '<strong>Povinné očkování.</strong> Je očkování proti chřipce (nebo dětské očkování) věcí osobní volby a „rizika života", nebo má být <em>povinné</em>? Stádní imunita je veřejný statek a neočkovaný se veze na ostatních (problém černého pasažéra) — to mluví pro povinnost. Proti stojí tělesná autonomie a nedůvěra k donucení. A proč u spalniček (R₀≈15) bereme školní povinnost jako samozřejmost, ale u chřipky ne? Kde je práh?',
          '<strong>Izolace zdravých nositelů.</strong> Smí stát zavřít člověka, který se ničím neprovinil, jen proto, že je infekční (Mary Mallonová, karantény u COVID-19)? Za jakých podmínek, na jak dlouho a s jakou náhradou?',
          '<strong>Triáž a racionování.</strong> Komu připadne poslední plicní ventilátor — mladšímu, tomu s lepší prognózou, losem, nebo „kdo dřív přijde"? Každé kritérium je etická volba, nikoliv medicínský fakt.',
          '<strong>Sledování vs. soukromí.</strong> Digitální trasování zachraňuje životy tím, že lidi sleduje. Kolik soukromí je společnost ochotná vyměnit za kontrolu epidemie — a kdo data potom drží?',
          '<strong>Lockdown a kolaterální škody.</strong> Plošné omezení svobody dopadá i na zdravé a nejvíc na nejzranitelnější (chudší, děti, duševní zdraví). Kdy je „lék" horší než nemoc?',
          '<strong>Globální spravedlnost.</strong> Mají bohaté země právo zajistit vakcíny nejdřív své populaci („vaccine nationalism"), zatímco jinde umírají zdravotníci bez první dávky?',
        ] },
        { t: 'p', html: 'Filozoficky se tu střetávají <strong>utilitarismus</strong> (maximalizuj celkový prospěch — i za cenu obětování jednotlivce) s <strong>deontologií a právy</strong> (některé hranice se nepřekračují, i kdyby to „vyšlo lépe"). Epidemiologie umí spočítat <em>následky</em> každé volby; <strong>kterou volbu si společnost vybere, je rozhodnutí demokratické, právní a hodnotové</strong> — nikoliv odborné. Dobrá příručka epidemiologa proto nedává „správnou odpověď", ale učí ty otázky správně klást.' },
        { t: 'exercise', title: 'Cvičení — debata a pak ordinace', html:
          '<p>Vezměte jednu spornou otázku — třeba <strong>povinné očkování proti chřipce</strong> — a rozehrajte ji ve dvou krocích.</p>' +
          '<h4>1. Debata: rozdělte role</h4>' +
          '<p>Každá skupina dostane jednu roli a má za úkol hájit její <em>nejlepší</em> argument (ne karikaturu):</p>' +
          '<ul>' +
          '<li><strong>Hygienik / veřejné zdraví</strong> — kolektivní imunita je veřejný statek; očkováním chráním i ty, kdo se chránit nemohou; neočkovaný se „veze" na ostatních.</li>' +
          '<li><strong>Zastánce občanských svobod</strong> — tělesná autonomie a informovaný souhlas; donucení je kluzký svah a u zákroku s nízkým individuálním rizikem nepřiměřené.</li>' +
          '<li><strong>Váhající rodič</strong> — nemá důvěru, slyšel o nežádoucích účincích, chce rozhodovat za své dítě; není „hloupý", jen opatrný a špatně informovaný.</li>' +
          '<li><strong>Imunokompromitovaný pacient</strong> — sám se očkovat nemůže; kolektivní imunita okolí je jeho jediná ochrana. Jeho svoboda žít závisí na rozhodnutí druhých.</li>' +
          '<li><strong>Praktický lékař</strong> — stojí mezi všemi; musí pacienta informovat, ale neztratit jeho důvěru.</li>' +
          '</ul>' +
          '<h4>2. Reflexe</h4>' +
          '<p>Proč má <em>každá</em> strana kus pravdy? Kde se argumenty skutečně střetávají (svoboda jednotlivce × ochrana zranitelných) a kde jde jen o nedorozumění nebo chybějící informace? Lišila by se vaše odpověď u chřipky a u spalniček (R₀ ≈ 15)? Kde leží práh, za kterým povinnost obhájíte?</p>' +
          '<h4>3. A teď v ordinaci</h4>' +
          '<p>Sehrajte konzultaci lékaře s váhajícím pacientem. Cíl <strong>není „vyhrát" spor</strong>, ale podpořit dobré rozhodnutí a udržet vztah. Zkuste:</p>' +
          '<ul>' +
          '<li>nejdřív se ptát a naslouchat — co konkrétně pacienta znepokojuje;</li>' +
          '<li>respektovat autonomii a vyhnout se moralizování (tlak budí <em>reaktanci</em> — odpor);</li>' +
          '<li>nabídnout srozumitelná fakta i míru nejistoty, přiznat, co nevíme;</li>' +
          '<li>dát čas a nechat dveře otevřené (motivační rozhovor, ne ultimátum).</li>' +
          '</ul>' +
          '<p>Na závěr porovnejte, jak jinak se mluví v <em>debatě</em> (kde jde o pravidla pro všechny) a v <em>ordinaci</em> (kde jde o jednoho konkrétního člověka a jeho důvěru).</p>' },
        { t: 'h', text: 'Alokace omezených zdrojů — příklad vakcín' },
        { t: 'p', html: 'Priorizace očkování je etika převedená do optimalizace s odlišnými cíli. Modelová analýza ukázala, že strategie <strong>závisí na cíli</strong>: minimalizace <em>počtu nákaz</em> favorizuje očkování dospělých 20–49 let (hlavní přenašeči), zatímco minimalizace <em>úmrtí a ztracených let života</em> ve většině scénářů favorizuje seniory 60+. Sérologické cílení (přeskočení séropozitivních) zvyšuje marginální přínos dávky a může snižovat nerovnosti. Model řekne, co která volba <em>způsobí</em> — nikoliv kterou si máme vybrat.' },
        { t: 'refs', items: [REF.bubar2021] },
        { t: 'warn', title: 'Modely jako podpora, nikoliv náhrada', html: 'Modely kvantifikují <em>kompromisy</em>, ale samotnou volbu vah mezi životy, ekonomikou a svobodami nedávají — ta je politická a etická. Transparentnost předpokladů a nejistoty je proto součástí odpovědného použití modelu v rozhodování. A tím se náš příběh uzavírá: od jednoho viru jsme došli až k otázce, jakou společností chceme být.' },
        { t: 'gloss', items: [
          { term: 'Očekávaný užitek', def: 'průměrný přínos rozhodnutí, vážený pravděpodobnostmi možných následků. Základ teorie racionálního rozhodování za nejistoty.' },
          { term: 'QALY / DALY', def: 'jednotky zdraví. QALY = rok života v plném zdraví; DALY = rok zdravého života ztracený nemocí nebo úmrtím. Umožní (sporné) srovnání různých zdravotních dopadů.' },
          { term: 'Hodnota informace (VOI)', def: 'o kolik lepší rozhodnutí bychom udělali, kdybychom snížili nejistotu — tedy zda se vyplatí čekat na další data, nebo jednat hned.' },
          { term: 'Reaktance', def: 'psychologický odpor vůči omezení svobody: zákaz může vyvolat právě to chování, kterému měl zabránit.' },
          { term: 'Nudge vs. mandate', def: '„pošťouchnutí" (úprava prostředí a defaultů, která usnadní žádoucí volbu) proti příkazu/zákazu. Nudge bývá levnější a méně konfliktní, mandate účinnější, ale rizikovější pro důvěru.' },
          { term: 'Harm principle', def: 'zásada J. S. Milla, že svobodu jednotlivce lze omezit jen kvůli zabránění újmě druhým. U infekčních nemocí je sporné, kde přesně ta „újma druhým" začíná.' },
          { term: 'Utilitarismus vs. deontologie', def: 'dva etické rámce: utilitarismus hodnotí činy podle celkových následků (maximalizuj prospěch), deontologie podle dodržení pravidel a práv (některé hranice se nepřekračují bez ohledu na následek).' },
        ] },
        { t: 'p', html: '<em>Kam dál:</em> Bubar et al. (2021, viz výše) k priorizaci vakcín; k etice pandemií je užitečným rozcestníkem dokument WHO <em>Guidance for Managing Ethical Issues in Infectious Disease Outbreaks</em> (2016) a kapitoly o spravedlnosti v učebnicích veřejného zdraví.' },
      ],
    },
  },

  // ════════════════════ PŘÍBĚH ════════════════════
  {
    id: 'pribeh',
    label: 'Příběh: Dr. Kovářová',
    icon: '📕',
    title: 'Příběh: Dr. Kovářová',
    content: {
      zs: [
        { t: 'p', html: 'Dr. Kovářová je epidemioložka. Když ve městě onemocní pár lidí naráz, je první, kdo začne pátrat: <em>Co mají společného? Kde se nakazili?</em>' },
        { t: 'p', html: 'Volá nemocným, kreslí si, kdo s kým byl, a hledá <strong>společný zdroj</strong>. Díky tomu se nákaza zastaví dřív, než se rozšíří po celém městě — přesně jako v našich hrách.' },
      ],
      ss: [
        { t: 'p', html: 'Je úterý ráno, když Dr. Kovářové, epidemioložce krajské hygienické stanice, zazvoní telefon. Z nemocnice hlásí: za dva dny přijali <strong>tři pacienty se stejnými příznaky</strong> — vysoké horečky, průjmy, dehydratace. Samo o sobě nic alarmujícího. Tři případy „náhodou pohromadě" ale zkušenému epidemiologovi rozsvítí kontrolku.' },
        { t: 'h', text: 'Krok 1 — Popsat (osoba, místo, čas)' },
        { t: 'p', html: 'Kovářová začne tím nejnudnějším a nejdůležitějším: sběrem dat. <em>Kdo</em> jsou pacienti (věk, bydliště, zaměstnání)? <em>Kde</em> se mohli nakazit? <em>Kdy</em> přesně začaly příznaky? Sestaví <strong>epidemickou křivku</strong> — graf počtu nových případů v čase. Její tvar napoví: pozvolný nárůst ukazuje na šíření z člověka na člověka, prudký „špunt" spíš na společný zdroj (kontaminované jídlo či voda).' },
        { t: 'h', text: 'Krok 2 — Hypotéza' },
        { t: 'p', html: 'Křivka má ostrý vrchol. Kovářová vysloví hypotézu: <strong>společný zdroj</strong>, pravděpodobně potravina. Všichni tři navíc minulý týden byli na jedné svatbě. Hypotéza se zužuje — ale ještě není důkaz. Souvislost (všichni byli na svatbě) není totéž co příčina (na svatbě se nakazili).' },
        { t: 'h', text: 'Krok 3 — Otestovat' },
        { t: 'p', html: 'Porovná, kdo ze svatebčanů onemocněl a kdo ne, a co kdo jedl — jednoduchá <strong>case-control</strong> úvaha. Ukáže se, že nemocní nápadně častěji jedli domácí majonézový salát. To je stopa: dohledá šarži, odebere vzorky, kontaktuje ostatní hosty.' },
        { t: 'h', text: 'Krok 4 — Rozhodnout pod tlakem' },
        { t: 'p', html: 'A tady přichází dilema, které poznáte i ve hře. Laboratorní potvrzení přijde za tři dny. Počkat na jistotu — nebo <strong>jednat hned</strong> a varovat veřejnost, stáhnout výrobek, i kdyby se nakonec ukázalo, že šlo o planý poplach? Kovářová ví, že každý den čekání může znamenat další nemocné. Rozhodne se jednat — opatrně, ale hned.' },
        { t: 'info', title: 'Proč příběh', html: 'Za čísly v modelech jsou vždycky <strong>skutečná rozhodnutí konkrétních lidí</strong> — pod tlakem, s neúplnými daty a s odpovědností za následky. Epidemiologie není jen matematika; je to řemeslo, detektivní práce a odpovědnost zároveň. Přesně tu kombinaci si zkoušíte ve všech hrách platformy.' },
      ],
      vs: [
        { t: 'p', html: 'V reálném vyšetřování neprochází epidemiolog naše čtyři roviny po jedné — vidí je naráz. Příběh Dr. Kovářové ukazuje, jak se virus, klinika, populace i lidský rozměr spojují do jednoho řemesla, kterému se říká vyšetřování ohniska. Terénní epidemiologie (jak ji učí programy jako EIS nebo evropský FETP) ho rozkládá do ustálených kroků:' },
        { t: 'list', items: [
          'potvrdit, že ohnisko opravdu existuje, a ověřit diagnózu — vyloučit, že jde jen o výkyv v hlášení;',
          'stanovit přesnou <strong>definici případu</strong> a podle ní aktivně vyhledat všechny nemocné;',
          'popsat ohnisko podle osoby, místa a času a sestavit <strong>epidemickou křivku</strong> — její tvar prozradí, zda jde o jeden společný zdroj, nebo o šíření z člověka na člověka;',
          'formulovat hypotézy a otestovat je <strong>analytickou studií</strong> (kohortovou nebo case-control), která změří sílu vazby mezi expozicí a onemocněním;',
          'zavést opatření, vyhodnotit jejich účinek a celé zjištění srozumitelně odkomunikovat.',
        ] },
        { t: 'info', title: 'Souvislost ještě není příčina', html: 'To, že nemocní častěji jedli salát, samo o sobě nedokazuje, že salát za to může. Sílu takové vazby se posuzuje podle několika hledisek (mj. konzistence, časové posloupnosti, dávkové závislosti a biologické věrohodnosti — tzv. Bradford Hillova kritéria). Statistika ukáže, jak silná souvislost je; že jde o příčinu, je úsudek nad rámec samotné p-hodnoty.' },
        { t: 'p', html: 'Tahle metoda má dlouhý rodokmen — od Johna Snowa, který roku 1854 zmapováním úmrtí odhalil nakaženou londýnskou pumpu, až po dnešní <strong>genomickou epidemiologii</strong>, kde se přenosové řetězce rekonstruují porovnáním sekvencí viru s přesností, jaké klasické trasování nikdy nedosáhne. Nástroje se mění, logika detektivní práce zůstává.' },
        { t: 'gloss', items: [
          { term: 'Definice případu (case definition)', def: 'jednoznačná kritéria (příznaky, čas, místo, laboratorní nález), podle kterých se rozhodne, koho do ohniska počítat — aby všichni počítali totéž.' },
          { term: 'Epidemická křivka', def: 'graf počtu nových případů v čase. Jeden ostrý vrchol svědčí pro společný zdroj, postupné vlny pro přenos z člověka na člověka.' },
          { term: 'Kohortová vs. case-control studie', def: 'dva způsoby testování hypotézy. Kohortová sleduje exponované i neexponované dopředu; case-control srovnává nemocné a zdravé zpětně podle toho, čemu byli vystaveni (rychlejší při vzácných nemocech).' },
          { term: 'Relativní riziko / poměr šancí (OR)', def: 'čísla vyjadřující, kolikrát je nemoc pravděpodobnější u exponovaných než u neexponovaných — míra síly vazby.' },
          { term: 'Bradford Hillova kritéria', def: 'soubor hledisek (síla, konzistence, časová posloupnost, dávková závislost aj.), která pomáhají posoudit, zda je pozorovaná souvislost příčinná.' },
          { term: 'Genomická epidemiologie', def: 'využití sekvencí genomu patogenu k rekonstrukci toho, kdo koho nakazil a jak se varianty šíří.' },
        ] },
        { t: 'p', html: '<em>Kam dál:</em> standardními příručkami terénní epidemiologie jsou <em>Field Epidemiology</em> (Gregg) a materiály CDC/ECDC k vyšetřování ohnisek; k metodám pak Rothman, <em>Epidemiology: An Introduction</em>.' },
      ],
    },
  },
];
