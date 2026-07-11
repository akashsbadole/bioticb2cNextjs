import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const existing = await db.shippingRate.count();
  if (existing > 0) {
    console.log(`Already have ${existing} shipping rate(s), skipping seed`);
    return;
  }

  const store = await db.store.findFirst({
    where: { slug: process.env.DEFAULT_STORE_SLUG || 'main' },
  });
  const storeId = store?.id || null;

  await db.shippingRate.createMany({
    data: [
      {
        storeId,
        name: 'Standard',
        minSubtotal: 0,
        maxSubtotal: 499,
        rate: 50,
        deliveryEta: '5-7 business days',
        sortOrder: 1,
      },
      {
        storeId,
        name: 'Standard',
        minSubtotal: 500,
        maxSubtotal: null,
        rate: 0,
        freeAbove: 500,
        deliveryEta: '5-7 business days',
        sortOrder: 1,
      },
      {
        storeId,
        name: 'Express',
        minSubtotal: 0,
        maxSubtotal: null,
        rate: 120,
        deliveryEta: '2-3 business days',
        sortOrder: 2,
      },
    ],
  });

  console.log('Seeded 3 default shipping rates');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
