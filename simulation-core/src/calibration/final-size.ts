/**
 * Solve the SIR final size equation: z = 1 - exp(-R0 * z)
 * using Newton's method.
 *
 * @param R0 - Basic reproduction number
 * @param tolerance - Stopping criterion
 * @returns The fraction of the population eventually infected (z)
 */
export function solveFinalSize(R0: number, tolerance = 1e-7): number {
  if (R0 <= 1) return 0;

  // Initial guess: for R0 > 1, z is between 0 and 1.
  // A good starting point is 1 - 1/R0 or just 0.5.
  let z = 0.8;
  for (let i = 0; i < 100; i++) {
    const expTerm = Math.exp(-R0 * z);
    const f = z - 1 + expTerm;
    const df = 1 - R0 * expTerm;

    const nextZ = z - f / df;
    if (Math.abs(nextZ - z) < tolerance) {
      return nextZ;
    }
    z = nextZ;
  }
  return z;
}
