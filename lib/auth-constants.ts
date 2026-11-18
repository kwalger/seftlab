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
  const clean = email.toLowerCase().trim();
  return SUPER_ADMIN_EMAILS.includes(clean);
}

export function resolveUserRole(
  email?: string | null,
  firestoreRole?: string | null,
  allowAdminFromFirestore = false
): UserRole {
  if (isSuperAdminEmail(email)) {
    return 'admin';
  }
  if (allowAdminFromFirestore && firestoreRole === 'admin') {
    return 'admin';
  }
  const nonAdminRoles: UserRole[] = ['student', 'teacher', 'company'];
  if (firestoreRole && nonAdminRoles.includes(firestoreRole as UserRole)) {
    return firestoreRole as UserRole;
  }
  return 'student';
}
