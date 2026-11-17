import { Fils, jodToFils } from './accounts';

export type Unit1TopicId =
  | 'u1-users'
  | 'u1-branches'
  | 'u1-equation-concepts'
  | 'u1-assumptions-principles'
  | 'u1-cycle-documents'
  | 'u1-chart-coding';

export interface Unit1ExerciseMeta {
  id: string;
  stationNumber: 1 | 2 | 3 | 4 | 5 | 6;
  topicId: Unit1TopicId;
  title: string;
  xpReward: number;
}

export interface Unit1QuizQuestion {
  id: string;
  topicId: Unit1TopicId;
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation: string;
}

export interface AccountingDimensionCard {
  id: 'science' | 'art' | 'info-system';
  title: string;
  subtitle: string;
  summary: string;
  milestoneTag: string;
}

export interface ProcessStageNode {
  id: string;
  stepNumber: number;
  title: string;
  detail: string;
}

export interface FinancialOutputNode {
  id: 'income_statement' | 'equity_statement' | 'balance_sheet' | 'cash_flow';
  title: string;
  objectiveTitle: string;
  detail: string;
  timeScope: string;
}

export interface OutputGoalQuestion {
  id: string;
  prompt: string;
  correctOutputId: FinancialOutputNode['id'];
  explanation: string;
}

export interface AccountingUserNode {
  id: string;
  group: 'internal' | 'external';
  title: string;
  subLabel: string;
  needDescription: string;
}

export interface UsersRouterChallenge {
  id: string;
  questionPrompt: string;
  correctUserId: string;
  explanation: string;
}

export interface AccountingBranchNode {
  id: string;
  title: string;
  subtitle: string;
  eraOrBasis: string;
  description: string;
  subBranches?: {
    id: string;
    title: string;
    items?: string[];
  }[];
}

export interface RelatedScienceNode {
  id: 'management' | 'economics' | 'law' | 'statistics' | 'operations_cs';
  title: string;
  embodimentBranch: string;
  summary: string;
  keyTools: string[];
}

export interface HistoryEraMilestone {
  id: string;
  eraLabel: string;
  title: string;
  accountingContribution: string;
}

export interface BranchChallengeQuestion {
  id: string;
  prompt: string;
  correctBranchId: string;
  explanation: string;
}

export interface ScienceHistoryQuestion {
  id: string;
  prompt: string;
  correctTargetId: string;
  options: { id: string; label: string }[];
  explanation: string;
}

export interface EquationElementConcept {
  id: 'assets' | 'liabilities' | 'equity' | 'revenues' | 'expenses';
  title: string;
  altTitle: string;
  authorsDef: string;
  standardsDef: string;
  examples: string;
  colorClass: string;
}

export interface EquationFlowPuzzle {
  id: string;
  title: string;
  scenarioPrompt: string;
  assetsFils: Fils | null;
  liabilitiesFils: Fils | null;
  beginningCapitalFils: Fils;
  revenuesFils: Fils;
  expensesFils: Fils;
  drawingsFils: Fils;
  questionLabel: string;
  missingField: 'net_income' | 'equity' | 'assets';
  correctAmountFils: Fils;
  explanation: string;
}

export interface ConceptualPillarItem {
  id: string;
  pillarType: 'assumption' | 'principle' | 'convention';
  title: string;
  enTitle: string;
  shortRule: string;
  keyDetails: string[];
}

export interface ViolationScenarioCase {
  id: string;
  exerciseGroupId: 'u1-ex-6' | 'u1-ex-7' | 'u1-ex-8';
  title: string;
  story: string;
  wrongAccountingTreatment: string;
  wrongNumberLabel: string;
  wrongNumberFils: Fils;
  correctedAccountingTreatment: string;
  correctedNumberLabel: string;
  correctedNumberFils: Fils;
  correctRuleId: string;
  options: { id: string; label: string }[];
  explanation: string;
}

export interface DocumentClassItem {
  id: string;
  title: string;
  exampleNote: string;
  category: 'internal' | 'external';
  proofStrength: string;
}

export interface LedgerBookClassItem {
  id: string;
  title: string;
  enTitle?: string;
  roleSummary: string;
  requirement: 'mandatory' | 'optional';
}

export interface SystemComponentPill {
  id: string;
  title: string;
  enTitle: string;
  role: string;
}

export interface AccountGroupHierarchy {
  groupCode: '1' | '2' | '3' | '4' | '5';
  groupTitle: string;
  normalBalance: 'debit' | 'credit';
  statementTarget: string;
  subCategories: {
    subCode: string;
    subTitle: string;
    accounts: { code: string; name: string }[];
  }[];
}

export interface AccountCodingPracticeItem {
  id: string;
  accountName: string;
  hint: string;
  correctGroupCode: AccountGroupHierarchy['groupCode'];
  subCode: string;
  subTitle: string;
  generatedCode: string;
  normalBalanceAr: 'مدين' | 'دائن';
  statementTarget: string;
}

export const UNIT1_STATIONS: {
  stationNumber: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  shortTitle: string;
  pagesRef: string;
  topicId: Unit1TopicId;
  exerciseIds: string[];
}[] = [
  {
    stationNumber: 1,
    title: 'خريطة النظام المحاسبي ومستخدميه',
    shortTitle: 'النظام والمستخدمون',
    pagesRef: 'ص 14 - 17',
    topicId: 'u1-users',
    exerciseIds: ['u1-ex-1', 'u1-ex-2'],
  },
  {
    stationNumber: 2,
    title: 'شجرة الفروع وعلاقتها بالعلوم والتاريخ',
    shortTitle: 'الفروع والعلوم',
    pagesRef: 'ص 18 - 24',
    topicId: 'u1-branches',
    exerciseIds: ['u1-ex-3', 'u1-ex-4'],
  },
  {
    stationNumber: 3,
    title: 'معادلة الميزانية وتدفق قائمة الدخل',
    shortTitle: 'المعادلة والدخل',
    pagesRef: 'ص 24 - 27',
    topicId: 'u1-equation-concepts',
    exerciseIds: ['u1-ex-5'],
  },
  {
    stationNumber: 4,
    title: 'الإطار الفكري وكشف الانتهاكات المحاسبية',
    shortTitle: 'الفروض والمبادئ',
    pagesRef: 'ص 27 - 33',
    topicId: 'u1-assumptions-principles',
    exerciseIds: ['u1-ex-6', 'u1-ex-7', 'u1-ex-8'],
  },
  {
    stationNumber: 5,
    title: 'تدفق المجموعة المستندية والدفترية',
    shortTitle: 'المستندات والدفاتر',
    pagesRef: 'ص 33 - 35',
    topicId: 'u1-cycle-documents',
    exerciseIds: ['u1-ex-9'],
  },
  {
    stationNumber: 6,
    title: 'شجرة دليل الحسابات والترميز الرقمي',
    shortTitle: 'دليل الحسابات',
    pagesRef: 'ص 36',
    topicId: 'u1-chart-coding',
    exerciseIds: ['u1-ex-10'],
  },
];

export const UNIT1_EXERCISES_META: Unit1ExerciseMeta[] = [
  {
    id: 'u1-ex-1',
    stationNumber: 1,
    topicId: 'u1-users',
    title: 'ربط مخرجات القوائم المالية بأهدافها الأربعة',
    xpReward: 30,
  },
  {
    id: 'u1-ex-2',
    stationNumber: 1,
    topicId: 'u1-users',
    title: 'موجه المستخدمين الداخليين والخارجيين',
    xpReward: 40,
  },
  {
    id: 'u1-ex-3',
    stationNumber: 2,
    topicId: 'u1-branches',
    title: 'تحدي تصنيف فروع علم المحاسبة السبعة',
    xpReward: 40,
  },
  {
    id: 'u1-ex-4',
    stationNumber: 2,
    topicId: 'u1-branches',
    title: 'رادار العلوم الخمسة ومحطات التطور التاريخي',
    xpReward: 40,
  },
  {
    id: 'u1-ex-5',
    stationNumber: 3,
    topicId: 'u1-equation-concepts',
    title: 'محاكي المعادلة المحاسبية وتدفق صافي الدخل لحقوق الملكية',
    xpReward: 45,
  },
  {
    id: 'u1-ex-6',
    stationNumber: 4,
    topicId: 'u1-assumptions-principles',
    title: 'المدقق الذكي (1): كشف انتهاك الفروض المحاسبية',
    xpReward: 45,
  },
  {
    id: 'u1-ex-7',
    stationNumber: 4,
    topicId: 'u1-assumptions-principles',
    title: 'المدقق الذكي (2): كشف انتهاك التكلفة التاريخية وتحقق الإيراد',
    xpReward: 50,
  },
  {
    id: 'u1-ex-8',
    stationNumber: 4,
    topicId: 'u1-assumptions-principles',
    title: 'المدقق الذكي (3): المقابلة والإفصاح والحيطة والثبات',
    xpReward: 50,
  },
  {
    id: 'u1-ex-9',
    stationNumber: 5,
    topicId: 'u1-cycle-documents',
    title: 'تصنيف المستندات والدفاتر الإلزامية وفق القانون التجاري الأردني',
    xpReward: 55,
  },
  {
    id: 'u1-ex-10',
    stationNumber: 6,
    topicId: 'u1-chart-coding',
    title: 'مولد الكود المحاسبي في شجرة المجموعات الخمس',
    xpReward: 60,
  },
];

// ===================== المحطة 1: النظام المحاسبي والمستخدمون =====================

export const ACCOUNTING_DIMENSIONS: AccountingDimensionCard[] = [
  {
    id: 'science',
    title: 'المحاسبة علم',
    subtitle: 'أسس علمية ونظرية',
    summary:
      'تقوم على مجموعة مترابطة من المفاهيم والفروض والمبادئ والأسس العلمية التي تحكم القياس والإفصاح المحاسبي.',
    milestoneTag: 'قواعد ونظريات',
  },
  {
    id: 'art',
    title: 'المحاسبة فن',
    subtitle: 'مهارة تطبيقية ومهنية',
    summary:
      'تمثل فن تسجيل وتبويب وتلخيص العمليات والأحداث المالية بأسلوب عملي منظم يستخرج النتائج الدقيقة (تعريف AICPA 1941).',
    milestoneTag: 'مسك الدفاتر والتحليل',
  },
  {
    id: 'info-system',
    title: 'نظام للمعلومات',
    subtitle: 'تحديد وقياس وتوصيل',
    summary:
      'نظام يحوّل البيانات المالية إلى تقارير وقوائم تساعد متخذي القرار الداخليين والخارجيين على ترشيد قراراتهم (AAA 1966)، ويمتد لقياس الرفاهية الاجتماعية (1975).',
    milestoneTag: 'ترشيد القرار والرفاهية',
  },
];

export const SYSTEM_PROCESS_STEPS: ProcessStageNode[] = [
  {
    id: 'analyze',
    stepNumber: 1,
    title: 'التحليل',
    detail: 'فحص العملية من المستند المؤيد وتحديد أطرافها المدينة والدائنة.',
  },
  {
    id: 'record',
    stepNumber: 2,
    title: 'التسجيل',
    detail: 'إثبات القيود المحاسبية في دفتر اليومية العامة حسب تسلسل التاريخ.',
  },
  {
    id: 'classify',
    stepNumber: 3,
    title: 'التبويب والتصنيف',
    detail: 'ترحيل العمليات إلى حسابات دفتر الأستاذ المتجانسة لاستخراج الأرصدة.',
  },
  {
    id: 'summarize',
    stepNumber: 4,
    title: 'التلخيص',
    detail: 'إعداد ميزان المراجعة وإصدار القوائم المالية الأربع في نهاية الفترة.',
  },
];

export const FINANCIAL_OUTPUT_NODES: FinancialOutputNode[] = [
  {
    id: 'income_statement',
    title: 'قائمة الدخل',
    objectiveTitle: 'قياس نتائج الأعمال (ربح أو خسارة)',
    detail:
      'تقابل إيرادات المشروع بمصروفاته خلال فترة زمنية محددة للوصول إلى صافي الربح أو الخسارة.',
    timeScope: 'عن فترة زمنية منتهية',
  },
  {
    id: 'equity_statement',
    title: 'قائمة التغير في حقوق الملكية',
    objectiveTitle: 'قياس التغير في حقوق أصحاب المشروع',
    detail:
      'توضح حركة رأس المال بداية الفترة مع الإضافات والأرباح وطرح المسحوبات الشخصية للوصول للرصيد النهائي.',
    timeScope: 'خلال الفترة المالية',
  },
  {
    id: 'balance_sheet',
    title: 'قائمة المركز المالي',
    objectiveTitle: 'بيان الوضع المالي (موجودات والتزامات)',
    detail:
      'تصور موارد المنشأة الاقتصادية (الأصول) ومصادر تمويلها من الغير (الالتزامات) والملاك في تاريخ محدد.',
    timeScope: 'في لحظة زمنية محددة',
  },
  {
    id: 'cash_flow',
    title: 'قائمة التدفقات النقدية',
    objectiveTitle: 'قياس موقف السيولة النقدية',
    detail:
      'تتبع المقبوضات والمدفوعات النقدية عبر الأنشطة التشغيلية والاستثمارية والتمويلية لقياس قدرة السداد الفورية.',
    timeScope: 'خلال الفترة المالية',
  },
];

export const OUTPUT_GOAL_QUESTIONS: OutputGoalQuestion[] = [
  {
    id: 'og-1',
    prompt: 'يريد صاحب المشروع معرفة هل حققت منشأته ربحاً أم خسارة خلال عام 2026؟',
    correctOutputId: 'income_statement',
    explanation: 'قائمة الدخل هي المخرج المختص بقياس نتيجة الأعمال من ربح أو خسارة عن الفترة.',
  },
  {
    id: 'og-2',
    prompt: 'يطلب مستثمر الاطلاع على ممتلكات الشركة والديون المستحقة عليها بتاريخ 31 كانون الأول.',
    correctOutputId: 'balance_sheet',
    explanation: 'قائمة المركز المالي تبين الوضع المالي للمشروع من موجودات والتزامات وحقوق ملكية في لحظة زمنية.',
  },
  {
    id: 'og-3',
    prompt: 'يرغب مراقب السيولة بتتبع النقد الداخل من المبيعات والنقد الخارج لسداد الرواتب والقروض.',
    correctOutputId: 'cash_flow',
    explanation: 'قائمة التدفقات النقدية تقيس موقف السيولة النقدية وحركة النقد خلال الفترة.',
  },
  {
    id: 'og-4',
    prompt: 'يسأل الشركاء كيف تغير رصيد رأس مالهم بعد إضافة صافي الربح وطرح المسحوبات الشخصية.',
    correctOutputId: 'equity_statement',
    explanation: 'قائمة التغير في حقوق الملكية تفسر جميع التغيرات الطارئة على حقوق أصحاب المشروع.',
  },
];

export const ACCOUNTING_USERS_NODES: AccountingUserNode[] = [
  {
    id: 'owners',
    group: 'internal',
    title: 'ملاك المشروع',
    subLabel: 'Owners',
    needDescription: 'متابعة أرباح المشروع ومركزه المالي وتقييم كفاءة إدارة أموالهم المستثمرة واستمراريتها.',
  },
  {
    id: 'management',
    group: 'internal',
    title: 'إدارة المشروع',
    subLabel: 'Management',
    needDescription: 'اتخاذ القرارات التشغيلية والتخطيطية والرقابية لضمان تحقيق أهداف المنشأة ونموها.',
  },
  {
    id: 'employees',
    group: 'internal',
    title: 'الموظفون',
    subLabel: 'Employees',
    needDescription: 'معرفة ربحية المشروع وموقف السيولة للاطمئنان على الاستقرار الوظيفي والحوافز والمكافآت.',
  },
  {
    id: 'potential_investors',
    group: 'external',
    title: 'المستثمرون المحتملون',
    subLabel: 'Potential Investors',
    needDescription: 'تقييم متانة الوضع المالي والربحية لاتخاذ قرار رشيد بضخ أموال جديدة في المشروع أم لا.',
  },
  {
    id: 'creditors',
    group: 'external',
    title: 'دائنو المشروع',
    subLabel: 'المقرضون والموردون',
    needDescription: 'فحص القدرة على توليد الإيرادات ونسبة السيولة لضمان سداد القروض وفواتير التوريد في مواعيدها.',
  },
  {
    id: 'financial_analysts',
    group: 'external',
    title: 'المحللون الماليون',
    subLabel: 'Financial Analysts',
    needDescription: 'تحليل القوائم المالية لتقديم المشورة حول بيع وشراء أسهم وسندات الشركة في البورصة.',
  },
  {
    id: 'worker_unions',
    group: 'external',
    title: 'الاتحادات العمالية',
    subLabel: 'Worker Unions',
    needDescription: 'مراقبة التزام أصحاب العمل بدفع الأجور وتحصيل حوافز تتناسب مع الأرباح الفعلية.',
  },
  {
    id: 'government',
    group: 'external',
    title: 'الجهات الحكومية',
    subLabel: 'ضريبة الدخل والتخطيط',
    needDescription: 'تحديد ضريبة الدخل المستحقة لخزينة الدولة وإعداد الخطط والإحصاءات على مستوى الاقتصاد القومي.',
  },
  {
    id: 'customers',
    group: 'external',
    title: 'العملاء',
    subLabel: 'Customers',
    needDescription: 'التنبؤ بقدرة المنشأة على الاستمرار في إنتاج السلع وتوفير قطع الغيار والخدمات مستقبلاً.',
  },
];

export const USERS_ROUTER_CHALLENGES: UsersRouterChallenge[] = [
  {
    id: 'ur-1',
    questionPrompt: 'نريد معرفة قدرة الشركة على توليد السيولة لسداد أقساط القرض البنكي وفواتير الموردين في موعدها.',
    correctUserId: 'creditors',
    explanation: 'دائنو المشروع (البنوك المقرضة والموردون) يركزون على السيولة والملاءة لضمان تحصيل مستحقاتهم في آجالها.',
  },
  {
    id: 'ur-2',
    questionPrompt: 'حساب ضريبة الدخل المستحقة لخزينة الدولة بدقة وإعداد الخطط التنموية لقطاعات الاقتصاد القومي.',
    correctUserId: 'government',
    explanation: 'الجهات الحكومية تشمل دائرة ضريبة الدخل لحساب الضريبة ودائرة الإحصاءات ووزارة التخطيط للتخطيط القومي.',
  },
  {
    id: 'ur-3',
    questionPrompt: 'تقييم أداء المديرين التنفيذيين وخطط التوسع والتكلفة التشغيلية اليومية داخل الشركة.',
    correctUserId: 'management',
    explanation: 'إدارة المشروع مستخدم داخلي يعتمد على البيانات التفصيلية للقيام بوظائف التخطيط والرقابة واتخاذ القرار.',
  },
  {
    id: 'ur-4',
    questionPrompt: 'مراجعة الأرباح المعلنة للتفاوض على زيادة الأجور والمكافآت السنوية للعمال بناءً على تعهدات صاحب العمل.',
    correctUserId: 'worker_unions',
    explanation: 'الاتحادات العمالية تراقب قدرة أصحاب العمل على احترام التزاماتهم وتخصيص مكافآت تواكب الأرباح.',
  },
  {
    id: 'ur-5',
    questionPrompt: 'إصدار توصية استثمارية للمتداولين في سوق عمّان المالي حول شراء سهم هذه الشركة أو بيعه.',
    correctUserId: 'financial_analysts',
    explanation: 'المحللون الماليون يدرسون البيانات المحاسبية لتقديم استشارات التداول بالأسهم والسندات.',
  },
  {
    id: 'ur-6',
    questionPrompt: 'التأكد من استقرار المصنع مالياً قبل توقيع عقد طويل الأجل لشراء خطوط منتجاته وقطع غيارها.',
    correctUserId: 'customers',
    explanation: 'العملاء يحتاجون للتنبؤ باستمرارية المنشأة في السوق وضمان توفر منتجاتها وخدماتها لاحقاً.',
  },
];

// ===================== المحطة 2: فروع المحاسبة وعلاقتها بالعلوم والتاريخ =====================

export const ACCOUNTING_BRANCHES_TREE: AccountingBranchNode[] = [
  {
    id: 'financial',
    title: '1. المحاسبة المالية',
    subtitle: 'المحاسبة الأم',
    eraOrBasis: 'أقدم الفروع',
    description:
      'تتضمن المفاهيم والفروض والمبادئ لتحليل وتبويب وتلخيص العمليات المالية، بهدف قياس نتائج الأعمال والمركز المالي وتوصيلها للمستخدمين.',
  },
  {
    id: 'cost',
    title: '2. محاسبة التكاليف',
    subtitle: 'Cost Accounting',
    eraOrBasis: 'ظهرت في القرن 19 مع الثورة الصناعية',
    description:
      'تقيس تكلفة الإنتاج للوحدة وتعمل على خفض التكاليف لأدنى حد ممكن والرقابة على عناصر المواد والأجور والمصروفات الصناعية.',
  },
  {
    id: 'managerial',
    title: '3. المحاسبة الإدارية',
    subtitle: 'Managerial Accounting',
    eraOrBasis: 'مرتبطة بمحاسبة التكاليف',
    description:
      'توفر البيانات اللازمة للإدارة لوضع الخطط، تسعير المنتجات، تحديد حجم الإنتاج الأمثل، وإعداد الموازنات التقديرية.',
  },
  {
    id: 'specialized',
    title: '4. محاسبة المنشآت المتخصصة',
    subtitle: 'Specialization Accounting',
    eraOrBasis: 'للأنشطة ذات الطبيعة الخاصة',
    description:
      'تطبيق المبادئ المحاسبية بأنظمة ملائمة لطبيعة القطاعات غير التجارية التقليدية ضمن 3 مسارات متخصصة:',
    subBranches: [
      {
        id: 'spec-finance',
        title: 'المؤسسات المالية',
        items: ['البنوك والمصارف', 'شركات التأمين'],
      },
      {
        id: 'spec-agri',
        title: 'المحاسبة الزراعية',
        items: ['المشروعات الزراعية والحيوانية'],
      },
      {
        id: 'spec-service',
        title: 'المنشآت الخدمية والنفط',
        items: [
          'محاسبة المستشفيات',
          'محاسبة الفنادق',
          'محاسبة الجمعيات الخيرية',
          'محاسبة المؤسسات التعليمية',
          'محاسبة النقل والمواصلات',
          'محاسبة النفط والمعادن',
        ],
      },
    ],
  },
  {
    id: 'tax',
    title: '5. المحاسبة الضريبية',
    subtitle: 'Tax Accounting',
    eraOrBasis: 'تمويل الخزانة والعدالة الضريبية',
    description:
      'تهتم بتحديد الدخل الخاضع للضريبة (الوعاء الضريبي) بعد استبعاد الإيرادات المعفاة وإضافة المصروفات غير المقبولة وفق القانون.',
  },
  {
    id: 'government',
    title: '6. المحاسبة الحكومية',
    subtitle: 'Government Accounting',
    eraOrBasis: 'الرقابة على الأموال العامة',
    description:
      'تسجل عمليات الصرف والتحصيل في وحدات الجهاز الإداري للدولة وتعد تقارير الرقابة على تنفيذ الموازنة العامة.',
  },
  {
    id: 'auditing',
    title: '7. المراجعة والتدقيق',
    subtitle: 'Auditing',
    eraOrBasis: 'فحص مستقل ومحايد',
    description:
      'مراجعة السجلات والبيانات المالية من قبل مدقق مستقل مؤهل وفق معايير مهنية لإبداء رأي فني محايد حول صدق وعدالة القوائم.',
  },
];

export const RELATED_SCIENCES_RADAR: RelatedScienceNode[] = [
  {
    id: 'management',
    title: 'إدارة الأعمال',
    embodimentBranch: 'تجسدها: المحاسبة الإدارية',
    summary:
      'مخرجات النظام المحاسبي من تقارير وقوائم تصبح مدخلات رئيسية تستخدمها الإدارة في التخطيط والرقابة وتقييم الأداء.',
    keyTools: ['التخطيط المالي', 'الموازنات التقديرية', 'تقييم أداء الأقسام'],
  },
  {
    id: 'economics',
    title: 'علم الاقتصاد',
    embodimentBranch: 'تجسدها: محاسبة التكاليف',
    summary:
      'كلاهما يقيس الثروات المادية؛ الاقتصاد يدرس العرض والطلب والسعر على مستوى المجتمع، والمحاسبة تقيس الموارد على مستوى الوحدة الاقتصادية.',
    keyTools: ['الاستغلال الأمثل للموارد', 'تغطية تكاليف الإنتاج', 'تحقيق هامش ربح'],
  },
  {
    id: 'law',
    title: 'علم القانون',
    embodimentBranch: 'تجسدها: المحاسبة الجنائية والضريبية',
    summary:
      'يكتسب المشروع شخصيته المعنوية وشروط دفاتره من قانون الشركات والقانون التجاري والضرائب، ويلجأ القاضي للمحاسب كخبير مالي في المنازعات.',
    keyTools: ['قانون الشركات والتجارة', 'الخبرة الحسابية أمام القضاء', 'المحاسبة الجنائية'],
  },
  {
    id: 'statistics',
    title: 'علم الإحصاء',
    embodimentBranch: 'أداة التحليل والعينات',
    summary:
      'يفيد الإحصاء في مقارنة القوائم لعدة فترات وتحليل التكلفة والعائد والرقابة على المخزون، كما يعتمد مدقق الحسابات على أسلوب العينات الإحصائية.',
    keyTools: ['مقارنة القوائم الزمنية', 'أسلوب العينات للتدقيق', 'نماذج المخزون والارتباط'],
  },
  {
    id: 'operations_cs',
    title: 'بحوث العمليات والحاسوب',
    embodimentBranch: 'أنظمة ERP والنمذجة الكمية',
    summary:
      'يعتمد المحاسب على البرمجة الخطية لتقليل التكلفة، وأسلوب المسار الحرج لتحليل التكلفة والزمن، ونظم تخطيط موارد المؤسسات ERP لتسريع الدقة.',
    keyTools: ['البرمجة الخطية', 'أسلوب المسار الحرج CPM', 'أنظمة ERP السحابية'],
  },
];

export const HISTORY_TIMELINE_MILESTONES: HistoryEraMilestone[] = [
  {
    id: 'h-ancient',
    eraLabel: '4000 - 3500 ق.م',
    title: 'الآشوريون والفراعنة',
    accountingContribution:
      'توثيق أجور الجنود (ماشية وحبوب) على ألواح، ثم ظهور المخازن وصوامع الغلال في عهد سيدنا يوسف عليه السلام واستخدام ورق البردي في التوثيق.',
  },
  {
    id: 'h-islamic',
    eraLabel: 'الدولة الإسلامية',
    title: 'بيت المال والدواوين وحولان الحول',
    accountingContribution:
      'ابتكار مفهوم الدورية عبر "حولان الحول" للزكاة، وتصنيف الأموال لعروض فنية وعروض تجارة (أصول ثابتة ومتداولة)، وتأسيس الدواوين في عهد عمر بن الخطاب، مع إسهام الخوارزمي بالنظام العشري والصفر.',
  },
  {
    id: 'h-pacioli',
    eraLabel: '1494 ميلادية',
    title: 'لوقا باسيلو والقيد المزدوج',
    accountingContribution:
      'شرح الإيطالي لوقا باسيلو في كتابه الرياضي طريقة القيد المزدوج وتنظيم الدفاتر استناداً إلى التراث العلمي الإسلامي وتجارة المدن الإيطالية.',
  },
  {
    id: 'h-industrial',
    eraLabel: 'القرن 18 - 19',
    title: 'الثورة الصناعية والشركات المساهمة',
    accountingContribution:
      'اختراع الآلة البخارية وتضخم الاستثمارات طويلة الأجل أدى لانفصال الملكية عن الإدارة وظهور محاسبة التكاليف والتدقيق الخارجي المستقل.',
  },
  {
    id: 'h-digital',
    eraLabel: 'العصر الحديث',
    title: 'المعايير الدولية وأنظمة ERP',
    accountingContribution:
      'التحول إلى النظم المحاسبية المحوسبة وبرامج تخطيط موارد المنشآت ERP وتوحيد الممارسة وفق معايير الإبلاغ المالي الدولية.',
  },
];

export const BRANCH_CHALLENGE_QUESTIONS: BranchChallengeQuestion[] = [
  {
    id: 'bc-1',
    prompt: 'مصنع للألبان يريد قياس كلفة اللتر الواحد من الحليب المبستر ومراقبة الهدر في المواد الأولية.',
    correctBranchId: 'cost',
    explanation: 'حساب تكلفة وحدة المنتج والرقابة على عناصر الإنتاج من صميم عمل محاسبة التكاليف.',
  },
  {
    id: 'bc-2',
    prompt: 'شركة مساهمة تستعين بمكتب مستقل لفحص دفاترها وإصدار تقرير رأي محايد عن صدق قوائمها.',
    correctBranchId: 'auditing',
    explanation: 'التدقيق (المراجعة) يقوم به طرف مستقل مؤهل لإبداء رأي فني محايد حول عدالة القوائم المالية.',
  },
  {
    id: 'bc-3',
    prompt: 'تطبيق نظام محاسبي خاص لتتبع إشغال الغرف في فندق خمس نجوم وحساب إيرادات كل جناح.',
    correctBranchId: 'specialized',
    explanation: 'محاسبة الفنادق والمستشفيات والبنوك تتبع محاسبة المنشآت المتخصصة (الخدمية والمالية).',
  },
  {
    id: 'bc-4',
    prompt: 'استبعاد التبرعات غير المقبولة والإيرادات المعفاة من صافي الربح المحاسبي لتحديد المبلغ الخاضع للضريبة.',
    correctBranchId: 'tax',
    explanation: 'تحديد الوعاء الضريبي وفق نصوص القانون اختصاص المحاسبة الضريبية.',
  },
  {
    id: 'bc-5',
    prompt: 'إعداد الموازنة التقديرية للعام القادم لاختيار خطة الإنتاج الأكثر ربحية لقرار مجلس الإدارة.',
    correctBranchId: 'managerial',
    explanation: 'إعداد الموازنات التقديرية وتزويد الإدارة ببيانات اتخاذ القرار مهمة المحاسبة الإدارية.',
  },
];

export const SCIENCE_HISTORY_QUESTIONS: ScienceHistoryQuestion[] = [
  {
    id: 'sh-1',
    prompt: 'استخدام البرمجة الخطية لتخفيض تكاليف الإنتاج وأسلوب المسار الحرج لتحليل العلاقة بين التكلفة والزمن.',
    correctTargetId: 'operations_cs',
    options: [
      { id: 'operations_cs', label: 'بحوث العمليات وعلم الحاسوب' },
      { id: 'law', label: 'علم القانون' },
      { id: 'statistics', label: 'علم الإحصاء' },
      { id: 'economics', label: 'علم الاقتصاد' },
    ],
    explanation: 'البرمجة الخطية وأسلوب المسار الحرج CPM من أدوات بحوث العمليات المتكاملة مع المحاسبة.',
  },
  {
    id: 'sh-2',
    prompt: 'استخدام مدقق الحسابات لأسلوب العينات الإحصائية لفحص قيود المبيعات والمخزون دون حصر كامل.',
    correctTargetId: 'statistics',
    options: [
      { id: 'management', label: 'إدارة الأعمال' },
      { id: 'statistics', label: 'علم الإحصاء' },
      { id: 'law', label: 'علم القانون' },
      { id: 'operations_cs', label: 'بحوث العمليات' },
    ],
    explanation: 'تعتمد أعمال التدقيق وتحليل المخزون والبيانات المقارنة على أدوات علم الإحصاء مثل العينات.',
  },
  {
    id: 'sh-3',
    prompt: 'تعيين محاسب خبيراً حسابياً أمام المحكمة لتقدير التعويض في نزاع مالي بين شريكين.',
    correctTargetId: 'law',
    options: [
      { id: 'economics', label: 'علم الاقتصاد' },
      { id: 'management', label: 'إدارة الأعمال' },
      { id: 'law', label: 'علم القانون (المحاسبة الجنائية)' },
      { id: 'statistics', label: 'علم الإحصاء' },
    ],
    explanation: 'تجسد المحاسبة الجنائية والخبرة القضائية العلاقة الوثيقة بين المحاسبة وعلم القانون.',
  },
  {
    id: 'sh-4',
    prompt: 'مبدأ سنوية الفترة المحاسبية (الدورية) وتقسيم المال إلى عروض فنية وعروض تجارة تأسس في:',
    correctTargetId: 'h-islamic',
    options: [
      { id: 'h-ancient', label: 'عهد الآشوريين' },
      { id: 'h-islamic', label: 'الدولة الإسلامية (حولان الحول والدواوين)' },
      { id: 'h-pacioli', label: 'كتاب لوقا باسيلو 1494م' },
      { id: 'h-digital', label: 'عصر أنظمة ERP' },
    ],
    explanation: 'مفهوم حولان الحول للزكاة وتقسيم الأموال لعروض وتأسيس الدواوين أبرز إسهامات الدولة الإسلامية في المحاسبة.',
  },
  {
    id: 'sh-5',
    prompt: 'تحديد سعر بيع السلعة لتغطية تكاليف الإنتاج والتسويق وتحقيق هامش ربح في ضوء قوى العرض والطلب.',
    correctTargetId: 'economics',
    options: [
      { id: 'economics', label: 'علم الاقتصاد' },
      { id: 'law', label: 'علم القانون' },
      { id: 'statistics', label: 'علم الإحصاء' },
      { id: 'operations_cs', label: 'علم الحاسوب' },
    ],
    explanation: 'يرتبط علم الاقتصاد بالمحاسبة في الاستغلال الأمثل للموارد وتحديد السعر المتوازن بعد تغطية التكاليف.',
  },
];

// ===================== المحطة 3: معادلة الميزانية وقائمة الدخل =====================

export const EQUATION_ELEMENTS_CONCEPTS: EquationElementConcept[] = [
  {
    id: 'assets',
    title: 'الأصول (الموجودات)',
    altTitle: 'Assets',
    authorsDef: 'كل ما يمتلكه المشروع من موارد اقتصادية تساعده على القيام بأنشطته وتحقيق أهدافه كالأراضي والمباني والنقدية والمخزون.',
    standardsDef: 'منافع اقتصادية متوقعة في المستقبل تسيطر عليها المنشأة نتيجة أحداث مالية سابقة (FASB 1985 & IFRS).',
    examples: 'الصندوق، البنك، المدينون، المخزون، الأراضي، المباني، السيارات.',
    colorClass: 'border-blue-500/40 bg-blue-50/70 dark:bg-blue-950/30',
  },
  {
    id: 'liabilities',
    title: 'الالتزامات (المطلوبات)',
    altTitle: 'Liabilities',
    authorsDef: 'ديون وتعهدات مستحقة الدفع على المشروع تجاه الغير كالقروض البنكية والذمم الدائنة والمصاريف المستحقة.',
    standardsDef: 'تضحية محتملة بمنافع اقتصادية مستقبلاً في شكل تعهد حالي على المشروع بتحويل أصول أو تقديم خدمات نتيجة أحداث سابقة.',
    examples: 'الدائنون (الموردون)، أوراق الدفع، القروض البنكية، الضرائب المستحقة.',
    colorClass: 'border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/30',
  },
  {
    id: 'equity',
    title: 'حقوق الملكية',
    altTitle: 'صافي الأصول | Equity',
    authorsDef: 'التزامات المشروع تجاه مالكيه؛ تزيد بزيادة رأس المال وتحقيق الأرباح، وتنخفض بالخسائر والمسحوبات الشخصية.',
    standardsDef: 'الحصة المتبقية في أصول المنشأة بعد طرح كافة الالتزامات (حقوق الملكية = الأصول - الالتزامات).',
    examples: 'رأس المال، الأرباح المحتجزة، مطروحاً منها المسحوبات الشخصية.',
    colorClass: 'border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30',
  },
  {
    id: 'revenues',
    title: 'الإيرادات',
    altTitle: 'Revenues (تدفقات داخلة)',
    authorsDef: 'المبالغ المتحققة من الأنشطة العادية للمنشأة مثل بيع السلع وتقديم الخدمات والفوائد وأرباح الأسهم.',
    standardsDef: 'تدفقات داخلة إلى المشروع أو أي زيادة في أصوله أو نقص في التزاماته ناتجة عن النشاط المعتاد.',
    examples: 'إيراد المبيعات، إيراد الخدمات الاستشارية، إيرادات إيجار عقار مملوك.',
    colorClass: 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  {
    id: 'expenses',
    title: 'المصروفات',
    altTitle: 'Expenses (تدفقات خارجة)',
    authorsDef: 'التكاليف المستنفدة خلال الفترة المالية في سبيل الحصول على الإيرادات وتحقيق أهداف النشاط المعتاد.',
    standardsDef: 'تدفقات خارجة من المشروع أو نقص في أصوله أو زيادة في التزاماته (باستثناء توزيعات الأرباح للمالكين).',
    examples: 'رواتب الموظفين، إيجار المقر، فاتورة الكهرباء، مصروف الإعلان، الاهتلاك.',
    colorClass: 'border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20',
  },
];

export const EQUATION_FLOW_PUZZLES: EquationFlowPuzzle[] = [
  {
    id: 'eqp-1',
    title: 'الحالة 1: تدفق صافي الدخل إلى خزان حقوق الملكية',
    scenarioPrompt:
      'بدأ مشروع برأس مال قدره 30,000 دينار، وحقق إيرادات خدمات 18,000 دينار، وتكبد مصروفات تشغيلية 11,500 دينار، وسحب المالك مبلغ 1,500 دينار شخصياً. ما صافي الربح الذي يصب في حقوق الملكية؟',
    assetsFils: jodToFils(45000),
    liabilitiesFils: jodToFils(10000),
    beginningCapitalFils: jodToFils(30000),
    revenuesFils: jodToFils(18000),
    expensesFils: jodToFils(11500),
    drawingsFils: jodToFils(1500),
    questionLabel: 'احسب صافي الربح (الإيرادات - المصروفات) بالدينار:',
    missingField: 'net_income',
    correctAmountFils: jodToFils(6500),
    explanation:
      'صافي الربح = 18,000 - 11,500 = 6,500 دينار، يرفع حقوق الملكية من 30,000 إلى 36,500 قبل طرح المسحوبات (1,500) لتصبح 35,000 دينار (مساوية لـ 45,000 أصول - 10,000 التزامات).',
  },
  {
    id: 'eqp-2',
    title: 'الحالة 2: حساب صافي الأصول (حقوق الملكية)',
    scenarioPrompt:
      'بلغ إجمالي الموجودات في قائمة المركز المالي 62,000 دينار، وبلغت الديون والقروض المستحقة للغير 24,500 دينار. ما قيمة حقوق الملكية (صافي الأصول)؟',
    assetsFils: jodToFils(62000),
    liabilitiesFils: jodToFils(24500),
    beginningCapitalFils: jodToFils(37500),
    revenuesFils: 0,
    expensesFils: 0,
    drawingsFils: 0,
    questionLabel: 'احسب حقوق الملكية (الأصول - الالتزامات) بالدينار:',
    missingField: 'equity',
    correctAmountFils: jodToFils(37500),
    explanation:
      'وفق تعريف صافي الأصول: حقوق الملكية = الأصول (62,000) - الالتزامات (24,500) = 37,500 دينار.',
  },
  {
    id: 'eqp-3',
    title: 'الحالة 3: حساب إجمالي الموجودات (الأصول) بعد الربح',
    scenarioPrompt:
      'رأس المال الافتتاحي 40,000 دينار، حقق المشروع صافي ربح قدره 9,000 دينار (إيرادات 25,000 - مصروفات 16,000)، وسحب المالك 2,000 دينار، وبلغت الالتزامات القائمة 15,000 دينار. ما إجمالي الأصول؟',
    assetsFils: null,
    liabilitiesFils: jodToFils(15000),
    beginningCapitalFils: jodToFils(40000),
    revenuesFils: jodToFils(25000),
    expensesFils: jodToFils(16000),
    drawingsFils: jodToFils(2000),
    questionLabel: 'احسب إجمالي الأصول المتوازن (الالتزامات + حقوق الملكية الختامية) بالدينار:',
    missingField: 'assets',
    correctAmountFils: jodToFils(62000),
    explanation:
      'حقوق الملكية الختامية = 40,000 + 9,000 ربح - 2,000 مسحوبات = 47,000 دينار، وبجمعها مع الالتزامات 15,000 يصبح إجمالي الأصول 62,000 دينار.',
  },
];

// ===================== المحطة 4: الإطار الفكري والمدقق الذكي =====================

export const CONCEPTUAL_FRAMEWORK_PILLARS: ConceptualPillarItem[] = [
  // الفروض الأربعة
  {
    id: 'entity',
    pillarType: 'assumption',
    title: 'فرض الوحدة المحاسبية المستقلة',
    enTitle: 'Accounting Entity',
    shortRule: 'فصل الذمة المالية للمشروع تماماً عن الذمة المالية لمالكه أو أصحاب المشروع.',
    keyDetails: [
      'يُحظر قيد نفقات المالك العائلية كمصروف على المنشأة.',
      'تُضبط معاملات المالك مع مشروعه عبر حساب خاص مثل "المسحوبات الشخصية" أو جاري الشريك.',
    ],
  },
  {
    id: 'going-concern',
    pillarType: 'assumption',
    title: 'فرض الاستمرارية',
    enTitle: 'Going Concern',
    shortRule: 'المشروع مستمر في عملياته إلى أمد غير محدد ما لم تظهر أدلة موضوعية تدل على التصفية.',
    keyDetails: [
      'التصفية حالة استثنائية، وحياة الوحدة المحاسبية لا تتوقف على حياة أصحابها في شركات الأموال.',
      'تُقيّم الأصول على أساس الاستمرار لا بأسعار البيع القسري أو التصفية.',
    ],
  },
  {
    id: 'periodicity',
    pillarType: 'assumption',
    title: 'فرض الفترة المحاسبية (الدورية)',
    enTitle: 'Accounting Period',
    shortRule: 'تقسيم حياة المشروع المستمرة إلى فترات زمنية متساوية (عادة سنة ميلادية) لإعداد القوائم.',
    keyDetails: [
      'يعالج إشكالية انتظار نهاية المشروع لقياس الربح أو الخسارة.',
      'يمكن إدارة المشروع والدوائر الضريبية من قياس الأداء السنوي واحتساب الضرائب بانتظام.',
    ],
  },
  {
    id: 'monetary-unit',
    pillarType: 'assumption',
    title: 'فرض وحدة القياس النقدي',
    enTitle: 'Monetary Unit',
    shortRule: 'تهتم المحاسبة بالأحداث القابلة للقياس النقدي (كالدينار) مع افتراض ثبات القوة الشرائية للنقود.',
    keyDetails: [
      'لا تُثبت العوامل غير القابلة للقياس النقدي الموضوعي مثل ولاء الموظفين وسمعة المدير.',
      'يفترض ثبات القوة الشرائية رغم أن التضخم وتقلب الأسعار يثير تحديات في تقييم الأصول غير المتداولة.',
    ],
  },

  // المبادئ الخمسة
  {
    id: 'hist-cost',
    pillarType: 'principle',
    title: 'مبدأ التكلفة التاريخية',
    enTitle: 'Historical Cost Principle',
    shortRule: 'تُسجل الأصول والالتزامات بقيمتها الفعلية وقت الحصول عليها شاملة كل النفقات حتى الجاهزية للاستخدام.',
    keyDetails: [
      'التكلفة تشمل: ثمن الشراء + عمولة الشراء + النقل والشحن + الجمارك + مصاريف التركيب والإشراف والتجارب.',
      'مزاياه: موضوعية التحقق من واقع المستندات دون حكم شخصي.',
      'عيوبه الثلاثة: (1) لا يعبر عن القيمة الحقيقية في التضخم، (2) صعوبة المقارنة بين فترات متباعدة، (3) خلق أرباح وهمية عند حساب الاهتلاك التاريخي.',
    ],
  },
  {
    id: 'rev-recognition',
    pillarType: 'principle',
    title: 'مبدأ الاعتراف (تحقق) الإيراد',
    enTitle: 'Revenue Realization Principle',
    shortRule: 'يعترف بالإيراد عند توافر شرطي FASB: (1) الاكتساب بالاكتمال/التسليم (2) القابلية للتحقق نقداً أو ذمماً.',
    keyDetails: [
      'القاعدة العامة: الاعتراف بالإيراد عند نقطة البيع بموجب فاتورة البيع وتقديم الخدمة.',
      'الاستثناءات الثلاثة: (أ) عند انتهاء الإنتاج كالنفط والذهب والمعادن، (ب) بعد البيع عند التحصيل كالبيع بالتقسيط، (ج) أثناء الإنتاج كالمقاولات طويلة الأجل والغابات.',
    ],
  },
  {
    id: 'matching',
    pillarType: 'principle',
    title: 'مبدأ مقابلة الإيرادات بالمصروفات',
    enTitle: 'The Matching Principle',
    shortRule: 'تحميل الفترة المحاسبية بإيراداتها التي تخصها ومقابلتها بالمصروفات التي استنفدت لتحقيقها سواء دُفعت أم لم تُدفع.',
    keyDetails: [
      'ينشأ عن هذا المبدأ حساب "مصروف الاهتلاك" لتوزيع تكلفة الأصل الثابت على عمره الإنتاجي.',
      'في غياب العلاقة السببية المباشرة (كالدعاية والإعلان) يتم التحميل على أساس زمني، كما يلزم إعداد التسويات الجردية.',
    ],
  },
  {
    id: 'disclosure',
    pillarType: 'principle',
    title: 'مبدأ الإفصاح',
    enTitle: 'Disclosure Principle',
    shortRule: 'تضمين التقارير المالية والملاحظات الإيضاحية كل المعلومات الجوهرية والضرورية لمستخدمي القوائم.',
    keyDetails: [
      'ازدادت أهميته بعد الأزمات المالية العالمية وشركات المساهمة لضمان الشفافية.',
      'أربعة أنواع للإفصاح: الإفصاح الشامل (الشفافية)، الإفصاح الجزئي، الإفصاح الوقائي، والإفصاح التثقيفي.',
    ],
  },
  {
    id: 'consistency',
    pillarType: 'principle',
    title: 'مبدأ الثبات',
    enTitle: 'Consistency Principle',
    shortRule: 'التزام المحاسب بتطبيق نفس السياسات والطرق المحاسبية من فترة مالية لأخرى لتمكين المقارنة.',
    keyDetails: [
      'الثبات ليس مطلقاً؛ يجوز التغيير إذا أظهر المركز المالي بعدالة وموضوعية أكبر بشرط الإفصاح الواضح عن أثر التغيير.',
    ],
  },

  // السياسات المحاسبية
  {
    id: 'conservatism',
    pillarType: 'convention',
    title: 'سياسة الحيطة والحذر (التحفظ)',
    enTitle: 'Conservatism',
    shortRule: 'أخذ الخسائر المحتملة مستقبلاً بالحسبان فوراً، وعدم الاعتراف بأي مكاسب متوقعة حتى تتحقق فعلاً.',
    keyDetails: [
      'تطبيق عملي 1: تكوين "مخصص الديون المشكوك في تحصيلها" لمواجهة احتمالية عدم تحصيل بعض الذمم.',
      'تطبيق عملي 2: تقييم مخزون البضاعة بـ "التكلفة أو صافي القيمة القابلة للتحقق (سعر السوق) أيهما أقل".',
    ],
  },
  {
    id: 'materiality',
    pillarType: 'convention',
    title: 'سياسة الأهمية النسبية',
    enTitle: 'Materiality Convention',
    shortRule: 'تركيز اهتمام المحاسب والمدقق على البنود والعناصر التي يؤثر حجمها أو طبيعتها على قرارات المستخدمين.',
    keyDetails: [
      'يجوز قيد الأدوات المكتبية الضئيلة (مثل دباسة أو حاسبة مكتبية بقيمة رمزية) كمصروف فوري بدلاً من رسملتها لسنوات.',
    ],
  },
];

export const VIOLATION_SCENARIO_CASES: ViolationScenarioCase[] = [
  {
    id: 'viol-1',
    exerciseGroupId: 'u1-ex-6',
    title: 'السيناريو 1: سيارة عائلية من صندوق الشركة',
    story:
      'اشترى مالك المشروع سيارة خاصة لاستخدام عائلته بمبلغ 12,000 دينار وسدد ثمنها من صندوق المنشأة، وسجّلها المحاسب ضمن مصروفات التشغيل.',
    wrongAccountingTreatment: 'تسجيل 12,000 دينار كمصروف سيارات يخفض صافي الربح خطأً',
    wrongNumberLabel: 'صافي الربح بعد الخطأ',
    wrongNumberFils: jodToFils(28000),
    correctedAccountingTreatment: 'استبعاد المصروف وإثبات 12,000 دينار في حساب المسحوبات الشخصية',
    correctedNumberLabel: 'صافي الربح الصحيح',
    correctedNumberFils: jodToFils(40000),
    correctRuleId: 'entity',
    options: [
      { id: 'entity', label: 'فرض الوحدة المحاسبية المستقلة (الشخصية المعنوية)' },
      { id: 'going-concern', label: 'فرض الاستمرارية' },
      { id: 'periodicity', label: 'فرض الفترة المحاسبية' },
      { id: 'monetary-unit', label: 'فرض وحدة القياس النقدي' },
    ],
    explanation:
      'وفق فرض الشخصية المعنوية يجب فصل ذمة المالك عن ذمة المنشأة؛ فتقيَّد السيارة كمسحوبات شخصية لا كمصروف تشغيلي، مما يعيد صافي الربح من 28,000 إلى 40,000 دينار.',
  },
  {
    id: 'viol-2',
    exerciseGroupId: 'u1-ex-6',
    title: 'السيناريو 2: تقييم آلات الإنتاج بقيمة التصفية القسرية',
    story:
      'حققت شركة صناعية ناجحة مبيعات مستمرة وعقوداً لـ 5 سنوات قادمة، ومع ذلك أعاد المحاسب تسعير آلات المصنع بـ 9,000 دينار كخردة بدلاً من صافي تكلفتها المستمرة البالغة 24,000 دينار.',
    wrongAccountingTreatment: 'خفض قيمة الآلات في الميزانية إلى قيمة التصفية (9,000 دينار)',
    wrongNumberLabel: 'قيمة الآلات المسجلة خطأً',
    wrongNumberFils: jodToFils(9000),
    correctedAccountingTreatment: 'الاستمرار بتقييم الآلات على أساس عمرها الإنتاجي (24,000 دينار)',
    correctedNumberLabel: 'قيمة الآلات الصحيحة',
    correctedNumberFils: jodToFils(24000),
    correctRuleId: 'going-concern',
    options: [
      { id: 'going-concern', label: 'فرض الاستمرارية' },
      { id: 'entity', label: 'فرض الوحدة المستقلة' },
      { id: 'monetary-unit', label: 'فرض وحدة القياس النقدي' },
      { id: 'materiality', label: 'سياسة الأهمية النسبية' },
    ],
    explanation:
      'فرض الاستمرارية يقضي بافتراض بقاء المنشأة مستمرة وعدم اللجوء لتسعير التصفية إلا عند توافر أدلة موضوعية على التوقف.',
  },
  {
    id: 'viol-3',
    exerciseGroupId: 'u1-ex-7',
    title: 'السيناريو 3: إغفال رسوم الشحن والتركيب للآلة',
    story:
      'اشترت الشركة آلة إنتاج بمبلغ 10,000 دينار ودفعت 1,500 دينار شحن وجمارك وتركيب حتى أصبحت جاهزة للعمل، لكن المحاسب أثبت تكلفة الآلة بـ 10,000 دينار فقط وأهمل الـ 1,500 دينار أو صرفها خارج التكلفة.',
    wrongAccountingTreatment: 'تسجيل الآلة بثمن الشراء الأولي فقط (10,000 دينار)',
    wrongNumberLabel: 'تكلفة الآلة المسجلة خطأً',
    wrongNumberFils: jodToFils(10000),
    correctedAccountingTreatment: 'رسملة الشراء + الشحن والتركيب لتصبح التكلفة التاريخية 11,500 دينار',
    correctedNumberLabel: 'التكلفة التاريخية الصحيحة للآلة',
    correctedNumberFils: jodToFils(11500),
    correctRuleId: 'hist-cost',
    options: [
      { id: 'hist-cost', label: 'مبدأ التكلفة التاريخية' },
      { id: 'rev-recognition', label: 'مبدأ الاعتراف بالإيراد' },
      { id: 'consistency', label: 'مبدأ الثبات' },
      { id: 'conservatism', label: 'سياسة الحيطة والحذر' },
    ],
    explanation:
      'بموجب مبدأ التكلفة التاريخية، تشمل تكلفة الأصل جميع النفقات اللازمة لاقتنائه وحتى يصبح جاهزاً للاستخدام (الشراء + الشحن + الجمارك + التركيب والتجارب) = 11,500 دينار.',
  },
  {
    id: 'viol-4',
    exerciseGroupId: 'u1-ex-7',
    title: 'السيناريو 4: تسجيل أرباح صفقة لم تُوقَّع أو تُنفَّذ بعد',
    story:
      'خلال مفاوضات توريد متوقعة بقيمة 20,000 دينار قبل توقيع العقد أو تسليم أي بضاعة، سجل المحاسب مبلغ 20,000 دينار فوراً كإيراد مبيعات في دفاتر العام الحالي.',
    wrongAccountingTreatment: 'الاعتراف بإيراد غير مكتسب وغير متحقق بقيمة 20,000 دينار',
    wrongNumberLabel: 'الإيراد المضخم قبل البيع',
    wrongNumberFils: jodToFils(20000),
    correctedAccountingTreatment: 'عدم إثبات الإيراد (0 دينار) حتى يكتمل التسليم وتنشأ الذمة أو القبض',
    correctedNumberLabel: 'الإيراد المعترف به حالياً',
    correctedNumberFils: 0,
    correctRuleId: 'rev-recognition',
    options: [
      { id: 'rev-recognition', label: 'مبدأ الاعتراف (تحقق) الإيراد' },
      { id: 'hist-cost', label: 'مبدأ التكلفة التاريخية' },
      { id: 'matching', label: 'مبدأ المقابلة' },
      { id: 'disclosure', label: 'مبدأ الإفصاح التام' },
    ],
    explanation:
      'يشترط مبدأ تحقق الإيراد (FASB) اكتمال عملية الإيراد بتقديم الخدمة أو تسليم البضاعة وإمكانية التحقق، ولا يكفي التفاوض أو توقيع العقد الأولي.',
  },
  {
    id: 'viol-5',
    exerciseGroupId: 'u1-ex-8',
    title: 'السيناريو 5: عدم احتساب اهتلاك العام ومصاريف الحملة المتعلقة بالإيراد',
    story:
      'سجلت الشركة إيرادات 50,000 دينار ناتجة عن تشغيل أجهزة عمرها 5 سنوات دون تحميل السنة نصيبها من مصروف الاهتلاك البالغ 4,000 دينار.',
    wrongAccountingTreatment: 'تضخيم صافي الربح بإغفال مصروف اهتلاك الفترة (4,000 دينار)',
    wrongNumberLabel: 'صافي الربح قبل الاهتلاك',
    wrongNumberFils: jodToFils(22000),
    correctedAccountingTreatment: 'مقابلة إيرادات الفترة بنصيبها من الاهتلاك (-4,000 دينار)',
    correctedNumberLabel: 'صافي الربح العادل بعد المقابلة',
    correctedNumberFils: jodToFils(18000),
    correctRuleId: 'matching',
    options: [
      { id: 'matching', label: 'مبدأ مقابلة الإيرادات بالمصروفات' },
      { id: 'rev-recognition', label: 'مبدأ تحقق الإيراد' },
      { id: 'entity', label: 'فرض الوحدة المستقلة' },
      { id: 'monetary-unit', label: 'فرض وحدة النقد' },
    ],
    explanation:
      'ينص مبدأ المقابلة على توزيع تكلفة الأصول غير المتداولة (مصروف الاهتلاك) على فترات الانتفاع بها ليقابل كل إيراد المصروف الذي أسهم في توليده.',
  },
  {
    id: 'viol-6',
    exerciseGroupId: 'u1-ex-8',
    title: 'السيناريو 6: تجاهل ديون عملاء متعثرة وقرب إفلاسهم',
    story:
      'تملك الشركة ذمماً مدينة بقيمة 30,000 دينار منها 3,500 دينار لدى عميل أشهر إفلاسه المبدئي ومن المحتمل عدم تحصيلها، ومع ذلك أظهر المحاسب الذمم بكامل 30,000 دينار دون تكوين مخصص.',
    wrongAccountingTreatment: 'عرض كامل الذمم المدينة (30,000 دينار) دون مخصص ديون مشكوك فيها',
    wrongNumberLabel: 'صافي الذمم المضخم',
    wrongNumberFils: jodToFils(30000),
    correctedAccountingTreatment: 'تكوين مخصص ديون مشكوك في تحصيلها بقيمة 3,500 دينار فوراً',
    correctedNumberLabel: 'صافي الذمم التحفظي',
    correctedNumberFils: jodToFils(26500),
    correctRuleId: 'conservatism',
    options: [
      { id: 'conservatism', label: 'سياسة الحيطة والحذر (التحفظ)' },
      { id: 'materiality', label: 'سياسة الأهمية النسبية' },
      { id: 'hist-cost', label: 'مبدأ التكلفة التاريخية' },
      { id: 'consistency', label: 'مبدأ الثبات' },
    ],
    explanation:
      'تقضي سياسة الحيطة والحذر بالاعتراف الفوري بالخسائر المحتملة عبر مخصص الديون المشكوك فيها وطرحه من الذمم المدينة في المركز المالي.',
  },
];

// ===================== المحطة 5: المجموعة المستندية والدفترية =====================

export const DOCUMENT_CLASS_ITEMS: DocumentClassItem[] = [
  {
    id: 'doc-1',
    title: 'فاتورة المبيعات',
    exampleNote: 'تصدرها المنشأة عند بيع البضاعة للعميل',
    category: 'internal',
    proofStrength: 'مستند داخلي',
  },
  {
    id: 'doc-2',
    title: 'فاتورة المشتريات',
    exampleNote: 'يرسلها المورد الخارجي للمشروع عند الشراء',
    category: 'external',
    proofStrength: 'حجية إثبات أعلى (طرف خارجي)',
  },
  {
    id: 'doc-3',
    title: 'مستند القبض',
    exampleNote: 'يُحرر داخل المشروع عند قبض مبلغ نقداً أو بشيك',
    category: 'internal',
    proofStrength: 'مستند داخلي',
  },
  {
    id: 'doc-4',
    title: 'كشف حساب البنك وإشعارات الإضافة/الخصم',
    exampleNote: 'يصدر من المصرف لتوثيق حركات الحساب البنكي',
    category: 'external',
    proofStrength: 'حجية إثبات أعلى (مصرف خارجي)',
  },
  {
    id: 'doc-5',
    title: 'مستند الصرف ومستند القيد',
    exampleNote: 'يصدران داخل المنشأة لصرف نقد من الصندوق أو قيود العمليات الآجلة',
    category: 'internal',
    proofStrength: 'مستند داخلي',
  },
  {
    id: 'doc-6',
    title: 'الأوراق التجارية المسحوبة من العملاء (أوراق القبض)',
    exampleNote: 'كمبيالة محررة من العميل سداداً لمديونيته تجاه المشروع',
    category: 'external',
    proofStrength: 'حجية إثبات أعلى (ورقة صادرة من العميل)',
  },
];

export const LEDGER_BOOKS_ITEMS: LedgerBookClassItem[] = [
  {
    id: 'bk-1',
    title: 'دفتر اليومية العامة',
    enTitle: 'General Journal',
    roleSummary: 'يُسجل فيه المشروع عملياته المالية أولاً بأول وبتسلسل حدوثها الزمني.',
    requirement: 'mandatory',
  },
  {
    id: 'bk-2',
    title: 'دفتر الجرد والميزانية',
    enTitle: 'Balance Sheet & Adjustment Book',
    roleSummary: 'تُقيد فيه إجراءات الجرد بنهاية الفترة وقيود التسويات الجردية والحسابات الختامية.',
    requirement: 'mandatory',
  },
  {
    id: 'bk-3',
    title: 'دفتر الصور والرسائل',
    roleSummary: 'يُحتفظ فيه بصور كافة مراسلات المشروع التجارية الصادرة والواردة إليه.',
    requirement: 'mandatory',
  },
  {
    id: 'bk-4',
    title: 'دفتر الأستاذ العام',
    enTitle: 'General Ledger',
    roleSummary: 'تُرحل إليه الحسابات من اليومية لمعرفة رصيد كل حساب بصورة مستقلة.',
    requirement: 'optional',
  },
  {
    id: 'bk-5',
    title: 'الدفاتر المساعدة',
    enTitle: 'يومية مساعدة / أستاذ مساعد',
    roleSummary: 'تفصيل حسابات العملاء أو الموردين في دفاتر فرعية عند كبر حجم المشروع.',
    requirement: 'optional',
  },
  {
    id: 'bk-6',
    title: 'دفتر أستاذ المخازن',
    roleSummary: 'متابعة حركة الأصناف الواردة والصادرة والكميات المتبقية داخل المستودعات.',
    requirement: 'optional',
  },
];

export const OTHER_SYSTEM_PILLARS: SystemComponentPill[] = [
  {
    id: 'sp-chart',
    title: 'دليل الحسابات',
    enTitle: 'Chart of Accounts',
    role: 'الإطار العام لأسماء وأرقام جميع الحسابات وشرح استخداماتها.',
  },
  {
    id: 'sp-entry',
    title: 'أنظمة القيد المحاسبي',
    enTitle: 'Accounting Entry Systems',
    role: 'أشهرها نظام القيد المزدوج المعتمد أكاديمياً وتطبيقياً لتوازن كل عملية.',
  },
  {
    id: 'sp-proc',
    title: 'الإجراءات والتعليمات المحاسبية',
    enTitle: 'Accounting Procedures',
    role: 'ضوابط تنظيم العمل لمنع الأخطاء وحماية ممتلكات المشروع وسلامة البيانات.',
  },
  {
    id: 'sp-hr',
    title: 'الكوادر البشرية',
    enTitle: 'Human Resources',
    role: 'المحاسبون المؤهلون علمياً وعملياً والمتمكنون من استخدام الحاسوب والعلوم المساندة.',
  },
  {
    id: 'sp-tech',
    title: 'الأجهزة والبرامج المساعدة',
    enTitle: 'Computer Equipment & Software',
    role: 'الحواسيب والتطبيقات المحاسبية لتوفير الدقة والسرعة وتقليل التكلفة.',
  },
  {
    id: 'sp-reports',
    title: 'القوائم والتقارير المالية',
    enTitle: 'Financial Statements & Reports',
    role: 'مخرجات النظام المحاسبي الأربع في نهاية الفترة المالية.',
  },
];

// ===================== المحطة 6: دليل الحسابات والترميز الرقمي =====================

export const CHART_CODING_GROUPS: AccountGroupHierarchy[] = [
  {
    groupCode: '1',
    groupTitle: 'المجموعة الأولى: الأصول',
    normalBalance: 'debit',
    statementTarget: 'قائمة المركز المالي (جانب الموجودات)',
    subCategories: [
      {
        subCode: '11',
        subTitle: '11 الأصول غير المتداولة (الثابتة)',
        accounts: [
          { code: '111', name: 'الأراضي' },
          { code: '112', name: 'المباني' },
          { code: '113', name: 'الآلات والمعدات' },
          { code: '114', name: 'السيارات' },
        ],
      },
      {
        subCode: '12',
        subTitle: '12 الأصول المتداولة',
        accounts: [
          { code: '121', name: 'الصندوق (النقدية)' },
          { code: '122', name: 'البنك' },
          { code: '123', name: 'المدينون (الذمم المدينة)' },
          { code: '124', name: 'أوراق القبض' },
          { code: '125', name: 'البضاعة (المخزون)' },
        ],
      },
    ],
  },
  {
    groupCode: '2',
    groupTitle: 'المجموعة الثانية: المطلوبات (الالتزامات)',
    normalBalance: 'credit',
    statementTarget: 'قائمة المركز المالي (جانب المطلوبات)',
    subCategories: [
      {
        subCode: '21',
        subTitle: '21 المطلوبات طويلة الأجل',
        accounts: [
          { code: '211', name: 'قرض بنكي طويل الأجل' },
          { code: '212', name: 'سندات طويلة الأجل' },
        ],
      },
      {
        subCode: '22',
        subTitle: '22 المطلوبات المتداولة (قصيرة الأجل)',
        accounts: [
          { code: '221', name: 'الدائنون (الموردون)' },
          { code: '222', name: 'أوراق الدفع' },
          { code: '223', name: 'مصاريف مستحقة الدفع' },
        ],
      },
    ],
  },
  {
    groupCode: '3',
    groupTitle: 'المجموعة الثالثة: حقوق الملكية',
    normalBalance: 'credit',
    statementTarget: 'قائمة حقوق الملكية ثم المركز المالي',
    subCategories: [
      {
        subCode: '31',
        subTitle: '31 رأس المال والاحتياطيات',
        accounts: [
          { code: '311', name: 'رأس المال' },
          { code: '312', name: 'الأرباح المحتجزة' },
        ],
      },
      {
        subCode: '32',
        subTitle: '32 حسابات التخفيض الشخصية',
        accounts: [{ code: '321', name: 'المسحوبات الشخصية (طبيعته مدينة)' }],
      },
    ],
  },
  {
    groupCode: '4',
    groupTitle: 'المجموعة الرابعة: المصروفات',
    normalBalance: 'debit',
    statementTarget: 'قائمة الدخل (تُطرح للوصول للربح)',
    subCategories: [
      {
        subCode: '41',
        subTitle: '41 مصروفات التشغيل والمشتريات',
        accounts: [
          { code: '411', name: 'المشتريات' },
          { code: '412', name: 'الرواتب والأجور' },
          { code: '413', name: 'مصروف الإيجار' },
          { code: '414', name: 'مصروف الكهرباء والمياه' },
        ],
      },
      {
        subCode: '42',
        subTitle: '42 المصروفات التمويلية',
        accounts: [{ code: '421', name: 'فوائد القروض البنكية' }],
      },
    ],
  },
  {
    groupCode: '5',
    groupTitle: 'المجموعة الخامسة: الإيرادات',
    normalBalance: 'credit',
    statementTarget: 'قائمة الدخل (المصدر الأساسي للربح)',
    subCategories: [
      {
        subCode: '51',
        subTitle: '51 إيرادات النشاط الرئيسي',
        accounts: [
          { code: '511', name: 'إيراد المبيعات' },
          { code: '512', name: 'إيراد الخدمات' },
        ],
      },
      {
        subCode: '52',
        subTitle: '52 الإيرادات الأخرى',
        accounts: [{ code: '521', name: 'إيرادات متنوعة وفوائد دائنة' }],
      },
    ],
  },
];

export const ACCOUNT_CODING_PRACTICE_ITEMS: AccountCodingPracticeItem[] = [
  {
    id: 'acp-1',
    accountName: 'مباني ومقر الشركة الرئيسي',
    hint: 'مورد مملوك طويل الأجل يساعد المنشأة على أداء نشاطها.',
    correctGroupCode: '1',
    subCode: '11',
    subTitle: 'الأصول غير المتداولة',
    generatedCode: '112',
    normalBalanceAr: 'مدين',
    statementTarget: 'قائمة المركز المالي (الأصول)',
  },
  {
    id: 'acp-2',
    accountName: 'قرض بنكي طويل الأجل (يسدد خلال 5 سنوات)',
    hint: 'تعهد مالي والتزام على المنشأة لصالح المصرف لأكثر من سنة.',
    correctGroupCode: '2',
    subCode: '21',
    subTitle: 'المطلوبات طويلة الأجل',
    generatedCode: '211',
    normalBalanceAr: 'دائن',
    statementTarget: 'قائمة المركز المالي (الالتزامات)',
  },
  {
    id: 'acp-3',
    accountName: 'رأس مال المشروع المستثمر من المالك',
    hint: 'الحقوق المستثمرة لأصحاب المشروع عند التأسيس.',
    correctGroupCode: '3',
    subCode: '31',
    subTitle: 'رأس المال والاحتياطيات',
    generatedCode: '311',
    normalBalanceAr: 'دائن',
    statementTarget: 'قائمة حقوق الملكية ثم المركز المالي',
  },
  {
    id: 'acp-4',
    accountName: 'رواتب وأجور الموظفين الشهرية',
    hint: 'تكلفة تشغيلية مستنفدة مقابل خدمات العاملين لتحقيق الإيرادات.',
    correctGroupCode: '4',
    subCode: '41',
    subTitle: 'مصروفات التشغيل',
    generatedCode: '412',
    normalBalanceAr: 'مدين',
    statementTarget: 'قائمة الدخل (المصروفات)',
  },
  {
    id: 'acp-5',
    accountName: 'إيراد مبيعات البضائع',
    hint: 'تدفقات داخلة ناتجة عن النشاط التجاري الأساسي للمشروع.',
    correctGroupCode: '5',
    subCode: '51',
    subTitle: 'إيرادات النشاط الرئيسي',
    generatedCode: '511',
    normalBalanceAr: 'دائن',
    statementTarget: 'قائمة الدخل (الإيرادات)',
  },
];

// ===================== الاختبار الختامي واختبار التجاوز للوحدة 1 =====================

export const UNIT1_EXAM_QUESTIONS: Unit1QuizQuestion[] = [
  {
    id: 'u1-q1',
    topicId: 'u1-users',
    prompt: 'أي من الآتية يُعد من المستخدمين الداخليين للمعلومات المحاسبية؟',
    options: [
      { id: 'a', label: 'المصرف التجاري المانح للتسهيلات' },
      { id: 'b', label: 'إدارة المشروع ورئيس قسم الإنتاج' },
      { id: 'c', label: 'دائرة ضريبة الدخل والمبيعات' },
      { id: 'd', label: 'الاتحادات العمالية' },
    ],
    correctOptionId: 'b',
    explanation:
      'الإدارة ورؤساء الأقسام يعملون داخل المشروع ويستخدمون المعلومات للتخطيط والرقابة واتخاذ القرار.',
  },
  {
    id: 'u1-q2',
    topicId: 'u1-branches',
    prompt: 'أي علم يمد المحاسبة بأساليب مثل البرمجة الخطية وأسلوب المسار الحرج؟',
    options: [
      { id: 'a', label: 'علم القانون' },
      { id: 'b', label: 'علم الإحصاء' },
      { id: 'c', label: 'بحوث العمليات وعلم الحاسوب' },
      { id: 'd', label: 'المحاسبة الحكومية' },
    ],
    correctOptionId: 'c',
    explanation:
      'بحوث العمليات تقدم للمحاسبة والإدارة نماذج البرمجة الخطية وأسلوب المسار الحرج والمدخلات والمخرجات.',
  },
  {
    id: 'u1-q3',
    topicId: 'u1-assumptions-principles',
    prompt:
      'اشترت شركة آلة بمبلغ 10,000 دينار ودفعت 1,500 دينار شحن وتركيب، القيمة الواجب إثباتها وفق مبدأ التكلفة التاريخية هي:',
    options: [
      { id: 'a', label: '10,000 دينار فقط' },
      { id: 'b', label: '11,500 دينار (الثمن + النفقات حتى الجاهزية)' },
      { id: 'c', label: '8,500 دينار' },
      { id: 'd', label: 'تسجل كمصروف تشغيلي كامل' },
    ],
    correctOptionId: 'b',
    explanation:
      'تشمل التكلفة التاريخية للأصل جميع النفقات المتكبدة حتى يصبح جاهزاً للاستخدام (الشراء + الشحن + الجمارك + التركيب).',
  },
  {
    id: 'u1-q4',
    topicId: 'u1-cycle-documents',
    prompt: 'أي مجموعة تمثل الدفاتر الإجبارية (الإلزامية) بنص القانون التجاري الأردني؟',
    options: [
      { id: 'a', label: 'دفتر الأستاذ العام وأستاذ المخازن فقط' },
      { id: 'b', label: 'دفتر اليومية العامة، دفتر الجرد والميزانية، ودفتر الصور والرسائل' },
      { id: 'c', label: 'الدفاتر المساعدة وكشوف البنوك' },
      { id: 'd', label: 'فواتير المبيعات ومستندات القبض' },
    ],
    correctOptionId: 'b',
    explanation:
      'ألزم القانون التجاري الأردني الشركات بإمساك 3 دفاتر إجبارية: اليومية العامة، الجرد والميزانية، والصور والرسائل.',
  },
  {
    id: 'u1-q5',
    topicId: 'u1-chart-coding',
    prompt: 'وفق دليل الحسابات القياسي (المجموعات 1 إلى 5)، ما رقم المجموعة والرمز الفرعي للأصول غير المتداولة ولفوائد القروض؟',
    options: [
      { id: 'a', label: 'الأصول غير المتداولة (1 / 11)، المصروفات التمويلية (4 / 42)' },
      { id: 'b', label: 'الأصول (2 / 21)، المصروفات (5 / 51)' },
      { id: 'c', label: 'المطلوبات (1 / 12)، الإيرادات (3 / 31)' },
      { id: 'd', label: 'حقوق الملكية (4 / 41)، الأصول (3 / 32)' },
    ],
    correctOptionId: 'a',
    explanation:
      'تأخذ الأصول المجموعة 1 (وغير المتداولة 11)، المطلوبات 2، حقوق الملكية 3، المصروفات 4، والإيرادات 5.',
  },
  {
    id: 'u1-q6',
    topicId: 'u1-branches',
    prompt: 'أي فرع من فروع المحاسبة يركز على حساب تكلفة المنتج الواحد بدقة لمساعدة المنشأة على التسعير والرقابة؟',
    options: [
      { id: 'a', label: 'محاسبة التكاليف' },
      { id: 'b', label: 'المحاسبة الحكومية' },
      { id: 'c', label: 'المحاسبة الضريبية فقط' },
      { id: 'd', label: 'محاسبة الأنظمة العقارية' },
    ],
    correctOptionId: 'a',
    explanation:
      'محاسبة التكاليف تختص بقياس تكلفة المواد والأجور والمصاريف لكل وحدة منتجة أو خدمة مقدمة.',
  },
  {
    id: 'u1-q7',
    topicId: 'u1-equation-concepts',
    prompt: 'إذا بلغ إجمالي ممتلكات المشروع (الأصول) 12,000 دينار، وكانت الديون المستحقة عليه للغير 4,500 دينار، فكم تبلغ حقوق الملكية؟',
    options: [
      { id: 'a', label: '16,500 دينار' },
      { id: 'b', label: '7,500 دينار' },
      { id: 'c', label: '4,500 دينار' },
      { id: 'd', label: '8,500 دينار' },
    ],
    correctOptionId: 'b',
    explanation:
      'وفق معادلة الميزانية: حقوق الملكية = الأصول (12,000) - الالتزامات (4,500) = 7,500 دينار.',
  },
  {
    id: 'u1-q8',
    topicId: 'u1-assumptions-principles',
    prompt: 'سحب مالك محل مبلغ 300 دينار من صندوق المحل لدفع مصاريف دراسة ابنه، يجب محاسبياً:',
    options: [
      { id: 'a', label: 'تسجيله كمصروف رواتب على المحل' },
      { id: 'b', label: 'تسجيله كمسحوبات شخصية عملاً بفرض الوحدة المحاسبية المستقلة' },
      { id: 'c', label: 'إضافته إلى إيرادات المبيعات' },
      { id: 'd', label: 'عدم كتابته في الدفاتر إطلاقاً' },
    ],
    correctOptionId: 'b',
    explanation:
      'فرض الوحدة المحاسبية المستقلة يفصل بين الذمة المالية للمشروع والنفقات الشخصية لصاحبه.',
  },
  {
    id: 'u1-q9',
    topicId: 'u1-assumptions-principles',
    prompt: 'ما السياسة المحاسبية التي توجب الاحتياط للخسائر المتوقعة وعدم الاعتراف بالأرباح قبل تحققها فعلاً؟',
    options: [
      { id: 'a', label: 'سياسة التفاؤل المفرط' },
      { id: 'b', label: 'سياسة الحيطة والحذر' },
      { id: 'c', label: 'مبدأ التكلفة المتغيرة' },
      { id: 'd', label: 'فرض الدورية السنوية' },
    ],
    correctOptionId: 'b',
    explanation:
      'سياسة الحيطة والحذر تحمي المنشأة من تضخيم الأرباح عبر الاستعداد للخسائر المحتملة وتأجيل إثبات الربح حتى يتحقق.',
  },
  {
    id: 'u1-q10',
    topicId: 'u1-cycle-documents',
    prompt: 'في المحاسبة كنظام للمعلومات، ما التسلسل المنطقي الصحيح لحركة البيانات المالية؟',
    options: [
      { id: 'a', label: 'تقارير مالية ثم فواتير ثم تسجيل في اليومية' },
      { id: 'b', label: 'مدخلات (فواتير ومستندات) ثم معالجة (تسجيل وترحيل) ثم مخرجات (قوائم مالية)' },
      { id: 'c', label: 'معالجة عشوائية دون الحاجة لمستندات إثبات' },
      { id: 'd', label: 'مخرجات نهائية فقط دون تسجيل يومي' },
    ],
    correctOptionId: 'b',
    explanation:
      'تبدأ الدورة المحاسبية بالمدخلات (المستندات)، تليها المعالجة (اليومية والأستاذ)، وتنتهي بالمخرجات (التقارير والقوائم).',
  },
];

export const UNIT1_BYPASS_QUESTIONS: Unit1QuizQuestion[] = [
  UNIT1_EXAM_QUESTIONS[0],
  UNIT1_EXAM_QUESTIONS[1],
  UNIT1_EXAM_QUESTIONS[2],
  UNIT1_EXAM_QUESTIONS[3],
  UNIT1_EXAM_QUESTIONS[4],
];
