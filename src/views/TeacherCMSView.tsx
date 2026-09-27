import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  BookOpen,
  HelpCircle,
  BarChart3,
  Palette,
  ShieldCheck,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trophy,
  Star,
  Award,
  MessageCircle,
  Headphones,
  Upload,
  Play,
  Pause,
  FileAudio,
  Volume2,
  User,
  Camera,
} from 'lucide-react';
import { Lesson, StudentProfile, StudentProgress, ThemeMode, Question, LessonAudio, TeacherProfile } from '../types';
import { THEME_MODES, AVAILABLE_FONTS } from '../data/themeConfig';
import { Badge } from '../components/Badge';
import { createWhatsAppLink } from '../config/contactConfig';
import * as audioService from '../services/audioService';
import * as storageService from '../services/storageService';
import { compressImageFileToDataUrl } from '../components/StudentAvatar';

interface TeacherCMSViewProps {
  lessons: Lesson[];
  studentsList: StudentProfile[];
  studentProgress: StudentProgress;
  adminUnlocks: { [lessonId: string]: boolean };
  onToggleAdminUnlock: (lessonId: string) => void;
  onUpdateLesson: (updatedLesson: Lesson) => void;
  onUpdateStudentPoints: (studentId: string, deltaPoints: number) => void;
  onUpdateTeacherProfile: (profile: Partial<TeacherProfile>) => void;
  teacherProfile: TeacherProfile;
  activeTheme: ThemeMode;
  onBackToDashboard: () => void;
  onTeacherLoginSuccess?: () => void;
  isAlreadyAuthenticated?: boolean;
}

export const TeacherCMSView: React.FC<TeacherCMSViewProps> = ({
  lessons,
  studentsList,
  studentProgress,
  adminUnlocks,
  onToggleAdminUnlock,
  onUpdateLesson,
  onUpdateStudentPoints,
  onUpdateTeacherProfile,
  teacherProfile,
  activeTheme,
  onBackToDashboard,
  onTeacherLoginSuccess,
  isAlreadyAuthenticated = false,
}) => {
  // Authentication gate
  const [isAuthenticated, setIsAuthenticated] = useState(isAlreadyAuthenticated);
  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState(false);

  // CMS Tabs
  const [activeTab, setActiveTab] = useState<'students' | 'content' | 'audio' | 'analytics' | 'settings'>('students');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  // Lesson Editing State
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editHadiths, setEditHadiths] = useState<string[]>([]);

  // Audio Management State (C.9.5)
  const [selectedAudioLessonId, setSelectedAudioLessonId] = useState<string>(lessons[0]?.id || 'lesson-1');
  const [audiosMap, setAudiosMap] = useState<Record<string, LessonAudio>>({});
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioPreviewPlaying, setAudioPreviewPlaying] = useState<boolean>(false);
  const [audioTitleInput, setAudioTitleInput] = useState<string>('');
  const [isUploadingAudio, setIsUploadingAudio] = useState<boolean>(false);
  const [audioFeedback, setAudioFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const audioPreviewRef = React.useRef<HTMLAudioElement | null>(null);

  // Teacher Profile Editing State
  const [profileForm, setProfileForm] = useState<TeacherProfile>(() => {
    return teacherProfile || storageService.loadTeacherProfile();
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const teacherAvatarInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sync profileForm if prop changes
  React.useEffect(() => {
    if (teacherProfile) {
      setProfileForm(teacherProfile);
    }
  }, [teacherProfile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTeacherProfile(profileForm);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  // Load Audios List from IndexedDB
  React.useEffect(() => {
    async function loadAudios() {
      const list = await audioService.listAllLessonAudios();
      const map: Record<string, LessonAudio> = {};
      for (const a of list) {
        map[a.lessonId] = a;
      }
      setAudiosMap(map);
    }
    loadAudios();
  }, []);

  // Sync preview on selected lesson change
  React.useEffect(() => {
    let isCancelled = false;
    async function updatePreview() {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setAudioPreviewPlaying(false);

      if (audiosMap[selectedAudioLessonId]) {
        const url = await audioService.getLessonAudioUrl(selectedAudioLessonId);
        if (!isCancelled) {
          setAudioPreviewUrl(url);
          setAudioTitleInput(audiosMap[selectedAudioLessonId].title);
        }
      } else {
        if (!isCancelled) {
          setAudioPreviewUrl(null);
          const currentL = lessons.find((l) => l.id === selectedAudioLessonId);
          setAudioTitleInput(currentL ? `الشرح الصوتي: ${currentL.title}` : '');
        }
      }
    }
    updatePreview();
    return () => {
      isCancelled = true;
    };
  }, [selectedAudioLessonId, audiosMap, lessons]);

  const handleUploadAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    setAudioFeedback(null);

    try {
      const saved = await audioService.saveLessonAudio(selectedAudioLessonId, file, audioTitleInput);
      setAudiosMap((prev) => ({ ...prev, [selectedAudioLessonId]: saved }));
      setAudioFeedback({
        type: 'success',
        message: `تم حفظ واعتماد الملف الصوتي (${file.name}) بنجاح لهذا اللقاء!`,
      });
      const url = await audioService.getLessonAudioUrl(selectedAudioLessonId);
      setAudioPreviewUrl(url);
    } catch (err: any) {
      setAudioFeedback({
        type: 'error',
        message: err.message || 'فشل رفع الملف الصوتي.',
      });
    } finally {
      setIsUploadingAudio(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAudio = async () => {
    if (!window.confirm('هل أنت متأكد من حذف الشرح الصوتي لهذا اللقاء؟')) return;

    try {
      await audioService.deleteLessonAudio(selectedAudioLessonId);
      setAudiosMap((prev) => {
        const copy = { ...prev };
        delete copy[selectedAudioLessonId];
        return copy;
      });
      setAudioPreviewUrl(null);
      setAudioPreviewPlaying(false);
      setAudioFeedback({
        type: 'success',
        message: 'تم حذف الشرح الصوتي بنجاح.',
      });
    } catch (err: any) {
      setAudioFeedback({
        type: 'error',
        message: err.message || 'فشل حذف الملف الصوتي.',
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '2026' || passwordInput === 'admin') {
      setIsAuthenticated(true);
      setPassError(false);
      if (onTeacherLoginSuccess) {
        onTeacherLoginSuccess();
      }
    } else {
      setPassError(true);
    }
  };

  const startEditLesson = (l: Lesson) => {
    setEditingLessonId(l.id);
    setEditTitle(l.title);
    setEditSummary(l.summary);
    setEditContent(l.content);
    setEditHadiths([...l.hadiths]);
  };

  const saveEditedLesson = () => {
    if (!editingLessonId) return;
    const original = lessons.find((l) => l.id === editingLessonId);
    if (!original) return;

    const updated: Lesson = {
      ...original,
      title: editTitle,
      summary: editSummary,
      content: editContent,
      hadiths: editHadiths,
    };

    onUpdateLesson(updated);
    setEditingLessonId(null);
  };

  // Filter students
  const filteredStudents = studentsList.filter(
    (s) =>
      s.name.includes(searchQuery) ||
      (s.email && s.email.includes(searchQuery)) ||
      (s.grade && s.grade.includes(searchQuery))
  );

  // If not authenticated, show password screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] p-8 border shadow-2xl text-center bg-slate-900 border-slate-800"
        >
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            بوابة المعلم والإدارة
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            أدخل كلمة المرور السرية للوصول إلى لوحة التحكم التربوية
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="كلمة المرور (2026)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-sm text-white outline-none focus:border-emerald-500 transition-colors"
              />
              {passError && (
                <p className="text-rose-400 text-xs font-bold mt-2">
                  كلمة المرور غير صحيحة (التجربة: 2026)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all"
            >
              دخول لوحة التحكم
            </button>

            <button
              type="button"
              onClick={onBackToDashboard}
              className="text-xs text-slate-400 hover:text-white underline mt-2 block mx-auto"
            >
              العودة لواجهة المنصة
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              مركز تحكم المعلم والإدارة (Teacher CMS)
            </h2>
            <p className="text-xs text-slate-400">
              إدارة الطلاب، فتح وإغلاق اللقاءات، وتعديل المادة الفقهية دون المساس بالكود
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            معاينة كطالب
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            إغلاق اللوحة
          </button>
        </div>
      </div>

      {/* CMS Navigation Tabs */}
      <div className="flex bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl gap-1 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>سجل الطلاب ({studentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'content'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>إدارة المنهج واللقاءات (9)</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audio'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>الشروحات الصوتية ({Object.keys(audiosMap).length} معتمد)</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>التحليلات التربوية</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>بيانات المعلم</span>
        </button>

        <a
          href={createWhatsAppLink({
            customMessage: 'السلام عليكم ورحمة الله، استفسار إداري من المعلم بخصوص منصة بداية فقيه.',
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold mr-auto"
          title="تواصل إداري مع إدارة المؤسسة عبر واتساب"
        >
          <MessageCircle className="w-4 h-4" />
          <span>تواصل الإدارة عبر واتساب ↗</span>
        </a>
      </div>

      {/* Tab 1: Students Management */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Lesson Global Unlocks Control */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-black text-white mb-2 flex items-center gap-2">
              <Unlock className="w-4 h-4 text-emerald-400" />
              التحكم في فتح وإغلاق اللقاءات للطلاب (موافقة المعلم):
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              تذكير: فتح اللقاء يتطلب شرطين مجتمعين: (1) تحقيق الطالب لحد الإتقان (80% فما فوق) في اللقاء السابق + (2) تفعيل المفتاح الأخضر هنا.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
              {lessons.map((l) => {
                const isUnlocked = adminUnlocks[l.id] ?? (l.order === 1);
                return (
                  <button
                    key={l.id}
                    onClick={() => onToggleAdminUnlock(l.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      isUnlocked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? (
                      <Unlock className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-600" />
                    )}
                    <span className="text-xs font-black">لقاء {l.order}</span>
                    <span className="text-[10px] opacity-75">{isUnlocked ? 'مفتوح' : 'مغلق'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Students Roster & Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                سجل الطلاب وتفاصيل البيانات والدرجات
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم الطالب أو الصف..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-4 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-3">اسم الطالب</th>
                    <th className="py-3 px-3">الصف والعام</th>
                    <th className="py-3 px-3">هاتف ولي الأمر</th>
                    <th className="py-3 px-3">حفظ القرآن</th>
                    <th className="py-3 px-3">المحافظة على الصلاة</th>
                    <th className="py-3 px-3 text-center">النقاط</th>
                    <th className="py-3 px-3 text-center">النجوم</th>
                    <th className="py-3 px-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-white flex items-center gap-2">
                        <span>{st.name}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div>{st.grade}</div>
                        <span className="text-[10px] text-slate-500">{st.academicYear}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">{st.fatherPhone || st.phone || '-'}</td>
                      <td className="py-3.5 px-3">{st.quranMemorization || '-'}</td>
                      <td className="py-3.5 px-3 text-emerald-400">{st.prayerCommitment}</td>
                      <td className="py-3.5 px-3 text-center font-black text-amber-400">
                        {st.totalPoints}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-amber-400">
                        ⭐ {st.totalStars}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onUpdateStudentPoints(st.id, 50)}
                            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold border border-amber-500/20"
                            title="منح 50 نقطة تشجيعية"
                          >
                            +50 نقطة
                          </button>
                          <button
                            onClick={() => setSelectedStudent(st)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                            title="عرض الملف الكامل"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                        لا يوجد طلاب يطابقون البحث
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Selected Student Profile Full Card */}
          {selectedStudent && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-slate-100 space-y-4">
                <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-black text-lg text-white">{selectedStudent.name}</h3>
                    <p className="text-xs text-slate-400">{selectedStudent.grade}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                  >
                    إغلاق
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">الهاتف:</span>
                    <span className="font-bold text-white">{selectedStudent.phone || '-'}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">هاتف ولي الأمر:</span>
                    <span className="font-bold text-white">{selectedStudent.fatherPhone || '-'}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">حفظ القرآن:</span>
                    <span className="font-bold text-emerald-400">{selectedStudent.quranMemorization || '-'}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">الصلاة في المسجد:</span>
                    <span className="font-bold text-emerald-400">{selectedStudent.prayerMosque || '-'}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2">
                    <span className="text-slate-400 block mb-1">المهارات والهوايات:</span>
                    <span className="font-bold text-white">
                      {selectedStudent.skills || 'غير محدد'} • {selectedStudent.hobbies || ''}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-amber-400 font-bold">
                    إجمالي النقاط: {selectedStudent.totalPoints} نقطة
                  </span>
                  <button
                    onClick={() => {
                      onUpdateStudentPoints(selectedStudent.id, 100);
                      setSelectedStudent({
                        ...selectedStudent,
                        totalPoints: selectedStudent.totalPoints + 100,
                      });
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    +100 نقطة تميز 🌟
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Lessons & Content Editor */}
      {activeTab === 'content' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-white">محرر المادة الفقهية والأحاديث</h3>
              <p className="text-xs text-slate-400">
                يمكن للمعلم تعديل نصوص اللقاءات والأحاديث المقررة وحفظها فوراً في ذاكرة النظام
              </p>
            </div>
          </div>

          {editingLessonId ? (
            /* Active Lesson Editor */
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h4 className="font-black text-sm text-emerald-400">
                  تعديل محتوى اللقاء: {editTitle}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingLessonId(null)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={saveEditedLesson}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    حفظ ونشر التعديلات
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  عنوان اللقاء:
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الموجز التربوي:
                </label>
                <input
                  type="text"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  نص المادة الفقهية والأدلة:
                </label>
                <textarea
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs text-slate-200 leading-loose outline-none focus:border-emerald-500"
                />
              </div>

              {/* Hadiths Editor */}
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-2">
                  الأحاديث النبوية المقررة للحفظ في هذا اللقاء:
                </label>
                <div className="space-y-2 mb-3">
                  {editHadiths.map((h, hIdx) => (
                    <div key={hIdx} className="flex gap-2">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const updated = [...editHadiths];
                          updated[hIdx] = e.target.value;
                          setEditHadiths(updated);
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                      <button
                        onClick={() => {
                          setEditHadiths(editHadiths.filter((_, idx) => idx !== hIdx));
                        }}
                        className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 border border-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setEditHadiths([...editHadiths, 'حديث جديد...'])}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة حديث جديد
                </button>
              </div>
            </div>
          ) : (
            /* Lessons List */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessons.map((l) => (
                <div
                  key={l.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-start gap-4 hover:border-slate-700 transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 block mb-1">
                      اللقاء {l.order}
                    </span>
                    <h4 className="font-bold text-sm text-white mb-1">{l.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{l.summary}</p>
                    <span className="text-[11px] text-slate-500 mt-2 block font-medium">
                      {l.hadiths.length} أحاديث مقررة
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedAudioLessonId(l.id);
                        setActiveTab('audio');
                      }}
                      className={`p-2 rounded-xl text-xs flex items-center gap-1 ${
                        audiosMap[l.id]
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="إدارة الشرح الصوتي لهذا اللقاء"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>{audiosMap[l.id] ? 'صوت معتمد' : 'إرفاق صوت'}</span>
                    </button>

                    <button
                      onClick={() => startEditLesson(l)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Audio Management (C.9.5) */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-emerald-400" />
                  إدارة الشروحات الصوتية للدروس (IndexedDB Local Binary Storage)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  يمكن لفضيلة المعلم إرفاق ملف صوتي مخصص لكل لقاء (MP3, WAV, M4A, OGG). يتم تخزين الملفات بأمان محلياً وربطها باللقاء المختار فقط دون استهلاك LocalStorage.
                </p>
              </div>

              {audioFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    audioFeedback.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {audioFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{audioFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Lesson Selector Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                اختر اللقاء الفقهي المراد إدارة شرحه الصوتي:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                {lessons.map((l) => {
                  const isSelected = l.id === selectedAudioLessonId;
                  const hasAudio = Boolean(audiosMap[l.id]);

                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        setSelectedAudioLessonId(l.id);
                        setAudioFeedback(null);
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 relative ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-500/40'
                          : hasAudio
                          ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300 hover:bg-emerald-950/70'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black">لقاء {l.order}</span>
                      <span className="text-[10px] truncate max-w-full font-medium">
                        {hasAudio ? 'مرفق معتمد ✓' : 'لا يوجد صوت'}
                      </span>
                      {hasAudio && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 left-2 ring-2 ring-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Lesson Audio Detail Workspace */}
            {(() => {
              const currentLesson = lessons.find((l) => l.id === selectedAudioLessonId);
              const currentAudio = audiosMap[selectedAudioLessonId];

              return (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400">
                        اللقاء رقم {currentLesson?.order}
                      </span>
                      <h4 className="font-black text-base text-white">{currentLesson?.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{currentLesson?.summary}</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        currentAudio
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {currentAudio ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{currentAudio ? 'يوجد شرح صوتي معتمد' : 'بانتظار تسجيل الشرح'}</span>
                    </span>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg,.aac,audio/*"
                    onChange={handleUploadAudioFile}
                    className="hidden"
                  />

                  {currentAudio ? (
                    /* Existing Audio Preview & Management */
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                              <FileAudio className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-white">{currentAudio.title}</h5>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                اسم الملف: {currentAudio.fileName} • الحجم: {(currentAudio.size / (1024 * 1024)).toFixed(2)} MB • الموعد: {new Date(currentAudio.updatedAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingAudio}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5 text-emerald-400" />
                              <span>استبدال الملف</span>
                            </button>
                            <button
                              onClick={handleDeleteAudio}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>

                        {/* Audio Preview Element */}
                        {audioPreviewUrl && (
                          <div className="pt-2">
                            <audio
                              ref={audioPreviewRef}
                              src={audioPreviewUrl}
                              controls
                              className="w-full h-10 rounded-xl outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Upload New Audio Section */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          عنوان التسجيل الصوتي (اختياري):
                        </label>
                        <input
                          type="text"
                          value={audioTitleInput}
                          onChange={(e) => setAudioTitleInput(e.target.value)}
                          placeholder={`الشرح الصوتي: ${currentLesson?.title}`}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-8 border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl bg-slate-900/50 hover:bg-slate-900 text-center cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <h5 className="font-bold text-xs text-white">
                          انقر هنا لاختيار ملف الشرح الصوتي من جهازك
                        </h5>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          الصيغ المدعومة: MP3, WAV, M4A, OGG, AAC (بحد أقصى 60 ميغابايت). يتم التخزين بأمان في IndexedDB المرتبط بالمتصفح.
                        </p>
                        {isUploadingAudio && (
                          <p className="text-xs font-bold text-emerald-400 animate-pulse pt-2">
                            جاري حفظ واعتماد الملف الصوتي...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Tab 3: Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <h4 className="text-xs font-bold text-slate-400 mb-2">إجمالي الطلاب المسجلين</h4>
            <p className="text-3xl font-black text-white">{studentsList.length} طالب</p>
            <p className="text-xs text-emerald-400 mt-2">قاعدة بيانات تربوية متنامية</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <h4 className="text-xs font-bold text-slate-400 mb-2">النقاط المحققة</h4>
            <p className="text-3xl font-black text-amber-400">
              {studentsList.reduce((acc, s) => acc + s.totalPoints, 0)} نقطة
            </p>
            <p className="text-xs text-slate-400 mt-2">تحفيز وتنافس إيجابي مستمر</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <h4 className="text-xs font-bold text-slate-400 mb-2">اللقاءات المفتوحة</h4>
            <p className="text-3xl font-black text-emerald-400">
              {Object.values(adminUnlocks).filter(Boolean).length || 1} من 9
            </p>
            <p className="text-xs text-slate-400 mt-2">تحت إشراف المعلم والمربي</p>
          </div>
        </div>
      )}

      {/* Tab 4: Teacher Profile Settings (Single Source of Truth) */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                <span>إدارة وتعديل بيانات المعلم (Teacher Profile)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تعديل البيانات الرسمية لفضيلة المعلم، تنعكس التعديلات فوراً على صفحة الطالب والشهادات الممنوحة.
              </p>
            </div>

            {profileSaveSuccess && (
              <div className="p-3 rounded-xl text-xs font-bold flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تم حفظ وتحديث بيانات المعلم بنجاح!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Section */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {profileForm.avatar ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-md">
                    <img
                      src={profileForm.avatar}
                      alt={profileForm.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl">
                    {profileForm.name ? profileForm.name.charAt(0) : 'م'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">الصورة الشخصية للمعلم</h4>
                  <p className="text-xs text-slate-400">يمكنك رفع صورة شخصية رسمية أو شعار تربوي معتمد</p>
                </div>
              </div>

              <div>
                <input
                  ref={teacherAvatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const compressed = await compressImageFileToDataUrl(file);
                        setProfileForm((prev) => ({ ...prev, avatar: compressed }));
                      } catch (err) {
                        console.error('Failed to compress teacher avatar:', err);
                      }
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => teacherAvatarInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>تغيير الصورة</span>
                </button>
              </div>
            </div>

            {/* Basic Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الاسم الكامل لفضيلة المعلم:
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اللقب العلمي / الإشرافي:
                </label>
                <input
                  type="text"
                  value={profileForm.title}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رقم الواتساب للتواصل (مع مفتاح الدولة):
                </label>
                <input
                  type="text"
                  value={profileForm.whatsappPhone || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, whatsappPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  placeholder="+966500000000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  البريد الإلكتروني:
                </label>
                <input
                  type="email"
                  value={profileForm.email || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  placeholder="teacher@bidayat-faqih.edu"
                />
              </div>
            </div>

            {/* Bio & Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  النبذة التعريفية والتخصص:
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المؤهلات العلمية والأكاديمية:
                </label>
                <textarea
                  rows={2}
                  value={profileForm.qualifications}
                  onChange={(e) => setProfileForm({ ...profileForm, qualifications: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الإجازات العلمية والسند:
                </label>
                <textarea
                  rows={2}
                  value={profileForm.certifications}
                  onChange={(e) => setProfileForm({ ...profileForm, certifications: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الرسالة التربوية لمشروع بداية فقيه:
                </label>
                <textarea
                  rows={3}
                  value={profileForm.missionStatement || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, missionStatement: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>حفظ واعتماد بيانات المعلم</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
