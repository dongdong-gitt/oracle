import { NextRequest } from 'next/server';
import { Membership, UserRole } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { verifyOneTimeCode } from '@/server/auth/code';
import { ok, fail, handleRouteError } from '@/server/lib/http';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const code = typeof body?.code === 'string' ? body.code.trim() : '';
    const name = typeof body?.name === 'string' ? body.name.trim() : '';

    if (!phone && !email) {
      return fail(400, 'phone or email is required', 'INVALID_INPUT');
    }

    if (!code || !verifyOneTimeCode(code)) {
      return fail(400, 'invalid verification code', 'INVALID_CODE');
    }

    const user = await prisma.user.upsert({
      where: phone ? { phone } : { email },
      update: {
        ...(name ? { name } : {}),
        isGuest: false,
        guestExpiresAt: null,
      },
      create: {
        phone: phone || null,
        email: email || null,
        name: name || (phone ? `用户${phone.slice(-4)}` : email.split('@')[0]),
        role: UserRole.USER,
        membership: Membership.FREE,
        isGuest: false,
      },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        role: true,
        membership: true,
        isGuest: true,
        createdAt: true,
      },
    });

    return ok(user, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

