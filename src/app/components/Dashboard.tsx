'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Target, MessageCircle, Globe, Bell, Menu, BarChart3, Calendar,
  Download, Crown, Coins, Heart, Moon, Sun, ChevronRight, TrendingUp,
  BookOpen, Zap, Compass, Shield, AlertTriangle, ArrowUpRight, Clock,
  Wallet, Briefcase, Sparkles, Send, LogOut
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
import MarketModule from './MarketModule';
import AIAdvisors from './AIAdvisors';
import Membership from './Membership';
import { useUser } from '../context/UserContext';

export type Language = 'zh' | 'en';

interface Translations {
  [key: string]: { zh: string; en: string };
}

export const translations: Translations = {
  welcome: { zh: '欢迎回来', en: 'Welcome back' },
  subtitle: { zh: '将命运量化，把玄学变成阿尔法', en: 'Quantify destiny, turn metaphysics into alpha' },
  askOracle: { zh: '询问先知...', en: 'Ask the Oracle...' },
  decisionCenter: { zh: '决策中心', en: 'Decision Center' },
  energyScan: { zh: '能量扫描', en: 'Energy Scan' },
  assetGuard: { zh: '资产守护', en: 'Asset Guard' },
  humanAssets: { zh: '个人能量中枢', en: 'Human Assets' },
  strategicEngine: { zh: '商业战略分析', en: 'Strategic Engine' },
  financialRadar: { zh: '金融周期雷达', en: 'Financial Radar' },
  lifeNetWorth: { zh: '生命净值', en: 'Life Net Worth' },
  tenGodsRadar: { zh: '十神状态', en: 'Ten Gods Radar' },
  disasterWarning: { zh: '避灾预警', en: 'Disaster Warning' },
  projectStressTest: { zh: '项目压测', en: 'Project Stress Test' },
  instantDecision: { zh: '即时决策', en: 'Instant Decision' },
  assetAllocation: { zh: '资产五行占比', en: 'Asset Allocation' },
  tradingClock: { zh: '交易择时', en: 'Trading Clock' },
  expansionPhase: { zh: '扩张期 - 宜进取', en: 'Expansion' },
  consolidationPhase: { zh: '守成期 - 忌借贷', en: 'Consolidation' },
  recoveryPhase: { zh: '战损期 - 建议归隐', en: 'Recovery' },
  bazi: { zh: '八字', en: 'BaZi' },
  guidance: { zh: '日运', en: 'Daily' },
  soulmate: { zh: '姻缘', en: 'Love' },
  liuyao: { zh: '六爻', en: 'I-Ching' },
  dream: { zh: '解梦', en: 'Dream' },
  market: { zh: '市场', en: 'Market' },
  matrix: { zh: '五行', en: 'Elements' },
  cycles: { zh: '周期', en: 'Cycles' },

  advisors: { zh: '顾问', en: 'Advisors' },
  membership: { zh: '会员', en: 'Pro' },
  downloadApp: { zh: '下载 App', en: 'Download App' },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] || key;
}

type TabType = 'dashboard' | 'bazi' | 'guidance' | 'soulmate' | 'liuyao' | 'dream' | 'market' | 'market-sh' | 'market-nasdaq' | 'market-btc' | 'market-gold' | 'matrix' | 'cycles' | 'advisors' | 'membership';
type StatusPhase = 'expansion' | 'consolidation' | 'recovery';

// 能量环组件
function EnergyRing({ score, size = 180 }: { score: number; size?: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 12);
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#00D4FF' : score >= 60 ? '#B829F7' : score >= 40 ? '#FF2D92' : '#FF4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={size/2-12} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={size/2-12} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000"
          style={{ filter: `drop-shadow(0 0 15px ${color})` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-white/40 mt-1">综合分</span>
      </div>
    </div>
  );
}

// 实时周期流
function CycleTicker({ lang }: { lang: Language }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const items = [
    { label: 'BTC/USD', value: '+2.3%', up: true },
    { label: lang === 'zh' ? '离火九运' : 'LiHuo', value: '12.5%', up: true },
    { label: lang === 'zh' ? '今日干支' : 'Ganzhi', value: '戊申', up: true },
    { label: lang === 'zh' ? '恐慌指数' : 'Fear', value: '34', up: false },
    { label: lang === 'zh' ? '当前时辰' : 'Time', value: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), up: true },
  ];

  return (
    <div className="fixed top-16 left-0 right-0 h-10 bg-[#0D0D0D]/95 backdrop-blur-xl border-b border-white/5 z-40 overflow-hidden">
      <motion.div className="flex items-center gap-8 px-6 h-full" animate={{ x: [0, -400] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-white/30 text-xs">{item.label}</span>
            <span className={`font-mono font-bold text-sm ${item.up ? 'text-emerald-400' : 'text-rose-400'}`}>{item.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// 状态标签
function StatusBadge({ phase, lang }: { phase: StatusPhase; lang: Language }) {
  const configs = {
    expansion: { text: t('expansionPhase', lang), bg: 'bg-amber-500/20', border: 'border-amber-500/50', textColor: 'text-amber-400', icon: ArrowUpRight },
    consolidation: { text: t('consolidationPhase', lang), bg: 'bg-slate-500/20', border: 'border-slate-500/50', textColor: 'text-slate-300', icon: Shield },
    recovery: { text: t('recoveryPhase', lang), bg: 'bg-rose-500/20', border: 'border-rose-500/50', textColor: 'text-rose-400', icon: AlertTriangle },
  };
  const config = configs[phase];
  const Icon = config.icon;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}>
      <Icon className={`w-4 h-4 ${config.textColor}`} />
      <span className={`text-xs font-medium ${config.textColor}`}>{config.text}</span>
    </div>
  );
}

// 十神雷达图
const tenGodsData = [
  { name: '比肩', value: 75 }, { name: '劫财', value: 45 },
  { name: '食神', value: 82 }, { name: '伤官', value: 68 },
  { name: '偏财', value: 55 }, { name: '正财', value: 78 },
  { name: '七杀', value: 35 }, { name: '正官', value: 70 },
];

function SimpleRadarChart() {
  const center = 60, radius = 45, angleStep = (2 * Math.PI) / 8;
  const points = tenGodsData.map((item, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (item.value / 100) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <svg width="120" height="120" className="mx-auto">
      {[20, 40, 60, 80, 100].map((l) => <circle key={l} cx={center} cy={center} r={(l/100)*radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
      <polygon points={points} fill="rgba(0,212,255,0.15)" stroke="#00D4FF" strokeWidth="2" />
      {tenGodsData.map((item, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (item.value / 100) * radius;
        return <circle key={i} cx={center + r * Math.cos(angle)} cy={center + r * Math.sin(angle)} r="3" fill="#00D4FF" />;
      })}
    </svg>
  );
}

// 底部 AI 输入框
function AskOracleInput({ lang, onAsk }: { lang: Language; onAsk: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (query.trim()) { onAsk(query); setQuery(''); } };

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D] to-transparent z-50">
      <div className="max-w-3xl mx-auto relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white/30 pointer-events-none">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm">{t('askOracle', lang)}</span>
        </div>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-36 pr-14 py-4 bg-[#1A1B1E] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-blue/50 transition-colors" />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl text-white hover:opacity-90 transition-opacity">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}

export default function Dashboard() {
  const { hasData: userHasData, birthData, baziResult, clearData } = useUser();
  const [lang, setLang] = useState<Language>('zh');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activePeriod, setActivePeriod] = useState('1D');
  const [showChat, setShowChat] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [statusPhase] = useState<StatusPhase>('expansion');
  
  const hasData = userHasData;
  const periods = ['1D', '1M', '1Y', '10Y', 'ALL'];

  // 侧边栏菜单 - 按分类组织
  const menuGroups = [
    {
      title: t('decisionCenter', lang),
      icon: BarChart3,
      color: 'from-neon-blue to-neon-purple',
      items: [
        { id: 'dashboard', label: lang === 'zh' ? '人生行情' : 'Life Chart', icon: TrendingUp },
        { id: 'guidance', label: t('guidance', lang), icon: Sun },
        { id: 'cycles', label: t('cycles', lang), icon: Activity },
      ]
    },
    {
      title: t('energyScan', lang),
      icon: Zap,
      color: 'from-amber-400 to-orange-500',
      items: [
        { id: 'bazi', label: t('bazi', lang), icon: Calendar },
        { id: 'matrix', label: t('matrix', lang), icon: Target },
        { id: 'liuyao', label: t('liuyao', lang), icon: Coins },
        { id: 'soulmate', label: t('soulmate', lang), icon: Heart },
        { id: 'dream', label: lang === 'zh' ? '解梦' : 'Dream', icon: Moon },
      ]
    },
    {
      title: t('assetGuard', lang),
      icon: Wallet,
      color: 'from-neon-cyan to-blue-500',
      items: [
        { id: 'market', label: t('market', lang), icon: TrendingUp },
        { id: 'market-sh', label: lang === 'zh' ? '上证指数' : 'SSE', icon: TrendingUp },
        { id: 'market-nasdaq', label: lang === 'zh' ? '纳斯达克' : 'NASDAQ', icon: TrendingUp },
        { id: 'market-btc', label: lang === 'zh' ? '比特币' : 'Bitcoin', icon: TrendingUp },
        { id: 'market-gold', label: lang === 'zh' ? '黄金' : 'Gold', icon: TrendingUp },
        { id: 'advisors', label: t('advisors', lang), icon: MessageCircle },
        { id: 'membership', label: t('membership', lang), icon: Crown },
      ]
    },
  ];

  const handleAskOracle = (query: string) => { setChatQuery(query); setShowChat(true); };

  if (!hasData) return <BirthInput onSubmit={() => {}} lang={lang} />;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5 z-50">
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
                <button key={p} onClick={() => setActivePeriod(p)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activePeriod === p ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <StatusBadge phase={statusPhase} lang={lang} />
            <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm">
              <Globe className="w-4 h-4" />
              <span>{lang === 'zh' ? '中文' : 'EN'}</span>
            </button>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full"></span>
            </button>
            <button 
              onClick={clearData}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-sm"
              title={lang === 'zh' ? '退出登录' : 'Logout'}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'zh' ? '退出' : 'Exit'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <CycleTicker lang={lang} />

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-16 bottom-0 w-[280px] bg-[#0D0D0D]/95 backdrop-blur-xl border-r border-white/5 z-50 overflow-y-auto">
              <div className="p-5">
                <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-white/5 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-lg font-bold">冬</div>
                    <div>
                      <div className="font-semibold">王冬</div>
                      <div className="text-xs text-white/40">庚金日主 · 伤官格</div>
                    </div>
                  </div>
                  
                  {/* 今日运势评分 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/40">今日运势</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i <= 4 ? 'bg-amber-400' : 'bg-white/20'}`} />
                          ))}
                        </div>
                        <span className="font-mono text-amber-400">4.2</span>
                      </div>
                    </div>
                    
                    {/* 五行能量条 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/30 w-8">金</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-[18%] h-full bg-amber-400 rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/30 w-8">木</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-[24%] h-full bg-green-400 rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/30 w-8">水</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-[24%] h-full bg-blue-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">喜用神</span>
                        <span className="text-amber-400">土、金</span>
                      </div>
                    </div>
                  </div>
                </div>

                <nav className="space-y-4">
                  {menuGroups.map((group) => {
                    const GroupIcon = group.icon;
                    const isGroupActive = group.items.some(item => item.id === activeTab);
                    return (
                      <div key={group.title} className="space-y-1">
                        {/* 分类标题 */}
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isGroupActive ? 'bg-white/5' : ''}`}>
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center`}>
                            <GroupIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-sm text-white/80">{group.title}</span>
                        </div>
                        {/* 子菜单 */}
                        <div className="pl-4 space-y-0.5">
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as TabType); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${
                                  activeTab === item.id
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <ItemIcon className="w-4 h-4" />
                                <span>{item.label}</span>
                                {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto text-white/40" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
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
      <main className="pt-28 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                {/* Header with Energy Ring */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
                  <div>
                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-2">
                      <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">{t('welcome', lang)}</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/40">
                      {t('subtitle', lang)}
                    </motion.p>
                  </div>
                  <EnergyRing score={78} size={140} />
                </div>

                {/* 三位一体核心区 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 个人能量中枢 */}
                  <div className="p-6 rounded-3xl bg-[#1A1B1E] border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-neon-blue" />
                      <span className="font-semibold">{t('humanAssets', lang)}</span>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-xs text-white/40 mb-2">{t('lifeNetWorth', lang)} (7D)</div>
                      <div className="h-20 flex items-end gap-1">
                        {[65, 72, 68, 75, 82, 78, 88].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-neon-blue/50 to-neon-blue rounded-t transition-all hover:opacity-80" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-white/40 mb-2">{t('tenGodsRadar', lang)}</div>
                      <SimpleRadarChart />
                    </div>

                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <div className="flex items-center gap-2 text-rose-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>今日劫财，午后三点禁大额交易</span>
                      </div>
                    </div>
                  </div>

                  {/* 商业战略分析 */}
                  <div className="p-6 rounded-3xl bg-[#1A1B1E] border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5 text-neon-purple" />
                      <span className="font-semibold">{t('strategicEngine', lang)}</span>
                    </div>

                    <div className="mb-6">
                      <div className="text-xs text-white/40 mb-3">{t('projectStressTest', lang)}</div>
                      <div className="relative h-32">
                        <svg viewBox="0 0 200 100" className="w-full h-full">
                          <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
                          <path d="M 10 100 A 90 90 0 0 1 145 25" fill="none" stroke="url(#grad1)" strokeWidth="20" />
                          <defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#B829F7" /><stop offset="100%" stopColor="#00D4FF" /></linearGradient></defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-neon-purple">72%</span>
                          <span className="text-xs text-white/40">天时契合度</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-neon-purple/10 to-neon-blue/10 border border-neon-purple/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-neon-purple" />
                        <span className="text-sm font-medium text-neon-purple">{t('instantDecision', lang)}</span>
                      </div>
                      <p className="text-sm text-white/60">周期利空，建议回流现金。关注AI与新能源板块，避免午后交易。</p>
                    </div>
                  </div>

                  {/* 金融周期雷达 */}
                  <div className="p-6 rounded-3xl bg-[#1A1B1E] border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-neon-cyan" />
                      <span className="font-semibold">{t('financialRadar', lang)}</span>
                    </div>

                    <div className="mb-6">
                      <div className="text-xs text-white/40 mb-3">{t('assetAllocation', lang)}</div>
                      <div className="relative w-32 h-32 mx-auto">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          <circle cx="50" cy="50" r="35" fill="none" stroke="#00D4FF" strokeWidth="18" strokeDasharray="220" strokeDashoffset="55" />
                          <circle cx="50" cy="50" r="35" fill="none" stroke="#B829F7" strokeWidth="18" strokeDasharray="0 55 165" strokeDashoffset="165" />
                          <circle cx="50" cy="50" r="35" fill="none" stroke="#FF2D92" strokeWidth="18" strokeDasharray="0 22 198" strokeDashoffset="198" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-lg font-bold">水重</span>
                            <span className="block text-xs text-white/40">75%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-4 mt-3 text-xs">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-blue"></span>水 75%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-purple"></span>火 15%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-pink"></span>金 10%</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-neon-cyan/10 to-neon-blue/10 border border-neon-cyan/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-neon-cyan" />
                        <span className="text-sm font-medium text-neon-cyan">{t('tradingClock', lang)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-xs text-white/40">进场</div>
                          <div className="text-lg font-bold text-emerald-400">09:30</div>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-center">
                          <div className="text-xs text-white/40">撤退</div>
                          <div className="text-lg font-bold text-rose-400">14:30</div>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-center">
                          <div className="text-xs text-white/40">空仓</div>
                          <div className="text-lg font-bold text-amber-400">全天</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Life K-Line & Strategy */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <LifeKLine lang={lang} period={activePeriod} />
                  <StrategyBoard lang={lang} />
                </div>
              </motion.div>
            )}

            {activeTab === 'bazi' && <motion.div key="bazi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{birthData && baziResult ? <BaZiPan data={baziResult} birthData={birthData} /> : <div className="flex items-center justify-center h-96 text-gray-500">请先输入生辰信息</div>}</motion.div>}
            {activeTab === 'guidance' && <motion.div key="guidance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><DailyGuidance /></motion.div>}
            {activeTab === 'soulmate' && <motion.div key="soulmate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SoulMate /></motion.div>}
            {activeTab === 'liuyao' && <motion.div key="liuyao" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LiuYao /></motion.div>}
            {activeTab === 'dream' && <motion.div key="dream" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><DreamInterpreter /></motion.div>}
            {activeTab === 'market' && <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MarketPulse /></motion.div>}
            {activeTab === 'market-sh' && <motion.div key="market-sh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MarketModule type="sh" /></motion.div>}
            {activeTab === 'market-nasdaq' && <motion.div key="market-nasdaq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MarketModule type="nasdaq" /></motion.div>}
            {activeTab === 'market-btc' && <motion.div key="market-btc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MarketModule type="btc" /></motion.div>}
            {activeTab === 'market-gold' && <motion.div key="market-gold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MarketModule type="gold" /></motion.div>}
            {activeTab === 'matrix' && <motion.div key="matrix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><WuXingMatrix /></motion.div>}
            {activeTab === 'cycles' && <motion.div key="cycles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CycleTools /></motion.div>}
            {activeTab === 'advisors' && <motion.div key="advisors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AIAdvisors /></motion.div>}
            {activeTab === 'membership' && <motion.div key="membership" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Membership /></motion.div>}
          </AnimatePresence>
        </div>
      </main>

      {/* Ask Oracle Input */}
      <AskOracleInput lang={lang} onAsk={handleAskOracle} />

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && <OracleChat onClose={() => setShowChat(false)} lang={lang} initialQuery={chatQuery} />}
      </AnimatePresence>
    </div>
  );
}
