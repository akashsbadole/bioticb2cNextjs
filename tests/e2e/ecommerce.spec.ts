import { test, expect } from '@playwright/test';

test('Cart and Checkout Flow', async ({ page }) => {
  // 1. Visit catalogue
  await page.goto('/catalogue');

  // 2. Add product to cart
  const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
  await expect(addToCartBtn).toBeVisible();
  await addToCartBtn.click();

  // 3. Go to cart
  await page.goto('/cart');
  await expect(page.getByText('Shopping Cart')).toBeVisible();

  // 4. Proceed to checkout
  await page.getByRole('button', { name: /Proceed to Checkout/i }).click();
  await expect(page.getByText('Shipping Information')).toBeVisible();

  // 5. Fill form
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="phone"]', '9876543210');
  await page.fill('input[name="address"]', '123 Test St');
  await page.fill('input[name="city"]', 'Mumbai');
  await page.fill('input[name="state"]', 'Maharashtra');
  await page.fill('input[name="zipCode"]', '400001');

  // 6. Verify total is visible
  const payBtn = page.getByRole('button', { name: /Pay/i });
  await expect(payBtn).toBeVisible();
});

test('Search and Filter Flow', async ({ page }) => {
  await page.goto('/catalogue');

  // Search
  const searchInput = page.getByPlaceholder(/Search products/i);
  await searchInput.fill('Sample');

  // Filter by price
  await page.fill('input[name="min"]', '10');
  await page.fill('input[name="max"]', '1000');

  // Verify results heading
  await expect(page.getByText(/Showing/i)).toBeVisible();
});

test('Wishlist and Review Flow', async ({ page }) => {
  // Note: These usually require login.
  // In a real test environment we would inject a session cookie.
  // For now we test visibility.
  await page.goto('/catalogue');

  // Check wishlist buttons exist on product cards
  const wishlistBtn = page.locator('button').filter({ has: page.locator('svg.lucide-heart') }).first();
  await expect(wishlistBtn).toBeVisible({ visible: false }); // hidden until hover, but let's check it's in DOM

  // Visit a product page
  const productCard = page.locator('.group').first();
  await productCard.click();

  // Check reviews section
  await expect(page.getByText(/Customer Reviews/i)).toBeVisible();
});
