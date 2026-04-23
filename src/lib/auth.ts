import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { buildAuthOptions } from './auth-config';

// Security: Validate auth secret on startup
if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error(
    'FATAL: BETTER_AUTH_SECRET must be set and at least 32 characters. ' +
      'Generate with: openssl rand -base64 32'
  );
}

export const auth = betterAuth(
  buildAuthOptions({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
  })
);

// Security warning for test mode
if (process.env.E2E_TEST_MODE === 'true') {
  console.warn('⚠️  SECURITY WARNING: CSRF protection disabled for E2E testing');
}
