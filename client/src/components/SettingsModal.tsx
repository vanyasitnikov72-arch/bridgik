import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { sound } from '../utils/sound.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoDownload: boolean;
  onToggleAutoDownload: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  radarVisible: boolean;
  onToggleRadarVisible: () => void;
  stickyAutoAccept: boolean;
  onToggleStickyAutoAccept: () => void;
  participantToasts: boolean;
  onToggleParticipantToasts: () => void;
  tgNotifyDownload: boolean;
  onToggleTgNotifyDownload: () => void;
  tgNotifyDevice: boolean;
  onToggleTgNotifyDevice: () => void;
  hasTelegramLinked: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  autoDownload,
  onToggleAutoDownload,
  soundEnabled,
  onToggleSound,
  radarVisible,
  onToggleRadarVisible,
  stickyAutoAccept,
  onToggleStickyAutoAccept,
  participantToasts,
  onToggleParticipantToasts,
  tgNotifyDownload,
  onToggleTgNotifyDownload,
  tgNotifyDevice,
  onToggleTgNotifyDevice,
  hasTelegramLinked,
}) => {
  const [tab, setTab] = useState<'general' | 'notifications'>('general');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#1e1e1e] border border-white/[0.1] shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#ededed]">Настройки</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9a9a9a] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* eblo.id-style underline tabs */}
        <div className="px-6 flex items-center gap-6 border-b border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTab('general');
            }}
            className={`pb-3 text-base font-extrabold transition-colors cursor-pointer border-b-2 outline-none ${
              tab === 'general'
                ? 'text-[#ededed] border-[#789d2a]'
                : 'text-[#888888] border-transparent hover:text-[#cccccc]'
            }`}
          >
            Мост и приватность
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTab('notifications');
            }}
            className={`pb-3 text-base font-extrabold transition-colors cursor-pointer border-b-2 outline-none ${
              tab === 'notifications'
                ? 'text-[#ededed] border-[#789d2a]'
                : 'text-[#888888] border-transparent hover:text-[#cccccc]'
            }`}
          >
            Уведомления
          </button>
        </div>

        {/* Rows with hairline dividers */}
        <div className="px-6 py-2 divide-y divide-white/[0.07]">
          {tab === 'general' ? (
            <>
              <SettingToggleRow
                title="Звуки интерфейса"
                description="Короткий 8-bit звук для сообщений и завершения передачи"
                checked={soundEnabled}
                onChange={onToggleSound}
              />
              <SettingToggleRow
                title="Автоскачивание файлов"
                description="Сразу сохранять входящие файлы в Мосте после получения"
                checked={autoDownload}
                onChange={onToggleAutoDownload}
              />
              <SettingToggleRow
                title="Видимость в Wi-Fi Радаре"
                description="Показывать ваше устройство другим в этой же локальной сети"
                checked={radarVisible}
                onChange={onToggleRadarVisible}
              />
              <SettingToggleRow
                title="Автоприём Sticky Bridge"
                description="Подключаться к привязанным устройствам без лишнего запроса"
                checked={stickyAutoAccept}
                onChange={onToggleStickyAutoAccept}
              />
            </>
          ) : (
            <>
              <SettingToggleRow
                title="Тосты входа и выхода"
                description="Показывать уведомление, когда участник заходит или покидает Комнату"
                checked={participantToasts}
                onChange={onToggleParticipantToasts}
              />
              <SettingToggleRow
                title="Скачивание файла в Telegram"
                description={
                  hasTelegramLinked
                    ? 'Бот @bridgik_bot напишет, когда получатель заберёт файл'
                    : 'Будет работать после привязки Telegram в профиле'
                }
                checked={tgNotifyDownload}
                onChange={onToggleTgNotifyDownload}
              />
              <SettingToggleRow
                title="Статус моих устройств"
                description="Оповещать в Telegram, когда ваш ПК или телефон открыл Мост"
                checked={tgNotifyDevice}
                onChange={onToggleTgNotifyDevice}
              />
            </>
          )}
        </div>

        <div className="h-3" />
      </div>
    </div>
  );
};

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
        <p className="text-sm text-[#8e8e8e] leading-snug mt-0.5">{description}</p>
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
          checked ? 'bg-[#789d2a]' : 'bg-[#464646]'
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