import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET() {
  const checks = {
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    database: false,
    timestamp: new Date().toISOString(),
  };

  if (checks.databaseConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }
  }

  const healthy = checks.databaseConfigured ? checks.database : true;

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'unhealthy',
      checks,
      version: process.env.npm_package_version || '0.1.0',
    },
    { status: healthy ? 200 : 503 }
  );
}
