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
  Sparkles,
  Download,
  Crown,
  Coins,
  Heart,
  Moon,
  Sun,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Zap
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

export type Language = 'zh' | 'en';

interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

export const translations: Translations = {
  welcome: { zh: '欢迎回来，交易者', en: 'Welcome back, Trader' },
  subtitle: { zh: '将命运数据化，把玄学变成阿尔法', en: 'Quantify destiny, turn metaphysics into alpha' },
  lifeChart: { zh: '人生行情', en: 'Life Chart' },
  strategy: { zh: '策略看板', en: 'Strategy Board' },
  oracle: { zh: '神谕顾问', en: 'Oracle Advisor' },
  currentLuck: { zh: '当前运势', en: 'Current Luck' },
  wealthLuck: { zh: '财运指数', en: 'Wealth Index' },
  careerLuck: { zh: '事业动能', en: 'Career Momentum' },
  loveLuck: { zh: '桃花信号', en: 'Love Signal' },
  healthLuck: { zh: '健康基线', en: 'Health Baseline' },
  strongBuy: { zh: '强力做多', en: 'STRONG BUY' },
  todayStrategy: { zh: '今日策略', en: "Today's Strategy" },
  askOracle: { zh: '询问神谕...', en: 'Ask Oracle...' },
  downloadApp: { zh: '下载 App', en: 'Download App' },
  upgrade: { zh: '升级 Pro', en: 'Upgrade Pro' },
  language: { zh: '语言', en: 'Language' },
  bazi: { zh: '八字排盘', en: 'BaZi Chart' },
  guidance: { zh: '每日指引', en: 'Daily Guidance' },
  soulmate: { zh: '灵魂伴侣', en: 'Soul Mate' },
  liuyao: { zh: '六爻奇门', en: 'LiuYao & QiMen' },
  dream: { zh: '解梦·阿梦', en: 'Dream AI' },
  market: { zh: '市场脉动', en: 'Market Pulse' },
  matrix: { zh: '五行矩阵', en: 'Five Elements' },
  cycles: { zh: '周期工具', en: 'Cycle Tools' },
  whitepaper: { zh: '投资白皮书', en: 'Whitepaper' },
  advisors: { zh: 'AI顾问', en: 'AI Advisors' },
  membership: { zh: '会员', en: 'Membership' },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] || key;
}

type TabType = 'dashboard' | 'bazi' | 'guidance' | 'soulmate' | 'liuyao' | 'dream' | 'market' | 'matrix' | 'cycles' | 'whitepaper' | 'advisors' | 'membership';

export default function Dashboard() {
  const [lang, setLang] = useState<Language>('zh');
  const [hasData, setHasData] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activePeriod, setActivePeriod] = useState('1D');
  const [showChat, setShowChat] = useState(false);

  const tickerData = [
    { label: t('wealthLuck', lang), value: '78.5', change: '+5.2%', up: true },
    { label: t('careerLuck', lang), value: '82.1', change: '+3.8%', up: true },
    { label: t('loveLuck', lang), value: '65.3', change: '-2.1%', up: false },
    { label: t('healthLuck', lang), value: '91.0', change: '+1.5%', up: true },
  ];

  const periods = ['1H', '4H', '1D', '1W', '1M', '1Y', 'ALL'];

  const menuItems = [
    { id: 'dashboard', label: t('lifeChart', lang), icon: BarChart3 },
    { id: 'bazi', label: t('bazi', lang), icon: Calendar },
    { id: 'guidance', label: t('guidance', lang), icon: Sun },
    { id: 'soulmate', label: t('soulmate', lang), icon: Heart },
    { id: 'liuyao', label: t('liuyao', lang), icon: Coins },
    { id: 'dream', label: t('dream', lang), icon: Moon },
    { id: 'market', label: t('market', lang), icon: TrendingUp },
    { id: 'matrix', label: t('matrix', lang), icon: Target },
    { id: 'cycles', label: t('cycles', lang), icon: Activity },
    { id: 'whitepaper', label: t('whitepaper', lang), icon: BookOpen },
    { id: 'advisors', label: t('advisors', lang), icon: MessageCircle },
    { id: 'membership', label: t('membership', lang), icon: Crown },
  ];

  const quickTools = [
    { id: 'bazi', title: t('bazi', lang), subtitle: 'BAZI', icon: Calendar, color: 'from-amber-500 to-orange-600' },
    { id: 'guidance', title: t('guidance', lang), subtitle: 'DAILY', icon: Sun, color: 'from-yellow-400 to-amber-500' },
    { id: 'soulmate', title: t('soulmate', lang), subtitle: 'LOVE', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { id: 'liuyao', title: t('liuyao', lang), subtitle: 'I-CHING', icon: Coins, color: 'from-purple-500 to-violet-600' },
    { id: 'dream', title: t('dream', lang), subtitle: 'DREAM', icon: Moon, color: 'from-indigo-500 to-blue-600' },
    { id: 'market', title: t('market', lang), subtitle: 'MARKET', icon: TrendingUp, color: 'from-cyan-500 to-blue-500' },
  ];

  if (!hasData) {
    return <BirthInput onSubmit={() => setHasData(true)} lang={lang} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white font-sans">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#1e2329] border-b border-[#2b3139] z-50">
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg">
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">ORACLE<span className="text-amber-500">-AI</span></span>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="hidden md:flex items-center gap-1 bg-[#2b3139] rounded-lg p-1">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    activePeriod === p ? 'bg-[#0b0e11] text-amber-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b3139] hover:bg-[#3a4249] text-sm">
              <Globe className="w-4 h-4" />
              <span>{lang === 'zh' ? '中文' : 'EN'}</span>
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm">
              <Crown className="w-4 h-4" />
              {t('upgrade', lang)}
            </button>
          </div>
        </div>
      </header>

      {/* Ticker Bar */}
      <div className="fixed top-14 left-0 right-0 h-10 bg-[#0b0e11] border-b border-[#2b3139] z-40 overflow-hidden">
        <div className="h-full flex items-center gap-8 px-4">
          {tickerData.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm whitespace-nowrap">
              <span className="text-gray-400">{item.label}</span>
              <span className="font-mono font-bold text-white">{item.value}</span>
              <span className={`font-mono ${item.up ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                {item.up ? '+' : ''}{item.change}
              </span>
            </div>
          ))}
          <div className="w-px h-4 bg-[#2b3139]"></div>
          <span className="text-gray-500 text-sm">{t('currentLuck', lang)}: <span className="text-amber-400 font-bold">BULLISH</span></span>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="fixed left-0 top-14 bottom-0 w-[280px] bg-[#1e2329] border-r border-[#2b3139] z-50 overflow-y-auto">
              <div className="p-4">
                <div className="p-4 rounded-xl bg-[#2b3139] mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold">冬</div>
                    <div>
                      <div className="font-semibold">王冬</div>
                      <div className="text-xs text-gray-400">Pro Member</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">账户净值</span>
                    <span className="font-mono text-amber-400">88.5</span>
                  </div>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id as TabType); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          activeTab === item.id ? 'bg-amber-500/20 text-amber-400' : 'text-gray-300 hover:bg-[#2b3139]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-amber-400">{t('downloadApp', lang)}</span>
                  </div>
                  <button className="w-full py-2 rounded-lg bg-amber-500 text-black font-semibold text-sm">iOS / Android</button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {/* DASHBOARD - Trading Style Home */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Welcome */}
                <div>
                  <h1 className="text-2xl font-bold mb-1">{t('welcome', lang)}</h1>
                  <p className="text-gray-400">{t('subtitle', lang)}</p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: K-Line & Strategy */}
                  <div className="lg:col-span-2 space-y-6">
                    <LifeKLine lang={lang} period={activePeriod} />
                    <StrategyBoard lang={lang} />
                  </div>

                  {/* Right: Stats & Tools */}
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      {tickerData.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-[#1e2329] border border-[#2b3139]">
                          <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                          <div className="text-xl font-mono font-bold">{item.value}</div>
                          <div className={`text-xs font-mono ${item.up ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                            {item.up ? '↗' : '↘'} {item.change}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Tools Grid */}
                    <div className="p-5 rounded-xl bg-[#1e2329] border border-[#2b3139]">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <span className="font-semibold">{lang === 'zh' ? '快速工具' : 'Quick Tools'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {quickTools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <button
                              key={tool.id}
                              onClick={() => setActiveTab(tool.id as TabType)}
                              className="p-4 rounded-xl bg-[#2b3139] hover:bg-[#3a4249] transition-colors text-left group"
                            >
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-xs text-gray-400 mb-1">{tool.subtitle}</div>
                              <div className="font-medium text-sm">{tool.title}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Today's Signal */}
                    <div className="p-5 rounded-xl bg-[#1e2329] border border-[#2b3139]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">{t('todayStrategy', lang)}</span>
                        <span className="px-2 py-1 rounded bg-[#0ecb81]/20 text-[#0ecb81] text-xs font-bold">{t('strongBuy', lang)}</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {lang === 'zh' 
                          ? '当前处于乙巳火运，财星透干。建议关注高波动机会，适合短线博弈。'
                          : 'Currently in Yi-Si Fire Luck cycle with Wealth Star visible. Focus on high-volatility opportunities.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* OTHER TABS */}
            {activeTab === 'bazi' && <motion.div key="bazi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><BaZiPan /></motion.div>}
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
      <button onClick={() => setShowChat(!showChat)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-black shadow-lg flex items-center justify-center z-50">
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && <OracleChat onClose={() => setShowChat(false)} lang={lang} />}
      </AnimatePresence>
    </div>
  );
}
