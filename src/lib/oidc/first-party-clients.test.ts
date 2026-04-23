import { describe, expect, it } from 'vitest';

import {
  firstPartyClients,
  getFirstPartyClientOrigins,
  resolveFirstPartyClients,
  type FirstPartyClientManifestEntry,
} from './first-party-clients';

describe('firstPartyClients', () => {
  it('defaults to a manifest containing the oidc dummy app', () => {
    expect(firstPartyClients).toEqual([
      {
        clientId: 'oidc-dummy-app',
        name: 'OIDC Dummy App',
        type: 'web',
        redirectUrls: ['http://localhost:3001/auth/callback'],
        secretEnvVar: 'OIDC_DUMMY_APP_OIDC_SECRET',
        skipConsent: true,
      },
    ]);
  });

  it('resolves manifest entries from env and marks them trusted for silent SSO', () => {
    const manifest: FirstPartyClientManifestEntry[] = [
      {
        clientId: 'app-web',
        name: 'App Web',
        type: 'web',
        redirectUrls: ['https://app.example.com/api/auth/callback/cellar'],
        secretEnvVar: 'APP_WEB_OIDC_SECRET',
        skipConsent: true,
      },
    ];

    const clients = resolveFirstPartyClients(
      {
        APP_WEB_OIDC_SECRET: 'super-secret',
      },
      manifest
    );

    expect(clients).toEqual([
      {
        clientId: 'app-web',
        name: 'App Web',
        type: 'web',
        redirectUrls: ['https://app.example.com/api/auth/callback/cellar'],
        clientSecret: 'super-secret',
        skipConsent: true,
        disabled: false,
        metadata: {
          firstParty: true,
        },
      },
    ]);
  });

  it('allows disabled clients to omit their secret while remaining unavailable', () => {
    const manifest: FirstPartyClientManifestEntry[] = [
      {
        clientId: 'app-disabled',
        name: 'Disabled App',
        type: 'web',
        redirectUrls: ['https://disabled.example.com/api/auth/callback/cellar'],
        secretEnvVar: 'DISABLED_OIDC_SECRET',
        skipConsent: true,
        disabled: true,
      },
    ];

    const clients = resolveFirstPartyClients({}, manifest);

    expect(clients[0]).toMatchObject({
      clientId: 'app-disabled',
      clientSecret: undefined,
      disabled: true,
      skipConsent: true,
    });
  });

  it('throws when an enabled confidential client secret is missing', () => {
    const manifest: FirstPartyClientManifestEntry[] = [
      {
        clientId: 'app-missing-secret',
        name: 'Missing Secret App',
        type: 'web',
        redirectUrls: ['https://app.example.com/api/auth/callback/cellar'],
        secretEnvVar: 'MISSING_SECRET',
        skipConsent: true,
      },
    ];

    expect(() => resolveFirstPartyClients({}, manifest)).toThrow(
      'Missing required OIDC client secret env var MISSING_SECRET for client app-missing-secret'
    );
  });

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
