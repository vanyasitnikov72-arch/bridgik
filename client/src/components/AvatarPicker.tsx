import React from 'react';
import { MASCOT_AVATARS, getRandomAvatar } from '../utils/device.js';
import { Check, X, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound.js';

interface AvatarPickerProps {
  currentAvatar: string;
  onSelectAvatar: (src: string) => void;
  onClose: () => void;
  title?: string;
  isAdmin?: boolean;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  onSelectAdminFrame?: (frame: 'gold' | 'rgb' | 'plasma' | 'none') => void;
  clientIp?: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentAvatar,
  onSelectAvatar,
  onClose,
  title = 'Выберите вашего маскота',
  isAdmin,
  adminFrame = 'gold',
  onSelectAdminFrame,
  clientIp,
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

      {/* Creator Exclusive Frame Selection */}
      {isAdmin && (
        <div className="mb-3.5 p-3 rounded-xl bg-gradient-to-r from-[#2a220d]/80 via-[#211a0d]/60 to-[#191924]/80 border border-amber-500/40 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <span>👑</span>
              <span>Рамка Создателя</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
              DEV
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'gold', label: 'Золото', icon: '👑', anim: 'animate-admin-gold border-amber-400' },
              { id: 'rgb', label: 'Кибер', icon: '⚡', anim: 'animate-admin-rgb border-sky-400' },
              { id: 'plasma', label: 'Плазма', icon: '🔮', anim: 'animate-admin-plasma border-purple-400' },
              { id: 'none', label: 'Стандарт', icon: '🛡️', anim: 'border-[#789d2a]' },
            ].map((f) => {
              const isFSelected = (adminFrame || 'gold') === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSelectAdminFrame?.(f.id as any);
                  }}
                  className={`py-1.5 px-1 rounded-lg flex flex-col items-center gap-0.5 transition-all cursor-pointer border ${
                    isFSelected
                      ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-[#15151a] border-[#333340] text-[#888899] hover:text-white hover:border-[#555566]'
                  }`}
                >
                  <span className="text-sm">{f.icon}</span>
                  <span className="text-[10px] font-bold font-mono">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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

      {/* IP & Status Indicator */}
      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#777788]">
        <span title="Ваш сетевой IP-адрес">IP: {clientIp || '127.0.0.1'}</span>
        {isAdmin ? (
          <span className="text-amber-300 font-bold flex items-center gap-1">
            <span>●</span>
            <span>Создатель (Root)</span>
          </span>
        ) : (
          <span className="text-[#888899]">
            <span>●</span>
            <span>Гость</span>
          </span>
        )}
      </div>
    </div>
  );
};
