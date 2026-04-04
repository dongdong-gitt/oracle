'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, BarChart3, Waves, Gauge, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';

type ApiPeriod = '1m' | '1y' | 'all';

type PeriodSnapshot = {
  period: ApiPeriod;
  avg: number;
  trend: number;
  high: number;
  low: number;
};

type StrategyPack = {
  style: '稳健型' | '成长型' | '趋势型' | '防守型' | '现金流型' | '波段型';
  riskLevel: '低' | '中' | '中高' | '高';
  position: string;
  rhythm: string;
  products: string[];
  notes: string;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function buildStrategy(input: {
  lifeScore: number;
  yearScore: number;
  monthScore: number;
  fear: number;
  yearTrend: number;
  monthTrend: number;
}): StrategyPack {
  const { lifeScore, yearScore, monthScore, fear, yearTrend, monthTrend } = input;

  if (fear >= 70 || yearScore < 58) {
    return {
      style: '防守型',
      riskLevel: '低',
      position: '建议仓位 25%-40%，先保净值，再找确定性。',
      rhythm: '按周执行，单次动作小于总仓位 10%，优先减波动。',
      products: ['货基/短债', '高股息红利', '防御行业ETF', '现金管理类'],
      notes: '命盘周期偏弱叠加市场高恐慌，先守后攻。',
    };
  }

  if (lifeScore >= 78 && yearScore >= 74 && fear <= 35 && yearTrend > 0) {
    return {
      style: monthTrend >= 0 ? '趋势型' : '成长型',
      riskLevel: '中高',
      position: '建议仓位 60%-75%，分批进攻，不一次性打满。',
      rhythm: '周内按信号加减仓，回撤触发纪律止损。',
      products: ['宽基指数ETF', '行业成长ETF', '趋势跟随组合', '可转债增强'],
      notes: '命盘高周期与年周期同向，可适度进攻。',
    };
  }

  if (monthScore >= 70 && monthTrend > 0) {
    return {
      style: '波段型',
      riskLevel: '中高',
      position: '建议仓位 45%-60%，保留机动仓应对波动。',
      rhythm: '按月度节奏滚动交易，强于预期加，弱于预期减。',
      products: ['波段ETF组合', '趋势行业轮动', '中短债+权益增强'],
      notes: '短中周期偏强，适合“有纪律的波段”。',
    };
  }

  if (lifeScore >= 68 && yearScore >= 64) {
    return {
      style: '稳健型',
      riskLevel: '中',
      position: '建议仓位 45%-55%，收益与回撤平衡。',
      rhythm: '以月为单位调仓，避免频繁日内动作。',
      products: ['固收+组合', '红利低波ETF', '宽基指数定投', '现金管理'],
      notes: '命盘主线稳定，宜稳扎稳打做复利。',
    };
  }

  if (yearTrend > 0 && fear < 50) {
    return {
      style: '成长型',
      riskLevel: '中高',
      position: '建议仓位 50%-65%，主线集中，分散次要。',
      rhythm: '季度看主线，月度微调仓位。',
      products: ['成长宽基', '科技制造ETF', '中长期定投组合'],
      notes: '主周期可做进阶增长，但需控制回撤。',
    };
  }

  return {
    style: '现金流型',
    riskLevel: '中',
    position: '建议仓位 35%-50%，优先稳定现金流资产。',
    rhythm: '按季度优化结构，弱化高换手行为。',
    products: ['分红资产', '债券基金', 'REITs（可选）', '货基打底'],
    notes: '当前阶段重在现金流稳定和抗波动。',
  };
}

export default function LifeMarketBoard() {
  const { birthData, baziResult } = useUser();
  const [loading, setLoading] = useState(false);
  const [snapshots, setSnapshots] = useState<PeriodSnapshot[]>([]);
  const [fearIndex, setFearIndex] = useState<number>(50);

  useEffect(() => {
    let active = true;
    if (!birthData) return;

    const run = async () => {
      setLoading(true);
      try {
        const [birthYear, birthMonth, birthDay] = birthData.birthDate.split('-').map(Number);
        const birthHour = Number(String(birthData.birthTime || '00:00').split(':')[0] || 0);
        const now = new Date();

        const periods: ApiPeriod[] = ['1m', '1y', 'all'];
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
          const result = await response.json();
          const kline = Array.isArray(result?.data?.kline) ? result.data.kline : [];
          const stats = result?.data?.stats || {};
          const first = kline[0] || {};
          const last = kline[kline.length - 1] || {};

          return {
            period,
            avg: toNumber(stats.avg, toNumber(last.close, 70)),
            trend: toNumber(last.close, 70) - toNumber(first.open, 70),
            high: toNumber(stats.high, toNumber(last.close, 70)),
            low: toNumber(stats.low, toNumber(last.close, 70)),
          } as PeriodSnapshot;
        });

        const fearJob = fetch('/api/market?type=fear', { cache: 'no-store' })
          .then((r) => r.json())
          .then((json) => toNumber(json?.data?.value, NaN))
          .catch(() => NaN);

        const [rows, fear] = await Promise.all([Promise.all(jobs), fearJob]);
        if (!active) return;

        setSnapshots(rows);
        setFearIndex(Number.isFinite(fear) ? fear : 50);
      } catch (error) {
        console.error('LifeMarketBoard load failed:', error);
        if (active) {
          setSnapshots([]);
          setFearIndex(50);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [birthData]);

  const baseOverall = toNumber((baziResult as any)?.aiAnalysis?.score?.overall, 70);
  const allSnap = snapshots.find((x) => x.period === 'all');
  const yearSnap = snapshots.find((x) => x.period === '1y');
  const monthSnap = snapshots.find((x) => x.period === '1m');

  const lifeScore = Math.round(clamp(toNumber(allSnap?.avg, baseOverall)));
  const yearScore = Math.round(clamp(toNumber(yearSnap?.avg, lifeScore)));
  const monthScore = Math.round(clamp(toNumber(monthSnap?.avg, yearScore)));

  const strategy = useMemo(
    () =>
      buildStrategy({
        lifeScore,
        yearScore,
        monthScore,
        fear: fearIndex,
        yearTrend: toNumber(yearSnap?.trend, 0),
        monthTrend: toNumber(monthSnap?.trend, 0),
      }),
    [lifeScore, yearScore, monthScore, fearIndex, yearSnap, monthSnap]
  );

  const resonance = Math.round(clamp(50 + (lifeScore - 50) * 0.7 - Math.abs(fearIndex - 50) * 0.45));

  if (!birthData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-[#1A1B1E] border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4 text-white/90">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold">命盘风险画像</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">终身均分</span>
            <span className="font-semibold text-white">{lifeScore}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">年运均分</span>
            <span className="font-semibold text-white">{yearScore}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">月运均分</span>
            <span className="font-semibold text-white">{monthScore}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">市场恐慌</span>
            <span className="font-semibold text-white">{fearIndex}</span>
          </div>
        </div>

        <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400" style={{ width: `${resonance}%` }} />
        </div>
        <div className="mt-2 text-xs text-white/50">命盘-市场共振度 {resonance}</div>

        <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <div className="text-xs text-cyan-200">推荐风格</div>
          <div className="text-lg font-semibold text-white mt-1">{strategy.style}</div>
          <div className="text-xs text-white/60 mt-1">风险等级: {strategy.riskLevel}</div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-3xl bg-[#1A1B1E] border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4 text-white/90">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold">命盘 × 产品映射</h3>
        </div>

        <ul className="space-y-2">
          {strategy.products.map((item) => (
            <li key={item} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white/70 leading-relaxed">
          <span className="text-white/90 font-medium">策略说明：</span>{strategy.notes}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl bg-[#1A1B1E] border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4 text-white/90">
          <Waves className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold">仓位与节奏</h3>
        </div>

        <div className="space-y-3 text-sm">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-white/80">
            <div className="flex items-center gap-2 mb-1 text-emerald-300">
              <Shield className="w-4 h-4" />
              仓位建议
            </div>
            <p>{strategy.position}</p>
          </div>

          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-white/80">
            <div className="flex items-center gap-2 mb-1 text-violet-300">
              <Sparkles className="w-4 h-4" />
              执行节奏
            </div>
            <p>{strategy.rhythm}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">年波动区间: {toNumber(yearSnap?.low, 0).toFixed(1)} - {toNumber(yearSnap?.high, 0).toFixed(1)}</div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">月趋势: {toNumber(monthSnap?.trend, 0) >= 0 ? '偏强' : '偏弱'}</div>
          </div>
        </div>

        {loading && <div className="mt-3 text-xs text-white/50">加载周期/市场数据中...</div>}
      </motion.div>
    </div>
  );
}
