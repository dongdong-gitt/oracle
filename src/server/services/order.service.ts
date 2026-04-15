import { Membership, PaymentStatus, PaymentType } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { AppError } from '@/server/lib/errors';
import { addMembershipYear, getMembershipPlan } from '@/server/services/membership.service';

/**
 * 生成有意义的订单编号
 * 格式: ORC + 年月日时分秒(14位) + 4位随机数
 * 例如: ORC202604151230001234
 */
function generateOrderNo(): string {
  const now = new Date();
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `ORC${dateStr}${rand}`;
}

export interface CreateOrderInput {
  userId: string;
  membershipType: Membership;
  provider: string;
}

export async function createMembershipOrder(input: CreateOrderInput) {
  if (input.membershipType === 'FREE') {
    throw new AppError(400, 'FREE does not require payment', 'INVALID_MEMBERSHIP');
  }

  const plan = getMembershipPlan(input.membershipType);
  return prisma.payment.create({
    data: {
      orderNo: generateOrderNo(),
      userId: input.userId,
      amount: plan.price,
      currency: plan.currency,
      type: PaymentType.MEMBERSHIP,
      status: PaymentStatus.PENDING,
      provider: input.provider,
      membershipType: input.membershipType,
    },
  });
}

export async function listUserOrders(userId: string) {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

export async function getUserOrder(userId: string, orderId: string) {
  const order = await prisma.payment.findFirst({
    where: {
      userId,
      OR: [{ id: orderId }, { orderNo: orderId }],
    },
  });
  if (!order) {
    throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND');
  }
  return order;
}

export async function markOrderPaid(
  userId: string,
  orderId: string,
  payload?: { providerOrderId?: string; callbackPayload?: unknown }
) {
  const order = await getUserOrder(userId, orderId);
  if (order.status === PaymentStatus.PAID) {
    return order;
  }

  if (!order.membershipType) {
    throw new AppError(400, 'Only membership order can activate membership', 'UNSUPPORTED_ORDER_TYPE');
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { membershipExpiresAt: true } });
  if (!user) {
    throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  }

  const nextExpireAt = addMembershipYear(user.membershipExpiresAt);
  const [, paidOrder] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        membership: order.membershipType,
        membershipExpiresAt: nextExpireAt,
      },
    }),
    prisma.payment.update({
      where: { id: order.id },
      data: {
        status: PaymentStatus.PAID,
        providerOrderId: payload?.providerOrderId || order.providerOrderId,
        callbackPayload: (payload?.callbackPayload ?? null) as any,
        paidAt: new Date(),
      },
    }),
  ]);

  return paidOrder;
}
