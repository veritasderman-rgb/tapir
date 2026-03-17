import { create } from 'zustand';
import type {
  OsackaGameState,
  PlayerNote,
  EpiCurveEntry,
  TransmissionLink,
} from '../types/didaktikon';
import { contacts } from '../data/osacka/contacts';
import { MAX_BUDGET } from '../data/osacka/scoring';

interface OsackaActions {
  startGame: () => void;
  callContact: (id: string) => void;
  selectContact: (id: string) => void;
  addNote: (note: PlayerNote) => void;
  updateNote: (contactId: string, partial: Partial<PlayerNote>) => void;
  toggleInfected: (contactId: string) => void;
  toggleSuperspreader: (name: string) => void;
  addToEpiCurve: (day: number, contactId: string) => void;
  removeFromEpiCurve: (day: number, contactId: string) => void;
  setTransmissionSource: (targetId: string, sourceId: string) => void;
  removeTransmissionLink: (targetId: string) => void;
  goToTransmissionTree: () => void;
  finishGame: () => void;
  resetGame: () => void;
}

type OsackaStore = OsackaGameState & OsackaActions;

const initialEpiCurve: EpiCurveEntry[] = Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  contactIds: [],
}));

export const useOsackaStore = create<OsackaStore>((set, get) => ({
  // State
  phase: 'intro',
  budget: 550,
  maxBudget: 550,
  calledContacts: [],
  selectedContact: null,
  playerNotes: {},
  epiCurveData: initialEpiCurve.map((e) => ({ ...e, contactIds: [...e.contactIds] })),
  identifiedInfected: [],
  identifiedSuperspreaders: [],
  transmissionLinks: [],
  startTime: 0,
  endTime: undefined,

  // Actions
  startGame: () =>
    set({
      phase: 'playing',
      budget: MAX_BUDGET,
      maxBudget: MAX_BUDGET,
      calledContacts: [],
      selectedContact: null,
      playerNotes: {},
      epiCurveData: initialEpiCurve.map((e) => ({ ...e, contactIds: [...e.contactIds] })),
      identifiedInfected: [],
      identifiedSuperspreaders: [],
      transmissionLinks: [],
      startTime: Date.now(),
      endTime: undefined,
    }),

  callContact: (id: string) => {
    const state = get();
    if (state.calledContacts.includes(id)) {
      // Already called — just select for free
      set({ selectedContact: id });
      return;
    }
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    if (state.budget < contact.cost) return;

    const newCalledContacts = [...state.calledContacts, id];
    const newNotes = { ...state.playerNotes };
    if (!newNotes[id]) {
      newNotes[id] = {
        contactId: id,
        status: 'unknown',
      };
    }
    set({
      budget: state.budget - contact.cost,
      calledContacts: newCalledContacts,
      selectedContact: id,
      playerNotes: newNotes,
    });
  },

  selectContact: (id: string) => {
    set({ selectedContact: id });
  },

  addNote: (note: PlayerNote) => {
    set((s) => ({
      playerNotes: { ...s.playerNotes, [note.contactId]: note },
    }));
  },

  updateNote: (contactId: string, partial: Partial<PlayerNote>) => {
    set((s) => {
      const existing = s.playerNotes[contactId];
      if (!existing) return s;
      return {
        playerNotes: {
          ...s.playerNotes,
          [contactId]: { ...existing, ...partial },
        },
      };
    });
  },

  toggleInfected: (contactId: string) => {
    set((s) => {
      const isCurrently = s.identifiedInfected.includes(contactId);
      const newList = isCurrently
        ? s.identifiedInfected.filter((id) => id !== contactId)
        : [...s.identifiedInfected, contactId];

      // Also update the note status
      const note = s.playerNotes[contactId];
      const newNotes = { ...s.playerNotes };
      if (note) {
        newNotes[contactId] = {
          ...note,
          status: isCurrently ? 'unknown' : 'infected',
        };
      }

      return {
        identifiedInfected: newList,
        playerNotes: newNotes,
      };
    });
  },

  toggleSuperspreader: (name: string) => {
    set((s) => {
      const isCurrently = s.identifiedSuperspreaders.includes(name);
      return {
        identifiedSuperspreaders: isCurrently
          ? s.identifiedSuperspreaders.filter((n) => n !== name)
          : [...s.identifiedSuperspreaders, name],
      };
    });
  },

  addToEpiCurve: (day: number, contactId: string) => {
    set((s) => ({
      epiCurveData: s.epiCurveData.map((entry) => {
        if (entry.day !== day) return entry;
        if (entry.contactIds.includes(contactId)) return entry;
        return { ...entry, contactIds: [...entry.contactIds, contactId] };
      }),
    }));
  },

  removeFromEpiCurve: (day: number, contactId: string) => {
    set((s) => ({
      epiCurveData: s.epiCurveData.map((entry) => {
        if (entry.day !== day) return entry;
        return {
          ...entry,
          contactIds: entry.contactIds.filter((id) => id !== contactId),
        };
      }),
    }));
  },

  setTransmissionSource: (targetId: string, sourceId: string) => {
    set((s) => {
      const filtered = s.transmissionLinks.filter((l) => l.targetId !== targetId);
      return {
        transmissionLinks: [...filtered, { targetId, sourceId }],
      };
    });
  },

  removeTransmissionLink: (targetId: string) => {
    set((s) => ({
      transmissionLinks: s.transmissionLinks.filter((l) => l.targetId !== targetId),
    }));
  },

  goToTransmissionTree: () =>
    set({
      phase: 'transmission_tree',
    }),

  finishGame: () =>
    set({
      phase: 'results',
      endTime: Date.now(),
    }),

  resetGame: () =>
    set({
      phase: 'intro',
      budget: MAX_BUDGET,
      maxBudget: MAX_BUDGET,
      calledContacts: [],
      selectedContact: null,
      playerNotes: {},
      epiCurveData: initialEpiCurve.map((e) => ({ ...e, contactIds: [...e.contactIds] })),
      identifiedInfected: [],
      identifiedSuperspreaders: [],
      transmissionLinks: [],
      startTime: 0,
      endTime: undefined,
    }),
}));
