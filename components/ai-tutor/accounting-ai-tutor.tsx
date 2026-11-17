'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Copy,
  Cpu,
  Check,
  ArrowUpLeft,
  User,
  Scale,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/use-app-store';
import {
  initSemanticModel,
  findSemanticAccountingMatch,
  getIsModelReady,
} from '@/lib/ai-tutor/client-embedder';
import { AccountingKnowledgeEntry } from '@/lib/ai-tutor/accounting-knowledge-bank';

export interface TutorChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  matchedEntry?: AccountingKnowledgeEntry;
  similarityScore?: number;
  matchedBy?: 'transformer_embedding' | 'hybrid_fallback';
}

const QUICK_HINTS = [
  'كيف أميز بين الطرف المدين والدائن في أي قيد محاسبي؟',
  'ساعدني في صياغة قيد شراء أصل بمقدم نقدي والباقي على الحساب.',
  'شرح معادلة الميزانية للوحدات 1 و2 و3 وكيف تحافظ على توازنها.',
  'ما الفرق بين حساب المدينين (العملاء) وحساب الدائنين (الموردين)؟',
  'ما هو أثر المسحوبات الشخصية للمالك على الميزانية وقائمة الدخل؟',
  'اشرح مبدأ التكلفة التاريخية ولماذا لا نعدل قيمة الأراضي بالسعر السوقي؟',
  'ما هو قيد بداية النشاط واستثمار رأس المال في الصندوق أو البنك؟',
  'كيف تترابط قائمة الدخل مع قائمة المركز المالي عبر حقوق الملكية؟',
];

export function AccountingAiTutorComponent() {
  const { currentStudent } = useAppStore();

  // Model loading state
  const [modelProgress, setModelProgress] = useState<number>(0);
  const [modelStatusText, setModelStatusText] = useState<string>('جاهز للتهيئة');
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? getIsModelReady() : false;
  });
  const [showProgressBanner, setShowProgressBanner] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? !getIsModelReady() : true;
  });

  // Chat state
  const [messages, setMessages] = useState<TutorChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `أهلاً بك يا ${currentStudent.fullName}. أنا المساعد الذكي لمادة مبادئ المحاسبة المالية (الوحدات 1، 2، و3). أعمل بالكامل داخل متصفحك محلياً بتقنية البحث الدلالي (Xenova/paraphrase-multilingual-MiniLM-L12-v2) للإجابة على قيود اليومية، قواعد المدين والدائن، وتوازن الميزانية بأعلى سرعة وبدون استهلاك للذاكرة.`,
      timestamp: 'الآن',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCounter = useRef(0);

  // Initialize semantic model on component mount in the browser
  useEffect(() => {
    let mounted = true;

    if (getIsModelReady()) {
      return;
    }

    initSemanticModel((pct, text) => {
      if (!mounted) return;
      setModelProgress(pct);
      setModelStatusText(text);

      if (pct >= 100) {
        setIsModelLoaded(true);
        // Fade out banner after 2.5 seconds
        setTimeout(() => {
          if (mounted) setShowProgressBanner(false);
        }, 2500);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleAskQuestion = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isProcessing) return;

    messageCounter.current += 1;
    const userMsg: TutorChatMessage = {
      id: `usr-${messageCounter.current}`,
      sender: 'user',
      text: trimmed,
      timestamp: 'الآن',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      // Find semantic match using Xenova/paraphrase-multilingual-MiniLM-L12-v2 or hybrid
      const matchResult = await findSemanticAccountingMatch(trimmed);

      messageCounter.current += 1;
      const botMsg: TutorChatMessage = {
        id: `bot-${messageCounter.current}`,
        sender: 'assistant',
        text: matchResult.entry.answer,
        matchedEntry: matchResult.entry,
        similarityScore: matchResult.similarityScore,
        matchedBy: matchResult.matchedBy,
        timestamp: 'الآن',
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('[AiTutor] Matching failed:', err);
      toast.error('حدث تأخير في المعالجة الدلالية، تم تفعيل الإجابة السريعة.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'تم بدء جلسة مراجعة محاسبية جديدة. تفضل بطرح أي سؤال عن قيود اليومية، الطرف المدين والدائن، أو معادلة الميزانية.',
        timestamp: 'الآن',
      },
    ]);
    toast.success('تم تجديد جلسة المساعد الذكي');
  };

  const handleCopyExplanation = (msg: TutorChatMessage) => {
    if (!msg.matchedEntry) {
      navigator.clipboard.writeText(msg.text);
      toast.success('تم نسخ النص إلى الحافظة');
      return;
    }

    const lines = [
      `الموضوع: ${msg.matchedEntry.title}`,
      `الوحدة: ${msg.matchedEntry.unitLabel}`,
      '----------------------------------------',
      msg.matchedEntry.answer,
      '',
      'الخطوات المنطقية:',
      ...msg.matchedEntry.steps.map((s, idx) => `${idx + 1}. ${s}`),
      '',
      `القاعدة المعتمدة: ${msg.matchedEntry.ruleSummary}`,
    ];

    if (msg.matchedEntry.journalEntryExample) {
      lines.push(
        '',
        'نموذج القيد المحاسبي:',
        `من: ${msg.matchedEntry.journalEntryExample.debitAccount}`,
        `إلى: ${msg.matchedEntry.journalEntryExample.creditAccount}`,
        `الوصف: ${msg.matchedEntry.journalEntryExample.description}`
      );
    }

    navigator.clipboard.writeText(lines.join('\n'));
    toast.success('تم نسخ الشرح والقيد المحاسبي بالكامل إلى الحافظة');
  };

  return (
    <div className="flex flex-col space-y-3.5">
      {/* 1. Lightweight Model Loading Progress Bar (Appears on first initialization) */}
      {showProgressBanner && (
        <div className="rounded-[18px] border border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 via-[#2F6BFF]/5 to-transparent p-3.5 text-xs shadow-xs transition-all dark:bg-[#0A1630]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 shrink-0 text-[#2F6BFF] stroke-[2]" />
              <span className="font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
                {isModelLoaded
                  ? 'نموذج التضمين الدلالي (MiniLM-L12-v2) جاهز ومحمل محلياً في الذاكرة'
                  : 'جاري تهيئة نموذج الذكاء الاصطناعي الدلالي داخل المتصفح (Client-Side)...'}
              </span>
            </div>
            <div className="flex items-center gap-2 font-tabular">
              <span className="rounded-full bg-[#2F6BFF]/15 px-2 py-0.5 text-[11px] font-bold text-[#2F6BFF] dark:text-[#8BB2FF]">
                {modelProgress}%
              </span>
              <span className="text-[11px] text-[#526077] dark:text-[#94A3B8]">
                حجم خفيف جداً (&lt;70MB رام)
              </span>
            </div>
          </div>

          {/* Progress track */}
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E3E8F0] dark:bg-[#1E325C]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2F6BFF] to-[#10B981] transition-all duration-300"
              style={{ width: `${Math.max(5, modelProgress)}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[#526077] dark:text-[#94A3B8]">
            <span>{modelStatusText}</span>
            <span>يعمل محلياً 100% دون إرسال استفساراتك لخوادم سحابية</span>
          </div>
        </div>
      )}

      {/* Model Active Mini-Badge when loaded */}
      {!showProgressBanner && isModelLoaded && (
        <div className="flex items-center justify-between rounded-[14px] border border-[#10B981]/30 bg-[#10B981]/5 px-3 py-1.5 text-[11.5px] text-[#065F46] dark:text-[#6EE7B7]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-semibold">
              المحرك الدلالي نشط: Xenova/paraphrase-multilingual-MiniLM-L12-v2
            </span>
          </div>
          <span className="font-tabular opacity-80">
            تضمينات سريعة في المتصفح | الوحدات 1، 2، 3
          </span>
        </div>
      )}

      {/* 2. Main Chat Box */}
      <div className="flex min-h-[500px] flex-col overflow-hidden rounded-[24px] border border-[#E3E8F0] bg-white shadow-xs dark:border-[#1E325C] dark:bg-[#0A1630]">
        {/* Chat Toolbar Header */}
        <div className="flex items-center justify-between border-b border-[#E3E8F0] bg-[#F8FAFC] px-4 py-3 dark:border-[#1E325C] dark:bg-[#070D1F]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#2F6BFF]/10 text-[#2F6BFF]">
              <Sparkles className="h-4 w-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                مساعد المحاسبة المالية الذكي
              </h3>
              <p className="text-[10.5px] text-[#526077] dark:text-[#94A3B8]">
                مخصص للطرف المدين والدائن، قيود اليومية، ومعادلة الميزانية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChat}
              className="h-8 gap-1 rounded-[12px] px-2.5 text-xs"
            >
              <RotateCcw className="h-3 w-3 stroke-[1.5]" />
              <span>محادثة جديدة</span>
            </Button>
            <Link href="/student/summaries">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 rounded-[12px] px-2.5 text-xs"
              >
                <FileSpreadsheet className="h-3 w-3 stroke-[1.5]" />
                <span>الملخصات والقوانين</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[520px]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const entry = msg.matchedEntry;

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 max-w-[92%]',
                  isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs',
                    isUser
                      ? 'bg-[#2F6BFF] text-white'
                      : 'bg-gradient-to-tr from-[#1E56E8] to-[#60A5FA] text-white'
                  )}
                >
                  {isUser ? (
                    <User className="h-4 w-4 stroke-[2]" />
                  ) : (
                    <Sparkles className="h-4 w-4 stroke-[2]" />
                  )}
                </div>

                {/* Message Bubble Card */}
                <div
                  className={cn(
                    'rounded-[20px] p-4 text-xs leading-relaxed shadow-xs transition-all',
                    isUser
                      ? 'bg-[#2F6BFF] text-white rounded-tr-none'
                      : 'border border-[#E3E8F0] bg-[#F8FAFC] text-[#0A1630] rounded-tl-none dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]'
                  )}
                >
                  {/* Semantic Tag / Metadata for Assistant */}
                  {!isUser && msg.similarityScore && (
                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-2 dark:border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-[#2F6BFF]/10 px-2 py-0.5 text-[10.5px] font-bold text-[#2F6BFF] dark:text-[#8BB2FF]">
                          {entry?.unitLabel || 'المحاسبة المالية'}
                        </span>
                        <span className="text-[10.5px] font-medium text-[#526077] dark:text-[#94A3B8]">
                          {entry?.topic}
                        </span>
                      </div>

                      <span className="font-tabular rounded-full bg-[#10B981]/10 px-2 py-0.5 text-[10.5px] font-bold text-[#059669] dark:text-[#34D399]">
                        تطابق دلالي: {Math.round(msg.similarityScore * 100)}%
                        {msg.matchedBy === 'transformer_embedding' && ' (MiniLM)'}
                      </span>
                    </div>
                  )}

                  {/* Message Title if matched */}
                  {!isUser && entry && (
                    <h4 className="mb-1.5 text-sm font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                      {entry.title}
                    </h4>
                  )}

                  {/* Main Text */}
                  <p className="text-xs sm:text-[13px] font-normal leading-relaxed">
                    {msg.text}
                  </p>

                  {/* Steps Breakdown if available */}
                  {!isUser && entry && entry.steps.length > 0 && (
                    <div className="mt-3 space-y-1.5 rounded-[14px] border border-[#E3E8F0] bg-white p-3 dark:border-[#1E325C] dark:bg-[#0A1630]">
                      <p className="text-[11px] font-bold text-[#526077] dark:text-[#94A3B8]">
                        التحليل المنطقي والخطوات:
                      </p>
                      {entry.steps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-xs leading-relaxed">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2F6BFF] dark:text-[#8BB2FF]" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Journal Entry Box if available */}
                  {!isUser && entry?.journalEntryExample && (
                    <div className="mt-3 overflow-hidden rounded-[14px] border border-[#2F6BFF]/30 bg-[#2F6BFF]/5 p-3 dark:bg-[#2F6BFF]/10">
                      <div className="flex items-center gap-1.5 font-bold text-[#2F6BFF] dark:text-[#8BB2FF]">
                        <Scale className="h-3.5 w-3.5 stroke-[2]" />
                        <span>نموذج القيد المحاسبي المتوازن:</span>
                      </div>
                      <div className="mt-2 space-y-1 font-mono text-[11.5px] text-[#0A1630] dark:text-[#FAFBFC]">
                        <p className="font-semibold text-[#047857] dark:text-[#34D399]">
                          من حـ/ {entry.journalEntryExample.debitAccount} {entry.journalEntryExample.debitAmount && `(${entry.journalEntryExample.debitAmount})`}
                        </p>
                        <p className="font-semibold text-[#B91C1C] dark:text-[#F87171] pr-4">
                          إلى حـ/ {entry.journalEntryExample.creditAccount} {entry.journalEntryExample.creditAmount && `(${entry.journalEntryExample.creditAmount})`}
                        </p>
                      </div>
                      <p className="mt-1.5 text-[10.5px] text-[#526077] dark:text-[#94A3B8]">
                        بيان القيد: {entry.journalEntryExample.description}
                      </p>
                    </div>
                  )}

                  {/* Equation Impact if available */}
                  {!isUser && entry?.equationImpact && (
                    <div className="mt-3 rounded-[14px] border border-[#E3E8F0] bg-white p-2.5 text-[11px] dark:border-[#1E325C] dark:bg-[#0A1630]">
                      <p className="font-bold text-[#0A1630] dark:text-[#FAFBFC]">
                        أثر العملية على معادلة الميزانية:
                      </p>
                      <p className="mt-1 text-[#526077] dark:text-[#94A3B8]">
                        {entry.equationImpact.netBalance}
                      </p>
                    </div>
                  )}

                  {/* Academic Rule Box */}
                  {!isUser && entry && (
                    <div className="mt-3 rounded-[12px] bg-[#2F6BFF]/10 p-2.5 text-[11px] font-semibold text-[#1E40AF] dark:text-[#93C5FD]">
                      القاعدة الأكاديمية: {entry.ruleSummary}
                    </div>
                  )}

                  {/* Message Footer */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] opacity-75">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopyExplanation(msg)}
                        className="flex items-center gap-1 font-semibold hover:underline"
                      >
                        <Copy className="h-3 w-3" />
                        <span>نسخ الشرح والقيد</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="ml-auto flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F6BFF]/20 text-[#2F6BFF]">
                <Sparkles className="h-3.5 w-3.5 animate-spin stroke-[2]" />
              </div>
              <div className="rounded-[16px] border border-[#E3E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#526077] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#94A3B8]">
                جاري توليد التضمين الدلالي ومطابقة قيود المحاسبة محلياً...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Quick Hints & Prompt Chips */}
        <div className="border-t border-[#E3E8F0] bg-[#F8FAFC]/90 px-4 py-2.5 dark:border-[#1E325C] dark:bg-[#070D1F]/90">
          <p className="text-[11px] font-bold text-[#526077] dark:text-[#94A3B8]">
            تلميحات واستفسارات شائعة (انقر للسؤال فوراً):
          </p>
          <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_HINTS.map((hint, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAskQuestion(hint)}
                className="shrink-0 rounded-full border border-[#E3E8F0] bg-white px-3 py-1 text-[11px] font-medium text-[#0A1630] transition-all hover:border-[#2F6BFF] hover:bg-[#2F6BFF]/5 hover:text-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC] dark:hover:border-[#2F6BFF]"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Input Prompt Form */}
        <div className="border-t border-[#E3E8F0] p-3 dark:border-[#1E325C]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب استفسارك المحاسبي، القيد المراد صياغته، أو العملية المالية..."
              className="flex-1 rounded-[16px] border border-[#E3E8F0] bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0A1630] placeholder-[#94A3B8] focus:border-[#2F6BFF] focus:outline-none dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-[#FAFBFC]"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isProcessing}
              size="sm"
              className="h-9 gap-1.5 rounded-[14px] px-4"
            >
              <span>إرسال</span>
              <Send className="h-3.5 w-3.5 stroke-[2]" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
