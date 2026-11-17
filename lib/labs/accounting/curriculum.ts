export type AccountingUnitNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface AccountingUnitMeta {
  unitNumber: AccountingUnitNumber;
  id: string;
  chapterTitle: string;
  subtitle: string;
  description: string;
  topics: { id: string; title: string }[];
  exerciseCount: number;
  isImplementedInPhase1: boolean;
  badgeTitle: string;
  badgeCode: string;
  estimatedMinutes: number;
}

export const ACCOUNTING_CURRICULUM: AccountingUnitMeta[] = [
  {
    unitNumber: 1,
    id: 'unit-1',
    chapterTitle: 'الوحدة 1: مدخل إلى علم المحاسبة',
    subtitle: 'تعلم المحاسبة من الصفر خطوة بخطوة بلغة بسيطة وتطبيق عملي',
    description:
      'رحلة تأسيسية متدرجة من 12 درساً قصيراً تشرح المحاسبة بأبسط أسلوب من الحياة اليومية وقصة محل حلويات سارة.',
    topics: [
      { id: 'u1-users', title: 'مفهوم المحاسبة وأهدافها والمستفيدون منها' },
      { id: 'u1-branches', title: 'نشأة المحاسبة وفروعها وعلاقتها بالعلوم' },
      { id: 'u1-equation-concepts', title: 'المفاهيم المحاسبية الأساسية' },
      { id: 'u1-assumptions-principles', title: 'الفروض والمبادئ والسياسات المحاسبية' },
      { id: 'u1-cycle-documents', title: 'المحاسبة كنظام للمعلومات' },
      { id: 'u1-chart-coding', title: 'مراجعة الوحدة والاختبار الختامي' },
    ],
    exerciseCount: 12,
    isImplementedInPhase1: true,
    badgeTitle: 'محلل المفاهيم المحاسبية',
    badgeCode: 'UNIT-01',
    estimatedMinutes: 45,
  },
  {
    unitNumber: 2,
    id: 'unit-2',
    chapterTitle: 'الوحدة 2: تحليل العمليات المالية',
    subtitle: 'معادلة الميزانية والترابط اللحظي بين القوائم المالية وفق IFRS',
    description:
      'تحليل العمليات المالية وتأثيرها على معادلة الميزانية (تبادل أصول، زيادة الطرفين، نقص الطرفين، عمليات مركبة)، والتعرف على القوائم المالية الأربعة والعلاقة بينها.',
    topics: [
      { id: 'u2-cycle', title: '1. ماهية الدورة المحاسبية' },
      { id: 'u2-tx-distinction', title: '2. التفرقة بين العمليات المالية وغير المالية' },
      { id: 'u2-equation', title: '3. التعرف على معادلة الميزانية' },
      { id: 'u2-equation-impact', title: '4. معرفة أثر العمليات المالية على معادلة الميزانية' },
      { id: 'u2-statements', title: '5. التعرف على القوائم المالية' },
      { id: 'u2-statements-link', title: '6. معرفة العلاقة بين القوائم المالية' },
    ],
    exerciseCount: 6,
    isImplementedInPhase1: true,
    badgeTitle: 'مهندس معادلة الميزانية',
    badgeCode: 'UNIT-02',
    estimatedMinutes: 45,
  },
  {
    unitNumber: 3,
    id: 'unit-3',
    chapterTitle: 'الوحدة 3: الدورة المحاسبية',
    subtitle: 'التسجيل، الترحيل، ميزان المراجعة، والقوائم المالية للمشاريع الخدمية',
    description:
      'دراسة وتطبيق الدورة المحاسبية كاملة وفق أهداف الفصل الثالث: القيد المزدوج، دفتر اليومية والقيود البسيطة والمركبة، دفتر الأستاذ وتصميم حسابات T، الترحيل والترصيد، إعداد ميزان المراجعة بالمجاميع والأرصدة، القوائم المالية للمشاريع الخدمية، وحل التمارين الشاملة (محلات حازم وتصنيف الحسابات).',
    topics: [
      { id: 'u3-debit-credit', title: '1. معرفة الطرف المدين والطرف الدائن للقيد المحاسبي' },
      { id: 'u3-recording', title: '2. كيفية تسجيل العمليات وعمل قيود اليومية' },
      { id: 'u3-journal-divisions', title: '3. معرفة دفتر اليومية وتقسيماته' },
      { id: 'u3-ledger-divisions', title: '4. التعرف على دفتر الأستاذ وتقسيماته' },
      { id: 'u3-posting', title: '5. كيفية الترحيل إلى دفتر الأستاذ' },
      { id: 'u3-balancing', title: '6. كيفية الترصيد واستخراج أرصدة الحسابات' },
      { id: 'u3-trial-balance', title: '7. التعرف على ميزان المراجعة' },
    ],
    exerciseCount: 7,
    isImplementedInPhase1: true,
    badgeTitle: 'مشغل الدورة المحاسبية',
    badgeCode: 'UNIT-03',
    estimatedMinutes: 50,
  },
  {
    unitNumber: 4,
    id: 'unit-4',
    chapterTitle: 'الوحدة 4: العمليات التمويلية والرأسمالية',
    subtitle: 'رأس المال، المسحوبات، القروض وفوائدها، وشراء وبيع الأصول الثابتة',
    description:
      'معالجة عمليات التأسيس والتمويل البنكي وسداد الأقساط واقتناء الأصول الثابتة نقداً وبالأجل وبدفعات مرحلية.',
    topics: [
      { id: 'u4-capital-drawings', title: 'تكوين رأس المال والمسحوبات' },
      { id: 'u4-loans', title: 'القروض البنكية والفوائد' },
      { id: 'u4-fixed-assets', title: 'شراء الأصول الثابتة وبيعها' },
    ],
    exerciseCount: 8,
    isImplementedInPhase1: false,
    badgeTitle: 'أخصائي التمويل والأصول',
    badgeCode: 'UNIT-04',
    estimatedMinutes: 30,
  },
  {
    unitNumber: 5,
    id: 'unit-5',
    chapterTitle: 'الوحدة 5: العمليات المالية للبضاعة (الجرد الدوري)',
    subtitle: 'المشتريات، المبيعات، المردودات، الخصم التجاري والنقدي، وتكلفة المبيعات',
    description:
      'إدارة شركة تجارية متكاملة عبر تسجيل المشتريات والمبيعات ومصاريف النقل والخصومات مع رسم شلال تفاعلي لحساب تكلفة البضاعة المباعة ومجمل الربح.',
    topics: [
      { id: 'u5-purchases', title: 'المشتريات ومردوداتها ونقلها' },
      { id: 'u5-sales', title: 'المبيعات ومردوداتها' },
      { id: 'u5-discounts', title: 'الخصم التجاري والنقدي' },
      { id: 'u5-cogs-waterfall', title: 'تكلفة البضاعة المباعة ومجمل الربح' },
    ],
    exerciseCount: 10,
    isImplementedInPhase1: false,
    badgeTitle: 'مدير العمليات التجارية',
    badgeCode: 'UNIT-05',
    estimatedMinutes: 40,
  },
  {
    unitNumber: 6,
    id: 'unit-6',
    chapterTitle: 'الوحدة 6: الأوراق التجارية',
    subtitle: 'الشيكات، الكمبيالات، سندات السحب، التظهير، والخصم لدى البنك',
    description:
      'محاكاة كاملة للشيكات المرتدة والكمبيالات من منظور الساحب والمسحوب عليه والمستفيد مع خط زمني لحساب تاريخ الاستحقاق والخصم.',
    topics: [
      { id: 'u6-checks', title: 'الشيكات وتحصيلها وارتدادها' },
      { id: 'u6-notes', title: 'الكمبيالة وسند السحب' },
      { id: 'u6-endorse-discount', title: 'التظهير والخصم لدى البنك' },
    ],
    exerciseCount: 8,
    isImplementedInPhase1: false,
    badgeTitle: 'خبير الأوراق التجارية',
    badgeCode: 'UNIT-06',
    estimatedMinutes: 30,
  },
  {
    unitNumber: 7,
    id: 'unit-7',
    chapterTitle: 'الوحدة 7: اكتشاف الأخطاء المحاسبية وتصحيحها',
    subtitle: 'أنواع الأخطاء، تحليل فرق الميزان، وقيود التصحيح',
    description:
      'تحدي "افحص الدفاتر" لاكتشاف أخطاء السهو والمبدأ والعكس وتبديل الأرقام باستخدام قاعدة القسمة على 9 ونصف الفرق وكتابة قيد التصحيح.',
    topics: [
      { id: 'u7-error-types', title: 'تصنيف الأخطاء المحاسبية' },
      { id: 'u7-audit-game', title: 'لعبة فحص الدفاتر وكشف الفرق' },
      { id: 'u7-corrections', title: 'قيود التصحيح النظامية' },
    ],
    exerciseCount: 8,
    isImplementedInPhase1: false,
    badgeTitle: 'مدقق الدفاتر الأول',
    badgeCode: 'UNIT-07',
    estimatedMinutes: 30,
  },
  {
    unitNumber: 8,
    id: 'unit-8',
    chapterTitle: 'الوحدة 8: القوائم المالية',
    subtitle: 'الدخل، حقوق الملكية، المركز المالي، التدفقات النقدية، والتحليل المالي',
    description:
      'إعداد القوائم المالية الأربع انطلاقاً من ميزان المراجعة مع التحقق التلقائي من ترابطها وتحليل نسب السيولة والربحية.',
    topics: [
      { id: 'u8-income-equity', title: 'قائمة الدخل وحقوق الملكية' },
      { id: 'u8-balance-cashflow', title: 'المركز المالي والتدفقات النقدية' },
      { id: 'u8-ratios', title: 'تحليل القوائم والنسب المالية' },
    ],
    exerciseCount: 8,
    isImplementedInPhase1: false,
    badgeTitle: 'معد القوائم المالية المعتمد',
    badgeCode: 'UNIT-08',
    estimatedMinutes: 35,
  },
];

export const UNLOCK_THRESHOLD_PERCENT = 70;
