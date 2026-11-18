import type { Metadata } from 'next';
import { LegalArticle, LegalShell } from '@/components/legal/legal-shell';
import { SeoHubClient } from '@/components/seo/seo-hub-client';
import { safeJsonLdStringify } from '@/lib/seo/json-ld';
import {
  FOUNDER_NAME,
  FOUNDER_TITLE,
} from '@/components/legal/founder-portrait';

const getValidBaseUrl = () => {
  const envUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    try {
      return new URL(envUrl).toString();
    } catch {
      // fallback
    }
  }
  return 'https://seftlab.com';
};

const baseUrl = getValidBaseUrl();

export const metadata: Metadata = {
  title: 'مركز تصدر محركات البحث والأرشفة الذكية (SEO)',
  description:
    'الخريطة الدلالية وبنية الأرشفة الذكية (SEO) لمنصة SEFT Lab ومؤسسها ورئيسها التنفيذي حسن عبدالرحمن العرجان لتصدر نتائج البحث في Google و Bing.',
  keywords: [
    'SEFT Lab',
    'منصة SEFT Lab',
    'حسن عبدالرحمن العرجان',
    'seftlab.com',
    'مختبر المحاسبة المالية التطبيقي',
    'مختبرات محاكاة عملية',
    'شركة افتراضية للطلاب',
    'تدريب عملي محاسبة الأردن',
    'SEO SEFT Lab',
  ],
  alternates: {
    canonical: '/seo',
  },
};

export default function SeoHubPage() {
  const seoGraphJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}/seo#webpage`,
        url: `${baseUrl}/seo`,
        name: 'مركز تصدر محركات البحث والأرشفة الذكية — منصة SEFT Lab',
        inLanguage: 'ar-JO',
        isPartOf: {
          '@id': `${baseUrl}/#website`,
        },
        about: {
          '@id': `${baseUrl}/#organization`,
        },
      },
      {
        '@type': 'EducationalOrganization',
        '@id': `${baseUrl}/#organization`,
        name: 'منصة SEFT Lab — seftlab.com',
        url: baseUrl,
        founder: {
          '@type': 'Person',
          name: FOUNDER_NAME,
          jobTitle: FOUNDER_TITLE,
          image: `${baseUrl}/founder-hasan-alarjan.jpg`,
          sameAs: ['https://ibb.co/qY9QF7wS'],
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Amman',
          addressCountry: 'JO',
        },
      },
      {
        '@type': 'ItemList',
        name: 'أهم مسارات ووثائق منصة SEFT Lab',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'مختبر المحاسبة المالية التطبيقي', url: `${baseUrl}/labs/accounting` },
          { '@type': 'ListItem', position: 2, name: `عن منصة SEFT Lab والمؤسس ${FOUNDER_NAME}`, url: `${baseUrl}/about` },
          { '@type': 'ListItem', position: 3, name: 'سياسة الخصوصية وحماية البيانات', url: `${baseUrl}/privacy` },
          { '@type': 'ListItem', position: 4, name: 'الشروط والأحكام القانونية', url: `${baseUrl}/terms` },
          { '@type': 'ListItem', position: 5, name: 'إخلاء المسؤولية وميثاق النزاهة', url: `${baseUrl}/disclaimer` },
          { '@type': 'ListItem', position: 6, name: 'بوابة الشركات واستقطاب الخريجين', url: `${baseUrl}/for-companies` },
        ],
      },
    ],
  };

  return (
    <LegalShell
      activePath="/seo"
      title="مركز الأرشفة الذكية وتصدر محركات البحث (SEO)"
      subtitle="بنية فهرسة دلالية وتقنية متكاملة مصممة لرفع ظهور منصة SEFT Lab ومختبراتها التطبيقية واسم مؤسسها ورئيسها التنفيذي إلى صدارة نتائج محركات البحث العالمية."
      documentCode="SEFT-SEO-CORE-2026/01"
      effectiveDate="2026/01/01"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(seoGraphJsonLd) }}
      />

      <SeoHubClient baseUrl={baseUrl} />

      <LegalArticle number="منهجية التصدر" title="مرتكزات تصدر منصة SEFT Lab في Google و Bing">
        <ol className="list-decimal space-y-2 pr-5">
          <li>
            <strong>الهوية الموثقة (E-E-A-T):</strong> ربط جميع صفحات المنصة والمختبرات بالملف التعريفي الرسمي للمنصة وبمؤسسها ورئيسها التنفيذي <strong>{FOUNDER_NAME}</strong> مع وثائق قانونية كاملة تعزز موثوقية النطاق في خوارزميات Google.
          </li>
          <li>
            <strong>الأرشفة الهيكلية (XML + JSON-LD + Semantic Silo):</strong> توفير خريطة موقع XML محدثة تلقائياً عبر <code>/sitemap.xml</code>، وملف <code>/robots.txt</code> مضبوط، وبيانات منظمة بصيغة <code>Schema.org</code> لكل مختبر وملف طالب وصفحة قانونية.
          </li>
          <li>
            <strong>جودة تجربة الهاتف (Core Web Vitals):</strong> سرعة عرض وتجاوب كاملة على الهواتف الذكية باللغة العربية الفصحى المبسطة (`ar-JO`) ودون عوائق فهرسة.
          </li>
        </ol>
      </LegalArticle>
    </LegalShell>
  );
}
