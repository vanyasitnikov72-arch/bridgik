import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
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
  ShieldCheck,
  Plus,
  Home,
  CheckCircle2,
  Crown,
  UserX,
  Lock,
  Unlock,
  Armchair,
  Smile,
  Eye,
  Music,
  Film,
  Sparkles,
} from 'lucide-react';
import { FileTransfer, Peer, TextMessage } from '../types/index.js';
import { sound } from '../utils/sound.js';
import { EmotePicker } from './EmotePicker.js';
import { ChatMessageBubble } from './ChatMessageBubble.js';
import { CustomAudioPlayer } from './CustomAudioPlayer.js';
import { CustomVideoPlayer } from './CustomVideoPlayer.js';
import { getAvatarForName, MASCOT_AVATARS } from '../utils/device.js';

export type RoomId = 'cyber-lounge' | 'cozy-loft' | 'skyline-penthouse' | 'retro-lounge';

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
  accent: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  seats: RoomSeatDef[]; // Exactly 8 organic spots on real furniture
}

export const ROOM_PRESETS: Record<RoomId, RoomDefinition> = {
  'cyber-lounge': {
    id: 'cyber-lounge',
    title: 'Кибер-гостиная',
    subtitle: 'Полноразмерный неоновый лаундж со стриминг-терминалами и диваном',
    imageSrc: '/rooms/cyber-lounge.jpg',
    accent: '#9ac43e',
    badgeBg: 'bg-[#152212]',
    badgeBorder: 'border-[#9ac43e]/60',
    badgeText: 'text-[#bbf348]',
    seats: [
      { id: 'seat-1', label: 'Место 1', spotName: 'На модульном диване (центр)', x: 44.5, y: 65.5 },
      { id: 'seat-2', label: 'Место 2', spotName: 'На модульном диване (слева)', x: 36.5, y: 66.5 },
      { id: 'seat-3', label: 'Место 3', spotName: 'На модульном диване (справа)', x: 57.5, y: 66.5 },
      { id: 'seat-4', label: 'Место 4', spotName: 'На угловой кушетке дивана', x: 66.5, y: 67.5 },
      { id: 'seat-5', label: 'Место 5', spotName: 'В неоновом лаундж-кресле слева', x: 20.5, y: 74.5 },
      { id: 'seat-6', label: 'Место 6', spotName: 'В неоновом лаундж-кресле справа', x: 79.5, y: 73.5 },
      { id: 'seat-7', label: 'Место 7', spotName: 'В игровом кресле за левым терминалом', x: 23.5, y: 56.5 },
      { id: 'seat-8', label: 'Место 8', spotName: 'В игровом кресле за правым терминалом', x: 82.0, y: 56.5 },
    ],
  },
  'cozy-loft': {
    id: 'cozy-loft',
    title: 'Уютный лофт',
    subtitle: 'Просторная гостиная с паркетом, кожаным диваном и окнами в пол',
    imageSrc: '/rooms/cozy-loft.jpg',
    accent: '#f59e0b',
    badgeBg: 'bg-[#291b12]',
    badgeBorder: 'border-[#f59e0b]/60',
    badgeText: 'text-[#fbbf24]',
    seats: [
      { id: 'seat-1', label: 'Место 1', spotName: 'На кожаном диване (центр)', x: 57.5, y: 62.0 },
      { id: 'seat-2', label: 'Место 2', spotName: 'На кожаном диване (слева)', x: 48.0, y: 61.0 },
      { id: 'seat-3', label: 'Место 3', spotName: 'На кожаном диване (справа)', x: 74.0, y: 61.5 },
      { id: 'seat-4', label: 'Место 4', spotName: 'На угловой секции дивана', x: 83.5, y: 65.0 },
      { id: 'seat-5', label: 'Место 5', spotName: 'В темном деревянном кресле слева', x: 41.5, y: 76.0 },
      { id: 'seat-6', label: 'Место 6', spotName: 'В плетеном кресле справа', x: 86.0, y: 79.0 },
      { id: 'seat-7', label: 'Место 7', spotName: 'В кресле за рабочим столом с ноутбуком', x: 16.5, y: 64.0 },
      { id: 'seat-8', label: 'Место 8', spotName: 'В круглом джутовом пуфе', x: 67.5, y: 76.5 },
    ],
  },
  'skyline-penthouse': {
    id: 'skyline-penthouse',
    title: 'Скайлайн-пентхаус',
    subtitle: 'Открытая панорамная гостиная с видом на ночной кибер-город',
    imageSrc: '/rooms/skyline-penthouse.jpg',
    accent: '#38bdf8',
    badgeBg: 'bg-[#122332]',
    badgeBorder: 'border-[#38bdf8]/60',
    badgeText: 'text-[#7dd3fc]',
    seats: [
      { id: 'seat-1', label: 'Место 1', spotName: 'На полукруглом диване (центр)', x: 50.0, y: 65.0 },
      { id: 'seat-2', label: 'Место 2', spotName: 'На полукруглом диване (слева)', x: 43.0, y: 66.0 },
      { id: 'seat-3', label: 'Место 3', spotName: 'На полукруглом диване (справа)', x: 58.0, y: 65.0 },
      { id: 'seat-4', label: 'Место 4', spotName: 'На кушетке дивана', x: 65.0, y: 67.0 },
      { id: 'seat-5', label: 'Место 5', spotName: 'В изумрудном клубном кресле', x: 30.0, y: 73.0 },
      { id: 'seat-6', label: 'Место 6', spotName: 'В синем велюровом кресле', x: 77.0, y: 70.0 },
      { id: 'seat-7', label: 'Место 7', spotName: 'На круглом синем пуфе', x: 71.0, y: 78.0 },
      { id: 'seat-8', label: 'Место 8', spotName: 'За барной стойкой на высоком стуле', x: 88.5, y: 58.0 },
    ],
  },
  'retro-lounge': {
    id: 'retro-lounge',
    title: 'Ретро-гостиная 98-го',
    subtitle: 'Атмосферный подвал с винтажным вельветовым диваном, креслами и ПК',
    imageSrc: '/rooms/retro-lounge.jpg',
    accent: '#ec4899',
    badgeBg: 'bg-[#291322]',
    badgeBorder: 'border-[#ec4899]/60',
    badgeText: 'text-[#f472b6]',
    seats: [
      { id: 'seat-1', label: 'Место 1', spotName: 'На вельветовом диване (центр)', x: 50.5, y: 62.5 },
      { id: 'seat-2', label: 'Место 2', spotName: 'На вельветовом диване (слева)', x: 42.0, y: 62.5 },
      { id: 'seat-3', label: 'Место 3', spotName: 'На вельветовом диване (справа)', x: 59.0, y: 62.5 },
      { id: 'seat-4', label: 'Место 4', spotName: 'В оливковом кресле с «ушами»', x: 29.0, y: 62.0 },
      { id: 'seat-5', label: 'Место 5', spotName: 'В бордовом кресле справа', x: 72.5, y: 65.0 },
      { id: 'seat-6', label: 'Место 6', spotName: 'В компьютерном кресле у ПК с Win98', x: 83.5, y: 71.5 },
      { id: 'seat-7', label: 'Место 7', spotName: 'В бирюзовом бинбэге слева', x: 29.0, y: 80.0 },
      { id: 'seat-8', label: 'Место 8', spotName: 'В оранжевом бинбэге справа', x: 72.0, y: 80.0 },
    ],
  },
};

const sanitizeRoomId = (val: string | null): RoomId => {
  if (val && val in ROOM_PRESETS) return val as RoomId;
  return 'cyber-lounge';
};

// Interactive Avatar Token (clean on furniture, details only on hover)
interface PixelAvatarSeatProps {
  name: string;
  avatar?: string;
  isMe: boolean;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | string;
  isMicActive: boolean;
  spotName: string;
  accentColor: string;
  isHost?: boolean;
  isAdmin?: boolean;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  onToggleMic?: () => void;
  onKick?: () => void;
}

const PixelAvatarSeat: React.FC<PixelAvatarSeatProps> = ({
  name,
  avatar,
  isMe,
  deviceType,
  isMicActive,
  spotName,
  accentColor,
  isHost,
  isAdmin,
  adminFrame = 'gold',
  onToggleMic,
  onKick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getSeatFrameClass = () => {
    if (!isAdmin || adminFrame === 'none') {
      return '';
    }
    if (adminFrame === 'rgb') {
      return 'animate-admin-rgb border-sky-400';
    }
    if (adminFrame === 'plasma') {
      return 'animate-admin-plasma border-purple-400';
    }
    return 'animate-admin-gold border-amber-400';
  };

  return (
    <div
      className="relative flex flex-col items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isMe ? onToggleMic : undefined}
    >
      {/* Floating Tooltip: ONLY VISIBLE ON HOVER */}
      <div
        className={`absolute -top-11 z-30 transition-all duration-200 flex flex-col items-center ${
          isHovered
            ? 'opacity-100 -translate-y-1 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-1 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-3 py-1.5 rounded-xl bg-[#0e0e14]/95 border border-white/20 shadow-2xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap">
          <span
            className={`w-2 h-2 rounded-full ${isMicActive ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: isMicActive ? accentColor : '#666677' }}
          />
          {isAdmin && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 flex items-center gap-0.5">
              👑 DEV
            </span>
          )}
          <span className={`text-xs font-bold font-mono ${isAdmin ? 'admin-name-shimmer' : 'text-[#ededed]'}`}>
            {name} {isMe ? '(Вы)' : ''}
          </span>
          <span className="text-[10px] text-[#aaaaaa] font-mono flex items-center gap-1">
            {deviceType === 'mobile' ? (
              <Smartphone className="w-2.5 h-2.5 text-[#9ac43e]" />
            ) : (
              <Monitor className="w-2.5 h-2.5 text-[#9ac43e]" />
            )}
            · {spotName}
          </span>
          {isMe && (
            <span
              className="text-[10px] text-[#9ac43e] font-mono border-l border-white/10 pl-1.5 cursor-pointer hover:underline"
              onClick={onToggleMic}
            >
              {isMicActive ? 'клик: заглушить' : 'клик: говорить'}
            </span>
          )}
          {!isMe && isHost && onKick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onKick();
              }}
              className="text-[10px] text-red-400 font-mono border-l border-white/10 pl-1.5 hover:text-red-300 flex items-center gap-0.5 cursor-pointer"
              title="Исключить участника из комнаты"
            >
              <UserX className="w-2.5 h-2.5" />
              Кик
            </button>
          )}
        </div>
        <div className="w-2 h-1 bg-[#0e0e14] border-r border-b border-white/20 rotate-45 -mt-0.5" />
      </div>

      {/* Speech Halo & Avatar Circle sitting firmly on furniture */}
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

        {/* Avatar Token sitting cleanly on the furniture */}
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-2xl relative cursor-pointer drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] overflow-hidden ${
            isHovered ? 'scale-115 ring-2 ring-white/50' : 'hover:scale-105'
          } ${isMicActive ? 'bg-[#152414]' : 'bg-[#191922]'} ${getSeatFrameClass()}`}
          style={{
            borderColor: isAdmin && adminFrame !== 'none'
              ? undefined
              : (isMicActive ? accentColor : isHovered ? '#ffffff' : '#444455'),
            boxShadow: isAdmin && adminFrame !== 'none'
              ? undefined
              : (isMicActive ? `0 0 16px ${accentColor}80` : '0 4px 12px rgba(0,0,0,0.7)'),
          }}
        >
          <img
            src={avatar || getAvatarForName(name)}
            alt={name}
            className="w-full h-full object-cover pointer-events-none select-none drop-shadow-sm"
            style={{ imageRendering: 'pixelated' }}
          />

          {isAdmin && adminFrame !== 'none' && (
            <span className="absolute -top-1 -right-0.5 text-[10px] select-none filter drop-shadow-[0_0_4px_rgba(245,158,11,0.8)] z-20">
              👑
            </span>
          )}

          {/* Corner Mic Indicator */}
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-[#121218] flex items-center justify-center text-white shadow-xs z-10"
            style={{ backgroundColor: isMicActive ? accentColor : '#33333d' }}
          >
            {isMicActive ? <Mic className="w-2 h-2 animate-pulse" /> : <MicOff className="w-2 h-2 text-[#888888]" />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive Empty Seat on furniture (reveals clean spot name on hover)
interface EmptyPixelSeatProps {
  spotName: string;
  accentColor: string;
  onTakeSeat: () => void;
}

const EmptyPixelSeat: React.FC<EmptyPixelSeatProps> = ({
  spotName,
  accentColor,
  onTakeSeat,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onTakeSeat}
    >
      {/* Tooltip on hover: just displays the spot name */}
      <div
        className={`absolute -top-9 z-30 transition-all duration-200 flex flex-col items-center pointer-events-none ${
          isHovered
            ? 'opacity-100 -translate-y-1 scale-100'
            : 'opacity-0 translate-y-1 scale-95'
        }`}
      >
        <div className="px-2.5 py-1 rounded-xl bg-[#0e0e14]/95 border border-white/20 shadow-2xl backdrop-blur-md flex items-center whitespace-nowrap">
          <span className="text-xs font-semibold text-[#ededed] font-mono">
            {spotName}
          </span>
        </div>
        <div className="w-2 h-1 bg-[#0e0e14] border-r border-b border-white/20 rotate-45 -mt-0.5" />
      </div>

      {/* Clean dashed circular seat marker directly on the furniture */}
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-200 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ${
          isHovered
            ? 'scale-120 border-white bg-[#1e1e28]/95 shadow-2xl ring-2 ring-white/40'
            : 'border-white/30 bg-[#121218]/50 hover:border-white/60'
        }`}
        style={{
          borderColor: isHovered ? accentColor : undefined,
        }}
        title="Кликните, чтобы пересесть на это место"
      >
        <Plus
          className={`w-3.5 h-3.5 transition-colors ${
            isHovered ? 'text-white' : 'text-white/50'
          }`}
          style={{ color: isHovered ? accentColor : undefined }}
        />
      </div>
    </div>
  );
};

interface MeetingRoomViewProps {
  socket?: any;
  roomId: string;
  pin: string;
  myPeerId: string;
  myUserName?: string;
  onUpdateUserName?: (name: string) => void;
  userAvatar?: string;
  onUpdateUserAvatar?: (avatar: string) => void;
  isAdmin?: boolean;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  onUpdateAdminFrame?: (frame: 'gold' | 'rgb' | 'plasma' | 'none') => void;
  clientIp?: string;
  roomTheme?: string;
  onRoomThemeChange?: (theme: string) => void;
  maxSeats: number;
  onUpdateMaxSeats: (max: number) => void;
  isLocked: boolean;
  onToggleLockRoom: () => void;
  peerSeats: Record<string, number>;
  mySeatIndex: number;
  onSwitchSeat: (seatIdx: number) => void;
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
  onToggleScreen?: () => Promise<boolean>;
  remoteVideoRef?: React.RefObject<HTMLVideoElement | null>;
  isMicActive: boolean;
  isScreenActive?: boolean;
  hasRemoteVideo?: boolean;
  onAcceptFile: (fileId: string) => void;
}

export const MeetingRoomView: React.FC<MeetingRoomViewProps> = ({
  socket,
  roomId: _roomId,
  pin,
  myPeerId,
  myUserName,
  onUpdateUserName,
  userAvatar,
  onUpdateUserAvatar,
  isAdmin,
  adminFrame = 'gold',
  onUpdateAdminFrame: _onUpdateAdminFrame,
  clientIp: _clientIp,
  roomTheme,
  onRoomThemeChange,
  maxSeats,
  onUpdateMaxSeats,
  isLocked,
  onToggleLockRoom,
  peerSeats,
  mySeatIndex,
  onSwitchSeat,
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
  onToggleScreen: _onToggleScreen,
  remoteVideoRef: _remoteVideoRef,
  isMicActive,
  isScreenActive: _isScreenActive,
  hasRemoteVideo: _hasRemoteVideo,
  onAcceptFile,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [activeSideTab, setActiveSideTab] = useState<'notes' | 'chat'>('notes');
  const [meetingSeconds, setMeetingSeconds] = useState(0);

  // Active Room Concept State - synced from server / host
  const [currentRoomId, setCurrentRoomId] = useState<RoomId>(() => {
    if (roomTheme && roomTheme in ROOM_PRESETS) return roomTheme as RoomId;
    return sanitizeRoomId(localStorage.getItem('bridgik_pixel_room'));
  });

  useEffect(() => {
    if (roomTheme && roomTheme in ROOM_PRESETS) {
      setCurrentRoomId(roomTheme as RoomId);
    }
  }, [roomTheme]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRoomPickerOpen, setIsRoomPickerOpen] = useState(false);
  const [isEmotePickerOpen, setIsEmotePickerOpen] = useState(false);
  const [customNameInput, setCustomNameInput] = useState(myUserName || '');
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return sound.isEnabled();
  });

  const myPeer = peers.find((p) => p.id === myPeerId);
  const isHost = myPeer?.isHost ?? (peers.length <= 1);
  const activeMyName = myUserName || myPeer?.name || 'Quantum Lynx';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const meetingFilesSectionRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const dragCounter = useRef(0);
  const [fileToast, setFileToast] = useState<string | null>(null);

  // Media Preview Lightbox state (images, video, audio)
  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    name: string;
    type: 'image' | 'video' | 'audio' | 'doc';
    size: number;
  } | null>(null);

  const isImageFile = (name: string, mime?: string) => {
    if (mime?.startsWith('image/')) return true;
    return /\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(name);
  };

  const isAudioFile = (name: string, mime?: string) => {
    if (mime?.startsWith('audio/')) return true;
    return /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(name);
  };

  const isVideoFile = (name: string, mime?: string) => {
    if (mime?.startsWith('video/')) return true;
    return /\.(mp4|webm|mov|mkv|avi)$/i.test(name);
  };

  // Unread chat badge (+1, +2, etc.) & toast notification
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [recentlyReceivedBadge, setRecentlyReceivedBadge] = useState<number | null>(null);
  const recentBadgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMessagesLength = useRef(messages.length);
  const [newChatToast, setNewChatToast] = useState<{ sender: string; text: string; count: number } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      const addedMessages = messages.slice(prevMessagesLength.current);
      // Filter out messages sent by ourselves and system notices
      const incomingFromOthers = addedMessages.filter((m) => {
        if (m.isSystem || m.senderId === 'system' || m.senderName === 'Система') return false;
        if (myPeerId && m.senderId) return m.senderId !== myPeerId;
        if (myUserName && m.senderName) return m.senderName !== myUserName;
        return false;
      });

      if (incomingFromOthers.length > 0) {
        const latest = incomingFromOthers[incomingFromOthers.length - 1];

        if (activeSideTab !== 'chat') {
          setUnreadChatCount((prev) => prev + incomingFromOthers.length);
        } else {
          // If currently inside the chat tab, flash a +1 badge on the tab header for 3.5s
          setRecentlyReceivedBadge(incomingFromOthers.length);
          if (recentBadgeTimeoutRef.current) clearTimeout(recentBadgeTimeoutRef.current);
          recentBadgeTimeoutRef.current = setTimeout(() => {
            setRecentlyReceivedBadge(null);
          }, 3500);
        }

        // Show floating message preview toast
        setNewChatToast({
          sender: latest.senderName,
          text: latest.text,
          count: incomingFromOthers.length,
        });

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setNewChatToast(null);
        }, 4500);
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, activeSideTab, myPeerId, myUserName]);

  const handleOpenChatTab = () => {
    setActiveSideTab('chat');
    setUnreadChatCount(0);
    setRecentlyReceivedBadge(null);
    setNewChatToast(null);
  };

  // Global Drag & Drop + Clipboard Paste for meeting files anywhere
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current += 1;
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
        setIsGlobalDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsGlobalDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsGlobalDragging(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        sound.playConnect();
        onSendFiles(e.dataTransfer.files);
        setFileToast(`Добавлено файлов: ${e.dataTransfer.files.length}`);
        setTimeout(() => setFileToast(null), 3500);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      // If user is pasting files (e.g. screenshot or copied file)
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        sound.playConnect();
        onSendFiles(e.clipboardData.files);
        setFileToast(`Файл из буфера добавлен в файлы комнаты`);
        setTimeout(() => setFileToast(null), 3500);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('paste', handlePaste);
    };
  }, [onSendFiles]);

  // Seat switching action
  const handleSwitchSeat = (seatIdx: number) => {
    if (seatIdx === mySeatIndex) return;
    sound.playClick();
    onSwitchSeat(seatIdx);
  };

  // Host Actions
  const handleUpdateMaxSeats = (newMax: number) => {
    sound.playClick();
    onUpdateMaxSeats(newMax);
  };

  const handleToggleLockRoom = () => {
    sound.playClick();
    onToggleLockRoom();
  };

  const handleKickPeer = (targetPeerId: string) => {
    if (!confirm('Вы уверены, что хотите исключить этого участника из комнаты?')) return;
    sound.playClick();
    if (socket) {
      socket.emit('kick-peer', {
        roomId: pin || _roomId,
        targetPeerId,
      });
    }
  };

  const handleMuteAll = () => {
    sound.playClick();
    if (socket) {
      socket.emit('mute-all', {
        roomId: pin || _roomId,
      });
    }
  };

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
    }
  };

  const handleSelectRoom = (roomId: RoomId) => {
    if (!isHost) return; // Room theme selection is controlled exclusively by the Host
    setCurrentRoomId(roomId);
    localStorage.setItem('bridgik_pixel_room', roomId);
    setIsRoomPickerOpen(false);
    sound.playClick();
    if (socket) {
      socket.emit('change-room-theme', {
        roomId: pin || _roomId,
        theme: roomId,
      });
    }
    if (onRoomThemeChange) {
      onRoomThemeChange(roomId);
    }
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
  const currentRoom = ROOM_PRESETS[currentRoomId] || ROOM_PRESETS['cyber-lounge'];

  // Slice seats according to current maxSeats capacity (2, 4, 6, or 8)
  const activeSeats = currentRoom.seats.slice(0, maxSeats);

  // Seat occupancy mapping
  const actualMySeat = mySeatIndex >= 0 && mySeatIndex < maxSeats ? mySeatIndex : 0;
  const seatOccupants: Record<number, { type: 'me' } | { type: 'peer'; peer: (typeof otherPeers)[0] }> = {
    [actualMySeat]: { type: 'me' },
  };

  const occupiedIndices = new Set<number>([actualMySeat]);

  // First place peers that have an assigned seat index
  otherPeers.forEach((peer) => {
    const preferred = peerSeats[peer.id];
    if (
      preferred !== undefined &&
      preferred >= 0 &&
      preferred < maxSeats &&
      !occupiedIndices.has(preferred)
    ) {
      seatOccupants[preferred] = { type: 'peer', peer };
      occupiedIndices.add(preferred);
    }
  });

  // Then distribute any remaining peers to the next available seats
  otherPeers.forEach((peer) => {
    if (Object.values(seatOccupants).some((o) => o.type === 'peer' && o.peer.id === peer.id)) {
      return;
    }
    for (let i = 0; i < maxSeats; i++) {
      if (!occupiedIndices.has(i)) {
        seatOccupants[i] = { type: 'peer', peer };
        occupiedIndices.add(i);
        break;
      }
    }
  });

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
              {peers.length} / {maxSeats} {maxSeats === 2 ? 'места' : 'мест'}
            </span>
          </div>

          {isHost && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-xs font-bold text-[#f59e0b]">
              <Crown className="w-3.5 h-3.5" />
              <span>Вы организатор</span>
            </div>
          )}

          {isLocked && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ed2b3b]/15 border border-[#ed2b3b]/30 text-xs font-bold text-[#ef9282]">
              <Lock className="w-3.5 h-3.5" />
              <span>Комната закрыта</span>
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Room Selector Badge - Only host can open the picker */}
          {isHost ? (
            <button
              onClick={() => {
                setIsRoomPickerOpen(!isRoomPickerOpen);
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${currentRoom.badgeBg} ${currentRoom.badgeBorder} ${currentRoom.badgeText} hover:brightness-110`}
              title="Выбрать другую локацию (Организатор)"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Локация: {currentRoom.title}</span>
            </button>
          ) : (
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-bold flex items-center gap-1.5 ${currentRoom.badgeBg} ${currentRoom.badgeBorder} ${currentRoom.badgeText}`}
              title="Локация установлена организатором"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Локация: {currentRoom.title}</span>
            </div>
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

      {/* Main Grid: Left = Full-Bleed Living Room Stage + Files; Right = Notes & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* ============================================================== */}
          {/* FULL-BLEED LIVING ROOM (DISCORD LIVING ROOM CONCEPT - NO VOID) */}
          {/* ============================================================== */}
          <div className="relative rounded-3xl border-2 border-[#33333e] bg-[#0c0c12] shadow-2xl overflow-hidden flex flex-col items-center justify-center">
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
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0c0c14]/90 border border-white/10 shadow-lg backdrop-blur-xs text-[11px] font-mono text-[#aaaaaa]">
                    <Armchair className="w-3.5 h-3.5 text-[#9ac43e]" />
                    <span>{maxSeats} мест · P2P Direct</span>
                  </div>
                </div>
              </div>

              {/* Full-Bleed 16:9 Interior Viewport */}
              <div className="relative w-full aspect-video max-h-[520px] overflow-hidden flex items-center justify-center">
                {/* 100% Edge-to-Edge Interior Image (Zero cutaway voids, zero floating chunks) */}
                <img
                  src={currentRoom.imageSrc}
                  alt={currentRoom.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />

                {/* Subtle Cinematic Vignette & Ambient Scanline */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%)',
                    backgroundSize: '100% 4px',
                  }}
                />

                {/* ============================================================== */}
                {/* ORGANIC SEATS POSITIONED ON FURNITURE (UP TO maxSeats)        */}
                {/* ============================================================== */}
                {activeSeats.map((seat, index) => {
                  const occupant = seatOccupants[index];
                  let seatContent: React.ReactNode = null;

                  if (occupant?.type === 'me') {
                    // Current user's seat
                    seatContent = (
                      <PixelAvatarSeat
                        name={activeMyName}
                        avatar={userAvatar || getAvatarForName(activeMyName)}
                        isMe={true}
                        deviceType={myPeer?.deviceType}
                        isMicActive={isMicActive}
                        spotName={seat.spotName}
                        accentColor={currentRoom.accent}
                        onToggleMic={onToggleMic}
                        isHost={isHost}
                        isAdmin={isAdmin}
                        adminFrame={adminFrame}
                      />
                    );
                  } else if (occupant?.type === 'peer') {
                    // Connected Peer sitting on this furniture
                    const peer = occupant.peer;
                    seatContent = (
                      <PixelAvatarSeat
                        name={peer.name}
                        avatar={peer.avatar || getAvatarForName(peer.name)}
                        isMe={false}
                        deviceType={peer.deviceType}
                        isMicActive={Boolean(peer.isMicActive)}
                        spotName={seat.spotName}
                        accentColor={currentRoom.accent}
                        isHost={peer.isHost}
                        isAdmin={peer.isAdmin}
                        adminFrame={peer.adminFrame}
                        onKick={isHost ? () => handleKickPeer(peer.id) : undefined}
                      />
                    );
                  } else {
                    // Empty seat - clickable to switch seats
                    seatContent = (
                      <EmptyPixelSeat
                        spotName={seat.spotName}
                        accentColor={currentRoom.accent}
                        onTakeSeat={() => handleSwitchSeat(index)}
                      />
                    );
                  }

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

              {/* Floating Bottom Control Dock (HUD - Discord style) */}
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

                {/* Room Selector Trigger (Host only) */}
                {isHost && (
                  <button
                    onClick={() => {
                      setIsRoomPickerOpen(!isRoomPickerOpen);
                      sound.playClick();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Выбрать другую локацию (Организатор)"
                  >
                    <Home className="w-4 h-4 text-[#9ac43e]" />
                    <span className="hidden md:inline">Локация</span>
                  </button>
                )}

                {/* Files Toolbar Button */}
                <button
                  onClick={() => {
                    meetingFilesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Файлы комнаты"
                >
                  <Paperclip className="w-4 h-4 text-[#9ac43e]" />
                  <span className="hidden md:inline">Файлы</span>
                  {transfers.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#789d2a] text-white text-[10px] font-mono font-bold">
                      {transfers.length}
                    </span>
                  )}
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
                      Выберите локацию (все 8 мест):
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
                            className="w-14 h-9 rounded-lg object-cover border border-white/10 shrink-0"
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

          {/* Room Files Drawer / Dropzone with Rich Media Previews */}
          <div ref={meetingFilesSectionRef} className="bg-[#1e1e1e] border border-[#353535] rounded-2xl p-4 sm:p-5 shadow-sm scroll-mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#9ac43e]" />
                <h3 className="text-base sm:text-lg font-bold text-[#ededed]">Файлы комнаты</h3>
                {transfers.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#272727] text-[#9ac43e] text-xs font-mono font-bold">
                    {transfers.length}
                  </span>
                )}
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
                    setFileToast(`Добавлено файлов: ${e.target.files.length}`);
                    setTimeout(() => setFileToast(null), 3500);
                    e.target.value = '';
                  }
                }}
              />
            </div>

            {/* Transferred Files with Thumbnails, Audio Player & Preview Lightbox */}
            {transfers.length > 0 ? (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {transfers.map((t) => {
                  const isImg = isImageFile(t.name, t.mimeType);
                  const isAud = isAudioFile(t.name, t.mimeType);
                  const isVid = isVideoFile(t.name, t.mimeType);

                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-[#141416] border border-[#2e2e38] hover:border-[#789d2a]/50 transition-all flex flex-col gap-2 text-sm shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Image Thumbnail with Click-to-preview */}
                          {isImg && t.blobUrl ? (
                            <div
                              onClick={() =>
                                setPreviewMedia({
                                  url: t.blobUrl!,
                                  name: t.name,
                                  type: 'image',
                                  size: t.size,
                                })
                              }
                              className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#1f1f26] border border-[#383844] hover:border-[#789d2a] shrink-0 cursor-pointer group/thumb shadow-sm"
                              title="Нажмите для просмотра в полном размере"
                            >
                              <img
                                src={t.blobUrl}
                                alt={t.name}
                                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye className="w-4 h-4 text-[#9ac43e]" />
                              </div>
                            </div>
                          ) : isVid ? (
                            <div
                              onClick={() =>
                                t.blobUrl &&
                                setPreviewMedia({
                                  url: t.blobUrl,
                                  name: t.name,
                                  type: 'video',
                                  size: t.size,
                                })
                              }
                              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                                t.blobUrl
                                  ? 'bg-[#1b1724] border-[#9146FF]/50 hover:border-[#9146FF] cursor-pointer text-[#bf94ff]'
                                  : 'bg-[#1c1c24] border-[#383844] text-[#888888]'
                              }`}
                              title={t.blobUrl ? 'Смотреть видео' : 'Видео'}
                            >
                              <Film className="w-5 h-5" />
                            </div>
                          ) : isAud ? (
                            <div
                              className="w-12 h-12 rounded-xl bg-[#172214] border border-[#789d2a]/50 flex items-center justify-center shrink-0 text-[#9ac43e]"
                              title="Аудио файл"
                            >
                              <Music className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#1c1c24] border border-[#383844] flex items-center justify-center shrink-0 text-[#aaaaaa]">
                              <File className="w-5 h-5 text-[#9ac43e]" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-bold text-[#ededed] truncate max-w-[200px] sm:max-w-xs">{t.name}</p>
                            <p className="text-xs text-[#888888] flex items-center gap-2 mt-0.5 font-mono">
                              <span>{(t.size / 1024 / 1024).toFixed(1)} МБ</span>
                              <span>•</span>
                              <span className={t.type === 'upload' ? 'text-[#9ac43e]' : 'text-[#888888]'}>
                                {t.type === 'upload' ? 'Отправлено' : 'Получено'}
                              </span>
                              <span>•</span>
                              <span className={t.status === 'completed' ? 'text-[#9ac43e] font-semibold' : 'text-[#d4e8a8]'}>
                                {t.status === 'completed' ? 'Готово' : `${t.progress}%`}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Action buttons: Preview & Download (available for both sender & receiver) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {t.blobUrl && (
                            <>
                              {(isImg || isVid || isAud) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewMedia({
                                      url: t.blobUrl!,
                                      name: t.name,
                                      type: isImg ? 'image' : isVid ? 'video' : 'audio',
                                      size: t.size,
                                    })
                                  }
                                  className="p-2 rounded-xl bg-[#25252e] hover:bg-[#30303c] text-[#ededed] hover:text-[#9ac43e] border border-white/10 transition-colors cursor-pointer shadow-sm"
                                  title="Предпросмотр файла"
                                >
                                  <Eye className="w-4 h-4 text-[#9ac43e]" />
                                </button>
                              )}

                              <a
                                href={t.blobUrl}
                                download={t.name}
                                className="p-2 rounded-xl bg-[#25252e] hover:bg-[#30303c] text-[#9ac43e] hover:text-[#b4e64f] border border-white/10 transition-colors cursor-pointer shadow-sm"
                                title="Скачать файл"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </>
                          )}

                          {t.status === 'pending_approval' && (
                            <button
                              onClick={() => onAcceptFile(t.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-xs cursor-pointer shadow-md shadow-[#789d2a]/20"
                            >
                              Принять
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Built-in Custom Cyber Audio Player for audio files */}
                      {isAud && t.blobUrl && (
                        <div className="mt-1 pt-2 border-t border-white/5">
                          <CustomAudioPlayer
                            src={t.blobUrl}
                            compact
                            title={t.name}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-xs sm:text-sm text-[#888888] border border-dashed border-[#333333] rounded-xl">
                Перетащите сюда документы или файлы для участников комнаты
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
              <span>Канвас</span>
            </button>
            <button
              onClick={handleOpenChatTab}
              className={`flex-1 py-3 text-base font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border-b-2 relative ${
                activeSideTab === 'chat'
                  ? 'border-[#789d2a] text-[#ededed] bg-[#1e1e1e]'
                  : 'border-transparent text-[#888888] hover:text-[#ededed]'
              }`}
            >
              <div className="relative flex items-center">
                <Send className="w-4 h-4 text-[#9ac43e]" />
                {(unreadChatCount > 0 || recentlyReceivedBadge !== null) && (
                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-[#bbf348] animate-ping" />
                )}
              </div>
              <span>Чат</span>

              {(unreadChatCount > 0 || recentlyReceivedBadge !== null) ? (
                <span className="px-2 py-0.5 rounded-full bg-[#789d2a] text-white text-xs font-black font-mono shadow-[0_0_12px_rgba(120,157,42,0.9)] animate-bounce flex items-center gap-1 border border-[#bbf348]">
                  +{unreadChatCount > 0 ? unreadChatCount : recentlyReceivedBadge}
                </span>
              ) : (
                <span className="text-xs font-mono text-[#777777]">({messages.length})</span>
              )}
            </button>
          </div>

          {/* Tab Content: Shared Scratchpad / Canvas */}
          {activeSideTab === 'notes' ? (
            <div className="flex-1 flex flex-col p-4">
              <div className="flex items-center justify-between mb-3 text-xs sm:text-sm text-[#aaaaaa]">
                <span className="font-semibold text-[#9ac43e] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#789d2a]" />
                  <span>Канвас · Синхронизация на лету</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:text-white rounded bg-[#272727] hover:bg-[#333333] transition-colors cursor-pointer text-xs flex items-center gap-1 border border-[#383838]"
                    title="Прикрепить файл к комнате"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-[#9ac43e]" />
                    <span>Файл</span>
                  </button>
                  <button
                    onClick={handleCopyNotes}
                    className="p-1.5 hover:text-white rounded bg-[#272727] hover:bg-[#333333] transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Скопировать Канвас"
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
                placeholder="Канвас комнаты... Набросайте план, тезисы, ссылки или код. Все изменения моментально видны собеседникам."
                className="flex-1 w-full bg-[#141414] border border-[#333333] rounded-xl p-3.5 text-base sm:text-lg text-[#ededed] placeholder-[#666666] outline-none focus:border-[#789d2a] resize-none font-mono leading-relaxed transition-colors"
              />

              <div className="mt-2 text-xs text-[#888888] flex items-center justify-between">
                <span>Канвас не сохраняется на сервере (P2P)</span>
                <span>Символов: {scratchpadText.length}</span>
              </div>
            </div>
          ) : (
            /* Tab Content: Meeting Chat */
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-[#777777] text-sm">
                    Сообщений пока нет. Напишите что-нибудь собеседникам в гостиной.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === myPeerId;
                    const peer = peers.find((p) => p.id === m.senderId);
                    const currentAvatar = isMe
                      ? (userAvatar || getAvatarForName(activeMyName))
                      : (peer?.avatar || m.senderAvatar || getAvatarForName(m.senderName));
                    const messageIsAdmin = isMe ? isAdmin : Boolean(peer?.isAdmin || m.isAdmin);
                    const messageAdminFrame = isMe ? adminFrame : (peer?.adminFrame || m.adminFrame || 'gold');
                    return (
                      <ChatMessageBubble
                        key={m.id}
                        senderName={m.senderName}
                        text={m.text}
                        isMe={isMe}
                        isSystem={m.isSystem || m.senderId === 'system'}
                        avatar={currentAvatar}
                        isAdmin={messageIsAdmin}
                        adminFrame={messageAdminFrame}
                        time={new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      />
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar with 7TV Emote Picker */}
              <div className="relative border-t border-[#353535] bg-[#171717]">
                <EmotePicker
                  isOpen={isEmotePickerOpen}
                  onClose={() => setIsEmotePickerOpen(false)}
                  onSelectEmote={(emote) => {
                    setChatInput((prev) => (prev ? `${prev} ${emote.code} ` : `${emote.code} `));
                    setIsEmotePickerOpen(false);
                  }}
                />

                <form onSubmit={handleSendChat} className="p-3 flex items-center gap-2">
                  {/* Current User's Round Mascot Avatar (visual indicator) */}
                  <div className="relative shrink-0 select-none" title={isAdmin ? `Создатель: ${activeMyName}` : `Ваш аватар: ${activeMyName}`}>
                    <img
                      src={userAvatar || getAvatarForName(activeMyName)}
                      alt={activeMyName}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover bg-[#171717] ${
                        isAdmin && adminFrame !== 'none'
                          ? adminFrame === 'rgb'
                            ? 'border-2 border-sky-400 animate-admin-rgb'
                            : adminFrame === 'plasma'
                            ? 'border-2 border-purple-400 animate-admin-plasma'
                            : 'border-2 border-amber-400 animate-admin-gold'
                          : 'border-2 border-[#789d2a] shadow-[0_0_8px_rgba(120,157,42,0.35)]'
                      }`}
                      style={{ imageRendering: 'pixelated' }}
                    />
                    {isAdmin && adminFrame !== 'none' && (
                      <span className="absolute -top-1.5 -right-1 text-[11px] select-none filter drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]">
                        👑
                      </span>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#789d2a] rounded-full border-2 border-[#171717]" />
                  </div>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Сообщение или ссылка..."
                    className="flex-1 bg-[#141414] border border-[#333333] rounded-xl px-3.5 py-2 text-base text-[#ededed] placeholder-[#666666] outline-none focus:border-[#789d2a] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl border bg-[#222222] border-[#333333] text-[#888888] hover:text-[#9ac43e] hover:border-[#789d2a] transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    title="Прикрепить файл к комнате"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEmotePickerOpen(!isEmotePickerOpen)}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                      isEmotePickerOpen
                        ? 'bg-[#789d2a]/20 border-[#789d2a] text-[#9ac43e]'
                        : 'bg-[#222222] border-[#333333] text-[#888888] hover:text-[#ededed] hover:border-[#555555]'
                    }`}
                    title="Смайлики (7TV и мемы)"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="px-4 py-2.5 bg-[#789d2a] hover:bg-[#8cb632] disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-md shadow-[#789d2a]/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#1b1b1f] border border-[#35353f] rounded-3xl max-w-xl w-full shadow-2xl relative max-h-[88vh] flex flex-col overflow-hidden">
            {/* Modal Header (Pinned at top) */}
            <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-[#303038] shrink-0 bg-[#1b1b1f]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#25252e] border border-[#383845] flex items-center justify-center text-[#9ac43e]">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#ededed]">Настройки гостиной</h3>
                  <p className="text-xs text-[#888888]">Выбор интерьера (все 8 мест), позывной и звук</p>
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

            {/* Scrollable Modal Content (Clipped strictly within card) */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6 [scrollbar-color:#383848_transparent] [scrollbar-width:thin]">
              {/* Host Settings Section (if isHost) */}
              {isHost && (
                <div className="p-4 rounded-2xl bg-[#14141c] border border-[#f59e0b]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#f59e0b]" />
                      <h4 className="text-base font-bold text-[#ededed]">Панель организатора</h4>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
                      Хост
                    </span>
                  </div>

                  {/* Seat capacity selector */}
                  <div>
                    <label className="text-xs font-semibold text-[#aaaaaa] block mb-1.5">
                      Количество мест в комнате (на диванах и креслах):
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 4, 6, 8].map((seatsCount) => (
                        <button
                          key={seatsCount}
                          type="button"
                          onClick={() => handleUpdateMaxSeats(seatsCount)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            maxSeats === seatsCount
                              ? 'bg-[#789d2a] text-white shadow-md'
                              : 'bg-[#1e1e28] text-[#cccccc] hover:bg-[#282836] border border-white/5'
                          }`}
                        >
                          <Armchair className="w-3.5 h-3.5" />
                          <span>{seatsCount} мест</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lock room & Mute all actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleToggleLockRoom}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        isLocked
                          ? 'bg-[#ed2b3b]/15 text-[#ef9282] border-[#ed2b3b]/40 hover:bg-[#ed2b3b]/25'
                          : 'bg-[#1e1e28] text-[#ededed] border-white/10 hover:bg-[#282836]'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-[#9ac43e]" />}
                      <span>{isLocked ? 'Комната закрыта (вход заблокирован)' : 'Комната открыта для гостей'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleMuteAll}
                      className="py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#1e1e28] hover:bg-[#282836] text-[#ededed] border border-white/10 transition-all cursor-pointer"
                      title="Отключить микрофоны всех участников"
                    >
                      <MicOff className="w-3.5 h-3.5 text-[#ed2b3b]" />
                      <span>Заглушить всех</span>
                    </button>
                  </div>

                  {/* Peer List with Kick actions */}
                  {otherPeers.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                        Участники в комнате ({otherPeers.length}):
                      </span>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {otherPeers.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-[#1a1a24] border border-white/5 text-xs"
                          >
                            <span className="font-semibold text-[#ededed] truncate">{p.name}</span>
                            <button
                              type="button"
                              onClick={() => handleKickPeer(p.id)}
                              className="px-2 py-1 rounded-lg bg-[#ed2b3b]/15 hover:bg-[#ed2b3b] text-[#ef9282] hover:text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <UserX className="w-3 h-3" />
                              <span>Исключить</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Section 1: Choose Room Location */}
              {isHost ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-[#9ac43e]" />
                      <h4 className="text-base font-bold text-[#ededed]">Интерьер комнаты (выбор хоста)</h4>
                    </div>
                    <span className="text-xs font-mono text-[#888888]">вместимость: {maxSeats} мест</span>
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
                          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10">
                            <img
                              src={r.imageSrc}
                              alt={r.title}
                              className="w-full h-full object-cover"
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
              ) : (
                <div className="p-3.5 rounded-xl bg-[#15151a] border border-[#2f2f3a] text-xs text-[#888888] flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#ededed] font-medium">
                    <Home className="w-4 h-4 text-[#9ac43e]" />
                    Локация: <b>{currentRoom.title}</b>
                  </span>
                  <span className="text-[11px] font-mono text-[#789d2a]">Управляется организатором</span>
                </div>
              )}

              {/* Section 2: Nickname */}
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

              {/* Section 2.1: Mascot Avatar Selection */}
              <div className="space-y-3 pt-3 border-t border-[#303038]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#9ac43e]" />
                    <h4 className="text-base font-bold text-[#ededed]">Ваш маскот-аватар</h4>
                  </div>
                  <span className="text-xs font-mono text-[#888888]">16-bit аватарка</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {MASCOT_AVATARS.map((mascot) => {
                    const isSelected = mascot.src === (userAvatar || getAvatarForName(activeMyName));
                    return (
                      <button
                        key={mascot.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onUpdateUserAvatar?.(mascot.src);
                        }}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer relative group ${
                          isSelected
                            ? 'bg-[#222a1b] border-2 border-[#789d2a] shadow-[0_0_12px_rgba(120,157,42,0.4)]'
                            : 'bg-[#15151a] border border-[#2f2f3a] hover:border-[#555566]'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={mascot.src}
                            alt={mascot.name}
                            className="w-11 h-11 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#789d2a] text-white flex items-center justify-center shadow-md">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold text-center leading-tight truncate w-full ${
                            isSelected ? 'text-[#bbf348]' : 'text-[#888888] group-hover:text-white'
                          }`}
                        >
                          {mascot.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Sound Toggles */}
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

              {/* Section 4: Security Info */}
              <div className="p-3.5 rounded-xl bg-[#121216] border border-[#2a2a35] text-xs text-[#888888] space-y-1 font-mono">
                <div className="flex items-center justify-between text-[#ededed] font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9ac43e]" />
                    Шифрование комнаты
                  </span>
                  <span className="text-[#9ac43e]">E2E DTLS-SRTP</span>
                </div>
                <p>Аудиокодек: Opus 48 kHz (динамический битрейт 32-128 kbps)</p>
                <p>Вместимость: 8 участников в P2P Mesh · 0 байт на сервере</p>
              </div>
            </div>

            {/* Modal Footer (Pinned at bottom) */}
            <div className="p-5 sm:p-6 pt-4 border-t border-[#303038] flex justify-end shrink-0 bg-[#1b1b1f]">
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

      {/* Floating File Added Toast */}
      {fileToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] px-4 py-2.5 rounded-2xl bg-[#1a2313]/95 border border-[#789d2a] text-[#b4e64f] text-sm font-bold shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
          <div className="w-6 h-6 rounded-lg bg-[#789d2a]/30 flex items-center justify-center text-[#9ac43e]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span>{fileToast}</span>
        </div>
      )}

      {/* Floating New Chat Message Toast */}
      {newChatToast && (
        <div
          onClick={handleOpenChatTab}
          className="fixed top-20 right-4 sm:right-6 z-[110] max-w-xs sm:max-w-sm rounded-2xl bg-[#18181c]/95 border-2 border-[#789d2a] shadow-[0_16px_40px_rgba(0,0,0,0.9)] p-3 backdrop-blur-xl cursor-pointer hover:scale-102 transition-all animate-in slide-in-from-right-4 duration-200"
          title="Нажмите чтобы открыть чат"
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-1.5 py-0.5 rounded-md bg-[#789d2a] text-white font-mono text-[11px] font-black shadow-sm shrink-0">
                +{newChatToast.count}
              </span>
              <span className="text-xs font-bold text-[#ededed] truncate">
                {newChatToast.sender}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9ac43e] shrink-0">в чате</span>
          </div>
          <p className="text-xs text-[#bbbbbb] line-clamp-2 pl-1 leading-snug break-words">
            {newChatToast.text}
          </p>
        </div>
      )}

      {/* Global Drag & Drop Overlay anywhere on the screen */}
      {isGlobalDragging && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 border-4 border-dashed border-[#789d2a] animate-in fade-in duration-150 pointer-events-none select-none">
          <div className="w-24 h-24 rounded-3xl bg-[#789d2a]/20 border-2 border-[#789d2a] flex items-center justify-center text-[#9ac43e] mb-5 shadow-[0_0_50px_rgba(120,157,42,0.4)] animate-bounce">
            <Upload className="w-12 h-12" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-2">
            Отпустите файлы в любом месте
          </h2>
          <p className="text-sm sm:text-base text-[#bbbbbb] text-center max-w-md">
            Файлы мгновенно прикрепятся к комнате и передадутся участникам напрямую по зашифрованному P2P-каналу
          </p>
          <div className="mt-4 px-3 py-1 rounded-full bg-[#1b2413] border border-[#789d2a]/50 text-[#9ac43e] text-xs font-mono">
            Direct WebRTC DataChannel · Нулевые следы на сервере
          </div>
        </div>
      )}

      {/* Media Preview Lightbox Modal */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
        >
          {/* Lightbox Header Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-white"
          >
            <div className="min-w-0 pr-4">
              <p className="text-base sm:text-lg font-extrabold truncate">{previewMedia.name}</p>
              <p className="text-xs text-[#888888] font-mono">
                {(previewMedia.size / 1024 / 1024).toFixed(2)} МБ · P2P Предпросмотр
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={previewMedia.url}
                download={previewMedia.name}
                className="px-3.5 py-1.5 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Скачать</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 rounded-xl bg-[#25252e] hover:bg-[#32323e] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Media Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex-1 max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl bg-[#0e0e12] border border-[#2a2a35] shadow-2xl p-2 relative"
          >
            {previewMedia.type === 'image' && (
              <img
                src={previewMedia.url}
                alt={previewMedia.name}
                className="max-w-full max-h-[75vh] object-contain rounded-xl select-none"
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
              <div className="p-6 sm:p-8 flex flex-col items-center justify-center gap-5 text-center w-full max-w-lg">
                <div className="w-20 h-20 rounded-2xl bg-[#789d2a]/20 border border-[#789d2a] flex items-center justify-center text-[#9ac43e] shadow-[0_0_30px_rgba(120,157,42,0.3)] animate-pulse">
                  <Music className="w-10 h-10" />
                </div>
                <div className="text-center w-full min-w-0">
                  <p className="text-base font-bold text-white mb-1 truncate px-2">{previewMedia.name}</p>
                  <p className="text-xs text-[#888888] font-mono">Аудиозапись встречи · P2P</p>
                </div>
                <CustomAudioPlayer
                  src={previewMedia.url}
                  title={previewMedia.name}
                  autoPlay
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
