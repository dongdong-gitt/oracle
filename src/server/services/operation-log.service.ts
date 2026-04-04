import { prisma } from '@/app/lib/db';

export interface OperationLogInput {
  module: string;
  action: string;
  level?: 'INFO' | 'WARN' | 'ERROR';
  actorId?: string;
  targetType?: string;
  targetId?: string;
  message?: string;
  payload?: unknown;
}

export async function writeOperationLog(input: OperationLogInput) {
  try {
    await prisma.operationLog.create({
      data: {
        module: input.module,
        action: input.action,
        level: input.level || 'INFO',
        actorId: input.actorId || null,
        targetType: input.targetType || null,
        targetId: input.targetId || null,
        message: input.message || null,
        payload: (input.payload ?? null) as any,
      },
    });
  } catch (error) {
    // Do not block business flow for logging failure.
    console.error('writeOperationLog failed:', error);
  }
}

