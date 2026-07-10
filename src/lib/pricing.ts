export type UserTier = 'standard' | 'silver' | 'gold' | 'platinum';

export const TIER_DISCOUNTS: Record<UserTier, number> = {
  standard: 0,
  silver: 0.05, // 5% off
  gold: 0.10,   // 10% off
  platinum: 0.15 // 15% off
};

export function calculateTieredPrice(basePrice: number, tier: string | null | undefined, settings?: Record<string, string>): number {
  const userTier = (tier?.toLowerCase() || 'standard') as UserTier;

  let discount = TIER_DISCOUNTS[userTier] || 0;

  // Override with dynamic settings if available
  if (settings) {
    const parseDiscount = (val: string | undefined) => {
      if (val === undefined || val === '') return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    if (userTier === 'silver') {
      const d = parseDiscount(settings.b2b_discount_silver);
      if (d !== null) discount = d;
    }
    if (userTier === 'gold') {
      const d = parseDiscount(settings.b2b_discount_gold);
      if (d !== null) discount = d;
    }
    if (userTier === 'platinum') {
      const d = parseDiscount(settings.b2b_discount_platinum);
      if (d !== null) discount = d;
    }
  }

  return basePrice * (1 - discount);
}

export function formatPrice(price: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}
