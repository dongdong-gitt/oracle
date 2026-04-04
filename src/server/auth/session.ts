import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/db';
import { AppError } from '@/server/lib/errors';
import {
  AdminPermission,
  getAdminSessionFromRequest,
  hasAdminPermission,
} from '@/server/auth/admin';

const adminApiKey =
  process.env.ADMIN_API_KEY || (process.env.NODE_ENV !== 'production' ? 'local-admin-key' : '');

function hasValidAdminApiKey(request?: Request) {
  if (!request || !adminApiKey) return false;
  const headerKey = request.headers.get('x-admin-key');
  const authHeader = request.headers.get('authorization');
  const bearerKey =
    authHeader && authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : null;
  const provided = headerKey || bearerKey;
  return Boolean(provided) && provided === adminApiKey;
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  return userId || null;
}

export async function requireAuthUser() {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      avatar: true,
      role: true,
      isBanned: true,
      bannedAt: true,
      bannedReason: true,
      isGuest: true,
      guestExpiresAt: true,
      membership: true,
      membershipExpiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(401, 'User not found', 'UNAUTHORIZED');
  }

  if (user.isGuest && user.guestExpiresAt && user.guestExpiresAt.getTime() < Date.now()) {
    throw new AppError(401, 'Guest session expired', 'GUEST_EXPIRED');
  }

  if (user.isBanned) {
    throw new AppError(403, 'User is banned', 'USER_BANNED');
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireAuthUser();
  if (user.role !== 'ADMIN') {
    throw new AppError(403, 'Forbidden', 'FORBIDDEN');
  }
  return user;
}

export async function requireAdminAccess(request?: Request, permission: AdminPermission = 'dashboard') {
  if (hasValidAdminApiKey(request)) {
    return { id: 'admin-api-key', role: 'SUPER_ADMIN' as const, source: 'api_key' as const };
  }

  const adminSession = getAdminSessionFromRequest(request);
  if (adminSession) {
    if (!hasAdminPermission(adminSession.role, permission)) {
      throw new AppError(403, 'Permission denied', 'PERMISSION_DENIED');
    }
    return {
      id: `admin:${adminSession.username}`,
      role: adminSession.role,
      username: adminSession.username,
      source: 'admin_session' as const,
    };
  }

  const user = await requireAdminUser();
  return { id: user.id, role: 'SUPER_ADMIN' as const, source: 'site_admin' as const };
}
