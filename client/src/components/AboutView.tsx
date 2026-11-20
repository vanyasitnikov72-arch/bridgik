import React from 'react';
import {
  ShieldCheck,
  HardDrive,
  Wifi,
  ExternalLink,
  FolderUp,
  Zap,
  Users,
  RotateCcw,
  Inbox,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { BridgeIcon } from './icons/BridgeIcon.js';

interface AboutViewProps {
  onBack?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack: _onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Header */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#ededed] mb-3 leading-tight">
          О сервисе <span className="text-[#9ac43e]">bridgik</span>
        </h1>
        <p className="text-xl sm:text-2xl text-[#bbbbbb] leading-relaxed">
          Мгновенный P2P-мост для передачи файлов любого размера, папок и текста между устройствами, конфиденциальные голосовые комнаты и персональный инбокс Drop Link. Ноль серверов, облаков и сохранения ваших данных.
        </p>
      </div>

      {/* Zero-Storage Notice Callout */}
      <div className="mb-10 p-5 sm:p-6 rounded-xl bg-[#1c2214] border border-[#789d2a]/50 text-[#9ac43e] text-lg sm:text-xl flex items-start gap-4 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-[#789d2a]/20 border border-[#789d2a] flex items-center justify-center shrink-0 mt-0.5 text-[#9ac43e] font-bold">
          ⓘ
        </div>
        <div className="space-y-1.5 leading-relaxed text-[#d4e8a8]">
          <p className="font-bold text-white text-xl">
            Главный манифест: Zero-Storage (0 байт на сервере)
          </p>
          <p className="text-[#bbbbbb]">
            Ваши файлы, сообщения и аудиопотоки передаются напрямую между браузерами с E2E-шифрованием (DTLS/SRTP). Сервер используется исключительно как маяк сигналов (WebRTC Handshake) и ничего не сохраняет. Для отложенной отправки Drop Link применяется изолированный шифрованный буфер с обязательным автоудалением через 24 часа.
          </p>
        </div>
      </div>

      {/* Two Modes Section: Мост & Комната */}
      <div className="mb-12 space-y-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#ededed] mb-1">
            Два ключевых режима: <span className="text-[#9ac43e]">«Мост»</span> и <span className="text-[#9ac43e]">«Комната»</span>
          </h2>
          <p className="text-lg sm:text-xl text-[#bbbbbb] leading-relaxed">
            В bridgik строго разделены два принципиально разных сценария, чтобы интерфейс оставался чистым и сфокусированным:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Mode 1: Мост */}
          <div className="bg-[#202020] border-2 border-[#789d2a]/50 rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#1c2214] border border-[#789d2a] flex items-center justify-center text-[#9ac43e] shrink-0">
                  <BridgeIcon className="w-6 h-6 text-[#9ac43e]" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">Режим «Мост»</h3>
                  <p className="text-sm font-semibold text-[#9ac43e]">Экспресс-передача телефон ↔ компьютер</p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-[#cccccc] leading-relaxed mb-4">
                Специально для ситуаций, когда нужно быстро скинуть скриншот, архив, видео или папку со смартфона на ПК (или между двумя компьютерами). Ноль лишних кнопок — только файлы и максимальная скорость.
              </p>

              <ul className="space-y-2.5 text-base sm:text-lg text-[#bbbbbb]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Локальный Wi-Fi Радар:</strong> устройства в одной сети видны на стартовом экране и передают данные в 1 клик.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Direct-to-Disk (10–50+ ГБ):</strong> потоковая запись сразу на SSD/HDD без перегрузки оперативной памяти браузера.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Глобальный Ctrl + V:</strong> моментальная отправка файла или скриншота из буфера в любом месте экрана.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Выделенный Turbo TURN:</strong> обход любых строгих корпоративных NAT и мобильных сетей 4G/5G.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Докачка (Resume):</strong> продолжение передачи файла с прерванного места при сбоях связи.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Скачивание в ZIP в 1 клик:</strong> все полученные файлы сохраняются одним архивом без ручного клика по каждому.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-3.5 border-t border-[#333333] flex items-center justify-between text-xs sm:text-sm font-mono text-[#999999]">
              <span className="text-[#9ac43e]">Фокус: файлы, папки и буфер</span>
              <span>Без звонков и отвлечений</span>
            </div>
          </div>

          {/* Mode 2: Комната */}
          <div className="bg-[#202020] border-2 border-[#3a3a3a] hover:border-[#789d2a]/50 rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-md transition-colors">
            <div>
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#1c2214] border border-[#789d2a] flex items-center justify-center text-[#9ac43e] shrink-0">
                  <Users className="w-6 h-6 text-[#9ac43e]" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">Режим «Комната»</h3>
                  <p className="text-sm font-semibold text-[#9ac43e]">P2P GhostRoom / Конфиденциальная переговорная</p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-[#cccccc] leading-relaxed mb-4">
                Изолированное эфемерное пространство для приватного голосового созвона с клиентом, коллегой или другом. Никаких аккаунтов, установки приложений, серверных записей или логов.
              </p>

              <ul className="space-y-2.5 text-base sm:text-lg text-[#bbbbbb]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Только чистый голос (Opus):</strong> кристальный P2P звук без задержек и без серверного сжатия. Без видеокамер — полная конфиденциальность.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Интерактивный Канвас (Canvas):</strong> совместный черновик заметок и планов с моментальной синхронизацией по DataChannel и скачиванием в Markdown.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>P2P-обмен файлами на лету:</strong> отправка фото, документов и архивов прямо во время разговора.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Сгорающий чат:</strong> сообщения хранятся только в оперативной памяти браузера и стираются при закрытии вкладки.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Panic Button:</strong> мгновенное экстренное уничтожение комнаты и разрыв всех P2P-сессий.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-3.5 border-t border-[#333333] flex items-center justify-between text-xs sm:text-sm font-mono text-[#999999]">
              <span className="text-[#9ac43e]">Фокус: голос, канвас и приватность</span>
              <span>Без видео и без серверных логов</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Major Features Grid: Drop Link, Sticky Bridge, Turbo & Resume */}
      <div className="mb-12 space-y-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#ededed] mb-1">
            Новые возможности <span className="text-[#9ac43e]">экосистемы</span>
          </h2>
          <p className="text-lg sm:text-xl text-[#bbbbbb] leading-relaxed">
            Полноценный набор инструментов для максимальной надёжности и удобства работы:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Feature 1: Drop Link */}
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-7 hover:border-[#789d2a]/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#252525] border border-white/10 flex items-center justify-center text-[#9ac43e] shrink-0">
                  <Inbox className="w-6 h-6 text-[#9ac43e]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Входящий Drop Link</h3>
                  <p className="text-sm font-semibold text-[#9ac43e]">Приём файлов без онлайна (до 1 ГБ, 24 ч)</p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-[#cccccc] leading-relaxed mb-4">
                Персональная постоянная ссылка (<code>bridgik.ru/drop/username</code>), по которой любой человек может отправить вам файлы до 1 ГБ, даже когда ваш компьютер выключен. Файлы шифруются и автоматически удаляются через 24 часа.
              </p>
              <ul className="space-y-2 text-base text-[#bbbbbb]">
                <li className="flex items-start gap-2">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span>Отправителю не нужен аккаунт или приложение.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span>Вы получаете уведомление и забираете файлы в удобное время.</span>
                </li>
              </ul>
            </div>
            <div className="mt-5 pt-3 border-t border-[#333333] text-xs font-mono text-[#888888]">
              Доступно на тарифах Data Link и Overdrive
            </div>
          </div>

          {/* Feature 2: Sticky Bridge */}
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-7 hover:border-[#789d2a]/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#252525] border border-white/10 flex items-center justify-center text-[#9ac43e] shrink-0">
                  <Laptop className="w-6 h-6 text-[#9ac43e]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Sticky Bridge</h3>
                  <p className="text-sm font-semibold text-[#9ac43e]">Сеть доверенных устройств (до 10 девайсов)</p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-[#cccccc] leading-relaxed mb-4">
                Свяжите рабочий ПК, домашний ноутбук и телефон в единую доверенную сеть через Яндекс ID или анонимный Ключ. Все ваши устройства видят статус друг друга и передают файлы без сканирования QR-кодов.
              </p>
              <ul className="space-y-2 text-base text-[#bbbbbb]">
                <li className="flex items-start gap-2">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span>Автоприём файлов между своими устройствами в 1 клик.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span>Поддержка до 10 устройств на тарифе Overdrive.</span>
                </li>
              </ul>
            </div>
            <div className="mt-5 pt-3 border-t border-[#333333] text-xs font-mono text-[#888888]">
              Быстрый вход через Яндекс ID или Ключ доступа
            </div>
          </div>

          {/* Feature 3: Turbo TURN Relay */}
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-7 hover:border-[#789d2a]/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#252525] border border-white/10 flex items-center justify-center text-[#9ac43e] shrink-0">
                  <Zap className="w-6 h-6 text-[#9ac43e]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Выделенный Turbo TURN</h3>
                  <p className="text-sm font-semibold text-[#9ac43e]">100% обход строгих NAT и сотовых операторов</p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-[#cccccc] leading-relaxed mb-4">
                Обычный P2P блокируется сотовыми сетями (4G/5G) и строгими корпоративными брандмауэрами. Собственный выделенный Turbo TURN реле-сервер bridgik мгновенно пробивает любые ограничения со сквозным шифрованием.
              </p>
              <ul className="space-y-2 text-base text-[#bbbbbb]">
                <li className="flex items-start gap-2">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span>Соединение устанавливается всегда, даже через мобильный интернет.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span>Шифрование данных сохраняется — сервер реле не имеет ключей расшифровки.</span>
                </li>
              </ul>
            </div>
            <div className="mt-5 pt-3 border-t border-[#333333] text-xs font-mono text-[#888888]">
              Включено в Data Link, Live Hub и Overdrive
            </div>
          </div>

          {/* Feature 4: Resume & ZIP Archive */}
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-7 hover:border-[#789d2a]/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#252525] border border-white/10 flex items-center justify-center text-[#9ac43e] shrink-0">
                  <RotateCcw className="w-6 h-6 text-[#9ac43e]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Докачка (Resume) и ZIP</h3>
                  <p className="text-sm font-semibold text-[#9ac43e]">Защита от сбоев и скачивание в 1 клик</p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-[#cccccc] leading-relaxed mb-4">
                Передаёте файл на 20 ГБ и прервался Wi-Fi? Механизм чанковой докачки (Chunk-level Resume) подхватит передачу точно с момента обрыва без необходимости слать гигабайты заново.
              </p>
              <ul className="space-y-2 text-base text-[#bbbbbb]">
                <li className="flex items-start gap-2">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span>Автоматическая докачка при переключении сетей или закрытии крышки.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span>Кнопка «ZIP-архив»: сохранение десятков переданных файлов одним архивом.</span>
                </li>
              </ul>
            </div>
            <div className="mt-5 pt-3 border-t border-[#333333] text-xs font-mono text-[#888888]">
              Файловый комфорт на профессиональном уровне
            </div>
          </div>
        </div>
      </div>

      {/* Tariffs Overview Section */}
      <div className="mb-12 space-y-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#ededed] mb-1">
            Честные и прозрачные <span className="text-[#9ac43e]">тарифы</span>
          </h2>
          <p className="text-lg sm:text-xl text-[#bbbbbb] leading-relaxed">
            Базовый P2P всегда остаётся бесплатным. Для тех, кому нужна максимальная надёжность и постоянный инбокс:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Plan: Free */}
          <div className="p-5 rounded-xl bg-[#1b1b1b] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#888888] font-bold">Базовый</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[#888888]">Навсегда</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-1">Free</h3>
              <p className="text-2xl font-black text-[#ededed] mb-3">0 ₽</p>
              <ul className="space-y-2 text-xs sm:text-sm text-[#aaaaaa]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9ac43e] shrink-0" />
                  <span>Прямой P2P любого размера</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9ac43e] shrink-0" />
                  <span>Локальный Wi-Fi радар</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9ac43e] shrink-0" />
                  <span>P2P голос и Канвас</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9ac43e] shrink-0" />
                  <span>2 устройства Sticky Bridge</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Plan: Data Link */}
          <div className="p-5 rounded-xl bg-[#1d232a] border border-[#229ED9]/40 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#229ED9] font-bold">Файлы</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#229ED9]/15 text-[#229ED9]">Хит</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-1">Data Link</h3>
              <p className="text-2xl font-black text-[#ededed] mb-3">149 ₽<span className="text-xs font-normal text-[#888888]"> / мес</span></p>
              <ul className="space-y-2 text-xs sm:text-sm text-[#bbbbbb]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#229ED9] shrink-0" />
                  <span>Выделенный Turbo TURN</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#229ED9] shrink-0" />
                  <span>Докачка файлов (Resume)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#229ED9] shrink-0" />
                  <span>Скачивание в ZIP в 1 клик</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#229ED9] shrink-0" />
                  <span>Drop Link до 1 ГБ (24 ч)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#229ED9] shrink-0" />
                  <span>До 6 устройств Sticky Bridge</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Plan: Live Hub */}
          <div className="p-5 rounded-xl bg-[#19241b] border border-[#789d2a]/40 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#9ac43e] font-bold">Комнаты</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#789d2a]/15 text-[#9ac43e]">Голос</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-1">Live Hub</h3>
              <p className="text-2xl font-black text-[#ededed] mb-3">199 ₽<span className="text-xs font-normal text-[#888888]"> / мес</span></p>
              <ul className="space-y-2 text-xs sm:text-sm text-[#bbbbbb]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9ac43e] shrink-0" />
                  <span>Постоянные ссылки на комнаты</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9ac43e] shrink-0" />
                  <span>Приоритетный WebRTC TURN</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9ac43e] shrink-0" />
                  <span>Расширенный Канвас заметок</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9ac43e] shrink-0" />
                  <span>Кастомные темы переговорных</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9ac43e] shrink-0" />
                  <span>До 6 устройств Sticky Bridge</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Plan: Overdrive */}
          <div className="p-5 rounded-xl bg-[#231e13] border border-[#f59e0b]/50 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#f59e0b] font-bold">Максимум</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-extrabold">Всё включено</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-1">Overdrive</h3>
              <p className="text-2xl font-black text-[#ededed] mb-3">249 ₽<span className="text-xs font-normal text-[#888888]"> / мес</span></p>
              <ul className="space-y-2 text-xs sm:text-sm text-[#bbbbbb]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                  <span><strong>Всё из Data Link + Live Hub</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                  <span>Turbo TURN + Докачка + ZIP</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                  <span>Drop Link до 1 ГБ (24 ч)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                  <span>До 10 устройств Sticky Bridge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                  <span>Все рамки и темы оформления</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Architecture Cards */}
      <div className="space-y-6 mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#ededed] mb-1">
          Технологический фундамент
        </h2>

        {/* Card 1: WebRTC DataChannel */}
        <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                Прямое P2P-соединение (WebRTC DataChannel)
              </h2>
              <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                Браузер ↔ Браузер на максимальной скорости вашей сети
              </p>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed mb-4">
            В отличие от традиционных файлообменников (Google Drive, Telegram, WeTransfer), где файл сначала заливается на сторонний сервер, а затем скачивается, <strong className="text-white">bridgik</strong> устанавливает прямое peer-to-peer соединение.
          </p>
          <ul className="space-y-2.5 text-[#bbbbbb] text-base sm:text-lg">
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>В одной сети Wi-Fi:</strong> трафик циркулирует напрямую через ваш роутер со скоростью 100–1000 Мбит/с, вообще не расходуя внешний интернет-трафик.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Через интернет:</strong> соединение устанавливается напрямую между пирами без промежуточной задержки, а при строгом NAT автоматически подключается Turbo TURN.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Direct-to-Disk Streaming */}
        <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                Потоковая запись на диск (Файлы 10–50+ ГБ)
              </h2>
              <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                Без зависаний вкладки и перегрузки оперативной памяти
              </p>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed mb-4">
            Обычные веб-приложения складывают принимаемые файлы в оперативную память браузера, из-за чего на файлах больше 2–4 ГБ вкладка аварийно закрывается с ошибкой <em>Out of Memory</em>.
          </p>
          <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed mb-4">
            В <strong className="text-white">bridgik</strong> внедрена технология <strong className="text-[#9ac43e]">Direct-to-Disk</strong> на базе File System Access API:
          </p>
          <ul className="space-y-2.5 text-[#bbbbbb] text-base sm:text-lg">
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Чанки по 64 КБ:</strong> файлы нарезаются на небольшие пакеты и передаются сплошным стабильным потоком.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Папка для сохранения:</strong> файл пишется сразу на накопитель (SSD/HDD) без всплывающего системного окна на каждый файл.</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Wi-Fi Discovery Radar */}
        <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                Локальный радар сети (Wi-Fi)
              </h2>
              <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                Обнаружение устройств в 1 клик без ручного ввода кодов
              </p>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed mb-3">
            Если ваш ноутбук и телефон подключены к одному роутеру или офисной сети:
          </p>
          <ul className="space-y-2.5 text-[#bbbbbb] text-base sm:text-lg">
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span>Оба устройства сразу видят друг друга на главной странице в блоке «Устройства в вашей сети».</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span>Нажав кнопку <strong className="text-white">«Передать»</strong>, вы отправляете запрос на сопряжение, и мост открывается мгновенно.</span>
            </li>
          </ul>
        </div>

        {/* Card 4: Global Hotkeys, Clipboard & Folders */}
        <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
              <FolderUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                Горячие клавиши, буфер и папки
              </h2>
              <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                Максимальное удобство повседневной работы
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-[#bbbbbb] text-base sm:text-lg">
            <li className="flex items-start gap-3">
              <span className="px-2 py-0.5 rounded bg-[#171717] border border-[#3a3a3a] font-mono text-sm text-[#ededed] font-bold shrink-0 mt-0.5">
                Ctrl + V
              </span>
              <span>
                <strong>Глобальная вставка из буфера:</strong> сделайте скриншот (<kbd className="px-1.5 py-0.5 bg-[#2d2d2d] rounded text-white">Win+Shift+S</kbd> на ПК) или скопируйте файл в проводнике и нажмите Ctrl+V в любом месте страницы — файл мгновенно полетит на сопряженное устройство.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="px-2 py-0.5 rounded bg-[#171717] border border-[#3a3a3a] font-mono text-sm text-[#ededed] font-bold shrink-0 mt-0.5">
                Папки
              </span>
              <span>
                <strong>Перетаскивание директорий:</strong> перетяните целую папку или нажмите «Выбрать папку» — bridgik передаст все файлы внутри папки с сохранением относительных путей.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="px-2 py-0.5 rounded bg-[#171717] border border-[#3a3a3a] font-mono text-sm text-[#ededed] font-bold shrink-0 mt-0.5">
                Превью
              </span>
              <span>
                <strong>Миниатюры и просмотрщик:</strong> переданные изображения и аудиозаписи можно просматривать и воспроизводить прямо в интерфейсе без необходимости сохранения на диск.
              </span>
            </li>
          </ul>
        </div>

        {/* Card 5: Privacy and Security */}
        <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                Приватность и безопасность
              </h2>
              <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                Полная анонимность без следов
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-[#bbbbbb] text-base sm:text-lg">
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Шифрование:</strong> Все каналы защищены протоколами DTLS (Datagram Transport Layer Security) и SRTP со сквозным шифрованием AES-128/256. Промежуточные узлы не имеют ключей расшифровки.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Никаких куки слежения:</strong> Сервис не использует трекеры авторизации, аналитические пиксели или рекламные счётчики.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Уничтожение комнаты:</strong> Как только вы закрываете вкладку, пир отключается, а комната очищается в оперативной памяти сервера без остатка.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mb-10">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-4">
          Связь
        </h3>

        <div className="max-w-md">
          {/* Telegram */}
          <a
            href="https://t.me/IvanchesskO"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 sm:p-5 rounded-xl bg-[#202020] border border-[#3a3a3a] hover:border-[#789d2a] flex items-center justify-between group transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] group-hover:border-[#789d2a]">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-[#ededed] group-hover:text-white">
                  Telegram
                </p>
                <p className="text-sm sm:text-base text-[#aaaaaa]">
                  tyypicall · связь с разработчиком (@IvanchesskO)
                </p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-[#666666] group-hover:text-[#9ac43e] transition-colors" />
          </a>
        </div>
      </div>
    </div>
  );
};
