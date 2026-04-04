import {
  analyzeBaziComplete,
  calculateBaZi,
  calculateBaziScore,
  calculateDaYun,
  calculateLiuNian,
  getBaziDetail,
} from '@/app/lib/bazi';

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: 'male' | 'female';
}

export function calculateChart(input: BirthInput) {
  const bazi = calculateBaZi(input.year, input.month, input.day, input.hour, input.gender);
  const detail = getBaziDetail(input.year, input.month, input.day, input.hour, input.gender);
  const daYun = calculateDaYun(input.year, input.month, input.day, input.hour, input.gender);
  const liuNian = calculateLiuNian(input.year, input.month, input.day, input.hour, input.gender);

  const currentYear = new Date().getFullYear();
  const currentDaYun =
    daYun.find((d: any) => d?.开始年份 <= currentYear && d?.结束年份 >= currentYear) || daYun[0];

  const scoreResult = calculateBaziScore(detail, currentDaYun);
  const analysis = analyzeBaziComplete(detail, currentDaYun);

  const scores = {
    career: Math.round(scoreResult?.career ?? analysis?.scores?.career ?? 70),
    wealth: Math.round(scoreResult?.wealth ?? analysis?.scores?.wealth ?? 70),
    love: Math.round(scoreResult?.love ?? analysis?.scores?.love ?? 70),
    health: Math.round(scoreResult?.health ?? analysis?.scores?.health ?? 70),
    overall: Math.round(scoreResult?.overall ?? analysis?.scores?.overall ?? 70),
  };

  return {
    bazi,
    detail,
    daYun,
    liuNian,
    analysis,
    scores,
    currentDaYun,
  };
}

export function normalizeBirthInput(payload: any): BirthInput {
  return {
    year: Number(payload.year),
    month: Number(payload.month),
    day: Number(payload.day),
    hour: Number(payload.hour),
    gender: payload.gender === 'female' ? 'female' : 'male',
  };
}
