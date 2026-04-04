import { prisma } from '@/app/lib/db';
import { Gender } from '@prisma/client';
import { AppError } from '@/server/lib/errors';

export interface ProfileInput {
  name: string;
  gender: 'MALE' | 'FEMALE' | 'male' | 'female';
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  longitude?: number;
  latitude?: number;
  isDefault?: boolean;
  tags?: string[];
  notes?: string;
}

function normalizeGender(gender: ProfileInput['gender']): Gender {
  return String(gender).toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE';
}

async function clearDefaultProfile(userId: string) {
  await prisma.baziProfile.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });
}

export async function listProfiles(userId: string) {
  return prisma.baziProfile.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getProfile(userId: string, profileId: string) {
  const profile = await prisma.baziProfile.findFirst({
    where: { id: profileId, userId },
  });
  if (!profile) {
    throw new AppError(404, 'Profile not found', 'PROFILE_NOT_FOUND');
  }
  return profile;
}

export async function createProfile(userId: string, input: ProfileInput) {
  if (input.isDefault) {
    await clearDefaultProfile(userId);
  }

  return prisma.baziProfile.create({
    data: {
      userId,
      name: input.name,
      gender: normalizeGender(input.gender),
      birthDate: new Date(input.birthDate),
      birthTime: input.birthTime,
      birthPlace: input.birthPlace,
      country: input.country,
      province: input.province,
      city: input.city,
      district: input.district,
      longitude: input.longitude,
      latitude: input.latitude,
      isDefault: Boolean(input.isDefault),
      tags: input.tags || [],
      notes: input.notes,
    },
  });
}

export async function updateProfile(userId: string, profileId: string, input: Partial<ProfileInput>) {
  await getProfile(userId, profileId);

  if (input.isDefault) {
    await clearDefaultProfile(userId);
  }

  return prisma.baziProfile.update({
    where: { id: profileId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.gender !== undefined ? { gender: normalizeGender(input.gender as any) } : {}),
      ...(input.birthDate !== undefined ? { birthDate: new Date(input.birthDate) } : {}),
      ...(input.birthTime !== undefined ? { birthTime: input.birthTime } : {}),
      ...(input.birthPlace !== undefined ? { birthPlace: input.birthPlace } : {}),
      ...(input.country !== undefined ? { country: input.country } : {}),
      ...(input.province !== undefined ? { province: input.province } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.district !== undefined ? { district: input.district } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.isDefault !== undefined ? { isDefault: Boolean(input.isDefault) } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
  });
}

export async function deleteProfile(userId: string, profileId: string) {
  await getProfile(userId, profileId);
  await prisma.baziProfile.delete({ where: { id: profileId } });
  return { success: true };
}
