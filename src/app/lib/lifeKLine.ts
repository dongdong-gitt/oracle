/**
 * 人生K线核心算法 - V2.0
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

/**
 * 计算流年影响分数（-30到+30）
 */
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

/**
 * 计算流月影响分数（-15到+15）
 */
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
  
  return Math.max(-10, Math.min(10, score));
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
  
  return Math.max(-8, Math.min(8, score));
}

// ==================== K线生成函数 ====================

/**
 * 生成时辰K线（当日12个时辰）
 * 返回12个时辰的详细数据
 */
function generateShiChenKLine(
  year: number,
  month: number,
  day: number,
  daYun: any,
  liuNian: any,
  analysis: CompleteBaziAnalysis
): KLineData[] {
  const kline: KLineData[] = [];
  const shichen = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const baseScore = 65;
  
  const daYunEffect = calculateDaYunEffect(daYun, analysis);
  const liuNianEffect = calculateLiuNianEffect(liuNian, daYun, analysis);
  const liuYueEffect = calculateLiuYueEffect(year, month, liuNian, analysis);
  const liuYue = calculateYueZhu(year, month).join('');
  const liuRi = calculateRiZhu(year, month, day);
  const liuRiEffect = calculateLiuRiEffect(year, month, day, liuYue, analysis);
  
  // 计算12个时辰的基础分数
  const shiScores: number[] = [];
  for (let i = 0; i < 12; i++) {
    const hour = i * 2;
    const liuShiEffect = calculateLiuShiEffect(hour, liuRi, analysis);
    const totalEffect = daYunEffect + liuNianEffect + liuYueEffect + liuRiEffect + liuShiEffect;
    const score = Math.max(0, Math.min(100, baseScore + totalEffect));
    shiScores.push(score);
  }
  
  // 生成分项分数（在综合分基础上波动）
  for (let i = 0; i < 12; i++) {
    const overall = shiScores[i];
    const variation = 5; // 分项波动范围
    
    const details = {
      career: Math.max(0, Math.min(100, Math.round(overall + (Math.random() - 0.5) * variation * 2))),
      wealth: Math.max(0, Math.min(100, Math.round(overall + (Math.random() - 0.5) * variation * 2))),
      love: Math.max(0, Math.min(100, Math.round(overall + (Math.random() - 0.5) * variation * 2))),
      health: Math.max(0, Math.min(100, Math.round(overall + (Math.random() - 0.5) * variation * 2))),
      overall,
    };
    
    // 重新计算综合分确保加权平均正确
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
 * 每天的open=当天第一个时辰的close, close=当天最后一个时辰的close
 */
function generateDayKLineFromShiChen(
  year: number,
  month: number,
  daYun: any,
  liuNian: any,
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
    
    // 确保综合分是加权平均
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
 * 每月的open=当月第一天的close, close=当月最后一天的close
 */
function generateMonthKLineFromDays(
  year: number,
  daYun: any,
  liuNian: any,
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
    
    // 确保综合分是加权平均
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
 * 每年的open=当年第一月的close, close=当年最后一月的close
 * 关键：80年的平均close必须等于八字综合分
 */
function generateYearKLineFromMonths(
  birthYear: number,
  years: number,
  daYunList: any[],
  analysis: CompleteBaziAnalysis
): KLineData[] {
  const kline: KLineData[] = [];
  const startYear = birthYear + 7; // 7岁起运
  const targetOverall = analysis.scores.overall; // 八字综合分
  
  // 先生成原始数据
  const rawData: KLineData[] = [];
  for (let year = startYear; year < startYear + years; year++) {
    const currentDaYun = daYunList.find((d: any) => year >= d.开始年份 && year <= d.结束年份) || daYunList[0];
    const liuNian = { ganZhi: calculateLiuNianGanZhi(year), year };
    
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
    
    rawData.push({
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
  
  // 调整数据使80年平均等于八字综合分
  const currentAvg = rawData.reduce((a, b) => a + b.close, 0) / rawData.length;
  const adjustment = targetOverall - currentAvg;
  
  // 应用调整（保持波动，整体平移）
  for (const item of rawData) {
    const adjustedClose = Math.max(0, Math.min(100, item.close + adjustment));
    const adjustedOpen = Math.max(0, Math.min(100, item.open + adjustment));
    const adjustedHigh = Math.max(0, Math.min(100, item.high + adjustment));
    const adjustedLow = Math.max(0, Math.min(100, item.low + adjustment));
    
    item.close = Math.round(adjustedClose * 10) / 10;
    item.open = Math.round(adjustedOpen * 10) / 10;
    item.high = Math.round(adjustedHigh * 10) / 10;
    item.low = Math.round(adjustedLow * 10) / 10;
    
    // 同步调整分项
    item.details.career = Math.max(0, Math.min(100, Math.round(item.details.career + adjustment)));
    item.details.wealth = Math.max(0, Math.min(100, Math.round(item.details.wealth + adjustment)));
    item.details.love = Math.max(0, Math.min(100, Math.round(item.details.love + adjustment)));
    item.details.health = Math.max(0, Math.min(100, Math.round(item.details.health + adjustment)));
    item.details.overall = calculateWeightedOverall(item.details);
    
    kline.push(item);
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
    case '1d':
      // 返回当日12个时辰
      const currentDaYun1 = daYun.find((d: any) => ty >= d.开始年份 && ty <= d.结束年份) || daYun[0];
      const liuNian1 = { ganZhi: calculateLiuNianGanZhi(ty), year: ty };
      return generateShiChenKLine(ty, tm, td, currentDaYun1, liuNian1, analysis);
      
    case '1m':
      // 返回当月每天
      const currentDaYun2 = daYun.find((d: any) => ty >= d.开始年份 && ty <= d.结束年份) || daYun[0];
      const liuNian2 = { ganZhi: calculateLiuNianGanZhi(ty), year: ty };
      return generateDayKLineFromShiChen(ty, tm, currentDaYun2, liuNian2, analysis);
      
    case '1y':
      // 返回当年每月
      const currentDaYun3 = daYun.find((d: any) => ty >= d.开始年份 && ty <= d.结束年份) || daYun[0];
      const liuNian3 = { ganZhi: calculateLiuNianGanZhi(ty), year: ty };
      return generateMonthKLineFromDays(ty, currentDaYun3, liuNian3, analysis);
      
    case '10y':
      // 返回10年的年K线
      return generateYearKLineFromMonths(birthYear, 10, daYun, analysis);
      
    case 'all':
      // 返回终身80年的年K线（确保平均等于八字综合分）
      return generateYearKLineFromMonths(birthYear, 80, daYun, analysis);
      
    default:
      return generateYearKLineFromMonths(birthYear, 80, daYun, analysis);
  }
}

export default generateLifeKLine;