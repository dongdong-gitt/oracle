import { auth } from '@/app/api/auth/[...nextauth]/route';
import { baziDb } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取单条测算记录详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reading = await baziDb.getReadingById(params.id, session.user.id);

    if (!reading) {
      return NextResponse.json(
        { error: 'Reading not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: reading,
    });
  } catch (error) {
    console.error('Get reading error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 更新测算记录（收藏、备注）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, notes } = body;

    if (action === 'favorite') {
      const reading = await baziDb.toggleFavorite(params.id, session.user.id);
      return NextResponse.json({
        success: true,
        data: reading,
      });
    }

    if (action === 'notes' && notes !== undefined) {
      await baziDb.updateNotes(params.id, session.user.id, notes);
      return NextResponse.json({
        success: true,
        message: 'Notes updated',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update reading error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
