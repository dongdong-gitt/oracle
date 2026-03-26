'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Sparkles, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface MarketData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  element: string;
  elementColor: string;
  trend: 'up' | 'down' | 'neutral';
}

interface BaziAdvice {
  score: number;
  advice: string;
  direction: 'buy' | 'sell' | 'hold';
  reason: string;
}

interface MarketModuleProps {
  type: 'sh' | 'nasdaq' | 'btc' | 'gold';
}

const marketConfig = {
  sh: {
    name: '上证指数',
    symbol: 'SSE',
    element: '火',
    elementColor: 'from-red-500/20 to-orange-500/20',
    elementText: 'text-red-400',
    desc: 'A股市场风向标',
  },
  nasdaq: {
    name: '纳斯达克',
    symbol: 'NASDAQ',
    element: '木',
    elementColor: 'from-green-500/20 to-emerald-500/20',
    elementText: 'text-green-400',
    desc: '全球科技股指数',
  },
  btc: {
    name: '比特币',
    symbol: 'BTC',
    element: '金',
    elementColor: 'from-amber-500/20 to-yellow-500/20',
    elementText: 'text-amber-400',
    desc: '数字货币龙头',
  },
  gold: {
    name: '黄金',
    symbol: 'GOLD',
    element: '土',
    elementColor: 'from-yellow-500/20 to-amber-500/20',
    elementText: 'text-yellow-400',
    desc: '避险资产首选',
  },
};

// 模拟数据
const mockData: Record<string, MarketData> = {
  sh: {
    name: '上证指数',
    symbol: 'SSE',
    price: 3245.67,
    change: 39.45,
    changePercent: 1.23,
    element: '火',
    elementColor: 'bg-red-500/20 text-red-400',
    trend: 'up',
  },
  nasdaq: {
    name: '纳斯达克',
    symbol: 'NASDAQ',
    price: 15234.50,
    change: 363.45,
    changePercent: 2.45,
    element: '木',
    elementColor: 'bg-green-500/20 text-green-400',
    trend: 'up',
  },
  btc: {
    name: '比特币',
    symbol: 'BTC',
    price: 67890.00,
    change: -2187.50,
    changePercent: -3.12,
    element: '金',
    elementColor: 'bg-amber-500/20 text-amber-400',
    trend: 'down',
  },
  gold: {
    name: '黄金',
    symbol: 'GOLD',
    price: 2345.00,
    change: 20.67,
    changePercent: 0.89,
    element: '土',
    elementColor: 'bg-yellow-500/20 text-amber-400',
    trend: 'up',
  },
};

export default function MarketModule({ type }: MarketModuleProps) {
  const { baziResult } = useUser();
  const [data, setData] = useState<MarketData>(mockData[type]);
  const [advice, setAdvice] = useState<BaziAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const config = marketConfig[type];

  useEffect(() => {
    if (baziResult?.detail) {
      generateBaziAdvice();
    }
  }, [baziResult, type]);

  const generateBaziAdvice = async () => {
    setLoading(true);
    // 模拟AI分析（后续可接入真实API）
    const directions: ('buy' | 'sell' | 'hold')[] = ['buy', 'sell', 'hold'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    
    const adviceMap = {
      buy: {
        score: 75,
        advice: '建议逢低买入',
        direction: 'buy' as const,
        reason: `该品种五行属${config.element}，与您八字喜用神相合，当前运势利于${config.element}行相关投资。`,
      },
      sell: {
        score: 35,
        advice: '建议获利了结',
        direction: 'sell' as const,
        reason: `该品种五行属${config.element}，与您八字当前大运相克，建议暂时回避${config.element}行相关投资。`,
      },
      hold: {
        score: 55,
        advice: '建议持仓观望',
        direction: 'hold' as const,
        reason: `该品种五行属${config.element}，与您八字五行关系中性，可小仓位持有观察。`,
      },
    };
    
    setAdvice(adviceMap[randomDirection]);
    setLoading(false);
  };

  const isPositive = data.change >= 0;

  const getDirectionIcon = () => {
    if (!advice) return null;
    if (advice.direction === 'buy') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (advice.direction === 'sell') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Activity className="w-5 h-5 text-yellow-400" />;
  };

  const getDirectionColor = () => {
    if (!advice) return 'text-white';
    if (advice.direction === 'buy') return 'text-green-400';
    if (advice.direction === 'sell') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4 max-w-4xl mx-auto"
    >
      {/* 主卡片 */}
      <div className={`bg-gradient-to-br ${config.elementColor} rounded-3xl p-8 border border-white/10`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{config.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/10 ${config.elementText}`}>
                五行·{config.element}
              </span>
            </div>
            <p className="text-white/50 text-sm">{config.desc}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">
              {type === 'btc' || type === 'gold' ? '$' : ''}
              {data.price.toLocaleString()}
            </div>
            <div className={`flex items-center justify-end gap-1 text-sm mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? '+' : ''}{data.changePercent}%</span>
              <span className="text-white/40 ml-2">({isPositive ? '+' : ''}{data.change.toLocaleString()})</span>
            </div>
          </div>
        </div>

        {/* 走势图占位 */}
        <div className="h-48 bg-black/20 rounded-2xl flex items-center justify-center">
          <p className="text-white/30">金融API接入中...</p>
        </div>
      </div>

      {/* 八字命理建议 */}
      {advice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl p-8 border border-indigo-500/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">命理投资建议</h3>
              <p className="text-white/50 text-sm">基于您的八字命盘分析</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 建议评分 */}
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/70">投资契合度</span>
                <div className="flex items-center gap-2">
                  {getDirectionIcon()}
                  <span className={`text-2xl font-bold ${getDirectionColor()}`}>{advice.score}分</span>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${advice.score}%` }}
                  className={`h-full rounded-full ${advice.direction === 'buy' ? 'bg-green-400' : advice.direction === 'sell' ? 'bg-red-400' : 'bg-yellow-400'}`}
                />
              </div>
              <div className={`mt-4 text-lg font-medium ${getDirectionColor()}`}>
                {advice.advice}
              </div>
            </div>

            {/* 原因分析 */}
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-indigo-400" />
                <span className="text-white/70">分析依据</span>
              </div>
              <p className="text-white/80 leading-relaxed">{advice.reason}</p>
              
              <div className="mt-4 flex items-center gap-2 text-sm">
                {advice.direction === 'buy' && <CheckCircle className="w-4 h-4 text-green-400" />}
                {advice.direction === 'sell' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                {advice.direction === 'hold' && <Activity className="w-4 h-4 text-yellow-400" />}
                <span className="text-white/50">
                  {advice.direction === 'buy' ? '当前运势利于投资' : advice.direction === 'sell' ? '建议观望或减仓' : '可小仓位试探'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 五行关联 */}
      <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">五行关联分析</h3>
        <div className="grid grid-cols-5 gap-4">
          {['金', '木', '水', '火', '土'].map((element) => (
            <div key={element} className={`text-center p-4 rounded-2xl ${element === config.element ? 'bg-white/10 border border-white/20' : 'opacity-40'}`}>
              <div className={`text-2xl font-bold mb-1 ${
                element === '金' ? 'text-amber-400' :
                element === '木' ? 'text-green-400' :
                element === '水' ? 'text-blue-400' :
                element === '火' ? 'text-red-400' :
                'text-yellow-400'
              }`}>{element}</div>
              <div className="text-xs text-white/50">
                {element === config.element ? '本命' : element}
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/50 text-sm mt-4 text-center">
          {config.name}五行属{config.element}，{config.element === '火' ? '主能量与爆发' : config.element === '木' ? '主生长与扩展' : config.element === '金' ? '主收割与规则' : config.element === '水' ? '主流动与智慧' : '主稳定与沉淀'}
        </p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-indigo-400 rounded-full mx-auto mb-3 animate-spin" />
          <p className="text-white/50">AI 正在分析命理契合度...</p>
        </div>
      )}
    </motion.div>
  );
}
