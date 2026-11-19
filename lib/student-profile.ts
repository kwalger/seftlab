import { isSuperAdminEmail } from '@/lib/auth-constants';
import { LabId, StudentTalent, UserRole } from '@/types';

const VALID_ROLES: readonly UserRole[] = [
  'student',
  'teacher',
  'company',
  'admin',
];

const NON_ADMIN_ROLES: readonly UserRole[] = [
  'student',
  'teacher',
  'company',
];

export interface UserSyncInput {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: UserRole | string | null;
  organizationOrUniversity?: string | null;
  createdAt?: string | null;
}

export interface UserSyncOptions {
  slugOverride?: string;
  forceCreate?: boolean;
}

export interface ResolvedUserProfile {
  uid: string;
  email: string;
  displayName: string;
  slug: string;
  username: string;
  profileUrl: string;
  role: UserRole;
  status: string;
  organizationOrUniversity: string;
  photoURL: string;
  createdAt: string;
}

export interface UserSyncPatchResult {
  patch: Record<string, unknown>;
  changed: boolean;
  isNew: boolean;
  resolved: ResolvedUserProfile;
}

function asNonEmptyString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function normalizeTimestampValue(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.seconds === 'number' && Number.isFinite(record.seconds)) {
      return new Date(record.seconds * 1000).toISOString();
    }
    if (typeof record.toDate === 'function') {
      try {
        const d = (record.toDate as () => Date)();
        if (d instanceof Date && !Number.isNaN(d.getTime())) {
          return d.toISOString();
        }
      } catch {
        // ignore invalid timestamp object
      }
    }
  }
  return '';
}

function sanitizeSlugSegment(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '');
}

/**
 * Extracts a URL-safe username/slug from an email address (part before `@`),
 * falling back to a deterministic UID-based slug when needed.
 */
export function extractSlugFromEmail(
  email?: string | null,
  uid?: string
): string {
  const cleanEmail = asNonEmptyString(email).toLowerCase();
  const localPart = cleanEmail.includes('@')
    ? cleanEmail.split('@')[0]
    : cleanEmail;
  const sanitized = sanitizeSlugSegment(localPart);
  if (sanitized) {
    return sanitized;
  }

  const uidSuffix = asNonEmptyString(uid)
    .slice(0, 8)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return uidSuffix ? `student-${uidSuffix}` : 'student';
}

/**
 * Safely decodes and normalizes a student route identifier (`slug`, `username`, or `uid`).
 */
export function normalizeStudentIdentifier(raw: string): {
  raw: string;
  normalized: string;
} {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  const trimmed = decoded.trim();
  return {
    raw: trimmed,
    normalized: trimmed.toLowerCase(),
  };
}

/**
 * Computes up to two initials from a display name for avatar fallbacks.
 */
export function computeInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return 'ط';
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] || ''}${words[1][0] || ''}` || 'ط';
  }
  return cleaned.slice(0, 2) || 'ط';
}

function resolveSyncedRole(
  email: string,
  existingRoleRaw: unknown,
  inputRoleRaw: unknown
): UserRole {
  if (isSuperAdminEmail(email)) {
    return 'admin';
  }

  const existingRole = asNonEmptyString(existingRoleRaw) as UserRole;
  if (VALID_ROLES.includes(existingRole)) {
    return existingRole;
  }

  const inputRole = asNonEmptyString(inputRoleRaw) as UserRole;
  if (NON_ADMIN_ROLES.includes(inputRole)) {
    return inputRole;
  }

  return 'student';
}

/**
 * Builds a non-destructive Firestore patch for a user/student document.
 * Preserves existing custom data while guaranteeing canonical `uid`, `email`,
 * `displayName`, `username`, `slug`, `profileUrl`, `role`, and `createdAt`.
 */
export function buildUserSyncPatch(
  input: UserSyncInput,
  existingDoc?: Record<string, unknown> | null,
  options?: UserSyncOptions
): UserSyncPatchResult {
  const existing = existingDoc ?? null;
  const isNew = !existing || Boolean(options?.forceCreate);

  const normalizedEmail = (
    asNonEmptyString(input.email) || asNonEmptyString(existing?.email)
  ).toLowerCase();
  const isSuper = isSuperAdminEmail(normalizedEmail);

  const existingSlug =
    asNonEmptyString(existing?.slug).toLowerCase() ||
    asNonEmptyString(existing?.username).toLowerCase();
  const overrideSlug = asNonEmptyString(options?.slugOverride).toLowerCase();
  const resolvedSlug =
    overrideSlug ||
    existingSlug ||
    extractSlugFromEmail(normalizedEmail, input.uid);

  const existingDisplayName =
    asNonEmptyString(existing?.displayName) ||
    asNonEmptyString(existing?.name) ||
    asNonEmptyString(existing?.fullName);
  const inputDisplayName = asNonEmptyString(input.displayName);

  const resolvedDisplayName =
    existingDisplayName && existingDisplayName !== 'مستخدم'
      ? existingDisplayName
      : inputDisplayName || existingDisplayName || resolvedSlug;

  const resolvedRole = resolveSyncedRole(
    normalizedEmail,
    existing?.role,
    input.role
  );

  const existingOrg =
    asNonEmptyString(existing?.organizationOrUniversity) ||
    asNonEmptyString(existing?.university) ||
    asNonEmptyString(existing?.universityOrOrg) ||
    asNonEmptyString(existing?.institution);
  const resolvedOrg =
    existingOrg ||
    asNonEmptyString(input.organizationOrUniversity) ||
    (isSuper ? 'إدارة منصة SEFT Lab' : 'جامعة الزرقاء');

  const resolvedStatus = asNonEmptyString(existing?.status) || 'نشط';

  const existingCreatedAt =
    normalizeTimestampValue(existing?.createdAt) ||
    normalizeTimestampValue(existing?.joinedAt);
  const resolvedCreatedAt =
    existingCreatedAt ||
    normalizeTimestampValue(input.createdAt) ||
    new Date().toISOString();

  const existingPhoto =
    asNonEmptyString(existing?.photoURL) || asNonEmptyString(existing?.avatarUrl);
  const resolvedPhotoURL = existingPhoto || asNonEmptyString(input.photoURL);

  const profileUrl = `/students/${resolvedSlug}`;

  const resolved: ResolvedUserProfile = {
    uid: input.uid,
    email: normalizedEmail,
    displayName: resolvedDisplayName,
    slug: resolvedSlug,
    username: resolvedSlug,
    profileUrl,
    role: resolvedRole,
    status: resolvedStatus,
    organizationOrUniversity: resolvedOrg,
    photoURL: resolvedPhotoURL,
    createdAt: resolvedCreatedAt,
  };

  if (isNew) {
    const isPublic =
      typeof existing?.isPublicToCompanies === 'boolean'
        ? existing.isPublicToCompanies
        : true;

    const fullPatch: Record<string, unknown> = {
      uid: resolved.uid,
      email: resolved.email,
      displayName: resolved.displayName,
      name: resolved.displayName,
      fullName: resolved.displayName,
      username: resolved.username,
      slug: resolved.slug,
      profileUrl: resolved.profileUrl,
      role: resolved.role,
      status: resolved.status,
      organizationOrUniversity: resolved.organizationOrUniversity,
      university: resolved.organizationOrUniversity,
      photoURL: resolved.photoURL,
      isPublicToCompanies: isPublic,
      createdAt: resolved.createdAt,
      updatedAt: new Date().toISOString(),
    };

    return {
      patch: fullPatch,
      changed: true,
      isNew: true,
      resolved,
    };
  }

  const patch: Record<string, unknown> = {};

  if (asNonEmptyString(existing?.uid) !== resolved.uid) {
    patch.uid = resolved.uid;
  }
  const currentEmail = asNonEmptyString(existing?.email).toLowerCase();
  if (!currentEmail || (resolved.email && currentEmail !== resolved.email)) {
    patch.email = resolved.email;
  }
  if (asNonEmptyString(existing?.slug).toLowerCase() !== resolved.slug) {
    patch.slug = resolved.slug;
  }
  if (asNonEmptyString(existing?.username).toLowerCase() !== resolved.username) {
    patch.username = resolved.username;
  }
  if (asNonEmptyString(existing?.profileUrl) !== resolved.profileUrl) {
    patch.profileUrl = resolved.profileUrl;
  }

  const curDisplayName = asNonEmptyString(existing?.displayName);
  if (
    !curDisplayName ||
    (curDisplayName === 'مستخدم' && resolved.displayName !== 'مستخدم')
  ) {
    patch.displayName = resolved.displayName;
  }

  const curName = asNonEmptyString(existing?.name);
  if (!curName || (curName === 'مستخدم' && resolved.displayName !== 'مستخدم')) {
    patch.name = resolved.displayName;
  }

  const curFullName = asNonEmptyString(existing?.fullName);
  if (
    !curFullName ||
    (curFullName === 'مستخدم' && resolved.displayName !== 'مستخدم')
  ) {
    patch.fullName = resolved.displayName;
  }

  const curRole = asNonEmptyString(existing?.role);
  if (
    !VALID_ROLES.includes(curRole as UserRole) ||
    (isSuper && curRole !== 'admin')
  ) {
    patch.role = resolved.role;
  }

  if (!asNonEmptyString(existing?.status)) {
    patch.status = resolved.status;
  }

  if (!asNonEmptyString(existing?.organizationOrUniversity)) {
    patch.organizationOrUniversity = resolved.organizationOrUniversity;
  }
  if (!asNonEmptyString(existing?.university)) {
    patch.university = resolved.organizationOrUniversity;
  }

  if (!asNonEmptyString(existing?.photoURL) && resolved.photoURL) {
    patch.photoURL = resolved.photoURL;
  }

  if (!normalizeTimestampValue(existing?.createdAt)) {
    patch.createdAt = resolved.createdAt;
  }

  const changed = Object.keys(patch).length > 0;
  if (changed) {
    patch.updatedAt = new Date().toISOString();
  }

  return {
    patch,
    changed,
    isNew: false,
    resolved,
  };
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
}

/**
 * Maps a Firestore `users` or `students` document into the UI `StudentTalent` shape.
 */
export function mapFirestoreDocToStudentTalent(
  docId: string,
  data: Record<string, unknown>
): StudentTalent {
  const uid = asNonEmptyString(data.uid) || docId;
  const email = asNonEmptyString(data.email).toLowerCase();
  const username =
    asNonEmptyString(data.slug).toLowerCase() ||
    asNonEmptyString(data.username).toLowerCase() ||
    extractSlugFromEmail(email, uid);

  const fullName =
    asNonEmptyString(data.fullName) ||
    asNonEmptyString(data.displayName) ||
    asNonEmptyString(data.name) ||
    username;

  const university =
    asNonEmptyString(data.university) ||
    asNonEmptyString(data.organizationOrUniversity) ||
    asNonEmptyString(data.universityOrOrg) ||
    asNonEmptyString(data.institution) ||
    'جامعة الزرقاء';

  const rawLabXp =
    data.labXp && typeof data.labXp === 'object'
      ? (data.labXp as Record<string, unknown>)
      : {};

  const labXp: Record<LabId, number> = {
    accounting: toFiniteNumber(rawLabXp.accounting, 0),
    marketing: toFiniteNumber(rawLabXp.marketing, 0),
    management: toFiniteNumber(rawLabXp.management, 0),
    python: toFiniteNumber(rawLabXp.python, 0),
  };

  const sumXp =
    labXp.accounting + labXp.marketing + labXp.management + labXp.python;
  const totalXp =
    typeof data.totalXp === 'number' && Number.isFinite(data.totalXp)
      ? data.totalXp
      : sumXp;

  const photo =
    asNonEmptyString(data.photoURL) || asNonEmptyString(data.avatarUrl);

  return {
    id: uid,
    username,
    fullName,
    initials: computeInitials(fullName),
    gradient: asNonEmptyString(data.gradient) || 'from-blue-600 to-cyan-500',
    university,
    major: asNonEmptyString(data.major) || 'الأعمال ونظم المعلومات',
    graduationYear: asNonEmptyString(data.graduationYear) || '2026',
    city: asNonEmptyString(data.city) || 'عمّان',
    bio:
      asNonEmptyString(data.bio) ||
      `طالب مسجل في مختبرات منصة SEFT Lab التطبيقية (${university}).`,
    educationDetails: asNonEmptyString(data.educationDetails) || university,
    githubOrPortfolio: asNonEmptyString(data.githubOrPortfolio),
    linkedinUrl: asNonEmptyString(data.linkedinUrl),
    isPublicToCompanies:
      typeof data.isPublicToCompanies === 'boolean'
        ? data.isPublicToCompanies
        : true,
    streakDays: toFiniteNumber(data.streakDays, 0),
    labXp,
    totalXp,
    earnedBadges: toStringArray(data.earnedBadges),
    topAchievements: toStringArray(data.topAchievements),
    avatarUrl: photo || undefined,
    photoURL: photo || undefined,
  };
}
