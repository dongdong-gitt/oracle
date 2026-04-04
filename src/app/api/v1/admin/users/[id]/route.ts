import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/db';
import { requireAdminAccess } from '@/server/auth/session';
import { handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminAccess(request, 'users.read');
    const userId = params.id;

    const [user, profiles, reports, orders] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          membership: true,
          membershipExpiresAt: true,
          isGuest: true,
          isBanned: true,
          bannedAt: true,
          bannedReason: true,
          readingCount: true,
          lastReadingAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.baziProfile.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.report.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    return ok({
      user,
      profiles,
      reports,
      orders,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

