import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types';
import {
  createSignedSessionToken,
  verifySignedSessionToken,
} from '@/lib/session';
import { isSuperAdminEmail } from '@/lib/auth-constants';

const VALID_ROLES: UserRole[] = ['student', 'teacher', 'company', 'admin'];

function getRequiredRoleForPath(pathname: string): UserRole | null {
  if (pathname === '/student' || pathname.startsWith('/student/')) {
    return 'student';
  }
  if (pathname === '/teacher' || pathname.startsWith('/teacher/')) {
    return 'teacher';
  }
  if (pathname === '/company' || pathname.startsWith('/company/')) {
    return 'company';
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return 'admin';
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const requiredRole = getRequiredRoleForPath(pathname);

  if (!requiredRole) {
    return NextResponse.next();
  }

  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';

  // Dev-only explicit role preview switch (?role=...)
  if (isDev) {
    const forcedRole = searchParams.get('role') as UserRole | null;
    if (forcedRole && VALID_ROLES.includes(forcedRole)) {
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.searchParams.delete('role');
      const devToken = await createSignedSessionToken({
        id: `dev-${forcedRole}`,
        role: forcedRole,
        email:
          forcedRole === 'admin'
            ? 'admin@seftlab.com'
            : `dev-${forcedRole}@seftlab.local`,
      });
      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set('seftlab_session', devToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set('seftlab_role', forcedRole, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
  }

  const sessionCookie = request.cookies.get('seftlab_session')?.value;
  const roleCookie = (
    request.cookies.get('seftlab_role')?.value ||
    request.cookies.get('tadreebak_role')?.value
  ) as UserRole | undefined;

  // Verify cryptographic HMAC-SHA256 session token (never trust unsigned cookies or query params)
  let sessionRole: UserRole | undefined;
  let sessionEmail: string | undefined;
  let hasValidSession = false;

  if (sessionCookie) {
    try {
      const verified = await verifySignedSessionToken<{
        id?: string;
        role?: string;
        email?: string;
      }>(sessionCookie);
      if (verified) {
        sessionEmail =
          typeof verified.email === 'string'
            ? verified.email.toLowerCase().trim()
            : undefined;
        if (
          typeof verified.role === 'string' &&
          VALID_ROLES.includes(verified.role as UserRole)
        ) {
          sessionRole = verified.role as UserRole;
        }
        if (sessionRole || isSuperAdminEmail(sessionEmail)) {
          hasValidSession = true;
        }
      }
    } catch {
      hasValidSession = false;
    }
  }

  // Handle unauthenticated requests
  if (!hasValidSession) {
    if (isProd) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Development-only fallback behavior
    if (requiredRole === 'admin') {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      unauthorizedUrl.searchParams.set('required', 'admin');
      unauthorizedUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(unauthorizedUrl);
    }

    if (roleCookie === requiredRole) {
      return NextResponse.next();
    }

    if (roleCookie && VALID_ROLES.includes(roleCookie)) {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      unauthorizedUrl.searchParams.set('required', requiredRole);
      unauthorizedUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(unauthorizedUrl);
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isSuperAdmin = isSuperAdminEmail(sessionEmail);
  const effectiveRole: UserRole = isSuperAdmin
    ? 'admin'
    : (sessionRole as UserRole);

  // Admin / Super Admin users have access to all dashboards
  if (effectiveRole === 'admin') {
    const response = NextResponse.next();
    if (roleCookie !== 'admin') {
      response.cookies.set('seftlab_role', 'admin', {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return response;
  }

  // Cross-role protection based strictly on the cryptographically verified session role
  if (effectiveRole !== requiredRole) {
    const unauthorizedUrl = new URL('/unauthorized', request.url);
    unauthorizedUrl.searchParams.set('required', requiredRole);
    unauthorizedUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(unauthorizedUrl);
  }

  const response = NextResponse.next();
  if (roleCookie !== effectiveRole) {
    response.cookies.set('seftlab_role', effectiveRole, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/student/:path*',
    '/teacher/:path*',
    '/company/:path*',
    '/admin/:path*',
  ],
};
