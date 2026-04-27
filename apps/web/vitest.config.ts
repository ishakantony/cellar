import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@cellar/shared': path.resolve(dirname, '../../packages/shared/src/index.ts'),
      '@cellar/ui/styles.css': path.resolve(dirname, '../../packages/ui/src/styles.css'),
      '@cellar/ui': path.resolve(dirname, '../../packages/ui/src/index.ts'),
    },
  },
  test: {
    name: 'web',
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
