import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim() || email;
    const role = (public_metadata?.role as string) || 'clerk';

    if (!email) {
      return new Response('Error occured -- no email address', {
        status: 400,
      });
    }

    try {
      await db.user.upsert({
        where: { email },
        update: {
          clerkId: id,
          name,
          role,
        },
        create: {
          clerkId: id,
          email,
          name,
          role,
          // Since it's Clerk auth, we don't need a password
          password: '',
        },
      });
    } catch (error) {
      console.error('Error upserting user:', error);
      return new Response('Error occured during database sync', {
        status: 500,
      });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    try {
      await db.user.updateMany({
        where: { clerkId: id },
        data: { isActive: false },
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error occured during database sync', {
        status: 500,
      });
    }
  }

  return new Response('', { status: 200 });
}
