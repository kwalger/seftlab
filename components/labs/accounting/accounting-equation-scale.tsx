'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import { Fils, formatFilsShort } from '@/lib/labs/accounting/accounts';
import { cn } from '@/lib/utils';

interface AccountingEquationScaleProps {
  assetsFils: Fils;
  liabilitiesFils: Fils;
  equityFils: Fils;
  capitalFils?: Fils;
  revenuesFils?: Fils;
  expensesFils?: Fils;
  drawingsFils?: Fils;
  compact?: boolean;
}

export function AccountingEquationScale({
  assetsFils,
  liabilitiesFils,
  equityFils,
  capitalFils,
  revenuesFils,
  expensesFils,
  drawingsFils,
  compact = false,
}: AccountingEquationScaleProps) {
  const rightSideFils = liabilitiesFils + equityFils;
  const diffFils = assetsFils - rightSideFils;
  const isBalanced = diffFils === 0;

  // حساب زاوية ميلان ذراع الميزان بصرياً (بحد أقصى +-8 درجات)
  const maxScale = Math.max(Math.abs(assetsFils), Math.abs(rightSideFils), 1000);
  const rawTilt = (diffFils / maxScale) * 18;
  const tiltDeg = Math.max(-8, Math.min(8, rawTilt));

  const liabilitiesRatio =
    rightSideFils > 0
      ? Math.max(0, Math.min(100, Math.round((liabilitiesFils / rightSideFils) * 100)))
      : 0;
  const equityRatio = 100 - liabilitiesRatio;

  return (
    <div className="rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#2F6BFF]/10 text-[#2F6BFF]">
            <Scale className="h-4 w-4 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
              ميزان المعادلة المحاسبية اللحظي
            </h3>
            <p className="text-[11px] text-[#526077] dark:text-[#94A3B8]">
              الأصول = الالتزامات + حقوق الملكية
            </p>
          </div>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 text-xs font-medium',
            isBalanced
              ? 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]'
              : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
          )}
        >
          {isBalanced ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.75]" />
              <span>متوازن تماماً</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5 stroke-[1.75]" />
              <span className="font-tabular">
                فرق: {formatFilsShort(Math.abs(diffFils))}
              </span>
            </>
          )}
        </span>
      </div>

      {/* الميزان البصري المتحرك SVG */}
      {!compact && (
        <div className="mt-4 flex justify-center">
          <svg
            viewBox="0 0 360 94"
            className="h-24 w-full max-w-md"
            role="img"
            aria-label="رسم توازن المعادلة المحاسبية"
          >
            <line
              x1="180"
              y1="20"
              x2="180"
              y2="82"
              stroke="#64748B"
              strokeWidth="2.5"
            />
            <rect x="144" y="80" width="72" height="7" rx="3.5" fill="#64748B" />
            <g
              style={{
                transformOrigin: '180px 26px',
                transform: `rotate(${tiltDeg}deg)`,
                transition: 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <line
                x1="48"
                y1="26"
                x2="312"
                y2="26"
                stroke={isBalanced ? '#22C55E' : '#EF4444'}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx="180"
                cy="26"
                r="6"
                fill={isBalanced ? '#22C55E' : '#EF4444'}
              />
              {/* الكفة اليمنى: الأصول */}
              <line x1="296" y1="26" x2="296" y2="48" stroke="#94A3B8" strokeWidth="1.5" />
              <rect
                x="244"
                y="48"
                width="104"
                height="24"
                rx="6"
                fill="#2F6BFF"
                fillOpacity="0.14"
                stroke="#2F6BFF"
                strokeWidth="1.25"
              />
              <text
                x="296"
                y="64"
                textAnchor="middle"
                fill="currentColor"
                fontSize="10.5"
                fontWeight="700"
              >
                الأصول
              </text>

              {/* الكفة اليسرى: الالتزامات + الملكية */}
              <line x1="64" y1="26" x2="64" y2="48" stroke="#94A3B8" strokeWidth="1.5" />
              <rect
                x="12"
                y="48"
                width="104"
                height="24"
                rx="6"
                fill="#22C55E"
                fillOpacity="0.14"
                stroke="#22C55E"
                strokeWidth="1.25"
              />
              <text
                x="64"
                y="64"
                textAnchor="middle"
                fill="currentColor"
                fontSize="10"
                fontWeight="700"
              >
                الالتزامات + الملكية
              </text>
            </g>
          </svg>
        </div>
      )}

      {/* الأرقام التفصيلية للطرفين */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-11 md:items-center">
        <div className="rounded-[12px] border border-[#2F6BFF]/30 bg-[#F1F4F9] p-3.5 md:col-span-5 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#2F6BFF]">الأصول (الاستخدامات)</span>
            <span className="font-tabular text-[#526077] dark:text-[#94A3B8]">100%</span>
          </div>
          <p className="mt-1.5 font-tabular text-lg font-bold text-[#0A1630] sm:text-xl dark:text-[#FAFBFC]">
            {formatFilsShort(assetsFils)}
          </p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E3E8F0] dark:bg-[#1E325C]">
            <div className="h-full w-full rounded-full bg-[#2F6BFF] transition-all duration-300" />
          </div>
        </div>

        <div className="flex items-center justify-center md:col-span-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E3E8F0] bg-[#F1F4F9] font-tabular text-base font-bold text-[#0A1630] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]">
            =
          </span>
        </div>

        <div className="rounded-[12px] border border-[#E3E8F0] bg-[#F1F4F9] p-3.5 md:col-span-5 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-tabular font-medium text-[#0A1630] dark:text-[#FAFBFC]">
              الالتزامات: {formatFilsShort(liabilitiesFils)} ({liabilitiesRatio}%)
            </span>
            <span className="font-tabular font-medium text-[#22C55E]">
              الملكية: {formatFilsShort(equityFils)} ({equityRatio}%)
            </span>
          </div>
          <p className="mt-1.5 font-tabular text-lg font-bold text-[#0A1630] sm:text-xl dark:text-[#FAFBFC]">
            {formatFilsShort(rightSideFils)}
          </p>
          <div className="mt-2.5 flex h-1.5 w-full overflow-hidden rounded-full bg-[#E3E8F0] dark:bg-[#1E325C]">
            <div
              className="h-full bg-[#0A1630] transition-all duration-300 dark:bg-[#94A3B8]"
              style={{ width: `${liabilitiesRatio}%` }}
            />
            <div
              className="h-full bg-[#22C55E] transition-all duration-300"
              style={{ width: `${equityRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* تفصيل معادلة حقوق الملكية الموسعة عند توفرها */}
      {(capitalFils !== undefined ||
        revenuesFils !== undefined ||
        expensesFils !== undefined) && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E3E8F0] pt-3 text-xs sm:grid-cols-4 dark:border-[#1E325C]">
          <div className="rounded-[10px] bg-[#FAFBFC] px-3 py-2 dark:bg-[#070D1F]">
            <span className="block text-[11px] text-[#526077] dark:text-[#94A3B8]">
              رأس المال
            </span>
            <span className="font-tabular font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
              {formatFilsShort(capitalFils || 0)}
            </span>
          </div>
          <div className="rounded-[10px] bg-[#FAFBFC] px-3 py-2 dark:bg-[#070D1F]">
            <span className="block text-[11px] text-[#526077] dark:text-[#94A3B8]">
              + الإيرادات الصافية
            </span>
            <span className="font-tabular font-semibold text-[#22C55E]">
              {formatFilsShort(revenuesFils || 0)}
            </span>
          </div>
          <div className="rounded-[10px] bg-[#FAFBFC] px-3 py-2 dark:bg-[#070D1F]">
            <span className="block text-[11px] text-[#526077] dark:text-[#94A3B8]">
              - المصروفات الصافية
            </span>
            <span className="font-tabular font-semibold text-red-600 dark:text-red-400">
              {formatFilsShort(expensesFils || 0)}
            </span>
          </div>
          <div className="rounded-[10px] bg-[#FAFBFC] px-3 py-2 dark:bg-[#070D1F]">
            <span className="block text-[11px] text-[#526077] dark:text-[#94A3B8]">
              - المسحوبات الشخصية
            </span>
            <span className="font-tabular font-semibold text-amber-600 dark:text-amber-400">
              {formatFilsShort(drawingsFils || 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
