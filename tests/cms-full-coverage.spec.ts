import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('CMS Comprehensive CRUD Coverage', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login to get token
    // We use workers=1 to avoid 429 rate limit errors on the login endpoint
    const loginRes = await request.post('/api/auth/login', {
      data: {
        email: 'admin@store.com',
        password: 'admin123',
      }
    });
    expect(loginRes.status(), 'Login should be successful').toBe(200);
    const data = await loginRes.json();
    authToken = data.token;
    expect(authToken).toBeDefined();
  });

  test('Products CRUD', async ({ request }) => {
    const slug = `test-product-${Date.now()}`;

    // 1. Create
    const createRes = await request.post('/api/products', {
      data: {
        name: 'Test Playwright Product',
        slug: slug,
        price: 99.99,
        wholesalePrice: 79.99,
        minOrderQty: 10,
        isActive: true,
        images: '[]',
      },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(createRes.status()).toBe(201);
    const { product } = await createRes.json();

    // 2. Read
    const getRes = await request.get(`/api/products/${product.id}`);
    expect(getRes.status()).toBe(200);

    // 3. Update
    const updateRes = await request.put(`/api/products/${product.id}`, {
      data: { name: 'Updated Product Name', price: 109.99 },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(updateRes.status()).toBe(200);

    // 4. Delete
    const delRes = await request.delete(`/api/products/${product.id}?permanent=true`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(delRes.status()).toBe(200);
  });

  test('Categories CRUD', async ({ request }) => {
    const slug = `cat-${Date.now()}`;

    // Create
    const create = await request.post('/api/categories', {
      data: { name: 'Test Category', slug, isActive: true },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(create.status()).toBe(201);
    const { category } = await create.json();

    // Update
    const update = await request.put(`/api/categories/${category.id}`, {
      data: { name: 'Updated Category' },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(update.status()).toBe(200);

    // Delete
    const del = await request.delete(`/api/categories/${category.id}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(del.status()).toBe(200);
  });

  test('Blog Posts CRUD', async ({ request }) => {
    const slug = `blog-${Date.now()}`;

    // Create
    const create = await request.post('/api/blog', {
      data: { title: 'Test Blog', slug, content: '[]', isPublished: true },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(create.status()).toBe(201);
    const { blogPost } = await create.json();

    // Update
    const update = await request.put(`/api/blog/${blogPost.id}`, {
      data: { title: 'Updated Blog' },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(update.status()).toBe(200);

    // Delete
    const del = await request.delete(`/api/blog/${blogPost.id}?permanent=true`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(del.status()).toBe(200);
  });

  test('Content Pages CRUD', async ({ request }) => {
    const slug = `page-${Date.now()}`;

    // Create
    const create = await request.post('/api/content-pages', {
      data: { title: 'Test Page', slug, content: '[]', isActive: true },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(create.status()).toBe(201);
    const { contentPage } = await create.json();

    // Update
    const update = await request.put(`/api/content-pages/${contentPage.id}`, {
      data: { title: 'Updated Page' },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(update.status()).toBe(200);

    // Delete
    const del = await request.delete(`/api/content-pages/${contentPage.id}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(del.status()).toBe(200);
  });

  test('Banners CRUD', async ({ request }) => {
    // Create
    const create = await request.post('/api/banners', {
      data: { title: 'Test Banner', subtitle: 'Sub', isActive: true },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(create.status()).toBe(201);
    const { banner } = await create.json();

    // Update
    const update = await request.put(`/api/banners/${banner.id}`, {
      data: { title: 'Updated Banner' },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(update.status()).toBe(200);

    // Delete
    const del = await request.delete(`/api/banners/${banner.id}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(del.status()).toBe(200);
  });
});
