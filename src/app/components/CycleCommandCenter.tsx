'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react';
import { useUser } from '../context/UserContext';

type ApiPeriod = '1d' | '1m' | '1y' | '10y' | 'all';

interface PeriodSignal {
  period: ApiPeriod;
  label: string;
  score: number;
  high: number;
  low: number;
  trend: number;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

const periodLabel: Record<ApiPeriod, string> = {
  '1d': '日运',
  '1m': '月运',
  '1y': '年运',
  '10y': '十年',
  all: '终身',
};

export default function CycleCommandCenter() {
  const { birthData } = useUser();
  const [loading, setLoading] = useState(false);
  const [fearIndex, setFearIndex] = useState<number | null>(null);
  const [signals, setSignals] = useState<PeriodSignal[]>([]);

  useEffect(() => {
    let active = true;
    if (!birthData) return;

    const run = async () => {
      setLoading(true);
      try {
        const [birthYear, birthMonth, birthDay] = birthData.birthDate.split('-').map(Number);
        const birthHour = Number(String(birthData.birthTime || '00:00').split(':')[0] || 0);
        const now = new Date();

        const periods: ApiPeriod[] = ['1d', '1m', '1y', '10y', 'all'];
        const jobs = periods.map(async (period) => {
          const params = new URLSearchParams({
            period,
            birthYear: String(birthYear),
            birthMonth: String(birthMonth),
            birthDay: String(birthDay),
            birthHour: String(birthHour),
            gender: birthData.gender,
            targetYear: String(now.getFullYear()),
            targetMonth: String(now.getMonth() + 1),
            targetDay: String(now.getDate()),
          });

          const response = await fetch(`/api/kline?${params.toString()}`, { cache: 'no-store' });
          const json = await response.json();
          const kline = Array.isArray(json?.data?.kline) ? json.data.kline : [];
          const first = kline[0];
          const last = kline[kline.length - 1];
          const trend = Number(last?.close || 0) - Number(first?.open || 0);
          const score = Number(json?.data?.stats?.avg || last?.close || 70);
          const high = Number(json?.data?.stats?.high || score);
          const low = Number(json?.data?.stats?.low || score);

          return {
            period,
            label: periodLabel[period],
            score: Math.round(clamp(score, 0, 100)),
            high: Math.round(high * 100) / 100,
            low: Math.round(low * 100) / 100,
            trend: Math.round(trend * 100) / 100,
          } as PeriodSignal;
        });

        const fearJob = fetch('/api/market?type=fear', { cache: 'no-store' })
          .then((r) => r.json())
          .then((json) => Number(json?.data?.value))
          .catch(() => NaN);

        const [rows, fear] = await Promise.all([Promise.all(jobs), fearJob]);
        if (!active) return;

        setSignals(rows);
        setFearIndex(Number.isFinite(fear) ? fear : null);
      } catch (error) {
        console.error('cycle command center failed:', error);
        if (active) setSignals([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [birthData]);

  const allSignal = useMemo(() => signals.find((s) => s.period === 'all'), [signals]);
  const yearSignal = useMemo(() => signals.find((s) => s.period === '1y'), [signals]);
  const monthSignal = useMemo(() => signals.find((s) => s.period === '1m'), [signals]);

  const strategy = useMemo(() => {
    const lifeScore = Number(allSignal?.score || 70);
    const yearScore = Number(yearSignal?.score || 70);
    const marketFear = Number.isFinite(Number(fearIndex)) ? Number(fearIndex) : 50;

    if (lifeScore >= 78 && yearScore >= 75 && marketFear <= 35) {
      return {
        title: '进攻窗口',
        hint: '趋势和情绪共振，可分批进攻，但要带止损。',
        allocation: ['趋势资产 40%', '成长资产 30%', '稳健资产 20%', '现金 10%'],
      };
    }

    if (lifeScore <= 62 || yearScore <= 60 || marketFear >= 70) {
      return {
        title: '防守窗口',
        hint: '先守收益回撤，优先现金流和低波动资产。',
        allocation: ['稳健资产 40%', '现金 30%', '趋势资产 20%', '试错仓 10%'],
      };
    }

    return {
      title: '均衡窗口',
      hint: '主线可做，但仓位按节奏递进，避免一次性重仓。',
      allocation: ['趋势资产 30%', '成长资产 25%', '稳健资产 25%', '现金 20%'],
    };
  }, [allSignal, yearSignal, fearIndex]);

  const executionList = useMemo(() => {
    const y = Number(yearSignal?.score || 70);
    const m = Number(monthSignal?.score || 70);
    const f = Number.isFinite(Number(fearIndex)) ? Number(fearIndex) : 50;
    return [
      `年度主线分 ${y}：先确定 1 条主线，不做多线分散。`,
      `月度波动分 ${m}：本月按周拆解目标，周末复盘一次。`,
      `市场恐慌值 ${f}: 低于 35 可分批加仓，高于 70 降杠杆。`,
    ];
  }, [yearSignal, monthSignal, fearIndex]);

  if (!birthData) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 text-white/80">
            <Activity className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold">周期信号面板</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center min-h-[96px]">
              <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {signals.map((item) => {
                const up = item.trend >= 0;
                return (
                  <motion.div
                    key={item.period}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
                  >
                    <div className="mb-1 text-xs text-white/50">{item.label}</div>
                    <div className="text-lg font-bold text-white">{item.score}</div>
                    <div className={`mt-1 flex items-center gap-1 text-xs ${up ? 'text-red-400' : 'text-emerald-400'}`}>
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {item.trend > 0 ? '+' : ''}
                      {item.trend.toFixed(2)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/80">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold">仓位策略</h3>
          </div>
          <div className="text-sm font-semibold text-amber-300">{strategy.title}</div>
          <p className="mt-1 text-xs leading-relaxed text-white/60">{strategy.hint}</p>
          <ul className="mt-3 space-y-1.5 text-xs text-white/75">
            {strategy.allocation.map((item) => (
              <li key={item} className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1.5">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h4 className="mb-2 text-sm font-semibold text-white/80">执行清单</h4>
        <div className="grid gap-2 md:grid-cols-3">
          {executionList.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-white/80">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

