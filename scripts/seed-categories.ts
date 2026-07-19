import { db } from "../src/lib/db";

const STORE_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG || "biotic-naturals";

async function main() {
  const store = await db.store.findFirst({ where: { slug: STORE_SLUG } });
  if (!store) {
    console.error(`Store with slug "${STORE_SLUG}" not found`);
    process.exit(1);
  }

  console.log(`Seeding categories for store: ${store.name} (${store.slug})\n`);

  const categories: { name: string; slug: string; description: string; image: string; sortOrder: number }[] = [
    {
      name: "Skin Care",
      slug: "skin-care",
      description: "Lab-tested Ayurvedic formulations for radiant skin — from face oils to daily moisturisers.",
      image: "/images/categories/skin-care.jpg",
      sortOrder: 1,
    },
    {
      name: "Hair Care",
      slug: "hair-care",
      description: "Herbal hair oils, conditioners, and scalp treatments rooted in classical Ayurvedic texts.",
      image: "/images/categories/hair-care.jpg",
      sortOrder: 2,
    },
    {
      name: "Wellness",
      slug: "wellness",
      description: "Daily wellness formulations — immunity, digestion, and vitality support for every dosha.",
      image: "/images/categories/wellness.jpg",
      sortOrder: 3,
    },
    {
      name: "Immunity",
      slug: "immunity",
      description: "Ayurvedic immunity boosters and rasayanas, crafted per classical formulations and lab-verified.",
      image: "/images/categories/immunity.jpg",
      sortOrder: 4,
    },
    {
      name: "Body Care",
      slug: "body-care",
      description: "Natural body oils, scrubs, and bath formulations for daily Ayurvedic rituals.",
      image: "/images/categories/body-care.jpg",
      sortOrder: 5,
    },
    {
      name: "Men's Care",
      slug: "mens-care",
      description: "Ayurvedic grooming and wellness formulations specifically formulated for men.",
      image: "/images/categories/mens-care.jpg",
      sortOrder: 6,
    },
  ];

  for (const cat of categories) {
    const existing = await db.category.findFirst({
      where: { slug: cat.slug, storeId: store.id },
    });

    if (existing) {
      console.log(`  Updating "${cat.name}"...`);
      await db.category.update({
        where: { id: existing.id },
        data: { name: cat.name, description: cat.description, image: cat.image, sortOrder: cat.sortOrder, isActive: true },
      });
    } else {
      console.log(`  Creating "${cat.name}"...`);
      await db.category.create({
        data: { storeId: store.id, name: cat.name, slug: cat.slug, description: cat.description, image: cat.image, sortOrder: cat.sortOrder, isActive: true },
      });
    }
  }

  console.log("\nAll categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
