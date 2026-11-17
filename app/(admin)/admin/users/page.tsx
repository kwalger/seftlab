'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Ban,
  CheckCircle2,
  Download,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useAdminStore } from '@/store/use-admin-store';
import { UserRole } from '@/types';
import {
  ChartCard,
  DataTable,
  DataTableColumn,
  PageHeader,
} from '@/components/dashboard/ui-kit';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface FirestoreUserRecord {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  universityOrOrg: string;
  status: string;
  joinedAt: string;
  photoURL?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'طالب جامعي',
  teacher: 'معلم / أستاذ مساق',
  company: 'شركة موظِّفة',
  admin: 'مسؤول النظام (أدمن)',
};

function normalizeStatus(rawStatus?: string): string {
  if (!rawStatus) return 'نشط';
  const s = rawStatus.toLowerCase();
  if (s === 'active' || s === 'نشط' || s === 'approved') return 'نشط';
  if (s === 'suspended' || s === 'معلّق' || s === 'blocked') return 'معلّق';
  if (s === 'pending' || s === 'بانتظار الموافقة') return 'بانتظار الموافقة';
  return rawStatus;
}

function formatJoinDate(createdAt?: any): string {
  if (!createdAt) return '—';
  if (typeof createdAt === 'string') {
    return createdAt.split('T')[0];
  }
  if (createdAt?.toDate && typeof createdAt.toDate === 'function') {
    try {
      return createdAt.toDate().toISOString().split('T')[0];
    } catch {
      return '—';
    }
  }
  if (typeof createdAt?.seconds === 'number') {
    return new Date(createdAt.seconds * 1000).toISOString().split('T')[0];
  }
  return '—';
}

export default function AdminUsersPage() {
  const { recordAuditAction } = useAdminStore();

  const [users, setUsers] = useState<FirestoreUserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userToDelete, setUserToDelete] = useState<FirestoreUserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 1. الربط الحي المباشر مع مجموعة users في Firestore بواسطة onSnapshot
  useEffect(() => {
    const usersCol = collection(db, 'users');

    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        const fetched: FirestoreUserRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const roleVal = (data.role as UserRole) || 'student';
          const validRole: UserRole = ['student', 'teacher', 'company', 'admin'].includes(roleVal)
            ? roleVal
            : 'student';

          const name =
            data.name ||
            data.fullName ||
            data.displayName ||
            (data.email ? data.email.split('@')[0] : 'مستخدم مسجل');

          const university =
            data.organizationOrUniversity ||
            data.university ||
            data.universityOrOrg ||
            data.institution ||
            'جامعة الزرقاء';

          return {
            id: docSnap.id,
            fullName: name,
            email: data.email || '—',
            role: validRole,
            universityOrOrg: university,
            status: normalizeStatus(data.status),
            joinedAt: formatJoinDate(data.createdAt || data.joinedAt),
            photoURL: data.photoURL || '',
          };
        });

        setUsers(fetched);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore users onSnapshot error:', error);
        toast.error('تعذر جلب بيانات المستخدمين من Firestore. يرجى التحقق من قواعد الأمان وقاعدة البيانات.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // الفلترة
  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    return true;
  });

  // 2. تعديل الدور والصلاحية (Role) في Firestore فورياً عبر updateDoc
  const handleRoleChange = async (userId: string, userName: string, nextRole: UserRole) => {
    setUpdatingId(userId);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: nextRole,
        updatedAt: new Date().toISOString(),
      });
      recordAuditAction('تغيير دور', `تغيير رتبة المستخدم ${userName} إلى ${ROLE_LABELS[nextRole]}`);
      toast.success(`تم تحديث رتبة (${userName}) إلى [${ROLE_LABELS[nextRole]}] في Firestore`);
    } catch (error) {
      console.error('Error updating role in Firestore:', error);
      toast.error('حدث خطأ أثناء تحديث الصلاحية في قاعدة بيانات Firestore');
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. تعليق أو إعادة تنشيط الحساب في Firestore فعلياً عبر updateDoc
  const handleToggleStatus = async (user: FirestoreUserRecord) => {
    setUpdatingId(user.id);
    const isSuspended = user.status === 'معلّق';
    const nextStatus = isSuspended ? 'نشط' : 'معلّق';

    try {
      const userRef = doc(db, 'users', user.id);
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
    setIsDeleting(true);
    try {
      const userRef = doc(db, 'users', userToDelete.id);
      await deleteDoc(userRef);
      recordAuditAction('حذف مستخدم', `حذف وثيقة المستخدم ${userToDelete.fullName} (${userToDelete.email})`);
      toast.success(`تم حذف حساب ${userToDelete.fullName} نهائياً من قاعدة بيانات Firestore`);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user doc from Firestore:', error);
      toast.error('حدث خطأ أثناء حذف المستخدم من Firestore');
    } finally {
      setIsDeleting(false);
    }
  };

  // 5. إرسال رابط إعادة تعيين كلمة المرور عبر Firebase Authentication
  const handleResetPassword = async (email: string, userName: string) => {
    if (!email || email === '—') {
      toast.error('لا يتوفر بريد إلكتروني صالح لهذا المستخدم');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      recordAuditAction('تحديث إعدادات', `إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`);
      toast.success(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`);
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      if (error?.code === 'auth/user-not-found') {
        toast.error('هذا البريد غير مسجل في خدمة Firebase Authentication');
      } else {
        toast.error('تعذر إرسال الرابط. تأكد من إعدادات البريد في Firebase Console.');
      }
    }
  };

  // 6. تصدير البيانات الحقيقية بصيغة CSV
  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error('لا توجد بيانات مستخدمين لتصديرها');
      return;
    }
    const headers = [
      'معرف الوثيقة (UID)',
      'الاسم الكامل',
      'البريد الإلكتروني',
      'الرتبة والدور',
      'الجامعة أو المؤسسة',
      'الحالة',
      'تاريخ الانضمام',
    ];
    const lines = filtered.map((u) =>
      [
        u.id,
        `"${u.fullName.replace(/"/g, '""')}"`,
        u.email,
        ROLE_LABELS[u.role] || u.role,
        `"${u.universityOrOrg.replace(/"/g, '""')}"`,
        u.status,
        u.joinedAt,
      ].join(',')
    );
    const csv = '\uFEFF' + [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seftlab-users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تصدير قائمة مستخدمي Firestore الحقيقيين بصيغة CSV');
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
            <div className="truncate font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
              {r.fullName}
            </div>
            <div className="truncate font-mono text-[11px] text-[#526077] dark:text-[#94A3B8]" dir="ltr">
              {r.email}
            </div>
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
            disabled={updatingId === r.id}
            onChange={(e) => handleRoleChange(r.id, r.fullName, e.target.value as UserRole)}
            className="h-7.5 rounded-[8px] border border-[#E3E8F0] bg-[#FAFBFC] px-2.5 text-xs font-medium text-[#0A1630] transition-colors hover:border-[#2F6BFF] focus:border-[#2F6BFF] focus:outline-hidden dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
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
            disabled={updatingId === r.id}
            onClick={() => handleToggleStatus(r)}
            className="inline-flex items-center gap-1 rounded-[6px] border border-[#E3E8F0] px-2 py-1 text-[11px] font-medium text-[#0A1630] hover:bg-[#F5F6F8] disabled:opacity-50 dark:border-[#1E325C] dark:text-[#FAFBFC] dark:hover:bg-[#1E325C]"
            title={r.status === 'معلّق' ? 'تنشيط الحساب' : 'تعليق الحساب مؤقتاً'}
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
            onClick={() => handleResetPassword(r.email, r.fullName)}
            className="inline-flex items-center gap-1 rounded-[6px] border border-[#E3E8F0] px-2 py-1 text-[11px] font-medium text-[#526077] hover:text-[#0A1630] dark:border-[#1E325C] dark:text-[#94A3B8] dark:hover:text-white"
            title="إرسال رابط إعادة تعيين كلمة المرور إلى البريد"
          >
            <KeyRound className="h-3 w-3 stroke-[1.75]" />
            <span>كلمة المرور</span>
          </button>

          {/* زر حذف الحساب نهائياً */}
          <button
            type="button"
            onClick={() => setUserToDelete(r)}
            className="inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            title="حذف الحساب نهائياً من Firestore"
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
        description="جدول حي ومباشر مربوط بمجموعة users في Firestore لعرض الحسابات المسجلة أولاً بأول، وتعديل الرتب والإجراءات الإدارية فورياً."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>مزامنة حية (onSnapshot)</span>
            </div>
            <Button size="sm" onClick={handleExportCsv} className="gap-1.5">
              <Download className="h-3.5 w-3.5 stroke-[1.5]" />
              <span>تصدير المستخدمين (CSV)</span>
            </Button>
          </div>
        }
      />

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
                هل أنت متأكد تماماً من حذف وثيقة المستخدم <strong>{userToDelete.fullName}</strong> ({userToDelete.email})؟
                هذا الإجراء سيحذف السجل بالكامل من مجموعة <code className="rounded bg-red-200/50 px-1 font-mono text-[11px] dark:bg-red-900/60">users</code> في Firestore ولن يمكن التراجع عنه.
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
        subtitle={`إجمالي الحسابات المسجلة: ${users.length} حساب · فلترة وبحث وتعديل رتب مباشر`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-8 rounded-[8px] border border-[#E3E8F0] bg-[#FAFBFC] px-2.5 text-xs text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
            >
              <option value="all">جميع الأدوار</option>
              <option value="student">الطلاب</option>
              <option value="teacher">المعلمون</option>
              <option value="company">الشركات</option>
              <option value="admin">مسؤولو النظام</option>
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
              جاري مزامنة حسابات المستخدمين من Firestore...
            </p>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              يتم الاتصال بمجموعة users وعرض الحسابات الحقيقية لحظياً.
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
              تم حذف البيانات الوهمية بنجاح. بمجرد تسجيل دخول أي مستخدم جديد عبر Google أو نموذج التسجيل، ستظهر وثيقته هنا تلقائياً دون الحاجة لإعادة تحميل الصفحة.
            </p>
          </div>
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            rowKey={(r) => r.id}
            searchPlaceholder="ابحث بالاسم أو البريد الإلكتروني أو الجامعة..."
            searchMatcher={(r, q) =>
              r.fullName.toLowerCase().includes(q) ||
              r.email.toLowerCase().includes(q) ||
              r.universityOrOrg.toLowerCase().includes(q)
            }
            pageSize={10}
            emptyTitle="لا توجد نتائج مطابقة"
            emptyDescription="جرّب تعديل كلمات البحث أو الفلاتر المحددة بالأعلى."
          />
        )}
      </ChartCard>
    </div>
  );
}
