'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Clock, MapPin } from 'lucide-react';

interface BirthFormProps {
  onSubmit: (data: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    gender: 'male' | 'female';
  }) => void;
}

export default function BirthForm({ onSubmit }: BirthFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    gender: 'female' as 'male' | 'female',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="glass-card rounded-3xl p-8 w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">探索你的命运</h2>
        <p className="text-gray-400 text-sm">输入出生信息，开启AI命盘解读</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            姓名
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入你的姓名"
            className="w-full px-4 py-3 rounded-xl"
            required
          />
        </div>

        {/* 性别 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            性别
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'male' })}
              className={`flex-1 py-3 rounded-xl border transition-all ${
                formData.gender === 'male'
                  ? 'border-indigo-500 bg-indigo-500/20 text-white'
                  : 'border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              男
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'female' })}
              className={`flex-1 py-3 rounded-xl border transition-all ${
                formData.gender === 'female'
                  ? 'border-indigo-500 bg-indigo-500/20 text-white'
                  : 'border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              女
            </button>
          </div>
        </div>

        {/* 出生日期 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            出生日期
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="w-full px-4 py-3 rounded-xl"
            required
          />
        </div>

        {/* 出生时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            出生时间
          </label>
          <input
            type="time"
            value={formData.birthTime}
            onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
            className="w-full px-4 py-3 rounded-xl"
            required
          />
        </div>

        {/* 出生地点 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            出生地点
          </label>
          <input
            type="text"
            value={formData.birthPlace}
            onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
            placeholder="例如：北京市"
            className="w-full px-4 py-3 rounded-xl"
            required
          />
        </div>

        {/* 提交按钮 */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg btn-glow"
        >
          生成命盘
        </motion.button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-6">
        数据仅用于命盘计算，不会存储或分享
      </p>
    </motion.div>
  );
}
