import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  UploadCloud,
  Download,
  Trash2,
  Radio,
  Crown,
} from 'lucide-react';
import { DropDto, BridgikNotificationItem, NotificationCategory } from '../types/index.js';
import { formatBytes } from '../utils/device.js';
import { sound } from '../utils/sound.js';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  pendingDrops: DropDto[];
  notifications: BridgikNotificationItem[];
  onDownloadDrop: (drop: DropDto) => void;
  onDeleteDrop: (dropId: string) => void;
  onDownloadAllDrops: () => void;
  onClearAllDrops: () => void;
  onClearAllNotifications: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  pendingDrops,
  notifications,
  onDownloadDrop,
  onDeleteDrop,
  onDownloadAllDrops,
  onClearAllDrops,
  onClearAllNotifications,
}) => {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Combine pending drops into items if viewing 'all' or 'files'
  const dropItems: BridgikNotificationItem[] = pendingDrops.map((d) => ({
    id: `drop_${d.id}`,
    category: 'files',
    title: d.fileName,
    message: `${formatBytes(d.fileSize)} от ${d.senderName || 'Гость'}`,
    timestamp: d.expiresAt ? d.expiresAt - 24 * 60 * 60 * 1000 : Date.now(),
    drop: d,
  }));

  const allCombinedItems = [...dropItems, ...notifications.filter((n) => !n.drop)];

  // Filter by category
  const filteredItems =
    activeCategory === 'all'
      ? allCombinedItems
      : activeCategory === 'files'
      ? allCombinedItems.filter((i) => i.category === 'files')
      : activeCategory === 'bridge'
      ? allCombinedItems.filter((i) => i.category === 'bridge')
      : allCombinedItems.filter((i) => i.category === 'system');

  const filesCount = pendingDrops.length;
  const bridgeCount = notifications.filter((n) => n.category === 'bridge').length;
  const systemCount = notifications.filter((n) => n.category === 'system').length;

  const categories: { id: NotificationCategory; label: string; count?: number }[] = [
    { id: 'all', label: 'Все', count: allCombinedItems.length },
    { id: 'files', label: 'Файлы', count: filesCount },
    { id: 'bridge', label: 'Мост', count: bridgeCount },
    { id: 'system', label: 'Система', count: systemCount },
  ];

  const formatTime = (ts: number) => {
    if (!ts) return '';
    const diff = Date.now() - ts;
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      ref={dropdownRef}
      className="fixed top-16 left-3 right-3 sm:left-auto sm:right-0 sm:absolute sm:top-14 z-50 w-auto sm:w-[410px] rounded-2xl bg-[#161616] border border-white/[0.08] shadow-[0_16px_50px_rgba(0,0,0,0.85)] backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#283216] border border-[#789d2a]/50 flex items-center justify-center text-[#bbf348]">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-extrabold text-base text-white">Уведомления</h3>
          {allCombinedItems.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#242424] text-[11px] font-mono font-bold text-[#888888]">
              {allCombinedItems.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {pendingDrops.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sound.playConnect();
                onDownloadAllDrops();
              }}
              className="px-2.5 py-1 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-black font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm shadow-[#789d2a]/20"
              title="Скачать все входящие файлы"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Скачать все ({pendingDrops.length})</span>
            </button>
          )}

          {allCombinedItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (pendingDrops.length > 0) onClearAllDrops();
                onClearAllNotifications();
              }}
              className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] text-[#888888] hover:text-[#ef9282] transition-colors cursor-pointer"
              title="Очистить все уведомления"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="px-3.5 py-2.5 border-b border-white/[0.04] bg-[#121212]/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveCategory(cat.id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 outline-none ${
                isActive
                  ? 'bg-[#283216] text-[#bbf348] border border-[#789d2a]/70 shadow-sm shadow-[#789d2a]/20'
                  : 'bg-[#1f1f1f] text-[#888888] hover:text-[#cccccc] hover:bg-[#262626] border border-transparent'
              }`}
            >
              <span>{cat.label}</span>
              {typeof cat.count === 'number' && cat.count > 0 && (
                <span
                  className={`text-[10px] px-1 rounded-full ${
                    isActive ? 'bg-[#789d2a]/30 text-white' : 'bg-[#2a2a2a] text-[#888888]'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto divide-y divide-white/[0.04]">
        {filteredItems.length === 0 ? (
          <div className="py-12 px-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#1e1e1e] text-[#555555] flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-sm font-bold text-[#888888]">Пока уведомлений нет</p>
            <p className="text-xs text-[#555555] max-w-xs mx-auto">
              Здесь будут появляться входящие файлы Drop & Go, события связанных устройств и системные сообщения.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isFile = item.category === 'files' && item.drop;
            const drop = item.drop;

            return (
              <div
                key={item.id}
                className="p-3.5 hover:bg-white/[0.02] transition-colors flex items-start gap-3 group"
              >
                {/* Category Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.category === 'files'
                      ? 'bg-[#283216] text-[#bbf348] border border-[#789d2a]/50'
                      : item.category === 'bridge'
                      ? 'bg-[#14232e] text-[#38bdf8] border border-[#38bdf8]/40'
                      : 'bg-[#2a2212] text-[#f59e0b] border border-[#f59e0b]/40'
                  }`}
                >
                  {item.category === 'files' ? (
                    <UploadCloud className="w-4 h-4" />
                  ) : item.category === 'bridge' ? (
                    <Radio className="w-4 h-4" />
                  ) : (
                    <Crown className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-extrabold text-xs sm:text-sm text-white truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] font-mono text-[#666666] shrink-0">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>

                  {item.message && (
                    <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  )}

                  {/* Actions for File Drop */}
                  {isFile && drop && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playConnect();
                          onDownloadDrop(drop);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#283216] hover:bg-[#789d2a] text-[#bbf348] hover:text-black border border-[#789d2a]/60 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Скачать</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onDeleteDrop(drop.id);
                        }}
                        className="p-1 rounded-lg text-[#666666] hover:text-[#ef9282] hover:bg-white/[0.05] transition-colors cursor-pointer"
                        title="Удалить файл из буфера"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      {filteredItems.length > 0 && (
        <div className="px-3.5 py-2 border-t border-white/[0.04] bg-[#121212]/30 flex items-center justify-between text-[11px] text-[#666666]">
          <span>Bridgik Inbox & Drop</span>
          <span>Буфер хранится до 24 часов</span>
        </div>
      )}
    </div>
  );
};
