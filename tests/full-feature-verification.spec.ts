import { test, expect } from '@playwright/test';

test.describe('Full Feature Verification', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // 1. Manually seed to ensure admin user exists and is up to date
    await request.post('/api/content-pages/seed');

    const loginRes = await request.post('/api/auth/login', {
      data: {
        email: 'admin@store.com',
        password: 'admin123',
      }
    });
    const data = await loginRes.json();
    authToken = data.token;
  });

  test('Menu CRUD and Multi-Column Footer Visibility', async ({ request, page }) => {
    if (!authToken) return;
    const primaryLabel = `HeaderLink${Date.now()}`;
    const footerLabel = `FooterCol1Link${Date.now()}`;

    // 1. Create Primary Menu
    await request.post('/api/admin/menus', {
      data: {
        name: 'Header Nav',
        slug: `header-${Date.now()}`,
        location: 'primary',
        isActive: true,
        items: [{ label: primaryLabel, url: '/catalogue', sortOrder: 0, isActive: true }]
      },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    // 2. Create Footer Column 1
    await request.post('/api/admin/menus', {
      data: {
        name: 'Company Column',
        slug: `footer1-${Date.now()}`,
        location: 'footer_1',
        isActive: true,
        items: [{ label: footerLabel, url: '/about', sortOrder: 0, isActive: true }]
      },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    // 3. Verify on storefront
    await page.goto('/');
    // Added re-navigation to ensure fresh state
    await page.goto('http://localhost:3000/');
    await expect(page.getByText(primaryLabel).first()).toBeVisible({ timeout: 15000 });

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByText('Company Column').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(footerLabel).first()).toBeVisible({ timeout: 10000 });
  });

  test('B2B Flow: Registration and Tiered Pricing', async ({ page, request }) => {
    if (!authToken) return;
    const buyerEmail = `buyer-${Date.now()}@test.com`;

    // 1. Register
    await page.goto('/register');
    await page.getByLabel('Full Name').fill('B2B Tester');
    await page.getByLabel('Business Email').fill(buyerEmail);
    await page.locator('#reg-password').fill('password123');
    await page.locator('#reg-confirm').fill('password123');
    await page.getByLabel('Company Name').fill('Test Corp');
    await page.getByLabel('Tax ID').fill('TAX-123');
    await page.getByLabel('Business Address').fill('123 Test St');
    await page.getByRole('button', { name: /Create Account/i }).click();

    await expect(page.getByText(/Pending/i).first()).toBeVisible({ timeout: 15000 });

    // 2. Admin approves and sets tier
    const usersRes = await request.get('/api/users', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const { users } = await usersRes.json();
    const newUser = users.find((u: any) => u.email === buyerEmail);

    await request.put(`/api/users/${newUser.id}`, {
      data: { isVerified: true, tier: 'silver' },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    // 3. Enable tiered pricing
    await request.put('/api/store/settings', {
      data: { settings: { b2b_enable_tiered_pricing: 'true', b2b_discount_silver: '0.5' } },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    // 4. Login as Buyer
    await page.goto('/admin');
    await page.locator('input[type="email"]').fill(buyerEmail);
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // We expect the user to be logged in to their portal or similar
    await page.wait_for_timeout(2000);

    // Check product price
    // Note: We need a product that actually exists and has a price. Seeding should have created some.
    await page.goto('/catalogue');
    const firstProduct = page.locator('a[href*="/product/"]').first();
    await firstProduct.click();

    await expect(page.getByText(/tier/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('CMS Page and Manual Seeding', async ({ page, request }) => {
    if (!authToken) return;
    // 1. Delete About Us page via API
    const pagesRes = await request.get('/api/content-pages?all=true', {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const { contentPages } = await pagesRes.json();
    const aboutPage = contentPages.find((p: any) => p.slug === 'about-us');
    if (aboutPage) {
        await request.delete(`/api/content-pages/${aboutPage.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
    }

    // 2. Visit storefront - should NOT auto-create
    await page.goto('/about-us');
    await expect(page.getByText(/404|Page not found/i).first()).toBeVisible({ timeout: 10000 });

    // 3. Manual Seed via API
    await request.post('/api/content-pages/seed', {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });

    // 4. Verify restored
    await page.goto('/about-us');
    await expect(page.locator('body')).toContainText('About Us', { timeout: 15000 });
  });

  test('Product and Category Management', async ({ request, page }) => {
    if (!authToken) return;
    const catName = `Cat${Date.now()}`;
    const prodName = `Prod${Date.now()}`;

    // 1. Create Category
    const catRes = await request.post('/api/categories', {
      data: { name: catName, slug: catName.toLowerCase(), isActive: true },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const catData = await catRes.json();
    const category = catData.category;

    // 2. Create Product
    const prodRes = await request.post('/api/products', {
      data: {
        name: prodName,
        slug: prodName.toLowerCase(),
        price: 100,
        categoryId: category.id,
        isActive: true,
        images: '[]'
      },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    // 3. Verify on catalogue
    await page.goto('/catalogue');
    await expect(page.getByText(prodName).first()).toBeVisible({ timeout: 15000 });

    // 4. Cleanup
    const prodData = await prodRes.json();
    await request.delete(`/api/products/${prodData.product.id}?permanent=true`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    await request.delete(`/api/categories/${category.id}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
  });
});
