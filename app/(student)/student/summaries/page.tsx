'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Printer,
  Sparkles,
  BookOpen,
  Scale,
  GitFork,
  Check,
  ArrowUpLeft,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/ui-kit';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SummaryCard {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  category: 'معادلات' | 'قواعد التسجيل' | 'شجرة الحسابات' | 'مفاهيم الوحدة 1';
  content: string[];
  keyRules?: { label: string; rule: string; type?: 'debit' | 'credit' | 'neutral' }[];
  downloadableText: string;
}

const SUMMARIES_DATA: SummaryCard[] = [
  {
    id: 'sheet-equation',
    title: 'معادلة الميزانية العمومية الموسعة وقواعد توازنها',
    subtitle: 'الأساس الجوهري الذي تبنى عليه كافة العمليات المحاسبية في المنشآت',
    badge: 'أساسي للميد',
    category: 'معادلات',
    content: [
      'المعادلة الأساسية: الأصول (Assets) = الالتزامات (Liabilities) + حقوق الملكية (Owner\'s Equity).',
      'المعادلة الموسعة: الأصول = الالتزامات + رأس المال + الإيرادات - المصروفات - المسحوبات الشخصية.',
      'أي عملية مالية يجب أن تحافظ على توازن طرفي المعادلة دون أي خلل.',
      'قاعدة الأثر المزدوج: إذا زاد أصل، فإما أن ينقص أصل آخر، أو يزيد التزام، أو تزيد حقوق الملكية بنفس المقدار.',
    ],
    keyRules: [
      { label: 'الأصول (Assets)', rule: 'موارد اقتصادية تملكها المنشأة وتتوقع منها منافع مستقبلية (صندوق، بنك، مدينون، أراضٍ، سيارات).' },
      { label: 'الالتزامات (Liabilities)', rule: 'تعهدات وديون على المنشأة للغير واجبة السداد مستقبلاً (دائنون، أوراق دفع، قروض بنكية).' },
      { label: 'حقوق الملكية (Equity)', rule: 'حق المالك المتبقي في الأصول بعد سداد جميع الالتزامات = رأس المال + الأرباح.' },
    ],
    downloadableText: `SEFT Lab - ورقة ملخص معادلة الميزانية العمومية
===================================================
1. المعادلة الأساسية:
   الأصول = الالتزامات + حقوق الملكية

2. المعادلة الموسعة:
   الأصول = الالتزامات + رأس المال + الإيرادات - المصروفات - المسحوبات الشخصية

3. القواعد الذهبية للعمليات المالية:
   - شراء أصل نقداً: زيادة أصل ونقص أصل آخر (المجموع ثابت).
   - شراء أصل على الحساب: زيادة أصل وزيادة التزامات (المجموع يرتفع في الطرفين).
   - سداد دين نقداً: نقص أصل ونقص التزامات (المجموع ينخفض في الطرفين).
   - تقديم خدمة نقداً أو على الحساب: زيادة أصل وزيادة إيرادات تزيد حقوق الملكية.
   - سداد مصروفات أو سحب المالك: نقص أصل ونقص حقوق الملكية.`,
  },
  {
    id: 'sheet-debit-credit',
    title: 'المصفوفة الذهبية لقواعد المدين والدائن (Debit & Credit)',
    subtitle: 'كيف تحدد طبيعة كل حساب بدقة متناهية ودون ارتباك عند إعداد القيود',
    badge: 'الأكثر استخداماً',
    category: 'قواعد التسجيل',
    content: [
      'الحسابات بطبيعتها إما مدينة (Debit) أو دائنة (Credit).',
      'القاعدة الذهبية: الزيادة تتبع طبيعة الحساب الأصلية، بينما النقص يعاكسها تماماً.',
      'الحسابات المدينة بطبيعتها: الأصول، المصروفات، والمسحوبات الشخصية.',
      'الحسابات الدائنة بطبيعتها: الالتزامات، رأس المال، والإيرادات.',
    ],
    keyRules: [
      { label: 'الأصول (Assets)', rule: 'طبيعتها مدينة. تزيد في الجانب المدين (من حـ/)، وتنقص في الجانب الدائن (إلى حـ/).', type: 'debit' },
      { label: 'المصروفات (Expenses)', rule: 'طبيعتها مدينة. تزيد في الجانب المدين، وتخفض الأرباح وحقوق الملكية.', type: 'debit' },
      { label: 'المسحوبات (Drawings)', rule: 'طبيعتها مدينة. تزيد في الجانب المدين، وتخفض رصيد رأس المال.', type: 'debit' },
      { label: 'الالتزامات (Liabilities)', rule: 'طبيعتها دائنة. تزيد في الجانب الدائن (إلى حـ/)، وتنقص في الجانب المدين (من حـ/).', type: 'credit' },
      { label: 'رأس المال (Capital)', rule: 'طبيعته دائنة. يزيد في الجانب الدائن بالاستثمارات، وينقص نادراً في المدين.', type: 'credit' },
      { label: 'الإيرادات (Revenues)', rule: 'طبيعتها دائنة. تزيد في الجانب الدائن وتزيد حقوق الملكية وصافي الربح.', type: 'credit' },
    ],
    downloadableText: `SEFT Lab - المصفوفة الذهبية لقواعد المدين والدائن
===================================================
1. الحسابات المدينة بطبيعتها (تزيد مَدينة وتنقص دائنة):
   - الأصول (Assets)
   - المصروفات (Expenses)
   - المسحوبات الشخصية (Drawings)

2. الحسابات الدائنة بطبيعتها (تزيد دائنة وتنقص مدينة):
   - الالتزامات (Liabilities)
   - رأس المال (Capital)
   - الإيرادات (Revenues)

3. شكل القيد البسيط:
   من حـ/ الحساب المدين (الذي أخذ أو زاد)
      إلى حـ/ الحساب الدائن (الذي أعطى أو زاد دائنية)`,
  },
  {
    id: 'sheet-chart-accounts',
    title: 'الدليل المحاسبي وشجرة الحسابات القياسية',
    subtitle: 'تصنيف الأصول المتداولة والثابتة والالتزامات القصيرة والطويلة الأجل',
    badge: 'مرجع كامل',
    category: 'شجرة الحسابات',
    content: [
      'الأصول المتداولة: النقدية، البنك، المدينون، أوراق القبض، بضاعة آخر المدة، والمصروفات المدفوعة مقدماً.',
      'الأصول غير المتداولة (الثابتة): الأراضي، المباني، الآلات، السيارات، والأثاث المكتبي.',
      'الالتزامات المتداولة: الدائنون (الموردون)، أوراق الدفع، القروض قصيرة الأجل، والإيرادات المقبوضة مقدماً.',
      'الالتزامات غير المتداولة: القروض البنكية طويلة الأجل وسندات القرض.',
    ],
    keyRules: [
      { label: 'المدينون vs الدائنون', rule: 'المدينون (أصل - لنا حق عند العميل) | الدائنون (التزام - علينا دين للمورد).' },
      { label: 'أوراق القبض vs الدفع', rule: 'أوراق القبض كمبيالة لصالحنا (أصل) | أوراق الدفع كمبيالة تعهدنا بسدادها (التزام).' },
      { label: 'قائمة الدخل vs المركز المالي', rule: 'قائمة الدخل (إيرادات ومصروفات لفترة) | المركز المالي (أصول والتزامات في لحظة زمنية محددة).' },
    ],
    downloadableText: `SEFT Lab - شجرة الحسابات والتصنيفات المالية
===================================================
1. الأصول (Assets):
   - متداولة: الصندوق، البنك، المدينون، أوراق القبض، المخزون، تأمين مسترد.
   - غير متداولة: أراضي، مباني، آلات ومعدات، سيارات، أثاث ديكور.

2. الالتزامات (Liabilities):
   - متداولة: دائنون (موردون)، أوراق دفع، قروض سنوية، رواتب مستحقة.
   - طويلة الأجل: قروض عقارية وبنكية لأكثر من سنة.

3. حقوق الملكية (Equity):
   - رأس المال، الأرباح المحتجزة، جاري المالك، مطروحاً منه المسحوبات.`,
  },
  {
    id: 'sheet-unit1-concepts',
    title: 'الفروض والمبادئ المحاسبية الأربعة (مفاهيم الوحدة 1)',
    subtitle: 'الركائز النظرية التي يركز عليها أساتذة الجامعات في أسئلة الامتحان النظري',
    badge: 'نظري الميد',
    category: 'مفاهيم الوحدة 1',
    content: [
      'فرض الشخصية المعنوية المستقلة: للمنشأة ذمة مالية مستقلة تماماً عن ذمة مالكها.',
      'فرض الاستمرارية: المنشأة مستمرة في نشاطها ولا نية لتصفيتها في الأجل المنظور.',
      'فرض وحدة القياس النقدي: تسجل الأحداث القابلة للقياس بوحدة النقد الرسمية فقط.',
      'فرض الفترة المحاسبية: تقسيم عمر المنشأة إلى فترات دورية (شهر، سنة) لإصدار القوائم.',
      'مبدأ التكلفة التاريخية: إثبات الأصول بتكلفتها الفعلية وقت الشراء دون تعديل بتغير الأسعار السوقية.',
      'مبدأ الاعتراف بالإيراد ومقابلة الإيرادات بالمصروفات: إثبات الإيراد عند تحققه وربط مصروفات الفترة بإيراداتها.',
    ],
    downloadableText: `SEFT Lab - ملخص الفروض والمبادئ المحاسبية المقررة
===================================================
1. الفروض المحاسبية (Assumptions):
   - فرض الشخصية المعنوية المستقلة: فصل أموال المالك عن أموال الشركة.
   - فرض الاستمرارية: افتراض استمرار المشروع للأمام وتقييم الأصول بتكلفتها واستهلاكها.
   - فرض القياس النقدي: إهمال الأحداث غير المقيسة بالنقود (ككفاءة العمال ورضاهم).
   - فرض الدورية (الفترة المحاسبية): إصدار تقارير دورية ربعية وسنوية.

2. المبادئ المحاسبية (Principles):
   - مبدأ التكلفة التاريخية (Historical Cost): الثبات على سعر الشراء الفعلي.
   - مبدأ الاعتراف بالإيراد (Revenue Recognition): عند أداء الخدمة أو تسليم السلعة.
   - مبدأ المقابلة (Matching): تحميل الفترة بمصاريفها التي ولدت إيراداتها.
   - مبدأ الإفصاح التام (Full Disclosure): إظهار كل المعلومات المؤثرة في القرار.`,
  },
];

export default function StudentSummariesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('الكل');

  const handleDownload = (summary: SummaryCard) => {
    const blob = new Blob([summary.downloadableText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`تم تحميل ملف: ${summary.title}`);
  };

  const handleCopy = (summary: SummaryCard) => {
    navigator.clipboard.writeText(summary.downloadableText);
    toast.success('تم نسخ الملخص والقوانين إلى الحافظة بنجاح');
  };

  const handleDownloadAll = () => {
    const allText = SUMMARIES_DATA.map((s) => s.downloadableText).join('\n\n===================================================\n\n');
    const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SEFTLab-All-Accounting-CheatSheets.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تنزيل حزمة الملخصات المحاسبية الكاملة بنجاح');
  };

  const filteredSummaries =
    activeCategory === 'الكل'
      ? SUMMARIES_DATA
      : SUMMARIES_DATA.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ملخصات وقوانين المحاسبة المالية"
        description="بطاقات المراجعة السريعة وقوانين امتحان الـ Mid: معادلة الميزانية الموسعة، المصفوفة الذهبية للمدين والدائن، وشجرة الحسابات القياسية للتحميل والمراجعة على الموبايل."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAll}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5 stroke-[1.5]" />
              <span>تحميل الحزمة كاملة (.txt)</span>
            </Button>
            <Link href="/student/exam-bank">
              <Button size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5 stroke-[1.5]" />
                <span>التدرب في بنك الامتحانات</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-[20px] border border-[#E3E8F0] bg-white p-2.5 shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
        {['الكل', 'معادلات', 'قواعد التسجيل', 'شجرة الحسابات', 'مفاهيم الوحدة 1'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'rounded-[14px] px-3.5 py-1.5 text-xs font-semibold transition-all',
              activeCategory === cat
                ? 'bg-[#2F6BFF] text-white shadow-xs'
                : 'text-[#526077] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#1E325C]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5">
        {filteredSummaries.map((card) => (
          <div
            key={card.id}
            className="rounded-[24px] border border-[#E3E8F0] bg-white p-5 shadow-xs transition-all dark:border-[#1E325C] dark:bg-[#0A1630]"
          >
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E3E8F0]/70 pb-4 dark:border-[#1E325C]/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#2F6BFF]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#2F6BFF] dark:text-[#8BB2FF]">
                    {card.badge}
                  </span>
                  <span className="text-xs font-medium text-[#526077] dark:text-[#94A3B8]">
                    {card.category}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                  {card.title}
                </h3>
                <p className="mt-0.5 text-xs text-[#526077] dark:text-[#94A3B8]">
                  {card.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(card)}
                  className="h-8 gap-1 rounded-[12px] px-2.5 text-xs"
                >
                  <Copy className="h-3 w-3 stroke-[1.5]" />
                  <span>نسخ</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(card)}
                  className="h-8 gap-1 rounded-[12px] px-2.5 text-xs"
                >
                  <Download className="h-3 w-3 stroke-[1.5]" />
                  <span>تحميل</span>
                </Button>
              </div>
            </div>

            {/* Bullets */}
            <div className="mt-4 space-y-2">
              {card.content.map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-xs leading-relaxed text-[#334155] dark:text-[#CBD5E1]">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2F6BFF]" />
                  <span>{line}</span>
                </div>
              ))}
            </div>

            {/* Rules Matrix Table if available */}
            {card.keyRules && card.keyRules.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-[18px] border border-[#E3E8F0] dark:border-[#1E325C]">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#F8FAFC] text-[#526077] dark:bg-[#070D1F] dark:text-[#94A3B8]">
                    <tr>
                      <th className="px-4 py-2.5 font-bold">الحساب أو العنصر</th>
                      <th className="px-4 py-2.5 font-bold">القاعدة المحاسبية والأثر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E8F0] dark:divide-[#1E325C]">
                    {card.keyRules.map((rule, idx) => (
                      <tr
                        key={idx}
                        className={cn(
                          'transition-colors',
                          rule.type === 'debit'
                            ? 'bg-[#2F6BFF]/[0.02] hover:bg-[#2F6BFF]/[0.05]'
                            : rule.type === 'credit'
                            ? 'bg-[#10B981]/[0.02] hover:bg-[#10B981]/[0.05]'
                            : 'hover:bg-[#F8FAFC] dark:hover:bg-[#070D1F]'
                        )}
                      >
                        <td className="whitespace-nowrap px-4 py-2.5 font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                          {rule.label}
                        </td>
                        <td className="px-4 py-2.5 leading-relaxed text-[#334155] dark:text-[#CBD5E1]">
                          {rule.rule}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
