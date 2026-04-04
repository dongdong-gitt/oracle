import { NextRequest } from 'next/server';
import { Gender } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { requireAuthUser } from '@/server/auth/session';
import { calculateChart } from '@/server/services/bazi.service';
import { buildKline } from '@/server/services/kline.service';
import { generateAiInterpretation } from '@/server/services/ai.service';
import { getProfile } from '@/server/services/profile.service';
import { fail, handleRouteError, ok } from '@/server/lib/http';

function parseBirthFromDateTime(birthDate: Date, birthTime: string, gender: Gender) {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const hour = Number(String(birthTime || '0:00').split(':')[0] || 0);

  return {
    year,
    month,
    day,
    hour: Number.isFinite(hour) ? Math.min(23, Math.max(0, hour)) : 0,
    gender: gender === 'FEMALE' ? ('female' as const) : ('male' as const),
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();

    const profileId = body?.profileId ? String(body.profileId) : null;
    const save = body?.save !== false;

    let profileData: {
      profileId?: string | null;
      name: string;
      gender: Gender;
      birthDate: Date;
      birthTime: string;
      birthPlace: string;
      country?: string | null;
      province?: string | null;
      city?: string | null;
      district?: string | null;
      longitude?: number | null;
      latitude?: number | null;
    };

    if (profileId) {
      const profile = await getProfile(user.id, profileId);
      profileData = {
        profileId: profile.id,
        name: profile.name,
        gender: profile.gender,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        birthPlace: profile.birthPlace,
        country: profile.country,
        province: profile.province,
        city: profile.city,
        district: profile.district,
        longitude: profile.longitude,
        latitude: profile.latitude,
      };
    } else {
      const birthDate = new Date(String(body?.birthDate || ''));
      if (Number.isNaN(birthDate.getTime())) {
        return fail(400, 'invalid birthDate', 'INVALID_INPUT');
      }

      profileData = {
        profileId: null,
        name: String(body?.name || '').trim(),
        gender: String(body?.gender || 'male').toLowerCase() === 'female' ? 'FEMALE' : 'MALE',
        birthDate,
        birthTime: String(body?.birthTime || ''),
        birthPlace: String(body?.birthPlace || '').trim(),
        country: body?.country ? String(body.country) : null,
        province: body?.province ? String(body.province) : null,
        city: body?.city ? String(body.city) : null,
        district: body?.district ? String(body.district) : null,
        longitude: body?.longitude !== undefined ? Number(body.longitude) : null,
        latitude: body?.latitude !== undefined ? Number(body.latitude) : null,
      };
    }

    if (!profileData.name || !profileData.birthTime || !profileData.birthPlace) {
      return fail(400, 'missing required fields', 'INVALID_INPUT');
    }

    const birth = parseBirthFromDateTime(profileData.birthDate, profileData.birthTime, profileData.gender);
    const chart = calculateChart(birth);

    const now = new Date();
    const kline = buildKline({
      period: (body?.period || '1y') as any,
      birth,
      targetYear: Number(body?.targetYear || now.getFullYear()),
      targetMonth: Number(body?.targetMonth || now.getMonth() + 1),
      targetDay: Number(body?.targetDay || now.getDate()),
    });

    const ai = await generateAiInterpretation({
      userId: user.id,
      name: profileData.name,
      chart,
      scores: chart.scores,
      mode: body?.mode === 'daily' || body?.mode === 'yearly' ? body.mode : 'full',
    });

    let readingId: string | null = null;
    if (save) {
      const reading = await prisma.baziReading.create({
        data: {
          userId: user.id,
          profileId: profileData.profileId || null,
          name: profileData.name,
          gender: profileData.gender,
          birthDate: profileData.birthDate,
          birthTime: profileData.birthTime,
          birthPlace: profileData.birthPlace,
          country: profileData.country || null,
          province: profileData.province || null,
          city: profileData.city || null,
          district: profileData.district || null,
          longitude: profileData.longitude ?? null,
          latitude: profileData.latitude ?? null,
          baziData: chart.bazi as any,
          daYun: chart.daYun as any,
          liuNian: chart.liuNian as any,
          aiAnalysis: {
            content: ai.content,
            source: ai.source,
            model: ai.model,
            fallbackUsed: ai.fallbackUsed,
          } as any,
          baseScores: chart.scores as any,
          klineData: kline as any,
        },
        select: { id: true, createdAt: true },
      });

      readingId = reading.id;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          readingCount: { increment: 1 },
          lastReadingAt: new Date(),
        },
      });
    }

    return ok({
      profile: profileData,
      readingId,
      chart,
      kline,
      ai,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

