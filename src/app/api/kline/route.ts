import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeBaziComplete,
  calculateBaZi,
  calculateBaziScore,
  calculateDaYun,
  calculateLiuNian,
  getBaziDetail,
} from '@/app/lib/bazi';
import { generateLifeKLine, KLineData, KLinePeriod } from '@/app/lib/lifeKLine';

type Gender = 'male' | 'female';
type ScoreShape = { career: number; wealth: number; love: number; health: number; overall: number };
type AiAnalysisShape = {
  mingZhu: string;
  career: string;
  wealth: string;
  love: string;
  health: string;
  currentPeriod: string;
  thisYear: string;
  advice: string;
  score: ScoreShape;
};
type DeepseekMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_TIMEOUT_MS = 6000;
const MIN_ADVICE_ITEMS = 6;
const MAX_ADVICE_ITEMS = 6;
const AI_YEAR_SPAN = 80;
const YEARLY_AI_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

type YearlyScore = ScoreShape & { year: number };
type YearlyScoreCacheEntry = { expiresAt: number; data: YearlyScore[] };

const globalForYearlyAi = globalThis as typeof globalThis & {
  __oracleYearlyScoreCache?: Map<string, YearlyScoreCacheEntry>;
  __oracleYearlyScoreInflight?: Map<string, Promise<YearlyScore[]>>;
};

const yearlyScoreCache = globalForYearlyAi.__oracleYearlyScoreCache ?? new Map<string, YearlyScoreCacheEntry>();
const yearlyScoreInflight = globalForYearlyAi.__oracleYearlyScoreInflight ?? new Map<string, Promise<YearlyScore[]>>();
globalForYearlyAi.__oracleYearlyScoreCache = yearlyScoreCache;
globalForYearlyAi.__oracleYearlyScoreInflight = yearlyScoreInflight;

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

function tryParseJsonArray(text: string) {
  const first = text.indexOf('[');
  const last = text.lastIndexOf(']');
  if (first < 0 || last < 0 || last <= first) return null;
  try {
    return JSON.parse(text.slice(first, last + 1));
  } catch {
    return null;
  }
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function weightedOverall(score: Omit<ScoreShape, 'overall'> | ScoreShape) {
  return Math.round(score.career * 0.3 + score.wealth * 0.25 + score.love * 0.25 + score.health * 0.2);
}

function safeNumber(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function extractYear(value: unknown) {
  const text = String(value || '');
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function getCandleYear(item: Pick<KLineData, 'time' | 'label' | 'year'>, period: KLinePeriod, targetYear: number) {
  if (Number.isFinite(Number(item.year))) return Number(item.year);
  if (period === '1d' || period === '1m' || period === '1y') return targetYear;
  return extractYear(item.time) ?? extractYear(item.label) ?? targetYear;
}

function buildYearlyCacheKey(input: {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender: Gender;
}) {
  return `${input.birthYear}-${input.birthMonth}-${input.birthDay}-${input.birthHour}-${input.gender}`;
}

function parseYearlyScoresFromDeepseek(content: string, baseline: YearlyScore[]) {
  const fromObject = tryParseJsonObject(content);
  const fromArray = tryParseJsonArray(content);
  const candidateRaw = Array.isArray(fromObject?.years)
    ? fromObject.years
    : Array.isArray(fromObject?.data)
      ? fromObject.data
      : Array.isArray(fromArray)
        ? fromArray
        : [];

  const byYear = new Map<number, any>();
  for (const item of candidateRaw) {
    if (!item || typeof item !== 'object') continue;
    const year = safeNumber((item as any).year, NaN);
    if (!Number.isFinite(year)) continue;
    byYear.set(year, item);
  }

  return baseline.map((base) => {
    const item = byYear.get(base.year) || {};
    const career = Math.round(clamp(safeNumber(item.career, base.career), Math.max(20, base.career - 12), Math.min(98, base.career + 12)));
    const wealth = Math.round(clamp(safeNumber(item.wealth, base.wealth), Math.max(20, base.wealth - 12), Math.min(98, base.wealth + 12)));
    const love = Math.round(clamp(safeNumber(item.love, base.love), Math.max(20, base.love - 12), Math.min(98, base.love + 12)));
    const health = Math.round(clamp(safeNumber(item.health, base.health), Math.max(20, base.health - 12), Math.min(98, base.health + 12)));
    const computedOverall = weightedOverall({ career, wealth, love, health });
    const expectedOverall = safeNumber(item.overall, computedOverall);
    const overall = Math.round(clamp(expectedOverall, computedOverall - 5, computedOverall + 5));

    return { year: base.year, career, wealth, love, health, overall };
  });
}

function mapAllPeriodToYearlyScores(klineAll: KLineData[], birthYear: number) {
  const firstYear = Math.max(
    birthYear + 1,
    Number.isFinite(Number(klineAll[0]?.year)) ? Number(klineAll[0]?.year) : extractYear(klineAll[0]?.time) || birthYear + 1
  );
  return klineAll.slice(0, AI_YEAR_SPAN).map((item, index) => {
    const year = Number.isFinite(Number(item?.year)) ? Number(item.year) : extractYear(item.time) ?? firstYear + index;
    const details = item.details || {
      career: safeNumber(item.close, 70),
      wealth: safeNumber(item.close, 70),
      love: safeNumber(item.close, 70),
      health: safeNumber(item.close, 70),
      overall: safeNumber(item.close, 70),
    };
    return {
      year,
      career: Math.round(clamp(safeNumber(details.career, 70), 20, 98)),
      wealth: Math.round(clamp(safeNumber(details.wealth, 70), 20, 98)),
      love: Math.round(clamp(safeNumber(details.love, 70), 20, 98)),
      health: Math.round(clamp(safeNumber(details.health, 70), 20, 98)),
      overall: Math.round(clamp(safeNumber(details.overall, item.close), 20, 98)),
    };
  });
}

async function generateDeepseekYearlyScores(params: {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender: Gender;
  baseline: YearlyScore[];
  riZhu: string;
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return params.baseline;

  const baselineText = params.baseline
    .map((item) => `${item.year}: overall=${item.overall}, career=${item.career}, wealth=${item.wealth}, love=${item.love}, health=${item.health}`)
    .join('\n');

  const prompt =
    `你是命理+量化评分引擎。请根据给定命盘信息，对未来80年每个流年的四维分和综合分进行校准。\n` +
    `要求：\n` +
    `1) 必须严格返回 JSON，不要 markdown。\n` +
    `2) 输出 years 数组，长度必须是 ${params.baseline.length}，并且 year 必须和输入年份一一对应。\n` +
    `3) 每个分数为 20-98 的整数。\n` +
    `4) 分数不要随机，保持年度变化平滑，单年 overall 相对基线偏移不超过 ±12。\n` +
    `5) overall 与 career/wealth/love/health 保持一致，接近加权公式：0.3/0.25/0.25/0.2。\n\n` +
    `命盘信息：\n` +
    `- 性别: ${params.gender === 'male' ? '男' : '女'}\n` +
    `- 出生: ${params.birthYear}-${params.birthMonth}-${params.birthDay} ${params.birthHour}:00\n` +
    `- 日主: ${params.riZhu || '未知'}\n\n` +
    `80年基线：\n${baselineText}\n\n` +
    `返回格式示例：\n` +
    `{"years":[{"year":2027,"career":72,"wealth":69,"love":67,"health":70,"overall":70}]}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEEPSEEK_TIMEOUT_MS);

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是严格的结构化评分引擎，只输出合法 JSON。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 3500,
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) return params.baseline;
  const data = await response.json().catch(() => null);
  const content: string = data?.choices?.[0]?.message?.content || '';
  if (!content) return params.baseline;

  return parseYearlyScoresFromDeepseek(content, params.baseline);
}

async function getYearlyScoresWithCache(params: {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender: Gender;
  baseline: YearlyScore[];
  riZhu: string;
}) {
  const key = buildYearlyCacheKey({
    birthYear: params.birthYear,
    birthMonth: params.birthMonth,
    birthDay: params.birthDay,
    birthHour: params.birthHour,
    gender: params.gender,
  });

  const cached = yearlyScoreCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const pending = yearlyScoreInflight.get(key);
  if (pending) return pending;

  const task = (async () => {
    const data = await generateDeepseekYearlyScores(params).catch(() => params.baseline);
    yearlyScoreCache.set(key, {
      expiresAt: Date.now() + YEARLY_AI_CACHE_TTL_MS,
      data,
    });
    return data;
  })();

  yearlyScoreInflight.set(key, task);
  try {
    return await task;
  } finally {
    yearlyScoreInflight.delete(key);
  }
}

function applyYearlyCalibration(params: {
  source: KLineData[];
  period: KLinePeriod;
  targetYear: number;
  baselineAll: YearlyScore[];
  aiAll: YearlyScore[];
}) {
  const baselineByYear = new Map(params.baselineAll.map((item) => [item.year, item]));
  const aiByYear = new Map(params.aiAll.map((item) => [item.year, item]));

  return params.source.map((item) => {
    const year = getCandleYear(item, params.period, params.targetYear);
    const baseYear = baselineByYear.get(year);
    const aiYear = aiByYear.get(year);
    if (!baseYear || !aiYear) return item;

    const deltaOverall = aiYear.overall - baseYear.overall;
    const normalizePrice = (value: number) => round1(clamp(value + deltaOverall, 0, 100));
    const open = normalizePrice(item.open);
    const close = normalizePrice(item.close);
    const rawHigh = normalizePrice(item.high);
    const rawLow = normalizePrice(item.low);
    const high = Math.max(rawHigh, open, close);
    const low = Math.min(rawLow, open, close);

    const details = item.details
      ? (() => {
          const career = Math.round(clamp(item.details!.career + (aiYear.career - baseYear.career), 0, 100));
          const wealth = Math.round(clamp(item.details!.wealth + (aiYear.wealth - baseYear.wealth), 0, 100));
          const love = Math.round(clamp(item.details!.love + (aiYear.love - baseYear.love), 0, 100));
          const health = Math.round(clamp(item.details!.health + (aiYear.health - baseYear.health), 0, 100));
          const overall = weightedOverall({ career, wealth, love, health });
          return { career, wealth, love, health, overall };
        })()
      : {
          career: aiYear.career,
          wealth: aiYear.wealth,
          love: aiYear.love,
          health: aiYear.health,
          overall: aiYear.overall,
        };

    const volatility = Math.max(1, high - low);
    const volume = Math.round(volatility * 100 + Math.abs(close - open) * 60);

    return { ...item, open, high: round1(high), low: round1(low), close, volume, details };
  });
}

function buildCanonicalScoresFromAll(klineAll: KLineData[], fallback: ScoreShape) {
  if (!klineAll.length) return fallback;

  const hasDetails = klineAll.some((item) => item.details);
  if (!hasDetails) {
    const overall = Math.round(klineAll.reduce((sum, item) => sum + safeNumber(item.close, fallback.overall), 0) / klineAll.length);
    return { ...fallback, overall };
  }

  const average = (selector: (item: KLineData) => number, fb: number) =>
    Math.round(klineAll.reduce((sum, item) => sum + selector(item), 0) / klineAll.length || fb);

  const career = average((item) => safeNumber(item.details?.career, fallback.career), fallback.career);
  const wealth = average((item) => safeNumber(item.details?.wealth, fallback.wealth), fallback.wealth);
  const love = average((item) => safeNumber(item.details?.love, fallback.love), fallback.love);
  const health = average((item) => safeNumber(item.details?.health, fallback.health), fallback.health);
  const overallFromClose = average((item) => safeNumber(item.close, fallback.overall), fallback.overall);
  const overallByWeight = weightedOverall({ career, wealth, love, health });
  const overall = Math.round((overallFromClose + overallByWeight) / 2);

  return { career, wealth, love, health, overall };
}

function relinkCandlesWithPrevClose(source: KLineData[]) {
  if (!Array.isArray(source) || source.length <= 1) return source;

  const output = source.map((item) => ({ ...item }));
  for (let i = 1; i < output.length; i += 1) {
    const prevClose = safeNumber(output[i - 1]?.close, output[i].open);
    const close = safeNumber(output[i].close, prevClose);
    const open = round1(prevClose);
    const high = round1(Math.max(safeNumber(output[i].high, close), open, close));
    const low = round1(Math.min(safeNumber(output[i].low, close), open, close));
    const volatility = Math.max(1, high - low);
    const volume = Math.round(volatility * 100 + Math.abs(close - open) * 60);
    output[i] = { ...output[i], open, high, low, volume };
  }

  return output;
}

function buildDefaultAdvice(currentYear: number, scores: ScoreShape) {
  const sortedWeak = [
    { key: '事业', score: scores.career },
    { key: '财务', score: scores.wealth },
    { key: '关系', score: scores.love },
    { key: '健康', score: scores.health },
  ]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map((item) => `${item.key}(${item.score})`)
    .join('、');

  return [
    `事业：${currentYear}年把重点放在“单主线深耕”，围绕一个最有复利潜力的方向做季度目标拆解，每周复盘一次进度和阻塞点，避免频繁换方向导致沉没成本。`,
    `财务：先建立预算-执行-复盘闭环，优先保证6个月应急缓冲，再进行风险投资；尤其在${sortedWeak}阶段，所有新增仓位都要写清楚止损与退出条件。`,
    '感情：重要关系中先确认边界、时间投入和现实预期，再讨论情绪与承诺；出现分歧时先对齐事实再表达立场，减少误判与反复内耗。',
    '健康：把睡眠、运动、压力管理作为基础盘，建议每周至少3次中低强度运动+固定作息窗口；先追求稳定连续，再逐步提高强度与效率。',
    '人际：筛选高质量合作关系，减少低价值应酬与无效社交；把关键沟通前置并形成清单，优先维护能长期互助、能共同成长的关系网络。',
    '投资：坚持“先防守后进攻”，先看胜率与回撤控制，再看收益放大；连续失误时先降风险敞口，暂停情绪化加码，待策略验证后再恢复节奏。',
  ]
    .slice(0, MAX_ADVICE_ITEMS)
    .map((line, i) => `${i + 1}. ${line}`)
    .join('\n');
}

function ensureLongAdvice(rawAdvice: string, currentYear: number, scores: ScoreShape) {
  const cleaned = String(rawAdvice || '')
    .replace(/\r/g, '\n')
    .replace(/\*\*/g, '')
    .replace(/[•●·]/g, '')
    .trim();

  const chunks = cleaned.includes('\n') ? cleaned.split(/\n+/) : cleaned.split(/(?=\d{1,2}[\.、\)]\s*)/);
  const lines = chunks
    .map((line) => line.replace(/^\d{1,2}[\.、\)]\s*/, '').trim())
    .filter(Boolean);

  const defaults = buildDefaultAdvice(currentYear, scores)
    .split('\n')
    .map((line) => line.replace(/^\d{1,2}[\.、\)]\s*/, '').trim());
  const topicOrder = ['事业', '财务', '感情', '健康', '人际', '投资'];

  const merged = [...lines];
  for (const item of defaults) {
    if (merged.length >= MAX_ADVICE_ITEMS) break;
    merged.push(item);
  }

  while (merged.length < MIN_ADVICE_ITEMS) {
    merged.push('保持稳定执行节奏，先守住底线，再逐步放大优势，并用周复盘持续优化策略。');
  }

  const normalized = merged.slice(0, MAX_ADVICE_ITEMS).map((line, i) => {
    const base = String(line || '').trim();
    const fallback = defaults[i] || defaults[0];
    const withTopic = /^(事业|财务|感情|健康|人际|投资)[：:]/.test(base)
      ? base
      : `${topicOrder[i]}：${base}`;

    if (withTopic.length < 34) return fallback;
    return withTopic;
  });

  return normalized
    .map((line, i) => `${i + 1}. ${line}`)
    .join('\n');
}
async function generateDeepseekAiAnalysis(params: {
  bazi: any;
  detail: any;
  currentDaYun: any;
  currentYear: number;
  baseScores: ScoreShape;
  gender: Gender;
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  const riZhu = params.detail?.日主 || params.bazi?.riZhu || '未知';
  const currentDaYunName = params.currentDaYun?.ganZhi || '当前大运';
  const startAge = Number(params.currentDaYun?.age);
  const endAge = Number.isFinite(startAge) ? startAge + 9 : '-';

  const prompt =
    `你是专业命理顾问，请只输出 JSON（不要 Markdown、不要额外解释）。\n\n` +
    `用户信息：\n` +
    `- 性别：${params.gender === 'male' ? '男' : '女'}\n` +
    `- 八字：${params.bazi?.year || ''} ${params.bazi?.month || ''} ${params.bazi?.day || ''} ${params.bazi?.hour || ''}\n` +
    `- 日主：${riZhu}\n` +
    `- 当前年份：${params.currentYear}\n` +
    `- 当前大运：${currentDaYunName}（约${startAge}-${endAge}岁）\n\n` +
    `输出字段必须完整：mingZhu, career, wealth, love, health, currentPeriod, thisYear, advice, score。\n` +
    `硬性要求：\n` +
    `1) thisYear 必须围绕 ${params.currentYear} 年，不要写成其他年份。\n` +
    `2) advice 必须严格输出 6 条连续编号建议（1. 2. 3. 4. 5. 6.）。\n` +
    `3) 六条建议必须分别对应：事业、财务、感情、健康、人际、投资；每条不少于 40 个中文字符，并给出可执行动作。\n` +
    `4) score 输出 0-100 的整数，但最终以前端传入评分为准。\n\n` +
    `JSON 示例：\n` +
    `{"mingZhu":"...","career":"...","wealth":"...","love":"...","health":"...","currentPeriod":"...","thisYear":"...","advice":"1. ...\\n2. ...","score":{"career":70,"wealth":70,"love":70,"health":70,"overall":70}}`;

  const messages: DeepseekMessage[] = [
    {
      role: 'system',
      content: '你是专业命理顾问，输出务实、可执行、结构化结果。',
    },
    { role: 'user', content: prompt },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEEPSEEK_TIMEOUT_MS);

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.45,
      max_tokens: 1800,
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) return null;

  const data = await response.json().catch(() => null);
  const content: string = data?.choices?.[0]?.message?.content || '';
  const parsed = tryParseJsonObject(content);
  if (!parsed) return null;

  const score = parsed.score || {};
  const normalized: AiAnalysisShape = {
    mingZhu: String(parsed.mingZhu || ''),
    career: String(parsed.career || ''),
    wealth: String(parsed.wealth || ''),
    love: String(parsed.love || ''),
    health: String(parsed.health || ''),
    currentPeriod: String(parsed.currentPeriod || ''),
    thisYear: String(parsed.thisYear || ''),
    advice: String(parsed.advice || ''),
    score: {
      career: Number.isFinite(score.career) ? Math.round(score.career) : params.baseScores.career,
      wealth: Number.isFinite(score.wealth) ? Math.round(score.wealth) : params.baseScores.wealth,
      love: Number.isFinite(score.love) ? Math.round(score.love) : params.baseScores.love,
      health: Number.isFinite(score.health) ? Math.round(score.health) : params.baseScores.health,
      overall: Number.isFinite(score.overall) ? Math.round(score.overall) : params.baseScores.overall,
    },
  };

  if (!normalized.mingZhu) return null;
  return normalized;
}
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

function pickCurrentDaYun(daYun: Array<{ age?: number; ganZhi?: string }>, currentYear: number, birthYear: number) {
  if (!Array.isArray(daYun) || daYun.length === 0) return null;
  const currentAge = currentYear - birthYear;
  for (let i = 0; i < daYun.length; i += 1) {
    const item = daYun[i];
    const startAge = Number(item?.age);
    if (!Number.isFinite(startAge)) continue;
    const nextStartAge = Number(daYun[i + 1]?.age);
    const endAge = Number.isFinite(nextStartAge) ? nextStartAge - 1 : startAge + 9;
    if (currentAge >= startAge && currentAge <= endAge) return item;
  }
  return daYun[0];
}

function buildDeterministicCurrentPeriod(currentDaYun: { age?: number; ganZhi?: string } | null, birthYear: number) {
  const ganZhi = currentDaYun?.ganZhi || '未知';
  const startAge = Number(currentDaYun?.age);
  if (!Number.isFinite(startAge)) {
    return `当前处于${ganZhi}大运，建议以稳健执行为主，先做结构优化再做扩张。`;
  }
  const endAge = startAge + 9;
  const startYear = birthYear + startAge;
  const endYear = birthYear + endAge;
  return `当前处于${ganZhi}大运（约${startAge}-${endAge}岁，对应${startYear}-${endYear}年）。建议先稳住节奏，聚焦高确定性主线，再逐步放大收益。`;
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
  const startAge = Number(params.currentDaYun?.age);
  const endAge = Number.isFinite(startAge) ? startAge + 9 : '-';

  return {
    mingZhu: `${riZhu}日主，核心在于长期节奏与取舍。优势在于抓机会和执行，关键是先统一方向，再集中资源。`,
    career: '当前阶段更适合把能力沉淀成可复用资产，聚焦主航道，避免多线并行导致效率下降。',
    wealth: '财务上宜重视现金流与风险边界，先做预算和仓位纪律，再考虑进攻机会。',
    love: '感情上少用情绪做决策，多沟通边界、节奏和现实预期，关系会更稳。',
    health: '健康重点是睡眠、压力管理和持续运动，避免长期透支换短期效率。',
    currentPeriod: `当前处于${currentDaYunName}阶段（约${startAge}-${endAge}岁），适合在波动中做结构优化：保留优势、砍掉低效消耗。`,
    thisYear: `${currentYear}年更像“校准年”，关键不在做得多，而在选得准、打得稳。`,
    advice: [
      '1. 事业：只保留最能形成复利的主线，减少分散投入。',
      '2. 财务：先做风险预算，再决定进攻仓位，避免情绪化加码。',
      '3. 感情：重要关系里少猜测，多确认边界与预期。',
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
    const currentDaYun = pickCurrentDaYun(daYun, currentYear, year);

    const scoreResult = calculateBaziScore(detail, currentDaYun);
    const analysis = analyzeBaziComplete(detail, currentDaYun);

    const baseScores = {
      career: Math.round(scoreResult?.career ?? analysis?.scores?.career ?? 70),
      wealth: Math.round(scoreResult?.wealth ?? analysis?.scores?.wealth ?? 70),
      love: Math.round(scoreResult?.love ?? analysis?.scores?.love ?? 70),
      health: Math.round(scoreResult?.health ?? analysis?.scores?.health ?? 70),
      overall: Math.round(scoreResult?.overall ?? analysis?.scores?.overall ?? 70),
    };

    const baselineKline = generateLifeKLine(period, year, month, day, hour, normalizedGender, currentYear, 1, 1);
    const baselineAllKline = generateLifeKLine('all', year, month, day, hour, normalizedGender, currentYear, 1, 1);
    const baselineYearly = mapAllPeriodToYearlyScores(baselineAllKline, year);
    const yearlyAiScores = await getYearlyScoresWithCache({
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      birthHour: hour,
      gender: normalizedGender,
      baseline: baselineYearly,
      riZhu: detail?.日主 || bazi?.riZhu || '',
    });

    const calibratedPeriod = applyYearlyCalibration({
      source: baselineKline,
      period,
      targetYear: currentYear,
      baselineAll: baselineYearly,
      aiAll: yearlyAiScores,
    });
    const calibratedAll = applyYearlyCalibration({
      source: baselineAllKline,
      period: 'all',
      targetYear: currentYear,
      baselineAll: baselineYearly,
      aiAll: yearlyAiScores,
    });
    const kline = relinkCandlesWithPrevClose(calibratedPeriod);
    const allCalibrated = relinkCandlesWithPrevClose(calibratedAll);
    const canonicalScores = buildCanonicalScoresFromAll(allCalibrated, baseScores);

    const fallbackAiAnalysis = buildFallbackAiAnalysis({ detail, bazi, currentDaYun, baseScores: canonicalScores });
    const deepseekAiAnalysis = await generateDeepseekAiAnalysis({
      bazi,
      detail,
      currentDaYun,
      currentYear,
      baseScores: canonicalScores,
      gender: normalizedGender,
    });

    const aiAnalysis: AiAnalysisShape = {
      ...fallbackAiAnalysis,
      ...(deepseekAiAnalysis || {}),
      score: canonicalScores,
    };
    aiAnalysis.thisYear = String(aiAnalysis.thisYear || '').replace(/\b(19|20)\d{2}\b/g, String(currentYear)).trim();
    aiAnalysis.advice = ensureLongAdvice(aiAnalysis.advice, currentYear, canonicalScores);
    aiAnalysis.currentPeriod = buildDeterministicCurrentPeriod(currentDaYun, year);

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
          currentLuck: canonicalScores.overall,
          trend: kline.length > 1 && kline[kline.length - 1].close >= kline[0].open ? 'up' : 'flat',
          suggestion: aiAnalysis.advice,
          riZhu: String((bazi as any)?.riZhu || (detail as any)?.['日主'] || (detail as any)?.riZhu || ''),
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
    const baselineKline = generateLifeKLine(
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
    const baselineAllKline = generateLifeKLine(
      'all',
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      gender,
      targetYear,
      targetMonth,
      targetDay
    );
    const baselineYearly = mapAllPeriodToYearlyScores(baselineAllKline, birthYear);
    const yearlyAiScores = await getYearlyScoresWithCache({
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      gender,
      baseline: baselineYearly,
      riZhu: '',
    });

    const calibrated = applyYearlyCalibration({
      source: baselineKline,
      period,
      targetYear,
      baselineAll: baselineYearly,
      aiAll: yearlyAiScores,
    });
    const klineData = relinkCandlesWithPrevClose(calibrated);

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



