'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Users,
  Building2,
  DoorOpen,
  ArrowUpLeft,
  Mail,
  MapPin,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/ui-kit';
import { Button } from '@/components/ui/button';
import { useTeacherStore } from '@/store/use-teacher-store';
import { useAppStore } from '@/store/use-app-store';

export default function ProfessorsPage() {
  const { classes } = useTeacherStore();
  const { currentStudent } = useAppStore();

  // جمع الدكاترة من الشعب التي انضم إليها الطالب
  const myClasses = classes.filter((cls) =>
    cls.studentUsernames?.includes(currentStudent.username)
  );

  // إزالة التكرار بناءً على teacherId
  const uniqueProfessors = myClasses.reduce<
    {
      id: string;
      name: string;
      subject: string;
      university: string;
      roomNumber: string;
      classes: string[];
    }[]
  >((acc, cls) => {
    const existing = acc.find((p) => p.id === cls.teacherId);
    if (existing) {
      existing.classes.push(cls.courseName);
    } else {
      acc.push({
        id: cls.teacherId,
        name: cls.teacherName,
        subject: cls.courseName,
        university: cls.university,
        roomNumber: cls.roomNumber || '201ق',
        classes: [cls.courseName],
      });
    }
    return acc;
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <PageHeader
        title="الدكاترة"
        description="أعضاء هيئة التدريس المرتبطون بشعبك الدراسية ومواعيد القاعات."
      />

      {uniqueProfessors.length === 0 ? (
        <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-10 text-center shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
          <GraduationCap className="mx-auto h-10 w-10 text-[#CBD5E1]" />
          <p className="mt-4 text-base font-bold text-[#0A1630] dark:text-white">
            لا يوجد دكاترة مرتبطون بك بعد
          </p>
          <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
            أدخل كود الشعبة في صفحة «القاعة» لتنضم وتظهر لك بيانات الدكتور.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {uniqueProfessors.map((prof) => (
            <div
              key={prof.id}
              className="flex flex-col justify-between gap-5 rounded-[26px] border border-[#E2E8F0] bg-white p-6 shadow-xs transition-all hover:border-[#2F6BFF]/40 dark:border-[#1E325C] dark:bg-[#0A1630]"
            >
              {/* الهوية */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2F6BFF] to-[#1E55E4] text-xl font-bold text-white shadow-xs">
                  {prof.name.charAt(3) || 'م'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0A1630] dark:text-white">
                    {prof.name}
                  </h2>
                  <p className="text-xs font-semibold text-[#2F6BFF]">
                    أستاذ المساق الجامعي
                  </p>
                </div>
              </div>

              {/* التفاصيل */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 rounded-[14px] bg-[#F8FAFC] px-3.5 py-2.5 text-xs dark:bg-[#070D1F]">
                  <Building2 className="h-4 w-4 shrink-0 text-[#2F6BFF]" />
                  <span className="font-semibold text-[#0A1630] dark:text-white">
                    {prof.university}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 rounded-[14px] bg-[#F8FAFC] px-3.5 py-2.5 text-xs dark:bg-[#070D1F]">
                  <MapPin className="h-4 w-4 shrink-0 text-[#2F6BFF]" />
                  <span className="text-[#475569] dark:text-[#CBD5E1]">
                    قاعة المحاضرات: <strong className="font-tabular text-[#2F6BFF]">{prof.roomNumber}</strong>
                  </span>
                </div>

                <div className="flex items-start gap-2.5 rounded-[14px] bg-[#F8FAFC] px-3.5 py-2.5 text-xs dark:bg-[#070D1F]">
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6BFF]" />
                  <div>
                    <p className="text-[#64748B] dark:text-[#94A3B8]">المواد الدراسية</p>
                    <p className="mt-0.5 font-bold text-[#0A1630] dark:text-white">
                      {prof.classes.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-[14px] bg-[#F8FAFC] px-3.5 py-2.5 text-xs dark:bg-[#070D1F]">
                  <Users className="h-4 w-4 shrink-0 text-[#2F6BFF]" />
                  <span className="text-[#475569] dark:text-[#CBD5E1]">
                    {prof.classes.length} شعبة جامعية مسجلة
                  </span>
                </div>
              </div>

              {/* زر الانتقال للقاعة ومحتواها */}
              <div className="pt-2 border-t border-[#F1F5F9] dark:border-[#1E325C]">
                <Link href="/student/classrooms/classroom" className="block">
                  <Button className="w-full gap-2 text-xs font-bold shadow-xs">
                    <DoorOpen className="h-4 w-4" />
                    <span>دخول القاعة واستعراض الملخصات والواجبات</span>
                    <ArrowUpLeft className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
