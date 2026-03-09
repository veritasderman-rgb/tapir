import {
  type ScenarioConfig,
  type PopulationState,
  type CompartmentState,
  type DailyMetrics,
  type SimulationRun,
  type ContactSubMatrix,
  NUM_STRATA,
  NUM_AGE_GROUPS,
} from '../types';
import { sumContactMatrix } from '../contact-matrix';
import { calibrateBeta } from '../calibration/beta-calibration';
import { computeReff, getAgeGroupPopulations } from '../calibration/ngm';
import { computeHealthOutcomes } from '../health-capacity';
import { applyNPIs } from '../npi-engine';

/** Map stratum index to age group index (0,1,2 for child/adult/senior) */
function stratumToAgeGroup(stratumIndex: number): number {
  return Math.floor(stratumIndex / 2);
}

/** Initialize population state from scenario config */
export function initializePopulation(scenario: ScenarioConfig): PopulationState {
  const { demographics, epiConfig } = scenario;
  const N = demographics.totalPopulation;
  const strata: CompartmentState[] = [];

  // Distribute population across strata
  for (let i = 0; i < NUM_STRATA; i++) {
    const ageIdx = stratumToAgeGroup(i);
    const isRisk = i % 2 === 1;
    const agePop = N * demographics.ageFractions[ageIdx];
    const riskFrac = demographics.riskFractions[ageIdx];
    const stratumPop = agePop * (isRisk ? riskFrac : (1 - riskFrac));

    strata.push({
      S: stratumPop,
      E: 0,
      I: 0,
      R: 0,
      V: 0,
      H: 0,
      ICU: 0,
      D: 0,
    });
  }

  // Seed initial infectious — distribute proportionally to stratum size
  const totalPop = strata.reduce((sum, s) => sum + s.S, 0);
  let remaining = demographics.initialInfectious;
  for (let i = 0; i < NUM_STRATA; i++) {
    const share = Math.round(demographics.initialInfectious * (strata[i].S / totalPop));
    const seed = Math.min(share, remaining, strata[i].S);
    strata[i].I = seed;
    strata[i].S -= seed;
    remaining -= seed;
  }
  // Distribute any rounding remainder to first stratum
  if (remaining > 0 && strata[0].S >= remaining) {
    strata[0].I += remaining;
    strata[0].S -= remaining;
  }

  return { strata, day: 0 };
}

/**
 * Get aggregate susceptible per age group (summing standard + risk strata).
 */
function getAgeGroupSusceptible(strata: CompartmentState[]): number[] {
  const result = new Array(NUM_AGE_GROUPS).fill(0);
  for (let i = 0; i < NUM_STRATA; i++) {
    result[stratumToAgeGroup(i)] += strata[i].S;
  }
  return result;
}

/**
 * Get aggregate infectious per age group.
 */
function getAgeGroupInfectious(strata: CompartmentState[]): number[] {
  const result = new Array(NUM_AGE_GROUPS).fill(0);
  for (let i = 0; i < NUM_STRATA; i++) {
    result[stratumToAgeGroup(i)] += strata[i].I;
  }
  return result;
}

/**
 * Get total population per age group.
 */
function getAgeGroupTotals(strata: CompartmentState[]): number[] {
  const result = new Array(NUM_AGE_GROUPS).fill(0);
  for (let i = 0; i < NUM_STRATA; i++) {
    const total = strata[i].S + strata[i].E + strata[i].I + strata[i].R + strata[i].V;
    result[stratumToAgeGroup(i)] += total;
  }
  return result;
}

export interface TransitionFunction {
  /**
   * Compute how many individuals transition given a rate and pool size.
   * Deterministic: returns rate * pool.
   * Stochastic: returns binomial(pool, rate).
   */
  (rate: number, pool: number): number;
}

/** Default deterministic transition */
export const deterministicTransition: TransitionFunction = (rate, pool) => {
  return Math.min(rate * pool, pool);
};

/**
 * Run one day step of the SEIR model.
 *
 * @param state - current population state
 * @param scenario - scenario config
 * @param beta - calibrated transmission rate
 * @param contactMatrix - current effective contact matrix (after NPIs)
 * @param transition - transition function (deterministic or stochastic)
 * @returns new population state and daily metrics
 */
export function stepSEIR(
  state: PopulationState,
  scenario: ScenarioConfig,
  beta: number,
  contactMatrix: ContactSubMatrix,
  transition: TransitionFunction = deterministicTransition,
): { newState: PopulationState; metrics: DailyMetrics } {
  const { epiConfig, healthCapacity } = scenario;
  const sigma = 1 / epiConfig.latentPeriod;   // E→I rate
  const gamma = 1 / epiConfig.infectiousPeriod; // I→R rate

  const infectious = getAgeGroupInfectious(state.strata);
  const totals = getAgeGroupTotals(state.strata);

  // Compute force of infection per age group: λ_i = β * Σ_j C_ij * I_j / N_j
  const lambda = new Array(NUM_AGE_GROUPS).fill(0);
  for (let i = 0; i < NUM_AGE_GROUPS; i++) {
    for (let j = 0; j < NUM_AGE_GROUPS; j++) {
      if (totals[j] > 0) {
        lambda[i] += beta * contactMatrix[i][j] * infectious[j] / totals[j];
      }
    }
  }

  const newStrata: CompartmentState[] = [];
  const newInfections = new Array(NUM_STRATA).fill(0);
  let totalNewInfections = 0;

  for (let i = 0; i < NUM_STRATA; i++) {
    const s = state.strata[i];
    const ageIdx = stratumToAgeGroup(i);
    const foi = lambda[ageIdx];

    // Transitions
    const newExposed = transition(foi, s.S);
    const newInfectious = transition(sigma, s.E);
    const newRecovered = transition(gamma, s.I);

    newInfections[i] = newInfectious; // newly moving from E→I
    totalNewInfections += newInfectious;

    // Update compartments
    const newS = Math.max(0, s.S - newExposed);
    const newE = Math.max(0, s.E + newExposed - newInfectious);
    const newI = Math.max(0, s.I + newInfectious - newRecovered);
    const newR = s.R + newRecovered;

    newStrata.push({
      S: newS,
      E: newE,
      I: newI,
      R: newR,
      V: s.V,
      H: s.H,
      ICU: s.ICU,
      D: s.D,
    });
  }

  // Health outcomes
  const healthUpdate = computeHealthOutcomes(
    newInfections,
    state.strata,
    epiConfig.stratumParams,
    healthCapacity,
  );

  // Update H, ICU, D in new strata
  for (let i = 0; i < NUM_STRATA; i++) {
    // Simple model: H and ICU decay with ~7 day stay
    const hospDischarge = newStrata[i].H * 0.1; // ~10% discharge per day
    const icuDischarge = newStrata[i].ICU * 0.07; // ~7% discharge per day

    newStrata[i].H = Math.max(0, newStrata[i].H + healthUpdate.newHosp[i] - hospDischarge);
    newStrata[i].ICU = Math.max(0, newStrata[i].ICU + healthUpdate.newICU[i] - icuDischarge);
    newStrata[i].D += healthUpdate.newDeaths[i];
  }

  // Add excess deaths (distribute proportionally to strata)
  if (healthUpdate.excessDeaths > 0) {
    for (let i = 0; i < NUM_STRATA; i++) {
      const share = newStrata[i].I / Math.max(1, totalNewInfections);
      newStrata[i].D += healthUpdate.excessDeaths * share;
    }
  }

  // Compute Reff
  const susceptible = getAgeGroupSusceptible(newStrata);
  const newTotals = getAgeGroupTotals(newStrata);
  const Reff = computeReff(beta, epiConfig.infectiousPeriod, contactMatrix, susceptible, newTotals);

  const metrics: DailyMetrics = {
    day: state.day + 1,
    Reff,
    newInfections: totalNewInfections,
    newHospitalizations: healthUpdate.newHosp.reduce((a, b) => a + b, 0),
    newICU: healthUpdate.newICU.reduce((a, b) => a + b, 0),
    newDeaths: healthUpdate.newDeaths.reduce((a, b) => a + b, 0) + healthUpdate.excessDeaths,
    excessDeaths: healthUpdate.excessDeaths,
    hospitalOverflow: healthUpdate.hospitalOverflow,
    icuOverflow: healthUpdate.icuOverflow,
  };

  return {
    newState: { strata: newStrata, day: state.day + 1 },
    metrics,
  };
}

/**
 * Run a complete deterministic SEIR simulation.
 */
export function runSEIR(
  scenario: ScenarioConfig,
  transition: TransitionFunction = deterministicTransition,
  seed = 0,
): SimulationRun {
  const aggContactMatrix = sumContactMatrix(scenario.contactMatrix);
  const beta = calibrateBeta(
    scenario.epiConfig.R0,
    scenario.epiConfig.infectiousPeriod,
    aggContactMatrix,
    scenario.demographics,
  );

  let state = initializePopulation(scenario);
  const states: PopulationState[] = [state];
  const metrics: DailyMetrics[] = [];

  for (let day = 0; day < scenario.days; day++) {
    // Apply NPIs for this day
    const npiResult = applyNPIs(scenario.npis, day, scenario.contactMatrix);
    const effectiveBeta = beta * npiResult.betaMultiplier;
    const effectiveCM = npiResult.contactMatrix;

    const result = stepSEIR(state, scenario, effectiveBeta, effectiveCM, transition);
    state = result.newState;
    states.push(state);
    metrics.push(result.metrics);
  }

  return { states, metrics, seed };
}
