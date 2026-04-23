import { oauthProvider } from '@better-auth/oauth-provider';
import { jwt } from 'better-auth/plugins/jwt';
import type { BetterAuthOptions } from 'better-auth';

import {
  firstPartyClients,
  getFirstPartyClientOrigins,
  type FirstPartyClientManifestEntry,
} from './oidc/first-party-clients';

export const AUTH_BASE_PATH = '/api/auth';

export function getCanonicalAuthIssuer(env: Record<string, string | undefined> = process.env) {
  const configuredBaseUrl = env.BETTER_AUTH_URL?.trim();

  if (!configuredBaseUrl) {
    return AUTH_BASE_PATH;
  }

  const trimmed = configuredBaseUrl.replace(/\/+$/, '');

  if (trimmed.endsWith(AUTH_BASE_PATH)) {
    return trimmed;
  }

  return `${trimmed}${AUTH_BASE_PATH}`;
}

export function getAuthCookiePrefix(env: Record<string, string | undefined> = process.env) {
  return env.E2E_TEST_MODE === 'true' ? 'cellar-test' : 'cellar';
}

export function getAuthSessionCookieNames(env: Record<string, string | undefined> = process.env) {
  const cookieName = `${getAuthCookiePrefix(env)}.session_token`;

  return [cookieName, `__Secure-${cookieName}`];
}

function getTrustedOrigins(
  env: Record<string, string | undefined>,
  manifest: readonly FirstPartyClientManifestEntry[]
) {
  const origins = new Set<string>();
  const configuredBaseUrl = env.BETTER_AUTH_URL?.trim();

  if (configuredBaseUrl) {
    origins.add(new URL(configuredBaseUrl).origin);
  }

  for (const origin of getFirstPartyClientOrigins(manifest)) {
    origins.add(origin);
  }

  return Array.from(origins);
}

type BuildAuthOptionsInput = {
  env?: Record<string, string | undefined>;
  database: BetterAuthOptions['database'];
  manifest?: readonly FirstPartyClientManifestEntry[];
};

export function buildAuthOptions({
  env = process.env,
  database,
  manifest = firstPartyClients,
}: BuildAuthOptionsInput): BetterAuthOptions {
  const issuer = getCanonicalAuthIssuer(env);

  return {
    baseURL: env.BETTER_AUTH_URL,
    basePath: AUTH_BASE_PATH,
    database,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID ?? '',
        clientSecret: env.GITHUB_CLIENT_SECRET ?? '',
      },
    },
    trustedOrigins: getTrustedOrigins(env, manifest),
    advanced: {
      disableCSRFCheck: env.E2E_TEST_MODE === 'true',
      cookiePrefix: getAuthCookiePrefix(env),
    },
    plugins: [
      jwt({
        jwt: {
          issuer,
        },
        jwks: {
          keyPairConfig: {
            alg: 'EdDSA',
            crv: 'Ed25519',
          },
        },
      }),
      oauthProvider({
        loginPage: '/sign-in',
        consentPage: '/consent',
        scopes: ['openid', 'profile', 'email'],
        cachedTrustedClients: new Set(manifest.map(c => c.clientId)),
        silenceWarnings: {
          oauthAuthServerConfig: true,
          openidConfig: true,
        },
        schema: {
          oauthClient: {
            modelName: 'oAuthClient',
          },
          oauthAccessToken: {
            modelName: 'oAuthAccessToken',
          },
          oauthConsent: {
            modelName: 'oAuthConsent',
          },
          oauthRefreshToken: {
            modelName: 'oAuthRefreshToken',
          },
        },
      }),
    ],
  };
}
