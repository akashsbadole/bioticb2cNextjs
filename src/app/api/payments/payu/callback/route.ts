import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPayUHash } from '@/lib/payments/payu';
import { sendOrderConfirmation } from '@/lib/email';
import { createNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const payuSalt = process.env.PAYU_MERCHANT_SALT || 'test_salt';
    const isValid = verifyPayUHash(data, payuSalt);

    if (!isValid) {
      console.error('Invalid PayU hash in callback');
      return NextResponse.redirect(new URL('/checkout?error=payment_verification_failed', request.url));
    }

    const orderId = data.txnid;
    const status = data.status; // success or failure

    if (status === 'success') {
      const order = await db.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid',
            paymentId: data.mihpayid,
          },
          include: { items: true }
        });

        for (const item of updated.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } }
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity }
              }
            });
          }
        }

        return updated;
      });

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
          paymentStatus: 'failed',
        },
      });
      return NextResponse.redirect(new URL(`/checkout?error=payment_failed&orderId=${orderId}`, request.url));
    }
  } catch (error) {
    console.error('PayU callback error:', error);
    return NextResponse.redirect(new URL('/checkout?error=callback_error', request.url));
  }
}
