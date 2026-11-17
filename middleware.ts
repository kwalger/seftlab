import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types';
import { verifySignedSessionToken } from '@/lib/session';
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

  const roleCookie = (
    request.cookies.get('seftlab_role')?.value ||
    request.cookies.get('tadreebak_role')?.value
  ) as UserRole | undefined;

  const rawEmailCookie = request.cookies.get('seftlab_email')?.value;
  const emailCookie = rawEmailCookie ? decodeURIComponent(rawEmailCookie).toLowerCase().trim() : undefined;
  const sessionCookie = request.cookies.get('seftlab_session')?.value;

  // Verify cryptographic session if present
  let sessionRole: string | undefined = undefined;
  let sessionEmail: string | undefined = undefined;

  if (sessionCookie) {
    try {
      const verified = await verifySignedSessionToken<{
        role?: string;
        email?: string;
      }>(sessionCookie);
      if (verified) {
        sessionRole = verified.role;
        sessionEmail = verified.email;
      }
    } catch {}
  }

  // Check if current user is Super Admin (hasanalarjan@gmail.com)
  const effectiveEmail = emailCookie || sessionEmail;
  const isSuperAdmin = isSuperAdminEmail(effectiveEmail) || isSuperAdminEmail(searchParams.get('email'));

  if (isSuperAdmin) {
    const response = NextResponse.next();
    response.cookies.set('seftlab_role', 'admin', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });
    if (effectiveEmail) {
      response.cookies.set('seftlab_email', encodeURIComponent(effectiveEmail), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
    }
    return response;
  }

  // Support explicit role switch query param (?role=...) in development or from /unauthorized
  const forcedRole = searchParams.get('role') as UserRole | null;
  if (
    forcedRole &&
    VALID_ROLES.includes(forcedRole) &&
    (forcedRole !== 'admin' || process.env.NODE_ENV === 'development')
  ) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete('role');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set('seftlab_role', forcedRole, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });
    return response;
  }

  // Protection for Admin routes
  if (requiredRole === 'admin') {
    if (sessionRole === 'admin' || roleCookie === 'admin') {
      return NextResponse.next();
    }

    const unauthorizedUrl = new URL('/unauthorized', request.url);
    unauthorizedUrl.searchParams.set('required', 'admin');
    unauthorizedUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Cross-role protection: if user has a role cookie and it doesn't match the target dashboard
  if (roleCookie && roleCookie !== requiredRole) {
    const unauthorizedUrl = new URL('/unauthorized', request.url);
    unauthorizedUrl.searchParams.set('required', requiredRole);
    unauthorizedUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // If no role cookie exists yet on non-admin dashboard, initialize it to match entry dashboard
  const response = NextResponse.next();
  if (!roleCookie) {
    response.cookies.set('seftlab_role', requiredRole, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
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
