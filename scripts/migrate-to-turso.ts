import { createClient } from '@libsql/client'
import * as path from 'path'
import * as fs from 'fs'

// Load .env manually since tsx doesn't auto-load it
const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = val
    }
  }
}

async function main() {
  const tursoUrl = process.env.TURSO_DB_URL
  if (!tursoUrl) {
    console.error('TURSO_DB_URL not set in .env')
    process.exit(1)
  }

  const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db')
  if (!fs.existsSync(dbPath)) {
    console.error(`Local database not found: ${dbPath}`)
    process.exit(1)
  }

  // Connect to local SQLite
  console.log(`Reading from: ${dbPath}`)
  const local = createClient({ url: `file:${dbPath}` })

  // Connect to Turso
  console.log(`Writing to: ${tursoUrl}\n`)
  const turso = createClient({
    url: tursoUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  // 1. Get schema from local SQLite
  const schemaRows = await local.execute(
    "SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL ORDER BY name",
  )
  const tables = schemaRows.rows.map((r: any) => r.sql as string)

  // Reorder: create FK-parent tables first
  // Simple heuristic: move tables without FK references to the front
  function tableName(sql: string): string {
    const m = sql.match(/CREATE TABLE\s+"?(\w+)"?/i)
    return m ? m[1].toLowerCase() : ''
  }

  const DEP_TABLES_FIRST = new Set([
    'user', 'store', 'newslettersubscriber', 'otptoken', 'ratelimitentry',
    'plugin', 'theme',
  ])

  tables.sort((a, b) => {
    const na = tableName(a)
    const nb = tableName(b)
    if (DEP_TABLES_FIRST.has(na) && !DEP_TABLES_FIRST.has(nb)) return -1
    if (!DEP_TABLES_FIRST.has(na) && DEP_TABLES_FIRST.has(nb)) return 1
    return 0
  })

  // 2. Create tables in Turso
  for (const sql of tables) {
    const name = tableName(sql)
    try {
      // Drop first to start clean
      await turso.execute(`DROP TABLE IF EXISTS "${name}"`)
      await turso.execute(sql)
      console.log(`  Created table: ${name}`)
    } catch (err) {
      console.error(`  FAILED to create ${name}:`, err)
    }
  }

  // 3. Migrate data table by table
  const TABLE_ORDER = [
    'User', 'Store', 'NewsletterSubscriber', 'OtpToken', 'RateLimitEntry',
    'PasswordResetToken', 'EmailVerificationToken',
    'Category', 'Brand', 'Product', 'ProductVariant', 'ProductAddon',
    'Bundle', 'BundleItem',
    'ContentPage', 'BlogPost', 'Menu', 'MenuItem',
    'SiteSetting', 'Popup', 'Banner', 'Media', 'Redirect',
    'Coupon', 'ShippingRate', 'FlashSale', 'FlashSaleProduct',
    'Order', 'OrderItem', 'Cart', 'CartItem', 'Wishlist',
    'Review', 'CustomerPrice', 'Enquiry', 'StockNotification',
    'SupportTicket', 'ActivityLog', 'Notification',
  ]

  let totalRows = 0

  for (const table of TABLE_ORDER) {
    try {
      // Read all rows from local
      const result = await local.execute({
        sql: `SELECT * FROM "${table}"`,
        args: [],
      })

      if (result.rows.length === 0) {
        console.log(`  ${table}: 0 rows`)
        continue
      }

      const rows = result.rows as Record<string, any>[]
      const columns = Object.keys(rows[0])

      // Delete existing in Turso
      await turso.execute(`DELETE FROM "${table}"`)

      // Insert in batches
      const BATCH = 100
      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH)
        const placeholders = batch
          .map((_, ri) => `(${columns.map((_, ci) => `$${ri}_${ci}`).join(',')})`)
          .join(',')
        const flatArgs: any[] = []
        const flatKeys: string[] = []
        for (const row of batch) {
          for (const col of columns) {
            flatKeys.push(`${row}_${col}`)
            flatArgs.push(row[col])
          }
        }
        // Build positional INSERT
        const vals = batch
          .map((_, ri) =>
            `(${columns.map((_, ci) => `?`).join(',')})`,
          )
          .join(',')
        const flat = batch.flatMap((row) => columns.map((c) => row[c]))
        await turso.execute({
          sql: `INSERT OR IGNORE INTO "${table}" (${columns.map((c) => `"${c}"`).join(',')}) VALUES ${vals}`,
          args: flat,
        })
      }

      console.log(`  ${table}: ${rows.length} rows`)
      totalRows += rows.length
    } catch (err) {
      console.error(`  FAILED ${table}:`, err)
    }
  }

  console.log(`\nDone! ${totalRows} rows migrated to Turso.`)

  local.close()
  turso.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
