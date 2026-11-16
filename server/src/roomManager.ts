import crypto from 'crypto';
import { Room, PeerInfo } from './types.js';

export class RoomManager {
  private rooms: Map<string, Room> = new Map(); // key: room.id
  private pinToRoomId: Map<string, string> = new Map(); // key: 4-digit pin -> room.id
  private socketToRoom: Map<string, { roomId: string; peerId: string }> = new Map();

  /**
   * Generates a cryptographically secure, unguessable room ID token
   * Formatted in Google-Meet style (e.g. "w7tk-9mp4-qx2a") with ~60 bits of entropy
   */
  private generateSecureRoomId(): string {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789'; // 30 non-ambiguous chars
    let id = '';
    const bytes = crypto.randomBytes(12);
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) id += '-';
      id += chars[bytes[i] % chars.length];
    }
    return id;
  }

  /**
   * Generates a unique 4-digit PIN not currently in use
   */
  private generateUniquePin(): string {
    let pin = '';
    let attempts = 0;
    do {
      pin = Math.floor(1000 + Math.random() * 9000).toString();
      attempts++;
      if (attempts > 9999) {
        // Fallback to 5-digit if space is exhausted
        pin = Math.floor(10000 + Math.random() * 90000).toString();
        break;
      }
    } while (this.pinToRoomId.has(pin));
    return pin;
  }

  /**
   * Create a new room with a secure token ID and a 4-digit PIN
   */
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

    return room;
  }

  /**
   * Find room by ID or by PIN
   */
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

  /**
   * Add a peer to a room
   */
  public addPeer(roomId: string, peer: PeerInfo): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.peers.set(peer.id, peer);
    this.socketToRoom.set(peer.socketId, { roomId, peerId: peer.id });
    return true;
  }

  /**
   * Remove peer by socket ID
   */
  public removePeerBySocket(socketId: string): { room?: Room; peer?: PeerInfo } {
    const record = this.socketToRoom.get(socketId);
    if (!record) return {};

    const { roomId, peerId } = record;
    this.socketToRoom.delete(socketId);

    const room = this.rooms.get(roomId);
    if (!room) return {};

    const peer = room.peers.get(peerId);
    room.peers.delete(peerId);

    // If room is now empty, schedule deletion
    if (room.peers.size === 0) {
      this.scheduleRoomCleanup(roomId, room.pin);
    }

    return { room, peer };
  }

  /**
   * Schedule room cleanup after 60 seconds if still empty
   */
  private scheduleRoomCleanup(roomId: string, pin: string) {
    setTimeout(() => {
      const room = this.rooms.get(roomId);
      if (room && room.peers.size === 0) {
        this.rooms.delete(roomId);
        this.pinToRoomId.delete(pin);
        this.pinToRoomId.delete(roomId);
      }
    }, 60 * 1000);
  }

  /**
   * Get stats for healthcheck
   */
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
}
