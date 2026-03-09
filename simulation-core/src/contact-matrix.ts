import { type ContactMatrix, type ContactSubMatrix, NUM_AGE_GROUPS } from './types';

/**
 * Sum all sub-matrices (home + school + work + community) into one
 * aggregate contact matrix.
 */
export function sumContactMatrix(cm: ContactMatrix): ContactSubMatrix {
  const result: ContactSubMatrix = Array.from({ length: NUM_AGE_GROUPS }, () =>
    new Array(NUM_AGE_GROUPS).fill(0),
  );
  for (const key of ['home', 'school', 'work', 'community'] as const) {
    const sub = cm[key];
    for (let i = 0; i < NUM_AGE_GROUPS; i++) {
      for (let j = 0; j < NUM_AGE_GROUPS; j++) {
        result[i][j] += sub[i][j];
      }
    }
  }
  return result;
}

/**
 * Apply a scalar multiplier to a specific sub-matrix, returning a new ContactMatrix.
 */
export function modifySubMatrix(
  cm: ContactMatrix,
  setting: keyof ContactMatrix,
  multiplier: number,
): ContactMatrix {
  const modified = { ...cm };
  modified[setting] = cm[setting].map(row => row.map(v => v * multiplier));
  return modified;
}

/**
 * Scale an entire contact sub-matrix by a scalar.
 */
export function scaleSubMatrix(m: ContactSubMatrix, factor: number): ContactSubMatrix {
  return m.map(row => row.map(v => v * factor));
}
