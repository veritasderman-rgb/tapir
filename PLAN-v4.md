# Tapir v4.0+ — Implementační plán

## Současný stav (v3.0)

### Engine (`simulation-core/src/`)
- **Typy**: 6 strát (3 věk × 2 riziko), kompartmenty S/E/I/R/V/H/ICU/D
- **SEIR step**: Euler integrátor, `stepSEIR()` → `stepSEIRV()` → `runMultistrain()`
- **Kontaktní matice**: 4 sub-matice (home/school/work/community), 3×3
- **NPIs**: BetaMultiplier / GammaMultiplier / ContactSubMatrixModifier + compliance (exponential decay / piecewise linear)
- **Vakcinace**: S→V tok, VE waning (exp decay), dosesPerDay rollout
- **Varianty**: transmissibilityMultiplier, immuneEscape (snižuje VE), reinfectionBoost (R→S)
- **Health capacity**: okamžitý H/ICU tok z I, fixní discharge rate (H: 10%/den, ICU: 7%/den), excess mortality při overflow
- **Stochastika**: Mulberry32 PRNG, binomial transitions, Monte Carlo s quantiles (p5/median/p95)

### UI (`web-ui/src/`)
- Zustand store, tab-based sidebar (Parametry/NPIs/Vakcinace/Varianty/Stochastika/Export)
- Recharts dashboard: SEIR křivky, nové infekce + MC pásy, Reff(t), H+ICU s kapacitními čarami
- Instructor panel, comparison mode (A vs B), Policy Literacy panel

---

## Iterace A: Klinická realita a časová zpoždění

### A1. Gamma Delay Engine (simulation-core)

**Soubor**: `simulation-core/src/delay-engine.ts` (nový)

Přidáme konvoluční delay kernel pro modelování distribuce doby od infekce k hospitalizaci a od hospitalizace k propuštění/úmrtí.

```
Princip: Erlang/Gamma sub-kompartmenty
- E (exposed) už funguje jako 1-stage delay. Rozšíříme na k-stage:
  E₁ → E₂ → ... → Eₖ, kde rate = k/meanLatentPeriod
  Toto produkuje Gamma(k, mean/k) distribuci
- Totéž pro I→H delay a H→R/D delay
```

**Implementace**:
1. Nový interface `DelayConfig`:
   ```ts
   interface DelayConfig {
     /** Onset-to-hospitalization: mean days */
     onsetToHospMean: number;      // default: 7
     /** Onset-to-hospitalization: shape k (stages) */
     onsetToHospStages: number;    // default: 3
     /** Hospitalization LoS: mean days */
     hospLosMean: number;          // default: 10
     /** Hospitalization LoS: shape k */
     hospLosStages: number;        // default: 4
     /** ICU LoS: mean days */
     icuLosMean: number;           // default: 14
     /** ICU LoS: shape k */
     icuLosStages: number;         // default: 3
   }
   ```

2. Konvoluční buffer místo sub-kompartmentů (výpočetně levnější):
   ```ts
   // Pre-compute discrete PMF for Gamma(k, θ) na max 60 dní
   function gammaDelayPMF(stages: number, mean: number, maxDays: number): number[]

   // DelayBuffer: ring buffer, pushne nové případy, vrátí realizované výstupy
   class DelayBuffer {
     constructor(pmf: number[])
     push(amount: number): void
     getOutput(): number  // konvoluce vstupů s PMF
   }
   ```

3. Integrace do `stepSEIR`:
   - Místo okamžitého `newHosp[i] = newInfections[i] * hospRate` → push do DelayBuffer, output = opožděné hospitalizace
   - Místo fixního `hospDischarge = H * 0.1` → push do LoS bufferu, output = propuštění

**Změny v types.ts**:
- Přidat `DelayConfig` do `ScenarioConfig`
- Přidat `delayConfig?: DelayConfig` (optional, backward-compatible)

**Změny v models/seir.ts**:
- `runSEIR` / `runMultistrain` — inicializovat delay buffery (6 strát × 3 buffery = 18 bufferů)
- `stepSEIR` přijme delay buffery jako parametr

### A2. Reporting Rate & Observed vs True (simulation-core + UI)

**Soubor**: `simulation-core/src/reporting.ts` (nový)

```ts
interface ReportingConfig {
  /** Detection rate — fraction of true infections reported [0,1] */
  detectionRate: number;       // default: 0.3
  /** Reporting delay mean (days) */
  reportingDelayMean: number;  // default: 3
  /** Reporting delay stages */
  reportingDelayStages: number; // default: 2
}
```

**Implementace**:
1. Po každém kroku simulace: `observedInfections = trueInfections * detectionRate`, zpožděno přes DelayBuffer
2. Nové pole v `DailyMetrics`:
   ```ts
   observedNewInfections: number;
   observedNewHospitalizations: number;
   ```

**UI změny**:
- `web-ui/src/components/ParameterPanel.tsx` — přidat Reporting Rate slider (0-100%)
- `web-ui/src/components/Dashboard.tsx` — toggle "Skutečný stav / Hlášené případy"
  - True: červená plná čára
  - Observed: oranžová přerušovaná čára
- Zustand store: `viewMode: 'true' | 'observed' | 'both'`

### A3. Testy pro Iteraci A

- `simulation-core/tests/delay.test.ts`:
  - Gamma PMF sčítá na ~1.0
  - DelayBuffer: push N, po mean dnech vyjde ~N
  - Konzervace populace: S+E+I+R+V+H+ICU+D = const (s delay buffery musíme trackovat in-transit lidi)
- `simulation-core/tests/reporting.test.ts`:
  - observed ≤ true vždy
  - observed peak je opožděný oproti true peak

---

## Iterace B: Ekonomika a sociální dynamika

### B1. Social Capital Engine (simulation-core)

**Soubor**: `simulation-core/src/social-capital.ts` (nový)

```ts
interface SocialCapitalConfig {
  /** Starting social capital [0,1] */
  baseline: number;              // default: 1.0
  /** NPI social costs per day (keyed by NPI id) */
  npiDailyCosts: Record<string, number>;
  /** Default daily cost if not specified */
  defaultDailyCost: number;      // default: 0.01
  /** Recovery rate when no NPIs active (per day) */
  recoveryRate: number;          // default: 0.005
  /** Threshold below which compliance drops steeply */
  collapseThreshold: number;     // default: 0.3
}
```

**Mechanika**:
```
Sc(t+1) = Sc(t) - Σ(active NPIs) cost_i + recovery * (1 - anyNPIactive)
Sc = clamp(Sc, 0, 1)

Compliance modifier = Sc >= threshold ? Sc : Sc * (Sc / threshold)^2
```

**Integrace**:
- `npi-engine.ts` `applyNPIs()` — přijme `socialCapital: number`, násobí compliance
- `runMultistrain()` — trackuje Sc(t) přes celou simulaci, předává do applyNPIs

**Nové pole v DailyMetrics**:
```ts
socialCapital: number;
effectiveCompliance: number;
```

### B2. Ekonomický model (simulation-core)

**Soubor**: `simulation-core/src/economics.ts` (nový)

```ts
interface EconomicsConfig {
  enabled: boolean;
  /** GDP per capita per day (v CZK nebo EUR) */
  dailyGDPPerCapita: number;
  /** Fraction of GDP lost per day per NPI type */
  npiGDPCosts: Record<string, number>;
  /** QALY value (willingness to pay per QALY) */
  qalyValue: number;             // default: 1_500_000 CZK
  /** Life expectancy by age group [child, adult, senior] */
  lifeExpectancy: [number, number, number]; // [70, 40, 15]
  /** DALY disability weight for hospitalization */
  hospDisabilityWeight: number;  // default: 0.133
}
```

**Výpočty**:
```ts
// Po každém run:
function computeEconomicImpact(run: SimulationRun, config: EconomicsConfig, scenario: ScenarioConfig): EconomicSummary

interface EconomicSummary {
  totalGDPLoss: number;
  totalQALYsLost: number;
  totalDALYs: number;
  costPerQALYSaved: number;  // vs. no-intervention baseline
  dailyGDPLoss: number[];
}
```

### B3. UI pro Iteraci B

- **Dashboard**: nový graf "Social Capital Sc(t)" — plocha s barevným gradientem (zelená→žlutá→červená)
- **Dashboard**: MetricCard "GDP ztráta" a "Cena za QALY"
- **Sidebar tab "Ekonomika"**: konfigurace GDP per capita, QALY value
- **End-of-run summary banner**: "Vaše opatření stála X mld. CZK a zachránila Y QALY"

---

## Iterace C: Kontrafaktuální analýza

### C1. Shadow Simulation (simulation-core)

**Soubor**: `simulation-core/src/counterfactual.ts` (nový)

```ts
interface CounterfactualResult {
  /** Baseline run (no interventions) */
  baselineRun: SimulationRun;
  /** Averted infections (AUC difference) */
  avertedInfections: number;
  /** Averted hospitalizations */
  avertedHospitalizations: number;
  /** Averted deaths */
  avertedDeaths: number;
  /** Daily averted infections */
  dailyAverted: number[];
}

function runCounterfactual(scenario: ScenarioConfig): CounterfactualResult {
  // Run identical scenario with npis=[], vaccination.enabled=false
  const baselineScenario = { ...scenario, npis: [], vaccination: { ...scenario.vaccination, enabled: false } };
  const baselineRun = runMultistrain(baselineScenario, ...);
  // Compute AUC differences
}
```

### C2. UI — Ghost Lines & Report

**Dashboard.tsx**:
- Přidat toggle "Zobrazit kontrafaktuál"
- Ghost lines: `<Line strokeOpacity={0.3} strokeDasharray="8 4" stroke="#9ca3af" />` pro baseline
- Nový `<AreaChart>` ukazující "averted area" (oblast mezi baseline a student křivkou)

**End-of-Run Report** (`web-ui/src/components/EndOfRunReport.tsx` nový):
- Modal/banner po dokončení simulace
- "Vaše včasné uzavření škol odvrátilo X hospitalizací, ale stálo ekonomiku Y mld."
- Vizuální srovnání: intervenční vs. neintervenční klíčové metriky

### C3. Zustand store rozšíření

```ts
// Nové fieldy:
counterfactual: CounterfactualResult | null;
showCounterfactual: boolean;
```

---

## Iterace D: Pokročilé varianty a Triage

### D1. Cross-Immunity Matrix (simulation-core)

**Soubor**: `simulation-core/src/models/multistrain-v2.ts` (nový, nahradí multistrain.ts)

```ts
interface StrainConfig {
  id: string;
  name: string;
  /** R0 multiplier relative to wildtype */
  transmissibilityMultiplier: number;
  /** Cross-immunity from previous strains [strainId → protection level 0-1] */
  crossImmunity: Record<string, number>;
  /** Day of introduction */
  introductionDay: number;
}
```

**Přístup**: Rozšířený stav per-strain
- Každý strain trackuje vlastní `I_strain` a `R_strain` per stratum
- Cross-immunity snižuje susceptibilitu: `effective_S = S * (1 - crossImmunity[prevStrain] * R_prevStrain/N)`
- CompartmentState rozšíření:
  ```ts
  interface ExtendedCompartmentState extends CompartmentState {
    I_by_strain: Record<string, number>;
    R_by_strain: Record<string, number>;
  }
  ```

### D2. Immune Escape & R→S (variant-engine.ts rozšíření)

Stávající `reinfectionBoost` rozšířit o selektivní escape:
```ts
interface VariantShockConfig {
  // ... existing fields ...
  /** Per-strain immune escape [strainId → escape fraction] */
  perStrainEscape?: Record<string, number>;
}
```

### D3. Triage & Excess Mortality (health-capacity.ts rozšíření)

Stávající `computeHealthOutcomes` rozšířit:
```ts
interface HealthUpdate {
  // ... existing fields ...
  triageActive: boolean;
  ifrMultiplier: number;  // 1.0 normal, 2-3x when triage
  excessDeathsNoICU: number;
  excessDeathsNoHosp: number;
}
```

**Logika**:
```
if (ICU_needed > ICU_capacity):
  triageActive = true
  overflow_ratio = ICU_needed / ICU_capacity
  ifrMultiplier = 1 + (overflow_ratio - 1) * triage_severity_factor
  // Apply elevated IFR only to overflow patients
```

### D4. UI — Triage vizualizace

- Dashboard: šrafovaná oblast v grafu úmrtí (Pattern fill nebo stacked bar pro excess vs. base deaths)
- Alert banner: "TRIAGE AKTIVNÍ — den X-Y" s červeným pulzujícím indikátorem
- Nová MetricCard: "Peak ICU deficit" a "Dní v triage"

---

## Iterace E: Instructor & Gamification

### E1. Scenario Sandbox (simulation-core + UI)

**Rozšíření Zustand store**:
```ts
interface InstructorConfig {
  /** Locked parameters (student cannot modify) */
  lockedParams: Set<string>;     // ← už existuje
  /** Hidden variant events */
  hiddenEvents: boolean;         // ← už existuje
  /** Scheduled hidden events */
  scheduledEvents: ScheduledEvent[];   // NOVÉ
  /** Pre-configured scenario (read-only for student) */
  scenarioTemplate: Partial<ScenarioConfig> | null;
}

interface ScheduledEvent {
  day: number;
  type: 'superspreader' | 'variant_intro' | 'hospital_surge' | 'vaccine_shipment';
  magnitude: number;
  description: string;       // revealed post-hoc
  revealed: boolean;         // shown after event occurs
}
```

**Engine integrace**: `runMultistrain()` — na scheduled event day aplikuje efekt (spike v I, nová varianta, atd.)

### E2. Debriefing Tools (UI)

**`web-ui/src/components/ReplayControls.tsx`** (nový):
- Timeline slider (den 0 → T)
- Play/pause/step-back/step-forward
- Na každém kroku zobrazit Reff, aktivní NPIs, Social Capital
- Highlight "decision moments" — dny kdy student zapnul/vypnul NPI

**`web-ui/src/components/Leaderboard.tsx`** (nový):
- Skórovací metrika: `score = averted_deaths / (GDP_loss / baseline_GDP) * 1000`
- LocalStorage persistence (no backend)
- Tabulka: jméno, skóre, celkem úmrtí, GDP ztráta, doba lockdownu

### E3. Sdílení scénářů (URL persistence)

**`simulation-core/src/sharing.ts`** (nový):
```ts
function encodeScenario(scenario: ScenarioConfig): string {
  // Minify → JSON → deflate → base64url
  return btoa(pako.deflate(JSON.stringify(minify(scenario)), { to: 'string' }));
}

function decodeScenario(encoded: string): ScenarioConfig {
  return JSON.parse(pako.inflate(atob(encoded), { to: 'string' }));
}
```

**App.tsx**: při startu kontrolovat `?s=<base64>` v URL, pokud existuje → nahrát scénář.

---

## Technické požadavky (průřezové)

### T1. RK4 integrátor

**Soubor**: `simulation-core/src/integrators/rk4.ts` (nový)

```ts
type StateVector = number[];
type DerivativeFunction = (state: StateVector, t: number) => StateVector;

function stepRK4(f: DerivativeFunction, state: StateVector, t: number, dt: number): StateVector;
```

**Integrace**:
- Abstrahovat `stepSEIR` na `DerivativeFunction` formát
- Přidat `IntegratorType` enum: `Euler | RK4`
- V `ScenarioConfig`: `integrator?: IntegratorType` (default: Euler pro backward compat)

### T2. WebGPU Monte Carlo (budoucí)

Podmíněné — pouze pokud MC runs > 1000:
- Paralelní run na GPU pomocí compute shaders
- Fallback na CPU Web Workers pokud WebGPU není dostupný
- Relevantní až po validaci, že MC je bottleneck

### T3. Web Worker integrace (prioritní)

Stávající `worker/simulation-worker.ts` dokončit:
- Přesunout `runSimulation()` do Workeru
- Comlink nebo raw postMessage pro typovanou komunikaci
- Progress reporting přes MC callback

---

## Pořadí implementace (doporučené)

```
Sprint 1 (Iterace A):
  A1. Gamma Delay Engine      — 2-3 sessions
  A2. Reporting Rate + UI     — 1-2 sessions
  A3. Testy + validace        — 1 session

Sprint 2 (Iterace C → jednodušší, vysoký impact):
  C1. Shadow Simulation       — 1 session
  C2. Ghost Lines + Report    — 1-2 sessions

Sprint 3 (Iterace B):
  B1. Social Capital          — 1-2 sessions
  B2. Economics               — 1-2 sessions
  B3. UI panely               — 1-2 sessions

Sprint 4 (Iterace D):
  D1-D2. Multi-strain v2      — 2-3 sessions
  D3. Triage rozšíření        — 1 session
  D4. UI vizualizace          — 1 session

Sprint 5 (Iterace E + Tech):
  T1. RK4 integrátor          — 1 session
  E1. Scenario Sandbox        — 2 sessions
  E2. Debriefing + Replay     — 2 sessions
  E3. URL sharing             — 1 session
  T3. Web Worker              — 1 session
```

## Konvence

- Všechny nové config interfaces jsou **optional** v `ScenarioConfig` (backward compat)
- `defaultScenario()` v `scenario-schema.ts` se rozšíří o výchozí hodnoty
- Každá iterace má vlastní sadu testů
- TypeScript strict, žádné `any`
- Nové UI komponenty v `web-ui/src/components/`
