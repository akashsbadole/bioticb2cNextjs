import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPayUHash } from '@/lib/payments/payu';

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
      await db.$transaction(async (tx) => {
        // 1. Update Order Status
        const order = await tx.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: 'paid',
                paymentId: data.mihpayid,
            },
            include: { items: true }
        });

        // 2. Decrement Stock
        for (const item of order.items) {
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
      });

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
