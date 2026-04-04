import { prisma } from '@/app/lib/db';
import { requireAuthUser } from '@/server/auth/session';
import {
  daysUntilExpired,
  getMembershipPlan,
  isMembershipActive,
  listMembershipPlans,
} from '@/server/services/membership.service';
import { handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuthUser();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        membership: true,
        membershipExpiresAt: true,
      },
    });

    if (!dbUser) {
      return ok({
        membership: 'FREE',
        active: true,
        daysLeft: null,
        currentPlan: getMembershipPlan('FREE'),
        plans: listMembershipPlans(),
      });
    }

    return ok({
      membership: dbUser.membership,
      membershipExpiresAt: dbUser.membershipExpiresAt,
      active: isMembershipActive(dbUser.membership, dbUser.membershipExpiresAt),
      daysLeft: daysUntilExpired(dbUser.membershipExpiresAt),
      currentPlan: getMembershipPlan(dbUser.membership),
      plans: listMembershipPlans(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
