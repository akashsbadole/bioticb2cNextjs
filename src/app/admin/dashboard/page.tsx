import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/admin');
  }

  const role = (user.publicMetadata?.role as string) || 'clerk';

  if (role !== 'admin' && role !== 'clerk' && role !== 'editor') {
    redirect('/');
  }

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true, email: true, name: true, role: true },
  });

  return (
    <AdminDashboardClient
      initialUser={dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      } : {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0].emailAddress,
        role: role,
      }}
    />
  );
}
