import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/db';

function addOneYear(base?: Date | null) {
  const now = new Date();
  const start = base && base.getTime() > now.getTime() ? base : now;
  const next = new Date(start);
  next.setFullYear(next.getFullYear() + 1);
  return next;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const paymentId = String(body?.paymentId || '');
    const providerOrderId = body?.providerOrderId ? String(body.providerOrderId) : null;

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status === 'PAID') {
      return NextResponse.json({
        success: true,
        message: 'Payment already confirmed',
      });
    }

    if (payment.type !== 'MEMBERSHIP' || !payment.membershipType) {
      return NextResponse.json({ error: 'Unsupported payment type for confirmation' }, { status: 400 });
    }

    const membershipExpiresAt = addOneYear(payment.user.membershipExpiresAt);

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          providerOrderId: providerOrderId || payment.providerOrderId,
          paidAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          membership: payment.membershipType,
          membershipExpiresAt,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        membership: payment.membershipType,
        membershipExpiresAt,
      },
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
