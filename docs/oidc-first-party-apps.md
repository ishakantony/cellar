# Cellar First-Party OIDC

Issuer URL: `BETTER_AUTH_URL` with `/api/auth` as the auth base path.

Discovery URL: `/api/auth/.well-known/openid-configuration`

Supported scopes: `openid profile email`

Client manifest: define static first-party clients in `src/lib/oidc/first-party-clients.ts` with:

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

1. Run Prisma migrations.
2. Run `npm run auth:sync-clients`.

Consumer apps must use a standard OIDC client library and integrate against Cellar discovery, authorization, token, userinfo, JWKS, and end-session endpoints. Do not share Cellar cookies directly across apps.
