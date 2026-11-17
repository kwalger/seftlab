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
import { UNIT1_EXAM_QUESTIONS } from '@/lib/labs/accounting/unit1-data';
import {
  loadUnit1Lesson,
  UNIT1_GLOSSARY_TERMS,
  UNIT1_LESSONS_META,
  UNIT1_QUICK_QUIZZES,
  type QuickQuizConfig,
  type UnitLessonData,
} from '@/lib/labs/accounting/unit1-lessons';
import { LessonPlayer } from '@/components/labs/accounting/lesson-player';
import { VideoPlayer } from '@/components/labs/accounting/video-player';
import { useAppStore } from '@/store/use-app-store';
import { triggerHaptic } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Unit1IntroProps {
  initialExerciseId?: string | null;
  onBackToMap: () => void;
  onUnlockUnit2?: () => void;
}

type Unit1ScreenMode =
  | 'home'
  | 'overview'
  | 'lesson'
  | 'quiz'
  | 'map'
  | 'final_exam'
  | 'review_video';

export default function Unit1Intro({
  onBackToMap,
  onUnlockUnit2,
}: Unit1IntroProps) {
  const { awardLabXp } = useAppStore();
  const {
    unit1CompletedLessons,
    unit1CurrentLesson,
    unit1CurrentStepByLesson,
    unit1CompletedQuizzes,
    unitExamResults,
    completeUnit1Lesson,
    setUnit1Position,
    completeUnit1QuickQuiz,
    recordUnitExamResult,
  } = useAccountingLabStore();

  const gradedLessonsCount = UNIT1_LESSONS_META.filter(
    (m) => m.lessonNumber >= 1
  ).length;
  const completedGradedLessons = unit1CompletedLessons.filter((n) => n >= 1);
  const highestCompleted =
    completedGradedLessons.length > 0 ? Math.max(...completedGradedLessons) : 0;
  const needsLesson0 = !unit1CompletedLessons.includes(0);

  // تحديد الدرس الحالي المناسب عند الفتح (الوحدة كاملة من 1 إلى 12 متاحة بالتدرج)
  const availableMaxLesson = 12;
  const resumeLessonNum = Math.min(
    availableMaxLesson,
    Math.max(1, unit1CurrentLesson || 1, highestCompleted + 1)
  );

  const pendingQuickQuiz: QuickQuizConfig | undefined = UNIT1_QUICK_QUIZZES.find(
    (quiz) =>
      unit1CompletedLessons.includes(quiz.afterLessonNumber) &&
      !unit1CompletedQuizzes.includes(quiz.id)
  );

  const [mode, setMode] = useState<Unit1ScreenMode>('home');
  const [activeLessonNum, setActiveLessonNum] =
    useState<number>(resumeLessonNum);
  const [loadedLesson, setLoadedLesson] = useState<UnitLessonData | null>(null);

  // حالة الاختبار السريع (بعد الدروس 3 و 6 و 9)
  const [activeQuizId, setActiveQuizId] = useState<string>(
    UNIT1_QUICK_QUIZZES[0].id
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedId, setQuizSelectedId] = useState<string | null>(null);

  const activeQuiz: QuickQuizConfig =
    UNIT1_QUICK_QUIZZES.find((q) => q.id === activeQuizId) ||
    UNIT1_QUICK_QUIZZES[0];

  // حالة قاموس المصطلحات الاختياري في نهاية الوحدة
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  // حالة الاختبار الختامي في نهاية الوحدة
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

  useEffect(() => {
    if (mode !== 'lesson') return;
    let cancelled = false;
    loadUnit1Lesson(activeLessonNum)
      .then((data) => {
        if (!cancelled) {
          setLoadedLesson(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadedLesson(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode, activeLessonNum]);

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
    const meta = UNIT1_LESSONS_META.find(
      (m) => m.lessonNumber === lessonNumber
    );
    if (!meta || !meta.isAvailable) {
      toast.info('هذا الدرس غير متاح حالياً.');
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
      toast.info(`أكمل الدرس ${lessonNumber - 1} أولاً ليُفتح لك هذا الدرس.`);
      return;
    }
    triggerHaptic('tap');
    setActiveLessonNum(lessonNumber);
    setMode('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishOverviewAndStartLesson1 = () => {
    if (!unit1CompletedLessons.includes(0)) {
      completeUnit1Lesson(0);
    }
    openLesson(1);
  };

  const handlePrimaryStart = () => {
    if (pendingQuickQuiz) {
      openQuickQuiz(pendingQuickQuiz);
      return;
    }
    if (needsLesson0) {
      openLesson(0);
      return;
    }
    if (completedGradedLessons.length >= gradedLessonsCount && !unitExamResults[1]?.passed) {
      openFinalExam();
      return;
    }
    openLesson(resumeLessonNum);
  };

  const handleCompleteLesson = (lesson: UnitLessonData) => {
    const alreadyDone = unit1CompletedLessons.includes(lesson.lessonNumber);
    completeUnit1Lesson(lesson.lessonNumber);
    if (!alreadyDone) {
      awardLabXp(
        'accounting',
        lesson.xpReward,
        `إتمام الدرس ${lesson.lessonNumber}: ${lesson.title}`
      );
      toast.success(`أحسنت! أتممت الدرس ${lesson.lessonNumber} (+${lesson.xpReward} نقطة).`);
    } else {
      toast.success(`راجعت الدرس ${lesson.lessonNumber} بنجاح.`);
    }
    triggerHaptic('success');

    const matchingQuiz = UNIT1_QUICK_QUIZZES.find(
      (quiz) =>
        quiz.afterLessonNumber === lesson.lessonNumber &&
        !unit1CompletedQuizzes.includes(quiz.id)
    );
    if (matchingQuiz) {
      openQuickQuiz(matchingQuiz);
      return;
    }

    if (lesson.lessonNumber === 12) {
      openFinalExam();
      return;
    }

    const nextNum = lesson.lessonNumber + 1;
    const nextMeta = UNIT1_LESSONS_META.find((m) => m.lessonNumber === nextNum);
    if (nextMeta?.isAvailable) {
      setActiveLessonNum(nextNum);
      setMode('lesson');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setMode('map');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // وضع الدرس 0: نظرة عامة على الوحدة (فيديو تمهيدي كامل)
  if (mode === 'overview') {
    return (
      <div className="mx-auto max-w-[640px] space-y-6 pb-28">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMode('home')}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8]"
          >
            <ArrowRight className="h-4 w-4 stroke-[1.75]" />
            <span>خروج من الدرس</span>
          </button>
          <span className="text-sm font-bold text-[#0A1630] dark:text-white">
            الدرس 0 من {gradedLessonsCount}
          </span>
        </div>

        <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-4 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.08)] sm:rounded-[28px] sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <span className="inline-block rounded-full bg-[#2F6BFF]/10 px-3.5 py-1 text-xs font-bold text-[#2F6BFF]">
            تهيئة الوحدة الأولى
          </span>
          <h1 className="mt-4 text-[24px] leading-[1.35] font-bold text-[#0A1630] sm:text-[28px] dark:text-white">
            نظرة عامة على الوحدة
          </h1>
          <p className="mt-3 text-[18px] leading-[1.85] font-normal text-[#475569] sm:text-[19px] dark:text-[#CBD5E1]">
            شاهد هذا الفيديو التمهيدي السريع لتأخذ فكرة واضحة عن رحلتنا في المحاسبة المالية قبل أن تبدأ الدرس الأول.
          </p>

          <div className="mt-6">
            <VideoPlayer
              lessonId="u1-lesson-0"
              title="أساسيات المحاسبة المالية — نظرة عامة"
              onSkip={handleFinishOverviewAndStartLesson1}
              onWatchedComplete={() => {
                if (!unit1CompletedLessons.includes(0)) {
                  completeUnit1Lesson(0);
                }
              }}
            />
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E2E8F0] bg-white/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-md dark:border-[#1E325C] dark:bg-[#0A1630]/95">
          <div className="mx-auto flex max-w-[640px]">
            <Button
              type="button"
              onClick={handleFinishOverviewAndStartLesson1}
              className="min-h-[52px] w-full gap-2 text-base font-bold"
            >
              <span>التالي: ابدأ الدرس 1</span>
              <ChevronLeft className="h-5 w-5 stroke-[1.75]" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // وضع مشغل الدرس
  if (mode === 'lesson') {
    if (isLoadingLesson || !loadedLesson) {
      return (
        <div className="mx-auto max-w-[640px] py-12">
          <div className="h-64 animate-pulse rounded-[28px] border border-[#E2E8F0] bg-white p-8 dark:border-[#1E325C] dark:bg-[#0A1630]" />
        </div>
      );
    }

    const nextMeta = UNIT1_LESSONS_META.find(
      (m) => m.lessonNumber === loadedLesson.lessonNumber + 1
    );
    const pendingQuizForLesson = UNIT1_QUICK_QUIZZES.find(
      (quiz) =>
        quiz.afterLessonNumber === loadedLesson.lessonNumber &&
        !unit1CompletedQuizzes.includes(quiz.id)
    );

    return (
      <LessonPlayer
        key={loadedLesson.id}
        lesson={loadedLesson}
        totalLessons={gradedLessonsCount}
        initialStep={unit1CurrentStepByLesson[loadedLesson.lessonNumber] || 0}
        nextLessonAvailable={Boolean(nextMeta?.isAvailable)}
        hasQuizNext={Boolean(pendingQuizForLesson)}
        isFinalLesson={loadedLesson.lessonNumber === 12}
        onStepChange={setUnit1Position}
        onCompleteLesson={handleCompleteLesson}
        onBackToUnit={() => setMode('home')}
      />
    );
  }

  // وضع الاختبار السريع (3 أسئلة بعد الدروس 3 و 6 و 9)
  if (mode === 'quiz') {
    const questions = activeQuiz.questions;
    const q = questions[quizIndex];
    const selectedOpt = q?.options.find((o) => o.id === quizSelectedId);
    const isCorrect = quizSelectedId === q?.correctOptionId;
    const isLastQ = quizIndex === questions.length - 1;
    const nextLessonAfterQuiz = activeQuiz.afterLessonNumber + 1;

    return (
      <div className="mx-auto max-w-[640px] space-y-6 pb-28">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMode('home')}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8]"
          >
            <ArrowRight className="h-4 w-4 stroke-[1.75]" />
            <span>رجوع</span>
          </button>
          <span className="text-sm font-bold text-[#0A1630] dark:text-white">
            سؤال {quizIndex + 1} من {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {questions.map((item, i) => (
            <span
              key={item.id}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === quizIndex
                  ? 'flex-[2] bg-[#2F6BFF]'
                  : i < quizIndex
                  ? 'flex-1 bg-[#2F6BFF]/45'
                  : 'flex-1 bg-[#E2E8F0] dark:bg-[#1E325C]'
              )}
            />
          ))}
        </div>

        {q && (
          <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-4 sm:rounded-[28px] sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
            <span className="inline-block rounded-full bg-[#2F6BFF]/10 px-3.5 py-1 text-xs font-bold text-[#2F6BFF]">
              {activeQuiz.title}
            </span>
            <h2 className="mt-4 text-[20px] leading-[1.6] font-bold text-[#0A1630] sm:text-[23px] dark:text-white">
              {q.prompt}
            </h2>

            <div className="mt-6 space-y-3">
              {q.options.map((opt) => {
                const chosen = quizSelectedId === opt.id;
                const correctChoice = opt.id === q.correctOptionId;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setQuizSelectedId(opt.id)}
                    className={cn(
                      'min-h-[56px] w-full rounded-[18px] border-2 px-5 py-4 text-right text-[18px] leading-[1.6] font-normal transition-all',
                      chosen && correctChoice
                        ? 'border-[#10B981] bg-[#10B981]/10 font-bold text-[#065F46] dark:text-[#6EE7B7]'
                        : chosen && !correctChoice
                        ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#92400E] dark:text-[#FCD34D]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0A1630] hover:border-[#2F6BFF]/60 dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {selectedOpt && (
              <div
                className={cn(
                  'mt-5 rounded-[20px] border p-5',
                  isCorrect
                    ? 'border-[#10B981]/40 bg-[#10B981]/10'
                    : 'border-[#F59E0B]/40 bg-[#F59E0B]/10'
                )}
              >
                <p className="text-sm font-bold text-[#0A1630] dark:text-white">
                  {isCorrect ? 'إجابة صحيحة — لماذا؟' : 'لماذا؟ (جرّب خياراً آخر)'}
                </p>
                <p className="mt-1.5 text-[18px] leading-[1.8] font-normal text-[#0A1630] dark:text-white">
                  {selectedOpt.why}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E2E8F0] bg-white/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-md dark:border-[#1E325C] dark:bg-[#0A1630]/95">
          <div className="mx-auto flex max-w-[640px]">
            <Button
              type="button"
              disabled={!isCorrect}
              onClick={() => {
                if (!isLastQ) {
                  setQuizIndex((i) => i + 1);
                  setQuizSelectedId(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  const wasDone = unit1CompletedQuizzes.includes(activeQuiz.id);
                  completeUnit1QuickQuiz(activeQuiz.id);
                  if (!wasDone) {
                    awardLabXp('accounting', 50, `اجتياز ${activeQuiz.title}`);
                  }
                  toast.success('رائع! أنهيت الاختبار السريع بنجاح.');
                  openLesson(nextLessonAfterQuiz);
                }
              }}
              className="min-h-[52px] w-full gap-2 text-base font-bold"
            >
              <span>
                {isLastQ
                  ? `متابعة إلى الدرس ${nextLessonAfterQuiz}`
                  : 'السؤال التالي'}
              </span>
              <ChevronLeft className="h-5 w-5 stroke-[1.75]" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // وضع الاختبار الختامي النهائي (في آخر الوحدة الأولى)
  if (mode === 'final_exam') {
    const q = UNIT1_EXAM_QUESTIONS[finalIdx];
    const answeredCount = Object.keys(finalSelected).length;
    const answeredAll = answeredCount >= UNIT1_EXAM_QUESTIONS.length;
    const correctCount = UNIT1_EXAM_QUESTIONS.filter(
      (item) => finalSelected[item.id] === item.correctOptionId
    ).length;
    const scorePct = Math.round(
      (correctCount / Math.max(1, UNIT1_EXAM_QUESTIONS.length)) * 100
    );
    const passed = scorePct >= 70;

    return (
      <div className="mx-auto max-w-[640px] space-y-6 pb-28">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMode('map')}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8]"
          >
            <ArrowRight className="h-4 w-4 stroke-[1.75]" />
            <span>العودة لخريطة الوحدة</span>
          </button>

          {!finalSubmitted && (
            <span className="font-tabular text-sm font-bold text-[#0A1630] dark:text-white">
              سؤال {finalIdx + 1} من {UNIT1_EXAM_QUESTIONS.length}
            </span>
          )}
        </div>

        {!finalSubmitted && (
          <div className="flex items-center gap-1.5">
            {UNIT1_EXAM_QUESTIONS.map((item, i) => (
              <span
                key={item.id}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === finalIdx
                    ? 'flex-[2] bg-[#2F6BFF]'
                    : finalSelected[item.id]
                    ? 'flex-1 bg-[#10B981]/75'
                    : 'flex-1 bg-[#E2E8F0] dark:bg-[#1E325C]'
                )}
              />
            ))}
          </div>
        )}

        {!finalSubmitted && q ? (
          <>
            <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 sm:rounded-[28px] sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#2F6BFF]">
                <span className="rounded-full bg-[#2F6BFF]/10 px-3 py-1">
                  الاختبار النهائي للوحدة الأولى
                </span>
                <span className="font-tabular text-[#64748B] dark:text-[#94A3B8]">
                  أُجيب عن {answeredCount} / {UNIT1_EXAM_QUESTIONS.length}
                </span>
              </div>
              <h2 className="mt-4 text-[19px] leading-[1.65] font-bold text-[#0A1630] sm:text-[22px] dark:text-white">
                {q.prompt}
              </h2>
              <div className="mt-5 space-y-3">
                {q.options.map((opt) => {
                  const chosen = finalSelected[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('tap');
                        setFinalSelected((prev) => ({ ...prev, [q.id]: opt.id }));
                      }}
                      className={cn(
                        'min-h-[54px] w-full rounded-[18px] border-2 px-4 py-3.5 text-right text-[16px] leading-[1.6] transition-all sm:px-5 sm:text-[18px]',
                        chosen
                          ? 'border-[#2F6BFF] bg-[#2F6BFF]/10 font-bold text-[#2F6BFF]'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0A1630] hover:border-[#2F6BFF]/50 dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white'
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E2E8F0] bg-white/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-md dark:border-[#1E325C] dark:bg-[#0A1630]/95">
              <div className="mx-auto flex max-w-[640px] items-center gap-3">
                {finalIdx > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFinalIdx((i) => i - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="min-h-[52px] shrink-0 px-4 text-sm font-bold"
                  >
                    السابق
                  </Button>
                )}
                {finalIdx < UNIT1_EXAM_QUESTIONS.length - 1 ? (
                  <Button
                    type="button"
                    disabled={!finalSelected[q.id]}
                    onClick={() => {
                      setFinalIdx((i) => i + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="min-h-[52px] flex-1 gap-2 text-base font-bold"
                  >
                    <span>السؤال التالي</span>
                    <ChevronLeft className="h-5 w-5 stroke-[1.75]" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={!answeredAll}
                    onClick={() => {
                      recordUnitExamResult(1, scorePct, passed);
                      if (passed) {
                        awardLabXp('accounting', 80, 'اجتياز الاختبار الختامي للوحدة 1');
                        triggerHaptic('success');
                        toast.success(`مبارك! اجتزت الاختبار النهائي بنسبة ${scorePct}% وفُتحت لك الوحدة الثانية.`);
                      } else {
                        triggerHaptic('error');
                        toast.info('يمكنك مراجعة الإجابات وإعادة الاختبار لتحقيق 70% فأكثر.');
                      }
                      setFinalSubmitted(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="min-h-[52px] flex-1 text-base font-bold"
                  >
                    اعتماد النتيجة النهائية
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-5">
            <div className="space-y-4 rounded-[28px] border border-[#E2E8F0] bg-white p-6 text-center sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
              <div
                className={cn(
                  'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
                  passed
                    ? 'bg-[#10B981]/15 text-[#10B981]'
                    : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                )}
              >
                <CheckCircle2 className="h-9 w-9 stroke-[1.75]" />
              </div>
              <span
                className={cn(
                  'inline-block rounded-full px-4 py-1 text-xs font-bold',
                  passed
                    ? 'bg-[#10B981]/15 text-[#047857] dark:text-[#34D399]'
                    : 'bg-[#F59E0B]/15 text-[#B45309] dark:text-[#FBBF24]'
                )}
              >
                {passed ? 'اجتزت الوحدة الأولى بنجاح (+80 نقطة خبرة)' : 'تحتاج إلى 70% فأكثر لفتح الوحدة الثانية'}
              </span>
              <h2 className="font-tabular text-2xl font-bold text-[#0A1630] sm:text-3xl dark:text-white">
                نتيجتك: {scorePct}% ({correctCount} من {UNIT1_EXAM_QUESTIONS.length})
              </h2>
              <p className="text-[16px] leading-relaxed text-[#475569] sm:text-[18px] dark:text-[#CBD5E1]">
                {passed
                  ? 'تهانينا! أنهيت جميع دروس الوحدة الأولى واجتزت الاختبار النهائي بنجاح.'
                  : 'راجع التوضيحات أدناه ثم أعد المحاولة لتثبيت المفاهيم وفتح الوحدة الثانية.'}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
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
                {passed && onUnlockUnit2 && (
                  <Button type="button" onClick={onUnlockUnit2}>
                    الانتقال إلى الوحدة الثانية
                  </Button>
                )}
              </div>
            </div>

            {/* مراجعة أسئلة الاختبار وتفسيراتها */}
            <div className="space-y-3">
              <h3 className="px-1 text-base font-bold text-[#0A1630] dark:text-white">
                مراجعة الأسئلة والإجابات الصحيحة
              </h3>
              {UNIT1_EXAM_QUESTIONS.map((item, idx) => {
                const userChoice = finalSelected[item.id];
                const isItemCorrect = userChoice === item.correctOptionId;
                const correctLabel =
                  item.options.find((o) => o.id === item.correctOptionId)?.label || '';
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-[22px] border p-4 sm:p-5',
                      isItemCorrect
                        ? 'border-[#10B981]/40 bg-[#10B981]/5'
                        : 'border-[#F59E0B]/40 bg-[#F59E0B]/5'
                    )}
                  >
                    <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                      السؤال {idx + 1} · {isItemCorrect ? 'إجابة صحيحة' : 'يحتاج مراجعة'}
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#0A1630] sm:text-base dark:text-white">
                      {item.prompt}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-[#047857] dark:text-[#34D399]">
                      الإجابة الصحيحة: {correctLabel}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
                      {item.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // وضع مشاهدة الفيديو الكامل للمراجعة في نهاية الوحدة
  if (mode === 'review_video') {
    return (
      <div className="mx-auto max-w-[640px] space-y-6 pb-20">
        <button
          type="button"
          onClick={() => setMode('map')}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8]"
        >
          <ArrowRight className="h-4 w-4 stroke-[1.75]" />
          <span>العودة لخريطة الوحدة</span>
        </button>

        <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-4 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.08)] sm:rounded-[28px] sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <span className="inline-block rounded-full bg-[#2F6BFF]/10 px-3.5 py-1 text-xs font-bold text-[#2F6BFF]">
            مراجعة شاملة
          </span>
          <h2 className="mt-4 text-[22px] leading-[1.4] font-bold text-[#0A1630] sm:text-[26px] dark:text-white">
            الفيديو الكامل: أساسيات المحاسبة المالية
          </h2>
          <p className="mt-2 text-[18px] leading-[1.85] font-normal text-[#475569] dark:text-[#CBD5E1]">
            شاهد الشرح الكامل لمراجعة جميع أفكار الوحدة الأولى من البداية إلى النهاية.
          </p>

          <div className="mt-6">
            <VideoPlayer
              lessonId="u1-lesson-12"
              title="أساسيات المحاسبة المالية — المراجعة الكاملة"
            />
          </div>
        </div>
      </div>
    );
  }

  // وضع خريطة دروس الوحدة (القائمة العمودية المتصلة + المراجعة والقاموس والاختبار الختامي في الآخر فقط)
  if (mode === 'map') {
    const examRecord = unitExamResults[1];

    return (
      <div className="mx-auto max-w-[640px] space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMode('home')}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8]"
          >
            <ArrowRight className="h-4 w-4 stroke-[1.75]" />
            <span>العودة لصفحة الوحدة</span>
          </button>
          <span className="font-tabular text-sm font-bold text-[#2F6BFF]">
            {completedGradedLessons.length} / {gradedLessonsCount} مكتمل
          </span>
        </div>

        <div className="px-1">
          <h2 className="text-2xl font-bold text-[#0A1630] dark:text-white">
            مسار دروس الوحدة الأولى
          </h2>
          <p className="mt-1 text-base text-[#526077] dark:text-[#94A3B8]">
            تبدأ بالنظرة العامة ثم يُفتح كل درس بعد إنهاء الدرس الذي يسبقه.
          </p>
        </div>

        {/* المسار العمودي المتصل للتمهيد والدروس الاثني عشر */}
        <div className="relative space-y-3 before:absolute before:top-7 before:right-[27px] before:bottom-7 before:w-0.5 before:bg-[#E2E8F0] dark:before:bg-[#1E325C]">
          {UNIT1_LESSONS_META.map((item) => {
            const isDone = unit1CompletedLessons.includes(item.lessonNumber);
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
                      {!item.isAvailable && <span>· سيتوفر في الدفعة القادمة</span>}
                    </p>
                  </div>
                </button>

                {UNIT1_QUICK_QUIZZES.map((quiz) => {
                  if (quiz.afterLessonNumber !== item.lessonNumber) return null;
                  const quizUnlocked = unit1CompletedLessons.includes(
                    quiz.afterLessonNumber
                  );
                  const quizDone = unit1CompletedQuizzes.includes(quiz.id);
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

        {/* في نهاية الوحدة فقط: مراجعة الفيديو الكامل، قاموس المصطلحات الاختياري، والاختبار الختامي */}
        <div className="space-y-3 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#E2E8F0] bg-white p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div>
              <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
                مراجعة الوحدة بالفيديو الكامل
              </h3>
              <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
                شاهد فيديو المراجعة الختامية للوحدة الأولى كاملة قبل الاختبار النهائي.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode('review_video');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="gap-1.5"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>شاهد فيديو المراجعة</span>
            </Button>
          </div>

          <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
            <button
              type="button"
              onClick={() => setGlossaryOpen((v) => !v)}
              className="flex min-h-[44px] w-full items-center justify-between text-right font-bold text-[#0A1630] dark:text-white"
            >
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#2F6BFF]" />
                <span>قاموس المصطلحات (اختياري)</span>
              </span>
              <span className="text-xs text-[#2F6BFF]">
                {glossaryOpen ? 'إخفاء' : 'عرض'}
              </span>
            </button>

            {glossaryOpen && (
              <div className="mt-4 space-y-2.5 border-t border-[#E2E8F0] pt-4 dark:border-[#1E325C]">
                {UNIT1_GLOSSARY_TERMS.map((term) => (
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

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#2F6BFF]/35 bg-[#F8FAFF] p-5 dark:border-[#2F6BFF]/40 dark:bg-[#0D1C3D]">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#2F6BFF]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#2F6BFF]">
                <FolderOpen className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>ملف: الوحدة 1 تطبيق عملي</span>
              </span>
              <h3 className="mt-1.5 text-base font-bold text-[#0A1630] dark:text-white">
                الوحدة 1 تطبيق عملي (مشروع الجداول المحاسبية — 3 مراحل)
              </h3>
              <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
                تطبيق عملي موحد من الكتاب (ص 14–36): جدول دليل الحسابات، احتساب التكلفة التاريخية واليومية، وقائمة الدخل والميزانية.
              </p>
            </div>
            <Link href="/student/labs/accounting?assignmentId=asg-u1-comprehensive">
              <Button type="button" className="gap-1.5">
                <FileSpreadsheet className="h-4 w-4 stroke-[1.75]" />
                <span>افتح جداول المشروع (3 مراحل)</span>
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#2F6BFF]/30 bg-white p-5 dark:border-[#2F6BFF]/40 dark:bg-[#0A1630]">
            <div>
              <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
                الاختبار النهائي للوحدة الأولى ({UNIT1_EXAM_QUESTIONS.length} أسئلة)
              </h3>
              <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
                {examRecord
                  ? `أعلى نتيجة لك: ${examRecord.scorePct}%`
                  : 'تقييم نهائي شامل لجميع دروس الوحدة الأولى (70% للانتقال للوحدة 2)'}
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

  // الصفحة الرئيسية للوحدة (نظيفة تماماً: عنوان، جملة واحدة، شريط التقدم، وزر واحد كبير فقط)
  const progressPct = Math.round(
    (completedGradedLessons.length / Math.max(1, gradedLessonsCount)) * 100
  );
  const allUnit1LessonsDone = completedGradedLessons.length >= gradedLessonsCount;
  const primaryButtonText = pendingQuickQuiz
    ? `ابدأ ${pendingQuickQuiz.title}`
    : needsLesson0
    ? 'ابدأ الدرس 0: نظرة عامة على الوحدة'
    : allUnit1LessonsDone && !unitExamResults[1]?.passed
    ? 'ابدأ الاختبار النهائي للوحدة الأولى'
    : completedGradedLessons.length === 0
    ? 'ابدأ الدرس 1'
    : `تابع الدرس ${resumeLessonNum}`;

  return (
    <div className="mx-auto max-w-[640px] space-y-6 py-4 pb-16">
      <button
        type="button"
        onClick={onBackToMap}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8]"
      >
        <ArrowRight className="h-4 w-4 stroke-[1.75]" />
        <span>خريطة المنهاج</span>
      </button>

      <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-7 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.08)] sm:p-10 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <p className="text-sm font-bold text-[#2F6BFF]">
          {needsLesson0
            ? `خطوة تمهيدية قبل الدرس 1 من ${gradedLessonsCount}`
            : allUnit1LessonsDone
            ? `أتممت جميع الدروس (${gradedLessonsCount} / ${gradedLessonsCount})`
            : `أنت في الدرس ${resumeLessonNum} من ${gradedLessonsCount}`}
        </p>

        <h1 className="mt-3 text-[26px] leading-[1.3] font-bold text-[#0A1630] sm:text-[32px] dark:text-white">
          الوحدة 1: مدخل إلى علم المحاسبة
        </h1>

        <p className="mt-4 text-[18px] leading-[1.85] font-normal text-[#475569] sm:text-[20px] dark:text-[#CBD5E1]">
          ستتعلّم هنا معنى المحاسبة ولماذا يحتاجها كل مشروع بأسلوب مبسط يبدأ من حياتك اليومية.
        </p>

        {/* شريط التقدم */}
        <div className="mt-7 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            <span>التقدم في الوحدة</span>
            <span className="font-tabular">
              {completedGradedLessons.length} / {gradedLessonsCount} دروس ({progressPct}%)
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F1F5F9] dark:bg-[#070D1F]">
            <div
              className="h-full rounded-full bg-[#2F6BFF] transition-all duration-500"
              style={{ width: `${Math.max(progressPct, 3)}%` }}
            />
          </div>
        </div>

        {/* زر واحد كبير فقط */}
        <Button
          type="button"
          onClick={handlePrimaryStart}
          className="mt-8 min-h-[56px] w-full gap-2 text-lg font-bold"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>{primaryButtonText}</span>
        </Button>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setMode('map')}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-sm font-bold text-[#526077] hover:text-[#2F6BFF] dark:text-[#94A3B8]"
          >
            عرض خريطة دروس الوحدة ({gradedLessonsCount} درساً)
          </button>
        </div>
      </div>

      {/* مدخل مباشر لملف: الوحدة 1 تطبيق عملي (مشروع الجداول المحاسبية من 3 مراحل) */}
      <Link
        href="/student/labs/accounting?assignmentId=asg-u1-comprehensive"
        className="flex flex-col justify-between rounded-[24px] border border-[#2F6BFF]/35 bg-white p-5 text-right shadow-sm transition-all hover:border-[#2F6BFF] dark:border-[#2F6BFF]/35 dark:bg-[#0A1630]"
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F6BFF]/10 px-2.5 py-1 text-[11px] font-bold text-[#2F6BFF]">
              <FolderOpen className="h-3.5 w-3.5 stroke-[1.75]" />
              <span>ملف: الوحدة 1 تطبيق عملي</span>
            </span>
            <span className="font-tabular text-xs font-bold text-[#047857] dark:text-[#34D399]">
              3 مراحل · +150 XP
            </span>
          </div>
          <h2 className="mt-3 text-base font-bold text-[#0A1630] dark:text-white">
            الوحدة 1 تطبيق عملي (مشروع الجداول المحاسبية — 3 مراحل)
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#526077] dark:text-[#94A3B8]">
            جداول تفاعلية من الكتاب المقرر: دليل الحسابات والمستندات، التكلفة التاريخية واليومية (14,500 د.أ)، وقائمة الدخل والميزانية (35,000 د.أ).
          </p>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#2F6BFF]">
          <span>افتح جداول المشروع التطبيقي</span>
          <ChevronLeft className="h-3.5 w-3.5 stroke-[1.75]" />
        </span>
      </Link>
    </div>
  );
}
