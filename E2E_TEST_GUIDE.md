# 🎭 E2E Testing Guide - Inter-NMIMS Basketball Tournament

## Overview

This project uses **Playwright** for end-to-end testing to verify the application works correctly in real browsers, including testing 3D animations, maps, and user interactions.

---

## 📦 Installation

### Install Playwright
```bash
npm install --save-dev @playwright/test
npx playwright install
```

This will install Playwright and download browser binaries for Chromium, Firefox, and WebKit.

---

## 🚀 Running Tests

### Run All E2E Tests
```bash
npx playwright test
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Run Specific Test File
```bash
npx playwright test e2e/homepage.spec.js
```

### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Tests on Mobile Devices
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

---

## 📊 View Test Results

### Open HTML Report
```bash
npx playwright show-report
```

### Generate Report
```bash
npx playwright test --reporter=html
```

---

## 🧪 Test Suites

### 1. Homepage Tests (`e2e/homepage.spec.js`)
Tests the main landing page functionality:
- ✅ Page loads successfully
- ✅ Navigation menu displays
- ✅ 3D basketball animation renders
- ✅ Tournament information displays
- ✅ Footer is visible

### 2. Navigation Tests (`e2e/navigation.spec.js`)
Tests routing and navigation:
- ✅ Navigate to Schedule page
- ✅ Navigate to Gallery page
- ✅ Navigate to Contact page
- ✅ Navigate to Getting Here page
- ✅ Navigate back to home
- ✅ 404 page handling

### 3. Responsive Design Tests (`e2e/responsive.spec.js`)
Tests across different screen sizes:
- ✅ Mobile menu on small screens
- ✅ Tablet layout
- ✅ Desktop layout
- ✅ 3D animations on all sizes

### 4. Accessibility Tests (`e2e/accessibility.spec.js`)
Tests accessibility features:
- ✅ Heading hierarchy
- ✅ Image alt text
- ✅ Keyboard navigation
- ✅ Link text
- ✅ Color contrast

---

## 🎯 Test Coverage

### Pages Tested
- ✅ Home Page
- ✅ Schedule Page
- ✅ Gallery Page
- ✅ Contact Page
- ✅ Getting Here Page
- ✅ 404 Error Page

### Features Tested
- ✅ 3D Basketball Animations (Three.js)
- ✅ Navigation & Routing
- ✅ Responsive Design
- ✅ Loading Screen
- ✅ Footer & Header
- ✅ Accessibility

### Browsers Tested
- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome
- ✅ Mobile Safari

---

## 🔧 Configuration

The test configuration is in `playwright.config.js`:

```javascript
{
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  projects: ['chromium', 'firefox', 'webkit', 'Mobile Chrome', 'Mobile Safari'],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
  }
}
```

---

## 📝 Writing New Tests

### Basic Test Structure
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Common Playwright Commands

#### Navigation
```javascript
await page.goto('/schedule');
await page.goBack();
await page.reload();
```

#### Interactions
```javascript
await page.click('text=Schedule');
await page.fill('input[name="email"]', 'test@example.com');
await page.press('Enter');
```

#### Assertions
```javascript
await expect(page).toHaveURL('/schedule');
await expect(page.locator('h1')).toBeVisible();
await expect(page.locator('h1')).toHaveText('Schedule');
```

#### Waiting
```javascript
await page.waitForTimeout(3000);
await page.waitForSelector('canvas');
await page.waitForLoadState('networkidle');
```

---

## 🐛 Debugging Tests

### Debug Mode
```bash
npx playwright test --debug
```

### Trace Viewer
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Screenshots on Failure
Screenshots are automatically captured on test failure and saved in `test-results/`.

### Video Recording
Enable video recording in `playwright.config.js`:
```javascript
use: {
  video: 'on-first-retry',
}
```

---

## 🎨 Testing 3D Animations

### Three.js Canvas Testing
```javascript
test('should render 3D basketball', async ({ page }) => {
  await page.goto('/');
  
  // Wait for canvas to load
  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeVisible();
  
  // Check canvas has content
  const canvasSize = await canvas.boundingBox();
  expect(canvasSize.width).toBeGreaterThan(0);
  expect(canvasSize.height).toBeGreaterThan(0);
});
```

---

## 🗺️ Testing Maps

### Mapbox Testing
```javascript
test('should render interactive map', async ({ page }) => {
  await page.goto('/getting-here');
  
  // Wait for map container
  await page.waitForSelector('.mapboxgl-canvas');
  
  // Verify map is interactive
  const map = page.locator('.mapboxgl-canvas');
  await expect(map).toBeVisible();
});
```

---

## 📱 Mobile Testing

### Test on Specific Device
```javascript
test.use({ 
  ...devices['iPhone 12'] 
});

test('mobile test', async ({ page }) => {
  await page.goto('/');
  // Test mobile-specific features
});
```

---

## ⚡ Performance Testing

### Measure Page Load Time
```javascript
test('should load quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(5000); // 5 seconds
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📋 Best Practices

1. **Wait for Elements**: Always wait for elements before interacting
2. **Use Data Attributes**: Add `data-testid` for reliable selectors
3. **Test User Flows**: Test complete user journeys, not just pages
4. **Keep Tests Independent**: Each test should work standalone
5. **Use Page Objects**: Create reusable page object models
6. **Test Accessibility**: Include a11y tests in your suite
7. **Test Responsiveness**: Test on multiple screen sizes
8. **Handle Async**: Properly handle async operations and loading states

---

## 🎯 Next Steps

- [ ] Add visual regression testing with Percy or Chromatic
- [ ] Add performance benchmarks
- [ ] Test Firebase integration with emulator
- [ ] Add API testing for backend endpoints
- [ ] Implement continuous testing in CI/CD
- [ ] Add load testing with k6 or Artillery

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library](https://testing-library.com/)
- [Web Accessibility](https://www.w3.org/WAI/)

---

*Last Updated: October 24, 2025*  
*Project: Inter-NMIMS Basketball Tournament 2025*
