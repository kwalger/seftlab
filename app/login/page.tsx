'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogIn, User, Lock } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { isSuperAdminEmail, resolveUserRole } from '@/lib/auth-constants';
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

// دالة فحص وتحديث وثيقة المستخدم في Firestore مع دعم السوبر أدمن والاستعلام المرن
async function syncFirestoreUser(
  uid: string,
  email: string | null,
  displayName: string | null,
  photoURL: string | null
): Promise<{ role: UserRole; name: string; photoURL?: string }> {
  const isSuper = isSuperAdminEmail(email);
  let role: UserRole = isSuper ? 'admin' : 'student';
  let name = displayName || (email ? email.split('@')[0] : 'مستخدم');
  let finalPhoto = photoURL || '';

  try {
    const userDocRef = doc(db, 'users', uid);

    // مهلة زمنية 3.5 ثانية للفايرستور لضمان عدم التعليق في حال بطء الشبكة
    const timeout = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), 3500)
    );

    let docSnap: any = await Promise.race([getDoc(userDocRef), timeout]).catch(() => null);

    // محاولة البحث بالبريد الإلكتروني كمعرّف وثيقة في حال لم يُعثر عليه بالـ UID
    if ((!docSnap || !docSnap.exists()) && email) {
      const emailDocRef = doc(db, 'users', email.toLowerCase().trim());
      docSnap = await Promise.race([getDoc(emailDocRef), timeout]).catch(() => null);
    }

    // محاولة الاستعلام بحقل البريد الإلكتروني في المجموعة
    if ((!docSnap || !docSnap.exists()) && email) {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase().trim())
      );
      const querySnap: any = await Promise.race([getDocs(q), timeout]).catch(() => null);
      if (querySnap && !querySnap.empty) {
        docSnap = querySnap.docs[0];
      }
    }

    if (docSnap && docSnap.exists()) {
      const data = docSnap.data();
      const rawRole = (data.role as UserRole) || 'student';
      role = resolveUserRole(email, rawRole);
      if (data.name || data.fullName) name = data.name || data.fullName;
      if (data.photoURL || data.avatarUrl) finalPhoto = data.photoURL || data.avatarUrl;

      // ترقية المستخدم في Firestore إلى أدمن إذا كان مسجلاً كسوبر أدمن
      if (isSuper && rawRole !== 'admin') {
        setDoc(userDocRef, { role: 'admin' }, { merge: true }).catch(() => {});
      }
    } else {
      // مستخدم جديد يسجل لأول مرة في Firebase
      await Promise.race([
        setDoc(userDocRef, {
          name: name,
          email: email || '',
          photoURL: photoURL || '',
          role: isSuper ? 'admin' : 'student',
          createdAt: new Date().toISOString(),
        }),
        timeout,
      ]).catch(() => {});
      role = isSuper ? 'admin' : 'student';
    }
  } catch (err) {
    console.warn('Firestore sync note:', err);
  }

  console.log('🔑 [Login] Firestore sync result:', {
    uid,
    email,
    resolvedRole: role,
    isSuperAdmin: isSuper,
  });

  return { role, name, photoURL: finalPhoto };
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

  // إكمال الجلسة والتوجيه بناءً على الرتبة
  const completeSession = (
    uid: string,
    email: string | null,
    name: string,
    role: UserRole,
    photoURL?: string | null
  ) => {
    const isSuper = isSuperAdminEmail(email);
    const effectiveRole: UserRole = isSuper ? 'admin' : role;

    // تعيين الكوكيز للـ Middleware
    document.cookie = `seftlab_role=${effectiveRole}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `tadreebak_role=${effectiveRole}; path=/; max-age=604800; SameSite=Lax`;
    if (email) {
      document.cookie = `seftlab_email=${encodeURIComponent(email.toLowerCase().trim())}; path=/; max-age=604800; SameSite=Lax`;
    }

    // إرسال طلب لمسار المزامنة في الـ Edge لإنشاء كوكي الجلسة الموقّع
    if (typeof fetch !== 'undefined') {
      fetch('/api/auth/sync-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          email: email || '',
          name,
          role: effectiveRole,
        }),
      }).catch(() => {});
    }

    const session: UserSession = {
      id: uid,
      name: name,
      username: email ? email.split('@')[0] : 'user',
      email: email || '',
      role: effectiveRole,
      organizationOrUniversity: effectiveRole === 'teacher' ? 'جامعة الزرقاء' : 'جامعة الزرقاء',
      approvalStatus: 'approved',
      avatarUrl: photoURL || undefined,
      photoURL: photoURL || undefined,
    };
    loginUser(session);

    recordAuditAction(
      'تسجيل دخول',
      `دخول حقيقي عبر Firebase (${effectiveRole}): ${name}`,
      name,
      effectiveRole
    );

    triggerHaptic('success');
    toast.success(`مرحباً بك، ${name}`);

    // التوجيه إلى اللوحة المطلوبة
    if (effectiveRole === 'admin') {
      router.push('/admin');
    } else if (effectiveRole === 'teacher') {
      router.push('/teacher-dashboard');
    } else {
      router.push('/student-dashboard');
    }
  };

  // 1. تسجيل الدخول بالبريد وكلمة المرور عبر Firebase Auth الحقيقي
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
      // التحقق الفعلي من Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // فحص الدور في Firestore
      const { role, name, photoURL } = await syncFirestoreUser(
        user.uid,
        user.email,
        user.displayName,
        user.photoURL
      );

      completeSession(user.uid, user.email, name, role, photoURL || user.photoURL);
    } catch (err: unknown) {
      triggerHaptic('error');
      const firebaseError = err as { code?: string; message?: string };
      const code = firebaseError?.code || '';

      if (
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found'
      ) {
        const msg =
          'البريد الإلكتروني غير مسجل في Firebase أو كلمة المرور غير صحيحة. يمكنك إنشاء حساب جديد عبر الرابط أدناه أو استخدام زر الدخول بواسطة Google.';
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
        const msg = 'تعذر الاتصال بخوادم Firebase. يرجى التحقق من اتصال الإنترنت.';
        setErrorMessage(msg);
        toast.error(msg);
      } else {
        const msg = 'حدث خطأ أثناء تسجيل الدخول: ' + (firebaseError?.message || 'يرجى المحاولة مجدداً.');
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. تسجيل الدخول بواسطة Google الحقيقي عبر signInWithPopup
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);

    try {
      // فتح نافذة Google الرسمية وتسجيل الدخول الفعلي
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // فحص وثيقة المستخدم في Firestore: إذا كان جديداً ينشئ له حساب طالب، وإذا مسجل يقرأ الدور
      const { role, name, photoURL } = await syncFirestoreUser(
        user.uid,
        user.email,
        user.displayName,
        user.photoURL
      );

      completeSession(user.uid, user.email, name, role, photoURL || user.photoURL);
    } catch (err: unknown) {
      triggerHaptic('error');
      const firebaseError = err as { code?: string; message?: string };
      const code = firebaseError?.code || '';

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
        const msg =
          'يرجى تفعيل موفر Google في لوحة Firebase Console: (Authentication -> Sign-in method -> Google -> Enable).';
        setErrorMessage(msg);
        toast.error(msg);
      } else if (code === 'auth/unauthorized-domain') {
        const msg =
          'النطاق الحالي غير مضاف في النطاقات المصرح بها في Firebase Console: (Authentication -> Settings -> Authorized Domains -> إضافة localhost).';
        setErrorMessage(msg);
        toast.error(msg);
      } else {
        const msg =
          'تعذر تسجيل الدخول بواسطة Google: ' +
          (firebaseError?.message || 'يرجى التأكد من تفعيل Google في لوحة Firebase.');
        setErrorMessage(msg);
        toast.error(msg);
      }
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
            <span>{loading ? 'جارٍ التحقق من Firebase...' : 'دخول إلى اللوحة'}</span>
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
            أنشئ حساباً جديداً في Firebase
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
