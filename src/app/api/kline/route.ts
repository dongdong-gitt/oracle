import { NextRequest, NextResponse } from 'next/server';
import { generateLifeKLine } from '@/app/lib/baziQuant';
import { getBaziDetail } from '@/app/lib/bazi';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-76545a45dd294e37848adf86b9d203ad';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * 调用 DeepSeek API 解读八字（仅用于文字分析，分数用算法计算）
 */
async function analyzeWithDeepSeek(
  detail: any,
  baseScores: { career: number; wealth: number; love: number; health: number },
  gender: string
) {
  const prompt = `你是一位精通子平八字的命理大师。请基于以下八字信息进行专业测算：

【八字排盘】
- 年柱：${detail.年柱.天干.天干}${detail.年柱.地支.地支}（${detail.年柱.天干.五行}${detail.年柱.天干.阴阳}，${detail.年柱.地支.五行}${detail.年柱.地支.阴阳}）
- 月柱：${detail.月柱.天干.天干}${detail.月柱.地支.地支}（${detail.月柱.天干.五行}${detail.月柱.天干.阴阳}，${detail.月柱.地支.五行}${detail.月柱.地支.阴阳}）
- 日柱：${detail.日柱.天干.天干}${detail.日柱.地支.地支}（日主${detail.日主}，${detail.日柱.天干.五行}${detail.日柱.天干.阴阳}）
- 时柱：${detail.时柱.天干.天干}${detail.时柱.地支.地支}（${detail.时柱.天干.五行}${detail.时柱.天干.阴阳}，${detail.时柱.地支.五行}${detail.时柱.地支.阴阳}）

【性别】${gender === 'male' ? '男' : '女'}
【生肖】${detail.生肖}

【算法量化评分】（仅供参考）
- 事业运：${baseScores.career}分
- 财运：${baseScores.wealth}分
- 感情运：${baseScores.love}分
- 健康运：${baseScores.health}分

请提供以下分析（JSON格式）：
{
  "mingZhu": "日主分析，性格特质（200字左右）",
  "career": "事业运势分析，结合八字十神（150字左右）",
  "wealth": "财运分析（150字左右）", 
  "love": "感情婚姻分析（150字左右）",
  "health": "健康分析（100字左右）",
  "currentPeriod": "当前大运分析（150字左右）",
  "thisYear": "今年流年运势（150字左右）",
  "advice": "综合建议（100字左右）"
}

要求：
1. 基于传统子平八字理论分析
2. 结合五行生克制化
3. 考虑十神关系
4. 给出具体、实用的建议
5. 分析要有深度，不要泛泛而谈`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位精通子平八字、紫微斗数的命理大师，擅长基于八字五行进行人生运势分析。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    // 提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        // 清理可能的非法字符
        const cleanJson = jsonMatch[0]
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // 移除控制字符
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error('JSON parse error:', e);
        // 继续返回文本格式
      }
    }
    
    // 如果无法解析 JSON，返回文本
    return {
      mingZhu: content.substring(0, 200),
      career: content,
      wealth: content,
      love: content,
      health: content,
      currentPeriod: content,
      thisYear: content,
      advice: '请参考详细分析',
    };
  } catch (error) {
    console.error('DeepSeek API error:', error);
    // 返回默认分析
    return {
      mingZhu: `${detail.日主}日主，${detail.日柱.天干.五行}命。性格${detail.日柱.天干.阴阳 === '阳' ? '外向开朗' : '内敛沉稳'}。`,
      career: '事业发展平稳，宜稳扎稳打。',
      wealth: '财运中等，注意理财规划。',
      love: '感情需要用心经营。',
      health: '注意养生保健。',
      currentPeriod: '当前大运顺行。',
      thisYear: `${new Date().getFullYear()}年运势平稳。`,
      advice: '顺势而为，积德行善。',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, gender, period = '1y' } = body;

    if (!year || !month || !day || hour === undefined || !gender) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 1. 使用算法生成K线数据（基于八字量化理论）
    const { baseScores, kline, detail, daYun } = generateLifeKLine(
      year, month, day, hour, gender, period
    );
    
    console.log('Base scores calculated:', baseScores);

    // 2. 调用 AI 获取文字解读（分数用算法计算的）
    const aiAnalysis = await analyzeWithDeepSeek(detail, baseScores, gender);

    return NextResponse.json({
      success: true,
      data: {
        bazi: {
          year: `${detail.年柱.天干.天干}${detail.年柱.地支.地支}`,
          month: `${detail.月柱.天干.天干}${detail.月柱.地支.地支}`,
          day: `${detail.日柱.天干.天干}${detail.日柱.地支.地支}`,
          hour: `${detail.时柱.天干.天干}${detail.时柱.地支.地支}`,
          riZhu: detail.日主 + '日主',
        },
        detail,
        daYun: daYun.大运.map((d: any) => ({
          age: d.开始年龄,
          ganZhi: d.干支,
        })),
        baseScores,
        aiAnalysis: {
          mingZhu: aiAnalysis.mingZhu,
          career: aiAnalysis.career,
          wealth: aiAnalysis.wealth,
          love: aiAnalysis.love,
          health: aiAnalysis.health,
          currentPeriod: aiAnalysis.currentPeriod,
          thisYear: aiAnalysis.thisYear,
          advice: aiAnalysis.advice,
          score: {
            ...baseScores,
            overall: Math.round((baseScores.career + baseScores.wealth + baseScores.love + baseScores.health) / 4),
          },
        },
        kline,
        summary: {
          currentLuck: kline[kline.length - 1]?.close || 70,
          trend: (kline[kline.length - 1]?.close || 70) > (kline[0]?.close || 70) ? 'up' : 'down',
          suggestion: aiAnalysis.advice,
          riZhu: detail.日主,
          wuXing: detail.日柱.天干.五行,
        },
      },
    });
  } catch (error) {
    console.error('Life K-Line generation error:', error);
    return NextResponse.json(
      { error: 'Generation failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// 测试 GET
export async function GET() {
  return NextResponse.json({
    message: '人生K线 API（八字量化算法版）',
    usage: 'POST /api/kline with {year, month, day, hour, gender, period}',
    periods: {
      all: '终身 - 按年显示',
      '10y': '10年 - 按季度显示',
      '1y': '1年 - 按月显示（12根K线）',
      '1m': '1月 - 按日显示',
      '1d': '1日 - 按时辰显示',
    },
    example: {
      year: 1995,
      month: 12,
      day: 25,
      hour: 14,
      gender: 'male',
      period: '1y',
    },
  });
}
