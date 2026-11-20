import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit2,
  Check,
  Laptop,
  Smartphone,
  Tablet,
  Plus,
  Copy,
  Crown,
  KeyRound,
  Smile,
  ArrowRight,
  X,
  Image as ImageIcon,
  Wrench,
  CreditCard,
  Loader2,
  AlertTriangle,
  Unlink,
  RefreshCw,
  ShoppingBag,
  Link2,
} from 'lucide-react';
import {
  AuthProvider,
  AvatarFrameId,
  StickyDevice,
  UserProfile,
  hasBridgePro,
  hasRoomPro,
  hasFullPro,
} from '../types/index.js';
import { AvatarPicker } from './AvatarPicker.js';
import { EmotePicker } from './EmotePicker.js';
import { YandexIcon, TelegramIcon } from './AuthModal.js';
import { ProfileSectionTab } from './ProfileDropdown.js';
import { LinkDeviceModal } from './LinkDeviceModal.js';
import { getAvatarForName } from '../utils/device.js';
import { sound } from '../utils/sound.js';

interface ProfileViewProps {
  profile: UserProfile;
  isAdmin?: boolean;
  clientIp?: string;
  initialTab?: ProfileSectionTab;
  onBack: () => void;
  onUpdateDisplayName: (name: string) => void;
  onUpdateAvatar: (avatar: string) => void;
  onUpdateFrame: (frame: AvatarFrameId) => void;
  onUpdateStatusEmote: (emote: string | null) => void;
  onUpdateDefaultTheme: (themeId: string) => void;
  onOpenAuthModal: (provider?: AuthProvider) => void;
  onUnlinkProvider?: (provider: 'yandex' | 'telegram') => void;
  onToggleDemoTier?: () => void;
  onRemoveDevice?: (deviceId: string) => void;
  onCreateBridgeWithDevice?: (device: StickyDevice) => void;
  onOpenDropModal?: (device?: StickyDevice) => void;
  onOpenCatalog?: () => void;
}

type InternalTab = 'appearance' | 'devices' | 'account';

const normalizeTab = (t: ProfileSectionTab): InternalTab =>
  t === 'appearance' ? 'appearance' : t === 'devices' ? 'devices' : 'account';

const FRAME_CATALOG: {
  id: AvatarFrameId;
  name: string;
  desc: string;
  priceStars?: number;
  previewClass: string;
  auraClass: string;
}[] = [
  {
    id: 'none',
    name: 'Базовая',
    desc: 'Чистый контур',
    previewClass: 'border-2 border-[#789d2a]',
    auraClass: 'from-[#789d2a]/15 via-transparent to-transparent',
  },
  {
    id: 'gold',
    name: 'Gold Aura',
    desc: 'Золотое свечение',
    priceStars: 75,
    previewClass: 'border-2 border-amber-400 animate-admin-gold',
    auraClass: 'from-amber-500/20 via-amber-500/5 to-transparent',
  },
  {
    id: 'rgb',
    name: 'Cyber RGB',
    desc: 'Спектр-перелив',
    priceStars: 120,
    previewClass: 'border-2 border-sky-400 animate-admin-rgb',
    auraClass: 'from-sky-400/20 via-purple-500/10 to-transparent',
  },
  {
    id: 'plasma',
    name: 'Neon Plasma',
    desc: 'Неоновая пульсация',
    priceStars: 150,
    previewClass: 'border-2 border-purple-400 animate-admin-plasma',
    auraClass: 'from-purple-500/25 via-fuchsia-500/5 to-transparent',
  },
];

const ROOM_THEMES: {
  id: string;
  name: string;
  subtitle: string;
  imageSrc: string;
  accentDot: string;
  priceStars?: number;
}[] = [
  {
    id: 'cyber-lounge',
    name: 'Кибер-гостиная',
    subtitle: 'Неоновый лаундж со стриминг-терминалами',
    imageSrc: '/rooms/cyber-lounge.jpg',
    accentDot: '#9ac43e',
  },
  {
    id: 'cozy-loft',
    name: 'Уютный лофт',
    subtitle: 'Кожаный диван, паркет и окна в пол',
    imageSrc: '/rooms/cozy-loft.jpg',
    accentDot: '#f59e0b',
    priceStars: 90,
  },
  {
    id: 'skyline-penthouse',
    name: 'Скайлайн-пентхаус',
    subtitle: 'Панорама на ночной кибер-город',
    imageSrc: '/rooms/skyline-penthouse.jpg',
    accentDot: '#38bdf8',
    priceStars: 120,
  },
  {
    id: 'retro-lounge',
    name: 'Ретро-гостиная 98-го',
    subtitle: 'Вельветовый диван и винтажный ПК',
    imageSrc: '/rooms/retro-lounge.jpg',
    accentDot: '#ec4899',
    priceStars: 110,
  },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  isAdmin,
  clientIp,
  initialTab = 'appearance',
  onBack,
  onUpdateDisplayName,
  onUpdateAvatar,
  onUpdateFrame,
  onUpdateStatusEmote,
  onUpdateDefaultTheme,
  onOpenAuthModal,
  onUnlinkProvider,
  onToggleDemoTier: _onToggleDemoTier,
  onRemoveDevice,
  onCreateBridgeWithDevice,
  onOpenDropModal,
  onOpenCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<InternalTab>(() => normalizeTab(initialTab));
  const [appearanceSection, setAppearanceSection] = useState<'frames' | 'themes'>('frames');

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [tempName, setTempName] = useState(profile.displayName);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isEmoteOpen, setIsEmoteOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedDropLink, setCopiedDropLink] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);
  const [confirmUnlinkProvider, setConfirmUnlinkProvider] = useState<'yandex' | 'telegram' | null>(null);

  const effectiveHandle =
    profile.handle ||
    profile.providers.yandex?.handle ||
    profile.providers.telegram?.username?.replace(/^@/, '') ||
    profile.displayName.toLowerCase().replace(/[^a-z0-9_-]/gi, '') ||
    profile.id;

  const handleCopyDropLink = () => {
    const link = `https://bridgik.ru/@${effectiveHandle}`;
    navigator.clipboard.writeText(link).then(() => {
      sound.playClick();
      setCopiedDropLink(true);
      setTimeout(() => setCopiedDropLink(false), 2000);
    });
  };

  const handleUnlinkClick = (provider: 'yandex' | 'telegram') => {
    sound.playClick();
    setConfirmUnlinkProvider(provider);
  };

  const executeUnlink = async (provider: 'yandex' | 'telegram') => {
    const key = profile.licenseKeyPreview || localStorage.getItem('bridgik_license_key');
    if (!key) return;
    setIsUnlinking(provider);
    try {
      const res = await fetch('/api/user/unlink-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, provider }),
      });
      const data = await res.json();
      if (data?.success) {
        sound.playConnect();
        setConfirmUnlinkProvider(null);
        onUnlinkProvider?.(provider);
      } else {
        alert(data?.error || 'Не удалось отвязать способ входа');
      }
    } catch {
      alert('Ошибка соединения при отвязке');
    } finally {
      setIsUnlinking(null);
    }
  };

  const isPro = hasFullPro(profile.tier);
  const hasBridge = hasBridgePro(profile.tier);
  const hasRoom = hasRoomPro(profile.tier);
  const hasFullCosmetics = isPro || Boolean(isAdmin);
  const maxDevices = (isPro ? 10 : hasBridge ? 6 : 2) + (profile.extraDeviceSlots || profile.settings?.extraDeviceSlots || 0);

  const [selectedPlan, setSelectedPlan] = useState<'data-link' | 'live-hub' | 'overdrive'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bridgik_selected_plan') as any;
      if (saved === 'data-link' || saved === 'live-hub' || saved === 'overdrive') return saved;
    }
    return 'overdrive';
  });
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showProExtend, setShowProExtend] = useState(!isPro && !hasBridge && !hasRoom);

  const PLANS = [
    {
      id: 'data-link' as const,
      title: 'Data Link',
      price: '199 ₽',
      subtitle: 'Файлы, Turbo TURN, 1 ГБ Drop',
      badge: 'Мост',
      tier: 'data-link',
      activeBorder: 'border-[#789d2a] bg-[#222d16]',
      badgeBg: 'bg-[#789d2a]',
    },
    {
      id: 'live-hub' as const,
      title: 'Live Hub',
      price: '199 ₽',
      subtitle: '8 мест, все 4 темы, замок, плеер',
      badge: 'Комнаты',
      tier: 'live-hub',
      activeBorder: 'border-indigo-400 bg-[#222138]',
      badgeBg: 'bg-indigo-500',
    },
    {
      id: 'overdrive' as const,
      title: 'Overdrive',
      price: '299 ₽',
      subtitle: 'Всё включено + 10 устройств + VIP рамки',
      badge: 'Комбо',
      tier: 'overdrive',
      activeBorder: 'border-amber-400 bg-[#282216]',
      badgeBg: 'bg-amber-500',
    },
  ];

  const handlePayPro = async () => {
    setIsPaymentLoading(true);
    setPaymentError(null);
    try {
      const licenseKey = profile.licenseKeyPreview || localStorage.getItem('bridgik_license_key');
      if (!licenseKey) {
        setPaymentError('Для оформления Pro сначала привяжите ключ или войдите через Яндекс.');
        setIsPaymentLoading(false);
        return;
      }

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: licenseKey,
          period: selectedPlan,
          returnUrl: `${window.location.origin}/?tab=profile&payment=success`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ошибка создания платежа');
      }

      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setPaymentError(err.message || 'Ошибка связи с платёжным шлюзом');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const getFrameClass = (frame: AvatarFrameId) => {
    if (frame === 'rgb') return 'border-2 border-sky-400 animate-admin-rgb';
    if (frame === 'plasma') return 'border-2 border-purple-400 animate-admin-plasma';
    if (frame === 'gold') return 'border-2 border-amber-400 animate-admin-gold';
    return 'border-2 border-[#789d2a]';
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateDisplayName(tempName.trim());
    }
  };

  const isFrameUnlocked = (id: AvatarFrameId) =>
    id === 'none' ||
    hasFullCosmetics ||
    profile.unlockedFrames.includes(id) ||
    Boolean(profile.settings?.purchasedCatalogItems?.includes(`frame:${id}`));

  const isThemeUnlocked = (id: string) =>
    id === 'cyber-lounge' ||
    hasFullCosmetics ||
    profile.unlockedThemes.includes(id) ||
    Boolean(profile.settings?.purchasedCatalogItems?.includes(`theme:${id}`));

  const tabs: { id: InternalTab; label: string }[] = [
    { id: 'appearance', label: 'Внешний вид' },
    { id: 'devices', label: `Sticky Bridge · ${profile.devices.length}/${maxDevices}` },
    { id: 'account', label: 'Подписка и доступ' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 pb-20">
      {/* Top minimal bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2a2a2a] text-[#cccccc] hover:text-white text-sm font-bold transition-colors cursor-pointer outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>
      </div>

      {/* Airy Hero Header (like eblo.id) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-1">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <img
            src={profile.avatarUrl || getAvatarForName(profile.displayName)}
            alt={profile.displayName}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover bg-[#141414] shrink-0 ${getFrameClass(
              profile.activeFrame
            )}`}
            style={{ imageRendering: 'pixelated' }}
          />

          <div className="min-w-0 space-y-1.5">
            {/* Staff / Pro badges + bare 7TV emote BEFORE nickname */}
            <div className="flex items-center gap-2 flex-wrap">
              {isAdmin && (
                <span
                  className="w-6 h-6 rounded-md bg-[#242424] border border-white/15 flex items-center justify-center text-[#ededed] shrink-0"
                  title="Создатель сервиса (DEV)"
                >
                  <Wrench className="w-3.5 h-3.5" />
                </span>
              )}
              {isPro && (
                <span
                  className="w-6 h-6 rounded-md bg-[#789d2a] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#789d2a]/40"
                  title="Bridgik Pro"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}
              {profile.activeEmote && (
                <img
                  src={profile.activeEmote}
                  alt=""
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain select-none shrink-0"
                  title="7TV статус"
                />
              )}
              <h1
                className={`text-2xl sm:text-3xl font-extrabold truncate ${
                  isPro || isAdmin ? 'admin-name-shimmer' : 'text-[#ededed]'
                }`}
              >
                {profile.displayName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#9a9a9a]">
              <span>
                Тариф:{' '}
                <strong className={isPro ? 'text-[#bbf348]' : 'text-[#ededed]'}>
                  {isPro ? 'Bridgik Pro' : 'Free'}
                </strong>
              </span>
              <span>·</span>
              <span>
                Устройства:{' '}
                <strong className="text-[#ededed]">
                  {profile.devices.length}/{maxDevices}
                </strong>
              </span>
              {isPro && (
                <>
                  <span>·</span>
                  <span>
                    Шлюз S3:{' '}
                    <strong className="text-[#ededed]">
                      {profile.s3QuotaUsedMb} МБ / {Math.round(profile.s3QuotaLimitMb / 1024)} ГБ
                    </strong>
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {profile.providers.yandex && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242424] text-xs font-bold text-[#e5e5e5]">
                  <YandexIcon className="w-3.5 h-3.5" />
                  <span>{profile.providers.yandex.handle}</span>
                </span>
              )}
              {profile.providers.telegram && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242424] text-xs font-bold text-[#e5e5e5]">
                  <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
                  <span>@{profile.providers.telegram.username || 'telegram'}</span>
                </span>
              )}
              {profile.licenseKeyPreview && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242424] text-xs font-bold text-[#e5e5e5]">
                  <KeyRound className="w-3.5 h-3.5 text-[#9ac43e]" />
                  <span>{profile.licenseKeyPreview}</span>
                </span>
              )}
              <span
                onClick={handleCopyDropLink}
                title="Нажмите, чтобы скопировать персональную ссылку Drop Link"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242424] hover:bg-[#2c2c2c] text-xs font-bold text-[#bbf348] border border-[#789d2a]/40 transition-colors cursor-pointer select-none"
              >
                <Link2 className="w-3.5 h-3.5 text-[#9ac43e]" />
                <span>@{effectiveHandle}</span>
                {copiedDropLink ? (
                  <span className="text-[10px] text-white font-mono">Скопировано!</span>
                ) : (
                  <span className="text-[10px] text-[#888888] font-mono">drop link</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setTempName(profile.displayName);
            setIsEditDrawerOpen((v) => !v);
          }}
          className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 outline-none ${
            isEditDrawerOpen
              ? 'bg-[#283216] border-[#789d2a] text-[#ededed]'
              : 'bg-[#222222] hover:bg-[#2c2c2c] border-white/[0.08] text-[#ededed]'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditDrawerOpen ? 'Готово' : 'Редактировать'}</span>
        </button>
      </div>

      {/* Collapsible Compact Edit Panel */}
      {isEditDrawerOpen && (
        <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-white/[0.08] flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              placeholder="Ваш ник"
              className="bg-[#141414] border border-[#3a3a3a] focus:border-[#789d2a] rounded-xl px-3 py-1.5 text-base font-bold text-white outline-none w-44"
            />
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                handleSaveName();
              }}
              className="p-2 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-white cursor-pointer"
              title="Сохранить ник"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsEmoteOpen(false);
                setIsAvatarOpen((v) => !v);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] border border-white/[0.08] text-sm font-bold text-[#ededed] flex items-center gap-2 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-[#9ac43e]" />
              <span>Сменить маскота</span>
            </button>
            {isAvatarOpen && (
              <div className="absolute top-11 left-0 z-50">
                <AvatarPicker
                  currentAvatar={profile.avatarUrl || getAvatarForName(profile.displayName)}
                  onSelectAvatar={(src) => {
                    onUpdateAvatar(src);
                    setIsAvatarOpen(false);
                  }}
                  clientIp={clientIp}
                  onClose={() => setIsAvatarOpen(false)}
                />
              </div>
            )}
          </div>

          <div className="relative flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setIsAvatarOpen(false);
                setIsEmoteOpen((v) => !v);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] border border-white/[0.08] text-sm font-bold text-[#ededed] flex items-center gap-2 cursor-pointer"
            >
              {profile.activeEmote ? (
                <img src={profile.activeEmote} alt="" className="w-4 h-4 object-contain" />
              ) : (
                <Smile className="w-4 h-4 text-amber-300" />
              )}
              <span>7TV-эмоут</span>
            </button>
            {profile.activeEmote && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onUpdateStatusEmote(null);
                }}
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#ef9282] hover:bg-white/[0.05] cursor-pointer"
                title="Убрать эмоут"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isEmoteOpen && (
              <EmotePicker
                isOpen={isEmoteOpen}
                onClose={() => setIsEmoteOpen(false)}
                positionClass="top-11 left-0"
                onSelectEmote={(emote) => {
                  sound.playClick();
                  onUpdateStatusEmote(emote.url);
                  setIsEmoteOpen(false);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* eblo.id-style clean underline tabs */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-white/[0.08] overflow-x-auto">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab(t.id);
              }}
              className={`pb-3 text-base sm:text-lg font-extrabold whitespace-nowrap transition-colors cursor-pointer border-b-2 outline-none focus-visible:text-white ${
                isActive
                  ? 'text-[#ededed] border-[#789d2a]'
                  : 'text-[#888888] border-transparent hover:text-[#cccccc]'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Внешний вид */}
      {activeTab === 'appearance' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="inline-flex p-1 rounded-xl bg-[#1c1c1c] border border-white/[0.06] self-start">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAppearanceSection('frames');
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors cursor-pointer outline-none ${
                  appearanceSection === 'frames'
                    ? 'bg-[#283216] text-[#ededed] border border-[#789d2a]/60'
                    : 'text-[#888888] hover:text-[#cccccc]'
                }`}
              >
                Рамки аватара
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAppearanceSection('themes');
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors cursor-pointer outline-none ${
                  appearanceSection === 'themes'
                    ? 'bg-[#283216] text-[#ededed] border border-[#789d2a]/60'
                    : 'text-[#888888] hover:text-[#cccccc]'
                }`}
              >
                Локации комнат
              </button>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1b1b1b] border border-white/[0.06] self-start sm:self-auto">
              <span className="text-xs text-[#777777]">В комнате:</span>
              <img
                src={profile.avatarUrl || getAvatarForName(profile.displayName)}
                alt=""
                className={`w-7 h-7 rounded-full object-cover bg-[#141414] ${getFrameClass(
                  profile.activeFrame
                )}`}
                style={{ imageRendering: 'pixelated' }}
              />
              {isAdmin && (
                <span className="w-4 h-4 rounded bg-[#242424] border border-white/15 flex items-center justify-center text-[#ededed] shrink-0">
                  <Wrench className="w-2.5 h-2.5" />
                </span>
              )}
              {isPro && (
                <span className="w-4 h-4 rounded bg-[#789d2a] flex items-center justify-center text-white shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              {profile.activeEmote && (
                <img
                  src={profile.activeEmote}
                  alt=""
                  className="w-5 h-5 object-contain select-none"
                />
              )}
              <span
                className={`text-sm font-extrabold ${
                  isPro || isAdmin ? 'admin-name-shimmer' : 'text-[#ededed]'
                }`}
              >
                {profile.displayName}
              </span>
            </div>
          </div>

          {appearanceSection === 'frames' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {FRAME_CATALOG.filter((f) => isFrameUnlocked(f.id)).map((f) => {
                  const selected = profile.activeFrame === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onUpdateFrame(f.id);
                      }}
                      className={`group rounded-2xl overflow-hidden border text-left transition-all cursor-pointer outline-none flex flex-col bg-[#1b1b1b] ${
                        selected
                          ? 'border-[#789d2a] ring-1 ring-[#789d2a]/40'
                          : 'border-white/[0.08] hover:border-white/25'
                      }`}
                    >
                      <div className="relative h-28 w-full bg-[#141414] flex items-center justify-center overflow-hidden">
                        <div
                          className={`absolute inset-0 bg-radial ${f.auraClass} opacity-80 group-hover:opacity-100 transition-opacity`}
                        />
                        <img
                          src={profile.avatarUrl || getAvatarForName(profile.displayName)}
                          alt={f.name}
                          className={`relative w-16 h-16 rounded-full object-cover bg-[#141414] transition-transform group-hover:scale-105 ${f.previewClass}`}
                          style={{ imageRendering: 'pixelated' }}
                        />
                        {selected && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#283216]/90 border border-[#789d2a] text-[11px] font-bold text-[#bbf348]">
                            Надето
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-[#1c1c1c] border-t border-white/[0.06] w-full">
                        <p className="font-extrabold text-base text-[#ededed] truncate">{f.name}</p>
                        <p className="text-xs text-[#888888] truncate">{f.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Banner to Catalog */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#202713] via-[#1a1c16] to-[#171717] border border-[#789d2a]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#283216] border border-[#789d2a]/40 flex items-center justify-center text-[#9ac43e] shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#ededed] text-base">
                      Нужно больше рамок для аватара?
                    </h4>
                    <p className="text-xs text-[#a8a8a8] mt-0.5">
                      В Каталоге доступны эксклюзивные анимированные рамки: Gold Aura, Cyber RGB и Neon Plasma.
                    </p>
                  </div>
                </div>
                {onOpenCatalog && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onOpenCatalog();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#789d2a] hover:bg-[#8bb730] text-black font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-md shadow-[#789d2a]/20"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Перейти в Каталог</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Real room locations in inventory */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROOM_THEMES.filter((rt) => isThemeUnlocked(rt.id)).map((rt) => {
                  const selected = profile.defaultRoomTheme === rt.id;
                  return (
                    <button
                      key={rt.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onUpdateDefaultTheme(rt.id);
                      }}
                      className={`group rounded-2xl overflow-hidden border text-left transition-all cursor-pointer outline-none bg-[#1c1c1c] ${
                        selected
                          ? 'border-[#789d2a] ring-1 ring-[#789d2a]/40'
                          : 'border-white/[0.08] hover:border-white/25'
                      }`}
                    >
                      <div className="relative aspect-video w-full bg-[#121216] overflow-hidden">
                        <img
                          src={rt.imageSrc}
                          alt={rt.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        {selected && (
                          <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#283216]/95 border border-[#789d2a] text-xs font-bold text-[#bbf348] backdrop-blur-sm">
                            Выбрана по умолчанию
                          </span>
                        )}
                      </div>

                      <div className="p-3.5 border-t border-white/[0.06]">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: rt.accentDot }}
                          />
                          <p className="font-extrabold text-base text-[#ededed] truncate">
                            {rt.name}
                          </p>
                        </div>
                        <p className="text-xs text-[#888888] mt-0.5 truncate">{rt.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Banner to Catalog for Rooms */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#202713] via-[#1a1c16] to-[#171717] border border-[#789d2a]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#283216] border border-[#789d2a]/40 flex items-center justify-center text-[#9ac43e] shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#ededed] text-base">
                      Хотите больше локаций для онлайн-комнат?
                    </h4>
                    <p className="text-xs text-[#a8a8a8] mt-0.5">
                      В Каталоге доступны Уютный лофт, Скайлайн-пентхаус и Ретро 98-го.
                    </p>
                  </div>
                </div>
                {onOpenCatalog && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onOpenCatalog();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#789d2a] hover:bg-[#8bb730] text-black font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-md shadow-[#789d2a]/20"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Перейти в Каталог</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Sticky Bridge */}
      {activeTab === 'devices' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <p className="text-sm text-[#a8a8a8]">
              Связанные устройства находят друг друга при открытии сайта без ввода PIN. Бесплатно — 2 слота, в Pro — до 10.
            </p>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsLinkModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#283216] hover:bg-[#33411c] border border-[#789d2a]/70 text-[#ededed] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-[#9ac43e]" />
              <span>Привязать устройство</span>
            </button>
          </div>

          {/* Bridgik Drop Link (Personal Inbox) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1b2214] to-[#161616] border border-[#789d2a]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-[#789d2a]/5">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#789d2a]/20 text-[#bbf348] text-[11px] font-black uppercase tracking-wider">
                  <Link2 className="w-3 h-3" />
                  <span>Личный Drop Link</span>
                </span>
                <span className="text-xs text-[#888888]">Ваш постоянный инбокс</span>
              </div>
              <p className="font-mono text-sm sm:text-base font-bold text-white truncate">
                https://bridgik.ru/@{effectiveHandle}
              </p>
              <p className="text-xs text-[#888888]">
                Любой человек может отправить вам файл по этой ссылке прямо в ваш буфер Bridgik.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyDropLink}
              className="px-3.5 py-2 rounded-xl bg-[#283216] hover:bg-[#33411c] border border-[#789d2a] text-[#ededed] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              {copiedDropLink ? <Check className="w-4 h-4 text-[#9ac43e]" /> : <Copy className="w-4 h-4 text-[#9ac43e]" />}
              <span>{copiedDropLink ? 'Скопировано!' : 'Копировать'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.devices.map((dev) => (
              <div
                key={dev.id}
                className="p-4 rounded-xl bg-[#1b1b1b] border border-white/[0.07] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#242424] flex items-center justify-center text-[#9ac43e] shrink-0">
                    {dev.deviceType === 'mobile' ? (
                      <Smartphone className="w-5 h-5" />
                    ) : dev.deviceType === 'tablet' ? (
                      <Tablet className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-[#ededed] truncate">
                        {dev.name}
                      </span>
                      {dev.isCurrent && (
                        <span className="text-[10px] font-bold text-[#9ac43e] uppercase">
                          Этот браузер
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#888888] truncate">
                      {dev.browserLabel} ·{' '}
                      <span className={dev.isOnline ? 'text-[#9ac43e]' : ''}>
                        {dev.isOnline ? 'В сети' : 'Офлайн'}
                      </span>
                    </p>
                  </div>
                </div>

                {!dev.isCurrent && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {dev.isOnline && onCreateBridgeWithDevice && (
                      <button
                        type="button"
                        onClick={() => onCreateBridgeWithDevice(dev)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#283216] hover:bg-[#789d2a] text-[#bbf348] hover:text-white border border-[#789d2a]/50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Мгновенный прямой P2P Bridge"
                      >
                        <span>⚡ P2P</span>
                      </button>
                    )}
                    {onOpenDropModal && (
                      <button
                        type="button"
                        onClick={() => onOpenDropModal(dev)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          dev.isOnline
                            ? 'bg-[#222222] hover:bg-[#2e2e2e] text-[#ededed] border border-white/10'
                            : 'bg-[#283216] hover:bg-[#789d2a] text-[#bbf348] hover:text-white border border-[#789d2a]/50'
                        }`}
                        title="Оставить файл в буфере на 24 часа"
                      >
                        <span>📦 Drop & Go</span>
                      </button>
                    )}
                    {onRemoveDevice && (
                      <button
                        type="button"
                        onClick={() => onRemoveDevice(dev.id)}
                        className="p-1.5 rounded-lg text-[#888888] hover:text-[#ef9282] hover:bg-white/[0.05] transition-colors cursor-pointer"
                        title="Отвязать устройство"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {profile.devices.length < maxDevices && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsLinkModalOpen(true);
                }}
                className="p-4 rounded-xl border border-dashed border-[#333333] hover:border-[#789d2a]/60 bg-[#181818] flex items-center justify-center gap-2 text-[#888888] hover:text-[#ededed] text-sm font-bold cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Свободный слот ({profile.devices.length}/{maxDevices})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Аккаунт и Pro */}
      {activeTab === 'account' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Bridgik Subscription Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#1b2214] border-2 border-[#789d2a] shadow-lg shadow-[#789d2a]/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#789d2a]/20 border border-[#789d2a]/40 text-xs uppercase font-extrabold text-[#bbf348]">
                  <Crown className="w-3.5 h-3.5" />
                  <span>
                    {profile.tier === 'data-link'
                      ? 'Тариф Data Link активен'
                      : profile.tier === 'live-hub'
                      ? 'Тариф Live Hub активен'
                      : isPro
                      ? 'Тариф Overdrive активен'
                      : 'Подписка Bridgik'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  {profile.tier !== 'free'
                    ? `Активен до ${profile.proUntil ? new Date(profile.proUntil).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'бессрочно'}`
                    : 'Сдержанный набор возможностей без лишних переплат'}
                </h3>
              </div>

              {profile.tier !== 'free' && (
                <button
                  type="button"
                  onClick={() => setShowProExtend((prev) => !prev)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#283416] hover:bg-[#34441c] text-[#bbf348] border border-[#789d2a] text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                >
                  {showProExtend ? 'Скрыть тарифы' : 'Сменить / Продлить тариф'}
                </button>
              )}
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-[#ededed]">
                <span className="w-5 h-5 rounded-md bg-[#789d2a]/20 text-[#bbf348] flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                <span><strong>Data Link:</strong> папки, докачка, Turbo TURN, 1 ГБ Drop Link</span>
              </div>
              <div className="flex items-center gap-2 text-[#ededed]">
                <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                <span><strong>Live Hub:</strong> до 8 мест, 4 локации, замок, плеер музыки</span>
              </div>
              <div className="flex items-center gap-2 text-[#ededed]">
                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                <span><strong>Overdrive:</strong> всё включено + до 10 устройств + VIP рамки</span>
              </div>
              <div className="flex items-center gap-2 text-[#ededed]">
                <span className="w-5 h-5 rounded-md bg-[#789d2a]/20 text-[#bbf348] flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                <span><strong>Оплата помесячно:</strong> без годовых навязываний и автосписаний</span>
              </div>
            </div>

            {/* Plan Selector & Pay Button */}
            {(profile.tier === 'free' || showProExtend) && (
              <div className="pt-2 space-y-3.5 border-t border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    const isMyCurrent = profile.tier === plan.tier;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedPlan(plan.id);
                        }}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? `${plan.activeBorder} shadow-lg`
                            : 'bg-[#181818] border-[#333333] hover:border-[#444444]'
                        }`}
                      >
                        {isMyCurrent ? (
                          <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-[#789d2a] text-white text-[10px] font-bold tracking-wide shadow-sm">
                            Текущий
                          </span>
                        ) : plan.badge ? (
                          <span className={`absolute -top-2.5 right-2 px-2 py-0.5 rounded-full ${plan.badgeBg} text-white text-[10px] font-bold tracking-wide shadow-sm`}>
                            {plan.badge}
                          </span>
                        ) : null}
                        <div>
                          <div className="text-xs text-[#aaaaaa] font-semibold">{plan.title}</div>
                          <div className="text-lg font-extrabold text-white mt-0.5">{plan.price}</div>
                        </div>
                        <div className="text-[11px] font-mono text-[#cccccc] mt-1.5">{plan.subtitle}</div>
                      </div>
                    );
                  })}
                </div>

                {paymentError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-xs">
                    {paymentError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handlePayPro}
                    disabled={isPaymentLoading}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] disabled:opacity-50 text-white font-extrabold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#789d2a]/20"
                  >
                    {isPaymentLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Создаем счет в ЮKassa...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>
                          {profile.tier === selectedPlan ? 'Продлить ' : 'Оформить '}
                          {PLANS.find((p) => p.id === selectedPlan)?.title} за{' '}
                          {PLANS.find((p) => p.id === selectedPlan)?.price}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-[11px] text-[#888888] text-center sm:text-right leading-tight">
                    <p className="font-semibold text-[#aaaaaa]">Оплата через ЮKassa:</p>
                    <p>СБП в 1 клик, карты МИР, Visa, Mastercard РФ. Без скрытых списаний.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <YandexIcon className="w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-base text-[#ededed]">Яндекс ID</p>
                  <p className="text-xs text-[#888888] truncate">
                    {profile.providers.yandex
                      ? `Подключён аккаунт ${profile.providers.yandex.handle}`
                      : 'Вход в 1 клик, 100% стабильно в РФ без VPN'}
                  </p>
                </div>
              </div>
              {profile.providers.yandex ? (
                <button
                  type="button"
                  onClick={() => handleUnlinkClick('yandex')}
                  disabled={isUnlinking === 'yandex'}
                  className="px-3 py-1.5 rounded-lg bg-red-950/35 hover:bg-red-900/50 border border-red-800/40 text-xs font-bold text-red-200 hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isUnlinking === 'yandex' ? 'Отвязка...' : 'Отвязать'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('yandex')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2f2f2f] text-xs font-bold text-[#ededed] cursor-pointer shrink-0"
                >
                  Привязать
                </button>
              )}
            </div>

            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <TelegramIcon className="w-5 h-5 text-[#229ED9] shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-base text-[#ededed]">Telegram (@bridgik_bot)</p>
                  <p className="text-xs text-[#888888] truncate">
                    {profile.providers.telegram
                      ? `Подключён @${profile.providers.telegram.username || 'telegram'}`
                      : 'Для оплаты Telegram Stars и уведомлений о скачивании'}
                  </p>
                </div>
              </div>
              {profile.providers.telegram ? (
                <button
                  type="button"
                  onClick={() => handleUnlinkClick('telegram')}
                  disabled={isUnlinking === 'telegram'}
                  className="px-3 py-1.5 rounded-lg bg-red-950/35 hover:bg-red-900/50 border border-red-800/40 text-xs font-bold text-red-200 hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isUnlinking === 'telegram' ? 'Отвязка...' : 'Отвязать'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('telegram')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2f2f2f] text-xs font-bold text-[#ededed] cursor-pointer shrink-0"
                >
                  Привязать
                </button>
              )}
            </div>

            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <KeyRound className="w-5 h-5 text-[#9ac43e] shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-base text-[#ededed]">Резервный ключ входа</p>
                  <p className="text-xs text-[#888888] truncate">
                    {profile.licenseKeyPreview ||
                      'Анонимный ключ формата BRDG-XXXX для восстановления на iOS Safari'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const key = profile.licenseKeyPreview || 'BRDG-9K2M-4P7X-8Q1Z';
                  navigator.clipboard.writeText(key).catch(() => {});
                  sound.playClick();
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 1800);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2f2f2f] text-xs font-bold text-[#9ac43e] flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Скопирован' : 'Копировать'}</span>
              </button>
            </div>

            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Link2 className="w-5 h-5 text-[#9ac43e] shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-base text-[#ededed]">Личный инбокс (Drop Link)</p>
                  <p className="text-xs text-[#888888] font-mono truncate">
                    https://bridgik.ru/@{effectiveHandle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyDropLink}
                className="px-3.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2f2f2f] text-xs font-bold text-[#9ac43e] flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copiedDropLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDropLink ? 'Скопирована' : 'Копировать'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <LinkDeviceModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        profile={profile}
        maxDevices={maxDevices}
      />

      {/* Beautiful Bridgik-styled unlinking confirmation modal */}
      {confirmUnlinkProvider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#171717] border border-[#2e3725] shadow-[0_24px_60px_rgba(0,0,0,0.95)] p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center justify-center text-red-400 shrink-0">
                <Unlink className="w-5 h-5 text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-lg text-white font-mono">
                  Отвязать {confirmUnlinkProvider === 'yandex' ? 'Яндекс ID' : 'Telegram'}?
                </h3>
                <p className="text-xs text-[#8c9c82] mt-0.5">
                  {confirmUnlinkProvider === 'yandex'
                    ? `Аккаунт @${profile.providers.yandex?.handle || 'yandex'} будет отвязан от профиля.`
                    : `Аккаунт @${profile.providers.telegram?.username || 'telegram'} будет отвязан от профиля.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmUnlinkProvider(null)}
                className="p-1 rounded-lg text-[#888888] hover:text-white transition-colors cursor-pointer"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1e231b] border border-[#2e3725] text-xs space-y-1.5 font-mono">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Вход останется по ключу</span>
              </div>
              <p className="text-[#8c9c82]">
                Вы по-прежнему сможете входить по резервному ключу{' '}
                <span className="text-white font-bold">{profile.licenseKeyPreview}</span> или привязать другой аккаунт в любое удобное время.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setConfirmUnlinkProvider(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2b2b2b] text-[#cccccc] hover:text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isUnlinking !== null}
                onClick={() => executeUnlink(confirmUnlinkProvider)}
                className="px-4 py-2 rounded-xl bg-[#3b1717] hover:bg-[#4d1e1e] border border-red-700/60 text-red-200 hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isUnlinking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Отвязка...</span>
                  </>
                ) : (
                  <>
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Отвязать {confirmUnlinkProvider === 'yandex' ? 'Яндекс ID' : 'Telegram'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};