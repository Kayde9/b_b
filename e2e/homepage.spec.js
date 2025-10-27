const { test, expect } = require('@playwright/test');

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for loading screen to disappear
    await page.waitForTimeout(3000);
    
    // Check for main heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Check for navigation links
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Schedule')).toBeVisible();
    await expect(page.getByText('Gallery')).toBeVisible();
  });

  test('should render 3D basketball animation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Check for canvas element (Three.js renders to canvas)
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should display tournament information', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Check for year 2025
    await expect(page.getByText(/2025/)).toBeVisible();
    
    // Check for NMIMS branding
    await expect(page.getByText(/NMIMS/i)).toBeVisible();
  });

  test('should have working footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer is visible
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
