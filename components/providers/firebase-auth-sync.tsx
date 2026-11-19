'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isSuperAdminEmail } from '@/lib/auth-constants';
import { ensureFirestoreUserDocument } from '@/lib/client-user-sync';
import { useAppStore } from '@/store/use-app-store';
import { UserRole, UserSession } from '@/types';

function readRoleCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie.match(/(?:^|;\s*)seftlab_role=([^;]+)/)?.[1];
}

export function FirebaseAuthSync() {
  const pathname = usePathname();
  const { loginUser, hasHydrated } = useAppStore();
  const reconciledRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (pathname === '/login' || pathname === '/register') {
      return;
    }

    const currentUser = useAppStore.getState().user;
    const cookieRole = readRoleCookie();
    const roleMismatch = Boolean(cookieRole && currentUser?.role !== cookieRole);

    if (reconciledRef.current && !roleMismatch) {
      return;
    }

    let cancelled = false;
    reconciledRef.current = true;

    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.authenticated || !data.user) return;
        const serverUser = data.user as UserSession;
        const latestUser = useAppStore.getState().user;
        const sameEmail = Boolean(
          latestUser?.email &&
            serverUser.email &&
            latestUser.email.toLowerCase() === serverUser.email.toLowerCase()
        );

        if (
          !latestUser ||
          latestUser.role !== serverUser.role ||
          (serverUser.email &&
            latestUser.email?.toLowerCase() !== serverUser.email.toLowerCase())
        ) {
          loginUser({
            ...serverUser,
            avatarUrl: sameEmail ? latestUser?.avatarUrl : undefined,
            photoURL: sameEmail ? latestUser?.photoURL : undefined,
          });
        }

        if (typeof document !== 'undefined') {
          document.cookie = `seftlab_role=${serverUser.role}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `tadreebak_role=${serverUser.role}; path=/; max-age=604800; SameSite=Lax`;
          if (serverUser.email) {
            document.cookie = `seftlab_email=${encodeURIComponent(
              serverUser.email
            )}; path=/; max-age=604800; SameSite=Lax`;
          }
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, pathname, loginUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        if (
          typeof window !== 'undefined' &&
          (window.location.pathname === '/login' ||
            window.location.pathname === '/register')
        ) {
          return;
        }

        const userEmail = fbUser.email?.toLowerCase().trim() || '';
        const isSuper = isSuperAdminEmail(userEmail);

        if (isSuper && typeof document !== 'undefined') {
          document.cookie = `seftlab_role=admin; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `tadreebak_role=admin; path=/; max-age=604800; SameSite=Lax`;
          if (userEmail) {
            document.cookie = `seftlab_email=${encodeURIComponent(
              userEmail
            )}; path=/; max-age=604800; SameSite=Lax`;
          }
        }

        const resolved = await ensureFirestoreUserDocument({
          uid: fbUser.uid,
          email: userEmail,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          role: isSuper ? 'admin' : undefined,
          createdAt: fbUser.metadata?.creationTime || undefined,
        });

        const finalRole: UserRole = isSuper ? 'admin' : resolved.role;
        const finalEmail = resolved.email || userEmail;

        // Set cookies locally for immediate client navigation
        if (typeof document !== 'undefined') {
          document.cookie = `seftlab_role=${finalRole}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `tadreebak_role=${finalRole}; path=/; max-age=604800; SameSite=Lax`;
          if (finalEmail) {
            document.cookie = `seftlab_email=${encodeURIComponent(
              finalEmail
            )}; path=/; max-age=604800; SameSite=Lax`;
          }
        }

        // Sync signed session cookie to server via Edge API route using verified Firebase ID Token
        try {
          const idToken = await fbUser.getIdToken();
          await fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idToken,
              name: resolved.displayName,
              role: finalRole,
              photoURL: resolved.photoURL || undefined,
              organizationOrUniversity: resolved.organizationOrUniversity,
            }),
          }).catch((e) =>
            console.warn('[FirebaseAuthSync] sync-session fetch error:', e)
          );
        } catch {}

        const session: UserSession = {
          id: fbUser.uid,
          name: resolved.displayName,
          username: resolved.slug,
          email: finalEmail,
          role: finalRole,
          organizationOrUniversity: resolved.organizationOrUniversity,
          approvalStatus: 'approved',
          avatarUrl: resolved.photoURL || undefined,
          photoURL: resolved.photoURL || undefined,
        };

        loginUser(session);
      }
    });

    return () => unsubscribe();
  }, [loginUser]);

  return null;
}
