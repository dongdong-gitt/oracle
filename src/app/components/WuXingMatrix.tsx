'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Compass, Gem, Sparkles, Target } from 'lucide-react';
import { useUser } from '../context/UserContext';

type ElementName = '金' | '木' | '水' | '火' | '土';

interface ElementMeta {
  label: ElementName;
  icon: string;
  aliases: string[];
  colorClass: string;
  glowClass: string;
  gradientClass: string;
  position: { x: number; y: number };
}

interface ElementStat extends ElementMeta {
  value: number;
  percent: number;
}

interface WuXingAnalysis {
  pattern: string;
  patternDesc: string;
  strength: string;
  usefulElements: string[];
  luckyColors: string[];
  luckyDirections: string[];
  luckyNumbers: string[];
  industries: string[];
  tips: string[];
}

const ELEMENT_ORDER: ElementName[] = ['木', '火', '土', '金', '水'];

const ELEMENT_META: Record<ElementName, ElementMeta> = {
  金: {
    label: '金',
    icon: '锋',
    aliases: ['金', 'metal', 'jin', '閲'],
    colorClass: 'text-amber-300',
    glowClass: 'shadow-amber-500/30',
    gradientClass: 'from-amber-300 to-yellow-500',
    position: { x: 80, y: 48 },
  },
  木: {
    label: '木',
    icon: '生',
    aliases: ['木', 'wood', 'mu', '鏈'],
    colorClass: 'text-emerald-300',
    glowClass: 'shadow-emerald-500/30',
    gradientClass: 'from-emerald-300 to-green-500',
    position: { x: 20, y: 48 },
  },
  水: {
    label: '水',
    icon: '润',
    aliases: ['水', 'water', 'shui', '姘'],
    colorClass: 'text-sky-300',
    glowClass: 'shadow-sky-500/30',
    gradientClass: 'from-sky-300 to-blue-500',
    position: { x: 50, y: 82 },
  },
  火: {
    label: '火',
    icon: '曜',
    aliases: ['火', 'fire', 'huo', '鐏'],
    colorClass: 'text-rose-300',
    glowClass: 'shadow-rose-500/30',
    gradientClass: 'from-orange-300 to-rose-500',
    position: { x: 50, y: 14 },
  },
  土: {
    label: '土',
    icon: '稳',
    aliases: ['土', 'earth', 'tu', '鍦'],
    colorClass: 'text-yellow-300',
    glowClass: 'shadow-yellow-500/30',
    gradientClass: 'from-yellow-300 to-amber-600',
    position: { x: 66, y: 66 },
  },
};

const KE_MAP: Record<ElementName, ElementName> = {
  木: '土',
  火: '金',
  土: '水',
  金: '木',
  水: '火',
};

const DEFAULT_COUNTS: Record<ElementName, number> = {
  金: 2,
  木: 2,
  水: 2,
  火: 2,
  土: 2,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function findByAliases(source: unknown, aliases: string[], depth = 0): unknown {
  if (!isRecord(source) || depth > 3) return undefined;

  const loweredAliases = aliases.map((alias) => alias.toLowerCase());

  for (const [key, value] of Object.entries(source)) {
    const loweredKey = key.toLowerCase();
    if (loweredAliases.some((alias) => loweredKey.includes(alias))) {
      return value;
    }
  }

  for (const value of Object.values(source)) {
    const found = findByAliases(value, aliases, depth + 1);
    if (typeof found !== 'undefined') {
      return found;
    }
  }

  return undefined;
}

function toTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[，,、\n/]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function readWuXingCounts(detail: unknown): Record<ElementName, number> {
  if (!isRecord(detail)) return DEFAULT_COUNTS;

  const wuxingBlock = findByAliases(detail, ['五行统计', '五行分布', '五行', 'wuxing', 'wu_xing', '浜旇']) ?? detail;
  const source = isRecord(wuxingBlock) ? wuxingBlock : detail;

  const result = { ...DEFAULT_COUNTS };

  (Object.keys(ELEMENT_META) as ElementName[]).forEach((element) => {
    const value = findByAliases(source, ELEMENT_META[element].aliases);
    const parsed = toFiniteNumber(value);
    if (typeof parsed === 'number') {
      result[element] = Math.max(0, parsed);
    }
  });

  const total = Object.values(result).reduce((sum, value) => sum + value, 0);
  return total > 0 ? result : DEFAULT_COUNTS;
}

function buildLocalTips(sorted: ElementStat[]): string[] {
  const dominant = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return [
    `主线优先：当前${dominant.label}最强，做事先聚焦一个可长期复利的方向，再向外扩展资源。`,
    `节奏管理：${weakest.label}偏弱时，最怕频繁切换，建议按“周计划-日执行-周复盘”固定节奏推进。`,
    '现金流纪律：预算先于投入，每次决策先设止损边界，再决定仓位和执行力度。',
    '关系协同：合作对象优先选稳健型与执行型，避免口头承诺多、落地动作少的搭档。',
    '体能底盘：把睡眠和运动当作硬指标管理，优先稳定作息，再追求阶段性冲刺。',
    '年度策略：先守住确定性收益，再做增量突破，避免为了速度牺牲长期结构。',
  ];
}

function normalizeAnalysis(payload: unknown, fallbackTips: string[]): WuXingAnalysis {
  const source = isRecord(payload) ? payload : {};

  const tipsFromApi = toTextArray(
    findByAliases(source, ['开运建议', '综合建议', '建议', 'tips', 'strategy', '寮€杩愬缓璁'])
  );

  return {
    pattern: String(
      findByAliases(source, ['pattern', '格局', '命局', 'patternName', '鏍煎眬']) ?? '平衡修正格'
    ),
    patternDesc: String(
      findByAliases(source, ['patternDesc', '格局描述', '说明', 'desc', '鎻忚堪']) ??
        '命局总体呈现阶段性起伏，核心策略是“先稳结构，再加杠杆”，用连续执行替代一次性激进。'
    ),
    strength: String(findByAliases(source, ['strength', '日主强弱', '强弱', '韬急']) ?? '中和偏弱'),
    usefulElements: toTextArray(findByAliases(source, ['喜用神', '有利五行', '鍠滅敤']))
      .slice(0, 3),
    luckyColors: toTextArray(findByAliases(source, ['幸运颜色', '颜色', '骞歌繍棰滆壊']))
      .slice(0, 4),
    luckyDirections: toTextArray(findByAliases(source, ['幸运方位', '方位', '骞歌繍鏂逛綅']))
      .slice(0, 4),
    luckyNumbers: toTextArray(findByAliases(source, ['幸运数字', '数字', '骞歌繍鏁板瓧']))
      .slice(0, 4),
    industries: toTextArray(findByAliases(source, ['适合行业', '行业', '閫傚悎琛屼笟']))
      .slice(0, 8),
    tips: [...tipsFromApi.filter((tip) => tip.length >= 12), ...fallbackTips].slice(0, 6),
  };
}

function isLikelyColorToken(value: string): boolean {
  const token = value.trim().toLowerCase();
  return token.startsWith('#') || token.startsWith('rgb') || token.startsWith('hsl');
}

export default function WuXingMatrix() {
  const { baziResult } = useUser();
  const detail = isRecord(baziResult) && isRecord(baziResult.detail) ? baziResult.detail : undefined;

  const rawCounts = useMemo(() => readWuXingCounts(detail), [detail]);
  const stats = useMemo<ElementStat[]>(() => {
    const total = Object.values(rawCounts).reduce((sum, value) => sum + value, 0) || 1;
    return (Object.keys(ELEMENT_META) as ElementName[]).map((name) => ({
      ...ELEMENT_META[name],
      value: rawCounts[name],
      percent: Math.round((rawCounts[name] / total) * 100),
    }));
  }, [rawCounts]);

  const sortedStats = useMemo(() => [...stats].sort((a, b) => b.percent - a.percent), [stats]);
  const dominant = sortedStats[0];
  const weakest = sortedStats[sortedStats.length - 1];

  const balanceScore = useMemo(() => {
    const avg = stats.reduce((sum, item) => sum + item.value, 0) / stats.length || 1;
    const variance = stats.reduce((sum, item) => sum + (item.value - avg) ** 2, 0) / stats.length;
    const deviationRatio = Math.sqrt(variance) / avg;
    const score = Math.round(100 - deviationRatio * 65);
    return Math.max(20, Math.min(99, score));
  }, [stats]);

  const localTips = useMemo(() => buildLocalTips(sortedStats), [sortedStats]);

  const [analysis, setAnalysis] = useState<WuXingAnalysis>(() => normalizeAnalysis(undefined, localTips));
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState<ElementName | null>(null);

  const signature = `${rawCounts.金}-${rawCounts.木}-${rawCounts.水}-${rawCounts.火}-${rawCounts.土}`;
  const tipsSignature = localTips.join('|');
  const baziText = String(findByAliases(detail, ['八字', 'bazi', '鍏瓧']) ?? '');
  const dayMaster = String(findByAliases(detail, ['日主', 'riZhu', 'dayMaster', '鏃ヤ富']) ?? '');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const response = await fetch('/api/wuxing/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wuxing: rawCounts,
            bazi: baziText || '未知八字',
            riZhu: dayMaster || dominant.label,
          }),
        });

        const json = await response.json();
        if (!cancelled) {
          setAnalysis(normalizeAnalysis(json?.data, localTips));
        }
      } catch (error) {
        if (!cancelled) {
          console.error('五行分析失败:', error);
          setAnalysis(normalizeAnalysis(undefined, localTips));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [signature, tipsSignature, baziText, dayMaster]);

  if (!detail) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl border border-cyan-400/20 bg-[#11162c]/80 p-8 text-center">
          <h2 className="text-2xl font-bold text-cyan-300">五行命盘</h2>
          <p className="mt-3 text-gray-300">先填写出生信息并完成命盘分析，这里会展示五行结构与行动建议。</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl space-y-6 px-4 pb-12 md:px-6"
    >
      <section className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#141a34] via-[#10172e] to-[#0b1021] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Five Elements Studio
            </div>
            <h2 className="mt-3 text-3xl font-bold text-white">五行命盘升级版</h2>
            <p className="mt-2 text-sm text-gray-300">能量结构 + 生克关系 + 可执行建议，一屏看清主线。</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <div className="text-xs text-gray-400">结构平衡分</div>
            <div className="text-2xl font-semibold text-cyan-300">{balanceScore}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
            <p className="text-xs text-emerald-200/80">主导元素</p>
            <p className="mt-1 text-xl font-bold text-emerald-200">{dominant.label}</p>
            <p className="mt-1 text-sm text-emerald-100/80">占比 {dominant.percent}%</p>
          </div>
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
            <p className="text-xs text-amber-200/80">待补元素</p>
            <p className="mt-1 text-xl font-bold text-amber-200">{weakest.label}</p>
            <p className="mt-1 text-sm text-amber-100/80">占比 {weakest.percent}%</p>
          </div>
          <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4">
            <p className="text-xs text-violet-200/80">命局强弱</p>
            <p className="mt-1 text-xl font-bold text-violet-200">{analysis.strength}</p>
            <p className="mt-1 text-sm text-violet-100/80">{analysis.pattern}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <section className="rounded-3xl border border-white/10 bg-[#0f1428]/80 p-5 md:p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Activity className="h-5 w-5 text-yellow-300" />
            五行能量图
          </h3>

          <div className="relative mx-auto mt-6 aspect-square max-w-[440px]">
            <div className="absolute inset-[9%] rounded-full border border-white/10" />
            <div className="absolute inset-[24%] rounded-full border border-white/10" />
            <div className="absolute inset-[40%] rounded-full border border-white/10" />

            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
              {ELEMENT_ORDER.map((from) => {
                const to = ELEMENT_ORDER[(ELEMENT_ORDER.indexOf(from) + 1) % ELEMENT_ORDER.length];
                const p1 = ELEMENT_META[from].position;
                const p2 = ELEMENT_META[to].position;
                return (
                  <line
                    key={`sheng-${from}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="rgba(74, 222, 128, 0.5)"
                    strokeWidth="0.5"
                  />
                );
              })}
              {(Object.keys(KE_MAP) as ElementName[]).map((from) => {
                const to = KE_MAP[from];
                const p1 = ELEMENT_META[from].position;
                const p2 = ELEMENT_META[to].position;
                return (
                  <line
                    key={`ke-${from}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="rgba(251, 113, 133, 0.4)"
                    strokeWidth="0.45"
                    strokeDasharray="1.2 1.2"
                  />
                );
              })}
            </svg>

            {stats.map((item) => {
              const active = hovered === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${item.position.x}%`, top: `${item.position.y}%` }}
                  onMouseEnter={() => setHovered(item.label)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border border-white/30 bg-[#0e1323] shadow-lg transition-transform ${
                      active ? 'scale-110' : 'scale-100'
                    } ${item.glowClass}`}
                  >
                    <span className={`text-xs ${item.colorClass}`}>{item.icon}</span>
                    <span className={`text-lg font-bold ${item.colorClass}`}>{item.label}</span>
                    <span className="text-[11px] text-white/80">{item.percent}%</span>
                  </div>
                </button>
              );
            })}

            <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10 text-center">
              <div>
                <div className="text-xs text-cyan-200/70">命局重心</div>
                <div className="text-base font-semibold text-cyan-100">{dominant.label}主导</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              绿色实线: 相生链路
            </span>
            <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-rose-200">
              红色虚线: 相克约束
            </span>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#121931]/80 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Gem className="h-5 w-5 text-cyan-300" />
              能量梯度
            </h3>
            <div className="mt-4 space-y-3">
              {sortedStats.map((item) => (
                <div key={`bar-${item.label}`} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${item.colorClass}`}>{item.label}系</span>
                    <span className="text-gray-200">
                      {item.value} / {item.percent}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full bg-gradient-to-r ${item.gradientClass}`}
                      style={{ width: `${Math.max(item.percent, 6)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-[#131e39]/80 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-cyan-200">
              <Target className="h-5 w-5" />
              执行建议
            </h3>
            <ul className="mt-3 space-y-2.5">
              {analysis.tips.map((tip, index) => (
                <li key={`tip-${index}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-200">
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/25 text-xs text-cyan-200">
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-violet-400/20 bg-[#171937]/80 p-5">
          <h3 className="text-lg font-semibold text-violet-200">格局解读</h3>
          <p className="mt-2 text-sm leading-7 text-gray-200">{analysis.patternDesc}</p>
        </section>

        <section className="rounded-3xl border border-sky-400/20 bg-[#0f1b33]/80 p-5">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-sky-200">
            <Compass className="h-5 w-5" />
            幸运参数
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-gray-400">喜用神</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(analysis.usefulElements.length > 0 ? analysis.usefulElements : ['土', '金']).map((item, index) => (
                  <span key={`useful-${item}-${index}`} className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-2.5 py-1 text-xs text-cyan-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-gray-400">幸运方位</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(analysis.luckyDirections.length > 0 ? analysis.luckyDirections : ['东南', '正西']).map((item, index) => (
                  <span key={`dir-${item}-${index}`} className="rounded-full border border-violet-400/30 bg-violet-500/15 px-2.5 py-1 text-xs text-violet-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-gray-400">幸运颜色</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(analysis.luckyColors.length > 0 ? analysis.luckyColors : ['#D6A850', '#3EA6FF']).map((item, index) => (
                  <span key={`color-${item}-${index}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-gray-100">
                    {isLikelyColorToken(item) && <span className="h-2.5 w-2.5 rounded-full border border-white/20" style={{ backgroundColor: item }} />}
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-gray-400">适配行业</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(analysis.industries.length > 0 ? analysis.industries : ['咨询', '运营', '管理']).slice(0, 6).map((item, index) => (
                  <span key={`industry-${item}-${index}`} className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            幸运数字: {(analysis.luckyNumbers.length > 0 ? analysis.luckyNumbers : ['3', '6', '8']).join(' / ')}
          </div>
        </section>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
          正在同步 AI 五行解读，若接口异常将自动使用本地策略建议。
        </div>
      )}
    </motion.div>
  );
}
