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
        { t: 'warn', title: 'Důležité upozornění', html: 'Naše modely jsou <strong>zjednodušenou verzí reality</strong>. Cílem je představit podstatu epidemiologických procesů, ne přesně předpovídat realitu. Skutečné epidemie ovlivňují stovky faktorů, které zde nezohledňujeme — od chování lidí po proměnlivost viru. Model je nástroj k <em>porozumění</em>, ne křišťálová koule.' },
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
        { t: 'p', html: 'Kapitoly této úrovně vás těmito dějstvími provedou v pořadí, v jakém na ně epidemiolog naráží: nejdřív <strong>virus a jeho oběť</strong> (klinika i přenos), pak <strong>matematika populace</strong> (modely), poté <strong>zásah</strong> (opatření, trasování) a nakonec <strong>lidská a etická</strong> rovina (krizové řízení). Technicky je výklad kvantitativní — předpokládá základy diferenciálního počtu a pravděpodobnosti — a u klíčových tvrzení odkazuje na primární literaturu (boxy „Pro hlubší studium" s DOI).' },
        { t: 'info', title: 'Co je matematická epidemiologie', html: 'Disciplína, která přenos infekce popisuje <em>generativním modelem</em> (ODR, stochastické procesy, sítě), aby (i) porozuměla mechanismu, (ii) odhadla nepozorovatelné veličiny (R₀, IFR, generační interval) z pozorovaných dat a (iii) porovnala kontrafaktuální scénáře intervencí. Od popisné epidemiologie (osoba–místo–čas) ji odlišuje právě ten explicitní model.' },
        { t: 'h', text: 'Slovník, který budeme cestou potřebovat' },
        { t: 'list', items: [
          '<strong>R₀ / R<sub>t</sub></strong> — bazální a časově proměnné reprodukční číslo (vlastnost 1 → projev 3)',
          '<strong>r</strong> — Malthusovský růstový parametr rané fáze (co vidíme v datech)',
          '<strong>T<sub>g</sub> / T<sub>s</sub></strong> — generační (latentní) a sériový (pozorovatelný) interval',
          '<strong>β, σ, γ</strong> — rychlosti přenosu, progrese E→I a zotavení I→R',
          '<strong>IFR / CFR</strong> — infekční / case fatality ratio (závažnost — úroveň 2)',
          '<strong>k</strong> — disperzní parametr rozdělení sekundárních případů (heterogenita)',
        ] },
        { t: 'warn', title: 'Jedna věc předem: model ≠ věštba', html: 'Kompartmentové modely předpokládají dobře promíchanou populaci a exponenciálně rozdělené doby setrvání — obojí je idealizace. Pro reálné odhady je nezbytná <strong>kalibrace</strong>, <strong>kvantifikace nejistoty</strong> (intervaly, citlivostní analýza) a <strong>validace</strong> out-of-sample. Model bez nejistoty není predikce, ale ilustrace. S tímhle vědomím se vydáme na cestu.' },
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
        { t: 'p', html: '<strong>Dějství první.</strong> Než začneme cokoli modelovat, musíme poznat nepřítele a to, co dělá v jednom těle. Vlastnosti viru a klinický průběh u jednotlivce totiž <em>určují</em> obě věci, na kterých vše další stojí: jak <strong>závažná</strong> nemoc je a jak (a kdy) je nemocný člověk <strong>nakažlivý</strong>.' },
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
        { t: 'p', html: 'R₀ je <em>průměr</em> individuální reprodukce ν, jejíž rozdělení bývá silně <strong>přerozptýlené (overdispersed)</strong> — popsané negativně binomickým rozdělením s disperzním parametrem <strong>k</strong> (malé k = silný superspreading; pro SARS k ≈ 0,16). Většinu přenosů způsobí menšina nakažených. Důsledky pro celý příběh: (i) větší šance, že zavlečení <em>samo vyhasne</em>, (ii) <em>explozivnější</em>, ale vzácnější ohniska, (iii) <strong>cílená</strong> opatření (na superspreading prostředí) dominují plošným — což předznamenává kapitolu o trasování.' },
        { t: 'info', title: 'Sekundární attack rate (SAR)', html: 'Podíl vnímavých kontaktů, kteří onemocní po expozici indexovému případu v daném prostředí — empirická míra infekčnosti. Zásadní je kontrast domácnost (vysoký SAR) vs. veřejný prostor; pozor na cenzorování a ko-primární případy.' },
        { t: 'refs', items: [REF.lloydSmith2005] },
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
        { t: 'p', html: 'Náš základní model je <strong>deterministický</strong> — pro stejné vstupy dá vždy stejný výsledek, počítá s „průměrnou" populací. Realita je ale <strong>stochastická</strong> (náhodná): při malém počtu případů může nákaza náhodou vymřít, nebo naopak jeden superspreading event spustí velké ohnisko. Stochastické modely proto počítají mnoho scénářů a dívají se na rozdělení výsledků, ne na jediné číslo.' },
        { t: 'warn', title: 'Co náš model nezachycuje', html: 'Model je <strong>deterministický a homogenní</strong> — nezachycuje superspreading (kdy ~10 % nakažených způsobí ~80 % přenosů), heterogenitu kontaktů uvnitř věkových skupin, prostorovou strukturu (město vs. vesnice), sezónnost, změny chování v reakci na média ani evoluci viru v reálném čase. Přesto dobře vystihuje <em>podstatu</em> — exponenciální dynamiku a účinek opatření. To k pochopení principů stačí; k reálné předpovědi by bylo potřeba mnohem víc.' },
      ],
      vs: [
        { t: 'p', html: '<strong>Dějství druhé.</strong> Doteď jsme mluvili o jednom nakaženém. Teď ho rozmnožíme na celou populaci — a uvidíme, že chování miliónů lidí se dá překvapivě dobře shrnout několika rovnicemi. Model je v jádru jen <em>pečlivé účetnictví</em> toho, co jsme popsali u jednotlivce: kolik lidí dnes přejde z vnímavých mezi nakažené, z nakažených mezi uzdravené.' },
        { t: 'p', html: 'Deterministický SEIR v dobře promíchané populaci o velikosti N je soustava ODR:' },
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
        { t: 'h', text: 'Vazba na reálný čas a R<sub>t</sub>' },
        { t: 'p', html: 'Pro kompartmentové systémy platí ekvivalence R₀ > 1 ⇔ r > 0 (r = Malthusovský růstový parametr). Odhad R<sub>t</sub> v čase se provádí buď z renewal rovnice (Cori et al.), nebo z growth rate přes rozdělení generačního intervalu — což opět vyžaduje znalost g(τ).' },
        { t: 'warn', title: 'Stochasticita při malých počtech', html: 'Deterministický model selhává v rané/koncové fázi (malé I); tam je namístě <strong>větvící proces</strong> (Galton–Watson). Pravděpodobnost vyhasnutí z jednoho případu je <strong>nejmenší kořen q = G(q)</strong>, kde G je vytvořující funkce (PGF) rozdělení počtu potomků. Pro Poissonovo potomstvo se střední hodnotou R₀ řeší q = e^(R₀(q−1)) — např. pro R₀ = 2 vychází q ≈ 0,20. Jednoduchý vztah „pravděpodobnost velkého ohniska = 1 − 1/R₀" platí jen pro geometrické rozdělení potomků; při <strong>přerozptýlení</strong> (malé k) je vyhasnutí pravděpodobnější (q vyšší). Proto i při R₀ > 1 řada zavlečení samovolně vymře.' },
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
        { t: 'p', html: '<strong>Dějství třetí.</strong> Známe nepřítele i jeho dynamiku v populaci. Teď přichází epidemiolog s otázkou, kvůli které to celé děláme: <em>jak křivku ohnout?</em> Každé opatření je pokus zasáhnout do jednoho členu síly infekce — buď přenosnosti β, nebo počtu kontaktů. Formálně:' },
        { t: 'p', html: 'NPI formalizujeme jako (i) multiplikativní redukci přenosnosti β → (1 − ε)·β, nebo (ii) modifikaci <strong>kontaktní matice</strong> C<sub>ij</sub> po prostředích (domácnost/škola/práce/komunita) — sub-matice se škálují podle opatření. Efektivní reprodukční číslo je pak spektrální poloměr upravené NGM.' },
        { t: 'h', text: 'Odhad efektu a jeho úskalí' },
        { t: 'p', html: 'Efekty NPI se odhadují <strong>semi-mechanistickými bayesovskými</strong> modely: počítá se zpětně od pozorovaných úmrtí (přes IFR a rozdělení zpoždění infekce→úmrtí) k latentní nákaze, R<sub>t</sub> se modeluje jako funkce zavedených opatření, s částečným sdílením informace mezi zeměmi (partial pooling).' },
        { t: 'p', html: 'Analýza 11 evropských zemí (jaro 2020) odhadla, že NPI — zejména lockdowny — stlačily R<sub>t</sub> pod 1 (P(R<sub>t</sub> &lt; 1) &gt; 99 %), s odhadem 3,2–4,0 % infikované populace do 4. května 2020. Předpoklady: fixní IFR, R<sub>t</sub> reaguje skokově na intervence, bez importu/subnárodní variability — vše zdroje nejistoty.' },
        { t: 'refs', items: [REF.flaxman2020] },
        { t: 'warn', title: 'Identifikační problém (kolinearita)', html: 'Opatření se zaváděla téměř současně → jejich efekty jsou silně <strong>kolineární</strong> a jednotlivě obtížně identifikovatelné. Přiřazení celkového poklesu R poslednímu opatření je artefakt modelu, ne kauzální důkaz. Odhady jsou navíc citlivé na předpokládaný profil chování a na prior.' },
        { t: 'warn', title: 'Externí validita a behaviorální endogenita', html: 'Velikosti efektů nelze mechanicky přenášet napříč kontexty (varianta, imunita, kultura). Chování je <strong>endogenní</strong> — lidé mění kontakty i bez nařízení (v reakci na rizikovou percepci), takže „efekt opatření" a „efekt dobrovolné změny" se prolínají.' },
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
        { t: 'p', html: '<strong>Digitální trasování</strong> (aplikace v telefonu) cílí hlavně na rychlost a pokrytí — upozorní kontakt během hodin, ne dní. Naráží ale na ochranu soukromí a na to, že ho musí používat dost lidí, aby mělo smysl.' },
        { t: 'info', title: 'Kdy trasování stačí samo', html: 'Při <strong>nízkém</strong> R<sub>eff</sub> může kombinace „testuj – trasuj – izoluj" udržet epidemii pod kontrolou bez tvrdých opatření. Při <strong>vysokém</strong> R<sub>eff</sub> nebo velkém presymptomatickém přenosu je nutné ho kombinovat s opatřeními, která sníží R<sub>eff</sub> natolik, aby ho trasování vůbec stíhalo.' },
        { t: 'h', text: 'Historický příběh — „Tyfová Mary"' },
        { t: 'p', html: 'Na začátku 20. století šířila kuchařka Mary Mallonová v New Yorku břišní tyfus, ač sama byla zdravá — byla <strong>asymptomatická přenašečka</strong>. Sanitární inženýr George Soper ji vystopoval klasickým trasováním: porovnal domácnosti, kde propukl tyfus, a našel společný článek — Mary. Přesně tohle detektivní pátrání si vyzkoušíte ve hře <strong>Záhada z Oyster Bay</strong>; logiku trasování po telefonu pak v <strong>Ósacké horečce</strong>.' },
      ],
      vs: [
        { t: 'p', html: 'Plošná opatření z minulé kapitoly fungují, ale draho — zasáhnou i ty, kdo nákazu nešíří. Vzpomeňme na superspreading: většinu přenosů způsobí menšina. To svádí k <strong>chirurgické</strong> variantě — najít a odříznout konkrétní řetězce místo zavírání všech.' },
        { t: 'p', html: 'Strategii „test–trace–isolate" (TTI) lze chápat jako redukci efektivního reprodukčního čísla: R<sub>eff</sub> ≈ R · (1 − podíl přenosu, který izolace/karanténa zachytí včas). Klíčové determinanty: <strong>R</strong>, <strong>zpoždění</strong> onset→izolace, <strong>pokrytí</strong> kontaktů, <strong>podíl presymptomatického/subklinického přenosu</strong> a <strong>kapacita</strong> systému.' },
        { t: 'h', text: 'Kvantitativní hranice (stochastický model)' },
        { t: 'p', html: 'Větvící (branching-process) model COVID-19 dává orientačně: při R₀ ≈ 1,5 lze většinu ohnisek zvládnout i s &lt; 50 % dohledaných kontaktů; při R₀ ≈ 2,5 je třeba &gt; 70 %; při R₀ ≈ 3,5 &gt; 90 %. Při ≥ 40 počátečních případech je TTI proveditelné jen, pokud &lt; 1 % přenosu proběhne před příznaky. Zpoždění onset→izolace je nejcitlivější páka pro nižší R.' },
        { t: 'refs', items: [REF.hellewell2020] },
        { t: 'h', text: 'Časový rozpočet a digitální trasování' },
        { t: 'p', html: 'Dekompozice R₀ podle zdroje přenosu (presymptomatický / symptomatický / asymptomatický / environmentální) ukázala, že významný podíl přenosu SARS-CoV-2 je presymptomatický. To znamená, že přenos probíhá rychleji, než stíhá <em>manuální</em> trasování — kontrola vyžaduje <strong>okamžitou</strong> notifikaci. <strong>Digitální trasování</strong> (proximity app) cílí přesně na zkrácení zpoždění; při dostatečné adopci může v modelu udržet kontrolu bez plošných lockdownů. Otevřené jsou otázky pokrytí, citlivosti/specificity proximity detekce a etiky/soukromí.' },
        { t: 'info', title: 'Forward vs. backward tracing', html: 'Při přerozptýleném rozdělení (malé k) je <strong>zpětné</strong> trasování informačně cennější: dohledáním zdroje se s vyšší pravděpodobností odhalí superspreading klastr a více ko-primárních případů než dopředným trasováním od průměrného případu.' },
        { t: 'refs', items: [REF.ferretti2020] },
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
        { t: 'info', title: 'Zásady krizové komunikace', html: 'Být <strong>první, mít pravdu, být důvěryhodný</strong>. Říkat i to, co nevíme. Nesvádět na lidi vlastní chyby. Konzistence napříč mluvčími. Vysvětlit <em>proč</em>, ne jen <em>co</em>. Nedůvěryhodná autorita si neporadí ani s dobrými daty.' },
        { t: 'h', text: 'Politické tlaky a poradci' },
        { t: 'p', html: 'Krizový manažer není ve vzduchoprázdnu. Tlačí na něj ekonom (náklady), politik (popularita a volby), opozice (kritika), média i veřejnost — a každý vidí jinou ze tří os. Ve hře <strong>Krizový štáb</strong> proto dostáváte protichůdné rady od pěti poradců; vaším úkolem není všem vyhovět, ale rozhodnout a obhájit to.' },
        { t: 'h', text: 'Etika a spravedlnost' },
        { t: 'p', html: 'Když jsou zdroje omezené (lůžka na JIP, první dávky vakcín), je nutné <strong>rozhodnout o prioritách</strong> — koho léčit a očkovat dřív. To jsou <em>hodnotové</em> volby, ne matematické: chráníme nejzranitelnější, nejpotřebnější profese, nebo ty, kdo nejvíc šíří? Spravedlnost rozhodnutí navíc zpětně ovlivňuje důvěru — vnímaná nespravedlnost ji rychle ničí.' },
        { t: 'info', title: 'Ve hře Krizový štáb', html: 'Sledujete důvěru veřejnosti a sociální kapitál (0–100). Při jejich kolapsu padá vláda a opatření na pár kol přestanou platit — přesně jako v realitě selhává autorita, která ztratí podporu. Hra vás nutí vyvažovat všechny tři osy zároveň, ne optimalizovat jen jednu.' },
      ],
      vs: [
        { t: 'p', html: '<strong>Dějství čtvrté — a nejtěžší.</strong> Modely, opatření i trasování mlčky předpokládají, že lidé udělají, co jim řekneme. Jenže nemoc se šíří mezi lidmi se svobodnou vůlí, strachem, nedůvěrou a vlastními zájmy. Tady epidemiologie přestává být jen biologií a matematikou a stává se z velké části <strong>sociologií a etikou</strong>. A právě tady — ne v rovnicích — se epidemie obvykle vyhrávají nebo prohrávají.' },
        { t: 'h', text: 'Rozhodování za nejistoty' },
        { t: 'p', html: 'Formálně lze krizové rozhodování psát jako maximalizaci očekávaného užitku E[U(a, θ)] přes posteriorní rozdělení parametrů θ. Užitek je <strong>multikriteriální</strong> (zdraví, ekonomika, společnost) a jeho agregace (např. přes QALY/DALY a peněžní ekvivalenty) je <em>sama o sobě hodnotová volba</em> — už tím, jak vážíme jeden rok života seniora proti roku života dítěte stráveného doma místo ve škole, děláme etické rozhodnutí převlečené za technické.' },
        { t: 'list', items: [
          '<strong>Hodnota informace (VOI)</strong> — kdy se vyplatí čekat/měřit vs. jednat. Při exponenciálním růstu cena čekání rychle roste.',
          '<strong>Robustnost</strong> — rozhodnutí odolná vůči chybě v θ (minimax-regret), ne optimální pro jediný bodový odhad.',
          '<strong>Adaptivní řízení</strong> — sekvenčně, s pravidly reagujícími na R<sub>t</sub> a obsazenost JIP (stop-and-go).',
        ] },
        { t: 'h', text: 'Sociologie: jak vůbec přimět lidi spolupracovat' },
        { t: 'p', html: 'Compliance (dodržování) je <strong>chování</strong>, ne nařízení — a chování je <em>endogenní</em>: lidé mění kontakty i bez příkazu, podle vnímaného rizika. To má praktické důsledky:' },
        { t: 'list', items: [
          '<strong>Důvěra je hlavní měna.</strong> Bez ní opatření selžou bez ohledu na to, jak jsou „správná". Důvěra se buduje pomalu a ztrácí rychle.',
          '<strong>Reaktance.</strong> Tvrdé nařízení může vyvolat odpor a opačné chování — někdy přesvědčování a srozumitelné „proč" zaberou víc než zákaz.',
          '<strong>Únava (behavioural fatigue).</strong> Ochota dodržovat klesá v čase; dlouhá plošná opatření se „opotřebovávají".',
          '<strong>Pobídky vs. příkazy (nudge vs mandate).</strong> Architektura volby (dostupnost, default, pohodlí) často změní chování levněji a méně konfliktně než zákaz.',
          '<strong>Spravedlnost vnímaná i reálná.</strong> Pravidla, která dopadají nerovně (nebo se na ně elity nevztahují), důvěru ničí rychleji než cokoli jiného.',
        ] },
        { t: 'info', title: 'Zásady krizové komunikace', html: 'Být první, mít pravdu, být důvěryhodný. Přiznat nejistotu. Vysvětlit <em>proč</em>, ne jen <em>co</em>. Konzistence napříč mluvčími. Komunikace není „PR k opatřením" — je to samostatná intervence, která R<sub>eff</sub> mění reálně.' },
        { t: 'h', text: 'Etika: má společnost právo chránit se před virem?' },
        { t: 'p', html: 'Tady přicházejí otázky, na které <strong>neexistuje neutrální odpověď</strong> — jen různé hodnotové rámce. Klasické napětí je mezi <strong>individuální svobodou</strong> a <strong>kolektivní ochranou</strong>. Millův „harm principle" říká, že svobodu jednotlivce lze omezit, jen aby se zabránilo újmě druhým — jenže infekční nemoc dělá z téměř každého jednání potenciální újmu druhým. Kde je tedy hranice?' },
        { t: 'html', html: '<div class="bg-mustard-soft-x" style="background:#f6e6ce;border-left:4px solid #e0a458;border-radius:0 10px 10px 0;padding:12px 16px;">' +
          '<div style="font-weight:900;text-transform:uppercase;letter-spacing:.1em;font-size:11px;color:#a8392c;margin-bottom:4px;">Případ k zamyšlení — „Tyfová Mary"</div>' +
          '<div style="font-size:14px;color:#5a3a14;line-height:1.6;">Mary Mallonová byla zdravá asymptomatická nositelka břišního tyfu, která jako kuchařka nakazila desítky lidí. Odmítla přestat vařit. Úřady ji proti její vůli <strong>izolovaly na ostrově North Brother Island — celkem asi 26 let</strong>, aniž spáchala jakýkoli zločin. Byla ta izolace oprávněná? Chránila společnost, ale uvěznila nevinného člověka na doživotí. Kde končí právo společnosti na ochranu a začíná nepřípustné odejmutí svobody?</div></div>' },
        { t: 'p', html: 'Stejné dilema se vrací v každé epidemii, jen v jiném hávu. Položme si <strong>sporné otázky</strong> — a všimněme si, že každá má obhajitelné argumenty na obou stranách:' },
        { t: 'list', items: [
          '<strong>Povinné očkování.</strong> Je očkování proti chřipce (nebo dětské očkování) věcí osobní volby a „rizika života", nebo má být <em>povinné</em>? Stádní imunita je veřejný statek a neočkovaný se veze na ostatních (problém černého pasažéra) — to mluví pro povinnost. Proti stojí tělesná autonomie a nedůvěra k donucení. A proč u spalniček (R₀≈15) bereme školní povinnost jako samozřejmost, ale u chřipky ne? Kde je práh?',
          '<strong>Izolace zdravých nositelů.</strong> Smí stát zavřít člověka, který se ničím neprovinil, jen proto, že je infekční (Mary Mallonová, karantény u COVID-19)? Za jakých podmínek, na jak dlouho a s jakou náhradou?',
          '<strong>Triáž a racionování.</strong> Komu připadne poslední plicní ventilátor — mladšímu, tomu s lepší prognózou, losem, nebo „kdo dřív přijde"? Každé kritérium je etická volba, ne medicínský fakt.',
          '<strong>Sledování vs. soukromí.</strong> Digitální trasování zachraňuje životy tím, že lidi sleduje. Kolik soukromí je společnost ochotná vyměnit za kontrolu epidemie — a kdo data potom drží?',
          '<strong>Lockdown a kolaterální škody.</strong> Plošné omezení svobody dopadá i na zdravé a nejvíc na nejzranitelnější (chudší, děti, duševní zdraví). Kdy je „lék" horší než nemoc?',
          '<strong>Globální spravedlnost.</strong> Mají bohaté země právo zajistit vakcíny nejdřív své populaci („vaccine nationalism"), zatímco jinde umírají zdravotníci bez první dávky?',
        ] },
        { t: 'p', html: 'Filozoficky se tu střetávají <strong>utilitarismus</strong> (maximalizuj celkový prospěch — i za cenu obětování jednotlivce) s <strong>deontologií a právy</strong> (některé hranice se nepřekračují, i kdyby to „vyšlo lépe"). Epidemiologie umí spočítat <em>následky</em> každé volby; <strong>kterou volbu si společnost vybere, je rozhodnutí demokratické, právní a hodnotové</strong> — ne odborné. Dobrá příručka epidemiologa proto nedává „správnou odpověď", ale učí ty otázky správně klást.' },
        { t: 'h', text: 'Alokace omezených zdrojů — příklad vakcín' },
        { t: 'p', html: 'Priorizace očkování je etika převedená do optimalizace s odlišnými cíli. Modelová analýza ukázala, že strategie <strong>závisí na cíli</strong>: minimalizace <em>počtu nákaz</em> favorizuje očkování dospělých 20–49 let (hlavní přenašeči), zatímco minimalizace <em>úmrtí a ztracených let života</em> ve většině scénářů favorizuje seniory 60+. Sérologické cílení (přeskočení séropozitivních) zvyšuje marginální přínos dávky a může snižovat nerovnosti. Model řekne, co která volba <em>způsobí</em> — ne kterou si máme vybrat.' },
        { t: 'refs', items: [REF.bubar2021] },
        { t: 'warn', title: 'Modely jako podpora, ne náhrada', html: 'Modely kvantifikují <em>kompromisy</em>, ale samotnou volbu vah mezi životy, ekonomikou a svobodami nedávají — ta je politická a etická. Transparentnost předpokladů a nejistoty je proto součástí odpovědného použití modelu v rozhodování. A tím se náš příběh uzavírá: od jednoho viru jsme došli až k otázce, jakou společností chceme být.' },
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
        { t: 'p', html: 'Porovná, kdo ze svatebčanů onemocněl a kdo ne, a co kdo jedl — jednoduchá <strong>case-control</strong> úvaha. Ukáže se, že nemocní mnápadně častěji jedli domácí majonézový salát. To je stopa: dohledá šarži, odebere vzorky, kontaktuje ostatní hosty.' },
        { t: 'h', text: 'Krok 4 — Rozhodnout pod tlakem' },
        { t: 'p', html: 'A tady přichází dilema, které poznáte i ve hře. Laboratorní potvrzení přijde za tři dny. Počkat na jistotu — nebo <strong>jednat hned</strong> a varovat veřejnost, stáhnout výrobek, i kdyby se nakonec ukázalo, že šlo o planý poplach? Kovářová ví, že každý den čekání může znamenat další nemocné. Rozhodne se jednat — opatrně, ale hned.' },
        { t: 'info', title: 'Proč příběh', html: 'Za čísly v modelech jsou vždycky <strong>skutečná rozhodnutí konkrétních lidí</strong> — pod tlakem, s neúplnými daty a s odpovědností za následky. Epidemiologie není jen matematika; je to řemeslo, detektivní práce a odpovědnost zároveň. Přesně tu kombinaci si zkoušíte ve všech hrách platformy.' },
      ],
      vs: [
        { t: 'p', html: '<strong>Závěr — všechna dějství najednou.</strong> V reálném vyšetřování epidemiolog neprochází naše čtyři úrovně po jedné; vidí je naráz. Případová viněta Dr. Kovářové ukazuje, jak se virus, klinika, populace i lidský rozměr spojují do jednoho řemesla — <strong>vyšetřování ohniska</strong> (outbreak investigation), jak je kodifikuje terénní epidemiologie (např. EIS/FETP):' },
        { t: 'list', items: [
          'potvrdit existenci ohniska a diagnózu (vyloučit artefakt hlášení),',
          'definovat <strong>případ</strong> (case definition) a aktivně vyhledávat případy,',
          'deskripce osoba–místo–čas a sestavení <strong>epidemické křivky</strong> (point-source vs. propagated pattern),',
          'generovat hypotézy a testovat je analyticky — <strong>kohortová</strong> nebo <strong>case-control</strong> studie (odhad relativního rizika / OR),',
          'zavést kontrolní opatření a vyhodnotit je; komunikovat.',
        ] },
        { t: 'info', title: 'Kauzalita ≠ korelace', html: 'Asociace (např. „nemocní jedli salát") se hodnotí podle síly, konzistence, biologické věrohodnosti, časové posloupnosti a dávkové závislosti (Bradford Hill). Analytická studie kvantifikuje sílu asociace, ale kauzální závěr vyžaduje víc než p-hodnotu.' },
        { t: 'p', html: 'Metodologická linie sahá od Johna Snowa (cholera, Broad Street, 1854 — prostorová analýza a přirozený experiment) po moderní <strong>genomickou epidemiologii</strong>, kde fylogenetika sekvenovaných izolátů rekonstruuje přenosové řetězce s rozlišením, jaké klasické trasování nemá. Pro hlubší studium doporučujeme učebnice terénní epidemiologie a primární práce citované v předchozích kapitolách.' },
      ],
    },
  },
];
