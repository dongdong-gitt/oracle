import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/db';
import { requireAdminAccess } from '@/server/auth/session';
import { handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAccess(request, 'logs.read');
    const search = request.nextUrl.searchParams;
    const page = Math.max(1, Number(search.get('page') || 1));
    const pageSize = Math.max(1, Math.min(100, Number(search.get('pageSize') || 20)));

    const [operationLogs, aiErrors, paymentCallbackLogs] = await Promise.all([
      prisma.operationLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.aiLog.findMany({
        where: { provider: 'fallback' },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
      }),
      prisma.payment.findMany({
        where: { callbackPayload: { not: null } },
        orderBy: { updatedAt: 'desc' },
        take: pageSize,
        select: {
          id: true,
          orderNo: true,
          userId: true,
          provider: true,
          status: true,
          callbackPayload: true,
          updatedAt: true,
        },
      }),
    ]);

    return ok({
      operationLogs,
      aiErrors,
      paymentCallbackLogs,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

