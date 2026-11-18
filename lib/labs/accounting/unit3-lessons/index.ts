import type {
  GlossaryTerm,
  LessonMeta,
  QuickQuizConfig,
  UnitLessonData,
} from '../unit1-lessons/types';

import { lesson1 } from './lesson-1';
import { lesson2 } from './lesson-2';
import { lesson3 } from './lesson-3';
import { lesson4 } from './lesson-4';
import { lesson5 } from './lesson-5';
import { lesson6 } from './lesson-6';
import { lesson7 } from './lesson-7';

export const UNIT3_LESSONS_MAP: Record<number, UnitLessonData> = {
  1: lesson1,
  2: lesson2,
  3: lesson3,
  4: lesson4,
  5: lesson5,
  6: lesson6,
  7: lesson7,
};

export function loadUnit3Lesson(lessonNumber: number): UnitLessonData | null {
  return UNIT3_LESSONS_MAP[lessonNumber] || null;
}

export const UNIT3_LESSONS_META: LessonMeta[] = [
  {
    lessonNumber: 0,
    id: 'u3-lesson-0',
    title: 'نظرة عامة على الوحدة',
    shortGoal: 'مقدمة شاملة لأهداف الفصل الثالث: الدورة المحاسبية (التسجيل، الترحيل، ميزان المراجعة، القوائم المالية).',
    estimatedMinutes: 6,
    isAvailable: true,
    youtubeId: '57aglBnQ6yA',
    videoDuration: '6 دقائق',
  },
  {
    lessonNumber: 1,
    id: 'u3-lesson-1',
    title: 'معرفة الطرف المدين والطرف الدائن للقيد المحاسبي',
    shortGoal: 'تحديد الطرف المدين والطرف الدائن لكل عملية مالية وفق طبيعة الحسابات وقاعدة القيد المزدوج.',
    estimatedMinutes: 6,
    isAvailable: true,
    youtubeId: '57aglBnQ6yA',
    videoDuration: '6 دقائق',
  },
  {
    lessonNumber: 2,
    id: 'u3-lesson-2',
    title: 'كيفية تسجيل العمليات وعمل قيود اليومية',
    shortGoal: 'صياغة قيود اليومية البسيطة والقيود المركبة وتطبيق قاعدة تساوي المدين والدائن في كل قيد.',
    estimatedMinutes: 8,
    isAvailable: true,
    quickQuizAfterId: 'u3-quiz-1',
    youtubeId: '8T6Z7Cv7J6E',
    videoDuration: '8 دقائق',
  },
  {
    lessonNumber: 3,
    id: 'u3-lesson-3',
    title: 'معرفة دفتر اليومية وتقسيماته',
    shortGoal: 'دراسة أعمدة ومكونات دفتر اليومية: التاريخ، البيان، رقم صفحة الأستاذ، والمبالغ المدينة والدائنة.',
    estimatedMinutes: 6,
    isAvailable: true,
    youtubeId: '0Rt_e6IPjR4',
    videoDuration: '6 دقائق',
  },
  {
    lessonNumber: 4,
    id: 'u3-lesson-4',
    title: 'التعرف على دفتر الأستاذ وتقسيماته',
    shortGoal: 'فهم تصميم دفتر الأستاذ العام وحساب T بجانبه الأيمن (منه) وجانبه الأيسر (له).',
    estimatedMinutes: 5,
    isAvailable: true,
    quickQuizAfterId: 'u3-quiz-2',
    youtubeId: 'GbeuyFctRT8',
    videoDuration: '5 دقائق',
  },
  {
    lessonNumber: 5,
    id: 'u3-lesson-5',
    title: 'كيفية الترحيل إلى دفتر الأستاذ',
    shortGoal: 'خطوات نقل المبالغ والبيانات من دفتر اليومية إلى الحسابات المعنية في دفتر الأستاذ.',
    estimatedMinutes: 5,
    isAvailable: true,
    youtubeId: 'w9HXLrLtSqA',
    videoDuration: '5 دقائق',
  },
  {
    lessonNumber: 6,
    id: 'u3-lesson-6',
    title: 'كيفية الترصيد واستخراج أرصدة الحسابات',
    shortGoal: 'جمع جانبي الحساب وتحديد المتمم الحسابي واستخراج الرصيد المدين أو الدائن أو المقفل.',
    estimatedMinutes: 5,
    isAvailable: true,
    quickQuizAfterId: 'u3-quiz-3',
    youtubeId: 'b64B94fD3UU',
    videoDuration: '5 دقائق',
  },
  {
    lessonNumber: 7,
    id: 'u3-lesson-7',
    title: 'التعرف على ميزان المراجعة',
    shortGoal: 'إعداد ميزان المراجعة بالمجاميع وبالأرصدة، التحقق من توازن الدفاتر، وحل تطبيقات وتمارين الكتاب.',
    estimatedMinutes: 7,
    isAvailable: true,
    youtubeId: 'WXgUFjPk-Ug',
    videoDuration: '7 دقائق',
  },
];

export const UNIT3_QUICK_QUIZZES: QuickQuizConfig[] = [
  {
    id: 'u3-quiz-1',
    title: 'اختبار سريع: القيد المزدوج ودفتر اليومية',
    subtitle: 'سؤالان لترسيخ التمييز بين المدين والدائن وإثبات القيود البسيطة والمركبة.',
    afterLessonNumber: 2,
    questions: [
      {
        id: 'u3-qq1-1',
        prompt: 'في نظام القيد المزدوج، ما هي طبيعة حساب "مصروف الرواتب" عند زيادته؟',
        options: [
          { id: 'a', label: 'مدين دائماً (لأنه مصروف يمثل استخداماً للأموال)', why: 'صحيح! المصاريف طبيعتها مدينة وتزيد دائماً في الطرف المدين.' },
          { id: 'b', label: 'دائن دائماً', why: 'المصروفات ليست دائنة بل مدينة بطبيعتها.' },
          { id: 'c', label: 'بحسب رغبة المحاسب', why: 'قواعد القيد المزدوج ثابتة ومعيارية.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'u3-qq1-2',
        prompt: 'ما الذي يميز "القيد المركب" عن "القيد البسيط" في دفتر اليومية؟',
        options: [
          { id: 'a', label: 'يحتوي على أكثر من حساب في أحد طرفيه أو كليهما (من مذكورين / إلى مذكورين)', why: 'صحيح! هذا هو التعريف الدقيق للقيد المركب.' },
          { id: 'b', label: 'يسجل بدون تاريخ أو شرح', why: 'أي قيد يجب أن يتضمن تاريخاً وشرحاً موجزاً.' },
          { id: 'c', label: 'لا يشترط فيه تساوي الطرف المدين والدائن', why: 'التساوي إلزامي في كافة القيود دون استثناء.' },
        ],
        correctOptionId: 'a',
      },
    ],
  },
  {
    id: 'u3-quiz-2',
    title: 'اختبار سريع: الأستاذ والترصيد',
    subtitle: 'سؤالان لتثبيت مهارة الترحيل واستخراج أرصدة حسابات T بدقة.',
    afterLessonNumber: 4,
    questions: [
      {
        id: 'u3-qq2-1',
        prompt: 'في حساب الأستاذ العام المصمم على شكل حرف T، أين يُسجل الطرف المدين وأين يُسجل الطرف الدائن؟',
        options: [
          { id: 'a', label: 'الجانب الأيمن مدين (منه) والجانب الأيسر دائن (له)', why: 'صحيح! هذا هو التنسيق المحاسبي المعتمد.' },
          { id: 'b', label: 'الجانب الأيمن دائن والجانب الأيسر مدين', why: 'خطأ؛ الأيمن للمدين دائماً.' },
          { id: 'c', label: 'الأعلى مدين والأسفل دائن', why: 'الحساب يقسم عمودياً إلى يمين ويسار.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'u3-qq2-2',
        prompt: 'إذا بلغ مجموع الجانب المدين لحساب الصندوق 8,500 د.أ ومجموع الجانب الدائن 3,500 د.أ، فما هو رصيد الصندوق؟',
        options: [
          { id: 'a', label: 'رصيد مدين بقيمة 5,000 دينار', why: 'ممتاز! 8,500 - 3,500 = 5,000 دينار مدين لأن الطرف المدين هو الأكبر.' },
          { id: 'b', label: 'رصيد دائن بقيمة 5,000 دينار', why: 'خطأ؛ الجانب المدين هو الأكبر.' },
          { id: 'c', label: 'رصيد مقفل بقيمة 12,000 دينار', why: 'الترصيد يعتمد طرح الصغير من الكبير وليس جمعهما.' },
        ],
        correctOptionId: 'a',
      },
    ],
  },
  {
    id: 'u3-quiz-3',
    title: 'اختبار سريع: ميزان المراجعة والقوائم',
    subtitle: 'سؤالان لربط الميزان بالقوائم الختامية للمنشآت الخدمية.',
    afterLessonNumber: 6,
    questions: [
      {
        id: 'u3-qq3-1',
        prompt: 'أي قائمة مالية تستقبل أرصدة الإيرادات والمصروفات المستخرجة من ميزان المراجعة؟',
        options: [
          { id: 'a', label: 'قائمة الدخل لاحتساب صافي الربح أو الخسارة', why: 'صحيح! قائمة الدخل هي المخصصة للحسابات الاسمية المؤقتة.' },
          { id: 'b', label: 'قائمة المركز المالي فقط', why: 'المركز المالي للأصول والخصوم وحقوق الملكية.' },
          { id: 'c', label: 'سجل الأصول الثابتة', why: 'السجل ليس قائمة مالية ختامية.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'u3-qq3-2',
        prompt: 'إذا تساوى طرفا ميزان المراجعة، فهل يعني ذلك بالضرورة عدم وجود أي خطأ محاسبي على الإطلاق؟',
        options: [
          { id: 'a', label: 'لا، لأن هناك أخطاء متكافئة وأخطاء حذف كامل لا تخل بالتوازن الرياضي للميزان', why: 'رائع وعميق! توازن الميزان يثبت الصحة الحسابية فقط ولا يكشف الحذف الكامل أو القيود المتكافئة.' },
          { id: 'b', label: 'نعم، التوازن دليل قطعي على خلو الدفاتر من كل أنواع الأخطاء', why: 'غير صحيح؛ المحاسب القانوني يدقق العمليات لأن الميزان قد يتوازن رغم وجود حذف أو تبديل حسابات.' },
        ],
        correctOptionId: 'a',
      },
    ],
  },
];

export const UNIT3_GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    arabicTerm: 'الدورة المحاسبية',
    simpleMeaning: 'سلسلة الخطوات المتتابعة من تحليل العمليات المالية وتسجيلها وحتى إعداد القوائم الختامية.',
    englishTerm: 'Accounting Cycle',
  },
  {
    arabicTerm: 'نظام القيد المزدوج',
    simpleMeaning: 'قاعدة محاسبية توجب أن يكون لكل عملية مالية طرفان متساويان في القيمة: طرف مدين وطرف دائن.',
    englishTerm: 'Double-Entry System',
  },
  {
    arabicTerm: 'دفتر اليومية العامة',
    simpleMeaning: 'السجل القانوني الأولي الذي تُقيد فيه العمليات المالية بالتسلسل الزمني التاريخي.',
    englishTerm: 'General Journal',
  },
  {
    arabicTerm: 'القيد البسيط',
    simpleMeaning: 'قيد يومية يتكون من حساب واحد في الطرف المدين وحساب واحد في الطرف الدائن.',
    englishTerm: 'Simple Journal Entry',
  },
  {
    arabicTerm: 'القيد المركب',
    simpleMeaning: 'قيد يومية يشتمل على أكثر من حساب في أحد طرفيه أو كليهما (من مذكورين أو إلى مذكورين).',
    englishTerm: 'Compound Journal Entry',
  },
  {
    arabicTerm: 'دفتر الأستاذ العام',
    simpleMeaning: 'السجل التبويبي الذي يجمع حركات كل حساب مالي على حدة في صفحة مستقلة على شكل حرف T.',
    englishTerm: 'General Ledger',
  },
  {
    arabicTerm: 'الترحيل',
    simpleMeaning: 'نقل المبالغ والبيانات من قيود دفتر اليومية إلى الحسابات المعنية في دفتر الأستاذ.',
    englishTerm: 'Posting',
  },
  {
    arabicTerm: 'الترصيد',
    simpleMeaning: 'استخراج صافي الحساب بمقارنة مجموع المدين والدائن وإيجاد المتمم الحسابي للطرف الأكبر.',
    englishTerm: 'Balancing / Balancing Off',
  },
  {
    arabicTerm: 'ميزان المراجعة',
    simpleMeaning: 'كشف تجميعي لكافة حسابات الأستاذ بمجاميعها أو أرصدتها للتأكد من توازن المدين والدائن.',
    englishTerm: 'Trial Balance',
  },
  {
    arabicTerm: 'المشاريع الخدمية',
    simpleMeaning: 'المنشآت التي تقدم خدمات للعملاء دون تداول بضاعة مخزنية، وتعتمد إيراداتها على أتعاب الخدمات.',
    englishTerm: 'Service Enterprises',
  },
];
