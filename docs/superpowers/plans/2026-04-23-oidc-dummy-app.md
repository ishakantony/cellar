# OIDC Dummy App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone `oidc-dummy-app` that redirects to Cellar for login, returns to a callback, establishes a local session, and renders a protected page with seamless reuse of an existing Cellar session.

**Architecture:** Keep Cellar as the OIDC provider and add one static first-party client entry for the dummy app. The dummy app is a separate Next.js 16 app with a minimal App Router UI, one login route, one callback route, one logout route, signed HTTP-only session cookies, and small helper modules for env parsing, PKCE, discovery, token exchange, and session verification.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Web Fetch API, Node `crypto`

---

## File Structure

**Root App Files**

- Modify: `.gitignore` - ignore nested dummy-app build artifacts and env files
- Modify: `docs/oidc-first-party-apps.md` - document the dummy app client secret and local startup flow
- Modify: `src/lib/oidc/first-party-clients.ts` - register the dummy app as a static first-party OIDC client
- Create: `src/lib/oidc/first-party-clients.test.ts` - cover the new manifest entry and origin resolution

**Dummy App Files**

- Create: `oidc-dummy-app/package.json` - standalone app scripts and dependencies
- Create: `oidc-dummy-app/tsconfig.json` - local TypeScript config
- Create: `oidc-dummy-app/next-env.d.ts` - Next type bootstrap
- Create: `oidc-dummy-app/eslint.config.mjs` - app-local ESLint config
- Create: `oidc-dummy-app/vitest.config.ts` - app-local Vitest config
- Create: `oidc-dummy-app/.env.example` - required local env vars
- Create: `oidc-dummy-app/README.md` - local setup and run steps
- Create: `oidc-dummy-app/app/layout.tsx` - shared layout shell
- Create: `oidc-dummy-app/app/globals.css` - minimal styling
- Create: `oidc-dummy-app/app/page.tsx` - landing page with login CTA and session state
- Create: `oidc-dummy-app/app/protected/page.tsx` - protected page that redirects when no local session exists
- Create: `oidc-dummy-app/app/login/route.ts` - PKCE setup and redirect to Cellar authorize
- Create: `oidc-dummy-app/app/login/route.test.ts` - verify redirect and transient cookies
- Create: `oidc-dummy-app/app/auth/callback/route.ts` - callback handler, code exchange, session creation
- Create: `oidc-dummy-app/app/auth/callback/route.test.ts` - verify callback success and error handling
- Create: `oidc-dummy-app/app/logout/route.ts` - clear local session
- Create: `oidc-dummy-app/src/lib/app-config.ts` - parse required env and derive callback URL
- Create: `oidc-dummy-app/src/lib/app-config.test.ts` - env parsing tests
- Create: `oidc-dummy-app/src/lib/oidc.ts` - PKCE, discovery fetch, authorize URL builder
- Create: `oidc-dummy-app/src/lib/oidc.test.ts` - PKCE and authorize URL tests
- Create: `oidc-dummy-app/src/lib/session.ts` - signed cookie helpers and cookie constants
- Create: `oidc-dummy-app/src/lib/session.test.ts` - signed session round-trip tests
- Create: `oidc-dummy-app/src/lib/callback.ts` - token exchange + userinfo fetch helper
- Create: `oidc-dummy-app/src/lib/callback.test.ts` - callback exchange tests

---

## Task 1: Register the Dummy App in Cellar

**Files:**

- Create: `src/lib/oidc/first-party-clients.test.ts`
- Modify: `src/lib/oidc/first-party-clients.ts`
- Modify: `.gitignore`
- Modify: `docs/oidc-first-party-apps.md`

- [ ] **Step 1: Write the failing manifest test**

Create `src/lib/oidc/first-party-clients.test.ts` with:

```typescript
import { describe, expect, it } from 'vitest';

import {
  firstPartyClients,
  getFirstPartyClientOrigins,
  resolveFirstPartyClients,
} from './first-party-clients';

describe('first-party OIDC clients', () => {
  it('includes the local oidc dummy app client', () => {
    const clients = resolveFirstPartyClients(
      {
        OIDC_DUMMY_APP_OIDC_SECRET: 'oidc-dummy-app-secret',
      },
      firstPartyClients
    );

    expect(clients).toContainEqual({
      clientId: 'oidc-dummy-app',
      name: 'OIDC Dummy App',
      type: 'web',
      redirectUrls: ['http://localhost:3001/auth/callback'],
      clientSecret: 'oidc-dummy-app-secret',
      skipConsent: true,
      disabled: false,
      metadata: {
        firstParty: true,
      },
    });

    expect(getFirstPartyClientOrigins(firstPartyClients)).toContain('http://localhost:3001');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test:run -- src/lib/oidc/first-party-clients.test.ts
```

Expected: FAIL because `firstPartyClients` does not yet include `oidc-dummy-app`

- [ ] **Step 3: Add the dummy app manifest entry**

Update `src/lib/oidc/first-party-clients.ts` to:

```typescript
export const firstPartyClients: FirstPartyClientManifestEntry[] = [
  {
    clientId: 'oidc-dummy-app',
    name: 'OIDC Dummy App',
    type: 'web',
    redirectUrls: ['http://localhost:3001/auth/callback'],
    secretEnvVar: 'OIDC_DUMMY_APP_OIDC_SECRET',
    skipConsent: true,
  },
];
```

- [ ] **Step 4: Re-run the test to verify it passes**

Run:

```bash
npm run test:run -- src/lib/oidc/first-party-clients.test.ts
```

Expected: PASS

- [ ] **Step 5: Ignore the nested dummy-app artifacts**

Append these lines to `.gitignore`:

```gitignore
/oidc-dummy-app/node_modules
/oidc-dummy-app/.next
/oidc-dummy-app/.env*
!/oidc-dummy-app/.env.example
```

- [ ] **Step 6: Document the dummy app bootstrap flow**

Add this section to `docs/oidc-first-party-apps.md`:

```md
## Local OIDC Dummy App

Cellar includes a static first-party client for the local test app:

- `clientId`: `oidc-dummy-app`
- `redirect_uri`: `http://localhost:3001/auth/callback`
- `secret env var`: `OIDC_DUMMY_APP_OIDC_SECRET`

Local bootstrap flow:

1. Set `OIDC_DUMMY_APP_OIDC_SECRET` in the Cellar root `.env`.
2. Run `npm run auth:sync-clients`.
3. Start Cellar on `http://localhost:3000`.
4. Start `oidc-dummy-app` on `http://localhost:3001`.
5. Use the dummy app landing page to exercise the authorization-code + PKCE flow.
```

- [ ] **Step 7: Commit the root registration change**

```bash
git add .gitignore docs/oidc-first-party-apps.md src/lib/oidc/first-party-clients.ts src/lib/oidc/first-party-clients.test.ts
git commit -m "feat: register local oidc dummy app client"
```

---

## Task 2: Scaffold the Standalone Dummy App

**Files:**

- Create: `oidc-dummy-app/package.json`
- Create: `oidc-dummy-app/tsconfig.json`
- Create: `oidc-dummy-app/next-env.d.ts`
- Create: `oidc-dummy-app/eslint.config.mjs`
- Create: `oidc-dummy-app/vitest.config.ts`
- Create: `oidc-dummy-app/.env.example`
- Create: `oidc-dummy-app/README.md`

- [ ] **Step 1: Create the dummy app package manifest**

Create `oidc-dummy-app/package.json` with:

```json
{
  "name": "oidc-dummy-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "lint": "eslint .",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "16.2.3",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.3",
    "typescript": "^5",
    "vitest": "^4.1.4"
  }
}
```

- [ ] **Step 2: Add TypeScript, ESLint, and Vitest config**

Create `oidc-dummy-app/tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `oidc-dummy-app/next-env.d.ts` with:

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// This file is auto-generated by Next.js.
```

Create `oidc-dummy-app/eslint.config.mjs` with:

```javascript
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([...nextVitals, ...nextTs, globalIgnores(['.next/**', 'coverage/**'])]);
```

Create `oidc-dummy-app/vitest.config.ts` with:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 3: Add the local env example**

Create `oidc-dummy-app/.env.example` with:

```dotenv
DUMMY_APP_BASE_URL=http://localhost:3001
CELLAR_DISCOVERY_URL=http://localhost:3000/api/auth/.well-known/openid-configuration
OIDC_DUMMY_APP_CLIENT_ID=oidc-dummy-app
OIDC_DUMMY_APP_CLIENT_SECRET=replace-me
DUMMY_APP_SESSION_SECRET=replace-with-a-long-random-string
```

- [ ] **Step 4: Add a local runbook**

Create `oidc-dummy-app/README.md` with:

```md
# OIDC Dummy App

This is a local-only relying-party app used to test Cellar as an OIDC provider.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `OIDC_DUMMY_APP_CLIENT_SECRET` to match Cellar's `OIDC_DUMMY_APP_OIDC_SECRET`.
3. Ensure Cellar is running on `http://localhost:3000`.
4. Start this app with `npm run dev`.

## Flow

- `/` shows the login entry point
- `/login` redirects to Cellar authorize with PKCE
- `/auth/callback` exchanges the code and creates a local session
- `/protected` shows the authenticated page
- `/logout` clears only the dummy-app session
```

- [ ] **Step 5: Install the dummy app dependencies**

Run:

```bash
cd oidc-dummy-app && npm install
```

Expected: `added ... packages` and a new `oidc-dummy-app/package-lock.json`

- [ ] **Step 6: Commit the standalone scaffold**

```bash
git add oidc-dummy-app/package.json oidc-dummy-app/package-lock.json oidc-dummy-app/tsconfig.json oidc-dummy-app/next-env.d.ts oidc-dummy-app/eslint.config.mjs oidc-dummy-app/vitest.config.ts oidc-dummy-app/.env.example oidc-dummy-app/README.md
git commit -m "chore: scaffold standalone oidc dummy app"
```

---

## Task 3: Add Env Parsing and OIDC Helper Logic

**Files:**

- Create: `oidc-dummy-app/src/lib/app-config.test.ts`
- Create: `oidc-dummy-app/src/lib/app-config.ts`
- Create: `oidc-dummy-app/src/lib/oidc.test.ts`
- Create: `oidc-dummy-app/src/lib/oidc.ts`

- [ ] **Step 1: Write the failing env parsing test**

Create `oidc-dummy-app/src/lib/app-config.test.ts` with:

```typescript
import { describe, expect, it } from 'vitest';

import { readAppConfig } from './app-config';

describe('readAppConfig', () => {
  it('derives the callback URL from the base URL', () => {
    const config = readAppConfig({
      DUMMY_APP_BASE_URL: 'http://localhost:3001',
      CELLAR_DISCOVERY_URL: 'http://localhost:3000/api/auth/.well-known/openid-configuration',
      OIDC_DUMMY_APP_CLIENT_ID: 'oidc-dummy-app',
      OIDC_DUMMY_APP_CLIENT_SECRET: 'top-secret',
      DUMMY_APP_SESSION_SECRET: 'session-secret',
    });

    expect(config.callbackUrl).toBe('http://localhost:3001/auth/callback');
    expect(config.clientId).toBe('oidc-dummy-app');
  });

  it('throws when a required env var is missing', () => {
    expect(() =>
      readAppConfig({
        DUMMY_APP_BASE_URL: 'http://localhost:3001',
      })
    ).toThrow('Missing required env var CELLAR_DISCOVERY_URL');
  });
});
```

- [ ] **Step 2: Run the env test to verify it fails**

Run:

```bash
cd oidc-dummy-app && npm test -- src/lib/app-config.test.ts
```

Expected: FAIL because `readAppConfig` does not exist yet

- [ ] **Step 3: Implement the env helper**

Create `oidc-dummy-app/src/lib/app-config.ts` with:

```typescript
export type AppConfig = {
  appBaseUrl: string;
  callbackUrl: string;
  discoveryUrl: string;
  clientId: string;
  clientSecret: string;
  sessionSecret: string;
};

function requireEnv(env: Record<string, string | undefined>, name: string) {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }

  return value;
}

export function readAppConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const appBaseUrl = requireEnv(env, 'DUMMY_APP_BASE_URL').replace(/\/+$/, '');

  return {
    appBaseUrl,
    callbackUrl: `${appBaseUrl}/auth/callback`,
    discoveryUrl: requireEnv(env, 'CELLAR_DISCOVERY_URL'),
    clientId: requireEnv(env, 'OIDC_DUMMY_APP_CLIENT_ID'),
    clientSecret: requireEnv(env, 'OIDC_DUMMY_APP_CLIENT_SECRET'),
    sessionSecret: requireEnv(env, 'DUMMY_APP_SESSION_SECRET'),
  };
}
```

- [ ] **Step 4: Re-run the env test to verify it passes**

Run:

```bash
cd oidc-dummy-app && npm test -- src/lib/app-config.test.ts
```

Expected: PASS

- [ ] **Step 5: Write the failing PKCE and authorize URL tests**

Create `oidc-dummy-app/src/lib/oidc.test.ts` with:

```typescript
import { describe, expect, it } from 'vitest';

import { buildAuthorizeUrl, createCodeChallenge } from './oidc';

describe('oidc helpers', () => {
  it('derives the RFC7636 S256 challenge', () => {
    expect(createCodeChallenge('cellar-test-code-verifier-123456789')).toBe(
      'lLQSQ5RneMtjcj-h7cbXv1cqLh6VmQxyPvx1OW0TizA'
    );
  });

  it('builds the authorize URL with PKCE and state', () => {
    const url = buildAuthorizeUrl({
      authorizationEndpoint: 'http://localhost:3000/api/auth/oauth2/authorize',
      clientId: 'oidc-dummy-app',
      redirectUri: 'http://localhost:3001/auth/callback',
      state: 'test-state',
      codeChallenge: 'test-challenge',
    });

    expect(url).toBe(
      'http://localhost:3000/api/auth/oauth2/authorize?client_id=oidc-dummy-app&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fcallback&response_type=code&scope=openid+profile+email&state=test-state&code_challenge=test-challenge&code_challenge_method=S256'
    );
  });
});
```

- [ ] **Step 6: Run the helper tests to verify they fail**

Run:

```bash
cd oidc-dummy-app && npm test -- src/lib/oidc.test.ts
```

Expected: FAIL because `createCodeChallenge` and `buildAuthorizeUrl` do not exist yet

- [ ] **Step 7: Implement the OIDC helpers**

Create `oidc-dummy-app/src/lib/oidc.ts` with:

```typescript
import { createHash, randomBytes } from 'node:crypto';

export type OidcDiscoveryDocument = {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
};

export function createRandomValue(size = 32) {
  return randomBytes(size).toString('base64url');
}

export function createCodeChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url');
}

export function createPkcePair() {
  const verifier = createRandomValue(32);
  return {
    verifier,
    challenge: createCodeChallenge(verifier),
  };
}

export async function fetchDiscovery(discoveryUrl: string, fetchImpl: typeof fetch = fetch) {
  const response = await fetchImpl(discoveryUrl, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`OIDC discovery failed with status ${response.status}`);
  }

  return (await response.json()) as OidcDiscoveryDocument;
}

export function buildAuthorizeUrl(input: {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}) {
  const url = new URL(input.authorizationEndpoint);
  url.searchParams.set('client_id', input.clientId);
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('state', input.state);
  url.searchParams.set('code_challenge', input.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}
```

- [ ] **Step 8: Re-run the helper tests to verify they pass**

Run:

```bash
cd oidc-dummy-app && npm test -- src/lib/app-config.test.ts src/lib/oidc.test.ts
```

Expected: PASS

- [ ] **Step 9: Commit the helper layer**

```bash
git add oidc-dummy-app/src/lib/app-config.ts oidc-dummy-app/src/lib/app-config.test.ts oidc-dummy-app/src/lib/oidc.ts oidc-dummy-app/src/lib/oidc.test.ts
git commit -m "feat: add oidc dummy app config and pkce helpers"
```

---

## Task 4: Add Signed Session and Callback Exchange Helpers

**Files:**

- Create: `oidc-dummy-app/src/lib/session.test.ts`
- Create: `oidc-dummy-app/src/lib/session.ts`
- Create: `oidc-dummy-app/src/lib/callback.test.ts`
- Create: `oidc-dummy-app/src/lib/callback.ts`

- [ ] **Step 1: Write the failing signed-session tests**

Create `oidc-dummy-app/src/lib/session.test.ts` with:

```typescript
import { describe, expect, it } from 'vitest';

import { decodeSession, encodeSession } from './session';

describe('session helpers', () => {
  it('round-trips a signed dummy app session', () => {
    const raw = encodeSession(
      {
        sub: 'user-123',
        email: 'oidc@example.com',
        name: 'OIDC Test User',
        accessToken: 'access-token',
      },
      'session-secret'
    );

    expect(decodeSession(raw, 'session-secret')).toEqual({
      sub: 'user-123',
      email: 'oidc@example.com',
      name: 'OIDC Test User',
      accessToken: 'access-token',
    });
  });

  it('rejects a tampered session payload', () => {
    const raw = encodeSession(
      {
        sub: 'user-123',
        accessToken: 'access-token',
      },
      'session-secret'
    );

    expect(decodeSession(`${raw}tampered`, 'session-secret')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the signed-session tests to verify they fail**

Run:

```bash
cd oidc-dummy-app && npm test -- src/lib/session.test.ts
```

Expected: FAIL because `encodeSession` and `decodeSession` do not exist yet

- [ ] **Step 3: Implement the session helper**

Create `oidc-dummy-app/src/lib/session.ts` with:

```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'oidc_dummy_session';
export const STATE_COOKIE_NAME = 'oidc_dummy_state';
export const VERIFIER_COOKIE_NAME = 'oidc_dummy_verifier';

export type DummySession = {
  sub: string;
  email?: string;
  name?: string;
  accessToken: string;
  idToken?: string;
};

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function encodeSession(session: DummySession, secret: string) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function decodeSession(raw: string | undefined, secret: string): DummySession | null {
  if (!raw) {
    return null;
  }

  const [payload, signature] = raw.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload, secret);

  if (expected.length !== signature.length) {
    return null;
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as DummySession;
}
```

- [ ] **Step 4: Re-run the signed-session tests to verify they pass**

Run:

```bash
cd oidc-dummy-app && npm test -- src/lib/session.test.ts
```

Expected: PASS

- [ ] **Step 5: Write the failing callback-exchange tests**

Create `oidc-dummy-app/src/lib/callback.test.ts` with:

```typescript
import { describe, expect, it, vi } from 'vitest';

import { completeAuthorizationCodeFlow } from './callback';

describe('completeAuthorizationCodeFlow', () => {
  it('exchanges the code, fetches userinfo, and returns a local session', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            authorization_endpoint: 'http://localhost:3000/api/auth/oauth2/authorize',
            token_endpoint: 'http://localhost:3000/api/auth/oauth2/token',
            userinfo_endpoint: 'http://localhost:3000/api/auth/oauth2/userinfo',
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'access-token',
            id_token: 'id-token',
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sub: 'user-123',
            email: 'oidc@example.com',
            name: 'OIDC Test User',
          }),
          { status: 200 }
        )
      );

    const session = await completeAuthorizationCodeFlow({
      code: 'test-code',
      returnedState: 'expected-state',
      storedState: 'expected-state',
      codeVerifier: 'verifier',
      config: {
        appBaseUrl: 'http://localhost:3001',
        callbackUrl: 'http://localhost:3001/auth/callback',
        discoveryUrl: 'http://localhost:3000/api/auth/.well-known/openid-configuration',
        clientId: 'oidc-dummy-app',
        clientSecret: 'client-secret',
        sessionSecret: 'session-secret',
      },
      fetchImpl: fetchMock,
    });

    expect(session).toEqual({
      sub: 'user-123',
      email: 'oidc@example.com',
      name: 'OIDC Test User',
      accessToken: 'access-token',
      idToken: 'id-token',
    });
  });

  it('rejects a mismatched callback state', async () => {
    await expect(
      completeAuthorizationCodeFlow({
        code: 'test-code',
        returnedState: 'unexpected-state',
        storedState: 'expected-state',
        codeVerifier: 'verifier',
        config: {
          appBaseUrl: 'http://localhost:3001',
          callbackUrl: 'http://localhost:3001/auth/callback',
          discoveryUrl: 'http://localhost:3000/api/auth/.well-known/openid-configuration',
          clientId: 'oidc-dummy-app',
          clientSecret: 'client-secret',
          sessionSecret: 'session-secret',
        },
        fetchImpl: vi.fn(),
      })
    ).rejects.toThrow('State mismatch');
  });
});
```

- [ ] **Step 6: Run the callback tests to verify they fail**

Run:

```bash
cd oidc-dummy-app && npm test -- src/lib/callback.test.ts
```

Expected: FAIL because `completeAuthorizationCodeFlow` does not exist yet

- [ ] **Step 7: Implement the callback helper**

Create `oidc-dummy-app/src/lib/callback.ts` with:

```typescript
import type { AppConfig } from './app-config';
import { fetchDiscovery } from './oidc';
import type { DummySession } from './session';

type CallbackInput = {
  code: string;
  returnedState: string | null;
  storedState: string | undefined;
  codeVerifier: string | undefined;
  config: AppConfig;
  fetchImpl?: typeof fetch;
};

export async function completeAuthorizationCodeFlow({
  code,
  returnedState,
  storedState,
  codeVerifier,
  config,
  fetchImpl = fetch,
}: CallbackInput): Promise<DummySession> {
  if (!returnedState || !storedState || returnedState !== storedState) {
    throw new Error('State mismatch');
  }

  if (!codeVerifier) {
    throw new Error('Missing PKCE verifier');
  }

  const discovery = await fetchDiscovery(config.discoveryUrl, fetchImpl);

  const tokenResponse = await fetchImpl(discovery.token_endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.callbackUrl,
      code_verifier: codeVerifier,
    }),
    cache: 'no-store',
  });

  if (!tokenResponse.ok) {
    throw new Error(`Token exchange failed with status ${tokenResponse.status}`);
  }

  const tokenSet = (await tokenResponse.json()) as {
    access_token: string;
    id_token?: string;
  };

  const userinfoResponse = await fetchImpl(discovery.userinfo_endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenSet.access_token}`,
    },
    cache: 'no-store',
  });

  if (!userinfoResponse.ok) {
    throw new Error(`Userinfo failed with status ${userinfoResponse.status}`);
  }

  const userinfo = (await userinfoResponse.json()) as {
    sub: string;
    email?: string;
    name?: string;
  };

  return {
    sub: userinfo.sub,
    email: userinfo.email,
    name: userinfo.name,
    accessToken: tokenSet.access_token,
    idToken: tokenSet.id_token,
  };
}
```

- [ ] **Step 8: Re-run the callback and session tests to verify they pass**

Run:

```bash
cd oidc-dummy-app && npm test -- src/lib/session.test.ts src/lib/callback.test.ts
```

Expected: PASS

- [ ] **Step 9: Commit the signed-session and callback helpers**

```bash
git add oidc-dummy-app/src/lib/session.ts oidc-dummy-app/src/lib/session.test.ts oidc-dummy-app/src/lib/callback.ts oidc-dummy-app/src/lib/callback.test.ts
git commit -m "feat: add oidc dummy app callback and session helpers"
```

---

## Task 5: Wire the Login, Callback, Protected, and Logout Routes

**Files:**

- Create: `oidc-dummy-app/app/login/route.test.ts`
- Create: `oidc-dummy-app/app/login/route.ts`
- Create: `oidc-dummy-app/app/auth/callback/route.test.ts`
- Create: `oidc-dummy-app/app/auth/callback/route.ts`
- Create: `oidc-dummy-app/app/logout/route.ts`
- Create: `oidc-dummy-app/app/layout.tsx`
- Create: `oidc-dummy-app/app/globals.css`
- Create: `oidc-dummy-app/app/page.tsx`
- Create: `oidc-dummy-app/app/protected/page.tsx`

- [ ] **Step 1: Write the failing login-route test**

Create `oidc-dummy-app/app/login/route.test.ts` with:

```typescript
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/app-config', () => ({
  readAppConfig: () => ({
    appBaseUrl: 'http://localhost:3001',
    callbackUrl: 'http://localhost:3001/auth/callback',
    discoveryUrl: 'http://localhost:3000/api/auth/.well-known/openid-configuration',
    clientId: 'oidc-dummy-app',
    clientSecret: 'client-secret',
    sessionSecret: 'session-secret',
  }),
}));

vi.mock('@/lib/oidc', () => ({
  buildAuthorizeUrl: () =>
    'http://localhost:3000/api/auth/oauth2/authorize?client_id=oidc-dummy-app',
  createPkcePair: () => ({
    verifier: 'test-verifier',
    challenge: 'test-challenge',
  }),
  createRandomValue: () => 'test-state',
  fetchDiscovery: vi.fn().mockResolvedValue({
    authorization_endpoint: 'http://localhost:3000/api/auth/oauth2/authorize',
    token_endpoint: 'http://localhost:3000/api/auth/oauth2/token',
    userinfo_endpoint: 'http://localhost:3000/api/auth/oauth2/userinfo',
  }),
}));

import { GET } from './route';

describe('GET /login', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to Cellar and stores transient state cookies', async () => {
    const response = await GET(new Request('http://localhost:3001/login'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain(
      'http://localhost:3000/api/auth/oauth2/authorize'
    );

    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('oidc_dummy_state=test-state');
    expect(setCookie).toContain('oidc_dummy_verifier=test-verifier');
  });
});
```

- [ ] **Step 2: Run the login-route test to verify it fails**

Run:

```bash
cd oidc-dummy-app && npm test -- app/login/route.test.ts
```

Expected: FAIL because `app/login/route.ts` does not exist yet

- [ ] **Step 3: Implement the login route**

Create `oidc-dummy-app/app/login/route.ts` with:

```typescript
import { NextResponse } from 'next/server';

import { readAppConfig } from '@/lib/app-config';
import { buildAuthorizeUrl, createPkcePair, createRandomValue, fetchDiscovery } from '@/lib/oidc';
import { STATE_COOKIE_NAME, VERIFIER_COOKIE_NAME } from '@/lib/session';

export async function GET(request: Request) {
  const config = readAppConfig();
  const discovery = await fetchDiscovery(config.discoveryUrl);
  const { verifier, challenge } = createPkcePair();
  const state = createRandomValue(16);

  const response = NextResponse.redirect(
    buildAuthorizeUrl({
      authorizationEndpoint: discovery.authorization_endpoint,
      clientId: config.clientId,
      redirectUri: config.callbackUrl,
      state,
      codeChallenge: challenge,
    })
  );

  const secure = new URL(request.url).protocol === 'https:';

  response.cookies.set({
    name: STATE_COOKIE_NAME,
    value: state,
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 600,
  });
  response.cookies.set({
    name: VERIFIER_COOKIE_NAME,
    value: verifier,
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 600,
  });

  return response;
}
```

- [ ] **Step 4: Re-run the login-route test to verify it passes**

Run:

```bash
cd oidc-dummy-app && npm test -- app/login/route.test.ts
```

Expected: PASS

- [ ] **Step 5: Write the failing callback-route test**

Create `oidc-dummy-app/app/auth/callback/route.test.ts` with:

```typescript
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/app-config', () => ({
  readAppConfig: () => ({
    appBaseUrl: 'http://localhost:3001',
    callbackUrl: 'http://localhost:3001/auth/callback',
    discoveryUrl: 'http://localhost:3000/api/auth/.well-known/openid-configuration',
    clientId: 'oidc-dummy-app',
    clientSecret: 'client-secret',
    sessionSecret: 'session-secret',
  }),
}));

vi.mock('@/lib/callback', () => ({
  completeAuthorizationCodeFlow: vi.fn().mockResolvedValue({
    sub: 'user-123',
    email: 'oidc@example.com',
    name: 'OIDC Test User',
    accessToken: 'access-token',
  }),
}));

import { GET } from './route';

describe('GET /auth/callback', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a local session and redirects to /protected', async () => {
    const response = await GET(
      new Request('http://localhost:3001/auth/callback?code=test-code&state=test-state', {
        headers: {
          cookie: 'oidc_dummy_state=test-state; oidc_dummy_verifier=test-verifier',
        },
      })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3001/protected');

    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('oidc_dummy_session=');
    expect(setCookie).toContain('oidc_dummy_state=;');
    expect(setCookie).toContain('oidc_dummy_verifier=;');
  });
});
```

- [ ] **Step 6: Run the callback-route test to verify it fails**

Run:

```bash
cd oidc-dummy-app && npm test -- app/auth/callback/route.test.ts
```

Expected: FAIL because `app/auth/callback/route.ts` does not exist yet

- [ ] **Step 7: Implement the callback, logout, and page files**

Create `oidc-dummy-app/app/auth/callback/route.ts` with:

```typescript
import { NextResponse } from 'next/server';

import { readAppConfig } from '@/lib/app-config';
import { completeAuthorizationCodeFlow } from '@/lib/callback';
import {
  encodeSession,
  SESSION_COOKIE_NAME,
  STATE_COOKIE_NAME,
  VERIFIER_COOKIE_NAME,
} from '@/lib/session';

export async function GET(request: Request) {
  const config = readAppConfig();
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return new NextResponse('Missing code', { status: 400 });
  }

  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map(cookie => cookie.trim())
      .filter(Boolean)
      .map(cookie => {
        const [name, ...value] = cookie.split('=');
        return [name, value.join('=')];
      })
  );

  const session = await completeAuthorizationCodeFlow({
    code,
    returnedState: state,
    storedState: cookies[STATE_COOKIE_NAME],
    codeVerifier: cookies[VERIFIER_COOKIE_NAME],
    config,
  });

  const response = NextResponse.redirect(new URL('/protected', request.url));
  const secure = url.protocol === 'https:';

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: encodeSession(session, config.sessionSecret),
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 3600,
  });
  response.cookies.set({
    name: STATE_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 0,
  });
  response.cookies.set({
    name: VERIFIER_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 0,
  });

  return response;
}
```

Create `oidc-dummy-app/app/logout/route.ts` with:

```typescript
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME } from '@/lib/session';

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url));
  const secure = new URL(request.url).protocol === 'https:';

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 0,
  });

  return response;
}
```

Create `oidc-dummy-app/app/layout.tsx` with:

```tsx
import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'OIDC Dummy App',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Create `oidc-dummy-app/app/globals.css` with:

```css
:root {
  color-scheme: light;
  font-family: Helvetica, Arial, sans-serif;
}

body {
  margin: 0;
  background: #f5f1e8;
  color: #1f1a17;
}

main {
  max-width: 720px;
  margin: 0 auto;
  padding: 64px 24px;
}

.card {
  background: #fffdfa;
  border: 1px solid #d8cfc0;
  border-radius: 16px;
  padding: 24px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.button {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 999px;
  background: #1f1a17;
  color: #fffdfa;
  text-decoration: none;
}

.button.secondary {
  background: #e9dfcf;
  color: #1f1a17;
}
```

Create `oidc-dummy-app/app/page.tsx` with:

```tsx
import { cookies } from 'next/headers';

import { readAppConfig } from '@/lib/app-config';
import { decodeSession, SESSION_COOKIE_NAME } from '@/lib/session';

export default async function HomePage() {
  const config = readAppConfig();
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value, config.sessionSecret);

  return (
    <main>
      <div className="card">
        <p>Local test app for Cellar as an OpenID Connect provider.</p>
        <h1>OIDC Dummy App</h1>
        <p>
          Click login to start an authorization-code + PKCE flow against Cellar. If you already have
          a Cellar session, the round-trip should complete without another login prompt.
        </p>
        <div className="actions">
          <a className="button" href="/login">
            Login with Cellar
          </a>
          {session ? (
            <>
              <a className="button secondary" href="/protected">
                Go to protected page
              </a>
              <a className="button secondary" href="/logout">
                Clear local session
              </a>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
```

Create `oidc-dummy-app/app/protected/page.tsx` with:

```tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { readAppConfig } from '@/lib/app-config';
import { decodeSession, SESSION_COOKIE_NAME } from '@/lib/session';

export default async function ProtectedPage() {
  const config = readAppConfig();
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value, config.sessionSecret);

  if (!session) {
    redirect('/');
  }

  return (
    <main>
      <div className="card">
        <p>Authenticated with Cellar</p>
        <h1>Protected Page</h1>
        <p>
          <strong>sub:</strong> {session.sub}
        </p>
        <p>
          <strong>email:</strong> {session.email ?? 'n/a'}
        </p>
        <p>
          <strong>name:</strong> {session.name ?? 'n/a'}
        </p>
        <div className="actions">
          <a className="button secondary" href="/">
            Back home
          </a>
          <a className="button secondary" href="/logout">
            Logout
          </a>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 8: Re-run the route tests to verify they pass**

Run:

```bash
cd oidc-dummy-app && npm test -- app/login/route.test.ts app/auth/callback/route.test.ts
```

Expected: PASS

- [ ] **Step 9: Run lint, unit tests, and build for the dummy app**

Run:

```bash
cd oidc-dummy-app && npm run lint && npm test && npm run build
```

Expected:

- `eslint` exits successfully
- all `vitest` tests pass
- `next build` completes successfully

- [ ] **Step 10: Commit the working dummy app**

```bash
git add oidc-dummy-app/app oidc-dummy-app/src oidc-dummy-app/package.json oidc-dummy-app/package-lock.json oidc-dummy-app/tsconfig.json oidc-dummy-app/next-env.d.ts oidc-dummy-app/eslint.config.mjs oidc-dummy-app/vitest.config.ts oidc-dummy-app/.env.example oidc-dummy-app/README.md
git commit -m "feat: add standalone oidc dummy app"
```

---

## Task 6: Verify the End-to-End Local Flow

**Files:**

- Modify: `oidc-dummy-app/README.md`

- [ ] **Step 1: Add the exact manual verification checklist**

Append this section to `oidc-dummy-app/README.md`:

```md
## Manual Verification

1. In the Cellar root app, set `OIDC_DUMMY_APP_OIDC_SECRET` in `.env`.
2. Run `npm run auth:sync-clients` from the Cellar root.
3. Start Cellar with `npm run dev`.
4. In `oidc-dummy-app`, copy `.env.example` to `.env.local` and set the same client secret value.
5. Start the dummy app with `npm run dev`.
6. Open `http://localhost:3001`.
7. Click `Login with Cellar`.
8. Confirm you land on `http://localhost:3001/protected`.
9. Click `Logout`.
10. Open `/protected` directly and confirm it redirects to `/`.
11. Click `Login with Cellar` again while still signed into Cellar and confirm the redirect completes without a second login prompt.
```

- [ ] **Step 2: Re-run the final checks**

Run:

```bash
npm run test:run -- src/lib/oidc/first-party-clients.test.ts
cd oidc-dummy-app && npm run lint && npm test && npm run build
```

Expected: all checks pass before manual browser verification starts

- [ ] **Step 3: Commit the verification notes**

```bash
git add oidc-dummy-app/README.md
git commit -m "docs: add oidc dummy app verification steps"
```

---

## Self-Review

- Spec coverage:
  - standalone app under `oidc-dummy-app/` is covered in Tasks 2-5
  - Cellar first-party client registration is covered in Task 1
  - auth-code + PKCE flow is covered in Tasks 3-5
  - protected page and seamless login expectation are covered in Tasks 5-6
  - `.gitignore` update is covered in Task 1
- Placeholder scan:
  - no `TODO`, `TBD`, or hand-wavy "add appropriate" steps remain
- Type consistency:
  - `readAppConfig`, `createPkcePair`, `completeAuthorizationCodeFlow`, `encodeSession`, and the cookie constant names are used consistently across tasks
