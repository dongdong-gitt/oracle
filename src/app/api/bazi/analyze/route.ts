import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-76545a45dd294e37848adf86b9d203ad';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bazi, daYun, gender, name } = body;

    if (!bazi) {
      return NextResponse.json(
        { error: 'Missing bazi data' },
        { status: 400 }
      );
    }

    // 构建提示词
    const prompt = `你是一位精通八字命理的AI命理师。请根据以下八字信息，为用户提供专业、详细且易于理解的命理分析。

【八字信息】
- 性别：${gender === 'male' ? '男' : '女'}
- 姓名：${name || '未知'}
- 年柱：${bazi.year}（${bazi.wuXing.yearTG}、${bazi.wuXing.yearDZ}）
- 月柱：${bazi.month}（${bazi.wuXing.monthTG}、${bazi.wuXing.monthDZ}）
- 日柱：${bazi.day}（${bazi.wuXing.dayTG}、${bazi.wuXing.dayDZ}）- 日主
- 时柱：${bazi.hour}（${bazi.wuXing.hourTG}、${bazi.wuXing.hourDZ}）

【大运】
${daYun?.map((d: { age: number; ganZhi: string }) => `${d.age}岁：${d.ganZhi}`).join('\n') || '暂无'}

请提供以下分析（用中文回复，格式化为HTML，使用<p>、<b>等标签）：

1. **日主分析**：分析日主${bazi.day[0]}的特性和强弱
2. **五行分析**：分析八字中五行的分布和平衡情况
3. **格局判断**：判断命盘格局（如正官格、七杀格、印绶格等）
4. **用神喜忌**：指出用神、喜神、忌神
5. **事业财运**：分析事业发展和财运趋势
6. **感情婚姻**：分析感情运势和婚姻状况
7. **健康提示**：需要注意的健康方面
8. **大运走势**：简要分析当前和未来大运趋势
9. **流年建议**：针对2025-2027年的具体建议

要求：
- 语言专业但易懂，避免过于晦涩的术语
- 给出具体、实用的建议
- 保持客观理性，避免绝对化的断言
- 适当结合现代生活场景`;

    // 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的八字命理分析师，精通传统子平八字理论，善于将命理分析与现代生活结合，给出既有传统底蕴又实用的建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DeepSeek API error:', errorData);
      return NextResponse.json(
        { error: 'AI analysis failed', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      analysis,
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    console.error('DeepSeek API error:', error);
    return NextResponse.json(
      { error: 'AI analysis failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}
