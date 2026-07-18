import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { getEnv } from '@/lib/env'

// Validate environment configuration at module load (audit 11.1).
// Throws early if required secrets/config are missing or invalid.
getEnv()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DB_URL
  if (tursoUrl) {
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    return new PrismaClient({ adapter })
  }
  // Tuning for production (audit 7.5): bound the connection pool and fail
  // slow queries instead of letting them pile up and exhaust connections.
  const connectionLimit = Number(process.env.DATABASE_CONNECTION_LIMIT || 10)
  const databaseUrl = applyConnectionLimit(process.env.DATABASE_URL || '', connectionLimit)
  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    // log slow queries in development only to avoid noisy production logs
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  }).$extends({
    query: { $allModels: { async $allOperations({ query, args, model, operation }) {
      const start = Date.now()
      const MAX_QUERY_MS = Number(process.env.DATABASE_QUERY_TIMEOUT_MS || 10000)
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Query timeout after ${MAX_QUERY_MS}ms: ${model}.${operation}`)), MAX_QUERY_MS)
      )
      try {
        return await Promise.race([query(args), timeout])
      } finally {
        const elapsed = Date.now() - start
        if (elapsed > 1000) console.warn(`Slow query ${model}.${operation} took ${elapsed}ms`)
      }
    } } },
  }) as unknown as PrismaClient
}

function applyConnectionLimit(url: string, limit: number): string {
  if (!url) return url
  if (/[?&]connection_limit=/.test(url)) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}connection_limit=${limit}`
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
