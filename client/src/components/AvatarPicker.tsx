import React from 'react';
import { MASCOT_AVATARS, getRandomAvatar } from '../utils/device.js';
import { Check, X, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound.js';

interface AvatarPickerProps {
  currentAvatar: string;
  onSelectAvatar: (src: string) => void;
  onClose: () => void;
  title?: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentAvatar,
  onSelectAvatar,
  onClose,
  title = 'Выберите вашего маскота',
}) => {
  const handleRandom = () => {
    let next = getRandomAvatar();
    // try to get different avatar than current
    if (next === currentAvatar && MASCOT_AVATARS.length > 1) {
      const remaining = MASCOT_AVATARS.filter((m) => m.src !== currentAvatar);
      next = remaining[Math.floor(Math.random() * remaining.length)].src;
    }
    sound.playClick();
    onSelectAvatar(next);
  };

  return (
    <div className="bg-[#18181e] border border-[#383848] rounded-2xl p-4 shadow-2xl w-80 max-w-[95vw] animate-in fade-in zoom-in-95 duration-150 select-none z-50">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#9ac43e]" />
          <span className="text-xs font-bold text-[#ededed] uppercase font-mono tracking-wider">
            {title}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="p-1 rounded-lg text-[#888888] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {MASCOT_AVATARS.map((mascot) => {
          const isSelected = mascot.src === currentAvatar;
          return (
            <button
              key={mascot.id}
              type="button"
              onClick={() => {
                sound.playClick();
                onSelectAvatar(mascot.src);
              }}
              className={`p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-[#222a1b] border-2 border-[#789d2a] shadow-[0_0_12px_rgba(120,157,42,0.4)] scale-102'
                  : 'bg-[#141418] border border-[#2a2a35] hover:border-[#555566] hover:bg-[#1c1c22]'
              }`}
            >
              <div className="relative">
                <img
                  src={mascot.src}
                  alt={mascot.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
                  style={{ imageRendering: 'pixelated' }}
                />
                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#789d2a] text-white flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <span
                className={`text-[11px] font-bold text-center leading-tight truncate w-full ${
                  isSelected ? 'text-[#bbf348]' : 'text-[#aaaaaa] group-hover:text-white'
                }`}
              >
                {mascot.name}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleRandom}
        className="w-full py-2 px-3 rounded-xl bg-[#22222a] hover:bg-[#2c2c36] text-[#ededed] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#333340] cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#9ac43e]" />
        <span>Выбрать случайно</span>
      </button>
    </div>
  );
};
