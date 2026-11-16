import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Navbar } from './components/Navbar.js';
import { HomeView } from './components/HomeView.js';
import { RoomView } from './components/RoomView.js';
import { QRCodeModal } from './components/QRCodeModal.js';
import { FileTransfer, Peer, TextMessage, ThemeMode } from './types/index.js';
import { detectDeviceType, generateRandomName } from './utils/device.js';
import { WebRTCManager } from './services/webrtc.js';

export function App() {
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('airbridge_username') || generateRandomName();
  });
  const [deviceType] = useState(detectDeviceType());
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('airbridge_theme') as ThemeMode) || 'swiss';
  });

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');
  const [peers, setPeers] = useState<Peer[]>([]);
  const [transfers, setTransfers] = useState<FileTransfer[]>([]);
  const [messages, setMessages] = useState<TextMessage[]>([]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Media
  const [isMicActive, setIsMicActive] = useState(false);
  const [isScreenActive, setIsScreenActive] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const webrtcRef = useRef<WebRTCManager | null>(null);

  // Initialize Socket.io
  useEffect(() => {
    // In dev Vite proxies /socket.io, in production same origin
    const socketInstance = io({
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to signaling server:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Sync user name changes
  const handleUpdateUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('airbridge_username', name);
    if (webrtcRef.current) {
      webrtcRef.current.updateMyName(name);
    }
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme: ThemeMode =
      theme === 'swiss' ? 'cyberpunk' : theme === 'cyberpunk' ? 'lofi' : 'swiss';
    setTheme(nextTheme);
    localStorage.setItem('airbridge_theme', nextTheme);
  };

  // Setup WebRTC manager when entering room
  const setupWebRTC = (sock: Socket, myId: string) => {
    if (webrtcRef.current) {
      webrtcRef.current.destroy();
    }

    const manager = new WebRTCManager(sock, myId, userName, {
      onTextMessage: (msg) => {
        setMessages((prev) => [...prev, msg]);
      },
      onTransferProgress: (updated) => {
        setTransfers((prev) => {
          const index = prev.findIndex((t) => t.id === updated.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = { ...next[index], ...updated } as FileTransfer;
            return next;
          } else {
            return [updated as FileTransfer, ...prev];
          }
        });
      },
      onTransferComplete: (completed) => {
        setTransfers((prev) => {
          const index = prev.findIndex((t) => t.id === completed.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = completed;
            return next;
          }
          return [completed, ...prev];
        });
      },
      onRemoteStream: (_peerId, stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          setHasRemoteVideo(true);
        }
      },
      onPeerConnectionStateChange: (peerId, state) => {
        console.log(`Peer ${peerId} state changed to ${state}`);
      },
    });

    webrtcRef.current = manager;
    return manager;
  };

  // Listen to socket room events
  useEffect(() => {
    if (!socket) return;

    socket.on('peer-joined', (newPeer: Peer) => {
      setPeers((prev) => {
        if (prev.some((p) => p.id === newPeer.id)) return prev;
        return [...prev, newPeer];
      });

      // Existing peer initiates WebRTC connection
      if (webrtcRef.current) {
        webrtcRef.current.connectToPeer(newPeer.id, true);
      }
    });

    socket.on('peer-left', ({ peerId }: { peerId: string }) => {
      setPeers((prev) => prev.filter((p) => p.id !== peerId));
      if (webrtcRef.current) {
        webrtcRef.current.removePeer(peerId);
      }
    });

    socket.on('signal', ({ from, payload }: { from: string; payload: any }) => {
      if (webrtcRef.current) {
        webrtcRef.current.handleSignal(from, payload);
      }
    });

    return () => {
      socket.off('peer-joined');
      socket.off('peer-left');
      socket.off('signal');
    };
  }, [socket]);

  // Check URL query parameters for auto-join
  useEffect(() => {
    if (!socket || !isConnected) return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && !roomId) {
      handleJoinRoom(roomParam);
    }
  }, [socket, isConnected]);

  // Create Room
  const handleCreateRoom = () => {
    if (!socket) return;
    setIsLoading(true);
    setErrorMessage(undefined);

    socket.emit(
      'create-room',
      {
        peerName: userName,
        deviceType,
      },
      (res: any) => {
        setIsLoading(false);
        if (res.success) {
          setRoomId(res.roomId);
          setPin(res.pin);
          setPeers(res.peers || []);
          setupWebRTC(socket, res.peerId);
          window.history.pushState({}, '', `?room=${res.pin}`);
        } else {
          setErrorMessage(res.error || 'Не удалось создать комнату');
        }
      }
    );
  };

  // Join Room by PIN or ID
  const handleJoinRoom = (pinOrId: string) => {
    if (!socket) return;
    setIsLoading(true);
    setErrorMessage(undefined);

    socket.emit(
      'join-room',
      {
        roomIdOrPin: pinOrId,
        peerName: userName,
        deviceType,
      },
      (res: any) => {
        setIsLoading(false);
        if (res.success) {
          setRoomId(res.roomId);
          setPin(res.pin);
          setPeers(res.peers || []);
          setupWebRTC(socket, res.peerId);
          window.history.pushState({}, '', `?room=${res.pin}`);
        } else {
          setErrorMessage(res.error || 'Комната не найдена');
        }
      }
    );
  };

  // Leave Room
  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    if (webrtcRef.current) {
      webrtcRef.current.destroy();
      webrtcRef.current = null;
    }
    setRoomId(null);
    setPin('');
    setPeers([]);
    setTransfers([]);
    setMessages([]);
    setIsMicActive(false);
    setIsScreenActive(false);
    setHasRemoteVideo(false);
    window.history.pushState({}, '', window.location.pathname);
  };

  // Send Files
  const handleSendFiles = (files: FileList | File[]) => {
    if (!webrtcRef.current) return;
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      webrtcRef.current?.sendFile(file);
    });
  };

  // Send Text
  const handleSendText = (text: string, isClipboard = false) => {
    if (!webrtcRef.current) return;
    webrtcRef.current.sendTextMessage(text, isClipboard);
  };

  // Cancel Transfer
  const handleCancelTransfer = (id: string) => {
    if (!webrtcRef.current) return;
    webrtcRef.current.cancelTransfer(id);
  };

  // Toggle Mic
  const handleToggleMic = async () => {
    if (!webrtcRef.current) return false;
    const active = await webrtcRef.current.toggleMicrophone();
    setIsMicActive(active);
    return active;
  };

  // Toggle Screen
  const handleToggleScreen = async () => {
    if (!webrtcRef.current) return false;
    const active = await webrtcRef.current.toggleScreenShare();
    setIsScreenActive(active);
    return active;
  };

  const roomUrl = typeof window !== 'undefined' ? `${window.location.origin}?room=${pin}` : '';

  // Theme Classes
  const getThemeWrapperClass = () => {
    switch (theme) {
      case 'cyberpunk':
        return 'bg-black text-emerald-400 font-mono selection:bg-emerald-500 selection:text-black';
      case 'lofi':
        return 'bg-[#181412] text-[#f2e9e4] font-sans selection:bg-amber-600 selection:text-white';
      default:
        return 'bg-neutral-950 text-neutral-100 font-sans selection:bg-cyan-500 selection:text-black';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${getThemeWrapperClass()}`}>
      <Navbar
        userName={userName}
        onUpdateUserName={handleUpdateUserName}
        deviceType={deviceType}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isConnected={isConnected}
        onGoHome={roomId ? handleLeaveRoom : undefined}
      />

      <main className="flex-1">
        {!roomId ? (
          <HomeView
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        ) : (
          <RoomView
            roomId={roomId}
            pin={pin}
            roomUrl={roomUrl}
            peers={peers}
            transfers={transfers}
            messages={messages}
            onSendFiles={handleSendFiles}
            onSendText={handleSendText}
            onCancelTransfer={handleCancelTransfer}
            onLeaveRoom={handleLeaveRoom}
            onOpenQR={() => setIsQRModalOpen(true)}
            onToggleMic={handleToggleMic}
            onToggleScreen={handleToggleScreen}
            remoteVideoRef={remoteVideoRef}
            isMicActive={isMicActive}
            isScreenActive={isScreenActive}
            hasRemoteVideo={hasRemoteVideo}
          />
        )}
      </main>

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        pin={pin}
        roomUrl={roomUrl}
      />
    </div>
  );
}
