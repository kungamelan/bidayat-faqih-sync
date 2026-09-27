import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, LogIn, ArrowRight, BookOpen } from 'lucide-react';
import { ThemeMode } from '../types';

interface LoginViewProps {
  activeTheme: ThemeMode;
  onLogin: (usernameOrEmail: string, password: string) => boolean;
  onBackToWelcome: () => void;
  onGoToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  activeTheme,
  onLogin,
  onBackToWelcome,
  onGoToRegister,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('يرجى إدخال اسم المستخدم أو البريد الإلكتروني');
      return;
    }

    const success = onLogin(identifier.trim(), password);
    if (!success) {
      setError('بيانات الدخول غير صحيحة، أو لم يتم العثور على حساب بهذا الاسم');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[2.5rem] p-8 sm:p-10 border shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: activeTheme.cardBg,
          borderColor: activeTheme.border,
        }}
      >
        <button
          onClick={onBackToWelcome}
          className="text-xs font-bold mb-6 flex items-center gap-1.5 hover:underline"
          style={{ color: activeTheme.primary }}
        >
          <ArrowRight className="w-3.5 h-3.5" />
          العودة للرئيسية
        </button>

        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md"
            style={{ backgroundColor: activeTheme.primary, color: '#fff' }}
          >
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">تسجيل دخول الطالب</h2>
          <p className="text-xs text-slate-400 mt-1">
            أدخل بياناتك لمتابعة تقدمك في رحلة الفقه
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="أحمد محمد علي أو البريد"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-4"
            style={{ backgroundColor: activeTheme.primary }}
          >
            <LogIn className="w-4 h-4" />
            دخول المنصة
          </button>

          <div className="text-center pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              طالب جديد؟ <span style={{ color: activeTheme.primary }}>أنشئ حسابك الآن</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
