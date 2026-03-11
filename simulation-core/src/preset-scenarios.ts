/**
 * Pre-built epidemic scenarios for Crisis Staff mode.
 * Each scenario creates a complete GameScenario that can be loaded directly.
 */

import { type GameScenario, type HiddenEvent } from './types';
import {
  defaultScenario,
  defaultEpiConfig,
  defaultDemographics,
  defaultHealthCapacity,
  defaultVaccinationConfig,
  defaultContactMatrix,
  defaultStochasticConfig,
  defaultDelayConfig,
  defaultReportingConfig,
  CURRENT_SCHEMA_VERSION,
} from './scenario-schema';
import { MEASURE_CATALOG } from './measure-catalog';

const allMeasureIds = MEASURE_CATALOG.map((m) => m.id);

export interface PresetScenario {
  id: string;
  name: string;
  emoji: string;
  difficulty: 'snadný' | 'střední' | 'těžký' | 'extrémní';
  description: string;
  detail: string;
  scenario: GameScenario;
}

// ─── 1. Ptačí chřipka (Bird Flu) ───────────────────────────────────────────
// Every 4 weeks new variant with increasing transmissibility over 1 year.
// Hospital crash at turn 13. WHO intel at turn 3.
// Vaccination starts month 4 (turn 8). All measures available.

function birdFluScenario(): GameScenario {
  const base = defaultScenario('Ptačí chřipka H5N1');
  base.days = 365;
  base.epiConfig = {
    ...defaultEpiConfig(),
    R0: 1.8,
    latentPeriod: 2,
    infectiousPeriod: 5,
    stratumParams: [
      // Child standard - lower risk
      { ifr: 0.001, hospRate: 0.02, icuRate: 0.15 },
      // Child risk
      { ifr: 0.005, hospRate: 0.06, icuRate: 0.25 },
      // Adult standard
      { ifr: 0.008, hospRate: 0.06, icuRate: 0.25 },
      // Adult risk
      { ifr: 0.03, hospRate: 0.15, icuRate: 0.35 },
      // Senior standard
      { ifr: 0.05, hospRate: 0.2, icuRate: 0.4 },
      // Senior risk
      { ifr: 0.15, hospRate: 0.35, icuRate: 0.5 },
    ],
  };
  base.demographics = {
    ...defaultDemographics(),
    totalPopulation: 10_000_000,
    initialInfectious: 5,
  };
  base.healthCapacity = {
    hospitalBeds: 25_000,
    icuBeds: 2_500,
    excessMortalityRate: 0.35,
  };
  base.vaccination = {
    ...defaultVaccinationConfig(),
    enabled: true,
    dosesPerDay: 30_000,
    startDay: 999, // unlocked by event
    peakVEInfection: 0.7,
    peakVESevere: 0.9,
    waningHalfLifeDays: 120,
  };

  const events: HiddenEvent[] = [
    // WHO intel turn 3 - virus may be worsening
    {
      id: 'who-intel-3',
      type: 'who_intel',
      turn: 3,
      label: 'WHO varování: nové poznatky ukazují na zhoršení schopnosti viru nakazit více lidí',
      payload: { intelBonus: 0.3 },
    },
    // Variant every ~2 turns (4 weeks) with increasing transmissibility
    {
      id: 'variant-t4',
      type: 'variant_shock',
      turn: 4,
      label: 'Nová varianta H5N1-B: mírně zvýšená nakažlivost',
      payload: { transmissibilityMultiplier: 1.15, immuneEscape: 0.05 },
    },
    {
      id: 'variant-t6',
      type: 'variant_shock',
      turn: 6,
      label: 'Varianta H5N1-C: další zvýšení přenositelnosti',
      payload: { transmissibilityMultiplier: 1.2, immuneEscape: 0.1 },
    },
    // Vaccination unlocked at turn 8 (~month 4)
    {
      id: 'vaccine-t8',
      type: 'vaccine_unlock',
      turn: 8,
      label: 'Vakcína proti H5N1 schválena k nouzovému použití',
      payload: {},
    },
    {
      id: 'variant-t8',
      type: 'variant_shock',
      turn: 8,
      label: 'Varianta H5N1-D: výrazně nakažlivější',
      payload: { transmissibilityMultiplier: 1.3, immuneEscape: 0.15 },
    },
    {
      id: 'variant-t10',
      type: 'variant_shock',
      turn: 10,
      label: 'Varianta H5N1-E: únik z imunity',
      payload: { transmissibilityMultiplier: 1.25, immuneEscape: 0.2 },
    },
    {
      id: 'variant-t12',
      type: 'variant_shock',
      turn: 12,
      label: 'Varianta H5N1-F: dominantní kmen, vysoká nakažlivost',
      payload: { transmissibilityMultiplier: 1.4, immuneEscape: 0.15 },
    },
    // Hospital crash turn 13
    {
      id: 'supply-t13',
      type: 'supply_disruption',
      turn: 13,
      label: 'Výpadek nemocnic: personál vyčerpán, lůžka nedostupná',
      payload: { bedReductionFraction: 0.4 },
    },
    {
      id: 'variant-t14',
      type: 'variant_shock',
      turn: 14,
      label: 'Varianta H5N1-G: nejnakažlivější dosud',
      payload: { transmissibilityMultiplier: 1.35, immuneEscape: 0.2 },
    },
    // Later variants
    {
      id: 'variant-t18',
      type: 'variant_shock',
      turn: 18,
      label: 'Varianta H5N1-H: částečný únik z vakcíny',
      payload: { transmissibilityMultiplier: 1.2, immuneEscape: 0.25 },
    },
    {
      id: 'variant-t22',
      type: 'variant_shock',
      turn: 22,
      label: 'Varianta H5N1-I: pozdní mutace',
      payload: { transmissibilityMultiplier: 1.15, immuneEscape: 0.1 },
    },
  ];

  return {
    baseScenario: base,
    totalTurns: 26, // 1 year
    daysPerTurn: 14,
    hiddenEvents: events,
    socialCapital: { initial: 100, recoveryRate: 0.5, collapseThreshold: 20 },
    availableMeasureIds: allMeasureIds,
    vaccinationLocked: true,
    premierTakeoverDeaths: 8_000,
  };
}

// ─── 2. Sezónní chřipka (Seasonal Flu) ─────────────────────────────────────
// Mild scenario. One mutation midway, nothing dramatic. Good intro scenario.

function fluScenario(): GameScenario {
  const base = defaultScenario('Sezónní chřipka');
  base.days = 180;
  base.epiConfig = {
    ...defaultEpiConfig(),
    R0: 1.4,
    latentPeriod: 2,
    infectiousPeriod: 5,
    stratumParams: [
      { ifr: 0.00001, hospRate: 0.002, icuRate: 0.05 },
      { ifr: 0.0001, hospRate: 0.01, icuRate: 0.1 },
      { ifr: 0.0002, hospRate: 0.005, icuRate: 0.1 },
      { ifr: 0.001, hospRate: 0.02, icuRate: 0.15 },
      { ifr: 0.005, hospRate: 0.05, icuRate: 0.2 },
      { ifr: 0.02, hospRate: 0.12, icuRate: 0.3 },
    ],
  };
  base.demographics = {
    ...defaultDemographics(),
    totalPopulation: 10_000_000,
    initialInfectious: 50,
  };
  base.healthCapacity = {
    hospitalBeds: 30_000,
    icuBeds: 3_000,
    excessMortalityRate: 0.2,
  };
  base.vaccination = {
    ...defaultVaccinationConfig(),
    enabled: true,
    dosesPerDay: 50_000,
    startDay: 999,
    peakVEInfection: 0.6,
    peakVESevere: 0.8,
    waningHalfLifeDays: 150,
  };

  const events: HiddenEvent[] = [
    {
      id: 'vaccine-t3',
      type: 'vaccine_unlock',
      turn: 3,
      label: 'Sezónní vakcína dostupná',
      payload: {},
    },
    {
      id: 'variant-t6',
      type: 'variant_shock',
      turn: 6,
      label: 'Mírná mutace: sezónní drift antigenu',
      payload: { transmissibilityMultiplier: 1.1, immuneEscape: 0.1 },
    },
  ];

  // Limited measures - no extreme military options needed
  const measureIds = allMeasureIds.filter(
    (id) => !['military_lockdown', 'army_hospitals', 'army_enforcement', 'army_logistics', 'international_aid'].includes(id)
  );

  return {
    baseScenario: base,
    totalTurns: 12, // 6 months
    daysPerTurn: 14,
    hiddenEvents: events,
    socialCapital: { initial: 100, recoveryRate: 0.8, collapseThreshold: 15 },
    availableMeasureIds: measureIds,
    vaccinationLocked: true,
    premierTakeoverDeaths: 50_000, // very high - unlikely to trigger
  };
}

// ─── 3. Ebola ───────────────────────────────────────────────────────────────
// Extreme difficulty. Very high mortality. Worsening every ~3 turns (6 weeks).
// Barely affects children. Contact tracing is key.

function ebolaScenario(): GameScenario {
  const base = defaultScenario('Ebola — západoafrický kmen');
  base.days = 365;
  base.epiConfig = {
    ...defaultEpiConfig(),
    R0: 2.0,
    latentPeriod: 8,
    infectiousPeriod: 10,
    stratumParams: [
      // Children barely affected
      { ifr: 0.05, hospRate: 0.3, icuRate: 0.3 },
      { ifr: 0.1, hospRate: 0.5, icuRate: 0.4 },
      // Adults severely affected
      { ifr: 0.4, hospRate: 0.7, icuRate: 0.5 },
      { ifr: 0.55, hospRate: 0.8, icuRate: 0.6 },
      // Seniors extremely affected
      { ifr: 0.6, hospRate: 0.85, icuRate: 0.6 },
      { ifr: 0.75, hospRate: 0.9, icuRate: 0.7 },
    ],
  };
  base.demographics = {
    ...defaultDemographics(),
    totalPopulation: 10_000_000,
    initialInfectious: 3,
  };
  base.healthCapacity = {
    hospitalBeds: 25_000,
    icuBeds: 2_000,
    excessMortalityRate: 0.5,
  };
  base.vaccination = {
    ...defaultVaccinationConfig(),
    enabled: true,
    dosesPerDay: 10_000,
    startDay: 999,
    peakVEInfection: 0.8,
    peakVESevere: 0.9,
    waningHalfLifeDays: 365,
  };
  // Ebola spreads more through close contact, less through community
  base.contactMatrix = {
    home: [
      [1.0, 0.6, 0.3],
      [0.6, 0.4, 0.3],
      [0.3, 0.3, 0.4],
    ],
    school: [
      [1.5, 0.2, 0.0],
      [0.2, 0.1, 0.0],
      [0.0, 0.0, 0.0],
    ],
    work: [
      [0.0, 0.3, 0.0],
      [0.3, 2.0, 0.2],
      [0.0, 0.2, 0.1],
    ],
    community: [
      [0.5, 0.5, 0.2],
      [0.5, 0.8, 0.4],
      [0.2, 0.4, 0.3],
    ],
  };

  const events: HiddenEvent[] = [
    {
      id: 'who-t2',
      type: 'who_intel',
      turn: 2,
      label: 'WHO potvrzuje: jedná se o Ebolu. Vysoká smrtnost, přenos tělními tekutinami.',
      payload: { intelBonus: 0.4 },
    },
    // Worsening every ~3 turns (6 weeks)
    {
      id: 'variant-t3',
      type: 'variant_shock',
      turn: 3,
      label: 'Mutace kmene: mírně zvýšená přenositelnost',
      payload: { transmissibilityMultiplier: 1.15, immuneEscape: 0.0 },
    },
    {
      id: 'unrest-t5',
      type: 'public_unrest',
      turn: 5,
      label: 'Veřejné nepokoje: strach z Eboly vede k panice a útokům na zdravotníky',
      payload: { penalty: 10 },
    },
    {
      id: 'variant-t6',
      type: 'variant_shock',
      turn: 6,
      label: 'Zhoršení: virus se efektivněji šíří v nemocničním prostředí',
      payload: { transmissibilityMultiplier: 1.2, immuneEscape: 0.0 },
    },
    {
      id: 'supply-t8',
      type: 'supply_disruption',
      turn: 8,
      label: 'Zdravotníci odmítají nastoupit do služby — strach z nákazy',
      payload: { bedReductionFraction: 0.3 },
    },
    {
      id: 'variant-t9',
      type: 'variant_shock',
      turn: 9,
      label: 'Třetí mutace: výrazně nakažlivější varianta',
      payload: { transmissibilityMultiplier: 1.25, immuneEscape: 0.05 },
    },
    {
      id: 'vaccine-t10',
      type: 'vaccine_unlock',
      turn: 10,
      label: 'Experimentální vakcína rVSV-ZEBOV schválena k prstencovému očkování',
      payload: {},
    },
    {
      id: 'variant-t12',
      type: 'variant_shock',
      turn: 12,
      label: 'Čtvrtá mutace: virus proniká do nových regionů',
      payload: { transmissibilityMultiplier: 1.2, immuneEscape: 0.1 },
    },
    {
      id: 'variant-t15',
      type: 'variant_shock',
      turn: 15,
      label: 'Pátá mutace: částečný únik z vakcíny',
      payload: { transmissibilityMultiplier: 1.15, immuneEscape: 0.15 },
    },
    {
      id: 'variant-t18',
      type: 'variant_shock',
      turn: 18,
      label: 'Šestá mutace: nejagresivnější kmen',
      payload: { transmissibilityMultiplier: 1.3, immuneEscape: 0.1 },
    },
  ];

  return {
    baseScenario: base,
    totalTurns: 24,
    daysPerTurn: 14,
    hiddenEvents: events,
    socialCapital: { initial: 80, recoveryRate: 0.3, collapseThreshold: 25 },
    availableMeasureIds: allMeasureIds,
    vaccinationLocked: true,
    premierTakeoverDeaths: 3_000,
  };
}

// ─── 4. SARS-CoV-3 (COVID-like new pandemic) ───────────────────────────────
// Classic pandemic scenario. 2 major waves with variant.
// Testing infrastructure key. Political pressure high.

function covidLikeScenario(): GameScenario {
  const base = defaultScenario('SARS-CoV-3 — nový koronavirus');
  base.days = 365;
  base.epiConfig = {
    ...defaultEpiConfig(),
    R0: 3.0,
    latentPeriod: 4,
    infectiousPeriod: 8,
    stratumParams: [
      { ifr: 0.00005, hospRate: 0.005, icuRate: 0.1 },
      { ifr: 0.0005, hospRate: 0.02, icuRate: 0.15 },
      { ifr: 0.003, hospRate: 0.04, icuRate: 0.2 },
      { ifr: 0.015, hospRate: 0.1, icuRate: 0.3 },
      { ifr: 0.03, hospRate: 0.15, icuRate: 0.35 },
      { ifr: 0.1, hospRate: 0.3, icuRate: 0.45 },
    ],
  };
  base.demographics = {
    ...defaultDemographics(),
    totalPopulation: 10_000_000,
    initialInfectious: 15,
  };
  base.healthCapacity = {
    hospitalBeds: 28_000,
    icuBeds: 2_800,
    excessMortalityRate: 0.3,
  };
  base.vaccination = {
    ...defaultVaccinationConfig(),
    enabled: true,
    dosesPerDay: 40_000,
    startDay: 999,
    peakVEInfection: 0.8,
    peakVESevere: 0.92,
    waningHalfLifeDays: 150,
  };

  const events: HiddenEvent[] = [
    {
      id: 'who-t2',
      type: 'who_intel',
      turn: 2,
      label: 'WHO vyhlašuje pandemii SARS-CoV-3. Doporučena okamžitá opatření.',
      payload: { intelBonus: 0.25 },
    },
    {
      id: 'unrest-t5',
      type: 'public_unrest',
      turn: 5,
      label: 'Protesty proti omezením: „Chceme zpět do práce!"',
      payload: { penalty: 8 },
    },
    // First wave peaks, then variant
    {
      id: 'variant-t8',
      type: 'variant_shock',
      turn: 8,
      label: 'Varianta Delta-3: výrazně nakažlivější, částečný únik z imunity',
      payload: { transmissibilityMultiplier: 1.5, immuneEscape: 0.2 },
    },
    {
      id: 'vaccine-t9',
      type: 'vaccine_unlock',
      turn: 9,
      label: 'mRNA vakcína schválena k nouzovému použití',
      payload: {},
    },
    {
      id: 'supply-t11',
      type: 'supply_disruption',
      turn: 11,
      label: 'Nedostatek kyslíkových přístrojů: globální poptávka převyšuje výrobu',
      payload: { bedReductionFraction: 0.25 },
    },
    // Second wave with new variant
    {
      id: 'variant-t15',
      type: 'variant_shock',
      turn: 15,
      label: 'Varianta Omega: masivní únik z vakcíny, druhá vlna',
      payload: { transmissibilityMultiplier: 1.3, immuneEscape: 0.35 },
    },
    {
      id: 'unrest-t17',
      type: 'public_unrest',
      turn: 17,
      label: 'Anti-lockdown hnutí: masové demonstrace v hlavním městě',
      payload: { penalty: 12 },
    },
    {
      id: 'who-t20',
      type: 'who_intel',
      turn: 20,
      label: 'WHO: nová data ukazují, že virus slábne. Konec je na dohled.',
      payload: { intelBonus: 0.2 },
    },
  ];

  return {
    baseScenario: base,
    totalTurns: 24,
    daysPerTurn: 14,
    hiddenEvents: events,
    socialCapital: { initial: 90, recoveryRate: 0.5, collapseThreshold: 20 },
    availableMeasureIds: allMeasureIds,
    vaccinationLocked: true,
    premierTakeoverDeaths: 10_000,
  };
}

// ─── 5. Neštovice (Smallpox bioterror) ──────────────────────────────────────
// Sudden bioterror attack. Very high mortality. Vaccination exists but
// limited supply. Starts explosive, then containable if managed well.

function smallpoxScenario(): GameScenario {
  const base = defaultScenario('Variola major — bioteroristický útok');
  base.days = 270;
  base.epiConfig = {
    ...defaultEpiConfig(),
    R0: 5.0,
    latentPeriod: 12,
    infectiousPeriod: 14,
    stratumParams: [
      // High mortality across all groups
      { ifr: 0.1, hospRate: 0.4, icuRate: 0.3 },
      { ifr: 0.2, hospRate: 0.6, icuRate: 0.4 },
      { ifr: 0.2, hospRate: 0.5, icuRate: 0.35 },
      { ifr: 0.35, hospRate: 0.65, icuRate: 0.45 },
      { ifr: 0.35, hospRate: 0.6, icuRate: 0.4 },
      { ifr: 0.5, hospRate: 0.75, icuRate: 0.5 },
    ],
  };
  base.demographics = {
    ...defaultDemographics(),
    totalPopulation: 10_000_000,
    initialInfectious: 100, // deliberate release
  };
  base.healthCapacity = {
    hospitalBeds: 25_000,
    icuBeds: 2_500,
    excessMortalityRate: 0.4,
  };
  base.vaccination = {
    ...defaultVaccinationConfig(),
    enabled: true,
    dosesPerDay: 20_000,
    startDay: 999,
    peakVEInfection: 0.95,
    peakVESevere: 0.98,
    waningHalfLifeDays: 3650, // 10 years
  };

  const events: HiddenEvent[] = [
    {
      id: 'who-t1',
      type: 'who_intel',
      turn: 1,
      label: 'ÚZIS potvrzuje: variola major. Okamžitě aktivovat krizové plány.',
      payload: { intelBonus: 0.5 },
    },
    {
      id: 'unrest-t2',
      type: 'public_unrest',
      turn: 2,
      label: 'Masová panika: lidé opouštějí město, zásobovací krize',
      payload: { penalty: 15 },
    },
    {
      id: 'vaccine-t3',
      type: 'vaccine_unlock',
      turn: 3,
      label: 'Státní zásoby vakcíny proti neštovicím uvolněny (omezený počet dávek)',
      payload: {},
    },
    {
      id: 'supply-t4',
      type: 'supply_disruption',
      turn: 4,
      label: 'Zdravotníci v karanténě: 20 % personálu nedostupné',
      payload: { bedReductionFraction: 0.2 },
    },
    {
      id: 'unrest-t6',
      type: 'public_unrest',
      turn: 6,
      label: 'Konspirační teorie: „vláda nás naočkovala virem"',
      payload: { penalty: 10 },
    },
    {
      id: 'supply-t8',
      type: 'supply_disruption',
      turn: 8,
      label: 'Druhá vlna kolapsu nemocnic: vyčerpaní zdravotníci, chybí materiál',
      payload: { bedReductionFraction: 0.3 },
    },
    {
      id: 'who-t10',
      type: 'who_intel',
      turn: 10,
      label: 'WHO: mezinárodní pomoc na cestě, dodávky vakcín z USA a Ruska',
      payload: { intelBonus: 0.3 },
    },
  ];

  return {
    baseScenario: base,
    totalTurns: 18, // 9 months
    daysPerTurn: 14,
    hiddenEvents: events,
    socialCapital: { initial: 70, recoveryRate: 0.4, collapseThreshold: 25 },
    availableMeasureIds: allMeasureIds,
    vaccinationLocked: true,
    premierTakeoverDeaths: 2_000,
  };
}

// ─── Export all presets ─────────────────────────────────────────────────────

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'flu',
    name: 'Sezónní chřipka',
    emoji: '🤧',
    difficulty: 'snadný',
    description: 'Mírná sezónní vlna chřipky. Jedna mutace, očkování brzy dostupné.',
    detail: '6 měsíců, R₀ = 1.4, nízká smrtnost. Ideální pro první seznámení s krizovým řízením.',
    scenario: fluScenario(),
  },
  {
    id: 'bird-flu',
    name: 'Ptačí chřipka H5N1',
    emoji: '🐦',
    difficulty: 'těžký',
    description: 'Každé 4 týdny nová varianta se zvyšující se nakažlivostí. Výpadek nemocnic ve 13. kole.',
    detail: '1 rok, R₀ = 1.8, WHO varování ve 3. kole, očkování od 4. měsíce. Všechna opatření k dispozici.',
    scenario: birdFluScenario(),
  },
  {
    id: 'covid-like',
    name: 'SARS-CoV-3',
    emoji: '🦠',
    difficulty: 'střední',
    description: 'Nový koronavirus s dvěma vlnami. Varianta Delta-3 a Omega, silný politický tlak.',
    detail: '1 rok, R₀ = 3.0, protestní hnutí, nedostatek vybavení. Klasický pandemický scénář.',
    scenario: covidLikeScenario(),
  },
  {
    id: 'ebola',
    name: 'Ebola',
    emoji: '💀',
    difficulty: 'extrémní',
    description: 'Extrémní smrtnost, zhoršení každých 6 týdnů. Téměř nezasahuje děti, dospělí a senioři v ohrožení.',
    detail: '1 rok, R₀ = 2.0, IFR až 75 % u rizikových seniorů. Panika, útoky na zdravotníky.',
    scenario: ebolaScenario(),
  },
  {
    id: 'smallpox',
    name: 'Neštovice — bioterorizmus',
    emoji: '☣️',
    difficulty: 'extrémní',
    description: 'Úmyslné vypuštění varioly major. R₀ = 5, 100 nakažených od začátku. Zásoby vakcín omezené.',
    detail: '9 měsíců, masová panika, konspirační teorie, kolaps nemocnic. Rozhoduje rychlost reakce.',
    scenario: smallpoxScenario(),
  },
];
