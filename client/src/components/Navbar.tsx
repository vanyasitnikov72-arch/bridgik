import React, { useState } from 'react';
import { Zap, Laptop, Smartphone, Tablet, Edit2, Check, Palette } from 'lucide-react';
import { ThemeMode } from '../types/index.js';

interface NavbarProps {
  userName: string;
  onUpdateUserName: (name: string) => void;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  theme: ThemeMode;
  onToggleTheme: () => void;
  isConnected: boolean;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  onUpdateUserName,
  deviceType,
  theme,
  onToggleTheme,
  isConnected,
  onGoHome,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim());
    }
    setIsEditing(false);
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-[#9ac43e]" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-[#9ac43e]" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-[#9ac43e]" />;
    }
  };

  return (
    <header className="border-b border-white/[0.08] bg-[#171717]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-md bg-[#789d2a] flex items-center justify-center shadow-md group-hover:bg-[#8cb632] transition-colors">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-base text-[#ededed] group-hover:text-white transition-colors">
              AirBridge
            </span>
            <span className="text-[11px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#2d2d2d] text-[#9ac43e] border border-[#3a3a3a]">
              P2P
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Identity Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#222222] border border-[#3a3a3a] text-xs text-[#ededed]">
            {getDeviceIcon()}
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                  className="bg-[#171717] text-[#ededed] px-2 py-0.5 rounded text-xs outline-none border border-[#789d2a] w-28"
                />
                <button
                  onClick={handleSaveName}
                  className="p-0.5 hover:text-[#9ac43e] transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempName(userName);
                  setIsEditing(true);
                }}
                className="flex items-center gap-1.5 hover:text-white transition-colors group"
                title="Кликните, чтобы изменить имя"
              >
                <span className="font-medium max-w-[120px] truncate">{userName}</span>
                <Edit2 className="w-3 h-3 text-[#aaaaaa] group-hover:text-[#9ac43e] transition-colors" />
              </button>
            )}
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#789d2a] shadow-sm shadow-[#789d2a]/50' : 'bg-[#e8b33c]'
              }`}
              title={isConnected ? 'В сети (WebRTC Signaling)' : 'Подключение...'}
            />
          </div>

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 px-2 rounded-md bg-[#222222] border border-[#3a3a3a] hover:bg-[#2d2d2d] text-[#aaaaaa] hover:text-[#ededed] transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Сменить палитру темы"
          >
            <Palette className="w-3.5 h-3.5 text-[#9ac43e]" />
            <span className="hidden sm:inline capitalize">{theme}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
