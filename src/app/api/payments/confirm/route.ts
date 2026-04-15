/**
 * @deprecated 此路由已废弃，请使用 PATCH /api/v1/orders 或 POST /api/v1/orders/[id]/callback
 * 保留此文件仅为向后兼容，内部转发至统一的 order service
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuthUser } from '@/server/auth/session';
import { markOrderPaid } from '@/server/services/order.service';
import { handleRouteError } from '@/server/lib/http';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const paymentId = String(body?.paymentId || '');
    const providerOrderId = body?.providerOrderId ? String(body.providerOrderId) : undefined;

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    // 统一使用 order service
    const order = await markOrderPaid(user.id, paymentId, {
      providerOrderId,
      callbackPayload: body,
    });

    return NextResponse.json({
      success: true,
      data: {
        membership: order.membershipType,
        paidAt: order.paidAt,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
