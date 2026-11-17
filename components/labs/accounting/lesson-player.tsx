'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getRequireVideoWatchBeforeNext,
  getResolvedLessonVideo,
} from '@/data/lessonVideos';
import { useAppStore } from '@/store/use-app-store';
import { useAccountingLabStore } from '@/lib/labs/accounting/store';
import {
  getUnit1LegoTaskByLesson,
  type LegoTaskConfig,
} from '@/lib/labs/accounting/unit1-lego-tasks';
import type { UnitLessonData } from '@/lib/labs/accounting/unit1-lessons/types';
import { Unit1LessonSvg } from './unit1-lesson-svgs';
import { Unit1LegoBuilder } from './unit1-lego-builder';
import { isLessonVideoWatched, VideoPlayer } from './video-player';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LessonStep =
  | { kind: 'opening' }
  | { kind: 'video' }
  | { kind: 'card'; cardIndex: number }
  | { kind: 'story' }
  | { kind: 'try_it' }
  | { kind: 'lego_lab' }
  | { kind: 'summary' };

export interface LessonPlayerProps {
  lesson: UnitLessonData;
  totalLessons: number;
  initialStep?: number;
  nextLessonAvailable: boolean;
  hasQuizNext: boolean;
  isFinalLesson?: boolean;
  onStepChange?: (lessonNumber: number, stepIndex: number) => void;
  onCompleteLesson: (lesson: UnitLessonData) => void;
  onBackToUnit: () => void;
}

export function LessonPlayer({
  lesson,
  totalLessons,
  initialStep = 0,
  nextLessonAvailable,
  hasQuizNext,
  isFinalLesson = false,
  onStepChange,
  onCompleteLesson,
  onBackToUnit,
}: LessonPlayerProps) {
  const { awardLabXp } = useAppStore();
  const { unit1CompletedLegoTasks, completeUnit1LegoTask } =
    useAccountingLabStore();

  const legoTask = useMemo(
    () => getUnit1LegoTaskByLesson(lesson.lessonNumber),
    [lesson.lessonNumber]
  );

  const steps: LessonStep[] = useMemo(() => {
    const list: LessonStep[] = [{ kind: 'opening' }, { kind: 'video' }];
    lesson.explanationCards.forEach((_, idx) => {
      list.push({ kind: 'card', cardIndex: idx });
    });
    list.push({ kind: 'story' }, { kind: 'try_it' });
    if (legoTask) {
      list.push({ kind: 'lego_lab' });
    }
    list.push({ kind: 'summary' });
    return list;
  }, [lesson.explanationCards, legoTask]);

  const safeInitial = Math.max(0, Math.min(steps.length - 1, initialStep));

  const [hydrated, setHydrated] = useState(false);
  const [stepIndex, setStepIndex] = useState(safeInitial);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [legoPlacements, setLegoPlacements] = useState<Record<string, string>>(
    {}
  );
  const [legoSolvedInSession, setLegoSolvedInSession] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [requireWatch, setRequireWatch] = useState(false);
  const [trackedLessonId, setTrackedLessonId] = useState(lesson.id);

  if (trackedLessonId !== lesson.id) {
    setTrackedLessonId(lesson.id);
    setStepIndex(safeInitial);
    setSelectedOptionId(null);
    setLegoPlacements({});
    setLegoSolvedInSession(false);
    setVideoWatched(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHydrated(true);
      setVideoWatched(isLessonVideoWatched(lesson.id));
      setRequireWatch(getRequireVideoWatchBeforeNext());
    }, 0);
    return () => window.clearTimeout(timer);
  }, [lesson.id]);

  const videoConfig = useMemo(
    () => (hydrated ? getResolvedLessonVideo(lesson.id) : undefined),
    [hydrated, lesson.id]
  );
  const hasVideoSource = Boolean(
    videoConfig?.url || videoConfig?.hlsUrl || videoConfig?.youtubeId
  );

  useEffect(() => {
    onStepChange?.(lesson.lessonNumber, stepIndex);
  }, [lesson.lessonNumber, stepIndex, onStepChange]);

  const currentStep = steps[stepIndex] || steps[0];
  const isLastStep = stepIndex === steps.length - 1;

  const selectedOption = lesson.tryItQuestion.options.find(
    (o) => o.id === selectedOptionId
  );
  const isTryItSolved =
    selectedOptionId === lesson.tryItQuestion.correctOptionId;

  const isLegoAlreadyCompleted = Boolean(
    legoTask && unit1CompletedLegoTasks.includes(legoTask.id)
  );
  const isLegoSolved =
    !legoTask || isLegoAlreadyCompleted || legoSolvedInSession;

  const handleLegoComplete = (completedTask: LegoTaskConfig) => {
    setLegoSolvedInSession(true);
    if (!unit1CompletedLegoTasks.includes(completedTask.id)) {
      completeUnit1LegoTask(completedTask.id);
      awardLabXp(
        'accounting',
        completedTask.xpReward,
        `إتمام التطبيق العملي: ${completedTask.title}`
      );
      toast.success(
        `أحسنت! تم إتمام التطبيق العملي وإضافة +${completedTask.xpReward} XP لحسابك`
      );
    } else {
      toast.success('تم التحقق من التركيب العملي بنجاح');
    }
  };

  const isNextBlocked =
    (currentStep.kind === 'try_it' && !isTryItSolved) ||
    (currentStep.kind === 'lego_lab' && !isLegoSolved) ||
    (currentStep.kind === 'video' &&
      hasVideoSource &&
      requireWatch &&
      !videoWatched);

  const handleNext = () => {
    if (isNextBlocked) return;
    if (isLastStep) {
      onCompleteLesson(lesson);
      return;
    }
    setStepIndex((i) => Math.min(steps.length - 1, i + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (stepIndex === 0) return;
    setStepIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishLabel = hasQuizNext
    ? 'فهمت، ابدأ الاختبار السريع'
    : isFinalLesson
    ? 'إنهاء المراجعة وبدء الاختبار النهائي للوحدة'
    : nextLessonAvailable
    ? 'فهمت، الدرس التالي'
    : 'فهمت، العودة للوحدة';

  return (
    <div
      className={cn(
        'mx-auto flex min-h-[calc(100dvh-140px)] w-full flex-col justify-between pb-24 sm:px-0',
        currentStep.kind === 'lego_lab' ? 'max-w-[780px]' : 'max-w-[640px]'
      )}
    >
      {/* شريط علوي هادئ + مؤشر نقاط الخطوات */}
      <div className="sticky top-0 z-30 -mx-3 space-y-3 bg-[#F4F7FB]/92 px-3 pt-1 pb-3 backdrop-blur-md sm:static sm:mx-0 sm:space-y-4 sm:bg-transparent sm:px-0 sm:pt-0 sm:pb-0 sm:backdrop-blur-none dark:bg-[#050B18]/92">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBackToUnit}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full px-2.5 text-xs font-bold text-[#475569] transition-colors hover:bg-[#F1F5F9] hover:text-[#0A1630] sm:min-h-[44px] sm:px-3 sm:text-sm dark:text-[#94A3B8] dark:hover:bg-[#0A1630] dark:hover:text-white"
          >
            <ArrowRight className="h-4 w-4 shrink-0 stroke-[1.75]" />
            <span>خروج من الدرس</span>
          </button>

          <p className="text-xs font-bold text-[#0A1630] sm:text-sm dark:text-white">
            أنت في الدرس {lesson.lessonNumber} من {totalLessons}
          </p>
        </div>

        {/* شريط التقدم الرفيع بنقاط بعدد الخطوات */}
        <div
          aria-label={`الخطوة ${stepIndex + 1} من ${steps.length}`}
          className="flex items-center gap-1.5"
        >
          {steps.map((_, idx) => {
            const passed = idx < stepIndex;
            const current = idx === stepIndex;
            return (
              <span
                key={idx}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none',
                  current
                    ? 'flex-[2] bg-[#2F6BFF]'
                    : passed
                    ? 'flex-1 bg-[#2F6BFF]/45'
                    : 'flex-1 bg-[#E2E8F0] dark:bg-[#1E325C]'
                )}
              />
            );
          })}
        </div>
      </div>

      {/* منطقة المحتوى الواحد (فكرة واحدة فقط في كل شاشة) */}
      <div
        key={`${lesson.id}-${stepIndex}`}
        className="my-4 rounded-[24px] border border-[#E2E8F0] bg-white p-4 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.08)] animate-in fade-in-0 duration-200 motion-reduce:animate-none sm:my-8 sm:rounded-[28px] sm:p-9 dark:border-[#1E325C] dark:bg-[#0A1630]"
      >
        {currentStep.kind === 'opening' && (
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-[#2F6BFF]/10 px-3.5 py-1 text-xs font-bold text-[#2F6BFF]">
              الدرس {lesson.lessonNumber}: {lesson.title}
            </span>
            <Unit1LessonSvg
              illustrationKey={lesson.openingQuestion.illustrationKey}
            />
            <h2 className="text-[22px] leading-[1.5] font-bold text-[#0A1630] sm:text-[26px] dark:text-white">
              {lesson.openingQuestion.question}
            </h2>
            <p className="text-[18px] leading-[1.85] font-normal text-[#475569] sm:text-[20px] dark:text-[#CBD5E1]">
              {lesson.openingQuestion.context}
            </p>
          </div>
        )}

        {currentStep.kind === 'video' && (
          <div className="space-y-5">
            <div>
              <span className="inline-block rounded-full bg-[#2F6BFF]/10 px-3.5 py-1 text-xs font-bold text-[#2F6BFF]">
                فيديو الشرح القصير
              </span>
              <h2 className="mt-3 text-[22px] font-bold text-[#0A1630] dark:text-white">
                {lesson.title}
              </h2>
            </div>

            <VideoPlayer
              key={lesson.id}
              lessonId={lesson.id}
              title={lesson.title}
              videoConfig={videoConfig}
              onWatchedComplete={() => setVideoWatched(true)}
              onSkip={
                hasVideoSource && requireWatch && !videoWatched
                  ? undefined
                  : () => {
                      setStepIndex((i) => Math.min(steps.length - 1, i + 1));
                    }
              }
            />
          </div>
        )}

        {currentStep.kind === 'card' && (() => {
          const card = lesson.explanationCards[currentStep.cardIndex];
          if (!card) return null;
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="inline-block rounded-full bg-[#2F6BFF]/10 px-3.5 py-1 text-xs font-bold text-[#2F6BFF]">
                  فكرة {currentStep.cardIndex + 1} من{' '}
                  {lesson.explanationCards.length}
                </span>
              </div>

              <Unit1LessonSvg illustrationKey={card.illustrationKey} />

              <h2 className="text-[22px] leading-[1.45] font-bold text-[#0A1630] sm:text-[25px] dark:text-white">
                {card.title}
              </h2>

              <p className="text-[18px] leading-[1.9] font-normal text-[#0A1630] sm:text-[20px] dark:text-[#E2E8F0]">
                {card.body}
              </p>

              <div className="rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-5 dark:border-[#1E325C] dark:bg-[#070D1F]">
                <p className="text-sm font-bold text-[#2F6BFF]">
                  تشبيه من حياتك اليومية
                </p>
                <p className="mt-1.5 text-[18px] leading-[1.8] font-normal text-[#475569] dark:text-[#CBD5E1]">
                  {card.analogy}
                </p>
              </div>
            </div>
          );
        })()}

        {currentStep.kind === 'story' && (
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-[#10B981]/15 px-3.5 py-1 text-xs font-bold text-[#047857] dark:text-[#34D399]">
              مثال من القصة: محل حلويات سارة
            </span>

            <Unit1LessonSvg
              illustrationKey={lesson.storyExample.illustrationKey}
            />

            <h2 className="text-[22px] font-bold text-[#0A1630] sm:text-[25px] dark:text-white">
              {lesson.storyExample.storyTitle}
            </h2>

            <p className="text-[18px] leading-[1.9] font-normal text-[#0A1630] sm:text-[20px] dark:text-[#E2E8F0]">
              {lesson.storyExample.scenario}
            </p>

            <div className="space-y-2.5 rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-5 dark:border-[#1E325C] dark:bg-[#070D1F]">
              {lesson.storyExample.numbersSummary.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 border-b border-[#E2E8F0]/70 pb-2 text-[17px] last:border-b-0 last:pb-0 dark:border-[#1E325C]"
                >
                  <span className="font-normal text-[#475569] dark:text-[#CBD5E1]">
                    {row.label}
                  </span>
                  <span className="font-tabular font-bold text-[#0A1630] dark:text-white">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[18px] leading-[1.8] font-bold text-[#2F6BFF]">
              {lesson.storyExample.takeaway}
            </p>
          </div>
        )}

        {currentStep.kind === 'try_it' && (
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-[#2F6BFF]/10 px-3.5 py-1 text-xs font-bold text-[#2F6BFF]">
              جرّب بنفسك
            </span>

            <h2 className="text-[20px] leading-[1.6] font-bold text-[#0A1630] sm:text-[23px] dark:text-white">
              {lesson.tryItQuestion.prompt}
            </h2>

            <div className="space-y-3">
              {lesson.tryItQuestion.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrectOpt =
                  opt.id === lesson.tryItQuestion.correctOptionId;
                const showAsCorrect = isSelected && isCorrectOpt;
                const showAsGentleRetry = isSelected && !isCorrectOpt;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={cn(
                      'min-h-[58px] w-full rounded-[18px] border-2 px-5 py-4 text-right text-[18px] leading-[1.6] font-normal transition-all',
                      showAsCorrect
                        ? 'border-[#10B981] bg-[#10B981]/10 font-bold text-[#065F46] dark:text-[#6EE7B7]'
                        : showAsGentleRetry
                        ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#92400E] dark:text-[#FCD34D]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0A1630] hover:border-[#2F6BFF]/60 dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {selectedOption && (
              <div
                className={cn(
                  'rounded-[20px] border p-5',
                  isTryItSolved
                    ? 'border-[#10B981]/40 bg-[#10B981]/10'
                    : 'border-[#F59E0B]/40 bg-[#F59E0B]/10'
                )}
              >
                <p
                  className={cn(
                    'text-sm font-bold',
                    isTryItSolved
                      ? 'text-[#047857] dark:text-[#34D399]'
                      : 'text-[#B45309] dark:text-[#FBBF24]'
                  )}
                >
                  {isTryItSolved ? 'إجابة صحيحة — لماذا؟' : 'لماذا؟ (حاول مرة أخرى)'}
                </p>
                <p className="mt-1.5 text-[18px] leading-[1.8] font-normal text-[#0A1630] dark:text-white">
                  {selectedOption.why}
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep.kind === 'lego_lab' && legoTask && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-xs font-bold text-[#2F6BFF]">
                <Blocks className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>تطبيق عملي</span>
              </span>
              {isLegoSolved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/15 px-3 py-1 text-xs font-bold text-[#047857] dark:text-[#34D399]">
                  <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.75]" />
                  <span>تم التركيب بنجاح — يمكنك المتابعة</span>
                </span>
              )}
            </div>

            <Unit1LegoBuilder
              key={legoTask.id}
              task={legoTask}
              value={legoPlacements}
              onChange={setLegoPlacements}
              alreadyCompleted={isLegoAlreadyCompleted}
              onComplete={handleLegoComplete}
            />
          </div>
        )}

        {currentStep.kind === 'summary' && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981]">
              <CheckCircle2 className="h-9 w-9 stroke-[1.75]" />
            </div>

            <span className="inline-block rounded-full bg-[#10B981]/15 px-4 py-1 text-xs font-bold text-[#047857] dark:text-[#34D399]">
              خلاصة الدرس {lesson.lessonNumber}
            </span>

            <p className="text-[20px] leading-[1.85] font-bold text-[#0A1630] sm:text-[23px] dark:text-white">
              {lesson.summary}
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2 text-sm font-bold text-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]">
              <span>+{lesson.xpReward} نقطة خبرة عند الإنهاء</span>
            </div>
          </div>
        )}
      </div>

      {/* شريط التنقل السفلي الثابت فوق المنطقة الآمنة لإبهام اليد */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E2E8F0] bg-white/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-md dark:border-[#1E325C] dark:bg-[#0A1630]/95">
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          {stepIndex > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              className="min-h-[52px] shrink-0 gap-1.5 px-4 text-sm font-bold"
            >
              <ChevronRight className="h-4 w-4 stroke-[1.75]" />
              <span>السابق</span>
            </Button>
          )}

          <Button
            type="button"
            disabled={isNextBlocked}
            onClick={handleNext}
            className="min-h-[52px] flex-1 gap-2 text-base font-bold"
          >
            <span>{isLastStep ? finishLabel : 'التالي'}</span>
            <ChevronLeft className="h-5 w-5 stroke-[1.75]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
