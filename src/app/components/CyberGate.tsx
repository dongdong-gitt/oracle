'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CyberGateProps {
  onEnter: () => void;
}

export default function CyberGate({ onEnter }: CyberGateProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleEnter = () => {
    setIsOpening(true);
    setTimeout(onEnter, 1200);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* 背景 - 中式窗棂图案 */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="lattice" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="40" fill="none" stroke="white" strokeWidth="0.5"/>
              <line x1="20" y1="0" x2="20" y2="40" stroke="white" strokeWidth="0.3"/>
              <line x1="0" y1="20" x2="40" y2="20" stroke="white" strokeWidth="0.3"/>
              <circle cx="20" cy="20" r="8" fill="none" stroke="white" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lattice)"/>
        </svg>
      </div>

      {/* 主内容 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {!isOpening ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* 外圈装饰环 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-[800px] h-[800px] -m-[200px]"
              >
                <svg viewBox="0 0 200 200" className="w-full h-full opacity-[0.08]">
                  <circle cx="100" cy="100" r="98" fill="none" stroke="white" strokeWidth="0.3" strokeDasharray="1 6"/>
                  <circle cx="100" cy="100" r="85" fill="none" stroke="white" strokeWidth="0.2" strokeDasharray="4 8"/>
                </svg>
              </motion.div>

              {/* 门的主体 - 更大 */}
              <motion.div
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                onClick={handleEnter}
                className="relative w-[500px] h-[680px] cursor-pointer"
                whileHover={{ scale: 1.005 }}
              >
                {/* 门框 - 中式圆角 */}
                <div 
                  className="absolute inset-0 rounded-lg transition-all duration-700"
                  style={{
                    background: isHovered 
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.04) 100%)' 
                      : 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.02) 100%)',
                    border: isHovered 
                      ? '1px solid rgba(255,255,255,0.2)' 
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isHovered 
                      ? '0 0 100px rgba(255,255,255,0.08), inset 0 0 80px rgba(255,255,255,0.02)' 
                      : '0 0 60px rgba(255,255,255,0.03)',
                  }}
                />

                {/* 门环装饰 - 上 */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/20" />

                {/* 门环装饰 - 下 */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/20" />

                {/* 中缝 */}
                <div 
                  className="absolute left-1/2 top-12 bottom-12 w-px -translate-x-1/2 transition-all duration-700"
                  style={{
                    background: isHovered 
                      ? 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.5) 80%, transparent 100%)' 
                      : 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.15) 80%, transparent 100%)',
                  }}
                />

                {/* 左门 */}
                <motion.div
                  className="absolute left-0 top-0 w-1/2 h-full overflow-hidden"
                  animate={{ 
                    x: isHovered ? -8 : 0,
                  }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    borderRight: '0.5px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* 内边框 */}
                  <div className="absolute inset-5 border border-white/[0.04] rounded" />
                  {/* 门钉 - 左 */}
                  <div className="absolute top-1/3 right-5 w-3 h-3 rounded-full bg-white/[0.08]" />
                  <div className="absolute top-1/2 right-5 w-3 h-3 rounded-full bg-white/[0.08]" />
                  <div className="absolute top-2/3 right-5 w-3 h-3 rounded-full bg-white/[0.08]" />
                </motion.div>

                {/* 右门 */}
                <motion.div
                  className="absolute right-0 top-0 w-1/2 h-full overflow-hidden"
                  animate={{ 
                    x: isHovered ? 8 : 0,
                  }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                  {/* 内边框 */}
                  <div className="absolute inset-5 border border-white/[0.04] rounded" />
                  {/* 门钉 - 右 */}
                  <div className="absolute top-1/3 left-5 w-3 h-3 rounded-full bg-white/[0.08]" />
                  <div className="absolute top-1/2 left-5 w-3 h-3 rounded-full bg-white/[0.08]" />
                  <div className="absolute top-2/3 left-5 w-3 h-3 rounded-full bg-white/[0.08]" />
                </motion.div>

                {/* 内容 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* ORACLE */}
                  <motion.h1
                    className="text-8xl font-extralight tracking-[0.4em] text-white mb-16"
                    style={{
                      textShadow: isHovered 
                        ? '0 0 100px rgba(255,255,255,0.6), 0 0 200px rgba(255,255,255,0.2)' 
                        : '0 0 60px rgba(255,255,255,0.3)',
                    }}
                    animate={{
                      letterSpacing: isHovered ? '0.45em' : '0.4em',
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    ORACLE
                  </motion.h1>

                  {/* 知命·顺势 */}
                  <motion.div 
                    className="flex items-center gap-8 mb-20"
                    animate={{ opacity: isHovered ? 1 : 0.5 }}
                  >
                    <span className="text-3xl font-extralight text-white tracking-[0.4em]">知命</span>
                    <span className="text-white/40 text-2xl">·</span>
                    <span className="text-3xl font-extralight text-white tracking-[0.4em]">顺势</span>
                  </motion.div>

                  {/* 开启命运之门 */}
                  <motion.div
                    className="px-10 py-5 rounded-full transition-all duration-500"
                    style={{
                      background: isHovered 
                        ? 'rgba(255,255,255,0.08)' 
                        : 'rgba(255,255,255,0.02)',
                      border: isHovered 
                        ? '0.5px solid rgba(255,255,255,0.35)' 
                        : '0.5px solid rgba(255,255,255,0.12)',
                      boxShadow: isHovered
                        ? '0 0 40px rgba(255,255,255,0.1)'
                        : 'none',
                    }}
                    animate={{
                      scale: isHovered ? 1.08 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <span 
                      className="text-sm tracking-[0.6em] font-light"
                      style={{
                        color: isHovered ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.45)',
                      }}
                    >
                      开启命运之门
                    </span>
                  </motion.div>
                </div>
              </motion.div>

              {/* 底部提示 */}
              <motion.p
                className="absolute -bottom-24 left-1/2 -translate-x-1/2 text-xs tracking-[0.4em] text-white/25"
                animate={{ opacity: isHovered ? 0.5 : 0.2 }}
              >
                点击进入
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              {/* 开门动画 */}
              <div className="relative w-[500px] h-[680px]">
                {/* 左门 */}
                <motion.div
                  className="absolute left-0 top-0 w-1/2 h-full overflow-hidden"
                  style={{
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                    borderRight: '0.5px solid rgba(255,255,255,0.1)',
                    transformOrigin: 'left center',
                  }}
                  animate={{ 
                    x: -400,
                    opacity: 0,
                    rotateY: -75,
                    scale: 0.9,
                  }}
                  transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                />
                {/* 右门 */}
                <motion.div
                  className="absolute right-0 top-0 w-1/2 h-full overflow-hidden"
                  style={{
                    background: 'linear-gradient(-90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                    transformOrigin: 'right center',
                  }}
                  animate={{ 
                    x: 400,
                    opacity: 0,
                    rotateY: 75,
                    scale: 0.9,
                  }}
                  transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                />
                {/* 光芒 */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1.5, 2, 2.5],
                  }}
                  transition={{ duration: 1.2, times: [0, 0.3, 0.6, 1] }}
                >
                  <div className="w-4 h-full bg-white/80 blur-3xl" />
                  <div className="absolute w-full h-4 bg-white/60 blur-3xl" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
