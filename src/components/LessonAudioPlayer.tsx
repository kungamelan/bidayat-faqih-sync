import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  X,
  Volume2,
  AlertCircle,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { ThemeMode, LessonAudio } from '../types';
import * as audioService from '../services/audioService';

interface LessonAudioPlayerProps {
  lessonId: string;
  lessonTitle: string;
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeMode;
}

export const LessonAudioPlayer: React.FC<LessonAudioPlayerProps> = ({
  lessonId,
  lessonTitle,
  isOpen,
  onClose,
  activeTheme,
}) => {
  const [audioMetadata, setAudioMetadata] = useState<LessonAudio | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load audio on open or lessonId change
  useEffect(() => {
    let isCancelled = false;

    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    async function loadAudio() {
      setIsLoading(true);
      try {
        const meta = await audioService.getLessonAudio(lessonId);
        if (isCancelled) return;

        setAudioMetadata(meta);

        if (meta) {
          const url = await audioService.getLessonAudioUrl(lessonId);
          if (isCancelled) return;
          setAudioUrl(url);
        } else {
          setAudioUrl(null);
        }
      } catch (err) {
        console.error('Failed to load audio for lesson', lessonId, err);
        setAudioMetadata(null);
        setAudioUrl(null);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAudio();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, lessonId]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error('Audio playback error', e));
    }
  };

  // Skip forward / backward
  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
  };

  // Change playback speed
  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 1.75];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4"
          style={{
            backgroundColor: activeTheme.cardBg,
            borderColor: activeTheme.border,
            color: activeTheme.text,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-inner"
                style={{ backgroundColor: activeTheme.primary }}
              >
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>الشرح الصوتي المنهجي</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    بصوت فضيلة المعلم
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1">{lessonTitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
              <span className="text-xs font-bold">جاري تحميل الشرح الصوتي...</span>
            </div>
          )}

          {/* Empty State: No Audio Attached */}
          {!isLoading && !audioUrl && (
            <div className="py-6 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">لا يوجد شرح صوتي لهذا الدرس حالياً</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  يقوم فضيلة المعلم بتسجيل وإجازة الشروح الصوتية المعتمدة تباعاً. فور رفع الملف من قبل المعلم، ستتمكن من الاستماع إليه ومتابعته مباشرة هنا.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                العودة للقراءة
              </button>
            </div>
          )}

          {/* Audio Player State: Real Audio Loaded */}
          {!isLoading && audioUrl && (
            <div className="space-y-4 pt-1">
              {/* Hidden HTML5 Audio Element */}
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (audioRef.current) {
                    setDuration(audioRef.current.duration);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              {/* Title & Metadata Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white">
                    {audioMetadata?.title || 'تسجيل اللقاء الفقهي المعتمد'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {audioMetadata?.fileName} • {((audioMetadata?.size || 0) / (1024 * 1024)).toFixed(1)} ميغابايت
                  </p>
                </div>
                <button
                  onClick={cyclePlaybackRate}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 text-emerald-400 font-mono text-xs font-bold border border-slate-700 hover:bg-slate-700 transition-colors"
                  title="تغيير سرعة التشغيل"
                >
                  {playbackRate}x
                </button>
              </div>

              {/* Timeline Progress Bar */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = parseFloat(e.target.value);
                    setCurrentTime(newTime);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                    }
                  }}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  aria-label="شريط تقدم الصوت"
                />
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-0.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Player Controls (Play/Pause, -10s, +10s) */}
              <div className="flex items-center justify-center gap-4 pt-1">
                {/* Skip back 10 seconds */}
                <button
                  onClick={() => skipTime(-10)}
                  className="w-10 h-10 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                  title="إرجاع 10 ثوانٍ"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Primary Play / Pause Button */}
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: activeTheme.primary }}
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الشرح'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>

                {/* Skip forward 10 seconds */}
                <button
                  onClick={() => skipTime(10)}
                  className="w-10 h-10 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                  title="تقديم 10 ثوانٍ"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
