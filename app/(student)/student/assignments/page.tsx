'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock,
  FileSpreadsheet,
  Folder,
  FolderOpen,
  Layers,
  Plus,
  Sparkles,
  Table2,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { useTeacherStore } from '@/store/use-teacher-store';
import {
  createDefaultUnit1SpreadsheetState,
  evaluateUnit1SpreadsheetState,
  loadSavedUnit1SpreadsheetState,
  UNIT1_CASE_STUDY,
  UNIT1_SPREADSHEET_UPDATED_EVENT,
  type Unit1SpreadsheetState,
} from '@/lib/labs/accounting/unit1-spreadsheet-data';
import {
  createDefaultUnit2SpreadsheetState,
  evaluateUnit2SpreadsheetState,
  loadSavedUnit2SpreadsheetState,
  UNIT2_CASE_STUDY,
  UNIT2_SPREADSHEET_UPDATED_EVENT,
  type Unit2SpreadsheetState,
} from '@/lib/labs/accounting/unit2-spreadsheet-data';
import { Unit1SpreadsheetProject } from '@/components/labs/accounting/unit1-spreadsheet-project';
import { Unit2SpreadsheetProject } from '@/components/labs/accounting/unit2-spreadsheet-project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DONE_STATUSES = ['مُسلَّم', 'مُصحَّح آلياً', 'تمت المراجعة'];
const TODAY = new Date('2026-11-17');

function dueLabel(daysLeft: number): string {
  if (daysLeft < 0) return `متأخر ${Math.abs(daysLeft)} يوم`;
  if (daysLeft === 0) return 'آخر يوم اليوم';
  if (daysLeft === 1) return 'باقي يوم واحد';
  return `باقي ${daysLeft} أيام`;
}

type UnitFilter = 'all' | 'unit2' | 'unit1';

export default function StudentAssignmentsPage() {
  const { currentStudent } = useAppStore();
  const { classes, assignments, submissions, joinClassByCode } =
    useTeacherStore();

  const [activeFilter, setActiveFilter] = useState<UnitFilter>('all');
  const [u1FolderOpen, setU1FolderOpen] = useState(true);
  const [u2FolderOpen, setU2FolderOpen] = useState(true);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [detailsId, setDetailsId] = useState<string | null>(null);

  // عرض الواجب التفاعلي المباشر (Inline Workspace) - يبدأ بالوحدة الثانية افتراضياً لمنع أي فراغ
  const [inlineWorkspaceUnit, setInlineWorkspaceUnit] = useState<1 | 2>(2);
  const [inlineStage, setInlineStage] = useState<number>(0);

  // حالة جداول الوحدة 1 (بدء بالحالة الافتراضية للتطابق مع خادم SSR)
  const [sheetState1, setSheetState1] = useState<Unit1SpreadsheetState>(() =>
    createDefaultUnit1SpreadsheetState()
  );

  // حالة جداول الوحدة 2 (بدء بالحالة الافتراضية للتطابق مع خادم SSR)
  const [sheetState2, setSheetState2] = useState<Unit2SpreadsheetState>(() =>
    createDefaultUnit2SpreadsheetState()
  );

  useEffect(() => {
    // تحميل الحالة المحفوظة في العميل بعد الـ Mount بدون حجب التقديم الأولي
    const frame = requestAnimationFrame(() => {
      setSheetState1(loadSavedUnit1SpreadsheetState());
      setSheetState2(loadSavedUnit2SpreadsheetState());
    });

    const sync1 = () => setSheetState1(loadSavedUnit1SpreadsheetState());
    const sync2 = () => setSheetState2(loadSavedUnit2SpreadsheetState());

    window.addEventListener(UNIT1_SPREADSHEET_UPDATED_EVENT, sync1);
    window.addEventListener(UNIT2_SPREADSHEET_UPDATED_EVENT, sync2);
    window.addEventListener('storage', sync1);
    window.addEventListener('storage', sync2);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(UNIT1_SPREADSHEET_UPDATED_EVENT, sync1);
      window.removeEventListener(UNIT2_SPREADSHEET_UPDATED_EVENT, sync2);
      window.removeEventListener('storage', sync1);
      window.removeEventListener('storage', sync2);
    };
  }, []);

  const evaluation1 = useMemo(
    () => evaluateUnit1SpreadsheetState(sheetState1),
    [sheetState1]
  );

  const evaluation2 = useMemo(
    () => evaluateUnit2SpreadsheetState(sheetState2),
    [sheetState2]
  );

  const myClasses = useMemo(
    () =>
      classes.filter((c) => c.studentUsernames.includes(currentStudent.username)),
    [classes, currentStudent.username]
  );

  const publishedAssignments = useMemo(
    () => assignments.filter((a) => a.status === 'منشور'),
    [assignments]
  );

  const project1 = useMemo(
    () => publishedAssignments.find((a) => a.id === 'asg-u1-comprehensive'),
    [publishedAssignments]
  );

  const project2 = useMemo(
    () => publishedAssignments.find((a) => a.id === 'asg-u2-comprehensive'),
    [publishedAssignments]
  );

  const extraAssignments = useMemo(
    () =>
      publishedAssignments.filter(
        (a) => a.id !== 'asg-u1-comprehensive' && a.id !== 'asg-u2-comprehensive'
      ),
    [publishedAssignments]
  );

  const sub1 = useMemo(() => {
    if (!project1) return undefined;
    return submissions.find(
      (s) =>
        s.assignmentId === project1.id &&
        s.studentUsername === currentStudent.username
    );
  }, [project1, submissions, currentStudent.username]);

  const sub2 = useMemo(() => {
    if (!project2) return undefined;
    return submissions.find(
      (s) =>
        s.assignmentId === project2.id &&
        s.studentUsername === currentStudent.username
    );
  }, [project2, submissions, currentStudent.username]);

  const stages1 = useMemo(
    () => [
      {
        num: 1 as const,
        title: 'جدول دليل الحسابات وتصنيف المستندات والقوائم',
        subtitle: '6 حسابات · رمز المجموعة (1–5) · مدين/دائن · القائمة المالية',
        bookRef: 'ص 16، 34–36',
        pct: evaluation1.stage1.scorePct,
        complete: evaluation1.stage1.isComplete,
      },
      {
        num: 2 as const,
        title: 'جدول التكلفة التاريخية للأصل ودفتر اليومية العام',
        subtitle: 'احتساب تكلفة الآلة (14,500 د.أ) + تسجيل القيود الأربعة',
        bookRef: 'ص 27–35',
        pct: evaluation1.stage2.scorePct,
        complete: evaluation1.stage2.isComplete,
      },
      {
        num: 3 as const,
        title: 'جدول قائمة الدخل ومعادلة الميزانية الختامية',
        subtitle: 'استخراج صافي الربح (5,000 د.أ) وموازنة الميزانية (35,000 د.أ)',
        bookRef: 'ص 25–27',
        pct: evaluation1.stage3.scorePct,
        complete: evaluation1.stage3.isComplete,
      },
    ],
    [evaluation1]
  );

  const stages2 = useMemo(
    () => [
      {
        num: 1 as const,
        title: 'شروط العملية المالية ومخطط شجرة القرار (شكل 2)',
        subtitle: 'فحص الشروط الثلاثة وتصنيف 4 أحداث من مثال (1) بالكتاب ص 47-48',
        bookRef: 'ص 47–48',
        pct: Math.round((evaluation2.stage1Score / 25) * 100),
        complete: evaluation2.stage1Complete,
      },
      {
        num: 2 as const,
        title: 'أثر العمليات على معادلة الميزانية — الحالات الأربعة (شكل 3)',
        subtitle: 'مخطط ميزان الأسهم لمطابقة حالات الزيادة والنقصان والتعادل',
        bookRef: 'ص 49–59',
        pct: Math.round((evaluation2.stage2Score / 25) * 100),
        complete: evaluation2.stage2Complete,
      },
      {
        num: 3 as const,
        title: 'جدول معادلة الميزانية التفاعلي لمحلات الأمين',
        subtitle: '10 عمليات متسلسلة لشهر آذار 2024 بتوازن تام (16,700 د.أ)',
        bookRef: 'ص 59–64',
        pct: Math.round((evaluation2.stage3Score / 30) * 100),
        complete: evaluation2.stage3Complete,
      },
      {
        num: 4 as const,
        title: 'إعداد القوائم المالية الأربعة المترابطة (شكل 4 و 5 و 6 و 7 و 9)',
        subtitle: 'قوائم الدخل وحقوق الملكية والمركز المالي ومخطط الترابط التسلسلي',
        bookRef: 'ص 64–70',
        pct: Math.round((evaluation2.stage4Score / 20) * 100),
        complete: evaluation2.stage4Complete,
      },
    ],
    [evaluation2]
  );

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const res = joinClassByCode(joinCode, currentStudent.username);
    if (res.ok) {
      toast.success(res.message);
      setJoinCode('');
      setJoinOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  const detailAssignment = publishedAssignments.find((a) => a.id === detailsId);
  const detailSubmission = detailAssignment
    ? submissions.find(
        (s) =>
          s.assignmentId === detailAssignment.id &&
          s.studentUsername === currentStudent.username
      )
    : undefined;
  const detailScore =
    detailSubmission?.manualScoreOverride ??
    detailSubmission?.autoGrade?.autoScore;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 space-y-6 pb-24">
      {/* الترويسة الرئيسية */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-[#0A1630] sm:text-3xl dark:text-white">
                التدريب العملي والمشاريع التطبيقية
              </h1>
              <span className="rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-xs font-bold text-[#2F6BFF]">
                جامعة الزرقاء · محاسبة 1 (201ق)
              </span>
            </div>
            <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
              مشاريع محاسبية عملية متكاملة مطابقة لرسومات وجداول الكتاب المقرر · إشراف د. محمد المعاقبه.
            </p>
          </div>

          {/* تبويبات التصفية */}
          <div className="flex rounded-full border border-[#E2E8F0] bg-white p-1 dark:border-[#1E325C] dark:bg-[#0A1630]">
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all');
                setInlineWorkspaceUnit(2);
              }}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors',
                activeFilter === 'all'
                  ? 'bg-[#2F6BFF] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0A1630] dark:text-[#94A3B8] dark:hover:text-white'
              )}
            >
              جميع الوحدات
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('unit2');
                setInlineWorkspaceUnit(2);
              }}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors',
                activeFilter === 'unit2' || inlineWorkspaceUnit === 2
                  ? 'bg-[#2F6BFF] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0A1630] dark:text-[#94A3B8] dark:hover:text-white'
              )}
            >
              الوحدة 2 (محلات الأمين)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('unit1');
                setInlineWorkspaceUnit(1);
              }}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors',
                activeFilter === 'unit1' || inlineWorkspaceUnit === 1
                  ? 'bg-[#2F6BFF] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0A1630] dark:text-[#94A3B8] dark:hover:text-white'
              )}
            >
              الوحدة 1 (شركة النور)
            </button>
          </div>
        </div>
      </header>

      {/* التخطيط المزدوج لمنع الفراغ في الشاشات العريضة وللتوافق مع الموبايل */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* العمود الجانبي */}
        <div className="lg:col-span-4 space-y-4">
          {/* بطاقة معلومات المساق الجامعي */}
          <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#2F6BFF] text-white font-bold text-sm">
                ZU
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#2F6BFF]">جامعة الزرقاء · كلية الأعمال</p>
                <h3 className="text-sm font-bold text-[#0A1630] dark:text-white">
                  مبادئ المحاسبة المالية (1)
                </h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  أستاذ المساق: د. محمد المعاقبه · شعبة 201 (قاعة 201ق)
                </p>
              </div>
            </div>
          </div>



      {/* =========================================================
          ملف المشروع: الوحدة 2 تطبيق عملي (محلات الأمين ص 47–70)
         ========================================================= */}
      {(activeFilter === 'all' || activeFilter === 'unit2') && (
        <section className="overflow-hidden rounded-[24px] border border-[#2F6BFF]/30 bg-white shadow-sm dark:border-[#1E325C] dark:bg-[#0A1630]">
          <button
            type="button"
            onClick={() => setU2FolderOpen((v) => !v)}
            aria-expanded={u2FolderOpen}
            className="flex w-full items-center justify-between gap-3 bg-gradient-to-r from-[#2F6BFF]/10 via-[#2F6BFF]/5 to-transparent px-5 py-4 text-right transition-colors hover:bg-[#2F6BFF]/15 sm:px-6"
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#2F6BFF] text-white shadow-md">
                {u2FolderOpen ? (
                  <FolderOpen className="h-6 w-6 stroke-[1.75]" />
                ) : (
                  <Folder className="h-6 w-6 stroke-[1.75]" />
                )}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-[#0A1630] sm:text-lg dark:text-white">
                    {UNIT2_CASE_STUDY.folderTitle}
                  </h2>
                  <span className="rounded-full bg-[#10B981] px-2.5 py-0.5 text-[10px] font-bold text-white">
                    مطابق للكتاب 100%
                  </span>
                  <span className="font-tabular rounded-full bg-[#2F6BFF]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#2F6BFF]" suppressHydrationWarning>
                    {evaluation2.completedStagesCount} / 4 مراحل مكتملة ({evaluation2.totalScore}/100)
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {UNIT2_CASE_STUDY.companyName} · {UNIT2_CASE_STUDY.textbookRef}
                </p>
              </div>
            </div>

            <ChevronDown
              className={cn(
                'h-5 w-5 shrink-0 text-[#64748B] transition-transform duration-200 dark:text-[#94A3B8]',
                u2FolderOpen && 'rotate-180'
              )}
            />
          </button>

          {u2FolderOpen && (
            <div className="space-y-4 border-t border-[#E2E8F0] p-5 sm:p-6 dark:border-[#1E325C]">
              {/* ملخص كارت المشروع */}
              <div className="flex flex-col justify-between gap-4 rounded-[20px] bg-gradient-to-br from-[#0A1630] to-[#0E1E42] p-5 text-white sm:flex-row sm:items-center">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#93C5FD]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>مشروع الوحدة 2 التطبيقي المعتمد · د. محمد المعاقبه</span>
                  </div>
                  <h3 className="text-base font-bold leading-snug sm:text-lg">
                    {UNIT2_CASE_STUDY.projectTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-white/75">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{dueLabel(18)}</span>
                    </span>
                    <span className="font-tabular" suppressHydrationWarning>
                      العلامة: {evaluation2.totalScore} / 100
                    </span>
                    <span className="font-tabular">
                      المحاولات: {sub2?.attemptsUsed || 0} / 3
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setInlineWorkspaceUnit(2);
                      setInlineStage(1);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="min-h-[46px] w-full gap-2 bg-[#2F6BFF] px-5 text-xs font-bold text-white hover:bg-[#1D4ED8] sm:w-auto"
                  >
                    <Table2 className="h-4 w-4" />
                    <span>افتح الجداول والرسومات (4 مراحل)</span>
                  </Button>

                  <Link
                    href="/student/labs/accounting?assignmentId=asg-u2-comprehensive"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="outline"
                      className="min-h-[46px] w-full border-white/25 bg-white/10 text-xs font-bold text-white hover:bg-white/20 sm:w-auto"
                    >
                      فتح في المختبر
                    </Button>
                  </Link>
                </div>
              </div>

              {/* المراحل الأربعة داخل ملف الوحدة 2 */}
              <ul className="divide-y divide-[#EEF2F6] overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white dark:divide-[#1E325C] dark:border-[#1E325C] dark:bg-[#0A1630]">
                {stages2.map((st) => (
                  <li key={st.num}>
                    <button
                      type="button"
                      onClick={() => {
                        setInlineWorkspaceUnit(2);
                        setInlineStage(st.num);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="flex w-full items-center gap-3.5 px-4 py-3.5 text-right transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#0F1E3E]"
                    >
                      <span
                        className={cn(
                          'font-tabular flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                          st.complete
                            ? 'bg-[#10B981] text-white'
                            : 'bg-[#2F6BFF]/10 text-[#2F6BFF]'
                        )}
                      >
                        {st.complete ? <Check className="h-5 w-5 stroke-[2.5]" /> : st.num}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold text-[#2F6BFF]">
                            المرحلة {st.num} · {st.bookRef}
                          </span>
                          <span className="font-tabular rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-bold text-[#475569] dark:bg-[#1E325C] dark:text-[#CBD5E1]">
                            {st.pct}%
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm font-bold text-[#0A1630] dark:text-white">
                          {st.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                          {st.subtitle}
                        </p>
                      </div>

                      <ChevronLeft className="h-5 w-5 shrink-0 text-[#94A3B8]" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* =========================================================
          ملف المشروع: الوحدة 1 تطبيق عملي (شركة النور ص 14–36)
         ========================================================= */}
      {(activeFilter === 'all' || activeFilter === 'unit1') && (
        <section className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
          <button
            type="button"
            onClick={() => setU1FolderOpen((v) => !v)}
            aria-expanded={u1FolderOpen}
            className="flex w-full items-center justify-between gap-3 bg-[#F8FAFC] px-5 py-4 text-right transition-colors hover:bg-[#F1F5F9] sm:px-6 dark:bg-[#0F1E3E] dark:hover:bg-[#132449]"
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#0A1630] text-white dark:bg-[#2F6BFF]">
                {u1FolderOpen ? (
                  <FolderOpen className="h-6 w-6 stroke-[1.75]" />
                ) : (
                  <Folder className="h-6 w-6 stroke-[1.75]" />
                )}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-[#0A1630] sm:text-lg dark:text-white">
                    {UNIT1_CASE_STUDY.folderTitle}
                  </h2>
                  <span className="font-tabular rounded-full bg-[#2F6BFF]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#2F6BFF]" suppressHydrationWarning>
                    {evaluation1.completedStagesCount} / 3 مراحل مكتملة ({evaluation1.overallScore}/100)
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {UNIT1_CASE_STUDY.companyName} · {UNIT1_CASE_STUDY.textbookRef}
                </p>
              </div>
            </div>

            <ChevronDown
              className={cn(
                'h-5 w-5 shrink-0 text-[#64748B] transition-transform duration-200 dark:text-[#94A3B8]',
                u1FolderOpen && 'rotate-180'
              )}
            />
          </button>

          {u1FolderOpen && (
            <div className="space-y-4 border-t border-[#E2E8F0] p-5 sm:p-6 dark:border-[#1E325C]">
              {/* ملخص المشروع الموحد */}
              <div className="flex flex-col justify-between gap-4 rounded-[20px] bg-[#0A1630] p-5 text-white sm:flex-row sm:items-center dark:bg-[#070D1F]">
                <div className="min-w-0 space-y-1.5">
                  <p className="text-[11px] font-semibold text-[#93C5FD]">
                    مشروع الجداول العملية الموحد · د. محمد المعاقبه
                  </p>
                  <h3 className="text-base font-bold leading-snug sm:text-lg">
                    {UNIT1_CASE_STUDY.projectTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-white/75">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{dueLabel(18)}</span>
                    </span>
                    <span className="font-tabular" suppressHydrationWarning>
                      العلامة: {evaluation1.overallScore} / 100
                    </span>
                    <span className="font-tabular">
                      المحاولات: {sub1?.attemptsUsed || 0} / 3
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setInlineWorkspaceUnit(1);
                      setInlineStage(1);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="min-h-[46px] w-full gap-2 bg-[#2F6BFF] px-5 text-xs font-bold text-white hover:bg-[#1D4ED8] sm:w-auto"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>افتح جداول المشروع (3 مراحل)</span>
                  </Button>

                  <Link
                    href="/student/labs/accounting?assignmentId=asg-u1-comprehensive"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="outline"
                      className="min-h-[46px] w-full border-white/25 bg-white/10 text-xs font-bold text-white hover:bg-white/20 sm:w-auto"
                    >
                      فتح في المختبر
                    </Button>
                  </Link>
                </div>
              </div>

              {/* المراحل الثلاث داخل الملف */}
              <ul className="divide-y divide-[#EEF2F6] overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white dark:divide-[#1E325C] dark:border-[#1E325C] dark:bg-[#0A1630]">
                {stages1.map((st) => (
                  <li key={st.num}>
                    <button
                      type="button"
                      onClick={() => {
                        setInlineWorkspaceUnit(1);
                        setInlineStage(st.num);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="flex w-full items-center gap-3.5 px-4 py-3.5 text-right transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#0F1E3E]"
                    >
                      <span
                        className={cn(
                          'font-tabular flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                          st.complete
                            ? 'bg-[#10B981] text-white'
                            : 'bg-[#2F6BFF]/10 text-[#2F6BFF]'
                        )}
                      >
                        {st.complete ? <Check className="h-5 w-5 stroke-[2.5]" /> : st.num}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold text-[#2F6BFF]">
                            المرحلة {st.num} · {st.bookRef}
                          </span>
                          <span className="font-tabular rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-bold text-[#475569] dark:bg-[#1E325C] dark:text-[#CBD5E1]">
                            {st.pct}%
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm font-bold text-[#0A1630] dark:text-white">
                          {st.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                          {st.subtitle}
                        </p>
                      </div>

                      <ChevronLeft className="h-5 w-5 shrink-0 text-[#94A3B8]" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* واجبات إضافية إن وجدت */}
      {extraAssignments.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-sm font-bold text-[#0A1630] dark:text-white">
            واجبات إضافية من المعلم ({extraAssignments.length})
          </h2>
          <ul className="divide-y divide-[#EEF2F6] overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white dark:divide-[#1E325C] dark:border-[#1E325C] dark:bg-[#0A1630]">
            {extraAssignments.map((asg) => {
              const sub = submissions.find(
                (s) =>
                  s.assignmentId === asg.id &&
                  s.studentUsername === currentStudent.username
              );
              const score = sub?.manualScoreOverride ?? sub?.autoGrade?.autoScore;
              return (
                <li key={asg.id}>
                  <Link
                    href={`/student/labs/${asg.labId}?assignmentId=${asg.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-[#F8FAFC] dark:hover:bg-[#0F1E3E]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#0A1630] dark:text-white">
                        {asg.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                        {typeof score === 'number'
                          ? `العلامة ${score}/${asg.maxScore}`
                          : `التسليم: ${asg.dueDate}`}
                      </p>
                    </div>
                    <ChevronLeft className="h-5 w-5 shrink-0 text-[#94A3B8]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* الانضمام لشعبة بكود المعلم */}
      <section className="rounded-[20px] border border-[#E3E8F0] bg-white p-4 dark:border-[#1E325C] dark:bg-[#0A1630]">
        {joinOpen ? (
          <form onSubmit={handleJoin} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#0A1630] dark:text-white">
                رمز الشعبة من المعلم
              </p>
              <button
                type="button"
                onClick={() => setJoinOpen(false)}
                aria-label="إغلاق"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                dir="ltr"
                placeholder="ZU-ACC-201"
                autoFocus
                className="h-12 flex-1 text-center font-tabular text-base"
              />
              <Button type="submit" className="h-12 px-5">
                انضمام
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setJoinOpen(true)}
            className="flex w-full items-center justify-between gap-3 text-right"
          >
            <span>
              <span className="block text-sm font-bold text-[#0A1630] dark:text-white">
                عندك رمز شعبة؟
              </span>
              <span className="block text-xs text-[#64748B] dark:text-[#94A3B8]">
                {myClasses.length > 0
                  ? `أنت منضم لشعبة: ${myClasses.map((c) => c.courseCode).join('، ')}`
                  : 'أدخل الرمز لتصلك واجبات معلمك'}
              </span>
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF]">
              <Plus className="h-5 w-5" />
            </span>
          </button>
        )}
      </section>
        </div>

        {/* العمود الرئيسي الأيمن: مساحة العمل التفاعلية المباشرة (حل مشكلة الفراغ نهائياً) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="overflow-hidden rounded-[24px] border border-[#2F6BFF]/30 bg-white p-4 sm:p-5 shadow-lg dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3 dark:border-[#1E325C]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#2F6BFF] text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#0A1630] dark:text-white">
                    {inlineWorkspaceUnit === 2
                      ? UNIT2_CASE_STUDY.projectTitle
                      : UNIT1_CASE_STUDY.projectTitle}
                  </h2>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {inlineWorkspaceUnit === 2
                      ? 'مساحة العمل التطبيقية للوحدة الثانية · محلات الأمين ورسومات الكتاب ص 47–70'
                      : 'مساحة العمل التطبيقية للوحدة الأولى · شركة النور والدورة المحاسبية ص 14–36'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={
                    inlineWorkspaceUnit === 2
                      ? '/student/labs/accounting?assignmentId=asg-u2-comprehensive'
                      : '/student/labs/accounting?assignmentId=asg-u1-comprehensive'
                  }
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-bold text-[#2F6BFF] border-[#2F6BFF]/30 hover:bg-[#2F6BFF]/10"
                  >
                    <span>فتح ملء الشاشة بالمختبر</span>
                  </Button>
                </Link>
              </div>
            </div>

            {inlineWorkspaceUnit === 2 ? (
              <Unit2SpreadsheetProject
                initialStage={(inlineStage <= 8 ? inlineStage : 0)}
                onStateChange={setSheetState2}
              />
            ) : (
              <Unit1SpreadsheetProject
                initialStage={(inlineStage <= 3 ? inlineStage : 1) as 1 | 2 | 3}
                onStateChange={setSheetState1}
              />
            )}
          </div>
        </div>
      </div>

      {/* تفاصيل العلامة */}
      {detailAssignment && detailSubmission?.autoGrade && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setDetailsId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[24px] bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] sm:rounded-[24px] dark:bg-[#0A1630]"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#E2E8F0] sm:hidden dark:bg-[#1E325C]" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">علامتك</p>
                <p className="font-tabular text-3xl font-bold text-[#0A1630] dark:text-white">
                  {detailScore}
                  <span className="text-base text-[#94A3B8]">
                    {' '}
                    / {detailAssignment.maxScore}
                  </span>
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0A1630] dark:text-white">
                  {detailAssignment.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsId(null)}
                aria-label="إغلاق"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] dark:bg-[#0F1E3E]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
              {detailSubmission.autoGrade.summaryFeedback}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
