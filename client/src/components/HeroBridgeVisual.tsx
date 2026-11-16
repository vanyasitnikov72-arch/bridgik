import React, { useState } from 'react';

export const HeroBridgeVisual: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mb-6 w-full select-none group"
    >
      {/* Pixel Art Suspension Bridge Frame */}
      <div className="relative w-full h-24 sm:h-28 bg-[#0f0f12] border border-[#26262e] hover:border-[#789d2a]/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.7)]">
        {/* Subtle Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#191922_1px,transparent_1px),linear-gradient(to_bottom,#191922_1px,transparent_1px)] bg-[size:10px_10px] opacity-30 pointer-events-none" />

        {/* Center River / Bridge Ambient Reflection Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-[#789d2a]/10 to-transparent blur-md pointer-events-none" />

        {/* SVG Pixel Architecture Canvas */}
        <svg
          className="w-full h-full absolute inset-0 overflow-visible"
          viewBox="0 0 600 90"
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
        >
          {/* ================= WATER / GROUND BASE HORIZON ================= */}
          <rect x="0" y="82" width="600" height="8" fill="#09090c" />
          <line x1="0" y1="82" x2="600" y2="82" stroke="#1c1c24" strokeWidth="1" />

          {/* ================= UNDER-DECK TRUSS GIRDERS (Ферма жесткости) ================= */}
          {/* Lower chord bar */}
          <rect x="0" y="75" width="600" height="2" fill="#1e1e26" />
          {/* Diagonal lattice struts under the deck */}
          {Array.from({ length: 40 }).map((_, i) => {
            const x = i * 15;
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={68}
                  x2={x + 7.5}
                  y2={75}
                  stroke="#22222c"
                  strokeWidth="1"
                />
                <line
                  x1={x + 7.5}
                  y1={75}
                  x2={x + 15}
                  y2={68}
                  stroke="#22222c"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* ================= LEFT BRIDGE TOWER / PYLON (Пилон 1) ================= */}
          <g>
            {/* Underwater Concrete Pier Footing */}
            <rect x="58" y="74" width="34" height="14" fill="#14141a" />
            <rect x="56" y="84" width="38" height="4" fill="#0d0d12" />
            <rect x="60" y="74" width="30" height="2" fill="#282834" />

            {/* Left Tower Twin Legs with Archway in center */}
            {/* Left Leg */}
            <rect x="62" y="14" width="8" height="60" fill="#282832" />
            <rect x="62" y="14" width="2" height="60" fill="#444456" /> {/* Highlight */}
            <rect x="68" y="14" width="2" height="60" fill="#1a1a22" /> {/* Shadow */}

            {/* Right Leg */}
            <rect x="80" y="14" width="8" height="60" fill="#282832" />
            <rect x="80" y="14" width="2" height="60" fill="#444456" />
            <rect x="86" y="14" width="2" height="60" fill="#1a1a22" />

            {/* Archway Portal Header & Cross Struts */}
            <rect x="68" y="24" width="14" height="4" fill="#323240" />
            <rect x="68" y="42" width="14" height="4" fill="#323240" />
            <rect x="68" y="58" width="14" height="4" fill="#323240" />

            {/* Portal Arch Curved Top */}
            <rect x="70" y="62" width="10" height="2" fill="#3a3a4c" />
            <rect x="72" y="60" width="6" height="2" fill="#3a3a4c" />

            {/* X-Braces between legs (Upper tier) */}
            <line x1="70" y1="28" x2="80" y2="42" stroke="#22222a" strokeWidth="1" />
            <line x1="80" y1="28" x2="70" y2="42" stroke="#22222a" strokeWidth="1" />
            {/* X-Braces between legs (Middle tier) */}
            <line x1="70" y1="46" x2="80" y2="58" stroke="#22222a" strokeWidth="1" />
            <line x1="80" y1="46" x2="70" y2="58" stroke="#22222a" strokeWidth="1" />

            {/* Tower Crown / Capital */}
            <rect x="58" y="10" width="34" height="5" fill="#363644" />
            <rect x="64" y="6" width="22" height="4" fill="#444456" />
            <rect x="72" y="3" width="6" height="3" fill="#58586c" />

            {/* Green Warning Beacon Light on Top */}
            <rect x="73" y="1" width="4" height="3" fill="#9ac43e" />
            <rect x="74" y="0" width="2" height="1" fill="#bbf348" className="animate-pulse" />
          </g>

          {/* ================= RIGHT BRIDGE TOWER / PYLON (Пилон 2) ================= */}
          <g>
            {/* Underwater Concrete Pier Footing */}
            <rect x="508" y="74" width="34" height="14" fill="#14141a" />
            <rect x="506" y="84" width="38" height="4" fill="#0d0d12" />
            <rect x="510" y="74" width="30" height="2" fill="#282834" />

            {/* Right Tower Twin Legs */}
            {/* Left Leg */}
            <rect x="512" y="14" width="8" height="60" fill="#282832" />
            <rect x="512" y="14" width="2" height="60" fill="#444456" />
            <rect x="518" y="14" width="2" height="60" fill="#1a1a22" />

            {/* Right Leg */}
            <rect x="530" y="14" width="8" height="60" fill="#282832" />
            <rect x="530" y="14" width="2" height="60" fill="#444456" />
            <rect x="536" y="14" width="2" height="60" fill="#1a1a22" />

            {/* Archway Portal Header & Cross Struts */}
            <rect x="518" y="24" width="14" height="4" fill="#323240" />
            <rect x="518" y="42" width="14" height="4" fill="#323240" />
            <rect x="518" y="58" width="14" height="4" fill="#323240" />

            {/* Portal Arch Curved Top */}
            <rect x="520" y="62" width="10" height="2" fill="#3a3a4c" />
            <rect x="522" y="60" width="6" height="2" fill="#3a3a4c" />

            {/* X-Braces */}
            <line x1="520" y1="28" x2="530" y2="42" stroke="#22222a" strokeWidth="1" />
            <line x1="530" y1="28" x2="520" y2="42" stroke="#22222a" strokeWidth="1" />
            <line x1="520" y1="46" x2="530" y2="58" stroke="#22222a" strokeWidth="1" />
            <line x1="530" y1="46" x2="520" y2="58" stroke="#22222a" strokeWidth="1" />

            {/* Tower Crown */}
            <rect x="508" y="10" width="34" height="5" fill="#363644" />
            <rect x="514" y="6" width="22" height="4" fill="#444456" />
            <rect x="522" y="3" width="6" height="3" fill="#58586c" />

            {/* Green Warning Beacon Light */}
            <rect x="523" y="1" width="4" height="3" fill="#9ac43e" />
            <rect x="524" y="0" width="2" height="1" fill="#bbf348" className="animate-pulse" />
          </g>

          {/* ================= SUSPENSION CABLES & FAN STAYS ================= */}
          {/* Main Suspension Cable (Catenary Arc) */}
          <path
            d="M 75 10 Q 300 66 525 10"
            fill="none"
            stroke="#5a7a28"
            strokeWidth="2.5"
          />
          {/* Glowing Green Center Highlight on Main Cable */}
          <path
            d="M 75 11 Q 300 67 525 11"
            fill="none"
            stroke="#9ac43e"
            strokeWidth="1.2"
            opacity="0.9"
          />

          {/* Backstay Cables anchored to shore */}
          <line x1="0" y1="68" x2="75" y2="10" stroke="#485828" strokeWidth="2.5" />
          <line x1="0" y1="67" x2="75" y2="9" stroke="#9ac43e" strokeWidth="1" opacity="0.6" />

          <line x1="525" y1="10" x2="600" y2="68" stroke="#485828" strokeWidth="2.5" />
          <line x1="525" y1="9" x2="600" y2="67" stroke="#9ac43e" strokeWidth="1" opacity="0.6" />

          {/* Radiating Fan Stay Cables (Ванты от пилонов к полотну) */}
          {/* Left Tower Fan */}
          <line x1="75" y1="12" x2="115" y2="67" stroke="#2e3820" strokeWidth="1" />
          <line x1="75" y1="12" x2="145" y2="67" stroke="#2e3820" strokeWidth="1" />
          <line x1="75" y1="12" x2="175" y2="67" stroke="#2e3820" strokeWidth="1" />
          <line x1="75" y1="12" x2="205" y2="67" stroke="#2e3820" strokeWidth="1" />
          <line x1="75" y1="12" x2="235" y2="67" stroke="#2e3820" strokeWidth="1" />
          {/* Back fan left */}
          <line x1="75" y1="12" x2="40" y2="67" stroke="#282834" strokeWidth="1" />
          <line x1="75" y1="12" x2="15" y2="67" stroke="#282834" strokeWidth="1" />

          {/* Right Tower Fan */}
          <line x1="525" y1="12" x2="485" y2="67" stroke="#2e3820" strokeWidth="1" />
          <line x1="525" y1="12" x2="455" y2="67" stroke="#2e3820" strokeWidth="1" />
          <line x1="525" y1="12" x2="425" y2="67" stroke="#2e3820" strokeWidth="1" />
          <line x1="525" y1="12" x2="395" y2="67" stroke="#2e3820" strokeWidth="1" />
          <line x1="525" y1="12" x2="365" y2="67" stroke="#2e3820" strokeWidth="1" />
          {/* Back fan right */}
          <line x1="525" y1="12" x2="560" y2="67" stroke="#282834" strokeWidth="1" />
          <line x1="525" y1="12" x2="585" y2="67" stroke="#282834" strokeWidth="1" />

          {/* Vertical Hangers in the center span */}
          {[260, 280, 300, 320, 340].map((x) => {
            const norm = (x - 300) / 225;
            const yTop = 66 - 55 * (1 - norm * norm);
            return (
              <line
                key={x}
                x1={x}
                y1={Math.max(12, yTop)}
                x2={x}
                y2={67}
                stroke="#3e4a28"
                strokeWidth="1"
              />
            );
          })}

          {/* ================= ROAD DECK (Полотно моста) ================= */}
          {/* Guard Railing (Перила) */}
          <rect x="0" y="63" width="600" height="1" fill="#444456" />
          {Array.from({ length: 60 }).map((_, i) => (
            <rect
              key={i}
              x={i * 10 + 2}
              y="63"
              width="1"
              height="4"
              fill="#343442"
            />
          ))}

          {/* Main Road Deck Slab */}
          <rect x="0" y="67" width="600" height="3" fill="#22222a" />
          <rect x="0" y="67" width="600" height="1" fill="#3a3a46" />

          {/* Glowing Green Centerline on the Deck */}
          <line
            x1="0"
            y1="69"
            x2="600"
            y2="69"
            stroke="#789d2a"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.9"
            className="animate-pulse"
          />
        </svg>

        {/* ================= LIVE STREAMING DATA PACKETS ================= */}
        {/* Packet 1: Primary Data Packet (Green glowing pixel block) */}
        <div
          className="animate-bridge-flow absolute bottom-[18px] pointer-events-none flex items-center gap-1 z-20"
          style={{ animationDuration: isHovered ? '2.2s' : '3.6s' }}
        >
          <div className="w-3 h-2.5 bg-[#bbf348] rounded-xs shadow-[0_0_10px_#9ac43e] border border-white/60" />
          <div className="w-1.5 h-1.5 bg-[#9ac43e] rounded-xs opacity-80" />
          <div className="w-1 h-1 bg-[#789d2a] rounded-xs opacity-50" />
        </div>

        {/* Packet 2: Staggered P2P Chunk */}
        <div
          className="animate-bridge-flow absolute bottom-[18px] pointer-events-none flex items-center gap-1 z-20"
          style={{
            animationDuration: isHovered ? '2.2s' : '3.6s',
            animationDelay: isHovered ? '1.1s' : '1.8s',
          }}
        >
          <div className="w-3 h-2.5 bg-[#9ac43e] rounded-xs shadow-[0_0_8px_#789d2a] border border-[#bbf348]/40" />
          <div className="w-1.5 h-1.5 bg-[#789d2a] rounded-xs opacity-75" />
        </div>

        {/* Packet 3: Return ACK Packet (Moving Right to Left) */}
        <div
          className="animate-bridge-flow-reverse absolute bottom-[18px] pointer-events-none flex items-center gap-1 z-20"
          style={{
            animationDuration: isHovered ? '2.5s' : '4.2s',
            animationDelay: '0.6s',
          }}
        >
          <div className="w-1.5 h-1.5 bg-[#bbf348] rounded-xs shadow-[0_0_6px_#bbf348]" />
        </div>
      </div>
    </div>
  );
};
