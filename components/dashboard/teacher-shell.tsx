'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Library,
  CheckSquare,
  FileSpreadsheet,
  FlaskConical,
  Megaphone,
  Settings,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { useTeacherStore } from '@/store/use-teacher-store';
import {
  DashboardAppShell,
  SidebarNavItem,
} from '@/components/dashboard/app-shell';

export function TeacherShell({ children }: { children: React.ReactNode }) {
  const { user } = useAppStore();
  const {
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    announcementDismissed,
    dismissAnnouncement,
    submissions,
  } = useTeacherStore();

  const teacherName =
    user?.role === 'teacher' && user.name ? user.name : 'د. محمد المعاقبه';
  const teacherOrg =
    user?.role === 'teacher' && user.organizationOrUniversity
      ? user.organizationOrUniversity
      : 'جامعة الزرقاء · كلية الأعمال - قسم المحاسبة';

  const needsReviewCount = submissions.filter(
    (s) => s.status === 'مُصحَّح آلياً' || s.status === 'مُسلَّم'
  ).length;

  const navItems: SidebarNavItem[] = [
    {
      label: 'الرئيسية',
      href: '/teacher',
      icon: LayoutDashboard,
    },
    {
      label: 'الشعب الدراسية',
      href: '/teacher/classes',
      icon: Users,
    },
    {
      label: 'الواجبات والتكاليف',
      href: '/teacher/assignments',
      icon: ClipboardCheck,
    },
    {
      label: 'مكتبة القوالب (40 قالب)',
      href: '/teacher/templates',
      icon: Library,
    },
    {
      label: 'التسليمات والمراجعة',
      href: '/teacher/assignments/asg-u1-comprehensive',
      icon: CheckSquare,
      badgeCount: needsReviewCount,
    },
    {
      label: 'سجل العلامات (Excel)',
      href: '/teacher/gradebook',
      icon: FileSpreadsheet,
    },
    {
      label: 'مختبر المحاسبة وبنك الأسئلة',
      href: '/labs/accounting',
      icon: FlaskConical,
    },
    {
      label: 'الإعلانات الدراسية',
      href: '/teacher/announcements',
      icon: Megaphone,
    },
    {
      label: 'الإعدادات',
      href: '/teacher/settings',
      icon: Settings,
    },
  ];

  return (
    <DashboardAppShell
      mode="teacher"
      identityName={teacherName}
      identitySubtitle={teacherOrg}
      avatarUrl={user?.avatarUrl || user?.photoURL}
      publicProfileHref="/labs"
      publicProfileLabel="عرض المختبرات التعليمية"
      navItems={navItems}
      notifications={notifications}
      onMarkAllNotificationsRead={markAllNotificationsRead}
      onMarkNotificationRead={markNotificationRead}
      bannerText="مكتبة القوالب الأكاديمية: يتوفر الآن 40 قالب واجب تطبيقي جاهز للنسخ والتخصيص في المختبرات الأربعة."
      bannerActionLabel="فتح مكتبة القوالب"
      bannerActionHref="/teacher/templates"
      bannerDismissed={announcementDismissed}
      onDismissBanner={dismissAnnouncement}
    >
      {children}
    </DashboardAppShell>
  );
}
