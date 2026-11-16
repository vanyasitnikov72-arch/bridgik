import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Navbar } from './components/Navbar.js';
import { HomeView } from './components/HomeView.js';
import { RoomView } from './components/RoomView.js';
import { MeetingHomeView } from './components/MeetingHomeView.js';
import { MeetingRoomView } from './components/MeetingRoomView.js';
import { AboutView } from './components/AboutView.js';
import { QRCodeModal } from './components/QRCodeModal.js';
import { Footer } from './components/Footer.js';
import { FileTransfer, Peer, TextMessage, ThemeMode, NearbyPeer, PairRequest, AppTab, RoomMode } from './types/index.js';
import { detectDeviceType, generateRandomName } from './utils/device.js';
import { WebRTCManager } from './services/webrtc.js';
import { sound } from './utils/sound.js';

export function App() {
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('bridgik_username') || localStorage.getItem('bridgit_username') || localStorage.getItem('airbridge_username') || generateRandomName();
  });
  const [deviceType] = useState(detectDeviceType());
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('airbridge_theme') as ThemeMode) || 'swiss';
  });

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AppTab>('bridge');
  const [roomMode, setRoomMode] = useState<RoomMode>('bridge');
  const [scratchpadText, setScratchpadText] = useState<string>('');
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [peers, setPeers] = useState<Peer[]>([]);
  const [transfers, setTransfers] = useState<FileTransfer[]>([]);
  const [messages, setMessages] = useState<TextMessage[]>([]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Local Wi-Fi Discovery (Radar) & Auto-Download
  const [nearbyPeers, setNearbyPeers] = useState<NearbyPeer[]>([]);
  const [incomingPairRequest, setIncomingPairRequest] = useState<PairRequest | null>(null);
  const [isPairing, setIsPairing] = useState(false);
  const [lanIp, setLanIp] = useState<string | null>(null);
  const [destinationDirName, setDestinationDirName] = useState<string | null>(null);
  const destinationDirHandleRef = useRef<any>(null);
  const [autoDownload, setAutoDownload] = useState<boolean>(() => {
    return localStorage.getItem('bridgik_auto_download') !== 'false' && localStorage.getItem('bridgit_auto_download') !== 'false';
  });

  // Media
  const [isMicActive, setIsMicActive] = useState(false);
  const [isScreenActive, setIsScreenActive] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Fetch local network IP for mobile device pairing
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (data?.lanIp && data.lanIp !== '127.0.0.1') {
          setLanIp(data.lanIp);
        }
      })
      .catch(() => {});
  }, []);

  // Sync user name changes
  const handleUpdateUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('bridgik_username', name);
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
        sound.playMessage();
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
        sound.playTransferComplete();

        // Auto-download for completed in-memory downloads if enabled
        if (completed.type === 'download' && completed.blobUrl && !completed.savedToDisk) {
          const isAuto = localStorage.getItem('bridgit_auto_download') !== 'false';
          if (isAuto) {
            try {
              const a = document.createElement('a');
              a.href = completed.blobUrl;
              a.download = completed.name;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } catch (err) {
              console.warn('Auto download error', err);
            }
          }
        }

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
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        if (videoTracks.length > 0 && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          setHasRemoteVideo(true);
          videoTracks[0].onended = () => {
            setHasRemoteVideo(false);
          };
        }

        if (audioTracks.length > 0 && remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
          remoteAudioRef.current.play().catch(() => {});
        }
      },
      onPeerConnectionStateChange: (peerId, state) => {
        console.log(`Peer ${peerId} state changed to ${state}`);
      },
      onScratchpadSync: (text) => {
        setScratchpadText(text);
      },
    });

    if (destinationDirHandleRef.current) {
      manager.setDestinationDirectory(destinationDirHandleRef.current);
    }

    webrtcRef.current = manager;
    return manager;
  };

  // Listen to socket room events
  useEffect(() => {
    if (!socket) return;

    socket.on('peer-joined', (newPeer: Peer) => {
      sound.playConnect();
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

  // Local Wi-Fi Discovery (Radar on HomeView)
  useEffect(() => {
    if (!socket || !isConnected || roomId) return;

    socket.emit('lobby-join', {
      name: userName,
      deviceType,
    });

    const handleNearby = (peers: NearbyPeer[]) => {
      setNearbyPeers(peers);
    };

    const handleIncomingPair = (req: PairRequest) => {
      sound.playMessage();
      setIncomingPairRequest(req);
    };

    const handlePairResult = (res: { roomId: string; pin: string; accepted: boolean }) => {
      setIsPairing(false);
      if (res.accepted) {
        sound.playConnect();
        handleJoinRoom(res.roomId);
      } else {
        setErrorMessage('Устройство отклонило запрос на передачу файлов');
      }
    };

    socket.on('nearby-peers', handleNearby);
    socket.on('incoming-pair-request', handleIncomingPair);
    socket.on('direct-pair-result', handlePairResult);

    return () => {
      socket.emit('lobby-leave');
      socket.off('nearby-peers', handleNearby);
      socket.off('incoming-pair-request', handleIncomingPair);
      socket.off('direct-pair-result', handlePairResult);
    };
  }, [socket, isConnected, roomId, userName, deviceType]);

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
  const handleCreateRoom = (mode: RoomMode = 'bridge') => {
    if (!socket) return;
    setIsLoading(true);
    setErrorMessage(undefined);
    setRoomMode(mode);
    setActiveTab(mode);

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
          setMyPeerId(res.peerId);
          setPeers(res.peers || []);
          setupWebRTC(socket, res.peerId);
          window.history.pushState({}, '', `?room=${res.pin}`);
        } else {
          setErrorMessage(res.error || 'Не удалось создать комнату');
        }
      }
    );
  };

  // Pair via local radar in 1 click
  const handlePairWithNearby = (targetSocketId: string) => {
    if (!socket) return;
    setIsPairing(true);
    setErrorMessage(undefined);
    socket.emit('direct-pair-request', {
      toSocketId: targetSocketId,
      myName: userName,
      myDevice: deviceType,
    });
  };

  const handleAcceptPair = () => {
    if (!socket || !incomingPairRequest) return;
    const req = incomingPairRequest;
    socket.emit('direct-pair-response', {
      toSocketId: req.fromSocketId,
      roomId: req.roomId,
      pin: req.pin,
      accepted: true,
    });
    setIncomingPairRequest(null);
    handleJoinRoom(req.roomId);
  };

  const handleRejectPair = () => {
    if (!socket || !incomingPairRequest) return;
    const req = incomingPairRequest;
    socket.emit('direct-pair-response', {
      toSocketId: req.fromSocketId,
      roomId: req.roomId,
      pin: req.pin,
      accepted: false,
    });
    setIncomingPairRequest(null);
  };

  const handleToggleAutoDownload = () => {
    setAutoDownload((prev) => {
      const next = !prev;
      localStorage.setItem('bridgik_auto_download', String(next));
      return next;
    });
  };
  const handleCreateMeeting = () => {
    handleCreateRoom('meeting');
  };

  const handleJoinRoom = (pinOrId: string, mode?: RoomMode) => {
    if (!socket) return;
    setIsLoading(true);
    setErrorMessage(undefined);
    const targetMode = mode || (activeTab === 'meeting' ? 'meeting' : 'bridge');
    setRoomMode(targetMode);
    setActiveTab(targetMode);

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
          setMyPeerId(res.peerId);
          setPeers(res.peers || []);
          setupWebRTC(socket, res.peerId);
          window.history.pushState({}, '', `?room=${res.pin}`);
        } else {
          setErrorMessage(res.error || 'Комната не найдена');
        }
      }
    );
  };

  const handlePickDestinationDir = async () => {
    if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
      alert(
        'Ваш браузер не поддерживает выбор папки на диске. Используйте Google Chrome, Microsoft Edge или Яндекс Браузер.'
      );
      return;
    }
    try {
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      });
      destinationDirHandleRef.current = handle;
      setDestinationDirName(handle.name);
      if (webrtcRef.current) {
        webrtcRef.current.setDestinationDirectory(handle);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('showDirectoryPicker error', err);
      }
    }
  };

  const handleClearDestinationDir = () => {
    destinationDirHandleRef.current = null;
    setDestinationDirName(null);
    if (webrtcRef.current) {
      webrtcRef.current.setDestinationDirectory(null);
    }
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
    setMyPeerId('');
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

  // Shared Scratchpad update
  const handleUpdateScratchpad = (text: string) => {
    setScratchpadText(text);
    if (webrtcRef.current) {
      webrtcRef.current.sendScratchpadUpdate(text);
    }
  };

  // Cancel Transfer
  const handleCancelTransfer = (id: string) => {
    if (!webrtcRef.current) return;
    webrtcRef.current.cancelTransfer(id);
  };

  // Accept large file (pick folder and stream to disk)
  const handleAcceptFile = async (fileId: string) => {
    if (webrtcRef.current) {
      await webrtcRef.current.acceptIncomingFile(fileId);
    }
  };

  // Reject large file
  const handleRejectFile = (fileId: string) => {
    if (webrtcRef.current) {
      webrtcRef.current.rejectIncomingFile(fileId);
    }
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

  const roomUrl = (() => {
    if (typeof window === 'undefined') return '';
    const isLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost && lanIp) {
      return `${window.location.protocol}//${lanIp}:${window.location.port}?room=${pin}`;
    }
    return `${window.location.origin}?room=${pin}`;
  })();

  // Theme Classes
  const getThemeWrapperClass = () => {
    switch (theme) {
      case 'cyberpunk':
        return 'bg-black text-emerald-400 font-mono selection:bg-emerald-500 selection:text-black';
      case 'lofi':
        return 'bg-[#181412] text-[#f2e9e4] font-sans selection:bg-amber-600 selection:text-white';
      default:
        return 'bg-[#171717] text-[#ededed] font-sans selection:bg-[#789d2a] selection:text-white';
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
        onGoHome={roomId ? handleLeaveRoom : () => setActiveTab('bridge')}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <main className="flex-1">
        {activeTab === 'about' ? (
          <AboutView onBack={() => setActiveTab(roomMode)} />
        ) : !roomId ? (
          activeTab === 'meeting' ? (
            <MeetingHomeView
              onCreateMeeting={handleCreateMeeting}
              onJoinMeeting={(pinOrId) => handleJoinRoom(pinOrId, 'meeting')}
              isLoading={isLoading}
              errorMessage={errorMessage}
              myUserName={userName}
              onOpenAbout={() => setActiveTab('about')}
            />
          ) : (
            <HomeView
              onCreateRoom={() => handleCreateRoom('bridge')}
              onJoinRoom={(pinOrId) => handleJoinRoom(pinOrId, 'bridge')}
              isLoading={isLoading}
              errorMessage={errorMessage}
              nearbyPeers={nearbyPeers}
              onPairWithNearby={handlePairWithNearby}
              isPairing={isPairing}
              incomingPairRequest={incomingPairRequest}
              onAcceptPair={handleAcceptPair}
              onRejectPair={handleRejectPair}
              myUserName={userName}
              myDeviceType={deviceType}
              lanIp={lanIp}
              onOpenAbout={() => setActiveTab('about')}
            />
          )
        ) : roomMode === 'meeting' ? (
          <MeetingRoomView
            roomId={roomId}
            pin={pin}
            myPeerId={myPeerId}
            myUserName={userName}
            onUpdateUserName={handleUpdateUserName}
            roomUrl={roomUrl}
            peers={peers}
            transfers={transfers}
            messages={messages}
            scratchpadText={scratchpadText}
            onUpdateScratchpad={handleUpdateScratchpad}
            onSendFiles={handleSendFiles}
            onSendText={handleSendText}
            onLeaveRoom={handleLeaveRoom}
            onOpenQR={() => setIsQRModalOpen(true)}
            onToggleMic={handleToggleMic}
            onToggleScreen={handleToggleScreen}
            remoteVideoRef={remoteVideoRef}
            isMicActive={isMicActive}
            isScreenActive={isScreenActive}
            hasRemoteVideo={hasRemoteVideo}
            onAcceptFile={handleAcceptFile}
          />
        ) : (
          <RoomView
            roomId={roomId}
            pin={pin}
            myPeerId={myPeerId}
            roomUrl={roomUrl}
            peers={peers}
            transfers={transfers}
            messages={messages}
            onSendFiles={handleSendFiles}
            onSendText={handleSendText}
            onCancelTransfer={handleCancelTransfer}
            onAcceptFile={handleAcceptFile}
            onRejectFile={handleRejectFile}
            onLeaveRoom={handleLeaveRoom}
            onOpenQR={() => setIsQRModalOpen(true)}
            onToggleMic={handleToggleMic}
            onToggleScreen={handleToggleScreen}
            remoteVideoRef={remoteVideoRef}
            isMicActive={isMicActive}
            isScreenActive={isScreenActive}
            hasRemoteVideo={hasRemoteVideo}
            autoDownload={autoDownload}
            onToggleAutoDownload={handleToggleAutoDownload}
            destinationDirName={destinationDirName}
            onPickDestinationDir={handlePickDestinationDir}
            onClearDestinationDir={handleClearDestinationDir}
          />
        )}
      </main>

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        pin={pin}
        roomUrl={roomUrl}
      />

      <Footer onOpenAbout={() => setActiveTab('about')} />
      {/* Hidden audio element to play remote peer microphone live */}
      <audio ref={remoteAudioRef} autoPlay playsInline />
    </div>
  );
}
