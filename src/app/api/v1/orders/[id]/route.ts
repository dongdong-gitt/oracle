import { NextRequest } from 'next/server';
import { requireAuthUser } from '@/server/auth/session';
import { getUserOrder } from '@/server/services/order.service';
import { handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthUser();
    const order = await getUserOrder(user.id, params.id);
    return ok(order);
  } catch (error) {
    return handleRouteError(error);
  }
}
