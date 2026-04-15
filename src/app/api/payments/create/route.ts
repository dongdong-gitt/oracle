/**
 * @deprecated 此路由已废弃，请使用 POST /api/v1/orders
 * 保留此文件仅为向后兼容，内部转发至统一的 order service
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuthUser } from '@/server/auth/session';
import { createMembershipOrder } from '@/server/services/order.service';
import { handleRouteError } from '@/server/lib/http';
import { Membership } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const plan = String(body?.plan || '').toUpperCase() as Membership;
    const provider = String(body?.provider || 'stripe').toLowerCase();

    if (!['BASIC', 'PREMIUM', 'VIP'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid membership plan' }, { status: 400 });
    }

    // 统一使用 order service
    const order = await createMembershipOrder({
      userId: user.id,
      membershipType: plan,
      provider,
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: order.id,
        amount: order.amount,
        currency: order.currency,
        provider: order.provider,
        plan,
        checkoutToken: `mock_${order.id}`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
