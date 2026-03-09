import { describe, it, expect } from 'vitest';
import { initGame, stepTurn } from '../src/step-runner';
import { defaultScenario, defaultDelayConfig, defaultReportingConfig } from '../src/scenario-schema';
import { defaultSocialCapitalConfig } from '../src/social-capital';
import { defaultMeasureIds } from '../src/measure-catalog';
import {
  type GameScenario,
  type TurnAction,
  type SimCheckpoint,
} from '../src/types';

function makeGameScenario(overrides?: Partial<GameScenario>): GameScenario {
  const base = defaultScenario();
  base.days = 336; // 24 turns × 14 days
  base.delayConfig = defaultDelayConfig();
  base.reportingConfig = defaultReportingConfig();

  return {
    baseScenario: base,
    totalTurns: 24,
    daysPerTurn: 14,
    hiddenEvents: [],
    socialCapital: defaultSocialCapitalConfig(),
    availableMeasureIds: defaultMeasureIds(),
    vaccinationLocked: true,
    ...overrides,
  };
}

function noAction(): TurnAction {
  return { activeMeasureIds: [], vaccinationPriority: null };
}

describe('Step Runner v2', () => {
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
      expect(checkpoint.economicState.gdpImpact).toBe(0);
      expect(checkpoint.economicState.businessConfidence).toBe(80);
      expect(checkpoint.effectiveDetectionRate).toBeGreaterThan(0);
      expect(checkpoint.unlockedMeasureIds.length).toBeGreaterThan(0);
      expect(checkpoint.vaccinationCapacity).toBe(0);
      expect(checkpoint.intelQuality).toBe(1.0);
    });

    it('should only initially unlock "always" measures', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      // Vaccination measures require event_triggered → should NOT be unlocked
      expect(checkpoint.unlockedMeasureIds).not.toContain('vaccination_slow');
      expect(checkpoint.unlockedMeasureIds).not.toContain('vaccination_fast');

      // Mask recommendation is always unlocked
      expect(checkpoint.unlockedMeasureIds).toContain('mask_recommendation');
    });
  });

  describe('stepTurn', () => {
    it('should advance by daysPerTurn (14) days', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);

      expect(result.checkpoint.populationState.day).toBe(14);
      expect(result.metrics).toHaveLength(14);
      expect(result.states).toHaveLength(14);
    });

    it('should produce a turn report with all required fields', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);
      const r = result.turnReport;

      expect(r.turnNumber).toBe(1);
      expect(r.dateLabel).toBeTruthy();
      expect(r.trueInfections).toBeGreaterThanOrEqual(0);
      expect(r.observedInfections).toBeGreaterThanOrEqual(0);
      expect(r.newDeaths).toBeGreaterThanOrEqual(0);
      expect(r.cumulativeDeaths).toBeGreaterThanOrEqual(0);
      expect(r.estimatedReff).toBeGreaterThan(0);
      expect(r.trueReff).toBeGreaterThan(0);
      expect(r.socialCapital).toBeGreaterThanOrEqual(0);
      expect(r.hospitalOccupancy).toBeGreaterThanOrEqual(0);
      expect(r.hospitalCapacity).toBeGreaterThan(0);
      expect(r.icuCapacity).toBeGreaterThan(0);
      expect(r.economicState).toBeDefined();
      expect(r.advisorMessages).toHaveLength(3); // epi, econ, political
      expect(r.headlines.length).toBeGreaterThan(0);
      expect(Array.isArray(r.newlyUnlockedMeasures)).toBe(true);
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
      expect(result2.states[0].day).toBe(15); // day 14 → day 15
    });

    it('should drain social capital when measures are active', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      const action: TurnAction = {
        activeMeasureIds: ['lockdown_full'], // 18 political cost per turn
        vaccinationPriority: null,
      };

      const result = stepTurn(checkpoint, gs, action, 1);
      expect(result.turnReport.socialCapital).toBeLessThan(100);
    });

    it('should provide observed infections less than or equal to true infections', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);

      // With 30% detection rate default, observed should be less than true
      expect(result.turnReport.observedInfections).toBeLessThanOrEqual(
        result.turnReport.trueInfections,
      );
    });

    it('should handle hidden events (variant shock)', () => {
      const gs = makeGameScenario({
        hiddenEvents: [{
          id: 'variant-1',
          type: 'variant_shock',
          turn: 1,
          label: 'Omicron-like variant',
          payload: { transmissibilityMultiplier: 1.5, immuneEscape: 0.1 },
        }],
      });

      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);

      expect(result.turnReport.activatedEvents.length).toBe(1);
      expect(result.turnReport.activatedEvents[0].label).toBe('Omicron-like variant');
    });

    it('should produce deterministic results with same checkpoint', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      const result1 = stepTurn(checkpoint, gs, noAction(), 1);
      const result2 = stepTurn(checkpoint, gs, noAction(), 1);

      // Same input → same output
      expect(result1.turnReport.trueInfections).toBe(result2.turnReport.trueInfections);
      expect(result1.turnReport.newDeaths).toBe(result2.turnReport.newDeaths);
      expect(result1.checkpoint.populationState.strata[0].S)
        .toBe(result2.checkpoint.populationState.strata[0].S);
    });

    it('lockdown should reduce infections compared to no-action', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      const lockdownAction: TurnAction = {
        activeMeasureIds: ['lockdown_full'],
        vaccinationPriority: null,
      };

      // Run 3 turns with and without lockdown
      let cpNoAction = checkpoint;
      let totalInfNoAction = 0;
      for (let t = 1; t <= 3; t++) {
        const r = stepTurn(cpNoAction, gs, noAction(), t);
        totalInfNoAction += r.turnReport.trueInfections;
        cpNoAction = r.checkpoint;
      }

      let cpLockdown = checkpoint;
      let totalInfLockdown = 0;
      for (let t = 1; t <= 3; t++) {
        const r = stepTurn(cpLockdown, gs, lockdownAction, t);
        totalInfLockdown += r.turnReport.trueInfections;
        cpLockdown = r.checkpoint;
      }

      expect(totalInfLockdown).toBeLessThan(totalInfNoAction);
    });

    it('should track economic impact of measures', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      const expensiveAction: TurnAction = {
        activeMeasureIds: ['lockdown_full', 'school_closure_full'],
        vaccinationPriority: null,
      };

      const result = stepTurn(checkpoint, gs, expensiveAction, 1);
      const econ = result.turnReport.economicState;

      expect(econ.gdpImpact).toBeLessThan(0); // GDP loss
      expect(econ.fiscalCost).toBeGreaterThan(0);
    });

    it('should generate 3 advisor messages per turn', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);

      const advisors = result.turnReport.advisorMessages;
      expect(advisors).toHaveLength(3);

      const roles = advisors.map(a => a.role);
      expect(roles).toContain('epidemiologist');
      expect(roles).toContain('economist');
      expect(roles).toContain('politician');

      for (const a of advisors) {
        expect(a.name).toBeTruthy();
        expect(a.message).toBeTruthy();
        expect(['low', 'medium', 'high', 'critical']).toContain(a.urgency);
      }
    });

    it('public_unrest event should reduce social capital', () => {
      const gs = makeGameScenario({
        hiddenEvents: [{
          id: 'unrest-1',
          type: 'public_unrest',
          turn: 1,
          label: 'Public unrest',
          payload: { penalty: 20 },
        }],
      });

      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);

      // Social capital should be reduced by the penalty (may partially recover during turn)
      expect(result.turnReport.socialCapital).toBeLessThan(100);
    });

    it('vaccine_unlock event should unlock vaccination measures', () => {
      const gs = makeGameScenario({
        hiddenEvents: [{
          id: 'vax-1',
          type: 'vaccine_unlock',
          turn: 1,
          label: 'Vakcína dostupná',
          payload: {},
        }],
      });

      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);

      // After vaccine_unlock, vaccination measures should be unlocked
      expect(result.checkpoint.unlockedMeasureIds).toContain('vaccination_slow');
      expect(result.checkpoint.unlockedMeasureIds).toContain('vaccination_fast');
      expect(result.checkpoint.unlockedMeasureIds).toContain('vaccination_max');
    });

    it('WHO consultation should improve intel quality', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      const whoAction: TurnAction = {
        activeMeasureIds: ['who_consultation'],
        vaccinationPriority: null,
      };

      const result = stepTurn(checkpoint, gs, whoAction, 1);
      expect(result.checkpoint.intelQuality).toBeLessThan(checkpoint.intelQuality);
    });

    it('mass testing should improve detection rate', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      // Mass testing unlocks at turn 3, so test with testing_basic (always unlocked)
      const testAction: TurnAction = {
        activeMeasureIds: ['testing_basic'],
        vaccinationPriority: null,
      };

      const result = stepTurn(checkpoint, gs, testAction, 1);
      expect(result.checkpoint.effectiveDetectionRate).toBeGreaterThan(
        checkpoint.effectiveDetectionRate,
      );
    });

    it('business_support should gain social capital (negative political cost)', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      // Run a turn with some expensive measures + business support
      const actionWithSupport: TurnAction = {
        activeMeasureIds: ['lockdown_full', 'business_support'],
        vaccinationPriority: null,
      };
      const actionWithout: TurnAction = {
        activeMeasureIds: ['lockdown_full'],
        vaccinationPriority: null,
      };

      const resultWith = stepTurn(checkpoint, gs, actionWithSupport, 1);
      const resultWithout = stepTurn(checkpoint, gs, actionWithout, 1);

      // Business support offsets some political cost
      expect(resultWith.turnReport.socialCapital).toBeGreaterThan(
        resultWithout.turnReport.socialCapital,
      );
    });

    it('multi-turn sequence should accumulate effects', () => {
      const gs = makeGameScenario();
      let cp = initGame(gs);

      // Run 5 turns with no action
      for (let t = 1; t <= 5; t++) {
        const r = stepTurn(cp, gs, noAction(), t);
        cp = r.checkpoint;

        // Day should advance correctly
        expect(cp.populationState.day).toBe(t * 14);
      }
    });
  });
});
