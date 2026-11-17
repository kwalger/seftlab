import { NextRequest, NextResponse } from 'next/server';
import { createSignedSessionToken } from '@/lib/session';
import { isSuperAdminEmail, resolveUserRole } from '@/lib/auth-constants';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const uid = String(body.uid || '');
    const name = String(body.name || '');
    const requestedRole = body.role;

    const role = resolveUserRole(email, requestedRole);

    const sessionPayload = {
      id: uid,
      email,
      name,
      role,
      issuedAt: Date.now(),
    };

    const sessionToken = await createSignedSessionToken(sessionPayload);
    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ ok: true, role, isSuperAdmin: isSuperAdminEmail(email) });

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

    response.cookies.set('seftlab_email', email, {
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
