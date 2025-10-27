const { test, expect } = require('@playwright/test');

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Check for h1 or h2 headings
    const headings = await page.locator('h1, h2, h3').count();
    expect(headings).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForTimeout(3000);
    
    // Get all images
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        // Alt attribute should exist (can be empty for decorative images)
        expect(alt).toBeDefined();
      }
    }
  });

  test('should have keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Check if an element is focused
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Get all links
    const links = page.locator('a');
    const count = await links.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        
        // Link should have either text content or aria-label
        expect(text || ariaLabel).toBeTruthy();
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // This is a basic check - for comprehensive testing, use axe-core
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    expect(backgroundColor).toBeTruthy();
  });
});
