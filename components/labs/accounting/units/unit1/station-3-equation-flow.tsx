'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Droplets,
  Scale,
  XCircle,
} from 'lucide-react';
import {
  Fils,
  formatFilsShort,
  jodToFils,
  parseJodInputToFils,
} from '@/lib/labs/accounting/accounts';
import {
  EQUATION_ELEMENTS_CONCEPTS,
  EQUATION_FLOW_PUZZLES,
} from '@/lib/labs/accounting/unit1-data';
import { AccountingEquationScale } from '@/components/labs/accounting/accounting-equation-scale';
import type { StationExerciseCompletionPayload } from './station-1-flowchart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Station3EquationFlowProps {
  completedExerciseIds: string[];
  onCompleteExercise: (payload: StationExerciseCompletionPayload) => void;
}

export function Station3EquationFlow({
  completedExerciseIds,
  onCompleteExercise,
}: Station3EquationFlowProps) {
  const [hoveredConceptId, setHoveredConceptId] =
    useState<(typeof EQUATION_ELEMENTS_CONCEPTS)[number]['id']>('assets');

  // محاكي تدفق الإيرادات والمصروفات إلى خزان حقوق الملكية
  const [simRevenueJod, setSimRevenueJod] = useState(25000);
  const [simExpenseJod, setSimExpenseJod] = useState(16000);
  const [simDrawingsJod, setSimDrawingsJod] = useState(2000);
  const [simLiabilitiesJod, setSimLiabilitiesJod] = useState(15000);
  const beginningCapJod = 40000;

  const netIncomeJod = simRevenueJod - simExpenseJod;
  const endingEquityJod = Math.max(
    0,
    beginningCapJod + netIncomeJod - simDrawingsJod
  );
  const totalAssetsJod = simLiabilitiesJod + endingEquityJod;

  // تمرين u1-ex-5: 3 مسائل تطبيقية
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [solvedPuzzleIds, setSolvedPuzzleIds] = useState<string[]>([]);
  const [puzzleFeedback, setPuzzleFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const activeConcept =
    EQUATION_ELEMENTS_CONCEPTS.find((c) => c.id === hoveredConceptId) ||
    EQUATION_ELEMENTS_CONCEPTS[0];
  const activePuzzle = EQUATION_FLOW_PUZZLES[puzzleIdx];
  const ex5Done = completedExerciseIds.includes('u1-ex-5');

  const handleLoadPuzzleToSimulator = (puzzle: typeof activePuzzle) => {
    setSimRevenueJod(Math.round(puzzle.revenuesFils / 1000));
    setSimExpenseJod(Math.round(puzzle.expensesFils / 1000));
    setSimDrawingsJod(Math.round(puzzle.drawingsFils / 1000));
    if (puzzle.liabilitiesFils !== null) {
      setSimLiabilitiesJod(Math.round(puzzle.liabilitiesFils / 1000));
    }
  };

  const handleCheckPuzzle = () => {
    const enteredFils: Fils = parseJodInputToFils(answerInput);
    const isRight = enteredFils === activePuzzle.correctAmountFils;

    if (isRight) {
      const nextSolved = solvedPuzzleIds.includes(activePuzzle.id)
        ? solvedPuzzleIds
        : [...solvedPuzzleIds, activePuzzle.id];
      setSolvedPuzzleIds(nextSolved);
      setPuzzleFeedback({ ok: true, text: activePuzzle.explanation });
      handleLoadPuzzleToSimulator(activePuzzle);

      if (nextSolved.length === EQUATION_FLOW_PUZZLES.length) {
        onCompleteExercise({
          exerciseId: 'u1-ex-5',
          topicId: 'u1-equation-concepts',
          title: 'محاكي المعادلة المحاسبية وتدفق صافي الدخل لحقوق الملكية',
          xpReward: 45,
          scorePct: 100,
          passed: true,
          whyExplanation:
            'الأصول = الالتزامات + حقوق الملكية (وحقوق الملكية = الأصول - الالتزامات)، وصافي الربح (الإيرادات - المصروفات) يصب لرفع حقوق الملكية بينما المسحوبات والخسارة تخفضها.',
        });
      }
    } else {
      setPuzzleFeedback({
        ok: false,
        text: `الإجابة المدخلة (${formatFilsShort(enteredFils)}) غير مطابقة. تأكد من معادلة الميزانية أو معادلة صافي الربح وأعد الحساب.`,
      });
    }
  };

  const equityFillPct = Math.min(
    100,
    Math.max(12, Math.round((endingEquityJod / 65000) * 100))
  );

  return (
    <div className="space-y-6">
      {/* الجزء 1: معادلة الميزانية وتعريفات الكتاب والمعايير */}
      <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
              <Scale className="h-4 w-4 text-[#2563EB]" />
              <span>معادلة الميزانية ومفاهيم القوائم المالية</span>
            </h3>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              مرر الفأرة أو اضغط على أي مفهوم لاستعراض تعريفه وفق الكتاب والمعايير الدولية والأمريكية FASB
            </p>
          </div>
          <div className="rounded-[10px] border border-[#2563EB]/30 bg-[#2563EB]/10 px-3 py-1.5 text-xs font-bold text-[#2563EB]">
            حقوق الملكية = الأصول - الالتزامات (صافي الأصول)
          </div>
        </div>

        {/* المعادلة البصرية */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {EQUATION_ELEMENTS_CONCEPTS.map((el) => {
            const active = hoveredConceptId === el.id;
            return (
              <button
                key={el.id}
                type="button"
                onMouseEnter={() => setHoveredConceptId(el.id)}
                onClick={() => setHoveredConceptId(el.id)}
                className={cn(
                  'rounded-[12px] border p-3 text-right transition-all',
                  el.colorClass,
                  active && 'ring-2 ring-[#2563EB]'
                )}
              >
                <p className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                  {el.title}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-[#526077] dark:text-[#94A3B8]">
                  {el.altTitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* بطاقة المقارنة المعرفية */}
        <div className="grid grid-cols-1 gap-3 rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 md:grid-cols-2 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div>
            <span className="inline-block rounded bg-white px-2 py-0.5 text-[10px] font-bold text-[#2563EB] dark:bg-[#0A1630]">
              التعريف وفق الكتاب
            </span>
            <p className="mt-1.5 text-xs leading-relaxed text-[#0A1630] dark:text-[#FAFBFC]">
              {activeConcept.authorsDef}
            </p>
          </div>
          <div>
            <span className="inline-block rounded bg-white px-2 py-0.5 text-[10px] font-bold text-[#16A34A] dark:bg-[#0A1630]">
              تعريف FASB (1985) ومعايير IFRS
            </span>
            <p className="mt-1.5 text-xs leading-relaxed text-[#0A1630] dark:text-[#FAFBFC]">
              {activeConcept.standardsDef}
            </p>
            <p className="mt-1.5 text-[11px] text-[#526077] dark:text-[#94A3B8]">
              أمثلة: {activeConcept.examples}
            </p>
          </div>
        </div>
      </div>

      {/* الجزء 2: أنابيب تدفق الدخل وخزان حقوق الملكية + الميزان الحي */}
      <div className="space-y-5 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
              <Droplets className="h-4 w-4 text-[#2563EB]" />
              <span>محرك تدفق قائمة الدخل إلى خزان حقوق الملكية</span>
            </h3>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              حرّك الإيرادات والمصروفات والمسحوبات لترى بالرسم كيف يرفع الربح حقوق الملكية وتخفضها الخسارة والمسحوبات
            </p>
          </div>
        </div>

        {/* منزلقات التحكم اللحظية */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="space-y-3 rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 lg:col-span-5 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <div>
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span className="text-[#16A34A]">الإيرادات (تدفق داخل +)</span>
                <span className="font-tabular">{formatFilsShort(jodToFils(simRevenueJod))}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={45000}
                step={500}
                value={simRevenueJod}
                onChange={(e) => setSimRevenueJod(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span className="text-rose-600 dark:text-rose-400">المصروفات (تدفق خارج -)</span>
                <span className="font-tabular">{formatFilsShort(jodToFils(simExpenseJod))}</span>
              </div>
              <input
                type="range"
                min={2000}
                max={38000}
                step={500}
                value={simExpenseJod}
                onChange={(e) => setSimExpenseJod(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span className="text-amber-600 dark:text-amber-400">المسحوبات الشخصية (-)</span>
                <span className="font-tabular">{formatFilsShort(jodToFils(simDrawingsJod))}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10000}
                step={500}
                value={simDrawingsJod}
                onChange={(e) => setSimDrawingsJod(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span className="text-[#526077] dark:text-[#94A3B8]">الالتزامات للغير</span>
                <span className="font-tabular">{formatFilsShort(jodToFils(simLiabilitiesJod))}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={30000}
                step={500}
                value={simLiabilitiesJod}
                onChange={(e) => setSimLiabilitiesJod(Number(e.target.value))}
                className="w-full accent-[#2563EB]"
              />
            </div>
          </div>

          {/* مخطط الأنابيب وخزان حقوق الملكية (SVG تفاعلي) */}
          <div className="flex flex-col justify-between rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 lg:col-span-7 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <svg
              viewBox="0 0 480 210"
              className="w-full"
              aria-label="أنابيب تدفق الإيرادات والمصروفات إلى خزان حقوق الملكية"
            >
              {/* أنبوب الإيرادات */}
              <rect x="20" y="20" width="130" height="44" rx="10" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.5" />
              <text x="85" y="39" textAnchor="middle" fill="#166534" fontSize="11" fontWeight="700">
                الإيرادات (+)
              </text>
              <text x="85" y="55" textAnchor="middle" fill="#15803D" fontSize="11" fontWeight="700">
                {simRevenueJod.toLocaleString('en-US')} JOD
              </text>

              {/* أنبوب المصروفات */}
              <rect x="20" y="95" width="130" height="44" rx="10" fill="#FFE4E6" stroke="#F43F5E" strokeWidth="1.5" />
              <text x="85" y="114" textAnchor="middle" fill="#9F1239" fontSize="11" fontWeight="700">
                المصروفات (-)
              </text>
              <text x="85" y="130" textAnchor="middle" fill="#BE123C" fontSize="11" fontWeight="700">
                {simExpenseJod.toLocaleString('en-US')} JOD
              </text>

              {/* خطوط الأنابيب الواصلة */}
              <path d="M 150 42 H 195 V 82 H 215" fill="none" stroke="#22C55E" strokeWidth="4" />
              <path d="M 150 117 H 195 V 92 H 215" fill="none" stroke="#F43F5E" strokeWidth="4" />

              {/* عقدة صافي الربح / الخسارة */}
              <rect
                x="215"
                y="56"
                width="115"
                height="58"
                rx="12"
                fill={netIncomeJod >= 0 ? '#EFF6FF' : '#FEF2F2'}
                stroke={netIncomeJod >= 0 ? '#2563EB' : '#EF4444'}
                strokeWidth="2"
              />
              <text x="272" y="79" textAnchor="middle" fill="#0A1630" fontSize="11" fontWeight="700">
                {netIncomeJod >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
              </text>
              <text
                x="272"
                y="99"
                textAnchor="middle"
                fill={netIncomeJod >= 0 ? '#2563EB' : '#DC2626'}
                fontSize="12"
                fontWeight="700"
              >
                {netIncomeJod >= 0 ? '+' : ''}
                {netIncomeJod.toLocaleString('en-US')} JOD
              </text>

              {/* أنبوب المصب للخزان */}
              <path
                d="M 330 85 H 355"
                fill="none"
                stroke={netIncomeJod >= 0 ? '#22C55E' : '#EF4444'}
                strokeWidth="5"
              />

              {/* خزان حقوق الملكية */}
              <rect x="355" y="25" width="105" height="150" rx="12" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
              <rect
                x="358"
                y={172 - Math.round((equityFillPct / 100) * 140)}
                width="99"
                height={Math.round((equityFillPct / 100) * 140)}
                rx="8"
                fill={netIncomeJod >= 0 ? '#3B82F6' : '#F59E0B'}
                opacity="0.22"
              />
              <text x="407" y="45" textAnchor="middle" fill="#0A1630" fontSize="11" fontWeight="700">
                خزان حقوق الملكية
              </text>
              <text x="407" y="108" textAnchor="middle" fill="#2563EB" fontSize="13" fontWeight="700">
                {endingEquityJod.toLocaleString('en-US')}
              </text>
              <text x="407" y="125" textAnchor="middle" fill="#526077" fontSize="10">
                دينار أردني
              </text>
              <text x="407" y="162" textAnchor="middle" fill="#D97706" fontSize="10" fontWeight="600">
                سحب: -{simDrawingsJod.toLocaleString('en-US')}
              </text>
            </svg>

            <AccountingEquationScale
              assetsFils={jodToFils(totalAssetsJod)}
              liabilitiesFils={jodToFils(simLiabilitiesJod)}
              equityFils={jodToFils(endingEquityJod)}
              capitalFils={jodToFils(beginningCapJod)}
              revenuesFils={jodToFils(simRevenueJod)}
              expensesFils={jodToFils(simExpenseJod)}
              drawingsFils={jodToFils(simDrawingsJod)}
            />
          </div>
        </div>
      </div>

      {/* الجزء 3: التمرين التطبيقي u1-ex-5 */}
      <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
              التطبيق العملي: اختبر الترابط الرقمي بين القائمتين
            </h3>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              أجب عن الحالات الثلاث بالأرقام (دينار أردني) لتثبيت فهم معادلة الميزانية وتدفق الدخل
            </p>
          </div>
          <Badge
            variant={ex5Done ? 'default' : 'secondary'}
            className={cn('font-tabular', ex5Done && 'bg-[#22C55E] text-white')}
          >
            تمرين 5: {ex5Done ? 'مكتمل (+45 XP)' : `${solvedPuzzleIds.length} / 3`}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {EQUATION_FLOW_PUZZLES.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPuzzleIdx(idx);
                setAnswerInput('');
                setPuzzleFeedback(null);
              }}
              className={cn(
                'rounded-[10px] border px-3 py-1.5 text-xs font-semibold transition-colors',
                idx === puzzleIdx
                  ? 'border-[#2563EB] bg-[#2563EB] text-white'
                  : solvedPuzzleIds.includes(p.id)
                  ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#16A34A]'
                  : 'border-[#E3E8F0] bg-[#F8FAFC] text-[#526077] dark:border-[#1E325C] dark:bg-[#070D1F]'
              )}
            >
              {p.title}
            </button>
          ))}
        </div>

        <div className="space-y-3 rounded-[14px] border border-[#2563EB]/25 bg-[#F8FAFC] p-4 dark:bg-[#070D1F]">
          <p className="text-xs leading-relaxed font-semibold text-[#0A1630] sm:text-sm dark:text-[#FAFBFC]">
            {activePuzzle.scenarioPrompt}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-[#526077] dark:text-[#94A3B8]">
                {activePuzzle.questionLabel}
              </label>
              <Input
                type="number"
                inputMode="decimal"
                dir="ltr"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="مثال: 6500"
                className="h-11 bg-white text-left font-tabular text-sm dark:bg-[#0A1630]"
              />
            </div>
            <Button
              type="button"
              disabled={!answerInput.trim()}
              onClick={handleCheckPuzzle}
              className="min-h-[44px] sm:px-6"
            >
              فحص وتحديث الميزان
            </Button>
          </div>

          {puzzleFeedback && (
            <div
              className={cn(
                'flex flex-wrap items-center justify-between gap-2 rounded-[10px] border p-3 text-xs',
                puzzleFeedback.ok
                  ? 'border-[#22C55E]/40 bg-[#22C55E]/12 text-[#0A1630] dark:text-[#FAFBFC]'
                  : 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
              )}
            >
              <span className="inline-flex items-center gap-2">
                {puzzleFeedback.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                )}
                <span>{puzzleFeedback.text}</span>
              </span>

              {puzzleFeedback.ok &&
                puzzleIdx < EQUATION_FLOW_PUZZLES.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setPuzzleIdx((i) =>
                        Math.min(EQUATION_FLOW_PUZZLES.length - 1, i + 1)
                      );
                      setAnswerInput('');
                      setPuzzleFeedback(null);
                    }}
                    className="h-7 px-3 text-[11px]"
                  >
                    الحالة التالية
                  </Button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
