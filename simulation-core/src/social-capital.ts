/**
 * Social Capital Engine — Models public tolerance for NPIs.
 *
 * Each active NPI drains social capital per day.
 * When capital drops below the collapse threshold, compliance
 * drops quadratically regardless of what the student configured.
 * Disabling NPIs allows slow recovery.
 */

import { type NPIConfig, type SocialCapitalConfig } from './types';

/** Default social capital configuration. */
export function defaultSocialCapitalConfig(): SocialCapitalConfig {
  return {
    initial: 100,
    recoveryRate: 0.5,   // +0.5 points/day when no NPIs active
    collapseThreshold: 20,
  };
}

/**
 * Social cost per NPI per day of enforcement.
 * Keys match NPI name patterns; fallback for unmatched NPIs.
 */
const NPI_DAILY_COSTS: Record<string, number> = {
  school_closure: 0.5,       // 15 per month ≈ 0.5/day
  work_from_home: 0.33,      // 10 per month
  community_lockdown: 0.67,  // 20 per month
  mask_mandate: 0.1,         //  3 per month
  travel_ban: 0.4,           // 12 per month
};

const DEFAULT_NPI_DAILY_COST = 0.27; // ~8 per month

/** Get the daily social cost of a single NPI. */
export function getNPIDailyCost(npi: NPIConfig): number {
  // Try matching by name (lowercased, with spaces replaced)
  const key = npi.name.toLowerCase().replace(/\s+/g, '_');
  for (const [pattern, cost] of Object.entries(NPI_DAILY_COSTS)) {
    if (key.includes(pattern)) return cost;
  }
  return DEFAULT_NPI_DAILY_COST;
}

/** Get the monthly (30-day) social cost of a single NPI. */
export function getNPIMonthlyCost(npi: NPIConfig): number {
  return getNPIDailyCost(npi) * 30;
}

/**
 * Compute the daily change in social capital.
 * @returns delta (negative = drain, positive = recovery)
 */
export function computeSocialCapitalDelta(
  activeNPIs: NPIConfig[],
  currentCapital: number,
  config: SocialCapitalConfig,
): number {
  if (activeNPIs.length === 0) {
    // Recovery: only when no NPIs active, capped at initial
    const recovery = config.recoveryRate;
    return Math.min(recovery, config.initial - currentCapital);
  }

  // Drain: sum of all NPI costs
  let totalDrain = 0;
  for (const npi of activeNPIs) {
    totalDrain += getNPIDailyCost(npi);
  }

  return -totalDrain;
}

/**
 * Compute compliance multiplier based on current social capital.
 * When capital is above collapse threshold, returns 1.0 (no effect).
 * Below threshold, returns a quadratic drop-off.
 * @returns multiplier in [0, 1]
 */
export function socialCapitalComplianceMultiplier(
  capital: number,
  collapseThreshold: number,
): number {
  if (capital >= collapseThreshold) return 1.0;
  if (capital <= 0) return 0;
  // Quadratic drop: (capital / threshold)^2
  const ratio = capital / collapseThreshold;
  return ratio * ratio;
}

/**
 * Apply one day of social capital change.
 * @returns new social capital value, clamped to [0, initial]
 */
export function stepSocialCapital(
  currentCapital: number,
  activeNPIs: NPIConfig[],
  config: SocialCapitalConfig,
): number {
  const delta = computeSocialCapitalDelta(activeNPIs, currentCapital, config);
  return Math.max(0, Math.min(config.initial, currentCapital + delta));
}
