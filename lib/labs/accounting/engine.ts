import {
  CHART_OF_ACCOUNTS,
  Fils,
  NormalBalance,
  filsToJod,
  formatFilsShort,
  getAccountById,
} from './accounts';

export interface JournalLine {
  accountId: string;
  side: 'debit' | 'credit';
  amountFils: Fils;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  lines: JournalLine[];
}

export interface JournalValidationResult {
  isValid: boolean;
  totalDebitFils: Fils;
  totalCreditFils: Fils;
  differenceFils: Fils;
  errors: string[];
}

export interface TAccountPosting {
  entryId: string;
  date: string;
  description: string;
  side: 'debit' | 'credit';
  amountFils: Fils;
}

export interface TAccountLedger {
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  category: string;
  normalBalance: NormalBalance;
  debitPostings: TAccountPosting[];
  creditPostings: TAccountPosting[];
  totalDebitFils: Fils;
  totalCreditFils: Fils;
  balanceFils: Fils;
  balanceSide: 'debit' | 'credit' | 'zero';
}

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  category: string;
  totalDebitFils: Fils;
  totalCreditFils: Fils;
  debitBalanceFils: Fils;
  creditBalanceFils: Fils;
}

export interface TrialBalance {
  rows: TrialBalanceRow[];
  totalDebitTurnoverFils: Fils;
  totalCreditTurnoverFils: Fils;
  totalDebitBalanceFils: Fils;
  totalCreditBalanceFils: Fils;
  isBalanced: boolean;
  differenceFils: Fils;
}

export interface TrialBalanceErrorHint {
  differenceFils: Fils;
  possibleCauses: string[];
}

export function validateJournalEntry(entry: JournalEntry): JournalValidationResult {
  const errors: string[] = [];

  if (!entry.lines || entry.lines.length === 0) {
    return {
      isValid: false,
      totalDebitFils: 0,
      totalCreditFils: 0,
      differenceFils: 0,
      errors: ['لا يمكن تسجيل قيد يومية فارغ بدون أطراف مدينة ودائنة.'],
    };
  }

  const debitLines = entry.lines.filter((l) => l.side === 'debit');
  const creditLines = entry.lines.filter((l) => l.side === 'credit');

  if (debitLines.length === 0) {
    errors.push('يجب أن يحتوي القيد على حساب واحد على الأقل في الطرف المدين.');
  }
  if (creditLines.length === 0) {
    errors.push('يجب أن يحتوي القيد على حساب واحد على الأقل في الطرف الدائن.');
  }

  let totalDebitFils = 0;
  let totalCreditFils = 0;
  const debitAccounts = new Set<string>();
  const creditAccounts = new Set<string>();

  for (const line of entry.lines) {
    const acc = getAccountById(line.accountId);
    if (!acc) {
      errors.push(`الحساب "${line.accountId}" غير معرف في دليل الحسابات.`);
    }

    if (!Number.isFinite(line.amountFils) || line.amountFils <= 0) {
      errors.push(
        `المبلغ للحساب "${acc?.nameAr || line.accountId}" يجب أن يكون أكبر من صفر ولا يقبل القيم السالبة.`
      );
    }

    const safeAmount = Math.max(0, Math.round(line.amountFils || 0));
    if (line.side === 'debit') {
      totalDebitFils += safeAmount;
      debitAccounts.add(line.accountId);
    } else {
      totalCreditFils += safeAmount;
      creditAccounts.add(line.accountId);
    }
  }

  for (const accId of debitAccounts) {
    if (creditAccounts.has(accId)) {
      const accName = getAccountById(accId)?.nameAr || accId;
      errors.push(
        `لا يجوز تكرار الحساب "${accName}" في الطرفين المدين والدائن ضمن القيد نفسه.`
      );
    }
  }

  const differenceFils = Math.abs(totalDebitFils - totalCreditFils);
  if (totalDebitFils !== totalCreditFils) {
    errors.push(
      `القيد غير متوازن: مجموع المدين (${formatFilsShort(totalDebitFils)}) لا يساوي مجموع الدائن (${formatFilsShort(totalCreditFils)})، والفرق هو ${formatFilsShort(differenceFils)}.`
    );
  }

  return {
    isValid: errors.length === 0,
    totalDebitFils,
    totalCreditFils,
    differenceFils,
    errors,
  };
}

export function postEntriesToLedger(
  entries: JournalEntry[],
  openingBalancesFils?: Record<string, { side: 'debit' | 'credit'; amountFils: Fils }>
): Record<string, TAccountLedger> {
  const ledger: Record<string, TAccountLedger> = {};

  const ensureAccount = (accountId: string): TAccountLedger => {
    if (!ledger[accountId]) {
      const def = getAccountById(accountId) || CHART_OF_ACCOUNTS[0];
      ledger[accountId] = {
        accountId,
        accountCode: def?.code || '9999',
        accountNameAr: def?.nameAr || accountId,
        category: def?.category || 'asset',
        normalBalance: def?.normalBalance || 'debit',
        debitPostings: [],
        creditPostings: [],
        totalDebitFils: 0,
        totalCreditFils: 0,
        balanceFils: 0,
        balanceSide: 'zero',
      };
    }
    return ledger[accountId];
  };

  if (openingBalancesFils) {
    for (const [accountId, opening] of Object.entries(openingBalancesFils)) {
      if (opening.amountFils <= 0) continue;
      const acct = ensureAccount(accountId);
      const safeAmt = Math.round(opening.amountFils);
      const posting: TAccountPosting = {
        entryId: 'opening-balance',
        date: 'رصيد افتتاحي',
        description: 'رصيد أول المدة',
        side: opening.side,
        amountFils: safeAmt,
      };
      if (opening.side === 'debit') {
        acct.debitPostings.push(posting);
        acct.totalDebitFils += safeAmt;
      } else {
        acct.creditPostings.push(posting);
        acct.totalCreditFils += safeAmt;
      }
    }
  }

  for (const entry of entries) {
    const validation = validateJournalEntry(entry);
    if (!validation.isValid) continue;

    for (const line of entry.lines) {
      const acct = ensureAccount(line.accountId);
      const safeAmt = Math.round(line.amountFils);
      const posting: TAccountPosting = {
        entryId: entry.id,
        date: entry.date,
        description: entry.description,
        side: line.side,
        amountFils: safeAmt,
      };
      if (line.side === 'debit') {
        acct.debitPostings.push(posting);
        acct.totalDebitFils += safeAmt;
      } else {
        acct.creditPostings.push(posting);
        acct.totalCreditFils += safeAmt;
      }
    }
  }

  for (const acct of Object.values(ledger)) {
    const diff = acct.totalDebitFils - acct.totalCreditFils;
    if (diff > 0) {
      acct.balanceFils = diff;
      acct.balanceSide = 'debit';
    } else if (diff < 0) {
      acct.balanceFils = Math.abs(diff);
      acct.balanceSide = 'credit';
    } else {
      acct.balanceFils = 0;
      acct.balanceSide = 'zero';
    }
  }

  return ledger;
}

export function generateTrialBalance(
  ledger: Record<string, TAccountLedger>
): TrialBalance {
  const rows: TrialBalanceRow[] = Object.values(ledger)
    .sort((a, b) => a.accountCode.localeCompare(b.accountCode))
    .map((acct) => ({
      accountId: acct.accountId,
      accountCode: acct.accountCode,
      accountNameAr: acct.accountNameAr,
      category: acct.category,
      totalDebitFils: acct.totalDebitFils,
      totalCreditFils: acct.totalCreditFils,
      debitBalanceFils: acct.balanceSide === 'debit' ? acct.balanceFils : 0,
      creditBalanceFils: acct.balanceSide === 'credit' ? acct.balanceFils : 0,
    }));

  const totalDebitTurnoverFils = rows.reduce((s, r) => s + r.totalDebitFils, 0);
  const totalCreditTurnoverFils = rows.reduce((s, r) => s + r.totalCreditFils, 0);
  const totalDebitBalanceFils = rows.reduce((s, r) => s + r.debitBalanceFils, 0);
  const totalCreditBalanceFils = rows.reduce((s, r) => s + r.creditBalanceFils, 0);

  const differenceFils = Math.abs(totalDebitBalanceFils - totalCreditBalanceFils);
  const isBalanced =
    totalDebitBalanceFils === totalCreditBalanceFils &&
    totalDebitTurnoverFils === totalCreditTurnoverFils;

  return {
    rows,
    totalDebitTurnoverFils,
    totalCreditTurnoverFils,
    totalDebitBalanceFils,
    totalCreditBalanceFils,
    isBalanced,
    differenceFils,
  };
}

export function analyzeTrialBalanceError(diffFils: Fils): TrialBalanceErrorHint {
  const absDiff = Math.abs(Math.round(diffFils));
  const possibleCauses: string[] = [];

  if (absDiff === 0) {
    return {
      differenceFils: 0,
      possibleCauses: ['ميزان المراجعة متوازن تماماً ولا يوجد فرق بين الجانبين.'],
    };
  }

  // التحويل للدينار الصحيح إذا كان مضاعف 1000 أو بالفلس
  const absJodUnits = absDiff % 1000 === 0 ? absDiff / 1000 : absDiff;

  if (absDiff % 2 === 0) {
    const half = absDiff / 2;
    possibleCauses.push(
      `الفرق يقبل القسمة على 2: قد يكون مبلغ ${formatFilsShort(half)} قد رُحِّل إلى الجانب العكسي (مدين بدلاً من دائن أو العكس) مما ضاعف الفرق.`
    );
  }

  if (absJodUnits % 9 === 0) {
    possibleCauses.push(
      'الفرق يقبل القسمة على 9: يُحتمل وجود خطأ تبديل أرقام متجاورة (مثل كتابة 540 بدلاً من 450) أو إزاحة خانة عشرية/صفرية (مثل 500 بدلاً من 50).'
    );
  }

  possibleCauses.push(
    `الفرق يساوي ${formatFilsShort(absDiff)}: ابحث في دفتر اليومية والأستاذ عن عملية بهذا المبلغ لم يُرحَّل أحد طرفيها، أو راجع جمع أعمدة الميزان.`
  );

  return {
    differenceFils: absDiff,
    possibleCauses,
  };
}

export interface AccountingEquationTotalsFils {
  assetsFils: Fils;
  liabilitiesFils: Fils;
  capitalNetFils: Fils;
  revenuesNetFils: Fils;
  expensesNetFils: Fils;
  drawingsFils: Fils;
  equityTotalFils: Fils;
  isBalanced: boolean;
}

export function computeEquationTotalsFromLedger(
  ledger: Record<string, TAccountLedger>
): AccountingEquationTotalsFils {
  let assetsFils = 0;
  let liabilitiesFils = 0;
  let capitalNetFils = 0;
  let drawingsFils = 0;
  let revenuesNetFils = 0;
  let expensesNetFils = 0;

  for (const acct of Object.values(ledger)) {
    const def = getAccountById(acct.accountId);
    if (!def) continue;
    const debitMinusCredit = acct.totalDebitFils - acct.totalCreditFils;
    const creditMinusDebit = acct.totalCreditFils - acct.totalDebitFils;

    switch (def.category) {
      case 'asset':
        assetsFils += debitMinusCredit;
        break;
      case 'liability':
        liabilitiesFils += creditMinusDebit;
        break;
      case 'equity':
        if (def.id === 'drawings') {
          drawingsFils += debitMinusCredit;
        } else {
          capitalNetFils += creditMinusDebit;
        }
        break;
      case 'revenue':
        // إيرادات صافية (المبيعات والخدمات - المردودات - الخصم المسموح به)
        revenuesNetFils += creditMinusDebit;
        break;
      case 'expense':
        // مصروفات ومشتريات صافية (المشتريات والمصاريف - المردودات - الخصم المكتسب)
        expensesNetFils += debitMinusCredit;
        break;
    }
  }

  const equityTotalFils =
    capitalNetFils + revenuesNetFils - expensesNetFils - drawingsFils;

  return {
    assetsFils,
    liabilitiesFils,
    capitalNetFils,
    revenuesNetFils,
    expensesNetFils,
    drawingsFils,
    equityTotalFils,
    isBalanced: assetsFils === liabilitiesFils + equityTotalFils,
  };
}

export function calculateVirtualCompanyDeltasFromEntries(entries: JournalEntry[]): {
  assetsDeltaJod: number;
  liabilitiesDeltaJod: number;
  equityDeltaJod: number;
  capitalDeltaJod: number;
  revenueDeltaJod: number;
  expensesDeltaJod: number;
  netProfitDeltaJod: number;
} {
  const ledger = postEntriesToLedger(entries);
  const totals = computeEquationTotalsFromLedger(ledger);

  const revenueDeltaJod = Math.round(filsToJod(totals.revenuesNetFils));
  const expensesDeltaJod = Math.round(filsToJod(totals.expensesNetFils));

  return {
    assetsDeltaJod: Math.round(filsToJod(totals.assetsFils)),
    liabilitiesDeltaJod: Math.round(filsToJod(totals.liabilitiesFils)),
    equityDeltaJod: Math.round(filsToJod(totals.equityTotalFils)),
    capitalDeltaJod: Math.round(filsToJod(totals.capitalNetFils)),
    revenueDeltaJod,
    expensesDeltaJod,
    netProfitDeltaJod: revenueDeltaJod - expensesDeltaJod,
  };
}
