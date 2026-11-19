import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  File as FileIcon,
  Check,
  Copy,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { StickyDevice, DropDto } from '../types/index.js';
import { formatBytes, formatSpeed } from '../utils/device.js';
import { sound } from '../utils/sound.js';

interface DropModalProps {
  targetDevice?: StickyDevice | null;
  userLicenseKey?: string;
  senderName: string;
  onClose: () => void;
  onDropCreated?: (drop: DropDto) => void;
}

export function DropModal({
  targetDevice,
  userLicenseKey,
  senderName,
  onClose,
  onDropCreated,
}: DropModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [completedDrop, setCompletedDrop] = useState<DropDto | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 500 * 1024 * 1024) {
        setError('Максимальный размер файла для Drop & Go — 500 МБ');
        return;
      }
      setError(null);
      setSelectedFile(f);
    }
  };

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.size > 500 * 1024 * 1024) {
        setError('Максимальный размер файла для Drop & Go — 500 МБ');
        return;
      }
      setError(null);
      setSelectedFile(f);
    }
  };

  const startUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    sound.playClick();

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.min(100, Math.round((e.loaded / e.total) * 100));
        setUploadProgress(percent);

        const now = Date.now();
        const diffTime = (now - lastTime) / 1000;
        if (diffTime >= 0.25) {
          const diffBytes = e.loaded - lastLoaded;
          setUploadSpeed(diffTime > 0 ? diffBytes / diffTime : 0);
          lastLoaded = e.loaded;
          lastTime = now;
        }
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.success && res.drop) {
          sound.playConnect();
          setCompletedDrop(res.drop);
          onDropCreated?.(res.drop);
        } else {
          setError(res.error || 'Ошибка загрузки файла в буфер Drop & Go');
        }
      } catch (err) {
        setError('Не удалось разобрать ответ сервера');
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setError('Ошибка сети при загрузке файла');
    };

    xhr.open('POST', '/api/drop/upload');
    xhr.setRequestHeader('x-file-name', encodeURIComponent(selectedFile.name));
    xhr.setRequestHeader('x-file-size', String(selectedFile.size));
    xhr.setRequestHeader('x-mime-type', selectedFile.type || 'application/octet-stream');
    xhr.setRequestHeader('x-sender-name', encodeURIComponent(senderName));
    if (userLicenseKey) {
      xhr.setRequestHeader('x-user-key', userLicenseKey);
    }
    if (targetDevice?.id) {
      xhr.setRequestHeader('x-target-device', targetDevice.id);
    }
    xhr.setRequestHeader('x-ttl-hours', '24');

    xhr.send(selectedFile);
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
    setIsUploading(false);
    onClose();
  };

  const copyDropLink = () => {
    if (!completedDrop) return;
    const dropUrl = `${window.location.origin}/drop/${completedDrop.id}`;
    navigator.clipboard.writeText(dropUrl).then(() => {
      sound.playMessage();
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl p-6 text-[#ededed] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#283216] border border-[#789d2a]/50 flex items-center justify-center text-[#9ac43e]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Drop & Go</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#789d2a]/20 text-[#bbf348] border border-[#789d2a]/30">
                  Буфер 24ч
                </span>
              </h3>
              <p className="text-xs text-[#888888]">
                Офлайн-передача: файл сохранится на сервере на 24 часа
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={cancelUpload}
            className="p-2 rounded-xl text-[#888888] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Device Info */}
        {targetDevice && (
          <div className="p-3.5 rounded-xl bg-[#1b1b1b] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center text-[#9ac43e] shrink-0">
                {targetDevice.deviceType === 'mobile' ? (
                  <Smartphone className="w-4 h-4" />
                ) : targetDevice.deviceType === 'tablet' ? (
                  <Tablet className="w-4 h-4" />
                ) : (
                  <Laptop className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#777777] font-medium">Получатель:</p>
                <p className="text-sm font-bold text-white truncate">{targetDevice.name}</p>
              </div>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                targetDevice.isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
              }`}
            >
              {targetDevice.isOnline ? '🟢 В сети' : '⚪ Офлайн'}
            </span>
          </div>
        )}

        {/* Content Body */}
        {!completedDrop ? (
          <div className="space-y-4">
            {/* File Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropFiles}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
                isDragging
                  ? 'border-[#789d2a] bg-[#789d2a]/10'
                  : 'border-[#333333] hover:border-[#789d2a]/60 bg-[#171717]'
              } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-2xl bg-[#222222] border border-white/[0.08] flex items-center justify-center text-[#9ac43e]">
                <FileIcon className="w-6 h-6" />
              </div>
              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white break-all max-w-sm">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-[#9ac43e] font-mono">
                    {formatBytes(selectedFile.size)}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    Перетащите файл сюда или нажмите для выбора
                  </p>
                  <p className="text-xs text-[#777777]">До 500 МБ · Срок хранения 24 часа</p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2 p-4 rounded-xl bg-[#181818] border border-white/[0.06]">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#888888]">Загрузка в облачный буфер...</span>
                  <span className="text-[#9ac43e] font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#262626] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#789d2a] to-[#9ac43e] transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#777777] font-mono">
                  <span>Скорость: {formatSpeed(uploadSpeed)}</span>
                  <span>Лимит 24ч</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cancelUpload}
                disabled={isUploading}
                className="px-4 py-2.5 rounded-xl bg-[#222222] hover:bg-[#2c2c2c] text-[#a8a8a8] text-sm font-bold transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={startUpload}
                disabled={!selectedFile || isUploading}
                className="px-5 py-2.5 rounded-xl bg-[#789d2a] hover:bg-[#88b030] text-black font-extrabold text-sm transition-all shadow-lg shadow-[#789d2a]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Загрузка...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Оставить в буфере</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Upload Completed Screen */
          <div className="space-y-5 animate-in zoom-in-95 duration-150">
            <div className="p-4 rounded-xl bg-[#1b2214] border border-[#789d2a]/50 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#789d2a]/20 border border-[#789d2a]/40 flex items-center justify-center text-[#9ac43e] mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="text-base font-extrabold text-white">
                Файл сохранён в буфере Drop & Go!
              </h4>
              <p className="text-xs text-[#a0a0a0]">
                {targetDevice
                  ? `Устройство «${targetDevice.name}» получит файл при открытии сайта или по прямой ссылке.`
                  : 'Файл доступен для скачивания по ссылке в течение 24 часов.'}
              </p>
            </div>

            {/* File info badge */}
            <div className="p-3.5 rounded-xl bg-[#1c1c1c] border border-white/[0.06] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileIcon className="w-4 h-4 text-[#9ac43e] shrink-0" />
                <span className="font-bold text-white truncate">{completedDrop.fileName}</span>
              </div>
              <span className="text-[#888888] font-mono shrink-0">
                {formatBytes(completedDrop.fileSize)}
              </span>
            </div>

            {/* Direct Link box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#888888] flex items-center justify-between">
                <span>Прямая ссылка для скачивания:</span>
                <span className="flex items-center gap-1 text-[11px] text-[#9ac43e]">
                  <Clock className="w-3 h-3" />
                  <span>24 часа</span>
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/drop/${completedDrop.id}`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#333333] text-xs font-mono text-[#bbf348] select-all outline-none"
                />
                <button
                  type="button"
                  onClick={copyDropLink}
                  className="px-4 py-2.5 rounded-xl bg-[#283216] hover:bg-[#33411c] border border-[#789d2a]/60 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-[#9ac43e]" />
                      <span>Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
              <a
                href={`/drop/${completedDrop.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#9ac43e] hover:underline flex items-center gap-1"
              >
                <span>Открыть страницу скачивания</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#789d2a] hover:bg-[#88b030] text-black font-extrabold text-sm transition-all cursor-pointer"
              >
                Готово
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
