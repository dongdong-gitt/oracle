'use client';


import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface WuXingData {
  name: string;
  value: number;
  fullMark: number;
}

interface WuXingChartProps {
  data: WuXingData[];
}

export default function WuXingChart({ data }: WuXingChartProps) {
  const getColor = (name: string) => {
    const colors: Record<string, string> = {
      '金': '#fbbf24',
      '木': '#22c55e',
      '水': '#3b82f6',
      '火': '#ef4444',
      '土': '#a855f7',
    };
    return colors[name] || '#06b6d4';
  };

  return (
    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
      <h3 className="text-base font-semibold text-white mb-4 text-center">五行能量分布</h3>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="五行"
              dataKey="value"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="#06b6d4"
              fillOpacity={0.15}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 text-center">
        {data.map((item) => (
          <div key={item.name} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-base font-medium" style={{ color: getColor(item.name) }}>
              {item.name}
            </div>
            <div className="text-xs text-white/40">{item.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
