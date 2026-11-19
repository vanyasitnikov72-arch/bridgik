import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import { deleteFromS3 } from './s3.js';
import {
  DbUser,
  DbDevice,
  DbDrop,
  DropDto,
  UserProfileDto,
  StickyDeviceDto,
  AvatarFrameId,
  UserTier,
  DbPayment,
} from './types.js';

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DROPS_DIR = process.env.DROPS_DIR || path.join(DATA_DIR, 'drops');
if (!fs.existsSync(DROPS_DIR)) {
  fs.mkdirSync(DROPS_DIR, { recursive: true });
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

  CREATE TABLE IF NOT EXISTS drops (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    target_device_id TEXT,
    room_id TEXT,
    pin TEXT,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 100,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_drops_target ON drops(user_id, target_device_id);
  CREATE INDEX IF NOT EXISTS idx_drops_expires ON drops(expires_at);

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    license_key TEXT NOT NULL,
    amount INTEGER NOT NULL,
    period TEXT NOT NULL,
    days INTEGER NOT NULL,
    status TEXT NOT NULL,
    yookassa_payment_id TEXT UNIQUE,
    payment_url TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
  CREATE INDEX IF NOT EXISTS idx_payments_yoo ON payments(yookassa_payment_id);
`);

try {
  db.exec(`ALTER TABLE users ADD COLUMN yandex_login TEXT`);
} catch {}
try {
  db.exec(`ALTER TABLE users ADD COLUMN yandex_id TEXT`);
} catch {}
try {
  db.exec(`ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`);
} catch {}

// Automatically promote owner account to Admin & Pro
try {
  db.prepare(`UPDATE users SET is_admin = 1, tier = 'pro' WHERE yandex_login = 'vanessosit'`).run();
} catch {}

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
 * Finds user by Yandex ID or Login
 */
export function getUserByYandex(yandexId?: string, yandexLogin?: string): DbUser | null {
  if (yandexId) {
    const row = db.prepare('SELECT * FROM users WHERE yandex_id = ?').get(String(yandexId));
    if (row) return row as unknown as DbUser;
  }
  if (yandexLogin) {
    const row = db.prepare('SELECT * FROM users WHERE yandex_login = ?').get(yandexLogin.toLowerCase());
    if (row) return row as unknown as DbUser;
  }
  return null;
}

/**
 * Finds user by Telegram ID
 */
export function getUserByTelegramId(telegramId: string | number): DbUser | null {
  const row = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(telegramId));
  return (row as unknown as DbUser) || null;
}

/**
 * Upserts user logging in with Yandex ID
 */
export function upsertYandexUser(profile: {
  id: string;
  login: string;
  displayName: string;
  avatarUrl?: string;
}): DbUser {
  const user = getUserByYandex(profile.id, profile.login);
  const now = Date.now();
  if (user) {
    db.prepare(`
      UPDATE users 
      SET yandex_id = ?, yandex_login = ?, 
          display_name = CASE 
            WHEN display_name IS NOT NULL AND display_name != '' AND display_name != 'Пользователь' AND display_name != 'Пользователь Яндекса'
            THEN display_name 
            ELSE ? 
          END,
          avatar_url = CASE 
            WHEN avatar_url IS NOT NULL AND avatar_url != '' 
            THEN avatar_url 
            ELSE ? 
          END,
          updated_at = ?
      WHERE id = ?
    `).run(
      String(profile.id),
      profile.login.toLowerCase(),
      profile.displayName || profile.login,
      profile.avatarUrl || '/mascots/dino_avatar.jpg',
      now,
      user.id
    );
    return getUserById(user.id)!;
  }

  // Create new user
  const id = `usr_${crypto.randomUUID()}`;
  const key = generateLicenseKey();
  const displayName = profile.displayName || profile.login || 'Пользователь Яндекса';
  const avatarUrl = profile.avatarUrl || '/mascots/dino_avatar.jpg';

  db.prepare(`
    INSERT INTO users (
      id, license_key, display_name, avatar_url, tier,
      yandex_id, yandex_login,
      unlocked_frames, unlocked_themes, active_frame,
      default_room_theme, stars_balance, s3_quota_used_mb, s3_quota_limit_mb,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, 'free',
      ?, ?,
      '["none"]', '["cyber-lounge","cozy-loft","skyline-penthouse","retro-lounge"]', 'none',
      'cyber-lounge', 0, 0, 0,
      ?, ?
    )
  `).run(id, key, displayName, avatarUrl, String(profile.id), profile.login.toLowerCase(), now, now);

  return getUserById(id)!;
}

/**
 * Upserts user logging in with Telegram
 */
export function upsertTelegramUser(profile: {
  id: string | number;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}): DbUser {
  const tgIdStr = String(profile.id);
  const user = getUserByTelegramId(tgIdStr);
  const now = Date.now();
  const rawName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username || `User_${tgIdStr.slice(-4)}`;

  if (user) {
    db.prepare(`
      UPDATE users 
      SET telegram_id = ?, telegram_username = ?,
          display_name = CASE 
            WHEN display_name IS NOT NULL AND display_name != '' AND display_name != 'Пользователь' AND display_name != 'Пользователь Telegram'
            THEN display_name 
            ELSE ? 
          END,
          avatar_url = CASE 
            WHEN avatar_url IS NOT NULL AND avatar_url != '' 
            THEN avatar_url 
            ELSE ? 
          END,
          updated_at = ?
      WHERE id = ?
    `).run(
      tgIdStr,
      profile.username || user.telegram_username || null,
      rawName,
      profile.photoUrl || '/mascots/dino_avatar.jpg',
      now,
      user.id
    );
    return getUserById(user.id)!;
  }

  // Create new user
  const id = `usr_${crypto.randomUUID()}`;
  const key = generateLicenseKey();
  const avatarUrl = profile.photoUrl || '/mascots/dino_avatar.jpg';

  db.prepare(`
    INSERT INTO users (
      id, license_key, display_name, avatar_url, tier,
      telegram_id, telegram_username,
      unlocked_frames, unlocked_themes, active_frame,
      default_room_theme, stars_balance, s3_quota_used_mb, s3_quota_limit_mb,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, 'free',
      ?, ?,
      '["none"]', '["cyber-lounge","cozy-loft","skyline-penthouse","retro-lounge"]', 'none',
      'cyber-lounge', 0, 0, 0,
      ?, ?
    )
  `).run(id, key, rawName, avatarUrl, tgIdStr, profile.username || null, now, now);

  return getUserById(id)!;
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
      yandex: user.yandex_login ? { handle: user.yandex_login } : undefined,
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
    isAdmin: Boolean(user.is_admin === 1 || user.yandex_login === 'vanessosit'),
  };
}

/**
 * Creates a Drop record in the database
 */
export function createDropRecord(drop: {
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
  max_downloads?: number;
  expires_at: number;
}): DbDrop {
  const now = Date.now();
  const maxDownloads = drop.max_downloads || 100;

  db.prepare(`
    INSERT INTO drops (
      id, user_id, target_device_id, room_id, pin, file_name,
      file_size, mime_type, file_path, sender_name,
      download_count, max_downloads, expires_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
  `).run(
    drop.id,
    drop.user_id || null,
    drop.target_device_id || null,
    drop.room_id || null,
    drop.pin || null,
    drop.file_name,
    drop.file_size,
    drop.mime_type,
    drop.file_path,
    drop.sender_name,
    maxDownloads,
    drop.expires_at,
    now
  );

  return {
    id: drop.id,
    user_id: drop.user_id,
    target_device_id: drop.target_device_id,
    room_id: drop.room_id,
    pin: drop.pin,
    file_name: drop.file_name,
    file_size: drop.file_size,
    mime_type: drop.mime_type,
    file_path: drop.file_path,
    sender_name: drop.sender_name,
    download_count: 0,
    max_downloads: maxDownloads,
    expires_at: drop.expires_at,
    created_at: now,
  };
}

/**
 * Fetches a Drop record by ID
 */
export function getDropRecord(id: string): DbDrop | null {
  const row = db.prepare('SELECT * FROM drops WHERE id = ?').get(id);
  if (!row) return null;
  return row as unknown as DbDrop;
}

/**
 * Gets pending non-expired drops for a user device
 */
export function getPendingDropsForDevice(userId: string, deviceId: string): DbDrop[] {
  const now = Date.now();
  const rows = db.prepare(`
    SELECT * FROM drops 
    WHERE user_id = ? AND target_device_id = ? AND expires_at > ?
    ORDER BY created_at DESC
  `).all(userId, deviceId, now);
  return (rows as unknown as DbDrop[]) || [];
}

/**
 * Increments download count
 */
export function incrementDropDownload(id: string): void {
  db.prepare('UPDATE drops SET download_count = download_count + 1 WHERE id = ?').run(id);
}

/**
 * Deletes a Drop and unlinks its file
 */
export function deleteDropRecord(id: string): boolean {
  const row = db.prepare('SELECT file_path FROM drops WHERE id = ?').get(id) as
    | { file_path: string }
    | undefined;

  if (row?.file_path) {
    if (row.file_path.startsWith('s3://')) {
      const s3Key = row.file_path.replace(/^s3:\/\/[^/]+\//, '');
      deleteFromS3(s3Key).catch(() => {});
    } else {
      try {
        if (fs.existsSync(row.file_path)) {
          fs.unlinkSync(row.file_path);
        }
      } catch (e) {
        console.warn(`[Drop] Failed to unlink file ${row.file_path}:`, e);
      }
    }
  }

  const res = db.prepare('DELETE FROM drops WHERE id = ?').run(id);
  return Number(res.changes) > 0;
}

/**
 * Cleans up expired drops and deletes files
 */
export function cleanExpiredDrops(): number {
  const now = Date.now();
  const rows = db.prepare('SELECT id, file_path FROM drops WHERE expires_at < ?').all(now) as
    | { id: string; file_path: string }[]
    | undefined;

  if (!rows || rows.length === 0) return 0;

  for (const row of rows) {
    if (row.file_path.startsWith('s3://')) {
      const s3Key = row.file_path.replace(/^s3:\/\/[^/]+\//, '');
      deleteFromS3(s3Key).catch(() => {});
    } else {
      try {
        if (fs.existsSync(row.file_path)) {
          fs.unlinkSync(row.file_path);
        }
      } catch (e) {
        console.warn(`[Drop] Failed to delete expired file ${row.file_path}:`, e);
      }
    }
  }

  const res = db.prepare('DELETE FROM drops WHERE expires_at < ?').run(now);
  const deletedCount = Number(res.changes);
  if (deletedCount > 0) {
    console.log(`[Drop] Cleaned up ${deletedCount} expired drops.`);
  }
  return deletedCount;
}

/**
 * Creates a new payment record in the database
 */
export function createPaymentRecord(payment: {
  id: string;
  userId: string;
  licenseKey: string;
  amount: number;
  period: string;
  days: number;
  status: string;
  yookassaPaymentId?: string;
  paymentUrl?: string;
}): DbPayment {
  const now = Date.now();
  db.prepare(`
    INSERT INTO payments (
      id, user_id, license_key, amount, period, days, status,
      yookassa_payment_id, payment_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payment.id,
    payment.userId,
    payment.licenseKey,
    payment.amount,
    payment.period,
    payment.days,
    payment.status,
    payment.yookassaPaymentId || null,
    payment.paymentUrl || null,
    now,
    now
  );
  return getPaymentById(payment.id)!;
}

export function getPaymentById(id: string): DbPayment | null {
  const row = db.prepare('SELECT * FROM payments WHERE id = ?').get(id) as unknown as DbPayment | undefined;
  return row || null;
}

export function getPaymentByYookassaId(yooId: string): DbPayment | null {
  const row = db.prepare('SELECT * FROM payments WHERE yookassa_payment_id = ?').get(yooId) as unknown as DbPayment | undefined;
  return row || null;
}

export function updatePaymentStatus(id: string, status: string, yooId?: string): void {
  const now = Date.now();
  if (yooId) {
    db.prepare('UPDATE payments SET status = ?, yookassa_payment_id = ?, updated_at = ? WHERE id = ?')
      .run(status, yooId, now, id);
  } else {
    db.prepare('UPDATE payments SET status = ?, updated_at = ? WHERE id = ?')
      .run(status, now, id);
  }
}

/**
 * Upgrades user to Pro tier and extends expiration
 */
export function upgradeUserToPro(userId: string, durationDays: number): DbUser | null {
  const user = getUserById(userId);
  if (!user) return null;
  const now = Date.now();
  const currentProUntil = user.pro_until ? new Date(user.pro_until).getTime() : 0;
  const baseTime = currentProUntil > now ? currentProUntil : now;
  const newProUntil = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

  // Unlock VIP frames for Pro
  const frames: AvatarFrameId[] = ['none', 'gold', 'rgb', 'plasma'];
  const activeFrame = user.active_frame && user.active_frame !== 'none' ? user.active_frame : 'gold';

  db.prepare(`
    UPDATE users 
    SET tier = 'pro', pro_until = ?, unlocked_frames = ?, active_frame = ?, updated_at = ?
    WHERE id = ?
  `).run(newProUntil, JSON.stringify(frames), activeFrame, now, userId);

  return getUserById(userId);
}

/**
 * Formats DbDrop into client-facing DropDto
 */
export function toDropDto(drop: DbDrop): DropDto {
  return {
    id: drop.id,
    fileName: drop.file_name,
    fileSize: drop.file_size,
    mimeType: drop.mime_type,
    senderName: drop.sender_name,
    downloadUrl: `/api/drop/${drop.id}/download`,
    expiresAt: drop.expires_at,
    targetDeviceId: drop.target_device_id,
  };
}

/**
 * Unlinks Yandex or Telegram auth provider from a user account
 */
export function unlinkProvider(userId: string, provider: 'yandex' | 'telegram'): boolean {
  const now = Date.now();
  if (provider === 'yandex') {
    db.prepare(`
      UPDATE users 
      SET yandex_id = NULL, yandex_login = NULL, updated_at = ? 
      WHERE id = ?
    `).run(now, userId);
  } else if (provider === 'telegram') {
    db.prepare(`
      UPDATE users 
      SET telegram_id = NULL, telegram_username = NULL, updated_at = ? 
      WHERE id = ?
    `).run(now, userId);
  }
  return true;
}

/**
 * Gets all users for Admin Panel
 */
export function getAllUsersAdmin(): Array<DbUser & { device_count: number }> {
  const users = db.prepare(`
    SELECT u.*, 
      (SELECT COUNT(*) FROM devices d WHERE d.user_id = u.id) as device_count
    FROM users u 
    ORDER BY u.created_at DESC
  `).all();
  return users as any;
}

/**
 * Sets user admin status
 */
export function setUserAdmin(userId: string, isAdmin: boolean): boolean {
  const res = db.prepare(`UPDATE users SET is_admin = ?, updated_at = ? WHERE id = ?`)
    .run(isAdmin ? 1 : 0, Date.now(), userId);
  return Number(res.changes) > 0;
}

/**
 * Sets user tier (free or pro) with optional expiration date
 */
export function setUserTier(userId: string, tier: UserTier, proUntil?: string | null): boolean {
  const now = Date.now();
  let unlockedFrames = '["none"]';
  let activeFrame = 'none';

  if (tier === 'pro') {
    unlockedFrames = '["none","gold","rgb","plasma"]';
    activeFrame = 'gold';
  }

  const res = db.prepare(`
    UPDATE users 
    SET tier = ?, pro_until = ?, unlocked_frames = ?, active_frame = ?, updated_at = ? 
    WHERE id = ?
  `).run(tier, proUntil || null, unlockedFrames, activeFrame, now, userId);

  return Number(res.changes) > 0;
}

/**
 * Gets all drops for Admin Panel
 */
export function getAllDropsAdmin(): DbDrop[] {
  const drops = db.prepare(`SELECT * FROM drops ORDER BY created_at DESC`).all();
  return drops as unknown as DbDrop[];
}

/**
 * Gets overview counts from database
 */
export function getDbStats() {
  const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
  const proUsers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE tier = 'pro'").get() as any)?.count || 0;
  const adminUsers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE is_admin = 1").get() as any)?.count || 0;
  const totalDevices = (db.prepare('SELECT COUNT(*) as count FROM devices').get() as any)?.count || 0;
  const totalDrops = (db.prepare('SELECT COUNT(*) as count FROM drops').get() as any)?.count || 0;
  const totalPayments = (db.prepare('SELECT COUNT(*) as count FROM payments').get() as any)?.count || 0;
  return { totalUsers, proUsers, adminUsers, totalDevices, totalDrops, totalPayments };
}


