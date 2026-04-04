import { NextRequest } from 'next/server';
import { createProfile, listProfiles, ProfileInput } from '@/server/services/profile.service';
import { requireAuthUser } from '@/server/auth/session';
import { fail, handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

function parseProfileInput(body: any): ProfileInput {
  return {
    name: String(body?.name || '').trim(),
    gender: body?.gender === 'female' || body?.gender === 'FEMALE' ? 'female' : 'male',
    birthDate: String(body?.birthDate || ''),
    birthTime: String(body?.birthTime || ''),
    birthPlace: String(body?.birthPlace || '').trim(),
    country: body?.country ? String(body.country) : undefined,
    province: body?.province ? String(body.province) : undefined,
    city: body?.city ? String(body.city) : undefined,
    district: body?.district ? String(body.district) : undefined,
    longitude: body?.longitude !== undefined ? Number(body.longitude) : undefined,
    latitude: body?.latitude !== undefined ? Number(body.latitude) : undefined,
    isDefault: Boolean(body?.isDefault),
    tags: Array.isArray(body?.tags) ? body.tags.map((v: unknown) => String(v)) : undefined,
    notes: body?.notes ? String(body.notes) : undefined,
  };
}

function validateProfileInput(input: ProfileInput) {
  if (!input.name || !input.birthDate || !input.birthTime || !input.birthPlace) {
    return false;
  }
  if (Number.isNaN(new Date(input.birthDate).getTime())) {
    return false;
  }
  return true;
}

export async function GET() {
  try {
    const user = await requireAuthUser();
    const data = await listProfiles(user.id);
    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const input = parseProfileInput(body);

    if (!validateProfileInput(input)) {
      return fail(400, 'invalid profile payload', 'INVALID_INPUT');
    }

    const profile = await createProfile(user.id, input);
    return ok(profile, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
