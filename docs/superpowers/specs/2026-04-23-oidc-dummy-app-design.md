# OIDC Dummy App Design Spec

**Date:** 2026-04-23
**Author:** OpenCode AI Agent
**Status:** Draft

---

## 1. Overview

Add a standalone testing app under `oidc-dummy-app/` that uses Cellar as its OpenID Connect provider. The app should exercise the primary authorization-code flow with PKCE: start unauthenticated, redirect to Cellar for login, return to the dummy app callback, establish a local session in the dummy app, and render a protected page.

If the browser already has a valid Cellar session, the login round-trip should complete without prompting the user again. The dummy app is strictly for local testing and manual verification, not for production deployment.

### 1.1 Goals

- Create a separate app in `oidc-dummy-app/` with its own dev server and dependencies
- Keep the implementation as small and explicit as possible for local testing
- Exercise Cellar's existing first-party OIDC support through the browser
- Support the authorization code flow with PKCE and state validation
- Show a protected page after the dummy app finishes the callback and establishes its own session
- Make re-login seamless when the user is already authenticated in Cellar
- Ignore the dummy app's generated files and local env file in the repo root `.gitignore`

### 1.2 Non-Goals

- Building a production-ready relying party with refresh token management
- Adding dynamic client registration support
- Sharing Cellar cookies directly with the dummy app
- Implementing RP-initiated logout against Cellar in the first version
- Introducing a full OIDC client library when a manual flow is sufficient

---

## 2. Selected Approach

### 2.1 Recommended Architecture

Build a tiny standalone Next.js app in `oidc-dummy-app/` that manually performs the authorization-code flow with PKCE using route handlers, HTTP-only cookies, and the global `fetch` API.

This is the preferred approach because:

- it keeps the testing surface small and easy to inspect
- it avoids extra abstractions from an OIDC client library
- it mirrors the real browser redirect flow against Cellar's discovery, authorize, token, and userinfo endpoints
- it fits the repo's existing Next.js tooling while still behaving as a separate client app

### 2.2 Rejected Alternatives

**Use an OIDC client library**

- Pros: less protocol code in the dummy app
- Cons: more dependencies, more framework-specific setup, less transparent for debugging

**Simulate the client inside the main Cellar app**

- Pros: fewer packages and no separate dev server
- Cons: weaker separation between provider and relying party, less confidence that cross-origin redirects and callback handling work correctly

**Use Express or another non-Next server**

- Pros: can be very small
- Cons: less aligned with the repo's current JavaScript tooling and UI patterns

---

## 3. Design

### 3.1 New and Updated Areas

Add or update the following areas:

- `oidc-dummy-app/`
- `src/lib/oidc/first-party-clients.ts`
- `.gitignore`
- root documentation describing how to run the dummy app and register its client secret

### 3.2 Dummy App Responsibilities

The standalone app should contain only the pieces needed to verify the core flow:

**Landing page**

- renders a short explanation of the test app
- shows a `Login with Cellar` action when no local dummy-app session exists
- optionally shows a `Go to protected page` action when the local session already exists

**Login route**

- generates a random `state` value
- generates a PKCE code verifier and S256 code challenge
- stores the verifier and state in an HTTP-only short-lived cookie scoped to the dummy app
- redirects the browser to Cellar's authorization endpoint with:
  - `client_id`
  - `redirect_uri`
  - `response_type=code`
  - `scope=openid profile email`
  - `state`
  - `code_challenge`
  - `code_challenge_method=S256`

**Callback route**

- validates the returned `state` against the cookie value
- rejects missing or mismatched state values
- exchanges the authorization code at Cellar's token endpoint using the dummy app client credentials and stored PKCE verifier
- fetches the current user profile from Cellar's userinfo endpoint
- stores a compact local session cookie in the dummy app containing only the fields needed to render the protected page
- clears the temporary PKCE/state cookie
- redirects to `/protected`

**Protected page**

- requires the dummy app session cookie
- redirects to `/` when the session is missing
- displays a simple authenticated view with basic claims from the userinfo response such as `sub`, `email`, and `name`

**Local logout route**

- clears only the dummy app's session cookie
- redirects back to `/`

### 3.3 Cellar Registration Changes

Cellar already supports first-party OIDC clients through `src/lib/oidc/first-party-clients.ts`. Add a manifest entry for the dummy app with:

- a stable `clientId`
- a local callback URL under the dummy app dev server origin
- a secret env var name dedicated to the dummy app
- `skipConsent: true`
- `type: 'web'`

This keeps the dummy app aligned with the existing `npm run auth:sync-clients` bootstrap flow.

### 3.4 Minimal Session Model

The dummy app should not persist data to a database. It should keep session state in signed or opaque HTTP-only cookies owned by the dummy app itself.

For the first version, the session contents can be minimal:

- `access_token` for optional debugging or userinfo refresh during the active browser session
- `id_token` only if convenient for debugging
- a small serialized user object used by the protected page

The dummy app should not implement refresh token rotation or long-lived session management.

### 3.5 Environment Model

The dummy app should use a local env file with only the values required to talk to Cellar:

- dummy app base URL
- Cellar issuer or discovery URL
- dummy app client ID
- dummy app client secret
- cookie secret for signing or encrypting local session state if needed

The root Cellar app should require one additional env var for the dummy client secret referenced by the first-party client manifest.

---

## 4. Data Flow

### 4.1 First Login

1. User opens the dummy app landing page.
2. User clicks `Login with Cellar`.
3. Dummy app creates PKCE verifier + challenge and a `state` value, stores them in a temporary cookie, and redirects to Cellar authorize.
4. Cellar authenticates the user or reuses the existing Cellar session.
5. Cellar redirects back to the dummy app callback with `code` and `state`.
6. Dummy app validates `state`, exchanges `code` for tokens, fetches userinfo, sets its own session cookie, and redirects to `/protected`.
7. Protected page renders the authenticated content.

### 4.2 Seamless Login When Already Authenticated in Cellar

The dummy app login route is unchanged. The seamless behavior comes from Cellar:

- if the browser already has a valid Cellar session cookie, Cellar should immediately complete the authorize request
- the user should experience only a redirect round-trip before landing on the protected page

No special client-side silent-auth iframe behavior is required for this test app.

### 4.3 Unauthenticated Access to the Protected Page

1. User opens `/protected` without a dummy-app session.
2. Dummy app redirects the user back to `/`.
3. The landing page invites them to start login again.

---

## 5. Error Handling

The dummy app should prefer explicit, easy-to-debug failures over polished UX.

### 5.1 Login and Callback Errors

Handle these cases with a small error page or redirected landing-page message:

- missing discovery metadata
- missing `code` or `state` on the callback
- state mismatch
- missing PKCE verifier cookie
- token endpoint failure
- userinfo failure
- missing required env vars

Each error should display a concise human-readable message suitable for local debugging. Avoid swallowing protocol errors silently.

### 5.2 Security Boundaries for the Test App

Even though the app is for testing, it should still:

- use PKCE on every authorization request
- validate `state`
- keep protocol/session cookies HTTP-only
- avoid storing access tokens in client-side JavaScript-readable storage
- scope redirect URIs exactly to the dummy app callback path

This preserves realistic flow coverage without adding unnecessary complexity.

---

## 6. Testing Strategy

### 6.1 Manual Verification

The primary success criteria are manual browser checks:

- initial login redirects to Cellar and returns to the protected page
- repeated login with an active Cellar session is seamless
- protected page redirects away when the dummy-app session is absent
- local logout clears the dummy-app session and protects `/protected` again

### 6.2 Automated Coverage

Keep automated coverage focused on the dummy app's internal helpers rather than full browser OIDC e2e in the first pass.

Useful automated tests include:

- PKCE helper generation and challenge derivation
- callback state validation behavior
- session cookie encode/decode helper behavior if a custom helper is introduced

Do not expand scope into multi-server Playwright orchestration unless the initial manual flow reveals a real gap.

---

## 7. Implementation Notes

### 7.1 Framework Choice

Use the same Next.js major version family already present in the repo for consistency. The dummy app should be self-contained and not depend on importing internal Cellar app modules at runtime, aside from copied or locally implemented protocol helpers where necessary.

### 7.2 Repo Integration

Update the root `.gitignore` so the new app does not contribute generated noise:

- `oidc-dummy-app/node_modules`
- `oidc-dummy-app/.next`
- `oidc-dummy-app/.env*` except an optional committed example file

### 7.3 Developer Workflow

The expected local workflow should be:

1. configure the dummy app env file
2. add the dummy client secret env var to Cellar
3. run `npm run auth:sync-clients` in the root app
4. run Cellar
5. run the dummy app
6. test the login flow in the browser

This workflow should be documented alongside the dummy app setup.

---

## 8. Open Decisions Resolved

The following decisions are fixed for this implementation:

- standalone app instead of an internal simulation route
- manual authorization-code + PKCE flow instead of an OIDC client library
- local dummy-app session cookie instead of database persistence
- login/protected-page coverage only, with no initial provider logout integration
