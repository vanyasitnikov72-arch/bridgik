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
  HardDrive,
  FolderDown,
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
      <div className="bg-[#222222] border border-[#3a3a3a] rounded-xl p-4 mb-6 flex flex-col gap-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#171717] px-3.5 py-1.5 rounded-md border border-[#3a3a3a]">
              <span className="text-xs text-[#999999] uppercase font-semibold">PIN:</span>
              <span className="font-mono text-xl font-bold tracking-wider text-[#9ac43e]">{pin}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#ededed]">
              <Users className="w-4 h-4 text-[#9ac43e]" />
              <span className="font-medium">
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
              className="px-3 py-1.5 rounded-md bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#9ac43e]" />
              <span className="hidden sm:inline">QR-код</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-md bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                  <span className="text-[#9ac43e]">Скопировано</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ссылка</span>
                </>
              )}
            </button>

            {/* Voice Mic Toggle */}
            <button
              onClick={onToggleMic}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isMicActive
                  ? 'bg-[#ed2b3b] text-white'
                  : 'bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed]'
              }`}
              title={isMicActive ? 'Выключить микрофон' : 'Включить голос'}
            >
              {isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isMicActive ? 'Голос вкл' : 'Микрофон'}</span>
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={onToggleScreen}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isScreenActive
                  ? 'bg-[#789d2a] text-white'
                  : 'bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed]'
              }`}
              title="Демонстрация экрана"
            >
              <ScreenShare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isScreenActive ? 'Трансляция...' : 'Экран'}</span>
            </button>

            {/* Exit Button */}
            <button
              onClick={onLeaveRoom}
              className="px-3 py-1.5 rounded-md bg-[#2d2d2d] hover:bg-[#ef9282]/15 hover:text-[#ef9282] border border-transparent hover:border-[#ef9282]/30 text-[#aaaaaa] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-1"
              title="Закрыть комнату и очистить память"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>

        {/* Connected devices list */}
        {peers.length > 0 && (
          <div className="flex items-center gap-2 pt-2.5 border-t border-[#3a3a3a] w-full flex-wrap text-xs">
            <span className="text-[#999999] text-[11px] font-medium mr-1">Устройства в комнате:</span>
            {peers.map((p) => {
              const isMe = p.id === myPeerId;
              return (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${
                    isMe
                      ? 'bg-[#171717] text-[#ededed] border-[#3a3a3a]'
                      : 'bg-[#2d2d2d] text-[#ededed] border-[#3a3a3a]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#789d2a]" />
                  <span className="font-semibold">{p.name}</span>
                  {isMe && <span className="text-[10px] text-[#999999]">(Вы)</span>}
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
          <div className="absolute top-3 left-3 bg-[#171717]/90 px-3 py-1 rounded-md text-xs text-[#ededed] border border-[#3a3a3a] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ed2b3b] animate-pulse" />
            <span>Демонстрация экрана собеседника</span>
          </div>
        </div>
      )}

      {/* Waiting for peer banner */}
      {otherPeers.length === 0 && (
        <div className="mb-6 p-4 rounded-xl bg-[#222222] border border-[#3a3a3a] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#789d2a] animate-ping" />
            <div>
              <p className="text-sm font-bold text-[#ededed]">Ожидание собеседника</p>
              <p className="text-xs text-[#aaaaaa]">
                Отправьте ссылку или продиктуйте 4-значный код <strong>{pin}</strong>, либо покажите QR-код
              </p>
            </div>
          </div>
          <button
            onClick={onOpenQR}
            className="px-3.5 py-1.5 rounded-md bg-[#789d2a] hover:bg-[#8cb632] text-white text-xs font-bold shrink-0 cursor-pointer transition-colors"
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
            className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-colors select-none ${
              isDragging
                ? 'border-[#789d2a] bg-[#222222]'
                : 'border-[#3a3a3a] bg-[#222222]/60 hover:bg-[#222222] hover:border-[#4a4a4a]'
            }`}
          >
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={(e) => e.target.files && onSendFiles(e.target.files)}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-md bg-[#2d2d2d] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] mx-auto mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#ededed] mb-1">
              Перетащите любые файлы сюда
            </h3>
            <p className="text-xs text-[#aaaaaa] max-w-sm mx-auto mb-3">
              Или нажмите для выбора. Любой размер (10 ГБ, 50 ГБ+) — прямое P2P-соединение без серверов.
            </p>
            <span className="inline-block px-2.5 py-1 rounded-md bg-[#171717] border border-[#3a3a3a] text-[11px] font-semibold text-[#9ac43e]">
              ⚡ Максимальная скорость канала
            </span>
          </div>

          {/* Transfers List */}
          {transfers.length > 0 && (
            <div className="bg-[#222222] border border-[#3a3a3a] rounded-xl p-5 shadow-sm">
              <h4 className="text-sm font-bold text-[#ededed] mb-4">
                Передачи файлов ({transfers.length})
              </h4>

              <div className="space-y-3">
                {transfers.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-md bg-[#171717] border border-[#3a3a3a] flex flex-col gap-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-md bg-[#222222] border border-[#3a3a3a] shrink-0">
                          {getFileIcon(t.mimeType)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#ededed] truncate max-w-[220px] sm:max-w-xs">
                            {t.name}
                          </p>
                          <p className="text-xs text-[#aaaaaa] flex items-center gap-2">
                            <span>{formatBytes(t.size)}</span>
                            <span>•</span>
                            <span className={t.type === 'upload' ? 'text-[#9ac43e]' : 'text-[#ededed]'}>
                              {t.type === 'upload' ? 'Отправка' : 'Получение'}
                            </span>
                            {t.status === 'transferring' && t.speed > 0 && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[#9ac43e]">{formatSpeed(t.speed)}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right Action */}
                      <div className="flex items-center gap-2 shrink-0">
                        {t.status === 'completed' && t.savedToDisk && (
                          <span className="px-2.5 py-1 rounded-md bg-[#789d2a]/15 border border-[#789d2a]/40 text-[#9ac43e] text-xs font-semibold flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>Сохранено на диск</span>
                          </span>
                        )}

                        {t.status === 'completed' && !t.savedToDisk && t.blobUrl && (
                          <a
                            href={t.blobUrl}
                            download={t.name}
                            className="px-3 py-1.5 rounded-md bg-[#789d2a] hover:bg-[#8cb632] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Скачать</span>
                          </a>
                        )}

                        {t.status === 'transferring' && (
                          <button
                            onClick={() => onCancelTransfer(t.id)}
                            className="p-1.5 rounded-md hover:bg-[#2d2d2d] text-[#aaaaaa] hover:text-[#ef9282] transition-colors cursor-pointer"
                            title="Отменить"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        {t.status === 'error' && (
                          <span className="text-xs text-[#ef9282] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{t.error || 'Ошибка'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Large file approval prompt (for receiver) */}
                    {t.status === 'pending_approval' && (
                      <div className="mt-1 p-3 rounded-md bg-[#222222] border border-[#3a3a3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-[#ededed]">
                          <HardDrive className="w-4 h-4 text-[#9ac43e] shrink-0" />
                          <span>Большой файл. Выберите папку на диске для потоковой записи без расхода RAM.</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onAcceptFile(t.id)}
                            className="px-3 py-1.5 rounded-md bg-[#789d2a] hover:bg-[#8cb632] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FolderDown className="w-3.5 h-3.5" />
                            <span>Выбрать папку</span>
                          </button>
                          <button
                            onClick={() => onRejectFile(t.id)}
                            className="px-2.5 py-1.5 rounded-md bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Отклонить
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Waiting for receiver approval (for sender) */}
                    {t.status === 'waiting_receiver' && (
                      <div className="mt-1 text-xs text-[#9ac43e] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#789d2a] animate-pulse" />
                        <span>Ожидание: получатель выбирает папку для сохранения...</span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {t.status === 'transferring' && (
                      <div className="w-full bg-[#222222] rounded-full h-1.5 overflow-hidden border border-[#3a3a3a]/40">
                        <div
                          className="bg-[#789d2a] h-1.5 rounded-full transition-all duration-300"
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
        <div className="lg:col-span-5 flex flex-col h-[580px] bg-[#222222] border border-[#3a3a3a] rounded-xl p-5 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div>
              <h4 className="text-sm font-bold text-[#ededed]">Мгновенный буфер и текст</h4>
              <p className="text-[11px] text-[#999999]">Ссылки, пароли, заметки в 1 клик</p>
            </div>
            <button
              onClick={handlePasteFromClipboard}
              className="px-2.5 py-1 rounded-md bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Вставить из системного буфера"
            >
              <Copy className="w-3 h-3 text-[#9ac43e]" />
              <span>Вставить из буфера</span>
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#999999]">
                <FileText className="w-8 h-8 stroke-1 mb-2 opacity-40" />
                <p className="text-xs">Вставьте ссылку или текст ниже</p>
                <p className="text-[10px] text-[#999999] mt-1">
                  У собеседника моментально появится кнопка «Скопировать»
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-md bg-[#171717] border border-[#3a3a3a] group"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#999999] mb-1.5">
                    <span className="font-semibold text-[#ededed]">{m.senderName}</span>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <p className="text-xs text-[#ededed] break-words whitespace-pre-wrap select-all font-sans leading-relaxed">
                    {m.text}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#222222] flex items-center justify-end gap-2">
                    {isUrl(m.text) && (
                      <a
                        href={m.text}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-md bg-[#222222] hover:bg-[#2d2d2d] text-[11px] font-semibold text-[#9ac43e] flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Открыть</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleCopyText(m.id, m.text)}
                      className="px-2 py-1 rounded-md bg-[#222222] hover:bg-[#2d2d2d] text-[11px] font-semibold text-[#ededed] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedTextId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#9ac43e]" />
                          <span className="text-[#9ac43e]">Скопировано!</span>
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
          <form onSubmit={handleTextSubmit} className="mt-3 pt-3 border-t border-[#3a3a3a] shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Вставьте ссылку или текст..."
                className="flex-1 bg-[#171717] border border-[#3a3a3a] rounded-md px-3.5 py-2.5 text-xs text-[#ededed] placeholder-[#999999] outline-none focus:border-[#789d2a] transition-colors"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="px-4 py-2.5 rounded-md bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
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
