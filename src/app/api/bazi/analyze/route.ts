import { NextRequest, NextResponse } from 'next/server';
import { analyzeBaziComplete, getBaziDetail } from '@/app/lib/bazi';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-76545a45dd294e37848adf86b9d203ad';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bazi, daYun, gender, name, birthData } = body;

    if (!bazi) {
      return NextResponse.json(
        { error: 'Missing bazi data' },
        { status: 400 }
      );
    }

    // 使用算法分析八字，获取结构化数据
    let analysisData;
    try {
      // 优先使用传入的 birthData，否则尝试从 bazi 解析
      let detail = birthData;
      if (!detail && bazi.birthDate) {
        const { year, month, day, hour } = bazi.birthDate;
        detail = await getBaziDetail(year, month, day, hour, gender || 'male');
      }
      
      if (detail) {
        const currentDaYun = daYun?.[0];
        analysisData = analyzeBaziComplete(detail, currentDaYun);
      }
    } catch (e) {
      console.warn('算法分析失败，使用基础数据:', e);
      analysisData = null;
    }

    // 构建标准化提示词
    const prompt = buildStandardizedPrompt({
      bazi,
      daYun,
      gender,
      name,
      analysis: analysisData,
    });

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
            content: `你是一位专业的八字命理分析师，精通传统子平八字理论。

【重要规则】
1. 你必须基于提供的算法分析数据进行解读，不得随意编造
2. 日主强弱、五行旺衰、格局判断等核心结论必须与算法数据一致
3. 运势评分直接使用算法计算结果，不得擅自修改
4. 用神喜忌必须遵循算法推导逻辑
5. 语言专业但易懂，避免过于晦涩的术语
6. 给出具体、实用的建议，结合现代生活场景
7. 保持客观理性，避免绝对化的断言

【解读风格】
- 先陈述算法分析结果（事实）
- 再给出命理解读（分析）
- 最后提供实用建议（应用）`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5, // 降低随机性，更遵循规则
        max_tokens: 2500,
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
    const aiAnalysis = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      algorithmData: analysisData, // 返回算法数据供前端使用
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

/**
 * 构建标准化提示词
 * 基于算法分析数据，确保 DeepSeek 遵循固定规则
 */
function buildStandardizedPrompt(params: {
  bazi: any;
  daYun: any[];
  gender: string;
  name: string;
  analysis: any;
}): string {
  const { bazi, daYun, gender, name, analysis } = params;
  const currentYear = new Date().getFullYear();
  const yearRange = `${currentYear}-${currentYear + 2}`;
  
  // 基础八字信息
  let prompt = `【八字基础信息】
- 性别：${gender === 'male' ? '男' : '女'}
- 姓名：${name || '未知'}
- 年柱：${bazi.year}（天干${bazi.wuXing.yearTG}、地支${bazi.wuXing.yearDZ}）
- 月柱：${bazi.month}（天干${bazi.wuXing.monthTG}、地支${bazi.wuXing.monthDZ}）
- 日柱：${bazi.day}（天干${bazi.wuXing.dayTG}、地支${bazi.wuXing.dayDZ}）- 日主
- 时柱：${bazi.hour}（天干${bazi.wuXing.hourTG}、地支${bazi.wuXing.hourDZ}）

【大运信息】
${daYun?.map((d: { age: number; ganZhi: string }) => `${d.age}岁：${d.ganZhi}`).join('\n') || '暂无'}
`;

  // 如果有算法分析数据，添加结构化分析结果
  if (analysis) {
    prompt += `
【算法分析结果 - 必须基于此数据进行解读】

1. 【日主强弱分析】
- 日主强弱：${analysis.riZhu.strength === 'strong' ? '身强' : analysis.riZhu.strength === 'weak' ? '身弱' : '中和'}（评分：${analysis.riZhu.score}/100）
- 判定理由：${analysis.riZhu.reason}
- 得令：${analysis.riZhu.details.seasonSupport ? '是' : '否'}（分数：${analysis.riZhu.details.seasonScore}）
- 得地：${analysis.riZhu.details.rootSupport ? '是' : '否'}（分数：${analysis.riZhu.details.rootScore}）
- 得势：${analysis.riZhu.details.assistSupport ? '是' : '否'}（分数：${analysis.riZhu.details.assistScore}）
- 命局需求：${analysis.riZhu.needs}

2. 【五行旺衰分析】
- 五行分布：
${Object.entries(analysis.wuXing.distribution).map(([k, v]: [string, any]) => `  · ${k}：力量${v.power.toFixed(1)}，占比${v.percentage}%，状态「${v.level}」`).join('\n')}
- 最旺五行：${analysis.wuXing.dominant}
- 最弱五行：${analysis.wuXing.deficient}
- 整体平衡：${analysis.wuXing.balance}
- 特征描述：${analysis.wuXing.description}

3. 【十神配置分析】
- 各十神力量：
${Object.entries(analysis.shiShen.powers).map(([k, v]: [string, any]) => `  · ${k}：${v.toFixed(2)}`).join('\n')}
- 主导十神：${analysis.shiShen.dominant.join('、')}
- 缺失十神：${analysis.shiShen.missing.join('、') || '无'}
- 性格特征：${analysis.shiShen.character}
- 适合职业：${analysis.shiShen.careerType}
- 求财方式：${analysis.shiShen.wealthType}

4. 【格局判定】
- 格局类型：${analysis.geJu.type}
- 格局层次：${analysis.geJu.level}
- 格局质量：${analysis.geJu.quality}等
- 格局特点：${analysis.geJu.description}
- 成格条件：${analysis.geJu.condition}
- 置信度：${analysis.geJu.confidence}%

5. 【用神喜忌分析】
- 用神：${analysis.yongShen.yongShen.element}（${analysis.yongShen.yongShen.shishen}）
- 用神理由：${analysis.yongShen.yongShen.reason}
- 喜神：${analysis.yongShen.xiShen.element}（生助用神）
- 忌神：${analysis.yongShen.jiShen.element}（克制用神）
- 闲神：${analysis.yongShen.xianShen.element}
- 有利因素：${analysis.yongShen.advice.favorable.join('；')}
- 不利因素：${analysis.yongShen.advice.unfavorable.join('；')}

6. 【运势评分】
- 事业分：${analysis.scores.career}/100
- 财运分：${analysis.scores.wealth}/100
- 感情分：${analysis.scores.love}/100
- 健康分：${analysis.scores.health}/100
- 综合分：${analysis.scores.overall}/100

7. 【特征标签】
${analysis.tags.map((tag: string) => `· ${tag}`).join('\n')}
`;
  }

  // 添加输出要求
  prompt += `
【输出要求】
请基于以上${analysis ? '算法分析数据' : '八字信息'}，提供以下分析（用中文回复，格式化为HTML，使用<p>、<b>、<h3>等标签）：

1. <h3>日主分析</h3>：分析日主${bazi.day[0]}的特性和强弱${analysis ? '（必须与算法判定一致：' + (analysis.riZhu.strength === 'strong' ? '身强' : analysis.riZhu.strength === 'weak' ? '身弱' : '中和') + '）' : ''}

2. <h3>五行分析</h3>：分析八字中五行的分布和平衡情况${analysis ? '（参考五行旺衰数据）' : ''}

3. <h3>格局判断</h3>：判断命盘格局${analysis ? '（算法判定：' + analysis.geJu.type + '，' + analysis.geJu.level + '）' : ''}

4. <h3>用神喜忌</h3>：指出用神、喜神、忌神${analysis ? '（用神：' + analysis.yongShen.yongShen.element + analysis.yongShen.yongShen.shishen + '）' : ''}

5. <h3>事业财运</h3>：分析事业发展和财运趋势${analysis ? '（事业分' + analysis.scores.career + '，财运分' + analysis.scores.wealth + '）' : ''}

6. <h3>感情婚姻</h3>：分析感情运势和婚姻状况${analysis ? '（感情分' + analysis.scores.love + '）' : ''}

7. <h3>健康提示</h3>：需要注意的健康方面${analysis ? '（健康分' + analysis.scores.health + '）' : ''}

8. <h3>大运走势</h3>：简要分析当前和未来大运趋势

9. <h3>流年建议</h3>：针对${yearRange}年的具体建议

10. <h3>开运指南</h3>：${analysis ? '有利方位：' + analysis.yongShen.advice.favorable[0] + '；有利颜色：' + analysis.yongShen.advice.favorable[1] : '根据用神给出具体建议'}

格式要求：
- 使用 HTML 标签（<p>段落、<b>加粗、<h3>小标题）
- 每个部分用 <h3> 标签分隔
- 关键结论用 <b> 加粗
- 适当使用 <br/> 换行
- “综合建议”必须输出不少于10条，使用 1. 2. 3. 连续编号，并尽量覆盖事业、财务、关系、健康、执行节奏
- 总字数控制在 1500-2000 字`;

  return prompt;
}
