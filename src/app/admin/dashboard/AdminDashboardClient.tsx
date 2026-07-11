'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminDashboardRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    const section = tab === 'dashboard' ? 'overview' : tab;
    router.replace(`/admin/${section}`);
  }, [tab, router]);

  return null;
}
