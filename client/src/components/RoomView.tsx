import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Share2,
  QrCode,
  LogOut,
  File,
  Download,
  Check,
  Copy,
  ExternalLink,
  Users,
  X,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  HardDrive,
  FolderDown,
  Folder,
  Eye,
  CheckSquare,
  Square,
  Package,
} from 'lucide-react';
import { FileTransfer, Peer, TextMessage } from '../types/index.js';
import { formatBytes, formatSpeed, getAvatarForName } from '../utils/device.js';
import { extractFilesFromDataTransfer } from '../utils/files.js';
import { createZipFromBlobUrls } from '../utils/zip.js';
import { sound } from '../utils/sound.js';
import { CustomAudioPlayer } from './CustomAudioPlayer.js';
import { CustomVideoPlayer } from './CustomVideoPlayer.js';

interface RoomViewProps {
  roomId: string;
  pin: string;
  myPeerId: string;
  userAvatar?: string;
  isAdmin?: boolean;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  statusEmote?: string | null;
  roomUrl: string;
  peers: Peer[];
  peerConnectionTypes?: Record<string, 'direct' | 'relay'>;
  transfers: FileTransfer[];
  messages: TextMessage[];
  onSendFiles: (files: FileList | File[]) => void;
  onSendText: (text: string, isClipboard?: boolean) => void;
  onCancelTransfer: (transferId: string) => void;
  onAcceptFile: (fileId: string) => void;
  onRejectFile: (fileId: string) => void;
  onLeaveRoom: () => void;
  onOpenQR: () => void;
  onToggleMic: () => Promise<boolean>;
  onToggleScreen: () => Promise<boolean>;
  remoteVideoRef?: React.RefObject<HTMLVideoElement | null>;
  isMicActive: boolean;
  isScreenActive: boolean;
  hasRemoteVideo: boolean;
  autoDownload: boolean;
  onToggleAutoDownload: () => void;
  destinationDirName: string | null;
  onPickDestinationDir: () => void;
  onClearDestinationDir: () => void;
  pendingSharedFiles?: File[];
  pendingSharedText?: string;
  onSendSharedBundle?: () => void;
  onDismissSharedBundle?: () => void;
}

export const RoomView: React.FC<RoomViewProps> = ({
  roomId: _roomId,
  pin,
  myPeerId,
  userAvatar,
  isAdmin,
  adminFrame: _adminFrame = 'gold',
  statusEmote,
  roomUrl,
  peers,
  peerConnectionTypes,
  transfers,
  messages,
  onSendFiles,
  onSendText,
  onCancelTransfer,
  onAcceptFile,
  onRejectFile,
  onLeaveRoom,
  onOpenQR,
  onToggleMic: _onToggleMic,
  onToggleScreen: _onToggleScreen,
  remoteVideoRef: _remoteVideoRef,
  isMicActive: _isMicActive,
  isScreenActive: _isScreenActive,
  hasRemoteVideo: _hasRemoteVideo,
  autoDownload,
  onToggleAutoDownload,
  destinationDirName,
  onPickDestinationDir,
  onClearDestinationDir,
  pendingSharedFiles,
  pendingSharedText,
  onSendSharedBundle,
  onDismissSharedBundle,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    name: string;
    type: 'image' | 'video' | 'audio';
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const transferTimingRef = useRef<
    Record<string, { start: number; durationSec?: number; avgSpeed?: number }>
  >({});

  const isIOS =
    typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const supportsNativeShare =
    typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function';

  const hasActiveTransfer = transfers.some((t) => t.status === 'transferring');

  const downloadableTransfers = transfers.filter(
    (t) => t.status === 'completed' && !t.savedToDisk && Boolean(t.blobUrl)
  );

  // Screen Wake Lock + accidental tab close protection
  useEffect(() => {
    if (!hasActiveTransfer) return;

    let wakeLockSentinel: any = null;
    let isCancelled = false;

    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      (navigator as any).wakeLock
        .request('screen')
        .then((sentinel: any) => {
          if (isCancelled) {
            sentinel?.release?.().catch(() => {});
          } else {
            wakeLockSentinel = sentinel;
          }
        })
        .catch(() => {});
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isCancelled = true;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (wakeLockSentinel) {
        wakeLockSentinel.release?.().catch(() => {});
      }
    };
  }, [hasActiveTransfer]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);

      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        onSendFiles(e.clipboardData.files);
        sound.playMessage();
        setToastMessage(`Вставлен файл из буфера: ${e.clipboardData.files[0].name}`);
        return;
      }

      if (!isInput && e.clipboardData) {
        const text = e.clipboardData.getData('text');
        if (text && text.trim()) {
          e.preventDefault();
          onSendText(text.trim(), true);
          sound.playMessage();
          setToastMessage('Текст отправлен собеседнику (Ctrl+V)');
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [onSendFiles, onSendText]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    sound.playClick();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = async () => {
    if (supportsNativeShare) {
      try {
        await (navigator as any).share({
          title: `Bridgik · Код ${pin}`,
          text: `Подключайся ко мне в Bridgik для прямой передачи файлов (код ${pin}):`,
          url: roomUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    handleCopyLink();
  };

  const handleDownloadAllZip = async () => {
    if (downloadableTransfers.length === 0 || isZipping) return;
    setIsZipping(true);
    try {
      const zipBlob = await createZipFromBlobUrls(
        downloadableTransfers.map((t) => ({ name: t.name, blobUrl: t.blobUrl! }))
      );
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bridgik-files-${pin}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      sound.playTransferComplete();
      setToastMessage(`Архив bridgik-files-${pin}.zip готов`);
    } catch (err) {
      console.error('ZIP creation failed:', err);
      setToastMessage('Не удалось собрать ZIP-архив');
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onSendText(textInput.trim());
      setTextInput('');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        onSendText(text.trim(), true);
        sound.playMessage();
        setToastMessage('Вставлено из буфера обмена');
      } else {
        setToastMessage('Буфер обмена пуст');
      }
    } catch (e) {
      console.warn('Clipboard read permission denied', e);
      setToastMessage('Разрешите доступ к буферу обмена в браузере');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      try {
        const extracted = await extractFilesFromDataTransfer(e.dataTransfer.items);
        if (extracted.length > 0) {
          onSendFiles(extracted);
          setToastMessage(`Загружено файлов: ${extracted.length}`);
          return;
        }
      } catch (err) {
        console.warn('Folder recursive read fallback', err);
      }
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onSendFiles(e.dataTransfer.files);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-[#9ac43e]" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-[#5192ec]" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-[#e8b33c]" />;
    if (mimeType.includes('pdf') || mimeType.includes('text'))
      return <FileText className="w-5 h-5 text-[#aaaaaa]" />;
    return <File className="w-5 h-5 text-[#999999]" />;
  };

  const isUrl = (text: string) => {
    return text.startsWith('http://') || text.startsWith('https://');
  };

  const otherPeers = peers.filter((p) => p.id !== myPeerId);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Top Bar */}
      <div className="bg-[#222222] border border-[#3a3a3a] rounded-xl p-3.5 sm:p-5 mb-5 sm:mb-6 flex flex-col gap-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="flex items-center gap-2 bg-[#171717] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-[#3a3a3a]">
              <span className="text-xs sm:text-sm text-[#999999] uppercase font-bold tracking-wider">
                PIN:
              </span>
              <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-wider text-[#9ac43e]">
                {pin}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base text-[#ededed]">
              <Users className="w-4 h-4 text-[#9ac43e] shrink-0" />
              <span className="font-semibold">
                {otherPeers.length === 0
                  ? 'Ожидание участников...'
                  : `${peers.length} устройств(а) в сети`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={onToggleAutoDownload}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                autoDownload
                  ? 'bg-[#1c2214] border-[#789d2a] text-[#9ac43e]'
                  : 'bg-[#2d2d2d] border-[#3a3a3a] text-[#aaaaaa] hover:text-[#ededed]'
              }`}
              title={
                autoDownload
                  ? 'Автосохранение включено: полученные файлы скачиваются сразу'
                  : 'Автосохранение выключено: файлы скачиваются вручную'
              }
            >
              {autoDownload ? (
                <CheckSquare className="w-4 h-4 text-[#9ac43e] shrink-0" />
              ) : (
                <Square className="w-4 h-4 shrink-0" />
              )}
              <span className="sm:hidden">{autoDownload ? 'Авто: ВКЛ' : 'Авто: ВЫКЛ'}</span>
              <span className="hidden sm:inline">
                {autoDownload ? 'Автосохранение' : 'Автосохранение: ВЫКЛ'}
              </span>
            </button>

            {typeof window !== 'undefined' &&
              'showDirectoryPicker' in window &&
              (destinationDirName ? (
                <div className="flex items-center gap-1.5 bg-[#1c2214] border border-[#789d2a] rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[#9ac43e]">
                  <FolderDown className="w-4 h-4 text-[#9ac43e] shrink-0" />
                  <span
                    className="font-bold max-w-[110px] sm:max-w-[130px] truncate"
                    title={`Папка на диске: ${destinationDirName}`}
                  >
                    Папка: {destinationDirName}
                  </span>
                  <button
                    onClick={onClearDestinationDir}
                    className="p-0.5 hover:text-white transition-colors cursor-pointer"
                    title="Сбросить выбранную папку"
                  >
                    <X className="w-3.5 h-3.5 text-[#aaaaaa] hover:text-[#ef9282]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onPickDestinationDir}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3a3a3a]"
                  title="Выберите папку на диске для автоматического сохранения"
                >
                  <FolderDown className="w-4 h-4 text-[#9ac43e]" />
                  <span className="hidden sm:inline">Папка на диске</span>
                </button>
              ))}

            <button
              onClick={onOpenQR}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#9ac43e]" />
              <span className="sm:hidden">QR</span>
              <span className="hidden sm:inline">QR-код</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-[#9ac43e]" />
                  <span className="text-[#9ac43e]">Скопировано</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Ссылка</span>
                </>
              )}
            </button>

            <button
              onClick={onLeaveRoom}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#ef9282]/15 hover:text-[#ef9282] border border-transparent hover:border-[#ef9282]/30 text-[#aaaaaa] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Закрыть комнату и очистить память"
            >
              <LogOut className="w-4 h-4" />
              <span>Выйти</span>
            </button>
          </div>
        </div>

        {peers.length > 0 && (
          <div className="flex items-center gap-2 pt-2.5 sm:pt-3 border-t border-[#3a3a3a] w-full flex-wrap text-xs sm:text-sm">
            <span className="text-[#999999] font-semibold mr-1">Устройства в комнате:</span>
            {peers.map((p) => {
              const isMe = p.id === myPeerId;
              const connType = peerConnectionTypes?.[p.id] || 'direct';
              return (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border font-bold ${
                    isMe
                      ? 'bg-[#171717] text-[#ededed] border-[#3a3a3a]'
                      : 'bg-[#2d2d2d] text-[#ededed] border-[#3a3a3a]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#789d2a]" />
                  <span>{p.name}</span>
                  {!isMe && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1 ${
                        connType === 'relay'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {connType === 'relay' ? '🛡️ TURN Relay' : '⚡ Прямой P2P'}
                    </span>
                  )}
                  {isMe && <span className="text-xs text-[#999999] font-normal">(Вы)</span>}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Share Target Banner */}
      {((pendingSharedFiles && pendingSharedFiles.length > 0) || pendingSharedText) && (
        <div className="mb-5 p-4 rounded-xl bg-[#1c2214] border-2 border-[#789d2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="text-sm text-[#ededed] min-w-0">
            <p className="font-bold text-[#bbf348]">
              Готово к отправке из системного меню «Поделиться»:
            </p>
            <p className="text-xs sm:text-sm text-[#cccccc] truncate">
              {pendingSharedFiles && pendingSharedFiles.length > 0
                ? `Файлов: ${pendingSharedFiles.length} (${pendingSharedFiles
                    .map((f) => f.name)
                    .join(', ')})`
                : pendingSharedText}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onSendSharedBundle}
              disabled={otherPeers.length === 0}
              className="px-4 py-2 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] disabled:opacity-50 text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              {otherPeers.length === 0 ? 'Ждём собеседника...' : 'Отправить сейчас'}
            </button>
            <button
              type="button"
              onClick={onDismissSharedBundle}
              className="px-3 py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#aaaaaa] text-xs sm:text-sm font-bold cursor-pointer"
            >
              Скрыть
            </button>
          </div>
        </div>
      )}

      {/* Waiting for peer banner */}
      {otherPeers.length === 0 && (
        <div className="mb-5 sm:mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1d2616] via-[#202020] to-[#1a1a1a] border border-[#789d2a]/50 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5 shadow-lg">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#789d2a] animate-ping shrink-0 mt-1.5" />
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base sm:text-lg font-bold text-[#ededed]">
                  Ожидание второго устройства...
                </p>
                <span className="px-2.5 py-0.5 rounded-md bg-[#141414] border border-[#789d2a]/50 text-amber-300 font-mono text-sm sm:text-base font-black tracking-widest shadow-inner">
                  КОД: {pin}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#aaaaaa] leading-relaxed">
                <span className="hidden sm:inline">
                  Наведите камеру смартфона на QR справа, продиктуйте 4-значный код или отправьте ссылку.
                </span>
                <span className="sm:hidden">
                  Продиктуйте 4-значный код, отправьте ссылку или покажите QR-код ниже.
                </span>
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {supportsNativeShare && (
                  <button
                    onClick={handleNativeShare}
                    className="sm:hidden px-3.5 py-1.5 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Поделиться</span>
                  </button>
                )}
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-lg bg-[#272727] hover:bg-[#333333] border border-[#3a3a3a] text-xs font-bold text-[#ededed] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedLink ? 'Ссылка скопирована' : 'Скопировать ссылку'}</span>
                </button>
                <button
                  onClick={onOpenQR}
                  className="hidden sm:flex px-3.5 py-1.5 rounded-lg bg-[#272727] hover:bg-[#333333] border border-[#3a3a3a] text-xs font-bold text-[#9ac43e] hover:text-[#bbf348] items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Увеличить QR</span>
                </button>
              </div>
            </div>
          </div>

          <div
            onClick={onOpenQR}
            className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0 border-2 border-white/20 group"
            title="Кликните, чтобы развернуть во весь экран"
          >
            <QRCodeSVG value={roomUrl} size={84} level="M" />
            <span className="text-[10px] text-gray-800 font-bold tracking-tight select-none group-hover:text-[#789d2a]">
              <span className="hidden sm:inline">Навести камеру</span>
              <span className="sm:hidden">Увеличить QR</span>
            </span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-7 space-y-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-xl border transition-all p-5 sm:p-8 text-center select-none shadow-md ${
              isDragging
                ? 'border-[#789d2a] bg-[#1c2214] ring-2 ring-[#789d2a]/30'
                : 'border-[#3a3a3a] bg-[#202020] hover:border-[#4a4a4a]'
            }`}
          >
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files) {
                  onSendFiles(e.target.files);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
            <input
              type="file"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
              ref={folderInputRef}
              onChange={(e) => {
                if (e.target.files) {
                  onSendFiles(e.target.files);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />

            <div className="hidden sm:flex items-center justify-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#171717] border border-[#3a3a3a] text-sm">
                <kbd className="px-2 py-0.5 rounded bg-[#2a2a2a] text-[#ededed] font-mono font-bold border border-[#444444] text-xs shadow-inner">
                  Ctrl
                </kbd>
                <span className="text-[#999999] font-bold">+</span>
                <kbd className="px-2 py-0.5 rounded bg-[#2a2a2a] text-[#ededed] font-mono font-bold border border-[#444444] text-xs shadow-inner">
                  V
                </kbd>
                <span className="text-[#9ac43e] font-bold ml-1 text-sm sm:text-base">
                  вставить в любом месте
                </span>
              </div>
            </div>

            <h3 className="text-xl sm:text-3xl font-extrabold text-[#ededed] mb-2 tracking-tight">
              Передача файлов и папок
            </h3>

            <p className="hidden sm:block text-base sm:text-lg text-[#ededed] max-w-lg mx-auto mb-6 leading-relaxed">
              Нажмите{' '}
              <strong className="text-white bg-[#171717] px-2 py-0.5 rounded border border-[#3a3a3a]">
                Ctrl + V
              </strong>{' '}
              для мгновенной отправки скриншота или файла, перетащите мышкой в окно или выберите вручную:
            </p>
            <p className="sm:hidden text-sm text-[#cccccc] max-w-md mx-auto mb-5 leading-relaxed">
              Выберите фото, видео или файлы с устройства — они передадутся напрямую без сжатия:
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-sm sm:text-base flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <File className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Выбрать файлы</span>
              </button>

              {!isIOS && (
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="px-4 sm:px-5 py-2.5 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-bold text-sm sm:text-base flex items-center gap-2 transition-colors cursor-pointer border border-[#3a3a3a]"
                >
                  <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-[#9ac43e]" />
                  <span>Выбрать папку</span>
                </button>
              )}

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="px-4 sm:px-5 py-2.5 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-bold text-sm sm:text-base flex items-center gap-2 transition-colors cursor-pointer border border-[#3a3a3a]"
                title="Вставить из буфера обмена (Ctrl + V)"
              >
                <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-[#aaaaaa]" />
                <span>Из буфера</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-4 mt-5 sm:mt-6 border-t border-[#3a3a3a]/60 text-xs sm:text-base text-[#aaaaaa]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#789d2a]" />
                Прямой WebRTC канал
              </span>
              <span className="text-[#555555]">·</span>
              <span>Без ограничений по размеру</span>
              <span className="text-[#555555]">·</span>
              <span className="hidden sm:inline">Drag & Drop в любую область</span>
              <span className="sm:hidden">Без сжатия качества</span>
            </div>
          </div>

          {transfers.length > 0 && (
            <div className="bg-[#222222] border border-[#3a3a3a] rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 sm:mb-4">
                <h4 className="text-base sm:text-xl font-bold text-[#ededed]">
                  Передачи файлов ({transfers.length})
                </h4>

                {downloadableTransfers.length >= 2 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isZipping}
                    className="px-3.5 py-1.5 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] disabled:opacity-60 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Package className="w-4 h-4" />
                    <span>
                      {isZipping
                        ? 'Собираем ZIP...'
                        : `Скачать всё ZIP (${downloadableTransfers.length})`}
                    </span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {transfers.map((t) => {
                  const timing = transferTimingRef.current[t.id];
                  if (t.status === 'transferring' && !timing) {
                    transferTimingRef.current[t.id] = { start: Date.now() };
                  } else if (
                    t.status === 'completed' &&
                    timing &&
                    timing.durationSec === undefined
                  ) {
                    const durationSec = Math.max(0.1, (Date.now() - timing.start) / 1000);
                    timing.durationSec = durationSec;
                    timing.avgSpeed = t.size > 0 ? t.size / durationSec : 0;
                  }
                  const completedTiming = transferTimingRef.current[t.id];

                  const isImage =
                    t.mimeType.startsWith('image/') ||
                    /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(t.name);
                  const isVideo =
                    t.mimeType.startsWith('video/') ||
                    /\.(mp4|webm|mov|mkv|avi)$/i.test(t.name);
                  const isAudio =
                    t.mimeType.startsWith('audio/') ||
                    /\.(mp3|wav|ogg|m4a|aac)$/i.test(t.name);

                  return (
                    <div
                      key={t.id}
                      className="p-3.5 sm:p-4 rounded-lg bg-[#171717] border border-[#3a3a3a] flex flex-col gap-3 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {isImage && t.blobUrl ? (
                            <div className="relative group shrink-0">
                              <img
                                src={t.blobUrl}
                                alt={t.name}
                                onClick={() => {
                                  setPreviewMedia({ url: t.blobUrl!, name: t.name, type: 'image' });
                                }}
                                className="w-12 h-12 sm:w-13 sm:h-13 object-cover rounded-lg border border-[#3a3a3a] cursor-pointer group-hover:border-[#789d2a] transition-all"
                                title="Нажмите для просмотра в полном размере"
                              />
                              <div
                                onClick={() => {
                                  setPreviewMedia({ url: t.blobUrl!, name: t.name, type: 'image' });
                                }}
                                className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </div>
                            </div>
                          ) : isVideo && t.blobUrl ? (
                            <div
                              onClick={() => {
                                setPreviewMedia({ url: t.blobUrl!, name: t.name, type: 'video' });
                              }}
                              className="relative group shrink-0 w-12 h-12 sm:w-13 sm:h-13 rounded-lg bg-[#151522] border border-[#3a3a3a] group-hover:border-[#789d2a] flex items-center justify-center cursor-pointer transition-all"
                              title="Нажмите для предпросмотра видео"
                            >
                              <Video className="w-6 h-6 text-[#9ac43e]" />
                              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye className="w-4 h-4" />
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-[#222222] border border-[#3a3a3a] shrink-0">
                              {getFileIcon(t.mimeType)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-sm sm:text-lg font-bold text-[#ededed] truncate max-w-[160px] sm:max-w-md">
                              {t.name}
                            </p>
                            <p className="text-xs sm:text-sm text-[#aaaaaa] flex items-center flex-wrap gap-1.5 sm:gap-2 mt-0.5">
                              <span>{formatBytes(t.size)}</span>
                              <span>•</span>
                              <span
                                className={
                                  t.type === 'upload'
                                    ? 'text-[#9ac43e] font-semibold'
                                    : 'text-[#ededed]'
                                }
                              >
                                {t.type === 'upload' ? 'Отправка' : 'Получение'}
                              </span>
                              {t.status === 'transferring' && t.speed > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-[#9ac43e] font-bold">
                                    {formatSpeed(t.speed)}
                                  </span>
                                </>
                              )}
                              {t.status === 'completed' &&
                                completedTiming?.durationSec !== undefined &&
                                (completedTiming.avgSpeed || 0) > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-[#9ac43e] text-xs">
                                      {completedTiming.durationSec.toFixed(1)} сек ·{' '}
                                      {formatSpeed(completedTiming.avgSpeed!)}
                                    </span>
                                  </>
                                )}
                              {!t.savedToDisk && t.size > 1024 * 1024 * 1024 && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-400 font-mono text-xs">
                                    Память браузера
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          {t.status === 'completed' && t.savedToDisk && (
                            <span className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#789d2a]/15 border border-[#789d2a]/40 text-[#9ac43e] text-xs sm:text-sm font-bold flex items-center gap-1.5">
                              <Check className="w-4 h-4" />
                              <span className="hidden sm:inline">Сохранено на диск</span>
                            </span>
                          )}

                          {t.blobUrl && (isImage || isVideo || isAudio) && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewMedia({
                                  url: t.blobUrl!,
                                  name: t.name,
                                  type: isImage ? 'image' : isVideo ? 'video' : 'audio',
                                })
                              }
                              className="p-2 rounded-lg bg-[#222222] hover:bg-[#2d2d2d] text-[#aaaaaa] hover:text-[#9ac43e] border border-[#3a3a3a] transition-colors cursor-pointer"
                              title="Предпросмотр"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {t.status === 'completed' && !t.savedToDisk && t.blobUrl && (
                            <a
                              href={t.blobUrl}
                              download={t.name}
                              className="px-3 sm:px-4 py-2 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <Download className="w-4 h-4" />
                              <span className="hidden sm:inline">Скачать</span>
                            </a>
                          )}

                          {t.status === 'transferring' && (
                            <button
                              onClick={() => onCancelTransfer(t.id)}
                              className="p-2 rounded-lg hover:bg-[#2d2d2d] text-[#aaaaaa] hover:text-[#ef9282] transition-colors cursor-pointer"
                              title="Отменить"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          {t.status === 'error' && (
                            <span className="text-xs sm:text-sm text-[#ef9282] flex items-center gap-1 font-semibold">
                              <AlertCircle className="w-4 h-4" />
                              <span>{t.error || 'Ошибка'}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {isAudio && t.blobUrl && (
                        <div className="mt-1 pt-2 border-t border-[#222222]">
                          <CustomAudioPlayer src={t.blobUrl} compact title={t.name} />
                        </div>
                      )}

                      {t.status === 'pending_approval' && (
                        <div className="mt-1 p-3.5 rounded-lg bg-[#222222] border border-[#3a3a3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#ededed]">
                            <HardDrive className="w-5 h-5 text-[#9ac43e] shrink-0" />
                            <span>
                              Большой файл. Выберите место сохранения на диске без расхода RAM.
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => onAcceptFile(t.id)}
                              className="px-3.5 py-2 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <FolderDown className="w-4 h-4" />
                              <span>Принять</span>
                            </button>
                            <button
                              onClick={() => onRejectFile(t.id)}
                              className="px-3 py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                            >
                              Отклонить
                            </button>
                          </div>
                        </div>
                      )}

                      {t.status === 'waiting_receiver' && (
                        <div className="mt-1 text-xs sm:text-sm text-[#9ac43e] flex items-center gap-2 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#789d2a] animate-pulse shrink-0" />
                          <span>Ожидание: получатель подтверждает сохранение...</span>
                        </div>
                      )}

                      {t.status === 'transferring' && (
                        <div className="w-full bg-[#222222] rounded-full h-2 overflow-hidden border border-[#3a3a3a]/40">
                          <div
                            className="bg-[#789d2a] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Clipboard & Text */}
        <div className="lg:col-span-5 flex flex-col h-[460px] lg:h-[580px] bg-[#222222] border border-[#3a3a3a] rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
            <div className="min-w-0">
              <h4 className="text-base sm:text-lg font-bold text-[#ededed] truncate">
                Мгновенный буфер и текст
              </h4>
              <p className="text-xs sm:text-sm text-[#aaaaaa] truncate">
                Ссылки, пароли, заметки в 1 клик
              </p>
            </div>
            <button
              onClick={handlePasteFromClipboard}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3a3a3a] shrink-0"
              title="Вставить из системного буфера"
            >
              <Copy className="w-3.5 h-3.5 text-[#9ac43e]" />
              <span className="hidden sm:inline">Вставить из буфера</span>
              <span className="sm:hidden">Буфер</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#aaaaaa]">
                <FileText className="w-10 h-10 stroke-1 mb-2.5 opacity-40" />
                <p className="text-base font-semibold text-[#ededed]">
                  Вставьте ссылку или текст ниже
                </p>
                <p className="text-xs sm:text-sm text-[#aaaaaa] mt-1">
                  У собеседника моментально появится кнопка «Скопировать»
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === myPeerId;
                const peer = peers.find((p) => p.id === m.senderId);
                const currentAvatar = isMe
                  ? userAvatar || getAvatarForName(m.senderName)
                  : peer?.avatar || m.senderAvatar || getAvatarForName(m.senderName);
                const messageIsAdmin = isMe ? isAdmin : Boolean(peer?.isAdmin || m.isAdmin);
                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-lg border group ${
                      messageIsAdmin
                        ? 'bg-gradient-to-br from-[#22180b] to-[#161616] border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : 'bg-[#171717] border-[#3a3a3a]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-[#aaaaaa] mb-2 font-semibold">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={currentAvatar}
                          alt={m.senderName}
                          className={`w-5 h-5 rounded-full object-cover bg-[#222] shrink-0 ${
                            messageIsAdmin ? 'border border-amber-400' : 'border border-[#789d2a]/50'
                          }`}
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="flex items-center gap-1.5 min-w-0">
                          {messageIsAdmin && (
                            <span className="px-1 py-0.2 rounded text-[9px] font-mono font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider select-none shrink-0">
                              DEV
                            </span>
                          )}
                          <span
                            className={`font-bold truncate ${
                              messageIsAdmin ? 'admin-name-shimmer text-amber-300' : 'text-[#ededed]'
                            }`}
                          >
                            {m.senderName}
                          </span>
                          {(m.senderStatusEmote ||
                            (isMe ? statusEmote || undefined : peer?.statusEmote)) && (
                            <img
                              src={
                                m.senderStatusEmote ||
                                (isMe ? statusEmote || undefined : peer?.statusEmote)
                              }
                              alt="status"
                              className="w-4 h-4 object-contain inline-block select-none filter drop-shadow-[0_0_4px_rgba(255,255,255,0.3)] shrink-0"
                            />
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 ml-2">
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-base sm:text-lg text-[#ededed] break-words whitespace-pre-wrap select-all font-sans leading-relaxed">
                      {m.text}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-[#222222] flex items-center justify-end gap-2">
                      {isUrl(m.text) && (
                        <a
                          href={m.text}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2d2d2d] text-xs font-bold text-[#9ac43e] flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Открыть</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleCopyText(m.id, m.text)}
                        className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2d2d2d] text-xs font-bold text-[#ededed] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedTextId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                            <span className="text-[#9ac43e]">Скопировано!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Скопировать</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          <form
            onSubmit={handleTextSubmit}
            className="mt-3 pt-3 border-t border-[#3a3a3a] shrink-0"
          >
            <div className="flex items-center gap-2">
              <img
                src={
                  userAvatar || getAvatarForName(peers.find((p) => p.id === myPeerId)?.name || 'Вы')
                }
                alt="Ваш аватар"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[#789d2a] shadow-[0_0_8px_rgba(120,157,42,0.3)] bg-[#171717] shrink-0"
                style={{ imageRendering: 'pixelated' }}
                title="Ваш аватар"
              />
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Вставьте ссылку или текст..."
                className="flex-1 min-w-0 w-full bg-[#171717] border border-[#3a3a3a] rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-[#ededed] placeholder-[#999999] outline-none focus:border-[#789d2a] transition-colors"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-sm sm:text-base transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              >
                Отправить
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Media Lightbox */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 text-base text-[#ededed]">
              <span className="font-bold truncate max-w-xs sm:max-w-md">{previewMedia.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewMedia.url}
                  download={previewMedia.name}
                  className="px-3.5 sm:px-4 py-2 rounded-lg bg-[#789d2a] text-white text-xs sm:text-sm font-bold hover:bg-[#8cb632] transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать</span>
                </a>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-2 rounded-lg bg-[#222222] border border-[#3a3a3a] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {previewMedia.type === 'image' && (
              <img
                src={previewMedia.url}
                alt={previewMedia.name}
                className="max-h-[80vh] max-w-full object-contain rounded-lg border border-[#3a3a3a] shadow-2xl bg-[#171717]"
              />
            )}
            {previewMedia.type === 'video' && (
              <CustomVideoPlayer
                src={previewMedia.url}
                title={previewMedia.name}
                autoPlay
                className="w-full"
                onDownload={() => {
                  const a = document.createElement('a');
                  a.href = previewMedia.url;
                  a.download = previewMedia.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              />
            )}
            {previewMedia.type === 'audio' && (
              <div className="p-6 rounded-2xl bg-[#1c1c24] border border-[#3a3a45] w-full max-w-lg">
                <CustomAudioPlayer src={previewMedia.url} title={previewMedia.name} autoPlay />
              </div>
            )}
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 px-4 sm:px-5 py-3 rounded-xl bg-[#202020] border border-[#789d2a] text-[#ededed] text-xs sm:text-base font-bold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-2 max-w-[90vw]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#789d2a] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};