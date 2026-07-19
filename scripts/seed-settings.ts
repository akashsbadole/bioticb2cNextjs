import { db } from "../src/lib/db";

const DEFAULT_SETTINGS: { key: string; value: string }[] = [
  { key: "site_name", value: "Biotic Naturals" },
  {
    key: "site_description",
    value:
      "Rooted in Wellness — Ayurvedic formulations for skin, hair and wellness. Small-batch, lab-tested, dosha-balanced.",
  },
  { key: "store_slug", value: "biotic-naturals" },
  { key: "currency", value: "INR" },
  { key: "currency_symbol", value: "₹" },
  { key: "store_email", value: "info@bioticnaturals.com" },
  { key: "store_phone", value: "+91 141 403 7200" },
  {
    key: "store_address",
    value: "42, Hawa Sadak, Bani Park, Jaipur — 302 016, Rajasthan, India",
  },
  { key: "social_instagram", value: "https://instagram.com/bioticayurveda" },
  { key: "social_youtube", value: "https://youtube.com/@bioticayurveda" },
  { key: "social_facebook", value: "https://facebook.com/bioticayurveda" },
  {
    key: "announcement_text",
    value: "Complimentary shipping on orders above ₹499 within India",
  },
  { key: "announcement_enabled", value: "true" },
  { key: "delivery_free_threshold", value: "499" },
  { key: "delivery_charge", value: "49" },
  { key: "return_period_days", value: "14" },
  {
    key: "order_success_message",
    value:
      "Thank you for your order. We'll send you a confirmation once it ships.",
  },
  { key: "default_meta_title", value: "Biotic Naturals — Rooted in Wellness" },
  {
    key: "default_meta_description",
    value:
      "Ayurvedic formulations for skin, hair and wellness. Small-batch, lab-tested, dosha-balanced. Made in India.",
  },
];

async function main() {
  console.log("Seeding default settings for Biotic Naturals...\n");

  for (const s of DEFAULT_SETTINGS) {
    const existing = await db.siteSetting.findFirst({
      where: { storeId: null, key: s.key },
    });
    if (existing) {
      console.log(`  Updating "${s.key}"...`);
      await db.siteSetting.update({
        where: { id: existing.id },
        data: { value: s.value },
      });
    } else {
      console.log(`  Creating "${s.key}"...`);
      await db.siteSetting.create({
        data: { storeId: null, key: s.key, value: s.value },
      });
    }
  }

  console.log("\nAll settings seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
