import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEnquiryNotificationToAdmin, sendEnquiryConfirmation } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

// Max 10 contact form submissions per hour per IP
const CONTACT_RATE_LIMIT = { maxRequests: 10, windowMs: 60 * 60 * 1000, prefix: 'contact' };

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(request, CONTACT_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;
    const body = await request.json();
    const {
      name,
      email,
      phone,
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
      quantity,
      subject,
      message,
      productId,
      type,
    } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    // Look up product name if productId is provided
    let productName: string | undefined;
    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { name: true },
      });
      productName = product?.name;
    }

    const enquiry = await db.enquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        companyName: companyName || null,
        companyEmail: companyEmail || null,
        companyPhone: companyPhone || null,
        companyAddress: companyAddress || null,
        quantity: quantity ?? null,
        subject,
        message,
        productId: productId || null,
        type: type || 'contact',
        status: 'new',
      },
    });

    // Send emails — non-blocking, return success regardless of email delivery status
    try {
      await sendEnquiryNotificationToAdmin({
        name,
        email,
        phone: phone || undefined,
        companyName: companyName || undefined,
        companyEmail: companyEmail || undefined,
        companyPhone: companyPhone || undefined,
        companyAddress: companyAddress || undefined,
        quantity: quantity ?? undefined,
        subject,
        message,
        type: type || 'contact',
        productName,
      });
    } catch {
      console.log('Admin email notification failed, enquiry still saved');
    }

    try {
      await sendEnquiryConfirmation({
        name,
        email,
        subject,
        type: type || 'contact',
        productName,
      });
    } catch {
      console.log('Customer confirmation email failed, enquiry still saved');
    }

    return NextResponse.json(
      { enquiry, message: 'Your message has been sent successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
