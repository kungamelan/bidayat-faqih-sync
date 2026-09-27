import React from 'react';
import { BookOpen, Trophy, Star, Settings, User, LogOut, ShieldCheck, HelpCircle, MessageCircle, FileText, Award } from 'lucide-react';
import { StudentProfile, UserRole, ThemeMode, CurrentUser } from '../types';
import { ROLE_LABELS } from '../services/permissionService';
import { createWhatsAppLink } from '../config/contactConfig';
import { StudentAvatar } from './StudentAvatar';

interface NavbarProps {
  currentUser: CurrentUser | null;
  currentStudent: StudentProfile | null;
  userRole: UserRole;
  currentView: string;
  onNavigate: (view: any) => void;
  onOpenThemeDrawer: () => void;
  onLogout: () => void;
  activeTheme: ThemeMode;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentStudent,
  userRole,
  currentView,
  onNavigate,
  onOpenThemeDrawer,
  onLogout,
  activeTheme,
}) => {
  const isLoggedIn = Boolean(currentStudent || (currentUser && userRole !== 'student'));
  return (
    <header
      style={{
        backgroundColor: activeTheme.cardBg,
        borderColor: activeTheme.border,
      }}
      className="sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 shadow-sm"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Right side: Brand & Logo */}
        <div
          onClick={() => onNavigate(currentStudent ? 'dashboard' : 'welcome')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shadow-md transition-transform group-hover:scale-105"
            style={{ backgroundColor: activeTheme.primary }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight" style={{ color: activeTheme.text }}>
                بداية فقيه
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                فقه الطهارة
              </span>
            </div>
            <p className="text-[11px] font-medium" style={{ color: activeTheme.textMuted }}>
              منصة التعليم الفقهي التفاعلي للناشئة
            </p>
          </div>
        </div>

        {/* Left side: Controls & User Info */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Student Status Card (if logged in) */}
          {currentStudent && (
            <div
              style={{ borderColor: activeTheme.border }}
              className="hidden lg:flex items-center gap-3 bg-slate-950/40 border px-3 py-1.5 rounded-xl shadow-inner text-xs"
            >
              <div className="flex items-center gap-2">
                <StudentAvatar avatar={currentStudent.avatar} name={currentStudent.name} size="xs" />
                <span className="font-bold text-xs" style={{ color: activeTheme.text }}>
                  {currentStudent.name}
                </span>
              </div>

              <div className="h-4 w-px bg-slate-700/50" />

              <div className="flex items-center gap-1 text-amber-500 font-black">
                <Trophy className="w-3.5 h-3.5" />
                <span>{currentStudent.totalPoints} نقطة</span>
              </div>

              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{currentStudent.totalStars}</span>
              </div>
            </div>
          )}

          {/* Student Navigation Links: Exams and Certificates */}
          {currentStudent && (
            <>
              <button
                onClick={() => onNavigate('exams')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'exams'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title="قسم الاختبارات الرسمية بالكود"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>الاختبارات</span>
              </button>

              <button
                onClick={() => onNavigate('certificates')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'certificates'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title="شهادات التقدير والتميز"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">شهاداتي</span>
              </button>

              <button
                onClick={() => onNavigate('leaderboard')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'leaderboard'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title="لوحة الأبطال والمتفوقين"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">الأبطال</span>
              </button>
            </>
          )}

          {/* Teacher Profile Link for Students */}
          <button
            onClick={() => onNavigate('about-teacher')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'about-teacher'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="بيانات المعلم والمشرف"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">بيانات المعلم</span>
          </button>

          {/* External WhatsApp Contact Button */}
          <a
            href={createWhatsAppLink({
              studentName: currentStudent?.name,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
            title="تواصل مع إدارة المنصة والمعلم مباشرة عبر واتساب"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">واتساب</span>
          </a>

          {/* Teacher / Admin Portal Entry */}
          <button
            onClick={() => onNavigate('teacher-cms')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'teacher-cms'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
            title="لوحة تحكم المعلم والإدارة"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">لوحة المعلم</span>
          </button>

          {/* Theme Drawer Gear */}
          <button
            onClick={onOpenThemeDrawer}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:rotate-45"
            title="تخصيص المظهر والألوان وحجم الخط"
            aria-label="إعدادات المظهر"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout button */}
          {isLoggedIn && (
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

