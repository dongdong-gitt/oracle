'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';

const pastLifeTypes = [
  {
    type: '修行者',
    era: '唐宋时期',
    trait: '清心寡欲',
    desc: '前世你是一位深山中的修行者，终日与青灯古佛为伴。这一生你依然保持着内心的宁静，对物质欲望较淡，更注重精神层面的追求。',
    influence: '今生影响：你天生具有洞察力，适合从事研究、咨询等需要深度思考的工作。',
  },
  {
    type: '商贾',
    era: '明清时期',
    trait: '精明能干',
    desc: '前世你是丝绸之路上的一位商人，足迹遍布西域各国。这一生你依然具有敏锐的商业嗅觉，善于发现机会。',
    influence: '今生影响：你在投资理财方面有天赋，适合创业或从事商业活动。',
  },
  {
    type: '文人',
    era: '魏晋时期',
    trait: '风流倜傥',
    desc: '前世你是竹林七贤般的文人雅士，琴棋书画样样精通。这一生你依然具有艺术气质，对美有独特的感知。',
    influence: '今生影响：你在创意、设计、艺术领域有天赋，适合从事相关工作。',
  },
  {
    type: '医者',
    era: '汉代',
    trait: '仁心仁术',
    desc: '前世你是一位悬壶济世的医者，走遍山河为百姓治病。这一生你依然具有助人之心，善于倾听和关怀他人。',
    influence: '今生影响：你适合从事医疗、教育、心理咨询等帮助他人的工作。',
  },
  {
    type: '武将',
    era: '战国时期',
    trait: '勇猛果敢',
    desc: '前世你是一位驰骋沙场的将军，保家卫国。这一生你依然具有领导力和决断力，敢于面对挑战。',
    influence: '今生影响：你适合从事管理、领导岗位，或在竞争激烈的环境中发展。',
  },
];

export default function PastLife() {
  const [result, setResult] = useState<typeof pastLifeTypes[0] | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const reveal = () => {
    setIsRevealing(true);
    setTimeout(() => {
      const random = Math.floor(Math.random() * pastLifeTypes.length);
      setResult(pastLifeTypes[random]);
      setIsRevealing(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <RotateCcw className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-[32px] font-semibold text-white mb-3">前世今生</h2>
        <p className="text-white/50">因果轮回，探索你的命运轨迹</p>
      </div>

      {!result ? (
        <div className="text-center">
          {/* 轮回动画 */}
          <motion.div
            animate={isRevealing ? { rotate: 360 } : {}}
            transition={{ duration: 2, ease: 'linear' }}
            className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center"
            style={{
              background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #a855f7, #6366f1)',
              opacity: 0.3,
            }}
          >
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.8)' }}>
              <span className="text-4xl">☸</span>
            </div>
          </motion.div>

          <button
            onClick={reveal}
            disabled={isRevealing}
            className="px-10 py-4 rounded-full text-white font-medium text-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {isRevealing ? '探寻中...' : '揭示前世'}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
        >
          {/* 前世身份 */}
          <div className="text-center mb-6">
            <div className="text-sm text-white/40 mb-2">{result.era}</div>
            <div className="text-4xl font-semibold text-white mb-2">{result.type}</div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm"
              style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
              特质：{result.trait}
            </div>
          </div>

          {/* 前世描述 */}
          <div className="p-6 rounded-xl mb-6"
            style={{ background: 'rgba(99, 102, 241, 0.05)', border: '0.5px solid rgba(99, 102, 241, 0.2)' }}>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              前世记忆
            </h3>
            <p className="text-white/60 leading-relaxed">{result.desc}</p>
          </div>

          {/* 今生影响 */}
          <div className="p-6 rounded-xl mb-6"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="font-semibold text-white mb-3">今生影响</h3>
            <p className="text-white/60">{result.influence}</p>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full py-3 rounded-xl text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            再次探索
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
