import { Fils, getAccountById } from './accounts';
import { JournalEntry, TrialBalance } from './engine';

export interface StatementLineItem {
  accountId?: string;
  label: string;
  amountFils: Fils;
  isSubtraction?: boolean;
  isSubtotal?: boolean;
}

export interface IncomeStatement {
  salesRevenueFils: Fils;
  salesReturnsFils: Fils;
  salesDiscountFils: Fils;
  netSalesFils: Fils;
  serviceRevenueFils: Fils;
  totalOperatingRevenueFils: Fils;
  beginningInventoryFils: Fils;
  purchasesFils: Fils;
  freightInFils: Fils;
  purchaseReturnsFils: Fils;
  purchaseDiscountFils: Fils;
  netPurchasesFils: Fils;
  goodsAvailableForSaleFils: Fils;
  endingInventoryFils: Fils;
  directCogsFils: Fils;
  costOfGoodsSoldFils: Fils;
  grossProfitFils: Fils;
  operatingExpenses: StatementLineItem[];
  totalOperatingExpensesFils: Fils;
  operatingIncomeFils: Fils;
  otherRevenueFils: Fils;
  financingExpenseFils: Fils;
  netIncomeFils: Fils;
}

export interface OwnersEquityStatement {
  beginningCapitalFils: Fils;
  additionalInvestmentsFils: Fils;
  netIncomeFils: Fils;
  drawingsFils: Fils;
  endingEquityFils: Fils;
}

export interface BalanceSheet {
  currentAssets: StatementLineItem[];
  totalCurrentAssetsFils: Fils;
  fixedAssets: StatementLineItem[];
  totalFixedAssetsFils: Fils;
  totalAssetsFils: Fils;
  currentLiabilities: StatementLineItem[];
  totalCurrentLiabilitiesFils: Fils;
  longTermLiabilities: StatementLineItem[];
  totalLongTermLiabilitiesFils: Fils;
  totalLiabilitiesFils: Fils;
  endingEquityFils: Fils;
  totalLiabilitiesAndEquityFils: Fils;
  isBalanced: boolean;
  differenceFils: Fils;
}

export interface SimplifiedCashFlowStatement {
  operatingInflowsFils: Fils;
  operatingOutflowsFils: Fils;
  netOperatingCashFlowFils: Fils;
  investingInflowsFils: Fils;
  investingOutflowsFils: Fils;
  netInvestingCashFlowFils: Fils;
  financingInflowsFils: Fils;
  financingOutflowsFils: Fils;
  netFinancingCashFlowFils: Fils;
  netChangeInCashFils: Fils;
  beginningCashFils: Fils;
  endingCashFils: Fils;
}

export interface ArticulationCheck {
  id: string;
  title: string;
  passed: boolean;
  expectedFils: Fils;
  actualFils: Fils;
  descriptionAr: string;
}

export interface FinancialStatementsBundle {
  incomeStatement: IncomeStatement;
  ownersEquityStatement: OwnersEquityStatement;
  balanceSheet: BalanceSheet;
  cashFlowStatement: SimplifiedCashFlowStatement;
  articulationChecks: ArticulationCheck[];
}

function getNetAccountAmount(
  tb: TrialBalance,
  accountId: string,
  expectedSide: 'debit' | 'credit'
): Fils {
  const row = tb.rows.find((r) => r.accountId === accountId);
  if (!row) return 0;
  return expectedSide === 'debit'
    ? row.debitBalanceFils - row.creditBalanceFils
    : row.creditBalanceFils - row.debitBalanceFils;
}

export function generateIncomeStatement(
  tb: TrialBalance,
  endingInventoryFils?: Fils
): IncomeStatement {
  const salesRevenueFils = getNetAccountAmount(tb, 'sales', 'credit');
  const salesReturnsFils = getNetAccountAmount(tb, 'sales_returns', 'debit');
  const salesDiscountFils = getNetAccountAmount(tb, 'sales_discount', 'debit');
  const netSalesFils = salesRevenueFils - salesReturnsFils - salesDiscountFils;
  const serviceRevenueFils = getNetAccountAmount(tb, 'service_revenue', 'credit');
  const totalOperatingRevenueFils = netSalesFils + serviceRevenueFils;

  const beginningInventoryFils = getNetAccountAmount(tb, 'inventory', 'debit');
  const purchasesFils = getNetAccountAmount(tb, 'purchases', 'debit');
  const freightInFils = getNetAccountAmount(tb, 'freight_in', 'debit');
  const purchaseReturnsFils = getNetAccountAmount(tb, 'purchase_returns', 'credit');
  const purchaseDiscountFils = getNetAccountAmount(tb, 'purchase_discount', 'credit');
  const netPurchasesFils =
    purchasesFils + freightInFils - purchaseReturnsFils - purchaseDiscountFils;

  const directCogsFils = getNetAccountAmount(tb, 'cogs', 'debit');
  const effectiveEndingInv =
    endingInventoryFils !== undefined ? Math.max(0, Math.round(endingInventoryFils)) : beginningInventoryFils;

  const usesPeriodic =
    purchasesFils > 0 ||
    freightInFils > 0 ||
    purchaseReturnsFils > 0 ||
    purchaseDiscountFils > 0 ||
    endingInventoryFils !== undefined;

  const goodsAvailableForSaleFils = usesPeriodic
    ? beginningInventoryFils + netPurchasesFils
    : 0;

  const costOfGoodsSoldFils = usesPeriodic
    ? goodsAvailableForSaleFils - effectiveEndingInv + directCogsFils
    : directCogsFils;

  const grossProfitFils = totalOperatingRevenueFils - costOfGoodsSoldFils;

  const operatingExpenses: StatementLineItem[] = [];
  let totalOperatingExpensesFils = 0;

  for (const row of tb.rows) {
    const def = getAccountById(row.accountId);
    if (!def || def.subCategory !== 'operating_expense') continue;
    const amt = row.debitBalanceFils - row.creditBalanceFils;
    if (amt === 0) continue;
    operatingExpenses.push({
      accountId: row.accountId,
      label: row.accountNameAr,
      amountFils: amt,
    });
    totalOperatingExpensesFils += amt;
  }

  const operatingIncomeFils = grossProfitFils - totalOperatingExpensesFils;
  const otherRevenueFils = getNetAccountAmount(tb, 'other_revenue', 'credit');
  const financingExpenseFils = getNetAccountAmount(tb, 'interest_expense', 'debit');

  const netIncomeFils =
    operatingIncomeFils + otherRevenueFils - financingExpenseFils;

  return {
    salesRevenueFils,
    salesReturnsFils,
    salesDiscountFils,
    netSalesFils,
    serviceRevenueFils,
    totalOperatingRevenueFils,
    beginningInventoryFils,
    purchasesFils,
    freightInFils,
    purchaseReturnsFils,
    purchaseDiscountFils,
    netPurchasesFils,
    goodsAvailableForSaleFils,
    endingInventoryFils: effectiveEndingInv,
    directCogsFils,
    costOfGoodsSoldFils,
    grossProfitFils,
    operatingExpenses,
    totalOperatingExpensesFils,
    operatingIncomeFils,
    otherRevenueFils,
    financingExpenseFils,
    netIncomeFils,
  };
}

export function generateOwnersEquityStatement(
  tb: TrialBalance,
  netIncomeFils: Fils,
  beginningCapitalFilsOverride?: Fils
): OwnersEquityStatement {
  const capitalTotal = getNetAccountAmount(tb, 'capital', 'credit');
  const beginningCapitalFils =
    beginningCapitalFilsOverride !== undefined
      ? beginningCapitalFilsOverride
      : capitalTotal;
  const additionalInvestmentsFils =
    beginningCapitalFilsOverride !== undefined
      ? capitalTotal - beginningCapitalFilsOverride
      : 0;
  const drawingsFils = getNetAccountAmount(tb, 'drawings', 'debit');
  const endingEquityFils =
    beginningCapitalFils + additionalInvestmentsFils + netIncomeFils - drawingsFils;

  return {
    beginningCapitalFils,
    additionalInvestmentsFils,
    netIncomeFils,
    drawingsFils,
    endingEquityFils,
  };
}

export function generateBalanceSheet(
  tb: TrialBalance,
  endingEquityFils: Fils,
  endingInventoryFils?: Fils
): BalanceSheet {
  const currentAssets: StatementLineItem[] = [];
  const fixedAssets: StatementLineItem[] = [];
  const currentLiabilities: StatementLineItem[] = [];
  const longTermLiabilities: StatementLineItem[] = [];

  let hasInventoryRow = false;

  for (const row of tb.rows) {
    const def = getAccountById(row.accountId);
    if (!def) continue;

    if (def.category === 'asset') {
      let amt = row.debitBalanceFils - row.creditBalanceFils;
      if (row.accountId === 'inventory') {
        hasInventoryRow = true;
        if (endingInventoryFils !== undefined) {
          amt = Math.max(0, Math.round(endingInventoryFils));
        }
      }
      if (amt === 0) continue;
      const item: StatementLineItem = {
        accountId: row.accountId,
        label: row.accountNameAr,
        amountFils: amt,
      };
      if (def.subCategory === 'current_asset') {
        currentAssets.push(item);
      } else {
        fixedAssets.push(item);
      }
    } else if (def.category === 'liability') {
      const amt = row.creditBalanceFils - row.debitBalanceFils;
      if (amt === 0) continue;
      const item: StatementLineItem = {
        accountId: row.accountId,
        label: row.accountNameAr,
        amountFils: amt,
      };
      if (def.subCategory === 'current_liability') {
        currentLiabilities.push(item);
      } else {
        longTermLiabilities.push(item);
      }
    }
  }

  if (!hasInventoryRow && endingInventoryFils !== undefined && endingInventoryFils > 0) {
    currentAssets.push({
      accountId: 'inventory',
      label: 'بضاعة آخر المدة',
      amountFils: Math.round(endingInventoryFils),
    });
  }

  const totalCurrentAssetsFils = currentAssets.reduce((s, i) => s + i.amountFils, 0);
  const totalFixedAssetsFils = fixedAssets.reduce((s, i) => s + i.amountFils, 0);
  const totalAssetsFils = totalCurrentAssetsFils + totalFixedAssetsFils;

  const totalCurrentLiabilitiesFils = currentLiabilities.reduce(
    (s, i) => s + i.amountFils,
    0
  );
  const totalLongTermLiabilitiesFils = longTermLiabilities.reduce(
    (s, i) => s + i.amountFils,
    0
  );
  const totalLiabilitiesFils =
    totalCurrentLiabilitiesFils + totalLongTermLiabilitiesFils;
  const totalLiabilitiesAndEquityFils = totalLiabilitiesFils + endingEquityFils;
  const differenceFils = Math.abs(totalAssetsFils - totalLiabilitiesAndEquityFils);

  return {
    currentAssets,
    totalCurrentAssetsFils,
    fixedAssets,
    totalFixedAssetsFils,
    totalAssetsFils,
    currentLiabilities,
    totalCurrentLiabilitiesFils,
    longTermLiabilities,
    totalLongTermLiabilitiesFils,
    totalLiabilitiesFils,
    endingEquityFils,
    totalLiabilitiesAndEquityFils,
    isBalanced: totalAssetsFils === totalLiabilitiesAndEquityFils,
    differenceFils,
  };
}

export function generateSimplifiedCashFlowStatement(
  entries: JournalEntry[],
  beginningCashFils = 0
): SimplifiedCashFlowStatement {
  let operatingInflowsFils = 0;
  let operatingOutflowsFils = 0;
  let investingInflowsFils = 0;
  let investingOutflowsFils = 0;
  let financingInflowsFils = 0;
  let financingOutflowsFils = 0;

  for (const entry of entries) {
    const cashLines = entry.lines.filter((l) => {
      const def = getAccountById(l.accountId);
      return Boolean(def?.isCashEquivalent);
    });
    if (cashLines.length === 0) continue;

    // إذا كان القيد كله تحويل بين الصندوق والبنك فلا يغير إجمالي النقدية
    const nonCashLines = entry.lines.filter((l) => {
      const def = getAccountById(l.accountId);
      return !def?.isCashEquivalent;
    });
    if (nonCashLines.length === 0) continue;

    const netCashDelta = cashLines.reduce(
      (sum, l) => sum + (l.side === 'debit' ? l.amountFils : -l.amountFils),
      0
    );
    if (netCashDelta === 0) continue;

    // تصنيف النشاط بناءً على الحساب المقابل الرئيسي
    const primaryCounter = nonCashLines[0];
    const counterDef = getAccountById(primaryCounter.accountId);

    const isFinancing =
      counterDef?.category === 'equity' ||
      counterDef?.subCategory === 'long_term_liability' ||
      counterDef?.subCategory === 'financing_expense';

    const isInvesting = counterDef?.subCategory === 'fixed_asset';

    if (isFinancing) {
      if (netCashDelta > 0) financingInflowsFils += netCashDelta;
      else financingOutflowsFils += Math.abs(netCashDelta);
    } else if (isInvesting) {
      if (netCashDelta > 0) investingInflowsFils += netCashDelta;
      else investingOutflowsFils += Math.abs(netCashDelta);
    } else {
      if (netCashDelta > 0) operatingInflowsFils += netCashDelta;
      else operatingOutflowsFils += Math.abs(netCashDelta);
    }
  }

  const netOperatingCashFlowFils = operatingInflowsFils - operatingOutflowsFils;
  const netInvestingCashFlowFils = investingInflowsFils - investingOutflowsFils;
  const netFinancingCashFlowFils = financingInflowsFils - financingOutflowsFils;
  const netChangeInCashFils =
    netOperatingCashFlowFils + netInvestingCashFlowFils + netFinancingCashFlowFils;

  return {
    operatingInflowsFils,
    operatingOutflowsFils,
    netOperatingCashFlowFils,
    investingInflowsFils,
    investingOutflowsFils,
    netInvestingCashFlowFils,
    financingInflowsFils,
    financingOutflowsFils,
    netFinancingCashFlowFils,
    netChangeInCashFils,
    beginningCashFils,
    endingCashFils: beginningCashFils + netChangeInCashFils,
  };
}

export function generateAllFinancialStatements(
  tb: TrialBalance,
  entries: JournalEntry[],
  options?: {
    endingInventoryFils?: Fils;
    beginningCashFils?: Fils;
    beginningCapitalFils?: Fils;
  }
): FinancialStatementsBundle {
  const incomeStatement = generateIncomeStatement(tb, options?.endingInventoryFils);
  const ownersEquityStatement = generateOwnersEquityStatement(
    tb,
    incomeStatement.netIncomeFils,
    options?.beginningCapitalFils
  );
  const balanceSheet = generateBalanceSheet(
    tb,
    ownersEquityStatement.endingEquityFils,
    options?.endingInventoryFils
  );
  const cashFlowStatement = generateSimplifiedCashFlowStatement(
    entries,
    options?.beginningCashFils ?? 0
  );

  const cashOnBalanceSheetFils =
    getNetAccountAmount(tb, 'cash', 'debit') +
    getNetAccountAmount(tb, 'bank', 'debit');

  const articulationChecks: ArticulationCheck[] = [
    {
      id: 'net-income-to-equity',
      title: 'انتقال صافي الدخل إلى قائمة حقوق الملكية',
      passed:
        ownersEquityStatement.netIncomeFils === incomeStatement.netIncomeFils,
      expectedFils: incomeStatement.netIncomeFils,
      actualFils: ownersEquityStatement.netIncomeFils,
      descriptionAr:
        'يتدفق صافي الربح أو الخسارة من قائمة الدخل مباشرة لزيادة أو تخفيض حقوق الملكية.',
    },
    {
      id: 'equity-to-balance-sheet',
      title: 'انتقال رصيد حقوق الملكية إلى المركز المالي',
      passed:
        balanceSheet.endingEquityFils === ownersEquityStatement.endingEquityFils,
      expectedFils: ownersEquityStatement.endingEquityFils,
      actualFils: balanceSheet.endingEquityFils,
      descriptionAr:
        'يمثل الرصيد الختامي في قائمة حقوق الملكية بند حقوق الملكية في قائمة المركز المالي.',
    },
    {
      id: 'balance-sheet-equilibrium',
      title: 'توازن قائمة المركز المالي (الأصول = الالتزامات + حقوق الملكية)',
      passed: balanceSheet.isBalanced,
      expectedFils: balanceSheet.totalAssetsFils,
      actualFils: balanceSheet.totalLiabilitiesAndEquityFils,
      descriptionAr:
        'إجمالي الأصول يجب أن يطابق دائماً إجمالي الالتزامات وحقوق الملكية.',
    },
    {
      id: 'cash-flow-to-balance-sheet',
      title: 'مطابقة الرصيد النقدي مع قائمة التدفقات النقدية',
      passed: cashFlowStatement.endingCashFils === cashOnBalanceSheetFils,
      expectedFils: cashOnBalanceSheetFils,
      actualFils: cashFlowStatement.endingCashFils,
      descriptionAr:
        'نقدية آخر الفترة في قائمة التدفقات النقدية تطابق مجموع الصندوق والبنك في الميزانية.',
    },
  ];

  return {
    incomeStatement,
    ownersEquityStatement,
    balanceSheet,
    cashFlowStatement,
    articulationChecks,
  };
}
