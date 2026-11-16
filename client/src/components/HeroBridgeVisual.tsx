import React, { useState } from 'react';
import { Monitor, Smartphone, Zap, FileText, ArrowRight, ShieldCheck, Wifi } from 'lucide-react';

export const HeroBridgeVisual: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTransferTab, setActiveTransferTab] = useState<'file' | 'clip' | 'stream'>('file');

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mb-8 w-full select-none rounded-3xl bg-gradient-to-b from-[#18181c] via-[#131316] to-[#0e0e11] border border-[#2e2e38] hover:border-[#789d2a]/50 shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-4 sm:p-6 transition-all duration-300 relative overflow-hidden group"
    >
      {/* Background Ambient Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,157,42,0.18),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f280a_1px,transparent_1px),linear-gradient(to_bottom,#1f1f280a_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />

      {/* Top Status Header */}
      <div className="relative z-10 flex items-center justify-between mb-4 pb-3 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#789d2a] animate-ping" />
          <span className="font-mono font-bold text-[#bbf348] uppercase tracking-wider text-[11px] sm:text-xs">
            WebRTC Direct Bridge · P2P
          </span>
        </div>

        {/* Live Transfer Type Switcher */}
        <div className="flex items-center gap-1 bg-[#1a1a22] border border-white/10 rounded-xl p-1 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setActiveTransferTab('file')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              activeTransferTab === 'file'
                ? 'bg-[#789d2a] text-white font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Файлы
          </button>
          <button
            type="button"
            onClick={() => setActiveTransferTab('clip')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              activeTransferTab === 'clip'
                ? 'bg-[#789d2a] text-white font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Буфер
          </button>
          <button
            type="button"
            onClick={() => setActiveTransferTab('stream')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              activeTransferTab === 'stream'
                ? 'bg-[#789d2a] text-white font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Экран
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[#888888] text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#9ac43e]" />
          <span>0 байт на сервере</span>
        </div>
      </div>

      {/* Main Bridge Architecture: Screen 1 ↔ Suspension Bridge & Laser ↔ Screen 2 */}
      <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4 my-2 sm:my-4">
        {/* ================= LEFT DEVICE: COMPUTER (Экран 1) ================= */}
        <div className="flex flex-col items-center shrink-0 w-28 sm:w-40 transition-transform duration-300 group-hover:scale-102">
          {/* Monitor Display */}
          <div className="w-full aspect-[4/3] rounded-2xl bg-[#141418] border-2 border-[#383844] shadow-xl p-2 sm:p-2.5 flex flex-col justify-between relative overflow-hidden group-hover:border-[#789d2a]/80 transition-colors">
            {/* Screen Top Bar */}
            <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[9px] font-mono text-[#777777]">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#789d2a]" />
              </div>
              <span className="text-[#9ac43e] font-bold hidden sm:inline">ПК / Mac</span>
            </div>

            {/* Screen Content: File/Sending Widget */}
            <div className="flex-1 flex flex-col items-center justify-center p-1 sm:p-2 text-center bg-[#0d120a] rounded-lg my-1 border border-[#789d2a]/30">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#789d2a]/20 border border-[#789d2a]/50 flex items-center justify-center text-[#bbf348] mb-1 shadow-[0_0_12px_rgba(120,157,42,0.3)]">
                {activeTransferTab === 'file' ? (
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : activeTransferTab === 'clip' ? (
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-white truncate max-w-full">
                {activeTransferTab === 'file' ? 'archive.zip' : activeTransferTab === 'clip' ? 'Буфер (Ctrl+V)' : '60 FPS Экран'}
              </p>
              <p className="text-[8px] sm:text-[9px] text-[#9ac43e] font-mono">
                {activeTransferTab === 'file' ? '4.8 GB · Отправка' : activeTransferTab === 'clip' ? 'Текст / Скриншот' : 'Full HD 1080p'}
              </p>
            </div>

            {/* Screen Base Glow */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#789d2a] to-transparent rounded-full opacity-60" />
          </div>

          {/* Monitor Stand */}
          <div className="w-5 sm:w-7 h-2.5 sm:h-3 bg-[#2a2a32] border-x border-[#383844]" />
          <div className="w-12 sm:w-16 h-1.5 sm:h-2 bg-[#22222a] border border-[#383844] rounded-full shadow-md" />

          {/* Device Label */}
          <div className="mt-2 text-center">
            <span className="text-xs sm:text-sm font-extrabold text-[#ededed] block font-mono">
              [ Экран 1 ]
            </span>
            <span className="text-[10px] sm:text-xs text-[#888888] flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#789d2a]" />
              Компьютер
            </span>
          </div>
        </div>

        {/* ================= CENTER: CYBER SUSPENSION BRIDGE & DATA BEAM ================= */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-w-0 px-1 sm:px-3">
          {/* Top Suspension Cables & Pylons (SVG) */}
          <div className="w-full h-16 sm:h-24 relative overflow-visible">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 300 80"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#789d2a" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#bbf348" stopOpacity="1" />
                  <stop offset="100%" stopColor="#789d2a" stopOpacity="0.4" />
                </linearGradient>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Left Pylon Tower (Вантовый пилон 1) */}
              <g className="opacity-90">
                <line x1="45" y1="5" x2="35" y2="78" stroke="#484856" strokeWidth="2.5" />
                <line x1="45" y1="5" x2="55" y2="78" stroke="#484856" strokeWidth="2.5" />
                <line x1="38" y1="40" x2="52" y2="40" stroke="#789d2a" strokeWidth="1.5" />
                <line x1="40" y1="60" x2="50" y2="60" stroke="#383842" strokeWidth="1.5" />
                <circle cx="45" cy="5" r="3.5" fill="#bbf348" filter="url(#neonGlow)" />
              </g>

              {/* Right Pylon Tower (Вантовый пилон 2) */}
              <g className="opacity-90">
                <line x1="255" y1="5" x2="245" y2="78" stroke="#484856" strokeWidth="2.5" />
                <line x1="255" y1="5" x2="265" y2="78" stroke="#484856" strokeWidth="2.5" />
                <line x1="248" y1="40" x2="262" y2="40" stroke="#789d2a" strokeWidth="1.5" />
                <line x1="250" y1="60" x2="260" y2="60" stroke="#383842" strokeWidth="1.5" />
                <circle cx="255" cy="5" r="3.5" fill="#bbf348" filter="url(#neonGlow)" />
              </g>

              {/* Main Suspension Cables (Ванты) */}
              {/* Center Hanging Arc */}
              <path
                d="M 45 5 Q 150 68 255 5"
                fill="none"
                stroke="url(#bridgeGradient)"
                strokeWidth="2.5"
                filter="url(#neonGlow)"
              />
              <path
                d="M 45 8 Q 150 72 255 8"
                fill="none"
                stroke="#3a3a46"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Left Backstay Cable */}
              <path d="M 0 55 L 45 5" fill="none" stroke="#444452" strokeWidth="1.5" />
              {/* Right Backstay Cable */}
              <path d="M 255 5 L 300 55" fill="none" stroke="#444452" strokeWidth="1.5" />

              {/* Vertical Suspenders across bridge span */}
              {[70, 95, 120, 150, 180, 205, 230].map((x) => {
                const norm = (x - 150) / 105;
                const yTop = 5 + 63 * (1 - Math.cos(norm * 1.3));
                return (
                  <line
                    key={x}
                    x1={x}
                    y1={Math.min(yTop, 75)}
                    x2={x}
                    y2={78}
                    stroke="#2e2e38"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                );
              })}

              {/* Road Deck Beam / Truss Foundation */}
              <line x1="0" y1="78" x2="300" y2="78" stroke="#33333f" strokeWidth="3" />
              <line
                x1="0"
                y1="78"
                x2="300"
                y2="78"
                stroke="#789d2a"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            </svg>

            {/* Glowing Flowing Data Stream along the bridge road */}
            <div className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none overflow-hidden">
              {/* Laser Core */}
              <div className="w-full h-1 bg-gradient-to-r from-[#789d2a]/20 via-[#bbf348] to-[#789d2a]/20 shadow-[0_0_12px_#9ac43e] mt-1" />

              {/* Continuous animated flying packets */}
              <div
                className="animate-bridge-flow flex items-center gap-1.5"
                style={{ animationDuration: isHovered ? '1.8s' : '2.8s' }}
              >
                <div className="px-2 py-0.5 rounded-full bg-[#1b2413] border border-[#789d2a] text-[#bbf348] text-[9px] font-mono font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(187,243,72,0.6)]">
                  <span>⚡ 82 MB/s</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Second Packet Staggered */}
              <div
                className="animate-bridge-flow flex items-center gap-1.5"
                style={{
                  animationDuration: isHovered ? '1.8s' : '2.8s',
                  animationDelay: isHovered ? '0.9s' : '1.4s',
                }}
              >
                <div className="px-1.5 py-0.5 rounded-md bg-[#789d2a] text-white text-[8px] font-mono font-extrabold shadow-[0_0_10px_#9ac43e]">
                  P2P Chunk
                </div>
              </div>
            </div>
          </div>

          {/* Central Bridge Pillar Badge */}
          <div className="mt-2 px-3 py-1 rounded-full bg-[#16161c]/90 border border-[#789d2a]/60 text-[#bbf348] text-[10px] sm:text-xs font-mono font-bold shadow-lg flex items-center gap-1.5 hover:border-[#bbf348] transition-colors cursor-default backdrop-blur-md">
            <Wifi className="w-3.5 h-3.5 text-[#9ac43e] animate-pulse" />
            <span className="truncate">bridgik · Прямой радиомост</span>
          </div>
        </div>

        {/* ================= RIGHT DEVICE: SMARTPHONE (Экран 2) ================= */}
        <div className="flex flex-col items-center shrink-0 w-20 sm:w-28 transition-transform duration-300 group-hover:scale-102">
          {/* Smartphone Chassis */}
          <div className="w-full aspect-[9/17] rounded-2xl bg-[#141418] border-2 border-[#383844] shadow-xl p-1.5 sm:p-2 flex flex-col justify-between relative overflow-hidden group-hover:border-[#789d2a]/80 transition-colors">
            {/* Top Speaker / Dynamic Island */}
            <div className="flex items-center justify-center mb-1">
              <div className="w-6 sm:w-8 h-1.5 rounded-full bg-[#25252e] border border-white/10" />
            </div>

            {/* Phone Screen Glass */}
            <div className="flex-1 flex flex-col items-center justify-center p-1 text-center bg-[#0d120a] rounded-xl my-0.5 border border-[#789d2a]/30">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#789d2a] text-white flex items-center justify-center mb-1 shadow-[0_0_12px_rgba(120,157,42,0.4)]">
                <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-white leading-tight">
                Получено!
              </p>
              <span className="text-[8px] sm:text-[9px] font-mono text-[#bbf348] font-bold">
                100% · Direct
              </span>
            </div>

            {/* Home Indicator Bar */}
            <div className="flex justify-center mt-1">
              <div className="w-7 sm:w-10 h-0.8 bg-white/30 rounded-full" />
            </div>
          </div>

          {/* Device Label */}
          <div className="mt-2 text-center">
            <span className="text-xs sm:text-sm font-extrabold text-[#ededed] block font-mono">
              [ Экран 2 ]
            </span>
            <span className="text-[10px] sm:text-xs text-[#888888] flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#789d2a]" />
              Смартфон
            </span>
          </div>
        </div>
      </div>

      {/* Footer Feature Pills */}
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#888888] font-mono">
        <span className="text-[#9ac43e] font-semibold flex items-center gap-1">
          <span>⚡</span> Без проводов, проволочек и облачных хранилищ
        </span>
        <span className="text-[#aaaaaa] hidden sm:inline">
          Прямое соединение: Браузер ↔ Браузер
        </span>
      </div>
    </div>
  );
};
