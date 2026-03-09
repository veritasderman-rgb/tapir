import { describe, it, expect } from 'vitest';
import { computeVE } from '../src/vaccination';
import { runSEIRV } from '../src/models/seirv';
import { runSEIR } from '../src/models/seir';
import { defaultScenario } from '../src/scenario-schema';
import { NUM_STRATA } from '../src/types';

describe('computeVE', () => {
  it('returns peak VE at day 0', () => {
    expect(computeVE(0.9, 0, 180)).toBeCloseTo(0.9);
  });

  it('returns half of peak at half-life', () => {
    expect(computeVE(0.9, 180, 180)).toBeCloseTo(0.45, 1);
  });

  it('returns 0 before vaccination', () => {
    expect(computeVE(0.9, -10, 180)).toBe(0);
  });

  it('wanes over time', () => {
    const ve0 = computeVE(0.9, 0, 180);
    const ve90 = computeVE(0.9, 90, 180);
    const ve360 = computeVE(0.9, 360, 180);
    expect(ve0).toBeGreaterThan(ve90);
    expect(ve90).toBeGreaterThan(ve360);
  });
});

describe('SEIRV model', () => {
  it('conserves S+E+I+R+V = N', () => {
    const scenario = defaultScenario();
    scenario.vaccination.enabled = true;
    scenario.vaccination.startDay = 30;
    scenario.days = 200;

    const result = runSEIRV(scenario);

    const initPop = result.states[0].strata.reduce(
      (sum, s) => sum + s.S + s.E + s.I + s.R + s.V, 0,
    );

    for (const state of result.states) {
      const pop = state.strata.reduce(
        (sum, s) => sum + s.S + s.E + s.I + s.R + s.V, 0,
      );
      expect(pop).toBeCloseTo(initPop, 0);
    }
  });

  it('vaccination reduces peak infections compared to no vaccination', () => {
    const scenarioNoVax = defaultScenario();
    scenarioNoVax.days = 365;
    scenarioNoVax.vaccination.enabled = false;
    const resultNoVax = runSEIR(scenarioNoVax);
    const peakNoVax = Math.max(...resultNoVax.metrics.map(m => m.newInfections));

    const scenarioVax = defaultScenario();
    scenarioVax.days = 365;
    scenarioVax.vaccination.enabled = true;
    scenarioVax.vaccination.startDay = 0;
    scenarioVax.vaccination.dosesPerDay = 10000;
    scenarioVax.vaccination.peakVEInfection = 0.9;
    const resultVax = runSEIRV(scenarioVax);
    const peakVax = Math.max(...resultVax.metrics.map(m => m.newInfections));

    expect(peakVax).toBeLessThan(peakNoVax);
  });
});
