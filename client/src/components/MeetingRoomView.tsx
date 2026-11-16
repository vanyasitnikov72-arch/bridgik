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
  Maximize2,
  Minimize2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { FileTransfer, Peer, TextMessage } from '../types/index.js';
import { sound } from '../utils/sound.js';

export type RoomTheme = 'cyber' | 'loft' | 'bunker';

interface ThemePreset {
  id: RoomTheme;
  title: string;
  subtitle: string;
  accent: string;
  accentClass: string;
  wallBg: string;
  floorBg: string;
  rugBorder: string;
  sofaBg: string;
  sofaBorder: string;
  cushionBg: string;
  tableBg: string;
  tableBorder: string;
  neonLight: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

const THEME_PRESETS: Record<RoomTheme, ThemePreset> = {
  cyber: {
    id: 'cyber',
    title: 'Кибер-гостиная',
    subtitle: 'Неоновые полосы, CRT-мониторы и лаундж-диван',
    accent: '#9ac43e',
    accentClass: 'text-[#9ac43e]',
    wallBg: 'from-[#11101a] via-[#151424] to-[#0c0b13]',
    floorBg: 'from-[#191729] via-[#12111d] to-[#0a0910]',
    rugBorder: 'border-[#789d2a]/40 shadow-[0_0_35px_rgba(120,157,42,0.15)]',
    sofaBg: 'bg-[#1e1b2f]',
    sofaBorder: 'border-[#3d375e]',
    cushionBg: 'bg-[#292440]',
    tableBg: 'bg-[#151824]/90',
    tableBorder: 'border-[#789d2a]/50',
    neonLight: '#9ac43e',
    badgeBg: 'bg-[#1a2316]',
    badgeBorder: 'border-[#789d2a]/50',
    badgeText: 'text-[#9ac43e]',
  },
  loft: {
    id: 'loft',
    title: 'Тёплый лофт',
    subtitle: 'Ламповый свет, кожаный диван и комнатные растения',
    accent: '#f59e0b',
    accentClass: 'text-[#f59e0b]',
    wallBg: 'from-[#1d1612] via-[#241a14] to-[#120d09]',
    floorBg: 'from-[#2b1f17] via-[#1d140e] to-[#110c08]',
    rugBorder: 'border-[#d97706]/40 shadow-[0_0_35px_rgba(217,119,6,0.15)]',
    sofaBg: 'bg-[#2c1d15]',
    sofaBorder: 'border-[#5b3925]',
    cushionBg: 'bg-[#3b271c]',
    tableBg: 'bg-[#21150f]/90',
    tableBorder: 'border-[#d97706]/50',
    neonLight: '#f59e0b',
    badgeBg: 'bg-[#281b13]',
    badgeBorder: 'border-[#d97706]/50',
    badgeText: 'text-[#f59e0b]',
  },
  bunker: {
    id: 'bunker',
    title: 'Секретный бункер',
    subtitle: 'Броневая сталь, радары и тактический терминал',
    accent: '#f97316',
    accentClass: 'text-[#f97316]',
    wallBg: 'from-[#14181c] via-[#192128] to-[#0e1215]',
    floorBg: 'from-[#1c242c] via-[#13191f] to-[#0b0e11]',
    rugBorder: 'border-[#f97316]/40 shadow-[0_0_35px_rgba(249,115,22,0.15)]',
    sofaBg: 'bg-[#1c232a]',
    sofaBorder: 'border-[#364452]',
    cushionBg: 'bg-[#252f38]',
    tableBg: 'bg-[#172029]/90',
    tableBorder: 'border-[#f97316]/50',
    neonLight: '#f97316',
    badgeBg: 'bg-[#271d17]',
    badgeBorder: 'border-[#f97316]/50',
    badgeText: 'text-[#f97316]',
  },
};

const sanitizeTheme = (val: string | null): RoomTheme => {
  if (val === 'loft' || val === 'wood') return 'loft';
  if (val === 'bunker') return 'bunker';
  return 'cyber';
};

// Potted Monstera Plant Decor
const RoomMonsteraPlant: React.FC<{ accent: string }> = ({ accent }) => (
  <div className="relative flex flex-col items-center select-none" title="Комнатное растение">
    <svg className="w-10 h-14 sm:w-12 sm:h-16 drop-shadow-md" viewBox="0 0 60 80" fill="none">
      <path d="M 30 70 Q 20 40, 15 25" stroke="#2e5418" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 30 70 Q 32 35, 38 15" stroke="#2e5418" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 30 70 Q 42 45, 48 30" stroke="#2e5418" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 15 25 C 8 20, 5 10, 18 8 C 22 18, 20 22, 15 25 Z" fill="#467822" />
      <path d="M 38 15 C 32 8, 42 2, 48 8 C 48 18, 42 16, 38 15 Z" fill="#58962b" />
      <path d="M 48 30 C 56 25, 58 15, 50 12 C 44 20, 46 26, 48 30 Z" fill="#467822" />
      <polygon points="18,55 42,55 38,78 22,78" fill="#1b1b22" stroke={accent} strokeWidth="1.5" />
      <rect x="16" y="52" width="28" height="4" rx="2" fill="#2a2a35" stroke={accent} strokeWidth="1" />
    </svg>
  </div>
);

// Retro Gaming & Pixel Shelf Decor (Sword, Heart, Duck)
const RoomShelfDecor: React.FC<{ accent: string }> = ({ accent }) => (
  <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#000000]/40 border-b border-white/10 select-none shadow-xs backdrop-blur-xs">
    {/* Pixel Sword */}
    <div className="flex items-center" title="Кибер-трофей: Меч">
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
        <path d="M 14 2 L 12 4 L 7 9 L 6 8 L 8 6 L 13 1 Z" fill={accent} />
        <rect x="5" y="9" width="3" height="1" fill="#ededed" />
        <rect x="3" y="11" width="3" height="3" fill="#888888" />
      </svg>
    </div>
    {/* Glowing Heart */}
    <div className="flex items-center text-[#ff3366] animate-pulse" title="Неоновое сердце">
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
    {/* Pixel Duck */}
    <div className="flex items-center" title="Резиновая уточка (Living Room Easter Egg)">
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
        <circle cx="9" cy="6" r="3.5" fill="#facc15" />
        <path d="M 6 12 C 4 12, 3 11, 3 9 C 3 8, 5 7, 9 7 C 13 7, 14 9, 14 11 C 14 12, 11 12, 6 12 Z" fill="#eab308" />
        <circle cx="11" cy="5" r="0.8" fill="#000" />
        <polygon points="12.5,5.5 15,6 12.5,7" fill="#f97316" />
      </svg>
    </div>
  </div>
);

// Corner CRT Terminal Workstation
const RoomCornerTerminal: React.FC<{ accent: string }> = ({ accent }) => (
  <div className="hidden md:flex flex-col items-center select-none opacity-80" title="Ретро-терминал в гостиной">
    <div className="w-8 h-7 rounded bg-[#1c1c22] border border-[#383844] flex flex-col items-center justify-center p-0.5 shadow-sm">
      <div className="w-full h-full bg-[#09090e] rounded-xs flex items-center justify-center overflow-hidden">
        <span className="font-mono text-[7px] font-bold" style={{ color: accent }}>&gt;_OK</span>
      </div>
    </div>
    <div className="w-2.5 h-1.5 bg-[#282832]" />
    <div className="w-5 h-1 bg-[#18181f] rounded-xs border border-[#333]" />
  </div>
);

// Steaming Coffee Mug Prop
const TableCoffeeProp: React.FC = () => (
  <div
    className="relative flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#000000]/40 border border-white/5 backdrop-blur-xs select-none shadow-xs"
    title="Горячий кофе в гостиной"
  >
    <div className="relative">
      <div className="absolute -top-3 left-0.5 flex gap-0.5 pointer-events-none">
        <span className="w-0.5 h-2 bg-amber-200/50 rounded-full animate-steam" />
        <span className="w-0.5 h-1.5 bg-amber-200/40 rounded-full animate-steam-delay" />
      </div>
      <Coffee className="w-3.5 h-3.5 text-[#d97706]" />
    </div>
    <span className="text-[11px] font-mono text-[#aa8866]">45°C</span>
  </div>
);

// Central Bridgik Hub Puck on Coffee Table
const TableCenterHub: React.FC<{
  isMicActive: boolean;
  hasActiveAudio: boolean;
  accent: string;
}> = ({ isMicActive, hasActiveAudio, accent }) => {
  const isTransmitting = isMicActive || hasActiveAudio;
  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {isTransmitting && (
        <>
          <div
            className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full border animate-hub-ripple pointer-events-none"
            style={{ borderColor: accent }}
          />
          <div
            className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full border animate-hub-ripple-delay pointer-events-none"
            style={{ borderColor: accent }}
          />
        </>
      )}

      <div
        className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 bg-[#121217] relative flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        style={{ borderColor: isTransmitting ? accent : '#3a3a46' }}
      >
        <Radio
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isTransmitting ? 'animate-pulse' : 'opacity-60'}`}
          style={{ color: isTransmitting ? accent : '#777777' }}
        />
        <div
          className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${isTransmitting ? 'animate-ping' : ''}`}
          style={{ backgroundColor: accent }}
        />
      </div>
      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#777777] mt-0.5">
        hub
      </span>
    </div>
  );
};

// Avatar Token Sitting on the Sofa/Cushion
interface AvatarSeatProps {
  name: string;
  isMe: boolean;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | string;
  isMicActive: boolean;
  seatLabel: string;
  accentColor: string;
  onToggleMic?: () => void;
}

const AvatarSeat: React.FC<AvatarSeatProps> = ({
  name,
  isMe,
  deviceType,
  isMicActive,
  seatLabel,
  accentColor,
  onToggleMic,
}) => {
  return (
    <div className="flex flex-col items-center relative group select-none">
      {/* Speech Halo & Avatar Circle */}
      <div className="relative flex items-center justify-center">
        {/* Animated pulsating voice ripples */}
        {isMicActive && (
          <div
            className="absolute -inset-2.5 rounded-full border-2 animate-speech-halo pointer-events-none"
            style={{ borderColor: accentColor }}
          />
        )}

        {/* Equalizer bars floating above avatar when speaking */}
        {isMicActive && (
          <div
            className="absolute -top-5 flex items-end gap-0.5 h-3.5 px-1.5 py-0.5 rounded bg-[#141414]/90 border shadow-xs"
            style={{ borderColor: `${accentColor}60` }}
            title="Звук передается"
          >
            <span className="w-0.5 rounded-xs animate-eq-1" style={{ backgroundColor: accentColor }} />
            <span className="w-0.5 rounded-xs animate-eq-2" style={{ backgroundColor: accentColor }} />
            <span className="w-0.5 rounded-xs animate-eq-3" style={{ backgroundColor: accentColor }} />
            <span className="w-0.5 rounded-xs animate-eq-4" style={{ backgroundColor: accentColor }} />
          </div>
        )}

        {/* Main Avatar Token */}
        <div
          onClick={isMe ? onToggleMic : undefined}
          className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 flex items-center justify-center transition-all shadow-xl ${
            isMe ? 'cursor-pointer hover:scale-105' : ''
          }`}
          style={{
            backgroundColor: isMicActive ? '#152012' : '#222228',
            borderColor: isMicActive ? accentColor : '#444450',
            color: isMicActive ? accentColor : '#999999',
            boxShadow: isMicActive ? `0 0 20px ${accentColor}40` : undefined,
          }}
          title={isMe ? (isMicActive ? 'Нажмите, чтобы заглушить микрофон' : 'Нажмите, чтобы включить микрофон') : name}
        >
          {deviceType === 'mobile' ? (
            <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
          ) : (
            <Monitor className="w-6 h-6 sm:w-7 sm:h-7" />
          )}

          {/* Mic Badge in corner of avatar */}
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1a1a24] flex items-center justify-center shadow-md text-white"
            style={{ backgroundColor: isMicActive ? accentColor : '#333338' }}
          >
            {isMicActive ? (
              <Mic className="w-2.5 h-2.5 animate-pulse" />
            ) : (
              <MicOff className="w-2.5 h-2.5 text-[#888888]" />
            )}
          </div>
        </div>
      </div>

      {/* Name Tag Pill */}
      <div className="mt-2 flex flex-col items-center">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#121218]/90 border border-white/10 shadow-xs backdrop-blur-xs">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isMicActive ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: isMicActive ? accentColor : '#666666' }}
          />
          <span className="text-xs sm:text-sm font-extrabold text-[#ededed] max-w-[90px] sm:max-w-[120px] truncate">
            {name}
          </span>
          {isMe && (
            <span
              className="text-[10px] font-bold px-1 rounded"
              style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
            >
              Вы
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-[#888888] mt-0.5">{seatLabel}</span>
      </div>
    </div>
  );
};

// Empty Cushion Place on the Sofa with Invite Button
interface EmptySeatProps {
  seatLabel: string;
  pin: string;
  copied: boolean;
  accentColor: string;
  onInvite: () => void;
  onOpenQR: () => void;
}

const EmptySeatCushion: React.FC<EmptySeatProps> = ({
  seatLabel,
  pin,
  copied,
  accentColor,
  onInvite,
  onOpenQR,
}) => {
  return (
    <div className="flex flex-col items-center relative select-none">
      {/* Dashed Cushion Placeholder */}
      <div
        onClick={onInvite}
        className="w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 border-dashed border-white/20 hover:border-white/40 bg-[#161620]/60 flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:bg-[#1a1a26]/80 group shadow-md"
        title={`Свободное место на диване. Нажмите, чтобы скопировать приглашение (PIN: ${pin})`}
      >
        <Plus
          className="w-5 h-5 sm:w-6 sm:h-6 text-[#777777] group-hover:text-white transition-colors"
          style={{ color: copied ? accentColor : undefined }}
        />
      </div>

      {/* Invite Tag */}
      <div className="mt-2 flex flex-col items-center">
        <button
          onClick={onInvite}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#161620]/90 border border-white/10 hover:border-white/30 text-xs font-bold text-[#aaaaaa] hover:text-[#ededed] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#9ac43e]" />
              <span className="text-[#9ac43e]">Скопировано!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3 h-3" />
              <span>Пригласить</span>
            </>
          )}
        </button>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10px] font-mono text-[#777777]">{seatLabel}</span>
          <button
            onClick={onOpenQR}
            className="text-[10px] font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
            title="Открыть QR-код"
          >
            · QR
          </button>
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

  // Room Theme & Customization State
  const [roomTheme, setRoomTheme] = useState<RoomTheme>(() => {
    return sanitizeTheme(localStorage.getItem('bridgik_table_theme'));
  });
  const [showRoomDecor, setShowRoomDecor] = useState<boolean>(() => {
    return localStorage.getItem('bridgik_table_decor') !== 'false';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [customNameInput, setCustomNameInput] = useState(myUserName || '');
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return sound.isEnabled();
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (myUserName && !customNameInput) {
      setCustomNameInput(myUserName);
    }
  }, [myUserName]);

  // Meeting timer
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

  const handleSelectTheme = (themeId: RoomTheme) => {
    setRoomTheme(themeId);
    localStorage.setItem('bridgik_table_theme', themeId);
    sound.playClick();
  };

  const handleToggleDecor = () => {
    const next = !showRoomDecor;
    setShowRoomDecor(next);
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
  const currentPreset = THEME_PRESETS[roomTheme] || THEME_PRESETS.cyber;

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      {/* Top Header Bar: Room PIN, Timer, Count, Quick Theme & Settings */}
      <div className="bg-[#1e1e1e] border border-[#353535] rounded-xl p-3.5 sm:p-4 mb-5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#141414] px-3.5 py-1.5 rounded-lg border border-[#333333]">
            <span className="text-xs text-[#888888] uppercase font-bold tracking-wider">PIN:</span>
            <span className="font-mono text-2xl font-extrabold tracking-wider text-[#9ac43e]">{pin}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#333333] text-sm font-mono">
            <span className="w-2 h-2 rounded-full bg-[#789d2a] animate-pulse" />
            <span className="text-[#ededed] font-bold">{formatTimer(meetingSeconds)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#aaaaaa]">
            <Users className="w-4 h-4 text-[#9ac43e]" />
            <span className="font-semibold text-[#ededed]">
              {peers.length} {peers.length === 1 ? 'участник' : 'участника'} в гостиной
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Theme Badge */}
          <button
            onClick={() => {
              setIsSettingsOpen(true);
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${currentPreset.badgeBg} ${currentPreset.badgeBorder} ${currentPreset.badgeText} hover:brightness-110`}
            title="Сменить оформление комнаты"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{currentPreset.title}</span>
          </button>

          {/* Fullscreen Theater Mode (if screen share active) */}
          {hasRemoteVideo && (
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className="px-3 py-1.5 rounded-lg bg-[#272727] hover:bg-[#333333] border border-[#3a3a3a] text-xs sm:text-sm font-bold flex items-center gap-1.5 text-[#ededed] transition-colors cursor-pointer"
              title="Переключить полноэкранный режим видео"
            >
              {isTheaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isTheaterMode ? 'В комнату' : 'На весь экран'}</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={() => {
              setIsSettingsOpen(true);
              sound.playClick();
            }}
            className="p-2 rounded-lg bg-[#272727] hover:bg-[#333333] text-[#ededed] border border-[#3a3a3a] text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Настройки комнаты"
          >
            <Settings className="w-4 h-4 text-[#9ac43e]" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Living Room Stage + Files; Right = Notes & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Theater Mode: Fullscreen Video Screen if active */}
          {hasRemoteVideo && isTheaterMode ? (
            <div className="rounded-2xl overflow-hidden border border-[#3a3a3a] bg-black aspect-video max-h-[520px] w-full flex items-center justify-center relative shadow-2xl">
              <video
                ref={remoteVideoRef as any}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-[#171717]/90 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#ededed] border border-[#3a3a3a] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ed2b3b] animate-pulse" />
                <span>Демонстрация экрана собеседника</span>
              </div>
              <button
                onClick={() => setIsTheaterMode(false)}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-[#171717]/90 hover:bg-[#252525] text-xs font-bold text-[#ededed] border border-[#3a3a3a] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Вернуться в гостиную</span>
              </button>
            </div>
          ) : (
            /* ============================================================== */
            /* VIRTUAL LIVING ROOM STAGE (Concept inspired by Discord Living Room) */
            /* ============================================================== */
            <div
              className={`rounded-3xl border-2 border-[#33333e] bg-gradient-to-b ${currentPreset.wallBg} relative overflow-hidden shadow-2xl transition-all duration-300 min-h-[460px] flex flex-col justify-between`}
            >
              {/* Ceiling Top Neon Light Tube */}
              <div
                className="absolute top-0 left-0 right-0 h-1 z-20 shadow-[0_0_16px_currentColor] transition-colors"
                style={{ backgroundColor: currentPreset.neonLight, color: currentPreset.neonLight }}
              />

              {/* Back Wall Atmosphere: Neon glow strips, shelf decor, plants, corner workstation */}
              <div className="relative pt-4 px-4 sm:px-6 pb-2 z-10">
                <div className="flex items-center justify-between gap-3">
                  {/* Left Corner: Monstera Plant & Shelf */}
                  <div className="flex items-center gap-3">
                    {showRoomDecor && <RoomMonsteraPlant accent={currentPreset.accent} />}
                    {showRoomDecor && <RoomShelfDecor accent={currentPreset.accent} />}
                  </div>

                  {/* Right Corner: Steaming Coffee Mug & Retro Terminal */}
                  <div className="flex items-center gap-3">
                    {showRoomDecor && <TableCoffeeProp />}
                    {showRoomDecor && <RoomCornerTerminal accent={currentPreset.accent} />}
                  </div>
                </div>

                {/* Center Wall Cinema / Ambient Projector Screen */}
                <div className="mt-2 mx-auto w-full max-w-md sm:max-w-lg">
                  {hasRemoteVideo ? (
                    /* Live Video Screen embedded on the room wall */
                    <div className="relative rounded-xl overflow-hidden border-2 border-white/20 bg-black aspect-video max-h-36 sm:max-h-44 shadow-[0_0_30px_rgba(0,0,0,0.8)] group">
                      <video
                        ref={remoteVideoRef as any}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 left-2 bg-[#121216]/90 px-2 py-0.5 rounded text-[11px] font-bold text-[#ededed] border border-white/10 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ed2b3b] animate-pulse" />
                        <span>Экран собеседника</span>
                      </div>
                      <button
                        onClick={() => setIsTheaterMode(true)}
                        className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-[#121216]/90 hover:bg-[#202028] text-xs font-bold text-[#ededed] border border-white/10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Развернуть видео"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Развернуть</span>
                      </button>
                    </div>
                  ) : isScreenActive ? (
                    /* Local Screen Sharing Banner on the Wall */
                    <div className="p-3 rounded-xl border border-[#789d2a]/50 bg-[#141d11]/80 backdrop-blur-xs text-center shadow-lg">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#bbf348]">
                        <ScreenShare className="w-4 h-4 animate-pulse" />
                        <span>Вы транслируете экран на стену гостиной (60 FPS)</span>
                      </div>
                      <p className="text-[11px] text-[#888888] font-mono mt-0.5">
                        Собеседники видят вашу трансляцию в реальном времени
                      </p>
                    </div>
                  ) : (
                    /* Ambient Cyber Screen Display */
                    <div className="relative p-2.5 sm:p-3 rounded-xl border border-white/10 bg-[#0d0d12]/80 backdrop-blur-xs flex items-center justify-between gap-3 shadow-inner">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: currentPreset.accent }}
                        />
                        <div className="text-left">
                          <p className="text-xs font-extrabold uppercase tracking-wider text-[#ededed]">
                            bridgik lounge · p2p space
                          </p>
                          <p className="text-[10px] font-mono text-[#888888]">
                            Opus 48 kHz · E2E DTLS-SRTP
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-[#aaaaaa]">
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: currentPreset.accent }} />
                        <span className="hidden sm:inline">0 байт на сервере</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ============================================================== */}
              {/* THE LIVING ROOM LOUNGE FLOOR: Modular Sofa, Rug & Coffee Table */}
              {/* ============================================================== */}
              <div
                className={`relative px-4 sm:px-8 pt-4 pb-20 mt-4 rounded-b-3xl bg-gradient-to-b ${currentPreset.floorBg} border-t border-white/10`}
                style={{
                  backgroundImage:
                    roomTheme === 'cyber'
                      ? 'radial-gradient(circle, rgba(120,157,42,0.08) 1px, transparent 1px)'
                      : undefined,
                  backgroundSize: roomTheme === 'cyber' ? '18px 18px' : undefined,
                }}
              >
                {/* Center Floor Rug */}
                <div
                  className={`relative max-w-xl mx-auto rounded-3xl border-2 ${currentPreset.rugBorder} p-4 sm:p-6 backdrop-blur-xs`}
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                >
                  {/* Modular Sectional Sofa Body */}
                  <div
                    className={`relative rounded-2xl border-2 ${currentPreset.sofaBg} ${currentPreset.sofaBorder} p-4 sm:p-5 shadow-2xl`}
                  >
                    {/* Sofa Backrest Silhouette Pillows */}
                    <div className="absolute -top-3 left-6 right-6 h-3 rounded-t-xl bg-[#000000]/40 border-t border-x border-white/10" />

                    {/* Participants Sitting on the Sofa Cushions */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 items-center justify-around gap-4 sm:gap-2 relative z-10">
                      {/* Seat 1: Host (You) */}
                      <div className="flex justify-center">
                        <AvatarSeat
                          name={myPeer?.name || 'Quantum Lynx'}
                          isMe={true}
                          deviceType={myPeer?.deviceType}
                          isMicActive={isMicActive}
                          seatLabel="Место 1"
                          accentColor={currentPreset.accent}
                          onToggleMic={onToggleMic}
                        />
                      </div>

                      {/* Seat 2: Peer 1 (Guest or Empty Cushion) */}
                      <div className="flex justify-center">
                        {otherPeers.length > 0 ? (
                          <AvatarSeat
                            name={otherPeers[0].name}
                            isMe={false}
                            deviceType={otherPeers[0].deviceType}
                            isMicActive={true}
                            seatLabel="Место 2"
                            accentColor={currentPreset.accent}
                          />
                        ) : (
                          <EmptySeatCushion
                            seatLabel="Место 2"
                            pin={pin}
                            copied={copiedLink}
                            accentColor={currentPreset.accent}
                            onInvite={handleCopyLink}
                            onOpenQR={onOpenQR}
                          />
                        )}
                      </div>

                      {/* Seat 3: Additional Peer or Cozy Cushion */}
                      <div className="flex justify-center">
                        {otherPeers.length > 1 ? (
                          <AvatarSeat
                            name={otherPeers[1].name}
                            isMe={false}
                            deviceType={otherPeers[1].deviceType}
                            isMicActive={true}
                            seatLabel="Место 3"
                            accentColor={currentPreset.accent}
                          />
                        ) : (
                          <EmptySeatCushion
                            seatLabel="Место 3"
                            pin={pin}
                            copied={copiedLink}
                            accentColor={currentPreset.accent}
                            onInvite={handleCopyLink}
                            onOpenQR={onOpenQR}
                          />
                        )}
                      </div>

                      {/* Seat 4: Additional Peer or Side Armchair */}
                      <div className="flex justify-center">
                        {otherPeers.length > 2 ? (
                          <AvatarSeat
                            name={otherPeers[2].name}
                            isMe={false}
                            deviceType={otherPeers[2].deviceType}
                            isMicActive={true}
                            seatLabel="Место 4"
                            accentColor={currentPreset.accent}
                          />
                        ) : (
                          <div className="flex flex-col items-center opacity-40 select-none">
                            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full border border-dashed border-white/20 bg-[#121218]/40 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-[#777777]" />
                            </div>
                            <span className="text-[10px] font-mono text-[#777777] mt-2">Место 4</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Center Coffee Table positioned in front of sofa */}
                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center">
                      <div
                        className={`px-4 sm:px-6 py-2 rounded-2xl border ${currentPreset.tableBg} ${currentPreset.tableBorder} shadow-xl flex items-center gap-4`}
                      >
                        <TableCenterHub
                          isMicActive={isMicActive}
                          hasActiveAudio={otherPeers.length > 0}
                          accent={currentPreset.accent}
                        />
                        <div className="text-left select-none">
                          <p className="text-xs font-mono font-bold text-[#ededed]">BRIDGIK AUDIO HUB</p>
                          <p className="text-[10px] font-mono text-[#888888]">
                            {isMicActive ? '● Прямой эфир' : '○ Голос наготове'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Bottom Control Dock (HUD - like Discord Living Room dock) */}
                <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl bg-[#141418]/95 border border-white/10 shadow-2xl backdrop-blur-md max-w-[95%]">
                  {/* Mic Toggle Button */}
                  <button
                    onClick={onToggleMic}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isMicActive
                        ? 'bg-[#ed2b3b] hover:bg-[#d92231] text-white shadow-[0_0_12px_rgba(237,43,59,0.5)]'
                        : 'bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10'
                    }`}
                    title={isMicActive ? 'Заглушить микрофон' : 'Включить микрофон'}
                  >
                    {isMicActive ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
                    <span>{isMicActive ? 'Микрофон вкл' : 'Микрофон'}</span>
                  </button>

                  {/* Screen Share Button */}
                  <button
                    onClick={onToggleScreen}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isScreenActive
                        ? 'bg-[#789d2a] hover:bg-[#8cb632] text-white shadow-[0_0_12px_rgba(120,157,42,0.5)]'
                        : 'bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10'
                    }`}
                    title="Демонстрация экрана"
                  >
                    <ScreenShare className="w-4 h-4" />
                    <span className="hidden sm:inline">{isScreenActive ? 'Трансляция...' : 'Экран'}</span>
                  </button>

                  {/* Theme Switcher Button */}
                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      sound.playClick();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Сменить тему комнаты"
                  >
                    <Palette className="w-4 h-4 text-[#9ac43e]" />
                    <span className="hidden md:inline">Стиль</span>
                  </button>

                  {/* QR Code Button */}
                  <button
                    onClick={onOpenQR}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Открыть QR-код"
                  >
                    <QrCode className="w-4 h-4 text-[#9ac43e]" />
                    <span className="hidden sm:inline">QR</span>
                  </button>

                  {/* Copy Link Button */}
                  <button
                    onClick={handleCopyLink}
                    className="px-2.5 py-1.5 rounded-xl bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Скопировать ссылку на гостиную"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-[#9ac43e]" />
                        <span className="text-[#9ac43e] hidden sm:inline">Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Ссылка</span>
                      </>
                    )}
                  </button>

                  {/* Panic Leave Room */}
                  <button
                    onClick={onLeaveRoom}
                    className="px-3 py-1.5 rounded-xl bg-[#ef9282]/15 hover:bg-[#ed2b3b] text-[#ef9282] hover:text-white border border-[#ed2b3b]/30 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer ml-1"
                    title="Завершить сессию"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Выйти</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Meeting Files Drawer / Dropzone */}
          <div className="bg-[#1e1e1e] border border-[#353535] rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#9ac43e]" />
                <h3 className="text-base sm:text-lg font-bold text-[#ededed]">Файлы встречи</h3>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-[#272727] hover:bg-[#333333] text-[#ededed] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3a3a3a]"
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
                    className="p-3 rounded-xl bg-[#141414] border border-[#333333] flex items-center justify-between gap-3 text-sm"
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
                        className="px-3 py-1 rounded-md bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-xs cursor-pointer"
                      >
                        Принять
                      </button>
                    )}

                    {t.status === 'completed' && t.blobUrl && (
                      <a
                        href={t.blobUrl}
                        download={t.name}
                        className="p-1.5 rounded-md bg-[#252525] hover:bg-[#303030] text-[#9ac43e] transition-colors cursor-pointer"
                        title="Скачать файл"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs sm:text-sm text-[#888888] border border-dashed border-[#333333] rounded-xl">
                Перетащите сюда документы или файлы для участников встречи
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scratchpad & Chat (5 cols) */}
        <div className="lg:col-span-5 bg-[#1e1e1e] border border-[#353535] rounded-2xl flex flex-col h-[560px] shadow-md overflow-hidden">
          {/* Tab Header: Notes / Chat */}
          <div className="flex items-center border-b border-[#353535] bg-[#171717]">
            <button
              onClick={() => setActiveSideTab('notes')}
              className={`flex-1 py-3 text-base font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border-b-2 ${
                activeSideTab === 'notes'
                  ? 'border-[#789d2a] text-[#ededed] bg-[#1e1e1e]'
                  : 'border-transparent text-[#888888] hover:text-[#ededed]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#9ac43e]" />
              <span>Общий блокнот</span>
            </button>
            <button
              onClick={() => setActiveSideTab('chat')}
              className={`flex-1 py-3 text-base font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border-b-2 ${
                activeSideTab === 'chat'
                  ? 'border-[#789d2a] text-[#ededed] bg-[#1e1e1e]'
                  : 'border-transparent text-[#888888] hover:text-[#ededed]'
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
                    className="p-1.5 hover:text-white rounded bg-[#272727] hover:bg-[#333333] transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Скопировать весь блокнот"
                  >
                    {copiedNotes ? <Check className="w-3.5 h-3.5 text-[#9ac43e]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNotes ? 'Скопировано' : 'Копировать'}</span>
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="p-1.5 hover:text-white rounded bg-[#272727] hover:bg-[#333333] transition-colors cursor-pointer text-xs flex items-center gap-1"
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
                className="flex-1 w-full bg-[#141414] border border-[#333333] rounded-xl p-3.5 text-base sm:text-lg text-[#ededed] placeholder-[#666666] outline-none focus:border-[#789d2a] resize-none font-mono leading-relaxed transition-colors"
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
                    Сообщений пока нет. Напишите что-нибудь собеседникам в гостиной.
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
                              ? 'bg-[#1b2413] border border-[#789d2a]/50 text-[#d4e8a8]'
                              : 'bg-[#272727] border border-[#353535] text-[#ededed]'
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
              <form onSubmit={handleSendChat} className="p-3 border-t border-[#353535] bg-[#171717] flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Сообщение или ссылка..."
                  className="flex-1 bg-[#141414] border border-[#333333] rounded-xl px-3.5 py-2 text-base text-[#ededed] placeholder-[#666666] outline-none focus:border-[#789d2a] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-[#789d2a] hover:bg-[#8cb632] disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal (Оформление гостиной, позывной и параметры) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#1b1b1f] border border-[#35353f] rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#303038]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#25252e] border border-[#383845] flex items-center justify-center text-[#9ac43e]">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#ededed]">Настройки гостиной</h3>
                  <p className="text-xs text-[#888888]">Оформление комнаты, позывной и звук</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  sound.playClick();
                }}
                className="p-2 rounded-lg bg-[#25252e] hover:bg-[#303038] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-6">
              {/* Section 1: Room Themes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#9ac43e]" />
                    <h4 className="text-base font-bold text-[#ededed]">Интерьер виртуальной гостиной</h4>
                  </div>
                  <span className="text-xs font-mono text-[#888888]">3 темы</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {Object.values(THEME_PRESETS).map((t) => {
                    const isSelected = roomTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTheme(t.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2 ${
                          isSelected
                            ? `bg-[#242430] border-[#9ac43e] shadow-lg`
                            : 'bg-[#15151a] border-[#2f2f3a] hover:border-[#444455]'
                        }`}
                        style={{
                          borderColor: isSelected ? t.accent : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
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
                              Активно
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#888888] leading-relaxed">{t.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Nickname */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[#9ac43e]" />
                  <h4 className="text-base font-bold text-[#ededed]">Ваш позывной в гостиной</h4>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder="Ваше имя или позывной..."
                    maxLength={24}
                    className="flex-1 bg-[#141418] border border-[#33333d] rounded-xl px-3.5 py-2 text-base text-[#ededed] outline-none focus:border-[#789d2a] font-mono transition-colors"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-2 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-white text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {nameSavedSuccess ? <Check className="w-4 h-4" /> : null}
                    <span>{nameSavedSuccess ? 'Сохранено' : 'Сохранить'}</span>
                  </button>
                </div>
              </div>

              {/* Section 3: Room Atmosphere & Sound Toggles */}
              <div className="space-y-3 pt-2 border-t border-[#303038]">
                <h4 className="text-base font-bold text-[#ededed] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#9ac43e]" />
                  <span>Атмосфера и звук</span>
                </h4>

                {/* Decor Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#15151a] border border-[#2f2f3a]">
                  <div className="flex items-center gap-3">
                    <Coffee className="w-4 h-4 text-[#d97706]" />
                    <div>
                      <p className="text-sm font-bold text-[#ededed]">Декор комнаты</p>
                      <p className="text-xs text-[#888888]">Растение монстера, трофеи на полке и кофе</p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleDecor}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      showRoomDecor ? 'bg-[#789d2a]' : 'bg-[#33333d]'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        showRoomDecor ? 'translate-x-6.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Sound Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#15151a] border border-[#2f2f3a]">
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
                      soundEnabled ? 'bg-[#789d2a]' : 'bg-[#33333d]'
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

              {/* Section 4: Security & Codec Info */}
              <div className="p-3.5 rounded-xl bg-[#121216] border border-[#2a2a35] text-xs text-[#888888] space-y-1 font-mono">
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

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#303038] flex justify-end">
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  sound.playClick();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#25252e] hover:bg-[#303038] text-[#ededed] text-sm font-bold transition-colors cursor-pointer"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
