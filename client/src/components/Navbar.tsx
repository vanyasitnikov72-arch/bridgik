import React, { useState } from 'react';
import { Edit2, Check, Volume2, VolumeX } from 'lucide-react';
import { ThemeMode, AppTab } from '../types/index.js';
import { sound } from '../utils/sound.js';
import { AvatarPicker } from './AvatarPicker.js';
import { getAvatarForName } from '../utils/device.js';

interface NavbarProps {
  userName: string;
  onUpdateUserName: (name: string) => void;
  userAvatar?: string;
  onUpdateUserAvatar?: (avatar: string) => void;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  theme: ThemeMode;
  onToggleTheme: () => void;
  isConnected: boolean;
  onGoHome?: () => void;
  activeTab?: AppTab;
  onSelectTab?: (tab: AppTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  onUpdateUserName,
  userAvatar,
  onUpdateUserAvatar,
  theme: _theme,
  onToggleTheme: _onToggleTheme,
  isConnected,
  onGoHome,
  activeTab = 'bridge',
  onSelectTab,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [soundEnabled, setSoundEnabled] = useState(() => sound.isEnabled());

  const handleToggleSound = () => {
    const nextState = sound.toggle();
    setSoundEnabled(nextState);
    if (nextState) {
      sound.playMessage();
    }
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim());
    }
    setIsEditing(false);
  };

  return (
    <header className="border-b border-white/[0.08] bg-[#171717] sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-18 sm:h-20 flex items-center justify-between">
        {/* Official Brand Logo: Prominent Cyber-Dino + bridgik */}
        <div
          onClick={() => {
            if (onSelectTab) onSelectTab('bridge');
            onGoHome?.();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center cursor-pointer select-none group py-1"
          title="bridgik · На главную"
        >
          <img
            src="/mascots/dino_logo_transparent.png"
            alt="bridgik"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(120,157,42,0.3)]"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Center / Navigation: Главная · О сервисе · Условия */}
        <nav className="flex items-center gap-4 sm:gap-6 text-lg font-bold">
          <button
            onClick={() => {
              if (onSelectTab) onSelectTab('bridge');
              onGoHome?.();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`pb-1 cursor-pointer transition-colors ${
              activeTab === 'bridge' || activeTab === 'meeting'
                ? 'text-[#ededed] border-b-2 border-[#789d2a]'
                : 'text-[#aaaaaa] hover:text-[#ededed]'
            }`}
          >
            Главная
          </button>
          <button
            onClick={() => {
              if (onSelectTab) onSelectTab('about');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`pb-1 cursor-pointer transition-colors ${
              activeTab === 'about'
                ? 'text-[#ededed] border-b-2 border-[#789d2a]'
                : 'text-[#aaaaaa] hover:text-[#ededed]'
            }`}
          >
            О сервисе
          </button>
          <button
            onClick={() => {
              if (onSelectTab) onSelectTab('legal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`pb-1 cursor-pointer transition-colors ${
              activeTab === 'legal'
                ? 'text-[#ededed] border-b-2 border-[#789d2a]'
                : 'text-[#aaaaaa] hover:text-[#ededed]'
            }`}
          >
            Условия
          </button>
        </nav>

        {/* Right: Sound Toggle & User Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
              soundEnabled
                ? 'bg-[#222222] border-[#3a3a3a] text-[#9ac43e] hover:border-[#789d2a]'
                : 'bg-[#1e1e1e] border-[#333333] text-[#777777] hover:text-[#aaaaaa]'
            }`}
            title={soundEnabled ? '8-bit звуки включены' : '8-bit звуки выключены'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="relative flex items-center">
            {isAvatarPickerOpen && (
              <div className="absolute top-14 right-0 z-50">
                <AvatarPicker
                  currentAvatar={userAvatar || getAvatarForName(userName)}
                  onSelectAvatar={(src) => {
                    onUpdateUserAvatar?.(src);
                    setIsAvatarPickerOpen(false);
                  }}
                  onClose={() => setIsAvatarPickerOpen(false)}
                />
              </div>
            )}

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#222222] border border-[#3a3a3a] text-base text-[#ededed]">
              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(!isAvatarPickerOpen)}
                className={`relative cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0 ${
                  isAvatarPickerOpen ? 'ring-2 ring-[#789d2a] rounded-full scale-105' : ''
                }`}
                title="Кликните, чтобы сменить маскота"
              >
                <img
                  src={userAvatar || getAvatarForName(userName)}
                  alt={userName}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[#789d2a] shadow-[0_0_8px_rgba(120,157,42,0.35)] bg-[#171717]"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#222222] ${
                    isConnected ? 'bg-[#789d2a]' : 'bg-[#e8b33c]'
                  }`}
                  title={isConnected ? 'В сети' : 'Подключение...'}
                />
              </button>
              {isEditing ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                    className="bg-[#171717] text-[#ededed] px-2 py-0.5 rounded text-base outline-none border border-[#789d2a] w-32 font-bold"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 hover:text-[#9ac43e] transition-colors"
                  >
                    <Check className="w-4 h-4 text-[#9ac43e]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempName(userName);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
                  title="Кликните, чтобы изменить имя"
                >
                  <span className="font-extrabold max-w-[140px] truncate">{userName}</span>
                  <Edit2 className="w-3.5 h-3.5 text-[#aaaaaa] hover:text-[#9ac43e]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
