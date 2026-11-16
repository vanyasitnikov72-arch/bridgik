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
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-cyan-400" />;
      default:
        return <Laptop className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-lg text-white">AirBridge</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                P2P
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">Безлимитный обмен без сервера</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Identity Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300">
            {getDeviceIcon()}
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                  className="bg-neutral-800 text-white px-2 py-0.5 rounded text-xs outline-none border border-cyan-500 w-28"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 hover:text-cyan-400 transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
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
                <Edit2 className="w-3 h-3 text-neutral-500 group-hover:text-cyan-400 transition-colors" />
              </button>
            )}
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500'
              }`}
              title={isConnected ? 'Подключено к сигнальной сети' : 'Подключение...'}
            />
          </div>

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all flex items-center gap-1.5 text-xs"
            title="Сменить тему оформления"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden md:inline capitalize">{theme}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
