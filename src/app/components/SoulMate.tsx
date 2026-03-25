'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

export default function SoulMate() {
  const [formData, setFormData] = useState({
    myName: '',
    myBirth: '',
    theirName: '',
    theirBirth: '',
  });
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResult(true);
  };

  // 模拟缘分数据
  const result = {
    score: 88,
    level: '天作之合',
    desc: '你们的八字互补性强，五行相生，是非常般配的一对。',
    analysis: '男方日主为戊土，女方日主为癸水，土克水为财，代表男方对女方有天然的吸引力。两人大运走势相似，未来十年都是事业上升期，可以互相扶持。',
    advice: '建议多沟通，男方要学会表达情感，女方要给予更多理解。2025年是你们关系突破的关键年份。',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}>
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-[32px] font-semibold text-white mb-3">灵魂伴侣</h2>
        <p className="text-white/50">AI描绘缘分速写，探索你们的命理契合度</p>
      </div>

      {!showResult ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 我方信息 */}
          <div className="p-6 rounded-2xl" style={{ background: 'rgba(236, 72, 153, 0.05)', border: '0.5px solid rgba(236, 72, 153, 0.2)' }}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-sm">我</span>
              我的信息
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/50 mb-2 block">姓名</label>
                <input
                  type="text"
                  value={formData.myName}
                  onChange={(e) => setFormData({ ...formData, myName: e.target.value })}
                  placeholder="请输入姓名"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-2 block">出生日期</label>
                <input
                  type="date"
                  value={formData.myBirth}
                  onChange={(e) => setFormData({ ...formData, myBirth: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* 对方信息 */}
          <div className="p-6 rounded-2xl" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '0.5px solid rgba(59, 130, 246, 0.2)' }}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm">TA</span>
              TA的信息
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/50 mb-2 block">姓名</label>
                <input
                  type="text"
                  value={formData.theirName}
                  onChange={(e) => setFormData({ ...formData, theirName: e.target.value })}
                  placeholder="请输入对方姓名"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-2 block">出生日期</label>
                <input
                  type="date"
                  value={formData.theirBirth}
                  onChange={(e) => setFormData({ ...formData, theirBirth: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl text-white font-medium text-lg"
            style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
          >
            探索缘分
          </button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* 缘分分数 */}
          <div className="p-8 rounded-2xl mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div className="text-7xl font-light text-white mb-2">{result.score}</div>
            <div className="text-2xl font-medium mb-2" style={{ color: '#ec4899' }}>{result.level}</div>
            <p className="text-white/50">{result.desc}</p>
          </div>

          {/* 分析 */}
          <div className="p-6 rounded-2xl mb-6 text-left"
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              命理分析
            </h3>
            <p className="text-white/60 leading-relaxed">{result.analysis}</p>
          </div>

          {/* 建议 */}
          <div className="p-6 rounded-2xl mb-6 text-left"
            style={{ background: 'rgba(236, 72, 153, 0.05)', border: '0.5px solid rgba(236, 72, 153, 0.2)' }}>
            <h3 className="font-semibold text-white mb-3">相处建议</h3>
            <p className="text-white/60 leading-relaxed">{result.advice}</p>
          </div>

          <button
            onClick={() => setShowResult(false)}
            className="px-8 py-3 rounded-full text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            重新测算
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
