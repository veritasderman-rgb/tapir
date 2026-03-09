import { describe, it, expect } from 'vitest';
import {
  stepSocialCapital,
  socialCapitalComplianceMultiplier,
  computeSocialCapitalDelta,
  getNPIMonthlyCost,
  defaultSocialCapitalConfig,
} from '../src/social-capital';
import { NPIType, ComplianceModel, type NPIConfig } from '../src/types';

function makeNPI(name: string): NPIConfig {
  return {
    id: 'test-npi',
    name,
    type: NPIType.BetaMultiplier,
    startDay: 0,
    endDay: 30,
    value: 0.7,
    compliance: { model: ComplianceModel.ExponentialDecay, initial: 1.0, decayRate: 0 },
  };
}

describe('Social Capital', () => {
  const config = defaultSocialCapitalConfig();

  describe('computeSocialCapitalDelta', () => {
    it('should drain capital when NPIs are active', () => {
      const npis = [makeNPI('school_closure')];
      const delta = computeSocialCapitalDelta(npis, 100, config);
      expect(delta).toBeLessThan(0);
    });

    it('should recover when no NPIs active', () => {
      const delta = computeSocialCapitalDelta([], 50, config);
      expect(delta).toBeGreaterThan(0);
    });

    it('should not recover above initial', () => {
      const delta = computeSocialCapitalDelta([], 100, config);
      expect(delta).toBe(0);
    });

    it('should drain more with multiple NPIs', () => {
      const one = computeSocialCapitalDelta([makeNPI('mask_mandate')], 100, config);
      const two = computeSocialCapitalDelta([makeNPI('mask_mandate'), makeNPI('school_closure')], 100, config);
      expect(two).toBeLessThan(one);
    });
  });

  describe('stepSocialCapital', () => {
    it('should decrease capital with active NPIs over multiple days', () => {
      const npis = [makeNPI('school_closure'), makeNPI('community_lockdown')];
      let capital = 100;
      for (let d = 0; d < 30; d++) {
        capital = stepSocialCapital(capital, npis, config);
      }
      expect(capital).toBeLessThan(100);
      expect(capital).toBeGreaterThan(0);
    });

    it('should not go below 0', () => {
      const npis = [makeNPI('community_lockdown'), makeNPI('school_closure'), makeNPI('travel_ban')];
      let capital = 5;
      for (let d = 0; d < 100; d++) {
        capital = stepSocialCapital(capital, npis, config);
      }
      expect(capital).toBe(0);
    });

    it('should recover to initial when no NPIs', () => {
      let capital = 30;
      for (let d = 0; d < 300; d++) {
        capital = stepSocialCapital(capital, [], config);
      }
      expect(capital).toBe(config.initial);
    });
  });

  describe('socialCapitalComplianceMultiplier', () => {
    it('should return 1.0 above threshold', () => {
      expect(socialCapitalComplianceMultiplier(50, 20)).toBe(1.0);
      expect(socialCapitalComplianceMultiplier(20, 20)).toBe(1.0);
    });

    it('should return quadratic drop below threshold', () => {
      // At capital=10, threshold=20: (10/20)^2 = 0.25
      expect(socialCapitalComplianceMultiplier(10, 20)).toBeCloseTo(0.25, 4);
    });

    it('should return 0 at capital=0', () => {
      expect(socialCapitalComplianceMultiplier(0, 20)).toBe(0);
    });

    it('should be monotonically increasing', () => {
      const threshold = 20;
      let prev = 0;
      for (let c = 0; c <= 25; c++) {
        const mult = socialCapitalComplianceMultiplier(c, threshold);
        expect(mult).toBeGreaterThanOrEqual(prev);
        prev = mult;
      }
    });
  });

  describe('getNPIMonthlyCost', () => {
    it('should return known cost for school_closure', () => {
      const cost = getNPIMonthlyCost(makeNPI('school_closure'));
      expect(cost).toBeCloseTo(15, 0);
    });

    it('should return default cost for unknown NPI', () => {
      const cost = getNPIMonthlyCost(makeNPI('something_unusual'));
      expect(cost).toBeGreaterThan(0);
    });
  });
});
