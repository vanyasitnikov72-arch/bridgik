export type ThemeMode = 'swiss' | 'cyberpunk' | 'lofi';
export type AppTab = 'bridge' | 'meeting' | 'about' | 'legal';
export type RoomMode = 'bridge' | 'meeting';

export interface Peer {
  id: string;
  name: string;
  avatar?: string;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  joinedAt: number;
  isHost: boolean;
  isAdmin?: boolean;
  isMicActive?: boolean;
}

export interface NearbyPeer {
  socketId: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  isAdmin?: boolean;
}

export interface PairRequest {
  fromSocketId: string;
  fromName: string;
  fromDevice: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  roomId: string;
  pin: string;
  isAdmin?: boolean;
}

export interface TextMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  isAdmin?: boolean;
  text: string;
  timestamp: number;
  isClipboard?: boolean;
  isSystem?: boolean;
}

export interface FileTransfer {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  type: 'upload' | 'download';
  peerId: string;
  peerName: string;
  progress: number; // 0 to 100
  speed: number; // bytes per second
  status:
    | 'pending'
    | 'pending_approval'
    | 'waiting_receiver'
    | 'transferring'
    | 'completed'
    | 'cancelled'
    | 'error';
  blobUrl?: string;
  error?: string;
  savedToDisk?: boolean; // true if written directly to disk via File System Access API
}

export type WebRTCMessage =
  | {
      type: 'TEXT';
      id: string;
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
      isAdmin?: boolean;
      text: string;
      timestamp: number;
      isClipboard?: boolean;
    }
  | {
      type: 'FILE_OFFER';
      fileId: string;
      name: string;
      size: number;
      mimeType: string;
      senderName: string;
    }
  | {
      type: 'FILE_ACCEPT';
      fileId: string;
      streamToDisk: boolean;
    }
  | {
      type: 'FILE_REJECT';
      fileId: string;
    }
  | {
      type: 'FILE_META';
      fileId: string;
      name: string;
      size: number;
      mimeType: string;
      totalChunks: number;
      chunkSize: number;
      senderName: string;
    }
  | {
      type: 'FILE_COMPLETE';
      fileId: string;
    }
  | {
      type: 'FILE_CANCEL';
      fileId: string;
    }
  | {
      type: 'SCRATCHPAD_SYNC';
      text: string;
      updatedBy: string;
      timestamp: number;
    };
