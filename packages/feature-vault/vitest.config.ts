import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@cellar/shared': path.resolve(dirname, '../shared/src/index.ts'),
      '@cellar/ui/styles.css': path.resolve(dirname, '../ui/src/styles.css'),
      '@cellar/ui': path.resolve(dirname, '../ui/src/index.ts'),
      '@cellar/shell-contract': path.resolve(dirname, '../shell-contract/src/index.ts'),
    },
  },
  test: {
    name: 'feature-vault',
    environment: 'happy-dom',
    globals: true,
    setupFiles: [path.resolve(dirname, './src/test-setup.ts')],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
