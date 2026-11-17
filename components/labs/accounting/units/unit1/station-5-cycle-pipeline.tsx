'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Workflow,
  XCircle,
} from 'lucide-react';
import {
  DOCUMENT_CLASS_ITEMS,
  LEDGER_BOOKS_ITEMS,
  OTHER_SYSTEM_PILLARS,
} from '@/lib/labs/accounting/unit1-data';
import type { StationExerciseCompletionPayload } from './station-1-flowchart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Station5CyclePipelineProps {
  completedExerciseIds: string[];
  onCompleteExercise: (payload: StationExerciseCompletionPayload) => void;
}

export function Station5CyclePipeline({
  completedExerciseIds,
  onCompleteExercise,
}: Station5CyclePipelineProps) {
  const [docChoices, setDocChoices] = useState<
    Record<string, 'internal' | 'external'>
  >({});
  const [bookChoices, setBookChoices] = useState<
    Record<string, 'mandatory' | 'optional'>
  >({});
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [checkFeedback, setCheckFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const ex9Done = completedExerciseIds.includes('u1-ex-9');

  const allDocsAnswered = DOCUMENT_CLASS_ITEMS.every((d) => docChoices[d.id]);
  const allBooksAnswered = LEDGER_BOOKS_ITEMS.every((b) => bookChoices[b.id]);

  const handleAssignDoc = (
    docId: string,
    target: 'internal' | 'external'
  ) => {
    setDocChoices((prev) => ({ ...prev, [docId]: target }));
    setSelectedDocId(null);
    setCheckFeedback(null);
  };

  const handleAssignBook = (
    bookId: string,
    target: 'mandatory' | 'optional'
  ) => {
    setBookChoices((prev) => ({ ...prev, [bookId]: target }));
    setSelectedBookId(null);
    setCheckFeedback(null);
  };

  const handleCheckPipeline = () => {
    const docScore = DOCUMENT_CLASS_ITEMS.filter(
      (d) => docChoices[d.id] === d.category
    ).length;
    const bookScore = LEDGER_BOOKS_ITEMS.filter(
      (b) => bookChoices[b.id] === b.requirement
    ).length;
    const total = DOCUMENT_CLASS_ITEMS.length + LEDGER_BOOKS_ITEMS.length;
    const correct = docScore + bookScore;
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 80;

    setCheckFeedback({
      ok: passed,
      text: passed
        ? `ممتاز! صنّفت ${correct} من ${total} بشكل دقيق في خط الدورة المستندية والدفترية.`
        : `أصبت في ${correct} من ${total} (${pct}%). انتبه أن كشف البنك وفاتورة المشتريات مستندات خارجية، بينما الإلزامية في القانون الأردني هي اليومية العامة والجرد والميزانية والصور والرسائل.`,
    });

    onCompleteExercise({
      exerciseId: 'u1-ex-9',
      topicId: 'u1-cycle-documents',
      title: 'تصنيف المستندات والدفاتر الإلزامية وفق القانون التجاري الأردني',
      xpReward: 55,
      scorePct: pct,
      passed,
      wrongSummary: passed ? undefined : `تصنيف ${correct} من ${total}`,
      whyExplanation:
        'المستندات الخارجية (كفاتورة المشتريات وكشف البنك) أقوى حجية لأنها صادرة من أطراف خارجية، أما الدفاتر الإلزامية في القانون الأردني فهي: دفتر اليومية العامة، دفتر الجرد والميزانية، ودفتر الصور والرسائل.',
    });
  };

  return (
    <div className="space-y-6">
      {/* خط الأنابيب البصري للدورة ومقومات النظام */}
      <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A1630] sm:text-base dark:text-[#FAFBFC]">
              <Workflow className="h-4 w-4 text-[#2563EB]" />
              <span>خط أنابيب مقومات النظام المحاسبي (الصفحات 33 - 36)</span>
            </h3>
            <p className="text-xs text-[#526077] dark:text-[#94A3B8]">
              تبدأ الدورة من المجموعة المستندية ⬅ وتُعالج في المجموعة الدفترية ⬅ وتكتمل ببقية المقومات
            </p>
          </div>
          <Badge
            variant={ex9Done ? 'default' : 'secondary'}
            className={cn('font-tabular', ex9Done && 'bg-[#22C55E] text-white')}
          >
            تمرين 9: {ex9Done ? 'مكتمل (+55 XP)' : '12 بنداً للتصنيف'}
          </Badge>
        </div>

        {/* المراحل الثلاث المترابطة */}
        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-11">
          <div className="rounded-[12px] border border-blue-300 bg-blue-50/70 p-3 md:col-span-3 dark:border-blue-900/60 dark:bg-blue-950/20">
            <span className="text-[10px] font-bold text-[#2563EB]">
              1. نقطة البداية
            </span>
            <p className="mt-0.5 text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              المجموعة المستندية
            </p>
            <p className="mt-1 text-[11px] text-[#526077] dark:text-[#94A3B8]">
              المصدر الأول للبيانات: داخلية (تنشأ داخل المشروع) وخارجية (حجيتها أقوى في الإثبات).
            </p>
          </div>
          <div className="flex justify-center md:col-span-1">
            <ArrowLeft className="h-5 w-5 rotate-90 text-[#2563EB] md:rotate-0" />
          </div>
          <div className="rounded-[12px] border border-emerald-300 bg-emerald-50/60 p-3 md:col-span-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <span className="text-[10px] font-bold text-[#16A34A]">
              2. مرحلة التسجيل
            </span>
            <p className="mt-0.5 text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              المجموعة الدفترية
            </p>
            <p className="mt-1 text-[11px] text-[#526077] dark:text-[#94A3B8]">
              دفاتر إجبارية بنص القانون التجاري الأردني، ودفاتر اختيارية للتبويب والتحليل.
            </p>
          </div>
          <div className="flex justify-center md:col-span-1">
            <ArrowLeft className="h-5 w-5 rotate-90 text-[#2563EB] md:rotate-0" />
          </div>
          <div className="rounded-[12px] border border-[#E3E8F0] bg-[#F8FAFC] p-3 md:col-span-3 dark:border-[#1E325C] dark:bg-[#070D1F]">
            <span className="text-[10px] font-bold text-[#526077]">
              3. أدوات التشغيل والمخرجات
            </span>
            <p className="mt-0.5 text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              دليل الحسابات والقيد المزدوج والتقارير
            </p>
            <p className="mt-1 text-[11px] text-[#526077] dark:text-[#94A3B8]">
              مع الكوادر المؤهلة والأجهزة والبرمجيات لإنتاج القوائم المالية الأربع بدقة.
            </p>
          </div>
        </div>
      </div>

      {/* تطبيق 1: تصنيف المستندات (سحب وإفلات أو نقر) */}
      <div className="space-y-4 rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-6 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#2563EB]" />
          <h4 className="text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
            أولاً: صنّف المستندات الستة بالسحب أو النقر (داخلية vs خارجية)
          </h4>
        </div>

        <div className="flex flex-wrap gap-2">
          {DOCUMENT_CLASS_ITEMS.filter((d) => !docChoices[d.id]).map((doc) => (
            <button
              key={doc.id}
              type="button"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/doc', doc.id)}
              onClick={() =>
                setSelectedDocId((prev) => (prev === doc.id ? null : doc.id))
              }
              className={cn(
                'rounded-[10px] border px-3 py-2 text-right text-xs font-semibold transition-all',
                selectedDocId === doc.id
                  ? 'border-[#2563EB] bg-[#2563EB] text-white'
                  : 'border-[#E3E8F0] bg-[#F8FAFC] hover:border-[#2563EB]/60 dark:border-[#1E325C] dark:bg-[#070D1F]'
              )}
            >
              {doc.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(
            [
              {
                key: 'internal',
                title: 'مستندات داخلية (تنشأ داخل المشروع)',
                sub: 'مثل فواتير المبيعات ومستندات القبض والصرف والقيد',
              },
              {
                key: 'external',
                title: 'مستندات خارجية (حجية أقوى في الإثبات)',
                sub: 'تصدر من الموردين أو البنوك أو العملاء من خارج المشروع',
              },
            ] as const
          ).map((bucket) => {
            const items = DOCUMENT_CLASS_ITEMS.filter(
              (d) => docChoices[d.id] === bucket.key
            );
            return (
              <div
                key={bucket.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/doc');
                  if (id) handleAssignDoc(id, bucket.key);
                }}
                onClick={() => {
                  if (selectedDocId) handleAssignDoc(selectedDocId, bucket.key);
                }}
                className={cn(
                  'min-h-[120px] rounded-[12px] border-2 border-dashed p-3.5 transition-colors',
                  selectedDocId
                    ? 'cursor-pointer border-[#2563EB] bg-[#2563EB]/[0.04]'
                    : 'border-[#E3E8F0] bg-[#F8FAFC] dark:border-[#1E325C] dark:bg-[#070D1F]'
                )}
              >
                <p className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                  {bucket.title}
                </p>
                <p className="text-[11px] text-[#526077] dark:text-[#94A3B8]">
                  {bucket.sub}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {items.map((it) => {
                    const right =
                      checkFeedback && it.category === bucket.key;
                    const wrong =
                      checkFeedback && it.category !== bucket.key;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocChoices((prev) => {
                            const copy = { ...prev };
                            delete copy[it.id];
                            return copy;
                          });
                        }}
                        className={cn(
                          'rounded-[8px] border px-2.5 py-1 text-[11px] font-medium',
                          right
                            ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#16A34A]'
                            : wrong
                            ? 'border-red-500 bg-red-500/15 text-red-600'
                            : 'border-[#E3E8F0] bg-white dark:border-[#1E325C] dark:bg-[#0A1630]'
                        )}
                      >
                        {it.title} ×
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ثانياً: تصنيف الدفاتر الإجبارية والاختيارية */}
        <div className="border-t border-[#E3E8F0] pt-4 dark:border-[#1E325C]">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#2563EB]" />
            <h4 className="text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
              ثانياً: صنّف الدفاتر الستة وفق القانون التجاري الأردني (إجبارية vs اختيارية)
            </h4>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {LEDGER_BOOKS_ITEMS.filter((b) => !bookChoices[b.id]).map((bk) => (
              <button
                key={bk.id}
                type="button"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/book', bk.id)}
                onClick={() =>
                  setSelectedBookId((prev) => (prev === bk.id ? null : bk.id))
                }
                className={cn(
                  'rounded-[10px] border px-3 py-2 text-right text-xs font-semibold transition-all',
                  selectedBookId === bk.id
                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                    : 'border-[#E3E8F0] bg-[#F8FAFC] hover:border-[#2563EB]/60 dark:border-[#1E325C] dark:bg-[#070D1F]'
                )}
              >
                {bk.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(
              [
                {
                  key: 'mandatory',
                  title: 'الدفاتر الإجبارية (إلزامية بقانون التجارة الأردني)',
                  sub: 'ثلاثة دفاتر ألزم القانون إمساكها لضبط التسجيل والجرد والمراسلات',
                },
                {
                  key: 'optional',
                  title: 'الدفاتر الاختيارية (حسب طبيعة النشاط)',
                  sub: 'تعتمد على حجم المشروع وتبسط التبويب التفصيلي والمخزون',
                },
              ] as const
            ).map((bucket) => {
              const items = LEDGER_BOOKS_ITEMS.filter(
                (b) => bookChoices[b.id] === bucket.key
              );
              return (
                <div
                  key={bucket.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData('text/book');
                    if (id) handleAssignBook(id, bucket.key);
                  }}
                  onClick={() => {
                    if (selectedBookId)
                      handleAssignBook(selectedBookId, bucket.key);
                  }}
                  className={cn(
                    'min-h-[120px] rounded-[12px] border-2 border-dashed p-3.5 transition-colors',
                    selectedBookId
                      ? 'cursor-pointer border-[#2563EB] bg-[#2563EB]/[0.04]'
                      : 'border-[#E3E8F0] bg-[#F8FAFC] dark:border-[#1E325C] dark:bg-[#070D1F]'
                  )}
                >
                  <p className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                    {bucket.title}
                  </p>
                  <p className="text-[11px] text-[#526077] dark:text-[#94A3B8]">
                    {bucket.sub}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {items.map((it) => {
                      const right =
                        checkFeedback && it.requirement === bucket.key;
                      const wrong =
                        checkFeedback && it.requirement !== bucket.key;
                      return (
                        <button
                          key={it.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookChoices((prev) => {
                              const copy = { ...prev };
                              delete copy[it.id];
                              return copy;
                            });
                          }}
                          className={cn(
                            'rounded-[8px] border px-2.5 py-1 text-[11px] font-medium',
                            right
                              ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#16A34A]'
                              : wrong
                              ? 'border-red-500 bg-red-500/15 text-red-600'
                              : 'border-[#E3E8F0] bg-white dark:border-[#1E325C] dark:bg-[#0A1630]'
                          )}
                        >
                          {it.title} ×
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {checkFeedback && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-[12px] border p-3 text-xs font-medium',
              checkFeedback.ok
                ? 'border-[#22C55E]/40 bg-[#22C55E]/10'
                : 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
            )}
          >
            {checkFeedback.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-red-500" />
            )}
            <span>{checkFeedback.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            disabled={!allDocsAnswered || !allBooksAnswered}
            onClick={handleCheckPipeline}
            className="min-h-[44px] sm:px-6"
          >
            اعتماد تصنيف المستندات والدفاتر
          </Button>
        </div>
      </div>

      {/* بقية مقومات النظام المحاسبي الستة (صفحة 36) */}
      <div className="rounded-[16px] border border-[#E3E8F0] bg-white p-4 sm:p-5 dark:border-[#1E325C] dark:bg-[#0A1630]">
        <h4 className="mb-3 text-xs font-bold text-[#2563EB]">
          بقية مقومات النظام المحاسبي (المرتبطة بالصفحة 36):
        </h4>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {OTHER_SYSTEM_PILLARS.map((pill) => (
            <div
              key={pill.id}
              className="rounded-[12px] border border-[#E3E8F0] bg-[#F8FAFC] p-3 dark:border-[#1E325C] dark:bg-[#070D1F]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                  {pill.title}
                </span>
                <span className="text-[10px] text-[#64748B]">{pill.enTitle}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[#526077] dark:text-[#94A3B8]">
                {pill.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
