'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FOUNDER_NAME } from '@/components/legal/founder-portrait';
import { PWAInstallButton } from '@/components/pwa/pwa-install-button';
import { TadreebakLogo } from '@/components/shared/tadreebak-logo';

export function Footer() {
  const pathname = usePathname();
  if (
    pathname === '/student' ||
    pathname.startsWith('/student/') ||
    pathname === '/teacher' ||
    pathname.startsWith('/teacher/') ||
    pathname === '/company' ||
    pathname.startsWith('/company/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/')
  ) {
    return null;
  }

  return (
    <footer className="border-t border-[#E3E8F0] bg-[#0A1630] text-[#FAFBFC] dark:border-[#1E325C]">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:px-6 md:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              aria-label="SEFT Lab (seftlab.com) - الصفحة الرئيسية"
              className="inline-flex items-center"
            >
              <TadreebakLogo variant="horizontal" themeMode="dark" className="h-12 w-auto" />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-[1.8] text-[#CBD5E1]">
              منصة SEFT Lab العالمية (Skills, Experience, Future, Training — مهارات، خبرة، مستقبل، تدريب): مختبرات وجداول محاكاة عملية تبني للطلبة والخريجين سجلاً مهنياً موثقاً للجامعات والشركات.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <PWAInstallButton variant="footer" />
            </div>

            <div className="mt-5 flex flex-wrap gap-5 font-tabular text-xs text-[#94A3B8]">
              <span>عمّان &mdash; المملكة الأردنية الهاشمية</span>
              <span>hello@seftlab.com</span>
            </div>
          </div>

          {/* Labs Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
              المختبرات التفاعلية
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/labs/accounting"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  مختبر المحاسبة المالية
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/marketing"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  مختبر التسويق الرقمي
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/management"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  مختبر إدارة الأعمال
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/python"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  مختبر البرمجة (بايثون)
                </Link>
              </li>
            </ul>
          </div>

          {/* Students Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
              للطلاب
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/labs"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  كتالوج المختبرات
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  جدول المتصدرين
                </Link>
              </li>
              <li>
                <Link
                  href="/students/yazan-nabulsi"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  البروفايل المهني العام
                </Link>
              </li>
              <li>
                <Link
                  href="/student"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  لوحة الطالب
                </Link>
              </li>
            </ul>
          </div>

          {/* Companies Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
              للشركات
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/for-companies"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  بوابة الشركات
                </Link>
              </li>
              <li>
                <Link
                  href="/company"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  لوحة تحكم الشركة
                </Link>
              </li>
              <li>
                <Link
                  href="/company/talent"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  جدول البحث عن المواهب
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & SEO Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
              القانون والـ SEO
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  إخلاء المسؤولية
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="inline-flex min-h-[36px] items-center text-[#FAFBFC]/85 transition-colors hover:text-[#2F6BFF]"
                >
                  عن المنصة والمؤسس
                </Link>
              </li>
              <li>
                <Link
                  href="/seo"
                  className="inline-flex min-h-[36px] items-center font-medium text-[#8BB2FF] transition-colors hover:text-[#2F6BFF]"
                >
                  صفحة تصدر البحث (SEO)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-[#1E325C] pt-7 text-xs text-[#94A3B8] lg:flex-row lg:items-center">
          <p className="leading-relaxed">
            جميع الحقوق محفوظة &copy; 2026 منصة SEFT Lab (seftlab.com) &mdash; المؤسس والرئيس التنفيذي: {FOUNDER_NAME}
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            <Link href="/about" className="hover:text-[#FAFBFC]">
              عن المنصة
            </Link>
            <Link href="/privacy" className="hover:text-[#FAFBFC]">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-[#FAFBFC]">
              الشروط والأحكام
            </Link>
            <Link href="/disclaimer" className="hover:text-[#FAFBFC]">
              إخلاء المسؤولية
            </Link>
            <Link href="/seo" className="font-medium text-[#8BB2FF] hover:text-[#FAFBFC]">
              مركز SEO
            </Link>
            <Link href="/sitemap.xml" className="font-tabular hover:text-[#FAFBFC]">
              sitemap.xml
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
