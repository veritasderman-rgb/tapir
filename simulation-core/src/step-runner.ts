/**
 * Step Runner v2 — Turn-based simulation engine for Krizový štáb.
 *
 * 14-day turns, 24 turns = ~12 months.
 * Uses measure catalog instead of raw NPIs.
 * Includes economic model, advisory system, headline generation.
 */

import {
  type ScenarioConfig,
  type PopulationState,
  type DailyMetrics,
  type SimCheckpoint,
  type TurnAction,
  type TurnResult,
  type TurnReport,
  type TurnReportV2,
  type GameScenario,
  type HiddenEvent,
  type NPIConfig,
  type EconomicState,
  type GameMeasure,
  NPIType,
  ComplianceModel,
  NUM_STRATA,
} from './types';
import { sumContactMatrix } from './contact-matrix';
import { calibrateBeta } from './calibration/beta-calibration';
import { applyNPIs } from './npi-engine';
import { resolveVariantDay, computeVariantEffects, applyReinfectionBoost } from './variant-engine';
import {
  createDelayBuffers,
  serializeDelayBuffers,
  restoreDelayBuffers,
  type StratumDelayBuffers,
} from './delay-engine';
import { ReportingPipeline, type ReportingPipelineSnapshot, calculateWeightedIFR, calculateBaselineDeaths } from './reporting';
import { stepSEIRV } from './models/seirv';
import { initializePopulation } from './models/seir';
import { createRNG } from './stochastic';
import {
  stepSocialCapital,
  socialCapitalComplianceMultiplier,
} from './social-capital';
import { getMeasureById, isMeasureUnlocked, MEASURE_CATALOG } from './measure-catalog';
import { stepEconomics, defaultEconomicState, unemploymentSocialCapitalDrain } from './economics';
import { generateAdvisorMessages } from './advisors';
import { generateHeadlines } from './headlines';

/**
 * Convert a GameMeasure to an NPIConfig for the engine.
 */
function measureToNPI(measure: GameMeasure, startDay: number, endDay: number, turnsSinceActivation: number, crisisLeader: 'hygienik' | 'premier' = 'hygienik'): NPIConfig {
  // When hygienik leads, measures need +7 days for government approval
  const leaderDelay = crisisLeader === 'hygienik' ? 7 : 0;
  const effectiveRampUp = measure.rampUpDays + leaderDelay;
  const daysActive = turnsSinceActivation * 14;
  const rampFraction = effectiveRampUp > 0
    ? Math.min(1, daysActive / effectiveRampUp)
    : 1;

  const effectiveValue = 1 - (1 - measure.npiEffect.value) * rampFraction;

  return {
    id: measure.id,
    name: measure.name,
    type: measure.npiEffect.type,
    startDay,
    endDay,
    value: effectiveValue,
    targetSubMatrix: measure.npiEffect.targetSubMatrix,
    compliance: {
      model: ComplianceModel.ExponentialDecay,
      initial: 1.0,
      decayRate: measure.complianceDecayRate,
    },
  };
}

/**
 * Format a date label for a turn range.
 */
function formatDateLabel(startDay: number, endDay: number): string {
  const startDate = new Date(2020, 0, 1 + startDay);
  const endDate = new Date(2020, 0, endDay);
  const fmt = (d: Date) => `${d.getDate()}. ${d.getMonth() + 1}.`;
  return `${fmt(startDate)} — ${fmt(endDate)} 2020`;
}

/**
 * Initialize a game — creates the first checkpoint from a GameScenario.
 */
export function initGame(gameScenario: GameScenario): SimCheckpoint {
  const scenario = gameScenario.baseScenario;

  const aggCM = sumContactMatrix(scenario.contactMatrix);
  const beta = calibrateBeta(
    scenario.epiConfig.R0,
    scenario.epiConfig.infectiousPeriod,
    aggCM,
    scenario.demographics,
  );

  const rng = createRNG(scenario.stochastic.seed);
  const variantActivationDays = scenario.variants.map(v => resolveVariantDay(v, rng.next));

  const populationState = initializePopulation(scenario);

  const delayBufferSnapshots = scenario.delayConfig
    ? serializeDelayBuffers(createDelayBuffers(scenario.delayConfig))
    : null;

  let reportingSnapshot: ReportingPipelineSnapshot | null = null;
  if (scenario.reportingConfig) {
    const pipeline = new ReportingPipeline(scenario.reportingConfig);
    reportingSnapshot = pipeline.serialize();
  }

  const unlockedMeasureIds = MEASURE_CATALOG
    .filter(m => gameScenario.availableMeasureIds.includes(m.id))
    .filter(m => m.unlockCondition.type === 'always')
    .map(m => m.id);

  return {
    populationState,
    delayBufferSnapshots,
    reportingSnapshot,
    variantActivationDays,
    calibratedBeta: beta,
    rngState: rng.getState(),
    socialCapital: gameScenario.socialCapital.initial,
    economicState: defaultEconomicState(),
    effectiveDetectionRate: scenario.reportingConfig?.detectionRate ?? 0.3,
    unlockedMeasureIds,
    vaccinationCapacity: 0,
    intelQuality: 1.0,
    financialSupportGranted: false,
    financialSupportApprovalChance: 0.4,
  };
}

/**
 * Run one turn (14-day block) of the simulation.
 */
export function stepTurn(
  checkpoint: SimCheckpoint,
  gameScenario: GameScenario,
  turnAction: TurnAction,
  turnNumber: number,
): TurnResult {
  const scenario = gameScenario.baseScenario;
  const daysPerTurn = gameScenario.daysPerTurn;
  const socialCapitalConfig = gameScenario.socialCapital;
  const startDay = checkpoint.populationState.day;

  const rng = createRNG(checkpoint.rngState);

  const delayBuffers: StratumDelayBuffers[] | null = checkpoint.delayBufferSnapshots
    ? restoreDelayBuffers(checkpoint.delayBufferSnapshots)
    : null;

  let reportingPipeline: ReportingPipeline | null = null;
  if (checkpoint.reportingSnapshot && scenario.reportingConfig) {
    reportingPipeline = ReportingPipeline.fromSnapshot(
      { ...scenario.reportingConfig, detectionRate: checkpoint.effectiveDetectionRate },
      checkpoint.reportingSnapshot,
    );
  }

  const activatedEvents: HiddenEvent[] = [];
  let tempTransmissibilityBoost = 1.0;
  let tempImmuneEscape = 0;
  let tempBedReduction = 0;
  let socialCapitalPenalty = 0;
  let intelBoost = 0;
  const newEventUnlocks: string[] = [];

  const whoConsultationActive = turnAction.activeMeasureIds.includes('who_consultation');

  for (const event of gameScenario.hiddenEvents) {
    const isEarlyWarning = whoConsultationActive
      && event.type === 'variant_shock'
      && event.turn === turnNumber + 2;

    if (isEarlyWarning) {
      activatedEvents.push({
        id: `who_early_${event.id}`,
        type: 'who_intel',
        turn: turnNumber,
        label: `Zahraniční zpravodajství WHO upozorňuje na novou mutaci viru detekovanou v zahraničí. Může se objevit i u nás během několika týdnů.`,
        payload: { intelBonus: 0.1 },
      });
      intelBoost += 0.1;
    }

    if (event.turn === turnNumber) {
      activatedEvents.push(event);

      switch (event.type) {
        case 'variant_shock':
          tempTransmissibilityBoost *= (event.payload.transmissibilityMultiplier as number) ?? 1;
          tempImmuneEscape = Math.min(1, tempImmuneEscape + ((event.payload.immuneEscape as number) ?? 0));
          break;
        case 'supply_disruption':
          tempBedReduction = (event.payload.bedReductionFraction as number) ?? 0;
          break;
        case 'public_unrest':
          socialCapitalPenalty += (event.payload.penalty as number) ?? 10;
          break;
        case 'vaccine_unlock':
          newEventUnlocks.push('vaccine_available');
          break;
        case 'measure_unlock':
          if (event.payload.measureId) {
            newEventUnlocks.push(event.payload.measureId as string);
          }
          break;
        case 'who_intel':
          intelBoost += (event.payload.intelBonus as number) ?? 0.2;
          break;
      }
    }
  }

  // Handle financial support request
  let financialSupportGranted = false;
  if (turnAction.requestFinancialSupport) {
    const roll = rng.next();
    if (roll < checkpoint.financialSupportApprovalChance) {
      financialSupportGranted = true;
      activatedEvents.push({
        id: 'financial_support_granted',
        type: 'measure_unlock',
        turn: turnNumber,
        label: 'Vláda schválila mimořádné finanční kompenzace! Ekonomické dopady a sociální pnutí budou v tomto kole zmírněny.',
        payload: {},
      });
    } else {
      activatedEvents.push({
        id: 'financial_support_denied',
        type: 'public_unrest',
        turn: turnNumber,
        label: 'Žádost o finanční podporu byla ministerstvem financí zamítnuta. "Nejsou peníze," zní strohá odpověď.',
        payload: { penalty: 5 },
      });
    }
  }

  const activeMeasures: GameMeasure[] = [];
  for (const mId of turnAction.activeMeasureIds) {
    const m = getMeasureById(mId);
    if (m) activeMeasures.push(m);
  }

  let totalDetectionBonus = 0;
  let totalVaxCapacity = 0;
  let totalIntelBonus = intelBoost;
  let totalPoliticalCost = 0;

  for (const m of activeMeasures) {
    if (m.detectionRateBonus) totalDetectionBonus += m.detectionRateBonus;
    if (m.vaccinationCapacityBonus) totalVaxCapacity += m.vaccinationCapacityBonus;
    if (m.intelBonus) totalIntelBonus += m.intelBonus;
    totalPoliticalCost += m.politicalCostPerTurn;
  }

  // Apply financial support effect: reduce social capital drain
  if (financialSupportGranted) {
    totalPoliticalCost *= 0.5;
  }

  const vacPriority = turnAction.vaccinationPriority;
  const effectiveScenario: ScenarioConfig = { ...scenario };
  if (vacPriority && totalVaxCapacity > 0) {
    effectiveScenario.vaccination = {
      ...scenario.vaccination,
      enabled: true,
      dosesPerDay: vacPriority.dailyCapacity || totalVaxCapacity,
      startDay: 0,
      coverageTarget: reorderCoverageByPriority(scenario.vaccination.coverageTarget, vacPriority.stratumOrder),
    };
  } else {
    effectiveScenario.vaccination = { ...scenario.vaccination, enabled: false };
  }

  if (tempBedReduction > 0) {
    effectiveScenario.healthCapacity = {
      ...effectiveScenario.healthCapacity,
      hospitalBeds: Math.round(effectiveScenario.healthCapacity.hospitalBeds * (1 - tempBedReduction)),
      icuBeds: Math.round(effectiveScenario.healthCapacity.icuBeds * (1 - tempBedReduction)),
    };
  }

  if (turnAction.activeMeasureIds.includes('army_hospitals')) {
    effectiveScenario.healthCapacity = {
      ...effectiveScenario.healthCapacity,
      hospitalBeds: effectiveScenario.healthCapacity.hospitalBeds + 500,
      icuBeds: effectiveScenario.healthCapacity.icuBeds + 50,
    };
  }
  if (turnAction.activeMeasureIds.includes('international_aid')) {
    effectiveScenario.healthCapacity = {
      ...effectiveScenario.healthCapacity,
      icuBeds: effectiveScenario.healthCapacity.icuBeds + 200,
    };
  }

  const capacityMultiplier = activeMeasures.reduce((acc, m) => acc * (m.hospitalCapacityMultiplier ?? 1.0), 1.0);
  if (capacityMultiplier !== 1.0) {
    effectiveScenario.healthCapacity = {
      ...effectiveScenario.healthCapacity,
      hospitalBeds: Math.round(effectiveScenario.healthCapacity.hospitalBeds * capacityMultiplier),
      icuBeds: Math.round(effectiveScenario.healthCapacity.icuBeds * capacityMultiplier),
    };
  }

  let socialCapital = checkpoint.socialCapital - socialCapitalPenalty;
  const dailyPoliticalDrain = totalPoliticalCost / daysPerTurn;

  let state = checkpoint.populationState;
  const states: PopulationState[] = [state];
  const metrics: DailyMetrics[] = [];

  for (let day = 0; day < daysPerTurn; day++) {
    const currentDay = startDay + day;
    const variantEffect = computeVariantEffects(scenario.variants, checkpoint.variantActivationDays, currentDay);
    if (variantEffect.variantActivated) {
      activatedEvents.push({
        id: `variant_at_${currentDay}`,
        type: 'variant_shock',
        turn: turnNumber,
        label: variantEffect.variantName ? `Detekována varianta ${variantEffect.variantName}!` : 'Detekována nová varianta viru!',
        payload: {},
      });
      const variantDef = scenario.variants.find(v => v.name === variantEffect.variantName);
      if (variantDef && variantDef.reinfectionBoost > 0) {
        applyReinfectionBoost(state.strata, variantDef.reinfectionBoost);
      }
    }

    const crisisLeader = turnAction.crisisLeader ?? 'hygienik';
    const npiResult = applyNPIs(
      activeMeasures.map(m => measureToNPI(m, startDay, startDay + daysPerTurn, 1, crisisLeader)),
      currentDay,
      scenario.contactMatrix,
      socialCapital
    );

    const effectiveBeta = checkpoint.calibratedBeta
      * npiResult.betaMultiplier
      * variantEffect.transmissibilityMultiplier
      * tempTransmissibilityBoost;

    const modifiedScenario = {
      ...effectiveScenario,
      vaccination: {
        ...effectiveScenario.vaccination,
        peakVEInfection: effectiveScenario.vaccination.peakVEInfection * (1 - variantEffect.immuneEscape) * (1 - tempImmuneEscape),
        peakVESevere: effectiveScenario.vaccination.peakVESevere * (1 - variantEffect.immuneEscape) * (1 - tempImmuneEscape),
      },
    };

    const result = stepSEIRV(state, modifiedScenario, effectiveBeta, npiResult.contactMatrix);
    const dayMetrics = result.metrics;

    if (delayBuffers) {
      let delayedTotalHosp = 0;
      let delayedTotalICU = 0;

      for (let i = 0; i < NUM_STRATA; i++) {
        const hospRate = scenario.epiConfig.stratumParams[i].hospRate;
        const icuRate = scenario.epiConfig.stratumParams[i].icuRate;
        const rawHospDemand = result.newInfectionsPerStratum[i] * hospRate;
        const delayedHosp = delayBuffers[i].onsetToHosp.pushAndGet(rawHospDemand);
        delayedTotalHosp += delayedHosp;
        const hospDischarge = delayBuffers[i].hospLoS.pushAndGet(delayedHosp);
        const icuAdmit = delayedHosp * icuRate;
        const icuDischarge = delayBuffers[i].icuLoS.pushAndGet(icuAdmit);
        delayedTotalICU += icuAdmit;
        result.newState.strata[i].H = Math.max(0, state.strata[i].H + delayedHosp - hospDischarge);
        result.newState.strata[i].ICU = Math.max(0, state.strata[i].ICU + icuAdmit - icuDischarge);
      }
      dayMetrics.newHospitalizations = delayedTotalHosp;
      dayMetrics.newICU = delayedTotalICU;
    }

    if (reportingPipeline) {
      const observed = reportingPipeline.processDay(
        dayMetrics.newInfections,
        dayMetrics.newHospitalizations,
      );
      dayMetrics.observedNewInfections = observed.observedNewInfections;
      dayMetrics.observedNewHospitalizations = observed.observedNewHospitalizations;
    }

    socialCapital -= dailyPoliticalDrain;
    socialCapital += unemploymentSocialCapitalDrain(checkpoint.economicState.unemploymentDelta) / daysPerTurn;
    if (activeMeasures.filter(m => m.politicalCostPerTurn > 0).length <= 1) {
      socialCapital += socialCapitalConfig.recoveryRate;
    }
    socialCapital = Math.max(0, Math.min(socialCapitalConfig.initial, socialCapital));

    state = result.newState;
    states.push(state);
    metrics.push(dayMetrics);
  }

  const totalTrueInfections = metrics.reduce((s, m) => s + m.newInfections, 0);
  const totalObservedInfections = metrics.reduce((s, m) => s + (m.observedNewInfections ?? m.newInfections * checkpoint.effectiveDetectionRate), 0);
  const totalHosp = metrics.reduce((s, m) => s + m.newHospitalizations, 0);
  const totalICU = metrics.reduce((s, m) => s + m.newICU, 0);
  const totalDeaths = metrics.reduce((s, m) => s + m.newDeaths, 0);
  const lastMetrics = metrics[metrics.length - 1];
  const lastState = states[states.length - 1];

  const hospitalOccupancy = lastState.strata.reduce((s, st) => s + st.H, 0);
  const icuOccupancy = lastState.strata.reduce((s, st) => s + st.ICU, 0);
  const hospitalCapacity = effectiveScenario.healthCapacity.hospitalBeds;
  const icuCapacity = effectiveScenario.healthCapacity.icuBeds;
  const cumulativeDeaths = lastState.strata.reduce((s, st) => s + st.D, 0);

  const trueReff = lastMetrics.Reff;
  const intelQuality = Math.max(0.1, checkpoint.intelQuality - totalIntelBonus);
  const jitterRange = 0.3 * intelQuality;
  const jitter = 1 + (rng.next() - 0.5) * jitterRange;
  const estimatedReff = trueReff * jitter;

  // Step economics
  const newEconomicState = stepEconomics(checkpoint.economicState, activeMeasures, financialSupportGranted);

  const newDetectionRate = Math.min(0.8, checkpoint.effectiveDetectionRate + totalDetectionBonus * 0.1);

  const hospOccFraction = hospitalOccupancy / Math.max(1, hospitalCapacity);
  const unlockState = {
    turnNumber,
    socialCapital,
    cumulativeDeaths,
    hospitalOccupancyFraction: hospOccFraction,
    unlockedByEvents: new Set([...checkpoint.unlockedMeasureIds, ...newEventUnlocks]),
  };

  const newlyUnlockedMeasures: string[] = [];
  const allUnlockedIds = new Set(checkpoint.unlockedMeasureIds);
  for (const m of MEASURE_CATALOG) {
    if (!gameScenario.availableMeasureIds.includes(m.id)) continue;
    if (allUnlockedIds.has(m.id)) continue;
    if (isMeasureUnlocked(m, unlockState)) {
      allUnlockedIds.add(m.id);
      newlyUnlockedMeasures.push(m.id);
    }
  }

  const endInf = metrics.slice(-3).reduce((s, m) => s + m.newInfections, 0);
  const startInf = metrics.slice(0, 3).reduce((s, m) => s + m.newInfections, 0);
  const trendInfections: 'rising' | 'stable' | 'falling' =
    endInf > startInf * 1.15 ? 'rising' :
    endInf < startInf * 0.85 ? 'falling' : 'stable';

  const advisorMessages = generateAdvisorMessages({
    estimatedReff,
    trueReff,
    socialCapital,
    hospitalOccupancyFraction: hospOccFraction,
    icuOccupancyFraction: icuOccupancy / Math.max(1, icuCapacity),
    economicState: newEconomicState,
    cumulativeDeaths,
    turnNumber,
    totalTurns: gameScenario.totalTurns,
    activeMeasureCount: activeMeasures.length,
    newDeaths: Math.round(totalDeaths),
    trendInfections,
    detectionRate: newDetectionRate,
    vaccinationActive: turnAction.vaccinationPriority != null && totalVaxCapacity > 0,
    intelQuality,
    activeMeasureIds: turnAction.activeMeasureIds,
    currentHospitalized: Math.round(hospitalOccupancy),
    hospitalCapacity,
    currentICU: Math.round(icuOccupancy),
    icuCapacity,
    observedInfections: Math.round(totalObservedInfections),
    whoConsultationActive,
    oppositionBriefings: turnAction.oppositionBriefings ?? 0,
    crisisLeader: turnAction.crisisLeader ?? 'hygienik',
    daysPerTurn,
  });

  const headlines = generateHeadlines({
    turnNumber,
    observedInfections: Math.round(totalObservedInfections),
    prevObservedInfections: 0,
    newDeaths: Math.round(totalDeaths),
    cumulativeDeaths: Math.round(cumulativeDeaths),
    socialCapital,
    hospitalOccupancyFraction: hospOccFraction,
    economicState: newEconomicState,
    activatedEvents,
    vaccinationActive: turnAction.vaccinationPriority != null,
    activeMeasureCount: activeMeasures.length,
    estimatedReff,
  });

  const weightedIFR = calculateWeightedIFR(
    scenario.demographics.ageFractions,
    scenario.demographics.riskFractions,
    scenario.epiConfig.stratumParams
  );

  let maxR0 = scenario.epiConfig.R0;
  for (const variant of scenario.variants) {
    const activationDay = checkpoint.variantActivationDays[scenario.variants.indexOf(variant)];
    if (state.day >= activationDay) {
       maxR0 = Math.max(maxR0, scenario.epiConfig.R0 * variant.transmissibilityMultiplier);
    }
  }
  const totalPotentialDeaths = calculateBaselineDeaths(maxR0, scenario.demographics.totalPopulation, weightedIFR);

  const turnReport: TurnReportV2 = {
    turnNumber,
    dateLabel: formatDateLabel(startDay, startDay + daysPerTurn),
    observedInfections: Math.round(totalObservedInfections),
    trueInfections: Math.round(totalTrueInfections),
    newHospitalizations: Math.round(totalHosp),
    newICU: Math.round(totalICU),
    newDeaths: Math.round(totalDeaths),
    cumulativeDeaths: Math.round(cumulativeDeaths),
    estimatedReff: Math.round(estimatedReff * 100) / 100,
    trueReff: Math.round(trueReff * 100) / 100,
    socialCapital: Math.round(socialCapital * 10) / 10,
    hospitalOccupancy: Math.round(hospitalOccupancy),
    hospitalCapacity,
    icuOccupancy: Math.round(icuOccupancy),
    icuCapacity,
    capacityOverflow: hospitalOccupancy > hospitalCapacity || icuOccupancy > icuCapacity,
    economicState: newEconomicState,
    activatedEvents,
    advisorMessages,
    headlines,
    newlyUnlockedMeasures,
    baselineCumulativeDeaths: Math.round(totalPotentialDeaths),
    livesSaved: Math.round(Math.max(0, totalPotentialDeaths - cumulativeDeaths)),
  };

  const newCheckpoint: SimCheckpoint = {
    populationState: state,
    delayBufferSnapshots: delayBuffers ? serializeDelayBuffers(delayBuffers) : null,
    reportingSnapshot: reportingPipeline ? reportingPipeline.serialize() : null,
    variantActivationDays: checkpoint.variantActivationDays,
    calibratedBeta: checkpoint.calibratedBeta,
    rngState: rng.getState(),
    socialCapital,
    economicState: newEconomicState,
    effectiveDetectionRate: newDetectionRate,
    unlockedMeasureIds: Array.from(allUnlockedIds),
    vaccinationCapacity: totalVaxCapacity,
    intelQuality,
    financialSupportGranted,
    financialSupportApprovalChance: checkpoint.financialSupportApprovalChance,
  };

  return {
    checkpoint: newCheckpoint,
    metrics,
    states,
    turnReport,
  };
}

function reorderCoverageByPriority(baseCoverage: number[], stratumOrder: number[]): number[] {
  const result = [...baseCoverage];
  for (let i = 0; i < result.length; i++) {
    const priorityIdx = stratumOrder.indexOf(i);
    if (priorityIdx === -1 || priorityIdx > 2) {
      result[i] *= 0.3;
    } else if (priorityIdx > 0) {
      result[i] *= 0.7;
    }
  }
  return result;
}
