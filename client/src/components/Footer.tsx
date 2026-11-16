import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#141414] py-8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center relative z-10">
        {/* Credits in Handjet font */}
        <div className="flex items-center justify-center gap-10 mb-5 text-sm sm:text-base">
          <div>
            <p className="text-[#999999] text-xs">Протокол</p>
            <p className="font-bold text-[#ededed] text-lg">WebRTC DataChannel</p>
          </div>
          <div>
            <p className="text-[#999999] text-xs">Разработка</p>
            <p className="font-bold text-[#ededed] text-lg">AirBridge P2P</p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-[#aaaaaa]">
          <span className="hover:text-white cursor-pointer transition-colors">Правила</span>
          <span className="text-[#3a3a3a]">·</span>
          <span className="hover:text-white cursor-pointer transition-colors">Конфиденциальность</span>
          <span className="text-[#3a3a3a]">·</span>
          <span className="hover:text-white cursor-pointer transition-colors">Zero-Storage манифест</span>
          <span className="text-[#3a3a3a]">·</span>
          <span className="text-[#9ac43e]">p2p.airbridge</span>
        </div>
      </div>

      {/* Retro 8-bit Pixel Art Mascots (like on eblo.id footer in Image 3) */}
      <div className="max-w-5xl mx-auto px-6 hidden sm:flex items-end justify-between absolute inset-x-0 bottom-1 pointer-events-none opacity-80">
        {/* Purple Pac-Man Ghost */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 14 14"
          fill="#a978f0"
          className="translate-y-1"
        >
          {/* Ghost Body */}
          <path d="M4 1h6v1h2v2h1v7h-1v1h-1v-1h-1v1h-2v-1h-1v1h-2v-1h-1v1H3v-1H2V4h1V2h1V1z" />
          {/* Eyes White */}
          <rect x="3" y="4" width="2" height="3" fill="#ffffff" />
          <rect x="7" y="4" width="2" height="3" fill="#ffffff" />
          {/* Pupils */}
          <rect x="3" y="5" width="1" height="2" fill="#171717" />
          <rect x="7" y="5" width="1" height="2" fill="#171717" />
        </svg>

        {/* Green Pixel Dino */}
        <svg
          width="38"
          height="42"
          viewBox="0 0 16 18"
          fill="#789d2a"
          className="translate-y-1"
        >
          {/* Dino Head */}
          <rect x="8" y="1" width="7" height="6" />
          <rect x="14" y="2" width="2" height="4" />
          <rect x="9" y="3" width="1" height="1" fill="#171717" /> {/* Eye */}
          <rect x="11" y="6" width="5" height="1" fill="#171717" /> {/* Mouth */}
          {/* Body & Arms */}
          <rect x="6" y="7" width="8" height="6" />
          <rect x="12" y="10" width="3" height="1" />
          <rect x="4" y="9" width="3" height="4" /> {/* Tail */}
          <rect x="2" y="10" width="2" height="2" />
          {/* Legs */}
          <rect x="7" y="13" width="2" height="4" />
          <rect x="10" y="13" width="2" height="3" />
        </svg>
      </div>
    </footer>
  );
};
