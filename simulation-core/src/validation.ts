import {
  type ScenarioConfig,
  type ValidationError,
  NUM_STRATA,
  NUM_AGE_GROUPS,
} from './types';

const MIN_POPULATION = 100;
const MAX_POPULATION = 10_000_000_000;
const MAX_DAYS = 3650; // 10 years

function inRange(v: number, lo: number, hi: number): boolean {
  return v >= lo && v <= hi;
}

function sumApproxOne(arr: number[], tolerance = 0.001): boolean {
  const sum = arr.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1.0) < tolerance;
}

/** Validate a complete ScenarioConfig. Returns empty array if valid. */
export function validateScenario(sc: ScenarioConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // ---- Days ----
  if (!Number.isInteger(sc.days) || sc.days < 1 || sc.days > MAX_DAYS) {
    errors.push({ path: 'days', message: `Simulation days must be an integer in [1, ${MAX_DAYS}].` });
  }

  // ---- Demographics ----
  const d = sc.demographics;
  if (d.totalPopulation < MIN_POPULATION || d.totalPopulation > MAX_POPULATION) {
    errors.push({ path: 'demographics.totalPopulation', message: `Population must be in [${MIN_POPULATION}, ${MAX_POPULATION}].` });
  }

  if (d.ageFractions.length !== NUM_AGE_GROUPS) {
    errors.push({ path: 'demographics.ageFractions', message: `Must have ${NUM_AGE_GROUPS} age fractions.` });
  } else {
    if (!sumApproxOne(d.ageFractions)) {
      errors.push({ path: 'demographics.ageFractions', message: 'Age fractions must sum to 1 (100%).' });
    }
    for (let i = 0; i < NUM_AGE_GROUPS; i++) {
      if (!inRange(d.ageFractions[i], 0, 1)) {
        errors.push({ path: `demographics.ageFractions[${i}]`, message: 'Each age fraction must be in [0, 1].' });
      }
    }
  }

  if (d.riskFractions.length !== NUM_AGE_GROUPS) {
    errors.push({ path: 'demographics.riskFractions', message: `Must have ${NUM_AGE_GROUPS} risk fractions.` });
  } else {
    for (let i = 0; i < NUM_AGE_GROUPS; i++) {
      if (!inRange(d.riskFractions[i], 0, 1)) {
        errors.push({ path: `demographics.riskFractions[${i}]`, message: 'Each risk fraction must be in [0, 1].' });
      }
    }
  }

  if (d.initialInfectious < 0 || d.initialInfectious > d.totalPopulation) {
    errors.push({ path: 'demographics.initialInfectious', message: 'Initial infectious must be in [0, totalPopulation].' });
  }

  // ---- Epi config ----
  const e = sc.epiConfig;
  if (e.R0 <= 0) {
    errors.push({ path: 'epiConfig.R0', message: 'R0 must be > 0.' });
  }
  if (e.latentPeriod <= 0) {
    errors.push({ path: 'epiConfig.latentPeriod', message: 'Latent period must be > 0.' });
  }
  if (e.infectiousPeriod <= 0) {
    errors.push({ path: 'epiConfig.infectiousPeriod', message: 'Infectious period must be > 0.' });
  }

  if (e.stratumParams.length !== NUM_STRATA) {
    errors.push({ path: 'epiConfig.stratumParams', message: `Must have ${NUM_STRATA} stratum parameter sets.` });
  } else {
    for (let i = 0; i < NUM_STRATA; i++) {
      const sp = e.stratumParams[i];
      if (!inRange(sp.ifr, 0, 1)) {
        errors.push({ path: `epiConfig.stratumParams[${i}].ifr`, message: 'IFR must be in [0, 1].' });
      }
      if (!inRange(sp.hospRate, 0, 1)) {
        errors.push({ path: `epiConfig.stratumParams[${i}].hospRate`, message: 'Hospitalization rate must be in [0, 1].' });
      }
      if (!inRange(sp.icuRate, 0, 1)) {
        errors.push({ path: `epiConfig.stratumParams[${i}].icuRate`, message: 'ICU rate must be in [0, 1].' });
      }
    }
  }

  // ---- Contact matrix ----
  const cm = sc.contactMatrix;
  for (const key of ['home', 'school', 'work', 'community'] as const) {
    const sub = cm[key];
    if (sub.length !== NUM_AGE_GROUPS) {
      errors.push({ path: `contactMatrix.${key}`, message: `Must be ${NUM_AGE_GROUPS}×${NUM_AGE_GROUPS} matrix.` });
    } else {
      for (let i = 0; i < NUM_AGE_GROUPS; i++) {
        if (sub[i].length !== NUM_AGE_GROUPS) {
          errors.push({ path: `contactMatrix.${key}[${i}]`, message: `Row must have ${NUM_AGE_GROUPS} columns.` });
        } else {
          for (let j = 0; j < NUM_AGE_GROUPS; j++) {
            if (sub[i][j] < 0) {
              errors.push({ path: `contactMatrix.${key}[${i}][${j}]`, message: 'Contact values must be >= 0.' });
            }
          }
        }
      }
    }
  }

  // ---- Health capacity ----
  const hc = sc.healthCapacity;
  if (hc.hospitalBeds < 0) {
    errors.push({ path: 'healthCapacity.hospitalBeds', message: 'Hospital beds must be >= 0.' });
  }
  if (hc.icuBeds < 0) {
    errors.push({ path: 'healthCapacity.icuBeds', message: 'ICU beds must be >= 0.' });
  }
  if (!inRange(hc.excessMortalityRate, 0, 1)) {
    errors.push({ path: 'healthCapacity.excessMortalityRate', message: 'Excess mortality rate must be in [0, 1].' });
  }

  // ---- Vaccination ----
  if (sc.vaccination.enabled) {
    const v = sc.vaccination;
    if (v.coverageTarget.length !== NUM_STRATA) {
      errors.push({ path: 'vaccination.coverageTarget', message: `Must have ${NUM_STRATA} coverage targets.` });
    } else {
      for (let i = 0; i < NUM_STRATA; i++) {
        if (!inRange(v.coverageTarget[i], 0, 1)) {
          errors.push({ path: `vaccination.coverageTarget[${i}]`, message: 'Coverage target must be in [0, 1].' });
        }
      }
    }
    if (v.dosesPerDay < 0) {
      errors.push({ path: 'vaccination.dosesPerDay', message: 'Doses per day must be >= 0.' });
    }
    if (!inRange(v.peakVEInfection, 0, 1)) {
      errors.push({ path: 'vaccination.peakVEInfection', message: 'VE infection must be in [0, 1].' });
    }
    if (!inRange(v.peakVESevere, 0, 1)) {
      errors.push({ path: 'vaccination.peakVESevere', message: 'VE severe must be in [0, 1].' });
    }
    if (v.waningHalfLifeDays <= 0) {
      errors.push({ path: 'vaccination.waningHalfLifeDays', message: 'Waning half-life must be > 0.' });
    }
  }

  // ---- NPIs ----
  for (let i = 0; i < sc.npis.length; i++) {
    const npi = sc.npis[i];
    if (npi.startDay < 0) {
      errors.push({ path: `npis[${i}].startDay`, message: 'Start day must be >= 0.' });
    }
    if (npi.endDay < npi.startDay) {
      errors.push({ path: `npis[${i}].endDay`, message: 'End day must be >= start day.' });
    }
    if (!inRange(npi.compliance.initial, 0, 1)) {
      errors.push({ path: `npis[${i}].compliance.initial`, message: 'Initial compliance must be in [0, 1].' });
    }
  }

  // ---- Variants ----
  for (let i = 0; i < sc.variants.length; i++) {
    const v = sc.variants[i];
    if (v.transmissibilityMultiplier <= 0) {
      errors.push({ path: `variants[${i}].transmissibilityMultiplier`, message: 'Must be > 0.' });
    }
    if (!inRange(v.immuneEscape, 0, 1)) {
      errors.push({ path: `variants[${i}].immuneEscape`, message: 'Immune escape must be in [0, 1].' });
    }
    if (!inRange(v.reinfectionBoost, 0, 1)) {
      errors.push({ path: `variants[${i}].reinfectionBoost`, message: 'Reinfection boost must be in [0, 1].' });
    }
  }

  return errors;
}
