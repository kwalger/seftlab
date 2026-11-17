'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sun,
  Moon,
  List,
  ArrowUpLeft,
  ArrowRight,
  LogOut,
  FlaskConical,
  LayoutDashboard,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { PWAInstallButton } from '@/components/pwa/pwa-install-button';
import { TadreebakLogo } from '@/components/shared/tadreebak-logo';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ConfirmSheet } from '@/components/ui/confirm-sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function getPageTitle(pathname: string): string | null {
  if (pathname === '/') return null;
  if (pathname === '/labs') return 'المختبرات';
  if (pathname.startsWith('/labs/accounting')) return 'مختبر المحاسبة المالية';
  if (pathname.startsWith('/labs/marketing')) return 'مختبر التسويق الرقمي';
  if (pathname.startsWith('/labs/management')) return 'مختبر إدارة الأعمال';
  if (pathname.startsWith('/labs/python')) return 'مختبر البرمجة (بايثون)';
  if (pathname.startsWith('/leaderboard')) return 'المتصدرون';
  if (pathname.startsWith('/for-companies')) return 'بوابة الشركات';
  if (pathname.startsWith('/students/')) return 'البروفايل المهني';
  if (pathname === '/about') return 'عن المنصة والمؤسس';
  if (pathname === '/privacy') return 'سياسة الخصوصية';
  if (pathname === '/terms') return 'الشروط والأحكام';
  if (pathname === '/disclaimer') return 'إخلاء المسؤولية القانونية';
  if (pathname === '/seo') return 'مركز الأرشفة وتصدر البحث (SEO)';
  if (pathname === '/login') return 'تسجيل الدخول';
  if (pathname === '/register') return 'إنشاء حساب';
  if (pathname === '/~offline') return 'دون اتصال';
  return 'SEFT Lab';
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, theme, toggleTheme, logoutUser } = useAppStore();
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hiddenOnScroll, setHiddenOnScroll] = useState(false);

  const mobileOpen = mobileOpenPath === pathname;
  const setMobileOpen = (open: boolean) =>
    setMobileOpenPath(open ? pathname : null);

  const isDashboardRoute =
    pathname === '/student' ||
    pathname.startsWith('/student/') ||
    pathname === '/teacher' ||
    pathname.startsWith('/teacher/') ||
    pathname === '/company' ||
    pathname.startsWith('/company/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/');

  useEffect(() => {
    if (isDashboardRoute) return;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 16);

      if (currentY > 140 && currentY > lastScrollY + 8) {
        setHiddenOnScroll(true);
      } else if (currentY < lastScrollY - 8 || currentY <= 80) {
        setHiddenOnScroll(false);
      }
      lastScrollY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDashboardRoute]);

  if (isDashboardRoute) {
    return null;
  }

  const pageTitle = getPageTitle(pathname);

  const dashboardHref =
    user?.role === 'company'
      ? '/company'
      : user?.role === 'teacher'
      ? '/teacher'
      : '/student';

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/labs', label: 'المختبرات' },
    { href: '/leaderboard', label: 'المتصدرون' },
    { href: '/for-companies', label: 'للشركات' },
    { href: '/about', label: 'عن المنصة' },
    { href: dashboardHref, label: 'لوحتي' },
  ];

  const labShortcuts = [
    { href: '/labs#accounting', label: 'مختبر المحاسبة المالية' },
    { href: '/labs#marketing', label: 'مختبر التسويق الرقمي' },
    { href: '/labs#management', label: 'مختبر إدارة الأعمال' },
    { href: '/labs#python', label: 'مختبر البرمجة (بايثون)' },
  ];

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full px-3 pt-[calc(env(safe-area-inset-top)+10px)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-5',
          hiddenOnScroll && !mobileOpen ? '-translate-y-[130%]' : 'translate-y-0'
        )}
      >
        <div
          className={cn(
            'glass-surface mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 rounded-full ps-2.5 pe-2 transition-shadow duration-300 sm:ps-3 md:h-[60px] lg:gap-6',
            scrolled ? 'shadow-lift' : 'shadow-soft'
          )}
        >
          {/* Mobile Zone 1: Back + Title on subpages OR Brand Wordmark on Home */}
          <div className="flex min-w-0 items-center gap-2.5 md:hidden">
            {pageTitle ? (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  aria-label="رجوع"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E3E8F0] bg-white text-[#0A1630] active:scale-[0.97] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
                >
                  <ArrowRight className="h-4 w-4 stroke-[1.75]" />
                </button>
                <span className="truncate text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  {pageTitle}
                </span>
              </>
            ) : (
              <Link
                href="/"
                aria-label="SEFT Lab - seftlab.com - الصفحة الرئيسية"
                className="flex shrink-0 items-center whitespace-nowrap"
              >
                <TadreebakLogo variant="horizontal" themeMode="auto" className="h-9 w-auto" />
              </Link>
            )}
          </div>

          {/* Desktop/Tablet Brand Wordmark */}
          <Link
            href="/"
            aria-label="SEFT Lab - seftlab.com - الصفحة الرئيسية"
            className="hidden shrink-0 items-center whitespace-nowrap md:flex"
          >
            <TadreebakLogo variant="horizontal" themeMode="auto" className="h-10 w-auto" />
          </Link>

          {/* Desktop/Tablet Navigation Links */}
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden items-center gap-1 rounded-full bg-[#F1F5F9]/80 p-1 md:flex dark:bg-[#070D1F]/70"
          >
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 lg:px-4',
                    isActive
                      ? 'bg-white text-[#0A1630] shadow-[0_1px_3px_rgba(15,23,42,0.12)] dark:bg-[#1E325C] dark:text-white'
                      : 'text-[#526077] hover:text-[#0A1630] dark:text-[#94A3B8] dark:hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Max 2 action buttons on mobile (+ title/brand = max 3 items in Top Bar) */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E3E8F0] bg-white text-[#0A1630] transition-colors hover:border-[#2F6BFF] active:scale-[0.97] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 stroke-[1.5]" />
              ) : (
                <Moon className="h-4 w-4 stroke-[1.5]" />
              )}
            </button>

            {user ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href={dashboardHref}
                  className="max-w-[120px] truncate whitespace-nowrap rounded-full border border-[#E3E8F0] bg-white px-3.5 py-2 text-xs font-medium text-[#0A1630] hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
                >
                  {user.name}
                </Link>
                <button
                  type="button"
                  onClick={() => setLogoutConfirmOpen(true)}
                  aria-label="تسجيل الخروج"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E3E8F0] text-[#526077] hover:border-[#0A1630] hover:text-[#0A1630] dark:border-[#1E325C] dark:text-[#94A3B8] dark:hover:text-[#FAFBFC]"
                >
                  <LogOut className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:inline-flex">
                <Button size="sm">دخول</Button>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="فتح قائمة التطبيق"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E3E8F0] bg-white text-[#0A1630] active:scale-[0.97] md:hidden dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
            >
              <List className="h-4 w-4 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* Vaul Bottom Sheet Mobile Menu */}
      <BottomSheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title={user ? user.name : 'SEFT Lab'}
        description="المختبرات التفاعلية والانتقال السريع"
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#526077] dark:text-[#94A3B8]">
              <FlaskConical className="h-3.5 w-3.5 stroke-[1.5] text-[#2F6BFF]" />
              <span>تعرّف على المختبرات</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {labShortcuts.map((lab) => (
                <Link
                  key={lab.href}
                  href={lab.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex min-h-[44px] items-center rounded-full border px-3 py-2 text-xs font-medium transition-colors',
                    pathname === lab.href
                      ? 'border-[#2F6BFF] bg-[#2F6BFF]/10 text-[#2F6BFF]'
                      : 'border-[#E3E8F0] bg-[#FAFBFC] text-[#0A1630] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]'
                  )}
                >
                  {lab.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex min-h-[46px] items-center justify-between rounded-full px-3.5 py-2.5 text-sm font-medium',
                    isActive
                      ? 'bg-[#2F6BFF] text-white'
                      : 'border border-[#E3E8F0] bg-white text-[#0A1630] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]'
                  )}
                >
                  <span>{link.label}</span>
                  <ArrowUpLeft className="h-4 w-4 stroke-[1.5]" />
                </Link>
              );
            })}
          </div>

          <div className="space-y-2.5 border-t border-[#E3E8F0] pt-4 dark:border-[#1E325C]">
            <PWAInstallButton
              variant="menu"
              onAfterAction={() => setMobileOpen(false)}
            />

            {user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#0A1630] text-xs font-medium text-white dark:bg-[#2F6BFF]"
                >
                  <LayoutDashboard className="h-4 w-4 stroke-[1.5]" />
                  <span>فتح لوحتي</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setLogoutConfirmOpen(true);
                  }}
                  className="flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-[#E3E8F0] bg-white text-xs font-medium text-red-600 dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-red-400"
                >
                  <LogOut className="h-4 w-4 stroke-[1.5]" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block"
              >
                <Button className="min-h-[46px] w-full">
                  تسجيل الدخول / إنشاء حساب
                </Button>
              </Link>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <Link
                href="/privacy"
                onClick={() => setMobileOpen(false)}
                className="hover:text-[#2F6BFF]"
              >
                سياسة الخصوصية
              </Link>
              <span>•</span>
              <Link
                href="/terms"
                onClick={() => setMobileOpen(false)}
                className="hover:text-[#2F6BFF]"
              >
                الشروط والأحكام
              </Link>
              <span>•</span>
              <Link
                href="/disclaimer"
                onClick={() => setMobileOpen(false)}
                className="hover:text-[#2F6BFF]"
              >
                إخلاء المسؤولية
              </Link>
              <span>•</span>
              <Link
                href="/seo"
                onClick={() => setMobileOpen(false)}
                className="font-semibold text-[#2F6BFF] hover:underline"
              >
                مركز SEO
              </Link>
            </div>
          </div>
        </div>
      </BottomSheet>

      <ConfirmSheet
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="تسجيل الخروج"
        description="هل تريد تسجيل الخروج من جلسة التدريب الحالية؟"
        confirmLabel="تسجيل الخروج"
        destructive
        onConfirm={logoutUser}
      />
    </>
  );
}
