import { createClient } from '@libsql/client'
import { Pool } from 'pg'
import * as path from 'path'
import * as fs from 'fs'

// Load .env manually since tsx doesn't auto-load it.
// Only picks up the keys this script needs (never file: sqlite URLs).
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
      if (key === 'DATABASE_URL' && !val.startsWith('postgresql')) continue
      if (['TARGET_DATABASE_URL', 'DATABASE_URL', 'SQLITE_PATH'].includes(key)) process.env[key] = val
    }
  }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SQLITE_PATH = path.resolve(process.cwd(), process.env.SQLITE_PATH || 'db/bioticnaturals.db')
const TARGET_URL = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL || ''
const DRY_RUN = process.env.DRY_RUN === '1'
const BATCH_SIZE = 100

if (!DRY_RUN && !TARGET_URL.startsWith('postgresql://')) {
  console.error('ERROR: set TARGET_DATABASE_URL (or DATABASE_URL) to a postgresql:// URL')
  process.exit(1)
}
if (!fs.existsSync(SQLITE_PATH)) {
  console.error(`ERROR: SQLite export not found: ${SQLITE_PATH}`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Parse prisma/schema.postgres.prisma into model -> { column: prismaType }
// ---------------------------------------------------------------------------
function parsePostgresSchema(): Map<string, Map<string, string>> {
  const schemaPath = path.resolve(process.cwd(), 'prisma', 'schema.postgres.prisma')
  const lines = fs.readFileSync(schemaPath, 'utf-8').split('\n')
  const models = new Map<string, Map<string, string>>()
  let current: Map<string, string> | null = null
  for (const line of lines) {
    const modelStart = line.match(/^model (\w+) \{/)
    if (modelStart) {
      current = new Map<string, string>()
      models.set(modelStart[1], current)
      continue
    }
    if (current && line.trimStart().startsWith('}')) {
      current = null
      continue
    }
    if (!current) continue
    const f = line.match(/^\s+(\w+)\s+(\w+)/)
    if (!f || f[1].startsWith('@') || f[1].startsWith('_')) continue
    current.set(f[1], f[2].replace(/\?$/, ''))
  }
  return models
}

// ---------------------------------------------------------------------------
// Value casting: SQLite native -> Postgres-friendly
// ---------------------------------------------------------------------------
function castValue(value: unknown, prismaType: string | undefined): unknown {
  if (value === null || value === undefined) return null
  if (!prismaType) return value
  switch (prismaType) {
    case 'Boolean':
      return value === true || value === 1 || value === '1' || value === 'true'
    case 'Int':
      return typeof value === 'number' ? Math.trunc(value) : parseInt(String(value), 10)
    case 'Float':
      return typeof value === 'number' ? value : parseFloat(String(value))
    case 'DateTime':
      if (value instanceof Date) return value.toISOString()
      if (typeof value === 'number') return new Date(value).toISOString()
      // Some exports store epoch milliseconds as TEXT (e.g. "1783744624456")
      if (/^\d{10,}$/.test(String(value))) return new Date(Number(value)).toISOString()
      return String(value)
    default:
      return value
  }
}

// ---------------------------------------------------------------------------
// Table order: parents first (FK safety even if session_replication_role is off)
// ---------------------------------------------------------------------------
const TABLE_ORDER = [
  'User', 'Session', 'Store', 'NewsletterSubscriber', 'OtpToken', 'RateLimitEntry',
  'PasswordResetToken', 'EmailVerificationToken', 'Plugin', 'Theme',
  'Category', 'CustomFieldDefinition', 'CustomFieldValue',
  'Brand', 'Product', 'ProductVariant', 'ProductAddon', 'Bundle', 'BundleItem',
  'ContentPage', 'BlogPost', 'Menu', 'MenuItem',
  'SiteSetting', 'Popup', 'Banner', 'Media', 'Redirect',
  'Coupon', 'ShippingRate', 'FlashSale', 'FlashSaleProduct',
  'Order', 'OrderItem', 'Cart', 'CartItem', 'Wishlist',
  'Review', 'CustomerPrice', 'Enquiry', 'StockNotification',
  'SupportTicket', 'ActivityLog', 'Notification',
]

async function main() {
  console.log(`Source: ${SQLITE_PATH}`)
  if (!DRY_RUN) {
    console.log(`Target: ${TARGET_URL.replace(/:[^:@/]+@/, ':****@')}`)
  }
  console.log(`Mode:   ${DRY_RUN ? 'DRY RUN (no writes, no target needed)' : 'import'}\n`)

  const schema = parsePostgresSchema()

  const local = createClient({ url: `file:${SQLITE_PATH}` })

  if (DRY_RUN) {
    const srcTables = (await local.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name != '_prisma_migrations'",
    )).rows.map((r: any) => r.name as string)
    const ordered = [
      ...TABLE_ORDER.filter((t) => srcTables.includes(t)),
      ...srcTables.filter((t) => !TABLE_ORDER.includes(t)),
    ]
    let totalRows = 0
    for (const table of ordered) {
      const result = await local.execute({ sql: `SELECT * FROM "${table}"`, args: [] })
      const rows = result.rows as Record<string, unknown>[]
      if (rows.length === 0) {
        console.log(`  ${table}: 0 rows`)
        continue
      }
      const columns = Object.keys(rows[0])
      const types = schema.get(table)
      const insertCols = types ? columns.filter((c) => types.has(c)) : columns
      const skipped = columns.filter((c) => !insertCols.includes(c))
      console.log(`  ${table}: ${rows.length} rows (${insertCols.length}/${columns.length} cols mapped${skipped.length ? `, skipped: ${skipped.join(',')}` : ''})`)
      totalRows += rows.length
    }
    local.close()
    console.log(`\nDry run complete: ${totalRows} rows would be imported.`)
    return
  }

  // Aiven uses a self-signed CA chain: Prisma's sslmode=require skips CA
  // verification, but the pg driver treats require as verify-full. Mirror
  // Prisma's behavior (TLS-encrypted, no CA check) for this one-time import.
  const sslMode = TARGET_URL.match(/[?&]sslmode=(\w+)/)?.[1]
  const poolUrl =
    sslMode && sslMode !== 'disable' && sslMode !== 'no-verify'
      ? TARGET_URL.replace(/sslmode=\w+/, 'sslmode=no-verify')
      : TARGET_URL
  const pool = new Pool({ connectionString: poolUrl, max: 1 })
  const client = await pool.connect()
  try {
    await client.query('SELECT 1')

    const tablesExist = await client.query(
      `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Store'`,
    )
    if (tablesExist.rows[0].n === 0) {
      console.error('ERROR: no tables in the target database. Run the "migrate" service first:')
      console.error('  docker compose run --rm migrate')
      process.exit(1)
    }
    // Skip FK checks during import so insertion order never matters.
    await client.query('SET session_replication_role = replica')

    // All tables in the source (creation order from sqlite_master)
    const srcTables = (await local.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name != '_prisma_migrations'",
    )).rows.map((r: any) => r.name as string)

    const ordered = [
      ...TABLE_ORDER.filter((t) => srcTables.includes(t)),
      ...srcTables.filter((t) => !TABLE_ORDER.includes(t)),
    ]

    let totalRows = 0
    let failedTables: string[] = []

    for (const table of ordered) {
      const result = await local.execute({ sql: `SELECT * FROM "${table}"`, args: [] })
      const rows = result.rows as Record<string, unknown>[]
      if (rows.length === 0) {
        console.log(`  ${table}: 0 rows`)
        continue
      }

      const columns = Object.keys(rows[0])
      const types = schema.get(table)
      // Only insert columns that exist in the Postgres schema (skip drift)
      const insertCols = types ? columns.filter((c) => types.has(c)) : columns

      const quoted = insertCols.map((c) => `"${c}"`).join(',')
      try {
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          const batch = rows.slice(i, i + BATCH_SIZE)
          const values: unknown[] = []
          const rowsSql: string[] = []
          for (const row of batch) {
            const placeholders = insertCols
              .map((c, ci) => {
                const v = castValue(row[c], types?.get(c))
                values.push(v)
                return `$${values.length}`
              })
              .join(',')
            rowsSql.push(`(${placeholders})`)
          }
          await client.query(
            `INSERT INTO "${table}" (${quoted}) VALUES ${rowsSql.join(',')} ON CONFLICT DO NOTHING`,
            values,
          )
        }
        console.log(`  ${table}: ${rows.length} rows`)
        totalRows += rows.length
      } catch (err) {
        failedTables.push(table)
        console.error(`  FAILED ${table}:`, err)
      }
    }

    await client.query('SET session_replication_role = DEFAULT')
    local.close()
    console.log(`\nDone! ${totalRows} rows imported.`)
    if (failedTables.length) {
      console.error(`Failed tables: ${failedTables.join(', ')}`)
      process.exitCode = 1
    }
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
