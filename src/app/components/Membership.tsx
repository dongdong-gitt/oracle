'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, Users, BookOpen, MessageSquare, Check } from 'lucide-react';

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

const PLAN_COPY: Record<PlanCode, { desc: string; badge?: string; cta: string }> = {
  FREE: { desc: '体验基础功能', cta: '立即体验' },
  BASIC: { desc: '入门会员方案，先把付费闭环跑起来', cta: '购买 $29.9 会员' },
  PREMIUM: { desc: '核心主推档，适合作为主站主卖套餐', badge: '主推', cta: '购买 $199 会员' },
  VIP: { desc: '预留高阶档位，后续再细分权限', cta: '咨询 VIP' },
};

function formatPrice(plan: MembershipPlan) {
  if (plan.price <= 0) return '免费';
  return plan.currency === 'USD' ? `$${plan.price}` : `¥${plan.price}`;
}

function planFeatures(plan: MembershipPlan) {
  const extras: Record<PlanCode, string[]> = {
    FREE: ['基础命盘分析', '白皮书摘要', '公开洞察', '社区浏览'],
    BASIC: ['完整命盘解读', '基础权益解锁', '订单记录同步', '后续可扩权限'],
    PREMIUM: ['高级命盘解读', 'AI顾问深聊', '报告/记录增强', '后续高级权限预留'],
    VIP: ['高级会员全部权益', '私密顾问服务', '资源优先支持', '高阶策略能力'],
  };
  return extras[plan.code];
}

export default function Membership() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [membership, setMembership] = useState<MembershipResponse | null>(null);

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
      setError('');
      const data = await request('/api/v1/membership');
      setMembership(data);
    } catch (e: any) {
      setError(e?.message || '会员信息加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMembership();
  }, []);

  const plans = useMemo(() => {
    const realPlans = membership?.plans?.length ? membership.plans : [];
    return realPlans.filter((plan) => ['FREE', 'BASIC', 'PREMIUM'].includes(plan.code));
  }, [membership]);

  async function buy(planCode: PlanCode) {
    if (planCode === 'FREE') return;
    try {
      setSubmitting(planCode);
      setError('');
      setSuccess('');

      const order = await request('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({ membershipType: planCode, provider: 'stripe' }),
      });

      await request('/api/v1/orders', {
        method: 'PATCH',
        body: JSON.stringify({ orderId: order.id, action: 'simulate_paid', providerOrderId: `demo_${order.id}` }),
      });

      await loadMembership();
      setSuccess(`已打通购买流程：${planCode} 订单已创建并模拟支付成功。后面你把真实支付参数给我，我再把这一步替换成 Stripe/微信真实收款。`);
    } catch (e: any) {
      setError(e?.message || '购买失败');
    } finally {
      setSubmitting(null);
    }
  }

  const benefits = [
    { icon: BookOpen, title: '会员体系已接后端', desc: '订单、会员状态、后台已串起来' },
    { icon: Zap, title: '支付链路可替换', desc: '现在先模拟成功，后续切真实支付' },
    { icon: Users, title: '后台可追踪订单', desc: 'admin 可看到订单与会员到期时间' },
    { icon: MessageSquare, title: '权限可继续细分', desc: '29.9 / 199 先价格分层，权限后补' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
      <div className="text-center py-6">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ background: 'rgba(245, 158, 11, 0.1)', border: '0.5px solid rgba(245, 158, 11, 0.2)' }}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-400">会员权益</span>
        </div>
        <h1 className="text-[32px] font-semibold text-white mb-3">选择适合你的会员方案</h1>
        <p className="text-white/50">先把营收链路打通，再慢慢把权限差异拉开。慢就是快，别一口气把自己写死。</p>

        {membership && !loading && (
          <div className="mt-5 text-sm text-white/70">
            当前会员：<span className="text-cyan-300">{membership.currentPlan?.title || membership.membership}</span>
            {membership.membership !== 'FREE' && membership.membershipExpiresAt ? (
              <span className="text-white/45"> · 到期时间：{new Date(membership.membershipExpiresAt).toLocaleDateString()}</span>
            ) : null}
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl p-4 text-sm text-red-200" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-2xl p-4 text-sm text-emerald-200" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
          {success}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, i) => {
          const copy = PLAN_COPY[plan.code];
          const current = membership?.membership === plan.code;
          const popular = plan.code === 'PREMIUM';
          return (
            <motion.div
              key={plan.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl overflow-hidden ${popular ? 'ring-1 ring-cyan-400/50' : ''}`}
              style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
            >
              {(copy.badge || current) && (
                <div
                  className="absolute top-0 right-0 px-3 py-1 text-xs font-medium text-white rounded-bl-lg"
                  style={{ background: current ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                >
                  {current ? '当前方案' : copy.badge}
                </div>
              )}

              <div className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-1">{plan.title}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-semibold text-white">{formatPrice(plan)}</span>
                  <span className="text-white/40">/年</span>
                </div>
                <p className="text-white/40 text-sm mb-5">{copy.desc}</p>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {planFeatures(plan).map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/60">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={loading || submitting === plan.code || current}
                  onClick={() => buy(plan.code)}
                  className={`w-full py-3 rounded-full font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    popular ? 'text-white' : 'text-white/80 hover:text-white'
                  }`}
                  style={
                    popular
                      ? { background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }
                      : { background: 'rgba(255,255,255,0.1)' }
                  }
                >
                  {current ? '已开通' : submitting === plan.code ? '处理中...' : copy.cta}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-lg font-semibold text-white mb-6 text-center">当前已打通的链路</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="font-medium text-white mb-1">{benefit.title}</h4>
                <p className="text-xs text-white/40">{benefit.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
