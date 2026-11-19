import React, { useState } from 'react';
import {
  ArrowRight,
  Wifi,
  Monitor,
  Smartphone,
  Send,
  Radio,
  Mic,
  FileText,
  Lock,
  Paperclip,
  ChevronDown,
  Camera,
  X,
  QrCode,
} from 'lucide-react';
import { NearbyPeer, PairRequest } from '../types/index.js';
import { BridgeIcon } from './icons/BridgeIcon.js';
import { RoomLoungeIcon } from './icons/RoomLoungeIcon.js';
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
  onOpenAbout?: () => void;
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
  incomingPairRequest: _incomingPairRequest,
  onAcceptPair: _onAcceptPair,
  onRejectPair: _onRejectPair,
  myUserName: _myUserName,
  myDeviceType: _myDeviceType,
  lanIp,
  onOpenAbout,
}) => {
  const [pin, setPin] = useState('');
  const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const scannerStreamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => {
    if (!isQrScannerOpen) {
      if (scannerStreamRef.current) {
        scannerStreamRef.current.getTracks().forEach((t) => t.stop());
        scannerStreamRef.current = null;
      }
      return;
    }

    let isCancelled = false;
    let intervalId: any = null;

    async function startCamera() {
      try {
        setScannerError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        scannerStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
        let barcodeDetector: any = null;
        if (hasBarcodeDetector) {
          try {
            barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          } catch {}
        }

        intervalId = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            if (barcodeDetector) {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue;
                handleScannedCode(rawValue);
              }
            }
          } catch {}
        }, 350);
      } catch (err: any) {
        setScannerError('Не удалось открыть камеру. Разрешите доступ к камере в браузере.');
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
      if (scannerStreamRef.current) {
        scannerStreamRef.current.getTracks().forEach((t) => t.stop());
        scannerStreamRef.current = null;
      }
    };
  }, [isQrScannerOpen]);

  const handleScannedCode = (value: string) => {
    if (!value) return;
    sound.playConnect();
    setIsQrScannerOpen(false);

    let parsedPin = value.trim();
    try {
      const url = new URL(value);
      const queryPin = url.searchParams.get('pin');
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (queryPin) {
        parsedPin = queryPin;
      } else if (pathParts.length > 0) {
        parsedPin = pathParts[pathParts.length - 1];
      }
    } catch {}

    if (activeMode === 'meeting') {
      onJoinMeeting(parsedPin);
    } else {
      onJoinBridge(parsedPin);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    if (activeMode === 'meeting') {
      onJoinMeeting(pin.trim());
    } else {
      onJoinBridge(pin.trim());
    }
  };

  const showLanIpHint =
    Boolean(lanIp) &&
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      /^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname));

  const lanUrl =
    typeof window !== 'undefined' && window.location.port
      ? `http://${lanIp}:${window.location.port}`
      : `http://${lanIp}`;

  const radarCard = (
    <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-4 sm:p-7 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-3 h-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#789d2a] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#789d2a]"></span>
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-[#ededed]">
            Устройства в вашей Wi-Fi сети
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#aaaaaa] font-semibold">
          <Wifi className="w-4 h-4 text-[#9ac43e]" />
          <span>Локальный радар</span>
        </div>
      </div>

      {nearbyPeers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {nearbyPeers.map((peer) => (
            <div
              key={peer.socketId}
              className="p-3.5 sm:p-4 rounded-lg bg-[#171717] border border-[#3a3a3a] flex items-center justify-between gap-3 hover:border-[#789d2a]/50 transition-colors"
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
                  <p className="text-base sm:text-lg font-bold text-[#ededed] truncate flex items-center gap-1.5">
                    <span className="truncate">{peer.name}</span>
                    {peer.statusEmote && (
                      <img
                        src={peer.statusEmote}
                        alt="status"
                        className="w-4 h-4 object-contain shrink-0 filter drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                      />
                    )}
                  </p>
                  <p className="text-xs sm:text-sm text-[#9ac43e] flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#789d2a]" />
                    <span>Готов к приему</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onPairWithNearby(peer.socketId)}
                disabled={isPairing}
                className="px-3.5 sm:px-4 py-2 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white text-sm font-bold shrink-0 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{isPairing ? 'Запрос...' : 'Передать'}</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-5 px-4 rounded-lg bg-[#171717]/60 border border-[#3a3a3a]/60 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#222222] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] mx-auto mb-2.5">
            <Radio className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <p className="text-base sm:text-lg font-bold text-[#ededed] mb-1">
            Поиск устройств в этой же сети Wi-Fi...
          </p>
          <p className="text-xs sm:text-base text-[#aaaaaa] max-w-lg mx-auto leading-relaxed">
            Откройте <span className="text-[#9ac43e] font-semibold">bridgik.ru</span> на телефоне или втором ПК в этой же сети — устройство появится здесь для передачи в 1 клик.
          </p>
        </div>
      )}

      {showLanIpHint && (
        <div className="mt-4 pt-3.5 border-t border-[#3a3a3a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-base text-[#aaaaaa]">
          <span className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#9ac43e] shrink-0" />
            <span>Адрес для открытия на телефоне в этом же Wi-Fi:</span>
          </span>
          <span className="font-mono text-[#ededed] font-bold bg-[#171717] px-3 py-1 rounded-md border border-[#3a3a3a] text-sm sm:text-base">
            {lanUrl}
          </span>
        </div>
      )}
    </div>
  );

  const bridgeCreateCard = (
    <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-4 sm:p-8 shadow-lg">
      <button
        onClick={onCreateBridge}
        disabled={isLoading}
        className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-extrabold text-lg sm:text-2xl tracking-wide transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
      >
        <span>{isLoading ? 'Создаем мост...' : 'Создать мост передачи'}</span>
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
      </button>

      <div className="relative my-5 sm:my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#3a3a3a]"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm uppercase">
          <span className="bg-[#202020] px-3 sm:px-4 text-[#999999] font-bold tracking-wider">
            или подключитесь по 4-значному коду
          </span>
        </div>
      </div>

      <form onSubmit={handleJoin} className="flex gap-2 sm:gap-2.5">
        <input
          type="text"
          pattern="[0-9a-zA-Z]*"
          inputMode="numeric"
          maxLength={12}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Код (напр. 4819)"
          className="flex-1 min-w-0 w-full bg-[#171717] border border-[#3a3a3a] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-[#ededed] placeholder-[#999999] font-mono text-center tracking-widest text-xl sm:text-2xl outline-none focus:border-[#789d2a] transition-colors"
        />
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setIsQrScannerOpen(true);
          }}
          className="px-3 sm:px-3.5 py-2.5 sm:py-3 bg-[#262626] hover:bg-[#333333] border border-[#3a3a3a] hover:border-[#789d2a] text-[#ededed] hover:text-[#9ac43e] rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0"
          title="Сканировать QR-код камерой"
        >
          <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          type="submit"
          disabled={!pin.trim() || isLoading}
          className="px-4 sm:px-7 py-2.5 sm:py-3 bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-extrabold rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-base sm:text-lg shrink-0 flex items-center gap-1.5 sm:gap-2"
        >
          <span>Войти</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </form>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-10">
      {/* Intro Subtitle & Badges */}
      <div className="mb-4 sm:mb-7">
        <p className="text-lg sm:text-2xl text-[#ededed] font-semibold leading-snug sm:leading-relaxed mb-2.5 sm:mb-3">
          Мгновенный P2P-обмен файлами любого размера и текстом. Без регистрации и без серверов.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-base font-bold">
          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md bg-[#222222] border border-[#3a3a3a] text-[#9ac43e] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#789d2a] animate-ping" />
            Прямой P2P WebRTC
          </span>
          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md bg-[#222222] border border-[#3a3a3a] text-[#ededed]">
            0 байт на сервере
          </span>
          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md bg-[#222222] border border-[#3a3a3a] text-[#aaaaaa]">
            Wi-Fi Радар
          </span>
        </div>
      </div>

      {/* Info Callout Banner: Compact collapsible on mobile, expanded on desktop */}
      <div className="hidden sm:flex mb-8 p-4 sm:p-5 rounded-xl bg-[#1c2214] border border-[#789d2a]/40 text-[#9ac43e] text-base sm:text-lg items-start gap-3.5">
        <span className="font-bold text-xl leading-none shrink-0 mt-0.5">ⓘ</span>
        <div className="space-y-1 leading-snug">
          <p>
            Сервер выполняет роль сигнального узла. Данные передаются напрямую по зашифрованному WebRTC-каналу (браузер ↔ браузер). 0 байт сохраняется на сервере.
          </p>
        </div>
      </div>

      <div className="sm:hidden mb-4">
        <button
          type="button"
          onClick={() => setIsMobileInfoOpen((prev) => !prev)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2214] border border-[#789d2a]/40 text-[#9ac43e] text-xs font-semibold flex items-center justify-between gap-2 text-left"
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-sm leading-none shrink-0">ⓘ</span>
            <span className="truncate">Как работает шифрованный P2P без сервера</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform ${isMobileInfoOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {isMobileInfoOpen && (
          <div className="mt-1.5 p-3 rounded-xl bg-[#171d10] border border-[#789d2a]/30 text-xs text-[#9ac43e] leading-relaxed">
            Сервер выполняет роль сигнального узла. Данные передаются напрямую по зашифрованному WebRTC-каналу (браузер ↔ браузер). 0 байт сохраняется на сервере.
          </div>
        )}
      </div>

      {/* Mode Selection Cards */}
      <div className="mb-5 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#ededed]">
              Выберите режим работы
            </h2>
            <p className="hidden sm:block text-sm sm:text-base text-[#aaaaaa]">
              Два специализированных пространства без лишних элементов
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-[#1c2214] text-[#9ac43e] border border-[#789d2a]/40 shrink-0">
            Zero-Storage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Mode 1: Мост */}
          <div
            onClick={() => {
              onSelectMode?.('bridge');
              sound.playClick();
            }}
            className={`p-4 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between gap-3 sm:gap-4 ${
              activeMode === 'bridge'
                ? 'bg-[#1b2214] border-[#789d2a] shadow-[0_0_24px_rgba(120,157,42,0.18)]'
                : 'bg-[#202020] border-[#3a3a3a] hover:border-[#4a4a4a]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                      activeMode === 'bridge'
                        ? 'bg-[#151e10] border-[#789d2a] text-[#bbf348]'
                        : 'bg-[#262626] border-[#3a3a3a] text-[#9ac43e]'
                    }`}
                  >
                    <BridgeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white">Режим «Мост»</h3>
                    <p className="text-xs sm:text-sm font-semibold text-[#9ac43e] truncate">
                      Экспресс-передача телефон ↔ компьютер
                    </p>
                  </div>
                </div>

                {activeMode === 'bridge' && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#789d2a] text-white shrink-0">
                    Выбран
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base text-[#cccccc] leading-relaxed">
                Быстрая отправка файлов любого размера, целых папок и скриншотов из буфера{' '}
                <span className="hidden sm:inline">(Ctrl + V)</span>. Без звонков и лишних кнопок.
              </p>
            </div>

            <div className="hidden sm:flex pt-3 border-t border-white/10 items-center justify-between text-xs font-mono text-[#999999]">
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
            className={`p-4 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between gap-3 sm:gap-4 ${
              activeMode === 'meeting'
                ? 'bg-[#1b2214] border-[#789d2a] shadow-[0_0_24px_rgba(120,157,42,0.18)]'
                : 'bg-[#202020] border-[#3a3a3a] hover:border-[#4a4a4a]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                      activeMode === 'meeting'
                        ? 'bg-[#151e10] border-[#789d2a] text-[#bbf348]'
                        : 'bg-[#262626] border-[#3a3a3a] text-[#9ac43e]'
                    }`}
                  >
                    <RoomLoungeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white">Режим «Комната»</h3>
                    <p className="text-xs sm:text-sm font-semibold text-[#9ac43e] truncate">
                      P2P GhostRoom / Конфиденциальная переговорная
                    </p>
                  </div>
                </div>

                {activeMode === 'meeting' && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#789d2a] text-white shrink-0">
                    Выбран
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base text-[#cccccc] leading-relaxed">
                Изолированное пространство для созвона: чистый голос Opus 48 kHz, мгновенная передача файлов и совместный Канвас.
              </p>
            </div>

            <div className="hidden sm:flex pt-3 border-t border-white/10 items-center justify-between text-xs font-mono text-[#999999]">
              <span className="text-[#9ac43e] font-semibold">Opus 48 kHz · Канвас · Файлы</span>
              <span>Нулевые следы</span>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-5 p-4 rounded-lg bg-[#ef9282]/10 border border-[#ed2b3b]/30 text-[#ef9282] text-base font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Action Console Area: Prioritize Create/Join immediately if no nearby devices yet */}
      <div id="mode-actions" className="space-y-5 sm:space-y-6 mb-10">
        {activeMode === 'bridge' ? (
          nearbyPeers.length > 0 ? (
            <>
              {radarCard}
              {bridgeCreateCard}
            </>
          ) : (
            <>
              {bridgeCreateCard}
              {radarCard}
            </>
          )
        ) : (
          /* Meeting Room Mode Action Console */
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-4 sm:p-8 shadow-lg">
            <button
              onClick={onCreateMeeting}
              disabled={isLoading}
              className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-extrabold text-lg sm:text-2xl tracking-wide transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span>{isLoading ? 'Создаем переговорную...' : 'Создать переговорную комнату'}</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            </button>

            <div className="relative my-5 sm:my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#3a3a3a]"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm uppercase">
                <span className="bg-[#202020] px-3 sm:px-4 text-[#999999] font-bold tracking-wider">
                  или подключитесь по коду
                </span>
              </div>
            </div>

            <form onSubmit={handleJoin} className="flex gap-2 sm:gap-2.5">
              <input
                type="text"
                pattern="[0-9a-zA-Z]*"
                inputMode="numeric"
                maxLength={12}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Код (напр. 4819)"
                className="flex-1 min-w-0 w-full bg-[#171717] border border-[#3a3a3a] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-[#ededed] placeholder-[#999999] font-mono text-center tracking-widest text-xl sm:text-2xl outline-none focus:border-[#789d2a] transition-colors"
              />
              <button
                type="submit"
                disabled={!pin.trim() || isLoading}
                className="px-4 sm:px-7 py-2.5 sm:py-3 bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-extrabold rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-base sm:text-lg shrink-0 flex items-center gap-1.5 sm:gap-2"
              >
                <span>Войти</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 mt-5 border-t border-[#333333]">
              <div className="flex items-center gap-2 text-sm text-[#bbbbbb]">
                <Mic className="w-4 h-4 text-[#9ac43e] shrink-0" />
                <span>Голос Opus 48 kHz без задержек</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#bbbbbb]">
                <Paperclip className="w-4 h-4 text-[#9ac43e] shrink-0" />
                <span>Мгновенный обмен файлами любого размера</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#bbbbbb]">
                <FileText className="w-4 h-4 text-[#9ac43e] shrink-0" />
                <span>Совместный Канвас с экспортом в .md</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#bbbbbb]">
                <Lock className="w-4 h-4 text-[#9ac43e] shrink-0" />
                <span>Нулевые следы и логи</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Link to dedicated About page */}
      {onOpenAbout && (
        <div
          onClick={onOpenAbout}
          className="p-4 sm:p-6 rounded-xl bg-[#202020] border border-[#3a3a3a] hover:border-[#789d2a] flex items-center justify-between group transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#282828] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] group-hover:border-[#789d2a] shrink-0 font-bold text-xl">
              ?
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-[#ededed] group-hover:text-white transition-colors">
                Как устроен bridgik и протокол P2P?
              </p>
              <p className="text-sm sm:text-lg text-[#aaaaaa]">
                Подробно: Direct-to-Disk, Zero-Storage, Wi-Fi радар и безопасность
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#666666] group-hover:text-[#9ac43e] transition-colors shrink-0 ml-2" />
        </div>
      )}

      {/* In-Page QR Code Scanner Modal */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1a1a22] border border-[#3a3a4a] rounded-2xl p-5 max-w-sm w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#9ac43e]" />
                <h3 className="text-base font-bold text-[#ededed]">Сканирование QR-кода</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQrScannerOpen(false)}
                className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {scannerError ? (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-sm text-center">
                <p className="mb-3">{scannerError}</p>
                <button
                  type="button"
                  onClick={() => setIsQrScannerOpen(false)}
                  className="px-4 py-2 bg-red-900/60 hover:bg-red-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border-2 border-[#789d2a]/50 shadow-inner flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Cyber viewfinder reticle with scanning beam */}
                  <div className="absolute inset-8 border-2 border-[#9ac43e]/70 rounded-lg pointer-events-none">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#bbf348]" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#bbf348]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#bbf348]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#bbf348]" />
                    <div className="w-full h-0.5 bg-[#bbf348] shadow-[0_0_8px_#bbf348] absolute top-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                </div>
                <p className="text-xs text-center text-[#aaaaaa] leading-relaxed">
                  Наведите камеру на QR-код на экране другого устройства для мгновенного входа.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};