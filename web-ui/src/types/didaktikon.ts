// === ÓSACKÁ HOREČKA ===

export interface PhoneContact {
  id: string;
  name: string;
  type: 'person' | 'business';
  interviewDate: string;
  testimony: string;
  cost: number;
  available: boolean;
  // Hidden master data (for scoring):
  infected: boolean;
  infectionDay?: number;
  infectiousDay?: number;
  symptomsDay?: number;
  infectionSource?: string;
  vaccinated?: boolean;
  simulating?: boolean;
  isSuperspreaderEvent?: boolean;
  superspreaderName?: string;
  notes?: string;
}

export interface PlayerNote {
  contactId: string;
  status: 'infected' | 'healthy_exposed' | 'healthy' | 'unavailable' | 'unknown';
  symptomsDate?: string;
  exposureSource?: string;
  freeText?: string;
}

export interface EpiCurveEntry {
  day: number;
  contactIds: string[];
}

export interface TransmissionLink {
  targetId: string;
  sourceId: string;
}

export interface OsackaGameState {
  phase: 'intro' | 'playing' | 'transmission_tree' | 'results';
  budget: number;
  maxBudget: number;
  calledContacts: string[];
  selectedContact: string | null;
  playerNotes: Record<string, PlayerNote>;
  epiCurveData: EpiCurveEntry[];
  identifiedInfected: string[];
  identifiedSuperspreaders: string[];
  transmissionLinks: TransmissionLink[];
  startTime: number;
  endTime?: number;
}

// === TYFOVÁ MARY ===

export interface TyfovaDocument {
  id: string;
  title: string;
  content: string;
  order: number;
  unlockedByStep?: number;
}

export interface TyfovaQuestion {
  id: string;
  step: number;
  question: string;
  type: 'multiple_choice' | 'checkbox' | 'text' | 'ordering';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  hint?: string;
}

export interface HouseholdMember {
  name: string;
  role: string;
  infected: boolean;
  testimony: string;
  foodConsumed: string[];
  clues: string[];
}

export interface HistoricalCase {
  year: number;
  location: string;
  infected: number;
  deaths: number;
  description: string;
  pattern: string;
}

export interface TyfovaGameState {
  phase: 'intro' | 'playing' | 'results';
  currentStep: number;
  totalSteps: number;
  unlockedDocuments: string[];
  readDocuments: string[];
  answers: Record<string, string | string[]>;
  correctAnswers: number;
  startTime: number;
  endTime?: number;
}
