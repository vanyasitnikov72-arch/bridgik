export interface PeerInfo {
  id: string;
  socketId: string;
  name: string;
  avatar?: string;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  statusEmote?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  joinedAt: number;
  isHost: boolean;
  isAdmin?: boolean;
  isMicActive?: boolean;
  browserId?: string;
}

export interface Room {
  id: string;
  pin: string;
  createdAt: number;
  peers: Map<string, PeerInfo>;
  knockRequired?: boolean;
  approvedSockets?: Set<string>;
  pendingKnockSockets?: Set<string>;
  mode?: 'bridge' | 'meeting';
  maxSeats?: number;
  isLocked?: boolean;
  currentRoomTheme?: string;
  peerSeats?: Record<string, number>;
}

export interface SignalData {
  from: string;
  to: string;
  payload: any;
}