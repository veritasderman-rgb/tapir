import { describe, it, expect } from 'vitest';
import { initGame, stepTurn } from '../src/step-runner';
import { defaultScenario, defaultDelayConfig, defaultReportingConfig } from '../src/scenario-schema';
import { defaultSocialCapitalConfig } from '../src/social-capital';
import {
  type GameScenario,
  type TurnAction,
  type SimCheckpoint,
  NPIType,
  ComplianceModel,
} from '../src/types';

function makeGameScenario(overrides?: Partial<GameScenario>): GameScenario {
  const base = defaultScenario();
  base.days = 360; // 12 months
  base.delayConfig = defaultDelayConfig();
  base.reportingConfig = defaultReportingConfig();

  return {
    baseScenario: base,
    durationMonths: 12,
    daysPerTurn: 30,
    hiddenEvents: [],
    socialCapital: defaultSocialCapitalConfig(),
    availableNPITypes: ['beta_multiplier'],
    vaccinationLocked: true,
    ...overrides,
  };
}

function noAction(): TurnAction {
  return { npis: [], vaccinationEnabled: false };
}

describe('Step Runner', () => {
  describe('initGame', () => {
    it('should create a valid initial checkpoint', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      expect(checkpoint.populationState.day).toBe(0);
      expect(checkpoint.calibratedBeta).toBeGreaterThan(0);
      expect(checkpoint.socialCapital).toBe(100);
      expect(checkpoint.delayBufferSnapshots).not.toBeNull();
      expect(checkpoint.reportingSnapshot).not.toBeNull();
      expect(checkpoint.variantActivationDays).toEqual([]);
    });
  });

  describe('stepTurn', () => {
    it('should advance by daysPerTurn days', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);

      expect(result.checkpoint.populationState.day).toBe(30);
      expect(result.metrics).toHaveLength(30);
      expect(result.states).toHaveLength(30);
    });

    it('should produce a monthly report', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);

      expect(result.monthlyReport.month).toBe(1);
      expect(result.monthlyReport.trueInfections).toBeGreaterThan(0);
      expect(result.monthlyReport.socialCapital).toBe(100); // no NPIs → no drain
    });

    it('should maintain continuity: state at end of turn N = start of turn N+1', () => {
      const gs = makeGameScenario();
      const cp0 = initGame(gs);

      const result1 = stepTurn(cp0, gs, noAction(), 1);
      const cp1 = result1.checkpoint;

      // The last state of turn 1 should match the population state in checkpoint
      const lastState = result1.states[result1.states.length - 1];
      expect(cp1.populationState.day).toBe(lastState.day);
      expect(cp1.populationState.strata[0].S).toBe(lastState.strata[0].S);
      expect(cp1.populationState.strata[0].I).toBe(lastState.strata[0].I);

      // Turn 2 should start from where turn 1 ended
      const result2 = stepTurn(cp1, gs, noAction(), 2);
      expect(result2.states[0].day).toBe(31); // day 30 → day 31
    });

    it('should drain social capital when NPIs are active', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      const action: TurnAction = {
        npis: [{
          id: 'test',
          name: 'school_closure',
          type: NPIType.BetaMultiplier,
          startDay: 0,
          endDay: 30,
          value: 0.7,
          compliance: { model: ComplianceModel.ExponentialDecay, initial: 1.0, decayRate: 0 },
        }],
        vaccinationEnabled: false,
      };

      const result = stepTurn(checkpoint, gs, action, 1);
      expect(result.monthlyReport.socialCapital).toBeLessThan(100);
    });

    it('should provide observed infections less than true infections', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);

      // With 30% detection rate default, observed should be less than true
      // (may not hold for very first days due to delay, but overall should)
      expect(result.monthlyReport.observedInfections).toBeLessThanOrEqual(
        result.monthlyReport.trueInfections,
      );
    });

    it('should handle hidden events (variant shock)', () => {
      const gs = makeGameScenario({
        hiddenEvents: [{
          id: 'variant-1',
          type: 'variant_shock',
          month: 1,
          label: 'Omicron-like variant',
          payload: { transmissibilityMultiplier: 1.5, immuneEscape: 0.1 },
        }],
      });

      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);

      expect(result.monthlyReport.activatedEvents).toContain('Omicron-like variant');
    });

    it('should produce deterministic results with same checkpoint', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      const result1 = stepTurn(checkpoint, gs, noAction(), 1);
      const result2 = stepTurn(checkpoint, gs, noAction(), 1);

      // Same input → same output
      expect(result1.monthlyReport.trueInfections).toBe(result2.monthlyReport.trueInfections);
      expect(result1.monthlyReport.newDeaths).toBe(result2.monthlyReport.newDeaths);
      expect(result1.checkpoint.populationState.strata[0].S)
        .toBe(result2.checkpoint.populationState.strata[0].S);
    });

    it('NPI should reduce infections compared to no-action', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      // Run 3 months without NPIs
      let cpNoNPI = checkpoint;
      for (let m = 1; m <= 3; m++) {
        cpNoNPI = stepTurn(cpNoNPI, gs, noAction(), m).checkpoint;
      }

      // Run 3 months with strong NPI
      let cpWithNPI = checkpoint;
      const npiAction: TurnAction = {
        npis: [{
          id: 'lockdown',
          name: 'community_lockdown',
          type: NPIType.BetaMultiplier,
          startDay: 0,
          endDay: 30,
          value: 0.5,
          compliance: { model: ComplianceModel.ExponentialDecay, initial: 1.0, decayRate: 0 },
        }],
        vaccinationEnabled: false,
      };
      let totalInfNPI = 0;
      let totalInfNoNPI_sum = 0;
      for (let m = 1; m <= 3; m++) {
        const r = stepTurn(cpWithNPI, gs, npiAction, m);
        totalInfNPI += r.monthlyReport.trueInfections;
        cpWithNPI = r.checkpoint;
      }

      // Re-run no-NPI to count infections
      cpNoNPI = checkpoint;
      for (let m = 1; m <= 3; m++) {
        const r = stepTurn(cpNoNPI, gs, noAction(), m);
        totalInfNoNPI_sum += r.monthlyReport.trueInfections;
        cpNoNPI = r.checkpoint;
      }

      expect(totalInfNPI).toBeLessThan(totalInfNoNPI_sum);
    });
  });
});
