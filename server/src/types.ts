export interface PeerInfo {
  id: string;
  socketId: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  joinedAt: number;
  isHost: boolean;
}

export interface Room {
  id: string; // e.g. "4819" or "bridge-4819"
  pin: string; // 4-digit numeric PIN for instant entry, e.g. "4819"
  createdAt: number;
  peers: Map<string, PeerInfo>;
  knockRequired?: boolean;
}

export interface SignalData {
  from: string;
  to: string;
  payload: any;
}
