# E2E Testing with Playwright - Design Document

**Date:** 2026-04-16  
**Status:** Approved  
**Scope:** Implement end-to-end testing using Playwright for authentication flows and protected routes

---

## Overview

This document outlines the implementation of end-to-end (e2e) testing for the Cellar application using Playwright. The tests will cover core authentication flows (sign up, sign in) and verify that protected routes properly redirect unauthenticated users.

### Goals

1. Test sign up flow with email/password
2. Test sign in flow with existing account
3. Verify protected routes redirect to sign-in when user is not authenticated
4. Ensure tests can run locally and be easily integrated into CI later

### Non-Goals

- Testing GitHub OAuth (social login)
- CI workflow configuration (GitHub Actions)
- Visual regression testing
- Performance testing

---

## Architecture

### Approach: Setup Project with Shared Auth State

We will use Playwright's recommended pattern:
1. **Setup Project**: Authenticate once via UI and save session state
2. **Test Projects**: Reuse saved auth state for fast test execution
3. **Isolated Tests**: Specific tests perform full UI flows without shared state

This approach balances speed (most tests reuse auth) with coverage (setup validates full flow, isolated tests validate specific scenarios).

### Project Structure

```
cellar/
├── e2e/
│   ├── auth.setup.ts              # Setup project - creates authenticated state
│   ├── fixtures/
│   │   └── test-data.ts           # Test user data factories (optional)
│   ├── utils/
│   │   └── db.ts                  # Database helper for cleanup
│   └── specs/
│       ├── auth.spec.ts           # Auth flow tests (signup, login)
│       └── protected-routes.spec.ts  # Protected route redirect tests
├── playwright.config.ts           # Playwright configuration
├── playwright/.auth/              # Auth state storage (gitignored)
│   └── user.json                  # Saved authenticated session
├── scripts/
│   └── setup-test-db.ts           # Test database setup script
└── .env.test                      # Test environment variables
```

---

## Database Strategy

### Separate Test Database

Tests will use a dedicated PostgreSQL database (`cellar_test`) within the existing Docker Compose Postgres container.

**Benefits:**
- Test data isolated from development data
- Fast setup (no additional container)
- Easy CI integration later
- Clean slate for each test run

### Environment Variables

`.env.test`:
```bash
DATABASE_URL=postgresql://cellar:cellar@localhost:5432/cellar_test
BETTER_AUTH_SECRET=test-secret-for-e2e-tests
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### Test Database Setup Script

`scripts/setup-test-db.ts`:
- Loads `.env.test` using dotenv
- Connects to Postgres base URL (without database name)
- Creates `cellar_test` database if it doesn't exist
- Runs Prisma migrations
- Handles errors gracefully

### Data Cleanup

Each test is responsible for cleaning up its test data:
- Use Prisma `deleteMany` with test-specific email patterns
- Cleanup in `test.afterEach` or `test.afterAll` hooks
- Pattern: `e2e-test-${timestamp}@example.com` for unique identification

---

## Playwright Configuration

### Key Settings

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    { name: 'firefox', ... },
    { name: 'webkit', ... },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Browser Support

- Chromium (primary)
- Firefox
- WebKit (Safari)

All browsers reuse the same authenticated state from the setup project.

---

## Test Specifications

### Setup Project: `e2e/auth.setup.ts`

**Purpose:** Authenticate once and save session state for reuse.

**Flow:**
1. Generate unique test credentials
2. Navigate to `/sign-up`
3. Fill and submit sign-up form
4. Wait for redirect to `/dashboard`
5. Save `storageState` to `playwright/.auth/user.json`

**Cleanup:** Remove test user after setup (or use unique emails to avoid conflicts)

### Auth Flow Tests: `e2e/specs/auth.spec.ts`

**Test 1: User can sign up**
- Navigate to `/sign-up`
- Fill name, email, password fields
- Submit form
- Assert redirect to `/dashboard`
- Assert dashboard heading visible
- Cleanup: Delete test user

**Test 2: User can sign in**
- Create user via sign-up (prerequisite)
- Navigate to `/sign-in`
- Fill email, password
- Submit form
- Assert redirect to `/dashboard`
- Cleanup: Delete test user

**Note:** These tests do NOT use shared auth state. They validate the actual UI flows.

### Protected Routes Tests: `e2e/specs/protected-routes.spec.ts`

**Test 1: Unauthenticated redirect**
- Create fresh browser context (no auth state)
- Navigate to `/dashboard`
- Assert redirect to `/sign-in`
- Assert sign-in page visible

**Test 2-4: Authenticated access**
- Use shared auth state (from setup project)
- Navigate to `/dashboard`, `/collections`, `/settings`
- Assert each page loads successfully
- Assert no redirects occur

---

## Package.json Scripts

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug",
    "e2e:setup": "tsx scripts/setup-test-db.ts",
    "test:e2e": "npm run e2e:setup && playwright test",
    "test:e2e:ui": "npm run e2e:setup && playwright test --ui"
  }
}
```

### Usage

```bash
# Setup test database (run once or after schema changes)
npm run e2e:setup

# Run all e2e tests
npm run test:e2e

# Run tests without setup (assumes DB ready)
npm run e2e

# Interactive UI mode
npm run test:e2e:ui

# Debug specific test
npm run e2e:debug
```

---

## Dependencies

### New Dev Dependencies

```json
{
  "@playwright/test": "^1.40.0"
}
```

### Existing Dependencies Used

- `dotenv`: Already installed, used for loading `.env.test`
- `@types/node`: Already installed
- `tsx`: Already available (via npx), used for running setup script
- `pg`: Already installed, used for database setup

---

## CI Readiness

While we are not creating CI workflows now, the structure supports easy GitHub Actions integration:

1. **Environment Variables**: Centralized in `.env.test`
2. **Database Setup**: Single command (`npm run e2e:setup`)
3. **Test Command**: Single command (`npm run e2e`)
4. **Cross-browser**: Already configured for Chromium, Firefox, WebKit
5. **Artifacts**: HTML reports, traces, and screenshots configured

Future CI workflow would:
- Use Postgres service container
- Set environment variables
- Run setup script
- Run tests
- Upload artifacts on failure

---

## Error Handling

### Test-Level
- Each test cleans up its data
- Unique email patterns prevent conflicts
- `test.afterEach` / `test.afterAll` hooks for cleanup

### Configuration-Level
- Retries on CI (2 attempts)
- Trace collection on first retry
- Screenshots on failure
- `forbidOnly` prevents accidental `test.only` in CI

### Script-Level
- `setup-test-db.ts` validates DATABASE_URL exists
- Clear error messages for missing env vars
- Graceful failure with exit code 1

---

## Security Considerations

1. **Auth State Files**: `playwright/.auth/` is gitignored
   - Contains sensitive session cookies
   - Never commit to repository

2. **Test Credentials**: Use unique, disposable emails
   - Pattern: `e2e-test-${timestamp}@example.com`
   - Cleanup after tests

3. **Environment Variables**: 
   - `.env.test` should be gitignored
   - Example provided in documentation

4. **Better Auth Secret**: Use test-specific secret
   - Different from production/development
   - Prevents session conflicts

---

## Implementation Checklist

- [ ] Install `@playwright/test` dependency
- [ ] Create `.env.test` with test database configuration
- [ ] Create `playwright.config.ts` with setup project and browser projects
- [ ] Create `scripts/setup-test-db.ts` for database initialization
- [ ] Update `.gitignore` to exclude `playwright/.auth/` and `.env.test`
- [ ] Create `e2e/auth.setup.ts` for authentication setup project
- [ ] Create `e2e/specs/auth.spec.ts` with sign-up and sign-in tests
- [ ] Create `e2e/specs/protected-routes.spec.ts` with redirect tests
- [ ] Add e2e scripts to `package.json`
- [ ] Run `npx playwright install` to install browser binaries
- [ ] Test the complete flow locally

---

## Testing Philosophy

Following Playwright best practices:

1. **Test user-visible behavior**: Use role-based selectors (`getByRole`, `getByLabel`) not CSS selectors
2. **Web-first assertions**: Use `toBeVisible()`, `toHaveURL()` not manual assertions
3. **Isolation**: Each test is independent, no shared state except explicit setup
4. **Realistic data**: Test with realistic email/password formats
5. **Fast feedback**: Setup project pattern minimizes redundant authentication

---

## Future Enhancements (Out of Scope)

- GitHub OAuth testing (requires test GitHub app)
- Visual regression testing
- Mobile/responsive testing with device emulation
- API-only authentication for even faster tests
- Parallel test execution optimization
- CI workflow configuration

---

## References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Next.js Testing with Playwright](https://nextjs.org/docs/app/building-your-application/testing/playwright)
- [Playwright Authentication Guide](https://playwright.dev/docs/auth)
- [Better Auth Documentation](https://better-auth.com/docs)
