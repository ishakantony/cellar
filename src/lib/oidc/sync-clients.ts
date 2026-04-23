import { createHash } from 'node:crypto';

import { prisma } from '@/lib/prisma';

import {
  firstPartyClients,
  resolveFirstPartyClients,
  type FirstPartyClientManifestEntry,
} from './first-party-clients';

type SyncFirstPartyClientsOptions = {
  env?: Record<string, string | undefined>;
  manifest?: readonly FirstPartyClientManifestEntry[];
  disableMissing?: boolean;
};

function hashClientSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('base64url');
}

export async function syncFirstPartyClients({
  env = process.env,
  manifest = firstPartyClients,
  disableMissing = false,
}: SyncFirstPartyClientsOptions = {}) {
  const clients = resolveFirstPartyClients(env, manifest);

  for (const client of clients) {
    const metadata = JSON.stringify({
      firstParty: true,
      secretEnvVar:
        manifest.find(manifestClient => manifestClient.clientId === client.clientId)
          ?.secretEnvVar ?? null,
      skipConsent: client.skipConsent,
    });

    await prisma.oAuthClient.upsert({
      where: {
        clientId: client.clientId,
      },
      create: {
        clientId: client.clientId,
        clientSecret: client.clientSecret ? hashClientSecret(client.clientSecret) : null,
        type: client.type,
        name: client.name,
        redirectUris: client.redirectUris,
        metadata,
        disabled: client.disabled,
        skipConsent: true,
        tokenEndpointAuthMethod: 'client_secret_basic',
        grantTypes: ['authorization_code'],
        responseTypes: ['code'],
        scopes: client.scopes,
        requirePKCE: true,
        public: false,
      },
      update: {
        clientSecret: client.clientSecret ? hashClientSecret(client.clientSecret) : null,
        type: client.type,
        name: client.name,
        redirectUris: client.redirectUris,
        metadata,
        disabled: client.disabled,
        skipConsent: true,
        tokenEndpointAuthMethod: 'client_secret_basic',
        grantTypes: ['authorization_code'],
        responseTypes: ['code'],
        scopes: client.scopes,
        requirePKCE: true,
        public: false,
      },
    });
  }

  let disabledCount = 0;
  if (disableMissing) {
    const result = await prisma.oAuthClient.updateMany({
      where: {
        clientId: {
          notIn: clients.map(client => client.clientId),
        },
      },
      data: {
        disabled: true,
      },
    });
    disabledCount = result.count;
  }

  return {
    synced: clients.map(client => client.clientId),
    disabled: disabledCount,
  };
}
