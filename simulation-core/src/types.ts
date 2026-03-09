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
  | 'public_unrest';

/** A hidden event placed on the timeline by the instructor. */
export interface HiddenEvent {
  id: string;
  type: HiddenEventType;
  /** Month when event activates (1-indexed) */
  month: number;
  /** Human-readable label */
  label: string;
  /** Type-specific payload */
  payload: Record<string, number>;
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

/** Complete game scenario (what instructor exports). */
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
  /** Which NPI types the student can use */
  availableNPITypes: string[];
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
}

/** Input for one turn (what the student chose). */
export interface TurnAction {
  /** NPIs active during this turn */
  npis: NPIConfig[];
  /** Whether vaccination is enabled this turn */
  vaccinationEnabled: boolean;
}

/** Monthly report shown to the student at end of turn. */
export interface MonthlyReport {
  month: number;
  /** Observed (reported) total new infections this month */
  observedInfections: number;
  /** True total new infections (hidden from student, shown in debrief) */
  trueInfections: number;
  /** Total new hospitalizations */
  newHospitalizations: number;
  /** Total new ICU admissions */
  newICU: number;
  /** Total deaths */
  newDeaths: number;
  /** Estimated Reff (noisy — jittered for fog-of-war) */
  estimatedReff: number;
  /** True Reff at end of month */
  trueReff: number;
  /** Current social capital */
  socialCapital: number;
  /** Hospital occupancy at end of month */
  hospitalOccupancy: number;
  /** ICU occupancy at end of month */
  icuOccupancy: number;
  /** Events that activated this month */
  activatedEvents: string[];
}

/** Output of one turn. */
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
