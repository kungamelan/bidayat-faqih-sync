import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Timer,
  CheckCircle2,
  XCircle,
  Trophy,
  Star,
  RotateCcw,
  BookOpen,
  Sparkles,
  Info,
  Award,
  HeartHandshake,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { Lesson, Question, ThemeMode, QuestionReviewItem, QuizAttemptResult } from '../types';
import { Badge } from './Badge';
import { calculateQuestionPoints, evaluateQuizSummary, SCORING_CONFIG } from '../services/scoringService';

interface QuizEngineProps {
  lesson: Lesson;
  questions: Question[];
  activeTheme: ThemeMode;
  onFinishQuiz: (result: QuizAttemptResult) => void;
  onBackToLesson: () => void;
  onBackToDashboard: () => void;
  onRetryQuiz?: () => void;
}

interface ShuffledOption {
  text: string;
  originalIndex: number;
}

const QUESTION_TIME_SECONDS = 30; // 30 seconds timer

export const QuizEngine: React.FC<QuizEngineProps> = ({
  lesson,
  questions,
  activeTheme,
  onFinishQuiz,
  onBackToLesson,
  onBackToDashboard,
  onRetryQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(QUESTION_TIME_SECONDS);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);
  const [timeoutsOnCurrent, setTimeoutsOnCurrent] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [totalEarnedPoints, setTotalEarnedPoints] = useState(0);
  const [firstAttemptMasteryCount, setFirstAttemptMasteryCount] = useState(0);
  const [totalRetriesCount, setTotalRetriesCount] = useState(0);
  const [quizState, setQuizState] = useState<'in-progress' | 'completed' | 'final-celebration'>('in-progress');
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[]>([]);
  const [reviewItems, setReviewItems] = useState<QuestionReviewItem[]>([]);

  // Requirement 9: Warm Pedagogical State for Assistance
  const [secondAttemptPrompt, setSecondAttemptPrompt] = useState<{
    correctAnswerText: string;
    explanation?: string;
    pendingReviews: QuestionReviewItem[];
  } | null>(null);

  const currentQ = questions[currentIndex];

  // Shuffle options whenever question changes
  useEffect(() => {
    if (!currentQ) return;
    const opts: ShuffledOption[] = currentQ.options.map((text, originalIndex) => ({
      text,
      originalIndex,
    }));
    const randomized = [...opts].sort(() => Math.random() - 0.5);
    setShuffledOptions(randomized);
    setTimer(QUESTION_TIME_SECONDS);
    setAttemptsOnCurrent(0);
    setTimeoutsOnCurrent(0);
    setShowFeedback(null);
    setFeedbackText('');
    setSecondAttemptPrompt(null);
  }, [currentIndex, currentQ]);

  // Timer countdown: 30 seconds
  useEffect(() => {
    if (quizState !== 'in-progress' || showFeedback || secondAttemptPrompt) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizState, showFeedback, secondAttemptPrompt, currentIndex]);

  const handleTimeExpired = () => {
    if (showFeedback || secondAttemptPrompt) return;

    const nextTimeouts = timeoutsOnCurrent + 1;
    setTimeoutsOnCurrent(nextTimeouts);
    const nextAttempts = attemptsOnCurrent + 1;
    setAttemptsOnCurrent(nextAttempts);

    if (nextAttempts === 1) {
      setShowFeedback('wrong');
      setFeedbackText('انتهت الـ 30 ثانية الأولى! لديك محاولة ثانية، استعن بالله وركز ⏱️');
      setTimeout(() => {
        setShowFeedback(null);
        setTimer(QUESTION_TIME_SECONDS);
      }, 1500);
    } else {
      // 2 or more timeouts (Wrong -> Wrong): safely show pedagogical guidance
      handleQuestionAssistance(null, 'انتهى الوقت (30 ثانية)', nextAttempts, nextTimeouts);
    }
  };

  const handleQuestionAssistance = (
    selectedIdx: number | null,
    selectedText: string,
    totalAttempts: number,
    totalTimeouts: number
  ) => {
    const reviewItem: QuestionReviewItem = {
      question: currentQ,
      studentAnswerIndex: selectedIdx,
      studentAnswerText: selectedText,
      isCorrect: false,
      attemptsUsed: totalAttempts,
      timeoutsCount: totalTimeouts,
      pointsAwarded: 0,
      isFirstAttemptCorrect: false,
    };
    const updatedReviews = [...reviewItems, reviewItem];
    setReviewItems(updatedReviews);

    // Show pedagogical warm prompt (Requirement 9)
    // NEVER logout, NEVER close page, NEVER break student session!
    setSecondAttemptPrompt({
      correctAnswerText: currentQ.options[currentQ.correct],
      explanation: currentQ.explanation,
      pendingReviews: updatedReviews,
    });
  };

  const handleAnswerClick = (originalIndex: number) => {
    if (showFeedback || quizState !== 'in-progress' || secondAttemptPrompt) return;

    const currentAttemptNumber = attemptsOnCurrent + 1;
    const isFirstAttempt = currentAttemptNumber === 1;

    if (originalIndex === currentQ.correct) {
      // C.9.7: Calculate Progressive Competitive Points
      const pointsAwardedForThisQ = calculateQuestionPoints({
        isCorrect: true,
        attemptsCount: currentAttemptNumber,
        timeoutsCount: timeoutsOnCurrent,
      });

      const newTotalPoints = totalEarnedPoints + pointsAwardedForThisQ;
      setTotalEarnedPoints(newTotalPoints);

      const newScore = correctAnswersCount + 1;
      setCorrectAnswersCount(newScore);

      if (isFirstAttempt) {
        setFirstAttemptMasteryCount((prev) => prev + 1);
      } else {
        setTotalRetriesCount((prev) => prev + attemptsOnCurrent);
      }

      setShowFeedback('correct');
      if (currentAttemptNumber === 1) {
        setFeedbackText(`أحسنت من المحاولة الأولى! (+${pointsAwardedForThisQ} نقاط منافسة) 🌟`);
      } else if (currentAttemptNumber === 2) {
        setFeedbackText(`أحسنت إجابة موفقة! (+${pointsAwardedForThisQ} نقاط منافسة) ✨`);
      } else if (currentAttemptNumber === 3) {
        setFeedbackText(`أحسنت بعد التدبر والمحاولة! (+${pointsAwardedForThisQ} نقاط منافسة) 🌿`);
      } else {
        setFeedbackText(`أحسنت الوصول للصواب! (+${pointsAwardedForThisQ} نقطة منافسة) 💡`);
      }

      const reviewItem: QuestionReviewItem = {
        question: currentQ,
        studentAnswerIndex: originalIndex,
        studentAnswerText: currentQ.options[originalIndex],
        isCorrect: true,
        attemptsUsed: currentAttemptNumber,
        timeoutsCount: timeoutsOnCurrent,
        pointsAwarded: pointsAwardedForThisQ,
        isFirstAttemptCorrect: isFirstAttempt,
      };
      const updatedReviews = [...reviewItems, reviewItem];
      setReviewItems(updatedReviews);

      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          evaluateFinalScore(newScore, newTotalPoints, updatedReviews);
        }
      }, 1300);
    } else {
      // Wrong answer
      const nextAttempts = attemptsOnCurrent + 1;
      setAttemptsOnCurrent(nextAttempts);

      if (nextAttempts === 1) {
        setShowFeedback('wrong');
        setFeedbackText('محاولة أولى غير موفقة! ركز جيداً، لديك 30 ثانية وفرصة ثانية ✨');
        setTimeout(() => {
          setShowFeedback(null);
          setTimer(QUESTION_TIME_SECONDS);
        }, 1500);
      } else {
        // nextAttempts >= 2 (Wrong -> Wrong): safely show pedagogical guidance
        handleQuestionAssistance(originalIndex, currentQ.options[originalIndex], nextAttempts, timeoutsOnCurrent);
      }
    }
  };

  const handleRetryCurrentQuestion = () => {
    // Allows student to try again from assistance modal (attempt 4+)
    setReviewItems((prev) => prev.slice(0, currentIndex));
    setSecondAttemptPrompt(null);
    setShowFeedback(null);
    setTimer(QUESTION_TIME_SECONDS);
  };

  const handleContinueAfterFailure = () => {
    if (!secondAttemptPrompt) return;
    const finalReviews = secondAttemptPrompt.pendingReviews;
    setSecondAttemptPrompt(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      evaluateFinalScore(correctAnswersCount, totalEarnedPoints, finalReviews);
    }
  };

  const evaluateFinalScore = (
    finalScore: number,
    finalPoints: number,
    finalReviews: QuestionReviewItem[]
  ) => {
    const summary = evaluateQuizSummary(
      questions.length,
      finalReviews.map((r) => ({
        isCorrect: r.isCorrect,
        attemptsCount: r.attemptsUsed,
        timeoutsCount: r.timeoutsCount || 0,
      }))
    );

    const result: QuizAttemptResult = {
      id: `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      totalQuestions: questions.length,
      correctAnswersCount: summary.score,
      percentage: summary.percentage,
      passed: summary.passed,
      isMastered: summary.isMastered,
      stars: summary.stars,
      pointsAwarded: summary.competitivePoints,
      reviewItems: finalReviews,
      completedAt: new Date().toISOString(),

      score: summary.score,
      competitivePoints: summary.competitivePoints,
      firstAttemptCount: summary.firstAttemptCorrectCount,
      retriesCount: summary.totalRetriesCount,
      timeoutsCount: summary.totalTimeoutsCount,
    };

    onFinishQuiz(result);

    if (summary.passed && lesson.id === 'lesson-9') {
      setQuizState('final-celebration');
    } else {
      setQuizState('completed');
    }
  };

  // 1. Final Celebration Screen (Lesson 9 Completion)
  if (quizState === 'final-celebration') {
    const totalQCount = questions.length || 1;
    const finalPct = Math.round((correctAnswersCount / totalQCount) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto text-center py-12 px-6 rounded-[2.5rem] bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl"
        dir="rtl"
      >
        <div className="w-24 h-24 rounded-full bg-amber-500/20 text-amber-400 border-2 border-amber-500/40 flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Trophy className="w-12 h-12 animate-bounce" />
        </div>
        <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-3 inline-block">
          ختام كتاب الطهارة
        </span>
        <h2 className="text-3xl font-black text-white mb-3">
          تهانينا! لقد أنهيت جميع مراحل وتحديات الرحلة 🌟
        </h2>
        <p className="text-amber-200/90 text-sm font-bold mb-4">
          أحسنت إتمام المرحلة الأولى من رحلتك المباركة في الفقه الإسلامي.
        </p>
        <p className="text-slate-300 text-xs leading-relaxed mb-8 max-w-md mx-auto">
          لقد اجتزت جميع مراحل وتحديات "بداية فقيه" بنجاح واقتدار. يمكنك الآن خوض الاختبارات الرسمية والتقدم لنيل شهادات الإتقان المعتمدة.
        </p>

        {/* C.9.7: Explicit Educational Score vs Competitive Points */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-amber-500/20 mb-8 max-w-sm mx-auto space-y-3 text-right">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
            <span className="text-slate-300 font-bold">الدرجة التعليمية (صحة الإجابات):</span>
            <span className="text-white font-black text-base">
              {correctAnswersCount} / {questions.length} ({finalPct}%)
            </span>
          </div>

          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
            <span className="text-amber-300 font-bold">نقاط المنافسة (XP):</span>
            <span className="text-amber-400 font-black text-base">+{totalEarnedPoints} نقطة</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">إجابات من أول محاولة:</span>
            <span className="text-emerald-400 font-bold">{firstAttemptMasteryCount} / {questions.length}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">الإعادات والأخطاء:</span>
            <span className="text-slate-300 font-bold">{totalRetriesCount}</span>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl font-black text-base shadow-xl transition-transform hover:scale-105"
        >
          العودة إلى لوحة الإنجازات
        </button>
      </motion.div>
    );
  }

  // 2. Standard Quiz Completed Screen
  if (quizState === 'completed') {
    const totalCount = questions.length || 1;
    const finalPercentage = Math.round((correctAnswersCount / totalCount) * 100);
    const passed = finalPercentage >= SCORING_CONFIG.PASSING_PERCENTAGE;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto text-center py-10 px-6 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl"
        dir="rtl"
      >
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ${
            passed
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {passed ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
          {passed ? 'مبارك! اجتزت التحدي بنجاح 🎉' : 'نتيجة التحدي: لم تحقق حد الاجتياز'}
        </h2>

        <p className="text-slate-300 text-xs sm:text-sm mb-6">
          {passed
            ? 'لقد أنهيت تحدي هذا اللقاء بتفوق. انتظر فتح اللقاء التالي من معلمك أو خض الاختبارات بالكود.'
            : 'الحد الأدنى للاجتياز هو 60%، وحد الإتقان 80%. يمكنك إعادة المحاولة لتثبيت معلوماتك.'}
        </p>

        {/* C.9.7: Score & Competitive Points Detailed Breakdown */}
        <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl mb-8 max-w-sm mx-auto space-y-3.5 text-right">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
            <span className="text-xs text-slate-300 font-bold">الدرجة التعليمية (صحة الإجابات):</span>
            <span className="text-base font-black text-white">
              {correctAnswersCount} / {questions.length} ({finalPercentage}%)
            </span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>نقاط المنافسة (XP):</span>
            </span>
            <span className="text-base font-black text-amber-400">
              +{totalEarnedPoints} نقطة
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">إجابات من أول محاولة:</span>
            <span className="text-emerald-400 font-bold">
              {firstAttemptMasteryCount} / {questions.length}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">الإعادات والأخطاء:</span>
            <span className="text-slate-200 font-bold">
              {totalRetriesCount}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2.5 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-bold">النجوم المكتسبة:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= (finalPercentage >= 100 ? 5 : finalPercentage >= 90 ? 4 : finalPercentage >= 80 ? 3 : finalPercentage >= 70 ? 2 : finalPercentage >= 60 ? 1 : 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              if (onRetryQuiz) {
                onRetryQuiz();
              } else {
                setCurrentIndex(0);
                setCorrectAnswersCount(0);
                setTotalEarnedPoints(0);
                setFirstAttemptMasteryCount(0);
                setTotalRetriesCount(0);
                setQuizState('in-progress');
              }
            }}
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة التحدي لتحسين النتيجة
          </button>
          <button
            onClick={onBackToDashboard}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all"
          >
            العودة لقائمة اللقاءات
          </button>
        </div>
      </motion.div>
    );
  }

  // 3. Active Question View with 30s Timer & Options
  return (
    <div className="max-w-2xl mx-auto relative" dir="rtl">
      {/* Quiz Card */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl"
      >
        {/* 30-Second Timer Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-800">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              timer <= 7
                ? 'bg-rose-500'
                : timer <= 14
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${(timer / QUESTION_TIME_SECONDS) * 100}%` }}
          />
        </div>

        {/* Top Meta: Level Badge + Question Index + 30s Timer */}
        <div className="flex justify-between items-center mt-2 mb-6">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                currentQ.level === 'للطالب الجيدين'
                  ? 'emerald'
                  : currentQ.level === 'للطالب المجتهدين'
                  ? 'blue'
                  : 'amber'
              }
            >
              {currentQ.level}
            </Badge>
            <span className="text-xs font-bold text-slate-400">
              السؤال {currentIndex + 1} من {questions.length}
            </span>
          </div>

          {/* Timer Display */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${
              timer <= 7
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-emerald-400'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{timer} ثانية</span>
          </div>
        </div>

        {/* Question Text */}
        <h3 className="text-lg sm:text-xl font-black text-white mb-6 leading-relaxed">
          {currentQ.q}
        </h3>

        {/* Options Grid */}
        <div className="space-y-3 mb-6">
          {shuffledOptions.map((opt, i) => {
            const isCorrectOption = opt.originalIndex === currentQ.correct;
            let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-emerald-500/50';

            if (showFeedback === 'correct' && isCorrectOption) {
              btnStyle = 'bg-emerald-900/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500 font-bold';
            } else if (showFeedback === 'wrong') {
              if (isCorrectOption) {
                btnStyle = 'bg-emerald-950/30 border-emerald-600/50 text-emerald-400/80';
              } else {
                btnStyle = 'bg-slate-950/50 border-slate-800/80 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={i}
                disabled={!!showFeedback || !!secondAttemptPrompt}
                onClick={() => handleAnswerClick(opt.originalIndex)}
                className={`w-full text-right p-4 rounded-2xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-between gap-3 shadow-sm ${btnStyle}`}
              >
                <span>{opt.text}</span>
                {showFeedback === 'correct' && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback Notice */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold leading-relaxed flex items-center gap-2.5 ${
                showFeedback === 'correct'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              {showFeedback === 'correct' ? (
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Info className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <span>{feedbackText}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info: Progressive Points Guide (C.9.7) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-300">
              {attemptsOnCurrent === 0
                ? 'المحاولة الأولى (10 نقاط)'
                : attemptsOnCurrent === 1
                ? 'المحاولة الثانية (6 نقاط)'
                : attemptsOnCurrent === 2
                ? 'المحاولة الثالثة (3 نقاط)'
                : 'محاولة متقدمة (نقطة واحدة)'}
            </span>
            <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              نقاط تنافسية متدرجة: 10 للأولى • 6 للثانية • 3 للثالثة • 1 للإعادة
            </span>
          </div>
          <button
            onClick={onBackToLesson}
            className="hover:text-slate-200 hover:underline text-[11px] shrink-0"
          >
            العودة للدرس
          </button>
        </div>
      </motion.div>

      {/* Requirement 9: Warm Pedagogical Dialog on Question Assistance */}
      <AnimatePresence>
        {secondAttemptPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center shadow-inner">
                <HeartHandshake className="w-8 h-8" />
              </div>

              {/* Exact warm message required by prompt */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-white leading-relaxed">
                  استعن بالله، وراجع الدرس مرة أخرى، ثم عُد إلينا.
                  <br />
                  <span className="text-emerald-400">نحن في انتظارك 🌷</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                  لا بأس، فطلب العلم الفقهي يحتاج إلى التكرار والتدبر. جلستك محفوظة ولن تخرج من المنصة.
                </p>
              </div>

              {/* Correction Display */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400">الإجابة الفقهية الصحيحة:</div>
                <div className="text-xs sm:text-sm font-bold text-emerald-300">
                  {secondAttemptPrompt.correctAnswerText}
                </div>
                {secondAttemptPrompt.explanation && (
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    {secondAttemptPrompt.explanation}
                  </p>
                )}
              </div>

              {/* Non-punitive Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2 flex-wrap">
                <button
                  onClick={handleRetryCurrentQuestion}
                  className="px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة محاولة السؤال الآن</span>
                </button>

                <button
                  onClick={onBackToLesson}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>مراجعة الدرس</span>
                </button>

                <button
                  onClick={onBackToDashboard}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>العودة لاحقًا</span>
                </button>

                <button
                  onClick={handleContinueAfterFailure}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/20 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>متابعة السؤال التالي</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

