/**
 * SEIRS model — SEIR with waning immunity (R→S).
 *
 * This extends the SEIRV model by adding a waning rate for natural immunity.
 * R → S at rate omega = 1/immunityDuration.
 *
 * For now, this is a thin wrapper that can be used when waning is enabled.
 */

import {
  type ScenarioConfig,
  type PopulationState,
  type SimulationRun,
  NUM_STRATA,
} from '../types';
import { runSEIRV } from './seirv';
import { type TransitionFunction, deterministicTransition } from './seir';

export interface WaningConfig {
  /** Mean duration of natural immunity in days */
  immunityDurationDays: number;
}

/**
 * Apply waning immunity: move fraction of R back to S.
 * omega = 1/immunityDuration per day.
 */
export function applyWaningImmunity(
  state: PopulationState,
  waningConfig: WaningConfig,
): void {
  const omega = 1 / waningConfig.immunityDurationDays;
  for (let i = 0; i < NUM_STRATA; i++) {
    const rToS = state.strata[i].R * omega;
    state.strata[i].R -= rToS;
    state.strata[i].S += rToS;
  }
}
