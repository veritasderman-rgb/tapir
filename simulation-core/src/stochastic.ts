import {
  type ScenarioConfig,
  type SimulationRun,
  type QuantileSummary,
  type SimulationResult,
  SimulationMode,
} from './types';
import { runMultistrain } from './models/multistrain';
import { runSEIR, type TransitionFunction } from './models/seir';
import { sumContactMatrix } from './contact-matrix';
import { calibrateBeta } from './calibration/beta-calibration';
import { computeImpliedR0, getAgeGroupPopulations } from './calibration/ngm';

/**
 * Mulberry32 — a simple seedable 32-bit PRNG.
 * Returns a function that produces values in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stateful RNG that exposes its internal seed for checkpointing. */
export interface StatefulRNG {
  /** Get next random number in [0, 1). */
  next: () => number;
  /** Get current internal state (seed value after last call). */
  getState: () => number;
  /** Number of calls made so far. */
  callCount: number;
}

/**
 * Create a stateful RNG wrapper around mulberry32.
 * Allows checkpointing: save state, then later resume from that state.
 */
export function createRNG(seed: number): StatefulRNG {
  let s = seed | 0;
  const rng: StatefulRNG = {
    callCount: 0,
    next: () => {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      rng.callCount++;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    getState: () => s,
  };
  return rng;
}

/**
 * Binomial transition: given a rate and pool, draw from Binomial(pool, rate).
 * Uses normal approximation for large pools, exact for small.
 */
export function binomialTransition(rng: () => number): TransitionFunction {
  return (rate: number, pool: number) => {
    const p = Math.min(Math.max(rate, 0), 1);
    const n = Math.max(0, Math.floor(pool));

    if (n === 0 || p === 0) return 0;
    if (p >= 1) return n;

    // For small n, use direct method
    if (n < 30) {
      let successes = 0;
      for (let i = 0; i < n; i++) {
        if (rng() < p) successes++;
      }
      return successes;
    }

    // Normal approximation for large n
    const mean = n * p;
    const std = Math.sqrt(n * p * (1 - p));
    const u1 = rng();
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
    const result = Math.round(mean + z * std);
    return Math.min(n, Math.max(0, result));
  };
}

/**
 * Compute quantile summaries from multiple simulation runs.
 */
export function computeQuantiles(
  runs: SimulationRun[],
  extractor: (run: SimulationRun, day: number) => number,
  days: number,
): QuantileSummary[] {
  const summaries: QuantileSummary[] = [];

  for (let d = 0; d < days; d++) {
    const values = runs.map(r => extractor(r, d)).sort((a, b) => a - b);
    const n = values.length;
    const p5Idx = Math.floor(n * 0.05);
    const p50Idx = Math.floor(n * 0.5);
    const p95Idx = Math.min(n - 1, Math.floor(n * 0.95));

    summaries.push({
      day: d,
      p5: values[p5Idx],
      median: values[p50Idx],
      p95: values[p95Idx],
    });
  }

  return summaries;
}

export interface MonteCarloProgress {
  completedRuns: number;
  totalRuns: number;
}

/**
 * Run the full simulation engine based on scenario config.
 * Handles deterministic, single stochastic, and Monte Carlo modes.
 */
export function runSimulation(
  scenario: ScenarioConfig,
  onProgress?: (progress: MonteCarloProgress) => void,
  shouldCancel?: () => boolean,
): SimulationResult {
  const aggCM = sumContactMatrix(scenario.contactMatrix);
  const beta = calibrateBeta(
    scenario.epiConfig.R0,
    scenario.epiConfig.infectiousPeriod,
    aggCM,
    scenario.demographics,
  );
  const impliedR0 = computeImpliedR0(
    beta,
    scenario.epiConfig.infectiousPeriod,
    aggCM,
    getAgeGroupPopulations(scenario.demographics),
  );

  const { mode, seed, monteCarloRuns } = scenario.stochastic;

  if (mode === SimulationMode.Deterministic) {
    const rng = mulberry32(seed);
    const primaryRun = runMultistrain(scenario, undefined, rng, seed);
    return {
      scenario,
      primaryRun,
      impliedR0,
      calibratedBeta: beta,
      timestamp: new Date().toISOString(),
    };
  }

  if (mode === SimulationMode.StochasticSingle) {
    const rng = mulberry32(seed);
    const transition = binomialTransition(rng);
    const primaryRun = runMultistrain(scenario, transition, rng, seed);
    return {
      scenario,
      primaryRun,
      impliedR0,
      calibratedBeta: beta,
      timestamp: new Date().toISOString(),
    };
  }

  // Monte Carlo
  const runs: SimulationRun[] = [];
  for (let i = 0; i < monteCarloRuns; i++) {
    if (shouldCancel?.()) break;

    const runSeed = seed + i;
    const rng = mulberry32(runSeed);
    const transition = binomialTransition(rng);
    const run = runMultistrain(scenario, transition, rng, runSeed);
    runs.push(run);

    onProgress?.({ completedRuns: i + 1, totalRuns: monteCarloRuns });
  }

  const primaryRun = runs[0];

  // Compute quantiles
  const days = scenario.days;
  const infectionQuantiles = computeQuantiles(
    runs,
    (r, d) => d < r.metrics.length ? r.metrics[d].newInfections : 0,
    days,
  );
  const hospQuantiles = computeQuantiles(
    runs,
    (r, d) => d < r.metrics.length ? r.metrics[d].newHospitalizations : 0,
    days,
  );
  const deathQuantiles = computeQuantiles(
    runs,
    (r, d) => d < r.metrics.length ? r.metrics[d].newDeaths : 0,
    days,
  );

  return {
    scenario,
    primaryRun,
    monteCarloRuns: runs,
    quantiles: {
      infections: infectionQuantiles,
      hospitalizations: hospQuantiles,
      deaths: deathQuantiles,
    },
    impliedR0,
    calibratedBeta: beta,
    timestamp: new Date().toISOString(),
  };
}
