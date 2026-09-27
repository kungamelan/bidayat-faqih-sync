import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Palette,
  Type,
  CheckCircle2,
  Sparkles,
  Sliders,
  Eye,
  BookOpen,
} from 'lucide-react';
import { THEME_MODES, AVAILABLE_FONTS, SELF_SCROLL_SPEEDS } from '../data/themeConfig';
import { DesignSettings, StudentProfile } from '../types';

interface ThemeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  designSettings: DesignSettings;
  onUpdateDesignSettings: (settings: Partial<DesignSettings>) => void;
  currentStudent: StudentProfile | null;
}

export const ThemeDrawer: React.FC<ThemeDrawerProps> = ({
  isOpen,
  onClose,
  designSettings,
  onUpdateDesignSettings,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Translucent Backdrop (leaves underlying page visible for Live Preview) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/20 z-50 transition-opacity"
            aria-label="إغلاق المعاينة"
          />

          {/* Drawer Panel: ~70% width on mobile, leaving ~30% visible for instant live preview */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 left-0 h-full w-[76%] sm:w-[65%] md:w-[50%] max-w-md bg-slate-900/98 backdrop-blur-md border-r border-slate-800 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto text-slate-100 p-4 sm:p-6"
            dir="rtl"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm sm:text-base text-white">المظهر والثيمات</h3>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Eye className="w-2.5 h-2.5" />
                        <span>معاينة حية</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">انقر على أي ثيم لتطبيقه مباشرة</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Official Themes — Simple Color Swatches */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>اختر الثيم المفضل:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. ثيم وحي */}
                  {(() => {
                    const wahyTheme = THEME_MODES.find((m) => m.id === 'simple-academic') || THEME_MODES[0];
                    const isSelected = designSettings.activeThemeId === 'simple-academic' ||
                      (!['dorar-trust', 'whats-usool'].includes(designSettings.activeThemeId));

                    return (
                      <button
                        key="wahy"
                        type="button"
                        onClick={() => onUpdateDesignSettings({ activeThemeId: 'simple-academic' })}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-28 relative overflow-hidden group shadow-md ${
                          isSelected
                            ? 'ring-2 ring-emerald-400 border-white scale-[1.02]'
                            : 'hover:border-slate-500 hover:scale-[1.01]'
                        }`}
                        style={{
                          backgroundColor: wahyTheme.bg,
                          borderColor: isSelected ? wahyTheme.primary : wahyTheme.border,
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className="text-sm font-black"
                            style={{ color: wahyTheme.text }}
                          >
                            وحي
                          </span>
                          {isSelected && (
                            <CheckCircle2
                              className="w-5 h-5 shrink-0"
                              style={{ color: wahyTheme.primary }}
                            />
                          )}
                        </div>

                        {/* Visual Color Palette Swatch */}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border border-black/20 shadow-inner"
                            style={{ backgroundColor: wahyTheme.primary }}
                            title="اللون الأساسي"
                          />
                          <div
                            className="w-6 h-6 rounded-full border border-black/20 shadow-inner"
                            style={{ backgroundColor: wahyTheme.accent }}
                            title="اللون التكميلي"
                          />
                          <div
                            className="w-6 h-6 rounded-full border border-black/20 shadow-inner"
                            style={{ backgroundColor: wahyTheme.bg }}
                            title="لون الخلفية"
                          />
                        </div>

                        <span
                          className="text-[11px] font-bold opacity-75 truncate"
                          style={{ color: wahyTheme.textMuted }}
                        >
                          دافئ ومريح للقراءة
                        </span>
                      </button>
                    );
                  })()}

                  {/* 2. ثيم الدروس الثانوية */}
                  {(() => {
                    const secTheme = THEME_MODES.find((m) => m.id === 'dorar-trust');
                    if (!secTheme) return null;
                    const isSelected = designSettings.activeThemeId === secTheme.id;

                    return (
                      <button
                        key="secondary"
                        type="button"
                        onClick={() => onUpdateDesignSettings({ activeThemeId: secTheme.id })}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-28 relative overflow-hidden group shadow-md ${
                          isSelected
                            ? 'ring-2 ring-emerald-500 border-white scale-[1.02]'
                            : 'hover:border-slate-500 hover:scale-[1.01]'
                        }`}
                        style={{
                          backgroundColor: secTheme.bg,
                          borderColor: isSelected ? secTheme.primary : secTheme.border,
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className="text-sm font-black"
                            style={{ color: secTheme.text }}
                          >
                            الدروس الثانوية
                          </span>
                          {isSelected && (
                            <CheckCircle2
                              className="w-5 h-5 shrink-0"
                              style={{ color: secTheme.primary }}
                            />
                          )}
                        </div>

                        {/* Visual Color Palette Swatch */}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border border-black/20 shadow-inner"
                            style={{ backgroundColor: secTheme.primary }}
                            title="اللون الأساسي"
                          />
                          <div
                            className="w-6 h-6 rounded-full border border-black/20 shadow-inner"
                            style={{ backgroundColor: secTheme.accent }}
                            title="اللون التكميلي"
                          />
                          <div
                            className="w-6 h-6 rounded-full border border-black/20 shadow-inner"
                            style={{ backgroundColor: secTheme.bg }}
                            title="لون الخلفية"
                          />
                        </div>

                        <span
                          className="text-[11px] font-bold opacity-75 truncate"
                          style={{ color: secTheme.textMuted }}
                        >
                          نمط أكاديمي رسمي
                        </span>
                      </button>
                    );
                  })()}

                  {/* 3. ثيم واتساب */}
                  {(() => {
                    const waTheme = THEME_MODES.find((m) => m.id === 'whats-usool');
                    if (!waTheme) return null;
                    const isSelected = designSettings.activeThemeId === waTheme.id;

                    return (
                      <button
                        key="whatsapp"
                        type="button"
                        onClick={() => onUpdateDesignSettings({ activeThemeId: waTheme.id })}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-28 relative overflow-hidden group shadow-md ${
                          isSelected
                            ? 'ring-2 ring-emerald-400 border-white scale-[1.02]'
                            : 'hover:border-slate-500 hover:scale-[1.01]'
                        }`}
                        style={{
                          backgroundColor: waTheme.bg,
                          borderColor: isSelected ? waTheme.primary : waTheme.border,
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className="text-sm font-black"
                            style={{ color: waTheme.text }}
                          >
                            واتساب
                          </span>
                          {isSelected && (
                            <CheckCircle2
                              className="w-5 h-5 shrink-0"
                              style={{ color: waTheme.primary }}
                            />
                          )}
                        </div>

                        {/* Visual Color Palette Swatch */}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border border-black/20 shadow-inner"
                            style={{ backgroundColor: waTheme.primary }}
                            title="اللون الأساسي"
                          />
                          <div
                            className="w-6 h-6 rounded-full border border-black/20 shadow-inner"
                            style={{ backgroundColor: waTheme.accent }}
                            title="اللون التكميلي"
                          />
                          <div
                            className="w-6 h-6 rounded-full border border-black/20 shadow-inner"
                            style={{ backgroundColor: waTheme.cardBg }}
                            title="لون البطاقات"
                          />
                        </div>

                        <span
                          className="text-[11px] font-bold opacity-75 truncate"
                          style={{ color: waTheme.textMuted }}
                        >
                          أخضر زيتي ونقوش
                        </span>
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Font Size Adjuster (Instant Live Slider) */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-emerald-400" />
                    حجم الخط (تعديل مباشر)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-0.5 bg-emerald-500/10 rounded-md">
                    {designSettings.fontSize}px
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() =>
                      onUpdateDesignSettings({
                        fontSize: Math.max(14, designSettings.fontSize - 1),
                      })
                    }
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 flex items-center justify-center transition-all"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="14"
                    max="22"
                    value={designSettings.fontSize}
                    onChange={(e) =>
                      onUpdateDesignSettings({ fontSize: parseInt(e.target.value) })
                    }
                    className="flex-1 accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <button
                    onClick={() =>
                      onUpdateDesignSettings({
                        fontSize: Math.min(22, designSettings.fontSize + 1),
                      })
                    }
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-200 flex items-center justify-center transition-all"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Font Family Selector */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  نوع الخط العربي المفضل:
                </label>
                <select
                  value={designSettings.globalFont}
                  onChange={(e) => onUpdateDesignSettings({ globalFont: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                >
                  {AVAILABLE_FONTS.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Self-Scroll Default Speed Preference */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    سرعة التمرير التلقائي المفضلة
                  </label>
                  <span className="text-[11px] font-bold text-emerald-400">
                    {SELF_SCROLL_SPEEDS.find((s) => s.level === (designSettings.selfScrollSpeed || 3))?.label}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {SELF_SCROLL_SPEEDS.map((s) => {
                    const isSelected = (designSettings.selfScrollSpeed || 3) === s.level;
                    return (
                      <button
                        key={s.level}
                        type="button"
                        onClick={() => onUpdateDesignSettings({ selfScrollSpeed: s.level })}
                        className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {s.level} • {s.label.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                تُحفظ تفضيلات القراءة وتنعكس فوراً على كامل متون وشاشات بداية فقيه.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
