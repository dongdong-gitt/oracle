import { NextRequest, NextResponse } from 'next/server';
import { requireAuthUser } from '@/server/auth/session';
import { getReport } from '@/server/services/report.service';
import { handleRouteError } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthUser();
    const report = await getReport(user.id, params.id);

    const filename = `report-${report.id}.json`;
    return new NextResponse(JSON.stringify(report, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
