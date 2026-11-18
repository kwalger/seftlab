import { NextRequest, NextResponse } from 'next/server';
import { verifyServerCredentials } from '@/lib/auth-server';
import { createSignedSessionToken, verifySameOriginRequest } from '@/lib/session';

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
      return NextResponse.json(
        { ok: false, error: 'صيغة الطلب غير صالحة.' },
        { status: 400 }
      );
    }

    const identifier = typeof body.identifier === 'string' ? body.identifier : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!identifier.trim() || !password) {
      return NextResponse.json(
        {
          ok: false,
          error: 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور.',
        },
        { status: 400 }
      );
    }

    if (identifier.length > 256 || password.length > 256) {
      return NextResponse.json(
        { ok: false, error: 'تجاوزت بيانات الدخول الطول المسموح.' },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'local-client';
    const clientKeys = [
      `ip:${ip}`,
      `acct:${identifier.trim().toLowerCase()}`,
    ];

    const result = verifyServerCredentials(identifier, password, clientKeys, {
      name: typeof body.name === 'string' ? body.name : undefined,
      organizationOrUniversity:
        typeof body.organizationOrUniversity === 'string'
          ? body.organizationOrUniversity
          : undefined,
    });

    if (!result.ok || !result.session) {
      return NextResponse.json(
        { ok: false, error: result.error || 'فشل تسجيل الدخول.' },
        {
          status: 401,
          headers: { 'Cache-Control': 'no-store, max-age=0' },
        }
      );
    }

    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      {
        ok: true,
        session: result.session,
        redirectTo: result.redirectTo,
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );

    // Tamper-proof HMAC-SHA256 session token with full UTF-8 Arabic support
    const sessionPayload = {
      id: result.session.id,
      email: result.session.email,
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

    // Client-readable role cookie for UI synchronization only
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
