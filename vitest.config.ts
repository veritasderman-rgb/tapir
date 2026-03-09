import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@tapir/core': path.resolve(__dirname, 'simulation-core/src'),
    },
  },
  test: {
    globals: true,
  },
});
