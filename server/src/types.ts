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
export type UserTier = 'free' | 'pro';

export interface DbUser {
  id: string;
  license_key: string;
  display_name: string;
  avatar_url?: string;
  tier: UserTier;
  pro_until?: string;
  yandex_login?: string;
  twitch_handle?: string;
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
  displayName: string;
  avatarUrl?: string;
  tier: UserTier;
  proUntil?: string;
  providers: {
    yandex?: { handle: string; avatarUrl?: string };
    twitch?: { handle: string; avatarUrl?: string };
    telegram?: { username?: string; id?: number };
    hasLicenseKey: boolean;
  };
  licenseKeyPreview?: string;
  unlockedFrames: AvatarFrameId[];
  unlockedThemes: string[];
  activeFrame: AvatarFrameId;
  activeEmote?: string | null;
  defaultRoomTheme: string;
  s3QuotaUsedMb: number;
  s3QuotaLimitMb: number;
  devices: StickyDeviceDto[];
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
