import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { RoomManager } from './roomManager.js';
import { PeerInfo } from './types.js';

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
  ip: string;
}
const lobbyPeers: Map<string, LobbyPeer> = new Map();

function getClientIp(socket: any): string {
  const forwarded = socket.handshake.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  const addr = socket.handshake.address || '127.0.0.1';
  if (addr === '::1' || addr === '127.0.0.1' || addr.includes('::ffff:127.0.0.1')) {
    return '127.0.0.1';
  }
  return addr;
}

function broadcastNearbyPeers(ip: string) {
  const peersOnIp = Array.from(lobbyPeers.values()).filter((p) => p.ip === ip);
  peersOnIp.forEach((peer) => {
    const others = peersOnIp
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
    broadcastNearbyPeers(existing.ip);
  }
}

app.use(cors());
app.use(express.json());

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
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

  // 0. Local Network Discovery (Snapdrop / AirDrop radar)
  socket.on('lobby-join', (data: { name: string; deviceType: any }) => {
    lobbyPeers.set(socket.id, {
      socketId: socket.id,
      name: data.name || 'Устройство',
      deviceType: data.deviceType || 'unknown',
      ip: clientIp,
    });
    broadcastNearbyPeers(clientIp);
  });

  socket.on('lobby-leave', () => {
    removeFromLobby(socket.id);
  });

  // Direct 1-click pair request
  socket.on('direct-pair-request', (data: { toSocketId: string; myName: string; myDevice: any }) => {
    const target = lobbyPeers.get(data.toSocketId);
    if (!target) return;

    const room = roomManager.createRoom();

    io.to(data.toSocketId).emit('incoming-pair-request', {
      fromSocketId: socket.id,
      fromName: data.myName,
      fromDevice: data.myDevice,
      roomId: room.id,
      pin: room.pin,
    });
  });

  socket.on('direct-pair-response', (data: { toSocketId: string; roomId: string; pin: string; accepted: boolean }) => {
    io.to(data.toSocketId).emit('direct-pair-result', {
      roomId: data.roomId,
      pin: data.pin,
      accepted: data.accepted,
    });
  });

  // 1. Create Room
  socket.on('create-room', (data: { customId?: string; peerName: string; deviceType: any }, callback) => {
    removeFromLobby(socket.id);
    try {
      const room = roomManager.createRoom(data.customId);
      const peerId = socket.id;
      const peer: PeerInfo = {
        id: peerId,
        socketId: socket.id,
        name: data.peerName || 'Гость',
        deviceType: data.deviceType || 'desktop',
        joinedAt: Date.now(),
        isHost: true,
      };

      roomManager.addPeer(room.id, peer);
      socket.join(room.id);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomId: room.id,
          pin: room.pin,
          peerId: peer.id,
          peers: Array.from(room.peers.values()),
        });
      }
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // 2. Join Room
  socket.on('join-room', (data: { roomIdOrPin: string; peerName: string; deviceType: any }, callback) => {
    removeFromLobby(socket.id);
    try {
      const room = roomManager.getRoom(data.roomIdOrPin);
      if (!room) {
        if (typeof callback === 'function') {
          return callback({ success: false, error: 'Комната не найдена или код неверен' });
        }
        return;
      }

      const peerId = socket.id;
      const peer: PeerInfo = {
        id: peerId,
        socketId: socket.id,
        name: data.peerName || 'Гость',
        deviceType: data.deviceType || 'unknown',
        joinedAt: Date.now(),
        isHost: room.peers.size === 0,
      };

      // Notify existing peers
      socket.to(room.id).emit('peer-joined', peer);

      roomManager.addPeer(room.id, peer);
      socket.join(room.id);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomId: room.id,
          pin: room.pin,
          peerId: peer.id,
          peers: Array.from(room.peers.values()),
        });
      }
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
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
      socket.leave(room.id);
      socket.to(room.id).emit('peer-left', { peerId: peer.id });
    }
  });

  // 6. Disconnect
  socket.on('disconnect', () => {
    removeFromLobby(socket.id);
    const { room, peer } = roomManager.removePeerBySocket(socket.id);
    if (room && peer) {
      socket.to(room.id).emit('peer-left', { peerId: peer.id });
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 AirBridge Signaling Server running on http://localhost:${PORT}`);
});
