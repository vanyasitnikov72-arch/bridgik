export type ThemeMode = 'swiss' | 'cyberpunk' | 'lofi';
export type AppTab = 'bridge' | 'meeting' | 'about' | 'legal' | 'profile' | 'pricing' | 'admin' | 'catalog';
export type RoomMode = 'bridge' | 'meeting';

export type AuthProvider = 'yandex' | 'telegram' | 'key';
export type UserTier = 'free' | 'pro';
export type AvatarFrameId = 'none' | 'gold' | 'rgb' | 'plasma';

export interface UserSettings {
  // Общие
  soundEnabled: boolean;
  animationsEnabled: boolean;
  browserNotifications: boolean;
  verifyFileIntegrity: boolean;

  // Мост и передача
  autoDownload: boolean;
  radarVisible: boolean;
  stickyAutoAccept: boolean;
  confirmLargeFiles: boolean;

  // Комната и звук
  selectedAudioDeviceId: string;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  muteMicOnJoin: boolean;
  defaultBurnTimer: number;

  // Уведомления
  participantToasts: boolean;
  tgNotifyDownload: boolean;
  tgNotifyDevice: boolean;
  chatSoundNotify: boolean;

  // Каталог и расширения
  extraDeviceSlots?: number;
  purchasedCatalogItems?: string[];
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  soundEnabled: true,
  animationsEnabled: true,
  browserNotifications: false,
  verifyFileIntegrity: true,

  autoDownload: true,
  radarVisible: true,
  stickyAutoAccept: true,
  confirmLargeFiles: false,

  selectedAudioDeviceId: '',
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
  muteMicOnJoin: true,
  defaultBurnTimer: 10,

  participantToasts: true,
  tgNotifyDownload: true,
  tgNotifyDevice: false,
  chatSoundNotify: true,

  extraDeviceSlots: 0,
  purchasedCatalogItems: [],
};

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
  handle?: string;
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
  settings?: UserSettings;
  s3QuotaUsedMb: number;
  s3QuotaLimitMb: number;
  devices: StickyDevice[];
  extraDeviceSlots?: number;
  isAdmin?: boolean;
}

export interface AdminUser {
  id: string;
  licenseKey: string;
  displayName: string;
  avatarUrl?: string;
  tier: UserTier;
  proUntil?: string;
  isAdmin: boolean;
  yandexLogin?: string;
  telegramUsername?: string;
  deviceCount: number;
  s3QuotaUsedMb: number;
  createdAt: number;
  updatedAt: number;
}

export interface AdminDrop {
  id: string;
  userId?: string;
  targetDeviceId?: string;
  roomId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  senderName: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: number;
  createdAt: number;
  isExpired: boolean;
  isS3: boolean;
}

export interface PublicInboxUser {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  activeFrame: AvatarFrameId;
  tier: UserTier;
  isOnline: boolean;
  s3QuotaLimitMb: number;
}

export interface AdminStats {
  server: {
    uptime: number;
    nodeVersion: string;
    platform: string;
    pid: number;
    memory: {
      rssMb: number;
      heapTotalMb: number;
      heapUsedMb: number;
      totalMemMb: number;
      freeMemMb: number;
    };
  };
  webrtc: {
    roomsCount: number;
    peersCount: number;
    socketsCount: number;
    rooms: Array<{
      id: string;
      mode: string;
      peerCount: number;
      createdAt: number;
    }>;
  };
  storage: {
    s3Enabled: boolean;
    bucket: string;
    endpoint: string;
    region: string;
    objectCount: number;
    totalSizeBytes: number;
  };
  db: {
    totalUsers: number;
    proUsers: number;
    adminUsers: number;
    totalDevices: number;
    totalDrops: number;
    totalPayments: number;
  };
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
  fromDeviceId?: string;
  isSameAccount?: boolean;
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
    | 'interrupted'
    | 'paused'
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
      type: 'FILE_RESUME_REQUEST';
      fileId: string;
      fromChunk: number;
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