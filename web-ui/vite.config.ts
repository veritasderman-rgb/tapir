import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(() => ({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@tapir/core': path.resolve(__dirname, '../simulation-core/src'),
    },
  },
  worker: {
    format: 'es',
  },
}));
