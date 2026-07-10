import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCSV } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

type Platform = 'native' | 'woocommerce' | 'shopify';

const WC_HEADERS = ['post_title', 'post_name', 'post_status', 'regular_price', 'sale_price', 'sku', 'tax:product_cat'];
const SHOPIFY_HEADERS = ['title', 'handle', 'body (html)', 'variant sku', 'variant price', 'variant compare at price', 'image src', 'type'];

function detectPlatform(headers: string[]): { platform: Platform; confidence: number } {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());

  const wcMatch = WC_HEADERS.filter(h => lowerHeaders.includes(h)).length;
  const shopifyMatch = SHOPIFY_HEADERS.filter(h => lowerHeaders.includes(h)).length;

  if (wcMatch >= 3) return { platform: 'woocommerce', confidence: wcMatch / WC_HEADERS.length };
  if (shopifyMatch >= 3) return { platform: 'shopify', confidence: shopifyMatch / SHOPIFY_HEADERS.length };

  if (lowerHeaders.includes('name') || lowerHeaders.includes('price')) {
    return { platform: 'native', confidence: 1 };
  }

  return { platform: 'native', confidence: 0 };
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function resolveCategory(categoryName: string, storeId?: string | null): Promise<{ id: string; created: boolean } | null> {
  if (!categoryName || !categoryName.trim()) return null;
  const name = categoryName.trim();

  const existing = await db.category.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      ...(storeId ? { storeId } : {}),
    },
  });

  if (existing) return { id: existing.id, created: false };

  const created = await db.category.create({
    data: {
      name,
      slug: normalizeSlug(name),
      isActive: true,
      sortOrder: 0,
      ...(storeId ? { storeId } : {}),
    },
  });

  return { id: created.id, created: true };
}

function getValue(headers: string[], row: string[], field: string): string {
  const idx = headers.findIndex(h => h.toLowerCase().trim() === field.toLowerCase());
  return idx >= 0 && idx < row.length ? row[idx].trim() : '';
}

interface ProductData {
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  wholesalePrice: number | null;
  minOrderQty: number;
  sku: string | null;
  images: string;
  categoryId: string | null;
  whatsappNumber: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  stock: number;
  lowStockThreshold: number;
  specifications: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

function parseNativeRow(headers: string[], row: string[]): ProductData | null {
  const name = getValue(headers, row, 'name');
  if (!name) return null;

  const price = parseFloat(getValue(headers, row, 'price'));
  if (isNaN(price)) return null;

  return {
    name,
    slug: getValue(headers, row, 'slug') || normalizeSlug(name),
    description: getValue(headers, row, 'description') || null,
    shortDescription: getValue(headers, row, 'shortdescription') || null,
    price,
    comparePrice: parseFloat(getValue(headers, row, 'compareprice')) || null,
    wholesalePrice: parseFloat(getValue(headers, row, 'wholesaleprice')) || null,
    minOrderQty: parseInt(getValue(headers, row, 'minorderqty')) || 1,
    sku: getValue(headers, row, 'sku') || null,
    images: JSON.stringify([]),
    categoryId: getValue(headers, row, 'categoryid') || null,
    whatsappNumber: getValue(headers, row, 'whatsappnumber') || null,
    isFeatured: getValue(headers, row, 'isfeatured')?.toLowerCase() === 'true',
    isActive: getValue(headers, row, 'isactive')?.toLowerCase() !== 'false',
    sortOrder: parseInt(getValue(headers, row, 'sortorder')) || 0,
    stock: parseInt(getValue(headers, row, 'stock')) || 0,
    lowStockThreshold: parseInt(getValue(headers, row, 'lowstockthreshold')) || 10,
    specifications: null,
    metaTitle: getValue(headers, row, 'metatitle') || null,
    metaDescription: getValue(headers, row, 'metadescription') || null,
  };
}

function parseWooCommerceRow(headers: string[], row: string[], images: string[]): ProductData | null {
  const name = getValue(headers, row, 'post_title');
  if (!name) return null;

  const price = parseFloat(getValue(headers, row, 'regular_price'));
  if (isNaN(price)) return null;

  const slug = getValue(headers, row, 'post_name') || normalizeSlug(name);
  const status = getValue(headers, row, 'post_status');
  const stockStr = getValue(headers, row, 'stock');

  const imgSrc = getValue(headers, row, 'images');
  if (imgSrc) {
    const parsed = imgSrc.split(';').map(s => s.trim()).filter(Boolean);
    parsed.forEach(u => { if (!images.includes(u)) images.push(u); });
  }

  return {
    name,
    slug,
    description: null,
    shortDescription: null,
    price,
    comparePrice: parseFloat(getValue(headers, row, 'sale_price')) || null,
    wholesalePrice: null,
    minOrderQty: 1,
    sku: getValue(headers, row, 'sku') || null,
    images: JSON.stringify(images),
    categoryId: null,
    whatsappNumber: null,
    isFeatured: false,
    isActive: status === 'publish',
    sortOrder: 0,
    stock: parseInt(stockStr) || 0,
    lowStockThreshold: 10,
    specifications: null,
    metaTitle: null,
    metaDescription: null,
  };
}

interface ShopifyRow {
  handle: string;
  title: string;
  bodyHtml: string;
  variantSku: string;
  variantPrice: number;
  variantComparePrice: number | null;
  variantQty: number;
  imageSrc: string;
  categoryName: string;
  isPublished: boolean;
  tags: string;
}

function parseShopifyRows(headers: string[], rows: string[][]): Map<string, ShopifyRow[]> {
  const grouped = new Map<string, ShopifyRow[]>();

  for (const row of rows) {
    const handle = getValue(headers, row, 'handle');
    if (!handle) continue;

    const title = getValue(headers, row, 'title');
    const variantPrice = parseFloat(getValue(headers, row, 'variant price'));
    if (!title || isNaN(variantPrice)) continue;

    const parsed: ShopifyRow = {
      handle,
      title,
      bodyHtml: getValue(headers, row, 'body (html)'),
      variantSku: getValue(headers, row, 'variant sku'),
      variantPrice,
      variantComparePrice: parseFloat(getValue(headers, row, 'variant compare at price')) || null,
      variantQty: parseInt(getValue(headers, row, 'variant inventory qty')) || 0,
      imageSrc: getValue(headers, row, 'image src'),
      categoryName: getValue(headers, row, 'type'),
      isPublished: getValue(headers, row, 'published')?.toLowerCase() === 'true',
      tags: getValue(headers, row, 'tags'),
    };

    const existing = grouped.get(handle) || [];
    existing.push(parsed);
    grouped.set(handle, existing);
  }

  return grouped;
}

function mergeShopifyProduct(rows: ShopifyRow[], storeId?: string | null): ProductData & { categoryName: string } {
  const first = rows[0];

  const images: string[] = [];
  rows.forEach(r => {
    if (r.imageSrc && !images.includes(r.imageSrc)) {
      images.push(r.imageSrc);
    }
  });

  const allTags = [...new Set(rows.map(r => r.tags).filter(Boolean))];

  return {
    name: first.title,
    slug: normalizeSlug(first.handle),
    description: first.bodyHtml || null,
    shortDescription: null,
    price: first.variantPrice,
    comparePrice: first.variantComparePrice,
    wholesalePrice: null,
    minOrderQty: 1,
    sku: first.variantSku || null,
    images: JSON.stringify(images),
    categoryId: null,
    categoryName: first.categoryName,
    whatsappNumber: null,
    isFeatured: false,
    isActive: first.isPublished,
    sortOrder: 0,
    stock: rows.reduce((sum, r) => sum + r.variantQty, 0),
    lowStockThreshold: 10,
    specifications: allTags.length > 0 ? JSON.stringify({ tags: allTags }) : null,
    metaTitle: null,
    metaDescription: null,
  };
}

import { getStoreId } from '@/lib/store-db';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const forcePlatform = formData.get('platform') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are accepted' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      return NextResponse.json(
        { error: 'CSV must have a header row and at least one data row' },
        { status: 400 }
      );
    }

    const headers = rows[0].map(h => h.trim());
    const dataRows = rows.slice(1).filter(r => r.some(cell => cell.trim() !== ''));

    const { platform } = forcePlatform
      ? { platform: forcePlatform as Platform }
      : detectPlatform(headers);

    const errors: string[] = [];
    let imported = 0;
    let createdCategories = 0;

    if (platform === 'shopify') {
      // Group Shopify rows by Handle and merge variants
      const grouped = parseShopifyRows(headers, dataRows);

      for (const [handle, variants] of grouped) {
        try {
          const productData = mergeShopifyProduct(variants);

          // Resolve category
          if (productData.categoryName) {
            const result = await resolveCategory(productData.categoryName);
            if (result) {
              productData.categoryId = result.id;
              if (result.created) createdCategories++;
            }
          }

          // Check for duplicate slug
          const existing = await db.product.findFirst({ where: { slug: productData.slug } });
          if (existing) {
            productData.slug = `${productData.slug}-${Date.now()}`;
          }

          const { categoryName, ...createData } = productData;
          await db.product.create({
            data: {
              ...createData,
              ...(storeId ? { storeId } : {})
            }
          });
          imported++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`Handle "${handle}": ${msg}`);
        }
      }
    } else {
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowNum = i + 2;

        try {
          let productData: ProductData | null = null;
          const images: string[] = [];

          if (platform === 'woocommerce') {
            productData = parseWooCommerceRow(headers, row, images);

            // Resolve category from tax:product_cat
            const catName = getValue(headers, row, 'tax:product_cat');
            if (catName && productData) {
              const result = await resolveCategory(catName);
              if (result) {
                productData.categoryId = result.id;
                if (result.created) createdCategories++;
              }
            }
          } else {
            productData = parseNativeRow(headers, row);
          }

          if (!productData) {
            errors.push(`Row ${rowNum}: Missing required fields (name/price)`);
            continue;
          }

          // Check for duplicate slug
          const existing = await db.product.findFirst({ where: { slug: productData.slug } });
          if (existing) {
            productData.slug = `${productData.slug}-${rowNum}`;
          }

          await db.product.create({
            data: {
              ...productData,
              ...(storeId ? { storeId } : {})
            }
          });
          imported++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`Row ${rowNum}: ${msg}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      platform,
      imported,
      categoriesCreated: createdCategories,
      errors,
    });
  } catch (error) {
    console.error('Import products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
