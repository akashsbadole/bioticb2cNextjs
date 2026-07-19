import { db } from "../src/lib/db";

async function main() {
  console.log("Starting custom database seeding...");

  // 1. Find or create the main store
  let store = await db.store.findFirst({
    where: { slug: "biotic-naturals" },
  });

  if (!store) {
    console.log("Store 'biotic-naturals' not found. Creating it...");
    const admin = await db.user.findFirst({ where: { role: "admin" } });
    if (!admin) {
      console.error("No admin user found to associate with the store!");
      process.exit(1);
    }
    store = await db.store.create({
      data: {
        name: "Biotic Ayurveda",
        slug: "biotic-naturals",
        domain: "localhost",
        description:
          "Rooted in Wellness — Authentic Ayurvedic wellness products",
        ownerUserId: admin.id,
        settings: JSON.stringify({ currency: "INR", tax_rate: 0 }),
      },
    });
  }

  const storeId = store.id;
  console.log(`Using Store: ${store.name} (${storeId})`);

  // 2. Seed custom requested categories
  console.log("Seeding categories...");
  const categoriesToSeed = [
    { name: "Ayurvedic powder", slug: "ayurvedic-powder" },
    { name: "raw herbs", slug: "raw-herbs" },
    { name: "herbal extract capsules", slug: "herbal-extract-capsules" },
    { name: "seasoning spices", slug: "seasoning-spices" },
    { name: "shilajit", slug: "shilajit" },
    { name: "superfood seeds", slug: "superfood-seeds" },
    { name: "Face Mask Clays", slug: "face-mask-clays" },
    { name: "Herbal Flower-Leaf Tea", slug: "herbal-flower-leaf-tea" },
    { name: "Organic Crystals", slug: "organic-crystals" },
    { name: "Fruit Powder", slug: "fruit-powder" },
    { name: "General Uses items", slug: "general-uses-items" },
    { name: "Ailments care", slug: "ailments-care" },
    { name: "General Health", slug: "general-health" },
  ];

  for (const cat of categoriesToSeed) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        storeId,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        storeId,
        isActive: true,
      },
    });
    console.log(`- Seeded category: ${cat.name}`);
  }

  // 3. Clear existing primary menu items and set up nested Shop -> Categories -> Ailments care & General Health menu
  console.log("Rebuilding primary menu navigation...");
  let primaryMenu = await db.menu.findFirst({
    where: { storeId, location: "primary" },
  });

  if (primaryMenu) {
    await db.menuItem.deleteMany({ where: { menuId: primaryMenu.id } });
  } else {
    primaryMenu = await db.menu.create({
      data: {
        storeId,
        name: "Primary Menu",
        slug: "primary-menu",
        location: "primary",
        isActive: true,
      },
    });
  }

  const menuId = primaryMenu.id;

  // Level 1: Shop
  const shopItem = await db.menuItem.create({
    data: {
      menuId,
      label: "Shop",
      page: "shop",
      sortOrder: 1,
      isActive: true,
    },
  });

  // Level 2: Categories (under Shop)
  const categoriesItem = await db.menuItem.create({
    data: {
      menuId,
      parentId: shopItem.id,
      label: "Categories",
      page: "shop",
      sortOrder: 1,
      isActive: true,
    },
  });

  // Level 3: Ailments care (under Categories)
  await db.menuItem.create({
    data: {
      menuId,
      parentId: categoriesItem.id,
      label: "Ailments care",
      page: "category",
      slug: "ailments-care",
      sortOrder: 1,
      isActive: true,
    },
  });

  // Level 3: General Health (under Categories)
  await db.menuItem.create({
    data: {
      menuId,
      parentId: categoriesItem.id,
      label: "General Health",
      page: "category",
      slug: "general-health",
      sortOrder: 2,
      isActive: true,
    },
  });

  // Other Level 1 items
  await db.menuItem.create({
    data: {
      menuId,
      label: "Blog",
      page: "blog",
      sortOrder: 2,
      isActive: true,
    },
  });

  await db.menuItem.create({
    data: {
      menuId,
      label: "About Us",
      page: "about",
      sortOrder: 3,
      isActive: true,
    },
  });

  await db.menuItem.create({
    data: {
      menuId,
      label: "Contact Us",
      page: "contact",
      sortOrder: 4,
      isActive: true,
    },
  });

  console.log("Primary menu navigation seeded successfully!");

  // 4. Create content pages for About Us, Terms & Conditions, and Contact Us
  console.log("Creating/Updating Content Pages...");
  const pagesToSeed = [
    {
      title: "About Us",
      slug: "about",
      content:
        "We formulate organic and authentic Ayurvedic wellness products, crafted according to traditional techniques.",
    },
    {
      title: "Terms and Conditions",
      slug: "terms",
      content:
        "Welcome to Biotic Ayurveda. By accessing our shop, you agree to our terms and conditions.",
    },
    {
      title: "Contact Us",
      slug: "contact",
      content:
        "Get in touch with our customer service team. Phone: +91 141 403 7200, Email: info@bioticnaturals.com",
    },
  ];

  for (const page of pagesToSeed) {
    await db.contentPage.upsert({
      where: { storeId_slug: { storeId, slug: page.slug } },
      update: {
        title: page.title,
        content: page.content,
        isActive: true,
      },
      create: {
        storeId,
        title: page.title,
        slug: page.slug,
        content: page.content,
        isActive: true,
      },
    });
    console.log(`- Seeded content page: ${page.title}`);
  }

  // 5. Pre-seed Footer Menus so that all required footer links render and route correctly
  console.log("Seeding footer menus...");
  const footerConfigs = [
    {
      location: "footer_1",
      name: "About & Journal",
      items: [
        { label: "About Us", page: "about", slug: "about" },
        { label: "Blog Journal", page: "blog" },
      ],
    },
    {
      location: "footer_2",
      name: "Customer Care",
      items: [
        { label: "Contact Us", page: "contact" },
        { label: "Terms & Conditions", page: "content-page", slug: "terms" },
      ],
    },
  ];

  for (const config of footerConfigs) {
    let menu = await db.menu.findFirst({
      where: { storeId, location: config.location },
    });

    if (menu) {
      await db.menuItem.deleteMany({ where: { menuId: menu.id } });
    } else {
      menu = await db.menu.create({
        data: {
          storeId,
          name: config.name,
          slug: config.location,
          location: config.location,
          isActive: true,
        },
      });
    }

    for (let i = 0; i < config.items.length; i++) {
      const item = config.items[i];
      await db.menuItem.create({
        data: {
          menuId: menu.id,
          label: item.label,
          page: item.page,
          slug: item.slug || null,
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }
    console.log(`- Seeded footer menu: ${config.name}`);
  }

  // 6. Create sample products under custom categories to ensure multiple category selections on Homepage
  console.log("Adding sample products under categories for home page view...");
  const sampleProducts = [
    {
      name: "Premium Shilajit Resin",
      slug: "premium-shilajit-resin",
      price: 999,
      categorySlug: "shilajit",
    },
    {
      name: "Organic Ashwagandha Powder",
      slug: "organic-ashwagandha-powder",
      price: 299,
      categorySlug: "ayurvedic-powder",
    },
    {
      name: "Amla Fruit Powder",
      slug: "amla-fruit-powder",
      price: 199,
      categorySlug: "fruit-powder",
    },
    {
      name: "Triphala Extract Capsules",
      slug: "triphala-extract-capsules",
      price: 499,
      categorySlug: "herbal-extract-capsules",
    },
    {
      name: "Raw Mulethi Root (Licorice)",
      slug: "raw-mulethi-root",
      price: 150,
      categorySlug: "raw-herbs",
    },
    {
      name: "Ginger Tea Flower Infusion",
      slug: "ginger-tea-flower",
      price: 349,
      categorySlug: "herbal-flower-leaf-tea",
    },
  ];

  for (const prod of sampleProducts) {
    const category = await db.category.findUnique({
      where: { slug: prod.categorySlug },
    });
    if (!category) continue;

    await db.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        price: prod.price,
        storeId,
        categoryId: category.id,
        isActive: true,
        images: JSON.stringify(["/images/products/placeholder.jpg"]),
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        price: prod.price,
        storeId,
        categoryId: category.id,
        isActive: true,
        images: JSON.stringify(["/images/products/placeholder.jpg"]),
      },
    });
    console.log(`- Seeded sample product: ${prod.name}`);
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
