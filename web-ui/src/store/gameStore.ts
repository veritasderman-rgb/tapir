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

/** Crisis popup notification shown to the player. */
export interface CrisisPopup {
  id: string;
  title: string;
  body: string;
  variant: 'news' | 'warning' | 'success' | 'crisis';
  actionLabel?: string;
  action?: 'enterCrisisStaff' | 'close';
}

/** Who is currently leading the crisis response. */
export type CrisisLeader = 'hygienik' | 'premier';

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

  // ─── Crisis management layer ───
  crisisLeader: CrisisLeader;
  trust: number; // 0-100, replaces/parallels socialCapital
  governmentDownRounds: number; // >0 means government has fallen, measures disabled
  crisisStaffEntered: boolean; // player has entered the crisis HQ
  introPopupShown: boolean; // initial epidemic news shown
  popupQueue: CrisisPopup[];
  oppositionBriefings: number; // count of opposition meetings held
  mediaSupport: number; // count of media support actions
  premierTakeoverDone: boolean; // premier already took over (one-time)

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

  // Crisis actions
  enterCrisisStaff: () => void;
  markIntroPopupShown: () => void;
  enqueuePopup: (popup: CrisisPopup) => void;
  dequeuePopup: () => void;
  doOppositionBriefing: () => void;
  doMediaSupport: () => void;

  // Computed helpers
  allMetrics: () => DailyMetrics[];
  allStates: () => PopulationState[];
  unlockedMeasureIds: () => string[];
}

/** Detect epidemic type from scenario name / R0 for headline generation. */
export function detectEpidemicType(scenario: GameScenario): { name: string; headline: string } {
  const n = scenario.baseScenario.name.toLowerCase();
  const r0 = scenario.baseScenario.epiConfig.R0;
  if (n.includes('ebola')) {
    return {
      name: 'Ebola',
      headline: 'MIMOŘÁDNÉ ZPRÁVY: V zemi potvrzeny první případy nákazy virem Ebola. Světová zdravotnická organizace sleduje situaci.',
    };
  }
  if (n.includes('spal') || r0 >= 8) {
    return {
      name: 'Spalničky',
      headline: 'MIMOŘÁDNÉ ZPRÁVY: Rozsáhlé ohnisko spalniček — virus se šíří rychleji než se čekalo. Nemocnice připravují kapacity.',
    };
  }
  if (n.includes('chřip') || n.includes('chrip') || n.includes('flu') || n.includes('grip')) {
    return {
      name: 'Ptačí chřipka',
      headline: 'MIMOŘÁDNÉ ZPRÁVY: Potvrzena nová varianta ptačí chřipky s přenosem na člověka. WHO zvyšuje stupeň pohotovosti.',
    };
  }
  // default COVID-like
  return {
    name: 'Epidemie',
    headline: 'MIMOŘÁDNÉ ZPRÁVY: V zemi zaznamenány první případy nového onemocnění. Epidemiologové varují před rychlým šířením.',
  };
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

  // Crisis defaults
  crisisLeader: 'hygienik',
  trust: 62,
  governmentDownRounds: 0,
  crisisStaffEntered: false,
  introPopupShown: false,
  popupQueue: [],
  oppositionBriefings: 0,
  mediaSupport: 0,
  premierTakeoverDone: false,

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
    const epi = detectEpidemicType(gameScenario);
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
      // Reset crisis state
      crisisLeader: 'hygienik',
      trust: 62,
      governmentDownRounds: 0,
      crisisStaffEntered: false,
      introPopupShown: false,
      oppositionBriefings: 0,
      mediaSupport: 0,
      premierTakeoverDone: false,
      popupQueue: [
        {
          id: 'intro-news',
          title: `${epi.name} — První zprávy`,
          body: `${epi.headline}\n\nHlavní hygienik ČR svolává Ústřední epidemiologický štáb. Řízení epidemie je ve vaší kompetenci. Máte k dispozici zdravotnická a organizační opatření — politická rozhodnutí vyššího řádu vyžadují zásah vlády.`,
          variant: 'news',
          actionLabel: 'Vstoupit do Krizového štábu',
          action: 'enterCrisisStaff',
        },
      ],
    });
  },

  submitTurn: () => {
    const state = get();
    const { checkpoint, gameScenario, currentTurn, activeMeasureIds, vaccinationPriority } = state;
    if (!checkpoint || !gameScenario) return;

    // If government is down, disable all measures for this turn
    const isGovDown = state.governmentDownRounds > 0;
    const effectiveMeasures = isGovDown ? [] : activeMeasureIds;
    const effectiveVax = isGovDown ? null : vaccinationPriority;

    const nextTurn = currentTurn + 1;
    const action: TurnAction = {
      activeMeasureIds: effectiveMeasures,
      vaccinationPriority: effectiveVax,
    };

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
    const cumulativeDeaths = result.turnReport.cumulativeDeaths;
    const newPopups: CrisisPopup[] = [];

    // ─── Trust mechanics ───
    let newTrust = state.trust;

    // Political cost of measures drains trust
    const turnPoliticalCost = result.turnReport.socialCapital < 50 ? 2 : 0;
    newTrust -= turnPoliticalCost;

    // Deaths erode trust
    if (result.turnReport.newDeaths > 500) {
      newTrust -= 5;
      newPopups.push({
        id: `deaths-high-${nextTurn}`,
        title: 'Rostoucí počet obětí',
        body: `Tento týden zemřelo ${result.turnReport.newDeaths.toLocaleString()} lidí. Veřejnost žádá vysvětlení.`,
        variant: 'warning',
      });
    } else if (result.turnReport.newDeaths > 100) {
      newTrust -= 2;
    }

    // Hospital overflow
    if (result.turnReport.capacityOverflow) {
      newTrust -= 4;
      newPopups.push({
        id: `overflow-${nextTurn}`,
        title: 'Nemocnice na hranici kapacit!',
        body: 'Zdravotnická zařízení odmítají pacienty. Média kritizují vládní reakci. Důvěra veřejnosti klesá.',
        variant: 'crisis',
      });
    }

    // ─── Premier takeover at 10,000 deaths ───
    if (cumulativeDeaths >= 10000 && !state.premierTakeoverDone) {
      newTrust += 8; // initial boost from decisive action
      newPopups.push({
        id: 'premier-takeover',
        title: 'Ústřední krizový štáb přebírá řízení!',
        body: `Počet obětí překročil 10 000. Premiér přebírá vedení Ústředního krizového štábu.\n\nTento krok přináší krátkodobý nárůst důvěry (+8).\n\nJako premiér máte nově k dispozici:\n• Úplný lockdown a zákaz vycházení\n• Nasazení armády\n• Ekonomické záchranné programy\n• Uzavření hranic\n• Velkokapacitní vakcinační centra\n\nNěkterá opatření budou muset být znovu nastavena.`,
        variant: 'crisis',
        actionLabel: 'Převzít řízení',
        action: 'close',
      });
    }

    // ─── Hidden events → popups ───
    for (const event of result.turnReport.activatedEvents) {
      switch (event.type) {
        case 'variant_shock':
          newTrust -= 3;
          newPopups.push({
            id: `event-${event.id}`,
            title: 'Nová varianta viru!',
            body: `${event.label}\n\nOdborníci varují před vyšší přenosností. Důvěra veřejnosti klesá.`,
            variant: 'warning',
          });
          break;
        case 'supply_disruption':
          newTrust -= 2;
          newPopups.push({
            id: `event-${event.id}`,
            title: 'Krize zásobování',
            body: `${event.label}\n\nNemocnice hlásí nedostatek materiálu.`,
            variant: 'warning',
          });
          break;
        case 'public_unrest':
          newTrust -= 5;
          newPopups.push({
            id: `event-${event.id}`,
            title: 'Veřejné nepokoje',
            body: `${event.label}\n\nTisíce lidí v ulicích. Důvěra prudce klesá.`,
            variant: 'crisis',
          });
          break;
        case 'vaccine_unlock':
          newTrust += 5;
          newPopups.push({
            id: `event-${event.id}`,
            title: 'Vakcína schválena!',
            body: `${event.label}\n\nOčkovací kampaň může začít. Veřejnost reaguje pozitivně.`,
            variant: 'success',
          });
          break;
        case 'who_intel':
          newTrust += 2;
          newPopups.push({
            id: `event-${event.id}`,
            title: 'Nové poznatky WHO',
            body: `${event.label}\n\nMezinárodní spolupráce přináší výsledky.`,
            variant: 'success',
          });
          break;
        case 'measure_unlock':
          newPopups.push({
            id: `event-${event.id}`,
            title: 'Nové opatření k dispozici',
            body: event.label,
            variant: 'news',
          });
          break;
      }
    }

    // ─── Government down countdown ───
    let newGovDown = state.governmentDownRounds;
    if (newGovDown > 0) {
      newGovDown -= 1;
      if (newGovDown === 0) {
        newTrust = 25; // new government starts with low trust
        newPopups.push({
          id: `gov-restored-${nextTurn}`,
          title: 'Nová vláda jmenována',
          body: 'Po dvou kolech bez funkční vlády je jmenován nový kabinet. Opatření lze opět zavádět, ale důvěra veřejnosti je nízká.',
          variant: 'news',
        });
      }
    }

    // Clamp trust
    newTrust = Math.max(0, Math.min(100, newTrust));

    // ─── Government fall at 0% trust ───
    if (newTrust <= 0 && newGovDown === 0) {
      newGovDown = 2;
      newTrust = 0;
      newPopups.push({
        id: `gov-fall-${nextTurn}`,
        title: 'Pád vlády!',
        body: 'Důvěra veřejnosti klesla na nulu. Vláda podala demisi.\n\nNásledující 2 kola nebudou fungovat žádná opatření, než se ustanoví vláda nová.',
        variant: 'crisis',
      });
    }

    set({
      currentTurn: nextTurn,
      checkpoint: result.checkpoint,
      turnHistory: [...get().turnHistory, historyEntry],
      lastTurnReport: result.turnReport,
      showDebrief: true,
      gamePhase: isLastTurn ? 'finished' : 'playing',
      // Crisis updates
      trust: newTrust,
      governmentDownRounds: newGovDown,
      premierTakeoverDone: state.premierTakeoverDone || cumulativeDeaths >= 10000,
      crisisLeader: cumulativeDeaths >= 10000 ? 'premier' : state.crisisLeader,
      popupQueue: [...state.popupQueue, ...newPopups],
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
    crisisLeader: 'hygienik',
    trust: 62,
    governmentDownRounds: 0,
    crisisStaffEntered: false,
    introPopupShown: false,
    popupQueue: [],
    oppositionBriefings: 0,
    mediaSupport: 0,
    premierTakeoverDone: false,
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

  // Crisis actions
  enterCrisisStaff: () => set({ crisisStaffEntered: true }),

  markIntroPopupShown: () => set({ introPopupShown: true }),

  enqueuePopup: (popup) => set((s) => ({
    popupQueue: [...s.popupQueue, popup],
  })),

  dequeuePopup: () => set((s) => ({
    popupQueue: s.popupQueue.slice(1),
  })),

  doOppositionBriefing: () => set((s) => ({
    oppositionBriefings: s.oppositionBriefings + 1,
    trust: Math.min(100, s.trust + 3),
    popupQueue: [...s.popupQueue, {
      id: `opposition-${s.oppositionBriefings + 1}`,
      title: 'Schůzka s opozicí',
      body: 'Informovali jste opozici o aktuální situaci. Opozice ocenila transparentnost.\n\n+3 k důvěře veřejnosti',
      variant: 'success' as const,
    }],
  })),

  doMediaSupport: () => set((s) => ({
    mediaSupport: s.mediaSupport + 1,
    trust: Math.min(100, s.trust + 2),
    popupQueue: [...s.popupQueue, {
      id: `media-${s.mediaSupport + 1}`,
      title: 'Podpora veřejných médií',
      body: 'Vládní mluvčí vystoupil v hlavním zpravodajství s přehlednou informací o situaci.\n\n+2 k důvěře veřejnosti',
      variant: 'success' as const,
    }],
  })),

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
