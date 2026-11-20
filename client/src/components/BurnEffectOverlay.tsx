import React, { useRef, useEffect, useState } from 'react';
import { sound } from '../utils/sound.js';

interface BurnMessageWrapperProps {
  isBurner?: boolean;
  expiresAt?: number;
  text?: string;
  senderName?: string;
  isAdmin?: boolean;
  isMe?: boolean;
  time?: string;
  children: React.ReactNode;
  className?: string;
  burnDurationMs?: number;
}

const vsSource = `
  attribute vec2 a_position;
  varying vec2 vUv;
  void main() {
    vUv = a_position;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fsSource = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  varying vec2 vUv;
  uniform vec2 u_resolution;
  uniform float u_progress;
  uniform float u_time;
  uniform sampler2D u_texture;

  float rand(vec2 n) {
    return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 n) {
    const vec2 d = vec2(0., 1.);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(
      mix(rand(b), rand(b + d.yx), f.x),
      mix(rand(b + d.xy), rand(b + d.yy), f.x),
      f.y
    );
  }

  float fbm(vec2 n) {
    float total = 0.0;
    float amplitude = 0.45;
    for (int i = 0; i < 4; i++) {
      total += noise(n) * amplitude;
      n += n;
      amplitude *= 0.55;
    }
    return total;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;

    vec2 screenUv = vUv * 0.5 + 0.5;
    screenUv.y = 1.0 - screenUv.y;

    vec4 color = texture2D(u_texture, screenUv);
    if (color.a < 0.01) {
      discard;
    }

    float p = clamp(u_progress, 0.0, 1.0);
    // Fractal noise for organic burning holes across the card
    float main_noise = 1.0 - fbm(2.2 * uv + 8.5 - vec2(0.2, 0.9 * p));

    // Ash charring along the edges of the holes
    float burn = smoothstep(main_noise - 0.15, main_noise, p);
    color.rgb -= vec3(0.95, 0.92, 0.95) * burn;

    // Glowing fire color & fiery edge
    vec3 fire_color = fbm(7.0 * uv - vec2(0.0, 0.007 * u_time)) * vec3(8.0, 2.2, 0.2);
    float show_fire = smoothstep(0.3, 0.9, fbm(12.0 * uv + 2.0 - vec2(0.0, 0.007 * u_time)));
    float fire_border = 0.05 * show_fire;

    float fire_edge = smoothstep(main_noise - fire_border, main_noise - 0.5 * fire_border, p);
    fire_edge *= (1.0 - smoothstep(main_noise - 0.5 * fire_border, main_noise, p));

    color.rgb += fire_color * fire_edge;
    float opacity = 1.0 - smoothstep(main_noise - 0.001, main_noise, p);

    gl_FragColor = vec4(color.rgb, color.a * opacity);
  }
`;

function renderCardToCanvas(
  w: number,
  h: number,
  dpr: number,
  props: {
    text?: string;
    senderName?: string;
    isAdmin?: boolean;
    isMe?: boolean;
    time?: string;
  },
  containerEl?: HTMLElement | null
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(10, Math.floor(w * dpr));
  canvas.height = Math.max(10, Math.floor(h * dpr));
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.scale(dpr, dpr);

  // Background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#281307');
  grad.addColorStop(1, '#150a04');
  ctx.fillStyle = grad;
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(1, 1, w - 2, h - 2, 14);
  } else {
    ctx.rect(1, 1, w - 2, h - 2);
  }
  ctx.fill();
  ctx.stroke();

  const senderName = props.senderName || 'Пользователь';
  const text = props.text || containerEl?.innerText || '';
  const time = props.time || '';

  // Avatar circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(22, 22, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#ea580c';
  ctx.fill();
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(senderName.charAt(0).toUpperCase(), 22, 22);
  ctx.restore();

  // Header: sender name
  ctx.fillStyle = props.isAdmin ? '#f59e0b' : '#ededed';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(senderName, 40, 26);

  let badgeOffset = 40 + ctx.measureText(senderName).width + 6;
  if (props.isAdmin) {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.fillRect(badgeOffset, 14, 28, 15);
    ctx.strokeRect(badgeOffset, 14, 28, 15);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('DEV', badgeOffset + 4, 25);
  }

  // Timer flame badge & time on right
  if (time) {
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(time, w - 14, 25);
  }

  // Text body
  ctx.fillStyle = '#ededed';
  ctx.font = '15px sans-serif';
  ctx.textAlign = 'left';

  const maxWidth = w - 28;
  const words = text.split(' ');
  let line = '';
  let y = 52;
  const lineHeight = 20;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, 14, y);
      line = words[i] + ' ';
      y += lineHeight;
      if (y > h - 10) break;
    } else {
      line = testLine;
    }
  }
  if (line && y <= h) {
    ctx.fillText(line, 14, y);
  }

  return canvas;
}

export const BurnMessageWrapper: React.FC<BurnMessageWrapperProps> = ({
  isBurner,
  expiresAt,
  text,
  senderName,
  isAdmin,
  isMe,
  time,
  children,
  className = '',
  burnDurationMs = 3000,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playedSoundRef = useRef(false);

  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    if (!isBurner || !expiresAt) return 999999;
    return Math.max(0, expiresAt - Date.now());
  });

  const isBurning = isBurner && expiresAt !== undefined && timeLeftMs <= burnDurationMs;

  useEffect(() => {
    if (!isBurner || !expiresAt) return;

    let animId: number;
    let timerId: ReturnType<typeof setInterval>;

    const update = () => {
      const left = Math.max(0, expiresAt - Date.now());
      setTimeLeftMs(left);

      if (left <= burnDurationMs && !playedSoundRef.current) {
        playedSoundRef.current = true;
        sound.playBurn();
      }

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

  // WebGL Shader setup & rendering
  useEffect(() => {
    if (!isBurning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = containerRef.current;
    if (!container) return;

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false });
    if (!gl) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    // Compile shaders
    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, vsSource);
    const fs = compile(gl.FRAGMENT_SHADER, fsSource);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uProg = gl.getUniformLocation(prog, 'u_progress');
    const uTime = gl.getUniformLocation(prog, 'u_time');

    // Create & upload texture of the message card
    const cardCanvas = renderCardToCanvas(
      w,
      h,
      dpr,
      { text, senderName, isAdmin, isMe, time },
      container
    );

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cardCanvas);

    let animId: number;

    const render = (now: number) => {
      animId = requestAnimationFrame(render);

      const currentLeft = expiresAt ? Math.max(0, expiresAt - Date.now()) : 999999;
      const progress = Math.min(1.0, Math.max(0, (burnDurationMs - currentLeft) / burnDurationMs));

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uProg, progress);
      gl.uniform1f(uTime, now);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      gl.deleteTexture(tex);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(posBuf);
    };
  }, [isBurning, expiresAt, burnDurationMs, text, senderName, isAdmin, isMe, time]);

  if (!isBurner) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className} ${
        isBurning
          ? 'shadow-[0_0_20px_rgba(249,115,22,0.4)]'
          : 'ring-1 ring-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.18)]'
      }`}
      style={{
        transition: isBurning ? 'none' : 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* HTML content is visible during normal countdown, then cleanly hidden when burning */}
      <div
        style={{
          opacity: isBurning ? 0 : 1,
          pointerEvents: isBurning ? 'none' : 'auto',
          transition: 'opacity 0.15s ease',
        }}
        className="w-full"
      >
        {children}
      </div>

      {/* WebGL Canvas running the exact Atuin burning shader */}
      {isBurning && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-20 w-full h-full rounded-inherit"
        />
      )}
    </div>
  );
};

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
