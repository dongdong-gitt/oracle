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
      性别: string;
      阳历: string;
      农历: string;
      八字: string;
      生肖: string;
      日主: string;
      年柱: any;
      月柱: any;
      日柱: any;
      时柱: any;
      胎元: string;
      命宫: string;
      身宫: string;
      神煞: {
        年柱: string[];
        月柱: string[];
        日柱: string[];
        时柱: string[];
      };
      大运: {
        起运日期: string;
        起运年龄: number;
        大运: Array<{
          age: number;
          ganZhi: string;
          大运名称?: string;
          开始年份: number;
          结束年份: number;
          天干十神?: string;
          地支十神?: string[];
        }>;
      };
      刑冲合会?: {
        天干?: string[];
        地支?: string[];
      };
      五行统计?: {
        金: number;
        木: number;
        水: number;
        火: number;
        土: number;
      };
      真太阳时?: {
        日期: string;
        时间: string;
      };
      出生节气?: {
        节气名: string;
        节气日期: string;
        距离天数: number;
        描述: string;
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

// 五行颜色
const WUXING_COLORS: Record<string, string> = {
  '木': 'text-green-400',
  '火': 'text-red-400',
  '土': 'text-yellow-400',
  '金': 'text-amber-300',
  '水': 'text-blue-400',
};

// 十神颜色
const SHISHEN_COLORS: Record<string, string> = {
  '比肩': 'text-gray-300',
  '劫财': 'text-gray-400',
  '食神': 'text-green-300',
  '伤官': 'text-green-400',
  '偏财': 'text-yellow-300',
  '正财': 'text-yellow-400',
  '七杀': 'text-red-400',
  '正官': 'text-red-300',
  '偏印': 'text-blue-300',
  '正印': 'text-blue-400',
};

// 五行颜色
const WUXING_BG_COLORS: Record<string, string> = {
  '金': 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  '木': 'bg-green-400/20 text-green-300 border-green-400/30',
  '水': 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  '火': 'bg-red-400/20 text-red-300 border-red-400/30',
  '土': 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
};

// 五行统计组件
function WuXingStats({ stats }: { stats?: Record<string, number> }) {
  if (!stats) return null;
  const items = [
    { name: '金', count: stats.金, color: 'from-amber-400 to-yellow-500' },
    { name: '木', count: stats.木, color: 'from-green-400 to-emerald-500' },
    { name: '水', count: stats.水, color: 'from-blue-400 to-cyan-500' },
    { name: '火', count: stats.火, color: 'from-red-400 to-orange-500' },
    { name: '土', count: stats.土, color: 'from-yellow-400 to-amber-500' },
  ];
  const maxCount = Math.max(...items.map(i => i.count), 1);

  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map((item) => (
        <div key={item.name} className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-1">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke={`url(#wx-${item.name})`}
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(item.count / maxCount) * 125.6} 125.6`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id={`wx-${item.name}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={item.color.includes('amber') ? '#fbbf24' : item.color.includes('green') ? '#4ade80' : item.color.includes('blue') ? '#60a5fa' : item.color.includes('red') ? '#f87171' : '#facc15'} />
                  <stop offset="100%" stopColor={item.color.includes('amber') ? '#f59e0b' : item.color.includes('green') ? '#10b981' : item.color.includes('blue') ? '#06b6d4' : item.color.includes('red') ? '#f97316' : '#d97706'} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{item.name}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">{item.count}个</div>
        </div>
      ))}
    </div>
  );
}

export default function BaZiPan({ data, birthData }: BaziPanProps) {
  const { detail, aiAnalysis } = data;
  const { clearData } = useUser();
  
  const pillars = [
    { name: '年柱', key: '年柱', position: '年' },
    { name: '月柱', key: '月柱', position: '月' },
    { name: '日柱', key: '日柱', position: '日' },
    { name: '时柱', key: '时柱', position: '时' },
  ];

  // 计算当前大运
  const currentYear = new Date().getFullYear();
  const currentDaYun = detail.大运.大运.find(d => 
    d.开始年份 <= currentYear && d.结束 >= currentYear
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-20">
      {/* 头部信息 */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <User className="w-6 h-6 text-cyan-400" />
                {birthData.name || '命主'} 的命盘
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {birthData.gender === 'male' ? '乾造' : '坤造'} · {birthData.birthDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {birthData.birthTime}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {birthData.birthPlace}
                </span>
              </div>
              {/* 真太阳时和节气信息 */}
              <div className="flex flex-wrap gap-4 text-xs">
                {detail.真太阳时 && (
                  <span className="flex items-center gap-1 text-cyan-400/80 bg-cyan-400/10 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" />
                    真太阳时: {detail.真太阳时.日期} {detail.真太阳时.时间}
                  </span>
                )}
                {detail.出生节气 && (
                  <span className="flex items-center gap-1 text-amber-400/80 bg-amber-400/10 px-2 py-1 rounded">
                    <Sparkles className="w-3 h-3" />
                    {detail.出生节气.描述}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">日主</div>
              <div className="text-3xl font-bold text-cyan-400">{detail.日主}</div>
              <div className="text-sm text-gray-500">{detail.生肖}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* 八字命盘表格 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-5 bg-cyan-400 rounded-full" />
              八字命盘
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-3 text-left text-sm text-gray-400 font-normal">柱位</th>
                  {pillars.map(p => (
                    <th key={p.key} className="p-3 text-center text-sm text-gray-400 font-normal">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* 天干十神 */}
                <tr>
                  <td className="p-3 text-sm text-gray-500">干神</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const shishen = pillar?.天干?.十神 || (p.key === '日柱' ? '日主' : '');
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <span className={`text-sm ${SHISHEN_COLORS[shishen] || 'text-gray-300'}`}>
                          {shishen}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 天干 */}
                <tr className="bg-white/[0.02]">
                  <td className="p-3 text-sm text-gray-500">天干</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const gan = pillar?.天干?.天干;
                    const wuxing = pillar?.天干?.五行;
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <span className={`text-2xl font-bold ${WUXING_COLORS[wuxing] || 'text-white'}`}>
                          {gan}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 地支 */}
                <tr>
                  <td className="p-3 text-sm text-gray-500">地支</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const zhi = pillar?.地支?.地支;
                    const wuxing = pillar?.地支?.五行;
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <span className={`text-2xl font-bold ${WUXING_COLORS[wuxing] || 'text-white'}`}>
                          {zhi}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 藏干 */}
                <tr className="bg-white/[0.02]">
                  <td className="p-3 text-sm text-gray-500 align-top">藏干</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const canggan = pillar?.地支?.藏干;
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <div className="space-y-1">
                          {canggan?.主气 && (
                            <div className={`text-xs ${WUXING_COLORS[canggan.主气.天干 === '甲' || canggan.主气.天干 === '乙' ? '木' : canggan.主气.天干 === '丙' || canggan.主气.天干 === '丁' ? '火' : canggan.主气.天干 === '戊' || canggan.主气.天干 === '己' ? '土' : canggan.主气.天干 === '庚' || canggan.主气.天干 === '辛' ? '金' : '水'] || 'text-gray-300'}`}>
                              {canggan.主气.天干}·{canggan.主气.十神}
                            </div>
                          )}
                          {canggan?.中气 && (
                            <div className="text-xs text-gray-400">
                              {canggan.中气.天干}·{canggan.中气.十神}
                            </div>
                          )}
                          {canggan?.余气 && (
                            <div className="text-xs text-gray-500">
                              {canggan.余气.天干}·{canggan.余气.十神}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 纳音 */}
                <tr>
                  <td className="p-3 text-sm text-gray-500">纳音</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const nayin = pillar?.纳音;
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <span className="text-xs text-amber-400">{nayin}</span>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 空亡 */}
                <tr className="bg-white/[0.02]">
                  <td className="p-3 text-sm text-gray-500">空亡</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const kongwang = pillar?.空亡;
                    return (
                      <td key={p.key} className="p-3 text-center">
                        <span className="text-xs text-gray-400">{kongwang}</span>
                      </td>
                    );
                  })}
                </tr>
                
                {/* 地势（十二长生） */}
                <tr>
                  <td className="p-3 text-sm text-gray-500">地势</td>
                  {pillars.map(p => {
                    const pillar = detail[p.key as keyof typeof detail] as any;
                    const xingyun = pillar?.星运;
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

        {/* 神煞 */}
        {detail.神煞 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 p-4"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-400 rounded-full" />
              神煞
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(detail.神煞).map(([key, gods]) => (
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

        {/* 五行统计 */}
        {detail.五行统计 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 p-4"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-400 rounded-full" />
              五行分布
            </h2>
            <WuXingStats stats={detail.五行统计} />
          </motion.div>
        )}

        {/* 大运 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 p-4"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-400 rounded-full" />
            大运走势
            <span className="text-sm text-gray-500 font-normal">
              （起运时间：{detail.大运.起运日期}，{detail.大运.起运年龄}岁起运）
            </span>
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {detail.大运.大运.slice(0, 8).map((dy, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-24 p-3 rounded-xl text-center ${
                  dy.开始年份 <= currentYear && dy.结束年份 >= currentYear
                    ? 'bg-cyan-500/20 border border-cyan-500/50'
                    : 'bg-white/5'
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">{dy.age}岁</div>
                <div className="text-base font-bold text-white">{dy.大运名称 || `${dy.ganZhi}大运`}</div>
                <div className="text-xs text-gray-400">{dy.开始年份}-{dy.结束年份}</div>
              </div>
            ))}
          </div>
          {currentDaYun && (
            <div className="mt-4 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <div className="text-sm text-cyan-400 mb-1">当前大运</div>
              <div className="text-lg font-bold">{currentDaYun.大运名称 || `${currentDaYun.ganZhi}大运`}</div>
              <div className="text-sm text-gray-400">
                {currentDaYun.天干十神 || ''} {currentDaYun.地支十神 ? `· ${currentDaYun.地支十神.join(' ')}` : ''}
              </div>
            </div>
          )}
        </motion.div>

        {/* 刑冲合会 */}
        {detail.刑冲合会 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1a2e]/50 rounded-2xl border border-white/10 p-4"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-amber-400 rounded-full" />
              刑冲合会
            </h2>
            <div className="space-y-2">
              {detail.刑冲合会.天干 && detail.刑冲合会.天干.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">天干：</span>
                  <span className="text-sm text-amber-300">{detail.刑冲合会.天干.join(' · ')}</span>
                </div>
              )}
              {detail.刑冲合会.地支 && detail.刑冲合会.地支.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">地支：</span>
                  <span className="text-sm text-amber-300">{detail.刑冲合会.地支.join(' · ')}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI 深度解读 */}
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl border border-cyan-500/20 p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              AI 深度解读
            </h2>
            
            {/* 运势评分 */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {[
                { label: '事业', value: aiAnalysis.score?.career || 70, color: 'from-blue-500 to-cyan-500' },
                { label: '财运', value: aiAnalysis.score?.wealth || 70, color: 'from-yellow-500 to-amber-500' },
                { label: '感情', value: aiAnalysis.score?.love || 70, color: 'from-pink-500 to-rose-500' },
                { label: '健康', value: aiAnalysis.score?.health || 70, color: 'from-green-500 to-emerald-500' },
                { label: '综合', value: aiAnalysis.score?.overall || 70, color: 'from-purple-500 to-violet-500' },
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

            {/* 详细解读 */}
            <div className="space-y-4">
              {aiAnalysis.mingZhu && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-cyan-400 font-semibold mb-2">命主分析</h3>
                  <p className="text-gray-300 leading-relaxed">{aiAnalysis.mingZhu}</p>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4">
                {aiAnalysis.career && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-blue-400 font-semibold mb-2">事业运势</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis.career}</p>
                  </div>
                )}
                
                {aiAnalysis.wealth && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-amber-400 font-semibold mb-2">财运分析</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis.wealth}</p>
                  </div>
                )}
                
                {aiAnalysis.love && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-pink-400 font-semibold mb-2">感情婚姻</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis.love}</p>
                  </div>
                )}
                
                {aiAnalysis.health && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-green-400 font-semibold mb-2">健康提醒</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis.health}</p>
                  </div>
                )}
              </div>
              
              {aiAnalysis.currentPeriod && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-purple-400 font-semibold mb-2">当前大运</h3>
                  <p className="text-gray-300 leading-relaxed">{aiAnalysis.currentPeriod}</p>
                </div>
              )}
              
              {aiAnalysis.thisYear && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-orange-400 font-semibold mb-2">今年流年</h3>
                  <p className="text-gray-300 leading-relaxed">{aiAnalysis.thisYear}</p>
                </div>
              )}
              
              {aiAnalysis.advice && (
                <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <h3 className="text-cyan-400 font-semibold mb-3">综合建议</h3>
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
