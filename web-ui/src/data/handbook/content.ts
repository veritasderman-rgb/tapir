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
        { t: 'p', html: 'Tato příručka je určena pro účastníky simulace <strong>Krizový štáb</strong> a dalších her. Jejím cílem není nahradit odborné vzdělání, ale představit <strong>základní principy</strong>, ze kterých vychází naše modely.' },
        { t: 'warn', title: 'Důležité upozornění', html: 'Naše modely jsou <strong>zjednodušenou verzí reality</strong>. Cílem je představit podstatu epidemiologických procesů, ne simulovat komplexní realitu. Skutečné epidemie ovlivňují stovky faktorů, které zde nezohledňujeme.' },
        { t: 'h', text: 'Co se naučíte' },
        { t: 'list', items: [
          '<strong>Jak se šíří virus</strong> — základy přenosu',
          '<strong>Epidemiologické modely</strong> — SEIR, R₀, R<sub>eff</sub>',
          '<strong>Opatření a intervence</strong> — jak ovlivňují šíření',
          '<strong>Trasování kontaktů</strong> — jak funguje a proč je důležité',
          '<strong>Krizové řízení</strong> — politické, ekonomické a sociální aspekty',
        ] },
      ],
      vs: [
        { t: 'p', html: 'Tato příručka shrnuje koncepty stojící za simulacemi platformy. Úroveň „lékařská fakulta" cílí na kvantitativní porozumění a u klíčových tvrzení odkazuje na primární literaturu, místo aby je zjednodušovala.' },
        { t: 'warn', title: 'Meze modelů', html: 'Modely v platformě jsou převážně deterministické a kompartmentové. Slouží k výuce dynamiky, nikoli k predikci. U reálných odhadů je nutná kalibrace, kvantifikace nejistoty a validace proti datům.' },
        { t: 'info', title: 'Jak číst tuto úroveň', html: 'Pojmy zavádíme přesně (R₀ přes next-generation matrix, generační interval, herd-immunity threshold). Boxy „Pro hlubší studium" obsahují ověřené citace s DOI.' },
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
        { t: 'p', html: 'Každé infekční onemocnění potřebuje <strong>řetězec přenosu</strong>: nakažený → způsob přenosu → vnímavý. Přerušení řetězce je základem všech opatření.' },
        { t: 'h', text: 'Způsoby přenosu' },
        { t: 'list', items: [
          '<strong>Kapénkový</strong> — kapénky doletí 1–2 m a spadnou',
          '<strong>Aerosolový</strong> — částice visí ve vzduchu minuty až hodiny (větrání, respirátory)',
          '<strong>Kontaktní</strong> — kontaminovaný povrch, podání ruky',
          '<strong>Fekálně-orální</strong> — voda/jídlo (cholera, tyfus)',
        ] },
        { t: 'h', text: 'Reprodukční číslo R₀' },
        { t: 'p', html: '<strong>R₀</strong> je průměrný počet lidí, které jeden nakažený nakazí v plně vnímavé populaci (nikdo nemá imunitu, žádná opatření). Chřipka 1,2–2; COVID-19 2,5–3,5; spalničky 12–18; ebola 1,5–2,5.' },
        { t: 'info', title: 'R₀ vs R<sub>eff</sub>', html: 'R₀ je teoretická hodnota pro plně vnímavou populaci. V praxi sledujeme <strong>R<sub>eff</sub></strong>, které zohledňuje imunitu a opatření. Cíl: dostat R<sub>eff</sub> pod 1.' },
        { t: 'p', html: 'Když R > 1, počet nakažených roste <strong>exponenciálně</strong> — zdvojnásobuje se v pravidelných intervalech. Při R = 2 a generačním čase 5 dní: z 1 nakaženého je za 25 dní 32, za 50 dní přes 1 000.' },
      ],
      vs: [
        { t: 'p', html: 'Dynamiku přenosu určuje souhra <strong>infekčnosti</strong>, <strong>kontaktní struktury</strong> a <strong>časování</strong> (latence, infekční perioda). Klíčové intervaly: latentní doba, infekční perioda, <strong>generační interval</strong> (čas mezi nákazou nakažujícího a nakaženého) a jeho pozorovatelný protějšek <strong>sériový interval</strong>.' },
        { t: 'h', text: 'Heterogenita a superspreading' },
        { t: 'p', html: 'R₀ je <em>průměr</em>; reálné rozdělení sekundárních případů bývá silně <strong>přerozptýlené (overdispersed)</strong> — malá část jedinců způsobí většinu přenosů. To mění dynamiku: vymření zavlečení je pravděpodobnější, ale ohniska jsou explozivnější; cílená opatření (na superspreading prostředí) jsou účinnější než plošná.' },
        { t: 'info', title: 'Sekundární attack rate', html: 'Podíl vnímavých kontaktů, kteří onemocní po expozici indexovému případu — empirická míra infekčnosti v daném prostředí (domácnost vs. veřejnost).' },
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
        { t: 'p', html: 'Modely jsou <strong>zjednodušeným popisem reality</strong>. George Box: <em>„Všechny modely jsou špatné, ale některé jsou užitečné."</em>' },
        { t: 'h', text: 'SEIR model' },
        { t: 'p', html: 'Populaci rozdělíme do 4 kompartmentů:' },
        { t: 'diagram', html: seirDiagram },
        { t: 'list', items: [
          '<strong>S → E</strong>: závisí na počtu infekčních (I), kontaktech a přenosnosti β',
          '<strong>E → I</strong>: rychlost σ = 1/inkubační doba',
          '<strong>I → R</strong>: rychlost γ = 1/doba infekčnosti',
        ] },
        { t: 'info', title: 'Síla infekce', html: 'λ = β × (kontakty) × (I / N). Opatření snižují buď β (roušky, hygiena), nebo kontakty (uzavření škol, lockdown).' },
        { t: 'p', html: '<strong>R<sub>eff</sub> = R₀ × (S/N) × (efekt opatření).</strong> Jak roste imunita, klesá S/N a klesá R<sub>eff</sub>. Stádní imunita pro COVID (R₀ ≈ 3) ~67 %, pro spalničky (R₀ ≈ 15) ~93 %.' },
        { t: 'warn', title: 'Omezení modelu', html: 'Náš model je deterministický a homogenní — nezachycuje superspreading, prostorovou strukturu, sezónu ani evoluci viru. Přesto dobře vystihuje <em>podstatu</em> — exponenciální dynamiku a efekt opatření.' },
      ],
      vs: [
        { t: 'p', html: 'Kompartmentový SEIR(V) je soustava ODR. V deterministické, dobře promíchané populaci:' },
        { t: 'diagram', html: 'dS/dt = −β·S·I/N<br>dE/dt = β·S·I/N − σ·E<br>dI/dt = σ·E − γ·I<br>dR/dt = γ·I' },
        { t: 'p', html: 'Pro jednoduchý SIR platí <strong>R₀ = β/γ</strong>. Obecně se R₀ definuje jako dominantní vlastní číslo <strong>next-generation matrix</strong> (NGM) — to umožní korektně zahrnout více tříd jedinců (věk, prostředí, stavy).' },
        { t: 'info', title: 'Práh stádní imunity', html: 'Kritický podíl imunních: H<sub>c</sub> = 1 − 1/R₀. Pro R₀ = 3 vychází ~67 %. Předpoklady (homogenní promíchání, sterilizující imunita) jsou idealizace — reálná hodnota se liší.' },
        { t: 'p', html: 'Souvislost s reálným časem: R₀ > 1 ⇔ r > 0, kde r je <strong>Malthusovský růstový parametr</strong> z rané fáze epidemie. NGM dává jak práh, tak vazbu na pozorovaný růst.' },
        { t: 'refs', items: [REF.diekmann2009] },
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
        { t: 'p', html: '<strong>NPI</strong> (nefarmaceutické intervence) ovlivní šíření bez vakcíny. Fungují dvěma mechanismy:' },
        { t: 'list', items: [
          '<strong>Snížení přenosnosti (β)</strong> — roušky, respirátory, hygiena, větrání',
          '<strong>Snížení kontaktů</strong> — uzavření škol, home-office, lockdown',
        ] },
        { t: 'p', html: 'Orientační účinnost: roušky ~15 %, FFP2 ~30 %, uzavření škol ~80 % školních kontaktů, home-office ~60 % pracovních kontaktů. Silnější opatření = vyšší ekonomická a sociální cena.' },
        { t: 'info', title: 'Načasování', html: 'Kvůli exponenciálnímu růstu rozhoduje <strong>rychlost</strong> — týden zpoždění může znamenat několikanásobně víc případů. „Spláchni brzy, spláchni tvrdě."' },
        { t: 'warn', title: 'Kompromis zdraví × ekonomika × společnost', html: 'Žádné opatření není zadarmo. Dobrý krizový štáb hledá kombinaci s maximem efektu při únosné ceně.' },
      ],
      vs: [
        { t: 'p', html: 'NPI modelujeme jako multiplikativní redukci β nebo úpravu kontaktní matice (po prostředích: domácnost/škola/práce/komunita). Klíčové jsou <strong>velikost efektu</strong>, <strong>náběh</strong>, <strong>compliance</strong> a <strong>kombinace</strong> opatření.' },
        { t: 'p', html: 'Empirická evidence (Evropa, jaro 2020): modelová analýza napříč 11 zeměmi odhadla, že rozsáhlé NPI — zejména lockdowny — stlačily R<sub>eff</sub> pod 1, přičemž do počátku května 2020 bylo infikováno odhadem 3–4 % populace. Odhady stojí na předpokladech (fixní IFR, okamžitá reakce R na intervence) a jsou zatíženy nejistotou.' },
        { t: 'warn', title: 'Externí validita', html: 'Velikosti efektů z jedné vlny/země nelze mechanicky přenášet — závisí na kontextu, variantě, imunitě a chování. Identifikace efektu jednotlivého opatření je ztížena jejich současným zaváděním (kolinearita).' },
        { t: 'refs', items: [REF.flaxman2020] },
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
        { t: 'p', html: 'Trasování přeruší řetězec přenosu cíleně: <strong>indexový případ → kontakty → karanténa</strong>. Funguje nejlépe u nemocí, které nakažlivost rozvíjejí až s příznaky, a při dostatečné <strong>kapacitě</strong> trasovačů.' },
        { t: 'list', items: [
          '<strong>Rychlost</strong> — krátké zpoždění mezi příznaky a izolací',
          '<strong>Pokrytí</strong> — kolik % kontaktů se podaří dohledat',
          '<strong>Presymptomatický přenos</strong> — pokud nakažlivost přichází před příznaky, trasování ztrácí účinnost',
        ] },
        { t: 'info', title: 'Kdy to stačí', html: 'Při nízkém R<sub>eff</sub> může samotné trasování + izolace udržet epidemii pod kontrolou; při vysokém R<sub>eff</sub> je nutné kombinovat s dalšími opatřeními.' },
      ],
      vs: [
        { t: 'p', html: 'Účinnost strategie „test–trace–isolate" je funkcí <strong>R<sub>eff</sub></strong>, <strong>zpoždění</strong> onset→izolace, <strong>podílu dohledaných kontaktů</strong> a <strong>podílu presymptomatického/subklinického přenosu</strong>.' },
        { t: 'p', html: 'Stochastické modelování COVID-19 ukázalo orientačně: při R₀ ≈ 1,5 lze většinu ohnisek zvládnout i s &lt; 50 % dohledaných kontaktů; při R₀ ≈ 2,5 je třeba &gt; 70 %; při R₀ ≈ 3,5 &gt; 90 %. Vysoký podíl přenosu před příznaky zvládnutelnost zásadně snižuje.' },
        { t: 'info', title: 'Důsledek pro praxi', html: 'Zkrácení zpoždění onset→izolace má často větší marginální přínos než navyšování pokrytí — a digitální trasování cílí právě na zpoždění.' },
        { t: 'refs', items: [REF.hellewell2020] },
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
        { t: 'p', html: 'Krizové řízení vyvažuje tři osy: <strong>zdraví × ekonomika × společnost</strong>. Rozhodnutí padají za nejistoty a mají politickou cenu.' },
        { t: 'list', items: [
          '<strong>Sociální kapitál a důvěra</strong> — určují, nakolik lidé opatření dodržují',
          '<strong>Načasování</strong> — brzká reakce je levnější než pozdní',
          '<strong>Komunikace</strong> — srozumitelnost a konzistence rozhodují o přijetí',
        ] },
        { t: 'info', title: 'Ve hře Krizový štáb', html: 'Sledujete důvěru veřejnosti a sociální kapitál; při jejich kolapsu padá vláda a opatření přestávají platit — stejně jako v realitě selhává nedůvěryhodná autorita.' },
      ],
      vs: [
        { t: 'p', html: 'Rozhodování za nejistoty lze rámovat jako optimalizaci pod rizikem: volíme intervence maximalizující očekávaný užitek napříč zdravotními, ekonomickými a sociálními dopady, s explicitní <strong>kvantifikací nejistoty</strong>.' },
        { t: 'list', items: [
          '<strong>Hodnota informace</strong> — kdy se vyplatí čekat na data vs. jednat hned',
          '<strong>Etika alokace</strong> — triáž a priority (např. očkování) za omezených zdrojů',
          '<strong>Robustnost</strong> — rozhodnutí odolná vůči chybě v parametrech modelu',
        ] },
        { t: 'warn', title: 'Modely jako podpora, ne náhrada', html: 'Modely informují rozhodnutí, ale hodnotové soudy (kolik ekonomické škody za kolik zachráněných let života) jsou politické a etické — model je nevyřeší.' },
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
        { t: 'p', html: 'Dr. Kovářová dostane hlášení: během dvou dnů přijali tři pacienty se stejnými příznaky. Začíná <strong>terénní vyšetřování</strong> — sběr dat, hypotézy, jejich testování.' },
        { t: 'p', html: 'Sestaví epidemickou křivku, hledá společnou expozici a navrhne cílené opatření. Rozhoduje se mezi <strong>rychlostí</strong> (jednat hned) a <strong>jistotou</strong> (počkat na další data) — dilema, které poznáte i ve hře.' },
        { t: 'info', title: 'Proč příběh', html: 'Za čísly modelů jsou skutečná rozhodnutí konkrétních lidí. Epidemiologie je řemeslo i odpovědnost.' },
      ],
      vs: [
        { t: 'p', html: 'Případová viněta ilustruje cyklus terénní epidemiologie: detekce signálu → deskripce (osoba/místo/čas) → generování hypotéz → analytické testování (případně case-control) → intervence → vyhodnocení.' },
        { t: 'p', html: 'Reálné paralely sahají od Johna Snowa (cholera, 1854) po moderní genomickou epidemiologii. Doporučujeme propojit s primární literaturou citovanou v předchozích kapitolách a s učebnicemi terénní epidemiologie.' },
      ],
    },
  },
];
