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
export { mulberry32, binomialTransition, computeQuantiles, runSimulation } from './stochastic';

// Export utilities
export { exportCSV, exportJSON, getWatermarkText } from './export-utils';

// Health capacity
export { computeHealthOutcomes } from './health-capacity';

// Delay engine
export { gammaDelayPMF, DelayBuffer, createDelayBuffers } from './delay-engine';
export type { StratumDelayBuffers } from './delay-engine';

// Reporting
export { ReportingPipeline } from './reporting';
