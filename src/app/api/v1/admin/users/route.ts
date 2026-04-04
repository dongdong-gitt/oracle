import { NextRequest } from 'next/server';
import { Membership, UserRole } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { requireAdminAccess } from '@/server/auth/session';
import { fail, handleRouteError, ok } from '@/server/lib/http';
import { writeOperationLog } from '@/server/services/operation-log.service';

export const dynamic = 'force-dynamic';

function parseMembership(value: unknown): Membership | null {
  const text = String(value || '').toUpperCase();
  if (text === 'FREE') return 'FREE';
  if (text === 'BASIC') return 'BASIC';
  if (text === 'PREMIUM') return 'PREMIUM';
  if (text === 'VIP') return 'VIP';
  return null;
}

function parseRole(value: unknown): UserRole | null {
  const text = String(value || '').toUpperCase();
  if (text === 'USER') return 'USER';
  if (text === 'ADMIN') return 'ADMIN';
  return null;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminAccess(request, 'users.read');
    const search = request.nextUrl.searchParams;

    const page = Math.max(1, Number(search.get('page') || 1));
    const pageSize = Math.max(1, Math.min(100, Number(search.get('pageSize') || 20)));
    const keyword = (search.get('keyword') || '').trim();

    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' as const } },
            { phone: { contains: keyword, mode: 'insensitive' as const } },
            { email: { contains: keyword, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, items] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          isGuest: true,
          isBanned: true,
          bannedAt: true,
          bannedReason: true,
          membership: true,
          membershipExpiresAt: true,
          readingCount: true,
          createdAt: true,
        },
      }),
    ]);

    return ok({
      page,
      pageSize,
      total,
      items,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminAccess(request, 'users.write');
    const body = await request.json();
    const userId = String(body?.userId || '');
    if (!userId) {
      return fail(400, 'userId is required', 'INVALID_INPUT');
    }

    const membership = body?.membership !== undefined ? parseMembership(body.membership) : undefined;
    const role = body?.role !== undefined ? parseRole(body.role) : undefined;
    const membershipExpiresAt =
      body?.membershipExpiresAt !== undefined && body?.membershipExpiresAt !== null
        ? new Date(String(body.membershipExpiresAt))
        : body?.membershipExpiresAt === null
        ? null
        : undefined;
    const isBanned = body?.isBanned !== undefined ? Boolean(body.isBanned) : undefined;
    const bannedReason = body?.bannedReason !== undefined ? String(body.bannedReason || '') : undefined;

    if (membership === null || role === null || Number.isNaN(membershipExpiresAt?.getTime())) {
      return fail(400, 'invalid update payload', 'INVALID_INPUT');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(membership !== undefined ? { membership } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(membershipExpiresAt !== undefined ? { membershipExpiresAt } : {}),
        ...(isBanned !== undefined
          ? {
              isBanned,
              bannedAt: isBanned ? new Date() : null,
              bannedReason: isBanned ? bannedReason || 'manual by admin' : null,
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        membership: true,
        membershipExpiresAt: true,
        isGuest: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
        updatedAt: true,
      },
    });

    await writeOperationLog({
      module: 'USER_ADMIN',
      action: 'UPDATE_USER',
      actorId: admin.id,
      targetType: 'user',
      targetId: userId,
      payload: body,
    });

    return ok(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}

