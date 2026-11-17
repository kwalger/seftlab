'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpLeft,
  Briefcase,
  Calculator,
  Check,
  CheckCircle2,
  Code2,
  FileSpreadsheet,
  FileText,
  Globe2,
  GraduationCap,
  Megaphone,
  Plus,
  Scale,
  ShieldCheck,
  Target,
  Zap,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { COMPANY_PARTNERS } from '@/data/mock-data';
import { HOME_FAQS } from '@/lib/seo/json-ld';
import { RadarChart } from '@/components/shared/radar-chart';
import {
  FOUNDER_ENGLISH_TITLE,
  FOUNDER_NAME,
  FOUNDER_TITLE,
  FounderPortrait,
} from '@/components/legal/founder-portrait';
import { Button } from '@/components/ui/button';
import {
  AccountingScalePreview,
  MarketingGrowthPreview,
  ManagementBreakEvenPreview,
  PythonCodePreview,
  TeacherAutoGradingIllustration,
} from '@/components/home/home-illustrations';
import { HeroLabCanvasWrapper } from '@/components/home/hero-lab-canvas-wrapper';
import { cn } from '@/lib/utils';

const DEMO_RADAR = [
  { axis: 'المحاسبة', value: 92 },
  { axis: 'التسويق', value: 78 },
  { axis: 'الإدارة', value: 84 },
  { axis: 'بايثون', value: 96 },
  { axis: 'التحليل', value: 94 },
  { axis: 'القرار', value: 86 },
];

const SEFT_FRAMEWORK = [
  {
    letter: 'S',
    en: 'Skills',
    ar: 'مهارات عملية',
    desc: 'جداول محاسبية وتحليلية تطبق فيها المفاهيم بيدك بدلاً من الحفظ النظري.',
    audience: 'بناء الكفاءة الفعلية',
  },
  {
    letter: 'E',
    en: 'Experience',
    ar: 'خبرة موثقة',
    desc: 'محاكاة كاملة لشركة حقيقية تمنحك سجل إنجازات وأرقام قبل التخرج.',
    audience: 'جاهزية لسوق العمل',
  },
  {
    letter: 'F',
    en: 'Future',
    ar: 'مستقبل مهني',
    desc: 'ربط مباشر بين أدائك الأكاديمي وتوقعات الشركات العالمية والمستثمرين.',
    audience: 'معيار عالمي موثوق',
  },
  {
    letter: 'T',
    en: 'Training',
    ar: 'تدريب متدرج',
    desc: 'مشاريع مقسمة على مراحل واضحة مع تصحيح آلي فوري وإشراف الأساتذة.',
    audience: 'نتائج سريعة ودقيقة',
  },
];

const WORKBOOK_PREVIEW_STAGES: {
  stage: 1 | 2 | 3;
  tabLabel: string;
  formula: string;
  statusLabel: string;
  columns: string[];
  rows: string[][];
}[] = [
  {
    stage: 1,
    tabLabel: '1. جدول دليل الحسابات',
    formula: '=CLASSIFY(B2:E4) -> 100% متوافق مع دليل الحسابات ص 36',
    statusLabel: 'دليل الحسابات والمستندات',
    columns: ['الحساب', 'المستند المؤيد', 'المجموعة', 'القائمة المالية'],
    rows: [
      ['النقدية لدى البنك (101)', 'كشف البنك ومستند قبض', '1 - الأصول (مدين)', 'قائمة المركز المالي'],
      ['المعدات والآلات (112)', 'فاتورة شراء وشحن', '1 - الأصول (مدين)', 'قائمة المركز المالي'],
      ['إيرادات الخدمات (501)', 'فاتورة مبيعات داخلية', '5 - الإيرادات (دائن)', 'قائمة الدخل'],
    ],
  },
  {
    stage: 2,
    tabLabel: '2. التكلفة التاريخية واليومية',
    formula: '=SUM(D2:D5) -> إجمالي التكلفة التاريخية للآلة = 14,500 د.أ',
    statusLabel: 'مبدأ التكلفة التاريخية ص 29',
    columns: ['بند التكلفة / المستند', 'قيمة الفاتورة', 'الحالة المحاسبية', 'المبلغ المُرسمل'],
    rows: [
      ['ثمن شراء الآلة الأساسي', '12,000 د.أ', 'يدخل في التكلفة التاريخية', '12,000 د.أ'],
      ['الشحن البحري والجمارك', '1,500 د.أ', 'لازم للوصول (ص 29)', '1,500 د.أ'],
      ['التركيب والتشغيل التجريبي', '1,000 د.أ', 'لازم للجاهزية (ص 29)', '1,000 د.أ'],
      ['مسحوبات شخصية للمالك', '800 د.أ', 'مستبعد (وحدة مستقلة ص 27)', '0 د.أ'],
    ],
  },
  {
    stage: 3,
    tabLabel: '3. قائمة الدخل والميزانية',
    formula: 'الأصول (35,000 د.أ) = الالتزامات (0 د.أ) + حقوق الملكية (35,000 د.أ)',
    statusLabel: 'معادلة الميزانية متزنة 100%',
    columns: ['البيان المالي الختامي', 'القائمة', 'الرصيد النهائي', 'التحقق الآلي'],
    rows: [
      ['صافي الربح (8,500 - 3,500)', 'قائمة الدخل', '5,000 د.أ', 'مقاس ومضاف للملكية'],
      ['إجمالي الأصول (نقدية + آلات)', 'المركز المالي', '35,000 د.أ', 'متوازن مع الجانب الأيسر'],
      ['رأس المال + صافي ربح الفترة', 'المركز المالي', '35,000 د.أ', 'صافي التوازن = 0 د.أ'],
    ],
  },
];

function CountUpMetric({
  target,
  suffix = '',
  label,
}: {
  target: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          const duration = 900;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div
      ref={ref}
      className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 text-center shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]"
    >
      <p className="font-tabular text-3xl font-bold tracking-tight text-[#0A1630] sm:text-4xl dark:text-white">
        {val.toLocaleString('en-US')}
        <span className="text-[#2F6BFF]">{suffix}</span>
      </p>
      <p className="mt-1 text-xs font-medium text-[#64748B] sm:text-sm dark:text-[#94A3B8]">
        {label}
      </p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  dark = false,
  center = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      <span
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold',
          dark
            ? 'bg-white/10 text-[#93C5FD]'
            : 'bg-[#2F6BFF]/10 text-[#2F6BFF] dark:bg-[#2F6BFF]/20 dark:text-[#93C5FD]'
        )}
      >
        {eyebrow}
      </span>
      <h2
        className={cn(
          'mt-4 text-[26px] leading-[1.2] font-bold tracking-tight sm:text-[38px]',
          dark ? 'text-white' : 'text-[#0A1630] dark:text-white'
        )}
      >
        {title}
      </h2>
      {text && (
        <p
          className={cn(
            'mt-3 text-base leading-[1.8]',
            dark ? 'text-[#CBD5E1]' : 'text-[#475569] dark:text-[#CBD5E1]'
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}

const LAB_CARDS = [
  {
    id: 'accounting',
    icon: Calculator,
    label: 'المحاسبة المالية',
    title: 'جداول العمل والقيود والميزانية',
    text: '12 درساً مشروحاً مع مشروع جداول عملي من 3 مراحل يبني فهمك بالأرقام.',
    preview: <AccountingScalePreview />,
    span: 'lg:col-span-7',
    featured: true,
  },
  {
    id: 'marketing',
    icon: Megaphone,
    label: 'التسويق الرقمي',
    title: 'النمو واقتصاديات الحملات',
    text: 'اضبط السعر والميزانية وقِس العائد وتكلفة الاستحواذ عملياً.',
    preview: <MarketingGrowthPreview />,
    span: 'lg:col-span-5',
    featured: false,
  },
  {
    id: 'management',
    icon: Target,
    label: 'إدارة الأعمال',
    title: 'نقطة التعادل واتخاذ القرار',
    text: 'حلّل التكاليف الثابتة والمتغيرة وقس أثر القرارات التشغيلية.',
    preview: <ManagementBreakEvenPreview />,
    span: 'lg:col-span-5',
    featured: false,
  },
  {
    id: 'python',
    icon: Code2,
    label: 'البرمجة والبيانات',
    title: 'بايثون لتحليل الأعمال',
    text: 'اكتب كودك داخل المتصفح لاختبار دوال تحليل الإيرادات والأرباح.',
    preview: <PythonCodePreview />,
    span: 'lg:col-span-7',
    featured: false,
  },
];

export function HomeSections() {
  const { allStudents } = useAppStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [previewStage, setPreviewStage] = useState<1 | 2 | 3>(2);

  const featuredStudents = [...allStudents]
    .filter((s) => s.isPublicToCompanies)
    .sort((a, b) => b.totalXp - a.totalXp)
    .slice(0, 4);

  const activePreview =
    WORKBOOK_PREVIEW_STAGES.find((s) => s.stage === previewStage) ||
    WORKBOOK_PREVIEW_STAGES[0];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#070D1F]">
      {/* =====================================================
          1. HERO — SEFT LAB 2027 SPLIT LAYOUT
          ===================================================== */}
      <section
        className="relative -mt-[76px] overflow-hidden pt-[76px]"
        aria-label="منصة SEFT Lab — المختبرات التطبيقية العالمية"
      >
        {/* ── خلفية متدرجة وشبكة ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(47,107,255,0.14) 0%, transparent 70%), linear-gradient(180deg,#EEF4FF 0%,#F8FAFC 55%,#F8FAFC 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="bg-grid-faint pointer-events-none absolute inset-x-0 top-0 h-full opacity-60 dark:[display:none]"
        />
        {/* Dark-mode radial */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(47,107,255,0.18) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
          {/* ── Brand strip ── */}
          <div
            dir="ltr"
            className="animate-fade-up flex items-center justify-center pt-12 md:pt-16"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#CBD5E1]/60 bg-white/80 px-4 py-1.5 text-[11px] font-bold tracking-widest shadow-sm backdrop-blur-sm dark:border-[#1E325C] dark:bg-[#0A1630]/80">
              <Globe2 className="h-3.5 w-3.5 text-[#2F6BFF]" />
              <span className="text-[#0A1630] dark:text-[#E2E8F0]">SEFTLAB.COM</span>
              <span className="text-[#CBD5E1]">|</span>
              <span className="text-[#2F6BFF] uppercase tracking-widest">
                SKILLS · EXPERIENCE · FUTURE · TRAINING
              </span>
            </div>
          </div>

          {/* ── SPLIT: نص + مجسم 3D ── */}
          <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:mt-14 lg:grid-cols-2 lg:gap-16">

            {/* ── الجانب النصي (يمين) ── */}
            <div className="order-2 text-center lg:order-1 lg:text-right">
              {/* عنوان رئيسي */}
              <h1
                className="animate-fade-up font-bold tracking-tight text-[#0A1630] dark:text-white"
                style={{
                  fontSize: 'clamp(34px, 4.5vw, 62px)',
                  lineHeight: 1.1,
                  animationDelay: '60ms',
                }}
              >
                <span className="block">منصة المختبرات</span>
                <span className="block">التطبيقية العالمية.</span>
                <span
                  className="text-gradient-brand mt-1 block pb-2"
                  style={{ fontSize: 'clamp(28px, 3.8vw, 52px)' }}
                >
                  مهارات، خبرة، مستقبل.
                </span>
              </h1>

              {/* وصف مختصر */}
              <p
                className="animate-fade-up mx-auto mt-5 max-w-lg text-base leading-[1.9] text-[#475569] lg:mx-0 dark:text-[#CBD5E1]"
                style={{ animationDelay: '120ms', fontSize: 'clamp(15px,1.1vw,17px)' }}
              >
                تُحوّل <strong className="text-[#0A1630] dark:text-white">SEFT Lab</strong> المناهج
                الجامعية إلى جداول عمل تفاعلية ومحاكاة حقيقية للشركات. يبني الطالب خبرة موثقة
                بالأرقام تُقرأ مباشرة أمام الجامعات وجهات التوظيف.
              </p>

              {/* أزرار CTA */}
              <div
                className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
                style={{ animationDelay: '180ms' }}
              >
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="min-h-[52px] w-full px-8 text-base font-bold shadow-md sm:w-auto"
                  >
                    <span>ابدأ التدريب مجاناً</span>
                    <ArrowUpLeft className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </Link>
                <Link href="/labs" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="min-h-[52px] w-full bg-white px-7 text-base sm:w-auto dark:bg-[#0A1630]"
                  >
                    <span>استكشف المختبرات</span>
                  </Button>
                </Link>
              </div>

              {/* Trust chips */}
              <div
                className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-xs font-medium text-[#64748B] lg:justify-start dark:text-[#94A3B8]"
                style={{ animationDelay: '240ms' }}
              >
                {[
                  'جداول تطبيق عملي من الكتاب المقرر',
                  'تصحيح آلي فوري',
                  'يعمل على الهاتف والكمبيوتر',
                ].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>{t}</span>
                  </span>
                ))}
              </div>

              {/* Metrics row */}
              <div
                className="animate-fade-up mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
                style={{ animationDelay: '300ms' }}
              >
                {[
                  { val: 'S·E·F·T', label: 'ركيزة تأسيسية' },
                  { val: '4', label: 'مختبرات تطبيقية' },
                  { val: '12+', label: 'درساً عملياً' },
                  { val: '8+', label: 'شركات وجامعات' },
                ].map(({ val, label }) => (
                  <div
                    key={label}
                    className="rounded-[18px] border border-[#E2E8F0] bg-white px-3 py-3.5 text-center shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]"
                  >
                    <p
                      dir="ltr"
                      className="font-tabular text-xl font-bold tracking-tight text-[#0A1630] dark:text-white"
                    >
                      <span className="text-[#2F6BFF]">{val}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── الجانب البصري: مجسم 3D (يسار) ── */}
            <div
              className="animate-fade-up order-1 lg:order-2"
              style={{ animationDelay: '80ms' }}
            >
              {/* حاوية المجسم */}
              <div className="relative">
                {/* Glow behind canvas */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-6 rounded-full blur-3xl"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(47,107,255,0.22) 0%, transparent 70%)',
                  }}
                />
                {/* Canvas 3D */}
                <HeroLabCanvasWrapper />

                {/* Floating badge — تلقائياً SEO-safe لأنه aria-hidden */}
                <div
                  aria-hidden="true"
                  className="absolute -bottom-4 -right-2 hidden rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-2.5 shadow-lg sm:flex sm:items-center sm:gap-2.5 dark:border-[#1E325C] dark:bg-[#0A1630]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981]/15 text-[#047857] dark:text-[#34D399]">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#0A1630] dark:text-white">
                      معادلة الميزانية متوازنة
                    </p>
                    <p dir="ltr" className="font-tabular text-[11px] text-[#2F6BFF]">
                      ASSETS = LIABILITIES + EQUITY
                    </p>
                  </div>
                </div>

                {/* Floating badge — SEFT letters */}
                <div
                  aria-hidden="true"
                  className="absolute -top-4 -left-2 hidden rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-2.5 shadow-lg sm:flex sm:items-center sm:gap-2.5 dark:border-[#1E325C] dark:bg-[#0A1630]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-bold text-white">
                    S
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#0A1630] dark:text-white">مهارات موثقة</p>
                    <p dir="ltr" className="font-tabular text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      SKILLS · VERIFIED
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── معاينة جداول العمل التفاعلية (3 مراحل) ── */}
          <div
            className="animate-fade-up relative mx-auto mt-16 max-w-5xl md:mt-20"
            style={{ animationDelay: '350ms' }}
          >
            {/* Label */}
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px flex-1 bg-[#E2E8F0] dark:bg-[#1E325C]" />
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-1 text-xs font-bold text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-white">
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#2F6BFF]" />
                جداول العمل التفاعلية — 3 مراحل حية
              </span>
              <span className="h-px flex-1 bg-[#E2E8F0] dark:bg-[#1E325C]" />
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[#CBD5E1] bg-white shadow-[0_24px_60px_-24px_rgba(10,22,48,0.18)] dark:border-[#1E325C] dark:bg-[#0A1630]">
              {/* شريط العنوان */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#0A1630] px-4 py-3 text-white sm:px-6">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-[#4C88FF]" />
                  <span className="text-xs font-bold sm:text-sm">
                    ملف: الوحدة 1 تطبيق عملي — شركة النور للتجهيزات (3 مراحل)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-[#93C5FD] sm:inline-block">
                    {activePreview.statusLabel}
                  </span>
                  <Link
                    href="/student/labs/accounting?assignmentId=asg-u1-comprehensive"
                    className="inline-flex items-center gap-1 rounded-full bg-[#2F6BFF] px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-[#1D4ED8]"
                  >
                    <span>جرّبه الآن</span>
                    <ArrowUpLeft className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* تبويبات المراحل */}
              <div className="grid grid-cols-1 gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:grid-cols-3 dark:border-[#1E325C] dark:bg-[#070D1F]">
                {WORKBOOK_PREVIEW_STAGES.map((st) => {
                  const active = st.stage === previewStage;
                  return (
                    <button
                      key={st.stage}
                      type="button"
                      onClick={() => setPreviewStage(st.stage)}
                      className={cn(
                        'flex items-center justify-between rounded-[12px] border px-3.5 py-2.5 text-right text-xs font-bold transition-all',
                        active
                          ? 'border-[#2F6BFF] bg-white text-[#2F6BFF] shadow-xs dark:bg-[#0F1E3E]'
                          : 'border-[#E2E8F0] bg-white/60 text-[#475569] hover:bg-white dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#CBD5E1]'
                      )}
                    >
                      <span className="truncate">{st.tabLabel}</span>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15 text-[#047857] dark:text-[#34D399]">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* شريط الصيغة */}
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] bg-white px-4 py-2 dark:border-[#1E325C] dark:bg-[#0A1630]">
                <span className="rounded bg-[#0A1630] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white dark:bg-[#2F6BFF]">
                  fx
                </span>
                <span dir="ltr" className="truncate font-mono text-xs text-[#334155] dark:text-[#CBD5E1]">
                  {activePreview.formula}
                </span>
              </div>

              {/* الجدول */}
              <div className="overflow-x-auto p-3 sm:p-4">
                <table className="w-full min-w-[540px] border-collapse text-right text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-[#475569] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#94A3B8]">
                      {activePreview.columns.map((col) => (
                        <th key={col} className="px-3 py-2 font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F6] dark:divide-[#1E325C]">
                    {activePreview.rows.map((row, idx) => (
                      <tr key={idx}>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={cn(
                              'px-3 py-2.5',
                              cIdx === 0
                                ? 'font-bold text-[#0A1630] dark:text-white'
                                : cIdx === row.length - 1
                                ? 'font-tabular font-bold text-[#047857] dark:text-[#34D399]'
                                : 'font-tabular text-[#475569] dark:text-[#CBD5E1]'
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE SEFT ACRONYM STORY (Skills, Experience, Future, Training) */}
      <section aria-label="قصة ومعنى SEFT Lab" className="px-3 py-6 sm:px-5 md:py-10">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[36px] bg-[#0A1630] px-5 py-14 sm:px-10 md:py-20">
          <div
            aria-hidden="true"
            className="absolute -top-28 right-0 h-72 w-72 rounded-full bg-[#2F6BFF]/25 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                dark
                eyebrow="قصة منصة SEFT Lab (seftlab.com)"
                title="أربعة حروف تختصر فلسفة التعليم التطبيقي الحديث."
                text="تجمع SEFT بين المهارة والخبرة والمستقبل والتدريب لتمنح الجامعات وأصحاب العمل مقياساً صادقاً لكفاءة الخريج."
              />
              <Link href="/about" className="shrink-0">
                <Button
                  variant="outline"
                  className="min-h-[46px] border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                >
                  <span>قصة التأسيس أمام الجامعات والمستثمرين</span>
                  <ArrowUpLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SEFT_FRAMEWORK.map((item) => (
                <div
                  key={item.letter}
                  className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-[#4C88FF]/60 hover:bg-white/[0.07]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-tabular flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#2F6BFF] text-2xl font-bold text-white">
                        {item.letter}
                      </span>
                      <span
                        dir="ltr"
                        className="text-xs font-bold tracking-widest text-[#93C5FD] uppercase"
                      >
                        {item.en}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-white">
                      {item.ar}
                    </h3>
                    <p className="mt-2 text-sm leading-[1.8] text-[#CBD5E1]">
                      {item.desc}
                    </p>
                  </div>

                  <p className="mt-5 border-t border-white/10 pt-3 text-xs font-semibold text-[#93C5FD]">
                    {item.audience}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LABS BENTO */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="بيئة المحاكاة التفاعلية"
              title="أربعة مختبرات تحاكي أقسام الشركة الحقيقية."
              text="كل عملية تنفذها في المحاسبة أو التسويق أو الإدارة أو البرمجة تتكامل لتبني سجلك الموثق في seftlab.com."
            />
            <Link href="/labs" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <span>دخول المختبرات</span>
                <ArrowUpLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
            {LAB_CARDS.map((lab) => {
              const Icon = lab.icon;
              return (
                <Link
                  key={lab.id}
                  href={`/labs#${lab.id}`}
                  className={cn(
                    'group shadow-soft relative flex flex-col justify-between overflow-hidden rounded-[28px] border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-7 dark:bg-[#0A1630]',
                    lab.featured
                      ? 'border-[#2F6BFF]/35 dark:border-[#2F6BFF]/45'
                      : 'border-[#E2E8F0] dark:border-[#1E325C]',
                    lab.span
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#F1F5F9] py-1 ps-1 pe-3 text-xs font-semibold text-[#0A1630] dark:bg-[#070D1F] dark:text-white">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F6BFF] text-white">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {lab.label}
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] text-[#0A1630] transition-all duration-300 group-hover:border-[#2F6BFF] group-hover:bg-[#2F6BFF] group-hover:text-white dark:border-[#1E325C] dark:text-white">
                        <ArrowUpLeft className="h-4 w-4" />
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-[#0A1630] sm:text-2xl dark:text-white">
                      {lab.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-[1.8] text-[#475569] dark:text-[#CBD5E1]">
                      {lab.text}
                    </p>
                  </div>
                  <div className="pointer-events-none" aria-hidden="true">
                    {lab.preview}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. UNIVERSITIES & PROFESSORS */}
      <section aria-label="للمعلمين والجامعات" className="px-3 sm:px-5">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0A1630] to-[#13254D] px-5 py-14 sm:px-10 md:py-20">
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-[#2F6BFF]/20 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#93C5FD]">
                <GraduationCap className="h-3.5 w-3.5" />
                للجامعات وأعضاء هيئة التدريس
              </span>
              <h2 className="mt-4 text-[26px] leading-[1.2] font-bold tracking-tight text-white sm:text-[38px]">
                واجبات جداول عملية وتصحيح تلقائي فوري.
              </h2>
              <p className="mt-4 text-base leading-[1.8] text-[#CBD5E1]">
                بدلاً من الواجبات الورقية، شارك طلابك كود الشعبة لينفذوا مشروع «الوحدة 1 تطبيق عملي» على 3 مراحل وتصدر العلامة الفورية لكل طالب بدقة.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  'أنشئ واجباً تطبيقياً لأي شعبة خلال دقيقة واحدة.',
                  'تصحيح آلي فوري لدليل الحسابات والتكلفة التاريخية ومعادلة الميزانية.',
                  'سجل علامات موحّد يوضح نقاط القوة والتعثر لكل طالب.',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 text-[15px] text-[#E2E8F0]"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#34D399]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/teacher" className="inline-block w-full sm:w-auto">
                  <Button size="lg" className="w-full px-7 sm:w-auto">
                    <span>استكشف لوحة المعلم والجامعة</span>
                    <ArrowUpLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <TeacherAutoGradingIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROFILE + COMPANIES */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10">
            <SectionHeading
              eyebrow="ملف الطالب وبوابة التوظيف"
              title="مهاراتك بالأرقام، والشركات تبحث بالنتائج."
              text="يتحول أداؤك داخل مختبرات SEFT Lab إلى ملف مهني موثق تصفّيه الشركات مباشرة للوصول إلى الكفاءات الجاهزة."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
            <article className="shadow-soft flex flex-col justify-between rounded-[28px] border border-[#E2E8F0] bg-white p-6 sm:p-7 lg:col-span-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2F6BFF] to-[#1E55E4] text-base font-bold text-white">
                      يز
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0A1630] dark:text-white">
                        يزن النابلسي
                      </h3>
                      <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                        الجامعة الأردنية · 1,680 نقطة
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-xs font-semibold text-[#2F6BFF]">
                    نموذج موثق
                  </span>
                </div>
                <div className="mt-4 flex justify-center">
                  <RadarChart data={DEMO_RADAR} size={265} />
                </div>
              </div>

              <Link
                href="/students/yazan-nabulsi"
                className="mt-4 flex min-h-[48px] items-center justify-between rounded-full bg-[#F1F5F9] ps-5 pe-1.5 text-sm font-semibold text-[#0A1630] transition-colors hover:bg-[#E2E8F0] dark:bg-[#070D1F] dark:text-white"
              >
                <span>عرض البروفايل الكامل</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F6BFF] text-white">
                  <ArrowUpLeft className="h-4 w-4" />
                </span>
              </Link>
            </article>

            <article className="shadow-soft flex flex-col justify-between rounded-[28px] border border-[#E2E8F0] bg-white p-6 sm:p-7 lg:col-span-7 dark:border-[#1E325C] dark:bg-[#0A1630]">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0A1630] dark:text-white">
                      قائمة المواهب لدى الشركات
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                      فرز مباشر حسب الإتقان في الجداول والمختبرات
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {featuredStudents.map((student, idx) => (
                    <div
                      key={student.id}
                      className="flex flex-col justify-between gap-3 rounded-[20px] bg-[#F8FAFC] p-3.5 transition-colors hover:bg-[#F1F5F9] sm:flex-row sm:items-center dark:bg-[#070D1F] dark:hover:bg-[#0F1E3E]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#2F6BFF] shadow-xs dark:bg-[#0A1630]">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/students/${student.username}`}
                            className="block truncate text-[15px] font-bold text-[#0A1630] hover:text-[#2F6BFF] dark:text-white"
                          >
                            {student.fullName}
                          </Link>
                          <p className="truncate text-xs text-[#64748B] dark:text-[#94A3B8]">
                            {student.major} · {student.university}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="font-tabular text-sm font-bold text-[#2F6BFF]">
                          {student.totalXp.toLocaleString('en-US')} نقطة
                        </span>
                        <Link
                          href="/for-companies"
                          className="inline-flex min-h-[36px] items-center rounded-full bg-[#0A1630] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#2F6BFF] dark:bg-[#2F6BFF]"
                        >
                          دعوة لمقابلة
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/leaderboard"
                  className="text-sm font-semibold text-[#64748B] hover:text-[#2F6BFF] dark:text-[#94A3B8]"
                >
                  عرض جميع المتصدرين ({allStudents.length})
                </Link>
                <Link href="/for-companies">
                  <Button>
                    <span>افتح بوابة الشركات</span>
                    <ArrowUpLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </article>
          </div>

          <div className="mt-14">
            <p className="text-center text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">
              شركات ومؤسسات تتابع نتائج المختبرات على SEFT Lab
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {COMPANY_PARTNERS.map((company) => (
                <div
                  key={company.id}
                  className="inline-flex items-center gap-2.5 rounded-full border border-[#E2E8F0] bg-white py-1.5 ps-1.5 pe-4 dark:border-[#1E325C] dark:bg-[#0A1630]"
                  title={`${company.industry} · ${company.city}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-xs font-bold text-[#0A1630] dark:bg-[#070D1F] dark:text-white">
                    {company.initials}
                  </span>
                  <span className="text-sm font-semibold text-[#0A1630] dark:text-white">
                    {company.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading
            center
            eyebrow="الأسئلة الشائعة"
            title="إجابات واضحة حول SEFT Lab (seftlab.com)."
          />

          <div className="mt-10 space-y-3">
            {HOME_FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.question}
                  className={cn(
                    'rounded-[22px] border bg-white px-5 transition-all duration-300 sm:px-6 dark:bg-[#0A1630]',
                    isOpen
                      ? 'shadow-soft border-[#2F6BFF]/30'
                      : 'border-[#E2E8F0] dark:border-[#1E325C]'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="flex min-h-[60px] w-full items-center justify-between gap-4 text-right text-base font-bold text-[#0A1630] dark:text-white"
                  >
                    <span>{item.question}</span>
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                        isOpen
                          ? 'rotate-45 bg-[#2F6BFF] text-white'
                          : 'bg-[#F1F5F9] text-[#0A1630] dark:bg-[#070D1F] dark:text-white'
                      )}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                  <div
                    className={cn(
                      'grid transition-all duration-300',
                      isOpen
                        ? 'grid-rows-[1fr] pb-5 opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    )}
                  >
                    <p className="overflow-hidden text-[15px] leading-[1.8] text-[#475569] dark:text-[#CBD5E1]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FOUNDER & GOVERNANCE */}
      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 sm:p-10 dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="mx-auto max-w-[300px] rounded-[24px] border border-[#E2E8F0] bg-[#FAFBFC] p-3 dark:border-[#1E325C] dark:bg-[#070D1F]">
                  <FounderPortrait
                    className="aspect-square w-full rounded-[20px]"
                    sizes="(max-width: 1024px) 260px, 300px"
                  />
                  <div className="mt-3.5 px-2 pb-1 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-[11px] font-semibold text-[#2F6BFF]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>قيادة تنفيذية موثقة</span>
                    </span>
                    <h3 className="mt-2 text-base font-bold text-[#0A1630] dark:text-white">
                      {FOUNDER_NAME}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-[#2F6BFF]">
                      {FOUNDER_TITLE}
                    </p>
                    <p className="font-tabular mt-0.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {FOUNDER_ENGLISH_TITLE}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <SectionHeading
                  eyebrow="الحوكمة والقيادة التنفيذية"
                  title="منصة SEFT Lab: تأهيل تطبيقي بضوابط قانونية وأكاديمية صارمة."
                  text="تأسست منصة SEFT Lab (seftlab.com) بقيادة المؤسس والرئيس التنفيذي حسن عبدالرحمن العرجان لتترجم رؤية Skills, Experience, Future, Training إلى جسر عملي موثوق يخدم الجامعات والطلاب والمستثمرين والشركات."
                />

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link
                    href="/about"
                    className="group flex items-start gap-3 rounded-[18px] border border-[#E2E8F0] bg-[#FAFBFC] p-4 transition-all hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#2F6BFF]/10 text-[#2F6BFF]">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#0A1630] group-hover:text-[#2F6BFF] dark:text-white">
                        عن منصة SEFT Lab والمؤسس
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                        قصة SEFT أمام الجامعات والمستثمرين
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/privacy"
                    className="group flex items-start gap-3 rounded-[18px] border border-[#E2E8F0] bg-[#FAFBFC] p-4 transition-all hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#2F6BFF]/10 text-[#2F6BFF]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#0A1630] group-hover:text-[#2F6BFF] dark:text-white">
                        سياسة الخصوصية
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                        حماية البيانات الشخصية والأداء
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/terms"
                    className="group flex items-start gap-3 rounded-[18px] border border-[#E2E8F0] bg-[#FAFBFC] p-4 transition-all hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#2F6BFF]/10 text-[#2F6BFF]">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#0A1630] group-hover:text-[#2F6BFF] dark:text-white">
                        الشروط والأحكام القانونية
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                        الملكية الفكرية وضوابط الاستخدام
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/disclaimer"
                    className="group flex items-start gap-3 rounded-[18px] border border-[#E2E8F0] bg-[#FAFBFC] p-4 transition-all hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#2F6BFF]/10 text-[#2F6BFF]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#0A1630] group-hover:text-[#2F6BFF] dark:text-white">
                        إخلاء المسؤولية والنزاهة
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                        ضوابط المحاكاة وميثاق النزاهة
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/seo"
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#2F6BFF]/10 px-4 py-2 text-xs font-semibold text-[#2F6BFF] transition-colors hover:bg-[#2F6BFF] hover:text-white"
                  >
                    <span>مركز الأرشفة وتصدر البحث (SEO)</span>
                    <ArrowUpLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CLOSING CTA */}
      <section className="px-3 pb-16 sm:px-5 md:pb-24">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[36px] bg-gradient-to-br from-[#1E55E4] via-[#2F6BFF] to-[#0B1A44] px-6 py-14 text-center text-white sm:px-12 md:py-20">
          <div aria-hidden="true" className="bg-grid-faint absolute inset-0 opacity-30" />
          <div className="relative mx-auto max-w-2xl">
            <p
              dir="ltr"
              className="font-tabular text-xs font-bold tracking-widest text-[#C3D6FF] uppercase"
            >
              SEFTLAB.COM · SKILLS · EXPERIENCE · FUTURE · TRAINING
            </p>
            <h2 className="mt-4 text-[26px] leading-[1.2] font-bold tracking-tight sm:text-[42px]">
              ابدأ بناء خبرتك العملية اليوم على SEFT Lab.
            </h2>
            <p className="mt-4 text-base leading-[1.8] text-white/85">
              المختبرات وجداول التطبيق العملي تعمل مباشرة من المتصفح على الهاتف والكمبيوتر لتوثق مهاراتك للمستقبل.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="min-h-[52px] w-full bg-white px-8 text-base font-bold text-[#0B1A44] shadow-none hover:bg-[#F1F5F9] sm:w-auto"
                >
                  <span>أنشئ حساباً مجانياً</span>
                  <ArrowUpLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/for-companies" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-[52px] w-full border-white/30 bg-white/10 px-8 text-base text-white hover:border-white hover:bg-white/15 hover:text-white sm:w-auto dark:bg-white/10"
                >
                  للشركات والجامعات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
