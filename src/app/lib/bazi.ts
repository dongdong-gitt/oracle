/**
 * 八字排盘计算模块
 * 基于 tyme4ts + cantian-tymext 权威算法
 */

// 尝试导入库
let tyme4ts: any = null;
let cantianTymext: any = null;

try {
  tyme4ts = require('tyme4ts');
} catch (e) {
  console.warn('tyme4ts 加载失败');
}

try {
  cantianTymext = require('cantian-tymext');
} catch (e) {
  console.warn('cantian-tymext 加载失败');
}

// 天干地支基础数据
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WU_XING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};
const YIN_YANG_MAP: Record<string, string> = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴',
  '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴', '辰': '阳',
  '巳': '阴', '午': '阳', '未': '阴', '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴',
};

// 五行颜色
const WU_XING_COLOR: Record<string, string> = {
  '金': '#FFD700',
  '木': '#228B22',
  '水': '#1E90FF',
  '火': '#FF4500',
  '土': '#D2691E',
};

// 计算五行数量
function calculateWuXingCount(pillars: any[]) {
  const count: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  pillars.forEach(p => {
    count[p.天干.五行]++;
    count[p.地支.五行]++;
    if (p.地支.藏干?.主气) count[WU_XING_MAP[p.地支.藏干.主气.天干]]++;
    if (p.地支.藏干?.中气) count[WU_XING_MAP[p.地支.藏干.中气.天干]]++;
    if (p.地支.藏干?.余气) count[WU_XING_MAP[p.地支.藏干.余气.天干]]++;
  });
  return count;
}

// 计算神煞
function calculateShenSha(eightChar: any, gender: number) {
  if (!cantianTymext?.getShen) return { 年柱: [], 月柱: [], 日柱: [], 时柱: [] };
  try {
    const gods = cantianTymext.getShen(eightChar.toString(), gender);
    return {
      年柱: gods[0] || [],
      月柱: gods[1] || [],
      日柱: gods[2] || [],
      时柱: gods[3] || [],
    };
  } catch (e) {
    return { 年柱: [], 月柱: [], 日柱: [], 时柱: [] };
  }
}

// 计算刑冲合会
function calculateRelations(eightChar: any) {
  if (!cantianTymext?.calculateRelation) return { 天干: [], 地支: [] };
  try {
    const relations = cantianTymext.calculateRelation(eightChar.toString());
    return {
      天干: relations.tg || [],
      地支: relations.dz || [],
    };
  } catch (e) {
    return { 天干: [], 地支: [] };
  }
}

// 使用 tyme4ts 计算八字
function calculateWithTyme4ts(year: number, month: number, day: number, hour: number, gender: 'male' | 'female') {
  if (!tyme4ts) throw new Error('tyme4ts not available');
  
  const { SolarTime, LunarHour, Gender, LunarSect2EightCharProvider, ChildLimit } = tyme4ts;
  
  const eightCharProvider2 = new LunarSect2EightCharProvider();
  const GENDER_MAP: Record<string, any> = { 'male': Gender.MAN, 'female': Gender.WOMAN };

  const solarTime = SolarTime.fromYmdHms(year, month, day, hour, 0, 0);
  const lunarHour = solarTime.getLunarHour();
  LunarHour.provider = eightCharProvider2;
  
  const eightChar = lunarHour.getEightChar();
  const me = eightChar.getDay().getHeavenStem();
  const genderEnum = GENDER_MAP[gender];

  const buildSixtyCycleObject = (cycle: any, meStem?: any) => {
    const heavenStem = cycle.getHeavenStem();
    const earthBranch = cycle.getEarthBranch();
    if (!meStem) meStem = heavenStem;
    
    const getHideHeaven = (hideStem: any) => {
      if (!hideStem) return undefined;
      return {
        天干: hideStem.toString(),
        十神: meStem.getTenStar(hideStem).toString(),
      };
    };

    return {
      天干: {
        天干: heavenStem.toString(),
        五行: heavenStem.getElement().toString(),
        阴阳: heavenStem.getYinYang() === 1 ? '阳' : '阴',
        十神: meStem === heavenStem ? '日主' : meStem.getTenStar(heavenStem).toString(),
      },
      地支: {
        地支: earthBranch.toString(),
        五行: earthBranch.getElement().toString(),
        阴阳: earthBranch.getYinYang() === 1 ? '阳' : '阴',
        藏干: {
          主气: getHideHeaven(earthBranch.getHideHeavenStemMain()),
          中气: getHideHeaven(earthBranch.getHideHeavenStemMiddle()),
          余气: getHideHeaven(earthBranch.getHideHeavenStemResidual()),
        },
      },
      纳音: cycle.getSound().toString(),
      旬: cycle.getTen().toString(),
      空亡: cycle.getExtraEarthBranches().join(''),
      星运: meStem.getTerrain(earthBranch).toString(),
    };
  };

  const yearPillar = buildSixtyCycleObject(eightChar.getYear(), me);
  const monthPillar = buildSixtyCycleObject(eightChar.getMonth(), me);
  const dayPillar = buildSixtyCycleObject(eightChar.getDay());
  const hourPillar = buildSixtyCycleObject(eightChar.getHour(), me);

  // 计算五行
  const wuXingCount = calculateWuXingCount([yearPillar, monthPillar, dayPillar, hourPillar]);

  // 计算大运
  const childLimit = ChildLimit.fromSolarTime(solarTime, genderEnum);
  let decadeFortune = childLimit.getStartDecadeFortune();
  const daYunData = [];
  
  for (let i = 0; i < 10; i++) {
    const sixtyCycle = decadeFortune.getSixtyCycle();
    const ganZhi = sixtyCycle.toString();
    daYunData.push({
      age: decadeFortune.getStartAge(),
      ganZhi,
      大运名称: `${ganZhi}大运`,
      开始年份: decadeFortune.getStartSixtyCycleYear().getYear(),
      结束年份: decadeFortune.getEndSixtyCycleYear().getYear(),
      开始年龄: decadeFortune.getStartAge(),
      结束年龄: decadeFortune.getEndAge(),
    });
    decadeFortune = decadeFortune.next(1);
  }

  const startDate = childLimit.getEndTime();
  const genderNum = gender === 'male' ? 1 : 0;

  return {
    bazi: {
      year: eightChar.getYear().toString(),
      month: eightChar.getMonth().toString(),
      day: eightChar.getDay().toString(),
      hour: eightChar.getHour().toString(),
      riZhu: me.toString(),
      wuXing: {
        yearTG: yearPillar.天干.五行,
        yearDZ: yearPillar.地支.五行,
        monthTG: monthPillar.天干.五行,
        monthDZ: monthPillar.地支.五行,
        dayTG: dayPillar.天干.五行,
        dayDZ: dayPillar.地支.五行,
        hourTG: hourPillar.天干.五行,
        hourDZ: hourPillar.地支.五行,
      },
      yinYang: {
        yearTG: yearPillar.天干.阴阳,
        yearDZ: yearPillar.地支.阴阳,
        monthTG: monthPillar.天干.阴阳,
        monthDZ: monthPillar.地支.阴阳,
        dayTG: dayPillar.天干.阴阳,
        dayDZ: dayPillar.地支.阴阳,
        hourTG: hourPillar.天干.阴阳,
        hourDZ: hourPillar.地支.阴阳,
      },
    },
    detail: {
      性别: gender === 'male' ? '男' : '女',
      阳历: solarTime.toString(),
      农历: lunarHour.toString(),
      八字: eightChar.toString(),
      生肖: eightChar.getYear().getEarthBranch().getZodiac().toString(),
      日主: me.toString(),
      年柱: yearPillar,
      月柱: monthPillar,
      日柱: dayPillar,
      时柱: hourPillar,
      胎元: eightChar.getFetalOrigin().toString(),
      命宫: eightChar.getOwnSign().toString(),
      身宫: eightChar.getBodySign().toString(),
      神煞: calculateShenSha(eightChar, genderNum),
      大运: {
        起运日期: `${startDate.getYear()}-${String(startDate.getMonth()).padStart(2, '0')}-${String(startDate.getDay()).padStart(2, '0')}`,
        起运年龄: childLimit.getStartDecadeFortune().getStartAge(),
        大运: daYunData,
      },
      刑冲合会: calculateRelations(eightChar),
      五行统计: wuXingCount,
      真太阳时: { 日期: `${year}年${month}月${day}日`, 时间: `${hour}:00` },
      出生节气: null,
    },
    daYun: daYunData,
  };
}

// 主函数
export function calculateBaZi(year: number, month: number, day: number, hour: number, gender: 'male' | 'female') {
  try {
    return calculateWithTyme4ts(year, month, day, hour, gender).bazi;
  } catch (e) {
    console.warn('tyme4ts 计算失败:', e);
    throw e;
  }
}

export function getBaziDetail(year: number, month: number, day: number, hour: number, gender: 'male' | 'female') {
  try {
    return calculateWithTyme4ts(year, month, day, hour, gender).detail;
  } catch (e) {
    console.warn('tyme4ts 计算失败:', e);
    throw e;
  }
}

export function calculateDaYun(year: number, month: number, day: number, hour: number, gender: 'male' | 'female') {
  try {
    return calculateWithTyme4ts(year, month, day, hour, gender).daYun;
  } catch (e) {
    console.warn('tyme4ts 计算失败:', e);
    throw e;
  }
}

export function calculateLiuNian(year: number, month: number, day: number, hour: number, _gender: 'male' | 'female') {
  const currentYear = new Date().getFullYear();
  const liuNian = [];
  for (let i = 0; i < 10; i++) {
    const targetYear = currentYear + i;
    const ganIndex = (targetYear - 4) % 10;
    const zhiIndex = (targetYear - 4) % 12;
    const ganZhi = TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
    liuNian.push({ year: targetYear, ganZhi });
  }
  return liuNian;
}

/**
 * 八字运势评分算法
 * 基于五行力量、十神配置、大运流年计算
 */
export interface BaziScore {
  career: number;    // 事业分
  wealth: number;    // 财运分
  love: number;      // 感情分
  health: number;    // 健康分
  overall: number;   // 综合分
}

/**
 * 日主强弱分析结果
 */
export interface RiZhuStrength {
  strength: 'strong' | 'medium' | 'weak';  // 身强/中和/身弱
  score: number;           // 0-100
  reason: string;          // 判定理由
  needs: '克泄耗' | '生扶'; // 需要什么样的五行
  details: {
    seasonSupport: boolean;  // 是否得令
    rootSupport: boolean;    // 是否得地
    assistSupport: boolean;  // 是否得势
    seasonScore: number;     // 得令分数
    rootScore: number;       // 得地分数
    assistScore: number;     // 得势分数
  };
}

/**
 * 五行旺衰分析结果
 */
export interface WuXingBalance {
  distribution: Record<string, {
    power: number;      // 原始力量
    percentage: number; // 占比 %
    level: '旺' | '相' | '平' | '弱' | '死';
  }>;
  dominant: string;      // 最旺五行
  deficient: string;     // 最弱五行
  balance: '平衡' | '偏旺' | '偏弱';
  description: string;   // 五行特征描述
}

/**
 * 十神配置分析结果
 */
export interface ShiShenConfig {
  powers: Record<string, number>;  // 各十神力量
  dominant: string[];      // 最旺的2-3个十神
  missing: string[];       // 缺失或极弱的十神
  character: string;       // 性格特征总结
  careerType: string;      // 适合职业类型
  wealthType: string;      // 求财方式
}

/**
 * 格局判定结果
 */
export interface GeJuAnalysis {
  type: string;            // 格局类型
  level: '特殊格局' | '正格' | '变格' | '普通格';
  quality: '上' | '中' | '下';
  description: string;     // 格局特点
  condition: string;       // 成格条件
  confidence: number;      // 置信度 0-100
}

/**
 * 用神喜忌分析结果
 */
export interface YongShenAnalysis {
  yongShen: {
    element: string;
    shishen: string;
    reason: string;
  };
  xiShen: {
    element: string;
    reason: string;
  };
  jiShen: {
    element: string;
    reason: string;
  };
  xianShen: {
    element: string;
  };
  advice: {
    favorable: string[];
    unfavorable: string[];
  };
}

/**
 * 完整八字分析结果（给 DeepSeek 的结构化数据）
 */
export interface CompleteBaziAnalysis {
  riZhu: RiZhuStrength;
  wuXing: WuXingBalance;
  shiShen: ShiShenConfig;
  geJu: GeJuAnalysis;
  yongShen: YongShenAnalysis;
  scores: BaziScore;
  tags: string[];          // 特征标签
}

export function calculateBaziScore(
  detail: any,
  currentDaYun?: { ganZhi: string; age: number }
): BaziScore {
  const pillars = [detail.年柱, detail.月柱, detail.日柱, detail.时柱];
  const riZhu = detail.日主;
  const wuxing = detail.五行统计;
  
  // 1. 计算各五行力量（天干+地支+藏干）
  const wuxingPower: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  
  pillars.forEach((p: any) => {
    // 天干力量
    wuxingPower[p.天干.五行] += 1;
    // 地支力量
    wuxingPower[p.地支.五行] += 1;
    // 藏干力量（主气0.6，中气0.3，余气0.1）
    if (p.地支.藏干?.主气) wuxingPower[WU_XING_MAP[p.地支.藏干.主气.天干]] += 0.6;
    if (p.地支.藏干?.中气) wuxingPower[WU_XING_MAP[p.地支.藏干.中气.天干]] += 0.3;
    if (p.地支.藏干?.余气) wuxingPower[WU_XING_MAP[p.地支.藏干.余气.天干]] += 0.1;
  });
  
  // 2. 计算十神力量
  const shishenPower: Record<string, number> = {};
  pillars.forEach((p: any) => {
    const tg = p.天干.十神;
    const cg1 = p.地支.藏干?.主气?.十神;
    const cg2 = p.地支.藏干?.中气?.十神;
    const cg3 = p.地支.藏干?.余气?.十神;
    
    shishenPower[tg] = (shishenPower[tg] || 0) + 1;
    if (cg1) shishenPower[cg1] = (shishenPower[cg1] || 0) + 0.6;
    if (cg2) shishenPower[cg2] = (shishenPower[cg2] || 0) + 0.3;
    if (cg3) shishenPower[cg3] = (shishenPower[cg3] || 0) + 0.1;
  });
  
  // 3. 计算日主强弱
  const riZhuWuxing = WU_XING_MAP[riZhu];
  const riZhuPower = wuxingPower[riZhuWuxing];
  const totalPower = Object.values(wuxingPower).reduce((a, b) => a + b, 0);
  const riZhuRatio = riZhuPower / totalPower;
  const isStrong = riZhuRatio > 0.18; // 日主占比>18%为身强
  
  // 4. 大运影响
  let dayunBonus = 0;
  if (currentDaYun) {
    const dayunGan = currentDaYun.ganZhi[0];
    const dayunZhi = currentDaYun.ganZhi[1];
    const dayunWuxing = WU_XING_MAP[dayunGan];
    
    // 大运五行生助日主则加分
    if (dayunWuxing === riZhuWuxing || 
        (riZhuWuxing === '金' && dayunWuxing === '土') ||
        (riZhuWuxing === '木' && dayunWuxing === '水') ||
        (riZhuWuxing === '水' && dayunWuxing === '金') ||
        (riZhuWuxing === '火' && dayunWuxing === '木') ||
        (riZhuWuxing === '土' && dayunWuxing === '火')) {
      dayunBonus = 10;
    }
    // 大运五行克制日主则减分
    else if ((riZhuWuxing === '金' && dayunWuxing === '火') ||
             (riZhuWuxing === '木' && dayunWuxing === '金') ||
             (riZhuWuxing === '水' && dayunWuxing === '土') ||
             (riZhuWuxing === '火' && dayunWuxing === '水') ||
             (riZhuWuxing === '土' && dayunWuxing === '木')) {
      dayunBonus = -5;
    }
  }
  
  // 5. 计算各项分数
  // 事业分 = 官杀(正官+七杀) + 印星(正印+偏印) + 大运加成
  const guansha = (shishenPower['正官'] || 0) + (shishenPower['七杀'] || 0);
  const yinxing = (shishenPower['正印'] || 0) + (shishenPower['偏印'] || 0);
  let careerScore = Math.min(90, Math.max(40, 45 + guansha * 6 + yinxing * 4 + dayunBonus * 0.8));
  
  // 财运分 = 财星(正财+偏财) + 食伤(食神+伤官) + 大运加成
  const caixing = (shishenPower['正财'] || 0) + (shishenPower['偏财'] || 0);
  const shishang = (shishenPower['食神'] || 0) + (shishenPower['伤官'] || 0);
  let wealthScore = Math.min(90, Math.max(40, 45 + caixing * 6 + shishang * 4 + dayunBonus * 0.6));
  
  // 感情分 = 配偶星(男看财女看官) + 桃花 + 合会
  let peiouxing = 0;
  // 根据日主性别判断配偶星
  if (detail.性别 === '男') {
    // 男命看财星
    peiouxing = (shishenPower['正财'] || 0) + (shishenPower['偏财'] || 0) * 0.6;
  } else {
    // 女命看官杀
    peiouxing = (shishenPower['正官'] || 0) + (shishenPower['七杀'] || 0) * 0.6;
  }
  const taohua = detail.神煞?.日柱?.includes('桃花') ? 8 : 0;
  let loveScore = Math.min(90, Math.max(40, 50 + peiouxing * 5 + taohua + dayunBonus * 0.4));
  
  // 健康分 = 五行平衡度 + 日主强弱适中
  const wuxingVariance = Math.max(...Object.values(wuxingPower)) - Math.min(...Object.values(wuxingPower));
  const balanceScore = Math.max(0, 15 - wuxingVariance * 0.8); // 降低平衡分权重
  const riZhuHealth = isStrong ? 10 : (riZhuRatio < 0.12 ? 5 : 12); // 降低日主健康分
  let healthScore = Math.min(90, Math.max(35, 40 + balanceScore + riZhuHealth + dayunBonus * 0.2)); // 降低基础分和上限
  
  // 综合分 = 加权平均
  const overallScore = Math.round((careerScore * 0.3 + wealthScore * 0.25 + loveScore * 0.25 + healthScore * 0.2));
  
  return {
    career: Math.round(careerScore),
    wealth: Math.round(wealthScore),
    love: Math.round(loveScore),
    health: Math.round(healthScore),
    overall: overallScore,
  };
}

/**
 * 计算日主强弱
 * 基于得令、得地、得势三要素
 */
export function calculateRiZhuStrength(detail: any): RiZhuStrength {
  const pillars = [detail.年柱, detail.月柱, detail.日柱, detail.时柱];
  const riZhu = detail.日主;
  const riZhuWuxing = WU_XING_MAP[riZhu];
  const monthZhi = detail.月柱.地支.地支; // 月令
  
  // 五行生克关系
  const wuxingSheng: Record<string, string> = {
    '金': '水', '水': '木', '木': '火', '火': '土', '土': '金'
  };
  const wuxingKe: Record<string, string> = {
    '金': '木', '木': '土', '土': '水', '水': '火', '火': '金'
  };
  
  // 1. 得令（季节）- 月令五行与日主相同或相生
  const monthWuxing = WU_XING_MAP[monthZhi];
  let seasonScore = 0;
  let seasonSupport = false;
  
  if (monthWuxing === riZhuWuxing) {
    seasonScore = 25; // 同五行得令
    seasonSupport = true;
  } else if (wuxingSheng[monthWuxing] === riZhuWuxing) {
    seasonScore = 20; // 月令生助日主
    seasonSupport = true;
  } else if (wuxingKe[monthWuxing] === riZhuWuxing) {
    seasonScore = 5; // 月令克制日主
    seasonSupport = false;
  } else {
    seasonScore = 10; // 月令泄耗日主
    seasonSupport = false;
  }
  
  // 2. 得地（根气）- 日支、时支、年支有日主五行
  let rootScore = 0;
  let rootSupport = false;
  const rootPositions = [detail.日柱.地支, detail.时柱.地支, detail.年柱.地支];
  
  rootPositions.forEach((zhi: any, index: number) => {
    // 地支本气
    if (zhi.五行 === riZhuWuxing) {
      rootScore += index === 0 ? 15 : 8; // 日支最重要
      rootSupport = true;
    }
    // 藏干主气
    if (zhi.藏干?.主气?.天干 && WU_XING_MAP[zhi.藏干.主气.天干] === riZhuWuxing) {
      rootScore += index === 0 ? 10 : 5;
      rootSupport = true;
    }
    // 藏干中气
    if (zhi.藏干?.中气?.天干 && WU_XING_MAP[zhi.藏干.中气.天干] === riZhuWuxing) {
      rootScore += index === 0 ? 5 : 3;
    }
  });
  
  // 3. 得势（帮扶）- 天干有比劫、印星
  let assistScore = 0;
  let assistSupport = false;
  const ganPositions = [detail.年柱.天干, detail.月柱.天干, detail.时柱.天干];
  
  ganPositions.forEach((gan: any) => {
    const ganWuxing = gan.五行;
    const ganShiShen = gan.十神;
    
    if (ganWuxing === riZhuWuxing) {
      // 比劫（比肩、劫财）- 直接帮扶
      assistScore += 12;
      assistSupport = true;
    } else if (wuxingSheng[ganWuxing] === riZhuWuxing) {
      // 印星（正印、偏印）- 生助日主
      assistScore += 10;
      assistSupport = true;
    }
  });
  
  // 计算总分
  const totalScore = Math.min(100, seasonScore + rootScore + assistScore);
  
  // 判定强弱
  let strength: 'strong' | 'medium' | 'weak';
  let needs: '克泄耗' | '生扶';
  let reason: string;
  
  if (totalScore >= 70) {
    strength = 'strong';
    needs = '克泄耗';
    reason = `日主${riZhu}身强，${seasonSupport ? '得令' : ''}${rootSupport ? '得地' : ''}${assistSupport ? '得势' : ''}，五行力量充沛，宜克泄耗以平衡命局`;
  } else if (totalScore >= 40) {
    strength = 'medium';
    needs = Math.random() > 0.5 ? '克泄耗' : '生扶'; // 中和偏强或偏弱
    reason = `日主${riZhu}中和，五行力量相对平衡，需结合大运流年判断喜忌`;
  } else {
    strength = 'weak';
    needs = '生扶';
    reason = `日主${riZhu}身弱，${!seasonSupport ? '不得令' : ''}${!rootSupport ? '不得地' : ''}${!assistSupport ? '不得势' : ''}，五行力量不足，宜生扶以增强日主`;
  }
  
  return {
    strength,
    score: totalScore,
    reason,
    needs,
    details: {
      seasonSupport,
      rootSupport,
      assistSupport,
      seasonScore,
      rootScore,
      assistScore,
    },
  };
}

/**
 * 计算五行旺衰平衡
 */
export function calculateWuXingBalance(detail: any): WuXingBalance {
  const wuxingCount = detail.五行统计;
  const total = Object.values(wuxingCount).reduce((a: number, b: number) => a + b, 0) as number;
  
  const distribution: Record<string, { power: number; percentage: number; level: '旺' | '相' | '平' | '弱' | '死' }> = {};
  
  Object.entries(wuxingCount).forEach(([element, count]) => {
    const percentage = ((count as number) / total) * 100;
    let level: '旺' | '相' | '平' | '弱' | '死';
    
    if (percentage >= 25) level = '旺';
    else if (percentage >= 20) level = '相';
    else if (percentage >= 15) level = '平';
    else if (percentage >= 10) level = '弱';
    else level = '死';
    
    distribution[element] = {
      power: count as number,
      percentage: Math.round(percentage * 10) / 10,
      level,
    };
  });
  
  // 找出最旺和最弱
  const entries = Object.entries(distribution);
  const dominant = entries.reduce((a, b) => a[1].power > b[1].power ? a : b)[0];
  const deficient = entries.reduce((a, b) => a[1].power < b[1].power ? a : b)[0];
  
  // 判断平衡度
  const percentages = entries.map(e => e[1].percentage);
  const maxPct = Math.max(...percentages);
  const minPct = Math.min(...percentages);
  const variance = maxPct - minPct;
  
  let balance: '平衡' | '偏旺' | '偏弱';
  let description: string;
  
  if (variance < 10) {
    balance = '平衡';
    description = `五行相对平衡，${dominant}略旺，${deficient}稍弱，整体流通有情`;
  } else if (maxPct > 30) {
    balance = '偏旺';
    description = `${dominant}过旺，占比${distribution[dominant].percentage}%，需${WU_XING_KE[dominant]}来克制或${WU_XING_SHENG[dominant]}来泄耗`;
  } else {
    balance = '偏弱';
    description = `${deficient}偏弱，占比${distribution[deficient].percentage}%，需${WU_XING_SHENG[deficient]}来生助`;
  }
  
  return {
    distribution,
    dominant,
    deficient,
    balance,
    description,
  };
}

// 五行生克关系辅助
const WU_XING_SHENG: Record<string, string> = {
  '金': '土', '木': '水', '水': '金', '火': '木', '土': '火'
};

const WU_XING_KE: Record<string, string> = {
  '金': '火', '木': '金', '水': '土', '火': '水', '土': '木'
};

/**
 * 计算十神配置
 */
export function calculateShiShenConfig(detail: any): ShiShenConfig {
  const pillars = [detail.年柱, detail.月柱, detail.日柱, detail.时柱];
  const powers: Record<string, number> = {};
  
  // 计算各十神力量
  pillars.forEach((p: any) => {
    // 天干
    const tg = p.天干.十神;
    powers[tg] = (powers[tg] || 0) + 1;
    
    // 藏干
    if (p.地支.藏干?.主气?.十神) {
      powers[p.地支.藏干.主气.十神] = (powers[p.地支.藏干.主气.十神] || 0) + 0.6;
    }
    if (p.地支.藏干?.中气?.十神) {
      powers[p.地支.藏干.中气.十神] = (powers[p.地支.藏干.中气.十神] || 0) + 0.3;
    }
    if (p.地支.藏干?.余气?.十神) {
      powers[p.地支.藏干.余气.十神] = (powers[p.地支.藏干.余气.十神] || 0) + 0.1;
    }
  });
  
  // 找出最旺的3个和最弱的
  const sorted = Object.entries(powers).sort((a, b) => b[1] - a[1]);
  const dominant = sorted.slice(0, 3).filter(([_, v]) => v > 0.5).map(([k]) => k);
  const missing = sorted.filter(([_, v]) => v < 0.3).map(([k]) => k);
  
  // 性格特征总结
  const characterTraits: Record<string, string> = {
    '正官': '正直守规',
    '七杀': '果断有魄力',
    '正印': '善良有学识',
    '偏印': '敏感有创意',
    '正财': '务实稳重',
    '偏财': '善于理财',
    '食神': '温和有口福',
    '伤官': '聪明有才华',
    '比肩': '独立自强',
    '劫财': '重情义',
  };
  
  let character = '';
  dominant.forEach(s => {
    if (characterTraits[s]) character += characterTraits[s] + '、';
  });
  character = character.slice(0, -1) || '性格平和';
  
  // 职业类型判断
  let careerType = '';
  if ((powers['正官'] || 0) + (powers['七杀'] || 0) > 2) {
    careerType = '管理、公务员、军警等权威职业';
  } else if ((powers['正印'] || 0) + (powers['偏印'] || 0) > 2) {
    careerType = '教育、研究、文化、艺术等知识型职业';
  } else if ((powers['正财'] || 0) + (powers['偏财'] || 0) > 2) {
    careerType = '金融、商业、投资、销售等财利型职业';
  } else if ((powers['食神'] || 0) + (powers['伤官'] || 0) > 2) {
    careerType = '创意、技术、表演、自由职业等才华型职业';
  } else {
    careerType = '技术、专业、服务等稳健型职业';
  }
  
  // 求财方式
  let wealthType = '';
  if ((powers['正财'] || 0) > (powers['偏财'] || 0)) {
    wealthType = '正财为主，适合稳定收入、工资薪金、实业经营';
  } else if ((powers['偏财'] || 0) > (powers['正财'] || 0)) {
    wealthType = '偏财较旺，适合投资理财、副业兼职、机会型收入';
  } else {
    wealthType = '正偏财平衡，可稳健理财兼顾机会投资';
  }
  
  return {
    powers,
    dominant,
    missing,
    character,
    careerType,
    wealthType,
  };
}

/**
 * 格局判定
 */
export function calculateGeJu(detail: any, riZhuStrength: RiZhuStrength): GeJuAnalysis {
  const monthGan = detail.月柱.天干.十神;
  const monthZhiShiShen = detail.月柱.地支.藏干?.主气?.十神 || '';
  const shiShen = calculateShiShenConfig(detail);
  const wuXing = calculateWuXingBalance(detail);
  
  // 特殊格局判定（从格）
  if (riZhuStrength.strength === 'weak') {
    const maxShiShen = Object.entries(shiShen.powers).reduce((a, b) => a[1] > b[1] ? a : b);
    
    if (maxShiShen[1] > 3) {
      if (maxShiShen[0] === '正财' || maxShiShen[0] === '偏财') {
        return {
          type: '从财格',
          level: '特殊格局',
          quality: '上',
          description: '日主极弱，财星极旺，弃命从财，大富之命',
          condition: '忌比劫、印星，喜食伤、财星',
          confidence: 85,
        };
      }
      if (maxShiShen[0] === '正官' || maxShiShen[0] === '七杀') {
        return {
          type: '从杀格',
          level: '特殊格局',
          quality: '上',
          description: '日主极弱，官杀极旺，弃命从杀，大贵之命',
          condition: '忌食伤、印星，喜财星、官杀',
          confidence: 85,
        };
      }
      if (maxShiShen[0] === '食神' || maxShiShen[0] === '伤官') {
        return {
          type: '从儿格',
          level: '特殊格局',
          quality: '中',
          description: '日主极弱，食伤极旺，弃命从儿，聪明多能',
          condition: '忌印星，喜财星、食伤',
          confidence: 80,
        };
      }
    }
  }
  
  if (riZhuStrength.strength === 'strong') {
    const biJiePower = (shiShen.powers['比肩'] || 0) + (shiShen.powers['劫财'] || 0);
    if (biJiePower > 3) {
      return {
        type: '从强格',
        level: '特殊格局',
        quality: '中',
        description: '日主极旺，比劫林立，宜顺其旺势',
        condition: '忌官杀、财星，喜印星、比劫',
        confidence: 80,
      };
    }
  }
  
  // 普通格局判定
  const geJuMap: Record<string, { name: string; desc: string }> = {
    '正官': { name: '正官格', desc: '官星透干，正直守规，宜从政或管理' },
    '七杀': { name: '七杀格', desc: '七杀透干，果断有魄力，宜武职或创业' },
    '正印': { name: '正印格', desc: '印星透干，仁慈好学，宜文教或学术' },
    '偏印': { name: '偏印格', desc: '偏印透干，敏感多智，宜艺术或技术' },
    '正财': { name: '正财格', desc: '财星透干，务实稳重，宜经商或理财' },
    '偏财': { name: '偏财格', desc: '偏财透干，善于投机，宜投资或贸易' },
    '食神': { name: '食神格', desc: '食神透干，温和有福，宜餐饮或艺术' },
    '伤官': { name: '伤官格', desc: '伤官透干，聪明傲物，宜创意或技术' },
  };
  
  // 优先看月令透出
  if (geJuMap[monthGan]) {
    return {
      type: geJuMap[monthGan].name,
      level: '正格',
      quality: '中',
      description: geJuMap[monthGan].desc,
      condition: '月令本气透干，格局清纯',
      confidence: 90,
    };
  }
  
  // 看月支藏干透出
  if (geJuMap[monthZhiShiShen]) {
    return {
      type: geJuMap[monthZhiShiShen].name,
      level: '正格',
      quality: '中',
      description: geJuMap[monthZhiShiShen].desc,
      condition: '月令藏干透干，格局成立',
      confidence: 80,
    };
  }
  
  // 看最旺十神
  const maxShiShen = Object.entries(shiShen.powers).reduce((a, b) => a[1] > b[1] ? a : b);
  if (geJuMap[maxShiShen[0]] && maxShiShen[1] > 1.5) {
    return {
      type: geJuMap[maxShiShen[0]].name,
      level: '变格',
      quality: '中',
      description: geJuMap[maxShiShen[0]].desc,
      condition: '虽非月令透干，但十神旺相',
      confidence: 70,
    };
  }
  
  // 建禄格/月刃格
  if (monthGan === '比肩') {
    return {
      type: '建禄格',
      level: '正格',
      quality: '中',
      description: '月令比肩，日主临官，身强宜财官',
      condition: '喜财官食伤，忌印星比劫',
      confidence: 85,
    };
  }
  if (monthGan === '劫财') {
    return {
      type: '月刃格',
      level: '变格',
      quality: '中',
      description: '月令劫财，日主帝旺，身强宜官杀',
      condition: '喜官杀制劫，忌印星',
      confidence: 85,
    };
  }
  
  return {
    type: '普通格',
    level: '普通格',
    quality: '下',
    description: '格局不纯，需结合大运流年具体分析',
    condition: '无明显格局特征',
    confidence: 60,
  };
}

/**
 * 用神喜忌分析
 */
export function calculateYongShen(
  detail: any,
  riZhuStrength: RiZhuStrength,
  shiShen: ShiShenConfig,
  geJu: GeJuAnalysis
): YongShenAnalysis {
  const riZhu = detail.日主;
  const riZhuWuxing = WU_XING_MAP[riZhu];
  const wuxingSheng: Record<string, string> = {
    '金': '土', '木': '水', '水': '金', '火': '木', '土': '火'
  };
  const wuxingKe: Record<string, string> = {
    '金': '木', '木': '土', '土': '水', '水': '火', '火': '金'
  };
  
  let yongShenElement: string;
  let yongShenShiShen: string;
  let yongShenReason: string;
  
  if (riZhuStrength.strength === 'strong') {
    // 身强 - 需要克泄耗
    const guanSha = (shiShen.powers['正官'] || 0) + (shiShen.powers['七杀'] || 0);
    const yinXing = (shiShen.powers['正印'] || 0) + (shiShen.powers['偏印'] || 0);
    const caiXing = (shiShen.powers['正财'] || 0) + (shiShen.powers['偏财'] || 0);
    const biJie = (shiShen.powers['比肩'] || 0) + (shiShen.powers['劫财'] || 0);
    
    if (guanSha > 1.5) {
      // 官杀旺 - 用食伤制官杀
      yongShenElement = wuxingKe[riZhuWuxing]; // 食伤五行
      yongShenShiShen = '食神、伤官';
      yongShenReason = '官杀旺而身强，宜食伤制官杀，以泄秀生财';
    } else if (yinXing > 1.5) {
      // 印星旺 - 用财星破印
      yongShenElement = wuxingKe[wuxingSheng[riZhuWuxing]]; // 财星五行
      yongShenShiShen = '正财、偏财';
      yongShenReason = '印星旺而身强，宜财星破印，以财滋官杀';
    } else if (biJie > 1.5) {
      // 比劫旺 - 用官杀制比劫
      yongShenElement = wuxingKe[riZhuWuxing]; // 官杀五行
      yongShenShiShen = '正官、七杀';
      yongShenReason = '比劫旺而身强，宜官杀制比劫，以维护秩序';
    } else {
      // 一般身强 - 用食伤泄秀
      yongShenElement = wuxingKe[riZhuWuxing];
      yongShenShiShen = '食神、伤官';
      yongShenReason = '身强无依，宜食伤泄秀，以发挥其才华';
    }
  } else {
    // 身弱 - 需要生扶
    const guanSha = (shiShen.powers['正官'] || 0) + (shiShen.powers['七杀'] || 0);
    const caiXing = (shiShen.powers['正财'] || 0) + (shiShen.powers['偏财'] || 0);
    const shiShang = (shiShen.powers['食神'] || 0) + (shiShen.powers['伤官'] || 0);
    
    if (guanSha > 1.5) {
      // 官杀旺 - 用印星化杀生身
      yongShenElement = wuxingSheng[riZhuWuxing];
      yongShenShiShen = '正印、偏印';
      yongShenReason = '官杀旺而身弱，宜印星化杀生身，以转危为安';
    } else if (caiXing > 1.5) {
      // 财星旺 - 用比劫帮身抗财
      yongShenElement = riZhuWuxing;
      yongShenShiShen = '比肩、劫财';
      yongShenReason = '财星旺而身弱，宜比劫帮身，以承担财富';
    } else if (shiShang > 1.5) {
      // 食伤旺 - 用印星制食伤
      yongShenElement = wuxingSheng[riZhuWuxing];
      yongShenShiShen = '正印、偏印';
      yongShenReason = '食伤旺而身弱，宜印星制食伤，以生扶日主';
    } else {
      // 一般身弱 - 用印星生身
      yongShenElement = wuxingSheng[riZhuWuxing];
      yongShenShiShen = '正印、偏印';
      yongShenReason = '身弱无依，宜印星生身，以增强根基';
    }
  }
  
  // 喜神：生助用神的五行
  const xiShenElement = wuxingSheng[yongShenElement];
  
  // 忌神：克制用神的五行
  const jiShenElement = Object.entries(wuxingKe).find(([_, v]) => v === yongShenElement)?.[0] || '';
  
  // 闲神：其他五行
  const allWuxing = ['金', '木', '水', '火', '土'];
  const xianShenElement = allWuxing.find(w => 
    w !== yongShenElement && w !== xiShenElement && w !== jiShenElement
  ) || '';
  
  // 建议
  const wuxingColors: Record<string, string> = {
    '金': '白色、金色',
    '木': '绿色、青色',
    '水': '黑色、蓝色',
    '火': '红色、紫色',
    '土': '黄色、棕色',
  };
  
  const wuxingDirections: Record<string, string> = {
    '金': '西方',
    '木': '东方',
    '水': '北方',
    '火': '南方',
    '土': '中央',
  };
  
  const wuxingNumbers: Record<string, string> = {
    '金': '4、9',
    '木': '3、8',
    '水': '1、6',
    '火': '2、7',
    '土': '5、0',
  };
  
  return {
    yongShen: {
      element: yongShenElement,
      shishen: yongShenShiShen,
      reason: yongShenReason,
    },
    xiShen: {
      element: xiShenElement,
      reason: `生助用神${yongShenElement}，增强命局吉利`,
    },
    jiShen: {
      element: jiShenElement,
      reason: `克制用神${yongShenElement}，破坏命局平衡`,
    },
    xianShen: {
      element: xianShenElement,
    },
    advice: {
      favorable: [
        `有利方位：${wuxingDirections[yongShenElement]}、${wuxingDirections[xiShenElement]}`,
        `有利颜色：${wuxingColors[yongShenElement]}、${wuxingColors[xiShenElement]}`,
        `幸运数字：${wuxingNumbers[yongShenElement]}、${wuxingNumbers[xiShenElement]}`,
        `宜从事${yongShenElement}、${xiShenElement}五行相关行业`,
      ],
      unfavorable: [
        `不利方位：${wuxingDirections[jiShenElement]}`,
        `避免颜色：${wuxingColors[jiShenElement]}`,
        `慎选数字：${wuxingNumbers[jiShenElement]}`,
        `不宜从事${jiShenElement}五行相关行业`,
      ],
    },
  };
}

/**
 * 生成特征标签
 */
export function generateBaziTags(detail: any, analysis: CompleteBaziAnalysis): string[] {
  const tags: string[] = [];
  
  // 日主强弱标签
  if (analysis.riZhu.strength === 'strong') tags.push('身强');
  if (analysis.riZhu.strength === 'weak') tags.push('身弱');
  
  // 格局标签
  if (analysis.geJu.level === '特殊格局') tags.push(analysis.geJu.type);
  
  // 十神组合标签
  const ss = analysis.shiShen;
  if ((ss.powers['正官'] || 0) > 1 && (ss.powers['正印'] || 0) > 1) {
    tags.push('官印相生');
  }
  if ((ss.powers['食神'] || 0) > 1 && (ss.powers['正印'] || 0) > 1) {
    tags.push('伤官配印');
  }
  if ((ss.powers['伤官'] || 0) > 1 && (ss.powers['正财'] || 0) > 1) {
    tags.push('伤官生财');
  }
  
  // 五行标签
  if (analysis.wuXing.balance === '偏旺') {
    tags.push(`${analysis.wuXing.dominant}旺`);
  }
  if (analysis.wuXing.balance === '偏弱') {
    tags.push(`缺${analysis.wuXing.deficient}`);
  }
  
  // 神煞标签
  const shenSha = detail.神煞;
  if (shenSha?.日柱?.includes('桃花')) tags.push('桃花入命');
  if (shenSha?.日柱?.includes('天乙')) tags.push('天乙贵人');
  if (shenSha?.日柱?.includes('文昌')) tags.push('文昌入命');
  if (shenSha?.日柱?.includes('将星')) tags.push('将星入命');
  
  // 刑冲标签
  const relations = detail.刑冲合会;
  if (relations?.天干?.length > 0) tags.push('天干相合');
  if (relations?.地支?.some((r: any) => r.type === '冲')) tags.push('地支相冲');
  
  return tags;
}

/**
 * 完整八字分析（主函数）
 * 给 DeepSeek 提供结构化数据
 */
export function analyzeBaziComplete(detail: any, currentDaYun?: { ganZhi: string; age: number }): CompleteBaziAnalysis {
  // 1. 日主强弱
  const riZhu = calculateRiZhuStrength(detail);
  
  // 2. 五行平衡
  const wuXing = calculateWuXingBalance(detail);
  
  // 3. 十神配置
  const shiShen = calculateShiShenConfig(detail);
  
  // 4. 格局判定
  const geJu = calculateGeJu(detail, riZhu);
  
  // 5. 用神喜忌
  const yongShen = calculateYongShen(detail, riZhu, shiShen, geJu);
  
  // 6. 运势评分
  const scores = calculateBaziScore(detail, currentDaYun);
  
  // 组装结果
  const analysis: CompleteBaziAnalysis = {
    riZhu,
    wuXing,
    shiShen,
    geJu,
    yongShen,
    scores,
    tags: [],
  };
  
  // 7. 生成标签
  analysis.tags = generateBaziTags(detail, analysis);
  
  return analysis;
}
