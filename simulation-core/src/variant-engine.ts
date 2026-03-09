import { type VariantShockConfig, type CompartmentState, NUM_STRATA } from './types';

export interface VariantEffect {
  /** Multiplier on beta for this day */
  transmissibilityMultiplier: number;
  /** Fraction of VE lost */
  immuneEscape: number;
  /** Whether a variant activated this day */
  variantActivated: boolean;
  /** Name of the activated variant */
  variantName?: string;
}

/**
 * Determine the day a variant activates.
 * If day >= 0, it's fixed. If day === -1, it's random based on mean/std.
 */
export function resolveVariantDay(
  variant: VariantShockConfig,
  rng: () => number,
): number {
  if (variant.day >= 0) return variant.day;

  // Box-Muller transform for normal distribution
  const mean = variant.randomMeanDay ?? 100;
  const std = variant.randomStdDev ?? 20;
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, Math.round(mean + z * std));
}

/**
 * Apply variant shock: move fraction of R back to S (reinfection boost).
 * Mutates the strata in place.
 */
export function applyReinfectionBoost(
  strata: CompartmentState[],
  reinfectionBoost: number,
): void {
  for (let i = 0; i < NUM_STRATA; i++) {
    const rToS = strata[i].R * reinfectionBoost;
    strata[i].R -= rToS;
    strata[i].S += rToS;
  }
}

/**
 * Compute cumulative variant effects for a given day.
 * Variants stack multiplicatively for transmissibility.
 */
export function computeVariantEffects(
  variants: VariantShockConfig[],
  activationDays: number[],
  currentDay: number,
): VariantEffect {
  let transmissibilityMultiplier = 1.0;
  let immuneEscape = 0;
  let variantActivated = false;
  let variantName: string | undefined;

  for (let i = 0; i < variants.length; i++) {
    if (currentDay >= activationDays[i]) {
      transmissibilityMultiplier *= variants[i].transmissibilityMultiplier;
      immuneEscape = Math.min(1, immuneEscape + variants[i].immuneEscape);
    }
    // Check if variant activates exactly today
    if (currentDay === activationDays[i]) {
      variantActivated = true;
      variantName = variants[i].name;
    }
  }

  return { transmissibilityMultiplier, immuneEscape, variantActivated, variantName };
}
