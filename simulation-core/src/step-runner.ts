/**
 * Step Runner — Turn-based simulation engine for the "Krizovy stab" game.
 *
 * Wraps the existing SEIRV model to run in blocks (1 turn = N days).
 * Maintains a serializable SimCheckpoint between turns for deterministic replay.
 */

import {
  type ScenarioConfig,
  type PopulationState,
  type DailyMetrics,
  type SimCheckpoint,
  type TurnAction,
  type TurnResult,
  type MonthlyReport,
  type GameScenario,
  type HiddenEvent,
  type NPIConfig,
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
import { ReportingPipeline, type ReportingPipelineSnapshot } from './reporting';
import { stepSEIRV } from './models/seirv';
import { initializePopulation, deterministicTransition } from './models/seir';
import { createRNG, type StatefulRNG } from './stochastic';
import {
  stepSocialCapital,
  socialCapitalComplianceMultiplier,
  defaultSocialCapitalConfig,
} from './social-capital';

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

  // Resolve variant activation days (using hidden events)
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

  return {
    populationState,
    delayBufferSnapshots,
    reportingSnapshot,
    variantActivationDays,
    calibratedBeta: beta,
    rngState: rng.getState(),
    socialCapital: gameScenario.socialCapital.initial,
  };
}

/**
 * Run one turn (block of days) of the simulation.
 *
 * @param checkpoint - Current simulation state
 * @param gameScenario - Full game scenario (immutable)
 * @param turnAction - Student's choices for this turn
 * @param currentMonth - 1-indexed month number
 * @returns TurnResult with new checkpoint, metrics, states, and monthly report
 */
export function stepTurn(
  checkpoint: SimCheckpoint,
  gameScenario: GameScenario,
  turnAction: TurnAction,
  currentMonth: number,
): TurnResult {
  const scenario = gameScenario.baseScenario;
  const daysPerTurn = gameScenario.daysPerTurn;
  const socialCapitalConfig = gameScenario.socialCapital;
  const startDay = checkpoint.populationState.day;

  // Restore mutable state from checkpoint
  const rng = createRNG(checkpoint.rngState);
  // Skip 0 calls — we start from the saved state directly

  const delayBuffers: StratumDelayBuffers[] | null = checkpoint.delayBufferSnapshots
    ? restoreDelayBuffers(checkpoint.delayBufferSnapshots)
    : null;

  let reportingPipeline: ReportingPipeline | null = null;
  if (checkpoint.reportingSnapshot && scenario.reportingConfig) {
    reportingPipeline = ReportingPipeline.fromSnapshot(scenario.reportingConfig, checkpoint.reportingSnapshot);
  }

  // Convert student's turn NPIs to absolute-day NPIs
  const absoluteNPIs: NPIConfig[] = turnAction.npis.map(npi => ({
    ...npi,
    startDay: startDay,
    endDay: startDay + daysPerTurn,
  }));

  // Override vaccination enabled/disabled
  const effectiveScenario: ScenarioConfig = {
    ...scenario,
    vaccination: {
      ...scenario.vaccination,
      enabled: turnAction.vaccinationEnabled,
    },
  };

  // Check which hidden events activate this month
  const activatedEvents: string[] = [];
  let tempTransmissibilityBoost = 1.0;
  let tempImmuneEscape = 0;
  let tempBedReduction = 0;
  let socialCapitalPenalty = 0;

  for (const event of gameScenario.hiddenEvents) {
    if (event.month === currentMonth) {
      activatedEvents.push(event.label);

      switch (event.type) {
        case 'variant_shock':
          tempTransmissibilityBoost *= event.payload.transmissibilityMultiplier ?? 1;
          tempImmuneEscape = Math.min(1, tempImmuneEscape + (event.payload.immuneEscape ?? 0));
          break;
        case 'supply_disruption':
          tempBedReduction = event.payload.bedReductionFraction ?? 0;
          break;
        case 'public_unrest':
          socialCapitalPenalty += event.payload.penalty ?? 10;
          break;
        // vaccine_unlock is handled at the store level, not engine level
      }
    }
  }

  // Apply supply disruption to health capacity
  if (tempBedReduction > 0) {
    effectiveScenario.healthCapacity = {
      ...effectiveScenario.healthCapacity,
      hospitalBeds: Math.round(effectiveScenario.healthCapacity.hospitalBeds * (1 - tempBedReduction)),
      icuBeds: Math.round(effectiveScenario.healthCapacity.icuBeds * (1 - tempBedReduction)),
    };
  }

  let state = checkpoint.populationState;
  let socialCapital = checkpoint.socialCapital - socialCapitalPenalty;
  socialCapital = Math.max(0, socialCapital);

  const metrics: DailyMetrics[] = [];
  const states: PopulationState[] = [];

  for (let d = 0; d < daysPerTurn; d++) {
    const day = startDay + d;

    // NPIs: use student's turn NPIs with social capital compliance modifier
    const complianceMultiplier = socialCapitalComplianceMultiplier(
      socialCapital,
      socialCapitalConfig.collapseThreshold,
    );

    // Apply compliance modifier to NPIs
    const complianceAdjustedNPIs = absoluteNPIs.map(npi => ({
      ...npi,
      compliance: {
        ...npi.compliance,
        initial: npi.compliance.initial * complianceMultiplier,
      },
    }));

    const npiResult = applyNPIs(complianceAdjustedNPIs, day, scenario.contactMatrix);

    // Variant effects (from scenario's variant config, not hidden events —
    // hidden events apply a one-time transmissibility boost)
    const variantEffect = computeVariantEffects(
      scenario.variants,
      checkpoint.variantActivationDays,
      day,
    );

    // Reinfection boost on variant activation day
    if (variantEffect.variantActivated) {
      const activeVariant = scenario.variants.find(
        (v, idx) => checkpoint.variantActivationDays[idx] === day,
      );
      if (activeVariant && activeVariant.reinfectionBoost > 0) {
        applyReinfectionBoost(state.strata, activeVariant.reinfectionBoost);
      }
    }

    // Effective beta = calibrated * NPI * variant * hidden event boost
    const effectiveBeta = checkpoint.calibratedBeta
      * npiResult.betaMultiplier
      * variantEffect.transmissibilityMultiplier
      * tempTransmissibilityBoost;

    // Modified scenario with immune escape
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

    // Apply clinical delays if configured
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

    // Reporting pipeline
    if (reportingPipeline) {
      const observed = reportingPipeline.processDay(
        dayMetrics.newInfections,
        dayMetrics.newHospitalizations,
      );
      dayMetrics.observedNewInfections = observed.observedNewInfections;
      dayMetrics.observedNewHospitalizations = observed.observedNewHospitalizations;
    }

    // Social capital step
    socialCapital = stepSocialCapital(socialCapital, absoluteNPIs, socialCapitalConfig);

    state = result.newState;
    states.push(state);
    metrics.push(dayMetrics);
  }

  // Build monthly report
  const totalTrueInfections = metrics.reduce((s, m) => s + m.newInfections, 0);
  const totalObservedInfections = metrics.reduce((s, m) => s + (m.observedNewInfections ?? m.newInfections * 0.3), 0);
  const totalHosp = metrics.reduce((s, m) => s + m.newHospitalizations, 0);
  const totalICU = metrics.reduce((s, m) => s + m.newICU, 0);
  const totalDeaths = metrics.reduce((s, m) => s + m.newDeaths, 0);
  const lastMetrics = metrics[metrics.length - 1];
  const lastState = states[states.length - 1];

  // Reff estimate with noise (±15% uniform jitter)
  const trueReff = lastMetrics.Reff;
  const jitter = 1 + (rng.next() - 0.5) * 0.3; // ±15%
  const estimatedReff = trueReff * jitter;

  // Hospital/ICU occupancy
  const hospitalOccupancy = lastState.strata.reduce((s, st) => s + st.H, 0);
  const icuOccupancy = lastState.strata.reduce((s, st) => s + st.ICU, 0);

  const monthlyReport: MonthlyReport = {
    month: currentMonth,
    observedInfections: Math.round(totalObservedInfections),
    trueInfections: Math.round(totalTrueInfections),
    newHospitalizations: Math.round(totalHosp),
    newICU: Math.round(totalICU),
    newDeaths: Math.round(totalDeaths),
    estimatedReff: Math.round(estimatedReff * 100) / 100,
    trueReff: Math.round(trueReff * 100) / 100,
    socialCapital: Math.round(socialCapital * 10) / 10,
    hospitalOccupancy: Math.round(hospitalOccupancy),
    icuOccupancy: Math.round(icuOccupancy),
    activatedEvents,
  };

  // New checkpoint
  const newCheckpoint: SimCheckpoint = {
    populationState: state,
    delayBufferSnapshots: delayBuffers ? serializeDelayBuffers(delayBuffers) : null,
    reportingSnapshot: reportingPipeline ? reportingPipeline.serialize() : null,
    variantActivationDays: checkpoint.variantActivationDays,
    calibratedBeta: checkpoint.calibratedBeta,
    rngState: rng.getState(),
    socialCapital,
  };

  return {
    checkpoint: newCheckpoint,
    metrics,
    states,
    monthlyReport,
  };
}
