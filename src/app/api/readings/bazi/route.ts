import { auth } from '@/app/api/auth/[...nextauth]/route';
import { baziDb, userDb } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取当前用户的八字测算记录
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const favoritesOnly = searchParams.get('favorites') === 'true';

    const readings = await baziDb.getUserReadings(session.user.id, limit);
    
    // 过滤收藏
    const filtered = favoritesOnly 
      ? readings.filter(r => r.isFavorite)
      : readings;

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    console.error('Get readings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 创建新的八字测算记录
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      gender,
      birthDate,
      birthTime,
      birthPlace,
      country,
      province,
      city,
      district,
      longitude,
      latitude,
      baziData,
      daYun,
      liuNian,
      aiAnalysis,
      baseScores,
      klineData,
    } = body;

    // 验证必填字段
    if (!name || !gender || !birthDate || !birthTime || !birthPlace) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 检查是否已存在相同的测算记录（避免重复）
    const existing = await baziDb.findExistingReading(
      session.user.id,
      new Date(birthDate),
      birthTime,
      gender
    );

    if (existing) {
      // 返回已存在的记录
      return NextResponse.json({
        success: true,
        data: existing,
        message: 'Reading already exists',
        isExisting: true,
      });
    }

    // 创建新记录
    const reading = await baziDb.createReading({
      userId: session.user.id,
      name,
      gender: gender.toUpperCase(),
      birthDate: new Date(birthDate),
      birthTime,
      birthPlace,
      country,
      province,
      city,
      district,
      longitude,
      latitude,
      baziData,
      daYun,
      liuNian,
      aiAnalysis,
      baseScores,
      klineData,
    });

    return NextResponse.json({
      success: true,
      data: reading,
    });
  } catch (error) {
    console.error('Create reading error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 删除测算记录
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Reading ID required' },
        { status: 400 }
      );
    }

    await baziDb.deleteReading(id, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Reading deleted',
    });
  } catch (error) {
    console.error('Delete reading error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
