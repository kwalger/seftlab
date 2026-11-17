'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  Clock,
  Check,
  Eye,
  EyeOff,
  LayoutGrid,
  Sparkles,
  Layers,
  GraduationCap,
} from 'lucide-react';
import {
  EXAM_BANK_QUESTIONS,
  EXAM_UNITS_CONFIG,
  ExamBankQuestion,
  ExamQuestionType,
} from '@/data/examBankQuestions';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

type FilterType = 'all' | ExamQuestionType;
type SelectedUnitType = 1 | 2 | 'all' | null;

export default function ExamBankPage() {
  // حالة اختيار الوحدة: null تعني عرض صفحة "اختيار الوحدة"
  const [selectedUnit, setSelectedUnit] = useState<SelectedUnitType>(null);

  // فلتر نوع السؤال داخل الامتحان
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  // تخزين إجابات الطالب: questionId -> answerId
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // للأسئلة المقالية: هل كشف الطالب الإجابة النموذجية؟
  const [revealedEssayAnswers, setRevealedEssayAnswers] = useState<Record<string, boolean>>({});

  // للأسئلة المقالية: التقييم الذاتي
  const [essaySelfGrading, setEssaySelfGrading] = useState<Record<string, 'correct' | 'review'>>({});

  // أسئلة الوحدة المختارة
  const unitQuestions = useMemo(() => {
    if (selectedUnit === null) return [];
    if (selectedUnit === 'all') return EXAM_BANK_QUESTIONS;
    return EXAM_BANK_QUESTIONS.filter((q) => q.unit === selectedUnit);
  }, [selectedUnit]);

  // أسئلة الوحدة مفلترة حسب النوع
  const filteredQuestions = useMemo(() => {
    if (selectedFilter === 'all') return unitQuestions;
    return unitQuestions.filter((q) => q.type === selectedFilter);
  }, [unitQuestions, selectedFilter]);

  // تصحيح المؤشر عند تغيير الفلتر
  const safeCurrentIndex = Math.min(
    currentIndex,
    Math.max(0, filteredQuestions.length - 1)
  );
  const currentQ: ExamBankQuestion | undefined = filteredQuestions[safeCurrentIndex];

  // إحصائيات الإنجاز
  const answeredCount = useMemo(() => {
    return filteredQuestions.filter((q) => {
      if (q.type === 'essay') return Boolean(essaySelfGrading[q.id]);
      return Boolean(userAnswers[q.id]);
    }).length;
  }, [filteredQuestions, userAnswers, essaySelfGrading]);

  const correctCount = useMemo(() => {
    return filteredQuestions.filter((q) => {
      if (q.type === 'essay') return essaySelfGrading[q.id] === 'correct';
      return userAnswers[q.id] && userAnswers[q.id] === q.correctOptionId;
    }).length;
  }, [filteredQuestions, userAnswers, essaySelfGrading]);

  const scorePct =
    filteredQuestions.length > 0
      ? Math.round((correctCount / filteredQuestions.length) * 100)
      : 0;

  // اختيار وحدة معينة وبدء الاختبار
  const handleSelectUnit = (unit: 1 | 2 | 'all') => {
    triggerHaptic('tap');
    setSelectedUnit(unit);
    setSelectedFilter('all');
    setCurrentIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // العودة لشاشة اختيار الوحدة
  const handleBackToUnitSelection = () => {
    triggerHaptic('tap');
    setSelectedUnit(null);
    setCurrentIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // التعامل مع اختيار الإجابة
  const handleSelectAnswer = (optionId: string) => {
    if (!currentQ) return;
    triggerHaptic('tap');
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  // تبديل إظهار الإجابة النموذجية
  const toggleRevealEssay = (qId: string) => {
    triggerHaptic('tap');
    setRevealedEssayAnswers((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // إعادة التعيين
  const handleReset = () => {
    triggerHaptic('tap');
    setUserAnswers({});
    setRevealedEssayAnswers({});
    setEssaySelfGrading({});
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (safeCurrentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(safeCurrentIndex + 1);
      triggerHaptic('tap');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (safeCurrentIndex > 0) {
      setCurrentIndex(safeCurrentIndex - 1);
      triggerHaptic('tap');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ==========================================
  // الشاشة الأولى: صفحة "اختيار الوحدة"
  // ==========================================
  if (selectedUnit === null) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 pb-20">
        {/* الترويسة الرئيسية */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2F6BFF]">
              <ClipboardList className="h-4 w-4 stroke-[2]" />
              <span>امتحانات ومراجعة الـ Mid الأكاديمية</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-[#0A1630] sm:text-3xl dark:text-white">
              اختيار الوحدة للاختبار
            </h1>
            <p className="mt-1 text-sm text-[#475569] dark:text-[#94A3B8]">
              اختر الوحدة الدراسية لبدء التدريب التفاعلي بنمط أسئلة الـ Mid المعتمدة في الجامعات.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/student/summaries">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
                <BookOpen className="h-3.5 w-3.5 stroke-[2]" />
                <span>الملخصات والقوانين</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* بطاقات الوحدات الدراسية للاختيار */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {EXAM_UNITS_CONFIG.map((u) => {
            return (
              <div
                key={u.unitNumber}
                className="flex flex-col justify-between rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] transition-all hover:border-[#2F6BFF]/50 sm:p-7 dark:border-[#1E325C] dark:bg-[#0A1630]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-xs font-bold text-[#2F6BFF]">
                      الوحدة {u.unitNumber}
                    </span>
                    <span className="flex items-center gap-1 font-tabular text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{u.durationLabel}</span>
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#0A1630] dark:text-white">
                    {u.title}
                  </h2>
                  <p className="text-xs font-medium text-[#2F6BFF] dark:text-[#8BB2FF]">
                    {u.subtitle}
                  </p>

                  <p className="text-xs leading-relaxed text-[#475569] dark:text-[#94A3B8]">
                    {u.topicsSummary}
                  </p>

                  <div className="rounded-[16px] bg-[#F8FAFC] p-3 text-xs font-bold text-[#0A1630] dark:bg-[#070D1F] dark:text-[#E2E8F0]">
                    {u.breakdown}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F1F5F9] dark:border-[#1E325C]">
                  <Button
                    type="button"
                    onClick={() => handleSelectUnit(u.unitNumber)}
                    className="w-full gap-2 text-sm font-bold"
                  >
                    <span>بدء امتحان الوحدة {u.unitNumber} ({u.questionCount} سؤالاً)</span>
                    <ChevronLeft className="h-4 w-4 stroke-[2]" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* بطاقة امتحان الـ Mid الشامل لكلا الوحدتين */}
        <div className="rounded-[24px] border-2 border-[#2F6BFF]/30 bg-gradient-to-br from-white to-[#F0F5FF] p-6 shadow-xs sm:p-7 dark:border-[#2F6BFF]/40 dark:from-[#0A1630] dark:to-[#071330]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <span className="inline-block rounded-full bg-[#2F6BFF] px-3 py-0.5 text-xs font-bold text-white">
                امتحان شامل
              </span>
              <h2 className="text-xl font-bold text-[#0A1630] dark:text-white">
                امتحان الـ Mid الشامل (الوحدة 1 + الوحدة 2)
              </h2>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                مراجعة شاملة لجميع مفاهيم الإطار الفكري، الدورة المحاسبية، معادلة الميزانية، والقوائم المالية (80 سؤالاً مجمعة).
              </p>
            </div>

            <Button
              type="button"
              onClick={() => handleSelectUnit('all')}
              className="shrink-0 gap-2 bg-[#2F6BFF] px-6 text-sm font-bold shadow-sm hover:bg-[#1E56E8]"
            >
              <span>بدء الامتحان الشامل (80 سؤالاً)</span>
              <ChevronLeft className="h-4 w-4 stroke-[2]" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // الشاشة الثانية: مربع امتحان الوحدة المحددة
  // ==========================================
  const activeUnitConfig =
    selectedUnit === 'all'
      ? {
          title: 'امتحان الـ Mid الشامل (الوحدة 1 و 2)',
          subtitle: '80 سؤالاً تفاعلياً شاملاً',
        }
      : EXAM_UNITS_CONFIG.find((u) => u.unitNumber === selectedUnit) || {
          title: `الوحدة ${selectedUnit}`,
          subtitle: '',
        };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* زر العودة لاختيار الوحدة */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBackToUnitSelection}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#0E1A38]"
        >
          <ArrowRight className="h-4 w-4 stroke-[2]" />
          <span>العودة لاختيار الوحدة</span>
        </button>

        <div className="flex items-center gap-2">
          <Link href="/student/summaries">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <BookOpen className="h-3.5 w-3.5 stroke-[2]" />
              <span>الملخصات</span>
            </Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs text-[#64748B] hover:text-red-600 dark:text-[#94A3B8]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>إعادة تعيين</span>
          </Button>
        </div>
      </div>

      {/* ترويسة الوحدة المختارة */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#2F6BFF]">
          <ClipboardList className="h-4 w-4 stroke-[2]" />
          <span>
            {selectedUnit === 'all'
              ? 'امتحان الميد الشامل'
              : `امتحان الوحدة ${selectedUnit}`}
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-[#0A1630] sm:text-3xl dark:text-white">
          {activeUnitConfig.title}
        </h1>
        <p className="mt-1 text-sm text-[#475569] dark:text-[#94A3B8]">
          تدريبات تفاعلية بنظام التصحيح والشرح الفوري لكل سؤال.
        </p>
      </div>

      {/* شريط الإحصائيات السريعة */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-3.5 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            إجمالي الأسئلة
          </span>
          <p className="mt-1 font-tabular text-xl font-bold text-[#0A1630] dark:text-white">
            {filteredQuestions.length}
          </p>
        </div>
        <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-3.5 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            الأسئلة المحلولة
          </span>
          <p className="mt-1 font-tabular text-xl font-bold text-[#2F6BFF]">
            {answeredCount} / {filteredQuestions.length}
          </p>
        </div>
        <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-3.5 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            الإجابات الصحيحة
          </span>
          <p className="mt-1 font-tabular text-xl font-bold text-[#10B981]">
            {correctCount}
          </p>
        </div>
        <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-3.5 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            نسبة الإتقان
          </span>
          <p className="mt-1 font-tabular text-xl font-bold text-[#0A1630] dark:text-white">
            {scorePct}%
          </p>
        </div>
      </div>

      {/* أزرار الفلترة الأربعة داخل الوحدة */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3 dark:border-[#1E325C]">
        <button
          type="button"
          onClick={() => {
            setSelectedFilter('all');
            setCurrentIndex(0);
          }}
          className={cn(
            'flex min-h-[40px] items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-all',
            selectedFilter === 'all'
              ? 'bg-[#2F6BFF] text-white shadow-xs'
              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] dark:bg-[#0E1A38] dark:text-[#CBD5E1]'
          )}
        >
          <span>الكل ({unitQuestions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedFilter('true_false');
            setCurrentIndex(0);
          }}
          className={cn(
            'flex min-h-[40px] items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-all',
            selectedFilter === 'true_false'
              ? 'bg-[#2F6BFF] text-white shadow-xs'
              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] dark:bg-[#0E1A38] dark:text-[#CBD5E1]'
          )}
        >
          <span>
            صح وخطأ ({unitQuestions.filter((q) => q.type === 'true_false').length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedFilter('mcq');
            setCurrentIndex(0);
          }}
          className={cn(
            'flex min-h-[40px] items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-all',
            selectedFilter === 'mcq'
              ? 'bg-[#2F6BFF] text-white shadow-xs'
              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] dark:bg-[#0E1A38] dark:text-[#CBD5E1]'
          )}
        >
          <span>
            اختيار من متعدد ({unitQuestions.filter((q) => q.type === 'mcq').length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedFilter('essay');
            setCurrentIndex(0);
          }}
          className={cn(
            'flex min-h-[40px] items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-all',
            selectedFilter === 'essay'
              ? 'bg-[#2F6BFF] text-white shadow-xs'
              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] dark:bg-[#0E1A38] dark:text-[#CBD5E1]'
          )}
        >
          <span>
            أسئلة مقالية وتحليلية ({unitQuestions.filter((q) => q.type === 'essay').length})
          </span>
        </button>
      </div>

      {/* مربع امتحان الوحدة المركزي النظيف */}
      {currentQ && (
        <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_36px_-16px_rgba(15,23,42,0.08)] sm:rounded-[28px] sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]">
          {/* رأس بطاقة السؤال */}
          <div className="flex items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4 dark:border-[#1E325C]/70">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-xs font-bold text-[#2F6BFF]">
                {currentQ.categoryTitle}
              </span>
              <span className="font-tabular text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                السؤال رقم {currentQ.number}
              </span>
            </div>

            <div className="flex items-center gap-2 font-tabular text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
              <span>
                {safeCurrentIndex + 1} من {filteredQuestions.length}
              </span>
            </div>
          </div>

          {/* نص السؤال */}
          <div className="mt-5">
            <h2 className="text-[19px] leading-[1.75] font-bold text-[#0A1630] sm:text-[22px] dark:text-white">
              {currentQ.prompt}
            </h2>
          </div>

          {/* نمط 1: أسئلة الصح والخطأ */}
          {currentQ.type === 'true_false' && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {currentQ.options?.map((opt) => {
                  const isSelected = userAnswers[currentQ.id] === opt.id;
                  const isAnswered = Boolean(userAnswers[currentQ.id]);
                  const isCorrectOpt = opt.id === currentQ.correctOptionId;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectAnswer(opt.id)}
                      className={cn(
                        'flex min-h-[56px] items-center justify-center gap-2 rounded-[20px] border-2 text-base font-bold transition-all sm:text-lg',
                        isSelected
                          ? isCorrectOpt
                            ? 'border-[#10B981] bg-[#10B981]/10 text-[#047857] dark:text-[#34D399]'
                            : 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                          : isAnswered && isCorrectOpt
                          ? 'border-[#10B981] bg-[#10B981]/5 text-[#047857] dark:text-[#34D399]'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0A1630] hover:border-[#2F6BFF]/40 dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white'
                      )}
                    >
                      {isAnswered && (
                        <span>
                          {isCorrectOpt ? (
                            <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                          ) : isSelected ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : null}
                        </span>
                      )}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* صندوق التوضيح والتصحيح الفوري */}
              {userAnswers[currentQ.id] && (
                <div
                  className={cn(
                    'mt-4 rounded-[20px] border p-4 text-sm leading-relaxed transition-all sm:text-base',
                    userAnswers[currentQ.id] === currentQ.correctOptionId
                      ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[#047857] dark:border-[#10B981]/40 dark:text-[#34D399]'
                      : 'border-red-500/30 bg-red-500/10 text-red-800 dark:border-red-500/40 dark:text-red-200'
                  )}
                >
                  <strong className="block font-bold">
                    {userAnswers[currentQ.id] === currentQ.correctOptionId
                      ? 'إجابة صحيحة'
                      : 'التصحيح المعتمد:'}
                  </strong>
                  <p className="mt-1">{currentQ.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* نمط 2: أسئلة الاختيار من متعدد */}
          {currentQ.type === 'mcq' && (
            <div className="mt-6 space-y-3">
              {currentQ.options?.map((opt) => {
                const isSelected = userAnswers[currentQ.id] === opt.id;
                const isAnswered = Boolean(userAnswers[currentQ.id]);
                const isCorrectOpt = opt.id === currentQ.correctOptionId;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectAnswer(opt.id)}
                    className={cn(
                      'flex min-h-[52px] w-full items-center justify-between rounded-[20px] border-2 p-4 text-right text-sm leading-relaxed font-bold transition-all sm:text-base',
                      isSelected
                        ? isCorrectOpt
                          ? 'border-[#10B981] bg-[#10B981]/10 text-[#047857] dark:text-[#34D399]'
                          : 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                        : isAnswered && isCorrectOpt
                        ? 'border-[#10B981] bg-[#10B981]/5 text-[#047857] dark:text-[#34D399]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0A1630] hover:border-[#2F6BFF]/40 dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white'
                    )}
                  >
                    <span>{opt.label}</span>
                    {isAnswered && (
                      <span className="shrink-0">
                        {isCorrectOpt ? (
                          <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                        ) : isSelected ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* صندوق التوضيح الفوري */}
              {userAnswers[currentQ.id] && (
                <div
                  className={cn(
                    'mt-4 rounded-[20px] border p-4 text-sm leading-relaxed transition-all sm:text-base',
                    userAnswers[currentQ.id] === currentQ.correctOptionId
                      ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[#047857] dark:border-[#10B981]/40 dark:text-[#34D399]'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:border-amber-500/40 dark:text-amber-200'
                  )}
                >
                  <strong className="block font-bold">
                    {userAnswers[currentQ.id] === currentQ.correctOptionId
                      ? 'أحسنت! إجابة دقيقة'
                      : 'التوضيح الأكاديمي:'}
                  </strong>
                  <p className="mt-1">{currentQ.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* نمط 3: الأسئلة المقالية والتحليلية */}
          {currentQ.type === 'essay' && (
            <div className="mt-6 space-y-4">
              <div className="rounded-[20px] border border-blue-100 bg-blue-50/50 p-4 text-xs text-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#0A1630]">
                فكّر في عناصر الإجابة في ذهنك أو دوّن مسودتك، ثم اضغط على الزر أدناه لمقارنة إجابتك بالإجابة النموذجية المعتمدة للامتحان.
              </div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toggleRevealEssay(currentQ.id)}
                  className="gap-2 text-sm font-bold"
                >
                  {revealedEssayAnswers[currentQ.id] ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>إخفاء الإجابة النموذجية</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>عرض الإجابة النموذجية والتفسير</span>
                    </>
                  )}
                </Button>
              </div>

              {revealedEssayAnswers[currentQ.id] && (
                <div className="space-y-4 rounded-[22px] border border-[#10B981]/30 bg-[#10B981]/5 p-5 text-right transition-all dark:border-[#10B981]/40 dark:bg-[#052e16]/20">
                  <span className="inline-block rounded-full bg-[#10B981]/15 px-3 py-1 text-xs font-bold text-[#047857] dark:text-[#34D399]">
                    الإجابة النموذجية الكاملة
                  </span>

                  <div className="whitespace-pre-line text-sm leading-[1.9] font-medium text-[#0A1630] sm:text-base dark:text-[#E2E8F0]">
                    {currentQ.modelAnswer}
                  </div>

                  {/* تقييم ذاتي سريع */}
                  <div className="border-t border-[#10B981]/20 pt-4">
                    <span className="block text-xs font-bold text-[#475569] dark:text-[#94A3B8]">
                      كيف تقيم إجابتك؟
                    </span>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEssaySelfGrading((prev) => ({
                            ...prev,
                            [currentQ.id]: 'correct',
                          }));
                          triggerHaptic('success');
                        }}
                        className={cn(
                          'flex min-h-[38px] items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-all',
                          essaySelfGrading[currentQ.id] === 'correct'
                            ? 'bg-[#10B981] text-white'
                            : 'bg-white text-[#047857] border border-[#10B981]/40 dark:bg-[#0A1630]'
                        )}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>أجبت بشكل صحيح وكامل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEssaySelfGrading((prev) => ({
                            ...prev,
                            [currentQ.id]: 'review',
                          }));
                          triggerHaptic('tap');
                        }}
                        className={cn(
                          'flex min-h-[38px] items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-all',
                          essaySelfGrading[currentQ.id] === 'review'
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-amber-700 border border-amber-300 dark:bg-[#0A1630]'
                        )}
                      >
                        <span>تحتاج مراجعة وتثبيت</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* أزرار التنقل السفلية: السابق والتالي */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#F1F5F9] pt-5 dark:border-[#1E325C]/70">
            <Button
              type="button"
              variant="outline"
              disabled={safeCurrentIndex === 0}
              onClick={handlePrev}
              className="gap-2 px-4 text-sm font-bold"
            >
              <ChevronRight className="h-4 w-4 stroke-[2]" />
              <span>السابق</span>
            </Button>

            <span className="font-tabular text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
              {safeCurrentIndex + 1} / {filteredQuestions.length}
            </span>

            <Button
              type="button"
              disabled={safeCurrentIndex >= filteredQuestions.length - 1}
              onClick={handleNext}
              className="gap-2 px-5 text-sm font-bold"
            >
              <span>السؤال التالي</span>
              <ChevronLeft className="h-4 w-4 stroke-[2]" />
            </Button>
          </div>
        </div>
      )}

      {/* خريطة الانتقال السريع بين الأسئلة */}
      <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-[#2F6BFF]" />
            <span className="text-xs font-bold text-[#0A1630] dark:text-white">
              الانتقال السريع لأسئلة الاختبار ({filteredQuestions.length})
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            اضغط على أي رقم للانتقال إليه مباشرة
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {filteredQuestions.map((q, idx) => {
            const isCurrent = idx === safeCurrentIndex;
            const isAnswered =
              q.type === 'essay'
                ? Boolean(essaySelfGrading[q.id])
                : Boolean(userAnswers[q.id]);
            const isCorrect =
              q.type === 'essay'
                ? essaySelfGrading[q.id] === 'correct'
                : userAnswers[q.id] === q.correctOptionId;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  triggerHaptic('tap');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl font-tabular text-xs font-bold transition-all',
                  isCurrent
                    ? 'border-2 border-[#2F6BFF] bg-[#2F6BFF] text-white shadow-xs'
                    : isAnswered
                    ? isCorrect
                      ? 'bg-[#10B981]/15 text-[#047857] border border-[#10B981]/40 dark:text-[#34D399]'
                      : 'bg-red-500/15 text-red-600 border border-red-500/40 dark:text-red-400'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] dark:bg-[#0E1A38] dark:text-[#94A3B8]'
                )}
                title={`السؤال ${q.number}: ${q.categoryTitle}`}
              >
                {q.number}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
