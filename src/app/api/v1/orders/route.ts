import { NextRequest } from 'next/server';
import { Membership } from '@prisma/client';
import { requireAuthUser } from '@/server/auth/session';
import { createMembershipOrder, listUserOrders, markOrderPaid } from '@/server/services/order.service';
import { getMembershipPlan } from '@/server/services/membership.service';
import { fail, handleRouteError, ok } from '@/server/lib/http';
import { writeOperationLog } from '@/server/services/operation-log.service';

export const dynamic = 'force-dynamic';

function normalizeMembership(value: unknown): Membership | null {
  const text = String(value || '').toUpperCase();
  if (text === 'BASIC') return 'BASIC';
  if (text === 'PREMIUM') return 'PREMIUM';
  if (text === 'VIP') return 'VIP';
  if (text === 'FREE') return 'FREE';
  return null;
}

export async function GET() {
  try {
    const user = await requireAuthUser();
    const data = await listUserOrders(user.id);
    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const membershipType = normalizeMembership(body?.membershipType || body?.plan);
    const provider = String(body?.provider || 'stripe').toLowerCase();

    if (!membershipType) {
      return fail(400, 'invalid membershipType', 'INVALID_INPUT');
    }

    const order = await createMembershipOrder({
      userId: user.id,
      membershipType,
      provider,
    });

    const plan = getMembershipPlan(order.membershipType || membershipType);

    return ok(
      {
        ...order,
        plan,
        checkoutToken: `mock_${order.id}`,
        checkoutMode: provider === 'stripe' ? 'redirect_pending_keys' : 'manual_confirm',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const orderId = String(body?.orderId || body?.id || '');
    const action = String(body?.action || 'simulate_paid').toLowerCase();
    const providerOrderId = body?.providerOrderId ? String(body.providerOrderId) : undefined;

    if (!orderId) {
      return fail(400, 'orderId is required', 'INVALID_INPUT');
    }

    if (action !== 'simulate_paid' && action !== 'confirm_paid') {
      return fail(400, 'unsupported action', 'INVALID_ACTION');
    }

    const updated = await markOrderPaid(user.id, orderId, {
      providerOrderId,
      callbackPayload: {
        source: action,
        body,
      },
    });

    await writeOperationLog({
      module: 'ORDER',
      action: action.toUpperCase(),
      actorId: user.id,
      targetType: 'order',
      targetId: updated.id,
      message: 'user order paid flow executed',
      payload: body,
    });

    return ok(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
