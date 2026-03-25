'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Sparkles } from 'lucide-react';

const guaXiang = [
  { name: '乾', symbol: '☰', nature: '天', meaning: '元亨利贞', desc: '大吉，万事亨通' },
  { name: '坤', symbol: '☷', nature: '地', meaning: '厚德载物', desc: '柔顺，宜守成' },
  { name: '震', symbol: '☳', nature: '雷', meaning: '震惊百里', desc: '动而有获，宜行动' },
  { name: '巽', symbol: '☴', nature: '风', meaning: '随风巽', desc: '谦逊，宜入不宜出' },
  { name: '坎', symbol: '☵', nature: '水', meaning: '习坎', desc: '险中有险，需谨慎' },
  { name: '离', symbol: '☲', nature: '火', meaning: '利贞亨', desc: '光明，宜文不宜武' },
  { name: '艮', symbol: '☶', nature: '山', meaning: '艮其背', desc: '止，宜静不宜动' },
  { name: '兑', symbol: '☱', nature: '泽', meaning: '亨利贞', desc: '悦，宜交际' },
];

export default function LiuYao() {
  const [currentGua, setCurrentGua] = useState<typeof guaXiang[0] | null>(null);
  const [isThrowing, setIsThrowing] = useState(false);

  const throwCoins = () => {
    setIsThrowing(true);
    setTimeout(() => {
      const random = Math.floor(Math.random() * guaXiang.length);
      setCurrentGua(guaXiang[random]);
      setIsThrowing(false);
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
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
          <Coins className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-[32px] font-semibold text-white mb-3">六爻占卜</h2>
        <p className="text-white/50">易理决策，洞察先机</p>
      </div>

      {!currentGua ? (
        <div className="text-center">
          {/* 铜钱动画 */}
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={isThrowing ? {
                  rotateY: [0, 720, 1440, 2160],
                  y: [0, -50, 0],
                } : {}}
                transition={{ duration: 2, delay: i * 0.1 }}
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)',
                }}
              >
                <span className="text-amber-900">乾</span>
              </motion.div>
            ))}
          </div>

          <button
            onClick={throwCoins}
            disabled={isThrowing}
            className="px-10 py-4 rounded-full text-white font-medium text-lg"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}
          >
            {isThrowing ? '占卜中...' : '开始占卜'}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-2xl text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
        >
          {/* 卦象 */}
          <div className="text-6xl mb-4">{currentGua.symbol}</div>
          <div className="text-3xl font-semibold text-white mb-2">
            {currentGua.name}卦
          </div>
          <div className="text-white/50 mb-2">{currentGua.nature}</div>
          <div className="text-xl text-purple-400 mb-6">
            {currentGua.meaning}
          </div>

          {/* 解卦 */}
          <div className="p-6 rounded-xl mb-6 text-left"
            style={{ background: 'rgba(139, 92, 246, 0.05)', border: '0.5px solid rgba(139, 92, 246, 0.2)' }}>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              卦象解读
            </h3>
            <p className="text-white/60">{currentGua.desc}</p>
          </div>

          <button
            onClick={() => setCurrentGua(null)}
            className="px-8 py-3 rounded-full text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            再占一卦
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
