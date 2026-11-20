import React, { useState } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Laptop,
  HardDrive,
  CheckCircle2,
  Zap,
  CreditCard,
  QrCode,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  X,
  Loader2,
  Gift,
} from 'lucide-react';
import { UserProfile, AvatarFrameId } from '../types/index.js';
import { getAvatarForName } from '../utils/device.js';
import { sound } from '../utils/sound.js';

interface CatalogViewProps {
  onBack: () => void;
  userProfile: UserProfile;
  onOpenPricing?: () => void;
  onOpenProfile?: () => void;
  onUpdateFrame?: (frameId: AvatarFrameId) => void;
  onUpdateDefaultTheme?: (themeId: string) => void;
  onProfileUpdated?: (updated: UserProfile) => void;
}

type CatalogSection = 'all' | 'appearance' | 'sticky' | 'drop';

interface CatalogItem {
  id: string;
  type: 'frame' | 'theme' | 'devices' | 'drop_quota';
  title: string;
  subtitle: string;
  description: string;
  priceRub: number;
  badge?: string;
  isUnlocked: boolean;
  isActive?: boolean;
  previewData?: any;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onBack,
  userProfile,
  onOpenPricing,
  onOpenProfile,
  onProfileUpdated,
}) => {
  const [activeSection, setActiveSection] = useState<CatalogSection>('all');
  const [appearanceSubTab, setAppearanceSubTab] = useState<'frames' | 'rooms'>('frames');

  // Purchase modal states
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'sbp' | 'card' | 'yoomoney'>('sbp');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const isPro = userProfile.tier === 'pro';
  const isAdmin = Boolean(userProfile.isAdmin);
  const hasFullAccess = isPro || isAdmin;

  const extraSlots = userProfile.extraDeviceSlots || userProfile.settings?.extraDeviceSlots || 0;
  const maxDevices = (isPro ? 10 : 2) + extraSlots;
  const hasDrop500 =
    (userProfile.s3QuotaLimitMb && userProfile.s3QuotaLimitMb >= 500) ||
    Boolean(userProfile.settings?.purchasedCatalogItems?.includes('drop_quota:500'));

  // Unlock checkers
  const isFrameUnlocked = (id: AvatarFrameId) =>
    id === 'none' ||
    hasFullAccess ||
    userProfile.unlockedFrames.includes(id) ||
    Boolean(userProfile.settings?.purchasedCatalogItems?.includes(`frame:${id}`));

  const isThemeUnlocked = (id: string) =>
    id === 'cyber-lounge' ||
    hasFullAccess ||
    userProfile.unlockedThemes.includes(id) ||
    Boolean(userProfile.settings?.purchasedCatalogItems?.includes(`theme:${id}`));

  // Frame items
  const frameItems: CatalogItem[] = [
    {
      id: 'gold',
      type: 'frame',
      title: 'Gold Aura',
      subtitle: 'Золотое свечение с мягкой анимацией пульсации',
      description: 'Эксклюзивная золотая аура подчеркивает ваш статус в комнате и на аватарке профиля.',
      priceRub: 99,
      badge: 'VIP Свечение',
      isUnlocked: isFrameUnlocked('gold'),
      isActive: userProfile.activeFrame === 'gold',
      previewData: {
        frameClass: 'border-2 border-amber-400 animate-admin-gold',
        auraClass: 'from-amber-500/25 via-amber-500/5 to-transparent',
      },
    },
    {
      id: 'rgb',
      type: 'frame',
      title: 'Cyber RGB',
      subtitle: 'Динамичный неоновый спектр-перелив оттенков',
      description: 'Переливающийся киберпанк-контур аватара, заметный в любом чате и онлайн-комнате.',
      priceRub: 99,
      badge: 'Хит продаж',
      isUnlocked: isFrameUnlocked('rgb'),
      isActive: userProfile.activeFrame === 'rgb',
      previewData: {
        frameClass: 'border-2 border-sky-400 animate-admin-rgb',
        auraClass: 'from-sky-400/20 via-purple-500/10 to-transparent',
      },
    },
    {
      id: 'plasma',
      type: 'frame',
      title: 'Neon Plasma',
      subtitle: 'Энергетическая пульсация фиолетовой плазмы',
      description: 'Глубокий пурпурно-неоновый шлейф частиц вокруг вашей фотографии профиля.',
      priceRub: 99,
      badge: 'Эксклюзив',
      isUnlocked: isFrameUnlocked('plasma'),
      isActive: userProfile.activeFrame === 'plasma',
      previewData: {
        frameClass: 'border-2 border-purple-400 animate-admin-plasma',
        auraClass: 'from-purple-500/25 via-fuchsia-500/5 to-transparent',
      },
    },
  ];

  // Room items
  const roomItems: CatalogItem[] = [
    {
      id: 'cozy-loft',
      type: 'theme',
      title: 'Уютный лофт',
      subtitle: 'Тёплый свет, кожаный диван, паркет и вечерний город',
      description: 'Атмосферная локация для ламповых посиделок и вечерних разговоров без лишней суеты.',
      priceRub: 149,
      isUnlocked: isThemeUnlocked('cozy-loft'),
      isActive: userProfile.defaultRoomTheme === 'cozy-loft',
      previewData: {
        imageSrc: '/rooms/cozy-loft.jpg',
        accent: '#f59e0b',
      },
    },
    {
      id: 'skyline-penthouse',
      type: 'theme',
      title: 'Скайлайн-пентхаус',
      subtitle: 'Панорамные окна в пол с видом на ночной мегаполис',
      description: 'Футуристичный пентхаус на верхнем этаже небоскреба для статусных конференций.',
      priceRub: 149,
      badge: 'Популярно',
      isUnlocked: isThemeUnlocked('skyline-penthouse'),
      isActive: userProfile.defaultRoomTheme === 'skyline-penthouse',
      previewData: {
        imageSrc: '/rooms/skyline-penthouse.jpg',
        accent: '#38bdf8',
      },
    },
    {
      id: 'retro-lounge',
      type: 'theme',
      title: 'Ретро-гостиная 98-го',
      subtitle: 'Вельветовый диван, винтажный ЭЛТ-монитор и эстетика 90-х',
      description: 'Ностальгический ретро-интерьер с ламповым кинескопным компьютером и постерами.',
      priceRub: 149,
      isUnlocked: isThemeUnlocked('retro-lounge'),
      isActive: userProfile.defaultRoomTheme === 'retro-lounge',
      previewData: {
        imageSrc: '/rooms/retro-lounge.jpg',
        accent: '#ec4899',
      },
    },
  ];

  // Sticky Bridge slot expansion items
  const purchasedCatalogItems = userProfile.settings?.purchasedCatalogItems || [];
  const isSticky1Purchased = purchasedCatalogItems.includes('devices:devices_1') || extraSlots >= 3;
  const isSticky2Purchased = purchasedCatalogItems.includes('devices:devices_2') || extraSlots >= 3;

  const stickyItems: CatalogItem[] = [
    {
      id: 'devices_1',
      type: 'devices',
      title: '+1 слот Sticky Bridge',
      subtitle: 'Подключите ещё один личный ноутбук или домашний ПК',
      description: 'Устройства навсегда привязываются к вашему аккаунту и находят друг друга без ввода PIN.',
      priceRub: 99,
      isUnlocked: isSticky1Purchased,
    },
    {
      id: 'devices_2',
      type: 'devices',
      title: '+2 слота Sticky Bridge',
      subtitle: 'Объедините рабочий парк устройств в одну сеть',
      description: 'Связка смартфона, планшета, домашнего ПК и офисного ноутбука в единый защищенный канал.',
      priceRub: 149,
      badge: '-25% выгода',
      isUnlocked: isSticky2Purchased,
    },
  ];

  // Drop & Go 500 MB buffer item
  const dropItems: CatalogItem[] = [
    {
      id: 'drop_500',
      type: 'drop_quota',
      title: 'Буфер Drop & Go 500 МБ',
      subtitle: 'Передача файлов до 500 МБ на выключенные устройства',
      description:
        'Файлы сохраняются в защищенном буфере до 24 часов и автоматически загружаются на ПК или телефон, как только адресат подключится к сети.',
      priceRub: 149,
      badge: 'Рекомендуется',
      isUnlocked: hasDrop500,
    },
  ];

  // Items available to buy in Catalog (strictly those the user DOES NOT already have)
  const availableFrames = frameItems.filter((item) => !item.isUnlocked);
  const availableRooms = roomItems.filter((item) => !item.isUnlocked);
  const availableSticky = stickyItems.filter((item) => !item.isUnlocked);

  const handleOpenPurchase = (item: CatalogItem) => {
    sound.playClick();
    setSelectedItem(item);
    setPurchaseSuccess(false);
    setPurchaseError(null);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItem) return;
    setIsPurchasing(true);
    setPurchaseError(null);
    try {
      const key = userProfile.licenseKeyPreview || localStorage.getItem('bridgik_license_key');
      const deviceId = localStorage.getItem('bridgik_device_id') || '';

      const res = await fetch(`/api/catalog/purchase?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: key ? `Bearer ${key}` : '',
        },
        body: JSON.stringify({
          itemType: selectedItem.type,
          itemId: selectedItem.id,
          paymentMethod: selectedPaymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Не удалось завершить операцию');
      }

      sound.playTransferComplete();
      setPurchaseSuccess(true);
      if (data.user && onProfileUpdated) {
        onProfileUpdated(data.user);
      }
    } catch (err: any) {
      sound.playDisconnect();
      setPurchaseError(err.message || 'Ошибка обработки запроса');
    } finally {
      setIsPurchasing(false);
    }
  };

  const avatarSrc = userProfile.avatarUrl || getAvatarForName(userProfile.displayName);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 pb-24">
      {/* Top minimal bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#aaaaaa] hover:text-[#ededed] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#283216] border border-[#789d2a]/50 text-xs font-bold text-[#9ac43e] flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Каталог Bridgik</span>
          </span>
        </div>
      </div>

      {/* Hero Title Header */}
      <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-[#1d2216] via-[#181a17] to-[#141414] border border-[#789d2a]/30 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#9ac43e]/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#242b16] border border-[#789d2a]/40 text-[#9ac43e] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#9ac43e]" />
            <span>Кастомизация и расширения</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] tracking-tight">
            Каталог возможностей
          </h1>
          <p className="text-sm sm:text-base text-[#a8a8a8] max-w-2xl leading-relaxed">
            Поштучное приобретение элементов оформления, расширение пула подключенных устройств и увеличенный офлайн-буфер. Все допы закрепляются за вашим аккаунтом навсегда и доступны как с подпиской Pro, так и без неё.
          </p>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/[0.08]">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveSection('all');
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'all'
              ? 'bg-[#283216] text-[#ededed] border border-[#789d2a]/60 shadow-md'
              : 'text-[#888888] hover:text-[#cccccc] hover:bg-white/[0.04]'
          }`}
        >
          Все разделы
        </button>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveSection('appearance');
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeSection === 'appearance'
              ? 'bg-[#283216] text-[#ededed] border border-[#789d2a]/60 shadow-md'
              : 'text-[#888888] hover:text-[#cccccc] hover:bg-white/[0.04]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Внешний вид</span>
        </button>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveSection('sticky');
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeSection === 'sticky'
              ? 'bg-[#283216] text-[#ededed] border border-[#789d2a]/60 shadow-md'
              : 'text-[#888888] hover:text-[#cccccc] hover:bg-white/[0.04]'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Sticky Bridge (+устройства)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveSection('drop');
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeSection === 'drop'
              ? 'bg-[#283216] text-[#ededed] border border-[#789d2a]/60 shadow-md'
              : 'text-[#888888] hover:text-[#cccccc] hover:bg-white/[0.04]'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Drop & Go (до 500 МБ)</span>
        </button>
      </div>

      {/* SECTION 1: Внешний вид */}
      {(activeSection === 'all' || activeSection === 'appearance') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9ac43e]" />
                <h2 className="text-lg font-extrabold text-[#ededed]">Внешний вид и стиль</h2>
              </div>
              <p className="text-xs text-[#888888] mt-0.5">
                Анимированные рамки аватара и локации для онлайн-комнат
              </p>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-[#1c1c1c] border border-white/[0.06] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAppearanceSubTab('frames');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  appearanceSubTab === 'frames'
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
                  setAppearanceSubTab('rooms');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  appearanceSubTab === 'rooms'
                    ? 'bg-[#283216] text-[#ededed] border border-[#789d2a]/60'
                    : 'text-[#888888] hover:text-[#cccccc]'
                }`}
              >
                Локации комнат
              </button>
            </div>
          </div>

          {appearanceSubTab === 'frames' ? (
            availableFrames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {availableFrames.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[#1b1b1b] border border-white/[0.08] hover:border-white/20 transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="relative h-32 w-full bg-[#141414] flex items-center justify-center overflow-hidden">
                      <div
                        className={`absolute inset-0 bg-radial ${item.previewData.auraClass} opacity-80 group-hover:opacity-100 transition-opacity`}
                      />
                      <img
                        src={avatarSrc}
                        alt={item.title}
                        className={`relative w-16 h-16 rounded-full object-cover bg-[#141414] transition-transform group-hover:scale-105 ${item.previewData.frameClass}`}
                        style={{ imageRendering: 'pixelated' }}
                      />
                      {item.badge && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 border border-white/10 text-[10px] font-bold text-amber-300">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-extrabold text-base text-[#ededed]">{item.title}</h3>
                        <p className="text-xs text-[#888888] mt-1 leading-relaxed">{item.subtitle}</p>
                      </div>

                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                        <span className="font-mono font-extrabold text-base text-[#ededed]">
                          {item.priceRub} ₽
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenPurchase(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#789d2a] hover:bg-[#8bb730] text-black font-extrabold text-xs transition-colors cursor-pointer shadow-md shadow-[#789d2a]/20"
                        >
                          Купить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#1b1b1b] border border-white/[0.08] text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#283216] border border-[#789d2a]/40 flex items-center justify-center text-[#9ac43e] mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[#ededed]">Все рамки уже в вашем инвентаре!</h3>
                <p className="text-xs text-[#888888] max-w-md mx-auto">
                  Все доступные в каталоге рамки аватара уже есть на вашем аккаунте. Вы можете надеть и переключать их во вкладке «Профиль».
                </p>
                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onOpenProfile();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#283216] hover:bg-[#33411c] border border-[#789d2a] text-xs font-bold text-[#ededed] transition-colors cursor-pointer"
                  >
                    <span>Перейти в Профиль</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#9ac43e]" />
                  </button>
                )}
              </div>
            )
          ) : availableRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {availableRooms.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#1b1b1b] border border-white/[0.08] hover:border-white/20 transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div className="relative aspect-video w-full bg-[#121216] overflow-hidden">
                    <img
                      src={item.previewData.imageSrc}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    {item.badge && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 border border-white/10 text-[10px] font-bold text-amber-300 backdrop-blur-sm">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.previewData.accent }}
                        />
                        <h3 className="font-extrabold text-base text-[#ededed]">{item.title}</h3>
                      </div>
                      <p className="text-xs text-[#888888] mt-1 leading-relaxed">{item.subtitle}</p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <span className="font-mono font-extrabold text-base text-[#ededed]">
                        {item.priceRub} ₽
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenPurchase(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#789d2a] hover:bg-[#8bb730] text-black font-extrabold text-xs transition-colors cursor-pointer shadow-md shadow-[#789d2a]/20"
                      >
                        Купить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#1b1b1b] border border-white/[0.08] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#283216] border border-[#789d2a]/40 flex items-center justify-center text-[#9ac43e] mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-[#ededed]">Все локации комнат уже в вашем инвентаре!</h3>
              <p className="text-xs text-[#888888] max-w-md mx-auto">
                Все темы онлайн-комнат уже разблокированы на вашем аккаунте. Вы можете выбрать активную локацию в Профиле или прямо внутри Комнаты.
              </p>
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenProfile();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#283216] hover:bg-[#33411c] border border-[#789d2a] text-xs font-bold text-[#ededed] transition-colors cursor-pointer"
                >
                  <span>Перейти в Профиль</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9ac43e]" />
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: Sticky Bridge (Связка устройств) */}
      {(activeSection === 'all' || activeSection === 'sticky') && (
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#9ac43e]" />
                <h2 className="text-lg font-extrabold text-[#ededed]">Sticky Bridge: Увеличение устройств</h2>
              </div>
              <p className="text-xs text-[#888888] mt-0.5">
                Поштучное добавление постоянных слотов для ноутбуков, ПК и телефонов
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#1b1b1b] border border-white/[0.08] text-xs font-bold text-[#a8a8a8] flex items-center gap-2 self-start sm:self-auto">
              <span>Доступно сейчас:</span>
              <span className="text-[#9ac43e] font-mono font-extrabold">
                {userProfile.devices.length} / {maxDevices} устройств
              </span>
            </div>
          </div>

          {availableSticky.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {availableSticky.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#1b1b1b] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#283216] border border-[#789d2a]/40 flex items-center justify-center text-[#9ac43e]">
                        {item.id === 'devices_2' ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Laptop className="w-5 h-5" />
                        )}
                      </div>
                      {item.badge && (
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-[#ededed]">{item.title}</h3>
                    <p className="text-xs text-[#888888] leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                    <div>
                      <span className="font-mono font-extrabold text-lg text-[#ededed]">
                        {item.priceRub} ₽
                      </span>
                      <span className="text-[11px] text-[#777777] ml-1.5">/ навсегда</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPurchase(item)}
                      className="px-4 py-2 rounded-xl bg-[#789d2a] hover:bg-[#8bb730] text-black font-extrabold text-xs transition-colors cursor-pointer shadow-md shadow-[#789d2a]/20"
                    >
                      Добавить слот
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#1b1b1b] border border-white/[0.08] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#283216] border border-[#789d2a]/40 flex items-center justify-center text-[#9ac43e] mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-[#ededed]">Все доступные слоты Sticky Bridge уже добавлены!</h3>
              <p className="text-xs text-[#888888] max-w-md mx-auto">
                Все слоты для постоянной связки устройств уже активированы на вашем аккаунте.
              </p>
            </div>
          )}
        </section>
      )}

      {/* SECTION 3: Drop & Go Офлайн-буфер */}
      {(activeSection === 'all' || activeSection === 'drop') && (
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#9ac43e]" />
                <h2 className="text-lg font-extrabold text-[#ededed]">Drop & Go: Офлайн-буфер</h2>
              </div>
              <p className="text-xs text-[#888888] mt-0.5">
                Хранение файлов в зашифрованном облаке до 24 часов при выключенных устройствах
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#1b1b1b] border border-white/[0.08] text-xs font-bold text-[#a8a8a8] flex items-center gap-2 self-start sm:self-auto">
              <span>Текущий объём:</span>
              <span className="text-[#9ac43e] font-mono font-extrabold">
                {userProfile.s3QuotaLimitMb || (isPro ? 200 : 50)} МБ
              </span>
            </div>
          </div>

          {!hasDrop500 ? (
            <div className="grid grid-cols-1 gap-3.5">
              {dropItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[#1b1b1b] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#283216] border border-[#789d2a]/40 flex items-center justify-center text-[#9ac43e] shrink-0">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-base sm:text-lg text-[#ededed]">
                          {item.title}
                        </h3>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#888888] leading-relaxed max-w-xl">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                    <div>
                      <span className="font-mono font-extrabold text-xl text-[#ededed]">
                        {item.priceRub} ₽
                      </span>
                      <span className="text-xs text-[#777777] ml-1.5">/ навсегда</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPurchase(item)}
                      className="px-5 py-2.5 rounded-xl bg-[#789d2a] hover:bg-[#8bb730] text-black font-extrabold text-xs transition-colors cursor-pointer shadow-md shadow-[#789d2a]/20"
                    >
                      Расширить до 500 МБ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#1b1b1b] border border-white/[0.08] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#283216] border border-[#789d2a]/40 flex items-center justify-center text-[#9ac43e] mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-[#ededed]">Буфер 500 МБ уже подключен!</h3>
              <p className="text-xs text-[#888888] max-w-md mx-auto">
                Офлайн-буфер Drop & Go расширен до 500 МБ и привязан к вашему аккаунту навсегда.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Bottom info banner about Pro */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#202713] via-[#1a1c16] to-[#171717] border border-[#789d2a]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#283216] border border-[#789d2a]/40 flex items-center justify-center text-[#9ac43e] shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#ededed] text-base">
              Хотите всё и сразу в едином тарифе?
            </h4>
            <p className="text-xs text-[#a8a8a8] mt-0.5">
              В подписку <strong>Bridgik Pro</strong> входят все рамки, все локации комнат, до 8 участников в звонке и до 10 устройств.
            </p>
          </div>
        </div>
        {onOpenPricing && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenPricing();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#283216] hover:bg-[#33411c] border border-[#789d2a] text-[#ededed] font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <span>Посмотреть Тарифы</span>
            <ChevronRight className="w-4 h-4 text-[#9ac43e]" />
          </button>
        )}
      </div>

      {/* PURCHASE MODAL / SIMULATOR */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#1c1c1c] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#9ac43e]" />
                <h3 className="font-extrabold text-[#ededed] text-base">Оформление покупки</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {purchaseSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#283216] border-2 border-[#789d2a] flex items-center justify-center mx-auto text-[#bbf348] animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-lg text-[#ededed]">Успешно приобретено!</h4>
                  <p className="text-xs text-[#a8a8a8] max-w-xs mx-auto">
                    «{selectedItem.title}» теперь активирован на вашем аккаунте и сохранён на сервере.
                  </p>
                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedItem(null);
                        onOpenProfile?.();
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-[#283216] hover:bg-[#33411c] border border-[#789d2a] text-[#ededed] font-extrabold text-xs transition-colors cursor-pointer"
                    >
                      Перейти в Профиль
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedItem(null);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-[#789d2a] hover:bg-[#8bb730] text-black font-extrabold text-xs transition-colors cursor-pointer"
                    >
                      Продолжить в Каталоге
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Item Summary Card */}
                  <div className="p-3.5 rounded-xl bg-[#161616] border border-white/[0.06] flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#242424] flex items-center justify-center shrink-0">
                      {selectedItem.type === 'frame' ? (
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      ) : selectedItem.type === 'theme' ? (
                        <Sparkles className="w-6 h-6 text-sky-400" />
                      ) : selectedItem.type === 'devices' ? (
                        <Laptop className="w-6 h-6 text-[#9ac43e]" />
                      ) : (
                        <HardDrive className="w-6 h-6 text-[#9ac43e]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm text-[#ededed] truncate">
                        {selectedItem.title}
                      </h4>
                      <p className="text-xs text-[#888888] truncate mt-0.5">{selectedItem.subtitle}</p>
                    </div>
                    <span className="font-mono font-extrabold text-base text-[#ededed]">
                      {selectedItem.priceRub} ₽
                    </span>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#888888] uppercase tracking-wider">
                      Способ оплаты
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedPaymentMethod('sbp');
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          selectedPaymentMethod === 'sbp'
                            ? 'bg-[#283216] border-[#789d2a] text-[#ededed]'
                            : 'bg-[#181818] border-white/5 text-[#888888] hover:border-white/20'
                        }`}
                      >
                        <QrCode className="w-5 h-5 text-[#9ac43e]" />
                        <span className="text-[11px] font-bold">СБП</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedPaymentMethod('card');
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          selectedPaymentMethod === 'card'
                            ? 'bg-[#283216] border-[#789d2a] text-[#ededed]'
                            : 'bg-[#181818] border-white/5 text-[#888888] hover:border-white/20'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-sky-400" />
                        <span className="text-[11px] font-bold">Карта МИР</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedPaymentMethod('yoomoney');
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          selectedPaymentMethod === 'yoomoney'
                            ? 'bg-[#283216] border-[#789d2a] text-[#ededed]'
                            : 'bg-[#181818] border-white/5 text-[#888888] hover:border-white/20'
                        }`}
                      >
                        <Zap className="w-5 h-5 text-purple-400" />
                        <span className="text-[11px] font-bold">ЮMoney</span>
                      </button>
                    </div>
                  </div>

                  {/* Prototype Info Notice */}
                  <div className="p-3 rounded-xl bg-[#222222] border border-white/[0.08] flex items-start gap-2.5 text-xs text-[#a8a8a8]">
                    <ShieldCheck className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                    <span>
                      Прототип Каталога: покупка сразу привязывается к вашему аккаунту и сохраняется на сервере в реальном времени.
                    </span>
                  </div>

                  {purchaseError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                      {purchaseError}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    disabled={isPurchasing}
                    className="w-full py-3 rounded-xl bg-[#789d2a] hover:bg-[#8bb730] text-black font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#789d2a]/25 disabled:opacity-50"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Подтверждение...</span>
                      </>
                    ) : (
                      <span>Оплатить {selectedItem.priceRub} ₽</span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
