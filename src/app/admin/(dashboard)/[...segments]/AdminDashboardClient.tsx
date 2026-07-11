'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function AdminDashboardClient({ section, initialUser }: { section: string; initialUser: AdminUser }) {
  const router = useRouter();
  const { setAdminLogin, setAdminLogout } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setAdminLogin(initialUser, 'nextauth');
  }, [initialUser, setAdminLogin]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setAdminLogout();
    router.push('/');
  };

  const handleNavigate = (page: string, data?: unknown) => {
    if (page === 'home') {
      router.push('/');
    } else if (page === 'admin') {
      const targetSection = (data as string) || 'overview';
      router.push(`/admin/${targetSection}`);
    }
  };

  if (!hydrated) return null;

  return (
    <AdminDashboard
      user={initialUser}
      activeTab={section}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}
