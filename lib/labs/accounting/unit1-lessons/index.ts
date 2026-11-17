import type {
  GlossaryTerm,
  LessonMeta,
  QuickQuizConfig,
  UnitLessonData,
} from './types';

export type {
  GlossaryTerm,
  LessonExplanationCard,
  LessonMeta,
  LessonStoryExample,
  LessonSvgKey,
  LessonTryItOption,
  LessonTryItQuestion,
  QuickQuizConfig,
  QuickQuizQuestion,
  UnitLessonData,
} from './types';

export const UNIT1_LESSONS_META: LessonMeta[] = [
  {
    lessonNumber: 0,
    id: 'u1-lesson-0',
    title: 'نظرة عامة على الوحدة',
    shortGoal: 'تشاهد خريطة الوحدة كاملة في فيديو تمهيدي قصير قبل البدء بالدرس الأول.',
    estimatedMinutes: 7,
    isAvailable: true,
  },
  {
    lessonNumber: 1,
    id: 'u1-lesson-1',
    title: 'ما هي المحاسبة؟',
    shortGoal: 'تفهم معنى المحاسبة ببساطة من خلال قصة مصروف الأسبوع ومحل سارة.',
    estimatedMinutes: 7,
    isAvailable: true,
  },
  {
    lessonNumber: 2,
    id: 'u1-lesson-2',
    title: 'لماذا نحتاج المحاسبة؟',
    shortGoal: 'تكتشف كيف تجيب المحاسبة عن أربعة أسئلة يطرحها كل صاحب عمل.',
    estimatedMinutes: 7,
    isAvailable: true,
  },
  {
    lessonNumber: 3,
    id: 'u1-lesson-3',
    title: 'من يستفيد من المعلومات المحاسبية؟',
    shortGoal: 'تفرّق بسهولة بين من يقرأ الأرقام من داخل المحل ومن خارجه.',
    estimatedMinutes: 6,
    isAvailable: true,
    quickQuizAfterId: 'u1-quiz-1',
  },
  {
    lessonNumber: 4,
    id: 'u1-lesson-4',
    title: 'من أين بدأت المحاسبة؟',
    shortGoal: 'تتعرف في رحلة سريعة كيف تطورت المحاسبة من ألواح الطين إلى الحاسوب.',
    estimatedMinutes: 7,
    isAvailable: true,
  },
  {
    lessonNumber: 5,
    id: 'u1-lesson-5',
    title: 'أنواع المحاسبة',
    shortGoal: 'تتعرف إلى فروع المحاسبة المختلفة مثل التكاليف والإدارية والضريبية.',
    estimatedMinutes: 6,
    isAvailable: true,
  },
  {
    lessonNumber: 6,
    id: 'u1-lesson-6',
    title: 'المحاسبة وعلاقتها بالعلوم الأخرى',
    shortGoal: 'ترى كيف تتعاون المحاسبة مع الإدارة والاقتصاد والقانون والإحصاء.',
    estimatedMinutes: 7,
    isAvailable: true,
    quickQuizAfterId: 'u1-quiz-2',
  },
  {
    lessonNumber: 7,
    id: 'u1-lesson-7',
    title: 'المفاهيم المحاسبية الأساسية',
    shortGoal: 'تتعرف بلغة بسيطة إلى ما نملكه وما علينا والإيرادات والمصروفات.',
    estimatedMinutes: 5,
    isAvailable: true,
  },
  {
    lessonNumber: 8,
    id: 'u1-lesson-8',
    title: 'الفروض المحاسبية',
    shortGoal: 'تكتشف القواعد الأساسية التي يبني عليها المحاسب حساباته بثبات.',
    estimatedMinutes: 8,
    isAvailable: true,
  },
  {
    lessonNumber: 9,
    id: 'u1-lesson-9',
    title: 'المبادئ المحاسبية',
    shortGoal: 'تفهم كيف نسجل المشتريات والأرباح بعدالة ووضوح للجميع.',
    estimatedMinutes: 6,
    isAvailable: true,
    quickQuizAfterId: 'u1-quiz-3',
  },
  {
    lessonNumber: 10,
    id: 'u1-lesson-10',
    title: 'السياسات المحاسبية',
    shortGoal: 'تتعرف إلى اختيارات المحاسب الحكيمة عند التقدير والحيطة.',
    estimatedMinutes: 7,
    isAvailable: true,
  },
  {
    lessonNumber: 11,
    id: 'u1-lesson-11',
    title: 'المحاسبة كنظام للمعلومات',
    shortGoal: 'تجمع الصورة الكاملة: كيف تدخل الفواتير وتخرج تقارير مفيدة.',
    estimatedMinutes: 6,
    isAvailable: true,
  },
  {
    lessonNumber: 12,
    id: 'u1-lesson-12',
    title: 'مراجعة الوحدة والاختبار الختامي',
    shortGoal: 'مراجعة سريعة لأهم أفكار الوحدة ثم الاختبار الختامي الذي يفتح الوحدة الثانية.',
    estimatedMinutes: 9,
    isAvailable: true,
  },
];

export const UNIT1_QUICK_QUIZ_1: QuickQuizConfig = {
  id: 'u1-quiz-1',
  title: 'اختبار سريع: الدروس 1 إلى 3',
  subtitle: 'ثلاثة أسئلة قصيرة وخفيفة لتثبت ما فهمته حتى الآن.',
  afterLessonNumber: 3,
  questions: [
    {
      id: 'qq1-1',
      prompt: 'ما التشبيه الأقرب لدور المحاسبة في أي مشروع؟',
      options: [
        {
          id: 'a',
          label: 'دفتر منظم يحفظ النقود الداخلة والخارجة ويظهر النتيجة بوضوح',
          why: 'بالضبط! المحاسبة تحفظ حركة النقود وتترجمها إلى صورة واضحة لصاحب العمل.',
        },
        {
          id: 'b',
          label: 'صندوق مقفل نضع فيه النقود دون أن نكتب شيئاً',
          why: 'بدون كتابة وتنظيم سننسى كم دفعنا وكم بعنا. المحاسبة تعتمد على التدوين المنظم.',
        },
        {
          id: 'c',
          label: 'تخمين الأرباح في نهاية السنة حسب الذاكرة',
          why: 'التخمين يؤدي لأخطاء كبيرة، بينما المحاسبة تعطينا أرقاماً حقيقية.',
        },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'qq1-2',
      prompt: 'إذا باع محل حلويات كعكاً بمبلغ 70 ديناراً، وبلغت مصاريفه 50 ديناراً، فما الذي تكشفه المحاسبة له؟',
      options: [
        {
          id: 'a',
          label: 'أن المحل حقق ربحاً صافياً قدره 20 ديناراً',
          why: 'صحيح تماماً! طرح المصاريف (50) من المبيعات (70) يوضح أن الربح 20 ديناراً.',
        },
        {
          id: 'b',
          label: 'أن المحل خسر 50 ديناراً',
          why: 'الـ 50 ديناراً هي تكاليف ومصاريف، وعند مقارنتها بالمبيعات البالغة 70 ديناراً يتبقى ربح 20 ديناراً.',
        },
        {
          id: 'c',
          label: 'أن صاحبة المحل لا تحتاج لكتابة المبيعات بعد الآن',
          why: 'كتابة المبيعات والمصاريف باستمرار هو ما سمح بمعرفة الربح بدقة.',
        },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'qq1-3',
      prompt: 'اشترت سارة الدقيق والسكر بالتقسيط من مورّد الحي. أي نوع من المستخدمين يمثّل المورّد؟',
      options: [
        {
          id: 'a',
          label: 'مستخدم من خارج المشروع يهتم بقدرة المحل على سداد ثمن البضاعة',
          why: 'ممتاز! الموردون والبنوك ودائرة الضريبة جميعهم مستخدمون من خارج المشروع.',
        },
        {
          id: 'b',
          label: 'مستخدم من داخل المشروع يعمل في المطبخ يومياً',
          why: 'المورد تاجر مستقل خارج المحل يبيعنا المواد وينتظر سداد فاتورته.',
        },
        {
          id: 'c',
          label: 'موظف في المحاسبة الحكومية',
          why: 'المورد تاجر متعامل مع المحل، وليس جهة حكومية ولا موظفاً داخلياً.',
        },
      ],
      correctOptionId: 'a',
    },
  ],
};

export const UNIT1_QUICK_QUIZ_2: QuickQuizConfig = {
  id: 'u1-quiz-2',
  title: 'اختبار سريع: الدروس 4 إلى 6',
  subtitle: 'ثلاثة أسئلة قصيرة لتثبيت تاريخ المحاسبة وفروعها وعلاقتها بالعلوم.',
  afterLessonNumber: 6,
  questions: [
    {
      id: 'qq2-1',
      prompt: 'ما المبدأ الذي اشتهر بشرحه لوكا باتشولي عام 1494 ميلادية وما زال أساس التسجيل اليوم؟',
      options: [
        {
          id: 'a',
          label: 'أسلوب القيد المزدوج (كل عملية لها طرفان متساويان)',
          why: 'صحيح! كل عملية مالية تؤثر في طرفين متساويين ليظل الدفتر متوازناً.',
        },
        {
          id: 'b',
          label: 'إلغاء الدفاتر الورقية والاكتفاء بالحفظ الشفهي',
          why: 'باتشولي دوّن قواعد التسجيل الكتابي المنظم، وليس الحفظ الشفهي.',
        },
        {
          id: 'c',
          label: 'تسجيل المبيعات فقط دون المصروفات',
          why: 'تسجيل المبيعات دون المصروفات يعطي صورة ناقصة عن الربح الفعلي.',
        },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'qq2-2',
      prompt: 'أراد مدير مصنع معرفة تكلفة إنتاج القطعة الواحدة ليحدد سعر بيعها العادل. أي فرع يستخدم؟',
      options: [
        {
          id: 'a',
          label: 'محاسبة التكاليف',
          why: 'ممتاز! محاسبة التكاليف تحسب تكلفة كل وحدة منتجة من مواد وعمالة ومصاريف.',
        },
        {
          id: 'b',
          label: 'المحاسبة الحكومية',
          why: 'المحاسبة الحكومية مختصة بأموال الوزارات والمؤسسات العامة.',
        },
        {
          id: 'c',
          label: 'التدقيق الخارجي فقط',
          why: 'التدقيق يفحص صحة القوائم، بينما حساب تكلفة الوحدة من اختصاص محاسبة التكاليف.',
        },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'qq2-3',
      prompt: 'ما الدور الرئيسي لعلم القانون في علاقته بالمحاسبة؟',
      options: [
        {
          id: 'a',
          label: 'تحديد شكل الدفاتر الإلزامية وحماية العقود والحقوق والالتزامات الضريبية',
          why: 'صحيح! المحاسب يسجل المعاملات وفق القواعد التي تنص عليها القوانين التجارية والضريبية.',
        },
        {
          id: 'b',
          label: 'إجراء المسوح الإحصائية لرضا المستهلكين',
          why: 'المسوح والتنبؤات أقرب لعلم الإحصاء، بينما يضبط القانون العقود والدفاتر الإلزامية.',
        },
        {
          id: 'c',
          label: 'برمجة شاشات البيع في الحاسوب',
          why: 'برمجة الأنظمة مهمة علم الحاسوب، أما القانون فيضع الإطار النظامي للتعاملات.',
        },
      ],
      correctOptionId: 'a',
    },
  ],
};

export const UNIT1_QUICK_QUIZ_3: QuickQuizConfig = {
  id: 'u1-quiz-3',
  title: 'اختبار سريع: الدروس 7 إلى 9',
  subtitle: 'ثلاثة أسئلة لتثبيت المفاهيم الأساسية والفروض والمبادئ المحاسبية.',
  afterLessonNumber: 9,
  questions: [
    {
      id: 'qq3-1',
      prompt: 'يمتلك محل معدات ونقوداً بقيمة 6,000 دينار، وعليه ديون لموردين 1,500 دينار. كم صافي حقوق الملكية؟',
      options: [
        {
          id: 'a',
          label: '4,500 دينار (الأصول ناقص الالتزامات)',
          why: 'صحيح تماماً! 6,000 ناقص 1,500 يساوي 4,500 ديناراً كصافي حق للمالك.',
        },
        {
          id: 'b',
          label: '7,500 دينار بجمع الدين مع الممتلكات',
          why: 'الالتزامات ديون على المحل، لذا تُطرح من الأصول لمعرفة صافي حق المالك.',
        },
        {
          id: 'c',
          label: '1,500 دينار فقط',
          why: '1,500 دينار هي حصة الموردين الدائنين لا صافي حق المالك.',
        },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'qq3-2',
      prompt: 'دفع مالك المشروع فاتورة هاتفه العائلي من صندوق المحل، فأي فرض يوجب فصلها عن مصاريف المحل؟',
      options: [
        {
          id: 'a',
          label: 'فرض الوحدة المحاسبية المستقلة',
          why: 'ممتاز! هذا الفرض يفصل بين أموال المشروع وشؤونه وبين المصاريف الشخصية للمالك.',
        },
        {
          id: 'b',
          label: 'فرض الدورية الزمنية',
          why: 'فرض الدورية يقسم عمر المشروع لفترات مثل الشهر والسنة، وليس فصل المصاريف الشخصية.',
        },
        {
          id: 'c',
          label: 'فرض الاستمرارية',
          why: 'فرض الاستمرارية يفترض بقاء المشروع يعمل مستقبلاً، وليس الفصل الشخصي.',
        },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'qq3-3',
      prompt: 'اشترت شركة سيارة بمبلغ 9,000 دينار ودفعت 500 دينار رسوماً لنقل الملكية وتجهيزها للعمل. بكم تُسجل؟',
      options: [
        {
          id: 'a',
          label: '9,500 دينار وفق مبدأ التكلفة التاريخية',
          why: 'صحيح! التكلفة التاريخية تشمل ثمن الشراء وكل النفقات اللازمة حتى يصبح الأصل جاهزاً للاستعمال.',
        },
        {
          id: 'b',
          label: '9,000 دينار فقط وتُهمل رسوم التجهيز',
          why: 'رسوم التجهيز ونقل الملكية لازمة لبدء تشغيل السيارة فتُضاف لتكلفتها.',
        },
        {
          id: 'c',
          label: '12,000 دينار حسب السعر المتوقع بعد عامين',
          why: 'مبدأ التكلفة التاريخية يعتمد التكلفة الفعلية المؤيدة بالفواتير، لا التقدير المستقبلي.',
        },
      ],
      correctOptionId: 'a',
    },
  ],
};

export const UNIT1_QUICK_QUIZZES: QuickQuizConfig[] = [
  UNIT1_QUICK_QUIZ_1,
  UNIT1_QUICK_QUIZ_2,
  UNIT1_QUICK_QUIZ_3,
];

export const UNIT1_GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    arabicTerm: 'المحاسبة المالية',
    simpleMeaning: 'تسجيل العمليات المالية وإعداد التقارير التي توضح الربح ووضع المشروع.',
    englishTerm: 'Financial Accounting',
  },
  {
    arabicTerm: 'القيد المزدوج',
    simpleMeaning: 'تسجيل كل عملية مالية بطرفين متساويين: طرف يأخذ وطرف يعطي.',
    englishTerm: 'Double-Entry Bookkeeping',
  },
  {
    arabicTerm: 'المستخدمون الداخليون',
    simpleMeaning: 'أفراد يعملون داخل المشروع كالمالك والمدير والموظفين.',
    englishTerm: 'Internal Users',
  },
  {
    arabicTerm: 'المستخدمون الخارجيون',
    simpleMeaning: 'جهات خارج المشروع مثل البنوك والموردين والضريبة والمستثمرين.',
    englishTerm: 'External Users',
  },
  {
    arabicTerm: 'الأصول (الممتلكات)',
    simpleMeaning: 'كل ما يملكه المشروع من نقود وأجهزة ومبانٍ ومخزون.',
    englishTerm: 'Assets',
  },
  {
    arabicTerm: 'الالتزامات (الديون)',
    simpleMeaning: 'المبالغ المستحقة على المشروع للبنوك أو الموردين.',
    englishTerm: 'Liabilities',
  },
  {
    arabicTerm: 'حقوق الملكية',
    simpleMeaning: 'نصيب أصحاب المشروع الصافي بعد طرح الديون.',
    englishTerm: 'Owners Equity',
  },
  {
    arabicTerm: 'قائمة الدخل',
    simpleMeaning: 'تقرير يقارن المبيعات بالمصاريف ليظهر الربح أو الخسارة.',
    englishTerm: 'Income Statement',
  },
  {
    arabicTerm: 'فرض الوحدة المحاسبية المستقلة',
    simpleMeaning: 'فصل حسابات المشروع وأمواله تماماً عن الحسابات الشخصية لمالكه.',
    englishTerm: 'Economic Entity Assumption',
  },
  {
    arabicTerm: 'مبدأ التكلفة التاريخية',
    simpleMeaning: 'تسجيل الممتلكات بالمبلغ الفعلي المدفوع وقت شرائها وتجهيزها.',
    englishTerm: 'Historical Cost Principle',
  },
  {
    arabicTerm: 'سياسة الحيطة والحذر',
    simpleMeaning: 'الاحتياط للخسائر المحتملة وعدم تسجيل الأرباح قبل تحققها فعلاً.',
    englishTerm: 'Conservatism / Prudence',
  },
  {
    arabicTerm: 'الأنظمة الإلكترونية المتكاملة',
    simpleMeaning: 'برامج حديثة تربط المبيعات والمخزون والحسابات في شاشة واحدة تلقائياً.',
    englishTerm: 'Enterprise Resource Planning (ERP)',
  },
];

export async function loadUnit1Lesson(
  lessonNumber: number
): Promise<UnitLessonData | null> {
  switch (lessonNumber) {
    case 1: {
      const mod = await import('./lesson-1');
      return mod.lesson1;
    }
    case 2: {
      const mod = await import('./lesson-2');
      return mod.lesson2;
    }
    case 3: {
      const mod = await import('./lesson-3');
      return mod.lesson3;
    }
    case 4: {
      const mod = await import('./lesson-4');
      return mod.lesson4;
    }
    case 5: {
      const mod = await import('./lesson-5');
      return mod.lesson5;
    }
    case 6: {
      const mod = await import('./lesson-6');
      return mod.lesson6;
    }
    case 7: {
      const mod = await import('./lesson-7');
      return mod.lesson7;
    }
    case 8: {
      const mod = await import('./lesson-8');
      return mod.lesson8;
    }
    case 9: {
      const mod = await import('./lesson-9');
      return mod.lesson9;
    }
    case 10: {
      const mod = await import('./lesson-10');
      return mod.lesson10;
    }
    case 11: {
      const mod = await import('./lesson-11');
      return mod.lesson11;
    }
    case 12: {
      const mod = await import('./lesson-12');
      return mod.lesson12;
    }
    default:
      return null;
  }
}
