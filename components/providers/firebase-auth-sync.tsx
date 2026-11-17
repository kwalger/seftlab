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
        let foundMethod = isSuperAdmin ? 'superadmin_hardcoded' : 'default_student';

        try {
          const timeout = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), 3500)
          );

          // 1. Try querying document by fbUser.uid
          const uidDocRef = doc(db, 'users', fbUser.uid);
          let snap = (await Promise.race([
            getDoc(uidDocRef),
            timeout,
          ])) as any;

          let docData: any = null;

          if (snap && typeof snap.exists === 'function' && snap.exists()) {
            docData = snap.data();
            foundMethod = 'doc_by_uid';
          } else if (userEmail) {
            // 2. Fallback: try querying document by email as ID
            try {
              const emailDocRef = doc(db, 'users', userEmail);
              const emailSnap = (await Promise.race([
                getDoc(emailDocRef),
                timeout,
              ])) as any;
              if (emailSnap && typeof emailSnap.exists === 'function' && emailSnap.exists()) {
                docData = emailSnap.data();
                foundMethod = 'doc_by_email_id';
              }
            } catch {}

            // 3. Fallback: query collection where('email', '==', userEmail)
            if (!docData) {
              try {
                const q = query(collection(db, 'users'), where('email', '==', userEmail));
                const qSnap = (await Promise.race([
                  getDocs(q),
                  timeout,
                ])) as any;
                if (qSnap && !qSnap.empty) {
                  docData = qSnap.docs[0].data();
                  foundMethod = 'query_where_email';
                }
              } catch {}
            }
          }

          if (docData) {
            if (docData.name) name = docData.name;
            if (docData.photoURL) photo = docData.photoURL;
            if (!isSuperAdmin && docData.role) {
              role = resolveUserRole(userEmail, docData.role);
            }
          } else {
            // Create user document if not found
            await Promise.race([
              setDoc(uidDocRef, {
                name,
                email: userEmail,
                photoURL: photo,
                role: isSuperAdmin ? 'admin' : 'student',
                createdAt: new Date().toISOString(),
              }),
              timeout,
            ]).catch(() => {});
          }

          // If Super Admin, ensure document in Firestore is marked as 'admin'
          if (isSuperAdmin) {
            role = 'admin';
            setDoc(
              uidDocRef,
              {
                email: userEmail,
                role: 'admin',
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            ).catch(() => {});
          }
        } catch (err) {
          console.warn('[FirebaseAuthSync] Firestore read error or timeout:', err);
          if (isSuperAdmin) {
            role = 'admin';
            foundMethod = 'superadmin_fallback_after_error';
          }
        }

        // Detailed console diagnostics requested by user
        console.log('🔑 [FirebaseAuthSync] User Authenticated:', {
          uid: fbUser.uid,
          email: userEmail,
          displayName: name,
          resolvedRole: role,
          isSuperAdmin: isSuperAdmin,
          discoveryMethod: foundMethod,
          timestamp: new Date().toISOString(),
        });

        // Set cookies locally for immediate client navigation
        if (typeof document !== 'undefined') {
          document.cookie = `seftlab_role=${role}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `tadreebak_role=${role}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `seftlab_email=${encodeURIComponent(userEmail)}; path=/; max-age=604800; SameSite=Lax`;
        }

        // Sync signed session cookie to server via Edge API route
        try {
          fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: fbUser.uid,
              email: userEmail,
              name: name,
              role: role,
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
