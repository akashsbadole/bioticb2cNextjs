import { test, expect } from './fixtures';

test.describe('Auth flows', () => {
  test('admin login succeeds with valid credentials', async ({ apiBase }) => {
    const res = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@store.com', password: 'admin123' }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.token).toBeTruthy();
  });

  test('admin login fails with invalid credentials', async ({ apiBase }) => {
    const res = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@store.com', password: 'wrong-password' }),
    });
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBeTruthy();
  });

  test('buyer registration creates pending account', async ({ apiBase }) => {
    const email = `buyer_${Date.now()}@example.com`;
    const res = await fetch(`${apiBase}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Queue Buyer',
        email,
        password: 'password123',
        companyName: 'Queue Corp',
        taxId: 'TAX-QUEUE',
        address: '1 Queue St',
      }),
    });
    const data = await res.json();
    expect([200, 201]).toContain(res.status);
    expect(data.user?.email).toBe(email);
  });

  test('forgot password always returns success', async ({ apiBase }) => {
    const res = await fetch(`${apiBase}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@store.com' }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test('reset password flow succeeds with valid token', async ({ apiBase }) => {
    await fetch(`${apiBase}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@store.com' }),
    });

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const row = await prisma.passwordResetToken.findFirst({
      where: { User: { email: 'admin@store.com' } },
      orderBy: { createdAt: 'desc' },
      select: { token: true },
    });
    await prisma.$disconnect();
    expect(row?.token).toBeTruthy();

    const res = await fetch(`${apiBase}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: row!.token, password: 'newAdminPass123!' }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test('logout clears sessions', async ({ apiBase }) => {
    const login = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@store.com', password: 'newAdminPass123!' }),
    });
    const loginData = await login.json();
    expect(login.status).toBe(200);
    expect(loginData.token).toBeTruthy();

    const res = await fetch(`${apiBase}/api/auth/logout`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${loginData.token}`,
      },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.message).toBe('Logged out successfully');
  });

  test('protected endpoint requires token', async ({ apiBase }) => {
    const res = await fetch(`${apiBase}/api/auth/me`, {
      headers: { authorization: 'Bearer invalid-token' },
    });
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBeTruthy();
  });

  test('token auth still works after password change', async ({ apiBase }) => {
    const fresh = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@store.com', password: 'newAdminPass123!' }),
    });
    const freshData = await fresh.json();
    expect(fresh.status).toBe(200);
    expect(freshData.token).toBeTruthy();

    const me = await fetch(`${apiBase}/api/auth/me`, {
      headers: { authorization: `Bearer ${freshData.token}` },
    });
    const meData = await me.json();
    expect(me.status).toBe(200);
    expect(meData.user).toBeTruthy();
  });
});
