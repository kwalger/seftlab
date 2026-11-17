'use client';

import React, { useMemo, useState } from 'react';
import { formatFilsShort, getCategoryLabelAr, AccountCategory } from '@/lib/labs/accounting/accounts';
import {
  JournalEntry,
  generateTrialBalance,
  postEntriesToLedger,
} from '@/lib/labs/accounting/engine';
import { cn } from '@/lib/utils';

interface TAccountsViewProps {
  entries: JournalEntry[];
  highlightAccountIds?: string[];
  showTrialBalanceToggle?: boolean;
}

export function TAccountsView({
  entries,
  highlightAccountIds = [],
  showTrialBalanceToggle = true,
}: TAccountsViewProps) {
  const [viewMode, setViewMode] = useState<'t-accounts' | 'trial-balance'>('t-accounts');

  const ledger = useMemo(() => postEntriesToLedger(entries), [entries]);
  const accountsList = useMemo(
    () =>
      Object.values(ledger).sort((a, b) =>
        a.accountCode.localeCompare(b.accountCode)
      ),
    [ledger]
  );
  const trialBalance = useMemo(() => generateTrialBalance(ledger), [ledger]);

  return (
    <div className="space-y-4">
      {showTrialBalanceToggle && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
            دفتر الأستاذ العام وميزان المراجعة اللحظي
          </h3>
          <div className="inline-flex rounded-[10px] border border-[#E3E8F0] bg-[#F1F4F9] p-1 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <button
              type="button"
              onClick={() => setViewMode('t-accounts')}
              className={cn(
                'rounded-[8px] px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 't-accounts'
                  ? 'bg-white text-[#2F6BFF] shadow-xs dark:bg-[#0A1630]'
                  : 'text-[#526077] dark:text-[#94A3B8]'
              )}
            >
              حسابات T ({accountsList.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('trial-balance')}
              className={cn(
                'rounded-[8px] px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'trial-balance'
                  ? 'bg-white text-[#2F6BFF] shadow-xs dark:bg-[#0A1630]'
                  : 'text-[#526077] dark:text-[#94A3B8]'
              )}
            >
              ميزان المراجعة
            </button>
          </div>
        </div>
      )}

      {accountsList.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[#E3E8F0] p-6 text-center text-xs text-[#526077] dark:border-[#1E325C] dark:text-[#94A3B8]">
          لا توجد قيود مرحّلة بعد. سجّل قيداً ليظهر فوراً في حسابات الأستاذ.
        </div>
      ) : viewMode === 't-accounts' ? (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {accountsList.map((acct) => {
            const isHighlighted = highlightAccountIds.includes(acct.accountId);
            return (
              <div
                key={acct.accountId}
                className={cn(
                  'rounded-[14px] border bg-white p-3.5 transition-all duration-300 dark:bg-[#0A1630]',
                  isHighlighted
                    ? 'border-[#2F6BFF] ring-2 ring-[#2F6BFF]/20'
                    : 'border-[#E3E8F0] dark:border-[#1E325C]'
                )}
              >
                {/* رأس حساب T */}
                <div className="flex items-center justify-between gap-2 border-b-2 border-[#0A1630] pb-2 dark:border-[#94A3B8]">
                  <div className="min-w-0">
                    <span className="font-tabular text-[11px] font-semibold text-[#2F6BFF]">
                      {acct.accountCode} ·{' '}
                      {getCategoryLabelAr(acct.category as AccountCategory)}
                    </span>
                    <h4 className="truncate text-xs font-bold text-[#0A1630] sm:text-sm dark:text-[#FAFBFC]">
                      حـ/ {acct.accountNameAr}
                    </h4>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-[8px] px-2 py-0.5 font-tabular text-[11px] font-semibold',
                      acct.balanceSide === 'debit'
                        ? 'bg-[#2F6BFF]/12 text-[#2F6BFF]'
                        : acct.balanceSide === 'credit'
                        ? 'bg-[#22C55E]/12 text-[#16A34A] dark:text-[#22C55E]'
                        : 'bg-[#F1F4F9] text-[#64748B]'
                    )}
                  >
                    {acct.balanceSide === 'zero'
                      ? 'مرصد (0)'
                      : `رصيد ${acct.balanceSide === 'debit' ? 'مدين' : 'دائن'}: ${formatFilsShort(acct.balanceFils)}`}
                  </span>
                </div>

                {/* جسم حرف T: يمين مدين | يسار دائن */}
                <div className="grid grid-cols-2 divide-x divide-x-reverse divide-[#0A1630] pt-2 text-xs dark:divide-[#94A3B8]">
                  {/* جانب منه (مدين) */}
                  <div className="pl-2.5">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-[#2F6BFF]">
                      <span>منه (مدين)</span>
                      <span className="font-tabular">
                        {formatFilsShort(acct.totalDebitFils)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {acct.debitPostings.length === 0 ? (
                        <span className="block py-1 text-[11px] text-[#94A3B8]">
                          —
                        </span>
                      ) : (
                        acct.debitPostings.map((p, idx) => (
                          <div
                            key={`${p.entryId}-${idx}`}
                            className="flex items-center justify-between gap-1 rounded bg-[#F8FAFC] px-2 py-1 text-[11px] dark:bg-[#070D1F]"
                          >
                            <span className="truncate text-[#526077] dark:text-[#94A3B8]">
                              {p.description}
                            </span>
                            <span className="font-tabular shrink-0 font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                              {formatFilsShort(p.amountFils)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* جانب له (دائن) */}
                  <div className="pr-2.5">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-[#16A34A] dark:text-[#22C55E]">
                      <span>له (دائن)</span>
                      <span className="font-tabular">
                        {formatFilsShort(acct.totalCreditFils)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {acct.creditPostings.length === 0 ? (
                        <span className="block py-1 text-[11px] text-[#94A3B8]">
                          —
                        </span>
                      ) : (
                        acct.creditPostings.map((p, idx) => (
                          <div
                            key={`${p.entryId}-${idx}`}
                            className="flex items-center justify-between gap-1 rounded bg-[#F8FAFC] px-2 py-1 text-[11px] dark:bg-[#070D1F]"
                          >
                            <span className="truncate text-[#526077] dark:text-[#94A3B8]">
                              {p.description}
                            </span>
                            <span className="font-tabular shrink-0 font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                              {formatFilsShort(p.amountFils)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-[#E3E8F0] bg-white dark:border-[#1E325C] dark:bg-[#0A1630]">
          <table className="w-full border-collapse text-right text-xs">
            <thead>
              <tr className="border-b border-[#E3E8F0] bg-[#F8FAFC] text-[#526077] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#94A3B8]">
                <th className="px-3.5 py-3 font-medium">الرمز</th>
                <th className="px-3.5 py-3 font-medium">اسم الحساب</th>
                <th className="px-3.5 py-3 font-medium">الأرصدة المدينة</th>
                <th className="px-3.5 py-3 font-medium">الأرصدة الدائنة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8F0] dark:divide-[#1E325C]">
              {trialBalance.rows.map((row) => (
                <tr key={row.accountId}>
                  <td className="px-3.5 py-2.5 font-tabular text-[#2F6BFF]">
                    {row.accountCode}
                  </td>
                  <td className="px-3.5 py-2.5 font-medium text-[#0A1630] dark:text-[#FAFBFC]">
                    {row.accountNameAr}
                  </td>
                  <td className="px-3.5 py-2.5 font-tabular text-[#0A1630] dark:text-[#FAFBFC]">
                    {row.debitBalanceFils > 0
                      ? formatFilsShort(row.debitBalanceFils)
                      : '—'}
                  </td>
                  <td className="px-3.5 py-2.5 font-tabular text-[#0A1630] dark:text-[#FAFBFC]">
                    {row.creditBalanceFils > 0
                      ? formatFilsShort(row.creditBalanceFils)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#0A1630] bg-[#F1F4F9] font-bold dark:border-[#94A3B8] dark:bg-[#070D1F]">
                <td colSpan={2} className="px-3.5 py-3">
                  الإجمالي ({trialBalance.isBalanced ? 'متوازن' : 'غير متوازن'})
                </td>
                <td className="px-3.5 py-3 font-tabular text-[#2F6BFF]">
                  {formatFilsShort(trialBalance.totalDebitBalanceFils)}
                </td>
                <td className="px-3.5 py-3 font-tabular text-[#22C55E]">
                  {formatFilsShort(trialBalance.totalCreditBalanceFils)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
