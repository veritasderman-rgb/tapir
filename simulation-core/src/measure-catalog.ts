import {
  type GameMeasure,
  NPIType,
  ComplianceModel,
} from './types';

/**
 * Global Catalog of all available measures.
 * New measures are added here.
 */
export const MEASURE_CATALOG: GameMeasure[] = [
  // ═══════════════════════════════════════════
  // SOCIAL DISTANCING
  // ═══════════════════════════════════════════
  {
    id: 'school_closure',
    name: 'Uzavření škol',
    category: 'social_distancing',
    description: 'Kompletní uzavření základních a středních škol. Výrazně omezí šíření mezi dětmi, ale má vysoké sociální a ekonomické náklady.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.2, targetSubMatrix: 'school' },
    politicalCostPerTurn: 8,
    economicCostPerTurn: 0.15,
    rampUpDays: 1,
    complianceDecayRate: 0.005,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'wfh_mandate',
    name: 'Povinný Home-office',
    category: 'social_distancing',
    description: 'Nařízení práce z domova všude, kde je to možné. Omezuje kontakty na pracovištích.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.4, targetSubMatrix: 'work' },
    politicalCostPerTurn: 4,
    economicCostPerTurn: 0.22,
    rampUpDays: 3,
    complianceDecayRate: 0.002,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'community_lockdown',
    name: 'Lockdown (omezení pohybu)',
    category: 'social_distancing',
    description: 'Zákaz vycházení a omezení setkávání ve veřejném prostoru. Nejsilnější nástroj, ale s extrémními náklady.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.3, targetSubMatrix: 'community' },
    politicalCostPerTurn: 15,
    economicCostPerTurn: 0.45,
    rampUpDays: 2,
    complianceDecayRate: 0.01,
    unlockCondition: { type: 'social_capital_below', threshold: 60 },
    authority: 'premier',
  },
  {
    id: 'military_lockdown',
    name: 'Lockdown vynucený armádou',
    category: 'social_distancing',
    description: 'Vojenské hlídky v ulicích vynucují zákaz vycházení. Udržuje vysokou účinnost i při nízké sociální stabilitě, ale drasticky dopadá na svobody.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.25, targetSubMatrix: 'community' },
    politicalCostPerTurn: 25,
    economicCostPerTurn: 0.6,
    rampUpDays: 1,
    complianceDecayRate: 0.0,
    unlockCondition: { type: 'social_capital_below', threshold: 30 },
    authority: 'premier',
  },

  // ═══════════════════════════════════════════
  // MASKS
  // ═══════════════════════════════════════════
  {
    id: 'mask_mandate_indoor',
    name: 'Roušky ve vnitřních prostorách',
    category: 'masks',
    description: 'Povinnost nosit roušky v obchodech, úřadech a MHD. Nízká cena, solidní efekt.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.85 },
    politicalCostPerTurn: 2,
    economicCostPerTurn: 0.015,
    rampUpDays: 1,
    complianceDecayRate: 0.001,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'mask_mandate_outdoor',
    name: 'Venkovní roušky',
    category: 'masks',
    description: 'Povinnost nosit roušky i venku na veřejnosti. Epidemiologický efekt je zanedbatelný, ale opatření má vysokou viditelnost. Výrazně zvyšuje společenské napětí.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.999 },
    politicalCostPerTurn: 8,
    economicCostPerTurn: 0.015,
    rampUpDays: 1,
    complianceDecayRate: 0.005,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'respirators_mandatory',
    name: 'Povinné FFP2/3 respirátory',
    category: 'masks',
    description: 'Zpřísnění na ochranu typu FFP2 ve veřejných prostorách. Výrazně vyšší ochrana než látkové roušky.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.7 },
    politicalCostPerTurn: 4,
    economicCostPerTurn: 0.03,
    rampUpDays: 3,
    complianceDecayRate: 0.001,
    unlockCondition: { type: 'deaths_above', threshold: 100 },
  },

  // ═══════════════════════════════════════════
  // TESTING & SURVEILLANCE
  // ═══════════════════════════════════════════
  {
    id: 'contact_tracing',
    name: 'Chytrá karanténa & trasování',
    category: 'testing',
    description: 'Trasování kontaktů a cílená izolace. Pomáhá brzdit epidemii bez plošných uzávěr, ale vyžaduje funkční hygienu.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.92 },
    politicalCostPerTurn: 1,
    economicCostPerTurn: 0.045,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
    detectionRateBonus: 0.1,
  },
  {
    id: 'mass_testing_workplace',
    name: 'Povinné testování ve firmách',
    category: 'testing',
    description: 'Plošné antigenní testování zaměstnanců. Zvyšuje záchyt bezpříznakových, ale zatěžuje rozpočet a firmy.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.95 },
    politicalCostPerTurn: 3,
    economicCostPerTurn: 0.12,
    rampUpDays: 10,
    complianceDecayRate: 0,
    unlockCondition: { type: 'turn_reached', turn: 4 },
    detectionRateBonus: 0.15,
  },

  // ═══════════════════════════════════════════
  // VACCINATION
  // ═══════════════════════════════════════════
  {
    id: 'vaccination_standard',
    name: 'Vakcinace — ordinace PL',
    category: 'vaccination',
    description: 'Distribuce vakcín přes praktické lékaře. Pomalý náběh, ale vysoká důvěra pacientů.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: -1,
    economicCostPerTurn: 0.075,
    rampUpDays: 14,
    complianceDecayRate: 0,
    unlockCondition: { type: 'event_triggered', eventId: 'vaccine_available' },
    vaccinationCapacityBonus: 5000,
    exclusiveGroup: 'vaccination_capacity',
  },
  {
    id: 'vaccination_centers',
    name: 'Velkokapacitní očkovací centra',
    category: 'vaccination',
    description: 'Masivní očkovací centra v halách a stadionech. Rychlá distribuce, logisticky náročné.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 2,
    economicCostPerTurn: 0.22,
    rampUpDays: 21,
    complianceDecayRate: 0,
    unlockCondition: { type: 'event_triggered', eventId: 'vaccine_available' },
    vaccinationCapacityBonus: 15000,
    exclusiveGroup: 'vaccination_capacity',
    authority: 'premier',
  },
  {
    id: 'vaccination_max',
    name: 'Vakcinace — armádní logistika',
    category: 'vaccination',
    description: 'Nasazení armády do distribuce vakcín. Maximální kapacita, ale politicky kontroverzní. Vojenská logistika je efektivní, ale může odradit část veřejnosti.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 6,
    economicCostPerTurn: 0.38,
    rampUpDays: 14,
    complianceDecayRate: 0,
    unlockCondition: { type: 'event_triggered', eventId: 'vaccine_available' },
    vaccinationCapacityBonus: 25000,
    exclusiveGroup: 'vaccination_capacity',
    authority: 'premier',
  },

  // ═══════════════════════════════════════════
  // MILITARY
  // ═══════════════════════════════════════════
  {
    id: 'bed_restructuring',
    name: 'Restrukturalizace lůžek',
    category: 'military',
    description: 'Ukončení standardní péče — veškerá lůžková kapacita převedena na epidemii. Zdvojnásobí dostupná lůžka (standardní i ICU), ale za cenu odložených úmrtí z neléčených chronických pacientů a extrémních nákladů. Projeví se až po 2 kolech (postupné uvolňování kapacit).',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 15,
    economicCostPerTurn: 0.6,
    rampUpDays: 28,
    complianceDecayRate: 0,
    unlockCondition: { type: 'hospital_occupancy_above', fraction: 0.5 },
    hospitalCapacityMultiplier: 2.0,
  },
  {
    id: 'army_hospitals',
    name: 'Polní nemocnice (armáda)',
    category: 'military',
    description: 'Armáda staví polní nemocnice. Navýší lůžkovou kapacitu, ale kvalita péče v polních podmínkách je nižší. Veřejnost vnímá jako signál krize.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 5,
    economicCostPerTurn: 0.15,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'hospital_occupancy_above', fraction: 0.6 },
    oneShot: true,
    authority: 'premier',
  },
  {
    id: 'army_enforcement',
    name: 'Armáda — kontrola opatření',
    category: 'military',
    description: 'Nasazení armády ke kontrole dodržování opatření. Zvyšuje vymahatelnost i při nízké důvěře, ale pohled vojáků v ulicích může vyvolat odpor.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.92 },
    politicalCostPerTurn: 10,
    economicCostPerTurn: 0.12,
    rampUpDays: 3,
    complianceDecayRate: 0,
    unlockCondition: { type: 'social_capital_below', threshold: 40 },
    intelBonus: 0.1,
    authority: 'premier',
  },
  {
    id: 'army_logistics',
    name: 'Armáda — logistická podpora',
    category: 'military',
    description: 'Armáda pomáhá s distribucí testů a zásob. Přináší organizační kapacity, které civilní sektor nemá, ale trvá než se zapojí.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.97 },
    politicalCostPerTurn: 3,
    economicCostPerTurn: 0.075,
    rampUpDays: 5,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
    detectionRateBonus: 0.05,
    authority: 'premier',
  },

  // ═══════════════════════════════════════════
  // INTERNATIONAL
  // ═══════════════════════════════════════════
  {
    id: 'who_consultation',
    name: 'Konzultace s WHO',
    category: 'international',
    description: 'Pravidelné konzultace s WHO a sdílení dat se zahraničními partnery. Zpřesňuje odhady a — klíčové — informace ze zahraničí mohou odhalit nové mutace dříve než se objeví u nás.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 1,
    economicCostPerTurn: 0.015,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
    intelBonus: 0.3,
  },
  {
    id: 'international_aid',
    name: 'Mezinárodní pomoc (EU)',
    category: 'international',
    description: 'Aktivace mechanismu EU pro krizovou pomoc. Přinese materiální pomoc a posily do nemocnic, ale koordinace s EU trvá — efekt přijde se zpožděním.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 2,
    economicCostPerTurn: 0,
    rampUpDays: 14,
    complianceDecayRate: 0,
    unlockCondition: { type: 'hospital_occupancy_above', fraction: 0.7 },
    oneShot: true,
    authority: 'premier',
  },

  // ═══════════════════════════════════════════
  // ECONOMIC & FLAVOR
  // ═══════════════════════════════════════════
  {
    id: 'eat_vitamins',
    name: 'Jezte ovoce a vitamíny!',
    category: 'economic',
    description: 'Vládní doporučení ke zdravé stravě a konzumaci vitamínů. Reálný dopad na virus je nulový, ale vládní PR tým to považuje za skvělý nápad. Stojí to jeden bod politického kapitálu za kampaň.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 1,
    economicCostPerTurn: 0.008,
    rampUpDays: 0,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'business_support',
    name: 'Kompenzace podnikatelům',
    category: 'economic',
    description: 'Kompenzační program pro firmy. Nezastaví epidemii, ale zmírní ekonomické škody a zvýší ochotu veřejnosti akceptovat omezení.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: -2,
    economicCostPerTurn: 0.22,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
    authority: 'premier',
  },
  {
    id: 'kurzarbeit',
    name: 'Kurzarbeit (Antivirus)',
    category: 'economic',
    description: 'Stát platí část mezd. Udržuje zaměstnanost a stabilitu v době restrikcí. Fiskálně náročné, ale bez něj hrozí masová nezaměstnanost.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: -3,
    economicCostPerTurn: 0.3,
    rampUpDays: 14,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
    authority: 'premier',
  },
  {
    id: 'public_campaign',
    name: 'Informační kampaň',
    category: 'economic',
    description: 'Vládní mediální kampaň o prevenci. Může mírně zlepšit chování, ale pokud je důvěra nízká, kampaň může působit kontraproduktivně.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.97 },
    politicalCostPerTurn: -1,
    economicCostPerTurn: 0.03,
    rampUpDays: 7,
    complianceDecayRate: 0.001,
    unlockCondition: { type: 'always' },
    detectionRateBonus: 0.03,
  },
  {
    id: 'opposition_briefing',
    name: 'Pravidelný briefing opozice',
    category: 'economic',
    description: 'Pravidelné informování opozice o situaci. Nezpomalí virus, ale může výrazně zvýšit politickou legitimitu opatření a odolnost vůči kritice.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: -4,
    economicCostPerTurn: 0.015,
    rampUpDays: 0,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'media_transparency',
    name: 'Transparentní mediální komunikace',
    category: 'economic',
    description: 'Denní tiskové konference s přímými daty. Krátkodobě může způsobit paniku, ale dlouhodobě buduje důvěru. Lepší informovanost vede k odpovědnějšímu chování.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.98 },
    politicalCostPerTurn: -3,
    economicCostPerTurn: 0.03,
    rampUpDays: 3,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
    detectionRateBonus: 0.05,
  },
  {
    id: 'community_leaders',
    name: 'Zapojení komunitních lídrů',
    category: 'economic',
    description: 'Spolupráce s místními autoritami a komunitními lídry. Může otevřít dveře do skupin, kde vládní komunikace selhává. Efekt je pomalý, ale trvalý.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.96 },
    politicalCostPerTurn: -2,
    economicCostPerTurn: 0.045,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
  },
  {
    id: 'data_dashboard',
    name: 'Veřejný datový dashboard',
    category: 'economic',
    description: 'Otevřená data o epidemii v reálném čase. Zvyšuje důvěru a umožňuje nezávislé hodnocení situace. Zpřesňuje vlastní analýzy štábu.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: -1,
    economicCostPerTurn: 0.015,
    rampUpDays: 14,
    complianceDecayRate: 0,
    unlockCondition: { type: 'always' },
    intelBonus: 0.2,
    detectionRateBonus: 0.03,
  },
  {
    id: 'mental_health_support',
    name: 'Program psychické podpory',
    category: 'economic',
    description: 'Telefonní linky pomoci, psychologická podpora. Nezmění křivky, ale může zpomalit sociální únavu a udržet ochotu veřejnosti spolupracovat.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: -2,
    economicCostPerTurn: 0.06,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'social_capital_below', threshold: 50 },
    authority: 'premier',
  },
];

export function getMeasureById(id: string): GameMeasure | undefined {
  return MEASURE_CATALOG.find(m => m.id === id);
}

export function getMeasuresByCategory(category: GameMeasure['category']): GameMeasure[] {
  return MEASURE_CATALOG.filter(m => m.category === category);
}

export function getAllMeasureIds(): string[] {
  return MEASURE_CATALOG.map(m => m.id);
}

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

export function defaultMeasureIds(): string[] {
  return MEASURE_CATALOG.map(m => m.id);
}
