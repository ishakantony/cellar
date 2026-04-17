# Startup Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a grouped startup diagnostics report that prints once per Next.js server instance, surfaces key runtime configuration, and safely masks sensitive values.

**Architecture:** A pure helper in `src/lib/startup-report.ts` will parse an explicit allowlist of environment-backed settings, render a deterministic multi-section report, and expose a single entrypoint that logs once per server instance. `src/instrumentation.ts` will stay thin and call that helper from Next.js' `register()` hook so startup behavior remains aligned with Next 16 conventions.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Node.js `crypto`

---

## File Structure

**New Files:**

- `src/instrumentation.ts` - Next.js startup hook that triggers the startup report once per server instance
- `src/lib/startup-report.ts` - Pure startup diagnostics helpers, masking utilities, report renderer, and once-per-instance logger
- `src/lib/startup-report.test.ts` - Unit tests for report rendering, masking, parsing, and duplicate prevention

**Modified Files:**

- `.env.example` - Document `BETTER_AUTH_TRUSTED_ORIGINS` so the surfaced startup diagnostics map to the example env contract

---

## Phase 1: Tests First

### Task 1: Add startup report tests

**Files:**

- Create: `src/lib/startup-report.test.ts`
- Reference: `vitest.config.ts`

- [ ] **Step 1: Create the failing test file**

Add `src/lib/startup-report.test.ts` with:

```ts
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  createStartupReport,
  logStartupReportOnce,
  parseDatabaseUrl,
  resetStartupReportStateForTests,
} from './startup-report';

describe('parseDatabaseUrl', () => {
  test('returns safe database details without credentials', () => {
    expect(
      parseDatabaseUrl('postgresql://cellar:supersecret@localhost:5432/cellar?schema=public')
    ).toEqual('postgresql host=localhost port=5432 db=cellar');
  });

  test('returns present (unparseable) for invalid URLs', () => {
    expect(parseDatabaseUrl('definitely not a url')).toBe('present (unparseable)');
  });

  test('returns missing when DATABASE_URL is absent', () => {
    expect(parseDatabaseUrl(undefined)).toBe('missing');
  });
});

describe('createStartupReport', () => {
  test('renders grouped startup diagnostics with masked secrets', () => {
    const report = createStartupReport({
      NODE_ENV: 'development',
      PORT: '3001',
      E2E_TEST_MODE: 'true',
      DATABASE_URL: 'postgresql://cellar:supersecret@db.internal:5432/cellar',
      BETTER_AUTH_URL: 'http://localhost:3001',
      BETTER_AUTH_TRUSTED_ORIGINS: 'http://localhost:3001, https://cellar.example.com',
      BETTER_AUTH_SECRET: 'super-secret-value-12345',
      GITHUB_CLIENT_ID: 'github-client-id-12345',
      GITHUB_CLIENT_SECRET: 'github-client-secret-12345',
      UPLOAD_DIR: './uploads',
      MAX_FILE_SIZE: '10485760',
    });

    expect(report).toContain('[cellar] Startup configuration');
    expect(report).toContain('Runtime');
    expect(report).toContain('Database');
    expect(report).toContain('Auth');
    expect(report).toContain('Uploads');
    expect(report).toContain('NODE_ENV: development');
    expect(report).toContain('PORT: 3001');
    expect(report).toContain('E2E_TEST_MODE: true');
    expect(report).toContain('DATABASE_URL: postgresql host=db.internal port=5432 db=cellar');
    expect(report).toContain(
      'BETTER_AUTH_TRUSTED_ORIGINS: 2 origins [http://localhost:3001, https://cellar.example.com]'
    );
    expect(report).toContain('BETTER_AUTH_SECRET:');
    expect(report).toContain('(length 24, sha256:');
    expect(report).toContain('MAX_FILE_SIZE: 10485760');
    expect(report).not.toContain('supersecret');
    expect(report).not.toContain('super-secret-value-12345');
    expect(report).not.toContain('github-client-secret-12345');
  });

  test('falls back to readable defaults for missing and invalid values', () => {
    const report = createStartupReport({
      NODE_ENV: 'production',
      DATABASE_URL: 'not a valid url',
      BETTER_AUTH_URL: '',
      BETTER_AUTH_TRUSTED_ORIGINS: '%%%bad%%%',
      BETTER_AUTH_SECRET: 'tiny',
      GITHUB_CLIENT_ID: '',
      GITHUB_CLIENT_SECRET: undefined,
      UPLOAD_DIR: '',
      MAX_FILE_SIZE: '',
    });

    expect(report).toContain('PORT: default (3000)');
    expect(report).toContain('DATABASE_URL: present (unparseable)');
    expect(report).toContain('BETTER_AUTH_TRUSTED_ORIGINS: present (unparseable)');
    expect(report).toContain('GITHUB_CLIENT_ID: missing');
    expect(report).toContain('GITHUB_CLIENT_SECRET: missing');
    expect(report).toContain('UPLOAD_DIR: missing');
    expect(report).toContain('MAX_FILE_SIZE: missing');
    expect(report).not.toContain('tiny');
  });
});

describe('logStartupReportOnce', () => {
  beforeEach(() => {
    resetStartupReportStateForTests();
  });

  test('logs only once per server instance', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    logStartupReportOnce({
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://cellar:secret@localhost:5432/cellar',
    });
    logStartupReportOnce({
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://cellar:secret@localhost:5432/cellar',
    });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0]?.[0]).toContain('[cellar] Startup configuration');
  });
});
```

- [ ] **Step 2: Run the new test file and confirm it fails**

Run:

```bash
npm run test:run -- src/lib/startup-report.test.ts
```

Expected: FAIL with module resolution errors because `src/lib/startup-report.ts` does not exist yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add src/lib/startup-report.test.ts
git commit -m "test: add startup report coverage"
```

---

## Phase 2: Implement the helper

### Task 2: Build the startup-report utility

**Files:**

- Create: `src/lib/startup-report.ts`
- Test: `src/lib/startup-report.test.ts`

- [ ] **Step 1: Create the minimal implementation needed for the tests**

Add `src/lib/startup-report.ts` with:

```ts
import { createHash } from 'node:crypto';

type StartupEnv = Partial<Record<string, string | undefined>>;

const DEFAULT_PORT = '3000';
const PREVIEW_CHARS = 4;

let hasLoggedStartupReport = false;

function readEnvValue(env: StartupEnv, key: string): string | undefined {
  const value = env[key];
  if (value == null) return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function maskSecret(value: string | undefined): string {
  if (!value) {
    return 'missing';
  }

  const fingerprint = createHash('sha256').update(value).digest('hex').slice(0, 8);

  if (value.length <= PREVIEW_CHARS * 2) {
    return `[masked] (length ${value.length}, sha256:${fingerprint})`;
  }

  const prefix = value.slice(0, PREVIEW_CHARS);
  const suffix = value.slice(-PREVIEW_CHARS);
  return `${prefix}...${suffix} (length ${value.length}, sha256:${fingerprint})`;
}

export function parseDatabaseUrl(value: string | undefined): string {
  if (!value) {
    return 'missing';
  }

  try {
    const url = new URL(value);
    const provider = url.protocol.replace(':', '') || 'unknown';
    const host = url.hostname || 'unknown';
    const port = url.port || 'default';
    const databaseName = url.pathname.replace(/^\\//, '') || 'unknown';

    return `${provider} host=${host} port=${port} db=${databaseName}`;
  } catch {
    return 'present (unparseable)';
  }
}

function parseTrustedOrigins(value: string | undefined): string {
  if (!value) {
    return 'missing';
  }

  const candidates = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (candidates.length === 0) {
    return 'missing';
  }

  try {
    const origins = candidates.map((origin) => new URL(origin).origin).sort((a, b) => a.localeCompare(b));
    return `${origins.length} origins [${origins.join(', ')}]`;
  } catch {
    return 'present (unparseable)';
  }
}

function linesForSection(title: string, entries: Array<[string, string]>): string[] {
  return [title, ...entries.map(([label, rendered]) => `  ${label}: ${rendered}`)];
}

export function createStartupReport(env: StartupEnv = process.env): string {
  const runtimeLines = linesForSection('Runtime', [
    ['NODE_ENV', readEnvValue(env, 'NODE_ENV') ?? process.env.NODE_ENV ?? 'unknown'],
    ['PORT', readEnvValue(env, 'PORT') ?? `default (${DEFAULT_PORT})`],
    ['E2E_TEST_MODE', readEnvValue(env, 'E2E_TEST_MODE') ?? 'false'],
  ]);

  const databaseLines = linesForSection('Database', [
    ['DATABASE_URL', parseDatabaseUrl(readEnvValue(env, 'DATABASE_URL'))],
  ]);

  const authLines = linesForSection('Auth', [
    ['BETTER_AUTH_URL', readEnvValue(env, 'BETTER_AUTH_URL') ?? 'missing'],
    ['BETTER_AUTH_TRUSTED_ORIGINS', parseTrustedOrigins(readEnvValue(env, 'BETTER_AUTH_TRUSTED_ORIGINS'))],
    ['BETTER_AUTH_SECRET', maskSecret(readEnvValue(env, 'BETTER_AUTH_SECRET'))],
    ['GITHUB_CLIENT_ID', maskSecret(readEnvValue(env, 'GITHUB_CLIENT_ID'))],
    ['GITHUB_CLIENT_SECRET', maskSecret(readEnvValue(env, 'GITHUB_CLIENT_SECRET'))],
  ]);

  const uploadLines = linesForSection('Uploads', [
    ['UPLOAD_DIR', readEnvValue(env, 'UPLOAD_DIR') ?? 'missing'],
    ['MAX_FILE_SIZE', readEnvValue(env, 'MAX_FILE_SIZE') ?? 'missing'],
  ]);

  return [
    '[cellar] Startup configuration',
    ...runtimeLines.map((line) => `  ${line}`),
    ...databaseLines.map((line) => `  ${line}`),
    ...authLines.map((line) => `  ${line}`),
    ...uploadLines.map((line) => `  ${line}`),
  ].join('\n');
}

export function logStartupReportOnce(env: StartupEnv = process.env): void {
  if (hasLoggedStartupReport) {
    return;
  }

  hasLoggedStartupReport = true;
  console.info(createStartupReport(env));
}

export function resetStartupReportStateForTests(): void {
  hasLoggedStartupReport = false;
}
```

- [ ] **Step 2: Run the focused test file and confirm it passes**

Run:

```bash
npm run test:run -- src/lib/startup-report.test.ts
```

Expected: PASS for all startup report tests.

- [ ] **Step 3: Tighten the helper if the first pass exposed gaps**

If any test fails, adjust only `src/lib/startup-report.ts` so the output still follows the approved spec:

```ts
// Keep these invariants while fixing test failures:
// - raw secret values never appear in rendered output
// - DATABASE_URL never prints credentials or query params
// - trusted origins are rendered as a count plus stable list
// - missing values render as "missing" or "default (3000)"
```

- [ ] **Step 4: Commit the helper implementation**

```bash
git add src/lib/startup-report.ts src/lib/startup-report.test.ts
git commit -m "feat: add startup diagnostics report helper"
```

---

## Phase 3: Wire the helper into Next.js startup

### Task 3: Add the instrumentation hook

**Files:**

- Create: `src/instrumentation.ts`
- Modify: `.env.example`
- Reference: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md`

- [ ] **Step 1: Create the Next.js instrumentation entrypoint**

Add `src/instrumentation.ts` with:

```ts
import { logStartupReportOnce } from '@/lib/startup-report';

export function register() {
  logStartupReportOnce();
}
```

- [ ] **Step 2: Document the new env var in the example env file**

Update `.env.example` so the auth-related env block becomes:

```dotenv
DATABASE_URL=postgresql://cellar:cellar@localhost:5432/cellar
BETTER_AUTH_SECRET=  # REQUIRED: Generate with: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,https://cellar.example.com
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

- [ ] **Step 3: Run tests and lint for the touched files**

Run:

```bash
npm run test:run -- src/lib/startup-report.test.ts
npm run lint -- src/instrumentation.ts src/lib/startup-report.ts src/lib/startup-report.test.ts
```

Expected:

- Vitest passes
- ESLint completes without errors for the touched files

- [ ] **Step 4: Commit the startup hook**

```bash
git add src/instrumentation.ts .env.example src/lib/startup-report.ts src/lib/startup-report.test.ts
git commit -m "feat: log startup configuration via instrumentation"
```

---

## Phase 4: Verify behavior end-to-end

### Task 4: Confirm startup logging in the real app

**Files:**

- Reference: `package.json`
- Reference: `src/instrumentation.ts`
- Reference: `src/lib/startup-report.ts`

- [ ] **Step 1: Start the dev server and inspect startup output**

Run:

```bash
npm run dev
```

Expected startup output includes a single grouped block similar to:

```text
[cellar] Startup configuration
  Runtime
    NODE_ENV: development
    PORT: default (3000)
    E2E_TEST_MODE: false
  Database
    DATABASE_URL: postgresql host=localhost port=5432 db=cellar
  Auth
    BETTER_AUTH_URL: http://localhost:3000
    BETTER_AUTH_TRUSTED_ORIGINS: 2 origins [http://localhost:3000, https://cellar.example.com]
    BETTER_AUTH_SECRET: abcd...wxyz (length 44, sha256:1a2b3c4d)
    GITHUB_CLIENT_ID: [masked] (length 0, sha256:...) or missing
    GITHUB_CLIENT_SECRET: missing
  Uploads
    UPLOAD_DIR: ./uploads
    MAX_FILE_SIZE: 10485760
```

- [ ] **Step 2: Stop the dev server after confirming one startup block**

Stop with:

```bash
Ctrl+C
```

Expected: the report appeared once for that server instance and did not print duplicate blocks during initial boot.

- [ ] **Step 3: Run a production-style build check**

Run:

```bash
npm run build
```

Expected: Next.js build completes successfully with `src/instrumentation.ts` recognized and no type errors.

- [ ] **Step 4: Commit verification-only follow-up changes if any were needed**

If verification required code changes, commit them with:

```bash
git add src/instrumentation.ts src/lib/startup-report.ts src/lib/startup-report.test.ts .env.example
git commit -m "fix: polish startup diagnostics output"
```

If no code changes were needed, skip this commit.

---

## Self-Review

### Spec coverage

- Startup hook via `src/instrumentation.ts`: covered by Task 3
- Grouped `Runtime`, `Database`, `Auth`, `Uploads` report: covered by Tasks 1 and 2
- Masked secrets with preview, length, and fingerprint: covered by Tasks 1 and 2
- Safe database URL rendering: covered by Tasks 1 and 2
- Trusted origins summary: covered by Tasks 1 and 2
- Once-per-server-instance logging: covered by Tasks 1, 2, and 4
- Non-fatal handling for malformed values: covered by Tasks 1 and 2
- Real startup verification in the app: covered by Task 4

### Placeholder scan

- No `TODO`, `TBD`, or deferred implementation steps remain
- Each code step includes the exact file content or exact commands to run
- Verification commands are concrete and scoped to the touched files when possible

### Type consistency

- `createStartupReport`, `logStartupReportOnce`, `parseDatabaseUrl`, and `resetStartupReportStateForTests` are introduced in Task 1 and implemented in Task 2 with matching names
- `src/instrumentation.ts` imports `logStartupReportOnce` using the existing `@/` alias defined in `tsconfig.json`
