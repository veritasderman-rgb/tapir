import { type ContactSubMatrix, type Demographics, NUM_AGE_GROUPS } from '../types';

/**
 * Compute the spectral radius (dominant eigenvalue) of a square matrix
 * using power iteration.
 *
 * Sufficient for NGM matrices which are non-negative and irreducible.
 */
export function spectralRadius(matrix: number[][], maxIterations = 1000, tolerance = 1e-10): number {
  const n = matrix.length;
  // Start with uniform vector
  let v = new Array(n).fill(1 / Math.sqrt(n));
  let eigenvalue = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    // Matrix-vector multiply: w = M * v
    const w = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        w[i] += matrix[i][j] * v[j];
      }
    }

    // Compute norm
    const norm = Math.sqrt(w.reduce((sum, x) => sum + x * x, 0));
    if (norm === 0) return 0;

    const newEigenvalue = norm;

    // Normalize
    for (let i = 0; i < n; i++) {
      v[i] = w[i] / norm;
    }

    if (Math.abs(newEigenvalue - eigenvalue) < tolerance) {
      return newEigenvalue;
    }
    eigenvalue = newEigenvalue;
  }

  return eigenvalue;
}

/**
 * Build the Next-Generation Matrix (NGM) for the age-stratified SEIR model.
 *
 * For SEIR with force of infection λ_i = β * Σ_j C_ij * I_j / N_j,
 * the NGM entry K_ij = β * C_ij * (N_i / N_j) * (1/γ)
 *
 * Wait — more precisely for the standard SEIR formulation:
 * K_ij = β * C_ij * S_i / N_j * D_inf
 * where D_inf = infectiousPeriod = 1/γ
 *
 * At disease-free equilibrium S_i = N_i, so:
 * K_ij = β * C_ij * N_i / N_j * D_inf
 *
 * But since we want R0 = spectral_radius(K), and we calibrate β from R0,
 * we can factor out β * D_inf:
 *
 * K = β * D_inf * M   where M_ij = C_ij * N_i / N_j
 *
 * Then R0 = β * D_inf * spectral_radius(M)
 * => β = R0 / (D_inf * spectral_radius(M))
 */
export function buildNGMBaseMatrix(
  contactMatrix: ContactSubMatrix,
  populationSizes: number[],
): number[][] {
  const n = contactMatrix.length;
  const M: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // M_ij = C_ij * N_i / N_j
      if (populationSizes[j] > 0) {
        M[i][j] = contactMatrix[i][j] * populationSizes[i] / populationSizes[j];
      }
    }
  }

  return M;
}

/**
 * Compute the implied R0 from a given beta, contact matrix, and demographics.
 * R0 = β * D_inf * spectral_radius(M)
 */
export function computeImpliedR0(
  beta: number,
  infectiousPeriod: number,
  contactMatrix: ContactSubMatrix,
  populationSizes: number[],
): number {
  const M = buildNGMBaseMatrix(contactMatrix, populationSizes);
  return beta * infectiousPeriod * spectralRadius(M);
}

/**
 * Compute Reff(t) using current susceptible fractions.
 * Reff = β * D_inf * spectral_radius(M_eff)
 * where M_eff_ij = C_ij * S_i / N_j
 */
export function computeReff(
  beta: number,
  infectiousPeriod: number,
  contactMatrix: ContactSubMatrix,
  susceptible: number[],
  populationSizes: number[],
): number {
  const n = contactMatrix.length;
  const Meff: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (populationSizes[j] > 0) {
        Meff[i][j] = contactMatrix[i][j] * susceptible[i] / populationSizes[j];
      }
    }
  }

  return beta * infectiousPeriod * spectralRadius(Meff);
}

/**
 * Get population sizes per age group from Demographics.
 */
export function getAgeGroupPopulations(demographics: Demographics): number[] {
  const N = demographics.totalPopulation;
  return demographics.ageFractions.map(f => f * N);
}
