'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  FolderTree,
  Hash,
  XCircle,
} from 'lucide-react';
import {
  ACCOUNT_CODING_PRACTICE_ITEMS,
  CHART_CODING_GROUPS,
  type AccountGroupHierarchy,
} from '@/lib/labs/accounting/unit1-data';
import type { StationExerciseCompletionPayload } from './station-1-flowchart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Station6ChartCodingProps {
  completedExerciseIds: string[];
  onCompleteExercise: (payload: StationExerciseCompletionPayload) => void;
}

export function Station6ChartCoding({
  completedExerciseIds,
  onCompleteExercise,
}: Station6ChartCodingProps) {
  const [selectedGroupCode, setSelectedGroupCode] =
    useState<AccountGroupHierarchy['groupCode']>('1');

  // مولد الكود المحاسبي للتطبيق العملي u1-ex-10
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [solvedItemIds, setSolvedItemIds] = useState<string[]>([]);
  const [codingFeedback, setCodingFeedback] = useState<{
    ok: boolean;
    chosenGroup: string;
    text: string;
  } | null>(null);

  // أداة الاستكشاف الحر لأي اسم حساب يكتبه الطالب
  const [customAccountName, setCustomAccountName] = useState('');
  const [customGroup, setCustomGroup] =
    useState<AccountGroupHierarchy['groupCode']>('1');

  const activeGroupObj =
    CHART_CODING_GROUPS.find((g) => g.groupCode === selectedGroupCode) ||
    CHART_CODING_GROUPS[0];
  const activePracticeItem = ACCOUNT_CODING_PRACTICE_ITEMS[practiceIdx];
  const ex10Done = completedExerciseIds.includes('u1-ex-10');

  const customGroupObj =
    CHART_CODING_GROUPS.find((g) => g.groupCode === customGroup) ||
    CHART_CODING_GROUPS[0];
  const generatedCustomCode = `${customGroup}19`;

  const handleAssignGroup = (groupCode: AccountGroupHierarchy['groupCode']) => {
    setSelectedGroupCode(groupCode);
    const isRight = groupCode === activePracticeItem.correctGroupCode;

    if (isRight) {
      const nextSolved = solvedItemIds.includes(activePracticeItem.id)
        ? solvedItemIds
        : [...solvedItemIds, activePracticeItem.id];
      setSolvedItemIds(nextSolved);
      setCodingFeedback({
        ok: true,
        chosenGroup: groupCode,
        text: `تطابق دقيق! تم توليد الرمز [${activePracticeItem.generatedCode}] ضمن المجموعة (${groupCode}) — الطبيعة: ${activePracticeItem.normalBalanceAr} ⬅ يظهر في: ${activePracticeItem.statementTarget}.`,
      });

      if (nextSolved.length === ACCOUNT_CODING_PRACTICE_ITEMS.length) {
        onCompleteExercise({
          exerciseId: 'u1-ex-10',
          topicId: 'u1-chart-coding',
          title: 'مولد الكود المحاسبي في شجرة المجموعات الخمس',
          xpReward: 60,
          scorePct: 100,
          passed: true,
          whyExplanation:
            'يتكون دليل الحسابات القياسي من 5 مجموعات رئيسية (1 الأصول، 2 المطلوبات، 3 حقوق الملكية، 4 المصروفات، 5 الإيرادات)، وكل حساب يأخذ كوداً متفرعاً يحدد طبيعته في القيد المزدوج وموضعه في القوائم المالية.',
        });
      }
    } else {
      setCodingFeedback({
        ok: false,
        chosenGroup: groupCode,
        text: `المجموعة (${groupCode}) لا تناسب هذا الحساب. تلميح: ${activePracticeItem.hint}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* الجزء 1: شجرة المجموعات الخمس والترميز الرقمي */}
      <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
            <FolderTree className="h-4 w-4 text-[#2563EB]" />
            <span>شجرة دليل الحسابات القياسي والترميز الرقمي (صفحة 36)</span>
          </h3>
          <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
            تنقسم جميع حسابات المنشأة إلى 5 مجموعات رئيسية من (1 إلى 5)؛ انقر على أي مجموعة لتفحص شجرتها الفرعية
          </p>
        </div>

        {/* شريط المجموعات الخمس */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {CHART_CODING_GROUPS.map((grp) => {
            const active = grp.groupCode === selectedGroupCode;
            return (
              <button
                key={grp.groupCode}
                type="button"
                onClick={() => setSelectedGroupCode(grp.groupCode)}
                className={cn(
                  'rounded-[12px] border p-3 text-right transition-all',
                  active
                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                    : 'border-[#E3E8F0] bg-[#F8FAFC] hover:border-[#2563EB]/60 dark:border-[#1E325C] dark:bg-[#070D1F]'
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full font-tabular text-xs font-bold',
                    active
                      ? 'bg-white text-[#2563EB]'
                      : 'bg-[#2563EB]/15 text-[#2563EB]'
                  )}
                >
                  {grp.groupCode}
                </span>
                <p className="mt-1.5 text-xs font-bold">{grp.groupTitle}</p>
              </button>
            );
          })}
        </div>

        {/* شجرة الفروع الخاصة بالمجموعة المحددة */}
        <div className="rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#E3E8F0] pb-2.5 dark:border-[#1E325C]">
            <div>
              <h4 className="text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                {activeGroupObj.groupTitle}
              </h4>
              <p className="text-[11px] text-[#526077] dark:text-[#94A3B8]">
                المخرج النهائي: {activeGroupObj.statementTarget}
              </p>
            </div>
            <Badge variant="default">
              الطبيعة في القيد المزدوج:{' '}
              {activeGroupObj.normalBalance === 'debit' ? 'مدين' : 'دائن'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {activeGroupObj.subCategories.map((sub) => (
              <div
                key={sub.subCode}
                className="rounded-[12px] border border-[#E3E8F0] bg-white p-3 dark:border-[#1E325C] dark:bg-[#0A1630]"
              >
                <p className="text-xs font-bold text-[#2563EB]">
                  {sub.subTitle}
                </p>
                <div className="mt-2 space-y-1.5">
                  {sub.accounts.map((acc) => (
                    <div
                      key={acc.code}
                      className="flex items-center justify-between rounded-[8px] border border-[#E3E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs dark:border-[#1E325C] dark:bg-[#070D1F]"
                    >
                      <span className="font-medium text-[#0A1630] dark:text-[#FAFBFC]">
                        {acc.name}
                      </span>
                      <span className="rounded bg-[#2563EB]/10 px-2 py-0.5 font-tabular text-[11px] font-bold text-[#2563EB]">
                        {acc.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* الجزء 2: التطبيق العملي u1-ex-10 (مولد الكود المحاسبي) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-5 lg:col-span-7 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                <Hash className="h-4 w-4 text-[#2563EB]" />
                <span>تحدي مولد الكود المحاسبي (التمرين 10)</span>
              </h3>
              <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
                صنّف كل حساب من الحسابات الخمسة في مجموعته الصحيحة لتوليد رقمه وربطه بالقيد المزدوج
              </p>
            </div>
            <Badge
              variant={ex10Done ? 'default' : 'secondary'}
              className={cn('font-tabular', ex10Done && 'bg-[#22C55E] text-white')}
            >
              تمرين 10: {ex10Done ? 'مكتمل (+60 XP)' : `${solvedItemIds.length} / 5`}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ACCOUNT_CODING_PRACTICE_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPracticeIdx(idx);
                  setCodingFeedback(null);
                }}
                className={cn(
                  'rounded-full border px-3 py-1 font-tabular text-xs font-bold transition-colors',
                  idx === practiceIdx
                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                    : solvedItemIds.includes(item.id)
                    ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#16A34A]'
                    : 'border-[#E3E8F0] bg-[#F8FAFC] text-[#526077] dark:border-[#1E325C] dark:bg-[#070D1F]'
                )}
              >
                حساب {idx + 1}
              </button>
            ))}
          </div>

          <div className="rounded-[14px] border border-[#2563EB]/30 bg-[#F8FAFC] p-4 dark:bg-[#070D1F]">
            <span className="text-[11px] font-bold text-[#2563EB]">
              الحساب المطلوب ترميزه:
            </span>
            <h4 className="mt-1 text-base font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              {activePracticeItem.accountName}
            </h4>

            <p className="mt-2 text-xs text-[#526077] dark:text-[#94A3B8]">
              اختر المجموعة المناسبة من (1 إلى 5):
            </p>
            <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CHART_CODING_GROUPS.map((grp) => {
                const isRight =
                  codingFeedback?.ok &&
                  codingFeedback.chosenGroup === grp.groupCode;
                const isWrong =
                  codingFeedback &&
                  !codingFeedback.ok &&
                  codingFeedback.chosenGroup === grp.groupCode;
                return (
                  <button
                    key={grp.groupCode}
                    type="button"
                    onClick={() => handleAssignGroup(grp.groupCode)}
                    className={cn(
                      'min-h-[42px] rounded-[10px] border px-3 py-2 text-right text-xs font-semibold transition-colors',
                      isRight
                        ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#16A34A]'
                        : isWrong
                        ? 'border-red-500 bg-red-500/10 text-red-600'
                        : 'border-[#E3E8F0] bg-white hover:border-[#2563EB] dark:border-[#1E325C] dark:bg-[#0A1630]'
                    )}
                  >
                    <span className="font-tabular text-[#2563EB]">
                      [{grp.groupCode}]
                    </span>{' '}
                    {grp.groupTitle.replace(/^المجموعة [^:]+:\s*/, '')}
                  </button>
                );
              })}
            </div>

            {codingFeedback && (
              <div
                className={cn(
                  'mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border p-3 text-xs',
                  codingFeedback.ok
                    ? 'border-[#22C55E]/40 bg-[#22C55E]/10'
                    : 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {codingFeedback.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                  )}
                  <span>{codingFeedback.text}</span>
                </span>
                {codingFeedback.ok &&
                  practiceIdx < ACCOUNT_CODING_PRACTICE_ITEMS.length - 1 && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setPracticeIdx((i) =>
                          Math.min(
                            ACCOUNT_CODING_PRACTICE_ITEMS.length - 1,
                            i + 1
                          )
                        );
                        setCodingFeedback(null);
                      }}
                      className="h-7 px-3 text-[11px]"
                    >
                      الحساب التالي
                    </Button>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* مختبر الترميز الحر وربطه بالقيد المزدوج والقوائم */}
        <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-5 lg:col-span-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
          <h4 className="text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
            محاكي توليد كود حساب جديد والربط بالقوائم
          </h4>
          <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
            اكتب اسم أي حساب تود إضافته لشركتك واختر مجموعته لترى ترميزه ومساره المحاسبي فوراً:
          </p>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold">
                اسم الحساب الجديد
              </label>
              <input
                type="text"
                value={customAccountName}
                onChange={(e) => setCustomAccountName(e.target.value)}
                placeholder="مثال: سيارات التوزيع، مصروف صيانة، إيراد إيجار"
                className="h-10 w-full rounded-[10px] border border-[#E3E8F0] bg-[#F8FAFC] px-3 text-xs outline-none focus:border-[#2563EB] dark:border-[#1E325C] dark:bg-[#070D1F]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">
                المجموعة المحاسبية (1 - 5)
              </label>
              <select
                value={customGroup}
                onChange={(e) =>
                  setCustomGroup(
                    e.target.value as AccountGroupHierarchy['groupCode']
                  )
                }
                className="h-10 w-full rounded-[10px] border border-[#E3E8F0] bg-[#F8FAFC] px-3 text-xs outline-none focus:border-[#2563EB] dark:border-[#1E325C] dark:bg-[#070D1F]"
              >
                {CHART_CODING_GROUPS.map((g) => (
                  <option key={g.groupCode} value={g.groupCode}>
                    {g.groupTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 rounded-[12px] border border-[#2563EB]/30 bg-[#F8FAFC] p-3.5 text-xs dark:bg-[#070D1F]">
              <div className="flex items-center justify-between">
                <span className="text-[#526077] dark:text-[#94A3B8]">الحساب:</span>
                <strong className="text-[#0A1630] dark:text-[#FAFBFC]">
                  {customAccountName.trim() || 'حساب مخصص تجريبي'}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#526077] dark:text-[#94A3B8]">
                  الكود المتولد في الشجرة:
                </span>
                <span className="rounded bg-[#2563EB] px-2 py-0.5 font-tabular font-bold text-white">
                  {generatedCustomCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#526077] dark:text-[#94A3B8]">
                  القاعدة في القيد المزدوج:
                </span>
                <span className="font-bold text-[#2563EB]">
                  {customGroupObj.normalBalance === 'debit'
                    ? 'يزيد مديناً وينقص دائناً'
                    : 'يزيد دائناً وينقص مديناً'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-[#E3E8F0] pt-2 dark:border-[#1E325C]">
                <span className="inline-flex items-center gap-1 text-[#526077] dark:text-[#94A3B8]">
                  <ArrowLeft className="h-3.5 w-3.5 text-[#22C55E]" />
                  <span>المخرج النهائي:</span>
                </span>
                <span className="font-semibold text-[#16A34A] dark:text-[#22C55E]">
                  {customGroupObj.statementTarget}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
