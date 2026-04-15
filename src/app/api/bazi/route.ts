import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi, calculateDaYun, getBaziDetail } from '@/app/lib/bazi';
import { writeOperationLog } from '@/server/services/operation-log.service';

export async function POST(request: NextRequest) {
  let inputData: Record<string, unknown> = {};
  try {
    const body = await request.json();
    const { year, month, day, hour, gender } = body;
    inputData = { year, month, day, hour, gender };

    // 验证参数存在性
    if (!year || !month || !day || hour === undefined || !gender) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 验证参数类型和范围
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    const h = Number(hour);

    if (!Number.isInteger(y) || y < 1900 || y > 2100) {
      return NextResponse.json(
        { error: 'Invalid year: must be between 1900 and 2100' },
        { status: 400 }
      );
    }
    if (!Number.isInteger(m) || m < 1 || m > 12) {
      return NextResponse.json(
        { error: 'Invalid month: must be between 1 and 12' },
        { status: 400 }
      );
    }
    if (!Number.isInteger(d) || d < 1 || d > 31) {
      return NextResponse.json(
        { error: 'Invalid day: must be between 1 and 31' },
        { status: 400 }
      );
    }
    if (!Number.isInteger(h) || h < 0 || h > 23) {
      return NextResponse.json(
        { error: 'Invalid hour: must be between 0 and 23' },
        { status: 400 }
      );
    }
    if (gender !== 'male' && gender !== 'female') {
      return NextResponse.json(
        { error: 'Invalid gender: must be "male" or "female"' },
        { status: 400 }
      );
    }

    // 验证日期有效性（如2月30日无效）
    const testDate = new Date(y, m - 1, d);
    if (testDate.getFullYear() !== y || testDate.getMonth() !== m - 1 || testDate.getDate() !== d) {
      return NextResponse.json(
        { error: 'Invalid date: the given date does not exist' },
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
    await writeOperationLog({
      module: 'BAZI',
      action: 'CALCULATION_FAILED',
      level: 'ERROR',
      message: (error as Error).message,
      payload: inputData,
    });
    return NextResponse.json(
      { error: 'Calculation failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// 测试 GET 请求 (仅开发环境可用)
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

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
