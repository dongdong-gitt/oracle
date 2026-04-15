'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CyberGateProps {
  onEnter: () => void;
}

/** 八卦符号 */
const TRIGRAMS = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];

/** 天干地支 */
const GANZHI = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸',
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥',
];

export default function CyberGate({ onEnter }: CyberGateProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── 粒子背景 ── */
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

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; hue: number;
    };

    const particles: Particle[] = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 2.5 + 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        hue: Math.random() * 60 + 180, // 180-240 cyan-blue range
      });
    }

    let animationId: number;
    let frame = 0;

    const animate = () => {
      frame++;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.008 + p.hue);
        const finalAlpha = p.alpha * (0.6 + pulse * 0.4);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${finalAlpha})`;
        ctx.fill();
      });

      // draw faint connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.03 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

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
    setTimeout(onEnter, 1500);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 背景 - 中式窗棂图案 */}
      <div className="absolute inset-0 opacity-[0.03]">
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

      {/* 中心辉光 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{
          scale: isHovered ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: isHovered ? [0.12, 0.2, 0.12] : [0.06, 0.1, 0.06],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-[900px] h-[900px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)',
          }}
        />
      </motion.div>

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
              {/* 外圈八卦符文环 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-[900px] h-[900px] -m-[250px]"
              >
                <svg viewBox="0 0 200 200" className="w-full h-full opacity-[0.06]">
                  <circle cx="100" cy="100" r="98" fill="none" stroke="white" strokeWidth="0.3" strokeDasharray="1 6"/>
                  <circle cx="100" cy="100" r="88" fill="none" stroke="white" strokeWidth="0.2" strokeDasharray="4 8"/>
                </svg>
                {/* 八卦符号 */}
                {TRIGRAMS.map((char, i) => {
                  const angle = (i / TRIGRAMS.length) * 360;
                  const rad = (angle * Math.PI) / 180;
                  const r = 92;
                  const x = 50 + r * Math.cos(rad - Math.PI / 2);
                  const y = 50 + r * Math.sin(rad - Math.PI / 2);
                  return (
                    <span
                      key={i}
                      className="absolute text-white/[0.06] text-xl"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </motion.div>

              {/* 内圈装饰环 - 逆旋 */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-[700px] h-[700px] -m-[150px]"
              >
                <svg viewBox="0 0 200 200" className="w-full h-full opacity-[0.04]">
                  <circle cx="100" cy="100" r="96" fill="none" stroke="url(#ring-grad)" strokeWidth="0.5" strokeDasharray="2 4"/>
                  <defs>
                    <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgb(6,182,212)" />
                      <stop offset="100%" stopColor="rgb(168,85,247)" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* 天干地支符号 */}
                {GANZHI.slice(0, 12).map((char, i) => {
                  const angle = (i / 12) * 360;
                  const rad = (angle * Math.PI) / 180;
                  const r = 94;
                  const x = 50 + r * Math.cos(rad - Math.PI / 2);
                  const y = 50 + r * Math.sin(rad - Math.PI / 2);
                  return (
                    <span
                      key={i}
                      className="absolute text-white/[0.04] text-xs font-light"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </motion.div>

              {/* 门的主体 */}
              <motion.div
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                onClick={handleEnter}
                className="relative w-[500px] h-[680px] cursor-pointer"
                whileHover={{ scale: 1.005 }}
              >
                {/* 门框 - 外部光晕 */}
                <motion.div
                  className="absolute -inset-1 rounded-xl"
                  animate={{
                    boxShadow: isHovered
                      ? [
                          '0 0 60px rgba(6,182,212,0.08), inset 0 0 60px rgba(6,182,212,0.03)',
                          '0 0 100px rgba(6,182,212,0.12), inset 0 0 80px rgba(6,182,212,0.05)',
                          '0 0 60px rgba(6,182,212,0.08), inset 0 0 60px rgba(6,182,212,0.03)',
                        ]
                      : [
                          '0 0 40px rgba(255,255,255,0.02)',
                          '0 0 60px rgba(255,255,255,0.04)',
                          '0 0 40px rgba(255,255,255,0.02)',
                        ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* 门框 - 主体 */}
                <div
                  className="absolute inset-0 rounded-lg transition-all duration-700"
                  style={{
                    background: isHovered
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(6,182,212,0.03) 50%, rgba(255,255,255,0.04) 100%)'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.02) 100%)',
                    border: isHovered
                      ? '1px solid rgba(6,182,212,0.3)'
                      : '1px solid rgba(255,255,255,0.08)',
                  }}
                />

                {/* 门环装饰 - 上 */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <motion.div
                  className="absolute top-5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4), rgba(6,182,212,0.1))' }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* 门环装饰 - 下 */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <motion.div
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4), rgba(168,85,247,0.1))' }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.25 }}
                />

                {/* 中缝 */}
                <motion.div
                  className="absolute left-1/2 top-12 bottom-12 w-px -translate-x-1/2"
                  animate={{
                    background: isHovered
                      ? [
                          'linear-gradient(180deg, transparent 0%, rgba(6,182,212,0.5) 20%, rgba(168,85,247,0.4) 50%, rgba(6,182,212,0.5) 80%, transparent 100%)',
                          'linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.4) 20%, rgba(6,182,212,0.5) 50%, rgba(168,85,247,0.4) 80%, transparent 100%)',
                          'linear-gradient(180deg, transparent 0%, rgba(6,182,212,0.5) 20%, rgba(168,85,247,0.4) 50%, rgba(6,182,212,0.5) 80%, transparent 100%)',
                        ]
                      : 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.15) 80%, transparent 100%)',
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* 左门 */}
                <motion.div
                  className="absolute left-0 top-0 w-1/2 h-full overflow-hidden"
                  animate={{ x: isHovered ? -10 : 0 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  style={{ borderRight: '0.5px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="absolute inset-5 border border-white/[0.04] rounded" />
                  {/* 门钉 - 左 */}
                  {[1/4, 1/3, 1/2, 2/3, 3/4].map((pos, i) => (
                    <motion.div
                      key={i}
                      className="absolute right-5 w-2.5 h-2.5 rounded-full"
                      style={{
                        top: `${pos * 100}%`,
                        background: isHovered
                          ? 'radial-gradient(circle, rgba(6,182,212,0.3), rgba(6,182,212,0.05))'
                          : 'rgba(255,255,255,0.06)',
                      }}
                      animate={{ opacity: isHovered ? [0.3, 0.7, 0.3] : 0.5 }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </motion.div>

                {/* 右门 */}
                <motion.div
                  className="absolute right-0 top-0 w-1/2 h-full overflow-hidden"
                  animate={{ x: isHovered ? 10 : 0 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="absolute inset-5 border border-white/[0.04] rounded" />
                  {/* 门钉 - 右 */}
                  {[1/4, 1/3, 1/2, 2/3, 3/4].map((pos, i) => (
                    <motion.div
                      key={i}
                      className="absolute left-5 w-2.5 h-2.5 rounded-full"
                      style={{
                        top: `${pos * 100}%`,
                        background: isHovered
                          ? 'radial-gradient(circle, rgba(168,85,247,0.3), rgba(168,85,247,0.05))'
                          : 'rgba(255,255,255,0.06)',
                      }}
                      animate={{ opacity: isHovered ? [0.3, 0.7, 0.3] : 0.5 }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 + 0.1 }}
                    />
                  ))}
                </motion.div>

                {/* 内容 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* 太极符号 */}
                  <motion.div
                    className="mb-10 text-white/[0.08] text-5xl"
                    animate={{ rotate: isHovered ? 360 : 0 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    ☯
                  </motion.div>

                  {/* ORACLE */}
                  <motion.h1
                    className="text-8xl font-extralight tracking-[0.4em] text-white mb-4"
                    style={{
                      textShadow: isHovered
                        ? '0 0 80px rgba(6,182,212,0.5), 0 0 160px rgba(168,85,247,0.2)'
                        : '0 0 60px rgba(255,255,255,0.3)',
                    }}
                    animate={{
                      letterSpacing: isHovered ? '0.5em' : '0.4em',
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    ORACLE
                  </motion.h1>

                  {/* 副标题 */}
                  <motion.p
                    className="text-sm tracking-[0.5em] text-white/20 mb-16 font-light"
                    animate={{ opacity: isHovered ? 0.5 : 0.2 }}
                  >
                    赛博玄学 · AI 命理
                  </motion.p>

                  {/* 知命·顺势 */}
                  <motion.div
                    className="flex items-center gap-8 mb-20"
                    animate={{ opacity: isHovered ? 1 : 0.5 }}
                  >
                    <motion.span
                      className="text-3xl font-extralight text-white tracking-[0.4em]"
                      animate={{
                        textShadow: isHovered
                          ? '0 0 30px rgba(6,182,212,0.4)'
                          : '0 0 10px rgba(255,255,255,0.1)',
                      }}
                    >
                      知命
                    </motion.span>
                    <motion.span
                      className="text-2xl"
                      style={{ color: isHovered ? 'rgba(6,182,212,0.6)' : 'rgba(255,255,255,0.25)' }}
                      animate={{ rotate: [0, 180, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    >
                      ·
                    </motion.span>
                    <motion.span
                      className="text-3xl font-extralight text-white tracking-[0.4em]"
                      animate={{
                        textShadow: isHovered
                          ? '0 0 30px rgba(168,85,247,0.4)'
                          : '0 0 10px rgba(255,255,255,0.1)',
                      }}
                    >
                      顺势
                    </motion.span>
                  </motion.div>

                  {/* 开启命运之门 - CTA */}
                  <motion.div
                    className="relative px-10 py-5 rounded-full overflow-hidden"
                    style={{
                      background: isHovered
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(255,255,255,0.02)',
                      border: isHovered
                        ? '0.5px solid rgba(6,182,212,0.4)'
                        : '0.5px solid rgba(255,255,255,0.12)',
                    }}
                    animate={{
                      scale: isHovered ? 1.08 : 1,
                      boxShadow: isHovered
                        ? '0 0 50px rgba(6,182,212,0.15), 0 0 100px rgba(168,85,247,0.08)'
                        : '0 0 0 transparent',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {/* 扫光效果 */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.1) 50%, transparent 100%)',
                      }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                    />
                    <span
                      className="relative text-sm tracking-[0.6em] font-light"
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
              <motion.div className="absolute -bottom-28 left-1/2 -translate-x-1/2 text-center">
                <motion.p
                  className="text-xs tracking-[0.4em] text-white/20 mb-2"
                  animate={{ opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  CLICK TO ENTER
                </motion.p>
                <motion.div
                  className="w-px h-8 mx-auto bg-gradient-to-b from-white/20 to-transparent"
                  animate={{ scaleY: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>
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
                  animate={{ x: -500, opacity: 0, rotateY: -85, scale: 0.85 }}
                  transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                />
                {/* 右门 */}
                <motion.div
                  className="absolute right-0 top-0 w-1/2 h-full overflow-hidden"
                  style={{
                    background: 'linear-gradient(-90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                    transformOrigin: 'right center',
                  }}
                  animate={{ x: 500, opacity: 0, rotateY: 85, scale: 0.85 }}
                  transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                />
                {/* 光芒爆发 */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.8, 1, 0],
                    scale: [0.3, 1.2, 2, 3],
                  }}
                  transition={{ duration: 1.5, times: [0, 0.25, 0.6, 1] }}
                >
                  <div
                    className="w-8 h-full blur-3xl"
                    style={{
                      background: 'linear-gradient(180deg, rgba(6,182,212,0.8), rgba(168,85,247,0.6), rgba(6,182,212,0.8))',
                    }}
                  />
                  <div
                    className="absolute w-full h-8 blur-3xl"
                    style={{
                      background: 'linear-gradient(90deg, rgba(168,85,247,0.6), rgba(6,182,212,0.8), rgba(168,85,247,0.6))',
                    }}
                  />
                </motion.div>
                {/* 全屏白闪 */}
                <motion.div
                  className="fixed inset-0 bg-white pointer-events-none z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0, 0.6, 0] }}
                  transition={{ duration: 1.5, times: [0, 0.5, 0.7, 1] }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 四角装饰 */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-white/[0.06] rounded-tl-lg" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-white/[0.06] rounded-tr-lg" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-white/[0.06] rounded-bl-lg" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-white/[0.06] rounded-br-lg" />

      {/* 版本号 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-white/10 font-mono">
        ORACLE v2.0 · AI METAPHYSICS ENGINE
      </div>
    </div>
  );
}
