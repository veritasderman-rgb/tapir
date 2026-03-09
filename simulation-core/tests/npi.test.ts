import { describe, it, expect } from 'vitest';
import { computeCompliance, applyNPIs } from '../src/npi-engine';
import { runSEIR } from '../src/models/seir';
import { defaultScenario, defaultContactMatrix } from '../src/scenario-schema';
import { ComplianceModel, NPIType, type NPIConfig } from '../src/types';
import { sumContactMatrix } from '../src/contact-matrix';

function makeBetaNPI(overrides: Partial<NPIConfig> = {}): NPIConfig {
  return {
    id: 'npi-1',
    name: 'Lockdown',
    type: NPIType.BetaMultiplier,
    startDay: 30,
    endDay: 90,
    value: 0.5, // 50% reduction
    compliance: {
      model: ComplianceModel.ExponentialDecay,
      initial: 1.0,
      decayRate: 0,
    },
    ...overrides,
  };
}

describe('computeCompliance', () => {
  it('returns 0 before NPI start', () => {
    const npi = makeBetaNPI({ startDay: 10, endDay: 50 });
    expect(computeCompliance(npi, 5)).toBe(0);
  });

  it('returns 0 after NPI end', () => {
    const npi = makeBetaNPI({ startDay: 10, endDay: 50 });
    expect(computeCompliance(npi, 55)).toBe(0);
  });

  it('returns initial compliance at start (no decay)', () => {
    const npi = makeBetaNPI();
    npi.compliance.initial = 0.9;
    npi.compliance.decayRate = 0;
    expect(computeCompliance(npi, 30)).toBeCloseTo(0.9);
  });

  it('decays exponentially', () => {
    const npi = makeBetaNPI();
    npi.compliance.initial = 1.0;
    npi.compliance.decayRate = 0.01;
    const c30 = computeCompliance(npi, 30); // day 0 of NPI
    const c60 = computeCompliance(npi, 60); // day 30 of NPI
    expect(c30).toBeCloseTo(1.0);
    expect(c60).toBeLessThan(c30);
    expect(c60).toBeCloseTo(Math.exp(-0.01 * 30), 5);
  });

  it('piecewise linear interpolation', () => {
    const npi = makeBetaNPI({
      compliance: {
        model: ComplianceModel.PiecewiseLinear,
        initial: 1.0,
        breakpoints: [[0, 1.0], [30, 0.5], [60, 0.2]],
      },
    });
    expect(computeCompliance(npi, 30)).toBeCloseTo(1.0); // day 0 of NPI
    expect(computeCompliance(npi, 45)).toBeCloseTo(0.75); // midpoint: day 15
    expect(computeCompliance(npi, 60)).toBeCloseTo(0.5); // day 30
    expect(computeCompliance(npi, 90)).toBeCloseTo(0.2); // day 60
  });
});

describe('applyNPIs', () => {
  it('returns unmodified values when no NPIs active', () => {
    const cm = defaultContactMatrix();
    const result = applyNPIs([], 50, cm);
    expect(result.betaMultiplier).toBe(1.0);
    expect(result.gammaMultiplier).toBe(1.0);
    // Contact matrix should equal sum of all sub-matrices
    const expected = sumContactMatrix(cm);
    expect(result.contactMatrix).toEqual(expected);
  });

  it('school closure zeros out school sub-matrix', () => {
    const cm = defaultContactMatrix();
    const npi: NPIConfig = {
      id: 'school-close',
      name: 'School closure',
      type: NPIType.ContactSubMatrixModifier,
      startDay: 0,
      endDay: 100,
      value: 0, // complete closure
      targetSubMatrix: 'school',
      compliance: { model: ComplianceModel.ExponentialDecay, initial: 1.0, decayRate: 0 },
    };
    const result = applyNPIs([npi], 50, cm);

    // School contacts should be zero, so total should equal home+work+community
    const withoutSchool = sumContactMatrix({ ...cm, school: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] });
    expect(result.contactMatrix).toEqual(withoutSchool);
  });
});

describe('NPI reduces peak infections (integration)', () => {
  it('lockdown NPI reduces peak I compared to no NPI', () => {
    const scenario = defaultScenario();
    scenario.days = 365;
    scenario.epiConfig.R0 = 2.5;

    const resultNoNPI = runSEIR(scenario);
    const peakNoNPI = Math.max(...resultNoNPI.metrics.map(m => m.newInfections));

    const scenarioNPI = defaultScenario();
    scenarioNPI.days = 365;
    scenarioNPI.epiConfig.R0 = 2.5;
    scenarioNPI.npis = [makeBetaNPI({ startDay: 0, endDay: 365, value: 0.5 })];

    const resultNPI = runSEIR(scenarioNPI);
    const peakNPI = Math.max(...resultNPI.metrics.map(m => m.newInfections));

    expect(peakNPI).toBeLessThan(peakNoNPI);
  });
});
