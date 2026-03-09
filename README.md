# Nedovařený tapír — Edukační SEIR simulátor

Interaktivní webová aplikace pro simulaci šíření infekčních onemocnění.
Určeno pro výuku studentů medicíny.

> **DISCLAIMER:** Toto je edukační simulátor. Není to klinický nástroj ani predikce reality.
> Výsledky nesmí být prezentovány jako doporučení pro reálná rozhodnutí.

## Spuštění

```bash
npm install
npm run dev      # vývojový server (http://localhost:5173)
npm run build    # produkční build
npm test         # testy simulačního engine
```

## Architektura

```
nedovareny-tapir/
├── simulation-core/        # čistý TypeScript engine (bez UI)
│   ├── src/
│   │   ├── types.ts        # sdílené typy, enumy, interface
│   │   ├── validation.ts   # přísná validace vstupů
│   │   ├── scenario-schema.ts # výchozí scénáře a schéma
│   │   ├── contact-matrix.ts  # home/school/work/community kontaktní matice
│   │   ├── calibration/
│   │   │   ├── ngm.ts      # next-generation matrix, spektrální poloměr
│   │   │   └── beta-calibration.ts # kalibrace β z R₀
│   │   ├── models/
│   │   │   ├── seir.ts     # základní age-stratified SEIR
│   │   │   ├── seirv.ts    # SEIR + vakcinace
│   │   │   ├── seirs.ts    # waning immunity
│   │   │   └── multistrain.ts # variant shock integrace
│   │   ├── npi-engine.ts   # intervence + compliance decay
│   │   ├── vaccination.ts  # rollout, VE waning
│   │   ├── variant-engine.ts # variant shock events
│   │   ├── stochastic.ts   # RNG, binomial přechody, Monte Carlo
│   │   ├── health-capacity.ts # H, ICU, excess deaths
│   │   └── export-utils.ts # CSV/JSON export s metadaty
│   └── tests/              # 57 testů (Vitest)
├── web-ui/                 # React UI
│   └── src/
│       ├── components/     # Dashboard, parametry, NPIs, vakcinace...
│       ├── store/          # Zustand state management
│       └── hooks/          # useSimulation (Web Worker)
└── worker/                 # Web Worker pro simulace
```

## Modely

### SEIR (základ)
- 6 strát: 3 věkové skupiny (0-18, 19-64, 65+) × 2 rizikové (standard, risk)
- Force of infection: `λ_i(t) = Σ_j β(t) · C_ij(t) · I_j(t) / N_j`
- Kontaktní matice = suma home + school + work + community sub-matic
- Konzervace: `S + E + I + R (+ V) = N` pro každou stratu

### Kalibrace β z R₀
- Next-generation matrix (NGM): `K = β · D_inf · M`, kde `M_ij = C_ij · N_i / N_j`
- `R₀ = β · D_inf · ρ(M)` (spektrální poloměr)
- `β = R₀ / (D_inf · ρ(M))`
- UI zobrazuje input R₀, implied R₀ (z NGM) a Reff(t)

### NPIs
- Typy: beta multiplikátor, gamma multiplikátor, sub-matrix modifier
- Compliance: exponenciální decay nebo piecewise-linear
- Příklad: zavření škol = school sub-matice × 0

### Vakcinace (SEIRV)
- Rollout schedule (dávky/den)
- VE_inf(t) a VE_sev(t) s exponenciálním waning
- Coverage target per strata

### Varianty
- Variant shock: fixní den nebo náhodný (seedovaný, Box-Muller)
- Parametry: transmissibilityMultiplier, immuneEscape, reinfectionBoost
- Instructor mode: hidden variant shock (student neví dopředu)

### Stochastika
- Seedovaný PRNG (mulberry32)
- Binomické přechody místo deterministických
- Monte Carlo: N běhů → medián + p5/p95 uncertainty bands
- Seed je vždy exportován pro reprodukovatelnost

## Seed a reprodukovatelnost

Každá stochastická simulace používá seedovaný PRNG (mulberry32).
Stejný seed + stejné parametry = stejný výsledek.
Monte Carlo používá `seed + i` pro i-tý běh.

## Přidání nového modelu

1. Vytvořte `simulation-core/src/models/my-model.ts`
2. Implementujte step funkci s rozhraním `(state, scenario, beta, contactMatrix, transition) → { newState, metrics }`
3. Zajistěte konzervaci populace (S+E+I+R+V = N)
4. Přidejte testy do `simulation-core/tests/`
5. Exportujte z `simulation-core/src/index.ts`

## Policy Literacy — Limity modelu

- **Model ≠ realita**: Předpokládá homogenní míšení uvnitř strát, konstantní parametry
- **Nejistota**: Parametrická (odhady R₀, IFR), strukturní (volba modelu), scénářová (intervence)
- **R₀/Reff jsou modelové veličiny**: Odvozeny z NGM, ne přímo měřené
- **Korelace ≠ kauzalita**: Model ukazuje mechanismus, ne důkaz
- **Stochastické vyhasnutí**: I při R₀ > 1 může epidemie vyhasnout při malém počtu případů

## Exporty

Všechny exporty obsahují:
- Název scénáře a hlavní parametry
- RNG seed
- Časové razítko a verzi aplikace
- Disclaimer ("Toto není klinická predikce")

PNG navíc obsahuje vodoznak "SIMULACE".

## Stack

- TypeScript strict mode
- Vite + React 18
- Tailwind CSS v4
- Zustand
- Recharts
- Vitest (57 testů)
