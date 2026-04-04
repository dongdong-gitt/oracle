import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/server/auth/session';
import { markOrderPaid } from '@/server/services/order.service';
import { fail, handleRouteError, ok } from '@/server/lib/http';
import { writeOperationLog } from '@/server/services/operation-log.service';

export const dynamic = 'force-dynamic';

function isTrustedCallback(request: NextRequest) {
  const expected = process.env.PAYMENT_CALLBACK_TOKEN;
  if (!expected) return false;
  const provided = request.headers.get('x-callback-token');
  return provided === expected;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => ({}));

    let userId = await getSessionUserId();
    if (!userId && isTrustedCallback(request)) {
      userId = typeof body?.userId === 'string' ? body.userId : null;
    }

    if (!userId) {
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
