import { db } from '@/lib/db';

type LogAction =
  | 'user.login' | 'user.logout' | 'user.create' | 'user.update' | 'user.delete'
  | 'product.create' | 'product.update' | 'product.delete' | 'product.bulk'
  | 'category.create' | 'category.update' | 'category.delete' | 'category.bulk'
  | 'blog.create' | 'blog.update' | 'blog.delete' | 'blog.bulk'
  | 'enquiry.update' | 'enquiry.delete'
  | 'page.create' | 'page.update' | 'page.delete'
  | 'banner.create' | 'banner.update' | 'banner.delete'
  | 'media.upload' | 'media.delete'
  | 'redirect.create' | 'redirect.update' | 'redirect.delete'
  | 'settings.update';

export async function logActivity(params: {
  action: LogAction;
  entity?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  userId?: string;
  userName?: string;
  ipAddress?: string;
}): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        action: params.action,
        entity: params.entity || null,
        entityId: params.entityId || null,
        details: params.details ? JSON.stringify(params.details) : null,
        userId: params.userId || null,
        userName: params.userName || null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    // Log activity should not break the main operation
    console.error('Failed to log activity:', error);
  }
}
