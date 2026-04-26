import { test, expect } from '@playwright/test';
import { cleanupTestUser, generateTestEmail, TEST_USER_CREDENTIALS } from '../utils/db';

test.describe('Authentication Flows', () => {
  // Note: Tests in this file don't use the shared auth state
  // They test the actual UI flows end-to-end

  test('user can sign up with email and password', async ({ page }) => {
    const testEmail = generateTestEmail('signup');
    const { name, password } = TEST_USER_CREDENTIALS;

    // Clean up before test
    await cleanupTestUser(testEmail);

    await page.goto('/sign-up');

    // Verify sign-up page loaded
    await expect(page.getByRole('heading', { name: /Cellar/i })).toBeVisible();
    await expect(page.getByText(/Create your vault/i)).toBeVisible();

    // Fill the sign-up form
    await page.getByLabel(/Name/i).fill(name);
    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/Password/i).fill(password);

    // Submit the form
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /Dashboard Coming Soon/i })).toBeVisible();

    // Cleanup after test
    await cleanupTestUser(testEmail);
  });

  test('sign in shows error for invalid credentials', async ({ page }) => {
    await page.goto('/sign-in');

    // Fill with non-existent credentials
    // Use pressSequentially for email to work around WebKit + React controlled input issue
    await page.getByLabel(/Email/i).pressSequentially('nonexistent@example.com');
    await page.getByLabel(/Password/i).fill('WrongPassword123!');

    // Submit the form
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Should stay on sign-in page and show error
    await expect(page).toHaveURL('/sign-in');
    await expect(page.getByText(/Invalid/i).or(page.getByText(/incorrect/i))).toBeVisible();
  });
});
