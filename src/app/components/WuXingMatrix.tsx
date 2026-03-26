'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { Sparkles, TrendingUp, Briefcase, Compass, Palette, MapPin, Hash } from 'lucide-react';

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

  const elements = [
    { name: '金', color: '#fbbf24', bgColor: 'bg-amber-400', textColor: 'text-amber-400', gradient: 'from-amber-400 to-yellow-500', icon: '⚜️' },
    { name: '木', color: '#4ade80', bgColor: 'bg-green-400', textColor: 'text-green-400', gradient: 'from-green-400 to-emerald-500', icon: '🌿' },
    { name: '水', color: '#60a5fa', bgColor: 'bg-blue-400', textColor: 'text-blue-400', gradient: 'from-blue-400 to-cyan-500', icon: '💧' },
    { name: '火', color: '#f87171', bgColor: 'bg-red-400', textColor: 'text-red-400', gradient: 'from-red-400 to-orange-500', icon: '🔥' },
    { name: '土', color: '#fbbf24', bgColor: 'bg-yellow-400', textColor: 'text-yellow-400', gradient: 'from-yellow-400 to-amber-500', icon: '⛰️' },
  ];

  const getElementValue = (name: string) => wuxingData[name as keyof WuXingData] || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4 max-w-4xl mx-auto"
    >
      {/* 标题 */}
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">五行分析</h2>
        </motion.div>
        <p className="text-white/50">基于八字命盘的五行能量分布与命理建议</p>
      </div>

      {/* 格局显示 */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl p-8 border border-amber-500/20"
        >
          <div className="text-center">
            <motion.h3 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-amber-400 mb-3"
            >
              【{analysis.pattern}】
            </motion.h3>
            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">{analysis.patternDesc}</p>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="px-4 py-2 bg-white/10 rounded-full text-white/80">【{analysis.strength}】</span>
            <span className="px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm">已校正</span>
          </div>
        </motion.div>
      )}

      {/* 五行圆形图 - 大气版 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg mx-auto aspect-square"
      >
        {/* 外圈装饰 */}
        <div className="absolute inset-0 rounded-full border border-white/5" />
        <div className="absolute inset-4 rounded-full border border-white/5" />
        
        {/* 生克关系线 */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
          <defs>
            <marker id="arrow-sheng" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="rgba(74,222,128,0.6)" />
            </marker>
            <marker id="arrow-ke" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="rgba(248,113,113,0.6)" />
            </marker>
          </defs>
          
          {/* 相生线 - 实线绿色 */}
          <path d="M 120 200 Q 140 120 200 100" fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="2" markerEnd="url(#arrow-sheng)" />
          <path d="M 200 100 Q 280 120 300 160" fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="2" markerEnd="url(#arrow-sheng)" />
          <path d="M 300 160 Q 310 200 300 240" fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="2" markerEnd="url(#arrow-sheng)" />
          <path d="M 300 240 Q 280 300 200 320" fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="2" markerEnd="url(#arrow-sheng)" />
          <path d="M 200 320 Q 120 300 100 240" fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="2" markerEnd="url(#arrow-sheng)" />
          
          {/* 相克线 - 虚线红色 */}
          <line x1="280" y1="200" x2="120" y2="200" stroke="rgba(248,113,113,0.3)" strokeWidth="1.5" strokeDasharray="5 5" />
          <line x1="120" y1="200" x2="280" y2="200" stroke="rgba(248,113,113,0.3)" strokeWidth="1.5" strokeDasharray="5 5" />
          <line x1="200" y1="320" x2="200" y2="100" stroke="rgba(248,113,113,0.3)" strokeWidth="1.5" strokeDasharray="5 5" />
        </svg>

        {/* 火 - 顶部 */}
        <motion.div 
          className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-red-400/70 text-sm mb-2 font-medium tracking-wider">七杀</div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400/30 to-red-500/10 border-2 border-red-400/60 flex flex-col items-center justify-center shadow-lg shadow-red-500/20">
            <span className="text-red-400 text-2xl font-bold">火</span>
            <span className="text-red-400/80 text-sm">{getElementValue('火')}%</span>
          </div>
        </motion.div>

        {/* 木 - 左侧 */}
        <motion.div 
          className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-green-400/70 text-sm mb-2 font-medium tracking-wider">正财偏财</div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400/30 to-green-500/10 border-2 border-green-400/60 flex flex-col items-center justify-center shadow-lg shadow-green-500/20">
            <span className="text-green-400 text-2xl font-bold">木</span>
            <span className="text-green-400/80 text-sm">{getElementValue('木')}%</span>
          </div>
        </motion.div>

        {/* 金 - 右侧 */}
        <motion.div 
          className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-amber-400/70 text-sm mb-2 font-medium tracking-wider">劫财比肩</div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-500/10 border-2 border-amber-400/60 flex flex-col items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-amber-400 text-2xl font-bold">金</span>
            <span className="text-amber-400/80 text-sm">{getElementValue('金')}%</span>
          </div>
          <div className="mt-2 px-3 py-1 bg-amber-500 text-white text-xs rounded-full font-medium">日主</div>
        </motion.div>

        {/* 水 - 底部 */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400/30 to-blue-500/10 border-2 border-blue-400/60 flex flex-col items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-blue-400 text-2xl font-bold">水</span>
            <span className="text-blue-400/80 text-sm">{getElementValue('水')}%</span>
          </div>
          <div className="text-blue-400/70 text-sm mt-2 font-medium tracking-wider">食神伤官</div>
        </motion.div>

        {/* 土 - 右下 */}
        <motion.div 
          className="absolute bottom-20 right-20 flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400/30 to-amber-500/10 border-2 border-yellow-400/60 flex flex-col items-center justify-center shadow-lg shadow-yellow-500/20">
            <span className="text-yellow-400 text-xl font-bold">土</span>
            <span className="text-yellow-400/80 text-xs">{getElementValue('土')}%</span>
          </div>
          <div className="text-yellow-400/70 text-xs mt-1 font-medium">偏印</div>
        </motion.div>

        {/* 中心 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white/40 text-xs mb-1">生</div>
              <div className="text-white/60 text-xs">克</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 喜用神 - 大气版 */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-8 border border-blue-500/20"
        >
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/30" />
            <div className="flex items-center gap-3">
              <Compass className="w-6 h-6 text-blue-400" />
              <span className="text-2xl font-bold text-white">喜用神</span>
            </div>
            <div className="flex gap-2">
              {analysis.喜用神.map((element, i) => (
                <span key={i} className="px-4 py-2 bg-blue-500/20 rounded-xl text-blue-400 font-bold text-lg">
                  {element}
                </span>
              ))}
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/30" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-pink-400" />
                <span className="text-white/70">幸运颜色</span>
              </div>
              <div className="flex justify-center gap-3">
                {analysis.幸运颜色.map((color, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full shadow-lg" style={{ background: color }} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-400" />
                <span className="text-white/70">幸运方位</span>
              </div>
              <div className="flex justify-center gap-2">
                {analysis.幸运方位.map((dir, i) => (
                  <span key={i} className="px-4 py-2 bg-white/10 rounded-xl text-white font-medium">{dir}</span>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-amber-400" />
                <span className="text-white/70">幸运数字</span>
              </div>
              <div className="flex justify-center gap-2">
                {analysis.幸运数字.map((num, i) => (
                  <span key={i} className="px-4 py-2 bg-white/10 rounded-xl text-white font-medium">{num}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 适合行业 - 大气版 */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl p-8 border border-purple-500/20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">适合行业</h3>
              <p className="text-white/50">基于五行喜用神分析</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {analysis.适合行业.map((industry, i) => (
              <motion.span 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-5 py-3 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-colors cursor-pointer"
              >
                {industry}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-3 border-white/20 border-t-amber-400 rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-white/50">AI 正在深度分析五行...</p>
        </div>
      )}
    </motion.div>
  );
}
