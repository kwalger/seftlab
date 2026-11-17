'use client';

import React from 'react';
import { ArrowLeft, BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Unit1MindMapProps {
  onJumpToStation: (stationNum: 1 | 2 | 3 | 4 | 5 | 6) => void;
  onCloseMindMap: () => void;
}

export function Unit1MindMap({
  onJumpToStation,
  onCloseMindMap,
}: Unit1MindMapProps) {
  return (
    <div className="space-y-5 rounded-[16px] border-2 border-[#2563EB] bg-white p-4 sm:p-6 dark:bg-[#0A1630]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3E8F0] pb-4 dark:border-[#1E325C]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#2563EB] text-white">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0A1630] sm:text-lg dark:text-[#FAFBFC]">
              الخريطة الذهنية الشاملة للفصل الأول: مدخل إلى علم المحاسبة
            </h3>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              ملخص بصري مترابط لجميع المحطات الست للمراجعة السريعة في دقيقتين قبل الامتحان
            </p>
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={onCloseMindMap}>
          العودة للمحطات التفاعلية
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* عقدة 1 */}
        <div className="flex flex-col justify-between rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div className="space-y-2 text-xs">
            <span className="inline-block rounded bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">
              1. النظام المحاسبي ومستخدموه
            </span>
            <p className="font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              علم + فن + نظام معلومات (مدخلات ⬅ تحليل/تسجيل/تبويب/تلخيص ⬅ 4 قوائم)
            </p>
            <ul className="space-y-1 text-[#526077] dark:text-[#94A3B8]">
              <li>• القوائم الأربع: الدخل (الربح)، حقوق الملكية (التغير)، المركز المالي (الوضع المالي)، التدفقات النقدية (السيولة).</li>
              <li>• داخليون: الملاك، الإدارة، الموظفون.</li>
              <li>• خارجيون: المستثمرون المحتملون، الدائنون، المحللون، الاتحادات العمالية، الضريبة والتخطيط، العملاء.</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStation(1)}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:underline"
          >
            <span>فتح المحطة 1</span>
            <ArrowLeft className="h-3 w-3" />
          </button>
        </div>

        {/* عقدة 2 */}
        <div className="flex flex-col justify-between rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div className="space-y-2 text-xs">
            <span className="inline-block rounded bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">
              2. الفروع الـ 7 والعلوم الـ 5 والتاريخ
            </span>
            <p className="font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              المالية (الأم) | التكاليف | الإدارية | المتخصصة | الضريبية | الحكومية | التدقيق
            </p>
            <ul className="space-y-1 text-[#526077] dark:text-[#94A3B8]">
              <li>• المنشآت المتخصصة: بنوك وتأمين، زراعية، خدمية (مستشفيات، فنادق، جمعيات، تعليم، نقل، نفط ومعادن).</li>
              <li>• العلوم الـ 5: الإدارة (الإدارية)، الاقتصاد (التكاليف)، القانون (الشخصية/القضاء)، الإحصاء (العينات)، بحوث العمليات والحاسوب (CPM/البرمجة الخطية/ERP).</li>
              <li>• التاريخ: الآشوريون والفراعنة ⬅ بيت المال وحولان الحول والدواوين ⬅ باسيلو 1494م ⬅ الثورة الصناعية.</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStation(2)}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:underline"
          >
            <span>فتح المحطة 2</span>
            <ArrowLeft className="h-3 w-3" />
          </button>
        </div>

        {/* عقدة 3 */}
        <div className="flex flex-col justify-between rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div className="space-y-2 text-xs">
            <span className="inline-block rounded bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">
              3. المعادلة وتدفق الدخل
            </span>
            <p className="font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              الأصول = الالتزامات + حقوق الملكية (وحقوق الملكية = صافي الأصول)
            </p>
            <ul className="space-y-1 text-[#526077] dark:text-[#94A3B8]">
              <li>• الأصول: منافع اقتصادية وموارد يسيطر عليها المشروع.</li>
              <li>• الالتزامات: ديون وتعهدات حالية للغير.</li>
              <li>• الدخل: الإيرادات (تدفق داخل) - المصروفات (تدفق خارج) = صافي الربح الذي يرفع حقوق الملكية، بينما الخسائر والمسحوبات تخفضها.</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStation(3)}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:underline"
          >
            <span>فتح المحطة 3</span>
            <ArrowLeft className="h-3 w-3" />
          </button>
        </div>

        {/* عقدة 4 */}
        <div className="flex flex-col justify-between rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div className="space-y-2 text-xs">
            <span className="inline-block rounded bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">
              4. الفروض (4) والمبادئ (5) والسياسات (2)
            </span>
            <p className="font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              فروض: الوحدة المستقلة، الاستمرارية، الدورية، القياس النقدي
            </p>
            <ul className="space-y-1 text-[#526077] dark:text-[#94A3B8]">
              <li>• التكلفة التاريخية: شاملة الشحن والجمارك والتركيب (عيوبها: التضخم، صعوبة المقارنة، أرباح الاهتلاك الوهمية).</li>
              <li>• تحقق الإيراد: عند البيع بشرطي الاكتساب والتحقق (+ 3 استثناءات: نهاية الإنتاج، التقسيط، أثناء المقاولات).</li>
              <li>• المقابلة (ينشأ عنها الاهتلاك والتسويات)، الإفصاح (شامل/جزئي/وقائي/تثقيفي)، الثبات.</li>
              <li>• السياسات: الحيطة والحذر (الديون المشكوك فيها والمخزون بالأقل)، والأهمية النسبية.</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStation(4)}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:underline"
          >
            <span>فتح المحطة 4</span>
            <ArrowLeft className="h-3 w-3" />
          </button>
        </div>

        {/* عقدة 5 */}
        <div className="flex flex-col justify-between rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div className="space-y-2 text-xs">
            <span className="inline-block rounded bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">
              5. المستندات والدفاتر القانونية
            </span>
            <p className="font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              المستندات: داخلية (بيع، قبض، صرف، قيد) vs خارجية (مشتريات، بنك — أقوى حجية)
            </p>
            <ul className="space-y-1 text-[#526077] dark:text-[#94A3B8]">
              <li>• إجبارية بالقانون التجاري الأردني: اليومية العامة، الجرد والميزانية، الصور والرسائل.</li>
              <li>• اختيارية: الأستاذ العام، الدفاتر المساعدة، أستاذ المخازن.</li>
              <li>• بقية المقومات: القيد المزدوج، الإجراءات، الكوادر، الحاسوب، التقارير.</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStation(5)}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:underline"
          >
            <span>فتح المحطة 5</span>
            <ArrowLeft className="h-3 w-3" />
          </button>
        </div>

        {/* عقدة 6 */}
        <div className="flex flex-col justify-between rounded-[14px] border border-[#E3E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div className="space-y-2 text-xs">
            <span className="inline-block rounded bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">
              6. دليل الحسابات والترميز الرقمي
            </span>
            <p className="font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              تقسيم الحسابات إلى 5 مجموعات رقمية قياسية
            </p>
            <ul className="space-y-1 text-[#526077] dark:text-[#94A3B8]">
              <li>• المجموعة (1): الأصول (مثال: 11 غير متداولة ⬅ 111 الأراضي) [مدين].</li>
              <li>• المجموعة (2): المطلوبات (مثال: 21 طويلة الأجل ⬅ 211 قرض بنكي) [دائن].</li>
              <li>• المجموعة (3): حقوق الملكية [دائن، عدا المسحوبات مدين].</li>
              <li>• المجموعة (4): المصروفات [مدين] | المجموعة (5): الإيرادات [دائن].</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStation(6)}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:underline"
          >
            <span>فتح المحطة 6</span>
            <ArrowLeft className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
