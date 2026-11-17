'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Compass,
  GitFork,
  History,
  XCircle,
} from 'lucide-react';
import {
  ACCOUNTING_BRANCHES_TREE,
  BRANCH_CHALLENGE_QUESTIONS,
  HISTORY_TIMELINE_MILESTONES,
  RELATED_SCIENCES_RADAR,
  SCIENCE_HISTORY_QUESTIONS,
} from '@/lib/labs/accounting/unit1-data';
import type { StationExerciseCompletionPayload } from './station-1-flowchart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Station2BranchesRadarProps {
  completedExerciseIds: string[];
  onCompleteExercise: (payload: StationExerciseCompletionPayload) => void;
}

export function Station2BranchesRadar({
  completedExerciseIds,
  onCompleteExercise,
}: Station2BranchesRadarProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('financial');
  const [selectedScienceId, setSelectedScienceId] =
    useState<string>('management');
  const [selectedEraId, setSelectedEraId] = useState<string>('h-islamic');

  // تطبيق u1-ex-3: تحدي فروع المحاسبة السبعة
  const [branchQIdx, setBranchQIdx] = useState(0);
  const [solvedBranchQs, setSolvedBranchQs] = useState<string[]>([]);
  const [branchFeedback, setBranchFeedback] = useState<{
    id: string;
    ok: boolean;
    text: string;
  } | null>(null);

  // تطبيق u1-ex-4: تحدي رادار العلوم والتاريخ
  const [scienceQIdx, setScienceQIdx] = useState(0);
  const [solvedScienceQs, setSolvedScienceQs] = useState<string[]>([]);
  const [scienceFeedback, setScienceFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const activeBranch =
    ACCOUNTING_BRANCHES_TREE.find((b) => b.id === selectedBranchId) ||
    ACCOUNTING_BRANCHES_TREE[0];
  const activeScience =
    RELATED_SCIENCES_RADAR.find((s) => s.id === selectedScienceId) ||
    RELATED_SCIENCES_RADAR[0];
  const activeEra =
    HISTORY_TIMELINE_MILESTONES.find((e) => e.id === selectedEraId) ||
    HISTORY_TIMELINE_MILESTONES[1];

  const activeBranchQ = BRANCH_CHALLENGE_QUESTIONS[branchQIdx];
  const activeScienceQ = SCIENCE_HISTORY_QUESTIONS[scienceQIdx];

  const ex3Done = completedExerciseIds.includes('u1-ex-3');
  const ex4Done = completedExerciseIds.includes('u1-ex-4');

  const handleSelectBranchNode = (branchId: string) => {
    setSelectedBranchId(branchId);
    const isRight = branchId === activeBranchQ.correctBranchId;
    if (isRight) {
      const nextSolved = solvedBranchQs.includes(activeBranchQ.id)
        ? solvedBranchQs
        : [...solvedBranchQs, activeBranchQ.id];
      setSolvedBranchQs(nextSolved);
      setBranchFeedback({
        id: branchId,
        ok: true,
        text: activeBranchQ.explanation,
      });

      if (nextSolved.length === BRANCH_CHALLENGE_QUESTIONS.length) {
        onCompleteExercise({
          exerciseId: 'u1-ex-3',
          topicId: 'u1-branches',
          title: 'تحدي تصنيف فروع علم المحاسبة السبعة',
          xpReward: 40,
          scorePct: 100,
          passed: true,
          whyExplanation:
            'شجرة فروع المحاسبة تضم: المحاسبة المالية، التكاليف، الإدارية، المنشآت المتخصصة (المالية والزراعية والخدمية)، الضريبية، الحكومية، والتدقيق.',
        });
      }
    } else {
      setBranchFeedback({
        id: branchId,
        ok: false,
        text: 'هذا الفرع يخدم هدفاً مختلفاً. راجع اختصاصات الفروع السبعة واختر العقدة الدقيقة.',
      });
    }
  };

  const handleAnswerScienceChallenge = (optionId: string) => {
    const isRight = optionId === activeScienceQ.correctTargetId;
    if (optionId === 'h-islamic') {
      setSelectedEraId('h-islamic');
    } else if (
      ['management', 'economics', 'law', 'statistics', 'operations_cs'].includes(
        optionId
      )
    ) {
      setSelectedScienceId(optionId);
    }

    if (isRight) {
      const nextSolved = solvedScienceQs.includes(activeScienceQ.id)
        ? solvedScienceQs
        : [...solvedScienceQs, activeScienceQ.id];
      setSolvedScienceQs(nextSolved);
      setScienceFeedback({ ok: true, text: activeScienceQ.explanation });

      if (nextSolved.length === SCIENCE_HISTORY_QUESTIONS.length) {
        onCompleteExercise({
          exerciseId: 'u1-ex-4',
          topicId: 'u1-branches',
          title: 'رادار العلوم الخمسة ومحطات التطور التاريخي',
          xpReward: 40,
          scorePct: 100,
          passed: true,
          whyExplanation:
            'ترتبط المحاسبة بـ 5 علوم (الإدارة، الاقتصاد، القانون، الإحصاء، وبحوث العمليات والحاسوب)، وطُوّرت تاريخياً من الآشوريين والفراعنة إلى الدولة الإسلامية ثم باسيلو 1494م وعصر ERP.',
        });
      }
    } else {
      setScienceFeedback({
        ok: false,
        text: 'إجابة غير دقيقة؛ استعرض تفاصيل العلم أو الحقبة الزمنية ثم أعد الاختيار.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* الجزء 1: الخريطة الشجرية لفروع المحاسبة السبعة (شكل 1 في الكتاب) */}
      <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
              <GitFork className="h-4 w-4 text-[#2563EB]" />
              <span>الشجرة التفاعلية لفروع علم المحاسبة (مطابقة للشكل 1)</span>
            </h3>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              انقر على أي فرع في الشجرة لاستعراض دوره وتفريعاته أو لحل تحدي الفروع
            </p>
          </div>
          <Badge
            variant={ex3Done ? 'default' : 'secondary'}
            className={cn('font-tabular', ex3Done && 'bg-[#22C55E] text-white')}
          >
            تمرين 3: {ex3Done ? 'مكتمل (+40 XP)' : `${solvedBranchQs.length} / 5`}
          </Badge>
        </div>

        {/* شريط تحدي الفروع */}
        <div className="rounded-[14px] border border-[#2563EB]/30 bg-[#2563EB]/[0.04] p-3.5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#2563EB]">
              حالة عملية ({branchQIdx + 1} / {BRANCH_CHALLENGE_QUESTIONS.length}) — اضغط على الفرع الصحيح في الشجرة:
            </span>
            <div className="flex items-center gap-1.5">
              {BRANCH_CHALLENGE_QUESTIONS.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setBranchQIdx(idx);
                    setBranchFeedback(null);
                  }}
                  className={cn(
                    'h-7 w-7 rounded-full border font-tabular text-xs font-bold',
                    idx === branchQIdx
                      ? 'border-[#2563EB] bg-[#2563EB] text-white'
                      : solvedBranchQs.includes(q.id)
                      ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#16A34A]'
                      : 'border-[#E3E8F0] bg-white text-[#526077] dark:border-[#1E325C] dark:bg-[#0A1630]'
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs font-semibold text-[#0A1630] sm:text-sm dark:text-[#FAFBFC]">
            {activeBranchQ.prompt}
          </p>

          {branchFeedback && (
            <div
              className={cn(
                'mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border px-3 py-2 text-xs',
                branchFeedback.ok
                  ? 'border-[#22C55E]/40 bg-[#22C55E]/12 text-[#0A1630] dark:text-[#FAFBFC]'
                  : 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                {branchFeedback.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                )}
                <span>{branchFeedback.text}</span>
              </span>
              {branchFeedback.ok &&
                branchQIdx < BRANCH_CHALLENGE_QUESTIONS.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setBranchQIdx((i) =>
                        Math.min(BRANCH_CHALLENGE_QUESTIONS.length - 1, i + 1)
                      );
                      setBranchFeedback(null);
                    }}
                    className="h-7 px-2.5 text-[11px]"
                  >
                    الموقف التالي
                  </Button>
                )}
            </div>
          )}
        </div>

        {/* جذر الشجرة -> 7 عقد */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-[12px] border-2 border-[#2563EB] bg-[#2563EB] px-6 py-2.5 text-center text-sm font-bold text-white shadow-xs">
              علم المحاسبة (الجذر الأم)
            </div>
          </div>

          <div className="hidden h-4 border-x-2 border-t-2 border-[#CBD5E1] md:mx-8 md:block dark:border-[#1E325C]" />

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {ACCOUNTING_BRANCHES_TREE.map((branch) => {
              const isSelected = selectedBranchId === branch.id;
              const isRight =
                branchFeedback?.id === branch.id && branchFeedback.ok;
              const isWrong =
                branchFeedback?.id === branch.id && !branchFeedback.ok;

              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => handleSelectBranchNode(branch.id)}
                  className={cn(
                    'flex flex-col justify-between rounded-[12px] border p-3 text-right transition-all',
                    isRight
                      ? 'border-[#22C55E] bg-[#22C55E]/15 ring-2 ring-[#22C55E]/30'
                      : isWrong
                      ? 'border-red-500 bg-red-500/10'
                      : isSelected
                      ? 'border-[#2563EB] bg-[#2563EB]/10'
                      : 'border-[#E3E8F0] bg-[#F8FAFC] hover:border-[#2563EB]/60 dark:border-[#1E325C] dark:bg-[#070D1F]'
                  )}
                >
                  <div>
                    <p className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                      {branch.title}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-[#2563EB]">
                      {branch.subtitle}
                    </p>
                  </div>
                  <span className="mt-2 inline-block text-[10px] text-[#526077] dark:text-[#94A3B8]">
                    {branch.eraOrBasis}
                  </span>
                </button>
              );
            })}
          </div>

          {/* تفاصيل الفرع المحدد والتفريع الثلاثي للمنشآت المتخصصة */}
          <div className="rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                {activeBranch.title} ({activeBranch.subtitle})
              </h4>
              <Badge variant="secondary">{activeBranch.eraOrBasis}</Badge>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#526077] dark:text-[#94A3B8]">
              {activeBranch.description}
            </p>

            {activeBranch.subBranches && (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {activeBranch.subBranches.map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-[12px] border border-[#2563EB]/25 bg-white p-3 dark:bg-[#0A1630]"
                  >
                    <p className="text-xs font-bold text-[#2563EB]">
                      {sub.title}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {sub.items?.map((item) => (
                        <span
                          key={item}
                          className="rounded-[8px] border border-[#E3E8F0] bg-[#F8FAFC] px-2 py-1 text-[11px] font-medium text-[#0A1630] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* الجزء 2: رادار علاقة المحاسبة بالعلوم الخمسة + الخط الزمني للتطور التاريخي */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* رادار العلوم الخمسة */}
        <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-5 lg:col-span-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              رادار علاقة المحاسبة بالعلوم الخمسة
            </h3>
          </div>

          {/* مخطط SVG بصري للعقدة المركزية والعلوم الخمسة */}
          <div className="rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-3 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <svg
              viewBox="0 0 360 210"
              className="mx-auto w-full max-w-[380px]"
              aria-label="رادار علاقة المحاسبة بالعلوم الأخرى"
            >
              {/* خطوط الربط */}
              <line x1="180" y1="105" x2="180" y2="28" stroke="#93C5FD" strokeWidth="2" />
              <line x1="180" y1="105" x2="305" y2="75" stroke="#93C5FD" strokeWidth="2" />
              <line x1="180" y1="105" x2="270" y2="178" stroke="#93C5FD" strokeWidth="2" />
              <line x1="180" y1="105" x2="90" y2="178" stroke="#93C5FD" strokeWidth="2" />
              <line x1="180" y1="105" x2="55" y2="75" stroke="#93C5FD" strokeWidth="2" />

              {/* المركز */}
              <circle cx="180" cy="105" r="34" fill="#2563EB" />
              <text
                x="180"
                y="109"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="700"
              >
                المحاسبة
              </text>
            </svg>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {RELATED_SCIENCES_RADAR.map((sci) => {
                const active = sci.id === selectedScienceId;
                return (
                  <button
                    key={sci.id}
                    type="button"
                    onClick={() => setSelectedScienceId(sci.id)}
                    className={cn(
                      'rounded-[10px] border px-2.5 py-2 text-right text-xs font-semibold transition-colors',
                      active
                        ? 'border-[#2563EB] bg-[#2563EB] text-white'
                        : 'border-[#E3E8F0] bg-white text-[#0A1630] hover:border-[#2563EB]/60 dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]'
                    )}
                  >
                    {sci.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#2563EB]/25 bg-[#F8FAFC] p-3.5 text-xs dark:bg-[#070D1F]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-[#0A1630] dark:text-[#FAFBFC]">
                {activeScience.title}
              </strong>
              <Badge variant="default">{activeScience.embodimentBranch}</Badge>
            </div>
            <p className="mt-1.5 leading-relaxed text-[#526077] dark:text-[#94A3B8]">
              {activeScience.summary}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeScience.keyTools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-md border border-[#E3E8F0] bg-white px-2 py-0.5 text-[11px] font-medium text-[#2563EB] dark:border-[#1E325C] dark:bg-[#0A1630]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* الخط الزمني لتطور المحاسبة + التحدي السريع u1-ex-4 */}
        <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-5 lg:col-span-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              <History className="h-4 w-4 text-[#2563EB]" />
              <span>محطات نشأة المحاسبة وتطورها التاريخي</span>
            </h3>
            <Badge
              variant={ex4Done ? 'default' : 'secondary'}
              className={cn('font-tabular', ex4Done && 'bg-[#22C55E] text-white')}
            >
              تمرين 4: {ex4Done ? 'مكتمل (+40 XP)' : `${solvedScienceQs.length} / 5`}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {HISTORY_TIMELINE_MILESTONES.map((era) => {
              const active = era.id === selectedEraId;
              return (
                <button
                  key={era.id}
                  type="button"
                  onClick={() => setSelectedEraId(era.id)}
                  className={cn(
                    'rounded-[10px] border p-2.5 text-right transition-colors',
                    active
                      ? 'border-[#2563EB] bg-[#2563EB]/10'
                      : 'border-[#E3E8F0] bg-[#F8FAFC] hover:border-[#2563EB]/50 dark:border-[#1E325C] dark:bg-[#070D1F]'
                  )}
                >
                  <span className="block font-tabular text-[10px] font-bold text-[#2563EB]">
                    {era.eraLabel}
                  </span>
                  <span className="mt-0.5 block text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                    {era.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-[12px] border border-[#E3E8F0] bg-[#F8FAFC] p-3 text-xs leading-relaxed text-[#526077] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#94A3B8]">
            <strong className="text-[#0A1630] dark:text-[#FAFBFC]">
              {activeEra.title}:{' '}
            </strong>
            {activeEra.accountingContribution}
          </div>

          {/* التحدي السريع: u1-ex-4 */}
          <div className="space-y-2.5 rounded-[14px] border border-[#2563EB]/30 bg-[#2563EB]/[0.04] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#2563EB]">
                التحدي السريع ({scienceQIdx + 1} / {SCIENCE_HISTORY_QUESTIONS.length})
              </span>
              <div className="flex gap-1">
                {SCIENCE_HISTORY_QUESTIONS.map((q, idx) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setScienceQIdx(idx);
                      setScienceFeedback(null);
                    }}
                    className={cn(
                      'h-6 w-6 rounded-full border font-tabular text-[11px] font-bold',
                      idx === scienceQIdx
                        ? 'border-[#2563EB] bg-[#2563EB] text-white'
                        : solvedScienceQs.includes(q.id)
                        ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#16A34A]'
                        : 'border-[#E3E8F0] bg-white text-[#526077] dark:border-[#1E325C] dark:bg-[#0A1630]'
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
              {activeScienceQ.prompt}
            </p>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {activeScienceQ.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleAnswerScienceChallenge(opt.id)}
                  className={cn(
                    'min-h-[38px] rounded-[10px] border px-3 py-2 text-right text-xs font-medium transition-colors',
                    scienceFeedback?.ok && opt.id === activeScienceQ.correctTargetId
                      ? 'border-[#22C55E] bg-[#22C55E]/15 font-bold text-[#16A34A]'
                      : 'border-[#E3E8F0] bg-white hover:border-[#2563EB] dark:border-[#1E325C] dark:bg-[#0A1630]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {scienceFeedback && (
              <div
                className={cn(
                  'flex flex-wrap items-center justify-between gap-2 rounded-[10px] border p-2.5 text-xs',
                  scienceFeedback.ok
                    ? 'border-[#22C55E]/40 bg-[#22C55E]/10'
                    : 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
                )}
              >
                <span>{scienceFeedback.text}</span>
                {scienceFeedback.ok &&
                  scienceQIdx < SCIENCE_HISTORY_QUESTIONS.length - 1 && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setScienceQIdx((i) =>
                          Math.min(SCIENCE_HISTORY_QUESTIONS.length - 1, i + 1)
                        );
                        setScienceFeedback(null);
                      }}
                      className="h-7 px-2.5 text-[11px]"
                    >
                      السؤال التالي
                    </Button>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
