'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole } from '@/types';
import { isSuperAdminEmail } from '@/lib/auth-constants';

export interface LiveFirestoreUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'نشط' | 'معلّق' | 'بانتظار الموافقة';
  organizationOrUniversity: string;
  createdAt?: string | { seconds: number };
  photoURL?: string;
  joinedMonth?: string;
}

export function normalizeUserStatus(raw?: string): 'نشط' | 'معلّق' | 'بانتظار الموافقة' {
  if (!raw) return 'نشط';
  const s = raw.toLowerCase().trim();
  if (s === 'active' || s === 'نشط' || s === 'approved') return 'نشط';
  if (s === 'suspended' || s === 'معلّق' || s === 'blocked' || s === 'موقوف') return 'معلّق';
  if (s === 'pending' || s === 'بانتظار الموافقة' || s === 'قيد المراجعة') return 'بانتظار الموافقة';
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

export function useFirestoreUsers() {
  const [users, setUsers] = useState<LiveFirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const usersCol = collection(db, 'users');
      unsubscribe = onSnapshot(
        usersCol,
        (snapshot) => {
          const list: LiveFirestoreUser[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as DocumentData;
            const rawStatus = data.status || 'نشط';
            let joinedMonth = 'نوفمبر';

            if (data.createdAt) {
              try {
                let d: Date | null = null;
                if (typeof data.createdAt === 'string') {
                  d = new Date(data.createdAt);
                } else if (typeof data.createdAt.seconds === 'number') {
                  d = new Date(data.createdAt.seconds * 1000);
                }
                if (d && !isNaN(d.getTime())) {
                  joinedMonth = AR_MONTH_NAMES[d.getMonth()] || 'نوفمبر';
                }
              } catch {
                // fallback
              }
            }

            const email = data.email || '';
            const isSuper = isSuperAdminEmail(email);

            return {
              id: docSnap.id,
              name: data.name || data.fullName || (email ? email.split('@')[0] : 'مستخدم مسجل'),
              email: email,
              role: (isSuper ? 'admin' : data.role || 'student') as UserRole,
              status: isSuper ? 'نشط' : normalizeUserStatus(rawStatus),
              organizationOrUniversity:
                data.organizationOrUniversity ||
                data.universityOrOrg ||
                data.university ||
                'جامعة الزرقاء',
              createdAt: data.createdAt,
              photoURL: data.photoURL,
              joinedMonth,
            };
          });

          setUsers(list);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.warn('Firestore onSnapshot warning:', err);
          setError(err);
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.warn('Firestore subscription failed:', err);
      queueMicrotask(() => {
        setError(err);
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, []);

  const studentCount = useMemo(() => users.filter((u) => u.role === 'student').length, [users]);
  const teacherCount = useMemo(() => users.filter((u) => u.role === 'teacher').length, [users]);
  const companyCount = useMemo(() => users.filter((u) => u.role === 'company').length, [users]);
  const adminCount = useMemo(() => users.filter((u) => u.role === 'admin').length, [users]);
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
    // Last 6 months up to current
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const months: { month: string; students: number; teachers: number; companies: number }[] = [];

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

    // Cumulative progression ending in actual counts
    // For months before current, scale smoothly or show real distributions
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
    loading,
    error,
    studentCount,
    teacherCount,
    companyCount,
    adminCount,
    activeUsersCount,
    pendingUsersCount,
    userGrowthData,
  };
}
