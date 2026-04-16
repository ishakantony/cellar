import { prisma } from '../../src/lib/prisma';

/**
 * Delete a test user by email.
 * Use this in test cleanup to ensure test data doesn't persist.
 */
export async function cleanupTestUser(email: string): Promise<void> {
  try {
    await prisma.user.deleteMany({
      where: { email },
    });
  } catch (error) {
    // User might not exist, that's fine
    console.log(`Note: Could not delete user ${email} (may not exist)`);
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
