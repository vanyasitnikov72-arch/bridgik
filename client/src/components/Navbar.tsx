import React, { useState } from 'react';
import { LogIn, ChevronDown, Check, Settings } from 'lucide-react';
import { AuthProvider, ThemeMode, AppTab, RoomMode, UserProfile } from '../types/index.js';
import { sound } from '../utils/sound.js';
import { ProfileDropdown, ProfileSectionTab } from './ProfileDropdown.js';
import { getAvatarForName } from '../utils/device.js';

interface NavbarProps {
  userName: string;
  onUpdateUserName?: (name: string) => void;
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
  roomId?: string | null;
  roomPin?: string;
  roomMode?: RoomMode;
  onReturnToRoom?: () => void;
  userProfile?: UserProfile | null;
  onOpenAuthModal?: (provider?: AuthProvider) => void;
  onOpenProfile?: (tab?: ProfileSectionTab) => void;
  onOpenSettings?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onToggleDemoTier?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  onUpdateUserName: _onUpdateUserName,
  userAvatar,
  onUpdateUserAvatar: _onUpdateUserAvatar,
  statusEmote: _statusEmote,
  onUpdateStatusEmote: _onUpdateStatusEmote,
  isAdmin,
  adminFrame = 'gold',
  onUpdateAdminFrame: _onUpdateAdminFrame,
  clientIp: _clientIp,
  isConnected,
  onGoHome,
  activeTab = 'bridge',
  onSelectTab,
  roomId,
  roomPin,
  roomMode = 'bridge',
  onReturnToRoom,
  userProfile,
  onOpenAuthModal,
  onOpenProfile,
  onOpenSettings,
  soundEnabled: _externalSoundEnabled,
  onToggleSound: _externalOnToggleSound,
  onToggleDemoTier,
  onLogout,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const effectiveFrame = userProfile ? userProfile.activeFrame : adminFrame;
  const hasFrameAccess = Boolean(
    isAdmin ||
      (userProfile &&
        (userProfile.tier === 'pro' || userProfile.unlockedFrames.includes(effectiveFrame)))
  );

  const getAdminFrameClass = () => {
    if (!hasFrameAccess || effectiveFrame === 'none') {
      return 'border-2 border-[#789d2a] shadow-[0_0_8px_rgba(120,157,42,0.35)]';
    }
    if (effectiveFrame === 'rgb') {
      return 'border-2 border-sky-400 animate-admin-rgb';
    }
    if (effectiveFrame === 'plasma') {
      return 'border-2 border-purple-400 animate-admin-plasma';
    }
    return 'border-2 border-amber-400 animate-admin-gold';
  };

  const goHome = () => {
    if (onSelectTab) onSelectTab('bridge');
    onGoHome?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isInRoomView =
    Boolean(roomId) &&
    activeTab !== 'about' &&
    activeTab !== 'legal' &&
    activeTab !== 'profile' &&
    activeTab !== 'pricing' &&
    activeTab !== 'catalog';

  const activeSessionLabel = `${roomMode === 'meeting' ? 'Комната' : 'Мост'}${
    roomPin ? ` #${roomPin}` : ''
  }`;

  const navLinks = (
    <>
      {roomId ? (
        <>
          <button
            onClick={goHome}
            className="pb-1 whitespace-nowrap cursor-pointer transition-colors text-[#aaaaaa] hover:text-[#ededed]"
            title="Выйти на главную"
          >
            Главная
          </button>
          <button
            onClick={() => {
              onReturnToRoom?.();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`pb-1 whitespace-nowrap cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
              isInRoomView
                ? 'text-[#ededed] border-b-2 border-[#789d2a]'
                : 'text-[#9ac43e] hover:text-[#ededed]'
            }`}
            title="Вернуться в активную сессию"
          >
            <span className="w-2 h-2 rounded-full bg-[#9ac43e] animate-pulse shrink-0" />
            <span>{activeSessionLabel}</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              onSelectTab?.('bridge');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`pb-1 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'bridge'
                ? 'text-[#ededed] border-b-2 border-[#789d2a]'
                : 'text-[#aaaaaa] hover:text-[#ededed]'
            }`}
          >
            Мост
          </button>
          <button
            onClick={() => {
              onSelectTab?.('meeting');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`pb-1 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'meeting'
                ? 'text-[#ededed] border-b-2 border-[#789d2a]'
                : 'text-[#aaaaaa] hover:text-[#ededed]'
            }`}
          >
            Комната
          </button>
        </>
      )}

      <button
        onClick={() => {
          onSelectTab?.('about');
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
          onSelectTab?.('legal');
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
      <button
        onClick={() => {
          onSelectTab?.('pricing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`pb-1 whitespace-nowrap cursor-pointer transition-colors ${
          activeTab === 'pricing'
            ? 'text-[#ededed] border-b-2 border-[#789d2a]'
            : 'text-[#aaaaaa] hover:text-[#ededed]'
        }`}
      >
        Тарифы
      </button>
      {userProfile && (
        <button
          onClick={() => {
            onSelectTab?.('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`pb-1 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'catalog'
              ? 'text-[#ededed] border-b-2 border-[#789d2a]'
              : 'text-[#aaaaaa] hover:text-[#ededed]'
          }`}
        >
          Каталог
        </button>
      )}
    </>
  );

  return (
    <header className="border-b border-white/[0.08] bg-[#171717] sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-2">
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

          <nav className="hidden md:flex items-center gap-6 text-lg font-bold">
            {navLinks}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenSettings();
                }}
                className="p-2 sm:p-2.5 rounded-xl bg-[#222226] hover:bg-[#2c2c33] border border-white/10 hover:border-white/20 text-[#aaaaaa] hover:text-[#ededed] transition-colors cursor-pointer flex items-center justify-center shrink-0"
                title="Настройки"
              >
                <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            )}

            {userProfile ? (
              <div className="relative flex items-center min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsProfileMenuOpen((v) => !v);
                  }}
                  className={`flex items-center gap-2 px-1.5 sm:px-2.5 py-1 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer min-w-0 outline-none ${
                    isProfileMenuOpen ? 'bg-white/[0.06]' : ''
                  }`}
                  title="Открыть меню профиля"
                >
                  <div className="relative shrink-0">
                    <img
                      src={userProfile.avatarUrl || userAvatar || getAvatarForName(userName)}
                      alt={userProfile.displayName}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover bg-[#171717] ${getAdminFrameClass()}`}
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#171717] ${
                        isConnected ? 'bg-[#789d2a]' : 'bg-[#e8b33c]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 min-w-0">
                    {isAdmin && (
                      <span
                        className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 text-[9px] sm:text-[10px] font-mono tracking-wider shrink-0 select-none"
                        title="Создатель сервиса (DEV)"
                      >
                        DEV
                      </span>
                    )}
                    {userProfile.tier === 'pro' && (
                      <span
                        className="w-4 h-4 rounded bg-[#789d2a] flex items-center justify-center text-white shrink-0"
                        title="Bridgik Pro"
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    {userProfile.activeEmote && (
                      <img
                        src={userProfile.activeEmote}
                        alt=""
                        className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0 select-none filter drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                      />
                    )}
                    <span
                      className={`font-extrabold text-sm sm:text-base max-w-[78px] sm:max-w-[140px] truncate ${
                        isAdmin || userProfile.tier === 'pro'
                          ? 'admin-name-shimmer'
                          : 'text-[#ededed]'
                      }`}
                    >
                      {userProfile.displayName}
                    </span>

                    <ChevronDown
                      className={`w-4 h-4 text-[#888888] shrink-0 transition-transform ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <ProfileDropdown
                    profile={userProfile}
                    isAdmin={isAdmin}
                    onOpenProfile={(tab) => onOpenProfile?.(tab)}
                    onOpenCatalog={() => onSelectTab?.('catalog')}
                    onOpenAdmin={() => onSelectTab?.('admin')}
                    onOpenSettings={onOpenSettings}
                    onToggleDemoTier={onToggleDemoTier}
                    onOpenLegal={() => onSelectTab?.('legal')}
                    onLogout={() => onLogout?.()}
                    onClose={() => setIsProfileMenuOpen(false)}
                  />
                )}
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenAuthModal('yandex');
                  }}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#283216] hover:bg-[#33411c] border border-[#789d2a]/75 hover:border-[#9ac43e] text-[#ededed] font-extrabold text-sm sm:text-base transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-black/30 shrink-0"
                >
                  <LogIn className="w-4 h-4 text-[#9ac43e] shrink-0" />
                  <span>Войти</span>
                </button>
              )
            )}
          </div>
        </div>

        <nav className="flex md:hidden items-center justify-around border-t border-white/[0.06] py-2 text-sm sm:text-base font-bold gap-2">
          {navLinks}
        </nav>
      </div>
    </header>
  );
};