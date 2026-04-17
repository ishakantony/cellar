import { Client } from 'pg';

/**
 * Delete a test user by email using raw SQL.
 * Use this in test cleanup to ensure test data doesn't persist.
 */
export async function cleanupTestUser(email: string): Promise<void> {
  // Load test environment variables
  const { config } = await import('dotenv');
  const { default: path } = await import('path');
  config({ path: path.resolve(process.cwd(), '.env.test'), override: true });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log(`Note: DATABASE_URL not set, skipping cleanup for ${email}`);
    return;
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    // Delete user by email (cascade will handle related records)
    await client.query('DELETE FROM "User" WHERE email = $1', [email]);
    console.log(`Cleaned up test user: ${email}`);
  } catch {
    // User might not exist, that's fine
    console.log(`Note: Could not delete user ${email} (may not exist)`);
  } finally {
    await client.end();
  }
}

/**
 * Generate a unique test email with timestamp.
 * Pattern: e2e-test-{timestamp}@example.com
 */
export function generateTestEmail(prefix: string = 'e2e'): string {
  return `${prefix}-test-${Date.now()}@example.com`;
}

/**
 * Standard test user credentials.
 */
export const TEST_USER_CREDENTIALS = {
  name: 'E2E Test User',
  password: 'TestPassword123!',
} as const;
