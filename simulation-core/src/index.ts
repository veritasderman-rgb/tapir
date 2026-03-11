// @tapir/core — Simulation engine entry point

export const VERSION = '1.0.0';

// Types
export * from './types';

// Schema & defaults
export * from './scenario-schema';

// Validation
export { validateScenario } from './validation';

// Contact matrix
export { sumContactMatrix, modifySubMatrix, scaleSubMatrix } from './contact-matrix';

// Calibration
export { spectralRadius, buildNGMBaseMatrix, computeImpliedR0, computeReff, getAgeGroupPopulations } from './calibration/ngm';
export { calibrateBeta } from './calibration/beta-calibration';

// Models
export { runSEIR, stepSEIR, initializePopulation, deterministicTransition } from './models/seir';
export type { TransitionFunction } from './models/seir';
export { runSEIRV, stepSEIRV } from './models/seirv';
export { applyWaningImmunity } from './models/seirs';
export { runMultistrain } from './models/multistrain';

// NPI engine
export { computeCompliance, applyNPIs } from './npi-engine';

// Vaccination
export { computeVE, computeDailyVaccinations } from './vaccination';

// Variant engine
export { resolveVariantDay, computeVariantEffects, applyReinfectionBoost } from './variant-engine';

// Stochastic & Monte Carlo
export { mulberry32, createRNG, binomialTransition, computeQuantiles, runSimulation } from './stochastic';
export type { StatefulRNG } from './stochastic';

// Export utilities
export { exportCSV, exportJSON, getWatermarkText } from './export-utils';

// Health capacity
export { computeHealthOutcomes } from './health-capacity';

// Delay engine
export { gammaDelayPMF, DelayBuffer, createDelayBuffers, serializeDelayBuffers, restoreDelayBuffers } from './delay-engine';
export type { StratumDelayBuffers, DelayBufferSnapshot, StratumDelayBuffersSnapshot } from './delay-engine';

// Reporting
export { ReportingPipeline } from './reporting';
export type { ReportingPipelineSnapshot } from './reporting';

// Social capital
export { stepSocialCapital, socialCapitalComplianceMultiplier, computeSocialCapitalDelta, getNPIDailyCost, getNPIMonthlyCost, defaultSocialCapitalConfig } from './social-capital';

// Step runner (turn-based game)
export { initGame, stepTurn } from './step-runner';

// Game scenario encode/decode
export { encodeGameScenario, decodeGameScenario } from './game-scenario';

// Measure catalog
export { MEASURE_CATALOG, getMeasureById, getMeasuresByCategory, getAllMeasureIds, isMeasureUnlocked, defaultMeasureIds } from './measure-catalog';

// Economics
export { stepEconomics, defaultEconomicState, unemploymentSocialCapitalDrain } from './economics';

// Advisors
export { generateAdvisorMessages, ADVISOR_BACKGROUNDS } from './advisors';

// Headlines
export { generateHeadlines } from './headlines';
