import { db } from '../src/lib/db';
import { hash } from 'bcryptjs';

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await db.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      email: 'admin@store.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    },
  });
  console.log('Created admin:', admin.email);

  // Create electronics category
  const electronics = await db.category.findFirst({ where: { slug: 'electronics' } });
  let electronicsId = electronics?.id;
  if (!electronics) {
    const newCat = await db.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest electronic gadgets',
        isActive: true,
      }
    });
    electronicsId = newCat.id;
  }

  // Create product
  const product = await db.product.findFirst({ where: { slug: 'pro-wireless-headphones' } });
  if (!product) {
    await db.product.create({
      data: {
        name: 'Pro Wireless Headphones',
        slug: 'pro-wireless-headphones',
        price: 299.99,
        wholesalePrice: 189.99,
        minOrderQty: 5,
        isActive: true,
        images: '[]',
        categoryId: electronicsId,
      }
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
