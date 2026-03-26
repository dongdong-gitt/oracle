'use client';

import { motion } from 'framer-motion';
import { BookOpen, Download, Share2, ChevronRight } from 'lucide-react';

export default function WhitePaper() {
  const chapters = [
    {
      num: '01',
      title: '财富周期的秘密',
      desc: '现代金融与命理智慧的融合，解读2025年全球经济周期与五行财富属性',
    },
    {
      num: '02',
      title: '周期的力量',
      desc: '财富起伏的根源：三重周期叠加效应，经济学与命理学的同频共振',
    },
    {
      num: '03',
      title: '财富守护之道',
      desc: '从命理与经济学双重视角，剖析财富流失原因与守财智慧',
    },
    {
      num: '04',
      title: '2025-2026策略地图',
      desc: '三层布局策略：核心爆发、稳健守财、灵活机会',
    },
  ];

  const principles = [
    { title: '知命不认命', desc: '明白命局规律，主动布局而非被动接受' },
    { title: '顺势不随潮', desc: '了解市场节奏，不盲目追涨杀跌' },
    { title: '守正出奇', desc: '核心资产稳健，机会资产灵活' },
    { title: '复盘成习', desc: '每个周期结束复盘，持续优化策略' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* 头部 */}
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
        >
          <BookOpen className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-[32px] font-semibold text-white mb-3">
          2025-2026 投资策略白皮书
        </h1>
        <p className="text-white/50">
          结合命理周期与全球投资趋势，揭示财富流动与时间节奏的关系
        </p>
      </div>

      {/* 下载 */}
      <div className="flex justify-center gap-3">
        <button className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
          <Download className="w-5 h-5" />
          下载完整版
        </button>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white/70 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
          <Share2 className="w-5 h-5" />
          分享
        </button>
      </div>

      {/* 章节 */}
      <div className="space-y-3">
        {chapters.map((chapter, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="group p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white/[0.05]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <span className="text-lg font-semibold text-amber-400">{chapter.num}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">
                  {chapter.title}
                </h4>
                <p className="text-white/40 text-sm">{chapter.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 核心观点 */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-lg font-semibold text-white mb-5">核心观点</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {principles.map((item, i) => (
            <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 className="font-medium text-cyan-400 mb-1">{item.title}</h4>
              <p className="text-sm text-white/40">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
