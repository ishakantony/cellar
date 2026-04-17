import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

// Security: Validate auth secret on startup
if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error(
    'FATAL: BETTER_AUTH_SECRET must be set and at least 32 characters. ' +
      'Generate with: openssl rand -base64 32'
  );
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  advanced: {
    // Disable secure cookies in test environment for e2e testing
    disableCSRFCheck: process.env.E2E_TEST_MODE === 'true',
    cookiePrefix: process.env.E2E_TEST_MODE === 'true' ? 'cellar-test' : 'cellar',
  },
});

// Security warning for test mode
if (process.env.E2E_TEST_MODE === 'true') {
  console.warn('⚠️  SECURITY WARNING: CSRF protection disabled for E2E testing');
}
