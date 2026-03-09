import { describe, it, expect } from 'vitest';
import { spectralRadius, computeImpliedR0, getAgeGroupPopulations } from '../src/calibration/ngm';
import { calibrateBeta } from '../src/calibration/beta-calibration';
import { sumContactMatrix } from '../src/contact-matrix';
import { defaultContactMatrix, defaultDemographics } from '../src/scenario-schema';

describe('spectralRadius', () => {
  it('returns 1 for 1×1 identity', () => {
    expect(spectralRadius([[1]])).toBeCloseTo(1, 5);
  });

  it('returns n for n×n matrix of ones', () => {
    const n = 3;
    const M = Array.from({ length: n }, () => new Array(n).fill(1));
    expect(spectralRadius(M)).toBeCloseTo(n, 5);
  });

  it('returns 0 for zero matrix', () => {
    const M = [[0, 0], [0, 0]];
    expect(spectralRadius(M)).toBe(0);
  });

  it('returns correct value for diagonal matrix', () => {
    const M = [[3, 0], [0, 2]];
    expect(spectralRadius(M)).toBeCloseTo(3, 5);
  });
});

describe('calibrateBeta', () => {
  it('produces implied R0 matching target for homogeneous population', () => {
    const contactMatrix = [[5]]; // single age group, 5 contacts/day
    const demographics = { totalPopulation: 100000, ageFractions: [1] as any, riskFractions: [0] as any, initialInfectious: 1 };
    const infectiousPeriod = 7;
    const targetR0 = 2.5;

    const beta = calibrateBeta(targetR0, infectiousPeriod, contactMatrix, demographics);
    const impliedR0 = computeImpliedR0(beta, infectiousPeriod, contactMatrix, [100000]);

    expect(impliedR0).toBeCloseTo(targetR0, 8);
  });

  it('produces implied R0 matching target for heterogeneous population', () => {
    const cm = defaultContactMatrix();
    const demographics = defaultDemographics();
    const contactMatrix = sumContactMatrix(cm);
    const populationSizes = getAgeGroupPopulations(demographics);
    const infectiousPeriod = 7;
    const targetR0 = 2.5;

    const beta = calibrateBeta(targetR0, infectiousPeriod, contactMatrix, demographics);
    const impliedR0 = computeImpliedR0(beta, infectiousPeriod, contactMatrix, populationSizes);

    expect(impliedR0).toBeCloseTo(targetR0, 6);
  });

  it('works for different R0 values', () => {
    const cm = defaultContactMatrix();
    const demographics = defaultDemographics();
    const contactMatrix = sumContactMatrix(cm);
    const populationSizes = getAgeGroupPopulations(demographics);
    const infectiousPeriod = 5;

    for (const targetR0 of [1.1, 1.5, 3.0, 5.0, 12.0]) {
      const beta = calibrateBeta(targetR0, infectiousPeriod, contactMatrix, demographics);
      const impliedR0 = computeImpliedR0(beta, infectiousPeriod, contactMatrix, populationSizes);
      expect(impliedR0).toBeCloseTo(targetR0, 6);
    }
  });
});
