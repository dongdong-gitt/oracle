import { NextRequest } from 'next/server';
import { deleteProfile, getProfile, updateProfile } from '@/server/services/profile.service';
import { requireAuthUser } from '@/server/auth/session';
import { handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthUser();
    const profile = await getProfile(user.id, params.id);
    return ok(profile);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const profile = await updateProfile(user.id, params.id, body || {});
    return ok(profile);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthUser();
    const result = await deleteProfile(user.id, params.id);
    return ok(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
