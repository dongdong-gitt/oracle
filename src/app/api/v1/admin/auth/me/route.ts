import { NextRequest } from 'next/server';
import { getAdminSessionFromRequest } from '@/server/auth/admin';
import { requireAdminAccess } from '@/server/auth/session';
import { handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(request);
    if (session) {
      return ok({
        authenticated: true,
        username: session.username,
        role: session.role,
        source: 'admin_session',
      });
    }

    const access = await requireAdminAccess(request, 'dashboard');
    return ok({
      authenticated: true,
      username: access.id,
      role: access.role,
      source: access.source,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

