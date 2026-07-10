import { test, expect } from '@playwright/test';

test.setTimeout(120000);

test('B2B Security and Pricing Verification', async ({ page }) => {
    // 1. Register a new B2B buyer
    console.log("Registering a new buyer...");
    await page.goto("http://localhost:3000/register");
    const buyerEmail = `buyer_${Date.now()}@example.com`;
    await page.getByLabel("Full Name").fill("Test Buyer");
    await page.getByLabel("Business Email").fill(buyerEmail);
    await page.locator('#reg-password').fill("password123");
    await page.locator('#reg-confirm').fill("password123");
    await page.getByLabel("Company Name").fill("Buyer Corp");
    await page.getByLabel("Tax ID").fill("TAX-123");
    await page.getByLabel("Business Address").fill("123 Buyer St");
    await page.getByRole("button", { name: "Create Partner Account" }).click();

    await expect(page.getByText("Registration Pending")).toBeVisible();

    // 2. Login as Admin first to verify the buyer (simulating normal flow)
    console.log("Logging in as admin to verify buyer...");
    await page.goto("http://localhost:3000/admin");
    await page.waitForSelector('#admin-email');
    await page.locator('#admin-email').fill("admin@store.com");
    await page.locator('#admin-password').fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Dashboard")).toBeVisible();

    // Set Silver discount to 50%
    await page.locator('button:has-text("Settings")').first().click();
    await page.locator('#discount-silver').fill("50");
    await page.getByLabel("Enable Tiered Pricing").check(); // Ensure it's enabled
    await page.getByRole("button", { name: "Save Settings" }).click();
    await expect(page.getByText("Settings saved successfully")).toBeVisible();

    // Verify buyer and set tier
    await page.locator('button:has-text("Users")').first().click();
    await page.waitForSelector('table');
    await page.getByRole("row", { name: buyerEmail }).getByRole("button", { name: "Pencil" }).click();
    await page.getByLabel("B2B Pricing Tier").click();
    await page.getByRole("option", { name: "Silver" }).click();
    await page.getByLabel("Verified Business Partner").click();
    await page.getByRole("button", { name: "Update User" }).click();
    await expect(page.getByText("User updated")).toBeVisible();

    // Logout
    await page.getByRole("button", { name: "Log Out" }).click();

    // 3. Login as Buyer
    console.log("Logging in as verified buyer...");
    await page.goto("http://localhost:3000/admin");
    await page.waitForSelector('#admin-email');
    await page.locator('#admin-email').fill(buyerEmail);
    await page.locator('#admin-password').fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();

    // After login, buyer should be at home or portal
    await page.goto("http://localhost:3000/portal");
    await expect(page.getByText("Buyer Portal")).toBeVisible();

    // 4. Test Security: Attempt to access all companies
    console.log("Testing security: Buyer attempting to list companies...");
    const companiesRes = await page.evaluate(async () => {
        const storage = localStorage.getItem('app-storage');
        const token = storage ? JSON.parse(storage).state.auth.token : '';
        const res = await fetch('/api/companies', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return { status: res.status };
    });
    console.log(`List Companies Status: ${companiesRes.status}`);
    expect(companiesRes.status).toBe(403);

    // 5. Verify Pricing
    console.log("Checking price as Silver Buyer...");
    await page.goto("http://localhost:3000/catalogue");
    await page.waitForSelector('.grid > div');
    await page.locator('.grid > div').first().click();
    await expect(page.getByText("Exclusive silver tier price applied")).toBeVisible();

    console.log("All security and pricing checks passed!");
});
