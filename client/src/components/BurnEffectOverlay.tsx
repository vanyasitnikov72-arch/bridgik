import React, { useRef, useEffect, useState } from 'react';
import { sound } from '../utils/sound.js';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
  seed: number;
  isAsh?: boolean;
}

interface BurnMessageWrapperProps {
  isBurner?: boolean;
  expiresAt?: number;
  children: React.ReactNode;
  className?: string;
  burnDurationMs?: number;
}

/**
 * High-performance, cross-browser burning message burnout effect
 * inspired by WebGL dissolve/fire shaders (like atuin.ru).
 * Combines organic wavy molten fire front, rising ember sparks & ash flakes,
 * charred carbon discoloration, and dynamic dissolve mask.
 */
export const BurnMessageWrapper: React.FC<BurnMessageWrapperProps> = ({
  isBurner,
  expiresAt,
  children,
  className = '',
  burnDurationMs = 2500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playedSoundRef = useRef(false);

  // Remaining time in ms
  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    if (!isBurner || !expiresAt) return 999999;
    return Math.max(0, expiresAt - Date.now());
  });

  const isBurning = isBurner && expiresAt !== undefined && timeLeftMs <= burnDurationMs;
  const burnProgress = isBurning
    ? Math.min(1, Math.max(0, (burnDurationMs - timeLeftMs) / burnDurationMs))
    : 0;

  // Countdown & animation loop
  useEffect(() => {
    if (!isBurner || !expiresAt) return;

    let animId: number;
    let timerId: ReturnType<typeof setInterval>;

    const update = () => {
      const left = Math.max(0, expiresAt - Date.now());
      setTimeLeftMs(left);

      // Play subtle fire crackle when entering final burnout phase
      if (left <= burnDurationMs && !playedSoundRef.current) {
        playedSoundRef.current = true;
        sound.playBurn();
      }

      if (left <= burnDurationMs && left > 0) {
        animId = requestAnimationFrame(update);
      }
    };

    // If already in burn zone, drive at 60fps immediately
    const initialLeft = Math.max(0, expiresAt - Date.now());
    if (initialLeft <= burnDurationMs) {
      animId = requestAnimationFrame(update);
    } else {
      // Coarser check until we enter the last few seconds
      timerId = setInterval(() => {
        const left = Math.max(0, expiresAt - Date.now());
        setTimeLeftMs(left);
        if (left <= burnDurationMs) {
          clearInterval(timerId);
          animId = requestAnimationFrame(update);
        }
      }, 200);
    }

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(timerId);
    };
  }, [isBurner, expiresAt, burnDurationMs]);

  // Canvas particle and fire front renderer
  useEffect(() => {
    if (!isBurner) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const w = Math.ceil(rect.width);
      const h = Math.ceil(rect.height);
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);

    const render = (now: number) => {
      animId = requestAnimationFrame(render);

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      if (w <= 0 || h <= 0) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const currentLeft = expiresAt ? Math.max(0, expiresAt - Date.now()) : 999999;
      const currentBurning = currentLeft <= burnDurationMs;
      const p = currentBurning ? Math.min(1, Math.max(0, (burnDurationMs - currentLeft) / burnDurationMs)) : 0;

      // 1. Particle Spawning
      if (currentBurning && p < 0.98) {
        // Active burnout phase: spawn embers along the moving fire line
        const fireY = (1 - p) * h;
        const count = Math.random() < 0.85 ? 3 : 1;
        for (let i = 0; i < count; i++) {
          const isAsh = Math.random() < 0.25;
          particles.push({
            x: Math.random() * w,
            y: fireY + (Math.random() * 8 - 4),
            vx: (Math.random() - 0.5) * 1.8,
            vy: -(Math.random() * 2.5 + 1.2),
            size: isAsh ? Math.random() * 2 + 1 : Math.random() * 2.5 + 1.2,
            life: 0,
            maxLife: Math.random() * 35 + 25,
            hue: Math.random() * 32 + 18, // 18-50: red-orange to golden yellow
            seed: Math.random() * 100,
            isAsh,
          });
        }
      } else if (!currentBurning && Math.random() < 0.15) {
        // Ambient phase: occasional floating warm ember
        particles.push({
          x: Math.random() * w,
          y: h - 2,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(Math.random() * 0.9 + 0.4),
          size: Math.random() * 1.5 + 1,
          life: 0,
          maxLife: Math.random() * 30 + 20,
          hue: 28,
          seed: Math.random() * 100,
        });
      }

      // 2. Draw Fire Front Line (Molten edge) during burning phase
      if (currentBurning && p > 0.01 && p < 0.98) {
        const fireY = (1 - p) * h;
        const waveStep = Math.max(6, w / 32);

        // Build wavy fire front path
        ctx.beginPath();
        for (let x = 0; x <= w + waveStep; x += waveStep) {
          const wave =
            Math.sin(x * 0.05 + now * 0.009) * 4.5 +
            Math.cos(x * 0.11 - now * 0.014) * 3 +
            Math.sin(x * 0.02 + now * 0.004) * 2;
          const y = fireY + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // Pass A: Outer intense flame glow
        ctx.save();
        ctx.lineWidth = 16;
        ctx.strokeStyle = 'rgba(255, 69, 0, 0.45)';
        ctx.shadowColor = '#ff3d00';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();

        // Pass B: Core golden flame
        ctx.save();
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.85)';
        ctx.shadowColor = '#ffa500';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        // Pass C: Hot incandescent center
        ctx.save();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = 'rgba(255, 255, 220, 0.98)';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.life++;
        if (pt.life >= pt.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const progress = pt.life / pt.maxLife;
        pt.x += pt.vx + Math.sin(pt.life * 0.12 + pt.seed) * 0.6;
        pt.y += pt.vy;
        pt.vy -= 0.02; // Upward draft acceleration

        const alpha = Math.sin(progress * Math.PI) * (1 - progress * 0.3);

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(0.5, pt.size * (1 - progress * 0.5)), 0, Math.PI * 2);

        if (pt.isAsh) {
          // Floating soot / ash flake
          ctx.fillStyle = `rgba(30, 20, 15, ${alpha.toFixed(2)})`;
          ctx.shadowBlur = 0;
        } else {
          // Glowing spark
          const currentHue = pt.hue + progress * 14;
          const lightness = 65 - progress * 20;
          ctx.fillStyle = `hsla(${currentHue}, 100%, ${lightness}%, ${alpha.toFixed(2)})`;
          ctx.shadowColor = `hsla(${currentHue}, 100%, 50%, 0.8)`;
          ctx.shadowBlur = 6;
        }
        ctx.fill();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [isBurner, expiresAt, burnDurationMs]);

  if (!isBurner) {
    return <>{children}</>;
  }

  // Dynamic CSS Mask that eats the card from bottom to top as burnProgress increases
  const maskStyle: React.CSSProperties = isBurning
    ? {
        maskImage: `linear-gradient(to top, transparent 0%, transparent calc(${burnProgress * 100}% - 4%), rgba(0,0,0,0.4) calc(${burnProgress * 100}% + 2%), black calc(${burnProgress * 100}% + 14%))` ,
        WebkitMaskImage: `linear-gradient(to top, transparent 0%, transparent calc(${burnProgress * 100}% - 4%), rgba(0,0,0,0.4) calc(${burnProgress * 100}% + 2%), black calc(${burnProgress * 100}% + 14%))` ,
        filter: `contrast(${100 + burnProgress * 35}%) brightness(${100 - burnProgress * 35}%) sepia(${burnProgress * 45}%)`,
        opacity: burnProgress >= 0.99 ? 0 : 1,
        transform: `translateY(${Math.sin(Date.now() * 0.08) * (burnProgress * 1.5)}px)`,
        pointerEvents: burnProgress >= 0.95 ? 'none' : 'auto',
      }
    : {};

  return (
    <div
      ref={containerRef}
      className={`relative ${className} ${
        isBurning
          ? 'ring-1 ring-orange-500/70 shadow-[0_0_20px_rgba(249,115,22,0.45)]'
          : 'ring-1 ring-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
      }`}
      style={{
        transition: isBurning ? 'none' : 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Underlying content with dynamic burn-away mask & charring */}
      <div style={maskStyle} className="relative z-10 w-full">
        {children}
      </div>

      {/* Fiery canvas overlay with embers and molten edge */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20 w-full h-full rounded-inherit"
      />
    </div>
  );
};

/**
 * Dedicated live ticking countdown badge for self-destructing messages
 */
export const BurnCountdownBadge: React.FC<{
  expiresAt: number;
  className?: string;
}> = ({ expiresAt, className = '' }) => {
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 animate-pulse select-none ${className}`}
      title="Сообщение сгорает"
    >
      <span className="text-xs">🔥</span>
      <span>{seconds}с</span>
    </span>
  );
};
