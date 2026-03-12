# Nedovařený tapír — Edukační epidemiologická platforma

Interaktivní webová aplikace pro výuku epidemiologie, krizového řízení a trasování kontaktů.
Obsahuje SEIR simulátor, tři didaktické hry a příručku epidemiologa.

> **DISCLAIMER:** Toto je edukační simulátor. Není to klinický nástroj ani predikce reality.
> Výsledky nesmí být prezentovány jako doporučení pro reálná rozhodnutí.

## Spuštění

```bash
npm install
npm run dev      # vývojový server (http://localhost:5173)
npm run build    # produkční build
npm test         # testy simulačního engine
```

## Režimy aplikace

Aplikace nabízí 6 režimů přístupných z hlavní obrazovky:

### 🏛️ Krizový štáb
Tahová simulace krizového řízení epidemie. Hráč se ujímá role hlavního hygienika (nebo premiéra) a rozhoduje o 35 opatřeních ve 14denních kolech.

**Klíčové mechaniky:**
- **5 předpřipravených scénářů:** Sezónní chřipka (snadný), SARS-CoV-3 (střední), Ptačí chřipka H5N1 (těžký), Ebola a Neštovice — bioterorizmus (extrémní)
- **35 opatření** v 7 kategoriích: sociální distancování, roušky, testování a trasování, vakcinace, armáda, mezinárodní spolupráce, ekonomická podpora
- **5 poradců** s kontextovými zprávami: epidemioložka (MUDr. Nováková), ekonom (Ing. Dvořák), politik (JUDr. Svoboda), generál (Gen. Vlk) a opozice (Mgr. Čermák)
- **Důvěra veřejnosti a sociální kapitál** (0–100), při kolapsu padá vláda
- **Systém schvalování:** Hlavní hygienik může žádat premiéra o opatření s legislativním zpožděním 1–2 kol
- **Skryté události:** varianty, výpadky nemocnic, protesty, zprávy WHO
- **Závěrečné vyhodnocení** s věkovou stratifikací obětí a osobními příběhy z epidemie

### 🦠 Ósacká horečka
Telefonní trasování kontaktů ve Springfieldu. Hráč identifikuje nakažené, hledá superspreader události a sestavuje epidemickou křivku — vše v rámci omezeného rozpočtu 100 bodů.

### 🔍 Záhada z Oyster Bay
Historická detektivka z roku 1906. Hráč jako sanitární inženýr George Soper vyšetřuje záhadnou epidemii břišního tyfu v domácnosti Warrenových. 7 kroků vyšetřování s dokumenty, výpověďmi a kvízovými otázkami.

### 📖 Příručka epidemiologa
Interaktivní školení o epidemiologii se 7 kapitolami: přenos virů, SEIR modely, opatření a intervence, trasování kontaktů, krizové řízení a narativní příběh o práci epidemioložky.

### 🔬 Odborný režim
Parametrický sandbox pro kontrolu epidemiologických modelů. Přímé nastavení R₀, kontaktních matic, NPI, vakcinace, variant a stochastiky s vizualizací SEIRV kompartmentů.

### 🎓 Učitelský režim
Tvorba vlastních scénářů pro Krizový štáb s generováním odkazů pro studenty.

## Architektura

```
nedovareny-tapir/
├── simulation-core/        # čistý TypeScript engine (bez UI)
│   ├── src/
│   │   ├── types.ts        # sdílené typy, enumy, interface
│   │   ├── validation.ts   # přísná validace vstupů
│   │   ├── scenario-schema.ts # výchozí scénáře a schéma
│   │   ├── preset-scenarios.ts # 5 předpřipravených herních scénářů
│   │   ├── measure-catalog.ts  # katalog 35 opatření s unlock podmínkami
│   │   ├── contact-matrix.ts   # home/school/work/community kontaktní matice
│   │   ├── calibration/
│   │   │   ├── ngm.ts      # next-generation matrix, spektrální poloměr
│   │   │   └── beta-calibration.ts # kalibrace β z R₀
│   │   ├── models/
│   │   │   ├── seir.ts     # základní age-stratified SEIR
│   │   │   ├── seirv.ts    # SEIR + vakcinace
│   │   │   ├── seirs.ts    # waning immunity
│   │   │   └── multistrain.ts # variant shock integrace
│   │   ├── step-runner.ts  # tahový engine krizového štábu
│   │   ├── advisors.ts     # 5 poradců, 150+ kontextových zpráv
│   │   ├── npi-engine.ts   # intervence + compliance decay
│   │   ├── vaccination.ts  # rollout, VE waning
│   │   ├── variant-engine.ts # variant shock events
│   │   ├── health-capacity.ts # H, ICU, excess deaths
│   │   ├── stochastic.ts   # RNG, binomial přechody, Monte Carlo
│   │   └── export-utils.ts # CSV/JSON export s metadaty
│   └── tests/              # 12 test souborů (Vitest)
├── web-ui/                 # React UI (mobilně optimalizované)
│   └── src/
│       ├── components/
│       │   ├── student/    # Krizový štáb UI (TurnDashboard, ActionPanel, GameOver...)
│       │   ├── tyfova/     # Záhada z Oyster Bay (7-krokové vyšetřování)
│       │   ├── osacka/     # Ósacká horečka (trasování kontaktů)
│       │   ├── handbook/   # Příručka epidemiologa
│       │   └── instructor/ # Učitelský režim (ScenarioBuilder)
│       ├── store/          # Zustand state management
│       │   ├── gameStore.ts    # stav krizového štábu
│       │   ├── tyfovaStore.ts  # stav Záhady z Oyster Bay
│       │   ├── osackaStore.ts  # stav Ósacké horečky
│       │   └── useAppStore.ts  # globální stav aplikace
│       └── hooks/          # useSimulation (Web Worker)
└── worker/                 # Web Worker pro simulace
```

## Epidemiologické modely

### SEIR (základ)
- 6 strát: 3 věkové skupiny (0–17, 18–64, 65+) × 2 rizikové (standard, risk)
- Force of infection: `λ_i(t) = Σ_j β(t) · C_ij(t) · I_j(t) / N_j`
- Kontaktní matice = suma home + school + work + community sub-matic
- Konzervace: `S + E + I + R (+ V) = N` pro každou stratu

### Kalibrace β z R₀
- Next-generation matrix (NGM): `K = β · D_inf · M`, kde `M_ij = C_ij · N_i / N_j`
- `R₀ = β · D_inf · ρ(M)` (spektrální poloměr)
- `β = R₀ / (D_inf · ρ(M))`

### Zdravotnický systém
- Hospitalizace a JIP s kapacitními limity
- Excess deaths při přetížení (denní hazard rate z celkové mortality)
- Restrukturalizace lůžek, polní nemocnice

### NPIs (35 opatření)
- Typy: beta multiplikátor, gamma multiplikátor, sub-matrix modifier
- Compliance: exponenciální decay (individuální per opatření)
- Ramp-up delay + legislativní zpoždění pro vládní opatření
- Unlock podmínky: vždy / kolo / sociální kapitál / události / úmrtí / obsazenost nemocnic

### Vakcinace (SEIRV)
- Rollout schedule (dávky/den), 3 distribuční strategie
- VE_inf(t) a VE_sev(t) s exponenciálním waning
- Prioritizace podle věku a rizika

### Varianty
- Variant shock: fixní den nebo náhodný (seedovaný, Box-Muller)
- Parametry: transmissibilityMultiplier, immuneEscape, reinfectionBoost

### Stochastika
- Seedovaný PRNG (mulberry32)
- Binomické přechody místo deterministických
- Monte Carlo: N běhů → medián + p5/p95 uncertainty bands

## Krizový štáb — herní mechaniky

| Mechanika | Popis |
|---|---|
| **Kola** | 14denní tahy, typicky 12–26 kol |
| **Vedení** | Hygienik (výchozí) nebo Premiér (nad prahem úmrtí) |
| **Důvěra** | 0–100, klesá s agresivními opatřeními a úmrtími |
| **Sociální kapitál** | 0–100, kolaps pod prahem → pád vlády |
| **Ekonomika** | HDP dopad, nezaměstnanost, fiskální náklady |
| **Poradci** | 5 rolí s urgencí low/medium/high/critical |
| **Opozice** | Kooperativní po 3+ briefingech, jinak nepřátelská |
| **Schvalování** | Hygienik žádá vládu, šance 10–100 % dle počtu nakažených |
| **Legislativa** | 1–2 kola zpoždění pro schválená vládní opatření |
| **Události** | Varianty, WHO intel, protesty, výpadky nemocnic |

## Exporty

Všechny exporty obsahují:
- Název scénáře a hlavní parametry
- RNG seed
- Časové razítko a verzi aplikace
- Disclaimer ("Toto není klinická predikce")

Formáty: **CSV** (denní metriky), **JSON** (kompletní data), **PNG** s vodoznakem "SIMULACE".

## Mobilní podpora

Všechny hry a stránky jsou optimalizované pro mobilní zařízení:
- Záhada z Oyster Bay a Ósacká horečka: záložkový layout na mobilu (místo 3-sloupcového)
- Příručka: horizontální scrollovatelná navigace
- Krizový štáb: stacked layout s charts nahoře a opatřeními dole
- Responzivní hlavička, karty scénářů a výsledkové obrazovky

## Stack

- TypeScript strict mode
- Vite + React 19
- Tailwind CSS v4
- Zustand (state management)
- Recharts (vizualizace)
- Vitest (testy)
- pako (komprese scénářů pro sdílení)
