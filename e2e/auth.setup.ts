import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { cleanupTestUser, generateTestEmail, TEST_USER_CREDENTIALS } from './utils/db';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Create a unique test user for this session
  const testEmail = generateTestEmail('setup');
  const { name, password } = TEST_USER_CREDENTIALS;

  // Clean up any existing test user with this email (in case of retries)
  await cleanupTestUser(testEmail);

  // Navigate to sign-up page
  await page.goto('/sign-up');
  
  // Verify we're on the sign-up page
  await expect(page.getByRole('heading', { name: /Cellar/i })).toBeVisible();
  
  // Fill out the sign-up form
  await page.getByLabel(/Name/i).fill(name);
  await page.getByLabel(/Email/i).fill(testEmail);
  await page.getByLabel(/Password/i).fill(password);
  
  // Submit the form
  await page.getByRole('button', { name: /Create Account/i }).click();
  
  // Wait for successful redirect to dashboard
  await page.waitForURL('/dashboard');
  await expect(page.getByRole('heading', { name: /Quick Actions/i })).toBeVisible();
  
  // Save the authentication state
  await page.context().storageState({ path: authFile });

  console.log(`✅ Authenticated as ${testEmail}`);

  // Note: We don't clean up the test user here because the auth state
  // is shared with other tests. The user must exist for the session to be valid.
  // In a real CI environment, you'd want to clean up test data after all tests complete.
});
