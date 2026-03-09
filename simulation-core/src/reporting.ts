/**
 * Reporting Engine — Models the gap between true epidemiological state
 * and what surveillance systems actually observe.
 *
 * Applies:
 * 1. Detection rate (fraction of true infections reported)
 * 2. Reporting delay (Gamma-distributed lag between onset and report)
 */

import { DelayBuffer, gammaDelayPMF } from './delay-engine';

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
