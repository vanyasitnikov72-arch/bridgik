export type ThemeMode = 'swiss' | 'cyberpunk' | 'lofi';
export type AppTab = 'bridge' | 'meeting' | 'about' | 'legal' | 'profile' | 'pricing';
export type RoomMode = 'bridge' | 'meeting';

export type AuthProvider = 'yandex' | 'telegram' | 'key';
export type UserTier = 'free' | 'pro';
export type AvatarFrameId = 'none' | 'gold' | 'rgb' | 'plasma';

export interface StickyDevice {
  id: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browserLabel: string;
  isCurrent: boolean;
  isOnline: boolean;
  lastSeenAt: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  tier: UserTier;
  proUntil?: string;
  providers: {
    yandex?: { handle: string; avatarUrl?: string };
    telegram?: { username?: string; id?: number };
    hasLicenseKey?: boolean;
  };
  licenseKeyPreview?: string;
  unlockedFrames: AvatarFrameId[];
  unlockedThemes: string[];
  activeFrame: AvatarFrameId;
  activeEmote?: string | null;
  defaultRoomTheme: string;
  s3QuotaUsedMb: number;
  s3QuotaLimitMb: number;
  devices: StickyDevice[];
}

export interface DropDto {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  senderName: string;
  downloadUrl: string;
  expiresAt: number;
  targetDeviceId?: string;
}

export interface Peer {
  id: string;
  name: string;
  avatar?: string;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  statusEmote?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  joinedAt: number;
  isHost: boolean;
  isAdmin?: boolean;
  isMicActive?: boolean;
}

export interface NearbyPeer {
  socketId: string;
  deviceId?: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  os?: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  osName?: string;
  browser?: string;
  deviceModel?: string;
  isCustomName?: boolean;
  isSameAccount?: boolean;
  isAdmin?: boolean;
  statusEmote?: string;
}

export interface PairRequest {
  fromSocketId: string;
  fromName: string;
  fromDevice: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  fromOs?: string;
  fromBrowser?: string;
  fromModel?: string;
  roomId: string;
  pin: string;
  isAdmin?: boolean;
  statusEmote?: string;
}

export interface TextMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  isAdmin?: boolean;
  senderStatusEmote?: string;
  text: string;
  timestamp: number;
  isClipboard?: boolean;
  isSystem?: boolean;
  isBurner?: boolean;
  expiresAt?: number;
}

export interface FileTransfer {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  type: 'upload' | 'download';
  peerId: string;
  peerName: string;
  progress: number;
  speed: number;
  status:
    | 'pending'
    | 'pending_approval'
    | 'waiting_receiver'
    | 'transferring'
    | 'completed'
    | 'cancelled'
    | 'error';
  blobUrl?: string;
  error?: string;
  savedToDisk?: boolean;
}

export type WebRTCMessage =
  | {
      type: 'TEXT';
      id: string;
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
      isAdmin?: boolean;
      senderStatusEmote?: string;
      text: string;
      timestamp: number;
      isClipboard?: boolean;
      isBurner?: boolean;
      expiresAt?: number;
    }
  | {
      type: 'FILE_OFFER';
      fileId: string;
      name: string;
      size: number;
      mimeType: string;
      senderName: string;
    }
  | {
      type: 'FILE_ACCEPT';
      fileId: string;
      streamToDisk: boolean;
    }
  | {
      type: 'FILE_REJECT';
      fileId: string;
    }
  | {
      type: 'FILE_META';
      fileId: string;
      name: string;
      size: number;
      mimeType: string;
      totalChunks: number;
      chunkSize: number;
      senderName: string;
    }
  | {
      type: 'FILE_COMPLETE';
      fileId: string;
    }
  | {
      type: 'FILE_CANCEL';
      fileId: string;
    }
  | {
      type: 'SCRATCHPAD_SYNC';
      text: string;
      updatedBy: string;
      timestamp: number;
    }
  | {
      type: 'SCRATCHPAD_TYPING';
      updatedBy: string;
      timestamp: number;
    }
  | {
      type: 'REACTION';
      id: string;
      senderId: string;
      emoteUrl: string;
      emoteName?: string;
      timestamp: number;
    };