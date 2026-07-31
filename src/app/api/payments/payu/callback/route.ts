import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPayUHash } from '@/lib/payments/payu';
import { sendOrderConfirmation } from '@/lib/email';
import { sendWhatsApp } from '@/lib/sms';
import { createNotification } from '@/lib/notifications';
import { PAYMENT_STATUS } from '@/lib/constants';
import { CACHE_TAGS, invalidateCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const saltSetting = await db.siteSetting.findFirst({
      where: { key: 'payu_merchant_salt' }
    });
    const payuSalt = (saltSetting && saltSetting.value) || process.env.PAYU_MERCHANT_SALT || 'test_salt';
    const isValid = verifyPayUHash(data, payuSalt);

    if (!isValid) {
      console.error('Invalid PayU hash in callback');
      return NextResponse.redirect(new URL('/checkout?error=payment_verification_failed', request.url));
    }

    const orderId = data.txnid;
    const status = data.status; // success or failure

    if (status === 'success') {
      // Guard against duplicate callbacks (PayU retries on network timeouts).
      // Only process if the order is still in unpaid state â€” if it's already
      // paid, skip straight to the success redirect without re-decrementing stock.
      const existingOrder = await db.order.findUnique({
        where: { id: orderId },
        select: { id: true, paymentStatus: true },
      });

      if (!existingOrder) {
        console.error(`PayU callback: order ${orderId} not found`);
        return NextResponse.redirect(new URL('/checkout?error=order_not_found', request.url));
      }

      if (existingOrder.paymentStatus === PAYMENT_STATUS.PAID) {
        // Already processed â€” idempotent redirect to success page
        console.warn(`PayU callback: duplicate callback for already-paid order ${orderId}, skipping`);
        return NextResponse.redirect(new URL(`/order-success/${orderId}`, request.url));
      }

      const order = await db.$transaction(async (tx) => {
        // Re-check inside the transaction to close the TOCTOU race window
        const locked = await tx.order.findUnique({
          where: { id: orderId },
          select: { paymentStatus: true },
        });

        if (!locked || locked.paymentStatus === PAYMENT_STATUS.PAID) {
          // Another request already committed â€” return null to signal skip
          return null;
        }

        const updated = await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: PAYMENT_STATUS.PAID,
            paymentId: data.mihpayid,
          },
          include: { items: true },
        });

        for (const item of updated.items) {
          if (item.variantId) {
            const reserved = await tx.productVariant.updateMany({
              where: { id: item.variantId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (reserved.count === 0) {
              throw new Error(`Insufficient stock for "${item.name}" (variant)`);
            }
          } else {
            const reserved = await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (reserved.count === 0) {
              throw new Error(`Insufficient stock for "${item.name}"`);
            }
          }
        }

        return updated;
      });

      // Null means the transaction detected a concurrent payment â€” still redirect to success
      if (!order) {
        return NextResponse.redirect(new URL(`/order-success/${orderId}`, request.url));
      }

      // Stock changed â€” invalidate storefront product caches.
      invalidateCache(CACHE_TAGS.products);
      for (const item of order.items) {
        if (item.productId) invalidateCache(CACHE_TAGS.product(item.productId));
      }

      try {
        await sendOrderConfirmation({
          id: order.id,
          customerName: order.customerName || 'Customer',
          customerEmail: order.customerEmail || '',
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod || 'payu',
          items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        });
      } catch {
        // Don't fail the callback if email fails
      }

      if (order.customerPhone) {
        sendWhatsApp(
          order.customerPhone,
          `Thank you for your order ${order.orderNumber || order.id.slice(0, 8)}! Your payment of â‚¹${order.totalAmount.toFixed(2)} has been received. We will notify you once it ships.`,
        ).catch(() => { });
      }

      try {
        await createNotification({
          title: 'New Order',
          message: `Order ${order.id.slice(0, 8)} received`,
          type: 'success',
          link: 'orders',
        });
      } catch {
        // ignore notification failures
      }

      return NextResponse.redirect(new URL(`/order-success/${orderId}`, request.url));
    } else {
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PAYMENT_STATUS.FAILED,
        },
      });
      return NextResponse.redirect(new URL(`/checkout?error=payment_failed&orderId=${orderId}`, request.url));
    }
  } catch (error) {
    console.error('PayU callback error:', error);
    return NextResponse.redirect(new URL('/checkout?error=callback_error', request.url));
  }
}
