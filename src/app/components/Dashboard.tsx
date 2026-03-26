'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity,
  Target,
  MessageCircle,
  Globe,
  Bell,
  Menu,
  BarChart3,
  Calendar,
  Download,
  Crown,
  Coins,
  Heart,
  Moon,
  Sun,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Zap,
  Compass
} from 'lucide-react';
import LifeKLine from './LifeKLine';
import StrategyBoard from './StrategyBoard';
import OracleChat from './OracleChat';
import BirthInput from './BirthInput';
import BaZiPan from './BaZiPan';
import DailyGuidance from './DailyGuidance';
import SoulMate from './SoulMate';
import LiuYao from './LiuYao';
import DreamInterpreter from './DreamInterpreter';
import MarketPulse from './MarketPulse';
import WuXingMatrix from './WuXingMatrix';
import CycleTools from './CycleTools';
import WhitePaper from './WhitePaper';
import AIAdvisors from './AIAdvisors';
import Membership from './Membership';
import { useUser } from '../context/UserContext';

export type Language = 'zh' | 'en';

interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

export const translations: Translations = {
  welcome: { zh: '欢迎回来', en: 'Welcome back' },
  subtitle: { zh: '将命运量化，把玄学变成阿尔法', en: 'Quantify destiny, turn metaphysics into alpha' },
  lifeChart: { zh: '人生行情', en: 'Life Chart' },
  strategy: { zh: '策略', en: 'Strategy' },
  oracle: { zh: '神谕', en: 'Oracle' },
  currentLuck: { zh: '当前运势', en: 'Current Luck' },
  wealthLuck: { zh: '财运', en: 'Wealth' },
  careerLuck: { zh: '事业', en: 'Career' },
  loveLuck: { zh: '桃花', en: 'Love' },
  healthLuck: { zh: '健康', en: 'Health' },
  strongBuy: { zh: '强力做多', en: 'STRONG BUY' },
  todayStrategy: { zh: '今日策略', en: "Today's Strategy" },
  askOracle: { zh: '询问神谕...', en: 'Ask Oracle...' },
  downloadApp: { zh: '下载 App', en: 'Download App' },
  upgrade: { zh: '升级 Pro', en: 'Upgrade Pro' },
  language: { zh: '语言', en: 'Language' },
  bazi: { zh: '八字', en: 'BaZi' },
  guidance: { zh: '日运', en: 'Daily' },
  soulmate: { zh: '姻缘', en: 'Love' },
  liuyao: { zh: '六爻', en: 'I-Ching' },
  dream: { zh: '解梦', en: 'Dream' },
  market: { zh: '市场', en: 'Market' },
  matrix: { zh: '五行', en: 'Elements' },
  cycles: { zh: '周期', en: 'Cycles' },
  whitepaper: { zh: '研报', en: 'Research' },
  advisors: { zh: '顾问', en: 'Advisors' },
  membership: { zh: '会员', en: 'Pro' },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] || key;
}

type TabType = 'dashboard' | 'bazi' | 'guidance' | 'soulmate' | 'liuyao' | 'dream' | 'market' | 'matrix' | 'cycles' | 'whitepaper' | 'advisors' | 'membership';

export default function Dashboard() {
  const { hasData: userHasData, birthData, baziResult } = useUser();
  const [lang, setLang] = useState<Language>('zh');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activePeriod, setActivePeriod] = useState('1D');
  const [showChat, setShowChat] = useState(false);
  
  const hasData = userHasData;

  const tickerData = [
    { label: t('wealthLuck', lang), value: '78.5', change: '+5.2%', up: true, color: 'text-neon-blue' },
    { label: t('careerLuck', lang), value: '82.1', change: '+3.8%', up: true, color: 'text-neon-purple' },
    { label: t('loveLuck', lang), value: '65.3', change: '-2.1%', up: false, color: 'text-neon-pink' },
    { label: t('healthLuck', lang), value: '91.0', change: '+1.5%', up: true, color: 'text-neon-cyan' },
  ];

  const periods = ['1D', '1M', '1Y', '10Y', 'ALL'];

  const menuItems = [
    { id: 'dashboard', label: t('lifeChart', lang), icon: BarChart3, color: 'from-neon-blue to-neon-purple' },
    { id: 'bazi', label: t('bazi', lang), icon: Calendar, color: 'from-amber-400 to-orange-500' },
    { id: 'guidance', label: t('guidance', lang), icon: Sun, color: 'from-yellow-300 to-amber-400' },
    { id: 'soulmate', label: t('soulmate', lang), icon: Heart, color: 'from-neon-pink to-rose-500' },
    { id: 'liuyao', label: t('liuyao', lang), icon: Coins, color: 'from-neon-purple to-violet-600' },
    { id: 'dream', label: t('dream', lang), icon: Moon, color: 'from-indigo-400 to-blue-500' },
    { id: 'market', label: t('market', lang), icon: TrendingUp, color: 'from-neon-cyan to-blue-500' },
    { id: 'matrix', label: t('matrix', lang), icon: Target, color: 'from-emerald-400 to-teal-500' },
    { id: 'cycles', label: t('cycles', lang), icon: Activity, color: 'from-violet-400 to-purple-500' },
    { id: 'whitepaper', label: t('whitepaper', lang), icon: BookOpen, color: 'from-orange-400 to-red-500' },
    { id: 'advisors', label: t('advisors', lang), icon: MessageCircle, color: 'from-neon-blue to-cyan-400' },
    { id: 'membership', label: t('membership', lang), icon: Crown, color: 'from-amber-300 to-yellow-500' },
  ];

  const quickTools = [
    { id: 'bazi', title: t('bazi', lang), subtitle: 'BAZI', icon: Calendar, gradient: 'from-amber-400 to-orange-500', desc: '四柱命盘分析' },
    { id: 'guidance', title: t('guidance', lang), subtitle: 'DAILY', icon: Sun, gradient: 'from-yellow-300 to-amber-400', desc: '今日运势指引' },
    { id: 'soulmate', title: t('soulmate', lang), subtitle: 'LOVE', icon: Heart, gradient: 'from-neon-pink to-rose-500', desc: 'AI缘分分析' },
    { id: 'liuyao', title: t('liuyao', lang), subtitle: 'I-CHING', icon: Coins, gradient: 'from-neon-purple to-violet-600', desc: '六爻奇门遁甲' },
    { id: 'dream', title: t('dream', lang), subtitle: 'DREAM', icon: Moon, gradient: 'from-indigo-400 to-blue-500', desc: '潜意识解读' },
    { id: 'market', title: t('market', lang), subtitle: 'MARKET', icon: TrendingUp, gradient: 'from-neon-cyan to-blue-500', desc: '投资周期分析' },
  ];

  if (!hasData) {
    return <BirthInput onSubmit={() => setLocalHasData(true)} lang={lang} />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans star-field">
      {/* Top Navigation - Co-Star Style */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Menu className="w-5 h-5 text-white/60" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">ORACLE</span>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activePeriod === p 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm">
              <Globe className="w-4 h-4" />
              <span>{lang === 'zh' ? '中文' : 'EN'}</span>
            </button>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Ticker Bar - Neon Style */}
      <div className="fixed top-16 left-0 right-0 h-10 bg-black/60 backdrop-blur-md border-b border-white/5 z-40 overflow-hidden">
        <div className="h-full flex items-center gap-8 px-6">
          {tickerData.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm whitespace-nowrap">
              <span className="text-white/40">{item.label}</span>
              <span className={`font-mono font-bold ${item.color}`}>{item.value}</span>
              <span className={`font-mono text-xs ${item.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.up ? '↑' : '↓'} {item.change}
              </span>
            </div>
          ))}
          <div className="w-px h-3 bg-white/10"></div>
          <span className="text-white/30 text-sm">{t('currentLuck', lang)}: <span className="text-neon-blue font-bold">BULLISH</span></span>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-16 bottom-0 w-[280px] bg-black/95 backdrop-blur-xl border-r border-white/5 z-50 overflow-y-auto">
              <div className="p-5">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-lg font-bold">冬</div>
                    <div>
                      <div className="font-semibold">王冬</div>
                      <div className="text-xs text-white/40">Pro Member</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">生命净值</span>
                    <span className="font-mono text-neon-blue">88.5</span>
                  </div>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id as TabType); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeTab === item.id 
                            ? 'bg-white/10 text-white' 
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                        {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto text-white/40" />}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-5 h-5 text-neon-blue" />
                    <span className="font-semibold text-neon-blue">{t('downloadApp', lang)}</span>
                  </div>
                  <button className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm">iOS / Android</button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-28 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                {/* Header */}
                <div className="text-center py-4">
                  <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-2">
                    <span className="gradient-text">{t('welcome', lang)}</span>
                  </motion.h1>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/40">
                    {t('subtitle', lang)}
                  </motion.p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: K-Line & Strategy */}
                  <div className="lg:col-span-2 space-y-6">
                    <LifeKLine lang={lang} period={activePeriod} />
                    <StrategyBoard lang={lang} />
                  </div>

                  {/* Right: Quick Tools */}
                  <div className="space-y-6">
                    {/* Quick Tools Grid */}
                    <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-neon-blue" />
                        <span className="font-semibold">{lang === 'zh' ? '快速工具' : 'Quick Tools'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {quickTools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <button
                              key={tool.id}
                              onClick={() => setActiveTab(tool.id as TabType)}
                              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-left group border border-white/5 hover:border-white/10"
                            >
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{tool.subtitle}</div>
                              <div className="font-semibold text-sm mb-1">{tool.title}</div>
                              <div className="text-xs text-white/30">{tool.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Today's Signal */}
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/50 text-sm">{t('todayStrategy', lang)}</span>
                        <span className="px-3 py-1 rounded-full bg-neon-blue/20 text-neon-blue text-xs font-bold border border-neon-blue/30">
                          {t('strongBuy', lang)}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {lang === 'zh' 
                          ? '乙巳火运，财星透干。关注高波动机会，适合短线博弈。'
                          : 'Yi-Si Fire cycle, Wealth Star visible. Focus on high-volatility opportunities.'
                        }
                      </p>
                      <div className="mt-4 flex gap-2">
                        <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-white/40">Crypto</span>
                        <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-white/40">AI</span>
                        <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-white/40">新能源</span>
                      </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-3">
                      {tickerData.slice(0, 4).map((item, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                          <div className="text-xs text-white/30 mb-1">{item.label}</div>
                          <div className={`text-2xl font-mono font-bold ${item.color}`}>{item.value}</div>
                          <div className={`text-xs font-mono ${item.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.up ? '+' : ''}{item.change}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* OTHER TABS */}
            {activeTab === 'bazi' && (
              <motion.div key="bazi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {birthData && baziResult ? (
                  <BaZiPan data={baziResult} birthData={birthData} />
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    请先输入生辰信息
                  </div>
                )}
              </motion.div>
            )}
            {activeTab === 'guidance' && <motion.div key="guidance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><DailyGuidance /></motion.div>}
            {activeTab === 'soulmate' && <motion.div key="soulmate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SoulMate /></motion.div>}
            {activeTab === 'liuyao' && <motion.div key="liuyao" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LiuYao /></motion.div>}
            {activeTab === 'dream' && <motion.div key="dream" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><DreamInterpreter /></motion.div>}
            {activeTab === 'market' && <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MarketPulse /></motion.div>}
            {activeTab === 'matrix' && <motion.div key="matrix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><WuXingMatrix /></motion.div>}
            {activeTab === 'cycles' && <motion.div key="cycles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CycleTools /></motion.div>}
            {activeTab === 'whitepaper' && <motion.div key="whitepaper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><WhitePaper /></motion.div>}
            {activeTab === 'advisors' && <motion.div key="advisors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AIAdvisors /></motion.div>}
            {activeTab === 'membership' && <motion.div key="membership" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Membership /></motion.div>}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Chat Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowChat(!showChat)} 
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/30 flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && <OracleChat onClose={() => setShowChat(false)} lang={lang} />}
      </AnimatePresence>
    </div>
  );
}
