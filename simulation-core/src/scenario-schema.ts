import {
  type ScenarioConfig,
  type ContactSubMatrix,
  type ContactMatrix,
  type Demographics,
  type EpiConfig,
  type HealthCapacityConfig,
  type VaccinationConfig,
  type StochasticConfig,
  type DelayConfig,
  type ReportingConfig,
  SimulationMode,
  ComplianceModel,
  NPIType,
  NUM_STRATA,
  NUM_AGE_GROUPS,
} from './types';

export const CURRENT_SCHEMA_VERSION = '1.0.0';

/** Creates a 3×3 identity-like contact matrix with given diagonal value */
function uniformContactMatrix(value: number): ContactSubMatrix {
  return [
    [value, value, value],
    [value, value, value],
    [value, value, value],
  ];
}

/** Default contact matrix (simplified, symmetric) */
export function defaultContactMatrix(): ContactMatrix {
  return {
    home: [
      [1.5, 0.8, 0.3],
      [0.8, 0.5, 0.3],
      [0.3, 0.3, 0.5],
    ],
    school: [
      [4.0, 0.5, 0.1],
      [0.5, 0.2, 0.0],
      [0.1, 0.0, 0.0],
    ],
    work: [
      [0.0, 0.5, 0.0],
      [0.5, 3.0, 0.3],
      [0.0, 0.3, 0.1],
    ],
    community: [
      [1.0, 1.0, 0.5],
      [1.0, 1.5, 0.8],
      [0.5, 0.8, 0.8],
    ],
  };
}

/** Default demographics */
export function defaultDemographics(): Demographics {
  return {
    totalPopulation: 1_000_000,
    ageFractions: [0.2, 0.65, 0.15],
    riskFractions: [0.05, 0.15, 0.30],
    initialInfectious: 10,
  };
}

/** Default epi config (COVID-like) */
export function defaultEpiConfig(): EpiConfig {
  return {
    R0: 2.5,
    latentPeriod: 3,
    infectiousPeriod: 7,
    stratumParams: [
      // Child standard
      { ifr: 0.00005, hospRate: 0.005, icuRate: 0.1 },
      // Child risk
      { ifr: 0.0005, hospRate: 0.02, icuRate: 0.15 },
      // Adult standard
      { ifr: 0.002, hospRate: 0.03, icuRate: 0.2 },
      // Adult risk
      { ifr: 0.01, hospRate: 0.08, icuRate: 0.3 },
      // Senior standard
      { ifr: 0.02, hospRate: 0.1, icuRate: 0.3 },
      // Senior risk
      { ifr: 0.08, hospRate: 0.25, icuRate: 0.4 },
    ],
  };
}

/** Default health capacity */
export function defaultHealthCapacity(): HealthCapacityConfig {
  return {
    hospitalBeds: 5000,
    icuBeds: 500,
    excessMortalityRate: 0.3,
  };
}

/** Default vaccination config (disabled) */
export function defaultVaccinationConfig(): VaccinationConfig {
  return {
    enabled: false,
    coverageTarget: Array(NUM_STRATA).fill(0.8),
    dosesPerDay: 5000,
    startDay: 60,
    peakVEInfection: 0.85,
    peakVESevere: 0.95,
    waningHalfLifeDays: 180,
  };
}

/** Default stochastic config (deterministic) */
export function defaultStochasticConfig(): StochasticConfig {
  return {
    mode: SimulationMode.Deterministic,
    seed: 42,
    monteCarloRuns: 100,
  };
}

/** Default clinical delay config */
export function defaultDelayConfig(): DelayConfig {
  return {
    onsetToHospMean: 7,
    onsetToHospStages: 3,
    hospLosMean: 10,
    hospLosStages: 4,
    icuLosMean: 14,
    icuLosStages: 3,
  };
}

/** Default reporting/surveillance config */
export function defaultReportingConfig(): ReportingConfig {
  return {
    detectionRate: 0.3,
    reportingDelayMean: 3,
    reportingDelayStages: 2,
  };
}

/** Creates a default scenario */
export function defaultScenario(name = 'Default COVID-like'): ScenarioConfig {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    name,
    days: 365,
    demographics: defaultDemographics(),
    epiConfig: defaultEpiConfig(),
    contactMatrix: defaultContactMatrix(),
    npis: [],
    vaccination: defaultVaccinationConfig(),
    variants: [],
    healthCapacity: defaultHealthCapacity(),
    stochastic: defaultStochasticConfig(),
    delayConfig: defaultDelayConfig(),
    reportingConfig: defaultReportingConfig(),
  };
}
