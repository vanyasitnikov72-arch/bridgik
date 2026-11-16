import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, FastForward } from 'lucide-react';

interface CustomAudioPlayerProps {
  src: string;
  title?: string;
  compact?: boolean;
  autoPlay?: boolean;
  className?: string;
}

export const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({
  src,
  title,
  compact = false,
  autoPlay = false,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize and handle source change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = src;
    audio.load();
    setCurrentTime(0);
    setIsPlaying(false);

    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [src, autoPlay]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [isDragging]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const cyclePlaybackRate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  }, [playbackRate]);

  const handleRestart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audio.play().catch(() => {});
    }
  }, [isPlaying]);

  const seekToPosition = (clientX: number) => {
    const bar = progressBarRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || duration <= 0) return;

    const rect = bar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    seekToPosition(e.clientX);

    const onMouseMove = (moveEvent: MouseEvent) => {
      seekToPosition(moveEvent.clientX);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    seekToPosition(e.touches[0].clientX);

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        seekToPosition(moveEvent.touches[0].clientX);
      }
    };

    const onTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Compact Mode (for room files list row)
  if (compact) {
    return (
      <div
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-[#121217] border border-[#2b2b36] shadow-inner select-none ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <audio ref={audioRef} preload="metadata" />

        {/* Play / Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-lg bg-[#252530] hover:bg-[#789d2a] text-[#9ac43e] hover:text-white transition-all flex items-center justify-center shrink-0 shadow cursor-pointer border border-white/5 active:scale-95"
          title={isPlaying ? 'Пауза' : 'Воспроизведение'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Mini animated sound wave when playing */}
        <div className="hidden sm:flex items-center gap-0.5 h-4 w-4 justify-center shrink-0">
          <span
            className={`w-0.5 bg-[#9ac43e] rounded-full transition-all duration-150 ${
              isPlaying ? 'h-3.5 animate-pulse' : 'h-1 opacity-40'
            }`}
          />
          <span
            className={`w-0.5 bg-[#bbf348] rounded-full transition-all duration-150 delay-75 ${
              isPlaying ? 'h-4 animate-pulse' : 'h-1.5 opacity-40'
            }`}
          />
          <span
            className={`w-0.5 bg-[#789d2a] rounded-full transition-all duration-150 delay-150 ${
              isPlaying ? 'h-2.5 animate-pulse' : 'h-1 opacity-40'
            }`}
          />
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <div
            ref={progressBarRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="h-2 w-full rounded-full bg-[#202028] hover:bg-[#272733] cursor-pointer relative overflow-hidden group/bar transition-colors"
          >
            <div
              className="h-full bg-gradient-to-r from-[#789d2a] to-[#9ac43e] rounded-full relative shadow-[0_0_8px_rgba(154,196,62,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#888888] px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mute button */}
        <button
          type="button"
          onClick={toggleMute}
          className="p-1.5 rounded-lg text-[#888888] hover:text-[#ededed] hover:bg-[#252530] transition-colors cursor-pointer shrink-0"
          title={isMuted ? 'Включить звук' : 'Выключить звук'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#ef9282]" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Speed pill */}
        <button
          type="button"
          onClick={cyclePlaybackRate}
          className="px-1.5 py-0.5 rounded-md bg-[#1e1e26] hover:bg-[#2a2a38] text-[10px] font-mono font-bold text-[#aaaaaa] hover:text-[#9ac43e] transition-colors cursor-pointer shrink-0 border border-white/5"
          title="Скорость воспроизведения"
        >
          {playbackRate}x
        </button>
      </div>
    );
  }

  // Full / Lightbox Mode
  return (
    <div
      className={`w-full max-w-md p-5 rounded-2xl bg-[#14141a] border border-[#2e2e3c] shadow-2xl flex flex-col gap-4 select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <audio ref={audioRef} preload="auto" />

      {/* Header Info with Sound Wave visualizer */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 pr-2">
          {title && <p className="text-sm font-bold text-white truncate mb-0.5">{title}</p>}
          <p className="text-xs text-[#888888] font-mono">P2P Аудиоплеер</p>
        </div>

        {/* Sound Wave Bars */}
        <div className="flex items-end gap-1 h-6 shrink-0 px-2 py-0.5 rounded-lg bg-[#0e0e13] border border-white/5">
          {[40, 85, 60, 100, 75, 45, 90, 65].map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full bg-gradient-to-t from-[#789d2a] to-[#bbf348] transition-all duration-200 ${
                isPlaying ? 'animate-pulse' : 'opacity-30'
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, h)}%` : '20%',
                animationDelay: `${i * 90}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Scrubber Progress Bar */}
      <div className="space-y-1.5">
        <div
          ref={progressBarRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="h-2.5 w-full rounded-full bg-[#22222d] hover:bg-[#282836] cursor-pointer relative overflow-hidden group transition-all"
        >
          <div
            className="h-full bg-gradient-to-r from-[#789d2a] via-[#9ac43e] to-[#bbf348] rounded-full shadow-[0_0_12px_rgba(154,196,62,0.8)] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-[#888888]">
          <span className="text-[#9ac43e] font-bold">{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Control Toolbar */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestart}
            className="p-2 rounded-xl text-[#888888] hover:text-white hover:bg-[#22222c] transition-colors cursor-pointer"
            title="Сначала"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-xl text-[#888888] hover:text-white hover:bg-[#22222c] transition-colors cursor-pointer"
            title={isMuted ? 'Включить звук' : 'Без звука'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#ef9282]" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Big Central Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-12 h-12 rounded-2xl bg-[#789d2a] hover:bg-[#8cb632] text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(120,157,42,0.5)] hover:scale-105 active:scale-95 cursor-pointer"
          title={isPlaying ? 'Пауза' : 'Воспроизведение'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white" />
          ) : (
            <Play className="w-5 h-5 fill-white ml-0.5" />
          )}
        </button>

        {/* Speed button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={cyclePlaybackRate}
            className="px-2.5 py-1.5 rounded-xl bg-[#22222c] hover:bg-[#2c2c38] text-xs font-mono font-bold text-[#ededed] hover:text-[#9ac43e] transition-colors cursor-pointer border border-white/5 flex items-center gap-1"
            title="Скорость"
          >
            <FastForward className="w-3.5 h-3.5 opacity-70" />
            <span>{playbackRate}x</span>
          </button>
        </div>
      </div>
    </div>
  );
};
