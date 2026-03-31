'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface KLineData {
  time: string;
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  details?: {
    career: number;
    wealth: number;
    love: number;
    health: number;
    overall: number;
  };
}

type PeriodType = '1d' | '1m' | '1y' | '10y' | 'all';

interface LifeKLineProps {
  lang?: 'zh' | 'en';
}

const PERIOD_CONFIG: Record<PeriodType, { label: string; labelEn: string; days: number }> = {
  '1d': { label: '日', labelEn: 'Day', days: 1 },
  '1m': { label: '月', labelEn: 'Month', days: 30 },
  '1y': { label: '年', labelEn: 'Year', days: 365 },
  '10y': { label: '10年', labelEn: '10Y', days: 3650 },
  'all': { label: '终身', labelEn: 'Life', days: 29200 },
};

export default function LifeKLine({ lang = 'zh' }: LifeKLineProps) {
  const { birthData, baziResult } = useUser();
  const [data, setData] = useState<KLineData[]>([]);
  const [period, setPeriod] = useState<PeriodType>('1y');
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
  const [targetDay, setTargetDay] = useState(new Date().getDate());
  const [loading, setLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [stats, setStats] = useState<{ high: number; low: number; avg: number } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch K-line data from API
  const fetchKLineData = useCallback(async () => {
    if (!birthData) return;
    
    setLoading(true);
    setData([]); // Clear old data
    
    try {
      const [year, month, day] = birthData.birthDate.split('-').map(Number);
      const hour = parseInt(birthData.birthTime.split(':')[0]);
      
      const params = new URLSearchParams({
        period,
        birthYear: year.toString(),
        birthMonth: month.toString(),
        birthDay: day.toString(),
        birthHour: hour.toString(),
        gender: birthData.gender,
        targetYear: targetYear.toString(),
        targetMonth: targetMonth.toString(),
        targetDay: targetDay.toString(),
      });
      
      const response = await fetch(`/api/kline?${params}`);
      const result = await response.json();
      
      if (result.success && result.data && result.data.kline && result.data.kline.length > 0) {
        setData(result.data.kline);
        setStats(result.data.stats || null);
      }
      // API失败或返回空数据时，保持data为空，显示加载中
    } catch (error) {
      console.error('Failed to fetch K-line data:', error);
      // 保持data为空，显示加载中
    } finally {
      setLoading(false);
    }
  }, [birthData, period, targetYear, targetMonth, targetDay]);

  useEffect(() => {
    fetchKLineData();
  }, [fetchKLineData]);

  // Navigation handlers
  const handlePrev = () => {
    if (period === '1d') {
      const date = new Date(targetYear, targetMonth - 1, targetDay);
      date.setDate(date.getDate() - 1);
      setTargetYear(date.getFullYear());
      setTargetMonth(date.getMonth() + 1);
      setTargetDay(date.getDate());
    } else if (period === '1m') {
      const date = new Date(targetYear, targetMonth - 2, 1);
      setTargetYear(date.getFullYear());
      setTargetMonth(date.getMonth() + 1);
    } else if (period === '1y') {
      setTargetYear(targetYear - 1);
    } else if (period === '10y') {
      setTargetYear(targetYear - 10);
    }
  };

  const handleNext = () => {
    if (period === '1d') {
      const date = new Date(targetYear, targetMonth - 1, targetDay);
      date.setDate(date.getDate() + 1);
      setTargetYear(date.getFullYear());
      setTargetMonth(date.getMonth() + 1);
      setTargetDay(date.getDate());
    } else if (period === '1m') {
      const date = new Date(targetYear, targetMonth, 1);
      setTargetYear(date.getFullYear());
      setTargetMonth(date.getMonth() + 1);
    } else if (period === '1y') {
      setTargetYear(targetYear + 1);
    } else if (period === '10y') {
      setTargetYear(targetYear + 10);
    }
  };

  const getDateDisplay = () => {
    if (period === '1d') return `${targetYear}年${targetMonth}月${targetDay}日`;
    if (period === '1m') return `${targetYear}年${targetMonth}月`;
    if (period === '1y') return `${targetYear}年`;
    if (period === '10y') return `${targetYear}-${targetYear + 9}年`;
    return '终身运势';
  };

  const currentData = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1];
  const isUp = currentData ? currentData.close >= currentData.open : true;

  // Chart dimensions
  const chartHeight = 400;
  const chartWidth = chartRef.current?.clientWidth || 800;
  const padding = { top: 20, right: 60, bottom: 40, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const maxPrice = Math.max(...data.map(d => d.high), 100);
  const minPrice = Math.min(...data.map(d => d.low), 0);
  const priceRange = maxPrice - minPrice || 100;

  const getX = (index: number) => padding.left + (index / (data.length - 1 || 1)) * plotWidth;
  const getY = (price: number) => padding.top + plotHeight - ((price - minPrice) / priceRange) * plotHeight;

  // Calculate MA lines
  const calculateMA = (period: number) => {
    return data.map((_, i) => {
      if (i < period - 1) return null;
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      return sum / period;
    });
  };

  const ma7 = calculateMA(7);
  const ma20 = calculateMA(20);

  // Generate Y-axis ticks
  const yTicks = 5;
  const yAxisLabels = Array.from({ length: yTicks + 1 }, (_, i) => 
    Math.round(minPrice + (priceRange * i) / yTicks)
  );

  // Generate X-axis labels
  const getXAxisLabels = () => {
    if (data.length === 0) return [];
    // 日K显示所有12个时辰
    if (period === '1d' && data.length === 12) {
      return data.map((d, i) => ({
        index: i,
        label: d.label,
      }));
    }
    // 其他周期最多显示6个
    const count = Math.min(6, data.length);
    const step = Math.floor(data.length / count);
    return Array.from({ length: count }, (_, i) => ({
      index: i * step,
      label: data[i * step]?.label || '',
    }));
  };

  const xAxisLabels = getXAxisLabels();

  if (!birthData) {
    return (
      <div className="flex items-center justify-center h-96 text-white/50">
        请先输入出生信息
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {(Object.keys(PERIOD_CONFIG) as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                period === p
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {PERIOD_CONFIG[p].label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white/60" />
          </button>
          <span className="text-sm text-white/60 min-w-[120px] text-center">
            {getDateDisplay()}
          </span>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>

      {/* Price Info */}
      <div className="flex items-center gap-6 mb-4">
        <div>
          <span className={`text-3xl font-bold ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
            {currentData?.close.toFixed(2) || '0.00'}
          </span>
          <span className="text-white/40 text-sm ml-2">综合运势分</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/40">
          <span>高: <span className="text-white">{currentData?.high.toFixed(2) || '0.00'}</span></span>
          <span>低: <span className="text-white">{currentData?.low.toFixed(2) || '0.00'}</span></span>
          <span>均: <span className="text-white">{currentData ? ((currentData.open + currentData.high + currentData.low + currentData.close) / 4).toFixed(2) : '0.00'}</span></span>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <span className="text-sm text-white/40">
            {period === '1d' ? '日均得分' : period === '1m' ? '月均得分' : period === '1y' ? '年均得分' : period === '10y' ? '大运得分' : '人生得分'}: 
            <span className="text-amber-400 font-semibold">{stats?.avg.toFixed(2) || '0.00'}</span>
          </span>
          <div className="flex items-center gap-1 text-sm">
            <span className="w-3 h-0.5 bg-amber-400"></span>
            <span className="text-white/40">MA7</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="w-3 h-0.5 bg-purple-400"></span>
            <span className="text-white/40">MA20</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div 
        ref={chartRef}
        className="relative bg-[#1a1a2e]/50 rounded-xl border border-white/5 overflow-hidden"
        style={{ height: chartHeight }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/50">
            加载中...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/50">
            暂无数据
          </div>
        ) : (
          <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Grid lines */}
            {yAxisLabels.map((_, i) => {
              const y = padding.top + (plotHeight * i) / yTicks;
              return (
                <line
                  key={i}
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={1}
                />
              );
            })}

            {/* Y-axis labels */}
            {yAxisLabels.map((label, i) => {
              const y = padding.top + plotHeight - (plotHeight * i) / yTicks;
              return (
                <text
                  key={i}
                  x={chartWidth - padding.right + 10}
                  y={y + 4}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="10"
                  textAnchor="start"
                >
                  {label}
                </text>
              );
            })}

            {/* X-axis labels */}
            {xAxisLabels.map(({ index, label }) => {
              const x = getX(index);
              const isShiChen = period === '1d' && data.length === 12;
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight - (isShiChen ? 5 : 10)}
                  fill="rgba(255,255,255,0.4)"
                  fontSize={isShiChen ? "9" : "10"}
                  textAnchor="middle"
                  transform={isShiChen ? `rotate(-30, ${x}, ${chartHeight - 5})` : undefined}
                >
                  {label}
                </text>
              );
            })}

            {/* MA7 Line */}
            <path
              d={ma7
                .map((v, i) => v !== null ? `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}` : '')
                .join(' ')}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={1.5}
              opacity={0.8}
            />

            {/* MA20 Line */}
            <path
              d={ma20
                .map((v, i) => v !== null ? `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}` : '')
                .join(' ')}
              fill="none"
              stroke="#a855f7"
              strokeWidth={1.5}
              opacity={0.8}
            />

            {/* Candles - 中国股市：红涨绿跌 */}
            {data.map((d, i) => {
              const x = getX(i);
              const candleWidth = Math.max(2, plotWidth / data.length * 0.6);
              const isUp = d.close >= d.open; // 涨
              const color = isUp ? '#ef4444' : '#10b981'; // 红涨绿跌
              
              return (
                <g key={i}>
                  {/* High-low line */}
                  <line
                    x1={x}
                    y1={getY(d.high)}
                    x2={x}
                    y2={getY(d.low)}
                    stroke={color}
                    strokeWidth={1}
                  />
                  {/* Open-close rect */}
                  <rect
                    x={x - candleWidth / 2}
                    y={getY(Math.max(d.open, d.close))}
                    width={candleWidth}
                    height={Math.max(1, Math.abs(getY(d.open) - getY(d.close)))}
                    fill={color}
                    rx={1}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedIndex(i)}
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              );
            })}

            {/* Hover line */}
            {hoveredIndex !== null && (
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={chartHeight - padding.bottom}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )}
          </svg>
        )}

        {/* Hover tooltip */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="absolute bg-[#1a1a2e] border border-white/10 rounded-lg p-3 pointer-events-none"
            style={{
              left: Math.min(getX(hoveredIndex) + 10, chartWidth - 150),
              top: 10,
            }}
          >
            <div className="text-xs text-white/60 mb-1">{data[hoveredIndex].label}</div>
            <div className="text-sm text-white">
              开: <span className={data[hoveredIndex].open <= data[hoveredIndex].close ? 'text-emerald-400' : 'text-red-400'}>{data[hoveredIndex].open.toFixed(2)}</span>
            </div>
            <div className="text-sm text-white">
              收: <span className={data[hoveredIndex].close >= data[hoveredIndex].open ? 'text-emerald-400' : 'text-red-400'}>{data[hoveredIndex].close.toFixed(2)}</span>
            </div>
            <div className="text-sm text-white/60">高: {data[hoveredIndex].high.toFixed(2)}</div>
            <div className="text-sm text-white/60">低: {data[hoveredIndex].low.toFixed(2)}</div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedIndex !== null && data[selectedIndex]?.details && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <h4 className="text-white font-semibold mb-3">{data[selectedIndex].label} 运势详情</h4>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{data[selectedIndex].details?.career}</div>
              <div className="text-xs text-white/40">事业</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{data[selectedIndex].details?.wealth}</div>
              <div className="text-xs text-white/40">财运</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">{data[selectedIndex].details?.love}</div>
              <div className="text-xs text-white/40">感情</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{data[selectedIndex].details?.health}</div>
              <div className="text-xs text-white/40">健康</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{data[selectedIndex].details?.overall}</div>
              <div className="text-xs text-white/40">综合</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
