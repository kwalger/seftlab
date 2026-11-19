'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogIn, User, Lock } from 'lucide-react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { isSuperAdminEmail } from '@/lib/auth-constants';
import { ensureFirestoreUserDocument } from '@/lib/client-user-sync';
import { extractSlugFromEmail } from '@/lib/student-profile';
import { useAppStore } from '@/store/use-app-store';
import { useAdminStore } from '@/store/use-admin-store';
import { useKeyboardOffset } from '@/hooks/use-keyboard-offset';
import { triggerHaptic } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TadreebakLogo } from '@/components/shared/tadreebak-logo';
import { UserRole, UserSession } from '@/types';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAppStore();
  const { recordAuditAction } = useAdminStore();
  const { keyboardHeight } = useKeyboardOffset(true);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redirectCheckedRef = useRef(false);

  // إكمال الجلسة والتوجيه بناءً على الرتبة
  const completeSession = async (
    uid: string,
    email: string | null,
    name: string,
    role: UserRole,
    photoURL?: string | null,
    idToken?: string,
    usernameOverride?: string,
    organizationOrUniversityOverride?: string
  ) => {
    const isSuper = isSuperAdminEmail(email);
    const effectiveRole: UserRole = isSuper ? 'admin' : role;
    const resolvedOrg =
      organizationOrUniversityOverride ||
      (isSuper ? 'إدارة منصة SEFT Lab' : 'جامعة الزرقاء');

    // تعيين الكوكيز للـ Middleware
    document.cookie = `seftlab_role=${effectiveRole}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `tadreebak_role=${effectiveRole}; path=/; max-age=604800; SameSite=Lax`;
    if (email) {
      document.cookie = `seftlab_email=${encodeURIComponent(email.toLowerCase().trim())}; path=/; max-age=604800; SameSite=Lax`;
    }

    // إرسال طلب لمسار المزامنة في الـ Edge لإنشاء كوكي الجلسة الموقّع باستخدام Firebase ID Token
    if (idToken && typeof fetch !== 'undefined') {
      await fetch('/api/auth/sync-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          name,
          role: effectiveRole,
          photoURL: photoURL || undefined,
          organizationOrUniversity: resolvedOrg,
        }),
      }).catch(() => {});
    }

    const session: UserSession = {
      id: uid,
      name: name,
      username: usernameOverride || extractSlugFromEmail(email, uid),
      email: email || '',
      role: effectiveRole,
      organizationOrUniversity: resolvedOrg,
      approvalStatus: 'approved',
      avatarUrl: photoURL || undefined,
      photoURL: photoURL || undefined,
    };
    loginUser(session);

    recordAuditAction(
      'تسجيل دخول',
      `تسجيل دخول ناجح (${effectiveRole}): ${name}`,
      name,
      effectiveRole
    );

    triggerHaptic('success');
    toast.success(`مرحباً بك، ${name}`);

    // التوجيه المباشر والفوري إلى اللوحة المطلوبة
    if (effectiveRole === 'admin') {
      router.push('/admin');
    } else if (effectiveRole === 'teacher') {
      router.push('/teacher');
    } else if (effectiveRole === 'company') {
      router.push('/company');
    } else {
      router.push('/student');
    }
  };

  const completeFirebaseUserSession = async (user: FirebaseUser) => {
    const idToken = await user.getIdToken();
    const resolved = await ensureFirestoreUserDocument({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: user.metadata?.creationTime || undefined,
    });

    await completeSession(
      user.uid,
      resolved.email || user.email,
      resolved.displayName,
      resolved.role,
      resolved.photoURL || user.photoURL,
      idToken,
      resolved.slug,
      resolved.organizationOrUniversity
    );
  };

  const completeFirebaseUserSessionRef = useRef(completeFirebaseUserSession);
  useEffect(() => {
    completeFirebaseUserSessionRef.current = completeFirebaseUserSession;
  });

  const showGoogleAuthError = (err: unknown) => {
    triggerHaptic('error');
    const authError = err as { code?: string; message?: string };
    const code = authError?.code || '';

    if (code === 'auth/popup-closed-by-user') {
      const msg = 'تم إغلاق نافذة تسجيل الدخول بواسطة Google قبل إتمامها.';
      setErrorMessage(msg);
      toast.error(msg);
    } else if (code === 'auth/cancelled-popup-request') {
      const msg = 'تم إلغاء طلب تسجيل الدخول عبر Google.';
      setErrorMessage(msg);
      toast.error(msg);
    } else if (code === 'auth/popup-blocked') {
      const msg = 'تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة لموقع SEFT Lab.';
      setErrorMessage(msg);
      toast.error(msg);
    } else if (code === 'auth/operation-not-allowed') {
      const msg = 'خدمة الدخول بواسطة Google غير متاحة حالياً. يرجى استخدام البريد وكلمة المرور.';
      setErrorMessage(msg);
      toast.error(msg);
    } else if (code === 'auth/unauthorized-domain') {
      const msg = 'تعذر تسجيل الدخول من هذا النطاق. يرجى التحقق من النطاق المصرح به في Firebase.';
      setErrorMessage(msg);
      toast.error(msg);
    } else {
      const msg = 'تعذر إتمام الدخول بواسطة Google. يرجى المحاولة مجدداً.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (redirectCheckedRef.current) return;
    redirectCheckedRef.current = true;

    getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return;
        setGoogleLoading(true);
        try {
          await completeFirebaseUserSessionRef.current(result.user);
        } catch (err) {
          showGoogleAuthError(err);
        } finally {
          setGoogleLoading(false);
        }
      })
      .catch((err) => {
        showGoogleAuthError(err);
      });
  }, []);

  const tryServerLogin = async (
    identifierVal: string,
    passwordVal: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifierVal, password: passwordVal }),
      });
      const data = await res.json();
      if (data.ok && data.session) {
        await completeSession(
          data.session.id,
          data.session.email,
          data.session.name,
          data.session.role,
          data.session.avatarUrl,
          undefined,
          data.session.username,
          data.session.organizationOrUniversity
        );
        return true;
      }
    } catch {}
    return false;
  };

  // 1. تسجيل الدخول بالبريد وكلمة المرور
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const email = identifier.trim();
    if (!email || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setLoading(true);

    try {
      // 0. التحقق من صلاحيات الأدمن والدكاترة وحسابات النظام مباشرة
      const cleanId = email.toLowerCase();
      const isDoctorAccount = /^dr\d*@seftlab\.com$/i.test(cleanId);
      if (
        cleanId === 'admin' ||
        isSuperAdminEmail(cleanId) ||
        isDoctorAccount ||
        !cleanId.includes('@')
      ) {
        if (await tryServerLogin(email, password)) {
          return;
        }
      }

      // التحقق الفعلي من الحساب عبر Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await completeFirebaseUserSession(userCredential.user);
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      const code = authError?.code || '';

      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
        if (await tryServerLogin(email, password)) {
          return;
        }
      }

      triggerHaptic('error');

      if (
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found'
      ) {
        const msg =
          'البريد الإلكتروني غير مسجل أو كلمة المرور غير صحيحة. يمكنك إنشاء حساب جديد أو استخدام زر الدخول بواسطة Google.';
        setErrorMessage(msg);
        toast.error(msg);
      } else if (code === 'auth/invalid-email') {
        const msg = 'صيغة البريد الإلكتروني غير صحيحة.';
        setErrorMessage(msg);
        toast.error(msg);
      } else if (code === 'auth/too-many-requests') {
        const msg = 'تم حظر المحاولات مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى الانتظار والمحاولة لاحقاً.';
        setErrorMessage(msg);
        toast.error(msg);
      } else if (code === 'auth/network-request-failed') {
        const msg = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
        setErrorMessage(msg);
        toast.error(msg);
      } else {
        const msg = 'حدث خطأ أثناء تسجيل الدخول. يرجى التأكد من البيانات والمحاولة مجدداً.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. تسجيل الدخول بواسطة Google
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);

    try {
      // فتح نافذة Google الرسمية وتسجيل الدخول
      const result = await signInWithPopup(auth, googleProvider);
      await completeFirebaseUserSession(result.user);
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      if (authError?.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          showGoogleAuthError(redirectErr);
          return;
        }
      }
      showGoogleAuthError(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 16 : undefined }}
      className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg items-center px-4 py-6 sm:px-6 sm:py-12"
    >
      <div className="w-full rounded-[24px] border border-[#E3E8F0] bg-white p-6 sm:p-9 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="mb-6 text-center">
          <Link
            href="/"
            aria-label="SEFT Lab - الصفحة الرئيسية"
            className="mb-4 inline-flex justify-center"
          >
            <TadreebakLogo variant="horizontal" themeMode="auto" className="h-11 w-auto" />
          </Link>
          <p className="mb-2 font-tabular text-xs font-semibold tracking-wider text-[#2F6BFF] uppercase">
            UNIFIED AUTHENTICATION
          </p>
          <h1 className="text-2xl font-bold text-[#0A1630] sm:text-3xl dark:text-[#FAFBFC]">
            تسجيل الدخول
          </h1>
          <p className="mt-1.5 text-sm text-[#526077] dark:text-[#94A3B8]">
            أدخل بريدك أو سجّل بواسطة Google للانتقال تلقائياً إلى لوحتك المخصصة.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-[14px] border border-red-200 bg-red-50/90 p-4 text-xs font-semibold leading-relaxed text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[1.5] text-[#526077]" />
              <Input
                type="text"
                inputMode="email"
                autoComplete="username"
                enterKeyHint="next"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                dir="ltr"
                required
                placeholder="name@domain.com"
                className="pr-10 text-right"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[1.5] text-[#526077]" />
              <Input
                type="password"
                autoComplete="current-password"
                enterKeyHint="go"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                required
                placeholder="••••••••"
                className="pr-10 text-right"
              />
            </div>
          </div>

          {/* زر تسجيل الدخول الأساسي */}
          <Button
            type="submit"
            size="lg"
            disabled={loading || googleLoading}
            className="w-full gap-2 font-bold shadow-xs min-h-[48px] text-base"
          >
            <LogIn className="h-4 w-4 stroke-[1.5]" />
            <span>{loading ? 'جارٍ تسجيل الدخول...' : 'دخول إلى اللوحة'}</span>
          </Button>

          {/* فاصل أو */}
          <div className="relative my-4 flex items-center justify-center">
            <span className="w-full border-t border-[#E2E8F0] dark:border-[#1E325C]" />
            <span className="absolute bg-white px-3 text-xs font-semibold text-[#64748B] dark:bg-[#0A1630] dark:text-[#94A3B8]">
              أو
            </span>
          </div>

          {/* زر تسجيل الدخول بواسطة Google أسفل زر الدخول مباشرة */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full gap-3 border-2 border-[#CBD5E1] bg-white min-h-[48px] text-sm font-bold text-[#0A1630] shadow-sm hover:bg-[#F8FAFC] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white dark:hover:bg-[#0F1E3E]"
          >
            <GoogleIcon />
            <span>{googleLoading ? 'جارٍ الاتصال بـ Google...' : 'الدخول بواسطة Google'}</span>
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[#526077] dark:text-[#94A3B8]">
          ليس لديك حساب بعد؟{' '}
          <Link
            href="/register"
            className="font-bold text-[#2F6BFF] hover:underline"
          >
            أنشئ حساباً جديداً
          </Link>
        </p>

        <p className="mt-4 border-t border-[#E3E8F0] pt-4 text-center text-[11px] leading-relaxed text-[#64748B] dark:border-[#1E325C] dark:text-[#94A3B8]">
          بتسجيل الدخول إلى منصة SEFT Lab، فإنك تقر بالالتزام بـ{' '}
          <Link href="/terms" className="font-medium text-[#2F6BFF] hover:underline">
            الشروط والأحكام
          </Link>{' '}
          و{' '}
          <Link href="/privacy" className="font-medium text-[#2F6BFF] hover:underline">
            سياسة الخصوصية
          </Link>{' '}
          و{' '}
          <Link href="/disclaimer" className="font-medium text-[#2F6BFF] hover:underline">
            إخلاء المسؤولية
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
