import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

interface WuXingData {
  金: number;
  木: number;
  水: number;
  火: number;
  土: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wuxing, bazi, riZhu } = body;

    if (!wuxing || !bazi || !riZhu) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DeepSeek API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `你是一位专业的八字命理师。请基于用户的八字和五行分布，分析格局、喜用神、幸运元素等。

用户信息：
- 八字：${bazi}
- 日主：${riZhu}
- 五行分布：金${wuxing.金}% 木${wuxing.木}% 水${wuxing.水}% 火${wuxing.火}% 土${wuxing.土}%

请输出 JSON 格式：
{
  "pattern": "格局名称（如：伤官格·伤官佩印）",
  "patternDesc": "格局描述（50字左右）",
  "strength": "身强/身弱/中和（如：偏弱型）",
  "喜用神": ["土", "金"],
  "幸运颜色": ["#D2691E", "#C0C0C0"],
  "幸运方位": ["家乡", "正西"],
  "幸运数字": ["36", "37"],
  "适合行业": ["金融", "科技", "教育", "房地产"]
}

注意：
1. 格局名称要专业准确
2. 喜用神根据日主强弱和五行分布判断
3. 幸运颜色用十六进制色值
4. 适合行业要具体实用`;

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
            content: '你是专业的八字命理师，擅长分析五行格局和喜用神。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';

    // 解析 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('五行分析 API 错误:', error);
    // 返回默认数据
    return NextResponse.json({
      success: true,
      data: {
        pattern: '正官格',
        patternDesc: '日主得令，官星透干，为人正直有责任感。',
        strength: '中和',
        喜用神: ['土', '金'],
        幸运颜色: ['#D2691E', '#FFD700'],
        幸运方位: ['中央', '西方'],
        幸运数字: ['5', '6'],
        适合行业: ['金融', '管理', '法律', '建筑'],
      },
    });
  }
}
