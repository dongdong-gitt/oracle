import { prisma } from '@/app/lib/db';
import { ReportType } from '@prisma/client';
import { AppError } from '@/server/lib/errors';

export interface CreateReportInput {
  title: string;
  reportType: ReportType;
  profileId?: string | null;
  readingId?: string | null;
  summary?: string | null;
  content: unknown;
  meta?: unknown;
}

export async function listReports(userId: string, limit = 50) {
  return prisma.report.findMany({
    where: { userId, isArchived: false },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 200),
  });
}

export async function getReport(userId: string, reportId: string) {
  const report = await prisma.report.findFirst({
    where: { id: reportId, userId },
  });
  if (!report) {
    throw new AppError(404, 'Report not found', 'REPORT_NOT_FOUND');
  }
  return report;
}

export async function createReport(userId: string, input: CreateReportInput) {
  return prisma.report.create({
    data: {
      userId,
      title: input.title,
      reportType: input.reportType,
      profileId: input.profileId || null,
      readingId: input.readingId || null,
      summary: input.summary || null,
      content: input.content as any,
      meta: (input.meta ?? null) as any,
    },
  });
}

export async function updateReport(
  userId: string,
  reportId: string,
  input: Partial<Omit<CreateReportInput, 'reportType' | 'content'>> & { content?: unknown }
) {
  await getReport(userId, reportId);
  return prisma.report.update({
    where: { id: reportId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.profileId !== undefined ? { profileId: input.profileId } : {}),
      ...(input.readingId !== undefined ? { readingId: input.readingId } : {}),
      ...(input.content !== undefined ? { content: input.content as any } : {}),
      ...(input.meta !== undefined ? { meta: input.meta as any } : {}),
    },
  });
}

export async function archiveReport(userId: string, reportId: string) {
  await getReport(userId, reportId);
  return prisma.report.update({
    where: { id: reportId },
    data: { isArchived: true },
  });
}

