# PLAN: Didaktikon — Epidemiologické detektivní hry

## Přehled

Dva nové herní režimy v rámci existující TAPIR aplikace:
1. **Ósacká horečka** — telefonní trasování kontaktů ve Springfieldu
2. **Tyfová Mary** — historická dokumentová detektivka (1906)

Obě hry jsou **zcela nezávislé** na SEIR simulačním jádře — nepoužívají `simulation-core` engine.
Jsou to standalone interaktivní hry postavené na statických datech (JSON/TS).

---

## Architektonické rozhodnutí

### Integrace do stávající aplikace
- **Přidat do AuthPanel.tsx** dva nové bloky (Ósacká horečka, Tyfová Mary) pod stávající 3-sloupcový grid
- **Přidat nové AppMode hodnoty**: `OsackaHorecka` a `TyfovaMary` do enum v `types.ts`
- **Routing v App.tsx** — nové větve pro `AppMode.OsackaHorecka` a `AppMode.TyfovaMary`
- **Nové Zustand stores** — `osackaStore.ts` a `tyfovaStore.ts` (nezávislé na gameStore)
- **Nové složky komponent** — `components/osacka/` a `components/tyfova/`
- **Datové soubory** — `data/osacka/` a `data/tyfova/` přímo ve `web-ui/src/`

### Co se NEMĚNÍ
- `simulation-core` — žádné změny v simulačním jádře
- `gameStore.ts` — stávající Krizový štáb zůstává beze změn
- `useAppStore.ts` — jen přidat nové AppMode hodnoty do routing logiky
- Stávající komponenty v `student/`, `instructor/` — beze změn

---

## Fáze implementace

### FÁZE 0: Scaffold (typy, routing, data skeleton)

**0.1** Rozšířit `AppMode` enum v `simulation-core/src/types.ts`:
```typescript
export enum AppMode {
  Expert = 'expert',
  Instructor = 'instructor',
  CrisisStaff = 'crisis_staff',
  OsackaHorecka = 'osacka_horecka',
  TyfovaMary = 'tyfova_mary',
}
```

**0.2** Vytvořit adresářovou strukturu:
```
web-ui/src/
├── data/
│   ├── osacka/
│   │   ├── contacts.ts          # ~67 telefonních kontaktů s výpověďmi
│   │   ├── masterInfections.ts  # 22 nakažených (master data)
│   │   ├── masterHealthy.ts     # exponovaní ale zdraví
│   │   ├── locations.ts         # podniky a místa
│   │   └── depoShipments.ts     # DEPO zásilky
│   └── tyfova/
│       ├── documents.ts         # 7 dokumentů
│       ├── household.ts         # domácnost Warren
│       ├── questions.ts         # kvízové otázky
│       └── historicalCases.ts   # 4 historické případy
├── components/
│   ├── osacka/
│   │   ├── OsackaGame.tsx         # hlavní wrapper + routing fází
│   │   ├── PhoneDirectory.tsx     # telefonní seznam (sidebar)
│   │   ├── TestimonyView.tsx      # zobrazení výpovědi
│   │   ├── Notebook.tsx           # zápisník hráče
│   │   ├── EpiCurve.tsx           # interaktivní epidemiologická křivka
│   │   ├── ContactGraph.tsx       # vizuální mapa trasování
│   │   ├── BudgetBar.tsx          # zbývající body
│   │   ├── Timeline.tsx           # časová osa 1.11.–14.11.
│   │   └── OsackaResults.tsx      # finální hodnocení + skóre
│   └── tyfova/
│       ├── TyfovaGame.tsx         # hlavní wrapper + kroky
│       ├── DocumentList.tsx       # seznam dokumentů (sidebar)
│       ├── DocumentViewer.tsx     # zobrazení dokumentu
│       ├── QuizPanel.tsx          # interaktivní otázky
│       ├── HouseholdTable.tsx     # tabulka domácnosti
│       ├── FoodMatrix.tsx         # matice jídel (kdo co jedl)
│       ├── HistoricalCases.tsx    # přehled 4 historických případů
│       ├── EthicsDebate.tsx       # diskuzní sekce
│       └── TyfovaResults.tsx      # finální hodnocení
└── store/
    ├── osackaStore.ts           # stav hry Ósacká horečka
    └── tyfovaStore.ts           # stav hry Tyfová Mary
```

**0.3** Vytvořit TypeScript typy v `web-ui/src/types/didaktikon.ts`:
```typescript
// === ÓSACKÁ HOREČKA ===
export interface PhoneContact {
  id: string;
  name: string;
  type: 'person' | 'business';
  interviewDate: string;
  testimony: string;          // celý text rozhovoru (HTML/markdown)
  cost: number;               // body za hovor
  available: boolean;         // false = telefon nebere
  // Skrytá master data (pro hodnocení):
  infected: boolean;
  infectionDay?: number;
  infectiousDay?: number;
  symptomsDay?: number;
  infectionSource?: string;
  vaccinated?: boolean;
  simulating?: boolean;       // předstírá nemoc
  isSuperspreaderEvent?: boolean;
  superspreaderName?: string;
  notes?: string;
}

export interface PlayerNote {
  contactId: string;
  status: 'infected' | 'healthy_exposed' | 'healthy' | 'unavailable' | 'unknown';
  symptomsDate?: string;
  exposureSource?: string;
  freeText?: string;
}

export interface EpiCurveEntry {
  day: number;           // 0 = 1.11., 13 = 14.11.
  contactIds: string[];  // hráčem umístění na tento den
}

export interface OsackaGameState {
  phase: 'intro' | 'playing' | 'results';
  budget: number;
  maxBudget: number;
  calledContacts: string[];
  selectedContact: string | null;
  playerNotes: Record<string, PlayerNote>;
  epiCurveData: EpiCurveEntry[];
  identifiedInfected: string[];
  identifiedSuperspreaders: string[];
  startTime: number;
  endTime?: number;
}

// === TYFOVÁ MARY ===
export interface TyfovaDocument {
  id: string;
  title: string;
  content: string;         // HTML obsah
  order: number;
  unlockedByStep?: number;
}

export interface TyfovaQuestion {
  id: string;
  step: number;
  question: string;
  type: 'multiple_choice' | 'checkbox' | 'text' | 'ordering';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  hint?: string;
}

export interface HouseholdMember {
  name: string;
  role: string;
  infected: boolean;
  testimony: string;
  foodConsumed: string[];    // co jedl/a
  clues: string[];
}

export interface TyfovaGameState {
  phase: 'intro' | 'playing' | 'results';
  currentStep: number;       // 0-6
  totalSteps: number;
  unlockedDocuments: string[];
  readDocuments: string[];
  answers: Record<string, string | string[]>;
  correctAnswers: number;
  startTime: number;
  endTime?: number;
}
```

**0.4** Aktualizovat `AuthPanel.tsx` — přidat 2 nové karty pod grid:
```
[Expert] [Učitel] [Krizový štáb]
──────────────────────────────────
[Ósacká horečka 🦠]  [Tyfová Mary 🔍]
```

**0.5** Aktualizovat `App.tsx` routing:
```typescript
if (appMode === AppMode.OsackaHorecka) return <OsackaGame />;
if (appMode === AppMode.TyfovaMary) return <TyfovaGame />;
```

---

### FÁZE 1: Datové soubory

Toto je **nejkritičtější fáze** — bez dat nejsou hry.

**1.1** `data/osacka/contacts.ts` — 67 kontaktů
- Každý kontakt: id, name, type, interviewDate, testimony (kompletní text), cost, available
- Skrytá data: infected, infectionDay, symptomsDay, infectionSource, vaccinated, simulating
- ZDROJ: Master data z tabulky v zadání + výpovědi (budou zadány postupně)

**1.2** `data/osacka/masterInfections.ts` — 22 nakažených (tabulka 3.4)
- Pro validaci hráčových odpovědí

**1.3** `data/osacka/masterHealthy.ts` — exponovaní ale zdraví (tabulka 3.5)
- Včetně důvodů proč jsou zdraví (očkovaní, simulující, nízká expozice)

**1.4** `data/osacka/locations.ts` — podniky
- Bi-Mon-Sci-Fi-Con (+10 bodů superspreader)
- Jaderná elektrárna (+10 bodů)
- Spucklerova farma (+10 bodů zoonóza)
- + další místa

**1.5** `data/osacka/depoShipments.ts` — zásilky (15 osob)

**1.6** `data/tyfova/documents.ts` — 7 dokumentů (Tyfus one-pager, case, výpovědi, voda, historie, noviny, opatření)

**1.7** `data/tyfova/household.ts` — 9 členů domácnosti Warren (tabulka 4.5)

**1.8** `data/tyfova/questions.ts` — kvízové otázky pro každý krok

**1.9** `data/tyfova/historicalCases.ts` — 4 historické případy (1900, 1902, 1904, 1906)

> **POZNÁMKA**: Výpovědi (testimony) pro Ósackou horečku budou potřeba dodat —
> v zadání jsou jen master data, nikoliv samotné texty rozhovorů.
> Stejně tak dokumenty pro Tyfovou Mary budou muset být napsány/poskládány.
> **Plán počítá s placeholder texty, které se později nahradí.**

---

### FÁZE 2: Ósacká horečka — Core gameplay

**2.1** `store/osackaStore.ts` — Zustand store
- budget, calledContacts, selectedContact, playerNotes, epiCurve, identifiedInfected
- Akce: callContact, addNote, updateNote, toggleInfected, addToEpiCurve, finishGame

**2.2** `OsackaGame.tsx` — hlavní wrapper
- Fáze: intro (pravidla, storytelling) → playing → results
- Intro: krátký příběh ("Jste epidemiolog KHS, právě vám zavolali ze Springfieldu...")

**2.3** `PhoneDirectory.tsx` — telefonní seznam (levý sidebar)
- Seznam ~67 kontaktů seskupených: Osoby A-Z, Podniky
- Barevné kódování: ⚪ nevolaný, 🔵 volaný, 🔴 označen jako nakažený, 🟢 zdravý
- Filtrování/hledání
- Zobrazení ceny hovoru

**2.4** `TestimonyView.tsx` — panel s výpovědí (hlavní oblast)
- Zobrazí se po kliknutí na kontakt
- Text výpovědi
- Tlačítka: [Označit jako nakaženého] [Přidat poznámku] [Další otázky]
- Pokud kontakt nedostupný → zpráva "Telefon nikdo nebere" / "Číslo nefunkční"

**2.5** `BudgetBar.tsx` — ukazatel rozpočtu
- Vizuální progress bar
- Zbývající body / celkem
- Varování když < 20 %

**2.6** `Notebook.tsx` — zápisník hráče (spodní panel / tab)
- Tabulka: Jméno | Status | Datum příznaků | Zdroj nákazy | Poznámky
- Status dropdown: Nakažený / Zdravý (exp.) / Zdravý / Nedostupný / Neznámý
- Volný text poznámky

---

### FÁZE 3: Ósacká horečka — Analytické nástroje

**3.1** `EpiCurve.tsx` — interaktivní epidemiologická křivka
- Recharts BarChart
- Osa X: dny 1.11. – 14.11. (14 sloupců)
- Osa Y: počet nových případů
- Drag & drop: hráč přetáhne jméno osoby na konkrétní den
- Nebo: klikací přiřazení (vyber osobu → vyber den)
- Zobrazení jmen v každém sloupci

**3.2** `Timeline.tsx` — vizuální timeline
- Horizontální osa: dny 0-13
- Pro každou osobu řádek: inkubace → infekční → příznaky
- Hráč umisťuje osoby na timeline (na základě zjištěných dat)

**3.3** `ContactGraph.tsx` — trasovací mapa (volitelné, Fáze 3+)
- Síťový graf kontaktů (kdo nakazil koho)
- Uzly = osoby, hrany = kontakt/nákaza
- Barevné kódování: červená = nakažený, zelená = zdravý
- Jednoduchá implementace: SVG nebo canvas, force-directed layout

---

### FÁZE 4: Ósacká horečka — Hodnocení

**4.1** `OsackaResults.tsx` — výsledková obrazovka
- **Skóre**: body za identifikované nakažené, bonusy za superspreader události, penalizace za nesprávné
- **Porovnání s master daty**: kolik z 22 nakažených hráč identifikoval
- **Epi křivka**: hráčova vs. skutečná
- **Otázky**:
  - Kdo je pacient nula? (správně: zásilkový balíček / SKS kurýr)
  - Hlavní ohnisko? (Seymour Skinner → Edna → kaskáda)
  - Super-spreader události? (Bi-Mon-Sci-Fi-Con, JE, farma)
- **Trasovací diagram**: skutečný řetězec nákazy
- **Didaktické shrnutí**: co se hráč měl naučit

---

### FÁZE 5: Tyfová Mary — Core gameplay

**5.1** `store/tyfovaStore.ts` — Zustand store
- currentStep, unlockedDocuments, readDocuments, answers
- Akce: readDocument, submitAnswer, nextStep, finishGame

**5.2** `TyfovaGame.tsx` — hlavní wrapper
- 7 kroků (stepů), guided flow
- Krok 1: Přečti One pager + Case description
- Krok 2: Přečti výpovědi → Kdo onemocněl?
- Krok 3: Analyzuj zdroje → Je to voda? Mléko? Mušle?
- Krok 4: Vodní zpráva → vyloučení vody
- Krok 5: Historické případy → vzorec "nová kuchařka"
- Krok 6: Identifikace Mary → závěr
- Krok 7: Etická debata + kontrolní opatření

**5.3** `DocumentList.tsx` — seznam dokumentů (levý sidebar)
- ✅ Přečtený, 📖 Aktuálně čtený, 🔒 Zamčený
- Kliknutí → zobrazení v DocumentViewer

**5.4** `DocumentViewer.tsx` — zobrazení dokumentu (hlavní oblast)
- Renderování HTML/markdown obsahu
- Zvýraznění klíčových pasáží

**5.5** `QuizPanel.tsx` — otázky ke každému kroku (spodní panel)
- Multiple choice, checkbox, text input
- Okamžitá zpětná vazba (správně/špatně + vysvětlení)
- Tlačítko "Další krok" po zodpovězení

---

### FÁZE 6: Tyfová Mary — Analytické nástroje

**6.1** `HouseholdTable.tsx` — tabulka domácnosti
- 9 osob: jméno, role, onemocnění (checkbox pro hráče)
- Porovnání s realitou po zodpovězení

**6.2** `FoodMatrix.tsx` — matice jídel
- Řádky: osoby, Sloupce: jídla (mušle, mléko, ovoce, broskvový dezert, ...)
- Hráč zaškrtává co kdo jedl
- Zvýraznění společného jmenovatele

**6.3** `HistoricalCases.tsx` — přehled 4 historických případů
- Karta pro každý případ: rok, místo, nakažení, společný vzorec
- Zvýraznění: "kuchařka přišla nedávno a neonemocněla"

**6.4** `EthicsDebate.tsx` — diskuzní sekce
- Dva novinové články (pro Mary vs. pro systém)
- Otázky k zamyšlení (nehodnocené)
- Přehled 6 kontrolních opatření s pro/proti

---

### FÁZE 7: Tyfová Mary — Hodnocení

**7.1** `TyfovaResults.tsx` — výsledková obrazovka
- Počet správných odpovědí / celkem
- Čas řešení
- Shrnutí: hlavní zjištění
- Didaktický závěr: asymptomatický přenos, veřejné zdraví vs. práva, historický kontext

---

### FÁZE 8: UI/UX Polish

**8.1** AuthPanel — redesign pro 5 vstupů:
- Horní řada: [Expert] [Učitel] [Krizový štáb]
- Dolní řada (nový oddělovač): [Ósacká horečka] [Tyfová Mary]
- Nebo: přidat záložky "Simulace" / "Didaktikon" na AuthPanel

**8.2** Responzivní design — tablet-first pro obě hry

**8.3** Tmavý režim (volitelné)

**8.4** Nápovědy — info ikony s kontextuální nápovědou

**8.5** Print/export — možnost tisku výsledků

---

## Pořadí implementace (kritická cesta)

```
FÁZE 0 (scaffold)          ← 1. sprint
  ↓
FÁZE 1 (data)              ← 2. sprint (BLOKUJÍCÍ — bez dat nejsou hry)
  ↓
FÁZE 2 + 5 (core gameplay) ← 3. sprint (paralelně obě hry)
  ↓
FÁZE 3 + 6 (analytika)     ← 4. sprint
  ↓
FÁZE 4 + 7 (hodnocení)     ← 5. sprint
  ↓
FÁZE 8 (polish)             ← 6. sprint
```

---

## Rizika a otevřené otázky

1. **Texty výpovědí**: Zadání obsahuje master data (kdo je nakažený, dny), ale nikoliv plné texty rozhovorů pro 67 kontaktů. Tyto texty budou muset být napsány — buď je dodá uživatel, nebo je vygenerujeme na základě master dat.

2. **Dokumenty Tyfová Mary**: 7 dokumentů potřebuje obsah — buď z dodaných souborů (.docx), nebo vytvořit na základě zadání.

3. **Drag & drop**: EpiCurve drag & drop může být komplikovaný. Alternativa: click-based přiřazení (vyber osobu → klikni na den).

4. **Kontaktní graf**: Force-directed layout je vizuálně atraktivní ale může být matoucí pro 67 uzlů. Alternativa: hierarchický strom od pacienta nula.

5. **Velikost dat**: 67 kontaktů s plnými výpověďmi může být velký bundle. Řešení: lazy loading nebo code splitting.

6. **Bez backendu**: Vše běží client-side, žádné ukládání stavu mezi sezeními (pokud nepřidáme localStorage persistence).
