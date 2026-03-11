import { create } from 'zustand';
import type { TyfovaGameState } from '../types/didaktikon';
import { getQuestionsForStep } from '../data/tyfova/questions';

const STEP_DOCUMENTS: Record<number, string[]> = {
  0: ['typhoid-info'],
  1: ['warren-case'],
  2: ['testimonies'],
  3: ['water-report'],
  4: ['historical-cases'],
  5: ['newspapers'],
  6: ['control-measures'],
};

interface TyfovaStore extends TyfovaGameState {
  selectedDocument: string | null;

  // Actions
  startGame: () => void;
  selectDocument: (id: string) => void;
  markRead: (id: string) => void;
  submitAnswer: (questionId: string, answer: string | string[]) => boolean;
  nextStep: () => void;
  finishGame: () => void;
  resetGame: () => void;
}

const initialState: TyfovaGameState & { selectedDocument: string | null } = {
  phase: 'intro',
  currentStep: 0,
  totalSteps: 7,
  unlockedDocuments: [],
  readDocuments: [],
  selectedDocument: null,
  answers: {},
  correctAnswers: 0,
  startTime: 0,
  endTime: undefined,
};

export const useTyfovaStore = create<TyfovaStore>((set, get) => ({
  ...initialState,

  startGame: () =>
    set({
      phase: 'playing',
      currentStep: 0,
      unlockedDocuments: [...(STEP_DOCUMENTS[0] ?? [])],
      readDocuments: [],
      selectedDocument: null,
      answers: {},
      correctAnswers: 0,
      startTime: Date.now(),
      endTime: undefined,
    }),

  selectDocument: (id: string) => {
    const { unlockedDocuments } = get();
    if (unlockedDocuments.includes(id)) {
      set({ selectedDocument: id });
      // Also mark as read
      get().markRead(id);
    }
  },

  markRead: (id: string) => {
    const { readDocuments } = get();
    if (!readDocuments.includes(id)) {
      set({ readDocuments: [...readDocuments, id] });
    }
  },

  submitAnswer: (questionId: string, answer: string | string[]): boolean => {
    const { answers, correctAnswers } = get();
    // Find the question to check correctness
    const allQuestions = Array.from({ length: 7 }, (_, i) => getQuestionsForStep(i)).flat();
    const question = allQuestions.find((q) => q.id === questionId);

    let isCorrect = false;
    if (question) {
      if (Array.isArray(question.correctAnswer) && Array.isArray(answer)) {
        const sortedCorrect = [...question.correctAnswer].sort();
        const sortedAnswer = [...answer].sort();
        isCorrect =
          sortedCorrect.length === sortedAnswer.length &&
          sortedCorrect.every((val, idx) => val === sortedAnswer[idx]);
      } else if (typeof question.correctAnswer === 'string' && typeof answer === 'string') {
        isCorrect =
          answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      }
    }

    set({
      answers: { ...answers, [questionId]: answer },
      correctAnswers: isCorrect ? correctAnswers + 1 : correctAnswers,
    });

    return isCorrect;
  },

  nextStep: () => {
    const { currentStep } = get();
    const nextStep = currentStep + 1;
    if (nextStep < 7) {
      const newDocs = STEP_DOCUMENTS[nextStep] ?? [];
      set((state) => ({
        currentStep: nextStep,
        unlockedDocuments: [...state.unlockedDocuments, ...newDocs],
        selectedDocument: null,
      }));
    }
  },

  finishGame: () =>
    set({
      phase: 'results',
      endTime: Date.now(),
    }),

  resetGame: () => set({ ...initialState }),
}));
