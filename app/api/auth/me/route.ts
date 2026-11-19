import { NextRequest, NextResponse } from 'next/server';
import {
  getEffectiveUserRole,
  isSuperAdminEmail,
} from '@/lib/auth-constants';
import { verifySignedSessionToken } from '@/lib/session';
import { extractSlugFromEmail } from '@/lib/student-profile';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
};

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('seftlab_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json(
      { ok: true, authenticated: false, user: null },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  }

  const verified = await verifySignedSessionToken<{
    id?: string;
    email?: string;
    name?: string;
    username?: string;
    role?: string;
  }>(sessionCookie);

  if (!verified) {
    return NextResponse.json(
      { ok: true, authenticated: false, user: null },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  }

  const email = (verified.email || '').trim().toLowerCase();
  const isSuper = isSuperAdminEmail(email);
  const role = isSuper
    ? 'admin'
    : getEffectiveUserRole({ email, role: verified.role });
  const id = verified.id || (isSuper ? 'usr-admin-root' : 'session-user');
  const username = verified.username || extractSlugFromEmail(email, id);
  const name =
    (typeof verified.name === 'string' && verified.name.trim()) ||
    (role === 'admin' ? 'مدير النظام العام' : username);

  return NextResponse.json(
    {
      ok: true,
      authenticated: true,
      user: {
        id,
        email,
        name,
        username,
        role,
        organizationOrUniversity:
          role === 'admin' ? 'إدارة منصة SEFT Lab' : 'جامعة الزرقاء',
        approvalStatus: 'approved' as const,
      },
      isSuperAdmin: isSuper,
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
