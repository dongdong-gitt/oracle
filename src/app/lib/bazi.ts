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
  let careerScore = Math.min(95, Math.max(35, 40 + guansha * 8 + yinxing * 5 + dayunBonus));
  
  // 财运分 = 财星(正财+偏财) + 食伤(食神+伤官) + 大运加成
  const caixing = (shishenPower['正财'] || 0) + (shishenPower['偏财'] || 0);
  const shishang = (shishenPower['食神'] || 0) + (shishenPower['伤官'] || 0);
  let wealthScore = Math.min(95, Math.max(35, 40 + caixing * 8 + shishang * 5 + dayunBonus * 0.8));
  
  // 感情分 = 配偶星(男看财女看官) + 桃花 + 合会
  let peiouxing = 0;
  // 简化：庚金日主男，正财为乙木、偏财为甲木
  if (riZhu === '庚') {
    peiouxing = (shishenPower['正财'] || 0) + (shishenPower['偏财'] || 0) * 0.5;
  }
  const taohua = detail.神煞?.日柱?.includes('桃花') ? 10 : 0;
  let loveScore = Math.min(95, Math.max(35, 45 + peiouxing * 6 + taohua + dayunBonus * 0.5));
  
  // 健康分 = 五行平衡度 + 日主强弱适中
  const wuxingVariance = Math.max(...Object.values(wuxingPower)) - Math.min(...Object.values(wuxingPower));
  const balanceScore = Math.max(0, 20 - wuxingVariance);
  const riZhuHealth = isStrong ? 15 : (riZhuRatio < 0.12 ? 10 : 20);
  let healthScore = Math.min(95, Math.max(40, 50 + balanceScore + riZhuHealth + dayunBonus * 0.3));
  
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
