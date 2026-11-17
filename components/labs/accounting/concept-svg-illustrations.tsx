'use client';

import React from 'react';

export type ConceptSvgKey =
  | 'info-system'
  | 'assumptions-pillars'
  | 'users-map'
  | 'equation-balance'
  | 'statements-flow'
  | 'accounting-cycle';

export function ConceptSvgIllustration({
  variant,
  className = '',
}: {
  variant: ConceptSvgKey;
  className?: string;
}) {
  if (variant === 'info-system') {
    return (
      <svg
        viewBox="0 0 520 120"
        className={`w-full h-auto ${className}`}
        role="img"
        aria-label="مخطط المحاسبة كنظام معلومات"
      >
        <rect
          x="10"
          y="20"
          width="140"
          height="80"
          rx="12"
          fill="#2F6BFF"
          fillOpacity="0.08"
          stroke="#2F6BFF"
          strokeWidth="1.5"
        />
        <text
          x="80"
          y="54"
          textAnchor="middle"
          fill="currentColor"
          fontSize="13"
          fontWeight="700"
        >
          1. المدخلات
        </text>
        <text
          x="80"
          y="76"
          textAnchor="middle"
          fill="#64748B"
          fontSize="11"
        >
          الأحداث والمستندات المالية
        </text>

        <line
          x1="156"
          y1="60"
          x2="184"
          y2="60"
          stroke="#2F6BFF"
          strokeWidth="2"
        />
        <polygon points="184,55 192,60 184,65" fill="#2F6BFF" />

        <rect
          x="194"
          y="20"
          width="132"
          height="80"
          rx="12"
          fill="#2F6BFF"
          fillOpacity="0.14"
          stroke="#2F6BFF"
          strokeWidth="1.5"
        />
        <text
          x="260"
          y="54"
          textAnchor="middle"
          fill="currentColor"
          fontSize="13"
          fontWeight="700"
        >
          2. التشغيل
        </text>
        <text
          x="260"
          y="76"
          textAnchor="middle"
          fill="#64748B"
          fontSize="11"
        >
          التسجيل والتبويب والتلخيص
        </text>

        <line
          x1="332"
          y1="60"
          x2="360"
          y2="60"
          stroke="#22C55E"
          strokeWidth="2"
        />
        <polygon points="360,55 368,60 360,65" fill="#22C55E" />

        <rect
          x="370"
          y="20"
          width="140"
          height="80"
          rx="12"
          fill="#22C55E"
          fillOpacity="0.1"
          stroke="#22C55E"
          strokeWidth="1.5"
        />
        <text
          x="440"
          y="54"
          textAnchor="middle"
          fill="currentColor"
          fontSize="13"
          fontWeight="700"
        >
          3. المخرجات
        </text>
        <text
          x="440"
          y="76"
          textAnchor="middle"
          fill="#64748B"
          fontSize="11"
        >
          القوائم المالية لصناع القرار
        </text>
      </svg>
    );
  }

  if (variant === 'assumptions-pillars' || variant === 'users-map') {
    return (
      <svg
        viewBox="0 0 520 130"
        className={`w-full h-auto ${className}`}
        role="img"
        aria-label="مخطط الفروض والمبادئ المحاسبية"
      >
        <rect
          x="20"
          y="12"
          width="480"
          height="28"
          rx="8"
          fill="#2F6BFF"
          fillOpacity="0.12"
          stroke="#2F6BFF"
          strokeWidth="1.5"
        />
        <text
          x="260"
          y="30"
          textAnchor="middle"
          fill="currentColor"
          fontSize="12"
          fontWeight="700"
        >
          أهداف التقارير المالية: معلومات مفيدة للقرارات الاقتصادية
        </text>

        {[
          { x: 20, title: 'الشخصية المعنوية', sub: 'فصل الذمم' },
          { x: 142, title: 'الاستمرارية', sub: 'نشاط مستمر' },
          { x: 264, title: 'الدورية', sub: 'فترات منتظمة' },
          { x: 386, title: 'وحدة النقد', sub: 'قياس مالي' },
        ].map((pillar) => (
          <g key={pillar.title}>
            <rect
              x={pillar.x}
              y="52"
              width="114"
              height="64"
              rx="10"
              fill="none"
              stroke="#94A3B8"
              strokeOpacity="0.5"
              strokeWidth="1.5"
            />
            <text
              x={pillar.x + 57}
              y="78"
              textAnchor="middle"
              fill="currentColor"
              fontSize="11"
              fontWeight="700"
            >
              {pillar.title}
            </text>
            <text
              x={pillar.x + 57}
              y="98"
              textAnchor="middle"
              fill="#64748B"
              fontSize="10"
            >
              {pillar.sub}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  if (variant === 'equation-balance') {
    return (
      <svg
        viewBox="0 0 520 120"
        className={`w-full h-auto ${className}`}
        role="img"
        aria-label="مخطط توازن معادلة الميزانية"
      >
        <line
          x1="260"
          y1="26"
          x2="260"
          y2="104"
          stroke="#64748B"
          strokeWidth="2.5"
        />
        <rect
          x="215"
          y="102"
          width="90"
          height="8"
          rx="4"
          fill="#64748B"
        />
        <line
          x1="100"
          y1="38"
          x2="420"
          y2="38"
          stroke="#2F6BFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="260" cy="38" r="7" fill="#2F6BFF" />

        <rect
          x="30"
          y="50"
          width="150"
          height="46"
          rx="10"
          fill="#2F6BFF"
          fillOpacity="0.1"
          stroke="#2F6BFF"
          strokeWidth="1.5"
        />
        <text
          x="105"
          y="71"
          textAnchor="middle"
          fill="currentColor"
          fontSize="12"
          fontWeight="700"
        >
          الالتزامات + حقوق الملكية
        </text>
        <text
          x="105"
          y="87"
          textAnchor="middle"
          fill="#2F6BFF"
          fontSize="10"
        >
          مصادر الأموال (دائنة)
        </text>

        <rect
          x="340"
          y="50"
          width="150"
          height="46"
          rx="10"
          fill="#22C55E"
          fillOpacity="0.1"
          stroke="#22C55E"
          strokeWidth="1.5"
        />
        <text
          x="415"
          y="71"
          textAnchor="middle"
          fill="currentColor"
          fontSize="12"
          fontWeight="700"
        >
          الأصول
        </text>
        <text
          x="415"
          y="87"
          textAnchor="middle"
          fill="#22C55E"
          fontSize="10"
        >
          استخدامات الأموال (مدينة)
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 520 120"
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label="ترابط القوائم المالية"
    >
      <rect
        x="355"
        y="22"
        width="150"
        height="76"
        rx="12"
        fill="#2F6BFF"
        fillOpacity="0.09"
        stroke="#2F6BFF"
        strokeWidth="1.5"
      />
      <text
        x="430"
        y="52"
        textAnchor="middle"
        fill="currentColor"
        fontSize="12"
        fontWeight="700"
      >
        1. قائمة الدخل
      </text>
      <text
        x="430"
        y="74"
        textAnchor="middle"
        fill="#64748B"
        fontSize="10.5"
      >
        الإيرادات - المصروفات = صافي الدخل
      </text>

      <line
        x1="348"
        y1="60"
        x2="322"
        y2="60"
        stroke="#2F6BFF"
        strokeWidth="2"
      />
      <polygon points="322,55 314,60 322,65" fill="#2F6BFF" />

      <rect
        x="182"
        y="22"
        width="132"
        height="76"
        rx="12"
        fill="#2F6BFF"
        fillOpacity="0.14"
        stroke="#2F6BFF"
        strokeWidth="1.5"
      />
      <text
        x="248"
        y="52"
        textAnchor="middle"
        fill="currentColor"
        fontSize="12"
        fontWeight="700"
      >
        2. حقوق الملكية
      </text>
      <text
        x="248"
        y="74"
        textAnchor="middle"
        fill="#64748B"
        fontSize="10.5"
      >
        + صافي الدخل - المسحوبات
      </text>

      <line
        x1="176"
        y1="60"
        x2="150"
        y2="60"
        stroke="#22C55E"
        strokeWidth="2"
      />
      <polygon points="150,55 142,60 150,65" fill="#22C55E" />

      <rect
        x="12"
        y="22"
        width="130"
        height="76"
        rx="12"
        fill="#22C55E"
        fillOpacity="0.1"
        stroke="#22C55E"
        strokeWidth="1.5"
      />
      <text
        x="77"
        y="52"
        textAnchor="middle"
        fill="currentColor"
        fontSize="12"
        fontWeight="700"
      >
        3. المركز المالي
      </text>
      <text
        x="77"
        y="74"
        textAnchor="middle"
        fill="#64748B"
        fontSize="10.5"
      >
        الأصول = الالتزامات + الملكية
      </text>
    </svg>
  );
}
