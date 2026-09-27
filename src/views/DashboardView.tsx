import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Lock,
  Unlock,
  Trophy,
  Star,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  Clock,
  MessageCircle,
  FileText,
  Award,
  HelpCircle,
  Camera,
  Edit3,
  X,
  Medal,
  Crown,
} from 'lucide-react';
import { Lesson, StudentProfile, StudentProgress, ThemeMode } from '../types';
import { Badge } from '../components/Badge';
import { createWhatsAppLink } from '../config/contactConfig';
import { StudentAvatar, PRESET_AVATARS, compressImageFileToDataUrl } from '../components/StudentAvatar';
import * as storageService from '../services/storageService';

interface DashboardViewProps {
  lessons: Lesson[];
  currentStudent: StudentProfile;
  studentProgress: StudentProgress;
  adminUnlocks: { [lessonId: string]: boolean };
  activeTheme: ThemeMode;
  onSelectLesson: (lesson: Lesson) => void;
  onStartQuiz: (lesson: Lesson) => void;
  onNavigateToTeacher?: () => void;
  onNavigateToExams?: () => void;
  onNavigateToCertificates?: () => void;
  onNavigateToLeaderboard?: () => void;
  onUpdateStudentAvatar?: (newAvatar: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lessons,
  currentStudent,
  studentProgress,
  adminUnlocks,
  activeTheme,
  onSelectLesson,
  onStartQuiz,
  onNavigateToTeacher,
  onNavigateToExams,
  onNavigateToCertificates,
  onNavigateToLeaderboard,
  onUpdateStudentAvatar,
}) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate completed count
  const completedCount = lessons.filter(
    (l) => studentProgress[l.id]?.finished
  ).length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  // Helper to determine accessibility of a lesson
  const getLessonAccess = (lesson: Lesson, index: number) => {
    const isFinished = studentProgress[lesson.id]?.finished || false;
    const isMastered = studentProgress[lesson.id]?.mastered || false;
    const isTeacherUnlocked = adminUnlocks[lesson.id] ?? (index === 0);

    // Rule 2 & 9: Must be Lesson 1 OR previous lesson MASTERED (>= 80%)
    const isPrevMastered =
      index === 0 || (studentProgress[lessons[index - 1].id]?.mastered ?? false);

    // Accessible only when teacher unlocked AND previous lesson mastered
    const isAccessible = isTeacherUnlocked && isPrevMastered;

    let lockReason = '';
    if (!isPrevMastered) {
      lockReason = 'يلزم تحقيق حد الإتقان (80% فما فوق) في اللقاء السابق لفتح هذا اللقاء';
    } else if (!isTeacherUnlocked) {
      lockReason = 'حققت حد الإتقان بنجاح! انتظر فتح هذا اللقاء من معلمك';
    }

    return {
      isAccessible,
      isFinished,
      isMastered,
      lockReason,
      progressInfo: studentProgress[lesson.id],
    };
  };

  const handleAvatarSelect = (avatarIdOrUrl: string) => {
    if (onUpdateStudentAvatar) {
      onUpdateStudentAvatar(avatarIdOrUrl);
    }
    setShowAvatarModal(false);
  };

  const topChampions = React.useMemo(() => {
    const list = storageService.loadStudents();
    return [...list]
      .sort((a, b) => b.totalPoints - a.totalPoints || b.totalStars - a.totalStars)
      .slice(0, 3);
  }, [currentStudent.totalPoints, currentStudent.totalStars]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8" dir="rtl">
      {/* Student Overview Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] p-6 sm:p-8 border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
        style={{
          backgroundColor: activeTheme.cardBg,
          borderColor: activeTheme.border,
        }}
      >
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <StudentAvatar
              avatar={currentStudent.avatar}
              name={currentStudent.name}
              size="lg"
            />
            {onUpdateStudentAvatar && (
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                title="تغيير الصورة أو الشعار الرمزي"
                aria-label="تغيير الصورة الشخصية"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                مرحباً بك يا {currentStudent.name} 🌿
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {currentStudent.grade} • {currentStudent.school || 'طالب علم فقهي'}
            </p>
          </div>
        </div>

        {/* Progress & Stats Group */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Points Pill */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/20 px-4 py-2.5 rounded-2xl shadow-inner">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold">النقاط التراكمية</p>
              <p className="text-sm font-black text-amber-400">
                {currentStudent.totalPoints} نقطة
              </p>
            </div>
          </div>

          {/* Stars Pill */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-inner">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold">النجوم المكتسبة</p>
              <p className="text-sm font-black text-white">
                {currentStudent.totalStars} نجمة
              </p>
            </div>
          </div>

          {/* Overall Completion Ratio */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/20 px-4 py-2.5 rounded-2xl shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold">إنجاز كتاب الطهارة</p>
              <p className="text-sm font-black text-emerald-400">
                {completedCount} من {lessons.length} لقاءات ({progressPercent}%)
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Champions of Bidayat Faqih (أبطال بداية فقيه) - Objective Real System Data */}
      {topChampions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 sm:p-6 border shadow-xl bg-slate-900/90 border-amber-500/20 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-black">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>أبطال بداية فقيه</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    لوحة الشرف
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">فرسان الإتقان والتفوق الفقهي في كتاب الطهارة</p>
              </div>
            </div>

            {onNavigateToLeaderboard && (
              <button
                onClick={onNavigateToLeaderboard}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topChampions.map((champ, idx) => {
              const medals = ['🥇', '🥈', '🥉'];
              const titles = ['المتصدر الأول', 'وصيف الصدارة', 'فارس المتون'];
              const isCurrent = champ.id === currentStudent.id;

              return (
                <div
                  key={champ.id}
                  className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-amber-950/20 border-amber-400/50 ring-1 ring-amber-400/40'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <StudentAvatar avatar={champ.avatar} name={champ.name} size="md" />
                      <span className="absolute -top-1.5 -right-1.5 text-sm" title={`المركز ${idx + 1}`}>
                        {medals[idx] || '🎖️'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-white truncate">{champ.name}</h4>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                            أنت
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-amber-400/90 font-medium truncate">
                        {titles[idx] || `المركز ${idx + 1}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-xs font-black text-amber-400 block">{champ.totalPoints} نقطة</span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5 justify-end">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span>{champ.totalStars}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Access Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Official Exams Button */}
        {onNavigateToExams && (
          <button
            onClick={onNavigateToExams}
            className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 text-right transition-all flex flex-col justify-between h-24 group shadow-sm"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">
                الاختبارات الرسمية
              </span>
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-400">اختبارات بالكود والأسبوعية</p>
          </button>
        )}

        {/* 2. Certificates Button */}
        {onNavigateToCertificates && (
          <button
            onClick={onNavigateToCertificates}
            className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-right transition-all flex flex-col justify-between h-24 group shadow-sm"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                شهادات التميز
              </span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400">شهادات الإتقان المعتمدة</p>
          </button>
        )}

        {/* 3. Leaderboard Button */}
        {onNavigateToLeaderboard && (
          <button
            onClick={onNavigateToLeaderboard}
            className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-right transition-all flex flex-col justify-between h-24 group shadow-sm"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
                لوحة الأبطال
              </span>
              <Medal className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400">المتصدرون والمتفوقون</p>
          </button>
        )}

        {/* 4. Teacher Profile Button */}
        {onNavigateToTeacher && (
          <button
            onClick={onNavigateToTeacher}
            className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-right transition-all flex flex-col justify-between h-24 group shadow-sm"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black text-white group-hover:text-slate-200 transition-colors">
                بيانات المعلم
              </span>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-400">السند والمؤهلات الأكاديمية</p>
          </button>
        )}
      </div>

      {/* Progress Track Bar */}
      <div
        className="p-5 rounded-2xl border shadow-md space-y-2"
        style={{
          backgroundColor: activeTheme.cardBg,
          borderColor: activeTheme.border,
        }}
      >
        <div className="flex justify-between items-center text-xs font-bold text-slate-300">
          <span>مسار الرحلة الفقهية (اللقاءات التسعة)</span>
          <span className="text-emerald-400">{completedCount}/9 مكتمل</span>
        </div>
        <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* External WhatsApp Contact Card (C.9 Launcher) */}
      <a
        href={createWhatsAppLink({
          studentName: currentStudent.name,
        })}
        target="_blank"
        rel="noopener noreferrer"
        className="p-5 rounded-2xl border shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group hover:border-emerald-500/50 transition-all bg-gradient-to-r from-emerald-950/20 to-slate-900"
        style={{ borderColor: activeTheme.border }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-sm text-white group-hover:text-emerald-400 transition-colors">
                التواصل مع المعلم والمشرف عبر واتساب
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                واتساب خارجي
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              هل أشكلت عليك مسألة فقهية في كتاب الطهارة؟ اضغط هنا للتواصل المباشر مع فضيلة المعلم وإدارة المنصة عبر واتساب.
            </p>
          </div>
        </div>

        <span className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all whitespace-nowrap self-end sm:self-center flex items-center gap-1.5">
          <span>مراسلة عبر واتساب</span>
          <MessageCircle className="w-3.5 h-3.5" />
        </span>
      </a>

      {/* 9 Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson, idx) => {
          const { isAccessible, isFinished, isMastered, lockReason, progressInfo } =
            getLessonAccess(lesson, idx);

          return (
            <motion.div
              key={lesson.id}
              whileHover={isAccessible ? { y: -4 } : {}}
              className={`rounded-[2rem] p-6 border transition-all flex flex-col justify-between shadow-xl relative overflow-hidden ${
                isAccessible
                  ? 'border-slate-800 hover:border-emerald-500/60 cursor-pointer group'
                  : 'border-slate-900 opacity-60'
              }`}
              style={{
                backgroundColor: activeTheme.cardBg,
              }}
              onClick={() => {
                if (isAccessible) {
                  onSelectLesson(lesson);
                }
              }}
            >
              <div>
                {/* Top Meta: Order number + Badges */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-inner transition-colors ${
                        isAccessible
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {lesson.order}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      اللقاء {lesson.order}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {isMastered ? (
                    <Badge variant="emerald" size="sm">
                      <CheckCircle2 className="w-3 h-3" />
                      متقن ({progressInfo?.stars ? `${progressInfo.stars} ⭐` : '80%+'})
                    </Badge>
                  ) : isFinished ? (
                    <Badge variant="amber" size="sm">
                      اجتياز أولي ({progressInfo?.stars ? `${progressInfo.stars} ⭐` : ''}) - يلزم 80% للإتقان
                    </Badge>
                  ) : isAccessible ? (
                    <Badge variant="blue" size="sm">
                      مفتوح للدراسة
                    </Badge>
                  ) : (
                    <Badge variant="slate" size="sm">
                      <Lock className="w-3 h-3" />
                      مغلق
                    </Badge>
                  )}
                </div>

                {/* Lesson Title & Subtitle */}
                <h3 className="text-base sm:text-lg font-black text-white mb-2 leading-snug">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-2">
                  {lesson.summary}
                </p>
              </div>

              {/* Card Footer: Access info or Action button */}
              <div className="pt-4 border-t border-slate-800/80">
                {isAccessible ? (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      {lesson.hadiths.length} أحاديث مقررة
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLesson(lesson);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 shadow-sm transition-all hover:opacity-90"
                      style={{ backgroundColor: activeTheme.primary }}
                    >
                      <span>{isFinished ? 'مراجعة اللقاء' : 'دخول الدرس'}</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[11px] text-amber-300/80 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
                    <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span className="leading-snug">{lockReason}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Student Avatar Customization Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">تخصيص الشعار والصورة الشخصية</h3>
                    <p className="text-xs text-slate-400">اختر شعارك الرمزي أو ارفع صورتك الخاصة</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Preview + Upload file option */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <StudentAvatar avatar={currentStudent.avatar} name={currentStudent.name} size="lg" />
                  <div>
                    <div className="text-xs font-bold text-white">المظهر الحالي</div>
                    <div className="text-[11px] text-slate-400">{currentStudent.name}</div>
                  </div>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImageFileToDataUrl(file);
                          handleAvatarSelect(compressed);
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>رفع من جهازك</span>
                  </button>
                </div>
              </div>

              {/* Presets List */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  أو اختر أحد الشعارات الرمزية الجاهزة:
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_AVATARS.map((p) => {
                    const isSelected = currentStudent.avatar === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAvatarSelect(p.id)}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'ring-2 ring-emerald-400 border-white bg-slate-800'
                            : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                        }`}
                      >
                        <span className="text-2xl">{p.emoji}</span>
                        <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
