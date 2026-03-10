/**
 * Economic Model — Tracks GDP, unemployment, fiscal costs, business confidence.
 *
 * Each active measure has an economic cost per turn.
 * The economy naturally recovers when measures are relaxed.
 * High unemployment feeds back into social capital drain.
 */

import { type EconomicState, type GameMeasure } from './types';

/** Default starting economic state. */
export function defaultEconomicState(): EconomicState {
  return {
    gdpImpact: 0,
    unemploymentDelta: 0,
    fiscalCost: 0,
    businessConfidence: 80,
  };
}

/** GDP recovery rate per turn when no measures active (partial recovery). */
const GDP_RECOVERY_PER_TURN = 0.05; // +0.05% per turn
/** Unemployment recovery rate per turn (natural re-employment). */
const UNEMPLOYMENT_RECOVERY_PER_TURN = 0.2; // -0.2pp per turn
/** Business confidence recovery rate per turn. */
const CONFIDENCE_RECOVERY_PER_TURN = 2;
/** Business confidence drain per 1% GDP loss. */
const CONFIDENCE_DRAIN_PER_GDP_LOSS = 5;

/**
 * Step the economic model for one turn.
 *
 * @param current - Current economic state
 * @param activeMeasures - Active measures this turn
 * @param financialSupportGranted - Whether extraordinary financial support was granted this turn
 * @returns Updated economic state
 */
export function stepEconomics(
  current: EconomicState,
  activeMeasures: GameMeasure[],
  financialSupportGranted: boolean = false,
): EconomicState {
  // Sum economic costs of active measures
  let totalGDPHit = 0;
  let totalFiscalCost = 0;
  let hasCompensation = financialSupportGranted; // financial support acts as business_support
  let hasKurzarbeit = false;

  for (const m of activeMeasures) {
    totalGDPHit += m.economicCostPerTurn;
    if (m.economicCostPerTurn > 0) {
      totalFiscalCost += m.economicCostPerTurn * 0.3; // fiscal cost ≈ 30% of GDP hit
    }
    if (m.id === 'business_support') hasCompensation = true;
    if (m.id === 'kurzarbeit') hasKurzarbeit = true;
  }

  // Compensation reduces GDP hit by 40% but increases fiscal cost
  if (hasCompensation) {
    totalFiscalCost += totalGDPHit * 0.4;
    totalGDPHit *= 0.6;

    // Extraordinary support has additional fiscal cost if granted
    if (financialSupportGranted) {
        totalFiscalCost += 1.0; // arbitrary billion
    }
  }

  // Kurzarbeit reduces unemployment growth by 60%
  const unemploymentGrowth = totalGDPHit * 0.5 * (hasKurzarbeit ? 0.4 : 1.0);

  // Natural recovery
  const gdpRecovery = activeMeasures.length === 0 ? GDP_RECOVERY_PER_TURN : GDP_RECOVERY_PER_TURN * 0.3;
  const unemploymentRecovery = Math.min(current.unemploymentDelta, UNEMPLOYMENT_RECOVERY_PER_TURN);

  const newGDP = current.gdpImpact - totalGDPHit + gdpRecovery;
  const newUnemployment = Math.max(0, current.unemploymentDelta + unemploymentGrowth - unemploymentRecovery);

  // Business confidence
  let confidenceDelta = 0;
  if (totalGDPHit > 0) {
    confidenceDelta -= totalGDPHit * CONFIDENCE_DRAIN_PER_GDP_LOSS;
  } else {
    confidenceDelta += CONFIDENCE_RECOVERY_PER_TURN;
  }

  const newConfidence = Math.max(0, Math.min(100, current.businessConfidence + confidenceDelta));

  return {
    gdpImpact: Math.round(newGDP * 100) / 100,
    unemploymentDelta: Math.round(newUnemployment * 100) / 100,
    fiscalCost: Math.round((current.fiscalCost + totalFiscalCost) * 100) / 100,
    businessConfidence: Math.round(newConfidence * 10) / 10,
  };
}

/**
 * Social capital modifier from unemployment.
 * High unemployment causes public unrest → drains social capital.
 * @returns Additional daily social capital drain (negative value)
 */
export function unemploymentSocialCapitalDrain(unemploymentDelta: number): number {
  if (unemploymentDelta < 2) return 0;
  // Above 2% unemployment increase: -0.1 per day per percentage point over 2
  return -(unemploymentDelta - 2) * 0.1;
}
