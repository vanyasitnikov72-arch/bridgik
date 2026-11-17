import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { RoomManager } from './roomManager.js';
import { PeerInfo } from './types.js';

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
  maxHttpBufferSize: 1e6,
});

const roomManager = new RoomManager();

interface LobbyPeer {
  socketId: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
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
      .filter((p) => p.socketId !== peer.socketId)
      .map((p) => ({
        socketId: p.socketId,
        name: p.name,
        deviceType: p.deviceType,
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

  // 0. Local Network Discovery
  socket.on('lobby-join', (data: { name: string; deviceType: any; statusEmote?: string }) => {
    const currentSubnet = getClientNetworkSubnet(socket);
    lobbyPeers.set(socket.id, {
      socketId: socket.id,
      name: sanitizePeerName(data?.name, 'Устройство'),
      deviceType: data?.deviceType || 'unknown',
      subnet: currentSubnet,
      ip: clientIp,
      isAdmin: socket.data.isAdmin,
      statusEmote: data?.statusEmote,
    });
    broadcastNearbyPeers(currentSubnet);
  });

  socket.on('lobby-update-name', (data: { name: string }) => {
    const peer = lobbyPeers.get(socket.id);
    if (peer) {
      peer.name = sanitizePeerName(data?.name, 'Устройство');
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
    const peersInSubnet = Array.from(lobbyPeers.values()).filter(
      (p) => p.subnet === currentSubnet && p.socketId !== socket.id
    );
    socket.emit(
      'nearby-peers',
      peersInSubnet.map((p) => ({
        socketId: p.socketId,
        name: p.name,
        deviceType: p.deviceType,
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

    io.to(data.toSocketId).emit('incoming-pair-request', {
      fromSocketId: socket.id,
      fromName: sanitizePeerName(data.myName, 'Устройство'),
      fromDevice: data.myDevice,
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