import React, { useState } from 'react';
import {
  ArrowRight,
  Wifi,
  Monitor,
  Smartphone,
  Send,
  Radio,
  Check,
  X,
  Mic,
  FileText,
  Lock,
  HardDrive,
  Copy,
  ExternalLink,
  FolderUp,
  Zap,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { NearbyPeer, PairRequest } from '../types/index.js';
import { BridgeIcon } from './icons/BridgeIcon.js';
import { sound } from '../utils/sound.js';

interface HomeViewProps {
  onCreateBridge: () => void;
  onJoinBridge: (pinOrId: string) => void;
  onCreateMeeting: () => void;
  onJoinMeeting: (pinOrId: string) => void;
  activeMode?: 'bridge' | 'meeting';
  onSelectMode?: (mode: 'bridge' | 'meeting') => void;
  isLoading: boolean;
  errorMessage?: string;
  nearbyPeers: NearbyPeer[];
  onPairWithNearby: (socketId: string) => void;
  isPairing: boolean;
  incomingPairRequest: PairRequest | null;
  onAcceptPair: () => void;
  onRejectPair: () => void;
  myUserName: string;
  myDeviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  lanIp?: string | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onCreateBridge,
  onJoinBridge,
  onCreateMeeting,
  onJoinMeeting,
  activeMode = 'bridge',
  onSelectMode,
  isLoading,
  errorMessage,
  nearbyPeers,
  onPairWithNearby,
  isPairing,
  incomingPairRequest,
  onAcceptPair,
  onRejectPair,
  myUserName: _myUserName,
  myDeviceType: _myDeviceType,
  lanIp,
}) => {
  const [pin, setPin] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    if (activeMode === 'meeting') {
      onJoinMeeting(pin.trim());
    } else {
      onJoinBridge(pin.trim());
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@bridgik.ru').catch(() => {});
    setCopiedEmail(true);
    sound.playClick();
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Thematic Pixel & Cable Bridge Visual: Screen 1 ↔ bridgik ↔ Screen 2 */}
      <div className="mb-6 select-none">
        <div className="h-16 sm:h-20 w-full flex items-end justify-between relative overflow-hidden border-b border-[#3a3a3a] pb-1">
          {/* Left Pylon (Screen 1 / Desktop) */}
          <div className="flex items-end gap-2 relative z-10 shrink-0">
            <div className="flex flex-col items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9ac43e] animate-beacon mb-1" />
              <div className="w-4 sm:w-5 h-10 sm:h-12 bg-[#262626] border-x border-t border-[#3a3a3a] rounded-t flex flex-col justify-between py-1">
                <div className="w-2 h-1 bg-[#789d2a] mx-auto rounded-xs" />
                <div className="w-2 h-1 bg-[#3a3a3a] mx-auto rounded-xs" />
              </div>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#aaaaaa] hidden sm:inline mb-1 font-mono">
              [ Экран 1 ]
            </span>
          </div>

          {/* Bridge Cables Span & Animated WebRTC Data Packets */}
          <div className="flex-1 h-12 sm:h-14 relative mx-2 sm:mx-6">
            <svg
              className="w-full h-full absolute inset-0 overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 400 48"
            >
              {/* Main Suspension Cable Arc */}
              <path
                d="M 0 6 Q 200 46 400 6"
                fill="none"
                stroke="#3a3a3a"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              {/* Secondary Cable */}
              <path
                d="M 0 10 Q 200 42 400 10"
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="1"
              />
              {/* Vertical Suspenders */}
              {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1={6 + 40 * Math.pow((x - 200) / 200, 2)}
                  x2={x}
                  y2={48}
                  stroke="#262626"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Glowing Green Data Packet 1 flowing across bridge */}
            <div
              className="animate-bridge-flow bottom-0 flex items-center gap-1 pointer-events-none"
              style={{ animationDuration: '3.2s' }}
            >
              <span className="w-2.5 h-2.5 bg-[#bbf348] rounded-xs shadow-[0_0_10px_#9ac43e]" />
              <span className="w-1.5 h-1.5 bg-[#789d2a] rounded-xs opacity-80" />
              <span className="w-1 h-1 bg-[#789d2a]/50 rounded-xs" />
            </div>

            {/* Glowing Green Data Packet 2 flowing across bridge (staggered) */}
            <div
              className="animate-bridge-flow bottom-0 flex items-center gap-1 pointer-events-none"
              style={{ animationDuration: '3.2s', animationDelay: '1.6s' }}
            >
              <span className="w-2.5 h-2.5 bg-[#9ac43e] rounded-xs shadow-[0_0_8px_#789d2a]" />
              <span className="w-1.5 h-1.5 bg-[#789d2a] rounded-xs opacity-75" />
            </div>
          </div>

          {/* Right Pylon (Screen 2 / Mobile) */}
          <div className="flex items-end gap-2 relative z-10 shrink-0">
            <span className="text-xs sm:text-sm font-bold text-[#aaaaaa] hidden sm:inline mb-1 font-mono">
              [ Экран 2 ]
            </span>
            <div className="flex flex-col items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9ac43e] animate-beacon mb-1" />
              <div className="w-4 sm:w-5 h-10 sm:h-12 bg-[#262626] border-x border-t border-[#3a3a3a] rounded-t flex flex-col justify-between py-1">
                <div className="w-2 h-1 bg-[#789d2a] mx-auto rounded-xs" />
                <div className="w-2 h-1 bg-[#3a3a3a] mx-auto rounded-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title section in Handjet font with letter-by-letter green illumination wave */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#ededed] mb-3 leading-none flex flex-wrap items-center gap-x-3">
          <span className="inline-flex tracking-tight select-none">
            {['b', 'r', 'i', 'd', 'g', 'i', 'k'].map((letter, index) => (
              <span
                key={index}
                className="animate-letter-glow inline-block hover:text-[#bbf348] hover:scale-110 transition-transform cursor-default"
                style={{ animationDelay: `${index * 0.16}s` }}
              >
                {letter}
              </span>
            ))}
          </span>
          <span className="text-[#9ac43e] animate-pulse">·</span>
          <span className="text-[#ededed]">мост между экранами</span>
        </h1>

        <p className="text-xl sm:text-2xl text-[#bbbbbb] leading-relaxed mb-4">
          Мгновенный P2P-обмен файлами любого размера и текстом. Без регистрации и без серверов.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-bold">
          <span className="px-3 py-1 rounded-md bg-[#222222] border border-[#3a3a3a] text-[#9ac43e] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#789d2a] animate-ping" />
            Прямой P2P WebRTC
          </span>
          <span className="px-3 py-1 rounded-md bg-[#222222] border border-[#3a3a3a] text-[#ededed]">
            0 байт на сервере
          </span>
          <span className="px-3 py-1 rounded-md bg-[#222222] border border-[#3a3a3a] text-[#aaaaaa]">
            Wi-Fi Радар
          </span>
        </div>
      </div>

      {/* Info Callout Banner */}
      <div className="mb-8 p-4 sm:p-5 rounded-xl bg-[#1c2214] border border-[#789d2a]/40 text-[#9ac43e] text-base sm:text-lg flex items-start gap-3.5">
        <span className="font-bold text-xl leading-none shrink-0 mt-0.5">ⓘ</span>
        <div className="space-y-1 leading-snug">
          <p>
            Сервер выполняет роль сигнального узла. Данные передаются напрямую по зашифрованному WebRTC-каналу (браузер ↔ браузер). 0 байт сохраняется на сервере.
          </p>
        </div>
      </div>

      {/* Mode Selection Cards (Выбор режима на главной) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
              Выберите режим работы
            </h2>
            <p className="text-sm sm:text-base text-[#aaaaaa]">
              Два специализированных пространства без лишних элементов
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#1c2214] text-[#9ac43e] border border-[#789d2a]/40">
            Zero-Storage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mode 1: Мост */}
          <div
            onClick={() => {
              onSelectMode?.('bridge');
              sound.playClick();
            }}
            className={`p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between gap-4 ${
              activeMode === 'bridge'
                ? 'bg-[#1b2214] border-[#789d2a] shadow-[0_0_24px_rgba(120,157,42,0.18)]'
                : 'bg-[#202020] border-[#3a3a3a] hover:border-[#4a4a4a]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3.5">
                  {/* Phosphor vector bridge icon (NO EMOJI) */}
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                      activeMode === 'bridge'
                        ? 'bg-[#151e10] border-[#789d2a] text-[#bbf348]'
                        : 'bg-[#262626] border-[#3a3a3a] text-[#9ac43e]'
                    }`}
                  >
                    <BridgeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">Режим «Мост»</h3>
                    <p className="text-sm font-semibold text-[#9ac43e]">
                      Экспресс-передача телефон ↔ компьютер
                    </p>
                  </div>
                </div>

                {activeMode === 'bridge' && (
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#789d2a] text-white">
                    Выбран
                  </span>
                )}
              </div>

              <p className="text-base text-[#cccccc] leading-relaxed">
                Быстрая отправка файлов любого размера, целых папок и скриншотов из буфера (Ctrl + V). Без звонков и лишних кнопок.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#999999]">
              <span className="text-[#9ac43e] font-semibold">Wi-Fi Радар · Direct-to-Disk</span>
              <span>0 байт на сервере</span>
            </div>
          </div>

          {/* Mode 2: Комната */}
          <div
            onClick={() => {
              onSelectMode?.('meeting');
              sound.playClick();
            }}
            className={`p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between gap-4 ${
              activeMode === 'meeting'
                ? 'bg-[#1b2214] border-[#789d2a] shadow-[0_0_24px_rgba(120,157,42,0.18)]'
                : 'bg-[#202020] border-[#3a3a3a] hover:border-[#4a4a4a]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3.5">
                  {/* Phosphor vector conference/users icon (NO EMOJI) */}
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                      activeMode === 'meeting'
                        ? 'bg-[#151e10] border-[#789d2a] text-[#bbf348]'
                        : 'bg-[#262626] border-[#3a3a3a] text-[#9ac43e]'
                    }`}
                  >
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">Режим «Комната»</h3>
                    <p className="text-sm font-semibold text-[#9ac43e]">
                      P2P GhostRoom / Конфиденциальная переговорная
                    </p>
                  </div>
                </div>

                {activeMode === 'meeting' && (
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#789d2a] text-white">
                    Выбран
                  </span>
                )}
              </div>

              <p className="text-base text-[#cccccc] leading-relaxed">
                Изолированное пространство для приватного созвона: чистый голос Opus 48 kHz, показ экрана 60 FPS и общий блокнот.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#999999]">
              <span className="text-[#9ac43e] font-semibold">Opus 48 kHz · Экран 60 FPS</span>
              <span>Нулевые следы</span>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Pair Request Modal / Card */}
      {incomingPairRequest && (
        <div className="mb-6 p-5 sm:p-6 rounded-xl bg-[#1c2214] border-2 border-[#789d2a] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#789d2a]/20 border border-[#789d2a] flex items-center justify-center text-[#9ac43e] shrink-0">
              {incomingPairRequest.fromDevice === 'mobile' ? (
                <Smartphone className="w-6 h-6" />
              ) : (
                <Monitor className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-[#ededed]">
                Входящее подключение для передачи файлов
              </p>
              <p className="text-base text-[#9ac43e]">
                <strong>{incomingPairRequest.fromName}</strong> хочет передать вам файлы
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onAcceptPair}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-base transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Принять</span>
            </button>
            <button
              onClick={onRejectPair}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-bold text-base transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <X className="w-5 h-5" />
              <span>Отклонить</span>
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-[#ef9282]/10 border border-[#ed2b3b]/30 text-[#ef9282] text-base font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Action Console Area: Depends on Selected Mode */}
      <div id="mode-actions" className="space-y-6 mb-12">
        {activeMode === 'bridge' ? (
          <>
            {/* Local Wi-Fi Discovery (Radar) for Bridge Mode */}
            <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-5 sm:p-7 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-3 h-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#789d2a] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#789d2a]"></span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#ededed]">
                    Устройства в вашей Wi-Fi сети
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#aaaaaa] font-semibold">
                  <Wifi className="w-4 h-4 text-[#9ac43e]" />
                  <span>Локальный радар</span>
                </div>
              </div>

              {nearbyPeers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {nearbyPeers.map((peer) => (
                    <div
                      key={peer.socketId}
                      className="p-4 rounded-lg bg-[#171717] border border-[#3a3a3a] flex items-center justify-between gap-3 hover:border-[#789d2a]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-md bg-[#222222] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] shrink-0">
                          {peer.deviceType === 'mobile' ? (
                            <Smartphone className="w-5 h-5" />
                          ) : (
                            <Monitor className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base sm:text-lg font-bold text-[#ededed] truncate">{peer.name}</p>
                          <p className="text-sm text-[#9ac43e] flex items-center gap-1.5 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-[#789d2a]" />
                            <span>Готов к приему</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onPairWithNearby(peer.socketId)}
                        disabled={isPairing}
                        className="px-4 py-2 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white text-sm font-bold shrink-0 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isPairing ? 'Запрос...' : 'Передать'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 px-4 rounded-lg bg-[#171717]/60 border border-[#3a3a3a]/60 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#222222] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] mx-auto mb-3">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-base sm:text-lg font-bold text-[#ededed] mb-1.5">
                    Поиск устройств в этой же сети Wi-Fi...
                  </p>
                  <p className="text-sm sm:text-base text-[#aaaaaa] max-w-lg mx-auto leading-relaxed">
                    Откройте <span className="text-[#9ac43e] font-semibold">bridgik.ru</span> на телефоне или втором ПК в этой же сети — устройство появится здесь для мгновенной передачи в 1 клик без кодов.
                  </p>
                </div>
              )}

              {lanIp && (
                <div className="mt-4 pt-3.5 border-t border-[#3a3a3a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-sm sm:text-base text-[#aaaaaa]">
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#9ac43e]" />
                    <span>Адрес для открытия на телефоне в этом же Wi-Fi:</span>
                  </span>
                  <span className="font-mono text-[#ededed] font-bold bg-[#171717] px-3 py-1 rounded-md border border-[#3a3a3a] text-sm sm:text-base">
                    http://{lanIp}:5173
                  </span>
                </div>
              )}
            </div>

            {/* Create / Join Bridge Card */}
            <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 shadow-lg">
              <button
                onClick={onCreateBridge}
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-extrabold text-2xl tracking-wide transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Создаем мост...' : 'Создать мост передачи по ссылке и PIN'}</span>
                <ArrowRight className="w-6 h-6" />
              </button>

              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#3a3a3a]"></div>
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-[#202020] px-4 text-[#999999] font-bold tracking-wider">
                    или подключитесь по 4-значному коду
                  </span>
                </div>
              </div>

              <form onSubmit={handleJoin} className="flex gap-2.5">
                <input
                  type="text"
                  pattern="[0-9a-zA-Z]*"
                  inputMode="numeric"
                  maxLength={12}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Код моста (напр. 4819)"
                  className="flex-1 bg-[#171717] border border-[#3a3a3a] rounded-lg px-4 py-3 text-[#ededed] placeholder-[#999999] font-mono text-center tracking-widest text-2xl outline-none focus:border-[#789d2a] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!pin.trim() || isLoading}
                  className="px-7 py-3 bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-extrabold rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-lg shrink-0 flex items-center gap-2"
                >
                  <span>Войти</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Meeting Room Mode Action Console */
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 shadow-lg">
            <button
              onClick={onCreateMeeting}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-extrabold text-2xl tracking-wide transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Mic className="w-6 h-6" />
              <span>{isLoading ? 'Создаем переговорную...' : 'Создать переговорную комнату'}</span>
              <ArrowRight className="w-6 h-6" />
            </button>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#3a3a3a]"></div>
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-[#202020] px-4 text-[#999999] font-bold tracking-wider">
                  или подключитесь к существующей по коду
                </span>
              </div>
            </div>

            <form onSubmit={handleJoin} className="flex gap-2.5">
              <input
                type="text"
                pattern="[0-9a-zA-Z]*"
                inputMode="numeric"
                maxLength={12}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Код встречи (напр. 4819)"
                className="flex-1 bg-[#171717] border border-[#3a3a3a] rounded-lg px-4 py-3 text-[#ededed] placeholder-[#999999] font-mono text-center tracking-widest text-2xl outline-none focus:border-[#789d2a] transition-colors"
              />
              <button
                type="submit"
                disabled={!pin.trim() || isLoading}
                className="px-7 py-3 bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-extrabold rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-lg shrink-0 flex items-center gap-2"
              >
                <span>Войти</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 mt-6 border-t border-[#333333]">
              <div className="flex items-center gap-2 text-sm text-[#bbbbbb]">
                <Mic className="w-4 h-4 text-[#9ac43e]" />
                <span>Голос Opus 48 kHz без задержек</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#bbbbbb]">
                <Monitor className="w-4 h-4 text-[#9ac43e]" />
                <span>Демонстрация экрана в 60 FPS</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#bbbbbb]">
                <FileText className="w-4 h-4 text-[#9ac43e]" />
                <span>Общий блокнот с экспортом в .md</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#bbbbbb]">
                <Lock className="w-4 h-4 text-[#9ac43e]" />
                <span>Нулевые следы и логи</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION: О СЕРВИСЕ BRIDGIK (Directly on Main Page)        */}
      {/* ========================================================= */}
      <div id="about-section" className="pt-8 border-t border-[#333333]">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1c2214] border border-[#789d2a]/40 text-[#9ac43e] text-sm font-mono font-bold mb-3">
            <span>О сервисе bridgik · Манифест Zero-Storage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#ededed] mb-3 leading-tight">
            Как устроен <span className="text-[#9ac43e]">bridgik</span> и протокол P2P
          </h2>
          <p className="text-lg sm:text-xl text-[#bbbbbb] leading-relaxed">
            Мгновенный P2P-мост для передачи файлов любого размера, папок и текста между устройствами. Без регистрации, облаков и сохранения ваших данных.
          </p>
        </div>

        {/* Zero-Storage Notice Callout in eblo.id style */}
        <div className="mb-10 p-5 sm:p-6 rounded-xl bg-[#1c2214] border border-[#789d2a]/50 text-[#9ac43e] text-lg sm:text-xl flex items-start gap-4 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#789d2a]/20 border border-[#789d2a] flex items-center justify-center shrink-0 mt-0.5 text-[#9ac43e] font-bold">
            ⓘ
          </div>
          <div className="space-y-1.5 leading-relaxed text-[#d4e8a8]">
            <p className="font-bold text-white text-xl">
              Главный манифест: Zero-Storage (0 байт на сервере)
            </p>
            <p className="text-[#bbbbbb]">
              Ваши файлы и сообщения никогда не загружаются на сервер и не сохраняются ни в каких базах данных. Сервер используется исключительно как маяк сигналов (WebRTC Handshake). Все данные шифруются и передаются напрямую от браузера к браузеру.
            </p>
          </div>
        </div>

        {/* Detailed Two Modes Breakdown (with Stylized Vector Icons - NO EMOJIS) */}
        <div className="mb-12 space-y-4">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-1">
              Два режима: <span className="text-[#9ac43e]">«Мост»</span> и <span className="text-[#9ac43e]">«Комната»</span>
            </h3>
            <p className="text-base sm:text-lg text-[#bbbbbb] leading-relaxed">
              Мы сознательно разделили два сценария, чтобы интерфейс оставался чистым и сфокусированным:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Mode 1: Мост (Stylized phosphor vector BridgeIcon) */}
            <div className="bg-[#202020] border-2 border-[#789d2a]/50 rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#1c2214] border border-[#789d2a] flex items-center justify-center text-[#9ac43e] shrink-0">
                    <BridgeIcon className="w-6 h-6 text-[#9ac43e]" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-extrabold text-white">Режим «Мост»</h4>
                    <p className="text-sm font-semibold text-[#9ac43e]">Экспресс-передача телефон ↔ компьютер</p>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-[#cccccc] leading-relaxed mb-4">
                  Специально для ситуаций, когда нужно быстро скинуть скриншот, архив, видео или папку со смартфона на ПК (или между двумя своими компьютерами). Ноль лишних кнопок — только файлы и максимальная скорость сети.
                </p>

                <ul className="space-y-2.5 text-base sm:text-lg text-[#bbbbbb]">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#9ac43e] font-bold">•</span>
                    <span><strong>Локальный Wi-Fi Радар:</strong> устройства в одной сети видны на стартовом экране и передают данные в 1 клик.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#9ac43e] font-bold">•</span>
                    <span><strong>Direct-to-Disk (10–50+ ГБ):</strong> потоковая запись прямо в выбранную папку на диске без зависания браузера.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#9ac43e] font-bold">•</span>
                    <span><strong>Глобальный Ctrl + V:</strong> моментальная отправка скриншота или файла из буфера в любом месте страницы.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#9ac43e] font-bold">•</span>
                    <span><strong>Папки и медиа-превью:</strong> отправка целых папок и встроенный просмотр картинок/аудио.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#333333] flex items-center justify-between text-xs sm:text-sm font-mono text-[#999999]">
                <span className="text-[#9ac43e]">Фокус: файлы и буфер</span>
                <span>Без звонков и отвлечений</span>
              </div>
            </div>

            {/* Mode 2: Комната (Stylized phosphor vector Users icon) */}
            <div className="bg-[#202020] border-2 border-[#3a3a3a] hover:border-[#789d2a]/50 rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-md transition-colors">
              <div>
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#1c2214] border border-[#789d2a] flex items-center justify-center text-[#9ac43e] shrink-0">
                    <Users className="w-6 h-6 text-[#9ac43e]" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-extrabold text-white">Режим «Комната»</h4>
                    <p className="text-sm font-semibold text-[#9ac43e]">P2P GhostRoom / Конфиденциальная переговорная</p>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-[#cccccc] leading-relaxed mb-4">
                  Изолированное эфемерное пространство для приватного созвона с клиентом, коллегой или другом. Никаких аккаунтов, установки приложений, серверных записей или логов.
                </p>

                <ul className="space-y-2.5 text-base sm:text-lg text-[#bbbbbb]">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#9ac43e] font-bold">•</span>
                    <span><strong>Голосовая P2P-связь (Opus):</strong> чистый голос без задержек и без серверного сжатия.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#9ac43e] font-bold">•</span>
                    <span><strong>Демонстрация экрана 60 FPS:</strong> показ рабочего стола, Figma-макетов, презентаций или кода.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#9ac43e] font-bold">•</span>
                    <span><strong>Общий блокнот (Scratchpad):</strong> совместный черновик заметок с моментальной синхронизацией по DataChannel и скачиванием в .md.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#9ac43e] font-bold">•</span>
                    <span><strong>Чат и вложения:</strong> обмен сообщениями и отправка рабочих документов прямо во время разговора.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#333333] flex items-center justify-between text-xs sm:text-sm font-mono text-[#999999]">
                <span className="text-[#9ac43e]">Фокус: живой созвон и экран</span>
                <span>Кнопка экстренного завершения</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Dive Architecture Cards */}
        <div className="space-y-6 mb-12">
          {/* WebRTC DataChannel */}
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                  Прямое P2P-соединение (WebRTC DataChannel)
                </h3>
                <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                  Браузер ↔ Браузер на максимальной скорости сети
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
                <span><strong>Через интернет:</strong> соединение устанавливается через STUN/ICE напрямую между пирами без промежуточной задержки.</span>
              </li>
            </ul>
          </div>

          {/* Direct-to-Disk */}
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                  Потоковая запись на диск (Файлы 10–50+ ГБ)
                </h3>
                <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                  Без зависаний вкладки и перегрузки оперативной памяти
                </p>
              </div>
            </div>
            <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed mb-4">
              Обычные сайты при передаче больших файлов складывают их части в оперативную память вкладки браузера, из-за чего на файлах больше 2–4 ГБ браузер аварийно завершает работу с ошибкой <em>Out of Memory</em>.
            </p>
            <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed mb-4">
              В <strong className="text-white">bridgik</strong> внедрена технология <strong className="text-[#9ac43e]">Direct-to-Disk</strong> на базе File System Access API:
            </p>
            <ul className="space-y-2.5 text-[#bbbbbb] text-base sm:text-lg">
              <li className="flex items-start gap-2.5">
                <span className="text-[#9ac43e] font-bold">•</span>
                <span><strong>Чанки по 64 КБ:</strong> файлы нарезаются на небольшие пакеты и передаются потоком.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#9ac43e] font-bold">•</span>
                <span><strong>Папка для сохранения:</strong> при включении файл пишется сразу на накопитель (SSD/HDD) без всплывающего окна сохранения на каждый файл.</span>
              </li>
            </ul>
          </div>

          {/* Wi-Fi Radar */}
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                  Локальный радар сети (Wi-Fi)
                </h3>
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
                <span>Нажав кнопку <strong className="text-white">«Передать»</strong>, вы отправляете запрос на сопряжение. На втором устройстве появляется всплывающее окно «Принять/Отклонить», и комната создается мгновенно.</span>
              </li>
            </ul>
          </div>

          {/* Global Hotkeys, Clipboard & Folders */}
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
                <FolderUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                  Горячие клавиши, буфер и папки
                </h3>
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
            </ul>
          </div>

          {/* Privacy and Security */}
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                  Приватность и безопасность
                </h3>
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
                <span><strong>Никаких аккаунтов и куки:</strong> Сервис не использует куки авторизации, метрики или сторонние трекеры. Имена пользователей генерируются случайно локально в браузере.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#9ac43e] font-bold">•</span>
                <span><strong>Уничтожение комнаты:</strong> Как только вы закрываете вкладку, пир отключается, а комната очищается в оперативной памяти сервера без остатка.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Community & Feedback */}
        <div className="mb-10">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-4">
            Связь и сообщество
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
            <a
              href="https://t.me"
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
                    Чат сообщества и оперативные вопросы
                  </p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-[#666666] group-hover:text-[#9ac43e] transition-colors" />
            </a>

            <button
              onClick={handleCopyEmail}
              className="p-4 sm:p-5 rounded-xl bg-[#202020] border border-[#3a3a3a] hover:border-[#789d2a] flex items-center justify-between group transition-colors cursor-pointer text-left w-full"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] group-hover:border-[#789d2a]">
                  {copiedEmail ? <Check className="w-5 h-5 text-[#9ac43e]" /> : <Copy className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-[#ededed] group-hover:text-white">
                    support@bridgik.ru
                  </p>
                  <p className="text-sm sm:text-base text-[#aaaaaa]">
                    {copiedEmail ? 'Адрес скопирован в буфер!' : 'Нажмите, чтобы скопировать почту'}
                  </p>
                </div>
              </div>
              <Copy className="w-5 h-5 text-[#666666] group-hover:text-[#9ac43e] transition-colors" />
            </button>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#1c2214] border border-[#789d2a]/40 text-[#9ac43e] text-base sm:text-lg flex items-start gap-3.5">
            <span className="font-bold text-xl leading-none shrink-0 mt-0.5">ⓘ</span>
            <p className="leading-snug text-[#cccccc]">
              Нашли баг или хотите предложить новую функцию? Приложите снимок экрана или описание вашей операционной системы и браузера — мы оперативно ответим и доработаем сервис.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
