'use client';

import { useSearchParams, useRouter } from 'next/navigation';
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

export default function AdminDashboardClient({ initialUser }: { initialUser: AdminUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';
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
      const targetTab = (data as string) || 'dashboard';
      router.push(`/admin/dashboard?tab=${targetTab}`);
    }
  };

  if (!hydrated) return null;

  return (
    <AdminDashboard
      user={initialUser}
      activeTab={tab}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}
