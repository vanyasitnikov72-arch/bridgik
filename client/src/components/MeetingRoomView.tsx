import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Share2,
  LogOut,
  FileText,
  Copy,
  Check,
  Download,
  Users,
  Send,
  Paperclip,
  Upload,
  File,
  Image as ImageIcon,
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
  Edit2,
  ChevronDown,
  Music,
  Film,
  Sparkles,
  Bell,
  AlertTriangle,
  Flame,
  Code,
  Package,
} from 'lucide-react';
import { FileTransfer, Peer, TextMessage } from '../types/index.js';
import { sound } from '../utils/sound.js';
import { createZipFromBlobUrls } from '../utils/zip.js';
import { useScreenWakeLock } from '../utils/wakeLock.js';
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
  x: number;
  y: number;
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
  seats: RoomSeatDef[];
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

interface PixelAvatarSeatProps {
  name: string;
  avatar?: string;
  isMe: boolean;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | string;
  isMicActive: boolean;
  isSpeaking?: boolean;
  spotName: string;
  accentColor: string;
  isHost?: boolean;
  isAdmin?: boolean;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  statusEmote?: string;
  connectionType?: 'direct' | 'relay';
  volumePercent?: number;
  onChangeVolume?: (volumePercent: number) => void;
  reactions?: Array<{ id: string; emoteUrl: string }>;
  onToggleMic?: () => void;
  onKick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const PixelAvatarSeat: React.FC<PixelAvatarSeatProps> = ({
  name,
  avatar,
  isMe,
  deviceType: _deviceType,
  isMicActive,
  isSpeaking = false,
  spotName: _spotName,
  accentColor,
  isHost,
  isAdmin,
  adminFrame = 'gold',
  statusEmote,
  connectionType,
  volumePercent = 100,
  onChangeVolume,
  reactions = [],
  onToggleMic,
  onKick,
  onContextMenu,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const seatContainerRef = useRef<HTMLDivElement>(null);

  const showLiveVoice = isMicActive && isSpeaking;

  useEffect(() => {
    if (!isControlsOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (seatContainerRef.current && !seatContainerRef.current.contains(e.target as Node)) {
        setIsControlsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isControlsOpen]);

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
      ref={seatContainerRef}
      className="relative flex flex-col items-center select-none cursor-pointer"
      title={
        isMe
          ? isMicActive
            ? 'Нажмите, чтобы заглушить микрофон'
            : 'Нажмите, чтобы говорить'
          : 'Нажмите для настройки громкости участника'
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={(e) => {
        if (!onContextMenu) return;
        e.preventDefault();
        e.stopPropagation();
        setIsControlsOpen(false);
        onContextMenu(e);
      }}
      onClick={() => {
        if (isMe) {
          onToggleMic?.();
        } else {
          setIsControlsOpen((prev) => !prev);
        }
      }}
    >
      {/* Floating 7TV Reactions rising over seat */}
      {reactions.map((r) => (
        <img
          key={r.id}
          src={r.emoteUrl}
          alt="reaction"
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-11 sm:h-11 object-contain pointer-events-none z-40 animate-reaction-float filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]"
        />
      ))}

      {/* Nameplate directly above Avatar */}
      <div
        className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#0e0e14]/90 border border-white/20 shadow-md backdrop-blur-md whitespace-nowrap pointer-events-none transition-transform"
        style={{
          boxShadow: showLiveVoice ? `0 0 10px ${accentColor}80` : undefined,
        }}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${showLiveVoice ? 'animate-pulse' : ''}`}
          style={{
            backgroundColor: showLiveVoice ? accentColor : isMicActive ? '#789d2a' : '#666677',
          }}
        />
        {isAdmin && (
          <span className="text-[9px] font-mono px-1 py-0 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 flex items-center shrink-0">
            👑 DEV
          </span>
        )}
        <span
          className={`text-xs font-bold font-mono truncate max-w-[85px] sm:max-w-[120px] ${
            isAdmin ? 'admin-name-shimmer' : 'text-[#ededed]'
          }`}
        >
          {name} {isMe ? '(Вы)' : ''}
        </span>
        {statusEmote && (
          <img
            src={statusEmote}
            alt="status"
            className="w-3.5 h-3.5 object-contain inline-block select-none filter drop-shadow-[0_0_4px_rgba(255,255,255,0.3)] shrink-0"
          />
        )}
        {!isMe && connectionType && (
          <span
            className={`text-[9px] px-1 py-0 rounded font-mono border ${
              connectionType === 'relay'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {connectionType === 'relay' ? '🛡️' : '⚡'}
          </span>
        )}
      </div>

      {/* Click Popup: Per-peer Volume Slider (0-200%) & Kick */}
      {!isMe && isControlsOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-12 sm:bottom-14 left-1/2 -translate-x-1/2 z-40 w-56 p-3 rounded-2xl bg-[#121218]/98 border border-[#789d2a]/60 shadow-2xl backdrop-blur-xl space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#ededed] truncate">{name}</span>
            <button
              type="button"
              onClick={() => setIsControlsOpen(false)}
              className="text-[#888888] hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {onChangeVolume && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => onChangeVolume(volumePercent === 0 ? 100 : 0)}
                  className="flex items-center gap-1 text-[#9ac43e] hover:text-white cursor-pointer"
                >
                  {volumePercent === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-[#ef9282]" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-[#9ac43e]" />
                  )}
                  <span>{volumePercent === 0 ? 'Заглушен' : 'Громкость'}</span>
                </button>
                <span className="text-[#ededed] font-bold">{volumePercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={volumePercent}
                onChange={(e) => onChangeVolume(Number(e.target.value))}
                className="w-full accent-[#789d2a] cursor-pointer h-1.5"
              />
            </div>
          )}

          {isHost && onKick && (
            <button
              type="button"
              onClick={() => {
                setIsControlsOpen(false);
                onKick();
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-[#ed2b3b]/15 hover:bg-[#ed2b3b] text-[#ef9282] hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Исключить</span>
            </button>
          )}
        </div>
      )}

      {/* Speech Halo & Avatar Circle */}
      <div className="relative flex items-center justify-center">
        {showLiveVoice && (
          <div
            className="absolute -inset-2 rounded-full border-2 animate-speech-halo pointer-events-none"
            style={{ borderColor: accentColor }}
          />
        )}

        {showLiveVoice && (
          <div
            className="absolute -top-4 flex items-end gap-0.5 h-3 px-1 py-0.5 rounded bg-[#101014]/95 border shadow-sm pointer-events-none"
            style={{ borderColor: `${accentColor}80` }}
            title="Говорит сейчас"
          >
            <span className="w-0.5 rounded-xs animate-eq-1" style={{ backgroundColor: accentColor }} />
            <span className="w-0.5 rounded-xs animate-eq-2" style={{ backgroundColor: accentColor }} />
            <span className="w-0.5 rounded-xs animate-eq-3" style={{ backgroundColor: accentColor }} />
            <span className="w-0.5 rounded-xs animate-eq-4" style={{ backgroundColor: accentColor }} />
          </div>
        )}

        <div
          className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-2xl relative cursor-pointer drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] overflow-hidden ${
            isHovered ? 'scale-115 ring-2 ring-white/50' : 'hover:scale-105'
          } ${showLiveVoice ? 'bg-[#152414]' : 'bg-[#191922]'} ${getSeatFrameClass()}`}
          style={{
            borderColor:
              isAdmin && adminFrame !== 'none'
                ? undefined
                : showLiveVoice
                ? accentColor
                : isMicActive
                ? '#789d2a'
                : isHovered
                ? '#ffffff'
                : '#444455',
            boxShadow:
              isAdmin && adminFrame !== 'none'
                ? undefined
                : showLiveVoice
                ? `0 0 18px ${accentColor}`
                : '0 4px 12px rgba(0,0,0,0.7)',
          }}
        >
          <img
            src={avatar || getAvatarForName(name)}
            alt={name}
            className="w-full h-full object-cover pointer-events-none select-none drop-shadow-sm"
            style={{ imageRendering: 'pixelated' }}
          />

          {isAdmin && adminFrame !== 'none' && (
            <span className="absolute -top-1 -right-0.5 text-[9px] sm:text-[10px] select-none filter drop-shadow-[0_0_4px_rgba(245,158,11,0.8)] z-20">
              👑
            </span>
          )}

          <div
            className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-[#121218] flex items-center justify-center text-white shadow-xs z-10"
            style={{
              backgroundColor:
                !isMe && volumePercent === 0
                  ? '#ed2b3b'
                  : isMicActive
                  ? accentColor
                  : '#33333d',
            }}
          >
            {!isMe && volumePercent === 0 ? (
              <VolumeX className="w-2 h-2 text-white" />
            ) : isMicActive ? (
              <Mic className={`w-2 h-2 ${showLiveVoice ? 'animate-pulse' : ''}`} />
            ) : (
              <MicOff className="w-2 h-2 text-[#888888]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface EmptyPixelSeatProps {
  spotName: string;
  accentColor: string;
  onTakeSeat: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const EmptyPixelSeat: React.FC<EmptyPixelSeatProps> = ({
  spotName: _spotName,
  accentColor,
  onTakeSeat,
  onContextMenu,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onTakeSeat}
      onContextMenu={(e) => {
        if (!onContextMenu) return;
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e);
      }}
    >
      <div
        className={`hidden sm:flex absolute -top-8 z-30 transition-all duration-200 flex-col items-center pointer-events-none ${
          isHovered
            ? 'opacity-100 -translate-y-1 scale-100'
            : 'opacity-0 translate-y-1 scale-95'
        }`}
      >
        <div className="px-2.5 py-1 rounded-lg bg-[#0b120a]/95 border border-[#9ac43e]/50 shadow-[0_0_15px_rgba(0,0,0,0.9)] backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9ac43e] animate-ping" />
          <span className="text-xs font-bold text-[#bbf348] font-mono">Занять место</span>
        </div>
        <div className="w-2 h-1 bg-[#0b120a] border-r border-b border-[#9ac43e]/50 rotate-45 -mt-0.5" />
      </div>

      <div
        className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] backdrop-blur-sm ${
          isHovered
            ? 'scale-125 bg-[#1f3714] border-white shadow-[0_0_28px_rgba(187,243,72,0.95)] ring-4 ring-[#bbf348]'
            : 'bg-[#0f170d]/90 border-white/80 shadow-[0_0_16px_rgba(154,196,62,0.6)] ring-2 ring-[#9ac43e]/80 hover:scale-115'
        }`}
        style={{
          boxShadow: isHovered
            ? `0 0 28px ${accentColor}, 0 4px 14px rgba(0,0,0,0.9)`
            : `0 0 16px ${accentColor}88, 0 4px 12px rgba(0,0,0,0.85)`,
        }}
        title="Свободное место. Кликните, чтобы пересесть."
      >
        <Plus
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 stroke-[2.5] ${
            isHovered ? 'text-white scale-110' : 'text-[#bbf348]'
          }`}
          style={{
            color: isHovered ? '#ffffff' : accentColor,
            filter: `drop-shadow(0 0 5px ${accentColor})`,
          }}
        />
      </div>
    </div>
  );
};

export interface CanvasImageItem {
  alt: string;
  dataUrl: string;
}

export const CANVAS_IMAGES_SEPARATOR = '\n\n<!-- bridgik-images -->\n';
export const CANVAS_IMG_REGEX = /!\[(.*?)\]\(\s*(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=\s]+|https?:\/\/[^\s)]+)\s*\)/g;

export function parseCanvasContent(raw: string): {
  cleanText: string;
  canvasImages: CanvasImageItem[];
} {
  if (!raw) return { cleanText: '', canvasImages: [] };

  if (raw.includes('<!-- bridgik-images -->')) {
    const parts = raw.split('<!-- bridgik-images -->');
    let textPart = parts[0];
    if (textPart.endsWith('\n\n')) {
      textPart = textPart.slice(0, -2);
    }
    const imgPart = parts[1] || '';
    const images: CanvasImageItem[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(CANVAS_IMG_REGEX.source, 'g');
    while ((match = regex.exec(imgPart)) !== null) {
      const cleanUrl = match[2].replace(/\s+/g, '');
      images.push({ alt: match[1] || 'Скриншот', dataUrl: cleanUrl });
    }
    return { cleanText: textPart, canvasImages: images };
  }

  // Fallback for legacy text without separator
  const images: CanvasImageItem[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(CANVAS_IMG_REGEX.source, 'g');
  while ((match = regex.exec(raw)) !== null) {
    const cleanUrl = match[2].replace(/\s+/g, '');
    images.push({ alt: match[1] || 'Скриншот', dataUrl: cleanUrl });
  }

  const cleanText = raw.replace(CANVAS_IMG_REGEX, '').replace(/\n{3,}/g, '\n\n').trim();
  return { cleanText, canvasImages: images };
}

export function serializeCanvasContent(text: string, images: CanvasImageItem[]): string {
  if (images.length === 0) return text;
  const imgMarkdown = images
    .map((img, i) => `![${img.alt || `Изображение ${i + 1}`}](${img.dataUrl})`)
    .join('\n\n');
  return `${text}${CANVAS_IMAGES_SEPARATOR}${imgMarkdown}`;
}

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
  statusEmote?: string | null;
  onUpdateStatusEmote?: (emote: string | null) => void;
  clientIp?: string;
  roomTheme?: string;
  onRoomThemeChange?: (theme: string) => void;
  maxSeats: number;
  onUpdateMaxSeats: (max: number) => void;
  isLocked: boolean;
  onToggleLockRoom: () => void;
  knockRequired?: boolean;
  onToggleKnockRequired?: () => void;
  onPanicDestroy?: () => void;
  peerSeats: Record<string, number>;
  mySeatIndex: number;
  onSwitchSeat: (seatIdx: number) => void;
  speakingPeers?: Record<string, boolean>;
  peerVolumes?: Record<string, number>;
  onChangePeerVolume?: (peerId: string, volumePercent: number) => void;
  seatReactions?: Array<{ id: string; peerId: string; emoteUrl: string }>;
  onSendReaction?: (emoteUrl: string, emoteName?: string) => void;
  roomUrl: string;
  peers: Peer[];
  transfers: FileTransfer[];
  messages: TextMessage[];
  scratchpadText: string;
  scratchpadTypingUser?: string | null;
  peerConnectionTypes?: Record<string, 'direct' | 'relay'>;
  onUpdateScratchpad: (text: string) => void;
  onSendFiles: (files: FileList | File[]) => void;
  onSendText: (text: string, isClipboard?: boolean, isBurner?: boolean) => void;
  onLeaveRoom: () => void;
  onOpenQR: () => void;
  onToggleMic: () => Promise<boolean>;
  onToggleScreen?: () => Promise<boolean>;
  remoteVideoRef?: React.RefObject<HTMLVideoElement | null>;
  isMicActive: boolean;
  isScreenActive?: boolean;
  hasRemoteVideo?: boolean;
  onAcceptFile: (fileId: string) => void;
  onCancelTransfer?: (transferId: string) => void;
  onDismissTransfer?: (transferId: string) => void;
  onClearCompletedTransfers?: () => void;
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
  statusEmote,
  onUpdateStatusEmote: _onUpdateStatusEmote,
  clientIp: _clientIp,
  roomTheme,
  onRoomThemeChange,
  maxSeats,
  onUpdateMaxSeats,
  isLocked,
  onToggleLockRoom,
  knockRequired = false,
  onToggleKnockRequired,
  onPanicDestroy,
  peerSeats,
  mySeatIndex,
  onSwitchSeat,
  speakingPeers = {},
  peerVolumes = {},
  onChangePeerVolume,
  seatReactions = [],
  onSendReaction,
  roomUrl,
  peers,
  transfers,
  messages,
  scratchpadText,
  scratchpadTypingUser,
  peerConnectionTypes,
  onUpdateScratchpad,
  onSendFiles,
  onSendText,
  onLeaveRoom,
  onOpenQR,
  onToggleMic,
  onToggleScreen: _onToggleScreen,
  remoteVideoRef: _remoteVideoRef,
  isMicActive,
  isScreenActive: _isScreenActive = false,
  hasRemoteVideo: _hasRemoteVideo = false,
  onAcceptFile,
  onCancelTransfer,
  onDismissTransfer,
  onClearCompletedTransfers,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [activeSideTab, setActiveSideTab] = useState<'notes' | 'chat'>('notes');
  const [meetingSeconds, setMeetingSeconds] = useState(0);

  const [isBurnerChat, setIsBurnerChat] = useState(false);
  const [isCanvasPreview, setIsCanvasPreview] = useState(false);
  const [isCanvasDownloadOpen, setIsCanvasDownloadOpen] = useState(false);
  const canvasDownloadMenuRef = useRef<HTMLDivElement>(null);
  const canvasImageInputRef = useRef<HTMLInputElement | null>(null);
  const [canvasToast, setCanvasToast] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<{ name: string; content: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const { cleanText, canvasImages } = useMemo(() => {
    return parseCanvasContent(scratchpadText);
  }, [scratchpadText]);

  useEffect(() => {
    if (!isCanvasDownloadOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        canvasDownloadMenuRef.current &&
        !canvasDownloadMenuRef.current.contains(e.target as Node)
      ) {
        setIsCanvasDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isCanvasDownloadOpen]);

  const processAndAddCanvasImage = async (file: File) => {
    try {
      const objUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = objUrl;
      await new Promise((res, rej) => {
        img.onload = () => res(null);
        img.onerror = rej;
      });
      URL.revokeObjectURL(objUrl);

      const maxDim = 1200;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const webpData = canvas.toDataURL('image/webp', 0.8);
        const altName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'Скриншот';
        const updatedImages = [...canvasImages, { alt: altName, dataUrl: webpData }];
        const full = serializeCanvasContent(cleanText, updatedImages);
        onUpdateScratchpad(full);
        sound.playMessage();
        setCanvasToast('Изображение добавлено в Канвас');
        setTimeout(() => setCanvasToast(null), 3000);
      }
    } catch (err) {
      console.warn('Canvas image processing failed', err);
    }
  };

  const handleCanvasPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          processAndAddCanvasImage(file);
        }
        return;
      }
    }
  };

  const handleCanvasImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAndAddCanvasImage(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleRemoveCanvasImage = (removeIdx: number) => {
    const updatedImages = canvasImages.filter((_, idx) => idx !== removeIdx);
    const full = serializeCanvasContent(cleanText, updatedImages);
    onUpdateScratchpad(full);
    sound.playClick();
  };

  const isCodeOrTextFile = (name: string) => {
    return /\.(txt|md|json|ts|tsx|js|jsx|py|html|css|log|yml|yaml|sql|sh)$/i.test(name);
  };

  const handleOpenCodePreview = async (transfer: FileTransfer) => {
    if (!transfer.blobUrl) return;
    try {
      const res = await fetch(transfer.blobUrl);
      const text = await res.text();
      setPreviewCode({ name: transfer.name, content: text });
      sound.playClick();
    } catch (err) {
      console.warn('Failed to load code preview', err);
    }
  };

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
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const [isEmotePickerOpen, setIsEmotePickerOpen] = useState(false);
  const [customNameInput, setCustomNameInput] = useState(myUserName || '');
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isEnabled());
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    target:
      | { kind: 'me' }
      | { kind: 'peer'; peer: Peer }
      | { kind: 'seat'; seatIndex: number; spotName: string };
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const handleOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [contextMenu]);

  const openSeatContextMenu = (
    e: React.MouseEvent,
    target:
      | { kind: 'me' }
      | { kind: 'peer'; peer: Peer }
      | { kind: 'seat'; seatIndex: number; spotName: string }
  ) => {
    sound.playClick();
    const x = Math.min(e.clientX, window.innerWidth - 265);
    const y = Math.min(e.clientY, window.innerHeight - 310);
    setContextMenu({ x: Math.max(8, x), y: Math.max(8, y), target });
  };

  const myPeer = peers.find((p) => p.id === myPeerId);
  const isHost = myPeer?.isHost ?? peers.length <= 1;
  const activeMyName = myUserName || myPeer?.name || 'Quantum Lynx';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const meetingFilesSectionRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const dragCounter = useRef(0);
  const [fileToast, setFileToast] = useState<string | null>(null);

  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    name: string;
    type: 'image' | 'video' | 'audio' | 'doc';
    size?: number;
  } | null>(null);

  const hasActiveTransfer = transfers.some((t) => t.status === 'transferring');
  useScreenWakeLock(hasActiveTransfer);

  const [isZipping, setIsZipping] = useState(false);
  const downloadableTransfers = transfers.filter(
    (t) => t.status === 'completed' && Boolean(t.blobUrl)
  );
  const completedTransfersCount = transfers.filter(
    (t) => t.status === 'completed' || t.status === 'error' || t.status === 'cancelled'
  ).length;

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
      a.download = `bridgik-meeting-files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setFileToast(`Архив bridgik-meeting-files.zip готов (${downloadableTransfers.length} файлов)`);
      setTimeout(() => setFileToast(null), 3500);
    } catch (err) {
      console.error('ZIP creation failed:', err);
      setFileToast('Не удалось собрать ZIP-архив');
      setTimeout(() => setFileToast(null), 3500);
    } finally {
      setIsZipping(false);
    }
  };

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

  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [recentlyReceivedBadge, setRecentlyReceivedBadge] = useState<number | null>(null);
  const recentBadgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMessagesLength = useRef(messages.length);
  const [newChatToast, setNewChatToast] = useState<{
    sender: string;
    text: string;
    count: number;
  } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scratchpadTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scratchpadSelectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  useEffect(() => {
    if (
      scratchpadTextareaRef.current &&
      document.activeElement === scratchpadTextareaRef.current
    ) {
      const { start, end } = scratchpadSelectionRef.current;
      scratchpadTextareaRef.current.setSelectionRange(start, end);
    }
  }, [cleanText]);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      const addedMessages = messages.slice(prevMessagesLength.current);
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
          setRecentlyReceivedBadge(incomingFromOthers.length);
          if (recentBadgeTimeoutRef.current) clearTimeout(recentBadgeTimeoutRef.current);
          recentBadgeTimeoutRef.current = setTimeout(() => {
            setRecentlyReceivedBadge(null);
          }, 3500);
        }

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
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'TEXTAREA' ||
          target.tagName === 'INPUT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        sound.playConnect();
        onSendFiles(e.clipboardData.files);
        setFileToast('Файл из буфера добавлен в файлы комнаты');
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

  const handleSwitchSeat = (seatIdx: number) => {
    if (seatIdx === mySeatIndex) return;
    sound.playClick();
    onSwitchSeat(seatIdx);
  };

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
    navigator.clipboard.writeText(cleanText || scratchpadText);
    setCopiedNotes(true);
    sound.playClick();
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleDownloadCanvas = (format: 'md' | 'txt' | 'html') => {
    let mime = 'text/markdown;charset=utf-8';
    let ext = 'md';
    let content = scratchpadText;

    if (format === 'txt') {
      mime = 'text/plain;charset=utf-8';
      ext = 'txt';
      content = cleanText;
    } else if (format === 'html') {
      mime = 'text/html;charset=utf-8';
      ext = 'html';
      const bodyHtml = cleanText
        .split('\n')
        .map((line) => `<p style="margin:8px 0;white-space:pre-wrap;">${line || '&nbsp;'}</p>`)
        .join('');
      const imagesHtml = canvasImages
        .map(
          (img) =>
            `<div style="margin:16px 0;"><img src="${img.dataUrl}" alt="${img.alt}" style="max-width:100%;border-radius:8px;border:1px solid #444;" /></div>`
        )
        .join('');
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bridgik Notes - ${pin}</title><style>body{font-family:system-ui,-apple-system,sans-serif;background:#181818;color:#eaeaea;padding:32px;max-width:800px;margin:0 auto;line-height:1.6;}h1{color:#9ac43e;border-bottom:1px solid #333;padding-bottom:8px;}</style></head><body><h1>Заметки Bridgik (Комната ${pin})</h1>${bodyHtml}${imagesHtml}</body></html>`;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-notes-${pin}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    sound.playClick();
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendText(chatInput.trim(), false, isBurnerChat);
      setChatInput('');
    }
  };

  const handleSelectRoom = (roomId: RoomId) => {
    if (!isHost) return;
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
  const activeSeats = currentRoom.seats.slice(0, maxSeats);

  const actualMySeat = mySeatIndex >= 0 && mySeatIndex < maxSeats ? mySeatIndex : 0;
  const seatOccupants: Record<
    number,
    { type: 'me' } | { type: 'peer'; peer: (typeof otherPeers)[0] }
  > = {
    [actualMySeat]: { type: 'me' },
  };

  const occupiedIndices = new Set<number>([actualMySeat]);

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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
      {/* Top Header Bar */}
      <div className="bg-[#1e1e1e] border border-[#353535] rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-[#141414] hover:bg-[#1c1c1c] px-3 py-1.5 rounded-lg border border-[#333333] cursor-pointer transition-colors"
            title={copiedLink ? 'Ссылка скопирована в буфер!' : 'Кликните, чтобы скопировать ссылку'}
          >
            <span className="text-xs text-[#888888] uppercase font-bold tracking-wider">PIN:</span>
            <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-wider text-[#9ac43e]">
              {pin}
            </span>
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#777777] hover:text-[#ededed]" />
            )}
          </div>

          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#141414] border border-[#333333] text-xs sm:text-sm font-mono">
            <span className="w-2 h-2 rounded-full bg-[#789d2a] animate-pulse" />
            <span className="text-[#ededed] font-bold">{formatTimer(meetingSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#aaaaaa]">
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

          {knockRequired && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#789d2a]/15 border border-[#789d2a]/40 text-xs font-bold text-[#bbf348]">
              <Bell className="w-3.5 h-3.5" />
              <span>Зал ожидания</span>
            </div>
          )}

          {isLocked && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ed2b3b]/15 border border-[#ed2b3b]/30 text-xs font-bold text-[#ef9282]">
              <Lock className="w-3.5 h-3.5" />
              <span>Комната закрыта</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isHost ? (
            <button
              onClick={() => {
                setIsRoomPickerOpen(!isRoomPickerOpen);
                setIsReactionPickerOpen(false);
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-7 space-y-5">
          {/* Living Room Stage */}
          <div className="relative rounded-3xl border-2 border-[#33333e] bg-[#0c0c12] shadow-2xl overflow-hidden flex flex-col items-center justify-center">
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

            <div className="relative w-full aspect-video max-h-[520px] overflow-hidden flex items-center justify-center">
              <img
                src={currentRoom.imageSrc}
                alt={currentRoom.title}
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              <div
                className="absolute inset-0 pointer-events-none opacity-20 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%)',
                  backgroundSize: '100% 4px',
                }}
              />

              {activeSeats.map((seat, index) => {
                const occupant = seatOccupants[index];
                let seatContent: React.ReactNode = null;

                if (occupant?.type === 'me') {
                  seatContent = (
                    <PixelAvatarSeat
                      name={activeMyName}
                      avatar={userAvatar || getAvatarForName(activeMyName)}
                      isMe={true}
                      deviceType={myPeer?.deviceType}
                      isMicActive={isMicActive}
                      isSpeaking={Boolean(speakingPeers[myPeerId])}
                      spotName={seat.spotName}
                      accentColor={currentRoom.accent}
                      onToggleMic={onToggleMic}
                      isHost={isHost}
                      isAdmin={isAdmin}
                      adminFrame={adminFrame}
                      statusEmote={statusEmote || undefined}
                      reactions={seatReactions.filter((r) => r.peerId === myPeerId)}
                      onContextMenu={(e) => openSeatContextMenu(e, { kind: 'me' })}
                    />
                  );
                } else if (occupant?.type === 'peer') {
                  const peer = occupant.peer;
                  seatContent = (
                    <PixelAvatarSeat
                      name={peer.name}
                      avatar={peer.avatar || getAvatarForName(peer.name)}
                      isMe={false}
                      deviceType={peer.deviceType}
                      isMicActive={Boolean(peer.isMicActive)}
                      isSpeaking={Boolean(speakingPeers[peer.id])}
                      spotName={seat.spotName}
                      accentColor={currentRoom.accent}
                      isHost={peer.isHost}
                      isAdmin={peer.isAdmin}
                      adminFrame={peer.adminFrame}
                      statusEmote={peer.statusEmote}
                      connectionType={peerConnectionTypes?.[peer.id]}
                      volumePercent={peerVolumes[peer.id] ?? 100}
                      onChangeVolume={
                        onChangePeerVolume
                          ? (val) => onChangePeerVolume(peer.id, val)
                          : undefined
                      }
                      reactions={seatReactions.filter((r) => r.peerId === peer.id)}
                      onKick={isHost ? () => handleKickPeer(peer.id) : undefined}
                      onContextMenu={(e) => openSeatContextMenu(e, { kind: 'peer', peer })}
                    />
                  );
                } else {
                  seatContent = (
                    <EmptyPixelSeat
                      spotName={seat.spotName}
                      accentColor={currentRoom.accent}
                      onTakeSeat={() => handleSwitchSeat(index)}
                      onContextMenu={(e) =>
                   openSeatContextMenu(e, {
                     kind: 'seat',
                     seatIndex: index,
                     spotName: seat.spotName,
                   })
                 }
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

            {/* Control Dock */}
            <div className="relative sm:absolute sm:bottom-3 sm:left-1/2 sm:-translate-x-1/2 z-30 flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 px-2.5 py-2 w-full sm:w-auto bg-[#121218]/95 border-t sm:border border-white/15 sm:rounded-2xl shadow-2xl backdrop-blur-md">
              <button
                onClick={onToggleMic}
                className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                  !isMicActive
                    ? 'bg-[#ed2b3b] hover:bg-[#d92231] text-white shadow-[0_0_12px_rgba(237,43,59,0.45)]'
                    : 'bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10'
                }`}
                title={
                  isMicActive
                    ? 'Микрофон включён (нажмите, чтобы выключить)'
                    : 'Микрофон выключен (нажмите, чтобы говорить)'
                }
              >
                {isMicActive ? (
                  <Mic className="w-4 h-4 text-[#9ac43e]" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
              </button>

              {onSendReaction && (
                <button
                  onClick={() => {
                    setIsReactionPickerOpen((prev) => !prev);
                    setIsRoomPickerOpen(false);
                    sound.playClick();
                  }}
                  className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer focus:outline-none ${
                    isReactionPickerOpen
                      ? 'bg-[#789d2a]/25 border-[#789d2a] text-[#bbf348]'
                      : 'bg-[#25252c] hover:bg-[#303038] text-[#ededed] border-white/10'
                  }`}
                  title="Отправить 7TV-реакцию"
                >
                  <Smile className="w-4 h-4 text-[#9ac43e]" />
                </button>
              )}

              <button
                onClick={() => {
                  meetingFilesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative p-2 sm:p-2.5 rounded-xl bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
                title="Файлы комнаты"
              >
                <Paperclip className="w-4 h-4 text-[#9ac43e]" />
                {transfers.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#789d2a] text-white text-[10px] font-mono font-bold flex items-center justify-center border border-[#121218]">
                    {transfers.length}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenQR}
                className="p-2 sm:p-2.5 rounded-xl bg-[#25252c] hover:bg-[#303038] text-[#ededed] border border-white/10 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
                title="Пригласить (QR-код и ссылка)"
              >
                <Share2 className="w-4 h-4 text-[#9ac43e]" />
              </button>

              <button
                onClick={onLeaveRoom}
                className="p-2 sm:p-2.5 rounded-xl bg-[#25252c] hover:bg-[#353540] text-[#cccccc] hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
                title="Покинуть комнату"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {onPanicDestroy && (
                <button
                  onClick={onPanicDestroy}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#ed2b3b]/20 hover:bg-[#ed2b3b] text-[#ef9282] hover:text-white border border-[#ed2b3b]/50 flex items-center justify-center transition-colors cursor-pointer focus:outline-none shadow-[0_0_12px_rgba(237,43,59,0.25)]"
                  title={
                    isHost
                      ? 'ПАНИКА: мгновенно уничтожить комнату для всех'
                      : 'ПАНИКА: экстренно всё стереть и выйти'
                  }
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              )}
            </div>

            {onSendReaction && (
              <EmotePicker
                isOpen={isReactionPickerOpen}
                onClose={() => setIsReactionPickerOpen(false)}
                positionClass="bottom-16 left-1/2 -translate-x-1/2"
                onSelectEmote={(emote) => {
                  onSendReaction(emote.url, emote.name);
                  setIsReactionPickerOpen(false);
                }}
              />
            )}

            {isRoomPickerOpen && (
              <div className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 z-40 bg-[#14141c] border border-white/20 rounded-2xl p-3 shadow-2xl w-84 max-w-[95%] animate-in fade-in zoom-in-95 duration-150">
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
                          <p className="text-xs font-extrabold text-[#ededed] truncate">
                            {r.title}
                          </p>
                          <p className="text-[10px] text-[#888888] truncate">{r.subtitle}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#9ac43e] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Room Files Drawer */}
          <div
            ref={meetingFilesSectionRef}
            className="bg-[#1e1e1e] border border-[#353535] rounded-2xl p-4 sm:p-5 shadow-sm scroll-mt-6"
          >
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
              <div className="flex items-center gap-2">
                {downloadableTransfers.length >= 2 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isZipping}
                    className="px-3 py-1.5 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] disabled:opacity-60 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Скачать все файлы комнаты одним ZIP-архивом"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>
                      {isZipping
                        ? 'Собираем ZIP...'
                        : `Скачать всё ZIP (${downloadableTransfers.length})`}
                    </span>
                  </button>
                )}
                {completedTransfersCount > 0 && onClearCompletedTransfers && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onClearCompletedTransfers();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#272727] hover:bg-[#333333] text-[#888888] hover:text-[#ededed] text-xs font-bold transition-colors cursor-pointer border border-[#3a3a3a]"
                    title="Убрать завершённые файлы из списка"
                  >
                    Очистить
                  </button>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#272727] hover:bg-[#333333] text-[#ededed] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3a3a3a]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Прикрепить файл</span>
                </button>
              </div>
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
                            <p className="font-bold text-[#ededed] truncate max-w-[170px] sm:max-w-xs">
                              {t.name}
                            </p>
                            <p className="text-xs text-[#888888] flex items-center gap-2 mt-0.5 font-mono">
                              <span>{(t.size / 1024 / 1024).toFixed(1)} МБ</span>
                              <span>•</span>
                              <span
                                className={
                                  t.type === 'upload' ? 'text-[#9ac43e]' : 'text-[#888888]'
                                }
                              >
                                {t.type === 'upload' ? 'Отправлено' : 'Получено'}
                              </span>
                              <span>•</span>
                              <span
                                className={
                                  t.status === 'completed'
                                    ? 'text-[#9ac43e] font-semibold'
                                    : 'text-[#d4e8a8]'
                                }
                              >
                                {t.status === 'completed' ? 'Готово' : `${t.progress}%`}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {t.blobUrl && (
                            <>
                              {isCodeOrTextFile(t.name) && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCodePreview(t)}
                                  className="p-2 rounded-xl bg-[#25252e] hover:bg-[#30303c] text-[#ededed] hover:text-[#9ac43e] border border-white/10 transition-colors cursor-pointer shadow-sm"
                                  title="Просмотр кода / текста"
                                >
                                  <Code className="w-4 h-4 text-[#9ac43e]" />
                                </button>
                              )}

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

                          {t.status === 'transferring' && onCancelTransfer && (
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                onCancelTransfer(t.id);
                              }}
                              className="p-2 rounded-xl bg-[#25252e] hover:bg-[#382020] text-[#888888] hover:text-[#ef9282] border border-white/10 transition-colors cursor-pointer shadow-sm"
                              title="Отменить передачу"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          {(t.status === 'completed' || t.status === 'error' || t.status === 'cancelled') && onDismissTransfer && (
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                onDismissTransfer(t.id);
                              }}
                              className="p-2 rounded-xl bg-[#25252e] hover:bg-[#382020] text-[#777777] hover:text-[#ef9282] border border-white/10 transition-colors cursor-pointer shadow-sm"
                              title="Убрать файл из списка"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isAud && t.blobUrl && (
                        <div className="mt-1 pt-2 border-t border-white/5">
                          <CustomAudioPlayer src={t.blobUrl} compact title={t.name} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="py-4 px-3 text-center text-xs sm:text-sm text-[#888888] border border-dashed border-[#333333] hover:border-[#789d2a]/60 rounded-xl cursor-pointer transition-colors"
              >
                <span className="hidden sm:inline">
                  Перетащите сюда документы или файлы для участников комнаты
                </span>
                <span className="sm:hidden">
                  Нажмите сюда или на «Прикрепить файл», чтобы отправить участникам
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scratchpad & Chat */}
        <div className="lg:col-span-5 bg-[#1e1e1e] border border-[#353535] rounded-2xl flex flex-col h-[460px] lg:h-[560px] shadow-md overflow-hidden">
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

              {unreadChatCount > 0 || recentlyReceivedBadge !== null ? (
                <span className="px-2 py-0.5 rounded-full bg-[#789d2a] text-white text-xs font-black font-mono shadow-[0_0_12px_rgba(120,157,42,0.9)] animate-bounce flex items-center gap-1 border border-[#bbf348]">
                  +{unreadChatCount > 0 ? unreadChatCount : recentlyReceivedBadge}
                </span>
              ) : (
                <span className="text-xs font-mono text-[#777777]">({messages.length})</span>
              )}
            </button>
          </div>

          {activeSideTab === 'notes' ? (
            <div className="flex-1 flex flex-col p-4">
              <div className="flex items-center justify-between mb-3 text-xs sm:text-sm text-[#aaaaaa] gap-2 flex-wrap">
                <span className="font-semibold text-[#9ac43e] flex items-center gap-1.5 shrink-0" title="Синхронизация по P2P. Нажмите Ctrl + V для вставки скриншота">
                  <span className="w-2 h-2 rounded-full bg-[#789d2a]" />
                  <span>Канвас</span>
                </span>
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
                  {/* Segmented Editor vs Preview Switcher */}
                  <div className="flex items-center bg-[#18181f] p-0.5 rounded-lg border border-[#33333d] shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCanvasPreview) {
                          setIsCanvasPreview(false);
                          sound.playClick();
                        }
                      }}
                      className={`px-2 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        !isCanvasPreview
                          ? 'bg-[#789d2a] text-white shadow-xs'
                          : 'text-[#888888] hover:text-[#cccccc]'
                      }`}
                      title="Режим ввода: писать текст, вставлять заметки и скриншоты (Ctrl + V)"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Редактор</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isCanvasPreview) {
                          setIsCanvasPreview(true);
                          sound.playClick();
                        }
                      }}
                      className={`px-2 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isCanvasPreview
                          ? 'bg-[#789d2a] text-white shadow-xs'
                          : 'text-[#888888] hover:text-[#cccccc]'
                      }`}
                      title="Режим чистового просмотра: форматирование и картинки"
                    >
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">Превью</span>
                    </button>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 sm:px-2 sm:py-1 hover:text-white rounded bg-[#272727] hover:bg-[#333333] transition-colors cursor-pointer text-xs flex items-center gap-1 border border-[#383838] shrink-0"
                    title="Прикрепить файл к комнате"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-[#9ac43e]" />
                    <span className="hidden sm:inline">Файл</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => canvasImageInputRef.current?.click()}
                    className="p-1 sm:px-2 sm:py-1 hover:text-white rounded bg-[#272727] hover:bg-[#333333] transition-colors cursor-pointer text-xs flex items-center gap-1 border border-[#383838] shrink-0"
                    title="Вставить картинку в Канвас"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#9ac43e]" />
                    <span className="hidden sm:inline">Картинка</span>
                  </button>
                  <input
                    ref={canvasImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCanvasImageUpload}
                  />
                  <button
                    onClick={handleCopyNotes}
                    className="p-1 sm:px-2 sm:py-1 hover:text-white rounded bg-[#272727] hover:bg-[#333333] transition-colors cursor-pointer text-xs flex items-center gap-1 border border-[#383838] shrink-0"
                    title="Скопировать содержимое Канваса"
                  >
                    {copiedNotes ? (
                      <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden md:inline">
                      {copiedNotes ? 'Скопировано' : 'Копировать'}
                    </span>
                  </button>

                  {/* Multi-Format Canvas Download */}
                  <div className="relative shrink-0" ref={canvasDownloadMenuRef}>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsCanvasDownloadOpen((prev) => !prev);
                      }}
                      className="p-1 sm:px-2 sm:py-1 hover:text-white rounded bg-[#272727] hover:bg-[#333333] transition-colors cursor-pointer text-xs flex items-center gap-1 border border-[#383838] shrink-0"
                      title="Скачать Канвас (.md, .txt, .html)"
                    >
                      <Download className="w-3.5 h-3.5 text-[#9ac43e]" />
                      <span>Скачать</span>
                      <ChevronDown className="w-3 h-3 text-[#888888]" />
                    </button>

                    {isCanvasDownloadOpen && (
                      <div className="absolute right-0 top-8 z-50 p-1.5 rounded-xl bg-[#181820] border border-[#383848] shadow-2xl min-w-[155px] flex flex-col gap-1 backdrop-blur-md animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => {
                            handleDownloadCanvas('md');
                            setIsCanvasDownloadOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-left text-xs font-bold text-[#ededed] hover:bg-[#789d2a]/20 hover:text-[#bbf348] flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Markdown</span>
                          <span className="text-[10px] font-mono text-[#888888]">.md</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleDownloadCanvas('txt');
                            setIsCanvasDownloadOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-left text-xs font-bold text-[#ededed] hover:bg-[#789d2a]/20 hover:text-[#bbf348] flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Текст</span>
                          <span className="text-[10px] font-mono text-[#888888]">.txt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleDownloadCanvas('html');
                            setIsCanvasDownloadOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-left text-xs font-bold text-[#ededed] hover:bg-[#789d2a]/20 hover:text-[#bbf348] flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Веб-страница</span>
                          <span className="text-[10px] font-mono text-[#888888]">.html</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {scratchpadTypingUser && (
                <div className="flex items-center gap-1.5 text-xs text-[#9ac43e] font-mono animate-pulse mb-1.5 px-1">
                  <span>✏️</span>
                  <span>{scratchpadTypingUser} печатает в Канвасе...</span>
                </div>
              )}

              {canvasToast && (
                <div className="flex items-center gap-1.5 text-xs text-[#9ac43e] font-mono mb-1.5 px-1 animate-in fade-in">
                  <span>✓</span>
                  <span>{canvasToast}</span>
                </div>
              )}

              {isCanvasPreview ? (
                <div className="flex-1 w-full bg-[#141414] border border-[#333333] rounded-xl p-3.5 text-sm sm:text-base text-[#ededed] overflow-y-auto space-y-3 font-mono leading-relaxed select-text scrollbar-thin">
                  {cleanText ? (
                    cleanText.split('\n').map((line, idx) => (
                      <p key={idx} className="min-h-[1.2em]">
                        {line}
                      </p>
                    ))
                  ) : canvasImages.length === 0 ? (
                    <div className="text-[#666666] italic">
                      Канвас пуст. Вставьте скриншот (Ctrl + V) или напишите текст.
                    </div>
                  ) : null}

                  {canvasImages.length > 0 && (
                    <div className="pt-3 border-t border-white/10 space-y-3">
                      <div className="text-xs font-bold text-[#aaaaaa] flex items-center gap-1.5 font-sans">
                        <ImageIcon className="w-3.5 h-3.5 text-[#9ac43e]" />
                        <span>Прикреплённые изображения ({canvasImages.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {canvasImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl overflow-hidden border border-white/10 bg-black/40 group relative shadow-md"
                          >
                            <img
                              src={img.dataUrl}
                              alt={img.alt}
                              onClick={() =>
                                setPreviewMedia({
                                  url: img.dataUrl,
                                  name: img.alt,
                                  type: 'image',
                                  size: Math.round(img.dataUrl.length * 0.75),
                                })
                              }
                              className="w-full h-auto object-contain max-h-72 cursor-pointer hover:opacity-95 transition-opacity"
                            />
                            <div className="p-2 flex items-center justify-between bg-[#181820]/80 text-xs">
                              <span className="truncate text-[#cccccc] font-sans">
                                {img.alt}
                              </span>
                              <a
                                href={img.dataUrl}
                                download={`${img.alt || 'canvas-image'}.webp`}
                                className="p-1 rounded hover:bg-white/10 text-[#9ac43e]"
                                title="Скачать изображение"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <textarea
                    ref={scratchpadTextareaRef}
                    value={cleanText}
                    onPaste={handleCanvasPaste}
                    onChange={(e) => {
                      const target = e.target;
                      scratchpadSelectionRef.current = {
                        start: target.selectionStart,
                        end: target.selectionEnd,
                      };
                      const updated = serializeCanvasContent(target.value, canvasImages);
                      onUpdateScratchpad(updated);
                    }}
                    onSelect={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      scratchpadSelectionRef.current = {
                        start: target.selectionStart,
                        end: target.selectionEnd,
                      };
                    }}
                    placeholder="Канвас комнаты... Нажмите Ctrl + V, чтобы вставить скриншот или картинку прямо в заметки."
                    className="flex-1 w-full bg-[#141414] border border-[#333333] rounded-xl p-3.5 text-base sm:text-lg text-[#ededed] placeholder-[#666666] outline-none focus:border-[#789d2a] resize-none font-mono leading-relaxed transition-colors min-h-[140px]"
                  />

                  {canvasImages.length > 0 && (
                    <div className="mt-2.5 p-2.5 sm:p-3 rounded-xl bg-[#17171d] border border-[#2a2a34] shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#aaaaaa] flex items-center gap-1.5 font-sans">
                          <ImageIcon className="w-3.5 h-3.5 text-[#9ac43e]" />
                          <span>Прикреплённые изображения ({canvasImages.length})</span>
                        </span>
                        <span className="text-[11px] text-[#666666] hidden sm:inline font-sans">
                          Клик — просмотр · ✕ — удалить
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                        {canvasImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative group shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-[#3a3a46] hover:border-[#789d2a] bg-black/40 transition-all shadow-sm"
                          >
                            <img
                              src={img.dataUrl}
                              alt={img.alt}
                              onClick={() => {
                                setPreviewMedia({
                                  url: img.dataUrl,
                                  name: img.alt || `Изображение ${idx + 1}`,
                                  type: 'image',
                                  size: Math.round(img.dataUrl.length * 0.75),
                                });
                              }}
                              className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCanvasImage(idx);
                              }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow z-10"
                              title="Удалить картинку из Канваса"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div
                              onClick={() => {
                                setPreviewMedia({
                                  url: img.dataUrl,
                                  name: img.alt || `Изображение ${idx + 1}`,
                                  type: 'image',
                                  size: Math.round(img.dataUrl.length * 0.75),
                                });
                              }}
                              className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer pointer-events-none"
                            >
                              <Eye className="w-4 h-4 text-white drop-shadow" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2 text-xs text-[#888888] flex items-center justify-between">
                <span>Канвас не сохраняется на сервере (P2P)</span>
                <span>
                  Символов: {cleanText.length}
                  {canvasImages.length > 0 ? ` · Картинок: ${canvasImages.length}` : ''}
                </span>
              </div>
            </div>
          ) : (
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
                      ? userAvatar || getAvatarForName(activeMyName)
                      : peer?.avatar || m.senderAvatar || getAvatarForName(m.senderName);
                    const messageIsAdmin = isMe ? isAdmin : Boolean(peer?.isAdmin || m.isAdmin);
                    const messageAdminFrame = isMe
                      ? adminFrame
                      : peer?.adminFrame || m.adminFrame || 'gold';
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
                        senderStatusEmote={
                          m.senderStatusEmote || (isMe ? statusEmote || undefined : peer?.statusEmote)
                        }
                        isBurner={m.isBurner}
                        expiresAt={m.expiresAt}
                        time={new Date(m.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      />
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              <div className="relative border-t border-[#353535] bg-[#171717]">
                <EmotePicker
                  isOpen={isEmotePickerOpen}
                  onClose={() => setIsEmotePickerOpen(false)}
                  onSelectEmote={(emote) => {
                    setChatInput((prev) => (prev ? `${prev} ${emote.code} ` : `${emote.code} `));
                    setIsEmotePickerOpen(false);
                  }}
                />

                <form onSubmit={handleSendChat} className="p-2.5 sm:p-3 flex items-center gap-1.5 sm:gap-2">
                  <div
                    className="relative shrink-0 select-none"
                    title={isAdmin ? `Создатель: ${activeMyName}` : `Ваш аватар: ${activeMyName}`}
                  >
                    <img
                      src={userAvatar || getAvatarForName(activeMyName)}
                      alt={activeMyName}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover bg-[#171717] ${
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
                    placeholder={isBurnerChat ? 'Сгорающее сообщение (10 сек)...' : 'Сообщение или ссылка...'}
                    className={`flex-1 min-w-0 w-full bg-[#141414] border rounded-xl px-3 sm:px-3.5 py-2 text-sm sm:text-base text-[#ededed] placeholder-[#666666] outline-none transition-colors ${
                      isBurnerChat
                        ? 'border-orange-500/80 focus:border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                        : 'border-[#333333] focus:border-[#789d2a]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 sm:p-2.5 rounded-xl border bg-[#222222] border-[#333333] text-[#888888] hover:text-[#9ac43e] hover:border-[#789d2a] transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    title="Прикрепить файл к комнате"
                  >
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEmotePickerOpen(!isEmotePickerOpen)}
                    className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                      isEmotePickerOpen
                        ? 'bg-[#789d2a]/20 border-[#789d2a] text-[#9ac43e]'
                        : 'bg-[#222222] border-[#333333] text-[#888888] hover:text-[#ededed] hover:border-[#555555]'
                    }`}
                    title="Смайлики (7TV и мемы)"
                  >
                    <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsBurnerChat(!isBurnerChat);
                    }}
                    className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                      isBurnerChat
                        ? 'bg-orange-500/25 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                        : 'bg-[#222222] border-[#333333] text-[#888888] hover:text-orange-400 hover:border-orange-500/50'
                    }`}
                    title={isBurnerChat ? 'Сгорающее сообщение ВКЛ (10 сек)' : 'Сгорающее сообщение (самоуничтожится через 10 сек)'}
                  >
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-md ${
                      isBurnerChat
                        ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30'
                        : 'bg-[#789d2a] hover:bg-[#8cb632] disabled:opacity-40 text-white shadow-[#789d2a]/20'
                    }`}
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
            <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-[#303038] shrink-0 bg-[#1b1b1f]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#25252e] border border-[#383845] flex items-center justify-center text-[#9ac43e]">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#ededed]">Настройки гостиной</h3>
                  <p className="text-xs text-[#888888]">
                    Выбор интерьера (все 8 мест), позывной и звук
                  </p>
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

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6 [scrollbar-color:#383848_transparent] [scrollbar-width:thin]">
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
                      {isLocked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-[#9ac43e]" />
                      )}
                      <span>
                        {isLocked
                          ? 'Комната закрыта (вход заблокирован)'
                          : 'Комната открыта для гостей'}
                      </span>
                    </button>

                    {onToggleKnockRequired && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onToggleKnockRequired();
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                          knockRequired
                            ? 'bg-[#789d2a]/20 text-[#bbf348] border-[#789d2a]'
                            : 'bg-[#1e1e28] text-[#ededed] border-white/10 hover:bg-[#282836]'
                        }`}
                      >
                        <Bell
                          className={`w-3.5 h-3.5 ${
                            knockRequired ? 'text-[#bbf348]' : 'text-[#888888]'
                          }`}
                        />
                        <span>
                          {knockRequired
                            ? 'Стук в дверь: ВКЛ (по одобрению)'
                            : 'Стук в дверь: ВЫКЛ'}
                        </span>
                      </button>
                    )}

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

              {isHost ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-[#9ac43e]" />
                      <h4 className="text-base font-bold text-[#ededed]">
                        Интерьер комнаты (выбор хоста)
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-[#888888]">
                      вместимость: {maxSeats} мест
                    </span>
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
                            <p className="text-xs text-[#888888] leading-tight mt-0.5">
                              {r.subtitle}
                            </p>
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
                  <span className="text-[11px] font-mono text-[#789d2a]">
                    Управляется организатором
                  </span>
                </div>
              )}

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
                    className="flex-1 min-w-0 bg-[#141418] border border-[#33333d] rounded-xl px-3.5 py-2 text-base text-[#ededed] outline-none focus:border-[#789d2a] font-mono transition-colors"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-2 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-white text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {nameSavedSuccess ? <Check className="w-4 h-4" /> : null}
                    <span>{nameSavedSuccess ? 'Сохранено' : 'Сохранить'}</span>
                  </button>
                </div>
              </div>

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

      {fileToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] px-4 py-2.5 rounded-2xl bg-[#1a2313]/95 border border-[#789d2a] text-[#b4e64f] text-sm font-bold shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
          <div className="w-6 h-6 rounded-lg bg-[#789d2a]/30 flex items-center justify-center text-[#9ac43e]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span>{fileToast}</span>
        </div>
      )}

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

      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-white"
          >
            <div className="min-w-0 pr-4">
              <p className="text-base sm:text-lg font-extrabold truncate">{previewMedia.name}</p>
              <p className="text-xs text-[#888888] font-mono">
                {previewMedia.size ? `${(previewMedia.size / 1024 / 1024).toFixed(2)} МБ · ` : ''}P2P Предпросмотр
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
                  <p className="text-base font-bold text-white mb-1 truncate px-2">
                    {previewMedia.name}
                  </p>
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
      {/* Code & Text File Preview Modal */}
      {previewCode && (
        <div
          onClick={() => setPreviewCode(null)}
          className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl flex flex-col max-h-[85vh] rounded-2xl bg-[#121218] border border-white/15 shadow-2xl overflow-hidden"
          >
            <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#161622]">
              <div className="flex items-center gap-2 min-w-0 pr-3">
                <Code className="w-4 h-4 text-[#9ac43e] shrink-0" />
                <span className="font-mono text-sm font-bold text-[#ededed] truncate">
                  {previewCode.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(previewCode.content);
                    sound.playClick();
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#242432] hover:bg-[#2f2f40] text-xs font-bold text-[#ededed] flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                >
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCode ? 'Скопировано!' : 'Копировать код'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewCode(null)}
                  className="p-1.5 rounded-xl bg-[#242432] hover:bg-[#2f2f40] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="flex-1 p-4 overflow-auto text-xs sm:text-sm font-mono text-[#dcdcdc] bg-[#0d0d12] whitespace-pre-wrap select-all leading-relaxed scrollbar-thin">
              {previewCode.content}
            </pre>
          </div>
        </div>
      )}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          onContextMenu={(e) => e.preventDefault()}
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          className="fixed z-[170] w-64 rounded-2xl bg-[#18181f]/98 border border-white/15 shadow-[0_20px_55px_rgba(0,0,0,0.9)] backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        >
          {contextMenu.target.kind === 'me' && (
            <>
              <div className="px-3.5 py-2.5 border-b border-white/[0.08] flex items-center gap-2.5">
                <img
                  src={userAvatar || getAvatarForName(activeMyName)}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-[#789d2a]"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[#ededed] truncate">
                    {activeMyName} (Вы)
                  </p>
                  <p className="text-[11px] text-[#9ac43e]">
                    {isHost ? 'Организатор комнаты' : 'Участник'}
                  </p>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => {
                    onToggleMic();
                    setContextMenu(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-[#ededed] hover:bg-white/[0.07] cursor-pointer text-left"
                >
                  {isMicActive ? (
                    <MicOff className="w-4 h-4 text-[#ef9282]" />
                  ) : (
                    <Mic className="w-4 h-4 text-[#9ac43e]" />
                  )}
                  <span>{isMicActive ? 'Выключить микрофон' : 'Включить микрофон'}</span>
                </button>

                {onSendReaction && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsReactionPickerOpen(true);
                      setContextMenu(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-[#ededed] hover:bg-white/[0.07] cursor-pointer text-left"
                  >
                    <Smile className="w-4 h-4 text-amber-300" />
                    <span>Отправить 7TV-реакцию</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setContextMenu(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-[#ededed] hover:bg-white/[0.07] cursor-pointer text-left"
                >
                  <Settings className="w-4 h-4 text-[#a8a8a8]" />
                  <span>Сменить ник и настройки</span>
                </button>

                {isHost && (
                  <button
                    type="button"
                    onClick={() => {
                      handleMuteAll();
                      setContextMenu(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-[#ededed] hover:bg-white/[0.07] cursor-pointer text-left"
                  >
                    <MicOff className="w-4 h-4 text-amber-400" />
                    <span>Заглушить всех в комнате</span>
                  </button>
                )}

                <div className="my-1 border-t border-white/[0.08]" />

                <button
                  type="button"
                  onClick={() => {
                    setContextMenu(null);
                    onLeaveRoom();
                  }}
                  className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-[#ef9282] hover:bg-[#ed2b3b]/20 cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Покинуть комнату</span>
                </button>
              </div>
            </>
          )}

          {contextMenu.target.kind === 'peer' && (() => {
            const peer = contextMenu.target.peer;
            const vol = peerVolumes[peer.id] ?? 100;
            const connType = peerConnectionTypes?.[peer.id];
            return (
              <>
                <div className="px-3.5 py-2.5 border-b border-white/[0.08] flex items-center gap-2.5">
                  <img
                    src={peer.avatar || getAvatarForName(peer.name)}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-extrabold text-[#ededed] truncate">
                        {peer.name}
                      </p>
                      {peer.isHost && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[#888888]">
                      {peer.isMicActive ? 'Микрофон вкл' : 'Микрофон выкл'}
                      {connType ? ` · ${connType === 'relay' ? 'TURN' : 'P2P'}` : ''}
                    </p>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5 text-sm font-bold">
                  {onChangePeerVolume && (
                    <div className="px-3 py-2 rounded-xl bg-white/[0.03] space-y-1.5 mb-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#c4c4c4] flex items-center gap-1.5">
                          {vol === 0 ? (
                            <VolumeX className="w-3.5 h-3.5 text-[#ef9282]" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-[#9ac43e]" />
                          )}
                          <span>Громкость для меня</span>
                        </span>
                        <span className="font-mono text-[#ededed]">{vol}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        step={5}
                        value={vol}
                        onChange={(e) => onChangePeerVolume(peer.id, Number(e.target.value))}
                        className="w-full accent-[#789d2a] cursor-pointer h-1.5"
                      />
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => onChangePeerVolume(peer.id, vol === 0 ? 100 : 0)}
                          className="flex-1 py-1 rounded-lg bg-[#25252e] hover:bg-[#32323d] text-[11px] text-[#ededed] cursor-pointer"
                        >
                          {vol === 0 ? 'Включить (100%)' : 'Заглушить для себя'}
                        </button>
                        {vol !== 100 && (
                          <button
                            type="button"
                            onClick={() => onChangePeerVolume(peer.id, 100)}
                            className="px-2 py-1 rounded-lg bg-[#25252e] hover:bg-[#32323d] text-[11px] text-[#9ac43e] cursor-pointer"
                          >
                            100%
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      handleOpenChatTab();
                      setChatInput((prev) =>
                        prev ? `${prev} @${peer.name} ` : `@${peer.name} `
                      );
                      setContextMenu(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-[#ededed] hover:bg-white/[0.07] cursor-pointer text-left"
                  >
                    <Send className="w-4 h-4 text-[#9ac43e]" />
                    <span>Упомянуть в чате</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(peer.name).catch(() => {});
                      sound.playClick();
                      setContextMenu(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-[#ededed] hover:bg-white/[0.07] cursor-pointer text-left"
                  >
                    <Copy className="w-4 h-4 text-[#a8a8a8]" />
                    <span>Скопировать ник</span>
                  </button>

                  {isHost && (
                    <>
                      <div className="my-1 border-t border-white/[0.08]" />
                      <p className="px-3 pt-1 text-[10px] uppercase tracking-wider text-amber-400/90 font-extrabold">
                        Действия хоста
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleMuteAll();
                          setContextMenu(null);
                        }}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-[#ededed] hover:bg-white/[0.07] cursor-pointer text-left"
                      >
                        <MicOff className="w-4 h-4 text-amber-400" />
                        <span>Заглушить всех в комнате</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setContextMenu(null);
                          handleKickPeer(peer.id);
                        }}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-[#ef9282] hover:bg-[#ed2b3b] hover:text-white cursor-pointer text-left transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Исключить из комнаты</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            );
          })()}

          {contextMenu.target.kind === 'seat' && (() => {
            const seatTarget = contextMenu.target;
            return (
              <div className="p-1.5 space-y-0.5 text-sm font-bold">
                <p className="px-3 py-1.5 text-xs text-[#888888] border-b border-white/[0.06]">
                  {seatTarget.spotName}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleSwitchSeat(seatTarget.seatIndex);
                    setContextMenu(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-[#bbf348] hover:bg-[#789d2a]/20 cursor-pointer text-left"
                >
                  <Armchair className="w-4 h-4" />
                  <span>Пересесть сюда</span>
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};