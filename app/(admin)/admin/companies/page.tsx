'use client';

import React from 'react';
import { Building2, ShieldCheck, Ban, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdminStore } from '@/store/use-admin-store';
import { useFirestoreUsers } from '@/lib/hooks/use-firestore-users';
import { ChartCard, PageHeader } from '@/components/dashboard/ui-kit';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminCompaniesPage() {
  const { users, loading } = useFirestoreUsers();
  const { recordAuditAction } = useAdminStore();
  const companyUsers = users.filter((u) => u.role === 'company');

  const handleToggleStatus = async (comp: typeof companyUsers[0]) => {
    const nextStatus = comp.status === 'معلّق' ? 'نشط' : 'معلّق';
    try {
      await updateDoc(doc(db, 'users', comp.id), {
        status: nextStatus,
      });
      recordAuditAction(
        nextStatus === 'نشط' ? 'موافقة طلب' : 'تعليق حساب',
        `تحديث حالة شركة ${comp.name} إلى ${nextStatus}`
      );
      toast.success(`تم تحديث حالة حساب شركة ${comp.name} إلى "${nextStatus}" في Firestore`);
    } catch {
      toast.error('تعذر تحديث حالة الحساب في قاعدة البيانات');
    }
  };

  const handleVerify = async (comp: typeof companyUsers[0]) => {
    try {
      await updateDoc(doc(db, 'users', comp.id), {
        status: 'نشط',
        isVerified: true,
      });
      recordAuditAction(
        'موافقة طلب',
        `تأكيد شارة التوثيق الرسمية لشركة: ${comp.organizationOrUniversity || comp.name}`
      );
      toast.success(`تم تأكيد وتوثيق شركة ${comp.name} رسمياً`);
    } catch {
      toast.error('تعذر حفظ التوثيق في قاعدة البيانات');
    }
  };

  return (
    <div>
      <PageHeader
        title="إدارة الشركات الموظِّفة والتوثيق"
        description="متابعة حسابات الشركات الحقيقية المسجلة في Firestore، منح شارة التوثيق الرسمي، ومراقبة نشاط التواصل مع الطلاب."
      />

      <ChartCard
        title="الشركات المسجلة في بوابة التوظيف"
        subtitle={loading ? 'جارٍ تحميل بيانات الشركات...' : `إجمالي الشركات المسجلة فعلياً: ${companyUsers.length}`}
      >
        <div className="space-y-3">
          {companyUsers.length > 0 ? (
            companyUsers.map((comp) => (
              <div
                key={comp.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-[#E3E8F0] bg-[#FAFBFC] p-4 dark:border-[#1E325C] dark:bg-[#0A1630]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 stroke-[1.5] text-[#2F6BFF]" />
                    <span className="text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                      {comp.name}
                    </span>
                    <span
                      className={`rounded-[6px] px-2 py-0.5 text-[11px] font-semibold ${
                        comp.status === 'نشط'
                          ? 'bg-[#2F6BFF]/10 text-[#2F6BFF]'
                          : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      {comp.status === 'نشط' ? 'شركة موثقة ونشطة' : 'حساب معلّق'}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-[#526077] dark:text-[#94A3B8]">
                    {comp.email} — {comp.organizationOrUniversity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleVerify(comp)}
                    className="gap-1.5 text-xs"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 stroke-[1.5] text-[#2F6BFF]" />
                    <span>تأكيد التوثيق</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggleStatus(comp)}
                    className="gap-1.5 text-xs text-amber-700 dark:text-amber-300"
                  >
                    <Ban className="h-3.5 w-3.5 stroke-[1.5]" />
                    <span>
                      {comp.status === 'معلّق' ? 'إعادة تفعيل' : 'تعليق مؤقت'}
                    </span>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[12px] border border-dashed border-[#E3E8F0] p-8 text-center text-xs text-[#526077] dark:border-[#1E325C] dark:text-[#94A3B8]">
              {loading
                ? 'جارٍ فحص قاعدة بيانات Firestore...'
                : 'لا توجد شركات مسجلة حتى الآن. عند تسجيل أي شركة ستظهر هنا فورياً مع صلاحيات التوثيق والتعليق.'}
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
