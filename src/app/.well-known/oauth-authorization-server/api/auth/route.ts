import { oauthProviderAuthServerMetadata } from '@better-auth/oauth-provider';

import { auth } from '@/lib/auth';

type OAuthServerMetadataAuth = {
  api: { getOAuthServerConfig: (...args: unknown[]) => unknown };
};

export const GET = oauthProviderAuthServerMetadata(auth as unknown as OAuthServerMetadataAuth);
