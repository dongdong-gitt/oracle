'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  element: string;
  elementColor: string;
}

interface MarketModuleProps {
  type: 'sh' | 'nasdaq' | 'btc' | 'gold';
}

const marketConfig = {
  sh: {
    name: '上证指数',
    symbol: 'SSE',
    element: '火',
    elementColor: 'bg-red-500/20 text-red-400',
  },
  nasdaq: {
    name: '纳斯达克',
    symbol: 'NASDAQ',
    element: '木',
    elementColor: 'bg-green-500/20 text-green-400',
  },
  btc: {
    name: '比特币',
    symbol: 'BTC',
    element: '金',
    elementColor: 'bg-amber-500/20 text-amber-400',
  },
  gold: {
    name: '黄金',
    symbol: 'GOLD',
    element: '土',
    elementColor: 'bg-yellow-500/20 text-yellow-400',
  },
};

// 模拟数据（后续接入真实API）
const mockData: Record<string, MarketData> = {
  sh: {
    name: '上证指数',
    symbol: 'SSE',
    price: 3245.67,
    change: 39.45,
    changePercent: 1.23,
    element: '火',
    elementColor: 'bg-red-500/20 text-red-400',
  },
  nasdaq: {
    name: '纳斯达克',
    symbol: 'NASDAQ',
    price: 15234.50,
    change: 363.45,
    changePercent: 2.45,
    element: '木',
    elementColor: 'bg-green-500/20 text-green-400',
  },
  btc: {
    name: '比特币',
    symbol: 'BTC',
    price: 67890.00,
    change: -2187.50,
    changePercent: -3.12,
    element: '金',
    elementColor: 'bg-amber-500/20 text-amber-400',
  },
  gold: {
    name: '黄金',
    symbol: 'GOLD',
    price: 2345.00,
    change: 20.67,
    changePercent: 0.89,
    element: '土',
    elementColor: 'bg-yellow-500/20 text-yellow-400',
  },
};

export default function MarketModule({ type }: MarketModuleProps) {
  const [data, setData] = useState<MarketData>(mockData[type]);
  const [loading, setLoading] = useState(false);
  const config = marketConfig[type];

  // 后续接入真实API
  useEffect(() => {
    // TODO: 接入金融API
    // fetch(`/api/market/${type}`)
    //   .then(res => res.json())
    //   .then(data => setData(data));
  }, [type]);

  const isPositive = data.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4"
    >
      {/* 主卡片 */}
      <div className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{config.name}</h2>
            <p className="text-white/50 text-sm">{config.symbol}</p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${config.elementColor}`}>
            {config.element}
          </span>
        </div>

        <div className="flex items-end gap-4">
          <div className="text-4xl font-bold text-white">
            {type === 'btc' || type === 'gold' ? '$' : ''}
            {data.price.toLocaleString()}
          </div>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{data.changePercent}%</span>
          </div>
        </div>

        <div className="mt-4 text-sm text-white/50">
          涨跌: {isPositive ? '+' : ''}{data.change.toLocaleString()}
        </div>
      </div>

      {/* 走势图占位 */}
      <div className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">走势分析</h3>
          <Activity className="w-5 h-5 text-white/50" />
        </div>
        <div className="h-64 flex items-center justify-center bg-white/5 rounded-xl">
          <p className="text-white/30">金融API接入中...</p>
        </div>
      </div>

      {/* 命理关联 */}
      <div className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-medium text-white mb-4">命理关联</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.elementColor}`}>
              <span className="text-lg">{config.element}</span>
            </div>
            <div>
              <p className="text-white font-medium">五行属{config.element}</p>
              <p className="text-white/50 text-sm">与您的八字{config.element}行相生</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
