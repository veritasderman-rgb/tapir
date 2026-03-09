import { create } from 'zustand';
import {
  type GameScenario,
  type SimCheckpoint,
  type TurnAction,
  type MonthlyReport,
  type DailyMetrics,
  type PopulationState,
  type NPIConfig,
  NPIType,
  ComplianceModel,
} from '@tapir/core';
import { initGame, stepTurn, decodeGameScenario } from '@tapir/core';

export interface TurnHistoryEntry {
  month: number;
  action: TurnAction;
  report: MonthlyReport;
  metrics: DailyMetrics[];
  states: PopulationState[];
  checkpointBefore: SimCheckpoint;
}

export interface GameState {
  // Game setup
  gameScenario: GameScenario | null;
  gamePhase: 'idle' | 'playing' | 'finished' | 'debrief';

  // Turn state
  currentMonth: number;
  checkpoint: SimCheckpoint | null;
  turnHistory: TurnHistoryEntry[];

  // Student's current action draft
  pendingNPIs: NPIConfig[];
  vaccinationEnabled: boolean;

  // Unlocks (from hidden events)
  vaccinationUnlocked: boolean;

  // Debrief modal
  lastReport: MonthlyReport | null;
  showDebrief: boolean;

  // Actions
  loadScenario: (encoded: string) => void;
  startGame: (gameScenario: GameScenario) => void;
  submitTurn: () => void;
  dismissDebrief: () => void;
  finishGame: () => void;
  enterDebrief: () => void;
  resetGame: () => void;

  // NPI management
  addNPI: (npi: NPIConfig) => void;
  removeNPI: (id: string) => void;
  updateNPI: (id: string, partial: Partial<NPIConfig>) => void;
  setVaccinationEnabled: (v: boolean) => void;

  // Computed helpers
  allMetrics: () => DailyMetrics[];
  allStates: () => PopulationState[];
}

export const useGameStore = create<GameState>((set, get) => ({
  gameScenario: null,
  gamePhase: 'idle',
  currentMonth: 0,
  checkpoint: null,
  turnHistory: [],
  pendingNPIs: [],
  vaccinationEnabled: false,
  vaccinationUnlocked: false,
  lastReport: null,
  showDebrief: false,

  loadScenario: (encoded: string) => {
    try {
      const gs = decodeGameScenario(encoded);
      get().startGame(gs);
    } catch (e) {
      console.error('Failed to decode scenario:', e);
    }
  },

  startGame: (gameScenario: GameScenario) => {
    const checkpoint = initGame(gameScenario);
    set({
      gameScenario,
      gamePhase: 'playing',
      currentMonth: 0,
      checkpoint,
      turnHistory: [],
      pendingNPIs: [],
      vaccinationEnabled: false,
      vaccinationUnlocked: !gameScenario.vaccinationLocked,
      lastReport: null,
      showDebrief: false,
    });
  },

  submitTurn: () => {
    const { checkpoint, gameScenario, currentMonth, pendingNPIs, vaccinationEnabled } = get();
    if (!checkpoint || !gameScenario) return;

    const nextMonth = currentMonth + 1;
    const action: TurnAction = { npis: pendingNPIs, vaccinationEnabled };

    const result = stepTurn(checkpoint, gameScenario, action, nextMonth);

    // Check for vaccine_unlock event
    let vacUnlocked = get().vaccinationUnlocked;
    for (const event of gameScenario.hiddenEvents) {
      if (event.month === nextMonth && event.type === 'vaccine_unlock') {
        vacUnlocked = true;
      }
    }

    const historyEntry: TurnHistoryEntry = {
      month: nextMonth,
      action,
      report: result.monthlyReport,
      metrics: result.metrics,
      states: result.states,
      checkpointBefore: checkpoint,
    };

    const isLastMonth = nextMonth >= gameScenario.durationMonths;

    set({
      currentMonth: nextMonth,
      checkpoint: result.checkpoint,
      turnHistory: [...get().turnHistory, historyEntry],
      lastReport: result.monthlyReport,
      showDebrief: true,
      vaccinationUnlocked: vacUnlocked,
      gamePhase: isLastMonth ? 'finished' : 'playing',
    });
  },

  dismissDebrief: () => set({ showDebrief: false }),

  finishGame: () => set({ gamePhase: 'finished' }),

  enterDebrief: () => set({ gamePhase: 'debrief' }),

  resetGame: () => set({
    gameScenario: null,
    gamePhase: 'idle',
    currentMonth: 0,
    checkpoint: null,
    turnHistory: [],
    pendingNPIs: [],
    vaccinationEnabled: false,
    vaccinationUnlocked: false,
    lastReport: null,
    showDebrief: false,
  }),

  addNPI: (npi) => set((s) => ({ pendingNPIs: [...s.pendingNPIs, npi] })),
  removeNPI: (id) => set((s) => ({ pendingNPIs: s.pendingNPIs.filter(n => n.id !== id) })),
  updateNPI: (id, partial) => set((s) => ({
    pendingNPIs: s.pendingNPIs.map(n => n.id === id ? { ...n, ...partial } : n),
  })),
  setVaccinationEnabled: (v) => set({ vaccinationEnabled: v }),

  allMetrics: () => {
    return get().turnHistory.flatMap(h => h.metrics);
  },

  allStates: () => {
    return get().turnHistory.flatMap(h => h.states);
  },
}));
