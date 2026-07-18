import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  ORDER_STATUS_FLOW,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
  USER_ROLE,
  USER_ROLE_VALUES,
  STORE_PLAN,
  ACTIVITY,
  ACTIVITY_VALUES,
  PAYMENT_METHOD,
} from './constants';

describe('constants', () => {
  it('ORDER_STATUS has expected keys and never-empty values', () => {
    expect(ORDER_STATUS.PENDING).toBe('pending');
    expect(ORDER_STATUS.DELIVERED).toBe('delivered');
    for (const v of ORDER_STATUS_VALUES) {
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    }
  });

  it('ORDER_STATUS_FLOW is an ordered list starting at pending', () => {
    expect(ORDER_STATUS_FLOW[0]).toBe(ORDER_STATUS.PENDING);
    expect(ORDER_STATUS_FLOW).toContain(ORDER_STATUS.DELIVERED);
  });

  it('PAYMENT_STATUS covers paid/failed/refunded', () => {
    expect(PAYMENT_STATUS.PAID).toBe('paid');
    expect(PAYMENT_STATUS.FAILED).toBe('failed');
    expect(PAYMENT_STATUS_VALUES).toContain('refunded');
  });

  it('USER_ROLE includes buyer and customer', () => {
    expect(USER_ROLE.ADMIN).toBe('admin');
    expect(USER_ROLE.BUYER).toBe('buyer');
    expect(USER_ROLE_VALUES).toContain('customer');
  });

  it('STORE_PLAN defines tiered plans', () => {
    expect(STORE_PLAN.FREE).toBe('free');
    expect(STORE_PLAN.ENTERPRISE).toBe('enterprise');
  });

  it('ACTIVITY enumerates product/category events', () => {
    expect(ACTIVITY.PRODUCT_CREATE).toBe('product.create');
    expect(ACTIVITY.CATEGORY_DELETE).toBe('category.delete');
    expect(ACTIVITY_VALUES).toContain('settings.update');
  });

  it('PAYMENT_METHOD covers payu/cod/razorpay', () => {
    expect(PAYMENT_METHOD.PAYU).toBe('payu');
    expect(PAYMENT_METHOD.COD).toBe('cod');
    expect(PAYMENT_METHOD.RAZORPAY).toBe('razorpay');
  });
});
