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
import { initGame, stepTurn, decodeGameScenario, getMeasureById } from '@tapir/core';

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

  // Player's current action draft
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
  requestFinancialSupport: boolean; // player requested financial support this turn

  /**
   * Tracks government requests for premier-only measures by hygienist.
   * Key = measure ID. Value = number of legislative turns remaining before full effect.
   * 0 = fully active (legislation passed), >0 = still in legislative process.
   */
  govApprovedMeasures: Record<string, number>;

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
  setRequestFinancialSupport: (v: boolean) => void;
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
  requestFinancialSupport: false,
  govApprovedMeasures: {},

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
      requestFinancialSupport: false,
      govApprovedMeasures: {},
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
    const effectiveVax = isGovDown ? null : vaccinationPriority;

    const nextTurn = currentTurn + 1;
    const earlyPopups: CrisisPopup[] = [];

    // ─── Auto-increment opposition briefings when measure is active ───
    let newOppositionBriefings = state.oppositionBriefings;
    if (activeMeasureIds.includes('opposition_briefing')) {
      newOppositionBriefings += 1;
    }

    // ─── Government request system for premier-only measures ───
    // When hygienist, premier measures need government approval
    let effectiveMeasures = isGovDown ? [] : [...activeMeasureIds];
    const newGovApproved = { ...state.govApprovedMeasures };

    // Decrement legislative timers for previously approved measures
    for (const [mid, turnsLeft] of Object.entries(newGovApproved)) {
      if (turnsLeft > 0) {
        newGovApproved[mid] = turnsLeft - 1;
        if (turnsLeft - 1 === 0) {
          earlyPopups.push({
            id: `gov-legislation-done-${mid}-${nextTurn}`,
            title: 'Legislativní proces dokončen',
            body: `Opatření "${getMeasureById(mid)?.name ?? mid}" prošlo legislativním procesem a nabývá plné účinnosti.`,
            variant: 'success',
          });
        }
      }
    }

    if (state.crisisLeader === 'hygienik' && !isGovDown) {
      // Get current observed infections for approval probability
      const lastReport = state.lastTurnReport;
      const observedInfections = lastReport?.observedInfections ?? 0;

      for (const mid of activeMeasureIds) {
        const measure = getMeasureById(mid);
        if (!measure) continue;
        const auth = measure.authority ?? 'both';
        if (auth !== 'premier') continue;

        // Already approved in a previous turn?
        if (mid in newGovApproved) continue;

        // Calculate approval probability based on current infections
        let approvalChance: number;
        if (observedInfections < 2000) {
          approvalChance = 0.10;
        } else if (observedInfections < 3000) {
          approvalChance = 0.10 + (observedInfections - 2000) / 1000 * 0.65; // 10% → 75%
        } else if (observedInfections < 6000) {
          approvalChance = 0.75 + (observedInfections - 3000) / 3000 * 0.25; // 75% → 100%
        } else {
          approvalChance = 1.0;
        }

        const roll = Math.random();
        if (roll < approvalChance) {
          // Approved — but needs 1-2 turns for legislative process
          const legislativeDelay = observedInfections >= 6000 ? 1 : 2;
          newGovApproved[mid] = legislativeDelay;
          earlyPopups.push({
            id: `gov-approved-${mid}-${nextTurn}`,
            title: 'Vláda schválila opatření',
            body: `Vláda schválila vaši žádost o opatření "${measure.name}".\n\nLegislativní proces (projednání v parlamentu, podpis prezidenta) potrvá přibližně ${legislativeDelay === 1 ? '2 týdny' : '4 týdny'} (${legislativeDelay} ${legislativeDelay === 1 ? 'kolo' : 'kola'}).\n\nPoté opatření nabude plné účinnosti.`,
            variant: 'success',
          });
        } else {
          // Denied — remove from effective measures
          effectiveMeasures = effectiveMeasures.filter(id => id !== mid);
          const reason = observedInfections < 2000
            ? 'Vláda považuje situaci za zvládnutelnou stávajícími prostředky.'
            : observedInfections < 3000
              ? 'Koaliční partneři nesouhlasí s tak razantním krokem.'
              : 'Vláda chce ještě vyčkat na vývoj situace.';
          earlyPopups.push({
            id: `gov-denied-${mid}-${nextTurn}`,
            title: 'Vláda zamítla žádost',
            body: `Vaše žádost o opatření "${measure.name}" byla zamítnuta.\n\n${reason}\n\nMůžete žádost podat znovu v dalším kole.`,
            variant: 'warning',
          });
        }
      }

      // Remove denied premier measures from effective list
      // (already handled above by filtering)

      // For approved measures still in legislative process, they are active
      // but with extra ramp-up delay handled by the legislativeDelay field
    }

    const action: TurnAction = {
      activeMeasureIds: effectiveMeasures,
      vaccinationPriority: effectiveVax,
      oppositionBriefings: newOppositionBriefings,
      requestFinancialSupport: state.requestFinancialSupport,
      crisisLeader: state.crisisLeader,
      legislativeDelays: newGovApproved,
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

    // ─── Premier takeover at configurable death threshold ───
    const premierThreshold = gameScenario.premierTakeoverDeaths ?? 10000;
    if (cumulativeDeaths >= premierThreshold && !state.premierTakeoverDone) {
      newTrust += 8; // initial boost from decisive action
      newPopups.push({
        id: 'premier-takeover',
        title: 'Ústřední krizový štáb přebírá řízení!',
        body: `Počet obětí překročil ${premierThreshold.toLocaleString('cs-CZ')}. Premiér přebírá vedení Ústředního krizového štábu.\n\nTento krok přináší krátkodobý nárůst důvěry (+8).\n\nJako premiér máte nově k dispozici:\n• Úplný lockdown a zákaz vycházení\n• Nasazení armády\n• Ekonomické záchranné programy\n• Uzavření hranic\n• Velkokapacitní vakcinační centra\n\nNěkterá opatření budou muset být znovu nastavena.`,
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
      requestFinancialSupport: false,
      premierTakeoverDone: state.premierTakeoverDone || cumulativeDeaths >= premierThreshold,
      crisisLeader: cumulativeDeaths >= premierThreshold ? 'premier' : state.crisisLeader,
      oppositionBriefings: newOppositionBriefings,
      govApprovedMeasures: newGovApproved,
      popupQueue: [...state.popupQueue, ...earlyPopups, ...newPopups],
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
    requestFinancialSupport: false,
    govApprovedMeasures: {},
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

  setRequestFinancialSupport: (v: boolean) => set({ requestFinancialSupport: v }),

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
