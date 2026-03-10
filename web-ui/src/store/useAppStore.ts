import { create } from 'zustand';
import {
  type ScenarioConfig,
  type SimulationResult,
  type ValidationError,
  AppMode,
} from '@tapir/core';
import { defaultScenario } from '@tapir/core';

export interface AppState {
  // Auth/session
  auth: {
    role: 'teacher' | 'guest' | null;
    username: string | null;
    classId: string | null;
  };
  setAuth: (auth: AppState['auth']) => void;
  logout: () => void;

  // Mode
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;

  // Scenario
  scenario: ScenarioConfig;
  updateScenario: (partial: Partial<ScenarioConfig>) => void;
  setScenario: (scenario: ScenarioConfig) => void;

  // Comparison
  scenarioB: ScenarioConfig | null;
  setScenarioB: (scenario: ScenarioConfig | null) => void;
  resultB: SimulationResult | null;
  setResultB: (result: SimulationResult | null) => void;
  comparisonMode: boolean;
  setComparisonMode: (on: boolean) => void;

  // Results
  result: SimulationResult | null;
  setResult: (result: SimulationResult | null) => void;

  // Simulation status
  simStatus: 'idle' | 'running' | 'done' | 'error';
  setSimStatus: (status: 'idle' | 'running' | 'done' | 'error') => void;

  // Validation
  validationErrors: ValidationError[];
  setValidationErrors: (errors: ValidationError[]) => void;

  // UI state
  activeTab: 'parameters' | 'npis' | 'vaccination' | 'variants' | 'stochastic' | 'export';
  setActiveTab: (tab: AppState['activeTab']) => void;

  // Playback
  playbackDay: number;
  setPlaybackDay: (day: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Policy literacy panel
  policyLiteracyOpen: boolean;
  setPolicyLiteracyOpen: (open: boolean) => void;

  // View mode: true epidemiological state vs. observed (reported) cases
  viewMode: 'true' | 'observed' | 'both';
  setViewMode: (mode: 'true' | 'observed' | 'both') => void;

  // Instructor mode locks
  lockedParams: Set<string>;
  toggleLockedParam: (path: string) => void;
  hiddenEvents: boolean;
  setHiddenEvents: (hidden: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  auth: {
    role: null,
    username: null,
    classId: null,
  },
  setAuth: (auth) => set({ auth }),
  logout: () => set({
    auth: { role: null, username: null, classId: null },
    appMode: AppMode.Expert,
  }),

  appMode: AppMode.Expert,
  setAppMode: (mode) => set({ appMode: mode }),

  scenario: defaultScenario(),
  updateScenario: (partial) => set((s) => ({ scenario: { ...s.scenario, ...partial } })),
  setScenario: (scenario) => set({ scenario }),

  scenarioB: null,
  setScenarioB: (scenarioB) => set({ scenarioB }),
  resultB: null,
  setResultB: (resultB) => set({ resultB }),
  comparisonMode: false,
  setComparisonMode: (comparisonMode) => set({ comparisonMode }),

  result: null,
  setResult: (result) => set({ result }),

  simStatus: 'idle',
  setSimStatus: (simStatus) => set({ simStatus }),

  validationErrors: [],
  setValidationErrors: (validationErrors) => set({ validationErrors }),

  activeTab: 'parameters',
  setActiveTab: (activeTab) => set({ activeTab }),

  playbackDay: 0,
  setPlaybackDay: (playbackDay) => set({ playbackDay }),
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  policyLiteracyOpen: true,
  setPolicyLiteracyOpen: (policyLiteracyOpen) => set({ policyLiteracyOpen }),

  viewMode: 'both',
  setViewMode: (viewMode) => set({ viewMode }),

  lockedParams: new Set(),
  toggleLockedParam: (path) => set((s) => {
    const newLocked = new Set(s.lockedParams);
    if (newLocked.has(path)) newLocked.delete(path);
    else newLocked.add(path);
    return { lockedParams: newLocked };
  }),
  hiddenEvents: false,
  setHiddenEvents: (hiddenEvents) => set({ hiddenEvents }),
}));
