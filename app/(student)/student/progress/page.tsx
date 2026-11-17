'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  ArrowUpLeft,
  Calendar,
  Check,
  FlaskConical,
  Award,
  FileCheck2,
  Lock,
  Download,
  Eye,
  Share2,
  TrendingUp,
  X,
  Copy,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { StudentCertificateItem } from '@/data/dashboard-mock-data';
import { LABS_METADATA, ACHIEVEMENT_BADGES } from '@/data/mock-data';
import { calculateSkillLevelFromXp } from '@/lib/labs/skill-calculator';
import {
  evaluateUnit1SpreadsheetState,
  loadSavedUnit1SpreadsheetState,
  UNIT1_SPREADSHEET_UPDATED_EVENT,
} from '@/lib/labs/accounting/unit1-spreadsheet-data';
import {
  evaluateUnit2SpreadsheetState,
  loadSavedUnit2SpreadsheetState,
  UNIT2_SPREADSHEET_UPDATED_EVENT,
} from '@/lib/labs/accounting/unit2-spreadsheet-data';
import { ChartCard, PageHeader } from '@/components/dashboard/ui-kit';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function StudentProgressPage() {
  const { currentStudent, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<'progress' | 'achievements'>('progress');
  const [selectedMetric, setSelectedMetric] = useState<
    'total' | 'accounting' | 'marketing' | 'management' | 'python'
  >('total');
  const [previewCert, setPreviewCert] = useState<StudentCertificateItem | null>(null);

  const [eval1, setEval1] = useState(() =>
    evaluateUnit1SpreadsheetState(loadSavedUnit1SpreadsheetState())
  );
  const [eval2, setEval2] = useState(() =>
    evaluateUnit2SpreadsheetState(loadSavedUnit2SpreadsheetState())
  );

  useEffect(() => {
    const handleUpdate = () => {
      setEval1(evaluateUnit1SpreadsheetState(loadSavedUnit1SpreadsheetState()));
      setEval2(evaluateUnit2SpreadsheetState(loadSavedUnit2SpreadsheetState()));
    };

    window.addEventListener(UNIT1_SPREADSHEET_UPDATED_EVENT, handleUpdate);
    window.addEventListener(UNIT2_SPREADSHEET_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(UNIT1_SPREADSHEET_UPDATED_EVENT, handleUpdate);
      window.removeEventListener(UNIT2_SPREADSHEET_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const studentName = user?.name || currentStudent.fullName;
  const studentUsername = user?.username || currentStudent.username;

  const realAccountingXp = Math.round(eval1.overallScore * 2.5 + eval2.totalScore * 2.5);
  const totalCompletedStages = eval1.completedStagesCount + eval2.completedStagesCount;

  // Real Certificates
  const realCertificates: StudentCertificateItem[] = useMemo(() => {
    const list: StudentCertificateItem[] = [];
    if (eval1.overallScore >= 70) {
      list.push({
        id: 'cert-acc-u1',
        labId: 'accounting',
        title: 'شهادة إتمام مشروع الدورة المحاسبية وجداول العمل (الوحدة 1)',
        issueDate: new Date().toISOString().split('T')[0],
        verificationCode: `SEFT-ACC-U1-${(studentUsername || 'STU').slice(0, 8).toUpperCase()}`,
        gradePct: eval1.overallScore,
        skillsCovered: [
          'دليل الحسابات',
          'التكلفة التاريخية للأصل',
          'دفتر اليومية',
          'قائمة الدخل',
          'الميزانية العمومية',
        ],
      });
    }
    if (eval2.totalScore >= 70) {
      list.push({
        id: 'cert-acc-u2',
        labId: 'accounting',
        title: 'شهادة إتقان تحليل العمليات المالية ومعادلة الميزانية (الوحدة 2)',
        issueDate: new Date().toISOString().split('T')[0],
        verificationCode: `SEFT-ACC-U2-${(studentUsername || 'STU').slice(0, 8).toUpperCase()}`,
        gradePct: eval2.totalScore,
        skillsCovered: [
          'فلترة العمليات المالية',
          'معادلة الميزانية الشاملة',
          'دراسة حالة محلات الأمين',
          'القوائم المالية الأربع',
        ],
      });
    }
    return list;
  }, [eval1.overallScore, eval2.totalScore, studentUsername]);

  // Real XP History
  const realXpHistory = useMemo(() => [
    { month: 'يونيو', total: 0, accounting: 0, marketing: 0, management: 0, python: 0 },
    { month: 'يوليو', total: 0, accounting: 0, marketing: 0, management: 0, python: 0 },
    { month: 'أغسطس', total: 0, accounting: 0, marketing: 0, management: 0, python: 0 },
    { month: 'سبتمبر', total: 0, accounting: 0, marketing: 0, management: 0, python: 0 },
    {
      month: 'أكتوبر',
      total: Math.round(realAccountingXp * 0.4),
      accounting: Math.round(realAccountingXp * 0.4),
      marketing: 0,
      management: 0,
      python: 0,
    },
    {
      month: 'نوفمبر',
      total: realAccountingXp,
      accounting: realAccountingXp,
      marketing: 0,
      management: 0,
      python: 0,
    },
  ], [realAccountingXp]);

  // Streak Days Matrix
  const streakDaysMatrix = useMemo(() => {
    const days = [
      { dayLabel: '01 نوفمبر', completed: false, xp: 0 },
      { dayLabel: '02 نوفمبر', completed: false, xp: 0 },
      { dayLabel: '03 نوفمبر', completed: false, xp: 0 },
      { dayLabel: '04 نوفمبر', completed: false, xp: 0 },
      { dayLabel: '05 نوفمبر', completed: false, xp: 0 },
      { dayLabel: '06 نوفمبر', completed: false, xp: 0 },
      { dayLabel: '07 نوفمبر', completed: false, xp: 0 },
      { dayLabel: '08 نوفمبر', completed: false, xp: 0 },
      { dayLabel: '09 نوفمبر', completed: false, xp: 0 },
      { dayLabel: '10 نوفمبر', completed: false, xp: 0 },
      { dayLabel: '11 نوفمبر', completed: false, xp: 0 },
      { dayLabel: '12 نوفمبر', completed: false, xp: 0 },
      {
        dayLabel: 'أمس',
        completed: totalCompletedStages > 0,
        xp: totalCompletedStages > 0 ? Math.round(realAccountingXp * 0.4) : 0,
      },
      {
        dayLabel: 'اليوم',
        completed: realAccountingXp > 0,
        xp: realAccountingXp > 0 ? Math.round(realAccountingXp * 0.6) : 0,
      },
    ];
    return days;
  }, [realAccountingXp, totalCompletedStages]);

  const handleDownloadCertificate = (cert: StudentCertificateItem) => {
    const content = [
      'SEFT LAB VERIFIED COMPLETION CERTIFICATE',
      '=========================================',
      `الاسم: ${studentName}`,
      `الجامعة: ${user?.organizationOrUniversity || currentStudent.university}`,
      `الشهادة: ${cert.title}`,
      `رمز التحقق الرسمي: ${cert.verificationCode}`,
      `تاريخ الإصدار: ${cert.issueDate}`,
      `درجة الإتقان العملي: ${cert.gradePct}%`,
      `المهارات الموثقة: ${cert.skillsCovered.join(' ، ')}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.verificationCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`تم تنزيل وثيقة الشهادة (${cert.verificationCode}) بنجاح`);
  };

  const handleShareCertificate = (cert: StudentCertificateItem) => {
    const shareUrl = `${window.location.origin}/students/${studentUsername}?cert=${cert.verificationCode}`;
    navigator.clipboard?.writeText(shareUrl);
    toast.success('تم نسخ رابط التحقق من الشهادة إلى الحافظة');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="تقدمي والإنجازات الموثقة"
        description="متابعة شاملة لمستوى إتقانك العملي الفعلي في المختبرات، سجل الاستمرارية اليومي، والشهادات والأوسمة المعتمدة."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/student/labs/accounting">
              <Button size="sm" className="gap-1.5">
                <FlaskConical className="h-3.5 w-3.5 stroke-[1.5]" />
                <span>دخول المختبر</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Unified Tab Switcher */}
      <div className="flex items-center gap-2 rounded-[20px] border border-[#E3E8F0] bg-white p-2 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-[14px] py-2 text-xs font-bold transition-all',
            activeTab === 'progress'
              ? 'bg-[#2F6BFF] text-white shadow-xs'
              : 'text-[#526077] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#1E325C]'
          )}
        >
          <TrendingUp className="h-3.5 w-3.5 stroke-[2]" />
          <span>مسار التقدم والمهارات</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-[14px] py-2 text-xs font-bold transition-all',
            activeTab === 'achievements'
              ? 'bg-[#2F6BFF] text-white shadow-xs'
              : 'text-[#526077] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#1E325C]'
          )}
        >
          <Award className="h-3.5 w-3.5 stroke-[2]" />
          <span>الشهادات والأوسمة ({realCertificates.length})</span>
        </button>
      </div>

      {activeTab === 'progress' ? (
        <div className="space-y-6">
          {/* Streak Indicator */}
          <div className="rounded-[22px] border border-[#E3E8F0] bg-white p-6 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E3E8F0] pb-4 sm:flex-row sm:items-center dark:border-[#1E325C]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#E3E8F0] bg-[#F5F6F8] text-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]">
                  <Calendar className="h-4 w-4 stroke-[1.5]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                    مؤشر انتظام التدريب اليومي
                  </h2>
                  <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
                    سلسلة التدريب المتواصلة تُظهر التزامك العملي أمام مسؤولي التوظيف.
                  </p>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-tabular text-3xl font-semibold text-[#2F6BFF]">
                  {totalCompletedStages > 0 ? 1 : 0}
                </span>
                <span className="text-xs font-medium text-[#526077] dark:text-[#94A3B8]">
                  أيام التدريب الموثقة فعلياً
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-7 lg:grid-cols-14">
              {streakDaysMatrix.map((d) => (
                <div
                  key={d.dayLabel}
                  className={`flex flex-col items-center justify-between rounded-[12px] border p-2.5 text-center ${
                    d.completed
                      ? 'border-[#2F6BFF]/40 bg-[#EBF1FF]/40 dark:border-[#2F6BFF]/50 dark:bg-[#2F6BFF]/10'
                      : 'border-[#E3E8F0] bg-[#F5F6F8] opacity-60 dark:border-[#1E325C] dark:bg-[#070D1F]'
                  }`}
                >
                  <span className="font-tabular text-[10px] text-[#526077] dark:text-[#94A3B8]">
                    {d.dayLabel}
                  </span>
                  <div className="my-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#E3E8F0] bg-white dark:border-[#1E325C] dark:bg-[#0A1630]">
                    {d.completed ? (
                      <Check className="h-3 w-3 stroke-[2] text-[#2F6BFF]" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E3E8F0] dark:bg-[#1E325C]" />
                    )}
                  </div>
                  <span className="font-tabular text-[10px] font-semibold text-[#526077] dark:text-[#94A3B8]">
                    {d.completed ? `+${d.xp} XP` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* XP Progress Chart */}
          <ChartCard
            title="نمو نقاط الخبرة (XP) عبر الأشهر"
            subtitle="توزيع نقاط الخبرة المكتسبة بحسب كل مختبر تخصصي."
            action={
              <div className="flex flex-wrap items-center gap-1">
                {(
                  [
                    { key: 'total', label: 'الإجمالي' },
                    { key: 'accounting', label: 'المحاسبة' },
                    { key: 'marketing', label: 'التسويق' },
                    { key: 'management', label: 'الإدارة' },
                    { key: 'python', label: 'البرمجة' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedMetric(m.key)}
                    className={`rounded-[10px] px-2.5 py-1 text-xs font-semibold transition-colors ${
                      selectedMetric === m.key
                        ? 'bg-[#2F6BFF] text-white'
                        : 'text-[#526077] hover:bg-[#E3E8F0]/40 dark:text-[#94A3B8] dark:hover:bg-[#1E325C]/40'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            }
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realXpHistory}>
                  <defs>
                    <linearGradient id="xpAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F6BFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2F6BFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8F0" opacity={0.6} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#526077' }}
                    stroke="#E3E8F0"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#526077' }}
                    stroke="#E3E8F0"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A1630',
                      border: '1px solid #1E325C',
                      borderRadius: '8px',
                      color: '#FAFBFC',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="#2F6BFF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#xpAreaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Labs Mastery Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {LABS_METADATA.map((lab) => {
              const xp = lab.id === 'accounting' ? realAccountingXp : 0;
              const skillMeta = calculateSkillLevelFromXp(xp);

              return (
                <div
                  key={lab.id}
                  className="flex flex-col justify-between rounded-[22px] border border-[#E3E8F0] bg-white p-6 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#E3E8F0] pb-4 dark:border-[#1E325C]">
                      <div>
                        <h3 className="text-base font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                          {lab.title}
                        </h3>
                        <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
                          {lab.subtitle}
                        </p>
                      </div>
                      <span className="font-tabular rounded-[8px] bg-[#2F6BFF]/10 px-2.5 py-1 text-xs font-semibold text-[#2F6BFF] dark:bg-[#2F6BFF]/20">
                        {skillMeta.level}
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#526077] dark:text-[#94A3B8]">
                          رصيد الخبرة الحالي:
                        </span>
                        <span className="font-tabular font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                          {xp} XP
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E3E8F0] dark:bg-[#1E325C]">
                        <div
                          className="h-full bg-[#2F6BFF]"
                          style={{ width: `${skillMeta.score}%` }}
                        />
                      </div>
                      <p className="mt-2 font-tabular text-[11px] text-[#526077] dark:text-[#94A3B8]">
                        المرحلة التالية ({skillMeta.nextLevelXp} XP): يتبقى{' '}
                        {Math.max(0, skillMeta.nextLevelXp - xp)} XP
                      </p>
                    </div>

                    <div className="mt-5">
                      <p className="mb-2 text-xs font-medium text-[#0A1630] dark:text-[#FAFBFC]">
                        المهارات العملية المكتسبة في هذا المختبر:
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#526077] dark:text-[#94A3B8]">
                        {lab.skillsLearned.map((skill, sIdx) => (
                          <React.Fragment key={skill}>
                            <span>{skill}</span>
                            {sIdx < lab.skillsLearned.length - 1 && (
                              <span aria-hidden="true">·</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#E3E8F0] pt-4 dark:border-[#1E325C]">
                    <span className="font-tabular text-xs text-[#526077] dark:text-[#94A3B8]">
                      {lab.skillsLearned.length} مهارات وسيناريوهات موثقة
                    </span>
                    <Link href={lab.id === 'accounting' ? '/student/labs/accounting' : lab.slug}>
                      <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                        <span>دخول المختبر</span>
                        <ArrowUpLeft className="h-3.5 w-3.5 stroke-[1.5]" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Certificates Section */}
          <div className="rounded-[22px] border border-[#E3E8F0] bg-white p-6 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                شهادات الإتمام المعتمدة ({realCertificates.length})
              </h2>
              <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
                وثائق رقمية رسمية برمز تحقق مستقل تصدر تلقائياً عند إتمام أي وحدة بنسبة 70% فما فوق.
              </p>
            </div>

            {realCertificates.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {realCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex flex-col justify-between rounded-[18px] border border-[#E3E8F0] bg-[#F8FAFC] p-5 dark:border-[#1E325C] dark:bg-[#070D1F]"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-[#E3E8F0] pb-3 dark:border-[#1E325C]">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F6BFF]">
                          <FileCheck2 className="h-4 w-4 stroke-[1.5]" />
                          <span className="font-tabular">{cert.verificationCode}</span>
                        </span>
                        <span className="font-tabular text-xs text-[#526077] dark:text-[#94A3B8]">
                          صدرت في {cert.issueDate}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                        {cert.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#526077] dark:text-[#94A3B8]">
                        <span>درجة الإتقان:</span>
                        <span className="font-tabular font-bold text-[#10B981]">
                          {cert.gradePct}%
                        </span>
                        <span>·</span>
                        <span>{cert.skillsCovered.join(' · ')}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#E3E8F0] pt-3.5 dark:border-[#1E325C]">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setPreviewCert(cert)}
                        className="gap-1.5 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span>معاينة الشهادة</span>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadCertificate(cert)}
                        className="gap-1.5 text-xs"
                      >
                        <Download className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span>تنزيل الوثيقة</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareCertificate(cert)}
                        className="gap-1.5 text-xs"
                      >
                        <Share2 className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span>مشاركة الرابط</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[16px] border border-dashed border-[#E3E8F0] p-8 text-center text-xs text-[#526077] dark:border-[#1E325C] dark:text-[#94A3B8]">
                لم تصدر أي شهادة بعد. أنجز مشروع الوحدة 1 أو الوحدة 2 في مختبر المحاسبة بنسبة 70% فما فوق لإصدار شهادتك الرسمية فورياً.
              </div>
            )}
          </div>

          {/* Achievement Badges */}
          <div className="rounded-[22px] border border-[#E3E8F0] bg-white p-6 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                شارات الإنجاز التخصصية
              </h2>
              <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
                تُمنح الشارات تلقائياً بناءً على نقاط الخبرة وسيناريوهات المختبرات المنجزة.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ACHIEVEMENT_BADGES.map((badge) => {
                const unlocked =
                  badge.labId === 'accounting'
                    ? realAccountingXp >= badge.requiredXp
                    : false;

                return (
                  <div
                    key={badge.id}
                    className={`flex items-start gap-3.5 rounded-[16px] border p-4 transition-all ${
                      unlocked
                        ? 'border-[#2F6BFF]/40 bg-[#FAFBFC] dark:border-[#2F6BFF]/40 dark:bg-[#070D1F]'
                        : 'border-[#E3E8F0] bg-white opacity-60 dark:border-[#1E325C] dark:bg-[#0A1630]'
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border text-lg ${
                        unlocked
                          ? 'border-[#2F6BFF]/30 bg-[#2F6BFF]/10 text-[#2F6BFF]'
                          : 'border-[#E3E8F0] bg-[#F5F6F8] text-[#94A3B8] dark:border-[#1E325C] dark:bg-[#070D1F]'
                      }`}
                    >
                      {unlocked ? (
                        <Award className="h-5 w-5 stroke-[1.5]" />
                      ) : (
                        <Lock className="h-4 w-4 stroke-[1.5]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="truncate text-xs font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                          {badge.title}
                        </h3>
                        <span
                          className={`font-tabular shrink-0 text-[10px] font-semibold ${
                            unlocked
                              ? 'text-[#2F6BFF]'
                              : 'text-[#526077] dark:text-[#94A3B8]'
                          }`}
                        >
                          {badge.requiredXp} XP
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#526077] dark:text-[#94A3B8]">
                        {badge.description}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${
                            unlocked ? 'bg-[#2F6BFF]' : 'bg-[#E3E8F0] dark:bg-[#1E325C]'
                          }`}
                        />
                        <span
                          className={
                            unlocked
                              ? 'font-medium text-[#2F6BFF]'
                              : 'text-[#526077] dark:text-[#94A3B8]'
                          }
                        >
                          {unlocked ? 'مكتملة وممنوحة' : 'مقفلة'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {previewCert && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-xl rounded-[24px] border border-[#E3E8F0] bg-white p-6 shadow-2xl dark:border-[#1E325C] dark:bg-[#0A1630]">
            <button
              type="button"
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 left-4 rounded-full p-1.5 text-[#526077] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#1E325C]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center">
              <span className="rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-[11px] font-bold text-[#2F6BFF]">
                SEFT LAB VERIFIED CERTIFICATE
              </span>
              <h3 className="mt-3 text-lg font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                {previewCert.title}
              </h3>
              <p className="mt-1 text-xs text-[#526077] dark:text-[#94A3B8]">
                مُنحت للطالب: <strong className="text-[#0A1630] dark:text-white">{studentName}</strong>
              </p>
            </div>

            <div className="my-6 rounded-[16px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 text-xs space-y-2 dark:border-[#1E325C] dark:bg-[#070D1F]">
              <div className="flex justify-between">
                <span className="text-[#526077] dark:text-[#94A3B8]">رمز التحقق الرسمي:</span>
                <span className="font-mono font-bold text-[#2F6BFF]">{previewCert.verificationCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526077] dark:text-[#94A3B8]">تاريخ الإصدار:</span>
                <span className="font-tabular">{previewCert.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526077] dark:text-[#94A3B8]">درجة الإتقان:</span>
                <span className="font-bold text-[#10B981]">{previewCert.gradePct}%</span>
              </div>
              <div className="pt-2 border-t border-[#E3E8F0] dark:border-[#1E325C]">
                <span className="text-[#526077] dark:text-[#94A3B8]">المهارات المعتمدة: </span>
                <span className="font-medium">{previewCert.skillsCovered.join(' · ')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPreviewCert(null)}>
                إغلاق
              </Button>
              <Button size="sm" onClick={() => handleDownloadCertificate(previewCert)}>
                <Download className="h-3.5 w-3.5 stroke-[1.5]" />
                <span>تنزيل</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
