import { type VaccinationConfig, type CompartmentState, NUM_STRATA } from './types';

/**
 * Compute current vaccine efficacy (VE) at a given day after vaccination start,
 * accounting for waning.
 *
 * VE(t) = peakVE * exp(-ln(2) * t / halfLife)
 */
export function computeVE(peakVE: number, daysSinceVaccination: number, waningHalfLifeDays: number): number {
  if (daysSinceVaccination < 0) return 0;
  return peakVE * Math.exp(-Math.LN2 * daysSinceVaccination / waningHalfLifeDays);
}

/**
 * Compute vaccinations for one day.
 * Moves people from S to V according to rollout schedule.
 *
 * Returns the number of new vaccinations per stratum.
 */
export function computeDailyVaccinations(
  day: number,
  strata: CompartmentState[],
  config: VaccinationConfig,
): number[] {
  const newVaccinations = new Array(NUM_STRATA).fill(0);

  if (!config.enabled || day < config.startDay) {
    return newVaccinations;
  }

  let remainingDoses = config.dosesPerDay;

  // Distribute doses across strata, prioritizing those furthest from coverage target
  // Simple proportional allocation
  const eligiblePerStratum: number[] = [];
  let totalEligible = 0;

  for (let i = 0; i < NUM_STRATA; i++) {
    const totalInStratum = strata[i].S + strata[i].E + strata[i].I + strata[i].R + strata[i].V;
    const currentCoverage = totalInStratum > 0 ? strata[i].V / totalInStratum : 1;
    const targetCoverage = config.coverageTarget[i];

    if (currentCoverage < targetCoverage) {
      const eligible = Math.max(0, strata[i].S); // only susceptible can be vaccinated
      eligiblePerStratum.push(eligible);
      totalEligible += eligible;
    } else {
      eligiblePerStratum.push(0);
    }
  }

  if (totalEligible === 0 || remainingDoses === 0) {
    return newVaccinations;
  }

  // Allocate proportionally
  for (let i = 0; i < NUM_STRATA; i++) {
    if (eligiblePerStratum[i] > 0) {
      const share = eligiblePerStratum[i] / totalEligible;
      const doses = Math.min(
        Math.floor(remainingDoses * share),
        eligiblePerStratum[i],
      );
      newVaccinations[i] = doses;
    }
  }

  return newVaccinations;
}
