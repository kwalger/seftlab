'use client';

import React, { useState } from 'react';
import { Check, ShieldCheck, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdminStore } from '@/store/use-admin-store';
import { useFirestoreUsers } from '@/lib/hooks/use-firestore-users';
import { ChartCard, PageHeader } from '@/components/dashboard/ui-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminApprovalsPage() {
  const { users, loading } = useFirestoreUsers();
  const { recordAuditAction } = useAdminStore();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingUsers = users.filter((u) => u.status === 'بانتظار الموافقة');

  const handleApprove = async (user: typeof users[0]) => {
    try {
      await updateDoc(doc(db, 'users', user.id), {
        status: 'نشط',
      });
      recordAuditAction(
        'موافقة طلب',
        `اعتماد وتفعيل حساب ${user.name} (${user.role === 'teacher' ? 'معلم' : 'شركة'})`
      );
      toast.success(`تم اعتماد وتفعيل حساب ${user.name} بنجاح في Firestore`);
    } catch {
      toast.error('تعذر تحديث حالة الحساب');
    }
  };

  const handleReject = async (user: typeof users[0]) => {
    if (!rejectionReason.trim()) {
      toast.error('يرجى كتابة سبب الرفض');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', user.id), {
        status: 'معلّق',
        rejectionReason: rejectionReason.trim(),
      });
      recordAuditAction(
        'رفض طلب',
        `رفض طلب توثيق ${user.name}: ${rejectionReason.trim()}`
      );
      toast.success(`تم رفض طلب ${user.name} وحفظ السبب`);
      setRejectingId(null);
      setRejectionReason('');
    } catch {
      toast.error('تعذر رفض الحساب');
    }
  };

  return (
    <div>
      <PageHeader
        title="طلبات الموافقة والتوثيق (المعلمون والشركات)"
        description="راجع بيانات المعلمين الجدد وطلبات توثيق الشركات الموظِّفة المسجلة في Firestore قبل منحهم صلاحية النشر والتواصل."
      />

      <ChartCard
        title="طابور المراجعة والتوثيق المباشر"
        subtitle={
          loading
            ? 'جارٍ فحص الطلبات...'
            : `الطلبات بانتظار المراجعة: ${pendingUsers.length} طلبات`
        }
      >
        <div className="space-y-4">
          {pendingUsers.length > 0 ? (
            pendingUsers.map((req) => (
              <div
                key={req.id}
                className="rounded-[14px] border border-[#E3E8F0] bg-[#FAFBFC] p-5 dark:border-[#1E325C] dark:bg-[#0A1630]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 stroke-[1.5] text-[#2F6BFF]" />
                      <span className="text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                        {req.name}
                      </span>
                      <span className="rounded-[6px] bg-[#2F6BFF]/10 px-2 py-0.5 text-[11px] font-semibold text-[#2F6BFF]">
                        {req.role === 'teacher' ? 'أستاذ جامعي / معلم' : 'شركة موظِّفة'}
                      </span>
                      <span className="rounded-[6px] bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                        بانتظار المراجعة
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-[#526077] dark:text-[#94A3B8]">
                      {req.email} — {req.organizationOrUniversity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(req)}
                      className="gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2]" />
                      <span>اعتماد وتفعيل</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setRejectingId(req.id)}
                      className="gap-1.5"
                    >
                      <X className="h-3.5 w-3.5 stroke-[2]" />
                      <span>رفض الطلب</span>
                    </Button>
                  </div>
                </div>

                {rejectingId === req.id && (
                  <div className="mt-4 border-t border-[#E3E8F0] pt-3 dark:border-[#1E325C]">
                    <p className="mb-2 text-xs font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                      اكتب سبب الرفض لإبلاغ صاحب الحساب:
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="مثال: يرجى إرفاق بريدك الأكاديمي الرسمي أو السجل التجاري المعتمد..."
                        className="text-xs"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(req)}
                      >
                        تأكيد الرفض
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRejectingId(null)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-[12px] border border-dashed border-[#E3E8F0] p-8 text-center text-xs text-[#526077] dark:border-[#1E325C] dark:text-[#94A3B8]">
              {loading
                ? 'جارٍ فحص Firestore...'
                : 'طابور المراجعة فارغ تماماً. لا توجد أي حسابات بانتظار الاعتماد حالياً.'}
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
