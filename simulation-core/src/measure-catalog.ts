/**
 * Measure Catalog — All available crisis measures for Krizový štáb.
 *
 * Each measure has epidemiological, political, and economic effects,
 * plus unlock conditions that gate availability.
 */

import { type GameMeasure, NPIType } from './types';

/**
 * Complete catalog of all game measures.
 * Instructor selects which subset is available for a given scenario.
 */
export const MEASURE_CATALOG: GameMeasure[] = [
  // ═══════════════════════════════════════════
  // MASKS
  // ═══════════════════════════════════════════
  {
    id: 'mask_recommendation',
    name: 'Doporučení roušek',
    category: 'masks',
    description: 'Dobrovolné nošení roušek v uzavřených prostorách.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.92 },
    politicalCostPerTurn: 1,
    economicCostPerTurn: 0,
    rampUpDays: 0,
    complianceDecayRate: 0.005,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'mask_mandate_indoor',
    name: 'Povinné roušky v interiéru',
    category: 'masks',
    description: 'Povinné chirurgické roušky ve všech vnitřních prostorách.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.82 },
    politicalCostPerTurn: 3,
    economicCostPerTurn: 0.02,
    rampUpDays: 2,
    complianceDecayRate: 0.008,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'mask_level',
  },
  {
    id: 'ffp2_mandate',
    name: 'Povinné FFP2 respirátory',
    category: 'masks',
    description: 'FFP2 povinné v MHD, obchodech, školách. Vyšší ochrana, vyšší cena.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.70 },
    politicalCostPerTurn: 6,
    economicCostPerTurn: 0.05,
    rampUpDays: 3,
    complianceDecayRate: 0.012,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'mask_level',
  },

  // ═══════════════════════════════════════════
  // SOCIAL DISTANCING
  // ═══════════════════════════════════════════
  {
    id: 'ban_mass_events',
    name: 'Zákaz hromadných akcí (100+)',
    category: 'social_distancing',
    description: 'Zákaz akcí nad 100 osob — koncerty, sport, festivaly.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.7, targetSubMatrix: 'community' },
    politicalCostPerTurn: 4,
    economicCostPerTurn: 0.15,
    rampUpDays: 0,
    complianceDecayRate: 0.006,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'ban_mass_events_strict',
    name: 'Zákaz hromadných akcí (10+)',
    category: 'social_distancing',
    description: 'Zákaz shromažďování nad 10 osob. Drastické omezení společenského života.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.4, targetSubMatrix: 'community' },
    politicalCostPerTurn: 8,
    economicCostPerTurn: 0.3,
    rampUpDays: 0,
    complianceDecayRate: 0.015,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'mass_events',
  },
  {
    id: 'school_closure_partial',
    name: 'Rotační výuka (školy)',
    category: 'social_distancing',
    description: 'Střídavá prezenční/distanční výuka. Snižuje kontakty ve školách o ~50%.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.5, targetSubMatrix: 'school' },
    politicalCostPerTurn: 5,
    economicCostPerTurn: 0.08,
    rampUpDays: 3,
    complianceDecayRate: 0.01,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'schools',
  },
  {
    id: 'school_closure_full',
    name: 'Úplné zavření škol',
    category: 'social_distancing',
    description: 'Kompletní distanční výuka. Velký dopad na rodiny a ekonomiku.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.2, targetSubMatrix: 'school' },
    politicalCostPerTurn: 10,
    economicCostPerTurn: 0.2,
    rampUpDays: 1,
    complianceDecayRate: 0.02,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'schools',
  },
  {
    id: 'homeoffice_recommendation',
    name: 'Doporučení home office',
    category: 'social_distancing',
    description: 'Dobrovolný home office kde je to možné.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.75, targetSubMatrix: 'work' },
    politicalCostPerTurn: 1,
    economicCostPerTurn: 0.05,
    rampUpDays: 0,
    complianceDecayRate: 0.003,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'work',
  },
  {
    id: 'homeoffice_mandatory',
    name: 'Povinný home office',
    category: 'social_distancing',
    description: 'Povinný home office pro všechny pozice kde je to technicky možné.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.4, targetSubMatrix: 'work' },
    politicalCostPerTurn: 6,
    economicCostPerTurn: 0.25,
    rampUpDays: 3,
    complianceDecayRate: 0.01,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'work',
  },
  {
    id: 'curfew_night',
    name: 'Noční zákaz vycházení',
    category: 'social_distancing',
    description: 'Zákaz pohybu 21:00-05:00. Omezuje hlavně společenský život.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.85 },
    politicalCostPerTurn: 8,
    economicCostPerTurn: 0.15,
    rampUpDays: 0,
    complianceDecayRate: 0.02,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'curfew',
  },
  {
    id: 'lockdown_full',
    name: 'Úplný lockdown',
    category: 'social_distancing',
    description: 'Zákaz vycházení kromě nezbytných cest. Nejúčinnější ale nejdražší opatření.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.50 },
    politicalCostPerTurn: 18,
    economicCostPerTurn: 0.8,
    rampUpDays: 1,
    complianceDecayRate: 0.03,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'curfew',
  },
  {
    id: 'restaurant_closure',
    name: 'Zavření restaurací a barů',
    category: 'social_distancing',
    description: 'Restaurace pouze výdejní okénko. Bary zavřeny.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.8, targetSubMatrix: 'community' },
    politicalCostPerTurn: 5,
    economicCostPerTurn: 0.2,
    rampUpDays: 1,
    complianceDecayRate: 0.01,
    unlockCondition: { type: 'always' },
  },

  // ═══════════════════════════════════════════
  // TESTING & TRACING
  // ═══════════════════════════════════════════
  {
    id: 'testing_basic',
    name: 'Základní testovací program',
    category: 'testing',
    description: 'PCR testy pro symptomatické a kontakty. Zvyšuje detekci o 10%.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.95 },
    politicalCostPerTurn: 1,
    economicCostPerTurn: 0.05,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
    detectionRateBonus: 0.10,
    exclusiveGroup: 'testing',
  },
  {
    id: 'testing_mass',
    name: 'Masivní testování',
    category: 'testing',
    description: 'Plošné antigenní testování + PCR konfirmace. Detekce +25%, mírný efekt na β.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.90 },
    politicalCostPerTurn: 3,
    economicCostPerTurn: 0.12,
    rampUpDays: 14,
    complianceDecayRate: 0.005,
    unlockCondition: { type: 'turn_reached', turn: 3 },
    detectionRateBonus: 0.25,
    exclusiveGroup: 'testing',
  },
  {
    id: 'contact_tracing',
    name: 'Trasování kontaktů',
    category: 'testing',
    description: 'Hygienické stanice trasují kontakty pozitivních. Vyžaduje alespoň základní testování.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.85 },
    politicalCostPerTurn: 2,
    economicCostPerTurn: 0.06,
    rampUpDays: 7,
    complianceDecayRate: 0.003,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'quarantine_positive',
    name: 'Povinná karanténa pozitivních',
    category: 'testing',
    description: 'Povinná 10denní izolace po pozitivním testu.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.82 },
    politicalCostPerTurn: 3,
    economicCostPerTurn: 0.08,
    rampUpDays: 0,
    complianceDecayRate: 0.008,
    unlockCondition: { type: 'always' },
  },

  // ═══════════════════════════════════════════
  // TRAVEL
  // ═══════════════════════════════════════════
  {
    id: 'border_testing',
    name: 'Testování na hranicích',
    category: 'travel',
    description: 'Povinný negativní test při vstupu do země.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.95 },
    politicalCostPerTurn: 2,
    economicCostPerTurn: 0.05,
    rampUpDays: 3,
    complianceDecayRate: 0.002,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'border_closure',
    name: 'Uzavření hranic',
    category: 'travel',
    description: 'Uzavření hranic kromě nákladní dopravy a repatriací.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.90 },
    politicalCostPerTurn: 7,
    economicCostPerTurn: 0.3,
    rampUpDays: 2,
    complianceDecayRate: 0.01,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'borders',
  },

  // ═══════════════════════════════════════════
  // VACCINATION (gated — require unlock event)
  // ═══════════════════════════════════════════
  {
    id: 'vaccination_slow',
    name: 'Vakcinace — standardní kapacita',
    category: 'vaccination',
    description: 'Očkování 3 000 dávek/den. Standardní distribuce přes praktické lékaře.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 2,
    economicCostPerTurn: 0.05,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'event_triggered', eventId: 'vaccine_available' },
    vaccinationCapacityBonus: 3000,
    exclusiveGroup: 'vaccination_capacity',
  },
  {
    id: 'vaccination_fast',
    name: 'Vakcinace — velkokapacitní centra',
    category: 'vaccination',
    description: 'Očkování 10 000 dávek/den. Vybudování velkokapacitních center.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 4,
    economicCostPerTurn: 0.15,
    rampUpDays: 14,
    complianceDecayRate: 0,
    unlockCondition: { type: 'event_triggered', eventId: 'vaccine_available' },
    vaccinationCapacityBonus: 10000,
    exclusiveGroup: 'vaccination_capacity',
  },
  {
    id: 'vaccination_max',
    name: 'Vakcinace — armádní logistika',
    category: 'vaccination',
    description: 'Očkování 25 000 dávek/den. Nasazení armády do distribuce vakcín.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 6,
    economicCostPerTurn: 0.25,
    rampUpDays: 14,
    complianceDecayRate: 0,
    unlockCondition: { type: 'event_triggered', eventId: 'vaccine_available' },
    vaccinationCapacityBonus: 25000,
    exclusiveGroup: 'vaccination_capacity',
  },

  // ═══════════════════════════════════════════
  // MILITARY
  // ═══════════════════════════════════════════
  {
    id: 'army_hospitals',
    name: 'Polní nemocnice (armáda)',
    category: 'military',
    description: 'Armáda staví polní nemocnice. +500 lůžek, +50 ICU. Politicky kontroverzní.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 5,
    economicCostPerTurn: 0.1,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'hospital_occupancy_above', fraction: 0.6 },
    oneShot: true,
  },
  {
    id: 'army_enforcement',
    name: 'Armáda — kontrola opatření',
    category: 'military',
    description: 'Nasazení armády ke kontrole dodržování opatření. Zvyšuje compliance ale stojí politický kapitál.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.92 },
    politicalCostPerTurn: 10,
    economicCostPerTurn: 0.08,
    rampUpDays: 3,
    complianceDecayRate: 0,
    unlockCondition: { type: 'social_capital_below', threshold: 40 },
    intelBonus: 0.1,
  },
  {
    id: 'army_logistics',
    name: 'Armáda — logistická podpora',
    category: 'military',
    description: 'Armáda pomáhá s distribucí testů, ochranných pomůcek a zásob.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.97 },
    politicalCostPerTurn: 3,
    economicCostPerTurn: 0.05,
    rampUpDays: 5,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
    detectionRateBonus: 0.05,
  },

  // ═══════════════════════════════════════════
  // INTERNATIONAL
  // ═══════════════════════════════════════════
  {
    id: 'who_consultation',
    name: 'Konzultace s WHO',
    category: 'international',
    description: 'Pravidelné konzultace s WHO. Zpřesňuje odhady (Reff, projekce). Snižuje šum v datech.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 1,
    economicCostPerTurn: 0.01,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
    intelBonus: 0.3,
  },
  {
    id: 'international_aid',
    name: 'Mezinárodní pomoc (EU)',
    category: 'international',
    description: 'Aktivace mechanismu EU pro krizovou pomoc. +200 ICU lůžek, materiální pomoc.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 2,
    economicCostPerTurn: 0,
    rampUpDays: 14,
    complianceDecayRate: 0,
    unlockCondition: { type: 'hospital_occupancy_above', fraction: 0.7 },
    oneShot: true,
  },

  // ═══════════════════════════════════════════
  // ECONOMIC
  // ═══════════════════════════════════════════
  {
    id: 'business_support',
    name: 'Kompenzace podnikatelům',
    category: 'economic',
    description: 'Kompenzační program pro firmy postižené opatřeními. Snižuje ekonomické škody ale stojí fiskálně.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: -2, // negative = gains social capital!
    economicCostPerTurn: 0.15,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'kurzarbeit',
    name: 'Kurzarbeit (Antivirus)',
    category: 'economic',
    description: 'Stát platí část mezd zaměstnancům firem postižených opatřeními. Snižuje nezaměstnanost.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: -3,
    economicCostPerTurn: 0.2,
    rampUpDays: 14,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'public_campaign',
    name: 'Informační kampaň',
    category: 'economic',
    description: 'Vládní mediální kampaň o prevenci. Mírně zvyšuje compliance a sociální kapitál.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.97 },
    politicalCostPerTurn: -1,
    economicCostPerTurn: 0.02,
    rampUpDays: 7,
    complianceDecayRate: 0.001,
    unlockCondition: { type: 'always' },
    detectionRateBonus: 0.03,
  },
];

/** Get a measure by ID. */
export function getMeasureById(id: string): GameMeasure | undefined {
  return MEASURE_CATALOG.find(m => m.id === id);
}

/** Get all measures in a given category. */
export function getMeasuresByCategory(category: GameMeasure['category']): GameMeasure[] {
  return MEASURE_CATALOG.filter(m => m.category === category);
}

/** Get all measure IDs. */
export function getAllMeasureIds(): string[] {
  return MEASURE_CATALOG.map(m => m.id);
}

/** Check whether a measure's unlock condition is satisfied. */
export function isMeasureUnlocked(
  measure: GameMeasure,
  state: {
    turnNumber: number;
    socialCapital: number;
    cumulativeDeaths: number;
    hospitalOccupancyFraction: number;
    unlockedByEvents: Set<string>;
  },
): boolean {
  const cond = measure.unlockCondition;
  switch (cond.type) {
    case 'always':
      return true;
    case 'turn_reached':
      return state.turnNumber >= cond.turn;
    case 'social_capital_below':
      return state.socialCapital < cond.threshold;
    case 'social_capital_above':
      return state.socialCapital >= cond.threshold;
    case 'event_triggered':
      return state.unlockedByEvents.has(cond.eventId);
    case 'deaths_above':
      return state.cumulativeDeaths >= cond.threshold;
    case 'hospital_occupancy_above':
      return state.hospitalOccupancyFraction >= cond.fraction;
    default:
      return false;
  }
}

/** Default set of measure IDs for a standard COVID-like scenario. */
export function defaultMeasureIds(): string[] {
  return MEASURE_CATALOG.map(m => m.id);
}
