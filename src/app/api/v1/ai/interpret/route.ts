import { NextRequest } from 'next/server';
import { requireAuthUser } from '@/server/auth/session';
import { generateAiInterpretation } from '@/server/services/ai.service';
import { fail, handleRouteError, ok } from '@/server/lib/http';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();

    const chart = body?.chart;
    const scores = body?.scores;
    if (!chart || !scores) {
      return fail(400, 'chart and scores are required', 'INVALID_INPUT');
    }

    const result = await generateAiInterpretation({
      userId: user.id,
      name: typeof body?.name === 'string' ? body.name : user.name || undefined,
      chart,
      scores: {
        career: Number(scores.career || 0),
        wealth: Number(scores.wealth || 0),
        love: Number(scores.love || 0),
        health: Number(scores.health || 0),
        overall: Number(scores.overall || 0),
      },
      mode: body?.mode === 'daily' || body?.mode === 'yearly' ? body.mode : 'full',
    });

    return ok(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

