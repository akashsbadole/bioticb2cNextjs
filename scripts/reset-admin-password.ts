import { hash } from 'bcryptjs'
import { db } from '../src/lib/db'

// Resets admin user passwords (forgot the old ones? run this).
// Usage:
//   npx tsx scripts/reset-admin-password.ts "admin@store.com" "NewPass123!"
async function main() {
  const email = process.argv[2]
  const newPassword = process.argv[3]
  if (!email || !newPassword) {
    console.error('Usage: npx tsx scripts/reset-admin-password.ts <email> <new-password>')
    process.exit(1)
  }
  const hashed = await hash(newPassword, 10)
  const result = await db.user.updateMany({
    where: { email, role: 'admin' },
    data: { password: hashed },
  })
  console.log(`Updated ${result.count} admin user(s) for ${email}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => process.exit(0))
