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
      post: { summary: 'Register a new B2B account', responses: { 201: { description: 'Created' }, 400: { $ref: '#/components/schemas/Error' } } },
    },
    '/api/auth/forgot-password': { post: { summary: 'Request a password reset', responses: { 200: { description: 'Reset email queued' } } } },
    '/api/auth/reset-password': { post: { summary: 'Reset password with token', responses: { 200: { description: 'Reset' } } } },
    '/api/orders': {
      get: { summary: 'List orders (admin) or own orders (customer)', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Orders' } } },
      post: { summary: 'Create an order (triggers PayU payment)', responses: { 201: { description: 'Order created' } } },
    },
    '/api/cart/sync': { post: { summary: 'Sync cart with stock validation', responses: { 200: { description: 'Synced cart' } } } },
    '/api/contact': { post: { summary: 'Submit a contact/enquiry form (sanitized)', responses: { 200: { description: 'Received' } } } },
    '/api/newsletter/subscribe': { post: { summary: 'Subscribe to newsletter', responses: { 200: { description: 'Subscribed' } } } },
    '/api/returns': { post: { summary: 'Request a return (customer)', security: [{ bearerAuth: [] }, { cookieAuth: [] }], responses: { 200: { description: 'Return requested' } } } },
    '/api/admin/backup': {
      get: { summary: 'Export full database backup (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'JSON backup' } } },
      post: { summary: 'Restore from backup file (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Restored' } } },
    },
    '/api/health': { get: { summary: 'Health check (db/email/disk)', responses: { 200: { description: 'OK' }, 503: { description: 'Unhealthy' } } } },
    '/api/search': { get: { summary: 'Search products', parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Results' } } } },
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
