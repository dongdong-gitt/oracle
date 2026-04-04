import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/db';
import { requireAdminAccess } from '@/server/auth/session';
import { fail, handleRouteError, ok } from '@/server/lib/http';
import { writeOperationLog } from '@/server/services/operation-log.service';

const AI_CONFIG_KEY = 'ai_config';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAccess(request, 'ai.read');
    const [config, costStats] = await Promise.all([
      prisma.config.findUnique({ where: { key: AI_CONFIG_KEY } }),
      prisma.aiLog.aggregate({
        _sum: { cost: true, inputTokens: true, outputTokens: true },
        _count: true,
      }),
    ]);

    return ok({
      config: config?.value || {},
      stats: {
        calls: costStats._count,
        cost: Number(costStats._sum.cost || 0),
        inputTokens: Number(costStats._sum.inputTokens || 0),
        outputTokens: Number(costStats._sum.outputTokens || 0),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminAccess(request, 'ai.write');
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return fail(400, 'config payload must be object', 'INVALID_INPUT');
    }

    const normalized = {
      model: String((body as any).model || 'deepseek-chat'),
      promptTemplate: String((body as any).promptTemplate || ''),
      fallbackEnabled: Boolean((body as any).fallbackEnabled ?? true),
      updatedAt: new Date().toISOString(),
    };

    const config = await prisma.config.upsert({
      where: { key: AI_CONFIG_KEY },
      update: {
        value: normalized as any,
        description: 'AI model, prompt template and fallback switch',
      },
      create: {
        key: AI_CONFIG_KEY,
        value: normalized as any,
        description: 'AI model, prompt template and fallback switch',
      },
    });

    await writeOperationLog({
      module: 'AI_ADMIN',
      action: 'UPDATE_AI_CONFIG',
      actorId: admin.id,
      targetType: 'config',
      targetId: AI_CONFIG_KEY,
      payload: normalized,
    });

    return ok(config.value);
  } catch (error) {
    return handleRouteError(error);
  }
}

