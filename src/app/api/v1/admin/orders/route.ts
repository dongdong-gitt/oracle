import { NextRequest } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { requireAdminAccess } from '@/server/auth/session';
import { fail, handleRouteError, ok } from '@/server/lib/http';
import { markOrderPaid } from '@/server/services/order.service';
import { writeOperationLog } from '@/server/services/operation-log.service';

export const dynamic = 'force-dynamic';

function parseStatus(status: string | null): PaymentStatus | undefined {
  const value = String(status || '').toUpperCase();
  if (value === 'PENDING') return 'PENDING';
  if (value === 'PAID') return 'PAID';
  if (value === 'FAILED') return 'FAILED';
  if (value === 'REFUNDED') return 'REFUNDED';
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminAccess(request, 'orders.read');
    const search = request.nextUrl.searchParams;

    const page = Math.max(1, Number(search.get('page') || 1));
    const pageSize = Math.max(1, Math.min(100, Number(search.get('pageSize') || 20)));
    const status = parseStatus(search.get('status'));

    const where = status ? { status } : {};
    const [total, items] = await prisma.$transaction([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              membership: true,
              membershipExpiresAt: true,
            },
          },
        },
      }),
    ]);

    return ok({
      page,
      pageSize,
      total,
      items,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminAccess(request, 'orders.write');
    const body = await request.json();
    const orderId = String(body?.orderId || body?.id || '');
    const action = String(body?.action || 'mark_paid').toLowerCase();
    const providerOrderId = body?.providerOrderId ? String(body.providerOrderId) : undefined;

    if (!orderId) {
      return fail(400, 'orderId is required', 'INVALID_INPUT');
    }
    if (action !== 'mark_paid') {
      return fail(400, 'unsupported action', 'INVALID_ACTION');
    }

    const order = await prisma.payment.findFirst({
      where: { OR: [{ id: orderId }, { orderNo: orderId }] },
      select: { id: true, userId: true },
    });
    if (!order) {
      return fail(404, 'order not found', 'ORDER_NOT_FOUND');
    }

    const updated = await markOrderPaid(order.userId, order.id, {
      providerOrderId,
      callbackPayload: {
        source: 'admin_manual_patch',
        operator: admin.id,
        body,
      },
    });

    await writeOperationLog({
      module: 'ORDER_ADMIN',
      action: 'MANUAL_RECONCILE',
      actorId: admin.id,
      targetType: 'order',
      targetId: updated.id,
      payload: body,
      level: 'WARN',
      message: 'manual mark paid',
    });

    return ok(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}

