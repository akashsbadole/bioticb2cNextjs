import { describe, it, expect } from 'vitest';
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  tooManyRequests,
  serverError,
} from './api-response';

describe('api-response helpers', () => {
  it('ok returns success envelope with data and 200', () => {
    const res = ok({ id: 1 });
    expect(res.status).toBe(200);
    return res.json().then((body) => {
      expect(body).toEqual({ success: true, data: { id: 1 } });
    });
  });

  it('ok supports message and pagination', () => {
    const res = ok([], {
      message: 'listed',
      pagination: { page: 1, limit: 10, total: 0 },
    });
    return res.json().then((body) => {
      expect(body.success).toBe(true);
      expect(body.message).toBe('listed');
      expect(body.pagination).toEqual({ page: 1, limit: 10, total: 0 });
    });
  });

  it('created returns 201 status', () => {
    const res = created({ id: 2 });
    expect(res.status).toBe(201);
    return res.json().then((body) => {
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ id: 2 });
    });
  });

  it('badRequest returns 400 with error envelope', () => {
    const res = badRequest('Invalid', { code: 'VAL' });
    expect(res.status).toBe(400);
    return res.json().then((body) => {
      expect(body).toEqual({ success: false, error: 'Invalid', code: 'VAL' });
    });
  });

  it('unauthorized returns 401', () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
    return res.json().then((body) => {
      expect(body.success).toBe(false);
      expect(body.error).toBe('Unauthorized');
    });
  });

  it('forbidden returns 403', () => {
    const res = forbidden();
    expect(res.status).toBe(403);
  });

  it('notFound returns 404', () => {
    const res = notFound('Product missing');
    expect(res.status).toBe(404);
    return res.json().then((body) => {
      expect(body).toEqual({ success: false, error: 'Product missing' });
    });
  });

  it('conflict returns 409', () => {
    const res = conflict('Slug in use');
    expect(res.status).toBe(409);
  });

  it('tooManyRequests returns 429 with Retry-After header', () => {
    const res = tooManyRequests('Slow down', 30);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
  });

  it('serverError returns 500', () => {
    const res = serverError();
    expect(res.status).toBe(500);
    return res.json().then((body) => {
      expect(body.success).toBe(false);
      expect(body.error).toBe('Internal server error');
    });
  });

  it('error envelope always sets success false', () => {
    const res = badRequest('x');
    return res.json().then((body) => {
      expect(body.success).toBe(false);
    });
  });
});
