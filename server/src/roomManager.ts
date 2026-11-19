import crypto from 'crypto';
import { Room, PeerInfo } from './types.js';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private pinToRoomId: Map<string, string> = new Map();
  private socketToRoom: Map<string, { roomId: string; peerId: string }> = new Map();
  private cleanupTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  private generateSecureRoomId(): string {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let id = '';
    const bytes = crypto.randomBytes(12);
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) id += '-';
      id += chars[bytes[i] % chars.length];
    }
    return id;
  }

  private generateUniquePin(): string {
    let pin = '';
    let attempts = 0;
    do {
      pin = crypto.randomInt(1000, 10000).toString();
      attempts++;
      if (attempts > 9000) {
        pin = crypto.randomInt(10000, 100000).toString();
        break;
      }
    } while (this.pinToRoomId.has(pin));
    return pin;
  }

  private cancelCleanupTimer(roomId: string) {
    const timer = this.cleanupTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.cleanupTimers.delete(roomId);
    }
  }

  public createRoom(requestedId?: string): Room {
    const pin = this.generateUniquePin();
    let id = requestedId?.trim() ? requestedId.trim().toLowerCase() : this.generateSecureRoomId();
    while (this.rooms.has(id)) {
      id = this.generateSecureRoomId();
    }

    const room: Room = {
      id,
      pin,
      createdAt: Date.now(),
      peers: new Map(),
    };

    this.rooms.set(id, room);
    this.pinToRoomId.set(pin, id);
    if (id !== pin) {
      this.pinToRoomId.set(id, id);
    }

    this.scheduleRoomCleanup(id, pin, 120 * 1000);
    return room;
  }

  public forceDeleteRoom(roomIdOrPin: string, force = false) {
    const room = this.getRoom(roomIdOrPin);
    if (!room) return;

    this.cancelCleanupTimer(room.id);
    if (!force && room.peers.size > 0) return;

    if (force) {
      for (const peer of room.peers.values()) {
        this.socketToRoom.delete(peer.socketId);
      }
      room.peers.clear();
    }

    this.rooms.delete(room.id);
    this.pinToRoomId.delete(room.pin);
    this.pinToRoomId.delete(room.id);
  }

  public getRoom(idOrPin: string): Room | undefined {
    const normalized = idOrPin.trim().toLowerCase();
    if (this.rooms.has(normalized)) {
      return this.rooms.get(normalized);
    }
    const mappedId = this.pinToRoomId.get(normalized);
    if (mappedId && this.rooms.has(mappedId)) {
      return this.rooms.get(mappedId);
    }
    return undefined;
  }

  public addPeer(roomId: string, peer: PeerInfo): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    this.cancelCleanupTimer(roomId);
    room.peers.set(peer.id, peer);
    this.socketToRoom.set(peer.socketId, { roomId, peerId: peer.id });
    return true;
  }

  public removePeerBySocket(socketId: string): { room?: Room; peer?: PeerInfo } {
    const record = this.socketToRoom.get(socketId);
    if (!record) return {};

    const { roomId, peerId } = record;
    this.socketToRoom.delete(socketId);

    const room = this.rooms.get(roomId);
    if (!room) return {};

    const peer = room.peers.get(peerId);
    room.peers.delete(peerId);

    if (room.peers.size === 0) {
      this.scheduleRoomCleanup(roomId, room.pin, 60 * 1000);
    }

    return { room, peer };
  }

  public scheduleRoomCleanup(roomId: string, pin: string, delayMs = 60 * 1000) {
    this.cancelCleanupTimer(roomId);
    const timer = setTimeout(() => {
      this.cleanupTimers.delete(roomId);
      const room = this.rooms.get(roomId);
      if (room && room.peers.size === 0) {
        this.rooms.delete(roomId);
        this.pinToRoomId.delete(pin);
        this.pinToRoomId.delete(roomId);
      }
    }, delayMs);
    this.cleanupTimers.set(roomId, timer);
  }

  public getStats() {
    let peerCount = 0;
    for (const r of this.rooms.values()) {
      peerCount += r.peers.size;
    }
    return {
      activeRooms: this.rooms.size,
      activePeers: peerCount,
    };
  }

  public getAllRooms(): Array<{ id: string; mode: string; peerCount: number; createdAt: number }> {
    return Array.from(this.rooms.values()).map((r) => ({
      id: r.id,
      mode: r.mode || 'bridge',
      peerCount: r.peers.size,
      createdAt: r.createdAt,
    }));
  }
}