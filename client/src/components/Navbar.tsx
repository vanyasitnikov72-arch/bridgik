import React, { useState } from 'react';
import { Edit2, Check, Volume2, VolumeX, Smile, X } from 'lucide-react';
import { ThemeMode, AppTab } from '../types/index.js';
import { sound } from '../utils/sound.js';
import { AvatarPicker } from './AvatarPicker.js';
import { EmotePicker } from './EmotePicker.js';
import { getAvatarForName } from '../utils/device.js';

interface NavbarProps {
  userName: string;
  onUpdateUserName: (name: string) => void;
  userAvatar?: string;
  onUpdateUserAvatar?: (avatar: string) => void;
  statusEmote?: string | null;
  onUpdateStatusEmote?: (emoteUrl: string | null) => void;
  isAdmin?: boolean;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  onUpdateAdminFrame?: (frame: 'gold' | 'rgb' | 'plasma' | 'none') => void;
  clientIp?: string;
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
  statusEmote,
  onUpdateStatusEmote,
  isAdmin,
  adminFrame = 'gold',
  onUpdateAdminFrame,
  clientIp,
  theme: _theme,
  onToggleTheme: _onToggleTheme,
  isConnected,
  onGoHome,
  activeTab = 'bridge',
  onSelectTab,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [soundEnabled, setSoundEnabled] = useState(() => sound.isEnabled());

  const getAdminFrameClass = () => {
    if (!isAdmin || adminFrame === 'none') {
      return 'border-2 border-[#789d2a] shadow-[0_0_8px_rgba(120,157,42,0.35)]';
    }
    if (adminFrame === 'rgb') {
      return 'border-2 border-sky-400 animate-admin-rgb';
    }
    if (adminFrame === 'plasma') {
      return 'border-2 border-purple-400 animate-admin-plasma';
    }
    return 'border-2 border-amber-400 animate-admin-gold';
  };

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

  const goHome = () => {
    if (onSelectTab) onSelectTab('bridge');
    onGoHome?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = (
    <>
      <button
        onClick={goHome}
        className={`pb-1 whitespace-nowrap cursor-pointer transition-colors ${
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
        className={`pb-1 whitespace-nowrap cursor-pointer transition-colors ${
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
        className={`pb-1 whitespace-nowrap cursor-pointer transition-colors ${
          activeTab === 'legal'
            ? 'text-[#ededed] border-b-2 border-[#789d2a]'
            : 'text-[#aaaaaa] hover:text-[#ededed]'
        }`}
      >
        Условия
      </button>
    </>
  );

  return (
    <header className="border-b border-white/[0.08] bg-[#171717] sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        {/* Top Row: Logo + Desktop Nav + Sound & Profile */}
        <div className="h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Official Brand Logo */}
          <div
            onClick={goHome}
            className="flex items-center cursor-pointer select-none group py-1 shrink-0"
            title="bridgik · На главную"
          >
            <img
              src="/mascots/dino_logo_transparent.png"
              alt="bridgik"
              className="h-10 sm:h-14 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(120,157,42,0.3)]"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-lg font-bold">
            {navLinks}
          </nav>

          {/* Right: Sound Toggle & User Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={handleToggleSound}
              className={`p-2 sm:p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                soundEnabled
                  ? 'bg-[#222222] border-[#3a3a3a] text-[#9ac43e] hover:border-[#789d2a]'
                  : 'bg-[#1e1e1e] border-[#333333] text-[#777777] hover:text-[#aaaaaa]'
              }`}
              title={soundEnabled ? '8-bit звуки включены' : '8-bit звуки выключены'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <div className="relative flex items-center min-w-0">
              {isAvatarPickerOpen && (
                <div className="absolute top-12 sm:top-14 right-0 z-50 max-w-[calc(100vw-1.5rem)]">
                  <AvatarPicker
                    currentAvatar={userAvatar || getAvatarForName(userName)}
                    onSelectAvatar={(src) => {
                      onUpdateUserAvatar?.(src);
                      setIsAvatarPickerOpen(false);
                    }}
                    isAdmin={isAdmin}
                    adminFrame={adminFrame}
                    onSelectAdminFrame={onUpdateAdminFrame}
                    clientIp={clientIp}
                    onClose={() => setIsAvatarPickerOpen(false)}
                  />
                </div>
              )}

              <div
                className={`flex items-center gap-1.5 sm:gap-2.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border text-sm sm:text-base text-[#ededed] transition-all min-w-0 ${
                  isAdmin
                    ? 'bg-gradient-to-r from-[#241c10] via-[#1c1c1c] to-[#171717] border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-[#222222] border-[#3a3a3a]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(!isAvatarPickerOpen)}
                  className={`relative cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0 ${
                    isAvatarPickerOpen ? 'ring-2 ring-amber-400 rounded-full scale-105' : ''
                  }`}
                  title={
                    isAdmin
                      ? 'Кликните, чтобы выбрать маскота или рамку Создателя'
                      : 'Кликните, чтобы сменить маскота'
                  }
                >
                  <img
                    src={userAvatar || getAvatarForName(userName)}
                    alt={userName}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover bg-[#171717] ${getAdminFrameClass()}`}
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {isAdmin && adminFrame !== 'none' && (
                    <span
                      className="absolute -top-2 -right-1 text-[10px] sm:text-xs select-none filter drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]"
                      title="Создатель сервиса"
                    >
                      👑
                    </span>
                  )}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#222222] ${
                      isConnected ? 'bg-[#789d2a]' : 'bg-[#e8b33c]'
                    }`}
                    title={isConnected ? 'В сети' : 'Подключение...'}
                  />
                </button>

                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      autoFocus
                      className="bg-[#171717] text-[#ededed] px-2 py-0.5 rounded text-sm sm:text-base outline-none border border-[#789d2a] w-24 sm:w-32 font-bold"
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1 hover:text-[#9ac43e] transition-colors shrink-0"
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
                    className="flex items-center gap-1.5 sm:gap-2 hover:text-white transition-colors cursor-pointer min-w-0"
                    title="Кликните, чтобы изменить имя"
                  >
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                      {isAdmin && (
                        <span
                          className="px-1 sm:px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-mono font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider select-none shadow-[0_0_6px_rgba(245,158,11,0.3)] shrink-0"
                          title="Статус: Создатель сервиса (Root)"
                        >
                          DEV
                        </span>
                      )}
                      <span
                        className={`font-extrabold max-w-[76px] sm:max-w-[140px] truncate ${
                          isAdmin ? 'admin-name-shimmer' : ''
                        }`}
                      >
                        {userName}
                      </span>
                      <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#aaaaaa] hover:text-[#9ac43e] shrink-0" />
                    </div>
                  </button>
                )}

                {/* Animated Status Emote */}
                <div className="relative flex items-center shrink-0">
                  {statusEmote ? (
                    <div className="relative group/status flex items-center">
                      <button
                        type="button"
                        onClick={() => setIsStatusPickerOpen(!isStatusPickerOpen)}
                        className="p-0.5 sm:p-1 rounded-lg hover:bg-white/10 transition-transform active:scale-95 cursor-pointer shrink-0"
                        title="Анимированный статус (кликните, чтобы сменить)"
                      >
                        <img
                          src={statusEmote}
                          alt="Статус"
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain select-none filter drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          onUpdateStatusEmote?.(null);
                        }}
                        className="hidden sm:block opacity-0 group-hover/status:opacity-100 p-0.5 rounded text-[#888888] hover:text-red-400 hover:bg-white/10 transition-all -ml-1 cursor-pointer"
                        title="Убрать эмодзи-статус"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsStatusPickerOpen(!isStatusPickerOpen)}
                      className="p-0.5 sm:p-1 rounded-lg text-[#666677] hover:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                      title="Установить анимированный эмодзи-статус (7TV / Telegram)"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  )}

                  {isStatusPickerOpen && (
                    <EmotePicker
                      isOpen={isStatusPickerOpen}
                      onClose={() => setIsStatusPickerOpen(false)}
                      positionClass="top-12 sm:top-14 right-0"
                      onSelectEmote={(emote) => {
                        sound.playClick();
                        onUpdateStatusEmote?.(emote.url);
                        setIsStatusPickerOpen(false);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Second Row Navigation */}
        <nav className="flex md:hidden items-center justify-around border-t border-white/[0.06] py-2 text-base font-bold">
          {navLinks}
        </nav>
      </div>
    </header>
  );
};