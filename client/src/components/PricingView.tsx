import React, { useState } from 'react';
import {
  Check,
  Shield,
  Sparkles,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  FolderDown,
  Mic,
  Zap,
} from 'lucide-react';
import { AuthProvider, UserProfile, UserTier } from '../types/index.js';
import { ProfileSectionTab } from './ProfileDropdown.js';
import { sound } from '../utils/sound.js';

interface PricingViewProps {
  onBack?: () => void;
  onOpenAuth?: (provider?: AuthProvider) => void;
  onOpenProfile?: (tab?: ProfileSectionTab) => void;
  onGoToBridge?: () => void;
  userProfile?: UserProfile | null;
}

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Чем отличаются тарифы Data Link, Live Hub и Overdrive?',
    a: 'Data Link создан для тех, кто активно пересылает файлы: он включает Turbo TURN-релей, отправку папок, докачку при обрыве и Drop Link до 2 ГБ. Live Hub — для голосовых созвонов в лаундже: расширенные комнаты на 8 мест, все темы и приватный замок на комнату. Overdrive объединяет оба тарифа со скидкой и открывает 10 слотов Sticky Bridge и VIP-рамки профиля.',
  },
  {
    q: 'Почему базовая передача файлов бесплатна и без лимитов?',
    a: 'Bridgik использует протокол WebRTC P2P (Peer-to-Peer). Файлы любого размера передаются напрямую из браузера одного устройства в браузер другого устройства, минуя серверы хранения. Так как сервер не хранит пользовательские терабайты, базовая передача всегда бесплатна и конфиденциальна.',
  },
  {
    q: 'Как работает оплата тарифов?',
    a: 'Оплата происходит помесячно (без навязанных годовых подписок) через официальный российский эквайринг: СБП (Система быстрых платежей), банковские карты МИР, Visa, Mastercard РФ. Подписка активируется мгновенно и привязывается к вашему профилю.',
  },
  {
    q: 'Что даёт персональный Drop Link (bridgik.ru/@ник)?',
    a: 'Это ваш личный инбокс: любой человек (даже без аккаунта в Bridgik) может открыть вашу ссылку и отправить вам файл. На тарифе Data Link и Overdrive объём входящего файла расширен до 2 ГБ с хранением в S3 до 48 часов, а уведомление о файле появится в вашем колокольчике.',
  },
  {
    q: 'Обязательно ли регистрироваться для использования сервиса?',
    a: 'Нет! Регистрация или авторизация не требуются. Вы можете просто открыть bridgik.ru, ввести 4-значный PIN-код или отсканировать QR-код — и файлы сразу начнут передаваться на максимальной скорости.',
  },
];

export const PricingView: React.FC<PricingViewProps> = ({
  onBack: _onBack,
  onOpenAuth,
  onOpenProfile,
  onGoToBridge,
  userProfile,
}) => {
  const currentTier: UserTier = userProfile?.tier || 'free';
  const isAuthed = Boolean(userProfile);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    sound.playClick();
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  const handleStartTransfer = () => {
    sound.playClick();
    if (onGoToBridge) {
      onGoToBridge();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthClick = () => {
    sound.playClick();
    if (isAuthed && onOpenProfile) {
      onOpenProfile('appearance');
    } else if (onOpenAuth) {
      onOpenAuth('yandex');
    }
  };

  const handleSelectPlan = (planId: 'data-link' | 'live-hub' | 'overdrive') => {
    sound.playClick();
    if (typeof window !== 'undefined') {
      localStorage.setItem('bridgik_selected_plan', planId);
    }
    if (isAuthed && onOpenProfile) {
      onOpenProfile('pro');
    } else if (onOpenAuth) {
      onOpenAuth('yandex');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#ededed] mb-4 leading-tight">
          Простые и честные <span className="text-[#9ac43e]">тарифы</span>
        </h1>
        <p className="text-base sm:text-xl text-[#bbbbbb] leading-relaxed">
          Базовая P2P-передача любого объёма файлов <strong className="text-white">навсегда бесплатна</strong>.
          Выберите тариф под свои задачи: только файлы, только аудио-лаундж или максимальное комбо.
        </p>
      </div>

      {/* Free Base Banner */}
      <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-[#1c1c1c] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#262626] text-[#bbf348] border border-[#789d2a]/30">
              Базовый P2P
            </span>
            <span className="text-xs text-[#888888] font-mono">0 ₽ / навсегда</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#ededed]">
            Бесплатная прямая передача без ограничений скорости
          </h3>
          <p className="text-xs sm:text-sm text-[#aaaaaa]">
            Файлы любого размера (10 ГБ, 50 ГБ+) передаются напрямую от браузера к браузеру без регистрации и без хранения на серверах.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartTransfer}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-[#262626] hover:bg-[#323232] text-[#ededed] font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 border border-white/[0.08]"
        >
          <span>Передать файл</span>
          <ArrowRight className="w-4 h-4 text-[#9ac43e]" />
        </button>
      </div>

      {/* 3 Main Paid Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 mb-14">
        {/* Plan 1: Data Link (Files & Bridge) */}
        <div className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
          currentTier === 'data-link'
            ? 'bg-[#182014] border-2 border-[#789d2a] shadow-[0_0_30px_rgba(120,157,42,0.2)]'
            : 'bg-[#1c1c1c] border border-white/[0.09] hover:border-[#789d2a]/50'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#283216] text-[#bbf348] border border-[#789d2a]/40 flex items-center gap-1.5">
                <FolderDown className="w-3.5 h-3.5" />
                <span>ФАЙЛЫ & МОСТ</span>
              </span>
              <span className="text-xs text-[#888888] font-mono">P2P TURBO</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-1">
              Data Link
            </h3>
            <p className="text-xs sm:text-sm text-[#888888] mb-5">
              Для тех, кто активно пересылает архивы, папки и тяжёлые рабочие файлы
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#ededed]">199 ₽</span>
                <span className="text-xs text-[#888888]">/ месяц</span>
              </div>
              <p className="text-xs text-[#9ac43e] mt-1">Оплата помесячно, отмена в 1 клик</p>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-[#cccccc] mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Выделенный Turbo TURN:</strong> обход любых строгих NAT и мобильных сетей
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Передача целых папок:</strong> сохранение дерева каталогов
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Докачка (Resume):</strong> продолжение передачи при сбоях связи
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Drop Link (bridgik.ru/@ник):</strong> до 2 ГБ на входящий файл, хранение до 48 часов
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Скачивание в ZIP:</strong> все файлы из моста архивом в 1 клик
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>До 6 устройств</strong> в одном P2P-мосту одновременно
                </span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPlan('data-link')}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              currentTier === 'data-link'
                ? 'bg-[#283618] text-[#c0e078] border-[#789d2a]'
                : 'bg-[#262626] hover:bg-[#303822] text-[#ededed] hover:text-[#bbf348] border-white/10 hover:border-[#789d2a]/50'
            }`}
          >
            {currentTier === 'data-link' ? (
              <span>✓ Ваш текущий тариф</span>
            ) : (
              <>
                <span>Выбрать Data Link</span>
                <ArrowRight className="w-4 h-4 text-[#9ac43e]" />
              </>
            )}
          </button>
        </div>

        {/* Plan 2: Live Hub (Voice & Rooms) */}
        <div className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
          currentTier === 'live-hub'
            ? 'bg-[#181824] border-2 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]'
            : 'bg-[#1c1c1c] border border-white/[0.09] hover:border-indigo-400/50'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#222138] text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" />
                <span>ГОЛОС & КОМНАТЫ</span>
              </span>
              <span className="text-xs text-indigo-400 font-mono font-bold">LOUNGE</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-1">
              Live Hub
            </h3>
            <p className="text-xs sm:text-sm text-[#888888] mb-5">
              Для компаний, друзей и коллег: уютный голосовой лаундж и музыка
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#ededed]">199 ₽</span>
                <span className="text-xs text-[#888888]">/ месяц</span>
              </div>
              <p className="text-xs text-indigo-300 mt-1">Оплата помесячно, отмена в 1 клик</p>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-[#cccccc] mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Все 8 мест в комнате:</strong> комфортные диваны и кресла
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Все 4 темы комнат:</strong> Кибер-гостиная, Уютный лофт, Пентхаус, Ретро
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Закрытие комнаты (Замок):</strong> защита встречи от посторонних
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Безлимитные созвоны:</strong> общайтесь сколько угодно без тайм-аутов
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Совместный плеер:</strong> включение музыки в комнате для всех
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Шумоподавление:</strong> чистый звук без эха и лишних шумов
                </span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPlan('live-hub')}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              currentTier === 'live-hub'
                ? 'bg-[#222138] text-indigo-200 border-indigo-400'
                : 'bg-[#262626] hover:bg-[#252538] text-[#ededed] hover:text-indigo-300 border-white/10 hover:border-indigo-400/50'
            }`}
          >
            {currentTier === 'live-hub' ? (
              <span>✓ Ваш текущий тариф</span>
            ) : (
              <>
                <span>Выбрать Live Hub</span>
                <ArrowRight className="w-4 h-4 text-indigo-400" />
              </>
            )}
          </button>
        </div>

        {/* Plan 3: Overdrive (Combo / All-in-One) */}
        <div className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all relative border-2 ${
          currentTier === 'overdrive' || currentTier === 'pro'
            ? 'bg-[#201d14] border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.25)]'
            : 'bg-[#1c1c1c] border-amber-400/60 hover:border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.12)]'
        }`}>
          <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
            ВЫГОДНО · ВСЁ ВКЛЮЧЕНО
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>КОМБО ПАКЕТ</span>
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold">ALL-IN-ONE</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-1">
              Overdrive
            </h3>
            <p className="text-xs sm:text-sm text-[#888888] mb-5">
              Максимум возможностей: 100% фич Data Link + 100% фич Live Hub + VIP-статус
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#ededed]">299 ₽</span>
                <span className="text-xs text-[#888888]">/ месяц</span>
              </div>
              <p className="text-xs text-amber-300 mt-1">Экономия 99 ₽ каждый месяц</p>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-[#cccccc] mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>100% возможностей Data Link:</strong> Turbo TURN, папки, докачка, Drop Link 2 ГБ
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>100% возможностей Live Hub:</strong> 8 мест, все 4 темы, замок на комнату, плеер
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sticky Bridge до 10 устройств:</strong> объедините все личные ПК и смартфоны
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Все VIP-рамки аватара:</strong> Gold, RGB-радуга и Plasma
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Все 8-bit эмодзи:</strong> эксклюзивные реакции и статус OVERDRIVE
                </span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPlan('overdrive')}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
              currentTier === 'overdrive' || currentTier === 'pro'
                ? 'bg-[#283618] text-[#c0e078] border border-[#789d2a]'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25'
            }`}
          >
            {currentTier === 'overdrive' || currentTier === 'pro' ? (
              <span>✓ Ваш Overdrive активен</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Выбрать Overdrive</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="mb-14 max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-6 text-center">
          Сравнение всех возможностей
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#1a1a1a]">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#141414]">
                <th className="py-4 px-5 text-[#888888] font-mono uppercase text-xs">
                  Возможность
                </th>
                <th className="py-4 px-3 text-[#aaaaaa] font-bold text-center w-36">
                  Бесплатный
                </th>
                <th className="py-4 px-3 text-[#9ac43e] font-bold text-center w-36">
                  Data Link (199 ₽)
                </th>
                <th className="py-4 px-3 text-indigo-300 font-bold text-center w-36">
                  Live Hub (199 ₽)
                </th>
                <th className="py-4 px-3 text-amber-400 font-bold text-center w-40">
                  Overdrive (299 ₽)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-[#cccccc]">
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Прямая передача файлов P2P (WebRTC)
                </td>
                <td className="py-3.5 px-3 text-center"><Check className="w-4 h-4 text-[#9ac43e] mx-auto" /></td>
                <td className="py-3.5 px-3 text-center"><Check className="w-4 h-4 text-[#9ac43e] mx-auto" /></td>
                <td className="py-3.5 px-3 text-center"><Check className="w-4 h-4 text-[#9ac43e] mx-auto" /></td>
                <td className="py-3.5 px-3 text-center"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Лимит размера файлов в прямом P2P
                </td>
                <td className="py-3.5 px-3 text-center font-bold text-[#9ac43e]">Безлимитно</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#9ac43e]">Безлимитно</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#9ac43e]">Безлимитно</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">Безлимитно</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Выделенный Turbo TURN-релей
                </td>
                <td className="py-3.5 px-3 text-center text-[#666666]">Базовый</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#9ac43e]">⚡ Turbo</td>
                <td className="py-3.5 px-3 text-center text-[#666666]">Базовый</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">⚡ Turbo</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Передача папок с деревом каталогов
                </td>
                <td className="py-3.5 px-3 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#9ac43e]">✓ Включено</td>
                <td className="py-3.5 px-3 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">✓ Включено</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Докачка (Resume) при обрыве связи
                </td>
                <td className="py-3.5 px-3 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#9ac43e]">✓ Включено</td>
                <td className="py-3.5 px-3 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">✓ Включено</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Drop Link (bridgik.ru/@ник)
                </td>
                <td className="py-3.5 px-3 text-center text-[#aaaaaa]">До 150 МБ (24 ч)</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#9ac43e]">До 2 ГБ (48 ч)</td>
                <td className="py-3.5 px-3 text-center text-[#aaaaaa]">До 150 МБ (24 ч)</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">До 2 ГБ (48 ч)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Пакетное скачивание файлов в ZIP
                </td>
                <td className="py-3.5 px-3 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#9ac43e]">✓ В 1 клик</td>
                <td className="py-3.5 px-3 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">✓ В 1 клик</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Мест в голосовой комнате (диваны/кресла)
                </td>
                <td className="py-3.5 px-3 text-center text-[#aaaaaa]">До 4 мест</td>
                <td className="py-3.5 px-3 text-center text-[#aaaaaa]">До 4 мест</td>
                <td className="py-3.5 px-3 text-center font-bold text-indigo-300">До 8 мест</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">До 8 мест</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Локации и темы комнат
                </td>
                <td className="py-3.5 px-3 text-center text-[#aaaaaa]">Кибер-гостиная</td>
                <td className="py-3.5 px-3 text-center text-[#aaaaaa]">Кибер-гостиная</td>
                <td className="py-3.5 px-3 text-center font-bold text-indigo-300">Все 4 локации</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">Все 4 локации</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Закрытие комнаты (Замок от посторонних)
                </td>
                <td className="py-3.5 px-3 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-3 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-3 text-center font-bold text-indigo-300">✓ Включено</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">✓ Включено</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Совместный плеер музыки
                </td>
                <td className="py-3.5 px-3 text-center text-[#aaaaaa]">Базовый</td>
                <td className="py-3.5 px-3 text-center text-[#aaaaaa]">Базовый</td>
                <td className="py-3.5 px-3 text-center font-bold text-indigo-300">✓ Без ограничений</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">✓ Без ограничений</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Связка своих устройств (Sticky Bridge)
                </td>
                <td className="py-3.5 px-3 text-center text-[#aaaaaa]">До 2 устройств</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#ededed]">До 6 устройств</td>
                <td className="py-3.5 px-3 text-center text-[#aaaaaa]">До 2 устройств</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">До 10 устройств</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  VIP-рамки аватара и 8-bit эмодзи
                </td>
                <td className="py-3.5 px-3 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-3 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-3 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-400">Gold, RGB, Plasma</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Identity Banner */}
      <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-[#172014] via-[#1a1a1a] to-[#172014] border border-[#789d2a]/40 p-6 sm:p-7 shadow-xl relative overflow-hidden mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#789d2a]/20 border border-[#789d2a]/50 text-[#bbf348] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3" />
                <span>Личный аккаунт</span>
              </span>
              <span className="text-xs text-[#888888] font-mono">Бесплатно</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#ededed]">
              Профиль Bridgik для связки устройств
            </h3>
            <p className="text-sm text-[#aaaaaa] leading-relaxed">
              Вход через Яндекс ID сохраняет ваш постоянный никнейм, аватарку и связывает домашний ПК и телефон через <strong className="text-white">Sticky Bridge</strong> для передачи файлов в 1 клик.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {isAuthed ? (
              <div className="flex flex-col sm:flex-row md:flex-col gap-2">
                <div className="px-4 py-2.5 rounded-xl bg-[#1f2916] border border-[#789d2a]/50 text-xs font-mono text-[#bbf348] flex items-center gap-2.5 shadow-sm">
                  {userProfile?.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.displayName}
                      className="w-5 h-5 rounded-full object-cover border border-[#789d2a]"
                    />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#789d2a] animate-pulse" />
                  )}
                  <span className="truncate max-w-[160px]">
                    {userProfile?.displayName || 'Профиль активен'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenProfile?.('appearance')}
                  className="py-2.5 px-4 rounded-xl bg-[#262626] hover:bg-[#323232] text-[#ededed] text-xs sm:text-sm font-bold border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Настройки профиля</span>
                  <ChevronRight className="w-4 h-4 text-[#9ac43e]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAuthClick}
                className="w-full md:w-auto py-3 px-5 rounded-xl bg-[#789d2a] hover:bg-[#8bb532] text-white font-extrabold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#789d2a]/30"
              >
                <span>Войти через Яндекс ID</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Zero Storage Security Banner */}
      <div className="mb-14 p-5 sm:p-6 rounded-2xl bg-[#1c2214] border border-[#789d2a]/50 text-[#d4e8a8] flex items-start gap-4 shadow-sm">
        <Shield className="w-7 h-7 text-[#9ac43e] shrink-0 mt-1" />
        <div className="space-y-1.5 leading-relaxed">
          <h3 className="font-extrabold text-white text-lg sm:text-xl">
            Главный принцип безопасности: Zero-Storage
          </h3>
          <p className="text-sm text-[#bbbbbb]">
            На любых тарифах ваши файлы и переписка передаются в зашифрованном виде (End-to-End DTLS/SRTP) напрямую от браузера к браузеру. Мы не собираем и не продаём ваши данные, а сервер выступает лишь временным маяком для установки соединения. Сервис полностью соответствует требованиям 152-ФЗ.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-2 mb-6">
          <HelpCircle className="w-6 h-6 text-[#9ac43e]" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] text-center">
            Часто задаваемые вопросы
          </h2>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/[0.08] bg-[#181818] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left font-bold text-sm sm:text-base text-[#ededed] hover:text-[#bbf348] flex items-center justify-between gap-4 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#9ac43e] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#777777] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-[#aaaaaa] leading-relaxed border-t border-white/[0.04] pt-3 animate-in fade-in duration-150">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
