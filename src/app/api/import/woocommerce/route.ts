import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCSV } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

interface WooProduct {
  ID: string;
  Type: string;
  SKU: string;
  Name: string;
  Published: string;
  'Short description': string;
  Description: string;
  'Sale price': string;
  'Regular price': string;
  Categories: string;
  Tags: string;
  Images: string;
  Stock: string;
  'Stock status': string;
  Weight: string;
  'Allow customer reviews?': string;
  Status: string;
  Position: string;
}

function parseWooCommerceCSV(text: string): WooProduct[] {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const product: Record<string, string> = {};
    headers.forEach((header, i) => {
      product[header] = row[i] || '';
    });
    return product as unknown as WooProduct;
  });
}

function extractImageUrls(imagesStr: string): string[] {
  if (!imagesStr) return [];
  // WooCommerce exports images as comma-separated URLs
  return imagesStr
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.startsWith('http'));
}

// POST /api/import/woocommerce - Import products from WooCommerce CSV
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    const text = await file.text();
    const products = parseWooCommerceCSV(text);

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found in CSV' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    let errors: string[] = [];

    for (const product of products) {
      try {
        // Skip variations (only import simple/variable parent products)
        if (product.Type === 'variation') {
          skipped++;
          continue;
        }

        // Skip if no name
        if (!product.Name) {
          skipped++;
          continue;
        }

        // Check if product already exists by SKU
        if (product.SKU) {
          const existing = await db.product.findFirst({ where: { sku: product.SKU } });
          if (existing) {
            skipped++;
            continue;
          }
        }

        const price = parseFloat(product['Regular price']) || parseFloat(product['Sale price']) || 0;
        const stock = parseInt(product.Stock) || 0;
        const images = extractImageUrls(product.Images);

        // Create or find category
        let finalCategoryId = categoryId;
        if (product.Categories && !categoryId) {
          const categoryName = product.Categories.split(',')[0].trim();
          if (categoryName) {
            let category = await db.category.findFirst({
              where: {
                name: categoryName,
                deletedAt: null,
                ...(storeId ? { storeId } : {})
              },
            });
            if (!category) {
              category = await db.category.create({
                data: {
                  name: categoryName,
                  slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  isActive: true,
                  ...(storeId ? { storeId } : {}),
                },
              });
            }
            finalCategoryId = category.id;
          }
        }

        await db.product.create({
          data: {
            name: product.Name,
            slug: product.Name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: product.Description || '',
            shortDescription: product['Short description'] || undefined,
            price,
            stock,
            sku: product.SKU || undefined,
            images: JSON.stringify(images),
            isActive: product.Published === '1' && product.Status !== 'private',
            categoryId: finalCategoryId || undefined,
            ...(storeId ? { storeId } : {}),
          },
        });

        imported++;
      } catch (err) {
        errors.push(`Failed to import "${product.Name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      errors: errors.slice(0, 10),
      total: products.length,
    });
  } catch (error) {
    console.error('WooCommerce import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
