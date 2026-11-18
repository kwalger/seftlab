import { NextRequest, NextResponse } from 'next/server';
import {
  createSignedSessionToken,
  verifyFirebaseIdToken,
  verifySameOriginRequest,
} from '@/lib/session';
import { isSuperAdminEmail, resolveUserRole } from '@/lib/auth-constants';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  if (!verifySameOriginRequest(request)) {
    return NextResponse.json(
      { ok: false, error: 'طلب غير مصرح به من مصدر خارجي.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const idToken = typeof body.idToken === 'string' ? body.idToken.trim() : '';
    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: 'رمز التحقق من الهوية مفقود.' },
        { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    const verified = await verifyFirebaseIdToken(idToken);
    if (!verified) {
      return NextResponse.json(
        { ok: false, error: 'رمز الجلسة غير صالح أو منتهي الصلاحية.' },
        { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    const rawName =
      typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const displayName = rawName || verified.name || verified.email.split('@')[0];
    const requestedRole =
      typeof body.role === 'string' ? body.role : undefined;

    // Never allow client-requested escalation to 'admin'; only verified Super Admins get 'admin'
    const role = resolveUserRole(verified.email, requestedRole, false);

    const sessionPayload = {
      id: verified.uid,
      email: verified.email,
      name: displayName,
      role,
      issuedAt: Date.now(),
    };

    const sessionToken = await createSignedSessionToken(sessionPayload);
    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      {
        ok: true,
        role,
        isSuperAdmin: isSuperAdminEmail(verified.email),
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );

    response.cookies.set('seftlab_session', sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('seftlab_role', role, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('seftlab_email', encodeURIComponent(verified.email), {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('[API/sync-session] Error syncing session:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
