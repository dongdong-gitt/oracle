import { NextRequest } from 'next/server';
import { Membership, UserRole } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { ok, handleRouteError } from '@/server/lib/http';

function generateGuestName() {
  return `游客${Date.now().toString().slice(-6)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const days = Number(body?.days || 7);
    const safeDays = Math.max(1, Math.min(30, Number.isFinite(days) ? days : 7));
    const guestExpiresAt = new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name: generateGuestName(),
        role: UserRole.USER,
        membership: Membership.FREE,
        isGuest: true,
        guestExpiresAt,
      },
      select: {
        id: true,
        name: true,
        role: true,
        membership: true,
        isGuest: true,
        guestExpiresAt: true,
        createdAt: true,
      },
    });

    return ok(user, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
