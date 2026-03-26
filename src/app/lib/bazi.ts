/**
 * 八字排盘计算模块 - 简化版
 * 服务器端使用硬编码数据避免第三方库问题
 */

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

// 年干支计算 (1984年是甲子年)
function getYearGanZhi(year: number): string {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

// 简化版八字计算
export function calculateBaZi(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: 'male' | 'female'
) {
  const yearGZ = getYearGanZhi(year);
  // 简化计算：使用固定偏移
  const monthOffset = (month + 1) % 12;
  const monthGZ = TIAN_GAN[(year - 4 + monthOffset) % 10] + DI_ZHI[monthOffset];
  
  // 日柱简化计算
  const dayOffset = Math.floor((new Date(year, month - 1, day).getTime() - new Date(1900, 0, 31).getTime()) / 86400000) % 60;
  const dayGZ = TIAN_GAN[dayOffset % 10] + DI_ZHI[dayOffset % 12];
  
  // 时柱
  const hourZhiIndex = Math.floor((hour + 1) / 2) % 12;
  const dayGanIndex = dayOffset % 10;
  const hourGanIndex = (dayGanIndex * 2 + hourZhiIndex) % 10;
  const hourGZ = TIAN_GAN[hourGanIndex] + DI_ZHI[hourZhiIndex];

  return {
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
}

// 计算大运
export function calculateDaYun(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: 'male' | 'female'
): Array<{ age: number; ganZhi: string }> {
  const startAge = 3;
  const daYun = [];
  const baseYear = year + startAge;
  
  for (let i = 0; i < 10; i++) {
    const targetYear = baseYear + i * 10;
    daYun.push({
      age: startAge + i * 10,
      ganZhi: getYearGanZhi(targetYear),
    });
  }
  
  return daYun;
}

// 计算流年
export function calculateLiuNian(
  year: number,
  month: number,
  day: number,
  hour: number,
  _gender: 'male' | 'female'
): Array<{ year: number; ganZhi: string }> {
  const currentYear = new Date().getFullYear();
  const liuNian = [];
  
  for (let i = 0; i < 10; i++) {
    const targetYear = currentYear + i;
    liuNian.push({
      year: targetYear,
      ganZhi: getYearGanZhi(targetYear),
    });
  }
  
  return liuNian;
}

// 获取完整八字详情
export function getBaziDetail(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: 'male' | 'female'
) {
  const bazi = calculateBaZi(year, month, day, hour, gender);
  const daYun = calculateDaYun(year, month, day, hour, gender);
  
  return {
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
    大运: { 大运: daYun },
    刑冲合会: { 天干: [], 地支: [] },
    真太阳时: { 日期: `${year}年${month}月${day}日`, 时间: `${hour}:00` },
    出生节气: null,
  };
}
