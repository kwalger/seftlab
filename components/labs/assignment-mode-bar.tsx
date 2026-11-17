'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Info,
  Plus,
  Scale,
  Sparkles,
  Trash2,
  Play,
  ArrowRight,
  Lock,
  Wand2,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { useTeacherStore } from '@/store/use-teacher-store';
import { useAccountingLabStore } from '@/lib/labs/accounting/store';
import { getUnit1LegoTaskById } from '@/lib/labs/accounting/unit1-lego-tasks';
import { Unit1LegoBuilder } from '@/components/labs/accounting/unit1-lego-builder';
import { Unit1SpreadsheetProject } from '@/components/labs/accounting/unit1-spreadsheet-project';
import { Unit2SpreadsheetProject } from '@/components/labs/accounting/unit2-spreadsheet-project';
import {
  evaluateUnit1SpreadsheetState,
  loadSavedUnit1SpreadsheetState,
  type Unit1SpreadsheetState,
} from '@/lib/labs/accounting/unit1-spreadsheet-data';
import {
  evaluateUnit2SpreadsheetState,
  loadSavedUnit2SpreadsheetState,
  type Unit2SpreadsheetState,
} from '@/lib/labs/accounting/unit2-spreadsheet-data';
import {
  generateStudentManagementVariables,
  runPythonInWorkerWithTimeout,
} from '@/lib/grading';
import { simulateMarketingCampaign, MARKETING_CHANNELS, MarketingChannelId } from '@/lib/labs/marketing';
import { triggerHaptic } from '@/lib/haptics';
import { AccountingJournalEntryLine } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PY_SYMBOLS: { label: string; value: string }[] = [
  { label: 'Tab', value: '    ' },
  { label: '(', value: '(' },
  { label: ')', value: ')' },
  { label: ':', value: ':' },
  { label: '"', value: '"' },
  { label: "'", value: "'" },
  { label: '[', value: '[' },
  { label: ']', value: ']' },
  { label: '=', value: '=' },
];

function createInitialAccountingEntries(
  operationsPrompt?: string[],
  availableAccounts?: string[]
): AccountingJournalEntryLine[] {
  const defaultAccount = availableAccounts?.[0] || 'النقدية والبنك';
  const count = Math.max(1, operationsPrompt?.length || 2);
  return Array.from({ length: count }, (_, idx) => ({
    id: `row-${idx + 1}`,
    description: `القيد #${idx + 1}`,
    debitAccount: defaultAccount,
    creditAccount: defaultAccount,
    debitAmount: 0,
    creditAmount: 0,
  }));
}

export function AssignmentModeWorkspace() {
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');

  const { currentStudent, awardLabXp } = useAppStore();
  const { assignments, submissions, submitStudentAssignment } =
    useTeacherStore();
  const { completeUnit1LegoTask } = useAccountingLabStore();

  const assignment = useMemo(
    () => assignments.find((a) => a.id === assignmentId),
    [assignments, assignmentId]
  );

  const legoTask = useMemo(() => {
    if (!assignment?.legoConfig?.taskId) return undefined;
    return getUnit1LegoTaskById(assignment.legoConfig.taskId);
  }, [assignment]);

  const existingSubmission = useMemo(() => {
    if (!assignment) return undefined;
    return submissions.find(
      (s) =>
        s.assignmentId === assignment.id &&
        s.studentUsername === currentStudent.username
    );
  }, [assignment, submissions, currentStudent.username]);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [legoPlacements, setLegoPlacements] = useState<Record<string, string>>(
    {}
  );
  const [spreadsheetState, setSpreadsheetState] =
    useState<Unit1SpreadsheetState>(() => loadSavedUnit1SpreadsheetState());
  const [unit2SpreadsheetState, setUnit2SpreadsheetState] =
    useState<Unit2SpreadsheetState>(() => loadSavedUnit2SpreadsheetState());

  const stageParam = searchParams.get('stage');
  const initialStage: 1 | 2 | 3 | 4 =
    stageParam === '2' ? 2 : stageParam === '3' ? 3 : stageParam === '4' ? 4 : 1;
  const isUnit1SpreadsheetProject = assignment?.id === 'asg-u1-comprehensive';
  const isUnit2SpreadsheetProject = assignment?.id === 'asg-u2-comprehensive';

  // Accounting state
  const [accEntries, setAccEntries] = useState<AccountingJournalEntryLine[]>(
    () =>
      createInitialAccountingEntries(
        assignment?.accountingConfig?.operationsPrompt,
        assignment?.accountingConfig?.availableAccounts
      )
  );

  const [trackedAssignmentId, setTrackedAssignmentId] = useState<
    string | undefined
  >(assignment?.id);

  if (trackedAssignmentId !== assignment?.id) {
    setTrackedAssignmentId(assignment?.id);
    setElapsedSeconds(0);
    setLegoPlacements({});
    setAccEntries(
      createInitialAccountingEntries(
        assignment?.accountingConfig?.operationsPrompt,
        assignment?.accountingConfig?.availableAccounts
      )
    );
  }

  // Marketing state
  const [mktChannel, setMktChannel] = useState<MarketingChannelId>('search_seo');
  const [mktPrice, setMktPrice] = useState<number>(48);
  const [mktBudget, setMktBudget] = useState<number>(1250);

  // Management state
  const studentMgmtVars = useMemo(() => {
    if (!assignment?.managementConfig) {
      return {
        fixedCosts: 15000,
        variableCostPerUnit: 18,
        sellingPricePerUnit: 48,
      };
    }
    return generateStudentManagementVariables(
      currentStudent.username,
      assignment.managementConfig
    );
  }, [assignment, currentStudent.username]);

  const [mgmtMarginInput, setMgmtMarginInput] = useState<string>(() =>
    String(
      studentMgmtVars.sellingPricePerUnit -
        studentMgmtVars.variableCostPerUnit
    )
  );
  const [mgmtUnitsInput, setMgmtUnitsInput] = useState<string>(() =>
    String(
      Math.ceil(
        studentMgmtVars.fixedCosts /
          Math.max(
            1,
            studentMgmtVars.sellingPricePerUnit -
              studentMgmtVars.variableCostPerUnit
          )
      )
    )
  );

  // Python state
  const [pyCode, setPyCode] = useState<string>(
    () =>
      assignment?.pythonConfig?.starterCode ||
      `def calculate_net_profit(revenue, expenses, tax_rate=0.15):\n    gross = revenue - expenses\n    if gross <= 0:\n        return round(gross, 2)\n    return round(gross * (1 - tax_rate), 2)\n`
  );
  const [pyStdout, setPyStdout] = useState<string>('');
  const [pyRunning, setPyRunning] = useState(false);
  const pyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertPySymbol = (val: string) => {
    triggerHaptic('tap');
    const el = pyTextareaRef.current;
    if (!el) {
      setPyCode((prev) => prev + val);
      return;
    }
    const start = el.selectionStart ?? pyCode.length;
    const end = el.selectionEnd ?? pyCode.length;
    setPyCode(pyCode.slice(0, start) + val + pyCode.slice(end));
    window.requestAnimationFrame(() => {
      el.focus();
      const nextPos = start + val.length;
      el.setSelectionRange(nextPos, nextPos);
    });
  };

  useEffect(() => {
    if (!assignment) return;
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [assignment]);

  if (!assignment) return null;

  const attemptsUsed = existingSubmission?.attemptsUsed || 0;
  const attemptsLeft = Math.max(0, assignment.allowedAttempts - attemptsUsed);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const handleTestPythonInWorker = async () => {
    if (!assignment.pythonConfig) return;
    triggerHaptic('tap');
    setPyRunning(true);
    setPyStdout('جارٍ تشغيل الكود داخل بيئة Pyodide المعزولة (Web Worker)...');
    const res = await runPythonInWorkerWithTimeout(
      pyCode,
      assignment.pythonConfig
    );
    setPyRunning(false);
    const passedCount = res.results.filter((r) => r.passed).length;
    setPyStdout(
      `${res.stdout}\nنتيجة الفحص الأولي: اجتاز ${passedCount} من ${res.results.length} اختبارات.`
    );
    triggerHaptic(passedCount === res.results.length ? 'success' : 'tap');
    toast.info(
      `فحص الكود: اجتاز ${passedCount} من ${res.results.length} حالات اختبار`
    );
  };

  const handleSubmitAssignment = async () => {
    if (attemptsLeft <= 0) {
      triggerHaptic('error');
      toast.error('لقد استنفدت جميع المحاولات المسموحة لهذا الواجب.');
      return;
    }

    const spentMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));
    const activeAccountingEntries = isUnit1SpreadsheetProject
      ? spreadsheetState.stage2Journal
      : accEntries;
    const sheetEval = isUnit1SpreadsheetProject
      ? evaluateUnit1SpreadsheetState(spreadsheetState, activeAccountingEntries)
      : undefined;

    const result = submitStudentAssignment({
      assignmentId: assignment.id,
      studentUsername: currentStudent.username,
      studentName: currentStudent.fullName,
      university: currentStudent.university,
      timeSpentMinutes: spentMinutes,
      payload: {
        accountingEntries:
          assignment.labId === 'accounting' && assignment.accountingConfig
            ? activeAccountingEntries
            : undefined,
        unit1SpreadsheetReport: sheetEval
          ? {
              stage1Score: sheetEval.stage1.points,
              stage2Score: sheetEval.stage2.points,
              stage3Score: sheetEval.stage3.points,
            }
          : undefined,
        legoSolution:
          assignment.labId === 'accounting' && assignment.legoConfig && legoTask
            ? {
                taskId: legoTask.id,
                placements: legoPlacements,
              }
            : undefined,
        marketingSolution:
          assignment.labId === 'marketing'
            ? {
                channelId: mktChannel,
                productPrice: mktPrice,
                adBudget: mktBudget,
              }
            : undefined,
        managementSolution:
          assignment.labId === 'management'
            ? {
                studentBreakEvenUnits: Number(mgmtUnitsInput) || 0,
                studentContributionMargin: Number(mgmtMarginInput) || 0,
                assignedFixedCosts: studentMgmtVars.fixedCosts,
                assignedVariableCost: studentMgmtVars.variableCostPerUnit,
                assignedPrice: studentMgmtVars.sellingPricePerUnit,
              }
            : undefined,
        pythonSolution:
          assignment.labId === 'python'
            ? {
                code: pyCode,
                stdout: pyStdout,
              }
            : undefined,
      },
    });

    if (!result.ok || !result.submission) {
      triggerHaptic('error');
      toast.error(result.error || 'تعذر تسليم الواجب.');
      return;
    }

    if (
      assignment.legoConfig &&
      legoTask &&
      result.submission.autoGrade &&
      result.submission.autoGrade.autoScore >= assignment.maxScore * 0.7
    ) {
      completeUnit1LegoTask(legoTask.id);
    }

    awardLabXp(
      assignment.labId,
      result.xpEarned,
      `إتمام واجب عملي: ${assignment.title} (${result.submission.autoGrade?.autoScore}/${assignment.maxScore})`
    );

    triggerHaptic('success');
    toast.success(
      `تم تسليم الواجب وتصحيحه آلياً: ${result.submission.autoGrade?.autoScore}/${assignment.maxScore} (+${result.xpEarned} XP)`
    );
  };

  const totalAccDebit = accEntries.reduce(
    (s, r) => s + (Number(r.debitAmount) || 0),
    0
  );
  const totalAccCredit = accEntries.reduce(
    (s, r) => s + (Number(r.creditAmount) || 0),
    0
  );

  const liveMktSim = simulateMarketingCampaign({
    channelId: mktChannel,
    productPrice: mktPrice,
    adBudget: mktBudget,
  });

  return (
    <div className="mb-6 overflow-hidden rounded-[20px] border-2 border-[#2F6BFF] bg-white shadow-md dark:bg-[#0F1E3E]">
      {/* Top Assignment Mode Header */}
      <div className="flex flex-col justify-between gap-3 bg-[#0A1630] px-4 py-4 text-white sm:flex-row sm:flex-wrap sm:items-center sm:px-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-[6px] bg-[#2F6BFF] px-2.5 py-1 text-[11px] font-semibold">
            وضع الواجب العملي
          </span>
          <h2 className="text-sm font-semibold">{assignment.title}</h2>
          <span className="font-tabular text-xs text-[#94A3B8]">
            العلامة: {assignment.maxScore}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex min-h-[36px] items-center gap-1.5 rounded-[8px] border border-[#1E325C] bg-[#132347] px-3 py-1.5 font-tabular text-xs">
            <Clock className="h-3.5 w-3.5 stroke-[1.5] text-[#2F6BFF]" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="flex min-h-[36px] items-center rounded-[8px] border border-[#1E325C] bg-[#132347] px-3 py-1.5 font-tabular text-xs">
            المحاولات: {attemptsLeft}/{assignment.allowedAttempts}
          </div>

          <Button
            type="button"
            size="sm"
            disabled={attemptsLeft <= 0}
            onClick={handleSubmitAssignment}
            className="w-full gap-1.5 text-xs sm:w-auto"
          >
            <Send className="h-3.5 w-3.5 stroke-[1.5]" />
            <span>تسليم الواجب والتصحيح الفوري</span>
          </Button>

          <Link
            href="/student/assignments"
            className="inline-flex min-h-[36px] items-center gap-1 text-xs text-[#94A3B8] hover:text-white"
          >
            <span>العودة للواجبات</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[1.5]" />
          </Link>
        </div>
      </div>

      {/* Assignment Instructions & Interactive Task Area */}
      <div className="p-4 sm:p-6">
        <div className="mb-5 rounded-[12px] border border-[#E3E8F0] bg-[#F5F6F8] p-4 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <p className="text-xs font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
            تعليمات المعلم ({assignment.createdByTeacherName}) · موعد التسليم:{' '}
            <span className="font-tabular text-[#2F6BFF]">
              {assignment.dueDate}
            </span>
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[#526077] dark:text-[#94A3B8]">
            {assignment.instructions}
          </p>
        </div>

        {/* 1. Accounting Assignment Workspace */}
        {assignment.labId === 'accounting' &&
          assignment.accountingConfig &&
          isUnit1SpreadsheetProject && (
            <Unit1SpreadsheetProject
              key={`${assignment.id}-${initialStage}`}
              initialStage={initialStage as 1 | 2 | 3}
              onStateChange={setSpreadsheetState}
              onJournalChange={setAccEntries}
            />
          )}

        {assignment.labId === 'accounting' &&
          assignment.accountingConfig &&
          isUnit2SpreadsheetProject && (
            <Unit2SpreadsheetProject
              key={`${assignment.id}-${initialStage}`}
              initialStage={initialStage as 1 | 2 | 3 | 4}
              onStateChange={setUnit2SpreadsheetState}
            />
          )}

        {assignment.labId === 'accounting' &&
          assignment.accountingConfig &&
          !isUnit1SpreadsheetProject &&
          !isUnit2SpreadsheetProject && (
          <div className="space-y-4">
            {/* بطاقات العمليات المالية الذكية مع التطبيق الإرشادي السهل */}
            <div className="rounded-[18px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#2F6BFF]/12 text-[#2F6BFF]">
                    <Sparkles className="h-4 w-4 stroke-[1.75]" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                      العمليات المالية المطلوب قيدها في دفتر اليومية
                    </h3>
                    <p className="text-[11px] text-[#526077] dark:text-[#94A3B8]">
                      قاعدة التوازن المبسطة: المدين = الآخذ (الحساب الذي زاد) · الدائن = العاطي (المصدر)
                    </p>
                  </div>
                </div>

                {assignment.accountingConfig.modelEntries &&
                  assignment.accountingConfig.modelEntries.length > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        triggerHaptic('success');
                        const guidedRows =
                          assignment.accountingConfig!.modelEntries!.map(
                            (m, idx) => ({
                              id: accEntries[idx]?.id || `guided-${idx + 1}`,
                              description: m.description,
                              debitAccount: m.debitAccount,
                              creditAccount: m.creditAccount,
                              debitAmount: m.debitAmount,
                              creditAmount: m.creditAmount,
                            })
                          );
                        setAccEntries(guidedRows);
                        toast.success(
                          'تمت التعبئة الإرشادية لجميع القيود — راجع القيم في مقياس التوازن ثم اضغط تسليم الواجب'
                        );
                      }}
                      className="min-h-[38px] gap-1.5 border-[#059669]/40 text-xs font-bold text-[#047857] hover:bg-[#059669]/10 dark:text-[#34D399]"
                    >
                      <Wand2 className="h-3.5 w-3.5 stroke-[1.75]" />
                      <span>تعبئة إرشادية لجميع القيود للتعلم</span>
                    </Button>
                  )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {assignment.accountingConfig.operationsPrompt.map((op, i) => {
                  const modelRow = assignment.accountingConfig!.modelEntries?.[i];
                  const cardThemes = [
                    {
                      border: 'border-[#2F6BFF]/35',
                      badge: 'bg-[#2F6BFF]/12 text-[#2F6BFF]',
                      btn: 'text-[#2F6BFF] border-[#2F6BFF]/35 hover:bg-[#2F6BFF]/10',
                    },
                    {
                      border: 'border-[#7C3AED]/35',
                      badge:
                        'bg-[#7C3AED]/12 text-[#6D28D9] dark:text-[#C4B5FD]',
                      btn: 'text-[#6D28D9] border-[#7C3AED]/35 hover:bg-[#7C3AED]/10 dark:text-[#C4B5FD]',
                    },
                    {
                      border: 'border-[#059669]/35',
                      badge:
                        'bg-[#059669]/12 text-[#047857] dark:text-[#34D399]',
                      btn: 'text-[#047857] border-[#059669]/35 hover:bg-[#059669]/10 dark:text-[#34D399]',
                    },
                  ];
                  const theme = cardThemes[i % cardThemes.length];

                  return (
                    <div
                      key={i}
                      className={`flex flex-col justify-between gap-3 rounded-[14px] border bg-white p-3.5 shadow-xs dark:bg-[#0F1E3E] ${theme.border}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-tabular rounded-full px-2.5 py-0.5 text-[11px] font-bold ${theme.badge}`}
                          >
                            العملية #{i + 1}
                          </span>
                          {modelRow && (
                            <span className="font-tabular text-[11px] font-bold text-[#0A1630] dark:text-white">
                              {modelRow.debitAmount.toLocaleString('en-US')} د.أ
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed font-medium text-[#334155] dark:text-[#CBD5E1]">
                          {op}
                        </p>
                      </div>

                      {modelRow && (
                        <div className="space-y-2 border-t border-[#E3E8F0] pt-2.5 dark:border-[#1E325C]">
                          <p className="text-[11px] text-[#526077] dark:text-[#94A3B8]">
                            من حـ/ <strong className="text-[#0A1630] dark:text-white">{modelRow.debitAccount}</strong> إلى حـ/{' '}
                            <strong className="text-[#0A1630] dark:text-white">{modelRow.creditAccount}</strong>
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('tap');
                              setAccEntries((prev) => {
                                const next = [...prev];
                                while (next.length <= i) {
                                  next.push({
                                    id: `row-${next.length + 1}`,
                                    description: `القيد #${next.length + 1}`,
                                    debitAccount: modelRow.debitAccount,
                                    creditAccount: modelRow.creditAccount,
                                    debitAmount: 0,
                                    creditAmount: 0,
                                  });
                                }
                                next[i] = {
                                  ...next[i],
                                  description: modelRow.description,
                                  debitAccount: modelRow.debitAccount,
                                  creditAccount: modelRow.creditAccount,
                                  debitAmount: modelRow.debitAmount,
                                  creditAmount: modelRow.creditAmount,
                                };
                                return next;
                              });
                              toast.info(`تم تطبيق القيد الإرشادي للعملية #${i + 1}`);
                            }}
                            className={`inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-[11px] font-bold transition-colors ${theme.btn}`}
                          >
                            <Wand2 className="h-3 w-3 stroke-[1.75]" />
                            <span>تطبيق القيد الإرشادي</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Stacked Journal Cards (< md) */}
            <div className="space-y-3 md:hidden">
              {accEntries.map((row, idx) => (
                <div
                  key={row.id}
                  className="space-y-3 rounded-[14px] border border-[#E3E8F0] bg-[#FAFBFC] p-3.5 dark:border-[#1E325C] dark:bg-[#0A1630]"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#E3E8F0] pb-2 dark:border-[#1E325C]">
                    <span className="font-tabular text-xs font-semibold text-[#2F6BFF]">
                      قيد #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAccEntries((prev) => prev.filter((_, i) => i !== idx))
                      }
                      aria-label="حذف القيد"
                      className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E3E8F0] bg-white text-[#526077] hover:text-red-600 dark:border-[#1E325C] dark:bg-[#0F1E3E]"
                    >
                      <Trash2 className="h-4 w-4 stroke-[1.5]" />
                    </button>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#526077] dark:text-[#94A3B8]">
                      البيان
                    </label>
                    <Input
                      value={row.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAccEntries((prev) =>
                          prev.map((r, i) =>
                            i === idx ? { ...r, description: val } : r
                          )
                        );
                      }}
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#526077] dark:text-[#94A3B8]">
                        الحساب المدين (من حـ/)
                      </label>
                      <select
                        value={row.debitAccount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAccEntries((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, debitAccount: val } : r
                            )
                          );
                        }}
                        className="h-10 w-full rounded-[10px] border border-[#E3E8F0] bg-white px-2.5 text-xs dark:border-[#1E325C] dark:bg-[#0F1E3E]"
                      >
                        {assignment.accountingConfig!.availableAccounts.map(
                          (acc) => (
                            <option key={acc} value={acc}>
                              {acc}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#526077] dark:text-[#94A3B8]">
                        الحساب الدائن (إلى حـ/)
                      </label>
                      <select
                        value={row.creditAccount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAccEntries((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, creditAccount: val } : r
                            )
                          );
                        }}
                        className="h-10 w-full rounded-[10px] border border-[#E3E8F0] bg-white px-2.5 text-xs dark:border-[#1E325C] dark:bg-[#0F1E3E]"
                      >
                        {assignment.accountingConfig!.availableAccounts.map(
                          (acc) => (
                            <option key={acc} value={acc}>
                              {acc}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#526077] dark:text-[#94A3B8]">
                        مبلغ المدين (JOD)
                      </label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={row.debitAmount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAccEntries((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, debitAmount: val } : r
                            )
                          );
                        }}
                        className="h-10 font-tabular text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#526077] dark:text-[#94A3B8]">
                        مبلغ الدائن (JOD)
                      </label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={row.creditAmount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAccEntries((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, creditAmount: val } : r
                            )
                          );
                        }}
                        className="h-10 font-tabular text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop & Tablet Accounting Journal Table (>= md) */}
            <div className="hidden overflow-x-auto rounded-[12px] border border-[#E3E8F0] md:block dark:border-[#1E325C]">
              <table className="w-full border-collapse text-right text-xs">
                <thead>
                  <tr className="border-b border-[#E3E8F0] bg-[#F5F6F8] dark:border-[#1E325C] dark:bg-[#0A1630]">
                    <th className="px-3 py-2.5">البيان</th>
                    <th className="px-3 py-2.5">الحساب المدين (من حـ/)</th>
                    <th className="px-3 py-2.5">الحساب الدائن (إلى حـ/)</th>
                    <th className="px-3 py-2.5">مبلغ المدين (JOD)</th>
                    <th className="px-3 py-2.5">مبلغ الدائن (JOD)</th>
                    <th className="px-3 py-2.5">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8F0] dark:divide-[#1E325C]">
                  {accEntries.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="p-2.5">
                        <Input
                          value={row.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAccEntries((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, description: val } : r
                              )
                            );
                          }}
                          className="h-9 text-xs"
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={row.debitAccount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAccEntries((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, debitAccount: val } : r
                              )
                            );
                          }}
                          className="h-9 w-full rounded-[8px] border border-[#E3E8F0] bg-white px-2 text-xs dark:border-[#1E325C] dark:bg-[#0A1630]"
                        >
                          {assignment.accountingConfig!.availableAccounts.map(
                            (acc) => (
                              <option key={acc} value={acc}>
                                {acc}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                      <td className="p-2.5">
                        <select
                          value={row.creditAccount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAccEntries((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, creditAccount: val } : r
                              )
                            );
                          }}
                          className="h-9 w-full rounded-[8px] border border-[#E3E8F0] bg-white px-2 text-xs dark:border-[#1E325C] dark:bg-[#0A1630]"
                        >
                          {assignment.accountingConfig!.availableAccounts.map(
                            (acc) => (
                              <option key={acc} value={acc}>
                                {acc}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                      <td className="p-2.5">
                        <Input
                          type="number"
                          value={row.debitAmount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAccEntries((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, debitAmount: val } : r
                              )
                            );
                          }}
                          className="h-9 font-tabular text-xs"
                        />
                      </td>
                      <td className="p-2.5">
                        <Input
                          type="number"
                          value={row.creditAmount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAccEntries((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, creditAmount: val } : r
                              )
                            );
                          }}
                          className="h-9 font-tabular text-xs"
                        />
                      </td>
                      <td className="p-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            setAccEntries((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          aria-label="حذف القيد"
                          className="flex h-9 w-9 items-center justify-center rounded p-1 text-[#526077] hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 stroke-[1.5]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setAccEntries((prev) => [
                    ...prev,
                    {
                      id: `row-${Date.now()}`,
                      description: `قيد إضافي #${prev.length + 1}`,
                      debitAccount:
                        assignment.accountingConfig!.availableAccounts[0],
                      creditAccount:
                        assignment.accountingConfig!.availableAccounts[1],
                      debitAmount: 1000,
                      creditAmount: 1000,
                    },
                  ])
                }
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5 stroke-[1.5]" />
                <span>إضافة سطر قيد جديد</span>
              </Button>

              {/* مؤشر توازن القيد */}
              {(() => {
                const diffAmount = Math.abs(totalAccDebit - totalAccCredit);
                const hasValues = totalAccDebit > 0 || totalAccCredit > 0;
                const isBalanced = hasValues && diffAmount === 0;

                return (
                  <div
                    className={`flex flex-1 flex-col gap-2 rounded-[14px] border p-3 sm:min-w-[320px] ${
                      isBalanced
                        ? 'border-[#10B981]/45 bg-[#10B981]/10'
                        : hasValues
                        ? 'border-[#F59E0B]/50 bg-[#F59E0B]/10'
                        : 'border-[#E3E8F0] bg-[#F8FAFC] dark:border-[#1E325C] dark:bg-[#070D1F]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-bold text-[#0A1630] dark:text-white">
                        <Scale className="h-4 w-4 text-[#2F6BFF]" />
                        <span>هل القيد متوازن؟</span>
                      </span>
                      <span
                        className={`font-tabular rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isBalanced
                            ? 'bg-[#10B981] text-white'
                            : hasValues
                            ? 'bg-[#D97706] text-white'
                            : 'bg-[#E2E8F0] text-[#475569] dark:bg-[#1E325C] dark:text-[#94A3B8]'
                        }`}
                      >
                        {isBalanced
                          ? 'متوازن، جاهز للتسليم'
                          : hasValues
                          ? `الفرق: ${diffAmount.toLocaleString('en-US')} د.أ`
                          : 'بانتظار إدخال القيم'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 font-tabular text-xs">
                      <span className="text-[#475569] dark:text-[#CBD5E1]">
                        المدين:{' '}
                        <strong className="text-[#2F6BFF]">
                          {totalAccDebit.toLocaleString('en-US')} د.أ
                        </strong>
                      </span>
                      <span className="text-[#475569] dark:text-[#CBD5E1]">
                        الدائن:{' '}
                        <strong className="text-[#7C3AED] dark:text-[#C4B5FD]">
                          {totalAccCredit.toLocaleString('en-US')} د.أ
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 1B. Accounting practical assignment */}
        {assignment.labId === 'accounting' &&
          assignment.legoConfig &&
          legoTask && (
            <div className="mb-2">
              <Unit1LegoBuilder
                key={`${assignment.id}-${legoTask.id}`}
                task={legoTask}
                value={legoPlacements}
                onChange={setLegoPlacements}
                assignmentMode={true}
              />
            </div>
          )}

        {/* 2. Marketing Assignment Workspace */}
        {assignment.labId === 'marketing' && assignment.marketingConfig && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium">
                قناة التسويق المعتمدة للواجب
              </label>
              <select
                value={mktChannel}
                onChange={(e) =>
                  setMktChannel(e.target.value as MarketingChannelId)
                }
                className="h-10 w-full rounded-[10px] border border-[#E3E8F0] bg-white px-3 text-xs dark:border-[#1E325C] dark:bg-[#0A1630]"
              >
                {MARKETING_CHANNELS.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium">
                سعر الاشتراك/المنتج (JOD)
              </label>
              <Input
                type="number"
                value={mktPrice}
                onChange={(e) => setMktPrice(Number(e.target.value))}
                className="font-tabular text-xs"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium">
                الميزانية الإعلانية المخصصة (سقف المعلم:{' '}
                {assignment.marketingConfig.maxBudgetJod} JOD)
              </label>
              <Input
                type="number"
                value={mktBudget}
                onChange={(e) => setMktBudget(Number(e.target.value))}
                className="font-tabular text-xs"
              />
            </div>

            <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-[#E3E8F0] bg-[#F5F6F8] p-4 text-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
              <span>
                العائد المتوقع ROI:{' '}
                <strong className="font-tabular text-[#2F6BFF]">
                  {liveMktSim.roiPercentage}%
                </strong>{' '}
                (الهدف &gt;= {assignment.marketingConfig.minRoiPercent}%)
              </span>
              <span>
                تكلفة الاستحواذ CAC:{' '}
                <strong className="font-tabular text-[#2F6BFF]">
                  {liveMktSim.cac} JOD
                </strong>{' '}
                (السقف &lt;= {assignment.marketingConfig.maxCacJod} JOD)
              </span>
              <span>
                العملاء المتوقعون:{' '}
                <strong className="font-tabular text-[#2F6BFF]">
                  {liveMktSim.expectedCustomers} عميل
                </strong>{' '}
                (الهدف &gt;= {assignment.marketingConfig.minCustomers})
              </span>
            </div>
          </div>
        )}

        {/* 3. Management Assignment Workspace (Randomized Variables per Student) */}
        {assignment.labId === 'management' && assignment.managementConfig && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 rounded-[12px] border border-[#E3E8F0] bg-[#F5F6F8] p-4 sm:grid-cols-3 dark:border-[#1E325C] dark:bg-[#0A1630]">
              <div>
                <span className="text-[11px] text-[#526077]">
                  التكاليف الثابتة المخصصة لك:
                </span>
                <p className="font-tabular text-base font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  {studentMgmtVars.fixedCosts.toLocaleString('en-US')} JOD
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#526077]">
                  التكلفة المتغيرة للوحدة المخصصة لك:
                </span>
                <p className="font-tabular text-base font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  {studentMgmtVars.variableCostPerUnit} JOD
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#526077]">
                  سعر بيع الوحدة المخصص لك:
                </span>
                <p className="font-tabular text-base font-semibold text-[#2F6BFF]">
                  {studentMgmtVars.sellingPricePerUnit} JOD
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  1. احسب هامش المساهمة للوحدة (JOD)
                </label>
                <Input
                  type="number"
                  value={mgmtMarginInput}
                  onChange={(e) => setMgmtMarginInput(e.target.value)}
                  className="font-tabular text-xs"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  2. احسب نقطة التعادل بالوحدات (هامش خطأ مسموح ±
                  {assignment.managementConfig.tolerancePercent}%)
                </label>
                <Input
                  type="number"
                  value={mgmtUnitsInput}
                  onChange={(e) => setMgmtUnitsInput(e.target.value)}
                  className="font-tabular text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. Python Assignment Workspace (Pyodide Web Worker + Visible/Hidden Test Cases) */}
        {assignment.labId === 'python' && assignment.pythonConfig && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-tabular text-xs font-semibold">
                  الدالة المطلوبة: {assignment.pythonConfig.functionName}()
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={pyRunning}
                  onClick={handleTestPythonInWorker}
                  className="gap-1.5 text-xs"
                >
                  <Play className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>
                    {pyRunning
                      ? 'جارٍ الفحص في Web Worker...'
                      : 'فحص الكود على حالات الاختبار'}
                  </span>
                </Button>
              </div>
              <div className="overflow-hidden rounded-[12px] border border-[#1E325C] bg-[#0A1630]">
                <div
                  dir="ltr"
                  className="flex items-center gap-1.5 overflow-x-auto border-b border-[#1E325C] bg-[#070D1F] px-3 py-2 no-scrollbar"
                >
                  {PY_SYMBOLS.map((sym) => (
                    <button
                      key={sym.label}
                      type="button"
                      onClick={() => insertPySymbol(sym.value)}
                      className="flex min-h-[34px] min-w-[36px] shrink-0 items-center justify-center rounded-[8px] border border-[#1E325C] bg-[#0A1630] px-2 font-mono text-xs font-semibold text-[#FAFBFC] active:border-[#2F6BFF] cursor-pointer"
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={pyTextareaRef}
                  value={pyCode}
                  onChange={(e) => setPyCode(e.target.value)}
                  dir="ltr"
                  rows={7}
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="mobile-code-editor w-full bg-transparent p-4 font-mono text-xs text-[#FAFBFC] outline-none"
                />
              </div>
              {pyStdout && (
                <pre
                  dir="ltr"
                  className="mt-2 overflow-x-auto rounded-[10px] border border-[#E3E8F0] bg-[#F5F6F8] p-3 font-mono text-[11px] text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]"
                >
                  {pyStdout}
                </pre>
              )}
            </div>

            <div className="space-y-2.5 lg:col-span-5">
              <p className="text-xs font-semibold">
                حالات الاختبار المبرمجة من المعلم (مهلة التنفيذ:{' '}
                {assignment.pythonConfig.timeoutMs}ms):
              </p>
              {assignment.pythonConfig.testCases.map((tc) => (
                <div
                  key={tc.id}
                  className="rounded-[10px] border border-[#E3E8F0] bg-[#F5F6F8] p-3 text-xs dark:border-[#1E325C] dark:bg-[#0A1630]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{tc.label}</span>
                    <span className="font-tabular text-[11px] text-[#2F6BFF]">
                      {tc.weight} نقطة
                    </span>
                  </div>
                  {tc.isHidden ? (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-[#526077]">
                      <Lock className="h-3 w-3 stroke-[1.5]" />
                      <span>مدخلات ومخرجات مخفية للتحقق من الحالات الحدية</span>
                    </p>
                  ) : (
                    <p
                      dir="ltr"
                      className="mt-1 font-mono text-[11px] text-[#526077]"
                    >
                      {tc.inputExpr} ==&gt; {tc.expectedOutput}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto-Grader Educational Info Card (Shown ONLY after submission) */}
        {existingSubmission?.autoGrade && (
          <div className="mt-6 rounded-[16px] border border-[#2F6BFF]/40 bg-[#EBF1FF]/40 p-5 dark:bg-[#2F6BFF]/10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3E8F0] pb-3 dark:border-[#1E325C]">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 stroke-[1.5] text-[#2F6BFF]" />
                <h3 className="text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  تقرير المصحح الآلي الفوري وتفسير العلامة
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-tabular text-base font-bold text-[#2F6BFF]">
                  العلامة الآلية: {existingSubmission.autoGrade.autoScore} /{' '}
                  {assignment.maxScore}
                </span>
                {typeof existingSubmission.manualScoreOverride === 'number' && (
                  <span className="font-tabular rounded-[8px] bg-[#0A1630] px-2.5 py-1 text-xs font-semibold text-white">
                    العلامة المعتمدة من المعلم:{' '}
                    {existingSubmission.manualScoreOverride} /{' '}
                    {assignment.maxScore}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-[#0A1630] dark:text-[#FAFBFC]">
              {existingSubmission.autoGrade.summaryFeedback}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {existingSubmission.autoGrade.criteriaBreakdown.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 rounded-[10px] border border-[#E3E8F0] bg-white p-3 text-xs dark:border-[#1E325C] dark:bg-[#0A1630]"
                >
                  <div className="flex items-start gap-2">
                    {c.passed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-red-600" />
                    )}
                    <div>
                      <p className="font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                        {c.criterion}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#526077] dark:text-[#94A3B8]">
                        {c.explanation}
                      </p>
                    </div>
                  </div>
                  <span className="font-tabular shrink-0 font-semibold text-[#2F6BFF]">
                    {c.earnedPoints}/{c.maxPoints}
                  </span>
                </div>
              ))}
            </div>

            {existingSubmission.teacherFeedback && (
              <div className="mt-4 rounded-[10px] border border-[#E3E8F0] bg-white p-3.5 text-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
                <span className="font-semibold text-[#2F6BFF]">
                  ملاحظات المعلم الأكاديمية:
                </span>{' '}
                <span>{existingSubmission.teacherFeedback}</span>
              </div>
            )}

            {assignment.showModelAnswerAfterSubmit &&
              assignment.pythonConfig?.referenceSolution && (
                <div className="mt-4">
                  <p className="mb-1 text-xs font-semibold">
                    الإجابة النموذجية المعتمدة (تظهر بعد التسليم بأمر المعلم):
                  </p>
                  <pre
                    dir="ltr"
                    className="rounded-[10px] bg-[#0A1630] p-3 font-mono text-xs text-white"
                  >
                    {assignment.pythonConfig.referenceSolution}
                  </pre>
                </div>
              )}

            {assignment.showModelAnswerAfterSubmit &&
              assignment.legoConfig &&
              legoTask && (
                <div className="mt-4 rounded-[12px] border border-[#10B981]/30 bg-white p-4 dark:border-[#10B981]/30 dark:bg-[#0A1630]">
                  <p className="mb-2.5 text-xs font-semibold text-[#047857] dark:text-[#34D399]">
                    الإجابة النموذجية لتركيب القطع (تظهر بعد التسليم بأمر المعلم):
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {legoTask.slots.map((slot) => {
                      const correctBrick = legoTask.bricks.find(
                        (b) => b.id === slot.correctBrickId
                      );
                      return (
                        <div
                          key={slot.id}
                          className="rounded-[10px] border border-[#E3E8F0] bg-[#F8FAFC] p-2.5 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]"
                        >
                          <p className="font-semibold text-[#0A1630] dark:text-white">
                            {slot.title}
                          </p>
                          <p className="mt-0.5 text-[11px] font-bold text-[#2F6BFF]">
                            {correctBrick?.label || slot.correctBrickId}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#526077] dark:text-[#94A3B8]">
                            {slot.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
