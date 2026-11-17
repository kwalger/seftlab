'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  X,
} from 'lucide-react';
import type {
  LegoBrick,
  LegoBrickColor,
  LegoSlot,
  LegoTaskConfig,
} from '@/lib/labs/accounting/unit1-lego-tasks';
import { triggerHaptic } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* نقطة لون صغيرة لتمييز البطاقات بصرياً بدون زخرفة زائدة */
const DOT_COLOR: Record<LegoBrickColor, string> = {
  blue: 'bg-[#2F6BFF]',
  emerald: 'bg-[#10B981]',
  amber: 'bg-[#F59E0B]',
  purple: 'bg-[#8B5CF6]',
  cyan: 'bg-[#06B6D4]',
  indigo: 'bg-[#6366F1]',
  rose: 'bg-[#F43F5E]',
  slate: 'bg-[#64748B]',
};

export function isLegoSlotCorrect(slot: LegoSlot, placedBrickId?: string): boolean {
  if (!placedBrickId) return false;
  if (slot.acceptedBrickIds && slot.acceptedBrickIds.length > 0) {
    return slot.acceptedBrickIds.includes(placedBrickId);
  }
  return slot.correctBrickId === placedBrickId;
}

export interface Unit1LegoBuilderProps {
  task: LegoTaskConfig;
  value?: Record<string, string>;
  onChange?: (placements: Record<string, string>) => void;
  onComplete?: (task: LegoTaskConfig, scorePct: number) => void;
  alreadyCompleted?: boolean;
  /** وضع الواجب: لا نكشف الإجابة الصحيحة قبل التسليم */
  assignmentMode?: boolean;
}

/**
 * التطبيق العملي: سؤال واحد في كل شاشة، يختار الطالب الإجابة بلمسة واحدة.
 * في وضع التدريب تظهر النتيجة فوراً مع شرح قصير.
 */
export function Unit1LegoBuilder({
  task,
  value,
  onChange,
  onComplete,
  alreadyCompleted = false,
  assignmentMode = false,
}: Unit1LegoBuilderProps) {
  const [internalPlacements, setInternalPlacements] = useState<Record<string, string>>({});
  const placements = value ?? internalPlacements;

  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [firstTry, setFirstTry] = useState<Record<string, boolean>>({});
  const completedFiredRef = useRef(false);

  const total = task.slots.length;
  const slot = task.slots[Math.min(index, total - 1)];

  const brickById = useMemo(() => {
    const map = new Map<string, LegoBrick>();
    task.bricks.forEach((b) => map.set(b.id, b));
    return map;
  }, [task.bricks]);

  const groupById = useMemo(() => {
    const map = new Map<string, string>();
    task.groups?.forEach((g) => map.set(g.id, g.title));
    return map;
  }, [task.groups]);

  const placedHere = placements[slot.id];
  const isAnswered = Boolean(placedHere);
  const isCorrect = isLegoSlotCorrect(slot, placedHere);

  /* الخيارات: كل البطاقات غير المستخدمة في سؤال آخر (في وضع التدريب نُخفي فقط المستخدمة بشكل صحيح) */
  const choices = useMemo(() => {
    const usedElsewhere = new Set(
      task.slots
        .filter((s) => s.id !== slot.id && placements[s.id])
        .filter((s) => assignmentMode || isLegoSlotCorrect(s, placements[s.id]))
        .map((s) => placements[s.id])
    );
    return task.bricks.filter((b) => !usedElsewhere.has(b.id));
  }, [task.slots, task.bricks, slot.id, placements, assignmentMode]);

  const answeredCount = task.slots.filter((s) => placements[s.id]).length;
  const correctCount = task.slots.filter((s) => isLegoSlotCorrect(s, placements[s.id])).length;
  const firstTryCount = Object.values(firstTry).filter(Boolean).length;

  const commit = (next: Record<string, string>) => {
    if (!value) setInternalPlacements(next);
    onChange?.(next);
  };

  const goTo = (i: number) => {
    setShowHint(false);
    setIndex(Math.max(0, Math.min(total - 1, i)));
  };

  const pick = (brickId: string) => {
    const next = { ...placements };
    // في وضع الواجب: لو البطاقة مستخدمة في سؤال آخر نحررها
    for (const [k, v] of Object.entries(next)) {
      if (v === brickId && k !== slot.id) delete next[k];
    }
    next[slot.id] = brickId;
    commit(next);

    const right = isLegoSlotCorrect(slot, brickId);

    if (assignmentMode) {
      triggerHaptic('tap');
      // انتقل تلقائياً للسؤال التالي غير المجاب
      const nextEmpty = task.slots.findIndex((s, i) => i > index && !next[s.id]);
      if (nextEmpty >= 0) setTimeout(() => goTo(nextEmpty), 220);
      return;
    }

    if (firstTry[slot.id] === undefined) {
      setFirstTry((prev) => ({ ...prev, [slot.id]: right }));
    }
    triggerHaptic(right ? 'success' : 'error');

    if (right) {
      const allRight = task.slots.every((s) => isLegoSlotCorrect(s, next[s.id]));
      if (allRight && !completedFiredRef.current) {
        completedFiredRef.current = true;
        onComplete?.(task, 100);
      }
    }
  };

  const reset = () => {
    triggerHaptic('tap');
    commit({});
    setFirstTry({});
    completedFiredRef.current = false;
    setFinished(false);
    goTo(0);
  };

  const goNext = () => {
    if (index < total - 1) {
      goTo(index + 1);
    } else {
      setFinished(true);
    }
  };

  /* ===== شاشة النهاية (وضع التدريب) ===== */
  if (!assignmentMode && finished && correctCount === total) {
    return (
      <div className="space-y-4 text-right">
        <div className="rounded-[20px] border border-[#10B981]/30 bg-[#10B981]/[0.07] p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white">
            <Check className="h-7 w-7 stroke-[2.5]" />
          </div>
          <h3 className="mt-3 text-lg font-bold text-[#0A1630] dark:text-white">أحسنت! أنهيت التطبيق</h3>
          <p className="mt-1 text-sm text-[#475569] dark:text-[#CBD5E1]">
            أجبت صح من أول مرة في {firstTryCount} من {total} أسئلة
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#065F46] dark:text-[#A7F3D0]">
            {task.completionTakeaway}
          </p>
          <span className="font-tabular mt-4 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-[#047857] dark:bg-[#0A1630] dark:text-[#34D399]">
            +{task.xpReward} XP
          </span>
        </div>
        <Button type="button" variant="outline" onClick={reset} className="min-h-[48px] w-full gap-2">
          <RotateCcw className="h-4 w-4" />
          أعد المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-right">
      {/* المقدمة: قصة قصيرة */}
      <div className="rounded-[18px] bg-[#F1F5FF] p-4 dark:bg-[#0F1E3E]">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-[#0A1630] dark:text-white">{task.title.replace(/^تطبيق عملي \d+:\s*/, '')}</h3>
          {alreadyCompleted && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#047857] dark:text-[#34D399]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              منجز
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-[#475569] dark:text-[#CBD5E1]">{task.scenario}</p>
      </div>

      {/* التقدم: نقاط قابلة للمس */}
      <div className="flex items-center justify-between gap-3">
        <span className="font-tabular text-sm font-bold text-[#0A1630] dark:text-white">
          سؤال {index + 1} من {total}
        </span>
        <div className="flex flex-wrap justify-end gap-1.5" role="tablist" aria-label="الأسئلة">
          {task.slots.map((s, i) => {
            const answered = Boolean(placements[s.id]);
            const ok = !assignmentMode && isLegoSlotCorrect(s, placements[s.id]);
            const bad = !assignmentMode && answered && !ok;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`السؤال ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  'h-3 rounded-full transition-all',
                  i === index ? 'w-6' : 'w-3',
                  ok
                    ? 'bg-[#10B981]'
                    : bad
                    ? 'bg-[#F59E0B]'
                    : answered
                    ? 'bg-[#2F6BFF]'
                    : i === index
                    ? 'bg-[#0A1630] dark:bg-white'
                    : 'bg-[#CBD5E1] dark:bg-[#1E325C]'
                )}
              />
            );
          })}
        </div>
      </div>

      {/* السؤال الحالي */}
      <div className="rounded-[20px] border border-[#E3E8F0] bg-white p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <p className="text-xs font-semibold text-[#2F6BFF]">
          {slot.groupId && groupById.get(slot.groupId) ? `${groupById.get(slot.groupId)} · ` : ''}
          {slot.title}
        </p>
        <p className="mt-1.5 text-lg leading-snug font-bold text-[#0A1630] dark:text-white">{slot.prompt}</p>

        {!assignmentMode && !isCorrect && (
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309] dark:text-[#FCD34D]"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {showHint ? 'إخفاء التلميح' : 'أحتاج تلميح'}
          </button>
        )}
        {showHint && !isCorrect && (
          <p className="mt-2 rounded-[12px] bg-[#FEF3C7] p-3 text-sm leading-relaxed text-[#92400E] dark:bg-[#F59E0B]/15 dark:text-[#FCD34D]">
            {slot.explanation}
          </p>
        )}
      </div>

      {/* الخيارات */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">اختر الإجابة:</p>
        {choices.map((brick) => {
          const selected = placedHere === brick.id;
          const showRight = !assignmentMode && selected && isCorrect;
          const showWrong = !assignmentMode && selected && !isCorrect;
          const locked = !assignmentMode && isCorrect && !selected;
          return (
            <button
              key={brick.id}
              type="button"
              disabled={locked}
              onClick={() => pick(brick.id)}
              className={cn(
                'flex min-h-[56px] w-full items-center gap-3 rounded-[16px] border-2 px-4 py-3 text-right transition-all active:scale-[0.99]',
                showRight
                  ? 'border-[#10B981] bg-[#10B981]/10'
                  : showWrong
                  ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                  : selected
                  ? 'border-[#2F6BFF] bg-[#2F6BFF]/10'
                  : 'border-[#E3E8F0] bg-white hover:border-[#2F6BFF]/50 dark:border-[#1E325C] dark:bg-[#0A1630]',
                locked && 'opacity-40'
              )}
            >
              <span className={cn('h-3 w-3 shrink-0 rounded-full', DOT_COLOR[brick.color])} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#0A1630] dark:text-white">{brick.label}</span>
                {brick.sublabel && (
                  <span className="mt-0.5 block text-xs text-[#64748B] dark:text-[#94A3B8]">{brick.sublabel}</span>
                )}
              </span>
              {showRight && <Check className="h-5 w-5 shrink-0 text-[#10B981]" />}
              {showWrong && <X className="h-5 w-5 shrink-0 text-[#F59E0B]" />}
            </button>
          );
        })}
      </div>

      {/* النتيجة الفورية (تدريب) */}
      {!assignmentMode && isAnswered && (
        <div
          className={cn(
            'rounded-[16px] p-4 text-sm leading-relaxed',
            isCorrect
              ? 'bg-[#10B981]/10 text-[#065F46] dark:text-[#A7F3D0]'
              : 'bg-[#F59E0B]/10 text-[#92400E] dark:text-[#FCD34D]'
          )}
        >
          <p className="font-bold">{isCorrect ? 'صحيح!' : 'ليست هذه، جرّب خياراً آخر.'}</p>
          {isCorrect && <p className="mt-1">{slot.explanation}</p>}
        </div>
      )}

      {/* أزرار التنقل */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="min-h-[48px] gap-1.5 px-4"
          aria-label="السابق"
        >
          <ArrowRight className="h-4 w-4" />
          السابق
        </Button>

        {assignmentMode ? (
          <Button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === total - 1}
            className="min-h-[48px] flex-1 gap-1.5"
          >
            التالي
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={goNext}
            disabled={!isCorrect}
            className="min-h-[48px] flex-1 gap-1.5"
          >
            {index === total - 1 ? 'إنهاء' : 'التالي'}
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        {answeredCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={reset}
            className="min-h-[48px] px-3"
            aria-label="البدء من جديد"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {assignmentMode && (
        <p className="rounded-[14px] bg-[#F1F5FF] px-4 py-3 text-center text-xs font-semibold text-[#2F6BFF] dark:bg-[#2F6BFF]/10">
          {answeredCount === total
            ? 'أجبت على كل الأسئلة. اضغط «تسليم» في الأعلى.'
            : `أجبت على ${answeredCount} من ${total}`}
        </p>
      )}
    </div>
  );
}
