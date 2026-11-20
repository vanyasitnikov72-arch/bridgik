import React, { useRef, useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
}

interface BurnHole {
  rx: number;
  ry: number;
  delay: number;
  speed: number;
  seed: number;
}

const BURN_HOLES: BurnHole[] = [
  { rx: 0.32, ry: 0.45, delay: 0.0, speed: 1.25, seed: 15 },
  { rx: 0.75, ry: 0.38, delay: 0.08, speed: 1.15, seed: 42 },
  { rx: 0.52, ry: 0.72, delay: 0.15, speed: 1.05, seed: 73 },
  { rx: 0.88, ry: 0.68, delay: 0.22, speed: 1.3, seed: 91 },
  { rx: 0.14, ry: 0.62, delay: 0.26, speed: 1.2, seed: 38 },
];

interface BurnMessageWrapperProps {
  isBurner?: boolean;
  expiresAt?: number;
  children: React.ReactNode;
  className?: string;
  burnDurationMs?: number;
}

/**
 * Organic fractal burn-holes burnout effect.
 * When time expires, organic burning holes appear and expand across the message,
 * with bright flickering molten flame perimeters and rising embers.
 * Disappears 100% seamlessly with zero leftover borders or glow.
 */
export const BurnMessageWrapper: React.FC<BurnMessageWrapperProps> = ({
  isBurner,
  expiresAt,
  children,
  className = '',
  burnDurationMs = 2800,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    if (!isBurner || !expiresAt) return 999999;
    return Math.max(0, expiresAt - Date.now());
  });

  const isBurning = isBurner && expiresAt !== undefined && timeLeftMs <= burnDurationMs;

  // Countdown loop
  useEffect(() => {
    if (!isBurner || !expiresAt) return;

    let animId: number;
    let timerId: ReturnType<typeof setInterval>;

    const update = () => {
      const left = Math.max(0, expiresAt - Date.now());
      setTimeLeftMs(left);

      if (left <= burnDurationMs && left > 0) {
        animId = requestAnimationFrame(update);
      }
    };

    const initialLeft = Math.max(0, expiresAt - Date.now());
    if (initialLeft <= burnDurationMs) {
      animId = requestAnimationFrame(update);
    } else {
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

  // Canvas burn holes & molten fire border renderer
  useEffect(() => {
    if (!isBurning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = containerRef.current;
    if (!container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sparks: Particle[] = [];
    let animId: number;

    const resize = () => {
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
    ro.observe(container);

    const render = (now: number) => {
      const currentLeft = expiresAt ? Math.max(0, expiresAt - Date.now()) : 999999;
      const p = Math.min(1.0, Math.max(0, (burnDurationMs - currentLeft) / burnDurationMs));

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      if (w <= 0 || h <= 0) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const maxR = Math.hypot(w, h) * 0.72;

      // 1. Draw Burn Holes with molten fire edges
      BURN_HOLES.forEach((hole) => {
        const holeP = Math.max(0, (p - hole.delay) / (1 - hole.delay));
        if (holeP <= 0) return;

        const baseR = holeP * maxR * hole.speed;
        const cx = hole.rx * w;
        const cy = hole.ry * h;

        // Wavy organic fractal perimeter
        const numPoints = 28;
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
          const theta = (i / numPoints) * Math.PI * 2;
          const noise =
            Math.sin(theta * 3 + now * 0.008 + hole.seed) * 5 +
            Math.cos(theta * 6 - now * 0.012 + hole.seed) * 3 +
            Math.sin(theta * 9 + hole.seed * 2) * 1.8;
          const r = Math.max(1, baseR + noise);
          const px = cx + Math.cos(theta) * r;
          const py = cy + Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Fill inner hole with dark carbon / transparent overlay
        ctx.fillStyle = '#0c0e0b';
        ctx.fill();

        // Layer 1: Outer glowing flame halo
        ctx.save();
        ctx.lineWidth = 14;
        ctx.strokeStyle = 'rgba(255, 60, 0, 0.45)';
        ctx.shadowColor = '#ff3d00';
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.restore();

        // Layer 2: Core golden flame
        ctx.save();
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.85)';
        ctx.shadowColor = '#ffa500';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();

        // Layer 3: Hot incandescent white-yellow center
        ctx.save();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = 'rgba(255, 255, 220, 0.98)';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.restore();

        // Spawn ember sparks along perimeter
        if (Math.random() < 0.45 && p < 0.92) {
          const angle = Math.random() * Math.PI * 2;
          sparks.push({
            x: cx + Math.cos(angle) * baseR,
            y: cy + Math.sin(angle) * baseR,
            vx: (Math.random() - 0.5) * 1.6,
            vy: -(Math.random() * 2.2 + 1.0),
            size: Math.random() * 2 + 1,
            life: 0,
            maxLife: Math.random() * 28 + 18,
            hue: Math.random() * 30 + 18,
          });
        }
      });

      // 2. Render & update floating sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        if (s.life >= s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }
        const prog = s.life / s.maxLife;
        s.x += s.vx + Math.sin(s.life * 0.14) * 0.5;
        s.y += s.vy;
        s.vy -= 0.02;

        const alpha = Math.sin(prog * Math.PI);
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.5, s.size * (1 - prog * 0.5)), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 100%, 65%, ${alpha.toFixed(2)})`;
        ctx.shadowColor = `hsla(${s.hue}, 100%, 50%, 0.8)`;
        ctx.shadowBlur = 5;
        ctx.fill();
      }

      ctx.restore();

      if (p < 1.0) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [isBurning, expiresAt, burnDurationMs]);

  if (!isBurner) {
    return <>{children}</>;
  }

  const currentLeft = expiresAt ? Math.max(0, expiresAt - Date.now()) : 999999;
  const p = isBurning ? Math.min(1.0, Math.max(0, (burnDurationMs - currentLeft) / burnDurationMs)) : 0;

  // Fully seamless disappearance:
  // Card fades out as holes consume it, and by p >= 0.7 everything fades smoothly to 0
  const contentOpacity = isBurning ? Math.max(0, 1 - p * 1.15) : 1;
  const canvasOpacity = isBurning ? Math.max(0, 1 - Math.max(0, p - 0.75) / 0.23) : 1;
  const isFullyGone = p >= 0.98 || currentLeft <= 0;

  if (isFullyGone) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        opacity: isBurning ? Math.max(0, 1 - Math.max(0, p - 0.72) / 0.26) : 1,
        transition: isBurning ? 'none' : 'opacity 0.2s ease',
      }}
    >
      {/* Real original message content — unchanged layout, fades out seamlessly as it burns */}
      <div
        style={{
          opacity: contentOpacity,
          filter: isBurning ? `contrast(${100 + p * 30}%) brightness(${100 - p * 40}%)` : undefined,
          pointerEvents: isBurning ? 'none' : 'auto',
          transition: isBurning ? 'none' : 'opacity 0.2s ease',
        }}
        className="w-full"
      >
        {children}
      </div>

      {/* Burning holes & fire edges canvas overlay */}
      {isBurning && (
        <canvas
          ref={canvasRef}
          style={{ opacity: canvasOpacity }}
          className="absolute inset-0 pointer-events-none z-20 w-full h-full rounded-inherit"
        />
      )}
    </div>
  );
};

/**
 * Dedicated live ticking countdown badge with button-style Flame icon from lucide-react
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
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 select-none ${className}`}
      title="Сгорающее сообщение"
    >
      <Flame className="w-3 h-3 text-orange-400 shrink-0" />
      <span>{seconds}с</span>
    </span>
  );
};
