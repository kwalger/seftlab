import React, { cache } from 'react';
import type { Metadata } from 'next';
import { STUDENTS_DATA } from '@/data/mock-data';
import { StudentProfileClient } from '@/components/students/student-profile-client';
import { findStudentProfileServer } from '@/lib/firebase-admin';
import { normalizeStudentIdentifier } from '@/lib/student-profile';
import {
  getPersonJsonLd,
  getBreadcrumbJsonLd,
  safeJsonLdStringify,
} from '@/lib/seo/json-ld';
import { StudentTalent } from '@/types';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ username: string }>;
}

const resolveStudentServer = cache(
  async (usernameParam: string): Promise<StudentTalent | null> => {
    const { raw, normalized } = normalizeStudentIdentifier(usernameParam);
    if (!raw) return null;

    const firestoreMatch = await findStudentProfileServer(raw);
    if (firestoreMatch) {
      return firestoreMatch;
    }

    const staticMatch =
      STUDENTS_DATA.find(
        (s) => s.username.toLowerCase() === normalized || s.id === raw
      ) || null;

    return staticMatch;
  }
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const { raw } = normalizeStudentIdentifier(username);
  const student = await resolveStudentServer(username);

  if (!student) {
    return {
      title: `ملف الطالب (${raw || 'غير معروف'}) — SEFT Lab`,
      description:
        'استعرض الملف المهني الموثق لطلبة وخريجي منصة SEFT Lab التطبيقية.',
      alternates: {
        canonical: `/students/${encodeURIComponent(raw)}`,
      },
    };
  }

  return {
    title: `${student.fullName} — البروفايل المهني الموثق`,
    description: `${student.bio} — خريج ${student.university} تخصص ${student.major} بإجمالي ${student.totalXp} نقطة خبرة عملية في مختبرات SEFT Lab.`,
    alternates: {
      canonical: `/students/${student.username}`,
    },
    openGraph: {
      title: `${student.fullName} — البروفايل المهني في منصة SEFT Lab`,
      description: student.bio,
      type: 'profile',
    },
  };
}

export default async function StudentPublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const { raw } = normalizeStudentIdentifier(username);
  const student = await resolveStudentServer(username);

  const personJsonLd = student ? getPersonJsonLd(student) : null;
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'المتصدرون', path: '/leaderboard' },
    {
      name: student ? student.fullName : raw || 'ملف الطالب',
      path: student ? `/students/${student.username}` : `/students/${encodeURIComponent(raw)}`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(
            personJsonLd ? [breadcrumbJsonLd, personJsonLd] : [breadcrumbJsonLd]
          ),
        }}
      />
      <StudentProfileClient
        initialUsername={raw}
        initialStudent={student}
      />
    </>
  );
}
