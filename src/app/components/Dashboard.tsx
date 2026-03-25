'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  BarChart3, 
  Target, 
  TrendingUp, 
  BookOpen, 
  MessageCircle, 
  Crown,
  ChevronRight,
  Flame,
  Zap,
  Wallet,
  Shield,
  Sparkles,
  Calendar,
  Sun,
  Heart,
  Coins,
  Moon,
  Star,
  Lightbulb,
  Users
} from 'lucide-react';
import WhitePaper from './WhitePaper';
import CycleTools from './CycleTools';
import Membership from './Membership';
import AIAdvisors from './AIAdvisors';
import MarketPulse from './MarketPulse';
import WuXingMatrix from './WuXingMatrix';
import BaZiPan from './BaZiPan';
import DailyGuidance from './DailyGuidance';
import SoulMate from './SoulMate';
import LiuYao from './LiuYao';
import DreamInterpreter from './DreamInterpreter';

type TabType = 'dashboard' | 'whitepaper' | 'cycles' | 'membership' | 'advisors' | 'market' | 'matrix' | 'bazi' | 'guidance' | 'soulmate' | 'liuyao' | 'dream';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: '首页', icon: Compass },
    { id: 'bazi', label: '八字排盘', icon: Calendar },
    { id: 'guidance', label: '每日指引', icon: Sun },
    { id: 'soulmate', label: '灵魂伴侣', icon: Heart },
    { id: 'liuyao', label: '六爻奇门', icon: Coins },
    { id: 'dream', label: '解梦·阿梦', icon: Moon },
    { id: 'market', label: '市场脉动', icon: BarChart3 },
    { id: 'matrix', label: '五行矩阵', icon: Target },
    { id: 'cycles', label: '周期工具', icon: TrendingUp },
    { id: 'whitepaper', label: '投资白皮书', icon: BookOpen },
    { id: 'advisors', label: 'AI顾问', icon: MessageCircle },
    { id: 'membership', label: '会员', icon: Crown },
  ];

  const quickStats = [
    { label: '当前大运', value: '乙巳', sub: '火旺', icon: Flame, color: 'text-orange-400' },
    { label: '年度运势', value: '85', sub: '进取期', icon: Zap, color: 'text-cyan-400' },
    { label: '财富指数', value: '88', sub: '稳健增长', icon: Wallet, color: 'text-amber-400' },
    { label: '风险等级', value: '中低', sub: '适合布局', icon: Shield, color: 'text-emerald-400' },
  ];

  const features = [
    {
      title: '八字排盘',
      subtitle: 'BAZI ANALYSIS',
      desc: '智能四柱算法，精准命盘解读',
      icon: Calendar,
      tab: 'bazi'
    },
    {
      title: '每日指引',
      subtitle: 'DAILY GUIDANCE',
      desc: '今日宜忌与运势详解',
      icon: Sun,
      tab: 'guidance'
    },
    {
      title: '灵魂伴侣',
      subtitle: 'SOUL MATE',
      desc: 'AI描绘缘分速写',
      icon: Heart,
      tab: 'soulmate'
    },
    {
      title: '六爻奇门',
      subtitle: 'I CHING & QIMEN',
      desc: '六爻断事，奇门遁甲择时择方',
      icon: Coins,
      tab: 'liuyao'
    },
    {
      title: '解梦·阿梦',
      subtitle: 'DREAM INTERPRETER',
      desc: '捕梦达人，潜意识翻译官',
      icon: Moon,
      tab: 'dream'
    },
    {
      title: '市场脉动',
      subtitle: 'MARKET PULSE',
      desc: '全球资产与命理周期的实时共振',
      icon: BarChart3,
      tab: 'market'
    },
  ];

  const insights = [
    { title: '2025乙巳年：火土渐旺，科技与文化迎来爆发期', date: '2025.01.15', tag: '年度' },
    { title: '离火九运投资地图：AI、新能源、数字经济布局指南', date: '2025.01.10', tag: '行业' },
    { title: '财富周期三起三落：如何识别你的高光时刻', date: '2025.01.05', tag: '周期' },
  ];

  const whyChoose = [
    {
      icon: Sparkles,
      title: 'AI 驱动',
      desc: '结合大语言模型与传统命理，提供深度个性化分析'
    },
    {
      icon: Lightbulb,
      title: '周期洞察',
      desc: '基于三元九运与宏观经济周期，把握时代机遇'
    },
    {
      icon: Users,
      title: '私密安全',
      desc: '数据端到端加密，命理信息仅你可见'
    },
    {
      icon: Star,
      title: '持续进化',
      desc: '算法持续优化，越用越懂你的命理轨迹'
    }
  ];

  return (
    <div className="min-h-screen bg-black flex">
      {/* 侧边栏 - Apple风格 */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: sidebarOpen ? 0 : -260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-[260px] z-50"
        style={{ 
          background: 'rgba(20, 20, 20, 0.8)',
          backdropFilter: 'blur(40px) saturate(180%)',
          borderRight: '0.5px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">O</span>
            </div>
            <span className="text-lg font-semibold tracking-wide">ORACLE</span>
          </div>

          {/* 导航菜单 */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-[15px] font-normal">{item.label}</span>
                  {activeTab === item.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 底部 */}
        <div className="absolute bottom-0 left-0 right-0 p-6" style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">升级会员</div>
              <div className="text-xs text-white/40">解锁完整功能</div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* 主内容区 */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[260px]' : 'ml-0'}`}>
        {/* 顶部栏 */}
        <header 
          className="sticky top-0 z-40 px-8 py-4"
          style={{ 
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(40px) saturate(180%)',
            borderBottom: '0.5px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <div className="w-full h-[1.5px] bg-white/60 rounded-full" />
                <div className="w-3/4 h-[1.5px] bg-white/60 rounded-full" />
                <div className="w-full h-[1.5px] bg-white/60 rounded-full" />
              </div>
            </button>

            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-full text-sm text-white/60" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="text-white">2025</span>
                <span className="mx-2 text-white/30">·</span>
                <span>乙巳年</span>
              </div>
              <button className="px-5 py-2 rounded-full text-sm font-medium text-white" style={{ background: 'rgba(255,255,255,0.1)' }}>
                登录
              </button>
            </div>
          </div>
        </header>

        {/* 内容 */}
        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-8"
              >
                {/* 欢迎 */}
                <div className="text-center py-8">
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[40px] font-semibold text-white mb-3 tracking-tight"
                  >
                    欢迎回来
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/50 text-lg"
                  >
                    洞察周期，把握机遇
                  </motion.p>
                </div>

                {/* 快速统计 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {quickStats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="group p-5 rounded-2xl transition-all duration-300 hover:bg-white/[0.05]"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${stat.color}`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="text-3xl font-semibold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-white/50">{stat.label}</div>
                        <div className="text-xs text-white/30 mt-1">{stat.sub}</div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* 核心功能 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {features.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        onClick={() => setActiveTab(feature.tab as TabType)}
                        className="group p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white/[0.05]"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-white/5">
                            <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                        </div>
                        <div className="text-xs text-white/40 tracking-wider uppercase mb-1">{feature.subtitle}</div>
                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-white/40 text-sm">{feature.desc}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* 为什么选择 ORACLE */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="py-8"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold text-white mb-2">为什么选择 ORACLE</h3>
                    <p className="text-white/50">融合千年智慧与现代科技</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {whyChoose.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          className="p-6 rounded-2xl text-center"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Icon className="w-6 h-6 text-white/70" strokeWidth={1.5} />
                          </div>
                          <h4 className="text-white font-medium mb-2">{item.title}</h4>
                          <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* 最新洞察 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="p-6 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold">最新洞察</h3>
                  </div>
                  <div className="space-y-3">
                    {insights.map((item, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-white/[0.03] cursor-pointer group"
                      >
                        <div>
                          <h4 className="text-white/90 mb-1 group-hover:text-white transition-colors">{item.title}</h4>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-white/40">{item.date}</span>
                            <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60">
                              {item.tag}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'market' && <MarketPulse />}
            {activeTab === 'matrix' && <WuXingMatrix />}
            {activeTab === 'whitepaper' && <WhitePaper />}
            {activeTab === 'cycles' && <CycleTools />}
            {activeTab === 'membership' && <Membership />}
            {activeTab === 'advisors' && <AIAdvisors />}
            {activeTab === 'bazi' && <BaZiPan />}
            {activeTab === 'guidance' && <DailyGuidance />}
            {activeTab === 'soulmate' && <SoulMate />}
            {activeTab === 'liuyao' && <LiuYao />}
            {activeTab === 'dream' && <DreamInterpreter />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
