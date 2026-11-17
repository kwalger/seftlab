'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppStore } from '@/store/use-app-store';
import { UserRole, UserSession } from '@/types';

export function FirebaseAuthSync() {
  const { loginUser, user } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        let role: UserRole = 'student';
        let name =
          fbUser.displayName ||
          (fbUser.email ? fbUser.email.split('@')[0] : 'مستخدم منصة SEFT Lab');
        let photo = fbUser.photoURL || '';

        try {
          const timeout = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), 3000)
          );
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = (await Promise.race([
            getDoc(userDocRef),
            timeout,
          ])) as any;

          if (snap && typeof snap.exists === 'function' && snap.exists()) {
            const data = snap.data();
            if (data?.role) role = data.role as UserRole;
            if (data?.name) name = data.name;
            if (data?.photoURL) photo = data.photoURL;
          } else {
            await Promise.race([
              setDoc(userDocRef, {
                name,
                email: fbUser.email || '',
                photoURL: photo,
                role: 'student',
                createdAt: new Date().toISOString(),
              }),
              timeout,
            ]).catch(() => {});
          }
        } catch {
          // offline or timeout safe
        }

        const session: UserSession = {
          id: fbUser.uid,
          name: name,
          username: fbUser.email ? fbUser.email.split('@')[0] : 'user',
          email: fbUser.email || '',
          role: role,
          organizationOrUniversity: 'جامعة الزرقاء',
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
