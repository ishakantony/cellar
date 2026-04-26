import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Assets CRUD', () => {
  const assetTitle = `E2E Asset ${Date.now()}`;
  const updatedTitle = `Updated ${assetTitle}`;

  test('user can create a note asset', async ({ page }) => {
    await page.goto('/assets/new');

    // Should see create page
    await expect(page.getByRole('heading', { name: /New Asset/i })).toBeVisible();

    // Select Note type
    await page.getByRole('button', { name: /Note/i }).click();

    // Fill form
    await page.getByPlaceholder(/Asset title/i).fill(assetTitle);
    await page.getByPlaceholder(/Optional description/i).fill('An E2E test note');

    // Submit
    await page.getByRole('button', { name: /Create/i }).click();

    // Should redirect to detail page
    await expect(page).toHaveURL(/\/assets\/.+/);
    await expect(page.getByRole('heading', { name: assetTitle })).toBeVisible();
  });

  test('user can view asset detail', async ({ page }) => {
    await page.goto('/assets');

    // Click on the asset card
    await page.locator('h4').filter({ hasText: assetTitle }).first().click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/assets\/.+/);
    await expect(page.getByRole('heading', { name: assetTitle })).toBeVisible();
  });

  test('user can edit an asset', async ({ page }) => {
    await page.goto('/assets');
    await page.locator('h4').filter({ hasText: assetTitle }).first().click();

    // Click edit
    await page.getByRole('button', { name: /Edit/i }).click();

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/assets\/.+\/edit/);
    await expect(page.getByRole('heading', { name: /Edit Asset/i })).toBeVisible();

    // Change title
    await page.getByPlaceholder(/Asset title/i).fill(updatedTitle);

    // Save
    await page.getByRole('button', { name: /Save/i }).click();

    // Should redirect to detail page with updated title
    await expect(page).toHaveURL(/\/assets\/.+/);
    await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible();
  });

  test('user can delete an asset with confirmation', async ({ page }) => {
    await page.goto('/assets');

    // The updated asset should be visible
    await expect(page.locator('h4').filter({ hasText: updatedTitle }).first()).toBeVisible();

    // Click on asset to go to detail
    await page.locator('h4').filter({ hasText: updatedTitle }).first().click();

    // Click delete
    await page.getByRole('button', { name: /Delete/i }).click();

    // Confirm dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/Delete Asset/i)).toBeVisible();
    await expect(page.getByText(/This action cannot be undone/i)).toBeVisible();

    // Confirm deletion
    await page.getByRole('button', { name: /^Delete$/ }).click();

    // Should redirect to assets list
    await expect(page).toHaveURL('/assets');
    await expect(page.locator('h4').filter({ hasText: updatedTitle })).not.toBeVisible();
  });
});

test.describe('Assets Search, Filter and View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assets/new');

    // Create Alpha Snippet
    await page.getByRole('button', { name: /Snippet/i }).click();
    await page.getByPlaceholder(/Asset title/i).fill('Alpha Snippet');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page).toHaveURL(/\/assets\/.+/);

    // Create Beta Note
    await page.goto('/assets/new');
    await page.getByRole('button', { name: /Note/i }).click();
    await page.getByPlaceholder(/Asset title/i).fill('Beta Note');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page).toHaveURL(/\/assets\/.+/);
  });

  test('search filters assets', async ({ page }) => {
    await page.goto('/assets');

    // Search for Alpha
    await page.getByPlaceholder(/Search assets/i).fill('Alpha');
    await page.waitForTimeout(400);

    await expect(page.locator('h4').filter({ hasText: 'Alpha Snippet' }).first()).toBeVisible();
    await expect(page.locator('h4').filter({ hasText: 'Beta Note' })).not.toBeVisible();
  });

  test('filter by type', async ({ page }) => {
    await page.goto('/assets');

    // Click Note tab
    await page.getByRole('button', { name: /^Note$/ }).click();

    await expect(page.locator('h4').filter({ hasText: 'Beta Note' }).first()).toBeVisible();
    await expect(page.locator('h4').filter({ hasText: 'Alpha Snippet' })).not.toBeVisible();
  });

  test('sort assets', async ({ page }) => {
    await page.goto('/assets');

    // Change sort to A-Z
    await page.getByRole('combobox').selectOption('A-Z');
    await page.waitForTimeout(300);

    // Both should still be visible
    await expect(page.locator('h4').filter({ hasText: 'Alpha Snippet' }).first()).toBeVisible();
    await expect(page.locator('h4').filter({ hasText: 'Beta Note' }).first()).toBeVisible();
  });

  test('toggle between grid and list view', async ({ page }) => {
    await page.goto('/assets');

    const gridButton = page.getByRole('button', { name: /Grid view/i });
    const listButton = page.getByRole('button', { name: /List view/i });

    await listButton.click();
    await gridButton.click();

    await expect(gridButton).toBeVisible();
    await expect(listButton).toBeVisible();
  });
});
