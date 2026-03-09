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
    role: 'teacher' | 'student' | 'guest' | null;
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

  // Crisis game layer
  crisis: {
    trust: number;
    round: number;
    casualties: number;
    control: 'hygienik' | 'premier';
    governmentDownRounds: number;
    enteredCrisisStaff: boolean;
    initialPopupShown: boolean;
    popupQueue: Array<{
      id: string;
      title: string;
      body: string;
      variant?: 'news' | 'warning' | 'success';
      actionLabel?: string;
      action?: 'enterCrisisStaff' | 'close';
    }>;
  };
  enqueueCrisisPopup: (popup: AppState['crisis']['popupQueue'][number]) => void;
  dequeueCrisisPopup: () => void;
  applyTrustDelta: (delta: number) => void;
  registerSimulationOutcome: (casualties: number, hiddenEventsActive: boolean) => void;
  startGovernmentDowntime: () => void;
  advanceRound: () => void;
  enterCrisisStaff: () => void;
  markInitialPopupShown: () => void;
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
    appMode: AppMode.Student,
    crisis: {
      trust: 55,
      round: 0,
      casualties: 0,
      control: 'hygienik',
      governmentDownRounds: 0,
      enteredCrisisStaff: false,
      initialPopupShown: false,
      popupQueue: [],
    },
  }),

  appMode: AppMode.Student,
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

  crisis: {
    trust: 55,
    round: 0,
    casualties: 0,
    control: 'hygienik',
    governmentDownRounds: 0,
    enteredCrisisStaff: false,
    initialPopupShown: false,
    popupQueue: [],
  },
  enqueueCrisisPopup: (popup) => set((s) => ({
    crisis: {
      ...s.crisis,
      popupQueue: [...s.crisis.popupQueue, popup],
    },
  })),
  dequeueCrisisPopup: () => set((s) => ({
    crisis: {
      ...s.crisis,
      popupQueue: s.crisis.popupQueue.slice(1),
    },
  })),
  applyTrustDelta: (delta) => set((s) => ({
    crisis: {
      ...s.crisis,
      trust: Math.max(0, Math.min(100, s.crisis.trust + delta)),
    },
  })),
  registerSimulationOutcome: (casualties, hiddenEventsActive) => set((s) => {
    const popupQueue = [...s.crisis.popupQueue];
    let control = s.crisis.control;
    let trust = s.crisis.trust;
    let governmentDownRounds = Math.max(0, s.crisis.governmentDownRounds - 1);

    if (hiddenEventsActive) {
      popupQueue.push({
        id: `hidden-event-${crypto.randomUUID()}`,
        title: 'Skrytý event pronikl do veřejného prostoru',
        body: 'Objevila se nečekaná zpráva v médiích. Veřejnost čeká rychlou reakci krizového štábu.',
        variant: 'news',
      });
      trust = Math.max(0, Math.min(100, trust - 2));
    }

    if (casualties >= 10000 && control !== 'premier') {
      control = 'premier';
      trust = Math.max(0, Math.min(100, trust + 5));
      popupQueue.push({
        id: 'premier-takes-control',
        title: 'Ústřední krizový štáb přebírá řízení',
        body: 'Počet obětí překročil 10 000. Řízení přebírá premiér. Důvěra krátkodobě roste, ale původní opatření ztrácí část účinnosti.',
        variant: 'warning',
      });
    }

    if (trust <= 0 && s.crisis.governmentDownRounds === 0) {
      governmentDownRounds = 2;
      popupQueue.push({
        id: `government-fall-${crypto.randomUUID()}`,
        title: 'Pád vlády',
        body: 'Důvěra veřejnosti klesla na 0 %. Vláda padla a následující 2 kola nebudou opatření účinná.',
        variant: 'warning',
      });
    }

    return {
      crisis: {
        ...s.crisis,
        casualties,
        control,
        trust,
        governmentDownRounds,
        popupQueue,
      },
    };
  }),
  startGovernmentDowntime: () => set((s) => ({
    crisis: {
      ...s.crisis,
      governmentDownRounds: 2,
    },
  })),
  advanceRound: () => set((s) => ({
    crisis: {
      ...s.crisis,
      round: s.crisis.round + 1,
    },
  })),
  enterCrisisStaff: () => set((s) => ({
    crisis: {
      ...s.crisis,
      enteredCrisisStaff: true,
    },
  })),
  markInitialPopupShown: () => set((s) => ({
    crisis: {
      ...s.crisis,
      initialPopupShown: true,
    },
  })),
}));
