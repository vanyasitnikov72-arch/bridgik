import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Sliders,
  Share2,
  Mic,
  Bell,
  Volume2,
  Flame,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { sound } from '../utils/sound.js';
import { UserSettings, AuthProvider } from '../types/index.js';

type SettingsTab = 'general' | 'bridge' | 'room' | 'notifications';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  isAuthed: boolean;
  onOpenAuth?: (provider?: AuthProvider) => void;
  hasTelegramLinked?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
  isAuthed,
  onOpenAuth,
  hasTelegramLinked = false,
}) => {
  const [tab, setTab] = useState<SettingsTab>('general');

  // Microphone device enumeration & test state
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const testStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Enumerate input devices when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopMicTest();
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const mics = devices.filter((d) => d.kind === 'audioinput');
          setAvailableMics(mics);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const stopMicTest = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((t) => t.stop());
      testStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsTestingMic(false);
    setMicVolume(0);
  };

  const startMicTest = async () => {
    sound.playClick();
    if (isTestingMic) {
      stopMicTest();
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: settings.selectedAudioDeviceId ? { exact: settings.selectedAudioDeviceId } : undefined,
          echoCancellation: settings.echoCancellation,
          noiseSuppression: settings.noiseSuppression,
          autoGainControl: settings.autoGainControl,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      testStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      setIsTestingMic(true);

      const checkVolume = () => {
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        const pct = Math.min(100, Math.round((avg / 110) * 100));
        setMicVolume(pct);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      animFrameRef.current = requestAnimationFrame(checkVolume);

      // Auto-stop test after 10 seconds to save battery/resources
      setTimeout(() => {
        stopMicTest();
      }, 10000);
    } catch (err) {
      console.warn('Microphone testing could not start:', err);
      stopMicTest();
    }
  };

  // Handle browser push notifications toggle & permission request
  const handleToggleBrowserNotifications = async () => {
    sound.playClick();
    if (!settings.browserNotifications) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            onUpdateSetting('browserNotifications', true);
            return;
          } else {
            onUpdateSetting('browserNotifications', false);
            return;
          }
        } else if (Notification.permission === 'granted') {
          onUpdateSetting('browserNotifications', true);
          return;
        } else if (Notification.permission === 'denied') {
          alert('Уведомления заблокированы в настройках вашего браузера. Разрешите их для bridgik.ru.');
          onUpdateSetting('browserNotifications', false);
          return;
        }
      }
    }
    onUpdateSetting('browserNotifications', !settings.browserNotifications);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={() => {
        stopMicTest();
        onClose();
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#1a1a1e] border border-white/[0.12] shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3.5 flex items-center justify-between border-b border-white/[0.06] bg-[#141417]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#789d2a]/20 border border-[#789d2a]/40 flex items-center justify-center text-[#9ac43e]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#ededed] leading-tight">
                Настройки
              </h2>
              <p className="text-xs text-[#888888]">
                Параметры соединения, звука и синхронизации
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopMicTest();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#9a9a9a] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Tab Navigation */}
        <div className="px-5 sm:px-6 flex items-center gap-2 sm:gap-4 border-b border-white/[0.08] bg-[#17171a] overflow-x-auto no-scrollbar py-2">
          <TabButton
            active={tab === 'general'}
            onClick={() => {
              sound.playClick();
              setTab('general');
            }}
            icon={<Sliders className="w-4 h-4" />}
            label="Общие"
          />
          <TabButton
            active={tab === 'bridge'}
            onClick={() => {
              sound.playClick();
              setTab('bridge');
            }}
            icon={<Share2 className="w-4 h-4" />}
            label="Мост и файлы"
          />
          <TabButton
            active={tab === 'room'}
            onClick={() => {
              sound.playClick();
              setTab('room');
            }}
            icon={<Mic className="w-4 h-4" />}
            label="Комната и звук"
          />
          <TabButton
            active={tab === 'notifications'}
            onClick={() => {
              sound.playClick();
              setTab('notifications');
            }}
            icon={<Bell className="w-4 h-4" />}
            label="Уведомления"
          />
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-3 divide-y divide-white/[0.07] [scrollbar-color:#383848_transparent] [scrollbar-width:thin]">
          {/* TAB 1: ОБЩИЕ */}
          {tab === 'general' && (
            <>
              <SettingToggleRow
                title="Звуки интерфейса"
                description="8-bit звуковые эффекты для кликов, отправки сообщений и завершения передачи"
                checked={settings.soundEnabled}
                onChange={() => {
                  const next = !settings.soundEnabled;
                  onUpdateSetting('soundEnabled', next);
                  if (next) sound.playMessage();
                }}
              />
              <SettingToggleRow
                title="Анимации интерфейса"
                description="Плавные эффекты сгорания, мерцания и переходы элементов"
                checked={settings.animationsEnabled}
                onChange={() => onUpdateSetting('animationsEnabled', !settings.animationsEnabled)}
              />
              <SettingToggleRow
                title="Браузерные Push-уведомления"
                description="Оповещать в фоне при завершении передачи файлов или звонке"
                checked={settings.browserNotifications}
                onChange={handleToggleBrowserNotifications}
              />
              <SettingToggleRow
                title="Контроль целостности файлов"
                description="Автоматическая проверка SHA-256 хеша переданных файлов без искажений"
                checked={settings.verifyFileIntegrity}
                onChange={() => onUpdateSetting('verifyFileIntegrity', !settings.verifyFileIntegrity)}
              />
            </>
          )}

          {/* TAB 2: МОСТ И ФАЙЛЫ */}
          {tab === 'bridge' && (
            <>
              <SettingToggleRow
                title="Автоскачивание файлов"
                description="Сразу сохранять входящие файлы в Мосте после получения без ручного клика"
                checked={settings.autoDownload}
                onChange={() => onUpdateSetting('autoDownload', !settings.autoDownload)}
              />
              <SettingToggleRow
                title="Видимость в Wi-Fi Радаре"
                description="Показывать ваше устройство другим пользователям в этой же локальной сети"
                checked={settings.radarVisible}
                onChange={() => onUpdateSetting('radarVisible', !settings.radarVisible)}
              />
              <SettingToggleRow
                title="Автоприём со своих устройств (Sticky Bridge)"
                description="Мгновенно подключаться к привязанным устройствам профиля без подтверждения"
                checked={settings.stickyAutoAccept}
                onChange={() => onUpdateSetting('stickyAutoAccept', !settings.stickyAutoAccept)}
              />
              <SettingToggleRow
                title="Запрос подтверждения для файлов > 100 МБ"
                description="Предупреждать перед началом приёма особо крупных файлов и архивов"
                checked={settings.confirmLargeFiles}
                onChange={() => onUpdateSetting('confirmLargeFiles', !settings.confirmLargeFiles)}
              />
            </>
          )}

          {/* TAB 3: КОМНАТА И ЗВУК */}
          {tab === 'room' && (
            <>
              {/* Microphone Device Selector & Live Volume Meter */}
              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-extrabold text-[#ededed] leading-snug flex items-center gap-2">
                      <Mic className="w-4 h-4 text-[#9ac43e]" />
                      <span>Микрофон для комнаты</span>
                    </p>
                    <p className="text-xs text-[#8e8e8e] leading-snug mt-0.5">
                      Устройство ввода голоса для онлайн-комнат и P2P-связи
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={startMicTest}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                      isTestingMic
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                        : 'bg-[#27272e] hover:bg-[#34343d] text-[#ededed] border-white/10'
                    }`}
                  >
                    {isTestingMic ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Тестирование...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[#9ac43e]" />
                        <span>Проверить звук</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Device Dropdown */}
                <select
                  value={settings.selectedAudioDeviceId}
                  onChange={(e) => {
                    sound.playClick();
                    onUpdateSetting('selectedAudioDeviceId', e.target.value);
                  }}
                  className="w-full bg-[#141418] border border-white/15 text-[#ededed] rounded-xl px-3 py-2 text-xs sm:text-sm font-mono focus:border-[#789d2a] focus:outline-none transition-colors"
                >
                  <option value="">По умолчанию системы</option>
                  {availableMics.map((mic, idx) => (
                    <option key={mic.deviceId || idx} value={mic.deviceId}>
                      {mic.label || `Микрофон ${idx + 1}`}
                    </option>
                  ))}
                </select>

                {/* Live Volume Meter when testing */}
                {isTestingMic && (
                  <div className="p-3 rounded-xl bg-[#121216] border border-amber-500/30 space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        Скажите что-нибудь в микрофон...
                      </span>
                      <span className="text-[#888888]">{micVolume}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#202026] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#789d2a] via-[#bbf348] to-amber-400 transition-all duration-75 rounded-full"
                        style={{ width: `${Math.max(5, micVolume)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <SettingToggleRow
                title="Шумоподавление"
                description="Аппаратная фильтрация шума вентиляторов, кликов клавиатуры и эха улицы"
                checked={settings.noiseSuppression}
                onChange={() => onUpdateSetting('noiseSuppression', !settings.noiseSuppression)}
              />
              <SettingToggleRow
                title="Эхоподавление"
                description="Устранение повторного захвата звука колонок в микрофон"
                checked={settings.echoCancellation}
                onChange={() => onUpdateSetting('echoCancellation', !settings.echoCancellation)}
              />
              <SettingToggleRow
                title="Автоматическая регулировка усиления (AGC)"
                description="Выравнивание громкости тихого шепота и громкого голоса"
                checked={settings.autoGainControl}
                onChange={() => onUpdateSetting('autoGainControl', !settings.autoGainControl)}
              />
              <SettingToggleRow
                title="Входить в комнату без звука"
                description="Микрофон будет выключен при первом подключении к голосовой комнате"
                checked={settings.muteMicOnJoin}
                onChange={() => onUpdateSetting('muteMicOnJoin', !settings.muteMicOnJoin)}
              />

              {/* Default Burn Timer Selector */}
              <div className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-base font-extrabold text-[#ededed] leading-snug flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Сгорающие сообщения по умолчанию</span>
                  </p>
                </div>
                <p className="text-xs text-[#8e8e8e] leading-snug">
                  Время самоуничтожения текстовых заметок со значком огня
                </p>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[5, 10, 30, 60].map((sec) => {
                    const isSelected = settings.defaultBurnTimer === sec;
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onUpdateSetting('defaultBurnTimer', sec);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border text-center ${
                          isSelected
                            ? 'bg-[#293816] text-[#bbf348] border-[#789d2a] shadow-sm'
                            : 'bg-[#18181c] text-[#999999] border-white/10 hover:text-white hover:bg-[#232328]'
                        }`}
                      >
                        {sec} сек {sec === 10 && '★'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* TAB 4: УВЕДОМЛЕНИЯ */}
          {tab === 'notifications' && (
            <>
              <SettingToggleRow
                title="Тосты участников в комнате"
                description="Показывать всплывающее уведомление, когда собеседник входит или покидает Комнату"
                checked={settings.participantToasts}
                onChange={() => onUpdateSetting('participantToasts', !settings.participantToasts)}
              />
              <SettingToggleRow
                title="Звук входящих сообщений"
                description="Короткий звуковой сигнал при получении нового сообщения в чате"
                checked={settings.chatSoundNotify}
                onChange={() => onUpdateSetting('chatSoundNotify', !settings.chatSoundNotify)}
              />
              <SettingToggleRow
                title="Скачивание файла в Telegram"
                description={
                  hasTelegramLinked
                    ? 'Бот @bridgik_bot пришлёт сообщение, когда получатель заберёт отправленный файл'
                    : 'Будет работать после привязки Telegram в профиле'
                }
                checked={settings.tgNotifyDownload}
                onChange={() => onUpdateSetting('tgNotifyDownload', !settings.tgNotifyDownload)}
              />
              <SettingToggleRow
                title="Статус устройств в Telegram"
                description="Оповещать в Telegram, когда ваш домашний ПК или телефон открыл Мост"
                checked={settings.tgNotifyDevice}
                onChange={() => onUpdateSetting('tgNotifyDevice', !settings.tgNotifyDevice)}
              />
            </>
          )}
        </div>

        {/* Footer Persistence Status Banner */}
        <div className="px-6 py-3.5 bg-[#121215] border-t border-white/[0.08] flex items-center justify-between gap-3 text-xs">
          {isAuthed ? (
            <div className="flex items-center gap-2 text-[#9ac43e]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#9ac43e]" />
              <span className="font-medium text-[#cccccc]">
                ✓ Настройки синхронизированы с вашим аккаунтом на сервере
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center gap-2 text-[#888888]">
                <Info className="w-4 h-4 shrink-0 text-[#aaaaaa]" />
                <span>Сохранено в браузере. Войдите для синхронизации между устройствами</span>
              </div>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                    onOpenAuth('yandex');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#789d2a] hover:bg-[#8bb532] text-white font-bold text-[11px] shrink-0 cursor-pointer transition-colors"
                >
                  Войти
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap outline-none ${
        active
          ? 'bg-[#283818] text-[#c0e078] border border-[#789d2a]/60 shadow-sm'
          : 'text-[#888888] hover:text-[#cccccc] hover:bg-white/[0.04]'
      }`}
    >
      <span className={active ? 'text-[#9ac43e]' : 'text-[#777777]'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SettingToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-base font-extrabold text-[#ededed] leading-snug">{title}</p>
        <p className="text-xs sm:text-sm text-[#8e8e8e] leading-snug mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => {
          sound.playClick();
          onChange();
        }}
        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 flex items-center ${
          checked ? 'bg-[#789d2a]' : 'bg-[#3e3e44]'
        }`}
      >
        <span
          className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
