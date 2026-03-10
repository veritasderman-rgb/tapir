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
    description: 'Dobrovolné nošení roušek v uzavřených prostorách. Závisí na ochotě veřejnosti — efekt je nejistý a postupně slábne.',
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
    description: 'Povinné chirurgické roušky ve vnitřních prostorách. Odborníci odhadují znatelné snížení přenosu, ale reálný efekt závisí na dodržování.',
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
    description: 'FFP2 povinné v MHD, obchodech, školách. Významně účinnější než chirurgické roušky, ale veřejnost je nese hůře a compliance klesá rychleji.',
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
    description: 'Zákaz akcí nad 100 osob. Omezí superspreaderské události, ale dopad na celkovou křivku může být omezený pokud se přenos děje jinde.',
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
    description: 'Drastický zákaz shromažďování nad 10 osob. Silně omezí komunitní přenos, ale společenský a ekonomický dopad je vysoký a trpělivost veřejnosti rychle klesá.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.4, targetSubMatrix: 'community' },
    politicalCostPerTurn: 8,
    economicCostPerTurn: 0.3,
    rampUpDays: 0,
    complianceDecayRate: 0.015,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'mass_events',
    authority: 'premier',
  },
  {
    id: 'school_closure_partial',
    name: 'Rotační výuka (školy)',
    category: 'social_distancing',
    description: 'Střídavá prezenční/distanční výuka. Sníží kontakty mezi dětmi, ale vliv na celkovou epidemii závisí na tom, jak moc děti přenášejí virus v dané epidemii.',
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
    description: 'Kompletní distanční výuka. Prakticky eliminuje školní přenos, ale může paradoxně zvýšit kontakty v domácnostech. Silný dopad na rodiny a pracovní trh.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.2, targetSubMatrix: 'school' },
    politicalCostPerTurn: 10,
    economicCostPerTurn: 0.2,
    rampUpDays: 1,
    complianceDecayRate: 0.02,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'schools',
    authority: 'premier',
  },
  {
    id: 'homeoffice_recommendation',
    name: 'Doporučení home office',
    category: 'social_distancing',
    description: 'Dobrovolný home office. Závisí na ochotě zaměstnavatelů — některé sektory nemohou pracovat z domova. Očekává se mírný efekt.',
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
    description: 'Povinný home office kde je technicky možný. Výrazně sníží pracovní kontakty, ale řada profesí nemůže pracovat z domova — ekonomický dopad je značný.',
    npiEffect: { type: NPIType.ContactSubMatrixModifier, value: 0.4, targetSubMatrix: 'work' },
    politicalCostPerTurn: 6,
    economicCostPerTurn: 0.25,
    rampUpDays: 3,
    complianceDecayRate: 0.01,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'work',
    authority: 'premier',
  },
  {
    id: 'curfew_night',
    name: 'Noční zákaz vycházení',
    category: 'social_distancing',
    description: 'Zákaz pohybu 21:00–05:00. Hlavně symbolický efekt a omezení nočního společenského života. Skutečný epidemiologický přínos je odborníky zpochybňován.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.85 },
    politicalCostPerTurn: 8,
    economicCostPerTurn: 0.15,
    rampUpDays: 0,
    complianceDecayRate: 0.02,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'curfew',
    authority: 'premier',
  },
  {
    id: 'lockdown_full',
    name: 'Úplný lockdown',
    category: 'social_distancing',
    description: 'Zákaz vycházení kromě nezbytných cest. Nejúčinnější dostupné opatření — ale za obrovskou ekonomickou a společenskou cenu. Dlouhodobě neudržitelné.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.50 },
    politicalCostPerTurn: 18,
    economicCostPerTurn: 0.8,
    rampUpDays: 1,
    complianceDecayRate: 0.03,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'curfew',
    authority: 'premier',
  },
  {
    id: 'restaurant_closure',
    name: 'Zavření restaurací a barů',
    category: 'social_distancing',
    description: 'Restaurace pouze výdejní okénko, bary zavřeny. Odstraní jedno z rizikových prostředí, ale lidé se mohou přesunout do soukromých prostor kde je kontrola nemožná.',
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
    description: 'PCR testy pro symptomatické a jejich kontakty. Zlepší přehled o situaci, ale nezachytí asymptomatické šiřitele. Trvá než se rozběhne.',
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
    description: 'Plošné antigenní testování s PCR konfirmací. Výrazně zlepší detekci, ale trvá týdny než se vybuduje kapacita. Riziko falešné bezpečnosti při negativních testech.',
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
    description: 'Hygienické stanice trasují kontakty pozitivních. Při nízkých počtech velmi efektivní, ale při tisících případech denně se systém zahltí.',
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
    description: 'Povinná izolace po pozitivním testu. Teoreticky silně účinné, ale záleží na testovací kapacitě a ochotě lidí se hlásit.',
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
    description: 'Povinný negativní test při vstupu. Může zpomalit import nových variant, ale pokud se virus už šíří v populaci, přínos je omezený.',
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
    description: 'Uzavření hranic kromě nákladní dopravy. Zpočátku může pomoci, ale pokud je virus komunitně rozšířen, jde spíš o politické gesto s vysokou ekonomickou cenou.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 0.90 },
    politicalCostPerTurn: 7,
    economicCostPerTurn: 0.3,
    rampUpDays: 2,
    complianceDecayRate: 0.01,
    unlockCondition: { type: 'always' },
    exclusiveGroup: 'borders',
    authority: 'premier',
  },

  // ═══════════════════════════════════════════
  // VACCINATION (gated — require unlock event)
  // ═══════════════════════════════════════════
  {
    id: 'vaccination_slow',
    name: 'Vakcinace — standardní kapacita',
    category: 'vaccination',
    description: 'Distribuce přes praktické lékaře. Pomalý náběh, ale spolehlivé. Účinnost vakcíny závisí na typu viru — u některých kmenů může být nižší než se čekalo.',
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
    description: 'Vybudování velkokapacitních center. Výrazně rychlejší, ale logisticky náročné — chyby v organizaci mohou zpočátku zpomalit celý proces.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: 4,
    economicCostPerTurn: 0.15,
    rampUpDays: 14,
    complianceDecayRate: 0,
    unlockCondition: { type: 'event_triggered', eventId: 'vaccine_available' },
    vaccinationCapacityBonus: 10000,
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
    economicCostPerTurn: 0.25,
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
    economicCostPerTurn: 0.4,
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
    economicCostPerTurn: 0.1,
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
    economicCostPerTurn: 0.08,
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
    economicCostPerTurn: 0.05,
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
  // ECONOMIC & TRUST-BUILDING
  // ═══════════════════════════════════════════
  {
    id: 'business_support',
    name: 'Kompenzace podnikatelům',
    category: 'economic',
    description: 'Kompenzační program pro firmy. Nezastaví epidemii, ale zmírní ekonomické škody a zvýší ochotu veřejnosti akceptovat omezení.',
    npiEffect: { type: NPIType.BetaMultiplier, value: 1.0 },
    politicalCostPerTurn: -2,
    economicCostPerTurn: 0.15,
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
    economicCostPerTurn: 0.2,
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
    economicCostPerTurn: 0.02,
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
    economicCostPerTurn: 0.01,
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
    economicCostPerTurn: 0.02,
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
    economicCostPerTurn: 0.03,
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
    economicCostPerTurn: 0.01,
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
    economicCostPerTurn: 0.04,
    rampUpDays: 7,
    complianceDecayRate: 0,
    unlockCondition: { type: 'social_capital_below', threshold: 50 },
    authority: 'premier',
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
