import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  Star,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Award,
  Check,
  X,
  Compass,
  Flame,
} from 'lucide-react';
import { QuizAttemptResult, ThemeMode, QuestionType } from '../types';
import { Badge } from '../components/Badge';

interface QuizReviewViewProps {
  result: QuizAttemptResult;
  activeTheme: ThemeMode;
  onRetryQuiz: () => void;
  onNextLesson?: () => void;
  onBackToDashboard: () => void;
  onBackToLesson: () => void;
}

/**
 * Arabic human-readable labels for each supported question type.
 */
const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'multiple-choice': 'اختيار من متعدد',
  'situation': 'موقف فقهي واقعي',
  'true-false': 'صح وخطأ',
  'error-detection': 'اكتشاف الخطأ وتصحيحه',
  'ordering': 'ترتيب الخطوات الشرعية',
  'matching': 'مطابقة فقهية',
};

export const QuizReviewView: React.FC<QuizReviewViewProps> = ({
  result,
  activeTheme,
  onRetryQuiz,
  onNextLesson,
  onBackToDashboard,
  onBackToLesson,
}) => {
  const isMastered = result.isMastered ?? (result.percentage >= 80);
  const isPassed = result.passed; // Initial passing threshold (>= 60%)

  const wrongItems = result.reviewItems.filter((item) => !item.isCorrect);
  const hasErrors = wrongItems.length > 0;

  // Filter mode: default to 'errors-only' if there are mistakes, else 'all'
  const [filterMode, setFilterMode] = useState<'errors-only' | 'all'>(
    hasErrors ? 'errors-only' : 'all'
  );

  const displayedItems =
    filterMode === 'errors-only' && hasErrors ? wrongItems : result.reviewItems;

  const firstAttemptCount =
    result.firstAttemptCount ??
    result.reviewItems.filter((i) => i.isCorrect && i.attemptsUsed === 1).length;

  const totalRetries =
    result.retriesCount ??
    result.reviewItems.reduce((acc, i) => acc + Math.max(0, i.attemptsUsed - 1), 0);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8" dir="rtl">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للوحة الدروس
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {result.lessonTitle}
          </span>
          <Badge
            variant={isMastered ? 'emerald' : isPassed ? 'amber' : 'rose'}
            size="sm"
          >
            {isMastered
              ? 'تم تحقيق حد الإتقان (80%+)'
              : isPassed
              ? 'اجتياز أولي (يلزم 80% للإتقان)'
              : 'لم يتحقق حد الاجتياز (أقل من 60%)'}
          </Badge>
        </div>
      </div>

      {/* 2. Hero Score & Performance Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] p-6 sm:p-10 border shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: activeTheme.cardBg,
          borderColor: activeTheme.border,
        }}
      >
        <div className="text-center max-w-xl mx-auto space-y-4">
          {/* Trophy or Badge Icon */}
          <div
            className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-xl border ${
              isMastered
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : isPassed
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {isMastered ? (
              result.percentage === 100 ? (
                <Trophy className="w-10 h-10 animate-bounce text-amber-400" />
              ) : (
                <Award className="w-10 h-10" />
              )
            ) : isPassed ? (
              <Sparkles className="w-10 h-10 text-amber-400" />
            ) : (
              <XCircle className="w-10 h-10" />
            )}
          </div>

          {isMastered && result.lessonId === 'lesson-9' && (
            <div className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black px-4 py-1.5 rounded-full shadow-inner animate-pulse">
              ختام كتاب الطهارة • تهانينا إتمام جميع لقاءات وتحديات المرحلة بنجاح 🌟
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {result.percentage === 100
              ? 'ما شاء الله! إتقان تام ودرجة كاملة 🌟'
              : isMastered
              ? 'مبارك! حققت حد الإتقان المطلوب للتقدم (80% فأعلى) 🎉'
              : isPassed
              ? 'أحسنت تجاوز المستوى الأولي (60%)، والتقدم يتطلب حد الإتقان (80%) 🌿'
              : 'نتيجة المحاولة: لم يتحقق حد الاجتياز الأولي (أقل من 60%)'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {result.percentage === 100
              ? 'أتقنت جميع مسائل هذا اللقاء بتوفيق الله! راجع الشروح والتأصيل الفقهي أدناه لترسيخ العلم.'
              : isMastered
              ? 'حققت معيار الإتقان الأكاديمي المطلوب للتقدم إلى اللقاء التالي (إذا كان مفتوحاً من المعلم). راجع الشروح الفقهية المعتمدة أدناه لتثبيت المسائل وإتقانها.'
              : isPassed
              ? 'حصلت على نتيجة جيدة وتجاوزت المستوى الأولي، ولكن نظام البداية الفقهية يشترط إتقان 80% فما فوق لفتح اللقاء التالي. راجع أخطاءك وشروحها أدناه، ثم أعد المحاولة للوصول إلى حد الإتقان.'
              : 'الخطأ فرصة للتعلم؛ راجع تصحيح المسائل والشروح الفقهية المعتمدة بالأسفل لتثبيت المفاهيم، ثم أعد المحاولة بنموذج جديد لتحقيق حد الإتقان (80%).'}
          </p>

          {/* Stats Bar (C.9.7: Explicit Educational Score & Competitive Points) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">الدرجة التعليمية (صحة الإجابات)</p>
              <p className="text-lg sm:text-xl font-black text-white">
                {result.correctAnswersCount} / {result.totalQuestions}
              </p>
              <span className="text-[10px] text-slate-400">({result.percentage}%)</span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-amber-300 mb-1 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>نقاط المنافسة (XP)</span>
              </p>
              <p className="text-lg sm:text-xl font-black text-amber-400">
                {result.isFirstAttempt === false
                  ? '0 (محاولة سابقة)'
                  : `+${result.pointsAwarded} نقطة`}
              </p>
              <span className="text-[10px] text-slate-400">جودة الوصول للصواب</span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">إتقان أول محاولة</p>
              <p className="text-lg sm:text-xl font-black text-emerald-400">
                {firstAttemptCount} / {result.totalQuestions}
              </p>
              <span className="text-[10px] text-slate-400">إجابات بدون أخطاء</span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">الإعادات والأخطاء</p>
              <p className="text-lg sm:text-xl font-black text-slate-200">
                {totalRetries}
              </p>
              <span className="text-[10px] text-slate-400">إجمالي المحاولات الزائدة</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Feedback Banner & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>مراجعة الإجابات والتأصيل الفقهي</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {hasErrors
                ? `لديك ${wrongItems.length} ${
                    wrongItems.length === 1
                      ? 'سؤال يحتاج'
                      : wrongItems.length === 2
                      ? 'سؤالان يحتاجان'
                      : 'أسئلة تحتاج'
                  } إلى مراجعة وفهم التصحيح.`
                : 'إجاباتك كلها صحيحة 100%! يمكنك مطالعة الشروح لترسيخ العلم.'}
            </p>
          </div>

          {/* Filter Pills */}
          {hasErrors && (
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold shrink-0">
              <button
                onClick={() => setFilterMode('errors-only')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  filterMode === 'errors-only'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>الأخطاء فقط ({wrongItems.length})</span>
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  filterMode === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>جميع الأسئلة ({result.totalQuestions})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Question Review Cards */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {displayedItems.map((item, index) => {
            const originalIndex = result.reviewItems.findIndex(
              (ri) => ri.question.id === item.question.id
            );

            // Determine points breakdown for this question
            const qPoints = item.pointsAwarded ?? (item.isCorrect ? (item.attemptsUsed === 1 ? 10 : item.attemptsUsed === 2 ? 6 : item.attemptsUsed === 3 ? 3 : 1) : 0);

            return (
              <motion.div
                key={item.question.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`rounded-[2rem] p-6 sm:p-8 border shadow-xl relative overflow-hidden transition-all ${
                  item.isCorrect
                    ? 'bg-slate-900/90 border-slate-800/90'
                    : 'bg-slate-900 border-rose-500/30 ring-1 ring-rose-500/10'
                }`}
              >
                {/* Top Question Header: Meta + Result Badge */}
                <div className="flex flex-wrap justify-between items-center gap-2 mb-4 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                      {originalIndex + 1}
                    </span>
                    <Badge
                      variant={
                        item.question.level === 'للطالب الجيدين'
                          ? 'emerald'
                          : item.question.level === 'للطالب المجتهدين'
                          ? 'blue'
                          : 'amber'
                      }
                      size="sm"
                    >
                      {item.question.level}
                    </Badge>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                      {QUESTION_TYPE_LABELS[item.question.type] || item.question.type}
                    </span>
                  </div>

                  {/* Status Indicator & Attempt Points Badge */}
                  <div className="flex items-center gap-2">
                    {item.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <Check className="w-3.5 h-3.5" />
                        <span>إجابة صحيحة (المحاولة {item.attemptsUsed})</span>
                        <span className="text-[10px] text-amber-300 mr-1 font-black">+{qPoints} نقطة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                        <X className="w-3.5 h-3.5" />
                        <span>لم يُجب / خطأ (0 نقطة)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-base sm:text-lg font-black text-white leading-relaxed mb-6">
                  {item.question.q}
                </h3>

                {/* Answer Comparison Grid */}
                <div className="space-y-3 mb-6">
                  {/* Student's Answer */}
                  <div
                    className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-start justify-between gap-3 ${
                      item.isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-[11px] block font-bold text-slate-400">
                        إجابتك المسجلة:
                      </span>
                      <p className="leading-relaxed">{item.studentAnswerText}</p>
                    </div>
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </div>

                  {/* Correct Answer (shown if student was wrong) */}
                  {!item.isCorrect && (
                    <div className="p-4 rounded-2xl border bg-emerald-950/30 border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-bold flex items-start justify-between gap-3 shadow-inner">
                      <div className="space-y-1">
                        <span className="text-[11px] block font-bold text-emerald-400">
                          الإجابة الصحيحة المعتمدة:
                        </span>
                        <p className="leading-relaxed">
                          {item.question.options[item.question.correct]}
                        </p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    </div>
                  )}
                </div>

                {/* Jurisprudential Explanation */}
                {Boolean(item.question.explanation && item.question.explanation.trim()) && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-200/90 text-xs leading-relaxed space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>لماذا؟ الشرح والتأصيل الفقهي:</span>
                    </div>
                    <p className="pr-5 text-slate-300">{item.question.explanation}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 5. Navigation & Next Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-800/80 justify-center">
        <button
          onClick={onRetryQuiz}
          className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>إعادة التحدي بنموذج جديد</span>
        </button>

        {isMastered && onNextLesson && (
          <button
            onClick={onNextLesson}
            className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span>الانتقال إلى اللقاء التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onBackToLesson}
          className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>مراجعة مادة اللقاء</span>
        </button>

        <button
          onClick={onBackToDashboard}
          className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl font-bold text-xs sm:text-sm border border-slate-800 transition-all flex items-center justify-center"
        >
          <span>لوحة الدروس</span>
        </button>
      </div>
    </div>
  );
};

