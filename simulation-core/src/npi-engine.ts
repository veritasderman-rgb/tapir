import {
  type NPIConfig,
  type ContactMatrix,
  type ContactSubMatrix,
  ComplianceModel,
  NPIType,
  NUM_AGE_GROUPS,
} from './types';
import { sumContactMatrix, modifySubMatrix } from './contact-matrix';

/**
 * Compute compliance at a given day for an NPI.
 */
export function computeCompliance(npi: NPIConfig, day: number): number {
  if (day < npi.startDay || day > npi.endDay) return 0;

  const daysSinceStart = day - npi.startDay;
  const config = npi.compliance;

  switch (config.model) {
    case ComplianceModel.ExponentialDecay: {
      const rate = config.decayRate ?? 0;
      return config.initial * Math.exp(-rate * daysSinceStart);
    }
    case ComplianceModel.PiecewiseLinear: {
      const bp = config.breakpoints ?? [[0, config.initial]];
      // Find the segment
      if (bp.length === 0) return config.initial;

      // Before first breakpoint
      if (daysSinceStart <= bp[0][0]) return bp[0][1];

      // After last breakpoint
      if (daysSinceStart >= bp[bp.length - 1][0]) return bp[bp.length - 1][1];

      // Interpolate between breakpoints
      for (let i = 0; i < bp.length - 1; i++) {
        if (daysSinceStart >= bp[i][0] && daysSinceStart <= bp[i + 1][0]) {
          const t = (daysSinceStart - bp[i][0]) / (bp[i + 1][0] - bp[i][0]);
          return bp[i][1] + t * (bp[i + 1][1] - bp[i][1]);
        }
      }
      return config.initial;
    }
    default:
      return config.initial;
  }
}

/**
 * Apply all active NPIs for a given day.
 *
 * Returns:
 * - modified contact matrix (aggregated)
 * - beta multiplier
 * - gamma multiplier
 */
export function applyNPIs(
  npis: NPIConfig[],
  day: number,
  baseContactMatrix: ContactMatrix,
): {
  contactMatrix: ContactSubMatrix;
  betaMultiplier: number;
  gammaMultiplier: number;
} {
  let betaMultiplier = 1.0;
  let gammaMultiplier = 1.0;
  let currentCM = baseContactMatrix;

  for (const npi of npis) {
    if (day < npi.startDay || day > npi.endDay) continue;

    const compliance = computeCompliance(npi, day);
    // Effective reduction = value * compliance
    // value < 1 means reduction, so effective modifier = 1 - (1 - value) * compliance
    const effectiveModifier = 1 - (1 - npi.value) * compliance;

    switch (npi.type) {
      case NPIType.BetaMultiplier:
        betaMultiplier *= effectiveModifier;
        break;
      case NPIType.GammaMultiplier:
        gammaMultiplier *= effectiveModifier;
        break;
      case NPIType.ContactSubMatrixModifier:
        if (npi.targetSubMatrix) {
          currentCM = modifySubMatrix(currentCM, npi.targetSubMatrix, effectiveModifier);
        }
        break;
    }
  }

  return {
    contactMatrix: sumContactMatrix(currentCM),
    betaMultiplier,
    gammaMultiplier,
  };
}
