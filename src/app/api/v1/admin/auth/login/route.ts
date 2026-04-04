import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/server/auth/admin';
import { fail, handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body?.username || '').trim();
    const password = String(body?.password || '');

    if (!username || !password) {
      return fail(400, 'username and password are required', 'INVALID_INPUT');
    }

    const authResult = authenticateAdmin(username, password);
    if (!authResult) {
      return fail(401, 'invalid admin credentials', 'INVALID_CREDENTIALS');
    }

    const response = ok({
      username: authResult.username,
      role: authResult.role,
      permissions: authResult.role === 'SUPER_ADMIN' ? 'all' : 'readonly-plus',
    });

    response.cookies.set({
      name: authResult.cookieName,
      value: authResult.token,
      maxAge: authResult.maxAge,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}

