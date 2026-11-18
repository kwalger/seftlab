import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  ChevronLeft,
  FileText,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { getBreadcrumbJsonLd, safeJsonLdStringify } from '@/lib/seo/json-ld';
import { cn } from '@/lib/utils';
import {
  FOUNDER_ENGLISH_TITLE,
  FOUNDER_NAME,
  FOUNDER_TITLE,
  FounderPortrait,
} from '@/components/legal/founder-portrait';

export interface LegalNavItem {
  href: '/about' | '/privacy' | '/terms' | '/disclaimer' | '/seo';
  label: string;
}

const LEGAL_NAV_ITEMS: LegalNavItem[] = [
  { href: '/about', label: 'عن المنصة والمؤسس' },
  { href: '/privacy', label: 'سياسة الخصوصية' },
  { href: '/terms', label: 'الشروط والأحكام' },
  { href: '/disclaimer', label: 'إخلاء المسؤولية' },
  { href: '/seo', label: 'مركز SEO والأرشفة' },
];

interface LegalShellProps {
  activePath: '/about' | '/privacy' | '/terms' | '/disclaimer' | '/seo';
  title: string;
  subtitle: string;
  documentCode: string;
  effectiveDate: string;
  jurisdiction?: string;
  children: React.ReactNode;
}

export function LegalShell({
  activePath,
  title,
  subtitle,
  documentCode,
  effectiveDate,
  jurisdiction = 'المملكة الأردنية الهاشمية — اختصاص محاكم عمّان',
  children,
}: LegalShellProps) {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: title, path: activePath },
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav
        aria-label="مسار التنقل"
        className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]"
      >
        <Link
          href="/"
          className="transition-colors hover:text-[#2F6BFF]"
        >
          الرئيسية
        </Link>
        <ChevronLeft className="h-3.5 w-3.5 stroke-[1.75]" />
        <span>الحوكمة والوثائق القانونية</span>
        <ChevronLeft className="h-3.5 w-3.5 stroke-[1.75]" />
        <span className="font-medium text-[#0A1630] dark:text-[#FAFBFC]">
          {title}
        </span>
      </nav>

      {/* Quick Switcher across Initiative & Legal Pages */}
      <div
        role="navigation"
        aria-label="تنقل الوثائق القانونية والمبادرة"
        className="mb-6 flex flex-wrap gap-2 rounded-[24px] border border-[#E3E8F0] bg-white p-2 dark:border-[#1E325C] dark:bg-[#0A1630]"
      >
        {LEGAL_NAV_ITEMS.map((item) => {
          const isActive = item.href === activePath;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex min-h-[42px] flex-1 items-center justify-center rounded-[18px] px-3.5 py-2 text-center text-xs font-medium whitespace-nowrap transition-all sm:flex-none sm:text-sm',
                isActive
                  ? 'bg-[#0A1630] text-white shadow-sm dark:bg-[#2F6BFF]'
                  : 'text-[#64748B] hover:bg-[#FAFBFC] hover:text-[#0A1630] dark:text-[#94A3B8] dark:hover:bg-[#070D1F] dark:hover:text-[#FAFBFC]'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Institutional Legal Document Header */}
      <header className="rounded-[28px] border border-[#1E325C] bg-[#0A1630] p-6 text-[#FAFBFC] sm:p-10">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2F6BFF]/40 bg-[#2F6BFF]/15 px-3 py-1 text-xs font-medium text-[#8BB2FF]">
            <Scale className="h-3.5 w-3.5 stroke-[1.75]" />
            <span>منصة SEFT Lab (seftlab.com) — وثيقة رسمية ملزمة</span>
          </span>
          <span className="font-tabular rounded-full border border-[#1E325C] bg-[#070D1F] px-3 py-1 text-xs text-[#CBD5E1]">
            {documentCode}
          </span>
        </div>

        <h1
          className="mt-4 font-semibold tracking-tight text-white"
          style={{ fontSize: 'clamp(24px, 3.6vw, 40px)', lineHeight: 1.25 }}
        >
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#CBD5E1] sm:text-base">
          {subtitle}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#1E325C] pt-5 text-xs text-[#94A3B8] sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-[#2F6BFF]" />
            <span>تاريخ النفاذ والاعتماد: {effectiveDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-[#2F6BFF]" />
            <span>الجهة: منصة SEFT Lab (seftlab.com)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#2F6BFF]" />
            <span>{jurisdiction}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">{children}</div>

      {/* Executive Legal Sign-off Card */}
      <section
        aria-label="الاعتماد التنفيذي والمؤسسي للمبادرة"
        className="mt-8 rounded-[28px] border border-[#E3E8F0] bg-white p-5 sm:mt-10 sm:p-7 dark:border-[#1E325C] dark:bg-[#0A1630]"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <FounderPortrait
              className="h-20 w-20 shrink-0 rounded-[20px] border border-[#E3E8F0] dark:border-[#1E325C]"
              sizes="80px"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-semibold tracking-wider text-[#2F6BFF] uppercase">
                الاعتماد والإشراف العام للمبادرة
              </span>
              <h2 className="mt-0.5 text-base font-semibold text-[#0A1630] sm:text-lg dark:text-[#FAFBFC]">
                {FOUNDER_NAME}
              </h2>
              <p className="text-xs font-medium text-[#64748B] sm:text-sm dark:text-[#94A3B8]">
                {FOUNDER_TITLE}
              </p>
              <p className="font-tabular mt-0.5 text-[11px] text-[#94A3B8]">
                {FOUNDER_ENGLISH_TITLE}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
            <Link
              href="/about"
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-[#E3E8F0] bg-[#FAFBFC] px-4 py-2 text-xs font-medium text-[#0A1630] transition-colors hover:border-[#2F6BFF] hover:text-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]"
            >
              <span>ملف المبادرة والمؤسس</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <a
              href="mailto:hello@seftlab.com"
              className="inline-flex min-h-[42px] items-center rounded-full bg-[#2F6BFF] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1E56E8]"
            >
              التواصل القانوني: hello@seftlab.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

interface LegalArticleProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

export function LegalArticle({ number, title, children }: LegalArticleProps) {
  return (
    <article className="rounded-[24px] border border-[#E3E8F0] bg-white p-5 sm:p-7 dark:border-[#1E325C] dark:bg-[#0A1630]">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-[#E3E8F0] pb-3.5 dark:border-[#1E325C]">
        <span className="font-tabular inline-flex items-center rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-xs font-semibold text-[#2F6BFF]">
          {number}
        </span>
        <h2 className="text-base font-semibold text-[#0A1630] sm:text-lg dark:text-[#FAFBFC]">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-[1.9] text-[#334155] sm:text-[15px] dark:text-[#CBD5E1]">
        {children}
      </div>
    </article>
  );
}
