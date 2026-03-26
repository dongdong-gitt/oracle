/**
 * 八字排盘计算模块
 * 基于 yuhr123/bazi + tyme4ts 权威算法
 */

import { ChildLimit, DefaultEightCharProvider, Gender, HeavenStem, LunarHour, LunarSect2EightCharProvider, SolarTime } from 'tyme4ts';
// import { calculateRelation, getShen } from 'cantian-tymext'; // 暂时禁用，服务器端运行有问题

const eightCharProvider1 = new DefaultEightCharProvider();
const eightCharProvider2 = new LunarSect2EightCharProvider();

// 性别映射
const GENDER_MAP: Record<string, Gender> = {
  'male': Gender.MAN,
  'female': Gender.WOMAN,
};

// 类型定义
interface SixtyCycle {
  getHeavenStem: () => HeavenStem;
  getEarthBranch: () => any;
  getSound: () => { toString: () => string };
  getTen: () => { toString: () => string };
  getExtraEarthBranches: () => string[];
  toString: () => string;
}

interface PillarData {
  天干: {
    天干: string;
    五行: string;
    阴阳: string;
    十神?: string;
  };
  地支: {
    地支: string;
    五行: string;
    阴阳: string;
    藏干: {
      主气?: { 天干: string; 十神: string };
      中气?: { 天干: string; 十神: string };
      余气?: { 天干: string; 十神: string };
    };
  };
  纳音: string;
  旬: string;
  空亡: string;
  星运: string;
}

/**
 * 构建藏干对象
 */
const buildHideHeavenObject = (heavenStem: HeavenStem | null | undefined, me: HeavenStem) => {
  if (!heavenStem) {
    return undefined;
  }
  return {
    天干: heavenStem.toString(),
    十神: me.getTenStar(heavenStem).toString(),
  };
};

/**
 * 构建干支对象
 */
const buildSixtyCycleObject = (sixtyCycle: SixtyCycle, me?: HeavenStem): PillarData => {
  const heavenStem = sixtyCycle.getHeavenStem();
  const earthBranch = sixtyCycle.getEarthBranch();
  if (!me) {
    me = heavenStem;
  }
  return {
    天干: {
      天干: heavenStem.toString(),
      五行: heavenStem.getElement().toString(),
      阴阳: heavenStem.getYinYang() === 1 ? '阳' : '阴',
      十神: me === heavenStem ? undefined : me.getTenStar(heavenStem).toString(),
    },
    地支: {
      地支: earthBranch.toString(),
      五行: earthBranch.getElement().toString(),
      阴阳: earthBranch.getYinYang() === 1 ? '阳' : '阴',
      藏干: {
        主气: buildHideHeavenObject(earthBranch.getHideHeavenStemMain(), me),
        中气: buildHideHeavenObject(earthBranch.getHideHeavenStemMiddle(), me),
        余气: buildHideHeavenObject(earthBranch.getHideHeavenStemResidual(), me),
      },
    },
    纳音: sixtyCycle.getSound().toString(),
    旬: sixtyCycle.getTen().toString(),
    空亡: sixtyCycle.getExtraEarthBranches().join(''),
    星运: me.getTerrain(earthBranch).toString(),
  };
};

/**
 * 构建神煞对象
 */
const buildGodsObject = (eightChar: any, gender: Gender) => {
  // 暂时返回空数组，cantian-tymext 服务器端有问题
  return {
    年柱: [],
    月柱: [],
    日柱: [],
    时柱: [],
  };
};

/**
 * 构建大运对象
 */
const buildDecadeFortuneObject = (solarTime: SolarTime, gender: Gender, me: HeavenStem) => {
  const childLimit = ChildLimit.fromSolarTime(solarTime, gender);

  let decadeFortune = childLimit.getStartDecadeFortune();
  const firstStartAge = decadeFortune.getStartAge();
  const startDate = childLimit.getEndTime();
  const decadeFortuneObjects: any[] = [];
  
  for (let i = 0; i < 10; i++) {
    const sixtyCycle = decadeFortune.getSixtyCycle();
    const heavenStem = sixtyCycle.getHeavenStem();
    const earthBranch = sixtyCycle.getEarthBranch();
    decadeFortuneObjects.push({
      age: decadeFortune.getStartAge(),
      ganZhi: sixtyCycle.toString(),
      开始年份: decadeFortune.getStartSixtyCycleYear().getYear(),
      结束: decadeFortune.getEndSixtyCycleYear().getYear(),
      天干十神: me.getTenStar(heavenStem).getName(),
      地支十神: earthBranch.getHideHeavenStems().map((h: any) => me.getTenStar(h.getHeavenStem()).getName()),
      地支藏干: earthBranch.getHideHeavenStems().map((h: any) => h.toString()),
      开始年龄: decadeFortune.getStartAge(),
      结束年龄: decadeFortune.getEndAge(),
    });
    decadeFortune = decadeFortune.next(1);
  }

  return {
    起运日期: `${startDate.getYear()}-${startDate.getMonth()}-${startDate.getDay()}`,
    起运年龄: firstStartAge,
    大运: decadeFortuneObjects,
  };
};

/**
 * 主函数：计算八字
 */
export function calculateBaZi(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: 'male' | 'female'
) {
  // 创建阳历时间
  const solarTime = SolarTime.fromYmdHms(year, month, day, hour, 0, 0);
  const lunarHour = solarTime.getLunarHour();
  
  // 使用流派2（晚子时日柱算当天）
  LunarHour.provider = eightCharProvider2;
  
  const eightChar = lunarHour.getEightChar();
  const me = eightChar.getDay().getHeavenStem();
  const genderEnum = GENDER_MAP[gender];

  const yearPillar = buildSixtyCycleObject(eightChar.getYear(), me);
  const monthPillar = buildSixtyCycleObject(eightChar.getMonth(), me);
  const dayPillar = buildSixtyCycleObject(eightChar.getDay());
  const hourPillar = buildSixtyCycleObject(eightChar.getHour(), me);

  // 简化返回格式
  return {
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
    // 详细信息（用于AI解读）
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
      神煞: buildGodsObject(eightChar, genderEnum),
    },
  };
}

/**
 * 计算大运
 */
export function calculateDaYun(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: 'male' | 'female'
): Array<{ age: number; ganZhi: string }> {
  const solarTime = SolarTime.fromYmdHms(year, month, day, hour, 0, 0);
  const lunarHour = solarTime.getLunarHour();
  LunarHour.provider = eightCharProvider2;
  const eightChar = lunarHour.getEightChar();
  const me = eightChar.getDay().getHeavenStem();
  const genderEnum = GENDER_MAP[gender];
  
  const daYunResult = buildDecadeFortuneObject(solarTime, genderEnum, me);
  
  return daYunResult.大运.map((d: any) => ({
    age: d.age,
    ganZhi: d.ganZhi,
  }));
}

/**
 * 计算流年
 */
export function calculateLiuNian(
  year: number,
  month: number,
  day: number,
  hour: number,
  _gender: 'male' | 'female'
): Array<{ year: number; ganZhi: string }> {
  const currentYear = new Date().getFullYear();
  const liuNian = [];
  
  // 计算每年的干支
  for (let i = 0; i < 10; i++) {
    const targetYear = currentYear + i;
    // 年干支 = (年份 - 4) % 60
    const ganIndex = (targetYear - 4) % 10;
    const zhiIndex = (targetYear - 4) % 12;
    const ganZhi = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][ganIndex] + 
                   ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][zhiIndex];
    liuNian.push({
      year: targetYear,
      ganZhi: ganZhi,
    });
  }
  
  return liuNian;
}

/**
 * 获取完整八字详情（用于AI解读）
 */
export function getBaziDetail(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: 'male' | 'female'
) {
  const solarTime = SolarTime.fromYmdHms(year, month, day, hour, 0, 0);
  const lunarHour = solarTime.getLunarHour();
  LunarHour.provider = eightCharProvider2;
  const eightChar = lunarHour.getEightChar();
  const me = eightChar.getDay().getHeavenStem();
  const genderEnum = GENDER_MAP[gender];

  const yearPillar = buildSixtyCycleObject(eightChar.getYear(), me);
  const monthPillar = buildSixtyCycleObject(eightChar.getMonth(), me);
  const dayPillar = buildSixtyCycleObject(eightChar.getDay());
  const hourPillar = buildSixtyCycleObject(eightChar.getHour(), me);

  // 获取节气信息
  const solarDay = solarTime.getSolarDay();
  const term = solarDay.getTerm();
  const prevTerm = term?.getPrevious()?.getSolarDay();
  const nextTerm = term?.getNext()?.getSolarDay();
  
  // 计算距离节气的天数
  const daysSincePrevTerm = prevTerm ? solarDay.subtract(prevTerm) : 0;
  const daysToNextTerm = nextTerm ? nextTerm.subtract(solarDay) : 0;

  return {
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
    神煞: buildGodsObject(eightChar, genderEnum),
    大运: buildDecadeFortuneObject(solarTime, genderEnum, me),
    刑冲合会: {
      天干: [],
      地支: [],
    },
    // 真太阳时和节气信息
    真太阳时: {
      日期: `${solarDay.getYear()}年${solarDay.getMonth()}月${solarDay.getDay()}日`,
      时间: `${solarTime.getHour()}:${solarTime.getMinute().toString().padStart(2, '0')}`,
    },
    出生节气: term ? {
      节气名: term.toString(),
      节气日期: `${term.getSolarDay().getYear()}-${term.getSolarDay().getMonth()}-${term.getSolarDay().getDay()}`,
      距离天数: daysSincePrevTerm,
      描述: daysSincePrevTerm === 0 ? `出生于${term}` : `出生于${term}后${daysSincePrevTerm}天`,
    } : null,
  };
}
