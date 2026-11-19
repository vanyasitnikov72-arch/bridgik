import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, Smartphone, Link2, KeyRound } from 'lucide-react';
import { UserProfile } from '../types/index.js';
import { sound } from '../utils/sound.js';
import { YandexIcon, TelegramIcon } from './AuthModal.js';

interface LinkDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  maxDevices: number;
}

export const LinkDeviceModal: React.FC<LinkDeviceModalProps> = ({
  isOpen,
  onClose,
  profile,
  maxDevices,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const licenseKey = profile.licenseKeyPreview || '';
  const linkUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bridgik.ru';
    return `${origin}/?key=${encodeURIComponent(licenseKey)}&auth=success`;
  }, [licenseKey]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkUrl).catch(() => {});
    sound.playClick();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyKey = () => {
    if (!licenseKey) return;
    navigator.clipboard.writeText(licenseKey).catch(() => {});
    sound.playClick();
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#1c1c1c] border border-white/[0.1] shadow-[0_24px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3.5 border-b border-white/[0.07] flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#789d2a] animate-pulse" />
              <h2 className="text-xl font-extrabold text-[#ededed] leading-tight">
                Привязать устройство
              </h2>
            </div>
            <p className="text-xs text-[#a8a8a8] mt-1">
              Откройте профиль на телефоне или втором ПК — они будут находить друг друга без ввода PIN.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-[#a8a8a8] hover:text-white transition-colors cursor-pointer shrink-0"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Method 1: QR Code */}
          <div className="p-4 rounded-xl bg-[#171717] border border-white/[0.08] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="p-2.5 bg-white rounded-xl shadow-md shrink-0">
              <QRCodeSVG value={linkUrl} size={118} level="M" includeMargin={false} />
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm font-extrabold text-[#ededed]">
                <QrCode className="w-4 h-4 text-[#9ac43e]" />
                <span>Отсканируйте камерой телефона</span>
              </div>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                Откройте камеру смартфона или планшета и наведите на этот QR-код. Устройство моментально откроет сайт и свяжется с вашим профилем.
              </p>
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-[11px] font-mono text-[#789d2a]">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Авторизация в 1 шаг</span>
              </div>
            </div>
          </div>

          {/* Method 2: Direct Link */}
          <div className="p-3.5 rounded-xl bg-[#171717] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#ededed] flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-[#9ac43e]" />
                <span>Или отправьте ссылку на второе устройство</span>
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-xs font-bold text-[#9ac43e] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Скопировано!' : 'Копировать ссылку'}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 bg-[#202020] px-3 py-2 rounded-lg border border-white/[0.05]">
              <span className="font-mono text-xs text-[#aaaaaa] truncate select-all flex-1">
                {linkUrl}
              </span>
            </div>
            <p className="text-[11px] text-[#777777]">
              Скиньте эту ссылку себе в Избранное Telegram или мессенджер и откройте на втором устройстве.
            </p>
          </div>

          {/* Method 3: By Key or Account */}
          <div className="p-3.5 rounded-xl bg-[#171717] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#ededed] flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#9ac43e]" />
                <span>Лицензионный ключ профиля</span>
              </span>
              {licenseKey && (
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="text-xs font-bold text-[#9ac43e] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              )}
            </div>

            {licenseKey ? (
              <div className="flex items-center justify-between gap-2 bg-[#202020] px-3 py-2 rounded-lg border border-white/[0.05]">
                <span className="font-mono font-extrabold text-sm sm:text-base text-[#9ac43e] tracking-wider truncate">
                  {licenseKey}
                </span>
              </div>
            ) : null}

            <p className="text-[11px] text-[#777777] leading-relaxed">
              На втором устройстве нажмите <strong>«Войти»</strong> → вкладка <strong>«Ключ»</strong> → <strong>«У меня есть ключ»</strong> и вставьте код.
            </p>

            {profile.providers.yandex && (
              <div className="pt-1 border-t border-white/[0.06] flex items-center gap-2 text-xs text-[#a0a0a0]">
                <YandexIcon className="w-4 h-4 shrink-0" />
                <span>
                  Либо на втором устройстве просто нажмите <strong>«Войти через Яндекс ID»</strong> под аккаунтом <strong className="text-white">{profile.providers.yandex.handle}</strong>.
                </span>
              </div>
            )}

            {profile.providers.telegram && (
              <div className="pt-1 border-t border-white/[0.06] flex items-center gap-2 text-xs text-[#a0a0a0]">
                <TelegramIcon className="w-4 h-4 text-[#229ED9] shrink-0" />
                <span>
                  Либо на втором устройстве войдите через бота под аккаунтом <strong className="text-white">@{profile.providers.telegram.username || 'telegram'}</strong>.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#161616] border-t border-white/[0.06] flex items-center justify-between gap-3 text-xs text-[#888888] shrink-0">
          <span>
            Использовано слотов: <strong className="text-white">{profile.devices.length}</strong> из{' '}
            <strong className="text-[#9ac43e]">{maxDevices}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-[#ededed] font-bold text-xs transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
