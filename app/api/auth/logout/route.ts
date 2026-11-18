import { NextRequest, NextResponse } from 'next/server';
import { verifySameOriginRequest } from '@/lib/session';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  if (!verifySameOriginRequest(request)) {
    return NextResponse.json(
      { ok: false, error: 'طلب غير مصرح به من مصدر خارجي.' },
      { status: 403 }
    );
  }

  const isProd = process.env.NODE_ENV === 'production';
  const response = NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
  response.cookies.set('seftlab_session', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set('seftlab_role', '', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set('seftlab_email', '', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set('tadreebak_session', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set('tadreebak_role', '', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
