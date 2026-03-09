/**
 * Gamma Delay Engine — Convolutional delay kernel for realistic
 * clinical timelines (onset→hospitalization, hospitalization→discharge/death).
 *
 * Uses discrete Gamma PMF convolution instead of sub-compartments
 * for computational efficiency.
 */

import { NUM_STRATA } from './types';

// ---- Configuration ----

export interface DelayConfig {
  /** Onset-to-hospitalization: mean days */
  onsetToHospMean: number;
  /** Onset-to-hospitalization: Erlang shape k (stages) */
  onsetToHospStages: number;
  /** Hospitalization length-of-stay: mean days */
  hospLosMean: number;
  /** Hospitalization LoS: Erlang shape k */
  hospLosStages: number;
  /** ICU length-of-stay: mean days */
  icuLosMean: number;
  /** ICU LoS: Erlang shape k */
  icuLosStages: number;
}

export function defaultDelayConfig(): DelayConfig {
  return {
    onsetToHospMean: 7,
    onsetToHospStages: 3,
    hospLosMean: 10,
    hospLosStages: 4,
    icuLosMean: 14,
    icuLosStages: 3,
  };
}

// ---- Discrete Gamma PMF ----

/**
 * Compute the discrete PMF for Gamma(k, θ) where mean = k*θ.
 * Truncated to maxDays and renormalized so it sums to 1.
 *
 * Uses the regularized incomplete gamma function via iterative computation.
 */
export function gammaDelayPMF(stages: number, mean: number, maxDays: number): number[] {
  if (stages <= 0 || mean <= 0) {
    // Instant: all weight on day 0
    const pmf = new Array(maxDays).fill(0);
    pmf[0] = 1;
    return pmf;
  }

  const theta = mean / stages; // scale parameter
  const pmf = new Array(maxDays).fill(0);
  let sum = 0;

  for (let d = 0; d < maxDays; d++) {
    // Gamma PDF evaluated at d + 0.5 (midpoint of day interval) × 1-day width
    const x = d + 0.5;
    pmf[d] = gammaPDF(x, stages, theta);
    sum += pmf[d];
  }

  // Renormalize
  if (sum > 0) {
    for (let d = 0; d < maxDays; d++) {
      pmf[d] /= sum;
    }
  } else {
    pmf[0] = 1;
  }

  return pmf;
}

/**
 * Gamma probability density function.
 * f(x; k, θ) = x^(k-1) * exp(-x/θ) / (θ^k * Γ(k))
 */
function gammaPDF(x: number, k: number, theta: number): number {
  if (x <= 0) return 0;
  const logPDF = (k - 1) * Math.log(x) - x / theta - k * Math.log(theta) - logGamma(k);
  return Math.exp(logPDF);
}

/**
 * Log-gamma function using Stirling's approximation (Lanczos).
 */
function logGamma(z: number): number {
  // Lanczos approximation coefficients
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    // Reflection formula
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }

  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

// ---- Delay Buffer ----

/** Serializable snapshot of a DelayBuffer's internal state. */
export interface DelayBufferSnapshot {
  pmf: number[];
  buffer: number[];
  head: number;
}

/**
 * Ring buffer that convolves input with a discrete PMF to produce
 * delayed output. Used for modeling clinical delays.
 */
export class DelayBuffer {
  private readonly pmf: number[];
  private readonly buffer: number[];
  private head: number;

  constructor(pmf: number[]) {
    this.pmf = pmf;
    this.buffer = new Array(pmf.length).fill(0);
    this.head = 0;
  }

  /** Create a DelayBuffer from a serialized snapshot. */
  static fromSnapshot(snap: DelayBufferSnapshot): DelayBuffer {
    const db = new DelayBuffer(snap.pmf);
    for (let i = 0; i < snap.buffer.length; i++) {
      db.buffer[i] = snap.buffer[i];
    }
    db.head = snap.head;
    return db;
  }

  /** Serialize the buffer's internal state for checkpointing. */
  serialize(): DelayBufferSnapshot {
    return {
      pmf: [...this.pmf],
      buffer: [...this.buffer],
      head: this.head,
    };
  }

  /** Push new input and get the delayed output for this timestep. */
  pushAndGet(amount: number): number {
    // Store new input at current head position
    this.buffer[this.head] = amount;

    // Compute convolution output: sum over all past inputs × PMF weight
    let output = 0;
    for (let d = 0; d < this.pmf.length; d++) {
      // Index into buffer: head - d (wrapped)
      const idx = (this.head - d + this.buffer.length) % this.buffer.length;
      output += this.buffer[idx] * this.pmf[d];
    }

    // Advance head
    this.head = (this.head + 1) % this.buffer.length;

    return output;
  }

  /** Reset the buffer to all zeros. */
  reset(): void {
    this.buffer.fill(0);
    this.head = 0;
  }

  /** Get current total in the pipeline (sum of buffer × survival). */
  getInTransit(): number {
    let inTransit = 0;
    for (let d = 0; d < this.buffer.length; d++) {
      const idx = (this.head - 1 - d + this.buffer.length) % this.buffer.length;
      // Survival probability at day d = 1 - CDF(d) ≈ sum of PMF from d+1 onwards
      let survivalProb = 0;
      for (let k = d + 1; k < this.pmf.length; k++) {
        survivalProb += this.pmf[k];
      }
      inTransit += this.buffer[idx] * survivalProb;
    }
    return inTransit;
  }
}

// ---- Delay Buffer Set for a simulation ----

const MAX_DELAY_DAYS = 60;

/**
 * A set of delay buffers for one stratum:
 * - onsetToHosp: new infections → delayed hospitalizations
 * - hospLoS: new hospitalizations → delayed discharges
 * - icuLoS: new ICU admissions → delayed ICU discharges
 */
export interface StratumDelayBuffers {
  onsetToHosp: DelayBuffer;
  hospLoS: DelayBuffer;
  icuLoS: DelayBuffer;
}

/** Serializable snapshot of all delay buffers for one stratum. */
export interface StratumDelayBuffersSnapshot {
  onsetToHosp: DelayBufferSnapshot;
  hospLoS: DelayBufferSnapshot;
  icuLoS: DelayBufferSnapshot;
}

/** Serialize all stratum delay buffers for checkpointing. */
export function serializeDelayBuffers(buffers: StratumDelayBuffers[]): StratumDelayBuffersSnapshot[] {
  return buffers.map(b => ({
    onsetToHosp: b.onsetToHosp.serialize(),
    hospLoS: b.hospLoS.serialize(),
    icuLoS: b.icuLoS.serialize(),
  }));
}

/** Restore stratum delay buffers from a snapshot. */
export function restoreDelayBuffers(snapshots: StratumDelayBuffersSnapshot[]): StratumDelayBuffers[] {
  return snapshots.map(snap => ({
    onsetToHosp: DelayBuffer.fromSnapshot(snap.onsetToHosp),
    hospLoS: DelayBuffer.fromSnapshot(snap.hospLoS),
    icuLoS: DelayBuffer.fromSnapshot(snap.icuLoS),
  }));
}

/**
 * Create delay buffers for all strata.
 */
export function createDelayBuffers(config: DelayConfig): StratumDelayBuffers[] {
  const hospPMF = gammaDelayPMF(config.onsetToHospStages, config.onsetToHospMean, MAX_DELAY_DAYS);
  const losHospPMF = gammaDelayPMF(config.hospLosStages, config.hospLosMean, MAX_DELAY_DAYS);
  const losIcuPMF = gammaDelayPMF(config.icuLosStages, config.icuLosMean, MAX_DELAY_DAYS);

  const buffers: StratumDelayBuffers[] = [];
  for (let i = 0; i < NUM_STRATA; i++) {
    buffers.push({
      onsetToHosp: new DelayBuffer(hospPMF),
      hospLoS: new DelayBuffer(losHospPMF),
      icuLoS: new DelayBuffer(losIcuPMF),
    });
  }
  return buffers;
}
