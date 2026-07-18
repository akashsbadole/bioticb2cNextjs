import { z } from 'zod';

// Password policy (audit 6.4): minimum 12 chars with at least one uppercase
// letter, one lowercase letter, one digit, and one symbol.
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain a symbol');

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  description: z.string().optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  price: z.number().positive('Price must be positive'),
  comparePrice: z.number().positive().optional().nullable(),
  sku: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  hsnCode: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  specifications: z.string().optional().nullable(),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  customSchema: z.string().optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  customSchema: z.string().optional().nullable(),

  // Category page fields
  heroTitle: z.string().optional().nullable(),
  heroSubtitle: z.string().optional().nullable(),
  heroDescription: z.string().optional().nullable(),
  contentSplitImage: z.string().optional().nullable(),
  contentSplitHeading: z.string().optional().nullable(),
  contentSplitParagraph: z.string().optional().nullable(),
  contentSplitBullets: z.string().optional().nullable().default('[]'),
  cardsTitle: z.string().optional().nullable(),
  cardsProductIds: z.string().optional().nullable().default('[]'),
  cardsMaxCount: z.number().int().optional().nullable().default(8),
  cardsColumns: z.number().int().optional().nullable().default(4),
  ctaHeading: z.string().optional().nullable(),
  ctaDescription: z.string().optional().nullable(),
  ctaBulkText: z.string().optional().nullable(),
  ctaBulkLink: z.string().optional().nullable(),
  ctaPrivateLabelText: z.string().optional().nullable(),
  ctaPrivateLabelLink: z.string().optional().nullable(),
  ctaBackgroundColor: z.string().optional().nullable(),
  processTitle: z.string().optional().nullable(),
  processSubtitle: z.string().optional().nullable(),
  processSteps: z.string().optional().nullable().default('[]'),
  infographicImage: z.string().optional().nullable(),
  infographicCaption: z.string().optional().nullable(),
  infographicAltText: z.string().optional().nullable(),

  // Gallery fields
  galleryTitle: z.string().optional().nullable(),
  galleryImages: z.string().optional().nullable().default('[]'),

  // FAQ fields
  faqTitle: z.string().optional().nullable(),
  faqItems: z.string().optional().nullable().default('[]'),
});

export const userCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  password: passwordSchema,
  role: z.enum(['admin', 'editor', 'customer']).default('customer'),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'editor', 'customer']).optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  password: passwordSchema.optional(),
  bio: z.string().max(2000).optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export const contentPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: z.string().default(''),
  blocks: z.union([z.string(), z.array(z.any())]).transform(val =>
    typeof val === 'string' ? val : JSON.stringify(val)
  ).default('[]'),
  heroImage: z.string().optional().nullable(),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  customSchema: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().optional().default(''),
  coverImage: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  blocks: z.union([z.string(), z.array(z.any())]).transform(val =>
    typeof val === 'string' ? val : JSON.stringify(val)
  ).default('[]'),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  customSchema: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
});

export const newsletterSubscribeSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const returnRequestSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z.string().max(1000).optional().nullable(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(2000, 'Comment is too long').optional().nullable(),
});

export const brandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  image: z.string().optional().nullable(),
});

export const redirectSchema = z.object({
  from: z.string().min(1, 'From path is required').max(500),
  to: z.string().min(1, 'To path is required').max(500),
  type: z.enum(['301', '302', '307', '308']).optional().default('301'),
  isActive: z.boolean().optional().default(true),
});

export const redirectUpdateSchema = z.object({
  from: z.string().min(1).max(500).optional(),
  to: z.string().min(1).max(500).optional(),
  type: z.enum(['301', '302', '307', '308']).optional(),
  isActive: z.boolean().optional(),
});

export const mediaUpdateSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  alt: z.string().max(500).optional(),
  folder: z.string().max(200).optional(),
});

export const folderCreateSchema = z.object({
  folder: z.string().min(1, 'Folder name is required').max(200),
});
