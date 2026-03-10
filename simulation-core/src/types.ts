// ============================================================
// Nedovařený tapír — Core Types
// ============================================================

/** Age groups for population stratification */
export enum AgeGroup {
  Child = '0-18',
  Adult = '19-64',
  Senior = '65+',
}

/** Risk categories within each age group */
export enum RiskGroup {
  Standard = 'standard',
  Risk = 'risk',
}

/** A single population stratum = age × risk (6 total) */
export interface Stratum {
  age: AgeGroup;
  risk: RiskGroup;
}

/** All 6 strata in canonical order */
export const ALL_STRATA: readonly Stratum[] = [
  { age: AgeGroup.Child, risk: RiskGroup.Standard },
  { age: AgeGroup.Child, risk: RiskGroup.Risk },
  { age: AgeGroup.Adult, risk: RiskGroup.Standard },
  { age: AgeGroup.Adult, risk: RiskGroup.Risk },
  { age: AgeGroup.Senior, risk: RiskGroup.Standard },
  { age: AgeGroup.Senior, risk: RiskGroup.Risk },
] as const;

export const NUM_STRATA = 6;
export const NUM_AGE_GROUPS = 3;

// ---- Compartment state per stratum ----

/** Compartment counts for one stratum at one time step */
export interface CompartmentState {
  S: number;  // Susceptible
  E: number;  // Exposed (latent)
  I: number;  // Infectious
  R: number;  // Recovered
  V: number;  // Vaccinated (reduced susceptibility)
  H: number;  // Hospitalized
  ICU: number; // In ICU
  D: number;  // Dead (cumulative)
}

/** State of the entire population at one time step */
export interface PopulationState {
  /** Compartments per stratum (length = NUM_STRATA) */
  strata: CompartmentState[];
  /** Day index (0-based) */
  day: number;
}

// ---- Contact matrix ----

/**
 * Sub-matrix for one setting (home/school/work/community).
 * Row i, col j = average daily contacts of person in age group i
 * with persons in age group j.
 * Dimensions: NUM_AGE_GROUPS × NUM_AGE_GROUPS (3×3).
 */
export type ContactSubMatrix = number[][];

/** Full contact matrix decomposed by setting */
export interface ContactMatrix {
  home: ContactSubMatrix;
  school: ContactSubMatrix;
  work: ContactSubMatrix;
  community: ContactSubMatrix;
}

// ---- Epidemiological parameters ----

/** Per-stratum clinical parameters */
export interface StratumEpiParams {
  /** Infection fatality rate [0,1] */
  ifr: number;
  /** Hospitalization rate given infection [0,1] */
  hospRate: number;
  /** ICU rate given hospitalization [0,1] */
  icuRate: number;
}

/** Core epidemiological configuration */
export interface EpiConfig {
  /** Basic reproduction number */
  R0: number;
  /** Incubation period in days (1/sigma = mean latent period) */
  latentPeriod: number;
  /** Infectious period in days (1/gamma = mean infectious period) */
  infectiousPeriod: number;
  /** Per-stratum clinical parameters (length = NUM_STRATA) */
  stratumParams: StratumEpiParams[];
}

// ---- Demographics ----

/** Population demographics */
export interface Demographics {
  /** Total population */
  totalPopulation: number;
  /** Fraction of population in each age group [0,1], must sum to 1 */
  ageFractions: [number, number, number]; // [child, adult, senior]
  /** Fraction of each age group that is "risk", [0,1] */
  riskFractions: [number, number, number]; // per age group
  /** Initial number of infectious individuals */
  initialInfectious: number;
}

// ---- NPIs ----

export enum NPIType {
  BetaMultiplier = 'beta_multiplier',
  GammaMultiplier = 'gamma_multiplier',
  ContactSubMatrixModifier = 'contact_submatrix_modifier',
}

export enum ComplianceModel {
  ExponentialDecay = 'exponential_decay',
  PiecewiseLinear = 'piecewise_linear',
}

export interface ComplianceConfig {
  model: ComplianceModel;
  /** Initial compliance [0,1] */
  initial: number;
  /** For exponential: decay rate (per day). For piecewise: breakpoints */
  decayRate?: number;
  /** Piecewise linear breakpoints: [[day, compliance], ...] */
  breakpoints?: [number, number][];
}

export interface NPIConfig {
  id: string;
  name: string;
  type: NPIType;
  startDay: number;
  endDay: number;
  /** Multiplier value for beta/gamma NPIs (e.g. 0.7 = 30% reduction) */
  value: number;
  /** Which sub-matrix to modify (for ContactSubMatrixModifier type) */
  targetSubMatrix?: keyof ContactMatrix;
  compliance: ComplianceConfig;
}

// ---- Vaccination ----

export interface VaccinationConfig {
  /** Enable vaccination module */
  enabled: boolean;
  /** Target coverage per stratum [0,1] (length = NUM_STRATA) */
  coverageTarget: number[];
  /** Doses per day (rollout speed) */
  dosesPerDay: number;
  /** Day vaccination starts */
  startDay: number;
  /** Vaccine efficacy against infection at peak [0,1] */
  peakVEInfection: number;
  /** Vaccine efficacy against severe disease at peak [0,1] */
  peakVESevere: number;
  /** Waning half-life in days (VE decays exponentially) */
  waningHalfLifeDays: number;
}

// ---- Variants ----

export interface VariantShockConfig {
  id: string;
  name: string;
  /** Fixed day of variant introduction (-1 for random) */
  day: number;
  /** If day=-1: mean day for random introduction */
  randomMeanDay?: number;
  /** If day=-1: std deviation for random introduction */
  randomStdDev?: number;
  /** Multiplier on transmissibility (e.g. 1.5 = 50% more transmissible) */
  transmissibilityMultiplier: number;
  /** Fraction of VE lost due to immune escape [0,1] */
  immuneEscape: number;
  /** Fraction of R moved back to S (reinfection) [0,1] */
  reinfectionBoost: number;
}

// ---- Clinical delay ----

export interface DelayConfig {
  /** Onset-to-hospitalization: mean days */
  onsetToHospMean: number;
  /** Onset-to-hospitalization: Erlang shape k (stages) */
  onsetToHospStages: number;
  /** Hospitalization length-of-stay: mean days */
  hospLosMean: number;
  /** Hospitalization LoS: Erlang shape k */
  hospLosStages: number;
  /** ICU length-of-stay: mean days */
  icuLosMean: number;
  /** ICU LoS: Erlang shape k */
  icuLosStages: number;
}

// ---- Reporting / Surveillance ----

export interface ReportingConfig {
  /** Fraction of true infections detected by surveillance [0,1] */
  detectionRate: number;
  /** Reporting delay: mean days from onset to case report */
  reportingDelayMean: number;
  /** Reporting delay: Erlang shape k */
  reportingDelayStages: number;
}

// ---- Health capacity ----

export interface HealthCapacityConfig {
  /** Standard hospital beds available */
  hospitalBeds: number;
  /** ICU beds available */
  icuBeds: number;
  /** Excess mortality rate when capacity is exceeded [0,1] */
  excessMortalityRate: number;
}

// ---- Simulation configuration ----

export enum SimulationMode {
  Deterministic = 'deterministic',
  StochasticSingle = 'stochastic_single',
  StochasticMonteCarlo = 'stochastic_monte_carlo',
}

export enum AppMode {
  Student = 'student',
  Instructor = 'instructor',
}

export interface StochasticConfig {
  mode: SimulationMode;
  /** RNG seed (for reproducibility) */
  seed: number;
  /** Number of Monte Carlo runs (only for MC mode) */
  monteCarloRuns: number;
}

/** Complete scenario configuration */
export interface ScenarioConfig {
  /** Schema version for forwards compatibility */
  schemaVersion: string;
  /** Scenario name */
  name: string;
  /** Number of days to simulate */
  days: number;
  demographics: Demographics;
  epiConfig: EpiConfig;
  contactMatrix: ContactMatrix;
  npis: NPIConfig[];
  vaccination: VaccinationConfig;
  variants: VariantShockConfig[];
  healthCapacity: HealthCapacityConfig;
  stochastic: StochasticConfig;
  /** Clinical delay configuration (optional, backward-compatible) */
  delayConfig?: DelayConfig;
  /** Reporting/surveillance configuration (optional, backward-compatible) */
  reportingConfig?: ReportingConfig;
}

// ---- Simulation results ----

/** Daily aggregate metrics */
export interface DailyMetrics {
  day: number;
  /** Effective reproduction number */
  Reff: number;
  /** New infections this day */
  newInfections: number;
  /** New hospitalizations this day */
  newHospitalizations: number;
  /** New ICU admissions this day */
  newICU: number;
  /** New deaths this day (including excess) */
  newDeaths: number;
  /** Excess deaths due to capacity overflow */
  excessDeaths: number;
  /** Is hospital capacity exceeded? */
  hospitalOverflow: boolean;
  /** Is ICU capacity exceeded? */
  icuOverflow: boolean;
  /** Observed (reported) new infections after detection rate + delay */
  observedNewInfections?: number;
  /** Observed (reported) new hospitalizations after reporting delay */
  observedNewHospitalizations?: number;
}

/** Result of a single simulation run */
export interface SimulationRun {
  /** Population state at each day */
  states: PopulationState[];
  /** Daily metrics */
  metrics: DailyMetrics[];
  /** RNG seed used (if stochastic) */
  seed: number;
}

/** Monte Carlo quantile summary per day */
export interface QuantileSummary {
  day: number;
  median: number;
  p5: number;
  p95: number;
}

/** Complete simulation result */
export interface SimulationResult {
  /** The scenario that produced this result */
  scenario: ScenarioConfig;
  /** Primary run (deterministic or single stochastic) */
  primaryRun: SimulationRun;
  /** Monte Carlo runs (only for MC mode) */
  monteCarloRuns?: SimulationRun[];
  /** Quantile summaries for key metrics (MC only) */
  quantiles?: {
    infections: QuantileSummary[];
    hospitalizations: QuantileSummary[];
    deaths: QuantileSummary[];
  };
  /** Implied R0 from NGM calibration */
  impliedR0: number;
  /** Calibrated beta value */
  calibratedBeta: number;
  /** Timestamp of computation */
  timestamp: string;
}

// ---- Validation ----

export interface ValidationError {
  /** Dot-path to the field (e.g. "demographics.ageFractions") */
  path: string;
  /** Human-readable error message */
  message: string;
}

// ---- Game / Turn-based types ----

/** Event types that instructor can schedule */
export type HiddenEventType =
  | 'variant_shock'
  | 'vaccine_unlock'
  | 'supply_disruption'
  | 'public_unrest'
  | 'measure_unlock'
  | 'who_intel';

/** A hidden event placed on the timeline by the instructor. */
export interface HiddenEvent {
  id: string;
  type: HiddenEventType;
  /** Turn number when event activates (1-indexed) */
  turn: number;
  /** Human-readable label */
  label: string;
  /** Type-specific payload */
  payload: Record<string, number | string>;
}

/** Social capital configuration. */
export interface SocialCapitalConfig {
  /** Starting social capital [0, 100] */
  initial: number;
  /** Recovery rate per day when no NPIs active (points/day) */
  recoveryRate: number;
  /** Threshold below which compliance collapses [0, 100] */
  collapseThreshold: number;
}

// ---- Game Measure (NPI) catalog ----

/** Condition under which a measure becomes available. */
export type MeasureUnlockCondition =
  | { type: 'always' }
  | { type: 'turn_reached'; turn: number }
  | { type: 'social_capital_below'; threshold: number }
  | { type: 'social_capital_above'; threshold: number }
  | { type: 'event_triggered'; eventId: string }
  | { type: 'deaths_above'; threshold: number }
  | { type: 'hospital_occupancy_above'; fraction: number };

/** A game measure = a concrete action the player can toggle. */
export interface GameMeasure {
  id: string;
  /** Display name */
  name: string;
  /** Category for UI grouping */
  category: 'social_distancing' | 'masks' | 'testing' | 'vaccination' | 'travel' | 'military' | 'international' | 'economic';
  /** Short description */
  description: string;
  /** Epidemiological effect: which NPI type to generate */
  npiEffect: {
    type: NPIType;
    value: number;
    targetSubMatrix?: keyof ContactMatrix;
  };
  /** Political cost per turn (social capital drain, scaled to 14 days) */
  politicalCostPerTurn: number;
  /** Economic cost per turn (% GDP hit per 14-day turn) */
  economicCostPerTurn: number;
  /** Ramp-up delay in days (effect not immediate) */
  rampUpDays: number;
  /** Compliance decay rate (how fast public gets tired of it, per day) */
  complianceDecayRate: number;
  /** When does this measure become available? */
  unlockCondition: MeasureUnlockCondition;
  /** Special effect: modifies detection rate by this additive amount */
  detectionRateBonus?: number;
  /** Special effect: adds daily vaccination capacity */
  vaccinationCapacityBonus?: number;
  /** Special: reduces Reff estimation jitter (better intel) */
  intelBonus?: number;
  /** Is this a one-shot action (activate once, persists)? */
  oneShot?: boolean;
  /** Mutually exclusive group — only one measure from group can be active */
  exclusiveGroup?: string;
  /** Who can activate this measure: 'hygienik' (chief epidemiologist), 'premier', or 'both' (default). */
  authority?: 'hygienik' | 'premier' | 'both';
}

/** Vaccination priority setting (which age/risk groups first). */
export interface VaccinationPriority {
  /** Ordered list of stratum indices (0-5), first = highest priority */
  stratumOrder: number[];
  /** Daily capacity (doses/day) — can be upgraded */
  dailyCapacity: number;
}

// ---- Economic model ----

/** Economic state tracked across turns. */
export interface EconomicState {
  /** Cumulative GDP impact (negative = loss, percentage of annual GDP) */
  gdpImpact: number;
  /** Current unemployment rate increase (percentage points above baseline) */
  unemploymentDelta: number;
  /** Cumulative fiscal cost in arbitrary units (billions) */
  fiscalCost: number;
  /** Business confidence [0, 100] — affects recovery speed */
  businessConfidence: number;
}

// ---- Advisory system ----

/** Advisor types in the crisis staff. */
export type AdvisorRole = 'epidemiologist' | 'economist' | 'politician' | 'military';

/** A single advisor message for one turn. */
export interface AdvisorMessage {
  role: AdvisorRole;
  name: string;
  /** Main advisory text */
  message: string;
  /** Suggested action (informational only) */
  suggestion?: string;
  /** Urgency level */
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

// ---- Complete game scenario v2 ----

/** Complete game scenario (what instructor exports). */
export interface GameScenario {
  /** Base scenario config (epi, demographics, etc.) */
  baseScenario: ScenarioConfig;
  /** Game duration in turns (default 24 = 12 months biweekly) */
  totalTurns: number;
  /** Days per turn (default 14 = biweekly) */
  daysPerTurn: number;
  /** Hidden events timeline */
  hiddenEvents: HiddenEvent[];
  /** Social capital config */
  socialCapital: SocialCapitalConfig;
  /** Available measures catalog (IDs referencing MEASURE_CATALOG) */
  availableMeasureIds: string[];
  /** Whether vaccination is initially locked */
  vaccinationLocked: boolean;
}

/** Serializable snapshot of all mutable simulation state between turns. */
export interface SimCheckpoint {
  /** Population compartments at end of last turn */
  populationState: PopulationState;
  /** Delay buffer snapshots per stratum (null if delays disabled) */
  delayBufferSnapshots: import('./delay-engine').StratumDelayBuffersSnapshot[] | null;
  /** Reporting pipeline snapshot (null if reporting disabled) */
  reportingSnapshot: import('./reporting').ReportingPipelineSnapshot | null;
  /** Resolved variant activation days (frozen at game start) */
  variantActivationDays: number[];
  /** Calibrated beta (frozen at game start) */
  calibratedBeta: number;
  /** RNG internal state (seed value) */
  rngState: number;
  /** Current social capital [0, 100] */
  socialCapital: number;
  /** Current economic state */
  economicState: EconomicState;
  /** Current effective detection rate [0, 1] (can be improved by testing measures) */
  effectiveDetectionRate: number;
  /** Set of measure IDs that have been unlocked (by events, conditions, etc.) */
  unlockedMeasureIds: string[];
  /** Daily vaccination capacity (can be boosted by measures) */
  vaccinationCapacity: number;
  /** Intel quality: Reff jitter multiplier (lower = more accurate; 1.0 = default ±15%) */
  intelQuality: number;
}

/** Input for one turn (what the student chose). */
export interface TurnAction {
  /** IDs of measures active this turn (from catalog) */
  activeMeasureIds: string[];
  /** Vaccination priority (null = vaccination disabled) */
  vaccinationPriority: VaccinationPriority | null;
}

/** Turn report shown to the student at end of turn. */
export interface TurnReport {
  turnNumber: number;
  /** Simulated date range label */
  dateLabel: string;
  /** Observed (reported) total new infections this turn */
  observedInfections: number;
  /** True total new infections (hidden from student, shown in debrief) */
  trueInfections: number;
  /** Total new hospitalizations */
  newHospitalizations: number;
  /** Total new ICU admissions */
  newICU: number;
  /** Total deaths */
  newDeaths: number;
  /** Cumulative deaths so far */
  cumulativeDeaths: number;
  /** Estimated Reff (noisy — jittered for fog-of-war) */
  estimatedReff: number;
  /** True Reff at end of turn */
  trueReff: number;
  /** Current social capital */
  socialCapital: number;
  /** Hospital occupancy at end of turn */
  hospitalOccupancy: number;
  /** Hospital capacity */
  hospitalCapacity: number;
  /** ICU occupancy at end of turn */
  icuOccupancy: number;
  /** ICU capacity */
  icuCapacity: number;
  /** Whether hospital or ICU overflowed */
  capacityOverflow: boolean;
  /** Economic state snapshot */
  economicState: EconomicState;
  /** Events that activated this turn */
  activatedEvents: HiddenEvent[];
  /** Advisor messages for this turn */
  advisorMessages: AdvisorMessage[];
  /** Newspaper headlines (flavor text) */
  headlines: string[];
  /** Newly unlocked measures this turn */
  newlyUnlockedMeasures: string[];
}

/** Output of one turn. */
export interface TurnResult {
  /** New checkpoint (pass to next turn) */
  checkpoint: SimCheckpoint;
  /** Daily metrics for this block only */
  metrics: DailyMetrics[];
  /** Daily population states for this block only */
  states: PopulationState[];
  /** Turn summary report */
  turnReport: TurnReport;
}
