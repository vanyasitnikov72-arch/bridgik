import React, { useState } from 'react';
import { sound } from '../utils/sound.js';

export const HeroBridgeVisual: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [packetCount, setPacketCount] = useState(0);

  const handleClick = () => {
    sound.playClick();
    setPacketCount((prev) => prev + 1);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mb-6 w-full select-none cursor-pointer group"
      title="Нажмите для импульса передачи данных"
    >
      {/* Top minimal status line in eblo.id font-mono style */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[#777777] mb-1.5 px-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#9ac43e] animate-pulse" />
          <span className="text-[#9ac43e] font-bold tracking-wider uppercase text-[10px] sm:text-[11px]">
            [ прямой канал связи ]
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px]">
          <span className="text-[#888888]">p2p webrtc datachannel</span>
          <span className="text-[#444444]">/</span>
          <span className="text-[#9ac43e] hidden sm:inline">0 байт на сервере</span>
        </div>
      </div>

      {/* Pixel Art Suspension Bridge Container */}
      <div className="relative w-full h-20 sm:h-24 bg-[#121214] border border-[#26262a] rounded-xl overflow-hidden group-hover:border-[#789d2a]/60 transition-colors">
        {/* Subtle Pixel Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a20_1px,transparent_1px),linear-gradient(to_bottom,#1a1a20_1px,transparent_1px)] bg-[size:8px_8px] opacity-40 pointer-events-none" />

        {/* Ambient Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-[#789d2a]/10 rounded-full blur-xl pointer-events-none" />

        {/* SVG Pixel Canvas with Crisp Edges */}
        <svg
          className="w-full h-full absolute inset-0"
          viewBox="0 0 600 80"
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
        >
          {/* ================= LEFT PYLON TOWER (Узел A) ================= */}
          <g>
            {/* Tower Base & Legs */}
            <rect x="52" y="24" width="6" height="42" fill="#222228" />
            <rect x="68" y="24" width="6" height="42" fill="#222228" />
            <rect x="58" y="32" width="10" height="3" fill="#303038" />
            <rect x="58" y="46" width="10" height="3" fill="#303038" />
            <rect x="58" y="60" width="10" height="3" fill="#2a2a32" />

            {/* Pylon Crown Head */}
            <rect x="50" y="16" width="26" height="8" fill="#2a2a32" />
            <rect x="56" y="12" width="14" height="4" fill="#383842" />

            {/* Glowing Beacon on Left Tower */}
            <rect x="61" y="8" width="4" height="4" fill="#9ac43e" />
            <rect x="62" y="6" width="2" height="2" fill="#bbf348" className="animate-pulse" />

            {/* Radio / P2P Signal Waves emitting left */}
            <rect x="42" y="6" width="2" height="8" fill="#789d2a" opacity="0.4" />
            <rect x="36" y="4" width="2" height="12" fill="#789d2a" opacity="0.25" />
            <rect x="30" y="2" width="2" height="16" fill="#789d2a" opacity="0.15" />

            {/* Pier Foundation below deck */}
            <rect x="48" y="68" width="30" height="12" fill="#18181e" />
            <rect x="46" y="76" width="34" height="4" fill="#141418" />
          </g>

          {/* ================= RIGHT PYLON TOWER (Узел B) ================= */}
          <g>
            {/* Tower Base & Legs */}
            <rect x="526" y="24" width="6" height="42" fill="#222228" />
            <rect x="542" y="24" width="6" height="42" fill="#222228" />
            <rect x="532" y="32" width="10" height="3" fill="#303038" />
            <rect x="532" y="46" width="10" height="3" fill="#303038" />
            <rect x="532" y="60" width="10" height="3" fill="#2a2a32" />

            {/* Pylon Crown Head */}
            <rect x="524" y="16" width="26" height="8" fill="#2a2a32" />
            <rect x="530" y="12" width="14" height="4" fill="#383842" />

            {/* Glowing Beacon on Right Tower */}
            <rect x="535" y="8" width="4" height="4" fill="#9ac43e" />
            <rect x="536" y="6" width="2" height="2" fill="#bbf348" className="animate-pulse" />

            {/* Radio / P2P Signal Waves emitting right */}
            <rect x="556" y="6" width="2" height="8" fill="#789d2a" opacity="0.4" />
            <rect x="562" y="4" width="2" height="12" fill="#789d2a" opacity="0.25" />
            <rect x="568" y="2" width="2" height="16" fill="#789d2a" opacity="0.15" />

            {/* Pier Foundation below deck */}
            <rect x="522" y="68" width="30" height="12" fill="#18181e" />
            <rect x="520" y="76" width="34" height="4" fill="#141418" />
          </g>

          {/* ================= PIXEL SUSPENSION CABLE ARC ================= */}
          {/* Stepped Pixel Arc from Left Tower (63, 14) to Center (300, 52) to Right Tower (537, 14) */}
          <g fill="#4a523a">
            {/* Left to Center stepped blocks */}
            <rect x="63" y="14" width="12" height="2" fill="#789d2a" />
            <rect x="75" y="16" width="12" height="2" fill="#789d2a" />
            <rect x="87" y="18" width="14" height="2" />
            <rect x="101" y="21" width="14" height="2" />
            <rect x="115" y="24" width="16" height="2" />
            <rect x="131" y="28" width="16" height="2" />
            <rect x="147" y="32" width="18" height="2" />
            <rect x="165" y="36" width="18" height="2" />
            <rect x="183" y="40" width="20" height="2" />
            <rect x="203" y="44" width="22" height="2" />
            <rect x="225" y="47" width="24" height="2" />
            <rect x="249" y="50" width="26" height="2" />
            {/* Lowest center sag */}
            <rect x="275" y="52" width="50" height="2" fill="#9ac43e" />
            {/* Center to Right stepped blocks */}
            <rect x="325" y="50" width="26" height="2" />
            <rect x="351" y="47" width="24" height="2" />
            <rect x="375" y="44" width="22" height="2" />
            <rect x="397" y="40" width="20" height="2" />
            <rect x="417" y="36" width="18" height="2" />
            <rect x="435" y="32" width="18" height="2" />
            <rect x="453" y="28" width="16" height="2" />
            <rect x="469" y="24" width="16" height="2" />
            <rect x="485" y="21" width="14" height="2" />
            <rect x="499" y="18" width="14" height="2" />
            <rect x="513" y="16" width="12" height="2" fill="#789d2a" />
            <rect x="525" y="14" width="12" height="2" fill="#789d2a" />

            {/* Backstay cables to edges */}
            <rect x="0" y="52" width="18" height="2" fill="#303038" />
            <rect x="18" y="42" width="16" height="2" fill="#303038" />
            <rect x="34" y="28" width="16" height="2" fill="#303038" />
            <rect x="50" y="16" width="14" height="2" fill="#303038" />

            <rect x="536" y="16" width="14" height="2" fill="#303038" />
            <rect x="550" y="28" width="16" height="2" fill="#303038" />
            <rect x="566" y="42" width="16" height="2" fill="#303038" />
            <rect x="582" y="52" width="18" height="2" fill="#303038" />
          </g>

          {/* Vertical Suspenders (Pixel Drop Hangers) */}
          {[100, 130, 160, 190, 220, 250, 350, 380, 410, 440, 470, 500].map((x) => {
            const norm = (x - 300) / 237;
            const yTop = 52 - 38 * (1 - norm * norm);
            return (
              <rect
                key={x}
                x={x}
                y={Math.max(16, yTop)}
                width="2"
                height={66 - Math.max(16, yTop)}
                fill="#24242c"
              />
            );
          })}

          {/* ================= BRIDGE ROAD DECK ================= */}
          {/* Main Road Deck Bar */}
          <rect x="0" y="66" width="600" height="3" fill="#2a2a32" />
          <rect x="0" y="67" width="600" height="1" fill="#789d2a" opacity="0.6" />

          {/* Dotted Pixel Road Markings */}
          {Array.from({ length: 30 }).map((_, i) => (
            <rect
              key={i}
              x={i * 20 + 4}
              y="66"
              width="8"
              height="1"
              fill="#9ac43e"
              opacity="0.9"
            />
          ))}
        </svg>

        {/* ================= LIVE MOVING PIXEL PACKETS ================= */}
        {/* Packet 1: Gliding along the deck Left to Right */}
        <div
          className="animate-bridge-flow absolute bottom-[9px] pointer-events-none flex items-center gap-1 z-10"
          style={{ animationDuration: isHovered ? '2.0s' : '3.4s' }}
        >
          <div className="w-2.5 h-2 bg-[#bbf348] shadow-[0_0_8px_#9ac43e]" />
          <div className="w-1.5 h-1.5 bg-[#789d2a] opacity-80" />
          <div className="w-1 h-1 bg-[#789d2a] opacity-50" />
        </div>

        {/* Packet 2: Staggered packet */}
        <div
          className="animate-bridge-flow absolute bottom-[9px] pointer-events-none flex items-center gap-1 z-10"
          style={{
            animationDuration: isHovered ? '2.0s' : '3.4s',
            animationDelay: isHovered ? '1.0s' : '1.7s',
          }}
        >
          <div className="w-2.5 h-2 bg-[#9ac43e] shadow-[0_0_8px_#789d2a]" />
          <div className="w-1.5 h-1.5 bg-[#789d2a] opacity-70" />
        </div>

        {/* Center Minimalist Pixel Pill */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#101014]/90 border border-[#303038] group-hover:border-[#789d2a] transition-colors text-[10px] font-mono text-[#aaaaaa]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#789d2a] animate-ping" />
          <span className="text-[#ededed] font-bold">bridgik</span>
          <span className="text-[#666666]">::</span>
          <span className="text-[#9ac43e]">мост</span>
          {packetCount > 0 && (
            <span className="text-[9px] text-[#bbf348] font-bold ml-1">+{packetCount}</span>
          )}
        </div>

        {/* Left Node Indicator */}
        <div className="absolute bottom-1.5 left-2 z-20 text-[9px] font-mono text-[#777777] flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#9ac43e]" />
          <span>[ узел 1 ]</span>
        </div>

        {/* Right Node Indicator */}
        <div className="absolute bottom-1.5 right-2 z-20 text-[9px] font-mono text-[#777777] flex items-center gap-1">
          <span>[ узел 2 ]</span>
          <span className="w-1.5 h-1.5 bg-[#9ac43e]" />
        </div>
      </div>
    </div>
  );
};
