import type { AccountingJournalEntryLine } from '@/types';

export type AccountGroupCode = '' | '1' | '2' | '3' | '4' | '5';
export type AccountNature = '' | 'debit' | 'credit';
export type FinancialStatementTarget = '' | 'balance_sheet' | 'income_statement';

export interface Stage1AccountSpec {
  id: string;
  accountName: string;
  documentSource: string;
  subCode: string;
  expectedGroupCode: Exclude<AccountGroupCode, ''>;
  expectedNature: Exclude<AccountNature, ''>;
  expectedStatement: Exclude<FinancialStatementTarget, ''>;
  bookHint: string;
}

export interface Stage1RowAnswer {
  groupCode: AccountGroupCode;
  nature: AccountNature;
  statement: FinancialStatementTarget;
}

export interface Stage2HistoricalCostSpec {
  id: string;
  itemTitle: string;
  documentType: string;
  documentAmount: number;
  expectedCapitalized: number;
  bookHint: string;
}

export interface Stage2OperationSpec {
  id: string;
  label: string;
  description: string;
  bookRef: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
}

export interface Stage3IncomeInputs {
  revenues: number | '';
  expenses: number | '';
}

export interface Stage3BalanceSheetInputs {
  cashBalance: number | '';
  equipmentBalance: number | '';
  liabilitiesBalance: number | '';
  capitalBalance: number | '';
  retainedProfit: number | '';
}

export interface Unit1SpreadsheetState {
  stage1: Record<string, Stage1RowAnswer>;
  stage2Costs: Record<string, number | ''>;
  stage2Journal: AccountingJournalEntryLine[];
  stage3Income: Stage3IncomeInputs;
  stage3Balance: Stage3BalanceSheetInputs;
}

export const UNIT1_SPREADSHEET_STORAGE_KEY = 'seftlab-u1-spreadsheet-v1';
export const UNIT1_SPREADSHEET_UPDATED_EVENT = 'seftlab-u1-sheet-updated';

export const UNIT1_CASE_STUDY = {
  folderTitle: 'الوحدة 1 تطبيق عملي',
  projectTitle: 'مشروع الوحدة 1 التطبيقي: الدورة المحاسبية في جداول العمل (3 مراحل)',
  companyName: 'شركة النور للتجهيزات الصناعية والتجارية (عمان — الأردن)',
  textbookRef: 'الفصل الأول: مدخل إلى علم المحاسبة (ص 14–36)',
};

export const ACCOUNT_GROUP_OPTIONS: {
  value: Exclude<AccountGroupCode, ''>;
  label: string;
}[] = [
  { value: '1', label: '1 - الأصول' },
  { value: '2', label: '2 - المطلوبات' },
  { value: '3', label: '3 - حقوق الملكية' },
  { value: '4', label: '4 - المصروفات' },
  { value: '5', label: '5 - الإيرادات' },
];

export const NATURE_OPTIONS: {
  value: Exclude<AccountNature, ''>;
  label: string;
}[] = [
  { value: 'debit', label: 'مدين' },
  { value: 'credit', label: 'دائن' },
];

export const STATEMENT_OPTIONS: {
  value: Exclude<FinancialStatementTarget, ''>;
  label: string;
}[] = [
  { value: 'balance_sheet', label: 'قائمة المركز المالي' },
  { value: 'income_statement', label: 'قائمة الدخل' },
];

export const STAGE1_ACCOUNT_ROWS: Stage1AccountSpec[] = [
  {
    id: 's1-r1',
    accountName: 'النقدية لدى البنك',
    documentSource: 'مستند قبض داخلي وكشف البنك (ص 34)',
    subCode: '101',
    expectedGroupCode: '1',
    expectedNature: 'debit',
    expectedStatement: 'balance_sheet',
    bookHint: 'الأصول تأخذ مجموعة رقم 1، طبيعتها مدينة، وتظهر في قائمة المركز المالي (ص 25، 36).',
  },
  {
    id: 's1-r2',
    accountName: 'المعدات والآلات الإنتاجية',
    documentSource: 'فاتورة شراء خارجية ومستندات شحن (ص 29، 34)',
    subCode: '112',
    expectedGroupCode: '1',
    expectedNature: 'debit',
    expectedStatement: 'balance_sheet',
    bookHint: 'الآلات أصول غير متداولة ضمن المجموعة 1، طبيعتها مدينة، وتظهر في قائمة المركز المالي (ص 25، 29).',
  },
  {
    id: 's1-r3',
    accountName: 'الذمم الدائنة (الموردون)',
    documentSource: 'فاتورة مشتريات آجلة خارجية (ص 26، 34)',
    subCode: '201',
    expectedGroupCode: '2',
    expectedNature: 'credit',
    expectedStatement: 'balance_sheet',
    bookHint: 'الالتزامات على المنشأة للغير ضمن المجموعة 2، طبيعتها دائنة، وتظهر في قائمة المركز المالي (ص 26).',
  },
  {
    id: 's1-r4',
    accountName: 'رأس المال المساهم',
    documentSource: 'عقد التأسيس وإشعار الإيداع البنكي (ص 27)',
    subCode: '301',
    expectedGroupCode: '3',
    expectedNature: 'credit',
    expectedStatement: 'balance_sheet',
    bookHint: 'حقوق الملكية ضمن المجموعة 3، طبيعتها دائنة، وتظهر في قائمة المركز المالي (ص 27، 36).',
  },
  {
    id: 's1-r5',
    accountName: 'إيرادات الخدمات والمبيعات',
    documentSource: 'فاتورة مبيعات داخلية (ص 27، 30)',
    subCode: '501',
    expectedGroupCode: '5',
    expectedNature: 'credit',
    expectedStatement: 'income_statement',
    bookHint: 'الإيرادات حسب دليل الحسابات ص 36 هي المجموعة 5، طبيعتها دائنة، وتظهر في قائمة الدخل (ص 27).',
  },
  {
    id: 's1-r6',
    accountName: 'مصروف الرواتب والإيجار',
    documentSource: 'مستند صرف شيكات (ص 27، 30)',
    subCode: '401',
    expectedGroupCode: '4',
    expectedNature: 'debit',
    expectedStatement: 'income_statement',
    bookHint: 'المصروفات حسب دليل الحسابات ص 36 هي المجموعة 4، طبيعتها مدينة، وتظهر في قائمة الدخل (ص 27).',
  },
];

export const STAGE2_HISTORICAL_COST_ROWS: Stage2HistoricalCostSpec[] = [
  {
    id: 'hc-1',
    itemTitle: 'ثمن شراء الآلة حسب فاتورة المورد الأساسية',
    documentType: 'فاتورة خارجية (مورد)',
    documentAmount: 12000,
    expectedCapitalized: 12000,
    bookHint: 'ثمن الشراء الأساسي يدخل كاملاً ضمن التكلفة التاريخية للأصل (ص 29).',
  },
  {
    id: 'hc-2',
    itemTitle: 'مصاريف الشحن البحري والرسوم الجمركية والتأمين',
    documentType: 'بيان جمركي ومستند شحن',
    documentAmount: 1500,
    expectedCapitalized: 1500,
    bookHint: 'جميع نفقات الشحن والجمارك اللازمة لوصول الأصل تُضاف للتكلفة التاريخية (ص 29).',
  },
  {
    id: 'hc-3',
    itemTitle: 'عمولة الشراء ومصاريف التركيب والإشراف والتجارب الأولية',
    documentType: 'فاتورة تركيب وتشغيل',
    documentAmount: 1000,
    expectedCapitalized: 1000,
    bookHint: 'تُضاف مصاريف التركيب والتجارب حتى يصبح الأصل جاهزاً للاستخدام (ص 29).',
  },
  {
    id: 'hc-4',
    itemTitle: 'مسحوبات نقدية شخصية للمالك (خارج نشاط المشروع)',
    documentType: 'إشعار سحب شخصي',
    documentAmount: 800,
    expectedCapitalized: 0,
    bookHint: 'وفق فرض الوحدة المحاسبية المستقلة (ص 27)، المصاريف الشخصية للمالك لا تُحمّل على أصول الشركة (أدخل 0).',
  },
];

export const STAGE2_AVAILABLE_ACCOUNTS: string[] = [
  'النقدية والبنك',
  'المعدات والآلات',
  'الذمم الدائنة (الموردون)',
  'رأس المال المساهم',
  'إيرادات الخدمات والمبيعات',
  'مصروف الرواتب والإيجار',
];

export const STAGE2_JOURNAL_OPERATIONS: Stage2OperationSpec[] = [
  {
    id: 'op-1',
    label: 'العملية 1',
    description: 'أودع المؤسس مبلغ 30,000 د.أ في الحساب البنكي للشركة كرأس مال تأسيسي.',
    bookRef: 'فرض الوحدة المحاسبية المستقلة (ص 27)',
    debitAccount: 'النقدية والبنك',
    creditAccount: 'رأس المال المساهم',
    amount: 30000,
  },
  {
    id: 'op-2',
    label: 'العملية 2',
    description:
      'اشترت الشركة الآلة وسددت مصاريف الشحن والجمارك والتركيب من البنك بإجمالي التكلفة التاريخية.',
    bookRef: 'مبدأ التكلفة التاريخية (ص 29)',
    debitAccount: 'المعدات والآلات',
    creditAccount: 'النقدية والبنك',
    amount: 14500,
  },
  {
    id: 'op-3',
    label: 'العملية 3',
    description: 'قدّمت الشركة خدمات تجهيز وأتمت تسليمها للعميل بمبلغ 8,500 د.أ حُصّلت في البنك.',
    bookRef: 'مبدأ تحقق الإيراد (ص 30)',
    debitAccount: 'النقدية والبنك',
    creditAccount: 'إيرادات الخدمات والمبيعات',
    amount: 8500,
  },
  {
    id: 'op-4',
    label: 'العملية 4',
    description: 'سددت الشركة رواتب الموظفين وإيجار المعرض للفترة بمبلغ 3,500 د.أ بشيك بنكي.',
    bookRef: 'مبدأ المقابلة (ص 30)',
    debitAccount: 'مصروف الرواتب والإيجار',
    creditAccount: 'النقدية والبنك',
    amount: 3500,
  },
];

export const STAGE2_MODEL_ENTRIES: AccountingJournalEntryLine[] = STAGE2_JOURNAL_OPERATIONS.map(
  (op, idx) => ({
    id: `u1-sheet-m${idx + 1}`,
    description: op.description,
    debitAccount: op.debitAccount,
    creditAccount: op.creditAccount,
    debitAmount: op.amount,
    creditAmount: op.amount,
  })
);

export const STAGE3_MODEL = {
  revenues: 8500,
  expenses: 3500,
  netIncome: 5000,
  cashBalance: 20500,
  equipmentBalance: 14500,
  totalAssets: 35000,
  liabilitiesBalance: 0,
  capitalBalance: 30000,
  retainedProfit: 5000,
  totalLiabEquity: 35000,
};

export function createEmptyJournalRows(): AccountingJournalEntryLine[] {
  return STAGE2_JOURNAL_OPERATIONS.map((op, idx) => ({
    id: `sheet-j-${idx + 1}`,
    description: op.label,
    debitAccount: STAGE2_AVAILABLE_ACCOUNTS[0],
    creditAccount: STAGE2_AVAILABLE_ACCOUNTS[0],
    debitAmount: 0,
    creditAmount: 0,
  }));
}

export function createDefaultUnit1SpreadsheetState(): Unit1SpreadsheetState {
  const stage1: Record<string, Stage1RowAnswer> = {};
  STAGE1_ACCOUNT_ROWS.forEach((row) => {
    stage1[row.id] = { groupCode: '', nature: '', statement: '' };
  });

  const stage2Costs: Record<string, number | ''> = {};
  STAGE2_HISTORICAL_COST_ROWS.forEach((row) => {
    stage2Costs[row.id] = '';
  });

  return {
    stage1,
    stage2Costs,
    stage2Journal: createEmptyJournalRows(),
    stage3Income: {
      revenues: '',
      expenses: '',
    },
    stage3Balance: {
      cashBalance: '',
      equipmentBalance: '',
      liabilitiesBalance: '',
      capitalBalance: '',
      retainedProfit: '',
    },
  };
}

export function loadSavedUnit1SpreadsheetState(): Unit1SpreadsheetState {
  const fallback = createDefaultUnit1SpreadsheetState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(UNIT1_SPREADSHEET_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Unit1SpreadsheetState>;
    return {
      stage1: { ...fallback.stage1, ...(parsed.stage1 || {}) },
      stage2Costs: { ...fallback.stage2Costs, ...(parsed.stage2Costs || {}) },
      stage2Journal:
        Array.isArray(parsed.stage2Journal) && parsed.stage2Journal.length > 0
          ? parsed.stage2Journal
          : fallback.stage2Journal,
      stage3Income: { ...fallback.stage3Income, ...(parsed.stage3Income || {}) },
      stage3Balance: { ...fallback.stage3Balance, ...(parsed.stage3Balance || {}) },
    };
  } catch {
    return fallback;
  }
}

export function saveUnit1SpreadsheetState(state: Unit1SpreadsheetState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UNIT1_SPREADSHEET_STORAGE_KEY, JSON.stringify(state));
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(UNIT1_SPREADSHEET_UPDATED_EVENT));
    }, 0);
  } catch {
    // تجاهل أخطاء مساحة التخزين المحلية
  }
}

export interface Unit1SpreadsheetEvaluation {
  stage1: {
    correctCells: number;
    totalCells: number;
    scorePct: number;
    points: number;
    maxPoints: number;
    isComplete: boolean;
  };
  stage2: {
    histCostSum: number;
    histCostCorrect: number;
    journalCorrect: number;
    debitSum: number;
    creditSum: number;
    isJournalBalanced: boolean;
    scorePct: number;
    points: number;
    maxPoints: number;
    isComplete: boolean;
  };
  stage3: {
    revenuesVal: number;
    expensesVal: number;
    netIncomeVal: number;
    totalAssetsVal: number;
    totalLiabEquityVal: number;
    incomeCorrect: number;
    balanceSheetCorrect: number;
    isBalanced: boolean;
    scorePct: number;
    points: number;
    maxPoints: number;
    isComplete: boolean;
  };
  completedStagesCount: number;
  overallScore: number;
}

function toNumber(v: number | '' | undefined): number {
  if (v === '' || v === undefined || Number.isNaN(Number(v))) return 0;
  return Number(v);
}

export function evaluateUnit1SpreadsheetState(
  state: Unit1SpreadsheetState,
  journalOverride?: AccountingJournalEntryLine[]
): Unit1SpreadsheetEvaluation {
  // المرحلة 1: 6 صفوف × 3 أعمدة = 18 خلية (30 علامة)
  let stage1Correct = 0;
  const stage1Total = STAGE1_ACCOUNT_ROWS.length * 3;
  STAGE1_ACCOUNT_ROWS.forEach((spec) => {
    const ans = state.stage1[spec.id];
    if (!ans) return;
    if (ans.groupCode === spec.expectedGroupCode) stage1Correct += 1;
    if (ans.nature === spec.expectedNature) stage1Correct += 1;
    if (ans.statement === spec.expectedStatement) stage1Correct += 1;
  });
  const stage1Pct = Math.round((stage1Correct / stage1Total) * 100);
  const stage1Points = Number(((stage1Correct / stage1Total) * 30).toFixed(1));
  const stage1Complete = stage1Correct === stage1Total;

  // المرحلة 2: 4 بنود تكلفة تاريخية + 4 قيود يومية (40 علامة)
  let histCostCorrect = 0;
  let histCostSum = 0;
  STAGE2_HISTORICAL_COST_ROWS.forEach((row) => {
    const rawVal = state.stage2Costs[row.id];
    const numVal = toNumber(rawVal);
    histCostSum += numVal;
    const isEntered = rawVal !== '' && rawVal !== undefined;
    if (isEntered && numVal === row.expectedCapitalized) {
      histCostCorrect += 1;
    }
  });

  const activeJournal = journalOverride ?? state.stage2Journal;
  let journalCorrect = 0;
  STAGE2_MODEL_ENTRIES.forEach((expected, idx) => {
    const actual = activeJournal[idx];
    if (!actual) return;
    const accountsMatch =
      actual.debitAccount.trim() === expected.debitAccount.trim() &&
      actual.creditAccount.trim() === expected.creditAccount.trim();
    const amountsMatch =
      Number(actual.debitAmount) === expected.debitAmount &&
      Number(actual.creditAmount) === expected.creditAmount;
    if (accountsMatch && amountsMatch) {
      journalCorrect += 1;
    }
  });

  const debitSum = activeJournal.reduce((s, r) => s + (Number(r.debitAmount) || 0), 0);
  const creditSum = activeJournal.reduce((s, r) => s + (Number(r.creditAmount) || 0), 0);
  const isJournalBalanced = debitSum > 0 && debitSum === creditSum;

  const stage2ChecksTotal = STAGE2_HISTORICAL_COST_ROWS.length + STAGE2_MODEL_ENTRIES.length;
  const stage2Passed = histCostCorrect + journalCorrect;
  const stage2Pct = Math.round((stage2Passed / stage2ChecksTotal) * 100);
  const stage2Points = Number(((stage2Passed / stage2ChecksTotal) * 40).toFixed(1));
  const stage2Complete = stage2Passed === stage2ChecksTotal && histCostSum === 14500;

  // المرحلة 3: قائمة الدخل (2 حقل) + معادلة الميزانية (5 حقول) (30 علامة)
  const revenuesVal = toNumber(state.stage3Income.revenues);
  const expensesVal = toNumber(state.stage3Income.expenses);
  const netIncomeVal = revenuesVal - expensesVal;

  let incomeCorrect = 0;
  if (state.stage3Income.revenues !== '' && revenuesVal === STAGE3_MODEL.revenues) {
    incomeCorrect += 1;
  }
  if (state.stage3Income.expenses !== '' && expensesVal === STAGE3_MODEL.expenses) {
    incomeCorrect += 1;
  }

  const cashVal = toNumber(state.stage3Balance.cashBalance);
  const equipVal = toNumber(state.stage3Balance.equipmentBalance);
  const liabVal = toNumber(state.stage3Balance.liabilitiesBalance);
  const capVal = toNumber(state.stage3Balance.capitalBalance);
  const profitVal = toNumber(state.stage3Balance.retainedProfit);

  const totalAssetsVal = cashVal + equipVal;
  const totalLiabEquityVal = liabVal + capVal + profitVal;

  let balanceSheetCorrect = 0;
  if (state.stage3Balance.cashBalance !== '' && cashVal === STAGE3_MODEL.cashBalance) {
    balanceSheetCorrect += 1;
  }
  if (
    state.stage3Balance.equipmentBalance !== '' &&
    equipVal === STAGE3_MODEL.equipmentBalance
  ) {
    balanceSheetCorrect += 1;
  }
  if (
    state.stage3Balance.liabilitiesBalance !== '' &&
    liabVal === STAGE3_MODEL.liabilitiesBalance
  ) {
    balanceSheetCorrect += 1;
  }
  if (state.stage3Balance.capitalBalance !== '' && capVal === STAGE3_MODEL.capitalBalance) {
    balanceSheetCorrect += 1;
  }
  if (state.stage3Balance.retainedProfit !== '' && profitVal === STAGE3_MODEL.retainedProfit) {
    balanceSheetCorrect += 1;
  }

  const isBalanced =
    totalAssetsVal > 0 &&
    totalAssetsVal === totalLiabEquityVal &&
    totalAssetsVal === STAGE3_MODEL.totalAssets;

  const stage3ChecksTotal = 7;
  const stage3Passed = incomeCorrect + balanceSheetCorrect;
  const stage3Pct = Math.round((stage3Passed / stage3ChecksTotal) * 100);
  const stage3Points = Number(((stage3Passed / stage3ChecksTotal) * 30).toFixed(1));
  const stage3Complete = stage3Passed === stage3ChecksTotal && isBalanced;

  const completedStagesCount = [stage1Complete, stage2Complete, stage3Complete].filter(
    Boolean
  ).length;
  const overallScore = Math.min(
    100,
    Math.round(stage1Points + stage2Points + stage3Points)
  );

  return {
    stage1: {
      correctCells: stage1Correct,
      totalCells: stage1Total,
      scorePct: stage1Pct,
      points: stage1Points,
      maxPoints: 30,
      isComplete: stage1Complete,
    },
    stage2: {
      histCostSum,
      histCostCorrect,
      journalCorrect,
      debitSum,
      creditSum,
      isJournalBalanced,
      scorePct: stage2Pct,
      points: stage2Points,
      maxPoints: 40,
      isComplete: stage2Complete,
    },
    stage3: {
      revenuesVal,
      expensesVal,
      netIncomeVal,
      totalAssetsVal,
      totalLiabEquityVal,
      incomeCorrect,
      balanceSheetCorrect,
      isBalanced,
      scorePct: stage3Pct,
      points: stage3Points,
      maxPoints: 30,
      isComplete: stage3Complete,
    },
    completedStagesCount,
    overallScore,
  };
}
