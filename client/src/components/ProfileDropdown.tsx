import React, { useEffect, useRef } from 'react';
import {
  User,
  Laptop,
  Crown,
  ShieldCheck,
  LogOut,
  Wrench,
  Check,
  Settings,
} from 'lucide-react';
import { UserProfile } from '../types/index.js';
import { getAvatarForName } from '../utils/device.js';
import { sound } from '../utils/sound.js';

export type ProfileSectionTab = 'appearance' | 'devices' | 'pro' | 'connections';

interface ProfileDropdownProps {
  profile: UserProfile;
  isAdmin?: boolean;
  onOpenProfile: (tab?: ProfileSectionTab) => void;
  onOpenSettings?: () => void;
  onToggleDemoTier?: () => void;
  onOpenLegal: () => void;
  onLogout: () => void;
  onClose: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  profile,
  isAdmin,
  onOpenProfile,
  onOpenSettings,
  onToggleDemoTier: _onToggleDemoTier,
  onOpenLegal,
  onLogout,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleLabel = profile.providers.yandex
    ? `@${profile.providers.yandex.handle}`
    : profile.providers.telegram?.username
    ? `@${profile.providers.telegram.username}`
    : profile.licenseKeyPreview || 'Анонимный профиль';

  const isPro = profile.tier === 'pro';
  const hasFrameAccess = Boolean(
    isAdmin || isPro || profile.unlockedFrames.includes(profile.activeFrame)
  );

  const frameClass =
    !hasFrameAccess || profile.activeFrame === 'none'
      ? 'border-2 border-[#789d2a]'
      : profile.activeFrame === 'rgb'
      ? 'border-2 border-sky-400 animate-admin-rgb'
      : profile.activeFrame === 'plasma'
      ? 'border-2 border-purple-400 animate-admin-plasma'
      : 'border-2 border-amber-400 animate-admin-gold';

  const maxDevices = isPro ? 4 : 2;

  return (
    <div
      ref={ref}
      className="absolute top-12 sm:top-14 right-0 z-50 w-64 rounded-2xl bg-[#1e1e1e] border border-white/[0.1] shadow-[0_18px_50px_rgba(0,0,0,0.85)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="p-3.5 border-b border-white/[0.08] flex items-center gap-3">
        <img
          src={profile.avatarUrl || getAvatarForName(profile.displayName)}
          alt={profile.displayName}
          className={`w-11 h-11 rounded-full object-cover bg-[#141414] shrink-0 ${frameClass}`}
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {isAdmin && (
              <span
                className="w-4 h-4 rounded bg-[#141414] border border-white/15 flex items-center justify-center text-[#ededed] shrink-0"
                title="Создатель сервиса (DEV)"
              >
                <Wrench className="w-2.5 h-2.5" />
              </span>
            )}
            {isPro && (
              <span
                className="w-4 h-4 rounded bg-[#789d2a] flex items-center justify-center text-white shrink-0"
                title="Bridgik Pro"
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            {profile.activeEmote && (
              <img
                src={profile.activeEmote}
                alt=""
                className="w-4 h-4 object-contain shrink-0 select-none"
              />
            )}
            <span
              className={`font-extrabold text-base text-[#ededed] truncate ${
                isAdmin || isPro ? 'admin-name-shimmer' : ''
              }`}
            >
              {profile.displayName}
            </span>
          </div>
          <p className="text-xs text-[#9a9a9a] truncate mt-0.5">{handleLabel}</p>
        </div>
      </div>

      <div className="p-1.5 space-y-0.5 text-base font-bold">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenProfile('appearance');
            onClose();
          }}
          className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-[#dddddd] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
        >
          <User className="w-4 h-4 text-[#a8a8a8] shrink-0" />
          <span>Профиль и кастомизация</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenProfile('devices');
            onClose();
          }}
          className="w-full px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-[#dddddd] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
        >
          <span className="flex items-center gap-3 min-w-0">
            <Laptop className="w-4 h-4 text-[#a8a8a8] shrink-0" />
            <span className="truncate">Sticky Bridge</span>
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[#9ac43e] shrink-0">
            {profile.devices.length}/{maxDevices}
          </span>
        </button>

        {onOpenSettings && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenSettings();
              onClose();
            }}
            className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-[#dddddd] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            <Settings className="w-4 h-4 text-[#a8a8a8] shrink-0" />
            <span>Настройки</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenProfile('pro');
            onClose();
          }}
          className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-[#dddddd] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
        >
          <Crown className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Подписка и доступ</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenLegal();
            onClose();
          }}
          className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-[#dddddd] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
        >
          <ShieldCheck className="w-4 h-4 text-[#a8a8a8] shrink-0" />
          <span>Условия и поддержка</span>
        </button>
      </div>

      <div className="p-1.5 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onLogout();
            onClose();
          }}
          className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-[#ef9282] hover:bg-[#ed2b3b]/15 transition-colors cursor-pointer font-bold text-base text-left"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Выйти в режим Гостя</span>
        </button>
      </div>
    </div>
  );
};