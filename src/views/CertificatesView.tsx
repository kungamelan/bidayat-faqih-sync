import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  ArrowRight,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  FileText,
  Printer,
  X,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { CertificateItem, StudentProfile, ThemeMode } from '../types';
import * as storageService from '../services/storageService';

interface CertificatesViewProps {
  currentStudent: StudentProfile;
  activeTheme: ThemeMode;
  onBackToDashboard: () => void;
  onNavigateToExams: () => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  currentStudent,
  activeTheme,
  onBackToDashboard,
  onNavigateToExams,
}) => {
  const [certificates, setCertificates] = useState<CertificateItem[]>(() =>
    storageService.getCertificatesForStudent(currentStudent.id)
  );

  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors mb-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة اللقاءات</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Award className="w-7 h-7 text-amber-400" />
            <span>شهادات التقدير والتميز الفقهي</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            سجل الشرف والشهادات الرسمية المعتمدة الصادرة باسم الطالب عند إتقان واجتياز الاختبارات الفقهية.
          </p>
        </div>

        <button
          onClick={onNavigateToExams}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-center"
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>خوض اختبار رسمي جديد</span>
        </button>
      </div>

      {/* Certificates List or Empty State */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedCert(cert)}
              className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400/70 shadow-xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Decorative Corner Ribbon */}
              <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
                <div className="w-24 h-6 bg-amber-500 text-slate-950 text-[9px] font-black uppercase text-center leading-6 -rotate-45 -translate-x-6 translate-y-3 shadow-md">
                  معتمد
                </div>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-black shadow-inner">
                  <Award className="w-6 h-6" />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    كود: {cert.certificateCode}
                  </span>
                  <h3 className="text-base font-black text-white mt-1.5 group-hover:text-amber-300 transition-colors">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-amber-400 font-bold mt-0.5">{cert.honorsTitle}</p>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {cert.milestoneDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                <span>التاريخ: {cert.issueDate}</span>
                <span className="font-bold text-amber-400 group-hover:underline flex items-center gap-1">
                  <span>عرض وطباعة</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty Roadmap */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 sm:p-12 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-xl text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">لم تصدر لك شهادات حتى الآن</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              شهادات بداية فقيه تُمنح للمتميزين عند اجتياز الاختبارات الدورية أو الفصلية أو الاختبار الشامل لكتاب الطهارة.
            </p>
          </div>

          {/* Roadmap to Earn Certificates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-right pt-2">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
                <span>1. إتمام اللقاءات الفقهية</span>
              </div>
              <p className="text-[11px] text-slate-400">
                حقق حد الإتقان (80% فما فوق) في لقاءات كتاب الطهارة التسعة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-xs font-black text-amber-400 flex items-center gap-1">
                <span>2. الاختبارات الدورية</span>
              </div>
              <p className="text-[11px] text-slate-400">
                اجتز الاختبار الدوري الأول (DAWRI-01) بنسبة 75% فما فوق.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-xs font-black text-cyan-400 flex items-center gap-1">
                <span>3. الاختبار الختامي</span>
              </div>
              <p className="text-[11px] text-slate-400">
                اجتز الاختبار النهائي الشامل (FINAL-2026) لنيل الإجازة الفقهية الكبرى.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToExams}
            className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            الانتقال لقسم الاختبارات الرسمية
          </button>
        </motion.div>
      )}

      {/* Official Certificate Modal / Preview */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-[#faf6ee] text-[#1c1917] border-4 border-[#b08968] rounded-[2rem] p-6 sm:p-10 max-w-2xl w-full shadow-2xl relative space-y-6 my-8"
              style={{ fontFamily: 'Amiri, Cairo, serif' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors print:hidden"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate Inner Border */}
              <div className="border-2 border-dashed border-[#b08968]/70 p-6 sm:p-8 rounded-2xl text-center space-y-5 relative bg-white/70">
                {/* Header */}
                <div className="space-y-1">
                  <div className="text-xs tracking-widest text-[#78350f] font-sans font-bold">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                  <div className="text-xs text-stone-600 font-sans">
                    منصة بداية فقيه للتعليم والتحقيق الفقهي
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1b4332] pt-2">
                    شَهَادَةُ تَمَيُّزٍ وَإِتْقَانٍ فِقْهِيّ
                  </h1>
                </div>

                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#b08968] to-transparent mx-auto" />

                {/* Body Text */}
                <div className="text-sm sm:text-base leading-loose text-stone-800 space-y-2">
                  <p>تَشْهَدُ إِدَارَةُ مَشْرُوعِ «بِدَايَةُ فَقِيه» بِأَنَّ الطَّالِبَ النَّجِيب:</p>
                  <p className="text-xl sm:text-2xl font-black text-[#1b4332] py-1 border-b-2 border-[#b08968]/30 inline-block px-8">
                    {selectedCert.studentName}
                  </p>
                  <p>
                    قَدْ اجْتَازَ بِتَوْفِيقِ اللَّهِ تَعَالَى:
                    <br />
                    <strong className="text-stone-900 text-base font-bold">
                      {selectedCert.title}
                    </strong>
                  </p>
                  <p className="text-xs sm:text-sm text-stone-700">
                    بِنِسْبَةِ إِتْقَانٍ بَلَغَتْ: (
                    <strong className="text-emerald-800 font-sans font-bold">
                      {selectedCert.scorePercentage}%
                    </strong>
                    ) وَتَقْدِير:
                    <br />
                    <span className="inline-block mt-1 px-4 py-1 rounded-full bg-[#1b4332]/10 text-[#1b4332] font-black text-sm border border-[#1b4332]/20">
                      {selectedCert.honorsTitle}
                    </span>
                  </p>
                </div>

                {/* Signatures & Verification Code */}
                <div className="pt-6 border-t border-[#b08968]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
                  <div className="text-right">
                    <p className="font-bold text-stone-800">تَارِيخُ الصُّدُور:</p>
                    <p className="font-sans text-stone-600">{selectedCert.issueDate}</p>
                    <p className="font-mono text-[10px] text-stone-400 mt-0.5">
                      كُودُ التَّحَقُّق: {selectedCert.certificateCode}
                    </p>
                  </div>

                  {/* Stamp Graphic */}
                  <div className="w-20 h-20 rounded-full border-2 border-[#1b4332] text-[#1b4332] flex flex-col items-center justify-center rotate-[-12deg] p-1 shadow-sm">
                    <span className="text-[9px] font-black leading-tight text-center">
                      مُعْتَمَدٌ
                      <br />
                      بِدَايَة فَقِيه
                      <br />
                      ✓
                    </span>
                  </div>

                  <div className="text-left font-sans">
                    <p className="font-bold text-stone-800">فَضِيلَةُ المُشْرِفِ وَالمُعَلِّم:</p>
                    <p className="text-stone-700 font-serif font-bold text-sm">
                      {selectedCert.teacherName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer (Hidden when printing) */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 print:hidden font-sans">
                <button
                  onClick={handlePrintCertificate}
                  className="px-6 py-3 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة أو حفظ الشهادة بصيغة PDF</span>
                </button>

                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-6 py-3 rounded-xl bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold text-xs transition-all"
                >
                  إغلاق النافذة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
