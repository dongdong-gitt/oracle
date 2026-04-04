'use client';

import { motion } from 'framer-motion';
import { Sparkles, User, MapPin, Clock, Calendar } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface BaziPanProps {
  data: {
    bazi: {
      year: string;
      month: string;
      day: string;
      hour: string;
      riZhu: string;
    };
    detail: {
      鎬у埆: string;
      闃冲巻: string;
      鍐滃巻: string;
      鍏瓧: string;
      鐢熻倴: string;
      鏃ヤ富: string;
      骞存煴: any;
      鏈堟煴: any;
      鏃ユ煴: any;
      鏃舵煴: any;
      鑳庡厓: string;
      鍛藉: string;
      韬: string;
      绁炵厼: {
        骞存煴: string[];
        鏈堟煴: string[];
        鏃ユ煴: string[];
        鏃舵煴: string[];
      };
      澶ц繍: {
        璧疯繍鏃ユ湡: string;
        璧疯繍骞撮緞: number;
        澶ц繍: Array<{
          age: number;
          ganZhi: string;
          澶ц繍鍚嶇О?: string;
          寮€濮嬪勾浠? number;
          缁撴潫骞翠唤: number;
          澶╁共鍗佺?: string;
          鍦版敮鍗佺?: string[];
        }>;
      };
      鍒戝啿鍚堜細?: {
        澶╁共?: string[];
        鍦版敮?: string[];
      };
      浜旇缁熻?: {
        閲? number;
        鏈? number;
        姘? number;
        鐏? number;
        鍦? number;
      };
      鐪熷お闃虫椂?: {
        鏃ユ湡: string;
        鏃堕棿: string;
      };
      鍑虹敓鑺傛皵?: {
        鑺傛皵鍚? string;
        鑺傛皵鏃ユ湡: string;
        璺濈澶╂暟: number;
        鎻忚堪: string;
      } | null;
    };
    aiAnalysis?: {
      mingZhu: string;
      career: string;
      wealth: string;
      love: string;
      health: string;
      currentPeriod: string;
      thisYear: string;
      advice: string;
      score: {
        career: number;
        wealth: number;
        love: number;
        health: number;
        overall: number;
      };
    };
  };
  birthData: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    gender: 'male' | 'female';
  };
}

// 浜旇棰滆壊
const WUXING_COLORS: Record<string, string> = {
  '鏈?: 'text-green-400',
  '鐏?: 'text-red-400',
  '鍦?: 'text-yellow-400',
  '閲?: 'text-amber-300',
  '姘?: 'text-blue-400',
};

// 鍗佺棰滆壊
const SHISHEN_COLORS: Record<string, string> = {
  '姣旇偐': 'text-gray-300',
  '鍔储': 'text-gray-400',
  '椋熺': 'text-green-300',
  '浼ゅ畼': 'text-green-400',
  '鍋忚储': 'text-yellow-300',
  '姝ｈ储': 'text-yellow-400',
  '涓冩潃': 'text-red-400',
  '姝ｅ畼': 'text-red-300',
  '鍋忓嵃': 'text-blue-300',
  '姝ｅ嵃': 'text-blue-400',
};

// 浜旇棰滆壊
const WUXING_BG_COLORS: Record<string, string> = {
  '閲?: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  '鏈?: 'bg-green-400/20 text-green-300 border-green-400/30',
  '姘?: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  '鐏?: 'bg-red-400/20 text-red-300 border-red-400/30',
  '鍦?: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
};

// 浜旇缁熻缁勪欢
function WuXingStats({ stats }: { stats?: Record<string, number> }) {
  if (!stats) return null;

  const rawEntries = Object.entries(stats)
    .map(([key, value]) => [key, Number(value)] as const)
    .filter(([, value]) => Number.isFinite(value));
  const fallbackValues = rawEntries.map(([, value]) => value);

  const getCount = (label: string, index: number) => {
    const exact = Number((stats as Record<string, unknown>)[label]);
    if (Number.isFinite(exact)) return exact;
    const fuzzy = rawEntries.find(([key]) => key.includes(label));
    if (fuzzy) return fuzzy[1];
    return Number.isFinite(fallbackValues[index]) ? fallbackValues[index] : 0;
  };

  const items = [
    { key: 'metal', label: '閲?, count: getCount('閲?, 0), color: 'from-amber-400 to-yellow-500', glow: 'shadow-amber-500/30' },
    { key: 'wood', label: '鏈?, count: getCount('鏈?, 1), color: 'from-emerald-400 to-green-500', glow: 'shadow-emerald-500/30' },
    { key: 'water', label: '姘?, count: getCount('姘?, 2), color: 'from-cyan-400 to-blue-500', glow: 'shadow-cyan-500/30' },
    { key: 'fire', label: '鐏?, count: getCount('鐏?, 3), color: 'from-rose-400 to-orange-500', glow: 'shadow-rose-500/30' },
    { key: 'earth', label: '鍦?, count: getCount('鍦?, 4), color: 'from-yellow-400 to-amber-600', glow: 'shadow-yellow-500/30' },
  ];

  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
  const maxCount = Math.max(...items.map((item) => item.count), 1);
  const minCount = Math.min(...items.map((item) => item.count));
  const dominant = items.reduce((best, item) => (item.count > best.count ? item : best), items[0]);
  const weakest = items.reduce((worst, item) => (item.count < worst.count ? item : worst), items[0]);
  const balanceScore = maxCount === 0 ? 100 : Math.round((minCount / maxCount) * 100);

  const balanceText = balanceScore >= 75 ? '鍧囪　' : balanceScore >= 50 ? '杞诲亸' : '澶辫　';
  const dominantAdvice = `涓诲${dominant.label}鍋忓己锛岄€傚悎鎶婁紭鍔胯兘鍔涘仛娣卞仛閫忥紝鍐嶅鎵╄竟鐣屻€俙;
  const weakAdvice = `${weakest.label}鐩稿鍋忓急锛屽缓璁湪浣滄伅銆侀ギ椋熷拰琛屽姩鑺傚緥涓婂仛閽堝鎬цˉ浣嶃€俙;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
          <div className="text-xs text-cyan-300/80 mb-1">涓诲鍏冪礌</div>
          <div className="text-lg font-bold text-cyan-200">{dominant.label}</div>
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
          <div className="text-xs text-rose-300/80 mb-1">寰呰ˉ鍏冪礌</div>
          <div className="text-lg font-bold text-rose-200">{weakest.label}</div>
        </div>
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3">
          <div className="text-xs text-violet-300/80 mb-1">骞宠　搴?/div>
          <div className="text-lg font-bold text-violet-200">{balanceScore}% 路 {balanceText}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#101528] via-[#11162c] to-[#0f1324] p-4">
        <div className="space-y-3">
          {items.map((item) => {
            const pct = Math.round((item.count / total) * 100);
            return (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-semibold text-white">
                      {item.label}
                    </span>
                    <span className="text-gray-200">{item.label}鑳介噺</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="font-semibold text-white">{item.count}</span>
                    <span className="ml-1 text-xs text-gray-400">({pct}%)</span>
                  </div>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} shadow-md ${item.glow} transition-all duration-500`}
                    style={{ width: `${Math.max(8, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <div className="text-sm font-semibold text-emerald-300 mb-1">浼樺娍鎵撴硶</div>
          <p className="text-xs text-gray-200 leading-relaxed">{dominantAdvice}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
          <div className="text-sm font-semibold text-amber-300 mb-1">璋冨拰寤鸿</div>
          <p className="text-xs text-gray-200 leading-relaxed">{weakAdvice}</p>
        </div>
      </div>
    </div>
  );
}
export default function BaZiPan({ data, birthData }: BaziPanProps) {
  const { detail, aiAnalysis } = data;
  const { clearData } = useUser();
  
  const pillars = [
    { name: '骞存煴', key: '骞存煴', position: '骞? },
    { name: '鏈堟煴', key: '鏈堟煴', position: '鏈? },
    { name: '鏃ユ煴', key: '鏃ユ煴', position: '鏃? },
    { name: '鏃舵煴', key: '鏃舵煴', position: '鏃? },
  ];

  // 璁＄畻褰撳墠澶ц繍
  const currentYear = new Date().getFullYear();
  const currentDaYun = detail.澶ц繍.澶ц繍.find(d => 
    d.寮€濮嬪勾浠?<= currentYear && d.缁撴潫 >= currentYear
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-20">
      {/* 澶撮儴淇℃伅 */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <User className="w-6 h-6 text-cyan-400" />
                {birthData.name || '鍛戒富'} 鐨勫懡鐩?
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {birthData.gender === 'male' ? '涔鹃€? : '鍧ら€?} 路 {birthData.birthDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {birthData?.birthTime || '--'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {birthData?.birthPlace || '未填写'}
                </span>
              </div>
              {/* 鐪熷お闃虫椂鍜岃妭姘斾俊鎭?*/}
              <div className="flex flex-wrap gap-4 text-xs">
                {detail.鐪熷お闃虫椂 && (
                  <span className="flex items-center gap-1 text-cyan-400/80 bg-cyan-400/10 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" />
                    鐪熷お闃虫椂: {detail.鐪熷お闃虫椂.鏃ユ湡} {detail.鐪熷お闃虫椂.鏃堕棿}
                  </span>
                )}
                {detail.鍑虹敓鑺傛皵 && (
                  <span className="flex items-center gap-1 text-amber-400/80 bg-amber-400/10 px-2 py-1 rounded">
                    <Sparkles className="w-3 h-3" />
                    {detail.鍑虹敓鑺傛皵.鎻忚堪}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">鏃ヤ富</div>
              <div className="text-3xl font-bold text-cyan-400">{detail.鏃ヤ富}</div>
              <div className="text-sm text-gray-500">{detail.鐢熻倴}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* 鍏瓧鍛界洏琛ㄦ牸 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-5 bg-cyan-400 rounded-full" />
              鍏瓧鍛界洏
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-3 text-left text-sm text-gray-400 font-normal">鏌变綅</th>
                  {pillars.map(p => (
                    <th key={p.key} className="p-3 text-center text-sm text-gray-400 font-normal">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* 澶╁共鍗佺 */}
                <tr>
                  <td className="p-3 text-sm text-gray-500">骞茬</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const shishen = pillar?.澶╁共?.鍗佺 || (p.key === '鏃ユ煴' ? '鏃ヤ富' : '');
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <span className={`text-sm ${SHISHEN_COLORS[shishen] || 'text-gray-300'}`}>
                          {shishen}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 澶╁共 */}
                <tr className="bg-white/[0.02]">
                  <td className="p-3 text-sm text-gray-500">澶╁共</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const gan = pillar?.澶╁共?.澶╁共;
                    const wuxing = pillar?.澶╁共?.浜旇;
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <span className={`text-2xl font-bold ${WUXING_COLORS[wuxing] || 'text-white'}`}>
                          {gan}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 鍦版敮 */}
                <tr>
                  <td className="p-3 text-sm text-gray-500">鍦版敮</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const zhi = pillar?.鍦版敮?.鍦版敮;
                    const wuxing = pillar?.鍦版敮?.浜旇;
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <span className={`text-2xl font-bold ${WUXING_COLORS[wuxing] || 'text-white'}`}>
                          {zhi}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 钘忓共 */}
                <tr className="bg-white/[0.02]">
                  <td className="p-3 text-sm text-gray-500 align-top">钘忓共</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const canggan = pillar?.鍦版敮?.钘忓共;
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <div className="space-y-1">
                          {canggan?.涓绘皵 && (
                            <div className={`text-xs ${WUXING_COLORS[canggan.涓绘皵.澶╁共 === '鐢? || canggan.涓绘皵.澶╁共 === '涔? ? '鏈? : canggan.涓绘皵.澶╁共 === '涓? || canggan.涓绘皵.澶╁共 === '涓? ? '鐏? : canggan.涓绘皵.澶╁共 === '鎴? || canggan.涓绘皵.澶╁共 === '宸? ? '鍦? : canggan.涓绘皵.澶╁共 === '搴? || canggan.涓绘皵.澶╁共 === '杈? ? '閲? : '姘?] || 'text-gray-300'}`}>
                              {canggan.涓绘皵.澶╁共}路{canggan.涓绘皵.鍗佺}
                            </div>
                          )}
                          {canggan?.涓皵 && (
                            <div className="text-xs text-gray-400">
                              {canggan.涓皵.澶╁共}路{canggan.涓皵.鍗佺}
                            </div>
                          )}
                          {canggan?.浣欐皵 && (
                            <div className="text-xs text-gray-500">
                              {canggan.浣欐皵.澶╁共}路{canggan.浣欐皵.鍗佺}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 绾抽煶 */}
                <tr>
                  <td className="p-3 text-sm text-gray-500">绾抽煶</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const nayin = pillar?.绾抽煶;
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <span className="text-xs text-amber-400">{nayin}</span>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 绌轰骸 */}
                <tr className="bg-white/[0.02]">
                  <td className="p-3 text-sm text-gray-500">绌轰骸</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const kongwang = pillar?.绌轰骸;
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <span className="text-xs text-gray-400">{kongwang}</span>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 鍦板娍锛堝崄浜岄暱鐢燂級 */}
                <tr>
                  <td className="p-3 text-sm text-gray-500">鍦板娍</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const xingyun = pillar?.鏄熻繍;
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <span className="text-xs text-purple-400">{xingyun}</span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 绁炵厼 */}
        {detail.绁炵厼 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 p-4"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-400 rounded-full" />
              绁炵厼
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(detail.绁炵厼).map(([key, gods]) => (
                <div key={key} className="bg-white/5 rounded-xl p-3">
                  <div className="text-sm text-gray-500 mb-2">{key}</div>
                  <div className="flex flex-wrap gap-1">
                    {(gods as string[]).slice(0, 6).map((god, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded text-cyan-300">
                        {god}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 澶ц繍 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 p-4"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-400 rounded-full" />
            澶ц繍璧板娍
            <span className="text-sm text-gray-500 font-normal">
              锛堣捣杩愭椂闂达細{detail.澶ц繍.璧疯繍鏃ユ湡}锛寋detail.澶ц繍.璧疯繍骞撮緞}宀佽捣杩愶級
            </span>
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {detail.澶ц繍.澶ц繍.slice(0, 8).map((dy, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-24 p-3 rounded-xl text-center ${
                  dy.寮€濮嬪勾浠?<= currentYear && dy.缁撴潫骞翠唤 >= currentYear
                    ? 'bg-cyan-500/20 border border-cyan-500/50'
                    : 'bg-white/5'
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">{dy.age}宀?/div>
                <div className="text-base font-bold text-white">{dy.澶ц繍鍚嶇О || `${dy.ganZhi}澶ц繍`}</div>
                <div className="text-xs text-gray-400">{dy.寮€濮嬪勾浠絵-{dy.缁撴潫骞翠唤}</div>
              </div>
            ))}
          </div>
          {currentDaYun && (
            <div className="mt-4 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <div className="text-sm text-cyan-400 mb-1">褰撳墠澶ц繍</div>
              <div className="text-lg font-bold">{currentDaYun.澶ц繍鍚嶇О || `${currentDaYun.ganZhi}澶ц繍`}</div>
              <div className="text-sm text-gray-400">
                {currentDaYun.澶╁共鍗佺 || ''} {currentDaYun.鍦版敮鍗佺 ? `路 ${currentDaYun.鍦版敮鍗佺.join(' ')}` : ''}
              </div>
            </div>
          )}
        </motion.div>

        {/* 鍒戝啿鍚堜細 */}
        {detail.鍒戝啿鍚堜細 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 p-4"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-amber-400 rounded-full" />
              鍒戝啿鍚堜細
            </h2>
            <div className="space-y-2">
              {detail.鍒戝啿鍚堜細.澶╁共 && detail.鍒戝啿鍚堜細.澶╁共.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">澶╁共锛?/span>
                  <span className="text-sm text-amber-300">{detail.鍒戝啿鍚堜細.澶╁共.join(' 路 ')}</span>
                </div>
              )}
              {detail.鍒戝啿鍚堜細.鍦版敮 && detail.鍒戝啿鍚堜細.鍦版敮.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">鍦版敮锛?/span>
                  <span className="text-sm text-amber-300">{detail.鍒戝啿鍚堜細.鍦版敮.join(' 路 ')}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI 娣卞害瑙ｈ */}
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl border border-cyan-500/20 p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              AI 娣卞害瑙ｈ
            </h2>
            
            {/* 杩愬娍璇勫垎 */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {[
                { label: '浜嬩笟', value: aiAnalysis.score?.career || 70, color: 'from-blue-500 to-cyan-500' },
                { label: '璐㈣繍', value: aiAnalysis.score?.wealth || 70, color: 'from-yellow-500 to-amber-500' },
                { label: '鎰熸儏', value: aiAnalysis.score?.love || 70, color: 'from-pink-500 to-rose-500' },
                { label: '鍋ュ悍', value: aiAnalysis.score?.health || 70, color: 'from-green-500 to-emerald-500' },
                { label: '缁煎悎', value: aiAnalysis.score?.overall || 70, color: 'from-purple-500 to-violet-500' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(item.value / 100) * 175.9} 175.9`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" className={`text-${item.color.split('-')[1]}-500`} stopColor="currentColor" />
                          <stop offset="100%" className={`text-${item.color.split('-')[3]}-500`} stopColor="currentColor" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">{item.value}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>

            {/* 璇︾粏瑙ｈ */}
            <div className="space-y-4">
              {aiAnalysis.mingZhu && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-cyan-400 font-semibold mb-2">鍛戒富鍒嗘瀽</h3>
                  <p className="text-gray-300 leading-relaxed">{aiAnalysis.mingZhu}</p>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4">
                {aiAnalysis.career && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-blue-400 font-semibold mb-2">浜嬩笟杩愬娍</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis.career}</p>
                  </div>
                )}
                
                {aiAnalysis.wealth && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-amber-400 font-semibold mb-2">璐㈣繍鍒嗘瀽</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis.wealth}</p>
                  </div>
                )}
                
                {aiAnalysis.love && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-pink-400 font-semibold mb-2">鎰熸儏濠氬Щ</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis.love}</p>
                  </div>
                )}
                
                {aiAnalysis.health && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-green-400 font-semibold mb-2">鍋ュ悍鎻愰啋</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis.health}</p>
                  </div>
                )}
              </div>
              
              {aiAnalysis.currentPeriod && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-purple-400 font-semibold mb-2">褰撳墠澶ц繍</h3>
                  <p className="text-gray-300 leading-relaxed">{aiAnalysis.currentPeriod}</p>
                </div>
              )}
              
              {aiAnalysis.thisYear && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-orange-400 font-semibold mb-2">浠婂勾娴佸勾</h3>
                  <p className="text-gray-300 leading-relaxed">{aiAnalysis.thisYear}</p>
                </div>
              )}
              
              {aiAnalysis.advice && (
                <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <h3 className="text-cyan-400 font-semibold mb-3">缁煎悎寤鸿</h3>
                  <div className="space-y-3">
                    {aiAnalysis.advice.split(/\\n|\n/).filter(line => line.trim()).map((line, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold mt-0.5">{line.match(/^\d+\./)?.[0] || `${i + 1}.`}</span>
                        <p className="text-gray-300 leading-relaxed flex-1">{line.replace(/^\d+\.\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


