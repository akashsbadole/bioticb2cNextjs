/**
 * Data Migration Script
 *
 * Migrates existing single-tenant data to a default store.
 * Run with: npx tsx scripts/migrate-to-multitenant.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Starting multi-tenancy migration...\n");

  // 1. Create default store
  console.log("1. Creating default store...");
  const defaultStore = await prisma.store.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "Default Store",
      slug: "default",
      ownerUserId:
        (await prisma.user.findFirst({ where: { role: "admin" } }))?.id || "",
      settings: JSON.stringify({
        currency: process.env.STORE_CURRENCY || "USD",
        tax_rate: "0",
        site_name: process.env.NEXT_PUBLIC_SITE_NAME,
      }),
      theme: JSON.stringify({
        primaryColor: "#10b981",
        accentColor: "#3b82f6",
      }),
    },
  });
  console.log(`   ✅ Default store created: ${defaultStore.id}\n`);

  // 2. Migrate products
  console.log("2. Migrating products...");
  const products = await prisma.product.updateMany({
    where: { storeId: null },
    data: { storeId: defaultStore.id },
  });
  console.log(`   ✅ ${products.count} products migrated\n`);

  // 3. Migrate categories
  console.log("3. Migrating categories...");
  const categories = await prisma.category.updateMany({
    where: { storeId: null },
    data: { storeId: defaultStore.id },
  });
  console.log(`   ✅ ${categories.count} categories migrated\n`);

  // 4. Migrate blog posts
  console.log("4. Migrating blog posts...");
  const blogPosts = await prisma.blogPost.updateMany({
    where: { storeId: null },
    data: { storeId: defaultStore.id },
  });
  console.log(`   ✅ ${blogPosts.count} blog posts migrated\n`);

  // 5. Migrate banners
  console.log("5. Migrating banners...");
  const banners = await prisma.banner.updateMany({
    where: { storeId: null },
    data: { storeId: defaultStore.id },
  });
  console.log(`   ✅ ${banners.count} banners migrated\n`);

  // 6. Migrate content pages
  console.log("6. Migrating content pages...");
  const pages = await prisma.contentPage.updateMany({
    where: { storeId: null },
    data: { storeId: defaultStore.id },
  });
  console.log(`   ✅ ${pages.count} content pages migrated\n`);

  // 7. Migrate enquiries
  console.log("7. Migrating enquiries...");
  const enquiries = await prisma.enquiry.updateMany({
    where: { storeId: null },
    data: { storeId: defaultStore.id },
  });
  console.log(`   ✅ ${enquiries.count} enquiries migrated\n`);

  // 8. Migrate media
  console.log("8. Migrating media...");
  const media = await prisma.media.updateMany({
    where: { storeId: null },
    data: { storeId: defaultStore.id },
  });
  console.log(`   ✅ ${media.count} media files migrated\n`);

  // 9. Migrate redirects
  console.log("9. Migrating redirects...");
  const redirects = await prisma.redirect.updateMany({
    where: { storeId: null },
    data: { storeId: defaultStore.id },
  });
  console.log(`   ✅ ${redirects.count} redirects migrated\n`);

  // 10. Migrate site settings (keep as global, but also copy to store)
  console.log("10. Migrating site settings...");
  const globalSettings = await prisma.siteSetting.findMany({
    where: { storeId: null },
  });

  for (const setting of globalSettings) {
    await prisma.siteSetting.upsert({
      where: { storeId_key: { storeId: defaultStore.id, key: setting.key } },
      update: { value: setting.value },
      create: {
        storeId: defaultStore.id,
        key: setting.key,
        value: setting.value,
      },
    });
  }
  console.log(
    `   ✅ ${globalSettings.length} settings copied to default store\n`,
  );

  // 11. Set admin user's current store
  console.log("11. Setting admin user current store...");
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { currentStoreId: defaultStore.id },
    });
    console.log(`   ✅ Admin user (${admin.email}) linked to default store\n`);
  }

  console.log("🎉 Migration complete!");
  console.log(`\nDefault store ID: ${defaultStore.id}`);
  console.log(`Default store slug: ${defaultStore.slug}`);
  const platformDomain =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "wcommerce.com";
  console.log(`\nAccess your store at: ${defaultStore.slug}.${platformDomain}`);
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
