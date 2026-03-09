import { type ContactSubMatrix, type Demographics } from '../types';
import { buildNGMBaseMatrix, spectralRadius, getAgeGroupPopulations } from './ngm';

/**
 * Calibrate beta such that the implied R0 matches the target R0.
 *
 * R0 = β * D_inf * ρ(M)
 * => β = R0 / (D_inf * ρ(M))
 *
 * where M is the base NGM matrix and ρ is the spectral radius.
 */
export function calibrateBeta(
  targetR0: number,
  infectiousPeriod: number,
  contactMatrix: ContactSubMatrix,
  demographics: Demographics,
): number {
  const populationSizes = getAgeGroupPopulations(demographics);
  const M = buildNGMBaseMatrix(contactMatrix, populationSizes);
  const rho = spectralRadius(M);

  if (rho === 0 || infectiousPeriod === 0) {
    throw new Error('Cannot calibrate beta: spectral radius or infectious period is zero.');
  }

  return targetR0 / (infectiousPeriod * rho);
}
