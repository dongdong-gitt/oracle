/**
 * 人生K线核心算法
 * 基于八字命理，生成终身运势时间序列
 */

import { 
  calculateBaZi, 
  calculateDaYun, 
  getBaziDetail,
  analyzeBaziComplete,
  CompleteBaziAnalysis 
} from './bazi';

// ==================== 类型定义 ====================

export type KLinePeriod = '1d' | '1m' | '1y' | '10y' | 'all';

export interface KLineData {
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
  analysis: {
    summary: string;
    opportunities: string[];
    risks: string[];
    advice: string;
  };
  markers: {
    shenSha: { name: string; type: '吉' | '凶'; effect: string }[];
    relations: { type: string; pillars: string[]; effect: number }[];
    yongShen: string;
    jiShen: string;
  };
  calculation: {
    baseScore: number;
    daYunEffect: number;
    liuNianEffect: number;
    liuYueEffect: number;
    liuRiEffect: number;
    liuShiEffect: number;
    shenShaEffect: number;
    relationEffect: number;
  };
}

// ==================== 辅助函数 ====================

function getShiShen(gan: string, riZhu: string): string {
  const ganIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(gan);
  const riZhuIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(riZhu);
  const diff = (ganIndex - riZhuIndex + 10) % 10;
  const shiShenMap = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];
  return shiShenMap[diff];
}

function getWuXing(ganOrZhi: string): string {
  const map: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
    '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
  };
  return map[ganOrZhi] || '';
}

function isTianHe(a: string, b: string): boolean {
  const he = [['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']];
  return he.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

function isDiHe(a: string, b: string): boolean {
  const he = [['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']];
  return he.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

function isTianKe(a: string, b: string): boolean {
  const ke = [['甲', '庚'], ['乙', '辛'], ['丙', '壬'], ['丁', '癸'], ['戊', '甲'], ['己', '乙'], ['庚', '丙'], ['辛', '丁'], ['壬', '戊'], ['癸', '己']];
  return ke.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

function isDiChong(a: string, b: string): boolean {
  const chong = [['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']];
  return chong.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

function calculateLiuNianGanZhi(year: number): string {
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][(year - 4) % 10];
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][(year - 4) % 12];
  return gan + zhi;
}

function calculateYueZhu(year: number, month: number): [string, string] {
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][(year * 12 + month) % 10];
  const zhi = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'][month - 1];
  return [gan, zhi];
}

function calculateRiZhu(year: number, month: number, day: number): [string, string] {
  const base = new Date(1900, 0, 31).getTime();
  const target = new Date(year, month - 1, day).getTime();
  const diff = Math.floor((target - base) / 86400000);
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][diff % 10];
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][diff % 12];
  return [gan, zhi];
}

function calculateShiZhi(hour: number): string {
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return zhi[Math.floor(hour / 2) % 12];
}

// ==================== 核心计算函数 ====================

function calculateDaYunEffect(daYun: { ganZhi: string }, analysis: CompleteBaziAnalysis): number {
  const gan = daYun.ganZhi[0];
  const zhi = daYun.ganZhi[1];
  const riZhu = analysis.riZhu;
  const ganShiShen = getShiShen(gan, riZhu.name[0]);
  
  let score = 0;
  
  if (riZhu.strength === 'weak') {
    if (['正印', '偏印', '比肩', '劫财'].includes(ganShiShen)) score += 12;
    else if (['正财', '偏财', '食神', '伤官'].includes(ganShiShen)) score -= 8;
    else score -= 5;
  } else {
    if (['正财', '偏财', '食神', '伤官'].includes(ganShiShen)) score += 10;
    else if (['正印', '偏印'].includes(ganShiShen)) score -= 8;
    else if (['比肩', '劫财'].includes(ganShiShen)) score -= 5;
    else score += 5;
  }
  
  const ganWuxing = getWuXing(gan);
  const zhiWuxing = getWuXing(zhi);
  if (ganWuxing === zhiWuxing) score += 3;
  
  return Math.max(-20, Math.min(20, score));
}

function calculateLiuNianEffect(liuNian: { ganZhi: string }, daYun: { ganZhi: string }, analysis: CompleteBaziAnalysis): number {
  const gan = liuNian.ganZhi[0];
  const ganShiShen = getShiShen(gan, analysis.riZhu.name[0]);
  let score = 0;
  
  if (analysis.yongShen.yongShen.shishen.includes(ganShiShen)) score += 15;
  else if (analysis.yongShen.xiShen.shishen.includes(ganShiShen)) score += 8;
  else if (analysis.yongShen.jiShen.shishen.includes(ganShiShen)) score -= 12;
  
  const daYunGan = daYun.ganZhi[0];
  const daYunZhi = daYun.ganZhi[1];
  
  if (isTianHe(gan, daYunGan)) score += 8;
  if (isDiHe(liuNian.ganZhi[1], daYunZhi)) score += 8;
  if (isTianKe(gan, daYunGan)) score -= 10;
  if (isDiChong(liuNian.ganZhi[1], daYunZhi)) score -= 12;
  
  return Math.max(-30, Math.min(30, score));
}

function calculateLiuYueEffect(year: number, month: number, liuNian: { ganZhi: string }, analysis: CompleteBaziAnalysis): number {
  const yueLing = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'][month - 1];
  const yueLingWuxing = getWuXing(yueLing);
  const riZhuWuxing = getWuXing(analysis.riZhu.name[0]);
  let score = 0;
  
  const WUXING_SHENG: Record<string, string> = { '金': '水', '木': '火', '水': '木', '火': '土', '土': '金' };
  const WUXING_KE: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };
  
  if (WUXING_SHENG[yueLingWuxing] === riZhuWuxing) score += 8;
  else if (yueLingWuxing === riZhuWuxing) score += 10;
  else if (WUXING_KE[yueLingWuxing] === riZhuWuxing) score -= 8;
  else score -= 3;
  
  const yueZhu = calculateYueZhu(year, month);
  if (isTianHe(yueZhu[0], liuNian.ganZhi[0])) score += 5;
  if (isDiHe(yueZhu[1], liuNian.ganZhi[1])) score += 5;
  if (isDiChong(yueZhu[1], liuNian.ganZhi[1])) score -= 8;
  
  return Math.max(-15, Math.min(15, score));
}

function calculateLiuRiEffect(year: number, month: number, day: number, liuYue: string, analysis: CompleteBaziAnalysis): number {
  const riZhu = calculateRiZhu(year, month, day);
  const riGanShiShen = getShiShen(riZhu[0], analysis.riZhu.name[0]);
  let score = 0;
  
  if (analysis.yongShen.yongShen.shishen.includes(riGanShiShen)) score += 6;
  else if (analysis.yongShen.jiShen.shishen.includes(riGanShiShen)) score -= 5;
  
  if (isDiHe(riZhu[1], liuYue[1])) score += 4;
  if (isDiChong(riZhu[1], liuYue[1])) score -= 6;
  
  return Math.max(-10, Math.min(10, score));
}

function calculateLiuShiEffect(hour: number, riZhu: [string, string], analysis: CompleteBaziAnalysis): number {
  const shiZhi = calculateShiZhi(hour);
  const shiZhiShiShen = getShiShen(shiZhi, analysis.riZhu.name[0]);
  let score = 0;
  
  if (analysis.yongShen.yongShen.shishen.includes(shiZhiShiShen)) score += 5;
  else if (analysis.yongShen.jiShen.shishen.includes(shiZhiShiShen)) score -= 4;
  
  if (isDiHe(shiZhi, riZhu[1])) score += 3;
  if (isDiChong(shiZhi, riZhu[1])) score -= 4;
  
  return Math.max(-8, Math.min(8, score));
}

function generateAnalysis(score: number, type: string): { summary: string; opportunities: string[]; risks: string[]; advice: string } {
  if (score >= 85) {
    return { summary: `${type}运势极佳，天时地利人和`, opportunities: ['把握机遇，大胆进取', '贵人相助，事半功倍'], risks: ['谨防骄傲自满'], advice: '乘势而上，但不可得意忘形' };
  } else if (score >= 70) {
    return { summary: `${type}运势良好，顺遂安康`, opportunities: ['稳步发展，积累资源', '人际关系和谐'], risks: ['不可冒进'], advice: '稳扎稳打，厚积薄发' };
  } else if (score >= 55) {
    return { summary: `${type}运势平稳，波澜不惊`, opportunities: ['维持现状', '修身养性'], risks: ['变化不多'], advice: '守成为主，静待时机' };
  } else if (score >= 40) {
    return { summary: `${type}运势欠佳，需谨慎应对`, opportunities: ['低调行事', '寻求帮助'], risks: ['小人当道', '破财损耗'], advice: '保守为上，避免冒险' };
  } else {
    return { summary: `${type}运势低迷，诸事不顺`, opportunities: ['韬光养晦', '积蓄力量'], risks: ['重大损失', '健康危机'], advice: '宜静不宜动，保命要紧' };
  }
}

// ==================== K线生成函数 ====================

export function generateYearKLine(birthYear: number, birthMonth: number, birthDay: number, birthHour: number, gender: 'male' | 'female', years: number = 80): KLineData[] {
  const detail = getBaziDetail(birthYear, birthMonth, birthDay, birthHour, gender);
  const analysis = analyzeBaziComplete(detail);
  const daYun = calculateDaYun(birthYear, birthMonth, birthDay, birthHour, gender);
  
  const kline: KLineData[] = [];
  const startYear = birthYear + (detail.大运?.起运年龄 || 7);
  
  for (let year = startYear; year < startYear + years; year++) {
    const currentDaYun = daYun.find((d: any) => year >= d.开始年份 && year <= d.结束年份) || daYun[0];
    const liuNian = { ganZhi: calculateLiuNianGanZhi(year), year };
    
    const monthlyScores: number[] = [];
    for (let month = 1; month <= 12; month++) {
      const total = 65 + calculateDaYunEffect(currentDaYun, analysis) + calculateLiuNianEffect(liuNian, currentDaYun, analysis) + calculateLiuYueEffect(year, month, liuNian, analysis);
      monthlyScores.push(Math.max(0, Math.min(100, total)));
    }
    
    const avgOverall = Math.round(monthlyScores.reduce((a, b) => a + b, 0) / 12);
    
    kline.push({
      time: year.toString(),
      label: `${year}年`,
      open: monthlyScores[0],
      high: Math.max(...monthlyScores),
      low: Math.min(...monthlyScores),
      close: monthlyScores[11],
      volume: Math.abs(calculateLiuNianEffect(liuNian, currentDaYun, analysis)) * 10,
      details: { career: avgOverall, wealth: avgOverall, love: avgOverall, health: avgOverall, overall: avgOverall },
      analysis: generateAnalysis(avgOverall, '全年'),
      markers: { shenSha: [], relations: [], yongShen: analysis.yongShen.yongShen.element, jiShen: analysis.yongShen.jiShen.element },
      calculation: { baseScore: 65, daYunEffect: calculateDaYunEffect(currentDaYun, analysis), liuNianEffect: calculateLiuNianEffect(liuNian, currentDaYun, analysis), liuYueEffect: 0, liuRiEffect: 0, liuShiEffect: 0, shenShaEffect: 0, relationEffect: 0 },
    });
  }
  
  return kline;
}

export function generateMonthKLine(year: number, birthYear: number, birthMonth: number, birthDay: number, birthHour: number, gender: 'male' | 'female'): KLineData[] {
  const detail = getBaziDetail(birthYear, birthMonth, birthDay, birthHour, gender);
  const analysis = analyzeBaziComplete(detail);
  const daYun = calculateDaYun(birthYear, birthMonth, birthDay, birthHour, gender);
  
  const currentDaYun = daYun.find((d: any) => year >= d.开始年份 && year <= d.结束年份) || daYun[0];
  const liuNian = { ganZhi: calculateLiuNianGanZhi(year), year };
  
  const kline: KLineData[] = [];
  
  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyScores: number[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const total = 65 + calculateDaYunEffect(currentDaYun, analysis) + calculateLiuNianEffect(liuNian, currentDaYun, analysis) + calculateLiuYueEffect(year, month, liuNian, analysis) + calculateLiuRiEffect(year, month, day, calculateYueZhu(year, month).join(''), analysis);
      dailyScores.push(Math.max(0, Math.min(100, total)));
    }
    
    const avgOverall = Math.round(dailyScores.reduce((a, b) => a + b, 0) / daysInMonth);
    
    kline.push({
      time: `${year}-${month.toString().padStart(2, '0')}`,
      label: `${month}月`,
      open: dailyScores[0],
      high: Math.max(...dailyScores),
      low: Math.min(...dailyScores),
      close: dailyScores[dailyScores.length - 1],
      volume: Math.abs(calculateLiuYueEffect(year, month, liuNian, analysis)) * 10,
      details: { career: avgOverall, wealth: avgOverall, love: avgOverall, health: avgOverall, overall: avgOverall },
      analysis: generateAnalysis(avgOverall, '本月'),
      markers: { shenSha: [], relations: [], yongShen: analysis.yongShen.yongShen.element, jiShen: analysis.yongShen.jiShen.element },
      calculation: { baseScore: 65, daYunEffect: calculateDaYunEffect(currentDaYun, analysis), liuNianEffect: calculateLiuNianEffect(liuNian, currentDaYun, analysis), liuYueEffect: calculateLiuYueEffect(year, month, liuNian, analysis), liuRiEffect: 0, liuShiEffect: 0, shenShaEffect: 0, relationEffect: 0 },
    });
  }
  
  return kline;
}

export function generateDayKLine(year: number, month: number, birthYear: number, birthMonth: number, birthDay: number, birthHour: number, gender: 'male' | 'female'): KLineData[] {
  const detail = getBaziDetail(birthYear, birthMonth, birthDay, birthHour, gender);
  const analysis = analyzeBaziComplete(detail);
  const daYun = calculateDaYun(birthYear, birthMonth, birthDay, birthHour, gender);
  
  const currentDaYun = daYun.find((d: any) => year >= d.开始年份 && year <= d.结束年份) || daYun[0];
  const liuNian = { ganZhi: calculateLiuNianGanZhi(year), year };
  const liuYue = calculateYueZhu(year, month);
  
  const kline: KLineData[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const hourlyScores: number[] = [];
    
    for (let hour = 0; hour < 24; hour += 2) {
      const total = 65 + calculateDaYunEffect(currentDaYun, analysis) + calculateLiuNianEffect(liuNian, currentDaYun, analysis) + calculateLiuYueEffect(year, month, liuNian, analysis) + calculateLiuRiEffect(year, month, day, liuYue.join(''), analysis) + calculateLiuShiEffect(hour, calculateRiZhu(year, month, day), analysis);
      hourlyScores.push(Math.max(0, Math.min(100, total)));
    }
    
    const avgOverall = Math.round(hourlyScores.reduce((a, b) => a + b, 0) / 12);
    
    kline.push({
      time: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      label: `${day}日`,
      open: hourlyScores[0],
      high: Math.max(...hourlyScores),
      low: Math.min(...hourlyScores),
      close: hourlyScores[hourlyScores.length - 1],
      volume: Math.abs(calculateLiuRiEffect(year, month, day, liuYue.join(''), analysis)) * 10,
      details: { career: avgOverall, wealth: avgOverall, love: avgOverall, health: avgOverall, overall: avgOverall },
      analysis: generateAnalysis(avgOverall, '今日'),
      markers: { shenSha: [], relations: [], yongShen: analysis.yongShen.yongShen.element, jiShen: analysis.yongShen.jiShen.element },
      calculation: { baseScore: 65, daYunEffect: calculateDaYunEffect(currentDaYun, analysis), liuNianEffect: calculateLiuNianEffect(liuNian, currentDaYun, analysis), liuYueEffect: calculateLiuYueEffect(year, month, liuNian, analysis), liuRiEffect: calculateLiuRiEffect(year, month, day, liuYue.join(''), analysis), liuShiEffect: 0, shenShaEffect: 0, relationEffect: 0 },
    });
  }
  
  return kline;
}

export function generateHourKLine(year: number, month: number, day: number, birthYear: number, birthMonth: number, birthDay: number, birthHour: number, gender: 'male' | 'female'): KLineData[] {
  const detail = getBaziDetail(birthYear, birthMonth, birthDay, birthHour, gender);
  const analysis = analyzeBaziComplete(detail);
  const daYun = calculateDaYun(birthYear, birthMonth, birthDay, birthHour, gender);
  
  const currentDaYun = daYun.find((d: any) => year >= d.开始年份 && year <= d.结束年份) || daYun[0];
  const liuNian = { ganZhi: calculateLiuNianGanZhi(year), year };
  const liuYue = calculateYueZhu(year, month);
  const liuRi = calculateRiZhu(year, month, day);
  
  const kline: KLineData[] = [];
  const shichen = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  for (let i = 0; i < 12; i++) {
    const hour = i * 2;
    const total = 65 + calculateDaYunEffect(currentDaYun, analysis) + calculateLiuNianEffect(liuNian, currentDaYun, analysis) + calculateLiuYueEffect(year, month, liuNian, analysis) + calculateLiuRiEffect(year, month, day, liuYue.join(''), analysis) + calculateLiuShiEffect(hour, liuRi, analysis);
    const overall = Math.max(0, Math.min(100, total));
    
    kline.push({
      time: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${shichen[i]}时`,
      label: `${shichen[i]}时`,
      open: overall,
      high: overall,
      low: overall,
      close: overall,
      volume: 0,
      details: { career: overall, wealth: overall, love: overall, health: overall, overall },
      analysis: generateAnalysis(overall, '此时'),
      markers: { shenSha: [], relations: [], yongShen: analysis.yongShen.yongShen.element, jiShen: analysis.yongShen.jiShen.element },
      calculation: { baseScore: 65, daYunEffect: calculateDaYunEffect(currentDaYun, analysis), liuNianEffect: calculateLiuNianEffect(liuNian, currentDaYun, analysis), liuYueEffect: calculateLiuYueEffect(year, month, liuNian, analysis), liuRiEffect: calculateLiuRiEffect(year, month, day, liuYue.join(''), analysis), liuShiEffect: calculateLiuShiEffect(hour, liuRi, analysis), shenShaEffect: 0, relationEffect: 0 },
    });
  }
  
  return kline;
}

// ==================== 主入口函数 ====================

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
  switch (period) {
    case 'all':
      return generateYearKLine(birthYear, birthMonth, birthDay, birthHour, gender, 80);
    case '10y':
      return generateYearKLine(birthYear, birthMonth, birthDay, birthHour, gender, 10);
    case '1y':
      return generateMonthKLine(targetYear || new Date().getFullYear(), birthYear, birthMonth, birthDay, birthHour, gender);
    case '1m':
      return generateDayKLine(targetYear || new Date().getFullYear(), targetMonth || new Date().getMonth() + 1, birthYear, birthMonth, birthDay, birthHour, gender);
    case '1d':
      return generateHourKLine(targetYear || new Date().getFullYear(), targetMonth || new Date().getMonth() + 1, targetDay || new Date().getDate(), birthYear, birthMonth, birthDay, birthHour, gender);
    default:
      return generateYearKLine(birthYear, birthMonth, birthDay, birthHour, gender, 80);
  }
}

export default generateLifeKLine;