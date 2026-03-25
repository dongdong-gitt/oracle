'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplets, Mountain, Wind, Coins, Target, TrendingUp, Shield } from 'lucide-react';

export default function WuXingMatrix() {
  const [selectedElement, setSelectedElement] = useState<string | null>('fire');

  const elements = [
    {
      id: 'fire',
      name: '火',
      eng: 'Fire',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      icon: Flame,
      value: 85,
      wealth: '爆发增长',
      invest: 'AI、科技、新能源',
      advice: '当前火旺，适合进取',
      desc: '火主能量与爆发，代表科技、传播、文化',
    },
    {
      id: 'earth',
      name: '土',
      eng: 'Earth',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      icon: Mountain,
      value: 60,
      wealth: '稳健积累',
      invest: '房地产、基建、信托',
      advice: '土气平稳，守成为主',
      desc: '土主稳定与沉淀，代表资产、基础',
    },
    {
      id: 'metal',
      name: '金',
      eng: 'Metal',
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.1)',
      icon: Coins,
      value: 40,
      wealth: '谨慎收割',
      invest: '金融、贵金属',
      advice: '金气渐弱，减少高风险',
      desc: '金主收割与规则，代表金融、权力',
    },
    {
      id: 'water',
      name: '水',
      eng: 'Water',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      icon: Droplets,
      value: 55,
      wealth: '灵活流动',
      invest: '现金、流动性资产',
      advice: '水气适中，保持灵活',
      desc: '水主流动与智慧，代表资金、信息',
    },
    {
      id: 'wood',
      name: '木',
      eng: 'Wood',
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      icon: Wind,
      value: 45,
      wealth: '成长待发',
      invest: '创业、新兴产业',
      advice: '木气待发，关注政策',
      desc: '木主生长与扩展，代表创业、教育',
    },
  ];

  const currentElement = elements.find(e => e.id === selectedElement);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* 标题 */}
      <div className="text-center py-4">
        <h2 className="text-[32px] font-semibold text-white mb-2">五行矩阵</h2>
        <p className="text-white/50">你的能量分布与投资方向匹配</p>
      </div>

      {/* 五行卡片 */}
      <div className="grid grid-cols-5 gap-3">
        {elements.map((e, i) => {
          const Icon = e.icon;
          return (
            <motion.button
              key={e.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedElement(e.id)}
              className={`relative p-4 rounded-2xl transition-all duration-300 ${
                selectedElement === e.id 
                  ? 'scale-105' 
                  : 'hover:scale-102'
              }`}
              style={{
                background: selectedElement === e.id ? e.bgColor : 'rgba(255,255,255,0.03)',
                border: selectedElement === e.id 
                  ? `1px solid ${e.color}40` 
                  : '0.5px solid rgba(255,255,255,0.08)'
              }}
            >
              <div className="text-center">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: `${e.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: e.color }} />
                </div>
                <div className="text-xl font-light text-white mb-0.5">{e.name}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{e.eng}</div>
                <div 
                  className="text-lg font-semibold mt-2"
                  style={{ color: e.color }}
                >
                  {e.value}%
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* 详情面板 */}
      {currentElement && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl"
          style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: `0.5px solid ${currentElement.color}20` 
          }}
        >
          <div className="flex items-start gap-5">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${currentElement.color}20` }}
            >
              {(() => {
                const Icon = currentElement.icon;
                return <Icon className="w-7 h-7" style={{ color: currentElement.color }} />;
              })()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-semibold text-white">{currentElement.name}</h3>
                <span className="text-sm text-white/40">{currentElement.eng}</span>
                <span 
                  className="px-2 py-0.5 rounded text-sm font-medium"
                  style={{ 
                    background: `${currentElement.color}20`,
                    color: currentElement.color
                  }}
                >
                  {currentElement.value}%
                </span>
              </div>
              <p className="text-white/50 mb-5">{currentElement.desc}</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-white/40" />
                    <span className="text-xs text-white/40">财富特征</span>
                  </div>
                  <div className="text-white font-medium">{currentElement.wealth}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-white/40" />
                    <span className="text-xs text-white/40">投资方向</span>
                  </div>
                  <div className="text-white font-medium">{currentElement.invest}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-white/40" />
                    <span className="text-xs text-white/40">策略建议</span>
                  </div>
                  <div className="text-white font-medium">{currentElement.advice}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 相生相克 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
        >
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            相生关系
          </h4>
          <div className="space-y-2 text-sm">
            {[
              { from: '火', to: '土', desc: '火旺生土，适合稳健配置' },
              { from: '土', to: '金', desc: '土生金，利于金融投资' },
              { from: '金', to: '水', desc: '金生水，流动性增强' },
              { from: '水', to: '木', desc: '水生木，创业机会增多' },
              { from: '木', to: '火', desc: '木生火，科技爆发期' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white/50">
                <span style={{ color: elements.find(e => e.name === item.from)?.color }}>{item.from}</span>
                <span className="text-white/20">→</span>
                <span style={{ color: elements.find(e => e.name === item.to)?.color }}>{item.to}</span>
                <span className="text-white/30 ml-2">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
        >
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            相克关系
          </h4>
          <div className="space-y-2 text-sm">
            {[
              { from: '火', to: '金', desc: '火克金，金融需谨慎' },
              { from: '金', to: '木', desc: '金克木，创业有阻力' },
              { from: '木', to: '土', desc: '木克土，房地产承压' },
              { from: '土', to: '水', desc: '土克水，流动性受限' },
              { from: '水', to: '火', desc: '水克火，科技有波动' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white/50">
                <span style={{ color: elements.find(e => e.name === item.from)?.color }}>{item.from}</span>
                <span className="text-white/20">→</span>
                <span style={{ color: elements.find(e => e.name === item.to)?.color }}>{item.to}</span>
                <span className="text-white/30 ml-2">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
