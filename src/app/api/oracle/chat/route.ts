import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing DEEPSEEK_API_KEY' },
        { status: 500 }
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
        ? `你是“神谕顾问”，擅长用八字与当下周期给出决策建议。输出要专业、克制、可执行，避免绝对化断言。${contextText ? `\n\n背景信息：\n${contextText}` : ''}`
        : `You are an "Oracle Advisor". Give practical, restrained decision guidance based on the user's birth chart context when available. Avoid absolute claims. ${contextText ? `\n\nContext:\n${contextText}` : ''}`;

    const deepseekMessages: DeepseekMessage[] = [{ role: 'system', content: systemContent }];
    const recent = messages.slice(-12);
    for (const m of recent) {
      deepseekMessages.push({
        role: m.role === 'oracle' ? 'assistant' : 'user',
        content: String(m.content || ''),
      });
    }

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
      return NextResponse.json(
        { error: 'DeepSeek API error', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      reply,
      model: data?.model,
      usage: data?.usage,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Chat failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}

