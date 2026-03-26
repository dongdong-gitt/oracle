import { auth } from '@/app/api/auth/[...nextauth]/route';
import { userDb } from '@/app/lib/db';
import { NextResponse } from 'next/server';

// 获取当前用户信息
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await userDb.getUserById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        membership: user.membership,
        membershipExpiresAt: user.membershipExpiresAt,
        readingCount: user.readingCount,
        lastReadingAt: user.lastReadingAt,
        recentReadings: user.baziReadings,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 更新用户信息
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, avatar } = body;

    // TODO: 实现更新逻辑

    return NextResponse.json({
      success: true,
      message: 'User updated',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
