import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type ChinaParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getChinaNowParts(): ChinaParts {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour: pick('hour'),
    minute: pick('minute'),
    second: pick('second'),
  };
}

function getShichen(hour: number) {
  const table = [
    { name: '子时', start: 23 },
    { name: '丑时', start: 1 },
    { name: '寅时', start: 3 },
    { name: '卯时', start: 5 },
    { name: '辰时', start: 7 },
    { name: '巳时', start: 9 },
    { name: '午时', start: 11 },
    { name: '未时', start: 13 },
    { name: '申时', start: 15 },
    { name: '酉时', start: 17 },
    { name: '戌时', start: 19 },
    { name: '亥时', start: 21 },
  ];

  for (let i = table.length - 1; i >= 0; i -= 1) {
    if (hour >= table[i].start || (table[i].start === 23 && hour < 1)) return table[i].name;
  }
  return '子时';
}

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function getGanzhiDay(year: number, month: number, day: number) {
  const base = Date.UTC(1984, 1, 2);
  const target = Date.UTC(year, month - 1, day);
  const diff = Math.floor((target - base) / 86400000);
  const stem = STEMS[((diff % 10) + 10) % 10];
  const branch = BRANCHES[((diff % 12) + 12) % 12];
  return `${stem}${branch}`;
}

function getNineCycleIndex(parts: ChinaParts) {
  const base = 12;
  const seasonal = ((parts.month - 1) / 11) * 6;
  const daily = ((parts.day - 1) / 30) * 2;
  return Number((base + seasonal + daily).toFixed(1));
}

async function fetchHuangliGanzhi(parts: ChinaParts) {
  try {
    const response = await fetch('https://www.huangli.com/', {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) return null;
    const html = await response.text();

    const dateText = `${parts.year}年${String(parts.month).padStart(2, '0')}月${String(parts.day).padStart(2, '0')}日`;
    if (!html.includes(dateText)) return null;

    const matches = Array.from(html.matchAll(/<span class="gz">([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])<\/span>/g)).map((m) => m[1]);
    if (matches.length < 3) return null;

    return {
      yearGanzhi: matches[0],
      monthGanzhi: matches[1],
      dayGanzhi: matches[2],
    };
  } catch (error) {
    console.error('Failed to fetch huangli.com ganzhi:', error);
    return null;
  }
}

export async function GET() {
  const parts = getChinaNowParts();
  const shichen = getShichen(parts.hour);
  const huangliGanzhi = await fetchHuangliGanzhi(parts);
  const ganzhiDay = huangliGanzhi?.dayGanzhi || getGanzhiDay(parts.year, parts.month, parts.day);

  return NextResponse.json({
    success: true,
    data: {
      currentTime: `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`,
      currentShichen: shichen,
      ganzhiDay,
      lunarDate: null,
      jieqi: null,
      dailyElementBias: '火土渐旺',
      nineCycle: {
        name: '离火九运',
        score: getNineCycleIndex(parts),
        period: '2024-2043',
      },
      updatedAt: new Date().toISOString(),
    },
  });
}
