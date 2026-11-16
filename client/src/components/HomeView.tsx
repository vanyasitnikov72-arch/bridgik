import React, { useState } from 'react';
import { ArrowRight, Wifi, Monitor, Smartphone, Send, Radio, Check, X } from 'lucide-react';
import { NearbyPeer, PairRequest } from '../types/index.js';

interface HomeViewProps {
  onCreateRoom: () => void;
  onJoinRoom: (pinOrId: string) => void;
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
  onOpenAbout?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onCreateRoom,
  onJoinRoom,
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
  onOpenAbout,
}) => {
  const [pin, setPin] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      onJoinRoom(pin.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
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

        {/* Feature Tags */}
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
            Сервер выполняет роль сигнального узла. Данные передаются напрямую по зашифрованному WebRTC-каналу (браузер ↔ браузер).
          </p>
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

      {/* Local Wi-Fi Discovery (Radar) */}
      <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-5 sm:p-7 mb-8 shadow-md">
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

      {/* Main Action Card */}
      <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 mb-10 shadow-lg">
        {/* Create Button */}
        <button
          onClick={onCreateRoom}
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-extrabold text-2xl tracking-wide transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Создаем комнату...' : 'Создать комнату по ссылке и PIN'}</span>
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

        {/* Join Form */}
        <form onSubmit={handleJoin} className="flex gap-2.5">
          <input
            type="text"
            pattern="[0-9a-zA-Z]*"
            inputMode="numeric"
            maxLength={12}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Код комнаты (напр. 4819)"
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

      {/* Link to About page in eblo.id style */}
      {onOpenAbout && (
        <div
          onClick={onOpenAbout}
          className="p-5 sm:p-6 rounded-xl bg-[#202020] border border-[#3a3a3a] hover:border-[#789d2a] flex items-center justify-between group transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#282828] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] group-hover:border-[#789d2a] shrink-0 font-bold text-xl">
              ?
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[#ededed] group-hover:text-white transition-colors">
                Как устроен bridgik и протокол P2P?
              </p>
              <p className="text-base sm:text-lg text-[#aaaaaa]">
                Подробно: Direct-to-Disk, Zero-Storage, Wi-Fi радар и безопасность
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-[#666666] group-hover:text-[#9ac43e] transition-colors shrink-0 ml-2" />
        </div>
      )}
    </div>
  );
};
