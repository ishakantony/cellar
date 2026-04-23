import { oidcProvider } from 'better-auth/plugins/oidc-provider';
import { jwt } from 'better-auth/plugins/jwt';
import type { BetterAuthOptions } from 'better-auth';

import {
  firstPartyClients,
  getFirstPartyClientOrigins,
  resolveFirstPartyClients,
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
  const trustedClients = resolveFirstPartyClients(env, manifest);

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
      oidcProvider({
        loginPage: '/sign-in',
        trustedClients,
        useJWTPlugin: true,
        allowDynamicClientRegistration: false,
        requirePKCE: true,
        allowPlainCodeChallengeMethod: false,
        scopes: ['openid', 'profile', 'email'],
        defaultScope: 'openid',
        metadata: {
          issuer,
          jwks_uri: `${issuer}/jwks`,
          authorization_endpoint: `${issuer}/oauth2/authorize`,
          token_endpoint: `${issuer}/oauth2/token`,
          userinfo_endpoint: `${issuer}/oauth2/userinfo`,
          end_session_endpoint: `${issuer}/oauth2/endsession`,
          registration_endpoint: undefined,
          scopes_supported: ['openid', 'profile', 'email'],
          response_types_supported: ['code'],
          grant_types_supported: ['authorization_code'],
          code_challenge_methods_supported: ['S256'],
          token_endpoint_auth_methods_supported: [
            'client_secret_basic',
            'client_secret_post',
            'none',
          ],
          claims_supported: [
            'sub',
            'iss',
            'aud',
            'exp',
            'nbf',
            'iat',
            'jti',
            'email',
            'email_verified',
            'name',
          ],
        },
        schema: {
          oauthApplication: {
            modelName: 'oAuthApplication',
          },
          oauthAccessToken: {
            modelName: 'oAuthAccessToken',
          },
          oauthConsent: {
            modelName: 'oAuthConsent',
          },
        },
      }),
    ],
  };
}
