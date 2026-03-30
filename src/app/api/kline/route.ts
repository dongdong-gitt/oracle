import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi, calculateDaYun, calculateLiuNian, getBaziDetail, calculateBaziScore } from '@/app/lib/bazi';
import { generateLifeKLine, KLinePeriod } from '@/app/lib/lifeKLine';

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
  daYun: Array<{ age: number; ganZhi: string; 开始年份?: number; 结束年份?: number; 开始年龄?: number; 结束年龄?: number }>;
  detail: any;
  currentDaYun?: { age: number; ganZhi: string; 开始年份?: number; 结束年份?: number; 开始年龄?: number; 结束年龄?: number };
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  // 使用传入的当前大运，而不是默认第一个
  const currentDaYun = params.currentDaYun || params.daYun[0];
  const nextDaYun = params.daYun[params.daYun.indexOf(currentDaYun) + 1] || params.daYun[1];
  
  const prompt = `你是一位专业、克制且实用的八字命理顾问。请基于用户的八字与大运信息，生成"结构化 JSON"，用于前端展示。

用户信息：
- 性别：${params.gender === 'male' ? '男' : '女'}
- 姓名：${params.name || '未提供'}
- 八字：${params.bazi.year} ${params.bazi.month} ${params.bazi.day} ${params.bazi.hour}
- 日主：${params.detail?.日主 || params.bazi.riZhu}
- 当前年份：${currentYear}
- 当前大运：${currentDaYun?.开始年龄 || currentDaYun?.age}岁 ${currentDaYun?.ganZhi}大运 (${currentDaYun?.开始年份 || currentYear}-${currentDaYun?.结束年份 || currentYear + 10}年)
- 下一大运：${nextDaYun?.开始年龄 || nextDaYun?.age}岁 ${nextDaYun?.ganZhi}大运

输出要求：
- 只输出 JSON，不要 Markdown，不要多余文字
- 字段必须齐全：mingZhu, career, wealth, love, health, currentPeriod, thisYear, advice, score
- score 为 0-100 的整数：career, wealth, love, health, overall
- 文风：专业但易懂，避免绝对化断言，给出可执行建议

【currentPeriod 当前大运要求】：
- 必须包含：当前大运干支、年龄段(${currentDaYun?.开始年龄 || currentDaYun?.age}-${currentDaYun?.结束年龄 || (currentDaYun?.age || 0) + 10}岁)、天干十神、地支藏干分析
- 分析该大运对事业、财运、感情的整体影响
- 指出该大运的关键机遇和挑战
- 字数：150-200字
- 重要：用户当前${currentYear}年正处于${currentDaYun?.ganZhi}大运（${currentDaYun?.开始年龄 || currentDaYun?.age}-${currentDaYun?.结束年龄 || (currentDaYun?.age || 0) + 10}岁），不是第一个大运

【thisYear 今年流年要求】：
- 必须包含：流年干支、与日主的关系、与大运的关系
- 详细分析事业、财运、感情、健康四个维度
- 指出今年的关键月份和注意事项
- 字数：200-250字

【advice 综合建议要求】：
- 必须包含6条建议：事业、财务、情感、健康、人际、投资
- 每条建议要具体可执行，避免空话
- 格式："1. 事业：具体内容\\n2. 财务：具体内容\\n3. 情感：具体内容\\n4. 健康：具体内容\\n5. 人际：具体内容\\n6. 投资：具体内容"

JSON 结构示例：
{
  "mingZhu": "庚金日主，生于子月，水旺金沉...",
  "career": "...",
  "wealth": "...",
  "love": "...",
  "health": "...",
  "currentPeriod": "当前正行乙酉大运（27-36岁）。大运地支酉金为日主强根，能一定程度帮身，事业财运较前运有起色。天干乙木正财合身，求财辛苦，易有财务压力或合作分利之事。此运是积累实力、明确方向的重要时期，宜稳扎稳打，不宜冒进。",
  "thisYear": "${currentYear}丙午年，流年干支皆为火，官杀旺而克身。事业上压力与机遇并存，易有新的任务、挑战或岗位变动，需全力以赴应对。财运上花费较多，投资需谨慎，避免冲动消费。感情上，官杀生印，利于通过长辈介绍或正式场合结识缘分。健康上，火旺克金，需注意心肺过劳、炎症等问题，夏季尤其注意防暑。",
  "advice": "1. 事业：聚焦核心技能，在专业领域建立不可替代性，避免分散精力\\n2. 财务：${currentYear}年以守成为主，强制储蓄，谨慎对待借贷与高风险投资\\n3. 情感：主动参与社交，但勿急于求成，培养共同兴趣是感情升温的良方\\n4. 健康：制定规律的锻炼计划，重点强化心肺功能，夏季注意防暑降温\\n5. 人际：多结交年长贵人，避免与小人纠缠，职场保持低调务实\\n6. 投资：优先选择稳健型理财产品，股票控制在总资产的30%以内",
  "score": { "career": 70, "wealth": 65, "love": 75, "health": 68, "overall": 70 }
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

    // 使用算法计算评分（基于八字五行、十神、大运）
    const currentDaYun = daYun.find((d: any) => {
      const currentYear = new Date().getFullYear();
      return d.开始年份 <= currentYear && d.结束年份 >= currentYear;
    });
    const algorithmScores = calculateBaziScore(detail, currentDaYun);
    
    const baseScores = {
      career: algorithmScores.career,
      wealth: algorithmScores.wealth,
      love: algorithmScores.love,
      health: algorithmScores.health,
      overall: algorithmScores.overall,
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

    let aiAnalysis = await generateAiAnalysis({
      name,
      gender,
      bazi,
      daYun,
      detail,
      currentDaYun,
    });

    if (!aiAnalysis) {
      aiAnalysis = {
        mingZhu: `${detail?.日主 || bazi.riZhu}日主。性格多有主见，做事重逻辑与效率，宜在长期主义中稳步积累。`,
        career: `${currentYear}年前后适合深耕专业能力，抓住能被量化验证的机会，避免频繁换赛道。`,
        wealth: '以稳健为主，分散配置、控制杠杆，优先构建现金流与风险缓冲。',
        love: '感情宜慢热与沟通，重视边界与承诺，避免在压力期做冲动决定。',
        health: '保持规律作息，注意压力管理与基础代谢，建议每周固定运动。',
        currentPeriod: `当前正行${currentDaYun?.ganZhi || '未知'}大运（${currentDaYun?.开始年龄}-${currentDaYun?.结束年龄}岁）。大运地支${currentDaYun?.ganZhi?.[1] || ''}金为日主强根，能一定程度帮身，事业财运较前运有起色。`,
        thisYear: `${currentYear}年整体起伏可控，关键在于节奏与执行，不宜过度冒进。`,
        advice: '1. 事业：聚焦核心技能，在专业领域建立不可替代性\n2. 财务：以守成为主，强制储蓄，谨慎对待高风险投资\n3. 情感：主动参与社交，但勿急于求成\n4. 健康：制定规律的锻炼计划，重点强化心肺功能\n5. 人际：多结交年长贵人，避免与小人纠缠\n6. 投资：优先选择稳健型理财产品',
        score: baseScores,
      };
    } else {
      // 强制使用算法计算的分数，覆盖DeepSeek返回的分数
      aiAnalysis.score = { ...baseScores };
    }

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
          score: baseScores, // 始终使用算法计算的分数
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

// 新增：人生K线生成接口（真实八字版）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const period = (searchParams.get('period') || '1y') as KLinePeriod;
  const birthYear = parseInt(searchParams.get('birthYear') || '1995');
  const birthMonth = parseInt(searchParams.get('birthMonth') || '12');
  const birthDay = parseInt(searchParams.get('birthDay') || '25');
  const birthHour = parseInt(searchParams.get('birthHour') || '10');
  const gender = (searchParams.get('gender') || 'male') as 'male' | 'female';
  const targetYear = parseInt(searchParams.get('targetYear') || new Date().getFullYear().toString());
  const targetMonth = parseInt(searchParams.get('targetMonth') || (new Date().getMonth() + 1).toString());
  const targetDay = parseInt(searchParams.get('targetDay') || new Date().getDate().toString());
  
  try {
    // 使用复杂版八字计算（层层联动）
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

// 真实八字K线生成（优化版）
function generateRealKLine(
  period: KLinePeriod,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: 'male' | 'female',
  targetYear: number,
  targetMonth: number,
  targetDay: number
) {
  // 获取八字基础数据
  const detail = getBaziDetail(birthYear, birthMonth, birthDay, birthHour, gender);
  const analysis = analyzeBaziComplete(detail);
  const baseScore = analysis.scores.overall; // 使用八字综合分作为基础
  
  const kline: any[] = [];
  
  if (period === '1d') {
    // 12个时辰 - 基于八字日柱和时辰计算
    const shichen = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const shiEffects = [0, -2, 2, 3, 1, -1, -3, -2, 2, 4, 1, -1]; // 时辰对日主的影响
    
    for (let i = 0; i < 12; i++) {
      const effect = shiEffects[i];
      const score = Math.max(0, Math.min(100, baseScore + effect + (Math.random() - 0.5) * 5));
      
      kline.push({
        time: `${targetYear}-${targetMonth}-${targetDay} ${shichen[i]}时`,
        label: `${shichen[i]}时`,
        open: Math.round(score * 10) / 10,
        high: Math.round(score * 10) / 10,
        low: Math.round(score * 10) / 10,
        close: Math.round(score * 10) / 10,
        volume: 0,
        details: {
          career: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 4))),
          wealth: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 4))),
          love: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 4))),
          health: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 4))),
          overall: Math.round(score),
        },
      });
    }
  } else if (period === '1m') {
    // 30天 - 基于流月计算
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const monthEffect = (targetMonth % 12) - 6; // 月令影响
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dayEffect = (d % 10) - 5;
      const score = Math.max(0, Math.min(100, baseScore + monthEffect + dayEffect * 0.5 + (Math.random() - 0.5) * 3));
      
      kline.push({
        time: `${targetYear}-${targetMonth}-${d}`,
        label: `${d}日`,
        open: Math.round((score - 2) * 10) / 10,
        high: Math.round((score + 3) * 10) / 10,
        low: Math.round((score - 3) * 10) / 10,
        close: Math.round(score * 10) / 10,
        volume: Math.round(Math.random() * 100),
        details: {
          career: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 5))),
          wealth: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 5))),
          love: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 5))),
          health: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 5))),
          overall: Math.round(score),
        },
      });
    }
  } else if (period === '1y') {
    // 12个月 - 基于流年计算
    const yearGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][(targetYear - 4) % 10];
    const yearEffect = yearGan === '丙' || yearGan === '丁' ? -5 : yearGan === '庚' || yearGan === '辛' ? 5 : 0;
    
    for (let m = 1; m <= 12; m++) {
      const monthEffect = (m % 12) - 6;
      const score = Math.max(0, Math.min(100, baseScore + yearEffect + monthEffect + (Math.random() - 0.5) * 4));
      
      kline.push({
        time: `${targetYear}-${m}`,
        label: `${m}月`,
        open: Math.round((score - 3) * 10) / 10,
        high: Math.round((score + 5) * 10) / 10,
        low: Math.round((score - 5) * 10) / 10,
        close: Math.round(score * 10) / 10,
        volume: Math.round(Math.random() * 1000),
        details: {
          career: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 6))),
          wealth: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 6))),
          love: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 6))),
          health: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 6))),
          overall: Math.round(score),
        },
      });
    }
  } else {
    // 80年 - 基于大运和流年计算
    const daYun = calculateDaYun(birthYear, birthMonth, birthDay, birthHour, gender);
    const startYear = birthYear + 7; // 7岁起运
    
    for (let y = startYear; y < startYear + 80; y++) {
      // 找当前大运
      const currentDaYun = daYun.find((d: any) => y >= d.开始年份 && y <= d.结束年份);
      const daYunEffect = currentDaYun ? (currentDaYun.ganZhi[0] === '乙' ? 5 : currentDaYun.ganZhi[0] === '丙' ? -3 : 0) : 0;
      
      const yearGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][(y - 4) % 10];
      const yearEffect = yearGan === '丙' || yearGan === '丁' ? -5 : yearGan === '庚' || yearGan === '辛' ? 5 : 0;
      
      const score = Math.max(0, Math.min(100, baseScore + daYunEffect + yearEffect + (Math.random() - 0.5) * 5));
      
      kline.push({
        time: `${y}`,
        label: `${y}年`,
        open: Math.round((score - 5) * 10) / 10,
        high: Math.round((score + 8) * 10) / 10,
        low: Math.round((score - 8) * 10) / 10,
        close: Math.round(score * 10) / 10,
        volume: Math.round(Math.random() * 10000),
        details: {
          career: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 8))),
          wealth: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 8))),
          love: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 8))),
          health: Math.round(Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 8))),
          overall: Math.round(score),
        },
      });
    }
    
    // 调整使80年平均等于八字综合分
    const currentAvg = kline.reduce((a, b) => a + b.close, 0) / kline.length;
    const adjustment = baseScore - currentAvg;
    
    for (const item of kline) {
      const adjustedClose = Math.max(0, Math.min(100, item.close + adjustment));
      item.close = Math.round(adjustedClose * 10) / 10;
      item.open = Math.round(Math.max(0, Math.min(100, item.open + adjustment)) * 10) / 10;
      item.high = Math.round(Math.max(0, Math.min(100, item.high + adjustment)) * 10) / 10;
      item.low = Math.round(Math.max(0, Math.min(100, item.low + adjustment)) * 10) / 10;
      item.details.overall = Math.round(adjustedClose);
    }
  }
  
  return kline;
}


