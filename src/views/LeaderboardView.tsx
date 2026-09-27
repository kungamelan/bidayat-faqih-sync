import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, ArrowRight, Award, Sparkles, Medal, Crown } from 'lucide-react';
import { StudentProfile, ThemeMode } from '../types';
import { StudentAvatar } from '../components/StudentAvatar';
import * as storageService from '../services/storageService';

interface LeaderboardViewProps {
  currentStudent: StudentProfile;
  activeTheme: ThemeMode;
  onBackToDashboard: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentStudent,
  activeTheme,
  onBackToDashboard,
}) => {
  const allStudents = storageService.loadStudents();

  // Sort descending by points, then stars
  const sortedStudents = [...allStudents].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return b.totalStars - a.totalStars;
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors mb-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للوحة الدروس</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            <span>لوحة الأبطال والمتفوقين</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            قائمة شرف الطلاب المتميزين في التفاعل، وحفظ الأدلة، وإتقان اختبارات كتاب الطهارة.
          </p>
        </div>

        {/* Current Student Rank Pill */}
        {(() => {
          const rank = sortedStudents.findIndex((s) => s.id === currentStudent.id) + 1;
          return (
            <div className="bg-slate-900 border border-amber-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
                #{rank || '-'}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold">ترتيبك الحالي</p>
                <p className="text-xs font-black text-white">
                  {currentStudent.totalPoints} نقطة • {currentStudent.totalStars} نجمة
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Podium Top 3 */}
      {sortedStudents.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 pt-4 max-w-2xl mx-auto items-end">
          {/* Second Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-2 flex flex-col items-center"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 text-xs font-black flex items-center justify-center">
              2
            </div>
            <StudentAvatar
              avatar={sortedStudents[1].avatar}
              name={sortedStudents[1].name}
              size="md"
            />
            <h4 className="text-xs font-black text-white truncate max-w-[100px]">
              {sortedStudents[1].name}
            </h4>
            <span className="text-[11px] font-bold text-amber-400">
              {sortedStudents[1].totalPoints} نقطة
            </span>
          </motion.div>

          {/* First Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-gradient-to-b from-amber-950/40 to-slate-900 border-2 border-amber-500/50 text-center space-y-2.5 flex flex-col items-center shadow-xl -translate-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 text-sm font-black flex items-center justify-center shadow-lg">
              <Crown className="w-5 h-5 fill-slate-950" />
            </div>
            <StudentAvatar
              avatar={sortedStudents[0].avatar}
              name={sortedStudents[0].name}
              size="lg"
            />
            <h4 className="text-sm font-black text-white truncate max-w-[120px]">
              {sortedStudents[0].name}
            </h4>
            <span className="text-xs font-black text-amber-400">
              {sortedStudents[0].totalPoints} نقطة
            </span>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              بطل المنهاج
            </span>
          </motion.div>

          {/* Third Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-2 flex flex-col items-center"
          >
            <div className="w-8 h-8 rounded-full bg-amber-900/60 text-amber-300 text-xs font-black flex items-center justify-center">
              3
            </div>
            <StudentAvatar
              avatar={sortedStudents[2].avatar}
              name={sortedStudents[2].name}
              size="md"
            />
            <h4 className="text-xs font-black text-white truncate max-w-[100px]">
              {sortedStudents[2].name}
            </h4>
            <span className="text-[11px] font-bold text-amber-400">
              {sortedStudents[2].totalPoints} نقطة
            </span>
          </motion.div>
        </div>
      )}

      {/* Full Students Roster Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <h3 className="text-sm font-black text-white mb-2 flex items-center gap-2">
          <Medal className="w-4 h-4 text-emerald-400" />
          <span>الترتيب العام لجميع الطلاب:</span>
        </h3>

        <div className="space-y-2">
          {sortedStudents.map((st, index) => {
            const isMe = st.id === currentStudent.id;

            return (
              <div
                key={st.id}
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  isMe
                    ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/40 shadow-md'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      index === 0
                        ? 'bg-amber-500 text-slate-950'
                        : index === 1
                        ? 'bg-slate-300 text-slate-900'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </span>

                  <StudentAvatar avatar={st.avatar} name={st.name} size="sm" />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {st.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          أنت
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{st.grade}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-black">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{st.totalPoints} نقطة</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{st.totalStars}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
