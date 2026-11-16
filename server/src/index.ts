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
    if (name.toLowerCase().includes('vethernet') || name.toLowerCase().includes('virtual') || name.toLowerCase().includes('loopback')) {
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
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e6, // 1MB max for signaling messages
});

const roomManager = new RoomManager();

// Local Wi-Fi Discovery (Snapdrop / AirDrop style radar)
interface LobbyPeer {
  socketId: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  subnet: string;
  ip: string;
}
const lobbyPeers: Map<string, LobbyPeer> = new Map();

// Rate limiting against brute-force PIN guessing
interface FailedPinAttempt {
  count: number;
  lastAttempt: number;
  blockedUntil?: number;
}
const failedPinAttempts: Map<string, FailedPinAttempt> = new Map();

function getClientIp(socket: any): string {
  const forwarded = socket.handshake.headers['x-forwarded-for'];
  let ip = '';
  if (typeof forwarded === 'string') {
    ip = forwarded.split(',')[0].trim();
  } else {
    ip = socket.handshake.address || '127.0.0.1';
  }
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }
  return ip;
}

function getClientNetworkSubnet(socket: any): string {
  let ip = getClientIp(socket);
  const lanIp = getLocalLanIp();

  // If localhost, it is running on the server host machine, so it shares the server's LAN IP
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    ip = lanIp;
  }

  // Parse IPv4 address
  const parts = ip.split('.').map(Number);
  if (parts.length === 4 && !parts.some(isNaN)) {
    // 192.168.x.x -> group by /24 subnet (e.g. 192.168.8)
    if (parts[0] === 192 && parts[1] === 168) {
      return `lan-192.168.${parts[2]}`;
    }
    // 10.x.x.x -> group by /24
    if (parts[0] === 10) {
      return `lan-10.${parts[1]}.${parts[2]}`;
    }
    // 172.16.x.x - 172.31.x.x
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
      return `lan-172.${parts[1]}.${parts[2]}`;
    }
  }

  // Check if IP belongs to the same local network as the server
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

app.use(cors());
app.use(express.json());

// API Endpoints
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

// Production client static files
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Socket.io WebRTC Signaling
io.on('connection', (socket) => {
  const clientIp = getClientIp(socket);
  const clientSubnet = getClientNetworkSubnet(socket);

  // 0. Local Network Discovery (Snapdrop / AirDrop radar)
  socket.on('lobby-join', (data: { name: string; deviceType: any }) => {
    const currentSubnet = getClientNetworkSubnet(socket);
    lobbyPeers.set(socket.id, {
      socketId: socket.id,
      name: data.name || 'Устройство',
      deviceType: data.deviceType || 'unknown',
      subnet: currentSubnet,
      ip: clientIp,
    });
    broadcastNearbyPeers(currentSubnet);
  });

  socket.on('lobby-update-name', (data: { name: string }) => {
    const peer = lobbyPeers.get(socket.id);
    if (peer) {
      peer.name = data.name || 'Устройство';
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
      }))
    );
  });

  socket.on('lobby-leave', () => {
    removeFromLobby(socket.id);
  });

  // Direct 1-click pair request
  socket.on('direct-pair-request', (data: { toSocketId: string; myName: string; myDevice: any }) => {
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

    io.to(data.toSocketId).emit('incoming-pair-request', {
      fromSocketId: socket.id,
      fromName: data.myName,
      fromDevice: data.myDevice,
      roomId: room.id,
      pin: room.pin,
    });
  });

  socket.on('cancel-pair-request', (data: { toSocketId: string }) => {
    io.to(data.toSocketId).emit('pair-request-cancelled');
  });

  socket.on(
    'direct-pair-response',
    (data: { toSocketId: string; roomId: string; pin: string; accepted: boolean; reason?: string }) => {
      io.to(data.toSocketId).emit('direct-pair-result', {
        roomId: data.roomId,
        pin: data.pin,
        accepted: data.accepted,
        reason: data.reason || (data.accepted ? undefined : 'Устройство отклонило запрос на передачу файлов'),
      });
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
        room.maxSeats = data.maxSeats || 8;
        room.currentRoomTheme = data.roomTheme || 'cyber-lounge';
        room.peerSeats = { [socket.id]: 0 };

        const peerId = socket.id;
        const peer: PeerInfo = {
          id: peerId,
          socketId: socket.id,
          name: data.peerName || 'Гость',
          avatar: data.avatar,
          deviceType: data.deviceType || 'desktop',
          joinedAt: Date.now(),
          isHost: true,
          browserId: data.browserId,
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
        deviceType: any;
        preferredSeat?: number;
        browserId?: string;
      },
      callback
    ) => {
      removeFromLobby(socket.id);
      try {
        const clientIp = getClientIp(socket);
        const attemptKey = `${clientIp}_${socket.id}`;
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

        const room = roomManager.getRoom(data.roomIdOrPin);
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

        // Check if this browser already has an active tab inside this room
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

        const peerId = socket.id;
        const isHost = room.peers.size === 0;
        const peer: PeerInfo = {
          id: peerId,
          socketId: socket.id,
          name: data.peerName || 'Гость',
          avatar: data.avatar,
          deviceType: data.deviceType || 'unknown',
          joinedAt: Date.now(),
          isHost,
          browserId: data.browserId,
        };

        // Assign free seat
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

        // Notify existing peers
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

  // Update peer name
  socket.on('update-peer-name', (data: { roomId: string; name: string }) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) return;
    const peer = room.peers.get(socket.id);
    if (peer) {
      peer.name = data.name;
      io.to(room.id).to(room.pin).emit('peer-updated', peer);
    }
  });

  // Update peer avatar
  socket.on('update-peer-avatar', (data: { roomId: string; avatar: string }) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) return;
    const peer = room.peers.get(socket.id);
    if (peer) {
      peer.avatar = data.avatar;
      io.to(room.id).to(room.pin).emit('peer-updated', peer);
    }
  });

  // Seat switching
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

  // Host: Update Room Config (max seats, lock room)
  socket.on(
    'update-room-config',
    (data: { roomId: string; maxSeats?: number; isLocked?: boolean }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room) return;
      const peer = room.peers.get(socket.id);
      if (!peer?.isHost && room.peers.size > 1) return;

      if (data.maxSeats !== undefined) room.maxSeats = data.maxSeats;
      if (data.isLocked !== undefined) room.isLocked = data.isLocked;

      io.to(room.id).to(room.pin).emit('room-config-updated', {
        maxSeats: room.maxSeats,
        isLocked: room.isLocked,
      });
    }
  );

  // Host: Kick Peer
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

  // Host: Mute All
  socket.on('mute-all', (data: { roomId: string }) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) return;
    const sender = room.peers.get(socket.id);
    if (!sender?.isHost && room.peers.size > 1) return;

    socket.to(room.id).to(room.pin).emit('remote-mute', {
      from: sender?.name || 'Организатор',
    });
  });

  // Host: Synchronize Theme
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

  // Peer: Toggle mic status
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

  // 3. WebRTC Signal Relay (offer, answer, ice-candidate)
  socket.on('signal', (data: { to: string; payload: any }) => {
    if (!data.to || !data.payload) return;
    io.to(data.to).emit('signal', {
      from: socket.id,
      payload: data.payload,
    });
  });

  // 4. Knock / Knock Response (if knock mode used)
  socket.on('knock', (data: { roomId: string; peerName: string }) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) return;
    // Broadcast knock to all existing peers (especially host)
    socket.to(room.id).emit('knock-request', {
      socketId: socket.id,
      peerName: data.peerName,
    });
  });

  socket.on('knock-decision', (data: { toSocketId: string; approved: boolean }) => {
    io.to(data.toSocketId).emit('knock-result', {
      approved: data.approved,
    });
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
  console.log(`🚀 AirBridge Signaling Server running on http://localhost:${PORT}`);
});
