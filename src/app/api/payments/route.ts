/**
 * @deprecated 此路由已废弃，请使用 /api/v1/orders
 * 保留此文件仅为向后兼容，所有新代码请使用 v1 版本
 */
import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/server/auth/session';
import { listUserOrders } from '@/server/services/order.service';
import { handleRouteError } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuthUser();
    const payments = await listUserOrders(user.id);
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    return handleRouteError(error);
  }
}
