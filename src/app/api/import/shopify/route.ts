import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCSV } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

interface ShopifyProduct {
  Handle: string;
  Title: string;
  Body: string;
  Vendor: string;
  Type: string;
  Tags: string;
  Published: string;
  'Variant SKU': string;
  'Variant Price': string;
  'Variant Compare At Price': string;
  'Variant Inventory Qty': string;
  'Variant Weight': string;
  'Variant Weight Unit': string;
  'Image Src': string;
  'Image Alt Text': string;
  'Option1 Name': string;
  'Option1 Value': string;
  'Option2 Name': string;
  'Option2 Value': string;
  Status: string;
}

function parseShopifyCSV(text: string): ShopifyProduct[] {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const product: Record<string, string> = {};
    headers.forEach((header, i) => {
      product[header] = row[i] || '';
    });
    return product as unknown as ShopifyProduct;
  });
}

function getFirstImage(products: ShopifyProduct[], handle: string): string {
  const product = products.find((p) => p.Handle === handle && p['Image Src']);
  return product?.['Image Src'] || '';
}

function getAllImages(products: ShopifyProduct[], handle: string): string[] {
  return products
    .filter((p) => p.Handle === handle && p['Image Src'])
    .map((p) => p['Image Src'])
    .filter(Boolean);
}

// POST /api/import/shopify - Import products from Shopify CSV
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
    const products = parseShopifyCSV(text);

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found in CSV' }, { status: 400 });
    }

    // Group by Handle (Shopify product identifier)
    const grouped = new Map<string, ShopifyProduct[]>();
    for (const product of products) {
      const handle = product.Handle;
      if (!grouped.has(handle)) {
        grouped.set(handle, []);
      }
      grouped.get(handle)!.push(product);
    }

    let imported = 0;
    let skipped = 0;
    let errors: string[] = [];

    for (const [handle, variants] of grouped) {
      try {
        const firstVariant = variants[0];

        // Skip if no title
        if (!firstVariant.Title) {
          skipped++;
          continue;
        }

        // Check if product already exists by SKU
        const sku = firstVariant['Variant SKU'];
        if (sku) {
          const existing = await db.product.findFirst({ where: { sku } });
          if (existing) {
            skipped++;
            continue;
          }
        }

        const price = parseFloat(firstVariant['Variant Price']) || 0;
        const stock = parseInt(firstVariant['Variant Inventory Qty']) || 0;
        const images = getAllImages(grouped.size > 0 ? products : [], handle);

        await db.product.create({
          data: {
            name: firstVariant.Title,
            slug: handle || firstVariant.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: firstVariant.Body || '',
            price,
            stock,
            sku: sku || undefined,
            images: JSON.stringify(images),
            isActive: firstVariant.Published === 'TRUE' || firstVariant.Status === 'active',
            categoryId: categoryId || undefined,
            ...(storeId ? { storeId } : {}),
          },
        });

        imported++;
      } catch (err) {
        errors.push(`Failed to import "${handle}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      errors: errors.slice(0, 10), // Return first 10 errors
      total: grouped.size,
    });
  } catch (error) {
    console.error('Shopify import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
