'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplets, Mountain, Wind, Coins, Target, TrendingUp, Shield } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface WuXingData {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

export default function WuXingMatrix() {
  const { baziResult } = useUser();
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [wuxingData, setWuxingData] = useState<WuXingData>({ 木: 20, 火: 20, 土: 20, 金: 20, 水: 20 });

  // 计算真实五行分布
  useEffect(() => {
    if (baziResult?.detail) {
      const detail = baziResult.detail;
      const pillars = [detail.年柱, detail.月柱, detail.日柱, detail.时柱];
      
      // 统计五行数量（天干+地支）
      const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
      
      pillars.forEach(pillar => {
        // 天干五行
        if (pillar.天干.五行) counts[pillar.天干.五行]++;
        // 地支五行
        if (pillar.地支.五行) counts[pillar.地支.五行]++;
        // 藏干五行（权重较低）
        const canggan = pillar.地支.藏干;
        if (canggan.主气) counts[canggan.主气.天干] = (counts[canggan.主气.天干] || 0) + 0.5;
        if (canggan.中气) counts[canggan.中气.天干] = (counts[canggan.中气.天干] || 0) + 0.3;
        if (canggan.余气) counts[canggan.余气.天干] = (counts[canggan.余气.天干] || 0) + 0.2;
      });
      
      // 转换为百分比（最高100%）
      const maxCount = Math.max(...Object.values(counts));
      const percentages: WuXingData = {
        木: Math.round((counts.木 / maxCount) * 100),
        火: Math.round((counts.火 / maxCount) * 100),
        土: Math.round((counts.土 / maxCount) * 100),
        金: Math.round((counts.金 / maxCount) * 100),
        水: Math.round((counts.水 / maxCount) * 100),
      };
      
      setWuxingData(percentages);
      
      // 自动选择最旺的五行
      const maxElement = Object.entries(percentages).sort((a, b) => b[1] - a[1])[0];
      const elementMap: Record<string, string> = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' };
      setSelectedElement(elementMap[maxElement[0]]);
    }
  }, [baziResult]);

  const elements = [
    {
      id: 'fire',
      name: '火',
      eng: 'Fire',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      icon: Flame,
      value: wuxingData.火,
      wealth: '爆发增长',
      invest: 'AI、科技、新能源',
      advice: wuxingData.火 >= 80 ? '当前火旺，适合进取' : wuxingData.火 >= 60 ? '火气适中，把握机会' : '火气不足，需补火',
      desc: '火主能量与爆发，代表科技、传播、文化',
    },
    {
      id: 'earth',
      name: '土',
      eng: 'Earth',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      icon: Mountain,
      value: wuxingData.土,
      wealth: '稳健积累',
      invest: '房地产、基建、信托',
      advice: wuxingData.土 >= 80 ? '土气旺盛，适合守成' : wuxingData.土 >= 60 ? '土气平稳，稳健为主' : '土气不足，需固根基',
      desc: '土主稳定与沉淀，代表资产、基础',
    },
    {
      id: 'metal',
      name: '金',
      eng: 'Metal',
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.1)',
      icon: Coins,
      value: wuxingData.金,
      wealth: '谨慎收割',
      invest: '金融、贵金属',
      advice: wuxingData.金 >= 80 ? '金气旺盛，适合收割' : wuxingData.金 >= 60 ? '金气适中，稳健投资' : '金气不足，避免高风险',
      desc: '金主收割与规则，代表金融、权力',
    },
    {
      id: 'water',
      name: '水',
      eng: 'Water',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      icon: Droplets,
      value: wuxingData.水,
      wealth: '灵活流动',
      invest: '现金、流动性资产',
      advice: wuxingData.水 >= 80 ? '水气旺盛，灵活多变' : wuxingData.水 >= 60 ? '水气适中，保持流动' : '水气不足，需增流动性',
      desc: '水主流动与智慧，代表资金、信息',
    },
    {
      id: 'wood',
      name: '木',
      eng: 'Wood',
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      icon: Wind,
      value: wuxingData.木,
      wealth: '成长待发',
      invest: '创业、新兴产业',
      advice: wuxingData.木 >= 80 ? '木气旺盛，适合扩张' : wuxingData.木 >= 60 ? '木气适中，稳步成长' : '木气不足，需待时机',
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
