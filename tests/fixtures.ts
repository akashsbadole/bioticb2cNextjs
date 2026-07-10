/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

export type TestFixtures = {
  apiBase: string;
  adminToken: string;
  buyerToken: string;
  baseProductId: string;
  adminLogin: () => Promise<string>;
  resetPasswordToken: () => Promise<string>;
};

export async function loginAdmin(apiBase: string): Promise<string> {
  const res = await fetch(`${apiBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@store.com', password: 'admin123' }),
  });
  const data = (await res.json()) as { token?: string };
  return data.token || '';
}

export async function resolveProductId(apiBase: string, token: string): Promise<string> {
  const res = await fetch(`${apiBase}/api/products?limit=1&fields=id`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as { products?: { id: string }[] };
  return data?.products?.[0]?.id || '';
}

export async function resolveResetPasswordToken(apiBase: string): Promise<string> {
  const res = await fetch(`${apiBase}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@store.com' }),
  });

  const prisma = new PrismaClient();
  const row = await prisma.passwordResetToken.findFirst({
    where: { User: { email: 'admin@store.com' } },
    orderBy: { createdAt: 'desc' },
  });
  await prisma.$disconnect();

  const token = row?.usedAt ? null : row?.token ?? null;
  if (!token) {
    throw new Error('No usable PasswordResetToken found for admin@store.com');
  }
  return token;
}

export async function resetPassword(apiBase: string, token: string, password: string) {
  const res = await fetch(`${apiBase}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  return { status: res.status, body: await res.json() };
}

export const test = base.extend<TestFixtures>({
  apiBase: 'http://localhost:3000',

  adminToken: async ({ apiBase }, use) => {
    const token = await loginAdmin(apiBase);
    use(token);
  },

  buyerToken: async ({ apiBase }, use) => {
    const email = `buyer_${Date.now()}@example.com`;
    const res = await fetch(`${apiBase}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Buyer',
        email,
        password: 'password123',
        companyName: 'Buyer Corp',
        taxId: 'TAX-123',
        address: '123 Buyer St',
      }),
    });
    const data = (await res.json()) as { token?: string };
    use(data.token || '');
  },

  baseProductId: async ({ apiBase, adminToken }, use) => {
    const id = await resolveProductId(apiBase, adminToken);
    use(id);
  },

  adminLogin: async ({ apiBase }) => {
    return loginAdmin(apiBase);
  },

  resetPasswordToken: async ({ apiBase }) => {
    return resolveResetPasswordToken(apiBase);
  },
});
