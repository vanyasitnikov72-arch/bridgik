import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { RoomManager } from './roomManager.js';
import { PeerInfo } from './types.js';
import {
  createUser,
  getUserByLicenseKey,
  getUserById,
  updateUserProfile,
  registerOrUpdateDevice,
  deleteDevice,
  toUserProfileDto,
  DROPS_DIR,
  createDropRecord,
  getDropRecord,
  getPendingDropsForDevice,
  incrementDropDownload,
  deleteDropRecord,
  cleanExpiredDrops,
  toDropDto,
  createPaymentRecord,
  getPaymentById,
  getPaymentByYookassaId,
  updatePaymentStatus,
  upgradeUserToPro,
  upsertYandexUser,
  upsertTelegramUser,
  getUserByYandex,
  getUserByTelegramId,
} from './db.js';
import { stickyManager } from './stickyBridge.js';
import { createYooKassaPayment, getYooKassaPayment } from './yookassa.js';
import {
  getYandexClientCredentials,
  exchangeYandexCode,
  getTelegramBotCredentials,
  verifyTelegramAuthData,
  renderOAuthConsentScreen,
  renderAuthSuccessCallback,
  pendingBotSessions,
} from './oauth.js';

export function getLocalLanIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    if (
      name.toLowerCase().includes('vethernet') ||
      name.toLowerCase().includes('virtual') ||
      name.toLowerCase().includes('loopback')
    ) {
      continue;
    }
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.')) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e7, // 10MB safe buffer for Fallback Relay
});

// Periodic Drop & Go expired file cleanup every 15 minutes
setInterval(() => {
  try {
    cleanExpiredDrops();
  } catch (err) {
    console.error('[Drop Cleanup Error]', err);
  }
}, 15 * 60 * 1000);

const roomManager = new RoomManager();

interface LobbyPeer {
  socketId: string;
  deviceId?: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  os?: string;
  osName?: string;
  browser?: string;
  deviceModel?: string;
  isCustomName?: boolean;
  licenseKey?: string;
  subnet: string;
  ip: string;
  isAdmin?: boolean;
  statusEmote?: string;
}
const lobbyPeers: Map<string, LobbyPeer> = new Map();

interface FailedPinAttempt {
  count: number;
  lastAttempt: number;
  blockedUntil?: number;
}
const failedPinAttempts: Map<string, FailedPinAttempt> = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, info] of failedPinAttempts.entries()) {
    if (now - info.lastAttempt > 10 * 60 * 1000 && (!info.blockedUntil || info.blockedUntil < now)) {
      failedPinAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getClientIp(socket: any): string {
  const realIp = socket.handshake.headers['x-real-ip'];
  let ip = '';

  if (typeof realIp === 'string' && realIp.trim()) {
    ip = realIp.trim();
  } else {
    const forwarded = socket.handshake.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      const ips = forwarded.split(',').map((s) => s.trim()).filter(Boolean);
      ip = ips[ips.length - 1] || '';
    } else {
      ip = socket.handshake.address || '127.0.0.1';
    }
  }

  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }
  return ip;
}

const ADMIN_IPS = (process.env.ADMIN_IPS || '127.0.0.1,::1,localhost')
  .split(',')
  .map((ip) => ip.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

function isSocketAdmin(socket: any, providedKey?: string): boolean {
  if (ADMIN_SECRET_KEY && providedKey && providedKey === ADMIN_SECRET_KEY) {
    return true;
  }
  if (process.env.NODE_ENV !== 'production') {
    const ip = getClientIp(socket).toLowerCase();
    if (ADMIN_IPS.includes(ip) || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      return true;
    }
  }
  return false;
}

function getIpv6Prefix64(ip: string): string | null {
  if (!ip.includes(':')) return null;
  const clean = ip.split('%')[0].toLowerCase();
  const halves = clean.split('::');
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves[1] ? halves[1].split(':') : [];
  const missing = 8 - (left.length + right.length);
  if (missing < 0) return null;
  const full = [...left, ...Array(missing).fill('0'), ...right].map((g) => g.padStart(4, '0'));
  return `pub6-${full.slice(0, 4).join(':')}`;
}

function getClientNetworkSubnet(socket: any): string {
  let ip = getClientIp(socket);
  const lanIp = getLocalLanIp();

  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    if (process.env.NODE_ENV === 'production') {
      return `isolated-${socket.id}`;
    }
    ip = lanIp;
  }

  const ipv6Prefix = getIpv6Prefix64(ip);
  if (ipv6Prefix) {
    return ipv6Prefix;
  }

  const parts = ip.split('.').map(Number);
  if (parts.length === 4 && !parts.some(isNaN)) {
    if (parts[0] === 192 && parts[1] === 168) {
      return `lan-192.168.${parts[2]}`;
    }
    if (parts[0] === 10) {
      return `lan-10.${parts[1]}.${parts[2]}`;
    }
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
      return `lan-172.${parts[1]}.${parts[2]}`;
    }
  }

  if (lanIp && lanIp !== '127.0.0.1') {
    const lanParts = lanIp.split('.').map(Number);
    if (lanParts.length === 4 && parts.length === 4) {
      if (parts[0] === lanParts[0] && parts[1] === lanParts[1]) {
        return `lan-${lanParts[0]}.${lanParts[1]}.${lanParts[2]}`;
      }
    }
  }

  return `pub-${ip}`;
}

function broadcastNearbyPeers(subnet: string) {
  const peersInSubnet = Array.from(lobbyPeers.values()).filter((p) => p.subnet === subnet);
  peersInSubnet.forEach((peer) => {
    const others = peersInSubnet
      .filter((p) => p.socketId !== peer.socketId && (!p.deviceId || !peer.deviceId || p.deviceId !== peer.deviceId))
      .map((p) => ({
        socketId: p.socketId,
        deviceId: p.deviceId,
        name: p.name,
        deviceType: p.deviceType,
        os: p.os,
        osName: p.osName,
        browser: p.browser,
        deviceModel: p.deviceModel,
        isCustomName: p.isCustomName,
        isSameAccount: Boolean(peer.licenseKey && p.licenseKey && peer.licenseKey === p.licenseKey),
        isAdmin: p.isAdmin,
        statusEmote: p.statusEmote,
      }));
    io.to(peer.socketId).emit('nearby-peers', others);
  });
}

function removeFromLobby(socketId: string) {
  const existing = lobbyPeers.get(socketId);
  if (existing) {
    lobbyPeers.delete(socketId);
    broadcastNearbyPeers(existing.subnet);
  }
}

function sanitizePeerName(raw: unknown, fallback = 'Гость'): string {
  if (typeof raw !== 'string') return fallback;
  const trimmed = raw.trim().slice(0, 32);
  return trimmed || fallback;
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const emoteCache: Map<string, { buffer: Buffer; contentType: string }> = new Map();

app.get('/api/emotes/:id.webp', async (req, res) => {
  const emoteId = req.params.id;
  if (!emoteId || !/^[\w-]+$/.test(emoteId)) {
    return res.status(400).send('Invalid emote id');
  }

  const cached = emoteCache.get(emoteId);
  if (cached) {
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(cached.buffer);
  }

  try {
    const upstreamUrl = `https://cdn.7tv.app/emote/${emoteId}/2x.webp`;
    const resp = await fetch(upstreamUrl);
    if (!resp.ok) {
      return res.status(resp.status).send('Emote not found');
    }
    const contentType = resp.headers.get('content-type') || 'image/webp';
    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (emoteCache.size > 500) {
      const firstKey = emoteCache.keys().next().value;
      if (firstKey) emoteCache.delete(firstKey);
    }
    emoteCache.set(emoteId, { buffer, contentType });
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(buffer);
  } catch (err) {
    console.error('Failed to proxy emote:', emoteId, err);
    return res.status(502).send('Error fetching emote');
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    lanIp: getLocalLanIp(),
    ...roomManager.getStats(),
  });
});

app.get('/api/rooms/:idOrPin', (req, res) => {
  const room = roomManager.getRoom(req.params.idOrPin);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  return res.json({
    id: room.id,
    pin: room.pin,
    createdAt: room.createdAt,
    peerCount: room.peers.size,
  });
});

// ==========================================
// USER AUTH & PROFILE API
// ==========================================

function extractLicenseKey(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  if (typeof req.query.key === 'string' && req.query.key.trim()) {
    return req.query.key.trim();
  }
  return null;
}

// 1. Create a new user with an anonymous license key
app.post('/api/auth/key/create', (req, res) => {
  try {
    const { key, displayName, avatarUrl, defaultRoomTheme, deviceId, deviceType, deviceName, browserLabel } =
      req.body || {};
    const user = createUser({ key, displayName, avatarUrl, defaultRoomTheme });
    if (deviceId) {
      registerOrUpdateDevice(user.id, {
        id: deviceId,
        name: deviceName,
        deviceType,
        browserLabel,
      });
    }
    const onlineSet = stickyManager.getOnlineDeviceIds(user.id);
    const profile = toUserProfileDto(user, deviceId, onlineSet);
    return res.status(201).json({ success: true, key: user.license_key, user: profile });
  } catch (err: any) {
    console.error('Error creating user key:', err);
    return res.status(500).json({ error: 'Не удалось создать ключ' });
  }
});

// 2. Login by license key
app.post('/api/auth/key/login', (req, res) => {
  try {
    const { key, deviceId, deviceType, deviceName, browserLabel } = req.body || {};
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'Укажите ключ' });
    }
    const user = getUserByLicenseKey(key);
    if (!user) {
      return res.status(404).json({ error: 'Ключ не найден. Проверьте формат (BRDG-XXXX-XXXX-XXXX)' });
    }
    if (deviceId) {
      registerOrUpdateDevice(user.id, {
        id: deviceId,
        name: deviceName,
        deviceType,
        browserLabel,
      });
    }
    const onlineSet = stickyManager.getOnlineDeviceIds(user.id);
    const profile = toUserProfileDto(user, deviceId, onlineSet);
    return res.json({ success: true, user: profile });
  } catch (err: any) {
    console.error('Error logging in with key:', err);
    return res.status(500).json({ error: 'Ошибка входа по ключу' });
  }
});

// 3. Get current profile + devices
app.get('/api/user/profile', (req, res) => {
  const key = extractLicenseKey(req);
  if (!key) {
    return res.status(401).json({ error: 'Не авторизован: отсутствует ключ' });
  }
  const user = getUserByLicenseKey(key);
  if (!user) {
    return res.status(401).json({ error: 'Неверный ключ' });
  }
  const currentDeviceId = typeof req.query.deviceId === 'string' ? req.query.deviceId : undefined;
  const onlineSet = stickyManager.getOnlineDeviceIds(user.id);
  const profile = toUserProfileDto(user, currentDeviceId, onlineSet);
  return res.json({ success: true, user: profile });
});

// 4. Update profile settings
app.patch('/api/user/profile', (req, res) => {
  const key = extractLicenseKey(req);
  if (!key) {
    return res.status(401).json({ error: 'Не авторизован: отсутствует ключ' });
  }
  const user = getUserByLicenseKey(key);
  if (!user) {
    return res.status(401).json({ error: 'Неверный ключ' });
  }
  const { displayName, avatarUrl, activeFrame, activeEmote, defaultRoomTheme } = req.body || {};
  const updated = updateUserProfile(user.id, {
    displayName,
    avatarUrl,
    activeFrame,
    activeEmote,
    defaultRoomTheme,
  });
  if (!updated) {
    return res.status(500).json({ error: 'Не удалось обновить профиль' });
  }
  const currentDeviceId = typeof req.query.deviceId === 'string' ? req.query.deviceId : undefined;
  const onlineSet = stickyManager.getOnlineDeviceIds(user.id);
  const profile = toUserProfileDto(updated, currentDeviceId, onlineSet);

  // Broadcast real-time profile update to all devices of this user
  io.to(`user:${user.id}`).emit('sticky-profile-updated', profile);

  return res.json({ success: true, user: profile });
});

// 5. Delete / unlink a device
app.delete('/api/user/devices/:deviceId', (req, res) => {
  const key = extractLicenseKey(req);
  if (!key) {
    return res.status(401).json({ error: 'Не авторизован: отсутствует ключ' });
  }
  const user = getUserByLicenseKey(key);
  if (!user) {
    return res.status(401).json({ error: 'Неверный ключ' });
  }
  const deviceId = req.params.deviceId;
  const deleted = deleteDevice(user.id, deviceId);
  return res.json({ success: deleted });
});

// --- Yandex ID & Telegram OAuth Endpoints ---

// 1. Initiate Yandex login (official redirect to oauth.yandex.ru)
app.get('/api/auth/yandex', (req, res) => {
  const host = req.get('host') || 'bridgik.ru';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const redirectUri = `${protocol}://${host}/api/auth/yandex/callback`;
  const { clientId } = getYandexClientCredentials();

  if (!clientId) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Настройка Яндекс ID</title><meta charset="utf-8"></head>
      <body style="background:#171717;color:#fff;font-family:sans-serif;padding:40px;max-width:600px;margin:auto;text-align:center;">
        <h2 style="color:#FC3F1D;margin-bottom:12px;">Не указан YANDEX_CLIENT_ID</h2>
        <p style="color:#aaa;margin-bottom:20px;">Для перехода на официальную страницу <code>oauth.yandex.ru/authorize</code> укажите параметры в файле <code>.env</code> на сервере:</p>
        <pre style="background:#222;padding:15px;border-radius:8px;text-align:left;color:#9ac43e;">YANDEX_CLIENT_ID=ваш_client_id\nYANDEX_CLIENT_SECRET=ваш_secret</pre>
        <p style="margin-top:20px;"><a href="/?tab=profile" style="color:#9ac43e;text-decoration:none;">← Вернуться на Bridgik</a></p>
      </body>
      </html>
    `);
  }

  const state = (req.query.state as string) || crypto.randomUUID();
  const yandexUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&force_confirm=yes`;
  return res.redirect(yandexUrl);
});

// 2. Real Yandex OAuth Callback
app.get('/api/auth/yandex/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    const error = req.query.error as string;
    if (error) {
      return res.redirect(`/?tab=profile&auth=error&message=${encodeURIComponent(error)}`);
    }
    if (!code) {
      return res.status(400).send('Код авторизации отсутствует');
    }

    const host = req.get('host') || 'bridgik.ru';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const redirectUri = `${protocol}://${host}/api/auth/yandex/callback`;

    const profile = await exchangeYandexCode(code, redirectUri);
    const user = upsertYandexUser(profile);

    return res.redirect(`/?tab=profile&auth=success&key=${encodeURIComponent(user.license_key)}`);
  } catch (err: any) {
    console.error('[Yandex Auth Error]', err);
    return res.redirect(`/?tab=profile&auth=error&message=${encodeURIComponent(err.message)}`);
  }
});

// 3. Initiate Telegram login (official redirect to oauth.telegram.org)
app.get('/api/auth/telegram', (req, res) => {
  const host = req.get('host') || 'bridgik.ru';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const origin = `${protocol}://${host}`;
  const callbackUrl = `${origin}/api/auth/telegram/callback`;

  const { botId } = getTelegramBotCredentials();

  if (!botId) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Настройка Telegram OAuth</title><meta charset="utf-8"></head>
      <body style="background:#171717;color:#fff;font-family:sans-serif;padding:40px;max-width:600px;margin:auto;text-align:center;">
        <h2 style="color:#229ED9;margin-bottom:12px;">Не указан TELEGRAM_BOT_TOKEN</h2>
        <p style="color:#aaa;margin-bottom:20px;">Для перехода на официальную страницу <code>oauth.telegram.org</code> укажите токен бота в файле <code>.env</code> на сервере:</p>
        <pre style="background:#222;padding:15px;border-radius:8px;text-align:left;color:#9ac43e;">TELEGRAM_BOT_TOKEN=123456789:ABC...\nTELEGRAM_BOT_USERNAME=bridgik_bot</pre>
        <p style="margin-top:20px;"><a href="/?tab=profile" style="color:#9ac43e;text-decoration:none;">← Вернуться на Bridgik</a></p>
      </body>
      </html>
    `);
  }

  const tgUrl = `https://oauth.telegram.org/auth?bot_id=${encodeURIComponent(botId)}&origin=${encodeURIComponent(origin)}&return_to=${encodeURIComponent(callbackUrl)}&request_access=write`;
  return res.redirect(tgUrl);
});

// 6. Real Telegram Callback
app.get('/api/auth/telegram/callback', (req, res) => {
  try {
    const query = req.query as Record<string, string>;
    const { botToken, isConfigured } = getTelegramBotCredentials();

    if (isConfigured && botToken) {
      const isValid = verifyTelegramAuthData(query, botToken);
      if (!isValid) {
        return res.status(403).send('Недействительная подпись данных Telegram');
      }
    }

    const { id, first_name, last_name, username, photo_url } = query;
    if (!id) {
      return res.status(400).send('Отсутствует ID пользователя Telegram');
    }

    const user = upsertTelegramUser({
      id,
      username,
      firstName: first_name,
      lastName: last_name,
      photoUrl: photo_url,
    });

    return res.redirect(`/?tab=profile&auth=success&key=${encodeURIComponent(user.license_key)}`);
  } catch (err: any) {
    console.error('[Telegram Auth Callback Error]', err);
    return res.redirect(`/?tab=profile&auth=error&message=${encodeURIComponent(err.message)}`);
  }
});

// 9. Telegram Bot Session API (for in-app @bridgik_bot pairing)
app.get('/api/auth/telegram/session', (_req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  const { botUsername } = getTelegramBotCredentials();
  pendingBotSessions.set(token, {
    token,
    createdAt: Date.now(),
  });
  return res.json({
    token,
    botUsername,
    tgUrl: `tg://resolve?domain=${botUsername}&start=auth_${token}`,
    webUrl: `https://t.me/${botUsername}?start=auth_${token}`,
  });
});

// 10. Telegram Bot Webhook
app.post('/api/auth/telegram/bot-webhook', (req, res) => {
  try {
    const body = req.body;
    const message = body?.message;
    const text = (message?.text || '').trim();
    const from = message?.from;

    if (text.startsWith('/start auth_') && from) {
      const token = text.replace('/start auth_', '').trim();
      const sess = pendingBotSessions.get(token);
      if (sess) {
        const user = upsertTelegramUser({
          id: from.id,
          username: from.username,
          firstName: from.first_name,
          lastName: from.last_name,
        });

        const onlineSet = stickyManager.getOnlineDeviceIds(user.id);
        const profileDto = toUserProfileDto(user, undefined, onlineSet);

        sess.completedUser = {
          key: user.license_key,
          user: profileDto,
        };

        io.emit(`telegram-auth-done:${token}`, {
          key: user.license_key,
          user: profileDto,
        });
      }
    }

    // Send friendly reply in Telegram
    const { botToken } = getTelegramBotCredentials();
    if (botToken && message?.chat?.id) {
      const chatId = message.chat.id;
      let replyText = `👋 Привет, ${from?.first_name || 'друг'}!\n\n✅ Вход в Bridgik выполнен успешно! Твой браузер подключён к аккаунту.\nМожешь вернуться на https://bridgik.ru.`;
      if (!text.startsWith('/start auth_')) {
        replyText = `👋 Привет, ${from?.first_name || 'друг'}!\n\nЯ официальный бот Bridgik (@bridgik_login_bot).\nЧтобы войти на сайт, открой https://bridgik.ru и нажми «Войти через Telegram».`;
      }
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: replyText }),
      }).catch((e) => console.error('[Telegram SendMessage Error]', e));
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('[Telegram Bot Webhook Error]', err);
    return res.status(200).json({ ok: false });
  }
});

// 11. Demo confirmation for bot session (for instant test from UI)
app.post('/api/auth/telegram/bot-demo-confirm', (req, res) => {
  const { token, username = 'bridgik_user' } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Token required' });

  const user = upsertTelegramUser({
    id: 100000000 + Math.floor(Math.random() * 900000),
    username,
    firstName: 'Пользователь Telegram',
  });

  const onlineSet = stickyManager.getOnlineDeviceIds(user.id);
  const profileDto = toUserProfileDto(user, undefined, onlineSet);

  io.emit(`telegram-auth-done:${token}`, {
    key: user.license_key,
    user: profileDto,
  });

  return res.json({ success: true, key: user.license_key, user: profileDto });
});

// 12. Check Telegram Bot Session status (polling fallback)
app.get('/api/auth/telegram/session-status', (req, res) => {
  const token = req.query.token as string;
  if (!token) return res.status(400).json({ error: 'Token required' });
  const sess = pendingBotSessions.get(token);
  if (!sess) return res.status(404).json({ error: 'Session not found or expired' });
  if (sess.completedUser) {
    return res.json({ completed: true, ...sess.completedUser });
  }
  return res.json({ completed: false });
});

// --- Bridgik Pro & YooKassa Payment Endpoints ---

const PRO_PLANS: Record<string, { amount: number; days: number; title: string }> = {
  '1m': { amount: 199, days: 30, title: 'Bridgik Pro (1 месяц)' },
  '3m': { amount: 499, days: 90, title: 'Bridgik Pro (3 месяца)' },
  '1y': { amount: 1490, days: 365, title: 'Bridgik Pro (1 год)' },
};

// 1. Create payment in YooKassa
app.post('/api/payment/create', async (req, res) => {
  try {
    const { key, period = '1m', returnUrl } = req.body || {};
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'Укажите ключ пользователя' });
    }
    const user = getUserByLicenseKey(key);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const plan = PRO_PLANS[period];
    if (!plan) {
      return res.status(400).json({ error: 'Неверный тариф. Доступно: 1m, 3m, 1y' });
    }

    const paymentId = crypto.randomUUID();
    const effectiveReturnUrl =
      returnUrl || `${req.protocol}://${req.get('host') || 'bridgik.ru'}/?tab=profile&payment=success`;

    createPaymentRecord({
      id: paymentId,
      userId: user.id,
      licenseKey: user.license_key,
      amount: plan.amount,
      period,
      days: plan.days,
      status: 'pending',
    });

    const yooResponse = await createYooKassaPayment({
      amount: {
        value: `${plan.amount}.00`,
        currency: 'RUB',
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: effectiveReturnUrl,
      },
      description: `Оплата подписки ${plan.title} для профиля ${user.display_name}`,
      metadata: {
        userId: user.id,
        licenseKey: user.license_key,
        period,
        days: plan.days,
        paymentId,
      },
    });

    const confirmationUrl = yooResponse.confirmation?.confirmation_url || effectiveReturnUrl;
    updatePaymentStatus(paymentId, 'pending', yooResponse.id);

    return res.json({
      success: true,
      paymentId,
      confirmationUrl,
      yookassaPaymentId: yooResponse.id,
      amount: plan.amount,
      planTitle: plan.title,
    });
  } catch (err: any) {
    console.error('Payment creation failed:', err);
    return res.status(500).json({ error: err.message || 'Ошибка создания платежа' });
  }
});

// 2. YooKassa Webhook
app.post('/api/payment/webhook', async (req, res) => {
  try {
    const event = req.body;
    console.log('[YooKassa Webhook] Event:', event?.event);

    if (event?.event === 'payment.succeeded' && event?.object) {
      const paymentObj = event.object;
      const yooId = paymentObj.id;
      const metadata = paymentObj.metadata || {};
      const { userId, days, paymentId } = metadata;

      let dbPayment = getPaymentByYookassaId(yooId);
      if (!dbPayment && paymentId) {
        dbPayment = getPaymentById(paymentId);
      }

      const targetUserId = userId || dbPayment?.user_id;
      const targetDays = Number(days) || dbPayment?.days || 30;

      if (targetUserId) {
        const updatedUser = upgradeUserToPro(targetUserId, targetDays);
        if (dbPayment) {
          updatePaymentStatus(dbPayment.id, 'succeeded', yooId);
        }
        console.log(`[YooKassa] Activated Pro for user ${targetUserId} (+${targetDays} days)`);

        io.emit('user-pro-activated', {
          userId: targetUserId,
          proUntil: updatedUser?.pro_until,
          tier: 'pro',
        });
      }
    }

    return res.status(200).send('OK');
  } catch (err: any) {
    console.error('[YooKassa Webhook Error]:', err);
    return res.status(200).send('OK');
  }
});

// 3. Demo / Instant confirmation
app.post('/api/payment/demo-confirm', (req, res) => {
  try {
    const { key, days = 30 } = req.body || {};
    if (!key) return res.status(400).json({ error: 'Укажите ключ' });
    const user = getUserByLicenseKey(key);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const updated = upgradeUserToPro(user.id, Number(days) || 30);
    const onlineSet = stickyManager.getOnlineDeviceIds(user.id);
    const profile = toUserProfileDto(updated!, undefined, onlineSet);

    io.emit('user-pro-activated', {
      userId: user.id,
      proUntil: updated?.pro_until,
      tier: 'pro',
    });

    return res.json({ success: true, user: profile });
  } catch (err: any) {
    console.error('Demo payment confirm error:', err);
    return res.status(500).json({ error: 'Ошибка активации Pro' });
  }
});

// 4. Check payment status
app.get('/api/payment/status/:id', async (req, res) => {
  try {
    const payment = getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Платёж не найден' });

    if (payment.status === 'pending' && payment.yookassa_payment_id) {
      const yoo = await getYooKassaPayment(payment.yookassa_payment_id);
      if (yoo?.status === 'succeeded') {
        upgradeUserToPro(payment.user_id, payment.days);
        updatePaymentStatus(payment.id, 'succeeded', yoo.id);
        payment.status = 'succeeded';
      } else if (yoo?.status === 'canceled') {
        updatePaymentStatus(payment.id, 'canceled', yoo.id);
        payment.status = 'canceled';
      }
    }

    const user = getUserById(payment.user_id);
    return res.json({
      success: true,
      payment,
      userTier: user?.tier || 'free',
      proUntil: user?.pro_until,
    });
  } catch (err: any) {
    console.error('Check payment status error:', err);
    return res.status(500).json({ error: 'Ошибка проверки платежа' });
  }
});

// --- Drop & Go (24h Buffer) Endpoints ---

// 1. Upload file to Drop buffer (streamed directly to disk)
app.post('/api/drop/upload', (req, res) => {
  const rawName = (req.headers['x-file-name'] as string) || 'file.bin';
  let fileName = 'file.bin';
  try {
    fileName = decodeURIComponent(rawName);
  } catch {
    fileName = rawName;
  }
  const fileSize = Number(req.headers['x-file-size']) || 0;
  const mimeType = (req.headers['x-mime-type'] as string) || 'application/octet-stream';
  let senderName = 'Гость';
  try {
    senderName = decodeURIComponent((req.headers['x-sender-name'] as string) || 'Гость');
  } catch {
    senderName = (req.headers['x-sender-name'] as string) || 'Гость';
  }
  const targetDeviceId = req.headers['x-target-device'] as string | undefined;
  const userKey = req.headers['x-user-key'] as string | undefined;
  const ttlHours = Math.max(1, Math.min(Number(req.headers['x-ttl-hours']) || 24, 72));

  let userId: string | undefined = undefined;
  if (userKey) {
    const user = getUserByLicenseKey(userKey);
    if (user) userId = user.id;
  }

  const dropId = crypto.randomBytes(6).toString('hex');
  const safeExt = path.extname(fileName) || '.bin';
  const filePath = path.join(DROPS_DIR, `${dropId}${safeExt}`);

  const writeStream = fs.createWriteStream(filePath);
  let bytesWritten = 0;

  req.on('data', (chunk) => {
    bytesWritten += chunk.length;
  });

  req.pipe(writeStream);

  writeStream.on('finish', () => {
    const expiresAt = Date.now() + ttlHours * 60 * 60 * 1000;
    const finalSize = fileSize > 0 ? fileSize : bytesWritten;

    const dropRecord = createDropRecord({
      id: dropId,
      user_id: userId,
      target_device_id: targetDeviceId,
      file_name: fileName,
      file_size: finalSize,
      mime_type: mimeType,
      file_path: filePath,
      sender_name: senderName,
      expires_at: expiresAt,
    });

    const dto = toDropDto(dropRecord);

    // If sent to a specific device, notify it in real-time if connected
    if (userId && targetDeviceId) {
      const targetSocketId = stickyManager.getDeviceSocketId(userId, targetDeviceId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('sticky-new-drop', dto);
      }
    }

    return res.json({ success: true, drop: dto });
  });

  writeStream.on('error', (err) => {
    console.error('[Drop Upload Error]', err);
    return res.status(500).json({ success: false, error: 'Ошибка сохранения файла на сервере' });
  });
});

// 2. Pending Drops for current user device (MUST BE BEFORE /:id)
app.get('/api/drop/pending', (req, res) => {
  const key =
    (req.query.key as string) || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const deviceId = req.query.deviceId as string;

  if (!key || !deviceId) {
    return res.json({ success: true, drops: [] });
  }

  const user = getUserByLicenseKey(key);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Неверный ключ' });
  }

  const drops = getPendingDropsForDevice(user.id, deviceId);
  return res.json({ success: true, drops: drops.map(toDropDto) });
});

// 3. Metadata for a Drop
app.get('/api/drop/:id', (req, res) => {
  const drop = getDropRecord(req.params.id);
  if (!drop || drop.expires_at < Date.now()) {
    return res.status(404).json({ success: false, error: 'Файл не найден или срок хранения истёк' });
  }
  return res.json({ success: true, drop: toDropDto(drop) });
});

// 4. Download a Drop file
app.get('/api/drop/:id/download', (req, res) => {
  const drop = getDropRecord(req.params.id);
  if (!drop || drop.expires_at < Date.now() || !fs.existsSync(drop.file_path)) {
    return res.status(404).send('Файл не найден или срок хранения истёк');
  }

  incrementDropDownload(drop.id);

  res.setHeader('Content-Type', drop.mime_type || 'application/octet-stream');
  res.setHeader('Content-Length', drop.file_size);
  const encodedName = encodeURIComponent(drop.file_name);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`
  );

  const stream = fs.createReadStream(drop.file_path);
  stream.pipe(res);
});

// 5. Delete a Drop
app.delete('/api/drop/:id', (req, res) => {
  const deleted = deleteDropRecord(req.params.id);
  return res.json({ success: deleted });
});

const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

io.on('connection', (socket) => {
  const clientIp = getClientIp(socket);

  const handshakeAdminKey =
    (socket.handshake.query?.adminKey as string) || (socket.handshake.auth?.adminKey as string);
  const initialAdmin = isSocketAdmin(socket, handshakeAdminKey);
  socket.data.isAdmin = initialAdmin;

  socket.emit('admin-status', {
    isAdmin: socket.data.isAdmin,
    clientIp,
  });

  socket.on('verify-admin-key', (data: { key: string }, callback?: (res: any) => void) => {
    const verified = isSocketAdmin(socket, data?.key);
    if (verified) {
      socket.data.isAdmin = true;
    }
    socket.emit('admin-status', {
      isAdmin: socket.data.isAdmin,
      clientIp,
    });
    if (typeof callback === 'function') {
      callback({ success: verified, isAdmin: socket.data.isAdmin });
    }
  });

  // --- Sticky Bridge Realtime Devices ---
  socket.on(
    'auth-device',
    (
      data: {
        licenseKey: string;
        deviceId: string;
        name?: string;
        deviceType?: any;
        browserLabel?: string;
      },
      callback?: (res: any) => void
    ) => {
      if (!data?.licenseKey || !data?.deviceId) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Missing licenseKey or deviceId' });
        }
        return;
      }
      const user = getUserByLicenseKey(data.licenseKey);
      if (!user) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Invalid license key' });
        }
        return;
      }

      registerOrUpdateDevice(user.id, {
        id: data.deviceId,
        name: data.name,
        deviceType: data.deviceType,
        browserLabel: data.browserLabel,
      });

      stickyManager.registerDevice(io, socket, user.id, data.deviceId);

      const onlineSet = stickyManager.getOnlineDeviceIds(user.id);
      const profile = toUserProfileDto(user, data.deviceId, onlineSet);

      if (typeof callback === 'function') {
        callback({ success: true, user: profile });
      }
    }
  );

  socket.on(
    'sticky-pair-request',
    (
      data: {
        targetDeviceId: string;
        fileMeta?: { name?: string; size?: number; count?: number };
      },
      callback?: (res: any) => void
    ) => {
      const socketInfo = stickyManager.getSocketInfo(socket.id);
      if (!socketInfo) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Sender not authenticated in Sticky Bridge' });
        }
        return;
      }

      const targetSocketId = stickyManager.getDeviceSocketId(
        socketInfo.userId,
        data.targetDeviceId
      );

      if (!targetSocketId) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Целевое устройство сейчас не в сети' });
        }
        return;
      }

      const room = roomManager.createRoom();
      room.mode = 'bridge';

      io.to(targetSocketId).emit('sticky-incoming-pair', {
        roomId: room.id,
        pin: room.pin,
        fromDeviceId: socketInfo.deviceId,
        fileMeta: data.fileMeta,
      });

      if (typeof callback === 'function') {
        callback({ success: true, roomId: room.id, pin: room.pin });
      }
    }
  );

  // 0. Local Network Discovery
  socket.on('lobby-join', (data: {
    name: string;
    deviceId?: string;
    deviceType: any;
    os?: string;
    osName?: string;
    browser?: string;
    deviceModel?: string;
    isCustomName?: boolean;
    licenseKey?: string;
    statusEmote?: string;
  }) => {
    const currentSubnet = getClientNetworkSubnet(socket);
    lobbyPeers.set(socket.id, {
      socketId: socket.id,
      deviceId: typeof data?.deviceId === 'string' ? data.deviceId.slice(0, 64) : undefined,
      name: sanitizePeerName(data?.name, 'Устройство'),
      deviceType: data?.deviceType || 'unknown',
      os: typeof data?.os === 'string' ? data.os.slice(0, 20) : undefined,
      osName: typeof data?.osName === 'string' ? data.osName.slice(0, 30) : undefined,
      browser: typeof data?.browser === 'string' ? data.browser.slice(0, 30) : undefined,
      deviceModel: typeof data?.deviceModel === 'string' ? data.deviceModel.slice(0, 40) : undefined,
      isCustomName: Boolean(data?.isCustomName),
      licenseKey: typeof data?.licenseKey === 'string' ? data.licenseKey.slice(0, 64) : undefined,
      subnet: currentSubnet,
      ip: clientIp,
      isAdmin: socket.data.isAdmin,
      statusEmote: data?.statusEmote,
    });
    broadcastNearbyPeers(currentSubnet);
  });

  socket.on('lobby-update-name', (data: { name: string; isCustomName?: boolean }) => {
    const peer = lobbyPeers.get(socket.id);
    if (peer) {
      peer.name = sanitizePeerName(data?.name, 'Устройство');
      if (typeof data?.isCustomName === 'boolean') {
        peer.isCustomName = data.isCustomName;
      }
      broadcastNearbyPeers(peer.subnet);
    }
  });

  socket.on('lobby-update-status-emote', (data: { statusEmote?: string }) => {
    const peer = lobbyPeers.get(socket.id);
    if (peer) {
      peer.statusEmote = data?.statusEmote || undefined;
      broadcastNearbyPeers(peer.subnet);
    }
  });

  socket.on('lobby-query', () => {
    const currentSubnet = getClientNetworkSubnet(socket);
    const myPeer = lobbyPeers.get(socket.id);
    const peersInSubnet = Array.from(lobbyPeers.values()).filter(
      (p) =>
        p.subnet === currentSubnet &&
        p.socketId !== socket.id &&
        (!myPeer?.deviceId || !p.deviceId || p.deviceId !== myPeer.deviceId)
    );
    socket.emit(
      'nearby-peers',
      peersInSubnet.map((p) => ({
        socketId: p.socketId,
        deviceId: p.deviceId,
        name: p.name,
        deviceType: p.deviceType,
        os: p.os,
        osName: p.osName,
        browser: p.browser,
        deviceModel: p.deviceModel,
        isCustomName: p.isCustomName,
        isSameAccount: Boolean(myPeer?.licenseKey && p.licenseKey && myPeer.licenseKey === p.licenseKey),
        isAdmin: p.isAdmin,
        statusEmote: p.statusEmote,
      }))
    );
  });

  socket.on('lobby-leave', () => {
    removeFromLobby(socket.id);
  });

  socket.on('direct-pair-request', (data: { toSocketId: string; myName: string; myDevice: any }) => {
    if (!data?.toSocketId) return;
    const target = lobbyPeers.get(data.toSocketId);
    if (!target) {
      socket.emit('direct-pair-result', {
        accepted: false,
        reason: 'Устройство не найдено или вышло из сети',
      });
      return;
    }

    const room = roomManager.createRoom();
    room.mode = 'bridge';
    room.maxSeats = 2;

    socket.data.pendingPairRoomId = room.id;

    const fromPeer = lobbyPeers.get(socket.id);
    io.to(data.toSocketId).emit('incoming-pair-request', {
      fromSocketId: socket.id,
      fromName: sanitizePeerName(data.myName, 'Устройство'),
      fromDevice: data.myDevice,
      fromOs: fromPeer?.os,
      fromBrowser: fromPeer?.browser,
      fromModel: fromPeer?.deviceModel,
      roomId: room.id,
      pin: room.pin,
      isAdmin: socket.data.isAdmin,
    });
  });

  socket.on('cancel-pair-request', (data: { toSocketId: string }) => {
    if (socket.data.pendingPairRoomId) {
      roomManager.forceDeleteRoom(socket.data.pendingPairRoomId);
      socket.data.pendingPairRoomId = undefined;
    }
    if (data?.toSocketId) {
      io.to(data.toSocketId).emit('pair-request-cancelled');
    }
  });

  socket.on(
    'direct-pair-response',
    (data: { toSocketId: string; roomId: string; pin: string; accepted: boolean; reason?: string }) => {
      if (!data?.accepted && data?.roomId) {
        roomManager.forceDeleteRoom(data.roomId);
      }
      if (data?.toSocketId) {
        io.to(data.toSocketId).emit('direct-pair-result', {
          roomId: data.roomId,
          pin: data.pin,
          accepted: data.accepted,
          reason:
            data.reason ||
            (data.accepted ? undefined : 'Устройство отклонило запрос на передачу файлов'),
        });
      }
    }
  );

  // 1. Create Room
  socket.on(
    'create-room',
    (
      data: {
        customId?: string;
        peerName: string;
        avatar?: string;
        adminFrame?: any;
        statusEmote?: string;
        deviceType: any;
        mode?: 'bridge' | 'meeting';
        maxSeats?: number;
        roomTheme?: string;
        browserId?: string;
      },
      callback
    ) => {
      removeFromLobby(socket.id);
      try {
        const room = roomManager.createRoom(data.customId);
        room.mode = data.mode || 'bridge';
        room.maxSeats = Math.max(2, Math.min(Number(data.maxSeats) || 8, 20));
        room.currentRoomTheme = data.roomTheme || 'cyber-lounge';
        room.peerSeats = { [socket.id]: 0 };

        const peerId = socket.id;
        const peer: PeerInfo = {
          id: peerId,
          socketId: socket.id,
          name: sanitizePeerName(data.peerName, 'Гость'),
          avatar: data.avatar,
          adminFrame: data.adminFrame,
          statusEmote: data.statusEmote,
          deviceType: data.deviceType || 'desktop',
          joinedAt: Date.now(),
          isHost: true,
          browserId: data.browserId,
          isAdmin: socket.data.isAdmin,
        };

        roomManager.addPeer(room.id, peer);
        socket.join(room.id);
        socket.join(room.pin);

        if (typeof callback === 'function') {
          callback({
            success: true,
            roomId: room.id,
            pin: room.pin,
            peerId: peer.id,
            mode: room.mode,
            maxSeats: room.maxSeats,
            isLocked: room.isLocked || false,
            knockRequired: room.knockRequired || false,
            currentRoomTheme: room.currentRoomTheme,
            peerSeats: room.peerSeats,
            mySeat: 0,
            peers: Array.from(room.peers.values()),
          });
        }
      } catch (err: any) {
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    }
  );

  // 2. Join Room
  socket.on(
    'join-room',
    (
      data: {
        roomIdOrPin: string;
        peerName: string;
        avatar?: string;
        adminFrame?: any;
        statusEmote?: string;
        deviceType: any;
        preferredSeat?: number;
        browserId?: string;
      },
      callback
    ) => {
      removeFromLobby(socket.id);
      try {
        const attemptKey = getClientIp(socket);
        const attemptInfo = failedPinAttempts.get(attemptKey);
        const now = Date.now();

        if (attemptInfo?.blockedUntil && attemptInfo.blockedUntil > now) {
          const waitSec = Math.ceil((attemptInfo.blockedUntil - now) / 1000);
          if (typeof callback === 'function') {
            return callback({
              success: false,
              code: 'RATE_LIMITED',
              error: `Слишком много неверных попыток ввода PIN. Подождите ${waitSec} сек.`,
            });
          }
          return;
        }

        const room = roomManager.getRoom(data.roomIdOrPin || '');
        if (!room) {
          const prevCount =
            attemptInfo && now - attemptInfo.lastAttempt < 60000 ? attemptInfo.count : 0;
          const newCount = prevCount + 1;
          const blockedUntil = newCount >= 5 ? now + 60000 : undefined;
          failedPinAttempts.set(attemptKey, {
            count: newCount,
            lastAttempt: now,
            blockedUntil,
          });

          if (typeof callback === 'function') {
            return callback({
              success: false,
              code: newCount >= 5 ? 'RATE_LIMITED' : 'ROOM_NOT_FOUND',
              error:
                newCount >= 5
                  ? 'Слишком много неверных попыток ввода PIN. Доступ заблокирован на 60 сек.'
                  : 'Комната не найдена или код неверен',
            });
          }
          return;
        }

        failedPinAttempts.delete(attemptKey);

        if (room.isLocked) {
          if (typeof callback === 'function') {
            return callback({
              success: false,
              code: 'ROOM_LOCKED',
              error: 'Вход закрыт организатором комнаты',
            });
          }
          return;
        }

        if (data.browserId) {
          const existingWithSameBrowser = Array.from(room.peers.values()).find(
            (p) => p.browserId === data.browserId && p.socketId !== socket.id
          );
          if (existingWithSameBrowser) {
            const activeSock = io.sockets.sockets.get(existingWithSameBrowser.socketId);
            if (activeSock && activeSock.connected) {
              if (typeof callback === 'function') {
                return callback({
                  success: false,
                  code: 'ALREADY_IN_ROOM_SAME_BROWSER',
                  error:
                    'Вы уже находитесь в этой комнате в другой вкладке этого браузера. Чтобы подключить второго участника, откройте окно Инкогнито (Ctrl+Shift+N) или другой браузер.',
                });
              }
              return;
            }
          }
        }

        if (room.maxSeats && room.peers.size >= room.maxSeats) {
          if (typeof callback === 'function') {
            return callback({
              success: false,
              code: 'ROOM_FULL',
              maxSeats: room.maxSeats,
              error: `В комнате достигнут лимит мест (${room.maxSeats} участников)`,
            });
          }
          return;
        }

        if (room.knockRequired && room.peers.size > 0 && !room.approvedSockets?.has(socket.id)) {
          if (typeof callback === 'function') {
            return callback({
              success: false,
              code: 'KNOCK_REQUIRED',
              roomId: room.id,
              pin: room.pin,
              error: 'Требуется разрешение организатора для входа в комнату',
            });
          }
          return;
        }

        const peerId = socket.id;
        const isHost = room.peers.size === 0;
        const peer: PeerInfo = {
          id: peerId,
          socketId: socket.id,
          name: sanitizePeerName(data.peerName, 'Гость'),
          avatar: data.avatar,
          adminFrame: data.adminFrame,
          statusEmote: data.statusEmote,
          deviceType: data.deviceType || 'unknown',
          joinedAt: Date.now(),
          isHost,
          browserId: data.browserId,
          isAdmin: socket.data.isAdmin,
        };

        if (!room.peerSeats) room.peerSeats = {};
        const occupiedSeats = new Set(Object.values(room.peerSeats));
        let assignedSeat = 0;
        if (data.preferredSeat !== undefined && !occupiedSeats.has(data.preferredSeat)) {
          assignedSeat = data.preferredSeat;
        } else {
          for (let s = 0; s < (room.maxSeats || 8); s++) {
            if (!occupiedSeats.has(s)) {
              assignedSeat = s;
              break;
            }
          }
        }
        room.peerSeats[peerId] = assignedSeat;

        socket.to(room.id).emit('peer-joined', { ...peer, seatIndex: assignedSeat });

        roomManager.addPeer(room.id, peer);
        socket.join(room.id);
        socket.join(room.pin);

        if (typeof callback === 'function') {
          callback({
            success: true,
            roomId: room.id,
            pin: room.pin,
            peerId: peer.id,
            mode: room.mode || 'bridge',
            maxSeats: room.maxSeats || 8,
            isLocked: room.isLocked || false,
            knockRequired: room.knockRequired || false,
            currentRoomTheme: room.currentRoomTheme || 'cyber-lounge',
            peerSeats: room.peerSeats,
            mySeat: assignedSeat,
            peers: Array.from(room.peers.values()),
          });
        }
      } catch (err: any) {
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    }
  );

  socket.on('update-peer-name', (data: { roomId: string; name: string }) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) return;
    const peer = room.peers.get(socket.id);
    if (peer) {
      peer.name = sanitizePeerName(data.name, peer.name);
      io.to(room.id).to(room.pin).emit('peer-updated', peer);
    }
  });

  socket.on(
    'update-peer-avatar',
    (data: { roomId: string; avatar: string; adminFrame?: any; statusEmote?: string }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room) return;
      const peer = room.peers.get(socket.id);
      if (peer) {
        peer.avatar = data.avatar;
        if (data.adminFrame !== undefined) peer.adminFrame = data.adminFrame;
        if (data.statusEmote !== undefined) peer.statusEmote = data.statusEmote;
        io.to(room.id).to(room.pin).emit('peer-updated', peer);
      }
    }
  );

  socket.on('update-peer-status-emote', (data: { roomId: string; statusEmote?: string }) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) return;
    const peer = room.peers.get(socket.id);
    if (peer) {
      peer.statusEmote = data.statusEmote || undefined;
      io.to(room.id).to(room.pin).emit('peer-updated', peer);
    }
  });

  socket.on('change-seat', (data: { roomId: string; seatIndex: number }) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) return;
    if (!room.peerSeats) room.peerSeats = {};
    room.peerSeats[socket.id] = data.seatIndex;
    io.to(room.id).to(room.pin).emit('peer-seat-changed', {
      peerId: socket.id,
      seatIndex: data.seatIndex,
    });
  });

  socket.on(
    'update-room-config',
    (data: { roomId: string; maxSeats?: number; isLocked?: boolean; knockRequired?: boolean }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room) return;
      const peer = room.peers.get(socket.id);
      if (!peer?.isHost && room.peers.size > 1) return;

      if (data.maxSeats !== undefined) {
        room.maxSeats = Math.max(2, Math.min(Number(data.maxSeats) || 8, 20));
      }
      if (data.isLocked !== undefined) room.isLocked = data.isLocked;
      if (data.knockRequired !== undefined) room.knockRequired = data.knockRequired;

      io.to(room.id).to(room.pin).emit('room-config-updated', {
        maxSeats: room.maxSeats,
        isLocked: room.isLocked,
        knockRequired: room.knockRequired,
      });
    }
  );

  socket.on(
    'kick-peer',
    (data: { roomId: string; targetPeerId: string; reason?: string }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room) return;
      const sender = room.peers.get(socket.id);
      if (!sender?.isHost && room.peers.size > 1) return;

      const targetPeer = room.peers.get(data.targetPeerId);
      if (!targetPeer) return;

      io.to(targetPeer.socketId).emit('kicked', {
        reason: data.reason || 'Организатор исключил вас из комнаты',
      });

      const { peer } = roomManager.removePeerBySocket(targetPeer.socketId);
      if (peer) {
        io.sockets.sockets.get(targetPeer.socketId)?.leave(room.id);
        io.sockets.sockets.get(targetPeer.socketId)?.leave(room.pin);
        if (room.peerSeats) delete room.peerSeats[targetPeer.id];
        io.to(room.id).to(room.pin).emit('peer-left', { peerId: peer.id, kicked: true });
      }
    }
  );

  socket.on('mute-all', (data: { roomId: string }) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) return;
    const sender = room.peers.get(socket.id);
    if (!sender?.isHost && room.peers.size > 1) return;

    socket.to(room.id).to(room.pin).emit('remote-mute', {
      from: sender?.name || 'Организатор',
    });
  });

  socket.on('change-room-theme', (data: { roomId: string; theme: string }) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) return;
    const sender = room.peers.get(socket.id);
    if (!sender?.isHost && room.peers.size > 1) return;

    room.currentRoomTheme = data.theme;
    io.to(room.id).to(room.pin).emit('room-theme-changed', {
      theme: data.theme,
    });
  });

  socket.on('toggle-mic', (data: { roomId: string; isMicActive: boolean }) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) return;
    const peer = room.peers.get(socket.id);
    if (peer) {
      peer.isMicActive = Boolean(data.isMicActive);
      socket.to(room.id).to(room.pin).emit('peer-mic-changed', {
        peerId: socket.id,
        isMicActive: peer.isMicActive,
      });
    }
  });

  // 3. WebRTC Signal Relay
  socket.on('signal', (data: { to: string; payload: any }) => {
    if (!data.to || !data.payload) return;
    io.to(data.to).emit('signal', {
      from: socket.id,
      payload: data.payload,
    });
  });

  // 3b. WebRTC Fallback Relay (Socket-based 100% guarantee)
  socket.on('relay-file-chunk', (data: { to: string; buffer: any }) => {
    if (!data?.to || !data?.buffer) return;
    io.to(data.to).emit('relay-file-chunk', {
      from: socket.id,
      buffer: data.buffer,
    });
  });

  socket.on('relay-control-message', (data: { to: string; message: any }) => {
    if (!data?.to || !data?.message) return;
    io.to(data.to).emit('relay-control-message', {
      from: socket.id,
      message: data.message,
    });
  });

  // 4. Knock / Knock Response
  socket.on('knock', (data: { roomId: string; peerName: string }) => {
    const room = roomManager.getRoom(data?.roomId || '');
    if (!room) return;

    if (!room.pendingKnockSockets) room.pendingKnockSockets = new Set();
    room.pendingKnockSockets.add(socket.id);
    socket.data.knockingRoomId = room.id;

    const hostPeer = Array.from(room.peers.values()).find((p) => p.isHost);
    const payload = {
      socketId: socket.id,
      roomId: room.id,
      peerName: sanitizePeerName(data.peerName, 'Гость'),
    };

    if (hostPeer) {
      io.to(hostPeer.socketId).emit('knock-request', payload);
    } else {
      socket.to(room.id).emit('knock-request', payload);
    }
  });

  socket.on('cancel-knock', (data: { roomId: string }) => {
    const room = roomManager.getRoom(data?.roomId || '');
    if (!room) return;
    room.pendingKnockSockets?.delete(socket.id);
    socket.data.knockingRoomId = undefined;

    const hostPeer = Array.from(room.peers.values()).find((p) => p.isHost);
    if (hostPeer) {
      io.to(hostPeer.socketId).emit('knock-cancelled', { socketId: socket.id });
    } else {
      socket.to(room.id).emit('knock-cancelled', { socketId: socket.id });
    }
  });

  socket.on(
    'knock-decision',
    (data: { roomId: string; toSocketId: string; approved: boolean }) => {
      const room = roomManager.getRoom(data?.roomId || '');
      if (!room) return;
      const sender = room.peers.get(socket.id);
      if (!sender?.isHost && room.peers.size > 1) return;

      room.pendingKnockSockets?.delete(data.toSocketId);

      if (data.approved) {
        if (!room.approvedSockets) room.approvedSockets = new Set();
        room.approvedSockets.add(data.toSocketId);
      }

      io.to(data.toSocketId).emit('knock-result', {
        approved: data.approved,
        roomId: room.id,
      });
    }
  );

  // Panic / Instant Room Destruction
  socket.on('destroy-room', (data: { roomId: string }) => {
    const room = roomManager.getRoom(data?.roomId || '');
    if (!room) return;
    const sender = room.peers.get(socket.id);
    if (!sender?.isHost && room.peers.size > 1) return;

    if (room.pendingKnockSockets) {
      for (const knockerId of room.pendingKnockSockets) {
        io.to(knockerId).emit('knock-result', { approved: false, roomId: room.id });
      }
      room.pendingKnockSockets.clear();
    }

    socket.to(room.id).to(room.pin).emit('room-destroyed', {
      reason: 'Организатор экстренно завершил встречу и стёр данные комнаты',
    });

    for (const p of Array.from(room.peers.values())) {
      const sock = io.sockets.sockets.get(p.socketId);
      sock?.leave(room.id);
      sock?.leave(room.pin);
    }

    roomManager.forceDeleteRoom(room.id, true);
  });

  // 5. Leave Room
  socket.on('leave-room', () => {
    removeFromLobby(socket.id);
    const { room, peer } = roomManager.removePeerBySocket(socket.id);
    if (room && peer) {
      if (room.peerSeats) delete room.peerSeats[peer.id];
      socket.leave(room.id);
      socket.leave(room.pin);
      io.to(room.id).to(room.pin).emit('peer-seat-changed', { peerId: peer.id, seatIndex: -1 });
      io.to(room.id).to(room.pin).emit('peer-left', { peerId: peer.id, peerName: peer.name });
    }
  });

  // 6. Disconnect
  socket.on('disconnect', () => {
    stickyManager.unregisterDevice(io, socket.id);
    if (socket.data.knockingRoomId) {
      const kRoom = roomManager.getRoom(socket.data.knockingRoomId);
      if (kRoom) {
        kRoom.pendingKnockSockets?.delete(socket.id);
        const hostPeer = Array.from(kRoom.peers.values()).find((p) => p.isHost);
        if (hostPeer) {
          io.to(hostPeer.socketId).emit('knock-cancelled', { socketId: socket.id });
        }
      }
    }
    if (socket.data.pendingPairRoomId) {
      roomManager.forceDeleteRoom(socket.data.pendingPairRoomId);
    }
    removeFromLobby(socket.id);
    const { room, peer } = roomManager.removePeerBySocket(socket.id);
    if (room && peer) {
      if (room.peerSeats) delete room.peerSeats[peer.id];
      io.to(room.id).to(room.pin).emit('peer-seat-changed', { peerId: peer.id, seatIndex: -1 });
      io.to(room.id).to(room.pin).emit('peer-left', { peerId: peer.id, peerName: peer.name });
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Bridgik Signaling Server running on http://localhost:${PORT}`);
});