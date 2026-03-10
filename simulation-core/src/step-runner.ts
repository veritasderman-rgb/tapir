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
import { ReportingPipeline, type ReportingPipelineSnapshot, type ReportingConfig } from './reporting';
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
function measureToNPI(measure: GameMeasure, startDay: number, endDay: number, turnsSinceActivation: number): NPIConfig {
  // Apply ramp-up: if active for fewer days than rampUpDays, reduce effect
  const daysActive = turnsSinceActivation * 14; // approximate
  const rampFraction = measure.rampUpDays > 0
    ? Math.min(1, daysActive / measure.rampUpDays)
    : 1;

  // Value adjusted for ramp: 1.0 = no effect, value = full effect
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

  // Calibrate beta
  const aggCM = sumContactMatrix(scenario.contactMatrix);
  const beta = calibrateBeta(
    scenario.epiConfig.R0,
    scenario.epiConfig.infectiousPeriod,
    aggCM,
    scenario.demographics,
  );

  // Resolve variant activation days
  const rng = createRNG(scenario.stochastic.seed);
  const variantActivationDays = scenario.variants.map(v => resolveVariantDay(v, rng.next));

  // Initialize population
  const populationState = initializePopulation(scenario);

  // Create delay buffers if configured
  const delayBufferSnapshots = scenario.delayConfig
    ? serializeDelayBuffers(createDelayBuffers(scenario.delayConfig))
    : null;

  // Create reporting pipeline if configured
  let reportingSnapshot: ReportingPipelineSnapshot | null = null;
  if (scenario.reportingConfig) {
    const pipeline = new ReportingPipeline(scenario.reportingConfig);
    reportingSnapshot = pipeline.serialize();
  }

  // Determine initially unlocked measures
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

  // Restore mutable state
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

  // Process hidden events for this turn
  const activatedEvents: HiddenEvent[] = [];
  let tempTransmissibilityBoost = 1.0;
  let tempImmuneEscape = 0;
  let tempBedReduction = 0;
  let socialCapitalPenalty = 0;
  let detectionRateBoost = 0;
  let intelBoost = 0;
  const newEventUnlocks: string[] = [];

  // WHO consultation enables early detection of variant shocks (2 turns ahead)
  const whoConsultationActive = turnAction.activeMeasureIds.includes('who_consultation');

  for (const event of gameScenario.hiddenEvents) {
    // Early warning: if WHO consultation is active, detect variant_shock 2 turns early
    const isEarlyWarning = whoConsultationActive
      && event.type === 'variant_shock'
      && event.turn === turnNumber + 2;

    if (isEarlyWarning) {
      // Don't activate the variant yet, but notify the player via a synthetic who_intel event
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

  // Resolve active measures
  const activeMeasures: GameMeasure[] = [];
  for (const mId of turnAction.activeMeasureIds) {
    const m = getMeasureById(mId);
    if (m) activeMeasures.push(m);
  }

  // Compute measure-based bonuses
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

  // Convert measures to NPIs
  const absoluteNPIs: NPIConfig[] = activeMeasures
    .filter(m => m.npiEffect.value < 1.0) // Only measures that actually reduce transmission
    .map(m => measureToNPI(m, startDay, startDay + daysPerTurn, 1));

  // Build effective scenario
  const effectiveScenario: ScenarioConfig = { ...scenario };

  // Vaccination: use measure-determined capacity
  const vacPriority = turnAction.vaccinationPriority;
  if (vacPriority && totalVaxCapacity > 0) {
    effectiveScenario.vaccination = {
      ...scenario.vaccination,
      enabled: true,
      dosesPerDay: vacPriority.dailyCapacity || totalVaxCapacity,
      startDay: 0, // always active from day 0 if enabled
      coverageTarget: reorderCoverageByPriority(scenario.vaccination.coverageTarget, vacPriority.stratumOrder),
    };
  } else {
    effectiveScenario.vaccination = { ...scenario.vaccination, enabled: false };
  }

  // Apply supply disruption
  if (tempBedReduction > 0) {
    effectiveScenario.healthCapacity = {
      ...effectiveScenario.healthCapacity,
      hospitalBeds: Math.round(effectiveScenario.healthCapacity.hospitalBeds * (1 - tempBedReduction)),
      icuBeds: Math.round(effectiveScenario.healthCapacity.icuBeds * (1 - tempBedReduction)),
    };
  }

  // Army hospitals bonus (one-shot)
  if (turnAction.activeMeasureIds.includes('army_hospitals')) {
    effectiveScenario.healthCapacity = {
      ...effectiveScenario.healthCapacity,
      hospitalBeds: effectiveScenario.healthCapacity.hospitalBeds + 500,
      icuBeds: effectiveScenario.healthCapacity.icuBeds + 50,
    };
  }
  // International aid
  if (turnAction.activeMeasureIds.includes('international_aid')) {
    effectiveScenario.healthCapacity = {
      ...effectiveScenario.healthCapacity,
      icuBeds: effectiveScenario.healthCapacity.icuBeds + 200,
    };
  }

  let state = checkpoint.populationState;
  let socialCapital = Math.max(0, checkpoint.socialCapital - socialCapitalPenalty);

  // Political cost: drain social capital per turn (scaled to daily)
  const dailyPoliticalDrain = totalPoliticalCost / daysPerTurn;

  const metrics: DailyMetrics[] = [];
  const states: PopulationState[] = [];

  for (let d = 0; d < daysPerTurn; d++) {
    const day = startDay + d;

    // Social capital compliance modifier
    const complianceMultiplier = socialCapitalComplianceMultiplier(
      socialCapital,
      socialCapitalConfig.collapseThreshold,
    );

    // Army enforcement boosts compliance in collapsed state
    const armyEnforcementActive = turnAction.activeMeasureIds.includes('army_enforcement');
    const effectiveComplianceMult = armyEnforcementActive
      ? Math.max(complianceMultiplier, 0.5) // army ensures at least 50% compliance
      : complianceMultiplier;

    const complianceAdjustedNPIs = absoluteNPIs.map(npi => ({
      ...npi,
      compliance: {
        ...npi.compliance,
        initial: npi.compliance.initial * effectiveComplianceMult,
      },
    }));

    const npiResult = applyNPIs(complianceAdjustedNPIs, day, scenario.contactMatrix);

    // Variant effects
    const variantEffect = computeVariantEffects(
      scenario.variants,
      checkpoint.variantActivationDays,
      day,
    );

    if (variantEffect.variantActivated) {
      const activeVariant = scenario.variants.find(
        (v, idx) => checkpoint.variantActivationDays[idx] === day,
      );
      if (activeVariant && activeVariant.reinfectionBoost > 0) {
        applyReinfectionBoost(state.strata, activeVariant.reinfectionBoost);
      }
    }

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

    // Clinical delays
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

    // Reporting pipeline (using current effective detection rate)
    if (reportingPipeline) {
      const observed = reportingPipeline.processDay(
        dayMetrics.newInfections,
        dayMetrics.newHospitalizations,
      );
      dayMetrics.observedNewInfections = observed.observedNewInfections;
      dayMetrics.observedNewHospitalizations = observed.observedNewHospitalizations;
    }

    // Social capital: political drain + unemployment drain + natural recovery
    socialCapital -= dailyPoliticalDrain;
    socialCapital += unemploymentSocialCapitalDrain(checkpoint.economicState.unemploymentDelta) / daysPerTurn;

    // Natural recovery when few measures active
    if (activeMeasures.filter(m => m.politicalCostPerTurn > 0).length <= 1) {
      socialCapital += socialCapitalConfig.recoveryRate;
    }

    socialCapital = Math.max(0, Math.min(socialCapitalConfig.initial, socialCapital));

    state = result.newState;
    states.push(state);
    metrics.push(dayMetrics);
  }

  // Aggregate turn metrics
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

  // Cumulative deaths
  const cumulativeDeaths = lastState.strata.reduce((s, st) => s + st.D, 0);

  // Reff with fog-of-war jitter (reduced by WHO consultation / intel bonuses)
  const trueReff = lastMetrics.Reff;
  const intelQuality = Math.max(0.1, checkpoint.intelQuality - totalIntelBonus);
  const jitterRange = 0.3 * intelQuality; // default ±15%, reduced by intel
  const jitter = 1 + (rng.next() - 0.5) * jitterRange;
  const estimatedReff = trueReff * jitter;

  // Step economics
  const newEconomicState = stepEconomics(checkpoint.economicState, activeMeasures);

  // Update detection rate
  const newDetectionRate = Math.min(0.8, checkpoint.effectiveDetectionRate + totalDetectionBonus * 0.1);

  // Update unlock conditions
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

  // Add event-triggered unlocks
  for (const eventId of newEventUnlocks) {
    for (const m of MEASURE_CATALOG) {
      if (!gameScenario.availableMeasureIds.includes(m.id)) continue;
      if (allUnlockedIds.has(m.id)) continue;
      if (m.unlockCondition.type === 'event_triggered' && m.unlockCondition.eventId === eventId) {
        allUnlockedIds.add(m.id);
        newlyUnlockedMeasures.push(m.id);
      }
    }
  }

  // Infection trend
  const midMetrics = metrics[Math.floor(metrics.length / 2)];
  const endInf = metrics.slice(-3).reduce((s, m) => s + m.newInfections, 0);
  const startInf = metrics.slice(0, 3).reduce((s, m) => s + m.newInfections, 0);
  const trendInfections: 'rising' | 'stable' | 'falling' =
    endInf > startInf * 1.15 ? 'rising' :
    endInf < startInf * 0.85 ? 'falling' : 'stable';

  // Generate advisor messages
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
    whoConsultationActive: turnAction.activeMeasureIds.includes('who_consultation'),
  });

  // Generate headlines
  const headlines = generateHeadlines({
    turnNumber,
    observedInfections: Math.round(totalObservedInfections),
    prevObservedInfections: 0, // Would need previous turn data, simplified
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

  const turnReport: TurnReport = {
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
  };

  return {
    checkpoint: newCheckpoint,
    metrics,
    states,
    turnReport,
  };
}

/**
 * Reorder coverage targets based on vaccination priority.
 * Higher-priority strata get full coverage target, lower-priority get reduced.
 */
function reorderCoverageByPriority(baseCoverage: number[], stratumOrder: number[]): number[] {
  const result = [...baseCoverage];
  // Priority strata get full target, others get 50%
  for (let i = 0; i < result.length; i++) {
    const priorityIdx = stratumOrder.indexOf(i);
    if (priorityIdx === -1 || priorityIdx > 2) {
      result[i] *= 0.3; // Low priority = much less coverage
    } else if (priorityIdx > 0) {
      result[i] *= 0.7; // Medium priority
    }
    // priorityIdx === 0: full coverage target
  }
  return result;
}
