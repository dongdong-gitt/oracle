import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// 获取当前用户的八字数据
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 查找用户最新的八字记录
    const reading = await prisma.baziReading.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!reading) {
      return NextResponse.json({
        success: true,
        data: null,
        message: '没有找到八字数据',
      });
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
    return NextResponse.json(
      { success: false, error: '获取数据失败' },
      { status: 500 }
    );
  }
}

// 保存用户的八字数据
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    
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
      baziData,
      daYun,
      liuNian,
      aiAnalysis,
      baseScores,
    } = body;

    // 创建新的八字记录
    const reading = await prisma.baziReading.create({
      data: {
        userId,
        name,
        gender: gender.toUpperCase(),
        birthDate: new Date(birthDate),
        birthTime,
        birthPlace,
        country,
        province,
        city,
        district,
        baziData: baziData || {},
        daYun: daYun || {},
        liuNian: liuNian || {},
        aiAnalysis: aiAnalysis || null,
        baseScores: baseScores || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: reading.id,
        savedAt: reading.createdAt,
      },
      message: '保存成功',
    });
  } catch (error) {
    console.error('Save user bazi error:', error);
    return NextResponse.json(
      { success: false, error: '保存数据失败' },
      { status: 500 }
    );
  }
}

// 更新用户的八字数据
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { readingId, ...updateData } = body;

    // 更新八字记录
    const reading = await prisma.baziReading.updateMany({
      where: {
        id: readingId,
        userId, // 确保只能更新自己的数据
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: reading,
      message: '更新成功',
    });
  } catch (error) {
    console.error('Update user bazi error:', error);
    return NextResponse.json(
      { success: false, error: '更新数据失败' },
      { status: 500 }
    );
  }
}

// 删除用户的八字数据
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const readingId = searchParams.get('id');

    if (!readingId) {
      return NextResponse.json(
        { success: false, error: '缺少记录ID' },
        { status: 400 }
      );
    }

    await prisma.baziReading.deleteMany({
      where: {
        id: readingId,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('Delete user bazi error:', error);
    return NextResponse.json(
      { success: false, error: '删除数据失败' },
      { status: 500 }
    );
  }
}
