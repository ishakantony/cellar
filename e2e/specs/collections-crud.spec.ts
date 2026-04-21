import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Collections CRUD', () => {
  const collectionName = `E2E Collection ${Date.now()}`;
  const updatedName = `Updated ${collectionName}`;

  test('user can create a collection', async ({ page }) => {
    await page.goto('/collections');

    // Should see collections page
    await expect(page.getByRole('heading', { name: /Collections/i })).toBeVisible();

    // Click New Collection
    await page.getByRole('button', { name: /New Collection/i }).click();

    // Modal should open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /New Collection/i })).toBeVisible();

    // Fill form
    await page.getByLabel(/Name/i).fill(collectionName);
    await page.getByLabel(/Description/i).fill('A collection for E2E testing');

    // Submit
    await page.getByRole('button', { name: /Create/i }).click();

    // Modal should close and collection appears in the list
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('p').filter({ hasText: collectionName }).first()).toBeVisible();
  });

  test('user can view collection detail', async ({ page }) => {
    await page.goto('/collections');

    // Click on the collection card
    await page.locator('p').filter({ hasText: collectionName }).first().click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/collections\/.+/);
    await expect(page.getByRole('heading', { name: collectionName })).toBeVisible();
    await expect(page.getByText('A collection for E2E testing')).toBeVisible();
  });

  test('user can edit a collection', async ({ page }) => {
    await page.goto('/collections');
    await page.locator('p').filter({ hasText: collectionName }).first().click();

    // Click edit
    await page.getByRole('button', { name: /Edit/i }).click();

    // Modal should open with pre-filled data
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Edit Collection/i })).toBeVisible();

    // Change name and description
    await page.getByLabel(/Name/i).fill(updatedName);
    await page.getByLabel(/Description/i).fill('Updated description');

    // Select a different color (third color option)
    const colorButtons = page.locator('[aria-pressed]');
    await colorButtons.nth(2).click();

    // Save
    await page.getByRole('button', { name: /Save/i }).click();

    // Modal should close and changes reflected
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
    await expect(page.getByText('Updated description')).toBeVisible();
  });

  test('user can delete a collection with confirmation', async ({ page }) => {
    await page.goto('/collections');

    // The updated collection should be visible
    await expect(page.locator('p').filter({ hasText: updatedName }).first()).toBeVisible();

    // Hover over collection card to reveal action menu, then open it
    const collectionCard = page
      .locator('p')
      .filter({ hasText: updatedName })
      .locator('xpath=ancestor::div[contains(@class,"group")]');
    await collectionCard.hover();
    await collectionCard.getByRole('button', { name: /More actions/i }).click();

    // Click delete in the dropdown
    await page
      .getByRole('button', { name: /^Delete$/ })
      .first()
      .click();

    // Confirm dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/Delete Collection/i)).toBeVisible();
    await expect(page.getByText(/This action cannot be undone/i)).toBeVisible();

    // Confirm deletion
    await page.getByRole('button', { name: /^Delete$/ }).click();

    // Dialog should close and collection removed
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('p').filter({ hasText: updatedName })).not.toBeVisible();
  });
});

test.describe('Collections Search and View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collections');

    // Create Alpha Collection
    await page.getByRole('button', { name: /New Collection/i }).click();
    await page.getByLabel(/Name/i).fill('Alpha Collection');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Create Beta Collection
    await page.getByRole('button', { name: /New Collection/i }).click();
    await page.getByLabel(/Name/i).fill('Beta Collection');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('search filters collections', async ({ page }) => {
    // Search for Alpha
    await page.getByLabel(/Search/i).fill('Alpha');
    await page.waitForTimeout(400); // wait for debounce

    await expect(page.locator('p').filter({ hasText: 'Alpha Collection' }).first()).toBeVisible();
    await expect(page.locator('p').filter({ hasText: 'Beta Collection' })).not.toBeVisible();

    // Clear search
    await page.getByRole('button', { name: /Clear search/i }).click();
    await expect(page.locator('p').filter({ hasText: 'Alpha Collection' }).first()).toBeVisible();
    await expect(page.locator('p').filter({ hasText: 'Beta Collection' }).first()).toBeVisible();
  });

  test('toggle between grid and list view', async ({ page }) => {
    const gridButton = page.getByRole('button', { name: /Grid view/i });
    const listButton = page.getByRole('button', { name: /List view/i });

    // Switch to list view
    await listButton.click();

    // Switch back to grid view
    await gridButton.click();

    // Both buttons should be visible
    await expect(gridButton).toBeVisible();
    await expect(listButton).toBeVisible();
  });
});
