import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/db';

function normalizeGender(gender?: string) {
  if (!gender) return 'MALE';
  return gender.toUpperCase() === 'FEMALE' || gender.toLowerCase() === 'female' ? 'FEMALE' : 'MALE';
}

async function getCurrentUserId() {
  const session = await auth();
  return (session?.user as any)?.id as string | undefined;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const reading = await prisma.baziReading.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!reading) {
      return NextResponse.json({ success: true, data: null, message: 'No bazi data found' });
    }

    return NextResponse.json({
      success: true,
      data: {
        birthData: {
          name: reading.name,
          gender: reading.gender.toLowerCase(),
          birthDate: reading.birthDate.toISOString().split('T')[0],
          birthTime: reading.birthTime,
          birthPlace: reading.birthPlace,
          country: reading.country,
          province: reading.province,
          city: reading.city,
          district: reading.district,
        },
        baziResult: reading.baziData,
      },
    });
  } catch (error) {
    console.error('Get user bazi error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const reading = await prisma.baziReading.create({
      data: {
        userId,
        name: body.name,
        gender: normalizeGender(body.gender) as any,
        birthDate: new Date(body.birthDate),
        birthTime: body.birthTime,
        birthPlace: body.birthPlace,
        country: body.country,
        province: body.province,
        city: body.city,
        district: body.district,
        baziData: body.baziData || {},
        daYun: body.daYun || {},
        liuNian: body.liuNian || {},
        aiAnalysis: body.aiAnalysis || null,
        baseScores: body.baseScores || null,
        klineData: body.klineData || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: reading.id, savedAt: reading.createdAt },
      message: 'Saved',
    });
  } catch (error) {
    console.error('Save user bazi error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { readingId, notes, isFavorite, aiAnalysis, baseScores, klineData } = body;

    if (!readingId) {
      return NextResponse.json({ success: false, error: 'Missing readingId' }, { status: 400 });
    }

    const updated = await prisma.baziReading.updateMany({
      where: { id: readingId, userId },
      data: {
        ...(notes !== undefined ? { notes: String(notes) } : {}),
        ...(isFavorite !== undefined ? { isFavorite: Boolean(isFavorite) } : {}),
        ...(aiAnalysis !== undefined ? { aiAnalysis } : {}),
        ...(baseScores !== undefined ? { baseScores } : {}),
        ...(klineData !== undefined ? { klineData } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated, message: 'Updated' });
  } catch (error) {
    console.error('Update user bazi error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const readingId = searchParams.get('id');
    if (!readingId) {
      return NextResponse.json({ success: false, error: 'Missing reading id' }, { status: 400 });
    }

    await prisma.baziReading.deleteMany({
      where: { id: readingId, userId },
    });

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error('Delete user bazi error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete data' }, { status: 500 });
  }
}
