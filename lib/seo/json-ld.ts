import { StudentTalent } from '@/types';
import { LabMetadata } from '@/data/mock-data';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seftlab.com';

export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function getRootJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'SEFT Lab — Skills, Experience, Future, Training (seftlab.com)',
      url: BASE_URL,
      logo: `${BASE_URL}/pwa-512x512.png`,
      description:
        'منصة SEFT Lab التعليمية التطبيقية (مهارات، خبرة، مستقبل، تدريب): مختبرات عملية وجداول محاكاة موثقة النتائج للجامعات والطلاب والشركات.',
      founder: {
        '@type': 'Person',
        name: 'حسن عبدالرحمن العرجان',
        jobTitle: 'المؤسس والرئيس التنفيذي لمنصة SEFT Lab',
        image: `${BASE_URL}/founder-hasan-alarjan.jpg`,
        url: `${BASE_URL}/about`,
        sameAs: ['https://ibb.co/qY9QF7wS'],
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Amman',
        addressCountry: 'JO',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      name: 'SEFT Lab — seftlab.com',
      url: BASE_URL,
      inLanguage: 'ar',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/labs?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

export function getCourseJsonLd(lab: LabMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Course', 'LearningResource'],
    name: lab.title,
    description: lab.description,
    provider: {
      '@type': 'Organization',
      name: 'SEFT Lab — seftlab.com',
      sameAs: BASE_URL,
    },
    educationalLevel: 'Beginner to Advanced',
    learningResourceType: 'Interactive Simulation Lab',
    inLanguage: 'ar',
    teaches: lab.skillsLearned,
    url: `${BASE_URL}${lab.slug}`,
  };
}

export function getPersonJsonLd(student: StudentTalent) {
  if (!student.isPublicToCompanies) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: student.fullName,
    url: `${BASE_URL}/students/${student.username}`,
    description: student.bio,
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: student.university,
    },
    knowsAbout: [
      student.major,
      'المحاسبة المالية',
      'التسويق الرقمي',
      'إدارة الأعمال',
      'Python',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: student.city,
    },
  };
}

export function getBreadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}

export const HOME_FAQS: { question: string; answer: string }[] = [
  {
    question: 'ماذا يعني اسم SEFT Lab (seftlab.com)؟',
    answer:
      'SEFT هي اختصار لأركان التأهيل الأربعة التي تأسست عليها المنصة: Skills (مهارات)، Experience (خبرة)، Future (مستقبل)، وTraining (تدريب)، حيث يتدرّب الطالب عملياً ليبني خبرة حقيقية موثقة تؤهله للمستقبل.',
  },
  {
    question: 'هل أحتاج إلى سيرة ذاتية أو خبرة سابقة للبدء؟',
    answer:
      'لا. تبدأ التدريب مباشرة داخل المختبرات وجداول التطبيق العملي بخطوات واضحة، وكل مشروع تحله يضيف نقاطاً ومهارات موثقة إلى ملفك تلقائياً.',
  },
  {
    question: 'كيف ترتبط المختبرات الأربعة ببعضها؟',
    answer:
      'جميع المختبرات تعمل على نفس الشركة الافتراضية؛ فأي حملة تسويقية تطلقها أو قرار إداري تتخذه ينعكس فوراً على الميزانية والأرباح في المحاسبة.',
  },
  {
    question: 'كيف تصل الجامعات والشركات إلى نتائج المتدربين؟',
    answer:
      'يتابع أساتذة الجامعات تقدم الشعب عبر كود الشعبة والتصحيح الآلي، وتستعرض الشركات ملفات المواهب الموثقة بالأرقام لدعوة المتميزين مباشرة.',
  },
];

export function getFaqJsonLd(
  faqs: { question: string; answer: string }[] = HOME_FAQS
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

