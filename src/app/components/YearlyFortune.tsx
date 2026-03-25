'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Shield, Heart, Briefcase, Coins } from 'lucide-react';

interface YearlyFortune {
  year: number;
  ganZhi: string;
  overall: number;
  career: number;
  wealth: number;
  love: number;
  health: number;
  advice: string;
  highlights: string[];
  warnings: string[];
}

// 模拟流年数据
const mockYearlyData: YearlyFortune[] = [
  {
    year: 2025,
    ganZhi: '乙巳',
    overall: 80,
    career: 85,
    wealth: 75,
    love: 70,
    health: 80,
    advice: '今年整体运势上扬，事业有突破机会，适合主动出击。',
    highlights: ['事业上有贵人相助', '财运稳步提升', '适合学习新技能'],
    warnings: ['注意身体健康，避免熬夜'],
  },
  {
    year: 2026,
    ganZhi: '丙午',
    overall: 75,
    career: 80,
    wealth: 70,
    love: 75,
    health: 75,
    advice: '火旺之年，精力充沛但易冲动，做事需三思。',
    highlights: ['人际关系活跃', '创意灵感迸发', '社交运佳'],
    warnings: ['避免冲动决策', '注意情绪管理'],
  },
  {
    year: 2027,
    ganZhi: '丁未',
    overall: 85,
    career: 90,
    wealth: 80,
    love: 80,
    health: 85,
    advice: '运势达到高峰，事业财运双丰收，把握机会。',
    highlights: ['事业突破', '财运亨通', '感情稳定'],
    warnings: ['高处不胜寒，保持谦逊'],
  },
  {
    year: 2028,
    ganZhi: '戊申',
    overall: 65,
    career: 60,
    wealth: 65,
    love: 70,
    health: 70,
    advice: '运势有所回落，宜守不宜攻，稳扎稳打。',
    highlights: ['适合沉淀积累', '感情有进展'],
    warnings: ['事业遇阻', '投资需谨慎', '注意小人'],
  },
  {
    year: 2029,
    ganZhi: '己酉',
    overall: 70,
    career: 75,
    wealth: 70,
    love: 65,
    health: 75,
    advice: '运势逐步回升，事业有新机会，感情需用心经营。',
    highlights: ['事业转机', '财运回暖'],
    warnings: ['感情易有波折', '健康注意肠胃'],
  },
];

export default function YearlyFortune() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentYear = mockYearlyData[currentIndex];

  const nextYear = () => {
    if (currentIndex < mockYearlyData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevYear = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="glass-card rounded-3xl p-8"
    >
      {/* 头部导航 */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={prevYear}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <h3 className="text-3xl font-bold gradient-text">{currentYear.year}年</h3>
          <p className="text-gray-400">{currentYear.ganZhi}年</p>
        </div>
        
        <button
          onClick={nextYear}
          disabled={currentIndex === mockYearlyData.length - 1}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentYear.year}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* 总评分 */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBg(currentYear.overall)} border-4 border-white/10`}>
              <div>
                <div className={`text-5xl font-bold ${getScoreColor(currentYear.overall)}`}>
                  {currentYear.overall}
                </div>
                <div className="text-xs text-gray-400 mt-1">综合评分</div>
              </div>
            </div>
          </div>

          {/* 各项运势 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <ScoreCard
              icon={<Briefcase className="w-5 h-5" />}
              label="事业运"
              score={currentYear.career}
            />
            <ScoreCard
              icon={<Coins className="w-5 h-5" />}
              label="财运"
              score={currentYear.wealth}
            />
            <ScoreCard
              icon={<Heart className="w-5 h-5" />}
              label="感情运"
              score={currentYear.love}
            />
            <ScoreCard
              icon={<Shield className="w-5 h-5" />}
              label="健康运"
              score={currentYear.health}
            />
          </div>

          {/* 年度建议 */}
          <div className="glass rounded-xl p-6 mb-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              年度建议
            </h4>
            <p className="text-gray-300 leading-relaxed">{currentYear.advice}</p>
          </div>

          {/* 亮点与提醒 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-5">
              <h4 className="font-bold mb-3 text-green-400">✨ 年度亮点</h4>
              <ul className="space-y-2">
                {currentYear.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-xl p-5">
              <h4 className="font-bold mb-3 text-amber-400">⚠️ 注意事项</h4>
              <ul className="space-y-2">
                {currentYear.warnings.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-amber-400 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 年份指示器 */}
      <div className="flex justify-center gap-2 mt-8">
        {mockYearlyData.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? 'w-8 bg-indigo-500' : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ScoreCard({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="text-gray-400 mb-2 flex justify-center">{icon}</div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${getColor(score)}`}>{score}</div>
    </div>
  );
}
