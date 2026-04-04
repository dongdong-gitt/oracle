import { NextRequest } from 'next/server';
import { requireAuthUser } from '@/server/auth/session';
import { archiveReport, getReport, updateReport } from '@/server/services/report.service';
import { handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthUser();
    const data = await getReport(user.id, params.id);
    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const data = await updateReport(user.id, params.id, body || {});
    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthUser();
    const data = await archiveReport(user.id, params.id);
    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
