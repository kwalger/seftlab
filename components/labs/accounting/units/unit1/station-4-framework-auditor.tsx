'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { formatFilsShort } from '@/lib/labs/accounting/accounts';
import {
  CONCEPTUAL_FRAMEWORK_PILLARS,
  VIOLATION_SCENARIO_CASES,
  type ConceptualPillarItem,
} from '@/lib/labs/accounting/unit1-data';
import type { StationExerciseCompletionPayload } from './station-1-flowchart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Station4FrameworkAuditorProps {
  completedExerciseIds: string[];
  onCompleteExercise: (payload: StationExerciseCompletionPayload) => void;
}

const GROUP_META: Record<
  'u1-ex-6' | 'u1-ex-7' | 'u1-ex-8',
  { title: string; xp: number }
> = {
  'u1-ex-6': {
    title: 'المدقق الذكي (1): كشف انتهاك الفروض المحاسبية',
    xp: 45,
  },
  'u1-ex-7': {
    title: 'المدقق الذكي (2): كشف انتهاك التكلفة التاريخية وتحقق الإيراد',
    xp: 50,
  },
  'u1-ex-8': {
    title: 'المدقق الذكي (3): المقابلة والإفصاح والحيطة والثبات',
    xp: 50,
  },
};

export function Station4FrameworkAuditor({
  completedExerciseIds,
  onCompleteExercise,
}: Station4FrameworkAuditorProps) {
  const [selectedPillarId, setSelectedPillarId] = useState<string>('entity');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [detectorOpenMap, setDetectorOpenMap] = useState<Record<string, boolean>>({});
  const [solvedScenarioIds, setSolvedScenarioIds] = useState<string[]>([]);
  const [scenarioFeedback, setScenarioFeedback] = useState<{
    ok: boolean;
    chosenId: string;
    text: string;
  } | null>(null);

  const selectedPillar: ConceptualPillarItem =
    CONCEPTUAL_FRAMEWORK_PILLARS.find((p) => p.id === selectedPillarId) ||
    CONCEPTUAL_FRAMEWORK_PILLARS[0];

  const assumptions = CONCEPTUAL_FRAMEWORK_PILLARS.filter(
    (p) => p.pillarType === 'assumption'
  );
  const principles = CONCEPTUAL_FRAMEWORK_PILLARS.filter(
    (p) => p.pillarType === 'principle'
  );
  const conventions = CONCEPTUAL_FRAMEWORK_PILLARS.filter(
    (p) => p.pillarType === 'convention'
  );

  const activeScenario = VIOLATION_SCENARIO_CASES[scenarioIdx];
  const isDetectorOpen = Boolean(detectorOpenMap[activeScenario.id]);
  const isScenarioSolved = solvedScenarioIds.includes(activeScenario.id);

  const handleChooseRule = (optionId: string) => {
    const isRight = optionId === activeScenario.correctRuleId;
    setSelectedPillarId(optionId);

    if (isRight) {
      const nextSolved = solvedScenarioIds.includes(activeScenario.id)
        ? solvedScenarioIds
        : [...solvedScenarioIds, activeScenario.id];
      setSolvedScenarioIds(nextSolved);
      setScenarioFeedback({
        ok: true,
        chosenId: optionId,
        text: activeScenario.explanation,
      });

      const groupId = activeScenario.exerciseGroupId;
      const groupCases = VIOLATION_SCENARIO_CASES.filter(
        (c) => c.exerciseGroupId === groupId
      );
      const groupAllSolved = groupCases.every((c) => nextSolved.includes(c.id));
      if (groupAllSolved) {
        onCompleteExercise({
          exerciseId: groupId,
          topicId: 'u1-assumptions-principles',
          title: GROUP_META[groupId].title,
          xpReward: GROUP_META[groupId].xp,
          scorePct: 100,
          passed: true,
          whyExplanation: activeScenario.explanation,
        });
      }
    } else {
      setScenarioFeedback({
        ok: false,
        chosenId: optionId,
        text: 'هذا الاختيار لا يفسر الخطأ في هذه الحالة. راجع الأعمدة الثلاثة أعلاه واختر القاعدة المنتهكة بدقة.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* الجزء 1: لوحة الإطار الفكري مقسمة إلى 3 أعمدة مترابطة */}
      <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div>
          <h3 className="text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
            الإطار الفكري للمحاسبة (3 أعمدة مترابطة: الفروض ⬅ المبادئ ⬅ السياسات)
          </h3>
          <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
            اضغط على أي فرض أو مبدأ أو سياسة لعرض شروطه وعناصر تكلفته أو استثناءاته
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* العمود 1: الفروض المحاسبية الأربعة */}
          <div className="space-y-2 rounded-[14px] border border-blue-200 bg-blue-50/50 p-3.5 dark:border-blue-900/60 dark:bg-blue-950/20">
            <h4 className="text-xs font-bold text-[#2563EB]">
              1. الفروض المحاسبية الأربعة (Assumptions)
            </h4>
            {assumptions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPillarId(item.id)}
                className={cn(
                  'w-full rounded-[10px] border p-2.5 text-right transition-colors',
                  selectedPillarId === item.id
                    ? 'border-[#2563EB] bg-white ring-1 ring-[#2563EB] dark:bg-[#0A1630]'
                    : 'border-[#E3E8F0] bg-white/80 hover:border-[#2563EB]/50 dark:border-[#1E325C] dark:bg-[#0A1630]'
                )}
              >
                <p className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] text-[#526077] dark:text-[#94A3B8]">
                  {item.shortRule}
                </p>
              </button>
            ))}
          </div>

          {/* العمود 2: المبادئ المحاسبية الخمسة */}
          <div className="space-y-2 rounded-[14px] border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/15">
            <h4 className="text-xs font-bold text-[#16A34A] dark:text-[#22C55E]">
              2. المبادئ المحاسبية الخمسة (Principles)
            </h4>
            {principles.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPillarId(item.id)}
                className={cn(
                  'w-full rounded-[10px] border p-2.5 text-right transition-colors',
                  selectedPillarId === item.id
                    ? 'border-[#22C55E] bg-white ring-1 ring-[#22C55E] dark:bg-[#0A1630]'
                    : 'border-[#E3E8F0] bg-white/80 hover:border-[#22C55E]/50 dark:border-[#1E325C] dark:bg-[#0A1630]'
                )}
              >
                <p className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] text-[#526077] dark:text-[#94A3B8]">
                  {item.shortRule}
                </p>
              </button>
            ))}
          </div>

          {/* العمود 3: السياسات المحاسبية */}
          <div className="flex flex-col justify-between space-y-3 rounded-[14px] border border-amber-200 bg-amber-50/40 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/15">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">
                3. السياسات المحاسبية (Conventions)
              </h4>
              {conventions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPillarId(item.id)}
                  className={cn(
                    'w-full rounded-[10px] border p-2.5 text-right transition-colors',
                    selectedPillarId === item.id
                      ? 'border-amber-500 bg-white ring-1 ring-amber-500 dark:bg-[#0A1630]'
                      : 'border-[#E3E8F0] bg-white/80 hover:border-amber-500/50 dark:border-[#1E325C] dark:bg-[#0A1630]'
                  )}
                >
                  <p className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#526077] dark:text-[#94A3B8]">
                    {item.shortRule}
                  </p>
                </button>
              ))}
            </div>

            {/* بطاقة التفاصيل الدقيقة للبند المحدد */}
            <div className="rounded-[12px] border border-[#2563EB]/30 bg-white p-3.5 text-xs dark:bg-[#0A1630]">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-[#2563EB]">
                  {selectedPillar.title}
                </strong>
                <span className="text-[10px] text-[#64748B]">
                  {selectedPillar.enTitle}
                </span>
              </div>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-[#0A1630] dark:text-[#FAFBFC]">
                {selectedPillar.keyDetails.map((d, i) => (
                  <li key={i}>• {d}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* الجزء 2: لعبة المدقق الذكي (6 سيناريوهات عملية) */}
      <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
              <ShieldAlert className="h-4 w-4 text-[#2563EB]" />
              <span>مختبر المدقق الذكي (كشف الانتهاك وتصحيح الأرقام لحظياً)</span>
            </h3>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              اختر كل سيناريو (6 حالات مقسمة على 3 تمارين)، ثم اضغط &ldquo;اكشف الانتهاك المحاسبي&rdquo;
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['u1-ex-6', 'u1-ex-7', 'u1-ex-8'] as const).map((exId, idx) => {
              const done = completedExerciseIds.includes(exId);
              return (
                <Badge
                  key={exId}
                  variant={done ? 'default' : 'secondary'}
                  className={cn('font-tabular', done && 'bg-[#22C55E] text-white')}
                >
                  تمرين {6 + idx}: {done ? 'مكتمل' : 'قيد الحل'}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* شريط السيناريوهات الستة */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {VIOLATION_SCENARIO_CASES.map((sc, idx) => {
            const done = solvedScenarioIds.includes(sc.id);
            const active = idx === scenarioIdx;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  setScenarioIdx(idx);
                  setScenarioFeedback(null);
                }}
                className={cn(
                  'rounded-[10px] border p-2.5 text-right text-xs transition-colors',
                  active
                    ? 'border-[#2563EB] bg-[#2563EB] font-bold text-white'
                    : done
                    ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#16A34A]'
                    : 'border-[#E3E8F0] bg-[#F8FAFC] text-[#526077] dark:border-[#1E325C] dark:bg-[#070D1F]'
                )}
              >
                <span className="block font-tabular text-[10px]">
                  سيناريو {idx + 1} / 6
                </span>
                <span className="mt-0.5 line-clamp-1 font-semibold">
                  {sc.title.replace(/^السيناريو \d+:\s*/, '')}
                </span>
              </button>
            );
          })}
        </div>

        {/* تفاصيل السيناريو والمحاكاة الرقمية */}
        <div className="space-y-4 rounded-[14px] border border-[#2563EB]/30 bg-[#F8FAFC] p-4 dark:bg-[#070D1F]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              {activeScenario.title}
            </h4>
            {!isDetectorOpen && (
              <Button
                type="button"
                onClick={() =>
                  setDetectorOpenMap((prev) => ({
                    ...prev,
                    [activeScenario.id]: true,
                  }))
                }
                className="min-h-[40px] gap-1.5 text-xs font-semibold"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>اكشف الانتهاك المحاسبي</span>
              </Button>
            )}
          </div>

          <p className="text-xs leading-relaxed text-[#0A1630] sm:text-sm dark:text-[#FAFBFC]">
            {activeScenario.story}
          </p>

          {/* مقارنة الأرقام قبل وبعد التصحيح */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[12px] border border-red-300 bg-red-50/70 p-3.5 dark:border-red-900/50 dark:bg-red-950/20">
              <span className="text-[11px] font-bold text-red-700 dark:text-red-400">
                المعالجة الخاطئة في الدفاتر:
              </span>
              <p className="mt-1 text-xs text-[#0A1630] dark:text-[#FAFBFC]">
                {activeScenario.wrongAccountingTreatment}
              </p>
              <div className="mt-2 flex items-center justify-between rounded bg-white px-2.5 py-1.5 text-xs dark:bg-[#0A1630]">
                <span className="text-[#526077]">{activeScenario.wrongNumberLabel}</span>
                <strong className="font-tabular text-red-600">
                  {formatFilsShort(activeScenario.wrongNumberFils)}
                </strong>
              </div>
            </div>

            <div
              className={cn(
                'rounded-[12px] border p-3.5 transition-all',
                isScenarioSolved
                  ? 'border-[#22C55E] bg-[#22C55E]/10'
                  : 'border-[#E3E8F0] bg-white opacity-75 dark:border-[#1E325C] dark:bg-[#0A1630]'
              )}
            >
              <span className="text-[11px] font-bold text-[#16A34A] dark:text-[#22C55E]">
                {isScenarioSolved
                  ? 'التصحيح المحاسبي المعتمد:'
                  : 'سيظهر التصحيح الرقمي بعد تشخيص الانتهاك:'}
              </span>
              <p className="mt-1 text-xs text-[#0A1630] dark:text-[#FAFBFC]">
                {isScenarioSolved
                  ? activeScenario.correctedAccountingTreatment
                  : 'حدّد القاعدة المحاسبية المنتهكة أولاً لكشف الأثر الرقمي السليم.'}
              </p>
              {isScenarioSolved && (
                <div className="mt-2 flex items-center justify-between rounded bg-white px-2.5 py-1.5 text-xs dark:bg-[#0A1630]">
                  <span className="text-[#526077]">
                    {activeScenario.correctedNumberLabel}
                  </span>
                  <strong className="font-tabular text-[#16A34A]">
                    {formatFilsShort(activeScenario.correctedNumberFils)}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {isDetectorOpen && (
            <div className="space-y-2.5 border-t border-[#E3E8F0] pt-3 dark:border-[#1E325C]">
              <p className="text-xs font-bold text-[#2563EB]">
                أي فرض أو مبدأ أو سياسة تم اختراقها في هذا الموقف؟
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeScenario.options.map((opt) => {
                  const chosenRight =
                    scenarioFeedback?.ok && opt.id === activeScenario.correctRuleId;
                  const chosenWrong =
                    scenarioFeedback &&
                    !scenarioFeedback.ok &&
                    scenarioFeedback.chosenId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleChooseRule(opt.id)}
                      className={cn(
                        'min-h-[42px] rounded-[10px] border px-3 py-2 text-right text-xs font-semibold transition-colors',
                        chosenRight
                          ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#16A34A]'
                          : chosenWrong
                          ? 'border-red-500 bg-red-500/10 text-red-600'
                          : 'border-[#E3E8F0] bg-white hover:border-[#2563EB] dark:border-[#1E325C] dark:bg-[#0A1630]'
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {scenarioFeedback && (
            <div
              className={cn(
                'flex flex-wrap items-center justify-between gap-2 rounded-[10px] border p-3 text-xs',
                scenarioFeedback.ok
                  ? 'border-[#22C55E]/40 bg-[#22C55E]/10'
                  : 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
              )}
            >
              <span className="inline-flex items-center gap-2">
                {scenarioFeedback.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                )}
                <span>{scenarioFeedback.text}</span>
              </span>
              {scenarioFeedback.ok &&
                scenarioIdx < VIOLATION_SCENARIO_CASES.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setScenarioIdx((i) =>
                        Math.min(VIOLATION_SCENARIO_CASES.length - 1, i + 1)
                      );
                      setScenarioFeedback(null);
                    }}
                    className="h-7 px-3 text-[11px]"
                  >
                    السيناريو التالي
                  </Button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
