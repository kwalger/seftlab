'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  GitBranch,
  Globe,
  HelpCircle,
  Layers,
  XCircle,
} from 'lucide-react';
import {
  ACCOUNTING_DIMENSIONS,
  ACCOUNTING_USERS_NODES,
  FINANCIAL_OUTPUT_NODES,
  OUTPUT_GOAL_QUESTIONS,
  SYSTEM_PROCESS_STEPS,
  USERS_ROUTER_CHALLENGES,
  type FinancialOutputNode,
  type Unit1TopicId,
} from '@/lib/labs/accounting/unit1-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface StationExerciseCompletionPayload {
  exerciseId: string;
  topicId: Unit1TopicId;
  title: string;
  xpReward: number;
  scorePct: number;
  passed: boolean;
  wrongSummary?: string;
  whyExplanation: string;
}

interface Station1FlowchartProps {
  completedExerciseIds: string[];
  onCompleteExercise: (payload: StationExerciseCompletionPayload) => void;
}

export function Station1Flowchart({
  completedExerciseIds,
  onCompleteExercise,
}: Station1FlowchartProps) {
  const [selectedDimensionId, setSelectedDimensionId] = useState<
    'science' | 'art' | 'info-system'
  >('info-system');
  const [selectedOutputId, setSelectedOutputId] =
    useState<FinancialOutputNode['id']>('income_statement');

  // تطبيق u1-ex-1: ربط الأهداف بالمخرجات الأربعة
  const [goalIdx, setGoalIdx] = useState(0);
  const [solvedGoalIds, setSolvedGoalIds] = useState<string[]>([]);
  const [goalFeedback, setGoalFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  // تطبيق u1-ex-2: لعبة توصيل مستخدمي المعلومات
  const [routerIdx, setRouterIdx] = useState(0);
  const [solvedRouterIds, setSolvedRouterIds] = useState<string[]>([]);
  const [routerHighlightedUser, setRouterHighlightedUser] = useState<{
    id: string;
    ok: boolean;
    explanation: string;
  } | null>(null);

  const activeDimension =
    ACCOUNTING_DIMENSIONS.find((d) => d.id === selectedDimensionId) ||
    ACCOUNTING_DIMENSIONS[0];
  const activeOutput =
    FINANCIAL_OUTPUT_NODES.find((o) => o.id === selectedOutputId) ||
    FINANCIAL_OUTPUT_NODES[0];

  const activeGoal = OUTPUT_GOAL_QUESTIONS[goalIdx];
  const activeChallenge = USERS_ROUTER_CHALLENGES[routerIdx];

  const ex1Done = completedExerciseIds.includes('u1-ex-1');
  const ex2Done = completedExerciseIds.includes('u1-ex-2');

  const handlePickOutputNode = (outputId: FinancialOutputNode['id']) => {
    setSelectedOutputId(outputId);

    const isRight = outputId === activeGoal.correctOutputId;
    if (isRight) {
      const nextSolved = solvedGoalIds.includes(activeGoal.id)
        ? solvedGoalIds
        : [...solvedGoalIds, activeGoal.id];
      setSolvedGoalIds(nextSolved);
      setGoalFeedback({ ok: true, text: activeGoal.explanation });

      if (nextSolved.length === OUTPUT_GOAL_QUESTIONS.length) {
        onCompleteExercise({
          exerciseId: 'u1-ex-1',
          topicId: 'u1-users',
          title: 'ربط مخرجات القوائم المالية بأهدافها الأربعة',
          xpReward: 30,
          scorePct: 100,
          passed: true,
          whyExplanation:
            'تنتج المحاسبة أربع قوائم رئيسية تحقق أهدافها: الدخل (الربح/الخسارة)، التغير في حقوق الملكية، المركز المالي (الموجودات والالتزامات)، والتدفقات النقدية (السيولة).',
        });
      }
    } else {
      setGoalFeedback({
        ok: false,
        text: 'هذا المخرج يؤدي دوراً آخر. انظر إلى السؤال وحدد القائمة التي تجيب عن هذا الاحتياج تحديداً.',
      });
    }
  };

  const handlePickUserNode = (userId: string) => {
    const isRight = userId === activeChallenge.correctUserId;
    if (isRight) {
      const nextSolved = solvedRouterIds.includes(activeChallenge.id)
        ? solvedRouterIds
        : [...solvedRouterIds, activeChallenge.id];
      setSolvedRouterIds(nextSolved);
      setRouterHighlightedUser({
        id: userId,
        ok: true,
        explanation: activeChallenge.explanation,
      });

      if (nextSolved.length === USERS_ROUTER_CHALLENGES.length) {
        onCompleteExercise({
          exerciseId: 'u1-ex-2',
          topicId: 'u1-users',
          title: 'موجه المستخدمين الداخليين والخارجيين',
          xpReward: 40,
          scorePct: 100,
          passed: true,
          whyExplanation:
            'ينقسم مستخدمو المعلومات إلى داخليين (الملاك، الإدارة، الموظفون) وخارجيين (المستثمرون، الدائنون، المحللون، الاتحادات العمالية، الجهات الحكومية، العملاء).',
        });
      }
    } else {
      setRouterHighlightedUser({
        id: userId,
        ok: false,
        explanation:
          'المستخدم الذي نقرته له اهتمام مختلف. أعد قراءة القرار المطلوب واضغط على العقدة المطابقة.',
      });
    }
  };

  const internalUsers = ACCOUNTING_USERS_NODES.filter(
    (u) => u.group === 'internal'
  );
  const externalUsers = ACCOUNTING_USERS_NODES.filter(
    (u) => u.group === 'external'
  );

  return (
    <div className="space-y-6">
      {/* الجزء 1: تعريف المحاسبة (علم + فن + نظام معلومات) */}
      <div className="rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <Badge variant="default" className="mb-1">
              مفهوم المحاسبة وأبعادها الثلاثة
            </Badge>
            <h3 className="text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
              اضغط على أي بعد لترى كيف تتكامل النظريات والمهارة مع نظام المعلومات
            </h3>
          </div>
          <Layers className="h-5 w-5 text-[#2563EB]" />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {ACCOUNTING_DIMENSIONS.map((dim) => {
            const active = dim.id === selectedDimensionId;
            return (
              <button
                key={dim.id}
                type="button"
                onClick={() => setSelectedDimensionId(dim.id)}
                className={cn(
                  'rounded-[12px] border p-3 text-right transition-all',
                  active
                    ? 'border-[#2563EB] bg-[#2563EB]/10 shadow-xs'
                    : 'border-[#E3E8F0] bg-[#F8FAFC] hover:border-[#2563EB]/40 dark:border-[#1E325C] dark:bg-[#070D1F]'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#0A1630] sm:text-sm dark:text-[#FAFBFC]">
                    {dim.title}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#2563EB] dark:bg-[#0A1630]">
                    {dim.milestoneTag}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#526077] dark:text-[#94A3B8]">
                  {dim.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-[12px] border border-[#2563EB]/25 bg-[#F8FAFC] p-3 text-xs leading-relaxed text-[#0A1630] dark:bg-[#070D1F] dark:text-[#FAFBFC]">
          <strong className="text-[#2563EB]">{activeDimension.title}: </strong>
          {activeDimension.summary}
        </div>
      </div>

      {/* الجزء 2: خريطة تدفق النظام المحاسبي Input -> Process -> Output */}
      <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
              خريطة تدفق النظام المحاسبي (مدخلات ⬅ عمليات ⬅ مخرجات)
            </h3>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              انقر على أي قائمة من المخرجات الأربع لاستعراض هدفها العملي أو حل تمرين مطابقة الأهداف
            </p>
          </div>
          <Badge
            variant={ex1Done ? 'default' : 'secondary'}
            className={cn('font-tabular', ex1Done && 'bg-[#22C55E] text-white')}
          >
            تمرين 1: {ex1Done ? 'مكتمل (+30 XP)' : `${solvedGoalIds.length} / 4`}
          </Badge>
        </div>

        {/* شريط التمرين التفاعلي لـ u1-ex-1 */}
        <div className="rounded-[14px] border border-[#2563EB]/30 bg-[#2563EB]/[0.04] p-3.5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
              <HelpCircle className="h-4 w-4" />
              <span>تطبيق عملي ({goalIdx + 1} / {OUTPUT_GOAL_QUESTIONS.length}): اضغط على المخرج الصحيح في الخريطة أدناه</span>
            </span>
            <div className="flex items-center gap-1.5">
              {OUTPUT_GOAL_QUESTIONS.map((q, i) => {
                const isSolved = solvedGoalIds.includes(q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setGoalIdx(i);
                      setGoalFeedback(null);
                    }}
                    className={cn(
                      'h-7 w-7 rounded-full border font-tabular text-xs font-bold transition-colors',
                      i === goalIdx
                        ? 'border-[#2563EB] bg-[#2563EB] text-white'
                        : isSolved
                        ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#16A34A]'
                        : 'border-[#E3E8F0] bg-white text-[#526077] dark:border-[#1E325C] dark:bg-[#0A1630]'
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-xs font-semibold text-[#0A1630] sm:text-sm dark:text-[#FAFBFC]">
            {activeGoal.prompt}
          </p>
          {goalFeedback && (
            <div
              className={cn(
                'mt-2.5 flex items-start justify-between gap-2 rounded-[10px] border px-3 py-2 text-xs',
                goalFeedback.ok
                  ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#0A1630] dark:text-[#FAFBFC]'
                  : 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                {goalFeedback.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                )}
                <span>{goalFeedback.text}</span>
              </span>
              {goalFeedback.ok && goalIdx < OUTPUT_GOAL_QUESTIONS.length - 1 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setGoalIdx((i) => Math.min(OUTPUT_GOAL_QUESTIONS.length - 1, i + 1));
                    setGoalFeedback(null);
                  }}
                  className="h-7 shrink-0 px-2.5 text-[11px]"
                >
                  السؤال التالي
                </Button>
              )}
            </div>
          )}
        </div>

        {/* مخطط التدفق Input -> Process -> Output */}
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
          {/* 1. المدخلات */}
          <div className="flex flex-col justify-between rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 lg:col-span-3 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <div>
              <span className="inline-block rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-[#0A1630] dark:bg-[#1E325C] dark:text-[#FAFBFC]">
                1. المدخلات (Inputs)
              </span>
              <h4 className="mt-2 text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                البيانات والأحداث المالية
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-[#526077] dark:text-[#94A3B8]">
                مستندات وفواتير وعقود تعبر عن عمليات الشراء والبيع والقبض والصرف القابلة للقياس النقدي.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-end text-[#2563EB] lg:justify-center">
              <ArrowLeft className="hidden h-5 w-5 lg:block" />
              <span className="text-[11px] font-semibold">تتدفق للتشغيل</span>
            </div>
          </div>

          {/* 2. العمليات التشغيلية */}
          <div className="rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 lg:col-span-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <span className="inline-block rounded-md bg-[#2563EB]/15 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
              2. العمليات (Processing)
            </span>
            <h4 className="mt-2 text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              دورة التشغيل المحاسبي
            </h4>
            <div className="mt-3 space-y-2">
              {SYSTEM_PROCESS_STEPS.map((st) => (
                <div
                  key={st.id}
                  className="flex items-start gap-2.5 rounded-[10px] border border-[#E3E8F0] bg-white p-2.5 dark:border-[#1E325C] dark:bg-[#0A1630]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2563EB] font-tabular text-[11px] font-bold text-white">
                    {st.stepNumber}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                      {st.title}
                    </p>
                    <p className="text-[11px] text-[#526077] dark:text-[#94A3B8]">
                      {st.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. المخرجات والأهداف الأربعة */}
          <div className="rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 lg:col-span-5 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <span className="inline-block rounded-md bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-bold text-[#16A34A] dark:text-[#22C55E]">
              3. المخرجات والأهداف الأربعة (Outputs)
            </span>
            <h4 className="mt-2 text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              القوائم والتقارير المالية
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FINANCIAL_OUTPUT_NODES.map((out) => {
                const isSelected = selectedOutputId === out.id;
                const isQuestionSolvedHere =
                  goalFeedback?.ok && activeGoal.correctOutputId === out.id;
                return (
                  <button
                    key={out.id}
                    type="button"
                    onClick={() => handlePickOutputNode(out.id)}
                    className={cn(
                      'rounded-[10px] border p-2.5 text-right transition-all',
                      isQuestionSolvedHere
                        ? 'border-[#22C55E] bg-[#22C55E]/15'
                        : isSelected
                        ? 'border-[#2563EB] bg-white ring-1 ring-[#2563EB] dark:bg-[#0A1630]'
                        : 'border-[#E3E8F0] bg-white hover:border-[#2563EB]/60 dark:border-[#1E325C] dark:bg-[#0A1630]'
                    )}
                  >
                    <p className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                      {out.title}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-[#2563EB]">
                      {out.objectiveTitle}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* بطاقة تفاصيل المخرج النشط */}
            <div className="mt-3 rounded-[10px] border border-[#2563EB]/20 bg-white p-3 text-xs dark:bg-[#0A1630]">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-[#0A1630] dark:text-[#FAFBFC]">
                  {activeOutput.title}
                </strong>
                <span className="rounded bg-[#F8FAFC] px-2 py-0.5 text-[10px] text-[#526077] dark:bg-[#070D1F] dark:text-[#94A3B8]">
                  {activeOutput.timeScope}
                </span>
              </div>
              <p className="mt-1 leading-relaxed text-[#526077] dark:text-[#94A3B8]">
                {activeOutput.detail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* الجزء 3: لعبة التوصيل التفاعلية لمستخدمي المعلومات (Users Router) */}
      <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
              <GitBranch className="h-4 w-4 text-[#2563EB]" />
              <span>موجه مستخدمي المعلومات المحاسبية (داخليون vs خارجيون)</span>
            </h3>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              اقرأ الاحتياج المالي أدناه ثم انقر على العقدة الصحيحة في مسار الداخل أو مسار الخارج
            </p>
          </div>
          <Badge
            variant={ex2Done ? 'default' : 'secondary'}
            className={cn('font-tabular', ex2Done && 'bg-[#22C55E] text-white')}
          >
            تمرين 2: {ex2Done ? 'مكتمل (+40 XP)' : `${solvedRouterIds.length} / 6`}
          </Badge>
        </div>

        {/* بطاقة السؤال النشط */}
        <div className="rounded-[14px] border border-[#2563EB]/30 bg-[#F8FAFC] p-4 dark:bg-[#070D1F]">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#2563EB]">
              القرار رقم {routerIdx + 1} من {USERS_ROUTER_CHALLENGES.length}:
            </span>
            <div className="flex items-center gap-1.5">
              {USERS_ROUTER_CHALLENGES.map((ch, idx) => {
                const isDone = solvedRouterIds.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setRouterIdx(idx);
                      setRouterHighlightedUser(null);
                    }}
                    className={cn(
                      'h-7 w-7 rounded-full border font-tabular text-xs font-bold transition-colors',
                      idx === routerIdx
                        ? 'border-[#2563EB] bg-[#2563EB] text-white'
                        : isDone
                        ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#16A34A]'
                        : 'border-[#E3E8F0] bg-white text-[#526077] dark:border-[#1E325C] dark:bg-[#0A1630]'
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
            &ldquo;{activeChallenge.questionPrompt}&rdquo;
          </p>

          {routerHighlightedUser && (
            <div
              className={cn(
                'mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border p-3 text-xs',
                routerHighlightedUser.ok
                  ? 'border-[#22C55E]/40 bg-[#22C55E]/12 text-[#0A1630] dark:text-[#FAFBFC]'
                  : 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
              )}
            >
              <span className="inline-flex items-center gap-2">
                {routerHighlightedUser.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                )}
                <span>{routerHighlightedUser.explanation}</span>
              </span>

              {routerHighlightedUser.ok &&
                routerIdx < USERS_ROUTER_CHALLENGES.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setRouterIdx((i) =>
                        Math.min(USERS_ROUTER_CHALLENGES.length - 1, i + 1)
                      );
                      setRouterHighlightedUser(null);
                    }}
                    className="h-7 px-3 text-[11px]"
                  >
                    القرار التالي
                  </Button>
                )}
            </div>
          )}
        </div>

        {/* المساران المتفرعان: داخل المشروع / خارج المشروع */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* مسار داخل المشروع */}
          <div className="space-y-2.5 rounded-[14px] border border-blue-200 bg-blue-50/50 p-4 lg:col-span-5 dark:border-blue-900/60 dark:bg-blue-950/20">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#2563EB]" />
              <h4 className="text-xs font-bold text-[#0A1630] sm:text-sm dark:text-[#FAFBFC]">
                مستخدمون من داخل المشروع (Internal)
              </h4>
            </div>
            <div className="space-y-2">
              {internalUsers.map((usr) => {
                const isFeedbackTarget = routerHighlightedUser?.id === usr.id;
                return (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => handlePickUserNode(usr.id)}
                    className={cn(
                      'w-full rounded-[12px] border p-3 text-right transition-all',
                      isFeedbackTarget && routerHighlightedUser.ok
                        ? 'border-[#22C55E] bg-[#22C55E]/15 ring-2 ring-[#22C55E]/40'
                        : isFeedbackTarget && !routerHighlightedUser.ok
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-[#E3E8F0] bg-white hover:border-[#2563EB] dark:border-[#1E325C] dark:bg-[#0A1630]'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                        {usr.title}
                      </span>
                      <span className="text-[10px] font-medium text-[#526077] dark:text-[#94A3B8]">
                        {usr.subLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#526077] dark:text-[#94A3B8]">
                      {usr.needDescription}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* مسار خارج المشروع */}
          <div className="space-y-2.5 rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 lg:col-span-7 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#2563EB]" />
              <h4 className="text-xs font-bold text-[#0A1630] sm:text-sm dark:text-[#FAFBFC]">
                مستخدمون من خارج المشروع (External)
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {externalUsers.map((usr) => {
                const isFeedbackTarget = routerHighlightedUser?.id === usr.id;
                return (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => handlePickUserNode(usr.id)}
                    className={cn(
                      'rounded-[12px] border p-3 text-right transition-all',
                      isFeedbackTarget && routerHighlightedUser.ok
                        ? 'border-[#22C55E] bg-[#22C55E]/15 ring-2 ring-[#22C55E]/40'
                        : isFeedbackTarget && !routerHighlightedUser.ok
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-[#E3E8F0] bg-white hover:border-[#2563EB] dark:border-[#1E325C] dark:bg-[#0A1630]'
                    )}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                        {usr.title}
                      </span>
                      <span className="text-[10px] font-medium text-[#526077] dark:text-[#94A3B8]">
                        {usr.subLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#526077] dark:text-[#94A3B8]">
                      {usr.needDescription}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
