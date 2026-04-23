import { beforeEach, describe, expect, it, vi } from 'vitest';

const { upsert, updateMany } = vi.hoisted(() => {
  return {
    upsert: vi.fn(),
    updateMany: vi.fn(),
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: {
    oAuthApplication: {
      upsert,
      updateMany,
    },
  },
}));

import { syncFirstPartyClients } from './sync-clients';
import type { FirstPartyClientManifestEntry } from './first-party-clients';

describe('syncFirstPartyClients', () => {
  beforeEach(() => {
    upsert.mockReset();
    updateMany.mockReset();
    upsert.mockResolvedValue(undefined);
    updateMany.mockResolvedValue({ count: 0 });
  });

  it('upserts every manifest client into oauthApplication storage', async () => {
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
        clientSecret: 'super-secret',
        redirectUrls: 'https://app.example.com/api/auth/callback/cellar',
        metadata: JSON.stringify({
          firstParty: true,
          secretEnvVar: 'APP_WEB_OIDC_SECRET',
          skipConsent: true,
        }),
        disabled: false,
      }),
      update: expect.objectContaining({
        name: 'App Web',
        clientSecret: 'super-secret',
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
        redirectUrls: ['https://app.example.com/api/auth/callback/cellar'],
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
