'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Maximize2, Settings } from 'lucide-react';
import { Language, t } from './Dashboard';

interface KLineData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface LifeKLineProps {
  lang: Language;
  period: string;
}

// Generate mock K-line data based on bazi patterns
const generateKLineData = (days: number): KLineData[] => {
  const data: KLineData[] = [];
  let basePrice = 75;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate bazi-based volatility
    const dayOfWeek = date.getDay();
    const volatility = dayOfWeek === 0 || dayOfWeek === 6 ? 0.02 : 0.05;
    const trend = Math.sin(i / 7) * 10; // Weekly cycle
    
    const open = basePrice + trend + (Math.random() - 0.5) * 5;
    const close = open + (Math.random() - 0.5) * volatility * 100;
    const high = Math.max(open, close) + Math.random() * volatility * 50;
    const low = Math.min(open, close) - Math.random() * volatility * 50;
    const volume = Math.floor(Math.random() * 1000) + 500;
    
    data.push({
      time: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      open: Math.max(0, Math.min(100, open)),
      high: Math.max(0, Math.min(100, high)),
      low: Math.max(0, Math.min(100, low)),
      close: Math.max(0, Math.min(100, close)),
      volume
    });
    
    basePrice = close;
  }
  
  return data;
};

export default function LifeKLine({ lang, period }: LifeKLineProps) {
  const [data, setData] = useState<KLineData[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const days = period === '1D' ? 30 : period === '1W' ? 90 : period === '1M' ? 365 : 1825;
    setData(generateKLineData(days));
  }, [period]);

  const currentData = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1];
  const isUp = currentData ? currentData.close >= currentData.open : true;

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

  const chartHeight = 320;
  const chartWidth = chartRef.current?.clientWidth || 800;
  const candleWidth = Math.max(4, (chartWidth - 60) / data.length - 2);
  const padding = 30;

  const maxPrice = Math.max(...data.map(d => d.high), 100);
  const minPrice = Math.min(...data.map(d => d.low), 0);
  const priceRange = maxPrice - minPrice || 1;

  const priceToY = (price: number) => {
    return chartHeight - padding - ((price - minPrice) / priceRange) * (chartHeight - 2 * padding);
  };

  return (
    <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2b3139]">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-lg">{t('lifeChart', lang)}</h3>
          <span className="text-xs px-2 py-1 rounded bg-[#2b3139] text-gray-400">{period}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#2b3139] rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-[#2b3139] rounded-lg transition-colors">
            <Maximize2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Price Info */}
      <div className="px-4 py-3 border-b border-[#2b3139] flex items-center gap-6">
        <div>
          <div className={`text-3xl font-mono font-bold ${isUp ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
            {currentData?.close.toFixed(2) || '--'}
          </div>
          <div className={`text-sm font-mono ${isUp ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
            {currentData ? `${isUp ? '+' : ''}${(currentData.close - currentData.open).toFixed(2)} (${((currentData.close - currentData.open) / currentData.open * 100).toFixed(2)}%)` : '--'}
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-gray-500">高:</span>
            <span className="font-mono ml-1 text-white">{currentData?.high.toFixed(2) || '--'}</span>
          </div>
          <div>
            <span className="text-gray-500">低:</span>
            <span className="font-mono ml-1 text-white">{currentData?.low.toFixed(2) || '--'}</span>
          </div>
          <div>
            <span className="text-gray-500">量:</span>
            <span className="font-mono ml-1 text-white">{currentData?.volume || '--'}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-yellow-400"></div>
            <span className="text-gray-400">MA7</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-purple-400"></div>
            <span className="text-gray-400">MA20</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="relative h-[320px] overflow-hidden">
        {/* Grid Lines */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Horizontal grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={padding + (i * (chartHeight - 2 * padding)) / 4}
              x2="100%"
              y2={padding + (i * (chartHeight - 2 * padding)) / 4}
              stroke="#2b3139"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
        </svg>

        {/* Candles */}
        <svg className="absolute inset-0 w-full h-full" style={{ paddingLeft: '30px' }}>
          {data.map((d, i) => {
            const x = i * (candleWidth + 2);
            const isCandleUp = d.close >= d.open;
            const color = isCandleUp ? '#0ecb81' : '#f6465d';
            
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedIndex(i)}
                className="cursor-pointer"
              >
                {/* Wick */}
                <line
                  x1={x + candleWidth / 2}
                  y1={priceToY(d.high)}
                  x2={x + candleWidth / 2}
                  y2={priceToY(d.low)}
                  stroke={color}
                  strokeWidth="1"
                />
                {/* Body */}
                <rect
                  x={x}
                  y={priceToY(Math.max(d.open, d.close))}
                  width={candleWidth}
                  height={Math.max(2, Math.abs(priceToY(d.open) - priceToY(d.close)))}
                  fill={isCandleUp ? color : color}
                  opacity={hoveredIndex === i ? 1 : 0.9}
                />
              </g>
            );
          })}

          {/* MA7 Line */}
          <path
            d={ma7.map((val, i) => {
              if (val === null) return '';
              const x = i * (candleWidth + 2) + candleWidth / 2;
              const y = priceToY(val);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* MA20 Line */}
          <path
            d={ma20.map((val, i) => {
              if (val === null) return '';
              const x = i * (candleWidth + 2) + candleWidth / 2;
              const y = priceToY(val);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#a855f7"
            strokeWidth="1.5"
            opacity="0.8"
          />
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && currentData && (
          <div 
            className="absolute top-4 left-4 p-3 rounded-lg bg-[#0b0e11]/90 border border-[#2b3139] text-xs z-10"
          >
            <div className="text-gray-400 mb-1">{currentData.time}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-gray-500">开:</span>
              <span className="font-mono text-white">{currentData.open.toFixed(2)}</span>
              <span className="text-gray-500">高:</span>
              <span className="font-mono text-white">{currentData.high.toFixed(2)}</span>
              <span className="text-gray-500">低:</span>
              <span className="font-mono text-white">{currentData.low.toFixed(2)}</span>
              <span className="text-gray-500">收:</span>
              <span className={`font-mono ${currentData.close >= currentData.open ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                {currentData.close.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Historical Event Modal */}
      {selectedIndex !== null && data[selectedIndex] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-[#2b3139] bg-amber-500/5"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-400 text-lg">⚡</span>
            </div>
            <div>
              <div className="font-semibold text-amber-400 mb-1">
                {lang === 'zh' ? '历史节点复盘' : 'Historical Review'}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {lang === 'zh' 
                  ? `检测到 ${data[selectedIndex].time} 此处你的运势经历过大幅波动。当时是否经历了重要决策或转变？这种K线形态通常对应着人生转折点的能量释放。`
                  : `Detected significant volatility at ${data[selectedIndex].time}. Did you experience major decisions or transitions then? This K-line pattern typically corresponds to energy release at life turning points.`
                }
              </p>
            </div>
            <button 
              onClick={() => setSelectedIndex(null)}
              className="ml-auto text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
