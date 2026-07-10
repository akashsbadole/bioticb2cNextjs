import { calculateTieredPrice } from '../src/lib/pricing';

const mockSettings = {
  b2b_discount_silver: '0.5',
  b2b_discount_gold: '0.2',
  b2b_discount_platinum: 'invalid'
};

const runTest = () => {
  console.log('Testing calculateTieredPrice logic...');

  const price = 100;

  // Standard (no discount)
  console.log('Standard:', calculateTieredPrice(price, 'standard', mockSettings)); // Expected: 100

  // Silver (50% discount from settings)
  console.log('Silver (50%):', calculateTieredPrice(price, 'silver', mockSettings)); // Expected: 50

  // Gold (20% discount from settings)
  console.log('Gold (20%):', calculateTieredPrice(price, 'gold', mockSettings)); // Expected: 80

  // Platinum (Invalid discount in settings, fallback to hardcoded 15%?)
  console.log('Platinum (Invalid setting -> fallback 15%):', calculateTieredPrice(price, 'platinum', mockSettings)); // Expected: 85

  // No settings
  console.log('Silver (No settings -> default 5%):', calculateTieredPrice(price, 'silver')); // Expected: 95
};

runTest();
