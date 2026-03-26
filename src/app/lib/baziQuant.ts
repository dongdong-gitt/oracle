/**
 * 八字运势量化计算模块
 * 基于子平八字理论，量化事业、财运、感情、健康
 */

import { calculateBaZi, calculateDaYun, getBaziDetail } from './bazi';

// 天干地支对应的五行分数
const WUXING_SCORE: Record<string, number> = {
  '木': 20, '火': 20, '土': 20, '金': 20, '水': 20,
};

// 十神对各项运势的影响权重
const SHISHEN_WEIGHTS = {
  // 事业（看官杀、印）
  career: {
    '正官': 1.5, '七杀': 1.3,    // 官星旺事业好
    '正印': 1.2, '偏印': 1.0,    // 印星有助事业
    '食神': 0.8, '伤官': 0.6,    // 食伤一般
    '正财': 0.7, '偏财': 0.7,    // 财星一般
    '比肩': 0.5, '劫财': 0.4,    // 比劫最弱
  },
  // 财运（看财星、食伤）
  wealth: {
    '正财': 1.5, '偏财': 1.4,    // 财星旺财好
    '食神': 1.3, '伤官': 1.2,    // 食伤生财
    '正官': 0.8, '七杀': 0.7,    // 官星一般
    '正印': 0.6, '偏印': 0.5,    // 印星耗财
    '比肩': 0.4, '劫财': 0.3,    // 比劫破财
  },
  // 感情（看财星/官星、桃花）
  love: {
    '正财': 1.4, '偏财': 1.2,    // 男看财
    '正官': 1.4, '七杀': 1.2,    // 女看官
    '食神': 1.0, '伤官': 0.8,    // 食伤一般
    '正印': 0.8, '偏印': 0.7,    // 印星一般
    '比肩': 0.6, '劫财': 0.5,    // 比劫争夫/妻
  },
  // 健康（看五行平衡、日主强弱）
  health: {
    '正印': 1.3, '偏印': 1.1,    // 印主健康
    '食神': 1.2, '伤官': 1.0,    // 食伤泄秀
    '正官': 0.9, '七杀': 0.6,    // 七杀克身
    '正财': 0.8, '偏财': 0.8,    // 财星耗身
    '比肩': 1.0, '劫财': 0.9,    // 比劫帮身
  },
};

// 地支藏干对运势的加成
const CANGGAN_BONUS = 0.3;

// 大运对运势的影响
const DAYUN_MULTIPLIER = 0.2;

// 流年对运势的影响
const LIUNIAN_MULTIPLIER = 0.1;

// 刑冲合会的影响
const RELATION_EFFECT = {
  '合': 1.1,      // 合则有情，运势提升
  '冲': 0.8,      // 冲则动荡，运势下降
  '刑': 0.7,      // 刑则损伤，运势大降
  '害': 0.85,     // 害则暗损，运势小降
  '会': 1.15,     // 会则聚气，运势大升
};

/**
 * 计算基础分数（基于八字原局）
 */
function calculateBaseScore(detail: any, gender: string) {
  const scores = {
    career: 60,
    wealth: 60,
    love: 60,
    health: 60,
  };

  const pillars = [detail.年柱, detail.月柱, detail.日柱, detail.时柱];

  // 计算各柱对运势的影响
  pillars.forEach((pillar, index) => {
    const weight = index === 2 ? 1.5 : 1; // 日柱权重更高
    
    // 天干十神影响
    const tianganShishen = pillar.天干.十神 || (index === 2 ? '日主' : '比肩');
    if (tianganShishen !== '日主') {
      scores.career += (SHISHEN_WEIGHTS.career[tianganShishen] || 1) * 5 * weight;
      scores.wealth += (SHISHEN_WEIGHTS.wealth[tianganShishen] || 1) * 5 * weight;
      scores.love += (SHISHEN_WEIGHTS.love[tianganShishen] || 1) * 5 * weight;
      scores.health += (SHISHEN_WEIGHTS.health[tianganShishen] || 1) * 5 * weight;
    }

    // 地支藏干影响（权重较低）
    const canggan = pillar.地支.藏干;
    [canggan.主气, canggan.中气, canggan.余气].forEach((gan, i) => {
      if (gan && gan.十神) {
        const cgWeight = [0.6, 0.3, 0.1][i] * CANGGAN_BONUS;
        scores.career += (SHISHEN_WEIGHTS.career[gan.十神] || 1) * 3 * cgWeight;
        scores.wealth += (SHISHEN_WEIGHTS.wealth[gan.十神] || 1) * 3 * cgWeight;
        scores.love += (SHISHEN_WEIGHTS.love[gan.十神] || 1) * 3 * cgWeight;
        scores.health += (SHISHEN_WEIGHTS.health[gan.十神] || 1) * 3 * cgWeight;
      }
    });
  });

  // 五行平衡度影响健康
  const wuxingCount: Record<string, number> = {};
  pillars.forEach(p => {
    wuxingCount[p.天干.五行] = (wuxingCount[p.天干.五行] || 0) + 1;
    wuxingCount[p.地支.五行] = (wuxingCount[p.地支.五行] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(wuxingCount));
  const minCount = Math.min(...Object.values(wuxingCount));
  const balanceScore = 100 - (maxCount - minCount) * 10;
  scores.health = scores.health * 0.7 + balanceScore * 0.3;

  // 限制在 30-95 之间
  return {
    career: Math.max(30, Math.min(95, Math.round(scores.career))),
    wealth: Math.max(30, Math.min(95, Math.round(scores.wealth))),
    love: Math.max(30, Math.min(95, Math.round(scores.love))),
    health: Math.max(30, Math.min(95, Math.round(scores.health))),
  };
}

/**
 * 计算大运影响
 */
function calculateDaYunEffect(daYun: any, baseScores: any, currentAge: number) {
  const currentDaYun = daYun.大运.find((d: any) => 
    currentAge >= d.开始年龄 && currentAge <= d.结束年龄
  );
  
  if (!currentDaYun) return baseScores;

  const ganShishen = currentDaYun.天干十神;
  const zhiShishen = currentDaYun.地支十神[0]; // 主气十神

  return {
    career: Math.min(100, Math.round(baseScores.career * (1 + (SHISHEN_WEIGHTS.career[ganShishen] || 1) * DAYUN_MULTIPLIER))),
    wealth: Math.min(100, Math.round(baseScores.wealth * (1 + (SHISHEN_WEIGHTS.wealth[ganShishen] || 1) * DAYUN_MULTIPLIER))),
    love: Math.min(100, Math.round(baseScores.love * (1 + (SHISHEN_WEIGHTS.love[ganShishen] || 1) * DAYUN_MULTIPLIER))),
    health: Math.min(100, Math.round(baseScores.health * (1 + (SHISHEN_WEIGHTS.health[ganShishen] || 1) * DAYUN_MULTIPLIER))),
  };
}

/**
 * 计算流年影响
 */
function calculateLiuNianEffect(liuNianGanZhi: string, baseScores: any) {
  // 简化：根据流年干支的五行生克计算
  const gan = liuNianGanZhi[0];
  const zhi = liuNianGanZhi[1];
  
  // 这里可以扩展更复杂的计算
  const randomFactor = (gan.charCodeAt(0) + zhi.charCodeAt(0)) % 10 - 5;
  
  return {
    career: Math.max(30, Math.min(100, baseScores.career + randomFactor)),
    wealth: Math.max(30, Math.min(100, baseScores.wealth + randomFactor)),
    love: Math.max(30, Math.min(100, baseScores.love + randomFactor)),
    health: Math.max(30, Math.min(100, baseScores.health + randomFactor)),
  };
}

/**
 * 生成人生K线数据
 * @param period - 'all' | '10y' | '1y' | '1m' | '1d'
 */
export function generateLifeKLine(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: 'male' | 'female',
  period: 'all' | '10y' | '1y' | '1m' | '1d' = '1y'
) {
  const detail = getBaziDetail(year, month, day, hour, gender);
  const daYun = detail.大运;
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - year;
  
  // 计算基础分数
  const baseScores = calculateBaseScore(detail, gender);
  
  const klineData = [];
  
  switch (period) {
    case 'all': // 终身 - 按年显示，从起运年开始
      {
        const startYear = year + daYun.起运年龄;
        for (let y = startYear; y <= startYear + 80; y++) {
          const age = y - year;
          const scores = calculateDaYunEffect(daYun, baseScores, age);
          const liuNianGanZhi = calculateLiuNianGanZhi(y);
          const finalScores = calculateLiuNianEffect(liuNianGanZhi, scores);
          
          klineData.push(createKLineItem(y.toString(), finalScores, `公元${y}年`));
        }
      }
      break;
      
    case '10y': // 10年 - 按季度显示
      {
        for (let q = 0; q < 40; q++) {
          const y = currentYear + Math.floor(q / 4);
          const quarter = (q % 4) + 1;
          const age = y - year;
          const scores = calculateDaYunEffect(daYun, baseScores, age);
          const seasonFactor = [1.05, 1.0, 0.95, 1.0][quarter - 1]; // 春夏秋冬
          
          klineData.push(createKLineItem(
            `${y}-Q${quarter}`,
            {
              career: Math.round(scores.career * seasonFactor),
              wealth: Math.round(scores.wealth * seasonFactor),
              love: Math.round(scores.love * seasonFactor),
              health: Math.round(scores.health * seasonFactor),
            },
            `${y}年第${quarter}季度`
          ));
        }
      }
      break;
      
    case '1y': // 1年 - 按月显示（12根K线）
      {
        for (let m = 1; m <= 12; m++) {
          const age = currentYear - year;
          const scores = calculateDaYunEffect(daYun, baseScores, age);
          // 月份对五行的影响
          const monthFactor = 1 + (m % 3 === 0 ? 0.05 : 0); // 季末运势略好
          
          klineData.push(createKLineItem(
            `${currentYear}-${m.toString().padStart(2, '0')}`,
            {
              career: Math.round(scores.career * monthFactor),
              wealth: Math.round(scores.wealth * monthFactor),
              love: Math.round(scores.love * monthFactor),
              health: Math.round(scores.health * monthFactor),
            },
            `${currentYear}年${m}月`
          ));
        }
      }
      break;
      
    case '1m': // 1月 - 按日显示
      {
        const daysInMonth = 30;
        for (let d = 1; d <= daysInMonth; d++) {
          const age = currentYear - year;
          const scores = calculateDaYunEffect(daYun, baseScores, age);
          // 日期波动
          const dayFactor = 1 + Math.sin(d * 0.2) * 0.1;
          
          klineData.push(createKLineItem(
            `${currentYear}-01-${d.toString().padStart(2, '0')}`,
            {
              career: Math.round(scores.career * dayFactor),
              wealth: Math.round(scores.wealth * dayFactor),
              love: Math.round(scores.love * dayFactor),
              health: Math.round(scores.health * dayFactor),
            },
            `1月${d}日`
          ));
        }
      }
      break;
      
    case '1d': // 1日 - 按时辰显示
      {
        const shichen = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        for (let i = 0; i < 12; i++) {
          const age = currentYear - year;
          const scores = calculateDaYunEffect(daYun, baseScores, age);
          // 时辰对日主的影响
          const shichenFactor = 1 + (i === 6 ? 0.1 : 0); // 午时阳气最旺
          
          klineData.push(createKLineItem(
            `时辰-${i}`,
            {
              career: Math.round(scores.career * shichenFactor),
              wealth: Math.round(scores.wealth * shichenFactor),
              love: Math.round(scores.love * shichenFactor),
              health: Math.round(scores.health * shichenFactor),
            },
            `${shichen[i]}时`
          ));
        }
      }
      break;
  }
  
  return {
    baseScores,
    kline: klineData,
    detail,
    daYun,
  };
}

/**
 * 创建K线数据项
 */
function createKLineItem(
  time: string,
  scores: { career: number; wealth: number; love: number; health: number },
  label: string
) {
  const overall = Math.round((scores.career + scores.wealth + scores.love + scores.health) / 4);
  const open = overall + (Math.random() - 0.5) * 10;
  const close = overall;
  const high = Math.max(open, close, scores.career, scores.wealth, scores.love, scores.health) + Math.random() * 5;
  const low = Math.min(open, close, scores.career, scores.wealth, scores.love, scores.health) - Math.random() * 5;
  
  return {
    time,
    label,
    open: Math.round(open * 10) / 10,
    high: Math.round(Math.min(100, high) * 10) / 10,
    low: Math.round(Math.max(0, low) * 10) / 10,
    close: Math.round(close * 10) / 10,
    volume: Math.abs(close - open) * 100,
    details: {
      ...scores,
      overall,
      analysis: generateAnalysis(scores),
      advice: generateAdvice(scores),
    },
  };
}

/**
 * 计算流年干支
 */
function calculateLiuNianGanZhi(year: number): string {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][ganIndex];
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][zhiIndex];
  return gan + zhi;
}

/**
 * 生成分析文本
 */
function generateAnalysis(scores: { career: number; wealth: number; love: number; health: number }) {
  const parts = [];
  if (scores.career >= 80) parts.push('事业运势强劲');
  else if (scores.career >= 60) parts.push('事业发展平稳');
  else parts.push('事业需谨慎');
  
  if (scores.wealth >= 80) parts.push('财运亨通');
  else if (scores.wealth >= 60) parts.push('财运尚可');
  else parts.push('注意理财');
  
  return parts.join('，') + '。';
}

/**
 * 生成建议文本
 */
function generateAdvice(scores: { career: number; wealth: number; love: number; health: number }) {
  const minScore = Math.min(scores.career, scores.wealth, scores.love, scores.health);
  if (minScore === scores.health) return '注意身体，劳逸结合。';
  if (minScore === scores.wealth) return '谨慎投资，开源节流。';
  if (minScore === scores.love) return '多关心身边人。';
  if (minScore === scores.career) return '稳扎稳打，厚积薄发。';
  return '顺势而为，把握机遇。';
}
