# Cellar First-Party OIDC

Issuer URL: `BETTER_AUTH_URL` with `/api/auth` as the auth base path.

Discovery URL: `/api/auth/.well-known/openid-configuration`

Supported scopes: `openid profile email`

Client manifest: define static first-party clients in `apps/api/src/auth/oidc/first-party-clients.ts` with:

- `clientId`
- `name`
- `type: 'web'`
- `redirectUrls`
- `secretEnvVar`
- `skipConsent: true`
- `disabled`

Required env vars:

- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- one secret env var per client manifest entry
- optional `OIDC_DISABLE_MISSING_CLIENTS=true` to disable unmanaged database clients during sync

Bootstrap flow:

1. Run Drizzle migrations (`pnpm db:migrate`, or rely on the API boot which runs them automatically).
2. Run `pnpm auth:sync-clients`.

Consumer apps must use a standard OIDC client library and integrate against Cellar discovery, authorization, token, userinfo, JWKS, and end-session endpoints. Do not share Cellar cookies directly across apps.

## Local OIDC Dummy App

Cellar includes a static first-party client for the local test app:

- `clientId`: `oidc-dummy-app`
- `redirect_uri`: `http://localhost:3001/auth/callback`
- `secret env var`: `OIDC_DUMMY_APP_OIDC_SECRET`

Local bootstrap flow:

1. Set `OIDC_DUMMY_APP_OIDC_SECRET` in `apps/api/.env`.
2. Run `pnpm auth:sync-clients`.
3. Start Cellar on `http://localhost:5200` (SPA, proxies `/api` and `/.well-known` to the API on `:5201`).
4. Start `oidc-dummy-app` on `http://localhost:3001`.
5. Use the dummy app landing page to exercise the authorization-code + PKCE flow.
