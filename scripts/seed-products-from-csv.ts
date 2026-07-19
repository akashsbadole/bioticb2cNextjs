import { db } from "../src/lib/db";
import { parseCSV } from "../src/lib/utils";
import * as fs from "fs";

const CSV_PATH = "C:\\Users\\akash\\Downloads\\woocommer-product.csv";
const STORE_SLUG = process.env.DEFAULT_STORE_SLUG || "biotic-naturals";

async function getStoreId(): Promise<string | null> {
  const store = await db.store.findFirst({ where: { slug: STORE_SLUG } });
  return store?.id || null;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

async function main() {
  const storeId = await getStoreId();
  if (!storeId) {
    console.error(`Store with slug "${STORE_SLUG}" not found`);
    process.exit(1);
  }
  console.log(`Using store ID: ${storeId}\n`);

  const csvText = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    console.error("CSV has no data rows");
    process.exit(1);
  }
  const headers = rows[0];
  const records = rows.slice(1).map((row) => {
    const rec: Record<string, string> = {};
    headers.forEach((h, i) => {
      rec[h] = row[i] || "";
    });
    return rec;
  });

  console.log(`Found ${records.length} products in CSV\n`);

  let imported = 0;
  let skipped = 0;
  let errors: string[] = [];

  for (const row of records) {
    try {
      const postTitle = (row.post_title || "").trim();
      const postStatus = (row.post_status || "").trim();
      const productType = parseInt(row.product_type || "1");
      const sku = (row.PRODUCTSKU || "").trim();
      const regularPrice = parseFloat(row.regular_price) || 0;
      const salePrice = parseFloat(row.sale_price) || 0;
      const price = salePrice || regularPrice;
      const stockQty = parseInt(row.stock_qty || row.stock || "0") || 0;
      const description = (row.post_content || "").trim();
      const shortDesc = stripHtml(description).substring(0, 500);
      const imageUrl = (row.featured_image || "").trim();
      const categoryName = (row.ds_cat_name || "").trim();
      const attrName = (row.product_attribute_name1 || "").trim();
      const attrValues = (row.product_attribute_value1 || "").trim();

      if (!postTitle) {
        skipped++;
        continue;
      }

      // Check for existing by SKU
      if (sku) {
        const existing = await db.product.findFirst({
          where: { sku, storeId },
        });
        if (existing) {
          skipped++;
          continue;
        }
      }

      // Resolve category by name
      let categoryId: string | undefined;
      if (categoryName) {
        let cat = await db.category.findFirst({
          where: { name: { contains: categoryName }, storeId, deletedAt: null },
        });
        if (!cat) {
          cat = await db.category.create({
            data: {
              name: categoryName,
              slug: slugify(categoryName),
              isActive: true,
              storeId,
            },
          });
        }
        categoryId = cat.id;
      }

      const slug = (row.post_name || "").trim() || slugify(postTitle);

      // Variable product with size attribute → create variants via ProductVariant
      if (productType === 4 && attrName === "size" && attrValues) {
        const sizes = attrValues.split(",").map((s) => s.trim()).filter(Boolean);
        const minPrice = price > 0 ? price : Math.min(...sizes.map(() => price));
        const totalStock = stockQty * sizes.length;

        const product = await db.product.create({
          data: {
            name: postTitle,
            slug,
            description,
            shortDescription: shortDesc,
            price,
            stock: totalStock,
            sku: sku || undefined,
            images: imageUrl ? JSON.stringify([imageUrl]) : "[]",
            isActive: postStatus === "publish",
            categoryId: categoryId || undefined,
            storeId,
            attributes: JSON.stringify({ size: sizes }),
          },
        });

        for (const size of sizes) {
          const variantSku = sku ? `${sku}-${slugify(size)}` : undefined;
          await db.productVariant.create({
            data: {
              productId: product.id,
              name: `${postTitle} - ${size}`,
              sku: variantSku,
              price,
              stock: stockQty,
              images: imageUrl ? JSON.stringify([imageUrl]) : "[]",
              isActive: postStatus === "publish",
            },
          });
        }
      } else if (productType === 4 && attrValues) {
        // Other variable products (multiple attributes) — create as simple with attributes
        await db.product.create({
          data: {
            name: postTitle,
            slug,
            description,
            shortDescription: shortDesc,
            price,
            stock: stockQty,
            sku: sku || undefined,
            images: imageUrl ? JSON.stringify([imageUrl]) : "[]",
            isActive: postStatus === "publish",
            categoryId: categoryId || undefined,
            storeId,
          },
        });
      } else {
        // Simple product
        await db.product.create({
          data: {
            name: postTitle,
            slug,
            description,
            shortDescription: shortDesc,
            price,
            stock: stockQty,
            sku: sku || undefined,
            images: imageUrl ? JSON.stringify([imageUrl]) : "[]",
            isActive: postStatus === "publish",
            categoryId: categoryId || undefined,
            storeId,
          },
        });
      }

      imported++;
      if (imported % 25 === 0) {
        console.log(`  Imported ${imported} products...`);
      }
    } catch (err) {
      errors.push(`Failed "${row.post_title}": ${err instanceof Error ? err.message : "Unknown"}`);
    }
  }

  console.log(`\nDone! Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log("First 5 errors:");
    errors.slice(0, 5).forEach((e) => console.log(`  - ${e}`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
