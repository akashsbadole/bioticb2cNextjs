import { test, expect } from '@playwright/test';

test.setTimeout(120000);

test.describe('Customer Account Flow', () => {
  test('Register, admin login, and customer sign-in', async ({ page }) => {
    // 1. Register a new customer on the storefront register page
    const customerEmail = `customer_${Date.now()}@example.com`;
    await page.goto('/register');
    await page.getByLabel('Full Name').fill('Test Customer');
    await page.getByLabel('Email').fill(customerEmail);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // New account should land on the account dashboard
    await expect(page).toHaveURL(/.*\/account/, { timeout: 15000 });
    await expect(page.getByText(/Welcome back, Test Customer/)).toBeVisible({ timeout: 15000 });

    // 2. Admin can log in to the admin panel
    await page.goto('/admin');
    await page.getByLabel('Email').fill('admin@store.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });
    await expect(page.getByText(/Dashboard|Overview|Analytics/i).first()).toBeVisible({ timeout: 15000 });

    // 3. Customer can sign out and sign back in
    await page.context().clearCookies();
    await page.goto('/login');
    await page.fill('input[id="email"]', customerEmail);
    await page.fill('input[id="password"]', 'Password123!');
    await page.getByRole('button', { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/.*\/account/, { timeout: 15000 });
    await expect(page.getByText(/Welcome back, Test Customer/)).toBeVisible({ timeout: 15000 });
  });

  test('Storefront shop renders with pricing', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.getByRole('heading', { name: /Shop/i }).first()).toBeVisible({ timeout: 15000 });
  });
});
