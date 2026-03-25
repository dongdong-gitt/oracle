'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Zap, Target } from 'lucide-react';
import { Language, t } from './Dashboard';

interface StrategyBoardProps {
  lang: Language;
}

const strategies = [
  {
    signal: 'strongBuy',
    icon: TrendingUp,
    color: 'text-[#0ecb81]',
    bgColor: 'bg-[#0ecb81]/10',
    borderColor: 'border-[#0ecb81]/30',
    title: { zh: '强力做多', en: 'STRONG BUY' },
    desc: { 
      zh: '财星透干，运势突破MA20。建议重仓出击，关注高赔率机会。',
      en: 'Wealth star visible, luck breaking MA20. Go heavy, focus on high-reward opportunities.'
    },
    actions: [
      { zh: '加密货币短线', en: 'Crypto trading' },
      { zh: '德州扑克', en: 'Poker games' },
      { zh: '谈判签约', en: 'Negotiations' }
    ]
  },
  {
    signal: 'buy',
    icon: TrendingUp,
    color: 'text-[#0ecb81]/70',
    bgColor: 'bg-[#0ecb81]/5',
    borderColor: 'border-[#0ecb81]/20',
    title: { zh: '建议做多', en: 'BUY' },
    desc: {
      zh: '运势稳步上升，适合渐进式布局。',
      en: 'Luck steadily rising, suitable for gradual positioning.'
    },
    actions: [
      { zh: '定投BTC', en: 'DCA Bitcoin' },
      { zh: '价值投资', en: 'Value investing' },
      { zh: '拓展人脉', en: 'Networking' }
    ]
  },
  {
    signal: 'hold',
    icon: Target,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
    title: { zh: '持仓观望', en: 'HOLD' },
    desc: {
      zh: '运势震荡整理，宜守不宜攻。',
      en: 'Luck consolidating, better to hold than attack.'
    },
    actions: [
      { zh: '保持现状', en: 'Maintain status' },
      { zh: '学习充电', en: 'Study & improve' },
      { zh: '观察等待', en: 'Wait & observe' }
    ]
  },
  {
    signal: 'sell',
    icon: TrendingDown,
    color: 'text-[#f6465d]/70',
    bgColor: 'bg-[#f6465d]/5',
    borderColor: 'border-[#f6465d]/20',
    title: { zh: '减仓防守', en: 'SELL' },
    desc: {
      zh: '运势回调，建议降低仓位。',
      en: 'Luck pulling back,建议 reducing positions.'
    },
    actions: [
      { zh: '止盈离场', en: 'Take profits' },
      { zh: '减少交易', en: 'Reduce trading' },
      { zh: '现金为王', en: 'Cash is king' }
    ]
  },
  {
    signal: 'strongSell',
    icon: AlertTriangle,
    color: 'text-[#f6465d]',
    bgColor: 'bg-[#f6465d]/10',
    borderColor: 'border-[#f6465d]/30',
    title: { zh: '清仓避险', en: 'STRONG SELL' },
    desc: {
      zh: '运势跌破支撑位，忌神当令。空仓防守，切忌上头。',
      en: 'Luck breaking support,忌神 dominant. Go to cash, avoid FOMO.'
    },
    actions: [
      { zh: '全部清仓', en: 'Exit all positions' },
      { zh: '闭关修炼', en: 'Retreat & reflect' },
      { zh: '谨防破财', en: 'Guard against losses' }
    ]
  }
];

export default function StrategyBoard({ lang }: StrategyBoardProps) {
  const currentStrategy = strategies[0]; // Mock: currently STRONG BUY

  return (
    <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2b3139]">
        <h3 className="font-semibold text-lg">{t('strategy', lang)}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{lang === 'zh' ? '最后更新' : 'Updated'}:</span>
          <span className="text-xs font-mono text-gray-300">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Current Signal */}
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-5 rounded-xl border ${currentStrategy.borderColor} ${currentStrategy.bgColor}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-[#1e2329]`}>
                <currentStrategy.icon className={`w-6 h-6 ${currentStrategy.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${currentStrategy.color}`}>
                  {currentStrategy.title[lang]}
                </div>
                <div className="text-sm text-gray-400">
                  {lang === 'zh' ? '当前运势评级' : 'Current Luck Rating'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-white">88.5</div>
              <div className="text-sm text-[#0ecb81]">↗ +5.2%</div>
            </div>
          </div>

          <p className={`text-sm leading-relaxed mb-4 ${currentStrategy.color}`}>
            {currentStrategy.desc[lang]}
          </p>

          {/* Recommended Actions */}
          <div>
            <div className="text-xs text-gray-500 mb-2">
              {lang === 'zh' ? '建议操作' : 'Recommended Actions'}
            </div>
            <div className="flex flex-wrap gap-2">
              {currentStrategy.actions.map((action, i) => (
                <span 
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-[#1e2329] text-sm text-gray-300 border border-[#2b3139]"
                >
                  {action[lang]}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* All Signals Grid */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-500 mb-3">
          {lang === 'zh' ? '运势等级参考' : 'Luck Level Reference'}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {strategies.map((s, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
                s.signal === currentStrategy.signal
                  ? `${s.bgColor} ${s.borderColor} border`
                  : 'bg-[#2b3139]/50 hover:bg-[#2b3139]'
              }`}
            >
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <div className={`text-xs font-bold ${s.color}`}>{s.title[lang]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Context */}
      <div className="px-4 pb-4">
        <div className="p-4 rounded-xl bg-[#2b3139]/30 border border-[#2b3139]">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">
              {lang === 'zh' ? '周期洞察' : 'Cycle Insight'}
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {lang === 'zh'
              ? '当前处于乙巳火运（2025-2027），离火九运初期。科技、AI、新能源板块能量最强。建议关注：人工智能、加密货币、绿色能源相关机会。'
              : 'Currently in Yi-Si Fire Luck (2025-2027), early Li Fire 9th cycle. Tech, AI, and new energy sectors show strongest energy. Focus on: AI, crypto, green energy opportunities.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
