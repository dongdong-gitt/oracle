'use client';

import { motion } from 'framer-motion';
import { Crown, Zap, Users, BookOpen, MessageSquare, Check } from 'lucide-react';

export default function Membership() {
  const plans = [
    {
      name: '探索者',
      price: '免费',
      period: '',
      desc: '体验基础功能',
      features: ['基础命盘分析', '白皮书摘要', '公开洞察', '社区浏览'],
      popular: false,
    },
    {
      name: '洞察者',
      price: '¥1,999',
      period: '/年',
      desc: '深度周期分析',
      features: ['完整命盘解读', '人生K线分析', '五行能量诊断', '年度运势报告', '白皮书完整版', '季度趋势报告'],
      popular: true,
    },
    {
      name: '智库会员',
      price: '¥9,999',
      period: '/年',
      desc: '全方位投资顾问',
      features: ['洞察者全部权益', '个性化投资策略', 'AI顾问无限对话', '股票量化策略', '加密市场分析', '私密分享会', '圈层资源对接', '1对1顾问服务'],
      popular: false,
    },
  ];

  const benefits = [
    { icon: BookOpen, title: '趋势洞察报告', desc: '季度宏观趋势与行业机会' },
    { icon: Zap, title: '量化投资策略', desc: '股票与加密市场模型' },
    { icon: Users, title: '私密分享会', desc: '季度闭门会议' },
    { icon: MessageSquare, title: 'AI顾问服务', desc: '24/7在线解答' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* 头部 */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ background: 'rgba(245, 158, 11, 0.1)', border: '0.5px solid rgba(245, 158, 11, 0.2)' }}>
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-400">会员权益</span>
        </div>
        <h1 className="text-[32px] font-semibold text-white mb-3">
          选择适合你的投资顾问方案
        </h1>
        <p className="text-white/50">
          从基础洞察到全方位顾问服务，为你的财富增长提供专业支持
        </p>
      </div>

      {/* 价格方案 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-2xl overflow-hidden ${plan.popular ? 'ring-1 ring-cyan-400/50' : ''}`}
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 px-3 py-1 text-xs font-medium text-white rounded-bl-lg"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                最受欢迎
              </div>
            )}
            <div className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-semibold text-white">{plan.price}</span>
                <span className="text-white/40">{plan.period}</span>
              </div>
              <p className="text-white/40 text-sm mb-5">{plan.desc}</p>
              
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/60">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-full font-medium transition-all ${
                plan.popular
                  ? 'text-white'
                  : 'text-white/80 hover:text-white'
              }`}
              style={plan.popular 
                ? { background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }
                : { background: 'rgba(255,255,255,0.1)' }
              }>
                {plan.price === '免费' ? '立即体验' : '选择方案'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 核心权益 */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-lg font-semibold text-white mb-6 text-center">核心权益</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="font-medium text-white mb-1">{benefit.title}</h4>
                <p className="text-xs text-white/40">{benefit.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
