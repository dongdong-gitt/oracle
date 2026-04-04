'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface ScoreShape {
  career: number;
  wealth: number;
  love: number;
  health: number;
  overall: number;
}

interface ShiChenPoint {
  time: string;
  score: number;
}

interface DailyData {
  date: string;
  lunar: string;
  yi: string[];
  ji: string[];
  guidance: string;
  master: string;
  detail: string;
  score: ScoreShape;
  yongShen: string;
  jiShen: string;
  shiChen: ShiChenPoint[];
  source?: 'fallback' | 'deepseek';
}

function weightedOverall(score: Omit<ScoreShape, 'overall'>) {
  return Math.round(score.career * 0.3 + score.wealth * 0.25 + score.love * 0.25 + score.health * 0.2);
}

function buildLocalFallback(params: {
  date: Date;
  score: ScoreShape;
  shiChen: ShiChenPoint[];
  yongShen: string;
  jiShen: string;
}): DailyData {
  const { date, score, shiChen, yongShen, jiShen } = params;
  const [best] = [...shiChen].sort((a, b) => b.score - a.score);
  const [weakest] = [...shiChen].sort((a, b) => a.score - b.score);

  const guidance = score.overall >= 80 ? '顺势推进' : score.overall >= 65 ? '稳中求进' : score.overall >= 50 ? '谨慎执行' : '先守后攻';
  const yi = score.overall >= 65
    ? ['主线任务推进', '分批执行计划', '复盘资金节奏', '高质量沟通']
    : ['降低仓位波动', '聚焦关键任务', '固定作息运动', '延迟冲动决策'];
  const ji = score.overall >= 65
    ? ['情绪化加仓', '临时改计划', '过度熬夜']
    : ['重仓追涨杀跌', '高压硬扛不休息', '争执升级', '超预算消费'];

  return {
    date: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
    lunar: `农历参考 ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    guidance,
    master: '统一周期引擎',
    detail: `今日综合分 ${score.overall}。高效时段建议放在 ${best?.time || '中段'}，低效时段 ${weakest?.time || '尾段'} 注意降风险。先按“用神 ${yongShen || '未设'}”做增益，再规避“忌神 ${jiShen || '未设'}”相关行为。`,
    yi,
    ji,
    score,
    yongShen: yongShen || '未设',
    jiShen: jiShen || '未设',
    shiChen,
    source: 'fallback',
  };
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
      const targetYear = currentDate.getFullYear();
      const targetMonth = currentDate.getMonth() + 1;
      const targetDay = currentDate.getDate();

      const [birthYear, birthMonth, birthDay] = birthData.birthDate.split('-').map(Number);
      const birthHour = parseInt(birthData.birthTime.split(':')[0] || '0', 10);

      const params = new URLSearchParams({
        period: '1d',
        birthYear: String(birthYear),
        birthMonth: String(birthMonth),
        birthDay: String(birthDay),
        birthHour: String(birthHour),
        gender: birthData.gender,
        targetYear: String(targetYear),
        targetMonth: String(targetMonth),
        targetDay: String(targetDay),
      });

      const response = await fetch(`/api/kline?${params.toString()}`, { cache: 'no-store' });
      const result = await response.json();
      const klineData = Array.isArray(result?.data?.kline) ? result.data.kline : [];

      if (!result?.success || klineData.length === 0) {
        setDailyData(null);
        return;
      }

      const avgCareer = Math.round(klineData.reduce((a: number, b: any) => a + Number(b?.details?.career || 0), 0) / klineData.length);
      const avgWealth = Math.round(klineData.reduce((a: number, b: any) => a + Number(b?.details?.wealth || 0), 0) / klineData.length);
      const avgLove = Math.round(klineData.reduce((a: number, b: any) => a + Number(b?.details?.love || 0), 0) / klineData.length);
      const avgHealth = Math.round(klineData.reduce((a: number, b: any) => a + Number(b?.details?.health || 0), 0) / klineData.length);

      const score: ScoreShape = {
        career: avgCareer,
        wealth: avgWealth,
        love: avgLove,
        health: avgHealth,
        overall: weightedOverall({ career: avgCareer, wealth: avgWealth, love: avgLove, health: avgHealth }),
      };

      const shiChen: ShiChenPoint[] = klineData.map((item: any) => ({
        time: String(item?.label || ''),
        score: Number(item?.details?.overall || item?.close || 0),
      }));

      const yongShen = String((baziResult as any)?.detail?.['用神'] || (baziResult as any)?.detail?.yongShen || '');
      const jiShen = String((baziResult as any)?.detail?.['忌神'] || (baziResult as any)?.detail?.jiShen || '');

      const fallback = buildLocalFallback({
        date: currentDate,
        score,
        shiChen,
        yongShen,
        jiShen,
      });

      setDailyData(fallback);

      const aiResponse = await fetch('/api/guidance/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`,
          score,
          shiChen,
          yongShen,
          jiShen,
          birth: {
            birthYear,
            birthMonth,
            birthDay,
            birthHour,
            gender: birthData.gender,
          },
        }),
      });

      const aiResult = await aiResponse.json().catch(() => null);
      if (aiResult?.success && aiResult?.data) {
        setDailyData({
          ...fallback,
          ...aiResult.data,
          score,
          shiChen,
          yongShen: fallback.yongShen,
          jiShen: fallback.jiShen,
        });
      }
    } catch (error) {
      console.error('Failed to fetch daily guidance:', error);
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
    return <div className="flex items-center justify-center h-96 text-white/50">请先输入出生信息</div>;
  }

  if (loading && !dailyData) {
    return <div className="flex items-center justify-center h-96 text-white/50">加载中...</div>;
  }

  if (!dailyData) {
    return <div className="flex items-center justify-center h-96 text-white/50">暂无数据</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={handlePrevDay} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
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
        <button onClick={handleNextDay} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 text-white/60" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 mb-6">
        <div className="flex justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={dailyData.score.overall >= 60 ? '#ef4444' : '#10b981'}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${(dailyData.score.overall / 100) * 439.82} 439.82`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${dailyData.score.overall >= 60 ? 'text-red-400' : 'text-emerald-400'}`}>{dailyData.score.overall}</span>
              <span className="text-xs text-white/40">综合分</span>
              <span className="text-[10px] text-white/30 mt-1">{dailyData.source === 'deepseek' ? 'AI+规则' : '规则fallback'}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="text-2xl font-semibold text-white mb-3">「{dailyData.guidance}」</div>
          <div className="text-sm text-white/50 mb-3">—— {dailyData.master}</div>
          <p className="text-white/75 leading-relaxed">{dailyData.detail}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="text-emerald-300 font-semibold mb-3">今日宜</div>
          <div className="flex flex-wrap gap-2">
            {dailyData.yi.map((item, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg text-sm text-emerald-300 bg-emerald-500/10">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20">
          <div className="text-rose-300 font-semibold mb-3">今日忌</div>
          <div className="flex flex-wrap gap-2">
            {dailyData.ji.map((item, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg text-sm text-rose-300 bg-rose-500/10">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">分项运势</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-2xl font-bold text-blue-400">{dailyData.score.career}</div>
            <div className="text-xs text-white/40">事业</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-2xl font-bold text-amber-400">{dailyData.score.wealth}</div>
            <div className="text-xs text-white/40">财运</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-2xl font-bold text-pink-400">{dailyData.score.love}</div>
            <div className="text-xs text-white/40">感情</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-2xl font-bold text-emerald-400">{dailyData.score.health}</div>
            <div className="text-xs text-white/40">健康</div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
        <h3 className="font-semibold text-white mb-4">十二时辰（与 1D 周期同步）</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {dailyData.shiChen.map((shi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-white/5 border border-white/5">
              <div className="text-xs text-white/40">{shi.time}</div>
              <div className={`text-lg font-bold ${shi.score >= 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                {Math.round(shi.score)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-sm text-white/50">
        <span>今日用神: <span className="text-emerald-300">{dailyData.yongShen}</span></span>
        <span className="text-white/20">|</span>
        <span>今日忌神: <span className="text-rose-300">{dailyData.jiShen}</span></span>
      </div>
    </motion.div>
  );
}
