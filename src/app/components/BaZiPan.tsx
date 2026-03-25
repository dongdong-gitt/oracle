'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User, Sparkles } from 'lucide-react';

export default function BaZiPan() {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
  });
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResult(true);
  };

  // 模拟八字数据
  const baZiData = {
    year: { gan: '甲', zhi: '子', wuxing: '木' },
    month: { gan: '丙', zhi: '寅', wuxing: '火' },
    day: { gan: '戊', zhi: '辰', wuxing: '土' },
    hour: { gan: '庚', zhi: '午', wuxing: '金' },
    rizhu: '戊土',
    yongshen: '火',
    xishen: '土',
    jishen: '水',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {!showResult ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-[32px] font-semibold text-white mb-3">智能八字排盘</h2>
          <p className="text-white/50 mb-8">结合传统四柱算法与现代AI推理，为您生成精准的命盘分析</p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div className="text-left">
              <label className="text-sm text-white/50 mb-2 block">姓名（可选）</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入姓名"
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder:text-white/30"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            </div>

            <div className="text-left">
              <label className="text-sm text-white/50 mb-2 block">性别</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`flex-1 py-3 rounded-xl transition-all ${
                    formData.gender === 'male'
                      ? 'text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                  style={{
                    background: formData.gender === 'male' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: formData.gender === 'male' ? '0.5px solid rgba(6, 182, 212, 0.5)' : '0.5px solid rgba(255,255,255,0.1)',
                  }}
                >
                  乾造（男）
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`flex-1 py-3 rounded-xl transition-all ${
                    formData.gender === 'female'
                      ? 'text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                  style={{
                    background: formData.gender === 'female' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: formData.gender === 'female' ? '0.5px solid rgba(236, 72, 153, 0.5)' : '0.5px solid rgba(255,255,255,0.1)',
                  }}
                >
                  坤造（女）
                </button>
              </div>
            </div>

            <div className="text-left">
              <label className="text-sm text-white/50 mb-2 block">出生日期（公历）</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                  required
                />
              </div>
            </div>

            <div className="text-left">
              <label className="text-sm text-white/50 mb-2 block">出生时间</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                  required
                />
              </div>
            </div>

            <div className="text-left">
              <label className="text-sm text-white/50 mb-2 block">出生地</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  placeholder="请输入出生地（如城市或地区）"
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder:text-white/30"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl text-white font-medium mt-6"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
            >
              立即排盘并解读
            </button>
          </form>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 八字结果 */}
          <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-xl font-semibold text-white mb-6 text-center">八字命盘</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: '年柱', gan: baZiData.year.gan, zhi: baZiData.year.zhi, wuxing: baZiData.year.wuxing },
                { label: '月柱', gan: baZiData.month.gan, zhi: baZiData.month.zhi, wuxing: baZiData.month.wuxing },
                { label: '日柱', gan: baZiData.day.gan, zhi: baZiData.day.zhi, wuxing: baZiData.day.wuxing },
                { label: '时柱', gan: baZiData.hour.gan, zhi: baZiData.hour.zhi, wuxing: baZiData.hour.wuxing },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs text-white/40 mb-2">{item.label}</div>
                  <div className="text-3xl font-light text-white mb-1">{item.gan}{item.zhi}</div>
                  <div className="text-xs" style={{ color: item.wuxing === '木' ? '#22c55e' : item.wuxing === '火' ? '#f97316' : item.wuxing === '土' ? '#eab308' : item.wuxing === '金' ? '#fbbf24' : '#3b82f6' }}>
                    {item.wuxing}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 命理分析 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-sm text-white/40 mb-2">日主</div>
              <div className="text-2xl font-semibold text-white">{baZiData.rizhu}</div>
            </div>
            <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-sm text-white/40 mb-2">用神</div>
              <div className="text-2xl font-semibold text-amber-400">{baZiData.yongshen}</div>
            </div>
            <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-sm text-white/40 mb-2">忌神</div>
              <div className="text-2xl font-semibold text-red-400">{baZiData.jishen}</div>
            </div>
          </div>

          {/* AI解读 */}
          <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              AI深度解读
            </h3>
            <p className="text-white/60 leading-relaxed">
              您的命盘显示为<b className="text-white">{baZiData.rizhu}日主</b>，生于寅月，木旺之时。
              八字中官杀混杂，但有印星化杀生身，属于先苦后甜的格局。
              目前行运至乙巳大运，火旺之地，事业有望突破。
              建议把握2025-2027年的火运流年，积极进取。
            </p>
          </div>

          <button
            onClick={() => setShowResult(false)}
            className="w-full py-3 rounded-xl text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            重新排盘
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
