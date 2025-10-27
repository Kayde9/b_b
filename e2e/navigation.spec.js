const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for loading screen
  });

  test('should navigate to Schedule page', async ({ page }) => {
    await page.click('text=Schedule');
    await expect(page).toHaveURL('/schedule');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate to Gallery page', async ({ page }) => {
    await page.click('text=Gallery');
    await expect(page).toHaveURL('/gallery');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate to Contact page', async ({ page }) => {
    await page.click('text=Contact');
    await expect(page).toHaveURL('/contact');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate to Getting Here page', async ({ page }) => {
    await page.click('text=Getting Here');
    await expect(page).toHaveURL('/getting-here');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate back to home from other pages', async ({ page }) => {
    // Go to schedule
    await page.click('text=Schedule');
    await expect(page).toHaveURL('/schedule');
    
    // Click home
    await page.click('text=Home');
    await expect(page).toHaveURL('/');
  });

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/non-existent-page');
    await page.waitForTimeout(3000);
    
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page Not Found')).toBeVisible();
    
    // Click go home button
    await page.click('text=Go Home');
    await expect(page).toHaveURL('/');
  });
});
