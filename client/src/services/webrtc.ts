import { Socket } from 'socket.io-client';
import { FileTransfer, TextMessage, WebRTCMessage } from '../types/index.js';

const CHUNK_SIZE = 64 * 1024; // 64 KB (standard safe WebRTC SCTP packet size)
const READ_BLOCK_SIZE = 1024 * 1024; // 1 MB disk read block (reduces File API overhead by 16x)
const BUFFER_HIGH = 4 * 1024 * 1024; // 4 MB backpressure threshold (keeps SCTP pipeline saturated)
const BUFFER_LOW = 1024 * 1024; // 1 MB resume threshold
const HEADER_SIZE = 40; // 32 bytes fileId + 4 bytes chunkIndex + 4 bytes totalChunks
const LARGE_FILE_THRESHOLD = 200 * 1024 * 1024; // 200 MB: files above this offer direct-to-disk streaming

export function normalizeMimeType(fileName: string, mime?: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  if (ext === 'mov') return 'video/mp4'; // Chromium natively decodes H.264 MOV as MP4 container
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
      // Re-type .mov to video/mp4 so Chromium's native MP4 hardware parser decodes it directly
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

  // Optional custom TURN config via window or localStorage (for corporate firewalls / Symmetric NAT)
  if (typeof window !== 'undefined') {
    const customTurn = (window as any).__AIRBRIDGE_TURN_CONFIG || localStorage.getItem('bridgik_turn_config');
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

async function getFileHandleFromPath(dirHandle: any, relativePath: string): Promise<any> {
  const parts = relativePath.split('/').filter(Boolean);
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
}

export interface WebRTCCallbacks {
  onTextMessage: (msg: TextMessage) => void;
  onTransferProgress: (transfer: Partial<FileTransfer> & { id: string }) => void;
  onTransferComplete: (transfer: FileTransfer) => void;
  onRemoteStream: (peerId: string, stream: MediaStream) => void;
  onPeerConnectionStateChange: (peerId: string, state: RTCPeerConnectionState) => void;
  onConnectionTypeChange?: (peerId: string, connectionType: 'direct' | 'relay') => void;
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

  // Receiving file states: fileId -> state
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

  // Pending offers for large files awaiting receiver acceptance
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

  // Pending outgoing files awaiting receiver approval
  private pendingOutgoingFiles: Map<string, { file: File; targetPeerId?: string }> = new Map();

  // Active outgoing transfer cancellations
  private cancelledTransfers: Set<string> = new Set();

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
    };
    this.connections.set(targetPeerId, bundle);

    // ICE Candidate handling
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

    // Detect direct P2P vs TURN Relay connection
    pc.oniceconnectionstatechange = async () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        const type = await this.checkConnectionType(targetPeerId);
        bundle.connectionType = type;
        this.callbacks.onConnectionTypeChange?.(targetPeerId, type);
      }
    };

    // Remote Audio/Video Track handling
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.callbacks.onRemoteStream(targetPeerId, event.streams[0]);
      } else if (event.track) {
        const stream = new MediaStream([event.track]);
        this.callbacks.onRemoteStream(targetPeerId, stream);
      }
    };

    // Add local tracks if active with voice priority
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
      // Create Data Channels with explicit SCTP priority: control=high, files=low (protects Opus audio)
      const controlChannel = pc.createDataChannel('airbridge-control', { ordered: true, priority: 'high' } as any);
      const fileChannel = pc.createDataChannel('airbridge-files', { ordered: true, priority: 'low' } as any);
      fileChannel.binaryType = 'arraybuffer';

      bundle.controlChannel = controlChannel;
      bundle.fileChannel = fileChannel;

      this.setupControlChannel(controlChannel, targetPeerId);
      this.setupFileChannel(fileChannel, targetPeerId);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.socket.emit('signal', {
        to: targetPeerId,
        payload: { sdp: pc.localDescription },
      });
    } else {
      // Non-initiator waits for datachannel
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
      // If we received an offer and haven't created pc yet
      await this.connectToPeer(fromPeerId, false);
      bundle = this.connections.get(fromPeerId);
      if (!bundle) return;
    }

    const { pc } = bundle;

    if (payload.sdp) {
      try {
        if (payload.sdp.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          this.socket.emit('signal', {
            to: fromPeerId,
            payload: { sdp: pc.localDescription },
          });
        } else if (payload.sdp.type === 'answer') {
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          }
        }
      } catch (sdpErr) {
        console.warn('Error applying SDP signal', sdpErr);
      }
    } else if (payload.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (e) {
        console.warn('Error adding ICE candidate', e);
      }
    }
  }

  private setupControlChannel(channel: RTCDataChannel, peerId: string) {
    channel.onopen = () => {
      console.log(`Control channel open with ${peerId}`);
    };

    channel.onmessage = (event) => {
      try {
        const msg: WebRTCMessage = JSON.parse(event.data);
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
          });
        } else if (msg.type === 'SCRATCHPAD_SYNC') {
          this.callbacks.onScratchpadSync?.(msg.text, msg.updatedBy);
        } else if (msg.type === 'SCRATCHPAD_TYPING') {
          this.callbacks.onScratchpadTyping?.(msg.updatedBy);
        } else if (msg.type === 'FILE_OFFER') {
          // Large file offer from peer
          this.pendingOffers.set(msg.fileId, { meta: msg, peerId });

          if (this.destinationDirectoryHandle) {
            // Target folder configured: auto-accept directly into disk directory!
            this.acceptIncomingFileWithDirectory(msg.fileId, this.destinationDirectoryHandle);
          } else {
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
          // Receiver accepted large file transfer
          const pending = this.pendingOutgoingFiles.get(msg.fileId);
          if (pending) {
            this.pendingOutgoingFiles.delete(msg.fileId);
            this.startStreamingFile(pending.file, msg.fileId, pending.targetPeerId);
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
            // Already initialized via direct-to-disk acceptIncomingFile
            existing.meta.totalChunks = msg.totalChunks;
            existing.meta.chunkSize = msg.chunkSize;
          } else if (this.destinationDirectoryHandle) {
            // Destination directory configured: stream all incoming files directly to disk!
            const totalChunks = msg.totalChunks;
            const incomingState: any = {
              meta: msg,
              peerId,
              streamToDisk: true,
              writableStream: undefined,
              writeQueue: Promise.resolve(),
              receivedChunks: [],
              receivedCount: 0,
              receivedBytes: 0,
              lastProgressUpdate: Date.now(),
              lastBytesTransferred: 0,
              speed: 0,
            };

            incomingState.initPromise = (async () => {
              try {
                const fileHandle = await getFileHandleFromPath(this.destinationDirectoryHandle, msg.name);
                incomingState.writableStream = await fileHandle.createWritable();
              } catch (err) {
                console.warn('Direct to disk init failed, falling back to in-memory', err);
                incomingState.streamToDisk = false;
                incomingState.receivedChunks = new Array(totalChunks);
              }
            })();

            this.incomingFiles.set(msg.fileId, incomingState);
          } else {
            // In-memory Blob flow
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
            progress: 0,
            speed: 0,
            status: 'transferring',
          });
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
    };
  }

  private setupFileChannel(channel: RTCDataChannel, peerId: string) {
    channel.onopen = () => {
      console.log(`File channel open with ${peerId}`);
    };

    channel.onmessage = async (event) => {
      if (typeof event.data === 'string') return;
      const buffer = event.data as ArrayBuffer;
      if (buffer.byteLength < HEADER_SIZE) return;

      const headerView = new DataView(buffer);
      // Read 32-byte fileId
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
        // Stream directly to disk! 0 MB RAM accumulation!
        incoming.receivedCount++;
        incoming.receivedBytes += chunkData.byteLength;

        // Chain write promises sequentially to maintain exact file order
        incoming.writeQueue = (incoming.writeQueue || Promise.resolve()).then(async () => {
          if (incoming.initPromise) {
            await incoming.initPromise;
          }
          if (incoming.writableStream) {
            await incoming.writableStream.write(chunkData);
          }
        });
      } else {
        // In-memory array flow
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

        const progress = Math.min(100, Math.round((incoming.receivedBytes / incoming.meta.size) * 100));
        this.callbacks.onTransferProgress({
          id: fileId,
          progress,
          speed: incoming.speed,
          status: 'transferring',
          savedToDisk: incoming.streamToDisk,
        });
      }

      // Check if file is completely received
      if (incoming.receivedCount === totalChunks) {
        if (incoming.streamToDisk) {
          try {
            await (incoming.writeQueue || Promise.resolve());
            if (incoming.initPromise) {
              await incoming.initPromise;
            }
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

          // Clear chunks array immediately to free RAM
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
    };
  }

  /**
   * Send text or clipboard message to all connected peers
   */
  public sendTextMessage(text: string, isClipboard = false) {
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
    };

    const payload = JSON.stringify(msg);
    this.connections.forEach(({ controlChannel }) => {
      if (controlChannel && controlChannel.readyState === 'open') {
        controlChannel.send(payload);
      }
    });

    // Also trigger local message callback so sender sees it
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
    });
  }

  /**
   * Send shared scratchpad update to connected peers in Meeting mode
   */
  public sendScratchpadUpdate(text: string) {
    const msg: WebRTCMessage = {
      type: 'SCRATCHPAD_SYNC',
      text,
      updatedBy: this.myName,
      timestamp: Date.now(),
    };
    const payload = JSON.stringify(msg);
    this.connections.forEach(({ controlChannel }) => {
      if (controlChannel && controlChannel.readyState === 'open') {
        controlChannel.send(payload);
      }
    });
  }

  /**
   * Broadcast typing status in Canvas
   */
  public sendScratchpadTyping() {
    const msg: WebRTCMessage = {
      type: 'SCRATCHPAD_TYPING',
      updatedBy: this.myName,
      timestamp: Date.now(),
    };
    const payload = JSON.stringify(msg);
    this.connections.forEach(({ controlChannel }) => {
      if (controlChannel && controlChannel.readyState === 'open') {
        controlChannel.send(payload);
      }
    });
  }

  /**
   * Determine whether connection with peer is direct P2P (host/srflx) or relayed via TURN
   */
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

  /**
   * Send file to connected peers.
   * If file is large (>= 200MB), sends a FILE_OFFER first so receiver can stream directly to disk.
   */
  public async sendFile(file: File, targetPeerId?: string) {
    const fileId = Math.random().toString(36).substring(2, 12);
    const senderBlobUrl = createMediaBlobUrl(file);

    // Filter target channels
    const activeBundles: PeerConnectionBundle[] = [];
    if (targetPeerId && this.connections.has(targetPeerId)) {
      activeBundles.push(this.connections.get(targetPeerId)!);
    } else {
      this.connections.forEach((bundle) => {
        if (bundle.fileChannel?.readyState === 'open') {
          activeBundles.push(bundle);
        }
      });
    }

    if (activeBundles.length === 0) {
      // In room / standalone mode: stage file locally so sender can preview, inspect, and listen immediately
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

    // Check if large file: ask receiver first to stream directly to disk
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
      const offerStr = JSON.stringify(offerMsg);

      activeBundles.forEach((b) => {
        if (b.controlChannel?.readyState === 'open') {
          b.controlChannel.send(offerStr);
        }
      });
      return;
    }

    // Normal files (< 200MB) start immediately
    await this.startStreamingFile(file, fileId, targetPeerId);
  }

  /**
   * Internal streaming pipeline: 1MB disk read buffer + 4MB backpressure window
   */
  private async startStreamingFile(file: File, fileId: string, targetPeerId?: string) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    const activeBundles: PeerConnectionBundle[] = [];
    if (targetPeerId && this.connections.has(targetPeerId)) {
      activeBundles.push(this.connections.get(targetPeerId)!);
    } else {
      this.connections.forEach((bundle) => {
        if (bundle.fileChannel?.readyState === 'open') {
          activeBundles.push(bundle);
        }
      });
    }

    // 1. Send FILE_META message
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
    const metaStr = JSON.stringify(metaMsg);

    activeBundles.forEach((b) => {
      if (b.controlChannel && b.controlChannel.readyState === 'open') {
        b.controlChannel.send(metaStr);
      }
    });

    const senderBlobUrl = createMediaBlobUrl(file);

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

    // 2. Prepare binary header buffer
    // 32 bytes ASCII fileId
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
        activeBundles.forEach((b) => {
          if (b.controlChannel?.readyState === 'open') {
            b.controlChannel.send(JSON.stringify({ type: 'FILE_CANCEL', fileId }));
          }
        });
        this.cancelledTransfers.delete(fileId);
        this.callbacks.onTransferProgress({ id: fileId, status: 'cancelled' });
        return;
      }

      // Read a 1MB block from disk to avoid 20,000+ async slice calls
      const blockEnd = Math.min(fileOffset + READ_BLOCK_SIZE, file.size);
      const blockSlice = file.slice(fileOffset, blockEnd);
      const blockBuffer = await blockSlice.arrayBuffer();
      let blockOffset = 0;

      while (blockOffset < blockBuffer.byteLength) {
        if (this.cancelledTransfers.has(fileId)) {
          activeBundles.forEach((b) => {
            if (b.controlChannel?.readyState === 'open') {
              b.controlChannel.send(JSON.stringify({ type: 'FILE_CANCEL', fileId }));
            }
          });
          this.cancelledTransfers.delete(fileId);
          this.callbacks.onTransferProgress({ id: fileId, status: 'cancelled' });
          return;
        }

        // Voice Priority: throttle file transfer buffer when microphone or call is active to eliminate Opus audio lag
        const isVoiceCallActive = Boolean(this.localStream && !this.isMicMuted);
        const dynamicBufferHigh = isVoiceCallActive ? 512 * 1024 : BUFFER_HIGH;
        const dynamicBufferLow = isVoiceCallActive ? 128 * 1024 : BUFFER_LOW;

        // Check backpressure across channels: pause when buffer exceeds threshold
        for (const b of activeBundles) {
          if (b.fileChannel && b.fileChannel.bufferedAmount > dynamicBufferHigh) {
            await new Promise<void>((resolve) => {
              if (!b.fileChannel) return resolve();
              b.fileChannel.bufferedAmountLowThreshold = dynamicBufferLow;
              b.fileChannel.onbufferedamountlow = () => {
                if (b.fileChannel) b.fileChannel.onbufferedamountlow = null;
                resolve();
              };
            });
          }
        }

        // When voice is active, yield event loop every 16 chunks (~1MB) to ensure zero Opus audio packet jitter
        if (isVoiceCallActive && chunkIndex % 16 === 0) {
          await new Promise<void>((r) => setTimeout(r, 2));
        }

        const currentChunkSize = Math.min(CHUNK_SIZE, blockBuffer.byteLength - blockOffset);

        // Construct packet: Header (40 bytes) + Chunk Data
        const packet = new Uint8Array(HEADER_SIZE + currentChunkSize);
        packet.set(fileIdBytes, 0);

        const view = new DataView(packet.buffer);
        view.setUint32(32, chunkIndex);
        view.setUint32(36, totalChunks);
        packet.set(new Uint8Array(blockBuffer, blockOffset, currentChunkSize), HEADER_SIZE);

        // Send to all targets
        for (const b of activeBundles) {
          if (b.fileChannel?.readyState === 'open') {
            b.fileChannel.send(packet.buffer);
          }
        }

        blockOffset += currentChunkSize;
        chunkIndex++;
        bytesSent += currentChunkSize;

        // Update progress & speed periodically
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

  /**
   * Accept an incoming file offer.
   * If browser supports showSaveFilePicker, stream chunks directly to disk so RAM usage is 0 MB.
   */
  public async acceptIncomingFile(fileId: string): Promise<boolean> {
    const offer = this.pendingOffers.get(fileId);
    if (!offer) return false;

    let streamToDisk = false;
    let writableStream: any = undefined;

    // Direct-to-disk streaming via File System Access API
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: offer.meta.name,
        });
        writableStream = await handle.createWritable();
        streamToDisk = true;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User cancelled file picker dialog
          return false;
        }
        console.warn('File picker failed, falling back to memory', err);
      }
    }

    const totalChunks = Math.ceil(offer.meta.size / CHUNK_SIZE);

    // Pre-initialize incomingFiles with disk stream
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

    // Send FILE_ACCEPT to sender
    const acceptMsg: WebRTCMessage = {
      type: 'FILE_ACCEPT',
      fileId,
      streamToDisk,
    };
    const payload = JSON.stringify(acceptMsg);

    const bundle = this.connections.get(offer.peerId);
    if (bundle?.controlChannel?.readyState === 'open') {
      bundle.controlChannel.send(payload);
    }

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

  /**
   * Automatically accept incoming offer using preconfigured destination folder
   */
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
      console.warn('Direct directory write failed, falling back to prompt/memory', err);
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

    // Send FILE_ACCEPT to sender
    const acceptMsg: WebRTCMessage = {
      type: 'FILE_ACCEPT',
      fileId,
      streamToDisk,
    };
    const payload = JSON.stringify(acceptMsg);

    const bundle = this.connections.get(offer.peerId);
    if (bundle?.controlChannel?.readyState === 'open') {
      bundle.controlChannel.send(payload);
    }

    this.callbacks.onTransferProgress({
      id: fileId,
      status: 'transferring',
      savedToDisk: streamToDisk,
    });

    return true;
  }

  /**
   * Reject an incoming file offer
   */
  public rejectIncomingFile(fileId: string) {
    const offer = this.pendingOffers.get(fileId);
    if (!offer) return;

    const rejectMsg: WebRTCMessage = {
      type: 'FILE_REJECT',
      fileId,
    };
    const payload = JSON.stringify(rejectMsg);

    const bundle = this.connections.get(offer.peerId);
    if (bundle?.controlChannel?.readyState === 'open') {
      bundle.controlChannel.send(payload);
    }

    this.pendingOffers.delete(fileId);
    this.callbacks.onTransferProgress({
      id: fileId,
      status: 'cancelled',
    });
  }

  public cancelTransfer(fileId: string) {
    this.cancelledTransfers.add(fileId);
  }

  private async renegotiate(peerId: string, pc: RTCPeerConnection) {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket.emit('signal', {
        to: peerId,
        payload: { sdp: pc.localDescription },
      });
    } catch (err) {
      console.warn(`Renegotiation failed with peer ${peerId}`, err);
    }
  }

  /**
   * Audio/Voice call toggle (live P2P microphone with instant mute/unmute and error diagnostics)
   */
  public async toggleMicrophone(): Promise<boolean> {
    // 1. If we already have an active stream, toggle mute/unmute seamlessly
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks().filter((t) => t.readyState === 'live');
      if (audioTracks.length > 0) {
        if (!this.isMicMuted) {
          // MUTE
          audioTracks.forEach((track) => {
            track.enabled = false;
          });
          this.isMicMuted = true;
          return false;
        } else {
          // UNMUTE
          audioTracks.forEach((track) => {
            track.enabled = true;
          });
          this.isMicMuted = false;
          return true;
        }
      } else {
        // Tracks were closed externally or ended
        this.localStream = null;
        this.isMicMuted = false;
      }
    }

    // 2. Validate browser environment for microphone access
    if (typeof window !== 'undefined') {
      const isSecure =
        window.isSecureContext ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      if (!isSecure && window.location.protocol === 'http:') {
        throw new Error(
          'Браузер блокирует доступ к микрофону по незащищенному HTTP. Откройте страницу через http://localhost:5173 или настройте HTTPS.'
        );
      }
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error(
        'Ваш браузер не поддерживает доступ к микрофону (navigator.mediaDevices.getUserMedia отсутствует).'
      );
    }

    // 3. Check permission status proactively if available
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permStatus.state === 'denied') {
          throw new Error(
            'Доступ к микрофону заблокирован в браузере. Нажмите на значок замочка/настроек в адресной строке и включите «Микрофон: Разрешить», затем перезагрузите страницу.'
          );
        }
      } catch (pErr: any) {
        if (pErr.message && pErr.message.includes('заблокирован')) {
          throw pErr;
        }
      }
    }

    // 4. Request microphone access with high quality audio & robust fallbacks
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
            'Доступ к микрофону запрещен в браузере. Нажмите на значок замочка/настроек в строке адреса и выберите «Микрофон: Разрешить».'
          );
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          throw new Error('Микрофон не обнаружен в вашей системе. Подключите гарнитуру или микрофон к компьютеру.');
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
      };
    }

    this.localStream = stream;
    this.isMicMuted = false;

    // 5. Connect stream to all active peer connections safely
    for (const [peerId, { pc }] of this.connections) {
      try {
        const existingAudioSender = pc.getSenders().find(
          (s) => s.track && s.track.kind === 'audio'
        );
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

  /**
   * Screen sharing toggle (live 60fps screen/tab/window P2P broadcast)
   */
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
    const bundle = this.connections.get(peerId);
    if (bundle) {
      bundle.controlChannel?.close();
      bundle.fileChannel?.close();
      bundle.pc.close();
      this.connections.delete(peerId);
    }
  }

  public destroy() {
    this.cancelledTransfers.clear();
    this.connections.forEach((b) => {
      b.controlChannel?.close();
      b.fileChannel?.close();
      b.pc.close();
    });
    this.connections.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
    }
  }
}
