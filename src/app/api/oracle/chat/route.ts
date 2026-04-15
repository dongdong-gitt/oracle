import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/server/auth/session';
import { prisma } from '@/app/lib/db';
import { getMembershipPlan, isMembershipActive } from '@/server/services/membership.service';
import { checkRateLimit, RATE_LIMITS } from '@/server/lib/rateLimit';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

type IncomingMessage = { role: 'user' | 'oracle'; content: string };
type DeepseekMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function buildContextText(payload: any) {
  const birthData = payload?.birthData;
  const baziResult = payload?.baziResult;

  const parts: string[] = [];
  if (birthData) {
    parts.push(
      `用户基础信息：姓名=${birthData.name || '未提供'}；性别=${birthData.gender === 'male' ? '男' : '女'}；生日=${birthData.birthDate || ''}；出生时间=${birthData.birthTime || ''}；地点=${birthData.birthPlace || ''}`
    );
  }
  if (baziResult?.bazi) {
    parts.push(
      `八字：${baziResult.bazi.year} ${baziResult.bazi.month} ${baziResult.bazi.day} ${baziResult.bazi.hour}；日主=${baziResult.detail?.日主 || baziResult.bazi.riZhu || ''}`
    );
  }
  if (Array.isArray(baziResult?.daYun) && baziResult.daYun.length) {
    parts.push(`大运：${baziResult.daYun.slice(0, 6).map((d: any) => `${d.age}岁${d.ganZhi}`).join('；')}`);
  }

  return parts.join('\n');
}

/**
 * 根据 DeepSeek API 错误状态码返回用户友好的错误信息
 */
function getDeepSeekErrorResponse(status: number, errorData: any) {
  switch (status) {
    case 429:
      return NextResponse.json(
        { error: '当前请求过于频繁，请稍后再试', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    case 401:
    case 403:
      return NextResponse.json(
        { error: 'AI 服务认证异常，请联系管理员', code: 'AI_AUTH_ERROR' },
        { status: 503 }
      );
    case 400:
      // 安全过滤等场景
      const isContentFilter = errorData?.error?.type === 'content_filter' ||
        errorData?.error?.code === 'content_filter';
      if (isContentFilter) {
        return NextResponse.json(
          { error: '您的问题触发了内容安全策略，请换个方式提问', code: 'CONTENT_FILTERED' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'AI 请求参数异常', code: 'AI_BAD_REQUEST', details: errorData },
        { status: 400 }
      );
    default:
      return NextResponse.json(
        { error: 'AI 服务暂时不可用，请稍后再试', code: 'AI_UNAVAILABLE' },
        { status: 503 }
      );
  }
}

/**
 * 检查用户本月 AI 聊天使用额度
 */
async function checkAiChatQuota(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { membership: true, membershipExpiresAt: true },
  });

  if (!user) {
    return { allowed: false, reason: '用户不存在', code: 'USER_NOT_FOUND' };
  }

  const plan = getMembershipPlan(user.membership);
  const active = isMembershipActive(user.membership, user.membershipExpiresAt);

  // 会员已过期，按免费额度计算
  const effectivePlan = active ? plan : getMembershipPlan('FREE');

  // 统计本月 AI 聊天调用次数
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyUsage = await prisma.aiLog.count({
    where: {
      userId,
      requestType: 'oracle_chat',
      createdAt: { gte: monthStart },
    },
  });

  if (monthlyUsage >= effectivePlan.monthlyAiChats) {
    return {
      allowed: false,
      reason: `本月 AI 对话次数已达上限（${effectivePlan.monthlyAiChats}次），请升级会员获取更多额度`,
      code: 'QUOTA_EXCEEDED',
      usage: monthlyUsage,
      limit: effectivePlan.monthlyAiChats,
      membership: user.membership,
    };
  }

  return {
    allowed: true,
    usage: monthlyUsage,
    limit: effectivePlan.monthlyAiChats,
    membership: user.membership,
  };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing DEEPSEEK_API_KEY' },
        { status: 500 }
      );
    }

    // 会员权限校验
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { error: '请先登录后再使用 AI 对话', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const quota = await checkAiChatQuota(userId);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: quota.reason,
          code: quota.code,
          usage: quota.usage,
          limit: quota.limit,
          membership: quota.membership,
        },
        { status: 403 }
      );
    }

    // API 限流检查
    const rateLimitResult = await checkRateLimit(userId, RATE_LIMITS.aiChat);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `请求过于频繁，请 ${rateLimitResult.retryAfterSec || 60} 秒后再试`,
          code: 'RATE_LIMITED',
          retryAfterSec: rateLimitResult.retryAfterSec,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const messages: IncomingMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const lang: 'zh' | 'en' = body?.lang === 'en' ? 'en' : 'zh';

    if (!messages.length) {
      return NextResponse.json(
        { error: 'Missing messages' },
        { status: 400 }
      );
    }

    const contextText = buildContextText(body?.context);
    const systemContent =
      lang === 'zh'
        ? `你是”神谕顾问”，擅长用八字与当下周期给出决策建议。输出要专业、克制、可执行，避免绝对化断言。${contextText ? `\n\n背景信息：\n${contextText}` : ''}`
        : `You are an “Oracle Advisor”. Give practical, restrained decision guidance based on the user's birth chart context when available. Avoid absolute claims. ${contextText ? `\n\nContext:\n${contextText}` : ''}`;

    const deepseekMessages: DeepseekMessage[] = [{ role: 'system', content: systemContent }];
    const recent = messages.slice(-12);
    for (const m of recent) {
      deepseekMessages.push({
        role: m.role === 'oracle' ? 'assistant' : 'user',
        content: String(m.content || ''),
      });
    }

    const startTime = Date.now();

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: deepseekMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return getDeepSeekErrorResponse(response.status, errorData);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    const latencyMs = Date.now() - startTime;

    // 记录 AI 调用日志（用于额度统计）
    try {
      await prisma.aiLog.create({
        data: {
          userId,
          provider: 'deepseek',
          model: data?.model || 'deepseek-chat',
          inputTokens: data?.usage?.prompt_tokens || 0,
          outputTokens: data?.usage?.completion_tokens || 0,
          cost: 0, // 可根据实际计费填入
          requestType: 'oracle_chat',
          latencyMs,
        },
      });
    } catch (logError) {
      // 日志记录失败不应影响正常响应
      console.error('Failed to log AI usage:', logError);
    }

    return NextResponse.json({
      success: true,
      reply,
      model: data?.model,
      usage: data?.usage,
      quota: {
        used: (quota.usage || 0) + 1,
        limit: quota.limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Chat failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}

