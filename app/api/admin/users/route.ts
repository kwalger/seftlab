import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdminEmail } from '@/lib/auth-constants';
import {
  isFirebaseAdminConfigured,
  listAllFirestoreUsersServer,
} from '@/lib/firebase-admin';
import {
  verifyFirebaseIdToken,
  verifySignedSessionToken,
} from '@/lib/session';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
};

async function isAuthorizedAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) {
      const verified = await verifyFirebaseIdToken(bearer);
      if (verified && isSuperAdminEmail(verified.email)) {
        return true;
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
      if (verified.role === 'admin' || isSuperAdminEmail(email)) {
        return true;
      }
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorizedAdmin(request))) {
    return NextResponse.json(
      { ok: false, error: 'غير مصرح بالوصول.' },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        users: [],
        totalCount: 0,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const result = await listAllFirestoreUsersServer();
    return NextResponse.json(
      {
        ok: true,
        configured: true,
        ...result,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error('[API/admin/users] Error fetching users:', err);
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error:
          err instanceof Error
            ? err.message
            : 'تعذر جلب المستخدمين من Firestore.',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
