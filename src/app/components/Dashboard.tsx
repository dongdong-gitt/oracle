'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Zap,
  Wallet,
  Target,
  MessageCircle,
  Globe,
  ChevronDown,
  Bell,
  Menu,
  X,
  BarChart3,
  Calendar,
  Clock,
  Sparkles,
  Shield,
  Download,
  Crown
} from 'lucide-react';
import LifeKLine from './LifeKLine';
import StrategyBoard from './StrategyBoard';
import OracleChat from './OracleChat';
import BirthInput from './BirthInput';

export type Language = 'zh' | 'en';

interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

export const translations: Translations = {
  welcome: {
    zh: '欢迎回来，交易者',
    en: 'Welcome back, Trader'
  },
  subtitle: {
    zh: '将命运数据化，把玄学变成阿尔法',
    en: 'Quantify destiny, turn metaphysics into alpha'
  },
  lifeChart: {
    zh: '人生行情',
    en: 'Life Chart'
  },
  strategy: {
    zh: '策略看板',
    en: 'Strategy Board'
  },
  oracle: {
    zh: '神谕顾问',
    en: 'Oracle Advisor'
  },
  currentLuck: {
    zh: '当前运势',
    en: 'Current Luck'
  },
  wealthLuck: {
    zh: '财运指数',
    en: 'Wealth Index'
  },
  careerLuck: {
    zh: '事业动能',
    en: 'Career Momentum'
  },
  loveLuck: {
    zh: '桃花信号',
    en: 'Love Signal'
  },
  healthLuck: {
    zh: '健康基线',
    en: 'Health Baseline'
  },
  strongBuy: {
    zh: '强力做多',
    en: 'STRONG BUY'
  },
  buy: {
    zh: '建议做多',
    en: 'BUY'
  },
  hold: {
    zh: '持仓观望',
    en: 'HOLD'
  },
  sell: {
    zh: '减仓防守',
    en: 'SELL'
  },
  strongSell: {
    zh: '清仓避险',
    en: 'STRONG SELL'
  },
  todayStrategy: {
    zh: '今日策略',
    en: "Today's Strategy"
  },
  askOracle: {
    zh: '询问神谕...',
    en: 'Ask Oracle...'
  },
  downloadApp: {
    zh: '下载 App',
    en: 'Download App'
  },
  upgrade: {
    zh: '升级 Pro',
    en: 'Upgrade Pro'
  },
  language: {
    zh: '语言',
    en: 'Language'
  }
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] || key;
}

export default function Dashboard() {
  const [lang, setLang] = useState<Language>('zh');
  const [hasData, setHasData] = useState(false);
  const [showBirthInput, setShowBirthInput] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState('1D');
  const [showChat, setShowChat] = useState(false);

  // Mock data for ticker
  const tickerData = [
    { label: t('wealthLuck', lang), value: '78.5', change: '+5.2%', up: true },
    { label: t('careerLuck', lang), value: '82.1', change: '+3.8%', up: true },
    { label: t('loveLuck', lang), value: '65.3', change: '-2.1%', up: false },
    { label: t('healthLuck', lang), value: '91.0', change: '+1.5%', up: true },
  ];

  const periods = ['1H', '4H', '1D', '1W', '1M', '1Y', 'ALL'];

  const handleBirthSubmit = () => {
    setHasData(true);
    setShowBirthInput(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white font-sans">
      {/* Top Navigation Bar - Trading Style */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#1e2329] border-b border-[#2b3139] z-50">
        <div className="h-full flex items-center justify-between px-4">
          {/* Left: Logo & Menu */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">ORACLE<span className="text-amber-500">-AI</span></span>
            </div>
          </div>

          {/* Center: Period Selector */}
          <div className="hidden md:flex items-center gap-1 bg-[#2b3139] rounded-lg p-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  activePeriod === p 
                    ? 'bg-[#0b0e11] text-amber-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b3139] hover:bg-[#3a4249] transition-colors text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'zh' ? '中文' : 'EN'}</span>
            </button>

            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm transition-colors">
              <Crown className="w-4 h-4" />
              {t('upgrade', lang)}
            </button>
          </div>
        </div>
      </header>

      {/* Ticker Bar - Stock Style */}
      <div className="fixed top-14 left-0 right-0 h-10 bg-[#0b0e11] border-b border-[#2b3139] z-40 overflow-hidden">
        <div className="h-full flex items-center gap-8 px-4 animate-marquee">
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-14 bottom-0 w-[280px] bg-[#1e2329] border-r border-[#2b3139] z-50 overflow-y-auto"
            >
              <div className="p-4">
                {/* User Profile */}
                <div className="p-4 rounded-xl bg-[#2b3139] mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold">
                      冬
                    </div>
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

                {/* Menu Items */}
                <nav className="space-y-1">
                  {[
                    { id: 'chart', label: t('lifeChart', lang), icon: BarChart3 },
                    { id: 'strategy', label: t('strategy', lang), icon: Target },
                    { id: 'oracle', label: t('oracle', lang), icon: MessageCircle },
                    { id: 'calendar', label: lang === 'zh' ? '黄历' : 'Almanac', icon: Calendar },
                    { id: 'settings', label: lang === 'zh' ? '设置' : 'Settings', icon: Activity },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-[#2b3139] hover:text-white transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Download App */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-amber-400">{t('downloadApp', lang)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    {lang === 'zh' ? '随时随地查看人生行情' : 'Check your life chart anytime'}
                  </p>
                  <button className="w-full py-2 rounded-lg bg-amber-500 text-black font-semibold text-sm">
                    iOS / Android
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-24 pb-20 px-4">
        {!hasData ? (
          <BirthInput onSubmit={handleBirthSubmit} lang={lang} />
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Welcome */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">{t('welcome', lang)}</h1>
              <p className="text-gray-400">{t('subtitle', lang)}</p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Life K-Line Chart (Takes 2 columns) */}
              <div className="lg:col-span-2 space-y-6">
                <LifeKLine lang={lang} period={activePeriod} />
                <StrategyBoard lang={lang} />
              </div>

              {/* Right: Oracle Chat & Quick Actions */}
              <div className="space-y-6">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {tickerData.slice(0, 4).map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#1e2329] border border-[#2b3139]">
                      <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                      <div className="text-xl font-mono font-bold text-white">{item.value}</div>
                      <div className={`text-xs font-mono ${item.up ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                        {item.up ? '↗' : '↘'} {item.change}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Today's Signal */}
                <div className="p-5 rounded-xl bg-[#1e2329] border border-[#2b3139]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">{t('todayStrategy', lang)}</span>
                    <span className="px-2 py-1 rounded bg-[#0ecb81]/20 text-[#0ecb81] text-xs font-bold">
                      {t('strongBuy', lang)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {lang === 'zh' 
                      ? '当前处于乙巳火运，财星透干。建议关注高波动机会，适合短线博弈。避免在午时（11-13点）做重大决策。'
                      : 'Currently in Yi-Si Fire Luck cycle with Wealth Star visible. Focus on high-volatility opportunities suitable for short-term trading. Avoid major decisions during Wu hour (11-13h).'
                    }
                  </p>
                </div>

                {/* Oracle Chat Preview */}
                <div className="p-5 rounded-xl bg-[#1e2329] border border-[#2b3139]">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold">{t('oracle', lang)}</span>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="p-3 rounded-lg bg-[#2b3139] text-sm text-gray-300">
                      {lang === 'zh' ? '今晚有个德扑高端局，能去吗？' : 'Should I join the poker game tonight?'}
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                      {lang === 'zh' 
                        ? '根据今晚戌时运势，偏财星旺，但需防冲动。建议：可以参加，但设置止损线，见好就收。'
                        : 'Based on Xu hour luck tonight,偏财星旺，but watch for impulsiveness. Advice: Join but set stop-loss and take profits early.'}
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowChat(true)}
                    className="w-full py-2.5 rounded-lg bg-[#2b3139] hover:bg-[#3a4249] text-gray-300 text-sm transition-colors"
                  >
                    {t('askOracle', lang)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/30 flex items-center justify-center transition-all z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <OracleChat onClose={() => setShowChat(false)} lang={lang} />
        )}
      </AnimatePresence>
    </div>
  );
}
