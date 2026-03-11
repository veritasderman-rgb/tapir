/**
 * Core Types for @tapir/core
 */

export type { ReportingConfig } from './reporting';

// ---- Basic Epidemiological Parameters ----

export enum SimulationMode {
  Deterministic = 'deterministic',
  StochasticSingle = 'stochastic_single',
  MonteCarlo = 'monte_carlo',
}

export enum ComplianceModel {
  ExponentialDecay = 'exponential_decay',
  PiecewiseLinear = 'piecewise_linear',
}

export enum NPIType {
  BetaMultiplier = 'beta_multiplier',
  GammaMultiplier = 'gamma_multiplier',
  ContactSubMatrixModifier = 'contact_sub_matrix_modifier',
}

export enum AppMode {
  Expert = 'expert',
  Instructor = 'instructor',
  CrisisStaff = 'crisis_staff',
  OsackaHorecka = 'osacka_horecka',
  TyfovaMary = 'tyfova_mary',
  Handbook = 'handbook',
}

export enum AgeGroup {
  Child = 0,
  Adult = 1,
  Senior = 2,
}

export enum RiskGroup {
  Standard = 0,
  HighRisk = 1,
}

export const NUM_AGE_GROUPS = 3;
export const NUM_STRATA = 6;

/** List of all stratum indices (0 to NUM_STRATA-1) */
export const ALL_STRATA = [0, 1, 2, 3, 4, 5];

/** Contact matrix subdivided by setting */
export interface ContactMatrix {
  home: ContactSubMatrix;
  school: ContactSubMatrix;
  work: ContactSubMatrix;
  community: ContactSubMatrix;
}

/** 3x3 matrix for age group interactions */
export type ContactSubMatrix = number[][];

/** Demographics of the population */
export interface Demographics {
  totalPopulation: number;
  /** Fraction of population in each age group (sums to 1) */
  ageFractions: number[];
  /** Fraction of each age group that is "high risk" (0-1) */
  riskFractions: number[];
  /** Initial number of infectious individuals */
  initialInfectious: number;
}

/** Per-stratum clinical parameters */
export interface StratumEpiParams {
  /** Infection Fatality Rate (0-1) */
  ifr: number;
  /** Hospitalization rate among infected (0-1) */
  hospRate: number;
  /** ICU admission rate among hospitalized (0-1) */
  icuRate: number;
}

/** Global epidemiological configuration */
export interface EpiConfig {
  /** Basic reproduction number */
  R0: number;
  /** Mean latent period (days) */
  latentPeriod: number;
  /** Mean infectious period (days) */
  infectiousPeriod: number;
  /** Parameters per stratum (length = NUM_STRATA) */
  stratumParams: StratumEpiParams[];
}

/** Health system capacity configuration */
export interface HealthCapacityConfig {
  /** Total available hospital beds */
  hospitalBeds: number;
  /** Total available ICU beds (ventilators) */
  icuBeds: number;
  /** Mortality rate for patients who cannot get a bed (0-1) */
  excessMortalityRate: number;
}

/** Vaccination campaign configuration */
export interface VaccinationConfig {
  enabled: boolean;
  /** Target coverage fraction per stratum (0-1) */
  coverageTarget: number[];
  /** Max doses per day */
  dosesPerDay: number;
  /** Start day of vaccination campaign */
  startDay: number;
  /** Peak vaccine efficacy against infection (0-1) */
  peakVEInfection: number;
  /** Peak vaccine efficacy against severe disease (0-1) */
  peakVESevere: number;
  /** Days for VE to drop by half */
  waningHalfLifeDays: number;
}

/** Variant / mutation shock configuration */
export interface VariantShockConfig {
  id: string;
  name: string;
  /** Relative transmissibility (e.g. 1.5 = 50% more transmissible) */
  transmissibilityMultiplier: number;
  /** Fraction of immune escape (0-1) */
  immuneEscape: number;
  /** Fraction of recovered individuals that become susceptible again (0-1) */
  reinfectionBoost: number;
  /** Day of activation (-1 for random) */
  day: number;
  /** For random day: mean */
  randomMeanDay?: number;
  /** For random day: std dev */
  randomStdDev?: number;
}

/** Stochastic simulation configuration */
export interface StochasticConfig {
  mode: SimulationMode;
  seed: number;
  monteCarloRuns: number;
}

/** Clinical delay configuration (Gamma distributions) */
export interface DelayConfig {
  onsetToHospMean: number;
  onsetToHospStages: number;
  hospLosMean: number;
  hospLosStages: number;
  icuLosMean: number;
  icuLosStages: number;
}

/** Complete configuration for a simulation run */
export interface ScenarioConfig {
  schemaVersion: string;
  name: string;
  days: number;
  demographics: Demographics;
  epiConfig: EpiConfig;
  contactMatrix: ContactMatrix;
  npis: NPIConfig[];
  vaccination: VaccinationConfig;
  variants: VariantShockConfig[];
  healthCapacity: HealthCapacityConfig;
  stochastic: StochasticConfig;
  delayConfig?: DelayConfig;
  reportingConfig?: import('./reporting').ReportingConfig;
}

// ---- NPI and Compliance ----

export interface NPIConfig {
  id: string;
  name: string;
  type: NPIType;
  startDay: number;
  endDay: number;
  value: number;
  targetSubMatrix?: keyof ContactMatrix;
  compliance: ComplianceConfig;
}

export interface ComplianceConfig {
  model: ComplianceModel;
  initial: number;
  decayRate?: number;
  breakpoints?: [number, number][];
}

// ---- Simulation Output ----

/** Population counts in SEIRV compartments for one stratum */
export interface CompartmentState {
  S: number;
  E: number;
  I: number;
  R: number;
  V: number;
  H: number;
  ICU: number;
  D: number;
}

/** Complete population state at a single point in time */
export interface PopulationState {
  /** Counts for each stratum (length = NUM_STRATA) */
  strata: CompartmentState[];
  /** Day index */
  day: number;
}

/** Daily simulation metrics */
export interface DailyMetrics {
  day: number;
  /** Effective reproduction number */
  Reff: number;
  /** Total new infections across all strata */
  newInfections: number;
  /** Total new hospitalizations */
  newHospitalizations: number;
  /** Total new ICU admissions */
  newICU: number;
  /** Total new deaths (including excess) */
  newDeaths: number;
  /** Deaths due to capacity overflow */
  excessDeaths: number;
  /** Whether hospital beds were full */
  hospitalOverflow: boolean;
  /** Whether ICU was full */
  icuOverflow: boolean;
  /** Observed infections after reporting delay */
  observedNewInfections?: number;
  /** Observed hospitalizations after reporting delay */
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
  /** Multiplier for hospital+ICU bed capacity (e.g. 2.0 = double beds) */
  hospitalCapacityMultiplier?: number;
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
export type AdvisorRole = 'epidemiologist' | 'economist' | 'politician' | 'military' | 'opposition';

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
  /** Background story / bio shown on hover */
  background?: string;
  /** Short prediction for 14 days / 1 month (military advisor) */
  prediction14d?: string;
  prediction1m?: string;
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
  /** Cumulative deaths threshold for premier takeover (default 10000) */
  premierTakeoverDeaths?: number;
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
  /** Whether financial support was granted this turn */
  financialSupportGranted: boolean;
  /** Probability of financial support approval [0, 1] */
  financialSupportApprovalChance: number;
}

/** Input for one turn (what the student chose). */
export interface TurnAction {
  /** IDs of measures active this turn (from catalog) */
  activeMeasureIds: string[];
  /** Vaccination priority (null = vaccination disabled) */
  vaccinationPriority: VaccinationPriority | null;
  /** Number of opposition briefings held so far (for advisor tone) */
  oppositionBriefings?: number;
  /** Whether to request government financial support */
  requestFinancialSupport?: boolean;
  /** Who is leading the crisis staff ('hygienik' or 'premier') */
  crisisLeader?: 'hygienik' | 'premier';
  /** Legislative delays for government-approved measures (measureId → turns remaining) */
  legislativeDelays?: Record<string, number>;
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

/** Extended TurnReport with lives saved calculation */
export interface TurnReportV2 extends TurnReport {
  /** Baseline cumulative deaths for this turn */
  baselineCumulativeDeaths: number;
  /** Estimated lives saved vs baseline */
  livesSaved: number;
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
