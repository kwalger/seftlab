'use client';

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Monitor,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const STUDENT_MENU_TOUR_STORAGE_KEY = 'seftlab_student_menu_tour_v1';
export const START_TOUR_EVENT = 'seftlab:start-tour';

interface MenuTourStep {
  id: string;
  selector: string;
  badge: string;
  title: string;
  description: string;
  hint?: string;
  requiresMobileDrawer?: boolean;
  isMobileTrigger?: boolean;
}

const DESKTOP_MENU_STEPS: MenuTourStep[] = [
  {
    id: 'desktop-home',
    selector: '[data-tour-menu="desktop"] [data-tour-item="/student"]',
    badge: 'لوحة الطالب',
    title: 'الرئيسية (المنهاج)',
    description:
      'يا هلا بك في لوحتك! من هون بتشوف ملخص كل شغلك بنظرة وحدة: نقاط الخبرة (XP) اللي جمعتها، الواجبات المطلوبة منك، ومخطط توازن مهاراتك.',
    hint: 'تقدر تتخطى الشرح بعد الخطوة الجاية إذا حاب، بس خطوتين بتفهم كل القوائم!',
  },
  {
    id: 'desktop-classrooms',
    selector: '[data-tour-menu="desktop"] [data-tour-group="القاعات"]',
    badge: 'الجامعة والشُعب',
    title: 'القاعات والدكاترة',
    description:
      'من قسم القاعات بتدخل كود الشعبة اللي بعطيك إياه دكتور المادة في الجامعة، وبتتابع كل القاعات والدكاترة المسجل معهم أول بأول.',
    hint: 'هاي الخطوة الثانية — من الخطوة الجاية بفتحلك زر "تخطي الشرح" بأي وقت.',
  },
  {
    id: 'desktop-lab-accounting',
    selector:
      '[data-tour-menu="desktop"] [data-tour-item="/student/labs/accounting"]',
    badge: 'التطبيق العملي والمختبر',
    title: 'المختبر ← مختبر المحاسبة المالية',
    description:
      'هذا قلب المنصة! جوا مختبر المحاسبة المالية بتلاقي 12 درس فيديو مشروح، ميزان معادلة الميزانية التفاعلي، قيود اليومية، دفتر الأستاذ، ومعهم مساعد ذكي بيجاوبك ع أي سؤال.',
  },
  {
    id: 'desktop-assignments',
    selector:
      '[data-tour-menu="desktop"] [data-tour-item="/student/assignments"]',
    badge: 'الواجبات التطبيقية',
    title: 'التدريب العملي ← تدرب على المحاسبة',
    description:
      'من هون بتحل الواجبات والمشاريع العملية على 3 مراحل سواء من دكتورك أو تدريبات المنصة، والمحرك بصحّحلك فوراً وبعطيك علامتك ونقاط XP.',
  },
  {
    id: 'desktop-exam-bank',
    selector:
      '[data-tour-menu="desktop"] [data-tour-item="/student/exam-bank"]',
    badge: 'المراجعة والاختبارات',
    title: 'بنك الامتحانات والمراجعة',
    description:
      'قبل أي امتحان جامعي فوت هون: بتلاقي بنك أسئلة شامل بتصحيح فوري مع شرح واضح لسبب كل إجابة صح أو غلط.',
  },
  {
    id: 'desktop-summaries',
    selector:
      '[data-tour-menu="desktop"] [data-tour-item="/student/summaries"]',
    badge: 'مرجع المذاكرة',
    title: 'الملخصات والقوانين',
    description:
      'كل القوانين المحاسبية والمعادلات وملخصات الوحدات مرتبة قدامك في مكان واحد عشان ترجعلها بسرعة وقت الدراسة والحل.',
  },
  {
    id: 'desktop-progress',
    selector: '[data-tour-menu="desktop"] [data-tour-item="/student/progress"]',
    badge: 'التفاعل والمتابعة',
    title: 'تقدمي والإنجازات، المتصدرون، والإعدادات',
    description:
      'من آخر القسم تحت بتتابع أوسمتك ومخطط تقدمك، بتنافس زملاءك في جدول المتصدرين، ومن الإعدادات بتضبط ملفك المهني عشان الشركات تشوف نتائجك وتبعتلك دعوات مقابلة!',
  },
];

const MOBILE_MENU_STEPS: MenuTourStep[] = [
  {
    id: 'mobile-trigger',
    selector: '[data-tour-menu="mobile-trigger"]',
    badge: 'قائمة الجوال',
    title: 'افتح القائمة الكاملة من هون (☰)',
    description:
      'يا هلا بك في لوحتك ع الجوال! من هاي الكبسة فوق ع اليمين بتفتح كل قوائم المنصة والمختبرات. اضغط "التالي" هسا ورح أفتحلك القائمة وأشرحلك كل زر جواها!',
    hint: 'تقدر تتخطى الشرح بعد الخطوة الجاية إذا حاب، بس خطوتين بتفهم كل القوائم!',
    isMobileTrigger: true,
    requiresMobileDrawer: false,
  },
  {
    id: 'mobile-home',
    selector: '[data-tour-menu="mobile"] [data-tour-item="/student"]',
    badge: 'لوحة الطالب',
    title: 'الرئيسية (المنهاج)',
    description:
      'أول خيار بالقائمة هو الرئيسية: برجعك ع ملخص مستواك، نقاط الخبرة (XP)، والواجبات المطلوبة منك بنظرة وحدة.',
    hint: 'هاي الخطوة الثانية — من الخطوة الجاية بفتحلك زر "تخطي الشرح" بأي وقت.',
    requiresMobileDrawer: true,
  },
  {
    id: 'mobile-classrooms',
    selector: '[data-tour-menu="mobile"] [data-tour-group="القاعات"]',
    badge: 'الجامعة والشُعب',
    title: 'القاعات والدكاترة',
    description:
      'من قسم القاعات بتدخل كود الشعبة اللي بعطيك إياه الدكتور في الجامعة، وبتشوف قائمة الدكاترة والمواد المسجل فيها.',
    requiresMobileDrawer: true,
  },
  {
    id: 'mobile-lab-accounting',
    selector:
      '[data-tour-menu="mobile"] [data-tour-item="/student/labs/accounting"]',
    badge: 'التطبيق العملي والمختبر',
    title: 'المختبر ← مختبر المحاسبة المالية',
    description:
      'هذا قلب المنصة العملي! جواه 12 درس فيديو، ميزان معادلة الميزانية، قيود اليومية، دفتر الأستاذ، ومعك مساعد ذكي بيجاوبك ع أي سؤال محاسبي.',
    requiresMobileDrawer: true,
  },
  {
    id: 'mobile-assignments',
    selector:
      '[data-tour-menu="mobile"] [data-tour-item="/student/assignments"]',
    badge: 'الواجبات التطبيقية',
    title: 'التدريب العملي ← تدرب على المحاسبة',
    description:
      'من هون بتحل الواجبات والمشاريع العملية خطوة بخطوة، والنظام بصحّحلك تلقائياً وبضيف نقاط XP لحسابك.',
    requiresMobileDrawer: true,
  },
  {
    id: 'mobile-exam-bank',
    selector:
      '[data-tour-menu="mobile"] [data-tour-item="/student/exam-bank"]',
    badge: 'المراجعة والاختبارات',
    title: 'بنك الامتحانات والمراجعة',
    description:
      'قبل الامتحان فوت هون: أسئلة شاملة بتصحيح فوري وشرح لكل إجابة عشان تثبّت فهمك.',
    requiresMobileDrawer: true,
  },
  {
    id: 'mobile-summaries',
    selector:
      '[data-tour-menu="mobile"] [data-tour-item="/student/summaries"]',
    badge: 'مرجع المذاكرة',
    title: 'الملخصات والقوانين',
    description:
      'مرجعك السريع لكل القوانين المحاسبية والمعادلات وملخصات الوحدات مرتبة وجاهزة.',
    requiresMobileDrawer: true,
  },
  {
    id: 'mobile-progress',
    selector: '[data-tour-menu="mobile"] [data-tour-item="/student/progress"]',
    badge: 'التفاعل والمتابعة',
    title: 'تقدمي والإنجازات، المتصدرون، والإعدادات',
    description:
      'من آخر القائمة بتشوف أوسمتك وتقدمك، ترتيبك في المتصدرين، ومن الإعدادات بتفعّل ملفك المهني للشركات!',
    requiresMobileDrawer: true,
  },
];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface SiteGuidedTourProps {
  onTourOpenChange?: (open: boolean) => void;
  setMobileDrawerOpen?: (open: boolean) => void;
  setSidebarCollapsed?: (collapsed: boolean) => void;
  expandMenuGroups?: () => void;
  mobileDrawerScrollRef?: React.RefObject<HTMLDivElement | null>;
}

export function triggerSiteGuidedTour() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(START_TOUR_EVENT));
}

export function SiteGuidedTour({
  onTourOpenChange,
  setMobileDrawerOpen,
  setSidebarCollapsed,
  expandMenuGroups,
  mobileDrawerScrollRef,
}: SiteGuidedTourProps) {
  const pathname = usePathname();
  const maskId = useId().replace(/:/g, '');

  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [viewport, setViewport] = useState({ width: 1280, height: 800 });
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [bubbleHeight, setBubbleHeight] = useState(235);
  const [hasMounted, setHasMounted] = useState(false);

  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const callbacksRef = useRef({
    onTourOpenChange,
    setMobileDrawerOpen,
    setSidebarCollapsed,
    expandMenuGroups,
  });

  useEffect(() => {
    callbacksRef.current = {
      onTourOpenChange,
      setMobileDrawerOpen,
      setSidebarCollapsed,
      expandMenuGroups,
    };
  });

  const steps = isMobileLayout ? MOBILE_MENU_STEPS : DESKTOP_MENU_STEPS;
  const activeStep = steps[stepIndex] || steps[0];
  const canSkip = stepIndex >= 2;
  const isLastStep = stepIndex === steps.length - 1;

  const setTourState = useCallback((open: boolean) => {
    setIsOpen(open);
    callbacksRef.current.onTourOpenChange?.(open);
  }, []);

  // Hydration-safe initial mount check
  useEffect(() => {
    const t = window.setTimeout(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setHasMounted(true);
      setViewport({ width: vw, height: vh });
      setIsMobileLayout(vw < 1024);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  // Auto-launch once on first entry to /student dashboard
  useEffect(() => {
    if (!hasMounted || pathname !== '/student') return;
    try {
      const seen = window.localStorage.getItem(STUDENT_MENU_TOUR_STORAGE_KEY);
      if (seen === 'done') return;
    } catch {
      return;
    }

    const timer = window.setTimeout(() => {
      const mobile = window.innerWidth < 1024;
      setIsMobileLayout(mobile);
      setStepIndex(0);
      if (!mobile) {
        callbacksRef.current.setSidebarCollapsed?.(false);
      }
      callbacksRef.current.expandMenuGroups?.();
      setTourState(true);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [hasMounted, pathname, setTourState]);

  // Listen for manual replay trigger ("شرح القوائم")
  useEffect(() => {
    const handleStart = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileLayout(mobile);
      setStepIndex(0);
      if (mobile) {
        callbacksRef.current.setMobileDrawerOpen?.(false);
      } else {
        callbacksRef.current.setSidebarCollapsed?.(false);
      }
      callbacksRef.current.expandMenuGroups?.();
      setTourState(true);
    };

    window.addEventListener(START_TOUR_EVENT, handleStart);
    return () => window.removeEventListener(START_TOUR_EVENT, handleStart);
  }, [setTourState]);

  const finishTour = useCallback(() => {
    setTourState(false);
    callbacksRef.current.setMobileDrawerOpen?.(false);
    try {
      window.localStorage.setItem(STUDENT_MENU_TOUR_STORAGE_KEY, 'done');
    } catch {
      // Ignore private mode storage errors
    }
  }, [setTourState]);

  const measureTarget = useCallback(() => {
    if (!isOpen) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw < 1024;
    setViewport({ width: vw, height: vh });
    setIsMobileLayout(mobile);

    const el = document.querySelector(activeStep.selector) as HTMLElement | null;
    if (!el) {
      setSpotlight(null);
      return;
    }

    const raw = el.getBoundingClientRect();
    if (raw.width === 0 && raw.height === 0) {
      setSpotlight(null);
      return;
    }

    const pad = mobile ? 5 : 6;
    const maxSpotHeight = mobile
      ? Math.round(vh * 0.36)
      : Math.round(vh * 0.42);
    const clampedHeight = Math.min(raw.height + pad * 2, maxSpotHeight);
    const left = Math.max(4, raw.left - pad);
    const maxRight = vw - 4;
    const width = Math.min(raw.width + pad * 2, maxRight - left);
    const top = Math.max(4, raw.top - pad);

    setSpotlight({
      top,
      left,
      width: Math.max(36, width),
      height: Math.max(36, clampedHeight),
    });
  }, [activeStep.selector, isOpen]);

  // Synchronize desktop sidebar / mobile drawer state & scroll highlighted item into view
  useEffect(() => {
    if (!isOpen) return;
    const mobile = window.innerWidth < 1024;

    if (!mobile) {
      callbacksRef.current.setSidebarCollapsed?.(false);
      callbacksRef.current.expandMenuGroups?.();
    } else {
      callbacksRef.current.expandMenuGroups?.();
      if (activeStep.requiresMobileDrawer) {
        callbacksRef.current.setMobileDrawerOpen?.(true);
      } else {
        callbacksRef.current.setMobileDrawerOpen?.(false);
      }
    }

    const alignAndMeasure = () => {
      const el = document.querySelector(
        activeStep.selector
      ) as HTMLElement | null;
      if (el) {
        if (mobile && activeStep.requiresMobileDrawer && mobileDrawerScrollRef?.current) {
          const container = mobileDrawerScrollRef.current;
          const cRect = container.getBoundingClientRect();
          const eRect = el.getBoundingClientRect();
          if (eRect.top < cRect.top + 16 || eRect.bottom > cRect.bottom - 16) {
            const delta = eRect.top - (cRect.top + cRect.height * 0.35);
            container.scrollTo({
              top: Math.max(0, container.scrollTop + delta),
              behavior: 'smooth',
            });
          }
        } else if (!mobile) {
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
      measureTarget();
    };

    const t0 = window.setTimeout(alignAndMeasure, 60);
    const t1 = window.setTimeout(alignAndMeasure, 240);
    const t2 = window.setTimeout(measureTarget, 450);
    const t3 = window.setTimeout(measureTarget, 700);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [activeStep, isOpen, measureTarget, mobileDrawerScrollRef]);

  // Recalculate coordinates on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    let frame = 0;
    const onUpdate = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measureTarget);
    };
    window.addEventListener('scroll', onUpdate, { passive: true, capture: true });
    window.addEventListener('resize', onUpdate, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [isOpen, measureTarget]);

  // Measure speech bubble height dynamically
  useLayoutEffect(() => {
    if (!isOpen || !bubbleRef.current) return;
    const h = bubbleRef.current.offsetHeight;
    if (h > 0 && Math.abs(h - bubbleHeight) > 4) {
      setBubbleHeight(h);
    }
  }, [bubbleHeight, isOpen, stepIndex, viewport.width]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canSkip) {
        finishTour();
      } else if (e.key === 'ArrowLeft') {
        if (isLastStep) finishTour();
        else setStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
      } else if (e.key === 'ArrowRight') {
        setStepIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canSkip, finishTour, isLastStep, isOpen, steps.length]);

  // Compute responsive speech bubble placement & directional SVG arrow geometry
  const layoutGeometry = useMemo(() => {
    const vw = viewport.width;
    const vh = viewport.height;
    const bubbleW = isMobileLayout
      ? Math.min(vw - 24, 380)
      : Math.min(410, Math.max(310, vw - 360));

    if (!spotlight) {
      return {
        bubbleTop: Math.max(24, Math.round((vh - bubbleHeight) / 2)),
        bubbleLeft: Math.round((vw - bubbleW) / 2),
        bubbleWidth: bubbleW,
        arrow: null,
      };
    }

    // DESKTOP: Right sidebar highlighted -> Speech bubble sits to the LEFT, arrow points RIGHT
    if (!isMobileLayout) {
      const gap = 54;
      const bubbleLeft = Math.max(16, spotlight.left - bubbleW - gap);
      const spotCenterY = spotlight.top + spotlight.height / 2;
      const bubbleTop = Math.min(
        Math.max(16, Math.round(spotCenterY - bubbleHeight / 2)),
        Math.max(16, vh - bubbleHeight - 16)
      );

      const startX = bubbleLeft + bubbleW + 4;
      const startY = Math.min(
        Math.max(bubbleTop + 28, Math.round(spotCenterY)),
        bubbleTop + bubbleHeight - 28
      );
      const endX = spotlight.left - 7;
      const endY = Math.round(spotCenterY);
      const ctrlX = Math.round((startX + endX) / 2);
      const ctrlY = Math.round((startY + endY) / 2 - 14);

      return {
        bubbleTop,
        bubbleLeft,
        bubbleWidth: bubbleW,
        arrow:
          endX - startX >= 14
            ? {
                path: `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`,
                startX,
                startY,
              }
            : null,
      };
    }

    // ANDROID / MOBILE: Top hamburger button OR open drawer item
    const arrowGap = 32;
    const spotBottom = spotlight.top + spotlight.height;
    const spotCenterX = spotlight.left + spotlight.width / 2;

    const spaceBelow = vh - spotBottom - 12;
    const spaceAbove = spotlight.top - 12;

    let placeBelow =
      activeStep.isMobileTrigger ||
      (spaceBelow >= bubbleHeight + arrowGap && spaceBelow >= spaceAbove) ||
      (spaceBelow >= spaceAbove && spaceAbove < bubbleHeight + arrowGap);

    if (placeBelow && spotBottom + arrowGap + bubbleHeight > vh - 10 && spaceAbove >= bubbleHeight + 16) {
      placeBelow = false;
    }

    let bubbleTop = placeBelow
      ? Math.min(spotBottom + arrowGap, Math.max(10, vh - bubbleHeight - 10))
      : Math.max(10, spotlight.top - arrowGap - bubbleHeight);

    const bubbleLeft = Math.round((vw - bubbleW) / 2);
    const bubbleCenterX = bubbleLeft + bubbleW / 2;

    const startX = Math.round((bubbleCenterX + spotCenterX) / 2);
    const startY = placeBelow ? bubbleTop - 4 : bubbleTop + bubbleHeight + 4;
    const endX = Math.round(
      Math.min(
        Math.max(spotlight.left + 16, spotCenterX),
        spotlight.left + spotlight.width - 16
      )
    );
    const endY = placeBelow ? spotBottom + 6 : spotlight.top - 6;

    const ctrlX = Math.round(
      (startX + endX) / 2 + (Math.abs(startX - endX) < 16 ? 18 : 0)
    );
    const ctrlY = Math.round((startY + endY) / 2);

    const showArrow = placeBelow
      ? endY < startY - 12
      : endY > startY + 12;

    return {
      bubbleTop,
      bubbleLeft,
      bubbleWidth: bubbleW,
      arrow: showArrow
        ? {
            path: `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`,
            startX,
            startY,
          }
        : null,
    };
  }, [
    activeStep.isMobileTrigger,
    bubbleHeight,
    isMobileLayout,
    spotlight,
    viewport,
  ]);

  if (!hasMounted || !isOpen || typeof document === 'undefined') return null;

  const progressPct = Math.round(((stepIndex + 1) / steps.length) * 100);

  return createPortal(
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label={`جولة شرح القائمة: ${activeStep.title}`}
      className="pointer-events-auto fixed inset-0 z-[90] overflow-hidden"
    >
      {/* Clickable Dark Backdrop (skip on click allowed only from step 3+) */}
      <div
        className="pointer-events-auto absolute inset-0"
        onClick={() => {
          if (canSkip) finishTour();
        }}
      />

      {/* Dark Cutout Spotlight Mask & Curved Arrow SVG */}
      <svg
        className="pointer-events-none fixed inset-0 h-full w-full"
        width={viewport.width}
        height={viewport.height}
        aria-hidden="true"
      >
        <defs>
          <mask id={`menu-tour-mask-${maskId}`}>
            <rect
              x="0"
              y="0"
              width={viewport.width}
              height={viewport.height}
              fill="white"
            />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx="18"
                ry="18"
                fill="black"
              />
            )}
          </mask>
          <marker
            id={`menu-tour-arrow-${maskId}`}
            markerWidth="12"
            markerHeight="12"
            refX="9"
            refY="6"
            orient="auto"
          >
            <path d="M2,2 L10,6 L2,10 L4,6 Z" fill="#60A5FA" />
          </marker>
        </defs>

        <rect
          x="0"
          y="0"
          width={viewport.width}
          height={viewport.height}
          fill="rgba(7, 13, 31, 0.78)"
          mask={`url(#menu-tour-mask-${maskId})`}
        />

        {layoutGeometry.arrow && (
          <g>
            <circle
              cx={layoutGeometry.arrow.startX}
              cy={layoutGeometry.arrow.startY}
              r="4.5"
              fill="#2F6BFF"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <path
              d={layoutGeometry.arrow.path}
              fill="none"
              stroke="#60A5FA"
              strokeWidth="3"
              strokeDasharray="7 5"
              strokeLinecap="round"
              markerEnd={`url(#menu-tour-arrow-${maskId})`}
            />
          </g>
        )}
      </svg>

      {/* Glowing Spotlight Frame */}
      {spotlight && (
        <div
          aria-hidden="true"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
          className="pointer-events-none fixed z-[92] rounded-[18px] border-2 border-[#60A5FA] shadow-[0_0_0_4px_rgba(47,107,255,0.28),0_0_28px_rgba(47,107,255,0.48)] transition-opacity duration-200"
        />
      )}

      {/* Jordanian Speech Bubble Card */}
      <div
        ref={bubbleRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          top: layoutGeometry.bubbleTop,
          left: layoutGeometry.bubbleLeft,
          width: layoutGeometry.bubbleWidth,
        }}
        className="pointer-events-auto fixed z-[95] rounded-[24px] border border-[#2F6BFF]/35 bg-white p-4 text-[#0A1630] shadow-[0_24px_60px_-12px_rgba(7,13,31,0.55)] transition-opacity duration-200 sm:p-5 dark:border-[#2F6BFF]/50 dark:bg-[#0A1630] dark:text-[#FAFBFC]"
      >
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F6BFF]/12 px-2.5 py-1 text-[11px] font-bold text-[#2F6BFF] dark:bg-[#2F6BFF]/20 dark:text-[#93C5FD]">
              <Sparkles className="h-3 w-3" />
              <span>{activeStep.badge}</span>
            </span>
            <span className="font-tabular inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-1 text-[10.5px] font-semibold text-[#475569] dark:bg-[#070D1F] dark:text-[#94A3B8]">
              {isMobileLayout ? (
                <Smartphone className="h-3 w-3 text-[#2F6BFF]" />
              ) : (
                <Monitor className="h-3 w-3 text-[#2F6BFF]" />
              )}
              <span>
                {stepIndex + 1} / {steps.length}
              </span>
            </span>
          </div>

          {canSkip && (
            <button
              type="button"
              onClick={finishTour}
              aria-label="إغلاق وتخطي الجولة"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] text-[#64748B] transition-colors hover:border-[#2F6BFF] hover:text-[#0A1630] dark:border-[#1E325C] dark:text-[#94A3B8] dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0] dark:bg-[#1E325C]">
          <div
            className="h-full rounded-full bg-gradient-to-l from-[#2F6BFF] to-[#10B981] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Title & Jordanian Explanation */}
        <h3 className="mt-3 text-base font-bold leading-snug text-[#0A1630] sm:text-lg dark:text-white">
          {activeStep.title}
        </h3>
        <p className="mt-2 text-xs leading-[1.85] text-[#475569] sm:text-sm dark:text-[#CBD5E1]">
          {activeStep.description}
        </p>

        {/* Step 1-2 Notice: Skip unlocks after 2 steps */}
        {!canSkip && (
          <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-[#2F6BFF]/20 bg-[#2F6BFF]/[0.06] px-3 py-2 text-[11px] font-medium text-[#1E40AF] dark:border-[#2F6BFF]/30 dark:bg-[#2F6BFF]/10 dark:text-[#93C5FD]">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>
              {activeStep.hint ||
                'زر التخطي بيبين بعد الخطوة الثانية عشان تتعرف ع القوائم أولاً.'}
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-3 dark:border-[#1E325C]">
          <div className="flex items-center gap-1.5">
            {stepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                className="h-9 gap-1 rounded-full px-3 text-xs"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>السابق</span>
              </Button>
            )}

            {canSkip && !isLastStep && (
              <button
                type="button"
                onClick={finishTour}
                className="min-h-[36px] rounded-full px-3 text-xs font-semibold text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0A1630] dark:text-[#94A3B8] dark:hover:bg-[#1E325C] dark:hover:text-white"
              >
                تخطي الشرح
              </button>
            )}
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (isLastStep) {
                finishTour();
              } else {
                setStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
              }
            }}
            className="h-9 gap-1.5 rounded-full px-4 text-xs font-bold shadow-sm"
          >
            {isLastStep ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>فهمت، يلا نبدأ!</span>
              </>
            ) : (
              <>
                <span>التالي</span>
                <ArrowLeft className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
