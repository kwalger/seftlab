import { UserRole } from '@/types';

/**
 * Super Admin accounts with hardcoded, immutable access to the entire platform.
 * Users with these emails always receive the 'admin' role regardless of Firestore state.
 */
export const SUPER_ADMIN_EMAILS: readonly string[] = [
  'hasanalarjan@gmail.com',
  'hasanalarian@gmail.com',
  'admin@seftlab.com',
];

const ALL_USER_ROLES: readonly UserRole[] = [
  'student',
  'teacher',
  'company',
  'admin',
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return SUPER_ADMIN_EMAILS.includes(clean);
}

export function getEffectiveUserRole(
  user?: { email?: string | null; role?: UserRole | string | null } | null
): UserRole {
  if (isSuperAdminEmail(user?.email)) {
    return 'admin';
  }
  const rawRole =
    typeof user?.role === 'string' ? (user.role.trim() as UserRole) : undefined;
  if (rawRole && ALL_USER_ROLES.includes(rawRole)) {
    return rawRole;
  }
  return 'student';
}

export function getDashboardHomeForUser(
  user?: { email?: string | null; role?: UserRole | string | null } | null
): string {
  switch (getEffectiveUserRole(user)) {
    case 'admin':
      return '/admin';
    case 'teacher':
      return '/teacher';
    case 'company':
      return '/company';
    default:
      return '/student';
  }
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
