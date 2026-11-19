import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Smartphone,
  Monitor,
  Check,
  X,
  Radio,
  AlertCircle,
  Lock,
  Users,
  UserCheck,
  UserMinus,
  Copy,
  Bell,
  UploadCloud,
  Download,
  Trash2,
} from 'lucide-react';
import { Navbar } from './components/Navbar.js';
import { HomeView } from './components/HomeView.js';
import { RoomView } from './components/RoomView.js';
import { MeetingRoomView } from './components/MeetingRoomView.js';
import { AboutView } from './components/AboutView.js';
import { LegalView, LegalDocType } from './components/LegalView.js';
import { PricingView } from './components/PricingView.js';
import { QRCodeModal } from './components/QRCodeModal.js';
import { AuthModal } from './components/AuthModal.js';
import { DropModal } from './components/DropModal.js';
import { DropPageView } from './components/DropPageView.js';
import { SettingsModal } from './components/SettingsModal.js';
import { LeaveConfirmModal } from './components/LeaveConfirmModal.js';
import { ProfileView } from './components/ProfileView.js';
import { ProfileSectionTab } from './components/ProfileDropdown.js';
import { Footer } from './components/Footer.js';
import {
  FileTransfer,
  Peer,
  TextMessage,
  ThemeMode,
  NearbyPeer,
  PairRequest,
  AppTab,
  RoomMode,
  AuthProvider,
  UserProfile,
  StickyDevice,
  DropDto,
} from './types/index.js';
import {
  detectDeviceType,
  generateRandomName,
  getRandomAvatar,
  getBrowserDeviceId,
  getBrowserLabel,
  formatBytes,
} from './utils/device.js';
import {
  getSharedAudioContext,
  monitorStreamVoiceActivity,
} from './utils/audioAnalyzer.js';
import { WebRTCManager } from './services/webrtc.js';
import { sound } from './utils/sound.js';
import { useScreenWakeLock } from './utils/wakeLock.js';

interface RoomAlertNotice {
  type: 'locked' | 'full' | 'notFound' | 'general' | 'duplicate';
  title: string;
  message: string;
}

export function App() {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const dropMatch = currentPath.match(/^\/drop\/([a-zA-Z0-9_-]+)/);
  if (dropMatch) {
    return <DropPageView dropId={dropMatch[1]} />;
  }

  const [userName, setUserName] = useState<string>(() => {
    return (
      localStorage.getItem('bridgik_username') ||
      localStorage.getItem('bridgit_username') ||
      localStorage.getItem('airbridge_username') ||
      generateRandomName()
    );
  });
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    const saved = localStorage.getItem('bridgik_user_avatar');
    if (saved) return saved;
    const randomAv = getRandomAvatar();
    localStorage.setItem('bridgik_user_avatar', randomAv);
    return randomAv;
  });
  const [deviceType] = useState(detectDeviceType());
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('airbridge_theme') as ThemeMode) || 'swiss';
  });

  // Admin & Creator State
  const [isAdmin, setIsAdmin] = useState(false);
  const [clientIp, setClientIp] = useState<string>('');
  const [adminFrame, setAdminFrame] = useState<'gold' | 'rgb' | 'plasma' | 'none'>(() => {
    return (localStorage.getItem('bridgik_admin_frame') as any) || 'gold';
  });
  const [statusEmote, setStatusEmote] = useState<string | null>(() => {
    return localStorage.getItem('bridgik_user_status_emote') || null;
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem('bridgik_demo_profile');
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalProvider, setAuthModalProvider] = useState<AuthProvider>('yandex');
  const [profileSectionTab, setProfileSectionTab] = useState<ProfileSectionTab>('appearance');

  // Drop & Go (24h Buffer) State
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [dropTargetDevice, setDropTargetDevice] = useState<StickyDevice | null>(null);
  const [pendingDrops, setPendingDrops] = useState<DropDto[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => sound.isEnabled());
  const [radarVisible, setRadarVisible] = useState(() => {
    return localStorage.getItem('bridgik_radar_visible') !== 'false';
  });
  const [stickyAutoAccept, setStickyAutoAccept] = useState(() => {
    return localStorage.getItem('bridgik_sticky_auto_accept') !== 'false';
  });
  const [participantToasts, setParticipantToasts] = useState(() => {
    return localStorage.getItem('bridgik_participant_toasts') !== 'false';
  });
  const [tgNotifyDownload, setTgNotifyDownload] = useState(() => {
    return localStorage.getItem('bridgik_tg_notify_download') !== 'false';
  });
  const [tgNotifyDevice, setTgNotifyDevice] = useState(() => {
    return localStorage.getItem('bridgik_tg_notify_device') === 'true';
  });

  const handleToggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
    if (next) sound.playMessage();
  };

  const saveProfile = (next: UserProfile | null) => {
    setUserProfile(next);
    if (next) {
      localStorage.setItem('bridgik_demo_profile', JSON.stringify(next));
      if (next.licenseKeyPreview) {
        localStorage.setItem('bridgik_license_key', next.licenseKeyPreview);
      }
    } else {
      localStorage.removeItem('bridgik_demo_profile');
      localStorage.removeItem('bridgik_license_key');
    }
  };

  const patchBackendProfile = async (updates: {
    displayName?: string;
    avatarUrl?: string;
    activeFrame?: any;
    activeEmote?: string | null;
    defaultRoomTheme?: string;
  }) => {
    const key = userProfile?.licenseKeyPreview || localStorage.getItem('bridgik_license_key');
    if (!key) return;
    try {
      const deviceId = getBrowserDeviceId();
      const res = await fetch(`/api/user/profile?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data?.success && data?.user) {
        saveProfile(data.user);
      }
    } catch (err) {
      console.error('Failed to sync profile with server:', err);
    }
  };

  const fetchPendingDrops = async (key?: string, devId?: string) => {
    const lk = key || userProfile?.licenseKeyPreview || localStorage.getItem('bridgik_license_key');
    const did = devId || getBrowserDeviceId();
    if (!lk || !did) return;
    try {
      const res = await fetch(`/api/drop/pending?deviceId=${encodeURIComponent(did)}`, {
        headers: { Authorization: `Bearer ${lk}` },
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.drops)) {
        setPendingDrops(data.drops);
      }
    } catch (err) {
      console.warn('Failed to fetch pending drops', err);
    }
  };

  const handleDownloadPendingDrop = (drop: DropDto) => {
    sound.playConnect();
    const link = document.createElement('a');
    link.href = `/api/drop/${drop.id}/download`;
    link.download = drop.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setPendingDrops((prev) => prev.filter((d) => d.id !== drop.id));
  };

  const handleDeletePendingDrop = async (dropId: string) => {
    sound.playClick();
    try {
      await fetch(`/api/drop/${dropId}`, { method: 'DELETE' });
    } catch {}
    setPendingDrops((prev) => prev.filter((d) => d.id !== dropId));
  };

  const handleAuthSuccess = async (
    provider: AuthProvider,
    payload?: { key?: string; isNew?: boolean; user?: any }
  ): Promise<boolean | void> => {
    const deviceId = getBrowserDeviceId();
    const deviceName = deviceType === 'mobile' ? 'Мой смартфон' : 'Этот ПК';
    const browserLabel = getBrowserLabel();

    if (payload?.key) {
      localStorage.setItem('bridgik_license_key', payload.key);
      if (payload.user) {
        saveProfile(payload.user);
        setUserName(payload.user.displayName);
        if (payload.user.avatarUrl) setUserAvatar(payload.user.avatarUrl);
        if (payload.user.activeFrame) setAdminFrame(payload.user.activeFrame);
        if (payload.user.activeEmote !== undefined) setStatusEmote(payload.user.activeEmote);
        if (payload.user.defaultRoomTheme) setRoomTheme(payload.user.defaultRoomTheme);
      } else {
        try {
          const res = await fetch(`/api/user/profile?key=${encodeURIComponent(payload.key)}&deviceId=${encodeURIComponent(deviceId)}`);
          const data = await res.json();
          if (data?.success && data?.user) {
            saveProfile(data.user);
            setUserName(data.user.displayName);
            if (data.user.avatarUrl) setUserAvatar(data.user.avatarUrl);
            if (data.user.activeFrame) setAdminFrame(data.user.activeFrame);
            if (data.user.activeEmote !== undefined) setStatusEmote(data.user.activeEmote);
            if (data.user.defaultRoomTheme) setRoomTheme(data.user.defaultRoomTheme);
          }
        } catch {}
      }

      if (socket && isConnected) {
        socket.emit('auth-device', {
          licenseKey: payload.key,
          deviceId,
          name: deviceName,
          deviceType,
          browserLabel,
        });
      }
      return true;
    }

    if (provider === 'key') {
      if (payload?.isNew) {
        try {
          const res = await fetch('/api/auth/key/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: payload?.key,
              displayName: userName,
              avatarUrl: userAvatar,
              defaultRoomTheme: roomTheme,
              deviceId,
              deviceType,
              deviceName,
              browserLabel,
            }),
          });
          const data = await res.json();
          if (!data?.success) {
            throw new Error(data?.error || 'Не удалось создать ключ на сервере');
          }
          localStorage.setItem('bridgik_license_key', data.key);
          saveProfile(data.user);
          if (socket && isConnected) {
            socket.emit('auth-device', {
              licenseKey: data.key,
              deviceId,
              name: deviceName,
              deviceType,
              browserLabel,
            });
          }
          return true;
        } catch (err: any) {
          console.error(err);
          throw err;
        }
      } else if (payload?.key) {
        try {
          const res = await fetch('/api/auth/key/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: payload.key,
              deviceId,
              deviceType,
              deviceName,
              browserLabel,
            }),
          });
          const data = await res.json();
          if (!data?.success) {
            throw new Error(data?.error || 'Ключ не найден');
          }
          localStorage.setItem('bridgik_license_key', payload.key);
          saveProfile(data.user);
          setUserName(data.user.displayName);
          if (data.user.avatarUrl) setUserAvatar(data.user.avatarUrl);
          if (data.user.activeFrame) setAdminFrame(data.user.activeFrame);
          if (data.user.activeEmote !== undefined) setStatusEmote(data.user.activeEmote);
          if (data.user.defaultRoomTheme) setRoomTheme(data.user.defaultRoomTheme);

          if (socket && isConnected) {
            socket.emit('auth-device', {
              licenseKey: payload.key,
              deviceId,
              name: deviceName,
              deviceType,
              browserLabel,
            });
          }
          return true;
        } catch (err: any) {
          console.error(err);
          throw err;
        }
      }
    } else {
      const base: UserProfile = userProfile || {
        id: 'preview-user-1',
        displayName: provider === 'yandex' ? 'Пользователь Яндекса' : userName,
        avatarUrl: userAvatar,
        tier: 'free',
        providers: {},
        unlockedFrames: ['none'],
        unlockedThemes: ['cyber-lounge', 'cozy-loft', 'skyline-penthouse', 'retro-lounge'],
        activeFrame: 'none',
        activeEmote: statusEmote,
        defaultRoomTheme: roomTheme,
        s3QuotaUsedMb: 0,
        s3QuotaLimitMb: 0,
        devices: [
          {
            id: getBrowserDeviceId(),
            name: deviceType === 'mobile' ? 'Мой смартфон' : 'Этот ПК',
            deviceType,
            browserLabel: getBrowserLabel(),
            isCurrent: true,
            isOnline: true,
            lastSeenAt: Date.now(),
          },
        ],
      };

      const nextProviders = { ...base.providers };
      let nextName = base.displayName;

      if (provider === 'yandex') {
        nextProviders.yandex = { handle: 'yandex.user' };
        if (!userProfile) nextName = 'Пользователь Яндекса';
      } else if (provider === 'telegram') {
        nextProviders.telegram = { username: 'bridgik_user', id: 100001 };
      }

      const updated: UserProfile = {
        ...base,
        displayName: nextName,
        providers: nextProviders,
      };

      saveProfile(updated);
      if (updated.displayName !== userName) {
        handleUpdateUserName(updated.displayName);
      }
      return true;
    }
  };

  const handleToggleDemoTier = () => {
    if (!userProfile) return;
    const nextTier = userProfile.tier === 'pro' ? 'free' : 'pro';
    const nextFrame =
      nextTier === 'pro'
        ? userProfile.activeFrame === 'none'
          ? 'gold'
          : userProfile.activeFrame
        : 'none';
    const updated: UserProfile = {
      ...userProfile,
      tier: nextTier,
      unlockedFrames:
        nextTier === 'pro' ? ['none', 'gold', 'rgb', 'plasma'] : ['none'],
      unlockedThemes:
        nextTier === 'pro'
          ? ['cyber-lounge', 'tokyo-night', 'loft', 'bunker', 'coffee-shop', 'rainy-roof']
          : ['cyber-lounge'],
      activeFrame: nextFrame,
      s3QuotaLimitMb: nextTier === 'pro' ? 20480 : 0,
      s3QuotaUsedMb: nextTier === 'pro' ? 420 : 0,
    };
    saveProfile(updated);
    handleUpdateAdminFrame(nextFrame);
  };

  const handleLogout = () => {
    saveProfile(null);
    if (activeTab === 'profile') {
      setActiveTab(roomId ? roomMode : 'bridge');
    }
  };

  const handleRemoveDevice = async (devId: string) => {
    const key = userProfile?.licenseKeyPreview || localStorage.getItem('bridgik_license_key');
    if (key) {
      try {
        await fetch(`/api/user/devices/${encodeURIComponent(devId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${key}` },
        });
      } catch (e) {
        console.error('Failed to delete device:', e);
      }
    }
    if (userProfile) {
      saveProfile({
        ...userProfile,
        devices: userProfile.devices.filter((d) => d.id !== devId),
      });
    }
  };

  const handleCreateBridgeWithDevice = (targetDevice: any) => {
    if (!socket || !isConnected) {
      alert('Нет подключения к серверу');
      return;
    }
    if (!targetDevice?.isOnline) {
      alert(`Устройство «${targetDevice.name}» сейчас офлайн. Откройте bridgik.ru на нём.`);
      return;
    }
    sound.playClick();
    socket.emit(
      'sticky-pair-request',
      { targetDeviceId: targetDevice.id },
      (res: any) => {
        if (res?.success && res?.roomId) {
          sound.playConnect();
          if (joinRoomRef.current) {
            joinRoomRef.current(res.roomId, 'bridge');
          }
        } else {
          alert(res?.error || 'Целевое устройство сейчас не в сети');
        }
      }
    );
  };

  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('tab') === 'profile') return 'profile';
    } catch {}
    return 'bridge';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlAdminKey = params.get('admin');
    if (urlAdminKey) {
      localStorage.setItem('bridgik_admin_key', urlAdminKey);
    }

    if (params.get('tab') === 'profile') {
      setActiveTab('profile');
    }

    const authParam = params.get('auth');
    if (authParam === 'success') {
      const urlKey = params.get('key') || localStorage.getItem('bridgik_license_key');
      if (urlKey) {
        localStorage.setItem('bridgik_license_key', urlKey);
        const deviceId = getBrowserDeviceId();
        fetch(`/api/user/profile?key=${encodeURIComponent(urlKey)}&deviceId=${encodeURIComponent(deviceId)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data?.success && data?.user) {
              saveProfile(data.user);
              setUserName(data.user.displayName);
              if (data.user.avatarUrl) setUserAvatar(data.user.avatarUrl);
              if (data.user.activeFrame) setAdminFrame(data.user.activeFrame);
              sound.playConnect();
              setActiveTab('profile');
            }
          })
          .catch((e) => console.error('OAuth profile load error:', e));
      }
    }

    const paymentParam = params.get('payment');
    if (paymentParam === 'demo') {
      const demoKey = params.get('key') || localStorage.getItem('bridgik_license_key');
      const demoDays = params.get('days') || '30';
      if (demoKey) {
        fetch('/api/payment/demo-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: demoKey, days: Number(demoDays) || 30 }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.success && data?.user) {
              saveProfile(data.user);
              if (data.user.activeFrame) setAdminFrame(data.user.activeFrame);
              sound.playConnect();
              setActiveTab('profile');
            }
          })
          .catch((e) => console.error('Demo payment confirm error:', e));
      }
    } else if (paymentParam === 'success') {
      const key = localStorage.getItem('bridgik_license_key');
      const deviceId = getBrowserDeviceId();
      if (key) {
        fetch(`/api/user/profile?key=${encodeURIComponent(key)}&deviceId=${encodeURIComponent(deviceId)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data?.success && data?.user) {
              saveProfile(data.user);
              if (data.user.activeFrame) setAdminFrame(data.user.activeFrame);
              sound.playConnect();
              setActiveTab('profile');
            }
          })
          .catch((e) => console.error('Profile refresh error:', e));
      }
    }

    if (urlAdminKey || paymentParam || authParam) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('admin');
      cleanUrl.searchParams.delete('payment');
      cleanUrl.searchParams.delete('auth');
      cleanUrl.searchParams.delete('demo_id');
      cleanUrl.searchParams.delete('days');
      cleanUrl.searchParams.delete('key');
      cleanUrl.searchParams.delete('payment_id');
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }
  }, []);

  // Global listener for OAuth popup messages
  useEffect(() => {
    const handleAuthMessage = (e: MessageEvent) => {
      if (e.data?.type === 'BRIDGIK_AUTH_SUCCESS' && e.data?.key) {
        const { key, user } = e.data;
        localStorage.setItem('bridgik_license_key', key);
        if (user) {
          saveProfile(user);
          setUserName(user.displayName);
          if (user.avatarUrl) setUserAvatar(user.avatarUrl);
          if (user.activeFrame) setAdminFrame(user.activeFrame);
          if (user.activeEmote !== undefined) setStatusEmote(user.activeEmote);
          if (user.defaultRoomTheme) setRoomTheme(user.defaultRoomTheme);
        } else {
          const did = getBrowserDeviceId();
          fetch(`/api/user/profile?key=${encodeURIComponent(key)}&deviceId=${encodeURIComponent(did)}`)
            .then((r) => r.json())
            .then((d) => {
              if (d?.success && d?.user) {
                saveProfile(d.user);
                setUserName(d.user.displayName);
                if (d.user.avatarUrl) setUserAvatar(d.user.avatarUrl);
              }
            });
        }
        sound.playConnect();
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');
  const [legalDoc, setLegalDoc] = useState<LegalDocType>('rules');
  const [roomMode, setRoomMode] = useState<RoomMode>('bridge');
  const [scratchpadText, setScratchpadText] = useState<string>('');
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [peers, setPeers] = useState<Peer[]>([]);
  const [transfers, setTransfers] = useState<FileTransfer[]>([]);
  const [messages, setMessages] = useState<TextMessage[]>([]);

  // Auto-cleanup burner self-destructing messages
  useEffect(() => {
    const hasBurners = messages.some((m) => m.isBurner && m.expiresAt);
    if (!hasBurners) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setMessages((prev) => {
        const next = prev.filter((m) => !m.expiresAt || m.expiresAt > now);
        return next.length !== prev.length ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [messages]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Local Wi-Fi Discovery (Radar) & Auto-Download
  const [nearbyPeers, setNearbyPeers] = useState<NearbyPeer[]>([]);
  const [incomingPairRequest, setIncomingPairRequest] = useState<PairRequest | null>(null);
  const [isPairing, setIsPairing] = useState(false);
  const [pairingTargetName, setPairingTargetName] = useState<string>('');
  const [pairingTargetSocketId, setPairingTargetSocketId] = useState<string>('');
  const [pairRejectionNotice, setPairRejectionNotice] = useState<string | null>(null);
  const [roomAlertNotice, setRoomAlertNotice] = useState<RoomAlertNotice | null>(null);
  const [participantNotice, setParticipantNotice] = useState<{
    type: 'joined' | 'left';
    name: string;
  } | null>(null);
  const participantNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const participantToastsRef = useRef(participantToasts);
  useEffect(() => {
    participantToastsRef.current = participantToasts;
  }, [participantToasts]);
  const peersRef = useRef<Peer[]>(peers);
  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  const [lanIp, setLanIp] = useState<string | null>(null);
  const [destinationDirName, setDestinationDirName] = useState<string | null>(null);
  const destinationDirHandleRef = useRef<any>(null);
  const [autoDownload, setAutoDownload] = useState<boolean>(() => {
    return (
      localStorage.getItem('bridgik_auto_download') !== 'false' &&
      localStorage.getItem('bridgit_auto_download') !== 'false'
    );
  });

  // PWA Share Target queue
  const [pendingSharedFiles, setPendingSharedFiles] = useState<File[]>([]);
  const [pendingSharedText, setPendingSharedText] = useState<string>('');
  const pendingShareOpenRoomRef = useRef(false);

  // Media, Voice Activity, Per-peer Volumes & Reactions
  const [isMicActive, setIsMicActive] = useState(false);
  const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(null);
  const [speakingPeers, setSpeakingPeers] = useState<Record<string, boolean>>({});
  const [peerVolumes, setPeerVolumes] = useState<Record<string, number>>({});
  const [seatReactions, setSeatReactions] = useState<
    Array<{ id: string; peerId: string; emoteUrl: string }>
  >([]);

  const [isScreenActive, setIsScreenActive] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [roomTheme, setRoomTheme] = useState<string>(() => {
    return localStorage.getItem('bridgik_pixel_room') || 'cyber-lounge';
  });
  const [maxSeats, setMaxSeats] = useState<number>(8);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [knockRequired, setKnockRequired] = useState<boolean>(false);
  const [waitingKnock, setWaitingKnock] = useState<{ roomId: string; pin: string } | null>(null);
  const [incomingKnocks, setIncomingKnocks] = useState<
    Array<{ socketId: string; roomId: string; peerName: string }>
  >([]);
  const joinRoomRef = useRef<(pinOrId: string, mode?: RoomMode) => void>(() => {});
  const [peerSeats, setPeerSeats] = useState<Record<string, number>>({});
  const [mySeatIndex, setMySeatIndex] = useState<number>(0);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [remoteAudioStreams, setRemoteAudioStreams] = useState<Record<string, MediaStream>>({});
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState(false);

  const autoDownloadRef = useRef<boolean>(autoDownload);
  useEffect(() => {
    autoDownloadRef.current = autoDownload;
  }, [autoDownload]);

  const isMicActiveRef = useRef<boolean>(isMicActive);
  useEffect(() => {
    isMicActiveRef.current = isMicActive;
  }, [isMicActive]);

  const toggleMicRef = useRef<() => Promise<boolean>>(async () => false);

  // Register Service Worker & read any files shared via Android Share Target
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('shared') === '1' && 'caches' in window) {
      window.history.replaceState({}, document.title, window.location.pathname);
      (async () => {
        try {
          const cache = await caches.open('bridgik-share-v1');
          const metaResp = await cache.match('/__shared_meta__');
          if (!metaResp) return;

          const meta = await metaResp.json();
          const loadedFiles: File[] = [];
          if (Array.isArray(meta.files)) {
            for (const fMeta of meta.files) {
              const fileResp = await cache.match(fMeta.key);
              if (fileResp) {
                const blob = await fileResp.blob();
                loadedFiles.push(
                  new File([blob], fMeta.name || 'shared-file', {
                    type: fMeta.type || blob.type || 'application/octet-stream',
                  })
                );
              }
            }
          }

          const combinedText = [meta.title, meta.text, meta.url]
            .map((s: any) => String(s || '').trim())
            .filter(Boolean)
            .join('\n');

          await caches.delete('bridgik-share-v1');

          if (loadedFiles.length > 0 || combinedText) {
            setPendingSharedFiles(loadedFiles);
            setPendingSharedText(combinedText);
            pendingShareOpenRoomRef.current = true;
          }
        } catch (err) {
          console.warn('Failed to load shared target cache', err);
        }
      })();
    }
  }, []);

  // Monitor local microphone real RMS volume for speaking indicator
  useEffect(() => {
    if (!localAudioStream || !myPeerId || !isMicActive) {
      if (myPeerId) {
        setSpeakingPeers((prev) => (prev[myPeerId] ? { ...prev, [myPeerId]: false } : prev));
      }
      return;
    }
    const stop = monitorStreamVoiceActivity(localAudioStream, (speaking) => {
      setSpeakingPeers((prev) =>
        prev[myPeerId] === speaking ? prev : { ...prev, [myPeerId]: speaking }
      );
    });
    return () => {
      stop();
      setSpeakingPeers((prev) => (prev[myPeerId] ? { ...prev, [myPeerId]: false } : prev));
    };
  }, [localAudioStream, myPeerId, isMicActive]);

  // Auto-unlock audio & WebAudio AudioContext on first user interaction
  useEffect(() => {
    if (!audioAutoplayBlocked) return;
    const unlockAudio = async () => {
      const ctx = getSharedAudioContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }
      const els = Array.from(
        document.querySelectorAll('audio[data-peer-audio="true"]')
      ) as HTMLAudioElement[];
      const results = await Promise.allSettled(
        els.map((audio) => (audio.paused ? audio.play() : Promise.resolve()))
      );
      const hasRejected = results.some((r) => r.status === 'rejected');
      if (!hasRejected && (!ctx || ctx.state === 'running')) {
        setAudioAutoplayBlocked(false);
      }
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [audioAutoplayBlocked]);

  const [scratchpadTypingUser, setScratchpadTypingUser] = useState<string | null>(null);
  const scratchpadTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [peerConnectionTypes, setPeerConnectionTypes] = useState<
    Record<string, 'direct' | 'relay'>
  >({});

  const webrtcRef = useRef<WebRTCManager | null>(null);

  const pushSeatReaction = (peerId: string, emoteUrl: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setSeatReactions((prev) => [...prev.slice(-15), { id, peerId, emoteUrl }]);
    setTimeout(() => {
      setSeatReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);
  };

  // Initialize Socket.io
  useEffect(() => {
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

    // Sticky Bridge device status updates (online/offline)
    socketInstance.on(
      'sticky-device-status',
      (data: { deviceId: string; isOnline: boolean; lastSeenAt?: number }) => {
        setUserProfile((prev) => {
          if (!prev) return prev;
          const updatedDevices = prev.devices.map((d) =>
            d.id === data.deviceId
              ? {
                  ...d,
                  isOnline: data.isOnline,
                  lastSeenAt: data.lastSeenAt || Date.now(),
                }
              : d
          );
          return { ...prev, devices: updatedDevices };
        });
      }
    );

    // Sticky Bridge incoming pair request from another linked device
    socketInstance.on(
      'sticky-incoming-pair',
      (data: { roomId: string; pin: string; fromDeviceId: string; fileMeta?: any }) => {
        sound.playConnect();
        const autoAccept = localStorage.getItem('bridgik_sticky_auto_accept') !== 'false';
        if (autoAccept && joinRoomRef.current) {
          joinRoomRef.current(data.roomId, 'bridge');
        }
      }
    );

    // Real-time profile sync across all tabs/devices of the user
    socketInstance.on('sticky-profile-updated', (data: UserProfile) => {
      if (data) {
        saveProfile(data);
        setUserName(data.displayName);
        if (data.avatarUrl) setUserAvatar(data.avatarUrl);
        if (data.activeFrame) setAdminFrame(data.activeFrame);
        if (data.activeEmote !== undefined) setStatusEmote(data.activeEmote);
        if (data.defaultRoomTheme) setRoomTheme(data.defaultRoomTheme);
      }
    });

    // Real-time Drop & Go incoming file event
    socketInstance.on('sticky-new-drop', (newDrop: DropDto) => {
      sound.playMessage();
      setPendingDrops((prev) => [newDrop, ...prev.filter((d) => d.id !== newDrop.id)]);
    });

    // Real-time Pro activation notification
    socketInstance.on('user-pro-activated', (_data: { userId: string; proUntil?: string; tier: string }) => {
      const key = localStorage.getItem('bridgik_license_key');
      const deviceId = getBrowserDeviceId();
      if (key) {
        fetch(`/api/user/profile?key=${encodeURIComponent(key)}&deviceId=${encodeURIComponent(deviceId)}`)
          .then((r) => r.json())
          .then((res) => {
            if (res?.success && res?.user) {
              saveProfile(res.user);
              if (res.user.activeFrame) setAdminFrame(res.user.activeFrame);
              sound.playConnect();
            }
          })
          .catch(() => {});
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Sync profile from backend on app mount if license key exists
  useEffect(() => {
    const key = localStorage.getItem('bridgik_license_key');
    if (!key) return;
    const deviceId = getBrowserDeviceId();
    fetch(`/api/user/profile?key=${encodeURIComponent(key)}&deviceId=${encodeURIComponent(deviceId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data?.user) {
          saveProfile(data.user);
          setUserName(data.user.displayName);
          if (data.user.avatarUrl) setUserAvatar(data.user.avatarUrl);
          if (data.user.activeFrame) setAdminFrame(data.user.activeFrame);
          if (data.user.activeEmote !== undefined) setStatusEmote(data.user.activeEmote);
          if (data.user.defaultRoomTheme) setRoomTheme(data.user.defaultRoomTheme);
          fetchPendingDrops(key, deviceId);
        }
      })
      .catch((err) => console.error('Failed to load profile from backend:', err));
  }, []);

  // Authenticate device with socket when socket is connected and license key is present
  useEffect(() => {
    if (!socket || !isConnected) return;
    const key = userProfile?.licenseKeyPreview || localStorage.getItem('bridgik_license_key');
    if (!key) return;
    const deviceId = getBrowserDeviceId();
    const name = deviceType === 'mobile' ? 'Мой смартфон' : 'Этот ПК';
    const browserLabel = getBrowserLabel();

    socket.emit(
      'auth-device',
      {
        licenseKey: key,
        deviceId,
        name,
        deviceType,
        browserLabel,
      },
      (res: any) => {
        if (res?.success && res?.user) {
          saveProfile(res.user);
          fetchPendingDrops(key, deviceId);
        }
      }
    );
  }, [socket, isConnected, userProfile?.licenseKeyPreview]);

  // Auto-open a Bridge when arriving via Share Target
  useEffect(() => {
    if (
      socket &&
      isConnected &&
      !roomId &&
      pendingShareOpenRoomRef.current &&
      (pendingSharedFiles.length > 0 || pendingSharedText)
    ) {
      pendingShareOpenRoomRef.current = false;
      handleCreateRoom('bridge');
    }
  }, [socket, isConnected, roomId, pendingSharedFiles, pendingSharedText]);

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

  useEffect(() => {
    if (!pairRejectionNotice) return;
    const timer = setTimeout(() => {
      setPairRejectionNotice(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [pairRejectionNotice]);

  useEffect(() => {
    if (!roomAlertNotice) return;
    const timer = setTimeout(() => {
      setRoomAlertNotice(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [roomAlertNotice]);

  const handleUpdateUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('bridgik_username', name);
    if (webrtcRef.current) {
      webrtcRef.current.updateMyName(name);
    }
    setPeers((prev) => prev.map((p) => (p.id === myPeerId ? { ...p, name } : p)));
    if (socket && roomId) {
      socket.emit('update-peer-name', { roomId, name });
    }
    if (socket && !roomId) {
      socket.emit('lobby-update-name', { name });
    }
  };

  const handleUpdateUserAvatar = (avatar: string) => {
    setUserAvatar(avatar);
    localStorage.setItem('bridgik_user_avatar', avatar);
    if (webrtcRef.current) {
      webrtcRef.current.updateMyAvatar(avatar);
    }
    setPeers((prev) => prev.map((p) => (p.id === myPeerId ? { ...p, avatar } : p)));
    setMessages((prev) =>
      prev.map((m) => (m.senderId === myPeerId ? { ...m, senderAvatar: avatar } : m))
    );
    if (socket && roomId) {
      socket.emit('update-peer-avatar', { roomId, avatar, adminFrame });
    }
  };

  const handleUpdateAdminFrame = (frame: 'gold' | 'rgb' | 'plasma' | 'none') => {
    setAdminFrame(frame);
    localStorage.setItem('bridgik_admin_frame', frame);
    webrtcRef.current?.updateAdminStatus(isAdmin, frame);
    setPeers((prev) => prev.map((p) => (p.id === myPeerId ? { ...p, adminFrame: frame } : p)));
    if (socket && roomId) {
      socket.emit('update-peer-avatar', { roomId, avatar: userAvatar, adminFrame: frame });
    }
  };

  const handleUpdateStatusEmote = (emote: string | null) => {
    setStatusEmote(emote);
    if (emote) {
      localStorage.setItem('bridgik_user_status_emote', emote);
    } else {
      localStorage.removeItem('bridgik_user_status_emote');
    }
    if (webrtcRef.current) {
      webrtcRef.current.updateStatusEmote(emote || undefined);
    }
    setPeers((prev) =>
      prev.map((p) => (p.id === myPeerId ? { ...p, statusEmote: emote || undefined } : p))
    );
    setMessages((prev) =>
      prev.map((m) =>
        m.senderId === myPeerId ? { ...m, senderStatusEmote: emote || undefined } : m
      )
    );
    if (socket && roomId) {
      socket.emit('update-peer-status-emote', { roomId, statusEmote: emote || undefined });
    }
    if (socket && !roomId) {
      socket.emit('lobby-update-status-emote', { statusEmote: emote || undefined });
    }
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode =
      theme === 'swiss' ? 'cyberpunk' : theme === 'cyberpunk' ? 'lofi' : 'swiss';
    setTheme(nextTheme);
    localStorage.setItem('airbridge_theme', nextTheme);
  };

  const setupWebRTC = (sock: Socket, myId: string) => {
    if (webrtcRef.current) {
      webrtcRef.current.destroy();
    }

    const manager = new WebRTCManager(
      sock,
      myId,
      userName,
      {
        onTextMessage: (msg) => {
          if (msg.senderId !== myId) {
            sound.playMessage();
          }
          setMessages((prev) => [...prev, msg]);
        },
        onTransferProgress: (updated) => {
          setTransfers((prev) => {
            const index = prev.findIndex((t) => t.id === updated.id);
            if (index >= 0) {
              const next = [...prev];
              next[index] = {
                ...next[index],
                ...updated,
                blobUrl: updated.blobUrl || next[index].blobUrl,
              } as FileTransfer;
              return next;
            } else {
              return [updated as FileTransfer, ...prev];
            }
          });
        },
        onTransferComplete: (completed) => {
          sound.playTransferComplete();

          if (completed.type === 'download' && completed.blobUrl && !completed.savedToDisk) {
            if (autoDownloadRef.current) {
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
              next[index] = {
                ...completed,
                blobUrl: completed.blobUrl || next[index].blobUrl,
              };
              return next;
            }
            return [completed, ...prev];
          });
        },
        onRemoteStream: (peerId, stream) => {
          const videoTracks = stream.getVideoTracks();
          const audioTracks = stream.getAudioTracks();

          if (videoTracks.length > 0 && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
            setHasRemoteVideo(true);
            videoTracks[0].onended = () => {
              setHasRemoteVideo(false);
            };
          }

          if (audioTracks.length > 0) {
            setRemoteAudioStreams((prev) => ({ ...prev, [peerId]: stream }));
          }
        },
        onLocalStreamChange: (stream) => {
          setLocalAudioStream(stream);
        },
        onReaction: (peerId, emoteUrl) => {
          sound.playClick();
          pushSeatReaction(peerId, emoteUrl);
        },
        onConnectionFailed: (_peerId, reason) => {
          if (reason === 'NAT_BLOCKED') {
            setRoomAlertNotice({
              type: 'general',
              title: 'Прямое соединение заблокировано сетью',
              message:
                'Файрвол или мобильный оператор блокирует прямой P2P-канал между устройствами.',
            });
          }
        },
        onMemoryLimitWarning: (fileName, size) => {
          const mb = Math.round(size / (1024 * 1024));
          setRoomAlertNotice({
            type: 'general',
            title: 'Крупный файл для мобильного браузера',
            message: `Файл «${fileName}» (${mb} МБ) загружается в оперативную память, так как браузер не поддерживает прямую запись на диск.`,
          });
        },
        onPeerConnectionStateChange: (peerId, state) => {
          console.log(`Peer ${peerId} state changed to ${state}`);
        },
        onScratchpadSync: (text) => {
          setScratchpadText(text);
        },
        onScratchpadTyping: (updatedBy) => {
          setScratchpadTypingUser(updatedBy);
          if (scratchpadTypingTimerRef.current) clearTimeout(scratchpadTypingTimerRef.current);
          scratchpadTypingTimerRef.current = setTimeout(() => {
            setScratchpadTypingUser(null);
          }, 2500);
        },
        onConnectionTypeChange: (peerId, type) => {
          setPeerConnectionTypes((prev) => ({ ...prev, [peerId]: type }));
        },
      },
      userAvatar
    );

    if (destinationDirHandleRef.current) {
      manager.setDestinationDirectory(destinationDirHandleRef.current);
    }

    manager.updateAdminStatus(isAdmin, adminFrame);
    if (statusEmote) {
      manager.updateStatusEmote(statusEmote);
    }
    webrtcRef.current = manager;
    return manager;
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('admin-status', (data: { isAdmin: boolean; clientIp: string }) => {
      setIsAdmin(data.isAdmin);
      setClientIp(data.clientIp);
      webrtcRef.current?.updateAdminStatus(data.isAdmin, adminFrame);
    });

    const storedAdminKey = localStorage.getItem('bridgik_admin_key');
    if (storedAdminKey) {
      socket.emit('verify-admin-key', { key: storedAdminKey });
    }

    socket.on('peer-joined', (newPeer: Peer) => {
      sound.playConnect();
      setPeers((prev) => {
        if (prev.some((p) => p.id === newPeer.id)) return prev;
        return [...prev, newPeer];
      });

      if (participantToastsRef.current) {
        setParticipantNotice({ type: 'joined', name: newPeer.name });
        if (participantNoticeTimerRef.current) clearTimeout(participantNoticeTimerRef.current);
        participantNoticeTimerRef.current = setTimeout(() => setParticipantNotice(null), 4000);
      }

      if (webrtcRef.current) {
        webrtcRef.current.connectToPeer(newPeer.id, true);
      }
    });

    socket.on('peer-left', (data: { peerId: string; peerName?: string }) => {
      const leavingPeer = peersRef.current.find((p) => p.id === data.peerId);
      const peerName = data.peerName || leavingPeer?.name || 'Участник';

      sound.playDisconnect();
      setPeers((prev) => prev.filter((p) => p.id !== data.peerId));
      setRemoteAudioStreams((prev) => {
        const next = { ...prev };
        delete next[data.peerId];
        return next;
      });
      setSpeakingPeers((prev) => {
        const next = { ...prev };
        delete next[data.peerId];
        return next;
      });

      if (participantToastsRef.current) {
        setParticipantNotice({ type: 'left', name: peerName });
        if (participantNoticeTimerRef.current) clearTimeout(participantNoticeTimerRef.current);
        participantNoticeTimerRef.current = setTimeout(() => setParticipantNotice(null), 4000);
      }

      if (webrtcRef.current) {
        webrtcRef.current.removePeer(data.peerId);
      }
    });

    socket.on('peer-updated', (updatedPeer: Peer) => {
      setPeers((prev) =>
        prev.map((p) => (p.id === updatedPeer.id ? { ...p, ...updatedPeer } : p))
      );
      if (updatedPeer.avatar) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === updatedPeer.id ? { ...m, senderAvatar: updatedPeer.avatar } : m
          )
        );
      }
      if (updatedPeer.statusEmote !== undefined) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === updatedPeer.id
              ? { ...m, senderStatusEmote: updatedPeer.statusEmote }
              : m
          )
        );
      }
    });

    socket.on('peer-mic-changed', (data: { peerId: string; isMicActive: boolean }) => {
      setPeers((prev) =>
        prev.map((p) => (p.id === data.peerId ? { ...p, isMicActive: data.isMicActive } : p))
      );
      if (!data.isMicActive) {
        setSpeakingPeers((prev) => ({ ...prev, [data.peerId]: false }));
      }
    });

    socket.on('room-theme-changed', (data: { theme: string }) => {
      if (data.theme) {
        setRoomTheme(data.theme);
        localStorage.setItem('bridgik_pixel_room', data.theme);
      }
    });

    socket.on(
      'room-config-updated',
      (data: { maxSeats?: number; isLocked?: boolean; knockRequired?: boolean }) => {
        if (data.maxSeats !== undefined) setMaxSeats(data.maxSeats);
        if (data.isLocked !== undefined) setIsLocked(data.isLocked);
        if (data.knockRequired !== undefined) setKnockRequired(data.knockRequired);
      }
    );

    socket.on('peer-seat-changed', (data: { peerId: string; seatIndex: number }) => {
      setPeerSeats((prev) => {
        if (data.seatIndex === -1) {
          const next = { ...prev };
          delete next[data.peerId];
          return next;
        }
        return { ...prev, [data.peerId]: data.seatIndex };
      });
    });

    socket.on('kicked', (data: { reason?: string }) => {
      alert(data?.reason || 'Организатор исключил вас из комнаты.');
      handleLeaveRoom();
    });

    socket.on('remote-mute', (_data: { from: string }) => {
      if (isMicActiveRef.current) {
        toggleMicRef.current();
      }
    });

    socket.on('knock-request', (req: { socketId: string; roomId: string; peerName: string }) => {
      sound.playMessage();
      setIncomingKnocks((prev) => {
        if (prev.some((k) => k.socketId === req.socketId)) return prev;
        return [...prev, req];
      });
    });

    socket.on('knock-cancelled', (data: { socketId: string }) => {
      setIncomingKnocks((prev) => prev.filter((k) => k.socketId !== data.socketId));
    });

    socket.on('knock-result', (data: { approved: boolean; roomId: string }) => {
      setWaitingKnock(null);
      if (data.approved) {
        sound.playConnect();
        joinRoomRef.current(data.roomId);
      } else {
        sound.playClick();
        setRoomAlertNotice({
          type: 'locked',
          title: 'Вход отклонён',
          message: 'Организатор отклонил ваш запрос или закрыл комнату.',
        });
      }
    });

    socket.on('room-destroyed', (data: { reason?: string }) => {
      sound.playClick();
      if (webrtcRef.current) {
        webrtcRef.current.destroy();
        webrtcRef.current = null;
      }
      setRoomId(null);
      setPin('');
      setMyPeerId('');
      setPeers([]);
      setTransfers((prev) => {
        prev.forEach((t) => t.blobUrl && URL.revokeObjectURL(t.blobUrl));
        return [];
      });
      setMessages([]);
      setScratchpadText('');
      setIsMicActive(false);
      setLocalAudioStream(null);
      setSpeakingPeers({});
      setSeatReactions([]);
      setIsScreenActive(false);
      setHasRemoteVideo(false);
      setRemoteAudioStreams({});
      setAudioAutoplayBlocked(false);
      setWaitingKnock(null);
      setIncomingKnocks([]);
      setKnockRequired(false);
      setIsLocked(false);
      setMaxSeats(8);
      setPeerSeats({});
      setMySeatIndex(0);
      window.history.replaceState({}, '', window.location.pathname);
      setRoomAlertNotice({
        type: 'locked',
        title: 'Комната уничтожена',
        message: data?.reason || 'Организатор экстренно завершил встречу.',
      });
    });

    socket.on('signal', ({ from, payload }: { from: string; payload: any }) => {
      if (webrtcRef.current) {
        webrtcRef.current.handleSignal(from, payload);
      }
    });

    return () => {
      socket.off('admin-status');
      socket.off('peer-joined');
      socket.off('peer-left');
      socket.off('peer-updated');
      socket.off('peer-mic-changed');
      socket.off('room-theme-changed');
      socket.off('room-config-updated');
      socket.off('peer-seat-changed');
      socket.off('kicked');
      socket.off('remote-mute');
      socket.off('knock-request');
      socket.off('knock-cancelled');
      socket.off('knock-result');
      socket.off('room-destroyed');
      socket.off('signal');
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !isConnected || roomId) return;
    if (!radarVisible) {
   socket.emit('lobby-leave');
   return;
 }
    socket.emit('lobby-join', {
      name: userName,
      deviceType,
      statusEmote: statusEmote || undefined,
    });
    socket.emit('lobby-query');

    const handleNearby = (peers: NearbyPeer[]) => {
      setNearbyPeers(peers);
    };

    const handleIncomingPair = (req: PairRequest) => {
      sound.playMessage();
      setIncomingPairRequest(req);
    };

    const handlePairCancelled = () => {
      setIncomingPairRequest(null);
    };

    const handlePairResult = (res: {
      roomId: string;
      pin: string;
      accepted: boolean;
      reason?: string;
    }) => {
      setIsPairing(false);
      setPairingTargetSocketId('');
      setPairingTargetName('');
      if (res.accepted) {
        sound.playConnect();
        handleJoinRoom(res.roomId, 'bridge');
      } else {
        const reason = res.reason || 'Устройство отклонило запрос на передачу файлов';
        setPairRejectionNotice(reason);
        sound.playClick();
      }
    };

    socket.on('nearby-peers', handleNearby);
    socket.on('incoming-pair-request', handleIncomingPair);
    socket.on('pair-request-cancelled', handlePairCancelled);
    socket.on('direct-pair-result', handlePairResult);

    return () => {
      socket.emit('lobby-leave');
      socket.off('nearby-peers', handleNearby);
      socket.off('incoming-pair-request', handleIncomingPair);
      socket.off('pair-request-cancelled', handlePairCancelled);
      socket.off('direct-pair-result', handlePairResult);
    };
  }, [socket, isConnected, roomId, userName, deviceType, radarVisible]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const modeParam = params.get('mode') as RoomMode | null;
    if (roomParam && !roomId) {
      handleJoinRoom(roomParam, modeParam || undefined);
    }
  }, [socket, isConnected]);

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
        avatar: userAvatar,
        adminFrame,
        statusEmote: statusEmote || undefined,
        deviceType,
        mode,
        maxSeats: 8,
        roomTheme,
        browserId: getBrowserDeviceId(),
      },
      (res: any) => {
        setIsLoading(false);
        if (res.success) {
          setRoomId(res.roomId);
          setPin(res.pin);
          setMyPeerId(res.peerId);
          setPeers(res.peers || []);
          if (res.maxSeats !== undefined) setMaxSeats(res.maxSeats);
          if (res.isLocked !== undefined) setIsLocked(res.isLocked);
          if (res.knockRequired !== undefined) setKnockRequired(res.knockRequired);
          if (res.currentRoomTheme) {
            setRoomTheme(res.currentRoomTheme);
          }
          if (res.peerSeats) setPeerSeats(res.peerSeats);
          if (res.mySeat !== undefined) setMySeatIndex(res.mySeat);
          setupWebRTC(socket, res.peerId);
          const modeQuery = mode === 'meeting' ? '&mode=meeting' : '';
          const targetRoom = res.roomId || res.pin;
          window.history.pushState({}, '', `?room=${targetRoom}${modeQuery}`);
        } else {
          setErrorMessage(res.error || 'Не удалось создать комнату');
        }
      }
    );
  };

  const handlePairWithNearby = (targetSocketId: string) => {
    if (!socket) return;
    const targetPeer = nearbyPeers.find((p) => p.socketId === targetSocketId);
    const targetName = targetPeer?.name || 'Устройство';
    setPairingTargetName(targetName);
    setPairingTargetSocketId(targetSocketId);
    setIsPairing(true);
    setErrorMessage(undefined);
    setPairRejectionNotice(null);

    socket.emit('direct-pair-request', {
      toSocketId: targetSocketId,
      myName: userName,
      myDevice: deviceType,
    });
  };

  const handleCancelPairRequest = () => {
    if (!socket) return;
    if (pairingTargetSocketId) {
      socket.emit('cancel-pair-request', { toSocketId: pairingTargetSocketId });
    }
    setIsPairing(false);
    setPairingTargetSocketId('');
    setPairingTargetName('');
  };

  const handleAcceptPair = () => {
    if (!socket || !incomingPairRequest) return;
    const req = incomingPairRequest;
    sound.playConnect();
    socket.emit('direct-pair-response', {
      toSocketId: req.fromSocketId,
      roomId: req.roomId,
      pin: req.pin,
      accepted: true,
    });
    setIncomingPairRequest(null);
    handleJoinRoom(req.roomId, 'bridge');
  };

  const handleRejectPair = () => {
    if (!socket || !incomingPairRequest) return;
    const req = incomingPairRequest;
    sound.playClick();
    socket.emit('direct-pair-response', {
      toSocketId: req.fromSocketId,
      roomId: req.roomId,
      pin: req.pin,
      accepted: false,
      reason: 'Устройство отклонило запрос на передачу файлов',
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
        avatar: userAvatar,
        adminFrame,
        statusEmote: statusEmote || undefined,
        deviceType,
        browserId: getBrowserDeviceId(),
      },
      (res: any) => {
        setIsLoading(false);
        if (res.success) {
          setRoomId(res.roomId);
          setPin(res.pin);
          setMyPeerId(res.peerId);
          setPeers(res.peers || []);
          if (res.maxSeats !== undefined) setMaxSeats(res.maxSeats);
          if (res.isLocked !== undefined) setIsLocked(res.isLocked);
          if (res.knockRequired !== undefined) setKnockRequired(res.knockRequired);
          const resolvedMode = (res.mode as RoomMode) || targetMode;
          setRoomMode(resolvedMode);
          setActiveTab(resolvedMode);
          if (res.currentRoomTheme) {
            setRoomTheme(res.currentRoomTheme);
            localStorage.setItem('bridgik_pixel_room', res.currentRoomTheme);
          }
          if (res.peerSeats) setPeerSeats(res.peerSeats);
          if (res.mySeat !== undefined) setMySeatIndex(res.mySeat);
          setupWebRTC(socket, res.peerId);
          const modeQuery = resolvedMode === 'meeting' ? '&mode=meeting' : '';
          const targetRoom = res.roomId || res.pin;
          window.history.pushState({}, '', `?room=${targetRoom}${modeQuery}`);
        } else {
          sound.playClick();
          window.history.replaceState({}, '', window.location.pathname);
          const errText = res.error || 'Комната не найдена';
          if (res.code === 'KNOCK_REQUIRED' && res.roomId) {
            setWaitingKnock({ roomId: res.roomId, pin: res.pin || pinOrId });
            socket.emit('knock', { roomId: res.roomId, peerName: userName });
            return;
          }
          if (
            res.code === 'ALREADY_IN_ROOM_SAME_BROWSER' ||
            errText.includes('другой вкладке')
          ) {
            setRoomAlertNotice({
              type: 'duplicate',
              title: 'Комната уже открыта',
              message:
                errText ||
                'Вы уже находитесь в этой комнате в другой вкладке браузера. Чтобы подключить второго участника, откройте окно Инкогнито (Ctrl+Shift+N) или другой браузер.',
            });
          } else if (res.code === 'RATE_LIMITED') {
            setRoomAlertNotice({
              type: 'locked',
              title: 'Слишком много попыток',
              message: errText,
            });
          } else if (
            res.code === 'ROOM_LOCKED' ||
            errText.includes('закрыт') ||
            errText.includes('заблокирован')
          ) {
            setRoomAlertNotice({
              type: 'locked',
              title: 'Комната закрыта',
              message: 'Организатор заблокировал вход в эту комнату. Подключение невозможно.',
            });
          } else if (
            res.code === 'ROOM_FULL' ||
            errText.includes('лимит') ||
            errText.includes('переполн')
          ) {
            setRoomAlertNotice({
              type: 'full',
              title: 'Комната переполнена',
              message: errText || 'В комнате достигнут лимит мест. Свободных мест нет.',
            });
          } else {
            setRoomAlertNotice({
              type: 'notFound',
              title: 'Комната не найдена',
              message: errText || 'Комната не найдена или код неверен.',
            });
          }
          setErrorMessage(errText);
        }
      }
    );
  };
  joinRoomRef.current = handleJoinRoom;

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
    setTransfers((prev) => {
      prev.forEach((t) => {
        if (t.blobUrl) URL.revokeObjectURL(t.blobUrl);
      });
      return [];
    });
    setMessages([]);
    setScratchpadText('');
    setAudioAutoplayBlocked(false);
    setIsMicActive(false);
    setLocalAudioStream(null);
    setSpeakingPeers({});
    setSeatReactions([]);
    setIsScreenActive(false);
    setHasRemoteVideo(false);
    setRemoteAudioStreams({});
    setMaxSeats(8);
    setIsLocked(false);
    setKnockRequired(false);
    setIncomingKnocks([]);
    setPeerSeats({});
    setMySeatIndex(0);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleUpdateMaxSeats = (newMax: number) => {
    setMaxSeats(newMax);
    if (socket && (pin || roomId)) {
      socket.emit('update-room-config', {
        roomId: pin || roomId,
        maxSeats: newMax,
      });
    }
  };

  const handleToggleLockRoom = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    if (socket && (pin || roomId)) {
      socket.emit('update-room-config', {
        roomId: pin || roomId,
        isLocked: nextLocked,
      });
    }
  };

  const handleToggleKnockRequired = () => {
    const nextKnock = !knockRequired;
    setKnockRequired(nextKnock);
    if (socket && (pin || roomId)) {
      socket.emit('update-room-config', {
        roomId: pin || roomId,
        knockRequired: nextKnock,
      });
    }
  };

  const handleKnockDecision = (
    targetSocketId: string,
    targetRoomId: string,
    approved: boolean
  ) => {
    if (!socket) return;
    sound.playClick();
    socket.emit('knock-decision', {
      roomId: targetRoomId,
      toSocketId: targetSocketId,
      approved,
    });
    setIncomingKnocks((prev) => prev.filter((k) => k.socketId !== targetSocketId));
  };

  const handleCancelKnock = () => {
    if (socket && waitingKnock) {
      socket.emit('cancel-knock', { roomId: waitingKnock.roomId });
    }
    setWaitingKnock(null);
  };

  const handlePanicDestroy = () => {
    const amHost =
      peersRef.current.find((p) => p.id === myPeerId)?.isHost ??
      peersRef.current.length <= 1;
    if (socket && amHost && (pin || roomId)) {
      socket.emit('destroy-room', { roomId: pin || roomId });
    }
    handleLeaveRoom();
    setRoomAlertNotice({
      type: 'locked',
      title: 'Экстренный выход (Паника)',
      message: amHost
        ? 'Комната уничтожена для всех, каналы и локальная память очищены.'
        : 'Все каналы разорваны, локальная история и буфер стёрты.',
    });
  };

  const handleSwitchSeat = (seatIdx: number) => {
    setMySeatIndex(seatIdx);
    if (socket && (pin || roomId)) {
      socket.emit('change-seat', {
        roomId: pin || roomId,
        seatIndex: seatIdx,
      });
    }
  };

  const handleChangePeerVolume = (peerId: string, volumePercent: number) => {
    setPeerVolumes((prev) => ({
      ...prev,
      [peerId]: Math.max(0, Math.min(200, volumePercent)),
    }));
  };

  const handleSendReaction = (emoteUrl: string, emoteName?: string) => {
    sound.playClick();
    if (myPeerId) {
      pushSeatReaction(myPeerId, emoteUrl);
    }
    webrtcRef.current?.sendReaction(emoteUrl, emoteName);
  };

  const handleSendFiles = (files: FileList | File[]) => {
    if (!webrtcRef.current) return;
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      webrtcRef.current?.sendFile(file);
    });
  };

  const handleSendText = (text: string, isClipboard = false, isBurner = false) => {
    if (!webrtcRef.current) return;
    webrtcRef.current.sendTextMessage(text, isClipboard, isBurner);
  };

  const handleSendSharedBundle = () => {
    if (pendingSharedFiles.length > 0) {
      handleSendFiles(pendingSharedFiles);
    }
    if (pendingSharedText) {
      handleSendText(pendingSharedText, true);
    }
    setPendingSharedFiles([]);
    setPendingSharedText('');
  };

  const handleDismissSharedBundle = () => {
    setPendingSharedFiles([]);
    setPendingSharedText('');
  };

  const handleUpdateScratchpad = (text: string) => {
    setScratchpadText(text);
    if (webrtcRef.current) {
      webrtcRef.current.sendScratchpadUpdate(text);
      webrtcRef.current.sendScratchpadTyping();
    }
  };

  const handleCancelTransfer = (id: string) => {
    if (!webrtcRef.current) return;
    webrtcRef.current.cancelTransfer(id);
  };

  const handleAcceptFile = async (fileId: string) => {
    if (webrtcRef.current) {
      await webrtcRef.current.acceptIncomingFile(fileId);
    }
  };

  const handleRejectFile = (fileId: string) => {
    if (webrtcRef.current) {
      webrtcRef.current.rejectIncomingFile(fileId);
    }
  };

  const handleToggleMic = async () => {
    if (!webrtcRef.current) {
      sound.playClick();
      setRoomAlertNotice({
        type: 'general',
        title: 'Микрофон',
        message: 'Комната инициализируется, подождите 1-2 секунды и нажмите снова.',
      });
      return false;
    }

    try {
      const active = await webrtcRef.current.toggleMicrophone();
      setIsMicActive(active);
      sound.playClick();
      setPeers((prev) =>
        prev.map((p) => (p.id === myPeerId ? { ...p, isMicActive: active } : p))
      );
      if (socket && roomId) {
        socket.emit('toggle-mic', { roomId, isMicActive: active });
      }
      return active;
    } catch (err: any) {
      sound.playClick();
      console.error('Microphone toggle error:', err);
      setRoomAlertNotice({
        type: 'general',
        title: 'Ошибка микрофона',
        message: err.message || 'Не удалось получить доступ к микрофону.',
      });
      setIsMicActive(false);
      return false;
    }
  };
  toggleMicRef.current = handleToggleMic;

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
    const host = isLocalhost && lanIp ? `${lanIp}:${window.location.port}` : window.location.host;
    const modeQuery = roomMode === 'meeting' ? '&mode=meeting' : '';
    const targetRoom = roomId || pin;
    return `${window.location.protocol}//${host}?room=${targetRoom}${modeQuery}`;
  })();
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  const activeTransfersCount = transfers.filter(
    (t) =>
      t.status === 'transferring' ||
      t.status === 'pending' ||
      t.status === 'waiting_receiver'
  ).length;
  const otherPeersCount = peers.filter((p) => p.id !== myPeerId).length;

  // Screen Wake Lock API: Keep mobile/tablet/desktop screen awake during active transfers
  useScreenWakeLock(activeTransfersCount > 0);

  const requestLeaveRoom = (source: 'header' | 'button') => {
    if (!roomId) return;
    const hasImportantActivity =
      activeTransfersCount > 0 || otherPeersCount > 0 || isMicActive || isScreenActive;

    if (source === 'header' || hasImportantActivity) {
      sound.playClick();
      setIsLeaveConfirmOpen(true);
      return;
    }
    handleLeaveRoom();
  };

  useEffect(() => {
    const shouldProtectTab = Boolean(roomId) || activeTransfersCount > 0;
    if (!shouldProtectTab) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomId, activeTransfersCount, otherPeersCount, isMicActive, isScreenActive]);

  useEffect(() => {
    let section = 'Мост';
    if (activeTab === 'legal') {
      section = 'Условия';
    } else if (activeTab === 'pricing') {
      section = 'Тарифы';
    } else if (activeTab === 'about') {
      section = 'О сервисе';
    } else if (activeTab === 'profile') {
      section = 'Профиль';
    } else if (roomId) {
      const modeTitle = roomMode === 'meeting' ? 'Комната' : 'Мост';
      section = pin ? `${modeTitle} #${pin}` : modeTitle;
    } else if (activeTab === 'meeting') {
      section = 'Комната';
    }
    document.title = `${section} · bridgik`;
  }, [activeTab, roomId, roomMode, pin]);

  const getThemeWrapperClass = () => {
    return 'bg-[#171717] text-[#f2f2f2] selection:bg-[#789d2a] selection:text-white';
  };

  return (
    <div
      className={`min-h-screen flex flex-col overflow-x-hidden transition-colors ${getThemeWrapperClass()}`}
    >
      <Navbar
        userName={userName}
        onUpdateUserName={handleUpdateUserName}
        userAvatar={userAvatar}
        onUpdateUserAvatar={handleUpdateUserAvatar}
        isAdmin={isAdmin}
        adminFrame={adminFrame}
        onUpdateAdminFrame={handleUpdateAdminFrame}
        statusEmote={statusEmote}
        onUpdateStatusEmote={handleUpdateStatusEmote}
        clientIp={clientIp}
        deviceType={deviceType}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isConnected={isConnected}
        onGoHome={roomId ? () => requestLeaveRoom('header') : () => setActiveTab('bridge')}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userProfile={userProfile}
        onOpenAuthModal={(provider = 'yandex') => {
          setAuthModalProvider(provider);
          setIsAuthModalOpen(true);
        }}
        onOpenProfile={(tab = 'appearance') => {
          setProfileSectionTab(tab);
          setActiveTab('profile');
        }}
        onToggleDemoTier={handleToggleDemoTier}
        onLogout={handleLogout}

        onOpenSettings={() => setIsSettingsOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        roomId={roomId}
        roomPin={pin}
        roomMode={roomMode}
        onReturnToRoom={() => setActiveTab(roomMode)}
      />
      <main className="flex-1">
        {activeTab === 'legal' ? (
          <LegalView onBack={() => setActiveTab('bridge')} defaultDoc={legalDoc} />
        ) : activeTab === 'pricing' ? (
          <PricingView
            onBack={() => setActiveTab('bridge')}
            onOpenAuth={(provider = 'yandex') => {
              setAuthModalProvider(provider);
              setIsAuthModalOpen(true);
            }}
            onOpenProfile={(tab = 'pro') => {
              setProfileSectionTab(tab);
              setActiveTab('profile');
            }}
            onGoToBridge={() => setActiveTab('bridge')}
            userProfile={userProfile}
          />
        ) : activeTab === 'about' ? (
          <AboutView onBack={() => setActiveTab('bridge')} />
        ) : activeTab === 'profile' && userProfile ? (
          <ProfileView
            key={profileSectionTab}
            profile={userProfile}
            isAdmin={isAdmin}
            clientIp={clientIp}
            initialTab={profileSectionTab}
            onBack={() => setActiveTab(roomId ? roomMode : 'bridge')}
            onUpdateDisplayName={(name) => {
              handleUpdateUserName(name);
              saveProfile({ ...userProfile, displayName: name });
              patchBackendProfile({ displayName: name });
            }}
            onUpdateAvatar={(avatar) => {
              handleUpdateUserAvatar(avatar);
              saveProfile({ ...userProfile, avatarUrl: avatar });
              patchBackendProfile({ avatarUrl: avatar });
            }}
            onUpdateFrame={(frame) => {
              handleUpdateAdminFrame(frame);
              saveProfile({ ...userProfile, activeFrame: frame });
              patchBackendProfile({ activeFrame: frame });
            }}
            onUpdateStatusEmote={(emote) => {
              handleUpdateStatusEmote(emote);
              saveProfile({ ...userProfile, activeEmote: emote });
              patchBackendProfile({ activeEmote: emote });
            }}
            onUpdateDefaultTheme={(themeId) => {
              setRoomTheme(themeId);
              localStorage.setItem('bridgik_pixel_room', themeId);
              saveProfile({ ...userProfile, defaultRoomTheme: themeId });
              patchBackendProfile({ defaultRoomTheme: themeId });
            }}
            onOpenAuthModal={(provider = 'yandex') => {
              setAuthModalProvider(provider);
              setIsAuthModalOpen(true);
            }}
            onToggleDemoTier={handleToggleDemoTier}
            onRemoveDevice={handleRemoveDevice}
            onCreateBridgeWithDevice={handleCreateBridgeWithDevice}
            onOpenDropModal={(device) => {
              setDropTargetDevice(device || null);
              setIsDropModalOpen(true);
            }}
          />
        ) : !roomId ? (
          <HomeView
            onCreateBridge={() => handleCreateRoom('bridge')}
            onJoinBridge={(pinOrId) => handleJoinRoom(pinOrId, 'bridge')}
            onCreateMeeting={handleCreateMeeting}
            onJoinMeeting={(pinOrId) => handleJoinRoom(pinOrId, 'meeting')}
            activeMode={activeTab === 'meeting' ? 'meeting' : 'bridge'}
            onSelectMode={(mode) => setActiveTab(mode)}
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
        ) : roomMode === 'meeting' ? (
          <MeetingRoomView
            socket={socket}
            roomId={roomId}
            pin={pin}
            myPeerId={myPeerId}
            myUserName={userName}
            onUpdateUserName={handleUpdateUserName}
            userAvatar={userAvatar}
            onUpdateUserAvatar={handleUpdateUserAvatar}
            isAdmin={isAdmin}
            adminFrame={adminFrame}
            onUpdateAdminFrame={handleUpdateAdminFrame}
            statusEmote={statusEmote}
            onUpdateStatusEmote={handleUpdateStatusEmote}
            clientIp={clientIp}
            roomTheme={roomTheme}
            onRoomThemeChange={(theme) => setRoomTheme(theme)}
            maxSeats={maxSeats}
            onUpdateMaxSeats={handleUpdateMaxSeats}
            isLocked={isLocked}
            onToggleLockRoom={handleToggleLockRoom}
            knockRequired={knockRequired}
            onToggleKnockRequired={handleToggleKnockRequired}
            onPanicDestroy={handlePanicDestroy}
            peerSeats={peerSeats}
            mySeatIndex={mySeatIndex}
            onSwitchSeat={handleSwitchSeat}
            speakingPeers={speakingPeers}
            peerVolumes={peerVolumes}
            onChangePeerVolume={handleChangePeerVolume}
            seatReactions={seatReactions}
            onSendReaction={handleSendReaction}
            roomUrl={roomUrl}
            peers={peers}
            peerConnectionTypes={peerConnectionTypes}
            transfers={transfers}
            messages={messages}
            scratchpadText={scratchpadText}
            scratchpadTypingUser={scratchpadTypingUser}
            onUpdateScratchpad={handleUpdateScratchpad}
            onSendFiles={handleSendFiles}
            onSendText={handleSendText}
            onLeaveRoom={() => requestLeaveRoom('button')}
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
            userAvatar={userAvatar}
            isAdmin={isAdmin}
            adminFrame={adminFrame}
            statusEmote={statusEmote}
            roomUrl={roomUrl}
            peers={peers}
            peerConnectionTypes={peerConnectionTypes}
            transfers={transfers}
            messages={messages}
            onSendFiles={handleSendFiles}
            onSendText={handleSendText}
            onCancelTransfer={handleCancelTransfer}
            onAcceptFile={handleAcceptFile}
            onRejectFile={handleRejectFile}
            onLeaveRoom={() => requestLeaveRoom('button')}
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
            pendingSharedFiles={pendingSharedFiles}
            pendingSharedText={pendingSharedText}
            onSendSharedBundle={handleSendSharedBundle}
            onDismissSharedBundle={handleDismissSharedBundle}
          />
        )}
      </main>

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        pin={pin}
        roomUrl={roomUrl}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        initialProvider={authModalProvider}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onOpenLegal={(doc) => {
          setLegalDoc(doc);
          setActiveTab('legal');
        }}
      />

      {isDropModalOpen && (
        <DropModal
          targetDevice={dropTargetDevice}
          userLicenseKey={
            userProfile?.licenseKeyPreview ||
            localStorage.getItem('bridgik_license_key') ||
            undefined
          }
          senderName={userName}
          onClose={() => {
            setIsDropModalOpen(false);
            setDropTargetDevice(null);
          }}
          onDropCreated={() => {
            const key = userProfile?.licenseKeyPreview || localStorage.getItem('bridgik_license_key');
            fetchPendingDrops(key || undefined);
          }}
        />
      )}

      {/* Pending Drop & Go Files notification */}
      {pendingDrops.length > 0 && (
        <aside
          aria-label="Входящие файлы в буфере Drop & Go"
          className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[145] w-[95%] max-w-xl animate-in slide-in-from-top-6 duration-300"
        >
          <div className="p-4 rounded-2xl bg-[#181f14]/95 border-2 border-[#789d2a] shadow-[0_12px_45px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
              <div className="w-11 h-11 rounded-xl bg-[#789d2a]/20 border border-[#789d2a] flex items-center justify-center text-[#9ac43e] shrink-0">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Файл в буфере Drop & Go</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#789d2a]/30 text-[#bbf348]">
                    {pendingDrops.length} шт
                  </span>
                </p>
                <p className="text-xs text-[#bbf348] truncate font-medium">
                  <strong>{pendingDrops[0].fileName}</strong> ({formatBytes(pendingDrops[0].fileSize)}) от {pendingDrops[0].senderName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => handleDownloadPendingDrop(pendingDrops[0])}
                className="px-4 py-2 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-black font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#789d2a]/30"
              >
                <Download className="w-4 h-4" />
                <span>Скачать</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeletePendingDrop(pendingDrops[0].id)}
                className="p-2 rounded-xl bg-[#282828] hover:bg-[#333333] text-[#a0a0a0] hover:text-red-400 transition-colors cursor-pointer"
                title="Удалить из буфера"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      <LeaveConfirmModal
        isOpen={isLeaveConfirmOpen}
        roomMode={roomMode}
        pin={pin}
        activeTransfersCount={activeTransfersCount}
        otherPeersCount={otherPeersCount}
        isMicOrScreenActive={isMicActive || isScreenActive}
        onStay={() => setIsLeaveConfirmOpen(false)}
        onConfirmLeave={() => {
          setIsLeaveConfirmOpen(false);
          handleLeaveRoom();
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        autoDownload={autoDownload}
        onToggleAutoDownload={handleToggleAutoDownload}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        radarVisible={radarVisible}
        onToggleRadarVisible={() => {
          setRadarVisible((v) => {
            const next = !v;
            localStorage.setItem('bridgik_radar_visible', String(next));
            return next;
          });
        }}
        stickyAutoAccept={stickyAutoAccept}
        onToggleStickyAutoAccept={() => {
          setStickyAutoAccept((v) => {
            const next = !v;
            localStorage.setItem('bridgik_sticky_auto_accept', String(next));
            return next;
          });
        }}
        participantToasts={participantToasts}
        onToggleParticipantToasts={() => {
          setParticipantToasts((v) => {
            const next = !v;
            localStorage.setItem('bridgik_participant_toasts', String(next));
            return next;
          });
        }}
        tgNotifyDownload={tgNotifyDownload}
        onToggleTgNotifyDownload={() => {
          setTgNotifyDownload((v) => {
            const next = !v;
            localStorage.setItem('bridgik_tg_notify_download', String(next));
            return next;
          });
        }}
        tgNotifyDevice={tgNotifyDevice}
        onToggleTgNotifyDevice={() => {
          setTgNotifyDevice((v) => {
            const next = !v;
            localStorage.setItem('bridgik_tg_notify_device', String(next));
            return next;
          });
        }}
        hasTelegramLinked={Boolean(userProfile?.providers.telegram)}
      />

      {/* 1. Incoming Pair Request */}
      {incomingPairRequest && (
        <aside
          aria-label="Входящий запрос на передачу"
          className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl animate-in slide-in-from-top-6 duration-300"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1c2214]/95 border-2 border-[#789d2a] shadow-[0_12px_45px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-[#789d2a]/20 border border-[#789d2a] flex items-center justify-center text-[#9ac43e] shrink-0 relative">
                <span className="absolute inset-0 rounded-xl border border-[#789d2a] animate-ping opacity-35 pointer-events-none" />
                {incomingPairRequest.fromDevice === 'mobile' ? (
                  <Smartphone className="w-6 h-6" />
                ) : (
                  <Monitor className="w-6 h-6" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold text-[#ededed] leading-snug">
                  Входящее подключение для передачи файлов
                </p>
                <p className="text-sm sm:text-base text-[#9ac43e] truncate">
                  <strong className="text-[#c7ea6a]">{incomingPairRequest.fromName}</strong> хочет
                  передать вам файлы
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                onClick={handleAcceptPair}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-base transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#789d2a]/30"
              >
                <Check className="w-5 h-5" />
                <span>Принять</span>
              </button>
              <button
                onClick={handleRejectPair}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-bold text-base transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X className="w-5 h-5" />
                <span>Отклонить</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Waiting Knock Approval (Guest) */}
      {waitingKnock && (
        <div className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1b1b1f] border-2 border-[#789d2a] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#789d2a]/20 border border-[#789d2a] flex items-center justify-center text-[#9ac43e] mx-auto animate-pulse">
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-[#ededed] mb-1">
                Стучимся в комнату...
              </h3>
              <p className="text-sm sm:text-base text-[#aaaaaa]">
                Код комнаты:{' '}
                <strong className="font-mono text-[#9ac43e]">{waitingKnock.pin}</strong>.
                Организатор включил зал ожидания — подождите одобрения входа.
              </p>
            </div>
            <button
              onClick={handleCancelKnock}
              className="w-full py-3 rounded-xl bg-[#2a2a32] hover:bg-[#353540] text-[#ededed] font-bold text-base transition-colors cursor-pointer"
            >
              Отменить и вернуться
            </button>
          </div>
        </div>
      )}

      {/* Incoming Knock Requests (Host) */}
      {incomingKnocks.length > 0 && (
        <aside className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[145] w-[95%] max-w-xl space-y-2.5">
          {incomingKnocks.map((k) => (
            <div
              key={k.socketId}
              className="p-4 rounded-2xl bg-[#1c2214]/95 border-2 border-[#789d2a] shadow-[0_12px_45px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-4"
            >
              <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                <div className="w-11 h-11 rounded-xl bg-[#789d2a]/20 border border-[#789d2a] flex items-center justify-center text-[#9ac43e] shrink-0">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-[#ededed]">Стук в комнату</p>
                  <p className="text-sm text-[#9ac43e] truncate">
                    <strong>{k.peerName}</strong> просит разрешения войти
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => handleKnockDecision(k.socketId, k.roomId, true)}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Впустить</span>
                </button>
                <button
                  onClick={() => handleKnockDecision(k.socketId, k.roomId, false)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#2d2d2d] hover:bg-[#ed2b3b] text-[#ededed] hover:text-white font-bold text-sm cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Отклонить</span>
                </button>
              </div>
            </div>
          ))}
        </aside>
      )}

      {/* 2. Pair Request Rejection Alert */}
      {pairRejectionNotice && (
        <aside
          aria-label="Запрос отклонен"
          className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-in slide-in-from-top-6 duration-300"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-[#221616]/95 border-2 border-[#ed2b3b]/60 shadow-[0_12px_45px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#ed2b3b]/20 border border-[#ed2b3b]/40 flex items-center justify-center text-[#ef9282] shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold text-[#ededed] leading-snug">
                  Запрос на передачу отклонен
                </p>
                <p className="text-sm sm:text-base text-[#ef9282] truncate">
                  {pairRejectionNotice}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPairRejectionNotice(null)}
              className="px-4 py-2 rounded-xl bg-[#2e1d1d] hover:bg-[#3d2727] text-[#ededed] text-sm font-bold border border-[#ed2b3b]/30 transition-colors cursor-pointer shrink-0"
            >
              Закрыть
            </button>
          </div>
        </aside>
      )}

      {/* 3. Sender Waiting Notification */}
      {isPairing && (
        <aside
          aria-label="Ожидание ответа"
          className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-in slide-in-from-top-6 duration-300"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-[#171c12]/95 border-2 border-[#789d2a]/60 shadow-[0_12px_45px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#789d2a]/20 border border-[#789d2a] flex items-center justify-center text-[#9ac43e] shrink-0">
                <Radio className="w-6 h-6 animate-pulse text-[#9ac43e]" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold text-[#ededed] leading-snug">
                  Ожидание подтверждения...
                </p>
                <p className="text-sm sm:text-base text-[#9ac43e] truncate">
                  Запрос отправлен на устройство{' '}
                  <strong>{pairingTargetName || 'собеседника'}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelPairRequest}
              className="px-4 py-2 rounded-xl bg-[#262626] hover:bg-[#333333] text-[#ededed] text-sm font-bold border border-[#3a3a3a] transition-colors cursor-pointer shrink-0"
            >
              Отмена
            </button>
          </div>
        </aside>
      )}

      {/* 4. Room Alert Notification */}
      {roomAlertNotice && (
        <aside
          aria-label={roomAlertNotice.title}
          className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-in slide-in-from-top-6 duration-300"
        >
          <div
            className={`p-4 sm:p-5 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center justify-between gap-3.5 border-2 ${
              roomAlertNotice.type === 'duplicate'
                ? 'bg-[#221c12]/95 border-[#f59e0b]/80 shadow-[0_0_35px_rgba(245,158,11,0.25)]'
                : roomAlertNotice.type === 'locked'
                ? 'bg-[#221614]/95 border-[#ed2b3b]/60'
                : roomAlertNotice.type === 'full'
                ? 'bg-[#221a14]/95 border-[#f97316]/70'
                : 'bg-[#201818]/95 border-[#ed2b3b]/50'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  roomAlertNotice.type === 'duplicate'
                    ? 'bg-[#f59e0b]/20 border-[#f59e0b]/50 text-[#fbbf24]'
                    : roomAlertNotice.type === 'locked'
                    ? 'bg-[#ed2b3b]/20 border-[#ed2b3b]/40 text-[#ef9282]'
                    : roomAlertNotice.type === 'full'
                    ? 'bg-[#f97316]/20 border-[#f97316]/40 text-[#f97316]'
                    : 'bg-[#ed2b3b]/20 border-[#ed2b3b]/40 text-[#ef9282]'
                }`}
              >
                {roomAlertNotice.type === 'duplicate' ? (
                  <Copy className="w-6 h-6" />
                ) : roomAlertNotice.type === 'locked' ? (
                  <Lock className="w-6 h-6" />
                ) : roomAlertNotice.type === 'full' ? (
                  <Users className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold text-[#ededed] leading-snug">
                  {roomAlertNotice.title}
                </p>
                <p
                  className={`text-sm sm:text-base leading-snug ${
                    roomAlertNotice.type === 'duplicate'
                      ? 'text-[#fde68a]'
                      : roomAlertNotice.type === 'locked'
                      ? 'text-[#ef9282]'
                      : roomAlertNotice.type === 'full'
                      ? 'text-[#fb923c]'
                      : 'text-[#ef9282]'
                  }`}
                >
                  {roomAlertNotice.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setRoomAlertNotice(null)}
              className="px-4 py-2 rounded-xl bg-[#282828] hover:bg-[#333333] text-[#ededed] text-sm font-bold border border-white/10 transition-colors cursor-pointer shrink-0"
            >
              Закрыть
            </button>
          </div>
        </aside>
      )}

      {/* 5. Floating Participant Joined / Left Toast Notification */}
      {participantToasts && participantNotice && (
        <aside
          aria-label="Уведомление об участнике"
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[150] px-4 py-2.5 rounded-2xl backdrop-blur-xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-4 duration-200 pointer-events-none select-none border-2 ${
            participantNotice.type === 'joined'
              ? 'bg-[#141d11]/95 border-[#789d2a] shadow-[0_0_25px_rgba(120,157,42,0.45)] text-[#bbf348]'
              : 'bg-[#221315]/95 border-[#ed2b3b] shadow-[0_0_25px_rgba(237,43,59,0.45)] text-[#ef9282]'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
              participantNotice.type === 'joined'
                ? 'bg-[#789d2a]/25 border-[#789d2a] text-[#9ac43e]'
                : 'bg-[#ed2b3b]/25 border-[#ed2b3b] text-[#ef9282]'
            }`}
          >
            {participantNotice.type === 'joined' ? (
              <UserCheck className="w-4 h-4" />
            ) : (
              <UserMinus className="w-4 h-4" />
            )}
          </div>
          <span>
            {participantNotice.type === 'joined'
              ? `${participantNotice.name} присоединился к комнате`
              : `${participantNotice.name} покинул комнату`}
          </span>
        </aside>
      )}

      <Footer
        onOpenAbout={() => setActiveTab('about')}
        onOpenLegal={(doc) => {
          setLegalDoc(doc);
          setActiveTab('legal');
        }}
        onOpenPricing={() => setActiveTab('pricing')}
      />

      {audioAutoplayBlocked && Object.keys(remoteAudioStreams).length > 0 && (
        <button
          onClick={() => {
            getSharedAudioContext()?.resume().catch(() => {});
            document.querySelectorAll('audio[data-peer-audio="true"]').forEach((el) => {
              (el as HTMLAudioElement).play().catch(() => {});
            });
            setAudioAutoplayBlocked(false);
          }}
          className="fixed bottom-5 right-5 z-[160] px-4 py-2.5 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold shadow-lg cursor-pointer animate-bounce"
        >
          🔊 Включить звук участников
        </button>
      )}

      {Object.entries(remoteAudioStreams).map(([peerId, stream]) => (
        <RemotePeerAudio
          key={peerId}
          stream={stream}
          volumePercent={peerVolumes[peerId] ?? 100}
          onSpeakingChange={(speaking) =>
            setSpeakingPeers((prev) =>
              prev[peerId] === speaking ? prev : { ...prev, [peerId]: speaking }
            )
          }
          onAutoplayBlocked={() => setAudioAutoplayBlocked(true)}
        />
      ))}
    </div>
  );
}

function RemotePeerAudio({
  stream,
  volumePercent = 100,
  onSpeakingChange,
  onAutoplayBlocked,
}: {
  stream: MediaStream;
  volumePercent?: number;
  onSpeakingChange?: (speaking: boolean) => void;
  onAutoplayBlocked?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isIOS =
    typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(2, volumePercent / 100));
    } else if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volumePercent / 100));
    }
  }, [volumePercent]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !stream) return;

    audio.srcObject = stream;

    const ctx = !isIOS ? getSharedAudioContext() : null;
    let source: MediaStreamAudioSourceNode | null = null;
    let gainNode: GainNode | null = null;
    let analyser: AnalyserNode | null = null;
    let rafId = 0;
    let stopped = false;
    let stopMonitor: (() => void) | null = null;

    if (ctx) {
      try {
        // Mute native element so Web Audio GainNode handles 0-200% output cleanly without echo
        audio.muted = true;
        source = ctx.createMediaStreamSource(stream);
        gainNode = ctx.createGain();
        gainNode.gain.value = Math.max(0, Math.min(2, volumePercent / 100));
        gainNodeRef.current = gainNode;

        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.connect(analyser);

        const data = new Uint8Array(analyser.fftSize);
        let lastSpokeAt = 0;
        let isSpeaking = false;

        const tick = () => {
          if (stopped || !analyser) return;
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const norm = (data[i] - 128) / 128;
            sum += norm * norm;
          }
          const rms = Math.sqrt(sum / data.length);
          const now = performance.now();
          if (rms > 0.015) {
            lastSpokeAt = now;
            if (!isSpeaking) {
              isSpeaking = true;
              onSpeakingChange?.(true);
            }
          } else if (isSpeaking && now - lastSpokeAt > 300) {
            isSpeaking = false;
            onSpeakingChange?.(false);
          }
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      } catch {
        gainNodeRef.current = null;
        audio.muted = false;
        audio.volume = Math.max(0, Math.min(1, volumePercent / 100));
      }
    } else {
      audio.muted = false;
      audio.volume = Math.max(0, Math.min(1, volumePercent / 100));
      stopMonitor = monitorStreamVoiceActivity(stream, (speaking) => {
        onSpeakingChange?.(speaking);
      });
    }

    audio.play().catch((err) => {
      if (err?.name !== 'AbortError') {
        onAutoplayBlocked?.();
      }
    });

    const timer = setTimeout(() => {
      if (audio.paused || (ctx && ctx.state === 'suspended')) {
        onAutoplayBlocked?.();
      }
    }, 300);

    return () => {
      stopped = true;
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      stopMonitor?.();
      try {
        source?.disconnect();
        gainNode?.disconnect();
        analyser?.disconnect();
      } catch {}
      gainNodeRef.current = null;
      onSpeakingChange?.(false);
    };
  }, [stream]);

  return <audio ref={audioRef} data-peer-audio="true" autoPlay playsInline />;
}