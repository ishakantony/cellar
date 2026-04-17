import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  test('redirects to sign-in when accessing dashboard while unauthenticated', async ({
    browser,
  }) => {
    // Create a fresh context without auth state
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    // Try to access dashboard without authentication
    await page.goto('/dashboard');

    // Should redirect to sign-in
    await expect(page).toHaveURL('/sign-in');
    await expect(page.getByRole('heading', { name: /Cellar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();

    await context.close();
  });

  test('redirects to sign-in when accessing collections while unauthenticated', async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('/collections');

    await expect(page).toHaveURL('/sign-in');
    await expect(page.getByRole('heading', { name: /Cellar/i })).toBeVisible();

    await context.close();
  });

  test('redirects to sign-in when accessing settings while unauthenticated', async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('/settings');

    await expect(page).toHaveURL('/sign-in');
    await expect(page.getByRole('heading', { name: /Cellar/i })).toBeVisible();

    await context.close();
  });

  test('authenticated user can access dashboard', async ({ page }) => {
    // This test uses the shared auth state from setup project
    await page.goto('/dashboard');

    // Should stay on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /Quick Actions/i })).toBeVisible();
  });

  test('authenticated user can access collections', async ({ page }) => {
    await page.goto('/collections');

    await expect(page).toHaveURL('/collections');
    await expect(page.getByRole('heading', { name: /Collections/i })).toBeVisible();
  });

  test('authenticated user can access settings', async ({ page }) => {
    await page.goto('/settings');

    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
  });
});
