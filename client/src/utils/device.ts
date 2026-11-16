const ADJECTIVES = [
  'Swift', 'Silent', 'Cyber', 'Neon', 'Cosmic', 'Solar', 'Lunar', 'Arctic',
  'Golden', 'Shadow', 'Quantum', 'Hyper', 'Velvet', 'Midnight', 'Emerald'
];

const NOUNS = [
  'Otter', 'Falcon', 'Panther', 'Fox', 'Hawk', 'Wolf', 'Eagle', 'Badger',
  'Tiger', 'Lynx', 'Dolphin', 'Owl', 'Bear', 'Viper', 'Raven'
];

export function generateRandomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

export function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export function detectDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android Device';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'MacBook / Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Linux/i.test(ua)) return 'Linux PC';
  return 'Устройство';
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatSpeed(bytesPerSec: number): string {
  return `${formatBytes(bytesPerSec)}/с`;
}

export function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '--';
  if (seconds < 60) return `${Math.round(seconds)}с`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}м ${secs}с`;
}
