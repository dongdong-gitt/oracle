'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sun, Sparkles, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface DailyData {
  date: string;
  lunar: string;
  yi: string[];
  ji: string[];
  guidance: string;
  master: string;
  detail: string;
  score: {
    career: number;
    wealth: number;
    love: number;
    health: number;
    overall: number;
  };
  yongShen: string;
  jiShen: string;
  shiChen: {
    time: string;
    score: number;
  }[];
}

export default function DailyGuidance() {
  const { birthData, baziResult } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDailyData = useCallback(async () => {
    if (!birthData) return;
    
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();
      
      const [birthYear, birthMonth, birthDay] = birthData.birthDate.split('-').map(Number);
      const hour = parseInt(birthData.birthTime.split(':')[0]);
      
      // Fetch hour K-line for the specific day
      const params = new URLSearchParams({
        period: '1d',
        birthYear: birthYear.toString(),
        birthMonth: birthMonth.toString(),
        birthDay: birthDay.toString(),
        birthHour: hour.toString(),
        gender: birthData.gender,
        targetYear: year.toString(),
        targetMonth: month.toString(),
        targetDay: day.toString(),
      });
      
      const response = await fetch(`/api/kline?${params}`);
      const result = await response.json();
      
      if (result.success && result.data && result.data.kline && result.data.kline.length > 0) {
        const klineData = result.data.kline;
        
        // 计算当日平均（12个时辰的加权平均）
        const avgCareer = Math.round(klineData.reduce((a: number, b: any) => a + b.details.career, 0) / 12);
        const avgWealth = Math.round(klineData.reduce((a: number, b: any) => a + b.details.wealth, 0) / 12);
        const avgLove = Math.round(klineData.reduce((a: number, b: any) => a + b.details.love, 0) / 12);
        const avgHealth = Math.round(klineData.reduce((a: number, b: any) => a + b.details.health, 0) / 12);
        
        // 加权综合分
        const overall = Math.round(avgCareer * 0.3 + avgWealth * 0.25 + avgLove * 0.25 + avgHealth * 0.2);
        
        // 时辰数据
        const shiChen = klineData.map((item: any) => ({
          time: item.label,
          score: item.details.overall,
        }));
        
        setDailyData(generateDailyGuidance(currentDate, {
          career: avgCareer,
          wealth: avgWealth,
          love: avgLove,
          health: avgHealth,
          overall,
        }, shiChen, baziResult?.detail?.用神 || '金', baziResult?.detail?.忌神 || '火'));
      } else {
        setDailyData(null);
      }
    } catch (error) {
      console.error('Failed to fetch daily data:', error);
      setDailyData(null);
    } finally {
      setLoading(false);
    }
  }, [birthData, currentDate, baziResult]);

  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData]);

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  if (!birthData) {
    return (
      <div className="flex items-center justify-center h-96 text-white/50">
        请先输入出生信息
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-white/50">
        加载中...
      </div>
    );
  }

  if (!dailyData) {
    return (
      <div className="flex items-center justify-center h-96 text-white/50">
        加载中...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto"
    >
      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={handlePrevDay}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white/60" />
        </button>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full">
            <Calendar className="w-4 h-4 text-white/40" />
            <span className="text-white/60">{dailyData.date}</span>
            <span className="text-white/40">·</span>
            <span className="text-white/40">{dailyData.lunar}</span>
          </div>
        </div>
        <button
          onClick={handleNextDay}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Score Ring */}
      <div className="flex justify-center mb-8">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke={dailyData.score.overall >= 60 ? '#10b981' : '#ef4444'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(dailyData.score.overall / 100) * 351.86} 351.86`}
              style={{ filter: `drop-shadow(0 0 10px ${dailyData.score.overall >= 60 ? '#10b98140' : '#ef444440'})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${dailyData.score.overall >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>
              {dailyData.score.overall}
            </span>
            <span className="text-xs text-white/40">综合分</span>
          </div>
        </div>
      </div>

      {/* 主指引 */}
      <div className="p-8 rounded-2xl mb-6 text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="text-3xl font-light text-white mb-4">
          「{dailyData.guidance}」
        </div>
        <div className="text-white/40 text-sm">
          —— {dailyData.master}
        </div>
      </div>

      {/* 宜忌 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '0.5px solid rgba(34, 197, 94, 0.2)' }}>
          <div className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center text-sm">宜</span>
            今日宜
          </div>
          <div className="flex flex-wrap gap-2">
            {dailyData.yi.map((item, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg text-sm text-emerald-400"
                style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '0.5px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="text-red-400 font-semibold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-400/20 flex items-center justify-center text-sm">忌</span>
            今日忌
          </div>
          <div className="flex flex-wrap gap-2">
            {dailyData.ji.map((item, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg text-sm text-red-400"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 详细解读 */}
      <div className="p-6 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">今日详解</h3>
        </div>
        <p className="text-white/60 leading-relaxed">
          {dailyData.detail}
        </p>
      </div>

      {/* 分项评分 */}
      <div className="p-6 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        <h3 className="font-semibold text-white mb-4">分项运势（12时辰平均）</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{dailyData.score.career}</div>
            <div className="text-xs text-white/40">事业</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{dailyData.score.wealth}</div>
            <div className="text-xs text-white/40">财运</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-400">{dailyData.score.love}</div>
            <div className="text-xs text-white/40">感情</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{dailyData.score.health}</div>
            <div className="text-xs text-white/40">健康</div>
          </div>
        </div>
      </div>

      {/* 时辰运势 */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        <h3 className="font-semibold text-white mb-4">十二时辰运势</h3>
        <div className="grid grid-cols-6 gap-2">
          {dailyData.shiChen.map((shi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-white/5">
              <div className="text-xs text-white/40">{shi.time}</div>
              <div className={`text-lg font-bold ${shi.score >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>
                {shi.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 用神提示 */}
      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <span className="text-white/40">今日用神: <span className="text-emerald-400">{dailyData.yongShen}</span></span>
        <span className="text-white/20">|</span>
        <span className="text-white/40">今日忌神: <span className="text-red-400">{dailyData.jiShen}</span></span>
      </div>
    </motion.div>
  );
}

// Generate daily guidance based on score and elements
function generateDailyGuidance(
  date: Date,
  score: { career: number; wealth: number; love: number; health: number; overall: number },
  shiChen: { time: string; score: number }[],
  yongShen: string,
  jiShen: string
): DailyData {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Calculate lunar date (simplified)
  const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  
  // Generate guidance based on overall score
  let guidance = '';
  let detail = '';
  let yi: string[] = [];
  let ji: string[] = [];
  
  if (score.overall >= 80) {
    guidance = '天时地利，诸事顺遂';
    detail = '今日运势极佳，贵人相助，适合主动出击。事业上可大胆提出新想法，财运方面有意外之喜。感情运平稳，单身者有望遇到心仪对象。健康方面精神饱满。';
    yi = ['签约', '出行', '投资', '学习', '求职', '表白'];
    ji = ['争吵', '拖延', '冒险'];
  } else if (score.overall >= 60) {
    guidance = '平稳发展，稳中求进';
    detail = '今日运势平稳，适合按部就班地处理日常事务。工作上保持专注即可，财运方面小有收获。感情运平淡但温馨，健康方面注意保暖。';
    yi = ['工作', '学习', '理财', '社交'];
    ji = ['冲动消费', '熬夜', '剧烈运动'];
  } else if (score.overall >= 40) {
    guidance = '谨慎行事，以守为攻';
    detail = '今日运势欠佳，宜静不宜动。工作上避免与人争执，财运方面不宜大额支出。感情方面多沟通少猜疑，健康方面注意休息。';
    yi = ['休息', '反思', '整理', '学习'];
    ji = ['投资', '签约', '出行', '争吵'];
  } else {
    guidance = '韬光养晦，静待时机';
    detail = '今日运势低迷，诸事不顺。建议减少外出，避免重要决策。工作上低调行事，财运方面保守为上。感情方面避免冲突，健康方面注意调养。';
    yi = ['静养', '读书', '冥想', '整理'];
    ji = ['投资', '签约', '出行', '争吵', '熬夜', '饮酒'];
  }
  
  return {
    date: `${year}年${month}月${day}日`,
    lunar: `乙巳年 ${lunarMonths[month - 1]}月 ${lunarDays[day - 1] || '初一'}`,
    yi,
    ji,
    guidance,
    master: '子平大师',
    detail,
    score,
    yongShen,
    jiShen,
    shiChen,
  };
}
