'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';

const qianWen = [
  { level: '上上', text: '吉星高照，万事如意', desc: '今日运势极佳，适合重要决策和行动。贵人相助，事半功倍。' },
  { level: '上吉', text: '顺风顺水，心想事成', desc: '运势良好，计划可顺利推进。保持积极心态，机会自来。' },
  { level: '中吉', text: '平稳发展，小有收获', desc: '今日平顺，适合稳步前行。细节决定成败，谨慎行事。' },
  { level: '中平', text: '波澜不惊，静待时机', desc: '运势平淡，宜守不宜攻。韬光养晦，等待更好的时机。' },
  { level: '小凶', text: '略有波折，谨慎为上', desc: '今日需多加小心，避免冲动决策。退一步海阔天空。' },
  { level: '下下', text: '诸事不顺，宜静不宜动', desc: '运势低迷，建议低调行事。修身养性，等待转运。' },
];

export default function DailyQian() {
  const [currentQian, setCurrentQian] = useState<typeof qianWen[0] | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const drawQian = () => {
    setIsShaking(true);
    setTimeout(() => {
      const random = Math.floor(Math.random() * qianWen.length);
      setCurrentQian(qianWen[random]);
      setIsShaking(false);
    }, 1500);
  };

  const getLevelColor = (level: string) => {
    if (level.includes('上')) return 'text-amber-400';
    if (level.includes('中')) return 'text-cyan-400';
    return 'text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-[32px] font-semibold text-white mb-3">每日一签</h2>
        <p className="text-white/50">摇出今日运势灵签，心中有惑，就来问一签</p>
      </div>

      <AnimatePresence mode="wait">
        {!currentQian ? (
          <motion.div
            key="draw"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {/* 签筒 */}
            <motion.div
              animate={isShaking ? {
                rotate: [-5, 5, -5, 5, 0],
                y: [0, -10, 0],
              } : {}}
              transition={{ duration: 0.5, repeat: isShaking ? 3 : 0 }}
              className="w-32 h-48 mx-auto mb-8 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.3), rgba(234, 88, 12, 0.2))',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <span className="text-6xl font-light text-amber-400/50">签</span>
            </motion.div>

            <button
              onClick={drawQian}
              disabled={isShaking}
              className="px-10 py-4 rounded-full text-white font-medium text-lg"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
            >
              {isShaking ? '摇签中...' : '摇签'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-2xl text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
          >
            {/* 签文等级 */}
            <div className={`text-5xl font-light mb-4 ${getLevelColor(currentQian.level)}`}>
              {currentQian.level}
            </div>

            {/* 签文 */}
            <div className="text-2xl font-medium text-white mb-4">
              {currentQian.text}
            </div>

            {/* 解签 */}
            <p className="text-white/60 leading-relaxed mb-8">
              {currentQian.desc}
            </p>

            {/* 重新抽签 */}
            <button
              onClick={() => setCurrentQian(null)}
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full text-white/60 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <RefreshCw className="w-4 h-4" />
              再抽一签
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
