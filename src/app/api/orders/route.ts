import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { generatePayUHash, PAYU_CONFIG } from '@/lib/payments/payu';
import { requireAuth } from '@/lib/admin-auth';
import { sendOrderConfirmation } from '@/lib/email';
import { createNotification } from '@/lib/notifications';
import { checkRateLimit } from '@/lib/rate-limit';

const ORDER_RATE_LIMIT = { maxRequests: 10, windowMs: 60 * 60 * 1000, prefix: 'order-create' };

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1).max(999),
  })).min(1),
  customer: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    notes: z.string().max(2000).optional(),
    gstin: z.string().optional().nullable(),
  }),
  paymentMethod: z.enum(['payu', 'cod']),
  couponCode: z.string().optional(),
  shippingMethod: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, ORDER_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;

    const auth = await requireAuth(request).catch(() => ({ success: false } as const));
    const storeId = getStoreId(request);

    const body = await request.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { items, customer, paymentMethod, couponCode, shippingMethod } = parsed.data;

    // Validate request
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Fetch product data from DB to prevent price tampering
    const productIds = items.map((i: any) => i.productId);
    const variantIds = items.map((i: any) => i.variantId).filter(Boolean);

    const [dbProducts, dbVariants] = await Promise.all([
        db.product.findMany({ where: { id: { in: productIds } } }),
        db.productVariant.findMany({ where: { id: { in: variantIds as string[] } } })
    ]);

    const isAllDigital = dbProducts.every(p => p.isDigital);

    // Calculate totals on server
      let calculatedSubtotal = 0;
    const orderItemsData = items.map((item: any) => {
        const dbProduct = dbProducts.find(p => p.id === item.productId);
        if (!dbProduct) throw new Error(`Product ${item.productId} not found`);

        let price = dbProduct.price;
        if (item.variantId) {
            const variant = dbVariants.find(v => v.id === item.variantId);
            if (variant && variant.price) price = variant.price;
        }

        const total = price * item.quantity;
        calculatedSubtotal += total;

        return {
            productId: item.productId,
            variantId: item.variantId,
            name: dbProduct.name,
            sku: dbProduct.sku,
            hsnCode: dbProduct.hsnCode,
            quantity: item.quantity,
            price: price,
            total: total
        };
    });

    // Fetch store settings for GST and Shipping (fallback)
    const settings = await db.siteSetting.findMany({
        where: { storeId: storeId ? storeId : null }
    });
    const getSetting = (key: string) => settings.find(s => s.key === key)?.value;

    const gstRate = parseFloat(getSetting('tax_rate_gst') || '0');
    const shippingFixed = parseFloat(getSetting('shipping_fixed_cost') || '0');
    const freeShippingThreshold = parseFloat(getSetting('shipping_free_threshold') || '0');
    const codFee = parseFloat(getSetting('cod_fee') || '0');

    let discount = 0;

    // Apply coupon if provided
    if (couponCode) {
        const coupon = await db.coupon.findFirst({
            where: { storeId, code: couponCode.toUpperCase(), isActive: true }
        });
        if (coupon) {
            if (coupon.discountType === 'percentage') {
                discount = (calculatedSubtotal * coupon.discountValue) / 100;
            } else {
                discount = Math.min(coupon.discountValue, calculatedSubtotal);
            }
            // Increment usage
            await db.coupon.update({
                where: { id: coupon.id },
                data: { usageCount: { increment: 1 } }
            });
        }
    }

    // Per‑product tax computation (uses product.taxRate if set, else global gstRate)
    let taxAmount = 0;
    for (const od of orderItemsData as any[]) {
        const dbProduct = dbProducts.find(p => p.id === od.productId);
        const effectiveRate = dbProduct?.taxRate ?? gstRate;
        const proportion = calculatedSubtotal > 0 ? od.total / calculatedSubtotal : 0;
        const itemDiscount = discount * proportion;
        taxAmount += (od.total - itemDiscount) * (effectiveRate / 100);
    }

    // Shipping: use ShippingRate table if shippingMethod provided, else flat fallback
    let shippingAmount: number;
    if (isAllDigital) {
        shippingAmount = 0;
    } else if (shippingMethod) {
        const matchedRate = await db.shippingRate.findFirst({
            where: {
                storeId: storeId || null,
                name: shippingMethod,
                isActive: true,
                minSubtotal: { lte: calculatedSubtotal - discount },
                OR: [
                    { maxSubtotal: null },
                    { maxSubtotal: { gte: calculatedSubtotal - discount } },
                ],
            },
        });
        if (matchedRate) {
            shippingAmount =
                matchedRate.freeAbove != null && (calculatedSubtotal - discount) >= matchedRate.freeAbove
                    ? 0
                    : matchedRate.rate;
        } else {
            shippingAmount = shippingFixed;
        }
    } else {
        shippingAmount =
            (calculatedSubtotal - discount) >= freeShippingThreshold && freeShippingThreshold > 0
                ? 0
                : shippingFixed;
    }

    // COD convenience fee
    if (paymentMethod === 'cod' && codFee > 0) {
        shippingAmount = (shippingAmount || 0) + codFee;
    }

    const calculatedTotal = (calculatedSubtotal - discount) + taxAmount + shippingAmount;

    // Create order in transaction
    const order = await db.$transaction(async (tx) => {
      // 1. Create the order
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const newOrder = await tx.order.create({
        data: {
          storeId,
          userId: auth.success ? auth.payload.userId : null,
          orderNumber,
          totalAmount: calculatedTotal,
          subtotal: calculatedSubtotal,
          tax: taxAmount,
          shipping: shippingAmount,
          discount: discount,
          couponCode: couponCode || null,
          paymentMethod,
          paymentStatus: 'unpaid',
          status: 'pending',
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          shippingAddress: JSON.stringify({
            address: customer.address,
            city: customer.city,
            state: customer.state,
            zipCode: customer.zipCode,
          }),
          billingAddress: customer.gstin ? JSON.stringify({
            address: customer.address,
            city: customer.city,
            state: customer.state,
            zipCode: customer.zipCode,
          }) : null,
          gstin: customer.gstin || null,
          notes: customer.notes,
        },
      });

      // 2. Create order items
      await Promise.all(
        orderItemsData.map((itemData: any) =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              ...itemData
            },
          })
        )
      );

      return newOrder;
    });

    // Handle Payment Integration (PayU)
    if (paymentMethod === 'payu') {
       const payuKey = process.env.PAYU_MERCHANT_KEY;
       const payuSalt = process.env.PAYU_MERCHANT_SALT;
       if (!payuKey || !payuSalt) {
         return NextResponse.json(
           { error: 'Payment gateway not configured (PAYU_MERCHANT_KEY / PAYU_MERCHANT_SALT missing)' },
           { status: 500 },
         );
       }
        const isProd =
          process.env.PAYU_TEST_MODE === 'false' ||
          process.env.NODE_ENV === 'production';
       const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

       const paymentData = {
         key: payuKey,
         txnid: order.id,
         amount: order.totalAmount.toFixed(2),
         productinfo: `Order ${order.id}`,
          firstname: customer.name,
          email: customer.email,
          phone: customer.phone || '',
         surl: `${baseUrl}/api/payments/payu/callback`,
         furl: `${baseUrl}/api/payments/payu/callback`,
         salt: payuSalt,
       };

       const hash = generatePayUHash(paymentData);

        return NextResponse.json({
          orderId: order.id,
          paymentUrl: isProd ? PAYU_CONFIG.PROD_URL : PAYU_CONFIG.TEST_URL,
          paymentParams: {
            ...paymentData,
            hash,
            salt: undefined, // Don't send salt to client
          }
        });
     }

     try {
       await sendOrderConfirmation({
         id: order.id,
         customerName: customer.name,
         customerEmail: customer.email,
         totalAmount: order.totalAmount,
         paymentMethod: paymentMethod || 'cod',
         items: orderItemsData,
       });
     } catch {
       // Don't fail order creation if email fails
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

     return NextResponse.json({ orderId: order.id });
   } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
    try {
        const auth = await requireAuth(request);
        if (!auth.success) return auth.response;

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const body = await request.json();

        if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

        const order = await db.order.update({
            where: { id: orderId, userId: auth.payload.userId },
            data: {
                returnStatus: body.returnStatus || undefined,
            }
        });

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth(request);
        if (!auth.success) return auth.response;

        const storeId = getStoreId(request);
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (orderId) {
            const order = await db.order.findUnique({
                where: { id: orderId, userId: auth.payload.userId },
                include: { items: true }
            });
            return NextResponse.json({ order });
        }

        const orders = await db.order.findMany({
            where: { storeId, userId: auth.payload.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        Product: {
                            select: {
                                images: true,
                                slug: true,
                                isDigital: true,
                                downloadUrl: true,
                                hsnCode: true
                            }
                        }
                    }
                }
            }
        });
        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
