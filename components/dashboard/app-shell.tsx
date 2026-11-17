'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpLeft,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
  Repeat,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { UserRole } from '@/types';
import { DashboardNotification } from '@/data/dashboard-mock-data';
import { DashboardCommandPalette } from '@/components/dashboard/command-palette';
import { PWAInstallButton } from '@/components/pwa/pwa-install-button';
import { TadreebakLogo } from '@/components/shared/tadreebak-logo';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ConfirmSheet } from '@/components/ui/confirm-sheet';
import { useKeyboardOffset } from '@/hooks/use-keyboard-offset';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const IS_DEV = process.env.NODE_ENV === 'development';

export interface SidebarNavSubItem {
  label: string;
  href: string;
  badgeCount?: number;
}

export interface SidebarNavGroup {
  label: string;
  badgeCount?: number;
  children: SidebarNavSubItem[];
}

export type SidebarNavChildItem = SidebarNavSubItem | SidebarNavGroup;

export interface SidebarNavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
  children?: SidebarNavChildItem[];
  section?: string;
  highlight?: boolean;
}

export function DashboardAppShell({
  mode,
  identityName,
  identitySubtitle,
  avatarUrl,
  publicProfileHref,
  publicProfileLabel,
  navItems,
  notifications,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  bannerText,
  bannerActionLabel,
  bannerActionHref,
  bannerDismissed,
  onDismissBanner,
  children,
}: {
  mode: UserRole;
  identityName: string;
  identitySubtitle: string;
  avatarUrl?: string;
  publicProfileHref: string;
  publicProfileLabel: string;
  navItems: SidebarNavItem[];
  notifications: DashboardNotification[];
  onMarkAllNotificationsRead: () => void;
  onMarkNotificationRead: (id: string) => void;
  bannerText: string;
  bannerActionLabel: string;
  bannerActionHref: string;
  bannerDismissed: boolean;
  onDismissBanner: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, switchRole, logoutUser } = useAppStore();
  const { isKeyboardOpen } = useKeyboardOffset(false);
  const isMobile = useIsMobile();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileSheetPath, setMobileSheetPath] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'الواجبات العملية': true,
    المختبرات: true,
    'التدريب العملي والمختبر': true,
    'التطبيق العملي (المختبر)': true,
  });
  const [openSubGroups, setOpenSubGroups] = useState<Record<string, boolean>>({
    المختبر: true,
    'التدريب العملي': true,
  });
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifPath, setNotifPath] = useState<string | null>(null);
  const [accountPath, setAccountPath] = useState<string | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const mobileSheetOpen = mobileSheetPath === pathname;
  const notifOpen = notifPath === pathname;
  const accountOpen = accountPath === pathname;

  const setMobileSheetOpen = (open: boolean) =>
    setMobileSheetPath(open ? pathname : null);

  const setNotifOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    setNotifPath((prev) => {
      const current = prev === pathname;
      const next = typeof val === 'function' ? val(current) : val;
      return next ? pathname : null;
    });
  };

  const setAccountOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    setAccountPath((prev) => {
      const current = prev === pathname;
      const next = typeof val === 'function' ? val(current) : val;
      return next ? pathname : null;
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleSubGroup = (label: string) => {
    setOpenSubGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSwitchDashboardRole = (targetRole?: UserRole) => {
    const nextRole =
      targetRole ||
      (mode === 'student'
        ? 'teacher'
        : mode === 'teacher'
        ? 'company'
        : 'student');
    switchRole(nextRole);
    setAccountOpen(false);
    setMobileSheetOpen(false);
    const home =
      nextRole === 'company'
        ? '/company'
        : nextRole === 'teacher'
        ? '/teacher'
        : nextRole === 'admin'
        ? '/admin'
        : '/student';
    router.push(`${home}?role=${nextRole}`);
  };

  const confirmAndLogout = () => {
    logoutUser();
    setAccountOpen(false);
    setMobileSheetOpen(false);
    router.push('/login');
  };

  const primaryBottomTabs = navItems
    .map((item) => {
      if (item.href) {
        return {
          label: item.label.split(' (')[0],
          href: item.href,
          icon: item.icon,
          badgeCount: item.badgeCount,
        };
      }
      if (item.children && item.children.length > 0) {
        const firstChild = item.children[0];
        const targetHref =
          'href' in firstChild && firstChild.href
            ? firstChild.href
            : 'children' in firstChild && firstChild.children && firstChild.children.length > 0
            ? firstChild.children[0].href
            : '/student/labs/accounting';
        return {
          label: item.label,
          href: targetHref,
          icon: item.icon,
          badgeCount: item.badgeCount,
        };
      }
      return null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .slice(0, 4);

  const isNavHrefActive = (href: string) => {
    if (
      href === '/student' ||
      href === '/teacher' ||
      href === '/company' ||
      href === '/admin'
    ) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isRootDashboard =
    pathname === '/student' ||
    pathname === '/teacher' ||
    pathname === '/company' ||
    pathname === '/admin';

  const renderNavLinks = (isIconOnly: boolean, isMobile = false) => {
    let previousSection: string | undefined = undefined;

    return (
      <nav aria-label="قائمة لوحة التحكم" className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const isGroupOpen = openGroups[item.label] ?? false;
          const isDirectActive = item.href ? isNavHrefActive(item.href) : false;
          const showSection = Boolean(item.section && item.section !== previousSection);
          if (item.section) {
            previousSection = item.section;
          }

          return (
            <React.Fragment key={item.href || item.label}>
              {showSection && (
                <div
                  suppressHydrationWarning
                  className={cn(
                    'px-3 pt-3.5 pb-1.5 text-[10.5px] font-bold tracking-wide transition-colors',
                    isMobile
                      ? 'text-[#526077] dark:text-[#94A3B8]'
                      : 'text-[#8BB2FF]/85',
                    isIconOnly && 'text-center px-0'
                  )}
                >
                  {!isIconOnly ? (
                    item.section
                  ) : (
                    <div className="mx-auto my-2 h-px w-5 bg-white/15" />
                  )}
                </div>
              )}

              {hasChildren ? (
                <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (isIconOnly) setCollapsed(false);
                      toggleGroup(item.label);
                    }}
                    className={cn(
                      'flex min-h-[44px] w-full items-center justify-between rounded-[16px] px-3.5 py-2.5 text-xs font-medium transition-all',
                      isMobile
                        ? 'border border-[#E3E8F0] bg-[#FAFBFC] text-[#0A1630] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]'
                        : 'text-[#CBD5E1] hover:bg-white/[0.06] hover:text-white',
                      isIconOnly && 'justify-center px-0'
                    )}
                    title={item.label}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 stroke-[1.5]" />
                      {!isIconOnly && <span>{item.label}</span>}
                    </span>
                    {!isIconOnly && (
                      <span className="flex items-center gap-2">
                        {typeof item.badgeCount === 'number' &&
                          item.badgeCount > 0 && (
                            <span
                              className={cn(
                                'font-tabular rounded-[6px] px-1.5 py-0.5 text-[11px] font-semibold',
                                isMobile
                                  ? 'bg-[#2F6BFF]/12 text-[#2F6BFF]'
                                  : 'bg-[#2F6BFF] text-white'
                              )}
                            >
                              {item.badgeCount}
                            </span>
                          )}
                        <ChevronDown
                          className={cn(
                            'h-3.5 w-3.5 stroke-[1.5] transition-transform',
                            isGroupOpen ? 'rotate-180' : ''
                          )}
                        />
                      </span>
                    )}
                  </button>

                  {!isIconOnly && isGroupOpen && (
                    <div
                      className={cn(
                        'mr-4 space-y-1 border-r pr-3',
                        isMobile
                          ? 'border-[#E3E8F0] dark:border-[#1E325C]'
                          : 'border-[#1E325C]'
                      )}
                    >
                      {item.children!.map((sub, subIdx) => {
                        const hasSubChildren =
                          'children' in sub &&
                          Array.isArray(sub.children) &&
                          sub.children.length > 0;

                        if (hasSubChildren) {
                          const isSubGroupOpen = openSubGroups[sub.label] ?? true;
                          return (
                            <div key={sub.label || subIdx} className="space-y-1 pt-1">
                              <button
                                type="button"
                                onClick={() => toggleSubGroup(sub.label)}
                                className={cn(
                                  'flex min-h-[34px] w-full items-center justify-between rounded-[12px] px-2.5 py-1.5 text-[11.5px] font-bold transition-all',
                                  isMobile
                                    ? 'text-[#334155] hover:bg-[#F1F5F9] dark:text-[#CBD5E1] dark:hover:bg-[#0E1A38]'
                                    : 'text-[#8BB2FF]/95 hover:bg-white/[0.04] hover:text-white'
                                )}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#2F6BFF]" />
                                  <span>{sub.label}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  {typeof sub.badgeCount === 'number' &&
                                    sub.badgeCount > 0 && (
                                      <span
                                        className={cn(
                                          'font-tabular rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold',
                                          isMobile
                                            ? 'bg-[#2F6BFF]/12 text-[#2F6BFF]'
                                            : 'bg-[#2F6BFF] text-white'
                                        )}
                                      >
                                        {sub.badgeCount}
                                      </span>
                                    )}
                                  <ChevronDown
                                    className={cn(
                                      'h-3 w-3 stroke-[2] text-[#94A3B8] transition-transform',
                                      isSubGroupOpen ? 'rotate-180' : ''
                                    )}
                                  />
                                </span>
                              </button>

                              {isSubGroupOpen && (
                                <div
                                  className={cn(
                                    'mr-2.5 space-y-1 border-r pr-2 my-0.5',
                                    isMobile
                                      ? 'border-[#E3E8F0] dark:border-[#1E325C]'
                                      : 'border-[#1E325C]'
                                  )}
                                >
                                  {sub.children!.map((child) => {
                                    const childActive = pathname === child.href;
                                    return (
                                      <Link
                                        key={child.href}
                                        href={child.href}
                                        onClick={() => setMobileSheetOpen(false)}
                                        className={cn(
                                          'flex min-h-[38px] items-center rounded-[12px] px-3 py-1.5 text-xs transition-all',
                                          childActive
                                            ? isMobile
                                              ? 'bg-[#2F6BFF]/10 font-semibold text-[#2F6BFF]'
                                              : 'bg-[#2F6BFF] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(47,107,255,0.55)]'
                                            : isMobile
                                            ? 'text-[#526077] dark:text-[#94A3B8]'
                                            : 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-white'
                                        )}
                                      >
                                        {child.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        const flatChild = sub as SidebarNavSubItem;
                        const subActive = pathname === flatChild.href;
                        return (
                          <Link
                            key={flatChild.href}
                            href={flatChild.href}
                            onClick={() => setMobileSheetOpen(false)}
                            className={cn(
                              'flex min-h-[42px] items-center rounded-[16px] px-3.5 py-2 text-xs transition-all',
                              subActive
                                ? isMobile
                                  ? 'bg-[#2F6BFF]/10 font-semibold text-[#2F6BFF]'
                                  : 'bg-[#2F6BFF] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(47,107,255,0.55)]'
                                : isMobile
                                ? 'text-[#526077] dark:text-[#94A3B8]'
                                : 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-white'
                            )}
                          >
                            {flatChild.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href || item.label}
                  href={item.href || '#'}
                  onClick={() => setMobileSheetOpen(false)}
                  title={item.label}
                  className={cn(
                    'relative flex min-h-[44px] items-center justify-between rounded-[16px] px-3.5 py-2.5 text-xs font-medium transition-all',
                    item.highlight
                      ? isDirectActive
                        ? 'bg-gradient-to-r from-[#1E56E8] to-[#2F6BFF] font-semibold text-white shadow-[0_8px_24px_-6px_rgba(47,107,255,0.6)]'
                        : isMobile
                        ? 'border border-[#2F6BFF]/30 bg-[#2F6BFF]/10 font-semibold text-[#2F6BFF] dark:bg-[#2F6BFF]/15 dark:text-[#8BB2FF]'
                        : 'border border-[#2F6BFF]/30 bg-[#2F6BFF]/15 font-semibold text-[#E0EAFF] hover:bg-[#2F6BFF]/25 hover:text-white shadow-xs'
                      : isMobile
                      ? isDirectActive
                        ? 'bg-[#2F6BFF] text-white'
                        : 'border border-[#E3E8F0] bg-white text-[#0A1630] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]'
                      : isDirectActive
                      ? 'bg-white/[0.08] font-semibold text-white shadow-xs'
                      : 'text-[#CBD5E1] hover:bg-white/[0.06] hover:text-white',
                    isIconOnly && 'justify-center px-0'
                  )}
                >
                  {!isMobile && isDirectActive && !item.highlight && (
                    <span className="absolute right-0 top-1.5 bottom-1.5 w-[3px] rounded-l-full bg-[#2F6BFF]" />
                  )}
                  <span className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 stroke-[1.5]',
                        !isMobile && isDirectActive ? 'text-[#2F6BFF]' : '',
                        item.highlight ? 'text-[#60A5FA]' : ''
                      )}
                    />
                    {!isIconOnly && <span>{item.label}</span>}
                  </span>
                  {!isIconOnly && typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                    <span
                      className={cn(
                        'font-tabular rounded-[6px] px-1.5 py-0.5 text-[11px] font-semibold',
                        isMobile && isDirectActive
                          ? 'bg-white text-[#2F6BFF]'
                          : 'bg-[#2F6BFF] text-white'
                      )}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  };

  const renderDesktopSidebar = () => {
    const isIconOnly = collapsed;

    return (
      <div className="flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-[#1E325C]/80 bg-gradient-to-b from-[#0A1630] to-[#0D1B3A] text-[#FAFBFC] shadow-[0_20px_50px_-20px_rgba(10,22,48,0.45)]">
        <div className="overflow-y-auto">
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <Link
              href="/"
              aria-label="SEFT Lab - الصفحة الرئيسية"
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
            >
              {isIconOnly ? (
                <TadreebakLogo variant="mark" className="h-9 w-9 shrink-0" />
              ) : (
                <>
                  <TadreebakLogo
                    variant="horizontal"
                    themeMode="dark"
                    className="h-9 w-auto shrink-0"
                  />
                  <span className="font-tabular rounded-[6px] border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-[#94A3B8]">
                    {mode.toUpperCase()}
                  </span>
                </>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={isIconOnly ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
              className="hidden rounded-full p-2 text-[#94A3B8] transition-colors hover:bg-white/[0.08] hover:text-white lg:inline-flex"
            >
              {isIconOnly ? (
                <ChevronLeft className="h-4 w-4 stroke-[1.5]" />
              ) : (
                <ChevronRight className="h-4 w-4 stroke-[1.5]" />
              )}
            </button>
          </div>

          <div className="px-3 py-4">{renderNavLinks(isIconOnly, false)}</div>
        </div>

        {/* User Profile Footer in Sidebar */}
        <div className="border-t border-white/10 p-3">
          {isIconOnly ? (
            <div className="flex flex-col items-center gap-2">
              <Link
                href={publicProfileHref}
                title={`${identityName} — ${publicProfileLabel}`}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#1E56E8] to-[#60A5FA] text-sm font-bold text-white shadow-md transition-transform hover:scale-105 overflow-hidden"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={identityName} className="h-full w-full object-cover" />
                ) : (
                  <span>{identityName.trim().charAt(0) || 'م'}</span>
                )}
                <span className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-[#0A1630] bg-[#10B981]" />
              </Link>
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                title="تسجيل الخروج"
                className="flex h-9 w-9 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-white/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4 stroke-[1.5]" />
              </button>
            </div>
          ) : (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#1E56E8] to-[#60A5FA] text-sm font-bold text-white shadow-md overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={identityName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{identityName.trim().charAt(0) || 'م'}</span>
                  )}
                  <span className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-[#0A1630] bg-[#10B981]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-xs font-bold text-white">
                      {identityName}
                    </p>
                    <span className="shrink-0 rounded-full bg-[#2F6BFF]/20 px-2 py-0.5 text-[9px] font-semibold text-[#8BB2FF]">
                      {mode === 'student'
                        ? 'طالب'
                        : mode === 'teacher'
                        ? 'معلم'
                        : mode === 'company'
                        ? 'شركة'
                        : 'أدمن'}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-[#94A3B8]">
                    {identitySubtitle}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 border-t border-white/5 pt-2.5">
                <Link
                  href={publicProfileHref}
                  className="inline-flex min-h-[32px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[#2F6BFF]/15 px-2.5 py-1 text-[11px] font-semibold text-[#8BB2FF] transition-colors hover:bg-[#2F6BFF]/25 hover:text-white"
                >
                  <span>{publicProfileLabel}</span>
                  <ExternalLink className="h-3 w-3 stroke-[1.5]" />
                </Link>
                <Link
                  href={
                    mode === 'student'
                      ? '/student/profile'
                      : mode === 'teacher'
                      ? '/teacher/classes'
                      : mode === 'company'
                      ? '/company/profile'
                      : '/admin/settings'
                  }
                  title="تعديل البروفايل"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#CBD5E1] transition-colors hover:bg-white/10 hover:text-white"
                >
                  <User className="h-3.5 w-3.5 stroke-[1.5]" />
                </Link>
                <button
                  type="button"
                  onClick={() => setLogoutConfirmOpen(true)}
                  title="تسجيل الخروج"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
                >
                  <LogOut className="h-3.5 w-3.5 stroke-[1.5]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const notificationsList = (onItemClick: () => void) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-[#E3E8F0] pb-2.5 dark:border-[#1E325C]">
        <span className="text-xs font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
          آخر الإشعارات ({unreadCount} غير مقروء)
        </span>
        <button
          type="button"
          onClick={onMarkAllNotificationsRead}
          className="min-h-[36px] text-xs font-medium text-[#2F6BFF] hover:underline"
        >
          تحديد الكل كمقروء
        </button>
      </div>
      <div className="divide-y divide-[#E3E8F0] dark:divide-[#1E325C]">
        {notifications.slice(0, 6).map((notif) => (
          <Link
            key={notif.id}
            href={notif.href}
            onClick={() => {
              onMarkNotificationRead(notif.id);
              onItemClick();
            }}
            className="block py-3 transition-colors hover:bg-[#F1F4F9]/60 dark:hover:bg-[#070D1F]/50"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'text-xs',
                  notif.read
                    ? 'font-medium text-[#526077] dark:text-[#94A3B8]'
                    : 'font-semibold text-[#0A1630] dark:text-[#FAFBFC]'
                )}
              >
                {notif.title}
              </span>
              <span className="font-tabular shrink-0 text-[11px] text-[#526077]">
                {notif.timeAgo}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#526077] dark:text-[#94A3B8]">
              {notif.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );

  const accountMenuContent = (onClose: () => void) => (
    <div className="space-y-1 text-xs">
      <div className="border-b border-[#E3E8F0] pb-3 dark:border-[#1E325C]">
        <p className="truncate text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
          {identityName}
        </p>
        <p className="truncate text-xs text-[#526077] dark:text-[#94A3B8]">
          {identitySubtitle}
        </p>
      </div>

      <Link
        href={
          mode === 'student'
            ? '/student/profile'
            : mode === 'teacher'
            ? '/teacher/classes'
            : mode === 'company'
            ? '/company/profile'
            : '/admin/settings'
        }
        onClick={onClose}
        className="flex min-h-[44px] items-center gap-2.5 rounded-[10px] px-3 py-2 text-[#0A1630] hover:bg-[#F1F4F9] dark:text-[#FAFBFC] dark:hover:bg-[#070D1F]"
      >
        <User className="h-4 w-4 stroke-[1.5]" />
        <span>
          {mode === 'student'
            ? 'بروفايلي المهني'
            : mode === 'teacher'
            ? 'إدارة الشعب'
            : mode === 'company'
            ? 'ملف الشركة'
            : 'إعدادات النظام'}
        </span>
      </Link>

      <Link
        href={
          mode === 'student'
            ? '/student/settings'
            : mode === 'teacher'
            ? '/teacher/settings'
            : mode === 'company'
            ? '/company/settings'
            : '/admin/settings'
        }
        onClick={onClose}
        className="flex min-h-[44px] items-center gap-2.5 rounded-[10px] px-3 py-2 text-[#0A1630] hover:bg-[#F1F4F9] dark:text-[#FAFBFC] dark:hover:bg-[#070D1F]"
      >
        <Settings className="h-4 w-4 stroke-[1.5]" />
        <span>الإعدادات</span>
      </Link>

      <button
        type="button"
        onClick={toggleTheme}
        className="flex min-h-[44px] w-full items-center justify-between rounded-[10px] px-3 py-2 text-[#0A1630] hover:bg-[#F1F4F9] dark:text-[#FAFBFC] dark:hover:bg-[#070D1F]"
      >
        <span className="flex items-center gap-2.5">
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 stroke-[1.5]" />
          ) : (
            <Moon className="h-4 w-4 stroke-[1.5]" />
          )}
          <span>المظهر</span>
        </span>
        <span className="text-[11px] text-[#526077]">
          {theme === 'dark' ? 'ليلي' : 'نهاري'}
        </span>
      </button>

      <div className="py-1">
        <PWAInstallButton variant="compact" className="w-full justify-start" />
      </div>

      <div className="border-t border-[#E3E8F0] pt-2 dark:border-[#1E325C]">
        <button
          type="button"
          onClick={() => {
            onClose();
            setLogoutConfirmOpen(true);
          }}
          className="flex min-h-[44px] w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4 stroke-[1.5]" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh w-full bg-[#F4F7FB] text-[#0A1630] dark:bg-[#050B18] dark:text-[#FAFBFC]">
      {/* Desktop Right Sidebar */}
      <aside
        className={cn(
          'sticky top-0 hidden h-dvh shrink-0 transition-all duration-200 lg:block lg:py-3 lg:pr-3',
          collapsed ? 'w-[88px]' : 'w-[280px]'
        )}
      >
        {renderDesktopSidebar()}
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Compact Top App Bar (56px mobile, 64px desktop) */}
        <header
          data-dashboard-header="true"
          className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-2 border-b border-[#E2E8F0]/90 bg-white/92 px-3 pt-[env(safe-area-inset-top)] shadow-[0_4px_20px_-10px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:top-3 sm:mx-6 sm:mt-3 sm:h-16 sm:rounded-[22px] sm:border sm:px-5 lg:mx-8 lg:gap-4 dark:border-[#1E325C] dark:bg-[#0A1630]/92"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {!isRootDashboard && (
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="رجوع"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E3E8F0] text-[#0A1630] active:scale-[0.97] lg:hidden dark:border-[#1E325C] dark:text-[#FAFBFC]"
              >
                <ArrowRight className="h-4 w-4 stroke-[1.5]" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              aria-label="فتح قائمة التنقل الكاملة"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E3E8F0] text-[#0A1630] active:scale-[0.97] lg:hidden dark:border-[#1E325C] dark:text-[#FAFBFC]"
            >
              <Menu className="h-4 w-4 stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              aria-label="البحث السريع"
              className="flex h-10 min-w-0 flex-1 max-w-md items-center justify-between rounded-full border border-[#E3E8F0] bg-[#F8FAFC] px-3.5 text-xs text-[#526077] transition-colors hover:border-[#2F6BFF] sm:px-4 dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#94A3B8]"
            >
              <span className="flex min-w-0 items-center gap-2 truncate">
                <Search className="h-4 w-4 shrink-0 stroke-[1.5]" />
                <span className="truncate">ابحث في الصفحات...</span>
              </span>
              <kbd className="font-tabular hidden rounded-full border border-[#E3E8F0] bg-white px-2 py-0.5 text-[11px] font-medium text-[#0A1630] sm:inline-block dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-[#E3E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-medium text-[#0A1630] transition-colors hover:border-[#2F6BFF] sm:inline-flex dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]"
            >
              <span>الموقع العام</span>
              <ExternalLink className="h-3.5 w-3.5 stroke-[1.5] text-[#526077]" />
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setAccountOpen(false);
                }}
                aria-label="الإشعارات"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E3E8F0] bg-[#F8FAFC] text-[#0A1630] transition-colors hover:border-[#2F6BFF] active:scale-[0.97] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]"
              >
                <Bell className="h-4 w-4 stroke-[1.5]" />
                {unreadCount > 0 && (
                  <span className="font-tabular absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2F6BFF] px-1 text-[10px] font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="hidden md:block absolute left-0 top-full z-50 mt-2 w-96 rounded-[24px] border border-[#E3E8F0] bg-white p-4 shadow-xl dark:border-[#1E325C] dark:bg-[#0A1630]">
                  {notificationsList(() => setNotifOpen(false))}
                </div>
              )}
            </div>

            {/* Account */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAccountOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                aria-label="قائمة الحساب"
                className="flex h-10 items-center gap-2 rounded-full border border-[#E3E8F0] bg-[#F8FAFC] px-2.5 text-xs font-medium text-[#0A1630] transition-colors hover:border-[#2F6BFF] active:scale-[0.97] sm:px-3.5 dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={identityName} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <User className="h-4 w-4 stroke-[1.5] text-[#2F6BFF]" />
                )}
                <span className="hidden max-w-[120px] truncate sm:inline">
                  {identityName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] text-[#526077]" />
              </button>

              {accountOpen && (
                <div className="hidden md:block absolute left-0 top-full z-50 mt-2 w-64 rounded-[24px] border border-[#E3E8F0] bg-white p-3.5 shadow-xl dark:border-[#1E325C] dark:bg-[#0A1630]">
                  {accountMenuContent(() => setAccountOpen(false))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dismissible Announcement Banner */}
        {!bannerDismissed && (
          <div
            data-dashboard-banner="true"
            className={cn(
              'mx-3 mt-3 rounded-[20px] border border-[#1E325C] bg-[#0A1630] px-4 py-2.5 text-xs text-[#FAFBFC] shadow-sm sm:mx-6 sm:px-6 lg:mx-8',
              pathname.includes('/labs') && 'hidden sm:block'
            )}
          >
            <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span>{bannerText}</span>
                <Link
                  href={bannerActionHref}
                  className="font-semibold text-[#60A5FA] underline-offset-4 hover:underline"
                >
                  {bannerActionLabel}
                </Link>
              </div>
              <button
                type="button"
                onClick={onDismissBanner}
                aria-label="إغلاق شريط الإعلان"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#94A3B8] hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5 stroke-[1.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <div
          data-dashboard-main="true"
          className="mx-auto w-full max-w-[1400px] min-w-0 flex-1 px-3 pt-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-5 lg:px-8 lg:py-6"
        >
          {children}
        </div>
      </div>

      {/* Floating Glass Capsule Bottom Tab Bar for Mobile & Tablet (< lg) */}
      {!isKeyboardOpen && (
        <div
          data-mobile-bottom-nav="true"
          className="pointer-events-none fixed inset-x-0 bottom-[max(10px,env(safe-area-inset-bottom))] z-40 mx-auto max-w-[392px] px-2.5 lg:hidden"
        >
          <nav
            aria-label="شريط التنقل السريع للوحة"
            className="pointer-events-auto flex h-[62px] items-center justify-around gap-0.5 rounded-[28px] border border-[#E3E8F0]/90 bg-white/92 px-1.5 shadow-[0_12px_32px_rgba(10,22,48,0.12)] backdrop-blur-xl dark:border-[#1E325C] dark:bg-[#0A1630]/92 dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          >
            {primaryBottomTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isNavHrefActive(tab.href);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-label={tab.label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-1 py-1.5 transition-all duration-150 active:scale-[0.96]',
                    active
                      ? 'bg-[#2F6BFF]/12 text-[#2F6BFF]'
                      : 'text-[#526077] hover:text-[#0A1630] dark:text-[#94A3B8] dark:hover:text-[#FAFBFC]'
                  )}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className="h-[18px] w-[18px] stroke-[1.75]" />
                    {typeof tab.badgeCount === 'number' && tab.badgeCount > 0 && (
                      <span className="font-tabular absolute -top-1.5 -left-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2F6BFF] px-1 text-[9px] font-semibold text-white">
                        {tab.badgeCount}
                      </span>
                    )}
                  </div>
                  <span className="w-full truncate text-center text-[10px] font-semibold leading-none">
                    {tab.label}
                  </span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              aria-label="المزيد"
              className={cn(
                'flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-1 py-1.5 transition-all duration-150 active:scale-[0.96]',
                mobileSheetOpen
                  ? 'bg-[#2F6BFF]/12 text-[#2F6BFF]'
                  : 'text-[#526077] hover:text-[#0A1630] dark:text-[#94A3B8] dark:hover:text-[#FAFBFC]'
              )}
            >
              <LayoutGrid className="h-[18px] w-[18px] stroke-[1.75]" />
              <span className="w-full truncate text-center text-[10px] font-semibold leading-none">
                المزيد
              </span>
            </button>
          </nav>
        </div>
      )}

      {/* Vaul Bottom Sheet for Full Dashboard Drawer on < lg */}
      <BottomSheet
        open={mobileSheetOpen}
        onOpenChange={setMobileSheetOpen}
        title={identityName}
        description={identitySubtitle}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center border-b border-[#E3E8F0] pb-3 dark:border-[#1E325C]">
            <Link
              href="/"
              onClick={() => setMobileSheetOpen(false)}
              aria-label="SEFT Lab - الصفحة الرئيسية"
              className="inline-flex items-center"
            >
              <TadreebakLogo variant="horizontal" themeMode="auto" className="h-8 w-auto" />
            </Link>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-[12px] border border-[#E3E8F0] bg-[#FAFBFC] p-3 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <Link
              href={publicProfileHref}
              onClick={() => setMobileSheetOpen(false)}
              className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium text-[#2F6BFF]"
            >
              <span>{publicProfileLabel}</span>
              <ExternalLink className="h-3.5 w-3.5 stroke-[1.5]" />
            </Link>
            <Link
              href="/"
              onClick={() => setMobileSheetOpen(false)}
              className="inline-flex min-h-[36px] items-center gap-1 text-xs text-[#526077] dark:text-[#94A3B8]"
            >
              <span>الموقع العام</span>
              <ArrowUpLeft className="h-3.5 w-3.5 stroke-[1.5]" />
            </Link>
          </div>

          {renderNavLinks(false, true)}

          <div className="space-y-2.5 border-t border-[#E3E8F0] pt-4 dark:border-[#1E325C]">
            <PWAInstallButton variant="menu" />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#E3E8F0] bg-white text-xs font-medium text-[#0A1630] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 stroke-[1.5]" />
                ) : (
                  <Moon className="h-4 w-4 stroke-[1.5]" />
                )}
                <span>{theme === 'dark' ? 'النهاري' : 'الليلي'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileSheetOpen(false);
                  setLogoutConfirmOpen(true);
                }}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#E3E8F0] bg-white text-xs font-medium text-red-600 dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-red-400"
              >
                <LogOut className="h-4 w-4 stroke-[1.5]" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Vaul Bottom Sheet for Notifications on < md */}
      <BottomSheet
        open={notifOpen && isMobile}
        onOpenChange={(open) => setNotifOpen(open)}
        title="الإشعارات"
      >
        {notificationsList(() => setNotifOpen(false))}
      </BottomSheet>

      {/* Vaul Bottom Sheet for Account Menu on < md */}
      <BottomSheet
        open={accountOpen && isMobile}
        onOpenChange={(open) => setAccountOpen(open)}
        title="حسابي والإعدادات"
      >
        {accountMenuContent(() => setAccountOpen(false))}
      </BottomSheet>

      {/* Confirm Logout Sheet */}
      <ConfirmSheet
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="تسجيل الخروج"
        description="هل تريد إنهاء جلستك الحالية والعودة إلى صفحة تسجيل الدخول؟"
        confirmLabel="خروج"
        destructive
        onConfirm={confirmAndLogout}
      />

      {/* Command Palette (Ctrl+K) */}
      <DashboardCommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        mode={mode}
      />
    </div>
  );
}
