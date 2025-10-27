const { test, expect } = require('@playwright/test');

test.describe('Responsive Design', () => {
  test('should display mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Mobile menu button should be visible
    const menuButton = page.locator('button').first();
    await expect(menuButton).toBeVisible();
  });

  test('should work on tablet size', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should work on desktop size', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should render 3D animations on all screen sizes', async ({ page }) => {
    const sizes = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();
    }
  });
});
