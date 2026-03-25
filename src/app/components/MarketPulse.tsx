'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Globe, Zap } from 'lucide-react';

export default function MarketPulse() {
  const markets = [
    { name: '上证指数', value: '3,245.67', change: '+1.23%', up: true, element: '火' },
    { name: '纳斯达克', value: '15,234.50', change: '+2.45%', up: true, element: '木' },
    { name: '比特币', value: '$67,890', change: '-3.12%', up: false, element: '金' },
    { name: '黄金', value: '$2,345', change: '+0.89%', up: true, element: '土' },
  ];

  const sectors = [
    { name: 'AI科技', strength: 95, element: '火', desc: '离火九运核心' },
    { name: '新能源', strength: 88, element: '火', desc: '火土相生' },
    { name: '房地产', strength: 35, element: '土', desc: '土运已过' },
    { name: '金融', strength: 55, element: '金', desc: '金气渐弱' },
    { name: '水利', strength: 72, element: '水', desc: '水火既济' },
    { name: '农业', strength: 48, element: '木', desc: '木气待发' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* 标题 */}
      <div className="text-center py-4">
        <h2 className="text-[32px] font-semibold text-white mb-2">市场脉动</h2>
        <p className="text-white/50">全球资产与命理周期的实时共振</p>
      </div>

      {/* 主要指数 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {markets.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/50 text-sm">{m.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60">
                {m.element}
              </span>
            </div>
            <div className="text-2xl font-semibold text-white mb-1">{m.value}</div>
            <div className={`text-sm flex items-center gap-1 ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {m.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {m.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 行业热力 */}
      <div 
        className="p-6 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold">行业五行热力</h3>
        </div>
        <div className="space-y-4">
          {sectors.map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-20 text-sm text-white/60">{s.name}</div>
              <div className="flex-1">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.strength}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                    className="h-full rounded-full"
                    style={{
                      background: s.strength > 70 
                        ? 'linear-gradient(90deg, #10b981, #34d399)' 
                        : s.strength > 50 
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #ef4444, #f87171)'
                    }}
                  />
                </div>
              </div>
              <div className="w-10 text-right text-sm text-white/40">{s.strength}%</div>
              <div className="w-8 text-center">
                <span className="text-xs text-white/40">{s.element}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 周期信号 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className="p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold">宏观周期</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: '康波周期', phase: '上升段', status: 'AI技术革命', color: 'text-emerald-400' },
              { name: '朱格拉周期', phase: '扩张期', status: '产业更新加速', color: 'text-emerald-400' },
              { name: '基钦周期', phase: '再通胀', status: '资金回流', color: 'text-amber-400' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-white/50 text-sm">{c.name}</span>
                <div className="text-right">
                  <div className="text-sm text-white">{c.phase}</div>
                  <div className={`text-xs ${c.color}`}>{c.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold">命理周期</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: '三元九运', phase: '离火九运', status: '2024-2043', color: 'text-orange-400' },
              { name: '流年运势', phase: '乙巳年', status: '火土渐旺', color: 'text-orange-400' },
              { name: '个人大运', phase: '木火相生', status: '进取期', color: 'text-emerald-400' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
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
