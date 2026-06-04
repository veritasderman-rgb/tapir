# PLAN — Příručka epidemiologa ve 3 úrovních (ZŠ / SŠ / LF)

> Stav: **příprava k odsouhlasení.** Tento dokument popisuje, jak přepsat
> Příručku tak, aby obsah odpovídal náročnosti tří cílových skupin. Sám o sobě
> nemění žádný produkční kód — slouží k domluvě před psaním obsahu.

## 0. Kontext

Dnes má Příručka 7 kapitol s obsahem natvrdo v JSX
(`web-ui/src/components/handbook/EpidemiologistHandbook.tsx`). Existuje už
**výběr úrovně** (ZŠ / SŠ / VŠ-LF) a per-úrovňový kontextový banner na každé
kapitole, ale **text kapitol je zatím společný**. Tento plán řeší, jak ho
rozdělit do tří hloubek.

## 1. Hloubkové cíle

| Úroveň | Cílová skupina | Jazyk a hloubka | Matematika | Reference |
|---|---|---|---|---|
| **ZŠ** | 8.–9. třída | Běžný jazyk, analogie z každodenního života, krátké odstavce, hodně příkladů. | Žádné vzorce. R₀ jako „kolik lidí v průměru nakazí jeden nemocný". | — |
| **SŠ** | 3.–4. ročník | Souvislosti, korektní pojmy, grafy, kompromisy opatření. | SEIR kompartmenty, R₀/Rₑff jako koncept, jednoduché vztahy (R₀ = β·D). | Volitelné odkazy na popularizaci. |
| **LF** | lékařská fakulta | Přesně, do hloubky, odborná terminologie; kde je vhodné, odkázat dál místo zjednodušení. | Kompartmentové ODR, next-generation matrix pro R₀, generační/sériový interval, velikosti efektů intervencí, herd-immunity threshold 1−1/R₀. | **Povinně** — citace s DOI/URL (viz §4). |

Princip: **stejná témata, tři hloubky.** Diagramy a vizuální prvky se sdílí;
mění se hloubka a délka výkladu a přítomnost odkazů.

## 2. Architektura obsahu (technická příprava)

Refaktor z natvrdo psaného JSX na **data-driven** strukturu, ať jsou 3 úrovně
udržovatelné a UI generické.

```ts
// web-ui/src/data/handbook/content.ts
type Level = 'zs' | 'ss' | 'vs';

interface Block =
  | { kind: 'p'; text: string }            // odstavec (může mít <strong> apod.)
  | { kind: 'h'; text: string }            // mezinadpis
  | { kind: 'list'; items: string[] }
  | { kind: 'info'; title: string; body: string }
  | { kind: 'warn'; title: string; body: string }
  | { kind: 'diagram'; ascii: string }     // sdílené napříč úrovněmi
  | { kind: 'refs'; items: { cit: string; url?: string }[] }; // jen LF

interface Chapter {
  id: SectionId;
  label: string;
  icon: string;
  // obsah po úrovních; 'diagram' bloky lze sdílet referencí
  content: Record<Level, Block[]>;
}

export const HANDBOOK: Chapter[] = [ /* 7 kapitol */ ];
```

- Renderer (`EpidemiologistHandbook`) přestane mít 7 hardcoded sekcí a bude
  vykreslovat `HANDBOOK[section].content[level]` přes malou `BlockRenderer`
  komponentu (mapuje `kind` → existující InfoBox/WarningBox/Diagram/…).
- Výběr úrovně (už hotový) jen určuje, který klíč se vykreslí.
- Výhody: žádné duplikování UI, snadné doplňování, jeden zdroj pravdy,
  testovatelné (lze ověřit, že každá kapitola má všechny 3 úrovně).

## 3. Per-kapitola — co na které úrovni (osnova)

| Kapitola | ZŠ (8.–9.) | SŠ (3.–4.) | LF |
|---|---|---|---|
| **Úvod** | K čemu příručka je, jak hrát hry. | + jak modely zjednodušují realitu. | + meze modelů, validace, kalibrace. |
| **Jak se šíří virus** | Řetězec nákazy, kapénky/kontakt, příklady. | Cesty přenosu, inkubační doba, infekčnost v čase. | Generační/sériový interval, sekundární attack rate, role superspreadingu (k-disperze). |
| **Epidemiologické modely** | „Model je zjednodušená mapa." S→E→I→R slovně. | SEIR kompartmenty, R₀ vs Rₑff, křivka epidemie, vrchol. | ODR systém SEIR(V), R₀ přes NGM, herd-immunity 1−1/R₀, citlivost na parametry. |
| **Opatření a intervence** | Co dělají roušky, odstup, očkování — na příkladech. | Jak NPI mění β/kontakty, kompromisy (zdraví × ekonomika). | Velikosti efektů z literatury, načasování, kombinace, externí validita. |
| **Trasování kontaktů** | Co to je, proč pomáhá, na příběhu. | Indexový případ, karanténa, kapacita trasování. | Efektivita vs zpoždění a pokrytí; digitální trasování; modely TTI. |
| **Krizové řízení** | Rozhodování pod tlakem, důvěra lidí. | Politika × ekonomika × zdraví, sociální kapitál. | Rozhodování za nejistoty, hodnota informace, etika triáže. |
| **Příběh: Dr. Kovářová** | Lidský příběh epidemioložky. | + odborné momenty rozhodování. | + reálné paralely a odkazy. |

(Osnova, ne finální text — slouží k odsouhlasení rozsahu.)

## 4. Reference pro LF — reálné, z PubMedu

Pro každou kapitolu LF doplníme box **„Pro hlubší studium"** s ověřenými
citacemi. Reference **nevymýšlíme** — vytáhneme je přes připojený **PubMed MCP**
(získáme přesné názvy, autory, rok, DOI/PMID a odkaz). Kandidáti:

- Anderson & May — *Infectious Diseases of Humans* (klasika dynamiky).
- Diekmann, Heesterbeek, Metz — definice R₀ přes next-generation matrix.
- Kermack & McKendrick (1927) — kompartmentové modely.
- Klíčové COVID-19 modelovací a TTI práce (doplníme z PubMedu).

Každý odkaz s DOI/URL, ať si student dohledá primární zdroj.

## 5. Fázování (návrh PR po sobě)

| Fáze | Obsah |
|---|---|
| **H1** | Refaktor na data-driven architekturu (§2) + migrace **stávajícího** obsahu jako úroveň **SŠ**. Bez změny viditelného textu pro SŠ. |
| **H2** | **ZŠ** varianty 7 kapitol (zjednodušení, analogie). |
| **H3** | **LF** varianty 7 kapitol + reference z PubMedu. K **odborné kontrole**. |

## 6. Co potřebuju od tebe

1. **Potvrdit hloubkové cíle** (§1) a osnovu (§3) — sedí, nebo upravit?
2. **LF přesnost:** souhlas, že LF obsah projde odborná kontrola (píšu zodpovědně
   + reálné citace, ale medicínský obsah chce revizi).
3. **Start:** rozjet **H1 (refaktor + SŠ)** jako první PR?

## 7. Rizika

- **Odbornost LF** — největší riziko; mitigace: reálné citace + revize.
- **Rozsah obsahu** — 7 kapitol × 3 úrovně je hodně textu; fázujeme.
- **Konzistence** — data-driven struktura + test „každá kapitola má 3 úrovně".
