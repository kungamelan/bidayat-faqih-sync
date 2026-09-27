import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  KeyRound,
  CheckCircle2,
  XCircle,
  Timer,
  Trophy,
  Star,
  Award,
  ArrowRight,
  Sparkles,
  BookOpen,
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  OfficialExam,
  StudentProfile,
  StudentExamResult,
  ThemeMode,
  Question,
  QuestionReviewItem,
  CertificateItem,
} from '../types';
import * as storageService from '../services/storageService';
import { Badge } from '../components/Badge';
import { calculateQuestionPoints } from '../services/scoringService';

interface ExamsViewProps {
  currentStudent: StudentProfile;
  activeTheme: ThemeMode;
  onBackToDashboard: () => void;
  onNavigateToCertificates: () => void;
  onUpdateStudentPoints: (studentId: string, deltaPoints: number, deltaStars?: number) => void;
}

const QUESTION_TIMER_SECONDS = 30;

export const ExamsView: React.FC<ExamsViewProps> = ({
  currentStudent,
  activeTheme,
  onBackToDashboard,
  onNavigateToCertificates,
  onUpdateStudentPoints,
}) => {
  const [exams, setExams] = useState<OfficialExam[]>(() => storageService.loadOfficialExams());
  const [studentResults, setStudentResults] = useState<StudentExamResult[]>(() =>
    storageService.getExamResultsForStudent(currentStudent.id)
  );

  // Code input search
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  // Active taking exam state
  const [activeExam, setActiveExam] = useState<OfficialExam | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [examTimer, setExamTimer] = useState(QUESTION_TIMER_SECONDS);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [reviewItems, setReviewItems] = useState<QuestionReviewItem[]>([]);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [latestExamResult, setLatestExamResult] = useState<StudentExamResult | null>(null);
  const [awardedCertificate, setAwardedCertificate] = useState<CertificateItem | null>(null);

  // Timer interval for active exam
  useEffect(() => {
    if (!activeExam || isExamCompleted || showFeedback) return;

    const interval = setInterval(() => {
      setExamTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExam, isExamCompleted, showFeedback, currentQIndex]);

  const handleTimeExpired = () => {
    if (!activeExam) return;
    const currentQ = activeExam.questions[currentQIndex];
    if (attemptsOnCurrent === 0) {
      setAttemptsOnCurrent(1);
      setShowFeedback('wrong');
      setFeedbackMsg('انتهى الوقت (30 ثانية)! لديك محاولة ثانية، ركز جيداً ⏱️');
      setTimeout(() => {
        setShowFeedback(null);
        setExamTimer(QUESTION_TIMER_SECONDS);
      }, 1500);
    } else {
      recordAnswerAndNext(null, 'انتهى الوقت (30 ثانية)');
    }
  };

  const handleStartExam = (exam: OfficialExam) => {
    setActiveExam(exam);
    setCurrentQIndex(0);
    setExamTimer(QUESTION_TIMER_SECONDS);
    setAttemptsOnCurrent(0);
    setShowFeedback(null);
    setFeedbackMsg('');
    setCorrectCount(0);
    setPointsEarned(0);
    setReviewItems([]);
    setIsExamCompleted(false);
    setLatestExamResult(null);
    setAwardedCertificate(null);
  };

  const handleSearchByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) {
      setCodeError('يرجى إدخال كود الاختبار');
      return;
    }
    const found = storageService.getExamByCode(codeInput);
    if (!found) {
      setCodeError('كود الاختبار غير صحيح أو غير متاح حالياً');
      return;
    }
    setCodeError('');
    handleStartExam(found);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (!activeExam || showFeedback) return;
    const currentQ = activeExam.questions[currentQIndex];
    const isCorrect = optionIndex === currentQ.correct;

    if (isCorrect) {
      const qPoints = calculateQuestionPoints({
        isCorrect: true,
        attemptsCount: attemptsOnCurrent + 1,
      });
      const newPoints = pointsEarned + qPoints;
      const newCorrect = correctCount + 1;
      setPointsEarned(newPoints);
      setCorrectCount(newCorrect);

      setShowFeedback('correct');
      setFeedbackMsg(
        attemptsOnCurrent === 0
          ? `إجابة ممتازة من المحاولة الأولى! (+${qPoints} نقاط) ✨`
          : `إجابة موفقة! (+${qPoints} نقاط) 🌟`
      );

      const review: QuestionReviewItem = {
        question: currentQ,
        studentAnswerIndex: optionIndex,
        studentAnswerText: currentQ.options[optionIndex],
        isCorrect: true,
        attemptsUsed: attemptsOnCurrent + 1,
        pointsAwarded: qPoints,
        isFirstAttemptCorrect: attemptsOnCurrent === 0,
      };
      const updatedReviews = [...reviewItems, review];
      setReviewItems(updatedReviews);

      setTimeout(() => {
        setShowFeedback(null);
        if (currentQIndex < activeExam.questions.length - 1) {
          setCurrentQIndex((prev) => prev + 1);
          setExamTimer(QUESTION_TIMER_SECONDS);
          setAttemptsOnCurrent(0);
        } else {
          finishOfficialExam(newCorrect, newPoints, updatedReviews);
        }
      }, 1200);
    } else {
      if (attemptsOnCurrent === 0) {
        setAttemptsOnCurrent(1);
        setShowFeedback('wrong');
        setFeedbackMsg('إجابة غير دقيقة! معك محاولة أخيرة، تأمل جيداً 🌿');
        setTimeout(() => {
          setShowFeedback(null);
          setExamTimer(QUESTION_TIMER_SECONDS);
        }, 1400);
      } else {
        recordAnswerAndNext(optionIndex, currentQ.options[optionIndex]);
      }
    }
  };

  const recordAnswerAndNext = (optionIndex: number | null, optionText: string) => {
    if (!activeExam) return;
    const currentQ = activeExam.questions[currentQIndex];
    const review: QuestionReviewItem = {
      question: currentQ,
      studentAnswerIndex: optionIndex,
      studentAnswerText: optionText,
      isCorrect: false,
      attemptsUsed: 2,
    };
    const updatedReviews = [...reviewItems, review];
    setReviewItems(updatedReviews);

    setShowFeedback('wrong');
    setFeedbackMsg(`الإجابة الصحيحة هي: ${currentQ.options[currentQ.correct]}`);

    setTimeout(() => {
      setShowFeedback(null);
      if (currentQIndex < activeExam.questions.length - 1) {
        setCurrentQIndex((prev) => prev + 1);
        setExamTimer(QUESTION_TIMER_SECONDS);
        setAttemptsOnCurrent(0);
      } else {
        finishOfficialExam(correctCount, pointsEarned, updatedReviews);
      }
    }, 1800);
  };

  const finishOfficialExam = (
    finalScore: number,
    finalPoints: number,
    finalReviews: QuestionReviewItem[]
  ) => {
    if (!activeExam) return;
    const totalQ = activeExam.questions.length;
    const percentage = Math.round((finalScore / totalQ) * 100);
    const passed = percentage >= activeExam.passingPercentage;

    const result: StudentExamResult = {
      id: `exam-res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      examId: activeExam.id,
      examCode: activeExam.code,
      examTitle: activeExam.title,
      examType: activeExam.type,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentAvatar: currentStudent.avatar,
      totalQuestions: totalQ,
      correctAnswersCount: finalScore,
      wrongAnswersCount: totalQ - finalScore,
      percentage,
      pointsEarned: finalPoints,
      passed,
      completedAt: new Date().toISOString(),
      reviewItems: finalReviews,
    };

    // Save exam result
    storageService.saveStudentExamResult(result);
    setStudentResults(storageService.getExamResultsForStudent(currentStudent.id));
    setLatestExamResult(result);
    setIsExamCompleted(true);

    // If passed, award points & stars
    if (passed) {
      const extraStars = percentage >= 90 ? 3 : percentage >= 80 ? 2 : 1;
      onUpdateStudentPoints(currentStudent.id, finalPoints, extraStars);

      // Auto-award Certificate if periodic, term, or final exam
      if (activeExam.type === 'periodic' || activeExam.type === 'term' || activeExam.type === 'final') {
        const certType =
          activeExam.type === 'periodic' ? 'periodic' : activeExam.type === 'term' ? 'term' : 'final';
        const newCert: CertificateItem = {
          id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          title: activeExam.title,
          type: certType,
          milestoneDescription: `اجتياز ${activeExam.title} بنجاح واقتدار بنسبة ${percentage}%`,
          issueDate: new Date().toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          teacherName: storageService.loadTeacherProfile().name || 'فضيلة الشيخ / الباحث الأكاديمي',
          scorePercentage: percentage,
          honorsTitle:
            percentage >= 95
              ? 'امتياز مع مرتبة الشرف الأولى'
              : percentage >= 85
              ? 'امتياز مع مرتبة الشرف'
              : 'جيد جداً مرتفع',
          certificateCode: `BF-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        };
        storageService.saveCertificate(newCert);
        setAwardedCertificate(newCert);
      }
    }
  };

  // 1. In-Exam Taking Screen
  if (activeExam && !isExamCompleted) {
    const currentQ = activeExam.questions[currentQIndex];

    return (
      <div className="max-w-2xl mx-auto py-6 px-4" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setActiveExam(null)}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>إلغاء الاختبار والعودة</span>
          </button>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            كود: {activeExam.code}
          </span>
        </div>

        <motion.div
          key={currentQIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl"
        >
          {/* Timer bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-slate-800">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                examTimer <= 7 ? 'bg-rose-500' : examTimer <= 14 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${(examTimer / QUESTION_TIMER_SECONDS) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2 mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="emerald">{activeExam.title}</Badge>
              <span className="text-xs font-bold text-slate-400">
                السؤال {currentQIndex + 1} من {activeExam.questions.length}
              </span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${
                examTimer <= 7
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-emerald-400'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{examTimer} ثانية</span>
            </div>
          </div>

          {/* Question Text */}
          <h3 className="text-lg sm:text-xl font-black text-white mb-6 leading-relaxed">
            {currentQ.q}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQ.options.map((opt, i) => {
              const isCorrectOption = i === currentQ.correct;
              let style = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-emerald-500/50';

              if (showFeedback === 'correct' && isCorrectOption) {
                style = 'bg-emerald-900/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500 font-bold';
              } else if (showFeedback === 'wrong') {
                if (isCorrectOption) {
                  style = 'bg-emerald-950/30 border-emerald-600/50 text-emerald-400/80';
                } else {
                  style = 'bg-slate-950/50 border-slate-800/80 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={i}
                  disabled={!!showFeedback}
                  onClick={() => handleAnswerSelect(i)}
                  className={`w-full text-right p-4 rounded-2xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-between gap-3 shadow-sm ${style}`}
                >
                  <span>{opt}</span>
                  {showFeedback === 'correct' && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {showFeedback === 'wrong' && !isCorrectOption && attemptsOnCurrent === 1 && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback banner */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  showFeedback === 'correct'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {showFeedback === 'correct' ? (
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{feedbackMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // 2. Exam Completed Celebration Screen
  if (activeExam && isExamCompleted && latestExamResult) {
    const passed = latestExamResult.passed;

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-6"
        >
          <div
            className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-xl ${
              passed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {passed ? <Trophy className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {passed ? 'مبارك الاجتياز والتميز! 🌟' : 'محاولة طيبة، استعن بالله وأعد المحاولة 🌷'}
          </h2>

          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {passed
              ? `أحسنت يا ${currentStudent.name}! لقد اجتزت ${activeExam.title} بنجاح واقتدار.`
              : `حصلت على نسبة ${latestExamResult.percentage}%، وحد الاجتياز هو ${activeExam.passingPercentage}%. راجع ما فاتك وأعد المحاولة لتنال الشهادة.`}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400">الدرجة</div>
              <div className="text-xl font-black text-emerald-400">{latestExamResult.percentage}%</div>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400">النقاط</div>
              <div className="text-xl font-black text-amber-400">+{latestExamResult.pointsEarned}</div>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400">الصحيحة</div>
              <div className="text-xl font-black text-white">
                {latestExamResult.correctAnswersCount}/{latestExamResult.totalQuestions}
              </div>
            </div>
          </div>

          {/* Awarded Certificate Alert */}
          {awardedCertificate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-slate-950 border border-amber-500/40 text-right flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-300">صدرت لك شهادة تميز رسمية!</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {awardedCertificate.title} • {awardedCertificate.honorsTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={onNavigateToCertificates}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                عرض الشهادة
              </button>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => handleStartExam(activeExam)}
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة الاختبار</span>
            </button>
            <button
              onClick={() => setActiveExam(null)}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              العودة لقائمة الاختبارات
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Main Official Exams Index Screen
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
            <FileText className="w-7 h-7 text-emerald-400" />
            <span>الاختبارات</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            أدخل كود الاختبار المعتمد من المعلم للدخول المباشر، أو اختر من الاختبارات الرسمية المتاحة.
          </p>
        </div>

        <button
          onClick={onNavigateToCertificates}
          className="px-4 py-2.5 rounded-2xl bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-center"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>عرض شهاداتي المكتسبة</span>
        </button>
      </div>

      {/* Code Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl"
      >
        <form onSubmit={handleSearchByCode} className="space-y-3">
          <label className="block text-xs font-black text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>أدخل كود الاختبار:</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="مثال: WEEK-01 أو DAWRI-01 أو TERM-01 أو FINAL-2026"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 font-mono tracking-wider focus:border-emerald-500 outline-none"
            />
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition-all whitespace-nowrap flex items-center justify-center gap-2"
            >
              <span>دخول الاختبار</span>
            </button>
          </div>

          {codeError && <p className="text-xs font-bold text-rose-400 mt-1">{codeError}</p>}
        </form>
      </motion.div>

      {/* Official Exams Catalog */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>الاختبارات الرسمية المتاحة في المنهاج:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => {
            const pastResult = studentResults.find((r) => r.examId === exam.id);
            const isPassed = pastResult?.passed;

            return (
              <div
                key={exam.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                        كود: {exam.code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {exam.type === 'weekly'
                          ? 'أسبوعي'
                          : exam.type === 'periodic'
                          ? 'دوري'
                          : exam.type === 'term'
                          ? 'فصلي'
                          : 'نهائي'}
                      </span>
                    </div>
                    {isPassed ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>تم الاجتياز ({pastResult.percentage}%)</span>
                      </span>
                    ) : pastResult ? (
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        محاولة سابقة ({pastResult.percentage}%)
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400">متاح الآن</span>
                    )}
                  </div>

                  <h4 className="text-base font-black text-white">{exam.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{exam.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    <span className="font-bold text-white">{exam.questions.length}</span> سؤالاً • حد
                    الاجتياز{' '}
                    <span className="font-bold text-emerald-400">{exam.passingPercentage}%</span>
                  </div>

                  <button
                    onClick={() => handleStartExam(exam)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    {isPassed ? 'إعادة للاستذكار' : 'بدء الاختبار'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
