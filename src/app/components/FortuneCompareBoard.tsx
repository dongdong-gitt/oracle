'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Flame, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useUser } from '../context/UserContext';

type Lang = 'zh' | 'en';
type UiPeriod = '1D' | '1M' | '1Y' | '10Y' | 'ALL';
type ApiPeriod = '1d' | '1m' | '1y' | '10y' | 'all';

interface Props {
  lang?: Lang;
  focusPeriod?: UiPeriod;
}

interface AxisScore {
  career: number;
  wealth: number;
  love: number;
  health: number;
  overall: number;
}

interface PeriodSummary {
  api: ApiPeriod;
  ui: UiPeriod;
  labelZh: string;
  labelEn: string;
  score: number;
  high: number;
  low: number;
  avg: number;
  trend: number;
  direction: 'up' | 'down' | 'flat';
  axis: AxisScore;
}

const PERIODS: Array<{ api: ApiPeriod; ui: UiPeriod; zh: string; en: string }> = [
  { api: '1d', ui: '1D', zh: '今日', en: 'Today' },
  { api: '1m', ui: '1M', zh: '本月', en: 'Month' },
  { api: '1y', ui: '1Y', zh: '本年', en: 'Year' },
  { api: '10y', ui: '10Y', zh: '十年', en: '10Y' },
  { api: 'all', ui: 'ALL', zh: '终身', en: 'Life' },
];

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function computeAxisFromKline(kline: any[], fallback: AxisScore): AxisScore {
  const details = kline
    .map((row) => row?.details)
    .filter((d) => d && [d.career, d.wealth, d.love, d.health, d.overall].every((n: unknown) => Number.isFinite(Number(n))));

  if (!details.length) return fallback;

  return {
    career: Math.round(avg(details.map((d) => Number(d.career)))),
    wealth: Math.round(avg(details.map((d) => Number(d.wealth)))),
    love: Math.round(avg(details.map((d) => Number(d.love)))),
    health: Math.round(avg(details.map((d) => Number(d.health)))),
    overall: Math.round(avg(details.map((d) => Number(d.overall)))),
  };
}

function buildFallbackSummary(base: AxisScore, item: (typeof PERIODS)[number]): PeriodSummary {
  const offsets: Record<ApiPeriod, number> = {
    '1d': -2,
    '1m': 0,
    '1y': 1,
    '10y': 2,
    all: 0,
  };
  const score = clamp(base.overall + offsets[item.api], 20, 95);

  return {
    api: item.api,
    ui: item.ui,
    labelZh: item.zh,
    labelEn: item.en,
    score,
    high: clamp(score + 3),
    low: clamp(score - 3),
    avg: score,
    trend: offsets[item.api],
    direction: offsets[item.api] > 0 ? 'up' : offsets[item.api] < 0 ? 'down' : 'flat',
    axis: {
      career: clamp(base.career + offsets[item.api]),
      wealth: clamp(base.wealth + offsets[item.api]),
      love: clamp(base.love + offsets[item.api]),
      health: clamp(base.health + offsets[item.api]),
      overall: score,
    },
  };
}

export default function FortuneCompareBoard({ lang = 'zh', focusPeriod = '1Y' }: Props) {
  const { birthData, baziResult } = useUser();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<PeriodSummary[]>([]);
  const [fear, setFear] = useState<{ value: number; classification: string } | null>(null);

  const baseScore: AxisScore = useMemo(() => {
    const score = (baziResult as any)?.aiAnalysis?.score || {};
    return {
      career: Number(score.career || 70),
      wealth: Number(score.wealth || 70),
      love: Number(score.love || 70),
      health: Number(score.health || 70),
      overall: Number(score.overall || 70),
    };
  }, [baziResult]);

  useEffect(() => {
    let active = true;
    if (!birthData) return;

    const [birthYear, birthMonth, birthDay] = birthData.birthDate.split('-').map(Number);
    const birthHour = Number(String(birthData.birthTime || '00:00').split(':')[0] || 0);
    const now = new Date();

    const fetchAll = async () => {
      setLoading(true);
      try {
        const jobs = PERIODS.map(async (item) => {
          const params = new URLSearchParams({
            period: item.api,
            birthYear: String(birthYear),
            birthMonth: String(birthMonth),
            birthDay: String(birthDay),
            birthHour: String(birthHour),
            gender: birthData.gender,
            targetYear: String(now.getFullYear()),
            targetMonth: String(now.getMonth() + 1),
            targetDay: String(now.getDate()),
          });

          const fallback = buildFallbackSummary(baseScore, item);

          try {
            const response = await fetch(`/api/kline?${params.toString()}`, { cache: 'no-store' });
            const result = await response.json();
            const kline = result?.data?.kline || [];
            const stats = result?.data?.stats || {};
            if (!result?.success || !Array.isArray(kline) || !kline.length) {
              return fallback;
            }

            const first = kline[0];
            const last = kline[kline.length - 1];
            const trend = Number(last?.close || 0) - Number(first?.open || 0);
            const direction = trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat';
            const axis = computeAxisFromKline(kline, fallback.axis);
            const avgScore = Number.isFinite(Number(stats?.avg)) ? Number(stats.avg) : axis.overall;

            return {
              api: item.api,
              ui: item.ui,
              labelZh: item.zh,
              labelEn: item.en,
              score: Math.round(avgScore),
              high: Number.isFinite(Number(stats?.high)) ? Number(stats.high) : Math.max(axis.overall, avgScore),
              low: Number.isFinite(Number(stats?.low)) ? Number(stats.low) : Math.min(axis.overall, avgScore),
              avg: avgScore,
              trend,
              direction,
              axis,
            } as PeriodSummary;
          } catch {
            return fallback;
          }
        });

        const [rows, fearRes] = await Promise.all([
          Promise.all(jobs),
          fetch('/api/market?type=fear', { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
        ]);

        if (!active) return;
        setSummaries(rows);

        const fearValue = Number(fearRes?.data?.value);
        if (Number.isFinite(fearValue)) {
          setFear({
            value: fearValue,
            classification: String(fearRes?.data?.classification || ''),
          });
        } else {
          setFear(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      active = false;
    };
  }, [birthData, baseScore]);

  const selected = summaries.find((s) => s.ui === focusPeriod) || summaries[2] || buildFallbackSummary(baseScore, PERIODS[2]);
  const resonance = clamp(Math.round(50 + (selected.score - 50) * 0.7 - Math.abs((fear?.value ?? 50) - 50) * 0.4), 0, 100);
  const recommendation =
    (fear?.value ?? 50) < 30 && selected.score >= 65
      ? lang === 'zh'
        ? '市场情绪偏低，可分批布局，但要严格风控。'
        : 'Fear is high; scale in gradually with strict risk controls.'
      : (fear?.value ?? 50) > 70 && selected.score < 60
        ? lang === 'zh'
          ? '市场过热且个人势能偏弱，建议降低杠杆。'
          : 'Market is overheated while your momentum is weak; reduce leverage.'
        : lang === 'zh'
          ? '保持中性仓位，按周期信号小步快跑。'
          : 'Keep neutral exposure and execute in small tactical steps.';

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/5 bg-[#1A1B1E] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">{lang === 'zh' ? '运势对比台' : 'Fortune Arena'}</h3>
            <p className="mt-1 text-xs text-white/40">
              {lang === 'zh' ? '同一评分规则下，对比日/月/年/十年/终身窗口' : 'Compare all time windows under one scoring engine'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40">{lang === 'zh' ? '焦点周期' : 'Focus'}</div>
            <div className="text-lg font-bold text-neon-blue">{focusPeriod}</div>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-white/50">{lang === 'zh' ? '运势对比计算中...' : 'Calculating comparison...'}</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            {summaries.map((item) => (
              <motion.div
                key={item.api}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-4 ${
                  item.ui === focusPeriod ? 'border-neon-blue/50 bg-neon-blue/10' : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-white/50">{lang === 'zh' ? item.labelZh : item.labelEn}</span>
                  <span className={item.direction === 'up' ? 'text-emerald-400' : item.direction === 'down' ? 'text-rose-400' : 'text-white/40'}>
                    {item.direction === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : item.direction === 'down' ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">{item.score}</div>
                <div className="mt-2 text-[11px] text-white/40">H {item.high.toFixed(1)} / L {item.low.toFixed(1)}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-[#1A1B1E] p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-neon-purple" />
            <h4 className="font-semibold">{lang === 'zh' ? '四维势能对比' : '4-Dimension Comparison'}</h4>
          </div>
          <div className="space-y-4">
            {[
              { key: 'career', label: lang === 'zh' ? '事业' : 'Career', color: 'bg-blue-400' },
              { key: 'wealth', label: lang === 'zh' ? '财运' : 'Wealth', color: 'bg-amber-400' },
              { key: 'love', label: lang === 'zh' ? '感情' : 'Love', color: 'bg-pink-400' },
              { key: 'health', label: lang === 'zh' ? '健康' : 'Health', color: 'bg-emerald-400' },
            ].map((row: { key: keyof AxisScore; label: string; color: string }) => {
              const nowValue = Number(selected.axis[row.key] || 0);
              const baseValue = Number(baseScore[row.key] || 0);
              return (
                <div key={row.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-white/60">{row.label}</span>
                    <span className="text-white/40">
                      {lang === 'zh' ? '当前' : 'Now'} {nowValue} / {lang === 'zh' ? '命盘基线' : 'Base'} {baseValue}
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`absolute left-0 top-0 h-full ${row.color}`} style={{ width: `${clamp(nowValue)}%` }} />
                    <div className="absolute top-0 h-full border-r-2 border-white/80" style={{ left: `${clamp(baseValue)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#1A1B1E] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Flame className="h-4 w-4 text-neon-pink" />
            <h4 className="font-semibold">{lang === 'zh' ? '情绪共振' : 'Sentiment Resonance'}</h4>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-white/50">{lang === 'zh' ? '币圈恐慌指数' : 'Crypto Fear Index'}</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-white">{fear?.value ?? '--'}</div>
              <div className="text-xs text-white/40">{fear?.classification || (lang === 'zh' ? '暂无' : 'N/A')}</div>
            </div>

            <div className="mt-2 text-sm text-white/50">{lang === 'zh' ? '你与市场的共振度' : 'Your Market Resonance'}</div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" style={{ width: `${resonance}%` }} />
            </div>
            <div className="text-2xl font-bold text-neon-cyan">{resonance}</div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-white/40">
                <Shield className="h-3 w-3" />
                {lang === 'zh' ? '策略建议' : 'Tactical Note'}
              </div>
              <p className="text-sm leading-relaxed text-white/70">{recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
