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
    a: 'В обычном P2P оба устройства должны быть онлайн одновременно. Если ваш домашний компьютер выключен, а вам нужно срочно скинуть на него файл или архив до 200 МБ — Pro-функция Drop & Go временно сохранит зашифрованный буфер в безопасном хранилище на 24 часа. Как только домашний ПК появится в сети, файл автоматически загрузится на него.',
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
      {/* Hero Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#ededed] mb-4 leading-tight">
          Простые и честные <span className="text-[#9ac43e]">тарифы</span>
        </h1>
        <p className="text-base sm:text-xl text-[#bbbbbb] leading-relaxed">
          Базовая передача любого объёма файлов напрямую между устройствами{' '}
          <strong className="text-white">всегда бесплатна и анонимна</strong>. Авторизация открывает связку личных устройств, а подписка Pro — расширенный комфорт.
        </p>
      </div>

      {/* 2 Main Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-10 max-w-4xl mx-auto">
        {/* Card 1: Free (Бесплатный) */}
        <div className="rounded-2xl bg-[#1c1c1c] border border-white/[0.09] p-6 sm:p-7 flex flex-col justify-between hover:border-white/[0.18] transition-all relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#262626] text-[#aaaaaa]">
                Бесплатный тариф
              </span>
              <span className="text-xs text-[#789d2a] font-mono font-bold">P2P DIRECT</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-1">
              Базовый
            </h3>
            <p className="text-xs sm:text-sm text-[#888888] mb-5">
              Для быстрой, безопасной и неограниченной передачи файлов напрямую
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#ededed]">0 ₽</span>
                <span className="text-xs text-[#888888]">/ навсегда</span>
              </div>
              <p className="text-xs text-[#789d2a] mt-1">Без скрытых условий и ограничений скорости</p>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-[#cccccc] mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Прямой P2P-канал:</strong> файлы передаются от браузера к браузеру без серверов хранения
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Без лимитов на размер:</strong> передавайте файлы и архивы 10 ГБ, 50 ГБ и более
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Сквозное шифрование DTLS/SRTP:</strong> трафик защищён алгоритмами AES
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Онлайн-комнаты до 4 участников:</strong> голосовая связь, чат со сгорающими сообщениями и Канвас
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Мгновенное подключение:</strong> по 4-значному PIN-коду или QR-коду
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#9ac43e] shrink-0 mt-0.5" />
                <span>
                  <strong>Работает гостем или с профилем:</strong> регистрация не обязательна
                </span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleStartTransfer}
            className="w-full py-3.5 px-4 rounded-xl bg-[#262626] hover:bg-[#323232] text-[#ededed] font-bold text-sm sm:text-base transition-colors cursor-pointer flex items-center justify-center gap-2 border border-white/[0.08]"
          >
            <span>Начать передачу</span>
            <ArrowRight className="w-4 h-4 text-[#9ac43e]" />
          </button>
        </div>

        {/* Card 2: Bridgik Pro */}
        <div className="rounded-2xl bg-[#1c1c1c] border-2 border-amber-400/50 p-6 sm:p-7 flex flex-col justify-between hover:border-amber-400/80 transition-all relative shadow-[0_0_30px_rgba(245,158,11,0.12)]">
          <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
            PRO ПОДПИСКА
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/30">
                Максимум
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold">ПОДПИСКА</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-1">
              Bridgik Pro
            </h3>
            <p className="text-xs sm:text-sm text-[#888888] mb-5">
              Для профессионалов, парка личных устройств и командной работы
            </p>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#ededed]">199 ₽</span>
                <span className="text-xs text-[#888888]">/ месяц</span>
              </div>
              <p className="text-xs text-amber-400/90 mt-1">
                Или 1 490 ₽ за год (всего 124 ₽/мес)
              </p>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-[#cccccc] mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Drop & Go (Офлайн-буфер до 200 МБ):</strong> отправка на выключенные устройства с хранением до 24 часов
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
                  <strong>Все темы комнат:</strong> Кибер-гостиная, Уютный лофт, Скайлайн-пентхаус, Ретро 98-го
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Расширенные комнаты:</strong> до 8 участников одновременно
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Все эксклюзивные рамки аватара:</strong> Gold, RGB-радуга и Plasma
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Приоритетный TURN-релей:</strong> гарантированный обход строгих файрволов
                </span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleProClick}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
              isPro
                ? 'bg-[#283618] text-[#c0e078] border border-[#789d2a]'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25'
            }`}
          >
            {isPro ? (
              <span>✓ Ваш Pro активен</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Оформить Bridgik Pro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile & Account Identity Banner */}
      <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-[#172014] via-[#1a1a1a] to-[#172014] border border-[#789d2a]/40 p-6 sm:p-7 shadow-xl relative overflow-hidden mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#789d2a]/20 border border-[#789d2a]/50 text-[#bbf348] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3" />
                <span>Аккаунт системы</span>
              </span>
              <span className="text-xs text-[#888888] font-mono">Бесплатно</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#ededed]">
              Личный профиль Bridgik
            </h3>
            <p className="text-sm text-[#aaaaaa] leading-relaxed">
              Создайте профиль в 1 клик через Яндекс ID: это сохранит ваш постоянный никнейм, аватарку и свяжет ваши устройства через <strong className="text-white">Sticky Bridge</strong>, чтобы мгновенно передавать файлы между своим ПК и телефоном без ручного ввода PIN-кода.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-[#888888]">
              <span className="flex items-center gap-1.5 text-[#bbf348]">
                <Check className="w-3.5 h-3.5" /> Вход в 1 клик через Яндекс ID
              </span>
              <span className="flex items-center gap-1.5 text-[#bbf348]">
                <Check className="w-3.5 h-3.5" /> Без паролей и смс
              </span>
              <span className="flex items-center gap-1.5 text-[#bbf348]">
                <Check className="w-3.5 h-3.5" /> Навсегда бесплатно
              </span>
            </div>
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

      {/* Feature Comparison Matrix */}
      <div className="mb-14 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-6 text-center">
          Сравнение возможностей
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#1a1a1a]">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#141414]">
                <th className="py-4 px-5 text-[#888888] font-mono uppercase text-xs">
                  Функция
                </th>
                <th className="py-4 px-4 text-[#9ac43e] font-bold text-center w-48">
                  Бесплатный тариф
                </th>
                <th className="py-4 px-4 text-amber-400 font-bold text-center w-48">
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
                <td className="py-3.5 px-4 text-center text-[#aaaaaa]">
                  100% скорости сети
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Хранение файлов на сервере (Zero-Storage)
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-[#9ac43e]">
                  0 байт
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-[#9ac43e]">
                  0 байт (+ офлайн-буфер)
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Личный профиль (Яндекс ID)
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-[#bbf348]">
                  Бесплатно в 1 клик
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-amber-300">
                  Включён
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Связанные устройства (Sticky Bridge)
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-[#ededed]">
                  До 2 устройств (с профилем)
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
                <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                  До 200 МБ
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Участников в онлайн-комнате
                </td>
                <td className="py-3.5 px-4 text-center text-[#aaaaaa]">До 4 мест</td>
                <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                  До 8 мест
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Рамки аватара и темы комнат
                </td>
                <td className="py-3.5 px-4 text-center text-[#aaaaaa]">
                  Базовая + Cyber Lounge
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                  Gold, RGB, Plasma + все 4 темы
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-[#ededed]">
                  Приоритетный TURN-релей
                </td>
                <td className="py-3.5 px-4 text-center text-[#888888]">Базовый</td>
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
