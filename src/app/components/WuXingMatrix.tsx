'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

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
}

export default function WuXingMatrix() {
  const { baziResult } = useUser();
  const [wuxingData, setWuxingData] = useState<WuXingData>({ 金: 20, 木: 20, 土: 20, 火: 20, 水: 20 });
  const [analysis, setAnalysis] = useState<WuXingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // 计算真实五行分布
  useEffect(() => {
    if (baziResult?.detail) {
      const detail = baziResult.detail;
      const stats = detail.五行统计;
      if (stats) {
        // 计算百分比
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        const percentages: WuXingData = {
          金: Math.round((stats.金 / total) * 100),
          木: Math.round((stats.木 / total) * 100),
          水: Math.round((stats.水 / total) * 100),
          火: Math.round((stats.火 / total) * 100),
          土: Math.round((stats.土 / total) * 100),
        };
        setWuxingData(percentages);
        
        // 调用 DeepSeek 分析
        analyzeWuXing(percentages, detail);
      }
    }
  }, [baziResult]);

  // DeepSeek 分析五行
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

  const elements = [
    { name: '金', color: '#fbbf24', bgColor: 'bg-amber-400', textColor: 'text-amber-400', position: 'right', icon: '⚜️' },
    { name: '木', color: '#4ade80', bgColor: 'bg-green-400', textColor: 'text-green-400', position: 'left', icon: '🌿' },
    { name: '水', color: '#60a5fa', bgColor: 'bg-blue-400', textColor: 'text-blue-400', position: 'bottom', icon: '💧' },
    { name: '火', color: '#f87171', bgColor: 'bg-red-400', textColor: 'text-red-400', position: 'top', icon: '🔥' },
    { name: '土', color: '#fbbf24', bgColor: 'bg-yellow-400', textColor: 'text-yellow-400', position: 'center-right', icon: '⛰️' },
  ];

  const getElementValue = (name: string) => wuxingData[name as keyof WuXingData] || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4"
    >
      {/* 标题 */}
      <div className="text-center py-4">
        <h2 className="text-2xl font-semibold text-white mb-2">五行分析</h2>
        <p className="text-white/50 text-sm">基于八字命盘的五行能量分布</p>
      </div>

      {/* 格局显示 */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-2xl p-5 border border-white/10"
        >
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-amber-400 mb-2">【{analysis.pattern}】</h3>
            <p className="text-white/70 text-sm">{analysis.patternDesc}</p>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-white/50 text-sm">【{analysis.strength}】</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/60">校正</span>
          </div>
        </motion.div>
      )}

      {/* 五行圆形图 */}
      <div className="relative w-full max-w-md mx-auto aspect-square">
        {/* 背景圆 */}
        <div className="absolute inset-0 rounded-full border border-white/10" />
        
        {/* 生克关系线 */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
          {/* 相生线 - 实线 */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="rgba(255,255,255,0.3)" />
            </marker>
          </defs>
          {/* 木生火 */}
          <path d="M 80 150 Q 110 80 150 60" fill="none" stroke="rgba(74,222,128,0.4)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          {/* 火生土 */}
          <path d="M 150 60 Q 200 80 220 120" fill="none" stroke="rgba(248,113,113,0.4)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          {/* 土生金 */}
          <path d="M 220 120 Q 230 150 220 180" fill="none" stroke="rgba(251,191,36,0.4)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          {/* 金生水 */}
          <path d="M 220 180 Q 200 220 150 240" fill="none" stroke="rgba(251,191,36,0.4)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          {/* 水生木 */}
          <path d="M 150 240 Q 100 220 80 180" fill="none" stroke="rgba(96,165,250,0.4)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          
          {/* 相克线 - 虚线 */}
          {/* 金克木 */}
          <line x1="200" y1="150" x2="100" y2="150" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
          {/* 木克土 */}
          <line x1="100" y1="150" x2="200" y2="150" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
          {/* 土克水 */}
          <line x1="180" y1="200" x2="120" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
          {/* 水克火 */}
          <line x1="150" y1="220" x2="150" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
          {/* 火克金 */}
          <line x1="150" y1="80" x2="150" y2="220" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        {/* 火 - 顶部 */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="text-red-400 text-xs mb-1">七杀</div>
          <div className="w-16 h-16 rounded-full bg-red-400/20 border-2 border-red-400/50 flex flex-col items-center justify-center">
            <span className="text-red-400 text-lg">火</span>
            <span className="text-red-400 text-xs">{getElementValue('火')}%</span>
          </div>
        </div>

        {/* 木 - 左侧 */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="text-green-400 text-xs mb-1">正财偏财</div>
          <div className="w-16 h-16 rounded-full bg-green-400/20 border-2 border-green-400/50 flex flex-col items-center justify-center">
            <span className="text-green-400 text-lg">木</span>
            <span className="text-green-400 text-xs">{getElementValue('木')}%</span>
          </div>
        </div>

        {/* 金 - 右侧 */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="text-amber-400 text-xs mb-1">劫财比肩</div>
          <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400/50 flex flex-col items-center justify-center">
            <span className="text-amber-400 text-lg">金</span>
            <span className="text-amber-400 text-xs">{getElementValue('金')}%</span>
          </div>
          <div className="mt-1 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">日主</div>
        </div>

        {/* 水 - 底部 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-400/20 border-2 border-blue-400/50 flex flex-col items-center justify-center">
            <span className="text-blue-400 text-lg">水</span>
            <span className="text-blue-400 text-xs">{getElementValue('水')}%</span>
          </div>
          <div className="text-blue-400 text-xs mt-1">食神伤官</div>
        </div>

        {/* 土 - 右下 */}
        <div className="absolute bottom-16 right-16 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-yellow-400/20 border-2 border-yellow-400/50 flex flex-col items-center justify-center">
            <span className="text-yellow-400 text-base">土</span>
            <span className="text-yellow-400 text-xs">{getElementValue('土')}%</span>
          </div>
          <div className="text-yellow-400 text-xs mt-1">偏印</div>
        </div>

        {/* 中心标签 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-white/30 text-xs">生</div>
        </div>
      </div>

      {/* 喜用神 */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-2xl p-5 border border-white/10"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
            <span className="text-white font-medium">【喜用{analysis.喜用神.join('、')}】</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-white/50 text-sm mb-3">幸运颜色</div>
              <div className="flex justify-center gap-2">
                {analysis.幸运颜色.map((color, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full" style={{ background: color }} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white/50 text-sm mb-3">幸运方位</div>
              <div className="flex justify-center gap-2">
                {analysis.幸运方位.map((dir, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-sm text-white/80">{dir}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white/50 text-sm mb-3">幸运数字</div>
              <div className="flex justify-center gap-2">
                {analysis.幸运数字.map((num, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-sm text-white/80">{num}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 适合行业 */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-2xl p-5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 text-xl">💼</span>
            </div>
            <span className="text-white font-medium">适合行业</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.适合行业.map((industry, i) => (
              <span key={i} className="px-4 py-2 bg-white/5 rounded-xl text-sm text-white/70">{industry}</span>
            ))}
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="text-center py-8 text-white/50">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-3" />
          <p className="text-sm">AI 正在分析五行...</p>
        </div>
      )}
    </motion.div>
  );
}
