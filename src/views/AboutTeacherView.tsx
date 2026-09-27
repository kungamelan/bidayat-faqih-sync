import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, GraduationCap, Award, BookOpen, Sparkles, MessageCircle } from 'lucide-react';
import { ThemeMode, TeacherProfile } from '../types';
import { createWhatsAppLink } from '../config/contactConfig';

interface AboutTeacherViewProps {
  teacherProfile: TeacherProfile;
  activeTheme: ThemeMode;
  onBack: () => void;
}

export const AboutTeacherView: React.FC<AboutTeacherViewProps> = ({
  teacherProfile,
  activeTheme,
  onBack,
}) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] p-8 sm:p-12 border shadow-2xl space-y-8"
        style={{
          backgroundColor: activeTheme.cardBg,
          borderColor: activeTheme.border,
        }}
      >
        <button
          onClick={onBack}
          className="text-xs font-bold flex items-center gap-1.5 hover:underline"
          style={{ color: activeTheme.primary }}
        >
          <ArrowRight className="w-4 h-4" />
          العودة للمنصة
        </button>

        {/* Teacher Header */}
        <div className="text-center space-y-3">
          {teacherProfile.avatar ? (
            <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto shadow-xl border-2 border-emerald-500/40">
              <img
                src={teacherProfile.avatar}
                alt={teacherProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl"
              style={{ backgroundColor: activeTheme.primary }}
            >
              <GraduationCap className="w-10 h-10" />
            </div>
          )}

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
            {teacherProfile.title || 'إشراف وبناء علمي وتربوي'}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {teacherProfile.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            {teacherProfile.bio}
          </p>
        </div>

        {/* Credentials Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Award className="w-4 h-4" />
              <span>المؤهلات الأكاديمية</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {teacherProfile.qualifications}
            </p>
          </div>

          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <BookOpen className="w-4 h-4" />
              <span>الإجازات والسند العلمي</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {teacherProfile.certifications}
            </p>
          </div>
        </div>

        {/* Vision & Pedagogy */}
        {teacherProfile.missionStatement && (
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>رسالة مشروع بداية فقيه</span>
            </div>
            <p className="text-xs text-slate-300 leading-loose">
              {teacherProfile.missionStatement}
            </p>
          </div>
        )}

        {/* WhatsApp External Contact */}
        <div className="text-center pt-2">
          <a
            href={createWhatsAppLink(
              {
                customMessage: `السلام عليكم ورحمة الله، أود الاستفسار والتواصل بخصوص برنامج بداية فقيه مع ${teacherProfile.name}.`,
              },
              teacherProfile.whatsappPhone
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تواصل مع فضيلة المعلم وإدارة المنصة عبر واتساب</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};
