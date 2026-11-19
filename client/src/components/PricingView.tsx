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
} from 'lucide-react';
import { AuthProvider, UserProfile } from '../types/index.js';
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
    q: 'Почему прямая передача файлов любого размера бесплатна?',
    a: 'Bridgik использует протокол WebRTC P2P (Peer-to-Peer). Ваши файлы передаются напрямую из браузера одного устройства в браузер другого устройства, минуя серверы хранения. Так как сервер не хранит терабайты пользовательских файлов, у нас нет колоссальных расходов на облачные диски — поэтому базовая P2P-передача навсегда остаётся бесплатной и безлимитной.',
  },
  {
    q: 'Обязательно ли регистрироваться, чтобы перекинуть файл?',
    a: 'Нет! Регистрация или авторизация не требуются. Вы можете просто открыть bridgik.ru на обоих устройствах, ввести 4-значный PIN-код или отсканировать QR-код камерой — и файлы любого размера сразу начнут передаваться на максимальной скорости сети.',
  },
  {
    q: 'Что даёт бесплатная авторизация через Яндекс ID или Telegram?',
    a: 'Авторизация связывает ваши устройства в Sticky Bridge: например, ваш рабочий ноутбук и телефон запоминают друг друга. Открыв сайт на ноутбуке и телефоне, вы увидите их готовыми к отправке в 1 клик без постоянного ввода кодов. Также сохраняется ваш никнейм, персональный аватар и статус.',
  },
  {
    q: 'Что такое Drop & Go в тарифе Bridgik Pro?',
    a: 'В обычном P2P оба устройства должны быть онлайн одновременно. Если ваш домашний компьютер выключен, а вам нужно срочно скинуть на него 2 ГБ макетов с работы — Pro-функция Drop & Go временно сохранит зашифрованный буфер в безопасном хранилище на 24 часа. Как только домашний ПК появится в сети, файл автоматически загрузится на него.',
  },
  {
    q: 'Как оплатить подписку Bridgik Pro?',
    a: 'Оплата происходит через официальный российский эквайринг (ЮKassa / Банковские карты МИР, Visa, Mastercard РФ / СБП). Подписка активируется мгновенно сразу после успешного платежа и привязывается к вашему профилю.',
  },
];

export const PricingView: React.FC<PricingViewProps> = ({
  onBack: _onBack,
  onOpenAuth,
  onOpenProfile,
  onGoToBridge,
  userProfile,
}) => {
  const isPro = userProfile?.tier === 'pro';
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

  const handleProClick = () => {
    sound.playClick();
    if (isAuthed && onOpenProfile) {
      onOpenProfile('pro');
    } else if (onOpenAuth) {
      onOpenAuth('yandex');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Top Tag */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-mono text-[#9ac43e] font-bold px-3 py-1 rounded bg-[#1c2214] border border-[#789d2a]/40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#789d2a] animate-pulse" />
          <span>Тарифные планы · Bridgik P2P</span>
        </div>
        <span className="text-xs sm:text-sm font-mono text-[#888888]">
          Zero-Storage · Без скрытых подписок
        </span>
      </div>

      {/* Hero Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#ededed] mb-4 leading-tight">
          Простые и честные <span className="text-[#9ac43e]">тарифы</span>
        </h1>
        <p className="text-base sm:text-xl text-[#bbbbbb] leading-relaxed">
          Базовая передача любого объёма файлов напрямую между устройствами{' '}
          <strong className="text-white">всегда бесплатна и анонимна</strong>. Авторизация открывает память устройств, а подписка Pro — расширенный комфорт.
        </p>
      </div>

      {/* 3 Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {/* Card 1: Free (Без входа) */}
        <div className="rounded-2xl bg-[#1c1c1c] border border-white/[0.09] p-6 flex flex-col justify-between hover:border-white/[0.18] transition-all relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#262626] text-[#aaaaaa]">
                Без входа
              </span>
              <span className="text-xs text-[#789d2a] font-mono font-bold">P2P DIRECT</span>
            </div>

            <h3 className="text-2xl font-extrabold text-[#ededed] mb-1">
              Бесплатный гость
            </h3>
            <p className="text-xs text-[#888888] mb-5">
              Для быстрой разовой передачи файлов с любого устройства
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#ededed]">0 ₽</span>
                <span className="text-xs text-[#888888]">/ навсегда</span>
              </div>
              <p className="text-xs text-[#789d2a] mt-1">Регистрация не требуется</p>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-[#cccccc] mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Прямой P2P-канал:</strong> трафик идёт напрямую от браузера к браузеру
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Без лимитов на размер:</strong> отправляйте архивы 10 ГБ, 50 ГБ и более
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Максимальная скорость:</strong> без искусственных ограничений
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>0 байт на сервере:</strong> файлы не сохраняются в базах
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>Быстрый вход по 4-значному PIN или QR-коду</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>Онлайн-комната до 4 участников (чат, файлы, аудио, экран)</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleStartTransfer}
            className="w-full py-3 px-4 rounded-xl bg-[#262626] hover:bg-[#323232] text-[#ededed] font-bold text-sm sm:text-base transition-colors cursor-pointer flex items-center justify-center gap-2 border border-white/[0.08]"
          >
            <span>Начать передачу</span>
            <ArrowRight className="w-4 h-4 text-[#9ac43e]" />
          </button>
        </div>

        {/* Card 2: Bridgik ID (Авторизованный) */}
        <div className="rounded-2xl bg-[#1f2618] border-2 border-[#789d2a] p-6 flex flex-col justify-between shadow-[0_0_25px_rgba(120,157,42,0.18)] relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#789d2a] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
            Рекомендуется
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#283618] text-[#c0e078] border border-[#789d2a]/50">
                Bridgik ID
              </span>
              <span className="text-xs text-[#9ac43e] font-mono font-bold">БЕСПЛАТНО</span>
            </div>

            <h3 className="text-2xl font-extrabold text-[#ededed] mb-1">
              Профиль
            </h3>
            <p className="text-xs text-[#a8b890] mb-5">
              Для регулярной работы и связки ваших личных устройств
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#ededed]">0 ₽</span>
                <span className="text-xs text-[#a8b890]">/ навсегда</span>
              </div>
              <p className="text-xs text-[#bbf348] mt-1">
                Вход через Яндекс ID, Telegram или Ключ
              </p>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-[#e0eed0] mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#bbf348] shrink-0 mt-0.5" />
                <span>
                  <strong>Всё из Бесплатного тарифа</strong>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#bbf348] shrink-0 mt-0.5" />
                <span>
                  <strong>Sticky Bridge (до 2 устройств):</strong> привязка ПК и телефона — связь открывается сразу без ввода PIN
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#bbf348] shrink-0 mt-0.5" />
                <span>
                  <strong>Сохранение профиля:</strong> персональный никнейм, аватар и статус
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#bbf348] shrink-0 mt-0.5" />
                <span>
                  <strong>Тема Cyber Lounge</strong> для онлайн-комнаты
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#bbf348] shrink-0 mt-0.5" />
                <span>Вход в 1 клик без паролей и спама</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleAuthClick}
            className="w-full py-3 px-4 rounded-xl bg-[#789d2a] hover:bg-[#8bb532] text-white font-extrabold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#789d2a]/30"
          >
            {isAuthed ? (
              <>
                <span>Ваш текущий тариф</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Подключить профиль (0 ₽)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Card 3: Bridgik Pro */}
        <div className="rounded-2xl bg-[#1c1c1c] border border-amber-400/40 p-6 flex flex-col justify-between hover:border-amber-400/70 transition-all relative shadow-[0_0_20px_rgba(245,158,11,0.08)]">
          <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
            PRO
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/30">
                Максимум
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold">ПОДПИСКА</span>
            </div>

            <h3 className="text-2xl font-extrabold text-[#ededed] mb-1">
              Bridgik Pro
            </h3>
            <p className="text-xs text-[#888888] mb-5">
              Для профессионалов с парком устройств и команд
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#ededed]">199 ₽</span>
                <span className="text-xs text-[#888888]">/ месяц</span>
              </div>
              <p className="text-xs text-amber-400/90 mt-1">
                Или 1 490 ₽ за год (всего 124 ₽/мес)
              </p>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-[#cccccc] mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Всё из Профиля</strong>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sticky Bridge до 10 устройств:</strong> объедините все домашние ПК, макбуки, планшеты и смартфоны
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Drop & Go (Офлайн-буфер 5 ГБ):</strong> передача на выключенные устройства с хранением до 24 часов
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Все эксклюзивные рамки:</strong> Gold, RGB-радуга и Plasma
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Все темы комнат:</strong> Retro Room, Cozy Loft, Cyber Lounge
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Расширенная комната до 8 участников</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Приоритетный TURN-релей для обхода строгих файрволов</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleProClick}
            className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
              isPro
                ? 'bg-[#283618] text-[#c0e078] border border-[#789d2a]'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25'
            }`}
          >
            {isPro ? (
              <span>Ваш Pro активен</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Оформить Bridgik Pro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="mb-14">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-6 text-center">
          Сравнение возможностей
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#1a1a1a]">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#141414]">
                <th className="py-4 px-5 text-[#888888] font-mono uppercase text-xs">
                  Функция
                </th>
                <th className="py-4 px-4 text-[#ededed] font-bold text-center w-36">
                  Гость (Free)
                </th>
                <th className="py-4 px-4 text-[#9ac43e] font-bold text-center w-40 bg-[#1f2618]/50">
                  Профиль (0 ₽)
                </th>
                <th className="py-4 px-4 text-amber-400 font-bold text-center w-40">
                  Bridgik Pro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-[#cccccc]">
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Прямая передача P2P (WebRTC)
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Check className="w-4 h-4 text-[#9ac43e] mx-auto" />
                </td>
                <td className="py-3.5 px-4 text-center bg-[#1f2618]/30">
                  <Check className="w-4 h-4 text-[#9ac43e] mx-auto" />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Check className="w-4 h-4 text-[#9ac43e] mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Лимит размера файлов
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-[#9ac43e]">
                  Безлимитно
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-[#9ac43e] bg-[#1f2618]/30">
                  Безлимитно
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-[#9ac43e]">
                  Безлимитно
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Скорость передачи
                </td>
                <td className="py-3.5 px-4 text-center text-[#aaaaaa]">
                  100% скорости сети
                </td>
                <td className="py-3.5 px-4 text-center text-[#aaaaaa] bg-[#1f2618]/30">
                  100% скорости сети
                </td>
                <td className="py-3.5 px-4 text-center text-[#aaaaaa]">
                  100% скорости сети
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Хранение файлов на сервере
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-[#9ac43e]">
                  0 байт
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-[#9ac43e] bg-[#1f2618]/30">
                  0 байт
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-[#9ac43e]">
                  0 байт (+ 5 ГБ буфер)
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Обязательный вход / регистрация
                </td>
                <td className="py-3.5 px-4 text-center text-[#888888]">
                  Не нужен
                </td>
                <td className="py-3.5 px-4 text-center text-[#9ac43e] bg-[#1f2618]/30">
                  Яндекс ID / TG / Ключ
                </td>
                <td className="py-3.5 px-4 text-center text-[#9ac43e]">
                  Яндекс ID / TG / Ключ
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Связанные устройства (Sticky Bridge)
                </td>
                <td className="py-3.5 px-4 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#ededed] bg-[#1f2618]/30">
                  До 2 устройств
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                  До 10 устройств
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Drop & Go (Офлайн-доставка до 24 ч)
                </td>
                <td className="py-3.5 px-4 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-4 text-center text-[#666666] bg-[#1f2618]/30">—</td>
                <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                  До 5 ГБ
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Участников в онлайн-комнате
                </td>
                <td className="py-3.5 px-4 text-center text-[#aaaaaa]">До 4</td>
                <td className="py-3.5 px-4 text-center text-[#aaaaaa] bg-[#1f2618]/30">До 4</td>
                <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                  До 8 участников
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Рамки аватара и темы комнат
                </td>
                <td className="py-3.5 px-4 text-center text-[#666666]">—</td>
                <td className="py-3.5 px-4 text-center text-[#aaaaaa] bg-[#1f2618]/30">
                  Базовые темы
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                  Gold, RGB, Plasma + все темы
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Приоритетный TURN-релей
                </td>
                <td className="py-3.5 px-4 text-center text-[#888888]">Базовый</td>
                <td className="py-3.5 px-4 text-center text-[#888888] bg-[#1f2618]/30">Базовый</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#9ac43e]">
                  Приоритетный
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Zero Storage Architecture Banner */}
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
                className="rounded-xl bg-[#1c1c1c] border border-white/[0.08] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-[#ededed] hover:text-[#9ac43e] cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#9ac43e] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#888888] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[#aaaaaa] leading-relaxed border-t border-white/[0.05] pt-3">
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
