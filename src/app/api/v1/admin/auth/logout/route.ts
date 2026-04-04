import { NextRequest } from 'next/server';
import { clearAdminCookieMeta } from '@/server/auth/admin';
import { handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    const response = ok({ success: true });
    response.cookies.set(clearAdminCookieMeta());
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}

