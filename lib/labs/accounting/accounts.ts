/**
 * دليل الحسابات الأساسي ووحدة العملة (الفلس: 1 دينار أردني = 1000 فلس)
 * جميع المبالغ تُخزَّن وتُحسب كأعداد صحيحة بوحدة الفلس لتجنب أخطاء الفاصلة العشرية.
 */

export type Fils = number;

export type AccountCategory =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'revenue'
  | 'expense';

export type AccountSubCategory =
  | 'current_asset'
  | 'fixed_asset'
  | 'current_liability'
  | 'long_term_liability'
  | 'capital'
  | 'drawings'
  | 'operating_revenue'
  | 'contra_revenue'
  | 'other_revenue'
  | 'cost_of_goods'
  | 'contra_purchase'
  | 'operating_expense'
  | 'financing_expense';

export type NormalBalance = 'debit' | 'credit';

export interface AccountDefinition {
  id: string;
  code: string;
  nameAr: string;
  category: AccountCategory;
  subCategory: AccountSubCategory;
  normalBalance: NormalBalance;
  isContra?: boolean;
  isCashEquivalent?: boolean;
  statementPlacement: 'balance_sheet' | 'income_statement' | 'equity_statement';
  keywords: string[];
  descriptionAr: string;
}

export const FILS_PER_JOD = 1000;

export function jodToFils(jod: number): Fils {
  if (!Number.isFinite(jod)) return 0;
  return Math.round(jod * FILS_PER_JOD);
}

export function filsToJod(fils: Fils): number {
  if (!Number.isFinite(fils)) return 0;
  return fils / FILS_PER_JOD;
}

export function parseJodInputToFils(input: string | number): Fils {
  if (typeof input === 'number') {
    return jodToFils(input);
  }
  const normalized = input.replace(/,/g, '').trim();
  if (!normalized) return 0;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * FILS_PER_JOD);
}

export function formatFils(
  fils: Fils,
  options?: { forceDecimals?: boolean; withCurrency?: boolean }
): string {
  const safeFils = Math.round(Number.isFinite(fils) ? fils : 0);
  const absFils = Math.abs(safeFils);
  const wholeJod = Math.floor(absFils / FILS_PER_JOD);
  const remFils = absFils % FILS_PER_JOD;
  const sign = safeFils < 0 ? '-' : '';
  const wholeFormatted = wholeJod.toLocaleString('en-US');

  let numberStr = `${sign}${wholeFormatted}`;
  if (options?.forceDecimals || remFils !== 0) {
    numberStr = `${sign}${wholeFormatted}.${String(remFils).padStart(3, '0')}`;
  }

  if (options?.withCurrency) {
    return `${numberStr} دينار`;
  }
  return numberStr;
}

export function formatFilsShort(fils: Fils): string {
  return `${formatFils(fils)} د.أ`;
}

export const CHART_OF_ACCOUNTS: AccountDefinition[] = [
  // الأصول المتداولة (11xx)
  {
    id: 'cash',
    code: '1101',
    nameAr: 'النقدية في الصندوق',
    category: 'asset',
    subCategory: 'current_asset',
    normalBalance: 'debit',
    isCashEquivalent: true,
    statementPlacement: 'balance_sheet',
    keywords: ['نقد', 'صندوق', 'كاش', 'نقدا', 'نقدية'],
    descriptionAr: 'الأموال النقدية الموجودة في خزينة المنشأة.',
  },
  {
    id: 'bank',
    code: '1102',
    nameAr: 'النقدية لدى البنك',
    category: 'asset',
    subCategory: 'current_asset',
    normalBalance: 'debit',
    isCashEquivalent: true,
    statementPlacement: 'balance_sheet',
    keywords: ['بنك', 'شيك', 'حساب بنكي', 'تحويل', 'مصرف'],
    descriptionAr: 'الأرصدة المودعة في الحسابات الجارية لدى البنوك.',
  },
  {
    id: 'accounts_receivable',
    code: '1103',
    nameAr: 'المدينون (الذمم المدينة)',
    category: 'asset',
    subCategory: 'current_asset',
    normalBalance: 'debit',
    statementPlacement: 'balance_sheet',
    keywords: ['مدينون', 'ذمم مدينة', 'عملاء', 'آجل', 'على الحساب'],
    descriptionAr: 'المبالغ المستحقة للمنشأة على العملاء نتيجة البيع أو تقديم الخدمات بالآجل.',
  },
  {
    id: 'notes_receivable',
    code: '1104',
    nameAr: 'أوراق القبض',
    category: 'asset',
    subCategory: 'current_asset',
    normalBalance: 'debit',
    statementPlacement: 'balance_sheet',
    keywords: ['ورقة قبض', 'كمبيالة', 'سند سحب', 'أوراق قبض'],
    descriptionAr: 'الكمبيالات وسندات السحب المحررة لصالح المنشأة والمستحقة التحصيل.',
  },
  {
    id: 'inventory',
    code: '1105',
    nameAr: 'البضاعة (المخزون السلعي)',
    category: 'asset',
    subCategory: 'current_asset',
    normalBalance: 'debit',
    statementPlacement: 'balance_sheet',
    keywords: ['بضاعة', 'مخزون', 'سلع', 'مخزون أول المدة', 'مخزون آخر المدة'],
    descriptionAr: 'البضائع المملوكة للمنشأة والمعدة لإعادة البيع.',
  },

  // الأصول الثابتة (12xx)
  {
    id: 'furniture',
    code: '1201',
    nameAr: 'الأثاث والتجهيزات',
    category: 'asset',
    subCategory: 'fixed_asset',
    normalBalance: 'debit',
    statementPlacement: 'balance_sheet',
    keywords: ['أثاث', 'مكاتب', 'مفروشات', 'ديكور'],
    descriptionAr: 'الأثاث المكتبي والتجهيزات المستخدمة في مقرات المنشأة.',
  },
  {
    id: 'equipment',
    code: '1202',
    nameAr: 'الأجهزة والمعدات',
    category: 'asset',
    subCategory: 'fixed_asset',
    normalBalance: 'debit',
    statementPlacement: 'balance_sheet',
    keywords: ['أجهزة', 'معدات', 'حاسوب', 'كمبيوتر', 'آلات', 'خوادم'],
    descriptionAr: 'الأجهزة الحاسوبية والمعدات التشغيلية المقتناة للاستخدام المستمر.',
  },
  {
    id: 'vehicles',
    code: '1203',
    nameAr: 'السيارات ووسائط النقل',
    category: 'asset',
    subCategory: 'fixed_asset',
    normalBalance: 'debit',
    statementPlacement: 'balance_sheet',
    keywords: ['سيارة', 'سيارات', 'مركبات', 'شاحنة', 'نقل'],
    descriptionAr: 'المركبات المملوكة للمنشأة والمستخدمة في أعمالها.',
  },
  {
    id: 'land',
    code: '1204',
    nameAr: 'الأراضي',
    category: 'asset',
    subCategory: 'fixed_asset',
    normalBalance: 'debit',
    statementPlacement: 'balance_sheet',
    keywords: ['أرض', 'أراضي', 'قطعة أرض'],
    descriptionAr: 'الأراضي المملوكة للمنشأة والمستخدمة في نشاطها.',
  },
  {
    id: 'buildings',
    code: '1205',
    nameAr: 'المباني والعقارات',
    category: 'asset',
    subCategory: 'fixed_asset',
    normalBalance: 'debit',
    statementPlacement: 'balance_sheet',
    keywords: ['مبنى', 'مباني', 'عقار', 'مستودع', 'مقر'],
    descriptionAr: 'المباني والمقرات الإدارية والتجارية المملوكة للمنشأة.',
  },

  // الالتزامات (21xx - 22xx)
  {
    id: 'accounts_payable',
    code: '2101',
    nameAr: 'الدائنون (الذمم الدائنة)',
    category: 'liability',
    subCategory: 'current_liability',
    normalBalance: 'credit',
    statementPlacement: 'balance_sheet',
    keywords: ['دائنون', 'ذمم دائنة', 'موردون', 'بالآجل', 'على الحساب'],
    descriptionAr: 'الالتزامات المستحقة على المنشأة لصالح الموردين نتيجة الشراء بالآجل.',
  },
  {
    id: 'notes_payable',
    code: '2102',
    nameAr: 'أوراق الدفع',
    category: 'liability',
    subCategory: 'current_liability',
    normalBalance: 'credit',
    statementPlacement: 'balance_sheet',
    keywords: ['ورقة دفع', 'كمبيالة', 'أوراق دفع', 'تعهد دفع'],
    descriptionAr: 'الكمبيالات التي تعهدت المنشأة بسدادها للغير في تواريخ استحقاق محددة.',
  },
  {
    id: 'accrued_expenses',
    code: '2103',
    nameAr: 'مصروفات مستحقة الدفع',
    category: 'liability',
    subCategory: 'current_liability',
    normalBalance: 'credit',
    statementPlacement: 'balance_sheet',
    keywords: ['مصروف مستحق', 'رواتب مستحقة', 'إيجار مستحق'],
    descriptionAr: 'مصروفات تخص الفترة المالية الحالية ولم تسدد نقداً بعد.',
  },
  {
    id: 'unearned_revenue',
    code: '2104',
    nameAr: 'إيرادات مقبوضة مقدماً',
    category: 'liability',
    subCategory: 'current_liability',
    normalBalance: 'credit',
    statementPlacement: 'balance_sheet',
    keywords: ['مقدم', 'مقبوض مقدما', 'دفعة مقدمة من عميل'],
    descriptionAr: 'مبالغ استلمتها المنشأة من العملاء قبل تقديم الخدمة أو تسليم البضاعة.',
  },
  {
    id: 'loans',
    code: '2201',
    nameAr: 'القروض البنكية',
    category: 'liability',
    subCategory: 'long_term_liability',
    normalBalance: 'credit',
    statementPlacement: 'balance_sheet',
    keywords: ['قرض', 'قروض', 'تمويل بنكي', 'تسهيلات'],
    descriptionAr: 'الالتزامات التمويلية المستحقة للبنوك والمؤسسات المالية.',
  },

  // حقوق الملكية (31xx)
  {
    id: 'capital',
    code: '3101',
    nameAr: 'رأس المال',
    category: 'equity',
    subCategory: 'capital',
    normalBalance: 'credit',
    statementPlacement: 'equity_statement',
    keywords: ['رأس مال', 'تأسيس', 'استثمار المالك', 'ملكية'],
    descriptionAr: 'المبالغ والأصول التي يودعها المالك لتمويل نشاط المنشأة.',
  },
  {
    id: 'drawings',
    code: '3102',
    nameAr: 'المسحوبات الشخصية',
    category: 'equity',
    subCategory: 'drawings',
    normalBalance: 'debit',
    isContra: true,
    statementPlacement: 'equity_statement',
    keywords: ['مسحوبات', 'سحب شخصي', 'استعمال شخصي'],
    descriptionAr: 'ما يسحبه المالك من نقد أو بضاعة لاستخدامه الشخصي ويخفض حقوق الملكية.',
  },

  // الإيرادات ومقابلاتها (41xx)
  {
    id: 'sales',
    code: '4101',
    nameAr: 'المبيعات',
    category: 'revenue',
    subCategory: 'operating_revenue',
    normalBalance: 'credit',
    statementPlacement: 'income_statement',
    keywords: ['مبيعات', 'بيع بضاعة', 'إيراد مبيعات'],
    descriptionAr: 'إجمالي قيمة البضائع المباعة للعملاء نقداً أو بالآجل.',
  },
  {
    id: 'service_revenue',
    code: '4102',
    nameAr: 'إيراد الخدمات',
    category: 'revenue',
    subCategory: 'operating_revenue',
    normalBalance: 'credit',
    statementPlacement: 'income_statement',
    keywords: ['إيراد خدمات', 'استشارات', 'خدمات مقدمة', 'أتعاب'],
    descriptionAr: 'الإيرادات المتحققة من تقديم الخدمات التشغيلية للعملاء.',
  },
  {
    id: 'sales_returns',
    code: '4103',
    nameAr: 'مردودات ومسموحات المبيعات',
    category: 'revenue',
    subCategory: 'contra_revenue',
    normalBalance: 'debit',
    isContra: true,
    statementPlacement: 'income_statement',
    keywords: ['مردودات مبيعات', 'مرتجع مبيعات', 'مسموحات مبيعات'],
    descriptionAr: 'قيمة البضاعة المرتجعة من العملاء أو التخفيضات الممنوحة لهم (حساب مقابل للإيراد).',
  },
  {
    id: 'sales_discount',
    code: '4104',
    nameAr: 'خصم المبيعات المسموح به',
    category: 'revenue',
    subCategory: 'contra_revenue',
    normalBalance: 'debit',
    isContra: true,
    statementPlacement: 'income_statement',
    keywords: ['خصم مسموح به', 'خصم نقدي مبيعات', 'خصم تعجيل الدفع'],
    descriptionAr: 'الخصم النقدي الممنوح للعملاء عند السداد المبكر (يُطرح من المبيعات).',
  },
  {
    id: 'other_revenue',
    code: '4201',
    nameAr: 'الإيرادات المتنوعة',
    category: 'revenue',
    subCategory: 'other_revenue',
    normalBalance: 'credit',
    statementPlacement: 'income_statement',
    keywords: ['إيرادات أخرى', 'إيرادات متنوعة', 'فوائد دائنة', 'إيراد إيجار'],
    descriptionAr: 'إيرادات غير متكررة أو فرعية مثل الفوائد الدائنة وإيجارات العقار الفائض.',
  },

  // المشتريات والمصروفات (51xx - 53xx)
  {
    id: 'purchases',
    code: '5101',
    nameAr: 'المشتريات',
    category: 'expense',
    subCategory: 'cost_of_goods',
    normalBalance: 'debit',
    statementPlacement: 'income_statement',
    keywords: ['مشتريات', 'شراء بضاعة', 'بضاعة مشتراة'],
    descriptionAr: 'تكلفة البضاعة المشتراة بغرض إعادة البيع وفق نظام الجرد الدوري.',
  },
  {
    id: 'purchase_returns',
    code: '5102',
    nameAr: 'مردودات ومسموحات المشتريات',
    category: 'expense',
    subCategory: 'contra_purchase',
    normalBalance: 'credit',
    isContra: true,
    statementPlacement: 'income_statement',
    keywords: ['مردودات مشتريات', 'مرتجع مشتريات', 'مسموحات مشتريات'],
    descriptionAr: 'قيمة البضاعة المردودة للموردين أو التخفيضات المحصلة منهم (تخفض تكلفة المشتريات).',
  },
  {
    id: 'purchase_discount',
    code: '5103',
    nameAr: 'خصم المشتريات المكتسب',
    category: 'expense',
    subCategory: 'contra_purchase',
    normalBalance: 'credit',
    isContra: true,
    statementPlacement: 'income_statement',
    keywords: ['خصم مكتسب', 'خصم مشتريات', 'خصم تعجيل دفع'],
    descriptionAr: 'الخصم النقدي الذي تحصل عليه المنشأة من المورد عند السداد خلال مهلة الخصم.',
  },
  {
    id: 'freight_in',
    code: '5104',
    nameAr: 'مصاريف نقل المشتريات',
    category: 'expense',
    subCategory: 'cost_of_goods',
    normalBalance: 'debit',
    statementPlacement: 'income_statement',
    keywords: ['نقل للداخل', 'نقل مشتريات', 'شحن مشتريات', 'رسوم جمركية'],
    descriptionAr: 'تكاليف شحن ونقل البضاعة المشتراة حتى مستودعات المنشأة.',
  },
  {
    id: 'cogs',
    code: '5105',
    nameAr: 'تكلفة البضاعة المباعة',
    category: 'expense',
    subCategory: 'cost_of_goods',
    normalBalance: 'debit',
    statementPlacement: 'income_statement',
    keywords: ['تكلفة مبيعات', 'تكلفة بضاعة مباعة'],
    descriptionAr: 'التكلفة الفعلية للبضاعة التي تم بيعها خلال الفترة.',
  },
  {
    id: 'rent_expense',
    code: '5201',
    nameAr: 'مصروف الإيجار',
    category: 'expense',
    subCategory: 'operating_expense',
    normalBalance: 'debit',
    statementPlacement: 'income_statement',
    keywords: ['إيجار', 'أجرة مقر', 'إيجار مكتب'],
    descriptionAr: 'بدل استئجار المقرات والمكاتب والمستودعات التشغيلية.',
  },
  {
    id: 'salaries_expense',
    code: '5202',
    nameAr: 'مصروف الرواتب والأجور',
    category: 'expense',
    subCategory: 'operating_expense',
    normalBalance: 'debit',
    statementPlacement: 'income_statement',
    keywords: ['رواتب', 'أجور', 'موظفين', 'معاشات'],
    descriptionAr: 'رواتب وأجور الموظفين والعاملين في المنشأة.',
  },
  {
    id: 'utilities_expense',
    code: '5203',
    nameAr: 'مصروف الكهرباء والمياه',
    category: 'expense',
    subCategory: 'operating_expense',
    normalBalance: 'debit',
    statementPlacement: 'income_statement',
    keywords: ['كهرباء', 'مياه', 'مرافق', 'فواتير', 'اتصالات'],
    descriptionAr: 'فواتير الطاقة والمياه والاتصالات والخدمات العامة.',
  },
  {
    id: 'advertising_expense',
    code: '5204',
    nameAr: 'مصروف الدعاية والإعلان',
    category: 'expense',
    subCategory: 'operating_expense',
    normalBalance: 'debit',
    statementPlacement: 'income_statement',
    keywords: ['إعلان', 'دعاية', 'تسويق', 'ترويج'],
    descriptionAr: 'تكاليف الحملات التسويقية والإعلانات الترويجية.',
  },
  {
    id: 'maintenance_expense',
    code: '5205',
    nameAr: 'مصروف الصيانة والإصلاح',
    category: 'expense',
    subCategory: 'operating_expense',
    normalBalance: 'debit',
    statementPlacement: 'income_statement',
    keywords: ['صيانة', 'إصلاح', 'تصليح'],
    descriptionAr: 'نفقات الصيانة الدورية للمحافظة على كفاءة الأجهزة والمباني.',
  },
  {
    id: 'supplies_expense',
    code: '5206',
    nameAr: 'مصروف القرطاسية واللوازم',
    category: 'expense',
    subCategory: 'operating_expense',
    normalBalance: 'debit',
    statementPlacement: 'income_statement',
    keywords: ['قرطاسية', 'لوازم مكتبية', 'أوراق', 'مطبوعات'],
    descriptionAr: 'قيمة الأدوات واللوازم المكتبية المستهلكة خلال الفترة.',
  },
  {
    id: 'bank_charges',
    code: '5207',
    nameAr: 'عمولة ومصاريف بنكية',
    category: 'expense',
    subCategory: 'operating_expense',
    normalBalance: 'debit',
    statementPlacement: 'income_statement',
    keywords: ['عمولة بنكية', 'مصاريف تحصيل', 'مصاريف خصم كمبيالة'],
    descriptionAr: 'العمولات والرسوم البنكية على الشيكات وتحصيل الأوراق التجارية.',
  },
  {
    id: 'interest_expense',
    code: '5301',
    nameAr: 'مصروف فوائد القروض',
    category: 'expense',
    subCategory: 'financing_expense',
    normalBalance: 'debit',
    statementPlacement: 'income_statement',
    keywords: ['فوائد', 'فائدة قرض', 'مصاريف تمويل'],
    descriptionAr: 'تكلفة الفوائد المترتبة على القروض والتسهيلات البنكية.',
  },
];

const ACCOUNT_MAP = new Map<string, AccountDefinition>(
  CHART_OF_ACCOUNTS.map((acc) => [acc.id, acc])
);

export function getAccountById(id: string): AccountDefinition | undefined {
  return ACCOUNT_MAP.get(id);
}

export function getAccountName(id: string): string {
  return ACCOUNT_MAP.get(id)?.nameAr || id;
}

export function searchAccounts(
  query: string,
  categoryFilter?: AccountCategory | 'all'
): AccountDefinition[] {
  const q = query.trim().toLowerCase();
  return CHART_OF_ACCOUNTS.filter((acc) => {
    if (categoryFilter && categoryFilter !== 'all' && acc.category !== categoryFilter) {
      return false;
    }
    if (!q) return true;
    return (
      acc.nameAr.toLowerCase().includes(q) ||
      acc.code.includes(q) ||
      acc.id.toLowerCase().includes(q) ||
      acc.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  });
}

export function getCategoryLabelAr(category: AccountCategory): string {
  switch (category) {
    case 'asset':
      return 'الأصول';
    case 'liability':
      return 'الالتزامات';
    case 'equity':
      return 'حقوق الملكية';
    case 'revenue':
      return 'الإيرادات';
    case 'expense':
      return 'المصروفات';
  }
}

export function getNormalBalanceLabelAr(balance: NormalBalance): string {
  return balance === 'debit' ? 'مدين' : 'دائن';
}
