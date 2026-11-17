'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileSpreadsheet,
  FolderOpen,
  Lock,
  Play,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAccountingLabStore } from '@/lib/labs/accounting/store';
import { UNIT2_EXAM_QUESTIONS } from '@/lib/labs/accounting/unit2-data';
import {
  loadUnit2Lesson,
  UNIT2_GLOSSARY_TERMS,
  UNIT2_LESSONS_META,
  UNIT2_QUICK_QUIZZES,
} from '@/lib/labs/accounting/unit2-lessons';
import type { QuickQuizConfig, UnitLessonData } from '@/lib/labs/accounting/unit1-lessons/types';
import { LessonPlayer } from '@/components/labs/accounting/lesson-player';
import { VideoPlayer } from '@/components/labs/accounting/video-player';
import { useAppStore } from '@/store/use-app-store';
import { triggerHaptic } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Unit2IntroProps {
  initialExerciseId?: string | null;
  onBackToMap: () => void;
  onUnlockUnit3?: () => void;
}

type Unit2ScreenMode =
  | 'home'
  | 'overview'
  | 'lesson'
  | 'quiz'
  | 'map'
  | 'final_exam'
  | 'review_video';

export default function Unit2Intro({
  onBackToMap,
  onUnlockUnit3,
}: Unit2IntroProps) {
  const { awardLabXp } = useAppStore();
  const {
    unit2CompletedLessons = [],
    unit2CurrentLesson = 1,
    unit2CompletedQuizzes = [],
    unitExamResults,
    completeUnit2Lesson,
    completeUnit2QuickQuiz,
    recordUnitExamResult,
  } = useAccountingLabStore();

  const gradedLessonsCount = UNIT2_LESSONS_META.filter(
    (m) => m.lessonNumber >= 1
  ).length;
  const completedGradedLessons = (unit2CompletedLessons || []).filter((n) => n >= 1);
  const highestCompleted =
    completedGradedLessons.length > 0 ? Math.max(...completedGradedLessons) : 0;
  const needsLesson0 = !(unit2CompletedLessons || []).includes(0);

  const resumeLessonNum = Math.min(
    gradedLessonsCount,
    Math.max(1, unit2CurrentLesson || 1, highestCompleted + 1)
  );

  const pendingQuickQuiz: QuickQuizConfig | undefined = UNIT2_QUICK_QUIZZES.find(
    (quiz) =>
      (unit2CompletedLessons || []).includes(quiz.afterLessonNumber) &&
      !(unit2CompletedQuizzes || []).includes(quiz.id)
  );

  const [mode, setMode] = useState<Unit2ScreenMode>('map');
  const [activeLessonNum, setActiveLessonNum] = useState<number>(resumeLessonNum);

  const loadedLesson = React.useMemo(() => {
    if (mode !== 'lesson') return null;
    return loadUnit2Lesson(activeLessonNum);
  }, [mode, activeLessonNum]);

  // حالة الاختبار السريع
  const [activeQuizId, setActiveQuizId] = useState<string>(
    UNIT2_QUICK_QUIZZES[0].id
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedId, setQuizSelectedId] = useState<string | null>(null);

  const activeQuiz: QuickQuizConfig =
    UNIT2_QUICK_QUIZZES.find((q) => q.id === activeQuizId) ||
    UNIT2_QUICK_QUIZZES[0];

  // حالة قاموس المصطلحات
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  // حالة الاختبار الختامي
  const [finalIdx, setFinalIdx] = useState(0);
  const [finalSelected, setFinalSelected] = useState<Record<string, string>>({});
  const [finalSubmitted, setFinalSubmitted] = useState(false);

  const isLoadingLesson =
    mode === 'lesson' &&
    (!loadedLesson || loadedLesson.lessonNumber !== activeLessonNum);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (mode !== 'home') {
      document.documentElement.dataset.immersiveLesson = 'true';
    } else {
      delete document.documentElement.dataset.immersiveLesson;
    }
    return () => {
      delete document.documentElement.dataset.immersiveLesson;
    };
  }, [mode]);

  const openQuickQuiz = (quiz: QuickQuizConfig) => {
    triggerHaptic('tap');
    setActiveQuizId(quiz.id);
    setQuizIndex(0);
    setQuizSelectedId(null);
    setMode('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openFinalExam = () => {
    triggerHaptic('tap');
    setFinalIdx(0);
    setFinalSubmitted(false);
    setMode('final_exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLesson = (lessonNumber: number) => {
    const meta = UNIT2_LESSONS_META.find(
      (m) => m.lessonNumber === lessonNumber
    );
    if (!meta || !meta.isAvailable) {
      toast.info('هذا المساق غير متاح حالياً.');
      return;
    }
    if (lessonNumber === 0) {
      triggerHaptic('tap');
      setActiveLessonNum(0);
      setMode('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const unlockedLimit = highestCompleted + 1;
    if (lessonNumber > unlockedLimit) {
      toast.info(`أكمل المساق ${lessonNumber - 1} أولاً ليُفتح لك هذا المساق.`);
      return;
    }
    triggerHaptic('tap');
    setActiveLessonNum(lessonNumber);
    setMode('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishOverviewAndStartLesson1 = () => {
    if (!(unit2CompletedLessons || []).includes(0)) {
      completeUnit2Lesson(0);
    }
    openLesson(1);
  };

  const handleCompleteLesson = (lesson: UnitLessonData) => {
    const alreadyDone = (unit2CompletedLessons || []).includes(lesson.lessonNumber);
    completeUnit2Lesson(lesson.lessonNumber);
    if (!alreadyDone) {
      awardLabXp(
        'accounting',
        lesson.xpReward,
        `إتمام المساق ${lesson.lessonNumber}: ${lesson.title}`
      );
      toast.success(`أحسنت! أتممت المساق ${lesson.lessonNumber} (+${lesson.xpReward} نقطة).`);
    } else {
      toast.success(`راجعت المساق ${lesson.lessonNumber} بنجاح.`);
    }
    triggerHaptic('success');

    const matchingQuiz = UNIT2_QUICK_QUIZZES.find(
      (quiz) =>
        quiz.afterLessonNumber === lesson.lessonNumber &&
        !(unit2CompletedQuizzes || []).includes(quiz.id)
    );
    if (matchingQuiz) {
      openQuickQuiz(matchingQuiz);
      return;
    }

    if (lesson.lessonNumber === 7) {
      openFinalExam();
      return;
    }

    const nextNum = lesson.lessonNumber + 1;
    const nextMeta = UNIT2_LESSONS_META.find((m) => m.lessonNumber === nextNum);
    if (nextMeta?.isAvailable) {
      setActiveLessonNum(nextNum);
      setMode('lesson');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setMode('map');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // شاشة مشغل الدرس
  if (mode === 'lesson') {
    if (isLoadingLesson || !loadedLesson) {
      return (
        <div className="mx-auto max-w-[640px] rounded-[28px] border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#526077] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#94A3B8]">
          جاري تحميل المساق...
        </div>
      );
    }

    const nextNum = loadedLesson.lessonNumber + 1;
    const nextMeta = UNIT2_LESSONS_META.find((m) => m.lessonNumber === nextNum);
    const hasQuizNext = Boolean(
      UNIT2_QUICK_QUIZZES.find(
        (quiz) =>
          quiz.afterLessonNumber === loadedLesson.lessonNumber &&
          !(unit2CompletedQuizzes || []).includes(quiz.id)
      )
    );

    return (
      <LessonPlayer
        key={loadedLesson.id}
        lesson={loadedLesson}
        totalLessons={gradedLessonsCount}
        initialStep={0}
        nextLessonAvailable={Boolean(nextMeta?.isAvailable)}
        hasQuizNext={hasQuizNext}
        isFinalLesson={loadedLesson.lessonNumber === gradedLessonsCount}
        onCompleteLesson={handleCompleteLesson}
        onBackToUnit={() => {
          setMode('map');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // وضع النظرة العامة
  if (mode === 'overview') {
    return (
      <div className="mx-auto max-w-[640px] space-y-6 pb-20">
        <button
          type="button"
          onClick={() => setMode('map')}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8]"
        >
          <ArrowRight className="h-4 w-4 stroke-[1.75]" />
          <span>العودة لخريطة المساقات</span>
        </button>

        <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-4 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.08)] sm:rounded-[28px] sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <span className="inline-block rounded-full bg-[#2F6BFF]/10 px-3.5 py-1 text-xs font-bold text-[#2F6BFF]">
            نظرة عامة تمهيدية
          </span>
          <h2 className="mt-4 text-[22px] leading-[1.4] font-bold text-[#0A1630] sm:text-[26px] dark:text-white">
            مقدمة الفصل الثاني: تحليل العمليات المالية
          </h2>
          <p className="mt-2 text-[18px] leading-[1.85] font-normal text-[#475569] dark:text-[#CBD5E1]">
            شاهد هذا الفيديو القصير لتتعرف على خريطة الفصل الثاني، خطوات الدورة المحاسبية السبع، وتوازن معادلة الميزانية.
          </p>

          <div className="mt-6">
            <VideoPlayer
              lessonId="u2-lesson-0"
              title="نظرة عامة على الوحدة الثانية — تحليل العمليات المالية"
              onWatchedComplete={() => {
                if (!(unit2CompletedLessons || []).includes(0)) {
                  completeUnit2Lesson(0);
                  toast.success('أحسنت! أتممت النظرة العامة.');
                }
              }}
            />
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              type="button"
              onClick={handleFinishOverviewAndStartLesson1}
              className="min-h-[48px] px-6 text-base font-bold"
            >
              <span>ابدأ المساق الأول: ماهية الدورة المحاسبية</span>
              <ChevronLeft className="h-4 w-4 stroke-[2]" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // وضع الاختبار السريع
  if (mode === 'quiz') {
    const curQ = activeQuiz.questions[quizIndex];
    const isSelected = Boolean(quizSelectedId);
    const isCorrect = quizSelectedId === curQ.correctOptionId;

    return (
      <div className="mx-auto max-w-[640px] space-y-6 pb-20">
        <button
          type="button"
          onClick={() => setMode('map')}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8]"
        >
          <ArrowRight className="h-4 w-4 stroke-[1.75]" />
          <span>العودة لخريطة المساقات</span>
        </button>

        <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 sm:rounded-[28px] sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 dark:border-[#1E325C]">
            <div>
              <span className="inline-block rounded-full bg-[#2F6BFF]/10 px-3.5 py-1 text-xs font-bold text-[#2F6BFF]">
                {activeQuiz.title}
              </span>
              <h2 className="mt-1 text-lg font-bold text-[#0A1630] sm:text-xl dark:text-white">
                {activeQuiz.subtitle}
              </h2>
            </div>
            <span className="font-tabular text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">
              {quizIndex + 1} / {activeQuiz.questions.length}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-base font-bold text-[#0A1630] sm:text-lg dark:text-white">
              {curQ.prompt}
            </h3>

            <div className="space-y-2.5">
              {curQ.options.map((opt) => {
                const selected = quizSelectedId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setQuizSelectedId(opt.id);
                      triggerHaptic('tap');
                    }}
                    className={cn(
                      'flex w-full items-start justify-between rounded-[20px] border p-4 text-right transition-all',
                      selected
                        ? isCorrect
                          ? 'border-[#10B981] bg-[#10B981]/10 text-[#047857] dark:text-[#34D399]'
                          : 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0A1630] hover:border-[#2F6BFF]/40 dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white'
                    )}
                  >
                    <span className="text-sm font-bold sm:text-base leading-relaxed">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {isSelected && (
              <div
                className={cn(
                  'rounded-[20px] border p-4 text-xs sm:text-sm leading-relaxed',
                  isCorrect
                    ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#047857] dark:text-[#34D399]'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                )}
              >
                <strong>{isCorrect ? 'أحسنت! ' : 'توضيح: '}</strong>
                {curQ.options.find((o) => o.id === quizSelectedId)?.why}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[#E2E8F0] pt-4 dark:border-[#1E325C]">
            {isSelected && isCorrect && (
              <Button
                type="button"
                onClick={() => {
                  if (quizIndex < activeQuiz.questions.length - 1) {
                    setQuizIndex((i) => i + 1);
                    setQuizSelectedId(null);
                  } else {
                    completeUnit2QuickQuiz(activeQuiz.id);
                    awardLabXp('accounting', 30, `إتمام ${activeQuiz.title}`);
                    toast.success(`أحسنت! أتممت ${activeQuiz.title} (+30 XP).`);
                    setMode('map');
                  }
                }}
              >
                {quizIndex < activeQuiz.questions.length - 1
                  ? 'السؤال التالي'
                  : 'إنهاء الاختبار السريع والعودة للمسار'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // وضع الاختبار النهائي
  if (mode === 'final_exam') {
    const totalQ = UNIT2_EXAM_QUESTIONS.length;
    const curQ = UNIT2_EXAM_QUESTIONS[finalIdx];
    const isCompleted = Object.keys(finalSelected).length === totalQ;
    const correctCount = UNIT2_EXAM_QUESTIONS.filter(
      (q) => finalSelected[q.id] === q.correctOptionId
    ).length;
    const scorePct = Math.round((correctCount / totalQ) * 100);
    const passed = scorePct >= 60;

    return (
      <div className="mx-auto max-w-[640px] space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMode('map')}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8]"
          >
            <ArrowRight className="h-4 w-4 stroke-[1.75]" />
            <span>العودة لخريطة المساقات</span>
          </button>
          <span className="font-tabular text-sm font-bold text-[#2F6BFF]">
            {finalSubmitted ? `${scorePct}%` : `${finalIdx + 1} / ${totalQ}`}
          </span>
        </div>

        {!finalSubmitted ? (
          <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 sm:rounded-[28px] sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
            <span className="inline-block rounded-full bg-[#2F6BFF]/10 px-3.5 py-1 text-xs font-bold text-[#2F6BFF]">
              الاختبار النهائي للوحدة الثانية
            </span>
            <h2 className="mt-3 text-lg font-bold text-[#0A1630] sm:text-xl dark:text-white">
              {curQ.prompt}
            </h2>

            <div className="mt-5 space-y-2.5">
              {curQ.options.map((opt) => {
                const selected = finalSelected[curQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setFinalSelected((prev) => ({
                        ...prev,
                        [curQ.id]: opt.id,
                      }));
                      triggerHaptic('tap');
                    }}
                    className={cn(
                      'flex w-full items-start justify-between rounded-[20px] border p-4 text-right transition-all',
                      selected
                        ? 'border-[#2F6BFF] bg-[#2F6BFF]/10 font-bold text-[#2F6BFF]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0A1630] hover:border-[#2F6BFF]/40 dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white'
                    )}
                  >
                    <span className="text-sm font-bold sm:text-base leading-relaxed">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#E2E8F0] pt-4 dark:border-[#1E325C]">
              <Button
                type="button"
                variant="outline"
                disabled={finalIdx === 0}
                onClick={() => setFinalIdx((i) => i - 1)}
              >
                السابق
              </Button>
              {finalIdx < totalQ - 1 ? (
                <Button
                  type="button"
                  disabled={!finalSelected[curQ.id]}
                  onClick={() => setFinalIdx((i) => i + 1)}
                >
                  التالي
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={!isCompleted}
                  onClick={() => {
                    recordUnitExamResult(2, scorePct, passed);
                    if (passed) {
                      awardLabXp('accounting', 90, 'اجتياز الاختبار النهائي للوحدة الثانية');
                      toast.success(`مبارك! اجتزت اختبار الوحدة الثانية بنسبة ${scorePct}%.`);
                    } else {
                      toast.info('يمكنك مراجعة الإجابات وإعادة الاختبار لتحقيق 60% فأعلى.');
                    }
                    setFinalSubmitted(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  اعتماد النتيجة النهائية
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 text-center sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
              <div
                className={cn(
                  'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
                  passed ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                )}
              >
                <CheckCircle2 className="h-9 w-9 stroke-[1.75]" />
              </div>
              <h2 className="mt-4 font-tabular text-2xl font-bold text-[#0A1630] sm:text-3xl dark:text-white">
                نتيجتك: {scorePct}% ({correctCount} من {totalQ})
              </h2>
              <p className="mt-2 text-sm text-[#475569] dark:text-[#CBD5E1]">
                {passed
                  ? 'تهانينا! أنهيت جميع مساقات الوحدة الثانية واجتزت الاختبار النهائي بنجاح.'
                  : 'راجع التوضيحات أدناه ثم أعد المحاولة لتثبيت المفاهيم.'}
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFinalSubmitted(false);
                    setFinalSelected({});
                    setFinalIdx(0);
                  }}
                >
                  إعادة المحاولة
                </Button>
                {passed && onUnlockUnit3 && (
                  <Button type="button" onClick={onUnlockUnit3}>
                    الانتقال إلى الوحدة الثالثة
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // وضع خريطة مساقات الوحدة (القائمة العمودية المتصلة المطابقة تماماً لصورة الوحدة الأولى)
  const examRecord = unitExamResults[2];

  return (
    <div className="mx-auto max-w-[640px] space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToMap}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8]"
        >
          <ArrowRight className="h-4 w-4 stroke-[1.75]" />
          <span>العودة لخريطة المنهاج</span>
        </button>
        <span className="font-tabular text-sm font-bold text-[#2F6BFF]">
          {completedGradedLessons.length} / {gradedLessonsCount} مكتمل
        </span>
      </div>

      <div className="px-1">
        <h2 className="text-2xl font-bold text-[#0A1630] dark:text-white">
          مسار دروس الوحدة الثانية
        </h2>
        <p className="mt-1 text-base text-[#526077] dark:text-[#94A3B8]">
          تبدأ بالنظرة العامة ثم يُفتح كل درس بعد إنهاء الدرس الذي يسبقه.
        </p>
      </div>

      {/* المسار العمودي المتصل للمساقات السبعة */}
      <div className="relative space-y-3 before:absolute before:top-7 before:right-[27px] before:bottom-7 before:w-0.5 before:bg-[#E2E8F0] dark:before:bg-[#1E325C]">
        {UNIT2_LESSONS_META.map((item) => {
          const isDone = (unit2CompletedLessons || []).includes(item.lessonNumber);
          const isUnlockedByProgress =
            item.lessonNumber === 0
              ? true
              : item.isAvailable && item.lessonNumber <= highestCompleted + 1;
          const isCurrent =
            item.lessonNumber === 0
              ? !isDone && needsLesson0
              : item.isAvailable &&
                !isDone &&
                !needsLesson0 &&
                item.lessonNumber === resumeLessonNum;

          const statusLabel = isDone
            ? 'مكتمل'
            : isCurrent
            ? 'الحالي'
            : isUnlockedByProgress
            ? 'متاح'
            : 'مقفل';

          return (
            <div key={item.id} className="space-y-3">
              <button
                type="button"
                disabled={!isUnlockedByProgress}
                onClick={() => openLesson(item.lessonNumber)}
                className={cn(
                  'relative flex w-full items-center gap-4 rounded-[22px] border p-4 text-right transition-all',
                  isCurrent
                    ? 'border-2 border-[#2F6BFF] bg-white shadow-[0_8px_24px_-12px_rgba(47,107,255,0.35)] dark:bg-[#0A1630]'
                    : isUnlockedByProgress
                    ? 'border-[#E2E8F0] bg-white hover:border-[#2F6BFF]/50 dark:border-[#1E325C] dark:bg-[#0A1630]'
                    : 'cursor-not-allowed border-[#E2E8F0]/70 bg-[#F8FAFC] opacity-75 dark:border-[#1E325C]/60 dark:bg-[#070D1F]'
                )}
              >
                <span
                  className={cn(
                    'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-tabular text-sm font-bold',
                    isDone
                      ? 'bg-[#10B981] text-white'
                      : isCurrent
                      ? 'bg-[#2F6BFF] text-white'
                      : isUnlockedByProgress
                      ? 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#0A1630] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white'
                      : 'bg-[#E2E8F0] text-[#64748B] dark:bg-[#1E325C] dark:text-[#94A3B8]'
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isUnlockedByProgress ? (
                    item.lessonNumber
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-base font-bold text-[#0A1630] dark:text-white">
                      {item.title}
                    </h3>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold',
                        isDone
                          ? 'bg-[#10B981]/15 text-[#047857] dark:text-[#34D399]'
                          : isCurrent
                          ? 'bg-[#2F6BFF]/10 text-[#2F6BFF]'
                          : 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#070D1F] dark:text-[#94A3B8]'
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{item.estimatedMinutes} دقائق</span>
                  </p>
                </div>
              </button>

              {/* الاختبارات السريعة بين المساقات */}
              {UNIT2_QUICK_QUIZZES.map((quiz) => {
                if (quiz.afterLessonNumber !== item.lessonNumber) return null;
                const quizUnlocked = (unit2CompletedLessons || []).includes(quiz.afterLessonNumber);
                const quizDone = (unit2CompletedQuizzes || []).includes(quiz.id);
                return (
                  <button
                    key={quiz.id}
                    type="button"
                    disabled={!quizUnlocked}
                    onClick={() => openQuickQuiz(quiz)}
                    className={cn(
                      'relative ms-12 flex w-[calc(100%-3rem)] items-center justify-between rounded-[18px] border px-4 py-3 text-right text-sm font-bold',
                      quizDone
                        ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#047857] dark:text-[#34D399]'
                        : quizUnlocked
                        ? 'border-[#2F6BFF]/40 bg-[#2F6BFF]/10 text-[#2F6BFF]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8] dark:border-[#1E325C] dark:bg-[#070D1F]'
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>{quiz.title}</span>
                    </span>
                    <span className="text-xs">
                      {quizDone ? 'مكتمل' : quizUnlocked ? 'ابدأ الآن' : 'مقفل'}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* أسفل المسار: قاموس المصطلحات والاختبار النهائي */}
      <div className="space-y-3 pt-4">
        <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <button
            type="button"
            onClick={() => setGlossaryOpen((v) => !v)}
            className="flex min-h-[44px] w-full items-center justify-between text-right font-bold text-[#0A1630] dark:text-white"
          >
            <span className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#2F6BFF]" />
              <span>قاموس مصطلحات الفصل الثاني (اختياري)</span>
            </span>
            <span className="text-xs text-[#2F6BFF]">
              {glossaryOpen ? 'إخفاء' : 'عرض'}
            </span>
          </button>

          {glossaryOpen && (
            <div className="mt-4 space-y-2.5 border-t border-[#E2E8F0] pt-4 dark:border-[#1E325C]">
              {UNIT2_GLOSSARY_TERMS.map((term) => (
                <div
                  key={term.arabicTerm}
                  className="rounded-[16px] bg-[#F8FAFC] p-3.5 dark:bg-[#070D1F]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#0A1630] dark:text-white">
                      {term.arabicTerm}
                    </span>
                    <span dir="ltr" className="text-xs font-semibold text-[#2F6BFF]">
                      {term.englishTerm}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#526077] dark:text-[#94A3B8]">
                    {term.simpleMeaning}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#2F6BFF]/30 bg-white p-5 dark:border-[#2F6BFF]/40 dark:bg-[#0A1630]">
          <div>
            <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
              الاختبار النهائي للوحدة الثانية ({UNIT2_EXAM_QUESTIONS.length} أسئلة)
            </h3>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              {examRecord
                ? `أعلى نتيجة لك: ${examRecord.scorePct}%`
                : 'تقييم شامل لجميع مساقات الفصل الثاني من الكتاب المعتمد (60% للنجاح)'}
            </p>
          </div>
          <Button type="button" onClick={openFinalExam}>
            بدء الاختبار النهائي
          </Button>
        </div>
      </div>
    </div>
  );
}