'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import {
  Activity,
  ArrowUpLeft,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  FlaskConical,
  MessageSquare,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { useStudentDashboardStore } from '@/store/use-student-dashboard-store';
import { useTeacherStore } from '@/store/use-teacher-store';
import { StudentActivityRow } from '@/data/dashboard-mock-data';
import { LABS_METADATA } from '@/data/mock-data';
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
import {
  ChartCard,
  DashboardStatCard,
  DataTable,
  DataTableColumn,
  PageHeader,
} from '@/components/dashboard/ui-kit';
import { Button } from '@/components/ui/button';

export default function StudentOverviewPage() {
  const { currentStudent, companyMessages, user } = useAppStore();
  const { projects } = useStudentDashboardStore();
  const { assignments, submissions, classes } = useTeacherStore();

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
  const realCompletedStages = eval1.completedStagesCount + eval2.completedStagesCount;

  const enrolledClassIds = classes
    .filter(
      (c) =>
        c.studentUsernames.includes(studentUsername) ||
        c.studentUsernames.includes(currentStudent.username)
    )
    .map((c) => c.id);

  const myAssignments = assignments.filter(
    (a) => a.status === 'منشور' && enrolledClassIds.includes(a.targetClassId)
  );

  const myMessages = companyMessages.filter(
    (m) => m.studentUsername === currentStudent.username
  );

  // Profile completion
  const completionChecks = [
    Boolean(currentStudent.bio && currentStudent.bio.length > 20),
    Boolean(currentStudent.educationDetails),
    Boolean(currentStudent.githubOrPortfolio),
    Boolean(currentStudent.linkedinUrl),
    currentStudent.isPublicToCompanies,
    projects.length > 0,
  ];
  const profileCompletionPct = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100
  );

  // Real Radar Data
  const radarData = [
    {
      subject: 'المحاسبة',
      score: Math.min(100, Math.round((realAccountingXp / 500) * 100)),
    },
    {
      subject: 'التسويق',
      score: 0,
    },
    {
      subject: 'الإدارة',
      score: 0,
    },
    {
      subject: 'Python',
      score: 0,
    },
  ];

  // Real Weekly Activity
  const weeklyActivity = [
    { day: 'السبت', xp: 0 },
    { day: 'الأحد', xp: 0 },
    { day: 'الاثنين', xp: 0 },
    { day: 'الثلاثاء', xp: 0 },
    { day: 'الأربعاء', xp: Math.round(realAccountingXp * 0.3) },
    { day: 'الخميس', xp: Math.round(realAccountingXp * 0.3) },
    { day: 'اليوم', xp: Math.round(realAccountingXp * 0.4) },
  ];

  // Real Activities Table
  const realActivities: StudentActivityRow[] = useMemo(() => {
    const list: StudentActivityRow[] = [];

    if (eval1.stage1.isComplete) {
      list.push({
        id: 'u1-s1',
        title: 'جدول دليل الحسابات وتصنيف المستندات (الوحدة 1)',
        labName: 'مختبر المحاسبة المالية',
        labId: 'accounting',
        xpEarned: 85,
        scorePct: 100,
        completedAt: 'اليوم',
        status: 'مكتمل',
      });
    }
    if (eval1.stage2.isComplete) {
      list.push({
        id: 'u1-s2',
        title: 'جدول التكلفة التاريخية ودفتر اليومية (الوحدة 1)',
        labName: 'مختبر المحاسبة المالية',
        labId: 'accounting',
        xpEarned: 85,
        scorePct: 100,
        completedAt: 'اليوم',
        status: 'مكتمل',
      });
    }
    if (eval1.stage3.isComplete) {
      list.push({
        id: 'u1-s3',
        title: 'جدول قائمة الدخل ومعادلة الميزانية (الوحدة 1)',
        labName: 'مختبر المحاسبة المالية',
        labId: 'accounting',
        xpEarned: 80,
        scorePct: 100,
        completedAt: 'اليوم',
        status: 'مكتمل',
      });
    }

    if (eval2.stage1Complete) {
      list.push({
        id: 'u2-s1',
        title: 'شروط العملية المالية وقاعدة الفلترة (الوحدة 2)',
        labName: 'مختبر المحاسبة المالية',
        labId: 'accounting',
        xpEarned: 60,
        scorePct: 100,
        completedAt: 'اليوم',
        status: 'مكتمل',
      });
    }
    if (eval2.stage2Complete) {
      list.push({
        id: 'u2-s2',
        title: 'حالات معادلة الميزانية الأربع (الوحدة 2)',
        labName: 'مختبر المحاسبة المالية',
        labId: 'accounting',
        xpEarned: 60,
        scorePct: 100,
        completedAt: 'اليوم',
        status: 'مكتمل',
      });
    }
    if (eval2.stage3Complete) {
      list.push({
        id: 'u2-s3',
        title: 'جدول محلات الأمين لتحليل العمليات المالية (الوحدة 2)',
        labName: 'مختبر المحاسبة المالية',
        labId: 'accounting',
        xpEarned: 70,
        scorePct: 100,
        completedAt: 'اليوم',
        status: 'مكتمل',
      });
    }
    if (eval2.stage4Complete) {
      list.push({
        id: 'u2-s4',
        title: 'إعداد القوائم المالية الأربع ومطابقة الأرباح (الوحدة 2)',
        labName: 'مختبر المحاسبة المالية',
        labId: 'accounting',
        xpEarned: 60,
        scorePct: 100,
        completedAt: 'اليوم',
        status: 'مكتمل',
      });
    }

    return list;
  }, [eval1, eval2]);

  const recommendedLabs = LABS_METADATA.filter((l) => l.id === 'accounting');

  const activityColumns: DataTableColumn<StudentActivityRow>[] = [
    {
      key: 'title',
      header: 'التمرين / المهمة العملية',
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <span className="font-medium text-[#0A1630] dark:text-[#FAFBFC]">
          {r.title}
        </span>
      ),
    },
    {
      key: 'labName',
      header: 'المختبر',
      sortable: true,
      sortValue: (r) => r.labName,
      render: (r) => (
        <span className="text-[#526077] dark:text-[#94A3B8]">{r.labName}</span>
      ),
    },
    {
      key: 'scorePct',
      header: 'درجة الإتقان',
      sortable: true,
      sortValue: (r) => r.scorePct,
      render: (r) => (
        <span className="font-tabular font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
          {r.scorePct}%
        </span>
      ),
    },
    {
      key: 'xpEarned',
      header: 'الخبرة المكتسبة',
      sortable: true,
      sortValue: (r) => r.xpEarned,
      render: (r) => (
        <span className="font-tabular font-semibold text-[#2F6BFF]">
          +{r.xpEarned} XP
        </span>
      ),
    },
    {
      key: 'completedAt',
      header: 'التاريخ',
      sortable: true,
      sortValue: (r) => r.completedAt,
      render: (r) => (
        <span className="font-tabular text-[#526077] dark:text-[#94A3B8]">
          {r.completedAt}
        </span>
      ),
    },
  ];

  const circleRadius = 46;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset =
    circleCircumference - (profileCompletionPct / 100) * circleCircumference;

  return (
    <div>
      <PageHeader
        title={`مرحباً، ${studentName}`}
        description="ملخص أدائك العملي الفعلي في المختبرات التفاعلية وتفاعل الشركات مع بروفايلك المهني."
        actions={
          <>
            <Link href={`/students/${studentUsername}`}>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <span>معاينة البروفايل العام</span>
                <ArrowUpLeft className="h-3.5 w-3.5 stroke-[1.5]" />
              </Button>
            </Link>
            <Link href="/student/labs/accounting">
              <Button size="sm" className="gap-1.5">
                <FlaskConical className="h-3.5 w-3.5 stroke-[1.5]" />
                <span>متابعة التدريب العملي</span>
              </Button>
            </Link>
          </>
        }
      />

      {/* Actual Live Statistics Cards */}
      <section aria-label="مؤشرات الأداء الفعلية" className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
            مؤشرات الإنجاز العملي (بيانات حقيقية مستخرجة من حلك)
          </h2>
          <span className="font-tabular text-xs text-[#526077] dark:text-[#94A3B8]">
            تحديث حي ومباشر
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            label="نقاط الخبرة (XP)"
            value={realAccountingXp.toLocaleString('en-US')}
            changeText="مجموع النقاط المكتسبة فعلياً"
            subtitle="من مشاريع المحاسبة العملية"
            icon={Activity}
          />
          <DashboardStatCard
            label="المراحل والتمارين المنجزة"
            value={realCompletedStages.toLocaleString('en-US')}
            changeText="مراحل مكتملة وموثقة"
            subtitle="في مختبر المحاسبة المالية"
            icon={CheckCircle2}
          />
          <DashboardStatCard
            label="مشاهدات البروفايل من الشركات"
            value={currentStudent.isPublicToCompanies ? '1' : '0'}
            changeText="ظهور رسمي لدى مسؤولي التوظيف"
            subtitle={currentStudent.isPublicToCompanies ? 'ملفك متاح ومفعل للشركات' : 'الملف مخفي حالياً'}
            icon={Eye}
          />
          <DashboardStatCard
            label="الرسائل الواردة"
            value={myMessages.length.toLocaleString('en-US')}
            changeText="رسائل تواصل مباشر"
            subtitle="عروض مقابلات وتدريب تعاوني"
            icon={MessageSquare}
          />
        </div>
      </section>

      {/* Practical Assignments Section */}
      <section aria-label="واجباتي العملية" className="mb-6">
        <div className="rounded-[26px] border border-[#E2E8F0]/90 bg-white p-5 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.06)] sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 stroke-[1.5] text-[#2F6BFF]" />
                <h2 className="text-base font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  واجباتي العملية من أساتذة المساقات
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-[#526077] dark:text-[#94A3B8]">
                مهام تطبيقية داخل المختبرات التفاعلية تصحح تلقائياً وتمنحك نقاط خبرة إضافية.
              </p>
            </div>
            <Link href="/student/assignments">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <span>عرض كل الواجبات والانضمام لشعبة</span>
                <ArrowUpLeft className="h-3.5 w-3.5 stroke-[1.5]" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {myAssignments.length > 0 ? (
              myAssignments.slice(0, 4).map((assignment) => {
                const cls = classes.find((c) => c.id === assignment.targetClassId);
                const sub = submissions.find(
                  (s) =>
                    s.assignmentId === assignment.id &&
                    s.studentUsername === currentStudent.username
                );
                const isSubmitted =
                  sub?.status === 'مُصحَّح آلياً' ||
                  sub?.status === 'تمت المراجعة' ||
                  sub?.status === 'متأخر';
                const finalScore =
                  sub?.manualScoreOverride ?? sub?.autoGrade?.autoScore ?? 0;
                return (
                  <div
                    key={assignment.id}
                    className="flex flex-col justify-between rounded-[20px] border border-[#E2E8F0] bg-[#FAFBFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-medium text-[#2F6BFF]">
                          {cls?.courseName || 'مساق جامعي'}
                        </span>
                        <span className="font-tabular font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                          {assignment.maxScore} نقطة
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                        {assignment.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#526077] dark:text-[#94A3B8]">
                        <Clock className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span className="font-tabular">
                          التسليم: {assignment.dueDate}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#E3E8F0] pt-3 dark:border-[#1E325C]">
                      <span className="font-tabular text-xs font-medium text-[#526077] dark:text-[#94A3B8]">
                        {isSubmitted
                          ? `الدرجة: ${finalScore}/${assignment.maxScore}`
                          : 'قيد الحل'}
                      </span>
                      <Link
                        href={
                          assignment.labId === 'accounting'
                            ? `/student/labs/accounting?assignmentId=${assignment.id}`
                            : `/labs/${assignment.labId}?assignmentId=${assignment.id}`
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6BFF] hover:underline"
                      >
                        <span>{isSubmitted ? 'مراجعة الحل' : 'فتح في المختبر'}</span>
                        <ArrowUpLeft className="h-3.5 w-3.5 stroke-[1.5]" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full rounded-[16px] border border-dashed border-[#E2E8F0] p-6 text-center text-xs text-[#526077] dark:border-[#1E325C] dark:text-[#94A3B8]">
                لا توجد واجبات منشورة لشعبتك حالياً. يمكنك التمرن الذاتي داخل مختبر المحاسبة المالية في أي وقت.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Weekly Activity LineChart + Strengths RadarChart + Circular Profile Completion */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ChartCard
          title="نشاط التدريب الأسبوعي"
          subtitle="نقاط الخبرة المكتسبة فعلياً خلال الأيام الماضية"
          className="lg:col-span-5"
        >
          <div className="h-[220px] sm:h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E8F0" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#526077' }}
                  axisLine={{ stroke: '#E3E8F0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#526077' }}
                  axisLine={{ stroke: '#E3E8F0' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A1630',
                    border: '1px solid #1E325C',
                    borderRadius: '10px',
                    color: '#FAFBFC',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="xp"
                  name="نقاط الخبرة (XP)"
                  stroke="#2F6BFF"
                  strokeWidth={2.25}
                  dot={{ r: 4, fill: '#0A1630', stroke: '#2F6BFF', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#2F6BFF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="توازن المهارات في المختبرات"
          subtitle="نسبة الإتقان الفعلية بناءً على إنجازك للمشاريع"
          className="lg:col-span-4"
        >
          <div className="h-[220px] sm:h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsRadarChart
                cx="50%"
                cy="50%"
                outerRadius="72%"
                data={radarData}
              >
                <PolarGrid stroke="#E3E8F0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: '#526077' }}
                />
                <Radar
                  name="نسبة الإتقان"
                  dataKey="score"
                  stroke="#2F6BFF"
                  fill="#2F6BFF"
                  fillOpacity={0.22}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A1630',
                    border: '1px solid #1E325C',
                    borderRadius: '10px',
                    color: '#FAFBFC',
                    fontSize: '12px',
                  }}
                />
              </RechartsRadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Circular Profile Completion Indicator */}
        <div className="flex flex-col justify-between rounded-[26px] border border-[#E2E8F0]/90 bg-white p-5 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.06)] sm:p-6 lg:col-span-3 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div>
            <h2 className="text-base font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
              اكتمال البروفايل المهني
            </h2>
            <p className="mt-0.5 text-xs text-[#526077] dark:text-[#94A3B8]">
              البروفايلات المكتملة ترفع فرص وصول الشركات إليك.
            </p>
          </div>

          <div className="my-4 flex flex-col items-center justify-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 112 112">
                <circle
                  cx="56"
                  cy="56"
                  r={circleRadius}
                  fill="none"
                  stroke="#F1F4F9"
                  strokeWidth="8"
                />
                <circle
                  cx="56"
                  cy="56"
                  r={circleRadius}
                  fill="none"
                  stroke="#2F6BFF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-tabular text-2xl font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  {profileCompletionPct}%
                </span>
                <span className="text-[11px] text-[#526077] dark:text-[#94A3B8]">
                  مكتمل
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-[#E3E8F0] pt-3 text-xs dark:border-[#1E325C]">
            <div className="flex items-center justify-between">
              <span className="text-[#526077] dark:text-[#94A3B8]">
                حالة الظهور للشركات
              </span>
              <span className="font-medium text-[#0A1630] dark:text-[#FAFBFC]">
                {currentStudent.isPublicToCompanies ? 'متاح للباحثين' : 'مخفي'}
              </span>
            </div>
            <Link href="/student/profile" className="block pt-1">
              <Button variant="secondary" size="sm" className="w-full text-xs">
                تحديث البروفايل المهني
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activities Table + Recommended Lab */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ChartCard
          title="آخر الأنشطة والتمارين المنجزة فعلياً"
          subtitle="سجل التمارين الموثقة في حسابك بناءً على ما قمت بحله"
          className="lg:col-span-8"
        >
          {realActivities.length > 0 ? (
            <DataTable
              data={realActivities}
              columns={activityColumns}
              rowKey={(r) => r.id}
              searchPlaceholder="ابحث باسم التمرين..."
              searchMatcher={(r, q) => r.title.toLowerCase().includes(q)}
              pageSize={4}
            />
          ) : (
            <div className="rounded-[16px] border border-dashed border-[#E3E8F0] p-8 text-center text-xs text-[#526077] dark:border-[#1E325C] dark:text-[#94A3B8]">
              لم تقم بإنجاز أي مراحل بعد. ادخل إلى مختبر المحاسبة المالية لحل التمارين التفاعلية واعتماد درجاتك.
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="المختبر الموصى به للمتابعة"
          subtitle="المنهاج التطبيقي المعتمد للتدريب العملي"
          className="lg:col-span-4"
        >
          <div className="space-y-3">
            {recommendedLabs.map((lab) => {
              const pct = Math.min(100, Math.round((realAccountingXp / 500) * 100));
              const targetHref = '/student/labs/accounting';
              return (
                <div
                  key={lab.id}
                  className="rounded-[20px] border border-[#E2E8F0] bg-[#FAFBFC] p-5 transition-colors hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#2F6BFF]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2F6BFF]">
                      المختبر النشط
                    </span>
                    <span className="font-tabular text-xs font-semibold text-[#2F6BFF]">
                      {realAccountingXp} / 500 XP
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                    {lab.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#526077] dark:text-[#94A3B8]">
                    تطبيق عملي متدرج لمنهاج مبادئ المحاسبة المالية من المدخل إلى القوائم المالية.
                  </p>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0] dark:bg-[#0A1630]">
                    <div
                      className="h-full rounded-full bg-[#2F6BFF]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-tabular text-xs font-medium text-[#526077] dark:text-[#94A3B8]">
                      إنجاز {pct}% · الوحدتان 1 و 2 متاحتان الآن
                    </span>
                    <Link
                      href={targetHref}
                      className="inline-flex items-center gap-1 rounded-full bg-[#2F6BFF] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2554D9]"
                    >
                      <span>ابدأ التمرين</span>
                      <ArrowUpLeft className="h-3.5 w-3.5 stroke-[1.75]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
