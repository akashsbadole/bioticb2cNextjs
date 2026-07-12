import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

const img = (seed) =>
  JSON.stringify([
    `https://picsum.photos/seed/${seed}-1/600/600`,
    `https://picsum.photos/seed/${seed}-2/600/600`,
  ]);

async function main() {
  console.log("Seeding dev database...");

  const adminPassword = await hash("admin123", 12);
  const owner = await db.user.upsert({
    where: { email: "admin@store.com" },
    update: {},
    create: {
      email: "admin@store.com",
      name: "Admin User",
      password: adminPassword,
      role: "admin",
      isActive: true,
      isVerified: true,
    },
  });

  const customerPassword = await hash("Test1234", 12);
  await db.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      email: "customer@test.com",
      name: "Test Customer",
      password: customerPassword,
      role: "customer",
      isActive: true,
      isVerified: true,
    },
  });

  const store = await db.store.upsert({
    where: { slug: "main" },
    update: {},
    create: {
      name: "Biotic Naturals",
      slug: "main",
      domain: "localhost",
      description: "Premium snacks, beverages and sweets.",
      ownerUserId: owner.id,
      settings: JSON.stringify({ currency: "INR", tax_rate: 0 }),
    },
  });
  const storeId = store.id;

  const settings = [
    ["site_name", "Biotic Naturals"],
    ["currency", "INR"],
    ["site_email", "admin@store.com"],
    ["contact_email", "admin@store.com"],
    ["contact_phone", "+919999999999"],
    ["site_description", "Premium snacks, beverages and sweets for your home."],
    ["site_url", "http://localhost:3000"],
    ["announcement_text", "Free delivery on orders above ₹499"],
  ];
  for (const [key, value] of settings) {
    const existing = await db.siteSetting.findFirst({
      where: { storeId: null, key },
    });
    if (existing) {
      await db.siteSetting.update({
        where: { id: existing.id },
        data: { value },
      });
    } else {
      await db.siteSetting.create({ data: { storeId: null, key, value } });
    }
  }

  const catDefs = [
    { name: "Snacks", slug: "snacks" },
    { name: "Beverages", slug: "beverages" },
    { name: "Sweets", slug: "sweets" },
  ];
  const cats = {};
  for (const c of catDefs) {
    const created = await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug, storeId, isActive: true },
    });
    cats[c.slug] = created.id;
  }

  const productDefs = [
    {
      name: "Masala Khakhra",
      slug: "masala-khakhra",
      price: 120,
      compare: 150,
      cat: "snacks",
      featured: true,
    },
    {
      name: "Methi Khakhra",
      slug: "methi-khakhra",
      price: 110,
      compare: 140,
      cat: "snacks",
      featured: true,
    },
    {
      name: "Jeera Buttermilk",
      slug: "jeera-buttermilk",
      price: 40,
      compare: 50,
      cat: "beverages",
    },
    {
      name: "Mango Smoothie",
      slug: "mango-smoothie",
      price: 90,
      compare: 110,
      cat: "beverages",
      bestSeller: true,
    },
    {
      name: "Gulkand Barfi",
      slug: "gulkand-barfi",
      price: 320,
      compare: 380,
      cat: "sweets",
    },
    {
      name: "Dry Fruit Ladoo",
      slug: "dry-fruit-ladoo",
      price: 280,
      compare: 340,
      cat: "sweets",
      featured: true,
    },
  ];
  for (const p of productDefs) {
    const existing = await db.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await db.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          price: p.price,
          comparePrice: p.compare,
          isActive: true,
          isFeatured: !!p.featured,
          isBestSeller: !!p.bestSeller,
          images: img(p.slug),
          shortDescription: `${p.name} — freshly made.`,
          categoryId: cats[p.cat],
          storeId,
        },
      });
    }
  }

  await db.coupon.upsert({
    where: { code: "SAVE10" },
    update: {},
    create: {
      code: "SAVE10",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 0,
      isActive: true,
      storeId,
    },
  });

  await db.popup.upsert({
    where: { id: "seed-welcome-popup" },
    update: {},
    create: {
      id: "seed-welcome-popup",
      storeId,
      title: "Welcome to our store!",
      subtitle: "Enjoy 10% off your first order",
      content:
        "Use code SAVE10 at checkout to get 10% off. Free shipping on orders above ₹499.",
      ctaText: "Shop Now",
      ctaLink: "/products",
      triggerType: "delay",
      delayMs: 2000,
      displayFrequency: "once",
      position: "center",
      isActive: true,
      sortOrder: 0,
    },
  });

  const bannerDefs = [
    {
      title: "Premium Snacks & Sweets",
      subtitle: "Handpicked quality delivered to your door",
      image: "https://picsum.photos/seed/banner-snacks/1200/500",
      link: "/shop",
      linkText: "Shop Now",
      sortOrder: 0,
    },
    {
      title: "Fresh Beverages",
      subtitle: "Natural and refreshing drinks",
      image: "https://picsum.photos/seed/banner-beverages/1200/500",
      link: "/shop",
      linkText: "Explore",
      sortOrder: 1,
    },
  ];
  for (const b of bannerDefs) {
    await db.banner.create({
      data: {
        storeId,
        ...b,
      },
    });
  }

  console.log("Seed complete.");
  console.log("  Store: main (localhost)");
  console.log("  Admin: admin@store.com / admin123");
  console.log("  Customer: customer@test.com / Test1234");
  console.log("  Coupon: SAVE10 (10% off)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
