import React, { useState, useRef, useEffect } from 'react';
import {
  Share2,
  QrCode,
  LogOut,
  UploadCloud,
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
} from 'lucide-react';
import { FileTransfer, Peer, TextMessage } from '../types/index.js';
import { formatBytes, formatSpeed } from '../utils/device.js';

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
  onLeaveRoom: () => void;
  onOpenQR: () => void;
  onToggleMic: () => Promise<boolean>;
  onToggleScreen: () => Promise<boolean>;
  remoteVideoRef?: React.RefObject<HTMLVideoElement | null>;
  isMicActive: boolean;
  isScreenActive: boolean;
  hasRemoteVideo: boolean;
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
  onLeaveRoom,
  onOpenQR,
  onToggleMic,
  onToggleScreen,
  remoteVideoRef,
  isMicActive,
  isScreenActive,
  hasRemoteVideo,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      }
    } catch (e) {
      console.warn('Clipboard read permission denied', e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onSendFiles(e.dataTransfer.files);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-emerald-400" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-indigo-400" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-amber-400" />;
    if (mimeType.includes('pdf') || mimeType.includes('text')) return <FileText className="w-5 h-5 text-cyan-400" />;
    return <File className="w-5 h-5 text-neutral-400" />;
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
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-950 px-3.5 py-1.5 rounded-xl border border-neutral-800">
            <span className="text-xs text-neutral-400 uppercase font-semibold">PIN:</span>
            <span className="font-mono text-xl font-bold tracking-wider text-cyan-400">{pin}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-300">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>
              {otherPeers.length === 0
                ? 'Ожидание участников...'
                : `${peers.length} устройств(а) в сети`}
            </span>
          </div>
        </div>

        {/* Quick Room Share & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenQR}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">QR-код</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Скопировано</span>
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
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isMicActive
                ? 'bg-rose-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
            title={isMicActive ? 'Выключить микрофон' : 'Включить голос'}
          >
            {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMicActive ? 'Голос вкл' : 'Микрофон'}</span>
          </button>

          {/* Screen Share Toggle */}
          <button
            onClick={onToggleScreen}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isScreenActive
                ? 'bg-cyan-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
            title="Демонстрация экрана"
          >
            <ScreenShare className="w-4 h-4" />
            <span className="hidden sm:inline">{isScreenActive ? 'Трансляция...' : 'Экран'}</span>
          </button>

          {/* Exit / Panic Button */}
          <button
            onClick={onLeaveRoom}
            className="px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-rose-950/80 hover:border-rose-800/80 border border-transparent text-neutral-300 hover:text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ml-1"
            title="Закрыть комнату и очистить память"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>

        {/* Connected devices list */}
        {peers.length > 0 && (
          <div className="flex items-center gap-2 pt-3 border-t border-neutral-800/60 w-full flex-wrap text-xs">
            <span className="text-neutral-400 text-[11px] font-medium mr-1">Устройства в комнате:</span>
            {peers.map((p) => {
              const isMe = p.id === myPeerId;
              return (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                    isMe
                      ? 'bg-neutral-800/80 text-neutral-200 border-neutral-700'
                      : 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="font-medium">{p.name}</span>
                  {isMe && <span className="text-[10px] text-neutral-400">(Вы)</span>}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Remote Video Stream if Screen Share is Active */}
      {hasRemoteVideo && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-neutral-800 bg-black aspect-video max-h-[480px] w-full flex items-center justify-center relative shadow-2xl">
          <video
            ref={remoteVideoRef as any}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-neutral-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Демонстрация экрана собеседника</span>
          </div>
        </div>
      )}

      {/* Connected Peers Status Card (when 0 peers connected) */}
      {otherPeers.length === 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <p className="text-sm font-semibold text-cyan-200">Ожидание собеседника</p>
              <p className="text-xs text-cyan-400/80">
                Отправьте ссылку или продиктуйте 4-значный код <strong>{pin}</strong>, либо покажите QR-код
              </p>
            </div>
          </div>
          <button
            onClick={onOpenQR}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
          >
            Показать QR
          </button>
        </div>
      )}

      {/* Main Grid: Left = Files & Transfers, Right = Clipboard & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & File Transfers (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* File Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 select-none ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
                : 'border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-700'
            }`}
          >
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={(e) => e.target.files && onSendFiles(e.target.files)}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Перетащите любые файлы сюда
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-3">
              Или нажмите для выбора. Любой размер (10 ГБ, 30 ГБ) — передача напрямую по P2P без сохранения на сервере.
            </p>
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-[11px] font-medium text-neutral-300">
              ⚡ Максимальная скорость канала
            </span>
          </div>

          {/* Transfers List */}
          {transfers.length > 0 && (
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-5 backdrop-blur-md">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                <span>Передачи файлов ({transfers.length})</span>
              </h4>

              <div className="space-y-3">
                {transfers.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-neutral-950/90 border border-neutral-800/80 flex flex-col gap-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-neutral-900 shrink-0">
                          {getFileIcon(t.mimeType)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate max-w-[220px] sm:max-w-xs">
                            {t.name}
                          </p>
                          <p className="text-xs text-neutral-400 flex items-center gap-2">
                            <span>{formatBytes(t.size)}</span>
                            <span>•</span>
                            <span className={t.type === 'upload' ? 'text-cyan-400' : 'text-emerald-400'}>
                              {t.type === 'upload' ? 'Отправка' : 'Получение'}
                            </span>
                            {t.status === 'transferring' && t.speed > 0 && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-cyan-300">{formatSpeed(t.speed)}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right Action */}
                      <div className="flex items-center gap-2 shrink-0">
                        {t.status === 'completed' && t.blobUrl && (
                          <a
                            href={t.blobUrl}
                            download={t.name}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-500/20"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Скачать</span>
                          </a>
                        )}

                        {t.status === 'transferring' && (
                          <button
                            onClick={() => onCancelTransfer(t.id)}
                            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors"
                            title="Отменить"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        {t.status === 'error' && (
                          <span className="text-xs text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Ошибка</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {t.status === 'transferring' && (
                      <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Instant Clipboard & Ephemeral Text (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[580px] bg-neutral-900/70 border border-neutral-800 rounded-3xl p-5 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div>
              <h4 className="text-sm font-bold text-white">Мгновенный буфер и текст</h4>
              <p className="text-[11px] text-neutral-400">Ссылки, пароли, заметки в 1 клик</p>
            </div>
            <button
              onClick={handlePasteFromClipboard}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Вставить из системного буфера"
            >
              <Copy className="w-3 h-3 text-cyan-400" />
              <span>Вставить из буфера</span>
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                <FileText className="w-8 h-8 stroke-1 mb-2 opacity-50" />
                <p className="text-xs">Вставьте ссылку или текст ниже</p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  У собеседника моментально появится кнопка «Скопировать»
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-neutral-950/90 border border-neutral-800/70 group"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
                    <span className="font-medium text-neutral-300">{m.senderName}</span>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <p className="text-xs text-neutral-100 break-words whitespace-pre-wrap select-all font-sans leading-relaxed">
                    {m.text}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-neutral-900 flex items-center justify-end gap-2">
                    {isUrl(m.text) && (
                      <a
                        href={m.text}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[11px] text-cyan-400 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Открыть</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleCopyText(m.id, m.text)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[11px] text-neutral-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedTextId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Скопировано!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
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
          <form onSubmit={handleTextSubmit} className="mt-3 pt-3 border-t border-neutral-800 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Вставьте ссылку или текст..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-400 outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer"
              >
                Отправить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
