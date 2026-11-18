'use client';

import React, { useEffect, useState } from 'react';
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
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  Scale,
  Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAccountingLabStore } from '@/lib/labs/accounting/store';
import { UNIT3_EXAM_QUESTIONS } from '@/lib/labs/accounting/unit3-data';
import {
  loadUnit3Lesson,
  UNIT3_GLOSSARY_TERMS,
  UNIT3_LESSONS_META,
  UNIT3_QUICK_QUIZZES,
} from '@/lib/labs/accounting/unit3-lessons';
import type { QuickQuizConfig, UnitLessonData } from '@/lib/labs/accounting/unit1-lessons/types';
import { LessonPlayer } from '@/components/labs/accounting/lesson-player';
import { VideoPlayer } from '@/components/labs/accounting/video-player';
import { useAppStore } from '@/store/use-app-store';
import { triggerHaptic } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Unit3IntroProps {
  initialExerciseId?: string | null;
  onBackToMap: () => void;
}

type Unit3ScreenMode =
  | 'overview'
  | 'lesson'
  | 'quiz'
  | 'map'
  | 'final_exam'
  | 'practice_hazem';

export default function Unit3Intro({
  initialExerciseId,
  onBackToMap,
}: Unit3IntroProps) {
  const { awardLabXp } = useAppStore();
  const {
    unit3CompletedLessons = [],
    unit3CurrentLesson = 1,
    unit3CompletedQuizzes = [],
    unitExamResults,
    completeUnit3Lesson,
    completeUnit3QuickQuiz,
    recordUnitExamResult,
  } = useAccountingLabStore();

  const gradedLessonsCount = UNIT3_LESSONS_META.filter(
    (m) => m.lessonNumber >= 1
  ).length;
  const completedGradedLessons = (unit3CompletedLessons || []).filter((n) => n >= 1);
  const highestCompleted =
    completedGradedLessons.length > 0 ? Math.max(...completedGradedLessons) : 0;
  const needsLesson0 = !(unit3CompletedLessons || []).includes(0);

  const resumeLessonNum = Math.min(
    gradedLessonsCount,
    Math.max(1, unit3CurrentLesson || 1, highestCompleted + 1)
  );

  const [mode, setMode] = useState<Unit3ScreenMode>('map');
  const [activeLessonNum, setActiveLessonNum] = useState<number>(resumeLessonNum);

  const loadedLesson = React.useMemo(() => {
    if (mode !== 'lesson') return null;
    return loadUnit3Lesson(activeLessonNum);
  }, [mode, activeLessonNum]);

  // حالة الاختبار السريع
  const [activeQuizId, setActiveQuizId] = useState<string>(
    UNIT3_QUICK_QUIZZES[0].id
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedId, setQuizSelectedId] = useState<string | null>(null);

  const activeQuiz: QuickQuizConfig =
    UNIT3_QUICK_QUIZZES.find((q) => q.id === activeQuizId) ||
    UNIT3_QUICK_QUIZZES[0];

  // حالة قاموس المصطلحات
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  // حالة الاختبار الختامي
  const [finalIdx, setFinalIdx] = useState(0);
  const [finalSelected, setFinalSelected] = useState<Record<string, string>>({});
  const [finalSubmitted, setFinalSubmitted] = useState(false);

  // حالة مسألة محلات حازم التفاعلية
  const [hazemAnswers, setHazemAnswers] = useState({
    income: '',
    capital: '',
    assets: '',
  });
  const [hazemChecked, setHazemChecked] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (mode !== 'map') {
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
    const meta = UNIT3_LESSONS_META.find(
      (m) => m.lessonNumber === lessonNumber
    );
    if (!meta || !meta.isAvailable) {
      toast.info('هذا المساق غير متاح حالياً.');
      return;
    }
    triggerHaptic('tap');
    if (lessonNumber === 0) {
      setActiveLessonNum(0);
      setMode('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveLessonNum(lessonNumber);
    setMode('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (initialExerciseId) {
      const match = initialExerciseId.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= 0 && num <= 7) {
          openLesson(num);
        }
      }
    }
  }, [initialExerciseId]);

  const handleFinishOverviewAndStartLesson1 = () => {
    if (!(unit3CompletedLessons || []).includes(0)) {
      completeUnit3Lesson(0);
    }
    openLesson(1);
  };

  const handleCompleteLesson = (lesson: UnitLessonData) => {
    const alreadyDone = (unit3CompletedLessons || []).includes(lesson.lessonNumber);
    completeUnit3Lesson(lesson.lessonNumber);
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

    const matchingQuiz = UNIT3_QUICK_QUIZZES.find(
      (quiz) =>
        quiz.afterLessonNumber === lesson.lessonNumber &&
        !(unit3CompletedQuizzes || []).includes(quiz.id)
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
    const nextMeta = UNIT3_LESSONS_META.find((m) => m.lessonNumber === nextNum);
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
    if (!loadedLesson) {
      return (
        <div className="rounded-[28px] border border-[#E3E8F0] bg-white p-8 text-center text-sm text-[#526077] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#94A3B8]">
          جاري تحميل الدرس...
        </div>
      );
    }

    const nextNum = loadedLesson.lessonNumber + 1;
    const nextMeta = UNIT3_LESSONS_META.find((m) => m.lessonNumber === nextNum);
    const hasQuizNext = Boolean(
      UNIT3_QUICK_QUIZZES.find(
        (quiz) =>
          quiz.afterLessonNumber === loadedLesson.lessonNumber &&
          !(unit3CompletedQuizzes || []).includes(quiz.id)
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

  // شاشة الاختبار السريع
  if (mode === 'quiz') {
    const currentQuestion = activeQuiz.questions[quizIndex];
    const isLastQuestion = quizIndex === activeQuiz.questions.length - 1;
    const selectedOption = currentQuestion.options.find(
      (o) => o.id === quizSelectedId
    );

    const handleAnswerAndNext = () => {
      if (!quizSelectedId) return;
      triggerHaptic('tap');
      if (isLastQuestion) {
        completeUnit3QuickQuiz(activeQuiz.id);
        awardLabXp('accounting', 30, `اجتياز ${activeQuiz.title}`);
        toast.success(`مبروك! أتممت ${activeQuiz.title} (+30 نقطة).`);
        const nextLessonTarget = activeQuiz.afterLessonNumber + 1;
        if (nextLessonTarget <= gradedLessonsCount) {
          openLesson(nextLessonTarget);
        } else {
          setMode('map');
        }
      } else {
        setQuizIndex((prev) => prev + 1);
        setQuizSelectedId(null);
      }
    };

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode('map')}
            className="gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للخريطة</span>
          </Button>
          <span className="text-xs font-bold text-[#2563EB]">
            سؤال {quizIndex + 1} من {activeQuiz.questions.length}
          </span>
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-[#1E325C] dark:bg-[#0A1630]">
          <Badge className="mb-3 bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/15">
            {activeQuiz.title}
          </Badge>
          <h3 className="text-base font-bold text-[#0A1630] sm:text-lg dark:text-white">
            {currentQuestion.prompt}
          </h3>

          <div className="mt-5 space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = quizSelectedId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setQuizSelectedId(opt.id);
                  }}
                  className={cn(
                    'w-full rounded-2xl border p-4 text-right text-sm transition-all',
                    isSelected
                      ? 'border-[#2563EB] bg-[#2563EB]/5 font-semibold text-[#2563EB] ring-2 ring-[#2563EB]/20 dark:bg-[#2563EB]/15 dark:text-blue-400'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#E2E8F0]'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
              💡 {selectedOption.why}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              disabled={!quizSelectedId}
              onClick={handleAnswerAndNext}
              className="gap-2"
            >
              <span>{isLastQuestion ? 'إنهاء الاختبار والمتابعة' : 'السؤال التالي'}</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // شاشة الاختبار النهائي الشامل للوحدة 3
  if (mode === 'final_exam') {
    const totalQ = UNIT3_EXAM_QUESTIONS.length;
    const currentQ = UNIT3_EXAM_QUESTIONS[finalIdx];
    const isCompleted = Object.keys(finalSelected).length === totalQ;

    const handleScoreExam = () => {
      const correctCount = UNIT3_EXAM_QUESTIONS.filter(
        (q) => finalSelected[q.id] === q.correctOptionId
      ).length;
      const pct = Math.round((correctCount / totalQ) * 100);
      const passed = pct >= 70;
      recordUnitExamResult(3, pct, passed);
      if (passed) {
        awardLabXp('accounting', 120, 'اجتياز الاختبار النهائي للوحدة 3');
        toast.success(`مبروك! اجتزت امتحان الوحدة 3 بنسبة ${pct}% وحصلت على شارة مشغل الدورة المحاسبية!`);
      } else {
        toast.error(`حصلت على ${pct}%. تحتاج إلى 70% على الأقل للاجتياز.`);
      }
      setFinalSubmitted(true);
    };

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode('map')}
            className="gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة لخريطة الوحدة</span>
          </Button>
          <span className="text-xs font-bold text-[#2563EB]">
            سؤال {finalIdx + 1} من {totalQ}
          </span>
        </div>

        {!finalSubmitted ? (
          <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="flex items-center justify-between">
              <Badge className="bg-[#2563EB]/10 text-[#2563EB]">
                الاختبار الشامل للوحدة 3 (الفصل الثالث)
              </Badge>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                نسبة النجاح: 70%
              </span>
            </div>

            <h3 className="mt-4 text-base font-bold text-[#0A1630] sm:text-lg dark:text-white">
              {currentQ.prompt}
            </h3>

            <div className="mt-5 space-y-3">
              {currentQ.options.map((opt) => {
                const isSelected = finalSelected[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      setFinalSelected((prev) => ({
                        ...prev,
                        [currentQ.id]: opt.id,
                      }));
                    }}
                    className={cn(
                      'w-full rounded-2xl border p-4 text-right text-sm transition-all',
                      isSelected
                        ? 'border-[#2563EB] bg-[#2563EB]/5 font-semibold text-[#2563EB] ring-2 ring-[#2563EB]/20 dark:bg-[#2563EB]/15 dark:text-blue-400'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#E2E8F0]'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#E2E8F0] pt-4 dark:border-[#1E325C]">
              <Button
                variant="outline"
                size="sm"
                disabled={finalIdx === 0}
                onClick={() => setFinalIdx((p) => p - 1)}
              >
                السابق
              </Button>
              {finalIdx < totalQ - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setFinalIdx((p) => p + 1)}
                  disabled={!finalSelected[currentQ.id]}
                >
                  التالي
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={!isCompleted}
                  onClick={handleScoreExam}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  تصحيح الاختبار النهائي
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50/50 p-6 text-center shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h3 className="mt-3 text-lg font-bold text-emerald-900 dark:text-emerald-200">
              اكتمل تصحيح الاختبار
            </h3>
            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
              أجبت عن {UNIT3_EXAM_QUESTIONS.filter((q) => finalSelected[q.id] === q.correctOptionId).length} من أصل {totalQ} أسئلة بشكل صحيح.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFinalSelected({});
                  setFinalIdx(0);
                  setFinalSubmitted(false);
                }}
              >
                إعادة المحاولة
              </Button>
              <Button size="sm" onClick={() => setMode('map')}>
                العودة للخريطة
              </Button>
            </div>
          </div>
        )}
      </div>
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
            مقدمة الفصل الثالث: الدورة المحاسبية
          </h2>
          <p className="mt-2 text-[18px] leading-[1.85] font-normal text-[#475569] dark:text-[#CBD5E1]">
            شاهد هذا الفيديو لتتعرف على خريطة الفصل الثالث، الدورة المحاسبية (التسجيل، الترحيل، ميزان المراجعة، والقوائم المالية).
          </p>

          <div className="mt-6">
            <VideoPlayer
              lessonId="u3-lesson-0"
              title="نظرة عامة على الوحدة الثالثة — الدورة المحاسبية"
              onWatchedComplete={() => {
                if (!(unit3CompletedLessons || []).includes(0)) {
                  completeUnit3Lesson(0);
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
              <span>ابدأ المساق الأول: معرفة الطرف المدين والدائن</span>
              <ChevronLeft className="h-4 w-4 stroke-[2]" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // وضع خريطة مساقات الوحدة الثالثة (القائمة العمودية المتصلة المطابقة تماماً لصورة الوحدة الثانية والأولى)
  const examRecord = unitExamResults[3];

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
          مسار دروس الوحدة الثالثة
        </h2>
        <p className="mt-1 text-base text-[#526077] dark:text-[#94A3B8]">
          تبدأ بالنظرة العامة ثم يُفتح كل درس بعد إنهاء الدرس الذي يسبقه.
        </p>
      </div>

      {/* المسار العمودي المتصل للمساقات */}
      <div className="relative space-y-3 before:absolute before:top-7 before:right-[27px] before:bottom-7 before:w-0.5 before:bg-[#E2E8F0] dark:before:bg-[#1E325C]">
        {UNIT3_LESSONS_META.map((item) => {
          const isDone = (unit3CompletedLessons || []).includes(item.lessonNumber);
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
                    item.lessonNumber === 0 ? '★' : item.lessonNumber
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
              {UNIT3_QUICK_QUIZZES.map((quiz) => {
                if (quiz.afterLessonNumber !== item.lessonNumber) return null;
                const quizUnlocked = (unit3CompletedLessons || []).includes(quiz.afterLessonNumber);
                const quizDone = (unit3CompletedQuizzes || []).includes(quiz.id);
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
              <span>قاموس مصطلحات الفصل الثالث (اختياري)</span>
            </span>
            <span className="text-xs text-[#2F6BFF]">
              {glossaryOpen ? 'إخفاء' : 'عرض'}
            </span>
          </button>

          {glossaryOpen && (
            <div className="mt-4 space-y-2.5 border-t border-[#E2E8F0] pt-4 dark:border-[#1E325C]">
              {UNIT3_GLOSSARY_TERMS.map((term) => (
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
              الاختبار النهائي للوحدة الثالثة ({UNIT3_EXAM_QUESTIONS.length} أسئلة)
            </h3>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              {examRecord
                ? `أعلى نتيجة لك: ${examRecord.scorePct}%`
                : 'تقييم شامل لجميع مساقات الفصل الثالث من الكتاب المعتمد (60% للنجاح)'}
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
