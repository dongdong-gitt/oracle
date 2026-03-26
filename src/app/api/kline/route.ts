import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi, calculateDaYun, calculateLiuNian, getBaziDetail } from '@/app/lib/bazi';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

type DeepseekMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function tryParseJsonObject(text: string) {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  const candidate = text.slice(first, last + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

async function generateAiAnalysis(params: {
  name?: string;
  gender: 'male' | 'female';
  bazi: { year: string; month: string; day: string; hour: string; riZhu: string; wuXing?: any; yinYang?: any };
  daYun: Array<{ age: number; ganZhi: string }>;
  detail: any;
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const prompt = `你是一位专业、克制且实用的八字命理顾问。请基于用户的八字与大运信息，生成“结构化 JSON”，用于前端展示。

用户信息：
- 性别：${params.gender === 'male' ? '男' : '女'}
- 姓名：${params.name || '未提供'}
- 八字：${params.bazi.year} ${params.bazi.month} ${params.bazi.day} ${params.bazi.hour}
- 日主：${params.detail?.日主 || params.bazi.riZhu}
- 当前年份：${currentYear}
- 大运：${params.daYun.map(d => `${d.age}岁 ${d.ganZhi}`).join('；')}

输出要求：
- 只输出 JSON，不要 Markdown，不要多余文字
- 字段必须齐全：mingZhu, career, wealth, love, health, currentPeriod, thisYear, advice, score
- score 为 0-100 的整数：career, wealth, love, health, overall
- 文风：专业但易懂，避免绝对化断言，给出可执行建议

JSON 结构示例：
{
  "mingZhu": "...",
  "career": "...",
  "wealth": "...",
  "love": "...",
  "health": "...",
  "currentPeriod": "...",
  "thisYear": "...",
  "advice": "...",
  "score": { "career": 70, "wealth": 70, "love": 70, "health": 70, "overall": 70 }
}`;

  const messages: DeepseekMessage[] = [
    {
      role: 'system',
      content: '你是专业的八字命理顾问，擅长将传统命理与现代生活决策结合，输出务实建议与结构化结果。',
    },
    { role: 'user', content: prompt },
  ];

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.6,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json().catch(() => null);
  const content: string = data?.choices?.[0]?.message?.content || '';
  const parsed = tryParseJsonObject(content);
  if (!parsed) {
    return null;
  }

  const score = parsed.score || {};
  const normalized = {
    mingZhu: String(parsed.mingZhu || ''),
    career: String(parsed.career || ''),
    wealth: String(parsed.wealth || ''),
    love: String(parsed.love || ''),
    health: String(parsed.health || ''),
    currentPeriod: String(parsed.currentPeriod || ''),
    thisYear: String(parsed.thisYear || ''),
    advice: String(parsed.advice || ''),
    score: {
      career: Number.isFinite(score.career) ? Math.round(score.career) : 70,
      wealth: Number.isFinite(score.wealth) ? Math.round(score.wealth) : 70,
      love: Number.isFinite(score.love) ? Math.round(score.love) : 70,
      health: Number.isFinite(score.health) ? Math.round(score.health) : 70,
      overall: Number.isFinite(score.overall)
        ? Math.round(score.overall)
        : Math.round(
            (Number(score.career || 70) + Number(score.wealth || 70) + Number(score.love || 70) + Number(score.health || 70)) /
              4
          ),
    },
  };

  if (!normalized.mingZhu) return null;
  return normalized;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, gender, period: _period = '1y', name } = body;

    if (!year || !month || !day || hour === undefined || !gender) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const bazi = calculateBaZi(year, month, day, hour, gender);
    const detail = getBaziDetail(year, month, day, hour, gender);
    const daYun = calculateDaYun(year, month, day, hour, gender);
    const liuNian = calculateLiuNian(year, month, day, hour, gender);

    const baseScores = {
      career: 75,
      wealth: 72,
      love: 68,
      health: 80,
    };

    const kline = [];
    const currentYear = new Date().getFullYear();
    for (let m = 1; m <= 12; m++) {
      kline.push({
        time: `${currentYear}-${m.toString().padStart(2, '0')}`,
        label: `${currentYear}年${m}月`,
        open: 70 + Math.random() * 10,
        high: 80 + Math.random() * 10,
        low: 65 + Math.random() * 10,
        close: 72 + Math.random() * 8,
        volume: 1000,
        details: {
          career: 75,
          wealth: 72,
          love: 68,
          health: 80,
          overall: 74,
          analysis: '运势平稳',
          advice: '保持现状',
        },
      });
    }

    const aiAnalysis =
      (await generateAiAnalysis({
        name,
        gender,
        bazi,
        daYun,
        detail,
      })) || {
        mingZhu: `${detail?.日主 || bazi.riZhu}日主。性格多有主见，做事重逻辑与效率，宜在长期主义中稳步积累。`,
        career: `${currentYear}年前后适合深耕专业能力，抓住能被量化验证的机会，避免频繁换赛道。`,
        wealth: '以稳健为主，分散配置、控制杠杆，优先构建现金流与风险缓冲。',
        love: '感情宜慢热与沟通，重视边界与承诺，避免在压力期做冲动决定。',
        health: '保持规律作息，注意压力管理与基础代谢，建议每周固定运动。',
        currentPeriod: `当前大运节奏以“${daYun?.[0]?.ganZhi || '未知'}”起步，整体宜稳中求进。`,
        thisYear: `${currentYear}年整体起伏可控，关键在于节奏与执行，不宜过度冒进。`,
        advice: '1) 先做减法：砍掉低价值消耗\n2) 做可复利的事：技能/资产/关系\n3) 重大决策写下来，按数据复盘',
        score: {
          ...baseScores,
          overall: Math.round((baseScores.career + baseScores.wealth + baseScores.love + baseScores.health) / 4),
        },
      };

    return NextResponse.json({
      success: true,
      data: {
        bazi,
        detail,
        daYun,
        liuNian,
        baseScores,
        aiAnalysis: {
          mingZhu: aiAnalysis.mingZhu,
          career: aiAnalysis.career,
          wealth: aiAnalysis.wealth,
          love: aiAnalysis.love,
          health: aiAnalysis.health,
          currentPeriod: aiAnalysis.currentPeriod,
          thisYear: aiAnalysis.thisYear,
          advice: aiAnalysis.advice,
          score: {
            ...(aiAnalysis.score || baseScores),
            overall:
              aiAnalysis.score?.overall ??
              Math.round((baseScores.career + baseScores.wealth + baseScores.love + baseScores.health) / 4),
          },
        },
        kline,
        summary: {
          currentLuck: 74,
          trend: 'up',
          suggestion: aiAnalysis.advice,
          riZhu: detail?.日主 || bazi.riZhu,
          wuXing: bazi?.wuXing?.dayTG || '',
        },
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Generation failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: '人生K线 API',
    usage: 'POST /api/kline with {year, month, day, hour, gender, period}',
  });
}
