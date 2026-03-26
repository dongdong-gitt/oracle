import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi, calculateDaYun, getBaziDetail } from '@/app/lib/bazi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, gender } = body;

    // 验证参数
    if (!year || !month || !day || hour === undefined || !gender) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 计算八字（使用 yuhr123/bazi + tyme4ts 权威算法）
    const bazi = calculateBaZi(year, month, day, hour, gender);
    const daYun = calculateDaYun(year, month, day, hour, gender);
    const detail = getBaziDetail(year, month, day, hour, gender);

    return NextResponse.json({
      success: true,
      data: {
        bazi,
        daYun,
        detail,
        input: { year, month, day, hour, gender },
      },
    });
  } catch (error) {
    console.error('BaZi calculation error:', error);
    return NextResponse.json(
      { error: 'Calculation failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// 测试 GET 请求
export async function GET() {
  // 测试：王冬的八字
  const testResult = calculateBaZi(1995, 12, 25, 14, 'male');
  const testDaYun = calculateDaYun(1995, 12, 25, 14, 'male');
  const testDetail = getBaziDetail(1995, 12, 25, 14, 'male');
  
  return NextResponse.json({
    message: '八字排盘 API 运行正常（基于 tyme4ts 权威算法）',
    test: {
      input: '1995年12月25日 14时 男',
      result: testResult,
      daYun: testDaYun,
      detail: testDetail,
    },
  });
}
