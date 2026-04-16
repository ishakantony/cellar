import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'vitest.config.ts',
  {
    test: {
      name: 'storybook',
      include: ['src/**/*.stories.@(js|jsx|ts|tsx)'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
      },
    },
  },
]);
