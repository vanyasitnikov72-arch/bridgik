import React, { useState, useRef, useEffect } from 'react';
import {
  Share2,
  QrCode,
  LogOut,
  File,
  Download,
  Check,
  Copy,
  ExternalLink,
  Mic,
  MicOff,
  ScreenShare,
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
} from 'lucide-react';
import { FileTransfer, Peer, TextMessage } from '../types/index.js';
import { formatBytes, formatSpeed } from '../utils/device.js';
import { extractFilesFromDataTransfer } from '../utils/files.js';
import { sound } from '../utils/sound.js';

interface RoomViewProps {
  roomId: string;
  pin: string;
  myPeerId: string;
  roomUrl: string;
  peers: Peer[];
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
}

export const RoomView: React.FC<RoomViewProps> = ({
  roomId: _roomId,
  pin,
  myPeerId,
  roomUrl,
  peers,
  transfers,
  messages,
  onSendFiles,
  onSendText,
  onCancelTransfer,
  onAcceptFile,
  onRejectFile,
  onLeaveRoom,
  onOpenQR,
  onToggleMic,
  onToggleScreen,
  remoteVideoRef,
  isMicActive,
  isScreenActive,
  hasRemoteVideo,
  autoDownload,
  onToggleAutoDownload,
  destinationDirName,
  onPickDestinationDir,
  onClearDestinationDir,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageName, setPreviewImageName] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Global Ctrl + V Paste Listener anywhere on window
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);

      // 1. Files in clipboard (screenshots, copied files)
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        onSendFiles(e.clipboardData.files);
        sound.playMessage();
        setToastMessage(`Вставлен файл из буфера: ${e.clipboardData.files[0].name}`);
        return;
      }

      // 2. Text in clipboard (if not currently focused inside an input)
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

  // Toast timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
      }
    } catch (e) {
      console.warn('Clipboard read permission denied', e);
    }
  };

  // Drag & drop supporting recursive folders
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
    if (mimeType.includes('pdf') || mimeType.includes('text')) return <FileText className="w-5 h-5 text-[#aaaaaa]" />;
    return <File className="w-5 h-5 text-[#999999]" />;
  };

  const isUrl = (text: string) => {
    try {
      return text.startsWith('http://') || text.startsWith('https://');
    } catch {
      return false;
    }
  };

  const otherPeers = peers.filter((p) => p.id !== myPeerId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Bar: Room Info & Actions */}
      <div className="bg-[#222222] border border-[#3a3a3a] rounded-xl p-4 sm:p-5 mb-6 flex flex-col gap-3.5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2 bg-[#171717] px-4 py-2 rounded-lg border border-[#3a3a3a]">
              <span className="text-sm text-[#999999] uppercase font-bold tracking-wider">PIN:</span>
              <span className="font-mono text-2xl font-extrabold tracking-wider text-[#9ac43e]">{pin}</span>
            </div>

            <div className="flex items-center gap-2 text-sm sm:text-base text-[#ededed]">
              <Users className="w-4 h-4 text-[#9ac43e]" />
              <span className="font-semibold">
                {otherPeers.length === 0
                  ? 'Ожидание участников...'
                  : `${peers.length} устройств(а) в сети`}
              </span>
            </div>
          </div>

          {/* Quick Room Share & Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto-Download Toggle */}
            <button
              onClick={onToggleAutoDownload}
              className={`px-3.5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
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
                <CheckSquare className="w-4 h-4 text-[#9ac43e]" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {autoDownload ? 'Автосохранение' : 'Автосохранение: ВЫКЛ'}
              </span>
            </button>

            {/* Target Download Directory Handle (Zero-Prompt Direct-to-Disk) */}
            {typeof window !== 'undefined' && 'showDirectoryPicker' in window && (
              destinationDirName ? (
                <div className="flex items-center gap-1.5 bg-[#1c2214] border border-[#789d2a] rounded-lg px-3 py-2 text-sm text-[#9ac43e]">
                  <FolderDown className="w-4 h-4 text-[#9ac43e] shrink-0" />
                  <span className="font-bold max-w-[130px] truncate" title={`Папка на диске: ${destinationDirName}`}>
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
                  className="px-3.5 py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3a3a3a]"
                  title="Выберите папку на диске для автоматического сохранения всех файлов без всплывающих окон"
                >
                  <FolderDown className="w-4 h-4 text-[#9ac43e]" />
                  <span className="hidden sm:inline">Папка на диске</span>
                </button>
              )
            )}

            <button
              onClick={onOpenQR}
              className="px-3.5 py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#9ac43e]" />
              <span className="hidden sm:inline">QR-код</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-[#9ac43e]" />
                  <span className="text-[#9ac43e]">Скопировано</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Ссылка</span>
                </>
              )}
            </button>

            {/* Voice Mic Toggle */}
            <button
              onClick={onToggleMic}
              className={`px-3.5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isMicActive
                  ? 'bg-[#ed2b3b] text-white'
                  : 'bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed]'
              }`}
              title={isMicActive ? 'Выключить микрофон' : 'Включить голос'}
            >
              {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMicActive ? 'Голос вкл' : 'Микрофон'}</span>
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={onToggleScreen}
              className={`px-3.5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isScreenActive
                  ? 'bg-[#789d2a] text-white'
                  : 'bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed]'
              }`}
              title="Демонстрация экрана"
            >
              <ScreenShare className="w-4 h-4" />
              <span className="hidden sm:inline">{isScreenActive ? 'Трансляция...' : 'Экран'}</span>
            </button>

            {/* Exit Button */}
            <button
              onClick={onLeaveRoom}
              className="px-3.5 py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#ef9282]/15 hover:text-[#ef9282] border border-transparent hover:border-[#ef9282]/30 text-[#aaaaaa] text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-1"
              title="Закрыть комнату и очистить память"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>

        {/* Connected devices list */}
        {peers.length > 0 && (
          <div className="flex items-center gap-2 pt-3 border-t border-[#3a3a3a] w-full flex-wrap text-sm">
            <span className="text-[#999999] text-sm font-semibold mr-1">Устройства в комнате:</span>
            {peers.map((p) => {
              const isMe = p.id === myPeerId;
              return (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border font-bold ${
                    isMe
                      ? 'bg-[#171717] text-[#ededed] border-[#3a3a3a]'
                      : 'bg-[#2d2d2d] text-[#ededed] border-[#3a3a3a]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#789d2a]" />
                  <span>{p.name}</span>
                  {isMe && <span className="text-xs text-[#999999] font-normal">(Вы)</span>}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Remote Video Stream if Screen Share is Active */}
      {hasRemoteVideo && (
        <div className="mb-6 rounded-xl overflow-hidden border border-[#3a3a3a] bg-black aspect-video max-h-[480px] w-full flex items-center justify-center relative shadow-xl">
          <video
            ref={remoteVideoRef as any}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 left-3 bg-[#171717]/90 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#ededed] border border-[#3a3a3a] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ed2b3b] animate-pulse" />
            <span>Демонстрация экрана собеседника</span>
          </div>
        </div>
      )}

      {/* Waiting for peer banner */}
      {otherPeers.length === 0 && (
        <div className="mb-6 p-5 rounded-xl bg-[#222222] border border-[#3a3a3a] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-3 h-3 rounded-full bg-[#789d2a] animate-ping" />
            <div>
              <p className="text-lg font-bold text-[#ededed]">Ожидание собеседника</p>
              <p className="text-sm sm:text-base text-[#aaaaaa]">
                Отправьте ссылку или продиктуйте код <strong>{pin}</strong>, либо покажите QR-код
              </p>
            </div>
          </div>
          <button
            onClick={onOpenQR}
            className="px-4 py-2 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white text-sm font-bold shrink-0 cursor-pointer transition-colors"
          >
            Показать QR
          </button>
        </div>
      )}

      {/* Main Grid: Left = Files & Transfers, Right = Clipboard & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & File Transfers (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Modern P2P Transfer Hub */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-xl border transition-all p-6 sm:p-8 text-center select-none shadow-md ${
              isDragging
                ? 'border-[#789d2a] bg-[#1c2214] ring-2 ring-[#789d2a]/30'
                : 'border-[#3a3a3a] bg-[#202020] hover:border-[#4a4a4a]'
            }`}
          >
            {/* Hidden native inputs for files and folders */}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={(e) => e.target.files && onSendFiles(e.target.files)}
              className="hidden"
            />
            <input
              type="file"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
              ref={folderInputRef}
              onChange={(e) => e.target.files && onSendFiles(e.target.files)}
              className="hidden"
            />

            {/* Ctrl + V Interactive Keyboard Badge */}
            <div className="flex items-center justify-center gap-2 mb-4">
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

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-2 tracking-tight">
              Передача файлов и папок
            </h3>
            <p className="text-base sm:text-lg text-[#ededed] max-w-lg mx-auto mb-6 leading-relaxed">
              Нажмите <strong className="text-white bg-[#171717] px-2 py-0.5 rounded border border-[#3a3a3a]">Ctrl + V</strong> для мгновенной отправки скриншота или файла, перетащите мышкой в окно или выберите вручную:
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-base flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <File className="w-5 h-5" />
                <span>Выбрать файлы</span>
              </button>

              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="px-5 py-2.5 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-bold text-base flex items-center gap-2 transition-colors cursor-pointer border border-[#3a3a3a]"
              >
                <Folder className="w-5 h-5 text-[#9ac43e]" />
                <span>Выбрать папку</span>
              </button>

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="px-5 py-2.5 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-bold text-base flex items-center gap-2 transition-colors cursor-pointer border border-[#3a3a3a]"
                title="Вставить из буфера обмена (Ctrl + V)"
              >
                <Copy className="w-5 h-5 text-[#aaaaaa]" />
                <span>Из буфера</span>
              </button>
            </div>

            {/* Bottom Tag Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-4 mt-6 border-t border-[#3a3a3a]/60 text-sm sm:text-base text-[#aaaaaa]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#789d2a]" />
                Прямой WebRTC канал
              </span>
              <span className="text-[#555555]">·</span>
              <span>Без ограничений по размеру</span>
              <span className="text-[#555555]">·</span>
              <span>Drag & Drop в любую область</span>
            </div>
          </div>

          {/* Transfers List */}
          {transfers.length > 0 && (
            <div className="bg-[#222222] border border-[#3a3a3a] rounded-xl p-5 sm:p-6 shadow-sm">
              <h4 className="text-lg sm:text-xl font-bold text-[#ededed] mb-4">
                Передачи файлов ({transfers.length})
              </h4>

              <div className="space-y-3.5">
                {transfers.map((t) => {
                  const isImage =
                    t.mimeType.startsWith('image/') ||
                    /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(t.name);
                  const isAudio =
                    t.mimeType.startsWith('audio/') ||
                    /\.(mp3|wav|ogg|m4a|aac)$/i.test(t.name);

                  return (
                    <div
                      key={t.id}
                      className="p-4 rounded-lg bg-[#171717] border border-[#3a3a3a] flex flex-col gap-3 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Image preview thumbnail if available */}
                          {isImage && t.blobUrl ? (
                            <div className="relative group shrink-0">
                              <img
                                src={t.blobUrl}
                                alt={t.name}
                                onClick={() => {
                                  setPreviewImageUrl(t.blobUrl!);
                                  setPreviewImageName(t.name);
                                }}
                                className="w-13 h-13 object-cover rounded-lg border border-[#3a3a3a] cursor-pointer group-hover:border-[#789d2a] transition-all"
                                title="Нажмите для просмотра в полном размере"
                              />
                              <div
                                onClick={() => {
                                  setPreviewImageUrl(t.blobUrl!);
                                  setPreviewImageName(t.name);
                                }}
                                className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-[#222222] border border-[#3a3a3a] shrink-0">
                              {getFileIcon(t.mimeType)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-base sm:text-lg font-bold text-[#ededed] truncate max-w-[220px] sm:max-w-md">
                              {t.name}
                            </p>
                            <p className="text-sm text-[#aaaaaa] flex items-center gap-2 mt-0.5">
                              <span>{formatBytes(t.size)}</span>
                              <span>•</span>
                              <span className={t.type === 'upload' ? 'text-[#9ac43e] font-semibold' : 'text-[#ededed]'}>
                                {t.type === 'upload' ? 'Отправка' : 'Получение'}
                              </span>
                              {t.status === 'transferring' && t.speed > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-[#9ac43e] font-bold">{formatSpeed(t.speed)}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Right Action */}
                        <div className="flex items-center gap-2 shrink-0">
                          {t.status === 'completed' && t.savedToDisk && (
                            <span className="px-3 py-1.5 rounded-lg bg-[#789d2a]/15 border border-[#789d2a]/40 text-[#9ac43e] text-sm font-bold flex items-center gap-1.5">
                              <Check className="w-4 h-4" />
                              <span>Сохранено на диск</span>
                            </span>
                          )}

                          {t.status === 'completed' && !t.savedToDisk && t.blobUrl && (
                            <a
                              href={t.blobUrl}
                              download={t.name}
                              className="px-4 py-2 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <Download className="w-4 h-4" />
                              <span>Скачать</span>
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
                            <span className="text-sm text-[#ef9282] flex items-center gap-1 font-semibold">
                              <AlertCircle className="w-4 h-4" />
                              <span>{t.error || 'Ошибка'}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Inline Audio Player for Audio files */}
                      {isAudio && t.blobUrl && t.status === 'completed' && (
                        <div className="mt-1 pt-2 border-t border-[#222222]">
                          <audio
                            controls
                            src={t.blobUrl}
                            className="w-full h-8 rounded bg-[#171717] opacity-90"
                          />
                        </div>
                      )}

                      {/* Large file approval prompt (for receiver) */}
                      {t.status === 'pending_approval' && (
                        <div className="mt-1 p-3.5 rounded-lg bg-[#222222] border border-[#3a3a3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 text-sm text-[#ededed]">
                            <HardDrive className="w-5 h-5 text-[#9ac43e] shrink-0" />
                            <span>Большой файл. Выберите папку на диске для потоковой записи без расхода RAM.</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => onAcceptFile(t.id)}
                              className="px-3.5 py-2 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <FolderDown className="w-4 h-4" />
                              <span>Выбрать папку</span>
                            </button>
                            <button
                              onClick={() => onRejectFile(t.id)}
                              className="px-3 py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-sm font-bold transition-colors cursor-pointer"
                            >
                              Отклонить
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Waiting for receiver approval (for sender) */}
                      {t.status === 'waiting_receiver' && (
                        <div className="mt-1 text-sm text-[#9ac43e] flex items-center gap-2 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#789d2a] animate-pulse" />
                          <span>Ожидание: получатель выбирает папку для сохранения...</span>
                        </div>
                      )}

                      {/* Progress Bar */}
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

        {/* Right Column: Instant Clipboard & Ephemeral Text (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[580px] bg-[#222222] border border-[#3a3a3a] rounded-xl p-5 sm:p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5 shrink-0">
            <div>
              <h4 className="text-lg font-bold text-[#ededed]">Мгновенный буфер и текст</h4>
              <p className="text-sm text-[#aaaaaa]">Ссылки, пароли, заметки в 1 клик</p>
            </div>
            <button
              onClick={handlePasteFromClipboard}
              className="px-3 py-1.5 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3a3a3a]"
              title="Вставить из системного буфера"
            >
              <Copy className="w-3.5 h-3.5 text-[#9ac43e]" />
              <span>Вставить из буфера</span>
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#aaaaaa]">
                <FileText className="w-10 h-10 stroke-1 mb-2.5 opacity-40" />
                <p className="text-base font-semibold text-[#ededed]">Вставьте ссылку или текст ниже</p>
                <p className="text-sm text-[#aaaaaa] mt-1">
                  У собеседника моментально появится кнопка «Скопировать»
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-lg bg-[#171717] border border-[#3a3a3a] group"
                >
                  <div className="flex items-center justify-between text-xs text-[#aaaaaa] mb-2 font-semibold">
                    <span className="font-bold text-[#ededed]">{m.senderName}</span>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Text Input Box */}
          <form onSubmit={handleTextSubmit} className="mt-3.5 pt-3.5 border-t border-[#3a3a3a] shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Вставьте ссылку или текст..."
                className="flex-1 bg-[#171717] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-base text-[#ededed] placeholder-[#999999] outline-none focus:border-[#789d2a] transition-colors"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="px-5 py-2.5 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-base transition-colors disabled:opacity-40 cursor-pointer"
              >
                Отправить
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 text-base text-[#ededed]">
              <span className="font-bold truncate max-w-md">{previewImageName}</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImageUrl}
                  download={previewImageName || 'image'}
                  className="px-4 py-2 rounded-lg bg-[#789d2a] text-white text-sm font-bold hover:bg-[#8cb632] transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать</span>
                </a>
                <button
                  onClick={() => setPreviewImageUrl(null)}
                  className="p-2 rounded-lg bg-[#222222] border border-[#3a3a3a] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <img
              src={previewImageUrl}
              alt={previewImageName || 'Preview'}
              className="max-h-[80vh] max-w-full object-contain rounded-lg border border-[#3a3a3a] shadow-2xl bg-[#171717]"
            />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-[#202020] border border-[#789d2a] text-[#ededed] text-sm sm:text-base font-bold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#789d2a] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
