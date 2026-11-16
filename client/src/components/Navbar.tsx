import React, { useState } from 'react';
import { Edit2, Check } from 'lucide-react';
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
  theme: _theme,
  onToggleTheme: _onToggleTheme,
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

  return (
    <header className="border-b border-white/[0.08] bg-[#171717] sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand in Handjet font */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <span className="font-extrabold text-2xl tracking-tight text-[#ededed] group-hover:text-white transition-colors">
            bridgit<span className="text-[#9ac43e]">.id</span>
          </span>
          <span className="text-xs uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#222222] text-[#9ac43e] border border-[#3a3a3a]">
            p2p
          </span>
        </div>

        {/* Center / Navigation Tabs like on eblo.id */}
        <nav className="hidden sm:flex items-center gap-6 text-base font-semibold">
          <button
            onClick={onGoHome}
            className="text-[#ededed] border-b-2 border-[#789d2a] pb-1 cursor-pointer transition-colors"
          >
            Передача
          </button>
          <a
            href="#features"
            className="text-[#aaaaaa] hover:text-[#ededed] pb-1 transition-colors"
          >
            О сервисе
          </a>
          <span className="text-[#999999]/60">·</span>
          <span className="text-xs text-[#9ac43e] font-mono">
            {isConnected ? 'сеть активна' : 'подключение...'}
          </span>
        </nav>

        {/* Right: User Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#222222] border border-[#3a3a3a] text-sm text-[#ededed]">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#789d2a]' : 'bg-[#e8b33c]'
              }`}
              title={isConnected ? 'В сети' : 'Подключение...'}
            />
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                  className="bg-[#171717] text-[#ededed] px-2 py-0.5 rounded text-sm outline-none border border-[#789d2a] w-28"
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
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                title="Кликните, чтобы изменить имя"
              >
                <span className="font-bold max-w-[120px] truncate">{userName}</span>
                <Edit2 className="w-3 h-3 text-[#aaaaaa] hover:text-[#9ac43e]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
