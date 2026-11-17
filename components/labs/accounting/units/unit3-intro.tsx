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

  // شاشة النظرة العامة
  if (mode === 'overview') {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
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
          <Badge className="bg-[#2563EB]/10 text-[#2563EB]">
            الفصل الثالث: نظرة عامة
          </Badge>
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-soft sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <h2 className="text-xl font-bold text-[#0A1630] sm:text-2xl dark:text-white">
            الدورة المحاسبية (Accounting Cycle): التسجيل، الترحيل، ميزان المراجعة، والقوائم المالية
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#526077] dark:text-[#94A3B8]">
            يشرح هذا الفصل الركائز الأساسية لمسك الدفاتر المحاسبية وفق أهداف المنهاج الجامعي المعتمد: فهم طبيعة الحسابات المدينة والدائنة، إثبات قيود اليومية البسيطة والمركبة، الترحيل لدفتر الأستاذ (حسابات T)، الترصيد، إعداد ميزان المراجعة، وإعداد القوائم المالية للمشاريع الخدمية.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
              <h4 className="flex items-center gap-2 text-sm font-bold text-[#0A1630] dark:text-white">
                <FileSpreadsheet className="h-4 w-4 text-[#2563EB]" />
                أهداف الفصل الثالث من الكتاب
              </h4>
              <ul className="mt-2 space-y-1 text-xs text-[#526077] dark:text-[#94A3B8]">
                <li>• معرفة الطرف المدين والطرف الدائن للقيد المحاسبي.</li>
                <li>• كيفية تسجيل العمليات وعمل قيود اليومية.</li>
                <li>• معرفة دفتر اليومية وتقسيماته.</li>
                <li>• التعرف على دفتر الأستاذ وتقسيماته.</li>
                <li>• كيفية الترحيل إلى دفتر الأستاذ.</li>
                <li>• كيفية الترصيد واستخراج أرصدة الحسابات.</li>
                <li>• التعرف على ميزان المراجعة.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
              <h4 className="flex items-center gap-2 text-sm font-bold text-[#0A1630] dark:text-white">
                <Calculator className="h-4 w-4 text-emerald-600" />
                تطبيقات وتمارين عملية بالكتاب
              </h4>
              <ul className="mt-2 space-y-1 text-xs text-[#526077] dark:text-[#94A3B8]">
                <li>• تمرين تصنيف الحسابات إلى (أصول، التزامات، حقوق ملكية).</li>
                <li>• تمرين محلات حازم لاستخراج:</li>
                <li>&nbsp;&nbsp;1) صافي الدخل (الإيرادات 23,000 - المصاريف 12,000 = 11,000).</li>
                <li>&nbsp;&nbsp;2) رأس مال نهاية الفترة (5,000 + 11,000 - 1,000 = 15,000).</li>
                <li>&nbsp;&nbsp;3) إجمالي الأصول (25,000 د.أ).</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              size="lg"
              onClick={handleFinishOverviewAndStartLesson1}
              className="gap-2"
            >
              <span>بدء المساق الأول: الطرف المدين والدائن</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // الشاشة الرئيسية لخريطة الوحدة الثالثة
  const totalGraded = UNIT3_LESSONS_META.filter((m) => m.lessonNumber >= 1).length;
  const doneCount = (unit3CompletedLessons || []).filter((n) => n >= 1).length;
  const progressPct = Math.round((doneCount / totalGraded) * 100);

  return (
    <div className="space-y-6">
      {/* رأس الصفحة مع شريط التقدم */}
      <div className="flex flex-col gap-4 rounded-[28px] border border-[#E2E8F0] bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToMap}
              className="h-8 gap-1 px-2 text-xs text-[#64748B] hover:text-[#0A1630] dark:text-[#94A3B8] dark:hover:text-white"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>خريطة المنهاج</span>
            </Button>
            <span className="text-xs text-[#CBD5E1] dark:text-[#334155]">/</span>
            <Badge className="bg-[#2563EB]/10 text-[#2563EB]">
              الوحدة 3
            </Badge>
          </div>
          <h1 className="mt-2 text-lg font-bold text-[#0A1630] sm:text-2xl dark:text-white">
            الدورة المحاسبية: التسجيل، الترحيل، ميزان المراجعة، والقوائم المالية
          </h1>
          <p className="mt-1 text-xs text-[#64748B] sm:text-sm dark:text-[#94A3B8]">
            7 مساقات تعليمية وتطبيقية متوافقة نصاً وتفصيلاً مع أهداف الفصل الثالث من الكتاب الجامعي.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGlossaryOpen(true)}
              className="h-8 gap-1.5 text-xs"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>قاموس المصطلحات</span>
            </Button>
            <Button
              size="sm"
              onClick={() => openLesson(resumeLessonNum)}
              className="h-8 gap-1.5 text-xs"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>متابعة التعلم (المساق {resumeLessonNum})</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>إنجاز الوحدة: {progressPct}%</span>
            <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <span
                className="block h-full bg-[#2563EB] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </span>
          </div>
        </div>
      </div>

      {/* مسارات الدروس */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {UNIT3_LESSONS_META.map((lesson) => {
          const isDone = (unit3CompletedLessons || []).includes(lesson.lessonNumber);
          const isUnlocked =
            lesson.lessonNumber === 0 ||
            lesson.lessonNumber <= highestCompleted + 1;
          const isCurrent =
            !isDone &&
            (lesson.lessonNumber === 0
              ? needsLesson0
              : lesson.lessonNumber === resumeLessonNum);

          return (
            <button
              key={lesson.id}
              type="button"
              disabled={!isUnlocked}
              onClick={() => openLesson(lesson.lessonNumber)}
              className={cn(
                'group relative flex w-full items-start gap-3.5 rounded-[22px] border p-4 text-right transition-all sm:p-5',
                isDone
                  ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 dark:border-emerald-900/40 dark:bg-emerald-950/10'
                  : isCurrent
                  ? 'border-[#2563EB] bg-[#2563EB]/[0.03] shadow-md ring-2 ring-[#2563EB]/15'
                  : isUnlocked
                  ? 'border-[#E2E8F0] bg-white hover:-translate-y-0.5 hover:border-[#2563EB]/40 dark:border-[#1E325C] dark:bg-[#0A1630]'
                  : 'cursor-not-allowed border-[#E2E8F0]/70 bg-[#F8FAFC] opacity-60 dark:border-[#1E325C]/60 dark:bg-[#070D1F]'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-tabular text-sm font-bold',
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : isUnlocked
                    ? 'border border-[#E2E8F0] bg-white text-[#0A1630] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white'
                    : 'bg-[#E2E8F0] text-[#94A3B8] dark:bg-[#1E325C] dark:text-[#64748B]'
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isUnlocked ? (
                  lesson.lessonNumber === 0 ? '★' : lesson.lessonNumber
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-[#0A1630] sm:text-base dark:text-white">
                    {lesson.title}
                  </h4>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold',
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : isCurrent
                        ? 'bg-[#2563EB]/10 text-[#2563EB]'
                        : isUnlocked
                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    )}
                  >
                    {isDone ? 'مكتمل' : isCurrent ? 'الحالي' : isUnlocked ? 'متاح' : 'مقفل'}
                  </span>
                </div>

                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                  {lesson.shortGoal}
                </p>

                <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[#94A3B8]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.estimatedMinutes} دقائق
                  </span>
                  {lesson.quickQuizAfterId && (
                    <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                      ⚡ اختبار سريع
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* بطاقة الاختبار الختامي للوحدة 3 */}
      <div className="rounded-[28px] border-2 border-dashed border-[#2563EB]/30 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-6 dark:border-[#1E325C] dark:from-[#0A1630] dark:to-[#070D1F]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
                الاختبار الشامل للوحدة 3 (الفصل الثالث)
              </h3>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              12 سؤالاً شاملاً تغطي أهداف الفصل الثالث وتمارين الكتاب وتمنحك شارة "مشغل الدورة المحاسبية".
            </p>
          </div>
          <Button
            onClick={openFinalExam}
            disabled={highestCompleted < 4}
            className="shrink-0 gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            <span>بدء الاختبار الشامل (12 سؤال)</span>
          </Button>
        </div>
      </div>

      {/* نافذة قاموس المصطلحات */}
      {glossaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-2xl dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 dark:border-[#1E325C]">
              <div>
                <h3 className="text-lg font-bold text-[#0A1630] dark:text-white">
                  قاموس مصطلحات الدورة المحاسبية (الفصل الثالث)
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  المصطلحات العربية والإنجليزية المعتمدة في المنهاج.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGlossaryOpen(false)}
              >
                إغلاق
              </Button>
            </div>

            <div className="mt-4 divide-y divide-[#E2E8F0] dark:divide-[#1E325C]">
              {UNIT3_GLOSSARY_TERMS.map((term, i) => (
                <div key={i} className="py-3 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2563EB] dark:text-blue-400">
                      {term.arabicTerm}
                    </span>
                    <span className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {term.englishTerm}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#526077] dark:text-[#94A3B8]">
                    {term.simpleMeaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
