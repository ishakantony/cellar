// @vitest-environment node

import { createHash } from 'node:crypto';

import { betterAuth } from 'better-auth';
import { createLocalJWKSet, jwtVerify } from 'jose';
import { beforeEach, describe, expect, it } from 'vitest';
import { memoryAdapter, type MemoryDB } from '@better-auth/memory-adapter';

import { AUTH_BASE_PATH, buildAuthOptions, getCanonicalAuthIssuer } from '@/lib/auth-config';
import type { FirstPartyClientManifestEntry } from './first-party-clients';

const TEST_USER = {
  name: 'OIDC Test User',
  email: 'oidc@example.com',
  password: 'TestPassword123!',
};

function createPkcePair() {
  const verifier = 'cellar-test-code-verifier-123456789';
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

function mergeSetCookies(headers: Headers, response: Response) {
  const existing = new Map<string, string>();
  const cookieHeader = headers.get('cookie');

  if (cookieHeader) {
    for (const cookie of cookieHeader.split(';')) {
      const [name, ...value] = cookie.trim().split('=');
      if (name && value.length > 0) {
        existing.set(name, value.join('='));
      }
    }
  }

  const setCookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : response.headers.get('set-cookie')
        ? [response.headers.get('set-cookie')!]
        : [];

  for (const rawCookie of setCookies) {
    const [pair] = rawCookie.split(';');
    const [name, ...value] = pair.split('=');
    if (name && value.length > 0) {
      existing.set(name, value.join('='));
    }
  }

  if (existing.size > 0) {
    headers.set(
      'cookie',
      Array.from(existing.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join('; ')
    );
  }
}

async function createTestAuth(manifest: FirstPartyClientManifestEntry[]) {
  const db: MemoryDB = {
    user: [],
    session: [],
    account: [],
    verification: [],
    oAuthApplication: [],
    oAuthAccessToken: [],
    oAuthConsent: [],
    jwks: [],
  };
  const env = {
    BETTER_AUTH_SECRET: 'cellar-auth-secret-that-is-long-enough-for-tests',
    BETTER_AUTH_URL: 'http://localhost:3000',
    GITHUB_CLIENT_ID: '',
    GITHUB_CLIENT_SECRET: '',
    CELLAR_WEB_OIDC_SECRET: process.env.CELLAR_WEB_OIDC_SECRET,
    DISABLED_WEB_OIDC_SECRET: process.env.DISABLED_WEB_OIDC_SECRET,
  };

  const auth = betterAuth({
    ...buildAuthOptions({
      env,
      database: memoryAdapter(db),
      manifest,
    }),
  });

  await auth.api.signUpEmail({
    body: TEST_USER,
  });

  return {
    auth,
    issuer: getCanonicalAuthIssuer(env),
  };
}

async function signInWithPassword(
  auth: ReturnType<typeof betterAuth>,
  issuer: string,
  headers = new Headers()
) {
  const response = await auth.handler(
    new Request(`${issuer}/sign-in/email`, {
      method: 'POST',
      headers: {
        ...Object.fromEntries(headers.entries()),
        'Content-Type': 'application/json',
        origin: 'http://localhost:3000',
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
      }),
    })
  );

  mergeSetCookies(headers, response);

  return {
    headers,
    response,
  };
}

describe('Cellar OIDC auth config', () => {
  const manifest: FirstPartyClientManifestEntry[] = [
    {
      clientId: 'cellar-web',
      name: 'Cellar Web',
      type: 'web',
      redirectUrls: ['https://app.example.com/api/auth/callback/cellar'],
      secretEnvVar: 'CELLAR_WEB_OIDC_SECRET',
      skipConsent: true,
    },
  ];

  beforeEach(() => {
    process.env.CELLAR_WEB_OIDC_SECRET = 'cellar-web-secret';
    process.env.DISABLED_WEB_OIDC_SECRET = 'disabled-secret';
  });

  it('serves discovery metadata for the configured issuer and endpoints', async () => {
    const { auth, issuer } = await createTestAuth(manifest);

    const response = await auth.handler(
      new Request(`${issuer}/.well-known/openid-configuration`, {
        method: 'GET',
      })
    );

    expect(response.status).toBe(200);

    const metadata = await response.json();

    expect(metadata).toMatchObject({
      issuer,
      authorization_endpoint: `${issuer}/oauth2/authorize`,
      token_endpoint: `${issuer}/oauth2/token`,
      userinfo_endpoint: `${issuer}/oauth2/userinfo`,
      jwks_uri: `${issuer}/jwks`,
      end_session_endpoint: `${issuer}/oauth2/endsession`,
      scopes_supported: ['openid', 'profile', 'email'],
      code_challenge_methods_supported: ['S256'],
    });
    expect(metadata.registration_endpoint).toBeUndefined();
  });

  it('completes an authorization-code + PKCE flow for a trusted first-party client without consent', async () => {
    const { auth, issuer } = await createTestAuth(manifest);
    const { verifier, challenge } = createPkcePair();

    const { headers: sessionHeaders } = await signInWithPassword(auth, issuer);

    const authorizeUrl = new URL(`${issuer}/oauth2/authorize`);
    authorizeUrl.searchParams.set('client_id', 'cellar-web');
    authorizeUrl.searchParams.set('redirect_uri', manifest[0]!.redirectUrls[0]!);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('scope', 'openid profile email');
    authorizeUrl.searchParams.set('state', 'test-state');
    authorizeUrl.searchParams.set('code_challenge', challenge);
    authorizeUrl.searchParams.set('code_challenge_method', 'S256');

    const authorizeResponse = await auth.handler(
      new Request(authorizeUrl, {
        method: 'GET',
        headers: sessionHeaders,
      })
    );

    expect(authorizeResponse.status).toBe(302);

    const redirectLocation = authorizeResponse.headers.get('Location');
    expect(redirectLocation).toContain(manifest[0]!.redirectUrls[0]!);
    expect(redirectLocation).toContain('code=');
    expect(redirectLocation).not.toContain('consent_code=');

    const code = new URL(redirectLocation!).searchParams.get('code');
    expect(code).toBeTruthy();

    const tokenResponse = await auth.handler(
      new Request(`${issuer}/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from('cellar-web:cellar-web-secret').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: manifest[0]!.redirectUrls[0]!,
          code_verifier: verifier,
        }),
      })
    );

    expect(tokenResponse.status).toBe(200);

    const tokenSet = await tokenResponse.json();
    expect(tokenSet.id_token).toBeTruthy();
    expect(tokenSet.access_token).toBeTruthy();

    const jwksResponse = await auth.handler(
      new Request(`${issuer}/jwks`, {
        method: 'GET',
      })
    );
    const jwks = await jwksResponse.json();
    const localJwks = createLocalJWKSet(jwks);
    const verified = await jwtVerify(tokenSet.id_token, localJwks, {
      issuer,
      audience: 'cellar-web',
    });

    expect(verified.payload.sub).toBeTruthy();
    expect(verified.payload.email).toBe(TEST_USER.email);
  });

  it('resumes the authorize flow after an unauthenticated login redirect', async () => {
    const { auth, issuer } = await createTestAuth(manifest);
    const loginHeaders = new Headers();
    const { challenge } = createPkcePair();

    const authorizeUrl = new URL(`${issuer}/oauth2/authorize`);
    authorizeUrl.searchParams.set('client_id', 'cellar-web');
    authorizeUrl.searchParams.set('redirect_uri', manifest[0]!.redirectUrls[0]!);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('scope', 'openid profile email');
    authorizeUrl.searchParams.set('state', 'resume-state');
    authorizeUrl.searchParams.set('code_challenge', challenge);
    authorizeUrl.searchParams.set('code_challenge_method', 'S256');

    const authorizeResponse = await auth.handler(
      new Request(authorizeUrl, {
        method: 'GET',
      })
    );

    mergeSetCookies(loginHeaders, authorizeResponse);

    expect(authorizeResponse.status).toBe(302);
    expect(authorizeResponse.headers.get('Location')).toContain('/sign-in');

    const { response: loginResponse } = await signInWithPassword(auth, issuer, loginHeaders);

    expect(loginResponse.status).toBe(302);
    expect(loginResponse.headers.get('Location')).toContain(manifest[0]!.redirectUrls[0]!);
    expect(loginResponse.headers.get('Location')).toContain('code=');
  });

  it('rejects invalid and disabled clients and mismatched redirect URIs', async () => {
    const disabledManifest: FirstPartyClientManifestEntry[] = [
      ...manifest,
      {
        clientId: 'disabled-web',
        name: 'Disabled Web',
        type: 'web',
        redirectUrls: ['https://disabled.example.com/api/auth/callback/cellar'],
        secretEnvVar: 'DISABLED_WEB_OIDC_SECRET',
        skipConsent: true,
        disabled: true,
      },
    ];

    process.env.DISABLED_WEB_OIDC_SECRET = 'disabled-secret';

    const { auth, issuer } = await createTestAuth(disabledManifest);
    const { challenge } = createPkcePair();

    const { headers: sessionHeaders } = await signInWithPassword(auth, issuer);

    const invalidClientResponse = await auth.handler(
      new Request(
        `${issuer}/oauth2/authorize?client_id=missing&redirect_uri=${encodeURIComponent(
          manifest[0]!.redirectUrls[0]!
        )}&response_type=code&scope=openid&state=bad&code_challenge=${challenge}&code_challenge_method=S256`,
        {
          method: 'GET',
          headers: sessionHeaders,
        }
      )
    );
    expect([302, 400]).toContain(invalidClientResponse.status);
    expect(invalidClientResponse.headers.get('Location') ?? '').not.toContain('code=');

    const badRedirectResponse = await auth.handler(
      new Request(
        `${issuer}/oauth2/authorize?client_id=cellar-web&redirect_uri=${encodeURIComponent(
          'https://malicious.example.com/callback'
        )}&response_type=code&scope=openid&state=bad&code_challenge=${challenge}&code_challenge_method=S256`,
        {
          method: 'GET',
          headers: sessionHeaders,
        }
      )
    );
    expect([302, 400]).toContain(badRedirectResponse.status);
    expect(badRedirectResponse.headers.get('Location') ?? '').not.toContain('code=');

    const disabledClientResponse = await auth.handler(
      new Request(
        `${issuer}/oauth2/authorize?client_id=disabled-web&redirect_uri=${encodeURIComponent(
          disabledManifest[1]!.redirectUrls[0]!
        )}&response_type=code&scope=openid&state=bad&code_challenge=${challenge}&code_challenge_method=S256`,
        {
          method: 'GET',
          headers: sessionHeaders,
        }
      )
    );
    expect([302, 400]).toContain(disabledClientResponse.status);
    expect(disabledClientResponse.headers.get('Location') ?? '').not.toContain('code=');
  });

  it('logs the user out and redirects to an allowed post-logout URI', async () => {
    const { auth, issuer } = await createTestAuth(manifest);
    const { headers: sessionHeaders } = await signInWithPassword(auth, issuer);

    const endSessionResponse = await auth.handler(
      new Request(
        `${issuer}/oauth2/endsession?client_id=cellar-web&post_logout_redirect_uri=${encodeURIComponent(
          manifest[0]!.redirectUrls[0]!
        )}&state=logout-state`,
        {
          method: 'GET',
          headers: sessionHeaders,
        }
      )
    );

    expect(endSessionResponse.status).toBe(302);
    expect(endSessionResponse.headers.get('Location')).toBe(
      `${manifest[0]!.redirectUrls[0]!}?state=logout-state`
    );
  });

  it('uses the Next.js auth base path convention for protocol endpoints', () => {
    expect(AUTH_BASE_PATH).toBe('/api/auth');
  });
});
