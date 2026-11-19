'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowUpLeft,
  BadgeCheck,
  BarChart3,
  Calculator,
  CheckCircle2,
  Code2,
  Layers,
  Megaphone,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Target,
  WifiOff,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { getDashboardHomeForUser } from '@/lib/auth-constants';
import { LABS_METADATA } from '@/data/mock-data';
import {
  getCourseJsonLd,
  getBreadcrumbJsonLd,
  safeJsonLdStringify,
} from '@/lib/seo/json-ld';
import {
  AccountingScalePreview,
  MarketingGrowthPreview,
  ManagementBreakEvenPreview,
  PythonCodePreview,
} from '@/components/home/home-illustrations';
import { Button } from '@/components/ui/button';

type LabId = 'accounting' | 'marketing' | 'management' | 'python';

const LAB_EXTRAS: Record<
  LabId,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    tone: string;
    duration: string;
    outcome: string;
    preview: React.ReactNode;
  }
> = {
  accounting: {
    icon: Calculator,
    label: 'المحاسبة',
    tone: 'from-[#2563EB] to-[#4F46E5]',
    duration: '8 وحدات تطبيقية',
    outcome: 'تسجّل القيود، ترحّلها، وتبني القوائم المالية بنفسك خطوة بخطوة.',
    preview: <AccountingScalePreview />,
  },
  marketing: {
    icon: Megaphone,
    label: 'التسويق',
    tone: 'from-[#0EA5E9] to-[#2563EB]',
    duration: 'حملات ومؤشرات أداء',
    outcome: 'تخطط حملة، تضبط الميزانية، وتقرأ العائد وتكلفة العميل بالأرقام.',
    preview: <MarketingGrowthPreview />,
  },
  management: {
    icon: Target,
    label: 'الإدارة',
    tone: 'from-[#10B981] to-[#0D9488]',
    duration: 'قرارات وسيناريوهات',
    outcome: 'تحسب نقطة التعادل وتتخذ قرارات إدارية ترى أثرها فوراً.',
    preview: <ManagementBreakEvenPreview />,
  },
  python: {
    icon: Code2,
    label: 'البرمجة',
    tone: 'from-[#6366F1] to-[#0EA5E9]',
    duration: 'تحديات برمجية للأعمال',
    outcome: 'تكتب كوداً بسيطاً يحل مشكلات محاسبية وتسويقية حقيقية.',
    preview: <PythonCodePreview />,
  },
};

const HOW_IT_WORKS = [
  {
    icon: MousePointerClick,
    title: 'اختر المختبر من لوحتك',
    text: 'بعد تسجيل الدخول تجد المختبرات الأربعة في لوحة الطالب، وتبدأ من أول وحدة.',
  },
  {
    icon: Layers,
    title: 'طبّق مهام قصيرة وواضحة',
    text: 'كل وحدة مقسمة إلى تمارين عملية قصيرة مع تصحيح فوري وتوضيح لسبب الخطأ.',
  },
  {
    icon: BadgeCheck,
    title: 'تُحتسب نتائجك تلقائياً',
    text: 'كل إنجاز يضيف نقاطاً لملفك المهني ويظهر للشركات التي تبحث عن مهارتك.',
  },
];

const BENEFITS = [
  { icon: WifiOff, title: 'يعمل بدون إنترنت', text: 'تقدمك محفوظ على جهازك.' },
  { icon: Sparkles, title: 'خفيف وسريع', text: 'مصمم ليعمل على الهواتف البسيطة.' },
  { icon: ShieldCheck, title: 'تصحيح فوري', text: 'تعرف خطأك وسببه مباشرة.' },
  { icon: BarChart3, title: 'تقدم قابل للقياس', text: 'نسبة إتقان لكل وحدة ومهارة.' },
];

export default function LabsCatalogPage() {
  const { user } = useAppStore();

  const startHref = user ? getDashboardHomeForUser(user) : '/register';

  const coursesJsonLd = LABS_METADATA.map((lab) => getCourseJsonLd(lab));
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'المختبرات التفاعلية', path: '/labs' },
  ]);

  return (
    <div className="bg-mesh-light relative -mt-[76px] overflow-hidden pt-[76px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify([breadcrumbJsonLd, ...coursesJsonLd]),
        }}
      />
      <div aria-hidden="true" className="bg-grid-faint pointer-events-none absolute inset-x-0 top-0 h-[520px]" />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-4 pt-10 pb-12 text-center sm:px-6 md:pt-16 md:pb-16">
        <span className="glass-surface animate-fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-[#2563EB]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
          تعرّف على المختبرات قبل أن تبدأ
        </span>
        <h1
          className="animate-fade-up mx-auto mt-5 max-w-3xl font-bold tracking-tight text-[#0A1630] dark:text-white"
          style={{ fontSize: 'clamp(32px, 5vw, 60px)', lineHeight: 1.12, animationDelay: '60ms' }}
        >
          أربعة مختبرات عملية.
          <span className="text-gradient-brand block pb-1">تعلّم بالتطبيق لا بالحفظ.</span>
        </h1>
        <p
          className="animate-fade-up mx-auto mt-5 max-w-2xl text-base leading-[1.8] text-[#475569] sm:text-lg dark:text-[#CBD5E1]"
          style={{ animationDelay: '120ms' }}
        >
          كل مختبر بيئة تدريب مصغرة تحاكي قسماً حقيقياً داخل شركة. هذه الصفحة تشرح ما ستتعلمه في كل مختبر، وتبدأ التدريب الفعلي من لوحة الطالب.
        </p>

        <div
          className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-2"
          style={{ animationDelay: '180ms' }}
        >
          {LABS_METADATA.map((lab) => {
            const extra = LAB_EXTRAS[lab.id as LabId];
            if (!extra) return null;
            const Icon = extra.icon;
            return (
              <a
                key={lab.id}
                href={`#${lab.id}`}
                className="glass-surface inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium text-[#0A1630] transition-all hover:-translate-y-0.5 hover:shadow-soft dark:text-white"
              >
                <Icon className="h-4 w-4 text-[#2563EB]" />
                {extra.label}
              </a>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 md:pb-20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="shadow-soft rounded-[28px] border border-[#E2E8F0] bg-white p-6 dark:border-[#1E325C] dark:bg-[#0A1630]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-tabular text-4xl font-bold text-[#E2E8F0] dark:text-[#1E325C]">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#0A1630] dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-[1.8] text-[#475569] dark:text-[#CBD5E1]">{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* LAB EXPLAINERS */}
      <section className="relative mx-auto max-w-6xl space-y-6 px-4 pb-16 sm:px-6 md:space-y-8 md:pb-24">
        <div className="mb-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#0A1630] sm:text-4xl dark:text-white">
            ماذا ستتعلم في كل مختبر؟
          </h2>
          <p className="mt-3 text-sm text-[#475569] sm:text-base dark:text-[#CBD5E1]">
            شرح مختصر لكل مختبر: الهدف، المهارات، والنتيجة التي ستخرج بها.
          </p>
        </div>

        {LABS_METADATA.map((lab, idx) => {
          const extra = LAB_EXTRAS[lab.id as LabId];
          if (!extra) return null;
          const Icon = extra.icon;
          const reversed = idx % 2 === 1;

          return (
            <article
              key={lab.id}
              id={lab.id}
              className="shadow-soft scroll-mt-28 overflow-hidden rounded-[32px] border border-[#E2E8F0] bg-white dark:border-[#1E325C] dark:bg-[#0A1630]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className={`p-6 sm:p-9 ${reversed ? 'lg:order-2' : ''}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${extra.tone} text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.7)]`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="font-tabular text-xs font-semibold text-[#2563EB]">
                        المختبر 0{idx + 1}
                      </span>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{extra.duration}</p>
                    </div>
                  </div>

                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#0A1630] sm:text-3xl dark:text-white">
                    {lab.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.9] text-[#475569] sm:text-base dark:text-[#CBD5E1]">
                    {lab.description}
                  </p>

                  <div className="mt-6">
                    <p className="text-xs font-bold text-[#0A1630] dark:text-white">المهارات التي ستتدرب عليها</p>
                    <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {lab.skillsLearned.map((skill) => (
                        <li
                          key={skill}
                          className="flex items-center gap-2 rounded-2xl bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0A1630] dark:bg-[#070D1F] dark:text-[#E2E8F0]"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 rounded-[20px] border border-[#2563EB]/15 bg-[#2563EB]/[0.04] p-4 dark:border-[#2563EB]/30 dark:bg-[#2563EB]/10">
                    <p className="text-xs font-bold text-[#2563EB]">النتيجة</p>
                    <p className="mt-1 text-sm leading-[1.8] text-[#0A1630] dark:text-[#E2E8F0]">{extra.outcome}</p>
                    <p className="mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
                      وسام الإتمام: <span className="font-semibold text-[#0A1630] dark:text-white">{lab.badgeTitle}</span>
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-center bg-gradient-to-br from-[#F1F5F9] to-[#EEF2FF] p-6 sm:p-9 dark:from-[#070D1F] dark:to-[#0F1E3E] ${
                    reversed ? 'lg:order-1' : ''
                  }`}
                >
                  <div className="pointer-events-none w-full max-w-md select-none" aria-hidden="true">
                    <div className="rounded-[24px] bg-white/70 p-4 backdrop-blur dark:bg-[#0A1630]/70">
                      <p className="mb-1 text-center text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                        معاينة توضيحية
                      </p>
                      {extra.preview}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* BENEFITS */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6 md:pb-24">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="rounded-[24px] border border-[#E2E8F0] bg-white/80 p-5 backdrop-blur dark:border-[#1E325C] dark:bg-[#0A1630]/80"
              >
                <Icon className="h-5 w-5 text-[#2563EB]" />
                <p className="mt-3 text-sm font-bold text-[#0A1630] dark:text-white">{b.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">{b.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 md:pb-28">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0A1630] via-[#13254D] to-[#1D4ED8] p-8 text-center text-white sm:p-14">
          <div aria-hidden="true" className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#3B82F6]/30 blur-3xl" />
          <div aria-hidden="true" className="absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-[#6366F1]/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">جاهز تبدأ التدريب الفعلي؟</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-[1.8] text-[#CBD5E1] sm:text-base">
              {user
                ? 'افتح لوحتك واختر المختبر الذي تريد البدء به.'
                : 'أنشئ حساباً مجانياً، وستجد المختبرات الأربعة جاهزة في لوحة الطالب.'}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={startHref} className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-white px-8 text-[#0A1630] shadow-none hover:bg-[#F1F5F9] sm:w-auto">
                  <span>{user ? 'افتح لوحتي' : 'أنشئ حساباً مجانياً'}</span>
                  <ArrowUpLeft className="h-4 w-4" />
                </Button>
              </Link>
              {!user && (
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-white/25 bg-white/5 px-8 text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto dark:bg-white/5"
                  >
                    لدي حساب
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
