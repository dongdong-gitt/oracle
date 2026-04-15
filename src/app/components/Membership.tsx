'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Crown, Zap, Users, BookOpen, MessageSquare, Check,
  Star, Shield, Sparkles, ArrowRight, TrendingUp, Eye,
} from 'lucide-react';

type PlanCode = 'FREE' | 'BASIC' | 'PREMIUM' | 'VIP';

type MembershipPlan = {
  code: PlanCode;
  title: string;
  price: number;
  currency: 'USD' | 'CNY';
  billingPeriod: 'year';
  monthlyBaziReads: number;
  monthlyAiChats: number;
  permissions: string[];
};

type MembershipResponse = {
  membership: PlanCode;
  membershipExpiresAt?: string | null;
  active: boolean;
  daysLeft: number | null;
  currentPlan: MembershipPlan;
  plans: MembershipPlan[];
};

/** 本地 fallback 方案数据，当 API 不可用时使用 */
const FALLBACK_PLANS: MembershipPlan[] = [
  {
    code: 'FREE', title: '免费版', price: 0, currency: 'USD',
    billingPeriod: 'year', monthlyBaziReads: 5, monthlyAiChats: 20,
    permissions: ['basic_bazi', 'basic_kline'],
  },
  {
    code: 'BASIC', title: '基础会员', price: 29.9, currency: 'USD',
    billingPeriod: 'year', monthlyBaziReads: 50, monthlyAiChats: 200,
    permissions: ['basic_bazi', 'kline_full', 'report_save'],
  },
  {
    code: 'PREMIUM', title: '高级会员', price: 199, currency: 'USD',
    billingPeriod: 'year', monthlyBaziReads: 300, monthlyAiChats: 1000,
    permissions: ['advanced_bazi', 'kline_full', 'report_save', 'ai_full'],
  },
];

const PLAN_META: Record<PlanCode, {
  desc: string;
  badge?: string;
  cta: string;
  icon: typeof Crown;
  gradient: string;
  glowColor: string;
}> = {
  FREE: {
    desc: '体验基础命理功能，感受命运的脉搏',
    cta: '当前方案',
    icon: Eye,
    gradient: 'from-slate-500/20 to-slate-600/10',
    glowColor: 'rgba(148, 163, 184, 0.15)',
  },
  BASIC: {
    desc: '解锁完整命盘解读与 AI 顾问',
    cta: '立即开通',
    icon: Zap,
    gradient: 'from-blue-500/20 to-indigo-600/10',
    glowColor: 'rgba(59, 130, 246, 0.15)',
  },
  PREMIUM: {
    desc: '全部高级功能 + 深度 AI 对话',
    badge: '最受欢迎',
    cta: '立即开通',
    icon: Crown,
    gradient: 'from-cyan-500/20 to-blue-600/10',
    glowColor: 'rgba(6, 182, 212, 0.2)',
  },
  VIP: {
    desc: '尊享私密顾问与优先支持服务',
    cta: '咨询定制',
    icon: Star,
    gradient: 'from-amber-500/20 to-orange-600/10',
    glowColor: 'rgba(245, 158, 11, 0.15)',
  },
};

function planFeatures(plan: MembershipPlan): { text: string; highlight?: boolean }[] {
  const features: Record<PlanCode, { text: string; highlight?: boolean }[]> = {
    FREE: [
      { text: `每月 ${plan.monthlyBaziReads} 次命盘分析` },
      { text: `每月 ${plan.monthlyAiChats} 次 AI 对话` },
      { text: '基础五行分析' },
      { text: '每日运势速览' },
    ],
    BASIC: [
      { text: `每月 ${plan.monthlyBaziReads} 次命盘分析`, highlight: true },
      { text: `每月 ${plan.monthlyAiChats} 次 AI 对话`, highlight: true },
      { text: '完整人生K线图' },
      { text: '测算记录云存档' },
      { text: '大运流年详解' },
    ],
    PREMIUM: [
      { text: `每月 ${plan.monthlyBaziReads} 次命盘分析`, highlight: true },
      { text: `每月 ${plan.monthlyAiChats} 次 AI 深度对话`, highlight: true },
      { text: '高级报告生成与导出' },
      { text: 'AI 顾问全功能解锁' },
      { text: '商业战略 + 金融周期' },
      { text: '优先客服支持' },
    ],
    VIP: [
      { text: '不限次数命盘分析', highlight: true },
      { text: '不限次数 AI 对话', highlight: true },
      { text: '高级会员全部权益' },
      { text: '私密顾问 1v1 服务' },
      { text: '专属策略定制' },
      { text: '最高优先级支持' },
    ],
  };
  return features[plan.code];
}

function formatPrice(plan: MembershipPlan) {
  if (plan.price <= 0) return '免费';
  return plan.currency === 'USD' ? `$${plan.price}` : `¥${plan.price}`;
}

/** 价格拆分显示 */
function PriceDisplay({ plan }: { plan: MembershipPlan }) {
  if (plan.price <= 0) {
    return (
      <div className="mb-4">
        <span className="text-4xl font-bold bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent">
          免费
        </span>
      </div>
    );
  }
  const monthlyPrice = (plan.price / 12).toFixed(1);
  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-1">
        <span className="text-lg text-white/40">$</span>
        <span className="text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          {plan.price}
        </span>
        <span className="text-white/40 text-sm ml-1">/年</span>
      </div>
      <p className="text-xs text-white/30 mt-1">约 ${monthlyPrice}/月</p>
    </div>
  );
}

export default function Membership() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [membership, setMembership] = useState<MembershipResponse | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  async function request(path: string, init?: RequestInit) {
    const res = await fetch(path, {
      ...init,
      headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
      credentials: 'include',
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.success === false) {
      throw new Error(body?.error || `Request failed: ${res.status}`);
    }
    return body?.data ?? body;
  }

  async function loadMembership() {
    try {
      setLoading(true);
      const data = await request('/api/v1/membership');
      setMembership(data);
    } catch {
      // API 不可用时不显示错误，使用 fallback 数据
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMembership();
  }, []);

  // 优先使用 API 数据，fallback 到本地数据
  const plans = useMemo(() => {
    const apiPlans = membership?.plans?.length ? membership.plans : [];
    const source = apiPlans.length > 0 ? apiPlans : FALLBACK_PLANS;
    return source.filter((plan) => ['FREE', 'BASIC', 'PREMIUM'].includes(plan.code));
  }, [membership]);

  const currentMembership = membership?.membership || 'FREE';

  async function buy(planCode: PlanCode) {
    if (planCode === 'FREE') return;
    try {
      setSubmitting(planCode);
      setError('');
      setSuccess('');

      const result = await request('/api/v1/checkout', {
        method: 'POST',
        body: JSON.stringify({ membershipType: planCode }),
      });

      if (result.checkoutUrl && !result.checkoutUrl.includes('payment=success')) {
        window.location.href = result.checkoutUrl;
        return;
      }

      await request('/api/v1/orders', {
        method: 'PATCH',
        body: JSON.stringify({
          orderId: result.orderId,
          action: 'simulate_paid',
          providerOrderId: `demo_${result.orderId}`,
        }),
      });

      await loadMembership();
      setSuccess(`恭喜! ${planCode} 会员已成功开通，您现在可以享受全部会员权益。`);
    } catch (e: any) {
      setError(e?.message || '购买失败，请稍后重试');
    } finally {
      setSubmitting(null);
    }
  }

  const stats = [
    { value: '10,000+', label: '命理分析完成', icon: TrendingUp },
    { value: '98%', label: '用户好评率', icon: Star },
    { value: '24/7', label: 'AI 顾问在线', icon: Sparkles },
    { value: '256-bit', label: '数据加密保护', icon: Shield },
  ];

  const benefits = [
    { icon: BookOpen, title: '专业命理解读', desc: '基于权威八字算法的深度分析', color: 'from-blue-500 to-indigo-500' },
    { icon: Zap, title: 'AI 智能顾问', desc: '随时对话，获得个性化命理建议', color: 'from-cyan-500 to-blue-500' },
    { icon: Users, title: '人生K线图', desc: '可视化你的事业、财运、感情走势', color: 'from-purple-500 to-pink-500' },
    { icon: MessageSquare, title: '专属报告存档', desc: '所有测算记录安全存储，随时回看', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Header */}
      <div className="text-center py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.08))',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)',
          }}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-300">会员权益</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
        >
          解锁你的
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {' '}命运洞察力
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/45 text-lg max-w-xl mx-auto"
        >
          选择适合你的方案，获得更深层次的命理解读与 AI 智能顾问服务
        </motion.p>

        {membership && !loading && currentMembership !== 'FREE' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-full"
            style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)' }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-emerald-300">
              当前：{membership.currentPlan?.title || currentMembership}
              {membership.membershipExpiresAt && (
                <span className="text-white/40 ml-2">
                  到期：{new Date(membership.membershipExpiresAt).toLocaleDateString()}
                </span>
              )}
            </span>
          </motion.div>
        )}
      </div>

      {/* Error / Success */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 text-sm text-red-200 flex items-center gap-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <span className="text-red-400 text-lg">!</span>
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 text-sm text-emerald-200 flex items-center gap-3"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <Sparkles className="w-5 h-5 text-emerald-400" />
          {success}
        </motion.div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const meta = PLAN_META[plan.code];
          const Icon = meta.icon;
          const current = currentMembership === plan.code;
          const popular = plan.code === 'PREMIUM';
          const isHovered = hoveredPlan === plan.code;
          const features = planFeatures(plan);

          return (
            <motion.div
              key={plan.code}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
              onMouseEnter={() => setHoveredPlan(plan.code)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${
                popular ? 'md:-mt-4 md:mb-4' : ''
              }`}
              style={{
                background: isHovered
                  ? `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`
                  : `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`,
                border: popular
                  ? '1px solid rgba(6, 182, 212, 0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
                boxShadow: popular
                  ? '0 0 40px rgba(6, 182, 212, 0.1), 0 20px 60px rgba(0,0,0,0.3)'
                  : isHovered
                    ? '0 20px 60px rgba(0,0,0,0.3)'
                    : '0 4px 20px rgba(0,0,0,0.1)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              {/* Popular badge */}
              {meta.badge && (
                <div
                  className="absolute top-0 left-0 right-0 py-2 text-center text-xs font-semibold tracking-wider uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  {meta.badge}
                </div>
              )}

              {/* Current badge */}
              {current && !meta.badge && (
                <div
                  className="absolute top-0 left-0 right-0 py-2 text-center text-xs font-semibold tracking-wider"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  当前方案
                </div>
              )}

              <div className={`p-8 h-full flex flex-col ${meta.badge || current ? 'pt-14' : ''}`}>
                {/* Plan icon + title */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}
                    style={{ boxShadow: `0 4px 15px ${meta.glowColor}` }}
                  >
                    <Icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                    <p className="text-xs text-white/35">{meta.desc}</p>
                  </div>
                </div>

                {/* Price */}
                <PriceDisplay plan={plan} />

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 + j * 0.05 }}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        feature.highlight ? 'bg-cyan-500/20' : 'bg-white/5'
                      }`}>
                        <Check className={`w-3 h-3 ${feature.highlight ? 'text-cyan-400' : 'text-white/40'}`} />
                      </div>
                      <span className={feature.highlight ? 'text-white/80 font-medium' : 'text-white/50'}>
                        {feature.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading || submitting === plan.code || current || plan.code === 'FREE'}
                  onClick={() => buy(plan.code)}
                  className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    current || plan.code === 'FREE'
                      ? 'bg-white/5 text-white/30 cursor-default'
                      : popular
                        ? 'text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30'
                        : 'text-white/80 hover:text-white bg-white/10 hover:bg-white/15'
                  }`}
                  style={
                    popular && !current
                      ? { background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }
                      : undefined
                  }
                >
                  {current ? (
                    '当前方案'
                  ) : submitting === plan.code ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      处理中...
                    </>
                  ) : plan.code === 'FREE' ? (
                    '免费使用中'
                  ) : (
                    <>
                      {meta.cta}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="text-center p-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <Icon className="w-5 h-5 text-cyan-400/60 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-white/35">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Benefits */}
      <div
        className="p-8 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h3 className="text-xl font-bold text-white mb-2 text-center">会员专属权益</h3>
        <p className="text-white/35 text-sm text-center mb-8">升级会员，解锁以下全部高级功能</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="text-center p-6 rounded-2xl cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div
                  className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4`}
                  style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-1.5">{benefit.title}</h4>
                <p className="text-xs text-white/40 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FAQ teaser */}
      <div className="text-center py-4">
        <p className="text-white/25 text-sm">
          有疑问？随时通过 AI 顾问对话框咨询我们
        </p>
      </div>
    </motion.div>
  );
}
