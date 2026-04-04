import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeBaziComplete,
  calculateBaZi,
  calculateBaziScore,
  calculateDaYun,
  calculateLiuNian,
  getBaziDetail,
} from '@/app/lib/bazi';
import { generateLifeKLine, KLinePeriod } from '@/app/lib/lifeKLine';

type Gender = 'male' | 'female';

function buildStats(klineData: Array<{ close: number }>) {
  const closes = klineData.map((item) => Number(item.close) || 0);
  return closes.length
    ? {
        high: Math.max(...closes),
        low: Math.min(...closes),
        avg: Math.round((closes.reduce((sum, value) => sum + value, 0) / closes.length) * 100) / 100,
      }
    : { high: 0, low: 0, avg: 0 };
}

function buildFallbackAiAnalysis(params: {
  detail: any;
  bazi: any;
  currentDaYun: any;
  baseScores: { career: number; wealth: number; love: number; health: number; overall: number };
}) {
  const currentYear = new Date().getFullYear();
  const riZhu = params.detail?.日主 || params.bazi?.riZhu || '未知日主';
  const currentDaYunName = params.currentDaYun?.ganZhi || '当前大运';
  const startAge = params.currentDaYun?.开始年龄 ?? params.currentDaYun?.age ?? '-';
  const endAge = params.currentDaYun?.结束年龄 ?? (typeof startAge === 'number' ? startAge + 9 : '-');

  return {
    mingZhu: `${riZhu}日主，核心更看长期节奏与取舍。优势在于抓机会和执行，但越是想提速，越要先统一方向和资源。`,
    career: `当前阶段更适合把能力沉淀成可复用资产，聚焦主航道，避免同时铺太多战线。`,
    wealth: '财务上宜重视现金流与风险边界，短线机会可以看，但仓位和退出纪律必须先定好。',
    love: '情感上宜少用情绪做决定，多沟通边界、节奏和现实预期，关系会更稳。',
    health: '健康上重点是睡眠、压力管理和持续运动，避免长期透支换短期效率。',
    currentPeriod: `当前正处于${currentDaYunName}阶段（约${startAge}-${endAge}岁），适合在波动中做结构优化：保留优势、砍掉低效消耗，把资源集中到最能出结果的方向。`,
    thisYear: `${currentYear}年更像“校准年”——关键不在于做得多，而在于选得准、打得稳。事业与财务都更适合先求确定性，再逐步放大收益。`,
    advice: [
      '1. 事业：只保留最能形成复利的主线，减少分散投入。',
      '2. 财务：先做风险预算，再决定进攻仓位，避免情绪化加码。',
      '3. 情感：重要关系里少猜，多确认边界与预期。',
      '4. 健康：固定作息与运动频率，比偶尔爆发更重要。',
      '5. 人际：优先维护高质量合作，远离反复消耗你的人和局。',
      '6. 投资：慢就是快，先看胜率，再看赔率。',
    ].join('\n'),
    score: params.baseScores,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, gender, period: rawPeriod = '1y' } = body;

    if (!year || !month || !day || hour === undefined || !gender) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const normalizedGender = gender as Gender;
    const period = (rawPeriod || '1y') as KLinePeriod;

    const bazi = calculateBaZi(year, month, day, hour, normalizedGender);
    const detail = getBaziDetail(year, month, day, hour, normalizedGender);
    const daYun = calculateDaYun(year, month, day, hour, normalizedGender);
    const liuNian = calculateLiuNian(year, month, day, hour, normalizedGender);

    const currentYear = new Date().getFullYear();
    const currentDaYun = daYun.find((d: any) => d?.开始年份 <= currentYear && d?.结束年份 >= currentYear) || daYun[0];

    const scoreResult = calculateBaziScore(detail, currentDaYun);
    const analysis = analyzeBaziComplete(detail, currentDaYun);

    const baseScores = {
      career: Math.round(scoreResult?.career ?? analysis?.scores?.career ?? 70),
      wealth: Math.round(scoreResult?.wealth ?? analysis?.scores?.wealth ?? 70),
      love: Math.round(scoreResult?.love ?? analysis?.scores?.love ?? 70),
      health: Math.round(scoreResult?.health ?? analysis?.scores?.health ?? 70),
      overall: Math.round(scoreResult?.overall ?? analysis?.scores?.overall ?? 70),
    };

    const kline = generateLifeKLine(period, year, month, day, hour, normalizedGender, currentYear, 1, 1);
    const aiAnalysis = buildFallbackAiAnalysis({ detail, bazi, currentDaYun, baseScores });

    return NextResponse.json({
      success: true,
      data: {
        bazi,
        detail,
        daYun,
        liuNian,
        baseScores,
        aiAnalysis,
        kline,
        summary: {
          currentLuck: baseScores.overall,
          trend: kline.length > 1 && kline[kline.length - 1].close >= kline[0].open ? 'up' : 'flat',
          suggestion: aiAnalysis.advice,
          riZhu: detail?.日主 || bazi?.riZhu || '',
          wuXing: bazi?.wuXing?.dayTG || '',
        },
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Generation failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const period = (searchParams.get('period') || '1y') as KLinePeriod;
  const birthYear = parseInt(searchParams.get('birthYear') || '1995', 10);
  const birthMonth = parseInt(searchParams.get('birthMonth') || '12', 10);
  const birthDay = parseInt(searchParams.get('birthDay') || '25', 10);
  const birthHour = parseInt(searchParams.get('birthHour') || '10', 10);
  const gender = (searchParams.get('gender') || 'male') as Gender;
  const targetYear = parseInt(searchParams.get('targetYear') || new Date().getFullYear().toString(), 10);
  const targetMonth = parseInt(searchParams.get('targetMonth') || (new Date().getMonth() + 1).toString(), 10);
  const targetDay = parseInt(searchParams.get('targetDay') || new Date().getDate().toString(), 10);

  try {
    const klineData = generateLifeKLine(
      period,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      gender,
      targetYear,
      targetMonth,
      targetDay
    );

    return NextResponse.json({
      success: true,
      data: {
        period,
        birthInfo: { birthYear, birthMonth, birthDay, birthHour, gender },
        targetInfo: { targetYear, targetMonth, targetDay },
        kline: klineData,
        count: klineData.length,
        stats: buildStats(klineData),
      },
    });
  } catch (error) {
    console.error('KLine generation error:', error);
    return NextResponse.json(
      { success: false, error: 'KLine generation failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}
