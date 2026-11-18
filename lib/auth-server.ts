import bcrypt from 'bcryptjs';
import { UserRole, UserSession } from '@/types';

interface ServerAuthRecord {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  organizationOrUniversity: string;
  passwordHash: string;
  approvalStatus: 'approved' | 'pending' | 'rejected';
}

export const DOCTOR_EMAIL_REGEX = /^dr(\d*)@seftlab\.com$/i;

function isDemoAccountsEnabled(): boolean {
  return process.env.ENABLE_DEMO_ACCOUNTS === 'true';
}

function getMockAuthUsers(): ServerAuthRecord[] {
  if (!isDemoAccountsEnabled()) {
    return [];
  }

  const demoUsers: ServerAuthRecord[] = [];
  const studentHash = (process.env.DEMO_STUDENT_PASSWORD_HASH || '').trim();
  const teacherHash = (process.env.DEMO_TEACHER_PASSWORD_HASH || '').trim();
  const companyHash = (process.env.DEMO_COMPANY_PASSWORD_HASH || '').trim();

  if (studentHash) {
    demoUsers.push({
      id: 'usr-student-1',
      username: 'yazan-nabulsi',
      email: 'yazan@students.ju.edu.jo',
      name: 'يزن النابلسي',
      role: 'student',
      organizationOrUniversity: 'الجامعة الأردنية',
      passwordHash: studentHash,
      approvalStatus: 'approved',
    });
  }

  if (teacherHash) {
    demoUsers.push({
      id: 'usr-teacher-1',
      username: 'dr',
      email: 'dr@seftlab.com',
      name: 'د. أحمد خليل العساف',
      role: 'teacher',
      organizationOrUniversity: 'الجامعة الأردنية — كلية الأعمال وتقنية المعلومات',
      passwordHash: teacherHash,
      approvalStatus: 'approved',
    });
  }

  if (companyHash) {
    demoUsers.push({
      id: 'usr-company-1',
      username: 'futuretech-hr',
      email: 'talent@futuretech.jo',
      name: 'سارة الخطيب',
      role: 'company',
      organizationOrUniversity: 'شركة تقنية المستقبل',
      passwordHash: companyHash,
      approvalStatus: 'approved',
    });
  }

  return demoUsers;
}

function sanitizeMetaField(val?: string, maxLen = 100): string | undefined {
  if (typeof val !== 'string') return undefined;
  const cleaned = val.replace(/[\x00-\x1F\x7F]/g, '').trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, maxLen);
}

// Rate limiter state (in-memory per edge isolate / server instance).
// Note: On Cloudflare Pages Edge Runtime, isolates are distributed and ephemeral.
// For enterprise-grade protection across all global edge points, configure Cloudflare
// WAF Rate Limiting rules in the Cloudflare Dashboard (Security > WAF > Rate Limiting).
interface RateLimitBucket {
  failedCount: number;
  firstFailedAt: number;
  lockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();
const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes
const MAX_RATE_LIMIT_ENTRIES = 5000;

function pruneRateLimitMap(now: number) {
  for (const [k, bucket] of rateLimitMap.entries()) {
    if (bucket.lockedUntil <= now && now - bucket.firstFailedAt > WINDOW_MS) {
      rateLimitMap.delete(k);
    }
  }
  while (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
    const oldestKey = rateLimitMap.keys().next().value;
    if (oldestKey === undefined) break;
    rateLimitMap.delete(oldestKey);
  }
}

export function checkRateLimit(key: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const bucket = rateLimitMap.get(key);
  if (!bucket) {
    return {
      allowed: true,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  if (bucket.lockedUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000),
    };
  }

  if (now - bucket.firstFailedAt > WINDOW_MS) {
    rateLimitMap.delete(key);
    return {
      allowed: true,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - bucket.failedCount),
    retryAfterSeconds: 0,
  };
}

export function recordFailedAttempt(key: string) {
  const now = Date.now();
  const existing = rateLimitMap.get(key);
  if (!existing || now - existing.firstFailedAt > WINDOW_MS) {
    if (!existing) {
      pruneRateLimitMap(now);
    }
    rateLimitMap.set(key, {
      failedCount: 1,
      firstFailedAt: now,
      lockedUntil: 0,
    });
    return;
  }

  const nextCount = existing.failedCount + 1;
  const lockedUntil = nextCount >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_MS : 0;
  rateLimitMap.set(key, {
    ...existing,
    failedCount: nextCount,
    lockedUntil,
  });
}

export function clearRateLimit(key: string) {
  rateLimitMap.delete(key);
}

export function getRoleHomeRoute(role: UserRole): string {
  switch (role) {
    case 'student':
      return '/student';
    case 'teacher':
      return '/teacher';
    case 'company':
      return '/company';
    case 'admin':
      return '/admin';
  }
}

export function verifyServerCredentials(
  identifierRaw: string,
  password: string,
  clientKey: string | string[],
  meta?: { name?: string; organizationOrUniversity?: string }
): {
  ok: boolean;
  error?: string;
  session?: UserSession;
  redirectTo?: string;
} {
  const rateKeys = Array.isArray(clientKey) ? clientKey : [clientKey];
  let maxRetryAfter = 0;
  for (const key of rateKeys) {
    const rateCheck = checkRateLimit(key);
    if (!rateCheck.allowed) {
      maxRetryAfter = Math.max(maxRetryAfter, rateCheck.retryAfterSeconds);
    }
  }
  if (maxRetryAfter > 0) {
    return {
      ok: false,
      error: `تم تجاوز الحد المسموح لمحاولات الدخول الفاشلة. يرجى الانتظار ${maxRetryAfter} ثانية قبل المحاولة مجدداً.`,
    };
  }

  const recordAllFailed = () => {
    for (const key of rateKeys) {
      recordFailedAttempt(key);
    }
  };

  const clearAllLimits = () => {
    for (const key of rateKeys) {
      clearRateLimit(key);
    }
  };

  const identifier = identifierRaw.trim().toLowerCase();

  // =========================================================
  // ADMIN AUTHENTICATION (SERVER-SIDE ONLY VIA ENV VARS)
  // =========================================================
  const adminUser = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const adminPasswordHash = (process.env.ADMIN_PASSWORD_HASH || '').trim();
  if (
    adminUser &&
    adminPasswordHash &&
    identifier === adminUser &&
    bcrypt.compareSync(password, adminPasswordHash)
  ) {
    clearAllLimits();
    const adminSession: UserSession = {
      id: 'usr-admin-root',
      name: 'مدير النظام العام',
      username: adminUser,
      email: 'admin@seftlab.com',
      role: 'admin',
      organizationOrUniversity: 'إدارة منصة SEFT Lab',
      approvalStatus: 'approved',
    };
    return {
      ok: true,
      session: adminSession,
      redirectTo: '/admin',
    };
  }

  // =========================================================
  // DOCTOR ACCOUNTS (dr@seftlab.com & dr<digits>@seftlab.com)
  // =========================================================
  const doctorMatch = identifier.match(DOCTOR_EMAIL_REGEX);
  if (doctorMatch) {
    const doctorHash = (process.env.DOCTOR_PASSWORD_HASH || '').trim();

    if (!doctorHash || !bcrypt.compareSync(password, doctorHash)) {
      recordAllFailed();
      return {
        ok: false,
        error: 'البريد الإلكتروني أو كلمة المرور الخاصة بحساب الدكتور غير صحيحة.',
      };
    }

    const suffix = doctorMatch[1] || '';
    const customName = sanitizeMetaField(meta?.name, 100);
    const customOrg = sanitizeMetaField(meta?.organizationOrUniversity, 150);

    clearAllLimits();
    const doctorSession: UserSession = {
      id: suffix ? `usr-teacher-${suffix}` : 'usr-teacher-1',
      name:
        customName ||
        (suffix ? `د. عضو هيئة التدريس (${suffix})` : 'د. أحمد خليل العساف'),
      username: suffix ? `dr${suffix}` : 'dr',
      email: identifier,
      role: 'teacher',
      organizationOrUniversity:
        customOrg || 'الجامعة الأردنية — كلية الأعمال وتقنية المعلومات',
      approvalStatus: 'approved',
    };

    return {
      ok: true,
      session: doctorSession,
      redirectTo: '/teacher',
    };
  }

  if (/^dr.*@seftlab\.com$/i.test(identifier)) {
    recordAllFailed();
    return {
      ok: false,
      error:
        'يُسمح فقط ببريد dr@seftlab.com أو زيادة أرقام بعد dr مثل dr1@seftlab.com و dr2@seftlab.com.',
    };
  }

  // =========================================================
  // STANDARD USER ROLES (student, teacher, company)
  // =========================================================
  const matchedUser = getMockAuthUsers().find(
    (u) =>
      u.email.toLowerCase() === identifier ||
      u.username.toLowerCase() === identifier
  );

  if (!matchedUser) {
    recordAllFailed();
    return {
      ok: false,
      error: 'البريد الإلكتروني أو اسم المستخدم أو كلمة المرور غير صحيحة.',
    };
  }

  const passwordValid = bcrypt.compareSync(password, matchedUser.passwordHash);
  if (!passwordValid) {
    recordAllFailed();
    return {
      ok: false,
      error: 'البريد الإلكتروني أو اسم المستخدم أو كلمة المرور غير صحيحة.',
    };
  }

  if (matchedUser.approvalStatus === 'pending') {
    return {
      ok: false,
      error: 'حسابك قيد المراجعة حالياً من قبل إدارة المنصة وسيتم تفعيله فور الموافقة.',
    };
  }

  clearAllLimits();
  const session: UserSession = {
    id: matchedUser.id,
    name: matchedUser.name,
    username: matchedUser.username,
    email: matchedUser.email,
    role: matchedUser.role,
    organizationOrUniversity: matchedUser.organizationOrUniversity,
    approvalStatus: matchedUser.approvalStatus,
  };

  return {
    ok: true,
    session,
    redirectTo: getRoleHomeRoute(matchedUser.role),
  };
}
