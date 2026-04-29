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
      '@cellar/shell-contract': path.resolve(dirname, '../../packages/shell-contract/src/index.ts'),
      '@cellar/feature-vault/manifest': path.resolve(
        dirname,
        '../../packages/feature-vault/src/manifest.ts'
      ),
      '@cellar/feature-vault': path.resolve(dirname, '../../packages/feature-vault/src/index.tsx'),
      '@cellar/feature-toolbox/manifest': path.resolve(
        dirname,
        '../../packages/feature-toolbox/src/manifest.ts'
      ),
      '@cellar/feature-toolbox': path.resolve(
        dirname,
        '../../packages/feature-toolbox/src/index.ts'
      ),
      '@cellar/feature-account/manifest': path.resolve(
        dirname,
        '../../packages/feature-account/src/manifest.ts'
      ),
      '@cellar/feature-account': path.resolve(
        dirname,
        '../../packages/feature-account/src/index.tsx'
      ),
    },
  },
  test: {
    name: 'shell',
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
