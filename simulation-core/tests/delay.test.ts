import { describe, it, expect } from 'vitest';
import { gammaDelayPMF, DelayBuffer, createDelayBuffers } from '../src/delay-engine';
import { defaultDelayConfig } from '../src/delay-engine';

describe('gammaDelayPMF', () => {
  it('should sum to approximately 1.0', () => {
    const pmf = gammaDelayPMF(3, 7, 60);
    const sum = pmf.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 2);
  });

  it('should have mode near the expected value for k > 1', () => {
    const pmf = gammaDelayPMF(3, 7, 60);
    const maxIdx = pmf.indexOf(Math.max(...pmf));
    // Mode of Gamma(k, θ) = (k-1)*θ = 2 * (7/3) ≈ 4.67
    // So peak should be around day 4-5
    expect(maxIdx).toBeGreaterThanOrEqual(3);
    expect(maxIdx).toBeLessThanOrEqual(7);
  });

  it('should handle instant delay (stages=0)', () => {
    const pmf = gammaDelayPMF(0, 0, 10);
    expect(pmf[0]).toBe(1);
    expect(pmf.slice(1).every(v => v === 0)).toBe(true);
  });

  it('should produce different shapes for different k values', () => {
    const pmfLow = gammaDelayPMF(1, 7, 60);  // Exponential (more spread)
    const pmfHigh = gammaDelayPMF(10, 7, 60); // More concentrated
    // Higher k → sharper peak → higher max value
    expect(Math.max(...pmfHigh)).toBeGreaterThan(Math.max(...pmfLow));
  });

  it('should shift peak with different means', () => {
    const pmf5 = gammaDelayPMF(3, 5, 60);
    const pmf15 = gammaDelayPMF(3, 15, 60);
    const peak5 = pmf5.indexOf(Math.max(...pmf5));
    const peak15 = pmf15.indexOf(Math.max(...pmf15));
    expect(peak15).toBeGreaterThan(peak5);
  });
});

describe('DelayBuffer', () => {
  it('should delay output relative to input', () => {
    // PMF with all weight on day 3
    const pmf = new Array(10).fill(0);
    pmf[3] = 1;
    const buffer = new DelayBuffer(pmf);

    // Push 100 on day 0, expect 0 output for days 0-2, then 100 on day 3
    expect(buffer.pushAndGet(100)).toBe(0); // day 0
    expect(buffer.pushAndGet(0)).toBe(0);   // day 1
    expect(buffer.pushAndGet(0)).toBe(0);   // day 2
    expect(buffer.pushAndGet(0)).toBe(100); // day 3
    expect(buffer.pushAndGet(0)).toBe(0);   // day 4
  });

  it('should convolve multiple inputs correctly', () => {
    // PMF: 50% on day 0, 50% on day 1
    const pmf = [0.5, 0.5, 0, 0, 0];
    const buffer = new DelayBuffer(pmf);

    const out0 = buffer.pushAndGet(100); // day 0: 100 * 0.5 = 50
    expect(out0).toBeCloseTo(50, 1);

    const out1 = buffer.pushAndGet(200); // day 1: 200*0.5 + 100*0.5 = 150
    expect(out1).toBeCloseTo(150, 1);

    const out2 = buffer.pushAndGet(0);   // day 2: 0*0.5 + 200*0.5 = 100
    expect(out2).toBeCloseTo(100, 1);
  });

  it('should conserve total output over time', () => {
    const pmf = gammaDelayPMF(3, 7, 60);
    const buffer = new DelayBuffer(pmf);

    // Push 1000 on day 0, then collect output over 60 days
    let totalOutput = buffer.pushAndGet(1000);
    for (let d = 1; d < 60; d++) {
      totalOutput += buffer.pushAndGet(0);
    }
    expect(totalOutput).toBeCloseTo(1000, 0);
  });

  it('should reset correctly', () => {
    const pmf = [0, 0, 1, 0, 0];
    const buffer = new DelayBuffer(pmf);
    buffer.pushAndGet(100);
    buffer.reset();
    // After reset, buffer should be empty
    expect(buffer.pushAndGet(0)).toBe(0);
    expect(buffer.pushAndGet(0)).toBe(0);
  });
});

describe('createDelayBuffers', () => {
  it('should create 6 buffer sets (one per stratum)', () => {
    const buffers = createDelayBuffers(defaultDelayConfig());
    expect(buffers).toHaveLength(6);
    expect(buffers[0].onsetToHosp).toBeInstanceOf(DelayBuffer);
    expect(buffers[0].hospLoS).toBeInstanceOf(DelayBuffer);
    expect(buffers[0].icuLoS).toBeInstanceOf(DelayBuffer);
  });
});
