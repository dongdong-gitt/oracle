'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, MessageCircle, Globe, Bell, Menu, BarChart3, Calendar,
  Download, Crown, Coins, Heart, Moon, Sun, ChevronRight, TrendingUp,
  Zap, Compass, Shield, AlertTriangle, ArrowUpRight, Clock,
  Wallet, Briefcase, Sparkles, Send, LogOut, Target
} from 'lucide-react';
import FortuneCompareBoard from './FortuneCompareBoard';
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
import LifeMarketBoard from './LifeMarketBoard';
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
  instantDecision: { zh: '即时决策', en: 'Instant Decision' },
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

type ScoreShape = {
  career: number;
  wealth: number;
  love: number;
  health: number;
  overall: number;
};

type RadarMetric = {
  name: string;
  value: number;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function pickText(lang: Language, zh: string, en: string) {
  return lang === 'zh' ? zh : en;
}

function safeScore(value: unknown, fallback = 60) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getRecentSeries(kline: any[] | undefined, fallback: number, count = 7) {
  const source = Array.isArray(kline) ? kline.slice(-count) : [];
  if (!source.length) return Array.from({ length: count }, () => fallback);
  const values = source.map((item) => safeScore(item?.details?.overall ?? item?.close, fallback));
  if (values.length >= count) return values;
  return [...Array.from({ length: count - values.length }, () => values[0] ?? fallback), ...values];
}

function normalizeBars(values: number[]) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return values.map((value) => Math.round(36 + ((value - min) / range) * 52));
}

function buildTenGodMetrics(detail: any, lang: Language): RadarMetric[] {
  const buckets = {
    self: 0,
    output: 0,
    wealth: 0,
    authority: 0,
    resource: 0,
  };

  const addTenGod = (value?: string) => {
    if (!value) return;
    if (value === '日主' || ['比肩', '劫财'].includes(value)) buckets.self += 1;
    else if (['食神', '伤官'].includes(value)) buckets.output += 1;
    else if (['偏财', '正财'].includes(value)) buckets.wealth += 1;
    else if (['七杀', '正官'].includes(value)) buckets.authority += 1;
    else if (['偏印', '正印'].includes(value)) buckets.resource += 1;
  };

  ['年柱', '月柱', '日柱', '时柱'].forEach((pillarKey) => {
    const pillar = detail?.[pillarKey];
    addTenGod(pillar?.天干?.十神);
    addTenGod(pillar?.地支?.藏干?.主气?.十神);
    addTenGod(pillar?.地支?.藏干?.中气?.十神);
    addTenGod(pillar?.地支?.藏干?.余气?.十神);
  });

  const rawValues = [buckets.self, buckets.output, buckets.wealth, buckets.authority, buckets.resource];
  const max = Math.max(...rawValues, 1);
  const labels = [
    pickText(lang, '自驱', 'Self'),
    pickText(lang, '输出', 'Output'),
    pickText(lang, '财动', 'Wealth'),
    pickText(lang, '掌控', 'Authority'),
    pickText(lang, '恢复', 'Recovery'),
  ];

  return rawValues.map((value, index) => ({
    name: labels[index],
    value: Math.round(26 + (value / max) * 64),
  }));
}

function EnergyRing({ score, size = 180 }: { score: number; size?: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 12);
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#00D4FF' : score >= 60 ? '#B829F7' : score >= 40 ? '#FF2D92' : '#FF4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 12} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 12}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
          style={{ filter: `drop-shadow(0 0 15px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-white/40 mt-1">综合分</span>
      </div>
    </div>
  );
}

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
        if (Number.isFinite(btcPct)) {
          setBtcChange(`${btcPct >= 0 ? '+' : ''}${btcPct.toFixed(2)}%`);
        }

        const daily = cosmicResult?.data || {};
        if (daily?.ganzhiDay) setGanzhiDay(String(daily.ganzhiDay));
        const cycleScore = Number(daily?.nineCycle?.score);
        if (Number.isFinite(cycleScore)) {
          setNineCycleScore(`${cycleScore.toFixed(1)}%`);
        }
      } catch (error) {
        console.error('Failed to load ticker data:', error);
      }
    };

    loadTicker();
    const timer = setInterval(loadTicker, 60 * 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const items = [
    { label: 'BTC/USD', value: btcChange, up: !btcChange.startsWith('-') },
    { label: lang === 'zh' ? '离火九运' : 'LiHuo', value: nineCycleScore, up: true },
    { label: lang === 'zh' ? '今日干支' : 'Ganzhi', value: ganzhiDay, up: true },
    {
      label: lang === 'zh' ? '恐慌指数' : 'Fear',
      value: fearIndex !== null ? String(fearIndex) : '--',
      up: fearIndex !== null ? fearIndex >= 50 : false,
    },
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

function SimpleRadarChart({ metrics }: { metrics: RadarMetric[] }) {
  const center = 60;
  const radius = 45;
  const angleStep = (2 * Math.PI) / Math.max(metrics.length, 3);
  const points = metrics.map((item, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (item.value / 100) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <svg width="120" height="120" className="mx-auto overflow-visible">
      {[20, 40, 60, 80, 100].map((l) => <circle key={l} cx={center} cy={center} r={(l / 100) * radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
      {metrics.map((item, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return (
          <line
            key={`line-${item.name}`}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        );
      })}
      <polygon points={points} fill="rgba(0,212,255,0.15)" stroke="#00D4FF" strokeWidth="2" />
      {metrics.map((item, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (item.value / 100) * radius;
        return <circle key={item.name} cx={center + r * Math.cos(angle)} cy={center + r * Math.sin(angle)} r="3" fill="#00D4FF" />;
      })}
      {metrics.map((item, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const labelRadius = radius + 14;
        return (
          <text
            key={`label-${item.name}`}
            x={center + labelRadius * Math.cos(angle)}
            y={center + labelRadius * Math.sin(angle)}
            fill="rgba(255,255,255,0.5)"
            fontSize="9"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {item.name}
          </text>
        );
      })}
    </svg>
  );
}

function AskOracleInput({ lang, onAsk }: { lang: Language; onAsk: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAsk(query);
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D] to-transparent z-50">
      <div className="max-w-3xl mx-auto relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white/30 pointer-events-none">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm">{t('askOracle', lang)}</span>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-36 pr-14 py-4 bg-[#1A1B1E] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-blue/50 transition-colors"
        />
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

  const hasData = userHasData;
  const periods = ['1D', '1M', '1Y', '10Y', 'ALL'];
  const userName = birthData?.name?.trim() || pickText(lang, '用户', 'User');
  const userAvatar = userName.slice(0, 1).toUpperCase();
  const riZhuText = baziResult?.bazi?.riZhu ? `${baziResult.bazi.riZhu} ${pickText(lang, '日主', 'Day Master')}` : pickText(lang, '命盘待生成', 'Chart pending');
  const scores: ScoreShape = {
    career: safeScore(baziResult?.aiAnalysis?.score?.career, 68),
    wealth: safeScore(baziResult?.aiAnalysis?.score?.wealth, 66),
    love: safeScore(baziResult?.aiAnalysis?.score?.love, 64),
    health: safeScore(baziResult?.aiAnalysis?.score?.health, 70),
    overall: safeScore(baziResult?.aiAnalysis?.score?.overall, 67),
  };
  const overallScore = scores.overall;
  const fortuneLevel = Math.max(1, Math.min(5, Math.round(overallScore / 20)));
  const fortuneText = (overallScore / 20).toFixed(1);

  const recentSeries = getRecentSeries(baziResult?.kline, overallScore, 7);
  const energyBars = normalizeBars(recentSeries);
  const trendDelta = recentSeries[recentSeries.length - 1] - recentSeries[0];
  const averageRecent = recentSeries.reduce((sum, item) => sum + item, 0) / recentSeries.length;
  const volatility = recentSeries.reduce((sum, item, index) => {
    if (index === 0) return sum;
    return sum + Math.abs(item - recentSeries[index - 1]);
  }, 0) / Math.max(1, recentSeries.length - 1);
  const radarMetrics = buildTenGodMetrics(baziResult?.detail, lang);
  const strongestMetric = [...radarMetrics].sort((a, b) => b.value - a.value)[0];
  const weakestDimension = ([
    { key: 'career', label: pickText(lang, '事业', 'Career'), value: scores.career },
    { key: 'wealth', label: pickText(lang, '财运', 'Wealth'), value: scores.wealth },
    { key: 'love', label: pickText(lang, '关系', 'Love'), value: scores.love },
    { key: 'health', label: pickText(lang, '精力', 'Health'), value: scores.health },
  ].sort((a, b) => a.value - b.value))[0];

  const statusPhase: StatusPhase = overallScore >= 78 && trendDelta >= 2
    ? 'expansion'
    : overallScore < 60 || scores.health < 58 || trendDelta <= -4
      ? 'recovery'
      : 'consolidation';

  const personalMode = statusPhase === 'expansion'
    ? pickText(lang, '势能上行', 'Momentum Up')
    : statusPhase === 'recovery'
      ? pickText(lang, '先收再放', 'Recover First')
      : pickText(lang, '稳住节奏', 'Hold Pace');

  const personalFocus = trendDelta >= 3
    ? pickText(lang, '适合推进关键决策与对外沟通。', 'Push key decisions and outbound talks.')
    : trendDelta <= -3
      ? pickText(lang, '适合复盘、筛项目、减少情绪性动作。', 'Review, filter projects, reduce emotional moves.')
      : pickText(lang, '适合小步试错，别一次压满。', 'Probe with small moves and avoid overcommitting.');

  const personalWarning = weakestDimension.key === 'health'
    ? pickText(lang, '精力面偏弱，今天别把自己当永动机。', 'Energy is soft today—do not treat yourself like a perpetual machine.')
    : weakestDimension.key === 'wealth'
      ? pickText(lang, '财务判断容易被情绪带偏，大额动作先隔一轮。', 'Money decisions may drift emotional—delay big moves by one cycle.')
      : weakestDimension.key === 'career'
        ? pickText(lang, '执行面要防分心，先把最关键的一件事打穿。', 'Execution is vulnerable to distraction—finish the one key thing first.')
        : pickText(lang, '关系面敏感，今天宜留余地，不宜硬碰硬。', 'Relationship signals are sensitive—leave room instead of forcing.');

  const strategyFit = clamp(Math.round(scores.career * 0.45 + scores.wealth * 0.35 + overallScore * 0.2 + trendDelta * 2), 35, 96);
  const strategyMode = statusPhase === 'expansion'
    ? pickText(lang, '扩张窗口', 'Expansion Window')
    : statusPhase === 'recovery'
      ? pickText(lang, '修复窗口', 'Repair Window')
      : pickText(lang, '守成窗口', 'Consolidation Window');

  const strategyActions = statusPhase === 'expansion'
    ? [
        pickText(lang, '优先推进一个最能放大现金流的项目。', 'Prioritize the one project that amplifies cash flow fastest.'),
        pickText(lang, '谈合作可以主动，但边界和分账要先写死。', 'Be proactive in deals, but lock boundaries and revenue split first.'),
        pickText(lang, '新动作可以开，但不要同时起三条线。', 'Launch new initiatives, but not three fronts at once.'),
      ]
    : statusPhase === 'recovery'
      ? [
          pickText(lang, '先止损和清理低质量合作，再谈扩张。', 'Stop losses and clear low-quality partnerships before expanding.'),
          pickText(lang, '把资源收回到你最能掌控的业务上。', 'Pull resources back to the business you control best.'),
          pickText(lang, '这阶段重节奏，不重声量。', 'This phase is about rhythm, not noise.'),
        ]
      : [
          pickText(lang, '适合做复盘、排兵布阵和小范围验证。', 'Best used for review, planning, and small validation.'),
          pickText(lang, '合作可聊，但签约节奏不要被对方带着走。', 'Talk deals, but do not let the other side set your signing pace.'),
          pickText(lang, '增长动作宜轻量，先看反馈再加码。', 'Keep growth moves lightweight and scale only after feedback.'),
        ];

  const strategyDecision = statusPhase === 'expansion'
    ? pickText(lang, '现在适合进，但要只进最确定的一步。', 'Advance now, but only with the most certain move.')
    : statusPhase === 'recovery'
      ? pickText(lang, '现在先修复地基，别为了热闹去开新坑。', 'Repair the base first—do not open a new front for excitement.')
      : pickText(lang, '现在先稳住盘面，再挑一个点突破。', 'Stabilize the board, then break through on one selected point.');

  const offenseWeight = clamp(Math.round(scores.wealth * 0.4 + Math.max(trendDelta, 0) * 4 + scores.career * 0.15), 15, 70);
  const defenseWeight = clamp(Math.round((100 - scores.health) * 0.45 + volatility * 5 + (statusPhase === 'recovery' ? 16 : 4)), 15, 70);
  const probeWeight = clamp(100 - offenseWeight - defenseWeight, 10, 60);
  const normalizedTotal = offenseWeight + defenseWeight + probeWeight;
  const riskSegments = {
    offense: Math.round((offenseWeight / normalizedTotal) * 100),
    probe: Math.round((probeWeight / normalizedTotal) * 100),
    defense: Math.max(0, 100 - Math.round((offenseWeight / normalizedTotal) * 100) - Math.round((probeWeight / normalizedTotal) * 100)),
  };

  const riskBias = riskSegments.offense >= 45
    ? pickText(lang, '进攻偏强', 'Offense Biased')
    : riskSegments.defense >= 40
      ? pickText(lang, '防守优先', 'Defense First')
      : pickText(lang, '试探优先', 'Probe First');

  const executionWindow = trendDelta >= 3
    ? pickText(lang, '主节奏：顺势推进', 'Main rhythm: follow momentum')
    : trendDelta <= -3
      ? pickText(lang, '主节奏：轻仓观察', 'Main rhythm: light-position observation')
      : pickText(lang, '主节奏：试单验证', 'Main rhythm: probe and validate');

  const riskLine = volatility >= 6
    ? pickText(lang, '风控线：波动偏大，触线就撤。', 'Risk line: volatility is elevated—exit on trigger.')
    : pickText(lang, '风控线：守纪律，不追第二根。', 'Risk line: stay disciplined—do not chase the second move.');

  const observationWindow = strongestMetric?.name === pickText(lang, '输出', 'Output')
    ? pickText(lang, '观察窗：内容/表达带来的机会。', 'Watch window: opportunities created by content and expression.')
    : strongestMetric?.name === pickText(lang, '掌控', 'Authority')
      ? pickText(lang, '观察窗：规则、资源位和主导权变化。', 'Watch window: shifts in rules, positioning, and control.')
      : pickText(lang, '观察窗：现金流和反馈速度。', 'Watch window: cash flow and feedback speed.');

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

  const handleAskOracle = (query: string) => {
    setChatQuery(query);
    setShowChat(true);
  };

  if (!hasData) return <BirthInput onSubmit={() => {}} lang={lang} />;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans">
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
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activePeriod === p ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
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

      <CycleTicker lang={lang} />

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-16 bottom-0 w-[280px] bg-[#0D0D0D]/95 backdrop-blur-xl border-r border-white/5 z-50 overflow-y-auto">
              <div className="p-5">
                <div className="p-4 rounded-2xl bg-[#1A1B1E] border border-white/5 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-lg font-bold">{userAvatar}</div>
                    <div>
                      <div className="font-semibold">{userName}</div>
                      <div className="text-xs text-white/40">{riZhuText}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/40">{pickText(lang, '今日运势', 'Today score')}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i <= fortuneLevel ? 'bg-amber-400' : 'bg-white/20'}`} />
                          ))}
                        </div>
                        <span className="font-mono text-amber-400">{fortuneText}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-white/35 mb-1">{pickText(lang, '事业', 'Career')}</div>
                        <div className="text-white/80 font-semibold">{scores.career}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-white/35 mb-1">{pickText(lang, '财运', 'Wealth')}</div>
                        <div className="text-white/80 font-semibold">{scores.wealth}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-white/35 mb-1">{pickText(lang, '关系', 'Love')}</div>
                        <div className="text-white/80 font-semibold">{scores.love}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-white/35 mb-1">{pickText(lang, '精力', 'Health')}</div>
                        <div className="text-white/80 font-semibold">{scores.health}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 text-xs flex items-center justify-between">
                      <span className="text-white/40">{pickText(lang, '当前阶段', 'Current phase')}</span>
                      <span className="text-amber-400">{personalMode}</span>
                    </div>
                  </div>
                </div>

                <nav className="space-y-4">
                  {menuGroups.map((group) => {
                    const GroupIcon = group.icon;
                    const isGroupActive = group.items.some(item => item.id === activeTab);
                    return (
                      <div key={group.title} className="space-y-1">
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isGroupActive ? 'bg-white/5' : ''}`}>
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center`}>
                            <GroupIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-sm text-white/80">{group.title}</span>
                        </div>
                        <div className="pl-4 space-y-0.5">
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as TabType); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${activeTab === item.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
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

      <main className="pt-28 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
                  <div>
                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-2">
                      <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">{t('welcome', lang)}</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/40">
                      {t('subtitle', lang)}
                    </motion.p>
                  </div>
                  <EnergyRing score={overallScore} size={140} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-[#1A1B1E] border border-white/5">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-neon-blue" />
                        <span className="font-semibold">{t('humanAssets', lang)}</span>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20">{personalMode}</span>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                        <span>{pickText(lang, '近 7 次势能曲线', 'Recent 7-point momentum')}</span>
                        <span>{Math.round(averageRecent)} / 100</span>
                      </div>
                      <div className="h-20 flex items-end gap-1.5">
                        {energyBars.map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-neon-blue/40 via-neon-blue/60 to-cyan-300 rounded-t-xl transition-all" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                        <span>{pickText(lang, '十神动能映射', 'Ten-gods energy map')}</span>
                        <span>{strongestMetric?.name} {strongestMetric?.value}</span>
                      </div>
                      <SimpleRadarChart metrics={radarMetrics} />
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-xs text-white/40 mb-1">{pickText(lang, '当前建议', 'Current guidance')}</div>
                        <div className="text-sm text-white/80">{personalFocus}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <div className="flex items-center gap-2 text-rose-400 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{personalWarning}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-[#1A1B1E] border border-white/5">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-neon-purple" />
                        <span className="font-semibold">{t('strategicEngine', lang)}</span>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/20">{strategyMode}</span>
                    </div>

                    <div className="mb-6">
                      <div className="text-xs text-white/40 mb-3">{pickText(lang, '项目出手时机', 'Project timing fit')}</div>
                      <div className="relative h-32">
                        <svg viewBox="0 0 200 100" className="w-full h-full">
                          <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
                          <path d={`M 10 100 A 90 90 0 0 1 ${10 + strategyFit * 1.8} ${Math.max(12, 100 - strategyFit * 0.95)}`} fill="none" stroke="url(#grad1)" strokeWidth="20" />
                          <defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#B829F7" /><stop offset="100%" stopColor="#00D4FF" /></linearGradient></defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-neon-purple">{strategyFit}%</span>
                          <span className="text-xs text-white/40">{pickText(lang, '天时契合度', 'Timing fit')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-neon-purple/10 to-neon-blue/10 border border-neon-purple/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-neon-purple" />
                        <span className="text-sm font-medium text-neon-purple">{t('instantDecision', lang)}</span>
                      </div>
                      <p className="text-sm text-white/70">{strategyDecision}</p>
                      <ul className="space-y-2 text-sm text-white/60">
                        {strategyActions.map((item, index) => (
                          <li key={index} className="flex gap-2"><span className="text-neon-purple">•</span><span>{item}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-[#1A1B1E] border border-white/5">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-neon-cyan" />
                        <span className="font-semibold">{t('financialRadar', lang)}</span>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">{riskBias}</span>
                    </div>

                    <div className="mb-6">
                      <div className="text-xs text-white/40 mb-3">{pickText(lang, '仓位与风险节奏', 'Risk posture mix')}</div>
                      <div className="relative w-32 h-32 mx-auto">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" />
                          <circle cx="50" cy="50" r="35" fill="none" stroke="#00D4FF" strokeWidth="18" strokeDasharray={`${riskSegments.offense * 2.2} 220`} strokeDashoffset="0" />
                          <circle cx="50" cy="50" r="35" fill="none" stroke="#B829F7" strokeWidth="18" strokeDasharray={`${riskSegments.probe * 2.2} 220`} strokeDashoffset={`-${riskSegments.offense * 2.2}`} />
                          <circle cx="50" cy="50" r="35" fill="none" stroke="#FFB020" strokeWidth="18" strokeDasharray={`${riskSegments.defense * 2.2} 220`} strokeDashoffset={`-${(riskSegments.offense + riskSegments.probe) * 2.2}`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-lg font-bold">{riskBias}</span>
                            <span className="block text-xs text-white/40">{overallScore}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center gap-4 mt-3 text-xs flex-wrap">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-blue"></span>{pickText(lang, '进攻', 'Offense')} {riskSegments.offense}%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-purple"></span>{pickText(lang, '试探', 'Probe')} {riskSegments.probe}%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span>{pickText(lang, '防守', 'Defense')} {riskSegments.defense}%</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-neon-cyan/10 to-neon-blue/10 border border-neon-cyan/20 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-neon-cyan" />
                        <span className="text-sm font-medium text-neon-cyan">{pickText(lang, '执行节奏', 'Execution rhythm')}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-xs text-white/40">{pickText(lang, '主动作', 'Main action')}</div>
                          <div className="text-white/80">{executionWindow}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/40">{pickText(lang, '风控线', 'Risk line')}</div>
                          <div className="text-white/80">{riskLine}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/40">{pickText(lang, '观察窗', 'Watch window')}</div>
                          <div className="text-white/80">{observationWindow}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <FortuneCompareBoard lang={lang} focusPeriod={activePeriod as '1D' | '1M' | '1Y' | '10Y' | 'ALL'} />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <LifeMarketBoard />
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

      <AskOracleInput lang={lang} onAsk={handleAskOracle} />

      <AnimatePresence>
        {showChat && <OracleChat onClose={() => setShowChat(false)} lang={lang} initialQuery={chatQuery} />}
      </AnimatePresence>
    </div>
  );
}
