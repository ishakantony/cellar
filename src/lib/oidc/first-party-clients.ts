export type FirstPartyClientManifestEntry = {
  clientId: string;
  name: string;
  type: 'web';
  redirectUrls: string[];
  secretEnvVar: string;
  skipConsent: true;
  disabled?: boolean;
};

export type ResolvedFirstPartyClient = {
  clientId: string;
  name: string;
  type: 'web';
  redirectUrls: string[];
  clientSecret?: string;
  skipConsent: true;
  disabled: boolean;
  metadata: {
    firstParty: true;
  };
};

export const firstPartyClients: FirstPartyClientManifestEntry[] = [];

export function resolveFirstPartyClients(
  env: Record<string, string | undefined>,
  manifest: readonly FirstPartyClientManifestEntry[] = firstPartyClients
): ResolvedFirstPartyClient[] {
  return manifest.map(client => {
    const clientSecret = env[client.secretEnvVar];

    if (!client.disabled && !clientSecret) {
      throw new Error(
        `Missing required OIDC client secret env var ${client.secretEnvVar} for client ${client.clientId}`
      );
    }

    return {
      clientId: client.clientId,
      name: client.name,
      type: client.type,
      redirectUrls: client.redirectUrls,
      clientSecret,
      skipConsent: true,
      disabled: client.disabled ?? false,
      metadata: {
        firstParty: true,
      },
    };
  });
}

export function getFirstPartyClientOrigins(
  manifest: readonly FirstPartyClientManifestEntry[] = firstPartyClients
) {
  return Array.from(
    new Set(
      manifest.flatMap(client =>
        client.redirectUrls.map(redirectUrl => {
          return new URL(redirectUrl).origin;
        })
      )
    )
  );
}
