'use client';

import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  ClipboardList,
  FileSpreadsheet,
  Award,
  ListOrdered,
  Settings,
  School,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { useStudentDashboardStore } from '@/store/use-student-dashboard-store';
import { useTeacherStore } from '@/store/use-teacher-store';
import {
  DashboardAppShell,
  SidebarNavItem,
} from '@/components/dashboard/app-shell';

export function StudentShell({ children }: { children: React.ReactNode }) {
  const { currentStudent, user } = useAppStore();
  const {
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    bannerDismissed,
    dismissBanner,
  } = useStudentDashboardStore();
  const { assignments, submissions } = useTeacherStore();

  const currentUsername = user?.username || currentStudent.username;

  const pendingAssignmentsCount = assignments.filter((asg) => {
    if (asg.status !== 'منشور') return false;
    const sub = submissions.find(
      (s) =>
        s.assignmentId === asg.id &&
        s.studentUsername === currentUsername
    );
    return (
      !sub ||
      sub.status === 'لم يبدأ' ||
      sub.status === 'قيد الحل' ||
      sub.status === 'متأخر'
    );
  }).length;

  const navItems: SidebarNavItem[] = [
    // 1. مسار التعلم (الأساس)
    {
      label: 'الرئيسية (المنهاج)',
      href: '/student',
      icon: LayoutDashboard,
      section: 'مسار التعلم (الأساس)',
    },
    {
      label: 'القاعات',
      icon: School,
      children: [
        {
          label: 'القاعة',
          href: '/student/classrooms/classroom',
        },
        {
          label: 'الدكاترة',
          href: '/student/classrooms/professors',
        },
      ],
    },
    {
      label: 'التدريب العملي والمختبر',
      icon: FlaskConical,
      badgeCount: pendingAssignmentsCount,
      children: [
        {
          label: 'المختبر',
          children: [
            {
              label: 'مختبر المحاسبة المالية',
              href: '/student/labs/accounting',
            },
          ],
        },
        {
          label: 'التدريب العملي',
          badgeCount: pendingAssignmentsCount,
          children: [
            {
              label: 'تدرب على المحاسبة',
              href: '/student/assignments',
            },
          ],
        },
      ],
    },
    {
      label: 'بنك الامتحانات والمراجعة',
      href: '/student/exam-bank',
      icon: ClipboardList,
    },
    {
      label: 'الملخصات والقوانين',
      href: '/student/summaries',
      icon: FileSpreadsheet,
    },

    // 2. التفاعل والمتابعة (المتعة)
    {
      label: 'تقدمي والإنجازات',
      href: '/student/progress',
      icon: Award,
      section: 'التفاعل والمتابعة (المتعة)',
    },
    {
      label: 'المتصدرون (Leaderboard)',
      href: '/leaderboard',
      icon: ListOrdered,
    },
    {
      label: 'الإعدادات',
      href: '/student/settings',
      icon: Settings,
    },
  ];

  const displayName = user?.name || currentStudent.fullName;
  const displaySubtitle = user?.organizationOrUniversity || `${currentStudent.major} · ${currentStudent.university}`;
  const displayAvatar = user?.avatarUrl || user?.photoURL || currentStudent.avatarUrl;

  return (
    <DashboardAppShell
      mode="student"
      identityName={displayName}
      identitySubtitle={displaySubtitle}
      avatarUrl={displayAvatar}
      publicProfileHref={`/students/${user?.username || currentStudent.username}`}
      publicProfileLabel="عرض صفحتي العامة"
      navItems={navItems}
      notifications={notifications}
      onMarkAllNotificationsRead={markAllNotificationsRead}
      onMarkNotificationRead={markNotificationRead}
      bannerText="جديد: لديك تدريبات وواجبات عملية نشطة في مختبر المحاسبة المالية التطبيقي."
      bannerActionLabel="استعراض الواجبات العملية"
      bannerActionHref="/student/assignments"
      bannerDismissed={bannerDismissed}
      onDismissBanner={dismissBanner}
    >
      {children}
    </DashboardAppShell>
  );
}
