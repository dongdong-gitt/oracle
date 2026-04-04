export type MembershipTier = 'FREE' | 'BASIC' | 'PREMIUM' | 'VIP';

export interface MembershipPlan {
  code: MembershipTier;
  name: string;
  yearlyPriceCny: number;
  monthlyAiChats: number;
  monthlyBaziReads: number;
  features: string[];
}

export const MEMBERSHIP_PLAN_MAP: Record<MembershipTier, MembershipPlan> = {
  FREE: {
    code: 'FREE',
    name: '探索者',
    yearlyPriceCny: 0,
    monthlyAiChats: 20,
    monthlyBaziReads: 5,
    features: ['基础命盘', '日运摘要', '社区浏览'],
  },
  BASIC: {
    code: 'BASIC',
    name: '基础会员',
    yearlyPriceCny: 999,
    monthlyAiChats: 200,
    monthlyBaziReads: 50,
    features: ['完整命盘', '人生K线', '历史记录云同步'],
  },
  PREMIUM: {
    code: 'PREMIUM',
    name: '洞察者',
    yearlyPriceCny: 1999,
    monthlyAiChats: 1000,
    monthlyBaziReads: 300,
    features: ['深度解读', '市场模块', '季度趋势报告'],
  },
  VIP: {
    code: 'VIP',
    name: '智库会员',
    yearlyPriceCny: 9999,
    monthlyAiChats: 999999,
    monthlyBaziReads: 999999,
    features: ['顾问服务', '专属策略', '私享活动'],
  },
};

export const MEMBERSHIP_PLANS = Object.values(MEMBERSHIP_PLAN_MAP);

export function getMembershipPlan(tier: string | null | undefined): MembershipPlan {
  const normalized = (tier || 'FREE').toUpperCase() as MembershipTier;
  return MEMBERSHIP_PLAN_MAP[normalized] || MEMBERSHIP_PLAN_MAP.FREE;
}

export function membershipExpiresInDays(expiresAt?: Date | null): number | null {
  if (!expiresAt) return null;
  const ms = expiresAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function membershipIsActive(membership: string | null | undefined, expiresAt?: Date | null): boolean {
  if (!membership || membership.toUpperCase() === 'FREE') return true;
  if (!expiresAt) return false;
  return expiresAt.getTime() > Date.now();
}
