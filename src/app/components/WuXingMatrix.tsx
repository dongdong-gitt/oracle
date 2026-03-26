'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { Sparkles, TrendingUp, TrendingDown, Minus, Activity, Zap, Shield, Target } from 'lucide-react';

interface WuXingData {
  金: number;
  木: number;
  水: number;
  火: number;
  土: number;
}

interface WuXingAnalysis {
  pattern: string;
  patternDesc: string;
  strength: string;
  喜用神: string[];
  幸运颜色: string[];
  幸运方位: string[];
  幸运数字: string[];
  适合行业: string[];
  开运建议: string[];
}

// 五行配置
const wuxingConfig = {
  金: { color: '#fbbf24', bg: 'bg-amber-400', text: 'text-amber-400', pos: { x: 85, y: 35 }, label: '劫财比肩', icon: '⚜️' },
  木: { color: '#4ade80', bg: 'bg-green-400', text: 'text-green-400', pos: { x: 15, y: 35 }, label: '正财偏财', icon: '🌿' },
  水: { color: '#60a5fa', bg: 'bg-blue-400', text: 'text-blue-400', pos: { x: 50, y: 85 }, label: '食神伤官', icon: '💧' },
  火: { color: '#f87171', bg: 'bg-red-400', text: 'text-red-400', pos: { x: 50, y: 15 }, label: '七杀', icon: '🔥' },
  土: { color: '#fbbf24', bg: 'bg-yellow-400', text: 'text-yellow-400', pos: { x: 75, y: 65 }, label: '偏印', icon: '⛰️', isRizhu: true },
};

export default function WuXingMatrix() {
  const { baziResult } = useUser();
  const [wuxingData, setWuxingData] = useState<WuXingData>({ 金: 18, 木: 24, 水: 24, 火: 18, 土: 18 });
  const [analysis, setAnalysis] = useState<WuXingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeElement, setActiveElement] = useState<string | null>(null);

  useEffect(() => {
    if (baziResult?.detail) {
      const detail = baziResult.detail;
      const stats = detail.五行统计;
      if (stats) {
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        const percentages: WuXingData = {
          金: Math.round((stats.金 / total) * 100),
          木: Math.round((stats.木 / total) * 100),
          水: Math.round((stats.水 / total) * 100),
          火: Math.round((stats.火 / total) * 100),
          土: Math.round((stats.土 / total) * 100),
        };
        setWuxingData(percentages);
        analyzeWuXing(percentages, detail);
      }
    }
  }, [baziResult]);

  const analyzeWuXing = async (data: WuXingData, detail: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/wuxing/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wuxing: data,
          bazi: detail.八字,
          riZhu: detail.日主,
        }),
      });
      const result = await response.json();
      if (result.data) {
        setAnalysis(result.data);
      }
    } catch (e) {
      console.error('五行分析失败:', e);
    }
    setLoading(false);
  };

  // 计算生克关系
  const shengRelations = [
    { from: '木', to: '火', path: 'M 80 140 Q 120 80 200 60' },
    { from: '火', to: '土', path: 'M 200 60 Q 280 80 320 140' },
    { from: '土', to: '金', path: 'M 320 180 Q 340 200 320 220' },
    { from: '金', to: '水', path: 'M 320 260 Q 280 320 200 340' },
    { from: '水', to: '木', path: 'M 200 340 Q 120 320 80 260' },
  ];

  const keRelations = [
    { from: '金', to: '木', x1: 340, y1: 200, x2: 60, y2: 200 },
    { from: '木', to: '土', x1: 80, y1: 260, x2: 300, y2: 260 },
    { from: '土', to: '水', x1: 300, y1: 280, x2: 200, y2: 320 },
    { from: '水', to: '火', x1: 200, y1: 320, x2: 200, y2: 80 },
    { from: '火', to: '金', x1: 200, y1: 80, x2: 340, y2: 180 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-6 max-w-6xl mx-auto"
    >
      {/* 标题 */}
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-4 mb-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">五行命盘</h2>
            <p className="text-white/50 text-sm mt-1">能量分布 · 生克关系 · 命理建议</p>
          </div>
        </motion.div>
      </div>

      {/* 格局显示 */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-3xl p-8 border border-amber-500/20"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-amber-400 mb-2">【{analysis.pattern}】</h3>
              <p className="text-white/70 max-w-xl">{analysis.patternDesc}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-5 py-2 bg-white/10 rounded-full">
                <span className="text-white/60 text-sm">日主强弱</span>
                <span className="text-white font-bold ml-2">{analysis.strength}</span>
              </div>
              <div className="px-5 py-2 bg-amber-500/20 rounded-full">
                <span className="text-amber-400 font-bold">喜用{analysis.喜用神.join('、')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 五行图 - 重新设计 */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 左侧：五行圆形图 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a0a0f] rounded-3xl p-8 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            五行能量分布
          </h3>
          
          <div className="relative w-full aspect-square max-w-md mx-auto">
            {/* 背景圆环 */}
            <div className="absolute inset-8 rounded-full border border-white/5" />
            <div className="absolute inset-16 rounded-full border border-white/5" />
            <div className="absolute inset-24 rounded-full border border-white/5" />
            
            {/* SVG 生克线 */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
              <defs>
                <marker id="arrow-sheng" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <polygon points="0 0, 8 4, 0 8" fill="rgba(74,222,128,0.6)" />
                </marker>
                <marker id="arrow-ke" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <polygon points="0 0, 8 4, 0 8" fill="rgba(248,113,113,0.6)" />
                </marker>
              </defs>
              
              {/* 相生线 - 绿色实线 */}
              {shengRelations.map((rel, i) => (
                <path key={i} d={rel.path} fill="none" stroke="rgba(74,222,128,0.4)" strokeWidth="2" markerEnd="url(#arrow-sheng)" />
              ))}
              
              {/* 相克线 - 红色虚线 */}
              {keRelations.map((rel, i) => (
                <line key={i} x1={rel.x1} y1={rel.y1} x2={rel.x2} y2={rel.y2} 
                  stroke="rgba(248,113,113,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
              ))}
            </svg>

            {/* 五行节点 */}
            {Object.entries(wuxingConfig).map(([name, config]) => {
              const value = wuxingData[name as keyof WuXingData];
              const isActive = activeElement === name;
              return (
                <motion.div
                  key={name}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: `${config.pos.x}%`, top: `${config.pos.y}%` }}
                  onMouseEnter={() => setActiveElement(name)}
                  onMouseLeave={() => setActiveElement(null)}
                  whileHover={{ scale: 1.1 }}
                >
                  {/* 标签 */}
                  <div className={`text-xs mb-2 text-center ${config.text} opacity-70 whitespace-nowrap`}>
                    {config.label}
                  </div>
                  
                  {/* 圆圈 */}
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.bg}/30 to-transparent border-2 ${config.bg.replace('bg-', 'border-')}/60 flex flex-col items-center justify-center shadow-lg transition-all ${isActive ? 'scale-110 shadow-xl' : ''}`}
                    style={{ boxShadow: `0 0 30px ${config.color}20` }}
                  >
                    <span className={`${config.text} text-xl font-bold`}>{name}</span>
                    <span className={`${config.text} text-xs opacity-80`}>{value}%</span>
                  </div>
                  
                  {/* 日主标记 */}
                  {config.isRizhu && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full whitespace-nowrap">
                      日主
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* 中心 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-white/40 text-xs">生</div>
                <div className="text-white/30 text-[10px]">克</div>
              </div>
            </div>
          </div>

          {/* 图例 */}
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-400/60" />
              <span className="text-white/50">相生</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-red-400/40 border-b border-dashed border-red-400/40" />
              <span className="text-white/50">相克</span>
            </div>
          </div>
        </motion.div>

        {/* 右侧：开运建议 */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* 幸运元素 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                开运元素
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-white/50 text-xs mb-2">幸运颜色</div>
                  <div className="flex justify-center gap-2">
                    {analysis.幸运颜色.slice(0, 2).map((color, i) => (
                      <div key={i} className="w-10 h-10 rounded-full shadow-lg border-2 border-white/20" style={{ background: color }} />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-white/50 text-xs mb-2">幸运方位</div>
                  <div className="text-white font-medium">{analysis.幸运方位[0]}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/50 text-xs mb-2">幸运数字</div>
                  <div className="text-white font-medium">{analysis.幸运数字[0]}</div>
                </div>
              </div>
            </div>

            {/* 开运建议 */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                开运建议
              </h3>
              <ul className="space-y-3">
                {analysis.开运建议?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/70 text-sm">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                    {tip}
                  </li>
                )) || (
                  <>
                    <li className="flex items-start gap-3 text-white/70 text-sm">
                      <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                      多穿{analysis.喜用神[0]}色系衣物，增强个人气场
                    </li>
                    <li className="flex items-start gap-3 text-white/70 text-sm">
                      <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                      办公座位朝向{analysis.幸运方位[0]}，利于事业发展
                    </li>
                    <li className="flex items-start gap-3 text-white/70 text-sm">
                      <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                      重要决策可选带数字{analysis.幸运数字[0]}的日期
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* 适合行业 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                适合行业
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.适合行业.map((industry, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/10 rounded-lg text-white/80 text-sm hover:bg-white/20 transition-colors cursor-pointer">
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-3 border-white/20 border-t-amber-400 rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-white/50">AI 正在深度分析五行...</p>
        </div>
      )}
    </motion.div>
  );
}
