import { NextRequest, NextResponse } from 'next/server';
import {
  createSignedSessionToken,
  verifyFirebaseIdToken,
  verifySameOriginRequest,
} from '@/lib/session';
import { isSuperAdminEmail, resolveUserRole } from '@/lib/auth-constants';
import { syncSingleUserToFirestoreServer } from '@/lib/firebase-admin';
import { extractSlugFromEmail } from '@/lib/student-profile';

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
    const photoURL =
      typeof body.photoURL === 'string' && body.photoURL.trim()
        ? body.photoURL.trim().slice(0, 500)
        : verified.picture;
    const organizationOrUniversity =
      typeof body.organizationOrUniversity === 'string' &&
      body.organizationOrUniversity.trim()
        ? body.organizationOrUniversity.trim().slice(0, 150)
        : undefined;

    const syncResult = await syncSingleUserToFirestoreServer({
      uid: verified.uid,
      email: verified.email,
      displayName,
      photoURL,
      requestedRole,
      organizationOrUniversity,
      idToken,
    });

    // Never allow client-requested escalation to 'admin'; only verified Super Admins or authoritative Firestore admins get 'admin'
    const isSuper = isSuperAdminEmail(verified.email);
    const role = isSuper
      ? 'admin'
      : resolveUserRole(
          verified.email,
          syncResult.synced ? syncResult.role : requestedRole,
          syncResult.synced
        );
    const slug =
      syncResult.slug || extractSlugFromEmail(verified.email, verified.uid);

    const sessionPayload = {
      id: verified.uid,
      email: verified.email,
      name: syncResult.displayName || displayName,
      username: slug,
      role,
      issuedAt: Date.now(),
    };

    const sessionToken = await createSignedSessionToken(sessionPayload);
    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      {
        ok: true,
        role,
        username: slug,
        slug,
        isSuperAdmin: isSuper,
        syncedToFirestore: syncResult.synced,
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

    response.cookies.set('tadreebak_role', role, {
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
