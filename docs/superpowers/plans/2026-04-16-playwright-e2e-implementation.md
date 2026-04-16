# Playwright E2E Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement end-to-end testing with Playwright covering sign-up, sign-in, and protected route authentication flows.

**Architecture:** Uses Playwright's setup project pattern - authenticate once via UI, save session state, reuse across all test projects. Separate test database (`cellar_test`) in existing Docker Compose Postgres for data isolation.

**Tech Stack:** Playwright, TypeScript, Next.js 16, better-auth, PostgreSQL, Prisma

---

## File Structure Overview

| File | Purpose |
|------|---------|
| `.env.test` | Test environment variables |
| `playwright.config.ts` | Playwright configuration with setup project and browsers |
| `scripts/setup-test-db.ts` | Creates test database and runs migrations |
| `e2e/auth.setup.ts` | Setup project - authenticates and saves session state |
| `e2e/specs/auth.spec.ts` | Sign-up and sign-in flow tests |
| `e2e/specs/protected-routes.spec.ts` | Protected route redirect and access tests |
| `e2e/utils/db.ts` | Database cleanup utilities |

---

## Task 1: Install Playwright Dependency

**Files:**
- Modify: `package.json` (add devDependency)

- [ ] **Step 1: Install @playwright/test**

Run: `npm install --save-dev @playwright/test@^1.40.0`

Expected: Package installed successfully

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @playwright/test dependency"
```

---

## Task 2: Create Test Environment File

**Files:**
- Create: `.env.test`

- [ ] **Step 1: Create .env.test with test database configuration**

```bash
# .env.test
NODE_ENV=test
# Enable E2E test mode (disables CSRF for testing only - NEVER set this in production!)
E2E_TEST_MODE=true
DATABASE_URL=postgresql://cellar:cellar@localhost:5432/cellar_test
BETTER_AUTH_SECRET=test-secret-for-e2e-tests-do-not-use-in-production
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
UPLOAD_DIR=./uploads-test
MAX_FILE_SIZE=10485760
```

- [ ] **Step 2: Verify .env.test is gitignored**

Check `.gitignore` should already exclude `.env.test` or add it:

```bash
# Add to .gitignore if not present
echo ".env.test" >> .gitignore
```

- [ ] **Step 3: Commit**

```bash
git add .env.test .gitignore
git commit -m "chore: add test environment configuration"
```

---

## Task 3: Create Test Database Setup Script

**Files:**
- Create: `scripts/setup-test-db.ts`
- Create: `e2e/utils/` (directory)

- [ ] **Step 1: Create e2e/utils directory**

Run: `mkdir -p e2e/utils`

- [ ] **Step 2: Create database setup script**

```typescript
// scripts/setup-test-db.ts
import 'dotenv/config';
import { config } from 'dotenv';
import { execSync } from 'child_process';
import { Client } from 'pg';
import path from 'path';

// Explicitly load .env.test, overriding any existing values
config({ path: path.resolve(process.cwd(), '.env.test'), override: true });

async function setupTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL environment variable is required');
    console.error('Make sure .env.test exists and contains DATABASE_URL');
    process.exit(1);
  }

  // Parse the connection URL to get base connection (without database name)
  const url = new URL(databaseUrl);
  const dbName = url.pathname.slice(1); // Remove leading slash
  const baseUrl = `${url.protocol}//${url.username}:${url.password}@${url.host}`;
  
  console.log(`Setting up test database: ${dbName}`);
  console.log(`Base connection: ${baseUrl}`);

  const client = new Client({ connectionString: baseUrl });
  
  try {
    await client.connect();
    
    // Check if test database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    
    if (result.rowCount === 0) {
      console.log(`Creating database: ${dbName}...`);
      // PostgreSQL doesn't allow parameterized queries for CREATE DATABASE
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
    
    await client.end();
    
    // Run Prisma migrations on test database
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate deploy', {
      env: process.env,
      stdio: 'inherit',
    });
    
    console.log('✅ Test database setup complete!');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    process.exit(1);
  }
}

setupTestDatabase();
```

- [ ] **Step 3: Commit**

```bash
git add scripts/setup-test-db.ts
git commit -m "chore: add test database setup script"
```

---

## Task 4: Create Database Cleanup Utilities

**Files:**
- Create: `e2e/utils/db.ts`

- [ ] **Step 1: Create database cleanup utilities**

```typescript
// e2e/utils/db.ts
import { prisma } from '../../src/lib/prisma';

/**
 * Delete a test user by email.
 * Use this in test cleanup to ensure test data doesn't persist.
 */
export async function cleanupTestUser(email: string): Promise<void> {
  try {
    await prisma.user.deleteMany({
      where: { email },
    });
  } catch (error) {
    // User might not exist, that's fine
    console.log(`Note: Could not delete user ${email} (may not exist)`);
  }
}

/**
 * Generate a unique test email with timestamp.
 * Pattern: e2e-test-{timestamp}@example.com
 */
export function generateTestEmail(prefix: string = 'e2e'): string {
  return `${prefix}-test-${Date.now()}@example.com`;
}

/**
 * Standard test user credentials.
 */
export const TEST_USER_CREDENTIALS = {
  name: 'E2E Test User',
  password: 'TestPassword123!',
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add e2e/utils/db.ts
git commit -m "chore: add e2e database utilities"
```

---

## Task 5: Create Playwright Configuration

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Create playwright.config.ts**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Use test environment variables
process.env.NODE_ENV = 'test';

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
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: 'html',
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
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
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
});
```

- [ ] **Step 2: Update .gitignore for Playwright**

Add to `.gitignore`:

```bash
# Playwright
/playwright-report/
/playwright/.cache/
/playwright/.auth/
/test-results/
```

- [ ] **Step 3: Commit**

```bash
git add playwright.config.ts .gitignore
git commit -m "chore: add Playwright configuration with setup project"
```

---

## Task 6: Create Authentication Setup Project

**Files:**
- Create: `e2e/auth.setup.ts`
- Create: `e2e/specs/` (directory)

- [ ] **Step 1: Create e2e/specs directory**

Run: `mkdir -p e2e/specs`

- [ ] **Step 2: Create auth setup project**

```typescript
// e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { prisma } from '../src/lib/prisma';
import { cleanupTestUser, generateTestEmail, TEST_USER_CREDENTIALS } from './utils/db';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Create a unique test user for this session
  const testEmail = generateTestEmail('setup');
  const { name, password } = TEST_USER_CREDENTIALS;

  // Clean up any existing test user with this email (in case of retries)
  await cleanupTestUser(testEmail);

  // Navigate to sign-up page
  await page.goto('/sign-up');
  
  // Verify we're on the sign-up page
  await expect(page.getByRole('heading', { name: /Cellar/i })).toBeVisible();
  
  // Fill out the sign-up form
  await page.getByLabel(/Name/i).fill(name);
  await page.getByLabel(/Email/i).fill(testEmail);
  await page.getByLabel(/Password/i).fill(password);
  
  // Submit the form
  await page.getByRole('button', { name: /Create Account/i }).click();
  
  // Wait for successful redirect to dashboard
  await page.waitForURL('/dashboard');
  await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  
  // Save the authentication state
  await page.context().storageState({ path: authFile });
  
  console.log(`✅ Authenticated as ${testEmail}`);
  
  // Cleanup: Remove the test user
  await cleanupTestUser(testEmail);
});
```

- [ ] **Step 3: Commit**

```bash
git add e2e/auth.setup.ts
git commit -m "test(e2e): add authentication setup project"
```

---

## Task 7: Create Auth Flow Tests

**Files:**
- Create: `e2e/specs/auth.spec.ts`

- [ ] **Step 1: Create sign-up and sign-in tests**

```typescript
// e2e/specs/auth.spec.ts
import { test, expect } from '@playwright/test';
import { cleanupTestUser, generateTestEmail, TEST_USER_CREDENTIALS } from '../utils/db';

test.describe('Authentication Flows', () => {
  // Note: Tests in this file don't use the shared auth state
  // They test the actual UI flows end-to-end
  
  test('user can sign up with email and password', async ({ page }) => {
    const testEmail = generateTestEmail('signup');
    const { name, password } = TEST_USER_CREDENTIALS;

    // Clean up before test
    await cleanupTestUser(testEmail);

    await page.goto('/sign-up');
    
    // Verify sign-up page loaded
    await expect(page.getByRole('heading', { name: /Cellar/i })).toBeVisible();
    await expect(page.getByText(/Create your vault/i)).toBeVisible();
    
    // Fill the sign-up form
    await page.getByLabel(/Name/i).fill(name);
    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/Password/i).fill(password);
    
    // Submit the form
    await page.getByRole('button', { name: /Create Account/i }).click();
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
    
    // Cleanup after test
    await cleanupTestUser(testEmail);
  });

  test('user can sign in with existing account', async ({ page }) => {
    const testEmail = generateTestEmail('signin');
    const { name, password } = TEST_USER_CREDENTIALS;

    // Clean up before test
    await cleanupTestUser(testEmail);

    // First, create a user via sign-up
    await page.goto('/sign-up');
    await page.getByLabel(/Name/i).fill(name);
    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/Password/i).fill(password);
    await page.getByRole('button', { name: /Create Account/i }).click();
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    
    // Sign out by navigating to sign-out API endpoint
    await page.goto('/api/auth/signout');
    await page.waitForURL('/sign-in');
    
    // Now test sign in
    await page.goto('/sign-in');
    
    // Verify sign-in page loaded
    await expect(page.getByRole('heading', { name: /Cellar/i })).toBeVisible();
    await expect(page.getByText(/Sign in to your vault/i)).toBeVisible();
    
    // Fill the sign-in form
    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/Password/i).fill(password);
    
    // Submit the form
    await page.getByRole('button', { name: /Sign In/i }).click();
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
    
    // Cleanup after test
    await cleanupTestUser(testEmail);
  });

  test('sign in shows error for invalid credentials', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Fill with non-existent credentials
    await page.getByLabel(/Email/i).fill('nonexistent@example.com');
    await page.getByLabel(/Password/i).fill('WrongPassword123!');
    
    // Submit the form
    await page.getByRole('button', { name: /Sign In/i }).click();
    
    // Should stay on sign-in page and show error
    await expect(page).toHaveURL('/sign-in');
    await expect(page.getByText(/Invalid/i).or(page.getByText(/incorrect/i))).toBeVisible();
  });
});
```

- [ ] **Step 2: Commit**

```bash
git add e2e/specs/auth.spec.ts
git commit -m "test(e2e): add authentication flow tests"
```

---

## Task 8: Create Protected Routes Tests

**Files:**
- Create: `e2e/specs/protected-routes.spec.ts`

- [ ] **Step 1: Create protected routes tests**

```typescript
// e2e/specs/protected-routes.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  test('redirects to sign-in when accessing dashboard while unauthenticated', async ({ browser }) => {
    // Create a fresh context without auth state
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    
    // Try to access dashboard without authentication
    await page.goto('/dashboard');
    
    // Should redirect to sign-in
    await expect(page).toHaveURL('/sign-in');
    await expect(page.getByRole('heading', { name: /Cellar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    
    await context.close();
  });

  test('redirects to sign-in when accessing collections while unauthenticated', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    
    await page.goto('/collections');
    
    await expect(page).toHaveURL('/sign-in');
    await expect(page.getByRole('heading', { name: /Cellar/i })).toBeVisible();
    
    await context.close();
  });

  test('redirects to sign-in when accessing settings while unauthenticated', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    
    await page.goto('/settings');
    
    await expect(page).toHaveURL('/sign-in');
    await expect(page.getByRole('heading', { name: /Cellar/i })).toBeVisible();
    
    await context.close();
  });

  test('authenticated user can access dashboard', async ({ page }) => {
    // This test uses the shared auth state from setup project
    await page.goto('/dashboard');
    
    // Should stay on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });

  test('authenticated user can access collections', async ({ page }) => {
    await page.goto('/collections');
    
    await expect(page).toHaveURL('/collections');
    await expect(page.getByRole('heading', { name: /Collections/i })).toBeVisible();
  });

  test('authenticated user can access settings', async ({ page }) => {
    await page.goto('/settings');
    
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
  });
});
```

- [ ] **Step 2: Commit**

```bash
git add e2e/specs/protected-routes.spec.ts
git commit -m "test(e2e): add protected routes tests"
```

---

## Task 9: Add NPM Scripts

**Files:**
- Modify: `package.json` (scripts section)

- [ ] **Step 1: Add e2e test scripts to package.json**

Add these scripts to the `scripts` section in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run",
    "prepare": "husky",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug",
    "e2e:setup": "tsx scripts/setup-test-db.ts",
    "test:e2e": "npm run e2e:setup && playwright test",
    "test:e2e:ui": "npm run e2e:setup && playwright test --ui"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add e2e test npm scripts"
```

---

## Task 10: Install Playwright Browser Binaries

**Files:**
- None (installs browsers globally)

- [ ] **Step 1: Install browser binaries**

Run: `npx playwright install`

Expected output:
```
Downloading Chromium...
Downloading Firefox...
Downloading WebKit...
Chromium downloaded
Firefox downloaded
WebKit downloaded
```

- [ ] **Step 2: Verify installation**

Run: `npx playwright --version`

Expected: Version number displayed (e.g., `Version 1.40.0`)

- [ ] **Step 3: Commit (if any package changes)**

```bash
git diff --quiet || git commit -m "chore: install Playwright browser binaries"
```

---

## Task 11: Verify End-to-End Setup

**Files:**
- All files created above

- [ ] **Step 1: Ensure Docker Compose is running**

Run: `docker compose ps` or `docker-compose ps`

Expected: Postgres service running on port 5432

If not running:
```bash
docker compose up -d
```

- [ ] **Step 2: Setup test database**

Run: `npm run e2e:setup`

Expected output:
```
Setting up test database: cellar_test
Base connection: postgresql://cellar:cellar@localhost:5432
Database cellar_test already exists
Running Prisma migrations...
✅ Test database setup complete!
```

- [ ] **Step 3: Run a quick syntax check**

Run: `npx tsc --noEmit`

Expected: No TypeScript errors (or only unrelated errors)

- [ ] **Step 4: Final verification commit**

```bash
git add .
git commit -m "feat: complete Playwright e2e test setup"
```

---

## Task 12: Test Execution Instructions

**Note:** This task is documentation only - no code changes.

After completing all tasks above, you can run the e2e tests with:

```bash
# Setup test database (run once or after schema changes)
npm run e2e:setup

# Run all e2e tests
npm run test:e2e

# Run tests without database setup (assumes DB ready)
npm run e2e

# Run tests in interactive UI mode
npm run test:e2e:ui

# Debug a specific test
npm run e2e:debug -- e2e/specs/auth.spec.ts

# Run tests in headed mode (see browser)
npm run e2e -- --headed

# Run tests for specific browser only
npm run e2e -- --project=chromium
```

**Expected Test Results:**
- ✅ Setup project authenticates successfully
- ✅ Sign-up test passes
- ✅ Sign-in test passes
- ✅ Invalid credentials test passes
- ✅ All protected route redirect tests pass
- ✅ All authenticated access tests pass

---

## Implementation Notes

### Troubleshooting

**Issue: DATABASE_URL not found**
- Solution: Ensure `.env.test` exists and has `DATABASE_URL` defined
- Run: `cat .env.test | grep DATABASE_URL`

**Issue: Postgres connection refused**
- Solution: Ensure Docker Compose is running
- Run: `docker compose up -d`

**Issue: Prisma schema not found**
- Solution: Run `npx prisma generate` to ensure Prisma client is generated

**Issue: Tests timeout waiting for server**
- Solution: Ensure dev server can start manually
- Run: `npm run dev` and verify it starts on port 3000

**Issue: Auth state not saved**
- Solution: Ensure `playwright/.auth/` directory exists
- Run: `mkdir -p playwright/.auth`

### Architecture Decisions

1. **Setup Project Pattern**: All test projects depend on the setup project, which authenticates once and saves state. This is the Playwright-recommended approach for speed.

2. **Test Database**: Separate database prevents test data from interfering with development data. Same Postgres container keeps resource usage low.

3. **Unique Emails**: Each test uses timestamp-based emails (`e2e-test-${Date.now()}@example.com`) to prevent conflicts and enable easy cleanup.

4. **No GitHub OAuth Tests**: Out of scope for initial implementation. Email/password flows provide sufficient coverage.

5. **CI Ready**: Structure supports GitHub Actions without changes, but workflow file creation is deferred.

---

## Verification Checklist

Before marking complete, verify:

- [ ] `npm install --save-dev @playwright/test@^1.40.0` executed
- [ ] `.env.test` created with test database URL
- [ ] `playwright.config.ts` created with setup project and 3 browser projects
- [ ] `scripts/setup-test-db.ts` created and executable
- [ ] `e2e/utils/db.ts` created with cleanup utilities
- [ ] `e2e/auth.setup.ts` created (setup project)
- [ ] `e2e/specs/auth.spec.ts` created (3 tests)
- [ ] `e2e/specs/protected-routes.spec.ts` created (6 tests)
- [ ] Package.json updated with e2e scripts
- [ ] `npx playwright install` executed (browsers installed)
- [ ] `npm run e2e:setup` runs successfully
- [ ] `.gitignore` updated with Playwright directories
- [ ] All changes committed

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-16-playwright-e2e-implementation.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach would you prefer?
