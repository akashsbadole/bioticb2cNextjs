import { db } from './db';
import { sendEmail } from './email';
import { sendSms } from './sms';

const ABANDONED_THRESHOLD_HOURS = 2;

export interface AbandonedCart {
  id: string;
  storeId: string | null;
  userId: string | null;
  guestToken: string | null;
  email: string | null;
  phone: string | null;
  reminderSentAt: Date | null;
  updatedAt: Date;
  items: Array<{
    quantity: number;
    Product: { name: string; price: number } | null;
  }>;
  User: { name: string; email: string; phone: string | null } | null;
}

export type CartWithUser = AbandonedCart;

export async function findAbandonedCarts(opts: { onlyUnsent?: boolean; storeId?: string | null } = {}) {
  const threshold = new Date();
  threshold.setHours(threshold.getHours() - ABANDONED_THRESHOLD_HOURS);

  const where: Record<string, unknown> = {
    updatedAt: { lte: threshold },
    items: { some: {} },
  };
  if (opts.onlyUnsent) where.reminderSentAt = null;
  if (opts.storeId) where.storeId = opts.storeId;

  const carts = await db.cart.findMany({
    where,
    include: {
      User: { select: { name: true, email: true, phone: true } },
      items: { include: { Product: { select: { name: true, price: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Exclude carts whose logged-in owner already placed a later order.
  const result: CartWithUser[] = [];
  for (const cart of carts as CartWithUser[]) {
    if (cart.userId) {
      const laterOrder = await db.order.count({
        where: { userId: cart.userId, createdAt: { gt: cart.updatedAt } },
      });
      if (laterOrder > 0) continue;
    }
    result.push(cart);
  }
  return result;
}

export function cartTotal(cart: CartWithUser): number {
  return cart.items.reduce(
    (sum, i) => sum + (i.Product?.price || 0) * i.quantity,
    0,
  );
}

export function cartContact(cart: CartWithUser): { email: string | null; phone: string | null; name: string } {
  return {
    email: cart.User?.email || cart.email || null,
    phone: cart.User?.phone || cart.phone || null,
    name: cart.User?.name || 'there',
  };
}

interface ReminderResult {
  email: boolean;
  sms: boolean;
}

export async function sendAbandonedCartReminder(cart: CartWithUser): Promise<ReminderResult> {
  const siteName = (await db.siteSetting.findFirst({ where: { key: 'site_name' } }))?.value || 'Our Store';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { email, phone, name } = cartContact(cart);
  const total = cartTotal(cart);
  const itemCount = cart.items.reduce((n, i) => n + i.quantity, 0);
  const result: ReminderResult = { email: false, sms: false };

  if (email) {
    result.email = await sendEmail(
      email,
      `Did you forget something at ${siteName}?`,
      `
      <h2>Hi ${name},</h2>
      <p>You left <strong>${itemCount}</strong> item(s) worth <strong>${total.toLocaleString()}</strong> in your cart at ${siteName}.</p>
      <p>They're still reserved for you — complete your purchase before they're gone.</p>
      <p><a href="${siteUrl}/cart">Return to your cart</a></p>
      <p>If you have any questions, just reply to this email.</p>
      `,
    );
  }

  if (phone) {
    const smsRes = await sendSms(
      phone,
      `Hi ${name}, you left ${itemCount} item(s) in your ${siteName} cart. Complete your order here: ${siteUrl}/cart`,
    );
    result.sms = smsRes.success;
  }

  if (result.email || result.sms) {
    await db.cart.update({
      where: { id: cart.id },
      data: { reminderSentAt: new Date() },
    });
  }

  return result;
}
