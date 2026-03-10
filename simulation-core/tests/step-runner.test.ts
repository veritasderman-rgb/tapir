import { describe, it, expect } from 'vitest';
import { initGame, stepTurn } from '../src/step-runner';
import { defaultScenario } from '../src/scenario-schema';
import { type GameScenario, type TurnAction } from '../src/types';
import { MEASURE_CATALOG } from '../src/measure-catalog';

function makeGameScenario(overrides: Partial<GameScenario> = {}): GameScenario {
  return {
    baseScenario: defaultScenario(),
    totalTurns: 24,
    daysPerTurn: 14,
    hiddenEvents: [],
    socialCapital: { initial: 100, recoveryRate: 0.5, collapseThreshold: 20 },
    availableMeasureIds: MEASURE_CATALOG.map(m => m.id),
    vaccinationLocked: false,
    ...overrides,
  };
}

function noAction(): TurnAction {
  return {
    activeMeasureIds: [],
    vaccinationPriority: null,
  };
}

describe('Step Runner v2', () => {
  describe('initGame', () => {
    it('should create a valid initial checkpoint', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      expect(checkpoint.socialCapital).toBe(100);
      expect(checkpoint.populationState.day).toBe(0);
      expect(checkpoint.calibratedBeta).toBeGreaterThan(0);
      expect(Array.isArray(checkpoint.unlockedMeasureIds)).toBe(true);
    });

    it('should only initially unlock "always" measures', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      // School closure is always unlocked
      expect(checkpoint.unlockedMeasureIds).toContain('school_closure');
    });
  });

  describe('stepTurn', () => {
    it('should advance by daysPerTurn (14) days', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);
      const result = stepTurn(checkpoint, gs, noAction(), 1);

      expect(result.checkpoint.populationState.day).toBe(14);
      expect(result.metrics).toHaveLength(14);
      expect(result.states).toHaveLength(15); // initial + 14 days
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
      expect(r.advisorMessages.length).toBeGreaterThanOrEqual(3);
      expect(r.headlines.length).toBeGreaterThan(0);
    });

    it('should maintain continuity: state at end of turn N = start of turn N+1', () => {
      const gs = makeGameScenario();
      const cp0 = initGame(gs);

      const result1 = stepTurn(cp0, gs, noAction(), 1);
      const cp1 = result1.checkpoint;

      const lastState = result1.states[result1.states.length - 1];
      expect(cp1.populationState.day).toBe(lastState.day);

      const result2 = stepTurn(cp1, gs, noAction(), 2);
      expect(result2.states[0].day).toBe(14);
    });

    it('should drain social capital when measures are active', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      const action: TurnAction = {
        activeMeasureIds: ['community_lockdown'],
        vaccinationPriority: null,
      };

      const result = stepTurn(checkpoint, gs, action, 1);
      expect(result.turnReport.socialCapital).toBeLessThan(100);
    });

    it('should track economic impact of measures', () => {
      const gs = makeGameScenario();
      const checkpoint = initGame(gs);

      const expensiveAction: TurnAction = {
        activeMeasureIds: ['community_lockdown', 'school_closure'],
        vaccinationPriority: null,
      };

      const result = stepTurn(checkpoint, gs, expensiveAction, 1);
      const econ = result.turnReport.economicState;

      expect(econ.gdpImpact).toBeLessThan(0);
      expect(econ.fiscalCost).toBeGreaterThan(0);
    });

    it('should handle financial support request', () => {
        const gs = makeGameScenario();
        const cp = initGame(gs);
        cp.financialSupportApprovalChance = 1.0; // Force success

        const action: TurnAction = {
            activeMeasureIds: ['community_lockdown'],
            vaccinationPriority: null,
            requestFinancialSupport: true
        };

        const result = stepTurn(cp, gs, action, 1);
        expect(result.checkpoint.financialSupportGranted).toBe(true);
        // GDP impact should be better than without support

        const actionNoSupport: TurnAction = {
            activeMeasureIds: ['community_lockdown'],
            vaccinationPriority: null,
            requestFinancialSupport: false
        };
        const resultNoSupport = stepTurn(cp, gs, actionNoSupport, 1);

        expect(result.turnReport.economicState.gdpImpact).toBeGreaterThan(resultNoSupport.turnReport.economicState.gdpImpact);
    });
  });
});
