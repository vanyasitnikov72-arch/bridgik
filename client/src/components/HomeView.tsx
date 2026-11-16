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
      {/* Title section in Handjet font */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#ededed] mb-3 leading-none">
          bridgit <span className="text-[#9ac43e]">·</span> мост между экранами
        </h1>
        <p className="text-xl sm:text-2xl text-[#bbbbbb] leading-relaxed">
          Мгновенный P2P-обмен файлами любого размера и текстом. Без регистрации и без серверов.
        </p>
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
              Откройте <span className="text-[#9ac43e] font-semibold">bridgit</span> на телефоне или втором ПК в этой же сети — устройство появится здесь для мгновенной передачи в 1 клик без кодов.
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

      {/* Feature list in eblo.id doc style */}
      <div id="features" className="space-y-4 pt-6 border-t border-white/[0.08]">
        <h2 className="text-3xl font-extrabold text-[#ededed] mb-3">
          Как это устроено
        </h2>

        <ul className="space-y-3.5 text-[#ededed] text-lg sm:text-xl list-none leading-relaxed">
          <li className="flex items-start gap-3">
            <span className="text-[#9ac43e] font-bold text-xl">•</span>
            <span>
              <strong className="text-white">Локальный радар сети (Wi-Fi).</strong> Устройства в одной локальной сети видят друг друга на стартовой странице и могут передать файл в 1 клик без ручного ввода кодов.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#9ac43e] font-bold text-xl">•</span>
            <span>
              <strong className="text-white">Прямой P2P без ограничений.</strong> Передавайте 10 ГБ, 20 ГБ, 50 ГБ архивов или видео без промежуточного сохранения в облаках.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#9ac43e] font-bold text-xl">•</span>
            <span>
              <strong className="text-white">Потоковая запись на диск.</strong> Для файлов больше 200 МБ браузер сразу сбрасывает данные на диск (SSD/HDD), не забивая оперативную память вкладки.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#9ac43e] font-bold text-xl">•</span>
            <span>
              <strong className="text-white">Мгновенный буфер и текст.</strong> Поддержка глобальной вставки Ctrl+V прямо в окно передачи файлов и заметок.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#9ac43e] font-bold text-xl">•</span>
            <span>
              <strong className="text-white">Полная анонимность.</strong> Без создания аккаунтов, номеров телефонов или авторизаций через соцсети. Закрыли вкладку — комната удалилась.
            </span>
          </li>
        </ul>

        {/* Small Tag Chips */}
        <div className="flex flex-wrap items-center gap-2.5 pt-5">
          <span className="px-3.5 py-1.5 rounded-full bg-[#222222] border border-[#3a3a3a] text-sm font-bold text-[#aaaaaa]">
            Wi-Fi Радар
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#222222] border border-[#3a3a3a] text-sm font-bold text-[#aaaaaa]">
            P2P WebRTC
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#222222] border border-[#3a3a3a] text-sm font-bold text-[#aaaaaa]">
            Direct-to-Disk
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#222222] border border-[#3a3a3a] text-sm font-bold text-[#aaaaaa]">
            Ctrl + V
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#222222] border border-[#3a3a3a] text-sm font-bold text-[#aaaaaa]">
            Без серверов
          </span>
        </div>
      </div>
    </div>
  );
};
