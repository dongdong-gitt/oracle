import { NextRequest } from 'next/server';
import { KLinePeriod } from '@/app/lib/lifeKLine';
import { requireAuthUser } from '@/server/auth/session';
import { buildKline } from '@/server/services/kline.service';
import { getProfile } from '@/server/services/profile.service';
import { fail, handleRouteError, ok } from '@/server/lib/http';

export const dynamic = 'force-dynamic';

function normalizePeriod(period: unknown): KLinePeriod {
  const value = String(period || '1y');
  if (value === '1d' || value === '1m' || value === '1y' || value === '10y' || value === 'all') {
    return value;
  }
  return '1y';
}

function toBirthInput(birthDate: Date, birthTime: string, gender: string) {
  const hour = Number(String(birthTime || '0:00').split(':')[0] || 0);
  return {
    year: birthDate.getFullYear(),
    month: birthDate.getMonth() + 1,
    day: birthDate.getDate(),
    hour: Number.isFinite(hour) ? Math.min(23, Math.max(0, hour)) : 0,
    gender: gender === 'FEMALE' || gender === 'female' ? ('female' as const) : ('male' as const),
  };
}

async function execute(payload: any) {
  const user = await requireAuthUser();
  const profileId = payload?.profileId ? String(payload.profileId) : '';
  const now = new Date();

  let birth;
  if (profileId) {
    const profile = await getProfile(user.id, profileId);
    birth = toBirthInput(profile.birthDate, profile.birthTime, profile.gender);
  } else {
    const birthDate = new Date(String(payload?.birthDate || ''));
    if (Number.isNaN(birthDate.getTime())) {
      return fail(400, 'invalid birthDate', 'INVALID_INPUT');
    }
    if (!payload?.birthTime) {
      return fail(400, 'birthTime is required', 'INVALID_INPUT');
    }
    birth = toBirthInput(birthDate, String(payload.birthTime), String(payload?.gender || 'male'));
  }

  const data = buildKline({
    period: normalizePeriod(payload?.period),
    birth,
    targetYear: Number(payload?.targetYear || now.getFullYear()),
    targetMonth: Number(payload?.targetMonth || now.getMonth() + 1),
    targetDay: Number(payload?.targetDay || now.getDate()),
  });
  return ok(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return await execute(body || {});
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams;
    return await execute({
      profileId: search.get('profileId'),
      birthDate: search.get('birthDate'),
      birthTime: search.get('birthTime'),
      gender: search.get('gender'),
      period: search.get('period'),
      targetYear: search.get('targetYear'),
      targetMonth: search.get('targetMonth'),
      targetDay: search.get('targetDay'),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
