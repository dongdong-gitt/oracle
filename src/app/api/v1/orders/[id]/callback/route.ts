import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getSessionUserId } from '@/server/auth/session';
import { markOrderPaid } from '@/server/services/order.service';
import { fail, handleRouteError, ok } from '@/server/lib/http';
import { writeOperationLog } from '@/server/services/operation-log.service';

export const dynamic = 'force-dynamic';

/**
 * 验证回调请求的可信性
 * 支持两种验证方式：
 * 1. x-callback-token: 简单 token 比对（兼容旧逻辑）
 * 2. x-callback-signature: HMAC-SHA256 签名验证（推荐，适配 Stripe/微信支付）
 */
function isTrustedCallback(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.PAYMENT_CALLBACK_SECRET || process.env.PAYMENT_CALLBACK_TOKEN;
  if (!secret) return false;

  // 方式一：HMAC 签名验证（优先，用于 Stripe webhook 等场景）
  const signature = request.headers.get('x-callback-signature');
  if (signature) {
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSig)
    );
  }

  // 方式二：简单 token 比对（向后兼容，开发环境可用）
  const token = request.headers.get('x-callback-token');
  if (token && process.env.PAYMENT_CALLBACK_TOKEN) {
    return token === process.env.PAYMENT_CALLBACK_TOKEN;
  }

  return false;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody || '{}');

    let userId = await getSessionUserId();
    if (!userId && isTrustedCallback(request, rawBody)) {
      userId = typeof body?.userId === 'string' ? body.userId : null;
    }

    if (!userId) {
      await writeOperationLog({
        module: 'PAYMENT',
        action: 'CALLBACK_REJECTED',
        actorId: undefined,
        targetType: 'order',
        targetId: params.id,
        message: 'Unauthorized callback attempt',
        payload: { ip: request.headers.get('x-forwarded-for') || 'unknown' },
      });
      return fail(401, 'unauthorized callback', 'UNAUTHORIZED');
    }

    const order = await markOrderPaid(userId, params.id, {
      providerOrderId: body?.providerOrderId ? String(body.providerOrderId) : undefined,
      callbackPayload: body ?? null,
    });

    await writeOperationLog({
      module: 'PAYMENT',
      action: 'CALLBACK_RECEIVED',
      actorId: userId,
      targetType: 'order',
      targetId: order.id,
      payload: body ?? null,
    });

    return ok(order);
  } catch (error) {
    return handleRouteError(error);
  }
}
