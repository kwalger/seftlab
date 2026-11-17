'use client';

import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  Play,
  Award,
  ArrowUpLeft,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  ACCOUNTING_CURRICULUM,
  UNLOCK_THRESHOLD_PERCENT,
} from '@/lib/labs/accounting/curriculum';
import {
  getUnitCompletionStats,
  isUnitUnlocked,
  useAccountingLabStore,
} from '@/lib/labs/accounting/store';
import { UNIT1_BYPASS_QUESTIONS } from '@/lib/labs/accounting/unit1-data';
import { UNIT1_LESSONS_META } from '@/lib/labs/accounting/unit1-lessons';
import { UNIT2_LESSONS_META } from '@/lib/labs/accounting/unit2-data';
import { UNIT3_LESSONS_META } from '@/lib/labs/accounting/unit3-lessons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CurriculumMapProps {
  onOpenUnit: (unitNumber: number) => void;
}

export function CurriculumMap({ onOpenUnit }: CurriculumMapProps) {
  const {
    completedExerciseIds,
    bypassedUnits,
    unitExamResults,
    unit1CompletedLessons,
    unit1CurrentLesson,
    unit2CompletedLessons = [],
    unit2CurrentLesson = 1,
    unit3CompletedLessons = [],
    unit3CurrentLesson = 1,
    passBypassExamForUnit,
  } = useAccountingLabStore();

  const [bypassUnitTarget, setBypassUnitTarget] = useState<number | null>(null);
  const [bypassAnswers, setBypassAnswers] = useState<Record<string, string>>({});
  const [bypassFeedback, setBypassFeedback] = useState<string | null>(null);
  const [selectedUnitRoadmap, setSelectedUnitRoadmap] = useState<1 | 2 | 3>(1);

  const handleSubmitBypass = () => {
    if (!bypassUnitTarget) return;
    const total = UNIT1_BYPASS_QUESTIONS.length;
    const correctCount = UNIT1_BYPASS_QUESTIONS.filter(
      (q) => bypassAnswers[q.id] === q.correctOptionId
    ).length;

    if (correctCount >= 3) {
      passBypassExamForUnit(bypassUnitTarget);
      setBypassFeedback(
        `أحسنت! أجبت عن ${correctCount} من ${total} بشكل صحيح. تم فتح الوحدة ${bypassUnitTarget} فوراً.`
      );
      setTimeout(() => {
        const target = bypassUnitTarget;
        setBypassUnitTarget(null);
        setBypassAnswers({});
        setBypassFeedback(null);
        onOpenUnit(target);
      }, 900);
    } else {
      setBypassFeedback(
        `حصلت على ${correctCount} من ${total}. يلزم 3 إجابات صحيحة على الأقل لاجتياز اختبار التجاوز، أو يمكنك إكمال 70% من تمارين الوحدة السابقة.`
      );
    }
  };

  const activeUnits = ACCOUNTING_CURRICULUM.filter((u) => u.isImplementedInPhase1);
  const upcomingUnits = ACCOUNTING_CURRICULUM.filter((u) => !u.isImplementedInPhase1);

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h2 className="text-lg font-bold text-[#0A1630] sm:text-xl dark:text-white">
          وحدات المنهاج
        </h2>
        <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
          ابدأ بالوحدة الأولى. تُفتح كل وحدة بعد إنجاز {UNLOCK_THRESHOLD_PERCENT}% من التي قبلها.
        </p>
      </div>

      {/* اختبار التجاوز التفاعلي */}
      {bypassUnitTarget !== null && (
        <div className="rounded-[28px] border-2 border-[#2F6BFF] bg-white p-4 sm:p-6 dark:bg-[#0A1630]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3E8F0] pb-3 dark:border-[#1E325C]">
            <div>
              <h3 className="text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
                اختبار تجاوز لفتح الوحدة {bypassUnitTarget}
              </h3>
              <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
                أجب عن 3 من أصل {UNIT1_BYPASS_QUESTIONS.length} أسئلة بشكل صحيح لإثبات تمكنك من الوحدة السابقة.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setBypassUnitTarget(null);
                setBypassAnswers({});
                setBypassFeedback(null);
              }}
            >
              إلغاء
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {UNIT1_BYPASS_QUESTIONS.map((q, idx) => (
              <div
                key={q.id}
                className="space-y-2 rounded-[20px] border border-[#E3E8F0] bg-[#FAFBFC] p-3.5 dark:border-[#1E325C] dark:bg-[#070D1F]"
              >
                <p className="text-xs font-semibold text-[#0A1630] sm:text-sm dark:text-[#FAFBFC]">
                  {idx + 1}. {q.prompt}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((opt) => {
                    const selected = bypassAnswers[q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setBypassAnswers((prev) => ({
                            ...prev,
                            [q.id]: opt.id,
                          }))
                        }
                        className={cn(
                          'min-h-[42px] rounded-2xl border px-3 py-2 text-right text-xs transition-colors',
                          selected
                            ? 'border-[#2F6BFF] bg-[#2F6BFF]/12 font-semibold text-[#2F6BFF]'
                            : 'border-[#E3E8F0] bg-white text-[#0A1630] hover:border-[#2F6BFF]/50 dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]'
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {bypassFeedback && (
            <p className="mt-3 rounded-2xl border border-[#2F6BFF]/30 bg-[#2F6BFF]/10 px-3.5 py-2.5 text-xs font-medium text-[#0A1630] dark:text-[#FAFBFC]">
              {bypassFeedback}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              disabled={
                Object.keys(bypassAnswers).length < UNIT1_BYPASS_QUESTIONS.length
              }
              onClick={handleSubmitBypass}
            >
              تصحيح اختبار التجاوز
            </Button>
          </div>
        </div>
      )}

      {/* الوحدات المتاحة: بطاقات واضحة بزر واحد */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {activeUnits.map((unit) => {
          const unlocked = isUnitUnlocked({
            unitNumber: unit.unitNumber,
            completedExerciseIds,
            bypassedUnits,
          });
          const stats = getUnitCompletionStats(
            unit.unitNumber,
            completedExerciseIds
          );
          const examRecord = unitExamResults[unit.unitNumber];
          const canBypass = !unlocked && unit.unitNumber === 2;
          const done = stats.percent >= 100;

          return (
            <div
              key={unit.id}
              className={cn(
                'group flex flex-col justify-between rounded-[28px] border p-5 transition-all duration-300 sm:p-6',
                unlocked
                  ? 'shadow-soft border-[#E2E8F0] bg-white hover:-translate-y-0.5 hover:border-[#2563EB]/40 dark:border-[#1E325C] dark:bg-[#0A1630]'
                  : 'border-dashed border-[#CBD5E1] bg-[#F8FAFC] dark:border-[#1E325C] dark:bg-[#070D1F]'
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      'font-tabular flex h-11 w-11 items-center justify-center rounded-2xl text-base font-bold',
                      done
                        ? 'bg-[#10B981] text-white'
                        : unlocked
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#E2E8F0] text-[#64748B] dark:bg-[#1E325C] dark:text-[#94A3B8]'
                    )}
                  >
                    {done ? <CheckCircle2 className="h-5 w-5" /> : unlocked ? unit.unitNumber : <Lock className="h-4 w-4" />}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    <Clock className="h-3.5 w-3.5" />
                    {unit.estimatedMinutes} دقيقة · {unit.exerciseCount} تمارين
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-[#0A1630] dark:text-white">
                  {unit.chapterTitle}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                  {unit.description}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {unlocked && (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">
                        {stats.completedCount} / {stats.totalCount}
                      </span>
                      <span className="font-tabular font-semibold text-[#0A1630] dark:text-white">
                        {stats.percent}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9] dark:bg-[#070D1F]">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          done ? 'bg-[#10B981]' : 'bg-[#2563EB]'
                        )}
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  {examRecord ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]">
                      <Award className="h-3.5 w-3.5" />
                      الاختبار: {examRecord.scorePct}%
                    </span>
                  ) : (
                    <span className="text-xs text-[#94A3B8]">
                      {unlocked ? (done ? 'مكتملة' : 'متاحة الآن') : `تُفتح عند ${UNLOCK_THRESHOLD_PERCENT}% من الوحدة السابقة`}
                    </span>
                  )}

                  {unlocked ? (
                    <Button
                      type="button"
                      onClick={() => onOpenUnit(unit.unitNumber)}
                      className="gap-1.5 px-5"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{stats.completedCount > 0 ? 'متابعة' : 'بدء الوحدة'}</span>
                      <ArrowUpLeft className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    canBypass && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBypassUnitTarget(unit.unitNumber)}
                        className="gap-1.5"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                        <span>اختبار تجاوز</span>
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* مسار دروس الوحدات المتصل رأسياً (الوحدة 1 والوحدة 2 وفق الكتاب الجامعي) */}
      <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-5 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        {/* شريط تبديل خريطة الوحدة */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4 dark:border-[#1E325C]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedUnitRoadmap(1)}
              className={cn(
                'rounded-2xl px-4 py-2 text-xs font-bold transition-all sm:text-sm',
                selectedUnitRoadmap === 1
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0A1630] dark:bg-[#070D1F] dark:text-[#94A3B8] dark:hover:text-white'
              )}
            >
              الوحدة الأولى: مدخل إلى علم المحاسبة (12 درساً)
            </button>
            <button
              type="button"
              onClick={() => setSelectedUnitRoadmap(2)}
              className={cn(
                'rounded-2xl px-4 py-2 text-xs font-bold transition-all sm:text-sm',
                selectedUnitRoadmap === 2
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0A1630] dark:bg-[#070D1F] dark:text-[#94A3B8] dark:hover:text-white'
              )}
            >
              الوحدة الثانية: تحليل العمليات المالية (7 مساقات)
            </button>
            <button
              type="button"
              onClick={() => setSelectedUnitRoadmap(3)}
              className={cn(
                'rounded-2xl px-4 py-2 text-xs font-bold transition-all sm:text-sm',
                selectedUnitRoadmap === 3
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0A1630] dark:bg-[#070D1F] dark:text-[#94A3B8] dark:hover:text-white'
              )}
            >
              الوحدة الثالثة: الدورة المحاسبية (7 مساقات)
            </button>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenUnit(selectedUnitRoadmap)}
            className="gap-1.5 text-xs"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>متابعة الوحدة {selectedUnitRoadmap}</span>
          </Button>
        </div>

        {selectedUnitRoadmap === 1 ? (
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
                خريطة دروس الوحدة الأولى (12 درساً)
              </h3>
              <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                مسار عمودي متسلسل: يفتح كل درس بعد إنهاء الدرس السابق وفق المنهاج الجامعي المعتمد.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {UNIT1_LESSONS_META.map((lesson) => {
                const gradedCompleted = unit1CompletedLessons.filter((n) => n >= 1);
                const highestDone =
                  gradedCompleted.length > 0 ? Math.max(...gradedCompleted) : 0;
                const needsOverview = !unit1CompletedLessons.includes(0);
                const isDone = unit1CompletedLessons.includes(lesson.lessonNumber);
                const isUnlocked =
                  lesson.lessonNumber === 0
                    ? true
                    : lesson.isAvailable && lesson.lessonNumber <= highestDone + 1;
                const isCurrent =
                  lesson.lessonNumber === 0
                    ? !isDone && needsOverview
                    : lesson.isAvailable &&
                      !isDone &&
                      !needsOverview &&
                      lesson.lessonNumber ===
                        Math.min(4, Math.max(1, unit1CurrentLesson || 1));

                const statusText = isDone
                  ? 'مكتمل'
                  : isCurrent
                  ? 'الحالي'
                  : isUnlocked
                  ? 'متاح'
                  : 'مقفل';

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => onOpenUnit(1)}
                    className={cn(
                      'group relative flex w-full items-start gap-3.5 rounded-[22px] border p-4 text-right transition-all',
                      isCurrent
                        ? 'border-[#2563EB]/60 bg-[#2563EB]/[0.05] shadow-[0_8px_24px_-14px_rgba(37,99,235,0.4)] hover:border-[#2563EB]'
                        : isUnlocked
                        ? 'border-[#E2E8F0] bg-[#F8FAFC] hover:-translate-y-0.5 hover:border-[#2563EB]/50 hover:bg-white dark:border-[#1E325C] dark:bg-[#070D1F] dark:hover:bg-[#0A1630]'
                        : 'cursor-not-allowed border-[#E2E8F0]/70 bg-[#F8FAFC]/70 opacity-75 dark:border-[#1E325C]/60 dark:bg-[#070D1F]/60'
                    )}
                  >
                    <span
                      className={cn(
                        'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-tabular text-xs font-bold',
                        isDone
                          ? 'bg-[#10B981] text-white'
                          : isCurrent
                          ? 'bg-[#2563EB] text-white'
                          : isUnlocked
                          ? 'border border-[#E2E8F0] bg-white text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-white'
                          : 'bg-[#E2E8F0] text-[#64748B] dark:bg-[#1E325C] dark:text-[#94A3B8]'
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isUnlocked ? (
                        lesson.lessonNumber
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-[#0A1630] dark:text-white">
                          {lesson.title}
                        </p>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                            isDone
                              ? 'bg-[#10B981]/15 text-[#047857] dark:text-[#34D399]'
                              : isCurrent
                              ? 'bg-[#2563EB]/10 text-[#2563EB]'
                              : 'bg-white text-[#64748B] dark:bg-[#0A1630] dark:text-[#94A3B8]'
                          )}
                        >
                          {statusText}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                        {lesson.shortGoal}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 font-tabular text-[11px] font-medium text-[#526077] dark:bg-[#0A1630] dark:text-[#94A3B8]">
                          {lesson.estimatedMinutes} دقائق
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : selectedUnitRoadmap === 2 ? (
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
                خريطة مساقات الوحدة الثانية: تحليل العمليات المالية (7 مساقات)
              </h3>
              <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                مبنية وفق أهداف الفصل الثاني من الكتاب المعتمد: الدورة المحاسبية، العمليات المالية والتفرقة، معادلة الميزانية وأثرها، والقوائم المالية وترابطها.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {UNIT2_LESSONS_META.map((lesson) => {
                const u2Unlocked = isUnitUnlocked({
                  unitNumber: 2,
                  completedExerciseIds,
                  bypassedUnits,
                });
                const isExDone = (unit2CompletedLessons || []).includes(lesson.lessonNumber);
                const highestDone =
                  (unit2CompletedLessons || []).filter((n) => n >= 1).length > 0
                    ? Math.max(...(unit2CompletedLessons || []).filter((n) => n >= 1))
                    : 0;
                const isUnlocked =
                  u2Unlocked && (lesson.lessonNumber === 0 || lesson.lessonNumber <= highestDone + 1);
                const isCurrent =
                  u2Unlocked &&
                  !isExDone &&
                  (lesson.lessonNumber === 0
                    ? !(unit2CompletedLessons || []).includes(0)
                    : lesson.lessonNumber ===
                      Math.min(
                        UNIT2_LESSONS_META.filter((m) => m.lessonNumber >= 1).length,
                        Math.max(1, unit2CurrentLesson || 1)
                      ));

                const statusText = isExDone
                  ? 'مكتمل'
                  : isCurrent
                  ? 'الحالي'
                  : isUnlocked
                  ? 'متاح'
                  : 'مقفل';

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => onOpenUnit(2)}
                    className={cn(
                      'group relative flex w-full items-start gap-3.5 rounded-[22px] border p-4 text-right transition-all',
                      isExDone
                        ? 'border-[#10B981]/40 bg-[#10B981]/[0.03] hover:border-[#10B981]'
                        : isUnlocked
                        ? 'border-[#E2E8F0] bg-[#F8FAFC] hover:-translate-y-0.5 hover:border-[#2563EB]/50 hover:bg-white dark:border-[#1E325C] dark:bg-[#070D1F] dark:hover:bg-[#0A1630]'
                        : 'cursor-not-allowed border-[#E2E8F0]/70 bg-[#F8FAFC]/70 opacity-75 dark:border-[#1E325C]/60 dark:bg-[#070D1F]/60'
                    )}
                  >
                    <span
                      className={cn(
                        'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-tabular text-xs font-bold',
                        isExDone
                          ? 'bg-[#10B981] text-white'
                          : isUnlocked
                          ? 'border border-[#E2E8F0] bg-white text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-white'
                          : 'bg-[#E2E8F0] text-[#64748B] dark:bg-[#1E325C] dark:text-[#94A3B8]'
                      )}
                    >
                      {isExDone ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isUnlocked ? (
                        lesson.lessonNumber
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-[#0A1630] dark:text-white">
                          {lesson.title}
                        </p>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                            isExDone
                              ? 'bg-[#10B981]/15 text-[#047857] dark:text-[#34D399]'
                              : isUnlocked
                              ? 'bg-[#2563EB]/10 text-[#2563EB]'
                              : 'bg-[#E2E8F0] text-[#64748B] dark:bg-[#1E325C] dark:text-[#94A3B8]'
                          )}
                        >
                          {statusText}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                        {lesson.shortGoal}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 font-tabular text-[11px] font-medium text-[#526077] dark:bg-[#0A1630] dark:text-[#94A3B8]">
                          {lesson.estimatedMinutes} دقائق
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
                خريطة مساقات الوحدة الثالثة: الدورة المحاسبية (7 مساقات)
              </h3>
              <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                مبنية حرفياً وفق أهداف الفصل الثالث من الكتاب المعتمد: معرفة الطرف المدين والدائن، كيفية تسجيل العمليات وعمل قيود اليومية، معرفة دفتر اليومية وتقسيماته، التعرف على دفتر الأستاذ وتقسيماته، كيفية الترحيل إلى دفتر الأستاذ، كيفية الترصيد واستخراج أرصدة الحسابات، والتعرف على ميزان المراجعة.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {UNIT3_LESSONS_META.map((lesson) => {
                const u3Unlocked = isUnitUnlocked({
                  unitNumber: 3,
                  completedExerciseIds,
                  bypassedUnits,
                });
                const isExDone = (unit3CompletedLessons || []).includes(lesson.lessonNumber);
                const highestDone =
                  (unit3CompletedLessons || []).filter((n) => n >= 1).length > 0
                    ? Math.max(...(unit3CompletedLessons || []).filter((n) => n >= 1))
                    : 0;
                const isUnlocked =
                  u3Unlocked && (lesson.lessonNumber === 0 || lesson.lessonNumber <= highestDone + 1);
                const isCurrent =
                  u3Unlocked &&
                  !isExDone &&
                  (lesson.lessonNumber === 0
                    ? !(unit3CompletedLessons || []).includes(0)
                    : lesson.lessonNumber ===
                      Math.min(
                        UNIT3_LESSONS_META.filter((m) => m.lessonNumber >= 1).length,
                        Math.max(1, unit3CurrentLesson || 1)
                      ));

                const statusText = isExDone
                  ? 'مكتمل'
                  : isCurrent
                  ? 'الحالي'
                  : isUnlocked
                  ? 'متاح'
                  : 'مقفل';

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => onOpenUnit(3)}
                    className={cn(
                      'group relative flex w-full items-start gap-3.5 rounded-[22px] border p-4 text-right transition-all',
                      isExDone
                        ? 'border-[#10B981]/40 bg-[#10B981]/[0.03] hover:border-[#10B981]'
                        : isUnlocked
                        ? 'border-[#E2E8F0] bg-[#F8FAFC] hover:-translate-y-0.5 hover:border-[#2563EB]/50 hover:bg-white dark:border-[#1E325C] dark:bg-[#070D1F] dark:hover:bg-[#0A1630]'
                        : 'cursor-not-allowed border-[#E2E8F0]/70 bg-[#F8FAFC]/70 opacity-75 dark:border-[#1E325C]/60 dark:bg-[#070D1F]/60'
                    )}
                  >
                    <span
                      className={cn(
                        'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-tabular text-xs font-bold',
                        isExDone
                          ? 'bg-[#10B981] text-white'
                          : isUnlocked
                          ? 'border border-[#E2E8F0] bg-white text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-white'
                          : 'bg-[#E2E8F0] text-[#64748B] dark:bg-[#1E325C] dark:text-[#94A3B8]'
                      )}
                    >
                      {isExDone ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isUnlocked ? (
                        lesson.lessonNumber
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-[#0A1630] dark:text-white">
                          {lesson.title}
                        </p>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                            isExDone
                              ? 'bg-[#10B981]/15 text-[#047857] dark:text-[#34D399]'
                              : isUnlocked
                              ? 'bg-[#2563EB]/10 text-[#2563EB]'
                              : 'bg-[#E2E8F0] text-[#64748B] dark:bg-[#1E325C] dark:text-[#94A3B8]'
                          )}
                        >
                          {statusText}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                        {lesson.shortGoal}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 font-tabular text-[11px] font-medium text-[#526077] dark:bg-[#0A1630] dark:text-[#94A3B8]">
                          {lesson.estimatedMinutes} دقائق
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* الوحدات القادمة: قائمة مدمجة بدلاً من بطاقات كبيرة */}
      {upcomingUnits.length > 0 && (
        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-5 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0A1630] dark:text-white">وحدات قادمة</h3>
            <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-medium text-[#64748B] dark:bg-[#070D1F] dark:text-[#94A3B8]">
              قريباً
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {upcomingUnits.map((unit) => (
              <li
                key={unit.id}
                className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] px-3.5 py-3 dark:bg-[#070D1F]"
              >
                <span className="font-tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#94A3B8] dark:bg-[#0A1630]">
                  {unit.unitNumber}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-[#475569] dark:text-[#CBD5E1]">
                  {unit.chapterTitle}
                </span>
                <Lock className="h-3.5 w-3.5 shrink-0 text-[#CBD5E1] dark:text-[#475569]" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
