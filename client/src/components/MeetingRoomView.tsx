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
  Settings,
  X,
  Volume2,
  VolumeX,
  Sliders,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Plus,
  Home,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { FileTransfer, Peer, TextMessage } from '../types/index.js';
import { sound } from '../utils/sound.js';

export type RoomId = 'cozy-apartment' | 'cyber-lounge' | 'tech-bunker' | 'rooftop-terrace';

interface RoomSeatDef {
  id: string;
  label: string;
  spotName: string;
  x: number; // percentage from left
  y: number; // percentage from top
}

interface RoomDefinition {
  id: RoomId;
  title: string;
  subtitle: string;
  imageSrc: string;
  width: number;
  height: number;
  accent: string;
  ambientGlow: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  defaultZoom: number;
  zoomOrigin: string;
  seats: RoomSeatDef[];
}

export const ROOM_PRESETS: Record<RoomId, RoomDefinition> = {
  'cozy-apartment': {
    id: 'cozy-apartment',
    title: 'Уютная квартира',
    subtitle: 'Изометрическая студия с диваном, ПК у окна и паркетом',
    imageSrc: '/rooms/cozy-apartment.png',
    width: 911,
    height: 671,
    accent: '#9ac43e',
    ambientGlow: 'radial-gradient(ellipse at 50% 50%, rgba(154, 196, 62, 0.15), transparent 70%)',
    badgeBg: 'bg-[#192414]',
    badgeBorder: 'border-[#789d2a]/60',
    badgeText: 'text-[#9ac43e]',
    defaultZoom: 1.28,
    zoomOrigin: '50% 54%',
    seats: [
      { id: 'seat-1', label: 'Место 1', spotName: 'На кожаном диване (слева)', x: 48, y: 62 },
      { id: 'seat-2', label: 'Место 2', spotName: 'На кожаном диване (по центру)', x: 54, y: 60 },
      { id: 'seat-3', label: 'Место 3', spotName: 'На кожаном диване (справа)', x: 60, y: 58 },
      { id: 'seat-4', label: 'Место 4', spotName: 'За рабочим ПК у окна', x: 64, y: 44 },
      { id: 'seat-5', label: 'Место 5', spotName: 'За обеденным столом (слева)', x: 74, y: 61 },
      { id: 'seat-6', label: 'Место 6', spotName: 'За обеденным столом (справа)', x: 82, y: 59 },
      { id: 'seat-7', label: 'Место 7', spotName: 'У журнального столика', x: 39, y: 56 },
      { id: 'seat-8', label: 'Место 8', spotName: 'На мягком ковре', x: 44, y: 54 },
      { id: 'seat-9', label: 'Место 9', spotName: 'У книжного стеллажа', x: 50, y: 43 },
      { id: 'seat-10', label: 'Место 10', spotName: 'У прихожей', x: 32, y: 84 },
    ],
  },
  'cyber-lounge': {
    id: 'cyber-lounge',
    title: 'Кибер-лаундж',
    subtitle: 'Неоновый лаундж в стиле bridgik с модульным диваном и ПК',
    imageSrc: '/rooms/cyber-lounge.jpg',
    width: 1200,
    height: 896,
    accent: '#9ac43e',
    ambientGlow: 'radial-gradient(ellipse at 50% 50%, rgba(120, 157, 42, 0.2), transparent 70%)',
    badgeBg: 'bg-[#152212]',
    badgeBorder: 'border-[#9ac43e]/60',
    badgeText: 'text-[#bbf348]',
    defaultZoom: 1.26,
    zoomOrigin: '50% 55%',
    seats: [
      { id: 'seat-1', label: 'Место 1', spotName: 'На модульном диване (центр)', x: 51, y: 47 },
      { id: 'seat-2', label: 'Место 2', spotName: 'На модульном диване (слева)', x: 42, y: 52 },
      { id: 'seat-3', label: 'Место 3', spotName: 'На модульном диване (справа)', x: 62, y: 49 },
      { id: 'seat-4', label: 'Место 4', spotName: 'На угловой кушетке', x: 46, y: 58 },
      { id: 'seat-5', label: 'Место 5', spotName: 'За игровым терминалом', x: 23, y: 56 },
      { id: 'seat-6', label: 'Место 6', spotName: 'У боевой станции ПК', x: 30, y: 52 },
      { id: 'seat-7', label: 'Место 7', spotName: 'У голографического столика', x: 48, y: 68 },
      { id: 'seat-8', label: 'Место 8', spotName: 'Перед голографическим столиком', x: 62, y: 65 },
      { id: 'seat-9', label: 'Место 9', spotName: 'У неоновой монстеры', x: 76, y: 68 },
      { id: 'seat-10', label: 'Место 10', spotName: 'На тёмном глянцевом полу', x: 36, y: 74 },
    ],
  },
  'tech-bunker': {
    id: 'tech-bunker',
    title: 'Секретный бункер',
    subtitle: 'Подземный командный пункт с серверами и CRT-терминалами',
    imageSrc: '/rooms/tech-bunker.jpg',
    width: 1200,
    height: 896,
    accent: '#f97316',
    ambientGlow: 'radial-gradient(ellipse at 50% 50%, rgba(249, 115, 22, 0.18), transparent 70%)',
    badgeBg: 'bg-[#281c13]',
    badgeBorder: 'border-[#f97316]/60',
    badgeText: 'text-[#fb923c]',
    defaultZoom: 1.25,
    zoomOrigin: '50% 55%',
    seats: [
      { id: 'seat-1', label: 'Место 1', spotName: 'За командным пультом', x: 40, y: 54 },
      { id: 'seat-2', label: 'Место 2', spotName: 'У пульта второго пилота', x: 48, y: 52 },
      { id: 'seat-3', label: 'Место 3', spotName: 'У серверной стойки', x: 65, y: 56 },
      { id: 'seat-4', label: 'Место 4', spotName: 'За тактическим столом', x: 28, y: 68 },
      { id: 'seat-5', label: 'Место 5', spotName: 'У радарной консоли', x: 73, y: 63 },
      { id: 'seat-6', label: 'Место 6', spotName: 'На стальной решётке', x: 52, y: 66 },
      { id: 'seat-7', label: 'Место 7', spotName: 'У аварийного пульта', x: 58, y: 76 },
      { id: 'seat-8', label: 'Место 8', spotName: 'На бронированном пуфе', x: 36, y: 76 },
      { id: 'seat-9', label: 'Место 9', spotName: 'У ящика снабжения', x: 22, y: 76 },
      { id: 'seat-10', label: 'Место 10', spotName: 'У резервного генератора', x: 80, y: 74 },
    ],
  },
  'rooftop-terrace': {
    id: 'rooftop-terrace',
    title: 'Крыша пентхауса',
    subtitle: 'Открытая ночная терраса с фонариками и панорамой кибер-города',
    imageSrc: '/rooms/rooftop-terrace.jpg',
    width: 1200,
    height: 896,
    accent: '#38bdf8',
    ambientGlow: 'radial-gradient(ellipse at 50% 50%, rgba(56, 189, 248, 0.18), transparent 70%)',
    badgeBg: 'bg-[#122332]',
    badgeBorder: 'border-[#38bdf8]/60',
    badgeText: 'text-[#7dd3fc]',
    defaultZoom: 1.26,
    zoomOrigin: '50% 55%',
    seats: [
      { id: 'seat-1', label: 'Место 1', spotName: 'На диване под гирляндой (слева)', x: 45, y: 58 },
      { id: 'seat-2', label: 'Место 2', spotName: 'На диване под гирляндой (справа)', x: 55, y: 56 },
      { id: 'seat-3', label: 'Место 3', spotName: 'У панорамного телескопа', x: 25, y: 63 },
      { id: 'seat-4', label: 'Место 4', spotName: 'В лаундж-кресле с фонарём', x: 68, y: 60 },
      { id: 'seat-5', label: 'Место 5', spotName: 'В деревянном шезлонге', x: 35, y: 68 },
      { id: 'seat-6', label: 'Место 6', spotName: 'На деревянной террасе', x: 48, y: 74 },
      { id: 'seat-7', label: 'Место 7', spotName: 'У цветочного вазона', x: 60, y: 68 },
      { id: 'seat-8', label: 'Место 8', spotName: 'У парапета с видом на город', x: 75, y: 70 },
      { id: 'seat-9', label: 'Место 9', spotName: 'У уютного столика', x: 38, y: 52 },
      { id: 'seat-10', label: 'Место 10', spotName: 'На передней террасе', x: 58, y: 80 },
    ],
  },
};

const sanitizeRoomId = (val: string | null): RoomId => {
  if (val && val in ROOM_PRESETS) return val as RoomId;
  return 'cozy-apartment';
};

// Interactive Pixel Avatar Token (minimalistic, details revealed on hover only)
interface PixelAvatarSeatProps {
  name: string;
  isMe: boolean;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | string;
  isMicActive: boolean;
  spotName: string;
  accentColor: string;
  onToggleMic?: () => void;
}

const PixelAvatarSeat: React.FC<PixelAvatarSeatProps> = ({
  name,
  isMe,
  deviceType,
  isMicActive,
  spotName,
  accentColor,
  onToggleMic,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isMe ? onToggleMic : undefined}
    >
      {/* Floating Tooltip: ONLY VISIBLE ON HOVER */}
      <div
        className={`absolute -top-11 z-30 transition-all duration-200 pointer-events-none flex flex-col items-center ${
          isHovered ? 'opacity-100 -translate-y-1 scale-100' : 'opacity-0 translate-y-1 scale-95'
        }`}
      >
        <div className="px-3 py-1 rounded-lg bg-[#0e0e14]/95 border border-white/20 shadow-2xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap">
          <span
            className={`w-2 h-2 rounded-full ${isMicActive ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: isMicActive ? accentColor : '#666677' }}
          />
          <span className="text-xs font-bold text-[#ededed] font-mono">
            {name} {isMe ? '(Вы)' : ''}
          </span>
          <span className="text-[10px] text-[#aaaaaa] font-mono">
            · {spotName}
          </span>
          {isMe && (
            <span className="text-[10px] text-[#9ac43e] font-mono border-l border-white/10 pl-1.5">
              {isMicActive ? 'клик: выкл' : 'клик: вкл'}
            </span>
          )}
        </div>
        <div className="w-2 h-1 bg-[#0e0e14] border-r border-b border-white/20 rotate-45 -mt-0.5" />
      </div>

      {/* Speech Halo & Avatar Circle */}
      <div className="relative flex items-center justify-center">
        {isMicActive && (
          <div
            className="absolute -inset-2 rounded-full border-2 animate-speech-halo pointer-events-none"
            style={{ borderColor: accentColor }}
          />
        )}

        {/* Live Equalizer bars floating above avatar when speaking */}
        {isMicActive && (
          <div
            className="absolute -top-4 flex items-end gap-0.5 h-3 px-1 py-0.5 rounded bg-[#101014]/95 border shadow-sm pointer-events-none"
            style={{ borderColor: `${accentColor}80` }}
            title="Голос передается"
          >
            <span className="w-0.5 rounded-xs animate-eq-1" style={{ backgroundColor: accentColor }} />
            <span className="w-0.5 rounded-xs animate-eq-2" style={{ backgroundColor: accentColor }} />
            <span className="w-0.5 rounded-xs animate-eq-3" style={{ backgroundColor: accentColor }} />
            <span className="w-0.5 rounded-xs animate-eq-4" style={{ backgroundColor: accentColor }} />
          </div>
        )}

        {/* Clean Avatar Token without any distracting text on the furniture */}
        <div
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-2xl relative cursor-pointer ${
            isHovered ? 'scale-115 ring-2 ring-white/50' : 'hover:scale-105'
          } ${isMicActive ? 'bg-[#152414] text-[#bbf348]' : 'bg-[#191922] text-[#ededed]'}`}
          style={{
            borderColor: isMicActive ? accentColor : isHovered ? '#ffffff' : '#444455',
            color: isMicActive ? accentColor : '#ededed',
            boxShadow: isMicActive ? `0 0 16px ${accentColor}80` : '0 4px 12px rgba(0,0,0,0.7)',
          }}
        >
          {deviceType === 'mobile' ? (
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
          )}

          {/* Mini mic badge on corner */}
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-[#121218] flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: isMicActive ? accentColor : '#33333d' }}
          >
            {isMicActive ? <Mic className="w-2 h-2 animate-pulse" /> : <MicOff className="w-2 h-2 text-[#888888]" />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive Empty Seat (subtle marker, shows prompt on hover only)
interface EmptyPixelSeatProps {
  spotName: string;
  pin: string;
  copied: boolean;
  accentColor: string;
  onInvite: () => void;
}

const EmptyPixelSeat: React.FC<EmptyPixelSeatProps> = ({
  spotName,
  pin,
  copied,
  accentColor,
  onInvite,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onInvite}
    >
      {/* Tooltip on hover */}
      <div
        className={`absolute -top-10 z-30 transition-all duration-200 pointer-events-none flex flex-col items-center ${
          isHovered || copied ? 'opacity-100 -translate-y-1 scale-100' : 'opacity-0 translate-y-1 scale-95'
        }`}
      >
        <div className="px-2.5 py-1 rounded-lg bg-[#0e0e14]/95 border border-white/20 shadow-2xl backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#9ac43e]" />
              <span className="text-xs font-bold text-[#9ac43e] font-mono">
                Ссылка скопирована!
              </span>
            </>
          ) : (
            <>
              <Share2 className="w-3 h-3 text-white/70" />
              <span className="text-xs font-bold text-[#ededed] font-mono">
                Пригласить: {spotName} (PIN: {pin})
              </span>
            </>
          )}
        </div>
        <div className="w-2 h-1 bg-[#0e0e14] border-r border-b border-white/20 rotate-45 -mt-0.5" />
      </div>

      {/* Minimal clean empty cushion marker */}
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-200 shadow-md ${
          isHovered
            ? 'scale-115 border-white bg-[#1e1e28]/90 shadow-xl'
            : 'border-white/25 bg-[#121218]/40 hover:border-white/50'
        }`}
        style={{
          borderColor: copied ? accentColor : isHovered ? accentColor : undefined,
        }}
      >
        <Plus
          className={`w-3.5 h-3.5 transition-colors ${
            isHovered ? 'text-white' : 'text-white/40'
          }`}
          style={{ color: copied ? accentColor : isHovered ? accentColor : undefined }}
        />
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

  // Active Room Concept State
  const [currentRoomId, setCurrentRoomId] = useState<RoomId>(() => {
    return sanitizeRoomId(localStorage.getItem('bridgik_pixel_room'));
  });

  // Immersive Zoom State: Enabled by default so the room fills the frame and doesn't look like a floating chunk!
  const [isImmersiveZoom, setIsImmersiveZoom] = useState<boolean>(() => {
    return localStorage.getItem('bridgik_room_zoom') !== 'false';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRoomPickerOpen, setIsRoomPickerOpen] = useState(false);
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

  const handleSelectRoom = (roomId: RoomId) => {
    setCurrentRoomId(roomId);
    localStorage.setItem('bridgik_pixel_room', roomId);
    setIsRoomPickerOpen(false);
    sound.playClick();
  };

  const handleToggleZoom = () => {
    const next = !isImmersiveZoom;
    setIsImmersiveZoom(next);
    localStorage.setItem('bridgik_room_zoom', next ? 'true' : 'false');
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
  const currentRoom = ROOM_PRESETS[currentRoomId] || ROOM_PRESETS['cozy-apartment'];

  // Total active participants in room
  const totalParticipants = 1 + otherPeers.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      {/* Top Header Bar */}
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
              {peers.length} {peers.length === 1 ? 'участник' : 'участников'} в комнате
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Room Selector Badge */}
          <button
            onClick={() => {
              setIsRoomPickerOpen(!isRoomPickerOpen);
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${currentRoom.badgeBg} ${currentRoom.badgeBorder} ${currentRoom.badgeText} hover:brightness-110`}
            title="Выбрать другую локацию"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Локация: {currentRoom.title}</span>
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

      {/* Main Grid: Left = Isometric Pixel Diorama Stage + Files; Right = Notes & Chat */}
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
                <span>Вернуться в комнату</span>
              </button>
            </div>
          ) : (
            /* ============================================================== */
            /* IMMERSIVE ISOMETRIC ROOM (CONTINUOUS ENVIRONMENT, NOT FLOATING) */
            /* ============================================================== */
            <div
              className="relative rounded-3xl border-2 border-[#33333e] bg-[#0c0c12] shadow-2xl overflow-hidden flex flex-col items-center justify-center"
              style={{
                backgroundImage: currentRoom.ambientGlow,
              }}
            >
              {/* Room Top Minimal Bar */}
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0c0c14]/90 border border-white/10 shadow-lg backdrop-blur-xs pointer-events-auto">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: currentRoom.accent }}
                  />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#ededed]">
                    {currentRoom.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                  {/* Zoom / Framing Toggle Button */}
                  <button
                    onClick={handleToggleZoom}
                    className="p-1.5 rounded-xl bg-[#0c0c14]/90 border border-white/10 hover:border-white/30 text-[#ededed] shadow-lg backdrop-blur-xs transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title={isImmersiveZoom ? 'Отдалить (показать диораму целиком)' : 'Приблизить (полное погружение в интерьер)'}
                  >
                    {isImmersiveZoom ? <ZoomOut className="w-3.5 h-3.5 text-[#9ac43e]" /> : <ZoomIn className="w-3.5 h-3.5" />}
                    <span className="text-[11px] font-mono hidden sm:inline">
                      {isImmersiveZoom ? 'Интерьер' : 'Диорама'}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0c0c14]/90 border border-white/10 shadow-lg backdrop-blur-xs text-[11px] font-mono text-[#aaaaaa]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9ac43e]" />
                    <span>P2P</span>
                  </div>
                </div>
              </div>

              {/* Diorama Container: Uses Immersive Scaling so the room extends to the walls and doesn't float in void! */}
              <div
                className="relative w-full max-h-[520px] flex items-center justify-center overflow-hidden"
                style={{
                  aspectRatio: `${currentRoom.width} / ${currentRoom.height}`,
                }}
              >
                {/* Scaled Room Interior Layer (Moves cutaway void outside the viewport) */}
                <div
                  className="relative w-full h-full transition-transform duration-500 ease-out"
                  style={{
                    transform: isImmersiveZoom ? `scale(${currentRoom.defaultZoom})` : 'scale(1)',
                    transformOrigin: currentRoom.zoomOrigin,
                  }}
                >
                  {/* Pixel Art Background */}
                  <img
                    src={currentRoom.imageSrc}
                    alt={currentRoom.title}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    style={{
                      imageRendering: 'pixelated',
                    }}
                  />

                  {/* Subtle Scanline Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-15"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
                      backgroundSize: '100% 4px',
                    }}
                  />

                  {/* ============================================================== */}
                  {/* PARTICIPANT SEATS PINNED TO EXACT PIXEL FURNITURE SPOTS        */}
                  {/* ACCOMMODATES MAXIMUM PARTICIPANTS (UP TO 10+ SEATS)           */}
                  {/* ============================================================== */}
                  {currentRoom.seats.map((seat, index) => {
                    let seatContent: React.ReactNode = null;

                    if (index === 0) {
                      // Seat 1: Host (You)
                      seatContent = (
                        <PixelAvatarSeat
                          name={myPeer?.name || 'Quantum Lynx'}
                          isMe={true}
                          deviceType={myPeer?.deviceType}
                          isMicActive={isMicActive}
                          spotName={seat.spotName}
                          accentColor={currentRoom.accent}
                          onToggleMic={onToggleMic}
                        />
                      );
                    } else if (index < totalParticipants) {
                      // Peer sits here (Peer 1, Peer 2, Peer 3... Peer 9)
                      const peerIndex = index - 1;
                      const peer = otherPeers[peerIndex];
                      if (peer) {
                        seatContent = (
                          <PixelAvatarSeat
                            name={peer.name}
                            isMe={false}
                            deviceType={peer.deviceType}
                            isMicActive={true}
                            spotName={seat.spotName}
                            accentColor={currentRoom.accent}
                          />
                        );
                      }
                    } else if (index === totalParticipants || (totalParticipants < 3 && index < 3)) {
                      // Show the NEXT available empty seat(s) as inviting subtle + markers!
                      seatContent = (
                        <EmptyPixelSeat
                          spotName={seat.spotName}
                          pin={pin}
                          copied={copiedLink}
                          accentColor={currentRoom.accent}
                          onInvite={handleCopyLink}
                        />
                      );
                    } else {
                      // Extra unoccupied spots are kept invisible until more peers join, keeping room clean!
                      seatContent = null;
                    }

                    if (!seatContent) return null;

                    return (
                      <div
                        key={seat.id}
                        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                        style={{
                          left: `${seat.x}%`,
                          top: `${seat.y}%`,
                        }}
                      >
                        {seatContent}
                      </div>
                    );
                  })}
                </div>

                {/* Screen Share Overlay in Room Corner (if screen sharing is active) */}
                {hasRemoteVideo && (
                  <div className="absolute top-12 right-4 z-20 w-36 sm:w-48 aspect-video rounded-lg overflow-hidden border-2 border-white/30 shadow-2xl bg-black group">
                    <video
                      ref={remoteVideoRef as any}
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => setIsTheaterMode(true)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4 mr-1" />
                      <span>Развернуть</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Floating Bottom Control Dock (HUD) */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl bg-[#121218]/95 border border-white/15 shadow-2xl backdrop-blur-md max-w-[95%]">
                {/* Mic Button */}
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

                {/* Room Selector Trigger */}
                <button
                  onClick={() => {
                    setIsRoomPickerOpen(!isRoomPickerOpen);
                    sound.playClick();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Выбрать другую локацию"
                >
                  <Home className="w-4 h-4 text-[#9ac43e]" />
                  <span className="hidden md:inline">Локация</span>
                </button>

                {/* QR Code Button */}
                <button
                  onClick={onOpenQR}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Показать QR-код"
                >
                  <QrCode className="w-4 h-4 text-[#9ac43e]" />
                  <span className="hidden sm:inline">QR</span>
                </button>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1.5 rounded-xl bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Скопировать ссылку на комнату"
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

                {/* Panic Leave Button */}
                <button
                  onClick={onLeaveRoom}
                  className="px-3 py-1.5 rounded-xl bg-[#ef9282]/15 hover:bg-[#ed2b3b] text-[#ef9282] hover:text-white border border-[#ed2b3b]/30 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer ml-1"
                  title="Завершить встречу"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Выйти</span>
                </button>
              </div>

              {/* Quick Room Picker Popover */}
              {isRoomPickerOpen && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-[#14141c] border border-white/20 rounded-2xl p-3 shadow-2xl w-84 max-w-[95%] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-[#ededed] uppercase font-mono tracking-wider">
                      Выберите локацию:
                    </span>
                    <button
                      onClick={() => setIsRoomPickerOpen(false)}
                      className="p-1 rounded text-[#888888] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {Object.values(ROOM_PRESETS).map((r) => {
                      const isSelected = currentRoomId === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => handleSelectRoom(r.id)}
                          className={`w-full p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#222230] border-[#9ac43e]'
                              : 'bg-[#181820] border-white/5 hover:border-white/20'
                          }`}
                        >
                          <img
                            src={r.imageSrc}
                            alt={r.title}
                            className="w-12 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold text-[#ededed] truncate">{r.title}</p>
                            <p className="text-[10px] text-[#888888] truncate">{r.subtitle}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#9ac43e] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                    Сообщений пока нет. Напишите что-нибудь собеседникам в комнате.
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

      {/* Settings Modal */}
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
                  <h3 className="text-xl font-extrabold text-[#ededed]">Настройки комнаты</h3>
                  <p className="text-xs text-[#888888]">Выбор локации, масштаб, позывной и звук</p>
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
              {/* Section 1: Choose Room Location */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-[#9ac43e]" />
                    <h4 className="text-base font-bold text-[#ededed]">Локация комнаты</h4>
                  </div>
                  <span className="text-xs font-mono text-[#888888]">вместимость: 10 мест</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(ROOM_PRESETS).map((r) => {
                    const isSelected = currentRoomId === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleSelectRoom(r.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col gap-2 ${
                          isSelected
                            ? 'bg-[#222230] border-[#9ac43e] shadow-lg'
                            : 'bg-[#15151a] border-[#2f2f3a] hover:border-[#444455]'
                        }`}
                      >
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-white/10">
                          <img
                            src={r.imageSrc}
                            alt={r.title}
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#789d2a] text-white shadow-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Выбрано</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-[#ededed]">{r.title}</p>
                          <p className="text-xs text-[#888888] leading-tight mt-0.5">{r.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Immersive Scale Toggle */}
              <div className="space-y-3 pt-2 border-t border-[#303038]">
                <h4 className="text-base font-bold text-[#ededed] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#9ac43e]" />
                  <span>Отображение комнаты</span>
                </h4>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#15151a] border border-[#2f2f3a]">
                  <div>
                    <p className="text-sm font-bold text-[#ededed]">Полное погружение в интерьер</p>
                    <p className="text-xs text-[#888888]">Стены и пол продолжаются до краев экрана без ощущения висящей в воздухе диорамы</p>
                  </div>
                  <button
                    onClick={handleToggleZoom}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      isImmersiveZoom ? 'bg-[#789d2a]' : 'bg-[#33333d]'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        isImmersiveZoom ? 'translate-x-6.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Section 3: Nickname */}
              <div className="space-y-2 pt-2 border-t border-[#303038]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#9ac43e]" />
                  <h4 className="text-base font-bold text-[#ededed]">Ваш позывной в комнате</h4>
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

              {/* Section 4: Sound Toggles */}
              <div className="space-y-3 pt-2 border-t border-[#303038]">
                <h4 className="text-base font-bold text-[#ededed] flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#9ac43e]" />
                  <span>Звуковые эффекты</span>
                </h4>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#15151a] border border-[#2f2f3a]">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-[#9ac43e]" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-[#888888]" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-[#ededed]">8-битные звуки</p>
                      <p className="text-xs text-[#888888]">Щелчки кнопок и уведомления чата</p>
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

              {/* Section 5: Security Info */}
              <div className="p-3.5 rounded-xl bg-[#121216] border border-[#2a2a35] text-xs text-[#888888] space-y-1 font-mono">
                <div className="flex items-center justify-between text-[#ededed] font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9ac43e]" />
                    Шифрование комнаты
                  </span>
                  <span className="text-[#9ac43e]">E2E DTLS-SRTP</span>
                </div>
                <p>Аудиокодек: Opus 48 kHz (динамический битрейт 32-128 kbps)</p>
                <p>Вместимость: до 10 участников в P2P Mesh · 0 байт на сервере</p>
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
