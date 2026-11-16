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
  Radio,
  Settings,
  X,
  Palette,
  Coffee,
  Volume2,
  VolumeX,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { FileTransfer, Peer, TextMessage } from '../types/index.js';
import { sound } from '../utils/sound.js';

export type TableTheme = 'cyber' | 'wood' | 'glass' | 'bunker';

interface ThemePreset {
  id: TableTheme;
  title: string;
  subtitle: string;
  accent: string;
  accentClass: string;
  tableClass: string;
  borderClass: string;
  chairClass: string;
  hubBg: string;
  hubBorder: string;
  hubRing: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

const THEME_PRESETS: Record<TableTheme, ThemePreset> = {
  cyber: {
    id: 'cyber',
    title: 'Кибер-терминал',
    subtitle: 'Неоновая матрица, CRT-фосфор и радар',
    accent: '#9ac43e',
    accentClass: 'text-[#9ac43e]',
    tableClass: 'bg-[#151c13] border-[#789d2a]/60 shadow-[0_0_40px_rgba(120,157,42,0.16)]',
    borderClass: 'border-[#789d2a]/60',
    chairClass: 'bg-[#1b2518] border-[#789d2a]/40',
    hubBg: 'bg-[#182613]',
    hubBorder: 'border-[#789d2a]',
    hubRing: 'border-[#9ac43e]/40',
    badgeBg: 'bg-[#1c2415]',
    badgeBorder: 'border-[#789d2a]/50',
    badgeText: 'text-[#9ac43e]',
  },
  wood: {
    id: 'wood',
    title: 'Уютная студия',
    subtitle: 'Темный полированный дуб, теплый свет лампы и кофе',
    accent: '#f59e0b',
    accentClass: 'text-[#f59e0b]',
    tableClass: 'bg-gradient-to-br from-[#271912] via-[#1e130e] to-[#140c08] border-[#935427] shadow-[0_0_40px_rgba(217,119,6,0.18)]',
    borderClass: 'border-[#935427]',
    chairClass: 'bg-[#231610] border-[#935427]/60',
    hubBg: 'bg-[#2e1d13]',
    hubBorder: 'border-[#d97706]',
    hubRing: 'border-[#f59e0b]/40',
    badgeBg: 'bg-[#281b13]',
    badgeBorder: 'border-[#935427]',
    badgeText: 'text-[#f59e0b]',
  },
  glass: {
    id: 'glass',
    title: 'Матовое стекло',
    subtitle: 'Executive minimal, дымчатое стекло и серебро',
    accent: '#38bdf8',
    accentClass: 'text-[#38bdf8]',
    tableClass: 'bg-gradient-to-br from-[#0e1624] via-[#09101c] to-[#060b13] border-[#38bdf8]/50 shadow-[0_0_40px_rgba(56,189,248,0.15)]',
    borderClass: 'border-[#38bdf8]/50',
    chairClass: 'bg-[#121c2e] border-[#38bdf8]/40',
    hubBg: 'bg-[#0f1d33]',
    hubBorder: 'border-[#38bdf8]',
    hubRing: 'border-[#7dd3fc]/40',
    badgeBg: 'bg-[#101b2c]',
    badgeBorder: 'border-[#38bdf8]/50',
    badgeText: 'text-[#38bdf8]',
  },
  bunker: {
    id: 'bunker',
    title: 'Секретный бункер',
    subtitle: 'Прокатная броневая сталь, радар и сигнальные маяки',
    accent: '#f97316',
    accentClass: 'text-[#f97316]',
    tableClass: 'bg-gradient-to-br from-[#1e2227] via-[#16181b] to-[#101214] border-[#f97316]/50 shadow-[0_0_40px_rgba(249,115,22,0.18)]',
    borderClass: 'border-[#f97316]/50',
    chairClass: 'bg-[#181a1d] border-[#f97316]/40',
    hubBg: 'bg-[#251e18]',
    hubBorder: 'border-[#f97316]',
    hubRing: 'border-[#fb923c]/40',
    badgeBg: 'bg-[#251d18]',
    badgeBorder: 'border-[#f97316]/50',
    badgeText: 'text-[#f97316]',
  },
};

// Conference Table Gooseneck Mic Prop
const TableConferenceMic: React.FC<{ active: boolean; accentColor: string }> = ({
  active,
  accentColor,
}) => (
  <div
    className="flex items-center gap-1 shrink-0 select-none"
    title={active ? 'Микрофон на столе: активен' : 'Микрофон на столе: выключен'}
  >
    <div className="relative flex items-center">
      {/* Weighted metallic base */}
      <div className="w-5 h-2 rounded-full bg-[#2a2a2a] border border-[#444] shadow-inner" />
      {/* Curved gooseneck stalk */}
      <svg className="w-5 h-6 -ml-2.5 -mt-3.5 pointer-events-none" viewBox="0 0 20 24" fill="none">
        <path
          d="M 5 22 Q 10 14, 15 4"
          stroke={active ? accentColor : '#555555'}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      {/* Mic Capsule Tip with LED indicator */}
      <div
        className={`w-2.5 h-2.5 rounded-full border border-black -ml-1.5 -mt-5.5 transition-all ${
          active ? 'shadow-[0_0_8px_currentColor] animate-pulse' : 'bg-[#444444]'
        }`}
        style={{
          backgroundColor: active ? accentColor : '#444444',
          color: accentColor,
        }}
      />
    </div>
  </div>
);

// Steaming Coffee Mug Prop
const TableCoffeeProp: React.FC = () => (
  <div
    className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#000000]/30 border border-white/5 backdrop-blur-xs select-none shadow-xs"
    title="Кофе за столом переговоров"
  >
    <div className="relative">
      <div className="absolute -top-3.5 left-1 flex gap-1 pointer-events-none">
        <span className="w-0.5 h-2.5 bg-amber-200/50 rounded-full animate-steam" />
        <span className="w-0.5 h-2 bg-amber-200/40 rounded-full animate-steam-delay" />
      </div>
      <Coffee className="w-3.5 h-3.5 text-[#d97706]" />
    </div>
    <span className="text-[11px] font-mono text-[#aa8866]">Кофе · 45°C</span>
  </div>
);

// Central Conference Hub (Speakerphone Puck)
const TableCenterHub: React.FC<{
  isMicActive: boolean;
  hasActiveAudio: boolean;
  preset: ThemePreset;
}> = ({ isMicActive, hasActiveAudio, preset }) => {
  const isTransmitting = isMicActive || hasActiveAudio;
  return (
    <div className="relative flex flex-col items-center justify-center my-3 sm:my-0 py-2 sm:py-3 z-10 shrink-0 select-none">
      {/* Audio ripple waves radiating from hub */}
      {isTransmitting && (
        <>
          <div
            className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border animate-hub-ripple pointer-events-none"
            style={{ borderColor: preset.accent }}
          />
          <div
            className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border animate-hub-ripple-delay pointer-events-none"
            style={{ borderColor: preset.accent }}
          />
        </>
      )}

      {/* Central Puck Body */}
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 ${preset.hubBg} ${preset.hubBorder} relative flex flex-col items-center justify-center shadow-xl transition-all duration-300`}
      >
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-dashed ${preset.hubRing} flex items-center justify-center`}
        >
          <Radio
            className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
              isTransmitting ? 'animate-pulse' : 'opacity-70'
            }`}
            style={{ color: isTransmitting ? preset.accent : '#888888' }}
          />
        </div>

        {/* Status Center LED */}
        <div
          className={`absolute bottom-2 w-2 h-2 rounded-full ${
            isTransmitting ? 'animate-ping' : ''
          }`}
          style={{ backgroundColor: preset.accent }}
        />
      </div>

      <div className="mt-1.5 text-center">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#aaaaaa]">
          bridgik hub
        </div>
        <div
          className="text-[10px] sm:text-[11px] font-mono font-semibold"
          style={{ color: preset.accent }}
        >
          48 kHz · E2E Direct
        </div>
      </div>
    </div>
  );
};

interface MeetingRoomViewProps {
  roomId: string;
  pin: string;
  myPeerId: string;
  myUserName?: string;
  onUpdateUserName?: (name: string) => void;
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
  myUserName,
  onUpdateUserName,
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

  // Room Customization & Settings State
  const [tableTheme, setTableTheme] = useState<TableTheme>(() => {
    return (localStorage.getItem('bridgik_table_theme') as TableTheme) || 'cyber';
  });
  const [showTableDecor, setShowTableDecor] = useState<boolean>(() => {
    return localStorage.getItem('bridgik_table_decor') !== 'false';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customNameInput, setCustomNameInput] = useState(myUserName || '');
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return sound.isEnabled();
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync customNameInput if prop changes
  useEffect(() => {
    if (myUserName && !customNameInput) {
      setCustomNameInput(myUserName);
    }
  }, [myUserName]);

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
    sound.playClick();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(scratchpadText);
    setCopiedNotes(true);
    sound.playClick();
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
    sound.playClick();
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendText(chatInput.trim());
      setChatInput('');
      sound.playMessage();
    }
  };

  const handleSelectTheme = (themeId: TableTheme) => {
    setTableTheme(themeId);
    localStorage.setItem('bridgik_table_theme', themeId);
    sound.playClick();
  };

  const handleToggleTableDecor = () => {
    const next = !showTableDecor;
    setShowTableDecor(next);
    localStorage.setItem('bridgik_table_decor', next ? 'true' : 'false');
    sound.playClick();
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
    if (next) sound.playClick();
  };

  const handleSaveName = () => {
    const trimmed = customNameInput.trim();
    if (trimmed && onUpdateUserName) {
      onUpdateUserName(trimmed);
      setNameSavedSuccess(true);
      sound.playClick();
      setTimeout(() => setNameSavedSuccess(false), 2000);
    }
  };

  const otherPeers = peers.filter((p) => p.id !== myPeerId);
  const myPeer = peers.find((p) => p.id === myPeerId);
  const currentPreset = THEME_PRESETS[tableTheme] || THEME_PRESETS.cyber;

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

        {/* Meeting Controls in Header: Settings is placed to the left of Mic as requested */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Settings Button */}
          <button
            onClick={() => {
              setIsSettingsOpen(true);
              sound.playClick();
            }}
            className="px-3.5 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-[#ededed] border border-[#3a3a3a] text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
            title="Настройки комнаты и стиль стола"
          >
            <Settings className="w-4 h-4 text-[#9ac43e]" />
            <span>Настройки</span>
          </button>

          {/* Mic Button */}
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

          {/* Screen Button */}
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

      {/* Main Grid: Left = Virtual Table Stage + Files; Right = Scratchpad & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Virtual Meeting Table (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
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
            /* The Virtual Conference Table Surface ("Сидят за столом") */
            <div
              className={`rounded-[2rem] sm:rounded-[2.5rem] border-2 ${currentPreset.tableClass} p-5 sm:p-7 min-h-[390px] flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-2xl`}
              style={{
                backgroundImage:
                  tableTheme === 'cyber'
                    ? 'radial-gradient(circle, rgba(120,157,42,0.12) 1px, transparent 1px)'
                    : undefined,
                backgroundSize: tableTheme === 'cyber' ? '20px 20px' : undefined,
              }}
            >
              {/* Table Top Ambient Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      sound.playClick();
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${currentPreset.badgeBg} ${currentPreset.badgeBorder} ${currentPreset.badgeText} hover:brightness-110`}
                    title="Нажмите, чтобы сменить стиль стола"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Стол: {currentPreset.title}</span>
                  </button>

                  {showTableDecor && <TableCoffeeProp />}
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#171717]/80 border border-white/10 text-xs font-mono text-[#ededed]">
                    {isMicActive ? '● Микрофон: ВКЛ' : '○ Микрофон: ВЫКЛ'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#171717]/80 border border-white/10 text-xs font-mono text-[#9ac43e] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>E2E DTLS-SRTP</span>
                  </span>
                </div>
              </div>

              {/* Participants Sitting at the Virtual Table */}
              <div className="my-auto py-3 sm:py-5 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-4">
                  {/* Seat 1: Host / Local Participant (Left - 5 cols) */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    {/* Chair Backrest Silhouette behind table */}
                    <div className="w-32 sm:w-44 h-3.5 rounded-t-2xl bg-[#282828] border-t border-x border-[#444444] shadow-md opacity-80" />

                    {/* Participant Card on the Table Surface */}
                    <div
                      className={`w-full p-4 sm:p-5 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all relative overflow-hidden backdrop-blur-xs ${
                        isMicActive
                          ? `bg-[#1e1e1e]/90 ${currentPreset.borderClass} shadow-[0_0_24px_rgba(120,157,42,0.18)]`
                          : 'bg-[#1b1b1b]/80 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Top: Avatar + Nickname + Table Gooseneck Mic */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Retro CRT Phosphor Avatar */}
                          <div className="relative shrink-0">
                            <div
                              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                                isMicActive
                                  ? 'bg-[#162012] text-[#bbf348]'
                                  : 'bg-[#242424] border-[#3a3a3a] text-[#888888]'
                              }`}
                              style={{
                                borderColor: isMicActive ? currentPreset.accent : '#3a3a3a',
                                color: isMicActive ? currentPreset.accent : '#888888',
                              }}
                            >
                              {myPeer?.deviceType === 'mobile' ? (
                                <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
                              ) : (
                                <Monitor className="w-6 h-6 sm:w-7 sm:h-7" />
                              )}
                            </div>

                            {/* Mic Status Badge */}
                            <div
                              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1e1e1e] flex items-center justify-center ${
                                isMicActive ? 'text-white' : 'bg-[#333333] text-[#777777]'
                              }`}
                              style={{ backgroundColor: isMicActive ? currentPreset.accent : '#333333' }}
                            >
                              {isMicActive ? (
                                <Mic className="w-3 h-3 animate-pulse" />
                              ) : (
                                <MicOff className="w-2.5 h-2.5" />
                              )}
                            </div>
                          </div>

                          {/* Name & Badges */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-lg sm:text-xl font-extrabold text-[#ededed] truncate">
                                {myPeer?.name || 'Quantum Lynx'}
                              </p>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${currentPreset.badgeBg} ${currentPreset.badgeBorder} ${currentPreset.badgeText} border`}
                              >
                                Вы
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-[#282828] text-[#aaaaaa] border border-[#3a3a3a]">
                                Место 1
                              </span>
                            </div>
                            <p className="text-xs text-[#888888] font-mono mt-0.5">
                              За столом · P2P Direct
                            </p>
                          </div>
                        </div>

                        {/* Gooseneck Table Mic + Equalizer */}
                        <div className="flex items-center gap-2">
                          <TableConferenceMic active={isMicActive} accentColor={currentPreset.accent} />
                          {isMicActive ? (
                            <div
                              className="flex items-end gap-1 h-5 px-2 py-1 rounded bg-[#171717] border shrink-0"
                              style={{ borderColor: `${currentPreset.accent}50` }}
                              title="Звук передается"
                            >
                              <span className="w-1 rounded-xs animate-eq-1" style={{ backgroundColor: currentPreset.accent }} />
                              <span className="w-1 rounded-xs animate-eq-2" style={{ backgroundColor: currentPreset.accent }} />
                              <span className="w-1 rounded-xs animate-eq-3" style={{ backgroundColor: currentPreset.accent }} />
                              <span className="w-1 rounded-xs animate-eq-4" style={{ backgroundColor: currentPreset.accent }} />
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono text-[#666666] px-1.5 py-0.5 rounded bg-[#171717] border border-[#333333] shrink-0">
                              Mute
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Status Indicator & Quick Toggle */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isMicActive ? 'animate-pulse' : ''
                            }`}
                            style={{ backgroundColor: isMicActive ? currentPreset.accent : '#555555' }}
                          />
                          <span style={{ color: isMicActive ? currentPreset.accent : '#888888' }}>
                            {isMicActive ? 'Микрофон включен (звук идёт)' : 'Микрофон отключен'}
                          </span>
                        </span>

                        <button
                          onClick={onToggleMic}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
                            isMicActive
                              ? 'bg-[#ed2b3b]/15 border-[#ed2b3b]/40 text-[#ef9282] hover:bg-[#ed2b3b] hover:text-white'
                              : 'bg-[#2a2a2a] border-[#3a3a3a] text-[#ededed] hover:border-white/30'
                          }`}
                        >
                          {isMicActive ? 'Заглушить' : 'Включить'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Center Column: Table Conference Hub (1 col) */}
                  <div className="md:col-span-1 flex justify-center">
                    <TableCenterHub
                      isMicActive={isMicActive}
                      hasActiveAudio={otherPeers.length > 0}
                      preset={currentPreset}
                    />
                  </div>

                  {/* Seat 2: Guest / Remote Participant or Waiting Placeholder (Right - 5 cols) */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    {otherPeers.length > 0 ? (
                      <>
                        {/* Guest Chair Backrest */}
                        <div className="w-32 sm:w-44 h-3.5 rounded-t-2xl bg-[#282828] border-t border-x border-[#444444] shadow-md opacity-80" />

                        {/* Guest Table Card */}
                        <div
                          className={`w-full p-4 sm:p-5 rounded-2xl border ${currentPreset.borderClass} bg-[#1e1e1e]/90 shadow-[0_0_20px_rgba(120,157,42,0.12)] flex flex-col justify-between gap-3.5 backdrop-blur-xs`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative shrink-0">
                                <div
                                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center bg-[#182214] text-[#bbf348]"
                                  style={{ borderColor: currentPreset.accent, color: currentPreset.accent }}
                                >
                                  {otherPeers[0].deviceType === 'mobile' ? (
                                    <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
                                  ) : (
                                    <Monitor className="w-6 h-6 sm:w-7 sm:h-7" />
                                  )}
                                </div>
                                <div
                                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1e1e1e] flex items-center justify-center text-white"
                                  style={{ backgroundColor: currentPreset.accent }}
                                >
                                  <Mic className="w-3 h-3 animate-pulse" />
                                </div>
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-lg sm:text-xl font-extrabold text-[#ededed] truncate">
                                    {otherPeers[0].name}
                                  </p>
                                  <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-[#282828] text-[#aaaaaa] border border-[#3a3a3a]">
                                    Место 2
                                  </span>
                                </div>
                                <p className="text-xs text-[#888888] font-mono mt-0.5">
                                  {otherPeers[0].deviceType === 'mobile' ? 'Смартфон' : 'Компьютер'} · Direct P2P
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <TableConferenceMic active={true} accentColor={currentPreset.accent} />
                              <div
                                className="flex items-end gap-1 h-5 px-2 py-1 rounded bg-[#171717] border shrink-0"
                                style={{ borderColor: `${currentPreset.accent}50` }}
                              >
                                <span className="w-1 rounded-xs animate-eq-3" style={{ backgroundColor: currentPreset.accent }} />
                                <span className="w-1 rounded-xs animate-eq-1" style={{ backgroundColor: currentPreset.accent }} />
                                <span className="w-1 rounded-xs animate-eq-4" style={{ backgroundColor: currentPreset.accent }} />
                                <span className="w-1 rounded-xs animate-eq-2" style={{ backgroundColor: currentPreset.accent }} />
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm">
                            <span className="flex items-center gap-1.5 font-semibold" style={{ color: currentPreset.accent }}>
                              <span
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: currentPreset.accent }}
                              />
                              <span>Собеседник за столом</span>
                            </span>
                            <span className="text-xs text-[#aaaaaa] font-mono">0 байт на сервере</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Empty Chair Holographic Silhouette */}
                        <div className="w-32 sm:w-44 h-3.5 rounded-t-2xl border-t border-x border-dashed border-[#555555] opacity-60" />

                        {/* Empty Place on Table */}
                        <div className="w-full p-4 sm:p-5 rounded-2xl border-2 border-dashed border-white/15 hover:border-white/30 bg-[#161616]/70 flex flex-col justify-between gap-3.5 backdrop-blur-xs transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-[#202020] border border-white/10 flex items-center justify-center text-[#aaaaaa] shrink-0">
                              <Radio className="w-6 h-6 animate-pulse" style={{ color: currentPreset.accent }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-base sm:text-lg font-bold text-[#ededed]">
                                  Свободное место за столом
                                </p>
                                <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#222222] text-[#888888] border border-[#333333]">
                                  Место 2
                                </span>
                              </div>
                              <p className="text-xs text-[#aaaaaa] mt-0.5">
                                Ожидание собеседника · Назовите PIN: <strong className="text-white">{pin}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <button
                              onClick={handleCopyLink}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-[#242424] hover:bg-[#303030] border border-white/10 text-xs font-bold text-[#ededed] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {copiedLink ? (
                                <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedLink ? 'Ссылка скопирована' : 'Пригласить за стол'}</span>
                            </button>
                            <button
                              onClick={onOpenQR}
                              className="py-1.5 px-3 rounded-lg bg-[#242424] hover:bg-[#303030] border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              style={{ color: currentPreset.accent }}
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>QR</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional Seats if more than 2 participants */}
                {otherPeers.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {otherPeers.slice(1).map((peer, idx) => (
                      <div
                        key={peer.id}
                        className="p-3 rounded-xl bg-[#1b1b1b]/80 border border-white/10 flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {peer.deviceType === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-[#9ac43e] shrink-0" />
                          ) : (
                            <Monitor className="w-4 h-4 text-[#9ac43e] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-[#ededed] truncate">{peer.name}</p>
                            <p className="text-xs text-[#888888]">Место {idx + 3} · P2P Direct</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#171717] text-[#9ac43e] border border-[#333333]">
                          В эфире
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Table Bottom Status Bar */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-[#aaaaaa] relative z-10">
                <span className="flex items-center gap-2">
                  <ScreenShare className="w-4 h-4" style={{ color: currentPreset.accent }} />
                  <span>Трансляция экрана в 60 FPS прямо на виртуальный стол</span>
                </span>
                <span
                  className="font-mono font-bold px-2.5 py-0.5 rounded border border-white/10 bg-[#171717]/80"
                  style={{ color: currentPreset.accent }}
                >
                  0 байт на сервере · Pure P2P
                </span>
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

        {/* Right Column: Scratchpad & Chat (5 cols) */}
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

      {/* Settings Modal (Стилизация комнаты и стола) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#333333]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#262626] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#ededed]">Настройки переговорной</h3>
                  <p className="text-xs text-[#888888]">Стилизация стола и параметры сессии</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  sound.playClick();
                }}
                className="p-2 rounded-lg bg-[#262626] hover:bg-[#333333] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-6">
              {/* Section 1: Room Table Styling */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#9ac43e]" />
                    <h4 className="text-base font-bold text-[#ededed]">Стилизация стола переговоров</h4>
                  </div>
                  <span className="text-xs font-mono text-[#888888]">4 темы</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(THEME_PRESETS).map((t) => {
                    const isSelected = tableTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTheme(t.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? `bg-[#242424] ${t.borderClass} shadow-md`
                            : 'bg-[#181818] border-[#333333] hover:border-[#4a4a4a]'
                        }`}
                        style={{
                          borderColor: isSelected ? t.accent : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border shadow-xs"
                              style={{ backgroundColor: t.accent, borderColor: t.accent }}
                            />
                            <span className="font-extrabold text-base text-[#ededed]">{t.title}</span>
                          </div>
                          {isSelected && (
                            <span
                              className="px-2 py-0.5 rounded text-[11px] font-bold border"
                              style={{
                                backgroundColor: `${t.accent}20`,
                                borderColor: `${t.accent}60`,
                                color: t.accent,
                              }}
                            >
                              Активен
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#888888] leading-relaxed">{t.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Participant Nickname */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[#9ac43e]" />
                  <h4 className="text-base font-bold text-[#ededed]">Ваш позывной за столом</h4>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder="Ваше имя или позывной..."
                    maxLength={24}
                    className="flex-1 bg-[#171717] border border-[#3a3a3a] rounded-lg px-3.5 py-2 text-base text-[#ededed] outline-none focus:border-[#789d2a] font-mono transition-colors"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-2 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {nameSavedSuccess ? <Check className="w-4 h-4" /> : null}
                    <span>{nameSavedSuccess ? 'Сохранено' : 'Сохранить'}</span>
                  </button>
                </div>
              </div>

              {/* Section 3: Atmosphere & Sound Toggles */}
              <div className="space-y-3 pt-2 border-t border-[#333333]">
                <h4 className="text-base font-bold text-[#ededed] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#9ac43e]" />
                  <span>Атмосфера и звук</span>
                </h4>

                {/* Decor Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#181818] border border-[#333333]">
                  <div className="flex items-center gap-3">
                    <Coffee className="w-4 h-4 text-[#d97706]" />
                    <div>
                      <p className="text-sm font-bold text-[#ededed]">Декор стола</p>
                      <p className="text-xs text-[#888888]">Чашка кофе с поднимающимся паром</p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleTableDecor}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      showTableDecor ? 'bg-[#789d2a]' : 'bg-[#333333]'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        showTableDecor ? 'translate-x-6.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Sound Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#181818] border border-[#333333]">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-[#9ac43e]" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-[#888888]" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-[#ededed]">Звуковые эффекты</p>
                      <p className="text-xs text-[#888888]">8-битные щелчки и звуки сообщений</p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleSound}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      soundEnabled ? 'bg-[#789d2a]' : 'bg-[#333333]'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        soundEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Section 4: P2P Direct Tech Info */}
              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#2e2e2e] text-xs text-[#888888] space-y-1 font-mono">
                <div className="flex items-center justify-between text-[#ededed] font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9ac43e]" />
                    Шифрование комнаты
                  </span>
                  <span className="text-[#9ac43e]">E2E DTLS-SRTP</span>
                </div>
                <p>Аудиокодек: Opus 48 kHz (динамический битрейт 32-128 kbps)</p>
                <p>Архитектура: Pure P2P Mesh · 0 байт на сервере</p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#333333] flex justify-end">
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  sound.playClick();
                }}
                className="px-5 py-2.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-[#ededed] text-sm font-bold transition-colors cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
