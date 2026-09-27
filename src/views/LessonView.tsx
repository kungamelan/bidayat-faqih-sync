import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Quote,
  BookOpen,
  Sparkles,
  Timer,
  CheckCircle2,
  AlertCircle,
  Headphones,
  ChevronsUp,
  Pause,
  Square,
  Palette,
  Volume2,
  Plus,
  Minus,
} from 'lucide-react';
import { Lesson, ThemeMode, DesignSettings } from '../types';
import { useSelfScroll } from '../hooks/useSelfScroll';
import { SelfScrollSpeedLevel } from '../data/themeConfig';
import { LessonAudioPlayer } from '../components/LessonAudioPlayer';
import * as audioService from '../services/audioService';

interface LessonViewProps {
  lesson: Lesson;
  activeTheme: ThemeMode;
  designSettings: DesignSettings;
  onStartQuiz: () => void;
  onBackToDashboard: () => void;
  isLessonFinished: boolean;
  isLessonMastered?: boolean;
  onReviewQuiz?: () => void;
  onOpenThemeDrawer?: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  activeTheme,
  designSettings,
  onStartQuiz,
  onBackToDashboard,
  isLessonFinished,
  isLessonMastered = false,
  onReviewQuiz,
  onOpenThemeDrawer,
}) => {
  // Audio Player State
  const [isAudioPlayerOpen, setIsAudioPlayerOpen] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  // Check if current lesson has attached audio in IndexedDB
  useEffect(() => {
    let isMounted = true;
    audioService.getLessonAudio(lesson.id).then((audio) => {
      if (isMounted) {
        setHasAudio(Boolean(audio));
      }
    }).catch(() => {
      if (isMounted) {
        setHasAudio(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [lesson.id]);

  // Self-Scroll Engine
  const initialSpeed = (designSettings.selfScrollSpeed || 3) as SelfScrollSpeedLevel;
  const {
    isScrolling,
    isPaused,
    speedLevel,
    currentSpeedConfig,
    stopScroll,
    toggleScroll,
    increaseSpeed,
    decreaseSpeed,
  } = useSelfScroll({
    initialSpeedLevel: initialSpeed,
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8 relative pb-28" dir="rtl">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => {
            stopScroll();
            onBackToDashboard();
          }}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 w-fit"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة اللقاءات</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenThemeDrawer && (
            <button
              onClick={onOpenThemeDrawer}
              className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border shadow-sm hover:scale-105 active:scale-95"
              style={{
                backgroundColor: activeTheme.cardBg,
                borderColor: activeTheme.border,
                color: activeTheme.text,
              }}
              title="تخصيص نمط القراءة، الألوان، وحجم الخط"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>مظهر القراءة</span>
            </button>
          )}

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            اللقاء رقم {lesson.order} من 9
          </span>

          {isLessonMastered ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>متقن (80%+)</span>
            </span>
          ) : isLessonFinished ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>اجتياز أولي (يلزم 80% للإتقان)</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Lesson Title Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] p-8 border shadow-xl transition-colors duration-300 relative overflow-hidden"
        style={{
          backgroundColor: activeTheme.cardBg,
          borderColor: activeTheme.border,
        }}
      >
        {activeTheme.isWahyFeatured && (
          <div className="absolute top-4 left-6 flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>قراءة بنمط وحي</span>
          </div>
        )}
        <span className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2 block">
          كتاب الطهارة • منهاج بداية فقيه
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-3 leading-tight">
          {lesson.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
          {lesson.summary}
        </p>
      </motion.div>

      {/* Audio Explanation Foundation Card (Wahy Inspired) */}
      {hasAudio && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl p-5 border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all bg-gradient-to-r from-emerald-950/30 to-slate-900"
          style={{
            borderColor: activeTheme.border,
          }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-inner"
              style={{
                backgroundColor: activeTheme.primary,
                color: '#fff',
              }}
            >
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">الشرح الصوتي المنهجي للدرس</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  بصوت فضيلة المعلم
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تفصيل المسائل الفقهية، بيان الأدلة، وتوضيح الفروق الدقيقة بين الأحكام
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAudioPlayerOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap self-end sm:self-center"
            style={{
              backgroundColor: activeTheme.primary,
              color: '#fff',
            }}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>الاستماع للشرح الصوتي</span>
          </button>
        </motion.div>
      )}

      {/* 1. قسم الأحاديث والمتون المقررة للحفظ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[2.5rem] p-6 sm:p-8 border-r-4 border shadow-xl space-y-4 transition-colors duration-300"
        style={{
          backgroundColor: activeTheme.cardBg,
          borderColor: activeTheme.border,
          borderRightColor: activeTheme.primary,
        }}
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Quote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-base text-white">
              الأحاديث النبوية المقررة للحفظ
            </h3>
            <p className="text-[11px] text-slate-400">
              أدلة الأحكام المعتمدة في هذا اللقاء من الصحيحين
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {lesson.hadiths.map((hadithText, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 shadow-inner"
            >
              <p
                className="text-base sm:text-lg leading-loose text-emerald-100/90 font-serif italic"
                style={{ fontFamily: activeTheme.fontHadith || 'Amiri' }}
              >
                {hadithText}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 2. المادة الفقهية والأدلة الشاملة */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-[2.5rem] p-6 sm:p-10 border shadow-xl space-y-6 transition-colors duration-300"
        style={{
          backgroundColor: activeTheme.cardBg,
          borderColor: activeTheme.border,
        }}
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-base text-white">
              المادة الفقهية وتفصيل الأحكام
            </h3>
            <p className="text-[11px] text-slate-400">
              اقرأ المسائل بتأنٍ واستوعب شروطها وأدلتها قبل بدء التحدي
            </p>
          </div>
        </div>

        <div
          className="leading-[2.3] whitespace-pre-line space-y-4"
          style={{
            fontSize: `${designSettings.fontSize}px`,
            fontFamily: activeTheme.fontContent || designSettings.globalFont,
            color: activeTheme.text,
          }}
        >
          {lesson.content}
        </div>

        {lesson.teacherReviewNotes && lesson.teacherReviewNotes.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">تنبيه فقهي تربوي:</span>
              <p>
                في المسائل الدقيقة مثل ({lesson.teacherReviewNotes.join('، ')})، يُرجع فيها للمعلم
                المشرف لمزيد من البيان والضبط دون الخوض في الخلافات الموسعة.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* 3. Action Section: Start Quiz Challenge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center py-6 space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => {
              stopScroll();
              onStartQuiz();
            }}
            className="w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-2xl font-black text-base text-white shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
            style={{ backgroundColor: activeTheme.primary }}
          >
            <Timer className="w-5 h-5 animate-pulse" />
            <span>ابدأ تحدي الـ 30 ثانية التفاعلي 🚀</span>
          </button>

          {onReviewQuiz && (
            <button
              onClick={() => {
                stopScroll();
                onReviewQuiz();
              }}
              className="w-full sm:w-auto py-4 px-6 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>مراجعة الشروح الفقهية للاختبار الأخير</span>
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          10 أسئلة متوازنة من بنك اللقاء • 30 ثانية كاملة لكل سؤال • 5 نقاط للمحاولة الأولى (4 للثانية) • حد الإتقان 80% فما فوق
        </p>
      </motion.div>

      {/* 4. Single Unified Bottom Reading Toolbar (C.9.5) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94%] sm:w-auto max-w-xl" dir="rtl">
        <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-700/80 rounded-3xl p-2 px-3 sm:px-4 shadow-2xl flex items-center justify-between gap-2 text-xs">
          {/* A. Mandatory Auto-Scroll Button with Double Arrows Up Motion Icon */}
          <button
            onClick={toggleScroll}
            className={`px-3.5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-md ${
              isScrolling && !isPaused
                ? 'bg-amber-600 hover:bg-amber-500 text-white ring-2 ring-amber-400/50'
                : isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
            }`}
            title="بدء أو إيقاف التمرير التلقائي للأعلى"
            aria-label="التمرير التلقائي"
          >
            <ChevronsUp
              className={`w-5 h-5 transition-transform ${
                isScrolling && !isPaused ? 'animate-bounce text-amber-200' : 'text-emerald-200'
              }`}
            />
            <span className="hidden xs:inline sm:inline">
              {isScrolling && !isPaused ? 'إيقاف مؤقت' : isPaused ? 'استئناف' : 'التمرير التلقائي'}
            </span>
          </button>

          {/* Stop Button (only when active) */}
          {isScrolling && (
            <button
              onClick={stopScroll}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="إنهاء التمرير الذاتي"
              aria-label="إنهاء التمرير"
            >
              <Square className="w-4 h-4" />
            </button>
          )}

          {/* B. Speed Controls (- / level / +) */}
          <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 px-2 py-1.5 rounded-2xl">
            <button
              onClick={decreaseSpeed}
              disabled={speedLevel <= 1}
              className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs"
              title="تقليل السرعة"
              aria-label="تقليل سرعة التمرير"
            >
              <Minus className="w-3 h-3" />
            </button>

            <span className="text-[11px] font-bold text-slate-200 px-1 whitespace-nowrap">
              {currentSpeedConfig.label}
            </span>

            <button
              onClick={increaseSpeed}
              disabled={speedLevel >= 5}
              className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs"
              title="زيادة السرعة"
              aria-label="زيادة سرعة التمرير"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* C. Audio Button (🎧 الشرح الصوتي) - Shown only when audio is attached */}
          {hasAudio && (
            <button
              onClick={() => setIsAudioPlayerOpen(true)}
              className="px-3 py-2.5 rounded-2xl font-bold bg-slate-800/90 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 transition-all flex items-center gap-1.5"
              title="الاستماع للشرح الصوتي لهذا الدرس"
              aria-label="الشرح الصوتي"
            >
              <Headphones className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">الشرح الصوتي</span>
            </button>
          )}

          {/* D. Reading Settings Drawer Button */}
          {onOpenThemeDrawer && (
            <button
              onClick={onOpenThemeDrawer}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title="تخصيص نمط القراءة والخط"
              aria-label="إعدادات القراءة والمظهر"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Real Lesson Audio Player Modal / Drawer (C.9.5) */}
      <LessonAudioPlayer
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        isOpen={isAudioPlayerOpen}
        onClose={() => setIsAudioPlayerOpen(false)}
        activeTheme={activeTheme}
      />
    </div>
  );
};
