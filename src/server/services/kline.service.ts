import { generateLifeKLine, KLinePeriod } from '@/app/lib/lifeKLine';
import { BirthInput } from '@/server/services/bazi.service';

export interface KlineRequest {
  period: KLinePeriod;
  birth: BirthInput;
  targetYear: number;
  targetMonth: number;
  targetDay: number;
}

export function buildKline(req: KlineRequest) {
  const kline = generateLifeKLine(
    req.period,
    req.birth.year,
    req.birth.month,
    req.birth.day,
    req.birth.hour,
    req.birth.gender,
    req.targetYear,
    req.targetMonth,
    req.targetDay
  );

  const closes = kline.map((item: any) => Number(item.close) || 0);
  const stats = closes.length
    ? {
        high: Math.max(...closes),
        low: Math.min(...closes),
        avg: Math.round((closes.reduce((sum, n) => sum + n, 0) / closes.length) * 100) / 100,
      }
    : { high: 0, low: 0, avg: 0 };

  return {
    period: req.period,
    count: kline.length,
    stats,
    kline,
  };
}
