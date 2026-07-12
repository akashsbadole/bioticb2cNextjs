import { db } from "../src/lib/db";

async function main() {
  const store = await db.store.findFirst({ where: { slug: "main" } });
  if (!store) {
    console.log("No store with slug 'main' found — skipping slug update.");
    return;
  }

  console.log(`Updating store "${store.name}" (${store.slug}) -> "Vedika Ayurveda" (vedika-ayurveda)...`);
  await db.store.update({
    where: { id: store.id },
    data: { name: "Vedika Ayurveda", slug: "vedika-ayurveda" },
  });
  console.log("✅ Store slug updated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
