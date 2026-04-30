import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'shell-contract',
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
