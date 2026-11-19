import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdminEmail } from '@/lib/auth-constants';
import {
  isFirebaseAdminConfigured,
  syncAllFirebaseAuthUsersToFirestore,
} from '@/lib/firebase-admin';
import {
  verifyFirebaseIdToken,
  verifySameOriginRequest,
  verifySignedSessionToken,
} from '@/lib/session';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
};

function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  if (aBytes.length !== bBytes.length || aBytes.length === 0) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

async function authorizeAdminRequest(
  request: NextRequest,
  isMutation: boolean
): Promise<{ authorized: boolean; actor?: string }> {
  const configuredSecret = (process.env.ADMIN_SYNC_SECRET || '').trim();
  if (configuredSecret) {
    const providedSecret = (
      request.headers.get('x-admin-sync-secret') ||
      request.nextUrl.searchParams.get('secret') ||
      request.nextUrl.searchParams.get('key') ||
      ''
    ).trim();

    if (providedSecret && constantTimeEqual(providedSecret, configuredSecret)) {
      return { authorized: true, actor: 'sync-secret' };
    }
  }

  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) {
      const verified = await verifyFirebaseIdToken(bearer);
      if (verified && isSuperAdminEmail(verified.email)) {
        return { authorized: true, actor: verified.email };
      }
    }
  }

  const sessionCookie = request.cookies.get('seftlab_session')?.value;
  if (sessionCookie) {
    const verified = await verifySignedSessionToken<{
      role?: string;
      email?: string;
    }>(sessionCookie);

    if (verified) {
      const email =
        typeof verified.email === 'string'
          ? verified.email.trim().toLowerCase()
          : '';
      const isAdmin =
        verified.role === 'admin' || isSuperAdminEmail(email);

      if (isAdmin) {
        if (isMutation && !verifySameOriginRequest(request)) {
          return { authorized: false };
        }
        return { authorized: true, actor: email || 'admin-session' };
      }
    }
  }

  return { authorized: false };
}

async function handleSync(request: NextRequest, isMutation: boolean) {
  const authResult = await authorizeAdminRequest(request, isMutation);
  if (!authResult.authorized) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'غير مصرح. يرجى تسجيل الدخول بحساب مسؤول النظام (Admin) عبر /login ثم إعادة فتح الرابط.',
      },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        code: 'FIREBASE_ADMIN_NOT_CONFIGURED',
        error:
          'بيانات اعتماد Firebase Admin غير مُعدّة في متغيرات البيئة.',
        requiredEnvVars: [
          'FIREBASE_SERVICE_ACCOUNT_KEY (JSON كامل من Firebase Console)',
          'أو: FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY',
        ],
        setupSteps: [
          'افتح Firebase Console -> Project Settings -> Service accounts.',
          'اضغط Generate new private key لتنزيل ملف JSON.',
          'أضف محتوى الملف في FIREBASE_SERVICE_ACCOUNT_KEY داخل .env.local (وفي إعدادات Cloudflare Pages للبيئة الإنتاجية).',
          'أعد تشغيل الخادم ثم افتح هذا الرابط مجدداً.',
        ],
      },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true';
    const result = await syncAllFirebaseAuthUsersToFirestore({ dryRun });

    return NextResponse.json(
      {
        ok: true,
        triggeredBy: authResult.actor || 'admin',
        ...result,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error('[API/auto-sync-students] Sync error:', err);
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'تعذر إتمام عملية المزامنة.',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleSync(request, false);
}

export async function POST(request: NextRequest) {
  return handleSync(request, true);
}
