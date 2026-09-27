import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { BookOpen, UserPlus, LogIn, ShieldCheck, Sparkles, School, Shield, ChevronDown, Camera, Check } from 'lucide-react';
import { ACADEMIC_GRADES, ACADEMIC_YEARS, PRAYER_GENERAL_OPTIONS, PRAYER_MOSQUE_OPTIONS, SOCIAL_PLATFORMS } from '../data/studentsSchema';
import { StudentProfile, ThemeMode } from '../types';
import { PRESET_AVATARS, StudentAvatar, compressImageFileToDataUrl } from '../components/StudentAvatar';

interface WelcomeViewProps {
  activeTheme: ThemeMode;
  onRegisterNewStudent: (profile: Partial<StudentProfile>) => void;
  onOpenTeacherLogin: () => void;
  onGoToLogin: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  activeTheme,
  onRegisterNewStudent,
  onOpenTeacherLogin,
  onGoToLogin,
}) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    fatherPhone: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '14',
    school: '',
    grade: ACADEMIC_GRADES[6], // Default: الصف الأول الإعدادي
    academicYear: ACADEMIC_YEARS[1], // Default: 2025 / 2026
    quranMemorization: '3 أجزاء',
    prayerCommitment: PRAYER_GENERAL_OPTIONS[0],
    prayerMosque: PRAYER_MOSQUE_OPTIONS[0],
    skills: '',
    hobbies: '',
    videoGames: '',
    screenTime: '',
    socialPlatforms: [] as string[],
    telegramAccount: '',
    avatar: 'avatar-scholar', // Default initial avatar
  });

  const [formError, setFormError] = useState('');

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('يرجى كتابة الاسم الكريم رباعياً');
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      setFormError('كلمتا المرور غير متطابقتين');
      return;
    }

    setFormError('');
    onRegisterNewStudent(formData);
  };

  const toggleSocialPlatform = (platform: string) => {
    setFormData((prev) => {
      const exists = prev.socialPlatforms.includes(platform);
      return {
        ...prev,
        socialPlatforms: exists
          ? prev.socialPlatforms.filter((p) => p !== platform)
          : [...prev.socialPlatforms, platform],
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4" dir="rtl">
      {/* Welcome Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center rounded-[2.5rem] p-8 sm:p-12 border shadow-2xl relative overflow-hidden mb-8"
        style={{
          backgroundColor: activeTheme.cardBg,
          borderColor: activeTheme.border,
        }}
      >
        {/* Subtle Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>منصة التحول المعرفي والتحقيق الفقهي</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight" style={{ color: activeTheme.text }}>
          مشروع بداية فقيه
        </h1>

        <p className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8" style={{ color: activeTheme.textMuted }}>
          بيئة تعلم تفاعلية متدرجة تحول فقه الطهارة إلى رحلة معرفية ماتعة تجمع بين الفهم الراسخ، وحفظ الأحاديث، وتحدي التفكير.
        </p>

        {/* Primary Pathway Selector: Existing User vs New User */}
        {!showRegistrationForm ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={onGoToLogin}
              className="w-full sm:w-1/2 py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-sm border border-slate-700 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>تسجيل الدخول (لدي حساب)</span>
            </button>

            <button
              onClick={() => setShowRegistrationForm(true)}
              className="w-full sm:w-1/2 py-4 px-6 font-black rounded-2xl text-sm text-white shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
              style={{ backgroundColor: activeTheme.primary }}
            >
              <UserPlus className="w-4 h-4" />
              <span>حساب جديد (تسجيل أول مرة)</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setShowRegistrationForm(false)}
              className="text-xs font-bold text-slate-400 hover:text-white underline"
            >
              ← العودة لخيارات البوابة
            </button>
          </div>
        )}
      </motion.div>

      {/* New Student Registration Form (Sectioned, clear, non-intimidating) */}
      {showRegistrationForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] p-6 sm:p-10 border shadow-2xl"
          style={{
            backgroundColor: activeTheme.cardBg,
            borderColor: activeTheme.border,
          }}
        >
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-xl font-black text-white">إنشاء ملف طالب جديد</h2>
            <p className="text-xs text-slate-400 mt-1">
              املأ بياناتك الأساسية للبدء في رحلة تعلم فقه الطهارة
            </p>
          </div>

          {formError && (
            <div className="p-3.5 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmitRegistration} className="space-y-6">
            {/* اختيار الصورة الشخصية / الشعار الرمزي (Avatar) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StudentAvatar avatar={formData.avatar} name={formData.name || 'طالب'} size="lg" />
                  <div>
                    <label className="block text-xs font-black text-white">
                      الصورة الشخصية أو الشعار الرمزي *
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      اختر الشعار الرمزي المفضل لك أو ارفع صورتك من هاتفك/جهازك
                    </p>
                  </div>
                </div>

                {/* Upload from phone button */}
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
                          setFormData({ ...formData, avatar: compressed });
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
                    <span>رفع صورة من هاتفك</span>
                  </button>
                </div>
              </div>

              {/* Preset Avatars Grid */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="block text-[11px] font-bold text-slate-400 mb-2">
                  أو اختر شعاراً رمزياً جاهزاً:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PRESET_AVATARS.map((p) => {
                    const isSelected = formData.avatar === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: p.id })}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/50 shadow-md'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                        title={p.name}
                      >
                        <span className="text-xl leading-none">{p.emoji}</span>
                        <span className="text-[9px] font-bold text-slate-300 truncate max-w-full">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 1. البيانات الشخصية الأساسية */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" />
                1. البيانات الشخصية والدراسية
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    الاسم الرباعي الكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="اكتب اسمك كاملاً"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    العام الدراسي *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                      {ACADEMIC_YEARS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    الصف الدراسي *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                      {ACADEMIC_GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    المدرسة الحالية (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    placeholder="اسم مدرستك"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. بيانات الحساب والتواصل */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                2. بيانات الحساب وكلمة المرور
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    البريد الإلكتروني أو اسم المستخدم *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="اسم المستخدم أو البريد"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    رقم هاتف ولي الأمر (واتساب) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.fatherPhone}
                    onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                    placeholder="رقم للتواصل والمتابعة"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    كلمة المرور *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    تأكيد كلمة المرور *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. الصلاة والجانب التعبدي والقرآني */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                3. الصلاة والقرآن الكريم
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    المحافظة على الصلاة عموماً *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.prayerCommitment}
                      onChange={(e) => setFormData({ ...formData, prayerCommitment: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                      {PRAYER_GENERAL_OPTIONS.map((p, i) => (
                        <option key={i} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    الصلاة في المسجد *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.prayerMosque}
                      onChange={(e) => setFormData({ ...formData, prayerMosque: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                      {PRAYER_MOSQUE_OPTIONS.map((pm, i) => (
                        <option key={i} value={pm}>
                          {pm}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    كم تحفظ من القرآن الكريم؟ (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.quranMemorization}
                    onChange={(e) => setFormData({ ...formData, quranMemorization: e.target.value })}
                    placeholder="مثال: جزء عم، 3 أجزاء، القرآن كاملاً..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all hover:opacity-95"
              style={{ backgroundColor: activeTheme.primary }}
            >
              ابدأ الرحلة العلمية 🚀
            </button>
          </form>
        </motion.div>
      )}

      {/* Footer Branding & Teacher Access */}
      <footer className="mt-12 text-center text-xs text-slate-400 space-y-2">
        <p>مشروع بداية فقيه — هندسة المعرفة الفقهية للناشئة</p>
        <button
          onClick={onOpenTeacherLogin}
          className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 underline transition-colors"
        >
          دخول المعلم والمشرف إلى لوحة التحكم
        </button>
      </footer>
    </div>
  );
};
