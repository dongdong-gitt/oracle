import { BirthInput, calculateChart } from '@/server/services/bazi.service';
import { buildKline } from '@/server/services/kline.service';

export interface ScoreDetails {
  career: number;
  wealth: number;
  love: number;
  health: number;
  overall: number;
}

export interface ScoringInput {
  birth: BirthInput;
  targetYear: number;
  targetMonth: number;
  targetDay: number;
}

function weightedOverall(input: Omit<ScoreDetails, 'overall'> | ScoreDetails) {
  return Math.round(input.career * 0.3 + input.wealth * 0.25 + input.love * 0.25 + input.health * 0.2);
}

function toScore(item: any): ScoreDetails {
  const details = item?.details || {};
  const score = {
    career: Number(details.career || 0),
    wealth: Number(details.wealth || 0),
    love: Number(details.love || 0),
    health: Number(details.health || 0),
  };
  return {
    ...score,
    overall: Number(details.overall || weightedOverall(score)),
  };
}

function aggregateScores(items: any[]): ScoreDetails {
  if (!items.length) {
    return { career: 60, wealth: 60, love: 60, health: 60, overall: 60 };
  }

  const total = items
    .map(toScore)
    .reduce(
      (acc, cur) => {
        acc.career += cur.career;
        acc.wealth += cur.wealth;
        acc.love += cur.love;
        acc.health += cur.health;
        return acc;
      },
      { career: 0, wealth: 0, love: 0, health: 0 }
    );

  const avg = {
    career: Math.round(total.career / items.length),
    wealth: Math.round(total.wealth / items.length),
    love: Math.round(total.love / items.length),
    health: Math.round(total.health / items.length),
  };

  return {
    ...avg,
    overall: weightedOverall(avg),
  };
}

export function runUnifiedScoringEngine(input: ScoringInput) {
  const chart = calculateChart(input.birth);
  const day = buildKline({
    period: '1d',
    birth: input.birth,
    targetYear: input.targetYear,
    targetMonth: input.targetMonth,
    targetDay: input.targetDay,
  });
  const month = buildKline({
    period: '1m',
    birth: input.birth,
    targetYear: input.targetYear,
    targetMonth: input.targetMonth,
    targetDay: input.targetDay,
  });
  const year = buildKline({
    period: '1y',
    birth: input.birth,
    targetYear: input.targetYear,
    targetMonth: input.targetMonth,
    targetDay: input.targetDay,
  });

  // High周期结果由 lower周期聚合。
  const dayScore = aggregateScores(day.kline);
  const monthScore = aggregateScores(month.kline);
  const yearScore = aggregateScores(year.kline);

  return {
    baseScores: chart.scores,
    scoreByPeriod: {
      day: dayScore,
      month: monthScore,
      year: yearScore,
    },
    klineRefs: {
      day: day.kline,
      month: month.kline,
      year: year.kline,
    },
    rule: {
      deterministic: true,
      randomUsed: false,
      highPeriodFromLowerPeriod: true,
    },
  };
}

