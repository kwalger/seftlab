import { UserRole } from '@/types';

/**
 * Super Admin accounts with hardcoded, immutable access to the entire platform.
 * Users with these emails always receive the 'admin' role regardless of Firestore state.
 */
export const SUPER_ADMIN_EMAILS: readonly string[] = [
  'hasanalarjan@gmail.com',
  'admin@seftlab.com',
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return SUPER_ADMIN_EMAILS.some(
    (admin) => admin.toLowerCase().trim() === cleanEmail
  );
}

export function resolveUserRole(email?: string | null, firestoreRole?: string | null): UserRole {
  if (isSuperAdminEmail(email)) {
    return 'admin';
  }
  const validRoles: UserRole[] = ['student', 'teacher', 'company', 'admin'];
  if (firestoreRole && validRoles.includes(firestoreRole as UserRole)) {
    return firestoreRole as UserRole;
  }
  return 'student';
}
