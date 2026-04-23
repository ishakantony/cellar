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

    await prisma.oAuthApplication.upsert({
      where: {
        clientId: client.clientId,
      },
      create: {
        clientId: client.clientId,
        clientSecret: client.clientSecret,
        type: client.type,
        name: client.name,
        redirectUrls: client.redirectUrls.join(','),
        metadata,
        disabled: client.disabled,
      },
      update: {
        clientSecret: client.clientSecret,
        type: client.type,
        name: client.name,
        redirectUrls: client.redirectUrls.join(','),
        metadata,
        disabled: client.disabled,
      },
    });
  }

  let disabledCount = 0;
  if (disableMissing) {
    const result = await prisma.oAuthApplication.updateMany({
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
