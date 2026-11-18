'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAppStore } from '@/store/use-app-store';
import { UserRole, UserSession } from '@/types';
import { isSuperAdminEmail, resolveUserRole } from '@/lib/auth-constants';

export function FirebaseAuthSync() {
  const { loginUser } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userEmail = fbUser.email?.toLowerCase().trim() || '';
        const isSuperAdmin = isSuperAdminEmail(userEmail);

        let role: UserRole = isSuperAdmin ? 'admin' : 'student';
        let name =
          fbUser.displayName ||
          (userEmail ? userEmail.split('@')[0] : 'مستخدم منصة SEFT Lab');
        let photo = fbUser.photoURL || '';

        // إذا كان المستخدم سوبر أدمن، يُفعّل فوراً بدون أي تأخير
        if (isSuperAdmin) {
          const uidDocRef = doc(db, 'users', fbUser.uid);
          setDoc(
            uidDocRef,
            {
              name,
              email: userEmail,
              role: 'admin',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch(() => {});
        } else {
          try {
            const timeout = new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error('TIMEOUT')), 4000)
            );

            // 1. استعلام بالـ UID
            const uidDocRef = doc(db, 'users', fbUser.uid);
            let snap = (await Promise.race([
              getDoc(uidDocRef),
              timeout,
            ])) as any;

            let docData: any = null;

            if (snap && typeof snap.exists === 'function' && snap.exists()) {
              docData = snap.data();
            } else if (userEmail) {
              try {
                const q = query(collection(db, 'users'), where('email', '==', userEmail));
                const qSnap = (await Promise.race([
                  getDocs(q),
                  timeout,
                ])) as any;
                if (qSnap && !qSnap.empty) {
                  docData = qSnap.docs[0].data();
                }
              } catch {}
            }

            if (docData) {
              if (docData.name) name = docData.name;
              if (docData.photoURL) photo = docData.photoURL;
              if (docData.role) {
                role = resolveUserRole(userEmail, docData.role, true);
              }
            } else {
              setDoc(uidDocRef, {
                name,
                email: userEmail,
                photoURL: photo,
                role: 'student',
                createdAt: new Date().toISOString(),
              }).catch(() => {});
            }
          } catch (err) {
            console.warn('[AuthSync] Note:', err);
          }
        }

        // Set cookies locally for immediate client navigation
        if (typeof document !== 'undefined') {
          document.cookie = `seftlab_role=${role}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `tadreebak_role=${role}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `seftlab_email=${encodeURIComponent(userEmail)}; path=/; max-age=604800; SameSite=Lax`;
        }

        // Sync signed session cookie to server via Edge API route using verified Firebase ID Token
        try {
          const idToken = await fbUser.getIdToken();
          fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idToken,
              name,
              role,
            }),
          }).catch((e) => console.warn('[FirebaseAuthSync] sync-session fetch error:', e));
        } catch {}

        const session: UserSession = {
          id: fbUser.uid,
          name: name,
          username: userEmail ? userEmail.split('@')[0] : 'user',
          email: userEmail,
          role: role,
          organizationOrUniversity: isSuperAdmin ? 'إدارة منصة SEFT Lab' : 'جامعة الزرقاء',
          approvalStatus: 'approved',
          avatarUrl: photo || undefined,
          photoURL: photo || undefined,
        };

        loginUser(session);
      }
    });

    return () => unsubscribe();
  }, [loginUser]);

  return null;
}
