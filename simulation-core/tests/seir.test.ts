import { describe, it, expect } from 'vitest';
import { runSEIR, initializePopulation } from '../src/models/seir';
import { defaultScenario } from '../src/scenario-schema';
import { NUM_STRATA } from '../src/types';

function totalPopulation(strata: { S: number; E: number; I: number; R: number; V: number }[]): number {
  return strata.reduce((sum, s) => sum + s.S + s.E + s.I + s.R + s.V, 0);
}

describe('SEIR model', () => {
  it('conserves population at every time step', () => {
    const scenario = defaultScenario();
    scenario.days = 365;
    const result = runSEIR(scenario);

    const initialPop = totalPopulation(result.states[0].strata);

    for (let d = 0; d < result.states.length; d++) {
      const pop = totalPopulation(result.states[d].strata);
      expect(pop).toBeCloseTo(initialPop, 2);
    }
  });

  it('S is monotonically non-increasing (no waning/reinfection)', () => {
    const scenario = defaultScenario();
    scenario.days = 365;
    const result = runSEIR(scenario);

    for (let d = 1; d < result.states.length; d++) {
      for (let i = 0; i < NUM_STRATA; i++) {
        expect(result.states[d].strata[i].S).toBeLessThanOrEqual(
          result.states[d - 1].strata[i].S + 0.01, // small tolerance for floating point
        );
      }
    }
  });

  it('produces an epidemic curve with a peak when R0 > 1', () => {
    const scenario = defaultScenario();
    scenario.epiConfig.R0 = 2.5;
    scenario.days = 365;
    const result = runSEIR(scenario);

    const totalI = result.states.map(s =>
      s.strata.reduce((sum, st) => sum + st.I, 0),
    );

    // Find peak
    const peak = Math.max(...totalI);
    expect(peak).toBeGreaterThan(scenario.demographics.initialInfectious);

    // Peak should not be at the last day (epidemic should decline)
    const peakDay = totalI.indexOf(peak);
    expect(peakDay).toBeLessThan(scenario.days);
  });

  it('does not produce epidemic when R0 < 1', () => {
    const scenario = defaultScenario();
    scenario.epiConfig.R0 = 0.5;
    scenario.days = 200;
    const result = runSEIR(scenario);

    // Total I should always decline
    const totalIAtEnd = result.states[result.states.length - 1].strata.reduce(
      (sum, s) => sum + s.I, 0,
    );
    const totalIAtStart = result.states[0].strata.reduce(
      (sum, s) => sum + s.I, 0,
    );
    expect(totalIAtEnd).toBeLessThan(totalIAtStart);
  });

  it('no compartment values go negative', () => {
    const scenario = defaultScenario();
    scenario.days = 365;
    const result = runSEIR(scenario);

    for (const state of result.states) {
      for (const s of state.strata) {
        expect(s.S).toBeGreaterThanOrEqual(0);
        expect(s.E).toBeGreaterThanOrEqual(0);
        expect(s.I).toBeGreaterThanOrEqual(0);
        expect(s.R).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('excess deaths occur when capacity is very low', () => {
    const scenario = defaultScenario();
    scenario.epiConfig.R0 = 3.0;
    scenario.days = 365;
    scenario.healthCapacity.hospitalBeds = 10; // very low
    scenario.healthCapacity.icuBeds = 1;
    scenario.healthCapacity.excessMortalityRate = 0.5;
    const result = runSEIR(scenario);

    const totalExcess = result.metrics.reduce((sum, m) => sum + m.excessDeaths, 0);
    expect(totalExcess).toBeGreaterThan(0);
  });

  it('initializes population correctly', () => {
    const scenario = defaultScenario();
    const state = initializePopulation(scenario);

    expect(state.strata).toHaveLength(NUM_STRATA);
    const totalPop = totalPopulation(state.strata);
    expect(totalPop).toBeCloseTo(scenario.demographics.totalPopulation, 0);

    const totalI = state.strata.reduce((sum, s) => sum + s.I, 0);
    expect(totalI).toBeCloseTo(scenario.demographics.initialInfectious, 0);
  });
});
