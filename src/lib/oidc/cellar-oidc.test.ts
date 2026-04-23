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

function hashClientSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('base64url');
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
    oAuthClient: [],
    oAuthAccessToken: [],
    oAuthConsent: [],
    oAuthRefreshToken: [],
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

  // Seed first-party clients into the memory DB so the oauth-provider plugin can look them up
  for (const client of manifest) {
    const secret = env[client.secretEnvVar as keyof typeof env];
    db.oAuthClient.push({
      id: `client-${client.clientId}`,
      clientId: client.clientId,
      clientSecret: secret ? hashClientSecret(secret) : null,
      name: client.name,
      type: client.type,
      redirectUris: client.redirectUris,
      disabled: client.disabled ?? false,
      skipConsent: true,
      tokenEndpointAuthMethod: 'client_secret_basic',
      grantTypes: ['authorization_code'],
      responseTypes: ['code'],
      scopes: client.scopes ?? ['openid', 'profile', 'email'],
      requirePKCE: true,
      public: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

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
      redirectUris: ['https://app.example.com/api/auth/callback/cellar'],
      secretEnvVar: 'CELLAR_WEB_OIDC_SECRET',
      skipConsent: true,
    },
  ];

  beforeEach(() => {
    process.env.CELLAR_WEB_OIDC_SECRET = 'cellar-web-secret';
    process.env.DISABLED_WEB_OIDC_SECRET = 'disabled-secret';
  });

  it('completes an authorization-code + PKCE flow for a trusted first-party client without consent', async () => {
    const { auth, issuer } = await createTestAuth(manifest);
    const { verifier, challenge } = createPkcePair();

    const { headers: sessionHeaders } = await signInWithPassword(auth, issuer);

    const authorizeUrl = new URL(`${issuer}/oauth2/authorize`);
    authorizeUrl.searchParams.set('client_id', 'cellar-web');
    authorizeUrl.searchParams.set('redirect_uri', manifest[0]!.redirectUris[0]!);
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
    expect(redirectLocation).toContain(manifest[0]!.redirectUris[0]!);
    expect(redirectLocation).toContain('code=');
    expect(redirectLocation).not.toContain('consent_code=');

    const code = new URL(redirectLocation!).searchParams.get('code');
    expect(code).toBeTruthy();

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code!,
      redirect_uri: manifest[0]!.redirectUris[0]!,
      code_verifier: verifier,
    });

    const tokenResponse = await auth.handler(
      new Request(`${issuer}/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from('cellar-web:cellar-web-secret').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenBody.toString(),
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

  it('rejects invalid and disabled clients and mismatched redirect URIs', async () => {
    const disabledManifest: FirstPartyClientManifestEntry[] = [
      ...manifest,
      {
        clientId: 'disabled-web',
        name: 'Disabled Web',
        type: 'web',
        redirectUris: ['https://disabled.example.com/api/auth/callback/cellar'],
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
          manifest[0]!.redirectUris[0]!
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
          disabledManifest[1]!.redirectUris[0]!
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

  it('uses the Next.js auth base path convention for protocol endpoints', () => {
    expect(AUTH_BASE_PATH).toBe('/api/auth');
  });
});
