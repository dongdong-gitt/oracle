'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface LifeDataPoint {
  age: number;
  year: number;
  value: number;
  ganZhi: string;
  trend: 'up' | 'down' | 'flat';
  event?: string;
}

const mockLifeData: LifeDataPoint[] = [
  { age: 0, year: 1995, value: 50, ganZhi: '乙亥', trend: 'flat' },
  { age: 5, year: 2000, value: 55, ganZhi: '庚辰', trend: 'up', event: '入学' },
  { age: 10, year: 2005, value: 60, ganZhi: '乙酉', trend: 'up' },
  { age: 15, year: 2010, value: 45, ganZhi: '庚寅', trend: 'down', event: '学业压力' },
  { age: 18, year: 2013, value: 70, ganZhi: '癸巳', trend: 'up', event: '高考' },
  { age: 22, year: 2017, value: 75, ganZhi: '丁酉', trend: 'up', event: '毕业' },
  { age: 25, year: 2020, value: 40, ganZhi: '庚子', trend: 'down', event: '低谷' },
  { age: 28, year: 2023, value: 65, ganZhi: '癸卯', trend: 'up', event: '起步' },
  { age: 30, year: 2025, value: 85, ganZhi: '乙巳', trend: 'up', event: '当前' },
  { age: 32, year: 2027, value: 90, ganZhi: '丁未', trend: 'up', event: '高峰' },
  { age: 35, year: 2030, value: 60, ganZhi: '庚戌', trend: 'down' },
  { age: 40, year: 2035, value: 95, ganZhi: '乙卯', trend: 'up', event: '巅峰' },
  { age: 45, year: 2040, value: 70, ganZhi: '庚申', trend: 'down' },
  { age: 50, year: 2045, value: 75, ganZhi: '乙丑', trend: 'up' },
  { age: 55, year: 2050, value: 65, ganZhi: '庚午', trend: 'down' },
  { age: 60, year: 2055, value: 80, ganZhi: '乙亥', trend: 'up', event: '新开始' },
];

export default function LifeKLine() {
  const [, setSelectedPoint] = useState<LifeDataPoint | null>(null);

  const currentValue = mockLifeData.find(d => d.year === 2025)?.value || 50;
  const maxValue = Math.max(...mockLifeData.map(d => d.value));
  const minValue = Math.min(...mockLifeData.map(d => d.value));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: LifeDataPoint }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 rounded-xl" style={{ background: 'rgba(20,20,20,0.95)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
          <div className="text-lg font-semibold text-white">{data.age}岁 · {data.year}年</div>
          <div className="text-cyan-400 text-sm">{data.ganZhi}</div>
          <div className="text-2xl font-semibold mt-2" style={{ color: getColorByValue(data.value) }}>
            {data.value}%
          </div>
          {data.event && (
            <div className="text-sm text-white/40 mt-1">{data.event}</div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* 统计 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-xs text-white/40 mb-1">当前运势</div>
          <div className={`text-2xl font-semibold ${currentValue >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {currentValue}%
          </div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-xs text-white/40 mb-1">人生巅峰</div>
          <div className="text-2xl font-semibold text-emerald-400">{maxValue}%</div>
          <div className="text-xs text-white/30">{mockLifeData.find(d => d.value === maxValue)?.year}年</div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-xs text-white/40 mb-1">最低谷</div>
          <div className="text-2xl font-semibold text-red-400">{minValue}%</div>
          <div className="text-xs text-white/30">{mockLifeData.find(d => d.value === minValue)?.year}年</div>
        </div>
      </div>

      {/* 图表 */}
      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={mockLifeData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="age" 
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              tickFormatter={(value) => `${value}岁`}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill="url(#colorValue)"
            />
            
            <Line
              type="monotone"
              dataKey="value"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={(props: { cx?: number; cy?: number; payload?: LifeDataPoint }) => {
                const { cx = 0, cy = 0, payload } = props;
                if (!payload) return null;
                const isCurrent = payload.year === 2025;
                const isEvent = payload.event;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isCurrent ? 5 : isEvent ? 3 : 0}
                    fill={isCurrent ? '#f59e0b' : '#06b6d4'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedPoint(payload)}
                  />
                );
              }}
              activeDot={{ r: 5, fill: '#f59e0b' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-4 text-xs text-white/40 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span>高位 (&gt;75%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          <span>平稳 (25-75%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <span>低谷 (&lt;25%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <span>重要节点</span>
        </div>
      </div>

      {/* 高光与注意 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 className="font-medium text-emerald-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            高光时刻
          </h4>
          <ul className="space-y-2 text-sm text-white/50">
            {mockLifeData
              .filter(d => d.value >= 80 && d.year >= 2025)
              .slice(0, 3)
              .map((d, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-cyan-400">{d.year}年</span>
                  <span className="text-white/30">({d.age}岁) {d.ganZhi}</span>
                </li>
              ))}
          </ul>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 className="font-medium text-amber-400 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            注意年份
          </h4>
          <ul className="space-y-2 text-sm text-white/50">
            {mockLifeData
              .filter(d => d.value <= 45 && d.year >= 2025)
              .slice(0, 3)
              .map((d, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-cyan-400">{d.year}年</span>
                  <span className="text-white/30">({d.age}岁) {d.ganZhi}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function getColorByValue(value: number): string {
  if (value >= 75) return '#34d399';
  if (value >= 50) return '#06b6d4';
  if (value >= 25) return '#fbbf24';
  return '#f87171';
}
