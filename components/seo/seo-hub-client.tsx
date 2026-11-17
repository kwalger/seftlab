'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowUpLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LABS_METADATA, STUDENTS_DATA } from '@/data/mock-data';
import { FOUNDER_NAME, FOUNDER_TITLE } from '@/components/legal/founder-portrait';

interface SeoHubClientProps {
  baseUrl: string;
}

const STRATEGIC_KEYWORDS = [
  'SEFT Lab',
  'منصة SEFT Lab',
  'seftlab.com',
  'حسن عبدالرحمن العرجان',
  'مختبر المحاسبة المالية التطبيقي',
  'مختبرات محاكاة عملية',
  'شركة افتراضية للطلاب',
  'التدريب العملي المحاسبي في الأردن',
  'بروفايل مهني موثق للخريجين',
  'ربط طلبة الجامعات بالشركات',
  'تعلم المحاسبة المالية من الصفر',
  'سياسة الخصوصية منصة SEFT Lab',
];

const CORE_SILO_LINKS = [
  {
    href: '/',
    title: 'الرئيسية — منصة SEFT Lab (seftlab.com)',
    anchor: 'تدرّب في شركة افتراضية واجعل نتائجك تتحدث عنك',
    group: 'الركيزة الأساسية',
  },
  {
    href: '/labs/accounting',
    title: 'مختبر المحاسبة المالية التطبيقي',
    anchor: 'تطبيق عملي للقيود اليومية ومعادلة الميزانية والقوائم المالية',
    group: 'المختبرات',
  },
  {
    href: '/labs',
    title: 'كتالوج المختبرات التفاعلية',
    anchor: 'جميع مسارات التدريب العملي في المحاسبة والتسويق والإدارة وبايثون',
    group: 'المختبرات',
  },
  {
    href: '/leaderboard',
    title: 'لوحة المتصدرين والكفاءات الموثقة',
    anchor: 'ترتيب المتدربين وفق الدرجات الفعلية والنزاهة الأكاديمية',
    group: 'الموهبة والتوظيف',
  },
  {
    href: '/for-companies',
    title: 'بوابة الشركات واستقطاب الخريجين',
    anchor: 'استكشاف الكفاءات الجامعية بناءً على نتائج المختبرات الموثقة',
    group: 'الموهبة والتوظيف',
  },
  {
    href: '/about',
    title: `عن منصة SEFT Lab والمؤسس ${FOUNDER_NAME}`,
    anchor: `${FOUNDER_TITLE} والرؤية التعليمية والقانونية`,
    group: 'الحوكمة والقانون',
  },
  {
    href: '/privacy',
    title: 'سياسة الخصوصية وحماية البيانات الشخصية',
    anchor: 'الالتزام بقانون حماية البيانات الشخصية الأردني رقم 24 لسنة 2023',
    group: 'الحوكمة والقانون',
  },
  {
    href: '/terms',
    title: 'الشروط والأحكام وضوابط الاستخدام القانونية',
    anchor: 'حماية حقوق الملكية الفكرية وضوابط استخدام مختبرات المحاكاة',
    group: 'الحوكمة والقانون',
  },
  {
    href: '/disclaimer',
    title: 'إخلاء المسؤولية وميثاق النزاهة الأكاديمية',
    anchor: 'ضوابط البيانات الافتراضية وميثاق النزاهة وملفات التخزين المحلي',
    group: 'الحوكمة والقانون',
  },
];

export function SeoHubClient({ baseUrl }: SeoHubClientProps) {
  const [originOverride, setOriginOverride] = useState<string | null>(null);
  const effectiveOrigin = useMemo(() => {
    if (originOverride) return originOverride;
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return baseUrl;
  }, [originOverride, baseUrl]);

  const copyValue = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`تم نسخ ${label} بنجاح`);
    } catch {
      toast.error('تعذر النسخ التلقائي؛ يمكنك التحديد والنسخ يدوياً');
    }
  };

  const sitemapUrl = `${effectiveOrigin}/sitemap.xml`;
  const robotsUrl = `${effectiveOrigin}/robots.txt`;

  const technicalAudits = [
    {
      title: 'خريطة الموقع الديناميكية (XML Sitemap)',
      status: 'مفعّلة ومحدثة تلقائياً',
      detail: 'تغطي الصفحة الرئيسية، المختبرات، الصفحات القانونية، وملفات الطلبة العامة.',
      target: '/sitemap.xml',
    },
    {
      title: 'توجيهات عناكب البحث (Robots.txt)',
      status: 'مهيأة بدقة',
      detail: 'تسمح بأرشفة الصفحات العامة وتمنع فهرسة مسارات لوحات التحكم الخاصة.',
      target: '/robots.txt',
    },
    {
      title: 'البيانات المنظمة (Schema.org JSON-LD)',
      status: 'موثقة بالكامل',
      detail: `تشمل المنظمة، المؤسس (${FOUNDER_NAME})، المساقات، الأسئلة الشائعة، ومسار التنقل.`,
      target: '/about',
    },
    {
      title: 'التوافق مع الهاتف والفهرسة أولاً (Mobile-First)',
      status: 'جاهزية 100%',
      detail: 'استجابة كاملة مع شاشات الهواتف، دعم RTL صريح، وروابط Canonical لكل وثيقة.',
      target: '/',
    },
  ];

  const publicStudents = STUDENTS_DATA.filter((s) => s.isPublicToCompanies);

  return (
    <div className="space-y-6">
      {/* Live Technical Readiness KPIs */}
      <section className="rounded-[28px] border border-[#E3E8F0] bg-white p-5 sm:p-7 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex flex-col gap-4 border-b border-[#E3E8F0] pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#1E325C]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-xs font-semibold text-[#2F6BFF]">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>جاهزية التصدر والأرشفة في محركات البحث</span>
            </span>
            <h2 className="mt-2.5 text-lg font-semibold text-[#0A1630] sm:text-xl dark:text-[#FAFBFC]">
              لوحة الفحص الذكي والأدوات الفورية للرفع في Google و Bing
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-[20px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-tabular text-xs font-bold">مؤشر الجاهزية التقنية: 100%</p>
              <p className="text-[11px] opacity-85">بنية دلالية صالحة للفهرسة الفورية</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {technicalAudits.map((audit) => (
            <div
              key={audit.title}
              className="rounded-[22px] border border-[#E3E8F0] bg-[#FAFBFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  {audit.title}
                </h3>
                <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  {audit.status}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                {audit.detail}
              </p>
              <div className="mt-3">
                <Link
                  href={audit.target}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6BFF] hover:underline"
                >
                  <span>معاينة المسار: {audit.target}</span>
                  <ArrowUpLeft className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Copyable Submission Toolkit */}
        <div className="mt-6 rounded-[22px] border border-[#E3E8F0] bg-[#FAFBFC] p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                أدوات الإرسال المباشر لمحركات البحث
              </h3>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                انسخ الروابط التالية وأضفها مباشرة في Google Search Console و Bing Webmaster Tools عند ربط النطاق الفعلي.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOriginOverride('https://seftlab.com')}
              className="self-start rounded-full border border-[#E3E8F0] bg-white px-3 py-1.5 text-[11px] font-medium text-[#0A1630] transition-colors hover:border-[#2F6BFF] sm:self-auto dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
            >
              تعيين النطاق الإنتاجي (seftlab.com)
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between gap-2 rounded-[16px] border border-[#E3E8F0] bg-white px-3.5 py-2.5 dark:border-[#1E325C] dark:bg-[#0A1630]">
              <div className="min-w-0">
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">رابط خريطة الموقع (Sitemap URL)</p>
                <p dir="ltr" className="font-tabular truncate text-xs font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  {sitemapUrl}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => copyValue('رابط خريطة الموقع', sitemapUrl)}
                className="shrink-0 gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>نسخ</span>
              </Button>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-[16px] border border-[#E3E8F0] bg-white px-3.5 py-2.5 dark:border-[#1E325C] dark:bg-[#0A1630]">
              <div className="min-w-0">
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">رابط ملف التوجيه (Robots.txt)</p>
                <p dir="ltr" className="font-tabular truncate text-xs font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  {robotsUrl}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => copyValue('رابط ملف Robots', robotsUrl)}
                className="shrink-0 gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>نسخ</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <a
              href="https://search.google.com/search-console/welcome"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#2F6BFF] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1E56E8]"
            >
              <Search className="h-3.5 w-3.5" />
              <span>فتح Google Search Console</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://www.bing.com/webmasters/about"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#E3E8F0] bg-white px-4 py-2 text-xs font-medium text-[#0A1630] transition-colors hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
            >
              <Globe className="h-3.5 w-3.5 text-[#2F6BFF]" />
              <span>فتح Bing Webmaster Tools</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#E3E8F0] bg-white px-4 py-2 text-xs font-medium text-[#0A1630] transition-colors hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#2F6BFF]" />
              <span>فحص النتائج الغنية (Rich Results Test)</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Strategic Keywords Cloud */}
      <section className="rounded-[28px] border border-[#E3E8F0] bg-white p-5 sm:p-7 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#0A1630] sm:text-lg dark:text-[#FAFBFC]">
              الحزمة الاستراتيجية للكلمات المفتاحية المستهدفة للتصدر
            </h2>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              مضمنة هيكلياً في العناوين الدلالية والبيانات الوصفية ومخططات Schema.org لرفع ترتيب المنصة والارتباط المباشر باسم المؤسس والمبادرة.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => copyValue('قائمة الكلمات المفتاحية', STRATEGIC_KEYWORDS.join('، '))}
            className="gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>نسخ الكلمات المفتاحية</span>
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STRATEGIC_KEYWORDS.map((kw) => (
            <span
              key={kw}
              className="rounded-full border border-[#E3E8F0] bg-[#FAFBFC] px-3.5 py-1.5 text-xs font-medium text-[#0A1630] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]"
            >
              {kw}
            </span>
          ))}
        </div>
      </section>

      {/* Semantic Internal Linking & HTML Sitemap */}
      <section className="rounded-[28px] border border-[#E3E8F0] bg-white p-5 sm:p-7 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <h2 className="text-base font-semibold text-[#0A1630] sm:text-lg dark:text-[#FAFBFC]">
          الفهرس الدلالي الكامل وروابط الأرشفة الداخلية (Semantic Link Silo)
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
          توفر هذه الخريطة مسار زحف مباشر لعناكب البحث لفهرسة كل صفحة أساسية ومختبر ووثيقة قانونية وملف مهني بأقوى إشارة دلالية.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_SILO_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[20px] border border-[#E3E8F0] bg-[#FAFBFC] p-4 transition-all hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]"
            >
              <span className="text-[11px] font-semibold text-[#2F6BFF]">
                {item.group}
              </span>
              <h3 className="mt-1 text-sm font-semibold text-[#0A1630] group-hover:text-[#2F6BFF] dark:text-[#FAFBFC]">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                {item.anchor}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-6 border-t border-[#E3E8F0] pt-5 dark:border-[#1E325C]">
          <h3 className="text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
            المختبرات والمسارات التدريبية المؤرشفة ({LABS_METADATA.length})
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {LABS_METADATA.map((lab) => (
              <Link
                key={lab.id}
                href={lab.slug}
                className="flex items-center justify-between rounded-[16px] border border-[#E3E8F0] bg-[#FAFBFC] px-4 py-3 text-xs transition-colors hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]"
              >
                <div>
                  <p className="font-semibold text-[#0A1630] dark:text-[#FAFBFC]">{lab.title}</p>
                  <p className="mt-0.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">{lab.subtitle}</p>
                </div>
                <ArrowUpLeft className="h-4 w-4 shrink-0 text-[#2F6BFF]" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-[#E3E8F0] pt-5 dark:border-[#1E325C]">
          <h3 className="text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
            الملفات المهنية العامة القابلة للأرشفة ({publicStudents.length})
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {publicStudents.map((student) => (
              <Link
                key={student.username}
                href={`/students/${student.username}`}
                className="rounded-full border border-[#E3E8F0] bg-[#FAFBFC] px-3.5 py-1.5 text-xs text-[#0A1630] transition-colors hover:border-[#2F6BFF] hover:text-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]"
              >
                {student.fullName} — {student.major}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
