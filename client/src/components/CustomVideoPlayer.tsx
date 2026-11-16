import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Download,
  AlertCircle,
} from 'lucide-react';
import { sound } from '../utils/sound.js';

interface CustomVideoPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  onDownload?: () => void;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  src,
  title,
  autoPlay = true,
  className = '',
  onDownload,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [hasVideoFrame, setHasVideoFrame] = useState(true);
  const [codecWarning, setCodecWarning] = useState(false);

  // Load video source and detect codec playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = src;
    video.load();
    setCurrentTime(0);
    setIsPlaying(false);
    setCodecWarning(false);
    setHasVideoFrame(true);

    if (autoPlay) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    // Check if video track has decodable visual frames
    const checkTimer = setTimeout(() => {
      if (video && video.readyState >= 1) {
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          setHasVideoFrame(false);
          setCodecWarning(true);
        }
      }
    }, 1500);

    return () => clearTimeout(checkTimer);
  }, [src, autoPlay]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(video.currentTime);
      }
      if (video.buffered.length > 0) {
        try {
          setBufferedEnd(video.buffered.end(video.buffered.length - 1));
        } catch {
          // ignore
        }
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setHasVideoFrame(true);
        setCodecWarning(false);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(true);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onError = () => {
      console.warn('Video element reported error, likely unsupported codec', video.error);
      setCodecWarning(true);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onEnded);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('error', onError);
    };
  }, [isDragging]);

  // Handle Fullscreen Change events
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Auto-hide controls during playback
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, isDragging]);

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    sound.playClick();
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    sound.playClick();
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    sound.playClick();
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  };

  const handleRateCycle = () => {
    sound.playClick();
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const toggleFullscreen = () => {
    sound.playClick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Seek bar interaction
  const handleSeek = (clientX: number) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    setCurrentTime(newTime);
    videoRef.current.currentTime = newTime;
  };

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleProgressBarMouseLeave = () => {
    setHoverTime(null);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full max-w-4xl max-h-[75vh] flex items-center justify-center bg-[#0a0a0e] rounded-2xl overflow-hidden border border-[#2a2a35] shadow-2xl group select-none ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        className="max-w-full max-h-[75vh] w-auto h-auto object-contain cursor-pointer"
      />

      {/* Codec Warning Notice (When video track cannot be visually decoded, e.g. HEVC in MOV) */}
      {(codecWarning || !hasVideoFrame) && (
        <div className="absolute top-4 left-4 right-4 z-40 p-3.5 sm:p-4 rounded-2xl bg-[#14141e]/95 border border-[#789d2a]/50 shadow-2xl backdrop-blur-md flex items-start gap-3 text-left animate-in fade-in duration-300">
          <div className="w-8 h-8 rounded-xl bg-[#789d2a]/20 border border-[#789d2a] text-[#9ac43e] flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#ededed] mb-0.5">
              Звук воспроизводится · Видеокодек не поддерживается браузером
            </h4>
            <p className="text-[11px] sm:text-xs text-[#aaaaaa] leading-relaxed">
              Файл {title ? `«${title}»` : ''} использует кодек (Apple HEVC/ProRes в MOV), который браузер декодирует только как аудио. Скачайте файл для просмотра видеоряда в плеере Windows или VLC.
            </p>
          </div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="px-3 py-1.5 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-white text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать</span>
            </button>
          )}
        </div>
      )}

      {/* Center Big Play Button (Visible when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#789d2a] hover:bg-[#8cb632] hover:scale-105 active:scale-95 text-white flex items-center justify-center transition-all shadow-[0_0_35px_rgba(120,157,42,0.6)] cursor-pointer"
          title="Воспроизвести"
        >
          <Play className="w-7 h-7 sm:w-9 sm:h-9 ml-1 fill-current" />
        </button>
      )}

      {/* Floating Bottom Control Dock (Styled in dark cyber Bridgik theme) */}
      <div
        className={`absolute bottom-3 left-3 right-3 z-30 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-[#121218]/95 border border-white/15 shadow-2xl backdrop-blur-md flex flex-col gap-2 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Seekbar */}
        <div
          ref={progressBarRef}
          onMouseDown={(e) => {
            setIsDragging(true);
            handleSeek(e.clientX);
            const onMouseMove = (moveEvent: MouseEvent) => handleSeek(moveEvent.clientX);
            const onMouseUp = () => {
              setIsDragging(false);
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
          onMouseMove={handleProgressBarMouseMove}
          onMouseLeave={handleProgressBarMouseLeave}
          className="relative w-full h-2 hover:h-3 rounded-full bg-[#272733] cursor-pointer transition-all flex items-center group/bar"
        >
          {/* Buffered Track */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/15 rounded-full transition-all"
            style={{ width: `${bufferedPercent}%` }}
          />

          {/* Played Progress Track */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#789d2a] to-[#9ac43e] rounded-full"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Seek Thumb */}
          <div
            className="absolute -top-1 w-4 h-4 rounded-full bg-[#bbf348] border-2 border-[#121218] shadow-[0_0_10px_#9ac43e] -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#0e0e14] border border-white/20 text-[10px] font-mono text-white pointer-events-none shadow-lg whitespace-nowrap"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Left Controls: Play, Skips, Time */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 sm:p-2 rounded-xl bg-[#25252e] hover:bg-[#32323e] text-[#ededed] hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Пауза (Пробел)' : 'Воспроизвести (Пробел)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Skip -10s */}
            <button
              onClick={() => skipTime(-10)}
              className="p-1.5 rounded-xl text-[#aaaaaa] hover:text-white hover:bg-[#25252e] transition-colors cursor-pointer"
              title="Назад на 10 секунд"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Skip +10s */}
            <button
              onClick={() => skipTime(10)}
              className="p-1.5 rounded-xl text-[#aaaaaa] hover:text-white hover:bg-[#25252e] transition-colors cursor-pointer"
              title="Вперед на 10 секунд"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Time / Duration */}
            <div className="text-xs font-mono font-bold text-[#cccccc] px-1 sm:px-2 select-none">
              <span className="text-[#9ac43e]">{formatTime(currentTime)}</span>
              <span className="text-[#666677] mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Volume, Speed, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Volume Toggle & Slider */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 sm:p-2 rounded-xl text-[#aaaaaa] hover:text-white hover:bg-[#25252e] transition-colors cursor-pointer"
                title={isMuted ? 'Включить звук' : 'Выключить звук'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-12 sm:w-16 h-1 rounded-lg bg-[#333342] accent-[#9ac43e] cursor-pointer"
                title={`Громкость: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>

            {/* Speed Cycle Button */}
            <button
              onClick={handleRateCycle}
              className="px-2 py-1 rounded-lg bg-[#25252e] hover:bg-[#32323e] text-xs font-mono font-bold text-[#aaaaaa] hover:text-[#9ac43e] transition-colors cursor-pointer"
              title="Скорость воспроизведения"
            >
              {playbackRate}x
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-xl text-[#aaaaaa] hover:text-white hover:bg-[#25252e] transition-colors cursor-pointer"
              title={isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
