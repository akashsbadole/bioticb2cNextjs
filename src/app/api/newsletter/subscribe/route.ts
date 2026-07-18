import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendNewsletterConfirmation } from '@/lib/email';

const NEWSLETTER_RATE_LIMIT = { maxRequests: 10, windowMs: 15 * 60 * 1000, prefix: 'newsletter-subscribe' };

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, NEWSLETTER_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;

    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const subscriber = await db.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email, isActive: true },
    });

    sendNewsletterConfirmation({ email: subscriber.email }).catch(() => {
      console.error('Failed to send newsletter confirmation email');
    });

    return NextResponse.json({ success: true, subscriber });
  } catch (error) {
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
