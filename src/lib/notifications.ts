import { db } from '@/lib/db';

export async function createNotification(params: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  userId?: string | null; // null = broadcast
  link?: string;
}): Promise<void> {
  try {
    await db.notification.create({
      data: {
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        userId: params.userId ?? null,
        link: params.link || null,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
