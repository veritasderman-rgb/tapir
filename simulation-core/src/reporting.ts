/**
 * Reporting Engine — Models the gap between true epidemiological state
 * and what surveillance systems actually observe.
 *
 * Applies:
 * 1. Detection rate (fraction of true infections reported)
 * 2. Reporting delay (Gamma-distributed lag between onset and report)
 */

import { DelayBuffer, type DelayBufferSnapshot, gammaDelayPMF } from './delay-engine';
import { solveFinalSize } from './calibration/final-size';

// ---- Configuration ----

export interface ReportingConfig {
  /** Fraction of true infections detected by surveillance [0,1] */
  detectionRate: number;
  /** Reporting delay: mean days from onset to case report */
  reportingDelayMean: number;
  /** Reporting delay: Erlang shape k */
  reportingDelayStages: number;
}

export function defaultReportingConfig(): ReportingConfig {
  return {
    detectionRate: 0.3,
    reportingDelayMean: 3,
    reportingDelayStages: 2,
  };
}

/** Serializable snapshot of ReportingPipeline state. */
export interface ReportingPipelineSnapshot {
  infectionBuffer: DelayBufferSnapshot;
  hospBuffer: DelayBufferSnapshot;
}

// ---- Reporting Pipeline ----

const MAX_REPORTING_DELAY = 30;

/**
 * Pipeline that transforms true daily counts into observed (reported) counts.
 * Applies detection rate + delay convolution.
 */
export class ReportingPipeline {
  private readonly detectionRate: number;
  private readonly infectionBuffer: DelayBuffer;
  private readonly hospBuffer: DelayBuffer;

  constructor(config: ReportingConfig) {
    this.detectionRate = Math.max(0, Math.min(1, config.detectionRate));
    const pmf = gammaDelayPMF(
      config.reportingDelayStages,
      config.reportingDelayMean,
      MAX_REPORTING_DELAY,
    );
    this.infectionBuffer = new DelayBuffer(pmf);
    this.hospBuffer = new DelayBuffer(pmf);
  }

  /** Serializable snapshot of internal state. */
  static fromSnapshot(config: ReportingConfig, snap: ReportingPipelineSnapshot): ReportingPipeline {
    const pipeline = new ReportingPipeline(config);
    // Replace the internal buffers with restored ones
    (pipeline as any).infectionBuffer = DelayBuffer.fromSnapshot(snap.infectionBuffer);
    (pipeline as any).hospBuffer = DelayBuffer.fromSnapshot(snap.hospBuffer);
    return pipeline;
  }

  /** Serialize internal state for checkpointing. */
  serialize(): ReportingPipelineSnapshot {
    return {
      infectionBuffer: (this.infectionBuffer as any).serialize(),
      hospBuffer: (this.hospBuffer as any).serialize(),
    };
  }

  /**
   * Process one day of true metrics, returning observed values.
   */
  processDay(trueNewInfections: number, trueNewHospitalizations: number): {
    observedNewInfections: number;
    observedNewHospitalizations: number;
  } {
    // Apply detection rate then delay
    const detectedInfections = trueNewInfections * this.detectionRate;
    const detectedHosp = trueNewHospitalizations; // hospitalizations are always observed

    return {
      observedNewInfections: this.infectionBuffer.pushAndGet(detectedInfections),
      observedNewHospitalizations: this.hospBuffer.pushAndGet(detectedHosp),
    };
  }
}

/**
 * Calculate the weighted IFR for the population.
 * @param ageFractions - population fractions per age group
 * @param riskFractions - population fractions in risk group per age group
 * @param stratumParams - epidemiological parameters per stratum
 */
export function calculateWeightedIFR(
  ageFractions: number[],
  riskFractions: number[],
  stratumParams: { ifr: number }[],
): number {
  let weightedIFR = 0;
  for (let ageIdx = 0; ageIdx < ageFractions.length; ageIdx++) {
    const agePopFraction = ageFractions[ageIdx];
    const riskFraction = riskFractions[ageIdx];

    // Stratum index for this age group:
    // i = 2 * ageIdx (standard)
    // i = 2 * ageIdx + 1 (risk)
    const standardIFR = stratumParams[2 * ageIdx].ifr;
    const riskIFR = stratumParams[2 * ageIdx + 1].ifr;

    const stratumIFR = standardIFR * (1 - riskFraction) + riskIFR * riskFraction;
    weightedIFR += stratumIFR * agePopFraction;
  }
  return weightedIFR;
}

/**
 * Calculate total potential deaths in a "No Action" baseline scenario.
 * @param R0 - basic reproduction number
 * @param populationSize - total population
 * @param weightedIFR - overall infection fatality rate
 */
export function calculateBaselineDeaths(
  R0: number,
  populationSize: number,
  weightedIFR: number,
): number {
  const z = solveFinalSize(R0);
  return populationSize * z * weightedIFR;
}
