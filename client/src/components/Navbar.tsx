import React, { useState } from 'react';
import { Edit2, Check, Volume2, VolumeX } from 'lucide-react';
import { ThemeMode } from '../types/index.js';
import { sound } from '../utils/sound.js';

interface NavbarProps {
  userName: string;
  onUpdateUserName: (name: string) => void;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  theme: ThemeMode;
  onToggleTheme: () => void;
  isConnected: boolean;
  onGoHome?: () => void;
  activeTab?: 'transfer' | 'about';
  onSelectTab?: (tab: 'transfer' | 'about') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  onUpdateUserName,
  theme: _theme,
  onToggleTheme: _onToggleTheme,
  isConnected,
  onGoHome,
  activeTab = 'transfer',
  onSelectTab,
}) => {
  const [isEditing, setIsEditing] = useState(false);
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
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand in Handjet font */}
        <div
          onClick={() => {
            if (onSelectTab) onSelectTab('transfer');
            onGoHome?.();
          }}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <span className="font-extrabold text-3xl tracking-tight text-[#ededed] group-hover:text-[#9ac43e] transition-colors">
            bridgik
          </span>
          <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-[#222222] text-[#9ac43e] border border-[#3a3a3a]">
            p2p
          </span>
        </div>

        {/* Center / Navigation Tabs like on eblo.id */}
        <nav className="flex items-center gap-5 sm:gap-7 text-lg font-bold">
          <button
            onClick={() => onSelectTab ? onSelectTab('transfer') : onGoHome?.()}
            className={`pb-1 cursor-pointer transition-colors ${
              activeTab === 'transfer'
                ? 'text-[#ededed] border-b-2 border-[#789d2a]'
                : 'text-[#aaaaaa] hover:text-[#ededed]'
            }`}
          >
            Передача
          </button>
          <button
            onClick={() => onSelectTab?.('about')}
            className={`pb-1 cursor-pointer transition-colors ${
              activeTab === 'about'
                ? 'text-[#ededed] border-b-2 border-[#789d2a]'
                : 'text-[#aaaaaa] hover:text-[#ededed]'
            }`}
          >
            О сервисе
          </button>
          <span className="text-[#999999]/60 hidden sm:inline">·</span>
          <span className="text-sm sm:text-base text-[#9ac43e] font-mono font-bold hidden sm:inline">
            {isConnected ? 'сеть активна' : 'подключение...'}
          </span>
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

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#222222] border border-[#3a3a3a] text-base text-[#ededed]">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-[#789d2a]' : 'bg-[#e8b33c]'
              }`}
              title={isConnected ? 'В сети' : 'Подключение...'}
            />
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
    </header>
  );
};
