import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/client';
import { schema } from '../db/schema';
import { buildAuthOptions } from './config';

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error(
    'FATAL: BETTER_AUTH_SECRET must be set and at least 32 characters. ' +
      'Generate with: openssl rand -base64 32'
  );
}

export const auth = betterAuth(
  buildAuthOptions({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
  })
);

if (process.env.E2E_TEST_MODE === 'true') {
  console.warn('⚠️  SECURITY WARNING: CSRF protection disabled for E2E testing');
}

export type Auth = typeof auth;
