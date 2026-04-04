import { NextResponse } from 'next/server';
import { AppError, isAppError } from '@/server/lib/errors';
import { writeOperationLog } from '@/server/services/operation-log.service';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    init
  );
}

export function fail(status: number, error: string, code?: string, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(code ? { code } : {}),
      ...(details !== undefined ? { details } : {}),
    },
    { status }
  );
}

export function handleRouteError(error: unknown) {
  if (isAppError(error)) {
    void writeOperationLog({
      module: 'API',
      action: 'APP_ERROR',
      level: error.status >= 500 ? 'ERROR' : 'WARN',
      message: error.message,
      payload: { code: error.code, status: error.status },
    });
    return fail(error.status, error.message, error.code);
  }

  const message = error instanceof Error ? error.message : String(error || '');
  if (message.includes('DATABASE_URL') || message.includes("Can't reach database server")) {
    void writeOperationLog({
      module: 'API',
      action: 'DATABASE_UNAVAILABLE',
      level: 'ERROR',
      message,
    });
    return fail(503, 'Database is not configured or unavailable', 'DATABASE_UNAVAILABLE');
  }

  console.error('Unhandled route error:', error);
  void writeOperationLog({
    module: 'API',
    action: 'UNHANDLED_ERROR',
    level: 'ERROR',
    message,
  });
  return fail(500, 'Internal server error', 'INTERNAL_ERROR');
}

export function assert(condition: unknown, status: number, message: string, code?: string): asserts condition {
  if (!condition) {
    throw new AppError(status, message, code);
  }
}
