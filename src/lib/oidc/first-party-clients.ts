export type FirstPartyClientManifestEntry = {
  clientId: string;
  name: string;
  type: 'web';
  redirectUris: string[];
  secretEnvVar: string;
  skipConsent: true;
  disabled?: boolean;
  scopes?: string[];
};

export type ResolvedFirstPartyClient = {
  clientId: string;
  name: string;
  type: 'web';
  redirectUris: string[];
  clientSecret?: string;
  skipConsent: true;
  disabled: boolean;
  scopes: string[];
  metadata: {
    firstParty: true;
  };
};

export const firstPartyClients: FirstPartyClientManifestEntry[] = [
  {
    clientId: 'oidc-dummy-app',
    name: 'OIDC Dummy App',
    type: 'web',
    redirectUris: ['http://localhost:3001/auth/callback'],
    secretEnvVar: 'OIDC_DUMMY_APP_OIDC_SECRET',
    skipConsent: true,
  },
];

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
      redirectUris: client.redirectUris,
      clientSecret,
      skipConsent: true,
      disabled: client.disabled ?? false,
      scopes: client.scopes ?? ['openid', 'profile', 'email'],
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
        client.redirectUris.map(redirectUri => {
          return new URL(redirectUri).origin;
        })
      )
    )
  );
}
