import { describe, it, expect } from 'vitest';
import { ReportingPipeline, defaultReportingConfig } from '../src/reporting';

describe('ReportingPipeline', () => {
  it('should reduce observed infections by detection rate', () => {
    const pipeline = new ReportingPipeline({
      detectionRate: 0.5,
      reportingDelayMean: 0, // no delay for this test
      reportingDelayStages: 0,
    });

    // With zero delay, all weight is on day 0 → immediate output
    const result = pipeline.processDay(1000, 500);
    expect(result.observedNewInfections).toBeCloseTo(500, 0);
  });

  it('observed should always be <= true infections', () => {
    const pipeline = new ReportingPipeline(defaultReportingConfig());
    let totalTrue = 0;
    let totalObserved = 0;

    // Simulate 100 days with a peak
    for (let d = 0; d < 100; d++) {
      const trueInf = d < 50 ? d * 100 : (100 - d) * 100;
      const result = pipeline.processDay(Math.max(0, trueInf), Math.max(0, trueInf * 0.03));
      totalTrue += Math.max(0, trueInf);
      totalObserved += result.observedNewInfections;
    }

    // Observed should be approximately detectionRate * true (with delay redistribution)
    expect(totalObserved).toBeLessThan(totalTrue);
    // Should be roughly 30% of true (default detection rate)
    expect(totalObserved / totalTrue).toBeCloseTo(0.3, 1);
  });

  it('should delay the observed peak', () => {
    const pipeline = new ReportingPipeline({
      detectionRate: 1.0, // 100% detection to isolate delay effect
      reportingDelayMean: 5,
      reportingDelayStages: 3,
    });

    const trueValues: number[] = [];
    const observedValues: number[] = [];

    // Simulate a sharp peak on day 20
    for (let d = 0; d < 60; d++) {
      const trueInf = d === 20 ? 1000 : 0;
      const result = pipeline.processDay(trueInf, 0);
      trueValues.push(trueInf);
      observedValues.push(result.observedNewInfections);
    }

    // True peak is at day 20
    const truePeakDay = trueValues.indexOf(Math.max(...trueValues));
    expect(truePeakDay).toBe(20);

    // Observed peak should be delayed
    const observedPeakDay = observedValues.indexOf(Math.max(...observedValues));
    expect(observedPeakDay).toBeGreaterThan(truePeakDay);
    expect(observedPeakDay).toBeLessThanOrEqual(truePeakDay + 10);
  });

  it('should pass hospitalizations through without detection rate reduction', () => {
    const pipeline = new ReportingPipeline({
      detectionRate: 0.1, // very low detection
      reportingDelayMean: 0,
      reportingDelayStages: 0,
    });

    const result = pipeline.processDay(1000, 100);
    // Hospitalizations should be reported fully (only delayed, not reduced by detection rate)
    expect(result.observedNewHospitalizations).toBeCloseTo(100, 0);
  });

  it('should clamp detection rate to [0,1]', () => {
    const pipeline = new ReportingPipeline({
      detectionRate: 1.5, // over 1
      reportingDelayMean: 0,
      reportingDelayStages: 0,
    });

    const result = pipeline.processDay(1000, 500);
    expect(result.observedNewInfections).toBeCloseTo(1000, 0);
  });
});
