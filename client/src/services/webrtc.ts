import { Socket } from 'socket.io-client';
import { FileTransfer, TextMessage, WebRTCMessage } from '../types/index.js';

const CHUNK_SIZE = 64 * 1024;
const READ_BLOCK_SIZE = 1024 * 1024;
const BUFFER_HIGH = 4 * 1024 * 1024;
const BUFFER_LOW = 1024 * 1024;
const HEADER_SIZE = 40;
const LARGE_FILE_THRESHOLD = 200 * 1024 * 1024;
const MOBILE_MEMORY_WARN_BYTES = 400 * 1024 * 1024;

export function normalizeMimeType(fileName: string, mime?: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  if (ext === 'mov') return 'video/mp4';
  if (ext === 'mp4') return 'video/mp4';
  if (ext === 'webm') return 'video/webm';
  if (ext === 'mkv') return 'video/x-matroska';
  if (ext === 'avi') return 'video/x-msvideo';
  if (ext === 'mp3') return 'audio/mpeg';
  if (ext === 'wav') return 'audio/wav';
  if (ext === 'ogg' || ext === 'oga') return 'audio/ogg';
  if (ext === 'm4a') return 'audio/mp4';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'pdf') return 'application/pdf';
  return mime && mime !== 'application/octet-stream' ? mime : 'application/octet-stream';
}

export function createMediaBlobUrl(file: File): string {
  const ext = file.name.toLowerCase().split('.').pop() || '';
  if (ext === 'mov') {
    try {
      const mp4Blob = file.slice(0, file.size, 'video/mp4');
      return URL.createObjectURL(mp4Blob);
    } catch {
      return URL.createObjectURL(file);
    }
  }
  return URL.createObjectURL(file);
}

export function getIceServers(): RTCConfiguration {
  const baseServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ];

  if (typeof window !== 'undefined') {
    const customTurn =
      (window as any).__AIRBRIDGE_TURN_CONFIG || localStorage.getItem('bridgik_turn_config');
    if (customTurn) {
      try {
        const parsed = typeof customTurn === 'string' ? JSON.parse(customTurn) : customTurn;
        if (Array.isArray(parsed)) {
          baseServers.push(...parsed);
        } else if (parsed.urls) {
          baseServers.push(parsed);
        }
      } catch {}
    }
  }

  return {
    iceServers: baseServers,
    iceCandidatePoolSize: 2,
  };
}

function sanitizePathSegment(segment: string): string {
  return segment.replace(/[<>:"\\|?*\x00-\x1f]/g, '_').trim() || 'file';
}

async function getFileHandleFromPath(dirHandle: any, relativePath: string): Promise<any> {
  const parts = relativePath
    .split('/')
    .map((p) => p.trim())
    .filter((p) => p && p !== '.' && p !== '..')
    .map(sanitizePathSegment);

  if (parts.length === 0) {
    parts.push('file');
  }

  let currentDir = dirHandle;
  for (let i = 0; i < parts.length - 1; i++) {
    currentDir = await currentDir.getDirectoryHandle(parts[i], { create: true });
  }
  const fileName = parts[parts.length - 1] || 'file';
  return await currentDir.getFileHandle(fileName, { create: true });
}

interface PeerConnectionBundle {
  pc: RTCPeerConnection;
  controlChannel: RTCDataChannel | null;
  fileChannel: RTCDataChannel | null;
  connectionType?: 'direct' | 'relay';
  isInitiator: boolean;
  makingOffer: boolean;
  ignoreOffer: boolean;
  iceRestarted?: boolean;
}

export interface WebRTCCallbacks {
  onTextMessage: (msg: TextMessage) => void;
  onTransferProgress: (transfer: Partial<FileTransfer> & { id: string }) => void;
  onTransferComplete: (transfer: FileTransfer) => void;
  onRemoteStream: (peerId: string, stream: MediaStream) => void;
  onLocalStreamChange?: (stream: MediaStream | null) => void;
  onReaction?: (peerId: string, emoteUrl: string, emoteName?: string) => void;
  onPeerConnectionStateChange: (peerId: string, state: RTCPeerConnectionState) => void;
  onConnectionTypeChange?: (peerId: string, connectionType: 'direct' | 'relay') => void;
  onConnectionFailed?: (peerId: string, reason: 'NAT_BLOCKED' | 'DISCONNECTED') => void;
  onMemoryLimitWarning?: (fileName: string, size: number) => void;
  onScratchpadSync?: (text: string, updatedBy: string) => void;
  onScratchpadTyping?: (updatedBy: string) => void;
}

export class WebRTCManager {
  private socket: Socket;
  private myPeerId: string;
  private myName: string;
  private myAvatar: string = '/mascots/dino_avatar.jpg';
  private myIsAdmin: boolean = false;
  private myAdminFrame: 'gold' | 'rgb' | 'plasma' | 'none' = 'gold';
  private myStatusEmote?: string;
  private callbacks: WebRTCCallbacks;
  private connections: Map<string, PeerConnectionBundle> = new Map();
  private localStream: MediaStream | null = null;
  private isMicMuted: boolean = false;
  private screenStream: MediaStream | null = null;
  private destinationDirectoryHandle: any = null;
  private uploadQueue: Promise<void> = Promise.resolve();

  private incomingFiles: Map<
    string,
    {
      meta: {
        fileId: string;
        name: string;
        size: number;
        mimeType: string;
        totalChunks: number;
        chunkSize?: number;
        senderName: string;
      };
      peerId: string;
      streamToDisk: boolean;
      writableStream?: any;
      writeQueue?: Promise<void>;
      initPromise?: Promise<void>;
      receivedChunks: (Uint8Array | undefined)[];
      receivedCount: number;
      receivedBytes: number;
      lastProgressUpdate: number;
      lastBytesTransferred: number;
      speed: number;
    }
  > = new Map();

  private pendingOffers: Map<
    string,
    {
      meta: {
        fileId: string;
        name: string;
        size: number;
        mimeType: string;
        senderName: string;
      };
      peerId: string;
    }
  > = new Map();

  private pendingOutgoingFiles: Map<string, { file: File; targetPeerId?: string }> = new Map();
  private cancelledTransfers: Set<string> = new Set();
  private fallbackTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(
    socket: Socket,
    myPeerId: string,
    myName: string,
    callbacks: WebRTCCallbacks,
    myAvatar?: string
  ) {
    this.socket = socket;
    this.myPeerId = myPeerId;
    this.myName = myName;
    if (myAvatar) this.myAvatar = myAvatar;
    this.callbacks = callbacks;
    this.setupRelayListeners();
  }

  private setupRelayListeners() {
    this.socket.on(
      'relay-control-message',
      (data: { from: string; message: WebRTCMessage | string }) => {
        if (!data?.from || !data?.message) return;
        this.handleIncomingControlMessage(data.message, data.from);
      }
    );

    this.socket.on('relay-file-chunk', (data: { from: string; buffer: ArrayBuffer }) => {
      if (!data?.from || !data?.buffer) return;
      this.handleIncomingFilePacket(data.buffer, data.from);
    });
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public updateMyAvatar(avatar: string) {
    this.myAvatar = avatar;
  }

  public updateMyName(name: string) {
    this.myName = name;
  }

  public updateAdminStatus(isAdmin: boolean, frame?: 'gold' | 'rgb' | 'plasma' | 'none') {
    this.myIsAdmin = isAdmin;
    if (frame !== undefined) this.myAdminFrame = frame;
  }

  public updateStatusEmote(emote?: string) {
    this.myStatusEmote = emote;
  }

  private enqueueFileStream(task: () => Promise<void>) {
    this.uploadQueue = this.uploadQueue
      .then(() => task())
      .catch((err) => console.error('File stream queue error:', err));
  }

  public async connectToPeer(targetPeerId: string, isInitiator: boolean) {
    if (this.connections.has(targetPeerId)) {
      return;
    }

    const pc = new RTCPeerConnection(getIceServers());
    const bundle: PeerConnectionBundle = {
      pc,
      controlChannel: null,
      fileChannel: null,
      connectionType: 'direct',
      isInitiator,
      makingOffer: false,
      ignoreOffer: false,
      iceRestarted: false,
    };
    this.connections.set(targetPeerId, bundle);

    const prevTimer = this.fallbackTimers.get(targetPeerId);
    if (prevTimer) clearTimeout(prevTimer);
    const fallbackTimer = setTimeout(() => {
      const cur = this.connections.get(targetPeerId);
      if (
        cur &&
        cur.connectionType !== 'relay' &&
        (!cur.fileChannel || cur.fileChannel.readyState !== 'open') &&
        cur.pc.iceConnectionState !== 'connected' &&
        cur.pc.iceConnectionState !== 'completed'
      ) {
        console.log(`[WebRTC] P2P handshake delay with ${targetPeerId}, activating Socket Fallback Relay`);
        cur.connectionType = 'relay';
        this.callbacks.onConnectionTypeChange?.(targetPeerId, 'relay');
      }
    }, 3500);
    this.fallbackTimers.set(targetPeerId, fallbackTimer);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('signal', {
          to: targetPeerId,
          payload: { candidate: event.candidate },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      this.callbacks.onPeerConnectionStateChange(targetPeerId, pc.connectionState);
    };

    pc.oniceconnectionstatechange = async () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        const t = this.fallbackTimers.get(targetPeerId);
        if (t) clearTimeout(t);
        bundle.iceRestarted = false;
        const type = await this.checkConnectionType(targetPeerId);
        bundle.connectionType = type;
        this.callbacks.onConnectionTypeChange?.(targetPeerId, type);
      } else if (pc.iceConnectionState === 'failed') {
        if (!bundle.iceRestarted && bundle.isInitiator) {
          bundle.iceRestarted = true;
          await this.renegotiate(targetPeerId, pc, true);
        } else {
          const t = this.fallbackTimers.get(targetPeerId);
          if (t) clearTimeout(t);
          console.warn(`[WebRTC] Direct P2P ICE failed for ${targetPeerId}, switching to Fallback Relay`);
          bundle.connectionType = 'relay';
          this.callbacks.onConnectionTypeChange?.(targetPeerId, 'relay');
        }
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.callbacks.onRemoteStream(targetPeerId, event.streams[0]);
      } else if (event.track) {
        const stream = new MediaStream([event.track]);
        this.callbacks.onRemoteStream(targetPeerId, stream);
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        const sender = pc.addTrack(track, this.localStream!);
        if (track.kind === 'audio') {
          try {
            const params = sender.getParameters();
            if (params.encodings && params.encodings[0]) {
              (params.encodings[0] as any).priority = 'high';
              (params.encodings[0] as any).networkPriority = 'high';
              sender.setParameters(params).catch(() => {});
            }
          } catch {}
        }
      });
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => pc.addTrack(track, this.screenStream!));
    }

    if (isInitiator) {
      const controlChannel = pc.createDataChannel('airbridge-control', {
        ordered: true,
        priority: 'high',
      } as any);
      const fileChannel = pc.createDataChannel('airbridge-files', {
        ordered: true,
        priority: 'low',
      } as any);
      fileChannel.binaryType = 'arraybuffer';

      bundle.controlChannel = controlChannel;
      bundle.fileChannel = fileChannel;

      this.setupControlChannel(controlChannel, targetPeerId);
      this.setupFileChannel(fileChannel, targetPeerId);

      await this.renegotiate(targetPeerId, pc);
    } else {
      pc.ondatachannel = (event) => {
        const channel = event.channel;
        if (channel.label === 'airbridge-control') {
          bundle.controlChannel = channel;
          this.setupControlChannel(channel, targetPeerId);
        } else if (channel.label === 'airbridge-files') {
          channel.binaryType = 'arraybuffer';
          bundle.fileChannel = channel;
          this.setupFileChannel(channel, targetPeerId);
        }
      };
    }
  }

  public async handleSignal(fromPeerId: string, payload: any) {
    let bundle = this.connections.get(fromPeerId);
    if (!bundle) {
      await this.connectToPeer(fromPeerId, false);
      bundle = this.connections.get(fromPeerId);
      if (!bundle) return;
    }

    const { pc } = bundle;
    const isPolite = this.myPeerId < fromPeerId;

    if (payload.sdp) {
      try {
        const isOffer = payload.sdp.type === 'offer';
        const offerCollision = isOffer && (bundle.makingOffer || pc.signalingState !== 'stable');
        bundle.ignoreOffer = !isPolite && offerCollision;
        if (bundle.ignoreOffer) {
          return;
        }

        if (offerCollision && isPolite) {
          await Promise.all([
            pc.setLocalDescription({ type: 'rollback' }),
            pc.setRemoteDescription(new RTCSessionDescription(payload.sdp)),
          ]);
        } else {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }

        if (isOffer) {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          this.socket.emit('signal', {
            to: fromPeerId,
            payload: { sdp: pc.localDescription },
          });
        }
      } catch (sdpErr) {
        console.warn('Error applying SDP signal', sdpErr);
      }
    } else if (payload.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (e) {
        if (!bundle.ignoreOffer) {
          console.warn('Error adding ICE candidate', e);
        }
      }
    }
  }

  private async finalizeReceivedFile(fileId: string) {
    const incoming = this.incomingFiles.get(fileId);
    if (!incoming) return;

    if (incoming.writeQueue) {
      await incoming.writeQueue;
    }
    if (incoming.initPromise) {
      await incoming.initPromise;
    }

    if (incoming.streamToDisk) {
      try {
        if (incoming.writableStream) {
          await incoming.writableStream.close();
          incoming.writableStream = undefined;
        }
      } catch (e) {
        console.error('Error closing disk stream', e);
      }

      const completedTransfer: FileTransfer = {
        id: fileId,
        name: incoming.meta.name,
        size: incoming.meta.size,
        mimeType: incoming.meta.mimeType,
        type: 'download',
        peerId: incoming.peerId,
        peerName: incoming.meta.senderName,
        progress: 100,
        speed: 0,
        status: 'completed',
        savedToDisk: true,
      };

      this.callbacks.onTransferComplete(completedTransfer);
      this.incomingFiles.delete(fileId);
    } else {
      const resolvedMime = normalizeMimeType(incoming.meta.name, incoming.meta.mimeType);
      const blob = new Blob(incoming.receivedChunks as BlobPart[], {
        type: resolvedMime,
      });
      const blobUrl = URL.createObjectURL(blob);

      incoming.receivedChunks = [];

      const completedTransfer: FileTransfer = {
        id: fileId,
        name: incoming.meta.name,
        size: incoming.meta.size,
        mimeType: incoming.meta.mimeType,
        type: 'download',
        peerId: incoming.peerId,
        peerName: incoming.meta.senderName,
        progress: 100,
        speed: 0,
        status: 'completed',
        blobUrl,
      };

      this.callbacks.onTransferComplete(completedTransfer);
      this.incomingFiles.delete(fileId);
    }
  }

  private setupControlChannel(channel: RTCDataChannel, peerId: string) {
    channel.onopen = () => {
      console.log(`Control channel open with ${peerId}`);
    };

    channel.onmessage = async (event) => {
      this.handleIncomingControlMessage(event.data, peerId);
    };
  }

  private setupFileChannel(channel: RTCDataChannel, peerId: string) {
    channel.onopen = () => {
      console.log(`File channel open with ${peerId}`);
    };

    channel.onmessage = async (event) => {
      if (typeof event.data === 'string') return;
      this.handleIncomingFilePacket(event.data as ArrayBuffer, peerId);
    };
  }

  public async handleIncomingControlMessage(raw: WebRTCMessage | string, peerId: string) {
    try {
      const msg: WebRTCMessage = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (msg.type === 'TEXT') {
        this.callbacks.onTextMessage({
          id: msg.id,
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderAvatar: msg.senderAvatar,
          isAdmin: msg.isAdmin,
          adminFrame: msg.adminFrame,
          senderStatusEmote: msg.senderStatusEmote,
          text: msg.text,
          timestamp: msg.timestamp,
          isClipboard: msg.isClipboard,
          isBurner: msg.isBurner,
          expiresAt: msg.expiresAt || (msg.isBurner ? Date.now() + 10000 : undefined),
        });
      } else if (msg.type === 'SCRATCHPAD_SYNC') {
        this.callbacks.onScratchpadSync?.(msg.text, msg.updatedBy);
      } else if (msg.type === 'SCRATCHPAD_TYPING') {
        this.callbacks.onScratchpadTyping?.(msg.updatedBy);
      } else if (msg.type === 'REACTION') {
        this.callbacks.onReaction?.(peerId, msg.emoteUrl, msg.emoteName);
      } else if (msg.type === 'FILE_OFFER') {
        this.pendingOffers.set(msg.fileId, { meta: msg, peerId });

        if (this.destinationDirectoryHandle) {
          this.acceptIncomingFileWithDirectory(msg.fileId, this.destinationDirectoryHandle);
        } else {
          const supportsDirectToDisk =
            typeof window !== 'undefined' && 'showSaveFilePicker' in window;
          if (!supportsDirectToDisk && msg.size > MOBILE_MEMORY_WARN_BYTES) {
            this.callbacks.onMemoryLimitWarning?.(msg.name, msg.size);
          }

          this.callbacks.onTransferProgress({
            id: msg.fileId,
            name: msg.name,
            size: msg.size,
            mimeType: msg.mimeType,
            type: 'download',
            peerId,
            peerName: msg.senderName,
            progress: 0,
            speed: 0,
            status: 'pending_approval',
          });
        }
      } else if (msg.type === 'FILE_ACCEPT') {
        const pending = this.pendingOutgoingFiles.get(msg.fileId);
        if (pending) {
          this.pendingOutgoingFiles.delete(msg.fileId);
          this.enqueueFileStream(() =>
            this.startStreamingFile(pending.file, msg.fileId, pending.targetPeerId)
          );
        }
      } else if (msg.type === 'FILE_REJECT') {
        this.pendingOutgoingFiles.delete(msg.fileId);
        this.callbacks.onTransferProgress({
          id: msg.fileId,
          status: 'cancelled',
          error: 'Получатель отклонил передачу файла',
        });
      } else if (msg.type === 'FILE_META') {
        const existing = this.incomingFiles.get(msg.fileId);
        if (existing) {
          existing.meta.totalChunks = msg.totalChunks;
          existing.meta.chunkSize = msg.chunkSize;
        } else if (this.destinationDirectoryHandle) {
          const totalChunks = msg.totalChunks;
          const incomingState: any = {
            meta: msg,
            peerId,
            streamToDisk: true,
            writableStream: undefined,
            writeQueue: Promise.resolve(),
            receivedChunks: new Array(totalChunks),
            receivedCount: 0,
            receivedBytes: 0,
            lastProgressUpdate: Date.now(),
            lastBytesTransferred: 0,
            speed: 0,
          };

          incomingState.initPromise = (async () => {
            try {
              const fileHandle = await getFileHandleFromPath(
                this.destinationDirectoryHandle,
                msg.name
              );
              incomingState.writableStream = await fileHandle.createWritable();
            } catch (err) {
              console.warn('Direct to disk init failed, falling back to in-memory', err);
              incomingState.streamToDisk = false;
            }
          })();

          this.incomingFiles.set(msg.fileId, incomingState);
        } else {
          this.incomingFiles.set(msg.fileId, {
            meta: msg,
            peerId,
            streamToDisk: false,
            receivedChunks: new Array(msg.totalChunks),
            receivedCount: 0,
            receivedBytes: 0,
            lastProgressUpdate: Date.now(),
            lastBytesTransferred: 0,
            speed: 0,
          });
        }

        this.callbacks.onTransferProgress({
          id: msg.fileId,
          name: msg.name,
          size: msg.size,
          mimeType: msg.mimeType,
          type: 'download',
          peerId,
          peerName: msg.senderName,
          progress: msg.size === 0 ? 100 : 0,
          speed: 0,
          status: 'transferring',
        });

        if (msg.size === 0 || msg.totalChunks === 0) {
          await this.finalizeReceivedFile(msg.fileId);
        }
      } else if (msg.type === 'FILE_CANCEL') {
        const incoming = this.incomingFiles.get(msg.fileId);
        if (incoming?.writableStream) {
          incoming.writableStream.abort().catch(() => {});
        }
        this.incomingFiles.delete(msg.fileId);
        this.pendingOffers.delete(msg.fileId);
        this.callbacks.onTransferProgress({
          id: msg.fileId,
          status: 'cancelled',
        });
      }
    } catch (err) {
      console.error('Error handling control message', err);
    }
  }

  public async handleIncomingFilePacket(buffer: ArrayBuffer, _peerId: string) {
    if (buffer.byteLength < HEADER_SIZE) return;

    const headerView = new DataView(buffer);
    const idBytes = new Uint8Array(buffer, 0, 32);
    let fileId = '';
    for (let i = 0; i < 32; i++) {
      if (idBytes[i] === 0) break;
      fileId += String.fromCharCode(idBytes[i]);
    }

    const chunkIndex = headerView.getUint32(32);
    const totalChunks = headerView.getUint32(36);
    const chunkData = new Uint8Array(buffer, HEADER_SIZE);

    const incoming = this.incomingFiles.get(fileId);
    if (!incoming) return;

    if (incoming.streamToDisk) {
      incoming.receivedCount++;
      incoming.receivedBytes += chunkData.byteLength;

      incoming.writeQueue = (incoming.writeQueue || Promise.resolve()).then(async () => {
        if (incoming.initPromise) {
          await incoming.initPromise;
        }
        if (incoming.streamToDisk && incoming.writableStream) {
          await incoming.writableStream.write(chunkData);
        } else if (!incoming.receivedChunks[chunkIndex]) {
          incoming.receivedChunks[chunkIndex] = chunkData;
        }
      });
    } else {
      if (!incoming.receivedChunks[chunkIndex]) {
        incoming.receivedChunks[chunkIndex] = chunkData;
        incoming.receivedCount++;
        incoming.receivedBytes += chunkData.byteLength;
      }
    }

    const now = Date.now();
    const elapsed = (now - incoming.lastProgressUpdate) / 1000;
    if (elapsed >= 0.25) {
      const bytesDiff = incoming.receivedBytes - incoming.lastBytesTransferred;
      incoming.speed = elapsed > 0 ? bytesDiff / elapsed : 0;
      incoming.lastBytesTransferred = incoming.receivedBytes;
      incoming.lastProgressUpdate = now;

      const progress =
        incoming.meta.size > 0
          ? Math.min(100, Math.round((incoming.receivedBytes / incoming.meta.size) * 100))
          : 100;

      this.callbacks.onTransferProgress({
        id: fileId,
        progress,
        speed: incoming.speed,
        status: 'transferring',
        savedToDisk: incoming.streamToDisk,
      });
    }

    if (incoming.receivedCount === totalChunks) {
      await this.finalizeReceivedFile(fileId);
    }
  }

  public sendControlMessageToPeer(peerId: string, msg: WebRTCMessage) {
    const bundle = this.connections.get(peerId);
    const payload = JSON.stringify(msg);
    if (bundle?.controlChannel?.readyState === 'open' && bundle.connectionType !== 'relay') {
      try {
        bundle.controlChannel.send(payload);
        return;
      } catch (err) {
        console.warn(`Control channel send error to ${peerId}, falling back to socket`, err);
      }
    }
    this.socket.emit('relay-control-message', { to: peerId, message: msg });
  }

  public broadcastControlMessage(msg: WebRTCMessage, targetPeerId?: string) {
    if (targetPeerId) {
      this.sendControlMessageToPeer(targetPeerId, msg);
    } else {
      this.connections.forEach((_bundle, peerId) => {
        this.sendControlMessageToPeer(peerId, msg);
      });
    }
  }

  public sendReaction(emoteUrl: string, emoteName?: string) {
    const msg: WebRTCMessage = {
      type: 'REACTION',
      id: Math.random().toString(36).substring(2, 10),
      senderId: this.myPeerId,
      emoteUrl,
      emoteName,
      timestamp: Date.now(),
    };
    this.broadcastControlMessage(msg);
  }

  public sendTextMessage(text: string, isClipboard = false, isBurner = false) {
    const expiresAt = isBurner ? Date.now() + 10000 : undefined;
    const msg: WebRTCMessage = {
      type: 'TEXT',
      id: Math.random().toString(36).substring(2, 10),
      senderId: this.myPeerId,
      senderName: this.myName,
      senderAvatar: this.myAvatar,
      isAdmin: this.myIsAdmin,
      adminFrame: this.myAdminFrame,
      senderStatusEmote: this.myStatusEmote,
      text,
      timestamp: Date.now(),
      isClipboard,
      isBurner,
      expiresAt,
    };

    this.broadcastControlMessage(msg);

    this.callbacks.onTextMessage({
      id: msg.id,
      senderId: this.myPeerId,
      senderName: this.myName,
      senderAvatar: this.myAvatar,
      isAdmin: this.myIsAdmin,
      adminFrame: this.myAdminFrame,
      senderStatusEmote: this.myStatusEmote,
      text,
      timestamp: msg.timestamp,
      isClipboard,
      isBurner,
      expiresAt,
    });
  }

  public sendScratchpadUpdate(text: string) {
    const msg: WebRTCMessage = {
      type: 'SCRATCHPAD_SYNC',
      text,
      updatedBy: this.myName,
      timestamp: Date.now(),
    };
    this.broadcastControlMessage(msg);
  }

  public sendScratchpadTyping() {
    const msg: WebRTCMessage = {
      type: 'SCRATCHPAD_TYPING',
      updatedBy: this.myName,
      timestamp: Date.now(),
    };
    this.broadcastControlMessage(msg);
  }

  public async checkConnectionType(peerId: string): Promise<'direct' | 'relay'> {
    const bundle = this.connections.get(peerId);
    if (!bundle?.pc) return 'direct';
    try {
      const stats = await bundle.pc.getStats();
      for (const report of stats.values()) {
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          const local = stats.get(report.localCandidateId);
          const remote = stats.get(report.remoteCandidateId);
          if (local?.candidateType === 'relay' || remote?.candidateType === 'relay') {
            return 'relay';
          }
        }
      }
    } catch {}
    return 'direct';
  }

  public async sendFile(file: File, targetPeerId?: string) {
    const fileId = Math.random().toString(36).substring(2, 12);
    const senderBlobUrl = createMediaBlobUrl(file);

    const activeTargets: Array<{ peerId: string; bundle: PeerConnectionBundle }> = [];
    if (targetPeerId && this.connections.has(targetPeerId)) {
      activeTargets.push({ peerId: targetPeerId, bundle: this.connections.get(targetPeerId)! });
    } else {
      this.connections.forEach((bundle, peerId) => {
        activeTargets.push({ peerId, bundle });
      });
    }

    if (activeTargets.length === 0) {
      this.callbacks.onTransferProgress({
        id: fileId,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        type: 'upload',
        peerId: targetPeerId || 'all',
        peerName: 'Файлы комнаты',
        progress: 100,
        speed: 0,
        status: 'completed',
        blobUrl: senderBlobUrl,
      });
      return;
    }

    if (file.size >= LARGE_FILE_THRESHOLD) {
      this.pendingOutgoingFiles.set(fileId, { file, targetPeerId });

      this.callbacks.onTransferProgress({
        id: fileId,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        type: 'upload',
        peerId: targetPeerId || 'all',
        peerName: 'Получатели',
        progress: 0,
        speed: 0,
        status: 'waiting_receiver',
      });

      const offerMsg: WebRTCMessage = {
        type: 'FILE_OFFER',
        fileId,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        senderName: this.myName,
      };

      this.broadcastControlMessage(offerMsg, targetPeerId);
      return;
    }

    this.callbacks.onTransferProgress({
      id: fileId,
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      type: 'upload',
      peerId: targetPeerId || 'all',
      peerName: 'Получатели',
      progress: 0,
      speed: 0,
      status: 'transferring',
      blobUrl: senderBlobUrl,
    });

    this.enqueueFileStream(() => this.startStreamingFile(file, fileId, targetPeerId, senderBlobUrl));
  }

  private async startStreamingFile(
    file: File,
    fileId: string,
    targetPeerId?: string,
    existingBlobUrl?: string
  ) {
    if (this.cancelledTransfers.has(fileId)) {
      this.cancelledTransfers.delete(fileId);
      this.callbacks.onTransferProgress({ id: fileId, status: 'cancelled' });
      return;
    }

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    const activeTargets: Array<{ peerId: string; bundle: PeerConnectionBundle }> = [];
    if (targetPeerId && this.connections.has(targetPeerId)) {
      activeTargets.push({ peerId: targetPeerId, bundle: this.connections.get(targetPeerId)! });
    } else {
      this.connections.forEach((bundle, peerId) => {
        activeTargets.push({ peerId, bundle });
      });
    }

    if (activeTargets.length === 0) {
      this.callbacks.onTransferProgress({
        id: fileId,
        status: 'cancelled',
        error: 'Соединение с получателем потеряно',
      });
      return;
    }

    const metaMsg: WebRTCMessage = {
      type: 'FILE_META',
      fileId,
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      totalChunks,
      chunkSize: CHUNK_SIZE,
      senderName: this.myName,
    };

    this.broadcastControlMessage(metaMsg, targetPeerId);

    const senderBlobUrl = existingBlobUrl || createMediaBlobUrl(file);

    this.callbacks.onTransferProgress({
      id: fileId,
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      type: 'upload',
      peerId: targetPeerId || 'all',
      peerName: 'Получатели',
      progress: file.size === 0 ? 100 : 0,
      speed: 0,
      status: file.size === 0 ? 'completed' : 'transferring',
      blobUrl: senderBlobUrl,
    });

    if (file.size === 0) {
      return;
    }

    const fileIdBytes = new Uint8Array(32);
    for (let i = 0; i < Math.min(fileId.length, 32); i++) {
      fileIdBytes[i] = fileId.charCodeAt(i);
    }

    let fileOffset = 0;
    let chunkIndex = 0;
    let bytesSent = 0;
    let lastProgressUpdate = Date.now();
    let lastBytesSent = 0;

    while (fileOffset < file.size) {
      if (this.cancelledTransfers.has(fileId)) {
        this.broadcastControlMessage({ type: 'FILE_CANCEL', fileId }, targetPeerId);
        this.cancelledTransfers.delete(fileId);
        this.callbacks.onTransferProgress({ id: fileId, status: 'cancelled' });
        return;
      }

      const blockEnd = Math.min(fileOffset + READ_BLOCK_SIZE, file.size);
      const blockSlice = file.slice(fileOffset, blockEnd);
      const blockBuffer = await blockSlice.arrayBuffer();
      let blockOffset = 0;

      while (blockOffset < blockBuffer.byteLength) {
        if (this.cancelledTransfers.has(fileId)) {
          this.broadcastControlMessage({ type: 'FILE_CANCEL', fileId }, targetPeerId);
          this.cancelledTransfers.delete(fileId);
          this.callbacks.onTransferProgress({ id: fileId, status: 'cancelled' });
          return;
        }

        const isVoiceCallActive = Boolean(this.localStream && !this.isMicMuted);
        const dynamicBufferHigh = isVoiceCallActive ? 512 * 1024 : BUFFER_HIGH;
        const dynamicBufferLow = isVoiceCallActive ? 128 * 1024 : BUFFER_LOW;

        for (const { bundle } of activeTargets) {
          const ch = bundle.fileChannel;
          if (ch && ch.readyState === 'open' && bundle.connectionType !== 'relay' && ch.bufferedAmount > dynamicBufferHigh) {
            await new Promise<void>((resolve) => {
              ch.bufferedAmountLowThreshold = dynamicBufferLow;
              if (ch.bufferedAmount <= dynamicBufferLow || ch.readyState !== 'open') {
                return resolve();
              }
              const cleanup = () => {
                ch.removeEventListener('bufferedamountlow', onLow);
                ch.removeEventListener('close', cleanup);
                ch.removeEventListener('error', cleanup);
                resolve();
              };
              const onLow = () => {
                if (ch.bufferedAmount <= dynamicBufferLow || ch.readyState !== 'open') {
                  cleanup();
                }
              };
              ch.addEventListener('bufferedamountlow', onLow);
              ch.addEventListener('close', cleanup);
              ch.addEventListener('error', cleanup);
            });
          }
        }

        const availableCount = activeTargets.filter(
          (t) =>
            (t.bundle.fileChannel?.readyState === 'open' && t.bundle.connectionType !== 'relay') ||
            this.socket.connected
        ).length;
        if (availableCount === 0) {
          this.callbacks.onTransferProgress({
            id: fileId,
            status: 'cancelled',
            error: 'Соединение прервано во время передачи',
          });
          return;
        }

        if (isVoiceCallActive && chunkIndex % 16 === 0) {
          await new Promise<void>((r) => setTimeout(r, 2));
        }

        const currentChunkSize = Math.min(CHUNK_SIZE, blockBuffer.byteLength - blockOffset);
        const packet = new Uint8Array(HEADER_SIZE + currentChunkSize);
        packet.set(fileIdBytes, 0);

        const view = new DataView(packet.buffer);
        view.setUint32(32, chunkIndex);
        view.setUint32(36, totalChunks);
        packet.set(new Uint8Array(blockBuffer, blockOffset, currentChunkSize), HEADER_SIZE);

        for (const t of activeTargets) {
          if (t.bundle.fileChannel?.readyState === 'open' && t.bundle.connectionType !== 'relay') {
            t.bundle.fileChannel.send(packet.buffer);
          } else {
            this.socket.emit('relay-file-chunk', { to: t.peerId, buffer: packet.buffer });
          }
        }

        const hasRelay = activeTargets.some(
          (t) => t.bundle.connectionType === 'relay' || t.bundle.fileChannel?.readyState !== 'open'
        );
        if (hasRelay && chunkIndex % 8 === 0) {
          await new Promise<void>((r) => setTimeout(r, 4));
        }

        blockOffset += currentChunkSize;
        chunkIndex++;
        bytesSent += currentChunkSize;

        const now = Date.now();
        const elapsed = (now - lastProgressUpdate) / 1000;
        if (elapsed >= 0.25 || bytesSent === file.size) {
          const speed = elapsed > 0 ? (bytesSent - lastBytesSent) / elapsed : 0;
          lastBytesSent = bytesSent;
          lastProgressUpdate = now;

          const progress = Math.min(100, Math.round((bytesSent / file.size) * 100));
          this.callbacks.onTransferProgress({
            id: fileId,
            progress,
            speed,
            status: bytesSent === file.size ? 'completed' : 'transferring',
            blobUrl: senderBlobUrl,
          });
        }
      }

      fileOffset = blockEnd;
    }

    this.callbacks.onTransferProgress({
      id: fileId,
      progress: 100,
      speed: 0,
      status: 'completed',
      blobUrl: senderBlobUrl,
    });
  }

  public async acceptIncomingFile(fileId: string): Promise<boolean> {
    const offer = this.pendingOffers.get(fileId);
    if (!offer) return false;

    let streamToDisk = false;
    let writableStream: any = undefined;

    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: sanitizePathSegment(offer.meta.name),
        });
        writableStream = await handle.createWritable();
        streamToDisk = true;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return false;
        }
        console.warn('File picker failed, falling back to memory', err);
      }
    }

    const totalChunks = Math.ceil(offer.meta.size / CHUNK_SIZE);

    this.incomingFiles.set(fileId, {
      meta: {
        ...offer.meta,
        totalChunks,
        chunkSize: CHUNK_SIZE,
      },
      peerId: offer.peerId,
      streamToDisk,
      writableStream,
      writeQueue: Promise.resolve(),
      receivedChunks: streamToDisk ? [] : new Array(totalChunks),
      receivedCount: 0,
      receivedBytes: 0,
      lastProgressUpdate: Date.now(),
      lastBytesTransferred: 0,
      speed: 0,
    });

    this.pendingOffers.delete(fileId);

    const acceptMsg: WebRTCMessage = {
      type: 'FILE_ACCEPT',
      fileId,
      streamToDisk,
    };
    this.sendControlMessageToPeer(offer.peerId, acceptMsg);

    this.callbacks.onTransferProgress({
      id: fileId,
      status: 'transferring',
      savedToDisk: streamToDisk,
    });

    return true;
  }

  public setDestinationDirectory(handle: any) {
    this.destinationDirectoryHandle = handle;
  }

  public getDestinationDirectory(): any {
    return this.destinationDirectoryHandle;
  }

  public async acceptIncomingFileWithDirectory(fileId: string, dirHandle: any): Promise<boolean> {
    const offer = this.pendingOffers.get(fileId);
    if (!offer) return false;

    let streamToDisk = false;
    let writableStream: any = undefined;

    try {
      const fileHandle = await getFileHandleFromPath(dirHandle, offer.meta.name);
      writableStream = await fileHandle.createWritable();
      streamToDisk = true;
    } catch (err) {
      console.warn('Direct directory write failed, falling back to memory', err);
    }

    const totalChunks = Math.ceil(offer.meta.size / CHUNK_SIZE);

    this.incomingFiles.set(fileId, {
      meta: {
        ...offer.meta,
        totalChunks,
        chunkSize: CHUNK_SIZE,
      },
      peerId: offer.peerId,
      streamToDisk,
      writableStream,
      writeQueue: Promise.resolve(),
      receivedChunks: streamToDisk ? [] : new Array(totalChunks),
      receivedCount: 0,
      receivedBytes: 0,
      lastProgressUpdate: Date.now(),
      lastBytesTransferred: 0,
      speed: 0,
    });

    this.pendingOffers.delete(fileId);

    const acceptMsg: WebRTCMessage = {
      type: 'FILE_ACCEPT',
      fileId,
      streamToDisk,
    };
    this.sendControlMessageToPeer(offer.peerId, acceptMsg);

    this.callbacks.onTransferProgress({
      id: fileId,
      status: 'transferring',
      savedToDisk: streamToDisk,
    });

    return true;
  }

  public rejectIncomingFile(fileId: string) {
    const offer = this.pendingOffers.get(fileId);
    if (!offer) return;

    const rejectMsg: WebRTCMessage = {
      type: 'FILE_REJECT',
      fileId,
    };
    this.sendControlMessageToPeer(offer.peerId, rejectMsg);

    this.pendingOffers.delete(fileId);
    this.callbacks.onTransferProgress({
      id: fileId,
      status: 'cancelled',
    });
  }

  public cancelTransfer(fileId: string) {
    this.cancelledTransfers.add(fileId);
    if (this.pendingOutgoingFiles.has(fileId)) {
      this.pendingOutgoingFiles.delete(fileId);
      this.callbacks.onTransferProgress({ id: fileId, status: 'cancelled' });
    }
  }

  private async renegotiate(peerId: string, pc: RTCPeerConnection, iceRestart = false) {
    const bundle = this.connections.get(peerId);
    if (!bundle) return;
    bundle.makingOffer = true;
    try {
      const offer = await pc.createOffer(iceRestart ? { iceRestart: true } : undefined);
      await pc.setLocalDescription(offer);
      this.socket.emit('signal', {
        to: peerId,
        payload: { sdp: pc.localDescription },
      });
    } catch (err) {
      console.warn(`Renegotiation failed with peer ${peerId}`, err);
    } finally {
      bundle.makingOffer = false;
    }
  }

  public async toggleMicrophone(): Promise<boolean> {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks().filter((t) => t.readyState === 'live');
      if (audioTracks.length > 0) {
        if (!this.isMicMuted) {
          audioTracks.forEach((track) => {
            track.enabled = false;
          });
          this.isMicMuted = true;
          return false;
        } else {
          audioTracks.forEach((track) => {
            track.enabled = true;
          });
          this.isMicMuted = false;
          return true;
        }
      } else {
        this.localStream = null;
        this.isMicMuted = false;
        this.callbacks.onLocalStreamChange?.(null);
      }
    }

    if (typeof window !== 'undefined') {
      const isSecure =
        window.isSecureContext ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      if (!isSecure && window.location.protocol === 'http:') {
        throw new Error(
          'Браузер блокирует доступ к микрофону по незащищённому HTTP. Откройте страницу через http://localhost:5173 или настройте HTTPS.'
        );
      }
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error(
        'Ваш браузер не поддерживает доступ к микрофону (navigator.mediaDevices.getUserMedia отсутствует).'
      );
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (firstErr: any) {
      console.warn('Advanced audio constraints failed, trying basic audio: true', firstErr);
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        console.error('Failed to get audio stream', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error(
            'Доступ к микрофону запрещён. Проверьте настройки разрешений браузера для этого сайта и обновите страницу.'
          );
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          throw new Error(
            'Микрофон не обнаружен в вашей системе. Подключите гарнитуру или микрофон к компьютеру.'
          );
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          throw new Error(
            'Микрофон занят другой программой (Discord, Zoom, Teams, запись звука). Закройте её и повторите.'
          );
        }
        throw new Error(err.message || 'Не удалось получить доступ к микрофону.');
      }
    }

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = true;
      audioTrack.onended = () => {
        this.localStream = null;
        this.isMicMuted = false;
        this.callbacks.onLocalStreamChange?.(null);
      };
    }

    this.localStream = stream;
    this.isMicMuted = false;
    this.callbacks.onLocalStreamChange?.(stream);

    for (const [peerId, { pc }] of this.connections) {
      try {
        const existingAudioSender = pc
          .getSenders()
          .find((s) => s.track && s.track.kind === 'audio');
        if (existingAudioSender && audioTrack) {
          await existingAudioSender.replaceTrack(audioTrack);
        } else if (audioTrack) {
          pc.addTrack(audioTrack, stream);
          await this.renegotiate(peerId, pc);
        }
      } catch (trackErr) {
        console.warn(`Failed to attach audio track to peer ${peerId}`, trackErr);
      }
    }

    return true;
  }

  public async toggleScreenShare(): Promise<boolean> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;

      for (const [peerId, { pc }] of this.connections) {
        const senders = pc.getSenders().filter((s) => s.track && s.track.kind === 'video');
        senders.forEach((s) => pc.removeTrack(s));
        await this.renegotiate(peerId, pc);
      }
      return false;
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        this.screenStream = stream;

        stream.getVideoTracks()[0].onended = () => {
          this.toggleScreenShare();
        };

        for (const [peerId, { pc }] of this.connections) {
          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
          });
          await this.renegotiate(peerId, pc);
        }
        return true;
      } catch (err) {
        console.error('Failed to get screen share', err);
        return false;
      }
    }
  }

  public removePeer(peerId: string) {
    const t = this.fallbackTimers.get(peerId);
    if (t) clearTimeout(t);
    this.fallbackTimers.delete(peerId);

    const bundle = this.connections.get(peerId);
    if (bundle) {
      bundle.controlChannel?.close();
      bundle.fileChannel?.close();
      bundle.pc.close();
      this.connections.delete(peerId);
    }
  }

  public destroy() {
    this.socket.off('relay-control-message');
    this.socket.off('relay-file-chunk');
    this.fallbackTimers.forEach((t) => clearTimeout(t));
    this.fallbackTimers.clear();

    this.cancelledTransfers.clear();
    this.connections.forEach((b) => {
      b.controlChannel?.close();
      b.fileChannel?.close();
      b.pc.close();
    });
    this.connections.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
      this.callbacks.onLocalStreamChange?.(null);
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
  }
}