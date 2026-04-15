import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/server/services/payment-provider.service';
import { markOrderPaid } from '@/server/services/order.service';
import { writeOperationLog } from '@/server/services/operation-log.service';
import { prisma } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/webhook
 * 支付提供商（Stripe / 微信等）的 webhook 回调端点
 * 此端点无需用户认证，通过签名验证确保安全
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature')
      || request.headers.get('x-callback-signature')
      || '';

    const provider = getPaymentProvider();

    // 1. 验证签名
    if (!provider.verifyWebhookSignature(rawBody, signature)) {
      await writeOperationLog({
        module: 'WEBHOOK',
        action: 'SIGNATURE_INVALID',
        level: 'WARN',
        message: 'Webhook signature verification failed',
        payload: { ip: request.headers.get('x-forwarded-for') || 'unknown' },
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 2. 解析事件
    const event = await provider.parseWebhookEvent(rawBody, signature);

    if (!event.orderId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    // 3. 查找订单对应的用户
    const order = await prisma.payment.findFirst({
      where: {
        OR: [{ id: event.orderId }, { orderNo: event.orderId }],
      },
      select: { id: true, userId: true, status: true },
    });

    if (!order) {
      await writeOperationLog({
        module: 'WEBHOOK',
        action: 'ORDER_NOT_FOUND',
        level: 'WARN',
        message: `Webhook received for unknown order: ${event.orderId}`,
        payload: event.payload,
      });
      return NextResponse.json({ received: true, ignored: true });
    }

    // 4. 标记订单已支付
    if (event.status === 'paid' && order.status !== 'PAID') {
      await markOrderPaid(order.userId, order.id, {
        providerOrderId: event.providerOrderId,
        callbackPayload: event.payload,
      });

      await writeOperationLog({
        module: 'WEBHOOK',
        action: 'PAYMENT_CONFIRMED',
        actorId: order.userId,
        targetType: 'order',
        targetId: order.id,
        message: 'Payment confirmed via webhook',
        payload: {
          providerOrderId: event.providerOrderId,
          status: event.status,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    await writeOperationLog({
      module: 'WEBHOOK',
      action: 'PROCESSING_ERROR',
      level: 'ERROR',
      message: (error as Error).message,
    });
    // Webhook 返回 200 避免支付平台重试
    return NextResponse.json({ received: true, error: 'Internal processing error' });
  }
}
