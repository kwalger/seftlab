import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpLeft,
  Award,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  FileCheck2,
  Landmark,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { LegalArticle, LegalShell } from '@/components/legal/legal-shell';
import {
  FOUNDER_ENGLISH_TITLE,
  FOUNDER_NAME,
  FOUNDER_TITLE,
  FounderPortrait,
} from '@/components/legal/founder-portrait';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'عن منصة SEFT Lab (seftlab.com) والمؤسس والرئيس التنفيذي',
  description:
    'التعريف الرسمي بمنصة SEFT Lab (Skills, Experience, Future, Training — مهارات، خبرة، مستقبل، تدريب) بقيادة المؤسس والرئيس التنفيذي حسن عبدالرحمن العرجان.',
  alternates: {
    canonical: '/about',
  },
};

const SEFT_PILLARS = [
  {
    letter: 'S',
    english: 'Skills',
    arabic: 'مهارات',
    summary:
      'تحويل المعرفة الجامعية النظرية إلى مهارات تطبيقية قابلة للقياس داخل جداول العمل المحاسبية والمختبرات التفاعلية.',
    impact: 'للطلاب: إتقان فعلي للأرقام والأدوات بدل الحفظ المجرد.',
  },
  {
    letter: 'E',
    english: 'Experience',
    arabic: 'خبرة',
    summary:
      'منح الطالب تجربة مهنية موثقة قبل التخرج عبر محاكاة عمليات الشركات، القيود، التسويق، والإدارة.',
    impact: 'للشركات: سجل أداء حقيقي يغني عن التخمين في السير الذاتية.',
  },
  {
    letter: 'F',
    english: 'Future',
    arabic: 'مستقبل',
    summary:
      'جسر رقمي عالمي يوائم مخرجات الجامعات مع احتياجات سوق العمل ومؤشرات الكفاءة المطلوبة إقليمياً ودولياً.',
    impact: 'للمستثمرين والجامعات: نموذج قابل للتوسع عبر المساقات والقطاعات.',
  },
  {
    letter: 'T',
    english: 'Training',
    arabic: 'تدريب',
    summary:
      'منهجية تدريب متدرجة تجمع الشرح الواضح، التطبيق العملي المباشر باليد، والتصحيح الآلي الفوري مع المعلم.',
    impact: 'لأعضاء هيئة التدريس: تصحيح آلي فوري وتقارير أداء لكل شعبة.',
  },
];

export default function AboutPage() {
  return (
    <LegalShell
      activePath="/about"
      title="عن منصة SEFT Lab (seftlab.com) والمؤسس والرئيس التنفيذي"
      subtitle="منصة عالمية للتأهيل التطبيقي ومحاكاة العمل الحقيقي (Skills, Experience, Future, Training)، تأسست لتكون الجسر العملي الموثوق بين الجامعات وسوق العمل."
      documentCode="SEFT-GOV-2026-01"
      effectiveDate="2026/01/01"
    >
      {/* بطاقة المؤسس والرئيس التنفيذي */}
      <section
        aria-label="المؤسس والرئيس التنفيذي لمنصة SEFT Lab"
        className="overflow-hidden rounded-[28px] border border-[#E3E8F0] bg-white p-5 sm:p-8 dark:border-[#1E325C] dark:bg-[#0A1630]"
      >
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5 lg:col-span-4">
            <div className="mx-auto max-w-[280px] rounded-[24px] border border-[#E3E8F0] bg-[#FAFBFC] p-2.5 dark:border-[#1E325C] dark:bg-[#070D1F]">
              <FounderPortrait
                className="aspect-square w-full rounded-[18px]"
                sizes="(max-width: 768px) 260px, 300px"
                priority
              />
              <div className="mt-3 px-1 pb-1 text-center">
                <p className="text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  {FOUNDER_NAME}
                </p>
                <p className="mt-0.5 text-xs font-medium text-[#2F6BFF]">
                  {FOUNDER_TITLE}
                </p>
                <p className="font-tabular mt-0.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  {FOUNDER_ENGLISH_TITLE}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 lg:col-span-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F6BFF]/10 px-3 py-1 text-xs font-semibold text-[#2F6BFF]">
              <Award className="h-3.5 w-3.5 stroke-[1.75]" />
              <span>القيادة التنفيذية والتأسيس</span>
            </span>

            <h2 className="mt-3 text-xl font-semibold text-[#0A1630] sm:text-2xl dark:text-[#FAFBFC]">
              كلمة المؤسس والرئيس التنفيذي: {FOUNDER_NAME}
            </h2>

            <blockquote className="mt-4 rounded-[20px] border-r-4 border-[#2F6BFF] bg-[#FAFBFC] p-4 text-sm leading-[1.9] text-[#334155] sm:p-5 sm:text-base dark:bg-[#070D1F] dark:text-[#CBD5E1]">
              أُطلقت منصة SEFT Lab (seftlab.com) انطلاقاً من قناعة واضحة بأن الفجوة بين قاعة الدراسة وسوق العمل لا تُحلّ بالمزيد من التلقين النظري، بل ببيئة تطبيقية يمارس فيها الطالب العمل بيده في جداول ودفاتر وأنظمة تحاكي الواقع. يجمع اسم SEFT أركان هذه الرؤية: Skills (مهارات)، Experience (خبرة)، Future (مستقبل)، وTraining (تدريب) — ليخرج المتدرب بأداء موثق تتحدث به أرقامه أمام الجامعات والشركات والمستثمرين.
            </blockquote>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-[#E3E8F0] bg-[#FAFBFC] p-3.5 dark:border-[#1E325C] dark:bg-[#070D1F]">
                <p className="text-xs font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  النطاق والهوية العالمية
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                  منصة تقنية تعليمية مستقلة تعمل عبر النطاق الرسمي seftlab.com لخدمة طلبة الجامعات والمعلمين والشركات.
                </p>
              </div>
              <div className="rounded-[18px] border border-[#E3E8F0] bg-[#FAFBFC] p-3.5 dark:border-[#1E325C] dark:bg-[#070D1F]">
                <p className="text-xs font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                  نطاق التشغيل التطبيقي
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                  تشمل المنصة مختبرات وجداول التطبيق العملي في المحاسبة المالية والتسويق وإدارة الأعمال وتحليل البيانات.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* قصة الاسم والرؤية: SEFT */}
      <LegalArticle
        number="قصة الاسم والرؤية"
        title="لماذا SEFT Lab؟ (Skills · Experience · Future · Training)"
      >
        <p>
          يمثّل اختصار <strong>SEFT</strong> الإطار التنفيذي الذي تقوم عليه منصة{' '}
          <strong>seftlab.com</strong> أمام الجامعات والمؤسسات الاستثمارية وشركاء التوظيف: تحويل كل ساعة دراسة جامعية إلى مخرج عملي موثق بالأرقام.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {SEFT_PILLARS.map((pillar) => (
            <div
              key={pillar.letter}
              className="rounded-[22px] border border-[#E3E8F0] bg-[#FAFBFC] p-5 dark:border-[#1E325C] dark:bg-[#070D1F]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-tabular flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#2F6BFF] text-lg font-bold text-white">
                    {pillar.letter}
                  </span>
                  <div>
                    <p
                      dir="ltr"
                      className="text-sm font-bold tracking-wide text-[#0A1630] dark:text-white"
                    >
                      {pillar.english}
                    </p>
                    <p className="text-xs font-semibold text-[#2F6BFF]">
                      {pillar.arabic}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
                {pillar.summary}
              </p>
              <p className="mt-2 border-t border-[#E3E8F0] pt-2 text-[11px] font-semibold text-[#0A1630] dark:border-[#1E325C] dark:text-[#93C5FD]">
                {pillar.impact}
              </p>
            </div>
          ))}
        </div>
      </LegalArticle>

      {/* الركائز المؤسسية والقانونية */}
      <LegalArticle number="الركن الأول" title="الطبيعة القانونية والتنظيمية لمنصة SEFT Lab">
        <p>
          تُعرَّف منصة <strong>SEFT Lab (seftlab.com)</strong> بأنها{' '}
          <strong>منصة تعليمية وتدريبية تطبيقية</strong> أسسها ويقودها{' '}
          <strong>{FOUNDER_NAME}</strong> بصفته المؤسس والرئيس التنفيذي، وتعمل على توفير بيئة محاكاة وجداول عملية رقمية لأغراض التأهيل العلمي والمهني.
        </p>
        <p>
          لا تُعد المنصة مؤسسة مصرفية أو شركة وساطة مالية أو مكتب تدقيق قانوني مرخصاً لإصدار تقارير مالية حقيقية، بل تقتصر جميع أنشطتها وبيانات شركاتها الافتراضية على المحاكاة التعليمية الخاضعة لضوابط الجودة الأكاديمية والنزاهة المهنية.
        </p>
      </LegalArticle>

      <LegalArticle number="الركن الثاني" title="الأهداف الاستراتيجية ومنهجية التحقق المهني">
        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          {[
            {
              icon: BookOpenCheck,
              heading: 'تأسيس تطبيقي متدرج',
              body: 'تبسيط العلوم التطبيقية بدءاً من المفاهيم التأسيسية وصولاً إلى إعداد الجداول والقيود والعمليات التشغيلية الكاملة.',
            },
            {
              icon: CheckCircle2,
              heading: 'ملف مهني موثق بالأداء',
              body: 'توثيق الدرجات والمؤشرات المهارية الفعلية للمتدرب دون تضخيم أو بيانات إنشائية غير قابلة للتحقق.',
            },
            {
              icon: Landmark,
              heading: 'الالتزام بالمعايير والتشريعات',
              body: 'احترام قوانين حماية البيانات الشخصية وحقوق الملكية الفكرية والمعاملات الإلكترونية.',
            },
            {
              icon: Building2,
              heading: 'تمكين الجامعات وجهات التوظيف',
              body: 'توفير واجهة عرض شفافة تتيح للجامعات متابعة الطلبة وللشركات استكشاف الكفاءات بموافقة الطالب الصريحة.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.heading}
                className="rounded-[20px] border border-[#E3E8F0] bg-[#FAFBFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]"
              >
                <div className="flex items-center gap-2 text-[#0A1630] dark:text-[#FAFBFC]">
                  <Icon className="h-4 w-4 text-[#2F6BFF]" />
                  <h3 className="text-sm font-semibold">{item.heading}</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </LegalArticle>

      <LegalArticle number="الركن الثالث" title="الوثائق القانونية والضوابط المعتمدة">
        <p>
          تخضع كافة التعاملات داخل منصة SEFT Lab (seftlab.com) لمجموعة متكاملة من الوثائق القانونية الملزمة التي تحدد حقوق والتزامات المتدربين والمشرفين والشركات وإدارة المنصة:
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/privacy"
            className="group rounded-[20px] border border-[#E3E8F0] bg-[#FAFBFC] p-4 transition-colors hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]"
          >
            <div className="flex items-center justify-between">
              <ShieldCheck className="h-5 w-5 text-[#2F6BFF]" />
              <ArrowUpLeft className="h-4 w-4 text-[#94A3B8] transition-transform group-hover:-translate-x-0.5 group-hover:text-[#2F6BFF]" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
              سياسة الخصوصية
            </p>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              ضوابط جمع ومعالجة وحماية البيانات الشخصية وسجلات الأداء.
            </p>
          </Link>

          <Link
            href="/terms"
            className="group rounded-[20px] border border-[#E3E8F0] bg-[#FAFBFC] p-4 transition-colors hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]"
          >
            <div className="flex items-center justify-between">
              <Scale className="h-5 w-5 text-[#2F6BFF]" />
              <ArrowUpLeft className="h-4 w-4 text-[#94A3B8] transition-transform group-hover:-translate-x-0.5 group-hover:text-[#2F6BFF]" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
              الشروط والأحكام
            </p>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              الأهلية القانونية، الملكية الفكرية، وضوابط الاستخدام والاختصاص القضائي.
            </p>
          </Link>

          <Link
            href="/disclaimer"
            className="group rounded-[20px] border border-[#E3E8F0] bg-[#FAFBFC] p-4 transition-colors hover:border-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F]"
          >
            <div className="flex items-center justify-between">
              <FileCheck2 className="h-5 w-5 text-[#2F6BFF]" />
              <ArrowUpLeft className="h-4 w-4 text-[#94A3B8] transition-transform group-hover:-translate-x-0.5 group-hover:text-[#2F6BFF]" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
              إخلاء المسؤولية وميثاق النزاهة
            </p>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              حدود المسؤولية عن المحاكاة، ميثاق النزاهة، وسياسة التخزين المحلي.
            </p>
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 pt-2">
          <Link href="/labs/accounting">
            <Button size="lg">
              <span>دخول مختبر المحاسبة المالية</span>
              <ArrowUpLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              <span>إنشاء حساب متدرب جديد</span>
            </Button>
          </Link>
        </div>
      </LegalArticle>
    </LegalShell>
  );
}
