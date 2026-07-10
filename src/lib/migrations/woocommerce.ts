import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

interface MigrationResult {
  success: boolean;
  imported: number;
  errors: string[];
}

export async function migrateWooCommerceProducts(
  csvData: any[],
  storeId: string | null
): Promise<MigrationResult> {
  const errors: string[] = [];
  let importedCount = 0;

  for (const row of csvData) {
    try {
      const name = row.Name || row.name;
      if (!name) {
        errors.push(`Row ${importedCount + errors.length + 1}: Name is missing`);
        continue;
      }

      const slug = (row.Slug || row.slug || name.toLowerCase().replace(/ /g, "-")).substring(0, 190);
      const sku = row.SKU || row.sku || "";
      const price = parseFloat(row["Regular price"] || row.regular_price || "0");
      const comparePrice = parseFloat(row["Sale price"] || row.sale_price || "0") || null;
      const description = row.Description || row.description || "";
      const shortDescription = row["Short description"] || row.short_description || "";
      const stock = parseInt(row.Stock || row.stock || "0");
      const imagesRaw = row.Images || row.images || "";

      // Handle Category
      let categoryId = null;
      const categoryName = row.Categories || row.categories || "";
      if (categoryName) {
        const firstCat = categoryName.split(",")[0].trim();
        const cat = await db.category.upsert({
          where: { slug: firstCat.toLowerCase().replace(/ /g, "-") },
          update: {},
          create: {
            name: firstCat,
            slug: firstCat.toLowerCase().replace(/ /g, "-"),
            storeId,
          },
        });
        categoryId = cat.id;
      }

      // Handle Images (Download if URL)
      const imageUrls = imagesRaw.split(",").map((s: string) => s.trim()).filter(Boolean);
      const downloadedImages: string[] = [];

      for (const url of imageUrls) {
        if (url.startsWith("http")) {
          // In a real environment, we would download to S3/Local storage.
          // For now, we use the URL directly, but track it.
          downloadedImages.push(url);

          // Optional: Add to Media library if doesn't exist
          try {
            const fileName = url.split('/').pop() || 'imported-image';
            await db.media.upsert({
              where: { url: url },
              update: {},
              create: {
                url: url,
                filename: fileName,
                originalName: fileName,
                mimeType: 'image/jpeg',
                size: 0,
                storeId: storeId
              }
            });
          } catch { /* ignore media errors */ }
        } else {
          downloadedImages.push(url);
        }
      }

      await db.product.upsert({
        where: { slug },
        update: {
          name,
          price,
          comparePrice,
          description,
          shortDescription,
          stock,
          images: JSON.stringify(downloadedImages),
          categoryId,
          storeId,
        },
        create: {
          name,
          slug,
          sku,
          price,
          comparePrice,
          description,
          shortDescription,
          stock,
          images: JSON.stringify(downloadedImages),
          categoryId,
          storeId,
        },
      });

      importedCount++;
    } catch (e: any) {
      errors.push(`Error in row: ${e.message}`);
    }
  }

  return { success: errors.length === 0, imported: importedCount, errors };
}

export async function migrateWooCommerceCategories(
  csvData: any[],
  storeId: string | null
): Promise<MigrationResult> {
  const errors: string[] = [];
  let importedCount = 0;

  for (const row of csvData) {
    try {
      const name = row.Name || row.name;
      if (!name) continue;

      const slug = (row.Slug || row.slug || name.toLowerCase().replace(/ /g, "-")).substring(0, 190);

      await db.category.upsert({
        where: { slug },
        update: {
          name,
          description: row.Description || row.description || undefined,
        },
        create: {
          name,
          slug,
          description: row.Description || row.description || undefined,
          storeId,
        },
      });
      importedCount++;
    } catch (e: any) {
      errors.push(`Error importing category: ${e.message}`);
    }
  }

  return { success: errors.length === 0, imported: importedCount, errors };
}

export async function migrateWooCommerceUsers(
  csvData: any[],
  storeId: string | null
): Promise<MigrationResult> {
  const errors: string[] = [];
  let importedCount = 0;

  for (const row of csvData) {
    try {
      const email = row.Email || row.user_email || row.billing_email;
      if (!email) {
        errors.push(`Row ${importedCount + errors.length + 1}: Email is missing`);
        continue;
      }

      const firstName = row["First name"] || row.billing_first_name || "";
      const lastName = row["Last name"] || row.billing_last_name || "";
      const name = `${firstName} ${lastName}`.trim() || row.User || email.split("@")[0];

      await db.user.upsert({
        where: { email },
        update: {
          name,
          phone: row.Phone || row.billing_phone || undefined,
        },
        create: {
          email,
          name,
          role: "customer",
          phone: row.Phone || row.billing_phone || undefined,
          currentStoreId: storeId,
        },
      });
      importedCount++;
    } catch (e: any) {
      errors.push(`Error importing user: ${e.message}`);
    }
  }

  return { success: errors.length === 0, imported: importedCount, errors };
}

export async function migrateWooCommerceOrders(
  csvData: any[],
  storeId: string | null
): Promise<MigrationResult> {
  const errors: string[] = [];
  let importedCount = 0;

  for (const row of csvData) {
    try {
      const orderNumber = row["Order number"] || row.id;
      const total = parseFloat(row["Order total"] || row.total || "0");
      const email = row["Billing email"] || row.billing_email || "";
      const status = row["Order status"] || row.status || "pending";

      await db.order.create({
        data: {
          storeId,
          totalAmount: total,
          subtotal: total,
          customerEmail: email,
          status,
          paymentStatus: "paid",
          customerName: `${row["Billing first name"] || ""} ${row["Billing last name"] || ""}`.trim(),
          createdAt: row["Order date"] ? new Date(row["Order date"]) : new Date(),
        },
      });
      importedCount++;
    } catch (e: any) {
      errors.push(`Error importing order: ${e.message}`);
    }
  }

  return { success: errors.length === 0, imported: importedCount, errors };
}
