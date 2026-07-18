/**
 * Application-wide constants to eliminate magic strings.
 * Use these instead of hardcoding status/role strings in code.
 */

// ─── Order Status ─────────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

// Ordered list used for tracking/progress display
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

// ─── Payment Status ──────────────────────────────────────────
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

// ─── User Roles ──────────────────────────────────────────────
export const USER_ROLE = {
  ADMIN: 'admin',
  CLERK: 'clerk',
  CUSTOMER: 'customer',
  BUYER: 'buyer',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_ROLE_VALUES = Object.values(USER_ROLE);

// ─── Store Plan ──────────────────────────────────────────────
export const STORE_PLAN = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export type StorePlan = (typeof STORE_PLAN)[keyof typeof STORE_PLAN];

export const STORE_PLAN_VALUES = Object.values(STORE_PLAN);

// ─── Activity / Event Types ──────────────────────────────────
export const ACTIVITY = {
  USER_LOGIN: 'user.login',
  USER_LOGIN_FAILED: 'user.login.failed',
  USER_LOGOUT: 'user.logout',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  PRODUCT_CREATE: 'product.create',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',
  PRODUCT_BULK: 'product.bulk',
  CATEGORY_CREATE: 'category.create',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',
  CATEGORY_BULK: 'category.bulk',
  BLOG_CREATE: 'blog.create',
  BLOG_UPDATE: 'blog.update',
  BLOG_DELETE: 'blog.delete',
  BLOG_BULK: 'blog.bulk',
  PAGE_CREATE: 'page.create',
  PAGE_UPDATE: 'page.update',
  PAGE_DELETE: 'page.delete',
  ORDER_CREATE: 'order.create',
  ORDER_UPDATE: 'order.update',
  ORDER_RETURN_REQUEST: 'order.return.request',
  BANNER_CREATE: 'banner.create',
  BANNER_UPDATE: 'banner.update',
  BANNER_DELETE: 'banner.delete',
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',
  REDIRECT_CREATE: 'redirect.create',
  REDIRECT_UPDATE: 'redirect.update',
  REDIRECT_DELETE: 'redirect.delete',
  SETTINGS_UPDATE: 'settings.update',
  BACKUP_EXPORT: 'backup.export',
  BACKUP_IMPORT: 'backup.import',
} as const;

export type ActivityType = (typeof ACTIVITY)[keyof typeof ACTIVITY];

export const ACTIVITY_VALUES = Object.values(ACTIVITY);

// ─── Payment Methods ─────────────────────────────────────────
export const PAYMENT_METHOD = {
  PAYU: 'payu',
  COD: 'cod',
  RAZORPAY: 'razorpay',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHOD);
