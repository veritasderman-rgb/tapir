import { contacts } from './contacts';

// ============================================================
// Scoring constants
// ============================================================

/** Bodů za správně identifikovaného nakaženého */
export const POINTS_PER_CORRECT_INFECTED = 5;

/** Penalizace za nesprávně identifikovaného (falešně pozitivní) */
export const PENALTY_PER_FALSE_POSITIVE = -3;

/** Bonus za identifikovanou superspreader událost */
export const BONUS_PER_SUPERSPREADER = 10;

/** Bonus za správnou identifikaci pacienta nula */
export const BONUS_PATIENT_ZERO = 10;

/** Koeficient pro bonus za zbývající rozpočet */
export const BUDGET_EFFICIENCY_COEFFICIENT = 0.5;

/** Body za správný přenosový link (kdo koho nakazil) */
export const POINTS_PER_CORRECT_LINK = 3;

/** Celkový počet skutečně nakažených */
export const TOTAL_INFECTED = 23;

/** Počet superspreader událostí k identifikaci */
export const TOTAL_SUPERSPREADER_EVENTS = 3;

/** ID pacienta nula */
export const PATIENT_ZERO_ID = 'skinner';

/** Názvy superspreader událostí */
export const SUPERSPREADER_EVENT_NAMES = [
  'Springfieldská jaderná elektrárna',
  'Bi-Mon-Sci-Fi-Con',
  'Spucklerova farma (zoonóza)',
];

/** Maximální rozpočet */
export const MAX_BUDGET = 200;

/** Maximální teoretické skóre:
 *  23 * 5 = 115 (nakažení)
 *  + 3 * 10 = 30 (superspreader)
 *  + 10 (pacient nula)
 *  + 23 * 3 = 69 (přenosové linky)
 *  + 200 * 0.5 = 100 (max budget bonus, theoretical)
 *  = 324 theoretical max
 */
export const THEORETICAL_MAX_SCORE =
  TOTAL_INFECTED * POINTS_PER_CORRECT_INFECTED +
  TOTAL_SUPERSPREADER_EVENTS * BONUS_PER_SUPERSPREADER +
  BONUS_PATIENT_ZERO +
  TOTAL_INFECTED * POINTS_PER_CORRECT_LINK +
  Math.floor(MAX_BUDGET * BUDGET_EFFICIENCY_COEFFICIENT);

// ============================================================
// Master data derived from contacts
// ============================================================

/** IDs of all truly infected contacts */
export const MASTER_INFECTED_IDS: string[] = contacts
  .filter((c) => c.infected)
  .map((c) => c.id);

/** IDs of contacts that are simulating illness */
export const SIMULATING_IDS: string[] = contacts
  .filter((c) => c.simulating)
  .map((c) => c.id);

/** IDs of vaccinated contacts */
export const VACCINATED_IDS: string[] = contacts
  .filter((c) => c.vaccinated)
  .map((c) => c.id);

// ============================================================
// Score result interface
// ============================================================

export interface ScoreResult {
  /** Body za správně identifikované nakažené */
  correctInfectedPoints: number;
  /** Počet správně identifikovaných nakažených */
  correctInfectedCount: number;
  /** Počet neidentifikovaných nakažených (missed) */
  missedInfectedCount: number;
  /** Body odečtené za falešně pozitivní */
  falsePositivePenalty: number;
  /** Počet falešně pozitivních */
  falsePositiveCount: number;
  /** Body za superspreader události */
  superspreaderPoints: number;
  /** Počet správně identifikovaných superspreader událostí */
  superspreaderCount: number;
  /** Body za identifikaci pacienta nula */
  patientZeroPoints: number;
  /** Zda byl pacient nula správně identifikován */
  patientZeroCorrect: boolean;
  /** Body za správné přenosové linky */
  transmissionLinkPoints: number;
  /** Počet správných přenosových linků */
  correctLinksCount: number;
  /** Celkový počet linků zadaných hráčem */
  totalLinksCount: number;
  /** Bonus za efektivitu rozpočtu */
  budgetBonus: number;
  /** Zbývající rozpočet */
  budgetRemaining: number;
  /** Celkové skóre */
  totalScore: number;
  /** Maximální teoretické skóre */
  maxScore: number;
  /** Procentuální úspěšnost (0-100) */
  percentage: number;
  /** Hodnocení (A-F) */
  grade: string;
}

// ============================================================
// Scoring function
// ============================================================

/**
 * Vypočítá skóre hráče na základě jeho identifikací.
 *
 * @param identifiedInfectedIds - ID osob, které hráč označil jako nakažené
 * @param identifiedSuperspreaderNames - Názvy superspreader událostí identifikovaných hráčem
 * @param patientZeroId - ID osoby, kterou hráč označil jako pacienta nula (nebo null)
 * @param budgetRemaining - Zbývající rozpočet hráče
 * @param transmissionLinks - Přenosové linky zadané hráčem
 * @returns Objekt s detailním rozpisem skóre
 */
export function calculateScore(
  identifiedInfectedIds: string[],
  identifiedSuperspreaderNames: string[],
  patientZeroId: string | null,
  budgetRemaining: number,
  transmissionLinks: { targetId: string; sourceId: string }[] = []
): ScoreResult {
  // --- Správně identifikovaní nakažení ---
  const correctInfected = identifiedInfectedIds.filter((id) =>
    MASTER_INFECTED_IDS.includes(id)
  );
  const correctInfectedCount = correctInfected.length;
  const correctInfectedPoints = correctInfectedCount * POINTS_PER_CORRECT_INFECTED;

  // --- Neidentifikovaní nakažení (missed) ---
  const missedInfectedCount = MASTER_INFECTED_IDS.length - correctInfectedCount;

  // --- Falešně pozitivní ---
  const falsePositives = identifiedInfectedIds.filter(
    (id) => !MASTER_INFECTED_IDS.includes(id)
  );
  const falsePositiveCount = falsePositives.length;
  const falsePositivePenalty = falsePositiveCount * PENALTY_PER_FALSE_POSITIVE;

  // --- Superspreader události ---
  const correctSuperspreaders = identifiedSuperspreaderNames.filter((name) =>
    SUPERSPREADER_EVENT_NAMES.includes(name)
  );
  const superspreaderCount = correctSuperspreaders.length;
  const superspreaderPoints = superspreaderCount * BONUS_PER_SUPERSPREADER;

  // --- Pacient nula ---
  const patientZeroCorrect = patientZeroId === PATIENT_ZERO_ID;
  const patientZeroPoints = patientZeroCorrect ? BONUS_PATIENT_ZERO : 0;

  // --- Přenosové linky ---
  const correctLinksCount = transmissionLinks.filter((link) => {
    const contact = contacts.find((c) => c.id === link.targetId);
    if (!contact?.infected) return false;
    return contact.infectionSource === link.sourceId;
  }).length;
  const totalLinksCount = transmissionLinks.length;
  const transmissionLinkPoints = correctLinksCount * POINTS_PER_CORRECT_LINK;

  // --- Bonus za rozpočet ---
  const budgetBonus = Math.floor(
    Math.max(0, budgetRemaining) * BUDGET_EFFICIENCY_COEFFICIENT
  );

  // --- Celkové skóre ---
  const totalScore = Math.max(
    0,
    correctInfectedPoints +
      falsePositivePenalty +
      superspreaderPoints +
      patientZeroPoints +
      transmissionLinkPoints +
      budgetBonus
  );

  // --- Procenta a hodnocení ---
  const percentage = Math.round((totalScore / THEORETICAL_MAX_SCORE) * 100);
  const grade = getGrade(percentage);

  return {
    correctInfectedPoints,
    correctInfectedCount,
    missedInfectedCount,
    falsePositivePenalty,
    falsePositiveCount,
    superspreaderPoints,
    superspreaderCount,
    patientZeroPoints,
    patientZeroCorrect,
    transmissionLinkPoints,
    correctLinksCount,
    totalLinksCount,
    budgetBonus,
    budgetRemaining,
    totalScore,
    maxScore: THEORETICAL_MAX_SCORE,
    percentage,
    grade,
  };
}

/**
 * Vrátí známku na základě procentuální úspěšnosti.
 */
function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 65) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 35) return 'E';
  return 'F';
}
