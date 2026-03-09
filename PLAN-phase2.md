# Phase 2: Krizový štáb — Implementation Plan

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    App.tsx (router)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ /instructor   │  │ /student/:id │  │ /sandbox      │ │
│  │ ScenarioBldr  │  │ TurnDashboard│  │ (existing UI) │ │
│  └──────────────┘  └──────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────┘
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│ useAppStore.ts  │  │ gameStore.ts    │  ← NEW Zustand store
│ (existing,      │  │ (turn state,    │
│  sandbox mode)  │  │  social capital, │
│                 │  │  fog of war)    │
└─────────────────┘  └─────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ step-runner.ts   │  ← NEW: block runner
                  │ (simulation-core)│
                  └──────────────────┘
                           │
                  uses existing:
                  stepSEIRV, applyNPIs,
                  variant-engine, etc.
```

---

## 1. Step-by-step Runner (`simulation-core/src/step-runner.ts`)

### Key Principle
**Do NOT modify `runMultistrain` or `stepSEIRV`** — wrap them.

The runner accepts a serializable checkpoint and runs N days (1 turn = 30 days),
then returns a new checkpoint + the block's metrics.

### Types

```typescript
/** Serializable snapshot of all mutable simulation state */
export interface SimCheckpoint {
  /** Population compartments at end of last turn */
  populationState: PopulationState;
  /** Delay buffer state per stratum (ring buffers serialized) */
  delayBufferStates: DelayBufferSnapshot[] | null;
  /** Reporting pipeline state (ring buffers serialized) */
  reportingBufferStates: { infection: number[]; hosp: number[] } | null;
  /** Resolved variant activation days (frozen at game start) */
  variantActivationDays: number[];
  /** Calibrated beta (frozen at game start) */
  calibratedBeta: number;
  /** Current RNG seed state (integer, feeds mulberry32) */
  rngSeed: number;
  /** Number of RNG calls consumed so far (for deterministic replay) */
  rngCallCount: number;
  /** Current social capital [0, 100] */
  socialCapital: number;
}

/** Snapshot of a single DelayBuffer's ring buffer */
export interface DelayBufferSnapshot {
  onsetToHosp: { buffer: number[]; head: number };
  hospLoS:     { buffer: number[]; head: number };
  icuLoS:      { buffer: number[]; head: number };
}

/** Input for one turn (what the student chose) */
export interface TurnAction {
  /** NPIs active during this turn (student-configured) */
  npis: NPIConfig[];
  /** Whether vaccination is enabled this turn */
  vaccinationEnabled: boolean;
}

/** Output of one turn */
export interface TurnResult {
  /** New checkpoint (pass to next turn) */
  checkpoint: SimCheckpoint;
  /** Daily metrics for this block only */
  metrics: DailyMetrics[];
  /** Daily population states for this block only */
  states: PopulationState[];
  /** Monthly summary for the student report */
  monthlyReport: MonthlyReport;
}

/** What the student sees at end of turn */
export interface MonthlyReport {
  month: number;
  /** Observed (reported) total new infections this month */
  observedInfections: number;
  /** True total new infections (hidden from student, for debrief) */
  trueInfections: number;
  /** Total new hospitalizations */
  newHospitalizations: number;
  /** Total new ICU admissions */
  newICU: number;
  /** Total deaths */
  newDeaths: number;
  /** Estimated Reff (noisy — ±15% uniform jitter for fog-of-war) */
  estimatedReff: number;
  /** True Reff (hidden, for debrief) */
  trueReff: number;
  /** Current social capital */
  socialCapital: number;
  /** Hospital occupancy at end of month */
  hospitalOccupancy: number;
  /** ICU occupancy at end of month */
  icuOccupancy: number;
  /** Any hidden events that activated this month (for instructor debrief) */
  activatedEvents: string[];
}
```

### Core Function

```typescript
export function initGame(scenario: ScenarioConfig, seed: number): SimCheckpoint
export function stepTurn(
  checkpoint: SimCheckpoint,
  scenario: ScenarioConfig,        // base scenario (immutable)
  turnAction: TurnAction,          // student's choices
  daysPerTurn: number,             // typically 30
): TurnResult
```

### Implementation Strategy

`stepTurn` internally:
1. Rebuilds `DelayBuffer` instances from `DelayBufferSnapshot` (add `serialize()`/`static deserialize()` methods to `DelayBuffer`)
2. Rebuilds `ReportingPipeline` from snapshot (add serialize/deserialize)
3. Rebuilds RNG from `rngSeed` + advancing by `rngCallCount`
4. Converts student's `TurnAction.npis` to absolute-day NPIs by offsetting `startDay`/`endDay` relative to current day
5. Loops `daysPerTurn` times calling `stepSEIRV` (reuses the exact same day-loop from `runMultistrain`)
6. Applies social capital drain/recovery each day
7. Applies hidden events (variant shocks) when their activation day falls in this block
8. Serializes everything back to a new `SimCheckpoint`
9. Aggregates monthly report

### DelayBuffer Serialization

Add to `DelayBuffer`:
```typescript
serialize(): { pmf: number[]; buffer: number[]; head: number }
static fromSnapshot(snap: { pmf: number[]; buffer: number[]; head: number }): DelayBuffer
```

### RNG Continuity

`mulberry32` is already deterministic given a seed. The state is a single 32-bit integer.
We need to expose the current internal seed value after N calls.

**Solution**: Modify `mulberry32` to return an object with `.next()` and `.getState()`:
```typescript
export function mulberry32(seed: number): { next: () => number; getState: () => number }
```
This is a **non-breaking** change if we keep the old return signature as an overload,
or we make a new `mulberry32Stateful` function to avoid breaking existing code.

**Chosen approach**: New function `createRNG(seed)` → `{ next(), getState(), callCount }`.
Existing `mulberry32` stays untouched.

---

## 2. Social Capital Engine (`simulation-core/src/social-capital.ts`)

```typescript
export interface SocialCapitalConfig {
  /** Starting social capital [0, 100] */
  initial: number;
  /** Recovery rate per day when no NPIs active (points/day) */
  recoveryRate: number;
  /** Threshold below which compliance collapses */
  collapseThreshold: number;
}

/** Cost per NPI type (points per 30 days of active enforcement) */
export const NPI_SOCIAL_COSTS: Record<string, number> = {
  'school_closure':     15,
  'work_from_home':     10,
  'community_lockdown': 20,
  'mask_mandate':        3,
  'travel_ban':         12,
  'beta_multiplier':     8,  // generic fallback
};

export function computeSocialCapitalDelta(
  activeNPIs: NPIConfig[],
  currentCapital: number,
): number    // returns daily delta (negative = drain, positive = recovery)

export function socialCapitalComplianceMultiplier(
  capital: number,
  collapseThreshold: number,
): number    // returns [0, 1] multiplier applied to all NPI compliance
```

**Collapse formula** (below threshold):
```
multiplier = max(0, (capital / collapseThreshold)^2)
```
Quadratic drop-off: at 20% threshold, capital=10 → multiplier=0.25, capital=5 → multiplier=0.0625.

---

## 3. Hidden Events / Game Scenario (`simulation-core/src/types.ts`)

```typescript
/** Event types that instructor can schedule */
export type HiddenEventType =
  | 'variant_shock'       // transmissibility + immune escape
  | 'vaccine_unlock'      // student gains access to vaccination UI
  | 'supply_disruption'   // hospital beds temporarily reduced
  | 'public_unrest';      // social capital instant penalty

export interface HiddenEvent {
  id: string;
  type: HiddenEventType;
  /** Month when event activates (1-indexed) */
  month: number;
  /** Human-readable label */
  label: string;
  /** Type-specific payload */
  payload: Record<string, number>;
  // e.g. variant_shock: { transmissibilityMultiplier: 1.3, immuneEscape: 0.2 }
  // e.g. vaccine_unlock: {}
  // e.g. supply_disruption: { bedReductionFraction: 0.3, durationMonths: 2 }
}

/** Complete game scenario (what instructor exports) */
export interface GameScenario {
  /** Base scenario config (epi, demographics, etc.) */
  baseScenario: ScenarioConfig;
  /** Game duration in months */
  durationMonths: number;
  /** Days per turn (default 30) */
  daysPerTurn: number;
  /** Hidden events timeline */
  hiddenEvents: HiddenEvent[];
  /** Social capital config */
  socialCapital: SocialCapitalConfig;
  /** Which parameters student can see/modify */
  studentPermissions: {
    canSeeR0: boolean;
    canModifyVaccination: boolean;
    availableNPITypes: string[];
  };
  /** Locked epi parameters */
  lockedParams: string[];
}
```

### Scenario Encoding

```typescript
export function encodeGameScenario(gs: GameScenario): string   // → Base64
export function decodeGameScenario(encoded: string): GameScenario
```

Simple: `btoa(JSON.stringify(gs))` / `JSON.parse(atob(encoded))` with zlib compression via `pako` (already small enough without it for MVP; add if needed).

---

## 4. Game Store (`web-ui/src/store/gameStore.ts`)

```typescript
export interface GameState {
  // Game setup
  gameScenario: GameScenario | null;
  gamePhase: 'setup' | 'playing' | 'finished' | 'debrief';

  // Turn state
  currentMonth: number;                    // 1-indexed
  checkpoint: SimCheckpoint | null;        // latest simulation state
  turnHistory: TurnHistoryEntry[];         // all past turns

  // Student's current action draft
  pendingNPIs: NPIConfig[];               // NPIs student is configuring
  vaccinationEnabled: boolean;

  // Social capital
  socialCapital: number;

  // Unlocks (from hidden events)
  vaccinationUnlocked: boolean;

  // Actions
  loadScenario: (encoded: string) => void;
  submitTurn: () => void;                  // runs stepTurn, advances month
  undoLastTurn: () => void;                // pop history, restore checkpoint
  finishGame: () => void;
  resetGame: () => void;

  // NPI management
  addNPI: (npi: NPIConfig) => void;
  removeNPI: (id: string) => void;
  updateNPI: (id: string, partial: Partial<NPIConfig>) => void;
  setVaccinationEnabled: (v: boolean) => void;
}

export interface TurnHistoryEntry {
  month: number;
  action: TurnAction;
  report: MonthlyReport;
  metrics: DailyMetrics[];           // full daily metrics for charts
  states: PopulationState[];
  checkpointBefore: SimCheckpoint;   // for undo
}
```

### Turn Flow

```
Student clicks "Simulate Next Month"
  → gameStore.submitTurn()
    → stepTurn(checkpoint, scenario, pendingAction, 30)
    → push to turnHistory
    → update checkpoint, socialCapital, currentMonth
    → check for hidden events that activate this month
    → show MonthlyDebriefModal with report
```

---

## 5. Worker Protocol Extension

Add new message types to `WorkerRequest`/`WorkerResponse`:

```typescript
// New request
| { type: 'step'; checkpoint: SimCheckpoint; scenario: ScenarioConfig; action: TurnAction; daysPerTurn: number; id: string }

// New response
| { type: 'step-result'; result: TurnResult; id: string }
```

The worker handles `'step'` by calling `stepTurn()` and returning `TurnResult`.

---

## 6. UI Components

### 6a. Instructor Mode (`web-ui/src/components/instructor/`)

**`ScenarioBuilder.tsx`**
- Wraps existing ParameterPanel for base scenario config
- Adds game-specific settings: duration (months), days per turn
- Student permissions checkboxes

**`EventTimeline.tsx`**
- Visual timeline (horizontal bar, months as columns)
- Drag-and-drop or click-to-add events at specific months
- Event types: Variant Shock, Vaccine Unlock, Supply Disruption, Public Unrest
- Each event has a config popover

**`ScenarioExport.tsx`**
- "Export" button → Base64 string
- "Copy URL" button → `?scenario=<base64>`
- Preview of what student will see

### 6b. Student Mode (`web-ui/src/components/student/`)

**`TurnDashboard.tsx`**
- Main student view
- Charts showing data ONLY up to current month (fog of war)
- Monthly report cards (observed infections, hosp, Reff estimate)
- Social capital gauge (visual meter)
- "Simulate Next Month" button

**`ActionPanel.tsx`**
- Available NPIs as cards with social cost badges
- Toggle on/off, set intensity
- Visual indicator of total social cost per month
- Vaccination toggle (only if unlocked)
- Warning when social capital is low

**`MonthlyDebriefModal.tsx`**
- Modal shown after each turn
- Shows monthly report
- Highlights: new events activated, capacity warnings, social capital change
- "Continue" button to dismiss

**`GameOverScreen.tsx`**
- Final summary after all months played
- Side-by-side: true state vs. what student saw (observed)
- Score/ranking based on total deaths, peak hospital overflow, social capital usage

### 6c. Routing (state-based in App.tsx)

No react-router needed. Use `appMode` + `gamePhase` state:

```
appMode === 'instructor' → show ScenarioBuilder + EventTimeline
appMode === 'student' && gamePhase === 'setup' → show scenario loader
appMode === 'student' && gamePhase === 'playing' → show TurnDashboard
appMode === 'student' && gamePhase === 'finished' → show GameOverScreen
appMode === 'student' && gamePhase === 'debrief' → show full debrief
No game loaded → show existing sandbox mode
```

---

## 7. Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `simulation-core/src/step-runner.ts` | `initGame()`, `stepTurn()` |
| `simulation-core/src/social-capital.ts` | Social capital mechanics |
| `simulation-core/src/game-scenario.ts` | `GameScenario` encode/decode |
| `web-ui/src/store/gameStore.ts` | Zustand game store |
| `web-ui/src/components/instructor/ScenarioBuilder.tsx` | |
| `web-ui/src/components/instructor/EventTimeline.tsx` | |
| `web-ui/src/components/student/TurnDashboard.tsx` | |
| `web-ui/src/components/student/ActionPanel.tsx` | |
| `web-ui/src/components/student/MonthlyDebriefModal.tsx` | |
| `web-ui/src/components/student/GameOverScreen.tsx` | |
| `simulation-core/tests/step-runner.test.ts` | |
| `simulation-core/tests/social-capital.test.ts` | |

### Modified Files
| File | Change |
|------|--------|
| `simulation-core/src/types.ts` | Add `GameScenario`, `HiddenEvent`, `MonthlyReport`, `SocialCapitalConfig`, `SimCheckpoint` |
| `simulation-core/src/delay-engine.ts` | Add `serialize()`/`fromSnapshot()` to `DelayBuffer` |
| `simulation-core/src/reporting.ts` | Add `serialize()`/`fromSnapshot()` to `ReportingPipeline` |
| `simulation-core/src/stochastic.ts` | Add `createRNG()` (stateful wrapper) |
| `simulation-core/src/index.ts` | Export new modules |
| `worker/simulation-worker.ts` | Handle `'step'` message type |
| `web-ui/src/App.tsx` | State-based routing for instructor/student/sandbox |
| `web-ui/src/components/Header.tsx` | Game mode indicator |
| `web-ui/src/store/useAppStore.ts` | Add `gamePhase` |

---

## 8. Test Plan

### `step-runner.test.ts`
1. **Continuity**: Run 30 days via `stepTurn`, then another 30 days. Compare total metrics to running 60 days at once via `runMultistrain`. Results must match exactly (deterministic mode).
2. **Checkpoint serialization round-trip**: `serialize → deserialize → run` produces identical output.
3. **RNG continuity**: Stochastic mode with same seed produces identical results whether run as 1×60 days or 2×30 days.
4. **Hidden event activation**: Variant shock at month 3 fires on correct day.
5. **NPI application**: Student NPIs correctly offset to absolute days.

### `social-capital.test.ts`
1. **Drain**: 2 NPIs active → capital decreases by expected amount per day.
2. **Recovery**: No NPIs → capital recovers at configured rate, caps at 100.
3. **Collapse**: Capital below threshold → compliance multiplier drops quadratically.
4. **Compliance override**: At capital=0, all NPI compliance → 0 regardless of config.

---

## 9. Implementation Order

1. **A: Engine foundation** (no UI)
   - `DelayBuffer.serialize/fromSnapshot`
   - `ReportingPipeline.serialize/fromSnapshot`
   - `createRNG` in stochastic.ts
   - Types in types.ts
   - `social-capital.ts`
   - `step-runner.ts` with `initGame` + `stepTurn`
   - `game-scenario.ts` encode/decode
   - Tests for step-runner + social-capital

2. **B: Worker + Store**
   - Worker `'step'` handler
   - `gameStore.ts`
   - State routing in App.tsx

3. **C: Instructor UI**
   - ScenarioBuilder
   - EventTimeline
   - Export flow

4. **D: Student UI**
   - TurnDashboard (fog-of-war charts)
   - ActionPanel (NPIs + social cost)
   - MonthlyDebriefModal
   - GameOverScreen
