/**
 * Multistrain model — 2-strain variant for "variant shock" scenarios.
 *
 * Extends SEIRV with a second strain that can have different transmissibility
 * and partial immune escape from strain 1.
 *
 * Simplified: rather than tracking separate compartments per strain,
 * we use the variant engine to modify beta and VE when a new strain arrives.
 * This is the pragmatic approach for educational purposes.
 *
 * Full 2-strain tracking (S1, E1, I1, R1, S2, E2, I2, R2) would double
 * the compartment count and is available as a future extension.
 */

import {
  type ScenarioConfig,
  type SimulationRun,
  type PopulationState,
  type DailyMetrics,
  NUM_STRATA,
} from '../types';
import { sumContactMatrix } from '../contact-matrix';
import { calibrateBeta } from '../calibration/beta-calibration';
import { applyNPIs } from '../npi-engine';
import { resolveVariantDay, computeVariantEffects, applyReinfectionBoost } from '../variant-engine';
import { computeVE } from '../vaccination';
import { stepSEIRV } from './seirv';
import { initializePopulation, type TransitionFunction, deterministicTransition } from './seir';

/**
 * Run the full simulation with variant support.
 * This is the main entry point for the complete model.
 */
export function runMultistrain(
  scenario: ScenarioConfig,
  transition: TransitionFunction = deterministicTransition,
  rng: () => number = Math.random,
  seed = 0,
): SimulationRun {
  const aggContactMatrix = sumContactMatrix(scenario.contactMatrix);
  const baseBeta = calibrateBeta(
    scenario.epiConfig.R0,
    scenario.epiConfig.infectiousPeriod,
    aggContactMatrix,
    scenario.demographics,
  );

  // Resolve variant activation days
  const activationDays = scenario.variants.map(v => resolveVariantDay(v, rng));

  let state = initializePopulation(scenario);
  const states: PopulationState[] = [state];
  const metrics: DailyMetrics[] = [];

  for (let day = 0; day < scenario.days; day++) {
    // NPIs
    const npiResult = applyNPIs(scenario.npis, day, scenario.contactMatrix);

    // Variant effects
    const variantEffect = computeVariantEffects(scenario.variants, activationDays, day);

    // Apply reinfection boost on the day a variant activates
    if (variantEffect.variantActivated) {
      const activeVariant = scenario.variants.find(
        (v, idx) => activationDays[idx] === day,
      );
      if (activeVariant && activeVariant.reinfectionBoost > 0) {
        applyReinfectionBoost(state.strata, activeVariant.reinfectionBoost);
      }
    }

    // Effective beta = base * NPI * variant transmissibility
    const effectiveBeta = baseBeta * npiResult.betaMultiplier * variantEffect.transmissibilityMultiplier;

    // Create a modified scenario with adjusted VE for immune escape
    const modifiedScenario = {
      ...scenario,
      vaccination: {
        ...scenario.vaccination,
        peakVEInfection: scenario.vaccination.peakVEInfection * (1 - variantEffect.immuneEscape),
        peakVESevere: scenario.vaccination.peakVESevere * (1 - variantEffect.immuneEscape),
      },
    };

    const result = stepSEIRV(state, modifiedScenario, effectiveBeta, npiResult.contactMatrix, transition);
    state = result.newState;
    states.push(state);
    metrics.push(result.metrics);
  }

  return { states, metrics, seed };
}
