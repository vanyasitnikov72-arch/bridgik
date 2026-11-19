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

export function isRandomAnimalName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const parts = name.trim().split(/\s+/);
  if (parts.length !== 2) return false;
  return ADJECTIVES.includes(parts[0]) && NOUNS.includes(parts[1]);
}

export interface DetailedDeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  osName: string;
  browser: string;
  deviceModel: string;
  defaultName: string;
}

export function getDetailedDeviceInfo(): DetailedDeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'desktop',
      os: 'unknown',
      osName: 'Web',
      browser: 'Браузер',
      deviceModel: 'Компьютер',
      defaultName: 'Этот ПК',
    };
  }

  const ua = navigator.userAgent;
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'mobile';
  }

  // OS & Model
  let os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown' = 'unknown';
  let osName = 'Система';
  let deviceModel = 'Устройство';

  if (/iPhone/i.test(ua)) {
    os = 'ios';
    osName = 'iOS';
    deviceModel = 'iPhone';
    deviceType = 'mobile';
  } else if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    os = 'ios';
    osName = 'iPadOS';
    deviceType = 'tablet';
    deviceModel = 'iPad';
  } else if (/Android/i.test(ua)) {
    os = 'android';
    osName = 'Android';
    if (deviceType === 'tablet') {
      deviceModel = 'Android Планшет';
    } else {
      if (/Samsung|SM-[A-Z0-9]+/i.test(ua)) deviceModel = 'Samsung Galaxy';
      else if (/Pixel/i.test(ua)) deviceModel = 'Google Pixel';
      else if (/Xiaomi|Redmi|POCO/i.test(ua)) deviceModel = 'Xiaomi';
      else if (/Huawei|Honor/i.test(ua)) deviceModel = 'Huawei';
      else deviceModel = 'Android Смартфон';
    }
  } else if (/Windows NT/i.test(ua)) {
    os = 'windows';
    osName = 'Windows';
    if (/Windows NT 10.0/i.test(ua)) osName = 'Windows 10/11';
    else if (/Windows NT 6.3/i.test(ua)) osName = 'Windows 8.1';
    else if (/Windows NT 6.1/i.test(ua)) osName = 'Windows 7';
    deviceModel = 'Windows ПК';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macos';
    osName = 'macOS';
    deviceModel = 'MacBook / Mac';
  } else if (/Linux/i.test(ua)) {
    os = 'linux';
    osName = 'Linux';
    deviceModel = 'Linux ПК';
  }

  // Browser
  let browser = 'Браузер';
  if (/YaBrowser\/(\d+)/i.test(ua)) browser = 'Яндекс Браузер';
  else if (/Edg\/(\d+)/i.test(ua)) browser = 'Edge';
  else if (/Chrome\/(\d+)/i.test(ua) && !/Chromium\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\/(\d+)/i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\/(\d+)/i.test(ua)) browser = 'Firefox';
  else if (/Opera|OPR\//i.test(ua)) browser = 'Opera';

  // Default display name
  const defaultName = deviceModel;

  return {
    deviceType,
    os,
    osName,
    browser,
    deviceModel,
    defaultName,
  };
}

export function getEffectiveDeviceName(): { name: string; isCustom: boolean } {
  if (typeof window === 'undefined') return { name: 'Устройство', isCustom: false };

  // 1. Explicitly saved custom device name
  const custom = localStorage.getItem('bridgik_custom_device_name');
  if (custom && custom.trim()) {
    return { name: custom.trim(), isCustom: true };
  }

  // 2. Saved username if not an old random animal name
  const savedUser = localStorage.getItem('bridgik_username') || localStorage.getItem('bridgit_username');
  if (savedUser && savedUser.trim() && !isRandomAnimalName(savedUser.trim())) {
    return { name: savedUser.trim(), isCustom: true };
  }

  // 3. Fallback: intelligent detected device model
  const info = getDetailedDeviceInfo();
  return { name: info.defaultName, isCustom: false };
}

export function saveCustomDeviceName(name: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = name.trim();
  if (trimmed) {
    localStorage.setItem('bridgik_custom_device_name', trimmed);
    localStorage.setItem('bridgik_username', trimmed);
  } else {
    localStorage.removeItem('bridgik_custom_device_name');
  }
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

export function getBrowserLabel(): string {
  if (typeof window === 'undefined') return 'Браузер';
  const ua = navigator.userAgent;
  let browser = 'Браузер';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Chromium\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Opera|OPR\//i.test(ua)) browser = 'Opera';

  const os = detectDeviceName();
  return `${browser} (${os})`;
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
