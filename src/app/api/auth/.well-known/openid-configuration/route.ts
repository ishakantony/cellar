import { oauthProviderOpenIdConfigMetadata } from '@better-auth/oauth-provider';

import { auth } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = oauthProviderOpenIdConfigMetadata(auth as any);
