import { prisma } from '@/app/lib/db';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface AiInterpretInput {
  userId?: string;
  name?: string;
  chart: any;
  scores: {
    career: number;
    wealth: number;
    love: number;
    health: number;
    overall: number;
  };
  mode?: 'full' | 'daily' | 'yearly';
}

function buildFallback(input: AiInterpretInput) {
  const mode = input.mode || 'full';
  const title =
    mode === 'daily' ? '今日建议' : mode === 'yearly' ? '年度建议' : '综合命盘建议';

  return [
    `【${title}】`,
    `综合分：${input.scores.overall}/100。事业 ${input.scores.career}，财运 ${input.scores.wealth}，感情 ${input.scores.love}，健康 ${input.scores.health}。`,
    '1) 事业：优先做确定性高、可复利的主线。',
    '2) 财运：控制仓位与杠杆，先做风险预算。',
    '3) 感情：减少情绪判断，强调沟通和边界。',
    '4) 健康：保证睡眠与规律运动，避免透支。',
    '5) 执行：每周复盘，按评分变化调整策略。',
  ].join('\n');
}

export async function generateAiInterpretation(input: AiInterpretInput) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const fallbackText = buildFallback(input);
  const start = Date.now();

  if (!apiKey) {
    return {
      content: fallbackText,
      source: 'fallback',
      model: 'fallback-local',
      fallbackUsed: true,
    };
  }

  try {
    const prompt = {
      scores: input.scores,
      riZhu: input.chart?.detail?.日主 || input.chart?.bazi?.riZhu || '',
      geJu: input.chart?.analysis?.geJu || null,
      yongShen: input.chart?.analysis?.yongShen || null,
      tags: input.chart?.analysis?.tags || [],
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是专业命理顾问。必须基于给定结构化评分输出可执行建议，避免绝对化结论。输出简洁，分点。',
          },
          {
            role: 'user',
            content: `请基于以下结构化数据生成解读：${JSON.stringify(prompt)}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek error: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || fallbackText;

    if (input.userId) {
      const usage = data?.usage || {};
      await prisma.aiLog.create({
        data: {
          userId: input.userId,
          provider: 'deepseek',
          model: data?.model || 'deepseek-chat',
          inputTokens: Number(usage.prompt_tokens || 0),
          outputTokens: Number(usage.completion_tokens || 0),
          cost: 0,
          requestType: 'bazi',
          latencyMs: Date.now() - start,
        },
      });
    }

    return {
      content,
      source: 'deepseek',
      model: data?.model || 'deepseek-chat',
      usage: data?.usage,
      fallbackUsed: false,
    };
  } catch (error) {
    console.error('AI interpretation failed, fallback enabled:', error);

    if (input.userId) {
      await prisma.aiLog.create({
        data: {
          userId: input.userId,
          provider: 'fallback',
          model: 'fallback-local',
          inputTokens: 0,
          outputTokens: 0,
          cost: 0,
          requestType: 'bazi',
          latencyMs: Date.now() - start,
        },
      });
    }

    return {
      content: fallbackText,
      source: 'fallback',
      model: 'fallback-local',
      fallbackUsed: true,
    };
  }
}
