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

export const UNIT2_LESSONS_MAP: Record<number, UnitLessonData> = {
  1: lesson1,
  2: lesson2,
  3: lesson3,
  4: lesson4,
  5: lesson5,
  6: lesson6,
  7: lesson6,
};

export function loadUnit2Lesson(lessonNumber: number): UnitLessonData | null {
  return UNIT2_LESSONS_MAP[lessonNumber] || null;
}

export const UNIT2_LESSONS_META: LessonMeta[] = [
  {
    lessonNumber: 0,
    id: 'u2-lesson-0',
    title: 'نظرة عامة على الوحدة',
    shortGoal: 'مقدمة شاملة لفصل تحليل العمليات المالية والربط بين المحاسبة والدورة المالية السبع.',
    estimatedMinutes: 7,
    isAvailable: true,
  },
  {
    lessonNumber: 1,
    id: 'u2-lesson-1',
    title: 'ماهية الدورة المحاسبية',
    shortGoal: 'التعرف على الخطوات السبع للدورة المحاسبية من تحليل العمليات وحتى إعداد القوائم المالية.',
    estimatedMinutes: 7,
    isAvailable: true,
  },
  {
    lessonNumber: 2,
    id: 'u2-lesson-2',
    title: 'التفرقة بين العمليات المالية وغير المالية',
    shortGoal: 'التمييز العملي بين الأحداث الإدارية والتشغيلية والعمليات المالية المؤثرة على الدفاتر.',
    estimatedMinutes: 6,
    isAvailable: true,
    quickQuizAfterId: 'u2-quiz-1',
  },
  {
    lessonNumber: 3,
    id: 'u2-lesson-3',
    title: 'التعرف على معادلة الميزانية',
    shortGoal: 'دراسة معادلة المركز المالي (الأصول = الالتزامات + حقوق الملكية) ومعادلتها الموسعة.',
    estimatedMinutes: 7,
    isAvailable: true,
  },
  {
    lessonNumber: 4,
    id: 'u2-lesson-4',
    title: 'معرفة أثر العمليات المالية على معادلة الميزانية',
    shortGoal: 'تحليل أثر العمليات: تبادل أصول، زيادة الطرفين، نقص الطرفين، والعمليات المركبة.',
    estimatedMinutes: 6,
    isAvailable: true,
    quickQuizAfterId: 'u2-quiz-2',
  },
  {
    lessonNumber: 5,
    id: 'u2-lesson-5',
    title: 'التعرف على القوائم المالية',
    shortGoal: 'دراسة القوائم المالية الأربعة وفق معايير المحاسبة الدولية (الدخل، حقوق الملكية، المركز المالي، التدفقات النقدية).',
    estimatedMinutes: 7,
    isAvailable: true,
  },
  {
    lessonNumber: 6,
    id: 'u2-lesson-6',
    title: 'معرفة العلاقة بين القوائم المالية',
    shortGoal: 'فهم الترابط المحاسبي والتكامل بين القوائم وتدفق الأرقام من قائمة إلى أخرى.',
    estimatedMinutes: 6,
    isAvailable: true,
  },
];

export const UNIT2_QUICK_QUIZZES: QuickQuizConfig[] = [
  {
    id: 'u2-quiz-1',
    title: 'اختبار سريع: المساقان 1 و 2',
    subtitle: 'سؤالان لتثبيت مفاهيم الدورة المحاسبية والتفرقة بين العمليات المالية وغير المالية.',
    afterLessonNumber: 2,
    questions: [
      {
        id: 'u2-qq1-1',
        prompt: 'ما الخطوة الأولى في الدورة المحاسبية من بين الخطوات السبع؟',
        options: [
          { id: 'a', label: 'تحليل العمليات المالية وتحديد أطرافها', why: 'صحيح! التحليل الدقيق هو الخطوة الأولى الأساسية.' },
          { id: 'b', label: 'ترحيل القيود لدفتر الأستاذ', why: 'الترحيل للأستاذ يأتي بعد كتابة قيود اليومية.' },
          { id: 'c', label: 'إعداد ميزان المراجعة', why: 'الميزان يأتي بعد الترحيل للأستاذ.' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'u2-qq1-2',
        prompt: 'أي من الأحداث التالية يُعد عملية مالية تُثبت في السجلات المحاسبية؟',
        options: [
          { id: 'a', label: 'شراء ورق تصوير وقرطاسية ودفع قيمتها نقداً من الصندوق', why: 'صحيح! خروج نقد وانتقال ملكية بمستند رسمي.' },
          { id: 'b', label: 'إجراء مقابلة توظيف مع محاسب وتحديد راتبه المستقبلي', why: 'المقابلة حدث إداري غير مالي.' },
          { id: 'c', label: 'استلام عروض أسعار من 3 شركات توريد', why: 'طلب عروض الأسعار استفسار تمهيدي.' },
        ],
        correctOptionId: 'a',
      },
    ],
  },
  {
    id: 'u2-quiz-2',
    title: 'اختبار سريع: المساقان 3 و 4',
    subtitle: 'سؤالان لتثبيت توازن معادلة الميزانية وأثر العمليات المركبة.',
    afterLessonNumber: 4,
    questions: [
      {
        id: 'u2-qq2-1',
        prompt: 'إذا قامت المنشأة بشراء أثاث مكتبي بقيمة 2,000 دينار على الحساب، فما أثر ذلك على كفتي المعادلة؟',
        options: [
          { id: 'a', label: 'زيادة الأصول 2,000 وزيادة الالتزامات 2,000', why: 'صحيح! تزيد أصول الأثاث والالتزامات للموردين بالتساوي.' },
          { id: 'b', label: 'زيادة الأصول 2,000 ونقص حقوق الملكية 2,000', why: 'الشراء بالأجل التزام وليس تخفيضاً للملكية.' },
          { id: 'c', label: 'لا أثر على إجمالي الأصول', why: 'الأثاث أصل جديد دخل للمنشأة فيزيد إجمالي الأصول.' },
        ],
        correctOptionId: 'a',
      },
    ],
  },
];

export const UNIT2_GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    arabicTerm: 'الدورة المحاسبية',
    englishTerm: 'Accounting Cycle',
    simpleMeaning: 'الخطوات السبع المتتابعة من تحليل العمليات المالية حتى إعداد القوائم الختامية.',
  },
  {
    arabicTerm: 'العملية المالية',
    englishTerm: 'Financial Transaction',
    simpleMeaning: 'حدث اقتصادي يؤثر في عناصر المركز المالي ويمكن قياسه بوحدة النقد بصورة موضوعية.',
  },
  {
    arabicTerm: 'معادلة الميزانية',
    englishTerm: 'Accounting Equation',
    simpleMeaning: 'القاعدة الذهبية: الأصول = الالتزامات + حقوق الملكية، وتبقى متوازنة بعد كل عملية.',
  },
  {
    arabicTerm: 'قائمة الدخل',
    englishTerm: 'Income Statement',
    simpleMeaning: 'تقرير يقيس الإيرادات والمصروفات خلال فترة للوصول إلى صافي الربح أو الخسارة.',
  },
  {
    arabicTerm: 'الترابط المحاسبي',
    englishTerm: 'Financial Statements Linkage',
    simpleMeaning: 'التكامل الرقمي حيث يغذي صافي ربح قائمة الدخل حقوق الملكية ثم المركز المالي والتدفقات.',
  },
];
