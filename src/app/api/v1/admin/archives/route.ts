import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/db';
import { requireAdminAccess } from '@/server/auth/session';
import { fail, handleRouteError, ok } from '@/server/lib/http';
import { writeOperationLog } from '@/server/services/operation-log.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAccess(request, 'archives.read');
    const search = request.nextUrl.searchParams;
    const userId = (search.get('userId') || '').trim();
    const page = Math.max(1, Number(search.get('page') || 1));
    const pageSize = Math.max(1, Math.min(100, Number(search.get('pageSize') || 20)));

    const where = userId ? { userId } : {};
    const [profileTotal, reportTotal, profiles, reports] = await prisma.$transaction([
      prisma.baziProfile.count({ where }),
      prisma.report.count({ where }),
      prisma.baziProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
        },
      }),
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
        },
      }),
    ]);

    return ok({
      page,
      pageSize,
      profileTotal,
      reportTotal,
      profiles,
      reports,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdminAccess(request, 'archives.write');
    const body = await request.json();
    const type = String(body?.type || '').toLowerCase();
    const id = String(body?.id || '');

    if (!id || (type !== 'profile' && type !== 'report' && type !== 'reading')) {
      return fail(400, 'invalid type or id', 'INVALID_INPUT');
    }

    if (type === 'profile') {
      await prisma.baziProfile.delete({ where: { id } });
    } else if (type === 'report') {
      await prisma.report.delete({ where: { id } });
    } else {
      await prisma.baziReading.delete({ where: { id } });
    }

    await writeOperationLog({
      module: 'ARCHIVE_ADMIN',
      action: 'DELETE_ANOMALY_DATA',
      actorId: admin.id,
      targetType: type,
      targetId: id,
      payload: body,
      level: 'WARN',
    });

    return ok({ deleted: true, type, id });
  } catch (error) {
    return handleRouteError(error);
  }
}

