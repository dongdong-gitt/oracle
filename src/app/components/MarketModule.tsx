'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Sparkles, AlertTriangle, CheckCircle, Target, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface MarketData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  element: string;
  trend: 'up' | 'down' | 'neutral';
  high?: number;
  low?: number;
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

export default function MarketModule({ type }: MarketModuleProps) {
  const { baziResult } = useUser();
  const [data, setData] = useState<MarketData | null>(null);
  const [advice, setAdvice] = useState<BaziAdvice | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const config = marketConfig[type];

  // 获取实时数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/market?type=${type}`);
      const result = await response.json();
      if (result.success && result.data) {
        setData(result.data);
        setLastUpdate(new Date());
        // 生成命理建议
        generateBaziAdvice(result.data);
      }
    } catch (e) {
      console.error('获取数据失败:', e);
    }
    setLoading(false);
  };

  // 生成八字建议
  const generateBaziAdvice = (marketData: MarketData) => {
    if (!baziResult?.detail) {
      // 没有八字数据时显示默认建议
      setAdvice({
        score: 50,
        advice: '建议先输入八字获取个性化建议',
        direction: 'hold',
        reason: '输入生辰八字后，系统将根据您的五行喜用神提供个性化投资建议。',
      });
      return;
    }
    
    const detail = baziResult.detail;
    const wuxing = detail.五行统计;
    const riZhu = detail.日主;
    
    // 简单的五行生克逻辑
    const elementScore: Record<string, number> = {
      '金': wuxing.金,
      '木': wuxing.木,
      '水': wuxing.水,
      '火': wuxing.火,
      '土': wuxing.土,
    };
    
    const marketElement = config.element;
    const userElementScore = elementScore[marketElement] || 0;
    const total = Object.values(wuxing).reduce((a, b) => a + b, 0);
    const elementPercent = (userElementScore / total) * 100;
    
    // 根据五行匹配度和市场走势生成建议
    let score = 50;
    let direction: 'buy' | 'sell' | 'hold' = 'hold';
    let reason = '';
    
    if (elementPercent > 25) {
      score += 20;
      direction = 'buy';
      reason = `您八字${marketElement}旺，与该品种五行相合，有利于把握${config.name}的投资机会。`;
    } else if (elementPercent < 15) {
      score -= 15;
      direction = 'sell';
      reason = `您八字${marketElement}弱，与该品种五行相克，建议谨慎对待${config.name}投资。`;
    } else {
      direction = 'hold';
      reason = `您八字${marketElement}适中，可小仓位关注${config.name}走势。`;
    }
    
    // 结合市场走势
    if (marketData.trend === 'up') {
      score += 10;
    } else {
      score -= 10;
    }
    
    score = Math.max(10, Math.min(95, score));
    
    const adviceMap = {
      buy: { advice: '建议逢低买入', direction: 'buy' as const },
      sell: { advice: '建议获利了结', direction: 'sell' as const },
      hold: { advice: '建议持仓观望', direction: 'hold' as const },
    };
    
    setAdvice({
      score,
      advice: adviceMap[direction].advice,
      direction: adviceMap[direction].direction,
      reason,
    });
  };

  useEffect(() => {
    fetchData();
    // 每30秒刷新一次
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [type, baziResult]);

  const isPositive = data ? data.change >= 0 : true;

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
          <button 
            onClick={fetchData}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-white/60 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {data ? (
          <div className="flex items-end gap-4 mb-6">
            <div className="text-4xl font-bold text-white">
              {type === 'btc' || type === 'gold' ? '$' : ''}
              {data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? '+' : ''}{data.changePercent}%</span>
              <span className="text-white/40 ml-2">({isPositive ? '+' : ''}{data.change.toFixed(2)})</span>
            </div>
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* 走势图占位 - 后续可接入K线图 */}
        <div className="h-48 bg-black/20 rounded-2xl flex items-center justify-center">
          {data ? (
            <div className="text-center">
              <div className="text-white/50 text-sm mb-2">今日行情</div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="text-white/70">
                  最高: <span className="text-green-400">{data.high?.toFixed(2) || '-'}</span>
                </div>
                <div className="text-white/70">
                  最低: <span className="text-red-400">{data.low?.toFixed(2) || '-'}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-white/30">K线图接入中...</p>
          )}
        </div>

        {/* 更新时间 */}
        <div className="mt-4 text-right text-xs text-white/30">
          更新时间: {lastUpdate.toLocaleTimeString('zh-CN')}
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

      {loading && !data && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-indigo-400 rounded-full mx-auto mb-3 animate-spin" />
          <p className="text-white/50">获取实时数据中...</p>
        </div>
      )}
    </motion.div>
  );
}
