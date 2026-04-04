import { NextRequest } from 'next/server';
import { requireAuthUser } from '@/server/auth/session';
import { runUnifiedScoringEngine } from '@/server/services/scoring.service';
import { getProfile } from '@/server/services/profile.service';
import { fail, handleRouteError, ok } from '@/server/lib/http';

function birthToInput(date: Date, birthTime: string, gender: string) {
  const hour = Number(String(birthTime || '0:00').split(':')[0] || 0);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: Number.isFinite(hour) ? Math.max(0, Math.min(23, hour)) : 0,
    gender: gender === 'FEMALE' || gender === 'female' ? ('female' as const) : ('male' as const),
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const profileId = body?.profileId ? String(body.profileId) : '';
    const now = new Date();

    let birth;
    if (profileId) {
      const profile = await getProfile(user.id, profileId);
      birth = birthToInput(profile.birthDate, profile.birthTime, profile.gender);
    } else {
      const birthDate = new Date(String(body?.birthDate || ''));
      if (Number.isNaN(birthDate.getTime())) {
        return fail(400, 'invalid birthDate', 'INVALID_INPUT');
      }
      birth = birthToInput(birthDate, String(body?.birthTime || ''), String(body?.gender || 'male'));
    }

    const targetYear = Number(body?.targetYear || now.getFullYear());
    const targetMonth = Number(body?.targetMonth || now.getMonth() + 1);
    const targetDay = Number(body?.targetDay || now.getDate());

    const data = runUnifiedScoringEngine({
      birth,
      targetYear,
      targetMonth,
      targetDay,
    });

    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

