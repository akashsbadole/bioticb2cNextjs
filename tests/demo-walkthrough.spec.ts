import { test, expect } from '@playwright/test';

test.describe('Platform Demo Walkthrough', () => {
  test.setTimeout(180000);

  test('Walkthrough of key features', async ({ page }) => {
    // 1. Landing Page
    console.log("Showing Homepage...");
    await page.goto("/");
    await page.waitForTimeout(5000);

    // 2. Explore Catalogue
    console.log("Exploring Catalogue...");
    await page.goto("/catalogue");
    await page.waitForTimeout(5000);

    // 3. Admin Dashboard
    console.log("Navigating to Admin Panel...");
    await page.goto("/admin");
    await page.waitForTimeout(5000);

    console.log("Demo Walkthrough complete.");
  });
});
