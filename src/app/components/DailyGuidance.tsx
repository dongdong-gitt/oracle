'use client';

import { motion } from 'framer-motion';
import { Sun, Sparkles } from 'lucide-react';

const dailyGuidance = {
  date: '2025年1月15日',
  lunar: '乙巳年 腊月十六',
  yi: ['签约', '出行', '投资', '学习'],
  ji: ['动土', '搬家', '争吵'],
  guidance: '灯火通明，心满意足',
  master: '参天大师',
  detail: '今日火气渐旺，适合主动出击。事业上可大胆提出新想法，财运方面有意外之喜。感情运平稳，单身者有望遇到心仪对象。健康方面注意保暖，避免受寒。',
};

export default function DailyGuidance() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
          <Sun className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-[32px] font-semibold text-white mb-3">每日指引</h2>
        <p className="text-white/50">{dailyGuidance.date} · {dailyGuidance.lunar}</p>
      </div>

      {/* 主指引 */}
      <div className="p-8 rounded-2xl mb-6 text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="text-3xl font-light text-white mb-4">
          「{dailyGuidance.guidance}」
        </div>
        <div className="text-white/40 text-sm">
          —— {dailyGuidance.master}
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
            {dailyGuidance.yi.map((item, i) => (
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
            {dailyGuidance.ji.map((item, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg text-sm text-red-400"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 详细解读 */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">今日详解</h3>
        </div>
        <p className="text-white/60 leading-relaxed">
          {dailyGuidance.detail}
        </p>
      </div>
    </motion.div>
  );
}
