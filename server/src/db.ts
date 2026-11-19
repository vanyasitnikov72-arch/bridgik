import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import {
  DbUser,
  DbDevice,
  UserProfileDto,
  StickyDeviceDto,
  AvatarFrameId,
  UserTier,
} from './types.js';

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'bridgik.db');
console.log(`[Database] Initializing SQLite database at: ${DB_PATH}`);

export const db = new DatabaseSync(DB_PATH);

// High-performance WAL mode & foreign keys
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

// Run migrations / table creation
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    license_key TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    tier TEXT DEFAULT 'free',
    pro_until TEXT,
    twitch_handle TEXT,
    telegram_id TEXT,
    telegram_username TEXT,
    unlocked_frames TEXT NOT NULL DEFAULT '["none"]',
    unlocked_themes TEXT NOT NULL DEFAULT '["cyber-lounge","cozy-loft","skyline-penthouse","retro-lounge"]',
    active_frame TEXT DEFAULT 'none',
    active_emote TEXT,
    default_room_theme TEXT DEFAULT 'cyber-lounge',
    stars_balance INTEGER DEFAULT 0,
    s3_quota_used_mb REAL DEFAULT 0,
    s3_quota_limit_mb REAL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS devices (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    browser_label TEXT NOT NULL,
    last_seen_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (id, user_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_users_license_key ON users(license_key);
  CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
`);

/**
 * Generates license key in format BRDG-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No 0/O, 1/I
  const segment = () => {
    let s = '';
    const bytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      s += chars[bytes[i] % chars.length];
    }
    return s;
  };
  return `BRDG-${segment()}-${segment()}-${segment()}`;
}

/**
 * Creates a new user in the database
 */
export function createUser(initial?: {
  key?: string;
  displayName?: string;
  avatarUrl?: string;
  defaultRoomTheme?: string;
}): DbUser {
  let key: string;
  if (initial?.key && /^BRDG-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(initial.key.trim())) {
    const requested = initial.key.trim().toUpperCase();
    const existing = db.prepare('SELECT id FROM users WHERE license_key = ?').get(requested);
    if (!existing) {
      key = requested;
    } else {
      key = generateLicenseKey();
    }
  } else {
    key = generateLicenseKey();
    let attempts = 0;
    while (attempts < 5) {
      const existing = db
        .prepare('SELECT id FROM users WHERE license_key = ?')
        .get(key);
      if (!existing) break;
      key = generateLicenseKey();
      attempts++;
    }
  }

  const id = `usr_${crypto.randomUUID()}`;
  const now = Date.now();
  const displayName = initial?.displayName || 'Пользователь';
  const avatarUrl = initial?.avatarUrl || '/mascots/dino_avatar.jpg';
  const defaultRoomTheme = initial?.defaultRoomTheme || 'cyber-lounge';

  const stmt = db.prepare(`
    INSERT INTO users (
      id, license_key, display_name, avatar_url, tier,
      unlocked_frames, unlocked_themes, active_frame,
      default_room_theme, stars_balance, s3_quota_used_mb, s3_quota_limit_mb,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, 'free',
      '["none"]', '["cyber-lounge","cozy-loft","skyline-penthouse","retro-lounge"]', 'none',
      ?, 0, 0, 0,
      ?, ?
    )
  `);

  stmt.run(id, key, displayName, avatarUrl, defaultRoomTheme, now, now);

  return getUserById(id)!;
}

/**
 * Finds user by license key (case-insensitive)
 */
export function getUserByLicenseKey(key: string): DbUser | null {
  const clean = key.trim().toUpperCase();
  const row = db
    .prepare('SELECT * FROM users WHERE license_key = ?')
    .get(clean);
  return (row as unknown as DbUser) || null;
}

/**
 * Finds user by ID
 */
export function getUserById(id: string): DbUser | null {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return (row as unknown as DbUser) || null;
}

/**
 * Updates user profile fields
 */
export function updateUserProfile(
  userId: string,
  updates: {
    displayName?: string;
    avatarUrl?: string;
    activeFrame?: AvatarFrameId;
    activeEmote?: string | null;
    defaultRoomTheme?: string;
  }
): DbUser | null {
  const user = getUserById(userId);
  if (!user) return null;

  const now = Date.now();
  const newName = updates.displayName !== undefined ? updates.displayName : user.display_name;
  const newAvatar = (updates.avatarUrl !== undefined ? updates.avatarUrl : user.avatar_url) ?? null;
  const newFrame = updates.activeFrame !== undefined ? updates.activeFrame : user.active_frame;
  const newEmote = (updates.activeEmote !== undefined ? updates.activeEmote : user.active_emote) ?? null;
  const newTheme = updates.defaultRoomTheme !== undefined ? updates.defaultRoomTheme : user.default_room_theme;

  db.prepare(`
    UPDATE users SET
      display_name = ?,
      avatar_url = ?,
      active_frame = ?,
      active_emote = ?,
      default_room_theme = ?,
      updated_at = ?
    WHERE id = ?
  `).run(newName, newAvatar, newFrame, newEmote, newTheme, now, userId);

  return getUserById(userId);
}

/**
 * Registers or updates a device for a user
 */
export function registerOrUpdateDevice(
  userId: string,
  device: {
    id: string;
    name?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browserLabel?: string;
  }
): DbDevice {
  const now = Date.now();
  const existing = db
    .prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?')
    .get(device.id, userId) as unknown as DbDevice | undefined;

  if (existing) {
    const updatedName = device.name || existing.name;
    const updatedType = device.deviceType || existing.device_type;
    const updatedLabel = device.browserLabel || existing.browser_label;

    db.prepare(`
      UPDATE devices SET
        name = ?,
        device_type = ?,
        browser_label = ?,
        last_seen_at = ?
      WHERE id = ? AND user_id = ?
    `).run(updatedName, updatedType, updatedLabel, now, device.id, userId);
  } else {
    db.prepare(`
      INSERT INTO devices (id, user_id, name, device_type, browser_label, last_seen_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      device.id,
      userId,
      device.name || 'Устройство',
      device.deviceType || 'unknown',
      device.browserLabel || 'Браузер',
      now,
      now
    );
  }

  const row = db
    .prepare('SELECT * FROM devices WHERE id = ? AND user_id = ?')
    .get(device.id, userId);
  return row as unknown as DbDevice;
}

/**
 * Gets all registered devices for a user
 */
export function getDevicesByUserId(userId: string): DbDevice[] {
  const rows = db
    .prepare('SELECT * FROM devices WHERE user_id = ? ORDER BY last_seen_at DESC')
    .all(userId);
  return (rows as unknown as DbDevice[]) || [];
}

/**
 * Removes a device
 */
export function deleteDevice(userId: string, deviceId: string): boolean {
  const res = db
    .prepare('DELETE FROM devices WHERE id = ? AND user_id = ?')
    .run(deviceId, userId);
  return Number(res.changes) > 0;
}

/**
 * Formats DbUser & devices to UserProfileDto for frontend
 */
export function toUserProfileDto(
  user: DbUser,
  currentDeviceId?: string,
  onlineDeviceIds?: Set<string>
): UserProfileDto {
  const rawDevices = getDevicesByUserId(user.id);
  const devices: StickyDeviceDto[] = rawDevices.map((d) => ({
    id: d.id,
    name: d.name,
    deviceType: d.device_type,
    browserLabel: d.browser_label,
    isCurrent: Boolean(currentDeviceId && d.id === currentDeviceId),
    isOnline: Boolean(onlineDeviceIds && onlineDeviceIds.has(d.id)),
    lastSeenAt: d.last_seen_at,
  }));

  let unlockedFrames: AvatarFrameId[] = ['none'];
  try {
    unlockedFrames = JSON.parse(user.unlocked_frames);
  } catch {}

  let unlockedThemes: string[] = ['cyber-lounge'];
  try {
    unlockedThemes = JSON.parse(user.unlocked_themes);
  } catch {}

  return {
    id: user.id,
    displayName: user.display_name,
    avatarUrl: user.avatar_url || undefined,
    tier: user.tier,
    proUntil: user.pro_until || undefined,
    providers: {
      twitch: user.twitch_handle
        ? { handle: user.twitch_handle }
        : undefined,
      telegram: user.telegram_id
        ? { id: Number(user.telegram_id), username: user.telegram_username || undefined }
        : undefined,
      hasLicenseKey: true,
    },
    licenseKeyPreview: user.license_key,
    unlockedFrames,
    unlockedThemes,
    activeFrame: user.active_frame,
    activeEmote: user.active_emote || null,
    defaultRoomTheme: user.default_room_theme,
    s3QuotaUsedMb: user.s3_quota_used_mb,
    s3QuotaLimitMb: user.s3_quota_limit_mb,
    devices,
  };
}
