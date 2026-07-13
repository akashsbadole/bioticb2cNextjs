import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

test.describe('Customer Login Features', () => {
  test.beforeAll(async () => {
    // Ensure test customer user has a phone number and is active with correct password ('customer123')
    const prisma = new PrismaClient();
    // Pre-computed bcryptjs hash for 'customer123'
    const customerPasswordHash = '$2b$10$9XLBxWY0N3M2VZ9JS2X.uOjx3G6rBjCg.8ICC85FgFGcMP9ZvNz3m';
    await prisma.user.upsert({
      where: { email: 'customer@store.com' },
      update: {
        name: 'Test Customer',
        phone: '+1234567890',
        isActive: true,
        password: customerPasswordHash,
      },
      create: {
        email: 'customer@store.com',
        name: 'Test Customer',
        password: customerPasswordHash,
        phone: '+1234567890',
        role: 'customer',
        isActive: true,
        isVerified: true,
      },
    });
    await prisma.$disconnect();
  });

  test('Header Account Icon redirects to Login when unauthenticated', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.goto('/');

    // Click account button
    const accountBtn = page.getByLabel('Account');
    await expect(accountBtn).toBeVisible();
    await accountBtn.click();

    // Verify redirects to /login page
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('Login with credentials', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.goto('/login');

    // Fill credentials
    await page.fill('input[id="email"]', 'customer@store.com');
    await page.fill('input[id="password"]', 'customer123');

    // Submit
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Verify redirected to account page
    await expect(page).toHaveURL(/.*\/account/);
    await expect(page.getByText(/Welcome back, Test Customer/)).toBeVisible({ timeout: 15000 });
  });

  test('Login with email OTP', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.goto('/login');

    // Click OTP Tab
    await page.getByRole('button', { name: 'OTP' }).click();

    // Fill email
    await page.fill('input[id="email"]', 'customer@store.com');

    // Capture request-otp response to retrieve devCode
    const otpResponsePromise = page.waitForResponse('**/api/account/request-otp');
    await page.getByRole('button', { name: 'Send code' }).click();

    const otpResponse = await otpResponsePromise;
    expect(otpResponse.status()).toBe(200);
    const body = await otpResponse.json();
    expect(body.success).toBe(true);
    const otpCode = body.devCode;
    expect(otpCode).toBeTruthy();

    // Fill OTP code
    await page.fill('input[id="code"]', otpCode);

    // Submit OTP verification
    await page.getByRole('button', { name: 'Verify & Sign In' }).click();

    // Verify redirected to account page
    await expect(page).toHaveURL(/.*\/account/);
    await expect(page.getByText(/Welcome back, Test Customer/)).toBeVisible({ timeout: 15000 });
  });

  test('Login with SMS OTP', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.goto('/login');

    // Click OTP Tab
    await page.getByRole('button', { name: 'OTP' }).click();

    // Select SMS channel
    await page.getByRole('button', { name: 'SMS', exact: true }).click();

    // Fill email
    await page.fill('input[id="email"]', 'customer@store.com');

    // Capture request-otp response to retrieve devCode
    const otpResponsePromise = page.waitForResponse('**/api/account/request-otp');
    await page.getByRole('button', { name: 'Send code' }).click();

    const otpResponse = await otpResponsePromise;
    expect(otpResponse.status()).toBe(200);
    const body = await otpResponse.json();
    expect(body.success).toBe(true);
    const otpCode = body.devCode;
    expect(otpCode).toBeTruthy();

    // Fill OTP code
    await page.fill('input[id="code"]', otpCode);

    // Submit OTP verification
    await page.getByRole('button', { name: 'Verify & Sign In' }).click();

    // Verify redirected to account page
    await expect(page).toHaveURL(/.*\/account/);
    await expect(page.getByText(/Welcome back, Test Customer/)).toBeVisible({ timeout: 15000 });
  });
});
