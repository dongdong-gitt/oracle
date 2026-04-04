import {
  analyzeBaziComplete,
  calculateDaYun,
  getBaziDetail,
} from './bazi';

export type KLinePeriod = '1d' | '1m' | '1y' | '10y' | 'all';

export interface KLineData {
  year: number;
  time: string;
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  details: {
    career: number;
    wealth: number;
    love: number;
    health: number;
    overall: number;
  };
}

type ScoreDetails = KLineData['details'];

type DaYunItem = {
  ganZhi?: string;
  age?: number;
  开始年份?: number;
  结束年份?: number;
  开始年龄?: number;
  结束年龄?: number;
  [key: string]: unknown;
};

type Context = {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender: 'male' | 'female';
  baseScores: ScoreDetails;
  riZhuGan: string;
  riZhuWuXing: string;
  favorableElements: string[];
  unfavorableElements: string[];
  dayun: DaYunItem[];
};

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const MONTH_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
const SHICHEN_LABELS = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
const SHICHEN_HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

const GAN_WUXING: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const ZHI_WUXING: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

const WUXING_SHENG: Record<string, string> = {
  金: '水', 水: '木', 木: '火', 火: '土', 土: '金',
};

const WUXING_KE: Record<string, string> = {
  金: '木', 木: '土', 土: '水', 水: '火', 火: '金',
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function weightedOverall(details: Omit<ScoreDetails, 'overall'> | ScoreDetails) {
  return Math.round(details.career * 0.3 + details.wealth * 0.25 + details.love * 0.25 + details.health * 0.2);
}

function safeArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

function getGanZhi(year: number) {
  const stem = STEMS[(year - 4 + 6000) % 10];
  const branch = BRANCHES[(year - 4 + 6000) % 12];
  return `${stem}${branch}`;
}

function getMonthGanZhi(year: number, month: number) {
  const stem = STEMS[((year * 12 + month) - 3 + 6000) % 10];
  const branch = MONTH_BRANCHES[(month - 1 + 12) % 12];
  return `${stem}${branch}`;
}

function getDayGanZhi(year: number, month: number, day: number) {
  const base = Date.UTC(1900, 0, 31);
  const target = Date.UTC(year, month - 1, day);
  const diffDays = Math.floor((target - base) / 86400000);
  const stem = STEMS[(diffDays + 40 + 6000) % 10];
  const branch = BRANCHES[(diffDays + 10 + 6000) % 12];
  return `${stem}${branch}`;
}

function getHourBranch(hour: number) {
  return BRANCHES[Math.floor(((hour % 24) + 1) / 2) % 12];
}

function getElement(char: string) {
  return GAN_WUXING[char] || ZHI_WUXING[char] || '';
}

function relationScore(source: string, target: string) {
  if (!source || !target) return 0;
  if (source === target) return 6;
  if (WUXING_SHENG[source] === target) return 8;
  if (WUXING_SHENG[target] === source) return 5;
  if (WUXING_KE[source] === target) return -8;
  if (WUXING_KE[target] === source) return -5;
  return 0;
}

function getDaYunYearRange(item: DaYunItem, birthYear: number) {
  const startYear = Number(item?.开始年份);
  const endYear = Number(item?.结束年份);
  if (Number.isFinite(startYear) && Number.isFinite(endYear)) {
    return { start: startYear, end: endYear };
  }

  const startAge = Number(item?.age ?? item?.开始年龄);
  const endAge = Number(item?.结束年龄);
  if (Number.isFinite(startAge)) {
    return {
      start: birthYear + startAge,
      end: Number.isFinite(endAge) ? birthYear + endAge : birthYear + startAge + 9,
    };
  }

  return { start: birthYear, end: birthYear + 9 };
}

function getCurrentDaYun(dayun: DaYunItem[], year: number, birthYear: number) {
  if (!Array.isArray(dayun) || dayun.length === 0) return undefined;
  return dayun.find((item) => {
    const range = getDaYunYearRange(item, birthYear);
    return year >= range.start && year <= range.end;
  }) || dayun[0];
}

function aggregateScores(items: ScoreDetails[]) {
  if (!items.length) {
    return { career: 60, wealth: 60, love: 60, health: 60, overall: 60 };
  }

  const sums = items.reduce(
    (acc, item) => {
      acc.career += item.career;
      acc.wealth += item.wealth;
      acc.love += item.love;
      acc.health += item.health;
      return acc;
    },
    { career: 0, wealth: 0, love: 0, health: 0 }
  );

  const details = {
    career: Math.round(sums.career / items.length),
    wealth: Math.round(sums.wealth / items.length),
    love: Math.round(sums.love / items.length),
    health: Math.round(sums.health / items.length),
  };

  return { ...details, overall: weightedOverall(details) };
}

function buildCandle(time: string, label: string, children: ScoreDetails[], year: number): KLineData {
  const details = aggregateScores(children);
  const first = children[0] || details;
  const last = children[children.length - 1] || details;
  const overallSeries = children.map((item) => item.overall);
  const open = round1(first.overall);
  const close = round1(last.overall);
  const high = round1(Math.max(...overallSeries, open, close));
  const low = round1(Math.min(...overallSeries, open, close));
  const volatility = Math.max(1, high - low);
  const volume = Math.round(volatility * 100 + Math.abs(close - open) * 60);

  return { year, time, label, open, high, low, close, volume, details };
}

function deriveContext(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: 'male' | 'female'
): Context {
  const detail = getBaziDetail(birthYear, birthMonth, birthDay, birthHour, gender);
  const analysis = analyzeBaziComplete(detail);
  const dayun = calculateDaYun(birthYear, birthMonth, birthDay, birthHour, gender) as DaYunItem[];
  const riZhuText = String((detail as any)?.['日主'] || (detail as any)?.riZhu || '庚');
  const riZhuGan = riZhuText[0] || '庚';
  const riZhuWuXing = getElement(riZhuGan) || '金';

  const favorableElements = Array.from(new Set([
    getElement(String((detail as any)?.['用神'] || '')[0] || ''),
    getElement(String((detail as any)?.['喜神'] || '')[0] || ''),
    riZhuWuXing,
    WUXING_SHENG[riZhuWuXing],
  ].filter(Boolean)));

  const unfavorableElements = Array.from(new Set([
    getElement(String((detail as any)?.['忌神'] || '')[0] || ''),
    getElement(String((detail as any)?.['仇神'] || '')[0] || ''),
    WUXING_KE[riZhuWuXing],
  ].filter(Boolean)));

  const rawBase = (analysis as any)?.scores || { career: 65, wealth: 65, love: 65, health: 65, overall: 65 };
  const baseScores: ScoreDetails = {
    career: clamp(Math.round(Number(rawBase.career ?? 65)), 35, 95),
    wealth: clamp(Math.round(Number(rawBase.wealth ?? 65)), 35, 95),
    love: clamp(Math.round(Number(rawBase.love ?? 65)), 35, 95),
    health: clamp(Math.round(Number(rawBase.health ?? 65)), 35, 95),
    overall: clamp(Math.round(Number(rawBase.overall ?? weightedOverall(rawBase))), 35, 95),
  };

  return {
    birthYear,
    birthMonth,
    birthDay,
    birthHour,
    gender,
    baseScores,
    riZhuGan,
    riZhuWuXing,
    favorableElements,
    unfavorableElements,
    dayun,
  };
}

function scoreAxis(base: number, modifiers: number[]) {
  return clamp(Math.round(base + modifiers.reduce((sum, item) => sum + item, 0)), 20, 98);
}

function getDimensionModifiers(elements: string[], favorable: string[], unfavorable: string[]) {
  const bonus = elements.reduce((sum, element) => sum + (favorable.includes(element) ? 1 : 0), 0);
  const penalty = elements.reduce((sum, element) => sum + (unfavorable.includes(element) ? 1 : 0), 0);
  return { bonus, penalty };
}

function scoreMoment(ctx: Context, year: number, month: number, day: number, hour: number): ScoreDetails {
  const yearGz = getGanZhi(year);
  const monthGz = getMonthGanZhi(year, month);
  const dayGz = getDayGanZhi(year, month, day);
  const hourBranch = getHourBranch(hour);
  const currentDaYun = getCurrentDaYun(ctx.dayun, year, ctx.birthYear);
  const dayunGz = String(currentDaYun?.ganZhi || '');

  const yearGan = yearGz[0] || '';
  const yearZhi = yearGz[1] || '';
  const monthGan = monthGz[0] || '';
  const monthZhi = monthGz[1] || '';
  const dayGan = dayGz[0] || '';
  const dayZhi = dayGz[1] || '';
  const dayunGan = dayunGz[0] || '';
  const dayunZhi = dayunGz[1] || '';

  const keyElements = [
    getElement(dayunGan),
    getElement(dayunZhi),
    getElement(yearGan),
    getElement(yearZhi),
    getElement(monthGan),
    getElement(monthZhi),
    getElement(dayGan),
    getElement(dayZhi),
    getElement(hourBranch),
  ].filter(Boolean);

  const elementDelta = keyElements.reduce((sum, element) => sum + relationScore(element, ctx.riZhuWuXing), 0);
  const { bonus, penalty } = getDimensionModifiers(keyElements, ctx.favorableElements, ctx.unfavorableElements);

  // Month effect uses a yearly phase-shifted cycle instead of linear rise,
  // avoiding "every year closes above opens" while staying deterministic.
  const yearPhase = (((year - ctx.birthYear) % 12) + 12) % 12;
  const monthAngle = ((month - 1 + yearPhase) / 12) * Math.PI * 2;
  const monthWeight = Math.sin(monthAngle) * 2.4;
  const dayWave = ((day % 10) - 4.5) * 0.7;
  const hourWave = ((Math.floor(hour / 2) % 12) - 5.5) * 0.5;
  const dayunBoost = relationScore(getElement(dayunGan), ctx.riZhuWuXing) + relationScore(getElement(dayunZhi), ctx.riZhuWuXing);
  const yearBoost = relationScore(getElement(yearGan), ctx.riZhuWuXing) + relationScore(getElement(yearZhi), ctx.riZhuWuXing);

  const career = scoreAxis(ctx.baseScores.career, [dayunBoost * 0.9, yearBoost * 0.6, monthWeight, bonus * 1.5, -penalty]);
  const wealth = scoreAxis(ctx.baseScores.wealth, [dayunBoost * 0.7, yearBoost * 0.8, dayWave, bonus * 1.2, -penalty * 1.2]);
  const love = scoreAxis(ctx.baseScores.love, [dayunBoost * 0.5, yearBoost * 0.5, dayWave * 0.6, hourWave * 0.8, bonus, -penalty]);
  const health = scoreAxis(ctx.baseScores.health, [elementDelta * 0.35, -Math.abs(monthWeight) * 0.8, -Math.abs(hourWave) * 0.4, bonus * 0.8, -penalty * 1.3]);

  const details = { career, wealth, love, health };
  return { ...details, overall: weightedOverall(details) };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function generateDayPeriod(ctx: Context, year: number, month: number, day: number): KLineData[] {
  const items: KLineData[] = [];
  let prevClose = 0;

  SHICHEN_HOURS.forEach((hour, index) => {
    const details = scoreMoment(ctx, year, month, day, hour);
    const open = index === 0 ? details.overall : prevClose;
    const close = details.overall;
    const high = round1(Math.min(100, Math.max(open, close) + 1.2));
    const low = round1(Math.max(0, Math.min(open, close) - 1.2));
    prevClose = close;

    items.push({
      year,
      time: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${SHICHEN_LABELS[index]}`,
      label: SHICHEN_LABELS[index],
      open: round1(open),
      high,
      low,
      close: round1(close),
      volume: Math.round((Math.max(details.career, details.wealth, details.love, details.health) - Math.min(details.career, details.wealth, details.love, details.health)) * 50),
      details,
    });
  });

  return items;
}

function generateMonthPeriod(ctx: Context, year: number, month: number): KLineData[] {
  const totalDays = daysInMonth(year, month);
  const items: KLineData[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const intraday = generateDayPeriod(ctx, year, month, day).map((item) => item.details);
    items.push(buildCandle(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, `${day}日`, intraday, year));
  }

  return items;
}

function generateYearPeriod(ctx: Context, year: number): KLineData[] {
  const items: KLineData[] = [];

  for (let month = 1; month <= 12; month++) {
    const monthData = generateMonthPeriod(ctx, year, month).map((item) => item.details);
    items.push(buildCandle(`${year}-${String(month).padStart(2, '0')}`, `${month}月`, monthData, year));
  }

  return items;
}

function generateLongPeriod(ctx: Context, startYear: number, years: number) {
  const items: KLineData[] = [];
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    const yearData = generateYearPeriod(ctx, year).map((item) => item.details);
    items.push(buildCandle(String(year), `${year}年`, yearData, year));
  }
  return items;
}

export function generateLifeKLine(
  period: KLinePeriod,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: 'male' | 'female',
  targetYear?: number,
  targetMonth?: number,
  targetDay?: number
): KLineData[] {
  const ctx = deriveContext(birthYear, birthMonth, birthDay, birthHour, gender);
  const year = targetYear || new Date().getFullYear();
  const month = targetMonth || new Date().getMonth() + 1;
  const day = targetDay || new Date().getDate();

  switch (period) {
    case '1d':
      return generateDayPeriod(ctx, year, month, day);
    case '1m':
      return generateMonthPeriod(ctx, year, month);
    case '1y':
      return generateYearPeriod(ctx, year);
    case '10y':
      return generateLongPeriod(ctx, year, 10);
    case 'all': {
      const firstDayunAge = Number(ctx.dayun?.[0]?.age ?? ctx.dayun?.[0]?.开始年龄 ?? 0);
      const firstYear = Math.max(birthYear + 1, birthYear + (Number.isFinite(firstDayunAge) ? firstDayunAge : 0));
      return generateLongPeriod(ctx, firstYear, 80);
    }
    default:
      return generateYearPeriod(ctx, year);
  }
}

export default generateLifeKLine;
