'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/use-app-store';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, hasHydrated } = useAppStore();

  useEffect(() => {
    if (!hasHydrated && !user) return;

    const cookieRole =
      typeof document !== 'undefined'
        ? (document.cookie.match(/(?:^|;\s*)seftlab_role=([^;]+)/)?.[1] as string | undefined)
        : undefined;

    const effectiveRole = user?.role || cookieRole;

    if (effectiveRole === 'company') {
      router.replace('/company');
    } else if (effectiveRole === 'teacher') {
      router.replace('/teacher');
    } else if (effectiveRole === 'admin') {
      router.replace('/admin');
    } else if (effectiveRole === 'student') {
      router.replace('/student');
    } else {
      router.replace('/student');
    }
  }, [user, hasHydrated, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#526077]">
      جارٍ توجيهك إلى لوحة التحكم الخاصة بك...
    </div>
  );
}
