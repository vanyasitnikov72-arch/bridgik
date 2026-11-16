import React from 'react';

interface FooterProps {
  onOpenAbout?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#141414] py-8 relative overflow-hidden select-none">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center relative z-10">
        {/* Credits in Handjet font */}
        <div className="flex items-center justify-center gap-10 mb-4 text-base sm:text-lg">
          <div>
            <p className="text-[#999999] text-sm">Протокол</p>
            <p className="font-bold text-[#ededed] text-xl">WebRTC P2P Direct</p>
          </div>
          <div>
            <p className="text-[#999999] text-sm">Принцип</p>
            <p className="font-bold text-[#9ac43e] text-xl">Zero-Storage · 0 байт на сервере</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 text-base sm:text-lg text-[#aaaaaa] mb-2 font-medium">
          <span onClick={onOpenAbout} className="hover:text-white cursor-pointer transition-colors">Конфиденциальность</span>
          <span className="text-[#3a3a3a]">·</span>
          <span onClick={onOpenAbout} className="hover:text-white cursor-pointer transition-colors">Direct-to-Disk</span>
          <span className="text-[#3a3a3a]">·</span>
          <span onClick={onOpenAbout} className="hover:text-white cursor-pointer transition-colors">Zero-Storage манифест</span>
          <span className="text-[#3a3a3a]">·</span>
          <span className="text-[#9ac43e] font-mono font-bold">bridgik.ru</span>
        </div>

        <p className="text-sm sm:text-base text-[#999999]">
          bridgik — мгновенный мост между вашими экранами
        </p>
      </div>

      {/* Thematic Pixel Art: Highly Detailed Retro PC ↔ Floating Packet Bridge ↔ Detailed Retro Phone */}
      <div className="max-w-5xl mx-auto px-4 hidden sm:flex items-end justify-between absolute inset-x-0 bottom-1 pointer-events-none opacity-90">
        {/* Left Detailed Retro PC */}
        <div className="flex items-end gap-3 translate-y-0.5">
          <svg
            width="68"
            height="62"
            viewBox="0 0 34 31"
            shapeRendering="crispEdges"
            className="shrink-0 drop-shadow-sm"
          >
            {/* Monitor Outer Shell with Shading */}
            <rect x="2" y="1" width="24" height="18" fill="#2d2d2d" />
            <rect x="2" y="1" width="24" height="1" fill="#444444" /> {/* Top highlight */}
            <rect x="2" y="1" width="1" height="18" fill="#3a3a3a" /> {/* Left highlight */}
            <rect x="25" y="2" width="1" height="17" fill="#1e1e1e" /> {/* Right shadow */}
            <rect x="2" y="18" width="24" height="1" fill="#1a1a1a" /> {/* Bottom shadow */}

            {/* Monitor Inner Bezel */}
            <rect x="4" y="3" width="20" height="13" fill="#1c1c1c" />

            {/* CRT Phosphor Screen */}
            <rect x="5" y="4" width="18" height="11" fill="#0d1408" />

            {/* Terminal Prompt on screen: >_ */}
            <rect x="6" y="5" width="1" height="1" fill="#789d2a" />
            <rect x="7" y="6" width="1" height="1" fill="#789d2a" />
            <rect x="6" y="7" width="1" height="1" fill="#789d2a" />
            <rect x="9" y="7" width="2" height="1" fill="#9ac43e" className="animate-pulse" />

            {/* Cute Pixel Eyes ^  ^ */}
            <rect x="9" y="8" width="1" height="2" fill="#9ac43e" />
            <rect x="10" y="7" width="2" height="1" fill="#9ac43e" />
            <rect x="12" y="8" width="1" height="2" fill="#9ac43e" />

            <rect x="16" y="8" width="1" height="2" fill="#9ac43e" />
            <rect x="17" y="7" width="2" height="1" fill="#9ac43e" />
            <rect x="19" y="8" width="1" height="2" fill="#9ac43e" />

            {/* Cute Pixel Smile \__/ */}
            <rect x="13" y="11" width="1" height="1" fill="#9ac43e" />
            <rect x="14" y="12" width="2" height="1" fill="#9ac43e" />
            <rect x="16" y="11" width="1" height="1" fill="#9ac43e" />

            {/* Monitor Power LED & Knobs */}
            <rect x="20" y="16" width="1" height="1" fill="#789d2a" /> {/* Green Power LED */}
            <rect x="22" y="16" width="1" height="1" fill="#3a3a3a" /> {/* Contrast Dial */}

            {/* Monitor Neck / Swivel Stand */}
            <rect x="12" y="19" width="4" height="2" fill="#222222" />
            <rect x="11" y="20" width="6" height="1" fill="#1e1e1e" />

            {/* Computer Base / Chassis */}
            <rect x="1" y="21" width="26" height="6" fill="#2d2d2d" />
            <rect x="1" y="21" width="26" height="1" fill="#3d3d3d" />
            <rect x="26" y="22" width="1" height="5" fill="#1b1b1b" />
            <rect x="1" y="26" width="26" height="1" fill="#181818" />

            {/* Floppy 3.5" Drive Slot & LED */}
            <rect x="4" y="23" width="9" height="1" fill="#141414" />
            <rect x="14" y="23" width="1" height="1" fill="#789d2a" /> {/* Floppy LED */}

            {/* CD-ROM Tray & Eject */}
            <rect x="4" y="25" width="11" height="1" fill="#181818" />
            <rect x="16" y="25" width="1" height="1" fill="#3a3a3a" />

            {/* Power Button on Chassis */}
            <rect x="22" y="23" width="2" height="2" fill="#789d2a" />

            {/* Mechanical Keyboard in front */}
            <rect x="2" y="28" width="24" height="3" fill="#242424" />
            <rect x="2" y="28" width="24" height="1" fill="#333333" />
            {/* Keyboard Keys */}
            <rect x="4" y="29" width="1" height="1" fill="#4a4a4a" />
            <rect x="6" y="29" width="1" height="1" fill="#4a4a4a" />
            <rect x="8" y="29" width="1" height="1" fill="#4a4a4a" />
            <rect x="10" y="29" width="1" height="1" fill="#4a4a4a" />
            <rect x="12" y="29" width="5" height="1" fill="#789d2a" /> {/* Spacebar */}
            <rect x="18" y="29" width="1" height="1" fill="#4a4a4a" />
            <rect x="20" y="29" width="1" height="1" fill="#4a4a4a" />
            <rect x="22" y="29" width="2" height="1" fill="#4a4a4a" />

            {/* Mouse with cord */}
            <rect x="28" y="29" width="3" height="2" fill="#2c2c2c" />
            <rect x="29" y="29" width="1" height="1" fill="#789d2a" /> {/* Mouse button */}
            <path d="M28 29h-2v-1" stroke="#3a3a3a" strokeWidth="1" fill="none" />
          </svg>

          {/* Emitted Floating Data Packet */}
          <div className="flex items-center gap-1.5 pb-6">
            <svg width="14" height="12" viewBox="0 0 7 6" shapeRendering="crispEdges">
              {/* Little 8-bit packet envelope */}
              <rect x="0" y="0" width="7" height="6" fill="#1f2714" stroke="#789d2a" strokeWidth="1" />
              <rect x="2" y="2" width="3" height="1" fill="#9ac43e" />
              <rect x="3" y="3" width="1" height="1" fill="#9ac43e" />
            </svg>
            <span className="w-1.5 h-1.5 bg-[#789d2a] animate-pulse" />
            <span className="w-1.5 h-1.5 bg-[#9ac43e] animate-pulse delay-100" />
            <span className="w-1.5 h-1.5 bg-[#789d2a] animate-pulse delay-200" />
          </div>
        </div>

        {/* Right Detailed Retro Smartphone */}
        <div className="flex items-end gap-3 translate-y-0.5">
          {/* Incoming Floating Data Packet */}
          <div className="flex items-center gap-1.5 pb-6">
            <span className="w-1.5 h-1.5 bg-[#789d2a] animate-pulse delay-200" />
            <span className="w-1.5 h-1.5 bg-[#9ac43e] animate-pulse delay-100" />
            <span className="w-1.5 h-1.5 bg-[#789d2a] animate-pulse" />
            <svg width="14" height="12" viewBox="0 0 7 6" shapeRendering="crispEdges">
              <rect x="0" y="0" width="7" height="6" fill="#1f2714" stroke="#789d2a" strokeWidth="1" />
              <rect x="2" y="2" width="3" height="1" fill="#9ac43e" />
              <rect x="3" y="3" width="1" height="1" fill="#9ac43e" />
            </svg>
          </div>

          <svg
            width="44"
            height="62"
            viewBox="0 0 22 31"
            shapeRendering="crispEdges"
            className="shrink-0 drop-shadow-sm"
          >
            {/* Antenna & Wave Rings */}
            <rect x="17" y="0" width="2" height="5" fill="#3a3a3a" />
            <rect x="16" y="0" width="4" height="2" fill="#789d2a" />
            <rect x="17" y="0" width="2" height="1" fill="#9ac43e" />

            {/* Animated Radio Wave Arcs */}
            <rect x="13" y="1" width="1" height="1" fill="#9ac43e" className="animate-ping" />
            <rect x="21" y="1" width="1" height="1" fill="#9ac43e" className="animate-ping" />

            {/* Smartphone Outer Body */}
            <rect x="1" y="4" width="20" height="26" fill="#2d2d2d" />
            <rect x="1" y="4" width="20" height="1" fill="#444444" /> {/* Top highlight */}
            <rect x="1" y="4" width="1" height="26" fill="#383838" /> {/* Left highlight */}
            <rect x="20" y="5" width="1" height="25" fill="#1a1a1a" /> {/* Right shadow */}
            <rect x="1" y="29" width="20" height="1" fill="#181818" /> {/* Bottom shadow */}

            {/* Side Volume Buttons */}
            <rect x="0" y="8" width="1" height="3" fill="#444444" />
            <rect x="0" y="12" width="1" height="3" fill="#444444" />

            {/* Top Ear Speaker Grille */}
            <rect x="8" y="6" width="6" height="1" fill="#171717" />
            {/* Selfie Camera */}
            <rect x="5" y="6" width="1" height="1" fill="#789d2a" />

            {/* Phosphor Display Screen */}
            <rect x="3" y="8" width="16" height="17" fill="#0d1408" />

            {/* Status Bar inside Screen: Signal Bars & Battery */}
            <rect x="4" y="9" width="1" height="1" fill="#789d2a" />
            <rect x="5" y="9" width="1" height="2" fill="#789d2a" />
            <rect x="6" y="9" width="1" height="3" fill="#789d2a" />
            {/* Battery Icon */}
            <rect x="14" y="9" width="4" height="2" fill="#1f2714" stroke="#789d2a" strokeWidth="0.5" />
            <rect x="14" y="10" width="3" height="1" fill="#9ac43e" />
            <rect x="18" y="10" width="1" height="1" fill="#789d2a" />

            {/* Cute Pixel Eyes ^  ^ on Phone */}
            <rect x="6" y="14" width="1" height="2" fill="#9ac43e" />
            <rect x="7" y="13" width="2" height="1" fill="#9ac43e" />
            <rect x="9" y="14" width="1" height="2" fill="#9ac43e" />

            <rect x="12" y="14" width="1" height="2" fill="#9ac43e" />
            <rect x="13" y="13" width="2" height="1" fill="#9ac43e" />
            <rect x="15" y="14" width="1" height="2" fill="#9ac43e" />

            {/* Cute Pixel Smile \__/ on Phone */}
            <rect x="9" y="17" width="1" height="1" fill="#9ac43e" />
            <rect x="10" y="18" width="2" height="1" fill="#9ac43e" />
            <rect x="12" y="17" width="1" height="1" fill="#9ac43e" />

            {/* "P2P" text in pixels at bottom of screen */}
            <rect x="6" y="21" width="3" height="1" fill="#789d2a" opacity="0.8" />
            <rect x="10" y="21" width="3" height="1" fill="#789d2a" opacity="0.8" />
            <rect x="14" y="21" width="3" height="1" fill="#789d2a" opacity="0.8" />

            {/* Physical Tactile Home Button */}
            <rect x="8" y="26" width="6" height="2" fill="#202020" />
            <rect x="10" y="26.5" width="2" height="1" fill="#3a3a3a" />

            {/* Bottom Microphone Holes */}
            <rect x="4" y="28" width="1" height="1" fill="#141414" />
            <rect x="17" y="28" width="1" height="1" fill="#141414" />
          </svg>
        </div>
      </div>
    </footer>
  );
};
