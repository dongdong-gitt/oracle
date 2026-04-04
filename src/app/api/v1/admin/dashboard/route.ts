import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/db';
import { requireAdminAccess } from '@/server/auth/session';
import { handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAccess(request, 'dashboard');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [userTotal, todayNewUsers, totalOrders, paidOrders, reportCount, aiCallCount, paidSum] =
      await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.payment.count(),
        prisma.payment.count({ where: { status: 'PAID' } }),
        prisma.report.count(),
        prisma.aiLog.count(),
        prisma.payment.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true },
        }),
      ]);

    return ok({
      userTotal,
      todayNewUsers,
      totalOrders,
      paidOrders,
      incomeCny: Number(paidSum._sum.amount || 0),
      reportCount,
      aiCallCount,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

