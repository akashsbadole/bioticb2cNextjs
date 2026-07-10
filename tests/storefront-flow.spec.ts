import { test, expect } from './fixtures';

test.describe('Storefront data-flow', () => {
  const apiPaths = ['/api/products', '/api/categories', '/api/banners', '/api/blog', '/api/content-pages', '/api/settings/public'];

  for (const path of apiPaths) {
    test(`GET ${path} is reachable`, async ({ apiBase }) => {
      const res = await fetch(`${apiBase}${path}`);
      const data = await res.json();
      expect([200, 201]).toContain(res.status);
    });
  }

  test('GET /api/products returns list and is usable for cart/order tests', async ({ apiBase, adminToken, baseProductId }) => {
    const res = await fetch(`${apiBase}/api/products`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.products).toBeTruthy();
    if (baseProductId) {
      const found = (data.products || []).some((p: { id: string }) => p.id === baseProductId);
      expect(found).toBe(true);
    }
  });

  test('GET /api/products/[id] returns one product', async ({ apiBase, adminToken, baseProductId }) => {
    if (!baseProductId) {
      test.skip(true, 'No seeded product available');
      return;
    }
    const res = await fetch(`${apiBase}/api/products/${baseProductId}`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.product).toBeTruthy();
  });
});
