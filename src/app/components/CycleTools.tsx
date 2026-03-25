'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Info } from 'lucide-react';
import LifeKLine from './LifeKLine';

export default function CycleTools() {
  const [activeTool, setActiveTool] = useState<'kline' | 'liunian'>('kline');

  const tools = [
    { id: 'kline', title: '人生K线', subtitle: 'Life K-Line', desc: '运势曲线可视化', icon: TrendingUp },
    { id: 'liunian', title: '流年运势', subtitle: 'Annual Fortune', desc: '年度详细解读', icon: Calendar },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* 工具选择 */}
      <div className="flex gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as typeof activeTool)}
              className={`relative flex-1 p-4 rounded-2xl text-left transition-all duration-300 ${
                activeTool === tool.id
                  ? 'bg-white/[0.08]'
                  : 'bg-white/[0.03] hover:bg-white/[0.05]'
              }`}
              style={{ border: activeTool === tool.id ? '0.5px solid rgba(255,255,255,0.2)' : '0.5px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeTool === tool.id ? 'bg-white/10' : 'bg-white/5'
                }`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-0.5">{tool.subtitle}</div>
                  <h3 className="font-semibold text-white">{tool.title}</h3>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 工具内容 */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        {activeTool === 'kline' && <LifeKLine lang="zh" period="1D" />}
        {activeTool === 'liunian' && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Info className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">流年运势分析</h3>
            <p className="text-white/40 mb-6">输入出生信息获取详细流年分析</p>
            <button className="px-6 py-3 rounded-full text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
              立即测算
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
