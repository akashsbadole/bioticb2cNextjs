import { db } from "../src/lib/db";
import { parseCSV } from "../src/lib/utils";
import * as fs from "fs";
import * as path from "path";

const STORE_SLUG = process.env.DEFAULT_STORE_SLUG || "vedika-ayurveda";

const COLUMNS: Record<string, number> = {};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function generateExcerpt(text: string, maxLen = 200): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

async function getStoreId(): Promise<string | null> {
  const store = await db.store.findFirst({ where: { slug: STORE_SLUG } });
  return store?.id || null;
}

function getCol(row: string[], col: string, rows: string[][]): string {
  const idx = COLUMNS[col];
  if (idx === undefined) return "";
  const val = idx < row.length ? row[idx] : "";
  return val.replace(/""/g, '"');
}

function findColumns(header: string[]) {
  const map: Record<string, number> = {};
  header.forEach((name, idx) => {
    const clean = name.trim().toLowerCase().replace(/^"+|"+$/g, "").trim();
    map[clean] = idx;
  });
  return map;
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npx tsx scripts/seed-blog-from-csv.ts <path-to-csv>");
    process.exit(1);
  }

  const storeId = await getStoreId();
  if (!storeId) {
    console.error(`Store with slug "${STORE_SLUG}" not found`);
    process.exit(1);
  }
  console.log(`Importing blog posts for store ID: ${storeId}\n`);

  const csvContent = fs.readFileSync(path.resolve(csvPath), "utf-8");
  const rows = parseCSV(csvContent);

  if (rows.length < 2) {
    console.error("CSV has no data rows");
    process.exit(1);
  }

  const header = rows[0].map((h) => h.replace(/^"+|"+$/g, "").trim());
  Object.assign(COLUMNS, findColumns(header));

  console.log(`Columns found: ${header.length}`);
  console.log(`Data rows: ${rows.length - 1}\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    const title = getCol(row, "post_title", rows);
    if (!title) {
      skipped++;
      continue;
    }

    const rawContent = getCol(row, "post_content", rows);
    const content = rawContent;

    const rawExcerpt = getCol(row, "post_excerpt", rows);
    const excerpt = rawExcerpt || generateExcerpt(content, 250);

    const rawSlug = getCol(row, "post_name", rows);
    const slug = rawSlug ? slugify(rawSlug) : slugify(title);

    const rawDate = getCol(row, "post_date", rows);
    const publishedAt = rawDate ? new Date(rawDate) : new Date();
    if (isNaN(publishedAt.getTime())) {
      skipped++;
      continue;
    }

    const category = getCol(row, "ds_cat_name", rows) ||
      getCol(row, "post_category", rows) ||
      "Uncategorized";

    const keywords = getCol(row, "ds_keywords", rows) ||
      getCol(row, "rank_math_focus_keyword", rows) || "";

    const tags = JSON.stringify(
      keywords
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean)
        .concat(category !== "Uncategorized" ? [category] : []),
    );

    const coverImage = getCol(row, "featured_image", rows) || "";

    const status = getCol(row, "post_status", rows);
    const isPublished = status === "publish";

    const existing = await db.blogPost.findFirst({
      where: { slug, storeId },
    });

    if (existing) {
      console.log(`  Updating "${title.slice(0, 50)}..."`);
      await db.blogPost.update({
        where: { id: existing.id },
        data: {
          title,
          content,
          excerpt,
          tags,
          publishedAt,
          isPublished,
          coverImage: coverImage || null,
        },
      });
      updated++;
    } else {
      console.log(`  Creating "${title.slice(0, 50)}..."`);
      await db.blogPost.create({
        data: {
          storeId,
          title,
          slug,
          content,
          excerpt,
          tags,
          publishedAt,
          isPublished,
          coverImage: coverImage || null,
        },
      });
      created++;
    }
  }

  console.log(`\nDone! Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
