import { NextResponse } from 'next/server';

/**
 * Minimal OpenAPI 3.0 document describing the public + admin REST surface.
 * Served at GET /api/docs (raw JSON) and GET /api/docs?format=swagger-ui
 * returns a minimal HTML viewer. Generated manually (audit 9.1) — keep in sync
 * with route handlers as the API evolves.
 */
const openApiDoc = {
  openapi: '3.0.3',
  info: {
    title: 'WCommerce Catalogue API',
    version: '1.1.0',
    description:
      'Single-store B2B/B2C e-commerce catalogue API. Auth via JWT bearer token (admin) or httpOnly cookie.',
  },
  servers: [{ url: '/', description: 'This server' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'auth_token' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          details: { type: 'object', additionalProperties: true },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
          nextCursor: { type: 'string', nullable: true },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/api/products': {
      get: {
        summary: 'List products (cursor or page pagination, limit capped at 100)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated product list' },
          500: { $ref: '#/components/schemas/Error' },
        },
      },
      post: {
        summary: 'Create a product (admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Created' },
          400: { $ref: '#/components/schemas/Error' },
          401: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '/api/products/{id}': {
      get: { summary: 'Get a product by id', responses: { 200: { description: 'Product' }, 404: { $ref: '#/components/schemas/Error' } } },
      put: { summary: 'Update a product (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Updated' } } },
      delete: { summary: 'Delete a product (admin, soft)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/categories': {
      get: {
        summary: 'List categories (optional ?limit capped at 100)',
        responses: { 200: { description: 'Category list' } },
      },
      post: { summary: 'Create a category (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/api/blog': {
      get: {
        summary: 'List blog posts (cursor or page pagination, limit capped at 100)',
        responses: { 200: { description: 'Paginated blog list' } },
      },
      post: { summary: 'Create a blog post (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/api/blog/{id}': {
      get: { summary: 'Get a blog post by id', responses: { 200: { description: 'Blog post' } } },
      put: { summary: 'Update a blog post (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Updated' } } },
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate and receive a JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } },
        },
        responses: {
          200: { description: 'Token + user' },
          401: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '/api/auth/register': {
      post: { summary: 'Register a new customer account', responses: { 201: { description: 'Created' }, 400: { $ref: '#/components/schemas/Error' } } },
    },
    '/api/auth/me': { get: { summary: 'Current authenticated user', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'User' } } } },
    '/api/auth/logout': { post: { summary: 'Logout (revokes JWT session)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Logged out' } } } },
    '/api/auth/change-password': { post: { summary: 'Change password (authenticated)', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Changed' } } } },
    '/api/auth/send-verification': { post: { summary: 'Send email verification link', responses: { 200: { description: 'Sent' } } } },
    '/api/auth/verify-email': { get: { summary: 'Verify email with token', responses: { 200: { description: 'Verified' } } } },
    '/api/auth/forgot-password': { post: { summary: 'Request a password reset', responses: { 200: { description: 'Reset email queued' } } } },
    '/api/auth/reset-password': { post: { summary: 'Reset password with token', responses: { 200: { description: 'Reset' } } } },
    '/api/orders': {
      get: { summary: 'List orders (admin) or own orders (customer)', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Orders' } } },
      post: { summary: 'Create an order (stock-validated; COD or PayU payment)', responses: { 200: { description: 'Order created' } } },
      put: { summary: 'Update order status (customer-facing fields)', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Updated' } } },
    },
    '/api/orders/{id}/invoice': { get: { summary: 'Download order invoice (PDF)', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'PDF' } } } },
    '/api/admin/orders/{id}': { put: { summary: 'Update order status/tracking (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Updated' } } } },
    '/api/payments/payu/callback': { post: { summary: 'PayU payment webhook (hash-verified, stock-guarded)', responses: { 200: { description: 'Acknowledged' } } } },
    '/api/account/cart/sync': { post: { summary: 'Sync cart with stock validation', responses: { 200: { description: 'Synced cart' } } } },
    '/api/contact': { post: { summary: 'Submit a contact/enquiry form (sanitized)', responses: { 200: { description: 'Received' } } } },
    '/api/newsletter/subscribe': { post: { summary: 'Subscribe to newsletter', responses: { 200: { description: 'Subscribed' } } } },
    '/api/returns': { post: { summary: 'Request a return (customer)', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Return requested' } } } },
    '/api/reviews': { get: { summary: 'List recent reviews', responses: { 200: { description: 'Reviews' } } } },
    '/api/brands': { get: { summary: 'List brands', responses: { 200: { description: 'Brands' } } }, post: { summary: 'Create a brand (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } } },
    '/api/brands/{id}': { get: { summary: 'Get a brand by id', responses: { 200: { description: 'Brand' }, 404: { $ref: '#/components/schemas/Error' } } }, put: { summary: 'Update a brand (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Updated' } } }, delete: { summary: 'Delete a brand (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Deleted' } } } },
    '/api/products/facets': { get: { summary: 'Get product facet counts (categories, brands, price range, availability, attributes)', responses: { 200: { description: 'Facets' } } } },
    '/api/shipping/calculate': { post: { summary: 'Calculate shipping rates for an address', responses: { 200: { description: 'Shipping options' } } } },
    '/api/support': { post: { summary: 'Submit a support ticket', responses: { 200: { description: 'Submitted' } } } },
    '/api/admin/backup': {
      get: { summary: 'Export full database backup (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'JSON backup' } } },
      post: { summary: 'Restore from backup file (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Restored' } } },
    },
    '/api/health': { get: { summary: 'Health check (db/email/disk)', responses: { 200: { description: 'OK' }, 503: { description: 'Unhealthy' } } } },
    '/api/search': { get: { summary: 'Search products', parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Results' } } } },
    '/api/enquiries': { get: { summary: 'List enquiries (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Enquiries' } } }, post: { summary: 'Submit a product enquiry', responses: { 200: { description: 'Submitted' } } } },
    '/api/notifications': { get: { summary: 'List own notifications + unread count', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Notifications' } } } },
    '/api/notifications/{id}': { put: { summary: 'Mark notification read', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Updated' } } } },
    '/api/account/me': { get: { summary: 'Get own profile', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Profile' } } } },
    '/api/account': { get: { summary: 'Get own account overview', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Account' } } }, put: { summary: 'Update own profile', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Updated' } } } },
    '/api/account/addresses': { get: { summary: 'List own addresses', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Addresses' } } }, post: { summary: 'Add address', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 201: { description: 'Created' } } } },
    '/api/wishlist': { get: { summary: 'Get own wishlist', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Wishlist' } } }, post: { summary: 'Add item to wishlist', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 201: { description: 'Added' } } }, delete: { summary: 'Remove item from wishlist', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Removed' } } } },
    '/api/media': { get: { summary: 'List media', responses: { 200: { description: 'Media' } } }, post: { summary: 'Upload media (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Uploaded' } } } },
    '/api/upload': { post: { summary: 'Upload image (admin, WebP conversion)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Uploaded' } } } },
    '/api/export': { get: { summary: 'Export CSV (products/categories/blog/enquiries/users)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'CSV' } } } },
    '/api/users': { get: { summary: 'List users (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Users' } } }, post: { summary: 'Create user (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } } },
    '/api/users/{id}': { put: { summary: 'Update user (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Updated' } } }, delete: { summary: 'Delete user (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Deleted' } } } },
    '/api/admin/search': { get: { summary: 'Global admin search (products/categories/blog/pages/users)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Grouped results' } } } },
    '/api/dashboard/stats': { get: { summary: 'Dashboard stats + enquiry trends', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Stats' } } } },
    '/api/activity-logs': { get: { summary: 'List activity logs (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Logs' } } } },
    '/api/coupons': { get: { summary: 'List coupons', responses: { 200: { description: 'Coupons' } } }, post: { summary: 'Create coupon (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } } },
    '/api/flash-sales': { get: { summary: 'List active flash sales', responses: { 200: { description: 'Flash sales' } } }, post: { summary: 'Create flash sale (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } } },
    '/api/bundles': { get: { summary: 'List product bundles', responses: { 200: { description: 'Bundles' } } } },
    '/api/redirects/check': { get: { summary: 'Resolve a redirect by path', responses: { 200: { description: 'Redirect or none' } } } },
    '/api/cron/abandoned-carts': { post: { summary: 'Cron: email abandoned carts (CRON_SECRET protected)', responses: { 200: { description: 'Done' } } } },
    '/api/cron/cleanup-sessions': { post: { summary: 'Cron: purge expired sessions (CRON_SECRET protected)', responses: { 200: { description: 'Done' } } } },
    '/api/stock-notifications': { post: { summary: 'Subscribe to back-in-stock notification for a product', responses: { 201: { description: 'Subscribed' }, 400: { $ref: '#/components/schemas/Error' } } } },
  },
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get('format') === 'swagger-ui') {
    const html = `<!doctype html><html><head><title>API Docs</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head><body><div id="swagger"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>window.onload=()=>{SwaggerUIBundle({url:'/api/docs',dom_id:'#swagger'})}</script>
</body></html>`;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  }
  return NextResponse.json(openApiDoc);
}
