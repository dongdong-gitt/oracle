'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Bell,
  Menu,
  Compass,
  LayoutDashboard,
  ScrollText,
  Heart,
  Hexagon,
  MoonStar,
  LineChart,
  Atom,
  Orbit,
  Sparkles,
  Crown,
  MessageCircle,
} from 'lucide-react';
import BirthInput from './BirthInput';
import MarketPulse from './MarketPulse';
import DailyGuidance from './DailyGuidance';
import SoulMate from './SoulMate';
import LiuYao from './LiuYao';
import DreamInterpreter from './DreamInterpreter';
import WuXingMatrix from './WuXingMatrix';
import CycleTools from './CycleTools';
import AIAdvisors from './AIAdvisors';
import Membership from './Membership';
import MingPan from './MingPan';
import MingPanDetail from './MingPanDetail';
import { useUser } from '../context/UserContext';

export type Language = 'zh' | 'en';
type TabKey = 'market' | 'bazi' | 'daily' | 'soulmate' | 'liuyao' | 'dream' | 'wuxing' | 'cycle' | 'advisor' | 'membership';

function CycleTicker({ lang }: { lang: Language }) {
  const [time, setTime] = useState(new Date());
  const [fearIndex, setFearIndex] = useState<number | null>(null);
  const [btcChange, setBtcChange] = useState<string>('--');
  const [ganzhiDay, setGanzhiDay] = useState<string>('今日干支');
  const [nineCycleScore, setNineCycleScore] = useState<string>('--');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    const loadTicker = async () => {
      try {
        const [marketResponse, cosmicResponse] = await Promise.all([
          fetch('/api/market', { cache: 'no-store' }),
          fetch('/api/cosmic/daily', { cache: 'no-store' }),
        ]);
        const [marketResult, cosmicResult] = await Promise.all([
          marketResponse.json(),
          cosmicResponse.json(),
        ]);
        if (!active) return;

        const fearValue = Number(marketResult?.data?.fear?.value);
        if (Number.isFinite(fearValue)) setFearIndex(fearValue);

        const btcPct = Number(marketResult?.data?.btc?.changePercent);
        if (Number.isFinite(btcPct)) setBtcChange(`${btcPct >= 0 ? '+' : ''}${btcPct.toFixed(2)}%`);

        const daily = cosmicResult?.data || {};
        if (daily?.ganzhiDay) setGanzhiDay(String(daily.ganzhiDay));
        const cycleScore = Number(daily?.nineCycle?.score);
        if (Number.isFinite(cycleScore)) setNineCycleScore(`${cycleScore.toFixed(1)}%`);
      } catch (error) {
        console.error('Failed to load ticker data:', error);
      }
    };

    loadTicker();
    const timer = setInterval(loadTicker, 60000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const items = [
    { label: 'BTC/USD', value: btcChange, up: !btcChange.startsWith('-') },
    { label: lang === 'zh' ? '离火九运' : 'LiHuo', value: nineCycleScore, up: true },
    { label: lang === 'zh' ? '今日干支' : 'Ganzhi', value: ganzhiDay, up: true },
    { label: lang === 'zh' ? '恐慌指数' : 'Fear', value: fearIndex !== null ? String(fearIndex) : '--', up: fearIndex !== null ? fearIndex >= 50 : false },
    { label: lang === 'zh' ? '当前时辰' : 'Time', value: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), up: true },
  ];

  return (
    <div className="fixed top-16 left-0 right-0 h-10 bg-[#0D0D0D]/95 backdrop-blur-xl border-b border-white/5 z-40 overflow-hidden">
      <motion.div className="flex items-center gap-8 px-6 h-full" animate={{ x: [0, -400] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
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

function BaziFallback({ baziResult }: { baziResult: any }) {
  const bazi = baziResult?.bazi;
  if (!bazi) {
    return (
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-white/70">
        命盘数据暂不可用。
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MingPan
        data={{
          year: bazi.year || '--',
          month: bazi.month || '--',
          day: bazi.day || '--',
          hour: bazi.hour || '--',
        }}
      />
      <MingPanDetail />
    </div>
  );
}

export default function Dashboard() {
  const { baziResult, clearData } = useUser();
  const [lang, setLang] = useState<Language>('zh');
  const [activeTab, setActiveTab] = useState<TabKey>('market');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const hasData = Boolean(baziResult);

  const navItems = useMemo(
    () => [
      { key: 'market' as TabKey, label: '市场', icon: LineChart },
      { key: 'bazi' as TabKey, label: '八字', icon: ScrollText },
      { key: 'daily' as TabKey, label: '日运', icon: LayoutDashboard },
      { key: 'soulmate' as TabKey, label: '姻缘', icon: Heart },
      { key: 'liuyao' as TabKey, label: '六爻', icon: Hexagon },
      { key: 'dream' as TabKey, label: '解梦', icon: MoonStar },
      { key: 'wuxing' as TabKey, label: '五行', icon: Atom },
      { key: 'cycle' as TabKey, label: '周期', icon: Orbit },
      { key: 'advisor' as TabKey, label: '顾问', icon: MessageCircle },
      { key: 'membership' as TabKey, label: '会员', icon: Crown },
    ],
    []
  );

  if (!hasData) return <BirthInput onSubmit={() => {}} lang={lang} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'market':
        return <MarketPulse />;
      case 'bazi':
        return <BaziFallback baziResult={baziResult} />;
      case 'daily':
        return <DailyGuidance />;
      case 'soulmate':
        return <SoulMate />;
      case 'liuyao':
        return <LiuYao />;
      case 'dream':
        return <DreamInterpreter />;
      case 'wuxing':
        return <WuXingMatrix />;
      case 'cycle':
        return <CycleTools />;
      case 'advisor':
        return <AIAdvisors />;
      case 'membership':
        return <Membership />;
      default:
        return <MarketPulse />;
    }
  };

  const currentTitle = navItems.find((item) => item.key === activeTab)?.label || '市场';

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans">
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen((v) => !v)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Menu className="w-5 h-5 text-white/60" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg tracking-tight">ORACLE</div>
                <div className="text-[11px] text-white/35">{currentTitle}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm">
              <Globe className="w-4 h-4" />
              <span>{lang === 'zh' ? '中文' : 'EN'}</span>
            </button>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-fuchsia-500 rounded-full"></span>
            </button>
            <button onClick={clearData} className="px-3 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-sm">
              {lang === 'zh' ? '退出' : 'Exit'}
            </button>
          </div>
        </div>
      </header>

      <CycleTicker lang={lang} />

      <div className="pt-28 flex min-h-screen">
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-white/5 bg-[#111214]/80 backdrop-blur-xl`}>
          <div className="p-4 space-y-2 sticky top-28">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.key === activeTab;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${active ? 'bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]' : 'text-white/55 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-white/40'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 px-6 pb-20">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between gap-6 py-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
                  {currentTitle}
                </h1>
                <p className="text-white/40">
                  {activeTab === 'market' ? '市场页已修好，其他入口已恢复。' : '功能入口已恢复，八字页暂用稳定版占位。'}
                </p>
              </div>
              <div className="px-4 py-2 rounded-full bg-white/5 text-sm text-white/70 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                {lang === 'zh' ? '入口已恢复' : 'Navigation restored'}
              </div>
            </div>

            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {renderContent()}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
