import React from 'react';
import type { LessonSvgKey } from '@/lib/labs/accounting/unit1-lessons/types';

export function Unit1LessonSvg({
  illustrationKey,
  className = '',
}: {
  illustrationKey: LessonSvgKey;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`mx-auto flex h-36 w-full max-w-[260px] items-center justify-center rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E325C] dark:bg-[#070D1F] ${className}`}
    >
      {renderSvg(illustrationKey)}
    </div>
  );
}

function renderSvg(key: LessonSvgKey) {
  switch (key) {
    case 'notebook':
      return (
        <svg viewBox="0 0 160 100" className="h-full w-full">
          <rect
            x="40"
            y="10"
            width="80"
            height="80"
            rx="12"
            fill="#FFFFFF"
            stroke="#2F6BFF"
            strokeWidth="2.5"
          />
          <line x1="58" y1="26" x2="104" y2="26" stroke="#2F6BFF" strokeWidth="3" strokeLinecap="round" />
          <line x1="58" y1="44" x2="96" y2="44" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="58" y1="58" x2="104" y2="58" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="62" cy="74" r="5" fill="#10B981" />
          <line x1="74" y1="74" x2="104" y2="74" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="34" y1="28" x2="46" y2="28" stroke="#2F6BFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="34" y1="50" x2="46" y2="50" stroke="#2F6BFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="34" y1="72" x2="46" y2="72" stroke="#2F6BFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'wallet_budget':
      return (
        <svg viewBox="0 0 160 100" className="h-full w-full">
          <rect
            x="28"
            y="24"
            width="104"
            height="60"
            rx="14"
            fill="#FFFFFF"
            stroke="#2F6BFF"
            strokeWidth="2.5"
          />
          <rect x="44" y="14" width="60" height="18" rx="6" fill="#2F6BFF" fillOpacity="0.16" stroke="#2F6BFF" strokeWidth="2" />
          <rect x="88" y="42" width="48" height="24" rx="12" fill="#2F6BFF" />
          <circle cx="102" cy="54" r="4" fill="#FFFFFF" />
          <line x1="42" y1="50" x2="74" y2="50" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
          <line x1="42" y1="62" x2="66" y2="62" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'sweets_shop':
      return (
        <svg viewBox="0 0 160 100" className="h-full w-full">
          <path
            d="M28 36 L40 16 H120 L132 36 Z"
            fill="#2F6BFF"
            fillOpacity="0.14"
            stroke="#2F6BFF"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect
            x="34"
            y="36"
            width="92"
            height="52"
            rx="6"
            fill="#FFFFFF"
            stroke="#2F6BFF"
            strokeWidth="2.5"
          />
          <rect x="48" y="48" width="32" height="22" rx="5" fill="#10B981" fillOpacity="0.18" stroke="#10B981" strokeWidth="2" />
          <rect x="90" y="48" width="22" height="40" rx="4" fill="#2F6BFF" fillOpacity="0.18" stroke="#2F6BFF" strokeWidth="2" />
          <line x1="22" y1="88" x2="138" y2="88" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'scale_profit':
      return (
        <svg viewBox="0 0 160 100" className="h-full w-full">
          <line x1="80" y1="16" x2="80" y2="82" stroke="#2F6BFF" strokeWidth="3" strokeLinecap="round" />
          <line x1="56" y1="84" x2="104" y2="84" stroke="#2F6BFF" strokeWidth="3" strokeLinecap="round" />
          <line x1="34" y1="30" x2="126" y2="24" stroke="#2F6BFF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="27" r="5" fill="#2F6BFF" />
          <rect x="22" y="44" width="28" height="18" rx="6" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
          <line x1="36" y1="30" x2="36" y2="44" stroke="#94A3B8" strokeWidth="2" />
          <rect x="110" y="38" width="28" height="18" rx="6" fill="#2F6BFF" fillOpacity="0.2" stroke="#2F6BFF" strokeWidth="2" />
          <line x1="124" y1="24" x2="124" y2="38" stroke="#94A3B8" strokeWidth="2" />
        </svg>
      );

    case 'cash_box':
      return (
        <svg viewBox="0 0 160 100" className="h-full w-full">
          <rect
            x="32"
            y="32"
            width="96"
            height="52"
            rx="12"
            fill="#FFFFFF"
            stroke="#2F6BFF"
            strokeWidth="2.5"
          />
          <rect x="52" y="18" width="56" height="22" rx="8" fill="#10B981" fillOpacity="0.18" stroke="#10B981" strokeWidth="2" />
          <circle cx="80" cy="29" r="5" fill="#10B981" />
          <rect x="68" y="50" width="24" height="16" rx="6" fill="#2F6BFF" fillOpacity="0.15" stroke="#2F6BFF" strokeWidth="2" />
          <circle cx="80" cy="58" r="3" fill="#2F6BFF" />
        </svg>
      );

    case 'inside_team':
      return (
        <svg viewBox="0 0 160 100" className="h-full w-full">
          <rect
            x="30"
            y="16"
            width="100"
            height="68"
            rx="16"
            fill="#FFFFFF"
            stroke="#2F6BFF"
            strokeWidth="2.5"
          />
          <circle cx="62" cy="44" r="10" fill="#2F6BFF" fillOpacity="0.2" stroke="#2F6BFF" strokeWidth="2" />
          <circle cx="98" cy="44" r="10" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
          <path d="M48 68 C48 58 76 58 76 68" fill="none" stroke="#2F6BFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M84 68 C84 58 112 58 112 68" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'outside_partners':
      return (
        <svg viewBox="0 0 160 100" className="h-full w-full">
          <rect
            x="58"
            y="30"
            width="44"
            height="40"
            rx="10"
            fill="#2F6BFF"
            fillOpacity="0.14"
            stroke="#2F6BFF"
            strokeWidth="2.5"
          />
          <circle cx="24" cy="28" r="10" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
          <circle cx="24" cy="72" r="10" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
          <circle cx="136" cy="50" r="10" fill="#FFFFFF" stroke="#2F6BFF" strokeWidth="2.5" />
          <line x1="34" y1="31" x2="58" y2="44" stroke="#10B981" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="34" y1="69" x2="58" y2="56" stroke="#10B981" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="102" y1="50" x2="126" y2="50" stroke="#2F6BFF" strokeWidth="2" strokeDasharray="4 3" />
        </svg>
      );

    case 'clay_tablet':
      return (
        <svg viewBox="0 0 160 100" className="h-full w-full">
          <rect
            x="44"
            y="14"
            width="72"
            height="72"
            rx="16"
            fill="#F1F5F9"
            stroke="#64748B"
            strokeWidth="2.5"
          />
          <line x1="60" y1="32" x2="72" y2="32" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="42" x2="60" y2="52" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="42" x2="70" y2="52" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <line x1="88" y1="32" x2="100" y2="32" stroke="#2F6BFF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="94" cy="52" r="6" fill="#2F6BFF" fillOpacity="0.25" stroke="#2F6BFF" strokeWidth="2" />
          <line x1="60" y1="68" x2="100" y2="68" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'balance_book':
      return (
        <svg viewBox="0 0 160 100" className="h-full w-full">
          <rect
            x="24"
            y="16"
            width="54"
            height="68"
            rx="8"
            fill="#FFFFFF"
            stroke="#2F6BFF"
            strokeWidth="2.5"
          />
          <rect
            x="82"
            y="16"
            width="54"
            height="68"
            rx="8"
            fill="#FFFFFF"
            stroke="#10B981"
            strokeWidth="2.5"
          />
          <line x1="36" y1="34" x2="66" y2="34" stroke="#2F6BFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="50" x2="62" y2="50" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="94" y1="34" x2="124" y2="34" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="94" y1="50" x2="120" y2="50" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="80" cy="50" r="7" fill="#2F6BFF" />
          <line x1="76" y1="48" x2="84" y2="48" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="76" y1="52" x2="84" y2="52" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      );

    case 'modern_screen':
      return (
        <svg viewBox="0 0 160 100" className="h-full w-full">
          <rect
            x="30"
            y="14"
            width="100"
            height="60"
            rx="10"
            fill="#FFFFFF"
            stroke="#2F6BFF"
            strokeWidth="2.5"
          />
          <line x1="60" y1="84" x2="100" y2="84" stroke="#2F6BFF" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="74" x2="80" y2="84" stroke="#2F6BFF" strokeWidth="3" />
          <rect x="46" y="42" width="14" height="20" rx="3" fill="#2F6BFF" fillOpacity="0.25" />
          <rect x="68" y="34" width="14" height="28" rx="3" fill="#2F6BFF" />
          <rect x="90" y="26" width="14" height="36" rx="3" fill="#10B981" />
        </svg>
      );
  }
}
