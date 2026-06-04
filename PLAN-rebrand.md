# PLAN — Velký refresh & rebrand „Nedovařeného tapíra"

> Stav: **návrh k odsouhlasení.** Tento dokument zatím nic neimplementuje, jen
> popisuje cílový stav a fázování. Grafická část má vlastní zadání v
> [`DESIGN-BRIEF.md`](./DESIGN-BRIEF.md).

## 0. Rozhodnutí (odsouhlasená zadání)

| Téma | Volba |
|------|-------|
| Skóre & porovnávání 20–50 studentů | **Supabase realtime** (místnosti + živý leaderboard) |
| Brand | **Zachovat název „Nedovařený tapír" + maskot tapíra** |
| Vizuální styl SVG | **Ploché geometrické + retro-věda** |
| Rozsah tohoto kroku | **Plán + zadání pro designera** (kód měníme až po schválení) |

---

## 1. Cíle a cílová skupina

**Cílová skupina:** žáci SŠ a VŠ, typicky **20–50 současně** připojených na
jednom zařízení každý (mobil / tablet / notebook ve třídě). Učitel zadá jednu
aktivitu, studenti ji odehrají a třída si porovná výsledky.

**Co chceme vyřešit (z tvého zadání):**

1. **a) Přehlednější úvodní stránka** — dnešní rozcestník je přeplácaný.
2. **b) Ovládání pro tablety** — chybí touch-friendly UI.
3. **Skórování + porovnání mezi studenty** — kdo jak dopadl, živě.
4. **Lepší generování URL** — učitel pošle jeden odkaz na konkrétní hru.
5. **Tlačítko Home** — návrat na rozcestník odkudkoliv.
6. **Brand & grafika** — pryč od „AI-generated" vzhledu, jednotná SVG identita.

---

## 2. Diagnóza současného stavu (kde to drhne)

Routing je dnes **stavový, ne URL** — vše řídí `appMode` v
`web-ui/src/store/useAppStore.ts` a velký `if/else` v `web-ui/src/App.tsx`.
Z toho plynou skoro všechny problémy:

| Problém | Kde to v kódu žije |
|--------|--------------------|
| Přeplácaný rozcestník | `web-ui/src/components/AuthPanel.tsx` — 6 karet + login + handbook na jedné obrazovce, vše šedé Tailwind boxy s emoji (🔬🎓🏛️🦠🔍📖) |
| URL umí jen Krizový štáb | `ScenarioBuilder.tsx:53` generuje `#game=<base64>`; Ósacká a Oyster Bay **nemají vlastní odkaz** |
| Žádný Home | `Header.tsx` má jen „Odhlásit"; hamburger jen v Expert módu |
| Skóre jen lokálně | `data/osacka/scoring.ts` (plný systém A–F), `tyfova/TyfovaResults.tsx` (kvíz %), `student/GameOverScreen.tsx` — **nic se nesdílí mezi studenty** |
| Není backend pro třídu | `lib/classroom-db.ts` je jen `localStorage` (jen heslo učitele) |
| Tablet/touch | sidebar pevně `w-80`, drobné fonty, `hover:` afordance, telefonní trasování v Ósacké počítá s myší |
| „AI" vzhled | emoji místo ikon, generická šedá paleta, žádná typografie/maskot |

**Dobrá zpráva:** herní logika a skórování jsou čisté a oddělené
(`simulation-core/` + per-hra stores). Refresh je primárně o **vrstvě navigace,
prezentace a tenké backendové vrstvě** — jádro se nedotýká.

---

## 3. Informační architektura — nový rozcestník (hub)

Místo jedné natřískané obrazovky → **čistý hub** se třemi jasnými vrstvami:

```
┌──────────────────────────────────────────────┐
│  [logo tapír]  Nedovařený tapír      [≡ menu] │   ← global header (vždy)
├──────────────────────────────────────────────┤
│                                                │
│   HRY PRO TŘÍDU            (velké dlaždice)     │
│   ┌────────┐ ┌────────┐ ┌────────┐             │
│   │Krizový │ │Ósacká  │ │Oyster  │             │
│   │ štáb   │ │horečka │ │ Bay    │             │
│   └────────┘ └────────┘ └────────┘             │
│                                                │
│   UČENÍ                                         │
│   ┌────────┐ ┌────────┐                         │
│   │Příručka│ │Sandbox │                         │
│   └────────┘ └────────┘                         │
│                                                │
│   PRO UČITELE  → [Učitelský režim / přihlásit] │   (decentní, dole)
└──────────────────────────────────────────────┘
```

Principy:
- **Student nepotřebuje přihlášení** — jde rovnou na hru (dnes už `AuthPanel`
  pro hosty obchází, jen je to schované).
- **Učitelský vstup je decentní** sekce dole, ne třetina obrazovky.
- Každá dlaždice = jedna SVG ikona z nové sady (viz design brief), krátký
  popis, odhad času, štítek obtížnosti.
- Hub je samostatná komponenta `components/hub/HubScreen.tsx` (nahradí
  prezentační roli `AuthPanel`); přihlašovací formulář učitele se přesune do
  `components/hub/TeacherEntry.tsx` (modal/sekce).

---

## 4. Routing & URL — odkaz na jednu hru + Home

Zavedeme **lehký hash-router** (bez závislosti na `react-router`; stačí ~40
řádků), aby každý režim měl skutečnou adresu. Parser `web-ui/src/lib/route.ts`
mapuje `location.hash` → `{ mode, gameId, params }` a zpět.

### Navržené adresy

| Adresa | Co otevře |
|--------|-----------|
| `#/` | Rozcestník (hub) |
| `#/hra/krizovy-stab` | Krizový štáb (výchozí scénář) |
| `#/hra/krizovy-stab?s=<base64>` | Krizový štáb s učitelovým scénářem (dnešní `#game=` → migrujeme) |
| `#/hra/osacka` | Ósacká horečka |
| `#/hra/oyster-bay` | Záhada z Oyster Bay |
| `#/prirucka` | Příručka epidemiologa |
| `#/sandbox` | Odborný režim |
| `#/ucitel` | Učitelský režim (po přihlášení) |
| `#/vysledky/<KÓD>` | Živý leaderboard místnosti (učitel) |

### Sdílení místnosti (třída)

Učitel klikne „Spustit pro třídu" → vznikne **místnost s kódem** (např.
`TAPIR-7Q2K`) a appka nabídne:
- **odkaz pro studenty**: `…/#/hra/osacka?room=TAPIR-7Q2K`
- **QR kód** téhož odkazu (projekce na tabuli — student naskenuje telefonem),
- **kód** k ručnímu zadání (`#/` → „Připojit se ke třídě" → zadá kód).

`?room=` se propíše do skóre při odeslání (viz §6). Bez `?room=` hra funguje
dál samostatně (skóre jen lokálně).

### Tlačítko Home

Do globálního headeru přidáme **🏠 / logo = návrat na `#/`**. Logo je vždy
klikací (standard). U rozehrané hry zobrazíme **potvrzení „Opravdu opustit
hru?"**, aby student nepřišel o postup omylem. Funguje i tlačítko Zpět v
prohlížeči (díky hash-routeru).

### Zpětná kompatibilita

Staré odkazy `…#game=<base64>` necháme fungovat: parser je rozpozná a přesměruje
na `#/hra/krizovy-stab?s=<base64>` (logika z `App.tsx:67-83` a
`ScenarioLoader.tsx` se sem přesune).

---

## 5. Ovládání pro tablety (touch-first)

Audit a úpravy (Tailwind, žádná nová závislost):

- **Touch terče min. 44×44 px** napříč herními ovládacími prvky.
- **Sidebar → drawer**: v Odborném režimu se z pevného `w-80` (`App.tsx:186`)
  stane na tabletu/mobilu výsuvný panel přes overlay; hamburger zpřístupníme
  ve všech relevantních režimech (dnes jen Expert, `Header.tsx:19`).
- **Nahradit hover-only afordance** za viditelné stavy (tap/selected). Klíčové
  v Ósacké horečce (telefonní trasování `components/osacka/`) — výběr osoby a
  kreslení přenosových linků musí jít prstem (tap-to-select, tap-to-link místo
  hoveru).
- **Responzivní mřížky her** v `TurnDashboard.tsx` a herních deskách: 1 sloupec
  na mobilu, 2 na tabletu, plný layout na desktopu.
- **Větší písmo a rozestupy** v herních režimech (dnešní `text-xs` je na tablet
  z dálky málo čitelné).
- **Bez závislosti na pravém kliku / přejetí myší.**
- Ověření na šířkách **768 px (tablet na výšku)** a **1024 px (na šířku)** +
  rychlý smoke test na ~390 px (mobil).

---

## 6. Skóre & živý leaderboard (Supabase realtime)

### Princip

1. Učitel založí **místnost** pro vybranou hru → dostane kód + odkaz/QR.
2. Studenti hrají přes odkaz (`?room=KÓD`).
3. Po dohrání hra vyzve na **přezdívku** a odešle skóre do Supabase.
4. Učitel má otevřený **leaderboard** (`#/vysledky/KÓD`), který se přes
   **Supabase Realtime** plní živě, jak studenti dohrávají.

### Jednotné skóre napříč hrami

Každá hra skóruje jinak (Ósacká: body + známka A–F; Oyster Bay: kvíz %; Krizový
štáb: vyhodnocení v `GameOverScreen`). Zavedeme normalizovaný tvar:

```ts
// web-ui/src/lib/scoring-shared.ts
interface SharedScore {
  gameId: 'krizovy-stab' | 'osacka' | 'oyster-bay';
  playerName: string;
  raw: number;          // surové body (kontext hry)
  maxRaw: number;
  percentage: number;   // 0–100, hlavní řadicí klíč
  grade?: string;       // A–F kde dává smysl
  details: Record<string, unknown>; // rozpad pro debrief
}
```

Adaptér v každé hře převede svůj výsledek na `SharedScore` (Ósacká už má
`ScoreResult` v `data/osacka/scoring.ts` — jen namapovat).

### Schéma Supabase (návrh)

```sql
create table rooms (
  code        text primary key,           -- 'TAPIR-7Q2K'
  game_id     text not null,
  teacher_name text,
  scenario    jsonb,                       -- jen pro Krizový štáb
  created_at  timestamptz default now(),
  closed_at   timestamptz
);

create table scores (
  id          uuid primary key default gen_random_uuid(),
  room_code   text references rooms(code),
  player_name text not null,
  game_id     text not null,
  percentage  numeric not null,
  raw         numeric,
  max_raw     numeric,
  grade       text,
  details     jsonb,
  created_at  timestamptz default now()
);

create index on scores (room_code, percentage desc);
```

**RLS / bezpečnost (edukační kontext, low-stakes):**
- `anon` smí `insert` do `scores` jen pro existující a neuzavřenou místnost.
- `anon` smí `select` ze `scores` jen filtrované přes `room_code`.
- Místnost zakládá rovněž `anon` (učitel bez účtu) — kód je dostatečně
  náhodný, místnosti expirují (cron/closed_at). Žádná osobní data: jen
  přezdívka, kterou si student zvolí. Doplníme krátkou poznámku o GDPR
  (nezadávat skutečná jména).
- Realtime publikace na `scores` filtrovaná `room_code=eq.<KÓD>`.

> Pozn.: Supabase je dostupný přes MCP — tabulky, RLS i migrace umíme založit
> přímo. Konfiguraci klíčů (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
> doplníme do Vercel env. Pokud bys Supabase nakonec nechtěl, fallback je
> „kódové" sdílení bez serveru — ale to pro 50 lidí nedoporučuju.

### Leaderboard UI

- `components/classroom/Leaderboard.tsx` — živá tabulka (pořadí, přezdívka,
  %, známka), top 3 s **medailovými SVG** (zlato/stříbro/bronz z nové sady),
  průměr/medián třídy, histogram výsledků.
- Vhodné pro **projekci na tabuli** (velké písmo, vysoký kontrast).
- Studentova závěrečná obrazovka ukáže „jsi X. z Y" + odkaz na třídní žebříček.

---

## 7. Brand & vizuál (shrnutí)

Detailní zadání → [`DESIGN-BRIEF.md`](./DESIGN-BRIEF.md). Stručně:

- **Identita:** maskot tapíra + wordmark, styl **ploché geometrické +
  retro-věda** (omezená paleta, výrazné tvary, „vědecký plakát").
- **Jednotná SVG sada:** logo, maskot v několika pózách, ikony 5–6 dlaždic,
  UI ikony, medaile/odznaky pro leaderboard, prázdné stavy, pozadí/patterny.
- **Design tokeny:** barvy, typografie, poloměry, tloušťky linek → do
  `tailwind.config.js` + `web-ui/src/index.css` jako CSS proměnné, ať je vzhled
  konzistentní a nevypadá „náhodně".
- Assety uložíme do `web-ui/src/assets/brand/` a budeme je importovat jako
  React komponenty (SVGR) nebo statické `<img>`.

---

## 8. Fázování (návrh PR po sobě)

Aby refresh šel po stravitelných, testovatelných kusech:

| Fáze | Obsah | Závislost |
|------|-------|-----------|
| **F1 — Routing & Home** | hash-router (`lib/route.ts`), Home v headeru, per-hra URL, zpětná kompatibilita `#game=` | žádná |
| **F2 — Hub** | nový rozcestník `components/hub/`, přesun učitelského loginu, zapojení nových SVG dlaždic | F1 + grafika |
| **F3 — Tablet/touch** | drawer sidebar, 44px terče, touch trasování v Ósacké, responzivní herní mřížky | F1 |
| **F4 — Skóre & leaderboard** | `scoring-shared.ts` + adaptéry, Supabase tabulky/RLS, místnosti + QR, `Leaderboard.tsx` realtime | F1 |
| **F5 — Brand polish** | tokeny do Tailwindu, maskot/empty states, sjednocení typografie, odstranění emoji | grafika |

Grafika (design brief) běží **paralelně** od začátku; F2 a F5 na ni čekají.

---

## 9. Rizika a otevřené otázky

- **Supabase env na Vercelu** — potřeba doplnit klíče; bez nich F4 poběží v
  „offline" fallbacku (lokální skóre).
- **Zneužití anonymního zápisu** — řešíme náhodným kódem, expirací místností a
  rate-limitem; pro školní kontext dostačující.
- **Migrace starých odkazů** — pohlídat, ať učitelé s rozeslaným `#game=`
  odkazem nepřijdou o funkčnost (řešeno v F1).
- **Konzistence skóre** — definovat „spravedlivé" % napříč různě těžkými hrami
  (leaderboard je vždy v rámci jedné hry/místnosti, takže se míchat nebudou).
- **Rozsah maskota** — kolik póz/variant reálně potřebujeme do v1 (viz brief).

---

## 10. Co teď potřebuju od tebe

1. Schválit informační architekturu hubu (§3) a schéma URL (§4).
2. Potvrdit, že můžu pro F4 založit Supabase tabulky (§6) přes MCP.
3. Projít [`DESIGN-BRIEF.md`](./DESIGN-BRIEF.md) a doladit paletu/tonalitu.

Po odsouhlasení začnu **F1 (routing + Home)** — je bezrizikové a hned viditelné.
