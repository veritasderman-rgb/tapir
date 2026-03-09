import { create } from 'zustand';
import {
  type GameScenario,
  type SimCheckpoint,
  type TurnAction,
  type TurnReport,
  type DailyMetrics,
  type PopulationState,
  type VaccinationPriority,
} from '@tapir/core';
import { initGame, stepTurn, decodeGameScenario } from '@tapir/core';

export interface TurnHistoryEntry {
  turnNumber: number;
  action: TurnAction;
  report: TurnReport;
  metrics: DailyMetrics[];
  states: PopulationState[];
  checkpointBefore: SimCheckpoint;
}

export interface GameState {
  // Game setup
  gameScenario: GameScenario | null;
  gamePhase: 'idle' | 'playing' | 'finished' | 'debrief';

  // Turn state
  currentTurn: number;
  checkpoint: SimCheckpoint | null;
  turnHistory: TurnHistoryEntry[];

  // Student's current action draft
  activeMeasureIds: string[];
  vaccinationPriority: VaccinationPriority | null;

  // Last turn report (for debrief modal)
  lastTurnReport: TurnReport | null;
  showDebrief: boolean;

  // Load error
  loadError: string | null;

  // Actions
  loadScenario: (encoded: string) => void;
  startGame: (gameScenario: GameScenario) => void;
  submitTurn: () => void;
  dismissDebrief: () => void;
  finishGame: () => void;
  enterDebrief: () => void;
  resetGame: () => void;

  // Measure management
  toggleMeasure: (measureId: string) => void;
  setActiveMeasures: (ids: string[]) => void;
  setVaccinationPriority: (priority: VaccinationPriority | null) => void;

  // Computed helpers
  allMetrics: () => DailyMetrics[];
  allStates: () => PopulationState[];
  unlockedMeasureIds: () => string[];
}

export const useGameStore = create<GameState>((set, get) => ({
  gameScenario: null,
  gamePhase: 'idle',
  currentTurn: 0,
  checkpoint: null,
  turnHistory: [],
  activeMeasureIds: [],
  vaccinationPriority: null,
  lastTurnReport: null,
  showDebrief: false,

  loadError: null as string | null,

  loadScenario: (encoded: string) => {
    try {
      const gs = decodeGameScenario(encoded);
      set({ loadError: null });
      get().startGame(gs);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Failed to decode scenario:', msg);
      set({ loadError: msg });
    }
  },

  startGame: (gameScenario: GameScenario) => {
    const checkpoint = initGame(gameScenario);
    set({
      gameScenario,
      gamePhase: 'playing',
      currentTurn: 0,
      checkpoint,
      turnHistory: [],
      activeMeasureIds: [],
      vaccinationPriority: null,
      lastTurnReport: null,
      showDebrief: false,
    });
  },

  submitTurn: () => {
    const { checkpoint, gameScenario, currentTurn, activeMeasureIds, vaccinationPriority } = get();
    if (!checkpoint || !gameScenario) return;

    const nextTurn = currentTurn + 1;
    const action: TurnAction = { activeMeasureIds, vaccinationPriority };

    const result = stepTurn(checkpoint, gameScenario, action, nextTurn);

    const historyEntry: TurnHistoryEntry = {
      turnNumber: nextTurn,
      action,
      report: result.turnReport,
      metrics: result.metrics,
      states: result.states,
      checkpointBefore: checkpoint,
    };

    const isLastTurn = nextTurn >= gameScenario.totalTurns;

    set({
      currentTurn: nextTurn,
      checkpoint: result.checkpoint,
      turnHistory: [...get().turnHistory, historyEntry],
      lastTurnReport: result.turnReport,
      showDebrief: true,
      gamePhase: isLastTurn ? 'finished' : 'playing',
    });
  },

  dismissDebrief: () => set({ showDebrief: false }),

  finishGame: () => set({ gamePhase: 'finished' }),

  enterDebrief: () => set({ gamePhase: 'debrief' }),

  resetGame: () => set({
    gameScenario: null,
    gamePhase: 'idle',
    currentTurn: 0,
    checkpoint: null,
    turnHistory: [],
    activeMeasureIds: [],
    vaccinationPriority: null,
    lastTurnReport: null,
    showDebrief: false,
  }),

  toggleMeasure: (measureId: string) => set((s) => {
    const ids = s.activeMeasureIds;
    if (ids.includes(measureId)) {
      return { activeMeasureIds: ids.filter(id => id !== measureId) };
    }
    return { activeMeasureIds: [...ids, measureId] };
  }),

  setActiveMeasures: (ids) => set({ activeMeasureIds: ids }),

  setVaccinationPriority: (priority) => set({ vaccinationPriority: priority }),

  allMetrics: () => {
    return get().turnHistory.flatMap(h => h.metrics);
  },

  allStates: () => {
    return get().turnHistory.flatMap(h => h.states);
  },

  unlockedMeasureIds: () => {
    const { checkpoint } = get();
    return checkpoint?.unlockedMeasureIds ?? [];
  },
}));
