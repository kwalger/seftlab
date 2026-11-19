'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/use-app-store';
import {
  getDashboardHomeForUser,
  isSuperAdminEmail,
} from '@/lib/auth-constants';

import { UserSession } from '@/types';

function readCookieValue(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const raw = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`))?.[1];
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, hasHydrated, loginUser } = useAppStore();

  useEffect(() => {
    if (!hasHydrated && !user) return;

    let cancelled = false;

    const redirectUsingSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (!cancelled && data?.authenticated && data.user) {
            const serverUser = data.user as UserSession;
            if (
              !user ||
              user.role !== serverUser.role ||
              user.email?.toLowerCase() !== serverUser.email?.toLowerCase()
            ) {
              loginUser(serverUser);
            }
            router.replace(getDashboardHomeForUser(serverUser));
            return;
          }
        }
      } catch {
        // Fall back to local store/cookie check
      }

      if (cancelled) return;

      const cookieRole = readCookieValue('seftlab_role');
      const cookieEmail = readCookieValue('seftlab_email');
      const email = user?.email || cookieEmail;

      if (isSuperAdminEmail(email)) {
        router.replace('/admin');
        return;
      }

      const target = getDashboardHomeForUser({
        email,
        role: user?.role || cookieRole,
      });
      router.replace(target);
    };

    redirectUsingSession();

    return () => {
      cancelled = true;
    };
  }, [user, hasHydrated, loginUser, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#526077]">
      جارٍ توجيهك إلى لوحة التحكم الخاصة بك...
    </div>
  );
}
