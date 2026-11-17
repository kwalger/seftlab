/**
 * بيانات ونماذج التطبيق العملي للوحدة الثانية
 * مأخوذة نصاً وحرفاً من كتاب المحاسبة المالية المعتمد:
 * الفصل الثاني: تحليل العمليات المالية (ص 47–70)
 * دراسة الحالة الشاملة: محلات الأمين (شهر آذار / مارس 2024)
 */

export interface EventFilterItem {
  id: string;
  label: string;
  eventDescription: string;
  hasMonetaryValue: boolean; // الشرط 1: هل له قيمة مالية؟
  affectsBalanceSheet: boolean; // الشرط 2: هل يؤثر على عناصر قائمة المركز المالي؟
  hasActuallyOccurred: boolean; // الشرط 3: هل وقع الحدث فعلاً؟
  isFinancialTransaction: boolean; // النتيجة: هل يسجل كعملية مالية؟
  amount: number;
  explanation: string;
  bookRef: string;
}

export interface EquationImpactRule {
  caseNumber: 1 | 2 | 3 | 4;
  title: string;
  formulaDescription: string;
  exampleInBook: string;
  sampleTransaction: string;
  assetsChange: '+' | '-' | 'none' | '+/-';
  liabilitiesChange: '+' | '-' | 'none' | '+/-';
  equityChange: '+' | '-' | 'none' | '+/-';
  explanation: string;
}

export interface AlAmeenTransactionRow {
  step: number;
  date: string;
  title: string;
  description: string;
  bookRef: string;
  // الأصول
  cash: number; // النقدية بالصندوق
  machinery: number; // الآلات
  furniture: number; // الأثاث
  receivables: number; // الذمم المدينة (العميل سامر)
  supplies: number; // القرطاسية
  // الالتزامات
  payables: number; // الذمم الدائنة (مفروشات أمل)
  notesPayable: number; // أوراق الدفع
  // حقوق الملكية
  capital: number; // رأس المال
  revenues: number; // الإيرادات (+إيراد خدمات)
  expenses: number; // المصروفات (-مصروف إيجار)
  drawings: number; // المسحوبات الشخصية (-مسحوبات أمين)
  // الشرح والتصنيف
  impactCase: string;
  notes: string;
}

export interface Unit2SpreadsheetState {
  stage1Events: Record<string, {
    q1Monetary: boolean | null;
    q2Affects: boolean | null;
    q3Occurred: boolean | null;
    userResult: boolean | null;
  }>;
  stage2Cases: Record<string, {
    selectedCase: 1 | 2 | 3 | 4 | null;
  }>;
  stage3AlAmeenRows: Record<number, {
    cash: number | '';
    machinery: number | '';
    furniture: number | '';
    receivables: number | '';
    supplies: number | '';
    payables: number | '';
    notesPayable: number | '';
    capital: number | '';
    revenues: number | '';
    expenses: number | '';
    drawings: number | '';
  }>;
  stage4Statements: {
    incomeServiceRevenues: number | '';
    incomeRentExpense: number | '';
    incomeNetProfit: number | '';
    equityBeginningCapital: number | '';
    equityNetProfitAdded: number | '';
    equityDrawingsDeducted: number | '';
    equityEndingCapital: number | '';
    balanceTotalCurrentAssets: number | '';
    balanceTotalNonCurrentAssets: number | '';
    balanceTotalAssets: number | '';
    balanceTotalLiabilities: number | '';
    balanceEndingEquity: number | '';
    balanceTotalLiabilitiesAndEquity: number | '';
  };
}

export const UNIT2_SPREADSHEET_STORAGE_KEY = 'seftlab-u2-spreadsheet-v1';
export const UNIT2_SPREADSHEET_UPDATED_EVENT = 'seftlab-u2-sheet-updated';

export const UNIT2_CASE_STUDY = {
  folderTitle: 'الوحدة 2 تطبيق عملي',
  projectTitle: 'مشروع الوحدة 2 التطبيقي: تحليل العمليات ومعادلة الميزانية والقوائم المالية (محلات الأمين)',
  companyName: 'محلات الأمين للتجارة والخدمات (عمان — الأردن)',
  textbookRef: 'الفصل الثاني: تحليل العمليات المالية (ص 47–70)',
};

/**
 * أمثلة الكتاب التدريبية (شكل 2 ومثال 1 ص 47-48)
 * لفحص الشروط الثلاثة لاعتبار الحدث عملية مالية
 */
export const STAGE1_BOOK_EVENTS: EventFilterItem[] = [
  {
    id: 'ev-1',
    label: 'أ. شراء سيارة بمبلغ 5000 دينار ودفع ثمنها نقداً',
    eventDescription: 'قامت المنشأة بشراء سيارة لاستخدامها في أعمالها وتم سداد كامل المبلغ 5,000 دينار نقداً من الصندوق.',
    hasMonetaryValue: true,
    affectsBalanceSheet: true,
    hasActuallyOccurred: true,
    isFinancialTransaction: true,
    amount: 5000,
    explanation: 'تعتبر عملية مالية لتوافر الشروط الثلاثة: لها قيمة نقدية (5,000 د.أ)، أثرت على قائمة المركز المالي (زيادة الأصول سيارات ونقصان الأصول نقدية)، والحدث قد وقع فعلاً (عملية الشراء).',
    bookRef: 'ص 47 - 48',
  },
  {
    id: 'ev-2',
    label: 'ب. دفع مبلغ 350 دينار نقداً راتب للسكرتيرة في المنشأة',
    eventDescription: 'تم سداد راتب السكرتيرة الشهري البالغ 350 ديناراً نقداً من صندوق المنشأة.',
    hasMonetaryValue: true,
    affectsBalanceSheet: true,
    hasActuallyOccurred: true,
    isFinancialTransaction: true,
    amount: 350,
    explanation: 'تعتبر عملية مالية لتوافر الشروط: قيمة مالية 350 دينار، أثرت بنقصان الصندوق ونقصان حقوق الملكية (مصروف رواتب)، ووقعت فعلاً.',
    bookRef: 'ص 47 - 48',
  },
  {
    id: 'ev-3',
    label: 'ج. تعيين أحد بوظيفة محاسب وبراتب 500 دينار شهرياً',
    eventDescription: 'أصدرت إدارة المنشأة قراراً بتعيين محاسب جديد على أن يتقاضى راتباً شهرياً قدره 500 دينار يبدأ عمله لاحقاً.',
    hasMonetaryValue: true,
    affectsBalanceSheet: false,
    hasActuallyOccurred: false,
    isFinancialTransaction: false,
    amount: 500,
    explanation: 'لا تعتبر عملية مالية لعدم توفر الشروط: الحدث لم يؤثر على عناصر قائمة المركز المالي لعدم دفع الراتب لذا لم تتأثر الحسابات ولم تقع واقعة الصرف الفعلي بعد.',
    bookRef: 'ص 48',
  },
  {
    id: 'ev-4',
    label: 'د. انخفاض الروح المعنوية للموظفين',
    eventDescription: 'لوحظ انخفاض في المعنويات والحماس لدى الموظفين في المنشأة.',
    hasMonetaryValue: false,
    affectsBalanceSheet: false,
    hasActuallyOccurred: true,
    isFinancialTransaction: false,
    amount: 0,
    explanation: 'لا تعتبر عملية مالية لأنه لا يوجد للحدث قيمة مالية يمكن قياسها نقدياً بوحدة النقد، وبالتالي لا يُثبت في الدفاتر المحاسبية.',
    bookRef: 'ص 48',
  },
];

/**
 * الحالات الأربعة لأثر العمليات المالية على معادلة الميزانية (ص 49 - 59 وشكل 3)
 */
export const STAGE2_EQUATION_RULES: EquationImpactRule[] = [
  {
    caseNumber: 1,
    title: 'الحالة الأولى: زيادة في طرف يقابلها زيادة في الطرف الآخر',
    formulaDescription: 'زيادة في جانب الأصول (+) يقابلها زيادة في جانب الالتزامات (+) أو حقوق الملكية (+)',
    exampleInBook: 'مثال (2) ص 53: الحصول على قرض نقدي 40,000 د.أ | مثال (5) ص 55: بدء المشروع برأس مال 10,000 د.أ نقداً.',
    sampleTransaction: 'حصلت المنشأة على قرض من البنك العربي بقيمة 40,000 دينار نقداً أودع في الصندوق.',
    assetsChange: '+',
    liabilitiesChange: '+',
    equityChange: 'none',
    explanation: 'زيادة النقدية في الأصول بمقدار 40,000 دينار يقابلها زيادة التزام القرض في المطلوبات بمقدار 40,000 دينار فتبقى المعادلة متوازنة تماماً.',
  },
  {
    caseNumber: 2,
    title: 'الحالة الثانية: نقصان في طرف يقابله نقصان في الطرف الآخر',
    formulaDescription: 'نقصان في جانب الأصول (-) يقابله نقصان في جانب الالتزامات (-) أو حقوق الملكية (-)',
    exampleInBook: 'مثال (6) ص 55: سداد قرض البنك 40,000 د.أ نقداً | مثال (9) ص 57: سحب المالك 4,000 د.أ لتخفيض رأس المال.',
    sampleTransaction: 'سددت المنشأة قيمة قرض البنك العربي والبالغ 40,000 دينار نقداً.',
    assetsChange: '-',
    liabilitiesChange: '-',
    equityChange: 'none',
    explanation: 'نقص النقدية في جانب الأصول بمقدار 40,000 دينار يقابله نقص التزام القرض في جانب المطلوبات بمقدار 40,000 دينار.',
  },
  {
    caseNumber: 3,
    title: 'الحالة الثالثة: الزيادة والنقصان في نفس الطرف (تبادل أصول)',
    formulaDescription: 'زيادة في أحد عناصر الأصول (+) يقابلها نقصان في عنصر آخر من الأصول (-) دون التأثير على الطرف الآخر',
    exampleInBook: 'مثال (10) ص 58: شراء أثاث بقيمة 1,000 دينار نقداً.',
    sampleTransaction: 'اشترت المنشأة أثاثاً مكتبياً بمبلغ 1,000 دينار نقداً من الصندوق.',
    assetsChange: '+/-',
    liabilitiesChange: 'none',
    equityChange: 'none',
    explanation: 'يزداد حساب الأثاث بمقدار 1,000 دينار وينقص حساب النقدية بالصندوق بمقدار 1,000 دينار ويبقى إجمالي الأصول ثابتاً.',
  },
  {
    caseNumber: 4,
    title: 'الحالة الرابعة: الزيادة والنقصان في جانب الالتزامات وحقوق الملكية دون مساس بالأصول',
    formulaDescription: 'تغير داخلي بين بنود الالتزامات أو حقوق الملكية دون أي تغير في الأصول',
    exampleInBook: 'مثال (11) ص 58: سداد المستحق لمحلات سعيد 250 د.أ بتحرير كمبيالة.',
    sampleTransaction: 'سددت المنشأة المستحق عليها لمحلات سعيد البالغ 250 ديناراً من خلال تحرير كمبيالة (ورقة دفع).',
    assetsChange: 'none',
    liabilitiesChange: '+/-',
    equityChange: 'none',
    explanation: 'انخفاض الذمم الدائنة بمقدار 250 ديناراً يقابله زيادة في أوراق الدفع بمقدار 250 ديناراً وتبقى الأصول دون تغيير.',
  },
];

/**
 * جدول العمليات العشر لمحلات الأمين - شهر آذار 2024 (ص 59 - 64)
 */
export const STAGE3_AL_AMEEN_ROWS: AlAmeenTransactionRow[] = [
  {
    step: 1,
    date: '2024/03/01',
    title: 'استثمار صاحب المشروع (بدء النشاط)',
    description: 'بدأ أمين مشروعه بتخصيص مبلغ 10,000 دينار من أمواله الخاصة أودعها بالكامل في صندوق المنشأة.',
    bookRef: 'ص 59 - 60 (عملية 1)',
    cash: 10000,
    machinery: 0,
    furniture: 0,
    receivables: 0,
    supplies: 0,
    payables: 0,
    notesPayable: 0,
    capital: 10000,
    revenues: 0,
    expenses: 0,
    drawings: 0,
    impactCase: 'الحالة 1: زيادة أصل (نقدية 10,000) يقابلها زيادة حقوق ملكية (رأس مال 10,000)',
    notes: 'إجمالي الأصول 10,000 = إجمالي الالتزامات وحقوق الملكية 10,000',
  },
  {
    step: 2,
    date: '2024/03/02',
    title: 'شراء أصل نقداً (آلات)',
    description: 'اشترت محلات الأمين آلات بمبلغ 5,000 دينار نقداً.',
    bookRef: 'ص 60 (عملية 2)',
    cash: -5000,
    machinery: 5000,
    furniture: 0,
    receivables: 0,
    supplies: 0,
    payables: 0,
    notesPayable: 0,
    capital: 0,
    revenues: 0,
    expenses: 0,
    drawings: 0,
    impactCase: 'الحالة 3: زيادة أصل (آلات +5,000) ونقصان أصل آخر (نقدية -5,000)',
    notes: 'يبقى إجمالي الأصول 10,000 = الالتزامات وحقوق الملكية 10,000',
  },
  {
    step: 3,
    date: '2024/03/03',
    title: 'شراء أصل على الحساب (أثاث)',
    description: 'اشترت محلات الأمين أثاثاً بقيمة 500 دينار من مفروشات أمل على الحساب (بالآجل).',
    bookRef: 'ص 61 (عملية 3)',
    cash: 0,
    machinery: 0,
    furniture: 500,
    receivables: 0,
    supplies: 0,
    payables: 500,
    notesPayable: 0,
    capital: 0,
    revenues: 0,
    expenses: 0,
    drawings: 0,
    impactCase: 'الحالة 1: زيادة أصل (أثاث +500) يقابلها زيادة التزام (ذمم دائنة +500)',
    notes: 'إجمالي الأصول 10,500 = إجمالي الالتزامات وحقوق الملكية 10,500',
  },
  {
    step: 4,
    date: '2024/03/04',
    title: 'دفع مصروف إيجار المحل نقداً',
    description: 'دفعت محلات الأمين إيجار المحلات والبالغ 400 دينار نقداً.',
    bookRef: 'ص 61 (عملية 4)',
    cash: -400,
    machinery: 0,
    furniture: 0,
    receivables: 0,
    supplies: 0,
    payables: 0,
    notesPayable: 0,
    capital: 0,
    revenues: 0,
    expenses: -400,
    drawings: 0,
    impactCase: 'الحالة 2: نقصان أصل (نقدية -400) يقابله نقصان حقوق ملكية (مصروف إيجار -400)',
    notes: 'إجمالي الأصول 10,100 = إجمالي الالتزامات وحقوق الملكية 10,100',
  },
  {
    step: 5,
    date: '2024/03/07',
    title: 'تقديم خدمات واستلام الإيراد نقداً',
    description: 'استلمت محلات الأمين إيراداً مقابل تقديم خدمات بمبلغ 5,100 دينار نقداً.',
    bookRef: 'ص 61 (عملية 5)',
    cash: 5100,
    machinery: 0,
    furniture: 0,
    receivables: 0,
    supplies: 0,
    payables: 0,
    notesPayable: 0,
    capital: 0,
    revenues: 5100,
    expenses: 0,
    drawings: 0,
    impactCase: 'الحالة 1: زيادة أصل (نقدية +5,100) يقابلها زيادة حقوق ملكية (إيرادات +5,100)',
    notes: 'إجمالي الأصول 15,200 = إجمالي الالتزامات وحقوق الملكية 15,200',
  },
  {
    step: 6,
    date: '2024/03/10',
    title: 'مسحوبات شخصية لصاحب المشروع نقداً',
    description: 'سحب أمين مبلغ 1,000 دينار نقداً من الصندوق لاستخداماته الشخصية.',
    bookRef: 'ص 62 (عملية 6)',
    cash: -1000,
    machinery: 0,
    furniture: 0,
    receivables: 0,
    supplies: 0,
    payables: 0,
    notesPayable: 0,
    capital: 0,
    revenues: 0,
    expenses: 0,
    drawings: -1000,
    impactCase: 'الحالة 2: نقصان أصل (نقدية -1,000) يقابله نقصان حقوق ملكية (مسحوبات شخصية -1,000)',
    notes: 'إجمالي الأصول 14,200 = إجمالي الالتزامات وحقوق الملكية 14,200',
  },
  {
    step: 7,
    date: '2024/03/20',
    title: 'تقديم خدمات للعميل على الحساب',
    description: 'تم تقديم خدمات بمبلغ 1,000 دينار للعميل سامر على الحساب.',
    bookRef: 'ص 62 (عملية 7)',
    cash: 0,
    machinery: 0,
    furniture: 0,
    receivables: 1000,
    supplies: 0,
    payables: 0,
    notesPayable: 0,
    capital: 0,
    revenues: 1000,
    expenses: 0,
    drawings: 0,
    impactCase: 'الحالة 1: زيادة أصل (ذمم مدينة +1,000) يقابلها زيادة حقوق ملكية (إيرادات +1,000)',
    notes: 'إجمالي الأصول 15,200 = إجمالي الالتزامات وحقوق الملكية 15,200',
  },
  {
    step: 8,
    date: '2024/03/21',
    title: 'شراء أصل مقابل تحرير كمبيالة',
    description: 'تم شراء قرطاسية بقيمة 2,000 دينار مقابل تحرير كمبيالة (ورقة دفع).',
    bookRef: 'ص 63 (عملية 8)',
    cash: 0,
    machinery: 0,
    furniture: 0,
    receivables: 0,
    supplies: 2000,
    payables: 0,
    notesPayable: 2000,
    capital: 0,
    revenues: 0,
    expenses: 0,
    drawings: 0,
    impactCase: 'الحالة 1: زيادة أصل (قرطاسية +2,000) يقابلها زيادة التزام (أوراق دفع +2,000)',
    notes: 'إجمالي الأصول 17,200 = إجمالي الالتزامات وحقوق الملكية 17,200',
  },
  {
    step: 9,
    date: '2024/03/27',
    title: 'تحصيل جزء من الذمم المدينة نقداً',
    description: 'قبضت محلات الأمين مبلغ 500 دينار نقداً كجزء من المبلغ المستحق على العميل سامر.',
    bookRef: 'ص 63 (عملية 9)',
    cash: 500,
    machinery: 0,
    furniture: 0,
    receivables: -500,
    supplies: 0,
    payables: 0,
    notesPayable: 0,
    capital: 0,
    revenues: 0,
    expenses: 0,
    drawings: 0,
    impactCase: 'الحالة 3: زيادة أصل (نقدية +500) ونقصان أصل آخر (ذمم مدينة -500)',
    notes: 'يبقى إجمالي الأصول 17,200 = إجمالي الالتزامات وحقوق الملكية 17,200',
  },
  {
    step: 10,
    date: '2024/03/30',
    title: 'سداد الذمم الدائنة نقداً',
    description: 'سددت محلات الأمين مبلغ 500 دينار نقداً من الذمم الدائنة المستحقة لمفروشات أمل.',
    bookRef: 'ص 64 (عملية 10)',
    cash: -500,
    machinery: 0,
    furniture: 0,
    receivables: 0,
    supplies: 0,
    payables: -500,
    notesPayable: 0,
    capital: 0,
    revenues: 0,
    expenses: 0,
    drawings: 0,
    impactCase: 'الحالة 2: نقصان أصل (نقدية -500) يقابله نقصان التزام (ذمم دائنة -500)',
    notes: 'الرصيد النهائي: إجمالي الأصول 16,700 = إجمالي الالتزامات وحقوق الملكية 16,700',
  },
];

/**
 * الأرصدة النهائية النموذجية لمحلات الأمين بعد العمليات العشر (ص 64)
 */
export const AL_AMEEN_FINAL_BALANCES = {
  cash: 8700,
  machinery: 5000,
  furniture: 500,
  receivables: 500,
  supplies: 2000,
  totalAssets: 16700,

  payables: 0,
  notesPayable: 2000,
  totalLiabilities: 2000,

  capital: 10000,
  rentExpense: 400,
  serviceRevenues: 6100, // 5100 + 1000
  drawings: 1000,
  netIncome: 5700, // 6100 - 400
  endingEquity: 14700, // 10000 + 5700 - 1000

  totalLiabilitiesAndEquity: 16700,
};

export function createDefaultUnit2SpreadsheetState(): Unit2SpreadsheetState {
  const stage1: Unit2SpreadsheetState['stage1Events'] = {};
  STAGE1_BOOK_EVENTS.forEach((ev) => {
    stage1[ev.id] = {
      q1Monetary: null,
      q2Affects: null,
      q3Occurred: null,
      userResult: null,
    };
  });

  const stage2: Unit2SpreadsheetState['stage2Cases'] = {};
  STAGE2_EQUATION_RULES.forEach((r) => {
    stage2[`case-${r.caseNumber}`] = {
      selectedCase: null,
    };
  });

  const stage3: Unit2SpreadsheetState['stage3AlAmeenRows'] = {};
  STAGE3_AL_AMEEN_ROWS.forEach((r) => {
    stage3[r.step] = {
      cash: '',
      machinery: '',
      furniture: '',
      receivables: '',
      supplies: '',
      payables: '',
      notesPayable: '',
      capital: '',
      revenues: '',
      expenses: '',
      drawings: '',
    };
  });

  return {
    stage1Events: stage1,
    stage2Cases: stage2,
    stage3AlAmeenRows: stage3,
    stage4Statements: {
      incomeServiceRevenues: '',
      incomeRentExpense: '',
      incomeNetProfit: '',
      equityBeginningCapital: '',
      equityNetProfitAdded: '',
      equityDrawingsDeducted: '',
      equityEndingCapital: '',
      balanceTotalCurrentAssets: '',
      balanceTotalNonCurrentAssets: '',
      balanceTotalAssets: '',
      balanceTotalLiabilities: '',
      balanceEndingEquity: '',
      balanceTotalLiabilitiesAndEquity: '',
    },
  };
}

export function loadSavedUnit2SpreadsheetState(): Unit2SpreadsheetState {
  if (typeof window === 'undefined') return createDefaultUnit2SpreadsheetState();
  try {
    const raw = window.localStorage.getItem(UNIT2_SPREADSHEET_STORAGE_KEY);
    if (!raw) return createDefaultUnit2SpreadsheetState();
    return JSON.parse(raw);
  } catch {
    return createDefaultUnit2SpreadsheetState();
  }
}

export function saveUnit2SpreadsheetState(state: Unit2SpreadsheetState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      UNIT2_SPREADSHEET_STORAGE_KEY,
      JSON.stringify(state)
    );
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(UNIT2_SPREADSHEET_UPDATED_EVENT));
    }, 0);
  } catch {
    // ignore
  }
}

export interface Unit2EvaluationResult {
  stage1Score: number; // 0 - 25
  stage2Score: number; // 0 - 25
  stage3Score: number; // 0 - 30
  stage4Score: number; // 0 - 20
  totalScore: number; // 0 - 100
  stage1Complete: boolean;
  stage2Complete: boolean;
  stage3Complete: boolean;
  stage4Complete: boolean;
  completedStagesCount: number;
}

export function evaluateUnit2SpreadsheetState(
  state: Unit2SpreadsheetState
): Unit2EvaluationResult {
  // تقييم المرحلة 1: شروط العملية المالية (4 أسئلة × 6.25 = 25)
  let s1Correct = 0;
  STAGE1_BOOK_EVENTS.forEach((ev) => {
    const ans = state.stage1Events[ev.id];
    if (
      ans &&
      ans.q1Monetary === ev.hasMonetaryValue &&
      ans.q2Affects === ev.affectsBalanceSheet &&
      ans.q3Occurred === ev.hasActuallyOccurred &&
      ans.userResult === ev.isFinancialTransaction
    ) {
      s1Correct += 1;
    }
  });
  const stage1Score = Math.round((s1Correct / STAGE1_BOOK_EVENTS.length) * 25);
  const stage1Complete = s1Correct === STAGE1_BOOK_EVENTS.length;

  // تقييم المرحلة 2: الحالات الأربعة (4 حالات × 6.25 = 25)
  let s2Correct = 0;
  STAGE2_EQUATION_RULES.forEach((r) => {
    const ans = state.stage2Cases[`case-${r.caseNumber}`];
    if (ans && ans.selectedCase === r.caseNumber) {
      s2Correct += 1;
    }
  });
  const stage2Score = Math.round((s2Correct / STAGE2_EQUATION_RULES.length) * 25);
  const stage2Complete = s2Correct === STAGE2_EQUATION_RULES.length;

  // تقييم المرحلة 3: جدول معادلة الميزانية لمحلات الأمين (10 عمليات × 3 = 30)
  let s3CorrectRows = 0;
  STAGE3_AL_AMEEN_ROWS.forEach((r) => {
    const u = state.stage3AlAmeenRows[r.step];
    if (u) {
      const match =
        Number(u.cash || 0) === r.cash &&
        Number(u.machinery || 0) === r.machinery &&
        Number(u.furniture || 0) === r.furniture &&
        Number(u.receivables || 0) === r.receivables &&
        Number(u.supplies || 0) === r.supplies &&
        Number(u.payables || 0) === r.payables &&
        Number(u.notesPayable || 0) === r.notesPayable &&
        Number(u.capital || 0) === r.capital &&
        Number(u.revenues || 0) === r.revenues &&
        Number(u.expenses || 0) === r.expenses &&
        Number(u.drawings || 0) === r.drawings;
      if (match) s3CorrectRows += 1;
    }
  });
  const stage3Score = Math.round((s3CorrectRows / STAGE3_AL_AMEEN_ROWS.length) * 30);
  const stage3Complete = s3CorrectRows === STAGE3_AL_AMEEN_ROWS.length;

  // تقييم المرحلة 4: القوائم المالية (20 علامة)
  const st = state.stage4Statements;
  const s4Items = [
    Number(st.incomeServiceRevenues) === AL_AMEEN_FINAL_BALANCES.serviceRevenues,
    Number(st.incomeRentExpense) === AL_AMEEN_FINAL_BALANCES.rentExpense,
    Number(st.incomeNetProfit) === AL_AMEEN_FINAL_BALANCES.netIncome,
    Number(st.equityBeginningCapital) === AL_AMEEN_FINAL_BALANCES.capital,
    Number(st.equityNetProfitAdded) === AL_AMEEN_FINAL_BALANCES.netIncome,
    Number(st.equityDrawingsDeducted) === AL_AMEEN_FINAL_BALANCES.drawings,
    Number(st.equityEndingCapital) === AL_AMEEN_FINAL_BALANCES.endingEquity,
    Number(st.balanceTotalAssets) === AL_AMEEN_FINAL_BALANCES.totalAssets,
    Number(st.balanceTotalLiabilities) === AL_AMEEN_FINAL_BALANCES.totalLiabilities,
    Number(st.balanceEndingEquity) === AL_AMEEN_FINAL_BALANCES.endingEquity,
    Number(st.balanceTotalLiabilitiesAndEquity) === AL_AMEEN_FINAL_BALANCES.totalLiabilitiesAndEquity,
  ];
  const s4Correct = s4Items.filter(Boolean).length;
  const stage4Score = Math.round((s4Correct / s4Items.length) * 20);
  const stage4Complete = s4Correct === s4Items.length;

  const totalScore = stage1Score + stage2Score + stage3Score + stage4Score;
  const completedStagesCount = [
    stage1Complete,
    stage2Complete,
    stage3Complete,
    stage4Complete,
  ].filter(Boolean).length;

  return {
    stage1Score,
    stage2Score,
    stage3Score,
    stage4Score,
    totalScore,
    stage1Complete,
    stage2Complete,
    stage3Complete,
    stage4Complete,
    completedStagesCount,
  };
}
