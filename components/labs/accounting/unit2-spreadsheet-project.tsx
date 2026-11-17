'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileSpreadsheet,
  FolderOpen,
  HelpCircle,
  Info,
  Layers,
  RotateCcw,
  Scale,
  Sparkles,
  Table2,
  Workflow,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AL_AMEEN_FINAL_BALANCES,
  createDefaultUnit2SpreadsheetState,
  evaluateUnit2SpreadsheetState,
  loadSavedUnit2SpreadsheetState,
  saveUnit2SpreadsheetState,
  STAGE1_BOOK_EVENTS,
  STAGE2_EQUATION_RULES,
  STAGE3_AL_AMEEN_ROWS,
  UNIT2_CASE_STUDY,
  type Unit2SpreadsheetState,
} from '@/lib/labs/accounting/unit2-spreadsheet-data';
import { triggerHaptic } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface Unit2SpreadsheetProjectProps {
  initialStage?: number;
  onStateChange?: (state: Unit2SpreadsheetState) => void;
}

/**
 * المحطات التعليمية التطبيقية للوحدة الثانية
 * متضمنة كافة أشكال ورسومات وجداول الكتاب المقرر من شكل 1 حتى شكل 9
 */
const SECTIONS = [
  {
    id: 'sec-cycle',
    shortTitle: 'شكل (1) الدورة المحاسبية',
    fullTitle: 'خطوات الدورة المحاسبية السبعة (ص 46)',
    badge: 'شكل 1',
  },
  {
    id: 'sec-conditions',
    shortTitle: 'شكل (2) شروط العملية',
    fullTitle: 'مخطط شجرة القرار وفحص الشروط الثلاثة (ص 47–48)',
    badge: 'شكل 2',
  },
  {
    id: 'sec-cases',
    shortTitle: 'أمثلة الحالات (جداول قصيرة)',
    fullTitle: 'أثر العمليات الفردية على معادلة الميزانية ص 53–58',
    badge: 'ص 53–58',
  },
  {
    id: 'sec-arrows',
    shortTitle: 'شكل (3) ميزان الأسهم',
    fullTitle: 'مخطط الأسهم التبادلي لمعادلة الميزانية (ص 59)',
    badge: 'شكل 3',
  },
  {
    id: 'sec-alameen',
    shortTitle: 'جداول محلات الأمين (موجزة للموبايل)',
    fullTitle: 'العمليات العشر المتسلسلة بجداول مصغرة خطوة بخطوة (ص 60–64)',
    badge: 'ص 60–64',
  },
  {
    id: 'sec-statements-flow',
    shortTitle: 'شكل (4 و 8) القوائم والتدفقات',
    fullTitle: 'القوائم المالية الأربعة وقائمة التدفقات النقدية (ص 64 و 67)',
    badge: 'شكل 4 و 8',
  },
  {
    id: 'sec-statements-alameen',
    shortTitle: 'شكل (5، 6، 7) قوائم الأمين',
    fullTitle: 'إعداد قوائم الدخل وحقوق الملكية والمركز المالي (ص 65–66)',
    badge: 'شكل 5، 6، 7',
  },
  {
    id: 'sec-network',
    shortTitle: 'شكل (9) شبكة العلاقات',
    fullTitle: 'مخطط ترابط وتكامل القوائم المالية فيما بينها (ص 70)',
    badge: 'شكل 9',
  },
];

// خطوات الدورة المحاسبية السبعة من شكل 1 ص 46
const ACCOUNTING_CYCLE_STEPS = [
  { num: 1, title: 'تحليل العمليات المالية', desc: 'تحديد أطراف العملية والقيمة والأثر المالي (شكل 1)' },
  { num: 2, title: 'التسجيل في دفتر اليومية', desc: 'إثبات القيود المزدوجة من واقع المستندات المؤيدة' },
  { num: 3, title: 'الترحيل والترصيد لدفتر الأستاذ', desc: 'نقل القيود لحسابات الأستاذ واستخراج الأرصدة' },
  { num: 4, title: 'إعداد ميزان المراجعة قبل التسويات', desc: 'التحقق من التوازن الحسابي للأرصدة المدينة والدائنة' },
  { num: 5, title: 'إجراء قيود التسويات الجردية', desc: 'تطبيق أساس الاستحقاق ومبدأ المقابلة' },
  { num: 6, title: 'إعداد ميزان المراجعة بعد التسويات', desc: 'تجهيز الأرصدة النهائية المعدلة تمهيداً للقوائم' },
  { num: 7, title: 'إعداد القوائم المالية الختامية', desc: 'قوائم الدخل وحقوق الملكية والمركز المالي والتدفقات' },
];

export function Unit2SpreadsheetProject({
  initialStage = 0,
  onStateChange,
}: Unit2SpreadsheetProjectProps) {
  const [activeTab, setActiveTab] = useState(initialStage >= 0 && initialStage < SECTIONS.length ? initialStage : 4);
  const [activeAlAmeenStep, setActiveAlAmeenStep] = useState(1); // من 1 إلى 10 للعمليات المصغرة

  const [sheetState, setSheetState] = useState<Unit2SpreadsheetState>(() =>
    createDefaultUnit2SpreadsheetState()
  );

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSheetState(loadSavedUnit2SpreadsheetState());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const evaluation = useMemo(
    () => evaluateUnit2SpreadsheetState(sheetState),
    [sheetState]
  );

  const commitState = (updater: (prev: Unit2SpreadsheetState) => Unit2SpreadsheetState) => {
    setSheetState((prev) => {
      const next = updater(prev);
      saveUnit2SpreadsheetState(next);
      return next;
    });
  };

  React.useEffect(() => {
    onStateChange?.(sheetState);
  }, [sheetState, onStateChange]);

  const handleAutoFill = () => {
    commitState((prev) => {
      const next1 = { ...prev.stage1Events };
      STAGE1_BOOK_EVENTS.forEach((e) => {
        next1[e.id] = {
          q1Monetary: e.hasMonetaryValue,
          q2Affects: e.affectsBalanceSheet,
          q3Occurred: e.hasActuallyOccurred,
          userResult: e.isFinancialTransaction,
        };
      });

      const next2 = { ...prev.stage2Cases };
      STAGE2_EQUATION_RULES.forEach((r) => {
        next2[`case-${r.caseNumber}`] = { selectedCase: r.caseNumber };
      });

      const next3 = { ...prev.stage3AlAmeenRows };
      STAGE3_AL_AMEEN_ROWS.forEach((r) => {
        next3[r.step] = {
          cash: r.cash,
          machinery: r.machinery,
          furniture: r.furniture,
          receivables: r.receivables,
          supplies: r.supplies,
          payables: r.payables,
          notesPayable: r.notesPayable,
          capital: r.capital,
          revenues: r.revenues,
          expenses: r.expenses,
          drawings: r.drawings,
        };
      });

      return {
        stage1Events: next1,
        stage2Cases: next2,
        stage3AlAmeenRows: next3,
        stage4Statements: {
          incomeServiceRevenues: AL_AMEEN_FINAL_BALANCES.serviceRevenues,
          incomeRentExpense: AL_AMEEN_FINAL_BALANCES.rentExpense,
          incomeNetProfit: AL_AMEEN_FINAL_BALANCES.netIncome,
          equityBeginningCapital: AL_AMEEN_FINAL_BALANCES.capital,
          equityNetProfitAdded: AL_AMEEN_FINAL_BALANCES.netIncome,
          equityDrawingsDeducted: AL_AMEEN_FINAL_BALANCES.drawings,
          equityEndingCapital: AL_AMEEN_FINAL_BALANCES.endingEquity,
          balanceTotalCurrentAssets: 11200,
          balanceTotalNonCurrentAssets: 5500,
          balanceTotalAssets: AL_AMEEN_FINAL_BALANCES.totalAssets,
          balanceTotalLiabilities: AL_AMEEN_FINAL_BALANCES.totalLiabilities,
          balanceEndingEquity: AL_AMEEN_FINAL_BALANCES.endingEquity,
          balanceTotalLiabilitiesAndEquity: AL_AMEEN_FINAL_BALANCES.totalLiabilitiesAndEquity,
        },
      };
    });
    triggerHaptic('success');
    toast.success('تمت تعبئة الحل النموذجي المعتمد من الكتاب لكافة الأشكال والجداول.');
  };

  const handleReset = () => {
    if (!window.confirm('هل تريد إعادة تعيين كافة التمارين؟')) return;
    commitState(() => {
      const next1: Unit2SpreadsheetState['stage1Events'] = {};
      STAGE1_BOOK_EVENTS.forEach((e) => {
        next1[e.id] = { q1Monetary: null, q2Affects: null, q3Occurred: null, userResult: null };
      });
      const next2: Unit2SpreadsheetState['stage2Cases'] = {};
      STAGE2_EQUATION_RULES.forEach((r) => {
        next2[`case-${r.caseNumber}`] = { selectedCase: null };
      });
      const next3: Unit2SpreadsheetState['stage3AlAmeenRows'] = {};
      STAGE3_AL_AMEEN_ROWS.forEach((r) => {
        next3[r.step] = {
          cash: '', machinery: '', furniture: '', receivables: '', supplies: '',
          payables: '', notesPayable: '', capital: '', revenues: '', expenses: '', drawings: ''
        };
      });
      return {
        stage1Events: next1,
        stage2Cases: next2,
        stage3AlAmeenRows: next3,
        stage4Statements: {
          incomeServiceRevenues: '', incomeRentExpense: '', incomeNetProfit: '',
          equityBeginningCapital: '', equityNetProfitAdded: '', equityDrawingsDeducted: '', equityEndingCapital: '',
          balanceTotalCurrentAssets: '', balanceTotalNonCurrentAssets: '', balanceTotalAssets: '',
          balanceTotalLiabilities: '', balanceEndingEquity: '', balanceTotalLiabilitiesAndEquity: ''
        }
      };
    });
    toast.info('تمت إعادة التعيين.');
  };

  // حساب أثر العملية الحالية لمحلات الأمين
  const currentAlAmeenRow = STAGE3_AL_AMEEN_ROWS.find((r) => r.step === activeAlAmeenStep) || STAGE3_AL_AMEEN_ROWS[0];
  const currentAlAmeenInput = sheetState.stage3AlAmeenRows[activeAlAmeenStep] || {
    cash: '', machinery: '', furniture: '', receivables: '', supplies: '',
    payables: '', notesPayable: '', capital: '', revenues: '', expenses: '', drawings: ''
  };

  const updateCurrentAlAmeenField = (field: keyof typeof currentAlAmeenInput, val: string) => {
    const num = val === '' ? '' : Number(val);
    commitState((prev) => ({
      ...prev,
      stage3AlAmeenRows: {
        ...prev.stage3AlAmeenRows,
        [activeAlAmeenStep]: {
          ...prev.stage3AlAmeenRows[activeAlAmeenStep],
          [field]: num,
        },
      },
    }));
  };

  // الأرصدة التراكمية
  const cumulativeBalances = useMemo(() => {
    let cash = 0;
    let machinery = 0;
    let furniture = 0;
    let receivables = 0;
    let supplies = 0;
    let payables = 0;
    let notesPayable = 0;
    let capital = 0;
    let revenues = 0;
    let expenses = 0;
    let drawings = 0;

    STAGE3_AL_AMEEN_ROWS.filter((r) => r.step <= activeAlAmeenStep).forEach((r) => {
      const u = sheetState.stage3AlAmeenRows[r.step];
      if (u) {
        cash += Number(u.cash || 0);
        machinery += Number(u.machinery || 0);
        furniture += Number(u.furniture || 0);
        receivables += Number(u.receivables || 0);
        supplies += Number(u.supplies || 0);
        payables += Number(u.payables || 0);
        notesPayable += Number(u.notesPayable || 0);
        capital += Number(u.capital || 0);
        revenues += Number(u.revenues || 0);
        expenses += Number(u.expenses || 0);
        drawings += Number(u.drawings || 0);
      }
    });

    const assets = cash + machinery + furniture + receivables + supplies;
    const liabilities = payables + notesPayable;
    const equity = capital + revenues + expenses + drawings;
    const isBalanced = assets === liabilities + equity && assets > 0;

    return {
      cash, machinery, furniture, receivables, supplies, assets,
      payables, notesPayable, liabilities,
      capital, revenues, expenses, drawings, equity,
      liabilitiesAndEquity: liabilities + equity,
      isBalanced,
    };
  }, [sheetState.stage3AlAmeenRows, activeAlAmeenStep]);

  return (
    <div className="space-y-4">
      {/* الترويسة الرئيسية المحسنة للموبايل */}
      <div className="overflow-hidden rounded-[20px] border border-[#1E325C] bg-[#0A1630] p-4 text-white sm:rounded-[24px] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#2F6BFF] text-white">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#2F6BFF]/25 px-2 py-0.5 text-[10px] font-bold text-[#8BB2FF]">
                  الوحدة 2 تطبيق عملي
                </span>
                <span className="rounded-full bg-[#10B981]/25 px-2 py-0.5 text-[10px] font-bold text-[#6EE7B7]">
                  جميع أشكال وجداول الكتاب (1–9)
                </span>
                <span className="font-tabular text-xs font-bold text-white/90">
                  العلامة: {evaluation.totalScore} / 100
                </span>
              </div>
              <h2 className="mt-0.5 text-base font-bold sm:text-lg">
                تحليل العمليات المالية ومعادلة الميزانية (محلات الأمين)
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoFill}
              className="h-8 gap-1 border-white/20 bg-white/10 text-xs font-bold text-white hover:bg-white/20"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
              <span>الحل النموذجي</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 gap-1 text-xs text-[#94A3B8] hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>إعادة ضبط</span>
            </Button>
          </div>
        </div>

        {/* شريط الأقسام السريع المناسب للموبايل (Horizontal Scroll Pills) */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {SECTIONS.map((sec, idx) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 font-bold transition-colors',
                activeTab === idx
                  ? 'bg-[#2F6BFF] text-white shadow-xs'
                  : 'bg-white/10 text-[#94A3B8] hover:bg-white/15 hover:text-white'
              )}
            >
              <span className="ml-1 text-[10px] opacity-75">{sec.badge}:</span>
              <span>{sec.shortTitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================
          1. شكل (1): خطوات الدورة المحاسبية السبعة (ص 46)
         ========================================================= */}
      {activeTab === 0 && (
        <div className="space-y-4 rounded-[20px] border border-[#E2E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="border-b border-[#EEF2F6] pb-3 dark:border-[#1E325C]">
            <span className="text-[11px] font-bold text-[#2F6BFF]">الكتاب المقرر ص 46 · شكل رقم (1)</span>
            <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
              خطوات الدورة المحاسبية السبعة (Accounting Cycle Steps)
            </h3>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              الدورة المتسلسلة التي تمر بها العمليات المالية بدءاً من التحليل وحتى إعداد القوائم الختامية.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {ACCOUNTING_CYCLE_STEPS.map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-3 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 transition-colors hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-bold text-white">
                  {step.num}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#0A1630] dark:text-white">{step.title}</h4>
                  <p className="mt-0.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          2. شكل (2): شروط العملية المالية وشجرة القرار (ص 47–48)
         ========================================================= */}
      {activeTab === 1 && (
        <div className="space-y-4 rounded-[20px] border border-[#E2E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="border-b border-[#EEF2F6] pb-3 dark:border-[#1E325C]">
            <span className="text-[11px] font-bold text-[#2F6BFF]">الكتاب المقرر ص 47 · شكل رقم (2)</span>
            <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
              مخطط شجرة القرار لتحديد العملية المالية وتطبيق مثال (1)
            </h3>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              فحص الشروط الثلاثة: القيمة النقدية · الأثر على المركز المالي · وقوع الحدث فعلاً.
            </p>
          </div>

          <div className="space-y-3">
            {STAGE1_BOOK_EVENTS.map((ev, idx) => {
              const current = sheetState.stage1Events[ev.id] || {
                q1Monetary: null, q2Affects: null, q3Occurred: null, userResult: null,
              };

              const updateQ = (key: 'q1Monetary' | 'q2Affects' | 'q3Occurred' | 'userResult', val: boolean) => {
                commitState((prev) => ({
                  ...prev,
                  stage1Events: {
                    ...prev.stage1Events,
                    [ev.id]: { ...prev.stage1Events[ev.id], [key]: val },
                  },
                }));
              };

              const isAllCorrect =
                current.q1Monetary === ev.hasMonetaryValue &&
                current.q2Affects === ev.affectsBalanceSheet &&
                current.q3Occurred === ev.hasActuallyOccurred &&
                current.userResult === ev.isFinancialTransaction;

              return (
                <div
                  key={ev.id}
                  className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 dark:border-[#1E325C] dark:bg-[#070D1F]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0A1630] dark:text-white">
                      ({idx + 1}) {ev.label}
                    </span>
                    {isAllCorrect && (
                      <span className="rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[10px] font-bold text-[#10B981]">
                        صحيح
                      </span>
                    )}
                  </div>

                  {/* فحص الشروط بنظام أزرار سريعة للموبايل */}
                  <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-[10px] bg-white p-2 text-[11px] border border-[#E2E8F0] dark:border-[#1E325C] dark:bg-[#0A1630]">
                      <span>1. قيمة مالية؟</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => updateQ('q1Monetary', true)}
                          className={cn('rounded px-2 py-0.5 font-bold', current.q1Monetary === true ? 'bg-[#2F6BFF] text-white' : 'bg-gray-100 dark:bg-gray-800')}
                        >
                          نعم
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQ('q1Monetary', false)}
                          className={cn('rounded px-2 py-0.5 font-bold', current.q1Monetary === false ? 'bg-[#2F6BFF] text-white' : 'bg-gray-100 dark:bg-gray-800')}
                        >
                          لا
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-[10px] bg-white p-2 text-[11px] border border-[#E2E8F0] dark:border-[#1E325C] dark:bg-[#0A1630]">
                      <span>2. أثر بالمركز؟</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => updateQ('q2Affects', true)}
                          className={cn('rounded px-2 py-0.5 font-bold', current.q2Affects === true ? 'bg-[#2F6BFF] text-white' : 'bg-gray-100 dark:bg-gray-800')}
                        >
                          نعم
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQ('q2Affects', false)}
                          className={cn('rounded px-2 py-0.5 font-bold', current.q2Affects === false ? 'bg-[#2F6BFF] text-white' : 'bg-gray-100 dark:bg-gray-800')}
                        >
                          لا
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-[10px] bg-white p-2 text-[11px] border border-[#E2E8F0] dark:border-[#1E325C] dark:bg-[#0A1630]">
                      <span>3. وقع فعلاً؟</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => updateQ('q3Occurred', true)}
                          className={cn('rounded px-2 py-0.5 font-bold', current.q3Occurred === true ? 'bg-[#2F6BFF] text-white' : 'bg-gray-100 dark:bg-gray-800')}
                        >
                          نعم
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQ('q3Occurred', false)}
                          className={cn('rounded px-2 py-0.5 font-bold', current.q3Occurred === false ? 'bg-[#2F6BFF] text-white' : 'bg-gray-100 dark:bg-gray-800')}
                        >
                          لا
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* القرار النهائي */}
                  <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-gray-200 pt-2 dark:border-gray-800">
                    <span className="text-[11px] font-bold">القرار المحاسبي:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQ('userResult', true)}
                        className={cn('rounded-full px-3 py-1 text-xs font-bold', current.userResult === true ? 'bg-[#10B981] text-white' : 'border border-gray-300 dark:border-gray-700')}
                      >
                        يسجل كعملية مالية
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQ('userResult', false)}
                        className={cn('rounded-full px-3 py-1 text-xs font-bold', current.userResult === false ? 'bg-[#EF4444] text-white' : 'border border-gray-300 dark:border-gray-700')}
                      >
                        لا يسجل
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          3. أمثلة الحالات الفردية (جداول قصيرة ص 53–58)
         ========================================================= */}
      {activeTab === 2 && (
        <div className="space-y-4 rounded-[20px] border border-[#E2E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="border-b border-[#EEF2F6] pb-3 dark:border-[#1E325C]">
            <span className="text-[11px] font-bold text-[#2F6BFF]">الكتاب المقرر ص 53–58 · جداول قصيرة وموجزة</span>
            <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
              أثر العمليات الفردية على معادلة الميزانية (جداول مصغرة لكل حالة)
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* مثال 2 ص 53 */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]">
              <span className="font-bold text-[#2F6BFF]">مثال (2) ص 53: قرض نقدي 40,000 د.أ</span>
              <p className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                حصلت المنشأة على قرض من البنك العربي نقداً بمبلغ 40,000 دينار.
              </p>
              <div className="mt-2 rounded-[10px] bg-white p-2 font-tabular dark:bg-[#0A1630]">
                <div className="flex justify-between font-bold">
                  <span>الأصول (نقدية بالصندوق): +40,000 د.أ</span>
                  <span>الالتزامات (قرض): +40,000 د.أ</span>
                </div>
                <div className="text-[10px] text-[#10B981] mt-0.5">الحالة 1: زيادة في طرف يقابلها زيادة في الطرف الآخر</div>
              </div>
            </div>

            {/* مثال 3 ص 54 */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]">
              <span className="font-bold text-[#2F6BFF]">مثال (3) ص 54: شراء سيارة على الحساب 5,000 د.أ</span>
              <p className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                شراء سيارة من معرض الشهباء على الحساب (بالآجل).
              </p>
              <div className="mt-2 rounded-[10px] bg-white p-2 font-tabular dark:bg-[#0A1630]">
                <div className="flex justify-between font-bold">
                  <span>الأصول (سيارات): +5,000 د.أ</span>
                  <span>الالتزامات (ذمم دائنة): +5,000 د.أ</span>
                </div>
                <div className="text-[10px] text-[#10B981] mt-0.5">الحالة 1: زيادة أصل يقابلها زيادة التزام</div>
              </div>
            </div>

            {/* مثال 6 ص 55 */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]">
              <span className="font-bold text-red-500">مثال (6) ص 55: سداد القرض نقداً 40,000 د.أ</span>
              <p className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                سددت المنشأة قيمة قرض البنك العربي نقداً.
              </p>
              <div className="mt-2 rounded-[10px] bg-white p-2 font-tabular dark:bg-[#0A1630]">
                <div className="flex justify-between font-bold">
                  <span>الأصول (الصندوق): -40,000 د.أ</span>
                  <span>الالتزامات (قرض): -40,000 د.أ</span>
                </div>
                <div className="text-[10px] text-red-400 mt-0.5">الحالة 2: نقصان في طرف يقابله نقصان في الطرف الآخر</div>
              </div>
            </div>

            {/* مثال 10 ص 58 */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]">
              <span className="font-bold text-amber-500">مثال (10) ص 58: شراء أثاث نقداً 1,000 د.أ</span>
              <p className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                اشترت المنشأة أثاثاً بمبلغ 1,000 دينار نقداً من الصندوق.
              </p>
              <div className="mt-2 rounded-[10px] bg-white p-2 font-tabular dark:bg-[#0A1630]">
                <div className="flex justify-between font-bold">
                  <span>أصل يزيد (أثاث): +1,000</span>
                  <span>أصل ينقص (صندوق): -1,000</span>
                </div>
                <div className="text-[10px] text-amber-500 mt-0.5">الحالة 3: زيادة ونقصان في نفس الطرف دون مساس بالطرف الآخر</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          4. شكل (3): مخطط ميزان الأسهم لمعادلة الميزانية (ص 59)
         ========================================================= */}
      {activeTab === 3 && (
        <div className="space-y-4 rounded-[20px] border border-[#E2E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="border-b border-[#EEF2F6] pb-3 dark:border-[#1E325C]">
            <span className="text-[11px] font-bold text-[#2F6BFF]">الكتاب المقرر ص 59 · شكل رقم (3)</span>
            <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
              مخطط الأسهم الأربعة لأثر العمليات على معادلة الميزانية
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {STAGE2_EQUATION_RULES.map((rule) => {
              const userCase = sheetState.stage2Cases[`case-${rule.caseNumber}`]?.selectedCase;
              const isCorrect = userCase === rule.caseNumber;

              const setCase = (num: 1 | 2 | 3 | 4) => {
                commitState((prev) => ({
                  ...prev,
                  stage2Cases: {
                    ...prev.stage2Cases,
                    [`case-${rule.caseNumber}`]: { selectedCase: num },
                  },
                }));
              };

              return (
                <div
                  key={rule.caseNumber}
                  className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 dark:border-[#1E325C] dark:bg-[#070D1F]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2F6BFF]">{rule.title}</span>
                    {isCorrect && (
                      <span className="rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[10px] font-bold text-[#10B981]">
                        مطابق
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#0A1630] dark:text-white">{rule.sampleTransaction}</p>
                  <p className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">{rule.explanation}</p>

                  <div className="mt-2.5 flex gap-1.5">
                    {[1, 2, 3, 4].map((cNum) => (
                      <button
                        key={cNum}
                        type="button"
                        onClick={() => setCase(cNum as 1 | 2 | 3 | 4)}
                        className={cn(
                          'flex-1 rounded-[8px] py-1 text-xs font-bold transition-all',
                          userCase === cNum
                            ? 'bg-[#2F6BFF] text-white shadow-xs'
                            : 'border border-[#E2E8F0] bg-white text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-white'
                        )}
                      >
                        حالة {cNum}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          5. جداول محلات الأمين بنظام الجداول القصيرة للموبايل (ص 60–64)
         ========================================================= */}
      {activeTab === 4 && (
        <div className="space-y-4 rounded-[20px] border border-[#E2E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF2F6] pb-3 dark:border-[#1E325C]">
            <div>
              <span className="text-[11px] font-bold text-[#2F6BFF]">الكتاب ص 60–64 · جداول قصيرة متسلسلة للهاتف</span>
              <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
                محلات الأمين — العمليات العشر لشهر آذار 2024
              </h3>
            </div>

            {/* مؤشر التوازن الفوري */}
            <div
              className={cn(
                'rounded-full px-3 py-1 text-xs font-bold',
                cumulativeBalances.isBalanced
                  ? 'bg-[#10B981]/15 text-[#10B981]'
                  : 'bg-red-500/15 text-red-500'
              )}
            >
              الأصول: {cumulativeBalances.assets.toLocaleString()} د.أ = الالتزامات وحقوق الملكية: {cumulativeBalances.liabilitiesAndEquity.toLocaleString()} د.أ
            </div>
          </div>

          {/* شريط اختيار أرقام العمليات (1 إلى 10) سهل اللمس على الموبايل */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {STAGE3_AL_AMEEN_ROWS.map((row) => (
              <button
                key={row.step}
                type="button"
                onClick={() => setActiveAlAmeenStep(row.step)}
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-xs font-bold transition-all',
                  activeAlAmeenStep === row.step
                    ? 'bg-[#2F6BFF] text-white shadow-sm'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200 dark:bg-[#070D1F] dark:text-[#94A3B8]'
                )}
              >
                {row.step}
              </button>
            ))}
          </div>

          {/* البطاقة المصغرة للعملية المحددة (Mini Table Card) */}
          <div className="rounded-[18px] border border-[#2F6BFF]/30 bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2.5 dark:border-[#1E325C]">
              <div>
                <span className="font-tabular text-[11px] font-bold text-[#2F6BFF]">
                  العملية ({currentAlAmeenRow.step}) · {currentAlAmeenRow.date}
                </span>
                <h4 className="text-sm font-bold text-[#0A1630] dark:text-white">{currentAlAmeenRow.title}</h4>
              </div>
              <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                {currentAlAmeenRow.bookRef}
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-[#0A1630] dark:text-white">
              {currentAlAmeenRow.description}
            </p>

            <div className="mt-2 rounded-[10px] bg-[#2F6BFF]/10 p-2 text-[11px] font-bold text-[#1E40AF] dark:text-[#93C5FD]">
              {currentAlAmeenRow.impactCase}
            </div>

            {/* الجدول القصير للعملية فقط (حقول الإدخال المعنية مباشرة بدون تمرير أفقي طويل) */}
            <div className="mt-3.5 space-y-3">
              <p className="text-xs font-bold text-[#0A1630] dark:text-white">
                أدخل أثر العملية على الحسابات المتأثرة (أدخل الرقم بالإشارة الصحيحة):
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E8F0] dark:border-[#1E325C] dark:bg-[#0A1630]">
                  <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">الصندوق (أصل)</span>
                  <Input
                    type="number"
                    value={currentAlAmeenInput.cash}
                    placeholder="0"
                    onChange={(e) => updateCurrentAlAmeenField('cash', e.target.value)}
                    className="mt-1 h-8 text-center text-xs font-tabular font-bold"
                  />
                </div>

                <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E8F0] dark:border-[#1E325C] dark:bg-[#0A1630]">
                  <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">الآلات (أصل)</span>
                  <Input
                    type="number"
                    value={currentAlAmeenInput.machinery}
                    placeholder="0"
                    onChange={(e) => updateCurrentAlAmeenField('machinery', e.target.value)}
                    className="mt-1 h-8 text-center text-xs font-tabular font-bold"
                  />
                </div>

                <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E8F0] dark:border-[#1E325C] dark:bg-[#0A1630]">
                  <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">الأثاث (أصل)</span>
                  <Input
                    type="number"
                    value={currentAlAmeenInput.furniture}
                    placeholder="0"
                    onChange={(e) => updateCurrentAlAmeenField('furniture', e.target.value)}
                    className="mt-1 h-8 text-center text-xs font-tabular font-bold"
                  />
                </div>

                <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E8F0] dark:border-[#1E325C] dark:bg-[#0A1630]">
                  <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">ذمم مدينة (أصل)</span>
                  <Input
                    type="number"
                    value={currentAlAmeenInput.receivables}
                    placeholder="0"
                    onChange={(e) => updateCurrentAlAmeenField('receivables', e.target.value)}
                    className="mt-1 h-8 text-center text-xs font-tabular font-bold"
                  />
                </div>

                <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E8F0] dark:border-[#1E325C] dark:bg-[#0A1630]">
                  <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">قرطاسية (أصل)</span>
                  <Input
                    type="number"
                    value={currentAlAmeenInput.supplies}
                    placeholder="0"
                    onChange={(e) => updateCurrentAlAmeenField('supplies', e.target.value)}
                    className="mt-1 h-8 text-center text-xs font-tabular font-bold"
                  />
                </div>

                <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E8F0] dark:border-[#1E325C] dark:bg-[#0A1630]">
                  <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">ذمم دائنة (التزام)</span>
                  <Input
                    type="number"
                    value={currentAlAmeenInput.payables}
                    placeholder="0"
                    onChange={(e) => updateCurrentAlAmeenField('payables', e.target.value)}
                    className="mt-1 h-8 text-center text-xs font-tabular font-bold"
                  />
                </div>

                <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E8F0] dark:border-[#1E325C] dark:bg-[#0A1630]">
                  <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">أوراق دفع (التزام)</span>
                  <Input
                    type="number"
                    value={currentAlAmeenInput.notesPayable}
                    placeholder="0"
                    onChange={(e) => updateCurrentAlAmeenField('notesPayable', e.target.value)}
                    className="mt-1 h-8 text-center text-xs font-tabular font-bold"
                  />
                </div>

                <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E8F0] dark:border-[#1E325C] dark:bg-[#0A1630]">
                  <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">رأس المال / الملكية</span>
                  <Input
                    type="number"
                    value={currentAlAmeenInput.capital || currentAlAmeenInput.revenues || currentAlAmeenInput.expenses || currentAlAmeenInput.drawings}
                    placeholder="0"
                    onChange={(e) => {
                      const v = e.target.value;
                      if (activeAlAmeenStep === 1) updateCurrentAlAmeenField('capital', v);
                      else if (activeAlAmeenStep === 4) updateCurrentAlAmeenField('expenses', v);
                      else if (activeAlAmeenStep === 5 || activeAlAmeenStep === 7) updateCurrentAlAmeenField('revenues', v);
                      else if (activeAlAmeenStep === 6) updateCurrentAlAmeenField('drawings', v);
                      else updateCurrentAlAmeenField('capital', v);
                    }}
                    className="mt-1 h-8 text-center text-xs font-tabular font-bold text-[#10B981]"
                  />
                </div>
              </div>
            </div>

            {/* أزرار الانتقال بين العمليات (السابقة / التالية) */}
            <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-3 dark:border-[#1E325C]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={activeAlAmeenStep === 1}
                onClick={() => setActiveAlAmeenStep((p) => Math.max(1, p - 1))}
                className="h-8 gap-1 text-xs font-bold"
              >
                <ChevronRight className="h-4 w-4" />
                <span>العملية السابقة</span>
              </Button>

              <span className="font-tabular text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                العملية {activeAlAmeenStep} من 10
              </span>

              <Button
                type="button"
                size="sm"
                disabled={activeAlAmeenStep === 10}
                onClick={() => setActiveAlAmeenStep((p) => Math.min(10, p + 1))}
                className="h-8 gap-1 bg-[#2F6BFF] text-xs font-bold text-white hover:bg-[#1D4ED8]"
              >
                <span>العملية التالية</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ملخص الأرصدة التراكمية الختامية لمحلات الأمين ص 64 */}
          <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-3.5 text-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
            <h5 className="font-bold text-[#0A1630] dark:text-white">الأرصدة المتراكمة حتى العملية ({activeAlAmeenStep}):</h5>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4 font-tabular">
              <div className="rounded-[8px] bg-gray-50 p-2 dark:bg-gray-800">الصندوق: {cumulativeBalances.cash.toLocaleString()} د.أ</div>
              <div className="rounded-[8px] bg-gray-50 p-2 dark:bg-gray-800">الآلات: {cumulativeBalances.machinery.toLocaleString()} د.أ</div>
              <div className="rounded-[8px] bg-gray-50 p-2 dark:bg-gray-800">الأثاث: {cumulativeBalances.furniture.toLocaleString()} د.أ</div>
              <div className="rounded-[8px] bg-gray-50 p-2 dark:bg-gray-800">ذمم مدينة: {cumulativeBalances.receivables.toLocaleString()} د.أ</div>
              <div className="rounded-[8px] bg-gray-50 p-2 dark:bg-gray-800">قرطاسية: {cumulativeBalances.supplies.toLocaleString()} د.أ</div>
              <div className="rounded-[8px] bg-gray-50 p-2 dark:bg-gray-800">ذمم دائنة: {cumulativeBalances.payables.toLocaleString()} د.أ</div>
              <div className="rounded-[8px] bg-gray-50 p-2 dark:bg-gray-800">أوراق دفع: {cumulativeBalances.notesPayable.toLocaleString()} د.أ</div>
              <div className="rounded-[8px] bg-emerald-50 text-emerald-800 p-2 dark:bg-emerald-950/40 dark:text-emerald-300">
                حقوق الملكية: {cumulativeBalances.equity.toLocaleString()} د.أ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          6. شكل (4 و 8): القوائم المالية وقائمة التدفقات النقدية (ص 64 و 67)
         ========================================================= */}
      {activeTab === 5 && (
        <div className="space-y-4 rounded-[20px] border border-[#E2E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="border-b border-[#EEF2F6] pb-3 dark:border-[#1E325C]">
            <span className="text-[11px] font-bold text-[#2F6BFF]">الكتاب المقرر ص 64 و 67 · أشكال 4 و 8</span>
            <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
              القوائم المالية الأربعة وقائمة التدفقات النقدية (Cash Flow Statement)
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[16px] border border-[#2F6BFF]/30 bg-[#2F6BFF]/5 p-3.5 text-xs dark:bg-[#2F6BFF]/10">
              <span className="font-bold text-[#2F6BFF]">شكل (4) القوائم المالية الأربعة الرئيسية:</span>
              <ul className="mt-2 space-y-1.5 list-disc list-inside text-[#64748B] dark:text-[#94A3B8]">
                <li><strong>قائمة الدخل:</strong> نتيجة الأعمال من ربح أو خسارة عن فترة محددة.</li>
                <li><strong>قائمة حقوق الملكية:</strong> التغير في رأس مال المالك والأرباح والمسحوبات.</li>
                <li><strong>قائمة المركز المالي:</strong> أصول والتزامات وحقوق ملكية المنشأة في لحظة معينة.</li>
                <li><strong>قائمة التدفقات النقدية:</strong> المقبوضات والمدفوعات النقدية مقسمة لـ 3 أنشطة.</li>
              </ul>
            </div>

            <div className="rounded-[16px] border border-[#10B981]/30 bg-[#10B981]/5 p-3.5 text-xs dark:bg-[#10B981]/10">
              <span className="font-bold text-[#10B981]">شكل (8) ص 67: الأنشطة الثلاثة للتدفقات النقدية:</span>
              <ul className="mt-2 space-y-1.5 list-disc list-inside text-[#64748B] dark:text-[#94A3B8]">
                <li><strong>أنشطة تشغيلية:</strong> النقد المحصل من العملاء - النقد المدفوع للمصروفات والموردين.</li>
                <li><strong>أنشطة استثمارية:</strong> النقد من بيع الأصول - النقد المدفوع لشراء أصول غير متداولة.</li>
                <li><strong>أنشطة تمويلية:</strong> النقد من القروض وزيادة رأس المال - النقد المسدد للقروض والمسحوبات.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          7. شكل (5، 6، 7): قوائم محلات الأمين (ص 65–66)
         ========================================================= */}
      {activeTab === 6 && (
        <div className="space-y-4 rounded-[20px] border border-[#E2E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="border-b border-[#EEF2F6] pb-3 dark:border-[#1E325C]">
            <span className="text-[11px] font-bold text-[#2F6BFF]">الكتاب المقرر ص 65–66 · أشكال 5 و 6 و 7</span>
            <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
              إعداد قوائم الدخل وحقوق الملكية والمركز المالي لمحلات الأمين (جداول رأسية موجزة)
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* قائمة الدخل شكل 5 */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]">
              <span className="font-bold text-[#2F6BFF]">شكل (5) قائمة الدخل:</span>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>إيراد خدمات:</span>
                  <Input
                    type="number"
                    placeholder="6100"
                    value={sheetState.stage4Statements.incomeServiceRevenues}
                    onChange={(e) => commitState((p) => ({ ...p, stage4Statements: { ...p.stage4Statements, incomeServiceRevenues: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    className="h-7 w-20 text-center text-xs font-tabular"
                  />
                </div>
                <div className="flex justify-between">
                  <span>مصروف إيجار:</span>
                  <Input
                    type="number"
                    placeholder="400"
                    value={sheetState.stage4Statements.incomeRentExpense}
                    onChange={(e) => commitState((p) => ({ ...p, stage4Statements: { ...p.stage4Statements, incomeRentExpense: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    className="h-7 w-20 text-center text-xs font-tabular"
                  />
                </div>
                <div className="flex justify-between border-t pt-1 font-bold text-[#2F6BFF]">
                  <span>صافي الدخل:</span>
                  <Input
                    type="number"
                    placeholder="5700"
                    value={sheetState.stage4Statements.incomeNetProfit}
                    onChange={(e) => commitState((p) => ({ ...p, stage4Statements: { ...p.stage4Statements, incomeNetProfit: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    className="h-7 w-20 text-center text-xs font-tabular font-bold text-[#2F6BFF]"
                  />
                </div>
              </div>
            </div>

            {/* قائمة حقوق الملكية شكل 6 */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]">
              <span className="font-bold text-[#10B981]">شكل (6) حقوق الملكية:</span>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>رأس مال (1/ 3):</span>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={sheetState.stage4Statements.equityBeginningCapital}
                    onChange={(e) => commitState((p) => ({ ...p, stage4Statements: { ...p.stage4Statements, equityBeginningCapital: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    className="h-7 w-20 text-center text-xs font-tabular"
                  />
                </div>
                <div className="flex justify-between">
                  <span>+ صافي الدخل:</span>
                  <Input
                    type="number"
                    placeholder="5700"
                    value={sheetState.stage4Statements.equityNetProfitAdded}
                    onChange={(e) => commitState((p) => ({ ...p, stage4Statements: { ...p.stage4Statements, equityNetProfitAdded: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    className="h-7 w-20 text-center text-xs font-tabular"
                  />
                </div>
                <div className="flex justify-between">
                  <span>- مسحوبات:</span>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={sheetState.stage4Statements.equityDrawingsDeducted}
                    onChange={(e) => commitState((p) => ({ ...p, stage4Statements: { ...p.stage4Statements, equityDrawingsDeducted: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    className="h-7 w-20 text-center text-xs font-tabular"
                  />
                </div>
                <div className="flex justify-between border-t pt-1 font-bold text-[#10B981]">
                  <span>رأس مال (31/ 3):</span>
                  <Input
                    type="number"
                    placeholder="14700"
                    value={sheetState.stage4Statements.equityEndingCapital}
                    onChange={(e) => commitState((p) => ({ ...p, stage4Statements: { ...p.stage4Statements, equityEndingCapital: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    className="h-7 w-20 text-center text-xs font-tabular font-bold text-[#10B981]"
                  />
                </div>
              </div>
            </div>

            {/* المركز المالي شكل 7 */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]">
              <span className="font-bold text-[#F59E0B]">شكل (7) المركز المالي:</span>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>مجموع الأصول:</span>
                  <Input
                    type="number"
                    placeholder="16700"
                    value={sheetState.stage4Statements.balanceTotalAssets}
                    onChange={(e) => commitState((p) => ({ ...p, stage4Statements: { ...p.stage4Statements, balanceTotalAssets: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    className="h-7 w-20 text-center text-xs font-tabular font-bold text-[#2F6BFF]"
                  />
                </div>
                <div className="flex justify-between">
                  <span>الالتزامات (أوراق دفع):</span>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={sheetState.stage4Statements.balanceTotalLiabilities}
                    onChange={(e) => commitState((p) => ({ ...p, stage4Statements: { ...p.stage4Statements, balanceTotalLiabilities: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    className="h-7 w-20 text-center text-xs font-tabular"
                  />
                </div>
                <div className="flex justify-between">
                  <span>حقوق الملكية:</span>
                  <Input
                    type="number"
                    placeholder="14700"
                    value={sheetState.stage4Statements.balanceEndingEquity}
                    onChange={(e) => commitState((p) => ({ ...p, stage4Statements: { ...p.stage4Statements, balanceEndingEquity: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    className="h-7 w-20 text-center text-xs font-tabular"
                  />
                </div>
                <div className="flex justify-between border-t pt-1 font-bold text-[#10B981]">
                  <span>إجمالي الالتزامات والملكية:</span>
                  <Input
                    type="number"
                    placeholder="16700"
                    value={sheetState.stage4Statements.balanceTotalLiabilitiesAndEquity}
                    onChange={(e) => commitState((p) => ({ ...p, stage4Statements: { ...p.stage4Statements, balanceTotalLiabilitiesAndEquity: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    className="h-7 w-20 text-center text-xs font-tabular font-bold text-[#10B981]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          8. شكل (9): مخطط شبكة ترابط القوائم المالية (ص 70)
         ========================================================= */}
      {activeTab === 7 && (
        <div className="space-y-4 rounded-[20px] border border-[#E2E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="border-b border-[#EEF2F6] pb-3 dark:border-[#1E325C]">
            <span className="text-[11px] font-bold text-[#2F6BFF]">الكتاب المقرر ص 70 · شكل رقم (9)</span>
            <h3 className="text-base font-bold text-[#0A1630] dark:text-white">
              مخطط شبكة العلاقات والترابط المتسلسل بين القوائم المالية
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-[14px] bg-[#2F6BFF]/10 p-3 text-xs text-[#1E40AF] dark:text-[#93C5FD]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-white font-bold">1</span>
              <span><strong>قائمة الدخل:</strong> استخراج صافي الربح (5,700 د.أ) الذي يغذي مباشرة قائمة حقوق الملكية.</span>
            </div>

            <div className="flex items-center gap-3 rounded-[14px] bg-[#10B981]/10 p-3 text-xs text-[#065F46] dark:text-[#6EE7B7]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white font-bold">2</span>
              <span><strong>قائمة حقوق الملكية:</strong> استخراج رأس المال النهائي (14,700 د.أ) الذي ينتقل مباشرة لجانب حقوق الملكية في الميزانية العمومية.</span>
            </div>

            <div className="flex items-center gap-3 rounded-[14px] bg-[#F59E0B]/10 p-3 text-xs text-[#92400E] dark:text-[#FCD34D]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-white font-bold">3</span>
              <span><strong>قائمة التدفقات النقدية:</strong> استخراج رصيد النقدية آخر المدة (8,700 د.أ) الذي يتطابق تماماً مع بند النقدية في الميزانية.</span>
            </div>

            <div className="flex items-center gap-3 rounded-[14px] bg-[#8B5CF6]/10 p-3 text-xs text-[#5B21B6] dark:text-[#C4B5FD]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6] text-white font-bold">4</span>
              <span><strong>قائمة المركز المالي (الميزانية):</strong> تتوازن كافة الأطراف بتطابق: الأصول (16,700 د.أ) = الالتزامات (2,000) + حقوق الملكية (14,700).</span>
            </div>
          </div>
        </div>
      )}

      {/* أزرار التنقل السريع بين المحطات */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E325C]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={activeTab === 0}
          onClick={() => setActiveTab((p) => Math.max(0, p - 1))}
          className="h-8 gap-1 text-xs font-bold"
        >
          <ChevronRight className="h-4 w-4" />
          <span>الشكل السابق</span>
        </Button>

        <span className="font-tabular text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
          المحطة {activeTab + 1} من {SECTIONS.length}
        </span>

        <Button
          type="button"
          size="sm"
          disabled={activeTab === SECTIONS.length - 1}
          onClick={() => setActiveTab((p) => Math.min(SECTIONS.length - 1, p + 1))}
          className="h-8 gap-1 bg-[#2F6BFF] text-xs font-bold text-white hover:bg-[#1D4ED8]"
        >
          <span>الشكل التالي</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
