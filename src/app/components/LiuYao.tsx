'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Sparkles, Compass, MapPin, Clock, Navigation } from 'lucide-react';
import { useUser } from '../context/UserContext';

type TabType = 'liuyao' | 'qimen';

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

const qimenDoors = [
  { name: '休门', direction: '北', element: '水', meaning: '休养、安宁', color: 'text-blue-400', bgColor: 'rgba(59, 130, 246, 0.1)' },
  { name: '生门', direction: '东北', element: '土', meaning: '生长、求财', color: 'text-green-400', bgColor: 'rgba(34, 197, 94, 0.1)' },
  { name: '伤门', direction: '东', element: '木', meaning: '竞争、突破', color: 'text-emerald-400', bgColor: 'rgba(16, 185, 129, 0.1)' },
  { name: '杜门', direction: '东南', element: '木', meaning: '隐匿、技术', color: 'text-teal-400', bgColor: 'rgba(20, 184, 166, 0.1)' },
  { name: '景门', direction: '南', element: '火', meaning: '文书、宣传', color: 'text-red-400', bgColor: 'rgba(239, 68, 68, 0.1)' },
  { name: '死门', direction: '西南', element: '土', meaning: '终结、地产', color: 'text-stone-400', bgColor: 'rgba(168, 162, 158, 0.1)' },
  { name: '惊门', direction: '西', element: '金', meaning: '诉讼、口才', color: 'text-amber-400', bgColor: 'rgba(245, 158, 11, 0.1)' },
  { name: '开门', direction: '西北', element: '金', meaning: '开创、事业', color: 'text-cyan-400', bgColor: 'rgba(6, 182, 212, 0.1)' },
];

export default function LiuYaoQimen() {
  const { birthData } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('liuyao');
  const [currentGua, setCurrentGua] = useState<typeof guaXiang[0] | null>(null);
  const [currentDoor, setCurrentDoor] = useState<typeof qimenDoors[0] | null>(null);
  const [isThrowing, setIsThrowing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [question, setQuestion] = useState('');

  const hashSeed = (text: string) => {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash >>> 0);
  };

  const pickIndex = (seedText: string, length: number) => {
    if (length <= 0) return 0;
    const seed = hashSeed(seedText);
    return seed % length;
  };

  const throwCoins = () => {
    setIsThrowing(true);
    setTimeout(() => {
      const now = new Date();
      const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      const seedText = [
        'liuyao',
        question.trim(),
        birthData?.birthDate || '',
        birthData?.birthTime || '',
        birthData?.gender || '',
        dateKey,
      ].join('|');
      const index = pickIndex(seedText, guaXiang.length);
      setCurrentGua(guaXiang[index]);
      setIsThrowing(false);
    }, 2000);
  };

  const calculateQimen = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const now = new Date();
      const dateHourKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}`;
      const seedText = [
        'qimen',
        question.trim(),
        birthData?.birthDate || '',
        birthData?.birthTime || '',
        birthData?.gender || '',
        dateHourKey,
      ].join('|');
      const index = pickIndex(seedText, qimenDoors.length);
      setCurrentDoor(qimenDoors[index]);
      setIsCalculating(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* 标题 */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
          <Coins className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-[32px] font-semibold text-white mb-3">六爻奇门</h2>
        <p className="text-white/50">六爻断事，奇门遁甲择时择方</p>
      </div>

      {/* Tab 切换 */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab('liuyao')}
          className={`px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === 'liuyao'
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            <span>六爻占卜</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('qimen')}
          className={`px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === 'qimen'
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5" />
            <span>奇门遁甲</span>
          </div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* 六爻占卜 */}
        {activeTab === 'liuyao' && (
          <motion.div
            key="liuyao"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {!currentGua ? (
              <div className="text-center">
                {/* 问题输入 */}
                <div className="max-w-md mx-auto mb-8">
                  <label className="text-sm text-white/50 mb-3 block">你想问什么？（可选）</label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="例如：这次投资是否顺利？"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 text-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

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
                  className="px-10 py-4 rounded-full text-white font-medium text-lg disabled:opacity-50"
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
                {question && (
                  <div className="text-white/50 mb-4">问：{question}</div>
                )}

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
                  onClick={() => { setCurrentGua(null); setQuestion(''); }}
                  className="px-8 py-3 rounded-full text-white/60 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  再占一卦
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 奇门遁甲 */}
        {activeTab === 'qimen' && (
          <motion.div
            key="qimen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {!currentDoor ? (
              <div className="text-center">
                {/* 说明 */}
                <div className="max-w-lg mx-auto mb-8 p-6 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2 mb-3 text-cyan-400">
                    <Navigation className="w-5 h-5" />
                    <span className="font-medium">奇门遁甲</span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    古代最高层次的预测学，通过分析时间、空间、方位的能量分布，
                    为你选择最佳行动时机和方向。
                  </p>
                </div>

                {/* 八门预览 */}
                <div className="grid grid-cols-4 gap-3 mb-8 max-w-2xl mx-auto">
                  {qimenDoors.map((door, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl text-center"
                      style={{ background: door.bgColor, border: '0.5px solid rgba(255,255,255,0.1)' }}
                    >
                      <div className={`text-sm font-medium ${door.color}`}>{door.name}</div>
                      <div className="text-xs text-white/40">{door.direction}</div>
                    </div>
                  ))}
                </div>

                {/* 起局按钮 */}
                <button
                  onClick={calculateQimen}
                  disabled={isCalculating}
                  className="px-10 py-4 rounded-full text-white font-medium text-lg disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
                >
                  {isCalculating ? '排局中...' : '起局排盘'}
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
              >
                {/* 主门 */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
                    style={{ background: currentDoor.bgColor, border: '0.5px solid rgba(255,255,255,0.2)' }}>
                    <Compass className={`w-10 h-10 ${currentDoor.color}`} />
                  </div>
                  <div className={`text-4xl font-semibold mb-2 ${currentDoor.color}`}>{currentDoor.name}</div>
                  <div className="text-white/50">五行属{currentDoor.element}</div>
                </div>

                {/* 信息卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                    <MapPin className="w-5 h-5 text-white/40 mx-auto mb-2" />
                    <div className="text-sm text-white/50 mb-1">吉利方位</div>
                    <div className="text-lg font-medium text-white">{currentDoor.direction}</div>
                  </div>
                  <div className="p-4 rounded-xl text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                    <Clock className="w-5 h-5 text-white/40 mx-auto mb-2" />
                    <div className="text-sm text-white/50 mb-1">当前时辰</div>
                    <div className="text-lg font-medium text-white">{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="p-4 rounded-xl text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                    <Sparkles className="w-5 h-5 text-white/40 mx-auto mb-2" />
                    <div className="text-sm text-white/50 mb-1">能量状态</div>
                    <div className="text-lg font-medium text-cyan-400">旺相</div>
                  </div>
                </div>

                {/* 解读 */}
                <div className="p-6 rounded-xl mb-6"
                  style={{ background: 'rgba(6, 182, 212, 0.05)', border: '0.5px solid rgba(6, 182, 212, 0.2)' }}>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    奇门解读
                  </h3>
                  <p className="text-white/60 mb-3">{currentDoor.meaning}</p>
                  <div className="text-sm text-cyan-400/80">
                    建议：向<strong className="text-cyan-400">{currentDoor.direction}</strong>方行动，有利于{currentDoor.meaning.split('、')[0]}相关事务。
                  </div>
                </div>

                <button
                  onClick={() => setCurrentDoor(null)}
                  className="w-full px-8 py-3 rounded-full text-white/60 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  重新起局
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
