import { useState, useEffect } from 'react';
import {
  Download,
  File as FileIcon,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import { DropDto } from '../types/index.js';
import { formatBytes } from '../utils/device.js';
import { sound } from '../utils/sound.js';

interface DropPageViewProps {
  dropId: string;
}

export function DropPageView({ dropId }: DropPageViewProps) {
  const [drop, setDrop] = useState<DropDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/drop/${encodeURIComponent(dropId)}`);
        const data = await res.json();
        if (!isMounted) return;
        if (data.success && data.drop) {
          setDrop(data.drop);
        } else {
          setError(data.error || 'Файл не найден или срок хранения истёк');
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Не удалось загрузить данные о файле');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [dropId]);

  useEffect(() => {
    if (!drop?.expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = drop.expiresAt - now;
      if (diff <= 0) {
        setTimeLeft('Срок хранения истёк');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours} ч ${mins} мин ${secs} сек`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [drop]);

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      sound.playMessage();
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#ededed] flex flex-col items-center justify-between p-4 sm:p-6 font-sans">
      {/* Top Bar */}
      <header className="w-full max-w-xl flex items-center justify-between py-4">
        <a href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-[#283216] border border-[#789d2a]/60 flex items-center justify-center text-[#9ac43e] font-black text-lg">
            B
          </div>
          <div>
            <span className="font-black text-lg text-white tracking-tight group-hover:text-[#9ac43e] transition-colors">
              BRIDGIK
            </span>
            <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-[#789d2a]/20 text-[#bbf348] font-mono font-bold">
              Drop & Go
            </span>
          </div>
        </a>

        <a
          href="/"
          className="text-xs text-[#888888] hover:text-[#ededed] font-bold flex items-center gap-1 transition-colors"
        >
          <span>Открыть Bridgik</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-lg my-auto py-8">
        {isLoading ? (
          <div className="p-8 rounded-2xl bg-[#141414] border border-[#262626] text-center space-y-4">
            <div className="w-10 h-10 border-3 border-[#789d2a]/30 border-t-[#789d2a] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#888888]">Загрузка данных о файле...</p>
          </div>
        ) : error || !drop ? (
          <div className="p-8 rounded-2xl bg-[#141414] border border-red-500/20 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white">Файл недоступен</h2>
            <p className="text-sm text-[#888888] max-w-sm mx-auto">
              {error || 'Файл был удален, либо 24-часовой срок хранения в буфере истёк.'}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#222222] hover:bg-[#2c2c2c] text-white font-bold text-sm transition-colors cursor-pointer"
            >
              На главную Bridgik
            </a>
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow-2xl space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#1f2615] border border-[#789d2a]/50 flex items-center justify-center text-[#9ac43e] shrink-0">
                  <FileIcon className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-black text-white break-all leading-tight">
                    {drop.fileName}
                  </h1>
                  <p className="text-sm font-mono text-[#9ac43e] mt-1 font-bold">
                    {formatBytes(drop.fileSize)}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges bar */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/[0.06] flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#888888] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[#777777]">Отправитель</p>
                  <p className="font-bold text-white truncate">{drop.senderName}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/[0.06] flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#9ac43e] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[#777777]">Осталось времени</p>
                  <p className="font-bold text-[#bbf348] truncate">{timeLeft || '24 часа'}</p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <a
              href={`/api/drop/${drop.id}/download`}
              download={drop.fileName}
              onClick={() => sound.playConnect()}
              className="w-full py-4 rounded-xl bg-[#789d2a] hover:bg-[#88b030] text-black font-black text-base transition-all shadow-xl shadow-[#789d2a]/20 flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              <span>Скачать файл ({formatBytes(drop.fileSize)})</span>
            </a>

            {/* Copy Link & Share */}
            <div className="pt-2 border-t border-[#222222] flex items-center justify-between text-xs text-[#888888]">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Защищенное прямое скачивание</span>
              </div>
              <button
                type="button"
                onClick={copyPageLink}
                className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                    <span className="text-[#9ac43e]">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Поделиться ссылкой</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl text-center py-4 text-xs text-[#666666]">
        <p>Bridgik Drop & Go · Временный зашифрованный буфер передачи файлов</p>
      </footer>
    </div>
  );
}
