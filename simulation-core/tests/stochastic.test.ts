import { describe, it, expect } from 'vitest';
import { mulberry32, binomialTransition, runSimulation, computeQuantiles } from '../src/stochastic';
import { defaultScenario } from '../src/scenario-schema';
import { SimulationMode, NUM_STRATA } from '../src/types';

describe('mulberry32 PRNG', () => {
  it('produces same sequence for same seed', () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(43);
    let same = 0;
    for (let i = 0; i < 100; i++) {
      if (rng1() === rng2()) same++;
    }
    expect(same).toBeLessThan(5);
  });

  it('values are in [0, 1)', () => {
    const rng = mulberry32(12345);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('binomialTransition', () => {
  it('returns 0 for rate 0', () => {
    const rng = mulberry32(42);
    const bt = binomialTransition(rng);
    expect(bt(0, 100)).toBe(0);
  });

  it('returns n for rate 1', () => {
    const rng = mulberry32(42);
    const bt = binomialTransition(rng);
    expect(bt(1, 100)).toBe(100);
  });

  it('average is close to expected value', () => {
    const p = 0.3;
    const n = 1000;
    const runs = 500;
    let total = 0;
    const rng = mulberry32(42);
    const bt = binomialTransition(rng);
    for (let i = 0; i < runs; i++) {
      total += bt(p, n);
    }
    const avg = total / runs;
    expect(avg).toBeCloseTo(n * p, -1); // within ~10
  });
});

describe('runSimulation', () => {
  it('deterministic mode produces consistent results', () => {
    const scenario = defaultScenario();
    scenario.days = 100;
    scenario.stochastic.mode = SimulationMode.Deterministic;

    const r1 = runSimulation(scenario);
    const r2 = runSimulation(scenario);

    for (let d = 0; d < scenario.days; d++) {
      expect(r1.primaryRun.metrics[d].newInfections).toBe(
        r2.primaryRun.metrics[d].newInfections,
      );
    }
  });

  it('stochastic single run is seed-reproducible', () => {
    const scenario = defaultScenario();
    scenario.days = 100;
    scenario.stochastic.mode = SimulationMode.StochasticSingle;
    scenario.stochastic.seed = 42;

    const r1 = runSimulation(scenario);
    const r2 = runSimulation(scenario);

    for (let d = 0; d < scenario.days; d++) {
      expect(r1.primaryRun.metrics[d].newInfections).toBe(
        r2.primaryRun.metrics[d].newInfections,
      );
    }
  });

  it('Monte Carlo produces quantiles where p95 >= median >= p5', () => {
    const scenario = defaultScenario();
    scenario.days = 100;
    scenario.stochastic.mode = SimulationMode.StochasticMonteCarlo;
    scenario.stochastic.seed = 42;
    scenario.stochastic.monteCarloRuns = 20;

    const result = runSimulation(scenario);

    expect(result.quantiles).toBeDefined();
    for (const q of result.quantiles!.infections) {
      expect(q.p95).toBeGreaterThanOrEqual(q.median);
      expect(q.median).toBeGreaterThanOrEqual(q.p5);
    }
  });

  it('population is conserved in stochastic mode', () => {
    const scenario = defaultScenario();
    scenario.days = 200;
    scenario.stochastic.mode = SimulationMode.StochasticSingle;
    scenario.stochastic.seed = 42;

    const result = runSimulation(scenario);

    const initPop = result.primaryRun.states[0].strata.reduce(
      (sum, s) => sum + s.S + s.E + s.I + s.R + s.V, 0,
    );

    for (const state of result.primaryRun.states) {
      const pop = state.strata.reduce(
        (sum, s) => sum + s.S + s.E + s.I + s.R + s.V, 0,
      );
      // Allow slightly larger tolerance for stochastic rounding
      expect(Math.abs(pop - initPop)).toBeLessThan(initPop * 0.01);
    }
  });

  it('cancellation stops Monte Carlo early', () => {
    const scenario = defaultScenario();
    scenario.days = 50;
    scenario.stochastic.mode = SimulationMode.StochasticMonteCarlo;
    scenario.stochastic.monteCarloRuns = 100;

    let callCount = 0;
    const result = runSimulation(
      scenario,
      undefined,
      () => {
        callCount++;
        return callCount > 5;
      },
    );

    expect(result.monteCarloRuns!.length).toBeLessThan(100);
  });
});
