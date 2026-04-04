import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma, userDb } from '@/app/lib/db';

async function getCurrentUserId() {
  const session = await auth();
  return (session?.user as any)?.id as string | undefined;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await userDb.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: { name?: string; avatar?: string } = {};

    if (typeof body?.name === 'string' && body.name.trim()) {
      updates.name = body.name.trim();
    }
    if (typeof body?.avatar === 'string' && body.avatar.trim()) {
      updates.avatar = body.avatar.trim();
    }

    if (!updates.name && !updates.avatar) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      message: 'User updated',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
