import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/db';
import {
  MEMBERSHIP_PLANS,
  getMembershipPlan,
  membershipExpiresInDays,
  membershipIsActive,
} from '@/app/lib/membership';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        membership: true,
        membershipExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentPlan = getMembershipPlan(user.membership);
    const active = membershipIsActive(user.membership, user.membershipExpiresAt);
    const daysLeft = membershipExpiresInDays(user.membershipExpiresAt);

    return NextResponse.json({
      success: true,
      data: {
        membership: user.membership,
        membershipExpiresAt: user.membershipExpiresAt,
        active,
        daysLeft,
        currentPlan,
        plans: MEMBERSHIP_PLANS,
      },
    });
  } catch (error) {
    console.error('Get membership error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
