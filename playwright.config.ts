// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

// Use test environment variables
(process.env as Record<string, string>).NODE_ENV = 'test';
(process.env as Record<string, string>).E2E_TEST_MODE = 'true';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Run tests sequentially to avoid overloading the dev server */
  workers: 1,

  /* Reporter to use */
  reporter: [['html', { open: 'never' }]],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:5201',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    launchOptions: {
      /* Slow Motion */
      slowMo: process.env.SLOW_MO ? 250 : 0,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - runs first to authenticate
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Main test projects - reuse auth state from setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  /* Run local dev server before starting the tests */
  webServer: {
    command: 'pnpm --filter api dev',
    url: 'http://localhost:5201/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
      E2E_TEST_MODE: 'true',
    },
  },
});
