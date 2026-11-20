import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Server,
  Users,
  HardDrive,
  Database,
  ArrowLeft,
  RefreshCw,
  Search,
  Crown,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Cpu,
  Key,
  Clock,
  Download,
  ExternalLink,
  Lock,
  Layers,
} from 'lucide-react';
import { AdminStats, AdminUser, AdminDrop, UserProfile, AppTab, UserTier } from '../types/index.js';
import { sound } from '../utils/sound.js';

interface AdminViewProps {
  userProfile?: UserProfile | null;
  isAdmin?: boolean;
  onSelectTab: (tab: AppTab) => void;
  onJoinRoom?: (roomId: string) => void;
}

type AdminTab = 'metrics' | 'users' | 'drops' | 'access';

export const AdminView: React.FC<AdminViewProps> = ({
  userProfile,
  isAdmin,
  onSelectTab,
  onJoinRoom,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('metrics');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [drops, setDrops] = useState<AdminDrop[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingDrops, setIsLoadingDrops] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'pro' | 'admin'>('all');
  const [dropSearch, setDropSearch] = useState('');

  // Master key state
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);

  // Get current active license key for API requests
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const key =
      userProfile?.licenseKeyPreview ||
      localStorage.getItem('bridgik_license_key') ||
      localStorage.getItem('bridgik_admin_key') ||
      '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (key) {
      headers['Authorization'] = `Bearer ${key}`;
    }
    const adminKey = localStorage.getItem('bridgik_admin_key');
    if (adminKey) {
      headers['x-admin-key'] = adminKey;
    }
    return headers;
  }, [userProfile]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // 1. Fetch System Stats
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data?.success && data?.stats) {
        setStats(data.stats);
      } else {
        console.warn('Failed to fetch admin stats:', data?.error);
      }
    } catch (e: any) {
      console.error('Fetch stats error:', e);
    } finally {
      setIsLoadingStats(false);
    }
  }, [getAuthHeaders]);

  // 2. Fetch Users
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data?.success && data?.users) {
        setUsers(data.users);
      } else {
        console.warn('Failed to fetch users:', data?.error);
      }
    } catch (e: any) {
      console.error('Fetch users error:', e);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [getAuthHeaders]);

  // 3. Fetch Drops
  const fetchDrops = useCallback(async () => {
    setIsLoadingDrops(true);
    try {
      const res = await fetch('/api/admin/drops', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data?.success && data?.drops) {
        setDrops(data.drops);
      } else {
        console.warn('Failed to fetch drops:', data?.error);
      }
    } catch (e: any) {
      console.error('Fetch drops error:', e);
    } finally {
      setIsLoadingDrops(false);
    }
  }, [getAuthHeaders]);

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchDrops();
  }, [fetchStats, fetchUsers, fetchDrops]);

  // Change user tier
  const handleSetUserTier = async (userId: string, tier: UserTier, days: number | null) => {
    sound.playClick();
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/tier`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tier, days }),
      });
      const data = await res.json();
      if (data?.success) {
        showToast(
          tier !== 'free'
            ? `Пользователю активирован тариф ${tier} (${days ? `${days} дн.` : 'Бессрочно'})`
            : 'Тариф сброшен на Free'
        );
        fetchUsers();
        fetchStats();
      } else {
        showToast(data?.error || 'Ошибка изменения тарифа', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Ошибка сети', 'error');
    }
  };

  // Toggle user admin rights
  const handleToggleAdmin = async (userId: string, currentStatus: boolean, login?: string) => {
    if (login === 'vanessosit' && currentStatus) {
      showToast('Нельзя снять права администратора с владельца сервиса', 'error');
      return;
    }
    sound.playClick();
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });
      const data = await res.json();
      if (data?.success) {
        showToast(!currentStatus ? 'Права администратора выданы' : 'Права администратора сняты');
        fetchUsers();
        fetchStats();
      } else {
        showToast(data?.error || 'Ошибка изменения прав', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Ошибка сети', 'error');
    }
  };

  // Delete a drop from S3 / DB
  const handleDeleteDrop = async (dropId: string, fileName: string) => {
    if (!confirm(`Удалить файл «${fileName}» из буфера и S3?`)) return;
    sound.playClick();
    try {
      const res = await fetch(`/api/admin/drops/${encodeURIComponent(dropId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data?.success) {
        showToast(`Файл «${fileName}» удалён из S3`);
        fetchDrops();
        fetchStats();
      } else {
        showToast('Не удалось удалить файл', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Ошибка сети', 'error');
    }
  };

  // Clean all expired drops
  const handleCleanExpired = async () => {
    sound.playClick();
    try {
      const res = await fetch('/api/admin/clean-expired', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data?.success) {
        showToast(`Очищено истекших файлов: ${data.cleanedCount}`);
        fetchDrops();
        fetchStats();
      } else {
        showToast(data?.error || 'Ошибка очистки файлов', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Ошибка сети', 'error');
    }
  };

  // Verify Master Key
  const handleVerifyMasterKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterKeyInput.trim()) return;
    setIsVerifyingKey(true);
    sound.playClick();
    try {
      const res = await fetch('/api/admin/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: masterKeyInput.trim() }),
      });
      const data = await res.json();
      if (data?.success && data?.isAdmin) {
        localStorage.setItem('bridgik_admin_key', masterKeyInput.trim());
        showToast('Мастер-ключ успешно подтверждён! Права DEV администратора активированы.');
        sound.playConnect();
        setMasterKeyInput('');
        fetchStats();
        fetchUsers();
        fetchDrops();
      } else {
        showToast(data?.error || 'Неверный мастер-ключ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Ошибка проверки ключа', 'error');
    } finally {
      setIsVerifyingKey(false);
    }
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Format uptime
  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}д ${h}ч ${m}м`;
    if (h > 0) return `${h}ч ${m}м`;
    return `${m}м`;
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.yandexLogin && u.yandexLogin.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.telegramUsername && u.telegramUsername.toLowerCase().includes(userSearch.toLowerCase())) ||
      u.licenseKey.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (userFilter === 'pro') return u.tier !== 'free';
    if (userFilter === 'admin') return u.isAdmin;
    return true;
  });

  // Filtered drops
  const filteredDrops = drops.filter((d) => {
    return (
      d.fileName.toLowerCase().includes(dropSearch.toLowerCase()) ||
      d.senderName.toLowerCase().includes(dropSearch.toLowerCase()) ||
      d.id.toLowerCase().includes(dropSearch.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#0c0e0b] text-[#ededed] py-4 sm:py-8 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Navigation Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#141712] border border-[#232d1c] shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onSelectTab('bridge');
              }}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#1f251a] hover:bg-[#2b3524] border border-[#789d2a]/50 text-[#bbf348] font-bold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer shadow-md"
              title="Вернуться на сайт Bridgik"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← В интерфейс Bridgik</span>
            </button>

            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#bbf348]" />
                <h1 className="font-extrabold text-lg sm:text-xl text-white font-mono tracking-wide">
                  BRIDGIK // CONTROL PANEL
                </h1>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#789d2a]/20 border border-[#789d2a]/40 text-[#bbf348] text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#bbf348] animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-[#8c9c82] mt-0.5">
                Панель управления создателя · VDS Ubuntu & Cloud.ru S3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                sound.playClick();
                fetchStats();
                fetchUsers();
                fetchDrops();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#1a1f16] hover:bg-[#242c1e] border border-white/10 text-[#cccccc] hover:text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
              title="Обновить все данные"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoadingStats || isLoadingUsers || isLoadingDrops ? 'animate-spin text-[#bbf348]' : ''}`}
              />
              <span>Обновить</span>
            </button>

            {userProfile && (
              <div className="px-3 py-1.5 rounded-xl bg-[#1a1f16] border border-[#789d2a]/40 text-xs font-mono flex items-center gap-2 text-[#bbf348]">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">{userProfile.displayName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-extrabold">
                  {userProfile.providers?.yandex?.handle === 'vanessosit' ? 'OWNER' : 'ADMIN'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 text-sm font-bold ${
              statusMessage.type === 'success'
                ? 'bg-[#1b2b14] border-[#789d2a] text-[#bbf348]'
                : 'bg-[#2b1414] border-[#d94848] text-[#ff8f8f]'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#bbf348]" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#ff8f8f]" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/[0.08]">
          <button
            onClick={() => {
              sound.playClick();
              setActiveAdminTab('metrics');
            }}
            className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'metrics'
                ? 'bg-[#232c1c] text-[#bbf348] border border-[#789d2a]/60 shadow-[0_0_12px_rgba(120,157,42,0.25)]'
                : 'text-[#888888] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Метрики и статус</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveAdminTab('users');
            }}
            className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'users'
                ? 'bg-[#232c1c] text-[#bbf348] border border-[#789d2a]/60 shadow-[0_0_12px_rgba(120,157,42,0.25)]'
                : 'text-[#888888] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Пользователи ({users.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveAdminTab('drops');
            }}
            className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'drops'
                ? 'bg-[#232c1c] text-[#bbf348] border border-[#789d2a]/60 shadow-[0_0_12px_rgba(120,157,42,0.25)]'
                : 'text-[#888888] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Буфер Drop & Go ({drops.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveAdminTab('access');
            }}
            className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'access'
                ? 'bg-[#232c1c] text-[#bbf348] border border-[#789d2a]/60 shadow-[0_0_12px_rgba(120,157,42,0.25)]'
                : 'text-[#888888] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Ключ и доступ</span>
          </button>
        </div>

        {/* TAB 1: METRICS & STATUS */}
        {activeAdminTab === 'metrics' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Server Health */}
              <div className="p-4 rounded-2xl bg-[#141712] border border-[#232d1c] space-y-2">
                <div className="flex items-center justify-between text-[#8c9c82] text-xs font-mono">
                  <span>VDS SERVER</span>
                  <Server className="w-4 h-4 text-[#bbf348]" />
                </div>
                <div className="font-extrabold text-2xl text-white font-mono">
                  {stats ? formatUptime(stats.server.uptime) : '...'}
                </div>
                <div className="text-xs text-[#a2b298] flex items-center justify-between font-mono">
                  <span>Node: {stats?.server.nodeVersion || 'v22'}</span>
                  <span>PID: {stats?.server.pid || '-'}</span>
                </div>
              </div>

              {/* Memory / RAM */}
              <div className="p-4 rounded-2xl bg-[#141712] border border-[#232d1c] space-y-2">
                <div className="flex items-center justify-between text-[#8c9c82] text-xs font-mono">
                  <span>ОЗУ (MEMORY)</span>
                  <Cpu className="w-4 h-4 text-[#bbf348]" />
                </div>
                <div className="font-extrabold text-2xl text-white font-mono">
                  {stats
                    ? `${stats.server.memory.totalMemMb - stats.server.memory.freeMemMb} / ${stats.server.memory.totalMemMb} МБ`
                    : '...'}
                </div>
                {/* Visual bar */}
                {stats && (
                  <div className="w-full bg-[#1e251a] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#bbf348] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((stats.server.memory.totalMemMb - stats.server.memory.freeMemMb) /
                              stats.server.memory.totalMemMb) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                )}
                <div className="text-xs text-[#a2b298] flex items-center justify-between font-mono">
                  <span>RSS: {stats?.server.memory.rssMb || 0} МБ</span>
                  <span>Heap: {stats?.server.memory.heapUsedMb || 0} МБ</span>
                </div>
              </div>

              {/* Cloud.ru S3 Object Storage */}
              <div className="p-4 rounded-2xl bg-[#141712] border border-[#232d1c] space-y-2">
                <div className="flex items-center justify-between text-[#8c9c82] text-xs font-mono">
                  <span>CLOUD.RU S3 STORAGE</span>
                  <HardDrive className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <div className="font-extrabold text-2xl text-white font-mono">
                  {stats ? formatBytes(stats.storage.totalSizeBytes) : '...'}
                </div>
                <div className="text-xs text-[#a2b298] flex items-center justify-between font-mono">
                  <span className="text-[#38bdf8]">
                    {stats?.storage.s3Enabled ? '● s3.cloud.ru' : '○ Local'}
                  </span>
                  <span>{stats?.storage.objectCount || 0} файлов</span>
                </div>
              </div>

              {/* WebRTC Signaling */}
              <div className="p-4 rounded-2xl bg-[#141712] border border-[#232d1c] space-y-2">
                <div className="flex items-center justify-between text-[#8c9c82] text-xs font-mono">
                  <span>WEBRTC SIGNALING</span>
                  <Radio className="w-4 h-4 text-[#bbf348]" />
                </div>
                <div className="font-extrabold text-2xl text-white font-mono">
                  {stats ? `${stats.webrtc.roomsCount} комнат` : '...'}
                </div>
                <div className="text-xs text-[#a2b298] flex items-center justify-between font-mono">
                  <span>Пиры: {stats?.webrtc.peersCount || 0}</span>
                  <span>Сокеты: {stats?.webrtc.socketsCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Database & Overview summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SQLite DB stats */}
              <div className="p-5 rounded-2xl bg-[#141712] border border-[#232d1c] space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#bbf348]" />
                    <h3 className="font-bold text-base text-white">База данных SQLite (WAL)</h3>
                  </div>
                  <span className="text-xs font-mono text-[#8c9c82]">data/bridgik.db</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#1a1f16] border border-white/[0.05]">
                    <p className="text-xs text-[#8c9c82]">Пользователи</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">
                      {stats?.db.totalUsers || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1a1f16] border border-white/[0.05]">
                    <p className="text-xs text-amber-400">Pro подписчики</p>
                    <p className="text-xl font-bold font-mono text-amber-300 mt-1">
                      {stats?.db.proUsers || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1a1f16] border border-white/[0.05]">
                    <p className="text-xs text-[#bbf348]">Администраторы</p>
                    <p className="text-xl font-bold font-mono text-[#bbf348] mt-1">
                      {stats?.db.adminUsers || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1a1f16] border border-white/[0.05]">
                    <p className="text-xs text-[#8c9c82]">Sticky Devices</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">
                      {stats?.db.totalDevices || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1a1f16] border border-white/[0.05]">
                    <p className="text-xs text-[#8c9c82]">Файлы в буфере</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">
                      {stats?.db.totalDrops || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1a1f16] border border-white/[0.05]">
                    <p className="text-xs text-[#8c9c82]">Платежи YooKassa</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">
                      {stats?.db.totalPayments || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cloud.ru S3 Object Storage info */}
              <div className="p-5 rounded-2xl bg-[#141712] border border-[#232d1c] space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-[#38bdf8]" />
                    <h3 className="font-bold text-base text-white">Облачное хранилище Cloud.ru S3</h3>
                  </div>
                  <span className="text-xs font-mono text-[#38bdf8]">Evolution Object Storage</span>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                    <span className="text-[#8c9c82]">Статус подключения:</span>
                    <span className="text-[#bbf348] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#bbf348]" />
                      АКТИВЕН / 200 OK
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                    <span className="text-[#8c9c82]">Endpoint S3:</span>
                    <span className="text-white">{stats?.storage.endpoint || 'https://s3.cloud.ru'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                    <span className="text-[#8c9c82]">Имя бакета (Bucket):</span>
                    <span className="text-[#bbf348] font-bold">
                      {stats?.storage.bucket || 'bridgik-drops'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                    <span className="text-[#8c9c82]">Регион:</span>
                    <span className="text-white">{stats?.storage.region || 'ru-central-1'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#8c9c82]">Срок хранения файлов:</span>
                    <span className="text-amber-400 font-bold">24 часа (до 200 МБ/файл)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active WebRTC Rooms Table */}
            <div className="p-5 rounded-2xl bg-[#141712] border border-[#232d1c] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#bbf348]" />
                  <h3 className="font-bold text-base text-white">
                    Активные комнаты WebRTC ({stats?.webrtc.rooms.length || 0})
                  </h3>
                </div>
                <span className="text-xs text-[#8c9c82]">P2P сессии в реальном времени</span>
              </div>

              {stats?.webrtc.rooms && stats.webrtc.rooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {stats.webrtc.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-3.5 rounded-xl bg-[#1a1f16] border border-white/[0.08] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#bbf348]">
                            #{room.id}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#232c1c] text-[#a2b298] font-mono">
                            {room.mode}
                          </span>
                        </div>
                        <p className="text-xs text-[#8c9c82] mt-1">
                          Пиров: {room.peerCount} · {formatUptime(Math.floor((Date.now() - room.createdAt) / 1000))} назад
                        </p>
                      </div>
                      {onJoinRoom && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onJoinRoom(room.id);
                          }}
                          className="p-2 rounded-lg bg-[#25301e] hover:bg-[#324229] text-[#bbf348] text-xs font-bold transition-colors cursor-pointer"
                          title="Войти в комнату"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-[#788870] text-sm font-mono">
                  Сейчас нет активных P2P комнат. Комнаты создаются мгновенно при передаче файлов или созвоне.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeAdminTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#141712] border border-[#232d1c]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#788870]" />
                <input
                  type="text"
                  placeholder="Поиск по имени, логину Яндекс, Telegram или ключу..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1a1f16] border border-white/10 text-white placeholder-[#687860] text-sm focus:outline-none focus:border-[#789d2a]"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-[#1a1f16] p-1 rounded-xl border border-white/[0.08]">
                <button
                  onClick={() => setUserFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    userFilter === 'all'
                      ? 'bg-[#283216] text-[#bbf348] border border-[#789d2a]/60'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  Все ({users.length})
                </button>
                <button
                  onClick={() => setUserFilter('pro')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    userFilter === 'pro'
                      ? 'bg-[#283216] text-[#bbf348] border border-[#789d2a]/60'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  Подписчики ({users.filter((u) => u.tier !== 'free').length})
                </button>
                <button
                  onClick={() => setUserFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    userFilter === 'admin'
                      ? 'bg-[#283216] text-[#bbf348] border border-[#789d2a]/60'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  Админы ({users.filter((u) => u.isAdmin).length})
                </button>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-[#788870] font-mono rounded-2xl bg-[#141712] border border-[#232d1c]">
                  Пользователи не найдены.
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isOwner = user.yandexLogin === 'vanessosit';
                  const isPro = user.tier && user.tier !== 'free';
                  const tierLabel =
                    user.tier === 'overdrive' || user.tier === 'pro'
                      ? 'OVERDRIVE'
                      : user.tier === 'data-link'
                      ? 'DATA LINK'
                      : user.tier === 'live-hub'
                      ? 'LIVE HUB'
                      : 'FREE';
                  const tierColor =
                    user.tier === 'overdrive' || user.tier === 'pro'
                      ? 'bg-amber-400 text-black'
                      : user.tier === 'data-link'
                      ? 'bg-sky-400 text-black'
                      : user.tier === 'live-hub'
                      ? 'bg-emerald-400 text-black'
                      : 'bg-white/10 text-[#aaaaaa]';

                  return (
                    <div
                      key={user.id}
                      className="p-4 rounded-2xl bg-[#141712] border border-[#232d1c] hover:border-[#789d2a]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: User details */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={user.avatarUrl || '/mascots/dino_avatar.jpg'}
                          alt={user.displayName}
                          className="w-12 h-12 rounded-full object-cover bg-[#1e251a] border-2 border-[#789d2a] shrink-0"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-base text-white truncate">
                              {user.displayName}
                            </span>
                            {isOwner && (
                              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-extrabold text-[10px] font-mono border border-amber-400/40">
                                👑 СОЗДАТЕЛЬ
                              </span>
                            )}
                            {user.isAdmin && !isOwner && (
                              <span className="px-2 py-0.5 rounded bg-[#789d2a]/20 text-[#bbf348] font-bold text-[10px] font-mono border border-[#789d2a]/40">
                                🛡️ АДМИНИСТРАТОР
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] font-mono ${tierColor}`}>
                              {tierLabel} {user.proUntil ? `до ${new Date(user.proUntil).toLocaleDateString('ru')}` : (isPro ? 'БЕССРОЧНО' : '')}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#8c9c82] mt-1 font-mono flex-wrap">
                            {user.yandexLogin && (
                              <span>Яндекс: @{user.yandexLogin}</span>
                            )}
                            {user.telegramUsername && (
                              <span>TG: @{user.telegramUsername}</span>
                            )}
                            <span>Ключ: {user.licenseKey}</span>
                            <span>Устройств: {user.deviceCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {/* Pro tier action */}
                        {isPro && (
                          <button
                            onClick={() => handleSetUserTier(user.id, 'free', null)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#2b1818] hover:bg-[#3b1f1f] border border-[#d94848]/40 text-[#ff8f8f] font-bold text-xs transition-colors cursor-pointer"
                          >
                            Снять тариф
                          </button>
                        )}
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => handleSetUserTier(user.id, 'data-link', 30)}
                            className="px-2 py-1.5 rounded-xl bg-[#12222d] hover:bg-[#1b3445] border border-sky-400/40 text-sky-300 font-bold text-xs transition-colors cursor-pointer"
                            title="Выдать Data Link на 30 дней"
                          >
                            +Data Link
                          </button>
                          <button
                            onClick={() => handleSetUserTier(user.id, 'live-hub', 30)}
                            className="px-2 py-1.5 rounded-xl bg-[#132a1e] hover:bg-[#1d3f2d] border border-emerald-400/40 text-emerald-300 font-bold text-xs transition-colors cursor-pointer"
                            title="Выдать Live Hub на 30 дней"
                          >
                            +Live Hub
                          </button>
                          <button
                            onClick={() => handleSetUserTier(user.id, 'overdrive', 30)}
                            className="px-2 py-1.5 rounded-xl bg-[#2b2512] hover:bg-[#3d3419] border border-amber-400/50 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
                            title="Выдать Overdrive на 30 дней"
                          >
                            +Overdrive
                          </button>
                          <button
                            onClick={() => handleSetUserTier(user.id, 'overdrive', null)}
                            className="px-2 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-200 font-bold text-xs transition-colors cursor-pointer"
                            title="Выдать вечный Overdrive"
                          >
                            ∞ Overdrive
                          </button>
                        </div>

                        {/* Admin Toggle */}
                        {!isOwner && (
                          <button
                            onClick={() => handleToggleAdmin(user.id, user.isAdmin, user.yandexLogin)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border ${
                              user.isAdmin
                                ? 'bg-[#2b1818] hover:bg-[#3b1f1f] border-[#d94848]/40 text-[#ff8f8f]'
                                : 'bg-[#1b2b14] hover:bg-[#253d1b] border-[#789d2a]/60 text-[#bbf348]'
                            }`}
                          >
                            {user.isAdmin ? 'Снять админку' : 'Назначить админом'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DROP & GO BUFFER MANAGEMENT */}
        {activeAdminTab === 'drops' && (
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#141712] border border-[#232d1c]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#788870]" />
                <input
                  type="text"
                  placeholder="Поиск по имени файла или отправителю..."
                  value={dropSearch}
                  onChange={(e) => setDropSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1a1f16] border border-white/10 text-white placeholder-[#687860] text-sm focus:outline-none focus:border-[#789d2a]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCleanExpired}
                  className="px-3.5 py-2 rounded-xl bg-[#283216] hover:bg-[#33411c] border border-[#789d2a] text-[#bbf348] text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Очистить истекшие файлы</span>
                </button>
              </div>
            </div>

            {/* Drops List */}
            <div className="space-y-3">
              {filteredDrops.length === 0 ? (
                <div className="p-12 text-center text-[#788870] font-mono rounded-2xl bg-[#141712] border border-[#232d1c]">
                  Сейчас в буфере Drop & Go нет сохранённых файлов.
                </div>
              ) : (
                filteredDrops.map((drop) => {
                  const now = Date.now();
                  const remainingMs = drop.expiresAt - now;
                  const isExpired = remainingMs <= 0;
                  const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 3600)));
                  const remainingMins = Math.max(0, Math.floor((remainingMs % (1000 * 3600)) / (1000 * 60)));

                  return (
                    <div
                      key={drop.id}
                      className="p-4 rounded-2xl bg-[#141712] border border-[#232d1c] hover:border-[#789d2a]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-[#1a1f16] border border-white/10 flex items-center justify-center text-[#38bdf8] shrink-0">
                          <HardDrive className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-base text-white truncate">
                              {drop.fileName}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#1e251a] text-[#bbf348] font-mono font-bold text-xs">
                              {formatBytes(drop.fileSize)}
                            </span>
                            {drop.isS3 ? (
                              <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-mono text-[10px] border border-sky-800">
                                CLOUD.RU S3
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                                LOCAL
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#8c9c82] mt-1 font-mono flex-wrap">
                            <span>От: {drop.senderName}</span>
                            <span>Скачиваний: {drop.downloadCount}/{drop.maxDownloads}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {isExpired ? (
                                <span className="text-[#ff8f8f] font-bold">ИСТЁК</span>
                              ) : (
                                <span className="text-[#bbf348]">
                                  осталось {remainingHours}ч {remainingMins}м
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`/api/drop/${drop.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1a1f16] hover:bg-[#242c1e] border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                          title="Скачать файл"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Скачать</span>
                        </a>

                        <button
                          onClick={() => handleDeleteDrop(drop.id, drop.fileName)}
                          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#2b1818] hover:bg-[#3b1f1f] border border-[#d94848]/40 text-[#ff8f8f] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Удалить из S3"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Удалить</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ACCESS & MASTER KEY */}
        {activeAdminTab === 'access' && (
          <div className="max-w-2xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#141712] border border-[#232d1c] space-y-4">
              <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#283216] border border-[#789d2a] flex items-center justify-center text-[#bbf348]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Активация прав Master Secret Key</h3>
                  <p className="text-xs text-[#8c9c82]">
                    Позволяет мгновенно авторизовать любое новое устройство в качестве администратора
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyMasterKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#8c9c82] mb-1.5">
                    СЕКРЕТНЫЙ КЛЮЧ СОЗДАТЕЛЯ (ADMIN_SECRET_KEY)
                  </label>
                  <input
                    type="password"
                    placeholder="bridgik_creator_root_..."
                    value={masterKeyInput}
                    onChange={(e) => setMasterKeyInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1a1f16] border border-white/10 text-white placeholder-[#687860] font-mono text-sm focus:outline-none focus:border-[#789d2a]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingKey || !masterKeyInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-[#283216] hover:bg-[#33411c] disabled:opacity-50 border border-[#789d2a] text-[#ededed] font-extrabold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  {isVerifyingKey ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#bbf348]" />
                  ) : (
                    <Key className="w-4 h-4 text-[#bbf348]" />
                  )}
                  <span>Подтвердить мастер-ключ</span>
                </button>
              </form>
            </div>

            {/* Current Session Info */}
            <div className="p-6 rounded-2xl bg-[#141712] border border-[#232d1c] space-y-3 font-mono text-xs">
              <h4 className="font-bold text-white text-sm border-b border-white/[0.08] pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#bbf348]" />
                Информация о текущей сессии
              </h4>
              <div className="flex justify-between py-1">
                <span className="text-[#8c9c82]">Статус администратора:</span>
                <span className="text-[#bbf348] font-bold">
                  {isAdmin || userProfile?.isAdmin ? 'АКТИВЕН (ADMIN GRANTED)' : 'ОБЫЧНЫЙ'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8c9c82]">Текущий профиль:</span>
                <span className="text-white">{userProfile?.displayName || 'Гость'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8c9c82]">Лицензионный ключ:</span>
                <span className="text-white">{userProfile?.licenseKeyPreview || 'Не привязан'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
