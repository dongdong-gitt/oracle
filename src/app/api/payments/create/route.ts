import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/db';
import { MEMBERSHIP_PLAN_MAP, MembershipTier } from '@/app/lib/membership';

const SUPPORTED_PROVIDERS = new Set(['wechat', 'alipay', 'stripe']);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const plan = (body?.plan || '').toUpperCase() as MembershipTier;
    const provider = String(body?.provider || 'wechat').toLowerCase();

    if (!['BASIC', 'PREMIUM', 'VIP'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid membership plan' }, { status: 400 });
    }

    if (!SUPPORTED_PROVIDERS.has(provider)) {
      return NextResponse.json({ error: 'Unsupported payment provider' }, { status: 400 });
    }

    const planInfo = MEMBERSHIP_PLAN_MAP[plan];
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: planInfo.yearlyPriceCny,
        currency: 'CNY',
        type: 'MEMBERSHIP',
        status: 'PENDING',
        provider,
        membershipType: plan,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        plan,
        checkoutToken: `mock_${payment.id}`,
      },
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
