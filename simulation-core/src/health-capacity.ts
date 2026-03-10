import {
  type CompartmentState,
  type HealthCapacityConfig,
  type StratumEpiParams,
  NUM_STRATA,
} from './types';

export interface HealthUpdate {
  /** New hospitalizations per stratum */
  newHosp: number[];
  /** New ICU admissions per stratum */
  newICU: number[];
  /** New deaths per stratum (including excess) */
  newDeaths: number[];
  /** Excess deaths due to overflow */
  excessDeaths: number;
  /** Is hospital capacity exceeded? */
  hospitalOverflow: boolean;
  /** Is ICU capacity exceeded? */
  icuOverflow: boolean;
}

/**
 * Compute hospitalizations, ICU, deaths, and capacity overflow for one day.
 *
 * @param newInfections - new infections per stratum this day
 * @param currentStrata - current compartment states
 * @param epiParams - per-stratum clinical parameters
 * @param capacity - health system capacity
 */
export function computeHealthOutcomes(
  newInfections: number[],
  currentStrata: CompartmentState[],
  epiParams: StratumEpiParams[],
  capacity: HealthCapacityConfig,
): HealthUpdate {
  const newHosp = new Array(NUM_STRATA).fill(0);
  const newICU = new Array(NUM_STRATA).fill(0);
  const newDeaths = new Array(NUM_STRATA).fill(0);

  let totalHosp = 0;
  let totalICU = 0;

  // Compute new admissions from new infections
  for (let i = 0; i < NUM_STRATA; i++) {
    newHosp[i] = newInfections[i] * epiParams[i].hospRate;
    newICU[i] = newHosp[i] * epiParams[i].icuRate;
    newDeaths[i] = newInfections[i] * epiParams[i].ifr;

    totalHosp += currentStrata[i].H + newHosp[i];
    totalICU += currentStrata[i].ICU + newICU[i];
  }

  const hospitalOverflow = totalHosp > capacity.hospitalBeds;
  const icuOverflow = totalICU > capacity.icuBeds;

  // Excess deaths from overflow
  let excessDeaths = 0;

  // Hospital overflow mortality (less critical than ICU)
  if (hospitalOverflow) {
    const overflow = totalHosp - capacity.hospitalBeds;
    // Standard excess mortality rate (e.g. 0.3)
    excessDeaths += overflow * (capacity.excessMortalityRate || 0.1);
  }

  // ICU overflow: "Mortality Multiplier" logic
  // "Assume 80–90% mortality for unventilated critical patients"
  // Standard ICU mortality is already in IFR.
  // This represents the *additional* deaths because of lack of ICU care.
  if (icuOverflow) {
    const overflow = totalICU - capacity.icuBeds;
    // If standard ICU mortality is 20-30%, and unventilated is 90%,
    // the *excess* is around 60-70%.
    excessDeaths += overflow * 0.7; // ~90% total mortality for overflow
  }

  return {
    newHosp,
    newICU,
    newDeaths,
    excessDeaths,
    hospitalOverflow,
    icuOverflow,
  };
}
