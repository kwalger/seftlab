'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  FolderOpen,
  RotateCcw,
  Table2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AccountingJournalEntryLine } from '@/types';
import {
  ACCOUNT_GROUP_OPTIONS,
  createDefaultUnit1SpreadsheetState,
  evaluateUnit1SpreadsheetState,
  loadSavedUnit1SpreadsheetState,
  NATURE_OPTIONS,
  saveUnit1SpreadsheetState,
  STAGE1_ACCOUNT_ROWS,
  STAGE2_AVAILABLE_ACCOUNTS,
  STAGE2_HISTORICAL_COST_ROWS,
  STAGE2_JOURNAL_OPERATIONS,
  STAGE2_MODEL_ENTRIES,
  STAGE3_MODEL,
  STATEMENT_OPTIONS,
  UNIT1_CASE_STUDY,
  type AccountGroupCode,
  type AccountNature,
  type FinancialStatementTarget,
  type Unit1SpreadsheetState,
} from '@/lib/labs/accounting/unit1-spreadsheet-data';
import { triggerHaptic } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface Unit1SpreadsheetProjectProps {
  initialStage?: 1 | 2 | 3;
  onJournalChange?: (entries: AccountingJournalEntryLine[]) => void;
  onStateChange?: (state: Unit1SpreadsheetState) => void;
}

const SHEET_TABS: {
  stage: 1 | 2 | 3;
  shortTitle: string;
  fullTitle: string;
  bookRef: string;
}[] = [
  {
    stage: 1,
    shortTitle: '1. دليل الحسابات',
    fullTitle: 'جدول ترميز دليل الحسابات والمستندات والقوائم المالية',
    bookRef: 'ص 16، 34–36',
  },
  {
    stage: 2,
    shortTitle: '2. التكلفة واليومية',
    fullTitle: 'جدول احتساب التكلفة التاريخية للأصل ودفتر اليومية العام',
    bookRef: 'ص 27–35',
  },
  {
    stage: 3,
    shortTitle: '3. الدخل والميزانية',
    fullTitle: 'جدول قائمة الدخل ومعادلة الميزانية الختامية',
    bookRef: 'ص 25–27',
  },
];

export function Unit1SpreadsheetProject({
  initialStage = 1,
  onJournalChange,
  onStateChange,
}: Unit1SpreadsheetProjectProps) {
  const [stage, setStage] = useState<1 | 2 | 3>(initialStage);
  const [sheetState, setSheetState] = useState<Unit1SpreadsheetState>(() =>
    loadSavedUnit1SpreadsheetState()
  );
  const [verifiedStage, setVerifiedStage] = useState<Record<1 | 2 | 3, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  const evaluation = useMemo(
    () => evaluateUnit1SpreadsheetState(sheetState),
    [sheetState]
  );

  const commitState = (updater: (prev: Unit1SpreadsheetState) => Unit1SpreadsheetState) => {
    setSheetState((prev) => {
      const next = updater(prev);
      saveUnit1SpreadsheetState(next);
      onStateChange?.(next);
      onJournalChange?.(next.stage2Journal);
      return next;
    });
  };

  const updateStage1Cell = (
    rowId: string,
    field: 'groupCode' | 'nature' | 'statement',
    val: AccountGroupCode | AccountNature | FinancialStatementTarget
  ) => {
    setVerifiedStage((v) => ({ ...v, 1: false }));
    commitState((prev) => ({
      ...prev,
      stage1: {
        ...prev.stage1,
        [rowId]: {
          ...prev.stage1[rowId],
          [field]: val,
        },
      },
    }));
  };

  const updateStage2Cost = (costId: string, raw: string) => {
    setVerifiedStage((v) => ({ ...v, 2: false }));
    const parsed: number | '' = raw === '' ? '' : Math.max(0, Number(raw) || 0);
    commitState((prev) => ({
      ...prev,
      stage2Costs: {
        ...prev.stage2Costs,
        [costId]: parsed,
      },
    }));
  };

  const updateJournalRow = (
    idx: number,
    patch: Partial<AccountingJournalEntryLine>
  ) => {
    setVerifiedStage((v) => ({ ...v, 2: false }));
    commitState((prev) => ({
      ...prev,
      stage2Journal: prev.stage2Journal.map((row, i) =>
        i === idx ? { ...row, ...patch } : row
      ),
    }));
  };

  const updateStage3Income = (field: 'revenues' | 'expenses', raw: string) => {
    setVerifiedStage((v) => ({ ...v, 3: false }));
    const parsed: number | '' = raw === '' ? '' : Math.max(0, Number(raw) || 0);
    commitState((prev) => ({
      ...prev,
      stage3Income: {
        ...prev.stage3Income,
        [field]: parsed,
      },
    }));
  };

  const updateStage3Balance = (
    field: keyof Unit1SpreadsheetState['stage3Balance'],
    raw: string
  ) => {
    setVerifiedStage((v) => ({ ...v, 3: false }));
    const parsed: number | '' = raw === '' ? '' : Math.max(0, Number(raw) || 0);
    commitState((prev) => ({
      ...prev,
      stage3Balance: {
        ...prev.stage3Balance,
        [field]: parsed,
      },
    }));
  };

  const handleVerifyCurrentStage = () => {
    setVerifiedStage((v) => ({ ...v, [stage]: true }));
    const stagePassed =
      stage === 1
        ? evaluation.stage1.isComplete
        : stage === 2
        ? evaluation.stage2.isComplete
        : evaluation.stage3.isComplete;
    triggerHaptic(stagePassed ? 'success' : 'tap');
    if (stagePassed) {
      toast.success(`أحسنت! جدول المرحلة ${stage} صحيح ومتزن بالكامل.`);
    } else {
      toast.info(`تم فحص خلايا المرحلة ${stage} — راجع الخلايا المميزة باللون الأصفر.`);
    }
  };

  const handleFillGuidedStage = () => {
    triggerHaptic('success');
    if (stage === 1) {
      commitState((prev) => {
        const nextStage1 = { ...prev.stage1 };
        STAGE1_ACCOUNT_ROWS.forEach((spec) => {
          nextStage1[spec.id] = {
            groupCode: spec.expectedGroupCode,
            nature: spec.expectedNature,
            statement: spec.expectedStatement,
          };
        });
        return { ...prev, stage1: nextStage1 };
      });
      setVerifiedStage((v) => ({ ...v, 1: true }));
      toast.success('تمت تعبئة جدول دليل الحسابات بالحل النموذجي للمراجعة.');
      return;
    }

    if (stage === 2) {
      commitState((prev) => ({
        ...prev,
        stage2Costs: {
          'hc-1': 12000,
          'hc-2': 1500,
          'hc-3': 1000,
          'hc-4': 0,
        },
        stage2Journal: STAGE2_MODEL_ENTRIES.map((m, idx) => ({
          ...m,
          id: prev.stage2Journal[idx]?.id || m.id,
        })),
      }));
      setVerifiedStage((v) => ({ ...v, 2: true }));
      toast.success('تمت تعبئة التكلفة التاريخية (14,500 د.أ) وقيود اليومية (56,500 د.أ).');
      return;
    }

    commitState((prev) => ({
      ...prev,
      stage3Income: {
        revenues: STAGE3_MODEL.revenues,
        expenses: STAGE3_MODEL.expenses,
      },
      stage3Balance: {
        cashBalance: STAGE3_MODEL.cashBalance,
        equipmentBalance: STAGE3_MODEL.equipmentBalance,
        liabilitiesBalance: STAGE3_MODEL.liabilitiesBalance,
        capitalBalance: STAGE3_MODEL.capitalBalance,
        retainedProfit: STAGE3_MODEL.retainedProfit,
      },
    }));
    setVerifiedStage((v) => ({ ...v, 3: true }));
    toast.success('تمت تعبئة قائمة الدخل ومعادلة الميزانية (35,000 د.أ).');
  };

  const handleResetAll = () => {
    triggerHaptic('tap');
    const empty = createDefaultUnit1SpreadsheetState();
    saveUnit1SpreadsheetState(empty);
    setSheetState(empty);
    setVerifiedStage({ 1: false, 2: false, 3: false });
    onStateChange?.(empty);
    onJournalChange?.(empty.stage2Journal);
    toast.info('تم مسح جميع الجداول للبدء من جديد.');
  };

  const activeFormula = useMemo(() => {
    if (stage === 1) {
      return `=COUNT_VALID(B2:E7) -> ${evaluation.stage1.correctCells} / ${evaluation.stage1.totalCells} خلية صحيحة`;
    }
    if (stage === 2) {
      return `=SUM(التكلفة_التاريخية) = ${evaluation.stage2.histCostSum.toLocaleString('en-US')} د.أ  |  =SUM(المدين) = ${evaluation.stage2.debitSum.toLocaleString('en-US')}  vs  =SUM(الدائن) = ${evaluation.stage2.creditSum.toLocaleString('en-US')}`;
    }
    return `=صافي_الدخل (${evaluation.stage3.netIncomeVal.toLocaleString('en-US')})  |  الأصول (${evaluation.stage3.totalAssetsVal.toLocaleString('en-US')}) = الالتزامات + حقوق الملكية (${evaluation.stage3.totalLiabEquityVal.toLocaleString('en-US')})`;
  }, [stage, evaluation]);

  const currentTabMeta = SHEET_TABS.find((t) => t.stage === stage) || SHEET_TABS[0];

  return (
    <div className="space-y-4 text-right">
      {/* شريط ملف العمل الموحد */}
      <div className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#0A1630] text-white dark:bg-[#2F6BFF]">
              <FolderOpen className="h-5 w-5 stroke-[1.75]" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-[#0A1630] dark:text-white">
                  {UNIT1_CASE_STUDY.folderTitle}
                </span>
                <span className="rounded-full bg-[#2F6BFF]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#2F6BFF]">
                  {UNIT1_CASE_STUDY.companyName}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                {UNIT1_CASE_STUDY.textbookRef} · الإنجاز الكلي:{' '}
                <strong className="font-tabular text-[#0A1630] dark:text-white">
                  {evaluation.completedStagesCount} / 3 مراحل ({evaluation.overallScore}%)
                </strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAll}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#526077] hover:text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#94A3B8]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>تفريغ الجداول</span>
          </button>
        </div>

        {/* تبويبات أوراق العمل الثلاث (مثل أوراق Excel) */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SHEET_TABS.map((tab) => {
            const isActive = stage === tab.stage;
            const stageEval =
              tab.stage === 1
                ? evaluation.stage1
                : tab.stage === 2
                ? evaluation.stage2
                : evaluation.stage3;

            return (
              <button
                key={tab.stage}
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setStage(tab.stage);
                }}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-[12px] border px-3.5 py-2.5 text-right transition-all',
                  isActive
                    ? 'border-[#2F6BFF] bg-white shadow-xs dark:bg-[#0F1E3E]'
                    : 'border-[#E2E8F0] bg-white/60 hover:bg-white dark:border-[#1E325C] dark:bg-[#0A1630]/60'
                )}
              >
                <div className="min-w-0">
                  <span
                    className={cn(
                      'block truncate text-xs font-bold',
                      isActive ? 'text-[#2F6BFF]' : 'text-[#0A1630] dark:text-white'
                    )}
                  >
                    {tab.shortTitle}
                  </span>
                  <span className="font-tabular text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {tab.bookRef}
                  </span>
                </div>
                <span
                  className={cn(
                    'font-tabular inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold',
                    stageEval.isComplete
                      ? 'bg-[#10B981]/15 text-[#047857] dark:text-[#34D399]'
                      : isActive
                      ? 'bg-[#2F6BFF]/10 text-[#2F6BFF]'
                      : 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#1E325C] dark:text-[#94A3B8]'
                  )}
                >
                  {stageEval.isComplete && <Check className="h-3 w-3 stroke-[2.5]" />}
                  <span>{stageEval.scorePct}%</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* شريط الصيغة الرياضية الحية (Formula Bar) */}
        <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <span className="rounded bg-[#0A1630] px-1.5 py-0.5 font-mono text-[11px] font-bold text-white dark:bg-[#2F6BFF]">
            fx
          </span>
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-[#334155] dark:text-[#CBD5E1]" dir="ltr">
            {activeFormula}
          </span>
        </div>
      </div>

      {/* رأس المرحلة الحالية */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-[#E2E8F0] bg-white px-4 py-3 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-[#059669]" />
          <h3 className="text-sm font-bold text-[#0A1630] dark:text-white">
            المرحلة {stage}: {currentTabMeta.fullTitle}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
          <BookOpen className="h-3.5 w-3.5 text-[#2F6BFF]" />
          <span>المرجع: {currentTabMeta.bookRef}</span>
        </span>
      </div>

      {/* =========================================================
          المرحلة 1: جدول دليل الحسابات والمستندات والقوائم
         ========================================================= */}
      {stage === 1 && (
        <div className="space-y-4">
          {/* جدول Excel للشاشات المتوسطة والكبيرة */}
          <div className="hidden overflow-x-auto rounded-[16px] border border-[#CBD5E1] bg-white md:block dark:border-[#1E325C] dark:bg-[#0A1630]">
            <table className="w-full border-collapse text-right text-xs">
              <thead>
                <tr className="border-b border-[#CBD5E1] bg-[#F1F5F9] font-tabular text-[11px] text-[#475569] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#94A3B8]">
                  <th className="w-10 border-l border-[#E2E8F0] px-2 py-2 text-center dark:border-[#1E325C]">#</th>
                  <th className="border-l border-[#E2E8F0] px-3 py-2 dark:border-[#1E325C]">A · اسم الحساب والرمز</th>
                  <th className="border-l border-[#E2E8F0] px-3 py-2 dark:border-[#1E325C]">B · المستند المؤيد (ص 34)</th>
                  <th className="border-l border-[#E2E8F0] px-3 py-2 dark:border-[#1E325C]">C · المجموعة بدليل الحسابات (ص 36)</th>
                  <th className="border-l border-[#E2E8F0] px-3 py-2 dark:border-[#1E325C]">D · الطبيعة (مدين/دائن)</th>
                  <th className="px-3 py-2">E · القائمة المالية (ص 16)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E325C]">
                {STAGE1_ACCOUNT_ROWS.map((spec, idx) => {
                  const ans = sheetState.stage1[spec.id];
                  const showCheck = verifiedStage[1];
                  const gOk = ans?.groupCode === spec.expectedGroupCode;
                  const nOk = ans?.nature === spec.expectedNature;
                  const sOk = ans?.statement === spec.expectedStatement;
                  const rowAllOk = gOk && nOk && sOk;

                  return (
                    <tr
                      key={spec.id}
                      className={cn(
                        'transition-colors',
                        showCheck && rowAllOk && 'bg-[#10B981]/[0.05]'
                      )}
                    >
                      <td className="border-l border-[#E2E8F0] bg-[#F8FAFC] px-2 py-2.5 text-center font-tabular font-bold text-[#64748B] dark:border-[#1E325C] dark:bg-[#070D1F]">
                        {idx + 1}
                      </td>
                      <td className="border-l border-[#E2E8F0] px-3 py-2.5 dark:border-[#1E325C]">
                        <p className="font-bold text-[#0A1630] dark:text-white">{spec.accountName}</p>
                        <span className="font-tabular text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          حساب فرعي: {spec.subCode}
                        </span>
                      </td>
                      <td className="border-l border-[#E2E8F0] px-3 py-2.5 text-[#475569] dark:border-[#1E325C] dark:text-[#CBD5E1]">
                        {spec.documentSource}
                      </td>
                      <td className="border-l border-[#E2E8F0] p-2 dark:border-[#1E325C]">
                        <select
                          aria-label={`مجموعة حساب ${spec.accountName}`}
                          value={ans?.groupCode || ''}
                          onChange={(e) =>
                            updateStage1Cell(spec.id, 'groupCode', e.target.value as AccountGroupCode)
                          }
                          className={cn(
                            'h-9 w-full rounded-[8px] border px-2 text-xs font-medium dark:bg-[#0F1E3E]',
                            showCheck
                              ? gOk
                                ? 'border-[#10B981] bg-[#10B981]/10 text-[#065F46] dark:text-[#6EE7B7]'
                                : 'border-[#F59E0B] bg-[#F59E0B]/10'
                              : 'border-[#CBD5E1] bg-white dark:border-[#1E325C]'
                          )}
                        >
                          <option value="">-- اختر المجموعة --</option>
                          {ACCOUNT_GROUP_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border-l border-[#E2E8F0] p-2 dark:border-[#1E325C]">
                        <select
                          aria-label={`طبيعة حساب ${spec.accountName}`}
                          value={ans?.nature || ''}
                          onChange={(e) =>
                            updateStage1Cell(spec.id, 'nature', e.target.value as AccountNature)
                          }
                          className={cn(
                            'h-9 w-full rounded-[8px] border px-2 text-xs font-medium dark:bg-[#0F1E3E]',
                            showCheck
                              ? nOk
                                ? 'border-[#10B981] bg-[#10B981]/10 text-[#065F46] dark:text-[#6EE7B7]'
                                : 'border-[#F59E0B] bg-[#F59E0B]/10'
                              : 'border-[#CBD5E1] bg-white dark:border-[#1E325C]'
                          )}
                        >
                          <option value="">-- اختر الطبيعة --</option>
                          {NATURE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          aria-label={`قائمة حساب ${spec.accountName}`}
                          value={ans?.statement || ''}
                          onChange={(e) =>
                            updateStage1Cell(
                              spec.id,
                              'statement',
                              e.target.value as FinancialStatementTarget
                            )
                          }
                          className={cn(
                            'h-9 w-full rounded-[8px] border px-2 text-xs font-medium dark:bg-[#0F1E3E]',
                            showCheck
                              ? sOk
                                ? 'border-[#10B981] bg-[#10B981]/10 text-[#065F46] dark:text-[#6EE7B7]'
                                : 'border-[#F59E0B] bg-[#F59E0B]/10'
                              : 'border-[#CBD5E1] bg-white dark:border-[#1E325C]'
                          )}
                        >
                          <option value="">-- اختر القائمة --</option>
                          {STATEMENT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* عرض مبسط للهواتف (< md) */}
          <div className="space-y-3 md:hidden">
            {STAGE1_ACCOUNT_ROWS.map((spec, idx) => {
              const ans = sheetState.stage1[spec.id];
              const showCheck = verifiedStage[1];
              const gOk = ans?.groupCode === spec.expectedGroupCode;
              const nOk = ans?.nature === spec.expectedNature;
              const sOk = ans?.statement === spec.expectedStatement;

              return (
                <div
                  key={spec.id}
                  className="space-y-2.5 rounded-[16px] border border-[#E2E8F0] bg-white p-4 dark:border-[#1E325C] dark:bg-[#0A1630]"
                >
                  <div className="flex items-center justify-between border-b border-[#EEF2F6] pb-2 dark:border-[#1E325C]">
                    <div>
                      <span className="font-tabular text-[11px] font-bold text-[#2F6BFF]">
                        صف #{idx + 1} · رمز فرعي {spec.subCode}
                      </span>
                      <h4 className="text-sm font-bold text-[#0A1630] dark:text-white">
                        {spec.accountName}
                      </h4>
                    </div>
                    {showCheck && gOk && nOk && sOk && (
                      <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    المستند: {spec.documentSource}
                  </p>
                  <div className="space-y-2">
                    <select
                      value={ans?.groupCode || ''}
                      onChange={(e) =>
                        updateStage1Cell(spec.id, 'groupCode', e.target.value as AccountGroupCode)
                      }
                      className={cn(
                        'min-h-[44px] w-full rounded-[10px] border px-3 text-sm dark:bg-[#0F1E3E]',
                        showCheck
                          ? gOk
                            ? 'border-[#10B981] bg-[#10B981]/10'
                            : 'border-[#F59E0B] bg-[#F59E0B]/10'
                          : 'border-[#CBD5E1] bg-white dark:border-[#1E325C]'
                      )}
                    >
                      <option value="">1. رقم المجموعة بدليل الحسابات</option>
                      {ACCOUNT_GROUP_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={ans?.nature || ''}
                      onChange={(e) =>
                        updateStage1Cell(spec.id, 'nature', e.target.value as AccountNature)
                      }
                      className={cn(
                        'min-h-[44px] w-full rounded-[10px] border px-3 text-sm dark:bg-[#0F1E3E]',
                        showCheck
                          ? nOk
                            ? 'border-[#10B981] bg-[#10B981]/10'
                            : 'border-[#F59E0B] bg-[#F59E0B]/10'
                          : 'border-[#CBD5E1] bg-white dark:border-[#1E325C]'
                      )}
                    >
                      <option value="">2. طبيعة الحساب (مدين / دائن)</option>
                      {NATURE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={ans?.statement || ''}
                      onChange={(e) =>
                        updateStage1Cell(
                          spec.id,
                          'statement',
                          e.target.value as FinancialStatementTarget
                        )
                      }
                      className={cn(
                        'min-h-[44px] w-full rounded-[10px] border px-3 text-sm dark:bg-[#0F1E3E]',
                        showCheck
                          ? sOk
                            ? 'border-[#10B981] bg-[#10B981]/10'
                            : 'border-[#F59E0B] bg-[#F59E0B]/10'
                          : 'border-[#CBD5E1] bg-white dark:border-[#1E325C]'
                      )}
                    >
                      <option value="">3. القائمة المالية المختصة</option>
                      {STATEMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {showCheck && !(gOk && nOk && sOk) && (
                    <p className="rounded-[10px] bg-[#FEF3C7] p-2.5 text-xs text-[#92400E] dark:bg-[#F59E0B]/15 dark:text-[#FCD34D]">
                      {spec.bookHint}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          المرحلة 2: جدول التكلفة التاريخية + جدول دفتر اليومية العام
         ========================================================= */}
      {stage === 2 && (
        <div className="space-y-5">
          {/* الجزء 2A: جدول احتساب التكلفة التاريخية للأصل */}
          <div className="overflow-hidden rounded-[16px] border border-[#CBD5E1] bg-white dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 dark:border-[#1E325C] dark:bg-[#070D1F]">
              <div>
                <h4 className="text-xs font-bold text-[#0A1630] sm:text-sm dark:text-white">
                  جدول 2-أ: ورقة احتساب التكلفة التاريخية للآلة (مبدأ التكلفة التاريخية ص 29)
                </h4>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  أدخل المبلغ الذي يُدرج ضمن تكلفة الآلة في العمود D (أدخل 0 للبند الشخصي وفق فرض الوحدة المستقلة ص 27).
                </p>
              </div>
              <span className="font-tabular rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-xs font-bold text-[#2F6BFF]">
                المجموع الحي: {evaluation.stage2.histCostSum.toLocaleString('en-US')} د.أ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-right text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] font-tabular text-[11px] text-[#475569] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#94A3B8]">
                    <th className="w-10 border-l border-[#E2E8F0] px-2 py-2 text-center dark:border-[#1E325C]">#</th>
                    <th className="border-l border-[#E2E8F0] px-3 py-2 dark:border-[#1E325C]">A · البيان المحاسبي</th>
                    <th className="hidden border-l border-[#E2E8F0] px-3 py-2 sm:table-cell dark:border-[#1E325C]">
                      B · نوع المستند
                    </th>
                    <th className="border-l border-[#E2E8F0] px-3 py-2 dark:border-[#1E325C]">C · قيمة الفاتورة</th>
                    <th className="px-3 py-2">D · المبلغ المُرسمل في تكلفة الآلة (د.أ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E325C]">
                  {STAGE2_HISTORICAL_COST_ROWS.map((row, idx) => {
                    const val = sheetState.stage2Costs[row.id];
                    const showCheck = verifiedStage[2];
                    const ok =
                      val !== '' &&
                      val !== undefined &&
                      Number(val) === row.expectedCapitalized;

                    return (
                      <tr key={row.id}>
                        <td className="border-l border-[#E2E8F0] bg-[#F8FAFC] px-2 py-2.5 text-center font-tabular font-bold text-[#64748B] dark:border-[#1E325C] dark:bg-[#070D1F]">
                          {idx + 1}
                        </td>
                        <td className="border-l border-[#E2E8F0] px-3 py-2.5 dark:border-[#1E325C]">
                          <p className="font-semibold text-[#0A1630] dark:text-white">{row.itemTitle}</p>
                          {showCheck && !ok && (
                            <p className="mt-1 text-[11px] font-medium text-[#B45309] dark:text-[#FCD34D]">
                              {row.bookHint}
                            </p>
                          )}
                        </td>
                        <td className="hidden border-l border-[#E2E8F0] px-3 py-2.5 text-[#64748B] sm:table-cell dark:border-[#1E325C] dark:text-[#94A3B8]">
                          {row.documentType}
                        </td>
                        <td className="border-l border-[#E2E8F0] px-3 py-2.5 font-tabular font-semibold text-[#334155] dark:border-[#1E325C] dark:text-[#CBD5E1]">
                          {row.documentAmount.toLocaleString('en-US')} د.أ
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            aria-label={row.itemTitle}
                            placeholder="0"
                            value={val === '' ? '' : val}
                            onChange={(e) => updateStage2Cost(row.id, e.target.value)}
                            className={cn(
                              'min-h-[42px] font-tabular text-xs font-bold',
                              showCheck &&
                                (ok
                                  ? 'border-[#10B981] bg-[#10B981]/10'
                                  : 'border-[#F59E0B] bg-[#F59E0B]/10')
                            )}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#0A1630]/[0.04] font-bold dark:bg-[#070D1F]">
                    <td colSpan={3} className="border-l border-[#E2E8F0] px-3 py-2.5 text-xs dark:border-[#1E325C]">
                      =SUM(D1:D4) إجمالي التكلفة التاريخية للآلة الجاهزة للتشغيل
                    </td>
                    <td className="hidden border-l border-[#E2E8F0] px-3 py-2.5 font-tabular text-xs text-[#64748B] sm:table-cell dark:border-[#1E325C]">
                      إجمالي الفواتير: 15,300
                    </td>
                    <td className="px-3 py-2.5 font-tabular text-sm text-[#2F6BFF]">
                      {evaluation.stage2.histCostSum.toLocaleString('en-US')} د.أ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* الجزء 2B: جدول دفتر اليومية العام الإلزامي (ص 35) */}
          <div className="overflow-hidden rounded-[16px] border border-[#CBD5E1] bg-white dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 dark:border-[#1E325C] dark:bg-[#070D1F]">
              <div>
                <h4 className="text-xs font-bold text-[#0A1630] sm:text-sm dark:text-white">
                  جدول 2-ب: دفتر اليومية العام الإلزامي (ص 35)
                </h4>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  سجّل العمليات المالية الأربع لشركة النور بتحديد الحساب المدين والدائن والمبلغ بالدينار الأردني.
                </p>
              </div>
              <span
                className={cn(
                  'font-tabular rounded-full px-3 py-1 text-xs font-bold',
                  evaluation.stage2.isJournalBalanced
                    ? 'bg-[#10B981]/15 text-[#047857] dark:text-[#34D399]'
                    : 'bg-[#F59E0B]/15 text-[#B45309] dark:text-[#FCD34D]'
                )}
              >
                {evaluation.stage2.isJournalBalanced
                  ? `متوازن: ${evaluation.stage2.debitSum.toLocaleString('en-US')} د.أ`
                  : `الفرق: ${Math.abs(evaluation.stage2.debitSum - evaluation.stage2.creditSum).toLocaleString('en-US')} د.أ`}
              </span>
            </div>

            {/* جدول دفتر اليومية للشاشات الكبيرة */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-right text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] font-tabular text-[11px] text-[#475569] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#94A3B8]">
                    <th className="w-10 border-l border-[#E2E8F0] px-2 py-2 text-center dark:border-[#1E325C]">#</th>
                    <th className="border-l border-[#E2E8F0] px-3 py-2 dark:border-[#1E325C]">العملية المالية والمرجع</th>
                    <th className="border-l border-[#E2E8F0] px-3 py-2 dark:border-[#1E325C]">الحساب المدين (من حـ/)</th>
                    <th className="border-l border-[#E2E8F0] px-3 py-2 dark:border-[#1E325C]">الحساب الدائن (إلى حـ/)</th>
                    <th className="w-32 border-l border-[#E2E8F0] px-3 py-2 dark:border-[#1E325C]">مبلغ المدين</th>
                    <th className="w-32 px-3 py-2">مبلغ الدائن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E325C]">
                  {STAGE2_JOURNAL_OPERATIONS.map((op, idx) => {
                    const row = sheetState.stage2Journal[idx] || STAGE2_MODEL_ENTRIES[idx];
                    const showCheck = verifiedStage[2];
                    const rowOk =
                      row.debitAccount === op.debitAccount &&
                      row.creditAccount === op.creditAccount &&
                      Number(row.debitAmount) === op.amount &&
                      Number(row.creditAmount) === op.amount;

                    return (
                      <tr key={op.id} className={cn(showCheck && rowOk && 'bg-[#10B981]/[0.05]')}>
                        <td className="border-l border-[#E2E8F0] bg-[#F8FAFC] px-2 py-2.5 text-center font-tabular font-bold text-[#64748B] dark:border-[#1E325C] dark:bg-[#070D1F]">
                          {idx + 1}
                        </td>
                        <td className="border-l border-[#E2E8F0] px-3 py-2.5 dark:border-[#1E325C]">
                          <p className="font-semibold text-[#0A1630] dark:text-white">{op.description}</p>
                          <span className="text-[11px] text-[#2F6BFF]">{op.bookRef}</span>
                        </td>
                        <td className="border-l border-[#E2E8F0] p-2 dark:border-[#1E325C]">
                          <select
                            aria-label={`الحساب المدين - ${op.label}`}
                            value={row.debitAccount}
                            onChange={(e) =>
                              updateJournalRow(idx, { debitAccount: e.target.value })
                            }
                            className="h-9 w-full rounded-[8px] border border-[#CBD5E1] bg-white px-2 text-xs dark:border-[#1E325C] dark:bg-[#0F1E3E]"
                          >
                            {STAGE2_AVAILABLE_ACCOUNTS.map((acc) => (
                              <option key={acc} value={acc}>
                                {acc}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border-l border-[#E2E8F0] p-2 dark:border-[#1E325C]">
                          <select
                            aria-label={`الحساب الدائن - ${op.label}`}
                            value={row.creditAccount}
                            onChange={(e) =>
                              updateJournalRow(idx, { creditAccount: e.target.value })
                            }
                            className="h-9 w-full rounded-[8px] border border-[#CBD5E1] bg-white px-2 text-xs dark:border-[#1E325C] dark:bg-[#0F1E3E]"
                          >
                            {STAGE2_AVAILABLE_ACCOUNTS.map((acc) => (
                              <option key={acc} value={acc}>
                                {acc}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border-l border-[#E2E8F0] p-2 dark:border-[#1E325C]">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={row.debitAmount || ''}
                            placeholder="0"
                            onChange={(e) =>
                              updateJournalRow(idx, { debitAmount: Number(e.target.value) || 0 })
                            }
                            className="h-9 font-tabular text-xs font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={row.creditAmount || ''}
                            placeholder="0"
                            onChange={(e) =>
                              updateJournalRow(idx, { creditAmount: Number(e.target.value) || 0 })
                            }
                            className="h-9 font-tabular text-xs font-bold"
                          />
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#0A1630]/[0.04] font-bold dark:bg-[#070D1F]">
                    <td colSpan={4} className="border-l border-[#E2E8F0] px-3 py-2.5 text-xs dark:border-[#1E325C]">
                      =SUM(المدين) و =SUM(الدائن) الإجمالي الكلي لدفتر اليومية
                    </td>
                    <td className="border-l border-[#E2E8F0] px-3 py-2.5 font-tabular text-sm text-[#2F6BFF] dark:border-[#1E325C]">
                      {evaluation.stage2.debitSum.toLocaleString('en-US')} د.أ
                    </td>
                    <td className="px-3 py-2.5 font-tabular text-sm text-[#2F6BFF]">
                      {evaluation.stage2.creditSum.toLocaleString('en-US')} د.أ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* بطاقات دفتر اليومية للهاتف */}
            <div className="space-y-3 p-3.5 md:hidden">
              {STAGE2_JOURNAL_OPERATIONS.map((op, idx) => {
                const row = sheetState.stage2Journal[idx] || STAGE2_MODEL_ENTRIES[idx];
                return (
                  <div
                    key={op.id}
                    className="space-y-2.5 rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 dark:border-[#1E325C] dark:bg-[#070D1F]"
                  >
                    <p className="text-[11px] font-bold text-[#2F6BFF]">
                      {op.label} · {op.bookRef}
                    </p>
                    <p className="text-xs leading-relaxed font-medium text-[#0A1630] dark:text-white">
                      {op.description}
                    </p>
                    <div className="space-y-2">
                      <select
                        value={row.debitAccount}
                        onChange={(e) => updateJournalRow(idx, { debitAccount: e.target.value })}
                        className="min-h-[44px] w-full rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-xs dark:border-[#1E325C] dark:bg-[#0A1630]"
                      >
                        {STAGE2_AVAILABLE_ACCOUNTS.map((acc) => (
                          <option key={acc} value={acc}>
                            من حـ/ {acc}
                          </option>
                        ))}
                      </select>
                      <select
                        value={row.creditAccount}
                        onChange={(e) => updateJournalRow(idx, { creditAccount: e.target.value })}
                        className="min-h-[44px] w-full rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-xs dark:border-[#1E325C] dark:bg-[#0A1630]"
                      >
                        {STAGE2_AVAILABLE_ACCOUNTS.map((acc) => (
                          <option key={acc} value={acc}>
                            إلى حـ/ {acc}
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="المدين"
                          value={row.debitAmount || ''}
                          onChange={(e) =>
                            updateJournalRow(idx, { debitAmount: Number(e.target.value) || 0 })
                          }
                          className="min-h-[44px] font-tabular text-xs font-bold"
                        />
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="الدائن"
                          value={row.creditAmount || ''}
                          onChange={(e) =>
                            updateJournalRow(idx, { creditAmount: Number(e.target.value) || 0 })
                          }
                          className="min-h-[44px] font-tabular text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          المرحلة 3: جدول قائمة الدخل وجدول معادلة الميزانية
         ========================================================= */}
      {stage === 3 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* جدول قائمة الدخل (ص 27) */}
          <div className="overflow-hidden rounded-[16px] border border-[#CBD5E1] bg-white lg:col-span-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 dark:border-[#1E325C] dark:bg-[#070D1F]">
              <h4 className="text-xs font-bold text-[#0A1630] sm:text-sm dark:text-white">
                جدول 3-أ: قائمة الدخل (نتيجة الأعمال ص 27)
              </h4>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                استخرج صافي الربح بطرح المصروفات المقابلة من الإيرادات المحققة.
              </p>
            </div>
            <table className="w-full border-collapse text-right text-xs">
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E325C]">
                <tr>
                  <td className="px-4 py-3 font-semibold text-[#0A1630] dark:text-white">
                    إجمالي الإيرادات المحققة
                  </td>
                  <td className="w-36 p-2.5">
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="0"
                      value={sheetState.stage3Income.revenues}
                      onChange={(e) => updateStage3Income('revenues', e.target.value)}
                      className={cn(
                        'min-h-[42px] font-tabular text-xs font-bold',
                        verifiedStage[3] &&
                          (evaluation.stage3.revenuesVal === STAGE3_MODEL.revenues
                            ? 'border-[#10B981] bg-[#10B981]/10'
                            : 'border-[#F59E0B] bg-[#F59E0B]/10')
                      )}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-[#0A1630] dark:text-white">
                    (-) إجمالي المصروفات التشغيلية
                  </td>
                  <td className="w-36 p-2.5">
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="0"
                      value={sheetState.stage3Income.expenses}
                      onChange={(e) => updateStage3Income('expenses', e.target.value)}
                      className={cn(
                        'min-h-[42px] font-tabular text-xs font-bold',
                        verifiedStage[3] &&
                          (evaluation.stage3.expensesVal === STAGE3_MODEL.expenses
                            ? 'border-[#10B981] bg-[#10B981]/10'
                            : 'border-[#F59E0B] bg-[#F59E0B]/10')
                      )}
                    />
                  </td>
                </tr>
                <tr className="bg-[#059669]/[0.06] font-bold">
                  <td className="px-4 py-3.5 text-xs text-[#047857] dark:text-[#34D399]">
                    = صافي الربح (=الإيرادات - المصروفات)
                  </td>
                  <td className="px-4 py-3.5 font-tabular text-sm text-[#047857] dark:text-[#34D399]">
                    {evaluation.stage3.netIncomeVal.toLocaleString('en-US')} د.أ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* جدول قائمة المركز المالي ومعادلة الميزانية (ص 25 و27) */}
          <div className="overflow-hidden rounded-[16px] border border-[#CBD5E1] bg-white lg:col-span-7 dark:border-[#1E325C] dark:bg-[#0A1630]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 dark:border-[#1E325C] dark:bg-[#070D1F]">
              <div>
                <h4 className="text-xs font-bold text-[#0A1630] sm:text-sm dark:text-white">
                  جدول 3-ب: قائمة المركز المالي ومعادلة الميزانية (ص 25، 27)
                </h4>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  الأصول = الالتزامات + حقوق الملكية (رأس المال + صافي ربح الفترة).
                </p>
              </div>
              <span
                className={cn(
                  'font-tabular rounded-full px-3 py-1 text-xs font-bold',
                  evaluation.stage3.isBalanced
                    ? 'bg-[#10B981]/15 text-[#047857] dark:text-[#34D399]'
                    : 'bg-[#F1F5F9] text-[#475569] dark:bg-[#1E325C] dark:text-[#94A3B8]'
                )}
              >
                {evaluation.stage3.isBalanced ? 'الميزانية متزنة (35,000 د.أ)' : 'بانتظار التوازن'}
              </span>
            </div>

            <div className="grid grid-cols-1 divide-y divide-[#E2E8F0] sm:grid-cols-2 sm:divide-x sm:divide-x-reverse sm:divide-y-0 dark:divide-[#1E325C]">
              {/* كفة الأصول */}
              <div className="space-y-3 p-4">
                <p className="text-xs font-bold text-[#2F6BFF]">الطرف الأيمن: الأصول</p>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#526077] dark:text-[#94A3B8]">
                    رصيد النقدية لدى البنك الختامي
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={sheetState.stage3Balance.cashBalance}
                    onChange={(e) => updateStage3Balance('cashBalance', e.target.value)}
                    className={cn(
                      'min-h-[42px] font-tabular text-xs font-bold',
                      verifiedStage[3] &&
                        (Number(sheetState.stage3Balance.cashBalance) === STAGE3_MODEL.cashBalance
                          ? 'border-[#10B981] bg-[#10B981]/10'
                          : 'border-[#F59E0B] bg-[#F59E0B]/10')
                    )}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#526077] dark:text-[#94A3B8]">
                    المعدات والآلات (بالتكلفة التاريخية)
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={sheetState.stage3Balance.equipmentBalance}
                    onChange={(e) => updateStage3Balance('equipmentBalance', e.target.value)}
                    className={cn(
                      'min-h-[42px] font-tabular text-xs font-bold',
                      verifiedStage[3] &&
                        (Number(sheetState.stage3Balance.equipmentBalance) ===
                        STAGE3_MODEL.equipmentBalance
                          ? 'border-[#10B981] bg-[#10B981]/10'
                          : 'border-[#F59E0B] bg-[#F59E0B]/10')
                    )}
                  />
                </div>
                <div className="flex items-center justify-between rounded-[10px] bg-[#2F6BFF]/10 px-3 py-2.5 text-xs font-bold text-[#2F6BFF]">
                  <span>مجموع الأصول</span>
                  <span className="font-tabular">
                    {evaluation.stage3.totalAssetsVal.toLocaleString('en-US')} د.أ
                  </span>
                </div>
              </div>

              {/* كفة الالتزامات + حقوق الملكية */}
              <div className="space-y-3 p-4">
                <p className="text-xs font-bold text-[#0A1630] dark:text-white">
                  الطرف الأيسر: الالتزامات + حقوق الملكية
                </p>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#526077] dark:text-[#94A3B8]">
                    الالتزامات (الذمم الدائنة)
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={sheetState.stage3Balance.liabilitiesBalance}
                    onChange={(e) => updateStage3Balance('liabilitiesBalance', e.target.value)}
                    className="min-h-[42px] font-tabular text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#526077] dark:text-[#94A3B8]">
                    رأس المال المساهم
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={sheetState.stage3Balance.capitalBalance}
                    onChange={(e) => updateStage3Balance('capitalBalance', e.target.value)}
                    className={cn(
                      'min-h-[42px] font-tabular text-xs font-bold',
                      verifiedStage[3] &&
                        (Number(sheetState.stage3Balance.capitalBalance) ===
                        STAGE3_MODEL.capitalBalance
                          ? 'border-[#10B981] bg-[#10B981]/10'
                          : 'border-[#F59E0B] bg-[#F59E0B]/10')
                    )}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#526077] dark:text-[#94A3B8]">
                    صافي ربح الفترة المضاف لحقوق الملكية
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={sheetState.stage3Balance.retainedProfit}
                    onChange={(e) => updateStage3Balance('retainedProfit', e.target.value)}
                    className={cn(
                      'min-h-[42px] font-tabular text-xs font-bold',
                      verifiedStage[3] &&
                        (Number(sheetState.stage3Balance.retainedProfit) ===
                        STAGE3_MODEL.retainedProfit
                          ? 'border-[#10B981] bg-[#10B981]/10'
                          : 'border-[#F59E0B] bg-[#F59E0B]/10')
                    )}
                  />
                </div>
                <div className="flex items-center justify-between rounded-[10px] bg-[#0A1630]/8 px-3 py-2.5 text-xs font-bold text-[#0A1630] dark:bg-white/10 dark:text-white">
                  <span>الالتزامات + حقوق الملكية</span>
                  <span className="font-tabular">
                    {evaluation.stage3.totalLiabEquityVal.toLocaleString('en-US')} د.أ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* أزرار التحكم والتنقل بين المراحل */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 dark:border-[#1E325C] dark:bg-[#070D1F]">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={handleVerifyCurrentStage}
            className="min-h-[44px] gap-1.5 text-xs font-bold"
          >
            <Table2 className="h-4 w-4" />
            <span>تحقق من أرقام الجدول</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleFillGuidedStage}
            className="min-h-[44px] text-xs font-semibold"
          >
            تعبئة مثال استرشادي للمرحلة
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={stage === 1}
            onClick={() => setStage((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
            className="min-h-[44px] gap-1 text-xs"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>المرحلة السابقة</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={stage === 3}
            onClick={() => setStage((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s))}
            className="min-h-[44px] gap-1 text-xs"
          >
            <span>المرحلة التالية</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
