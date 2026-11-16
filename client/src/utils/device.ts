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

/**
 * Unique ID stored per browser profile (shared across all tabs of the same browser)
 */
export function getBrowserDeviceId(): string {
  if (typeof window === 'undefined') return 'server_id';
  let id = localStorage.getItem('bridgik_browser_device_id');
  if (!id) {
    id = 'b_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('bridgik_browser_device_id', id);
  }
  return id;
}

export const MASCOT_AVATARS = [
  { id: 'dino', name: 'Кибер-Дино', src: '/mascots/dino_avatar.jpg' },
  { id: 'frog', name: 'Жабик Бриджик', src: '/mascots/frog_avatar.jpg' },
  { id: 'cat', name: 'Кибер-Кот', src: '/mascots/cyber_cat_avatar.jpg' },
  { id: 'alien', name: 'Неоновый Пришелец', src: '/mascots/alien_avatar.jpg' },
  { id: 'robot', name: 'Ретро-Робот', src: '/mascots/crt_robot_avatar.jpg' },
  { id: 'turtle', name: 'Кибер-Черепашка', src: '/mascots/turtle_avatar.jpg' },
];

export function getRandomAvatar(): string {
  const item = MASCOT_AVATARS[Math.floor(Math.random() * MASCOT_AVATARS.length)];
  return item.src;
}

export function getAvatarForName(name: string): string {
  if (!name || name === 'Система') return MASCOT_AVATARS[0].src;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % MASCOT_AVATARS.length;
  return MASCOT_AVATARS[index].src;
}

export function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '--';
  if (seconds < 60) return `${Math.round(seconds)}с`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}м ${secs}с`;
}
