import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      { cycleType: '康波周期', phaseName: '上升段', theme: 'AI技术革命', summaryText: '技术资本开支和产业重构并行。', score: 78 },
      { cycleType: '朱格拉周期', phaseName: '扩张期', theme: '产业更新加速', summaryText: '设备更新与新产能切换共振。', score: 72 },
      { cycleType: '基钦周期', phaseName: '再通胀', theme: '资金回流', summaryText: '库存与流动性修复推动风险偏好。', score: 63 },
    ],
  });
}
