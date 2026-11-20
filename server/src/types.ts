export interface PeerInfo {
  id: string;
  socketId: string;
  name: string;
  avatar?: string;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  statusEmote?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  joinedAt: number;
  isHost: boolean;
  isAdmin?: boolean;
  isMicActive?: boolean;
  browserId?: string;
}

export interface Room {
  id: string;
  pin: string;
  createdAt: number;
  peers: Map<string, PeerInfo>;
  knockRequired?: boolean;
  approvedSockets?: Set<string>;
  pendingKnockSockets?: Set<string>;
  mode?: 'bridge' | 'meeting';
  maxSeats?: number;
  isLocked?: boolean;
  currentRoomTheme?: string;
  peerSeats?: Record<string, number>;
}

export interface SignalData {
  from: string;
  to: string;
  payload: any;
}

export type AvatarFrameId = 'none' | 'gold' | 'rgb' | 'plasma';
export type UserTier = 'free' | 'data-link' | 'live-hub' | 'overdrive' | 'pro';

export function hasBridgePro(tier?: UserTier | null): boolean {
  return tier === 'data-link' || tier === 'overdrive' || tier === 'pro';
}

export function hasRoomPro(tier?: UserTier | null): boolean {
  return tier === 'live-hub' || tier === 'overdrive' || tier === 'pro';
}

export function hasFullPro(tier?: UserTier | null): boolean {
  return tier === 'overdrive' || tier === 'pro';
}

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

export interface DbUser {
  id: string;
  license_key: string;
  display_name: string;
  avatar_url?: string;
  tier: UserTier;
  pro_until?: string;
  yandex_id?: string;
  yandex_login?: string;
  telegram_id?: string;
  telegram_username?: string;
  unlocked_frames: string;
  unlocked_themes: string;
  active_frame: AvatarFrameId;
  active_emote?: string;
  default_room_theme: string;
  stars_balance: number;
  s3_quota_used_mb: number;
  s3_quota_limit_mb: number;
  is_admin?: number;
  settings?: string;
  created_at: number;
  updated_at: number;
}

export interface DbDevice {
  id: string;
  user_id: string;
  name: string;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser_label: string;
  last_seen_at: number;
  created_at: number;
}

export interface StickyDeviceDto {
  id: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browserLabel: string;
  isCurrent: boolean;
  isOnline: boolean;
  lastSeenAt: number;
}

export interface DbPayment {
  id: string;
  user_id: string;
  license_key: string;
  amount: number;
  period: string;
  days: number;
  status: string;
  yookassa_payment_id?: string;
  payment_url?: string;
  created_at: number;
  updated_at: number;
}

export interface UserProfileDto {
  id: string;
  handle?: string;
  displayName: string;
  avatarUrl?: string;
  tier: UserTier;
  proUntil?: string;
  providers: {
    yandex?: { handle: string; avatarUrl?: string };
    telegram?: { username?: string; id?: number };
    hasLicenseKey: boolean;
  };
  licenseKeyPreview?: string;
  unlockedFrames: AvatarFrameId[];
  unlockedThemes: string[];
  activeFrame: AvatarFrameId;
  activeEmote?: string | null;
  defaultRoomTheme: string;
  settings: UserSettings;
  s3QuotaUsedMb: number;
  s3QuotaLimitMb: number;
  devices: StickyDeviceDto[];
  extraDeviceSlots?: number;
  isAdmin?: boolean;
}

export interface AdminUserDto {
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

export interface AdminDropDto {
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

export interface AdminStatsDto {
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

export interface DbDrop {
  id: string;
  user_id?: string;
  target_device_id?: string;
  room_id?: string;
  pin?: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  file_path: string;
  sender_name: string;
  download_count: number;
  max_downloads: number;
  expires_at: number;
  created_at: number;
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
