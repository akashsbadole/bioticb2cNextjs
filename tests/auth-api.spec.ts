import { test, expect } from './fixtures';

test.describe('Auth API', () => {
  test('POST /api/auth/login returns token on valid credentials', async ({ apiBase, adminToken }) => {
    expect(adminToken).toBeTruthy();
  });

  test('POST /api/auth/login returns 401 on bad credentials', async ({ apiBase }) => {
    const res = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@store.com', password: 'wrong' }),
    });
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBeTruthy();
  });

  test('POST /api/auth/register creates B2B buyer', async ({ apiBase }) => {
    const email = `buyer_${Date.now()}@example.com`;
    const res = await fetch(`${apiBase}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'API Buyer',
        email,
        password: 'password123',
        companyName: 'API Buyer Corp',
        taxId: 'TAX-999',
        address: '45 API Street',
      }),
    });
    const data = await res.json();
    expect([200, 201]).toContain(res.status);
  });

  test('POST /api/auth/register requires companyName', async ({ apiBase }) => {
    const res = await fetch(`${apiBase}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Bad', email: `bad${Date.now()}@example.com`, password: 'test1234' }),
    });
    const data = await res.json();
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test('GET /api/auth/me is protected', async ({ apiBase }) => {
    const res = await fetch(`${apiBase}/api/auth/me`, {
      headers: { authorization: 'Bearer invalid-token' },
    });
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBeTruthy();
  });

  test('GET /api/auth/me returns user with token', async ({ apiBase, adminToken }) => {
    const res = await fetch(`${apiBase}/api/auth/me`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.user).toBeTruthy();
    expect(data.user.email).toBe('admin@store.com');
  });

  test('POST /api/auth/logout succeeds', async ({ apiBase, adminToken }) => {
    const res = await fetch(`${apiBase}/api/auth/logout`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe('Logged out successfully');
  });

  test('POST /api/auth/change-password succeeds with valid token', async ({ apiBase, adminToken }) => {
    const res = await fetch(`${apiBase}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ currentPassword: 'admin123', newPassword: 'admin123456!' }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
