'use client';

import React, { useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import {
  AccountCategory,
  CHART_OF_ACCOUNTS,
  filsToJod,
  formatFilsShort,
  getAccountById,
  getCategoryLabelAr,
  getNormalBalanceLabelAr,
  parseJodInputToFils,
  searchAccounts,
} from '@/lib/labs/accounting/accounts';
import {
  JournalEntry,
  JournalLine,
  validateJournalEntry,
} from '@/lib/labs/accounting/engine';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DraftLine {
  id: string;
  accountId: string;
  side: 'debit' | 'credit';
  amountJodStr: string;
}

interface JournalEntryBuilderProps {
  title?: string;
  submitLabel?: string;
  initialDescription?: string;
  initialDate?: string;
  suggestedAmountFils?: number;
  openInMobileSheet?: boolean;
  disabled?: boolean;
  onSubmitEntry: (entry: JournalEntry) => void;
}

export function JournalEntryBuilder({
  title = 'منشئ قيد اليومية المزدوج',
  submitLabel = 'ترحيل القيد إلى الدفاتر',
  initialDescription = '',
  initialDate = '2026-11-14',
  suggestedAmountFils,
  openInMobileSheet = true,
  disabled = false,
  onSubmitEntry,
}: JournalEntryBuilderProps) {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const defaultAmtStr = suggestedAmountFils
    ? String(filsToJod(suggestedAmountFils))
    : '';

  const [date, setDate] = useState(initialDate);
  const [description, setDescription] = useState(initialDescription);
  const [lines, setLines] = useState<DraftLine[]>([
    { id: 'dl-1', accountId: 'cash', side: 'debit', amountJodStr: defaultAmtStr },
    { id: 'cl-1', accountId: 'capital', side: 'credit', amountJodStr: defaultAmtStr },
  ]);

  // منتقي الحساب بالبحث
  const [pickerLineId, setPickerLineId] = useState<string | null>(null);
  const [accountSearch, setAccountSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AccountCategory | 'all'>('all');

  const filteredAccounts = useMemo(
    () => searchAccounts(accountSearch, categoryFilter),
    [accountSearch, categoryFilter]
  );

  const compiledEntry: JournalEntry = useMemo(() => {
    const builtLines: JournalLine[] = lines.map((l) => ({
      accountId: l.accountId,
      side: l.side,
      amountFils: parseJodInputToFils(l.amountJodStr),
    }));
    return {
      id: 'je-draft',
      date: date || '2026-11-14',
      description: description.trim() || 'عملية مالية مسجلة',
      lines: builtLines,
    };
  }, [lines, date, description]);

  const validation = useMemo(
    () => validateJournalEntry(compiledEntry),
    [compiledEntry]
  );

  const debitLines = lines.filter((l) => l.side === 'debit');
  const creditLines = lines.filter((l) => l.side === 'credit');

  const addLine = (side: 'debit' | 'credit') => {
    const defaultAccount = side === 'debit' ? 'cash' : 'accounts_payable';
    setLines((prev) => [
      ...prev,
      {
        id: `${side}-${Date.now()}-${prev.length}`,
        accountId: defaultAccount,
        side,
        amountJodStr: '',
      },
    ]);
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, patch: Partial<DraftLine>) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  };

  const handleConfirmSubmit = () => {
    if (!validation.isValid || disabled) return;
    onSubmitEntry({
      ...compiledEntry,
      id: `je-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });
    setSheetOpen(false);
  };

  const renderAccountSelectorModal = () => {
    if (!pickerLineId) return null;
    const activeLine = lines.find((l) => l.id === pickerLineId);
    if (!activeLine) return null;

    return (
      <div className="mt-3 rounded-[14px] border border-[#2F6BFF]/40 bg-[#F8FAFC] p-3.5 dark:border-[#2F6BFF]/40 dark:bg-[#070D1F]">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
            اختر الحساب ({activeLine.side === 'debit' ? 'الطرف المدين' : 'الطرف الدائن'})
          </span>
          <button
            type="button"
            onClick={() => {
              setPickerLineId(null);
              setAccountSearch('');
            }}
            className="text-xs font-medium text-[#2F6BFF] hover:underline"
          >
            إغلاق البحث
          </button>
        </div>

        <div className="relative mb-2.5">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <Input
            value={accountSearch}
            onChange={(e) => setAccountSearch(e.target.value)}
            placeholder="ابحث باسم الحساب أو رقمه (مثال: الصندوق، البنك، الدائنون)..."
            className="h-10 pr-9 text-xs"
            autoFocus
          />
        </div>

        <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
          {(
            [
              { id: 'all', label: 'الكل' },
              { id: 'asset', label: 'الأصول' },
              { id: 'liability', label: 'الالتزامات' },
              { id: 'equity', label: 'الملكية' },
              { id: 'revenue', label: 'الإيرادات' },
              { id: 'expense', label: 'المصروفات' },
            ] as { id: AccountCategory | 'all'; label: string }[]
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                'shrink-0 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                categoryFilter === cat.id
                  ? 'bg-[#2F6BFF] text-white'
                  : 'border border-[#E3E8F0] bg-white text-[#526077] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#94A3B8]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="max-h-52 space-y-1.5 overflow-y-auto">
          {filteredAccounts.length === 0 ? (
            <p className="py-4 text-center text-xs text-[#64748B]">
              لا يوجد حساب مطابق لبحثك.
            </p>
          ) : (
            filteredAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  updateLine(activeLine.id, { accountId: acc.id });
                  setPickerLineId(null);
                  setAccountSearch('');
                }}
                className={cn(
                  'flex min-h-[44px] w-full items-center justify-between gap-2 rounded-[10px] border px-3 py-2 text-right text-xs transition-colors',
                  activeLine.accountId === acc.id
                    ? 'border-[#2F6BFF] bg-[#2F6BFF]/10'
                    : 'border-[#E3E8F0] bg-white hover:border-[#2F6BFF]/50 dark:border-[#1E325C] dark:bg-[#0A1630]'
                )}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                    <span className="font-tabular ml-1.5 text-[#2F6BFF]">
                      {acc.code}
                    </span>
                    {acc.nameAr}
                  </p>
                  <p className="truncate text-[11px] text-[#526077] dark:text-[#94A3B8]">
                    {getCategoryLabelAr(acc.category)} · طبيعته:{' '}
                    {getNormalBalanceLabelAr(acc.normalBalance)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderSideColumn = (side: 'debit' | 'credit', sideLines: DraftLine[]) => {
    const isDebit = side === 'debit';
    return (
      <div
        className={cn(
          'space-y-3 rounded-[14px] border p-3.5',
          isDebit
            ? 'border-[#2F6BFF]/30 bg-[#2F6BFF]/[0.03]'
            : 'border-[#22C55E]/30 bg-[#22C55E]/[0.03]'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4
              className={cn(
                'text-xs font-bold',
                isDebit ? 'text-[#2F6BFF]' : 'text-[#16A34A] dark:text-[#22C55E]'
              )}
            >
              {isDebit ? 'الطرف المدين (من حـ/)' : 'الطرف الدائن (إلى حـ/)'}
            </h4>
            <p className="font-tabular text-[11px] text-[#526077] dark:text-[#94A3B8]">
              المجموع:{' '}
              {formatFilsShort(
                isDebit ? validation.totalDebitFils : validation.totalCreditFils
              )}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addLine(side)}
            className="h-9 gap-1 px-2.5 text-[11px]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>إضافة طرف</span>
          </Button>
        </div>

        <div className="space-y-2.5">
          {sideLines.map((line) => {
            const acc = getAccountById(line.accountId) || CHART_OF_ACCOUNTS[0];
            return (
              <div
                key={line.id}
                className="space-y-2 rounded-[12px] border border-[#E3E8F0] bg-white p-3 dark:border-[#1E325C] dark:bg-[#0A1630]"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPickerLineId(pickerLineId === line.id ? null : line.id)
                    }
                    className="flex min-h-[44px] flex-1 items-center justify-between gap-2 rounded-[10px] border border-[#E3E8F0] bg-[#FAFBFC] px-3 py-2 text-right text-xs font-medium text-[#0A1630] hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]"
                  >
                    <span className="truncate">
                      <span className="font-tabular ml-1.5 text-[#2F6BFF]">
                        {acc.code}
                      </span>
                      {acc.nameAr}
                    </span>
                    <span className="shrink-0 text-[11px] text-[#2F6BFF]">
                      تغيير
                    </span>
                  </button>

                  {sideLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      aria-label="حذف السطر"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#E3E8F0] text-[#64748B] hover:border-red-400 hover:text-red-500 dark:border-[#1E325C]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-[11px] text-[#526077] dark:text-[#94A3B8]">
                    المبلغ (دينار أردني)
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.001"
                    min="0"
                    dir="ltr"
                    placeholder="0.000"
                    value={line.amountJodStr}
                    onChange={(e) =>
                      updateLine(line.id, { amountJodStr: e.target.value })
                    }
                    className="h-12 font-tabular text-base font-bold text-left"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const builderBody = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-[#526077] dark:text-[#94A3B8]">
            البيان (وصف العملية)
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مثال: إيداع رأس مال نقدي في الصندوق..."
            className="h-10 text-xs"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#526077] dark:text-[#94A3B8]">
            تاريخ القيد
          </label>
          <Input
            type="date"
            dir="ltr"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 font-tabular text-xs"
          />
        </div>
      </div>

      {/* المدين والدائن جنباً إلى جنب */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderSideColumn('debit', debitLines)}
        {renderSideColumn('credit', creditLines)}
      </div>

      {renderAccountSelectorModal()}

      {/* مؤشر التوازن اللحظي */}
      <div
        className={cn(
          'rounded-[12px] border p-3.5 text-xs',
          validation.isValid
            ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#0A1630] dark:text-[#FAFBFC]'
            : 'border-amber-500/40 bg-amber-500/10 text-[#0A1630] dark:text-[#FAFBFC]'
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold">
            {validation.isValid ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                <span>القيد متوازن وجاهز للترحيل</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>تحقق من توازن وصحة القيد</span>
              </>
            )}
          </div>
          <div className="font-tabular text-xs font-semibold">
            المدين: {formatFilsShort(validation.totalDebitFils)} | الدائن:{' '}
            {formatFilsShort(validation.totalCreditFils)}
          </div>
        </div>

        {!validation.isValid && validation.errors.length > 0 && (
          <ul className="mt-2 space-y-1 text-[11px] text-red-700 dark:text-red-300">
            {validation.errors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        )}
      </div>

      <Button
        type="button"
        disabled={!validation.isValid || disabled}
        onClick={handleConfirmSubmit}
        className="min-h-[46px] w-full text-sm font-semibold"
      >
        {submitLabel}
      </Button>
    </div>
  );

  if (openInMobileSheet && isMobile) {
    return (
      <div className="rounded-[16px] border border-[#E3E8F0] bg-white p-4 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
              {title}
            </h3>
            <p className="font-tabular text-xs text-[#526077] dark:text-[#94A3B8]">
              المدين: {formatFilsShort(validation.totalDebitFils)} · الدائن:{' '}
              {formatFilsShort(validation.totalCreditFils)}
            </p>
          </div>
          <span
            className={cn(
              'rounded-[8px] px-2 py-1 text-[11px] font-medium',
              validation.isValid
                ? 'bg-[#22C55E]/15 text-[#22C55E]'
                : 'bg-amber-500/15 text-amber-600'
            )}
          >
            {validation.isValid ? 'متوازن' : 'غير مكتمل'}
          </span>
        </div>

        <Button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mt-3 min-h-[46px] w-full gap-2 text-xs font-semibold"
        >
          <BookOpen className="h-4 w-4" />
          <span>فتح منشئ القيد المزدوج</span>
        </Button>

        <BottomSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title={title}
          description="اختر الحسابات وأدخل المبالغ ثم رحّل القيد"
        >
          {builderBody}
        </BottomSheet>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-[#E3E8F0] pb-3 dark:border-[#1E325C]">
        <h3 className="text-sm font-semibold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
          {title}
        </h3>
        <span className="font-tabular text-[11px] font-medium text-[#2F6BFF]">
          مدين = دائن
        </span>
      </div>
      {builderBody}
    </div>
  );
}
