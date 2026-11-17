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

export const DOCTOR_DEFAULT_PASSWORD = 'k9#mP2$vL8@qR4!zX7&';
export const DOCTOR_EMAIL_REGEX = /^dr(\d*)@seftlab\.com$/i;

// Pre-computed bcrypt hashes for mock accounts (never stored as plaintext)
const STUDENT_HASH = bcrypt.hashSync('password123', 10);
const TEACHER_HASH = bcrypt.hashSync(DOCTOR_DEFAULT_PASSWORD, 10);
const COMPANY_HASH = bcrypt.hashSync('company123', 10);

const MOCK_AUTH_USERS: ServerAuthRecord[] = [
  {
    id: 'usr-student-1',
    username: 'yazan-nabulsi',
    email: 'yazan@students.ju.edu.jo',
    name: 'يزن النابلسي',
    role: 'student',
    organizationOrUniversity: 'الجامعة الأردنية',
    passwordHash: STUDENT_HASH,
    approvalStatus: 'approved',
  },
  {
    id: 'usr-teacher-1',
    username: 'dr',
    email: 'dr@seftlab.com',
    name: 'د. أحمد خليل العساف',
    role: 'teacher',
    organizationOrUniversity: 'الجامعة الأردنية — كلية الأعمال وتقنية المعلومات',
    passwordHash: TEACHER_HASH,
    approvalStatus: 'approved',
  },
  {
    id: 'usr-company-1',
    username: 'futuretech-hr',
    email: 'talent@futuretech.jo',
    name: 'سارة الخطيب',
    role: 'company',
    organizationOrUniversity: 'شركة تقنية المستقبل',
    passwordHash: COMPANY_HASH,
    approvalStatus: 'approved',
  },
];

// Rate limiter state (in-memory per server instance)
interface RateLimitBucket {
  failedCount: number;
  firstFailedAt: number;
  lockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();
const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes

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
  clientKey: string,
  meta?: { name?: string; organizationOrUniversity?: string }
): {
  ok: boolean;
  error?: string;
  session?: UserSession;
  redirectTo?: string;
} {
  const rateCheck = checkRateLimit(clientKey);
  if (!rateCheck.allowed) {
    return {
      ok: false,
      error: `تم تجاوز الحد المسموح لمحاولات الدخول الفاشلة. يرجى الانتظار ${rateCheck.retryAfterSeconds} ثانية قبل المحاولة مجدداً.`,
    };
  }

  const identifier = identifierRaw.trim().toLowerCase();

  // =========================================================
  // ADMIN AUTHENTICATION (SERVER-SIDE ONLY)
  // =========================================================
  if (process.env.NODE_ENV === 'development') {
    // DEV ONLY — WARNING: This development fallback ("admin" / "user") is strictly
    // restricted to NODE_ENV === "development" and is never active in production builds.
    if (identifier === 'admin' && password === 'user') {
      clearRateLimit(clientKey);
      const adminSession: UserSession = {
        id: 'usr-admin-root',
        name: 'مدير النظام العام',
        username: 'admin',
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
  } else {
    // PRODUCTION ONLY: Read admin username and bcrypt hash strictly from server env vars
    const prodAdminUser = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
    const prodAdminHash = process.env.ADMIN_PASSWORD_HASH || '';
    if (
      prodAdminUser &&
      prodAdminHash &&
      identifier === prodAdminUser &&
      bcrypt.compareSync(password, prodAdminHash)
    ) {
      clearRateLimit(clientKey);
      const adminSession: UserSession = {
        id: 'usr-admin-root',
        name: 'مدير النظام العام',
        username: prodAdminUser,
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
  }

  // =========================================================
  // DOCTOR ACCOUNTS (dr@seftlab.com & dr<digits>@seftlab.com)
  // =========================================================
  const doctorMatch = identifier.match(DOCTOR_EMAIL_REGEX);
  if (doctorMatch) {
    const passwordValid = bcrypt.compareSync(password, TEACHER_HASH);
    if (!passwordValid) {
      recordFailedAttempt(clientKey);
      return {
        ok: false,
        error: 'البريد الإلكتروني أو كلمة المرور الخاصة بحساب الدكتور غير صحيحة.',
      };
    }

    const suffix = doctorMatch[1] || '';
    const customName = meta?.name?.trim();
    const customOrg = meta?.organizationOrUniversity?.trim();

    clearRateLimit(clientKey);
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
    recordFailedAttempt(clientKey);
    return {
      ok: false,
      error:
        'يُسمح فقط ببريد dr@seftlab.com أو زيادة أرقام بعد dr مثل dr1@seftlab.com و dr2@seftlab.com.',
    };
  }

  // =========================================================
  // STANDARD USER ROLES (student, teacher, company)
  // =========================================================
  const matchedUser = MOCK_AUTH_USERS.find(
    (u) =>
      u.email.toLowerCase() === identifier ||
      u.username.toLowerCase() === identifier
  );

  if (!matchedUser) {
    recordFailedAttempt(clientKey);
    return {
      ok: false,
      error: 'البريد الإلكتروني أو اسم المستخدم أو كلمة المرور غير صحيحة.',
    };
  }

  const passwordValid = bcrypt.compareSync(password, matchedUser.passwordHash);
  if (!passwordValid) {
    recordFailedAttempt(clientKey);
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

  clearRateLimit(clientKey);
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
