import { describe, it, expect } from 'vitest';
import { validateScenario } from '../src/validation';
import { defaultScenario } from '../src/scenario-schema';
import { NUM_STRATA } from '../src/types';

describe('validateScenario', () => {
  it('accepts a valid default scenario', () => {
    const errors = validateScenario(defaultScenario());
    expect(errors).toEqual([]);
  });

  it('rejects days = 0', () => {
    const sc = defaultScenario();
    sc.days = 0;
    const errors = validateScenario(sc);
    expect(errors.some(e => e.path === 'days')).toBe(true);
  });

  it('rejects negative population', () => {
    const sc = defaultScenario();
    sc.demographics.totalPopulation = -1;
    const errors = validateScenario(sc);
    expect(errors.some(e => e.path === 'demographics.totalPopulation')).toBe(true);
  });

  it('rejects age fractions that do not sum to 1', () => {
    const sc = defaultScenario();
    sc.demographics.ageFractions = [0.5, 0.5, 0.5];
    const errors = validateScenario(sc);
    expect(errors.some(e => e.path === 'demographics.ageFractions')).toBe(true);
  });

  it('rejects initial infectious > population', () => {
    const sc = defaultScenario();
    sc.demographics.initialInfectious = sc.demographics.totalPopulation + 1;
    const errors = validateScenario(sc);
    expect(errors.some(e => e.path === 'demographics.initialInfectious')).toBe(true);
  });

  it('rejects R0 = 0', () => {
    const sc = defaultScenario();
    sc.epiConfig.R0 = 0;
    const errors = validateScenario(sc);
    expect(errors.some(e => e.path === 'epiConfig.R0')).toBe(true);
  });

  it('rejects IFR > 1', () => {
    const sc = defaultScenario();
    sc.epiConfig.stratumParams[0].ifr = 1.5;
    const errors = validateScenario(sc);
    expect(errors.some(e => e.path.includes('ifr'))).toBe(true);
  });

  it('rejects negative contact matrix values', () => {
    const sc = defaultScenario();
    sc.contactMatrix.home[0][0] = -1;
    const errors = validateScenario(sc);
    expect(errors.some(e => e.path.includes('contactMatrix.home'))).toBe(true);
  });

  it('rejects excess mortality rate > 1', () => {
    const sc = defaultScenario();
    sc.healthCapacity.excessMortalityRate = 1.5;
    const errors = validateScenario(sc);
    expect(errors.some(e => e.path === 'healthCapacity.excessMortalityRate')).toBe(true);
  });

  it('validates vaccination config when enabled', () => {
    const sc = defaultScenario();
    sc.vaccination.enabled = true;
    sc.vaccination.peakVEInfection = 1.5;
    const errors = validateScenario(sc);
    expect(errors.some(e => e.path === 'vaccination.peakVEInfection')).toBe(true);
  });

  it('skips vaccination validation when disabled', () => {
    const sc = defaultScenario();
    sc.vaccination.enabled = false;
    sc.vaccination.peakVEInfection = 1.5; // invalid but should not matter
    const errors = validateScenario(sc);
    expect(errors.some(e => e.path === 'vaccination.peakVEInfection')).toBe(false);
  });
});
