import { NextRequest } from 'next/server';
import { ReportType } from '@prisma/client';
import { requireAuthUser } from '@/server/auth/session';
import { createReport, listReports } from '@/server/services/report.service';
import { fail, handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

function normalizeReportType(value: unknown): ReportType {
  const type = String(value || 'BAZI_READING').toUpperCase();
  if (type === 'DAILY_FORTUNE') return 'DAILY_FORTUNE';
  if (type === 'MONTHLY_FORTUNE') return 'MONTHLY_FORTUNE';
  if (type === 'YEARLY_FORTUNE') return 'YEARLY_FORTUNE';
  if (type === 'CUSTOM') return 'CUSTOM';
  return 'BAZI_READING';
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const limit = Number(request.nextUrl.searchParams.get('limit') || 50);
    const data = await listReports(user.id, limit);
    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();

    const title = String(body?.title || '').trim();
    const content = body?.content;
    if (!title || content === undefined) {
      return fail(400, 'title and content are required', 'INVALID_INPUT');
    }

    const data = await createReport(user.id, {
      title,
      reportType: normalizeReportType(body?.reportType),
      profileId: body?.profileId ? String(body.profileId) : null,
      readingId: body?.readingId ? String(body.readingId) : null,
      summary: body?.summary ? String(body.summary) : null,
      content,
      meta: body?.meta ?? null,
    });

    return ok(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
