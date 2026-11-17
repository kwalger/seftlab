'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DoorOpen,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  Building2,
  FileSpreadsheet,
  Megaphone,
  Download,
  Copy,
  Check,
  CheckCircle2,
  ArrowUpLeft,
  KeyRound,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  MapPin,
  Layers,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/ui-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTeacherStore } from '@/store/use-teacher-store';
import { useAppStore } from '@/store/use-app-store';
import { toast } from 'sonner';

// ملخصات أكاديمية خاصة بالشعبة من إعداد الدكتور
const CLASS_MATERIALS = [
  {
    id: 'mat-1',
    title: 'ملخص معادلة الميزانية العمومية الموسعة وقواعد توازنها',
    unit: 'الوحدة 2',
    date: '2026-11-14',
    type: 'ملخص معتمد',
    size: '185 KB',
    description: 'شرح أثر العمليات المالية، وقاعدة الأثر المزدوج وتوازن طرفي الميزانية العمومية.',
    fileContent: `جامعة الزرقاء — كلية الأعمال - قسم المحاسبة
مساق: محاسبة 1 (ACC-101) — د. محمد المعاقبه
القاعة: 201ق

ملخص: معادلة الميزانية العمومية الموسعة:
الأصول (Assets) = الالتزامات (Liabilities) + حقوق الملكية (Owner's Equity)
المعادلة الموسعة: الأصول = الالتزامات + رأس المال + الإيرادات - المصروفات - المسحوبات الشخصية.
القاعدة الذهبية: كل عملية مالية يجب أن تحافظ على توازن كفتي الميزانية.`,
  },
  {
    id: 'mat-2',
    title: 'ملخص الدورة المستندية وقواعد القيد المزدوج ودليل الحسابات',
    unit: 'الوحدة 1',
    date: '2026-11-10',
    type: 'ملخص تأسيسي',
    size: '220 KB',
    description: 'دليل الحسابات ص 36، ومبدأ التكلفة التاريخية للآلات ص 29 مع المستندات المؤيدة.',
    fileContent: `جامعة الزرقاء — مساق: محاسبة 1 (ACC-101) — د. محمد المعاقبه
ملخص الدورة المستندية ودليل الحسابات:
1. الأصول: طبيعتها مدينة، تزيد في المدين وتنقص في الدائن.
2. الالتزامات: طبيعتها دائنة، تزيد في الدائن وتنقص في المدين.
3. حقوق الملكية: دائنة، رأس المال والإيرادات دائنة، والمصروفات والمسحوبات مدينة.
مبدأ التكلفة التاريخية: تُقاس الأصول بسعر الشراء الفعلي مضافاً إليه كل النفقات اللازمة حتى تصبح جاهزة للاستخدام.`,
  },
  {
    id: 'mat-3',
    title: 'قائمة المصطلحات المحاسبية الانجليزية المعتمدة (GAAP Terminology)',
    unit: 'عام للمساق',
    date: '2026-11-05',
    type: 'مسرد مصطلحات',
    size: '140 KB',
    description: 'المصطلحات المحاسبية الأساسية: Assets, Liabilities, Equity, Journal Entry, Ledger.',
    fileContent: `جامعة الزرقاء — محاسبة 1 — د. محمد المعاقبه
المصطلحات المعتمدة:
- Assets: أصول
- Liabilities: التزامات
- Owner's Equity: حقوق الملكية
- Balance Sheet: قائمة المركز المالي (الميزانية العمومية)
- Income Statement: قائمة الدخل
- Historical Cost: التكلفة التاريخية
- Matching Principle: مبدأ المقابلة`,
  },
];

export default function ClassroomPage() {
  const { classes, assignments, announcements, joinClassByCode, removeStudentFromClass } =
    useTeacherStore();
  const { currentStudent } = useAppStore();

  const [inputCode, setInputCode] = useState('');
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments' | 'announcements'>('materials');
  const [copiedMaterialId, setCopiedMaterialId] = useState<string | null>(null);

  // الشعب التي ينتمي إليها الطالب
  const myClasses = classes.filter((cls) =>
    cls.studentUsernames?.includes(currentStudent.username)
  );

  // الشعبة الفعالة المختارة (أول شعبة ينتمي إليها الطالب)
  const currentClass = myClasses[0] || null;

  // الواجبات الموجهة لهذه الشعبة
  const classAssignments = currentClass
    ? assignments.filter((a) => a.targetClassId === currentClass.id || a.targetClassId === 'cls-zu-acc-101')
    : [];

  // الإعلانات الموجهة لهذه الشعبة
  const classAnnouncements = currentClass
    ? announcements.filter(
        (a) => a.targetAudience === currentClass.id || a.targetAudience === 'cls-zu-acc-101' || a.targetAudience === 'all'
      )
    : [];

  // الانضمام عبر الكود
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      toast.error('يرجى إدخال كود الانضمام للشعبة.');
      return;
    }
    const result = joinClassByCode(inputCode.trim(), currentStudent.username);
    if (result.ok) {
      toast.success(result.message);
      setInputCode('');
    } else {
      toast.error(result.message);
    }
  };

  // نسخ محتوى ملخص
  const handleCopyMaterial = (mat: typeof CLASS_MATERIALS[0]) => {
    navigator.clipboard.writeText(mat.fileContent).catch(() => {});
    setCopiedMaterialId(mat.id);
    toast.success(`تم نسخ ملخص "${mat.title}"`);
    setTimeout(() => setCopiedMaterialId(null), 2000);
  };

  // تنزيل ملف نصي
  const handleDownloadMaterial = (mat: typeof CLASS_MATERIALS[0]) => {
    const blob = new Blob([mat.fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mat.title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`تم تنزيل ${mat.title}`);
  };

  // مغادرة الشعبة للتجربة
  const handleLeaveClass = (classId: string) => {
    if (window.confirm('هل تريد مغادرة هذه الشعبة؟ يمكنك الانضمام إليها مجدداً بكود الشعبة في أي وقت.')) {
      removeStudentFromClass(classId, currentStudent.username);
      toast.info('تمت مغادرة الشعبة. يمكنك الانضمام مجدداً بكود الشعبة.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* الترويسة */}
      <PageHeader
        title="القاعة"
        description="شعبتك الدراسية لدى الدكتور، والملخصات، والواجبات، والإعلانات المنشورة للشعبة."
      />

      {/* نموذج الانضمام للشعبة بكود الدكتور */}
      <div className="overflow-hidden rounded-[24px] border border-[#2F6BFF]/25 bg-gradient-to-br from-white to-[#F0F5FF] p-6 shadow-xs sm:p-7 dark:border-[#2F6BFF]/30 dark:from-[#0A1630] dark:to-[#0A1630]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-xs font-bold text-[#2F6BFF]">
              <KeyRound className="h-3.5 w-3.5" />
              <span>الانضمام إلى قاعة عبر كود الدكتور</span>
            </span>
            <h2 className="text-lg font-bold text-[#0A1630] sm:text-xl dark:text-white">
              أدخل كود الشعبة للدخول واستعراض الملخصات والواجبات
            </h2>
            <p className="text-xs leading-relaxed text-[#475569] dark:text-[#94A3B8]">
              يعطيك الدكتور كود الشعبة في القاعة الدراسية. عند إدخاله ستنضم فوراً وتفتح لك قاعتك الخاصة مع كافة المواد التي نشرها الدكتور.
            </p>
          </div>

          <form onSubmit={handleJoin} className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center md:w-auto">
            <div className="relative min-w-[240px]">
              <Input
                type="text"
                dir="ltr"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="ZU-ACC-201"
                className="font-tabular h-12 rounded-xl bg-white text-center text-sm font-bold tracking-widest text-[#0A1630] uppercase shadow-xs dark:bg-[#070D1F] dark:text-white"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 shrink-0 gap-2 px-6 font-bold shadow-xs">
              <span>انضم الآن</span>
              <ArrowUpLeft className="h-4 w-4 stroke-[2]" />
            </Button>
          </form>
        </div>
      </div>

      {/* في حال لم ينضم الطالب لأي شعبة بعد */}
      {!currentClass ? (
        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-12 text-center shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF]">
            <DoorOpen className="h-8 w-8 stroke-[1.75]" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-[#0A1630] dark:text-white">
            أنت لست مسجلاً في أي قاعة بعد
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
            أدخل كود الشعبة المقدم من الدكتور أعلاه <strong className="text-[#2F6BFF]">(مثال: ZU-ACC-201)</strong> لتنضم فوراً وتظهر لك ملخصات وواجبات وإعلانات المساق.
          </p>
        </div>
      ) : (
        /* الشعبة المسجل بها ومحتوياتها الكاملة */
        <div className="space-y-6">
          {/* بطاقة معلومات الشعبة والقاعة */}
          <div className="rounded-[28px] border-2 border-[#2F6BFF]/30 bg-white p-6 shadow-xs sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              {/* تفاصيل المادة والقاعة */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/15 px-3 py-1 text-xs font-bold text-[#047857] dark:text-[#34D399]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>أنت مسجل في هذه القاعة</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#2F6BFF]/10 px-3 py-1 font-tabular text-xs font-bold text-[#2F6BFF]">
                    <DoorOpen className="h-3.5 w-3.5" />
                    <span>رقم القاعة: {currentClass.roomNumber || '201ق'}</span>
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-[#0A1630] sm:text-3xl dark:text-white">
                    {currentClass.courseName}
                    <span className="mr-3 font-mono text-base font-medium text-[#2F6BFF]">
                      ({currentClass.courseCode})
                    </span>
                  </h1>
                  <p className="mt-1 flex items-center gap-2 text-sm text-[#475569] dark:text-[#CBD5E1]">
                    <GraduationCap className="h-4 w-4 text-[#2F6BFF]" />
                    <span>مدرس المساق: <strong className="text-[#0A1630] dark:text-white">{currentClass.teacherName}</strong></span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-[#2F6BFF]" />
                    <span>{currentClass.university}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#2F6BFF]" />
                    <span>قاعة المحاضرات: {currentClass.roomNumber || '201ق'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#2F6BFF]" />
                    <span>{currentClass.semester}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-[#2F6BFF]" />
                    <span>{currentClass.studentUsernames?.length ?? 5} طلاب مسجلين</span>
                  </span>
                </div>
              </div>

              {/* بطاقة كود الشعبة والتحكم */}
              <div className="flex flex-col items-start gap-2 rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs lg:items-end dark:border-[#1E325C] dark:bg-[#070D1F]">
                <div className="space-y-0.5 text-right">
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">كود الشعبة المعتمد:</span>
                  <p dir="ltr" className="font-tabular text-lg font-bold tracking-widest text-[#2F6BFF]">
                    {currentClass.joinCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleLeaveClass(currentClass.id)}
                  className="mt-2 text-[11px] font-semibold text-red-500 hover:underline"
                >
                  مغادرة الشعبة للتجربة
                </button>
              </div>
            </div>
          </div>

          {/* تبويبات محتوى الشعبة المنشور من الدكتور */}
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 text-sm font-bold dark:border-[#1E325C]">
            <button
              type="button"
              onClick={() => setActiveTab('materials')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all ${
                activeTab === 'materials'
                  ? 'bg-[#2F6BFF] text-white shadow-xs'
                  : 'bg-white text-[#475569] hover:bg-[#F1F5F9] dark:bg-[#0A1630] dark:text-[#CBD5E1]'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>الملخصات والمواد التعليمية ({CLASS_MATERIALS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all ${
                activeTab === 'assignments'
                  ? 'bg-[#2F6BFF] text-white shadow-xs'
                  : 'bg-white text-[#475569] hover:bg-[#F1F5F9] dark:bg-[#0A1630] dark:text-[#CBD5E1]'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>الواجبات والتكليفات ({classAssignments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all ${
                activeTab === 'announcements'
                  ? 'bg-[#2F6BFF] text-white shadow-xs'
                  : 'bg-white text-[#475569] hover:bg-[#F1F5F9] dark:bg-[#0A1630] dark:text-[#CBD5E1]'
              }`}
            >
              <Megaphone className="h-4 w-4" />
              <span>إعلانات الدكتور ({classAnnouncements.length})</span>
            </button>
          </div>

          {/* 1. قسم الملخصات */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
                    الملخصات المنشورة لشعبة محاسبة 1
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    نشرها الدكتور {currentClass.teacherName} لطلاب القاعة {currentClass.roomNumber || '201ق'}.
                  </p>
                </div>
                <Link href="/student/summaries">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
                    <Layers className="h-3.5 w-3.5" />
                    <span>استعراض كافة القوانين</span>
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {CLASS_MATERIALS.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex flex-col justify-between gap-4 rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:border-[#2F6BFF]/40 sm:flex-row sm:items-center dark:border-[#1E325C] dark:bg-[#0A1630]"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#2F6BFF]/10 text-[#2F6BFF]">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#2F6BFF]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#2F6BFF]">
                            {mat.unit}
                          </span>
                          <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-semibold text-[#475569] dark:bg-[#070D1F] dark:text-[#94A3B8]">
                            {mat.type}
                          </span>
                          <span className="font-tabular text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            {mat.date}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#0A1630] dark:text-white">
                          {mat.title}
                        </h4>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                          {mat.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyMaterial(mat)}
                        className="gap-1.5 text-xs font-bold"
                      >
                        {copiedMaterialId === mat.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#10B981]" />
                            <span>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>نسخ الملخص</span>
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleDownloadMaterial(mat)}
                        className="gap-1.5 text-xs font-bold shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>تحميل</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. قسم الواجبات والتكليفات */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
                    التكليفات والواجبات العملية للشعبة
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    مشاريع عملية من كتاب المحاسبة 1 مصححة آلياً بنسبة 100%.
                  </p>
                </div>
                <Link href="/student/assignments">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
                    <span>جميع الواجبات</span>
                    <ArrowUpLeft className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {classAssignments.length === 0 ? (
                <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-8 text-center text-xs text-[#64748B] dark:border-[#1E325C] dark:bg-[#0A1630]">
                  لا توجد تكليفات نشطة حالياً لهذه الشعبة.
                </div>
              ) : (
                <div className="space-y-3">
                  {classAssignments.map((asg) => (
                    <div
                      key={asg.id}
                      className="flex flex-col justify-between gap-4 rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-xs sm:flex-row sm:items-center dark:border-[#1E325C] dark:bg-[#0A1630]"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#10B981]/10 text-[#10B981]">
                          <FileSpreadsheet className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#047857] dark:text-[#34D399]">
                              {asg.status}
                            </span>
                            <span className="font-tabular text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                              موعد التسليم: {asg.dueDate}
                            </span>
                            <span className="font-tabular text-[11px] text-[#2F6BFF]">
                              العلامة: {asg.maxScore} نقطة
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-[#0A1630] dark:text-white">
                            {asg.title}
                          </h4>
                          <p className="line-clamp-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
                            {asg.instructions}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Link href={`/student/labs/accounting?assignmentId=${asg.id}`}>
                          <Button size="sm" className="gap-1.5 text-xs font-bold">
                            <span>بدء حل الواجب في المختبر</span>
                            <ArrowUpLeft className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. قسم إعلانات الدكتور */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
                    توجيهات وإعلانات الدكتور {currentClass.teacherName}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    الإعلانات الخاصة بطلاب مساق محاسبة 1 - قاعة {currentClass.roomNumber || '201ق'}.
                  </p>
                </div>
              </div>

              {classAnnouncements.length === 0 ? (
                <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-8 text-center text-xs text-[#64748B] dark:border-[#1E325C] dark:bg-[#0A1630]">
                  لا توجد إعلانات منشورة بعد.
                </div>
              ) : (
                <div className="space-y-3">
                  {classAnnouncements.map((ann) => (
                    <div
                      key={ann.id}
                      className="space-y-2 rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF]">
                            <Megaphone className="h-4 w-4" />
                          </span>
                          <h4 className="text-base font-bold text-[#0A1630] dark:text-white">
                            {ann.title}
                          </h4>
                        </div>
                        <span className="font-tabular text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {ann.scheduledAt}
                        </span>
                      </div>
                      <p className="pr-10 text-xs leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
                        {ann.body}
                      </p>
                      <div className="flex items-center gap-2 pr-10 pt-2 text-[11px] font-semibold text-[#2F6BFF]">
                        <span>المرسل: {ann.authorName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
