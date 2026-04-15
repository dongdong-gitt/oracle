import { Membership } from '@prisma/client';
import { getMembershipPlan } from '@/server/services/membership.service';

/**
 * 支付提供商抽象接口
 * 统一 Stripe / 微信支付 / 支付宝 等不同支付渠道
 *
 * 使用方式：
 * 1. 安装 stripe: npm install stripe
 * 2. 设置环境变量: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 * 3. 取消下方 Stripe 实现的注释
 */

export interface CheckoutSession {
  /** 支付提供商返回的 session/订单 ID */
  providerSessionId: string;
  /** 支付跳转 URL（Stripe Checkout / 微信支付二维码链接） */
  checkoutUrl: string;
  /** 支付提供商名称 */
  provider: string;
}

export interface PaymentProvider {
  /** 创建支付会话 */
  createCheckoutSession(params: {
    orderId: string;
    orderNo: string;
    membershipType: Membership;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession>;

  /** 验证 webhook 回调签名 */
  verifyWebhookSignature(payload: string, signature: string): boolean;

  /** 解析 webhook 事件，返回订单 ID 和状态 */
  parseWebhookEvent(payload: string, signature: string): Promise<{
    orderId: string;
    providerOrderId: string;
    status: 'paid' | 'failed' | 'refunded';
    payload: unknown;
  }>;
}

/**
 * Mock 支付提供商（开发环境使用）
 */
export class MockPaymentProvider implements PaymentProvider {
  async createCheckoutSession(params: {
    orderId: string;
    orderNo: string;
    membershipType: Membership;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession> {
    const plan = getMembershipPlan(params.membershipType);
    return {
      providerSessionId: `mock_session_${params.orderId}`,
      checkoutUrl: `${params.successUrl}?session_id=mock_${params.orderId}&plan=${plan.code}`,
      provider: 'mock',
    };
  }

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    return true;
  }

  async parseWebhookEvent(payload: string, _signature: string) {
    const data = JSON.parse(payload);
    return {
      orderId: data.orderId || '',
      providerOrderId: `mock_${Date.now()}`,
      status: 'paid' as const,
      payload: data,
    };
  }
}

/**
 * Stripe 支付提供商
 *
 * 使用前需要：
 * 1. npm install stripe
 * 2. 设置 STRIPE_SECRET_KEY 和 STRIPE_WEBHOOK_SECRET
 *
 * 取消下方注释即可启用
 */
/*
import Stripe from 'stripe';

export class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not set');
    this.stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' });
  }

  async createCheckoutSession(params: {
    orderId: string;
    orderNo: string;
    membershipType: Membership;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession> {
    const plan = getMembershipPlan(params.membershipType);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: `Oracle ${plan.title}`,
              description: `Oracle ${plan.title} - 年度会员`,
            },
            unit_amount: Math.round(plan.price * 100), // Stripe 金额单位为分
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: params.orderId,
        orderNo: params.orderNo,
        userId: params.userId,
        membershipType: params.membershipType,
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    return {
      providerSessionId: session.id,
      checkoutUrl: session.url || '',
      provider: 'stripe',
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
      return true;
    } catch {
      return false;
    }
  }

  async parseWebhookEvent(payload: string, signature: string) {
    const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    const session = event.data.object as Stripe.Checkout.Session;

    let status: 'paid' | 'failed' | 'refunded' = 'failed';
    if (event.type === 'checkout.session.completed') status = 'paid';
    if (event.type === 'charge.refunded') status = 'refunded';

    return {
      orderId: session.metadata?.orderId || '',
      providerOrderId: session.payment_intent as string || session.id,
      status,
      payload: event,
    };
  }
}
*/

/**
 * 获取当前环境的支付提供商实例
 */
export function getPaymentProvider(): PaymentProvider {
  // TODO: 当 Stripe 配置就绪后，取消注释以下代码：
  // if (process.env.STRIPE_SECRET_KEY) {
  //   return new StripePaymentProvider();
  // }

  return new MockPaymentProvider();
}
