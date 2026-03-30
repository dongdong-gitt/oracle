/**
 * 人生K线核心算法 - V3.0 (复杂版)
 * 基于八字命理，生成终身运势时间序列
 * 核心原则：层层联动，加权平均，终身平均=八字综合分
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
}

// ==================== 辅助函数 ====================

/**
 * 计算加权综合分
 * 事业30% + 财运25% + 感情25% + 健康20%
 */
function calculateWeightedOverall(details: { career: number; wealth: number; love: number; health: number }): number {
  return Math.round(details.career * 0.3 + details.wealth * 0.25 + details.love * 0.25 + details.health * 0.2);
}

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

// ==================== 核心评分算法 ====================

/**
 * 计算大运影响分数（-20到+20）
 */
function calculateDaYunEffect(daYun: { ganZhi: string }, analysis: CompleteBaziAnalysis): number {
  const gan = daYun.ganZhi[0];
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
  
  return score;
}

/**
 * 计算流年影响分数（-30到+30）
 */
function calculateLiuNianEffect(liuNian: string, daYunGanZhi: string, analysis: CompleteBaziAnalysis): number {
  const gan = liuNian[0];
  const ganShiShen = getShiShen(gan, analysis.riZhu.name[0]);
  let score = 0;
  
  if (analysis.yongShen.yongShen.shishen.includes(ganShiShen)) score += 15;
  else if (analysis.yongShen.xiShen.shishen.includes(ganShiShen)) score += 8;
  else if (analysis.yongShen.jiShen.shishen.includes(ganShiShen)) score -= 12;
  
  if (isTianHe(gan, daYunGanZhi[0])) score += 8;
  if (isDiHe(liuNian[1], daYunGanZhi[1])) score += 8;
  if (isTianKe(gan, daYunGanZhi[0])) score -= 10;
  if (isDiChong(liuNian[1], daYunGanZhi[1])) score -= 12;
  
  return score;
}

/**
 * 计算流月影响分数（-15到+15）
 */
function calculateLiuYueEffect(year: number, month: number, liuNian: string, analysis: CompleteBaziAnalysis): number {
  const yueLing = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'][month - 1];
  const yueLingWuxing = getWuXing(yueLing);
  const riZhuWuxing = getWuXing(analysis.riZhu.name[0]);
  
  const WUXING_SHENG: Record<string, string> = { '金': '水', '木': '火', '水': '木', '火': '土', '土': '金' };
  const WUXING_KE: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };
  
  let score = 0;
  if (WUXING_SHENG[yueLingWuxing] === riZhuWuxing) score += 8;
  else if (yueLingWuxing === riZhuWuxing) score += 10;
  else if (WUXING_KE[yueLingWuxing] === riZhuWuxing) score -= 8;
  else score -= 3;
  
  const yueZhu = calculateYueZhu(year, month);
  if (isTianHe(yueZhu[0], liuNian[0])) score += 5;
  if (isDiHe(yueZhu[1], liuNian[1])) score += 5;
  if (isDiChong(yueZhu[1], liuNian[1])) score -= 8;
  
  return score;
}

/**
 * 计算流日影响分数（-10到+10）
 */
function calculateLiuRiEffect(year: number, month: number, day: number, liuYue: string, analysis: CompleteBaziAnalysis): number {
  const riZhu = calculateRiZhu(year, month, day);
  const riGanShiShen = getShiShen(riZhu[0], analysis.riZhu.name[0]);
  let score = 0;
  
  if (analysis.yongShen.yongShen.shishen.includes(riGanShiShen)) score += 6;
  else if (analysis.yongShen.jiShen.shishen.includes(riGanShiShen)) score -= 5;
  
  if (isDiHe(riZhu[1], liuYue[1])) score += 4;
  if (isDiChong(riZhu[1], liuYue[1])) score -= 6;
  
  return score;
}

/**
 * 计算流时影响分数（-8到+8）
 */
function calculateLiuShiEffect(hour: number, riZhu: [string, string], analysis: CompleteBaziAnalysis): number {
  const shiZhi = calculateShiZhi(hour);
  const shiZhiShiShen = getShiShen(shiZhi, analysis.riZhu.name[0]);
  let score = 0;
  
  if (analysis.yongShen.yongShen.shishen.includes(shiZhiShiShen)) score += 5;
  else if (analysis.yongShen.jiShen.shishen.includes(shiZhiShiShen)) score -= 4;
  
  if (isDiHe(shiZhi, riZhu[1])) score += 3;
  if (isDiChong(shiZhi, riZhu[1])) score -= 4;
  
  return score;
}

// ==================== K线生成函数（复杂版）====================

/**
 * 生成时辰K线（当日12个时辰）
 */
function generateShiChenKLine(
  year: number,
  month: number,
  day: number,
  daYun: any,
  liuNian: string,
  analysis: CompleteBaziAnalysis
): KLineData[] {
  const kline: KLineData[] = [];
  const shichen = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const baseScore = 65;
  
  const daYunEffect = calculateDaYunEffect(daYun, analysis);
  const liuNianEffect = calculateLiuNianEffect(liuNian, daYun.ganZhi, analysis);
  const liuYueEffect = calculateLiuYueEffect(year, month, liuNian, analysis);
  const liuYue = calculateYueZhu(year, month).join('');
  const liuRi = calculateRiZhu(year, month, day);
  const liuRiEffect = calculateLiuRiEffect(year, month, day, liuYue, analysis);
  
  for (let i = 0; i < 12; i++) {
    const hour = i * 2;
    const liuShiEffect = calculateLiuShiEffect(hour, liuRi, analysis);
    const totalEffect = daYunEffect + liuNianEffect + liuYueEffect + liuRiEffect + liuShiEffect;
    const overall = Math.max(0, Math.min(100, baseScore + totalEffect));
    
    const variation = 3;
    const details = {
      career: Math.max(0, Math.min(100, Math.round(overall + (Math.random() - 0.5) * variation * 2))),
      wealth: Math.max(0, Math.min(100, Math.round(overall + (Math.random() - 0.5) * variation * 2))),
      love: Math.max(0, Math.min(100, Math.round(overall + (Math.random() - 0.5) * variation * 2))),
      health: Math.max(0, Math.min(100, Math.round(overall + (Math.random() - 0.5) * variation * 2))),
      overall,
    };
    details.overall = calculateWeightedOverall(details);
    
    kline.push({
      time: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${shichen[i]}时`,
      label: `${shichen[i]}时`,
      open: overall,
      high: overall,
      low: overall,
      close: overall,
      volume: 0,
      details,
    });
  }
  
  return kline;
}

/**
 * 生成日K线（当月每天）
 */
function generateDayKLineFromShiChen(
  year: number,
  month: number,
  daYun: any,
  liuNian: string,
  analysis: CompleteBaziAnalysis
): KLineData[] {
  const kline: KLineData[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    // 获取当天12个时辰的数据
    const shiChenData = generateShiChenKLine(year, month, day, daYun, liuNian, analysis);
    
    // 计算当天的开高收低（基于12个时辰）
    const shiOverallScores = shiChenData.map(d => d.details.overall);
    const open = shiOverallScores[0];
    const close = shiOverallScores[shiOverallScores.length - 1];
    const high = Math.max(...shiOverallScores);
    const low = Math.min(...shiOverallScores);
    
    // 计算当天的分项平均
    const avgDetails = {
      career: Math.round(shiChenData.reduce((a, b) => a + b.details.career, 0) / 12),
      wealth: Math.round(shiChenData.reduce((a, b) => a + b.details.wealth, 0) / 12),
      love: Math.round(shiChenData.reduce((a, b) => a + b.details.love, 0) / 12),
      health: Math.round(shiChenData.reduce((a, b) => a + b.details.health, 0) / 12),
      overall: 0,
    };
    
    avgDetails.overall = calculateWeightedOverall(avgDetails);
    
    kline.push({
      time: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      label: `${day}日`,
      open: Math.round(open * 10) / 10,
      high: Math.round(high * 10) / 10,
      low: Math.round(low * 10) / 10,
      close: Math.round(close * 10) / 10,
      volume: Math.abs(close - open) * 100,
      details: avgDetails,
    });
  }
  
  return kline;
}

/**
 * 生成月K线（当年每月）
 */
function generateMonthKLineFromDays(
  year: number,
  daYun: any,
  liuNian: string,
  analysis: CompleteBaziAnalysis
): KLineData[] {
  const kline: KLineData[] = [];
  
  for (let month = 1; month <= 12; month++) {
    // 获取当月每天的数据
    const dayData = generateDayKLineFromShiChen(year, month, daYun, liuNian, analysis);
    
    // 计算当月的开高收低（基于30天）
    const dayCloseScores = dayData.map(d => d.details.overall);
    const open = dayCloseScores[0];
    const close = dayCloseScores[dayCloseScores.length - 1];
    const high = Math.max(...dayData.map(d => d.high));
    const low = Math.min(...dayData.map(d => d.low));
    
    // 计算当月的分项平均
    const avgDetails = {
      career: Math.round(dayData.reduce((a, b) => a + b.details.career, 0) / dayData.length),
      wealth: Math.round(dayData.reduce((a, b) => a + b.details.wealth, 0) / dayData.length),
      love: Math.round(dayData.reduce((a, b) => a + b.details.love, 0) / dayData.length),
      health: Math.round(dayData.reduce((a, b) => a + b.details.health, 0) / dayData.length),
      overall: 0,
    };
    
    avgDetails.overall = calculateWeightedOverall(avgDetails);
    
    kline.push({
      time: `${year}-${month.toString().padStart(2, '0')}`,
      label: `${month}月`,
      open: Math.round(open * 10) / 10,
      high: Math.round(high * 10) / 10,
      low: Math.round(low * 10) / 10,
      close: Math.round(close * 10) / 10,
      volume: Math.abs(close - open) * 1000,
      details: avgDetails,
    });
  }
  
  return kline;
}

/**
 * 生成年K线（终身每年）
 */
function generateYearKLineFromMonths(
  birthYear: number,
  years: number,
  daYun: any[],
  analysis: CompleteBaziAnalysis
): KLineData[] {
  const kline: KLineData[] = [];
  const startYear = birthYear + 7; // 7岁起运
  const targetOverall = analysis.scores.overall;
  
  // 生成原始数据
  for (let year = startYear; year < startYear + years; year++) {
    const currentDaYun = daYun.find((d: any) => year >= d.开始年份 && year <= d.结束年份) || daYun[0];
    const liuNian = calculateLiuNianGanZhi(year);
    
    // 获取当年每月的数据
    const monthData = generateMonthKLineFromDays(year, currentDaYun, liuNian, analysis);
    
    // 计算当年的开高收低
    const monthCloseScores = monthData.map(d => d.details.overall);
    const open = monthCloseScores[0];
    const close = monthCloseScores[monthCloseScores.length - 1];
    const high = Math.max(...monthData.map(d => d.high));
    const low = Math.min(...monthData.map(d => d.low));
    
    // 计算当年的分项平均
    const avgDetails = {
      career: Math.round(monthData.reduce((a, b) => a + b.details.career, 0) / 12),
      wealth: Math.round(monthData.reduce((a, b) => a + b.details.wealth, 0) / 12),
      love: Math.round(monthData.reduce((a, b) => a + b.details.love, 0) / 12),
      health: Math.round(monthData.reduce((a, b) => a + b.details.health, 0) / 12),
      overall: 0,
    };
    
    avgDetails.overall = calculateWeightedOverall(avgDetails);
    
    kline.push({
      time: year.toString(),
      label: `${year}年`,
      open: Math.round(open * 10) / 10,
      high: Math.round(high * 10) / 10,
      low: Math.round(low * 10) / 10,
      close: Math.round(close * 10) / 10,
      volume: Math.abs(close - open) * 10000,
      details: avgDetails,
    });
  }
  
  // 调整数据使平均等于八字综合分
  const currentAvg = kline.reduce((a, b) => a + b.close, 0) / kline.length;
  const adjustment = targetOverall - currentAvg;
  
  for (const item of kline) {
    const adjustedClose = Math.max(0, Math.min(100, item.close + adjustment));
    
    if (item.close > 0) {
      const ratio = adjustedClose / item.close;
      
      item.close = Math.round(adjustedClose * 10) / 10;
      item.open = Math.round(Math.max(0, Math.min(100, item.open * ratio)) * 10) / 10;
      item.high = Math.round(Math.max(0, Math.min(100, item.high * ratio)) * 10) / 10;
      item.low = Math.round(Math.max(0, Math.min(100, item.low * ratio)) * 10) / 10;
      
      item.details.career = Math.max(0, Math.min(100, Math.round(item.details.career * ratio)));
      item.details.wealth = Math.max(0, Math.min(100, Math.round(item.details.wealth * ratio)));
      item.details.love = Math.max(0, Math.min(100, Math.round(item.details.love * ratio)));
      item.details.health = Math.max(0, Math.min(100, Math.round(item.details.health * ratio)));
    } else {
      item.close = Math.round(adjustedClose * 10) / 10;
      item.open = item.close;
      item.high = Math.min(100, item.close + 2);
      item.low = Math.max(0, item.close - 2);
      
      item.details.career = Math.round(adjustedClose);
      item.details.wealth = Math.round(adjustedClose);
      item.details.love = Math.round(adjustedClose);
      item.details.health = Math.round(adjustedClose);
    }
    
    item.details.overall = calculateWeightedOverall(item.details);
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
  const detail = getBaziDetail(birthYear, birthMonth, birthDay, birthHour, gender);
  const analysis = analyzeBaziComplete(detail);
  const daYun = calculateDaYun(birthYear, birthMonth, birthDay, birthHour, gender);
  
  const ty = targetYear || new Date().getFullYear();
  const tm = targetMonth || new Date().getMonth() + 1;
  const td = targetDay || new Date().getDate();
  
  switch (period) {
    case '1d': {
      const currentDaYun = daYun.find((d: any) => ty >= d.开始年份 && ty <= d.结束年份) || daYun[0];
      const liuNian = calculateLiuNianGanZhi(ty);
      return generateShiChenKLine(ty, tm, td, currentDaYun, liuNian, analysis);
    }
    case '1m': {
      const currentDaYun = daYun.find((d: any) => ty >= d.开始年份 && ty <= d.结束年份) || daYun[0];
      const liuNian = calculateLiuNianGanZhi(ty);
      return generateDayKLineFromShiChen(ty, tm, currentDaYun, liuNian, analysis);
    }
    case '1y': {
      const currentDaYun = daYun.find((d: any) => ty >= d.开始年份 && ty <= d.结束年份) || daYun[0];
      const liuNian = calculateLiuNianGanZhi(ty);
      return generateMonthKLineFromDays(ty, currentDaYun, liuNian, analysis);
    }
    case '10y':
      return generateYearKLineFromMonths(birthYear, 10, daYun, analysis);
    case 'all':
      return generateYearKLineFromMonths(birthYear, 80, daYun, analysis);
    default:
      return generateYearKLineFromMonths(birthYear, 80, daYun, analysis);
  }
}

export default generateLifeKLine;