import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { upsert, updateMany } = vi.hoisted(() => {
  return {
    upsert: vi.fn(),
    updateMany: vi.fn(),
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: {
    oAuthClient: {
      upsert,
      updateMany,
    },
  },
}));

import { syncFirstPartyClients } from './sync-clients';
import type { FirstPartyClientManifestEntry } from './first-party-clients';

function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('base64url');
}

describe('syncFirstPartyClients', () => {
  beforeEach(() => {
    upsert.mockReset();
    updateMany.mockReset();
    upsert.mockResolvedValue(undefined);
    updateMany.mockResolvedValue({ count: 0 });
  });

  it('upserts every manifest client into oauthClient storage', async () => {
    const manifest: FirstPartyClientManifestEntry[] = [
      {
        clientId: 'app-web',
        name: 'App Web',
        type: 'web',
        redirectUris: ['https://app.example.com/api/auth/callback/cellar'],
        secretEnvVar: 'APP_WEB_OIDC_SECRET',
        skipConsent: true,
      },
    ];

    const result = await syncFirstPartyClients({
      env: {
        APP_WEB_OIDC_SECRET: 'super-secret',
      },
      manifest,
    });

    expect(upsert).toHaveBeenCalledWith({
      where: {
        clientId: 'app-web',
      },
      create: expect.objectContaining({
        clientId: 'app-web',
        clientSecret: hashSecret('super-secret'),
        redirectUris: ['https://app.example.com/api/auth/callback/cellar'],
        metadata: JSON.stringify({
          firstParty: true,
          secretEnvVar: 'APP_WEB_OIDC_SECRET',
          skipConsent: true,
        }),
        disabled: false,
        skipConsent: true,
        tokenEndpointAuthMethod: 'client_secret_basic',
        grantTypes: ['authorization_code'],
        responseTypes: ['code'],
        scopes: ['openid', 'profile', 'email'],
        requirePKCE: true,
        public: false,
      }),
      update: expect.objectContaining({
        name: 'App Web',
        clientSecret: hashSecret('super-secret'),
        disabled: false,
      }),
    });

    expect(result).toEqual({
      synced: ['app-web'],
      disabled: 0,
    });
  });

  it('optionally disables unmanaged database clients', async () => {
    const manifest: FirstPartyClientManifestEntry[] = [
      {
        clientId: 'app-web',
        name: 'App Web',
        type: 'web',
        redirectUris: ['https://app.example.com/api/auth/callback/cellar'],
        secretEnvVar: 'APP_WEB_OIDC_SECRET',
        skipConsent: true,
      },
    ];

    updateMany.mockResolvedValue({ count: 2 });

    const result = await syncFirstPartyClients({
      env: {
        APP_WEB_OIDC_SECRET: 'super-secret',
      },
      manifest,
      disableMissing: true,
    });

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        clientId: {
          notIn: ['app-web'],
        },
      },
      data: {
        disabled: true,
      },
    });

    expect(result.disabled).toBe(2);
  });
});
