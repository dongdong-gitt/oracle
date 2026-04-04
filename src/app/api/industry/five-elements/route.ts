import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const INDUSTRIES = [
  { name: 'AI科技', element: '火', secondary: '木', base: 92, desc: '离火九运核心' },
  { name: '新能源', element: '火', secondary: '土', base: 84, desc: '火土相生' },
  { name: '房地产', element: '土', secondary: '金', base: 38, desc: '土运承压' },
  { name: '金融', element: '金', secondary: '水', base: 56, desc: '金气企稳' },
  { name: '水利', element: '水', secondary: '木', base: 71, desc: '水势回暖' },
  { name: '农业', element: '木', secondary: '土', base: 49, desc: '木气待发' },
] as const;

function dayOffset() {
  const now = new Date();
  const day = Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', day: '2-digit' }).format(now));
  return (day % 5) - 2;
}

export async function GET() {
  const offset = dayOffset();
  const data = INDUSTRIES.map((item, index) => ({
    industryName: item.name,
    primaryElement: item.element,
    secondaryElement: item.secondary,
    heatScore: Math.max(20, Math.min(98, item.base + offset * (index % 3 === 0 ? 2 : 1))),
    summaryText: item.desc,
    updatedAt: new Date().toISOString(),
  }));

  return NextResponse.json({ success: true, data });
}
