import { test, expect } from "@playwright/test";

test.describe("Platform Production Readiness", () => {
  test.setTimeout(240000);

  test("Public Storefront Flow", async ({ page }) => {
    // 1. Landing Page
    console.log("Navigating to Homepage...");
    await page.goto("/");
    await expect(page).toHaveTitle(/Purva Bites/i);

    // 2. Catalogue Browsing
    console.log("Navigating to Catalogue...");
    // Attempt navigation via button if it exists
    const browseBtn = page
      .locator('button:has-text("Browse Catalogue")')
      .first();
    if (await browseBtn.isVisible()) {
      await browseBtn.click();
      await expect(page.getByText(/Product Catalogue/i)).toBeVisible();
    } else {
      await page.goto("/catalogue");
    }
  });

  test("Admin Authentication Page", async ({ page }) => {
    console.log("Checking Admin Login...");
    await page.goto("/admin");
    await expect(page.getByText(/Admin Login/i)).toBeVisible();
  });
});
