import { oauthProviderOpenIdConfigMetadata } from '@better-auth/oauth-provider';

import { auth } from '@/lib/auth';

type OpenIdConfigMetadataAuth = {
  api: { getOpenIdConfig: (...args: unknown[]) => unknown };
};

export const GET = oauthProviderOpenIdConfigMetadata(auth as unknown as OpenIdConfigMetadataAuth);
