const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@store.com';
  const password = 'admin123';

  const existing = await prisma.user.findUnique({ where: { email } });
  const hashed = await hash(password, 12);

  if (existing) {
    await prisma.user.update({ where: { email }, data: { password: hashed, role: 'admin', isActive: true } });
    console.log(`Updated ${email} password to: ${password} (id: ${existing.id})`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: 'Admin',
      email,
      password: hashed,
      role: 'admin',
      isActive: true,
      isVerified: true,
      tier: 'platinum',
    },
  });

  console.log(`Created admin user: ${email} / ${password} (id: ${user.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
