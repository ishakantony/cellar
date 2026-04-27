import { createHash } from 'node:crypto';
import { eq, notInArray } from 'drizzle-orm';

import { db } from '../../db/client';
import { oAuthClient } from '../../db/schema';

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
    const metadata = {
      firstParty: true,
      secretEnvVar:
        manifest.find(manifestClient => manifestClient.clientId === client.clientId)
          ?.secretEnvVar ?? null,
      skipConsent: client.skipConsent,
    };

    const values = {
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
    };

    await db
      .insert(oAuthClient)
      .values(values)
      .onConflictDoUpdate({
        target: oAuthClient.clientId,
        set: { ...values, updatedAt: new Date() },
      });
  }

  let disabledCount = 0;
  if (disableMissing) {
    const knownIds = clients.map(c => c.clientId);
    const result = await db
      .update(oAuthClient)
      .set({ disabled: true, updatedAt: new Date() })
      .where(notInArray(oAuthClient.clientId, knownIds))
      .returning({ id: oAuthClient.id });
    disabledCount = result.length;
  }

  return {
    synced: clients.map(client => client.clientId),
    disabled: disabledCount,
  };
}

// `eq` is only used in tests; re-exported here to keep imports consistent.
export { eq };
