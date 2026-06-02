import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Volume2, VolumeX, Maximize, Pause, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
}

export default function VideoModal({ isOpen, onClose, src }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [showControls, setShowControls] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const hideControlsTimer = useRef<number | undefined>(undefined);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  }, [onClose]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-play when opening
      setTimeout(() => {
        videoRef.current?.play();
        setIsPlaying(true);
      }, 400);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    window.clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) resetControlsTimer();
    else setShowControls(true);
  }, [isPlaying, resetControlsTimer]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const pct = (video.currentTime / video.duration) * 100;
    setProgress(pct);
    setCurrentTime(formatTime(video.currentTime));
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(formatTime(video.duration));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) handleClose();
      }}
      onMouseMove={resetControlsTimer}
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className={`absolute top-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
          showControls
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
        }}
        aria-label="Close video"
      >
        <X size={18} className="text-white" />
      </button>

      {/* Video container */}
      <div
        ref={containerRef}
        className={`relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden transition-all duration-500 ease-out ${
          isClosing
            ? 'scale-90 opacity-0'
            : 'scale-100 opacity-100'
        }`}
        style={{
          boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          animationName: isClosing ? 'none' : 'modalSlideUp',
          animationDuration: '0.5s',
          animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          animationFillMode: 'both',
        }}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover bg-black"
          playsInline
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play/Pause overlay icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
            !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(45, 212, 191, 0.85)',
              boxShadow: '0 8px 32px rgba(45, 212, 191, 0.4)',
            }}
          >
            <Play size={30} className="text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Bottom controls bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
            showControls
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.85))',
            padding: '40px 20px 16px',
          }}
        >
          {/* Progress bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="group relative w-full h-1.5 rounded-full cursor-pointer mb-3 transition-all hover:h-2.5"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #2dd4bf, #14b8a6)',
              }}
            />
            {/* Scrub handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                left: `${progress}%`,
                transform: `translate(-50%, -50%)`,
                background: '#fff',
                boxShadow: '0 0 8px rgba(45,212,191,0.6)',
              }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/pause */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={15} className="text-white" fill="white" />
                ) : (
                  <Play size={15} className="text-white ml-0.5" fill="white" />
                )}
              </button>

              {/* Mute */}
              <button
                onClick={toggleMute}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX size={15} className="text-white" />
                ) : (
                  <Volume2 size={15} className="text-white" />
                )}
              </button>

              {/* Time */}
              <span
                className="text-xs font-mono tracking-wide"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {currentTime}
                <span style={{ color: 'rgba(255,255,255,0.35)' }}> / {duration}</span>
              </span>
            </div>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              aria-label="Fullscreen"
            >
              <Maximize size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
