import { NextRequest, NextResponse } from 'next/server';

type ScoreShape = {
  career: number;
  wealth: number;
  love: number;
  health: number;
  overall: number;
};

type ShiChenPoint = {
  time: string;
  score: number;
};

type DailyGuidancePayload = {
  date: string;
  lunar: string;
  guidance: string;
  master: string;
  detail: string;
  yi: string[];
  ji: string[];
  yongShen: string;
  jiShen: string;
  score: ScoreShape;
  shiChen: ShiChenPoint[];
  source: 'fallback' | 'deepseek';
};

type DeepseekMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const globalForGuidance = globalThis as typeof globalThis & {
  __oracleDailyGuidanceCache?: Map<string, { expiresAt: number; data: DailyGuidancePayload }>;
  __oracleDailyGuidanceInflight?: Map<string, Promise<DailyGuidancePayload>>;
};

const dailyGuidanceCache = globalForGuidance.__oracleDailyGuidanceCache ?? new Map<string, { expiresAt: number; data: DailyGuidancePayload }>();
const dailyGuidanceInflight = globalForGuidance.__oracleDailyGuidanceInflight ?? new Map<string, Promise<DailyGuidancePayload>>();
globalForGuidance.__oracleDailyGuidanceCache = dailyGuidanceCache;
globalForGuidance.__oracleDailyGuidanceInflight = dailyGuidanceInflight;

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function toDateLabel(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}年${m}月${d}日`;
}

function toLunarPlaceholder(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `农历参考 ${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function sortedAxes(score: ScoreShape) {
  const rows = [
    { key: '事业', value: Number(score.career || 0) },
    { key: '财务', value: Number(score.wealth || 0) },
    { key: '感情', value: Number(score.love || 0) },
    { key: '健康', value: Number(score.health || 0) },
  ];
  rows.sort((a, b) => b.value - a.value);
  return rows;
}

function buildFallback(input: {
  date: Date;
  score: ScoreShape;
  shiChen: ShiChenPoint[];
  yongShen: string;
  jiShen: string;
}): DailyGuidancePayload {
  const topBottom = sortedAxes(input.score);
  const strongest = topBottom[0];
  const weakest = topBottom[topBottom.length - 1];

  const sortedShiChen = [...input.shiChen].sort((a, b) => b.score - a.score);
  const best = sortedShiChen[0];
  const weak = sortedShiChen[sortedShiChen.length - 1];

  let guidance = '稳中求进';
  if (input.score.overall >= 80) guidance = '顺势进攻';
  else if (input.score.overall < 50) guidance = '先守后攻';

  const yi = input.score.overall >= 70
    ? ['推进关键任务', '复盘收益来源', '分批执行计划', '高质量沟通']
    : input.score.overall >= 55
      ? ['保持主线节奏', '控制仓位风险', '优化作息状态', '记录执行结果']
      : ['减杠杆降风险', '清理低效事务', '修复睡眠体能', '减少冲动决策'];

  const ji = input.score.overall >= 70
    ? ['追涨重仓', '短线情绪化交易', '无计划熬夜']
    : input.score.overall >= 55
      ? ['频繁换方向', '超预算开支', '过度社交消耗']
      : ['冲动加仓', '高压硬扛', '情绪化争执', '透支身体'];

  const detail = [
    `今日综合分 ${input.score.overall}，${strongest.key}相对占优(${strongest.value})，${weakest.key}需要重点补位(${weakest.value})。`,
    best ? `节奏上可把关键动作放在 ${best.time}（${best.score}分）附近执行。` : '',
    weak ? `${weak.time}（${weak.score}分）建议降低高风险决策强度。` : '',
    `用神偏向「${input.yongShen || '未设'}」，忌神关注「${input.jiShen || '未设'}」，执行上优先“先风控、后放大”。`,
  ].filter(Boolean).join('');

  return {
    date: toDateLabel(input.date),
    lunar: toLunarPlaceholder(input.date),
    guidance,
    master: '统一周期引擎',
    detail,
    yi,
    ji,
    yongShen: input.yongShen || '未设',
    jiShen: input.jiShen || '未设',
    score: {
      career: Math.round(clamp(input.score.career)),
      wealth: Math.round(clamp(input.score.wealth)),
      love: Math.round(clamp(input.score.love)),
      health: Math.round(clamp(input.score.health)),
      overall: Math.round(clamp(input.score.overall)),
    },
    shiChen: input.shiChen,
    source: 'fallback',
  };
}

function tryParseJsonObject(text: string) {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first < 0 || last < 0 || last <= first) return null;
  try {
    return JSON.parse(text.slice(first, last + 1));
  } catch {
    return null;
  }
}

function sanitizeArray(value: unknown, fallback: string[], minLen: number, maxLen: number) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, maxLen);

  if (cleaned.length >= minLen) return cleaned;
  return fallback.slice(0, maxLen);
}

async function generateWithDeepSeek(input: {
  fallback: DailyGuidancePayload;
  dateIso: string;
}): Promise<DailyGuidancePayload | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  const prompt =
    `请根据输入的“当日评分与12时辰数据”输出一段中文日运建议。\n` +
    `要求：\n` +
    `1) 仅输出 JSON，不要 markdown。\n` +
    `2) 字段必须包含 guidance, master, detail, yi, ji。\n` +
    `3) yi 输出 4-6 条，ji 输出 3-5 条，必须是可执行动作。\n` +
    `4) 文字必须紧扣输入分数，不可随机发挥，不要改写日期年份。\n\n` +
    `输入数据：\n${JSON.stringify({
      date: input.dateIso,
      score: input.fallback.score,
      yongShen: input.fallback.yongShen,
      jiShen: input.fallback.jiShen,
      shiChen: input.fallback.shiChen,
      fallbackHint: {
        strongest: sortedAxes(input.fallback.score)[0]?.key,
        weakest: sortedAxes(input.fallback.score).slice(-1)[0]?.key,
      },
    })}`;

  const messages: DeepseekMessage[] = [
    {
      role: 'system',
      content: '你是一个结构化输出引擎，必须严格输出合法 JSON。',
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
      temperature: 0.35,
      max_tokens: 900,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json().catch(() => null);
  const content: string = data?.choices?.[0]?.message?.content || '';
  const parsed = tryParseJsonObject(content);
  if (!parsed) return null;

  return {
    ...input.fallback,
    guidance: String(parsed.guidance || input.fallback.guidance),
    master: String(parsed.master || input.fallback.master),
    detail: String(parsed.detail || input.fallback.detail),
    yi: sanitizeArray(parsed.yi, input.fallback.yi, 4, 6),
    ji: sanitizeArray(parsed.ji, input.fallback.ji, 3, 5),
    source: 'deepseek',
  };
}

function buildCacheKey(input: {
  dateIso: string;
  score: ScoreShape;
  yongShen: string;
  jiShen: string;
  shiChen: ShiChenPoint[];
  birth?: {
    birthYear?: number;
    birthMonth?: number;
    birthDay?: number;
    birthHour?: number;
    gender?: string;
  };
}) {
  const b = input.birth || {};
  const profile = `${b.birthYear || 0}-${b.birthMonth || 0}-${b.birthDay || 0}-${b.birthHour || 0}-${b.gender || 'na'}`;
  const rhythm = input.shiChen.map((item) => `${item.time}:${item.score}`).join('|');
  return `${profile}-${input.dateIso}-${input.score.overall}-${input.yongShen}-${input.jiShen}-${rhythm}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dateRaw = String(body?.date || '');
    const score = body?.score as ScoreShape;
    const shiChen = Array.isArray(body?.shiChen)
      ? body.shiChen
          .map((item: any) => ({ time: String(item?.time || ''), score: Number(item?.score || 0) }))
          .filter((item: ShiChenPoint) => item.time && Number.isFinite(item.score))
      : [];

    const date = new Date(dateRaw);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid date' }, { status: 400 });
    }

    if (!score || !Number.isFinite(Number(score.overall)) || shiChen.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing score or shichen data' }, { status: 400 });
    }

    const normalizedScore: ScoreShape = {
      career: clamp(Number(score.career || 0), 0, 100),
      wealth: clamp(Number(score.wealth || 0), 0, 100),
      love: clamp(Number(score.love || 0), 0, 100),
      health: clamp(Number(score.health || 0), 0, 100),
      overall: clamp(Number(score.overall || 0), 0, 100),
    };

    const yongShen = String(body?.yongShen || '');
    const jiShen = String(body?.jiShen || '');
    const dateIso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const fallback = buildFallback({
      date,
      score: normalizedScore,
      shiChen,
      yongShen,
      jiShen,
    });

    const key = buildCacheKey({
      dateIso,
      score: normalizedScore,
      yongShen,
      jiShen,
      shiChen,
      birth: body?.birth,
    });

    const cached = dailyGuidanceCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ success: true, data: cached.data });
    }

    const pending = dailyGuidanceInflight.get(key);
    if (pending) {
      const data = await pending;
      return NextResponse.json({ success: true, data });
    }

    const task = (async () => {
      const ai = await generateWithDeepSeek({ fallback, dateIso }).catch(() => null);
      const data = ai || fallback;
      dailyGuidanceCache.set(key, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        data,
      });
      return data;
    })();

    dailyGuidanceInflight.set(key, task);

    try {
      const data = await task;
      return NextResponse.json({ success: true, data });
    } finally {
      dailyGuidanceInflight.delete(key);
    }
  } catch (error) {
    console.error('daily guidance error:', error);
    return NextResponse.json({ success: false, error: 'Daily guidance generation failed' }, { status: 500 });
  }
}
