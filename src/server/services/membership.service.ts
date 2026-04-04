import { Membership } from '@prisma/client';

export interface MembershipPlan {
  code: Membership;
  title: string;
  price: number;
  currency: 'USD' | 'CNY';
  billingPeriod: 'year';
  monthlyBaziReads: number;
  monthlyAiChats: number;
  permissions: string[];
}

export const MEMBERSHIP_PLANS: Record<Membership, MembershipPlan> = {
  FREE: {
    code: 'FREE',
    title: '免费版',
    price: 0,
    currency: 'USD',
    billingPeriod: 'year',
    monthlyBaziReads: 5,
    monthlyAiChats: 20,
    permissions: ['basic_bazi', 'basic_kline'],
  },
  BASIC: {
    code: 'BASIC',
    title: '基础会员',
    price: 29.9,
    currency: 'USD',
    billingPeriod: 'year',
    monthlyBaziReads: 50,
    monthlyAiChats: 200,
    permissions: ['basic_bazi', 'kline_full', 'report_save'],
  },
  PREMIUM: {
    code: 'PREMIUM',
    title: '高级会员',
    price: 199,
    currency: 'USD',
    billingPeriod: 'year',
    monthlyBaziReads: 300,
    monthlyAiChats: 1000,
    permissions: ['advanced_bazi', 'kline_full', 'report_save', 'ai_full'],
  },
  VIP: {
    code: 'VIP',
    title: 'VIP',
    price: 999,
    currency: 'USD',
    billingPeriod: 'year',
    monthlyBaziReads: 999999,
    monthlyAiChats: 999999,
    permissions: ['advanced_bazi', 'kline_full', 'report_save', 'ai_full', 'priority_support'],
  },
};

export function getMembershipPlan(level: Membership | string | null | undefined): MembershipPlan {
  const key = String(level || 'FREE').toUpperCase() as Membership;
  return MEMBERSHIP_PLANS[key] || MEMBERSHIP_PLANS.FREE;
}

export function listMembershipPlans(): MembershipPlan[] {
  return Object.values(MEMBERSHIP_PLANS);
}

export function isMembershipActive(level: Membership, expiresAt?: Date | null) {
  if (level === 'FREE') return true;
  if (!expiresAt) return false;
  return expiresAt.getTime() > Date.now();
}

export function daysUntilExpired(expiresAt?: Date | null) {
  if (!expiresAt) return null;
  const diff = expiresAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function addMembershipYear(base?: Date | null) {
  const now = new Date();
  const start = base && base.getTime() > now.getTime() ? base : now;
  const out = new Date(start);
  out.setFullYear(out.getFullYear() + 1);
  return out;
}
