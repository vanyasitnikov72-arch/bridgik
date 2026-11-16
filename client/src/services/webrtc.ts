import { Socket } from 'socket.io-client';
import { FileTransfer, TextMessage, WebRTCMessage } from '../types/index.js';

const CHUNK_SIZE = 64 * 1024; // 64 KB (standard safe WebRTC SCTP packet size)
const READ_BLOCK_SIZE = 1024 * 1024; // 1 MB disk read block (reduces File API overhead by 16x)
const BUFFER_HIGH = 4 * 1024 * 1024; // 4 MB backpressure threshold (keeps SCTP pipeline saturated)
const BUFFER_LOW = 1024 * 1024; // 1 MB resume threshold
const HEADER_SIZE = 40; // 32 bytes fileId + 4 bytes chunkIndex + 4 bytes totalChunks

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ],
};

interface PeerConnectionBundle {
  pc: RTCPeerConnection;
  controlChannel: RTCDataChannel | null;
  fileChannel: RTCDataChannel | null;
}

export interface WebRTCCallbacks {
  onTextMessage: (msg: TextMessage) => void;
  onTransferProgress: (transfer: Partial<FileTransfer> & { id: string }) => void;
  onTransferComplete: (transfer: FileTransfer) => void;
  onRemoteStream: (peerId: string, stream: MediaStream) => void;
  onPeerConnectionStateChange: (peerId: string, state: RTCPeerConnectionState) => void;
}

export class WebRTCManager {
  private socket: Socket;
  private myPeerId: string;
  private myName: string;
  private callbacks: WebRTCCallbacks;
  private connections: Map<string, PeerConnectionBundle> = new Map();
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;

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
        senderName: string;
      };
      peerId: string;
      receivedChunks: (Uint8Array | undefined)[];
      receivedCount: number;
      receivedBytes: number;
      lastProgressUpdate: number;
      lastBytesTransferred: number;
      speed: number;
    }
  > = new Map();

  // Active outgoing transfer cancellations
  private cancelledTransfers: Set<string> = new Set();

  constructor(socket: Socket, myPeerId: string, myName: string, callbacks: WebRTCCallbacks) {
    this.socket = socket;
    this.myPeerId = myPeerId;
    this.myName = myName;
    this.callbacks = callbacks;
  }

  public updateMyName(name: string) {
    this.myName = name;
  }

  public async connectToPeer(targetPeerId: string, isInitiator: boolean) {
    if (this.connections.has(targetPeerId)) {
      return;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    const bundle: PeerConnectionBundle = {
      pc,
      controlChannel: null,
      fileChannel: null,
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

    // Remote Audio/Video Track handling
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.callbacks.onRemoteStream(targetPeerId, event.streams[0]);
      }
    };

    // Add local tracks if active
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => pc.addTrack(track, this.localStream!));
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => pc.addTrack(track, this.screenStream!));
    }

    if (isInitiator) {
      // Create Data Channels
      const controlChannel = pc.createDataChannel('airbridge-control', { ordered: true });
      const fileChannel = pc.createDataChannel('airbridge-files', { ordered: true });
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
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      if (payload.sdp.type === 'offer') {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.socket.emit('signal', {
          to: fromPeerId,
          payload: { sdp: pc.localDescription },
        });
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
            text: msg.text,
            timestamp: msg.timestamp,
            isClipboard: msg.isClipboard,
          });
        } else if (msg.type === 'FILE_META') {
          this.incomingFiles.set(msg.fileId, {
            meta: msg,
            peerId,
            receivedChunks: new Array(msg.totalChunks),
            receivedCount: 0,
            receivedBytes: 0,
            lastProgressUpdate: Date.now(),
            lastBytesTransferred: 0,
            speed: 0,
          });

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
          this.incomingFiles.delete(msg.fileId);
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

    channel.onmessage = (event) => {
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

      if (!incoming.receivedChunks[chunkIndex]) {
        incoming.receivedChunks[chunkIndex] = chunkData;
        incoming.receivedCount++;
        incoming.receivedBytes += chunkData.byteLength;
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
        });
      }

      // Check if file is completely received
      if (incoming.receivedCount === totalChunks) {
        const blob = new Blob(incoming.receivedChunks as BlobPart[], {
          type: incoming.meta.mimeType || 'application/octet-stream',
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
      text,
      timestamp: msg.timestamp,
      isClipboard,
    });
  }

  /**
   * Send file to connected peers using chunked streaming with backpressure
   */
  public async sendFile(file: File, targetPeerId?: string) {
    const fileId = Math.random().toString(36).substring(2, 12);
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Prepare transfer record for sender
    const initialTransfer: FileTransfer = {
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
    };
    this.callbacks.onTransferProgress(initialTransfer);

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
      this.callbacks.onTransferProgress({
        id: fileId,
        status: 'error',
        error: 'Нет активных подключений для отправки файла',
      });
      return;
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

        // Check backpressure across channels: pause only when buffer exceeds 4MB
        for (const b of activeBundles) {
          if (b.fileChannel && b.fileChannel.bufferedAmount > BUFFER_HIGH) {
            await new Promise<void>((resolve) => {
              if (!b.fileChannel) return resolve();
              b.fileChannel.bufferedAmountLowThreshold = BUFFER_LOW;
              b.fileChannel.onbufferedamountlow = () => {
                if (b.fileChannel) b.fileChannel.onbufferedamountlow = null;
                resolve();
              };
            });
          }
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
    });
  }

  public cancelTransfer(fileId: string) {
    this.cancelledTransfers.add(fileId);
  }

  /**
   * Audio/Voice call toggle
   */
  public async toggleMicrophone(): Promise<boolean> {
    if (this.localStream) {
      // Stop and remove audio
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
      return false;
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.localStream = stream;
        stream.getTracks().forEach((track) => {
          this.connections.forEach(({ pc }) => {
            pc.addTrack(track, stream);
          });
        });
        return true;
      } catch (err) {
        console.error('Failed to get audio', err);
        return false;
      }
    }
  }

  /**
   * Screen sharing toggle
   */
  public async toggleScreenShare(): Promise<boolean> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
      return false;
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        this.screenStream = stream;
        stream.getVideoTracks()[0].onended = () => {
          this.screenStream = null;
        };
        stream.getTracks().forEach((track) => {
          this.connections.forEach(({ pc }) => {
            pc.addTrack(track, stream);
          });
        });
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
