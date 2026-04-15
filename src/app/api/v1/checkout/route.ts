import { NextRequest } from 'next/server';
import { requireAuthUser } from '@/server/auth/session';
import { createMembershipOrder } from '@/server/services/order.service';
import { getPaymentProvider } from '@/server/services/payment-provider.service';
import { fail, handleRouteError, ok } from '@/server/lib/http';
import { writeOperationLog } from '@/server/services/operation-log.service';
import { Membership } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/checkout
 * 创建支付 Checkout Session，返回支付跳转 URL
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const membershipType = String(body?.membershipType || '').toUpperCase() as Membership;

    if (!['BASIC', 'PREMIUM', 'VIP'].includes(membershipType)) {
      return fail(400, 'Invalid membership type', 'INVALID_INPUT');
    }

    // 1. 创建内部订单
    const order = await createMembershipOrder({
      userId: user.id,
      membershipType,
      provider: 'stripe',
    });

    // 2. 创建支付提供商的 Checkout Session
    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const provider = getPaymentProvider();
    const session = await provider.createCheckoutSession({
      orderId: order.id,
      orderNo: order.orderNo,
      membershipType,
      userId: user.id,
      successUrl: `${origin}/?payment=success&order=${order.id}`,
      cancelUrl: `${origin}/?payment=cancelled`,
    });

    // 3. 记录操作日志
    await writeOperationLog({
      module: 'PAYMENT',
      action: 'CHECKOUT_CREATED',
      actorId: user.id,
      targetType: 'order',
      targetId: order.id,
      message: `Checkout session created for ${membershipType}`,
      payload: { providerSessionId: session.providerSessionId, provider: session.provider },
    });

    return ok({
      orderId: order.id,
      orderNo: order.orderNo,
      checkoutUrl: session.checkoutUrl,
      provider: session.provider,
    }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
