import { NextRequest, NextResponse } from 'next/server';
import { verifyServerCredentials } from '@/lib/auth-server';
import { createSignedSessionToken } from '@/lib/session';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier || '');
    const password = String(body.password || '');

    if (!identifier || !password) {
      return NextResponse.json(
        {
          ok: false,
          error: 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور.',
        },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'local-client';
    const clientKey = `${ip}:${identifier.toLowerCase()}`;

    const result = verifyServerCredentials(identifier, password, clientKey, {
      name: typeof body.name === 'string' ? body.name : undefined,
      organizationOrUniversity:
        typeof body.organizationOrUniversity === 'string'
          ? body.organizationOrUniversity
          : undefined,
    });

    if (!result.ok || !result.session) {
      return NextResponse.json(
        { ok: false, error: result.error || 'فشل تسجيل الدخول.' },
        { status: 401 }
      );
    }

    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      ok: true,
      session: result.session,
      redirectTo: result.redirectTo,
    });

    // Tamper-proof HMAC-SHA256 session token with full UTF-8 Arabic support
    const sessionPayload = {
      id: result.session.id,
      role: result.session.role,
      username: result.session.username,
      name: result.session.name,
      issuedAt: Date.now(),
    };
    const sessionToken = await createSignedSessionToken(sessionPayload);

    response.cookies.set('seftlab_session', sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Client-readable role cookie for UI synchronization
    response.cookies.set('seftlab_role', result.session.role, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'حدث خطأ غير متوقع أثناء التحقق من بيانات الدخول.' },
      { status: 500 }
    );
  }
}
