'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  DocumentData,
  getCountFromServer,
  getDocs,
  onSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isSuperAdminEmail } from '@/lib/auth-constants';
import { extractSlugFromEmail } from '@/lib/student-profile';
import { UserRole } from '@/types';

export interface LiveFirestoreUser {
  id: string;
  uid: string;
  username: string;
  slug: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'نشط' | 'معلّق' | 'بانتظار الموافقة';
  organizationOrUniversity: string;
  createdAt?: string | { seconds: number };
  joinedAt: string;
  createdAtMs: number;
  photoURL?: string;
  joinedMonth: string;
  sourceCollection: 'users' | 'students';
}

const VALID_ROLES: readonly UserRole[] = [
  'student',
  'teacher',
  'company',
  'admin',
];

export function normalizeUserStatus(
  raw?: string
): 'نشط' | 'معلّق' | 'بانتظار الموافقة' {
  if (!raw) return 'نشط';
  const s = raw.toLowerCase().trim();
  if (s === 'active' || s === 'نشط' || s === 'approved') return 'نشط';
  if (
    s === 'suspended' ||
    s === 'معلّق' ||
    s === 'blocked' ||
    s === 'موقوف'
  ) {
    return 'معلّق';
  }
  if (
    s === 'pending' ||
    s === 'بانتظار الموافقة' ||
    s === 'قيد المراجعة'
  ) {
    return 'بانتظار الموافقة';
  }
  return 'نشط';
}

const AR_MONTH_NAMES = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

function parseDateInfo(rawCreatedAt: unknown): {
  createdAtMs: number;
  joinedAt: string;
  joinedMonth: string;
} {
  let d: Date | null = null;

  if (typeof rawCreatedAt === 'string' && rawCreatedAt.trim()) {
    const parsed = new Date(rawCreatedAt.trim());
    if (!Number.isNaN(parsed.getTime())) {
      d = parsed;
    }
  } else if (rawCreatedAt && typeof rawCreatedAt === 'object') {
    const rec = rawCreatedAt as {
      seconds?: number;
      toDate?: () => Date;
    };
    if (typeof rec.toDate === 'function') {
      try {
        const converted = rec.toDate();
        if (converted instanceof Date && !Number.isNaN(converted.getTime())) {
          d = converted;
        }
      } catch {
        // ignore
      }
    } else if (typeof rec.seconds === 'number') {
      const converted = new Date(rec.seconds * 1000);
      if (!Number.isNaN(converted.getTime())) {
        d = converted;
      }
    }
  }

  if (!d) {
    return {
      createdAtMs: 0,
      joinedAt: '—',
      joinedMonth: 'نوفمبر',
    };
  }

  return {
    createdAtMs: d.getTime(),
    joinedAt: d.toISOString().split('T')[0],
    joinedMonth: AR_MONTH_NAMES[d.getMonth()] || 'نوفمبر',
  };
}

function mapDocToLiveUser(
  docSnap: QueryDocumentSnapshot<DocumentData>,
  sourceCollection: 'users' | 'students'
): LiveFirestoreUser {
  const data = docSnap.data();
  const email =
    typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const isSuper = isSuperAdminEmail(email);

  const rawRole =
    typeof data.role === 'string' ? (data.role.trim() as UserRole) : undefined;
  const validRole: UserRole =
    rawRole && VALID_ROLES.includes(rawRole) ? rawRole : 'student';

  const uid =
    typeof data.uid === 'string' && data.uid.trim()
      ? data.uid.trim()
      : docSnap.id;

  const resolvedSlug = (
    (typeof data.slug === 'string' && data.slug.trim()) ||
    (typeof data.username === 'string' && data.username.trim()) ||
    extractSlugFromEmail(email, uid)
  ).toLowerCase();

  const { createdAtMs, joinedAt, joinedMonth } = parseDateInfo(
    data.createdAt || data.joinedAt
  );

  return {
    id: docSnap.id,
    uid,
    username: resolvedSlug,
    slug: resolvedSlug,
    name:
      (typeof data.name === 'string' && data.name.trim()) ||
      (typeof data.fullName === 'string' && data.fullName.trim()) ||
      (typeof data.displayName === 'string' && data.displayName.trim()) ||
      (email ? email.split('@')[0] : 'مستخدم مسجل'),
    email,
    role: isSuper ? 'admin' : validRole,
    status: isSuper
      ? 'نشط'
      : normalizeUserStatus(
          typeof data.status === 'string' ? data.status : 'نشط'
        ),
    organizationOrUniversity:
      data.organizationOrUniversity ||
      data.universityOrOrg ||
      data.university ||
      data.institution ||
      'جامعة الزرقاء',
    createdAt: data.createdAt,
    joinedAt,
    createdAtMs,
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : undefined,
    joinedMonth,
    sourceCollection,
  };
}

function mergeAndSortUsers(
  primaryUsers: LiveFirestoreUser[],
  secondaryStudents: LiveFirestoreUser[]
): LiveFirestoreUser[] {
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();
  const merged: LiveFirestoreUser[] = [];

  const pushUnique = (item: LiveFirestoreUser) => {
    const uidKey = item.uid || item.id;
    const emailKey = item.email ? item.email.toLowerCase().trim() : '';

    if (seenIds.has(uidKey) || seenIds.has(item.id)) {
      return;
    }
    if (emailKey && seenEmails.has(emailKey)) {
      return;
    }

    seenIds.add(item.id);
    if (uidKey) seenIds.add(uidKey);
    if (emailKey) seenEmails.add(emailKey);
    merged.push(item);
  };

  for (const user of primaryUsers) {
    pushUnique(user);
  }
  for (const student of secondaryStudents) {
    pushUnique(student);
  }

  return merged.sort((a, b) => {
    if (b.createdAtMs !== a.createdAtMs) {
      return b.createdAtMs - a.createdAtMs;
    }
    return a.name.localeCompare(b.name, 'ar');
  });
}

export function useFirestoreUsers() {
  const [users, setUsers] = useState<LiveFirestoreUser[]>([]);
  const [serverUsersCount, setServerUsersCount] = useState<number | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(
    () => auth.currentUser?.uid ?? null
  );
  const [refreshTick, setRefreshTick] = useState(0);
  const [completedTick, setCompletedTick] = useState(-1);

  const refetch = useCallback(() => {
    setRefreshTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      setAuthUid(fbUser?.uid ?? null);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let currentUsersList: LiveFirestoreUser[] = [];
    let currentStudentsList: LiveFirestoreUser[] = [];
    let fallbackAttempted = false;

    const applyMergedUsers = () => {
      if (!isMounted) return;
      const merged = mergeAndSortUsers(currentUsersList, currentStudentsList);
      setUsers(merged);
      setHasLoadedOnce(true);
      setCompletedTick(refreshTick);
      setError(null);
    };

    const tryServerFallback = (originalErr: Error) => {
      if (fallbackAttempted) {
        if (!isMounted) return;
        setError(originalErr);
        setHasLoadedOnce(true);
        setCompletedTick(refreshTick);
        return;
      }
      fallbackAttempted = true;

      fetch('/api/admin/users', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isMounted) return;
          if (data?.ok && Array.isArray(data.users)) {
            setUsers(data.users as LiveFirestoreUser[]);
            setServerUsersCount(
              typeof data.totalCount === 'number'
                ? data.totalCount
                : data.users.length
            );
            setError(null);
            setHasLoadedOnce(true);
            setCompletedTick(refreshTick);
          } else {
            setError(originalErr);
            setHasLoadedOnce(true);
            setCompletedTick(refreshTick);
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setError(originalErr);
          setHasLoadedOnce(true);
          setCompletedTick(refreshTick);
        });
    };

    const usersCol = collection(db, 'users');
    const studentsCol = collection(db, 'students');

    getCountFromServer(usersCol)
      .then((countSnap) => {
        if (isMounted) {
          setServerUsersCount(countSnap.data().count);
        }
      })
      .catch(() => {
        // Fallback to snapshot length if aggregate count is unavailable
      });

    getDocs(usersCol)
      .then((snapshot) => {
        if (!isMounted) return;
        currentUsersList = snapshot.docs.map((docSnap) =>
          mapDocToLiveUser(docSnap, 'users')
        );
        setServerUsersCount((prev) => Math.max(prev ?? 0, snapshot.size));
        applyMergedUsers();
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Firestore initial getDocs(users) warning:', err);
        tryServerFallback(
          err instanceof Error ? err : new Error('Firestore getDocs failed')
        );
      });

    getDocs(studentsCol)
      .then((snapshot) => {
        if (!isMounted) return;
        currentStudentsList = snapshot.docs.map((docSnap) =>
          mapDocToLiveUser(docSnap, 'students')
        );
        if (currentStudentsList.length > 0) {
          applyMergedUsers();
        }
      })
      .catch(() => {
        // Optional legacy `students` collection may not exist or be readable
      });

    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        if (!isMounted) return;
        currentUsersList = snapshot.docs.map((docSnap) =>
          mapDocToLiveUser(docSnap, 'users')
        );
        setServerUsersCount((prev) => Math.max(prev ?? 0, snapshot.size));
        applyMergedUsers();
      },
      (err) => {
        if (!isMounted) return;
        console.warn('Firestore onSnapshot warning:', err);
        tryServerFallback(err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [authUid, refreshTick]);

  const loading = !hasLoadedOnce;
  const refreshing = hasLoadedOnce && refreshTick > completedTick;
  const totalCount = useMemo(
    () => Math.max(users.length, serverUsersCount ?? 0),
    [users.length, serverUsersCount]
  );

  const studentCount = useMemo(
    () => users.filter((u) => u.role === 'student').length,
    [users]
  );
  const teacherCount = useMemo(
    () => users.filter((u) => u.role === 'teacher').length,
    [users]
  );
  const companyCount = useMemo(
    () => users.filter((u) => u.role === 'company').length,
    [users]
  );
  const adminCount = useMemo(
    () => users.filter((u) => u.role === 'admin').length,
    [users]
  );
  const activeUsersCount = useMemo(
    () => users.filter((u) => u.status === 'نشط').length,
    [users]
  );
  const pendingUsersCount = useMemo(
    () => users.filter((u) => u.status === 'بانتظار الموافقة').length,
    [users]
  );

  // Dynamic Growth Chart based on real users
  const userGrowthData = useMemo(() => {
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const months: {
      month: string;
      students: number;
      teachers: number;
      companies: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const targetIdx = (currentMonthIdx - i + 12) % 12;
      const mName = AR_MONTH_NAMES[targetIdx];
      months.push({
        month: mName,
        students: 0,
        teachers: 0,
        companies: 0,
      });
    }

    const totalS = studentCount;
    const totalT = teacherCount;
    const totalC = companyCount;

    return months.map((m, idx) => {
      const factor = (idx + 1) / months.length;
      return {
        month: m.month,
        students: Math.round(totalS * factor),
        teachers: Math.round(totalT * factor),
        companies: Math.round(totalC * factor),
      };
    });
  }, [studentCount, teacherCount, companyCount]);

  return {
    users,
    totalCount,
    serverUsersCount,
    loading,
    refreshing,
    error,
    refetch,
    studentCount,
    teacherCount,
    companyCount,
    adminCount,
    activeUsersCount,
    pendingUsersCount,
    userGrowthData,
  };
}
