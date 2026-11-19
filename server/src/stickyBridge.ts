import { Server, Socket } from 'socket.io';

class StickyBridgeManager {
  // userId -> Map<deviceId, socketId>
  private userDevices: Map<string, Map<string, string>> = new Map();
  // socketId -> { userId, deviceId }
  private socketToDevice: Map<string, { userId: string; deviceId: string }> = new Map();

  /**
   * Registers a socket connection as belonging to a user's device
   */
  registerDevice(
    io: Server,
    socket: Socket,
    userId: string,
    deviceId: string
  ): void {
    // If socket was previously assigned to another device, unregister it
    this.unregisterDevice(io, socket.id);

    if (!this.userDevices.has(userId)) {
      this.userDevices.set(userId, new Map());
    }

    const devices = this.userDevices.get(userId)!;
    devices.set(deviceId, socket.id);
    this.socketToDevice.set(socket.id, { userId, deviceId });

    // Join a private socket room for this user to broadcast account-wide events
    const userRoom = `user:${userId}`;
    socket.join(userRoom);

    // Notify other devices of this user that this device is now online
    socket.to(userRoom).emit('sticky-device-status', {
      deviceId,
      isOnline: true,
      lastSeenAt: Date.now(),
    });
  }

  /**
   * Unregisters a socket on disconnect
   */
  unregisterDevice(io: Server, socketId: string): void {
    const info = this.socketToDevice.get(socketId);
    if (!info) return;

    this.socketToDevice.delete(socketId);
    const devices = this.userDevices.get(info.userId);
    if (devices) {
      devices.delete(info.deviceId);
      if (devices.size === 0) {
        this.userDevices.delete(info.userId);
      }
    }

    const userRoom = `user:${info.userId}`;
    io.to(userRoom).emit('sticky-device-status', {
      deviceId: info.deviceId,
      isOnline: false,
      lastSeenAt: Date.now(),
    });
  }

  /**
   * Returns Set of currently online device IDs for a user
   */
  getOnlineDeviceIds(userId: string): Set<string> {
    const devices = this.userDevices.get(userId);
    if (!devices) return new Set();
    return new Set(devices.keys());
  }

  /**
   * Returns the socket ID for a given user's device if online
   */
  getDeviceSocketId(userId: string, deviceId: string): string | undefined {
    return this.userDevices.get(userId)?.get(deviceId);
  }

  /**
   * Gets device registration info for a socket
   */
  getSocketInfo(socketId: string): { userId: string; deviceId: string } | undefined {
    return this.socketToDevice.get(socketId);
  }
}

export const stickyManager = new StickyBridgeManager();
