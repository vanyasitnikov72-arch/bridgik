import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#141414] py-8 relative overflow-hidden select-none">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center relative z-10">
        {/* Credits in Handjet font */}
        <div className="flex items-center justify-center gap-10 mb-4 text-sm sm:text-base">
          <div>
            <p className="text-[#999999] text-xs">Протокол</p>
            <p className="font-bold text-[#ededed] text-lg">WebRTC P2P Direct</p>
          </div>
          <div>
            <p className="text-[#999999] text-xs">Принцип</p>
            <p className="font-bold text-[#9ac43e] text-lg">Zero-Storage · 0 байт на сервере</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 text-xs sm:text-sm text-[#aaaaaa] mb-2">
          <span className="hover:text-white cursor-pointer transition-colors">О сервисе</span>
          <span className="text-[#3a3a3a]">·</span>
          <span className="hover:text-white cursor-pointer transition-colors">Конфиденциальность</span>
          <span className="text-[#3a3a3a]">·</span>
          <span className="hover:text-white cursor-pointer transition-colors">Direct-to-Disk</span>
          <span className="text-[#3a3a3a]">·</span>
          <span className="text-[#9ac43e] font-mono">bridgit.id</span>
        </div>

        <p className="text-[11px] text-[#999999]">
          bridgit — мгновенный мост между вашими экранами
        </p>
      </div>

      {/* Thematic Pixel Art: Retro PC on Left ↔ Bridge Waves ↔ Retro Phone on Right */}
      <div className="max-w-5xl mx-auto px-6 hidden sm:flex items-end justify-between absolute inset-x-0 bottom-1 pointer-events-none opacity-85">
        {/* Left Mascot: Retro 8-bit PC sending data */}
        <div className="flex items-end gap-2 translate-y-1">
          <svg
            width="46"
            height="44"
            viewBox="0 0 24 22"
            fill="none"
            className="shrink-0"
          >
            {/* Monitor Case */}
            <rect x="2" y="1" width="18" height="14" rx="1" fill="#222222" stroke="#3a3a3a" strokeWidth="1" />
            {/* Screen */}
            <rect x="4" y="3" width="14" height="10" fill="#171717" />
            {/* Smiling Screen Face ^_^ */}
            <rect x="6" y="6" width="2" height="1" fill="#9ac43e" />
            <rect x="7" y="5" width="2" height="1" fill="#9ac43e" />
            <rect x="13" y="6" width="2" height="1" fill="#9ac43e" />
            <rect x="12" y="5" width="2" height="1" fill="#9ac43e" />
            <rect x="9" y="9" width="4" height="1" fill="#9ac43e" />
            {/* Stand */}
            <rect x="9" y="15" width="4" height="2" fill="#2d2d2d" />
            <rect x="6" y="17" width="10" height="1" fill="#3a3a3a" />
            {/* Keyboard */}
            <rect x="3" y="19" width="16" height="2" rx="0.5" fill="#262626" />
            <rect x="5" y="19" width="3" height="1" fill="#789d2a" />
          </svg>

          {/* Emitted Pixel Signal Dots */}
          <div className="flex gap-1.5 pb-5">
            <span className="w-1.5 h-1.5 bg-[#789d2a] rounded-xs animate-pulse" />
            <span className="w-1.5 h-1.5 bg-[#9ac43e] rounded-xs animate-pulse delay-100" />
            <span className="w-1.5 h-1.5 bg-[#789d2a] rounded-xs animate-pulse delay-200" />
          </div>
        </div>

        {/* Right Mascot: Retro 8-bit Smartphone receiving data */}
        <div className="flex items-end gap-2 translate-y-1">
          {/* Incoming Pixel Signal Dots */}
          <div className="flex gap-1.5 pb-5">
            <span className="w-1.5 h-1.5 bg-[#789d2a] rounded-xs animate-pulse delay-200" />
            <span className="w-1.5 h-1.5 bg-[#9ac43e] rounded-xs animate-pulse delay-100" />
            <span className="w-1.5 h-1.5 bg-[#789d2a] rounded-xs animate-pulse" />
          </div>

          <svg
            width="32"
            height="44"
            viewBox="0 0 16 22"
            fill="none"
            className="shrink-0"
          >
            {/* Antenna */}
            <rect x="12" y="0" width="1.5" height="4" fill="#789d2a" />
            <rect x="11" y="0" width="3.5" height="1.5" fill="#9ac43e" />
            {/* Phone Body */}
            <rect x="1" y="3" width="14" height="18" rx="1.5" fill="#222222" stroke="#3a3a3a" strokeWidth="1" />
            {/* Screen */}
            <rect x="3" y="5" width="10" height="11" fill="#171717" />
            {/* Smiling Screen Face ^_^ */}
            <rect x="4" y="8" width="2" height="1" fill="#789d2a" />
            <rect x="10" y="8" width="2" height="1" fill="#789d2a" />
            <rect x="6" y="11" width="4" height="1" fill="#9ac43e" />
            {/* Home button / speaker */}
            <rect x="6.5" y="18" width="3" height="1.5" rx="0.5" fill="#3a3a3a" />
          </svg>
        </div>
      </div>
    </footer>
  );
};
