'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ban,
  CheckCircle2,
  Download,
  GraduationCap,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { isSuperAdminEmail } from '@/lib/auth-constants';
import { useFirestoreUsers } from '@/lib/hooks/use-firestore-users';
import { useAdminStore } from '@/store/use-admin-store';
import { PlatformService } from '@/services/platform-service';
import { UserRole } from '@/types';
import {
  ChartCard,
  DashboardStatCard,
  DataTable,
  DataTableColumn,
  PageHeader,
} from '@/components/dashboard/ui-kit';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface FirestoreUserRecord {
  id: string;
  uid: string;
  slug: string;
  fullName: string;
  email: string;
  role: UserRole;
  universityOrOrg: string;
  status: string;
  joinedAt: string;
  photoURL?: string;
  sourceCollection: 'users' | 'students';
  isSuperAdmin: boolean;
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'طالب جامعي',
  teacher: 'معلم / أستاذ مساق',
  company: 'شركة موظِّفة',
  admin: 'مسؤول النظام (أدمن)',
};

export default function AdminUsersPage() {
  const { recordAuditAction } = useAdminStore();
  const {
    users: liveUsers,
    totalCount,
    loading,
    refreshing,
    error: firestoreError,
    refetch,
    studentCount,
    teacherCount,
    companyCount,
    adminCount,
    activeUsersCount,
    pendingUsersCount,
  } = useFirestoreUsers();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userToDelete, setUserToDelete] = useState<FirestoreUserRecord | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);

  const users = useMemo<FirestoreUserRecord[]>(
    () =>
      liveUsers.map((u) => ({
        id: u.id,
        uid: u.uid,
        slug: u.slug,
        fullName: u.name,
        email: u.email || '—',
        role: u.role,
        universityOrOrg: u.organizationOrUniversity,
        status: u.status,
        joinedAt: u.joinedAt,
        photoURL: u.photoURL || '',
        sourceCollection: u.sourceCollection,
        isSuperAdmin: isSuperAdminEmail(u.email),
      })),
    [liveUsers]
  );

  // الفلترة
  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (statusFilter !== 'all' && u.status !== statusFilter) return false;
        return true;
      }),
    [users, roleFilter, statusFilter]
  );

  // 2. تعديل الدور والصلاحية (Role) في Firestore فورياً عبر updateDoc
  const handleRoleChange = async (
    record: FirestoreUserRecord,
    nextRole: UserRole
  ) => {
    if (record.isSuperAdmin && nextRole !== 'admin') {
      toast.error(
        'لا يمكن تخفيض صلاحيات حساب المسؤول الرئيسي (Super Admin)؛ تبقى رتبته Admin بشكل دائم.'
      );
      return;
    }

    setUpdatingId(record.id);
    try {
      const userRef = doc(db, record.sourceCollection, record.id);
      await updateDoc(userRef, {
        role: nextRole,
        updatedAt: new Date().toISOString(),
      });
      recordAuditAction(
        'تغيير دور',
        `تغيير رتبة المستخدم ${record.fullName} إلى ${ROLE_LABELS[nextRole]}`
      );
      toast.success(
        `تم تحديث رتبة (${record.fullName}) إلى [${ROLE_LABELS[nextRole]}] في Firestore`
      );
      refetch();
    } catch (error) {
      console.error('Error updating role in Firestore:', error);
      toast.error('حدث خطأ أثناء تحديث الصلاحية في قاعدة بيانات Firestore');
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. تعليق أو إعادة تنشيط الحساب في Firestore فعلياً عبر updateDoc
  const handleToggleStatus = async (user: FirestoreUserRecord) => {
    if (user.isSuperAdmin) {
      toast.error('لا يمكن تعليق حساب المسؤول الرئيسي.');
      return;
    }
    setUpdatingId(user.id);
    const isSuspended = user.status === 'معلّق';
    const nextStatus = isSuspended ? 'نشط' : 'معلّق';

    try {
      const userRef = doc(db, user.sourceCollection, user.id);
      await updateDoc(userRef, {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });
      recordAuditAction(
        'تعليق حساب',
        `${nextStatus === 'معلّق' ? 'تعليق' : 'إعادة تنشيط'} حساب ${user.fullName} (${user.email})`
      );
      toast.success(
        nextStatus === 'معلّق'
          ? `تم تعليق حساب ${user.fullName} في Firestore`
          : `تم إعادة تنشيط حساب ${user.fullName} بنجاح`
      );
      refetch();
    } catch (error) {
      console.error('Error updating user status in Firestore:', error);
      toast.error('حدث خطأ أثناء تعديل حالة الحساب في Firestore');
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. حذف الحساب نهائياً من Firestore عبر deleteDoc
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    if (userToDelete.isSuperAdmin) {
      toast.error('لا يمكن حذف وثيقة المسؤول الرئيسي من هذه الواجهة.');
      setUserToDelete(null);
      return;
    }
    setIsDeleting(true);
    try {
      const userRef = doc(db, userToDelete.sourceCollection, userToDelete.id);
      await deleteDoc(userRef);
      recordAuditAction(
        'حذف مستخدم',
        `حذف وثيقة المستخدم ${userToDelete.fullName} (${userToDelete.email})`
      );
      toast.success(
        `تم حذف حساب ${userToDelete.fullName} نهائياً من قاعدة بيانات Firestore`
      );
      setUserToDelete(null);
      refetch();
    } catch (error) {
      console.error('Error deleting user doc from Firestore:', error);
      toast.error('حدث خطأ أثناء حذف المستخدم من Firestore');
    } finally {
      setIsDeleting(false);
    }
  };

  // 5. إرسال رابط إعادة تعيين كلمة المرور عبر Firebase Authentication
  const handleResetPassword = async (email: string) => {
    if (!email || email === '—') {
      toast.error('لا يتوفر بريد إلكتروني صالح لهذا المستخدم');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      recordAuditAction(
        'تحديث إعدادات',
        `إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`
      );
      toast.success(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`);
    } catch (error: unknown) {
      console.error('Error sending reset email:', error);
      const code = (error as { code?: string })?.code;
      if (code === 'auth/user-not-found') {
        toast.error('هذا البريد غير مسجل في النظام');
      } else {
        toast.error('تعذر إرسال الرابط. يرجى مراجعة إعدادات البريد الإلكتروني.');
      }
    }
  };

  // 6. تصدير البيانات الحقيقية بصيغة CSV (مع حماية ضد CSV Formula Injection)
  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error('لا توجد بيانات مستخدمين لتصديرها');
      return;
    }
    const headers = [
      'معرف الوثيقة (UID)',
      'الاسم الكامل',
      'البريد الإلكتروني',
      'الرابط المهني (Slug)',
      'الرتبة والدور',
      'الجامعة أو المؤسسة',
      'الحالة',
      'تاريخ الانضمام',
    ];
    const rows = filtered.map((u) => [
      u.uid,
      u.fullName,
      u.email,
      `/students/${u.slug}`,
      ROLE_LABELS[u.role] || u.role,
      u.universityOrOrg,
      u.status,
      u.joinedAt,
    ]);
    PlatformService.exportRowsToCsv(
      `seftlab-users-${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
    toast.success('تم تصدير قائمة مستخدمي Firestore الحقيقيين بصيغة CSV');
  };

  // 7. مزامنة جميع حسابات Firebase Auth إلى Firestore فوراً
  const handleAutoSyncStudents = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/auto-sync-students', {
        method: 'POST',
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        toast.error(
          data?.error ||
            'تعذر تشغيل المزامنة مع Firebase Auth. تأكد من صلاحيات الإدارة وإعدادات الخادم.'
        );
        return;
      }

      const summary = data.summary || {};
      recordAuditAction(
        'تحديث إعدادات',
        `مزامنة حسابات Firebase Auth (تم إنشاء ${summary.created ?? 0} وتحديث ${summary.updated ?? 0})`
      );
      toast.success(
        `اكتملت المزامنة: إجمالي ${summary.totalAuthUsers ?? 0} · تم إنشاء ${summary.created ?? 0} · تم تحديث ${summary.updated ?? 0} · دون تغيير ${summary.unchanged ?? 0}`
      );
      refetch();
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم أثناء المزامنة.');
    } finally {
      setSyncing(false);
    }
  };

  // إعداد أعمدة الجدول
  const columns: DataTableColumn<FirestoreUserRecord>[] = [
    {
      key: 'fullName',
      header: 'المستخدم',
      sortable: true,
      sortValue: (r) => r.fullName,
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.photoURL ? (
            <Image
              src={r.photoURL}
              alt={r.fullName}
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 shrink-0 rounded-full object-cover border border-[#E2E8F0] dark:border-[#1E325C]"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-xs font-bold text-[#2F6BFF]">
              {r.fullName.charAt(0) || 'م'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                {r.fullName}
              </span>
              {r.isSuperAdmin && (
                <span className="shrink-0 rounded bg-[#2F6BFF]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#2F6BFF]">
                  Super Admin
                </span>
              )}
            </div>
            <div
              className="truncate font-mono text-[11px] text-[#526077] dark:text-[#94A3B8]"
              dir="ltr"
            >
              {r.email}
            </div>
            <Link
              href={`/students/${r.slug}`}
              dir="ltr"
              className="inline-block truncate font-mono text-[11px] font-medium text-[#2F6BFF] hover:underline"
            >
              /students/{r.slug}
            </Link>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'الدور والصلاحية (Role)',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <select
            value={r.role}
            disabled={updatingId === r.id || r.isSuperAdmin}
            onChange={(e) => handleRoleChange(r, e.target.value as UserRole)}
            title={
              r.isSuperAdmin
                ? 'رتبة المسؤول الرئيسي محمية ومثبتة دائماً على admin'
                : 'تعديل رتبة المستخدم'
            }
            className="h-7.5 rounded-[8px] border border-[#E3E8F0] bg-[#FAFBFC] px-2.5 text-xs font-medium text-[#0A1630] transition-colors hover:border-[#2F6BFF] focus:border-[#2F6BFF] focus:outline-hidden disabled:opacity-65 dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
          >
            <option value="student">طالب (student)</option>
            <option value="teacher">معلم / دكتور (teacher)</option>
            <option value="company">شركة (company)</option>
            <option value="admin">مسؤول النظام (admin)</option>
          </select>
          {updatingId === r.id && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2F6BFF]" />
          )}
        </div>
      ),
    },
    {
      key: 'universityOrOrg',
      header: 'الجامعة / المؤسسة',
      sortable: true,
      sortValue: (r) => r.universityOrOrg,
      render: (r) => (
        <span className="text-xs text-[#526077] dark:text-[#94A3B8]">
          {r.universityOrOrg}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 rounded-[6px] px-2.5 py-0.5 text-[11px] font-semibold ${
            r.status === 'نشط'
              ? 'bg-[#10B981]/10 text-[#10B981]'
              : r.status === 'بانتظار الموافقة'
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              r.status === 'نشط'
                ? 'bg-[#10B981]'
                : r.status === 'بانتظار الموافقة'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
          />
          {r.status}
        </span>
      ),
    },
    {
      key: 'joinedAt',
      header: 'تاريخ الانضمام',
      sortable: true,
      sortValue: (r) => r.joinedAt,
      render: (r) => (
        <span className="font-tabular text-xs text-[#526077] dark:text-[#94A3B8]">
          {r.joinedAt}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'إجراءات إدارية (Firestore)',
      render: (r) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {/* زر تعليق أو تنشيط الحساب في Firestore */}
          <button
            type="button"
            disabled={updatingId === r.id || r.isSuperAdmin}
            onClick={() => handleToggleStatus(r)}
            className="inline-flex items-center gap-1 rounded-[6px] border border-[#E3E8F0] px-2 py-1 text-[11px] font-medium text-[#0A1630] hover:bg-[#F5F6F8] disabled:opacity-45 dark:border-[#1E325C] dark:text-[#FAFBFC] dark:hover:bg-[#1E325C]"
            title={
              r.isSuperAdmin
                ? 'لا يمكن تعليق حساب المسؤول الرئيسي'
                : r.status === 'معلّق'
                ? 'تنشيط الحساب'
                : 'تعليق الحساب مؤقتاً'
            }
          >
            {r.status === 'معلّق' ? (
              <>
                <CheckCircle2 className="h-3 w-3 stroke-[1.75] text-[#10B981]" />
                <span className="text-[#10B981]">تنشيط</span>
              </>
            ) : (
              <>
                <Ban className="h-3 w-3 stroke-[1.75] text-amber-600" />
                <span>تعليق</span>
              </>
            )}
          </button>

          {/* زر إعادة تعيين كلمة المرور */}
          <button
            type="button"
            onClick={() => handleResetPassword(r.email)}
            className="inline-flex items-center gap-1 rounded-[6px] border border-[#E3E8F0] px-2 py-1 text-[11px] font-medium text-[#526077] hover:text-[#0A1630] dark:border-[#1E325C] dark:text-[#94A3B8] dark:hover:text-white"
            title="إرسال رابط إعادة تعيين كلمة المرور إلى البريد"
          >
            <KeyRound className="h-3 w-3 stroke-[1.75]" />
            <span>كلمة المرور</span>
          </button>

          {/* زر حذف الحساب نهائياً */}
          <button
            type="button"
            disabled={r.isSuperAdmin}
            onClick={() => setUserToDelete(r)}
            className="inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950/30"
            title={
              r.isSuperAdmin
                ? 'حساب المسؤول الرئيسي محمي من الحذف'
                : 'حذف الحساب نهائياً من Firestore'
            }
          >
            <Trash2 className="h-3 w-3 stroke-[1.75]" />
            <span>حذف</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المستخدمين والصلاحيات"
        description="جلب كامل ومباشر لجميع المستخدمين والطلاب المسجلين في Firestore بدون قيود، مع ترقيم الصفحات وتعديل الرتب فوراً."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>مزامنة حية ({totalCount})</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={refreshing}
              onClick={refetch}
              className="gap-1.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 stroke-[1.5] ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />
              <span>تحديث البيانات</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={syncing}
              onClick={handleAutoSyncStudents}
              className="gap-1.5"
            >
              {syncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 stroke-[1.5]" />
              )}
              <span>
                {syncing ? 'جارٍ المزامنة...' : 'مزامنة من Firebase Auth'}
              </span>
            </Button>
            <Button size="sm" onClick={handleExportCsv} className="gap-1.5">
              <Download className="h-3.5 w-3.5 stroke-[1.5]" />
              <span>تصدير المستخدمين (CSV)</span>
            </Button>
          </div>
        }
      />

      {/* بطاقات الإحصائيات الفعلية من Firestore */}
      <section
        aria-label="إحصائيات المستخدمين الفعلية"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <DashboardStatCard
          label="إجمالي المستخدمين المسجلين"
          value={totalCount.toLocaleString('en-US')}
          changeText="بيانات حقيقية من Firestore"
          subtitle={`عدد السجلات المجلوبة: ${users.length.toLocaleString('en-US')}`}
          icon={Users}
        />
        <DashboardStatCard
          label="الطلاب الجامعيون"
          value={studentCount.toLocaleString('en-US')}
          changeText="حسابات الطلاب"
          subtitle="بصلاحية student وروابط /students/[slug]"
          icon={GraduationCap}
        />
        <DashboardStatCard
          label="المعلمون والشركات"
          value={(teacherCount + companyCount).toLocaleString('en-US')}
          changeText="الأكاديميون والتوظيف"
          subtitle={`${teacherCount} معلم · ${companyCount} شركة`}
          icon={ShieldCheck}
        />
        <DashboardStatCard
          label="الحسابات النشطة"
          value={activeUsersCount.toLocaleString('en-US')}
          changeText={`${adminCount} إدارة`}
          subtitle={`${adminCount} إدارة · ${pendingUsersCount} بانتظار الموافقة`}
          icon={CheckCircle2}
        />
      </section>

      {firestoreError && (
        <div className="rounded-[14px] border border-red-300 bg-red-50/90 p-4 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          تعذر تحميل بعض بيانات المستخدمين من Firestore:{' '}
          {firestoreError.message || 'يرجى التحقق من قواعد الأمان أو تسجيل الدخول مجدداً.'}
        </div>
      )}

      {/* نافذة تأكيد الحذف النهائي */}
      {userToDelete && (
        <div className="rounded-[16px] border border-red-300 bg-red-50/80 p-5 shadow-sm dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                تأكيد حذف الحساب نهائياً من قاعدة بيانات Firestore
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-red-700 dark:text-red-300">
                هل أنت متأكد تماماً من حذف وثيقة المستخدم{' '}
                <strong>{userToDelete.fullName}</strong> ({userToDelete.email})؟
                هذا الإجراء سيحذف السجل بالكامل من مجموعة{' '}
                <code className="rounded bg-red-200/50 px-1 font-mono text-[11px] dark:bg-red-900/60">
                  {userToDelete.sourceCollection}
                </code>{' '}
                في Firestore ولن يمكن التراجع عنه.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => setUserToDelete(null)}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleDeleteUser}
                  className="bg-red-600 text-white hover:bg-red-700 gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>جاري الحذف...</span>
                    </>
                  ) : (
                    <span>تأكيد الحذف النهائي</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* بطاقة الجدول وسجل الحسابات */}
      <ChartCard
        title="سجل حسابات المنصة (Firestore Live)"
        subtitle={`إجمالي الحسابات المسجلة: ${totalCount.toLocaleString('en-US')} حساب · المعروض حسب الفلاتر: ${filtered.length.toLocaleString('en-US')}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-8 rounded-[8px] border border-[#E3E8F0] bg-[#FAFBFC] px-2.5 text-xs text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
            >
              <option value="all">جميع الأدوار ({users.length})</option>
              <option value="student">الطلاب ({studentCount})</option>
              <option value="teacher">المعلمون ({teacherCount})</option>
              <option value="company">الشركات ({companyCount})</option>
              <option value="admin">مسؤولو النظام ({adminCount})</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-[8px] border border-[#E3E8F0] bg-[#FAFBFC] px-2.5 text-xs text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
            >
              <option value="all">جميع الحالات</option>
              <option value="نشط">نشط</option>
              <option value="بانتظار الموافقة">بانتظار الموافقة</option>
              <option value="معلّق">معلّق</option>
            </select>
          </div>
        }
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2F6BFF]" />
            <p className="mt-3 text-sm font-semibold text-[#0A1630] dark:text-white">
              جاري مزامنة جميع حسابات المستخدمين من Firestore...
            </p>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              يتم الاتصال بمجموعة users وعرض كافة الحسابات الحقيقية لحظياً.
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF]">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="mt-3 text-base font-bold text-[#0A1630] dark:text-white">
              لا توجد حسابات مسجلة في Firestore حالياً
            </h3>
            <p className="mt-1 max-w-md text-xs text-[#64748B] dark:text-[#94A3B8]">
              بمجرد تسجيل دخول أي مستخدم جديد عبر Google أو نموذج التسجيل أو تشغيل زر المزامنة أعلاه، ستظهر جميع الحسابات هنا تلقائياً.
            </p>
          </div>
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            rowKey={(r) => `${r.sourceCollection}:${r.id}`}
            searchPlaceholder="ابحث بالاسم أو البريد أو الرابط (/students/...) أو الجامعة..."
            searchMatcher={(r, q) =>
              r.fullName.toLowerCase().includes(q) ||
              r.email.toLowerCase().includes(q) ||
              r.slug.toLowerCase().includes(q) ||
              r.id.toLowerCase().includes(q) ||
              r.universityOrOrg.toLowerCase().includes(q)
            }
            pageSize={25}
            pageSizeOptions={[10, 25, 50, 100, 0]}
            emptyTitle="لا توجد نتائج مطابقة"
            emptyDescription="جرّب تعديل كلمات البحث أو الفلاتر المحددة بالأعلى."
          />
        )}
      </ChartCard>
    </div>
  );
}
