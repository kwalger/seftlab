'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  GraduationCap,
  Building2,
  BookOpen,
  UserPlus,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { isSuperAdminEmail, resolveUserRole } from '@/lib/auth-constants';
import { useAppStore } from '@/store/use-app-store';
import { useKeyboardOffset } from '@/hooks/use-keyboard-offset';
import { triggerHaptic } from '@/lib/haptics';
import { UNIVERSITIES } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TadreebakLogo } from '@/components/shared/tadreebak-logo';
import { UserRole } from '@/types';

const DOCTOR_EMAIL_REGEX = /^dr\d*@seftlab\.com$/i;
const GOOGLE_REGISTER_PREFS_KEY = 'seftlab_google_register_prefs';

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

export default function RegisterPage() {
  const router = useRouter();
  const { loginUser } = useAppStore();
  const { keyboardHeight } = useKeyboardOffset(true);

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<'student' | 'teacher' | 'company'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationOrUniversity, setOrganizationOrUniversity] = useState(
    UNIVERSITIES[0]
  );
  const [departmentOrReg, setDepartmentOrReg] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const redirectCheckedRef = useRef(false);

  const completeGoogleRegistration = async (
    user: FirebaseUser,
    prefs?: { role?: 'student' | 'company'; organizationOrUniversity?: string; name?: string }
  ) => {
    const userEmail = user.email?.toLowerCase().trim() || '';
    const isSuper = isSuperAdminEmail(userEmail);
    const chosenRole: 'student' | 'company' =
      prefs?.role === 'company' || role === 'company' ? 'company' : 'student';

    let finalRole: UserRole = isSuper ? 'admin' : chosenRole;
    let displayName =
      prefs?.name?.trim() ||
      name.trim() ||
      user.displayName ||
      (userEmail ? userEmail.split('@')[0] : 'مستخدم SEFT Lab');
    let org =
      prefs?.organizationOrUniversity?.trim() ||
      organizationOrUniversity.trim() ||
      UNIVERSITIES[0];
    let photo = user.photoURL || '';

    const userDocRef = doc(db, 'users', user.uid);
    const timeout = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), 3500)
    );

    const existingSnap: any = await Promise.race([
      getDoc(userDocRef),
      timeout,
    ]).catch(() => null);

    if (existingSnap && typeof existingSnap.exists === 'function' && existingSnap.exists()) {
      const data = existingSnap.data();
      finalRole = resolveUserRole(userEmail, data.role, true);
      if (data.name || data.fullName) displayName = data.name || data.fullName;
      if (data.organizationOrUniversity) org = data.organizationOrUniversity;
      if (data.photoURL || data.avatarUrl) photo = data.photoURL || data.avatarUrl;
    } else {
      setDoc(
        userDocRef,
        {
          name: displayName,
          email: userEmail,
          photoURL: photo,
          role: finalRole,
          organizationOrUniversity: org,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    }

    const idToken = await user.getIdToken();
    await fetch('/api/auth/sync-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        name: displayName,
        role: finalRole,
      }),
    }).catch(() => {});

    document.cookie = `seftlab_role=${finalRole}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `tadreebak_role=${finalRole}; path=/; max-age=604800; SameSite=Lax`;
    if (userEmail) {
      document.cookie = `seftlab_email=${encodeURIComponent(userEmail)}; path=/; max-age=604800; SameSite=Lax`;
    }

    loginUser({
      id: user.uid,
      name: displayName,
      username: userEmail ? userEmail.split('@')[0] : 'user',
      email: userEmail,
      role: finalRole,
      organizationOrUniversity: org,
      approvalStatus: 'approved',
      avatarUrl: photo || undefined,
      photoURL: photo || undefined,
    });

    triggerHaptic('success');
    toast.success(`مرحباً بك، ${displayName}`);
    router.push(
      finalRole === 'admin'
        ? '/admin'
        : finalRole === 'teacher'
        ? '/teacher'
        : finalRole === 'company'
        ? '/company'
        : '/student'
    );
  };

  const completeGoogleRegistrationRef = useRef(completeGoogleRegistration);
  completeGoogleRegistrationRef.current = completeGoogleRegistration;

  const showGoogleError = (err: unknown) => {
    triggerHaptic('error');
    const authError = err as { code?: string };
    const code = authError?.code || '';

    if (code === 'auth/popup-closed-by-user') {
      toast.error('تم إغلاق نافذة التسجيل بواسطة Google قبل إتمامها.');
    } else if (code === 'auth/cancelled-popup-request') {
      toast.error('تم إلغاء طلب التسجيل عبر Google.');
    } else if (code === 'auth/popup-blocked') {
      toast.error('تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة.');
    } else if (code === 'auth/operation-not-allowed') {
      toast.error('خدمة التسجيل بواسطة Google غير متاحة حالياً.');
    } else if (code === 'auth/unauthorized-domain') {
      toast.error('تعذر التسجيل من هذا النطاق. يرجى التحقق من النطاق المصرح به.');
    } else {
      toast.error('تعذر إتمام التسجيل بواسطة Google. يرجى المحاولة مجدداً.');
    }
  };

  useEffect(() => {
    if (redirectCheckedRef.current) return;
    redirectCheckedRef.current = true;

    getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return;
        setGoogleLoading(true);
        let storedPrefs:
          | { role?: 'student' | 'company'; organizationOrUniversity?: string; name?: string }
          | undefined;
        try {
          const raw = sessionStorage.getItem(GOOGLE_REGISTER_PREFS_KEY);
          if (raw) {
            storedPrefs = JSON.parse(raw);
            sessionStorage.removeItem(GOOGLE_REGISTER_PREFS_KEY);
          }
        } catch {}

        try {
          await completeGoogleRegistrationRef.current(result.user, storedPrefs);
        } catch (err) {
          showGoogleError(err);
        } finally {
          setGoogleLoading(false);
        }
      })
      .catch((err) => {
        showGoogleError(err);
      });
  }, []);

  const handleGoogleRegister = async () => {
    if (role === 'teacher') {
      toast.error('التسجيل عبر Google متاح لحسابات الطلاب والشركات فقط.');
      return;
    }

    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await completeGoogleRegistration(result.user);
    } catch (err: unknown) {
      const authError = err as { code?: string };
      if (authError?.code === 'auth/popup-blocked') {
        try {
          sessionStorage.setItem(
            GOOGLE_REGISTER_PREFS_KEY,
            JSON.stringify({
              role: role === 'company' ? 'company' : 'student',
              organizationOrUniversity: organizationOrUniversity.trim(),
              name: name.trim(),
            })
          );
        } catch {}
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          showGoogleError(redirectErr);
          return;
        }
      }
      showGoogleError(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleNextStep = () => {
    if (name.trim().length < 3 || organizationOrUniversity.trim().length < 2) {
      triggerHaptic('error');
      toast.error('يرجى كتابة الاسم والمؤسسة أو الجامعة قبل المتابعة.');
      return;
    }
    triggerHaptic('tap');
    setStep(2);
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (name.trim().length < 3 || !email.includes('@') || password.length < 6) {
      triggerHaptic('error');
      toast.error('يرجى تعبئة كافة الحقول المطلوبة بشكل صحيح.');
      return;
    }
    if (!agreedToTerms) {
      triggerHaptic('error');
      toast.error('يرجى الإقرار بالموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة.');
      return;
    }

    if (role === 'teacher') {
      const normalizedEmail = email.trim().toLowerCase();
      if (!DOCTOR_EMAIL_REGEX.test(normalizedEmail)) {
        triggerHaptic('error');
        toast.error(
          'يُسمح للدكاترة فقط ببريد dr@seftlab.com أو زيادة أرقام بعد dr مثل dr1@seftlab.com و dr2@seftlab.com.'
        );
        return;
      }

      setSubmitting(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: normalizedEmail,
            password,
            name: name.trim(),
            organizationOrUniversity: departmentOrReg.trim()
              ? `${organizationOrUniversity.trim()} — ${departmentOrReg.trim()}`
              : organizationOrUniversity.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          triggerHaptic('error');
          toast.error(data.error || 'كلمة المرور المعتمدة لحساب الدكتور غير صحيحة.');
          return;
        }

        loginUser(data.session);
        triggerHaptic('success');
        toast.success(`مرحباً بك، ${data.session.name}`);
        router.push('/teacher');
      } catch {
        triggerHaptic('error');
        toast.error('تعذر الاتصال بخادم المصادقة.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);

    try {
      // 1. إنشاء الحساب الحقيقي في Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;

      // تحديث الاسم المعروض في Firebase
      await updateProfile(user, {
        displayName: name.trim(),
      }).catch(() => {});

      // 2. حفظ وثيقة المستخدم في Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const timeout = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), 3500)
      );

      await Promise.race([
        setDoc(userDocRef, {
          name: name.trim(),
          email: email.trim(),
          role: role,
          organizationOrUniversity: organizationOrUniversity.trim(),
          createdAt: new Date().toISOString(),
        }),
        timeout,
      ]).catch(() => {});

      // 3. ضبط الكوكيز ومزامنة جلسة الخادم الموقعة باستخدام Firebase ID Token
      const idToken = await user.getIdToken();
      await fetch('/api/auth/sync-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          name: name.trim(),
          role,
        }),
      }).catch(() => {});

      document.cookie = `seftlab_role=${role}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `tadreebak_role=${role}; path=/; max-age=604800; SameSite=Lax`;

      loginUser({
        id: user.uid,
        name: name.trim(),
        username: email.trim().split('@')[0],
        email: email.trim(),
        role,
        organizationOrUniversity: organizationOrUniversity.trim(),
        approvalStatus: 'approved',
      });

      triggerHaptic('success');
      toast.success(
        role === 'student' ? 'تم إنشاء حساب الطالب بنجاح' : 'تم إنشاء الحساب بنجاح'
      );
      router.push(role === 'student' ? '/student' : '/company');
    } catch (err: unknown) {
      triggerHaptic('error');
      const firebaseError = err as { code?: string; message?: string };
      const code = firebaseError?.code || '';

      if (code === 'auth/email-already-in-use') {
        toast.error('هذا البريد الإلكتروني مسجل بالفعل. يرجى التوجه لصفحة تسجيل الدخول.');
      } else if (code === 'auth/weak-password') {
        toast.error('كلمة المرور ضعيفة. يجب أن تتكون من 6 أحرف على الأقل.');
      } else if (code === 'auth/invalid-email') {
        toast.error('صيغة البريد الإلكتروني غير صالحة.');
      } else {
        toast.error('تعذر إنشاء الحساب. يرجى التأكد من صحة البيانات والمحاولة مجدداً.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 90 : undefined }}
      className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-xl flex-col justify-center px-4 pt-6 pb-28 sm:px-6 sm:py-12"
    >
      <div className="w-full rounded-[16px] border border-[#E3E8F0] bg-white p-5 sm:p-9 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="mb-4 flex justify-center">
          <Link href="/" aria-label="SEFT Lab - الصفحة الرئيسية" className="inline-flex">
            <TadreebakLogo variant="horizontal" themeMode="auto" className="h-11 w-auto" />
          </Link>
        </div>
        <div className="mb-5 flex items-center justify-between border-b border-[#E3E8F0] pb-4 dark:border-[#1E325C]">
          <div>
            <p className="font-tabular text-xs font-semibold tracking-wider text-[#2F6BFF] uppercase">
              CREATE ACCOUNT
            </p>
            <h1 className="mt-1 text-xl font-semibold text-[#0A1630] sm:text-2xl dark:text-[#FAFBFC]">
              إنشاء حساب جديد
            </h1>
          </div>
          <span className="font-tabular rounded-[10px] border border-[#E3E8F0] bg-[#FAFBFC] px-3 py-1.5 text-xs font-medium text-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]">
            الخطوة {step} / 2
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          <div className="h-1.5 rounded-full bg-[#2F6BFF]" />
          <div
            className={`h-1.5 rounded-full transition-colors ${
              step === 2 ? 'bg-[#2F6BFF]' : 'bg-[#E3E8F0] dark:bg-[#1E325C]'
            }`}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="mb-2 block text-xs font-medium text-[#0A1630] dark:text-[#FAFBFC]">
                  نوع الحساب
                </label>
                <div className="grid grid-cols-3 gap-1.5 rounded-[12px] bg-[#F1F4F9] p-1.5 dark:bg-[#070D1F]">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex min-h-[48px] flex-col sm:flex-row items-center justify-center gap-1 rounded-[10px] px-1.5 py-2 text-[11px] sm:text-xs font-semibold transition-all ${
                      role === 'student'
                        ? 'bg-white text-[#2F6BFF] shadow-xs dark:bg-[#0A1630]'
                        : 'text-[#526077] dark:text-[#94A3B8]'
                    }`}
                  >
                    <GraduationCap className="h-4 w-4 stroke-[1.5]" />
                    <span>طالب / خريج</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`flex min-h-[48px] flex-col sm:flex-row items-center justify-center gap-1 rounded-[10px] px-1.5 py-2 text-[11px] sm:text-xs font-semibold transition-all ${
                      role === 'teacher'
                        ? 'bg-white text-[#2F6BFF] shadow-xs dark:bg-[#0A1630]'
                        : 'text-[#526077] dark:text-[#94A3B8]'
                    }`}
                  >
                    <BookOpen className="h-4 w-4 stroke-[1.5]" />
                    <span>دكتور / معلم جامعي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('company')}
                    className={`flex min-h-[48px] flex-col sm:flex-row items-center justify-center gap-1 rounded-[10px] px-1.5 py-2 text-[11px] sm:text-xs font-semibold transition-all ${
                      role === 'company'
                        ? 'bg-white text-[#2F6BFF] shadow-xs dark:bg-[#0A1630]'
                        : 'text-[#526077] dark:text-[#94A3B8]'
                    }`}
                  >
                    <Building2 className="h-4 w-4 stroke-[1.5]" />
                    <span>شركة توظيف</span>
                  </button>
                </div>
              </div>

              {role === 'teacher' && (
                <div className="rounded-[12px] border border-[#2F6BFF]/30 bg-[#2F6BFF]/[0.06] p-3.5 text-xs leading-relaxed text-[#0A1630] dark:border-[#2F6BFF]/40 dark:bg-[#2F6BFF]/10 dark:text-[#CBD5E1]">
                  دخول الدكاترة المعتمد: استخدم البريد المخصص لك بصيغة{' '}
                  <code dir="ltr" className="font-tabular font-bold text-[#2F6BFF]">
                    dr@seftlab.com
                  </code>{' '}
                  أو بزيادة أرقام بعد{' '}
                  <code dir="ltr" className="font-tabular font-bold text-[#2F6BFF]">
                    dr
                  </code>{' '}
                  فقط (مثل{' '}
                  <code dir="ltr" className="font-tabular font-bold text-[#2F6BFF]">
                    dr1@seftlab.com
                  </code>
                  ،{' '}
                  <code dir="ltr" className="font-tabular font-bold text-[#2F6BFF]">
                    dr2@seftlab.com
                  </code>
                  ) وكلمة المرور المعتمدة للدخول المباشر إلى لوحة التحكم.
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  {role === 'student'
                    ? 'الاسم الكامل'
                    : role === 'teacher'
                    ? 'الاسم الأكاديمي'
                    : 'اسم مسؤول التوظيف'}
                </label>
                <Input
                  type="text"
                  autoComplete="name"
                  enterKeyHint="next"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={
                    role === 'student'
                      ? 'مثال: يزن النابلسي'
                      : role === 'teacher'
                      ? 'د. أحمد خليل'
                      : 'سارة الخطيب'
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  {role === 'company' ? 'اسم الشركة أو المؤسسة' : 'الجامعة'}
                </label>
                <Input
                  type="text"
                  autoComplete="organization"
                  enterKeyHint="next"
                  value={organizationOrUniversity}
                  onChange={(e) => setOrganizationOrUniversity(e.target.value)}
                  required
                  placeholder={role === 'company' ? 'مثال: شركة التقنية الحديثة' : 'جامعة الزرقاء'}
                />
              </div>

              <div className="hidden pt-2 sm:block">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleNextStep}
                  className="w-full gap-2"
                >
                  <span>التالي: بيانات الدخول</span>
                  <ArrowLeft className="h-4 w-4 stroke-[1.5]" />
                </Button>
              </div>
            </>
          ) : (
            <>
              {role !== 'student' && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium">
                    {role === 'teacher'
                      ? 'الكلية / القسم الأكاديمي'
                      : 'رقم السجل التجاري'}
                  </label>
                  <Input
                    type="text"
                    enterKeyHint="next"
                    value={departmentOrReg}
                    onChange={(e) => setDepartmentOrReg(e.target.value)}
                    required
                    placeholder={
                      role === 'teacher' ? 'كلية الأعمال' : '200184920'
                    }
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  البريد الإلكتروني الرسمي
                </label>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  enterKeyHint="next"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  required
                  placeholder={
                    role === 'teacher'
                      ? 'dr@seftlab.com / dr1@seftlab.com'
                      : 'name@university.edu'
                  }
                  className="text-right"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  كلمة المرور (6 خانات على الأقل)
                </label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  enterKeyHint="done"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  required
                  placeholder="••••••••"
                  className="text-right"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[#E3E8F0] bg-[#FAFBFC] p-3 text-xs leading-relaxed text-[#334155] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#CBD5E1]">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#CBD5E1] accent-[#2F6BFF]"
                />
                <span>
                  أقر بموافقتي الصريحة على{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-semibold text-[#2F6BFF] underline underline-offset-2"
                  >
                    الشروط والأحكام القانونية
                  </Link>
                  ، و
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-semibold text-[#2F6BFF] underline underline-offset-2"
                  >
                    سياسة الخصوصية
                  </Link>
                  ، و
                  <Link
                    href="/disclaimer"
                    target="_blank"
                    className="font-semibold text-[#2F6BFF] underline underline-offset-2"
                  >
                    إخلاء المسؤولية وميثاق النزاهة
                  </Link>{' '}
                  الخاصة بمنصة SEFT Lab (seftlab.com).
                </span>
              </label>

              <div className="hidden grid-cols-3 gap-2.5 pt-2 sm:grid">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                >
                  السابق
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting || googleLoading}
                  className="col-span-2 gap-2"
                >
                  <UserPlus className="h-4 w-4 stroke-[1.5]" />
                  <span>
                    {submitting
                      ? 'جارٍ التحقق...'
                      : role === 'teacher'
                      ? 'دخول مباشر للوحة الدكتور'
                      : 'إنشاء الحساب'}
                  </span>
                </Button>
              </div>
            </>
          )}
        </form>

        {role !== 'teacher' && (
          <div className="mt-5">
            <div className="relative my-4 flex items-center justify-center">
              <span className="w-full border-t border-[#E2E8F0] dark:border-[#1E325C]" />
              <span className="absolute bg-white px-3 text-xs font-semibold text-[#64748B] dark:bg-[#0A1630] dark:text-[#94A3B8]">
                أو
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleGoogleRegister}
              disabled={submitting || googleLoading}
              className="min-h-[48px] w-full gap-3 border-2 border-[#CBD5E1] bg-white text-sm font-bold text-[#0A1630] shadow-xs hover:bg-[#F8FAFC] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white dark:hover:bg-[#0F1E3E]"
            >
              <GoogleIcon />
              <span>
                {googleLoading
                  ? 'جارٍ الاتصال بـ Google...'
                  : 'التسجيل السريع بواسطة Google'}
              </span>
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-[#526077] dark:text-[#94A3B8]">
          لديك حساب بالفعل؟{' '}
          <Link
            href="/login"
            className="font-semibold text-[#2F6BFF] hover:underline"
          >
            سجّل دخولك
          </Link>
        </p>
      </div>

      {/* Sticky Mobile Bottom CTA Bar above Keyboard / Safe Area */}
      <div
        style={{ bottom: keyboardHeight > 0 ? keyboardHeight : 0 }}
        className="fixed inset-x-0 z-40 border-t border-[#E3E8F0] bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden dark:border-[#1E325C] dark:bg-[#0A1630]/95"
      >
        {step === 1 ? (
          <Button
            type="button"
            size="lg"
            onClick={handleNextStep}
            className="w-full gap-2"
          >
            <span>التالي: بيانات الدخول</span>
            <ArrowLeft className="h-4 w-4 stroke-[1.5]" />
          </Button>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep(1)}
              className="gap-1"
            >
              <ArrowRight className="h-4 w-4 stroke-[1.5]" />
              <span>السابق</span>
            </Button>
            <Button
              type="button"
              size="lg"
              disabled={submitting}
              onClick={handleSubmit}
              className="col-span-2 gap-2"
            >
              <UserPlus className="h-4 w-4 stroke-[1.5]" />
              <span>
                {submitting
                  ? 'جارٍ التحقق...'
                  : role === 'teacher'
                  ? 'دخول لوحة الدكتور'
                  : 'إنشاء الحساب'}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
