import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/db';
import { requireAuthUser } from '@/server/auth/session';
import { ok, fail, handleRouteError } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuthUser();
    return ok(user);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();

    const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
    const avatar = typeof body?.avatar === 'string' ? body.avatar.trim() : undefined;

    if (name === undefined && avatar === undefined) {
      return fail(400, 'no profile field to update', 'INVALID_INPUT');
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatar: true,
        role: true,
        membership: true,
        membershipExpiresAt: true,
        isGuest: true,
        guestExpiresAt: true,
        updatedAt: true,
      },
    });

    return ok(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
