import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  File as FileIcon,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  Loader2,
  User,
  Radio,
  Moon,
  Send,
  RotateCcw,
} from 'lucide-react';
import { PublicInboxUser, DropDto, AvatarFrameId, hasBridgePro } from '../types/index.js';
import { formatBytes, getAvatarForName } from '../utils/device.js';
import { sound } from '../utils/sound.js';

interface InboxDropViewProps {
  handle: string;
  onGoHome?: () => void;
}

export function InboxDropView({ handle, onGoHome }: InboxDropViewProps) {
  const [user, setUser] = useState<PublicInboxUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [senderName, setSenderName] = useState<string>(() => {
    return localStorage.getItem('bridgik_sender_name') || '';
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<DropDto | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch recipient's public profile
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    const cleanHandle = handle.replace(/^@+/, '');

    fetch(`/api/inbox/@${encodeURIComponent(cleanHandle)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!isMounted) return;
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setLoadError(data.error || 'Пользователь не найден в Bridgik');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError('Не удалось связаться с сервером');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [handle]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setUploadError(null);
    const maxDropBytes = 200 * 1024 * 1024; // 200 MB
    if (file.size > maxDropBytes) {
      setUploadError('Размер файла превышает 200 МБ');
      return;
    }
    sound.playClick();
    setSelectedFile(file);
  };

  const handleSendFile = () => {
    if (!selectedFile || !user || isUploading) return;

    sound.playClick();
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedBytes(0);
    setUploadError(null);

    const trimmedSender = senderName.trim();
    if (trimmedSender) {
      localStorage.setItem('bridgik_sender_name', trimmedSender);
    }

    const xhr = new XMLHttpRequest();
    const endpoint = `/api/inbox/@${encodeURIComponent(user.handle)}/drop`;
    xhr.open('POST', endpoint);

    xhr.setRequestHeader('x-file-name', encodeURIComponent(selectedFile.name));
    xhr.setRequestHeader('x-file-size', String(selectedFile.size));
    xhr.setRequestHeader('x-mime-type', selectedFile.type || 'application/octet-stream');
    xhr.setRequestHeader('x-sender-name', encodeURIComponent(trimmedSender || 'Гость'));
    xhr.setRequestHeader('x-ttl-hours', '24');

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
        setUploadProgress(percent);
        setUploadedBytes(evt.loaded);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success && data.drop) {
          setUploadProgress(100);
          setUploadSuccess(data.drop);
          sound.playTransferComplete();
        } else {
          setUploadError(data.error || 'Ошибка отправки файла в инбокс');
        }
      } catch {
        setUploadError('Не удалось разобрать ответ сервера');
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadError('Сетевая ошибка при загрузке файла');
    };

    xhr.send(selectedFile);
  };

  const handleResetForAnotherFile = () => {
    sound.playClick();
    setSelectedFile(null);
    setUploadSuccess(null);
    setUploadProgress(0);
    setUploadedBytes(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFrameClass = (frame: AvatarFrameId) => {
    if (frame === 'rgb') return 'border-2 border-sky-400 animate-admin-rgb';
    if (frame === 'plasma') return 'border-2 border-purple-400 animate-admin-plasma';
    if (frame === 'gold') return 'border-2 border-amber-400 animate-admin-gold';
    return 'border-2 border-[#789d2a]';
  };

  const isPro = hasBridgePro(user?.tier);

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#ededed] flex flex-col justify-between selection:bg-[#789d2a]/30">
      {/* Top Navbar */}
      <header className="px-4 py-3 sm:px-8 border-b border-white/[0.06] bg-[#121212]/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <a
          href="/"
          onClick={(e) => {
            if (onGoHome) {
              e.preventDefault();
              onGoHome();
            }
          }}
          className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer select-none"
          title="bridgik · На главную"
        >
          <img
            src="/mascots/dino_logo_transparent.png"
            alt="bridgik"
            className="h-9 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(120,157,42,0.3)]"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="px-2 py-0.5 rounded-md bg-[#283216] border border-[#789d2a]/50 text-[10px] sm:text-[11px] font-mono text-[#bbf348] font-bold tracking-wider uppercase shrink-0">
            Drop Link
          </span>
        </a>

        <a
          href="/"
          onClick={(e) => {
            if (onGoHome) {
              e.preventDefault();
              onGoHome();
            }
          }}
          className="px-3.5 py-1.5 rounded-xl bg-[#1c1c1c] hover:bg-[#262626] border border-white/[0.08] text-xs font-bold text-[#ededed] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Открыть Bridgik</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#9ac43e]" />
        </a>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-lg">
          {/* Loading state */}
          {isLoading && (
            <div className="p-8 rounded-3xl bg-[#161616] border border-white/[0.08] shadow-2xl text-center space-y-4 animate-in fade-in">
              <Loader2 className="w-8 h-8 animate-spin text-[#9ac43e] mx-auto" />
              <p className="text-sm font-semibold text-[#888888]">
                Поиск адресата @{handle.replace(/^@+/, '')}...
              </p>
            </div>
          )}

          {/* User not found error */}
          {!isLoading && loadError && (
            <div className="p-8 rounded-3xl bg-[#161616] border border-white/[0.08] shadow-2xl text-center space-y-5 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-800/40 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-white">Инбокс не найден</h2>
                <p className="text-sm text-[#888888]">
                  Пользователь <span className="text-white font-mono font-bold">@{handle.replace(/^@+/, '')}</span> не зарегистрирован в Bridgik или ссылка введена с ошибкой.
                </p>
              </div>
              <a
                href="/"
                onClick={(e) => {
                  if (onGoHome) {
                    e.preventDefault();
                    onGoHome();
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#283216] hover:bg-[#33411c] border border-[#789d2a] text-[#bbf348] text-sm font-bold transition-colors cursor-pointer"
              >
                <span>Перейти на главную</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Recipient Found: Form or Success */}
          {!isLoading && user && !uploadSuccess && (
            <div className="rounded-3xl bg-[#151515] border border-white/[0.08] shadow-2xl overflow-hidden animate-in fade-in duration-200">
              {/* Recipient Profile Banner */}
              <div className="p-5 sm:p-6 bg-gradient-to-b from-[#1b2214] to-[#151515] border-b border-white/[0.06] flex items-center gap-4">
                <img
                  src={user.avatarUrl || getAvatarForName(user.displayName)}
                  alt={user.displayName}
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover bg-[#101010] shrink-0 ${getFrameClass(
                    user.activeFrame
                  )}`}
                  style={{ imageRendering: 'pixelated' }}
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h1
                      className={`text-xl sm:text-2xl font-black truncate ${
                        isPro ? 'admin-name-shimmer' : 'text-white'
                      }`}
                    >
                      {user.displayName}
                    </h1>
                    {isPro && (
                      <span
                        className="w-5 h-5 rounded-md bg-[#789d2a] flex items-center justify-center text-white shrink-0 shadow-sm"
                        title="Bridgik Pro"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-mono text-[#9ac43e] font-bold">@{user.handle}</span>
                    <span>·</span>
                    {user.isOnline ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#283216] text-[#bbf348] border border-[#789d2a]/50 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
                        <span>В сети</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#202020] text-[#888888] border border-white/10 text-[11px] font-bold">
                        <Moon className="w-3 h-3 text-[#aaaaaa]" />
                        <span>Офлайн</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Status Notice */}
                <div className="text-xs text-[#888888] leading-relaxed">
                  {user.isOnline ? (
                    <p className="flex items-center gap-1.5 text-[#bbf348]">
                      <Radio className="w-3.5 h-3.5 shrink-0" />
                      <span>У адресата открыт Bridgik. Файл появится у него на экране сразу после отправки.</span>
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-[#aaaaaa]">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-[#9ac43e]" />
                      <span>Адресат не в сети. Файл сохранится в буфере Drop & Go на 24 часа.</span>
                    </p>
                  )}
                </div>

                {/* Sender Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#9ac43e]" />
                    <span>От кого (ваше имя или ник)</span>
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    disabled={isUploading}
                    placeholder="Например: Иван (Дизайн)"
                    maxLength={32}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b1b] border border-white/[0.08] focus:border-[#789d2a] text-sm font-semibold text-white outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!isUploading && fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  className={`relative p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                    isDragging
                      ? 'border-[#789d2a] bg-[#283216]/25 shadow-lg shadow-[#789d2a]/10'
                      : selectedFile
                      ? 'border-[#789d2a]/70 bg-[#191919]'
                      : 'border-white/15 hover:border-white/30 bg-[#181818]'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />

                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-[#283216] text-[#bbf348] border border-[#789d2a]/50 flex items-center justify-center mx-auto shadow-sm">
                        <FileIcon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm sm:text-base text-white truncate max-w-xs mx-auto">
                          {selectedFile.name}
                        </p>
                        <p className="font-mono text-xs text-[#9ac43e] font-semibold mt-0.5">
                          {formatBytes(selectedFile.size)}
                        </p>
                      </div>
                      {!isUploading && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetForAnotherFile();
                          }}
                          className="px-3 py-1 rounded-lg bg-[#242424] hover:bg-[#2c2c2c] text-xs font-bold text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                        >
                          Сменить файл
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="w-12 h-12 rounded-xl bg-[#222222] text-[#9ac43e] flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-extrabold text-sm sm:text-base text-white">
                          Перетащите файл сюда
                        </p>
                        <p className="text-xs text-[#888888]">
                          или нажмите, чтобы выбрать с устройства (до 200 МБ)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#9ac43e] font-bold">Передача в инбокс...</span>
                      <span className="text-white font-extrabold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#222222] overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#789d2a] to-[#bbf348] transition-all duration-150 shadow-sm shadow-[#789d2a]/50"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    {selectedFile && (
                      <div className="text-[11px] font-mono text-[#888888] text-right">
                        {formatBytes(uploadedBytes)} из {formatBytes(selectedFile.size)}
                      </div>
                    )}
                  </div>
                )}

                {/* Error Banner */}
                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Action Button */}
                <button
                  type="button"
                  onClick={handleSendFile}
                  disabled={!selectedFile || isUploading}
                  className="w-full py-3.5 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] disabled:opacity-40 disabled:hover:bg-[#789d2a] text-black font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#789d2a]/20"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Отправляем...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Отправить файл @{user.handle}</span>
                    </>
                  )}
                </button>

                {/* Guarantee badge */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-[#666666]">
                  <Shield className="w-3.5 h-3.5 text-[#789d2a]" />
                  <span>Шифрованная передача · Без регистрации · Хранение 24 часа</span>
                </div>
              </div>
            </div>
          )}

          {/* Success Screen */}
          {!isLoading && user && uploadSuccess && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#151515] border border-white/[0.08] shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-2xl bg-[#283216] border border-[#789d2a] text-[#bbf348] flex items-center justify-center mx-auto shadow-lg shadow-[#789d2a]/25 animate-in zoom-in-50 duration-200">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-white">Файл успешно отправлен!</h2>
                <p className="text-sm text-[#888888]">
                  {user.isOnline ? (
                    <span>Файл доставлен на открытые устройства <strong className="text-white">@{user.handle}</strong>.</span>
                  ) : (
                    <span>Файл сохранён в буфере и будет передан <strong className="text-white">@{user.handle}</strong> при входе.</span>
                  )}
                </p>
              </div>

              {/* File Info Box */}
              <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-white/[0.06] text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#283216] text-[#bbf348] flex items-center justify-center shrink-0">
                  <FileIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-sm text-white truncate">
                    {uploadSuccess.fileName}
                  </p>
                  <p className="text-xs font-mono text-[#888888]">
                    {formatBytes(uploadSuccess.fileSize)} · Хранится до 24 часов
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForAnotherFile}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-[#222222] hover:bg-[#2c2c2c] border border-white/[0.08] text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#9ac43e]" />
                  <span>Отправить ещё файл</span>
                </button>

                <a
                  href="/"
                  onClick={(e) => {
                    if (onGoHome) {
                      e.preventDefault();
                      onGoHome();
                    }
                  }}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-black font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#789d2a]/20"
                >
                  <span>Открыть Bridgik</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Cyber Footer */}
      <footer className="px-4 py-4 text-center text-xs text-[#555555] border-t border-white/[0.04]">
        <div className="max-w-md mx-auto flex items-center justify-center gap-3 flex-wrap">
          <span>Bridgik Drop Link</span>
          <span>·</span>
          <span>Персональный инбокс</span>
          <span>·</span>
          <a
            href="/"
            onClick={(e) => {
              if (onGoHome) {
                e.preventDefault();
                onGoHome();
              }
            }}
            className="hover:text-[#9ac43e] transition-colors"
          >
            Создать свой инбокс
          </a>
        </div>
      </footer>
    </div>
  );
}
