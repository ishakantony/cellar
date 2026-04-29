import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      './packages/shared/vitest.config.ts',
      './packages/feature-vault/vitest.config.ts',
      './packages/feature-account/vitest.config.ts',
      './packages/feature-toolbox/vitest.config.ts',
      './apps/shell/vitest.config.ts',
      './apps/api/vitest.config.ts',
    ],
  },
});
