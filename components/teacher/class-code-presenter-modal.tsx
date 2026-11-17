'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  X,
  QrCode,
  Users,
  ExternalLink,
  Presentation,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ClassSection } from '@/types';

interface ClassCodePresenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  classSection: ClassSection;
}

export function ClassCodePresenterModal({
  isOpen,
  onClose,
  classSection,
}: ClassCodePresenterModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDataShowMode, setIsDataShowMode] = useState(false);

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/student/assignments?joinCode=${classSection.joinCode}`
      : `https://seftlab.com/student/assignments?joinCode=${classSection.joinCode}`;

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(joinUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#0A1630',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR Code:', err));
  }, [isOpen, joinUrl]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classSection.joinCode);
    setCopiedCode(true);
    toast.success(`تم نسخ كود الشعبة (${classSection.joinCode})`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    toast.success('تم نسخ رابط الانضمام المباشر للطلاب');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `SEFTLab-QRCode-${classSection.joinCode}.png`;
    a.click();
    toast.success('تم تنزيل صورة QR Code بجودة عالية');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md transition-all duration-200',
        isDataShowMode ? 'bg-[#0A1630]/98' : 'bg-black/60'
      )}
    >
      <div
        className={cn(
          'relative flex flex-col overflow-hidden rounded-[28px] border transition-all duration-300 shadow-2xl',
          isDataShowMode
            ? 'h-full w-full max-w-5xl border-[#1E325C] bg-[#070D1F] text-[#FAFBFC]'
            : 'w-full max-w-2xl border-[#E3E8F0] bg-white text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]'
        )}
      >
        {/* Top Header Bar */}
        <div
          className={cn(
            'flex items-center justify-between border-b px-6 py-4',
            isDataShowMode
              ? 'border-white/10 bg-white/[0.02]'
              : 'border-[#E3E8F0] bg-[#F8FAFC] dark:border-[#1E325C] dark:bg-[#070D1F]'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#2F6BFF]/15 text-[#2F6BFF]">
              <Presentation className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#2F6BFF]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#2F6BFF] dark:text-[#8BB2FF]">
                  شاشة عرض القاعة (Data Show)
                </span>
                <span className="text-xs text-[#526077] dark:text-[#94A3B8]">
                  {classSection.semester}
                </span>
              </div>
              <h2 className="mt-0.5 text-base font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                {classSection.courseName} — رمز المساق ({classSection.courseCode})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDataShowMode((prev) => !prev)}
              title={isDataShowMode ? 'الخروج من وضع الشاشة الكاملة' : 'وضع شاشة العرض الكاملة'}
              className="flex h-9 items-center gap-1.5 rounded-[12px] border border-white/15 px-3 text-xs font-semibold text-[#526077] hover:bg-black/5 dark:text-[#94A3B8] dark:hover:bg-white/10"
            >
              {isDataShowMode ? (
                <>
                  <Minimize2 className="h-4 w-4 stroke-[1.5]" />
                  <span className="hidden sm:inline">إنهاء العرض الكامل</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 stroke-[1.5]" />
                  <span className="hidden sm:inline">شاشة عرض Data Show</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#526077] hover:bg-black/5 dark:text-[#94A3B8] dark:hover:bg-white/10"
            >
              <X className="h-5 w-5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 sm:p-8 text-center">
          {/* Instructions banner for students */}
          <div
            className={cn(
              'mb-6 w-full max-w-xl rounded-[18px] border p-3.5 text-center text-xs font-semibold leading-relaxed shadow-xs',
              isDataShowMode
                ? 'border-[#2F6BFF]/30 bg-[#2F6BFF]/15 text-[#D1E0FF]'
                : 'border-[#2F6BFF]/25 bg-[#2F6BFF]/10 text-[#1E40AF] dark:border-[#2F6BFF]/30 dark:bg-[#2F6BFF]/15 dark:text-[#BFDBFE]'
            )}
          >
            امسح الرمز بكاميرا الهاتف الآن للانضمام إلى الشعبة فوراً، أو أدخل الكود في المنصة.
          </div>

          <div
            className={cn(
              'flex flex-col items-center justify-center gap-6 sm:flex-row',
              isDataShowMode ? 'gap-10 sm:gap-14' : ''
            )}
          >
            {/* Big High-Res QR Code */}
            <div className="rounded-[24px] border-4 border-white bg-white p-4 shadow-xl">
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrDataUrl}
                  alt={`كود انضمام شعبة ${classSection.courseName}`}
                  className={cn(
                    'aspect-square object-contain transition-all',
                    isDataShowMode
                      ? 'h-64 w-64 sm:h-80 sm:w-80'
                      : 'h-48 w-48 sm:h-56 sm:w-56'
                  )}
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center text-xs text-gray-400">
                  جاري توليد الرمز...
                </div>
              )}
            </div>

            {/* Class Code Presentation Info */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-[#526077] dark:text-[#94A3B8]">
                كود الانضمام للشعبة (Class Code)
              </span>

              {/* Giant Class Code */}
              <div
                className={cn(
                  'my-2 font-mono font-black tracking-widest text-[#2F6BFF] transition-all',
                  isDataShowMode ? 'text-5xl sm:text-7xl' : 'text-3xl sm:text-4xl'
                )}
              >
                {classSection.joinCode}
              </div>

              <div className="flex items-center gap-2 text-xs text-[#526077] dark:text-[#94A3B8]">
                <Users className="h-4 w-4 stroke-[1.5]" />
                <span>
                  الطلاب المسجلون حالياً:{' '}
                  <strong className="text-[#0A1630] dark:text-[#FAFBFC]">
                    {classSection.studentUsernames.length} طلاب
                  </strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <Button
                  size="sm"
                  onClick={handleCopyCode}
                  className="gap-1.5 rounded-[14px]"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-4 w-4 stroke-[2]" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 stroke-[1.5]" />
                      <span>نسخ كود الشعبة</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyLink}
                  className="gap-1.5 rounded-[14px]"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 stroke-[2]" />
                      <span>تم نسخ الرابط!</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 stroke-[1.5]" />
                      <span>نسخ رابط الانضمام</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQr}
                  className="gap-1.5 rounded-[14px]"
                >
                  <Download className="h-4 w-4 stroke-[1.5]" />
                  <span>تنزيل الـ QR كصورة</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Direct Link Preview at Bottom */}
          <div className="mt-8 w-full max-w-xl truncate rounded-[16px] border border-black/10 bg-black/5 px-4 py-2 font-mono text-[11px] text-[#526077] dark:border-white/10 dark:bg-white/5 dark:text-[#94A3B8]">
            رابط الانضمام المباشر: {joinUrl}
          </div>
        </div>
      </div>
    </div>
  );
}
