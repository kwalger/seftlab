import type { Metadata, Viewport } from 'next';
import { Tajawal, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { SmartPWAInstallBanner } from '@/components/pwa/pwa-install-button';
import { SmoothScrollProvider } from '@/components/shared/smooth-scroll-provider';
import { PageTransition } from '@/components/shared/page-transition';
import { FirebaseAuthSync } from '@/components/providers/firebase-auth-sync';
import { getRootJsonLd } from '@/lib/seo/json-ld';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const baseUrl = process.env.APP_URL || 'https://seftlab.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFBFC' },
    { media: '(prefers-color-scheme: dark)', color: '#070D1F' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: 'SEFT Lab — seftlab.com',
  title: {
    default:
      'SEFT Lab (seftlab.com) — Skills, Experience, Future, Training | منصة المختبرات التطبيقية',
    template: '%s | SEFT Lab (seftlab.com)',
  },
  description:
    'منصة SEFT Lab العالمية (Skills, Experience, Future, Training — مهارات، خبرة، مستقبل، تدريب) بقيادة المؤسس والرئيس التنفيذي حسن عبدالرحمن العرجان: مختبرات عملية وجداول محاكاة تبني للطلاب خبرة حقيقية موثقة للجامعات والشركات.',
  keywords: [
    'SEFT Lab',
    'seftlab.com',
    'Skills Experience Future Training',
    'سيفت لاب',
    'حسن عبدالرحمن العرجان',
    'مختبر المحاسبة المالية',
    'تأهيل الخريجين للشركات',
    'جداول المحاسبة التطبيقية',
    'منصة تعليمية تطبيقية',
  ],
  authors: [{ name: 'حسن عبدالرحمن العرجان', url: `${baseUrl}/about` }],
  creator: 'حسن عبدالرحمن العرجان — المؤسس والرئيس التنفيذي لمنصة SEFT Lab',
  publisher: 'SEFT Lab — seftlab.com',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SEFT Lab',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon-32.png', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  alternates: {
    canonical: '/',
    languages: {
      ar: '/',
      'ar-JO': '/',
    },
  },
  openGraph: {
    title: 'SEFT Lab (seftlab.com) — Skills, Experience, Future, Training',
    description:
      'مهارات، خبرة، مستقبل، وتدريب عملي موثق: مختبرات تفاعلية تحول الدراسة الجامعية إلى خبرة عملية قابلة للقياس.',
    url: baseUrl,
    siteName: 'SEFT Lab — seftlab.com',
    type: 'website',
    locale: 'ar_JO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEFT Lab (seftlab.com) — Skills, Experience, Future, Training',
    description:
      'منصة المختبرات التطبيقية العالمية لتمكين طلبة الجامعات والخريجين بمهارات وخبرة عملية موثقة.',
  },
};

const fetchDescriptorGuardScript = `
(function () {
  try {
    var currentFetch = window.fetch ? window.fetch.bind(window) : undefined;
    var winDesc = Object.getOwnPropertyDescriptor(window, 'fetch');
    var protoDesc = typeof Window !== 'undefined' ? Object.getOwnPropertyDescriptor(Window.prototype, 'fetch') : undefined;

    if (protoDesc && protoDesc.configurable && !protoDesc.set) {
      Object.defineProperty(Window.prototype, 'fetch', {
        configurable: true,
        enumerable: true,
        get: function () {
          return currentFetch || (protoDesc.get ? protoDesc.get.call(this) : undefined);
        },
        set: function (fn) {
          if (typeof fn === 'function') {
            currentFetch = fn;
          }
        }
      });
    }

    if (!winDesc || (winDesc.configurable && !winDesc.writable && !winDesc.set)) {
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        enumerable: true,
        get: function () {
          return currentFetch;
        },
        set: function (fn) {
          if (typeof fn === 'function') {
            currentFetch = fn;
          }
        }
      });
    }
  } catch (_) {}

  window.addEventListener(
    'error',
    function (event) {
      var filename = (event && event.filename) || '';
      var message = (event && event.message) || '';
      if (
        filename.indexOf('chrome-extension://') === 0 ||
        message.indexOf('Cannot set property fetch of #<Window>') !== -1
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    function (event) {
      var reason = event && event.reason;
      var stack = (reason && reason.stack) || '';
      var msg = (reason && reason.message) || String(reason || '');
      if (
        stack.indexOf('chrome-extension://') !== -1 ||
        msg.indexOf('Cannot set property fetch of #<Window>') !== -1
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true
  );

  try {
    var host = window.location && window.location.hostname;
    if (
      (host === 'localhost' || host === '127.0.0.1') &&
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      typeof navigator.serviceWorker.getRegistrations === 'function'
    ) {
      navigator.serviceWorker
        .getRegistrations()
        .then(function (regs) {
          regs.forEach(function (reg) {
            reg.unregister().catch(function () {});
          });
        })
        .catch(function () {});
    }
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootJsonLd = getRootJsonLd();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        <script
          id="fetch-guard-script"
          dangerouslySetInnerHTML={{ __html: fetchDescriptorGuardScript }}
        />
        <script
          id="schema-jsonld-root"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />
      </head>
      <body
        className={`${tajawal.className} min-h-dvh flex flex-col bg-[#FAFBFC] text-[#0A1630] antialiased transition-colors dark:bg-[#070D1F] dark:text-[#FAFBFC]`}
        suppressHydrationWarning
      >
        <FirebaseAuthSync />
        <SmoothScrollProvider>
          <OfflineIndicator />
          <Navbar />
          <main className="flex min-h-0 flex-1 flex-col">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <MobileBottomNav />
          <SmartPWAInstallBanner />
        </SmoothScrollProvider>
        <Toaster
          position="top-center"
          dir="rtl"
          toastOptions={{
            className:
              'mt-[env(safe-area-inset-top)] rounded-[12px] border border-[#E3E8F0] bg-white text-[#0A1630] font-sans text-sm font-medium shadow-lg dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#FAFBFC]',
          }}
        />
      </body>
    </html>
  );
}
