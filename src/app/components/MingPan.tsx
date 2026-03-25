'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MingPanProps {
  data: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

export default function MingPan({ data }: MingPanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 120;

    // 清空画布
    ctx.clearRect(0, 0, size, size);

    // 绘制外圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制内圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 30, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 绘制中心点
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#6366f1';
    ctx.fill();

    // 绘制光芒
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = centerX + Math.cos(angle) * (radius - 30);
      const y1 = centerY + Math.sin(angle) * (radius - 30);
      const x2 = centerX + Math.cos(angle) * radius;
      const y2 = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 绘制八字位置（简化展示）
    const positions = [
      { label: '年柱', value: data.year, angle: -Math.PI / 2 },
      { label: '月柱', value: data.month, angle: 0 },
      { label: '日柱', value: data.day, angle: Math.PI / 2 },
      { label: '时柱', value: data.hour, angle: Math.PI },
    ];

    positions.forEach((pos) => {
      const x = centerX + Math.cos(pos.angle) * (radius - 50);
      const y = centerY + Math.sin(pos.angle) * (radius - 50);

      // 绘制小圆点
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.fill();

      // 绘制文字背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(x - 25, y - 35, 50, 20);

      // 绘制标签
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pos.label, x, y - 20);

      // 绘制值
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(pos.value, x, y + 5);
    });
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="glass-card rounded-3xl p-8 flex flex-col items-center"
    >
      <h3 className="text-xl font-bold mb-6 gradient-text">八字命盘</h3>
      <canvas
        ref={canvasRef}
        className="rounded-full"
        style={{
          boxShadow: '0 0 60px rgba(99, 102, 241, 0.3)',
        }}
      />
      <div className="mt-6 grid grid-cols-4 gap-4 text-center">
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-xs text-gray-400">年柱</div>
          <div className="text-lg font-bold text-indigo-400">{data.year}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-xs text-gray-400">月柱</div>
          <div className="text-lg font-bold text-indigo-400">{data.month}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-xs text-gray-400">日柱</div>
          <div className="text-lg font-bold text-indigo-400">{data.day}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-xs text-gray-400">时柱</div>
          <div className="text-lg font-bold text-indigo-400">{data.hour}</div>
        </div>
      </div>
    </motion.div>
  );
}
