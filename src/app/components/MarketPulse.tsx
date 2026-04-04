'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Globe, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';

type MarketType = 'sh' | 'nasdaq' | 'btc' | 'gold';

type MarketCard = {
  name: string;
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  element: string;
  trend: 'up' | 'down' | 'neutral';
  high?: number;
  low?: number;
};

type SectorRow = {
  industryName: string;
  primaryElement: string;
  secondaryElement?: string;
  heatScore: number;
  summaryText: string;
};

type MacroCycle = {
  cycleType: string;
  phaseName: string;
  theme: string;
  summaryText: string;
  score: number;
};

const marketOrder: MarketType[] = ['sh', 'nasdaq', 'btc', 'gold'];

const marketFallbacks: Record<MarketType, MarketCard> = {
  sh: { name: '上证指数', symbol: 'SH', price: Number.NaN, change: Number.NaN, changePercent: Number.NaN, element: '土', trend: 'neutral' },
  nasdaq: { name: '纳斯达克', symbol: 'NASDAQ', price: Number.NaN, change: Number.NaN, changePercent: Number.NaN, element: '木', trend: 'neutral' },
  btc: { name: '比特币', symbol: 'BTC', price: Number.NaN, change: Number.NaN, changePercent: Number.NaN, element: '金', trend: 'neutral' },
  gold: { name: '黄金', symbol: 'GOLD', price: Number.NaN, change: Number.NaN, changePercent: Number.NaN, element: '土', trend: 'neutral' },
};

function toNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function formatMarketValue(item: MarketCard) {
  const price = toNumber(item.price);
  if (price === null) return '--';
  if (item.symbol === 'BTC' || item.symbol === 'GOLD') {
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function changeText(item: MarketCard) {
  const pct = toNumber(item.changePercent);
  if (pct === null) return '--';
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
}

export default function MarketPulse() {
  const { baziResult } = useUser();
  const [markets, setMarkets] = useState<MarketCard[]>([]);
  const [sectors, setSectors] = useState<SectorRow[]>([]);
  const [macroCycles, setMacroCycles] = useState<MacroCycle[]>([]);
  const [cosmic, setCosmic] = useState<any>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const marketResults = await Promise.all(
          marketOrder.map(async (type) => {
            try {
              const response = await fetch(`/api/market?type=${type}`, { cache: 'no-store' });
              const result = await response.json();
              return result?.success ? result.data : marketFallbacks[type];
            } catch {
              return marketFallbacks[type];
            }
          })
        );

        const [sectorRes, macroRes, cosmicRes] = await Promise.all([
          fetch('/api/industry/five-elements', { cache: 'no-store' }).then((r) => r.json()),
          fetch('/api/macro/cycles', { cache: 'no-store' }).then((r) => r.json()),
          fetch('/api/cosmic/daily', { cache: 'no-store' }).then((r) => r.json()),
        ]);

        if (!active) return;

        setMarkets(marketResults as MarketCard[]);
        setSectors(Array.isArray(sectorRes?.data) ? sectorRes.data : []);
        setMacroCycles(Array.isArray(macroRes?.data) ? macroRes.data : []);
        setCosmic(cosmicRes?.data || null);
      } catch (error) {
        console.error('MarketPulse load failed:', error);
      }
    };

    load();
    const timer = setInterval(load, 30 * 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const mingliCycles = useMemo(() => {
    const currentPeriod = String(baziResult?.aiAnalysis?.currentPeriod || '进取期');
    const periodPhase = currentPeriod.includes('大运')
      ? currentPeriod.split('（')[0].replace('当前处于', '')
      : '当前大运';

    return [
      {
        name: '三元九运',
        phase: cosmic?.nineCycle?.name || '离火九运',
        status: cosmic?.nineCycle?.period || '2024-2043',
        color: 'text-orange-400',
      },
      {
        name: '流年运势',
        phase: cosmic?.ganzhiDay || '今日干支',
        status: cosmic?.dailyElementBias || '火土渐旺',
        color: 'text-orange-400',
      },
      {
        name: '个人大运',
        phase: periodPhase || '当前大运',
        status: currentPeriod.includes('建议') ? '进行中' : currentPeriod,
        color: 'text-emerald-400',
      },
    ];
  }, [baziResult, cosmic]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="text-center py-4">
        <h2 className="text-[32px] font-semibold text-white mb-2">市场脉动</h2>
        <p className="text-white/50">全球资产与命理周期的实时共振</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {markets.map((m, i) => {
          const pct = toNumber(m.changePercent);
          const up = pct === null ? false : m.trend !== 'down';
          return (
            <motion.div
              key={m.symbol || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-sm">{m.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60">{m.element}</span>
              </div>
              <div className="text-2xl font-semibold text-white mb-1">{formatMarketValue(m)}</div>
              <div className={`text-sm flex items-center gap-1 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {changeText(m)}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold">行业五行热力</h3>
        </div>
        <div className="space-y-4">
          {sectors.map((s, i) => (
            <div key={s.industryName || i} className="flex items-center gap-4">
              <div className="w-20 text-sm text-white/60">{s.industryName}</div>
              <div className="flex-1">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.heatScore}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        s.heatScore > 70
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : s.heatScore > 50
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                    }}
                  />
                </div>
              </div>
              <div className="w-10 text-right text-sm text-white/40">{s.heatScore}%</div>
              <div className="w-12 text-center">
                <span className="text-xs text-white/40">{s.primaryElement}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold">宏观周期</h3>
          </div>
          <div className="space-y-3">
            {macroCycles.map((c, i) => (
              <div key={c.cycleType || i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-white/50 text-sm">{c.cycleType}</span>
                <div className="text-right">
                  <div className="text-sm text-white">{c.phaseName}</div>
                  <div className={`text-xs ${c.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{c.theme}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold">命理周期</h3>
          </div>
          <div className="space-y-3">
            {mingliCycles.map((c, i) => (
              <div key={c.name || i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-white/50 text-sm">{c.name}</span>
                <div className="text-right">
                  <div className="text-sm text-white">{c.phase}</div>
                  <div className={`text-xs ${c.color}`}>{c.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
