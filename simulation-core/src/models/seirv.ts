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
import { computeDailyVaccinations, computeVE } from '../vaccination';
import { initializePopulation, type TransitionFunction, deterministicTransition } from './seir';

function stratumToAgeGroup(stratumIndex: number): number {
  return Math.floor(stratumIndex / 2);
}

function getAgeGroupInfectious(strata: CompartmentState[]): number[] {
  const result = new Array(NUM_AGE_GROUPS).fill(0);
  for (let i = 0; i < NUM_STRATA; i++) {
    result[stratumToAgeGroup(i)] += strata[i].I;
  }
  return result;
}

function getAgeGroupTotals(strata: CompartmentState[]): number[] {
  const result = new Array(NUM_AGE_GROUPS).fill(0);
  for (let i = 0; i < NUM_STRATA; i++) {
    result[stratumToAgeGroup(i)] += strata[i].S + strata[i].E + strata[i].I + strata[i].R + strata[i].V;
  }
  return result;
}

function getAgeGroupSusceptible(strata: CompartmentState[]): number[] {
  const result = new Array(NUM_AGE_GROUPS).fill(0);
  for (let i = 0; i < NUM_STRATA; i++) {
    result[stratumToAgeGroup(i)] += strata[i].S + strata[i].V;
  }
  return result;
}

/**
 * Run one day step of the SEIRV model.
 * Extends SEIR with vaccination compartment.
 * Vaccinated (V) have reduced susceptibility based on VE_inf.
 */
export function stepSEIRV(
  state: PopulationState,
  scenario: ScenarioConfig,
  beta: number,
  contactMatrix: ContactSubMatrix,
  transition: TransitionFunction = deterministicTransition,
): { newState: PopulationState; metrics: DailyMetrics; newInfectionsPerStratum: number[] } {
  const { epiConfig, healthCapacity, vaccination } = scenario;
  const sigma = 1 / epiConfig.latentPeriod;
  const gamma = 1 / epiConfig.infectiousPeriod;

  const infectious = getAgeGroupInfectious(state.strata);
  const totals = getAgeGroupTotals(state.strata);

  // Force of infection per age group
  const lambda = new Array(NUM_AGE_GROUPS).fill(0);
  for (let i = 0; i < NUM_AGE_GROUPS; i++) {
    for (let j = 0; j < NUM_AGE_GROUPS; j++) {
      if (totals[j] > 0) {
        lambda[i] += beta * contactMatrix[i][j] * infectious[j] / totals[j];
      }
    }
  }

  // Current VE
  const daysSinceVaxStart = state.day - vaccination.startDay;
  const veInf = vaccination.enabled
    ? computeVE(vaccination.peakVEInfection, daysSinceVaxStart, vaccination.waningHalfLifeDays)
    : 0;
  const veSev = vaccination.enabled
    ? computeVE(vaccination.peakVESevere, daysSinceVaxStart, vaccination.waningHalfLifeDays)
    : 0;

  // Vaccinations for today
  const newVaccinations = computeDailyVaccinations(state.day, state.strata, vaccination);

  const newStrata: CompartmentState[] = [];
  const newInfections = new Array(NUM_STRATA).fill(0);
  let totalNewInfections = 0;

  for (let i = 0; i < NUM_STRATA; i++) {
    const s = state.strata[i];
    const ageIdx = stratumToAgeGroup(i);
    const foi = lambda[ageIdx];

    // S → E transitions
    const newExposedFromS = transition(foi, s.S - newVaccinations[i]);
    // V → E transitions (reduced by VE)
    const newExposedFromV = transition(foi * (1 - veInf), s.V);
    const totalNewExposed = newExposedFromS + newExposedFromV;

    // E → I
    const newInfectious = transition(sigma, s.E);
    // I → R
    const newRecovered = transition(gamma, s.I);

    newInfections[i] = newInfectious;
    totalNewInfections += newInfectious;

    const newS = Math.max(0, s.S - newExposedFromS - newVaccinations[i]);
    const newE = Math.max(0, s.E + totalNewExposed - newInfectious);
    const newI = Math.max(0, s.I + newInfectious - newRecovered);
    const newR = s.R + newRecovered;
    const newV = Math.max(0, s.V + newVaccinations[i] - newExposedFromV);

    newStrata.push({
      S: newS,
      E: newE,
      I: newI,
      R: newR,
      V: newV,
      H: s.H,
      ICU: s.ICU,
      D: s.D,
    });
  }

  // Health outcomes — VE_sev reduces hospitalization/ICU/IFR for vaccinated
  // Simplified: apply overall reduction based on vaccination coverage
  const adjustedEpiParams = epiConfig.stratumParams.map((sp, i) => {
    const totalInStratum = state.strata[i].S + state.strata[i].E + state.strata[i].I + state.strata[i].R + state.strata[i].V;
    const vaxFraction = totalInStratum > 0 ? state.strata[i].V / totalInStratum : 0;
    const sevReduction = vaxFraction * veSev;
    return {
      ifr: sp.ifr * (1 - sevReduction),
      hospRate: sp.hospRate * (1 - sevReduction),
      icuRate: sp.icuRate * (1 - sevReduction),
    };
  });

  const healthUpdate = computeHealthOutcomes(
    newInfections,
    state.strata,
    adjustedEpiParams,
    healthCapacity,
  );

  for (let i = 0; i < NUM_STRATA; i++) {
    const hospDischarge = newStrata[i].H * 0.1;
    const icuDischarge = newStrata[i].ICU * 0.07;
    newStrata[i].H = Math.max(0, newStrata[i].H + healthUpdate.newHosp[i] - hospDischarge);
    newStrata[i].ICU = Math.max(0, newStrata[i].ICU + healthUpdate.newICU[i] - icuDischarge);
    newStrata[i].D += healthUpdate.newDeaths[i];
  }

  if (healthUpdate.excessDeaths > 0) {
    for (let i = 0; i < NUM_STRATA; i++) {
      const share = newStrata[i].I / Math.max(1, totalNewInfections);
      newStrata[i].D += healthUpdate.excessDeaths * share;
    }
  }

  const susceptible = getAgeGroupSusceptible(newStrata);
  const newTotals = getAgeGroupTotals(newStrata);
  const Reff = computeReff(beta, epiConfig.infectiousPeriod, contactMatrix, susceptible, newTotals);

  return {
    newState: { strata: newStrata, day: state.day + 1 },
    metrics: {
      day: state.day + 1,
      Reff,
      newInfections: totalNewInfections,
      newHospitalizations: healthUpdate.newHosp.reduce((a, b) => a + b, 0),
      newICU: healthUpdate.newICU.reduce((a, b) => a + b, 0),
      newDeaths: healthUpdate.newDeaths.reduce((a, b) => a + b, 0) + healthUpdate.excessDeaths,
      excessDeaths: healthUpdate.excessDeaths,
      hospitalOverflow: healthUpdate.hospitalOverflow,
      icuOverflow: healthUpdate.icuOverflow,
    },
    newInfectionsPerStratum: newInfections,
  };
}

/**
 * Run a complete SEIRV simulation.
 */
export function runSEIRV(
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
    const npiResult = applyNPIs(scenario.npis, day, scenario.contactMatrix);
    const effectiveBeta = beta * npiResult.betaMultiplier;

    const result = stepSEIRV(state, scenario, effectiveBeta, npiResult.contactMatrix, transition);
    state = result.newState;
    states.push(state);
    metrics.push(result.metrics);
  }

  return { states, metrics, seed };
}
