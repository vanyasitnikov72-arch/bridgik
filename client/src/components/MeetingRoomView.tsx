import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  ScreenShare,
  Share2,
  QrCode,
  LogOut,
  FileText,
  Copy,
  Check,
  Download,
  Users,
  Send,
  Paperclip,
  Upload,
  Monitor,
  Smartphone,
  File,
} from 'lucide-react';
import { FileTransfer, Peer, TextMessage } from '../types/index.js';
import { sound } from '../utils/sound.js';

interface MeetingRoomViewProps {
  roomId: string;
  pin: string;
  myPeerId: string;
  roomUrl: string;
  peers: Peer[];
  transfers: FileTransfer[];
  messages: TextMessage[];
  scratchpadText: string;
  onUpdateScratchpad: (text: string) => void;
  onSendFiles: (files: FileList | File[]) => void;
  onSendText: (text: string) => void;
  onLeaveRoom: () => void;
  onOpenQR: () => void;
  onToggleMic: () => Promise<boolean>;
  onToggleScreen: () => Promise<boolean>;
  remoteVideoRef?: React.RefObject<HTMLVideoElement | null>;
  isMicActive: boolean;
  isScreenActive: boolean;
  hasRemoteVideo: boolean;
  onAcceptFile: (fileId: string) => void;
}

export const MeetingRoomView: React.FC<MeetingRoomViewProps> = ({
  roomId: _roomId,
  pin,
  myPeerId,
  roomUrl,
  peers,
  transfers,
  messages,
  scratchpadText,
  onUpdateScratchpad,
  onSendFiles,
  onSendText,
  onLeaveRoom,
  onOpenQR,
  onToggleMic,
  onToggleScreen,
  remoteVideoRef,
  isMicActive,
  isScreenActive,
  hasRemoteVideo,
  onAcceptFile,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [activeSideTab, setActiveSideTab] = useState<'notes' | 'chat'>('notes');
  const [meetingSeconds, setMeetingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(scratchpadText);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([scratchpadText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-notes-${pin}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendText(chatInput.trim());
      setChatInput('');
      sound.playMessage();
    }
  };

  const otherPeers = peers.filter((p) => p.id !== myPeerId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Meeting Header Bar */}
      <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-2 bg-[#171717] px-4 py-2 rounded-lg border border-[#3a3a3a]">
            <span className="text-sm text-[#999999] uppercase font-bold tracking-wider">PIN:</span>
            <span className="font-mono text-2xl font-extrabold tracking-wider text-[#9ac43e]">{pin}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#171717] border border-[#3a3a3a] text-sm sm:text-base font-mono">
            <span className="w-2 h-2 rounded-full bg-[#789d2a] animate-pulse" />
            <span className="text-[#ededed] font-bold">{formatTimer(meetingSeconds)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm sm:text-base text-[#aaaaaa]">
            <Users className="w-4 h-4 text-[#9ac43e]" />
            <span className="font-semibold text-[#ededed]">
              {peers.length} {peers.length === 1 ? 'участник' : 'участника'} в переговорной
            </span>
          </div>
        </div>

        {/* Meeting Controls in Header */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mic */}
          <button
            onClick={onToggleMic}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              isMicActive
                ? 'bg-[#ed2b3b] hover:bg-[#d92231] text-white shadow-[0_0_12px_rgba(237,43,59,0.5)]'
                : 'bg-[#2a2a2a] hover:bg-[#333333] text-[#ededed] border border-[#3a3a3a]'
            }`}
            title={isMicActive ? 'Выключить микрофон' : 'Включить голос'}
          >
            {isMicActive ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
            <span>{isMicActive ? 'Микрофон вкл' : 'Микрофон'}</span>
          </button>

          {/* Screen */}
          <button
            onClick={onToggleScreen}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              isScreenActive
                ? 'bg-[#789d2a] hover:bg-[#8cb632] text-white shadow-[0_0_12px_rgba(120,157,42,0.5)]'
                : 'bg-[#2a2a2a] hover:bg-[#333333] text-[#ededed] border border-[#3a3a3a]'
            }`}
            title="Демонстрация экрана"
          >
            <ScreenShare className="w-4 h-4" />
            <span>{isScreenActive ? 'Трансляция...' : 'Экран'}</span>
          </button>

          {/* QR */}
          <button
            onClick={onOpenQR}
            className="px-3 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-[#ededed] text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3a3a3a]"
            title="Показать QR-код для телефона"
          >
            <QrCode className="w-4 h-4 text-[#9ac43e]" />
            <span className="hidden sm:inline">QR</span>
          </button>

          {/* Link */}
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-[#ededed] text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3a3a3a]"
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

          {/* Leave / Panic */}
          <button
            onClick={onLeaveRoom}
            className="px-4 py-2 rounded-lg bg-[#ef9282]/15 hover:bg-[#ed2b3b] text-[#ef9282] hover:text-white border border-[#ed2b3b]/30 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-1"
            title="Завершить встречу и очистить память"
          >
            <LogOut className="w-4 h-4" />
            <span>Завершить</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Video / Audio Stage + File Drawer; Right = Scratchpad & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Meeting Stage (7 or 8 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Video Broadcast or Audio Grid Stage */}
          {hasRemoteVideo ? (
            <div className="rounded-xl overflow-hidden border border-[#3a3a3a] bg-black aspect-video max-h-[500px] w-full flex items-center justify-center relative shadow-2xl">
              <video
                ref={remoteVideoRef as any}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-[#171717]/90 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-[#ededed] border border-[#3a3a3a] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ed2b3b] animate-pulse" />
                <span>Демонстрация экрана собеседника</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#3a3a3a] bg-[#1a1a1a] p-6 sm:p-8 min-h-[340px] flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm text-[#aaaaaa] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#789d2a]" />
                  <span>P2P ГОЛОСОВОЙ КАНАЛ (OPUS)</span>
                </div>
                <span className="text-xs font-mono text-[#999999]">
                  {isMicActive ? 'Ваш микрофон: ВКЛ' : 'Ваш микрофон: ВЫКЛ'}
                </span>
              </div>

              {/* Participant Avatars in Cyberpunk Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
                {peers.map((peer) => {
                  const isMe = peer.id === myPeerId;
                  const activeMic = isMe ? isMicActive : otherPeers.length > 0;
                  return (
                    <div
                      key={peer.id}
                      className={`p-5 rounded-xl border flex items-center gap-4 transition-all ${
                        activeMic
                          ? 'bg-[#222222] border-[#789d2a] shadow-[0_0_15px_rgba(120,157,42,0.2)]'
                          : 'bg-[#202020] border-[#333333]'
                      }`}
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
                          {peer.deviceType === 'mobile' ? (
                            <Smartphone className="w-7 h-7" />
                          ) : (
                            <Monitor className="w-7 h-7" />
                          )}
                        </div>
                        {activeMic && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#789d2a] border-2 border-[#1a1a1a] animate-ping" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg font-bold text-[#ededed] truncate">
                          {peer.name} {isMe && <span className="text-[#9ac43e] font-normal text-sm">(Вы)</span>}
                        </p>
                        <p className="text-sm text-[#aaaaaa] flex items-center gap-1.5 font-semibold">
                          <span className={`w-2 h-2 rounded-full ${activeMic ? 'bg-[#789d2a]' : 'bg-[#666666]'}`} />
                          <span>{activeMic ? 'В эфире (голос)' : 'Микрофон отключен'}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stage bottom info */}
              <div className="mt-6 pt-4 border-t border-[#333333] flex items-center justify-between text-xs sm:text-sm text-[#aaaaaa]">
                <span>Нажмите «Экран» в шапке, чтобы запустить трансляцию в 60 FPS</span>
                <span className="text-[#9ac43e] font-mono">0 байт на сервере</span>
              </div>
            </div>
          )}

          {/* Meeting Files Drawer / Dropzone */}
          <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#9ac43e]" />
                <h3 className="text-lg font-bold text-[#ededed]">Файлы встречи</h3>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3a3a3a]"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Прикрепить файл</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onSendFiles(e.target.files);
                  }
                }}
              />
            </div>

            {/* Transferred Files in Meeting */}
            {transfers.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {transfers.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg bg-[#171717] border border-[#3a3a3a] flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <File className="w-4 h-4 text-[#9ac43e] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-[#ededed] truncate">{t.name}</p>
                        <p className="text-xs text-[#aaaaaa]">
                          {(t.size / 1024 / 1024).toFixed(1)} МБ · {t.status === 'completed' ? 'Готово' : `${t.progress}%`}
                        </p>
                      </div>
                    </div>

                    {t.status === 'pending_approval' && (
                      <button
                        onClick={() => onAcceptFile(t.id)}
                        className="px-3 py-1 rounded bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-xs cursor-pointer"
                      >
                        Принять
                      </button>
                    )}

                    {t.status === 'completed' && t.blobUrl && (
                      <a
                        href={t.blobUrl}
                        download={t.name}
                        className="p-1.5 rounded bg-[#2a2a2a] hover:bg-[#333333] text-[#9ac43e] transition-colors cursor-pointer"
                        title="Скачать файл"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-[#888888] border border-dashed border-[#333333] rounded-lg">
                Перетащите сюда документы или файлы для участников встречи
              </div>
            )}
          </div>
        </div>

        {/* Right: Collaboration Panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#202020] border border-[#3a3a3a] rounded-xl flex flex-col h-[580px] shadow-md overflow-hidden">
          {/* Tab Header: Notes / Chat */}
          <div className="flex items-center border-b border-[#3a3a3a] bg-[#1a1a1a]">
            <button
              onClick={() => setActiveSideTab('notes')}
              className={`flex-1 py-3 text-base font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border-b-2 ${
                activeSideTab === 'notes'
                  ? 'border-[#789d2a] text-[#ededed] bg-[#202020]'
                  : 'border-transparent text-[#aaaaaa] hover:text-[#ededed]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#9ac43e]" />
              <span>Общий блокнот</span>
            </button>
            <button
              onClick={() => setActiveSideTab('chat')}
              className={`flex-1 py-3 text-base font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border-b-2 ${
                activeSideTab === 'chat'
                  ? 'border-[#789d2a] text-[#ededed] bg-[#202020]'
                  : 'border-transparent text-[#aaaaaa] hover:text-[#ededed]'
              }`}
            >
              <Send className="w-4 h-4 text-[#9ac43e]" />
              <span>Чат ({messages.length})</span>
            </button>
          </div>

          {/* Tab Content: Shared Scratchpad */}
          {activeSideTab === 'notes' ? (
            <div className="flex-1 flex flex-col p-4">
              <div className="flex items-center justify-between mb-3 text-xs sm:text-sm text-[#aaaaaa]">
                <span className="font-semibold text-[#9ac43e] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#789d2a]" />
                  <span>Синхронизация в реальном времени</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyNotes}
                    className="p-1.5 hover:text-white rounded bg-[#2a2a2a] hover:bg-[#333333] transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Скопировать весь блокнот"
                  >
                    {copiedNotes ? <Check className="w-3.5 h-3.5 text-[#9ac43e]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNotes ? 'Скопировано' : 'Копировать'}</span>
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="p-1.5 hover:text-white rounded bg-[#2a2a2a] hover:bg-[#333333] transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Скачать в .md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.md</span>
                  </button>
                </div>
              </div>

              <textarea
                value={scratchpadText}
                onChange={(e) => onUpdateScratchpad(e.target.value)}
                placeholder="Общий блокнот встречи... Набросайте план, тезисы, ссылки или код. Все изменения моментально видны собеседникам."
                className="flex-1 w-full bg-[#171717] border border-[#3a3a3a] rounded-lg p-3.5 text-base sm:text-lg text-[#ededed] placeholder-[#777777] outline-none focus:border-[#789d2a] resize-none font-mono leading-relaxed transition-colors"
              />

              <div className="mt-2 text-xs text-[#888888] flex items-center justify-between">
                <span>Заметки не сохраняются на сервере</span>
                <span>Символов: {scratchpadText.length}</span>
              </div>
            </div>
          ) : (
            /* Tab Content: Meeting Chat */
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-[#777777] text-sm">
                    Сообщений пока нет. Напишите что-нибудь собеседникам.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === myPeerId;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-xs text-[#888888] mb-0.5 px-1">{m.senderName}</span>
                        <div
                          className={`max-w-[85%] p-3 rounded-xl text-base leading-snug break-words ${
                            isMe
                              ? 'bg-[#1c2214] border border-[#789d2a]/50 text-[#d4e8a8]'
                              : 'bg-[#2a2a2a] border border-[#3a3a3a] text-[#ededed]'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-[#3a3a3a] bg-[#1a1a1a] flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Сообщение или ссылка..."
                  className="flex-1 bg-[#171717] border border-[#3a3a3a] rounded-lg px-3.5 py-2 text-base text-[#ededed] placeholder-[#777777] outline-none focus:border-[#789d2a] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-[#789d2a] hover:bg-[#8cb632] disabled:opacity-40 text-white rounded-lg font-bold text-sm transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
