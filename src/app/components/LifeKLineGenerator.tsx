'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw, Sparkles } from 'lucide-react';

interface KLineData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  details: {
    career: number;
    wealth: number;
    love: number;
    health: number;
    overall: number;
    analysis: string;
    advice: string;
  };
}

interface BaZiData {
  year: string;
  month: string;
  day: string;
  hour: string;
  riZhu: string;
}

export default function LifeKLineGenerator() {
  const [birthData, setBirthData] = useState({
    year: 1995,
    month: 12,
    day: 25,
    hour: 14,
    gender: 'male' as 'male' | 'female',
  });
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    bazi: BaZiData;
    kline: KLineData[];
    summary: {
      currentLuck: number;
      trend: string;
      suggestion: string;
    };
  } | null>(null);
  const [error, setError] = useState('');

  const generateKLine = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/kline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...birthData, days }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || '生成失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染K线图表（简化版）
  const renderKLine = () => {
    if (!result?.kline.length) return null;
    
    const data = result.kline;
    const maxPrice = Math.max(...data.map(d => d.high));
    const minPrice = Math.min(...data.map(d => d.low));
    const range = maxPrice - minPrice || 1;
    
    return (
      <div className="mt-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neon-blue" />
          人生K线走势
        </h3>
        
        {/* K线图表 */}
        <div className="h-64 flex items-end gap-1 overflow-x-auto pb-4">
          {data.map((item, i) => {
            const isUp = item.close >= item.open;
            const height = ((item.high - item.low) / range) * 100;
            const bottom = ((item.low - minPrice) / range) * 100;
            
            return (
              <div key={i} className="flex-1 min-w-[8px] flex flex-col items-center group relative">
                {/* 日期标签 */}
                <div className="absolute -bottom-6 text-[10px] text-white/30 rotate-45 origin-left whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.time.slice(5)}
                </div>
                
                {/* 高低线 */}
                <div 
                  className={`w-px ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  style={{ 
                    height: `${height}%`, 
                    position: 'absolute',
                    bottom: `${bottom}%`,
                  }}
                />
                
                {/* 实体 */}
                <div 
                  className={`w-full rounded-sm ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  style={{
                    height: `${Math.max(4, Math.abs(item.close - item.open) / range * 100)}%`,
                    position: 'absolute',
                    bottom: `${((Math.min(item.open, item.close) - minPrice) / range) * 100}%`,
                  }}
                />
                
                {/* 悬浮提示 */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-3 rounded-xl bg-black/90 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-48">
                  <div className="text-xs text-white/50 mb-1">{item.time}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-white/40">综合:</span>
                    <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>{item.close}</span>
                    <span className="text-white/40">事业:</span>
                    <span className="text-neon-blue">{item.details.career}</span>
                    <span className="text-white/40">财运:</span>
                    <span className="text-neon-purple">{item.details.wealth}</span>
                    <span className="text-white/40">感情:</span>
                    <span className="text-neon-pink">{item.details.love}</span>
                    <span className="text-white/40">健康:</span>
                    <span className="text-neon-cyan">{item.details.health}</span>
                  </div>
                  <div className="mt-2 text-xs text-white/60 border-t border-white/10 pt-2">
                    {item.details.advice}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 图例 */}
        <div className="flex items-center gap-4 mt-6 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-400" />
            <span className="text-white/40">上涨</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-rose-400" />
            <span className="text-white/40">下跌</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">人生K线生成器</span>
          </h1>
          <p className="text-white/40">基于八字命理的运势可视化分析</p>
        </div>

        {/* 输入表单 */}
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">出生年</label>
              <input
                type="number"
                value={birthData.year}
                onChange={(e) => setBirthData({ ...birthData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">月</label>
              <input
                type="number"
                value={birthData.month}
                onChange={(e) => setBirthData({ ...birthData, month: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">日</label>
              <input
                type="number"
                value={birthData.day}
                onChange={(e) => setBirthData({ ...birthData, day: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">时辰</label>
              <input
                type="number"
                value={birthData.hour}
                onChange={(e) => setBirthData({ ...birthData, hour: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">性别</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBirthData({ ...birthData, gender: 'male' })}
                  className={`flex-1 py-3 rounded-xl border transition-all ${
                    birthData.gender === 'male'
                      ? 'bg-neon-blue/20 border-neon-blue text-neon-blue'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  男
                </button>
                <button
                  onClick={() => setBirthData({ ...birthData, gender: 'female' })}
                  className={`flex-1 py-3 rounded-xl border transition-all ${
                    birthData.gender === 'female'
                      ? 'bg-neon-pink/20 border-neon-pink text-neon-pink'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  女
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">预测天数</label>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              >
                <option value={7}>7天</option>
                <option value={30}>30天</option>
                <option value={90}>90天</option>
                <option value={365}>1年</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={generateKLine}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                AI分析中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                生成人生K线
              </>
            )}
          </button>
          
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 八字信息 */}
        {result?.bazi && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20"
          >
            <h3 className="text-lg font-semibold mb-4">八字命盘</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: '年柱', value: result.bazi.year },
                { label: '月柱', value: result.bazi.month },
                { label: '日柱', value: result.bazi.day, highlight: true },
                { label: '时柱', value: result.bazi.hour },
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-2xl text-center ${
                  item.highlight ? 'bg-white/10' : 'bg-white/5'
                }`}>
                  <div className="text-xs text-white/40 mb-1">{item.label}</div>
                  <div className={`text-2xl font-bold ${
                    item.highlight ? 'gradient-text' : 'text-white'
                  }`}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-white/40">日主：</span>
              <span className="text-neon-blue font-semibold">{result.bazi.riZhu}</span>
            </div>
          </motion.div>
        )}

        {/* K线图 */}
        {renderKLine()}

        {/* 运势总结 */}
        {result?.summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white/[0.02] border border-white/5"
          >
            <h3 className="text-lg font-semibold mb-4">运势总结</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold">
                {result.summary.currentLuck}
              </div>
              <div className={`flex items-center gap-1 ${
                result.summary.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {result.summary.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span>{result.summary.trend === 'up' ? '上升' : '下降'}</span>
              </div>
            </div>
            <p className="text-white/60">{result.summary.suggestion}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
