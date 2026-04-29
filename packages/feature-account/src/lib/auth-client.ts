import { createAuthClient } from 'better-auth/react';
import { oauthProviderClient } from '@better-auth/oauth-provider/client';

/**
 * Better Auth client used by Account feature for profile updates and password
 * changes (with `revokeOtherSessions`). Intentionally duplicated from
 * `apps/shell/src/lib/auth-client.ts` so the feature package has no path
 * imports back into the shell, mirroring the api-fetch duplication established
 * by the Vault extraction (#003). Both clients point at the same origin so
 * session cookies are shared.
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5201',
  plugins: [oauthProviderClient()],
});
