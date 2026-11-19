import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { isSuperAdminEmail } from '@/lib/auth-constants';
import { db } from '@/lib/firebase';
import {
  buildUserSyncPatch,
  mapFirestoreDocToStudentTalent,
  normalizeStudentIdentifier,
  ResolvedUserProfile,
  UserSyncInput,
} from '@/lib/student-profile';
import { StudentTalent } from '@/types';

const FIRESTORE_SYNC_TIMEOUT_MS = 6000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

/**
 * Ensures the authenticated Firebase user has a complete, linked document
 * under `users/{uid}` in Firestore (`uid`, `email`, `displayName`, `username`,
 * `slug`, `profileUrl`, `role`, `createdAt`) without deleting existing fields.
 */
export async function ensureFirestoreUserDocument(
  input: UserSyncInput
): Promise<ResolvedUserProfile> {
  const normalizedEmail = (input.email || '').trim().toLowerCase();
  const isSuper = isSuperAdminEmail(normalizedEmail);
  const normalizedInput: UserSyncInput = {
    ...input,
    email: normalizedEmail,
  };

  let uidDocExists = false;
  let existingData: Record<string, unknown> | null = null;
  let lookupSucceeded = false;

  try {
    const uidDocRef = doc(db, 'users', input.uid);
    const uidSnap = await withTimeout(
      getDoc(uidDocRef),
      FIRESTORE_SYNC_TIMEOUT_MS
    );
    lookupSucceeded = true;
    if (uidSnap.exists()) {
      uidDocExists = true;
      existingData = uidSnap.data() as Record<string, unknown>;
    } else if (normalizedEmail) {
      try {
        const emailQuery = query(
          collection(db, 'users'),
          where('email', '==', normalizedEmail),
          limit(1)
        );
        const querySnap = await withTimeout(
          getDocs(emailQuery),
          FIRESTORE_SYNC_TIMEOUT_MS
        );
        if (!querySnap.empty) {
          existingData = querySnap.docs[0].data() as Record<string, unknown>;
        }
      } catch (emailLookupErr) {
        console.warn('[FirestoreSync] Email fallback lookup warning:', emailLookupErr);
      }
    }
  } catch (err) {
    console.warn('[FirestoreSync] User document lookup warning:', err);
  }

  const { patch, changed, isNew, resolved } = buildUserSyncPatch(
    normalizedInput,
    existingData,
    { forceCreate: lookupSucceeded ? !uidDocExists : false }
  );

  if (lookupSucceeded && (isNew || changed)) {
    try {
      const uidDocRef = doc(db, 'users', input.uid);
      await withTimeout(
        setDoc(uidDocRef, patch, { merge: true }),
        FIRESTORE_SYNC_TIMEOUT_MS
      );
    } catch (writeErr) {
      console.warn('[FirestoreSync] Failed to write user document:', writeErr);
    }
  } else if (isSuper && !lookupSucceeded) {
    try {
      const uidDocRef = doc(db, 'users', input.uid);
      await withTimeout(
        setDoc(
          uidDocRef,
          {
            uid: input.uid,
            email: normalizedEmail,
            displayName: resolved.displayName,
            name: resolved.displayName,
            fullName: resolved.displayName,
            username: resolved.slug,
            slug: resolved.slug,
            profileUrl: resolved.profileUrl,
            role: 'admin',
            status: 'نشط',
            organizationOrUniversity: resolved.organizationOrUniversity,
            university: resolved.organizationOrUniversity,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ),
        FIRESTORE_SYNC_TIMEOUT_MS
      );
    } catch (writeErr) {
      console.warn('[FirestoreSync] Failed to enforce Super Admin doc:', writeErr);
    }
  }

  return resolved;
}

/**
 * Queries Firestore (`users` then `students`) for a student profile by
 * document ID (`uid`), `slug`, `username`, or `uid` field.
 */
export async function findStudentProfileClient(
  identifier: string
): Promise<StudentTalent | null> {
  const { raw, normalized } = normalizeStudentIdentifier(identifier);
  if (!raw) return null;

  const collections = ['users', 'students'] as const;

  for (const colName of collections) {
    try {
      const docSnap = await withTimeout(
        getDoc(doc(db, colName, raw)),
        FIRESTORE_SYNC_TIMEOUT_MS
      );
      if (docSnap.exists()) {
        return mapFirestoreDocToStudentTalent(
          docSnap.id,
          docSnap.data() as Record<string, unknown>
        );
      }
    } catch {
      // Ignore permission or network errors on single lookup and continue
    }

    const queryPairs: Array<[string, string]> = [
      ['slug', normalized],
      ['username', normalized],
    ];
    if (raw !== normalized) {
      queryPairs.push(['slug', raw], ['username', raw]);
    }
    queryPairs.push(['uid', raw]);

    for (const [fieldName, value] of queryPairs) {
      try {
        const q = query(
          collection(db, colName),
          where(fieldName, '==', value),
          limit(1)
        );
        const qSnap = await withTimeout(getDocs(q), FIRESTORE_SYNC_TIMEOUT_MS);
        if (!qSnap.empty) {
          const matchedDoc = qSnap.docs[0];
          return mapFirestoreDocToStudentTalent(
            matchedDoc.id,
            matchedDoc.data() as Record<string, unknown>
          );
        }
      } catch {
        // Ignore rule/index errors and move to next candidate lookup
      }
    }
  }

  return null;
}
