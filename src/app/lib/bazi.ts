/**
 * 八字排盘计算模块
 * 基于 tyme4ts 权威算法，带降级处理
 */

// 尝试导入 tyme4ts，如果失败则使用降级方案
let tyme4ts: any = null;
try {
  tyme4ts = require('tyme4ts');
} catch (e) {
  console.warn('tyme4ts 加载失败，使用降级方案');
}

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 五行
const WU_XING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};
// 阴阳
const YIN_YANG_MAP: Record<string, string> = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴',
  '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴', '辰': '阳',
  '巳': '阴', '午': '阳', '未': '阴', '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴',
};

// 年干支计算
function getYearGanZhi(year: number): string {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

// 使用 tyme4ts 计算八字
function calculateWithTyme4ts(year: number, month: number, day: number, hour: number, gender: 'male' | 'female') {
  if (!tyme4ts) throw new Error('tyme4ts not available');
  
  const { SolarTime, LunarHour, Gender, DefaultEightCharProvider, LunarSect2EightCharProvider, ChildLimit } = tyme4ts;
  
  const eightCharProvider2 = new LunarSect2EightCharProvider();
  const GENDER_MAP: Record<string, any> = {
    'male': Gender.MAN,
    'female': Gender.WOMAN,
  };

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

  // 计算大运
  const childLimit = ChildLimit.fromSolarTime(solarTime, genderEnum);
  let decadeFortune = childLimit.getStartDecadeFortune();
  const daYunData = [];
  
  for (let i = 0; i < 10; i++) {
    const sixtyCycle = decadeFortune.getSixtyCycle();
    daYunData.push({
      age: decadeFortune.getStartAge(),
      ganZhi: sixtyCycle.toString(),
      开始年份: decadeFortune.getStartSixtyCycleYear().getYear(),
      结束年份: decadeFortune.getEndSixtyCycleYear().getYear(),
      开始年龄: decadeFortune.getStartAge(),
      结束年龄: decadeFortune.getEndAge(),
    });
    decadeFortune = decadeFortune.next(1);
  }

  const startDate = childLimit.getEndTime();

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
      神煞: { 年柱: [], 月柱: [], 日柱: [], 时柱: [] },
      大运: {
        起运日期: `${startDate.getYear()}-${startDate.getMonth()}-${startDate.getDay()}`,
        起运年龄: childLimit.getStartDecadeFortune().getStartAge(),
        大运: daYunData,
      },
      刑冲合会: { 天干: [], 地支: [] },
      真太阳时: { 日期: `${year}年${month}月${day}日`, 时间: `${hour}:00` },
      出生节气: null,
    },
    daYun: daYunData.map((d: any) => ({ age: d.age, ganZhi: d.ganZhi })),
  };
}

// 降级方案
function calculateFallback(year: number, month: number, day: number, hour: number, gender: 'male' | 'female') {
  const yearGZ = getYearGanZhi(year);
  const monthOffset = (month + 1) % 12;
  const monthGZ = TIAN_GAN[(year - 4 + monthOffset) % 10] + DI_ZHI[monthOffset];
  const dayOffset = Math.floor((new Date(year, month - 1, day).getTime() - new Date(1900, 0, 31).getTime()) / 86400000) % 60;
  const dayGZ = TIAN_GAN[dayOffset % 10] + DI_ZHI[dayOffset % 12];
  const hourZhiIndex = Math.floor((hour + 1) / 2) % 12;
  const dayGanIndex = dayOffset % 10;
  const hourGanIndex = (dayGanIndex * 2 + hourZhiIndex) % 10;
  const hourGZ = TIAN_GAN[hourGanIndex] + DI_ZHI[hourZhiIndex];

  const bazi = {
    year: yearGZ,
    month: monthGZ,
    day: dayGZ,
    hour: hourGZ,
    riZhu: dayGZ[0],
    wuXing: {
      yearTG: WU_XING_MAP[yearGZ[0]],
      yearDZ: WU_XING_MAP[yearGZ[1]],
      monthTG: WU_XING_MAP[monthGZ[0]],
      monthDZ: WU_XING_MAP[monthGZ[1]],
      dayTG: WU_XING_MAP[dayGZ[0]],
      dayDZ: WU_XING_MAP[dayGZ[1]],
      hourTG: WU_XING_MAP[hourGZ[0]],
      hourDZ: WU_XING_MAP[hourGZ[1]],
    },
    yinYang: {
      yearTG: YIN_YANG_MAP[yearGZ[0]],
      yearDZ: YIN_YANG_MAP[yearGZ[1]],
      monthTG: YIN_YANG_MAP[monthGZ[0]],
      monthDZ: YIN_YANG_MAP[monthGZ[1]],
      dayTG: YIN_YANG_MAP[dayGZ[0]],
      dayDZ: YIN_YANG_MAP[dayGZ[1]],
      hourTG: YIN_YANG_MAP[hourGZ[0]],
      hourDZ: YIN_YANG_MAP[hourGZ[1]],
    },
  };

  const daYunData = [];
  const startAge = 3;
  for (let i = 0; i < 10; i++) {
    const targetYear = year + startAge + i * 10;
    daYunData.push({
      age: startAge + i * 10,
      ganZhi: getYearGanZhi(targetYear),
      开始年份: targetYear,
      结束年份: targetYear + 9,
      开始年龄: startAge + i * 10,
      结束年龄: startAge + i * 10 + 9,
    });
  }

  return {
    bazi,
    detail: {
      性别: gender === 'male' ? '男' : '女',
      阳历: `${year}年${month}月${day}日 ${hour}:00`,
      农历: '简化计算',
      八字: `${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}`,
      生肖: DI_ZHI[(year - 4) % 12],
      日主: bazi.riZhu,
      年柱: { 天干: bazi.year[0], 地支: bazi.year[1] },
      月柱: { 天干: bazi.month[0], 地支: bazi.month[1] },
      日柱: { 天干: bazi.day[0], 地支: bazi.day[1] },
      时柱: { 天干: bazi.hour[0], 地支: bazi.hour[1] },
      胎元: '简化',
      命宫: '简化',
      身宫: '简化',
      神煞: { 年柱: [], 月柱: [], 日柱: [], 时柱: [] },
      大运: { 起运日期: '简化', 起运年龄: startAge, 大运: daYunData },
      刑冲合会: { 天干: [], 地支: [] },
      真太阳时: { 日期: `${year}年${month}月${day}日`, 时间: `${hour}:00` },
      出生节气: null,
    },
    daYun: daYunData.map(d => ({ age: d.age, ganZhi: d.ganZhi })),
  };
}

// 主函数
export function calculateBaZi(year: number, month: number, day: number, hour: number, gender: 'male' | 'female') {
  try {
    const result = calculateWithTyme4ts(year, month, day, hour, gender);
    return result.bazi;
  } catch (e) {
    console.warn('tyme4ts 计算失败，使用降级方案:', e);
    return calculateFallback(year, month, day, hour, gender).bazi;
  }
}

export function getBaziDetail(year: number, month: number, day: number, hour: number, gender: 'male' | 'female') {
  try {
    return calculateWithTyme4ts(year, month, day, hour, gender).detail;
  } catch (e) {
    console.warn('tyme4ts 计算失败，使用降级方案:', e);
    return calculateFallback(year, month, day, hour, gender).detail;
  }
}

export function calculateDaYun(year: number, month: number, day: number, hour: number, gender: 'male' | 'female') {
  try {
    return calculateWithTyme4ts(year, month, day, hour, gender).daYun;
  } catch (e) {
    console.warn('tyme4ts 计算失败，使用降级方案:', e);
    return calculateFallback(year, month, day, hour, gender).daYun;
  }
}

export function calculateLiuNian(year: number, month: number, day: number, hour: number, _gender: 'male' | 'female') {
  const currentYear = new Date().getFullYear();
  const liuNian = [];
  for (let i = 0; i < 10; i++) {
    const targetYear = currentYear + i;
    liuNian.push({ year: targetYear, ganZhi: getYearGanZhi(targetYear) });
  }
  return liuNian;
}
