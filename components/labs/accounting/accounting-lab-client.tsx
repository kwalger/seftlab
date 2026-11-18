'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Award,
  BookMarked,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatFilsShort } from '@/lib/labs/accounting/accounts';
import { ACCOUNTING_CURRICULUM } from '@/lib/labs/accounting/curriculum';
import {
  calculateVirtualCompanyDeltasFromEntries,
  computeEquationTotalsFromLedger,
  generateTrialBalance,
  postEntriesToLedger,
} from '@/lib/labs/accounting/engine';
import { generateAllFinancialStatements } from '@/lib/labs/accounting/statements';
import {
  isUnitUnlocked,
  useAccountingLabStore,
} from '@/lib/labs/accounting/store';
import { UNIT1_EXAM_QUESTIONS } from '@/lib/labs/accounting/unit1-data';
import { UNIT2_EXAM_QUESTIONS } from '@/lib/labs/accounting/unit2-data';
import { UNIT3_EXAM_QUESTIONS } from '@/lib/labs/accounting/unit3-data';
import { calculateSkillLevelFromXp } from '@/lib/labs/skill-calculator';
import { triggerHaptic } from '@/lib/haptics';
import { useAppStore } from '@/store/use-app-store';
import { CertificateModal } from '@/components/shared/certificate-modal';
import { VirtualCompanyBar } from '@/components/shared/virtual-company-bar';
import { AssignmentModeWorkspace } from '@/components/labs/assignment-mode-bar';
import { AccountingEquationScale } from '@/components/labs/accounting/accounting-equation-scale';
import { CurriculumMap } from '@/components/labs/accounting/curriculum-map';
import { JournalEntryBuilder } from '@/components/labs/accounting/journal-entry-builder';
import { TAccountsView } from '@/components/labs/accounting/t-accounts-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Unit1Intro = dynamic(
  () => import('@/components/labs/accounting/units/unit1-intro'),
  {
    loading: () => (
      <div className="rounded-[28px] border border-[#E3E8F0] bg-white p-8 text-center text-sm text-[#526077] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#94A3B8]">
        جاري تحميل تمارين الوحدة الأولى...
      </div>
    ),
  }
);

const Unit2Intro = dynamic(
  () => import('@/components/labs/accounting/units/unit2-intro'),
  {
    loading: () => (
      <div className="rounded-[28px] border border-[#E3E8F0] bg-white p-8 text-center text-sm text-[#526077] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#94A3B8]">
        جاري تحميل مساقات الوحدة الثانية...
      </div>
    ),
  }
);

const Unit3Intro = dynamic(
  () => import('@/components/labs/accounting/units/unit3-intro'),
  {
    loading: () => (
      <div className="rounded-[28px] border border-[#E3E8F0] bg-white p-8 text-center text-sm text-[#526077] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#94A3B8]">
        جاري تحميل مساقات الوحدة الثالثة (الدورة المحاسبية)...
      </div>
    ),
  }
);

type LabViewMode = 'map' | 'unit' | 'sandbox' | 'quiz' | 'errors';

export function AccountingLabClient() {
  const { currentStudent, virtualCompany, updateVirtualCompany, awardLabXp } =
    useAppStore();
  const {
    completedExerciseIds,
    bypassedUnits,
    lastActiveUnit,
    lastActiveExerciseId,
    earnedBadges,
    ledgerEntries,
    errorNotebook,
    addLedgerEntry,
    clearLedgerEntries,
    resolveErrorNotebookItem,
  } = useAccountingLabStore();

  const [viewMode, setViewMode] = useState<LabViewMode>('map');
  const [activeUnitNum, setActiveUnitNum] = useState<number>(lastActiveUnit || 1);
  const [targetExerciseId, setTargetExerciseId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const unitParam = params.get('unit');
    const lessonParam = params.get('lesson');
    if (unitParam) {
      const u = parseInt(unitParam, 10);
      if (u >= 1 && u <= 8) {
        setActiveUnitNum(u);
        setViewMode('unit');
        if (lessonParam) {
          setTargetExerciseId(`u${u}-lesson-${lessonParam}`);
        }
      }
    }
  }, []);

  // حالة وضع اختبرني
  const combinedQuizBank = useMemo(
    () => [
      ...UNIT1_EXAM_QUESTIONS.map((q) => ({ ...q, unitLabel: 'الوحدة 1' })),
      ...UNIT2_EXAM_QUESTIONS.map((q) => ({ ...q, unitLabel: 'الوحدة 2' })),
      ...UNIT3_EXAM_QUESTIONS.map((q) => ({ ...q, unitLabel: 'الوحدة 3' })),
    ],
    []
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const accountingXp = currentStudent.labXp.accounting || 0;
  const skillInfo = calculateSkillLevelFromXp(accountingXp);

  // حساب التقدم الكلي في المنهاج (8 وحدات)
  const totalExercisesInCurriculum = useMemo(
    () => ACCOUNTING_CURRICULUM.reduce((sum, u) => sum + u.exerciseCount, 0),
    []
  );
  const overallProgressPct = Math.min(
    100,
    Math.round(
      (completedExerciseIds.length / Math.max(1, totalExercisesInCurriculum)) *
        100
    )
  );

  const unresolvedErrors = useMemo(
    () => errorNotebook.filter((e) => !e.resolved),
    [errorNotebook]
  );

  // حسابات الدفاتر والقوائم المالية الحية في المختبر الحر
  const liveLedger = useMemo(
    () => postEntriesToLedger(ledgerEntries),
    [ledgerEntries]
  );
  const liveEquation = useMemo(
    () => computeEquationTotalsFromLedger(liveLedger),
    [liveLedger]
  );
  const liveTrialBalance = useMemo(
    () => generateTrialBalance(liveLedger),
    [liveLedger]
  );
  const liveStatements = useMemo(
    () => generateAllFinancialStatements(liveTrialBalance, ledgerEntries),
    [liveTrialBalance, ledgerEntries]
  );

  const handleOpenUnit = (unitNum: number, exerciseId?: string | null) => {
    const unlocked = isUnitUnlocked({
      unitNumber: unitNum,
      completedExerciseIds,
      bypassedUnits,
    });
    if (!unlocked) {
      toast.error('هذه الوحدة مقفلة حالياً. أكمل 70% من الوحدة السابقة أو اجتز اختبار التجاوز.');
      return;
    }
    triggerHaptic('tap');
    setActiveUnitNum(unitNum);
    setTargetExerciseId(exerciseId ?? null);
    setViewMode('unit');
  };

  const handleResumeWhereLeftOff = () => {
    const targetUnit = isUnitUnlocked({
      unitNumber: lastActiveUnit,
      completedExerciseIds,
      bypassedUnits,
    })
      ? lastActiveUnit
      : 1;
    handleOpenUnit(targetUnit, lastActiveExerciseId);
  };

  const handlePostSandboxEntry = (entry: (typeof ledgerEntries)[number]) => {
    addLedgerEntry(entry);
    const delta = calculateVirtualCompanyDeltasFromEntries([entry]);
    const nextRevenue = virtualCompany.revenue + delta.revenueDeltaJod;
    const nextExpenses = virtualCompany.expenses + delta.expensesDeltaJod;
    updateVirtualCompany({
      assets: Math.max(0, virtualCompany.assets + delta.assetsDeltaJod),
      liabilities: Math.max(
        0,
        virtualCompany.liabilities + delta.liabilitiesDeltaJod
      ),
      equity: Math.max(0, virtualCompany.equity + delta.equityDeltaJod),
      capital: Math.max(0, virtualCompany.capital + delta.capitalDeltaJod),
      revenue: nextRevenue,
      expenses: nextExpenses,
      netProfit: nextRevenue - nextExpenses,
    });
    awardLabXp('accounting', 25, `ترحيل قيد يومية: ${entry.description}`);
    triggerHaptic('success');
    toast.success('تم ترحيل القيد إلى حسابات T وتحديث الشركة الافتراضية (+25 XP).');
  };

  const currentQuizQuestion = combinedQuizBank[quizIndex];

  const handleCheckQuickQuiz = () => {
    if (!quizSelectedOption || !currentQuizQuestion) return;
    setQuizSubmitted(true);
    if (quizSelectedOption === currentQuizQuestion.correctOptionId) {
      awardLabXp('accounting', 35, 'إجابة صحيحة في وضع اختبرني للمحاسبة');
      triggerHaptic('success');
      toast.success('إجابة صحيحة! حصلت على +35 XP.');
    } else {
      triggerHaptic('error');
      toast.error('إجابة غير دقيقة، راجع التفسير المحاسبي.');
    }
  };

  const handleNextQuickQuiz = () => {
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
    setQuizIndex((i) => (i + 1) % combinedQuizBank.length);
  };

  const labTabs: { id: LabViewMode; label: string; icon: typeof BookMarked }[] = [
    { id: 'map', label: 'الوحدات', icon: BookMarked },
    { id: 'sandbox', label: 'تدرّب بحرية', icon: FlaskConical },
    { id: 'quiz', label: 'اختبر نفسك', icon: Sparkles },
  ];
  if (unresolvedErrors.length > 0) {
    labTabs.push({
      id: 'errors',
      label: `أخطائي (${unresolvedErrors.length})`,
      icon: ClipboardList,
    });
  }

  const isFocusedUnit = viewMode === 'unit';

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-5 px-0 py-1 sm:px-4 sm:py-5 md:py-8">
      <Suspense fallback={null}>
        <AssignmentModeWorkspace />
      </Suspense>
      {/* الرأس المبسط: العنوان، التقدم، وزر واحد للمتابعة (يختفي داخل الوحدة للتركيز) */}
      {!isFocusedUnit && (
        <section className="shadow-soft relative overflow-hidden rounded-[32px] border border-[#E2E8F0] bg-white p-5 sm:p-7 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-[#2563EB]/10 blur-3xl"
          />
          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="min-w-0 space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#2563EB]/10 px-3 py-1 text-xs font-semibold text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#93C5FD]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                مبادئ المحاسبة المالية · الجزء الأول
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#0A1630] sm:text-3xl dark:text-white">
                مختبر المحاسبة المالية
              </h1>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                المستوى {skillInfo.level} · {accountingXp} XP
                {earnedBadges.length > 0 && (
                  <span className="text-[#10B981]">
                    {' '}
                    · <Award className="inline h-3.5 w-3.5" /> {earnedBadges.length} شارة
                  </span>
                )}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {completedExerciseIds.length > 0 && (
                <CertificateModal
                  studentName={currentStudent.fullName}
                  labTitle="مختبر المحاسبة المالية"
                  skillLevel={skillInfo.level}
                  xpEarned={accountingXp}
                />
              )}
              <Button
                type="button"
                size="lg"
                onClick={handleResumeWhereLeftOff}
                className="flex-1 gap-2 px-6 md:flex-initial"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{completedExerciseIds.length > 0 ? 'تابع التعلم' : 'ابدأ الآن'}</span>
              </Button>
            </div>
          </div>

          {/* شريط التقدم الخطي */}
          <div className="relative mt-6">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-[#64748B] dark:text-[#94A3B8]">
                تقدمك في المنهاج
              </span>
              <span className="font-tabular font-semibold text-[#0A1630] dark:text-white">
                {completedExerciseIds.length} / {totalExercisesInCurriculum} تمرين · {overallProgressPct}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F1F5F9] dark:bg-[#070D1F]">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[#2563EB] to-[#06B6D4] transition-all duration-500"
                style={{ width: `${Math.max(overallProgressPct, 2)}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* التنقل المقسّم (Segmented control) */}
      {!isFocusedUnit && (
        <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
          <div className="inline-flex min-w-full gap-1 rounded-full border border-[#E2E8F0] bg-white p-1 sm:min-w-0 dark:border-[#1E325C] dark:bg-[#0A1630]">
            {labTabs.map((tab) => {
              const Icon = tab.icon;
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id)}
                  className={cn(
                    'inline-flex min-h-[42px] flex-1 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-200 sm:flex-initial',
                    active
                      ? 'bg-[#0A1630] text-white shadow-[0_4px_12px_-4px_rgba(10,22,48,0.5)] dark:bg-[#2563EB]'
                      : 'text-[#64748B] hover:text-[#0A1630] dark:text-[#94A3B8] dark:hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* المحتوى حسب الوضع النشط */}
      {viewMode === 'map' && <CurriculumMap onOpenUnit={handleOpenUnit} />}

      {viewMode === 'unit' && activeUnitNum === 1 && (
        <Unit1Intro
          initialExerciseId={targetExerciseId}
          onBackToMap={() => setViewMode('map')}
          onUnlockUnit2={() => handleOpenUnit(2)}
        />
      )}

      {viewMode === 'unit' && activeUnitNum === 2 && (
        <Unit2Intro
          initialExerciseId={targetExerciseId}
          onBackToMap={() => setViewMode('map')}
          onUnlockUnit3={() => handleOpenUnit(3)}
        />
      )}

      {viewMode === 'unit' && activeUnitNum === 3 && (
        <Unit3Intro
          initialExerciseId={targetExerciseId}
          onBackToMap={() => setViewMode('map')}
        />
      )}

      {/* المختبر الحر: منشئ القيد + حسابات T + ميزان المعادلة + ترابط القوائم */}
      {viewMode === 'sandbox' && (
        <div className="space-y-6">
          <VirtualCompanyBar />
          <AccountingEquationScale
            assetsFils={liveEquation.assetsFils}
            liabilitiesFils={liveEquation.liabilitiesFils}
            equityFils={liveEquation.equityTotalFils}
            capitalFils={liveEquation.capitalNetFils}
            revenuesFils={liveEquation.revenuesNetFils}
            expensesFils={liveEquation.expensesNetFils}
            drawingsFils={liveEquation.drawingsFils}
          />

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <JournalEntryBuilder
                title="منشئ القيد اليومي (المختبر الحر)"
                submitLabel="ترحيل القيد لحسابات الأستاذ"
                onSubmitEntry={handlePostSandboxEntry}
              />

              <div className="flex items-center justify-between rounded-[22px] border border-[#E3E8F0] bg-white px-4 py-3 text-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
                <span className="font-tabular text-[#526077] dark:text-[#94A3B8]">
                  القيود المسجلة في الدفتر: {ledgerEntries.length}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearLedgerEntries();
                    toast.success('تمت إعادة ضبط قيود الدفتر إلى القيد الافتتاحي.');
                  }}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>إعادة ضبط الدفتر</span>
                </Button>
              </div>
            </div>

            <div className="space-y-5 lg:col-span-7">
              <div className="rounded-[28px] border border-[#E3E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
                <TAccountsView entries={ledgerEntries} />
              </div>

              {/* ملخص القوائم المالية وفحوص الترابط */}
              <div className="rounded-[28px] border border-[#E3E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
                <h3 className="mb-3 text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                  القوائم المالية الحية وفحوص الترابط الآلية
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-[20px] border border-[#E3E8F0] bg-[#FAFBFC] p-3 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]">
                    <span className="text-[#526077] dark:text-[#94A3B8]">
                      صافي الدخل (قائمة الدخل)
                    </span>
                    <p className="mt-1 font-tabular text-base font-bold text-[#2F6BFF]">
                      {formatFilsShort(liveStatements.incomeStatement.netIncomeFils)}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-[#E3E8F0] bg-[#FAFBFC] p-3 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]">
                    <span className="text-[#526077] dark:text-[#94A3B8]">
                      حقوق الملكية الختامية
                    </span>
                    <p className="mt-1 font-tabular text-base font-bold text-[#22C55E]">
                      {formatFilsShort(
                        liveStatements.ownersEquityStatement.endingEquityFils
                      )}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-[#E3E8F0] bg-[#FAFBFC] p-3 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]">
                    <span className="text-[#526077] dark:text-[#94A3B8]">
                      إجمالي أصول المركز المالي
                    </span>
                    <p className="mt-1 font-tabular text-base font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                      {formatFilsShort(liveStatements.balanceSheet.totalAssetsFils)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  {liveStatements.articulationChecks.map((chk) => (
                    <div
                      key={chk.id}
                      className="flex items-center justify-between gap-2 rounded-[16px] border border-[#E3E8F0] px-3 py-2 text-xs dark:border-[#1E325C]"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {chk.passed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span>{chk.title}</span>
                      </span>
                      <span
                        className={cn(
                          'font-medium',
                          chk.passed ? 'text-[#22C55E]' : 'text-red-500'
                        )}
                      >
                        {chk.passed ? 'متطابق' : 'غير متطابق'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* وضع اختبرني السريع */}
      {viewMode === 'quiz' && currentQuizQuestion && (
        <div className="mx-auto max-w-3xl space-y-4 rounded-[28px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="default">{currentQuizQuestion.unitLabel}</Badge>
            <span className="font-tabular text-xs font-semibold text-[#2F6BFF]">
              سؤال {quizIndex + 1} من {combinedQuizBank.length}
            </span>
          </div>

          <h2 className="text-base font-bold leading-relaxed text-[#0A1630] sm:text-lg dark:text-[#FAFBFC]">
            {currentQuizQuestion.prompt}
          </h2>

          <div className="space-y-2.5">
            {currentQuizQuestion.options.map((opt) => {
              const isSelected = quizSelectedOption === opt.id;
              const isCorrect = opt.id === currentQuizQuestion.correctOptionId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={quizSubmitted}
                  onClick={() => setQuizSelectedOption(opt.id)}
                  className={cn(
                    'min-h-[48px] w-full rounded-[20px] border p-3.5 text-right text-xs font-medium transition-colors sm:text-sm',
                    quizSubmitted && isCorrect
                      ? 'border-[#22C55E] bg-[#22C55E]/12'
                      : quizSubmitted && isSelected && !isCorrect
                      ? 'border-red-500 bg-red-500/12'
                      : isSelected
                      ? 'border-[#2F6BFF] bg-[#2F6BFF]/10 font-semibold text-[#2F6BFF]'
                      : 'border-[#E3E8F0] bg-[#FAFBFC] hover:border-[#2F6BFF]/50 dark:border-[#1E325C] dark:bg-[#070D1F]'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {quizSubmitted && (
            <div className="rounded-[20px] border border-[#E3E8F0] bg-[#FAFBFC] p-3.5 text-xs leading-relaxed dark:border-[#1E325C] dark:bg-[#070D1F]">
              <strong>التفسير المحاسبي: </strong>
              {currentQuizQuestion.explanation}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {!quizSubmitted ? (
              <Button
                type="button"
                disabled={!quizSelectedOption}
                onClick={handleCheckQuickQuiz}
              >
                تحقق من الإجابة
              </Button>
            ) : (
              <Button type="button" onClick={handleNextQuickQuiz}>
                السؤال التالي
              </Button>
            )}
          </div>
        </div>
      )}

      {/* دفتر الأخطاء (Error Notebook) */}
      {viewMode === 'errors' && (
        <div className="space-y-4 rounded-[28px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div>
            <h2 className="text-base font-bold text-[#0A1630] sm:text-lg dark:text-[#FAFBFC]">
              دفتر الأخطاء والمراجعة (Error Notebook)
            </h2>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              يجمع كل تمرين أخطأت فيه مع سبب الخطأ لتتمكن من إعادة حله وإتقانه.
            </p>
          </div>

          {errorNotebook.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#E3E8F0] p-8 text-center text-sm text-[#526077] dark:border-[#1E325C] dark:text-[#94A3B8]">
              دفتر الأخطاء فارغ حالياً. جميع محاولاتك موفقة حتى الآن.
            </div>
          ) : (
            <div className="space-y-3">
              {errorNotebook.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'space-y-2 rounded-[22px] border p-4 text-xs',
                    item.resolved
                      ? 'border-[#22C55E]/30 bg-[#22C55E]/5 opacity-80'
                      : 'border-red-500/30 bg-red-500/5'
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                      الوحدة {item.unitNumber} · {item.title}
                    </span>
                    <Badge variant={item.resolved ? 'default' : 'secondary'}>
                      {item.resolved ? 'تمت المراجعة والإتقان' : 'بحاجة لإعادة حل'}
                    </Badge>
                  </div>
                  <p className="text-[#526077] dark:text-[#94A3B8]">
                    {item.prompt}
                  </p>
                  <p className="rounded-[14px] bg-white/80 p-2.5 text-[#0A1630] dark:bg-[#070D1F] dark:text-[#FAFBFC]">
                    <strong>لماذا؟ </strong>
                    {item.whyExplanation}
                  </p>
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    {!item.resolved && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveErrorNotebookItem(item.id)}
                        className="text-xs"
                      >
                        تحديد كمراجع
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        handleOpenUnit(item.unitNumber, item.exerciseId)
                      }
                      className="text-xs"
                    >
                      إعادة حل التمرين الآن
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
